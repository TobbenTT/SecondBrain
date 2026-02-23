# Embed Risk-Based Decisions

## Skill ID: O-03
## Version: 1.0.0
## Category: O. Asset Management Intelligence
## Priority: P2 - Medium

---

## Purpose

Embed risk-based decision-making into every layer of asset management, from strategic investment prioritization to daily maintenance scheduling, by establishing risk frameworks, decision trees, consequence models, and risk appetite definitions that enable consistent, transparent, and defensible asset management decisions. This skill transforms organizations from intuition-based to evidence-based decision-making by providing the tools, processes, and governance required to systematically account for risk in all asset-related decisions.

Risk-based decision-making is the cornerstone of ISO 55001 and the fundamental differentiator between mature and immature asset management organizations. Yet Pain Point ISO-04 documents that only 25-30% of organizations consistently use risk-informed approaches for asset management decisions. The remaining 70-75% make asset decisions based on a combination of worst-condition urgency, regulatory mandates, budget availability, personal experience, and organizational politics. The consequences are predictable: over-investment in low-risk assets, under-investment in high-risk assets, inconsistent risk treatment across the organization, and an inability to demonstrate due diligence when failures occur.

ISO 55001 Clause 6.1 requires organizations to "determine the risks and opportunities that need to be addressed" and to "plan actions to address these risks and opportunities." ISO 55001 Clause 8.1 requires "criteria for evaluating and controlling risk" as part of operational planning. These are not aspirational statements -- they are mandatory requirements that organizations must demonstrate to achieve certification and, more importantly, to manage their assets effectively.

The economic case for risk-based decision-making is compelling. Research by EPRI (Electric Power Research Institute) demonstrates that risk-based maintenance optimization typically reduces total maintenance costs by 15-25% while simultaneously improving safety and reliability. The UK Health and Safety Executive's ALARP (As Low As Reasonably Practicable) framework, when properly implemented, has been shown to reduce major accident hazard frequency by 40-60%. In asset management, risk-based capital investment prioritization typically improves the value delivered per dollar invested by 20-35% compared to condition-only or age-only approaches.

---

## Intent & Specification

**Problem:** Organizations struggle to embed risk-based thinking into asset management for several interconnected reasons:

- **No defined risk appetite** (Pain Point ISO-04): Only 25-30% of organizations have a documented risk appetite statement for asset management. Without it, every decision-maker applies their own implicit risk tolerance, creating inconsistent outcomes.
- **Risk assessment paralysis**: Organizations either skip risk assessment entirely (too complicated) or over-engineer it (full bow-tie analysis for every decision), neither approach is sustainable.
- **Disconnection between risk and investment**: Risk registers exist but are not systematically connected to capital and maintenance planning. High-risk items may not receive funding while low-risk items consume budget.
- **Inconsistent risk language**: Different departments use different risk scales, consequence categories, and probability definitions, making cross-functional risk comparison impossible.
- **No decision tree framework**: When maintenance planners, operations managers, and capital planners face decisions, they lack structured decision trees that guide them to appropriate risk-informed choices.
- **Consequence modeling gaps**: Organizations cannot quantify the consequences of asset failures in financial terms, making it impossible to justify risk mitigation investments using business cases.
- **Regulatory compliance risk**: In jurisdictions that require demonstration of risk-based decision-making (e.g., UK HSE ALARP, Chilean SERNAGEOMIN), inability to demonstrate systematic risk management exposes the organization to regulatory enforcement.

**Success Criteria:**
- Documented, leadership-approved risk appetite statement for asset management
- Standardized risk assessment framework deployed across all asset management functions
- Risk-based decision trees for the top 5 asset management decision types
- Consequence models quantifying failure impacts in safety, environmental, financial, and operational terms
- Risk Register connected to investment planning (capital and maintenance budgets)
- 80% of capital investment decisions demonstrably risk-informed (with audit trail)
- 80% of maintenance strategy decisions traced to failure risk analysis
- Risk assessment training completed by all asset management decision-makers
- ISO 55001 Clauses 6.1 and 8.1 fully satisfied

**Constraints:**
- Must integrate with the organization's existing corporate risk management framework (ERM)
- Must be scalable from simple qualitative assessments to full quantitative analysis
- Must be practical for daily use by front-line decision-makers (not just risk specialists)
- Must comply with ISO 31000:2018 risk management principles
- Must support industry-specific regulatory requirements (SERNAGEOMIN, OSHA PSM, UK HSE, etc.)
- Must accommodate different risk analysis methods (qualitative, semi-quantitative, quantitative)
- Must produce outputs in Spanish and English
- Must be implementable within existing organizational maturity constraints

---

## Trigger / Invocation

**Primary Triggers:**
- `embed-risk-based-decisions setup --organization [name] --scope [full|maintenance|capital|operations]`
- `embed-risk-based-decisions risk-appetite --organization [name]`
- `embed-risk-based-decisions framework --organization [name] --method [qualitative|semi-quant|quantitative]`
- `embed-risk-based-decisions decision-tree --decision-type [capital|maintenance|operations|renewal|decommission]`
- `embed-risk-based-decisions consequence-model --asset-class [class] --failure-mode [mode]`
- `embed-risk-based-decisions assess --asset [id] --decision [description]`
- `embed-risk-based-decisions prioritize --portfolio [register] --budget [amount]`
- `embed-risk-based-decisions report --organization [name] --period [monthly|quarterly|annual]`

**Aliases:** `/risk-based`, `/risk-framework`, `/embed-risk`, `/decisiones-basadas-riesgo`

**Automatic Triggers:**
- SAMP development (O-02) requires risk strategy implementation
- Maturity assessment (O-01) identifies risk management as a critical gap
- New OR program requires risk-based investment prioritization
- Capital budget cycle requires risk-ranked project portfolio
- Maintenance strategy development requires risk-based task selection
- Regulatory audit approaching with risk management requirements

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Organizational Risk Framework | mcp-sharepoint / user | .docx | Corporate risk management policy, ERM framework, existing risk matrix (if any) |
| Asset Portfolio Data | mcp-cmms | .xlsx | Asset register with criticality, condition, replacement value, failure history |
| Consequence Data | Operations / Finance / HSE | .xlsx / interviews | Financial impact of failures, safety consequences, environmental consequences, operational impact |
| Decision Context | User | Text / .docx | What decisions need to be risk-informed (capital, maintenance, operations, all) |
| Regulatory Requirements | mcp-sharepoint | .docx | Risk management requirements from applicable regulations |
| Stakeholder Risk Tolerance | Interviews / surveys | .docx | Implicit and explicit stakeholder attitudes toward different risk types |

### Optional Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Failure History | mcp-cmms | .xlsx | Historical failure data (dates, modes, consequences, costs, downtime) |
| Incident Database | mcp-sharepoint | .xlsx | Safety and environmental incident records |
| Insurance Data | Risk/Finance | .xlsx | Insurance premiums, claims history, deductibles, coverage gaps |
| Industry Risk Data | Knowledge base | .xlsx | OREDA, IEEE 493, industry incident databases |
| Existing Risk Registers | mcp-sharepoint | .xlsx | Current risk registers for update and integration |
| HAZOP/PHA Results | mcp-sharepoint | .xlsx | Process hazard analysis results with risk rankings |
| Financial Statements | mcp-erp | .xlsx | Revenue, profit, and balance sheet data for consequence scaling |

---

## Output Specification

### Primary Output 1: Risk-Based Decision Framework Document (.docx)

**Filename:** `{OrgCode}_Risk_Based_Decision_Framework_v{version}_{date}.docx`

**Structure (40-60 pages):**

1. **Executive Summary** (2-3 pages)
   - Purpose and scope of the framework
   - Risk appetite summary
   - Key framework components
   - Implementation roadmap overview

2. **Risk Appetite Statement** (5-8 pages)
   - 2.1 Definition of risk appetite for asset management
   - 2.2 Risk appetite by consequence category:
     - Safety: "We do not accept any risk of fatality or life-altering injury from asset failures that is within our control to prevent or mitigate"
     - Environmental: "We target zero regulatory non-compliance; we accept minor, contained environmental incidents if mitigation cost exceeds $X per incident"
     - Financial: "We accept maintenance cost variability of +/-15% but not single-event losses exceeding $XM without pre-approved contingency"
     - Operational: "We target >90% availability; we accept short-duration outages (<24h) but not extended outages (>72h) for critical systems"
     - Reputation/Regulatory: "We target full compliance with all applicable regulations; zero enforcement actions"
   - 2.3 Risk tolerance thresholds (quantified boundaries)
   - 2.4 Risk appetite governance (who defines, reviews, and updates)

3. **Risk Assessment Framework** (10-15 pages)
   - 3.1 Risk assessment philosophy and principles (ISO 31000 alignment)
   - 3.2 Consequence categories and scales:
     - Safety consequence scale (1-5 with definitions and examples)
     - Environmental consequence scale (1-5 with definitions)
     - Financial consequence scale (1-5 with dollar thresholds)
     - Operational consequence scale (1-5 with duration/impact definitions)
     - Reputation/Regulatory consequence scale (1-5 with definitions)
   - 3.3 Probability/Likelihood scale (1-5 with definitions and frequency ranges)
   - 3.4 Risk matrix (5x5) with color-coded risk levels
   - 3.5 Risk level definitions and required responses:
     - Extreme (20-25): Immediate action required; senior management notification
     - High (15-19): Action required within 30 days; management approval for acceptance
     - Medium (8-14): Action required within 90 days; standard approval process
     - Low (1-7): Monitor; accept with documentation
   - 3.6 Assessment methods by asset criticality:
     - Critical assets: Full quantitative risk assessment (bow-tie, Monte Carlo)
     - High-importance assets: Semi-quantitative assessment (detailed risk matrix)
     - General assets: Qualitative screening (rapid risk rating)
   - 3.7 Risk aggregation approach (how individual asset risks combine to portfolio risk)

4. **Decision Trees** (8-12 pages)
   - 4.1 Capital Investment Decision Tree
   - 4.2 Maintenance Strategy Decision Tree
   - 4.3 Asset Renewal/Replacement Decision Tree
   - 4.4 Operations Risk Decision Tree
   - 4.5 Emergency Response Decision Tree
   Each decision tree provides a structured flow from decision trigger through risk assessment to decision outcome, with clear escalation criteria and documentation requirements.

5. **Consequence Modeling** (5-8 pages)
   - 5.1 Financial consequence models by asset class:
     - Direct repair cost models
     - Production loss models ($/hour of downtime by system)
     - Secondary damage models (cascade failure consequences)
     - Environmental remediation cost models
     - Regulatory penalty models
   - 5.2 Safety consequence models:
     - Exposure analysis (who is at risk and how often)
     - Consequence severity models (energy release, toxic exposure, etc.)
     - Barrier analysis (what prevents escalation)
   - 5.3 Combined consequence scoring methodology

6. **Integration with Asset Management Processes** (5-8 pages)
   - 6.1 Risk in capital investment planning (project prioritization matrix)
   - 6.2 Risk in maintenance strategy (RCM decision logic risk component)
   - 6.3 Risk in operational decisions (start/stop criteria, load management)
   - 6.4 Risk in inspection planning (risk-based inspection intervals)
   - 6.5 Risk in spare parts strategy (criticality-driven stocking policy)
   - 6.6 Risk register management (living risk register process)

7. **Governance and Review** (3-5 pages)
   - 7.1 Roles and responsibilities for risk management
   - 7.2 Risk review cadence (daily, weekly, monthly, quarterly, annual)
   - 7.3 Risk reporting framework
   - 7.4 Risk escalation protocol
   - 7.5 Framework review and update triggers

8. **Appendices**
   - A: Risk matrix with full consequence and probability definitions
   - B: Decision tree flowcharts (A3 printable)
   - C: Consequence model templates and calculation examples
   - D: Risk assessment worksheet templates
   - E: Risk register template
   - F: Training curriculum outline

### Primary Output 2: Risk Assessment Toolkit (.xlsx)

**Filename:** `{OrgCode}_Risk_Assessment_Toolkit_v{version}_{date}.xlsx`

**Sheets:**
- **Risk Matrix**: 5x5 risk matrix with color coding and response requirements
- **Consequence Scales**: All 5 consequence categories with detailed level definitions
- **Probability Scale**: Likelihood definitions with frequency ranges
- **Asset Risk Register**: Template for recording asset risks with all required fields
- **Decision Tree Logic**: Structured decision logic tables for each decision type
- **Consequence Calculator**: Input-driven consequence quantification models
- **Risk Ranking**: Portfolio-level risk ranking with investment priority scoring
- **Investment Prioritization**: Risk-weighted investment ranking model
- **Dashboard Data**: KPI data structure for risk management dashboards

### Primary Output 3: Risk-Based Decision Training Package (.pptx)

**Filename:** `{OrgCode}_Risk_Based_Decision_Training_v{version}_{date}.pptx`

**Structure (30-40 slides):**
- Why risk-based decisions matter (business case with industry examples)
- Risk appetite explained (what the organization has committed to)
- How to use the risk matrix (step-by-step with examples)
- Decision trees walkthrough (practical worked examples)
- Consequence modeling (how to quantify "what could go wrong")
- Common pitfalls (overconfidence, anchoring, availability bias)
- Practical exercises (3-4 case studies for workshop use)
- Quick reference card (laminated pocket guide content)

---

## Methodology & Standards

### Risk Management Framework (ISO 31000 Aligned)

```
Step 1: ESTABLISH CONTEXT
  - Define internal/external context for risk assessment
  - Define risk criteria (appetite, tolerance, scales)
  - Define scope and boundaries of assessment

Step 2: RISK IDENTIFICATION
  - What can happen? (failure modes, events, scenarios)
  - How can it happen? (causes, triggers, mechanisms)
  - What are the consequences? (safety, environmental, financial, operational)
  - What controls exist? (barriers, safeguards, detection systems)

Step 3: RISK ANALYSIS
  - Estimate consequence severity (using consequence models)
  - Estimate probability/likelihood (using failure data or expert judgment)
  - Determine risk level (consequence x probability)
  - Consider effectiveness of existing controls

Step 4: RISK EVALUATION
  - Compare risk level against risk appetite and tolerance thresholds
  - Determine if risk is acceptable, tolerable (ALARP), or intolerable
  - Prioritize risks requiring treatment

Step 5: RISK TREATMENT
  - Select treatment strategy: Avoid, Reduce, Transfer, Accept
  - Design treatment measures (engineering, procedural, administrative)
  - Assess residual risk after treatment
  - Evaluate cost-effectiveness of treatment (cost of treatment vs. risk reduction)

Step 6: MONITOR AND REVIEW
  - Monitor risk indicators and triggers
  - Review effectiveness of treatments
  - Update risk assessments when context changes
  - Report risk status to governance body
```

### ALARP Framework (As Low As Reasonably Practicable)

```
                    INTOLERABLE REGION
                    Risk cannot be justified except in
                    extraordinary circumstances.
                    MANDATORY risk reduction required.
    +-------------------------------------------------+
    |  Risk Level > Upper Tolerance Threshold          |
    |  Actions: MUST reduce risk regardless of cost    |
    +-------------------------------------------------+

                    ALARP REGION (Tolerability Zone)
                    Risk is tolerable only if further
                    reduction is impracticable or cost
                    is grossly disproportionate to benefit.
    +-------------------------------------------------+
    |  Upper Tolerance > Risk > Lower Tolerance        |
    |  Actions: Reduce risk UNLESS cost of reduction   |
    |  is grossly disproportionate to benefit gained   |
    |  Demonstrate: Active risk management in place    |
    +-------------------------------------------------+

                    BROADLY ACCEPTABLE REGION
                    Risk is negligible. No further
                    risk reduction required.
    +-------------------------------------------------+
    |  Risk Level < Lower Tolerance Threshold          |
    |  Actions: Maintain current controls; monitor     |
    +-------------------------------------------------+
```

### Risk-Based Decision Trees

**Capital Investment Decision Tree:**
```
Trigger: Capital investment request / renewal candidate / capacity need
|
+-- Is there a safety or environmental risk driver?
|   +-- YES: Quantify current risk level
|   |   +-- Risk INTOLERABLE? --> MANDATORY investment (escalate if unfunded)
|   |   +-- Risk in ALARP zone? --> Cost-benefit analysis (ALARP test)
|   |   |   +-- Cost of treatment < 10x annual risk reduction value? --> INVEST
|   |   |   +-- Cost > 10x? --> Document ALARP justification; accept with monitoring
|   |   +-- Risk ACCEPTABLE? --> No safety-driven investment needed
|   |
|   +-- NO: Evaluate business case
|       +-- Calculate NPV of investment over asset lifecycle
|       +-- Risk-adjust returns using Monte Carlo or scenario analysis
|       +-- Compare against investment threshold (NPV > 0 at required rate of return)
|       +-- Rank against competing investments by risk-adjusted NPV/$ invested
|       +-- INVEST if above threshold and ranked within budget envelope
|       +-- DEFER if below threshold; document and review annually
```

**Maintenance Strategy Decision Tree:**
```
Trigger: Failure mode identified in FMECA / RCM analysis
|
+-- What is the consequence category?
|   +-- SAFETY or ENVIRONMENTAL consequence
|   |   +-- Is there a proactive task that reduces risk to ALARP?
|   |   |   +-- YES: Implement task (CBM preferred, PM if CBM infeasible)
|   |   |   +-- NO: REDESIGN IS MANDATORY (failure mode must be eliminated)
|   |
|   +-- OPERATIONAL consequence (production/service impact)
|   |   +-- Quantify production loss from failure ($/event x events/year)
|   |   +-- Quantify cost of proactive task ($/year)
|   |   +-- Is proactive task cost-effective? (benefit > cost)
|   |   |   +-- YES: Implement task
|   |   |   +-- NO: Run-to-failure (accept the risk)
|   |
|   +-- NON-OPERATIONAL consequence (repair cost only)
|       +-- Is proactive task cost less than reactive repair cost?
|       |   +-- YES: Implement task
|       |   +-- NO: Run-to-failure
```

### Industry Standards and References

| Standard | Application |
|----------|-------------|
| **ISO 31000:2018** | Risk management principles, framework, and process |
| **ISO 55001:2014** | Clauses 6.1 (risks and opportunities) and 8.1 (operational planning -- risk criteria) |
| **IEC 31010:2019** | Risk assessment techniques catalog (FMECA, FTA, ETA, bow-tie, Monte Carlo, etc.) |
| **ISO 12100** | Safety of machinery -- risk assessment methodology |
| **NORSOK Z-008:2017** | Risk-based maintenance and consequence classification (oil & gas) |
| **API 580/581** | Risk-based inspection methodology for pressure equipment |
| **UK HSE R2P2** | Reducing Risks, Protecting People -- ALARP framework |
| **SAE JA1011/JA1012** | RCM risk-based task selection logic |
| **AS/NZS 4360** | Risk management standard (predecessor to ISO 31000) |
| **SERNAGEOMIN DS 132** | Chilean mining safety regulations -- risk management requirements |
| **OSHA PSM** | Process safety management -- risk assessment requirements |
| **EPRI** | Risk-informed maintenance optimization research |

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| ISO-04: Non-risk-informed decisions | Only 25-30% use risk-informed decisions consistently | >80% of decisions risk-informed | 2.7-3.2x improvement |
| Over/Under-investment | 20-35% improvement possible with risk-based prioritization | 20% improvement in investment efficiency | Quantified savings |
| Maintenance cost | Risk-based optimization saves 15-25% (EPRI) | 15-20% maintenance cost reduction | $1-5M/year typical |
| Repeat failures | 40-60% repeat failures indicate failed learning loops | <20% repeat failure rate | 50-67% reduction |
| Regulatory exposure | Unable to demonstrate due diligence for risk decisions | Full audit trail for all risk decisions | Regulatory protection |
| Safety incidents | Incomplete risk assessment contributes to 30-40% of incidents | Zero incidents from unassessed risks | Systematic prevention |

---

## Step-by-Step Execution

### Phase 1: Foundation -- Risk Appetite & Framework Design (Steps 1-4)

**Step 1: Assess Current Risk Management Practices**
1. Review existing corporate risk management framework (ERM):
   - Does a corporate risk matrix exist? What scale? What consequence categories?
   - Are there documented risk appetite or tolerance statements?
   - How are risks currently reported and governed?
   - What risk assessment tools/methods are currently used?
2. Review current asset management risk practices:
   - How are maintenance priorities set? (risk-based or other?)
   - How are capital investments prioritized? (risk-ranked or budget-driven?)
   - How are operational decisions made? (risk-informed or experience-based?)
   - What risk registers exist for asset management?
3. Identify gaps between current practice and ISO 55001 requirements:
   - Clause 6.1: Risks and opportunities identified and addressed?
   - Clause 8.1: Criteria for evaluating and controlling risk established?
4. Document the current state as the baseline for improvement

**Step 2: Define Risk Appetite for Asset Management**
1. Facilitate risk appetite workshop with senior leadership:
   - Present the concept of risk appetite with industry examples
   - Discuss each consequence category individually:
     - Safety: What level of safety risk is acceptable? (reference ALARP framework)
     - Environmental: What environmental risk is tolerable?
     - Financial: What single-event financial loss can the organization absorb?
     - Operational: What level of service disruption is acceptable?
     - Reputation/Regulatory: What compliance risk is tolerable?
   - For each category, establish:
     - Upper tolerance boundary (above which risk is intolerable regardless of cost)
     - Lower tolerance boundary (below which risk is broadly acceptable)
     - ALARP zone (where risk must be reduced unless cost is grossly disproportionate)
2. Quantify risk appetite thresholds:
   - Safety: "No individual risk of fatality >1 in 10,000 per year; no societal risk >10 fatalities in any scenario"
   - Financial: "Maximum tolerable single-event loss: $10M; maximum annual aggregate loss: $25M"
   - Operational: "Maximum tolerable unplanned outage: 72 hours for critical systems; 168 hours for non-critical"
3. Document the risk appetite statement formally
4. Obtain CEO/GM signature on the risk appetite statement
5. Communicate risk appetite to all asset management decision-makers

**Step 3: Design the Risk Assessment Framework**
1. Define consequence scales (5 levels, quantified):
   - Align with or adapt the corporate risk matrix if one exists
   - Ensure consequence scales are calibrated to the organization's context:
     - A mining company with $1B revenue has different financial thresholds than a water utility with $100M revenue
     - A company in a high-regulation environment may weight regulatory consequences higher
   - Provide specific, unambiguous definitions for each level (no room for interpretation)
   - Include examples for each level from the organization's industry
2. Define probability/likelihood scale (5 levels, quantified):
   - Level 1: Rare (<1 in 100 years)
   - Level 2: Unlikely (1 in 10-100 years)
   - Level 3: Possible (1 in 1-10 years)
   - Level 4: Likely (1-10 per year)
   - Level 5: Almost Certain (>10 per year)
3. Build the 5x5 risk matrix:
   - Map consequence x probability to risk levels (Extreme, High, Medium, Low)
   - Define required response for each risk level
   - Define approval authority for risk acceptance at each level
4. Design the risk assessment process:
   - Level 1 (Screening): Qualitative 5-minute assessment for low-value routine decisions
   - Level 2 (Standard): Semi-quantitative assessment using the risk matrix for medium decisions
   - Level 3 (Detailed): Full quantitative analysis (bow-tie, Monte Carlo) for high-value/high-risk decisions
5. Document the complete framework

**Step 4: Build Consequence Models**
1. Develop financial consequence models for each major asset class:
   - **Direct repair cost model**: Typical repair cost by failure mode and severity
   - **Production loss model**: Revenue loss per hour of downtime by system (from production data)
   - **Secondary damage model**: Probability and cost of cascade failures
   - **Environmental cost model**: Remediation costs by type and scale of release
   - **Regulatory penalty model**: Fine structures by violation type and jurisdiction
2. Develop safety consequence models:
   - Identify personnel exposure patterns (who is near which assets, how often)
   - Map potential injury/fatality scenarios by asset class and failure mode
   - Quantify safety consequence using established frameworks (API, HSE)
3. Validate models against historical data:
   - Compare model predictions to actual failure consequences from history
   - Calibrate where predictions differ significantly from actuals
4. Package models into the Risk Assessment Toolkit spreadsheet

### Phase 2: Decision Tree Development (Steps 5-7)

**Step 5: Develop Capital Investment Decision Tree**
1. Map the capital investment decision process:
   - Who identifies capital needs?
   - What information is gathered?
   - How are investments evaluated?
   - Who approves at each investment level?
   - How are investments prioritized against budget?
2. Embed risk assessment at each decision point:
   - Trigger: Is this investment driven by risk (safety/environmental/regulatory) or value (performance/cost)?
   - Risk-driven: Apply ALARP test -- is current risk intolerable?
   - Value-driven: Apply risk-adjusted NPV -- does investment create value after adjusting for risk?
   - Ranking: Score all investments on risk-weighted value criteria
3. Create the decision tree flowchart with clear branching logic
4. Define documentation requirements at each decision point
5. Validate with capital planning stakeholders

**Step 6: Develop Maintenance Strategy Decision Tree**
1. Integrate with RCM decision logic (SAE JA1011):
   - RCM already uses a risk-based approach but may not use quantified risk
   - Enhance with quantified consequence data from consequence models
   - Ensure risk appetite thresholds are respected in task selection
2. Add risk-based scheduling optimization:
   - For PM tasks: Is the interval risk-optimized? (too frequent = wasted cost; too infrequent = excessive risk)
   - For CBM tasks: Are alert/alarm thresholds calibrated to risk appetite?
   - For inspections: Is the inspection interval risk-based per API 580/581?
3. Create maintenance decision tree connecting:
   - Failure mode identification -> consequence assessment -> task selection -> interval optimization
4. Define documentation requirements for audit trail

**Step 7: Develop Operations and Renewal Decision Trees**
1. **Operations Decision Tree:**
   - Start/stop criteria based on equipment condition and risk level
   - Load management decisions based on risk of overloading
   - Degraded-mode operation criteria (what risk level triggers shutdown?)
   - Emergency response decision criteria
2. **Renewal/Replacement Decision Tree:**
   - When to repair vs. replace (risk-weighted lifecycle cost comparison)
   - When to refurbish vs. replace with new technology
   - End-of-life criteria (condition-based, risk-based, economic)
   - Technology upgrade trigger criteria
3. Create flowcharts for each decision tree
4. Include worked examples for each

### Phase 3: Integration & Implementation (Steps 8-12)

**Step 8: Build the Risk Register**
1. Design the risk register structure:
   - Risk ID, description, asset/system, consequence category, probability, consequence, risk level
   - Existing controls, control effectiveness
   - Residual risk after controls
   - Treatment plan (if risk not in acceptable zone)
   - Treatment owner, timeline, status
   - Review date
2. Populate initial risk register:
   - Critical assets: full risk assessment using the framework
   - High-importance assets: screening assessment
   - General assets: aggregate risk assessment by asset class
3. Connect risk register to investment planning:
   - Each risk treatment with cost >$X becomes a candidate for capital or maintenance budget
   - Risk-ranked treatment list feeds into annual budget planning
4. Store in mcp-sharepoint with version control; make accessible via mcp-excel

**Step 9: Develop Risk-Weighted Investment Prioritization Model**
1. Design the prioritization scoring model:
   - Risk reduction score: How much does this investment reduce risk? (delta risk score)
   - Value creation score: What NPV does this investment generate?
   - Urgency score: What happens if deferred? (risk of escalation)
   - Strategic alignment score: How well does this support SAMP objectives?
   - Implementation readiness score: How ready is the organization to execute?
2. Weight the scoring criteria (example):
   - Risk reduction: 30%
   - Value creation: 25%
   - Urgency: 20%
   - Strategic alignment: 15%
   - Implementation readiness: 10%
3. Apply the model to the current capital program:
   - Score all capital candidates
   - Rank by weighted score
   - Apply budget constraint to determine funded vs. deferred projects
   - Identify the "efficient frontier" (maximum risk reduction per dollar invested)
4. Package as an Excel-based tool for annual budget cycle use

**Step 10: Integrate Risk Framework with CMMS and Planning Systems**
1. Configure CMMS risk fields:
   - Add risk ranking fields to equipment master data
   - Link work order priority to asset risk level
   - Enable risk-based sorting of maintenance backlog
2. Configure planning system integration:
   - Risk scores visible in capital planning tools
   - Investment prioritization model linked to budget approval workflow
3. Establish risk-based maintenance scheduling rules:
   - High-risk equipment: PM compliance target 100%; no deferral without risk assessment
   - Medium-risk equipment: PM compliance target 95%; deferral with documented justification
   - Low-risk equipment: PM compliance target 90%; deferral acceptable with monitoring

**Step 11: Develop Training Program**
1. Create the Risk-Based Decision Training Package:
   - Module 1: Why risk-based decisions (2 hours) -- business case, industry examples, regulatory
   - Module 2: Risk assessment fundamentals (3 hours) -- framework, scales, matrix, assessment
   - Module 3: Decision trees (2 hours) -- capital, maintenance, operations, renewal
   - Module 4: Consequence modeling (2 hours) -- how to quantify consequences
   - Module 5: Practical exercises (3 hours) -- case studies from the organization's asset base
2. Identify training audience:
   - Senior management: Module 1 + risk appetite overview (4 hours)
   - Asset management professionals: All modules (12 hours)
   - Front-line supervisors: Modules 1-3 (7 hours)
   - Operators/maintainers: Module 1 + quick reference guide (3 hours)
3. Create quick reference materials:
   - Laminated pocket risk matrix card
   - Decision tree quick reference poster (A3)
   - Risk assessment worksheet (fill-in form)
4. Deliver training and track completion via mcp-lms

**Step 12: Establish Governance and Continuous Improvement**
1. Define risk review cadence:
   - Daily: Front-line risk awareness (toolbox talks, pre-task risk assessment)
   - Weekly: Maintenance planning risk review (backlog prioritization)
   - Monthly: Asset management risk review (risk register update, KPI review)
   - Quarterly: Management risk review (portfolio risk profile, investment plan alignment)
   - Annually: Risk appetite review and framework effectiveness assessment
2. Define risk reporting framework:
   - Monthly risk dashboard (top risks, trends, treatment status)
   - Quarterly management report (portfolio risk profile, investment effectiveness)
   - Annual board report (risk appetite compliance, major risk trends, strategic risks)
3. Establish improvement feedback loops:
   - After every significant failure: Was the risk assessed? Was the assessment accurate?
   - Annual framework review: Are consequence models calibrated? Are probability estimates accurate?
   - Industry benchmark: How does our risk management compare to peers?
4. Document the governance framework and obtain leadership endorsement

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Risk Appetite Definition | Documented and leadership-approved | Yes, with CEO signature | Yes, with management sign-off |
| Consequence Scale Quality | Scales quantified with no ambiguity | All 5 categories fully quantified | Safety + Financial quantified |
| Framework Completeness | ISO 31000 process steps covered | 100% | >90% |
| Decision Trees | Number of decision types covered | >=5 types | >=3 types |
| Consequence Models | Asset classes with quantified models | All critical + high | All critical |
| Risk Register Population | Critical assets with completed risk assessment | 100% | >90% |
| Investment Integration | Capital decisions demonstrably risk-informed | >80% | >60% |
| Training Completion | Decision-makers trained on framework | >90% | >70% |
| ISO 55001 Compliance | Clauses 6.1 and 8.1 fully addressed | 100% | 100% |
| Stakeholder Endorsement | Key stakeholders endorse the framework | >80% | >60% |
| Decision Audit Trail | Risk decisions with documented rationale | 100% | >90% |
| Framework Review | Annual review completed on schedule | 100% | Yes |

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `assess-am-maturity` (O-01) | Upstream | Maturity assessment identifies risk management gaps that trigger this skill |
| `develop-samp` (O-02) | Upstream | SAMP risk strategy provides the strategic direction for this framework |
| `agent-maintenance` | Consumer | Maintenance uses risk framework for strategy development and PM optimization |
| `agent-operations` | Consumer | Operations uses risk framework for start/stop criteria and operational decisions |
| `agent-hse` | Consumer/Input | HSE provides safety risk data and uses framework for safety risk management |
| `agent-finance` | Consumer/Input | Finance uses risk framework for investment prioritization; provides financial data |
| `agent-procurement` | Consumer | Procurement uses risk framework for supplier risk and spare parts criticality |
| `create-risk-assessment` (A-13) | Downstream | Operational risk assessments use this framework as the methodology standard |
| `develop-maintenance-strategy` (J-01) | Downstream | Maintenance strategy uses risk framework for RCM task selection |
| `analyze-equipment-criticality` (B-01) | Downstream | Criticality analysis uses this framework's consequence and probability scales |
| `orchestrate-or-program` (H-01) | Integration | OR program uses risk framework for program risk management |
| `resolve-cross-functional-conflicts` (N-02) | Integration | Risk framework informs conflict resolution for risk-related disagreements |
| `validate-output-quality` (F-05) | Quality Gate | Framework deliverables validated before deployment |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Access asset data and failure history for risk assessment; configure risk fields"
capabilities:
  - Query asset register for criticality and condition data
  - Extract failure history for probability estimation
  - Access maintenance cost data for financial consequence modeling
  - Configure risk ranking fields in equipment master data
  - Link work order priority to asset risk level
authentication: API Key + OAuth2
usage_in_skill:
  - Step 1: Assess current risk management practices in CMMS
  - Step 4: Build consequence models using failure cost data
  - Step 8: Populate risk register with asset data
  - Step 10: Configure CMMS risk fields and scheduling rules
```

### mcp-excel
```yaml
name: "mcp-excel"
server: "@anthropic/excel-mcp"
purpose: "Build risk assessment toolkit, consequence models, and prioritization tools"
capabilities:
  - Create structured risk matrix spreadsheets
  - Build consequence calculation models with formulas
  - Develop investment prioritization scoring models
  - Generate risk register templates with data validation
  - Create dashboard-ready data outputs
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Build risk matrix and scales in toolkit spreadsheet
  - Step 4: Build consequence models as calculation tools
  - Step 9: Build investment prioritization scoring model
  - Step 8: Create and maintain risk register
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Store framework documents, risk registers, and training materials"
capabilities:
  - Retrieve existing corporate risk management documentation
  - Store Risk-Based Decision Framework document
  - Manage risk register as SharePoint List with version control
  - Store training materials and quick reference guides
  - Manage document approval workflows for risk appetite statement
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve existing ERM framework and risk documentation
  - Step 3: Store risk framework document and toolkit
  - Step 8: Store and manage risk register
  - Step 12: Store governance and review documentation
```

---

## Templates & References

### Templates
- `templates/risk_appetite_statement.docx` -- Risk appetite document template
- `templates/risk_assessment_framework.docx` -- Full framework document template
- `templates/risk_matrix_5x5.xlsx` -- Standard 5x5 risk matrix with scales
- `templates/risk_register.xlsx` -- Risk register template with all required fields
- `templates/consequence_models.xlsx` -- Consequence calculation templates
- `templates/investment_prioritization.xlsx` -- Risk-weighted investment scoring model
- `templates/decision_tree_templates.pptx` -- Decision tree flowchart templates
- `templates/risk_training_package.pptx` -- Training presentation template
- `templates/risk_pocket_card.pdf` -- Laminated pocket risk matrix card

### Reference Documents
- ISO 31000:2018 -- Risk management: Guidelines
- IEC 31010:2019 -- Risk management: Risk assessment techniques
- ISO 55001:2014 -- Asset management: Management systems (Clauses 6.1, 8.1)
- UK HSE R2P2 -- Reducing Risks, Protecting People (ALARP framework)
- NORSOK Z-008:2017 -- Risk-based maintenance and consequence classification
- API 580/581 -- Risk-based inspection
- SAE JA1011/JA1012 -- RCM standards (risk-based task selection)
- EPRI -- Risk-informed maintenance optimization research
- AS/NZS ISO 31000 -- Risk management implementation guidance

---

## Examples

### Example 1: Risk Appetite Definition for a Mining Company

```
RISK APPETITE STATEMENT - Minera del Pacifico S.A.
Approved: CEO, 2026-03-15

SAFETY:
  Intolerable: Individual fatality risk >1 in 10,000 per year from asset failures
  ALARP Upper: Individual serious injury risk >1 in 1,000 per year
  ALARP Lower: Individual minor injury risk >1 in 100 per year
  Broadly Acceptable: Risk below ALARP lower boundary
  Note: All safety risks must be reduced to ALARP. Cost is NOT a justification
  for accepting intolerable safety risk.

ENVIRONMENTAL:
  Intolerable: Release causing permanent environmental damage or regulatory prosecution
  ALARP Upper: Release requiring external remediation or regulatory notification
  ALARP Lower: Contained release with no external impact
  Note: We target zero regulatory non-compliance events from asset failures.

FINANCIAL (single event):
  Intolerable: Loss >$25M from a single asset failure event
  High: Loss $5M-$25M (Board notification required; insurance claim)
  Medium: Loss $500K-$5M (Management approval for risk acceptance)
  Low: Loss <$500K (Standard operational management)

OPERATIONAL:
  Intolerable: Unplanned shutdown >30 days for any critical system
  High: Unplanned shutdown 7-30 days
  Medium: Unplanned shutdown 24-168 hours
  Low: Unplanned shutdown <24 hours

Application: All capital and maintenance decisions with potential consequences exceeding
"Low" threshold MUST include documented risk assessment using the approved framework.
```

### Example 2: Risk-Based Capital Investment Prioritization

```
CAPITAL PROGRAM RISK RANKING - FY2027
Budget Available: $45M
Candidates: 28 projects totaling $82M requested

Risk-Weighted Scoring (top 10):
+------+--------------------------------+--------+------+------+------+------+------+-------+
| Rank | Project                        | Cost   | Risk | Value|Urgcy | Strat| Ready| TOTAL |
|      |                                | ($M)   | (30%)|(25%) |(20%) |(15%) |(10%) |       |
+------+--------------------------------+--------+------+------+------+------+------+-------+
|  1   | SAG Mill drive replacement     | $8.2M  | 4.8  | 4.5  | 5.0  | 4.0  | 5.0  | 4.68  |
|  2   | Tailings dam sensor upgrade    | $3.1M  | 5.0  | 3.5  | 4.5  | 4.5  | 4.0  | 4.40  |
|  3   | Crusher liner change facility  | $5.5M  | 3.5  | 4.8  | 4.0  | 4.0  | 4.5  | 4.11  |
|  4   | Power substation renewal       | $12.0M | 4.5  | 3.5  | 3.5  | 4.5  | 3.5  | 3.95  |
|  5   | Flotation cell mechanism       | $4.8M  | 3.0  | 4.5  | 4.0  | 4.0  | 4.5  | 3.90  |
|  6   | CBM technology deployment      | $2.2M  | 2.5  | 4.0  | 3.0  | 5.0  | 5.0  | 3.65  |
|  7   | Conveyor structural upgrade    | $6.5M  | 4.0  | 3.0  | 3.5  | 3.0  | 3.5  | 3.50  |
|  8   | CMMS upgrade                   | $1.5M  | 2.0  | 3.5  | 2.5  | 5.0  | 5.0  | 3.30  |
|  9   | Workshop expansion             | $4.0M  | 1.5  | 3.5  | 2.0  | 3.5  | 4.0  | 2.70  |
| 10   | Admin building renovation      | $2.8M  | 1.0  | 2.0  | 1.5  | 2.0  | 5.0  | 1.95  |
+------+--------------------------------+--------+------+------+------+------+------+-------+

Recommended Portfolio ($45M budget):
  Fund: Projects 1-7 ($42.3M) -- highest risk-weighted value
  Defer: Projects 8-10 and remaining 18 -- insufficient risk-weighted value
  Reserve: $2.7M for in-year emergent risk items

Key Insight: Without risk weighting, Project 4 ($12M power substation) would consume
26% of budget. Risk-weighted analysis confirms it should proceed but also highlights
Project 2 (tailings dam sensors at $3.1M) as the highest risk-reduction-per-dollar
investment in the portfolio.
```
