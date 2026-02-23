# Develop SAMP

## Skill ID: O-02
## Version: 1.0.0
## Category: O. Asset Management Intelligence
## Priority: P1 - High

---

## Purpose

Develop a comprehensive Strategic Asset Management Plan (SAMP) aligned with ISO 55001 requirements, translating organizational objectives into asset management objectives and establishing the framework that connects high-level business strategy to day-to-day asset management activities. The SAMP is the critical "line-of-sight" document that ensures every asset decision, from capital investment to maintenance task selection, contributes to achieving organizational goals.

The SAMP is the most important and most commonly missing document in asset management. Pain Point ISO-02 documents that only 20-25% of organizations that claim to practice asset management have a formal SAMP. This gap is not merely a documentation deficiency -- it represents a fundamental disconnection between what the organization is trying to achieve and how its assets are managed. Without a SAMP, asset management becomes a collection of disconnected activities: maintenance does its thing, capital planning does another, operations another, with no unifying framework to ensure alignment, optimize trade-offs, or manage lifecycle risks.

ISO 55001 Clause 6.2 explicitly requires that organizations "establish AM objectives at relevant functions, levels, and processes" and plan how to achieve them. The SAMP is the document that fulfills this requirement. It translates the organizational plan into the asset management objectives and then into asset management plans. This "line-of-sight" is the hallmark of a mature asset management system: every person managing an asset can explain how their work contributes to organizational objectives.

The IAM (Institute of Asset Management) describes the SAMP as providing "the connection between the organizational plan (objectives) and the individual AM plans that cover specific asset types, asset groups, or individual assets." Without this connection, organizations typically operate in one of two failure modes: (1) asset management is purely tactical, driven by immediate needs rather than strategy, or (2) asset management strategy exists on paper but is disconnected from operational reality.

A well-developed SAMP typically delivers: 10-20% improvement in capital allocation efficiency, 15-25% reduction in total cost of ownership through lifecycle optimization, measurable improvement in risk-informed decision-making, and clear governance frameworks that accelerate decision-making.

---

## Intent & Specification

**Problem:** Most organizations manage assets without a strategic framework, leading to:

- **No line-of-sight** (Pain Point ISO-02): Only 20-25% of organizations have a SAMP. Without it, there is no documented connection between organizational objectives and asset management activities. Maintenance plans exist in isolation from capital plans, which exist in isolation from operational plans.
- **Suboptimal capital allocation**: Without lifecycle perspective, capital decisions are based on worst-condition or loudest-voice rather than risk-weighted value optimization. Research by Infrastructure UK found that poor asset planning results in 20-40% higher lifecycle costs.
- **Reactive rather than strategic asset management**: Organizations without a SAMP tend to manage assets reactively -- responding to failures, regulatory demands, and budget cycles rather than proactively optimizing asset portfolios.
- **Misaligned stakeholder expectations**: Without documented AM objectives and strategies, different stakeholders have different (often conflicting) expectations about asset performance, risk tolerance, and investment priorities.
- **Certification barrier**: ISO 55001 certification requires a SAMP (or equivalent). Organizations attempting certification without a SAMP fail the audit at Clause 6.2.
- **Lost value from disconnected planning**: When AM plans (maintenance plans, renewal plans, capital plans) are developed in isolation, optimization opportunities across the lifecycle are missed. The UK Roads Liaison Group estimated that integrated lifecycle planning saves 15-30% vs. siloed planning.

**Success Criteria:**
- SAMP document that meets ISO 55001 Clause 6.2 requirements
- Clear, documented line-of-sight from organizational objectives through AM objectives to AM plans
- Lifecycle perspective covering 10-30 year planning horizon
- Risk-based framework for capital and operational investment prioritization
- Stakeholder alignment on AM objectives and risk appetite
- Document quality sufficient for ISO 55001 certification audit
- SAMP approved by senior leadership (C-suite or equivalent)
- Implementation framework with measurable targets and review cycle

**Constraints:**
- Must align with ISO 55001:2014 and ISO 55002:2018 requirements
- Must reflect the organization's specific context (industry, regulatory, stakeholder)
- Must be practical and implementable (not an academic exercise)
- Must bridge from corporate strategy (which may be high-level) to operational plans (which must be specific)
- Must accommodate organizations at different maturity levels (the SAMP itself is a maturity enabler)
- Must support bilingual delivery (English/Spanish) for Latin American organizations
- Must be a living document with built-in review and update mechanisms
- Must respect confidentiality of corporate strategic information

---

## Trigger / Invocation

**Primary Triggers:**
- `develop-samp start --organization [name] --horizon [10yr|20yr|30yr]`
- `develop-samp update --samp [id] --trigger [annual-review|strategy-change|regulatory|maturity-improvement]`
- `develop-samp gap-analysis --samp [id] --standard [iso55001]`
- `develop-samp align-objectives --samp [id] --corporate-plan [document]`
- `develop-samp report --samp [id] --format [full|executive|audit]`

**Aliases:** `/samp`, `/strategic-am-plan`, `/develop-strategic-plan`, `/plan-estrategico-activos`

**Automatic Triggers:**
- Maturity assessment (O-01) identifies SAMP as a critical gap
- New OR program requires AM strategic framework
- Corporate strategy update requires SAMP realignment
- ISO 55001 certification preparation
- Annual SAMP review cycle

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Organizational Plan / Corporate Strategy | mcp-sharepoint / user | .docx / .pdf | Corporate strategic plan, vision, mission, strategic objectives, key performance targets |
| Asset Portfolio Summary | mcp-cmms / mcp-erp | .xlsx | Asset inventory by type, age, condition, replacement value, criticality |
| Stakeholder Requirements | mcp-sharepoint / interviews | .docx | Key stakeholder expectations for asset performance, service levels, risk tolerance |
| Regulatory Environment | mcp-sharepoint / user | .docx | Applicable regulations, permits, compliance requirements that constrain AM decisions |
| Financial Framework | mcp-erp / user | .xlsx | Budget constraints, funding mechanisms, financial targets (ROIC, EBITDA, cost/unit) |
| Current AM Documentation | mcp-sharepoint | .docx / .pdf | Existing AM policy, AM plans, maintenance strategies, capital plans (if they exist) |

### Optional Inputs (Enhance SAMP Quality)

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Maturity Assessment Results | assess-am-maturity (O-01) | .docx / .xlsx | Current maturity scores and gaps -- informs realistic objective setting |
| Asset Condition Data | mcp-cmms | .xlsx | Condition assessment results, remaining useful life estimates |
| Risk Register | mcp-sharepoint | .xlsx | Asset risk assessments and risk appetite statements |
| Performance Data | mcp-cmms / mcp-powerbi | .xlsx / dashboard | Historical asset performance KPIs (availability, reliability, cost) |
| Demand Forecasts | Corporate planning | .xlsx | Production forecasts, demand growth projections, capacity requirements |
| Technology Roadmap | Engineering / IT | .docx | Planned technology changes, digital transformation initiatives |
| Peer Benchmarking | Industry data | .xlsx | Comparative data from similar organizations |
| Lessons Learned | Knowledge base | .docx | Lessons from previous SAMP development or AM improvement programs |
| Operating Context | Operations / Engineering | .docx | Environmental conditions, operating profiles, physical context |

---

## Output Specification

### Primary Output: Strategic Asset Management Plan (.docx)

**Filename:** `{OrgCode}_SAMP_v{version}_{date}.docx`

**Structure (40-70 pages):**

1. **Foreword from Senior Leadership** (1 page)
   - CEO/GM statement of commitment to asset management
   - Strategic importance of the asset base to the organization
   - Endorsement of the SAMP and its objectives

2. **Document Control** (1 page)
   - Revision history, approval signatures, distribution list
   - Review and update schedule (minimum annual)

3. **Executive Summary** (3-5 pages)
   - Organization context and strategic direction
   - Asset management objectives summary
   - Key strategies and investment priorities
   - Target outcomes and timeline
   - Critical success factors

4. **Organizational Context** (5-8 pages)
   - 4.1 Organization profile and mission
   - 4.2 External context: regulatory environment, market conditions, stakeholder expectations, technology trends
   - 4.3 Internal context: organizational capabilities, financial capacity, workforce, technology, culture
   - 4.4 Asset portfolio overview: asset types, quantities, age profiles, condition distribution, replacement values
   - 4.5 SWOT analysis for asset management
   - 4.6 Key assumptions and planning horizons

5. **Line-of-Sight: From Organizational Objectives to AM Activities** (5-8 pages)
   - 5.1 Organizational objectives (from corporate strategy)
   - 5.2 Translation into AM objectives with measurable targets
   - 5.3 Line-of-sight mapping diagram
   - 5.4 AM objectives hierarchy: strategic, tactical, operational
   - 5.5 Alignment matrix: how each AM objective supports organizational objectives
   - 5.6 Potential conflicts between objectives and resolution approach

6. **Asset Management Strategy** (8-12 pages)
   - 6.1 Asset lifecycle strategies by asset class:
     - Creation/acquisition strategy (capital investment principles, whole-life cost, design standards)
     - Operations strategy (operating philosophy, capacity management, performance optimization)
     - Maintenance strategy (maintenance approach by criticality, technology deployment, outsourcing)
     - Renewal/replacement strategy (decision criteria, intervention timing, technology upgrade)
     - Decommissioning/disposal strategy (end-of-life criteria, environmental obligations, residual value)
   - 6.2 Risk management strategy:
     - Risk appetite statement (how much risk is acceptable in pursuit of objectives)
     - Risk management framework (identification, assessment, treatment, monitoring)
     - Critical asset risk approach
   - 6.3 Financial strategy:
     - CAPEX/OPEX balance principles
     - Funding mechanisms and constraints
     - Total cost of ownership approach
     - Investment prioritization framework
   - 6.4 Information management strategy:
     - Data standards and quality requirements
     - Information systems architecture
     - Knowledge management approach
   - 6.5 People and organization strategy:
     - Competency requirements and development
     - Organizational design principles
     - Culture development approach

7. **Investment Plan** (5-8 pages)
   - 7.1 Capital investment program (10-30 year horizon):
     - Asset renewal program (condition-based renewal forecasting)
     - Growth investment program (capacity expansion, new capabilities)
     - Technology investment program (digital transformation, automation)
     - Regulatory compliance investment
   - 7.2 Operational expenditure plan:
     - Maintenance expenditure forecast
     - Operations expenditure forecast
     - Support services expenditure
   - 7.3 Total expenditure forecast with scenario analysis:
     - Base case: planned investment levels
     - Constrained case: reduced funding scenario (what deteriorates)
     - Enhanced case: increased investment scenario (what improves)

8. **Performance Framework** (3-5 pages)
   - 8.1 AM KPIs and targets aligned to AM objectives
   - 8.2 Leading indicators (predictive) and lagging indicators (outcome)
   - 8.3 Reporting framework (who sees what, how often)
   - 8.4 Performance review process
   - 8.5 Continuous improvement mechanisms

9. **Governance and Implementation** (3-5 pages)
   - 9.1 AM governance structure (roles, responsibilities, authorities)
   - 9.2 Decision-making framework (delegation of authority, investment approval)
   - 9.3 SAMP implementation plan (milestones, responsibilities)
   - 9.4 AM plans required (list of downstream plans the SAMP directs)
   - 9.5 Review and update cycle (triggers for SAMP revision)
   - 9.6 Communication plan

10. **Appendices**
    - A: Line-of-sight detailed mapping table
    - B: Asset portfolio data summary
    - C: Risk assessment results summary
    - D: Investment plan detailed tables
    - E: KPI definitions and calculation methods
    - F: Glossary of terms
    - G: References and standards

### Secondary Output: SAMP Executive Summary (.pptx)

**Filename:** `{OrgCode}_SAMP_Executive_Summary_v{version}_{date}.pptx`

**Structure (15-20 slides):**
- Organizational context and strategic direction
- Asset portfolio overview with key statistics
- Line-of-sight diagram (organizational objectives -> AM objectives -> AM plans)
- Top 5 AM objectives with measurable targets
- AM strategy pillars (lifecycle, risk, financial, information, people)
- Investment plan summary (10-year CAPEX/OPEX projection)
- Performance framework dashboard
- Governance structure
- Implementation timeline and milestones
- Call to action: leadership endorsement and next steps

### Tertiary Output: ISO 55001 Compliance Mapping (.xlsx)

**Filename:** `{OrgCode}_SAMP_ISO55001_Mapping_v{version}_{date}.xlsx`

Maps each SAMP section to specific ISO 55001 clauses to demonstrate compliance.

---

## Methodology & Standards

### ISO 55001 SAMP Requirements

ISO 55001 Clause 6.2.2 requires that the organization shall establish a SAMP that:
- Is derived from and consistent with the organizational plan
- Is consistent with the AM policy
- Sets out how the AM objectives are to be achieved by the AM system
- Is documented and maintained
- Takes account of the lifecycle of assets
- Provides a framework for AM planning

ISO 55002:2018 provides additional guidance, specifying that the SAMP should:
- Describe how organizational objectives translate into AM objectives
- Describe the approach for developing AM plans
- Define the role of the AM system in supporting organizational objectives
- Include consideration of the current state of the asset portfolio
- Include scenario planning and financial projections
- Define the timeframe and review cycle

### Line-of-Sight Framework

The IAM "Line of Sight" model is the conceptual foundation of the SAMP:

```
Level 1: ORGANIZATIONAL PLAN
  (Vision, Mission, Strategic Objectives, Key Targets)
           |
           | "What does the organization want to achieve?"
           v
Level 2: STRATEGIC ASSET MANAGEMENT PLAN (SAMP)
  (AM Policy, AM Objectives, AM Strategy, Investment Plan)
           |
           | "What must asset management deliver to support Level 1?"
           v
Level 3: ASSET MANAGEMENT PLANS
  (Maintenance Plans, Capital Plans, Operational Plans, Risk Plans)
           |
           | "What specific plans are needed to deliver Level 2?"
           v
Level 4: ASSET MANAGEMENT ACTIVITIES
  (Work Orders, Projects, Inspections, Monitoring, Reviews)
           |
           | "What daily activities implement Level 3?"
           v
Level 5: ASSET PERFORMANCE OUTCOMES
  (Availability, Reliability, Cost, Risk, Compliance, Sustainability)
           |
           | "What results demonstrate Level 1 objectives are being achieved?"
           v
  (Feedback loop to Level 1: Performance informs strategy revision)
```

### SAMP Development Process

```
Phase 1: CONTEXT           Phase 2: OBJECTIVES        Phase 3: STRATEGY         Phase 4: PLAN
(Weeks 1-2)               (Weeks 2-3)                (Weeks 3-5)              (Weeks 5-7)
---------------------     ----------------------      ----------------------    ----------------------
Gather org strategy       Translate org objectives    Develop lifecycle          Build investment plan
Analyze asset portfolio   into AM objectives          strategies per             Develop performance
Map stakeholder needs     Set measurable targets      asset class                framework
Understand constraints    Validate line-of-sight      Develop risk strategy      Define governance
Assess current state      Resolve conflicts           Develop financial          Plan implementation
                          Align stakeholders          strategy                   Obtain approval
```

### Industry Standards and References

| Standard | Application |
|----------|-------------|
| **ISO 55000:2014** | AM overview, principles, and terminology -- conceptual foundation |
| **ISO 55001:2014** | AM system requirements -- mandatory compliance for SAMP |
| **ISO 55002:2018** | AM guidelines -- detailed guidance for SAMP development |
| **IAM Anatomy of Asset Management** | Subject framework and line-of-sight concept |
| **IAM SAMP Guidance Document** | Specific guidance on SAMP content and development |
| **GFMAM Landscape** | 39-subject framework mapping to SAMP content areas |
| **ISO 31000:2018** | Risk management -- framework for AM risk strategy |
| **PAS 55:2008** | Historical reference for AM planning (predecessor to ISO 55001) |
| **IPWEA NAMS** | Infrastructure AM planning guidelines (Australia/NZ model) |
| **UK Roads Liaison Group HMEP** | Lifecycle planning guidance for infrastructure assets |

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| ISO-02: No SAMP | Only 20-25% of organizations have a SAMP | 100% of VSC clients have certified SAMP | Foundational enabler |
| Capital Allocation | 20-40% higher lifecycle costs without lifecycle planning | 15-25% lifecycle cost reduction | Quantified savings |
| RW-01: Low Maturity | Average Level 2/5 maturity | SAMP is the key enabler for Level 3+ | +0.5-1.0 maturity levels |
| Decision Quality | Suboptimal decisions from lack of strategic framework | Risk-weighted, lifecycle-optimized decisions | Measurable improvement |
| ISO Certification | 80-85% fail first attempt | SAMP closes the most common gap | Higher certification success |

---

## Step-by-Step Execution

### Phase 1: Context and Current State Analysis (Steps 1-4)

**Step 1: Capture Organizational Strategic Context**
1. Retrieve the organizational strategic plan from mcp-sharepoint:
   - Vision and mission statements
   - Strategic objectives (typically 5-10 high-level objectives)
   - Key performance targets (financial, operational, safety, environmental, growth)
   - Planning horizon (typically 5-10 years for corporate strategy)
   - Strategic priorities and investment themes
2. If no formal strategic plan exists:
   - Interview senior leadership to establish de facto strategic direction
   - Document key organizational objectives as understood by leadership
   - Flag the absence of a formal plan as a governance improvement item
3. Understand the business model:
   - Revenue drivers and value chain
   - Role of physical assets in value creation
   - Competitive landscape and market dynamics
   - Growth trajectory and capacity requirements

**Step 2: Analyze the Asset Portfolio**
1. Retrieve asset data from mcp-cmms and mcp-erp:
   - Asset register: types, quantities, locations, parent-child relationships
   - Age profiles and remaining useful life estimates
   - Current condition data (from assessments, inspections, monitoring)
   - Replacement values (current replacement cost, not book value)
   - Asset criticality classifications
   - Historical performance data (availability, reliability, costs)
2. Generate asset portfolio analytics:
   - Age distribution by asset class (histogram showing years-in-service)
   - Condition distribution (% in Good/Fair/Poor/Critical condition)
   - Criticality distribution (% A/B/C by asset class)
   - Replacement value distribution by asset class and age cohort
   - Annual maintenance expenditure by asset class and trend
   - Capital renewal needs forecast (based on age and condition)
3. Identify portfolio-level issues:
   - Aging infrastructure peaks (cohorts nearing end-of-life simultaneously)
   - Condition backlog (deferred maintenance/renewal creating risk)
   - Over/under-investment patterns by asset class
   - Technology obsolescence risks

**Step 3: Map Stakeholder Requirements**
1. Identify key stakeholders and their asset management expectations:
   - Shareholders/owners: Return on assets, total cost of ownership, asset value preservation
   - Regulators: Compliance with permits, standards, safety regulations
   - Customers: Service levels, reliability, quality, availability
   - Employees: Safe working conditions, reliable equipment, appropriate tools and training
   - Community: Environmental performance, noise, traffic, visual impact
   - Insurers: Risk management, loss prevention, business continuity
   - Lenders: Debt service coverage, covenant compliance, asset collateral value
2. Document service level expectations:
   - What performance levels do stakeholders expect from the asset base?
   - What are the consequences of underperformance?
   - What trade-offs are stakeholders willing to accept?
3. Identify conflicting stakeholder requirements:
   - Cost reduction vs. reliability improvement
   - Growth investment vs. renewal of existing assets
   - Short-term financial targets vs. long-term sustainability
4. Document risk appetite per stakeholder group

**Step 4: Assess Current AM Capability**
1. If maturity assessment (O-01) has been completed: use those results
2. If not: perform rapid current state assessment:
   - What AM documentation exists (policy, plans, procedures)?
   - What is the current maintenance approach (reactive, preventive, predictive)?
   - What information systems are in place (CMMS, GIS, ERP)?
   - What governance structures exist for AM decisions?
   - What is the organizational AM competency level?
3. Identify the gap between current capability and what the SAMP will require
4. Ensure SAMP recommendations are realistic given current capability

### Phase 2: AM Objectives and Line-of-Sight (Steps 5-7)

**Step 5: Translate Organizational Objectives into AM Objectives**
1. For each organizational objective, determine the AM contribution:
   - Organizational Objective: "Increase copper production to 250,000 tpa by 2030"
   - AM Contribution: "Ensure processing plant availability exceeds 92% and throughput capacity is maintained through targeted renewal of critical assets"
   - AM Objective: "Achieve 92% overall plant availability through optimized maintenance strategy and critical asset renewal program"
2. Apply the SMART criteria to each AM objective:
   - **S**pecific: What exactly will be achieved?
   - **M**easurable: How will success be measured? (KPI and target)
   - **A**chievable: Is this realistic given current capability and resources?
   - **R**elevant: Does this directly support an organizational objective?
   - **T**ime-bound: When will this be achieved?
3. Typical AM objectives categories:
   - Asset performance objectives (availability, reliability, throughput, quality)
   - Cost management objectives (maintenance cost/unit, lifecycle cost optimization)
   - Risk management objectives (risk levels, compliance, incident rates)
   - Sustainability objectives (environmental performance, asset longevity, resilience)
   - Capability objectives (maturity level, competency, technology adoption)
4. Ensure completeness: every organizational objective should have at least one AM objective contributing to it

**Step 6: Build the Line-of-Sight Map**
1. Create the formal line-of-sight document:
   - Level 1: Organizational objectives (from corporate strategy)
   - Level 2: AM objectives (from Step 5)
   - Level 3: AM strategies (what approach will achieve each AM objective)
   - Level 4: AM plans (what specific plans are needed -- maintenance plan, capital plan, etc.)
   - Level 5: Activities and KPIs (what will be done and how success is measured)
2. Document the mapping as both:
   - A visual diagram (cascade from top to bottom)
   - A structured table (traceable links between each level)
3. Validate the line-of-sight:
   - Top-down: Does every organizational objective have AM support?
   - Bottom-up: Does every AM activity trace back to an organizational objective?
   - Horizontal: Are there conflicts between AM objectives? (e.g., cost reduction vs. reliability improvement)
4. Resolve conflicts between objectives using the risk management framework

**Step 7: Validate AM Objectives with Stakeholders**
1. Present the proposed AM objectives to key stakeholders for validation:
   - Executive leadership: alignment with corporate strategy
   - Operations: feasibility and operational impact
   - Finance: affordability and financial targets alignment
   - HSE: safety and environmental adequacy
   - Maintenance: technical achievability
2. Iterate based on feedback:
   - Adjust targets if they are unrealistic or too conservative
   - Add objectives if stakeholder needs are not covered
   - Resolve conflicts through risk-based priority setting
3. Obtain formal endorsement of AM objectives from senior leadership
4. Document the validation process for audit trail

### Phase 3: Strategy Development (Steps 8-11)

**Step 8: Develop Lifecycle Strategies by Asset Class**
1. For each major asset class (based on portfolio analysis):
   - Define the lifecycle strategy:
     - **Creation/Acquisition**: Standards for new assets, whole-life cost requirements, design-for-maintainability, information requirements at handover
     - **Operations**: Operating philosophy, capacity management, performance monitoring
     - **Maintenance**: Maintenance approach (RCM-based strategy for critical assets, time-based for medium, run-to-failure for low), CBM technology deployment plan, outsourcing strategy
     - **Renewal/Replacement**: Intervention triggers (condition-based, age-based, economic), technology upgrade strategy, resilience requirements
     - **Decommissioning/Disposal**: End-of-life criteria, environmental remediation, residual value recovery
2. Document the rationale for each strategy component
3. Identify the AM plans that will implement each strategy component
4. Estimate the resource requirements for each strategy

**Step 9: Develop the Risk Management Strategy**
1. Define the organization's risk appetite for asset management:
   - Safety risk: "We accept no asset-related fatalities or serious injuries"
   - Environmental risk: "We maintain all regulatory compliance and target zero reportable incidents"
   - Financial risk: "We accept maintenance cost variability of +/-10% but not unplanned capital >$5M"
   - Service risk: "We accept plant availability of >90% but not <85% in any month"
2. Establish the risk management framework:
   - Risk identification methodology (FMECA, HAZOP, bow-tie, risk register)
   - Risk assessment criteria (consequence x probability matrix)
   - Risk treatment hierarchy (avoid, reduce, share, accept)
   - Risk monitoring and review process
3. Link risk management to investment prioritization:
   - How risk scores inform capital and operational investment decisions
   - How to balance risk reduction vs. performance improvement investments
   - How to manage portfolio-level risk (not just individual asset risk)

**Step 10: Develop the Financial Strategy and Investment Plan**
1. Develop the total expenditure forecast (10-30 year horizon):
   - Maintenance OPEX: based on maintenance strategies per asset class
   - Operations OPEX: based on operating philosophy and workforce plan
   - Capital renewal: based on condition data, age profiles, and renewal strategies
   - Capital growth: based on demand forecasts and capacity requirements
   - Technology investment: based on digital transformation roadmap
2. Develop scenario analysis (minimum 3 scenarios):
   - **Base case**: Planned investment levels maintaining current asset performance
   - **Constrained case**: 20-30% budget reduction -- what deteriorates?
   - **Enhanced case**: 20-30% additional investment -- what improves?
3. Quantify the consequences of each scenario:
   - Asset condition trajectory over planning horizon
   - Risk profile trajectory
   - Lifecycle cost trajectory
   - Service level trajectory
4. Present investment plan with clear trade-offs for leadership decision

**Step 11: Develop the Performance and Governance Framework**
1. Define the AM KPI framework:
   - Leading indicators: PM compliance, backlog ratio, training completion, data quality
   - Lagging indicators: availability, reliability, maintenance cost, failure rate, incident rate
   - Strategic indicators: maturity score, lifecycle cost, asset condition index, risk score
   - For each KPI: definition, calculation method, data source, frequency, target, responsible
2. Define the governance structure:
   - AM governance body (AM steering committee or equivalent)
   - Roles and responsibilities (per ISO 55001 Clause 5.3)
   - Decision-making authority matrix (who approves what level of investment)
   - Review and reporting cadence
3. Define the SAMP implementation plan:
   - Milestones for each AM plan development
   - Quick wins (first 6 months)
   - Core implementation (6-18 months)
   - Full maturity (18-36 months)
   - Annual review and update cycle
4. Define the SAMP review triggers:
   - Scheduled annual review (minimum)
   - Corporate strategy change
   - Significant regulatory change
   - Major asset event (major failure, acquisition, disposal)
   - Maturity assessment indicates change needed

### Phase 4: Document Compilation and Approval (Steps 12-14)

**Step 12: Compile the SAMP Document**
1. Write the SAMP document per the output specification structure
2. Ensure ISO 55001 compliance:
   - Cross-reference each section to ISO 55001 clauses
   - Verify all mandatory requirements are addressed
   - Generate ISO 55001 compliance mapping worksheet
3. Apply formatting standards:
   - VSC branding (or client branding if specified)
   - Professional formatting with charts, tables, and diagrams
   - Line-of-sight diagram as a centerpiece visual
   - Investment plan charts showing scenario analysis
4. Prepare supporting materials:
   - Executive Summary presentation (.pptx)
   - Detailed data tables (.xlsx)
   - ISO 55001 compliance mapping (.xlsx)

**Step 13: Internal Review and Quality Assurance**
1. Technical review:
   - Are lifecycle strategies technically sound?
   - Are investment projections realistic?
   - Are risk assessments appropriate?
   - Are KPI targets achievable and meaningful?
2. ISO 55001 compliance review:
   - Does the SAMP meet all Clause 6.2 requirements?
   - Can each requirement be evidenced from the SAMP content?
   - Would this SAMP pass a certification audit?
3. Stakeholder review:
   - Circulate draft to key stakeholders for comment
   - Incorporate feedback and resolve comments
   - Document resolution of any disagreements
4. Quality validation via validate-output-quality skill

**Step 14: Approval and Communication**
1. Present SAMP to senior leadership for approval:
   - Use the Executive Summary presentation
   - Focus on: AM objectives, investment plan scenarios, expected outcomes
   - Request formal approval signature
2. Communicate approved SAMP:
   - Distribute to all AM stakeholders via mcp-sharepoint
   - Conduct briefing sessions for management teams
   - Publish AM objectives and KPI targets on dashboards
   - Update AM governance procedures to reference SAMP
3. Initiate downstream AM plan development:
   - Trigger development of specific AM plans per SAMP framework
   - Assign responsibility for each AM plan
   - Set timelines for plan completion
4. Archive SAMP with version control and set annual review reminder

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| ISO 55001 Compliance | Clauses addressed / total applicable clauses | 100% | 100% |
| Line-of-Sight Completeness | Organizational objectives with AM support | 100% | >90% |
| AM Objective Quality | Objectives meeting SMART criteria | 100% | >90% |
| Lifecycle Coverage | Asset classes with lifecycle strategy | 100% of critical/high | 100% of critical |
| Scenario Analysis | Investment scenarios modeled | >=3 scenarios | >=2 scenarios |
| Planning Horizon | SAMP projection period | >=20 years | >=10 years |
| Stakeholder Validation | Key stakeholders who reviewed and endorsed | >80% | >60% |
| Senior Leadership Approval | Formal approval by C-suite or equivalent | Yes | Yes |
| KPI Framework | Objectives with defined KPIs and targets | 100% | >90% |
| Governance Definition | Roles, responsibilities, and authorities defined | Complete | Core roles defined |
| Implementation Plan | Milestones and responsibilities for SAMP execution | Defined with dates | Defined |
| Document Quality | Certification auditor rating | Pass audit | Minor findings only |

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `assess-am-maturity` (O-01) | Upstream | Maturity assessment provides current state baseline and identifies SAMP as a gap |
| `embed-risk-based-decisions` (O-03) | Downstream | SAMP risk strategy directs risk framework implementation |
| `agent-maintenance` | Data Provider | Provides maintenance cost data, strategy inputs, and performance data |
| `agent-operations` | Data Provider | Provides operations performance data and operating philosophy inputs |
| `agent-finance` | Data Provider | Provides financial data, budget constraints, and investment planning support |
| `agent-hse` | Data Provider | Provides risk data, safety performance, and regulatory compliance inputs |
| `agent-hr` | Data Provider | Provides workforce data, competency information, and organizational structure |
| `orchestrate-or-program` (H-01) | Integration | SAMP feeds into OR program as the AM strategic framework |
| `create-or-strategy` | Upstream | OR strategy provides context for SAMP within a capital project |
| `develop-maintenance-strategy` (J-01) | Downstream | Maintenance strategy is an AM plan directed by the SAMP |
| `model-opex-budget` (B-08) | Downstream | OPEX model is informed by SAMP financial strategy |
| `analyze-lifecycle-cost` (B-03) | Tool | Lifecycle cost analysis supports SAMP investment planning |
| `analyze-gap-assessment` (B-05) | Complementary | Gap assessment against ISO 55001 informs SAMP development |
| `validate-output-quality` (F-05) | Quality Gate | SAMP validated before final approval |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Extract asset portfolio data, maintenance performance, and failure history for SAMP development"
capabilities:
  - Query asset register for portfolio analysis (types, ages, values, criticality)
  - Extract maintenance cost data by asset class for financial strategy
  - Retrieve performance KPIs (availability, reliability, PM compliance) for baseline
  - Access failure data for risk and lifecycle strategy development
  - Pull condition assessment data for renewal planning
authentication: API Key + OAuth2
usage_in_skill:
  - Step 2: Asset portfolio analysis and analytics generation
  - Step 8: Maintenance performance data for lifecycle strategy development
  - Step 10: Maintenance cost data for investment plan
  - Step 11: KPI baseline data for target setting
```

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Access financial data, asset values, and investment history for financial strategy"
capabilities:
  - Query asset replacement values and book values
  - Extract capital expenditure history by asset class
  - Retrieve maintenance and operations budget data
  - Access procurement spending for total cost analysis
  - Pull financial KPIs for performance framework
authentication: OAuth2 (SAP / Oracle integration)
usage_in_skill:
  - Step 2: Asset replacement values for portfolio analysis
  - Step 3: Financial targets and constraints from corporate planning
  - Step 10: Financial data for investment plan development
  - Step 10: Historical CAPEX/OPEX data for trend analysis
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Access corporate strategy documents, existing AM documentation, and store SAMP deliverables"
capabilities:
  - Retrieve corporate strategic plan and organizational objectives
  - Access existing AM documentation (policy, plans, procedures)
  - Access audit reports, risk registers, and organizational charts
  - Store SAMP document and supporting materials
  - Manage document approval workflows
  - Distribute SAMP to stakeholders
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve corporate strategic plan
  - Step 4: Access existing AM documentation for current state assessment
  - Step 12: Store SAMP document and supporting materials
  - Step 14: Distribute approved SAMP to stakeholders
```

---

## Templates & References

### Templates
- `templates/samp_document_template.docx` -- Full SAMP document template with VSC/client branding
- `templates/samp_executive_summary.pptx` -- Executive presentation template
- `templates/line_of_sight_template.xlsx` -- Line-of-sight mapping workbook
- `templates/investment_plan_template.xlsx` -- 30-year investment plan with scenario analysis
- `templates/iso_55001_samp_mapping.xlsx` -- ISO 55001 compliance mapping for SAMP
- `templates/am_kpi_framework.xlsx` -- KPI definition and target-setting template

### Reference Documents
- ISO 55000:2014 -- Asset management: Overview, principles, and terminology
- ISO 55001:2014 -- Asset management: Management systems - Requirements
- ISO 55002:2018 -- Asset management: Management systems - Guidelines
- IAM Anatomy of Asset Management (2015) -- Conceptual framework
- IAM "An Introduction to the Development of a SAMP" -- Specific SAMP guidance
- GFMAM Asset Management Landscape (3rd Edition, 2021) -- Subject framework
- IPWEA NAMS -- International Infrastructure Management Manual (lifecycle planning)
- UK Highways England -- SAMP examples for infrastructure AM
- ISO 31000:2018 -- Risk management framework

---

## Examples

### Example 1: Mining Company SAMP Development

```
SAMP ID: SAMP-MDP-2026-001
Organization: Minera del Pacifico S.A.
Industry: Copper Mining
Asset Portfolio: 12,500 assets | $4.8B replacement value | 3 operating sites
Planning Horizon: 30 years (mine life)

Organizational Objectives (from Corporate Strategy):
  1. Produce 250,000 tpa copper cathode by 2030
  2. Achieve first-quartile operating cost (<$1.50/lb C1 cash cost)
  3. Zero fatalities and TRIR <0.50
  4. Full environmental compliance with zero reportable incidents
  5. Return on invested capital >15%

AM Objectives (Line-of-Sight Translation):
  +---------------------------------------------+---------------------------+
  | Org Objective                                | AM Objective              |
  +---------------------------------------------+---------------------------+
  | 1. 250,000 tpa production                   | Plant availability >92%   |
  |                                              | Throughput >95% of design |
  +---------------------------------------------+---------------------------+
  | 2. First-quartile cost                       | Maintenance cost <$2.80/t |
  |                                              | Lifecycle cost optimization|
  +---------------------------------------------+---------------------------+
  | 3. Zero fatalities, TRIR <0.50               | Zero AM-related incidents |
  |                                              | Critical safeguards >99%  |
  +---------------------------------------------+---------------------------+
  | 4. Environmental compliance                  | Zero permit exceedances   |
  |                                              | Containment integrity 100%|
  +---------------------------------------------+---------------------------+
  | 5. ROIC >15%                                 | CAPEX decisions lifecycle |
  |                                              | optimized; NPV positive   |
  +---------------------------------------------+---------------------------+

Investment Plan (30-year):
  Base Case: Total $2.1B (Maintenance OPEX $1.2B + Capital Renewal $650M + Growth $250M)
  Constrained Case: Total $1.7B (-20%) -- availability drops to 88%, cost increases 12%
  Enhanced Case: Total $2.5B (+20%) -- availability improves to 95%, cost decreases 8%

  Recommendation: Base Case with $50M additional for predictive maintenance technology
  Expected ROI of additional investment: 4.2:1 over 10 years

SAMP approved by CEO on 2026-04-15
Downstream AM Plans triggered: 6 plans (Maintenance Strategy, Capital Renewal,
  Operations Improvement, Risk Management, Information Strategy, People & Competency)
```
