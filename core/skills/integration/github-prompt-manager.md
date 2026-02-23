# GitHub Prompt Manager

## Skill ID: D-002
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: High

## Purpose

Version-control, review, and deploy AI prompts and system instructions from a GitHub repository to production environments (Windsurf agents, Claude projects, API endpoints). This skill treats prompts as first-class software artifacts with proper versioning, change tracking, peer review, and deployment pipelines. It eliminates prompt drift, ensures reproducibility, and enables rollback when prompt changes degrade performance.

## Intent & Specification

**Problem:** AI prompts and system instructions are often edited directly in production interfaces (Claude Projects, agent configurations) without version control. This leads to prompt drift, inability to track what changed and when, no peer review of prompt modifications, and no rollback capability when prompts degrade agent performance.

**Success Criteria:**
- All production prompts have a single source of truth in GitHub
- Every prompt change goes through a PR with review before deployment
- Prompts can be deployed to multiple targets from a single repository
- Any prompt version can be rolled back within 2 minutes
- Prompt performance metrics are tracked per version
- Clear separation between prompt templates and environment-specific variables

**Constraints:**
- Must use GitHub as the canonical source (not alternatives)
- Must support Markdown and YAML prompt formats
- Must handle prompt variables/templating (e.g., `{{project_name}}`)
- Must not expose secrets or API keys in prompts
- Must maintain backward compatibility tracking
- Deployment targets: Windsurf, Claude Projects, custom API endpoints

## Trigger / Invocation

**Automatic Triggers:**
- PR merged to `main` branch in the prompts repository
- Tag created matching pattern `v*` (e.g., `v1.2.0`)
- Scheduled validation check (weekly)

**Manual Triggers:**
- `github-prompt-manager deploy --prompt [name] --target [environment]`
- `github-prompt-manager validate --all`
- `github-prompt-manager rollback --prompt [name] --version [tag]`
- `github-prompt-manager diff --prompt [name] --from [v1] --to [v2]`
- `github-prompt-manager list --status [active|draft|deprecated]`

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| GitHub Repository URL | Configuration | Yes | Repository containing prompts |
| GitHub Token | Secrets Manager | Yes | PAT with repo read/write access |
| Prompt Name | Command argument | Yes | Identifier for the prompt to manage |
| Target Environment | Command argument | Conditional | Where to deploy (windsurf, claude, api) |
| Version/Tag | Command argument | Conditional | Specific version for rollback/diff |
| Variables File | Repository | No | Environment-specific variable overrides |
| Deployment Config | Repository | Yes | Target configuration per prompt |

**Repository Structure:**
```
prompts-repo/
  prompts/
    agent-operations/
      system-prompt.md
      metadata.yaml
      variables/
        production.yaml
        staging.yaml
    agent-maintenance/
      system-prompt.md
      metadata.yaml
      variables/
        production.yaml
    orchestrator/
      system-prompt.md
      metadata.yaml
  templates/
    prompt-template.md
    metadata-template.yaml
  deploy/
    targets.yaml
  tests/
    validation-rules.yaml
  CHANGELOG.md
```

**Metadata Schema (metadata.yaml):**
```yaml
prompt:
  name: "agent-operations"
  display_name: "Operations Readiness Agent"
  version: "1.3.0"
  category: "E. Multi-Agent OR"
  author: "team-or"
  created: "2025-01-15"
  last_modified: "2025-03-20"
  status: "active"  # active | draft | deprecated | archived
  targets:
    - type: "windsurf"
      project: "or-system"
      agent: "operations"
    - type: "claude-project"
      project_id: "proj_xxxxx"
  dependencies:
    - "orchestrator"
    - "agent-doc-control"
  tags:
    - "or-system"
    - "operations"
    - "sop"
  performance:
    last_score: 0.87
    baseline_score: 0.82
    evaluation_date: "2025-03-18"
```

## Output Specification

**Primary Outputs:**
1. **Deployed Prompt:** Prompt content pushed to target environment with variables resolved
2. **Deployment Record:** JSON log of deployment operation
3. **Validation Report:** Results of prompt validation checks
4. **Diff Report:** Side-by-side comparison of prompt versions

**Deployment Record:**
```json
{
  "deployment_id": "uuid",
  "timestamp": "ISO-8601",
  "prompt_name": "agent-operations",
  "version": "v1.3.0",
  "commit_sha": "abc123def",
  "target": {
    "type": "windsurf",
    "project": "or-system",
    "agent": "operations"
  },
  "variables_resolved": ["project_name", "client_name"],
  "previous_version": "v1.2.1",
  "deployed_by": "github-actions",
  "status": "success",
  "rollback_available": true
}
```

**Validation Report:**
```json
{
  "prompt_name": "agent-operations",
  "version": "v1.3.0",
  "checks": [
    {"rule": "max_token_length", "status": "pass", "value": 4200, "limit": 8000},
    {"rule": "no_secrets", "status": "pass", "details": "No API keys or tokens detected"},
    {"rule": "variables_resolved", "status": "pass", "unresolved": []},
    {"rule": "markdown_valid", "status": "pass"},
    {"rule": "metadata_complete", "status": "pass"},
    {"rule": "backward_compatible", "status": "warning", "details": "Section 'Output Format' restructured"}
  ],
  "overall": "pass_with_warnings"
}
```

## Methodology & Standards

- **Prompt-as-Code:** Prompts are treated as source code with the same rigor (version control, review, testing, deployment).
- **Semantic Versioning:** Prompts follow semver: MAJOR (breaking behavioral change), MINOR (new capability), PATCH (refinement/fix).
- **Branch Strategy:** Feature branches for prompt development, PR to main for review, tags for releases.
- **Variable Injection:** Use `{{variable_name}}` syntax. Variables resolved at deploy time from environment-specific files.
- **Secret Scanning:** Pre-commit hooks and validation rules scan for accidentally included secrets.
- **Rollback Policy:** Previous 5 versions retained in deployment targets for instant rollback.
- **Review Requirements:** At least one reviewer for PATCH changes, two for MINOR/MAJOR.

## Step-by-Step Execution

### Step 1: Validate Prompt Source
1. Clone or pull latest from the prompts repository
2. Locate the prompt by name in `prompts/` directory
3. Parse `metadata.yaml` for configuration and targets
4. Validate prompt structure against template requirements
5. Run secret scanning on prompt content
6. Check token length against target platform limits

### Step 2: Resolve Variables
1. Load base variables from prompt's `variables/` directory
2. Overlay environment-specific variables (production/staging)
3. Validate all `{{variable}}` placeholders have values
4. Report any unresolved variables as errors
5. Generate resolved prompt content (keep template and resolved versions)

### Step 3: Version Management
1. Compare current prompt with last deployed version
2. Generate diff report highlighting changes
3. Validate version bump matches change magnitude:
   - Content restructure or behavioral change = MAJOR
   - New sections or capabilities = MINOR
   - Wording refinements or fixes = PATCH
4. Update CHANGELOG.md entry

### Step 4: Pre-Deployment Validation
1. Run all validation rules from `tests/validation-rules.yaml`
2. Check backward compatibility with dependent agents
3. Verify target environment accessibility
4. Confirm deployment configuration is valid
5. Generate validation report

### Step 5: Deploy to Target
1. For each target in metadata:
   a. **Windsurf:** Update CLAUDE.md or agent configuration file via API/file push
   b. **Claude Project:** Update project instructions via API
   c. **Custom API:** POST prompt content to configured endpoint
2. Verify deployment success (read back and compare)
3. Record deployment metadata

### Step 6: Post-Deployment
1. Log deployment record
2. Tag the commit with the new version (if not already tagged)
3. Notify dependent agents of prompt update
4. Schedule performance evaluation (if configured)
5. Update deployment dashboard

### Step 7: Rollback (if needed)
1. Identify target version from deployment history
2. Retrieve prompt content for that version from Git
3. Re-deploy using Steps 4-6 with the older version
4. Mark current version as "rolled-back" in deployment log
5. Create incident record for investigation

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Deployment Success Rate | Successful deploys / total deploys | > 99% |
| Validation Coverage | Prompts with full validation suite | 100% |
| Version Accuracy | Correct semver applied | 100% |
| Rollback Time | Time from decision to rolled-back state | < 2 minutes |
| Secret Leak Prevention | Secrets detected before deployment | 100% |
| Review Compliance | PRs with required reviews before merge | 100% |
| Variable Resolution | All placeholders resolved at deploy | 100% |
| Sync Accuracy | Deployed content matches Git source | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Consumer | Orchestrator prompt managed and deployed by this skill |
| `agent-*` (all agents) | Consumer | All agent system prompts versioned and deployed |
| `github-skill-deployer` | Sibling | Works alongside for skill file deployment (not prompts) |
| `agent-doc-control` | Upstream | Document control tracks prompt versions as controlled documents |
| `agent-or-pmo` | Consumer | PMO reviews prompt change impact on OR system |
| `audit-ai-workflow` | Consumer | Audit skill uses prompt version history for compliance |

## Templates & References

**Prompt File Template (`templates/prompt-template.md`):**
```markdown
# {{agent_display_name}}

You are the {{agent_role}} for the {{project_name}} OR System.

## Role & Scope
[Define the agent's role, boundaries, and authority level]

## Core Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]

## Rules & Constraints
- [Rule 1]
- [Rule 2]

## Output Standards
[Define expected output formats, quality, and structure]

## Interaction Patterns
[How this agent communicates with other agents and humans]

---
Version: {{version}}
Last Updated: {{last_modified}}
```

**Deployment Targets Configuration (`deploy/targets.yaml`):**
```yaml
targets:
  windsurf:
    type: "file"
    base_path: "/projects/or-system/agents/"
    file_pattern: "{agent_name}/CLAUDE.md"
    method: "git-push"

  claude-project:
    type: "api"
    base_url: "https://api.anthropic.com/v1/projects"
    method: "PUT"
    auth: "bearer"

  custom-api:
    type: "api"
    base_url: "https://or-system.vsc.cl/api/prompts"
    method: "POST"
    auth: "api-key"
```

## Examples

**Example 1: Deploy Updated Prompt**
```
Command: github-prompt-manager deploy --prompt agent-operations --target windsurf

Process:
  1. Pull latest from prompts repo
  2. Read prompts/agent-operations/system-prompt.md (v1.3.0)
  3. Load variables/production.yaml: { project_name: "Lithium Plant", client_name: "SQM" }
  4. Resolve {{project_name}} -> "Lithium Plant" in prompt
  5. Validate: token count 4200 (pass), no secrets (pass), all vars resolved (pass)
  6. Push to Windsurf: /projects/or-system/agents/operations/CLAUDE.md
  7. Verify: read back matches source
  8. Log deployment: { version: "v1.3.0", target: "windsurf", status: "success" }

Output: "Deployed agent-operations v1.3.0 to windsurf/or-system/operations. Previous: v1.2.1."
```

**Example 2: Rollback After Performance Degradation**
```
Command: github-prompt-manager rollback --prompt agent-maintenance --version v2.1.0

Process:
  1. Current deployed version: v2.2.0 (performance score dropped to 0.65)
  2. Retrieve v2.1.0 from Git history (performance score was 0.85)
  3. Resolve variables for production environment
  4. Validate v2.1.0 prompt
  5. Deploy v2.1.0 to all configured targets
  6. Mark v2.2.0 as "rolled-back" with reason
  7. Create incident: "Prompt regression in agent-maintenance v2.2.0"

Output: "Rolled back agent-maintenance from v2.2.0 to v2.1.0. Incident OR-INC-042 created."
```

**Example 3: Validate All Prompts**
```
Command: github-prompt-manager validate --all

Output:
  agent-operations (v1.3.0): PASS
  agent-maintenance (v2.2.0): PASS
  agent-hse (v1.1.0): PASS WITH WARNINGS
    - Warning: Token count 7800 approaching limit (8000)
  agent-hr (v1.0.0): FAIL
    - Error: Unresolved variable {{compensation_policy_url}}
  orchestrator (v3.0.0): PASS

  Summary: 15 prompts validated. 13 pass, 1 warning, 1 failure.
```
