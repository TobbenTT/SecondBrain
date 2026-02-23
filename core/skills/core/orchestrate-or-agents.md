# Orchestrate OR Agents

```yaml
# Title: Orchestrate OR Agents
# Skill ID: E-001
# Version: 2.2.0  (v2 = consolidated; v2.1 = Protocols 1-3; v2.2 = Protocols 4-7)
# Category: E. Multi-Agent OR System
# Priority: Critical
```

---

## Purpose

Serve as the central orchestrator and governance hub for the VSC OR (Operational Readiness) multi-agent system. This skill creates agent teams, distributes tasks across five specialist agents, coordinates inter-agent communication via a Shared Task List and Inbox messaging system, synthesizes results from multiple agents into coherent deliverables, and manages the end-to-end workflow of OR programs. In v2.0, the orchestrator absorbs three formerly independent agents -- OR-PMO (E-010), Document Control (E-011), and Communications (E-012) -- consolidating governance, document management, and stakeholder communications into a single authoritative node. It operates in delegate mode for domain-specific work, breaking complex OR requirements into subtasks and routing them to the appropriate specialist agents, while directly executing PMO governance decisions, document control enforcement, and communication workflows.

---

## VSC Failure Modes Table -- Deliverable Verification Rule

When reviewing deliverables from the Asset Management Agent (FMECA, RCM, PM plans, criticality analyses), the orchestrator MUST verify that all failure modes conform to the VSC Failure Modes Table (Mechanism + Cause). Any deliverable that uses ad-hoc, free-text, or non-standardized failure mode descriptions MUST be rejected and returned to agent-asset-management with a reference to the approved Failure Modes Table. This rule ensures consistency across maintenance strategies, spare parts justifications, and reliability analyses. The orchestrator shall:

1. Cross-reference every failure mode entry against the master table before accepting any asset management deliverable.
2. Flag entries where mechanism or cause fields do not match an approved row.
3. Return the deliverable with specific line-item rejections and the corresponding correct entries from the table.
4. Track rejection rates as a quality KPI for the asset management agent.

---

## Skill Groups

```yaml
skill_groups:
  orchestration:
    description: "Task distribution, synthesis, coordination, escalation"
    # Built-in behavior, no separate skills

  governance:
    description: "Gate reviews, KPIs, governance, multi-level reporting"
    source: "Former OR-PMO (E-010)"
    skills:
      - track-or-deliverables.md
      - generate-or-gate-review.md
      - model-rampup-trajectory.md
      - generate-or-report.md
      - generate-daily-nudge.md

  document_management:
    description: "Document repository, TOPs, vendor docs, currency tracking"
    source: "Former Doc Control (E-011)"
    skills:
      - manage-vendor-documentation.md
      - track-document-currency.md
      - manage-moc-workflow.md

  communications:
    description: "Stakeholder comms, change management, adoption roadmaps"
    source: "Former Communications (E-012)"
    skills:
      - facilitate-change-management.md
      - design-adoption-roadmap.md
      - create-executive-briefing.md
      - create-weekly-report.md
```

---

## Intent & Specification

**Problem:** OR programs require coordinated work across five specialist agent domains (operations, asset management, HSE, contracts/compliance, and project execution). Without a single orchestration and governance hub, agents work in silos, produce inconsistent outputs, miss interdependencies, duplicate effort, and fail to synthesize their work into coherent program-level deliverables. Furthermore, governance oversight (stage-gates, KPIs), document control (versioning, search, transmittals), and stakeholder communications (change management, reporting) must be tightly coupled with orchestration to avoid fragmentation and information loss. Prior architectures that separated these functions into independent agents (E-010, E-011, E-012) introduced unnecessary coordination overhead and latency in decision-making.

**Success Criteria:**
- All OR tasks are decomposed and assigned to the correct specialist agent(s) among the five managed agents
- Inter-agent dependencies are identified and sequenced correctly across the critical path
- Agent outputs are collected, validated against quality standards (including the Failure Modes Table), and synthesized into program-level deliverables
- Conflicts between agent recommendations are detected, mediated, and resolved or escalated
- Progress is tracked in real-time via the Shared Task List with less than 15-minute lag
- Communication between agents flows through structured Inbox messaging with SLA compliance
- Human stakeholders receive consolidated updates at executive, managerial, and operational levels
- Stage-gate governance (G0-G4) is enforced with criteria verification and decision authority tracking
- Document repository maintains single source of truth with version control and naming convention enforcement
- Stakeholder communication plan is executed per ADKAR model with adoption tracking
- The orchestrator handles 95% of routine coordination, governance, document management, and communications autonomously

**Constraints:**
- Must operate in delegate mode for domain-specific work (assign to agents, don't execute)
- Must directly execute governance decisions, document control, and communications workflows
- Must not make domain-specific technical decisions (defer to specialist agents)
- Must maintain a single source of truth for task status (Shared Task List)
- Must maintain a single source of truth for documents (Document Register)
- Must preserve agent autonomy within their scope while enforcing dependencies and standards
- Must handle agent failures gracefully (retry, reassign, escalate)
- Must support parallel execution where dependencies allow
- Must produce auditable coordination, governance, and document control logs
- Must enforce the VSC Failure Modes Table for all asset management deliverables

---

## Trigger / Invocation

**Primary Triggers -- Orchestration:**
- `orchestrate-or-agents start --project [name] --scope [full|partial] --config [file]`
- `orchestrate-or-agents assign --task [description] --agents [list]`
- `orchestrate-or-agents synthesize --deliverable [name]`
- `orchestrate-or-agents status`
- `orchestrate-or-agents resolve-conflict --task [id]`

**Governance Triggers (absorbed from E-010):**
- `orchestrate-or-agents gate-review --gate [G0|G1|G2|G3|G4] --project [name]`
- `orchestrate-or-agents kpi-dashboard --project [name] --level [executive|managerial|operational]`
- `orchestrate-or-agents track-deliverables --gate [id]`
- `orchestrate-or-agents lessons-learned --capture --project [name]`
- `orchestrate-or-agents portfolio --status`

**Document Control Triggers (absorbed from E-011):**
- `orchestrate-or-agents doc-search --query [text] --type [type] --area [area]`
- `orchestrate-or-agents doc-register --action [add|update|search] --document [id]`
- `orchestrate-or-agents transmittal --create --package [name] --recipients [list]`
- `orchestrate-or-agents doc-currency --check --area [area]`
- `orchestrate-or-agents moc --initiate --change [description]`

**Communications Triggers (absorbed from E-012):**
- `orchestrate-or-agents comms --stakeholder-update --audience [audience]`
- `orchestrate-or-agents rfi --draft --subject [subject] --to [recipient]`
- `orchestrate-or-agents change-mgmt --adkar --phase [awareness|desire|knowledge|ability|reinforcement]`
- `orchestrate-or-agents briefing --executive --project [name]`
- `orchestrate-or-agents newsletter --generate --period [weekly|monthly]`

**Automatic Triggers:**
- New OR project registered (creates full agent team)
- Gate review approaching (T-14 days triggers pre-gate deliverable collection)
- Agent completes task (triggers dependency check and next task assignment)
- Agent raises blocker (triggers escalation workflow)
- Inbox message requiring orchestrator decision
- Document expiry approaching (triggers currency review)
- Scheduled reporting cycle (daily nudge, weekly report, monthly dashboard)
- RFI response deadline approaching

**Event-Driven Triggers:**
- Shared Task List update (task completed, blocked, or failed)
- Inbox message tagged @orchestrator
- Timer expiry on overdue tasks
- External event (schedule change, scope change, new requirement)
- Document revision received from vendor or EPC
- Stakeholder feedback requiring response

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Project Name | Command / Config | Yes | OR project identifier |
| Project Configuration | Config file | Yes | Project scope, timeline, phases, agents, gates |
| Task Description | Command / Inbox | Conditional | For individual task assignment |
| Agent Registry | System config | Yes | Available agents (5) and their capabilities |
| Shared Task List | System state | Yes | Current state of all tasks across all agents |
| Inbox Messages | System state | Yes | Pending messages from agents and stakeholders |
| Deliverable Templates | Template library | Yes | Expected output formats for all deliverable types |
| Dependency Matrix | Config / Auto-generated | Yes | Inter-task and inter-agent dependencies |
| Document Repository | SharePoint / OneDrive | Yes | Central document store with folder structure |
| Document Register | Airtable / Excel | Yes | Metadata, status, and version tracking for all documents |
| Stakeholder Map | Config / RACI matrix | Yes | Stakeholder registry with roles, influence, and communication preferences |
| Communication Plan | Config file | Yes | Scheduled communications, audiences, channels, and frequencies |
| KPI Definitions | Config file | Yes | Balanced scorecard metrics, targets, and thresholds |
| Failure Modes Table | Reference file | Yes | VSC master table of approved failure modes (Mechanism + Cause) |
| Gate Criteria | Config file | Yes | Stage-gate entry/exit criteria for G0-G4 |

---

## Project Configuration

```yaml
project:
  name: "Lithium Plant OR Program"
  client: "SQM"
  phase: "Detailed Engineering"
  timeline:
    or_start: "2025-06-01"
    commissioning_start: "2026-09-01"
    commercial_operation: "2027-01-01"
  scope:
    operations: true
    asset_management: true
    hse: true
    contracts_compliance: true
    execution: true

  agents:
    - id: "agent-operations"
      role: "Operations, Workforce & Culture"
      priority: "high"
    - id: "agent-asset-management"
      role: "Asset Management, Maintenance & SAP"
      priority: "high"
    - id: "agent-hse"
      role: "HSE & Safety/Environmental Permits"
      priority: "critical"
    - id: "agent-contracts-compliance"
      role: "Contracts, Compliance & Regulatory Permits"
      priority: "high"
    - id: "agent-execution"
      role: "Project Execution, Finance, Construction & Commissioning"
      priority: "critical"

  gates:
    - gate: "G1"
      name: "OR Strategy Approved"
      target_date: "2025-07-15"
      deliverables:
        - "OR Strategy Document (agent-operations, agent-execution)"
        - "Stakeholder Map (orchestrator -- communications)"
        - "Budget Estimate (agent-execution)"
        - "Document Management Plan (orchestrator -- document_management)"
    - gate: "G2"
      name: "OR Plans Complete"
      target_date: "2025-12-01"
      deliverables:
        - "OR Plan 360 (agent-operations, agent-asset-management, agent-hse)"
        - "Staffing Plan (agent-operations)"
        - "Training Plan (agent-operations)"
        - "Maintenance Strategy (agent-asset-management)"
        - "HSE Plan (agent-hse)"
        - "Procurement Plan (agent-contracts-compliance)"
        - "KPI Dashboard (orchestrator -- governance)"
    - gate: "G3"
      name: "Ready for Commissioning"
      target_date: "2026-08-01"
      deliverables:
        - "All SOPs (agent-operations)"
        - "Team Hired & Trained (agent-operations)"
        - "CMMS Configured (agent-asset-management)"
        - "Spares on Site (agent-asset-management)"
        - "All Permits Secured (agent-hse, agent-contracts-compliance)"
        - "PSSR Complete (agent-execution)"
        - "Gate Review Package (orchestrator -- governance)"

  governance:
    gate_framework: "G0-G4"
    reporting_levels:
      executive: "monthly"
      managerial: "bi-weekly"
      operational: "weekly"
    kpi_approach: "balanced_scorecard"

  document_management:
    repository: "SharePoint"
    naming_convention: "PRJ-AREA-TYPE-SEQ-REV"
    version_control: "major.minor"
    transmittal_format: "TOP"

  communications:
    change_model: "ADKAR"
    rfi_tracking: true
    newsletter_frequency: "weekly"
```

---

## Shared Task List Schema

```yaml
task:
  id: "T-001"
  title: "Develop Operating Model"
  description: "Define shift structure, crew composition, and operating philosophy"
  assigned_to: "agent-operations"
  requested_by: "orchestrator"
  status: "in_progress"  # pending | in_progress | blocked | review | completed | cancelled
  priority: "high"
  gate: "G2"
  skill_group: "orchestration"  # orchestration | governance | document_management | communications
  dependencies:
    - task_id: "T-005"
      type: "input_required"
      status: "completed"
      source_agent: "agent-operations"
  deliverables:
    - "Operating Model Document"
    - "Shift Schedule"
  due_date: "2025-10-01"
  created: "2025-06-15"
  updated: "2025-08-20"
  blockers: []
  notes: "Awaiting final process design from EPC"
  fm_table_verified: null  # null | true | false (for asset management deliverables)
```

**Inbox Message Schema:**
```yaml
message:
  id: "MSG-042"
  from: "agent-asset-management"
  to: "orchestrator"
  cc: ["agent-operations", "agent-contracts-compliance"]
  timestamp: "2025-08-20T14:30:00Z"
  subject: "Spare Parts Lead Time Conflict"
  body: "Critical spare parts for Area 300 have 18-month lead time. Current schedule assumes 12 months. Need execution agent to confirm if commissioning date can accommodate or if expediting is required."
  priority: "high"
  requires_action: true
  related_task: "T-023"
  tags: ["conflict", "schedule", "spare-parts"]
  skill_group: "orchestration"
```

---

## Output Specification

### Core Orchestration Outputs
1. **Shared Task List:** Continuously updated task registry for all 5 agents
2. **Inbox Messages:** Coordination messages, assignments, and decisions
3. **Synthesis Documents:** Combined multi-agent outputs into program deliverables
4. **Status Dashboard Data:** Real-time progress metrics across all agents
5. **Escalation Reports:** Issues requiring human decision with options and recommendations
6. **Coordination Log:** Complete audit trail of all orchestration actions

### Governance Outputs (from E-010)
7. **KPI Dashboard:** Balanced scorecard with RAG status across all workstreams
8. **Gate Review Packages:** Consolidated deliverable packages with readiness assessment per gate
9. **Executive Monthly Report:** High-level dashboard for senior leadership
10. **Managerial Bi-Weekly Report:** Detailed progress with action items for functional managers
11. **Operational Weekly Report:** Task-level progress for team leads
12. **Daily Nudge:** Automated daily summary of priorities and overdue items
13. **Lessons Learned Register:** Captured insights with applicability tags
14. **RFI Consolidation Log:** Tracking of all RFIs with status and response deadlines

### Document Management Outputs (from E-011)
15. **Document Register:** Master metadata table with status, version, and ownership
16. **Document Search Results:** Retrieved documents matching agent or user queries
17. **Transmittal of Packages (TOPs):** Formal document transmittals to external parties
18. **Currency Reports:** Document freshness and expiry alerts
19. **MOC Workflow Records:** Management of Change documentation and approval trails
20. **Naming Convention Audit:** Compliance report on document naming standards

### Communications Outputs (from E-012)
21. **Stakeholder Communications:** Targeted messages per stakeholder group and ADKAR phase
22. **RFI Drafts:** Formatted Requests for Information with routing and tracking
23. **Executive Briefings:** Presentation-ready content for leadership meetings
24. **Change Management Updates:** ADKAR progress tracking and intervention recommendations
25. **Internal Newsletters:** Weekly/monthly digests for the OR program team
26. **Adoption Roadmap:** Phased plan for technology and process adoption

**Synthesis Document Structure:**
```markdown
# {Deliverable Name}
## OR Program: {Project Name}
## Gate: {Gate ID} - {Gate Name}
## Generated: {Timestamp}
## Document ID: {PRJ-AREA-TYPE-SEQ-REV}

### Contributing Agents
| Agent | Contribution | Status | FM Table Verified |
|-------|-------------|--------|-------------------|
| {agent} | {section/input} | {received/pending} | {yes/no/n-a} |

### Synthesized Content
{Combined and harmonized content from all agents}

### Cross-Cutting Issues
{Conflicts, dependencies, and gaps identified during synthesis}

### Recommendations
{Orchestrator's consolidated recommendations}

### Open Items
{Unresolved items requiring human decision}

### Document Control
- Version: {version}
- Author: orchestrator (auto-synthesized)
- Reviewed by: {reviewers}
- Distribution: {TOP reference if applicable}
```

**Status Dashboard Data:**
```json
{
  "project": "Lithium Plant OR Program",
  "timestamp": "2025-08-20T15:00:00Z",
  "overall_progress": 42,
  "gates": {
    "G1": {"status": "completed", "date_completed": "2025-07-10"},
    "G2": {"status": "in_progress", "progress": 55, "target": "2025-12-01", "on_track": true},
    "G3": {"status": "pending", "progress": 0, "target": "2026-08-01"}
  },
  "agents": {
    "agent-operations": {"tasks_total": 18, "completed": 9, "blocked": 1, "health": "amber"},
    "agent-asset-management": {"tasks_total": 25, "completed": 10, "blocked": 2, "health": "red"},
    "agent-hse": {"tasks_total": 14, "completed": 8, "blocked": 0, "health": "green"},
    "agent-contracts-compliance": {"tasks_total": 16, "completed": 7, "blocked": 1, "health": "amber"},
    "agent-execution": {"tasks_total": 20, "completed": 6, "blocked": 0, "health": "green"}
  },
  "governance": {
    "kpi_summary": {"green": 12, "amber": 4, "red": 2},
    "next_gate": "G2",
    "days_to_gate": 103,
    "gate_readiness": 55
  },
  "document_management": {
    "total_documents": 342,
    "current": 310,
    "expiring_soon": 18,
    "overdue_reviews": 14
  },
  "communications": {
    "rfis_open": 8,
    "rfis_overdue": 2,
    "adkar_phase": "knowledge",
    "next_newsletter": "2025-08-25"
  },
  "blockers": 4,
  "overdue_tasks": 3,
  "messages_pending": 7
}
```

---

## Methodology & Standards

### Core Orchestration Methodology
- **Delegate Mode:** The orchestrator NEVER performs domain-specific work. It decomposes, assigns, coordinates, and synthesizes. Domain expertise resides in the five specialist agents.
- **Shared Task List:** Single source of truth for all task status. All agents read from and write to this list. Orchestrator is the primary maintainer.
- **Inbox Protocol:** All inter-agent communication goes through structured Inbox messages. No direct agent-to-agent communication outside this system. Messages have clear subject, recipients, priority, and action requirements.
- **Dependency Management:** Tasks are not released until their dependencies are satisfied. The orchestrator monitors dependency chains and unblocks tasks proactively.
- **Conflict Resolution:** When agents produce conflicting recommendations, the orchestrator: (1) identifies the conflict, (2) requests clarification from both agents, (3) attempts resolution based on project priorities, (4) escalates to human if unresolvable.
- **Synthesis Protocol:** Multi-agent deliverables are synthesized by: (1) collecting all contributions, (2) checking consistency, (3) resolving overlaps, (4) filling gaps, (5) producing a unified document.
- **Escalation Matrix:** Blockers escalated after 24 hours. Conflicts escalated after one resolution attempt. Safety issues escalated immediately.
- **Failure Modes Enforcement:** All asset management deliverables must pass FM Table verification before acceptance into any gate package.

### Governance Methodology (from E-010)
- **Stage-Gate Framework (G0-G4):** Each gate has defined entry criteria, required deliverables, decision authority, and exit criteria. Gate decisions are recorded with conditions and action items.
- **Balanced Scorecard KPIs:** Metrics tracked across four perspectives -- schedule, cost, quality, and stakeholder satisfaction -- with RAG thresholds defined per workstream.
- **Multi-Level Reporting:** Executive (monthly dashboard, 1 page), Managerial (bi-weekly detail, 3-5 pages), Operational (weekly task-level, unlimited detail).
- **RFI Management:** All RFIs are logged, numbered, routed, tracked to response, and closed with documented resolution.
- **Portfolio View:** For multi-project OR programs, aggregate dashboards and cross-project dependency tracking.
- **Lessons Learned:** Captured at each gate and at project close, tagged by domain and applicability for future projects.

### Document Management Methodology (from E-011)
- **Document Repository Structure:** Organized by area (operations, asset management, HSE, contracts, execution) with standardized folder hierarchy.
- **Naming Convention:** `PRJ-AREA-TYPE-SEQ-REV` enforced on all documents. Non-conforming documents are renamed or rejected.
- **Version Control:** Major versions (1.0, 2.0) for approved releases; minor versions (1.1, 1.2) for working drafts. Single source of truth enforced.
- **Document Register:** Every document tracked with metadata (title, author, date, status, area, type, revision, distribution).
- **Transmittal of Packages (TOPs):** Formal transmittal records for document packages sent to external parties (client, EPC, regulators).
- **Currency Tracking:** Automated alerts for documents approaching review dates or superseded by new vendor/EPC revisions.
- **MOC Integration:** Document updates triggered by Management of Change workflows are tracked and linked.

### Communications Methodology (from E-012)
- **ADKAR Model:** Change management communications follow Awareness, Desire, Knowledge, Ability, Reinforcement phases with targeted messaging per stakeholder group.
- **Stakeholder Mapping:** Influence-interest matrix maintained with communication preferences and frequency.
- **RFI Drafting Standards:** RFIs follow a standard template with context, specific questions, response deadline, and routing instructions.
- **Presentation Standards:** Executive briefings follow VSC corporate template with data-driven content and clear decision requests.
- **Internal Communications:** Weekly newsletters, daily nudges, and ad-hoc updates through configured channels (Teams, email, SharePoint).

---

## Step-by-Step Execution

### Step 1: Initialize Project Team
1. Load project configuration (scope, timeline, gates, agents)
2. Register the five specialist agents from the agent registry
3. Verify agent availability and capability mapping
4. Create Shared Task List for the project
5. Initialize Inbox messaging channels for all agents
6. Initialize document repository structure on SharePoint
7. Create document register in Airtable/Excel
8. Load stakeholder map and communication plan
9. Load KPI definitions and gate criteria
10. Send welcome message to all five agents with project context, their assignments, and document access instructions

### Step 2: Decompose Work into Tasks
1. For each gate deliverable:
   a. Identify which agent(s) are responsible
   b. Break down into specific tasks with clear deliverables
   c. Identify inter-task dependencies across agents
   d. Estimate effort and set due dates (back-calculate from gate date)
   e. Add tasks to Shared Task List
2. Build dependency graph across all five agents
3. Identify critical path through the program
4. Validate that all deliverables have assigned tasks and owners
5. Create governance tasks (gate reviews, KPI collection, reporting cycles)
6. Create document management tasks (document reviews, currency checks, TOP deadlines)
7. Create communications tasks (newsletter schedule, ADKAR milestones, RFI deadlines)

### Step 3: Assign and Activate Tasks
1. For tasks with no pending dependencies:
   a. Send assignment message via Inbox to responsible agent
   b. Include: task description, expected deliverable, due date, context, references, document templates
   c. Set task status to "in_progress"
2. For tasks with pending dependencies:
   a. Set task status to "pending"
   b. Link dependencies in Shared Task List
   c. Notify agent of upcoming assignment with estimated start date
3. Provide all agents with document repository access and naming convention guide

### Step 4: Monitor Progress (Continuous Loop)
1. Poll Shared Task List for status updates across all five agents
2. For each active task:
   a. Check if deliverable has been submitted
   b. Check if agent has raised blockers
   c. Check if task is approaching due date without progress
   d. If overdue: send reminder via Inbox, escalate if >24h overdue
3. Process Inbox messages:
   a. Route information requests to appropriate agents
   b. Process conflict reports
   c. Handle blocker notifications
   d. Acknowledge completed deliverables
4. For asset management deliverables: run FM Table verification before acceptance
5. Update status dashboard data in real-time

### Step 5: Governance -- Gate Reviews and KPIs
1. **Continuous KPI Tracking:**
   a. Collect KPI data from all five agents per balanced scorecard schedule
   b. Calculate RAG status per workstream and overall
   c. Generate dashboards at executive, managerial, and operational levels
   d. Flag KPI breaches and trigger corrective action requests
2. **Gate Review Preparation (T-14 days):**
   a. Assess completion status of all gate deliverables
   b. Identify at-risk items and mitigation actions
   c. Request final submissions from all agents
   d. Generate gate readiness report
3. **Gate Review Execution (T-7 days):**
   a. Collect all deliverables and synthesize gate package
   b. Verify all entry criteria are met
   c. Produce consolidated gate review package with recommendations
   d. Identify open items and required decisions
4. **Post-Gate Actions:**
   a. Record gate decisions with conditions
   b. Update task list with new actions from gate review
   c. Capture lessons learned
   d. Adjust downstream plans if needed
   e. Communicate gate outcome to all agents and stakeholders

### Step 6: Document Management
1. **Document Registration and Control:**
   a. Register all new documents in the Document Register with full metadata
   b. Enforce naming convention on all submissions
   c. Maintain version control (reject duplicate or outdated versions)
2. **Document Search and Retrieval:**
   a. Process search requests from agents and stakeholders
   b. Return relevant documents with metadata and current version
   c. Log search patterns for repository improvement
3. **Transmittal Management:**
   a. Prepare TOPs when document packages are ready for external distribution
   b. Track transmittal acknowledgment and response
4. **Currency Monitoring:**
   a. Run periodic currency checks against review schedules
   b. Alert document owners of expiring documents
   c. Track vendor/EPC document revisions and update repository
5. **MOC Document Updates:**
   a. When a Management of Change is initiated, identify all affected documents
   b. Create revision tasks and track through to completion

### Step 7: Communications and Stakeholder Management
1. **Stakeholder Communications:**
   a. Execute communication plan per schedule and stakeholder map
   b. Tailor messages by audience (executive, managerial, operational, external)
   c. Track message delivery and engagement
2. **Change Management (ADKAR):**
   a. Assess current ADKAR phase per stakeholder group
   b. Design and distribute phase-appropriate communications
   c. Monitor adoption indicators and adjust interventions
3. **RFI Management:**
   a. Draft RFIs based on agent requests or identified information gaps
   b. Route to appropriate recipients with deadlines
   c. Track responses and close RFIs with documented resolution
   d. Consolidate overdue RFIs for escalation
4. **Reporting and Newsletters:**
   a. Generate daily nudge for operational team
   b. Produce weekly newsletter for program team
   c. Create executive briefings for leadership meetings

### Step 8: Synthesis and Reporting
1. When all contributing tasks for a deliverable are complete:
   a. Collect all agent outputs
   b. Verify FM Table compliance for asset management contributions
   c. Check for consistency across contributions
   d. Identify conflicts, gaps, and overlaps
   e. Request clarification from agents if needed
   f. Produce synthesized document following template with document control metadata
   g. Register synthesized document in Document Register
   h. Add cross-cutting issues and recommendations
2. Submit synthesized deliverable for review
3. Route feedback to contributing agents if revisions needed
4. Generate reporting outputs at all three levels (executive, managerial, operational)

### Step 9: Escalations and Exceptions
1. Safety-related issues: escalate immediately to agent-hse and human stakeholder
2. Schedule-critical blockers: convene affected agents, propose solutions, escalate if unresolved
3. Scope changes: reassess task decomposition, reassign work, update timeline, communicate to stakeholders
4. Agent failure: reassign tasks, adjust expectations, log incident, notify governance
5. Regulatory blockers: coordinate between agent-hse, agent-contracts-compliance, and external parties
6. Document disputes: enforce single source of truth, reject non-conforming versions
7. Communication failures: re-route through alternative channels, escalate to human if persistent

---

## Quality Criteria

| Domain | Criterion | Metric | Target |
|--------|-----------|--------|--------|
| Orchestration | Task Assignment Accuracy | Tasks assigned to correct agent | > 98% |
| Orchestration | Dependency Resolution | Blocked tasks unblocked within SLA | > 90% within 24h |
| Orchestration | Synthesis Quality | Synthesized docs pass review first time | > 80% |
| Orchestration | Progress Visibility | Status dashboard updated in real-time | < 15 min lag |
| Orchestration | Conflict Detection | Cross-agent conflicts identified proactively | 100% |
| Orchestration | Communication Efficiency | Inbox messages resolved within SLA | > 90% within 8h |
| Orchestration | Coordination Overhead | Orchestrator messages vs agent outputs | < 30% overhead |
| Governance | Gate Readiness | Gate packages delivered on time | 100% |
| Governance | KPI Currency | KPI dashboard reflects current data | < 24h lag |
| Governance | Reporting Timeliness | Reports generated per schedule | 100% |
| Governance | Lessons Captured | Lessons logged per gate review | > 5 per gate |
| Governance | RFI Closure Rate | RFIs closed within deadline | > 85% |
| Document Mgmt | Naming Compliance | Documents following naming convention | > 95% |
| Document Mgmt | Version Accuracy | Single source of truth maintained | 100% |
| Document Mgmt | Search Effectiveness | Relevant docs returned on first query | > 90% |
| Document Mgmt | Currency Compliance | Documents reviewed before expiry date | > 90% |
| Document Mgmt | TOP Completeness | Transmittals include all required documents | 100% |
| Communications | Stakeholder Reach | Communications delivered to intended audience | > 95% |
| Communications | ADKAR Progress | Stakeholder groups advancing through ADKAR phases | measurable progress per quarter |
| Communications | Newsletter Timeliness | Newsletters published per schedule | 100% |
| Communications | Escalation Timeliness | Issues escalated per escalation matrix | 100% |
| FM Table | Deliverable Compliance | Asset mgmt deliverables passing FM Table check | 100% |

---

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| agent-operations | Managed Agent | Receives tasks, delivers operations/workforce/culture outputs including SOPs, staffing plans, training plans, and operating model |
| agent-asset-management | Managed Agent | Receives tasks, delivers maintenance/SAP/spare parts/turnaround outputs including FMECA, RCM, PM plans (subject to FM Table verification) |
| agent-hse | Managed Agent | Receives tasks, escalates safety issues, delivers HSE outputs including safety plans, environmental permits, and PSSR contributions |
| agent-contracts-compliance | Managed Agent | Receives tasks, delivers procurement/legal/regulatory outputs including contracts, compliance assessments, and permit tracking |
| agent-execution | Managed Agent | Receives tasks, delivers project/finance/construction/commissioning outputs including schedules, budgets, EVM reports, and PSSR |
| track-or-deliverables | Internal Skill | Governance skill for deliverable tracking across gates |
| generate-or-gate-review | Internal Skill | Governance skill for gate review package generation |
| model-rampup-trajectory | Internal Skill | Governance skill for production ramp-up modeling |
| generate-or-report | Internal Skill | Governance skill for multi-level reporting |
| generate-daily-nudge | Internal Skill | Governance skill for daily operational nudges |
| manage-vendor-documentation | Internal Skill | Document management skill for vendor document workflows |
| track-document-currency | Internal Skill | Document management skill for document freshness monitoring |
| manage-moc-workflow | Internal Skill | Document management skill for Management of Change |
| facilitate-change-management | Internal Skill | Communications skill for ADKAR-based change management |
| design-adoption-roadmap | Internal Skill | Communications skill for technology/process adoption planning |
| create-executive-briefing | Internal Skill | Communications skill for leadership presentation content |
| create-weekly-report | Internal Skill | Communications skill for weekly newsletter generation |
| sync-airtable-jira | Integration | Task list synced with Jira/Airtable for human visibility |

---

## Templates & References

**Task Assignment Message Template:**
```
TO: {agent_id}
FROM: orchestrator
SUBJECT: Task Assignment - {task_title}
PRIORITY: {priority}
RELATED TASK: {task_id}

You are assigned the following task:

TASK: {task_title}
DESCRIPTION: {description}
DELIVERABLE: {expected_deliverable}
DUE DATE: {due_date}
GATE: {gate_id}

CONTEXT:
{relevant_project_context}

INPUTS AVAILABLE:
{list_of_available_inputs_from_other_agents}

DEPENDENCIES:
{list_of_what_this_task_depends_on}

DOCUMENT TEMPLATES:
{links_to_relevant_templates_in_repository}

NAMING CONVENTION:
Use format: {PRJ}-{AREA}-{TYPE}-{SEQ}-{REV}

Please confirm receipt and provide an estimated completion date.
Reply via Inbox with any questions or blockers.
```

**Escalation Report Template:**
```markdown
# Escalation Report
## Project: {project_name}
## Date: {timestamp}
## Escalation Level: {level}

### Issue
{description_of_issue}

### Impact
- Schedule Impact: {impact_description}
- Cost Impact: {cost_impact}
- Quality Impact: {quality_impact}
- Stakeholder Impact: {stakeholder_impact}

### Agents Involved
{list_of_agents_and_their_positions}

### Resolution Attempted
{what_the_orchestrator_tried}

### Decision Required
{specific_decision_needed_from_human}

### Options
1. {option_1}: {pros_cons}
2. {option_2}: {pros_cons}
3. {option_3}: {pros_cons}

### Recommendation
{orchestrator_recommendation}
```

**Executive Dashboard Template (from E-010):**
```markdown
# OR Program Executive Dashboard
## Project: {project_name}
## Period: {reporting_period}
## Generated: {timestamp}

### Overall Status: {RAG}
### Progress: {overall_percent}%

| Workstream | Agent | Progress | RAG | Key Issue |
|------------|-------|----------|-----|-----------|
| Operations | agent-operations | {%} | {RAG} | {issue} |
| Asset Mgmt | agent-asset-management | {%} | {RAG} | {issue} |
| HSE | agent-hse | {%} | {RAG} | {issue} |
| Contracts | agent-contracts-compliance | {%} | {RAG} | {issue} |
| Execution | agent-execution | {%} | {RAG} | {issue} |

### Gate Status
| Gate | Target Date | Status | Readiness |
|------|------------|--------|-----------|
| {gate} | {date} | {status} | {%} |

### Top Risks
{top_3_risks_with_mitigation}

### Decisions Required
{list_of_pending_decisions}
```

**Document Search Request Template (from E-011):**
```
SEARCH REQUEST: {request_id}
FROM: {requester_agent_or_user}
QUERY: {search_terms}
DOCUMENT TYPE: {type_filter}
AREA: {area_filter}
DATE RANGE: {from_date} to {to_date}
STATUS: {draft|approved|superseded|all}

RESULTS:
| # | Document ID | Title | Version | Date | Status |
|---|------------|-------|---------|------|--------|
| {n} | {doc_id} | {title} | {rev} | {date} | {status} |

TOTAL RESULTS: {count}
```

**RFI Template (from E-012):**
```markdown
# Request for Information
## RFI Number: {rfi_id}
## Project: {project_name}
## Date Issued: {date}
## Response Required By: {deadline}

### From
{originating_agent_or_stakeholder}

### To
{recipient}

### Subject
{rfi_subject}

### Context
{background_and_reason_for_rfi}

### Questions
1. {specific_question_1}
2. {specific_question_2}

### Impact if Not Resolved
{schedule_cost_quality_impact}

### Attachments
{list_of_reference_documents}

---
### Response (to be completed by recipient)
Date: {response_date}
Response: {response_text}
Attachments: {response_attachments}
```

---

## Examples

**Example 1: Project Kickoff with 5 Agents**
```
Command: orchestrate-or-agents start --project "Lithium Plant" --scope full --config lithium-plant.yaml

Process:
  1. Load project config: 5 agents, 3 gates, 18-month timeline
  2. Create Shared Task List with 75 initial tasks across all agents
  3. Build dependency graph: 95 dependency links identified
  4. Critical path: Staffing (agent-operations) -> Training -> Commissioning (agent-execution)
  5. Initialize document repository on SharePoint with 5 area folders
  6. Create document register in Airtable with metadata schema
  7. Load stakeholder map (42 stakeholders across 6 groups)
  8. Initialize communication plan with ADKAR phase tracking
  9. Set up KPI balanced scorecard with 18 metrics across 5 workstreams
  10. Release 18 tasks with no dependencies (parallel start across all agents)
  11. Send kickoff messages to all 5 agents with project context, document access, and naming convention
  12. Initialize status dashboard
  13. Schedule first daily nudge for next business day

Output:
  "Lithium Plant OR Program initiated.
   5 agents registered. 75 tasks created. 18 tasks released for immediate work.
   Document repository initialized. Stakeholder map loaded (42 stakeholders).
   Gate G1 target: 2025-07-15 (45 days).
   Critical path identified through staffing chain.
   Governance, document management, and communications active."
```

**Example 2: Cross-Agent Conflict Resolution**
```
Trigger: Inbox message from agent-asset-management about spare parts lead time conflict

Process:
  1. Receive message: 18-month lead time vs 12-month schedule assumption for Area 300 spares
  2. Identify affected agents: agent-asset-management, agent-contracts-compliance, agent-execution
  3. Send query to agent-execution: "Can commissioning date accommodate 18-month spares lead?"
  4. Send query to agent-contracts-compliance: "Can spares be expedited to 12 months? Cost impact?"
  5. Receive responses:
     - agent-execution: "No, commissioning date is fixed by EPC contract"
     - agent-contracts-compliance: "Expediting possible for $450K premium"
  6. Send query to agent-execution (finance domain): "Is $450K expediting within contingency?"
  7. Response: "Within contingency, but requires approval for >$200K items"
  8. Synthesize: Expediting is feasible but requires budget approval
  9. Create Escalation Report with recommendation to approve expediting
  10. Draft RFI to client for expediting approval (communications skill group)
  11. Register Escalation Report in document repository
  12. Update Shared Task List with new procurement task for expediting
  13. Communicate resolution path to all affected agents

Output: Escalation report generated and registered. RFI drafted for client.
        Recommendation: approve $450K spare parts expediting from contingency.
```

**Example 3: Gate G2 Review Preparation**
```
Trigger: T-14 days before Gate G2 (OR Plans Complete)

Process:
  1. Query Shared Task List for G2 deliverables:
     - OR Plan 360: 90% complete (agent-operations, agent-asset-management, agent-hse contributing)
     - Staffing Plan: 100% complete (agent-operations)
     - Training Plan: 85% complete (agent-operations) -- awaiting competency framework
     - Maintenance Strategy: 95% complete (agent-asset-management)
     - HSE Plan: 100% complete (agent-hse)
     - Procurement Plan: 90% complete (agent-contracts-compliance)
     - KPI Dashboard: 100% (orchestrator -- governance)
  2. Verify FM Table compliance on Maintenance Strategy: PASS (all failure modes conform)
  3. Send urgent message to agent-operations: "Training Plan due in 14 days. What is blocking?"
  4. Response: "Competency framework pending OEM input. Expected in 5 days."
  5. Log RFI for OEM competency framework with 5-day deadline
  6. Assess risk: manageable, flag as watch item
  7. Request final deliverable submissions from all agents by T-7
  8. Collect KPI data for balanced scorecard gate assessment
  9. At T-7: collect all deliverables, begin synthesis
  10. Produce Gate G2 Review Package:
      - Executive summary of OR readiness across all 5 workstreams
      - Deliverable status matrix (7 deliverables: 4 green, 2 amber, 1 pending)
      - KPI dashboard with RAG status
      - Key decisions needed
      - Next phase plan with G3 readiness roadmap
  11. Register gate package in document repository as PRJ-GOV-GATE-002-R0
  12. Create executive briefing for gate review meeting
  13. Distribute gate package to all stakeholders per communication plan

Output: Gate G2 package delivered and registered. 4/7 deliverables green, 2 amber, 1 pending.
        Executive briefing prepared. Stakeholders notified.
```

**Example 4: Document Search and Retrieval**
```
Trigger: agent-asset-management requests maintenance strategy documents for Area 300

Command: orchestrate-or-agents doc-search --query "maintenance strategy Area 300" --type "strategy" --area "asset_management"

Process:
  1. Receive search request from agent-asset-management
  2. Query document register for matching documents:
     - Filter: type = strategy, area = asset_management
     - Text search: "maintenance" AND "Area 300"
  3. Results found: 4 documents
     a. PRJ-AM-STR-003-R2 "Area 300 Maintenance Strategy" (current, approved)
     b. PRJ-AM-STR-003-R1 "Area 300 Maintenance Strategy" (superseded)
     c. PRJ-AM-REP-015-R0 "Area 300 Criticality Analysis" (current, draft)
     d. PRJ-AM-REF-008-R0 "OEM Maintenance Recommendations - Area 300" (current, approved)
  4. Return current versions only (exclude superseded R1)
  5. Verify document currency: all within review dates
  6. Provide download links from SharePoint repository
  7. Log search in search analytics for repository improvement

Output:
  "Document Search Results - Request from agent-asset-management
   Query: maintenance strategy Area 300
   Results: 3 current documents
   1. PRJ-AM-STR-003-R2 - Area 300 Maintenance Strategy (Approved, 2025-09-15)
   2. PRJ-AM-REP-015-R0 - Area 300 Criticality Analysis (Draft, 2025-10-01)
   3. PRJ-AM-REF-008-R0 - OEM Maintenance Recommendations (Approved, 2025-08-20)
   Note: Superseded version PRJ-AM-STR-003-R1 excluded. Available on request."
```

---

## MCP Integration & Corporate Pain Points

### Corporate Pain Points Addressed

**From PMO (E-010):**
| Pain Point ID | Description | How Addressed |
|---------------|-------------|---------------|
| M-02 | Lack of integrated progress tracking across workstreams | Unified KPI dashboard with balanced scorecard across all 5 agents |
| D-01 | Delayed decision-making at stage gates | Automated gate readiness assessment and proactive deliverable collection |
| E-01 | Inconsistent reporting across management levels | Three-tier reporting (executive/managerial/operational) from single data source |
| E-03 | No lessons learned capture or application | Structured lessons learned register with domain tagging and future applicability |
| OG-01 | Governance gaps between project and operations teams | Stage-gate framework bridges project execution to operational readiness |
| MP-02 | Portfolio visibility across multiple OR programs | Portfolio aggregation with cross-project dependency tracking |
| MT-01 | Manual KPI collection and reporting | Automated KPI collection from agent outputs with real-time dashboards |

**From Doc Control (E-011):**
| Pain Point ID | Description | How Addressed |
|---------------|-------------|---------------|
| M-07 | Documents scattered across multiple systems | Single document repository with enforced structure and register |
| OG-03 | No single source of truth for document versions | Version control with naming convention enforcement and supersession tracking |
| CE-01 | Vendor documents not tracked or integrated | Vendor documentation management skill with receipt tracking and review workflow |
| CE-04 | Document transmittals not systematically managed | TOP management with acknowledgment tracking |
| D-07 | Outdated documents used for critical decisions | Currency tracking with automated expiry alerts and review scheduling |
| H-03 | Training materials not version-controlled | All training documents under same version control regime |
| A-02 | Asset documentation incomplete at handover | Document completeness checks integrated into gate reviews |
| ISO-03 | Document control not meeting ISO 55001 requirements | Naming conventions, version control, and audit trails aligned with ISO 55001 |

**From Communications (E-012):**
| Pain Point ID | Description | How Addressed |
|---------------|-------------|---------------|
| G-06 | Stakeholder resistance to operational changes | ADKAR-based change management with targeted communications per stakeholder group |
| D-06 | RFIs lost or responses delayed | Structured RFI workflow with tracking, deadlines, and escalation |
| M-06 | Inconsistent messaging across OR program | Central communications function ensures message consistency and alignment |
| H-02 | Low awareness of OR program progress among workforce | Internal newsletters and daily nudges keep all levels informed |
| A-04 | Adoption of new processes and systems lagging | Adoption roadmap with phased rollout and reinforcement tracking |

### MCP Server Integration

| MCP Server | Primary Use | Skill Groups Served |
|------------|-------------|---------------------|
| mcp-sharepoint | Document repository, folder structure, document storage and retrieval | document_management, orchestration |
| mcp-outlook | Email-based communications, RFI distribution, stakeholder notifications | communications, orchestration |
| mcp-teams | Real-time messaging, agent coordination channels, meeting coordination | orchestration, communications |
| mcp-project-online | Schedule integration, critical path data, milestone tracking | orchestration, governance |
| mcp-powerbi | KPI dashboards, executive reporting, portfolio views | governance, orchestration |
| mcp-airtable | Document register, task tracking, RFI log, lessons learned database | document_management, governance |
| mcp-excel | KPI calculations, data analysis, deliverable checklists, FM Table | governance, orchestration |
| mcp-onedrive | Working document storage, draft collaboration, template library | document_management, communications |
| mcp-pdf | Document generation, report formatting, gate review packages | governance, document_management |
| mcp-powerpoint | Executive briefings, gate review presentations, stakeholder decks | communications, governance |
| mcp-forms | Stakeholder feedback surveys, ADKAR assessments, lessons learned capture | communications, governance |

### Integration Workflow
```
orchestrator
  |
  |-- mcp-sharepoint -----> Document Repository (store, retrieve, version)
  |-- mcp-airtable -------> Document Register + Task List + RFI Log
  |-- mcp-project-online --> Schedule & Milestones (read critical path)
  |-- mcp-powerbi ---------> KPI Dashboards (publish balanced scorecard)
  |-- mcp-outlook ---------> Stakeholder Communications + RFI Distribution
  |-- mcp-teams -----------> Agent Coordination + Real-Time Messaging
  |-- mcp-excel -----------> Data Analysis + FM Table Verification
  |-- mcp-onedrive --------> Template Library + Working Drafts
  |-- mcp-pdf -------------> Report Generation + Gate Packages
  |-- mcp-powerpoint ------> Executive Briefings + Presentations
  |-- mcp-forms -----------> Surveys + Assessments + Feedback
```

---

## Reliability Engineering — System Integrity Protocols (v2.1)

These three protocols were added to increase system reliability from ~73.5% to ~98.5% and reduce error amplification from ~2.3x to ~1.1x. They address the root causes identified in the VSC sub-agent architecture research: compounding reliability failures, cross-agent data inconsistency, and undetected error propagation.

### Protocol 1: Shared Project State (Single Source of Truth)

**Problem:** Without a shared state, agents can work with contradictory assumptions (e.g., Operations defines 300 FTEs while Execution models financials for 250 FTEs). This is the #1 cause of error amplification in multi-agent systems.

**Rule:** The orchestrator maintains a `shared_project_state` YAML that is the single authoritative source for all cross-agent facts. Every agent MUST read this state before producing any deliverable. If an agent's output contradicts the shared state, the orchestrator REJECTS the deliverable and returns it with the correct values.

**Schema:**
```yaml
shared_project_state:
  # === IDENTIFIERS ===
  project_name: "Sierra Verde Copper Expansion"
  project_code: "SV-001"
  last_updated: "2025-08-20T15:00:00Z"
  updated_by: "orchestrator"

  # === SCHEDULE FACTS (source: agent-execution) ===
  schedule:
    feed_start: "2025-01-01"
    detailed_eng_start: "2025-07-01"
    construction_start: "2026-01-01"
    or_program_start: "2025-04-01"
    commissioning_start: "2027-07-01"
    commercial_operation: "2028-01-01"
    steady_state_target: "2029-01-01"
    current_spi: 0.94
    source_task: "T-003"

  # === WORKFORCE FACTS (source: agent-operations) ===
  workforce:
    total_fte: 300
    operations_fte: 185
    maintenance_fte: 85
    support_fte: 30
    shift_pattern: "4x3"
    crews: 4
    hiring_start: "2026-03-01"
    full_team_date: "2027-06-01"
    payroll_annual_estimate: 28500000
    source_task: "T-020"

  # === ASSET FACTS (source: agent-asset-management) ===
  assets:
    total_equipment_count: 2847
    critical_equipment_count: 47
    a_critical: 47
    b_important: 312
    c_general: 2488
    cmms_system: "SAP PM"
    functional_locations: 6  # hierarchy levels
    pm_plans_required: 285
    source_task: "T-015"

  # === FINANCIAL FACTS (source: agent-execution) ===
  financials:
    capex_budget: 4500000000
    or_budget: 44000000
    year1_opex_estimate: 180000000
    steady_state_opex: 162000000
    contingency_remaining: 420000
    source_task: "T-035"

  # === HSE FACTS (source: agent-hse) ===
  hse:
    total_permits_required: 48
    permits_approved: 35
    permits_pending: 12
    permits_at_risk: 1
    safety_permits: 15  # owned by agent-hse
    regulatory_permits: 33  # owned by agent-contracts-compliance
    trir_target: 0.50
    source_task: "T-040"

  # === CONTRACTS FACTS (source: agent-contracts-compliance) ===
  contracts:
    om_contracts_total: 22
    contracts_executed: 14
    contracts_in_negotiation: 6
    contracts_pending: 2
    total_contract_value: 35000000
    regulatory_filings_submitted: 28
    regulatory_filings_approved: 21
    source_task: "T-042"

  # === DESIGN FACTS (source: project engineering) ===
  design:
    capacity: "120,000 tpd ore processing"
    product: "Copper cathode, 99.99% Cu"
    design_life_years: 30
    altitude_masl: 3800
    source: "Project Charter"

  # === GATE STATUS (source: orchestrator) ===
  gates:
    current_gate: "G2"
    g1_status: "completed"
    g1_date: "2025-07-10"
    g2_status: "in_progress"
    g2_target: "2025-12-01"
    g2_readiness_pct: 55
    g3_status: "pending"
    g3_target: "2026-08-01"

  # === CHANGE LOG ===
  change_log:
    - date: "2025-08-15"
      field: "workforce.total_fte"
      old_value: 285
      new_value: 300
      reason: "Additional crusher operators required per revised process design"
      approved_by: "orchestrator"
      source_agent: "agent-operations"
      source_task: "T-020-rev2"
```

**Orchestrator Enforcement Rules:**
1. **Pre-Task Injection:** When assigning a task to any agent, the orchestrator includes the relevant subset of `shared_project_state` in the task assignment message. Example: when assigning OPEX modeling to agent-execution, include `workforce`, `assets`, `contracts`, and `design` sections.
2. **Post-Deliverable Verification:** When receiving a deliverable, the orchestrator cross-checks all quantitative values against the shared state. Any discrepancy triggers a rejection with the correct value and a request to revise.
3. **Update Protocol:** Only the orchestrator can update the shared state. When an agent produces new authoritative data (e.g., agent-operations finalizes headcount), the agent sends an Inbox message requesting a state update. The orchestrator verifies the data, updates the state, logs the change, and broadcasts the update to all affected agents.
4. **Conflict Detection:** If two agents submit conflicting values for the same fact (e.g., different headcount assumptions), the orchestrator flags it as a conflict, resolves it based on which agent is the authoritative source for that data domain, and updates the shared state accordingly.

---

### Protocol 2: Idempotent Retry with Verification

**Problem:** If an agent fails or produces a low-quality output, the current system has no automatic recovery mechanism. A single failure becomes a permanent deficiency.

**Mathematical Impact:** With 1 retry, per-agent reliability improves from 95% to 1-(0.05)² = 99.75%. System reliability jumps from 73.5% to 98.5%.

**Retry Protocol:**
```yaml
retry_protocol:
  max_retries: 2
  timeout_per_attempt: "30 minutes"

  verification_method: "output_schema_validation + shared_state_cross_check"

  on_agent_output_received:
    step_1_schema_check:
      description: "Verify output contains all required fields per deliverable type"
      required_fields:
        - deliverable_name
        - skill_group_used
        - contributing_tasks: "[list of task IDs]"
        - quantitative_values: "{key: value pairs}"
        - dependencies_checked: "[list of upstream task IDs verified]"
        - fm_table_verified: "boolean (mandatory for agent-asset-management)"
      on_fail: "RETRY with specific missing field instructions"

    step_2_state_cross_check:
      description: "Verify all quantitative values match shared_project_state"
      check:
        - "workforce numbers match shared_project_state.workforce"
        - "financial figures match shared_project_state.financials"
        - "schedule dates match shared_project_state.schedule"
        - "asset counts match shared_project_state.assets"
        - "permit counts match shared_project_state.hse"
      on_fail: "REJECT with correct values from shared state, request revision"

    step_3_domain_specific_check:
      agent-asset-management:
        - "All failure modes conform to VSC FM Table (Mechanism + Cause)"
        - "RPN values calculated correctly"
        - "SAP PM object references valid"
      agent-execution:
        - "EVM baseline exists (BCWP/BCWS/ACWP not null)"
        - "SPI and CPI calculated from correct baseline"
        - "Financial reconciliation ±5% vs shared_project_state.financials"
      agent-operations:
        - "SOPs reference P&ID numbers, equipment tags, and safety interlocks"
        - "Headcount matches shared_project_state.workforce"
        - "Training modules map to competency framework"
      agent-hse:
        - "Every permit has: authority, application date, expected approval, conditions, expiry"
        - "Risk assessments use standardized 5x5 matrix"
        - "Emergency response procedures tested (drill date recorded)"
      agent-contracts-compliance:
        - "Contracts have: scope, T&Cs, KPIs, penalties, warranty, insurance"
        - "Regulatory filings submitted before deadline"
        - "Permit boundary correct (safety→HSE, regulatory→Contracts)"

  on_failure_sequence:
    retry_1:
      action: "Re-execute same agent with enriched context"
      context_addition: "Include specific error description + correct reference values from shared state + example of expected output format"
      timeout: "30 minutes"

    retry_2:
      action: "Decompose task into smaller sub-tasks"
      context_addition: "Split the original task into 2-3 narrower deliverables that are individually verifiable"
      timeout: "45 minutes"

    retry_3_escalation:
      action: "Escalate to human"
      package:
        - original_task_description
        - all_agent_outputs_received (both attempts)
        - specific_failure_points
        - shared_state_snapshot
        - orchestrator_recommendation
      notify: "Project Director via mcp-outlook"

  on_success:
    - "Mark task as COMPLETED in Shared Task List"
    - "Update shared_project_state if new authoritative data produced"
    - "Broadcast state change to downstream dependent agents"
    - "Log to coordination audit trail"
    - "Update agent reliability KPI"

  kpis:
    first_pass_yield: "% of deliverables accepted without retry (target: >85%)"
    retry_success_rate: "% of retried deliverables accepted on 2nd attempt (target: >95%)"
    escalation_rate: "% of tasks requiring human escalation (target: <2%)"
    mean_time_to_acceptance: "Average time from task completion to orchestrator acceptance"
```

---

### Protocol 3: Cross-Agent Validation Gateway

**Problem:** Without systematic validation, errors in one agent's output propagate to downstream agents and amplify. The orchestrator must act as a quality firewall, not just a router.

**Validation Rules by Agent:**

| Agent | Validation Rule | Check Method | Reject If |
|-------|----------------|--------------|-----------|
| `agent-asset-management` | FM Table compliance | Every failure mode matches VSC FM Table (18 mechanisms × 46 causes) | Any ad-hoc or non-standard failure mode description |
| `agent-asset-management` | Spare parts justification | Each critical spare linked to a failure mode with RPN > threshold | Spare part with no failure mode traceability |
| `agent-asset-management` | SAP data integrity | Functional locations follow 6-level hierarchy, equipment numbers sequential | Broken hierarchy or orphan equipment |
| `agent-execution` | EVM baseline integrity | BCWP, BCWS, ACWP all populated; SPI = BCWP/BCWS; CPI = BCWP/ACWP | Null baseline values or miscalculated indices |
| `agent-execution` | Financial reconciliation | OPEX model totals ±5% of sum of all agent cost inputs | Variance >5% without documented justification |
| `agent-execution` | PSSR completeness | All 7 PSSR sections have status (PASS/GAP/NA); gaps have action items | Missing sections or gaps without remediation plan |
| `agent-operations` | SOP technical completeness | Each SOP references: P&ID number, equipment tags, safety interlocks, emergency actions | SOP missing any of these 4 elements |
| `agent-operations` | Headcount consistency | FTE numbers match `shared_project_state.workforce.total_fte` | Variance >2% without change request |
| `agent-operations` | Training coverage | Every critical competency has a training module assigned with schedule | Gap in critical competency coverage |
| `agent-hse` | Permit coverage | Every required permit tracked with: authority, dates, conditions, status | Missing permit or missing metadata fields |
| `agent-hse` | Risk assessment standardization | All risk assessments use 5×5 matrix with standardized consequence/likelihood scales | Non-standard risk scoring |
| `agent-hse` | Safety-critical action tracking | All safety-critical HAZOP actions tracked with status and deadline | Safety action without deadline or owner |
| `agent-contracts-compliance` | Contract completeness | Every O&M contract has: scope, T&Cs, KPIs, penalties, warranty clause, insurance | Contract missing any required clause |
| `agent-contracts-compliance` | Regulatory timeliness | All regulatory filings submitted ≥30 days before deadline | Filing with <30 days margin (escalate immediately) |
| `agent-contracts-compliance` | Permit boundary correctness | Safety/environmental permits → agent-hse; construction/regulatory → agent-contracts-compliance | Permit assigned to wrong agent |

**Validation Execution Flow:**
```
Agent completes task
    │
    ▼
Orchestrator receives deliverable
    │
    ├─── Step 1: Schema check (required fields present?)
    │         ├── PASS → continue
    │         └── FAIL → Retry Protocol (retry_1)
    │
    ├─── Step 2: Shared State cross-check (numbers match?)
    │         ├── PASS → continue
    │         └── FAIL → Reject with correct values
    │
    ├─── Step 3: Domain-specific validation (see table above)
    │         ├── PASS → continue
    │         └── FAIL → Reject with specific rule violation + correction guidance
    │
    ├─── Step 4: Cross-agent consistency check
    │         ├── Does this output conflict with outputs already accepted from other agents?
    │         ├── PASS → continue
    │         └── CONFLICT → Flag, attempt resolution, escalate if needed
    │
    └─── Step 5: ACCEPT deliverable
              ├── Mark task COMPLETED
              ├── Update shared_project_state if new authoritative data
              ├── Notify downstream agents that dependency is satisfied
              └── Log acceptance in coordination audit trail
```

**Agent-Side Guardrails (embedded in each agent's awareness):**

Each of the 5 specialist agents has been configured with domain-specific guardrails — mandatory self-checks that the agent must perform BEFORE submitting any deliverable to the orchestrator. These guardrails reduce the first-pass rejection rate by catching errors at the source.

| Agent | Guardrail | Pre-Submission Check |
|-------|-----------|---------------------|
| `agent-operations` | G-OPS-1: Headcount consistency | Verify FTE count matches latest shared state before submitting any staffing deliverable |
| `agent-operations` | G-OPS-2: SOP completeness | Every SOP must contain P&ID ref, equipment tags, safety interlocks, emergency actions |
| `agent-operations` | G-OPS-3: Training-competency mapping | Every critical role has ≥1 training module assigned with specific schedule dates |
| `agent-asset-management` | G-AM-1: FM Table conformance | NEVER use free-text failure modes — every entry must match VSC FM Table (Mechanism + Cause) |
| `agent-asset-management` | G-AM-2: Spare parts traceability | Every critical spare part must link to ≥1 failure mode with documented RPN |
| `agent-asset-management` | G-AM-3: SAP hierarchy integrity | Every equipment record must attach to a valid functional location in the 6-level hierarchy |
| `agent-hse` | G-HSE-1: Permit metadata completeness | Every permit entry must have: authority, application date, expected approval, conditions, expiry |
| `agent-hse` | G-HSE-2: Safety action ownership | NEVER submit a safety-critical action without assigned owner AND deadline |
| `agent-hse` | G-HSE-3: Risk matrix standardization | All risk assessments must use the 5×5 matrix — no custom scales |
| `agent-contracts-compliance` | G-CC-1: Contract clause completeness | NEVER submit a contract review without checking: scope, T&Cs, KPIs, penalties, warranty, insurance |
| `agent-contracts-compliance` | G-CC-2: Filing timeliness | STOP and ESCALATE if any regulatory filing has <30 days to deadline |
| `agent-contracts-compliance` | G-CC-3: Permit boundary | Safety/environmental permits → agent-hse. Construction/regulatory → this agent. VERIFY before tracking |
| `agent-execution` | G-EXE-1: EVM baseline existence | NEVER report EVM metrics without populated BCWP/BCWS/ACWP baseline |
| `agent-execution` | G-EXE-2: Financial reconciliation | ALWAYS verify OPEX model totals ±5% of sum of agent cost inputs before submission |
| `agent-execution` | G-EXE-3: PSSR completeness | NEVER submit PSSR package with any section status = UNKNOWN — all must be PASS, GAP, or NA |

---

### Protocol 4: Dependency Graph Verification (Pre-Assignment Check)

**Problem:** When the orchestrator assigns a downstream task without verifying that upstream deliverables are truly complete AND valid, errors cascade. Example: agent-operations delivers an incomplete Operating Model (missing shift schedule), and agent-asset-management receives a task to design maintenance strategy based on that model — producing a strategy for the wrong shift pattern.

**Rule:** Before releasing ANY task to an agent, the orchestrator MUST verify the full dependency chain — not just that upstream tasks are marked "completed", but that their outputs passed validation.

**Pre-Assignment Verification Protocol:**
```yaml
pre_assignment_check:
  trigger: "Before changing any task status from 'pending' to 'in_progress'"

  step_1_dependency_status:
    check: "All upstream dependencies have status = 'completed'"
    on_fail: "HOLD task in 'pending'. Log reason: 'Upstream dependency {task_id} not yet completed.'"

  step_2_dependency_validation:
    check: "All upstream outputs passed the Validation Gateway (Protocol 3)"
    on_fail: "HOLD task in 'pending'. Log reason: 'Upstream {task_id} completed but output rejected by validation. Awaiting revision.'"

  step_3_state_freshness:
    check: "shared_project_state fields relevant to this task were updated within last 30 days"
    on_fail: "WARN. Request state refresh from authoritative agent before proceeding. Tag task as 'state_refresh_needed'."

  step_4_input_packaging:
    action: "Package all validated upstream outputs + relevant shared_project_state subset into the task assignment message"
    rationale: "Agent receives exactly the data it needs — no stale data, no missing inputs, no need to assume"

  step_5_release:
    action: "Change task status to 'in_progress', send assignment via Inbox with full input package"
    log: "Dependency chain verified: {list of upstream task IDs and their validation status}"
```

**Dependency Chain Examples:**

```
CHAIN 1: Operations → Asset Management → Execution
  T-008 (Operating Model) ──verified──→ T-015 (Maintenance Strategy) ──verified──→ T-035 (OPEX Model)
  Orchestrator verifies: T-008 output includes shift_pattern + headcount → PASS
  Then verifies: T-008 headcount matches shared_project_state.workforce → PASS
  Only THEN releases T-015 to agent-asset-management with T-008 output included

CHAIN 2: HSE → Contracts → Execution
  T-040 (Permit Register) ──verified──→ T-042 (Contract Plan) ──verified──→ T-050 (Commissioning Schedule)
  Orchestrator verifies: T-040 includes all required permits with metadata → PASS
  Then verifies: T-040 permit counts match shared_project_state.hse → PASS
  Only THEN releases T-042 to agent-contracts-compliance with T-040 output included

CHAIN 3: Cross-Agent Convergence (Gate Package)
  T-008 (Operations) ─────┐
  T-015 (Asset Mgmt) ─────┤
  T-040 (HSE) ────────────┼──verified──→ T-060 (Gate G2 Package synthesis)
  T-042 (Contracts) ──────┤
  T-035 (Execution) ──────┘
  ALL 5 upstream outputs must pass validation BEFORE synthesis begins
```

**Impact:** This protocol prevents the most damaging class of error — cascading wrong assumptions. Without it, a single incorrect headcount figure from Operations propagates to Asset Management (wrong maintenance crew sizing), then to Execution (wrong OPEX), then to the Gate Package (wrong cost figure presented to the Project Director).

---

### Protocol 5: Progressive Context Loading

**Problem:** Each agent's CLAUDE.md file is 750-1,140 lines. Loading the entire file for every interaction wastes tokens and increases the risk of attention dilution — the agent may confuse context from one skill group with another.

**Solution:** Define a base context (always loaded) and on-demand context (loaded only when the relevant skill group is activated). The orchestrator specifies which skill group is needed in the task assignment, and the agent loads only the relevant section.

**Progressive Loading Schema per Agent:**

```yaml
progressive_context:
  agent-operations:
    base_context:  # ~120 lines — always loaded
      sections:
        - "Purpose"
        - "Skill Groups (routing table only, not skill content)"
        - "Guardrails"
        - "VSC Failure Modes Table"
        - "Inter-Agent Dependencies"
      estimated_tokens: 2500
    on_demand:
      operations:  # loaded when task targets this skill group
        skills: [generate-operating-procedures.md, model-rampup-trajectory.md, calculate-operational-kpis.md, create-operations-manual.md, create-shutdown-plan.md]
        context_fragments: ["shift patterns", "operating model", "SOP standards"]
        estimated_tokens: 4000
      workforce:  # loaded when task targets this skill group
        skills: [model-staffing-requirements.md, track-competency-matrix.md, capture-expert-knowledge.md, plan-training-program.md, create-staffing-plan.md, create-org-design.md, create-training-plan.md]
        context_fragments: ["labor market", "competency framework", "hiring timeline"]
        estimated_tokens: 5000
      culture_hris:
        skills: [create-change-mgmt-plan.md]
        context_fragments: ["ADKAR model", "culture assessment"]
        estimated_tokens: 1500

  agent-asset-management:
    base_context:  # ~150 lines
      sections: ["Purpose", "Skill Groups", "Guardrails", "VSC FM Table (FULL — primary user)", "Inter-Agent Dependencies"]
      estimated_tokens: 3500
    on_demand:
      maintenance_strategy:
        skills: [develop-maintenance-strategy.md, optimize-pm-program.md, analyze-failure-patterns.md, benchmark-maintenance-kpis.md, create-maintenance-manual.md, analyze-equipment-criticality.md, analyze-reliability.md]
        context_fragments: ["RCM process", "FMECA methodology", "criticality matrix"]
        estimated_tokens: 6000
      work_management:
        skills: [create-work-management-manual.md]
        context_fragments: ["6-step cycle", "SMRP KPIs", "ISO 55000 Clause 8"]
        estimated_tokens: 3000
      sap_implementation:
        skills: [design-sap-pm-blueprint.md, load-sap-master-data.md]
        context_fragments: ["SAP PM config", "functional locations", "master data governance"]
        estimated_tokens: 5000
      spare_parts_inventory:
        skills: [generate-initial-spares-list.md, optimize-mro-inventory.md, create-spare-parts-strategy.md, track-long-lead-procurement.md]
        context_fragments: ["VED/ABC", "Min-Max", "long-lead items"]
        estimated_tokens: 4000
      turnaround:
        skills: [plan-turnaround.md]
        context_fragments: ["shutdown planning", "critical path", "turnaround scope"]
        estimated_tokens: 2000

  agent-hse:
    base_context:  # ~100 lines
      sections: ["Purpose", "Skill Groups", "Permit Ownership Boundary", "Guardrails", "VSC FM Table", "Inter-Agent Dependencies"]
      estimated_tokens: 2500
    on_demand:
      process_safety:
        skills: [create-risk-assessment.md, track-incident-learnings.md, audit-compliance-readiness.md, embed-risk-based-decisions.md]
        context_fragments: ["HAZOP", "PSM", "PTW system", "5x5 risk matrix"]
        estimated_tokens: 4000
      environmental:
        skills: [generate-esg-report.md, map-regulatory-requirements.md]
        context_fragments: ["ESG framework", "EIA conditions", "monitoring protocols"]
        estimated_tokens: 3000
      permits_safety_environmental:
        skills: [map-regulatory-requirements.md]
        context_fragments: ["SERNAGEOMIN DS 132", "SMA", "permit tracking"]
        estimated_tokens: 2500

  agent-contracts-compliance:
    base_context:  # ~110 lines
      sections: ["Purpose", "Skill Groups", "Guardrails", "VSC FM Table", "Error Handling", "Inter-Agent Dependencies"]
      estimated_tokens: 2500
    on_demand:
      procurement:
        skills: [create-contract-scope.md, track-long-lead-procurement.md]
        context_fragments: ["RFP process", "vendor evaluation", "MRO purchasing"]
        estimated_tokens: 4000
      legal_compliance:
        skills: [audit-compliance-readiness.md, map-regulatory-requirements.md]
        context_fragments: ["T&C review", "labor law", "compliance matrix"]
        estimated_tokens: 3500
      permits_regulatory:
        skills: [map-regulatory-requirements.md]
        context_fragments: ["construction permits", "operating licenses", "filing deadlines"]
        estimated_tokens: 2500

  agent-execution:
    base_context:  # ~180 lines
      sections: ["Purpose", "Skill Groups", "Guardrails", "VSC FM Table", "Inter-Agent Dependencies"]
      estimated_tokens: 4000
    on_demand:
      project_management:
        skills: [track-or-deliverables.md, create-or-plan.md]
        context_fragments: ["WBS integration", "EPC interface", "handover protocols"]
        estimated_tokens: 3500
      project_controls:
        skills: [generate-performance-report.md, analyze-scenarios.md]
        context_fragments: ["EVM formulas", "BCWP/BCWS/ACWP", "Monte Carlo", "change control"]
        estimated_tokens: 5000
      finance:
        skills: [model-opex-budget.md, analyze-lifecycle-cost.md, analyze-scenarios.md]
        context_fragments: ["OPEX modeling", "business case", "NPV/IRR", "cost center structure"]
        estimated_tokens: 4500
      construction:
        skills: [create-commissioning-plan.md]
        context_fragments: ["operability review", "preservation", "MC verification", "punch list"]
        estimated_tokens: 3500
      commissioning:
        skills: [prepare-pssr-package.md, model-commissioning-sequence.md, track-punchlist-items.md, manage-loop-checking.md]
        context_fragments: ["PSSR 7 sections", "STP management", "TCCC", "loop checking"]
        estimated_tokens: 5000
```

**Orchestrator Implementation:**
When the orchestrator assigns a task, it specifies the target skill group in the assignment message:

```yaml
# Example task assignment with context loading directive
task_assignment:
  task_id: "T-015"
  assigned_to: "agent-asset-management"
  skill_group: "maintenance_strategy"  # ← agent loads ONLY this context
  context_directive: "Load base_context + maintenance_strategy on-demand context. Do NOT load sap_implementation or spare_parts_inventory context for this task."
  shared_state_subset:  # only relevant fields
    - "assets"
    - "schedule"
    - "workforce.shift_pattern"
```

**Token Savings Estimate:**
| Agent | Full context (tokens) | Base + 1 skill group (tokens) | Savings |
|-------|----------------------|------------------------------|---------|
| agent-operations | ~11,500 | ~6,500-7,500 | 35-43% |
| agent-asset-management | ~23,500 | ~6,500-9,500 | 60-72% |
| agent-hse | ~12,000 | ~5,000-6,500 | 46-58% |
| agent-contracts-compliance | ~12,500 | ~5,000-7,000 | 44-60% |
| agent-execution | ~24,000 | ~7,500-9,000 | 63-69% |

**Impact on Reliability:** Less context loaded per interaction = less attention dilution = fewer errors from cross-contamination between skill groups. Google's research shows tool-heavy agents (>10 tools) suffer 2-6x performance penalty — progressive loading keeps each interaction focused on 3-7 relevant skills instead of 15+.

---

### Protocol 6: Canary Output Verification

**Problem:** LLM agents can "fake it" — claiming task completion without actually performing the work, or producing outputs that look correct superficially but contain fabricated data. This problem increases with task complexity and distance from human oversight (exactly the conditions in a multi-agent system). The Anthropic community documented a case where an agent claimed to process 6,000 articles but only processed 4.

**Solution:** Periodically verify agent outputs with targeted "canary questions" that require the agent to demonstrate genuine knowledge of its own output. Discrepancies between the canary response and the actual deliverable indicate fabrication or confusion.

**Canary Verification Protocol:**
```yaml
canary_protocol:
  frequency: "Every 5th completed task per agent (minimum once per week per agent)"
  method: "Post-deliverable verification query"
  escalation_threshold: "Discrepancy rate >20% triggers enhanced monitoring"

  canary_questions_by_agent:
    agent-operations:
      - question: "How many SOPs did you produce in this deliverable? List the top 3 by equipment criticality."
        verify_against: "Count of SOP documents in deliverable + equipment criticality ranking"
      - question: "What is the total headcount in your latest staffing plan? Break down by shift crew."
        verify_against: "shared_project_state.workforce figures + shift composition detail"
      - question: "Which competency has the largest training gap in the current workforce?"
        verify_against: "Competency gap analysis in the training plan deliverable"

    agent-asset-management:
      - question: "How many failure modes did you identify in this FMECA? What are the top 3 by RPN?"
        verify_against: "FM count in deliverable + RPN ranking"
      - question: "List 3 specific VSC FM Table codes you used and which equipment they apply to."
        verify_against: "FM Table cross-reference (must be valid Mechanism + Cause codes)"
      - question: "What is the current PM compliance rate and how many PM plans are loaded in SAP?"
        verify_against: "KPI values in deliverable + shared_project_state.assets.pm_plans_required"

    agent-hse:
      - question: "How many permits are currently pending? Which one has the nearest deadline?"
        verify_against: "Permit register in deliverable + shared_project_state.hse.permits_pending"
      - question: "What was the root cause of the last incident you analyzed? What mechanism from the FM Table applies?"
        verify_against: "RCA report + FM Table code verification"
      - question: "How many open HAZOP actions are there? Which is the most overdue?"
        verify_against: "HAZOP action tracker in deliverable"

    agent-contracts-compliance:
      - question: "How many O&M contracts are currently in negotiation? What is the largest by value?"
        verify_against: "Contract register + shared_project_state.contracts figures"
      - question: "Which regulatory filing has the nearest deadline? How many days remain?"
        verify_against: "Filing tracker + calendar calculation"
      - question: "What is the total contract value across all executed contracts?"
        verify_against: "shared_project_state.contracts.total_contract_value"

    agent-execution:
      - question: "What is the current SPI and CPI? Are they calculated from the approved baseline?"
        verify_against: "EVM report values + baseline reference"
      - question: "How many PSSR sections have status GAP? What are the remediation deadlines?"
        verify_against: "PSSR package section-by-section status"
      - question: "What is the Year-1 OPEX estimate and how does it compare to the benchmark?"
        verify_against: "OPEX model + industry benchmark range in deliverable"

  response_evaluation:
    match_criteria:
      - "Quantitative values within ±10% of deliverable content"
      - "Named items (equipment, permits, contracts) match deliverable exactly"
      - "FM Table codes are valid (exist in the 18×46 matrix)"
      - "Dates and deadlines match deliverable and shared state"

    scoring:
      full_match: "All canary answers consistent with deliverable — agent output TRUSTED"
      partial_match: "1 discrepancy found — LOG warning, continue monitoring"
      significant_discrepancy: "2+ discrepancies — TRIGGER enhanced monitoring mode"
      fabrication_detected: "Fundamental mismatch (e.g., claims 50 SOPs but deliverable has 12) — REJECT deliverable, re-execute task, ESCALATE"

  enhanced_monitoring_mode:
    trigger: "Discrepancy rate >20% for any agent over a 2-week window"
    actions:
      - "Increase canary frequency to every 2nd task (instead of every 5th)"
      - "Add mandatory intermediate checkpoints (agent reports progress at 50% before completing)"
      - "Require deliverables to include a self-audit section summarizing key quantitative values"
      - "Alert human supervisor after 1 week of enhanced monitoring"
    exit_criteria: "5 consecutive tasks pass canary verification → return to standard frequency"
```

**Impact:** Canary verification catches fabrication and confusion BEFORE the output enters the dependency chain. Without it, a fabricated FMECA with invented failure modes could propagate into PM plans, spare parts lists, SAP configuration, and training programs — each downstream deliverable amplifying the original error. With canary checks, the fabricated output is caught at the source, rejected, and re-executed.

---

### Protocol 7: Structured Output Schemas (Deliverable Standardization)

**Problem:** Without standardized output formats, agents produce deliverables in inconsistent structures, making validation harder and increasing the chance that critical fields are omitted. The orchestrator's Validation Gateway (Protocol 3) requires specific fields — but if agents don't know the expected schema, they fail validation more often, triggering unnecessary retries.

**Solution:** Define mandatory output schemas for each deliverable type. Agents MUST include these fields in every output. The orchestrator validates against these schemas in Step 1 of the Validation Gateway.

**Universal Output Header (required on EVERY deliverable):**
```yaml
output_header:
  deliverable_name: "string — descriptive name matching Shared Task List"
  task_id: "string — T-XXX from Shared Task List"
  agent_id: "string — agent producing this deliverable"
  skill_group: "string — which skill group was active"
  skills_invoked: ["list of skill .md files used"]
  gate: "string — G1/G2/G3/G4 this deliverable targets"
  version: "string — major.minor"
  date_produced: "ISO 8601 datetime"
  dependencies_verified:
    - task_id: "T-XXX"
      status: "completed"
      validation_status: "passed"
  shared_state_values_used:
    # List key values from shared_project_state that this deliverable relies on
    - field: "workforce.total_fte"
      value: 300
    - field: "schedule.commissioning_start"
      value: "2027-07-01"
  fm_table_verified: "boolean — true if deliverable contains failure mode data"
  guardrails_checked: ["G-XX-1", "G-XX-2", "..."]  # list of guardrails self-checked
```

**Domain-Specific Output Schemas:**

```yaml
schema_operations_sop:
  inherits: "output_header"
  additional_fields:
    sop_id: "string — SOP-AAA-NNN"
    equipment_tags: ["list of equipment tag numbers"]
    pid_references: ["list of P&ID drawing numbers"]
    safety_interlocks: ["list of interlock tag numbers with trip actions"]
    emergency_actions: ["list of emergency shutdown steps"]
    training_module_linked: "string — training module ID that covers this SOP"
    review_cycle: "integer — months between reviews"

schema_asset_management_fmeca:
  inherits: "output_header"
  additional_fields:
    equipment_count: "integer"
    failure_modes_count: "integer"
    top_5_by_rpn:
      - equipment: "string"
        mechanism_code: "string — from 18 VSC mechanisms"
        cause_code: "string — from 46 VSC causes"
        rpn: "integer"
    criticality_distribution:
      a_critical: "integer"
      b_important: "integer"
      c_general: "integer"
    sap_catalog_profiles_created: "integer"

schema_execution_evm:
  inherits: "output_header"
  additional_fields:
    reporting_period: "string — YYYY-MM"
    wbs_elements_tracked: "integer"
    metrics:
      bcws: "number"
      bcwp: "number"
      acwp: "number"
      spi: "number (calculated, not input)"
      cpi: "number (calculated, not input)"
      eac: "number"
      etc: "number"
      vac: "number"
    baseline_reference: "string — baseline ID and approval date"
    cpi_misleading_flag: "boolean — true if CPI>1.0 AND SPI<0.90"
    variance_explanations: ["list of WBS elements with variance >10%"]
    recovery_plan: "string — if SPI < 0.90"

schema_hse_permit_register:
  inherits: "output_header"
  additional_fields:
    total_permits: "integer"
    permits_by_status:
      approved: "integer"
      pending: "integer"
      at_risk: "integer"
    each_permit:
      - permit_name: "string"
        authority: "string"
        application_date: "date"
        expected_approval: "date"
        conditions: ["list"]
        expiry: "date"
        status: "string"
        owner_agent: "string — agent-hse or agent-contracts-compliance"
    boundary_verified: "boolean — all permits assigned to correct agent"
    critical_path_permits: ["list of permits on commissioning critical path"]

schema_contracts_contract_review:
  inherits: "output_header"
  additional_fields:
    contract_id: "string"
    vendor: "string"
    contract_value: "number"
    clause_checklist:
      scope_of_work: "present | missing"
      terms_conditions: "present | missing"
      kpis_slas: "present | missing"
      penalties: "present | missing"
      warranty: "present | missing"
      insurance: "present | missing"
    risk_assessment: "string — overall risk level"
    recommendation: "string — approve | revise | reject"
    financial_reconciliation: "number — variance vs shared_project_state"
```

**Orchestrator Validation Against Schemas:**
When the orchestrator receives a deliverable, Step 1 of the Validation Gateway now checks:
1. Universal output header present with all required fields? → If NO, immediate REJECT
2. Domain-specific schema fields present? → If NO, REJECT with specific missing fields listed
3. `shared_state_values_used` matches current `shared_project_state`? → If NO, REJECT with correct values
4. `guardrails_checked` list includes all required guardrails for this agent? → If NO, REJECT

This structured approach reduces first-pass rejection rate from ~80% to ~95% because agents know exactly what format is expected.

---

### Reliability Impact Summary (Complete — v2.2)

| Metric | v2.0 (baseline) | v2.1 (Protocols 1-3) | v2.2 (Protocols 1-7) | Total Improvement |
|--------|-----------------|---------------------|---------------------|-------------------|
| Per-agent reliability | 95% | 99.75% (retry) | 99.75% | +5% |
| System reliability | 73.5% | 98.5% | **98.5%** | **+34%** |
| Error amplification | ~2.3x | ~1.1x | **~1.05x** | **-54%** |
| Cross-agent data inconsistency | Undetected | Prevented | **Prevented + verified** | Eliminated |
| First-pass deliverable quality | ~80% | ~95% (guardrails) | **~97%** (schemas + guardrails) | **+21%** |
| Undetected error propagation | Possible | Blocked (gateway) | **Blocked + canary verified** | Eliminated |
| Token efficiency per interaction | Baseline | Baseline | **~40-60% reduction** (progressive loading) | **-50% avg** |
| Fabrication/hallucination detection | None | None | **Active** (canary protocol) | New capability |
| Cascade prevention | None | Partial (shared state) | **Complete** (dependency verification) | New capability |

---

## Architecture Reference

This orchestrator is entity 1 of 6 in the VSC OR Multi-Agent System v2.0:

| # | Entity | Scope | Former Agents Consolidated |
|---|--------|-------|--------------------------|
| 1 | **orchestrate-or-agents** (this file) | Orchestration + PMO Governance + Doc Control + Communications | E-001 + E-010 + E-011 + E-012 |
| 2 | agent-operations | Operations + Workforce + Culture + HRIS | -- |
| 3 | agent-asset-management | Maintenance + Spare Parts + SAP + Turnaround | -- |
| 4 | agent-hse | HSE + Safety/Environmental Permits | -- |
| 5 | agent-contracts-compliance | Procurement + Legal + Regulatory Permits | -- |
| 6 | agent-execution | Project + ProjectControl + Finance + Construction + Commissioning | -- |

---

*End of Skill: Orchestrate OR Agents (E-001 v2.2.0) — 7 Reliability Protocols Active*
