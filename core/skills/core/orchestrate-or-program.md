# Orchestrate OR Program

## Skill ID: H-01
## Version: 1.0.0
## Category: H. Orchestration
## Priority: P0 - Critical

## Purpose

Orchestrate the complete Operational Readiness (OR) program for a capital project, from initial scope capture through steady-state declaration. This is the highest-level orchestration skill in the OR System -- it owns the end-to-end lifecycle of making a capital project operationally ready. It maps the OR Work Breakdown Structure (WBS) against the project master schedule, deploys specialized agents to each OR domain, monitors progress across 5 OR domains simultaneously, generates gate review packages, and coordinates the CAPEX-to-OPEX transition that determines whether billions of dollars in capital investment translate into productive operations or become stranded assets.

This skill exists because Operational Readiness is systematically underinvested, under-governed, and started too late in the vast majority of capital projects worldwide. The consequences are catastrophic: McKinsey reports that 80% of megaprojects exceed their budgets (Pain Point M-02), Deloitte finds 60%+ OR deficiencies at handover (Pain Point D-01), EY documents 65% of infrastructure projects failing to meet objectives (Pain Point E-01), and Oil & Gas industry data shows 12-24 month delays in the CAPEX-to-OPEX transition (Pain Point OG-01). Mining Technology reports new mine ramp-ups taking 2-3 years instead of the planned 12-18 months (Pain Point MT-01), destroying project NPV and stakeholder confidence.

The OR Orchestration Agent, powered by this skill, serves as the "Director of the Orchestra" -- ensuring that every instrument (agent) plays its part at the right time, in the right key, and in harmony with the ensemble. Without orchestration, OR programs devolve into siloed workstreams that produce fragmented, inconsistent, and incomplete deliverables. With orchestration, the program operates as an integrated system where interdependencies are managed, early warnings are generated, and gate reviews provide evidence-based go/no-go decisions.

## VSC Failure Modes Table — Cross-Agent Validation Rule

**Validation Rule:** The orchestrator MUST ensure that ALL agents producing or consuming failure mode data use the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). During gate reviews and deliverable validation, verify that failure modes across all domains (maintenance FMECA, operations SOPs, HSE risk assessments, procurement spare parts justifications, RAM models) follow the standard structure: **[WHAT] → [Mechanism] due to [Cause]** (18 mechanisms, 46 causes, 72 combinations). Non-conforming deliverables must be returned for correction before acceptance.

## Intent & Specification

**Problem:** Capital projects invest 60-80% of their budget in engineering, procurement, and construction (EPC), but the operational success of the asset depends critically on the remaining 20-40% -- the Operational Readiness program. Despite this, OR is treated as an afterthought (Pain Point A-04: "rush to ready"), started too late (Pain Point MP-02: late definition of operational requirements), and governed weakly (Pain Point E-03: capital project governance weakness). The result is a predictable cascade of failures:

- **80% of megaprojects exceed budget** (McKinsey Global Institute, 2023) -- driven largely by rework, delays, and change orders that proper OR planning would prevent. The average cost overrun is 30% for mining projects and up to 80% for oil & gas megaprojects.
- **60%+ OR deficiencies at handover** (Deloitte, 2022) -- operations teams inherit assets without adequate procedures, trained staff, spare parts, or management systems. These gaps take 12-24 months to close post-handover, during which the asset underperforms.
- **65% of infrastructure projects fail to meet objectives** (EY, 2023) -- not because the asset was built incorrectly, but because the organization was not ready to operate it effectively.
- **12-24 month delays in CAPEX-to-OPEX transition** (Oil & Gas Journal) -- the gap between mechanical completion and commercial operation stretches far beyond plan, consuming contingency budgets and eroding project economics.
- **New mine ramp-ups take 2-3 years** (Mining Technology) -- instead of the planned 12-18 months, with year-1 production typically reaching only 50-70% of design capacity versus the >80% target.
- **Knowledge loss during handover** (McKinsey, Pain Point M-07) -- engineering decisions, design rationale, and lessons learned are lost in the transition, forcing operations teams to "rediscover" knowledge at great cost.
- **$31.5 billion annual loss from knowledge management failures** (HBR, Pain Point H-03) -- across industries, the failure to capture and transfer knowledge compounds every other OR deficiency.

**Success Criteria:**
- OR program initiated no later than FEED phase (12-18 months before commissioning)
- OR WBS generated with 500+ deliverables mapped to project milestones
- All 5 OR domains have assigned specialist agents with clear deliverables
- Weekly progress monitoring with automatic deviation detection (>5% variance triggers alert)
- Gate Review packages generated automatically at each project phase gate
- OR readiness at handover exceeds 90% (vs. industry average of 60%)
- Production ramp-up achieves >80% design capacity in Year 1 (vs. industry average 50-70%)
- Cost overrun attributable to OR deficiencies reduced to <5% (vs. industry average 30-80%)
- Zero safety incidents attributable to OR gaps during commissioning and ramp-up
- Complete audit trail of all OR decisions, deliverables, and status changes

**Constraints:**
- Must operate in delegate mode -- orchestrates specialist agents, does not perform domain-specific work
- Must integrate with the project master schedule (MS Project / Primavera P6)
- Must support multiple simultaneous projects with independent tracking
- Must handle scope changes without losing historical data
- Must produce deliverables compatible with client document management systems (typically SharePoint)
- Must support bilingual operation (English/Spanish) for Latin American projects
- Must comply with client-specific governance frameworks while enforcing VSC OR standards
- Must generate auditable records sufficient for regulatory and financial review
- Must scale from mid-size projects (500 deliverables) to megaprojects (5,000+ deliverables)

## Trigger / Invocation

**Primary Triggers:**
- `orchestrate-or-program start --project [name] --schedule [file] --scope [full|partial]`
- `orchestrate-or-program status --project [name]`
- `orchestrate-or-program update --project [name] --domain [domain]`
- `orchestrate-or-program gate-prep --project [name] --gate [G1|G2|G3|G4|G5|G6]`
- `orchestrate-or-program escalate --project [name] --issue [description]`
- `orchestrate-or-program rampup-forecast --project [name]`
- `orchestrate-or-program close --project [name]`

**Aliases:** `/or-program`, `/orchestrate-program`, `/or-master`

**Automatic Triggers:**
- New capital project registered in the VSC OR System
- Project phase gate approaching (T-30 days, T-14 days, T-7 days)
- Weekly status update cycle (every Monday 07:00 local time)
- Schedule deviation >5% detected via mcp-project-online
- Agent reports blocker or critical risk
- Deliverable completion triggers dependency cascade check
- Quarterly portfolio review preparation

**Event-Driven Triggers:**
- Client requests OR status briefing
- Project scope change approved (triggers WBS re-baseline)
- EPC schedule change notification (triggers OR schedule re-alignment)
- Regulatory deadline change (triggers compliance timeline update)
- Budget revision (triggers OR cost re-forecast)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Project Master Schedule | mcp-project-online / MS Project export | Yes | Level 3+ project schedule with milestones for FEED, Detailed Engineering, Construction, Commissioning, and Commercial Operation |
| Project Charter / Scope of Work | mcp-sharepoint | Yes | Project scope definition, key parameters, design basis |
| OR Checklist Template | VSC standard or client-specific | Yes | Master checklist of OR deliverables by domain (VSC standard: 500+ items) |
| Stakeholder Matrix | mcp-sharepoint / client input | Yes | Key stakeholders, roles, communication preferences, decision authority |
| Engineering Deliverable List | mcp-sharepoint | Yes | List of engineering documents that feed OR planning (P&IDs, equipment lists, design basis) |
| Design Capacity Parameters | Client / engineering docs | Yes | Nameplate capacity, design throughput, product specifications |
| Budget Envelope | Client / agent-finance | Yes | Approved OR budget or budget allowance range |
| Client Governance Framework | Client input | No | Client-specific gate definitions, approval processes, reporting requirements |
| Lessons Learned Database | Knowledge base | No | Relevant lessons from previous similar projects |
| Regulatory Requirements Summary | Agent-legal / agent-HSE | No | Applicable permits, licenses, regulatory milestones |
| Organizational Baseline | Agent-HR | No | Existing organization structure if brownfield; greenfield staffing requirements |

**Project Configuration Schema:**
```yaml
project:
  name: "Project Name"
  code: "PRJ-001"
  client: "Client Name"
  type: "greenfield|brownfield|expansion"
  industry: "mining|oil_gas|chemical|power|infrastructure"
  location:
    country: "Chile"
    region: "Antofagasta"
    site: "Site Name"
    altitude_masl: 3800
    climate: "desert_high_altitude"

  design_parameters:
    capacity: "120,000 tpd ore processing"
    product: "Copper cathode, 99.99% Cu"
    design_life: "30 years"
    capex_estimate: "$4.5B"

  timeline:
    feed_start: "2025-01-01"
    feed_end: "2025-09-30"
    detailed_eng_start: "2025-07-01"
    construction_start: "2026-01-01"
    or_program_start: "2025-04-01"
    commissioning_start: "2027-07-01"
    commercial_operation: "2028-01-01"
    steady_state_target: "2029-01-01"

  or_scope:
    domains:
      operations: { priority: "critical", agent: "agent-operations", scope: "Operating model, SOPs, ramp-up, workforce, training, competency, org design, culture, HRIS" }
      asset_management: { priority: "critical", agent: "agent-asset-management", scope: "Maintenance strategy, RCM/FMECA, PM optimization, spare parts, SAP PM/MM, work management, turnaround" }
      hse: { priority: "critical", agent: "agent-hse", scope: "Process safety, HAZOP, PSM, PTW, emergency response, environmental, safety & environmental permits" }
      contracts_compliance: { priority: "high", agent: "agent-contracts-compliance", scope: "O&M contracts, RFPs, vendor evaluation, legal compliance, T&C review, regulatory permits" }
      execution: { priority: "critical", agent: "agent-execution", scope: "Project management, project controls, EVM, finance/OPEX, construction surveillance, commissioning, PSSR" }

  gates:
    - gate: "G1"
      name: "OR Strategy Approved"
      phase: "FEED"
      target_date: "2025-06-30"
    - gate: "G2"
      name: "OR Plans Complete"
      phase: "Detailed Engineering"
      target_date: "2025-12-31"
    - gate: "G3"
      name: "OR Execution On Track"
      phase: "Construction"
      target_date: "2026-06-30"
    - gate: "G4"
      name: "Ready for Commissioning"
      phase: "Pre-Commissioning"
      target_date: "2027-06-01"
    - gate: "G5"
      name: "Ready for Operations"
      phase: "Commissioning"
      target_date: "2027-12-01"
    - gate: "G6"
      name: "Steady State Declared"
      phase: "Ramp-Up"
      target_date: "2029-01-01"

  reporting:
    weekly_status: true
    monthly_executive: true
    gate_reviews: true
    dashboard_refresh: "weekly"
    distribution_list:
      executive: ["Project Director", "VP Operations", "CFO"]
      management: ["OR Manager", "Dept Managers", "EPC PM"]
      operational: ["Workstream Leads", "OR Team"]
```

## Output Specification

**Primary Outputs:**

### 1. OR Master Plan (Document)
**Filename:** `{ProjectCode}_OR_Master_Plan_v{version}_{date}.docx`
**Structure (50-80 pages):**
- Executive Summary with program-level dashboard
- OR Strategy Summary (from Gate G1)
- OR WBS (5 domains x 40-60 deliverables each = 500+ items)
- Integrated Timeline mapped against project schedule
- Resource Plan (month-by-month FTE requirements)
- Budget Summary (by domain, by phase, by quarter)
- Governance Framework (gates, approval authorities, escalation matrix)
- Interdependency Register (cross-domain dependencies)
- Risk Register (program-level risks with scoring)
- Communication Plan
- Appendices (WBS detail, RACI, templates)

### 2. OR Dashboard (Power BI / Excel)
**Filename:** `{ProjectCode}_OR_Dashboard_{date}.pbix`
**Dashboard Pages:**
- **Executive Summary:** Overall readiness %, RAG by domain, key metrics, decisions needed
- **Domain Detail:** One page per domain with deliverable completion %, trend, key issues
- **Schedule View:** OR milestones against project schedule, critical path, deviations
- **Resource View:** FTE loading by domain and month, utilization, gaps
- **Risk View:** Risk heat map, top 10 risks, risk trend over time
- **Financial View:** Budget vs. actual by domain, forecast at completion, variances
- **Ramp-Up Forecast:** Predicted production trajectory based on readiness status

### 3. OR Risk Register (Airtable / SharePoint List)
**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Risk ID | Auto-number | Unique identifier |
| Domain | Selection | OR domain affected |
| Risk Description | Text | Clear description of the risk |
| Category | Selection | Technical, Schedule, Cost, Safety, Regulatory, Resource |
| Probability | 1-5 scale | Likelihood of occurrence |
| Impact | 1-5 scale | Consequence if materialized |
| Risk Score | Calculated | Probability x Impact |
| Risk Level | Calculated | Low (1-6), Medium (8-12), High (15-20), Critical (25) |
| Mitigation Strategy | Text | Planned risk response |
| Mitigation Owner | Person | Responsible for mitigation |
| Mitigation Status | Selection | Not Started, In Progress, Implemented, Ineffective |
| Residual Risk Score | Calculated | After mitigation |
| Related Deliverables | Link | Deliverables affected by this risk |
| Date Identified | Date | When risk was first identified |
| Last Review Date | Date | Most recent risk review |
| Status | Selection | Open, Monitoring, Closed, Materialized |

### 4. Weekly Status Reports (Email + SharePoint)
**Filename:** `{ProjectCode}_OR_Weekly_{Week}_{date}.md`
**Structure:**
- Traffic light dashboard (1 page)
- Progress summary by domain (completeness %, change from last week)
- Key accomplishments this week
- Key issues and blockers
- Actions and decisions required
- Look-ahead (next 2 weeks)
- Resource and budget summary

### 5. Gate Review Packages (Document + Presentation)
**Filename:** `{ProjectCode}_Gate_{GateNumber}_Review_{date}.pptx`
**Structure (15-25 slides):**
- Gate readiness summary
- Deliverable completion matrix by domain
- Quantitative risk assessment
- Go/No-Go recommendation with evidence
- Conditions for conditional pass
- Action items for next phase
- Financial summary
- Appendices with supporting data

## Methodology & Standards

### OR Program Lifecycle Framework

The OR program follows a six-gate lifecycle aligned with the project execution phases:

```
FEED Phase          | Detailed Engineering | Construction        | Pre-Commissioning  | Commissioning      | Ramp-Up
--------------------+---------------------+---------------------+--------------------+--------------------+------------------
Gate G1             | Gate G2              | Gate G3              | Gate G4            | Gate G5            | Gate G6
OR Strategy         | OR Plans             | OR Execution         | Ready for          | Ready for          | Steady State
Approved            | Complete             | On Track             | Commissioning      | Operations         | Declared
                    |                      |                      |                    |                    |
Key Activities:     | Key Activities:      | Key Activities:      | Key Activities:    | Key Activities:    | Key Activities:
- Scope definition  | - Detailed plans     | - Execute plans      | - Staff on site    | - Commissioning    | - Production
- Strategy doc      |   per domain         | - Procurement        | - Training done    |   support          |   ramp-up
- Budget estimate   | - Integrated         | - Recruitment        | - Systems ready    | - Handover         | - Optimization
- Stakeholder map   |   timeline           | - Training build     | - Spares on site   |   execution        | - Performance
- Risk assessment   | - Refined budget     | - System config      | - SOPs complete    | - Punch-list       |   guarantee
- Agent deployment  | - Dependency map     | - SOP development    | - PSSR ready       |   closure          | - Steady-state
                    | - Resource plan      | - Vendor coord       |                    |                    |   criteria met
```

### Core Principles

1. **Early Start, Integrated Planning:** OR must start during FEED, not during construction. Every month of delay in OR start correlates with 2-3 months of ramp-up delay (IPA benchmarking data). The OR Master Plan is integrated with the project master schedule from day one.

2. **Domain Coverage with No Gaps:** The OR program covers 5 consolidated management domains. Each domain has a specialist agent with defined deliverables. The orchestrator ensures complete coverage -- no domain is "someone else's problem."

3. **Dependency-Driven Sequencing:** OR deliverables have complex interdependencies across domains. The orchestrator maps these dependencies, sequences work correctly, and ensures that upstream deliverables are available before downstream work begins. Example: HR cannot recruit until Operations defines the operating model and headcount requirements.

4. **Evidence-Based Gate Reviews:** Gate decisions are based on quantitative evidence, not subjective opinion. Each gate has defined criteria (deliverable completion %, risk levels, budget variance) and the orchestrator generates the evidence package automatically.

5. **Continuous Risk Monitoring:** The Risk Register is a living document. New risks are identified as the program progresses, existing risks are re-assessed weekly, and risk trends inform escalation decisions. The orchestrator correlates risks across domains to identify systemic issues.

6. **Proactive Escalation:** The orchestrator does not wait for problems to become crises. Deviations >5% from plan trigger alerts. Deviations >10% trigger escalation. Deviations >20% trigger executive notification. The goal is to fix problems while they are still fixable.

### Industry Standards Applied

- **ISO 55001** - Asset Management Systems: Lifecycle perspective, value realization, risk-based decision making
- **IPA (Independent Project Analysis)** - Benchmarking data for project execution and OR performance
- **CII (Construction Industry Institute)** - Research on project delivery, startup, and OR best practices
- **AACE International** - Cost engineering, schedule management, earned value management
- **PMI PMBOK** - Project management fundamentals, integration management, stakeholder management
- **ISO 31000** - Risk management principles and framework
- **SMRP Best Practices** - Maintenance and reliability standards
- **OSHA PSM / EPA RMP** - Process safety management for hazardous operations
- **SERNAGEOMIN (Chile)** - Mining regulatory requirements for operational readiness

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| M-02: Cost Overruns | 80% of megaprojects over budget; avg 30-80% overrun | <15% overrun | 50-65% improvement |
| D-01: OR Deficiencies | 60%+ gaps at handover | <10% gaps | 83% improvement |
| E-01: Project Failure | 65% fail to meet objectives | <20% miss objectives | 69% improvement |
| OG-01: CAPEX-OPEX Delays | 12-24 month transition delay | <6 months | 50-75% improvement |
| MT-01: Ramp-Up Delays | 2-3 years to design capacity | <18 months | 40-50% improvement |
| A-04: OR as Afterthought | OR starts during construction | OR starts at FEED | 12-18 months earlier |
| MP-02: Late OR Definition | Operational requirements defined post-FEED | During FEED | Eliminates gap |
| H-03: Knowledge Loss | $31.5B annual loss from knowledge failures | Structured capture from Day 1 | Systematic prevention |
| W-02: Critical Minerals Rush | Compressed schedules for lithium/copper | Parallel OR execution | Schedule compression support |

## Step-by-Step Execution

### Phase 1: Program Initialization (Steps 1-4)

**Step 1: Capture Project Context**
1. Read project charter, scope of work, and design basis from mcp-sharepoint
2. Import project master schedule from mcp-project-online (MS Project / Primavera P6)
3. Extract key milestones: FEED completion, detailed engineering, construction phases, mechanical completion, commissioning start, commercial operation date
4. Identify project-specific factors: greenfield vs. brownfield, industry sector, location challenges (altitude, climate, remoteness), workforce availability, regulatory environment
5. Load lessons learned from similar completed projects via knowledge base
6. Validate that minimum inputs are available; flag gaps for client follow-up

**Step 2: Generate OR Work Breakdown Structure (WBS)**
1. Load VSC standard OR checklist template (500+ items across 5 domains)
2. Customize WBS for project specifics:
   - Remove non-applicable items (e.g., no marine operations for inland mining)
   - Add project-specific items (e.g., altitude considerations, brine processing specifics)
   - Adjust complexity levels per domain based on project type
3. For each WBS item, define:
   - Deliverable description and acceptance criteria
   - Responsible domain/agent
   - Required inputs and dependencies
   - Estimated effort (person-hours)
   - Target start and completion dates (back-calculated from gate dates)
4. Generate dependency matrix across all WBS items
5. Identify critical path through OR program
6. Publish WBS to mcp-airtable as the OR Deliverable Register
7. Store WBS document in mcp-sharepoint

**Step 3: Map OR WBS Against Project Schedule**
1. For each OR deliverable, identify:
   - Engineering inputs required (and their scheduled delivery dates)
   - Construction prerequisites (what must be built before this OR activity)
   - Commissioning dependencies (what must be ready for commissioning start)
2. Back-calculate OR activity start dates from gate target dates
3. Identify schedule conflicts:
   - OR activities that cannot start because engineering inputs are not yet scheduled
   - OR activities that compete for the same resources
   - OR activities with lead times exceeding available schedule float
4. Generate integrated OR-Project timeline
5. Flag items requiring schedule acceleration or additional resources
6. Update mcp-project-online with OR activities integrated into master schedule

**Step 4: Deploy Specialist Agents (5 Agents)**
1. For each of the 5 consolidated OR domains, assign the specialist agent:
   - Verify agent availability and capability
   - Load agent configuration with project-specific parameters
   - Assign initial deliverable sets from the WBS
2. Send project kickoff briefing to each agent via Inbox:
   - Project context and key parameters
   - Agent's assigned deliverables with timelines
   - Key dependencies (upstream inputs needed, downstream outputs expected)
   - Reporting requirements and escalation protocols
   - Gate milestones that affect their domain
3. Create Shared Task List with all initial tasks
4. Initialize inter-agent communication channels
5. Schedule initial coordination meeting (via mcp-teams)
6. Activate monitoring workflows

### Phase 2: Program Execution (Steps 5-8)

**Step 5: Monitor Progress Weekly**
1. Poll mcp-airtable for deliverable status updates from all agents
2. Calculate completion percentages by domain:
   - Weight by deliverable criticality (critical items count more)
   - Track trend (improving, stable, declining)
3. Compare actual progress against planned progress:
   - Calculate Schedule Performance Index (SPI) per domain
   - Calculate Cost Performance Index (CPI) per domain
4. Generate RAG status per domain:
   - GREEN: SPI >= 0.95 and CPI >= 0.95
   - AMBER: SPI 0.80-0.94 or CPI 0.80-0.94
   - RED: SPI < 0.80 or CPI < 0.80
5. Identify deviations and trigger appropriate responses:
   - Deviation 5-10%: Alert to domain lead via mcp-outlook
   - Deviation 10-20%: Escalation to OR Manager via mcp-teams
   - Deviation >20%: Executive notification via mcp-outlook
6. Update OR Dashboard in mcp-powerbi
7. Generate and distribute Weekly Status Report

**Step 6: Manage Interdependencies**
1. Monitor dependency chains daily:
   - When an upstream deliverable completes, notify downstream agents
   - When an upstream deliverable is delayed, assess impact on downstream activities
   - When a new dependency is identified, add to the dependency register
2. Resolve cross-domain conflicts:
   - Resource conflicts (two domains need the same SME)
   - Schedule conflicts (two activities cannot run in parallel)
   - Scope conflicts (different domains have conflicting requirements)
3. Coordinate joint deliverables:
   - Identify deliverables requiring input from multiple agents
   - Sequence the contributions correctly
   - Synthesize multi-agent inputs into coherent deliverables
4. Manage external dependencies:
   - EPC deliverables that feed OR planning
   - Vendor information required for maintenance strategy
   - Regulatory approvals that gate OR activities
   - Client decisions pending

**Step 7: Risk Management (Continuous)**
1. Update Risk Register weekly:
   - New risks identified by any agent are logged
   - Existing risks are re-scored based on current status
   - Mitigation effectiveness is assessed
   - Risk trends are analyzed (improving, stable, worsening)
2. Conduct monthly risk reviews:
   - Top 10 risks reviewed with domain leads
   - Systemic risk patterns identified across domains
   - Risk appetite validation with project leadership
3. Integrate risk data with schedule and cost forecasts:
   - Quantify schedule impact of top risks (probabilistic analysis)
   - Quantify cost impact of risk materialization
   - Update contingency requirements
4. Report risk status in weekly reports and gate review packages

**Step 8: Coordinate Gate Reviews**
1. T-30 days before gate: Pre-gate assessment
   - Query all agents for deliverable status
   - Identify at-risk deliverables
   - Issue corrective action requests for behind-schedule items
   - Schedule pre-gate coordination meeting
2. T-14 days: Gate readiness check
   - Comprehensive status review per domain
   - All deliverables due at this gate should be >80% complete
   - Items below threshold require recovery plans
   - Draft gate review package
3. T-7 days: Gate package preparation
   - Invoke `generate-or-gate-review` skill to produce formal package
   - Collect final deliverable submissions from agents
   - Synthesize multi-agent contributions
   - Generate go/no-go recommendation with evidence
4. Gate day: Support gate review execution
   - Distribute package to review committee via mcp-outlook
   - Schedule meeting via mcp-teams
   - Record decisions and action items
5. Post-gate: Implement gate decisions
   - Update task list with new actions from gate review
   - Adjust plans based on gate conditions
   - Communicate results to all agents
   - Re-baseline schedule if required

### Phase 3: Transition & Close-Out (Steps 9-11)

**Step 9: Coordinate CAPEX-to-OPEX Transition**
1. Pre-commissioning readiness verification:
   - All critical SOPs approved and trained
   - Operations team hired, trained, and on-site
   - Maintenance systems configured (CMMS, spare parts, PM schedules)
   - HSE systems active (permits, emergency response, PTW)
   - Supply chain established
   - Management systems operational
2. Handover coordination:
   - Manage handover sequence by system/area
   - Track punch-list closure
   - Verify warranty documentation
   - Confirm vendor support agreements activated
3. Commissioning support orchestration:
   - Coordinate operations team participation in commissioning
   - Manage PSSR (Pre-Startup Safety Review) completion
   - Track commissioning milestones and OR readiness correlation

**Step 10: Oversee Production Ramp-Up**
1. Invoke `model-rampup-trajectory` skill to generate ramp-up forecast
2. Monitor actual production against forecast:
   - Daily production tracking
   - Equipment availability tracking
   - Quality compliance tracking
   - Safety performance tracking
3. Coordinate ramp-up support:
   - Vendor specialist utilization
   - Additional training as needed
   - Process optimization support
   - Troubleshooting coordination
4. Manage support tapering:
   - Track demobilization criteria for each support resource
   - Approve demobilization based on criteria achievement
   - Extend support where criteria not met

**Step 11: Steady-State Declaration and Program Close**
1. Monitor steady-state criteria achievement:
   - Throughput: >90% of design capacity for 30 consecutive days
   - Quality: Product meets specification in >95% of production
   - Availability: Overall equipment availability >85%
   - Cost: Operating cost per unit within 10% of budget
   - Safety: TRIR below target
   - Environment: All compliance parameters met
   - Staffing: All positions filled, competency verified
   - Systems: All management systems fully operational
2. When criteria met: Initiate steady-state declaration process
3. Conduct lessons learned capture:
   - What worked well in the OR program
   - What should be improved
   - Key metrics achieved vs. plan
   - Recommendations for future projects
4. Archive OR program documentation
5. Transition from OR governance to operations governance
6. Close out OR budget and produce final financial report
7. Generate OR Program Close-Out Report

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| WBS Coverage | OR domains with complete WBS | 100% (5/5 domains) | 100% |
| WBS Granularity | Average deliverables per domain | 40-60 items | >30 items |
| Schedule Integration | OR milestones linked to project schedule | 100% | >95% |
| Agent Deployment | Specialist agents assigned and active | 100% | 100% |
| Progress Monitoring | Weekly status reports delivered on time | 100% | >95% |
| Deviation Detection | Schedule deviations >5% detected automatically | 100% | >95% |
| Gate Package Delivery | Gate review packages delivered T-7 | 100% | 100% |
| Risk Register Currency | Risk register updated within last 7 days | 100% | >90% |
| Stakeholder Satisfaction | Stakeholders rate OR visibility adequate | >4/5 | >3.5/5 |
| Handover Readiness | OR readiness at handover | >90% | >85% |
| Ramp-Up Performance | Year-1 production vs. design capacity | >80% | >70% |
| Budget Adherence | OR program within approved budget | Within 10% | Within 15% |
| Dependency Resolution | Cross-domain blockers resolved within SLA | >90% within 48h | >80% within 72h |
| Escalation Timeliness | Issues escalated per escalation matrix | 100% | 100% |

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `agent-operations` | Managed Agent | Operating model, SOPs, ramp-up, workforce planning, training, competency, culture, HRIS |
| `agent-asset-management` | Managed Agent | Maintenance strategy, RCM/FMECA, PM optimization, spare parts, SAP PM/MM, work management, turnaround |
| `agent-hse` | Managed Agent | Process safety, risk assessments, emergency response, HSE training, environmental & safety permits |
| `agent-contracts-compliance` | Managed Agent | O&M contracts, procurement, legal compliance, T&C review, regulatory permits |
| `agent-execution` | Managed Agent | Project management, project controls, EVM, finance/OPEX, construction surveillance, commissioning, PSSR |
| `track-or-deliverables` | Subordinate Skill | Provides granular deliverable tracking data (Skill H-02) |
| `generate-or-gate-review` | Subordinate Skill | Generates gate review packages on demand (Skill H-03) |
| `model-rampup-trajectory` | Subordinate Skill | Models production ramp-up based on readiness (Skill H-04) |
| `generate-or-report` | Downstream Skill | Uses orchestrator data for multi-level reporting |
| `create-or-plan` | Downstream Skill | OR Plan 360 uses WBS and dependency data |
| `create-or-strategy` | Upstream Skill | OR Strategy provides strategic framework for the program |
| `sync-airtable-jira` | Integration | Task list synced with Jira for human visibility |
| `validate-output-quality` | Quality Gate | All program deliverables pass quality validation |

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Central document repository for all OR program documentation"
capabilities:
  - Read project engineering documents (P&IDs, equipment lists, design basis)
  - Create and update OR Master Plan, status reports, gate review packages
  - Manage OR Deliverable Register as SharePoint List
  - Store gate review packages and archive completed deliverables
  - Manage document approval workflows
  - Search across all project documentation for cross-references
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Read project charter, scope of work, engineering docs
  - Step 2: Store OR WBS document
  - Step 5: Store weekly status reports
  - Step 8: Publish gate review packages
  - Step 11: Archive program documentation
```

### mcp-project-online
```yaml
name: "mcp-project-online"
server: "@vsc/project-schedule-mcp"
purpose: "Integration with MS Project / Primavera P6 for schedule management"
capabilities:
  - Read project master schedule (Level 3+)
  - Map OR milestones against project construction and commissioning milestones
  - Detect schedule deviations automatically
  - Update OR activity progress in master schedule
  - Calculate critical path through OR program
  - Generate schedule variance reports
authentication: API Key + OAuth2
usage_in_skill:
  - Step 1: Import project master schedule
  - Step 3: Map OR WBS against project schedule, identify conflicts
  - Step 5: Detect schedule deviations, calculate SPI
  - Step 8: Verify gate timing against schedule
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Automated communication with stakeholders"
capabilities:
  - Send weekly OR status reports by email
  - Send escalation alerts when deliverables are at risk
  - Send gate review invitations and pre-read distribution
  - Distribute action items from meetings and gate reviews
  - Send milestone achievement notifications
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 4: Send project kickoff briefings to agent teams
  - Step 5: Send deviation alerts and escalation emails
  - Step 7: Distribute weekly status reports
  - Step 8: Distribute gate review packages and invitations
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Real-time coordination with project team"
capabilities:
  - Publish updates in OR program channel
  - Respond to stakeholder queries about status
  - Coordinate inter-agent communication via dedicated channels
  - Schedule and support gate review meetings
  - Generate meeting summaries
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 4: Schedule kickoff and coordination meetings
  - Step 5: Publish escalation notifications in real-time
  - Step 6: Coordinate cross-domain conflict resolution
  - Step 8: Schedule and support gate review meetings
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Executive dashboards and OR program analytics"
capabilities:
  - Update Power BI datasets with OR metrics (readiness %, SPI, CPI, risks)
  - Generate trend visualizations over time
  - Publish dashboards for stakeholder self-service access
  - Refresh dashboard data on weekly cycle
  - Create drill-down views from program level to domain to deliverable
authentication: Service Principal
usage_in_skill:
  - Step 5: Update OR Dashboard with weekly metrics
  - Step 7: Publish risk trends and heat maps
  - Step 10: Update ramp-up performance tracking
```

### mcp-airtable
```yaml
name: "mcp-airtable"
server: "@anthropic/airtable-mcp"
purpose: "Flexible database for OR deliverable and risk tracking"
capabilities:
  - Maintain OR Deliverable Register (500+ items)
  - Manage Risk Register with automated scoring
  - Track Action Items from meetings and gate reviews
  - Generate filtered views by domain, gate, status, priority
  - Support dependency linking between deliverables
  - Provide API access for dashboard integrations
authentication: API Key
usage_in_skill:
  - Step 2: Create OR Deliverable Register from WBS
  - Step 5: Query and update deliverable status
  - Step 7: Maintain and update Risk Register
  - Step 8: Generate gate readiness data
```

## Templates & References

### OR WBS Template (Top-Level Structure)
```
OR WBS - {Project Name}
========================

1.0 OPERATIONS READINESS
  1.1 Operating Model Development
  1.2 Operating Philosophy Document
  1.3 Shift Structure and Crew Composition
  1.4 SOP Register and Development
  1.5 Operating Procedures (per system)
  1.6 Commissioning Participation Plan
  1.7 Ramp-Up Plan
  1.8 Operations KPI Framework

2.0 MAINTENANCE READINESS
  2.1 Asset Register Development
  2.2 Equipment Criticality Analysis
  2.3 Maintenance Strategy (RCM/FMECA)
  2.4 PM Program Development
  2.5 Spare Parts Strategy
  2.6 CMMS Configuration
  2.7 Maintenance KPI Framework
  2.8 Shutdown Planning

3.0 HSE & PROCESS SAFETY
  3.1 Process Safety Management Plan
  3.2 HAZOP Action Closure
  3.3 Emergency Response Plan
  3.4 Permit-to-Work System
  3.5 HSE Training Plan
  3.6 Risk Assessment Completion
  3.7 Environmental Compliance

4.0 PEOPLE & ORGANIZATION
  4.1 Organization Design
  4.2 Staffing Plan
  4.3 Recruitment Campaign
  4.4 Training & Competency Program
  4.5 Workforce Transition Plan (brownfield)
  4.6 HR Policies and Procedures
  4.7 Industrial Relations

5.0 FINANCIAL PLANNING
  5.1 OPEX Model Development
  5.2 O&M Budget
  5.3 Business Cases for Key Investments
  5.4 Financial Systems Setup
  5.5 Cost Reporting Framework

6.0 LEGAL & REGULATORY
  6.1 Regulatory Compliance Plan
  6.2 Operating Permits Acquisition
  6.3 Environmental Permits
  6.4 Contract Review and Execution
  6.5 Insurance Program

7.0 PROCUREMENT & CONTRACTS
  7.1 O&M Contract Strategy
  7.2 Spare Parts Procurement
  7.3 Consumables Supply Chain
  7.4 Vendor Management Setup
  7.5 Warehouse Setup

8.0 PROJECT INTEGRATION
  8.1 OR-EPC Interface Management
  8.2 Schedule Integration
  8.3 Commissioning Integration
  8.4 Handover Protocol
  8.5 Punch-List Management

9.0 COMMUNICATIONS & CHANGE
  9.1 Stakeholder Communication Plan
  9.2 Change Management Plan
  9.3 Community Relations Plan
  9.4 Internal Communications

10.0 DOCUMENT CONTROL
  10.1 Document Management System Setup
  10.2 Document Numbering and Taxonomy
  10.3 Vendor Document Management
  10.4 Technical Library Setup
  10.5 Turnover Package Management

11.0 COMMISSIONING READINESS
  11.1 Commissioning Execution Plan
  11.2 Commissioning Procedures
  11.3 PSSR Requirements
  11.4 Performance Testing Plan

12.0 ASSET MANAGEMENT
  12.1 Asset Management Policy
  12.2 Asset Data Standards
  12.3 Asset Information System Integration
  12.4 Lifecycle Cost Models
```

### Escalation Matrix Template
```
| Level | Trigger | Notified | Response Time | Authority |
|-------|---------|----------|---------------|-----------|
| L1: Watch | Deviation 5-10% | Domain Lead | 48 hours | Domain Lead corrective action |
| L2: Alert | Deviation 10-15% | OR Manager | 24 hours | OR Manager resource reallocation |
| L3: Escalation | Deviation 15-20% | Project Director | 12 hours | Project Director intervention |
| L4: Crisis | Deviation >20% | VP Operations | 4 hours | Executive intervention, potential re-baseline |
| Safety | Any safety concern | HSE Manager + Project Director | Immediate | Stop work authority |
```

### Weekly Status Report Template
```markdown
# OR Weekly Status Report
## {Project Name} | Week {W} | {Date Range}
## Generated: {Timestamp}

### Overall Status: {RAG} | Readiness: {X}%

### Dashboard
| Domain | Status | Readiness | Trend | Key Issue |
|--------|--------|-----------|-------|-----------|
| Operations & Workforce | {RAG} | {X}% | {trend} | {issue} |
| Asset Management | {RAG} | {X}% | {trend} | {issue} |
| HSE & Permits | {RAG} | {X}% | {trend} | {issue} |
| Contracts & Compliance | {RAG} | {X}% | {trend} | {issue} |
| Execution (Project+Finance+Commissioning) | {RAG} | {X}% | {trend} | {issue} |

### Key Accomplishments This Week
1. {accomplishment 1}
2. {accomplishment 2}
3. {accomplishment 3}

### Key Issues & Blockers
| # | Issue | Domain | Impact | Owner | Target Date |
|---|-------|--------|--------|-------|-------------|
| 1 | {issue} | {domain} | {impact} | {owner} | {date} |

### Decisions Required
1. {decision needed} -- Requested from: {who} -- Deadline: {date}

### Next Gate: {Gate} | {Date} | {Days Until}
Readiness: {X}% complete | {Y} of {Z} deliverables on track

### Resource Summary
- FTE on OR: {X} | Planned: {Y} | Variance: {+/-Z}
- Budget Spend: ${X}M / ${Y}M ({Z}%)

### Look-Ahead (Next 2 Weeks)
1. {activity 1}
2. {activity 2}
3. {activity 3}
```

## Examples

### Example 1: Full Program Initialization for a Copper Mine Expansion

```
Command: orchestrate-or-program start --project "Sierra Verde Copper Expansion" --schedule "SV-PRJ-SCH-001.mpp" --scope full

Process:
  Phase 1: Context Capture
    - Project: $3.2B copper mine expansion, 120,000 tpd, Antofagasta, Chile
    - Timeline: FEED completed, Detailed Engineering in progress, COD target: Jan 2028
    - OR Start: April 2025 (aligned with detailed engineering start)
    - Key challenges: 3,800 masl altitude, 2-hour drive to nearest city, limited skilled labor pool

  Phase 2: WBS Generation
    - Loaded VSC standard template: 500 base items
    - Customizations: +35 altitude-specific items, +20 community relations items, -15 marine items
    - Final WBS: 540 deliverables across 12 domains
    - Criticality weighting applied: 45% critical, 35% high, 20% medium

  Phase 3: Schedule Integration
    - 540 OR deliverables mapped to project schedule
    - 185 dependencies identified across domains
    - Critical path: HR staffing -> Training -> Commissioning participation
    - Schedule conflicts identified: 3 (resolved by resource reallocation)
    - 8 items flagged for long lead time (>12 months)

  Phase 4: Agent Deployment
    - 5 specialist agents activated
    - 85 initial tasks released (no pending dependencies)
    - 455 tasks queued with dependency links
    - Kickoff briefings sent to all agents
    - First weekly status report scheduled: Monday April 7, 2025

Output:
  "Sierra Verde Copper Expansion OR Program initiated.
   540 deliverables registered across 12 domains.
   185 cross-domain dependencies mapped.
   5 specialist agents deployed with initial assignments.
   85 tasks released for immediate execution.
   Gate G2 target: December 2025 (8 months).
   Critical path identified: HR staffing chain (18-month lead time).
   8 long-lead items flagged for immediate action.
   OR Dashboard: https://app.powerbi.com/sv-or-dashboard
   Weekly reports: Every Monday to distribution list (22 stakeholders)."
```

### Example 2: Mid-Program Crisis Response

```
Trigger: agent-maintenance reports critical spare parts have 24-month lead time vs. 18-month assumption

Process:
  1. Receive alert from agent-maintenance: "Critical crusher spare parts (mantle, concaves) from Metso
     have confirmed 24-month lead time. Current schedule assumes 18 months. At current plan date,
     spares will arrive 6 months after commissioning start."

  2. Impact assessment:
     - Affected domains: Maintenance, Procurement, Project, Finance, Operations
     - Schedule impact: Commissioning at risk without spares; 6-month gap
     - Cost impact: Expediting possible at $1.2M premium; standard cost: $3.8M
     - Risk: Operating without spare set = extended downtime if failure occurs during ramp-up

  3. Options analysis (coordinated across agents):
     - Option A: Expedite at $1.2M premium (reduce lead to 15 months)
     - Option B: Source alternative supplier (12-month lead, 10% cost premium, compatibility TBD)
     - Option C: Modify commissioning sequence to start other areas first
     - Option D: Accept risk of operating without spare set for 6 months

  4. Agent coordination:
     - agent-procurement: Contacted 3 alternative suppliers, 2 can deliver in 12-15 months
     - agent-finance: $1.2M expediting within project contingency; $1.8M if alternative supplier
     - agent-project: Commissioning sequence can be modified to delay crusher by 4 weeks max
     - agent-operations: Operating without spare set rated HIGH risk (3-month downtime if failure)

  5. Recommendation generated:
     - Recommended: Option A (Expedite with Metso) combined with Option C (modify sequence)
     - Combined approach reduces gap from 6 months to 3 months
     - Residual risk mitigated by pre-positioning vendor emergency response agreement
     - Cost: $1.2M + $150K emergency response agreement = $1.35M
     - Decision authority: Project Director (>$1M)

  6. Escalation report generated and distributed via mcp-outlook
     OR Dashboard updated with risk status via mcp-powerbi

Output:
  Escalation Report: "SV-ESC-017 - Critical Spare Parts Lead Time"
  Recommendation: Approve $1.35M expediting + emergency response agreement
  Decision deadline: Within 5 business days to maintain revised schedule
  Updated risk register: 2 new risks added, 1 existing risk elevated to CRITICAL
```

### Example 3: Gate G4 Preparation (Ready for Commissioning)

```
Trigger: T-30 days before Gate G4 (Ready for Commissioning)

Process:
  1. Pre-Gate Assessment (T-30):
     - Queried all 5 domain agents for Gate G4 deliverable status
     - Results: 425 of 540 deliverables complete (78.7%)
     - Critical deliverables for G4: 85 items, 72 complete (84.7%)
     - 13 critical items outstanding:
       * 4 SOPs pending HSE review (agent-operations)
       * 3 training modules not yet delivered (agent-hr)
       * 2 CMMS configuration items incomplete (agent-maintenance)
       * 2 permits pending regulatory approval (agent-legal)
       * 1 spare parts shipment in transit (agent-procurement)
       * 1 emergency response drill not yet conducted (agent-hse)

  2. Recovery Actions Issued (T-30 to T-14):
     - agent-operations: Accelerate SOP review (HSE agent co-assigned)
     - agent-hr: Prioritize remaining 3 training modules, extend schedule by 1 week if needed
     - agent-maintenance: CMMS items assigned to vendor support team
     - agent-legal: Regulatory liaison meeting scheduled
     - agent-procurement: Tracking shipment daily, ETA confirmed T-10
     - agent-hse: Emergency response drill scheduled T-12

  3. Gate Readiness Check (T-14):
     - Status: 440 of 540 complete (81.5%)
     - Critical items: 78 of 85 complete (91.8%)
     - 7 critical items remaining:
       * 2 SOPs still in review (expedited)
       * 1 training module delayed (instructor availability)
       * 2 permits pending (regulatory response expected T-7)
       * 1 CMMS item in testing
       * 1 drill scheduled T-12

  4. Gate Package Generation (T-7):
     - Invoked generate-or-gate-review skill
     - Final status: 82.6% overall, 94.1% critical items
     - 5 items to be completed as conditions of gate passage
     - Recommendation: CONDITIONAL PASS
       Conditions: Complete 5 items within 30 days post-gate
       Evidence: 80 of 85 critical items complete
       Risk assessment: 2 HIGH risks (permits, training), mitigated
     - Package: 22 slides + 45-page supporting document

Output:
  Gate G4 Package: "SV-PMO-GATE-G4-Package.pptx"
  Recommendation: CONDITIONAL PASS
  Conditions: 5 critical items with 30-day completion window
  Decision: Gate Review Committee scheduled for {date} via mcp-teams
  Pre-read distributed to 8 committee members via mcp-outlook
```

### Example 4: Program Close-Out

```
Trigger: Steady-state criteria met for Sierra Verde Copper Expansion

Process:
  1. Steady-State Verification:
     - Throughput: 112,000 tpd average over 30 days (93.3% of design) - PASS
     - Quality: 99.97% Cu cathode, on-spec 97% of production - PASS
     - Availability: 87.2% overall plant availability - PASS
     - Cost: $0.92/lb vs $0.88/lb budget (4.5% variance) - PASS
     - Safety: TRIR 0.42 (target <0.50) - PASS
     - Environment: All parameters within permit - PASS
     - Staffing: 98% positions filled, all competency verified - PASS
     - Systems: CMMS, ERP, SCADA all fully operational - PASS

  2. Program Performance Summary:
     - OR Program Duration: 33 months (planned: 33 months) - ON TARGET
     - Total Deliverables: 540 completed (100%)
     - Gates Passed: G1-G6 all passed (G4 conditional, all conditions cleared)
     - OR Budget: $42.8M actual vs $44.0M plan ($1.2M under budget)
     - Ramp-Up Achievement: 87% Year-1 production vs >80% target - EXCEEDED
     - Safety: Zero OR-attributable incidents during commissioning/ramp-up
     - Industry Benchmark: Year-1 at 87% vs industry avg 50-70% - TOP QUARTILE

  3. Close-Out Activities:
     - Lessons learned captured: 127 items across 12 domains
     - Knowledge base updated with project data
     - All documentation archived in SharePoint
     - OR governance transitioned to operations governance
     - Final financial report generated
     - Program team demobilized (phased over 60 days)

Output:
  "Sierra Verde Copper Expansion OR Program CLOSED.
   Steady-state declared: {date}
   Final readiness score: 97.2%
   Year-1 production: 87% of design capacity (industry top quartile)
   Program delivered on time and $1.2M under budget.
   127 lessons learned captured for future projects.
   Congratulations to all 5 domain teams."
```
