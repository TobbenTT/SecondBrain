# Sync Memory Agents

## Skill ID: G-004
## Version: 1.0.0
## Category: G. Knowledge & Memory Management
## Priority: Critical

## Purpose

Synchronize and consolidate memories across all agents in the OR multi-agent system between sessions, ensuring state files are consistent, cross-project learnings are promoted to the methodology folder, stale memories are archived, and contradictions between agent memories are detected and resolved. This skill prevents memory bloat (agents accumulating infinite state that degrades performance), memory drift (agents developing inconsistent views of the same reality), and memory loss (valuable learnings trapped in one agent's state file never benefiting others). It is the garbage collection and consistency layer for the distributed memory system.

## Intent & Specification

**Problem:** In a multi-agent system, each agent maintains its own state file (memory) that persists between sessions. Over time, these individual memories create serious problems: (1) **Memory bloat** -- agents accumulate observations, lessons, and state data indefinitely, eventually degrading context window efficiency and response quality as irrelevant historical data crowds out current context; (2) **Memory drift** -- different agents develop inconsistent views of the same facts (e.g., agent-operations believes the plant has 4 shifts while agent-hr's staffing plan references 5 shifts); (3) **Memory silos** -- agent-maintenance learns a valuable lesson about pump reliability that agent-operations never sees, even though it directly affects operational procedures; (4) **Memory contradictions** -- an early agent memory says "budget is $40M" but a later decision changed it to "$45M" and only some agents were updated; (5) **Memory staleness** -- decisions made 6 months ago remain in active memory as if they were current, even when superseded by newer decisions.

**Success Criteria:**
- All agent state files are synchronized within 24 hours of any significant update
- Cross-agent contradictions are detected and resolved within 48 hours
- Memory bloat is controlled: each agent's state file stays under a defined size limit
- Cross-project learnings are promoted to the methodology folder within 2 weeks of capture
- Stale memories (superseded decisions, completed milestones, resolved issues) are archived
- After synchronization, no agent operates on outdated information about shared facts
- Memory sync process runs without disrupting active agent operations
- Sync audit trail maintains complete history of all memory changes

**Constraints:**
- Must not modify agent memories during active task execution (sync during idle periods)
- Must preserve agent-specific context (not everything should be shared)
- Must respect confidentiality boundaries (project-specific data stays within project agents)
- Must handle agents being offline or in different projects gracefully
- Must not exceed context window limits when loading sync data into agents
- Must maintain human-auditable sync logs
- Must be reversible (any sync action can be undone within 48 hours)
- Must integrate with the hook architecture (TeammateIdle hook triggers sync opportunities)

## Trigger / Invocation

**Manual Triggers:**
- `sync-memory-agents sync --scope [all|project|agent-pair]`
- `sync-memory-agents detect-conflicts --scope [all|project]`
- `sync-memory-agents promote --learning [description] --from [agent] --to [methodology]`
- `sync-memory-agents archive --agent [name] --criteria [age|relevance|superseded]`
- `sync-memory-agents audit --period [date-range]`
- `sync-memory-agents restore --agent [name] --snapshot [date]` (rollback to previous state)
- `sync-memory-agents health` (memory health report across all agents)

**Automatic Triggers:**
- Daily: scheduled sync run at 23:00 (after business hours, before daily nudge generation)
- TeammateIdle hook: when an agent is idle, check if it needs memory sync
- Session start: when an agent begins a new session, verify its memory is current
- Decision recorded: when a shared decision is made, propagate to all affected agents
- Project milestone: when a milestone is reached, archive related pre-milestone memories
- Weekly: comprehensive sync audit and health check

**Event-Driven Triggers:**
- Agent produces output contradicting another agent's output -> immediate conflict detection
- Quality validation fails due to outdated data -> trigger memory refresh for the agent
- New agent deployed -> seed with relevant shared memories from existing agents
- Agent decommissioned -> harvest valuable memories before archival

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Agent State Files | All agents | Yes | Current memory/state files from each agent |
| Agent Registry | System Config | Yes | List of all active agents and their scopes |
| Shared Facts Registry | System | Yes | Canonical shared facts (project parameters, decisions, dates) |
| Methodology Library | Knowledge Base | Yes | Cross-project methodology knowledge |
| Sync Configuration | Configuration | Yes | Rules for what to sync, share, and archive |
| Project Boundaries | System Config | Yes | Which agents belong to which projects |
| Previous Sync Log | System | No | Last sync results for delta processing |
| Conflict Resolution Rules | Configuration | No | Rules for resolving contradictions |

**Sync Configuration:**
```yaml
sync_config:
  memory_limits:
    max_state_file_size_kb: 50  # per agent
    max_observations: 100       # per agent
    max_lessons_learned: 50     # per agent
    max_active_decisions: 30    # per agent
    archive_threshold_days: 180 # archive memories older than this

  shared_facts:
    categories:
      - "project_parameters"    # budget, schedule, scope
      - "organizational"        # org structure, roles, contacts
      - "technical_decisions"   # design decisions, standards adopted
      - "regulatory"            # applicable regulations, permits
      - "commercial"            # contract terms, client requirements
    propagation: "immediate"    # shared facts sync immediately
    conflict_resolution: "newest_wins_with_audit"

  cross_agent_sharing:
    share_categories:
      - "lessons_learned"       # always share across agents
      - "best_practices"        # always share across agents
      - "common_references"     # standards, templates, contacts
    private_categories:
      - "agent_internal_state"  # task progress, working notes
      - "draft_outputs"         # work in progress
      - "calibration_data"      # agent-specific tuning
    promotion_criteria:
      - "applicable to 2+ projects"
      - "not client-specific"
      - "validated by quality check or human review"

  archival_rules:
    - condition: "decision superseded by newer decision"
      action: "archive with reference to superseding decision"
    - condition: "milestone completed and no active reference"
      action: "archive after 30 days"
    - condition: "observation older than 180 days and not referenced"
      action: "archive"
    - condition: "lesson learned promoted to methodology"
      action: "replace with reference to methodology artifact"

  conflict_resolution:
    strategy: "newest_wins_with_audit"
    rules:
      - type: "numeric_value"
        resolution: "use most recent value, log change"
      - type: "decision"
        resolution: "use decision with most recent approval date"
      - type: "factual_claim"
        resolution: "escalate to human for verification"
      - type: "preference_or_approach"
        resolution: "flag for discussion, allow agent-specific preference"
```

## Output Specification

**Primary Outputs:**

1. **Sync Report:**
```markdown
# Memory Sync Report
## Sync ID: {SYNC-YYYYMMDD-NNN}
## Date: {Date and Time}
## Scope: {All / Project / Agent Pair}
## Duration: {minutes}
## Status: {Complete / Partial / Failed}

---

## Summary
- Agents synced: {N} of {N}
- Shared facts verified: {N}
- Conflicts detected: {N}
- Conflicts resolved: {N} (auto: {N}, escalated: {N})
- Memories archived: {N}
- Learnings promoted: {N}
- Memory bloat cleaned: {N} items removed across {N} agents

## Shared Facts Verification
| Fact | Canonical Value | Agents Aligned | Agents Updated | Conflicts |
|------|----------------|----------------|----------------|-----------|
| {fact} | {value} | {N}/{N} | {list} | {none/details} |

## Conflicts Detected and Resolved
### Conflict 1: {description}
- **Agents involved:** {agent1, agent2}
- **Agent 1 value:** {value}
- **Agent 2 value:** {value}
- **Resolution:** {which value adopted and why}
- **Action taken:** {updated agent X with value Y}

## Cross-Agent Learning Propagation
| Learning | Source Agent | Target Agents | Status |
|----------|-------------|---------------|--------|
| {learning} | {source} | {targets} | {propagated / pending review} |

## Methodology Promotions
| Learning | Source | Methodology Artifact | Status |
|----------|--------|---------------------|--------|
| {learning} | {agent/project} | {KC-NNNN or new} | {promoted / pending} |

## Memory Health After Sync
| Agent | State Size (KB) | Observations | Lessons | Decisions | Health |
|-------|----------------|--------------|---------|-----------|--------|
| {agent} | {size} | {count} | {count} | {count} | {good/warning/critical} |

## Archival Summary
- Items archived: {N}
- Reasons: superseded ({N}), aged ({N}), promoted ({N}), milestone-complete ({N})
- Space recovered: {N} KB across {N} agents

---
## Sync Metadata
- Triggered by: {scheduled / manual / event}
- Sync algorithm version: {version}
- Rollback available until: {date}
```

2. **Conflict Alert:**
```markdown
# Memory Conflict Alert
## Conflict ID: {CONF-NNN}
## Detected: {Date}
## Severity: {Critical / Warning / Info}

**Conflicting Fact:** {description}
**Agent A ({agent_name}):** {agent A's value} — Source: {where A got this}
**Agent B ({agent_name}):** {agent B's value} — Source: {where B got this}

**Impact:** {What goes wrong if this conflict is not resolved}

**Auto-Resolution:** {Applied / Not possible}
**Recommended Action:** {What the human should do}
**Affected Deliverables:** {List of outputs that may contain the wrong value}
```

3. **Memory Health Dashboard:**
```markdown
# Memory Health Dashboard
## Date: {Date}
## Agents Monitored: {N}

| Agent | Size | Limit | Usage | Observations | Stale Items | Health |
|-------|------|-------|-------|--------------|-------------|--------|
| {agent} | {KB} | {KB} | {%} | {N} | {N} | {emoji} |

**System-Wide Metrics:**
- Total memory footprint: {KB} of {KB} limit ({%})
- Cross-agent consistency: {%} (shared facts aligned)
- Average staleness: {%} of memories older than threshold
- Conflict rate: {N} per week (trend: {up/down/stable})
- Promotion rate: {N} learnings promoted to methodology this month

**Alerts:**
- {Alert 1: agent approaching memory limit}
- {Alert 2: conflict pending resolution}
- {Alert 3: sync overdue for agent}
```

## Methodology & Standards

- **Distributed Memory Architecture:** Each agent in the OR multi-agent system maintains a state file that persists between sessions. This state file contains: observations (things the agent has noticed), lessons learned (what worked and did not work), active decisions (current project parameters and choices), references (standards, contacts, documents), and working state (task progress, draft outputs). The sync skill treats these state files as a distributed database that needs consistency management.

- **Shared Facts vs. Private State:**
  - **Shared Facts** are pieces of information that must be consistent across all agents: project budget, schedule milestones, organizational structure, technical decisions, regulatory requirements. When a shared fact changes, all agents must be updated.
  - **Private State** is agent-specific information that does not need to be shared: internal task progress, working drafts, agent calibration data, temporary notes. Private state is never synced.
  - **Shareable Knowledge** is information that originated in one agent but has value for others: lessons learned, best practices, efficiency patterns. This is shared proactively but does not require consistency enforcement.

- **Conflict Detection Strategy:**
  - **Value conflicts:** Two agents have different values for the same fact. Detected by comparing shared fact values across agents. Example: agent-finance says budget is $40M, agent-operations says $45M.
  - **Temporal conflicts:** An agent references a decision that has been superseded. Detected by comparing decision dates. Example: agent-maintenance still references the original 4-shift pattern after a decision changed it to 5 shifts.
  - **Logical conflicts:** Two agent outputs contain contradictory statements. Detected during quality validation or cross-deliverable consistency checks. Example: staffing plan says 120 people, OPEX model uses 140 people for labor cost.
  - **Resolution hierarchy:** (1) Most recent official decision wins; (2) Higher authority source wins; (3) If unresolvable: escalate to human.

- **Memory Lifecycle Management:**
  ```
  Created -> Active -> Referenced -> Stale -> Archived
    |                    |              |          |
    |                    +-> Promoted    +-> Deleted
    +-> Superseded -------> Archived
  ```
  - **Created:** New memory item recorded by agent
  - **Active:** Currently referenced in agent operations
  - **Referenced:** Accessed within the last 180 days
  - **Stale:** Not accessed in 180+ days, no active references
  - **Archived:** Moved to archive, searchable but not loaded into active context
  - **Promoted:** Valuable learning promoted to methodology library
  - **Superseded:** Replaced by newer information, archived with reference
  - **Deleted:** Permanently removed (only after 90 days in archive with no access)

- **Bloat Prevention:**
  - Each agent has defined memory limits (observations, lessons, decisions)
  - When limits are approached (>80%), the sync process triggers archival
  - Archival priority: oldest unreferenced items first, then superseded items
  - Critical items (safety decisions, regulatory requirements) are exempt from automatic archival
  - After archival: compact the state file and verify integrity

- **Sync Timing Protocol:**
  - Daily sync runs during off-hours (23:00) to avoid disrupting active operations
  - Shared fact changes propagate immediately (not waiting for daily sync)
  - Session-start verification: quick check that the agent's shared facts are current
  - Full sync is skipped if no changes detected since last sync (delta processing)

## Step-by-Step Execution

### Step 1: Inventory Agent States
1. Load the agent registry to identify all active agents
2. For each agent, load the current state file:
   - Record state file size (KB)
   - Count observations, lessons, decisions, references
   - Record last sync date
   - Record last modification date
3. Identify agents that have changed since last sync
4. Identify agents approaching memory limits
5. If any agents are currently executing tasks: mark as "sync after completion"

### Step 2: Verify Shared Facts
1. Load the Shared Facts Registry (canonical source of truth):
   - Project parameters: budget, schedule, scope, design basis
   - Organizational: org chart, roles, contacts
   - Technical decisions: design choices, standards adopted
   - Regulatory: applicable regulations, permits, requirements
   - Commercial: contract terms, client requirements
2. For each shared fact, compare the canonical value against each agent's state:
   - Match: agent is aligned, no action needed
   - Mismatch: flag as potential conflict
   - Missing: agent does not have this fact, assess if it should
3. Record all mismatches for conflict resolution

### Step 3: Detect and Resolve Conflicts
1. For each mismatch identified in Step 2:
   - Determine conflict type: value, temporal, or logical
   - Assess severity: critical (affects safety or major decisions), warning (affects deliverables), info (minor discrepancy)
2. Apply auto-resolution rules:
   - Numeric values: use the most recent value from the Shared Facts Registry
   - Decisions: use the decision with the most recent approval date
   - Temporal: update the outdated agent with current information
3. For conflicts that cannot be auto-resolved:
   - Factual claims with uncertain source: escalate to human
   - Preference conflicts: flag for discussion, allow agent-specific preference
4. Record all resolutions with rationale and audit trail
5. Update affected agent state files with resolved values
6. Generate conflict alerts for any escalated conflicts

### Step 4: Propagate Cross-Agent Learnings
1. Scan each agent's lessons learned and observations for shareable knowledge:
   - Is this lesson applicable to other agents? (not agent-internal)
   - Is this lesson project-specific or generalizable?
   - Has this lesson been validated (quality check or human confirmation)?
2. For applicable learnings:
   - Identify target agents that would benefit
   - Format the learning for the target agent's context
   - Add to target agent's state file in the "received learnings" section
   - Record propagation in sync log
3. Avoid duplication: check if the target agent already has equivalent knowledge

### Step 5: Promote to Methodology Library
1. Identify learnings that meet promotion criteria:
   - Applicable to 2+ projects (not project-specific)
   - Not client-confidential
   - Validated by quality check or human review
   - Represents a best practice, reusable pattern, or important lesson
2. For each promotable learning:
   - Create a generalized version (strip project-specific details)
   - Create or update a knowledge card via `capture-knowledge-artifact`
   - File in the methodology library via `curate-knowledge-flow`
   - In the source agent's state file: replace the learning with a reference to the methodology artifact
3. Record all promotions in the sync report

### Step 6: Archive Stale Memories
1. For each agent, identify stale memory items:
   - Observations older than 180 days with no references
   - Decisions that have been superseded by newer decisions
   - Milestones that are completed and no longer referenced
   - Lessons that have been promoted to methodology
   - Temporary notes and working state from completed tasks
2. For each stale item:
   - Move to agent's archive section (searchable but not loaded into active context)
   - Record archival reason and original content
   - Update cross-references (other items pointing to archived item get updated references)
3. Calculate space recovered and update memory metrics

### Step 7: Enforce Memory Limits
1. After archival, check each agent against memory limits:
   - State file size vs. max_state_file_size_kb
   - Observation count vs. max_observations
   - Lessons count vs. max_lessons_learned
   - Decision count vs. max_active_decisions
2. If any agent exceeds limits after archival:
   - Force-archive the oldest unreferenced items
   - If still over limit: flag for human review (agent may need restructuring)
   - Never archive safety-critical or regulatory items automatically
3. Compact state files: remove formatting bloat, consolidate duplicate references

### Step 8: Seed New Agents
1. If any new agents have been deployed since last sync:
   - Identify relevant shared facts for the new agent's scope
   - Load shared facts into the new agent's state file
   - Identify relevant methodology learnings for the agent's domain
   - Load curated learnings into the agent's state file
   - Identify relevant project context from existing agents
   - Create baseline state for the new agent
2. Record seeding in sync log

### Step 9: Generate Sync Report
1. Compile all actions taken during this sync cycle:
   - Shared facts verified and updated
   - Conflicts detected and resolved (or escalated)
   - Learnings propagated between agents
   - Methodology promotions made
   - Memories archived
   - Memory limits enforced
2. Calculate memory health metrics:
   - Per-agent: size, utilization, staleness, health status
   - System-wide: total footprint, consistency rate, conflict rate
3. Generate recommendations:
   - Agents needing attention (high memory usage, frequent conflicts)
   - Knowledge gaps (domains with few shared learnings)
   - Process improvements (recurring conflict patterns)
4. Store sync report for audit trail
5. Make sync data available to `generate-daily-nudge`

### Step 10: Create Rollback Snapshot
1. After successful sync, create a snapshot of all agent states
2. Store snapshot with the sync ID for rollback capability
3. Retain snapshots for 48 hours (configurable)
4. If sync caused issues: `sync-memory-agents restore --snapshot [sync-id]`
5. Purge snapshots older than retention period

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Sync Completion | Agents successfully synced per cycle | 100% |
| Shared Fact Consistency | Agents aligned on shared facts post-sync | 100% |
| Conflict Detection | Conflicts detected vs. total conflicts | > 95% |
| Auto-Resolution Rate | Conflicts resolved automatically | > 80% |
| Memory Bloat Control | Agents within memory limits post-sync | 100% |
| Promotion Rate | Valid cross-project learnings promoted per month | > 5 |
| Archival Accuracy | Archived items that were correctly identified as stale | > 95% |
| Sync Duration | Time to complete full sync cycle | < 30 minutes |
| Zero Disruption | Sync operations that interrupted active agent tasks | 0 |
| Rollback Availability | Sync cycles with available rollback snapshots | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| All `agent-*` | Bidirectional | Reads and updates all agent state files |
| `orchestrate-or-agents` | Upstream | Provides Shared Task List and agent assignments |
| `capture-knowledge-artifact` | Downstream | Creates knowledge cards for promoted learnings |
| `curate-knowledge-flow` | Downstream | Routes promoted learnings through knowledge flow |
| `generate-daily-nudge` | Downstream | Provides sync status and conflict alerts for nudges |
| `validate-output-quality` | Upstream | Quality failures may trigger memory refresh |
| `build-second-brain` | Downstream | Methodology promotions stored in Second Brain |
| `design-quality-gate` | Consumer | Gate definitions stored in shared facts for consistency |

## Templates & References

**Agent State File Structure (for sync compatibility):**
```yaml
agent_state:
  metadata:
    agent_name: "{agent-name}"
    last_sync: "{datetime}"
    state_version: "{version}"
    size_kb: {N}

  shared_facts:
    project_parameters:
      - fact: "{name}"
        value: "{value}"
        source: "{where this came from}"
        updated: "{date}"
    # ... other shared fact categories

  observations:
    - id: "OBS-{NNN}"
      content: "{observation text}"
      date: "{date}"
      referenced_by: ["{task_id or deliverable}"]
      last_accessed: "{date}"

  lessons_learned:
    - id: "LL-{NNN}"
      content: "{lesson text}"
      date: "{date}"
      project: "{project name}"
      promoted: {true/false}
      methodology_ref: "{KC-NNNN or null}"

  active_decisions:
    - id: "DEC-{NNN}"
      decision: "{decision text}"
      date: "{date}"
      approved_by: "{name}"
      supersedes: "{DEC-NNN or null}"
      status: "{active / superseded}"

  received_learnings:
    - from_agent: "{agent-name}"
      content: "{learning text}"
      sync_id: "{SYNC-ID}"
      date: "{date}"

  archive:
    - original_section: "{observations / lessons / decisions}"
      original_id: "{ID}"
      content: "{archived content}"
      archived_date: "{date}"
      reason: "{superseded / aged / promoted / milestone-complete}"
```

**Conflict Resolution Quick Reference:**
```
Conflict Type -> Resolution Strategy
  Numeric value -> Use most recent from Shared Facts Registry
  Date/schedule -> Use most recent approved schedule
  Decision -> Use decision with latest approval date
  Org structure -> Use HR-confirmed org chart
  Technical spec -> Escalate to engineering lead
  Budget/cost -> Use finance-approved figures
  Regulatory -> Escalate to legal/HSE review
  Unknown -> Escalate to orchestrator
```

## Examples

**Example 1: Daily Sync with Conflict Resolution**
```
Trigger: Scheduled daily sync at 23:00

Sync Report: SYNC-20250605-001
  Agents synced: 12 of 12
  Duration: 18 minutes

  Shared Facts Verified:
  | Fact | Canonical | Mismatches | Updated |
  |------|-----------|------------|---------|
  | Project budget | $45M | agent-finance had $40M | agent-finance updated |
  | Shift pattern | 5 crews, 4x3 rotation | agent-operations had 4 crews | agent-operations updated |
  | Ramp-up duration | 9 months | All aligned | No action |

  Conflicts Resolved:
  1. Budget conflict (agent-finance: $40M vs canonical: $45M)
     - Root cause: agent-finance was loaded before Steering Committee decision on May 20
     - Resolution: Updated agent-finance with $45M (approved decision DEC-042)
     - Impact: OPEX model needs recalculation with updated budget
     - Action: Created task for agent-finance to update OPEX model

  2. Shift pattern conflict (agent-operations: 4 crews vs canonical: 5 crews)
     - Root cause: Design change on May 25 added 5th crew for maintenance coverage
     - Resolution: Updated agent-operations with 5-crew pattern
     - Impact: Staffing plan numbers need verification
     - Action: Flagged staffing plan for revalidation

  Cross-Agent Learnings Propagated:
  - agent-maintenance -> agent-operations: "Pump seal failure in brine service averages
    every 4,200 hours. Plan for online spare swap capability."
  - agent-hse -> all agents: "Updated emergency response contact list effective June 1"

  Methodology Promotions:
  - "Criticality-based maintenance strategy for lithium evaporators" promoted from
    Lithium Plant project to methodology library as KC-0260

  Memory Health:
  | Agent | Size | Limit | Usage | Health |
  |-------|------|-------|-------|--------|
  | agent-operations | 38KB | 50KB | 76% | Warning |
  | agent-maintenance | 32KB | 50KB | 64% | Good |
  | agent-finance | 25KB | 50KB | 50% | Good |
  | agent-hse | 28KB | 50KB | 56% | Good |

  Archival: 23 items archived across 5 agents (12 aged, 8 superseded, 3 promoted)
  Space recovered: 8.5 KB

  Alerts:
  - agent-operations approaching memory limit (76%). Review observations for archival.
```

**Example 2: New Agent Seeding**
```
Trigger: New agent-quality deployed for the Lithium Plant project

Seeding Process:
  1. Loaded 15 shared facts (project parameters, org structure, regulatory requirements)
  2. Loaded 8 methodology learnings relevant to quality management:
     - KC-0145: Quality management system design patterns
     - KC-0178: Laboratory best practices for lithium analysis
     - KC-0201: Sampling plan design methodology
     - ... (5 more)
  3. Loaded 5 project-specific context items from sibling agents:
     - Product specifications from agent-operations
     - Environmental monitoring requirements from agent-hse
     - Laboratory equipment list from agent-procurement
     - Quality KPIs from agent-or-pmo
     - Client quality standards from doc-control
  4. Created baseline state file: 18KB (36% of limit)

  Result: agent-quality ready for first task with full project context and methodology knowledge.
  No cold-start problem.
```

**Example 3: Conflict Escalation**
```
Trigger: Quality validation detected contradictory data between two deliverables

Conflict Alert: CONF-015
  Severity: Critical

  Conflicting Fact: Number of operators per shift
  agent-operations (Staffing Plan): 12 operators per shift
  agent-finance (OPEX Model): 15 operators per shift

  Source Investigation:
  - agent-operations: Based on task analysis completed May 10 (IS-020)
  - agent-finance: Based on client request email from April 28

  Impact: OPEX labor cost is overstated by 25% if operations figure is correct,
  or Staffing Plan is understaffed by 3 operators per shift if finance figure is correct.
  Both the Staffing Plan and OPEX Model are client deliverables due this week.

  Auto-Resolution: NOT POSSIBLE (both sources are credible, need human decision)

  Escalated To: Carlos Mendez (OR Lead)
  Recommended Action: Verify with client whether the April 28 request supersedes
  the task analysis, or whether 12 operators is the correct figure from the
  detailed analysis. Update the canonical shared fact and re-sync both agents.

  Affected Deliverables:
  - Staffing Plan Rev1 (agent-hr, due June 6)
  - OPEX Model v3 (agent-finance, due June 6)
  - Maintenance Staffing section (agent-maintenance, informational)
```
