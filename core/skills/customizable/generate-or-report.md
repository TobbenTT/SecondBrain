# Generate OR Report

## Skill ID: F-008
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Generate multi-level OR (Operational Readiness) reports tailored to three distinct audiences: Executive, Managerial, and Operational. Each level provides the appropriate depth and focus for its audience, from a one-page strategic dashboard for executives to detailed task-level status for operational teams. This skill ensures consistent, timely, and actionable reporting across the OR program.

## Intent & Specification

**Problem:** OR reporting is inconsistent, manual, and one-size-fits-all. The same report is sent to executives (who need strategic summary) and operators (who need task detail), satisfying neither. Reports take hours to compile manually, data is often stale by the time it is presented, and there is no standard format across projects. This leads to poor visibility, uninformed decisions, and stakeholder frustration.

**Success Criteria:**
- Three report levels produced from the same data source
- Executive report fits on 1-2 pages with visual dashboard
- Managerial report provides KPI trends and workstream detail
- Operational report shows task-level status with blockers and actions
- Reports generated automatically with minimal manual input
- Data is current (queried at generation time)
- Reports follow consistent templates across projects
- Generation time under 15 minutes for all three levels

**Constraints:**
- Must pull data from Shared Task List, agent outputs, and financial systems
- Must handle both English and Spanish
- Must support multiple output formats (Markdown, PPTX, PDF)
- Must respect confidentiality levels per audience
- Must be automated enough to sustain weekly/monthly cadence
- Must integrate with agent-or-pmo's governance framework

## Trigger / Invocation

**Scheduled Triggers:**
- Weekly Operational Report: Every Monday 07:00
- Bi-weekly Managerial Report: 1st and 15th of month, 08:00
- Monthly Executive Report: 1st of month, 08:00
- Gate Review Package: triggered by agent-or-pmo

**Manual Triggers:**
- `generate-or-report create --level [executive|managerial|operational] --period [range]`
- `generate-or-report create --level all --period [range]` (generate all three)
- `generate-or-report gate-package --gate [G1|G2|G3|G4]`
- `generate-or-report custom --sections [list] --audience [name]`

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Shared Task List | OR System | Yes | All task status data |
| KPI Data | Agent-OR-PMO | Yes | Metrics by workstream |
| Financial Data | Agent-Finance | Yes | Budget vs actuals |
| Risk Register | Agent-HSE | Yes | Current risk status |
| Schedule Data | Agent-Project | Yes | Milestone status |
| Agent Status Updates | All agents (Inbox) | Yes | Workstream narratives |
| Previous Reports | Doc Control | No | For trend comparison |
| Report Configuration | Configuration | Yes | Templates, recipients, format |

## Output Specification

### Level 1: Executive Report (1-2 pages)

```markdown
# OR Executive Dashboard
## {Project Name} | {Period}
## Generated: {Date}

### Overall Readiness: {X}% [{RAG Status}]
[====================] {X}%

### Key Metrics
| Metric | Value | Trend | Target |
|--------|-------|-------|--------|
| Overall Readiness | {X}% | {arrow} | {target}% |
| Tasks On Track | {X}/{Y} | {arrow} | >90% |
| Budget Spend | ${X}M / ${Y}M | {arrow} | On track |
| Critical Risks | {X} | {arrow} | <3 |
| Positions Filled | {X}/{Y} | {arrow} | Per plan |

### Workstream Status
| Workstream | Status | Readiness | Key Issue |
|------------|--------|-----------|-----------|
| Operations | {RAG} | {X}% | {one-line issue} |
| Maintenance | {RAG} | {X}% | {one-line issue} |
| HSE | {RAG} | {X}% | {one-line issue} |
| People | {RAG} | {X}% | {one-line issue} |
| Finance | {RAG} | {X}% | {one-line issue} |

### Decisions Required
1. {Decision 1}: {context in one sentence}
2. {Decision 2}: {context in one sentence}

### Next Gate: {Gate Name} - {Date} ({days} days)
Readiness: {X}/Y deliverables complete

### Top 3 Risks
1. [{RAG}] {Risk description} - Mitigation: {action}
2. [{RAG}] {Risk description} - Mitigation: {action}
3. [{RAG}] {Risk description} - Mitigation: {action}
```

### Level 2: Managerial Report (5-10 pages)

```markdown
# OR Management Report
## {Project Name} | {Period}

### 1. Executive Summary
{3-5 paragraphs covering overall status, key achievements, key concerns, outlook}

### 2. Readiness Dashboard
{Detailed KPI dashboard with trends over last 6 periods}

### 3. Workstream Detail
#### 3.1 Operations
- Status: {RAG} | Readiness: {X}%
- Achievements this period: {list}
- Key activities next period: {list}
- Issues and risks: {list}
- KPIs: {table}
- Resource utilization: {X}%

#### 3.2 Maintenance
{Same structure as 3.1}

#### 3.3 HSE
{Same structure}

{... all workstreams}

### 4. Schedule Status
- Milestones achieved: {list}
- Milestones upcoming: {list}
- Milestones at risk: {list}
- Schedule variance: {analysis}

### 5. Financial Status
- Budget: ${X}M spent of ${Y}M total ({Z}%)
- Forecast: ${X}M at completion (variance: {+/- $Z}M)
- Key variances: {explanation}

### 6. Risk Summary
{Risk register summary with movement since last period}

### 7. Interdependency Status
{Cross-workstream dependencies: on track, at risk, blocked}

### 8. Actions and Decisions
{Actions from last period: completed, carried forward}
{New actions this period}
{Decisions pending}

### 9. Outlook
{Forward-looking assessment for next period}
```

### Level 3: Operational Report (detailed, unlimited length)

```markdown
# OR Operational Report
## {Project Name} | Week {W}

### 1. Task Status Summary
| Status | Count | Change |
|--------|-------|--------|
| Completed this week | {X} | |
| In Progress | {X} | {+/-} |
| Blocked | {X} | {+/-} |
| Overdue | {X} | {+/-} |
| Not Started | {X} | {+/-} |
| Total | {X} | |

### 2. Tasks Completed This Week
| Task | Agent | Deliverable | Completed |
|------|-------|-------------|-----------|
| {task} | {agent} | {deliverable} | {date} |

### 3. Tasks In Progress
| Task | Agent | Due | Progress | Notes |
|------|-------|-----|----------|-------|
| {task} | {agent} | {date} | {%} | {notes} |

### 4. Blocked Tasks
| Task | Agent | Blocker | Blocked Since | Resolution |
|------|-------|---------|---------------|------------|
| {task} | {agent} | {blocker} | {date} | {action} |

### 5. Overdue Tasks
| Task | Agent | Due | Days Overdue | Action |
|------|-------|-----|--------------|--------|
| {task} | {agent} | {date} | {days} | {action} |

### 6. Tasks Due Next Week
| Task | Agent | Due | Dependencies |
|------|-------|-----|-------------|
| {task} | {agent} | {date} | {deps} |

### 7. Inbox Activity
- Messages sent: {X}
- Messages resolved: {X}
- Messages pending: {X}
- Escalations: {X}

### 8. Agent Health
| Agent | Tasks | Completed | Blocked | Overdue | Health |
|-------|-------|-----------|---------|---------|--------|
| {agent} | {total} | {done} | {blocked} | {overdue} | {RAG} |

### 9. Issues and Actions Log
| ID | Issue | Raised By | Date | Owner | Status | Resolution |
|----|-------|-----------|------|-------|--------|------------|
| {id} | {issue} | {agent} | {date} | {owner} | {status} | {resolution} |
```

## Methodology & Standards

- **Pyramid Reporting:** Information flows up through levels. Operational detail aggregates into managerial KPIs which aggregate into executive dashboard. Each level is self-contained.
- **RAG Status Convention:**
  - GREEN: On track, no significant issues
  - AMBER: At risk, issues identified with mitigation in place
  - RED: Off track, escalation required, significant impact expected
- **Trend Indicators:** All metrics show trend vs previous period (improving, stable, declining).
- **Data Currency:** Reports always use live data, not cached. Query time recorded.
- **Consistency:** Same definitions, formulas, and RAG criteria applied across all reports and periods.
- **Actionability:** Every report section concludes with clear actions or decisions needed.

## Step-by-Step Execution

### Step 1: Collect Data
1. Query Shared Task List for all task status data
2. Query agent-or-pmo for KPI data
3. Query agent-finance for budget data
4. Query agent-hse for risk register
5. Query agent-project for schedule data
6. Collect narrative updates from agents via Inbox
7. Load previous report for trend comparison

### Step 2: Calculate Metrics
1. Calculate readiness percentages per workstream
2. Calculate overall readiness (weighted average)
3. Calculate RAG status per criteria
4. Calculate trends (vs previous period)
5. Calculate schedule variance
6. Calculate budget variance
7. Identify top risks and blockers

### Step 3: Generate Level-Appropriate Content
1. **Operational:** List all tasks by status, agent health, inbox activity
2. **Managerial:** Aggregate into workstream summaries, KPI trends, schedule/budget status
3. **Executive:** Synthesize into dashboard, key metrics, decisions, top risks

### Step 4: Apply Templates
1. Load report template for the requested level
2. Populate template with calculated data
3. Generate visualizations (charts, dashboards, RAG indicators)
4. Apply formatting and branding
5. Add narrative sections (from agent updates or AI-generated summaries)

### Step 5: Quality Check
1. Verify data accuracy (spot-check key numbers)
2. Ensure completeness (all sections populated)
3. Check consistency between report levels (same numbers)
4. Verify RAG status is consistent with underlying data
5. Check narrative tone and accuracy

### Step 6: Deliver
1. Save report in document control
2. Deliver to configured recipients per report level
3. If PPTX format: optionally send to genspark-pptx-enhancer
4. Log report generation metadata
5. Notify agent-or-pmo of report delivery

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Data Accuracy | Metrics match source data | 100% |
| Report Completeness | All template sections populated | > 95% |
| Cross-Level Consistency | Same numbers across all three levels | 100% |
| Generation Time | Time from trigger to delivery | < 15 min |
| Schedule Adherence | Reports delivered on time | 100% |
| Stakeholder Satisfaction | Report meets audience needs | > 4/5 |
| Actionability | Reports with clear actions/decisions | 100% |
| Format Validity | Output files render correctly | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Data Source | Task status from Shared Task List |
| `agent-or-pmo` | Data Source + Consumer | KPI data, governance reporting |
| `agent-finance` | Data Source | Budget and financial data |
| `agent-hse` | Data Source | Risk register data |
| `agent-project` | Data Source | Schedule and milestone data |
| All `agent-*` | Data Source | Workstream narrative updates |
| `airtable-report-generator` | Sibling | CRM data may be incorporated |
| `genspark-pptx-enhancer` | Downstream | PPTX reports enhanced |
| `agent-doc-control` | Downstream | Reports filed in repository |
| `agent-communications` | Downstream | Reports distributed to stakeholders |

## Templates & References

**RAG Status Criteria:**
```yaml
rag_criteria:
  workstream:
    green:
      - readiness >= 90% of plan for current date
      - no overdue tasks > 1 week
      - no critical risks without mitigation
    amber:
      - readiness 70-89% of plan for current date
      - OR overdue tasks <= 3
      - OR critical risks with mitigation but not resolved
    red:
      - readiness < 70% of plan for current date
      - OR overdue tasks > 3
      - OR unmitigated critical risks
      - OR gate deliverable at risk

  overall:
    green: all workstreams green or max 2 amber
    amber: max 1 red or more than 2 amber
    red: more than 1 red
```

**Report Distribution Matrix:**
```
| Report Level | Frequency | Audience | Format | Channel |
|-------------|-----------|----------|--------|---------|
| Executive | Monthly | C-suite, Project Director | PPTX | Email + meeting |
| Managerial | Bi-weekly | Dept Managers, OR Lead | MD/PDF | Slack + Drive |
| Operational | Weekly | Workstream leads, team | MD | Slack + Drive |
| Gate Package | Per gate | Steering Committee | PPTX | Email + meeting |
```

## Examples

**Example 1: Generate All Three Levels**
```
Command: generate-or-report create --level all --period "2025-W16"

Process:
  1. Query all data sources (tasks, KPIs, budget, risks, schedule)
  2. Calculate metrics:
     - Overall readiness: 62% (AMBER)
     - Tasks: 145 total, 82 complete, 40 in progress, 8 blocked, 15 not started
     - Budget: $8.2M spent / $44M total (19%, on track)
     - Risks: 3 critical, 8 high, 15 medium
  3. Generate 3 reports:
     - Executive: 2-page dashboard (PPTX)
     - Managerial: 8-page detailed report (PDF)
     - Operational: 15-page task-level report (Markdown)
  4. Validate cross-level consistency
  5. Deliver to configured recipients

Output:
  Executive: "LIT-PMO-RPT-E-W16.pptx" -> emailed to executives
  Managerial: "LIT-PMO-RPT-M-W16.pdf" -> posted to Slack #or-management
  Operational: "LIT-PMO-RPT-O-W16.md" -> posted to Slack #or-operations

  All reports consistent. Overall status: AMBER. Key issue: HR recruitment behind plan.
```

**Example 2: Gate Review Package**
```
Command: generate-or-report gate-package --gate G2

Process:
  1. Query all gate G2 deliverables from task list
  2. Compile gate readiness assessment:
     - 15/18 deliverables complete
     - 2 deliverables in final review
     - 1 deliverable at risk (Training Plan)
  3. Generate gate package:
     - Executive summary (1 page)
     - Deliverable status matrix (2 pages)
     - Workstream summaries (1 page each x 10 = 10 pages)
     - Risk summary (1 page)
     - Budget summary (1 page)
     - Recommendation and conditions (1 page)
  4. Format as PPTX for steering committee
  5. Send to genspark-pptx-enhancer for polish

Output: "LIT-PMO-GATE-G2-Package.pptx" (16 slides)
  Recommendation: Conditional Pass
  Conditions: Complete Training Plan within 30 days
```
