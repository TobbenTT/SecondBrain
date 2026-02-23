# Optimize PM Program
## Skill ID: MAINT-02
## Version: 1.0.0
## Category: Maintenance Intelligence (Agent 3)
## Priority: P1 - Critical

---

## Purpose

Systematically evaluate and optimize an existing preventive maintenance (PM) program to eliminate non-value-adding tasks, adjust frequencies based on reliability data, and convert time-based tasks to condition-based monitoring where technically feasible. This skill directly addresses the industry-wide problem that 30-50% of PM tasks add no value -- they neither prevent failures nor detect degradation (Pain SM-05, per EPRI and independent industry studies).

The cost of a bloated PM program is substantial. Every unnecessary PM task consumes craft labor (typically 2-6 hours per task execution), generates material costs, requires planning and scheduling effort, may introduce maintenance-induced failures (estimated at 10-15% of all failures per Nowlan & Heap's original RCM study), and takes equipment out of service unnecessarily. For a facility with 5,000 active PM tasks, eliminating 30% of non-value tasks saves 3,000-9,000 labor hours annually -- equivalent to 1.5-4.5 full-time technicians.

PM Optimization (PMO) is distinct from full RCM in that it works backwards from an existing program rather than building from scratch. It is faster (typically 40-60% less effort than classical RCM for the same scope), more practical for brownfield operations, and delivers immediate cost savings while maintaining or improving reliability.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Every PM Task Must Justify Its Existence**: Each task in the current program must trace to a specific failure mode, have a technically valid basis (CBM, time-based restoration, time-based discard, or failure-finding), and demonstrate that the cost of the task is less than the cost of the failure it prevents.

2. **PMO Classification Framework**: Every existing PM task must be classified into one of seven categories:
   - **Keep As-Is**: Task is valid, frequency is appropriate, no changes needed
   - **Modify Frequency**: Task is valid but frequency needs adjustment (increase or decrease) based on failure data
   - **Convert to CBM**: Task should be replaced by condition monitoring
   - **Combine/Consolidate**: Task should be merged with other tasks for efficiency
   - **Eliminate**: Task has no valid failure mode basis or is duplicated
   - **Add New Task**: Gap identified -- failure mode exists with no corresponding task
   - **Redesign Required**: Failure mode cannot be managed by maintenance; design change needed

3. **Data-Driven Frequency Optimization**: Where failure history exists, task frequencies must be validated against actual failure patterns using Weibull analysis. Time-based tasks are only justified for wear-out failure modes (Weibull beta > 1).

4. **PM Task Effectiveness Metrics**: The agent must calculate and report PM task effectiveness indicators:
   - Found-and-fixed ratio (tasks that actually found and corrected a developing failure)
   - No-defect-found ratio (tasks completed with no findings -- candidates for elimination or frequency reduction)
   - Failure rate between PMs (failures occurring between scheduled PMs -- indicates frequency too long or wrong task)

5. **Maintenance-Induced Failure Prevention**: Identify PM tasks that involve intrusive activities (opening equipment, replacing components in good condition) that risk introducing new failure modes. Evaluate whether less intrusive alternatives exist.

6. **Language**: Spanish (Latin American) for deliverables, English technical terms preserved.

---

## Trigger / Invocation

```
/optimize-pm-program
```

### Natural Language Triggers
- "Review and optimize our PM program"
- "Identify PM tasks we can eliminate"
- "Our PM compliance is low because we have too many tasks"
- "Evaluate PM task effectiveness"
- "Optimizar programa de mantenimiento preventivo"
- "Revisar tareas PM que no agregan valor"
- "Reducir carga de mantenimiento preventivo"

### Aliases
- `/pm-optimization`
- `/pmo-analysis`
- `/pm-rationalization`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `pm_task_list` | Complete list of active PM tasks with descriptions, frequencies, craft, estimated duration, and associated equipment | .xlsx / CMMS export | CMMS (mcp-cmms) |
| `equipment_register` | Equipment hierarchy with tag numbers and criticality ratings | .xlsx | CMMS / Client |
| `work_order_history` | Completed PM work orders for minimum 12 months (24+ months preferred) with findings, actions taken, and time spent | .xlsx / CMMS export | CMMS (mcp-cmms) |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `failure_history` | Corrective/breakdown work orders with failure modes and downtime | Analyze PM tasks without failure correlation |
| `pm_procedures` | Detailed PM procedures/job plans showing specific steps | Evaluate based on task descriptions only |
| `reliability_data` | Weibull parameters or MTBF data by equipment type | Calculate from failure history or use generic data |
| `cmms_task_codes` | Task type coding (PM, PdM, CM, Inspection) | Classify from descriptions |
| `craft_labor_rates` | Hourly labor cost by craft/trade | Industry average rates applied |
| `downtime_costs` | Production loss cost per hour by system | Exclude from cost-benefit where unavailable |
| `cbm_capabilities` | Current CBM technologies available on site | Assume basic vibration, thermography, oil analysis capability |
| `regulatory_pm_tasks` | Tasks mandated by regulation (not subject to elimination) | Flag all regulatory/statutory tasks as protected |

### Data Quality Requirements

- PM task list must include: unique task ID, equipment tag, task description, frequency, craft, estimated hours
- Work order history should include: completion date, actual hours, findings/comments, parts used
- Minimum 12 months of work order history for statistical significance
- Equipment criticality ratings required for risk-based prioritization of optimization effort

---

## Output Specification

### Deliverable 1: PM Optimization Report (.docx)

**Filename**: `{ProjectCode}_PM_Optimization_Report_v{Version}_{YYYYMMDD}.docx`

**Structure**:
1. Executive Summary (2-3 pages)
   - Current PM program statistics (total tasks, annual hours, estimated cost)
   - PMO findings summary (% to keep, modify, convert, eliminate, add)
   - Estimated savings (labor hours, cost, improved compliance)
   - Top 10 quick-win recommendations
2. Methodology (2-3 pages)
3. Current State Analysis (5-8 pages)
   - PM task inventory by system, craft, frequency
   - PM compliance trends and analysis
   - PM task effectiveness analysis (found-and-fixed, no-defect-found ratios)
   - Failure-between-PM analysis
   - Maintenance-induced failure identification
4. PMO Results by System (10-20 pages)
   - For each system: task-by-task analysis and recommendation
5. CBM Conversion Opportunities (3-5 pages)
6. New Tasks Required (2-3 pages)
7. Implementation Plan (2-3 pages)
8. Appendices

### Deliverable 2: PM Optimization Workbook (.xlsx)

**Filename**: `{ProjectCode}_PM_Optimization_Workbook_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

| Sheet | Content |
|-------|---------|
| `Summary Dashboard` | KPIs: tasks analyzed, keep/modify/convert/eliminate/add counts, hours saved, cost impact |
| `Task Analysis` | Every PM task with: current state, failure mode linkage, effectiveness data, PMO classification, recommendation, justification |
| `Frequency Optimization` | Tasks with frequency change: current vs. recommended frequency, reliability basis |
| `CBM Conversions` | Tasks to convert from time-based to condition-based: technology, measurement points, thresholds |
| `Tasks to Eliminate` | Tasks recommended for deletion with full justification |
| `New Tasks` | Gap-identified tasks to add with full specification |
| `Cost-Benefit Analysis` | Task-by-task and program-level cost-benefit of optimization |
| `Implementation Plan` | Phased rollout with CMMS change requirements |

---

## Methodology & Standards

### PM Optimization (PMO) Process

PMO follows a structured evaluation of each existing PM task against these criteria:

1. **Failure Mode Linkage**: Can the task be linked to a specific, documented failure mode? If no failure mode exists, the task is a candidate for elimination.

2. **Technical Validity**: Is the task technically capable of detecting or preventing the failure mode it addresses?
   - Time-based replacement: Only valid for wear-out failures (Weibull beta > 1.0)
   - Time-based inspection: Must be able to detect degradation before functional failure
   - Condition monitoring: Detectable P-F curve must exist with P-F interval > monitoring interval
   - Failure-finding test: For hidden functions, test must verify function operability

3. **Worth Doing**: Does the cost of performing the task (labor + materials + downtime + risk of maintenance-induced failure) remain less than the expected cost of the failure it prevents (repair + downtime + safety + environmental)?

4. **Frequency Justification**: Is the task frequency based on:
   - Reliability data (Weibull-derived interval)?
   - P-F interval analysis (CBM frequency = P-F interval / 2 or /3)?
   - Regulatory requirement?
   - OEM recommendation validated by operating experience?
   - Or is it arbitrary ("we've always done it monthly")?

### PM Task Effectiveness Metrics

| Metric | Formula | Target | Interpretation |
|--------|---------|--------|----------------|
| **Found-and-Fixed Ratio** | Tasks with corrective findings / Total task executions | >30% | Tasks that actually detected developing failures |
| **No-Defect-Found Ratio** | Tasks with "no defects" / Total task executions | <50% | High ratio = task may not be needed or frequency too high |
| **Failure Between PMs** | Failures on PM-covered equipment between PM executions | <10% of PMs | High ratio = wrong task or frequency too long |
| **PM Compliance** | PMs completed on time / PMs scheduled | >90% | Low compliance often indicates program overload |
| **PM-to-CM Ratio** | PM work orders / (PM + CM work orders) | 70-80% | Balance of preventive to corrective work |
| **Maintenance-Induced Failure Rate** | Failures within 72 hrs of PM / Total PMs on that equipment | <5% | Tasks causing more harm than good |

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** Every failure mode linkage in PM optimization — whether validating existing PM tasks against failure modes or identifying new failure mode gaps — MUST use the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted. Consistent failure mode linkage is the foundation of PM task justification.

#### Failure Mode Structure (Three-Part Definition)

Every failure mode referenced during PM task evaluation MUST follow this three-part structure:

| Component | Definition |
|-----------|-----------|
| **QUE falla** (What) | The specific component, part, or element that fails (e.g., impeller, bearing, seal, filter, sensor, cable) |
| **COMO falla** (Mechanism) | One of the 18 official VSC mechanisms from the FM Table (e.g., Wears, Corrodes, Cracks, Blocks, Degrades) |
| **POR QUE falla** (Cause) | One of the 46 official VSC causes from the FM Table (e.g., Contamination, Mechanical overload, Age, Cyclic loading) |

**Combined format:** `[What] -> [Mechanism] due to [Cause]`
**Example:** `Impeller -> Wears due to Abrasion` | `Bearing -> Overheats/Melts due to Lack of lubrication` | `Cable -> Short-Circuits due to Breakdown in insulation`

#### The 18 Official VSC Failure Mechanisms

Arcs | Blocks | Breaks/Fracture/Separates | Corrodes | Cracks | Degrades | Distorts | Drifts | Expires | Immobilised (binds/jams) | Looses Preload | Open-Circuit | Overheats/Melts | Severs (cut, tear, hole) | Short-Circuits | Thermally Overloads | Washes Off | Wears

#### Compliance Rules for PM Optimization

1. **NO ad-hoc failure mode descriptions.** When linking PM tasks to failure modes (Step 5), always use the VSC FM Table three-part structure. A PM task is only justified if it can be linked to a specific What + Mechanism + Cause combination.
2. **Failure mode linkage validation (Step 5):** Each PM task must map to one or more specific failure modes from the VSC FM Table. Tasks that cannot be linked to any recognized failure mode in the table are primary candidates for elimination.
3. **Technical validity by mechanism (Step 6):** The VSC FM-Mechanism determines the appropriate maintenance approach — e.g., "Wears" mechanisms (beta > 1) support time-based replacement; "Degrades" mechanisms may support condition monitoring; random mechanisms do not justify time-based PM.
4. **Description of FM Application:** The FM Table includes recommended components and maintenance strategies for each failure mode — cross-reference these when evaluating whether existing PM tasks are technically appropriate for the failure modes they address.
5. **New task identification (Step 8 - "Add New Task"):** When gaps are identified where failure modes exist without corresponding PM tasks, use the FM Table's "Description of FM Application" column to determine the appropriate maintenance strategy for the new task.
6. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency.

### Reference Standards

| Standard | Application |
|----------|-------------|
| SAE JA1011/JA1012 | RCM criteria applied to PMO task evaluation |
| ISO 14224 | Equipment taxonomy and failure data collection (failure mode classification per VSC Failure Modes Table) |
| SMRP Best Practice 5.5.1 | PM/PdM program effectiveness measurement |
| EPRI TR-106857 | PM Optimization methodology for power generation |
| IDCON PM Optimization | Structured PMO process reference |

### Industry Statistics on PM Program Waste

| Finding | Source | Implication |
|---------|--------|-------------|
| 30-50% of PM tasks add no value | EPRI, multiple industry studies | Massive labor and cost waste |
| Only 11% of failures are age-related | Nowlan & Heap (United Airlines, 1978) | Most time-based PM is misdirected |
| 10-15% of failures are maintenance-induced | Multiple sources | Intrusive PM creates failures |
| PM programs grow 5-10% per year organically | Industry observation | Without PMO, programs bloat continuously |
| Average PM compliance is 75-85% | SMRP benchmark data | Program overload drives non-compliance |
| World-class PM compliance is >95% | SMRP benchmark data | Achievable only with right-sized program |

---

## Step-by-Step Execution

### Phase 1: Data Collection & Current State Analysis (Steps 1-4)

**Step 1: Extract and inventory the PM program.**
- Pull complete PM task list from CMMS via mcp-cmms
- Count total active PM tasks, unique equipment covered, total annual planned hours
- Categorize tasks by: system, equipment type, craft, frequency, task type (inspection, lubrication, replacement, calibration, testing, cleaning, adjustment)
- Identify duplicate or near-duplicate tasks (same equipment, similar description, similar frequency)
- Calculate program statistics: tasks per equipment, hours per equipment, coverage ratio

**Step 2: Analyze PM work order history.**
- Extract 12-24 months of completed PM work orders
- For each task: extract actual hours, findings/comments, parts consumed, follow-up actions
- Calculate PM compliance rate: on-time completions / scheduled (monthly trend)
- Calculate found-and-fixed ratio per task (tasks where corrective action was taken)
- Calculate no-defect-found ratio per task (tasks completed with no findings)
- Identify tasks with consistently "no findings" for >80% of executions -- primary elimination candidates
- Identify tasks where failures occur between PMs -- frequency may be insufficient

**Step 3: Correlate PM program with failure history.**
- Pull corrective/breakdown work orders for same period
- Map each failure to the equipment's PM coverage
- Identify:
  - Failures on equipment with PM coverage (PM not effective or frequency too long)
  - Failures on equipment without PM coverage (potential PM gaps)
  - Failures occurring within 72 hours of a PM execution (maintenance-induced failures)
- Calculate failure rate by equipment type with and without PM coverage

**Step 4: Establish baseline metrics.**
- Current PM program cost: (total PM hours x labor rate) + PM materials cost
- Current reactive maintenance cost: (total CM hours x labor rate x emergency multiplier) + CM materials + downtime cost
- Current PM-to-CM ratio
- Current PM compliance rate
- Current maintenance-induced failure rate
- Establish improvement targets

### Phase 2: Task-by-Task Evaluation (Steps 5-8)

**Step 5: Link each PM task to a failure mode (per VSC Failure Modes Table).**
- For each PM task, identify the specific failure mode(s) it is intended to address
- **MANDATORY:** Cross-reference against the VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) using the three-part structure: What (component) + Mechanism (from 18) + Cause (from 46). OREDA and ISO 14224 may be used as supplementary references for equipment taxonomy only
- Flag tasks with no identifiable failure mode linkage in the VSC FM Table -- primary elimination candidates
- Flag tasks addressing failure modes with no historical occurrence AND low consequence -- secondary elimination candidates

**Step 6: Evaluate technical validity of each task.**
- For time-based replacement tasks: verify the failure mode has a wear-out characteristic (beta > 1.0)
  - If random failure pattern (beta ~ 1.0): time-based replacement is ineffective; evaluate CBM or RTF
  - If infant mortality (beta < 1.0): time-based replacement is counterproductive; investigate root cause
- For inspection tasks: verify the inspection can detect the failure mode before functional failure
  - Can the inspector physically see/measure/test the condition?
  - Is the P-F interval long enough that periodic inspection can catch degradation?
- For lubrication tasks: verify lubrication point accessibility, correct lubricant, appropriate interval
- For calibration tasks: verify drift characteristics justify the calibration interval

**Step 7: Assess whether each task is "worth doing."**
- Compare task cost (labor + materials + production loss during execution) vs. expected failure cost
- For safety/environmental consequences: task is automatically "worth doing" if technically valid
- For operational consequences: task must be cost-justified (PM cost < expected failure cost x failure probability in interval)
- For non-operational consequences: task must be cost-justified on repair cost alone
- Identify tasks where the cost of performing PM exceeds the cost of occasional corrective repair

**Step 8: Classify each task and formulate recommendation.**
- Apply PMO classification:
  - **Keep As-Is** (estimated 30-40%): Valid task, appropriate frequency, no changes
  - **Modify Frequency** (estimated 15-25%): Valid task, frequency adjustment based on data
  - **Convert to CBM** (estimated 10-15%): Replace time-based with condition monitoring
  - **Combine/Consolidate** (estimated 5-10%): Merge with other tasks for efficiency
  - **Eliminate** (estimated 15-30%): No valid basis; remove from program
  - **Add New Task** (estimated 5-10%): Gap identified from failure analysis
  - **Redesign Required** (estimated 2-5%): Maintenance alone cannot manage failure; design change needed

### Phase 3: Optimization & Deliverable Generation (Steps 9-12)

**Step 9: Optimize task frequencies.**
- For tasks with frequency modifications:
  - Use Weibull-derived intervals where reliability data exists
  - Apply P-F interval analysis for CBM conversions
  - Use regulatory requirements as minimum frequency floor
  - Harmonize to standard intervals (weekly, monthly, quarterly, semi-annual, annual)
  - Document rationale for every frequency change

**Step 10: Design CBM conversions.**
- For tasks converting from time-based to condition-based:
  - Select CBM technology (vibration, thermography, oil analysis, ultrasound, motor current, performance monitoring)
  - Define measurement points, parameters, and thresholds
  - Establish monitoring frequency based on P-F interval
  - Estimate CBM implementation cost (one-time and ongoing)
  - Calculate ROI: CBM cost vs. eliminated PM cost + improved failure detection

**Step 11: Calculate program-level impact.**
- Total PM tasks eliminated: count and annual hours saved
- Total frequency modifications: net hours impact (some up, some down)
- Total CBM conversions: PM hours eliminated vs. CBM hours added
- Net annual labor hour change
- Net annual cost change (labor + materials + CBM investment - avoided failures)
- PM compliance improvement forecast (fewer tasks = higher compliance with same resources)
- Projected impact on reactive maintenance ratio

**Step 12: Generate deliverables.**
- Compile PM Optimization Report with executive summary, methodology, findings, and recommendations
- Build PM Optimization Workbook with task-by-task analysis and summary dashboards
- Prepare CMMS change package: tasks to delete, tasks to modify, tasks to add
- Create implementation timeline with phased rollout (quick wins first)

---

## Quality Criteria

### Analytical Quality

| Criterion | Weight | Target |
|-----------|--------|--------|
| Every task evaluated against a failure mode | 30% | 100% of tasks have documented failure mode linkage or documented absence |
| Technical validity assessment complete | 25% | 100% of tasks assessed for technical feasibility |
| Data-driven frequency recommendations | 20% | >80% of frequency changes supported by reliability data |
| Cost-benefit documented | 15% | 100% of elimination and conversion recommendations have cost justification |
| No protected tasks eliminated | 10% | 0 regulatory/statutory tasks recommended for elimination |

### Automated Checks

- [ ] Every PM task has a PMO classification (no blanks)
- [ ] Every "Eliminate" recommendation has a documented justification
- [ ] Every "Modify Frequency" recommendation has a quantified basis
- [ ] Every CBM conversion specifies technology, frequency, and thresholds
- [ ] Regulatory/statutory tasks are flagged and protected from elimination
- [ ] Safety-critical tasks are flagged and undergo enhanced review
- [ ] Net hours calculation is arithmetically correct
- [ ] Cost-benefit analysis uses consistent cost assumptions
- [ ] No task is both "Eliminate" and "Keep" (logic consistency)
- [ ] Equipment tags match between PM task list and work order history

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `develop-maintenance-strategy` (MAINT-01) | Baseline RCM-derived PM program | High |
| `analyze-reliability` | Weibull parameters for frequency validation | High |
| `analyze-failure-patterns` (MAINT-03) | Failure patterns for PM effectiveness assessment | Medium |
| Agent 9 (Asset Management) | Asset management objectives and risk tolerance | Medium |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `benchmark-maintenance-kpis` (MAINT-04) | Optimized PM program metrics for benchmarking | Automatic |
| `model-staffing-requirements` (WF-01) | Revised labor hours for workforce modeling | Automatic |
| `plan-training-program` (WF-04) | New CBM skills required from conversions | On request |
| `create-kpi-dashboard` | Updated KPI targets post-optimization | Automatic |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-cmms** | Extract PM task lists, work order history, equipment data | `GET /pm-tasks`, `GET /work-orders`, `GET /equipment` |
| **mcp-excel** | Generate optimization workbook with analysis, charts, and dashboards | `POST /workbooks`, `PUT /sheets/{sheet}` |

---

## Templates & References

### Templates
- `VSC_PMO_Report_Template_v2.0.docx` -- PM Optimization report template
- `VSC_PMO_Workbook_Template_v3.0.xlsx` -- Task analysis workbook with pre-built formulas and dashboards
- `VSC_PMO_CMMS_Change_Package_Template_v1.0.xlsx` -- CMMS modification package

### Reference Documents
- EPRI TR-106857: "Preventive Maintenance Optimization" (PMO methodology)
- Nowlan, F.S. & Heap, H.F. (1978): "Reliability Centered Maintenance" (failure pattern analysis)
- SMRP Best Practice 5.5.1: "PM/PdM Program Effectiveness"
- SAE JA1011/JA1012: RCM evaluation criteria
- VSC Internal: "Guia de Optimizacion de Mantenimiento Preventivo v2.0"

---

## Examples

### Example 1: PM Task Evaluation -- Motor Greasing

**Current Task**: "Grease motor bearings, quarterly, 0.5 hours, mechanical craft"
**Equipment**: 75 kW centrifugal pump motor, TEFC, ball bearings, continuous duty

**PMO Analysis**:
- **Failure mode linkage**: Bearing failure due to lubricant degradation -- VALID
- **Technical validity**: Grease replenishment is appropriate for ball bearings in continuous service
- **Frequency check**: OEM recommends every 4,000 hours. At 8,000 hrs/year = semi-annual. Current quarterly frequency is too frequent.
- **Risk assessment**: Over-greasing is a known failure cause (bearing overheating, seal damage). 15% of bearing failures are attributed to over-lubrication.
- **No-defect-found ratio**: 100% (grease is always "topped up" with no condition assessment)
- **PMO Classification**: **Modify Frequency** -- Change from quarterly to semi-annual. Add instruction to use calibrated grease gun with specified quantity (per OEM). Add ultrasonic-assisted greasing for Criticality A motors.
- **Impact**: 50% reduction in task executions. Reduced over-greasing risk. Improved bearing life.

### Example 2: Program-Level PMO Results (Mining Concentrator)

**Scope**: 2,847 active PM tasks covering 850 equipment items

| PMO Classification | Tasks | % | Annual Hours Impact |
|--------------------|-------|---|---------------------|
| Keep As-Is | 1,054 | 37% | 0 |
| Modify Frequency (reduce) | 456 | 16% | -3,200 hrs saved |
| Modify Frequency (increase) | 142 | 5% | +800 hrs added |
| Convert to CBM | 285 | 10% | -1,900 hrs (PM) / +600 hrs (CBM) = -1,300 net |
| Combine/Consolidate | 199 | 7% | -1,100 hrs saved |
| Eliminate | 598 | 21% | -4,800 hrs saved |
| Add New Task | 113 | 4% | +900 hrs added |

**Net Impact**: -8,700 annual labor hours saved (equivalent to 4.2 FTE at 2,080 hrs/year)
**Cost Savings**: USD 522,000/year (labor) + USD 185,000/year (materials) = USD 707,000/year
**PM Compliance Forecast**: From 78% to 92% (same workforce, fewer tasks)
**Reactive Work Forecast**: From 35% to 22% within 12 months (better targeted PMs)
