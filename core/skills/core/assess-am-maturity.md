# Assess Asset Management Maturity

## Skill ID: O-01
## Version: 1.0.0
## Category: O. Asset Management Intelligence
## Priority: P1 - High

---

## Purpose

Assess an organization's asset management maturity against the ISO 55001 standard and the IAM (Institute of Asset Management) Asset Management Maturity Model, producing a comprehensive gap analysis, quantified maturity scores across all asset management subjects, and a prioritized improvement roadmap that bridges the gap between the current state and the target maturity level.

Asset management maturity is the single best predictor of long-term asset performance, organizational sustainability, and total cost of ownership optimization. Yet the global state of asset management maturity is alarmingly low. Pain Point RW-01 documents that the average organization globally operates at Level 2 out of 5 on the IAM maturity scale (defined as "Developing" -- some awareness but inconsistent application). This means that most organizations are making asset decisions based on incomplete data, fragmented processes, and individual expertise rather than systematic, risk-based, lifecycle-optimized approaches.

The consequences of low maturity are severe and measurable. Organizations at Level 2 maturity typically experience: 30-50% higher total cost of ownership than Level 4 organizations (IAM benchmarking data), 2-3x higher reactive maintenance ratios, 40-60% of asset failures that are repeat failures (indicating ineffective learning loops), and 20-30% shorter effective asset lives due to suboptimal maintenance and renewal strategies. The GFMAM (Global Forum on Maintenance and Asset Management) Landscape framework identifies 39 subjects across 6 groups that collectively define the scope of asset management. Most organizations have significant maturity gaps in strategic planning (SAMP), risk management, lifecycle delivery, and information management.

This skill automates the maturity assessment process -- from structured data collection through scoring, benchmarking, gap analysis, and improvement roadmap generation -- while maintaining the rigor and traceability required for ISO 55001 certification support. The assessment can serve as a standalone diagnostic, as a baseline for an improvement program, or as evidence for ISO 55001 certification audits.

---

## Intent & Specification

**Problem:** Organizations lack a clear, quantified understanding of their asset management capability, leading to:

- **No baseline for improvement** (Pain Point RW-01): Without knowing where they stand, organizations cannot set meaningful improvement targets or measure progress. Maturity assessments are conducted infrequently (every 2-5 years) because they are expensive, time-consuming, and require external consultants.
- **Inconsistent assessment quality**: Maturity assessments vary enormously in rigor depending on the assessor. Self-assessments tend to overrate maturity by 0.5-1.0 levels. External assessments are expensive ($50K-$200K) and time-consuming (8-12 weeks).
- **Assessment fatigue**: Stakeholders are asked to participate in interviews and workshops that take hours, leading to superficial responses and low engagement.
- **Gap analysis without prioritization**: Assessments identify gaps but rarely prioritize them by business impact, creating overwhelming improvement lists with no clear starting point.
- **Disconnection from business outcomes**: Maturity scores are reported as abstract numbers without linking them to tangible business outcomes (cost reduction, risk reduction, performance improvement).
- **ISO 55001 certification challenges**: Only 15-20% of organizations that attempt ISO 55001 certification succeed on first attempt (IAM statistics), often because they misjudge their readiness.

**Success Criteria:**
- Maturity assessment completed in 2-3 weeks (vs. 8-12 weeks with traditional methods)
- Assessment cost reduced by 60-70% through automation of data gathering and analysis
- Maturity scores validated within +/-0.3 levels of independent expert assessment
- 100% coverage of all 39 GFMAM subjects across 6 groups
- Gap analysis linked to quantified business impact (cost, risk, performance)
- Improvement roadmap with clear priorities, timeline, effort, and expected ROI
- ISO 55001 clause-by-clause compliance assessment included
- Stakeholder engagement time reduced by 50% through structured, focused interviews
- Assessment results reproducible and auditable

**Constraints:**
- Must align with IAM Maturity Model and GFMAM Landscape as the authoritative frameworks
- Must map to ISO 55001:2014 requirements for certification support
- Must be adaptable to different industry sectors (mining, oil & gas, power, water, infrastructure)
- Must accommodate organizations of varying sizes (50 to 50,000+ employees)
- Must respect cultural contexts in maturity assessment (Latin American organizations may have different organizational norms)
- Must produce outputs in Spanish (primary) with English technical terms preserved
- Must maintain objectivity and prevent "maturity inflation" in self-assessment modes
- Must handle incomplete data gracefully with documented assumptions

---

## Trigger / Invocation

**Primary Triggers:**
- `assess-am-maturity start --organization [name] --scope [full|partial] --target-level [1-5]`
- `assess-am-maturity status --assessment [id]`
- `assess-am-maturity score --assessment [id] --subject [GFMAM subject]`
- `assess-am-maturity gap-analysis --assessment [id]`
- `assess-am-maturity roadmap --assessment [id] --horizon [1yr|3yr|5yr]`
- `assess-am-maturity benchmark --assessment [id] --industry [sector]`
- `assess-am-maturity iso-mapping --assessment [id]`
- `assess-am-maturity report --assessment [id] --format [executive|detailed|certification]`

**Aliases:** `/am-maturity`, `/maturity-assessment`, `/iso-55001-assessment`, `/evaluar-madurez`

**Automatic Triggers:**
- New OR program initiated (baseline maturity assessment as Phase 1 activity)
- Annual maturity review cycle (recurring assessment for improvement tracking)
- ISO 55001 pre-certification assessment requested
- Post-improvement program effectiveness verification
- Acquisition/merger due diligence (target company AM maturity assessment)

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Organization Profile | User / mcp-sharepoint | .docx / form | Organization name, industry, asset portfolio description, number of employees, annual revenue, regulatory environment |
| Asset Portfolio Summary | mcp-cmms / user | .xlsx | Overview of asset base: number of assets, asset types, replacement value, age distribution, geographic distribution |
| Assessment Scope | User | Selection | Full (all 39 GFMAM subjects) or Partial (selected groups/subjects) |
| Target Maturity Level | User | Number (1-5) | Desired maturity level for improvement roadmap generation |
| Stakeholder List | User | .xlsx | Key stakeholders for interview/survey (names, roles, departments, availability) |

### Optional Inputs (Enhance Assessment Quality)

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Existing AM Documentation | mcp-sharepoint | .docx / .pdf | AM Policy, Strategy (SAMP), AM Plans, AM Objectives, procedures |
| CMMS Data Extract | mcp-cmms | .xlsx / API | Work order history, PM compliance data, backlog data, failure codes |
| Financial Data | mcp-erp | .xlsx / API | Maintenance budgets, CAPEX/OPEX split, cost trends, asset register values |
| Organization Charts | mcp-sharepoint | .pptx / .pdf | Current organizational structure, AM roles, reporting lines |
| Previous Maturity Assessments | mcp-sharepoint | .docx / .xlsx | Prior assessment results for trend analysis |
| Audit Reports | mcp-sharepoint | .pdf | Internal/external audit findings related to asset management |
| KPI Dashboards | mcp-powerbi | Dashboard data | Current AM performance metrics and trends |
| Training Records | mcp-lms | .xlsx | AM competency and training completion data |
| Risk Registers | mcp-sharepoint | .xlsx | Asset risk assessments and registers |
| Survey Responses | mcp-forms | Form data | Structured maturity survey completed by stakeholders |

---

## Output Specification

### Primary Output 1: Asset Management Maturity Assessment Report (.docx)

**Filename:** `{OrgCode}_AM_Maturity_Assessment_v{version}_{date}.docx`

**Structure (50-80 pages):**

1. **Executive Summary** (3-5 pages)
   - Overall maturity score and level
   - Maturity profile radar chart (6 groups)
   - Key strengths and critical gaps
   - Top 5 priority improvement areas with expected business impact
   - Comparison against industry benchmark
   - Estimated ROI of reaching target maturity level

2. **Assessment Methodology** (3-4 pages)
   - IAM Maturity Model framework description
   - GFMAM Landscape mapping
   - ISO 55001 alignment approach
   - Scoring methodology and evidence requirements
   - Assessment process and timeline
   - Stakeholders engaged and data sources used

3. **Organization Context** (2-3 pages)
   - Organization profile and asset portfolio summary
   - Industry context and regulatory environment
   - Strategic objectives relevant to asset management
   - Current AM organizational structure

4. **Maturity Assessment Results** (15-25 pages)
   - Group 1: Strategy & Planning
     - Subject 1.1: AM Policy -- Score, Evidence, Gap, Improvement
     - Subject 1.2: AM Strategy & Objectives -- Score, Evidence, Gap, Improvement
     - Subject 1.3: Demand Analysis -- Score, Evidence, Gap, Improvement
     - Subject 1.4: Strategic Planning (SAMP) -- Score, Evidence, Gap, Improvement
     - Subject 1.5: AM Planning -- Score, Evidence, Gap, Improvement
   - Group 2: AM Decision-Making
     - Subject 2.1: Capital Investment Decision-Making
     - Subject 2.2: Operations & Maintenance Decision-Making
     - Subject 2.3: Lifecycle Value Realization
     - Subject 2.4: Resourcing Strategy
     - Subject 2.5: Shutdowns & Outage Strategy
   - Group 3: Lifecycle Delivery
     - Subject 3.1: Technical Standards & Legislation
     - Subject 3.2: Asset Creation & Acquisition
     - Subject 3.3: Systems Engineering
     - Subject 3.4: Configuration Management
     - Subject 3.5: Maintenance Delivery
     - Subject 3.6: Reliability Engineering
     - Subject 3.7: Asset Operations
     - Subject 3.8: Resource Management
     - Subject 3.9: Shutdown & Outage Management
     - Subject 3.10: Fault & Incident Response
     - Subject 3.11: Asset Decommissioning & Disposal
   - Group 4: Asset Information
     - Subject 4.1: Asset Information Strategy
     - Subject 4.2: Asset Information Standards
     - Subject 4.3: Asset Information Systems
     - Subject 4.4: Asset Data & Knowledge
   - Group 5: Organization & People
     - Subject 5.1: Procurement & Supply Chain Management
     - Subject 5.2: AM Leadership
     - Subject 5.3: Organizational Structure
     - Subject 5.4: Organizational Culture
     - Subject 5.5: Competence Management
   - Group 6: Risk & Review
     - Subject 6.1: Risk Assessment & Management
     - Subject 6.2: Contingency Planning & Resilience
     - Subject 6.3: Sustainable Development
     - Subject 6.4: Management of Change
     - Subject 6.5: Asset Performance & Health Monitoring
     - Subject 6.6: Management Review, Audit & Assurance
     - Subject 6.7: Accounting Practices
     - Subject 6.8: Stakeholder Engagement

   For each subject, the report provides:
   - Current maturity score (0-5 with 0.5 increments)
   - Target maturity score
   - Gap (target minus current)
   - Evidence summary (what was found)
   - Strengths (what is working well)
   - Weaknesses (what needs improvement)
   - Specific improvement recommendations

5. **ISO 55001 Compliance Mapping** (5-8 pages)
   - Clause-by-clause assessment against ISO 55001:2014 requirements
   - Compliance status: Conforming / Partially Conforming / Non-Conforming / Not Assessed
   - Evidence of conformance for each clause
   - Gaps requiring closure for certification
   - Estimated effort to achieve certification readiness

6. **Industry Benchmarking** (3-5 pages)
   - Comparison against industry-sector averages
   - Comparison against best-in-class organizations
   - Identification of relative strengths and weaknesses
   - Industry-specific maturity patterns and norms

7. **Improvement Roadmap** (5-8 pages)
   - Priority matrix: Impact vs. Effort for all identified improvements
   - Phase 1: Quick Wins (0-6 months) -- high impact, low effort
   - Phase 2: Core Improvements (6-18 months) -- high impact, medium effort
   - Phase 3: Advanced Maturity (18-36 months) -- medium impact, high effort
   - Phase 4: Excellence (36+ months) -- continuous improvement and optimization
   - Resource requirements by phase
   - Estimated investment and expected ROI
   - Dependencies between improvement initiatives
   - Critical success factors

8. **Appendices**
   - A: Detailed scoring sheets (all 39 subjects)
   - B: Evidence register (documents reviewed, interviews conducted, data analyzed)
   - C: IAM Maturity Model level definitions
   - D: GFMAM Landscape subject descriptions
   - E: ISO 55001 clause text and requirements
   - F: Industry benchmark data sources

### Primary Output 2: Maturity Scoring Workbook (.xlsx)

**Filename:** `{OrgCode}_AM_Maturity_Scores_v{version}_{date}.xlsx`

**Sheets:**
- **Summary Dashboard**: Overall score, group scores, radar chart data, trend data
- **Detailed Scores**: All 39 subjects with current score, target score, gap, evidence summary
- **Evidence Register**: Every piece of evidence reviewed with reference and assessment
- **ISO 55001 Mapping**: Clause-by-clause compliance with GFMAM subject cross-reference
- **Benchmark Data**: Industry comparison data
- **Improvement Register**: All improvement actions with priority, effort, impact, owner, timeline
- **Survey Results**: Aggregated stakeholder survey data (if used)

### Primary Output 3: Improvement Roadmap (.pptx)

**Filename:** `{OrgCode}_AM_Improvement_Roadmap_v{version}_{date}.pptx`

**Structure (15-20 slides):**
- Current state summary with maturity radar chart
- Target state vision with quantified benefits
- Gap analysis heat map
- Priority matrix (impact vs. effort)
- Phase 1-4 improvement initiatives
- Implementation timeline (Gantt chart)
- Resource and investment requirements
- Expected maturity progression curve
- Key milestones and success criteria
- Governance and monitoring framework

---

## Methodology & Standards

### IAM Asset Management Maturity Model (Primary Framework)

The assessment uses the IAM's six-level maturity scale:

| Level | Name | Description | Characteristics |
|-------|------|-------------|-----------------|
| **0** | **Innocent** | No awareness of asset management as a discipline | No AM policy, no systematic approach, purely reactive |
| **1** | **Aware** | Awareness exists but AM is ad hoc and individual-dependent | Some documentation exists, inconsistently applied, key-person dependent |
| **2** | **Developing** | AM processes being developed and formalized | Documented processes, partial implementation, inconsistent compliance, limited integration |
| **3** | **Competent** | AM processes established and consistently applied | Systematic approach, documented and followed, performance measured, some optimization |
| **4** | **Optimizing** | AM processes continuously improved based on data and learning | Data-driven decisions, lifecycle optimization, integrated planning, quantified risk management |
| **5** | **Excellent** | World-class AM, recognized industry leader | Predictive and prescriptive, full lifecycle optimization, innovation leader, benchmarking reference |

### GFMAM Landscape Framework

The GFMAM (Global Forum on Maintenance and Asset Management) Landscape defines the 39 subjects organized into 6 groups that collectively describe the full scope of asset management:

```
Group 1: Strategy & Planning (5 subjects)
  1.1 AM Policy
  1.2 AM Strategy & Objectives
  1.3 Demand Analysis
  1.4 Strategic Planning (SAMP)
  1.5 AM Planning

Group 2: AM Decision-Making (5 subjects)
  2.1 Capital Investment Decision-Making
  2.2 O&M Decision-Making
  2.3 Lifecycle Value Realization
  2.4 Resourcing Strategy
  2.5 Shutdowns & Outage Strategy

Group 3: Lifecycle Delivery (11 subjects)
  3.1 Technical Standards & Legislation
  3.2 Asset Creation & Acquisition
  3.3 Systems Engineering
  3.4 Configuration Management
  3.5 Maintenance Delivery
  3.6 Reliability Engineering
  3.7 Asset Operations
  3.8 Resource Management
  3.9 Shutdown & Outage Management
  3.10 Fault & Incident Response
  3.11 Asset Decommissioning & Disposal

Group 4: Asset Information (4 subjects)
  4.1 Asset Information Strategy
  4.2 Asset Information Standards
  4.3 Asset Information Systems
  4.4 Asset Data & Knowledge

Group 5: Organization & People (5 subjects)
  5.1 Procurement & Supply Chain Management
  5.2 AM Leadership
  5.3 Organizational Structure
  5.4 Organizational Culture
  5.5 Competence Management

Group 6: Risk & Review (9 subjects)
  6.1 Risk Assessment & Management
  6.2 Contingency Planning & Resilience
  6.3 Sustainable Development
  6.4 Management of Change
  6.5 Asset Performance & Health Monitoring
  6.6 Management Review, Audit & Assurance
  6.7 Accounting Practices
  6.8 Stakeholder Engagement
```

### ISO 55001:2014 Clause Mapping

Each GFMAM subject maps to one or more ISO 55001 clauses:

| ISO 55001 Clause | GFMAM Subject(s) | Description |
|------------------|-------------------|-------------|
| 4.1 Understanding the organization and its context | 1.2, 1.3, 6.8 | External/internal issues affecting AM |
| 4.2 Understanding needs and expectations of stakeholders | 6.8 | Stakeholder requirements |
| 4.3 Determining scope of AM system | 1.1, 1.2 | Boundaries and applicability |
| 4.4 Asset management system | 1.2, 1.5 | AM system establishment |
| 5.1 Leadership and commitment | 5.2 | Top management commitment |
| 5.2 Policy | 1.1 | AM policy establishment |
| 5.3 Organizational roles, responsibilities and authorities | 5.3 | Roles and responsibilities |
| 6.1 Actions to address risks and opportunities | 6.1, 6.2 | Risk management |
| 6.2 AM objectives and planning to achieve them | 1.2, 1.4, 1.5 | AM objectives and SAMP |
| 7.1 Resources | 3.8, 2.4 | Resource provision |
| 7.2 Competence | 5.5 | Competence requirements |
| 7.3 Awareness | 5.4 | AM awareness |
| 7.4 Communication | 6.8 | Internal/external communication |
| 7.5 Information requirements | 4.1, 4.2, 4.3, 4.4 | Documented information |
| 7.6 Documented information | 4.1, 4.2 | Document control |
| 8.1 Operational planning and control | 1.5, 3.5, 3.7 | Operational implementation |
| 8.2 Management of change | 6.4 | Change management |
| 8.3 Outsourcing | 5.1 | Outsourced activities |
| 9.1 Monitoring, measurement, analysis and evaluation | 6.5, 6.7 | Performance evaluation |
| 9.2 Internal audit | 6.6 | Audit program |
| 9.3 Management review | 6.6 | Management review |
| 10.1 Nonconformity and corrective action | 6.6, 3.10 | Corrective actions |
| 10.2 Preventive action | 6.1 | Preventive actions |
| 10.3 Continual improvement | 6.5, 6.6 | Improvement |

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| RW-01: Low Maturity | Average global maturity Level 2/5 | Achieve Level 3+ within 18 months | +1 maturity level |
| ISO Certification Failure | 80-85% fail first certification attempt | >50% first-time pass rate with this tool | 3x improvement |
| Assessment Cost | $50K-$200K for external assessment | $15K-$50K with automation support | 60-75% cost reduction |
| Assessment Duration | 8-12 weeks for traditional assessment | 2-3 weeks with structured approach | 70-75% time reduction |
| TCO Gap | Level 2 orgs pay 30-50% more TCO than Level 4 | Roadmap to reduce TCO by 20-30% | Quantified ROI path |
| Repeat Failures | 40-60% of failures are repeat failures at Level 2 | <20% repeat failure rate at Level 3+ | 50-67% reduction |

---

## Step-by-Step Execution

### Phase 1: Assessment Setup & Data Gathering (Steps 1-4)

**Step 1: Define Assessment Scope and Context**
1. Confirm organization profile:
   - Industry sector (mining, oil & gas, power, water, infrastructure, manufacturing)
   - Asset portfolio scope (all assets, specific site, specific asset class)
   - Regulatory environment (jurisdiction, applicable standards, certification requirements)
   - Organization size (employees, revenue, asset replacement value)
2. Confirm assessment scope:
   - Full assessment (all 39 GFMAM subjects) or partial (selected groups/subjects)
   - ISO 55001 mapping required? (yes/no)
   - Industry benchmarking required? (yes/no)
   - Improvement roadmap horizon (1 year, 3 years, 5 years)
3. Set target maturity level:
   - Level 3 ("Competent") is the most common target for organizations starting from Level 2
   - Level 4 ("Optimizing") for organizations already at Level 3 seeking advancement
   - Level 5 ("Excellent") only for organizations committed to industry leadership
4. Confirm assessment team and stakeholder engagement plan:
   - Internal assessment champion (person who will drive improvements)
   - Key stakeholders for interviews (minimum: GM/CEO, AM Director/Manager, Maintenance Manager, Operations Manager, Finance Manager, HSE Manager)
   - Data owners who can provide system extracts

**Step 2: Automated Data Collection**
1. Query connected MCP systems for evidence data:
   - **mcp-cmms**: Extract work order data (12-24 months), PM compliance rates, backlog metrics, failure codes, equipment register completeness
   - **mcp-sharepoint**: Search for AM documentation (policy, strategy, plans, procedures), audit reports, risk registers, organizational charts
   - **mcp-forms**: Deploy maturity self-assessment survey to stakeholders (structured questionnaire based on IAM model)
   - **mcp-erp**: Extract maintenance budget data, CAPEX/OPEX split, spare parts inventory data
2. Analyze document inventory:
   - Which GFMAM subjects have documented policies, procedures, or plans?
   - What is the document revision status? (current, outdated, draft)
   - What is the approval status? (approved, pending, unapproved)
3. Analyze CMMS data for maturity indicators:
   - PM compliance rate (Level 2: 50-70%, Level 3: 80-90%, Level 4: >95%)
   - Planned vs. unplanned work ratio (Level 2: 40-60%, Level 3: 70-80%, Level 4: >85%)
   - Work order completion rate and backlog trend
   - Failure code usage rate (indicator of data quality maturity)
   - Asset register completeness and accuracy
4. Generate preliminary maturity indicators from data analysis

**Step 3: Stakeholder Survey Deployment**
1. Deploy structured maturity survey via mcp-forms:
   - 39 questions (one per GFMAM subject) with maturity level descriptions
   - Each question asks: "Select the description that best matches your organization's current practice"
   - Level descriptions written in plain language (not ISO jargon)
   - Takes approximately 30-45 minutes to complete
   - Available in English and Spanish
2. Target 10-20 respondents across organizational functions:
   - Senior management (2-3): strategic perspective
   - Middle management (4-6): operational perspective
   - Technical specialists (4-6): implementation perspective
   - Front-line supervisors (2-4): execution perspective
3. Analyze survey results:
   - Calculate average score per subject across all respondents
   - Calculate standard deviation (high deviation indicates inconsistent understanding)
   - Identify subjects where management and front-line scores diverge (>1 level gap indicates disconnect)
   - Flag subjects where self-assessment appears inflated (compare to evidence data)

**Step 4: Targeted Stakeholder Interviews**
1. Conduct focused interviews with key stakeholders (30-45 minutes each):
   - Not a re-assessment of all 39 subjects
   - Focus on subjects where:
     - Data is ambiguous or insufficient
     - Survey responses show high divergence
     - Self-assessment appears inconsistent with evidence
   - Ask for specific examples and evidence (not general statements)
2. Standard interview questions per subject:
   - "Can you describe how your organization approaches [subject]?"
   - "What documented policies/procedures exist for [subject]?"
   - "How consistently is [subject] applied across the organization?"
   - "How do you measure performance in [subject]?"
   - "What improvements have been made in [subject] over the past 2 years?"
   - "What are the biggest challenges in [subject]?"
3. Record interview findings with evidence references
4. Triangulate interview data with survey and system data

### Phase 2: Scoring & Analysis (Steps 5-8)

**Step 5: Score Each GFMAM Subject**
1. For each of the 39 GFMAM subjects, determine the maturity score (0-5 in 0.5 increments):
   - Triangulate three data sources: (a) documented evidence, (b) survey responses, (c) interview findings
   - Apply the "weakest link" principle: score based on consistent practice, not best example
   - Weight evidence hierarchy: documented and verified > stated in interviews > self-assessed in survey
2. Scoring criteria per level (for each subject):
   - **Level 0 (Innocent)**: No evidence of the subject being addressed
   - **Level 1 (Aware)**: Awareness exists; may have informal/ad hoc approach; not documented
   - **Level 2 (Developing)**: Documented process exists but inconsistently applied; some metrics; limited integration
   - **Level 3 (Competent)**: Documented, consistently applied, measured, reviewed; integration with other subjects
   - **Level 4 (Optimizing)**: Data-driven optimization; quantitative analysis; continuous improvement evidence; lifecycle perspective
   - **Level 5 (Excellent)**: Industry-leading practice; innovation; predictive/prescriptive; full integration; recognized externally
3. Half-level scores (e.g., 2.5) are used when:
   - Organization meets all criteria for one level and some but not all for the next
   - Practice is inconsistent across different parts of the organization
4. Document evidence and rationale for each score
5. Apply calibration checks:
   - Group 1 (Strategy & Planning) scores should generally be >= Group 3 (Lifecycle Delivery) scores (strategy precedes execution)
   - Group 4 (Information) scores should generally be <= Group 3 (Delivery) scores (information supports delivery)
   - No single subject should be more than 2 levels above the overall average (indicates isolated pockets of excellence)

**Step 6: Perform Gap Analysis**
1. For each subject, calculate the gap: Target Level - Current Level
2. Classify gaps:
   - Critical Gap (>2.0 levels): Requires urgent attention; likely a risk to operations or compliance
   - Significant Gap (1.0-2.0 levels): Requires planned improvement program
   - Minor Gap (0.5-1.0 levels): Can be addressed through continuous improvement
   - No Gap (0): At or above target; maintain current practice
3. Link each gap to business impact:
   - Cost impact: What does this gap cost the organization? (excess maintenance cost, poor capital decisions, inefficient resources)
   - Risk impact: What risks does this gap create? (safety, environmental, regulatory, asset failure, reputation)
   - Performance impact: How does this gap affect asset performance? (availability, throughput, quality, reliability)
4. Generate gap analysis heat map:
   - 6 groups x maturity levels matrix
   - Color coding: Green (at target), Yellow (minor gap), Orange (significant gap), Red (critical gap)

**Step 7: Perform ISO 55001 Compliance Assessment**
1. Map maturity scores to ISO 55001 clause requirements:
   - Each ISO clause has a minimum maturity threshold for compliance (typically Level 3)
   - Score each clause: Conforming (meets requirements), Partially Conforming (some evidence but gaps), Non-Conforming (significant gaps or no evidence)
2. Identify certification blockers:
   - Clauses that are Non-Conforming are mandatory-fix items
   - Clauses that are Partially Conforming need gap closure plan
3. Estimate certification readiness:
   - Ready: >90% clauses Conforming, 0 Non-Conforming
   - Nearly Ready: >75% clauses Conforming, <10% Non-Conforming
   - Significant Work Required: <75% Conforming or >10% Non-Conforming
4. Generate ISO 55001 compliance matrix for the report

**Step 8: Perform Industry Benchmarking**
1. Compare maturity scores against industry-sector benchmarks:
   - Mining sector average: Overall 2.1/5, strongest in Group 3 (Lifecycle Delivery), weakest in Group 1 (Strategy) and Group 4 (Information)
   - Oil & Gas sector average: Overall 2.8/5, strongest in Group 6 (Risk & Review), weakest in Group 4 (Information)
   - Power sector average: Overall 2.5/5, strongest in Group 2 (Decision-Making), weakest in Group 5 (Organization)
   - Water sector average: Overall 2.9/5, strongest in Group 1 (Strategy), weakest in Group 3 (Lifecycle Delivery)
   - Infrastructure sector average: Overall 2.3/5, strongest in Group 1 (Strategy), weakest in Group 3 (Lifecycle Delivery)
2. Identify relative strengths (subjects where organization exceeds industry average)
3. Identify relative weaknesses (subjects where organization lags industry average)
4. Benchmark against best-in-class organizations (Level 4+) to define the aspiration
5. Generate benchmark comparison charts for the report

### Phase 3: Roadmap Generation & Reporting (Steps 9-12)

**Step 9: Prioritize Improvement Initiatives**
1. For each identified gap, define an improvement initiative:
   - Initiative title and description
   - GFMAM subjects addressed
   - Current state and target state
   - Expected maturity improvement (in levels)
   - Estimated effort (person-months)
   - Estimated cost
   - Expected business benefit (quantified where possible)
   - Prerequisites and dependencies
2. Plot all initiatives on an Impact vs. Effort matrix:
   - **Quick Wins** (high impact, low effort): Prioritize first
   - **Major Projects** (high impact, high effort): Plan carefully, resource adequately
   - **Fill-ins** (low impact, low effort): Do when convenient
   - **Thankless Tasks** (low impact, high effort): Deprioritize or combine with other work
3. Group initiatives into implementation phases:
   - Phase 1 (Quick Wins, 0-6 months): Typically 5-8 initiatives
   - Phase 2 (Core Improvements, 6-18 months): Typically 8-12 initiatives
   - Phase 3 (Advanced Maturity, 18-36 months): Typically 5-10 initiatives
   - Phase 4 (Excellence, 36+ months): Continuous improvement and optimization

**Step 10: Build Improvement Roadmap**
1. Sequence improvement initiatives respecting dependencies:
   - Foundation subjects (Policy, Strategy, Information) typically come first
   - Delivery subjects (Maintenance, Operations, Reliability) follow
   - Advanced subjects (Lifecycle optimization, Predictive analytics) come last
2. Map resource requirements over time:
   - Internal FTE required per phase
   - External consultant support required
   - Technology/system investments required
   - Training and capability development required
3. Estimate maturity progression:
   - Typical maturity improvement rate: 0.5 levels per year with dedicated improvement program
   - Faster improvement (0.75-1.0 levels/year) possible for organizations with strong leadership commitment
   - Slower improvement (0.25-0.5 levels/year) typical for organizations with limited resources
4. Calculate expected ROI of reaching target maturity:
   - Maintenance cost reduction (Level 2 to 3: typically 15-25% reduction)
   - Capital decision quality improvement (better lifecycle cost optimization)
   - Risk reduction (fewer unexpected failures, better contingency planning)
   - Regulatory compliance improvement (reduced audit findings and penalties)

**Step 11: Generate Assessment Report**
1. Compile the Maturity Assessment Report (.docx) per the output specification
2. Compile the Maturity Scoring Workbook (.xlsx) with all detailed data
3. Compile the Improvement Roadmap (.pptx) for management presentation
4. Generate the Executive Summary as a standalone document for senior leadership
5. Prepare an ISO 55001 Gap Closure Plan if certification is a target
6. All deliverables in Spanish (primary) with English technical terms preserved

**Step 12: Facilitate Results Presentation**
1. Prepare stakeholder communication plan:
   - Executive leadership: Focus on business impact and ROI
   - Middle management: Focus on specific gaps and improvement actions in their areas
   - Technical staff: Focus on detailed findings and recommendations
2. Generate presentation materials for each audience level
3. Prepare FAQ document addressing common reactions:
   - "Our maturity score seems too low" -- explain evidence-based scoring and calibration
   - "We already do this" -- distinguish between informal/ad hoc practice and systematic approach
   - "We don't have budget for all improvements" -- explain phased approach and ROI
4. Distribute report via mcp-sharepoint and notifications via mcp-outlook

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Subject Coverage | GFMAM subjects assessed | 100% (39/39) | 100% for full assessment |
| Evidence Base | % of scores supported by documented evidence | >80% | >60% |
| Triangulation | % of scores validated by 2+ data sources | >70% | >50% |
| Score Accuracy | Deviation from independent expert validation | <0.3 levels | <0.5 levels |
| Stakeholder Participation | % of identified stakeholders engaged | >80% | >60% |
| ISO Mapping | ISO 55001 clauses assessed | 100% | 100% if scope includes ISO |
| Gap Quantification | % of gaps linked to business impact | >80% | >60% |
| Roadmap Completeness | All critical/significant gaps have improvement initiatives | 100% | 100% |
| Assessment Duration | Total elapsed time from start to report | <3 weeks | <4 weeks |
| Report Quality | Stakeholder rating of report usefulness | >4.0/5.0 | >3.5/5.0 |
| Reproducibility | Same assessor would produce same scores (+/-0.25) | >90% of subjects | >80% of subjects |
| Bias Control | Self-assessment inflation vs. evidence-based score | <0.5 levels | <1.0 levels |

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `agent-maintenance` | Data Provider | Provides CMMS data, maintenance strategy documentation, and maintenance practice evidence |
| `agent-operations` | Data Provider | Provides operations data, SOP documentation, and operations practice evidence |
| `agent-hse` | Data Provider | Provides risk management data, HSE compliance evidence, and incident data |
| `agent-finance` | Data Provider | Provides financial data, budget information, and cost management evidence |
| `agent-hr` | Data Provider | Provides competency data, training records, and organizational structure information |
| `agent-doc-control` | Data Provider | Provides document management maturity evidence, document inventory, and revision control data |
| `develop-samp` (O-02) | Downstream | Maturity assessment identifies SAMP gaps that trigger SAMP development |
| `embed-risk-based-decisions` (O-03) | Downstream | Risk management maturity gaps trigger risk framework implementation |
| `analyze-gap-assessment` (B-05) | Complementary | General gap assessment skill provides methodology; this skill specializes for AM |
| `orchestrate-or-program` (H-01) | Upstream | OR program uses maturity assessment as baseline for AM workstream planning |
| `track-or-deliverables` (H-02) | Integration | Assessment deliverables tracked in OR program deliverable register |
| `benchmark-maintenance-kpis` (J-04) | Data Provider | Maintenance KPI benchmarks inform lifecycle delivery maturity scoring |
| `validate-output-quality` (F-05) | Quality Gate | Assessment report validated before distribution |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Extract operational evidence for maturity assessment scoring"
capabilities:
  - Query work order data for planned vs. unplanned ratio calculation
  - Extract PM compliance rates as maturity indicator
  - Retrieve asset register data for information maturity assessment
  - Access failure code usage rates as data quality indicator
  - Pull maintenance backlog trends as performance indicator
authentication: API Key + OAuth2
usage_in_skill:
  - Step 2: Extract CMMS data for automated maturity indicator calculation
  - Step 5: Use CMMS data as evidence for Lifecycle Delivery scoring
  - Step 8: Use CMMS KPIs for benchmarking comparison
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Access AM documentation for evidence-based scoring and store assessment deliverables"
capabilities:
  - Search for AM policy, strategy, plans, and procedures documents
  - Retrieve organizational charts and role descriptions
  - Access audit reports and management review records
  - Access risk registers and management of change records
  - Store assessment reports, scoring workbooks, and improvement roadmaps
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 2: Search for and retrieve AM documentation
  - Step 5: Use documents as evidence for scoring across all 6 groups
  - Step 11: Store all assessment deliverables
  - Step 12: Distribute reports to stakeholders
```

### mcp-forms
```yaml
name: "mcp-forms"
server: "@anthropic/forms-mcp"
purpose: "Deploy and collect structured maturity self-assessment surveys"
capabilities:
  - Create and deploy structured survey forms (39-question maturity assessment)
  - Collect responses from multiple stakeholders
  - Aggregate and analyze response data
  - Support multi-language forms (English/Spanish)
  - Track response rates and send reminders
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Deploy maturity self-assessment survey to stakeholders
  - Step 3: Collect and analyze survey responses
  - Step 5: Use survey data as one of three triangulation sources
```

---

## Templates & References

### Templates
- `templates/am_maturity_assessment_report.docx` -- Full assessment report template with VSC branding
- `templates/am_maturity_scoring_workbook.xlsx` -- Scoring workbook with all 39 subjects pre-loaded
- `templates/am_maturity_survey_questions.xlsx` -- Self-assessment survey questions (English/Spanish)
- `templates/am_improvement_roadmap.pptx` -- Improvement roadmap presentation template
- `templates/iso_55001_compliance_matrix.xlsx` -- ISO 55001 clause-by-clause assessment template
- `templates/am_maturity_radar_chart.xlsx` -- Radar chart template for 6-group visualization

### Reference Documents
- IAM Anatomy of Asset Management (2015) -- Definitive framework for AM subjects and their relationships
- IAM Asset Management Maturity Scale and Guidance (2016) -- Level definitions and scoring guidance
- GFMAM Asset Management Landscape (3rd Edition, 2021) -- 39 subjects, 6 groups framework
- ISO 55000:2014 -- Asset management: Overview, principles and terminology
- ISO 55001:2014 -- Asset management: Management systems - Requirements
- ISO 55002:2018 -- Asset management: Management systems - Guidelines for the application of ISO 55001
- PAS 55:2008 -- Publicly Available Specification for the optimized management of physical assets (historical reference, predecessor to ISO 55001)
- SMRP Best Practices -- Maintenance and reliability metrics for maturity benchmarking
- EFNMS benchmarking surveys -- European maintenance and AM maturity data

---

## Examples

### Example 1: Mining Company Maturity Assessment (Baseline)

```
Assessment ID: AMA-MDP-2026-001
Organization: Minera del Pacifico S.A.
Industry: Copper Mining
Asset Portfolio: 12,500 assets | $4.8B replacement value
Assessment Scope: Full (39 GFMAM subjects)
Target Level: 3.0 (Competent)

Results Summary:
  Overall Maturity Score: 2.1 / 5.0 (Level 2 - Developing)

  Group Scores:
  +------------------------------------+-------+--------+-----+
  | Group                              | Score | Target | Gap |
  +------------------------------------+-------+--------+-----+
  | 1. Strategy & Planning             | 1.6   | 3.0    | 1.4 |
  | 2. AM Decision-Making              | 2.0   | 3.0    | 1.0 |
  | 3. Lifecycle Delivery              | 2.6   | 3.0    | 0.4 |
  | 4. Asset Information               | 1.8   | 3.0    | 1.2 |
  | 5. Organization & People           | 2.2   | 3.0    | 0.8 |
  | 6. Risk & Review                   | 2.1   | 3.0    | 0.9 |
  +------------------------------------+-------+--------+-----+
  | OVERALL                            | 2.1   | 3.0    | 0.9 |
  +------------------------------------+-------+--------+-----+

  Key Findings:
  - No documented AM Policy or SAMP (Group 1 weakness)
  - Maintenance delivery is the strongest area (2.6) driven by CMMS implementation
  - Asset information systems exist but data quality is poor (65% equipment register accuracy)
  - Risk management is reactive (incident-driven rather than risk-based)
  - No formal competency framework for asset management roles
  - ISO 55001 certification readiness: Significant Work Required (47% conforming)

  Industry Benchmark:
  - Below mining sector average (2.1 vs. 2.1 -- at average)
  - Below best-in-class mining companies (3.6-4.2)
  - Relative strength: Lifecycle Delivery (+0.5 above sector average)
  - Relative weakness: Strategy & Planning (-0.5 below sector average)

  Improvement Roadmap (3-year horizon):
  Phase 1 (0-6 months) - Quick Wins:
    - Develop and publish AM Policy (Subject 1.1) -- 2 weeks effort
    - Implement work order failure coding per ISO 14224 (Subject 4.4) -- 4 weeks
    - Establish AM KPI dashboard (Subject 6.5) -- 3 weeks
    - Conduct risk assessment workshop for critical assets (Subject 6.1) -- 2 weeks
    Expected: +0.3 overall maturity improvement

  Phase 2 (6-18 months) - Core Improvements:
    - Develop SAMP aligned to corporate strategy (Subject 1.4) -- 12 weeks
    - Implement RCM-based maintenance strategy for critical assets (Subject 3.6) -- 16 weeks
    - Establish AM competency framework and training program (Subject 5.5) -- 8 weeks
    - Improve asset register data quality to >90% (Subject 4.4) -- ongoing
    - Implement lifecycle cost analysis for capital decisions (Subject 2.1) -- 8 weeks
    Expected: +0.5 additional maturity improvement (cumulative 2.9)

  Phase 3 (18-36 months) - Advanced Maturity:
    - Implement predictive maintenance program (Subject 3.5/3.6) -- 12 weeks
    - Develop asset information strategy and standards (Subjects 4.1/4.2) -- 8 weeks
    - Achieve ISO 55001 certification (all subjects) -- 16 weeks preparation
    - Implement continuous improvement program (Subject 6.6) -- ongoing
    Expected: +0.3 additional improvement (cumulative 3.2 -- exceeds target)

  Total Improvement Program Investment: $1.2M over 3 years
  Expected ROI: $4.8M in maintenance cost reduction + $2.1M in improved capital decisions = 5.75:1 ROI
```
