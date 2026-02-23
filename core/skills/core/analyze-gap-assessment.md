# Analyze Gap Assessment

## Skill ID: B-GAP-005

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P2 - High (drives improvement roadmaps and maturity assessments)

---

## Purpose

Perform structured gap analysis and maturity assessments of an organization's asset management practices against recognized industry standards (ISO 55000/55001/55002, PAS 55, GFMAM competency framework). This skill evaluates current practices, identifies gaps, quantifies maturity levels, and produces prioritized improvement roadmaps with actionable recommendations.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Assess** current asset management practices against a selected standard or framework.
2. **Score** maturity levels across all assessment dimensions using a consistent 1-5 scale.
3. **Identify** gaps between current state and target state.
4. **Prioritize** gaps based on impact, effort, and strategic alignment.
5. **Generate** a prioritized improvement roadmap with timelines and resource estimates.
6. **Produce** outputs in `.xlsx` (detailed scoring) and `.docx` (narrative report) formats.

---

## Trigger / Invocation

**Command:** `/analyze-gap-assessment`

**Trigger Conditions:**
- User requests a maturity assessment or gap analysis against a standard.
- An organization needs to evaluate readiness for ISO 55001 certification.
- A project requires baseline assessment of asset management capabilities.
- Improvement roadmap development is needed.

**Aliases:**
- `/gap-analysis`
- `/maturity-assessment`
- `/iso55000-assessment`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `current_practices` | `.docx`, `.xlsx`, text, or interview transcripts | Description of current asset management practices, policies, processes |
| `target_standard` | Text | Standard to assess against: ISO 55001, PAS 55, GFMAM, or custom framework |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `previous_assessment` | `.xlsx` | Previous gap assessment for trend/progress comparison |
| `organizational_context` | `.docx` or text | Organization structure, size, industry, strategic objectives |
| `existing_documentation` | `.pdf`, `.docx` | Existing AM policies, strategies, plans, procedures |
| `target_maturity` | Number (1-5) | Desired target maturity level (default: 3 - Defined/Managed) |
| `interview_notes` | `.docx` or text | Notes from interviews with key stakeholders |
| `kpi_data` | `.xlsx` | Current KPI performance data as evidence |
| `priority_areas` | List | Specific areas of focus or concern |
| `certification_target` | Boolean | Whether ISO 55001 certification is the goal |

### Input Validation Rules

1. Current practices description must cover at minimum 5 of the standard's main clauses/sections.
2. Target standard must be a recognized framework (ISO 55001, PAS 55, GFMAM, or custom with structure provided).
3. If certification is the target, assessment must cover all mandatory clauses of ISO 55001.

---

## Output Specification

### Primary Output 1: Scoring Matrix (`.xlsx`)

**File naming:** `{project_code}_gap_assessment_{standard}_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Dashboard` | Overall maturity score, radar chart data, top gaps, heat map |
| `Detailed Scoring` | Full scoring matrix: every requirement, current score, target score, gap |
| `Evidence Register` | Evidence collected/referenced for each score |
| `Gap Prioritization` | Gaps ranked by impact x effort, quick wins identified |
| `Improvement Roadmap` | Phased improvement plan with timeline and resources |
| `Trend Comparison` | Progress vs. previous assessment (if provided) |
| `Methodology` | Scoring criteria, assessment process, assessor notes |

### Detailed Scoring Sheet - Column Structure

| Column | Description |
|--------|-------------|
| `Clause/Section` | Standard clause reference (e.g., 4.1, 6.2.1) |
| `Requirement` | Requirement description from the standard |
| `Sub-requirement` | Detailed sub-requirement (where applicable) |
| `Current_Score` | Current maturity level (1-5) |
| `Target_Score` | Target maturity level (1-5) |
| `Gap` | Target - Current (0 = no gap, positive = improvement needed) |
| `Evidence` | Evidence supporting the current score |
| `Finding` | Specific finding/observation |
| `Risk_If_Not_Addressed` | Consequence of not closing this gap |
| `Recommendation` | Specific recommendation to close the gap |
| `Priority` | Priority level (Critical, High, Medium, Low) |
| `Estimated_Effort` | Effort to close gap (months, person-days) |
| `Quick_Win` | Boolean - can be addressed in < 3 months with minimal resources |

### Primary Output 2: Assessment Report (`.docx`)

**File naming:** `{project_code}_gap_assessment_report_{YYYYMMDD}.docx`

**Report structure:**

| Section | Content |
|---------|---------|
| 1. Executive Summary | Overall maturity score, key findings, top recommendations |
| 2. Assessment Scope & Methodology | Standard used, areas assessed, scoring criteria |
| 3. Organizational Context | Organization profile, AM objectives, operating context |
| 4. Overall Results | Maturity radar chart, heat map, score distribution |
| 5. Detailed Findings by Clause | Per-clause findings, scores, evidence, recommendations |
| 6. Gap Prioritization | Prioritized gap list with impact/effort matrix |
| 7. Improvement Roadmap | Phased plan (Quick Wins, Short-term, Medium-term, Long-term) |
| 8. Resource Requirements | Estimated resources for improvement implementation |
| 9. Appendices | Scoring criteria definitions, evidence register, interview list |

---

## Methodology & Standards

### Supported Assessment Frameworks

#### ISO 55001:2014 (Asset Management - Requirements)

| Clause | Area | Sub-clauses |
|--------|------|-------------|
| 4 | Context of the Organization | 4.1-4.4 |
| 5 | Leadership | 5.1-5.3 |
| 6 | Planning | 6.1-6.2 |
| 7 | Support | 7.1-7.6 |
| 8 | Operation | 8.1-8.3 |
| 9 | Performance Evaluation | 9.1-9.3 |
| 10 | Improvement | 10.1-10.3 |

#### PAS 55:2008 (Asset Management Specification)

| Section | Area |
|---------|------|
| 4.1 | General Requirements |
| 4.2 | Asset Management Policy |
| 4.3 | Asset Management Strategy, Objectives & Plans |
| 4.4 | Asset Management Enablers & Controls |
| 4.5 | Implementation of Asset Management Plans |
| 4.6 | Performance Assessment & Improvement |
| 4.7 | Management Review |

#### GFMAM 39 Subjects (Global Forum on Maintenance & Asset Management)

Organized into 6 groups with 39 subjects covering the full spectrum of asset management.

### Maturity Scoring Scale (1-5)

| Level | Name | Description |
|-------|------|-------------|
| **1** | **Innocent / Ad-hoc** | No formal process. Reactive, individual-dependent. No documentation. Results are unpredictable. |
| **2** | **Aware / Repeatable** | Basic processes exist but inconsistently applied. Some documentation. Key person dependent. Limited measurement. |
| **3** | **Developing / Defined** | Documented processes, consistently applied. Roles defined. KPIs established and tracked. Systematic approach. |
| **4** | **Competent / Managed** | Processes integrated across organization. Data-driven decision making. Continuous measurement and feedback. Proactive approach. |
| **5** | **Optimizing / Excellence** | Best-in-class practices. Continuous improvement embedded. Innovation driven. Predictive and prescriptive approach. Industry leader. |

### Gap Prioritization Matrix

```
Priority = Impact_Score * Urgency_Score / Effort_Score

Impact_Score (1-5):
5 = Critical for certification / regulatory compliance
4 = Major business impact (safety, production, cost)
3 = Significant organizational improvement
2 = Moderate improvement
1 = Minor/incremental improvement

Urgency_Score (1-5):
5 = Required immediately (regulatory, safety)
4 = Required within 6 months
3 = Required within 12 months
2 = Required within 24 months
1 = Desirable but not time-critical

Effort_Score (1-5):
1 = Quick win (< 1 month, minimal resources)
2 = Low effort (1-3 months, existing resources)
3 = Moderate effort (3-6 months, some additional resources)
4 = Significant effort (6-12 months, dedicated resources)
5 = Major initiative (> 12 months, significant investment)
```

### Improvement Roadmap Phases

| Phase | Timeframe | Focus |
|-------|-----------|-------|
| **Quick Wins** | 0-3 months | Low effort, high impact items. Documentation, policy statements, quick process improvements. |
| **Short-term** | 3-6 months | Foundation building. Core processes, role definitions, basic KPIs, training. |
| **Medium-term** | 6-18 months | System development. Technology enablement, process integration, data management. |
| **Long-term** | 18-36 months | Maturity advancement. Optimization, continuous improvement, culture change. |

---

## Step-by-Step Execution

### Phase 1: Preparation (Steps 1-3)

**Step 1: Establish assessment framework.**
- Confirm the target standard (ISO 55001, PAS 55, GFMAM, or custom).
- Load the complete requirement set for the selected standard.
- Confirm target maturity level (default: Level 3).
- Define assessment scope (full standard or specific clauses).

**Step 2: Gather and organize evidence.**
- Review all provided documentation (policies, procedures, plans).
- Extract key practices, processes, and capabilities from inputs.
- Organize evidence by standard clause/section.
- Identify areas with no evidence or insufficient information.

**Step 3: Establish organizational context.**
- Understand organization size, industry, complexity.
- Identify strategic asset management objectives.
- Understand regulatory and compliance requirements.
- Calibrate expectations based on organizational context.

### Phase 2: Assessment (Steps 4-6)

**Step 4: Score each requirement.**
- For each clause/requirement of the standard:
  - Evaluate current practices against the maturity scale.
  - Assign current maturity score (1-5) with justification.
  - Document evidence supporting the score.
  - Note specific findings and observations.
  - Identify the gap (target - current).

**Step 5: Cross-check and calibrate scores.**
- Review scores for internal consistency across related clauses.
- Ensure scoring calibration is consistent (similar practices = similar scores).
- Verify that scores align with evidence strength.
- Adjust scores if cross-referencing reveals inconsistencies.

**Step 6: Prioritize gaps.**
- Calculate priority score for each gap (Impact x Urgency / Effort).
- Classify each gap as Critical, High, Medium, or Low priority.
- Identify quick wins (high impact, low effort).
- Group related gaps that can be addressed together.

### Phase 3: Roadmap & Output (Steps 7-9)

**Step 7: Develop improvement roadmap.**
- Assign each recommendation to a roadmap phase (Quick Win, Short, Medium, Long-term).
- Estimate resources required (person-months, budget range).
- Identify dependencies between improvements.
- Create a logical implementation sequence.

**Step 8: Build output workbook and report.**
- Populate the `.xlsx` scoring matrix with all assessments.
- Generate radar chart data for overall maturity visualization.
- Create the `.docx` narrative report with findings and recommendations.
- Include comparison with previous assessment if available.

**Step 9: Final review and validation.**
- Verify all clauses/requirements are assessed (100% coverage).
- Confirm recommendations are specific, actionable, and measurable.
- Validate that the roadmap is realistic and achievable.
- Ensure report is suitable for executive audience.

---

## Quality Criteria

### Assessment Rigor
- [ ] 100% of in-scope standard clauses/requirements are assessed.
- [ ] Every score has documented evidence or stated assumption.
- [ ] Scores are calibrated consistently across all areas.
- [ ] Findings are specific and factual, not generic.

### Actionability
- [ ] Every gap has a specific, actionable recommendation.
- [ ] Roadmap phases have realistic timelines and resource estimates.
- [ ] Quick wins are genuinely achievable in < 3 months.
- [ ] Dependencies between improvements are identified.

### Report Quality
- [ ] Executive summary is concise and impactful (max 2 pages).
- [ ] Radar chart clearly shows maturity profile.
- [ ] Report is suitable for C-level audience.
- [ ] Technical appendices provide sufficient detail for implementation teams.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `extract-data-from-docs` (C-EXT-014) | Structured data from AM documentation | Evidence extraction |
| `summarize-documents` (C-SUM-010) | Summaries of lengthy AM documents | Efficient document review |
| `research-deep-topic` (C-RES-009) | Best practice references for benchmarking | Calibration of scoring |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-client-presentation` (C-PRES-012) | Assessment results, radar charts | Client presentation of findings |
| `analyze-benchmark` (B-BENCH-006) | Maturity scores for comparison | Industry benchmarking |
| `create-case-study` (C-CASE-019) | Before/after maturity improvement | Value demonstration |
| `create-executive-briefing` (C-BRIEF-018) | Key findings and recommendations | Pre-meeting preparation |

---

## Templates & References

### Templates
- `templates/gap_assessment_iso55001_template.xlsx` - Full ISO 55001 scoring matrix.
- `templates/gap_assessment_pas55_template.xlsx` - PAS 55 assessment template.
- `templates/gap_assessment_report_template.docx` - Standard report template.
- `templates/maturity_radar_chart_template.xlsx` - Radar chart visualization template.

### Reference Documents
- ISO 55000:2014 - Asset management: Overview, principles and terminology
- ISO 55001:2014 - Asset management: Management systems - Requirements
- ISO 55002:2018 - Asset management: Guidelines for the application of ISO 55001
- PAS 55-1:2008 - Asset Management Specification
- GFMAM "The Asset Management Landscape" (3rd Edition)
- IAM "Anatomy of Asset Management" (Version 3)

---

## Examples

### Example 1: Mining Company ISO 55001 Readiness

**Input:**
- Current practices: Maintenance-centric approach, SAP PM implemented, basic KPIs tracked.
- Target: ISO 55001 certification readiness within 18 months.
- Available documentation: Maintenance policy, some procedures, annual budget.

**Expected Output:**
- Overall maturity: 2.1 (Aware/Repeatable).
- Strongest area: Clause 8 - Operation (2.8) - good maintenance execution.
- Weakest areas: Clause 4 - Context (1.5) - no stakeholder analysis or AM scope defined.
  Clause 6 - Planning (1.7) - no AM objectives linked to organizational objectives.
- Top recommendations:
  1. [Quick Win] Develop AM Policy statement aligned with ISO 55001 Clause 5.2.
  2. [Short-term] Define AM scope, stakeholder requirements, and risk framework.
  3. [Medium-term] Establish AM objectives with KPIs linked to business strategy.
- Roadmap: 14 improvement initiatives across 4 phases to reach target Level 3.

### Example 2: Water Utility PAS 55 Gap Analysis

**Input:**
- Current practices: Established utility with 20+ years operation, mixed paper/digital processes.
- Target: PAS 55 Level 3 (Developing) across all areas.
- Previous assessment: Done 2 years ago, overall score 1.8.

**Expected Output:**
- Overall maturity: 2.3 (improved from 1.8, +0.5 in 2 years).
- Areas improved: Policy (+0.8), Performance Assessment (+0.6).
- Areas stagnant: Asset Information Management (still 1.5), Risk Management (still 1.6).
- Remaining gap to target: 0.7 average (range 0.2 to 1.5).
- Estimated timeline to Level 3: 12-18 months with focused effort.
- Priority focus: Asset information/data management and risk-based decision making.
