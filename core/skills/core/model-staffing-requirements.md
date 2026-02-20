# Model Staffing Requirements

## Skill ID: M-01
## Version: 1.0.0
## Category: M. Workforce Readiness (Agent 5)
## Priority: P1 - Critical

---

## Purpose

Model the Full-Time Equivalent (FTE) staffing requirements for industrial operations based on operational parameters, workload analysis, shift pattern modeling, and labor regulatory constraints. This skill translates the outputs of maintenance strategy, operating model design, and support function planning into a quantified, justified, and timeline-sequenced staffing plan that answers the fundamental question: "How many people, with what skills, do we need, and when?"

Staffing modeling is the critical bridge between operational planning and workforce execution. Getting it wrong has severe consequences in both directions:

- **Understaffing** leads to excessive overtime, fatigue-related safety incidents, low PM compliance, production losses, and accelerated employee turnover. In mining, understaffing maintenance by 15-20% typically results in a 30-40% increase in reactive work (Pain Point D-05, Deloitte Project OR Study 2022), creating a vicious cycle of declining reliability and increasing workload.
- **Overstaffing** wastes $80,000-$150,000+ per excess FTE annually (fully loaded cost in Chilean mining), reduces productivity metrics, creates organizational complexity, and makes future cost reduction painful.
- **Late staffing** is the most common failure mode: 70% of operational readiness programs identify staffing and recruitment as a top-5 risk, and 40% report that staffing delays directly impacted commissioning timelines (Pain Point PE-01, IPA Benchmarking Database). In remote mining locations (Atacama, Antofagasta), recruitment lead times for specialized roles can exceed 12-18 months.

The modeling challenge is multi-dimensional. Staffing requirements depend on:
- **Operating model decisions**: Continuous 24/7 vs. 5x2 operations, owner-operate vs. contractor model, centralized vs. distributed maintenance
- **Maintenance strategy outputs**: Total annual maintenance labor hours by craft, CBM program resource requirements, shutdown/turnaround manning
- **Regulatory constraints**: Chilean labor law shift limitations (Codigo del Trabajo Articles 22-40), fatigue management regulations (DS 594), mandatory rest periods
- **Geographic factors**: Remote site logistics (fly-in/fly-out vs. residential), altitude considerations, commute times
- **Productivity assumptions**: Wrench time (direct productive time as % of shift), absenteeism rates, leave provisions, training time allocation

This skill integrates all these factors into a defensible staffing model that serves as the basis for recruitment planning, training program design, budget allocation, and organizational design.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Bottom-Up Workload Derivation**: Staffing requirements must be calculated from documented workload, not industry ratios alone. The agent must derive FTE requirements from: maintenance labor hours (from RCM/FMECA), operating activity requirements (shift rounds, process monitoring, quality control), support function workload (planning, supervision, administration), and shutdown/turnaround peak manning needs.

2. **Shift Pattern Modeling**: The agent must model multiple shift pattern scenarios (e.g., 4x3, 7x7, 5x2, 4x4, 2x1) and evaluate each against: regulatory compliance (Chilean labor law), fatigue risk, operational coverage requirements, total FTE impact, and cost. The recommended pattern must be justified quantitatively.

3. **Chilean Labor Law Compliance**: All staffing models MUST comply with Chilean Codigo del Trabajo, specifically:
   - Maximum 45 ordinary hours per week (Art. 22)
   - Exceptional shift systems approved by Direccion del Trabajo (Art. 38)
   - Mandatory rest period requirements (at least 1 day per 7 worked, or equivalent under exceptional regime)
   - Overtime limitations (maximum 2 hours per day, Art. 30-32)
   - Night work provisions and restrictions
   - Annual leave entitlements (15 working days minimum, Art. 67)
   - Fatigue management requirements for mining operations (DS 132, Chapter 6)

4. **Productivity-Adjusted Calculations**: Raw workload hours must be converted to FTE requirements using realistic productivity factors:
   - Wrench time (direct productive time): 25-35% for average, 45-55% for world-class
   - Availability factor: Accounts for leave, training, sickness, and administrative time
   - Supervision ratio: Number of workers per supervisor (typically 8-12:1 for maintenance, 6-10:1 for operations in mining)
   - Contractor ratio: Percentage of work performed by contract vs. permanent staff

5. **Recruitment Timeline Integration**: The staffing model must include a time-phased recruitment plan that accounts for:
   - Lead times by role type: 3-6 months for operators, 6-12 months for technicians, 9-18 months for specialists, 12-24 months for senior management
   - Training lead times: Time from hire to operational competency
   - Regulatory certification lead times: Time to obtain required licenses and certifications
   - Mobilization logistics: FIFO cycle setup, accommodation, transportation

6. **Scenario Modeling**: The agent must produce at minimum three staffing scenarios: conservative (maximum efficiency), base case (realistic assumptions), and contingency (additional buffers for risk). Each scenario must be fully costed.

7. **Language**: Spanish (Latin American) for all deliverables, with English technical terms preserved.

---

## Trigger / Invocation

```
/model-staffing-requirements
```

### Natural Language Triggers
- "Model the staffing requirements for [facility/operation]"
- "How many FTEs do we need for operations and maintenance?"
- "Build a staffing plan based on the maintenance strategy workload"
- "Calculate headcount requirements for the new operation"
- "Modelar requerimientos de dotacion para [planta/operacion]"
- "Calcular FTEs necesarios para operacion y mantenimiento"
- "Cuanta gente necesitamos y cuando la necesitamos?"

### Aliases
- `/staffing-model`
- `/fte-requirements`
- `/workforce-model`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `operating_model` | Operating model description: continuous/batch, shift structure, owner-operate vs. contractor, centralized vs. distributed functions | .docx / text | Agent-operations / User |
| `maintenance_workload` | Annual maintenance labor hours by craft (mechanical, electrical, instrumentation, predictive, lubrication), derived from maintenance strategy or PM program | .xlsx | `develop-maintenance-strategy` / `optimize-pm-program` / mcp-cmms |
| `facility_profile` | Facility description: type, capacity, number of process areas, equipment count, geographic location, altitude, remoteness | .docx / text | User / mcp-sharepoint |
| `industry_sector` | Primary industry (Mining, Oil & Gas, Power, Chemical, Water) for benchmark selection | Text | User |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `equipment_register` | Equipment list with types and counts for workload validation | Workload derived from maintenance strategy only |
| `operating_procedures_count` | Number and complexity of SOPs to staff for | Industry-typical ratio: 1 operator per 20-30 equipment items |
| `shutdown_plan` | Planned shutdown scope and frequency for peak manning calculation | Annual shutdown assumed; 2x normal maintenance manning |
| `labor_market_assessment` | Local labor availability, salary benchmarking, recruitment challenges | Chilean mining/industrial market averages applied |
| `existing_organization` | Current staffing (for brownfield) with performance data | Greenfield (clean-sheet design) assumed |
| `contractor_strategy` | Planned contractor scope and ratios | 30% contract labor for maintenance, 10% for operations |
| `budget_constraints` | Target cost-per-tonne or maintenance cost as % of RAV | Unconstrained; model reports total cost |
| `fatigue_risk_assessment` | Fatigue risk management plan requirements | DS 132 minimum requirements applied |
| `accommodation_capacity` | Available camp/accommodation beds (for remote sites) | No accommodation constraint assumed |
| `shift_preferences` | Preferred shift patterns or constraints (union agreements, client mandates) | All Chilean-legal patterns evaluated |
| `support_function_scope` | Scope of on-site support functions (planning, warehouse, admin, HSE, training) | Standard support function ratios applied |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve Chilean labor law requirements (Codigo del Trabajo) for shift pattern compliance
- Access SERNAGEOMIN DS 132 fatigue management requirements for mining
- Pull industry staffing benchmarks from SMRP, IPA, and VSC internal database
- Retrieve current Chilean salary benchmarks by role and region (Antofagasta, Atacama, etc.)
- Access recruitment lead time data from VSC project history
- Retrieve wrench time and availability factor benchmarks by industry
- Pull shift pattern templates pre-validated for Chilean labor law compliance

---

## Output Specification

### Deliverable 1: Staffing Requirements Report (.docx)

**Filename**: `{ProjectCode}_Staffing_Model_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 35-60 pages

**Structure**:

1. **Cover Page** -- VSC branding, project identification, model version
2. **Document Control** -- Revision history, review and approval
3. **Executive Summary** (3-4 pages)
   - Total FTE requirement (base case) with breakdown by function
   - Shift pattern recommendation with rationale
   - Annual fully-loaded labor cost estimate
   - Key staffing risks and mitigation strategies
   - Recruitment timeline critical path
   - Comparison with industry benchmarks
4. **Scope & Methodology** (3-4 pages)
   - Facilities and operations in scope
   - Workload derivation methodology (bottom-up from maintenance strategy + operations model)
   - Productivity assumptions and justifications
   - Shift pattern modeling approach
   - Labor law compliance framework
5. **Operating Model Summary** (3-5 pages)
   - Operating philosophy and mode (24/7 continuous, 5x2, campaign)
   - Organizational structure (centralized, area-based, hybrid)
   - Owner-operate vs. contractor scope split
   - Key operating parameters affecting staffing
6. **Workload Analysis** (5-8 pages)
   - 6.1 Maintenance workload by craft
     - Mechanical: annual hours, major task categories, peak loading
     - Electrical: annual hours, major task categories
     - Instrumentation/Control: annual hours, calibration and CBM activities
     - Predictive maintenance: annual hours by technology
     - Lubrication: annual hours, route-based workload
   - 6.2 Operations workload
     - Shift operations: control room, field rounds, process monitoring, quality control
     - Non-shift operations: day-shift support, technical support, optimization
   - 6.3 Support function workload
     - Maintenance planning and scheduling
     - Warehouse and materials management
     - HSE coordination
     - Training and competency management
     - Administration and clerical
   - 6.4 Supervision and management workload
7. **Shift Pattern Analysis** (5-8 pages)
   - 7.1 Shift patterns evaluated (minimum 3 patterns)
   - 7.2 Pattern-by-pattern analysis:
     - Schedule visualization (calendar view)
     - Hours worked per cycle
     - Chilean labor law compliance verification
     - Fatigue risk assessment (hours, night shifts, recovery time)
     - FTE impact (crews required, total headcount)
     - Cost impact (base salary, overtime, shift premiums)
   - 7.3 Recommended pattern with justification
   - 7.4 Sensitivity analysis: FTE impact of pattern change
8. **FTE Model Results** (8-12 pages)
   - 8.1 Base case staffing model (detailed FTE breakdown)
   - 8.2 Conservative scenario (efficiency-optimized)
   - 8.3 Contingency scenario (risk-buffered)
   - 8.4 Staffing by function and level:
     - Operations: Shift supervisors, control room operators, field operators, process technicians
     - Maintenance: Superintendent, supervisors, planners, schedulers, mechanical fitters, electricians, instrument technicians, predictive technicians, lubrication technicians
     - HSE: Manager, coordinators, specialists, paramedics
     - Support: Warehouse, admin, training, IT
     - Management: Plant manager, area managers, reliability engineers
   - 8.5 Permanent vs. contractor FTE split
   - 8.6 Shutdown/turnaround additional manning requirements
   - 8.7 FTE reconciliation with workload (hours available vs. hours required)
9. **Recruitment Plan** (3-5 pages)
   - 9.1 Time-phased recruitment timeline (month-by-month)
   - 9.2 Critical path roles (longest lead time, hardest to fill)
   - 9.3 Recruitment source strategy (local, national, international)
   - 9.4 Training pipeline requirements (time from hire to competency)
   - 9.5 Mobilization plan for FIFO workers
10. **Cost Model** (3-5 pages)
    - 10.1 Fully-loaded cost per FTE by role category
    - 10.2 Total annual labor cost by function
    - 10.3 Cost comparison across scenarios
    - 10.4 Sensitivity analysis: cost impact of key assumption changes
    - 10.5 Benchmark comparison: cost per tonne, maintenance cost % RAV
11. **Risks & Assumptions** (2-3 pages)
    - Key assumptions register with sensitivity impact
    - Staffing risks (labor market, retention, training timeline)
    - Mitigation strategies for top risks
12. **Appendices**
    - A: Detailed workload calculations by craft
    - B: Shift pattern compliance certificates (labor law)
    - C: Salary benchmark data sources
    - D: Recruitment lead time assumptions by role

### Deliverable 2: FTE Model Workbook (.xlsx)

**Filename**: `{ProjectCode}_FTE_Model_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Workload Summary, Operations FTE, Maintenance FTE, Support Functions FTE, Shift Pattern Analysis, Productivity Assumptions, Cost Model, Recruitment Timeline, Scenario Comparison, Sensitivity Analysis, Benchmark Comparison

### Deliverable 3: Recruitment Timeline (.xlsx / Gantt)

**Filename**: `{ProjectCode}_Recruitment_Timeline_v{Version}_{YYYYMMDD}.xlsx`

Role-by-role recruitment Gantt chart showing: position opening date, recruitment period, offer/acceptance, training period, operational readiness date, aligned with project commissioning timeline.

---

## Methodology & Standards

### Primary Standards and References

| Standard / Reference | Application |
|---------------------|-------------|
| **Codigo del Trabajo (Chile)** | Labor law compliance for shift patterns, working hours, rest periods, overtime, annual leave |
| **DS 132 (SERNAGEOMIN)** | Mining-specific safety requirements including fatigue management, shift limitations |
| **DS 594 (MINSAL)** | Workplace environmental conditions, exposure limits affecting staffing (heat, altitude, noise) |
| **SMRP Best Practice 5.2** | Maintenance workforce planning metrics and benchmarks |
| **IPA Benchmarking** | Capital project staffing benchmarks for operational readiness |
| **ISO 55001** | Asset management requirements for workforce competency |

### Workload-to-FTE Conversion Methodology

```
For each craft/function:

1. Determine Annual Workload (hours):
   Annual_Workload = Sum of all task hours (from maintenance strategy, operating model,
                     or activity analysis)

2. Calculate Available Hours per FTE per Year:
   Gross_Hours = Weeks_per_year x Hours_per_week (per shift pattern)

   Deductions:
   - Annual Leave: 15 working days (Chilean minimum) + seniority bonus
   - Public Holidays: 16 days (Chilean calendar)
   - Sick Leave: 3-5% of gross hours (industry average)
   - Training Time: 40-80 hours per year (regulatory + development)
   - Administrative Time: 5-10% of gross hours
   - Union/Committee Time: 1-2% (where applicable)

   Net_Available_Hours = Gross_Hours - Total_Deductions
   Typical range: 1,700-1,900 hours per year per FTE

3. Apply Productivity Factor (Wrench Time):
   Productive_Hours = Net_Available_Hours x Wrench_Time_Factor

   Wrench Time Benchmarks:
   - World-class: 50-55%
   - Top quartile: 40-50%
   - Average: 25-35%
   - Below average: <25%

   Typical effective productive hours: 500-1,000 per FTE per year

4. Calculate Base FTE Requirement:
   Base_FTE = Annual_Workload / Productive_Hours_per_FTE

5. Apply Crew Factor (for shift operations):
   Shift_FTE = Positions_per_shift x Crew_Factor

   Crew Factor = Depends on shift pattern:
   - 4-crew pattern (continuous): 4.0-4.5 (includes relief)
   - 5-crew pattern (continental): 5.0-5.2
   - Day shift only (5x2): 1.0 (plus leave cover at ~1.1-1.15)

6. Add Supervision Layer:
   Supervisor_FTE = Worker_FTE / Supervision_Ratio

   Supervision Ratios:
   - Maintenance workers: 8-12 workers per supervisor
   - Operations shift: 6-10 operators per shift supervisor
   - Support staff: 10-15 per supervisor/manager

7. Add Planning and Support:
   Planner_FTE = Maintenance_FTE / 20-30 (1 planner per 20-30 maintainers)
   Scheduler_FTE = Maintenance_FTE / 50-75
   Warehouse_FTE = Based on parts volume and system complexity
   HSE_FTE = Total_site_FTE / 50-100

8. Total Site FTE:
   Total = Operations_FTE + Maintenance_FTE + Support_FTE + Management_FTE
```

### Shift Pattern Library (Chilean Legal)

| Pattern | Cycle | Hours/Cycle | Annual Hours | Crews | Legal Basis | Typical Use |
|---------|-------|-------------|-------------|-------|-------------|-------------|
| **4x3** | 4 days on / 3 days off | 48 hrs (4x12) | ~2,256 | 2 | Art. 22 exceptional | Mining, remote |
| **7x7** | 7 days on / 7 days off | 84 hrs (7x12) | ~2,184 | 2 | Art. 38 exceptional | Mining, remote |
| **14x14** | 14 on / 14 off | 168 hrs (14x12) | ~2,184 | 2 | Art. 38 exceptional | Remote mining |
| **10x10** | 10 on / 10 off | 120 hrs (10x12) | ~2,190 | 2 | Art. 38 exceptional | Remote operations |
| **5x2** | 5 days / 2 off | 45 hrs (5x9) | ~2,205 | 1 + relief | Art. 22 ordinary | Urban, office |
| **4x4 Continental** | 4D-4N-4off | 96 hrs per cycle | ~2,080 | 4 | Art. 38 exceptional | Continuous process |
| **4x2 / 4x2** | 4D-2off-4N-4off | Variable | ~1,976 | 4 | Art. 38 exceptional | Continuous process |

### Industry Staffing Benchmarks

| Metric | World-Class | Top Quartile | Median | Bottom Quartile |
|--------|------------|--------------|--------|-----------------|
| Maintenance FTE per $M RAV | 0.8-1.2 | 1.2-1.8 | 1.8-2.5 | >2.5 |
| Maintenance FTE per 100 equipment | 4-6 | 6-10 | 10-15 | >15 |
| Operations FTE per 10,000 tpd (mining) | 3-5 | 5-8 | 8-12 | >12 |
| Planner-to-craftsperson ratio | 1:20-25 | 1:25-30 | 1:30-40 | 1:>40 |
| Supervisor-to-worker ratio | 1:10-12 | 1:8-10 | 1:6-8 | 1:<6 |
| Contractor % of maintenance | 20-30% | 30-40% | 40-50% | >50% |
| Total site O&M FTE per $B CAPEX | 150-250 | 250-400 | 400-600 | >600 |

---

## Step-by-Step Execution

### Phase 1: Workload Derivation (Steps 1-4)

**Step 1: Collect and validate the maintenance workload.**
- Retrieve annual maintenance labor hours from the maintenance strategy (develop-maintenance-strategy output)
- Break down by craft: mechanical, electrical, instrumentation/control, predictive maintenance, lubrication
- Separate routine maintenance (PM/PdM) from corrective maintenance allowance
- Separate running maintenance from shutdown-only tasks
- Validate workload against industry benchmarks (hours per equipment type)
- Add corrective maintenance buffer: typically 15-25% of planned hours for well-planned operations
- Add small project/modification work: typically 10-15% of base maintenance hours
- Document any workload data gaps and assumptions
- **Quality gate**: Maintenance workload derived from documented analysis, not arbitrary headcount

**Step 2: Derive the operations workload.**
- Map the operating model: number of process areas, control rooms, field zones
- For each process area, determine:
  - Control room positions required per shift (based on process complexity and DCS scope)
  - Field operator positions per shift (based on equipment density, geographic spread, round time)
  - Sample collection and quality control positions
  - Mobile equipment operator positions
- Determine non-shift operations positions:
  - Process engineers / technical support
  - Day-shift operations coordinator
  - Quality/metallurgical laboratory staff
  - Water treatment / utilities operators
- Validate against industry benchmarks: operators per equipment item, operators per tpd capacity
- **Quality gate**: Operations manning justified by activity analysis, not headcount assumption

**Step 3: Determine support function requirements.**
- Maintenance planning and scheduling:
  - Planners: 1 per 20-30 maintenance FTEs (SMRP best practice)
  - Schedulers: 1 per 50-75 maintenance FTEs
  - Reliability engineers: 1 per 150-300 equipment items (Criticality A/B focus)
- Warehouse and materials management:
  - Storekeepers: Based on transaction volume (typically 1 per 5,000-10,000 annual transactions)
  - Receiving/shipping: Based on delivery frequency
  - Inventory controller: 1 per operation
- HSE coordination:
  - HSE coordinator ratio: 1 per 50-100 total site FTE
  - Paramedic/first aid: Based on regulatory requirements and site remoteness
  - Environmental monitoring: Based on permit requirements
- Training and competency:
  - Training coordinator: 1 per 100-200 FTEs during ramp-up, 1 per 200-400 at steady state
- Administration and clerical:
  - Admin support: 1 per 20-30 professionals
  - Document control: Based on document volume
  - IT support: 1 per 100-150 users
- **Quality gate**: Support function ratios documented and benchmarked

**Step 4: Define shutdown/turnaround peak manning.**
- Determine shutdown frequency and typical duration
- Calculate incremental maintenance hours during shutdown
- Determine peak manning: typically 1.5-3.0x normal maintenance staffing
- Identify roles that are contractor-sourced during shutdowns
- Calculate annual shutdown FTE impact (amortized over year)
- **Quality gate**: Shutdown manning derived from shutdown scope, not arbitrary multiplier

### Phase 2: Shift Pattern & FTE Modeling (Steps 5-8)

**Step 5: Model shift pattern scenarios.**
- Select 3-5 shift patterns from the shift pattern library applicable to the operating context
- For each pattern, calculate:
  - Annual working hours per person
  - Number of crews required for 24/7 coverage (if applicable)
  - Regulatory compliance check against Chilean labor law (automatic validation)
  - Night shift hours and fatigue risk score
  - Pattern efficiency: productive hours as % of total hours
- Factor in geographic considerations:
  - FIFO pattern compatibility (7x7, 14x14, 10x10 for remote sites)
  - Commute time impact on effective shift length
  - Altitude impact on work capacity (>3,000 masl: reduce by 10-15%)
- Generate pattern comparison table with all metrics
- **Quality gate**: All proposed patterns verified as Chilean labor-law compliant

**Step 6: Calculate FTE requirements for the base case.**
- For each function and craft:
  - Apply the workload-to-FTE conversion formula
  - Apply shift pattern crew factor
  - Apply productivity factor (wrench time)
  - Apply availability factor (leave, training, sick)
  - Round up to whole FTEs (you cannot hire 0.3 of a person)
- Compile total FTE by:
  - Function: Operations, Maintenance, HSE, Support, Management
  - Level: Management, Professional, Supervisory, Technical, Operator
  - Employment type: Permanent, Contract, Temporary
  - Shift assignment: Day shift, Rotating shift, FIFO
- Calculate key staffing ratios and compare with benchmarks
- **Quality gate**: FTE model is traceable to workload; productivity assumptions documented

**Step 7: Generate scenario variants.**
- **Conservative scenario**: Apply top-quartile productivity assumptions, higher contractor %, leaner supervision ratios
  - Wrench time: 45% (top quartile)
  - Contractor: 35-40% of maintenance
  - Supervision: 1:12
  - Result: Typically 15-25% fewer FTEs than base case
- **Base case**: Apply realistic productivity assumptions based on site-specific factors
  - Wrench time: 30-35% (realistic for new operation ramping up)
  - Contractor: 25-30% of maintenance
  - Supervision: 1:8-10
- **Contingency scenario**: Apply conservative productivity assumptions, additional buffers
  - Wrench time: 25% (early operation reality)
  - Additional 10-15% buffer for ramp-up learning curve
  - Supervision: 1:6-8
  - Result: Typically 15-25% more FTEs than base case
- For each scenario, calculate total cost impact
- **Quality gate**: Three scenarios span a realistic range; assumptions are transparent and defensible

**Step 8: Model the recruitment timeline.**
- For each role, determine:
  - Required operational date (when the person must be competent on the job)
  - Training lead time (time from hire to operational competency)
  - Recruitment lead time (time from job posting to accepted offer)
  - Certification lead time (time to obtain required regulatory certifications)
- Back-calculate: Recruitment start date = Operational date - Training time - Recruitment time
- Sequence roles by recruitment start date
- Identify critical path roles (longest total lead time)
- Generate month-by-month recruitment plan: positions opening, target hires, target trained
- Identify recruitment bottlenecks: roles with limited labor market availability
- Align with project schedule milestones (FEED, detailed engineering, construction, commissioning)
- **Quality gate**: No role has a recruitment start date in the past; critical path roles identified

### Phase 3: Cost Modeling & Benchmarking (Steps 9-12)

**Step 9: Build the labor cost model.**
- Retrieve salary benchmark data by role category and region:
  - Source: Chilean market surveys (Hays, Mercer, Robert Half), industry associations, VSC database
  - Adjust for region (Antofagasta premium 15-25% over Santiago)
  - Adjust for shift pattern (FIFO premium 20-30% over residential)
  - Adjust for altitude (>3,000 masl premium 10-15%)
- For each FTE, calculate fully-loaded cost:
  - Base salary (gross)
  - Employer social contributions (AFP pension ~10%, Salud ~7%, Seguro Cesantia ~2.4%, Mutualidad ~2%, SIS ~1.5%)
  - Shift premiums and allowances (night, weekend, holiday, altitude, remoteness)
  - Overtime provision (typically 5-10% of base for maintenance staff)
  - Benefits (meals, transportation, accommodation for FIFO, insurance, uniforms, PPE)
  - Training and development provision
  - Recruitment cost amortization (placement fees, relocation)
- Fully-loaded cost typically = 1.45-1.75x gross salary in Chile
- **Quality gate**: Cost model uses current market data; all cost components included

**Step 10: Perform staffing cost benchmarking.**
- Calculate key cost ratios:
  - Total O&M labor cost per tonne of product
  - Maintenance labor cost as % of Replacement Asset Value (RAV)
  - Operations labor cost per unit of capacity
  - Total labor cost per FTE (fully loaded)
- Compare with industry benchmarks:
  - Mining (copper): $2.50-$5.00 per tonne for O&M labor
  - Maintenance cost target: 2.5-3.5% of RAV (top quartile)
  - Labor cost as % of total OPEX: typically 25-40%
- Identify areas where staffing model is significantly above or below benchmarks
- Document explanations for deviations (site remoteness, altitude, complexity, automation level)
- **Quality gate**: Benchmarks from at least 3 sources; deviations explained

**Step 11: Perform sensitivity analysis.**
- Identify top 5-7 assumption variables with highest impact on FTE count:
  - Wrench time (+/- 5 percentage points)
  - Contractor ratio (+/- 10 percentage points)
  - Absenteeism rate (+/- 2 percentage points)
  - Corrective maintenance allowance (+/- 5 percentage points)
  - Supervision ratio (+/- 2 workers per supervisor)
  - Shift pattern change (compare top 2 patterns)
  - Altitude productivity deduction (+/- 5 percentage points)
- For each variable: calculate FTE and cost impact of change
- Generate tornado diagram showing relative sensitivity
- Identify the 2-3 assumptions that most influence the result
- **Quality gate**: Sensitivity analysis covers all major assumptions; tornado diagram generated

**Step 12: Compile deliverables and cross-validate.**
- Generate Staffing Requirements Report with all sections populated
- Build FTE Model Workbook with formula-driven calculations (auditable)
- Create Recruitment Timeline Gantt chart aligned with project schedule
- Cross-validate:
  - FTE totals in report match workbook totals
  - Cost model reconciles with FTE counts and salary data
  - Recruitment timeline dates are feasible given labor market conditions
  - Shift patterns are Chilean labor-law compliant (verified against Codigo del Trabajo)
  - Total maintenance FTEs produce available hours > workload hours
- Store all deliverables in mcp-sharepoint
- **Quality gate**: Zero discrepancies across deliverables; model is auditable end-to-end

### Phase 4: Validation & Delivery (Steps 13-14)

**Step 13: Validate against comparable operations.**
- Compare FTE model results with 3-5 comparable operations:
  - Same industry sector
  - Similar capacity/throughput
  - Similar geographic conditions
  - Similar technology/automation level
- Identify and explain material differences
- Document validation results as model confidence assessment
- **Quality gate**: Model is within +/- 20% of comparable operation benchmarks (explained deviations)

**Step 14: Present scenarios and recommendations.**
- Prepare executive summary with clear recommendation:
  - Recommended scenario (typically base case with specific adjustments)
  - Key staffing numbers by function
  - Total annual cost with confidence range
  - Critical recruitment actions with deadlines
  - Top 3 staffing risks with mitigation strategies
- Prepare decision support: what-if simulator in Excel (change assumptions, see FTE/cost impact)
- **Quality gate**: Recommendation is clear, justified, and actionable

---

## Quality Criteria

### Model Quality (Target: >85% Accuracy vs. Actual Staffing at Steady State)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Workload Basis | 25% | FTE requirements derived from documented workload analysis, not arbitrary ratios | Audit trail from maintenance strategy/operating model to FTE calculation |
| Labor Law Compliance | 20% | All shift patterns and working arrangements comply with Chilean Codigo del Trabajo | Legal review; Direccion del Trabajo precedent check |
| Productivity Realism | 20% | Wrench time and availability assumptions are realistic for the site context, not aspirational | Comparison with similar sites in operation; industry benchmark validation |
| Benchmark Alignment | 15% | Staffing levels are within explainable range of industry benchmarks | Comparison with 3-5 comparable operations |
| Cost Accuracy | 10% | Labor cost model uses current market data and includes all cost components | Market survey validation; cost component completeness check |
| Timeline Feasibility | 10% | Recruitment timeline accounts for realistic lead times given labor market conditions | Recruitment specialist review; historical lead time data |

### Automated Quality Checks

- [ ] Total maintenance hours available (FTEs x productive hours) >= Total maintenance workload
- [ ] Total operations positions cover all required process areas 24/7 (if continuous)
- [ ] Shift pattern hours per week comply with Chilean labor law maximums
- [ ] Rest periods between shifts comply with minimum requirements
- [ ] Supervision ratios are within 1:6 to 1:15 range (flag outliers)
- [ ] Planner-to-craftsperson ratio is within 1:15 to 1:35 range
- [ ] Fully-loaded cost per FTE is within market range for the region
- [ ] Total FTEs fall within +/- 20% of industry benchmark for facility type and size
- [ ] Recruitment start dates precede operational requirement dates by sufficient lead time
- [ ] No role has zero FTEs if the function is in scope
- [ ] Contractor + permanent FTEs = Total FTEs (no gaps)
- [ ] Scenario range (conservative to contingency) spans at least 20% of base case
- [ ] All three scenarios are fully costed (no partial models)
- [ ] Sensitivity analysis covers at least 5 key variables

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| Agent 2 (Operations Intelligence) / `agent-operations` | Operating model, shift structure, process area definitions, control room requirements | Critical | mcp-sharepoint |
| Agent 3 (Maintenance Intelligence) / `agent-maintenance` | Annual maintenance labor hours by craft from RCM/FMECA | Critical | mcp-sharepoint |
| `develop-maintenance-strategy` (MAINT-01) | Maintenance workload model, CBM resource requirements, skill requirements | Critical | Internal |
| `optimize-pm-program` (MAINT-02) | Revised maintenance workload after PM optimization | High | Internal |
| `plan-turnaround` (MAINT-05) | Shutdown peak manning requirements | High | Internal |
| Agent 4 (HSE Intelligence) / `agent-hse` | HSE staffing requirements, regulatory HSE role mandates | High | mcp-sharepoint |
| `create-org-design` | Organizational structure framework | Medium | Internal |
| Agent 6 (Finance Intelligence) / `agent-finance` | Budget constraints, labor cost targets | Medium | mcp-sharepoint |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `track-competency-matrix` (M-02) | FTE roles and required competencies for competency matrix | Automatic |
| `plan-training-program` (M-04) | Training population and competency requirements | Automatic |
| `capture-expert-knowledge` (M-03) | Critical roles requiring knowledge capture | On request |
| `create-staffing-plan` | Detailed staffing plan document from FTE model | Sequential |
| `model-opex-budget` | Labor cost inputs for O&M budget model | Automatic |
| `create-org-design` | FTE data for organizational chart and RACI | Automatic |
| `orchestrate-or-program` (H-01) | Staffing readiness status for OR gate reviews | Automatic |
| Agent 7 (Procurement Intelligence) / `agent-procurement` | Contractor FTE requirements for procurement | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-sharepoint** | Retrieve operating model documents, organizational baselines, labor market assessments; store staffing deliverables | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}` |
| **mcp-excel** | Generate FTE model workbook with formulas, scenario comparisons, sensitivity analysis, and recruitment timeline | `POST /workbooks`, `PUT /sheets/{sheet}`, `GET /workbooks/{id}` |

---

## Templates & References

### Document Templates
- `VSC_Staffing_Model_Report_Template_v2.0.docx` -- Staffing requirements report with VSC branding
- `VSC_FTE_Model_Workbook_Template_v4.0.xlsx` -- FTE calculation workbook with formulas and benchmarks
- `VSC_Shift_Pattern_Library_Chile_v3.0.xlsx` -- Pre-validated Chilean shift patterns with labor law compliance notes
- `VSC_Recruitment_Timeline_Template_v2.0.xlsx` -- Gantt chart template for recruitment planning
- `VSC_Salary_Benchmark_Chile_v2026.xlsx` -- Current Chilean salary benchmarks by role and region

### Reference Data Sources
- Codigo del Trabajo (Chile) -- Chilean labor code, Articles 22-40 (working hours, shifts, rest)
- SERNAGEOMIN DS 132, Chapter 6 -- Mining-specific fatigue management requirements
- DS 594 (MINSAL) -- Workplace environmental conditions affecting work capacity
- SMRP Best Practice 5.2 -- Maintenance Workforce Management
- IPA (Independent Project Analysis) -- Operational readiness staffing benchmarks
- Hays Chile Salary Guide -- Annual salary benchmarking by industry and role
- Mercer Chile Total Remuneration Survey -- Comprehensive compensation data
- VSC Internal Staffing Database -- Actual staffing data from 50+ completed projects
- SMRP Maintenance Staffing Benchmarks -- FTE ratios by industry sector
- Solomon Associates (Power) / Wood Mackenzie (Mining) -- Industry productivity benchmarks

### Knowledge Base
- Completed staffing models by industry (mining, O&G, power, water)
- Chilean shift pattern compliance case studies
- Labor market intelligence by region (Antofagasta, Atacama, Coquimbo, Biobio)
- Recruitment lead time data by role category
- Wrench time study results from Chilean operations
- FIFO camp logistics and accommodation planning guides

---

## Examples

### Example 1: Copper Concentrator Staffing Model

**Facility**: 120,000 tpd copper concentrator, Antofagasta Region, 3,200 masl
**Operating Model**: 24/7 continuous, owner-operate, FIFO 7x7 shift pattern
**Maintenance Strategy**: RCM-based, 58,000 annual planned maintenance hours

| Function | Role Category | Positions/Shift | Crews | Total FTE |
|----------|-------------|----------------|-------|-----------|
| **Operations** | | | | |
| | Plant Manager | 1 day | 1 | 1 |
| | Area Superintendents | 3 day | 1 | 3 |
| | Shift Superintendent | 1 per shift | 4 | 4 |
| | Control Room Operators | 4 per shift | 4 | 16 |
| | Field Operators (Crushing) | 3 per shift | 4 | 12 |
| | Field Operators (Grinding) | 4 per shift | 4 | 16 |
| | Field Operators (Flotation) | 4 per shift | 4 | 16 |
| | Field Operators (Thickening/Filter) | 3 per shift | 4 | 12 |
| | Field Operators (Tailings/Water) | 2 per shift | 4 | 8 |
| | Process Engineers | 2 day | 1 | 2 |
| | Metallurgists | 2 day | 1 | 2 |
| | Lab Technicians | 2 per shift | 4 | 8 |
| **Operations Subtotal** | | | | **100** |
| **Maintenance** | | | | |
| | Maintenance Superintendent | 1 day | 1 | 1 |
| | Maintenance Supervisors | 3 per shift | 4 | 12 |
| | Maintenance Planners | 4 day | 1 | 4 |
| | Maintenance Scheduler | 1 day | 1 | 1 |
| | Mechanical Fitters | 8 per shift | 4 | 32 |
| | Welders/Boilermakers | 3 per shift | 4 | 12 |
| | Electricians | 4 per shift | 4 | 16 |
| | Instrument Technicians | 3 per shift | 4 | 12 |
| | PdM Technicians (vibration, oil, thermo) | 3 day | 1 | 3 |
| | Lubrication Technicians | 2 day | 2 | 4 |
| | Reliability Engineer | 1 day | 1 | 1 |
| | CMMS Administrator | 1 day | 1 | 1 |
| **Maintenance Subtotal** | | | | **99** |
| **HSE** | | | | |
| | HSE Manager | 1 day | 1 | 1 |
| | HSE Coordinators | 1 per shift | 4 | 4 |
| | Paramedics | 1 per shift | 4 | 4 |
| | Environmental Technicians | 2 day | 1 | 2 |
| **HSE Subtotal** | | | | **11** |
| **Support** | | | | |
| | Warehouse Staff | 2 per shift | 4 | 8 |
| | Training Coordinator | 1 day | 1 | 1 |
| | Admin/Clerical | 3 day | 1 | 3 |
| | IT Support | 1 day | 1 | 1 |
| **Support Subtotal** | | | | **13** |
| **TOTAL PERMANENT** | | | | **223** |
| **Contractor (est. 28%)** | | | | **87** |
| **TOTAL SITE** | | | | **310** |

**Key Metrics**:
- Maintenance FTEs per 100 equipment items: 11.6 (benchmark: 6-15, 2nd quartile)
- Operations FTEs per 10,000 tpd: 8.3 (benchmark: 5-12, 2nd quartile)
- Total FTE per $B CAPEX: 310 per $4.5B = 69 (adjusted for Chilean productivity)
- Estimated annual labor cost: $52M USD (fully loaded) = $1.43 per tonne processed

### Example 2: Shift Pattern Comparison

**Scenario**: Comparing 7x7 vs. 4x3 vs. 10x10 for a remote mining site (4,000 masl)

| Parameter | 7x7 | 4x3 | 10x10 |
|-----------|-----|-----|-------|
| Cycle length | 14 days | 7 days | 20 days |
| Hours per cycle | 84 (7x12) | 48 (4x12) | 120 (10x12) |
| Crews for 24/7 | 4 (2 on, 2 off) | 4 (complex pattern) | 4 (2 on, 2 off) |
| Annual hours worked | ~2,184 | ~2,256 | ~2,190 |
| Night shifts per cycle | 3.5 average | 2 average | 5 average |
| Chilean labor law | Compliant (Art. 38) | Compliant (Art. 38) | Compliant (Art. 38) |
| Fatigue risk (at 4,000m) | Moderate-High | Moderate | High |
| FIFO compatibility | Excellent | Poor (too short) | Excellent |
| FTE impact (example 20 positions) | 80 FTE | 80 FTE | 80 FTE |
| Travel cost impact | Medium | High (frequent) | Low (less frequent) |
| **RECOMMENDATION** | **PREFERRED** | Not recommended at altitude | Alternative for critical roles |

**Rationale**: 7x7 provides the best balance of FIFO logistics, fatigue management at altitude, and regulatory compliance. The 4x3 pattern, while legally compliant, creates excessive travel frequency for remote sites and is operationally complex. The 10x10 pattern raises fatigue concerns at 4,000 masl due to the extended 10-day cycle at altitude.
