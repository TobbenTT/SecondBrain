# Create Weekly Report

## Skill ID: C-WEEK-013

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (regular deliverable for project management and client communication)

---

## Purpose

Generate structured weekly progress reports for consulting projects, summarizing activities completed, milestones achieved, issues encountered, risks identified, and plans for the upcoming week. This skill standardizes reporting format, ensures completeness, and reduces the time consultants spend on administrative reporting.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Compile** progress data from multiple sources into a standardized weekly report.
2. **Track** milestone progress against project plan/schedule.
3. **Highlight** issues, risks, and blockers requiring management attention.
4. **Document** decisions made and action items assigned.
5. **Deliver** output in `.docx` format suitable for client and internal distribution.

---

## Trigger / Invocation

**Command:** `/create-weekly-report`

**Trigger Conditions:**
- User requests weekly progress report or status report.
- Regular reporting cadence requires report generation.
- Project milestone review is needed.

**Aliases:**
- `/weekly-report`
- `/status-report`
- `/progress-report`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `progress_data` | Text, `.xlsx`, or structured notes | Activities completed, hours worked, deliverables produced |
| `milestones` | Text or `.xlsx` | Current milestone status (planned vs. actual dates) |
| `issues` | Text | Current issues, blockers, or concerns |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `project_plan` | `.xlsx` or `.mpp` | Master project schedule for variance tracking |
| `previous_report` | `.docx` | Previous week's report for continuity and carryover items |
| `risks_register` | `.xlsx` | Project risk register with current status |
| `action_items` | Text or `.xlsx` | Open action items from previous meetings |
| `kpi_data` | `.xlsx` | Project KPIs (budget consumed, schedule variance, quality metrics) |
| `next_week_plan` | Text | Planned activities for the coming week |
| `photos` | `.jpg`, `.png` | Site or work progress photos |
| `client_name` | Text | Client name for report header |
| `project_name` | Text | Project name for report header |
| `report_period` | Text | Week dates (e.g., "February 10-14, 2025") |
| `report_number` | Number | Sequential report number |

---

## Output Specification

### Primary Output: Weekly Report (`.docx`)

**File naming:** `{project_code}_weekly_report_{report_number}_{YYYYMMDD}.docx`

**Report structure:**

| Section | Content |
|---------|---------|
| **Header** | Client logo, VSC logo, project name, report period, report number |
| **1. Executive Summary** | 3-5 sentence summary of the week: key achievements, status color (Green/Yellow/Red), critical items |
| **2. Overall Project Status** | Traffic light status (Scope, Schedule, Budget, Quality), overall health indicator |
| **3. Activities Completed** | Itemized list of work performed this week by workstream/deliverable |
| **4. Deliverables Status** | Table of deliverables: name, planned date, forecast date, status, % complete |
| **5. Milestone Tracker** | Milestone table with planned vs. actual dates, variance in days |
| **6. Issues & Blockers** | Numbered list of current issues with severity, owner, and resolution plan |
| **7. Risks** | Top risks with probability, impact, mitigation status |
| **8. Action Items** | Table: action, owner, due date, status (Open/In Progress/Closed) |
| **9. Decisions Log** | Key decisions made this week with rationale |
| **10. Next Week Plan** | Planned activities for the coming week |
| **11. Resource Utilization** | Hours worked by team member, budget burn rate |
| **12. Photos / Evidence** | Work progress photos with captions (if applicable) |

### Status Color Definitions

| Color | Symbol | Description |
|-------|--------|-------------|
| **Green** | On Track | Proceeding as planned, no significant issues |
| **Yellow** | At Risk | Minor deviations or emerging risks; attention needed |
| **Red** | Off Track | Significant issues or delays; management action required |

---

## Methodology & Standards

### Reporting Best Practices

1. **Consistency:** Use the same structure and terminology every week.
2. **Honesty:** Report actual status, not aspirational status. Red is acceptable; surprise is not.
3. **Conciseness:** Each item should be a clear, factual statement.
4. **Action-Oriented:** Every issue should have an owner and proposed resolution.
5. **Forward-Looking:** Always include next week's plan and any early warnings.

### Schedule Variance Calculation

```
Schedule Variance (SV) = Planned_End_Date - Forecast_End_Date
  SV > 0: Ahead of schedule (Green)
  SV = 0: On schedule (Green)
  -5 <= SV < 0: Slightly behind (Yellow)
  SV < -5 days: Significantly behind (Red)
```

### Budget Tracking (if applicable)

```
Budget Status:
  Planned Value (PV) = Budgeted cost of work scheduled
  Earned Value (EV) = Budgeted cost of work performed
  Actual Cost (AC) = Actual cost of work performed

  CPI = EV / AC  (Cost Performance Index; < 1.0 = over budget)
  SPI = EV / PV  (Schedule Performance Index; < 1.0 = behind schedule)
```

### Action Item Tracking

Each action item must have:
- **ID:** Sequential identifier (e.g., AI-001).
- **Description:** Clear, specific action statement.
- **Owner:** Named responsible person.
- **Due Date:** Specific date.
- **Status:** Open / In Progress / Closed / Overdue.
- **Source:** Where it originated (meeting date, report number).

---

## Step-by-Step Execution

### Phase 1: Data Collection (Steps 1-2)

**Step 1: Gather progress data.**
- Compile activities completed from input data.
- Update milestone status (planned vs. actual dates).
- Collect issue and risk updates.
- Gather action item status updates.
- Collect hours worked and resource data.

**Step 2: Carry forward from previous report.**
- Review previous week's report for open items.
- Carry forward unresolved issues and open action items.
- Update status of previously reported items.
- Note any items that have been closed.

### Phase 2: Report Construction (Steps 3-5)

**Step 3: Determine overall status.**
- Assess scope, schedule, budget, and quality status.
- Assign traffic light colors based on defined criteria.
- Determine overall project health indicator.
- Identify critical items requiring executive attention.

**Step 4: Build report sections.**
- Write executive summary (3-5 sentences).
- Populate activities completed (itemized list).
- Update deliverables and milestone tables.
- Document issues with severity and resolution plans.
- Update action item tracker.
- Outline next week's plan.

**Step 5: Calculate metrics.**
- Calculate schedule variance for each milestone.
- Calculate budget metrics (CPI, SPI) if applicable.
- Update percentage complete for each deliverable.
- Compute hours worked vs. planned.

### Phase 3: Review & Delivery (Steps 6-7)

**Step 6: Quality check.**
- Verify all data is current and accurate.
- Ensure every issue has an owner and resolution plan.
- Confirm action items are up to date.
- Check formatting and professional appearance.

**Step 7: Finalize and deliver.**
- Apply report template formatting.
- Add headers, footers, and logos.
- Generate `.docx` output.
- Note the date and sequential report number.

---

## Quality Criteria

### Completeness
- [ ] All report sections are populated (even if "None this week").
- [ ] All open action items from previous weeks are accounted for.
- [ ] Next week's plan is included.
- [ ] Status colors are assigned for all tracked dimensions.

### Accuracy
- [ ] Dates (planned, actual, forecast) are correct.
- [ ] Percentage completion reflects actual progress.
- [ ] Hours and budget data match source records.
- [ ] Issue descriptions accurately reflect current status.

### Timeliness
- [ ] Report covers the correct reporting period.
- [ ] Information is current as of reporting date.
- [ ] Carryover items from previous report are updated.

### Professionalism
- [ ] Consistent formatting throughout.
- [ ] No spelling or grammar errors.
- [ ] Objective, factual tone (no blame or excuses).
- [ ] Suitable for client distribution.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| All analysis skills (B-*) | Analysis progress and results | Activities and deliverables status |
| `create-meeting-minutes` (C-MIN-015) | Action items from meetings | Action item tracking |
| User | Raw progress data, notes, updates | Report content |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-executive-briefing` (C-BRIEF-018) | Project status for briefings | Pre-meeting preparation |
| `create-client-presentation` (C-PRES-012) | Progress data for presentations | Monthly/quarterly reviews |

---

## Templates & References

### Templates
- `templates/weekly_report_template.docx` - Standard weekly report template.
- `templates/milestone_tracker_template.xlsx` - Milestone tracking spreadsheet.
- `templates/action_item_tracker_template.xlsx` - Action item log template.

### Reference Documents
- VSC internal: "Estandar de Reportes de Avance v2.0"
- PMI PMBOK Guide - Project communications management

---

## Examples

### Example 1: Asset Management Consulting Project

**Input:**
- Progress: Completed criticality analysis for 150 equipment items, started reliability analysis.
- Milestones: Criticality analysis delivered on time; Reliability analysis started 2 days late.
- Issues: Client CMMS data quality issues delaying reliability analysis.
- Report period: February 10-14, 2025, Report #6.

**Expected Output:**
- Status: Overall Yellow (schedule slightly at risk due to data quality).
- Executive summary highlights criticality completion and data quality issue.
- 3 activities completed, 2 in progress.
- 1 issue documented: "CMMS failure data contains 35% incomplete records; data cleaning required."
- Action item: Client IT to provide additional data extract by Feb 18.
- Next week: Complete data cleaning, continue reliability analysis.

### Example 2: O&M Contract Development

**Input:**
- Progress: OPEX budget model 80% complete, staffing plan finalized, energy model under review.
- Milestones: Staffing plan approved (on time), OPEX model due next week.
- Issues: None.
- Report period: March 3-7, 2025, Report #10.

**Expected Output:**
- Status: Overall Green.
- Key achievement: Staffing plan approved by client (120 FTE, 4x3 roster).
- OPEX model 80% complete; energy model pending client tariff data.
- No issues or risks.
- Next week: Finalize OPEX model, begin contract structure drafting.
