# DT-01: Assess Digital Maturity

## 1. Purpose

Provide a rigorous, data-driven assessment of an organization's digital maturity across all dimensions relevant to industrial operations, enabling leadership to understand their current state, benchmark against industry peers, and prioritize investments for digital transformation. This skill addresses the systemic failure of digital transformation programs (70% failure rate per McKinsey) by establishing a factual baseline before any technology adoption begins.

The assessment spans six core dimensions: Strategy & Leadership, People & Culture, Technology & Infrastructure, Data & Analytics, Processes & Operations, and Innovation & Ecosystem. Each dimension is scored using a 5-level maturity model calibrated to industrial and operational excellence standards.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | DT-01                                                                                       |
| **Agent**              | Agent 11 -- Digital Transformation Orchestrator                                              |
| **Domain**             | Digital Transformation                                                                       |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | 5--10 business days (full assessment); 1--2 days (rapid scan)                                |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | M-01: 70% of digital transformation initiatives fail to reach their goals (McKinsey, 2023) |
| **Secondary Pain**     | W-01: Only 10--15% of companies have scaled Industry 4.0 solutions beyond pilot (WEF, 2023)|
| **Value Created**      | Organizations with formal maturity assessments are 2.5x more likely to achieve DT targets   |

### Functional Intent

This skill SHALL:
- Collect quantitative and qualitative data across 6 maturity dimensions and 24 sub-dimensions
- Score each sub-dimension on a 1--5 maturity scale with documented evidence
- Generate a composite digital maturity index (DMI) on a 0--100 scale
- Benchmark results against industry-specific peer data
- Produce a prioritized gap analysis with estimated investment and impact
- Deliver an executive-ready report with visual radar charts and heatmaps

### Non-Functional Requirements

- Assessment instrument must be validated (Cronbach's alpha >= 0.80)
- All scoring must be traceable to collected evidence
- Results must be reproducible by independent assessors (inter-rater reliability >= 0.85)
- Data privacy: all collected responses must be anonymized in aggregate reports

---

## 3. Trigger / Invocation

### Direct Invocation

```
/assess-digital-maturity --scope [organization|business-unit|site] --mode [full|rapid] --industry [mining|oil-gas|chemicals|power|manufacturing]
```

### Contextual Triggers

This skill is automatically suggested when:
- A new digital transformation initiative is being planned
- Leadership requests an "as-is" technology landscape review
- Annual strategic planning cycle begins
- Post-merger integration requires technology harmonization
- Agent 11 detects misalignment between stated DT goals and observable capability levels
- A previous DT initiative has failed or stalled and root-cause analysis is needed

### Trigger Conditions (Programmatic)

```yaml
trigger_conditions:
  - event: "dt_initiative_kickoff"
    condition: "no_baseline_assessment_exists OR assessment_age > 12_months"
  - event: "annual_planning_cycle"
    condition: "strategic_plan_includes_digital_component"
  - event: "dt_initiative_failure"
    condition: "root_cause_analysis_requested"
  - event: "agent_detection"
    condition: "dt_goal_capability_gap > threshold_0.4"
```

---

## 4. Input Requirements

### Required Inputs

| Input                        | Type          | Source                        | Description                                                      |
|------------------------------|---------------|-------------------------------|------------------------------------------------------------------|
| `organization_profile`       | Object        | mcp-sharepoint / manual       | Organization name, industry, size, geography, structure          |
| `assessment_scope`           | Enum          | User selection                | `organization`, `business-unit`, `site`, or `department`         |
| `assessment_mode`            | Enum          | User selection                | `full` (24 sub-dimensions) or `rapid` (12 key sub-dimensions)   |
| `industry_vertical`          | Enum          | User selection                | Industry for benchmarking: mining, oil-gas, chemicals, etc.      |
| `stakeholder_list`           | Array[Object] | mcp-sharepoint / mcp-teams    | List of interviewees with roles, departments, contact info       |

### Optional Inputs

| Input                        | Type          | Source                        | Description                                                      |
|------------------------------|---------------|-------------------------------|------------------------------------------------------------------|
| `previous_assessment`        | Object        | mcp-sharepoint                | Prior assessment results for trend analysis                      |
| `strategic_plan`             | Document      | mcp-sharepoint                | Current strategic plan for alignment analysis                    |
| `technology_inventory`       | Array[Object] | mcp-sharepoint                | Existing IT/OT systems, licenses, integrations                  |
| `budget_envelope`            | Number        | Manual                        | Available budget for DT investments (for prioritization)         |
| `custom_dimensions`          | Array[Object] | Manual                        | Organization-specific dimensions to add to standard framework    |

### Input Validation Rules

```yaml
validation:
  organization_profile:
    required: [name, industry, employee_count, annual_revenue_range]
    employee_count: { min: 50, type: integer }
  stakeholder_list:
    min_count: 8  # Minimum for statistical validity
    required_roles: ["executive_sponsor", "it_leader", "ot_leader", "operations_leader"]
  assessment_mode:
    allowed: ["full", "rapid"]
    default: "full"
```

---

## 5. Output Specification

### Primary Outputs

| Output                          | Format       | Destination                   | Description                                                    |
|---------------------------------|--------------|-------------------------------|----------------------------------------------------------------|
| `maturity_scorecard`            | JSON + XLSX  | mcp-sharepoint                | Complete scoring across all dimensions and sub-dimensions       |
| `executive_summary_report`      | PDF / PPTX   | mcp-sharepoint                | Visual executive report with radar charts and key findings      |
| `gap_analysis`                  | XLSX + JSON  | mcp-sharepoint                | Prioritized gaps with impact scoring and investment estimates   |
| `benchmark_comparison`          | JSON + Chart | mcp-powerbi                   | Peer comparison data and visualizations                        |
| `roadmap_recommendations`       | JSON         | Agent 11 (DT-02 input)        | Structured input for design-adoption-roadmap skill             |

### Output Schema: Maturity Scorecard

```json
{
  "assessment_id": "DT01-2025-001",
  "organization": "Minera del Pacífico",
  "assessment_date": "2025-03-15",
  "scope": "organization",
  "mode": "full",
  "composite_dmi": 42.7,
  "dimensions": [
    {
      "dimension": "Strategy & Leadership",
      "score": 3.2,
      "weight": 0.20,
      "sub_dimensions": [
        {
          "name": "Digital Vision & Strategy",
          "score": 3.5,
          "level": "Defined",
          "evidence": ["Strategic plan includes digital chapter", "No dedicated digital budget line"],
          "gap_to_target": 1.5,
          "priority": "high"
        }
      ]
    }
  ],
  "overall_level": "Developing",
  "benchmark_percentile": 45,
  "top_3_strengths": [],
  "top_5_gaps": [],
  "recommended_quick_wins": [],
  "estimated_investment_range": {"min": 500000, "max": 2000000, "currency": "USD"}
}
```

### Maturity Level Definitions

| Level | Score Range | Label        | Description                                                                                 |
|-------|-------------|--------------|----------------------------------------------------------------------------------------------|
| 1     | 1.0 -- 1.9  | Initial      | Ad-hoc, no formal digital strategy, siloed efforts, reactive                                 |
| 2     | 2.0 -- 2.9  | Developing   | Emerging awareness, pilot projects, basic infrastructure, inconsistent practices             |
| 3     | 3.0 -- 3.9  | Defined      | Documented strategy, dedicated resources, standardized processes, KPIs established           |
| 4     | 4.0 -- 4.5  | Managed      | Data-driven decisions, integrated platforms, continuous improvement, cross-functional teams   |
| 5     | 4.6 -- 5.0  | Optimizing   | Predictive/prescriptive analytics, autonomous operations, innovation culture, ecosystem lead |

---

## 6. Methodology & Standards

### Theoretical Foundation

This assessment methodology synthesizes established frameworks:

- **Acatech Industrie 4.0 Maturity Index** -- 6-stage model with structural areas (Resources, Information Systems, Culture, Organization)
- **MIT/Capgemini Digital Maturity Framework** -- Digital Intensity vs. Transformation Management Intensity
- **World Economic Forum Lighthouse Network** -- Criteria for Fourth Industrial Revolution leaders
- **ISO 55000 (Asset Management)** -- Asset management maturity as a dimension of operational digital maturity
- **CMMI (Capability Maturity Model Integration)** -- Maturity level structure and evidence-based assessment approach

### Industry Statistics & Context

| Statistic                                                         | Source                           | Year |
|-------------------------------------------------------------------|----------------------------------|------|
| 70% of digital transformation initiatives fail to reach goals     | McKinsey Digital                 | 2023 |
| Only 10--15% of companies have scaled Industry 4.0 beyond pilot   | World Economic Forum             | 2023 |
| Companies in top quartile of digital maturity generate 2.5x EBITDA | BCG Henderson Institute         | 2023 |
| 87% of senior leaders say digitalization is a priority             | Gartner CEO Survey               | 2024 |
| Average DT spending: 5.1% of revenue for leaders vs. 2.3% laggards| IDC FutureScape                  | 2024 |
| 45% of DT failures attributed to lack of baseline understanding   | Harvard Business Review          | 2023 |
| Organizations with formal assessments are 3.1x faster to value    | Deloitte Digital Maturity Study  | 2023 |

### Assessment Dimensions (Full Model)

#### Dimension 1: Strategy & Leadership (Weight: 20%)
1. **Digital Vision & Strategy** -- Clarity, specificity, and communication of digital strategy
2. **Leadership Commitment** -- Executive sponsorship, investment allocation, governance
3. **Digital Governance** -- Decision-making structures, portfolio management, risk frameworks
4. **Ecosystem & Partnerships** -- Technology partner network, innovation ecosystem participation

#### Dimension 2: People & Culture (Weight: 20%)
5. **Digital Skills & Competencies** -- Workforce digital literacy, specialist skills availability
6. **Change Readiness** -- Cultural openness to change, experimentation tolerance
7. **Collaboration & Knowledge Sharing** -- Cross-functional teamwork, knowledge management practices
8. **Talent Strategy** -- Digital talent acquisition, retention, development programs

#### Dimension 3: Technology & Infrastructure (Weight: 20%)
9. **IT/OT Convergence** -- Integration level between information and operational technology
10. **Cloud & Architecture** -- Cloud adoption, microservices, API-first design, scalability
11. **Cybersecurity Maturity** -- Security posture, OT security, incident response capability
12. **Connectivity & IoT** -- Network infrastructure, sensor deployment, edge computing

#### Dimension 4: Data & Analytics (Weight: 20%)
13. **Data Architecture & Quality** -- Data lake/warehouse, governance, quality management
14. **Analytics Capability** -- Descriptive, diagnostic, predictive, prescriptive maturity
15. **AI/ML Adoption** -- Model development, deployment, MLOps, responsible AI practices
16. **Data Culture** -- Data literacy, self-service analytics, evidence-based decision-making

#### Dimension 5: Processes & Operations (Weight: 15%)
17. **Process Digitization** -- Paper-to-digital conversion, workflow automation level
18. **Integration & Interoperability** -- System integration, data flow across processes
19. **Operational Excellence** -- Digital twins, advanced process control, predictive maintenance
20. **Supply Chain Digitization** -- Digital supply chain visibility, planning automation

#### Dimension 6: Innovation & Ecosystem (Weight: 5%)
21. **Innovation Processes** -- Structured innovation pipeline, ideation to implementation
22. **Emerging Technology Adoption** -- Tracking and piloting frontier technologies
23. **External Collaboration** -- Open innovation, university/startup partnerships
24. **Sustainability & ESG Integration** -- Digital solutions for ESG goals

### Scoring Methodology

Each sub-dimension is scored using a structured rubric with:
- **3--5 indicator questions** per sub-dimension
- **Evidence requirements** for each score level
- **Triangulation** from at least 2 data sources (survey + interview, or survey + document review)
- **Weighted aggregation** using dimension weights to compute composite DMI

```
DMI = SUM(dimension_score_i * weight_i) / 5 * 100
```

Where dimension_score_i is the average of its sub-dimension scores, and weights sum to 1.0.

---

## 7. Step-by-Step Execution

### Phase 1: Preparation (Day 1--2)

**Step 1.1: Scope Definition & Stakeholder Mapping**
```
ACTION: Define assessment boundaries and identify participants
INPUTS: organization_profile, assessment_scope, stakeholder_list
PROCESS:
  1. Confirm assessment scope (organization/BU/site) with sponsor
  2. Identify minimum 8 stakeholders across all dimensions
  3. Ensure representation: Executive (2+), IT (2+), OT (2+), Operations (2+)
  4. Schedule data collection activities
  5. Prepare confidentiality and data handling agreements
OUTPUT: Validated stakeholder matrix, assessment schedule
MCP: mcp-teams (scheduling), mcp-sharepoint (document storage)
```

**Step 1.2: Instrument Configuration**
```
ACTION: Configure assessment questionnaire for organization context
INPUTS: industry_vertical, assessment_mode, custom_dimensions
PROCESS:
  1. Select industry-specific question variants
  2. Configure maturity rubrics with industry-relevant examples
  3. If rapid mode: select 12 highest-impact sub-dimensions
  4. If custom dimensions: integrate with validation
  5. Generate digital survey in Microsoft Forms
  6. Create interview guides for each stakeholder role
OUTPUT: Configured survey (Forms), interview guides (SharePoint)
MCP: mcp-forms (survey creation), mcp-sharepoint (guide storage)
```

**Step 1.3: Baseline Data Collection Setup**
```
ACTION: Gather existing documentation and system data
INPUTS: technology_inventory, strategic_plan, previous_assessment
PROCESS:
  1. Request and catalog existing documents:
     - Strategic plan / digital strategy
     - IT/OT architecture diagrams
     - Technology roadmaps
     - Organization charts
     - Training records and skill matrices
     - Recent audit reports
  2. Set up secure data collection folder in SharePoint
  3. Send pre-assessment briefing to all participants
OUTPUT: Document inventory, data collection folder structure
MCP: mcp-sharepoint (folder creation, document upload), mcp-outlook (briefing emails)
```

### Phase 2: Data Collection (Day 2--5)

**Step 2.1: Survey Distribution & Monitoring**
```
ACTION: Deploy digital maturity survey and track completion
INPUTS: Configured survey, stakeholder_list
PROCESS:
  1. Distribute survey link via Teams/email to all participants
  2. Monitor completion rates daily
  3. Send reminders at 48h and 72h for non-respondents
  4. Target: minimum 80% response rate for validity
  5. Perform initial response quality check (no straight-lining, adequate comments)
OUTPUT: Raw survey responses (anonymized)
MCP: mcp-forms (distribution, monitoring), mcp-teams (reminders)
QUALITY_CHECK: Response rate >= 80%, no quality flags on > 10% of responses
```

**Step 2.2: Stakeholder Interviews**
```
ACTION: Conduct structured interviews with key stakeholders
INPUTS: Interview guides, stakeholder_list
PROCESS:
  1. Conduct 30--45 minute interviews with each key stakeholder
  2. Use semi-structured format: standard questions + probing follow-ups
  3. Document verbatim quotes for evidence
  4. Record interview (with consent) for verification
  5. Code responses against maturity rubric indicators
  6. Note discrepancies between survey responses and interview data
OUTPUT: Interview transcripts, coded evidence matrix
MCP: mcp-teams (interview scheduling/recording), mcp-sharepoint (transcript storage)
```

**Step 2.3: Document Review & System Audit**
```
ACTION: Analyze collected documents and system configurations
INPUTS: Document inventory, technology_inventory
PROCESS:
  1. Review strategic documents for digital strategy alignment
  2. Analyze IT/OT architecture for integration maturity
  3. Review training records for digital skills coverage
  4. Assess cybersecurity posture from audit reports
  5. Evaluate data governance from policies and practices
  6. Document evidence for each sub-dimension
OUTPUT: Document analysis matrix, evidence catalog
MCP: mcp-sharepoint (document access and analysis)
```

### Phase 3: Analysis & Scoring (Day 5--7)

**Step 3.1: Evidence Triangulation & Scoring**
```
ACTION: Synthesize all data sources and score each sub-dimension
INPUTS: Survey responses, interview data, document analysis
PROCESS:
  1. For each sub-dimension:
     a. Compile evidence from all three sources (survey, interview, documents)
     b. Identify convergent and divergent findings
     c. Apply scoring rubric with evidence justification
     d. Assign score (1.0 -- 5.0, in 0.5 increments)
     e. Document confidence level (high/medium/low)
  2. Flag sub-dimensions with low confidence for additional validation
  3. Calculate dimension averages and composite DMI
OUTPUT: Completed scorecard with evidence trail
VALIDATION: Inter-rater reliability check if multiple assessors
```

**Step 3.2: Benchmarking**
```
ACTION: Compare results against industry benchmarks
INPUTS: maturity_scorecard, industry_vertical
PROCESS:
  1. Load industry benchmark data from reference database
  2. Calculate percentile ranking for each dimension
  3. Identify dimensions where organization is above/below industry median
  4. Compute overall benchmark percentile
  5. Identify "lighthouse" practices from top-quartile organizations
OUTPUT: Benchmark comparison data, percentile rankings
MCP: mcp-sharepoint (benchmark database access)
```

**Step 3.3: Gap Analysis & Prioritization**
```
ACTION: Identify and prioritize maturity gaps
INPUTS: maturity_scorecard, benchmark_comparison, strategic_plan
PROCESS:
  1. Calculate gap-to-target for each sub-dimension
     - Target = MAX(industry_median + 0.5, strategic_requirement)
  2. Score each gap on Impact (1--5) and Feasibility (1--5)
  3. Calculate Priority Score = Impact * Feasibility * Strategic_Alignment
  4. Rank gaps by Priority Score
  5. Identify top 5 critical gaps and top 3 quick wins
  6. Estimate investment range for closing each gap
OUTPUT: Prioritized gap matrix, investment estimates
```

### Phase 4: Report Generation & Delivery (Day 7--10)

**Step 4.1: Report Compilation**
```
ACTION: Generate comprehensive assessment report
INPUTS: All analysis outputs
PROCESS:
  1. Generate executive summary (1--2 pages):
     - Composite DMI score and level
     - Key strengths and critical gaps
     - Benchmark position
     - Top 3 recommendations
  2. Generate detailed findings (10--15 pages):
     - Dimension-by-dimension analysis with radar charts
     - Sub-dimension heatmap
     - Evidence summaries and key quotes
     - Benchmark comparison charts
  3. Generate appendices:
     - Full scoring rubric with evidence
     - Methodology description
     - Stakeholder participation summary
     - Raw data summaries (anonymized)
OUTPUT: Complete assessment report (PDF/PPTX)
MCP: mcp-sharepoint (report storage), mcp-powerbi (visualization generation)
```

**Step 4.2: Stakeholder Presentation**
```
ACTION: Present findings to leadership and collect feedback
INPUTS: executive_summary_report
PROCESS:
  1. Schedule executive presentation (60--90 minutes)
  2. Present key findings, benchmark position, and priorities
  3. Facilitate discussion on strategic implications
  4. Collect feedback and validate findings
  5. Adjust scores/priorities based on additional context if warranted
  6. Confirm commitment to act on assessment findings
OUTPUT: Validated assessment, stakeholder alignment
MCP: mcp-teams (presentation meeting), mcp-sharepoint (final report)
```

**Step 4.3: Handoff to Roadmap Design**
```
ACTION: Package assessment outputs for DT-02 (Design Adoption Roadmap)
INPUTS: Validated scorecard, gap_analysis, benchmark_comparison
PROCESS:
  1. Structure output as DT-02 input format
  2. Include all prioritized gaps with investment estimates
  3. Include strategic alignment mapping
  4. Include stakeholder readiness indicators
  5. Trigger DT-02 skill if roadmap design is authorized
OUTPUT: roadmap_recommendations (JSON), DT-02 trigger event
MCP: mcp-sharepoint (handoff package)
```

---

## 8. Quality Criteria

### Assessment Quality Metrics

| Metric                          | Target    | Measurement Method                                    |
|---------------------------------|-----------|-------------------------------------------------------|
| Response Rate                   | >= 80%    | Survey completion tracking                            |
| Stakeholder Coverage            | >= 4 roles| Role representation check against requirement         |
| Evidence Triangulation          | >= 2 sources per sub-dimension | Evidence matrix audit             |
| Scoring Confidence              | >= 80% high-confidence scores | Confidence flag analysis          |
| Inter-Rater Reliability         | >= 0.85   | Cohen's kappa if multiple assessors                   |
| Report Delivery Timeliness      | <= 10 days| Project schedule tracking                             |
| Stakeholder Satisfaction        | >= 4.0/5  | Post-assessment feedback survey                       |
| Actionability Score             | >= 4.0/5  | Leadership rating of recommendation clarity           |

### Validation Checkpoints

1. **Pre-Launch Validation**: Scope confirmed, stakeholders identified, instruments configured
2. **Data Collection Validation**: Response rate threshold met, no quality flags
3. **Scoring Validation**: All evidence documented, no unsupported scores
4. **Report Validation**: Executive sponsor review before broad distribution
5. **Post-Delivery Validation**: Feedback collected, lessons learned documented

---

## 9. Inter-Agent Dependencies

### Upstream Dependencies (Inputs from Other Agents)

| Agent       | Skill/Data              | Purpose                                           |
|-------------|-------------------------|---------------------------------------------------|
| Agent 1     | Asset Registry          | Technology inventory and asset data                |
| Agent 10    | Operational KPIs        | Current performance baselines for Process dimension|
| Agent 12    | Knowledge Base          | Existing documentation and knowledge assets        |

### Downstream Consumers (Outputs to Other Agents)

| Agent       | Skill                   | Data Provided                                      |
|-------------|-------------------------|----------------------------------------------------|
| Agent 11    | DT-02 (Adoption Roadmap)| Prioritized gaps, investment estimates, DMI scores  |
| Agent 11    | DT-04 (Change Mgmt)     | People & Culture dimension scores, readiness data   |
| Agent 10    | PERF-01 (KPIs)          | Benchmark data and maturity context                 |
| Agent 12    | KM-01 (Knowledge Capture)| Knowledge management sub-dimension gaps            |

### Feedback Loops

- DT-01 re-assessment triggered annually or after major DT milestones
- DT-02 roadmap progress feeds back to update maturity projections
- DT-04 change management outcomes update People & Culture scores

---

## 10. MCP Integrations

### mcp-sharepoint

```yaml
purpose: "Document storage, benchmark database, report publishing"
operations:
  - action: "read"
    resource: "assessment_templates"
    path: "/Digital-Transformation/Assessment-Templates/"
  - action: "read"
    resource: "benchmark_database"
    path: "/Digital-Transformation/Benchmarks/{industry}/"
  - action: "write"
    resource: "assessment_report"
    path: "/Digital-Transformation/Assessments/{org}/{date}/"
  - action: "read"
    resource: "existing_documents"
    path: "/Organizations/{org}/Documents/"
authentication: "oauth2_delegated"
permissions: ["Sites.ReadWrite.All", "Files.ReadWrite.All"]
```

### mcp-forms

```yaml
purpose: "Digital maturity survey creation, distribution, and response collection"
operations:
  - action: "create"
    resource: "maturity_survey"
    template: "DT01_MaturitySurvey_{industry}_{mode}"
  - action: "distribute"
    resource: "survey_link"
    target: "stakeholder_list"
  - action: "read"
    resource: "survey_responses"
    format: "json"
authentication: "oauth2_delegated"
permissions: ["Forms.ReadWrite.All"]
```

### mcp-teams

```yaml
purpose: "Interview scheduling, stakeholder communication, presentation delivery"
operations:
  - action: "create"
    resource: "meeting"
    type: "interview"
    duration: "45min"
  - action: "send"
    resource: "channel_message"
    channel: "Digital-Transformation"
  - action: "create"
    resource: "meeting"
    type: "presentation"
    duration: "90min"
authentication: "oauth2_delegated"
permissions: ["Calendars.ReadWrite", "Channel.SendMessage"]
```

---

## 11. Templates & References

### Assessment Survey Template Structure

```
Section 1: Strategy & Leadership (12 questions)
  Q1.1: "Our organization has a clearly documented digital transformation strategy"
        [1-Strongly Disagree ... 5-Strongly Agree] + Evidence text field
  Q1.2: "Senior leadership actively champions digital initiatives"
        [1-Strongly Disagree ... 5-Strongly Agree] + Evidence text field
  ... (remaining questions per sub-dimension)

Section 2: People & Culture (12 questions)
Section 3: Technology & Infrastructure (12 questions)
Section 4: Data & Analytics (12 questions)
Section 5: Processes & Operations (12 questions)
Section 6: Innovation & Ecosystem (8 questions)

Total: 68 questions (full mode) / 36 questions (rapid mode)
Estimated completion time: 25--35 minutes (full) / 15--20 minutes (rapid)
```

### Reference Frameworks

| Framework                        | Use in Assessment                                          |
|----------------------------------|-------------------------------------------------------------|
| Acatech Industrie 4.0 Index     | Primary maturity level structure                            |
| MIT/Capgemini DT Framework      | Strategy and leadership dimension design                    |
| WEF Lighthouse criteria         | Operational excellence benchmarking                         |
| ISO 55000                        | Asset management maturity indicators                        |
| NIST Cybersecurity Framework    | Cybersecurity sub-dimension rubric                          |
| DAMA DMBOK                       | Data management maturity indicators                         |

---

## 12. Examples

### Example 1: Mining Company Full Assessment

**Context**: A mid-size copper mining company (3,000 employees) wants to understand its digital readiness before investing in autonomous haulage and predictive maintenance.

**Invocation**:
```
/assess-digital-maturity --scope organization --mode full --industry mining
```

**Key Results**:
```json
{
  "composite_dmi": 38.4,
  "overall_level": "Developing",
  "benchmark_percentile": 35,
  "dimensions": {
    "Strategy & Leadership": 3.0,
    "People & Culture": 2.5,
    "Technology & Infrastructure": 3.8,
    "Data & Analytics": 2.2,
    "Processes & Operations": 3.5,
    "Innovation & Ecosystem": 2.0
  },
  "top_3_strengths": [
    "Strong OT infrastructure with modern SCADA/DCS",
    "Leadership commitment to safety-driven automation",
    "Well-documented operational procedures"
  ],
  "top_5_gaps": [
    {"gap": "Data architecture fragmented across 12 siloed systems", "priority": "critical"},
    {"gap": "No formal AI/ML capability or data science team", "priority": "critical"},
    {"gap": "Digital skills gap: only 15% workforce above basic digital literacy", "priority": "high"},
    {"gap": "No IT/OT convergence strategy despite adjacent networks", "priority": "high"},
    {"gap": "Innovation limited to vendor-driven pilots with no internal pipeline", "priority": "medium"}
  ],
  "recommended_quick_wins": [
    "Establish data governance committee with IT/OT representation",
    "Launch digital literacy program targeting 50% workforce in 6 months",
    "Consolidate historian data into unified time-series platform"
  ]
}
```

**Outcome**: Assessment revealed that while the company had good OT infrastructure (Level 3.8), the data foundation (Level 2.2) was insufficient for autonomous haulage. This redirected $2M from equipment to data infrastructure, avoiding a likely pilot failure.

### Example 2: Rapid Assessment for Chemical Plant

**Context**: A chemical plant needs a quick assessment before an upcoming board meeting to justify digital investment.

**Invocation**:
```
/assess-digital-maturity --scope site --mode rapid --industry chemicals
```

**Key Results**:
```json
{
  "composite_dmi": 52.0,
  "overall_level": "Defined",
  "benchmark_percentile": 55,
  "mode": "rapid",
  "dimensions_assessed": 12,
  "key_finding": "Above industry median in process automation but below in data analytics and workforce digital skills",
  "recommended_next_step": "Full assessment recommended for Data & Analytics and People & Culture dimensions"
}
```

**Outcome**: Rapid assessment provided board-ready data in 2 days, securing approval for a full assessment and initial $500K digital investment.
