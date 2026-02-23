# Create Shutdown Plan
## Skill ID: A-SHUTDOWN-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Generate a comprehensive plant shutdown (parada de planta) plan that covers all aspects of planned maintenance shutdowns, including scope definition, scheduling, resource planning, work packaging, safety management, and startup sequencing. This skill transforms maintenance needs, production schedules, and equipment criticality data into actionable shutdown plans with Gantt-style schedules and detailed narrative documentation.

Planned shutdowns are the single most intensive and high-risk maintenance events in a plant's operating calendar. They involve hundreds of concurrent work activities, large contractor workforces, compressed timelines, and significant production loss. A poorly planned shutdown leads to scope creep, schedule overruns, safety incidents, and extended downtime costing millions in lost production. This skill ensures that shutdown planning follows industry best practices, with rigorous scope control, optimized scheduling, and integrated safety management.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Shutdown Life Cycle**: The plan must cover the complete shutdown life cycle:
   - **Initiation** (12-18 months prior): Scope identification, budget estimation, strategic alignment
   - **Planning** (6-12 months prior): Detailed work packaging, scheduling, resource planning, procurement
   - **Preparation** (3-6 months prior): Contractor mobilization, material staging, pre-shutdown work
   - **Execution** (shutdown window): Systematic equipment isolation, work execution, quality verification
   - **Startup** (post-execution): Systematic restart, commissioning verification, performance validation
   - **Close-out** (post-startup): Lessons learned, cost analysis, documentation

2. **Work Package Structure**: All shutdown work must be organized into discrete work packages with defined scope, resources, duration, safety requirements, and quality criteria. Each work package must be linked to specific equipment and assigned to responsible teams.

3. **Critical Path Optimization**: The shutdown schedule must identify and optimize the critical path to minimize total shutdown duration. Parallel activities, resource leveling, and logic-driven sequencing are essential.

4. **Safety Integration**: Shutdown activities involve the highest concentration of simultaneous risk in plant operations. Isolation management, confined space entry, hot work, working at height, heavy lifts, and hazardous material handling must all be planned and controlled.

5. **Production Impact Minimization**: The plan must consider production targets and minimize the impact on annual production by optimizing shutdown timing, duration, and scope.

## Trigger / Invocation

```
/create-shutdown-plan
```

**Aliases**: `/shutdown-plan`, `/turnaround-plan`, `/parada-planta`, `/plant-shutdown`

**Trigger Conditions**:
- User provides maintenance scope for a planned shutdown
- User requests turnaround/shutdown planning
- Annual maintenance calendar indicates upcoming shutdown
- Equipment condition assessment triggers a shutdown requirement
- Regulatory inspection requires equipment to be taken offline

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Maintenance Work Scope | .xlsx, .docx | List of maintenance tasks, inspections, and modifications to be performed during the shutdown. Must include: equipment tag, work description, estimated duration |
| Production Schedule | .xlsx | Annual production plan showing production targets, planned maintenance windows, and scheduling constraints |
| Equipment Criticality Data | .xlsx | Equipment criticality ratings (A/B/C) from asset register or RCM analysis |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Asset Register | .xlsx | From `create-asset-register` -- complete equipment list with FLOC hierarchy |
| Maintenance Strategy | .xlsx, .docx | From `create-maintenance-strategy` -- PM/PdM task schedules, RCM outputs |
| Spare Parts Availability | .xlsx | From `create-spare-parts-strategy` -- spare parts inventory and lead times |
| Historical Shutdown Data | .xlsx | Previous shutdown performance data (durations, costs, issues) |
| Contractor Resource Pool | .xlsx | Available contractor resources, rates, and mobilization requirements |
| Equipment Condition Reports | .xlsx, .pdf | Current equipment condition and defect backlog |
| P&IDs | .pdf | For isolation planning and scope validation |
| Risk Assessment | .xlsx | From `create-risk-assessment` -- shutdown-specific risks |
| Budget Constraints | .docx, .xlsx | Available budget and spending authority limits |
| Regulatory Requirements | .docx | Statutory inspections due during the shutdown window |

### Input Validation Rules

- Work scope items without estimated durations are assigned default durations based on work type
- Equipment without criticality ratings defaults to "B" with a review flag
- Production schedule must include the proposed shutdown window dates
- Work items without equipment tags are flagged for scope clarity
- Total estimated work hours are validated against available resource capacity

## Output Specification

### Primary Output 1: Shutdown Schedule (.xlsx)

**Filename**: `{ProjectCode}_Shutdown_Schedule_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Master Schedule (Gantt)"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | WP_ID | Work Package ID | WP-001 |
| B | Activity_ID | Activity identifier | WP-001-ACT-01 |
| C | WBS_Level | WBS hierarchy level | 3.1.2 |
| D | Area | Plant area | Area 100 - Grinding |
| E | Equipment_Tag | Equipment tag number | 100-ML-001 |
| F | Equipment_Description | Equipment description | SAG Mill |
| G | Activity_Description | Work description | Replace SAG mill liners |
| H | Activity_Description_ES | Spanish description | Reemplazo revestimientos molino SAG |
| I | Work_Type | Category of work | Mechanical - Liner Replacement |
| J | Discipline | Discipline | Mechanical |
| K | Predecessor | Predecessor activity IDs | WP-001-ACT-00 (Isolation complete) |
| L | Successor | Successor activities | WP-001-ACT-02 |
| M | Duration_Hours | Duration in hours | 72 |
| N | Duration_Days | Duration in days (shift-adjusted) | 3.0 |
| O | Planned_Start | Planned start date/time | 2026-09-15 06:00 |
| P | Planned_Finish | Planned finish date/time | 2026-09-18 06:00 |
| Q | Actual_Start | Actual start (tracking) | |
| R | Actual_Finish | Actual finish (tracking) | |
| S | Float_Hours | Float in hours | 0 |
| T | Critical_Path | On critical path? | Yes |
| U | Crew_Size | Number of workers | 12 |
| V | Craft_Type | Craft/trade required | Millwrights, Riggers |
| W | Contractor | Responsible contractor | Contratista Alpha |
| X | Shift_Pattern | Shift arrangement | 2x12 (day/night) |
| Y | Heavy_Lift | Heavy lift required? | Yes - 45 ton |
| Z | Confined_Space | Confined space entry? | Yes |
| AA | Hot_Work | Hot work required? | No |
| AB | Height_Work | Working at height? | Yes - 8m |
| AC | Isolation_Required | Isolation requirements | Full mechanical + electrical |
| AD | Permit_Type | Permit to work type | Confined Space + Height |
| AE | Quality_Hold | Quality hold/witness point | Liner gap measurements |
| AF | Spare_Parts_Required | Key spare parts | 120x liner segments, bolts |
| AG | Special_Tools | Special tools/equipment | 45-ton crane, liner handler |
| AH | Completion_Criteria | How to confirm completion | All liners installed, torqued, gapped |
| AI | Status | Not Started/In Progress/Complete | Not Started |
| AJ | Notes | Additional notes | Vendor rep required on-site |

#### Sheet 2: "Critical Path Analysis"
- List of all critical path activities with sequence
- Critical path duration summary
- Float analysis for near-critical paths (float < 8 hours)
- Schedule risk items (activities with high uncertainty)
- Opportunities for critical path reduction

#### Sheet 3: "Isolation Plan"
Equipment isolation schedule:

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Isolation_ID | Isolation package identifier |
| B | Equipment_Tags | Equipment included in isolation |
| C | Isolation_Type | Mechanical/Electrical/Process/Full |
| D | Isolation_Points | Specific isolation points (valves, breakers) |
| E | LOTO_Requirements | Lock-Out/Tag-Out details |
| F | Isolation_Authority | Who authorizes isolation |
| G | Planned_Isolation_Time | When isolation applied |
| H | Planned_De-isolation_Time | When isolation removed |
| I | Dependent_Work_Packages | Work packages requiring this isolation |
| J | Energy_Sources | Hazardous energy sources isolated |
| K | Verification_Method | How isolation is verified |

#### Sheet 4: "Resource Loading"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Date | Calendar date |
| B-Z | Resource by craft/trade | Headcount per day by craft type |
| AA | Total_Headcount | Total daily headcount |
| AB | Contractor_Split | Internal vs. contractor breakdown |

Plus: Resource loading histogram (daily headcount by craft), peak resource identification, resource leveling opportunities.

#### Sheet 5: "Material Staging Plan"
- Spare parts and materials required per work package
- Required on-site date (pre-shutdown staging date)
- Current availability status
- Procurement actions required
- Staging area assignment

#### Sheet 6: "Startup Sequence"
Post-shutdown startup plan:
- Systematic de-isolation sequence
- Pre-startup checks per system
- Utility restoration sequence
- Equipment restart sequence (following process logic)
- Performance verification activities
- Production ramp-up milestones

#### Sheet 7: "Risk Register - Shutdown Specific"
Shutdown-specific risk register:
- Schedule overrun risks
- Safety risks during execution
- Resource availability risks
- Weather/external risks
- Material/spare parts risks
- Scope change risks
- Startup/restart risks

#### Sheet 8: "Cost Estimate"
Shutdown cost breakdown:
- Direct labor costs (internal + contractor)
- Material and spare parts costs
- Equipment rental costs (cranes, scaffolding, etc.)
- Consumables and supplies
- Vendor specialist costs
- Contingency (typically 10-15%)
- Lost production cost estimate
- Total shutdown cost

#### Sheet 9: "KPI Dashboard"
Shutdown performance metrics:
- Planned vs. actual duration
- Schedule compliance (% activities on time)
- Safety statistics (incidents, near misses, observations)
- Scope completion (% planned scope completed)
- Cost compliance (actual vs. budget)
- Work quality (rework percentage)
- Startup success (first-pass vs. re-starts required)

### Primary Output 2: Shutdown Plan Narrative (.docx)

**Filename**: `{ProjectCode}_Shutdown_Plan_v{version}_{date}.docx`

**Document Structure (25-45 pages)**:

1. **Executive Summary** (2-3 pages)
   - Shutdown purpose and strategic justification
   - Scope summary and key work packages
   - Timeline and key milestones
   - Budget overview
   - Key risks and mitigations

2. **Shutdown Strategy** (3-4 pages)
   - Shutdown philosophy and objectives
   - Production impact analysis
   - Shutdown timing justification
   - Duration target and optimization approach
   - Relationship to annual maintenance plan

3. **Scope Definition** (4-6 pages)
   - Detailed work scope by area/system
   - Work categorization (must-do, should-do, opportunity)
   - Scope exclusions and deferrals
   - Scope freeze date and change management
   - Regulatory/statutory inspection scope

4. **Organization & Responsibilities** (3-4 pages)
   - Shutdown management team structure
   - RACI matrix for key decisions
   - Contractor management approach
   - Shift patterns and supervision
   - Communication plan (briefings, status updates)

5. **Safety Management** (4-5 pages)
   - Shutdown safety philosophy
   - Hazard identification and risk assessment summary
   - Isolation management plan
   - Permit-to-Work requirements
   - Confined space management
   - Hot work management
   - Working at height controls
   - Heavy lift management
   - Emergency response during shutdown
   - Safety KPI targets

6. **Schedule Overview** (3-4 pages)
   - Level 2 schedule summary with milestones
   - Critical path description
   - Schedule contingency and recovery strategies
   - Key constraints and dependencies
   - Weather contingency plan

7. **Resource Plan** (3-4 pages)
   - Internal workforce deployment
   - Contractor mobilization plan
   - Peak resource requirements
   - Resource loading profile
   - Accommodation and logistics (if remote site)
   - Tool and equipment requirements

8. **Material & Procurement** (2-3 pages)
   - Critical materials and spare parts list
   - Procurement status and lead times
   - Material staging plan
   - Warehousing during shutdown
   - Surplus material management

9. **Quality Management** (2-3 pages)
   - Quality standards and acceptance criteria
   - Inspection and test plans (ITPs)
   - Hold and witness points
   - Documentation requirements
   - Non-conformance management

10. **Startup Plan** (3-4 pages)
    - Startup readiness criteria
    - De-isolation sequence
    - Pre-startup inspections
    - Equipment restart sequence
    - Performance verification
    - Production ramp-up targets

11. **Budget & Cost Control** (2-3 pages)
    - Budget breakdown
    - Cost tracking methodology
    - Change order management
    - Financial reporting requirements

12. **Appendices**
    - Work package summaries
    - Isolation plan details
    - Scaffold plan
    - Crane and heavy lift plan
    - Emergency response plan
    - Communication and escalation matrix
    - Lessons learned from previous shutdowns

### Formatting Standards
- Schedule: Gantt bars with color coding by discipline (Mechanical=Blue, Electrical=Yellow, Instrumentation=Green, Civil=Brown, Piping=Orange)
- Critical path: Bold red Gantt bars
- Milestones: Diamond markers in black
- Resource histograms: Stacked bar charts by craft type
- Header row: Bold, dark red background (#990000), white font
- Status colors: Not Started=Gray, In Progress=Blue, Complete=Green, Delayed=Red, On Hold=Yellow

## Methodology & Standards

### Primary Standards
- **EN 13306:2017** - Maintenance terminology (defines shutdown, overhaul, turnaround concepts).
- **ISO 55001:2014** - Asset management system requirements (lifecycle maintenance planning).
- **API 510/570/653** - Pressure vessel, piping, and tank inspection standards (statutory inspection scope).

### Shutdown Management Frameworks
- **T.A. Cook Turnaround Management** - Industry best practice framework for shutdown/turnaround planning.
- **SMRP Best Practice 4.3** - Shutdown, Turnaround, Outage Management.
- **CII (Construction Industry Institute)** - Turnaround planning and scheduling best practices.

### Safety Standards
- **OSHA 29 CFR 1910.147** - Control of Hazardous Energy (LOTO).
- **OSHA 29 CFR 1910.146** - Permit-Required Confined Spaces.
- **NFPA 51B** - Standard for Fire Prevention During Welding, Cutting, and Other Hot Work.
- **ASME B30.5** - Mobile and Locomotive Cranes (heavy lift planning).

### Scheduling Standards
- **PMI PMBOK** - Project Management Body of Knowledge (scheduling, resource management).
- **AACE International** - Recommended practices for scheduling and cost estimation.
- **Critical Path Method (CPM)** - Standard scheduling methodology.

### Chilean Standards
- **DS 132** - Mining safety regulation (shutdown safety requirements).
- **DS 594** - Workplace health and safety conditions.
- **NCh 349** - Safety provisions in demolition (applicable to decommissioning scope).

### VSC-Specific Standards
- VSC Shutdown Management Procedure v2.0
- VSC Isolation Management Standard v3.0
- VSC Contractor Safety Management Guide v2.5

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** All shutdown scope items linked to equipment failure modes MUST reference failure modes exclusively from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No ad-hoc or free-text failure mode descriptions are permitted in shutdown scope justifications or work package definitions.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. When shutdown work scope is driven by failure mode analysis (RCM/FMECA), the referenced failure mode MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component or equipment addressed in the shutdown scope | SAG Mill Liner |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Wears |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Abrasive media (ore particles) |

**Complete failure mode definition:** *"SAG Mill Liner Wears due to Abrasive media (ore particles)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in shutdown scope definitions, work package justifications, and risk assessments MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for Shutdown Plans

1. **Scope Definition — Failure Mode Justification:** Every "Must-Do" and "Should-Do" shutdown work item driven by an equipment failure mode MUST include a `FM_Reference` field linking it to the specific failure mode from the VSC Failure Modes Table, using the format "[Mechanism] due to [Cause]".
2. **Work Package Development (Step 4):** Each work package scope description MUST reference the failure mode(s) being addressed, using standardized nomenclature from the table.
3. **Risk Register (Sheet 7):** Technical risks related to equipment failure during or after shutdown MUST reference specific failure modes from the table rather than generic descriptions.
4. **No Ad-Hoc Descriptions:** Scope justifications such as "pump is worn", "vessel corroded", or "motor overheating" are NOT acceptable. Use the standardized form: "Wears due to [Cause]", "Corrodes due to [Cause]", "Overheats/Melts due to [Cause]", etc.
5. **FMECA Cross-Reference:** Shutdown scope items originating from the maintenance strategy MUST cross-reference the specific FMECA failure mode row that generated the scope requirement.
6. **Consistency with Maintenance Strategy:** Failure mode descriptions in the shutdown plan MUST be identical to those in the upstream FMECA workbook and maintenance strategy — no paraphrasing or abbreviation.

## Step-by-Step Execution

### Phase 1: Scope & Strategy (Steps 1-3)

**Step 1: Analyze Shutdown Scope**
- Ingest maintenance work scope list
- Categorize work by type:
  - **Must-Do**: Safety-critical, regulatory, equipment at risk of failure
  - **Should-Do**: Reliability improvement, condition-based interventions
  - **Opportunity**: Can be done if time/budget allows
- Link each work item to equipment tag and system
- Import equipment criticality from asset register
- Flag items without clear scope definitions

**Step 2: Production Impact Assessment**
- Analyze production schedule constraints
- Calculate production loss per day of shutdown (by area if phased)
- Evaluate phased shutdown options vs. full plant shutdown
- Identify opportunities for partial operation during shutdown
- Recommend optimal shutdown window and duration target

**Step 3: Define Shutdown Strategy**
- Determine shutdown type: full shutdown vs. phased/rolling shutdown
- Set duration target based on critical path analysis
- Define shift patterns (12-hour shifts, 24/7 operation typical for shutdowns)
- Establish scope freeze date and change management process
- Set budget target based on work scope and resource estimates

### Phase 2: Work Package Development (Steps 4-6)

**Step 4: Create Work Packages**
For each scope item, develop a work package containing:
- Work Package ID and description
- Equipment tag and system
- Detailed task steps
- Estimated duration (hours and crew)
- Required crafts/trades
- Material and spare parts list
- Special tools and equipment
- Isolation requirements
- Safety requirements (permits, PPE, procedures)
- Quality requirements (ITPs, hold points)
- Predecessor and successor work packages

**Step 5: Develop Isolation Plan**
- Map all isolation requirements from work packages
- Group work packages by common isolation boundaries
- Optimize isolation packages to minimize isolation/de-isolation events
- Define isolation sequence and de-isolation sequence
- Identify complex isolations requiring engineering review
- Create LOTO schedules with lock assignments

**Step 6: Develop Resource Plan**
- Calculate total resource requirements by craft/trade
- Identify peak resource requirements and timing
- Compare requirements to available resources (internal + contractor)
- Level resources to reduce peaks where possible without extending critical path
- Plan contractor mobilization and demobilization
- Identify specialist resource needs (vendor reps, inspectors, NDE technicians)

### Phase 3: Schedule Development (Steps 7-8)

**Step 7: Build Shutdown Schedule**
- Assign activity durations based on work package estimates
- Link activities with logical predecessors/successors:
  - Start-to-Start (SS): Parallel activities
  - Finish-to-Start (FS): Sequential activities
  - Constraints: Isolation dependencies, crane availability, confined space limits
- Calculate critical path
- Identify near-critical paths (float < 8 hours)
- Apply resource constraints and level
- Validate total duration against target
- Identify schedule optimization opportunities

**Step 8: Develop Startup Sequence**
- Define startup readiness criteria per system
- Plan systematic de-isolation sequence (reverse of shutdown sequence)
- Schedule pre-startup inspections and commissioning checks
- Define equipment restart sequence following process logic
- Plan performance verification activities
- Set production ramp-up milestones post-startup
- Identify startup risks and contingencies

### Phase 4: Risk & Safety Planning (Steps 9-10)

**Step 9: Shutdown Risk Assessment**
Identify and assess shutdown-specific risks:
- Schedule risks: Critical path delays, scope additions, weather
- Safety risks: Simultaneous operations, confined space, heavy lifts
- Resource risks: Labor shortages, key personnel unavailability
- Material risks: Late delivery, wrong parts, damage
- Technical risks: Unknown conditions discovered during shutdown
- Startup risks: Failed re-commissioning, equipment damage during work

For each risk, define:
- Risk description and trigger
- Likelihood and consequence
- Mitigation measures
- Contingency plans
- Risk owner

**Step 10: Safety Plan Development**
- Develop permit-to-work matrix for all work types
- Plan confined space entries with rescue provisions
- Plan hot work areas with fire watch requirements
- Develop heavy lift plans with engineered lift studies
- Plan scaffolding erection sequence
- Define maximum simultaneous workforce limits per area
- Plan safety briefings and toolbox talks schedule
- Set safety KPI targets (zero harm, observations target)

### Phase 5: Output Generation (Steps 11-12)

**Step 11: Generate Schedule Workbook**
- Create master schedule with all activities, links, and Gantt representation
- Generate critical path analysis sheet
- Create isolation plan with sequence and timing
- Build resource loading histograms
- Create material staging plan
- Develop startup sequence schedule
- Compile risk register
- Generate cost estimate
- Set up KPI dashboard

**Step 12: Generate Plan Narrative**
- Write shutdown plan document following the specified structure
- Include schedule summary graphics
- Include resource loading profiles
- Document safety management approach
- Present budget and cost control approach
- Prepare executive summary for management approval

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Work scope coverage (all items in schedule) | 100% | 100% |
| Activity predecessor/successor linkage | 100% | >95% |
| Isolation plan coverage | 100% of work requiring isolation | 100% |
| Resource loading vs. availability | <100% peak utilization | <110% with contingency |
| Safety requirements per activity | 100% identified | >95% |
| Material staging plan coverage | 100% of long-lead items | >90% |
| Cost estimate accuracy | +/-10% | +/-20% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Critical Path Realism**: Critical path duration must be achievable based on historical benchmarks for similar work. Aggressive compression must be flagged.
- **Safety First**: No activity should be scheduled without its safety requirements fully defined. Isolation must precede all work on energized/pressurized equipment.
- **Resource Feasibility**: Peak headcount must not exceed safe working limits for the plant/area. Craft availability must be validated.
- **Scope Completeness**: Every "must-do" item must be in the schedule. Deferred items must have documented justification.
- **Startup Robustness**: Startup sequence must follow process logic. Pre-startup checks must be comprehensive.

### Validation Process
1. Scope completeness check (all must-do items scheduled)
2. Schedule logic validation (no circular dependencies, correct sequences)
3. Critical path feasibility review
4. Resource loading vs. availability check
5. Isolation plan completeness
6. Safety requirements completeness
7. Material availability vs. required dates
8. Cost estimate reasonableness check
9. Final quality score calculation

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment data | Provides equipment list, system groupings, and criticality for scope definition |
| `create-maintenance-strategy` | Maintenance tasks | Provides PM/PdM tasks that drive shutdown scope |
| `create-spare-parts-strategy` | Spare parts availability | Confirms spare parts are available for shutdown work |
| `create-risk-assessment` | Risk data | Provides operational risk assessment inputs for shutdown risk planning |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-rampup-plan` | Post-shutdown ramp-up | Ramp-up plan may follow shutdown restart |
| `create-kpi-dashboard` | Shutdown KPIs | Performance metrics for shutdown tracking |
| `create-or-framework` | Shutdown governance | Shutdown planning integrates into OR governance |
| Procurement Agent | Purchase orders | Material procurement plan drives purchasing actions |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-commissioning-plan` | Re-commissioning | Post-shutdown restart may require commissioning-type activities |
| `create-or-playbook` | Maintenance domain | Shutdown planning is a key component of the OR maintenance domain |

## Templates & References

### Templates
- `templates/shutdown_schedule_template.xlsx` - Blank schedule template with all sheets
- `templates/work_package_template.xlsx` - Individual work package template
- `templates/isolation_plan_template.xlsx` - Isolation planning template
- `templates/shutdown_plan_template.docx` - Plan narrative template with VSC branding
- `templates/shutdown_risk_register_template.xlsx` - Shutdown risk register template
- `templates/shutdown_kpi_template.xlsx` - KPI dashboard template

### Reference Documents
- T.A. Cook Turnaround Management Best Practices
- SMRP Best Practice 4.3 - Shutdown Management
- API 510/570/653 - Inspection standards for statutory work
- VSC Shutdown Management Procedure v2.0
- VSC Isolation Management Standard v3.0

### Reference Datasets
- Standard activity durations by work type and equipment size
- Resource loading benchmarks for typical shutdown scopes
- Typical shutdown cost benchmarks ($/equipment, $/day)
- Safety statistics benchmarks for industrial shutdowns
- Standard isolation templates by equipment type

## Examples

### Example Master Schedule Entries

```
SHUTDOWN SCHEDULE - PROJECT ALPHA - ANNUAL MAJOR SHUTDOWN 2026
Duration Target: 14 days | Shift Pattern: 2x12 (24/7)
Start: 2026-09-15 06:00 | Target Finish: 2026-09-29 06:00

| WP_ID  | Activity_ID    | Description                         | Duration | Start     | Finish    | CP  | Crew | Discipline |
|--------|----------------|-------------------------------------|----------|-----------|-----------|-----|------|------------|
| WP-000 | WP-000-ACT-01  | Plant shutdown & de-inventory       | 12 hrs   | Sep 15 06 | Sep 15 18 | YES | 20   | Operations |
| WP-000 | WP-000-ACT-02  | System isolations - Area 100        | 8 hrs    | Sep 15 18 | Sep 16 02 | YES | 15   | Operations |
| WP-001 | WP-001-ACT-01  | SAG Mill: Entry & inspection        | 6 hrs    | Sep 16 06 | Sep 16 12 | YES | 8    | Mechanical |
| WP-001 | WP-001-ACT-02  | SAG Mill: Liner removal             | 48 hrs   | Sep 16 12 | Sep 18 12 | YES | 16   | Mechanical |
| WP-001 | WP-001-ACT-03  | SAG Mill: Liner installation        | 60 hrs   | Sep 18 12 | Sep 21 00 | YES | 16   | Mechanical |
| WP-001 | WP-001-ACT-04  | SAG Mill: Close-up & bolt torque    | 12 hrs   | Sep 21 00 | Sep 21 12 | YES | 12   | Mechanical |
| WP-002 | WP-002-ACT-01  | Ball Mill: Entry & inspection       | 6 hrs    | Sep 16 06 | Sep 16 12 | NO  | 8    | Mechanical |
| WP-002 | WP-002-ACT-02  | Ball Mill: Liner replacement        | 72 hrs   | Sep 16 12 | Sep 19 12 | NO  | 14   | Mechanical |
| WP-003 | WP-003-ACT-01  | Pump 100-PP-001: Overhaul           | 24 hrs   | Sep 16 06 | Sep 17 06 | NO  | 4    | Mechanical |
| WP-004 | WP-004-ACT-01  | HV Switchgear: Annual inspection    | 16 hrs   | Sep 16 06 | Sep 16 22 | NO  | 6    | Electrical |
| WP-005 | WP-005-ACT-01  | Flotation cells: Internal inspect.  | 36 hrs   | Sep 16 06 | Sep 17 18 | NO  | 10   | Mechanical |
| WP-099 | WP-099-ACT-01  | De-isolation - Area 100             | 8 hrs    | Sep 27 06 | Sep 27 14 | YES | 15   | Operations |
| WP-099 | WP-099-ACT-02  | Pre-startup checks                  | 12 hrs   | Sep 27 14 | Sep 28 02 | YES | 20   | Multi-disc |
| WP-099 | WP-099-ACT-03  | Startup & ramp-up                   | 24 hrs   | Sep 28 02 | Sep 29 02 | YES | 25   | Operations |

CRITICAL PATH: Shutdown --> Area 100 Isolation --> SAG Mill Liner Work (126 hrs) --> Close-up --> De-isolation --> Startup
CRITICAL PATH DURATION: 312 hours (13.0 days) -- WITHIN TARGET
TOTAL WORK PACKAGES: 45
TOTAL ACTIVITIES: 287
PEAK HEADCOUNT: 185 (Day 3, Sep 17)
```

### Example Resource Loading Summary

```
RESOURCE LOADING HISTOGRAM (daily headcount by craft)
======================================================
                     Sep 15 | Sep 16 | Sep 17 | Sep 18 | Sep 19 | ... | Sep 28 | Sep 29
Millwrights:           10   |   45   |   52   |   48   |   40   |     |   15   |    5
Pipefitters:            5   |   20   |   25   |   22   |   18   |     |    8   |    3
Electricians:           8   |   18   |   15   |   12   |   10   |     |   12   |    5
Instrument Techs:       3   |   10   |   12   |   10   |    8   |     |    8   |    4
Riggers:                5   |   15   |   18   |   15   |   12   |     |    5   |    2
Welders:                0   |   12   |   15   |   12   |    8   |     |    3   |    0
Scaffolders:           10   |   15   |   10   |    8   |    8   |     |    5   |    0
Operations:            20   |   15   |   12   |   12   |   12   |     |   20   |   15
Supervisors:            8   |   12   |   12   |   12   |   12   |     |   10   |    5
Safety Officers:        4   |    6   |    8   |    6   |    6   |     |    4   |    2
---                  -----  | -----  | -----  | -----  | -----  |     | -----  | -----
TOTAL:                 73   |  168   |  179   |  157   |  134   |     |   90   |   41
                            |        | PEAK   |        |        |     |        |

COST SUMMARY:
  Direct Labor:        $1,250,000
  Materials/Spares:      $890,000
  Equipment Rental:      $320,000
  Vendor Specialists:    $180,000
  Consumables:            $95,000
  Contingency (12%):    $328,000
  ---------------------------------
  TOTAL SHUTDOWN COST: $3,063,000
  Lost Production:     $2,100,000 (14 days x $150,000/day)
  TOTAL COST IMPACT:   $5,163,000
```
