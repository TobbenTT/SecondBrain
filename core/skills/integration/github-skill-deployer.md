# GitHub Skill Deployer

## Skill ID: D-005
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: High

## Purpose

Deploy skill definition files (like this one) from a GitHub repository to Windsurf agent workspaces, ensuring that all agents in the OR system have access to the latest approved skill definitions. This skill manages the lifecycle of skill files from development in GitHub through review, approval, and deployment to the runtime environment where agents consume them.

## Intent & Specification

**Problem:** Skill files are developed and refined in a GitHub repository but must be deployed to Windsurf agent workspaces to be usable. Manual copying of files leads to version mismatches, forgotten updates, and agents operating with outdated skill definitions. There is no automated pipeline to ensure skill files in production match the approved versions in Git.

**Success Criteria:**
- All approved skill files in GitHub are deployed to the correct Windsurf workspace(s)
- Deployment is triggered automatically on merge to main branch
- Agents always have the latest approved version of each skill
- Rollback to a previous skill version is possible within 2 minutes
- Deployment history is tracked and auditable
- Skill dependencies are validated before deployment

**Constraints:**
- Must use GitHub as the single source of truth for skill definitions
- Must validate skill file format before deployment
- Must handle skill interdependencies (deploy dependent skills together)
- Must support staged rollout (deploy to staging workspace first)
- Must preserve local workspace customizations (if any)
- Must work with Windsurf's file structure and conventions

## Trigger / Invocation

**Automatic Triggers:**
- PR merged to `main` branch modifying files in `skills/` directory
- Release tag created matching `skills-v*` pattern
- Scheduled sync check (every 6 hours)

**Manual Triggers:**
- `github-skill-deployer deploy --skill [name] --workspace [target]`
- `github-skill-deployer deploy --all --workspace [target]`
- `github-skill-deployer validate --skill [name]`
- `github-skill-deployer rollback --skill [name] --version [tag]`
- `github-skill-deployer status` (show sync state of all skills)
- `github-skill-deployer diff --skill [name]` (compare Git vs deployed)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| GitHub Repository URL | Configuration | Yes | Repository containing skill files |
| GitHub Token | Secrets Manager | Yes | PAT with repo access |
| Skill Name | Command argument | Conditional | Specific skill to deploy (or --all) |
| Target Workspace | Command argument | Conditional | Windsurf workspace target |
| Branch/Tag | Command argument | No | Source branch or tag (default: main) |
| Deployment Config | Repository | Yes | Workspace mapping and deployment rules |

**Deployment Configuration (`deploy/skills-config.yaml`):**
```yaml
deployment:
  source:
    repository: "vsc-team/or-system-skills"
    branch: "main"
    skills_directory: "skills/"

  workspaces:
    staging:
      path: "/workspaces/or-system-staging/skills/"
      auto_deploy: true
      requires_approval: false

    production:
      path: "/workspaces/or-system/skills/"
      auto_deploy: false
      requires_approval: true
      approvers: ["or-lead", "product-owner"]

  validation:
    required_sections:
      - "Skill ID"
      - "Version"
      - "Category"
      - "Purpose"
      - "Step-by-Step Execution"
      - "Quality Criteria"
    max_file_size_kb: 100
    naming_convention: "kebab-case"

  rollback:
    versions_retained: 5
    backup_directory: ".skill-backups/"
```

## Output Specification

**Primary Outputs:**
1. **Deployed Skill Files:** Updated `.md` files in target workspace
2. **Deployment Manifest:** Record of what was deployed
3. **Validation Report:** Pre-deployment check results
4. **Sync Status Report:** Current state of all skills across environments

**Deployment Manifest:**
```json
{
  "deployment_id": "dep-20250415-001",
  "timestamp": "2025-04-15T10:00:00Z",
  "source": {
    "repository": "vsc-team/or-system-skills",
    "branch": "main",
    "commit": "abc123def456"
  },
  "workspace": "production",
  "skills_deployed": [
    {
      "name": "agent-operations",
      "version": "1.2.0",
      "previous_version": "1.1.0",
      "action": "updated",
      "checksum": "sha256:..."
    },
    {
      "name": "agent-maintenance",
      "version": "1.0.0",
      "previous_version": null,
      "action": "created",
      "checksum": "sha256:..."
    }
  ],
  "skills_unchanged": ["agent-hse", "agent-hr", "orchestrate-or-agents"],
  "validation": "passed",
  "deployed_by": "github-actions",
  "status": "success"
}
```

**Sync Status Report:**
```
=== Skill Deployment Status ===

Skill                    | Git Version | Staging  | Production | Status
-------------------------|-------------|----------|------------|--------
sync-airtable-jira       | 1.0.0       | 1.0.0    | 1.0.0      | Synced
github-prompt-manager     | 1.1.0       | 1.1.0    | 1.0.0      | Staging ahead
notebooklm-context-builder| 1.0.0      | 1.0.0    | 1.0.0      | Synced
agent-operations          | 1.2.0       | 1.2.0    | 1.2.0      | Synced
agent-maintenance         | 1.0.0       | 1.0.0    | --         | Not in prod
orchestrate-or-agents     | 2.0.0       | 2.0.0    | 1.9.0      | Staging ahead

Summary: 18/26 synced, 5 staging-ahead, 3 not-in-prod
```

## Methodology & Standards

- **Single Source of Truth:** GitHub repository is the canonical source. No direct edits to deployed skill files.
- **Immutable Deployments:** Each deployment creates a backup of the current state before overwriting. Previous versions retained per rollback policy.
- **Checksum Verification:** File integrity verified using SHA-256 checksums after deployment.
- **Dependency Graph:** Skills with declared dependencies are deployed together to avoid partial updates.
- **Staged Deployment:** Changes deploy to staging first. Production deployment requires explicit approval or scheduled promotion.
- **Format Validation:** All skill files validated against required structure before deployment.
- **Naming Convention:** Skill files use kebab-case naming (e.g., `agent-operations.md`).

## Step-by-Step Execution

### Step 1: Detect Changes
1. Compare current Git HEAD with last deployed commit
2. Identify modified, added, or deleted files in `skills/` directory
3. Parse skill metadata from changed files (version, dependencies)
4. Determine scope of deployment (single skill, batch, full)

### Step 2: Validate Skill Files
1. For each changed skill file:
   a. Verify file naming convention (kebab-case, `.md` extension)
   b. Check file size within limits
   c. Parse Markdown structure and verify required sections present
   d. Validate version string follows semver
   e. Check for broken internal references
   f. Validate category and priority values
2. Generate validation report
3. If validation fails: stop deployment, report errors

### Step 3: Resolve Dependencies
1. Build dependency graph from skill `Inter-Agent Dependencies` sections
2. For each changed skill:
   a. Identify downstream dependents
   b. Check if dependent skills need simultaneous update
   c. Warn if changing skill interface that dependents rely on
3. Determine deployment order (dependencies first)

### Step 4: Backup Current State
1. Create timestamped backup of currently deployed skill files
2. Store in `.skill-backups/` directory
3. Maintain last N backups per rollback policy
4. Clean up oldest backups beyond retention limit

### Step 5: Deploy to Target Workspace
1. For staging (auto-deploy):
   a. Copy skill files from Git to staging workspace path
   b. Verify file integrity via checksum
   c. Update deployment manifest
2. For production (requires approval):
   a. Create deployment request with change summary
   b. Wait for approval from designated approvers
   c. On approval: copy files, verify checksums, update manifest
   d. On rejection: log rejection, notify developer

### Step 6: Post-Deployment Verification
1. Read back deployed files and compare checksums with source
2. Verify all files are accessible in the workspace
3. Check that no workspace files were corrupted during deployment
4. Run smoke test: parse each deployed skill file for valid structure
5. Update sync status registry

### Step 7: Notify and Log
1. Send deployment notification to relevant stakeholders
2. Update deployment history log
3. If deploying agent-related skills: notify `orchestrate-or-agents`
4. Update dashboard with new sync status
5. Log complete deployment manifest

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Sync Accuracy | Deployed files match Git source | 100% |
| Deployment Success | Successful deploys / total attempts | > 99% |
| Validation Coverage | Skills passing format validation | 100% |
| Rollback Speed | Time from decision to rollback complete | < 2 minutes |
| Backup Integrity | Backups verified via checksum | 100% |
| Dependency Compliance | Dependencies deployed together | 100% |
| Deployment Latency | Time from merge to staging deployment | < 5 minutes |
| Audit Trail | Deployments with complete manifest | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `github-prompt-manager` | Sibling | Handles prompt deployment (complementary to skill deployment) |
| `orchestrate-or-agents` | Consumer | Notified when agent skills are updated |
| `agent-doc-control` | Consumer | Tracks skill versions as controlled documents |
| `agent-or-pmo` | Consumer | PMO monitors skill deployment for governance |
| All `agent-*` skills | Managed | All agent skill files are deployed by this skill |

## Templates & References

**Skill File Naming Convention:**
```
{category-prefix}-{descriptive-name}.md

Category Prefixes:
  D: Integration & Workflow (no prefix, use descriptive name)
  E: Multi-Agent OR (prefix: agent- or orchestrate-)
  F: New Skills (no prefix, use descriptive name)

Examples:
  sync-airtable-jira.md
  agent-operations.md
  orchestrate-or-agents.md
  define-intent-specification.md
```

**Deployment Request Template:**
```
Deployment Request: {deployment_id}
Date: {timestamp}
Requester: {git_author}
Commit: {commit_sha}

Skills to Deploy:
  - {skill_name} v{version} ({action}: created|updated|deleted)

Change Summary:
  {commit_message}

Dependencies Affected:
  {list of dependent skills}

Approval Required: {approver_1}, {approver_2}
```

## Examples

**Example 1: Auto-deploy to Staging on Merge**
```
Trigger: PR #42 merged to main (modified agent-operations.md, added agent-procurement.md)

Process:
  1. Detect changes: 1 modified, 1 added file
  2. Validate:
     - agent-operations.md v1.2.0: PASS (all sections present, valid semver)
     - agent-procurement.md v1.0.0: PASS
  3. Dependencies: agent-procurement depends on orchestrate-or-agents (already deployed)
  4. Backup current staging skills
  5. Deploy to staging workspace
  6. Verify checksums: both files match
  7. Notify: "2 skills deployed to staging from PR #42"

Output: Deployment manifest logged, staging workspace updated
```

**Example 2: Production Deployment with Approval**
```
Command: github-skill-deployer deploy --all --workspace production

Process:
  1. Compare staging vs production: 5 skills ahead in staging
  2. Generate deployment request for 5 skills
  3. Send approval request to or-lead and product-owner
  4. [Approval received from both]
  5. Backup current production skills
  6. Deploy 5 updated skills to production
  7. Verify all checksums
  8. Update sync status: all 26 skills synced

Output: "5 skills promoted to production. All 26 skills now synced across environments."
```

**Example 3: Rollback After Issue Detected**
```
Command: github-skill-deployer rollback --skill orchestrate-or-agents --version skills-v1.9.0

Process:
  1. Current deployed version: v2.0.0
  2. Locate backup of v1.9.0 in .skill-backups/
  3. Validate backup file integrity
  4. Replace deployed file with backup version
  5. Verify checksum
  6. Log rollback: { from: "v2.0.0", to: "v1.9.0", reason: "manual" }
  7. Notify orchestrate-or-agents to reload configuration

Output: "orchestrate-or-agents rolled back from v2.0.0 to v1.9.0. Investigate v2.0.0 regression."
```
