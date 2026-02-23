# Plan Turnaround
## Skill ID: MAINT-05
## Version: 1.0.0
## Category: Maintenance Intelligence (Agent 3)
## Priority: P1 - Critical

---

## Purpose

Develop comprehensive planning packages for major turnarounds, shutdowns, and outages (collectively referred to as TAR -- Turnaround) in industrial facilities. This skill addresses the full turnaround lifecycle from initial scope definition through execution planning, resource optimization, and post-turnaround performance assessment.

Turnarounds represent the single largest maintenance expenditure for most process industries, consuming 30-50% of the annual maintenance budget in a single event lasting 2-6 weeks. Industry benchmarking consistently shows that poorly planned turnarounds suffer 10-30% budget overruns and 5-15 days of schedule overrun (Pain CE-02), translating to millions of dollars in excess cost and lost production. Conversely, well-planned turnarounds with mature processes achieve on-budget (+/-3%) and on-schedule (+/-1 day) performance.

The critical success factors for turnaround performance are: early scope freeze (12-18 months before execution), detailed work package development, resource leveling and optimization, logistics planning, and rigorous change management during execution. This skill produces the planning documentation and analytical outputs that underpin each of these factors.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Turnaround Planning Milestones**: Follow the industry-standard turnaround planning process with gate reviews:
   - **M-18 to M-12**: Scope identification and preliminary estimate
   - **M-12 to M-9**: Scope development and detailed estimating
   - **M-9 to M-6**: Scope freeze, critical path scheduling, resource loading
   - **M-6 to M-3**: Work package development, material procurement, contractor mobilization
   - **M-3 to M-0**: Pre-turnaround preparation, pre-work execution, final readiness review
   - **Execution**: Daily progress tracking, schedule updates, change management
   - **Post-TAR**: Performance assessment, lessons learned, CMMS updates

2. **Scope Management is Paramount**: Scope creep is the #1 cause of turnaround overruns. The agent must enforce scope freeze discipline and quantify the impact of any scope additions after the freeze date. Industry data shows that every 1% of scope added after freeze adds approximately 3% to cost due to re-planning, re-sequencing, and resource conflicts.

3. **Critical Path Method (CPM) Scheduling**: The turnaround schedule must be built using CPM with realistic durations, proper logic ties (FS, SS, FF, SF with lags), resource constraints, and identified critical/near-critical paths. Float analysis determines schedule risk.

4. **Resource Optimization**: Labor, equipment (cranes, scaffolding, etc.), and services must be leveled to avoid peaks that exceed physical or contractual constraints. The agent must identify resource conflicts and propose solutions (re-sequencing, extended shifts, additional resources).

5. **Work Package Quality**: Every work item must have a detailed work package including: scope description, procedures, safety requirements (LOTO, permits, confined space, height), materials list, tools/equipment, estimated labor (by craft and hours), and logical sequence.

6. **Risk-Based Turnaround Decisions**: Scope inclusion/exclusion decisions should be based on risk assessment, not just "while we're in there" reasoning. The agent must evaluate each scope item against the cost of execution during TAR vs. the risk/cost of deferral.

7. **Language**: Spanish (Latin American) with English technical terms preserved.

---

## Trigger / Invocation

```
/plan-turnaround
```

### Natural Language Triggers
- "Plan a turnaround for [facility/unit]"
- "Develop shutdown scope and schedule"
- "Create turnaround work packages"
- "Major maintenance outage planning for [date]"
- "Planificar parada de planta para [unidad]"
- "Desarrollar plan de parada mayor / turnaround"
- "Crear paquetes de trabajo para la parada"

### Aliases
- `/plan-shutdown`
- `/tar-planning`
- `/turnaround-plan`
- `/outage-plan`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `scope_list` | Preliminary turnaround work scope: equipment items, maintenance tasks, inspection requirements, projects/modifications | .xlsx | Maintenance / Engineering / Operations |
| `equipment_register` | Equipment within turnaround scope with hierarchy, criticality, and current condition | .xlsx | CMMS (mcp-cmms) |
| `target_dates` | Planned start date, target duration, and hard deadline (if any) | Text / .xlsx | Plant Management |
| `resource_constraints` | Available workforce (in-house + contractor), crane availability, scaffolding capacity, site access limitations | .xlsx / text | Turnaround Manager |
| `budget_target` | Approved or target turnaround budget | Text / .xlsx | Finance / Management |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `previous_tar_reports` | Historical turnaround performance data (actual vs. planned) | Industry benchmarks used |
| `inspection_reports` | Latest condition assessment and inspection findings | Include inspection in TAR scope |
| `maintenance_backlog` | Deferred maintenance backlog for scope inclusion evaluation | CMMS backlog extract used |
| `project_scope` | Capital project work to be integrated with TAR | Maintenance scope only |
| `safety_requirements` | Site-specific safety protocols, permit requirements, simultaneous operations rules | Standard industrial safety practices |
| `logistics_constraints` | Laydown areas, access roads, parking, accommodation (remote sites) | Assume adequate logistics |
| `weather_data` | Historical weather patterns for planned period | Standard planning assumptions |
| `contract_data` | Existing maintenance contractor agreements and rates | Industry-average rates |
| `cmms_pm_due_list` | PM and inspection tasks falling due during TAR window | Extract from CMMS via mcp-cmms |
| `regulatory_inspections` | Mandatory statutory inspections (pressure vessels, lifting equipment, electrical) | Flag for regulatory compliance check |

---

## Output Specification

### Deliverable 1: Turnaround Plan (.docx)

**Filename**: `{ProjectCode}_TAR_Plan_{UnitCode}_v{Version}_{YYYYMMDD}.docx`

**Structure**:
1. Executive Summary (2-3 pages)
   - TAR objectives and success criteria
   - Scope summary (work items, estimated hours, cost)
   - Schedule summary (duration, critical path, key milestones)
   - Resource summary (peak workforce, contractor scope)
   - Risk summary (top 5 risks with mitigation)
2. TAR Organization & Governance (3-5 pages)
   - Turnaround organization chart
   - Roles and responsibilities
   - Decision authority matrix
   - Communication plan
   - Gate review schedule
3. Scope Definition (5-10 pages)
   - Scope breakdown structure
   - Work item register (all approved scope items)
   - Scope freeze declaration and change management process
   - Deferred items register with risk justification
   - Scope-cost-schedule trade-off analysis
4. Schedule (5-8 pages)
   - Level 1 milestone schedule
   - Level 2 summary schedule by system/area
   - Level 3 detailed schedule (reference to .mpp file)
   - Critical path analysis
   - Near-critical path analysis (float < 24 hours)
   - Schedule risk assessment (Monte Carlo summary if performed)
5. Resource Plan (3-5 pages)
   - Labor resource histogram by craft (daily)
   - Peak workforce by craft and total
   - Resource leveling analysis and optimization
   - Crane and heavy equipment schedule
   - Scaffolding requirements schedule
   - Contractor mobilization/demobilization plan
6. Cost Estimate (3-5 pages)
   - Cost breakdown: labor, materials, equipment rental, contractors, overhead
   - Contingency analysis and allowance
   - Cost loading curve (planned spending profile)
   - Budget reconciliation
7. Safety & Environmental Plan (3-5 pages)
   - HSE risk assessment for TAR activities
   - Critical safety risks (confined space, hot work, lifting, work at height, LOTO)
   - Permit-to-work requirements by area/activity
   - Simultaneous operations (SIMOPS) restrictions
   - Environmental management (waste, emissions, spill prevention)
   - Emergency response during TAR
8. Logistics Plan (2-3 pages)
   - Site access and traffic management
   - Laydown areas and material staging
   - Waste management and disposal
   - Accommodation and catering (remote sites)
   - Tool and consumable management
9. Quality Assurance Plan (2-3 pages)
   - Inspection and test plan (ITP) for critical work
   - Hold points and witness points
   - As-built documentation requirements
   - Punch list management process
10. Commissioning & Start-up Plan (2-3 pages)
    - System reinstatement sequence
    - Commissioning procedures reference
    - Start-up checklist
    - Performance verification criteria
11. Execution Control (2-3 pages)
    - Daily progress reporting format
    - Schedule update frequency and process
    - Cost tracking and forecasting process
    - Scope change request and approval process
    - Escalation process for critical issues
12. Post-TAR Assessment Framework (1-2 pages)
    - KPI measurement plan
    - Lessons learned process
    - CMMS update requirements (next PM due dates, equipment condition)

### Deliverable 2: Turnaround Schedule (.xlsx + .mpp specification)

**Filename**: `{ProjectCode}_TAR_Schedule_{UnitCode}_v{Version}_{YYYYMMDD}.xlsx`

Level 3 schedule with activity-level detail, logic ties, resource loading, and critical path identification.

### Deliverable 3: Work Package Register (.xlsx)

**Filename**: `{ProjectCode}_TAR_WorkPackages_{UnitCode}_v{Version}_{YYYYMMDD}.xlsx`

Complete work package register with scope, safety, materials, labor, and sequence for every turnaround work item.

### Deliverable 4: Cost Estimate (.xlsx)

**Filename**: `{ProjectCode}_TAR_CostEstimate_{UnitCode}_v{Version}_{YYYYMMDD}.xlsx`

Detailed bottom-up cost estimate with labor, materials, equipment, contractor, and contingency breakdowns.

---

## Methodology & Standards

### Turnaround Planning Process (Industry Best Practice)

| Phase | Timing | Activities | Gate Review |
|-------|--------|------------|------------|
| **Phase 1: Initiate** | M-18 to M-12 | Form TAR team, define objectives, identify scope, preliminary estimate | Gate 1: Scope identification complete |
| **Phase 2: Develop** | M-12 to M-9 | Detail scope, develop schedule, refine estimate, identify long-lead materials | Gate 2: Scope development complete |
| **Phase 3: Freeze** | M-9 to M-6 | Freeze scope, finalize schedule, complete resource plan, procure materials | Gate 3: Scope freeze |
| **Phase 4: Prepare** | M-6 to M-3 | Develop work packages, mobilize contractors, pre-fabrication, pre-work | Gate 4: Work packages complete |
| **Phase 5: Ready** | M-3 to M-0 | Final readiness review, material staging, pre-turnaround inspections | Gate 5: Execution readiness |
| **Phase 6: Execute** | D-Day | Daily progress, schedule control, cost control, scope change management | Daily/shift reviews |
| **Phase 7: Close** | Post-TAR | Start-up, performance assessment, lessons learned, CMMS updates | Gate 6: Close-out complete |

### Turnaround KPIs

| KPI | World-Class | Good | Average | Poor |
|-----|------------|------|---------|------|
| Schedule performance | +/-1 day | +/-2 days | +/-5 days | >5 days overrun |
| Cost performance | +/-3% | +/-5% | +/-10% | >10% overrun |
| Scope change after freeze | <3% | 3-5% | 5-10% | >10% |
| Safety (TRIR during TAR) | 0 | <0.5 | 0.5-2.0 | >2.0 |
| Work package quality | >90% complete | 80-90% | 60-80% | <60% |
| Rework rate | <2% | 2-5% | 5-10% | >10% |
| First-run successful start-up | Yes | Minor issues | Significant issues | Failed start |

### Industry Turnaround Cost Benchmarks

| Industry | TAR Frequency | Typical Duration | Cost Range (% RAV) |
|----------|--------------|-----------------|-------------------|
| Oil Refinery | 4-6 years | 25-45 days | 1.5-3.0% of unit RAV |
| Chemical Plant | 3-5 years | 15-30 days | 1.0-2.5% of unit RAV |
| Power Plant (Gas Turbine) | Annual (minor), 3-4 years (major) | 7-21 days | 0.5-2.0% |
| Mining Concentrator | Annual (planned) | 7-14 days | 1.0-2.0% of plant RAV |
| Pulp Mill | Annual | 10-21 days | 1.0-2.0% |
| Smelter / Furnace | 12-24 months (campaign) | 14-28 days | 2.0-4.0% |

### Scope Change Impact Model

| Scope Change Timing | Cost Impact Multiplier | Schedule Impact |
|---------------------|----------------------|-----------------|
| Before scope freeze (M-9) | 1.0x (base cost) | Absorbed in planning |
| Between freeze and M-6 | 1.5x | Minor re-sequencing |
| Between M-6 and M-3 | 2.0x | Possible schedule extension |
| Between M-3 and execution | 3.0x | Likely schedule extension |
| During execution | 3-5x | Schedule and cost overrun |

### Reference Standards

| Standard | Application |
|----------|-------------|
| AACE RP 36R-08 | Development of cost estimate for turnarounds |
| AACE RP 46R-11 | Turnaround planning and scheduling |
| API 689 | Collection and exchange of turnaround data |
| ISO 55001 | Asset management lifecycle planning |
| PMBOK (PMI) | Project management methodology |

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** All turnaround scope items derived from FMECA or maintenance strategy analysis MUST reference failure modes exclusively from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No ad-hoc or free-text failure mode descriptions are permitted in scope registers, work packages, or deferral risk justifications.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. Every turnaround scope item that is driven by a failure mode (whether from FMECA, condition assessment, or bad actor analysis) MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component or equipment included in the turnaround scope | Heat Exchanger Tube Bundle |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Corrodes |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Chemical attack (process fluid) |

**Complete failure mode definition:** *"Heat Exchanger Tube Bundle Corrodes due to Chemical attack (process fluid)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in turnaround scope registers, work packages, deferral risk assessments, and post-TAR failure analysis MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for Turnaround Planning

1. **Scope Register — Failure Mode Column:** The turnaround scope register (Step 2) MUST include a `FM_Reference` column linking each scope item to its originating failure mode(s) from the VSC Failure Modes Table, using the format "[Mechanism] due to [Cause]".
2. **Scope Risk Assessment (Step 3):** When evaluating risk of deferral for discretionary items, the failure mode being deferred MUST be referenced using official table nomenclature — e.g., "Risk of deferring: Cracks due to Fatigue (cyclic loading)" rather than "risk of cracking".
3. **Work Package Development (Step 8):** Each work package scope description MUST identify the failure mode(s) being addressed, using the standardized three-part structure.
4. **FMECA Columns in Work Packages:** Work packages derived from FMECA analysis MUST include the columns: `FM_Mechanism`, `FM_Cause`, and `FM_Full_Name` (in the format "[Mechanism] due to [Cause]") to maintain traceability.
5. **No Ad-Hoc Descriptions:** Scope justifications such as "exchanger leaking", "vessel wall thinning", or "bearing vibration high" are NOT acceptable. Use the standardized form: "Corrodes due to [Cause]", "Wears due to [Cause]", "Looses Preload due to [Cause]", etc.
6. **Post-TAR Assessment:** The lessons-learned process (Phase 7) MUST classify any discovered conditions or unplanned work using VSC Failure Modes Table nomenclature for consistent data collection and future turnaround scope improvement.
7. **Consistency with Upstream Sources:** Failure mode descriptions in turnaround documents MUST be identical to those in the FMECA workbook and maintenance strategy — no paraphrasing or abbreviation.

---

## Step-by-Step Execution

### Phase 1: Scope Definition & Preliminary Planning (Steps 1-4)

**Step 1: Collect and compile scope inputs.**
- Extract maintenance backlog for TAR-eligible equipment from CMMS via mcp-cmms
- Collect PM and inspection tasks falling due during TAR window
- Gather condition assessment findings and inspection recommendations
- Compile deferred maintenance items from previous TAR or routine deferrals
- Collect capital project work packages for TAR integration
- Collect regulatory/statutory inspection requirements

**Step 2: Build the scope register.**
- Create comprehensive work item register with unique scope item IDs
- For each item: description, requesting department, justification, equipment tag, estimated hours, estimated cost, materials required, long-lead items
- Classify each item: mandatory (safety/regulatory/critical failure risk), high priority (significant reliability/cost risk), desirable (beneficial but deferrable), discretionary (nice-to-have)
- Assess scope vs. budget constraint; identify items for exclusion if budget limited

**Step 3: Perform scope risk assessment.**
- For each discretionary/deferrable item: assess risk of deferral to next TAR cycle
  - What is the probability of failure before next TAR?
  - What is the consequence of failure (production, safety, cost)?
  - What is the cost of doing the work during TAR vs. during operation?
- Rank all scope items by risk-adjusted priority
- Recommend scope inclusion/exclusion based on risk and budget

**Step 4: Develop preliminary estimate.**
- Bottom-up estimate using work item quantities and unit rates
- Add allowances: contingency (5-10% for well-defined scope, 10-20% for less defined), management & supervision (8-12% of labor), indirect costs (tools, consumables, site services)
- Compare with historical TAR costs for similar scope/facility
- Reconcile with budget target; identify shortfall/surplus

### Phase 2: Detailed Planning & Scheduling (Steps 5-8)

**Step 5: Develop Level 3 schedule.**
- Break each scope item into discrete activities with realistic durations
- Establish logic ties between activities:
  - Finish-to-Start (FS): predecessor must complete before successor starts
  - Start-to-Start (SS): activities can proceed in parallel with defined lag
  - Finish-to-Finish (FF): activities must complete together
- Include preparation activities: isolation, decontamination, scaffolding, blinding
- Include reinstatement activities: reassembly, testing, recommissioning
- Identify critical path and near-critical paths (float < 24 hours)
- Calculate total duration and compare with target

**Step 6: Perform resource loading and leveling.**
- Assign craft resources to each activity (fitters, electricians, instrument techs, riggers, scaffolders, insulators, painters)
- Generate resource histogram showing daily demand by craft
- Identify resource peaks exceeding available capacity
- Apply resource leveling techniques:
  - Delay non-critical activities (use float)
  - Extend shift hours (12-hour days, 7-day weeks)
  - Re-sequence parallel activities
  - Split activities across multiple shifts
  - Add contractor resources for peak periods
- Verify leveled schedule still meets duration target

**Step 7: Identify and procure long-lead materials.**
- Extract material requirements from work packages
- Identify long-lead items (delivery > 8 weeks): major spares, catalyst, specialty gaskets, custom fabrications
- Verify stock availability for standard items
- Generate material procurement schedule working backwards from TAR start date
- Flag material risks (single-source items, import restrictions, hazmat shipping)

**Step 8: Develop work packages for all scope items.**
- For each work item, create a work package containing:
  - Scope description and acceptance criteria
  - Step-by-step procedure reference
  - Safety requirements: LOTO plan, permits required, PPE, confined space, hot work
  - Materials list with part numbers and quantities
  - Tools and equipment required
  - Estimated labor: craft, headcount, hours
  - Quality requirements: ITP hold/witness points, documentation
  - Pre-turnaround preparation requirements
  - Reinstatement and testing requirements
- Assess work package quality against completeness checklist (target >90%)

### Phase 3: Execution Planning & Readiness (Steps 9-12)

**Step 9: Develop safety plan.**
- Identify high-risk activities: confined space entry, work at height, heavy lifts, hot work, LOTO, simultaneous operations
- Develop SIMOPS matrix (which activities can/cannot proceed simultaneously)
- Define permit-to-work requirements by area and activity type
- Plan daily safety meetings, toolbox talks, and safety walks
- Establish emergency response plan during TAR
- Set safety KPI targets for TAR execution

**Step 10: Develop logistics plan.**
- Map site layout: laydown areas, material staging, crane positions, access routes
- Plan contractor mobilization: accommodation, transportation, induction, PPE issue
- Plan waste management: bins, hazardous waste, scrap metal, catalyst
- Plan tool management: common tools, specialty tools, calibrated instruments
- Plan catering and welfare facilities for peak workforce

**Step 11: Conduct readiness review (Gate 5).**
- Verify all scope items have complete work packages
- Verify all materials are on site or confirmed delivery before start
- Verify all contractor resources are mobilized and inducted
- Verify all permits and regulatory approvals are in place
- Verify schedule is finalized and communicated
- Verify isolation plans are reviewed and approved
- Issue Readiness Certificate or identify remaining actions

**Step 12: Generate all deliverables.**
- Compile TAR Plan document
- Finalize TAR schedule
- Package all work packages with supporting documents
- Finalize cost estimate with spend profile
- Store all deliverables in project library via mcp-sharepoint
- Distribute to stakeholders via mcp-project-online

---

## Quality Criteria

### Planning Quality

| Criterion | Weight | Target |
|-----------|--------|--------|
| Scope completeness | 25% | >95% of known work captured in scope register |
| Work package quality | 25% | >90% of work packages complete to standard checklist |
| Schedule quality (logic, constraints) | 20% | 100% of activities have logic ties; no open ends; critical path identified |
| Resource feasibility | 15% | Peak resource demand within +10% of available capacity |
| Cost estimate accuracy | 15% | Bottom-up estimate within +/-15% of budget (AACE Class 3+) |

### Automated Checks

- [ ] Every scope item has unique ID, description, and priority classification
- [ ] Every scope item has estimated hours and cost
- [ ] All long-lead materials identified and procurement initiated
- [ ] Schedule has no open-ended activities (dangling starts or finishes)
- [ ] Critical path is identified and duration is within target
- [ ] Resource histograms do not exceed capacity constraints
- [ ] Every work package has safety requirements documented
- [ ] LOTO plans exist for all isolation-requiring activities
- [ ] Material list reconciles between work packages and procurement
- [ ] Cost estimate total equals sum of work package estimates + allowances

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `develop-maintenance-strategy` (MAINT-01) | Shutdown maintenance scope from RCM analysis | High |
| `analyze-failure-patterns` (MAINT-03) | Bad actor work scope for TAR | Medium |
| `benchmark-maintenance-kpis` (MAINT-04) | Historical TAR performance benchmarks | Medium |
| Agent 2 (Engineering Intelligence) | Project work packages for integration | Medium |
| Agent 4 (HSE Intelligence) | Safety requirements and risk assessments | High |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `model-staffing-requirements` (WF-01) | Peak contractor requirements for TAR workforce | On request |
| `plan-training-program` (WF-04) | Specialized training needs for TAR activities | On request |
| `resolve-cross-functional-conflicts` (INTG-02) | Cross-functional coordination data (operations/maintenance/projects) | During planning |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-cmms** | Extract backlog, PM due lists, equipment data; update post-TAR | `GET /backlog`, `GET /pm-schedule`, `GET /equipment`, `POST /work-orders` |
| **mcp-project-online** | Publish TAR schedule, track progress, manage resources | `POST /projects`, `PUT /tasks`, `GET /resources` |
| **mcp-sharepoint** | Store TAR documents, work packages, permits | `POST /documents`, `GET /documents`, `PUT /lists` |

---

## Templates & References

### Templates
- `VSC_TAR_Plan_Template_v2.0.docx`
- `VSC_TAR_Schedule_Template_v3.0.xlsx`
- `VSC_WorkPackage_Template_v2.0.xlsx`
- `VSC_TAR_CostEstimate_Template_v2.0.xlsx`
- `VSC_TAR_ReadinessChecklist_v1.5.xlsx`

### Reference Documents
- AACE RP 36R-08: Development of Cost Estimate for Turnarounds
- AACE RP 46R-11: Turnaround Planning, Scheduling, and Cost Estimating
- API 689: Turnaround data collection
- T.A. Cook Turnaround Benchmarking Studies
- VSC Internal: "Guia de Planificacion de Paradas de Planta v3.0"

---

## Examples

### Example 1: Mining Concentrator Annual Shutdown

**Facility**: Copper concentrator, 50,000 tpd capacity
**Scope**: 287 work items across grinding, flotation, thickening, filtration
**Duration Target**: 10 days
**Budget**: USD 3.2M

| Area | Work Items | Est. Hours | Est. Cost | Critical Path Items |
|------|-----------|-----------|-----------|-------------------|
| Grinding (SAG + Ball Mills) | 68 | 12,400 | $1.1M | SAG mill liner change (7 days), ball mill reline |
| Flotation | 82 | 6,200 | $0.6M | Cell rubber lining, agitator bearing replacement |
| Thickening | 45 | 3,800 | $0.4M | Rake mechanism inspection, drive overhaul |
| Filtration | 38 | 3,200 | $0.5M | Filter cloth replacement, hydraulic system overhaul |
| Utilities & Infrastructure | 54 | 4,400 | $0.6M | Substation maintenance, piping repairs |
| **Total** | **287** | **30,000** | **$3.2M** | **Critical path: SAG mill reline = 7 days** |

**Peak Workforce**: 285 (in-house 85 + contractor 200)
**Scope Change Budget**: 5% contingency = $160K for approved additions
**Key Risk**: SAG mill liner delivery -- single-source, 12-week lead time; order placed M-16
