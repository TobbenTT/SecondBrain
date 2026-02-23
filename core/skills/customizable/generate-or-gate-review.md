# Generate OR Gate Review

## Skill ID: H-03
## Version: 1.0.0
## Category: H. Orchestration
## Priority: P0 - Critical

## Purpose

Generate comprehensive Gate Review packages for project advancement decisions at each phase gate of the Operational Readiness program. A Gate Review package is the evidence-based document that enables a Steering Committee or Gate Review Board to make an informed go/no-go decision on whether a capital project should advance to the next phase. This skill synthesizes data from all OR domains into a structured package that includes completeness summaries by domain, quantitative risk assessments, go/no-go recommendations with supporting evidence, action items with ownership, and financial impact analysis.

Gate Reviews are the governance mechanism that prevents the most damaging failure mode in capital projects: advancing to the next phase before the current phase's work is complete. EY reports that 65% of infrastructure projects fail to meet their objectives (Pain Point E-01), and a primary driver is weak project governance (Pain Point E-03) that allows projects to pass through gates without adequate readiness. The Oil & Gas industry documents 12-24 month delays in the CAPEX-to-OPEX transition (Pain Point OG-01), often traceable to gates that were "waved through" without rigorous evidence of readiness. Deloitte's finding of 60%+ OR deficiencies at handover (Pain Point D-01) is the direct consequence of gate reviews that did not enforce completeness criteria.

The difference between a gate review that catches problems early (when they are cheap to fix) and one that rubber-stamps progress (allowing problems to compound) is the quality and objectivity of the gate review package. This skill ensures that every gate review is backed by data, scored against objective criteria, and accompanied by a clear recommendation with full transparency about risks, conditions, and outstanding actions.

The OR program uses a six-gate framework:
- **Gate G1 (OR Strategy Approved):** During FEED phase -- validates that the OR strategy, scope, budget, and governance are defined
- **Gate G2 (OR Plans Complete):** During Detailed Engineering -- validates that detailed plans exist for all OR domains
- **Gate G3 (OR Execution On Track):** During Construction -- validates that OR execution is progressing per plan
- **Gate G4 (Ready for Commissioning):** Pre-Commissioning -- validates that all OR prerequisites for commissioning are met
- **Gate G5 (Ready for Operations):** During Commissioning -- validates readiness for commercial operation
- **Gate G6 (Steady State Declared):** During Ramp-Up -- validates that steady-state performance criteria are met

## Intent & Specification

**Problem:** Gate reviews in capital projects suffer from several systemic failures:

1. **Subjective assessments replace evidence.** Domain leads report "we're on track" without quantitative evidence. The gate review becomes a confidence exercise rather than an evidence-based decision. McKinsey's finding of 80% cost overruns (M-02) correlates with projects where gate reviews failed to catch problems early.

2. **Incomplete data.** Gate packages are assembled manually from fragmented sources. Key domains are missing data, risk assessments are stale, and financial impacts are estimated rather than calculated. This produces decisions based on incomplete information.

3. **No standardization.** Each gate review uses a different format, different criteria, and different rigor. Without standardized criteria, "pass" means different things at different gates and different projects.

4. **Delayed preparation.** Gate packages are often assembled in the final days before the review, leaving no time for corrective action. The review becomes a report of problems rather than a decision point that can influence outcomes.

5. **Weak recommendations.** Gate packages present data without synthesizing it into a clear recommendation. The review board must interpret raw data under time pressure, leading to poor decisions or deferred decisions.

6. **No follow-through on conditions.** Conditional passes are granted, but conditions are not tracked to closure. The same issues resurface at the next gate, compounded by additional problems.

**Success Criteria:**
- Gate review packages generated automatically from live OR tracking data (not manually assembled)
- Every domain represented with quantitative completeness scoring
- Risk assessment is quantitative (probability x impact matrix) with trend data
- Go/no-go recommendation is explicit with supporting evidence for and against
- Conditional pass includes specific, measurable conditions with owners and deadlines
- Action items are tracked from gate to gate with closure verification
- Package delivered T-7 days before gate review for adequate pre-read time
- Gate decisions are recorded and transmitted to all stakeholders within 24 hours
- Conditions from previous gates verified at subsequent gates
- Package generation time: <4 hours (vs. 40-80 hours manual)

**Constraints:**
- Must pull data from live OR tracking systems (mcp-airtable, mcp-sharepoint)
- Must include data from all 12+ OR domains regardless of reporting compliance
- Must produce both executive presentation format (PPTX) and detailed supporting document (DOCX)
- Must support client-specific gate definitions and criteria
- Must handle bilingual output (English/Spanish)
- Must be generated at least T-7 before gate date; earlier generation at T-14 for pre-assessment
- Must integrate with track-or-deliverables (H-02) for current deliverable status
- Must not recommend "PASS" if any mandatory criteria are not met (system-enforced)
- Must preserve historical gate data for trend analysis across gates

## Trigger / Invocation

**Primary Triggers:**
- `generate-or-gate-review prepare --project [name] --gate [G1|G2|G3|G4|G5|G6]`
- `generate-or-gate-review pre-assessment --project [name] --gate [G1-G6]` (T-14 preview)
- `generate-or-gate-review update --project [name] --gate [G1-G6]` (refresh existing package)
- `generate-or-gate-review record-decision --project [name] --gate [G1-G6] --decision [pass|conditional|hold|fail]`
- `generate-or-gate-review verify-conditions --project [name] --gate [G1-G6]` (check prior gate conditions)
- `generate-or-gate-review history --project [name]` (gate review history across all gates)

**Aliases:** `/gate-review`, `/or-gate`, `/gate-package`

**Automatic Triggers:**
- T-14 days before gate date: Generate pre-assessment (identifies at-risk items for corrective action)
- T-7 days before gate date: Generate full gate review package
- Orchestrator requests gate package (via orchestrate-or-program Step 8)
- Post-gate: Record decision and generate action tracker
- Pre-next-gate: Verify conditions from previous gate are closed

**Event-Driven Triggers:**
- Client requests ad-hoc gate review (unscheduled)
- Significant scope change triggers gate re-assessment
- Multiple domains enter RED status (triggers emergency gate review consideration)
- Previous gate conditions approaching their deadlines

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Deliverable Register Data | track-or-deliverables (H-02) / mcp-airtable | Yes | Current status of all deliverables per domain with completion % |
| Gate Criteria Definition | Project config / agent-or-pmo | Yes | Specific criteria for the gate being reviewed |
| Risk Register | orchestrate-or-program (H-01) / mcp-airtable | Yes | Current risk register with scores and trends |
| Schedule Data | mcp-project-online | Yes | Project schedule milestones and variances |
| Financial Data | agent-finance | Yes | Budget vs. actuals, forecast at completion |
| Agent Narrative Updates | All specialist agents / Inbox | Yes | Qualitative updates per domain (achievements, issues, outlook) |
| Previous Gate Decisions | Gate history database | No | Decisions and conditions from prior gates |
| Previous Gate Packages | mcp-sharepoint | No | Prior gate packages for trend comparison |
| Stakeholder Feedback | mcp-outlook / mcp-teams | No | Any stakeholder concerns or queries raised pre-gate |
| Industry Benchmarks | Knowledge base | No | Benchmark data for contextualizing readiness levels |

**Gate Criteria Schema:**
```yaml
gate_criteria:
  gate: "G4"
  name: "Ready for Commissioning"

  mandatory_criteria:
    # ALL mandatory criteria must be met for PASS recommendation
    - id: "MC-G4-01"
      criterion: "All critical SOPs approved and trained"
      domain: "Operations"
      evidence: "SOP register showing 100% critical SOPs in 'approved' status with training records"
      evaluator: "agent-operations + agent-hr"
    - id: "MC-G4-02"
      criterion: "Operations team hired and on-site"
      domain: "HR"
      evidence: "Staffing plan showing >95% critical positions filled"
      evaluator: "agent-hr"
    - id: "MC-G4-03"
      criterion: "CMMS configured with PM schedules loaded"
      domain: "Maintenance"
      evidence: "CMMS screenshots showing PM tasks scheduled"
      evaluator: "agent-maintenance"
    - id: "MC-G4-04"
      criterion: "Emergency response plan tested"
      domain: "HSE"
      evidence: "Drill report with corrective actions closed"
      evaluator: "agent-hse"
    - id: "MC-G4-05"
      criterion: "Critical spare parts on site"
      domain: "Procurement"
      evidence: "Spare parts inventory vs. commissioning requirements list"
      evaluator: "agent-procurement"
    - id: "MC-G4-06"
      criterion: "Operating permits obtained"
      domain: "Legal"
      evidence: "Permit register showing all required permits in 'granted' status"
      evaluator: "agent-legal"
    - id: "MC-G4-07"
      criterion: "Process safety management systems active"
      domain: "HSE"
      evidence: "PSM audit report with no critical findings"
      evaluator: "agent-hse"

  standard_criteria:
    # 80%+ of standard criteria should be met
    - id: "SC-G4-01"
      criterion: "All operating procedures complete"
      domain: "Operations"
      evidence: "SOP register showing >90% complete"
    - id: "SC-G4-02"
      criterion: "Maintenance team trained on critical equipment"
      domain: "Maintenance"
      evidence: "Training register showing certification status"
    - id: "SC-G4-03"
      criterion: "Supply chain contracts executed"
      domain: "Procurement"
      evidence: "Contract register showing all O&M contracts signed"
    - id: "SC-G4-04"
      criterion: "Financial systems configured for operations"
      domain: "Finance"
      evidence: "ERP system configuration validation report"
    # ... additional standard criteria

  pass_thresholds:
    mandatory: 100%  # All mandatory criteria must pass
    standard: 80%    # 80% of standard criteria must pass
    overall_readiness: 85%  # Weighted deliverable completion
    critical_risks: "No unmitigated CRITICAL risks"

  conditional_pass_rules:
    max_unmet_standard: 3  # Max standard criteria that can be unmet
    condition_completion_window: 30  # Days to complete conditions
    no_safety_critical_gaps: true  # Cannot conditionally pass safety items

  fail_conditions:
    - "Any mandatory criterion not met and not achievable within 30 days"
    - "Overall readiness < 70%"
    - "Unmitigated CRITICAL risk with safety implications"
    - "Previous gate conditions not closed"
```

## Output Specification

### 1. Gate Review Package - Executive Presentation (PPTX)
**Filename:** `{ProjectCode}_Gate_{G}_Review_Package_{date}.pptx`
**Structure (18-25 slides):**

```
Slide 1: Title Slide
  - "Gate {G} Review: {Gate Name}"
  - Project: {Project Name}
  - Date: {Date}
  - Prepared by: OR Orchestration System / VSC

Slide 2: Executive Summary
  - Overall Readiness: {X}% [{RAG}]
  - Recommendation: {PASS / CONDITIONAL PASS / HOLD / FAIL}
  - Key highlights (3-5 bullet points)
  - Key concerns (3-5 bullet points)
  - Decisions required (1-3 items)

Slide 3: Readiness Dashboard
  - Domain heat map (12 domains with RAG indicators)
  - Overall completion gauge
  - Trend chart (readiness % over last 3 months)
  - Key metrics summary table

Slide 4: Gate Criteria Assessment
  - Mandatory criteria: {X}/{Y} met [{RAG}]
  - Standard criteria: {X}/{Y} met [{RAG}]
  - Table showing each criterion, status, and evidence

Slide 5: Recommendation & Rationale
  - Go/No-Go recommendation with clear rationale
  - Evidence supporting recommendation (quantitative)
  - Risks of proceeding vs. risks of delay
  - Conditions (if conditional pass)

Slides 6-17: Domain Summaries (one slide per domain)
  - Domain: {Name} | Status: {RAG} | Readiness: {X}%
  - Deliverables: {complete}/{total} | Critical: {complete}/{total}
  - Key achievements this phase
  - Key issues and risks
  - Status of gate-specific deliverables
  - Outlook for next phase

Slide 18: Risk Assessment Summary
  - Risk heat map (probability vs. impact matrix)
  - Top 5 risks with mitigation status
  - New risks identified since last gate
  - Risks closed since last gate
  - Risk trend (improving, stable, worsening)

Slide 19: Schedule Status
  - Schedule variance analysis
  - Critical path status
  - Milestones achieved vs. planned
  - Forecast for next gate

Slide 20: Financial Summary
  - Budget vs. actual spend (chart)
  - Forecast at completion
  - Key variances with explanation
  - Contingency status

Slide 21: Previous Gate Conditions Status
  - Table: condition, owner, deadline, status
  - Any conditions not yet closed: explanation and impact

Slide 22: Action Items
  - Actions from this gate review
  - Each with: description, owner, deadline, priority
  - Conditions for conditional pass (if applicable)

Slide 23: Next Phase Plan
  - Key activities for next phase
  - Key milestones and dates
  - Resource requirements
  - Key risks for next phase

Slide 24: Decision Record
  - Space for gate decision recording
  - Signature block for review board
  - Date and attendees

Slide 25: Appendix References
  - Link to detailed supporting document
  - Link to deliverable register
  - Link to OR dashboard
  - Link to risk register
```

### 2. Gate Review Package - Detailed Supporting Document (DOCX)
**Filename:** `{ProjectCode}_Gate_{G}_Supporting_Document_{date}.docx`
**Structure (40-60 pages):**

```markdown
# Gate {G} Review - Detailed Supporting Document
## {Project Name}
## Document Number: {ProjectCode}-PMO-GATE-{G}-{Rev}
## Date: {Date}

## PART A: GATE ASSESSMENT

### 1. Gate Overview
- Gate definition and purpose
- Gate criteria summary
- Assessment methodology
- Data sources and currency

### 2. Mandatory Criteria Assessment
For each mandatory criterion:
- Criterion statement
- Assessment result: PASS / FAIL / CONDITIONAL
- Evidence summary
- Evidence documents (referenced)
- If FAIL: gap description, recovery plan, timeline
- If CONDITIONAL: condition, owner, deadline

### 3. Standard Criteria Assessment
For each standard criterion:
- Same structure as mandatory criteria

### 4. Overall Readiness Score
- Weighted completion calculation methodology
- Score by domain (table)
- Score by criticality (critical/high/medium)
- Comparison with plan target
- Comparison with industry benchmark
- Trend from previous gate

## PART B: DOMAIN DETAIL

### 5-16. Domain Reports (one chapter per domain)
For each of the 12 domains:

#### {Domain Name} Readiness Report
- 5.1 Domain Overview
  - Scope and objectives for this gate
  - Key personnel
  - Budget allocation and spend

- 5.2 Deliverable Status
  | DEL ID | Title | Criticality | Status | Progress | Gate Due | Forecast | RAG |
  |--------|-------|-------------|--------|----------|---------|----------|-----|
  | ... | ... | ... | ... | ... | ... | ... | ... |

- 5.3 Key Achievements This Phase
  - Itemized list of completed deliverables
  - Significant milestones achieved
  - Problems resolved

- 5.4 Key Issues and Risks
  - Current issues with impact and mitigation
  - Domain-specific risks with scoring
  - Resource constraints or shortfalls

- 5.5 Interdependency Status
  - Dependencies on other domains: status
  - Dependencies provided to other domains: status
  - Any blocked or at-risk interdependencies

- 5.6 Next Phase Plan
  - Key deliverables due at next gate
  - Resource requirements
  - Critical path items

- 5.7 Domain Lead Assessment
  - Self-assessment: READY / CONDITIONAL / NOT READY
  - Justification and key concerns

## PART C: CROSS-CUTTING ANALYSIS

### 17. Risk Assessment
- Complete risk register (snapshot at gate date)
- Risk heat map with all risks plotted
- Risk movement since last gate (new, escalated, de-escalated, closed)
- Systemic risks (affecting multiple domains)
- Risk exposure calculation:
  Expected Loss = SUM(Probability_i * Impact_i) for all open risks
- Risk trend analysis (historical scoring over time)

### 18. Schedule Analysis
- Master schedule status with OR milestones
- Critical path identification and status
- Schedule Performance Index (SPI) by domain and overall
- Schedule risk: probabilistic analysis of gate dates
- Impact of current delays on downstream phases

### 19. Financial Analysis
- Budget vs. actual by domain (table + chart)
- Cost Performance Index (CPI) by domain and overall
- Estimate at Completion (EAC) and Variance at Completion (VAC)
- Contingency utilization and remaining contingency
- Key cost variances with root cause analysis

### 20. Interdependency Analysis
- Cross-domain dependency matrix
- Dependencies resolved this phase
- Dependencies outstanding (at-risk)
- Impact of outstanding dependencies on downstream activities

### 21. Lessons Learned (from this phase)
- What worked well
- What should be improved
- Recommendations for next phase

## PART D: RECOMMENDATION

### 22. Gate Recommendation
- Recommendation: PASS / CONDITIONAL PASS / HOLD / FAIL
- Rationale (structured argument):
  - Evidence supporting advancement
  - Evidence against advancement
  - Risk of proceeding vs. risk of delay
  - Net assessment

- If CONDITIONAL PASS:
  | Condition | Owner | Deadline | Priority | Verification Method |
  |-----------|-------|----------|----------|-------------------|
  | {condition} | {owner} | {date} | {high/medium} | {how to verify} |

- If HOLD:
  | Issue Requiring Resolution | Owner | Action | Timeline |
  |---------------------------|-------|--------|----------|
  | {issue} | {owner} | {action} | {timeline} |
  - Recommended re-review date

- If FAIL:
  - Critical gaps identified
  - Recovery plan requirements
  - Recommended re-assessment timeline
  - Resource and budget implications of delay

### 23. Action Items Register
| # | Action | Owner | Deadline | Priority | Gate | Status |
|---|--------|-------|----------|----------|------|--------|
| 1 | {action} | {owner} | {date} | {priority} | G{N} | Open |

### 24. Decision Record
- Decision: {recorded after review}
- Decision Authority: {name, title}
- Date: {date}
- Attendees: {list}
- Conditions: {if applicable}
- Dissenting views: {if any}
- Next gate date: {confirmed/revised}

## APPENDICES
### A. Deliverable Register Extract (all gate deliverables)
### B. Complete Risk Register
### C. Financial Detail by Domain
### D. Schedule Detail (Gantt extract)
### E. Evidence Documents Index
### F. Previous Gate Decision Record
### G. Previous Gate Conditions Closure Report
```

### 3. Gate Decision Record (Airtable)
```yaml
gate_decision:
  project: "Sierra Verde Copper Expansion"
  gate: "G4"
  gate_name: "Ready for Commissioning"
  review_date: "2027-06-01"
  decision: "conditional_pass"
  decision_authority: "Project Director"
  overall_readiness_pct: 91.2
  mandatory_criteria_met: "7/7"
  standard_criteria_met: "18/22"
  conditions:
    - condition: "Complete remaining 3 SOPs for Area 400"
      owner: "Operations Manager"
      deadline: "2027-06-30"
      status: "open"
      verification: "SOP register showing approved status"
    - condition: "Resolve CMMS integration issue with vendor"
      owner: "Maintenance Manager"
      deadline: "2027-06-15"
      status: "open"
      verification: "CMMS acceptance test report"
    - condition: "Complete ERP financial configuration"
      owner: "Finance Manager"
      deadline: "2027-06-30"
      status: "open"
      verification: "ERP configuration validation report"
  action_items:
    - action: "Schedule weekly condition progress calls"
      owner: "OR Manager"
      deadline: "2027-06-08"
    - action: "Prepare commissioning team mobilization plan"
      owner: "Project Manager"
      deadline: "2027-06-15"
  attendees: ["Project Director", "VP Operations", "OR Manager", "CFO", "EPC PM"]
  next_gate: "G5"
  next_gate_date: "2027-12-01"
  notes: "Board noted excellent progress in HSE and Operations domains. Maintenance CMMS delay acknowledged with vendor commitment to resolve by June 15."
```

### 4. Conditions Tracker (Airtable)
```yaml
condition_tracker:
  - condition_id: "G4-COND-01"
    gate: "G4"
    condition: "Complete remaining 3 SOPs for Area 400"
    owner: "Operations Manager"
    deadline: "2027-06-30"
    status: "in_progress"  # open | in_progress | complete | overdue | waived
    progress_notes:
      - date: "2027-06-10"
        note: "2 of 3 SOPs completed. Third SOP (Area 400 Emergency Shutdown) in final review."
      - date: "2027-06-20"
        note: "Third SOP approved. Condition met."
    date_closed: "2027-06-20"
    verified_by: "OR Manager"
    evidence: "SOP-A400-ES-001-Rev0 approved in SharePoint on 2027-06-20"
```

## Methodology & Standards

### Gate Review Philosophy

1. **Evidence Over Opinion:** Every assessment is backed by data from the OR tracking system. Subjective assessments are allowed only as supplements to quantitative evidence, never as replacements.

2. **Binary Mandatory Criteria:** Mandatory criteria are PASS or FAIL with no gray area. A mandatory criterion is either demonstrably met (with evidence) or it is not met. There is no "almost met" for mandatory items.

3. **Quantitative Scoring:** Overall readiness is calculated as a weighted average of domain completeness, not as a subjective assessment. The methodology is transparent and reproducible.

4. **Conditional Pass Discipline:** A conditional pass is not a free pass. Conditions must be specific, measurable, owned, and time-bound. Conditions are tracked to closure and verified before the next gate. If conditions are not met by deadline, the gate decision is automatically escalated.

5. **Historical Continuity:** Each gate review references previous gate decisions and verifies that prior conditions were met. This creates accountability and prevents recurring issues from being repeatedly deferred.

6. **Decision Documentation:** Gate decisions are formally recorded with the decision authority, rationale, conditions, dissenting views, and next steps. This creates an auditable governance trail.

### Scoring Methodology

**Domain Readiness Score:**
```
Domain_Score = (SUM(deliverable_progress * deliverable_weight)) / (SUM(deliverable_weight)) * 100

Where:
  deliverable_progress = 0.0 to 1.0 (0% to 100%)
  deliverable_weight = 3 (critical), 2 (high), 1 (medium)

  Only deliverables due at or before the current gate are included
```

**Overall Readiness Score:**
```
Overall_Score = SUM(Domain_Score_i * Domain_Weight_i) / SUM(Domain_Weight_i)

Where:
  Domain_Weight = determined by domain priority in project config
  Critical domains weight = 3
  High domains weight = 2
  Medium domains weight = 1
```

**Risk Exposure Score:**
```
Risk_Exposure = SUM(Probability_i * Impact_i * Domain_Criticality_i) / N

Where:
  Probability = 1 to 5 (very low to very high)
  Impact = 1 to 5 (negligible to catastrophic)
  Domain_Criticality = 1 to 3 (based on domain weight)
  N = number of open risks
```

**Gate Readiness Index (GRI):**
```
GRI = (0.40 * Overall_Readiness) + (0.25 * Mandatory_Criteria_Score) +
      (0.20 * Standard_Criteria_Score) + (0.15 * (100 - Risk_Exposure_Normalized))

Where:
  Mandatory_Criteria_Score = (met / total) * 100
  Standard_Criteria_Score = (met / total) * 100
  Risk_Exposure_Normalized = Risk_Exposure scaled to 0-100

  GRI >= 85: Recommend PASS
  GRI 70-84: Recommend CONDITIONAL PASS
  GRI 55-69: Recommend HOLD
  GRI < 55: Recommend FAIL

  Override: Any mandatory criterion not met = cannot recommend PASS
```

### Industry Benchmarks for Gate Performance

| Metric | Poor Practice | Average | Best Practice | VSC Target |
|--------|-------------|---------|---------------|------------|
| Gate package preparation time | 80-120 hours manual | 40-60 hours | 8-16 hours | <4 hours |
| Data currency at gate review | 2-4 weeks stale | 1-2 weeks | <1 week | <3 days |
| Gate pass rate (first attempt) | 30-40% | 50-60% | >80% | >75% |
| Condition closure rate | 40-50% | 60-70% | >90% | >95% |
| Gate review duration | 4-8 hours | 2-4 hours | 1-2 hours | 1-2 hours |
| Post-gate action completion | 50-60% | 70-80% | >90% | >95% |
| Rework after gate pass | 20-30% | 10-15% | <5% | <5% |

### Standards Applied
- **IPA (Independent Project Analysis)** - Gate review best practices for capital projects
- **AACE International** - Earned value management, cost and schedule assessment
- **PMI PMBOK** - Phase gate methodology, stakeholder management
- **ISO 31000** - Risk management framework for gate risk assessments
- **ISO 55001** - Asset management decision-making framework
- **CII RT-269** - Front-end planning research applicable to gate readiness
- **OSHA PSM 1910.119** - Pre-Startup Safety Review (PSSR) requirements for Gate G4/G5

## Step-by-Step Execution

### Step 1: Determine Gate Scope and Criteria
1. Load gate definition from project configuration
2. Identify mandatory criteria for this specific gate
3. Identify standard criteria for this gate
4. Load pass/fail thresholds
5. Check if client has custom gate criteria (merge with VSC standard)
6. Load previous gate decision and conditions (if not first gate)
7. Determine audience and distribution for this gate review

### Step 2: Collect Current Data
1. **Deliverable Data** (from track-or-deliverables / mcp-airtable):
   - Query all deliverables due at or before this gate
   - Calculate completion status per domain
   - Identify at-risk and overdue items
   - Calculate weighted readiness scores
2. **Risk Data** (from orchestrate-or-program / mcp-airtable):
   - Query current risk register
   - Extract risks relevant to this gate
   - Calculate risk exposure score
   - Identify risk trend since last gate
3. **Schedule Data** (from mcp-project-online):
   - Query project schedule milestones
   - Calculate schedule variance
   - Identify critical path status
   - Assess downstream schedule impact
4. **Financial Data** (from agent-finance):
   - Query budget vs. actual by domain
   - Calculate CPI and EAC
   - Assess contingency status
   - Identify key variances
5. **Agent Narratives** (from all specialist agents via Inbox):
   - Collect domain-specific updates
   - Key achievements, issues, and outlook
   - Self-assessment per domain

### Step 3: Evaluate Mandatory Criteria
1. For each mandatory criterion:
   - Locate evidence in collected data
   - Evaluate: PASS or FAIL
   - If PASS: document evidence reference
   - If FAIL: document gap, required action, estimated timeline to achieve
2. Calculate mandatory criteria score: met / total
3. Flag any mandatory criteria failures as automatic PASS blockers
4. If previous gate conditions exist:
   - Evaluate each condition: MET or NOT MET
   - NOT MET conditions are treated as mandatory criteria failures
   - Document evidence of condition closure or reason for non-closure

### Step 4: Evaluate Standard Criteria
1. For each standard criterion:
   - Locate evidence in collected data
   - Evaluate: PASS, PARTIAL, or FAIL
   - Document evidence and gaps
2. Calculate standard criteria score: met / total
3. Identify criteria that could be conditions (if conditional pass)

### Step 5: Calculate Gate Readiness Index (GRI)
1. Calculate overall readiness score from deliverable data
2. Calculate mandatory criteria score
3. Calculate standard criteria score
4. Calculate risk exposure (normalized)
5. Compute GRI using the weighted formula
6. Determine recommendation based on GRI thresholds:
   - GRI >= 85 and all mandatory met: PASS
   - GRI 70-84 and all mandatory met (or achievable in 30 days): CONDITIONAL PASS
   - GRI 55-69: HOLD
   - GRI < 55 or mandatory criteria not achievable: FAIL
7. Apply override rules (mandatory criteria failures block PASS)

### Step 6: Perform Quantitative Risk Assessment
1. Generate risk heat map from current risk register
2. Calculate risk exposure score for the gate
3. Identify risks that could prevent successful next-phase execution
4. Compare risk profile with previous gate (improving, stable, worsening)
5. Assess risk of proceeding vs. risk of delay:
   - Risk of proceeding: What could go wrong if we advance with current gaps?
   - Risk of delay: What is the cost/impact of holding at this gate?
   - Quantify both in terms of schedule impact, cost impact, and safety exposure
6. Incorporate risk assessment into recommendation rationale

### Step 7: Generate Recommendation
1. Synthesize all evidence into a structured recommendation:
   - Overall readiness (quantitative)
   - Mandatory criteria status
   - Standard criteria status
   - Risk assessment summary
   - Financial status
   - Schedule status
2. Formulate recommendation: PASS / CONDITIONAL PASS / HOLD / FAIL
3. Document rationale with explicit reference to:
   - What supports advancement (positive evidence)
   - What argues against advancement (concerns and risks)
   - Net balance and why recommendation tilts one direction
4. If CONDITIONAL PASS:
   - Define specific conditions with SMART criteria
   - Assign owners and deadlines
   - Define verification method for each condition
   - Set maximum condition window (typically 30 days)
5. If HOLD or FAIL:
   - Define specific issues that must be resolved
   - Estimate timeline for resolution
   - Recommend re-assessment date
   - Quantify impact of delay (schedule, cost, revenue)

### Step 8: Assemble Gate Package
1. Generate Executive Presentation (PPTX):
   - Populate template with all calculated data
   - Generate charts and visualizations
   - Include domain summary slides
   - Add recommendation slide
   - Include action items and conditions
   - Format per VSC branding standards
2. Generate Detailed Supporting Document (DOCX):
   - Populate all sections with detailed evidence
   - Include complete deliverable listings per domain
   - Include full risk register snapshot
   - Include financial detail
   - Include evidence document references
3. Generate Gate Decision Record template (for recording during review)
4. Store all package documents in mcp-sharepoint
5. Optionally: Send to genspark-pptx-enhancer for presentation polish

### Step 9: Distribute and Support Gate Review
1. Distribute package T-7 via mcp-outlook:
   - Send to gate review board members (pre-read)
   - Send to domain leads (for awareness and preparation)
   - Attach executive presentation and supporting document
2. Post summary in mcp-teams OR channel
3. Schedule gate review meeting via mcp-outlook/mcp-teams (if not already scheduled)
4. Prepare presenter notes for gate review facilitation

### Step 10: Record Gate Decision and Follow-Up
1. After gate review meeting:
   - Record decision in Gate Decision Record (mcp-airtable)
   - Document any conditions, modifications, or additional actions
   - Record attendees and any dissenting views
2. Distribute gate decision:
   - Email to all stakeholders via mcp-outlook
   - Post in mcp-teams OR channel
   - Update OR Dashboard in mcp-powerbi
3. If CONDITIONAL PASS:
   - Create condition tracker entries in mcp-airtable
   - Send condition assignments to owners via mcp-outlook
   - Set monitoring cadence for conditions (weekly check)
   - Set deadline reminders (T-7 before condition deadline)
4. If HOLD or FAIL:
   - Create action register for required remediation
   - Schedule re-assessment date
   - Notify orchestrate-or-program for schedule impact assessment
5. Update gate history for next gate reference

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Package Completeness | All template sections populated with data | 100% | >95% |
| Data Currency | Age of data in package at gate review time | <3 days | <7 days |
| Mandatory Criteria Coverage | All mandatory criteria explicitly evaluated | 100% | 100% |
| Domain Coverage | All active domains represented in package | 100% | 100% |
| Recommendation Clarity | Recommendation is unambiguous (PASS/COND/HOLD/FAIL) | 100% | 100% |
| Evidence Quality | Each assessment backed by referenced evidence | 100% | >90% |
| Condition Specificity | Conditions are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) | 100% | 100% |
| Delivery Timeliness | Package delivered at T-7 or earlier | 100% | T-5 minimum |
| Generation Time | Time from trigger to completed package | <4 hours | <8 hours |
| Decision Record | Gate decision recorded within 24h of review | 100% | 100% |
| Prior Condition Verification | Prior gate conditions checked in package | 100% | 100% |
| Scoring Accuracy | GRI calculation matches manual verification | 100% | 100% |
| Cross-Level Consistency | Numbers in PPTX match numbers in DOCX | 100% | 100% |
| Stakeholder Rating | Review board rates package quality | >4.5/5 | >4.0/5 |

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `orchestrate-or-program` | Parent Orchestrator | Triggers gate review preparation, provides program context (Skill H-01) |
| `track-or-deliverables` | Data Source | Provides deliverable completion data and RAG status (Skill H-02) |
| `model-rampup-trajectory` | Input (G5/G6) | Provides ramp-up forecast data for later gates (Skill H-04) |
| `generate-or-report` | Related | Monthly reports provide baseline data; gate packages are specialized reports |
| `agent-operations` | Data Source | Operations domain assessment and narrative |
| `agent-maintenance` | Data Source | Maintenance domain assessment and narrative |
| `agent-hse` | Data Source | HSE and risk register data |
| `agent-hr` | Data Source | HR/staffing domain assessment and narrative |
| `agent-finance` | Data Source | Financial data, budget vs. actual |
| `agent-legal` | Data Source | Legal/regulatory domain assessment |
| `agent-procurement` | Data Source | Procurement domain assessment |
| `agent-project` | Data Source | Schedule data and project integration status |
| `agent-communications` | Data Source | Communications and change management status |
| `agent-doc-control` | Data Source + Store | Doc control status; stores gate review packages |
| `agent-or-pmo` | Governance | Defines gate criteria; schedules gate reviews; chairs review board |
| `validate-output-quality` | Quality Gate | Gate packages validated before distribution |
| `genspark-pptx-enhancer` | Optional Enhancement | Polishes PPTX presentation format |
| `design-quality-gate` | Standards | Quality gate criteria applied to the gate package itself |

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
purpose: "Store and distribute gate review packages"
usage:
  - Store executive presentation (PPTX) in gate review folder
  - Store supporting document (DOCX) with full evidence
  - Access evidence documents referenced in the package
  - Maintain gate review archive for historical reference
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
purpose: "Generate visual dashboards and charts for gate packages"
usage:
  - Generate domain heat map visualizations
  - Create readiness trend charts
  - Produce risk heat maps
  - Generate financial variance charts
  - Update OR Dashboard with gate review results
```

### mcp-outlook
```yaml
name: "mcp-outlook"
purpose: "Distribute gate packages and record decisions"
usage:
  - Send pre-read packages to review board T-7
  - Send gate decision notifications post-review
  - Send condition assignments to owners
  - Send condition deadline reminders
  - Schedule gate review meetings (calendar invitations)
```

### mcp-teams
```yaml
name: "mcp-teams"
purpose: "Real-time collaboration for gate review preparation and execution"
usage:
  - Post gate readiness summaries in OR channel
  - Support Q&A during pre-gate preparation
  - Post gate decision announcements
  - Facilitate gate review meeting (virtual or hybrid)
```

## Templates & References

### Gate Recommendation Decision Tree
```
START
  |
  v
All mandatory criteria met?
  |
  YES --> Overall readiness >= 85%?
  |          |
  |          YES --> Standard criteria >= 80%?
  |          |          |
  |          |          YES --> No unmitigated CRITICAL risks?
  |          |          |          |
  |          |          |          YES --> Prior gate conditions closed?
  |          |          |          |          |
  |          |          |          |          YES --> RECOMMEND: PASS
  |          |          |          |          NO  --> RECOMMEND: HOLD (close conditions first)
  |          |          |          |
  |          |          |          NO  --> RECOMMEND: CONDITIONAL PASS (mitigate risks)
  |          |          |
  |          |          NO  --> RECOMMEND: CONDITIONAL PASS (complete std criteria)
  |          |
  |          NO  --> Overall readiness >= 70%?
  |                    |
  |                    YES --> RECOMMEND: CONDITIONAL PASS (with recovery plan)
  |                    NO  --> RECOMMEND: HOLD (insufficient readiness)
  |
  NO --> Mandatory gap achievable within 30 days?
            |
            YES --> Overall readiness >= 70%?
            |          |
            |          YES --> RECOMMEND: CONDITIONAL PASS (mandatory gap as condition)
            |          NO  --> RECOMMEND: HOLD
            |
            NO  --> RECOMMEND: FAIL (fundamental readiness gap)
```

### Gate Review Meeting Agenda Template
```markdown
# Gate {G} Review Meeting Agenda
## {Project Name}
## Date: {Date} | Time: {Time} | Duration: 90 minutes

### Attendees
- Chair: {OR PMO Lead}
- Decision Authority: {Project Director}
- Presenters: {OR Manager}, {Domain Leads as needed}
- Board Members: {VP Operations}, {CFO}, {EPC PM}, {Client Representative}

### Agenda

1. **Opening & Context** (5 min)
   - Gate purpose and decision required
   - Agenda overview

2. **Executive Summary** (10 min)
   - Overall readiness status
   - Key highlights and concerns
   - Recommendation preview

3. **Domain Summaries** (30 min)
   - Each domain: 2-3 minutes
   - Focus on gate-specific deliverables
   - Highlight achievements and issues

4. **Risk Assessment** (10 min)
   - Top risks and mitigation status
   - Risk of proceeding vs. delay

5. **Financial & Schedule Status** (10 min)
   - Budget position
   - Schedule status
   - Forecast for next phase

6. **Recommendation & Discussion** (15 min)
   - Formal recommendation presentation
   - Discussion and questions
   - Address concerns

7. **Decision** (5 min)
   - Go / No-Go / Conditional decision
   - Conditions and action items (if conditional)
   - Next gate date confirmation

8. **Close** (5 min)
   - Action items summary
   - Next steps
   - Meeting close
```

## Examples

### Example 1: Gate G2 Review (OR Plans Complete)

```
Command: generate-or-gate-review prepare --project "Sierra Verde" --gate G2

Process:
  1. Gate Scope:
     - Gate G2: OR Plans Complete
     - 7 mandatory criteria, 15 standard criteria
     - 85 deliverables due at G2 across 12 domains

  2. Data Collection:
     - Deliverable status: 78/85 complete (91.8%)
     - Critical deliverables: 26/28 complete (92.9%)
     - Risk register: 45 risks (3 critical, 12 high, 18 medium, 12 low)
     - Budget: $8.5M spent of $44M (19.3%, on plan)
     - Schedule: SPI 1.02 (slightly ahead)

  3. Mandatory Criteria:
     - MC-G2-01: OR Plan 360 document complete: PASS (approved Rev 0)
     - MC-G2-02: Staffing plan approved: PASS
     - MC-G2-03: Training plan approved: FAIL (pending OEM competency inputs)
     - MC-G2-04: Maintenance strategy complete: PASS
     - MC-G2-05: Risk assessment complete: PASS
     - MC-G2-06: Budget refined to +/-15%: PASS ($44M +/- $6.6M)
     - MC-G2-07: Integrated timeline published: PASS

     Mandatory: 6/7 PASS (1 FAIL - Training Plan)

  4. Standard Criteria: 13/15 met (86.7%)
     - Failed: SOP register (75% complete, target 90%)
     - Failed: Supply chain contracts (3 of 8 pending)

  5. Gate Readiness Index:
     - Overall Readiness: 91.8%
     - Mandatory Score: 85.7% (6/7)
     - Standard Score: 86.7% (13/15)
     - Risk Exposure (normalized): 32
     - GRI = (0.40 * 91.8) + (0.25 * 85.7) + (0.20 * 86.7) + (0.15 * 68) = 86.4

  6. Recommendation: CONDITIONAL PASS
     - GRI of 86.4 supports PASS, but mandatory criterion MC-G2-03 not met
     - Training Plan gap is achievable within 30 days (OEM inputs expected in 10 days)
     - Conditions:
       1. Complete Training Plan with OEM competency inputs (Owner: HR Manager, Deadline: Jan 30)
       2. Complete SOP register to 90% (Owner: Operations Manager, Deadline: Jan 30)
       3. Execute remaining 3 supply chain contracts (Owner: Procurement Manager, Deadline: Feb 15)

  7. Package Generated:
     - Executive PPTX: 22 slides
     - Supporting DOCX: 48 pages
     - Distributed to 8 review board members T-7

Output:
  "Gate G2 Review Package generated for Sierra Verde.
   GRI: 86.4 | Recommendation: CONDITIONAL PASS
   Mandatory: 6/7 (Training Plan pending OEM input)
   Standard: 13/15 (86.7%)
   Overall Readiness: 91.8%
   3 conditions defined with 30-45 day window.
   Package: SV-PMO-GATE-G2-Package.pptx (22 slides)
   Supporting: SV-PMO-GATE-G2-Support.docx (48 pages)
   Distributed to review board via Outlook."
```

### Example 2: Emergency Gate Re-Assessment

```
Trigger: Multiple domains enter RED status during construction phase; Project Director requests
         emergency gate re-assessment for G3 (OR Execution On Track)

Process:
  1. Data Collection (urgent, <2 hours):
     - 3 domains in RED: Maintenance (CMMS vendor failure), HR (recruitment 30% behind),
       Procurement (spare parts supply chain disruption)
     - 2 domains in AMBER: Operations (SOP delays), Legal (permit delay)
     - 7 domains in GREEN
     - Overall readiness: 62.3% (target at this date: 68%)
     - SPI: 0.82 (significantly behind plan)

  2. Root Cause Analysis:
     - CMMS vendor entered bankruptcy; replacement vendor selection required
     - Regional labor shortage; competition from 3 other mining projects in same region
     - Key spare parts supplier experiencing manufacturing delays (global supply chain)
     - Interconnected: all three issues compound each other

  3. Risk Assessment:
     - Risk of proceeding without correction: 85% probability of missing G4 gate
     - Estimated schedule impact: 3-6 month delay to commissioning
     - Financial impact: $15-25M additional cost + $8M/month revenue delay
     - Safety impact: Reduced HSE preparedness if gaps not closed

  4. Recommendation: HOLD
     - GRI: 54.8 (below 55 threshold)
     - 3 domains in RED with systemic root causes
     - Recovery plan required before re-assessment
     - Recommended actions:
       1. Select replacement CMMS vendor within 30 days (critical path)
       2. Engage recruitment agency for regional labor sourcing
       3. Qualify alternative spare parts suppliers
       4. Re-baseline OR schedule with recovery dates
     - Recommended re-assessment: 60 days

  5. Impact Analysis:
     - Holding at G3 for 60 days: $4.8M cost + 60-day schedule impact
     - Proceeding without correction: $15-25M cost + 3-6 month schedule impact
     - Net benefit of HOLD decision: $10-20M saved

Output:
  "Emergency Gate G3 Re-Assessment for Sierra Verde.
   GRI: 54.8 | Recommendation: HOLD
   3 domains RED, 2 AMBER, 7 GREEN.
   Root cause: CMMS vendor failure + labor shortage + supply chain disruption.
   Recovery plan required: 4 actions with 30-60 day timeline.
   Hold cost: $4.8M. Proceed-without-correction cost: $15-25M.
   Re-assessment recommended: 60 days.
   URGENT: Package distributed to Project Director and VP Operations."
```

### Example 3: Condition Verification at Next Gate

```
Trigger: Pre-Gate G3 preparation -- verify G2 conditions closure

Process:
  1. G2 Conditions Status:
     - G2-COND-01: Complete Training Plan with OEM inputs
       Status: COMPLETE (closed Jan 25, within deadline)
       Evidence: Training Plan Rev 1 approved in SharePoint

     - G2-COND-02: Complete SOP register to 90%
       Status: COMPLETE (closed Jan 28, within deadline)
       Evidence: SOP register showing 92% completion

     - G2-COND-03: Execute remaining 3 supply chain contracts
       Status: PARTIAL (2 of 3 complete; 1 in final negotiation)
       Deadline: Feb 15 (not yet exceeded)
       Note: Third contract expected to close by Feb 10

  2. Assessment:
     - 2 of 3 conditions fully closed with evidence
     - 1 condition in progress, on track for deadline
     - No conditions overdue
     - G2 conditions do not block G3 preparation

  3. Recommendation for G3 package:
     - Include G2 conditions status in G3 package
     - Note: G2-COND-03 should be verified closed before G3 decision
     - No escalation required

Output:
  "G2 Conditions Verification Complete.
   2/3 conditions CLOSED with verified evidence.
   1/3 condition IN PROGRESS, on track for Feb 15 deadline.
   G2 conditions do not block G3 preparation.
   Included in G3 package for reference."
```
