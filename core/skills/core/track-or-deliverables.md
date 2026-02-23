# Track OR Deliverables

## Skill ID: H-02
## Version: 1.0.0
## Category: H. Orchestration
## Priority: P0 - Critical

## Purpose

Provide granular, real-time tracking of all Operational Readiness deliverables across every OR domain for a capital project. This skill maintains the OR Deliverable Register -- a comprehensive database of 500+ items per project -- calculates completion percentages by domain, by gate, and by criticality level, generates RAG (Red/Amber/Green) dashboards with trend analysis, and triggers automatic escalation alerts when deliverables fall behind schedule or are at risk of missing gate deadlines.

This skill is the "nervous system" of the OR program -- it senses the state of every deliverable, computes the health of every domain, and transmits signals (alerts, reports, dashboards) that enable timely intervention. Without this level of granular tracking, OR programs operate blind: stakeholders rely on anecdotal updates, problems are discovered too late for corrective action, and gate reviews are based on incomplete or stale data.

The consequences of poor OR deliverable tracking are well-documented. Deloitte reports that 60%+ of OR deliverables have deficiencies at handover (Pain Point D-01), largely because no systematic tracking mechanism existed to detect and correct these gaps during the project lifecycle. Accenture identifies the "rush to ready" phenomenon (Pain Point A-04) where the absence of tracking creates a false sense of progress until the commissioning deadline reveals massive gaps. IPA/CII research on late definition of operational requirements (Pain Point MP-02) shows that without structured tracking, requirements are defined too late and deliverables compress into an unachievable final sprint.

The OR Deliverable Register managed by this skill contains every deliverable across all 12+ OR domains, with status tracking at the individual item level. It supports views by domain, by gate, by priority, by status, by owner, and by timeline -- enabling stakeholders at every level to see exactly what is on track, what is at risk, and what requires intervention.

## Intent & Specification

**Problem:** OR programs for capital projects generate hundreds of deliverables across multiple management domains. Without granular tracking:

- **Invisible gaps accumulate silently.** Individual deliverables slip by days or weeks without detection. By the time the gap is noticed, recovery requires heroic effort or schedule extension. Deloitte's finding of 60%+ deficiencies at handover (D-01) results directly from this lack of visibility.
- **Domain-level roll-ups mask item-level problems.** A domain might report "80% complete" while the remaining 20% includes the most critical items. Aggregated metrics without drill-down capability create dangerous blind spots.
- **No early warning system.** Without trend analysis, a deliverable that is 3 days late this week becomes 2 weeks late next month. The absence of automated alerts means problems are discovered during gate reviews rather than during the week they first appeared.
- **Inconsistent tracking across domains.** Each domain lead tracks deliverables differently -- some use spreadsheets, some use memory, some do not track at all. This makes program-level synthesis impossible.
- **Gate reviews become data-gathering exercises.** Instead of decision-making sessions, gate reviews spend their time establishing baseline facts ("what is actually done?") because no reliable, current data source exists.
- **Accountability gaps.** Without clear ownership, due dates, and status visibility, accountability is diffused. When everything is everyone's responsibility, nothing gets done on time.

**Success Criteria:**
- Single source of truth for all OR deliverable status across all domains
- 500+ deliverables tracked per project with individual-item granularity
- Completion percentages calculated automatically, weighted by criticality
- RAG status computed per domain using objective criteria (not subjective assessment)
- Trend analysis shows direction of progress (improving, stable, declining) over time
- Automatic escalation alerts when deliverables are at risk (>5 days overdue or trending late)
- Dashboard refreshed at minimum weekly, with on-demand capability
- Any stakeholder can determine the status of any deliverable within 30 seconds
- Gate readiness assessment generated automatically from deliverable data
- Zero deliverables "lost" or untracked throughout the program lifecycle

**Constraints:**
- Must support 500-5,000+ deliverables per project without performance degradation
- Must handle multiple simultaneous projects with independent tracking
- Must integrate with mcp-airtable as the primary database and mcp-sharepoint as the document store
- Must calculate weighted completion (critical items weighted higher than medium-priority items)
- Must support custom status workflows per client (some clients use 5-stage, some use 7-stage)
- Must produce outputs compatible with Power BI dashboards via mcp-powerbi
- Must support bilingual operation (English/Spanish) for Latin American projects
- Must maintain full audit trail of status changes (who changed, when, from what to what)
- Must handle deliverables that are added, removed, or re-scoped during the program
- Must not require specialist agents to use any tool beyond updating their task status

## Trigger / Invocation

**Primary Triggers:**
- `track-or-deliverables status --project [name]` (full program status summary)
- `track-or-deliverables domain --project [name] --domain [domain]` (domain-specific detail)
- `track-or-deliverables gate --project [name] --gate [G1-G6]` (gate readiness view)
- `track-or-deliverables update --project [name] --deliverable [id] --status [status]`
- `track-or-deliverables add --project [name] --deliverables [file]` (bulk add)
- `track-or-deliverables trend --project [name] --period [weeks]` (trend analysis)
- `track-or-deliverables alerts --project [name]` (current alerts and escalations)
- `track-or-deliverables export --project [name] --format [xlsx|csv|json]`

**Aliases:** `/track-deliverables`, `/or-tracker`, `/deliverable-status`

**Automatic Triggers:**
- Weekly status cycle (every Monday 06:00 local time -- runs before weekly report generation)
- Agent completes a task in the Shared Task List (triggers deliverable status update)
- Deliverable due date approaching (T-14, T-7, T-3 days automatic reminders)
- Deliverable becomes overdue (T+1 day triggers first alert)
- Deliverable overdue >5 days (triggers escalation)
- Gate approaching (T-30, T-14 days triggers gate readiness assessment)
- Scope change approved (triggers WBS update and deliverable re-baseline)

**Event-Driven Triggers:**
- Orchestrator requests status summary for reporting
- Stakeholder queries specific deliverable status
- New deliverables added to project scope
- Deliverables removed or de-scoped
- Dependency changes affecting deliverable sequencing
- Schedule re-baseline requiring deliverable timeline update

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| OR Deliverable Register | mcp-airtable | Yes | Master database of all OR deliverables (from orchestrate-or-program WBS) |
| Agent Task Status Updates | All specialist agents / Shared Task List | Yes | Current status of assigned deliverables from each domain agent |
| Project Schedule Milestones | mcp-project-online | Yes | Gate dates and key project milestones for timeline alignment |
| Deliverable Priority/Criticality | OR WBS (from orchestrate-or-program) | Yes | Criticality classification per deliverable (Critical, High, Medium) |
| RAG Criteria Configuration | Project config | Yes | Thresholds for RAG status computation (default: VSC standard) |
| Previous Tracking Data | mcp-airtable (historical) | No | Prior status snapshots for trend analysis |
| Scope Change Notifications | Orchestrator | No | Changes to deliverable scope (additions, removals, modifications) |
| Client-Specific Requirements | Client governance framework | No | Custom status stages, reporting formats, escalation protocols |

**Deliverable Register Schema:**
```yaml
deliverable:
  id: "DEL-OPS-001"
  domain: "Operations"
  sub_domain: "Operating Model"
  title: "Operating Model Document"
  description: "Complete operating model defining shift structure, crew composition, operating philosophy, and performance targets"
  gate: "G2"
  criticality: "critical"  # critical | high | medium
  weight: 3  # 3=critical, 2=high, 1=medium (for weighted calculations)
  owner_agent: "agent-operations"
  owner_person: "Operations Manager"
  status: "in_progress"  # not_started | in_progress | under_review | approved | complete | blocked | cancelled | deferred
  progress_pct: 65
  planned_start: "2025-07-01"
  actual_start: "2025-07-05"
  planned_end: "2025-10-15"
  forecast_end: "2025-10-22"
  actual_end: null
  dependencies:
    upstream:
      - id: "DEL-PRJ-003"
        title: "Process Design Basis"
        status: "complete"
    downstream:
      - id: "DEL-HR-002"
        title: "Staffing Plan"
        status: "waiting"
  acceptance_criteria:
    - "Defines shift pattern for 24/7 operation"
    - "Crew composition validated by production simulation"
    - "Approved by Operations Manager and VP Operations"
  blockers: []
  notes: "Pending final process design parameters from EPC"
  attachments:
    - "OPS-001-Draft-v3.docx"
  history:
    - date: "2025-07-05"
      field: "status"
      from: "not_started"
      to: "in_progress"
      by: "agent-operations"
    - date: "2025-09-15"
      field: "progress_pct"
      from: 40
      to: 65
      by: "agent-operations"
  last_updated: "2025-09-15T14:30:00Z"
```

**RAG Criteria Configuration:**
```yaml
rag_criteria:
  deliverable_level:
    green:
      - forecast_end <= planned_end
      - progress_pct >= expected_progress_pct(current_date)
      - status not in ["blocked"]
    amber:
      - forecast_end > planned_end AND forecast_end <= planned_end + 14_days
      - OR progress_pct between 75-99% of expected_progress_pct
      - OR status == "blocked" for < 7 days
    red:
      - forecast_end > planned_end + 14_days
      - OR progress_pct < 75% of expected_progress_pct
      - OR status == "blocked" for >= 7 days
      - OR gate deadline at risk

  domain_level:
    green:
      - weighted_completion >= 90% of plan for current date
      - no critical deliverables in RED status
      - no deliverables overdue > 7 days
    amber:
      - weighted_completion 70-89% of plan for current date
      - OR up to 2 critical deliverables in RED
      - OR deliverables overdue 7-21 days
    red:
      - weighted_completion < 70% of plan for current date
      - OR > 2 critical deliverables in RED
      - OR deliverables overdue > 21 days
      - OR gate deliverable at risk of non-completion

  program_level:
    green: all domains GREEN or max 2 AMBER
    amber: max 1 RED or more than 2 AMBER
    red: more than 1 RED or any domain CRITICAL-RED

escalation_rules:
  level_1_alert:
    trigger: "deliverable 5+ days overdue OR trending to miss date by >7 days"
    action: "email alert to domain lead via mcp-outlook"
    frequency: "once, then weekly reminder"
  level_2_escalation:
    trigger: "deliverable 14+ days overdue OR critical deliverable at risk"
    action: "email to OR Manager + Teams notification in escalation channel"
    frequency: "every 3 days"
  level_3_executive:
    trigger: "deliverable 21+ days overdue OR gate deliverable at risk"
    action: "email to Project Director + dashboard highlight"
    frequency: "every 2 days"
  level_4_crisis:
    trigger: "multiple gate deliverables at risk OR domain in RED for 4+ weeks"
    action: "executive briefing request + recovery plan requirement"
    frequency: "daily until resolved"
```

## Output Specification

### 1. Deliverable Register (Airtable Database)
**Location:** mcp-airtable, base `OR-{ProjectCode}`
**Tables:**
- **Deliverables:** Master table with all 500+ items per schema above
- **History:** Audit trail of all status changes
- **Alerts:** Active alerts and escalations
- **Snapshots:** Weekly status snapshots for trend analysis

### 2. Completion Dashboard Data
**Format:** JSON payload for mcp-powerbi

```json
{
  "project": "Sierra Verde Copper Expansion",
  "snapshot_date": "2025-09-15",
  "program_level": {
    "total_deliverables": 540,
    "completed": 245,
    "in_progress": 185,
    "under_review": 35,
    "not_started": 52,
    "blocked": 12,
    "cancelled": 5,
    "deferred": 6,
    "overall_completion_pct": 45.4,
    "weighted_completion_pct": 48.2,
    "plan_completion_pct": 47.0,
    "schedule_performance_index": 1.03,
    "rag_status": "GREEN",
    "trend": "improving",
    "trend_data": [
      {"week": "W35", "completion": 39.2},
      {"week": "W36", "completion": 41.1},
      {"week": "W37", "completion": 43.8},
      {"week": "W38", "completion": 45.4}
    ]
  },
  "domain_detail": [
    {
      "domain": "Operations",
      "total": 48,
      "completed": 22,
      "in_progress": 18,
      "blocked": 1,
      "completion_pct": 45.8,
      "weighted_completion_pct": 49.2,
      "rag_status": "GREEN",
      "trend": "improving",
      "critical_items": {"total": 15, "completed": 8, "at_risk": 0},
      "gate_g2_items": {"total": 12, "completed": 8, "on_track": 4, "at_risk": 0},
      "key_issue": "SOP development ahead of schedule",
      "overdue_count": 0,
      "avg_days_overdue": 0
    },
    {
      "domain": "Maintenance",
      "total": 62,
      "completed": 25,
      "in_progress": 22,
      "blocked": 3,
      "completion_pct": 40.3,
      "weighted_completion_pct": 38.7,
      "rag_status": "AMBER",
      "trend": "stable",
      "critical_items": {"total": 18, "completed": 6, "at_risk": 2},
      "gate_g2_items": {"total": 14, "completed": 7, "on_track": 5, "at_risk": 2},
      "key_issue": "CMMS vendor integration delayed by 3 weeks",
      "overdue_count": 3,
      "avg_days_overdue": 8
    }
  ],
  "alerts_active": [
    {
      "alert_id": "ALT-047",
      "level": "L2",
      "deliverable": "DEL-MAINT-015",
      "title": "CMMS Configuration - Preventive Maintenance Module",
      "domain": "Maintenance",
      "issue": "Vendor integration delayed; 14 days overdue",
      "owner": "Maintenance Manager",
      "escalated_to": "OR Manager",
      "date_triggered": "2025-09-01",
      "status": "active"
    }
  ],
  "gate_readiness": {
    "next_gate": "G2",
    "gate_date": "2025-12-31",
    "days_until": 107,
    "deliverables_due": 85,
    "completed": 42,
    "on_track": 35,
    "at_risk": 6,
    "critical_path_items": ["DEL-HR-004", "DEL-MAINT-015"],
    "readiness_pct": 49.4,
    "forecast_readiness_at_gate": 91.2
  }
}
```

### 3. RAG Dashboard (Power BI / Excel)
**Visual Components:**
- **Program Summary Card:** Overall readiness %, RAG indicator, trend sparkline
- **Domain Heat Map:** 12-domain grid with RAG colors and completion % per domain
- **Deliverable Status Distribution:** Stacked bar chart (complete, in-progress, blocked, not started)
- **Trend Chart:** Line chart showing weekly completion % over time (program + per domain)
- **Critical Path View:** Timeline showing critical deliverables and their status
- **Overdue Items Table:** List of overdue deliverables with days overdue, owner, action
- **Gate Readiness Gauge:** Gauge chart showing current readiness vs. gate deadline
- **Alert Feed:** Live list of active alerts and escalations

### 4. Escalation Alerts (Email + Teams)
**Email Alert Format:**
```
Subject: [OR ALERT L{level}] {Project} - {Deliverable Title} - {Days Overdue} days overdue
From: OR Orchestration System <or-system@vsc.cl>
To: {Escalation Recipient}
Cc: {Domain Lead}, {OR Manager}

------------------------------------------------------------
OR DELIVERABLE ALERT - Level {Level}
------------------------------------------------------------

Project: {Project Name}
Deliverable: {DEL-ID} - {Title}
Domain: {Domain}
Gate: {Gate}
Owner: {Owner}

STATUS: {Status} | {Days Overdue} days overdue
Planned End: {Date} | Forecast End: {Date}
Progress: {X}%

IMPACT:
- Gate {Gate} readiness currently at {X}% ({RAG})
- This deliverable is on the critical path for {downstream items}
- {Impact description}

ACTION REQUIRED:
- {Specific action needed}
- Response required by: {Date}

ESCALATION PATH:
- L1 Alert sent to: {Domain Lead} on {Date}
- L2 Escalation sent to: {OR Manager} on {Date}
{- L3 will trigger on: {Date} if unresolved}

------------------------------------------------------------
This alert was generated automatically by the OR Orchestration System.
To view full deliverable details: {link to Airtable record}
To view OR Dashboard: {link to Power BI dashboard}
```

### 5. Weekly Tracking Summary (for Weekly Status Report)
**Format:** Markdown section for inclusion in `orchestrate-or-program` weekly report

```markdown
## Deliverable Tracking Summary - Week {W}

### Program Overview
| Metric | This Week | Last Week | Change | Target |
|--------|-----------|-----------|--------|--------|
| Total Deliverables | 540 | 540 | 0 | 540 |
| Completed | 245 (45.4%) | 231 (42.8%) | +14 | Per plan |
| In Progress | 185 (34.3%) | 192 (35.6%) | -7 | -- |
| Blocked | 12 (2.2%) | 14 (2.6%) | -2 | <5% |
| Not Started | 52 (9.6%) | 60 (11.1%) | -8 | Per plan |
| Overdue | 8 (1.5%) | 11 (2.0%) | -3 | 0 |
| Weighted Completion | 48.2% | 44.9% | +3.3% | 47.0% |
| SPI | 1.03 | 0.96 | +0.07 | >1.00 |

### Domain Status
| Domain | RAG | Complete | In Prog | Blocked | Overdue | Trend |
|--------|-----|----------|---------|---------|---------|-------|
| Operations | G | 45.8% | 37.5% | 2.1% | 0 | UP |
| Maintenance | A | 40.3% | 35.5% | 4.8% | 3 | FLAT |
| HSE | G | 52.1% | 33.3% | 0% | 0 | UP |
| People & Org | A | 38.5% | 41.0% | 5.1% | 2 | DOWN |
| Finance | G | 55.0% | 30.0% | 0% | 0 | UP |
| Legal | G | 48.0% | 32.0% | 4.0% | 1 | FLAT |
| Procurement | A | 42.0% | 38.0% | 6.0% | 2 | FLAT |
| Project Integration | G | 50.0% | 35.0% | 0% | 0 | UP |
| Communications | G | 60.0% | 25.0% | 0% | 0 | UP |
| Doc Control | G | 55.0% | 30.0% | 0% | 0 | UP |
| Commissioning | G | 35.0% | 40.0% | 5.0% | 0 | UP |
| Asset Management | G | 45.0% | 35.0% | 0% | 0 | UP |

### Critical Items Requiring Attention
1. [RED] DEL-MAINT-015: CMMS PM Module - 14 days overdue (vendor delay)
2. [AMBER] DEL-HR-004: Training Program Rollout - trending 7 days late
3. [AMBER] DEL-PROC-008: Long-lead spare parts order - awaiting finance approval

### Deliverables Completed This Week (+14)
- DEL-OPS-012: Area 100 Startup SOP
- DEL-OPS-013: Area 200 Normal Operations SOP
- DEL-MAINT-009: Criticality Analysis Report
- DEL-HSE-007: Emergency Response Plan (draft)
- ... (10 more items)
```

## Methodology & Standards

### Tracking Methodology

1. **Individual Item Tracking:** Every deliverable is tracked at the individual item level with its own status, progress percentage, dates, and ownership. No deliverable is tracked only at an aggregate level.

2. **Weighted Completion Calculation:** Completion percentages are weighted by criticality to prevent low-priority items from inflating the overall score:
   ```
   Weighted Completion = SUM(item_completion * item_weight) / SUM(item_weight)
   Where: Critical = weight 3, High = weight 2, Medium = weight 1
   ```

3. **Progress Percentage Rules:**
   - 0%: Not started, no work performed
   - 10-30%: Initial drafting or data gathering in progress
   - 40-60%: Substantial content developed, pending review inputs
   - 70-80%: Draft complete, under review
   - 90%: Review comments incorporated, pending final approval
   - 100%: Approved and complete (no deliverable is 100% until formally accepted)
   - Progress must increase monotonically (except for rework after review feedback)

4. **Schedule Performance Index (SPI):**
   ```
   SPI = Earned Value / Planned Value
   Where:
     Earned Value = SUM(completed deliverable weights) / SUM(all deliverable weights)
     Planned Value = SUM(planned-to-be-complete deliverable weights) / SUM(all deliverable weights)
   SPI > 1.0: Ahead of plan
   SPI = 1.0: On plan
   SPI < 1.0: Behind plan
   ```

5. **Trend Analysis:** Weekly snapshots are stored to calculate trends over 4, 8, and 12-week windows. Trend direction is determined by linear regression slope:
   - Improving: Completion rate accelerating (SPI trending > 1.0)
   - Stable: Completion rate matching plan (SPI within 0.95-1.05)
   - Declining: Completion rate decelerating (SPI trending < 0.95)

6. **Forecasting:** For each deliverable, forecast completion date is calculated based on:
   - Current progress rate (velocity)
   - Remaining work
   - Known blockers and their expected resolution
   - Historical velocity for similar deliverables
   - Bayesian updating: initial forecast based on planned date, adjusted as actuals accumulate

### RAG Status Standards

RAG status is computed objectively based on defined criteria (see RAG Criteria Configuration in Input Requirements). Key principles:
- RAG is never a subjective opinion -- it is always computed from data
- RAG can only improve when the underlying data improves (no "green-washing")
- RAG trends matter as much as current status (AMBER trending to GREEN is better than GREEN trending to AMBER)
- Any domain with a gate deliverable at risk is automatically RED regardless of other metrics

### Industry Benchmarks for OR Deliverable Tracking

| Metric | Industry Average (Poor OR) | Industry Best Practice | VSC Target |
|--------|---------------------------|----------------------|------------|
| Deliverables tracked | Ad-hoc, incomplete | 100% tracked | 100% tracked |
| Status update frequency | Monthly or less | Weekly | Weekly (real-time for critical) |
| Alert response time | Days to weeks | Within 48 hours | Within 24 hours |
| Completion at Gate G4 | 60-70% (D-01) | >90% | >90% |
| Overdue deliverables at any time | 15-25% | <5% | <5% |
| Data currency | 2-4 weeks stale | <1 week | <3 days |
| Stakeholder visibility | Periodic manual reports | Real-time dashboard | Real-time dashboard |

### Standards Applied
- **AACE International** - Earned value management principles for progress measurement
- **PMI PMBOK** - Scope management, schedule management, stakeholder communication
- **ISO 55001** - Asset information management requirements
- **COBIT** - Information governance and data quality frameworks

## Step-by-Step Execution

### Step 1: Initialize Deliverable Register
1. Receive OR WBS from `orchestrate-or-program` skill (Phase: Program Initialization)
2. Create Deliverable Register in mcp-airtable:
   - One record per deliverable (500+ records for standard project)
   - Populate all fields from WBS data
   - Set initial status = "not_started" for all items
   - Set planned start and end dates from schedule
   - Assign criticality weights
   - Link dependencies between deliverables
3. Create History table for audit trail
4. Create Alerts table for escalation tracking
5. Create Snapshots table for weekly trend data
6. Validate register completeness:
   - Every domain has assigned deliverables
   - Every deliverable has an owner agent
   - Every deliverable has a planned end date
   - Every deliverable has at least one acceptance criterion
   - All dependencies are valid (referenced deliverables exist)
7. Publish initial register statistics to orchestrator

### Step 2: Collect Status Updates (Weekly Cycle)
1. Poll Shared Task List for all agent-reported status changes since last collection
2. For each status update:
   - Validate the update (progress can only increase unless rework)
   - Update the deliverable record in mcp-airtable
   - Log the change in the History table
   - Check if the update resolves any active alerts
   - Check if the update triggers any downstream dependency releases
3. For deliverables without updates in >14 days:
   - Send reminder to owner agent via Inbox
   - Flag for manual follow-up if no response in 3 days
4. For blocked deliverables:
   - Verify blocker description is specific and actionable
   - Check if blocker resolution has been assigned
   - Escalate if blocked >7 days without resolution plan
5. Reconcile register against project scope:
   - Any new deliverables added since last cycle? Add to register.
   - Any deliverables cancelled or deferred? Update status and reason.

### Step 3: Calculate Completion Metrics
1. For each domain, calculate:
   - Raw completion % = completed items / total items
   - Weighted completion % = SUM(completed * weight) / SUM(all weights)
   - Progress by status category (not started, in progress, under review, complete, blocked)
   - Critical items completion % (critical items only)
   - Gate-specific completion % (items due at the next gate)
2. For program level, calculate:
   - Overall weighted completion %
   - Schedule Performance Index (SPI)
   - Cost Performance Index (CPI) if budget data available
   - Overdue count and average days overdue
   - Blocked count and average days blocked
3. For trend analysis, calculate:
   - Week-over-week completion change (absolute and percentage)
   - 4-week moving average of completion velocity
   - Projected completion date at current velocity
   - SPI trend (improving, stable, declining)

### Step 4: Compute RAG Status
1. For each deliverable:
   - Compare forecast end date against planned end date
   - Compare current progress against expected progress (linear interpolation)
   - Check for blockers and their duration
   - Assign RAG status per criteria
2. For each domain:
   - Evaluate weighted completion against plan
   - Count critical deliverables in RED
   - Count overdue deliverables and their duration
   - Assign domain RAG status per criteria
3. For program level:
   - Count domains by RAG status
   - Apply program-level RAG criteria
   - Identify overall program health

### Step 5: Generate Alerts and Escalations
1. Scan all deliverables for alert conditions:
   - Overdue >5 days: Generate L1 Alert
   - Overdue >14 days or critical item at risk: Generate L2 Escalation
   - Overdue >21 days or gate deliverable at risk: Generate L3 Executive Alert
   - Multiple gate deliverables at risk: Generate L4 Crisis Alert
2. For each alert:
   - Check if alert already exists and is active (avoid duplicates)
   - If new: Create alert record, send notification via mcp-outlook
   - If existing: Update alert with current status, send reminder if due
   - If resolved: Close alert, send resolution notification
3. For escalations:
   - Send email to escalation recipient with full context
   - Post notification in mcp-teams escalation channel
   - Update OR Dashboard alert feed in mcp-powerbi
4. Log all alerts and their lifecycle in the Alerts table

### Step 6: Update Dashboard
1. Generate dashboard data payload (JSON format per Output Specification)
2. Push data to mcp-powerbi:
   - Update program summary dataset
   - Update domain detail dataset
   - Update trend data dataset
   - Update alert feed dataset
   - Update gate readiness dataset
3. Verify dashboard refresh successful
4. Store snapshot in Snapshots table for historical trend analysis

### Step 7: Generate Reports and Summaries
1. Produce Weekly Tracking Summary (Markdown) for inclusion in weekly status report
2. Produce domain-specific summaries for each specialist agent (Inbox messages)
3. If gate approaching:
   - Produce Gate Readiness Assessment
   - Highlight deliverables at risk of missing gate
   - Recommend corrective actions for at-risk items
4. If requested:
   - Produce full Deliverable Register export (Excel/CSV)
   - Produce custom filtered views (by domain, gate, status, priority, owner)

### Step 8: Handle Scope Changes
1. When scope change notification received from orchestrator:
   - If deliverables added: Create new records in register with baseline data
   - If deliverables removed: Update status to "cancelled" with reason; preserve history
   - If deliverables modified: Update affected fields, log changes in history
   - If deliverables re-prioritized: Update criticality weights, recalculate metrics
   - If timeline re-baselined: Update planned dates, recalculate SPI from new baseline
2. Notify affected agents of scope changes
3. Recalculate all completion metrics with updated baseline
4. Update dashboard with new baseline data
5. Flag any new alerts triggered by scope change

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Register Completeness | Deliverables with all required fields populated | 100% | >98% |
| Status Currency | Average age of most recent status update | <7 days | <14 days |
| Update Accuracy | Status updates validated (no regression errors) | 100% | >99% |
| Alert Timeliness | Alerts generated within 24h of trigger condition | 100% | >95% |
| Dashboard Currency | Dashboard data age at any point | <3 days | <7 days |
| Calculation Accuracy | Weighted completion matches manual audit | 100% | 100% |
| RAG Consistency | RAG status matches defined criteria | 100% | 100% |
| Trend Data Coverage | Weeks with complete snapshot data | 100% | >95% |
| Stakeholder Access | Time to answer "what is the status of X?" | <30 seconds | <2 minutes |
| Audit Trail Completeness | Status changes with full audit record | 100% | 100% |
| Scope Change Response | Time to update register after scope change | <24 hours | <48 hours |
| Zero Lost Items | Deliverables tracked from creation to completion | 100% | 100% |

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `orchestrate-or-program` | Parent Skill | Provides WBS, gates, timeline, and triggers tracking cycles (Skill H-01) |
| `generate-or-gate-review` | Consumer | Uses deliverable data for gate readiness assessment (Skill H-03) |
| `model-rampup-trajectory` | Consumer | Uses completion data to predict ramp-up performance (Skill H-04) |
| `generate-or-report` | Consumer | Uses tracking data for multi-level reporting |
| `agent-operations` | Data Source | Reports operations deliverable status |
| `agent-maintenance` | Data Source | Reports maintenance deliverable status |
| `agent-hse` | Data Source | Reports HSE deliverable status |
| `agent-hr` | Data Source | Reports HR deliverable status |
| `agent-finance` | Data Source | Reports finance deliverable status |
| `agent-legal` | Data Source | Reports legal deliverable status |
| `agent-procurement` | Data Source | Reports procurement deliverable status |
| `agent-project` | Data Source | Reports project integration deliverable status |
| `agent-communications` | Data Source | Reports communications deliverable status |
| `agent-doc-control` | Data Source + Store | Reports doc control status; stores deliverable documents |
| `agent-or-pmo` | Governance | Defines gate criteria and RAG thresholds |
| `validate-output-quality` | Quality | Validates deliverable quality when status changes to "complete" |
| `sync-airtable-jira` | Integration | Syncs deliverable register with Jira for human-facing views |

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage for completed deliverables and tracking reports"
capabilities:
  - Store completed deliverable documents with metadata
  - Store weekly tracking summary reports
  - Maintain SharePoint List mirror of deliverable register
  - Provide document links for deliverable attachments
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 2: Verify deliverable documents exist when status changes to "complete"
  - Step 7: Store weekly tracking summary and exports
  - Step 8: Update SharePoint List when scope changes
```

### mcp-airtable
```yaml
name: "mcp-airtable"
server: "@anthropic/airtable-mcp"
purpose: "Primary database for OR Deliverable Register"
capabilities:
  - Create and maintain deliverable records (500+ per project)
  - Store status change history (audit trail)
  - Manage alert records and lifecycle
  - Store weekly snapshots for trend analysis
  - Support filtered views and custom queries
  - Provide API access for dashboard integration
authentication: API Key
usage_in_skill:
  - Step 1: Create deliverable register database
  - Step 2: Update deliverable records with agent status reports
  - Step 3: Query data for metric calculations
  - Step 5: Create and manage alert records
  - Step 6: Store weekly snapshots
  - Step 7: Export data for reports
  - Step 8: Handle scope changes (add/remove/modify records)
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Visual dashboards for OR deliverable tracking"
capabilities:
  - Update Power BI datasets with deliverable metrics
  - Generate visual dashboards (heat maps, trend charts, gauges)
  - Publish dashboards for stakeholder self-service access
  - Support drill-down from program to domain to deliverable
  - Refresh data on weekly or on-demand cycle
authentication: Service Principal
usage_in_skill:
  - Step 6: Push dashboard data payload to Power BI datasets
  - Step 6: Verify dashboard refresh successful
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Automated alert and escalation notifications"
capabilities:
  - Send L1-L4 alert and escalation emails
  - Send weekly tracking summaries to stakeholders
  - Send reminder emails for deliverables approaching due dates
  - Send resolution notifications when alerts are closed
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 2: Send reminder emails for deliverables without recent updates
  - Step 5: Send alert and escalation emails per escalation matrix
  - Step 7: Distribute weekly tracking summary
```

## Templates & References

### Deliverable Register Export Template (Excel)
```
| DEL ID | Domain | Sub-Domain | Title | Gate | Criticality | Owner Agent | Owner Person | Status | Progress % | Planned Start | Planned End | Forecast End | Actual End | RAG | Days Over/Under | Blockers | Notes |
|--------|--------|-----------|-------|------|-------------|-------------|-------------|--------|-----------|--------------|------------|-------------|-----------|-----|----------------|---------|-------|
| DEL-OPS-001 | Operations | Operating Model | Operating Model Document | G2 | Critical | agent-operations | Ops Manager | In Progress | 65% | 2025-07-01 | 2025-10-15 | 2025-10-22 | - | AMBER | +7 | - | Awaiting EPC input |
```

### Alert Summary Template
```markdown
## Active Alerts Summary - {Date}

### Level 4 (Crisis): {count}
{none or list}

### Level 3 (Executive): {count}
| Alert | Deliverable | Domain | Days Overdue | Impact | Owner |
|-------|-------------|--------|-------------|--------|-------|
| {id} | {title} | {domain} | {days} | {impact} | {owner} |

### Level 2 (Escalation): {count}
| Alert | Deliverable | Domain | Days Overdue | Owner |
|-------|-------------|--------|-------------|-------|

### Level 1 (Watch): {count}
| Alert | Deliverable | Domain | Days Overdue | Owner |
|-------|-------------|--------|-------------|-------|

### Alerts Resolved This Week: {count}
| Alert | Deliverable | Resolution | Resolved By |
|-------|-------------|------------|-------------|
```

### Gate Readiness Assessment Template
```markdown
## Gate {G} Readiness Assessment
## Project: {Project Name}
## Assessment Date: {Date}
## Gate Date: {Gate Date} ({Days Until} days)

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Gate Deliverables | {X} | {Y} | -- |
| Completed | {X} ({%}) | >90% | {RAG} |
| On Track | {X} ({%}) | -- | -- |
| At Risk | {X} ({%}) | 0 | {RAG} |
| Blocked | {X} ({%}) | 0 | {RAG} |
| Forecast Readiness at Gate | {X}% | >90% | {RAG} |

### Domain Readiness for Gate {G}
| Domain | Due at Gate | Complete | On Track | At Risk | RAG |
|--------|-----------|----------|----------|---------|-----|
| {domain} | {X} | {Y} | {Z} | {W} | {RAG} |

### Critical Path Items
| Deliverable | Domain | Status | Forecast End | Gap | Action |
|-------------|--------|--------|-------------|-----|--------|
| {title} | {domain} | {status} | {date} | {days +/-} | {action} |

### Recommendation
{READY / CONDITIONAL / NOT READY}
{If conditional: list conditions}
{If not ready: list recovery actions required}
```

## Examples

### Example 1: Weekly Tracking Cycle

```
Trigger: Weekly cycle (Monday 06:00, Week 38)

Process:
  1. Collect Status Updates:
     - Polled Shared Task List: 32 status changes since last week
     - 14 deliverables moved to "complete"
     - 12 deliverables progressed (% increase)
     - 4 deliverables newly started
     - 2 deliverables became blocked (new blockers reported)

  2. Calculate Metrics:
     - Program: 245/540 complete (45.4%), weighted 48.2%
     - Plan for this date: 47.0% -> SPI = 1.03 (ahead of plan)
     - 12 domains calculated, 9 GREEN, 3 AMBER, 0 RED
     - 8 deliverables overdue (down from 11 last week)
     - 12 deliverables blocked (down from 14)

  3. RAG Status:
     - Operations: GREEN (45.8%, SPI 1.05, no critical items at risk)
     - Maintenance: AMBER (40.3%, SPI 0.92, 2 critical items at risk)
     - HSE: GREEN (52.1%, SPI 1.12, ahead of plan)
     - People & Org: AMBER (38.5%, SPI 0.88, recruitment behind)
     - [... remaining 8 domains GREEN]

  4. Alerts:
     - 2 new L1 alerts generated (DEL-HR-019, DEL-PROC-012)
     - 1 existing L1 alert escalated to L2 (DEL-MAINT-015, now 14 days overdue)
     - 3 alerts resolved (deliverables completed)
     - Alert emails sent via mcp-outlook

  5. Dashboard Updated:
     - Power BI datasets refreshed via mcp-powerbi
     - Snapshot saved to mcp-airtable for trend history

  6. Reports Generated:
     - Weekly Tracking Summary (Markdown) sent to orchestrate-or-program
     - Domain-specific summaries sent to 12 specialist agents
     - 3 alert emails distributed

Output:
  "Week 38 tracking complete.
   Program: 45.4% complete (SPI 1.03 - ahead of plan).
   9 domains GREEN, 3 AMBER, 0 RED.
   +14 deliverables completed this week.
   8 overdue (down from 11), 12 blocked (down from 14).
   3 active alerts (1 L2, 2 L1). 3 alerts resolved.
   Dashboard updated: https://app.powerbi.com/sv-or-tracker"
```

### Example 2: Gate Readiness Assessment

```
Trigger: Gate G2 approaching (T-30 days, November 30, 2025)

Process:
  1. Gate G2 Deliverables Analysis:
     - Total deliverables due at G2: 85
     - Completed: 62 (72.9%)
     - In Progress: 18 (21.2%)
     - Under Review: 3 (3.5%)
     - Not Started: 1 (1.2%)
     - Blocked: 1 (1.2%)

  2. Critical Items for G2: 28
     - Completed: 22 (78.6%)
     - On Track: 4 (14.3%)
     - At Risk: 2 (7.1%)
       * DEL-HR-004: Training Program (35 days behind, but accelerating)
       * DEL-MAINT-015: CMMS PM Module (vendor delay, resolution in progress)

  3. Forecast at Gate Date:
     - At current velocity: 79 of 85 complete (92.9%)
     - 6 items likely to be 80-95% complete but not formally approved
     - Forecast readiness: 92.9% complete, 96.5% if including items in final review

  4. Recommendation: CONDITIONAL PASS
     - Conditions: 6 items to be completed within 30 days post-gate
     - All 6 items have active recovery plans
     - No safety-critical items are among the 6
     - Critical path items (HR-004, MAINT-015) have mitigation in place

Output:
  Gate G2 Readiness Assessment generated.
  72.9% complete at T-30 (ahead of 65% benchmark).
  Forecast: 92.9% at gate date.
  Recommendation: CONDITIONAL PASS (6 items with 30-day completion window).
  2 critical items at risk with active mitigations.
  Assessment shared with orchestrate-or-program for gate review package.
```

### Example 3: Scope Change Handling

```
Trigger: Scope change SC-007 approved -- addition of tailings reprocessing circuit

Process:
  1. Scope Change Analysis:
     - SC-007 adds 15 new OR deliverables across 6 domains:
       * Operations: +4 (SOPs, operating model update, ramp-up plan update)
       * Maintenance: +3 (asset register update, PM plan, spare parts)
       * HSE: +3 (risk assessment, emergency response update, environmental plan)
       * Procurement: +2 (contracts, consumables)
       * HR: +2 (additional operators, training update)
       * Doc Control: +1 (vendor documentation for new equipment)

  2. Register Update:
     - 15 new deliverable records created in mcp-airtable
     - Each assigned to appropriate domain agent
     - Criticality assessed: 5 critical, 7 high, 3 medium
     - Timeline set based on construction schedule for reprocessing circuit
     - Dependencies linked to existing deliverables

  3. Impact Assessment:
     - Total deliverables: 540 -> 555
     - Weighted completion: 48.2% -> 46.8% (diluted by new items)
     - SPI: 1.03 -> 1.00 (re-baselined)
     - No impact on Gate G2 (new items due at G3 and G4)
     - Resource impact: +2.5 FTE for 8 months

  4. Notifications:
     - 6 domain agents notified of new deliverables
     - Orchestrator notified of register expansion and re-baseline
     - Dashboard updated with new baseline data

Output:
  "Scope change SC-007 processed.
   15 new deliverables added to register (total: 555).
   Assigned across 6 domains, due at G3/G4.
   Re-baselined SPI from 1.03 to 1.00.
   No impact on Gate G2 timeline.
   Resource impact: +2.5 FTE for 8 months.
   All agents notified. Dashboard re-baselined."
```
