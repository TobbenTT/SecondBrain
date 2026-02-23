# Analyze Failure Patterns
## Skill ID: MAINT-03
## Version: 1.0.0
## Category: Maintenance Intelligence (Agent 3)
## Priority: P1 - Critical

---

## Purpose

Perform systematic defect elimination through failure pattern analysis, identifying chronic and repeat failures that consume disproportionate maintenance resources and production capacity. This skill transforms raw CMMS work order data into structured Root Cause Analysis (RCA), Bad Actor identification, and defect elimination action plans that break the cycle of repetitive failures.

Industry data reveals that 40-60% of maintenance work orders are repeat failures on the same equipment for the same or similar failure modes (Pain RW-03). These "bad actors" or chronic failures represent the single largest opportunity for maintenance cost reduction and availability improvement. A structured defect elimination program targeting the top 20 bad actors in a facility typically yields 15-30% reduction in total corrective maintenance within 12-18 months.

The skill applies Pareto analysis, failure pattern recognition (using Weibull analysis and trend detection), Root Cause Analysis methodologies (5-Why, Fishbone/Ishikawa, Fault Tree Analysis), and structured defect elimination action tracking to move from "fixing failures" to "eliminating defects permanently."

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Bad Actor Identification**: Systematically identify the equipment items and failure modes that generate the most corrective maintenance work, downtime, and cost. The Pareto principle applies: typically 10-20% of equipment generates 60-80% of corrective maintenance.

2. **Failure Pattern Classification**: For each bad actor, classify the failure pattern:
   - **Chronic repeat failure**: Same failure mode recurring on same equipment (e.g., pump seal failure every 3 months)
   - **Common mode failure**: Same failure mode occurring across multiple identical equipment (e.g., all butterfly valves in a system failing similarly)
   - **Cascade failure**: One equipment failure causing secondary failures downstream
   - **Intermittent/NFF**: No Fault Found or intermittent failures that evade diagnosis
   - **Infant mortality**: Failures occurring shortly after maintenance or installation

3. **Root Cause Depth**: Analysis must go beyond the proximate cause (what broke) to the root cause (why it broke) and the latent cause (what organizational/systemic factor allowed the root cause to exist). The hierarchy is:
   - Physical root cause (component/material/design)
   - Human root cause (error, skill gap, procedure gap)
   - Latent/organizational root cause (management system, culture, resource allocation)

4. **Quantified Impact**: Every identified failure pattern must be quantified in terms of: annual failure frequency, annual downtime hours, annual maintenance cost (labor + materials), production loss, and safety/environmental incidents.

5. **Actionable Elimination Plans**: Each root cause must have a specific, assigned, time-bound corrective action that eliminates or significantly reduces the failure recurrence.

6. **Feedback Loop**: Results must feed back into maintenance strategy optimization (MAINT-01, MAINT-02), spare parts strategy, and training requirements.

7. **Language**: Spanish (Latin American) with English technical terms preserved.

---

## Trigger / Invocation

```
/analyze-failure-patterns
```

### Natural Language Triggers
- "Identify our worst-performing equipment"
- "Find repeat failures and their root causes"
- "Perform bad actor analysis on [system/plant]"
- "Why does [equipment] keep failing?"
- "Defect elimination analysis for [plant]"
- "Analizar patrones de falla recurrentes"
- "Identificar equipos con mas fallas repetitivas"
- "Analisis de actores malos / eliminacion de defectos"

### Aliases
- `/bad-actor-analysis`
- `/defect-elimination`
- `/repeat-failure-analysis`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `work_order_history` | Corrective and breakdown work orders with: equipment tag, failure date, failure description, failure mode code, root cause (if recorded), repair description, downtime hours, labor hours, parts consumed, cost | .xlsx / CMMS export | CMMS (mcp-cmms) |
| `equipment_register` | Equipment hierarchy with tag numbers, descriptions, types, and criticality ratings | .xlsx | CMMS / Client |
| `analysis_period` | Time period for analysis (minimum 12 months, 24-36 months preferred) | Text | User |

### Optional Inputs

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `pm_work_orders` | Preventive maintenance work orders with findings | Analyze corrective WOs only |
| `downtime_records` | Production downtime log with lost production data | Estimate from WO downtime hours |
| `production_rates` | Throughput value per hour by system ($/hour or tons/hour) | Exclude production cost from analysis |
| `existing_rca_reports` | Prior Root Cause Analysis reports | Fresh analysis performed |
| `equipment_age_data` | Installation dates and operating hours | Exclude age-based analysis |
| `modification_history` | Equipment modifications, overhauls, and upgrades | Exclude modification impact analysis |
| `operator_reports` | Operator logs and shift reports with equipment observations | CMMS data only |

### Data Quality Expectations

- Work order descriptions must be sufficiently detailed to identify failure modes (single-word descriptions like "repair" or "fix" have limited analytical value)
- ISO 14224 failure coding in CMMS improves data quality; all failure modes must be re-classified per the VSC Failure Modes Table for consistency
- Minimum 100 corrective work orders for meaningful Pareto analysis
- Equipment tag consistency between work orders and equipment register

---

## Output Specification

### Deliverable 1: Failure Pattern Analysis Report (.docx)

**Filename**: `{ProjectCode}_Failure_Pattern_Analysis_v{Version}_{YYYYMMDD}.docx`

**Structure**:
1. Executive Summary (2-3 pages)
   - Key findings: top 10 bad actors with annualized impact
   - Total cost of repeat failures (% of total maintenance spend)
   - Root cause distribution (design, operations, maintenance, materials, external)
   - Defect elimination potential (estimated savings from action plan)
2. Methodology (2 pages)
3. Data Quality Assessment (1-2 pages)
   - Data completeness and quality score
   - Limitations and assumptions
4. Bad Actor Analysis (5-10 pages)
   - Equipment-level Pareto: top 20 equipment by failure frequency, downtime, cost
   - Failure mode Pareto: top 20 failure modes across all equipment
   - System-level analysis: worst-performing systems
   - Trend analysis: improving, stable, or deteriorating patterns
5. Failure Pattern Deep-Dive (10-15 pages)
   - For each top 10 bad actor:
     - Equipment identification and operating context
     - Failure timeline (chronological failure events)
     - Failure mode analysis (dominant modes, secondary modes)
     - Weibull analysis (if sufficient data points)
     - Root Cause Analysis (5-Why and/or Fishbone)
     - Quantified annual impact
     - Recommended corrective actions (with priority, owner, timeline)
6. Common Mode Failure Analysis (3-5 pages)
7. Maintenance-Induced Failure Analysis (2-3 pages)
8. Defect Elimination Action Plan (3-5 pages)
   - Prioritized action register
   - Quick wins (0-3 months)
   - Medium-term actions (3-12 months)
   - Long-term / CAPEX actions (12+ months)
   - Expected ROI by action
9. Recommendations for Strategy Revision (2-3 pages)
10. Appendices

### Deliverable 2: Failure Analysis Workbook (.xlsx)

**Filename**: `{ProjectCode}_Failure_Analysis_Workbook_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

| Sheet | Content |
|-------|---------|
| `Executive Dashboard` | Charts: Pareto (frequency, downtime, cost), trend lines, failure mode distribution |
| `Bad Actor Ranking` | All equipment ranked by composite score (frequency x consequence) |
| `Failure Mode Analysis` | Failure modes grouped by equipment type with frequency, MTBF, and trend |
| `Root Cause Analysis` | RCA for top bad actors: 5-Why chains, root cause categories |
| `Weibull Results` | Statistical analysis for equipment with sufficient data points |
| `Trend Analysis` | Monthly failure rate trends by system and equipment type |
| `Common Mode Failures` | Fleet-wide failure patterns across identical equipment |
| `Action Register` | Complete defect elimination actions with priority, owner, due date, status, expected impact |
| `Cost-Benefit Analysis` | ROI calculation for each proposed corrective action |

---

## Methodology & Standards

### Bad Actor Identification Methodology

**Composite Ranking Score** = (Failure Frequency Score x 0.3) + (Downtime Impact Score x 0.3) + (Maintenance Cost Score x 0.2) + (Safety/Environmental Impact Score x 0.2)

Each score normalized to 1-10 scale based on the population distribution.

### Pareto Analysis Framework

Three independent Pareto analyses:
1. **Frequency Pareto**: Equipment ranked by number of corrective work orders -- identifies the most failure-prone equipment
2. **Downtime Pareto**: Equipment ranked by total downtime hours -- identifies equipment with greatest production impact
3. **Cost Pareto**: Equipment ranked by total maintenance cost (labor + materials) -- identifies the most expensive equipment to maintain

Equipment appearing in the top 20 of all three Pareto lists are the highest-priority bad actors.

### Root Cause Analysis Methods

**5-Why Analysis** (Primary method for most failures):
- Start with the failure event (what happened?)
- Ask "why?" iteratively (minimum 3 levels, typically 5)
- Continue until reaching an actionable root cause
- Identify physical, human, and latent/organizational causes

**Fishbone / Ishikawa Diagram** (For complex or multi-causal failures):
Categories: Man, Machine, Method, Material, Measurement, Mother Nature (6M)

**Fault Tree Analysis** (For safety-critical or high-consequence failures):
- Top event: the failure/incident
- Logic gates (AND/OR) showing causal combinations
- Basic events: root causes at the bottom of the tree

### Failure Pattern Classification per Nowlan & Heap

| Pattern | Weibull Beta | % of Failures | PM Strategy |
|---------|-------------|---------------|-------------|
| A: Bathtub curve | Variable | 4% | Time-based replacement NOT effective for random portion |
| B: Increasing wear-out | >1.5 | 2% | Time-based replacement effective |
| C: Gradual increase | 1.0-1.5 | 5% | Condition monitoring preferred |
| D: Initial plateau then random | ~1.0 | 7% | Time-based PM not effective |
| E: Random (exponential) | ~1.0 | 14% | CBM or run-to-failure |
| F: Infant mortality then random | <1.0 then ~1.0 | 68% | Improve installation/commissioning quality |

### Root Cause Category Taxonomy

| Category | Code | Examples |
|----------|------|----------|
| Design deficiency | DES | Under-sizing, material selection error, inadequate protection |
| Manufacturing defect | MFG | Casting defect, machining error, assembly error |
| Installation error | INST | Misalignment, incorrect torque, wrong lubricant, contamination during install |
| Operating error | OPS | Overload, dry running, incorrect valve lineup, process upset |
| Maintenance error | MNT | Incorrect procedure, wrong parts, inadequate QA, over/under-lubrication |
| Material degradation | MAT | Corrosion, erosion, fatigue, creep, hydrogen embrittlement |
| External factors | EXT | Lightning, flooding, earthquake, third-party damage, power quality |
| Management system | MGT | Inadequate training, resource constraints, missing procedures, poor planning |

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** Every failure mode identified, classified, or analyzed in bad actor analysis, Pareto rankings, root cause analysis, and defect elimination MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted. This table is critical for failure pattern analysis because it enables consistent failure mode grouping across equipment, systems, and time periods.

#### Failure Mode Structure (Three-Part Definition)

Every failure mode in failure pattern analysis MUST follow this three-part structure to enable accurate Pareto analysis, bad actor identification, and common mode failure detection:

| Component | Definition |
|-----------|-----------|
| **QUE falla** (What) | The specific component, part, or element that fails (e.g., impeller, bearing, seal, filter, sensor, cable) |
| **COMO falla** (Mechanism) | One of the 18 official VSC mechanisms from the FM Table (e.g., Wears, Corrodes, Cracks, Blocks, Degrades) |
| **POR QUE falla** (Cause) | One of the 46 official VSC causes from the FM Table (e.g., Contamination, Mechanical overload, Age, Cyclic loading) |

**Combined format:** `[What] -> [Mechanism] due to [Cause]`
**Example:** `Impeller -> Wears due to Abrasion` | `Bearing -> Overheats/Melts due to Lack of lubrication` | `Cable -> Short-Circuits due to Breakdown in insulation`

#### The 18 Official VSC Failure Mechanisms

Arcs | Blocks | Breaks/Fracture/Separates | Corrodes | Cracks | Degrades | Distorts | Drifts | Expires | Immobilised (binds/jams) | Looses Preload | Open-Circuit | Overheats/Melts | Severs (cut, tear, hole) | Short-Circuits | Thermally Overloads | Washes Off | Wears

#### Compliance Rules for Failure Pattern Analysis

1. **NO ad-hoc failure mode descriptions.** When classifying work order failure modes for Pareto analysis and bad actor ranking, always decompose into What + Mechanism + Cause per the VSC FM Table. Free-text descriptions from CMMS (e.g., "pump broken," "valve leaking") must be re-mapped to the standardized VSC format during Step 2 (Clean and classify data).
2. **Pareto analysis by mechanism and cause:** In addition to equipment-level Pareto (Step 4), perform Pareto analysis by VSC FM-Mechanism (18 categories) and by FM-Cause (46 categories) to identify dominant failure mechanisms and root cause patterns across the entire fleet.
3. **Common mode failure detection:** Use the VSC FM Table mechanism categories to systematically identify common mode failures — when the same Mechanism + Cause combination appears across multiple identical equipment items, it indicates a design-inherent or systemic issue.
4. **Cross-reference column:** The FM Table includes "Other Mechanisms grouped" and "Other Causes grouped" columns for reliability investigations — use these to consolidate similar failure modes during Pareto analysis and defect elimination prioritization.
5. **Description of FM Application:** The FM Table includes recommended components and maintenance strategies for each failure mode — cross-reference these when developing defect elimination action plans (Step 11) to identify whether existing maintenance strategies adequately address the identified failure modes.
6. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency.

### Reference Standards

| Standard | Application |
|----------|-------------|
| ISO 14224:2016 | Equipment taxonomy and failure data collection (failure mode classification per VSC Failure Modes Table) |
| IEC 62740:2015 | Root cause analysis methodology |
| ISO 31000:2018 | Risk management principles |
| SMRP Best Practice 5.3.1 | Defect elimination process |
| DOE HDBK-1004-92 | Root cause analysis guidance |

---

## Step-by-Step Execution

### Phase 1: Data Extraction & Preparation (Steps 1-3)

**Step 1: Extract work order data.**
- Pull corrective/breakdown work orders from CMMS via mcp-cmms for specified analysis period
- Extract fields: WO number, equipment tag, open date, close date, failure description, failure mode code, cause code, repair description, downtime hours, labor hours, crafts, parts, cost
- Pull PM work orders with "corrective findings" to capture developing failures detected during PMs
- Count total work orders extracted; validate against CMMS summary reports

**Step 2: Clean and classify data.**
- Remove non-failure work orders (modifications, improvements, project work)
- Standardize equipment tags (resolve aliases, duplicates)
- **MANDATORY:** Classify failure modes using the VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) — each failure must be mapped to a specific Mechanism (from 18) and Cause (from 46). ISO 14224 may be used as supplementary reference for equipment taxonomy only
- Text-mine work order descriptions to extract failure modes from free-text entries
- Calculate time-between-failures for each equipment item
- Flag data quality issues (missing dates, blank descriptions, unclosed WOs)
- Generate data quality score: % of WOs with complete failure coding

**Step 3: Merge with equipment register.**
- Join work order data with equipment register on tag number
- Add equipment attributes: system, type, criticality, installation date, OEM
- Flag work orders with unmatched tags (data integrity issue)
- Calculate population: number of identical equipment items per type

### Phase 2: Bad Actor Analysis (Steps 4-7)

**Step 4: Perform Pareto analysis.**
- Generate three Pareto rankings:
  1. By failure frequency (corrective WO count per equipment)
  2. By total downtime (hours lost per equipment)
  3. By total cost (labor + materials per equipment)
- Identify equipment appearing in top 20 of multiple lists (composite bad actors)
- Calculate composite ranking score for all equipment
- Generate Pareto charts with 80/20 line

**Step 5: Perform system-level analysis.**
- Aggregate failures by system and subsystem
- Identify worst-performing systems (highest failure density per equipment count)
- Compare system failure rates against industry benchmarks (OREDA, internal database)
- Calculate system-level MTBF and availability from failure data

**Step 6: Analyze failure mode distribution.**
- Group failures by failure mode across all equipment
- Identify top 20 failure modes by frequency and by cost
- For each dominant failure mode, calculate:
  - Number of affected equipment items (fleet-wide occurrence)
  - Average MTBF for equipment experiencing this mode
  - Average MTTR per occurrence
  - Total annual cost (labor + materials + downtime)

**Step 7: Perform trend analysis.**
- Calculate monthly and quarterly failure rates (failures per equipment per month)
- Apply Crow-AMSAA trend test to determine if reliability is improving, stable, or deteriorating
- Identify equipment with accelerating failure rates (deteriorating trend -- urgent attention)
- Identify equipment with decelerating failure rates (improving -- validate what changed)
- Generate trend charts for top bad actors

### Phase 3: Root Cause Analysis (Steps 8-10)

**Step 8: Perform detailed RCA for top bad actors.**
- For each top 10-20 bad actor:
  - Construct failure timeline (all failure events plotted chronologically)
  - Identify dominant failure mode(s)
  - Perform 5-Why analysis for the dominant failure mode
  - If multiple root causes: construct Fishbone diagram
  - If safety-critical: perform Fault Tree Analysis
  - Classify root cause: Design, Manufacturing, Installation, Operations, Maintenance, Materials, External, Management
  - Identify latent/organizational root causes

**Step 9: Identify common mode failures.**
- For each failure mode appearing on multiple identical equipment:
  - Determine if the failure mode is design-inherent (same failure on >30% of fleet)
  - Assess if operating conditions are consistent or varying across affected equipment
  - Identify if a specific batch, supplier, or installation crew is correlated
  - Determine if a systemic correction (design change, procedure change, training) can address the entire fleet

**Step 10: Analyze maintenance-induced failures.**
- Identify failures occurring within 72 hours of a PM or corrective maintenance event
- Calculate maintenance-induced failure rate: MIF / total maintenance events
- Classify MIF root causes: procedure error, parts quality, skill gap, tool issue, QA gap
- Benchmark against industry target (<5% MIF rate)
- Recommend corrective actions for MIF reduction

### Phase 4: Action Plan & Deliverables (Steps 11-14)

**Step 11: Develop defect elimination action plan.**
- For each root cause identified:
  - Define specific corrective action (what needs to change)
  - Classify action type: procedure change, training, design modification, operating practice change, spare parts quality, PM strategy revision
  - Assign priority: Critical (safety/environment), High (>$50K/year impact), Medium ($10-50K/year), Low (<$10K/year)
  - Estimate implementation cost and timeline
  - Calculate expected ROI (annual savings / implementation cost)
  - Assign action owner and due date

**Step 12: Identify quick wins.**
- Actions implementable within 0-3 months with minimal cost:
  - Procedure revisions
  - Operating parameter adjustments
  - Lubrication changes
  - PM frequency adjustments
  - Training interventions
- Estimate quick-win savings potential

**Step 13: Generate deliverables.**
- Compile Failure Pattern Analysis Report
- Build Failure Analysis Workbook with dashboards and action register
- Post key findings and action items to team communication channel via mcp-teams
- Store deliverables in project document library via mcp-sharepoint

**Step 14: Feed back into maintenance strategy.**
- Update maintenance strategy (MAINT-01) with new failure mode insights
- Update PM optimization (MAINT-02) with revised task recommendations
- Update spare parts strategy with chronic failure parts requirements
- Update training program with identified skill gaps

---

## Quality Criteria

### Analytical Quality

| Criterion | Weight | Target |
|-----------|--------|--------|
| Data coverage | 20% | >90% of corrective WOs classified by failure mode |
| Pareto accuracy | 20% | Top 20 bad actors capture >60% of total corrective cost |
| RCA depth | 25% | 100% of top 10 bad actors have RCA to organizational root cause level |
| Action specificity | 20% | 100% of actions have specific description, owner, timeline, and expected impact |
| Quantified impact | 15% | 100% of bad actors have annualized cost/downtime quantification |

### Automated Checks

- [ ] All work orders have equipment tag matched to register
- [ ] All Pareto rankings are arithmetically correct
- [ ] All top 10 bad actors have complete RCA documentation
- [ ] All actions in register have owner, due date, and priority
- [ ] No duplicate actions in register
- [ ] ROI calculations use consistent cost assumptions
- [ ] Trend analysis covers the full analysis period
- [ ] Failure mode classifications follow the VSC Failure Modes Table (18 mechanisms, 46 causes) per `methodology/standards/VSC_Failure_Modes_Table.xlsx`
- [ ] Common mode failures are identified across fleet

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| CMMS data via mcp-cmms | Work order history, equipment register | Critical |
| `analyze-reliability` | Weibull parameters for failure pattern classification | High |
| `develop-maintenance-strategy` (MAINT-01) | Criticality ratings, failure mode libraries | Medium |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `develop-maintenance-strategy` (MAINT-01) | Updated failure insights for strategy revision | Automatic |
| `optimize-pm-program` (MAINT-02) | PM task effectiveness data, new task recommendations | Automatic |
| `benchmark-maintenance-kpis` (MAINT-04) | Failure rate and MTBF data for benchmarking | Automatic |
| `plan-training-program` (WF-04) | Skill gaps identified from maintenance-induced failures | On request |
| `resolve-cross-functional-conflicts` (INTG-02) | Data for operations vs. maintenance disputes | On request |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-cmms** | Extract work orders, failure history, equipment data | `GET /work-orders`, `GET /equipment`, `GET /failure-codes` |
| **mcp-sharepoint** | Store analysis reports and retrieve reference documents | `POST /documents`, `GET /documents` |
| **mcp-teams** | Share findings, action items, and alerts with maintenance team | `POST /channels/{id}/messages`, `POST /chats/{id}/messages` |

---

## Templates & References

### Templates
- `VSC_Bad_Actor_Analysis_Template_v2.0.docx` -- Report template
- `VSC_Failure_Analysis_Workbook_Template_v3.0.xlsx` -- Workbook with pre-built Pareto charts and dashboards
- `VSC_RCA_5Why_Template_v1.5.xlsx` -- Structured 5-Why analysis template
- `VSC_Defect_Elimination_Action_Register_v2.0.xlsx` -- Action tracking template

### Reference Documents
- Nowlan, F.S. & Heap, H.F. (1978): "Reliability Centered Maintenance" -- six failure patterns
- OREDA Handbook -- Generic failure rates for benchmarking
- ISO 14224:2016 -- Failure mode and cause classification
- IEC 62740:2015 -- Root cause analysis guidance
- DOE HDBK-1004-92 -- "Root Cause Analysis Guidance Document"
- Latino, R.J. & Latino, K.C.: "Root Cause Analysis: Improving Performance for Bottom-Line Results"

---

## Examples

### Example 1: Chronic Repeat Failure -- Mechanical Seal

**Bad Actor**: PP-4501A, Thickener Underflow Pump
**Ranking**: #1 by frequency (8 failures in 24 months), #3 by cost ($124,000/year)

**Failure Timeline**:
| Event | Date | Failure Mode | MTBF (days) | Cost |
|-------|------|-------------|-------------|------|
| 1 | 2024-01-15 | Seal failure | -- | $14,200 |
| 2 | 2024-04-08 | Seal failure | 83 | $14,200 |
| 3 | 2024-06-22 | Seal failure | 75 | $15,800 |
| 4 | 2024-09-10 | Seal failure | 80 | $14,200 |
| 5 | 2024-12-01 | Seal failure | 82 | $14,200 |
| 6 | 2025-02-18 | Seal failure | 79 | $15,800 |
| 7 | 2025-05-05 | Seal failure | 76 | $14,200 |
| 8 | 2025-07-20 | Seal failure | 76 | $21,400 |

**Weibull Analysis**: Beta = 4.1, Eta = 85 days (strong wear-out, highly predictable)

**5-Why RCA**:
1. Why did the seal fail? -- Seal faces worn beyond tolerance
2. Why did faces wear prematurely? -- Abrasive slurry between seal faces
3. Why was slurry at the seal? -- Flush water system providing insufficient flow/pressure
4. Why insufficient flush water? -- Flush water strainer clogged; no PM task to clean it
5. Why no PM task? -- Flush system not included in original maintenance strategy scope

**Root Cause**: Latent/organizational -- Incomplete maintenance strategy scope (flush water system excluded)

**Actions**:
1. (Immediate) Clean and inspect flush water strainer -- Maintenance Planner -- 1 week
2. (Quick win) Add PM task: "Inspect and clean seal flush water strainer -- monthly" -- Reliability Engineer -- 2 weeks
3. (Medium-term) Install differential pressure indicator on flush water strainer -- Engineering -- 3 months
4. (Medium-term) Evaluate upgrade to tandem seal with pressurized barrier fluid -- Engineering -- 6 months

**Expected Impact**: Extend MTBF from 80 days to 300+ days; reduce annual cost from $124,000 to <$30,000

### Example 2: Common Mode Failure -- Butterfly Valve Actuators

**Pattern**: 15 pneumatic butterfly valve actuators (same model) across flotation circuit all experiencing diaphragm failures within 6-12 months of installation

**RCA Finding**: Actuator diaphragm material (Buna-N) incompatible with chemical fumes in flotation area. Common mode design/specification error.

**Action**: Replace all 15 diaphragms with Viton material (chemical-resistant). Update valve specification for future purchases. Estimated one-time cost: $8,500. Annual savings: $45,000 in repeat repairs.
