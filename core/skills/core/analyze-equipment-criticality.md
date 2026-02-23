# Analyze Equipment Criticality

## Skill ID: B-CRIT-001

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P1 - Critical (foundational input for maintenance strategy, spare parts, and resource allocation)

---

## Purpose

Perform equipment criticality analysis using both qualitative (FMECA-based matrix) and quantitative (RAM) methodologies to classify physical assets into criticality tiers (AA/A/B/C). This classification drives downstream decisions in maintenance strategy, spare parts policy, inspection frequency, capital planning, and operational risk management across industrial and mining operations.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Receive** a list of equipment/assets with their operational context, process function, and available failure data.
2. **Apply** a structured criticality assessment framework combining:
   - Qualitative scoring (consequence x probability matrix aligned with FMECA/MIL-STD-1629A).
   - Semi-quantitative RAM indicators (reliability, availability, maintainability) when failure data is available.
3. **Classify** each piece of equipment into one of four criticality tiers:
   - **AA** - Ultra-critical: single point of failure, catastrophic consequence, no redundancy.
   - **A** - Critical: significant production/safety/environmental impact.
   - **B** - Important: moderate impact, some redundancy or mitigation available.
   - **C** - Low criticality: minimal impact, easily replaceable or fully redundant.
4. **Generate** a structured output in `.xlsx` format containing the full criticality matrix, scoring breakdown, and tier assignment.

The analysis must be repeatable, auditable, and aligned with ISO 14224, ISO 55000, and EN 16646 frameworks.

---

## Trigger / Invocation

**Command:** `/analyze-equipment-criticality`

**Trigger Conditions (any of the following):**
- User provides an equipment list and requests criticality classification.
- A project workflow requires criticality analysis as input for maintenance strategy development.
- An upstream agent (e.g., project orchestrator) routes a criticality analysis task.
- User requests a "criticality matrix" or "RAM-based equipment ranking."

**Aliases:**
- `/criticality-analysis`
- `/equipment-ranking`
- `/fmeca-criticality`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `equipment_list` | `.xlsx`, `.csv`, or structured text | List of equipment with TAG/ID, description, system/subsystem hierarchy |
| `process_context` | Text or `.docx` | Description of the process, plant configuration, and operational context |

### Optional Inputs (enhance analysis quality)

| Input | Format | Description |
|-------|--------|-------------|
| `failure_data` | `.xlsx`, `.csv` | Historical failure records: failure dates, modes, downtimes, costs |
| `process_flow_diagram` | `.pdf`, `.png` | PFD/P&ID for understanding equipment function in the process |
| `existing_criticality` | `.xlsx` | Previous criticality assessment for comparison/update |
| `consequence_weights` | JSON or `.xlsx` | Custom weighting factors for consequence categories |
| `site_risk_appetite` | Text | Organization's risk tolerance level and safety culture context |
| `redundancy_map` | `.xlsx` or text | Equipment redundancy configuration (N+1, 2x100%, etc.) |
| `production_rates` | `.xlsx` or text | Production throughput data and unit economics for loss calculation |

### Input Validation Rules

1. Equipment list must contain at minimum: `equipment_tag`, `equipment_description`, `system` or `functional_location`.
2. If failure data is provided, it must include at minimum: `equipment_tag`, `failure_date`, `failure_mode`, `downtime_hours`.
3. Process context must identify the industry sector (mining, oil & gas, energy, water, etc.) to calibrate consequence scales.

---

## Output Specification

### Primary Output: Criticality Matrix (`.xlsx`)

**File naming:** `{project_code}_criticality_matrix_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Summary` | Dashboard with criticality distribution (AA/A/B/C counts, Pareto chart data), top-10 critical equipment list |
| `Criticality Matrix` | Full scoring matrix with all equipment, all criteria scores, weighted total, tier assignment |
| `Scoring Criteria` | Definitions of each consequence and probability category with numerical scales |
| `Methodology` | Description of the methodology used, assumptions, and limitations |
| `Failure Data Analysis` | Statistical summary of failure data (if provided): MTBF, MTTR, failure rates |
| `RAM Indicators` | RAM-based scoring and indicators per equipment (if failure data available) |
| `Comparison` | Delta analysis vs. previous criticality assessment (if provided) |

### Criticality Matrix Sheet - Column Structure

| Column | Description |
|--------|-------------|
| `Equipment Tag` | Unique equipment identifier |
| `Equipment Description` | Descriptive name |
| `System / Area` | Process system or plant area |
| `Function` | Equipment function in the process |
| `Redundancy` | Redundancy configuration (none, standby, parallel) |
| `C_Safety` | Safety consequence score (1-5) |
| `C_Environmental` | Environmental consequence score (1-5) |
| `C_Production` | Production/economic consequence score (1-5) |
| `C_Maintenance_Cost` | Maintenance cost consequence score (1-5) |
| `C_Reputation` | Reputational consequence score (1-5) |
| `P_Frequency` | Probability/frequency of failure score (1-5) |
| `P_Detection` | Detectability score (1-5) |
| `Weighted_Score` | Calculated weighted criticality score |
| `Criticality_Tier` | Assigned tier: AA, A, B, or C |
| `Justification` | Brief narrative justification for the assigned tier |
| `Confidence_Level` | Data confidence level (High/Medium/Low) |

### Secondary Outputs

- **Criticality summary table** (ready for insertion into reports/presentations).
- **Criticality distribution chart data** (Pareto, pie chart, heatmap-ready).
- **Recommendations list** for equipment requiring further analysis (e.g., RCM, RBI).

---

## Methodology & Standards

### Reference Standards

| Standard | Application |
|----------|-------------|
| ISO 14224:2016 | Equipment taxonomy and failure data collection (failure mode classification per VSC Failure Modes Table) |
| ISO 55000:2014 | Asset management decision-making framework |
| EN 16646:2014 | Maintenance within physical asset management |
| MIL-STD-1629A | FMECA methodology (Failure Mode, Effects, and Criticality Analysis) |
| NORSOK Z-008 | Criticality analysis for maintenance purposes (oil & gas reference) |
| SAE JA1011/JA1012 | RCM standard (for downstream application of criticality results) |

### Consequence Scale Definition (Default 1-5)

| Score | Safety | Environmental | Production | Maintenance Cost |
|-------|--------|---------------|------------|-----------------|
| 5 | Fatality or permanent disability | Major offsite release, regulatory penalty | >72h production loss or >USD 1M | >USD 500K per event |
| 4 | Serious injury, hospitalization | Significant onsite release, reportable | 24-72h production loss | USD 100K-500K per event |
| 3 | Medical treatment required | Contained release, minor cleanup | 8-24h production loss | USD 50K-100K per event |
| 2 | First aid treatment | Minor release, no external impact | 1-8h production loss | USD 10K-50K per event |
| 1 | No injury | No environmental impact | <1h production loss | <USD 10K per event |

### Probability Scale Definition (Default 1-5)

| Score | Description | Indicative Frequency |
|-------|-------------|---------------------|
| 5 | Very frequent | >12 failures/year |
| 4 | Frequent | 4-12 failures/year |
| 3 | Occasional | 1-4 failures/year |
| 2 | Rare | 0.1-1 failure/year |
| 1 | Very rare | <0.1 failure/year (less than 1 per 10 years) |

### Weighting Factors (Default, adjustable)

| Criterion | Default Weight |
|-----------|---------------|
| Safety | 0.30 |
| Environmental | 0.20 |
| Production | 0.25 |
| Maintenance Cost | 0.15 |
| Reputation | 0.10 |

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** When failure modes are identified or referenced during criticality assessment (e.g., for probability scoring, consequence evaluation, or downstream RCM scoping), they MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted.

#### Failure Mode Structure (Three-Part Definition)

Every failure mode referenced in criticality analysis — whether from historical failure data, generic databases, or expert judgment — MUST follow this three-part structure:

| Component | Definition |
|-----------|-----------|
| **QUE falla** (What) | The specific component, part, or element that fails (e.g., impeller, bearing, seal, filter, sensor, cable) |
| **COMO falla** (Mechanism) | One of the 18 official VSC mechanisms from the FM Table (e.g., Wears, Corrodes, Cracks, Blocks, Degrades) |
| **POR QUE falla** (Cause) | One of the 46 official VSC causes from the FM Table (e.g., Contamination, Mechanical overload, Age, Cyclic loading) |

**Combined format:** `[What] -> [Mechanism] due to [Cause]`
**Example:** `Impeller -> Wears due to Abrasion` | `Bearing -> Overheats/Melts due to Lack of lubrication` | `Cable -> Short-Circuits due to Breakdown in insulation`

#### The 18 Official VSC Failure Mechanisms

Arcs | Blocks | Breaks/Fracture/Separates | Corrodes | Cracks | Degrades | Distorts | Drifts | Expires | Immobilised (binds/jams) | Looses Preload | Open-Circuit | Overheats/Melts | Severs (cut, tear, hole) | Short-Circuits | Thermally Overloads | Washes Off | Wears

#### Compliance Rules for Criticality Analysis

1. **NO ad-hoc failure mode descriptions.** When documenting dominant failure modes in the criticality assessment, always decompose into What + Mechanism + Cause per the VSC FM Table.
2. **Failure data classification:** When historical failure data is provided and analyzed in Step 4 (Analyze failure data), dominant failure modes must be mapped to VSC FM Table mechanisms and causes before scoring probability.
3. **Cross-reference column:** The FM Table includes "Other Mechanisms grouped" and "Other Causes grouped" columns — use these to aggregate failure modes during criticality scoring when multiple similar mechanisms affect the same equipment.
4. **Downstream consistency:** Criticality analysis outputs that feed into RCM/FMECA (for AA and A tier equipment) must use the same VSC FM Table classification, ensuring seamless transition from criticality to detailed failure mode analysis.
5. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency.

### Tier Assignment Logic

```
Weighted_Score = SUM(Ci * Wi) * P_Frequency * Detection_Factor

Where:
- Ci = Consequence score for category i
- Wi = Weight for category i
- P_Frequency = Probability score
- Detection_Factor = 1 + (5 - P_Detection) * 0.1

Tier Assignment:
- AA: Weighted_Score >= 80th percentile AND (C_Safety >= 4 OR single point of failure with C_Production >= 4)
- A:  Weighted_Score >= 60th percentile OR any Ci >= 4
- B:  Weighted_Score >= 30th percentile
- C:  Weighted_Score < 30th percentile

Override Rules:
- Any equipment with C_Safety = 5 is automatically AA regardless of score.
- Any equipment with no redundancy AND C_Production >= 4 is minimum A.
- Any equipment with full redundancy (hot standby) can be downgraded one tier from calculated.
```

---

## Step-by-Step Execution

### Phase 1: Input Processing & Validation (Steps 1-3)

**Step 1: Receive and validate inputs.**
- Confirm equipment list contains required fields (tag, description, system).
- Validate failure data format and completeness if provided.
- Identify industry sector from process context.
- Flag missing data and request clarification if critical inputs are absent.

**Step 2: Establish analysis scope.**
- Define the system boundary (which equipment is in scope).
- Identify the number of equipment items to be assessed.
- Confirm the level of analysis (component, equipment, or system level).
- Set the functional hierarchy (plant > area > system > subsystem > equipment).

**Step 3: Calibrate scoring criteria.**
- Adapt consequence scales to the specific industry and site context.
- Adjust production loss thresholds based on provided production rates and unit economics.
- Confirm weighting factors with user or use defaults.
- Document any deviations from default scales.

### Phase 2: Data Analysis (Steps 4-6)

**Step 4: Analyze failure data (if available).**
- Calculate failure rates, MTBF, MTTR per equipment.
- Identify dominant failure modes per equipment, classified per the VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) using the three-part structure: What + Mechanism + Cause.
- Determine historical consequence severity from failure records.
- Flag equipment with insufficient data (< 3 failure events) for qualitative-only assessment.

**Step 5: Determine redundancy and process criticality.**
- Map equipment redundancy configuration from inputs.
- Identify single points of failure in the process.
- Assess equipment function (is it in the critical production path?).
- Determine if standby/backup equipment exists and its readiness state.

**Step 6: Score each equipment item.**
- Assign consequence scores (C_Safety, C_Environmental, C_Production, C_Maintenance_Cost, C_Reputation) for each equipment.
- Assign probability scores based on failure data or expert judgment.
- Assign detectability scores based on existing monitoring/inspection capabilities.
- Calculate weighted criticality score.
- Apply tier assignment logic including override rules.
- Document justification for each tier assignment.

### Phase 3: Output Generation (Steps 7-9)

**Step 7: Build the criticality matrix.**
- Populate the `.xlsx` workbook with all sheets as specified.
- Format the matrix with conditional formatting (color-coded tiers).
- Generate summary statistics and distribution charts.
- Create the Pareto chart of criticality scores.

**Step 8: Quality check and consistency review.**
- Verify that tier distribution follows expected patterns (typically 5-10% AA, 15-20% A, 40-50% B, 25-35% C).
- Check for scoring inconsistencies (e.g., similar equipment with very different scores).
- Validate override rules were correctly applied.
- Confirm all equipment items received a tier assignment.

**Step 9: Generate recommendations.**
- List equipment recommended for detailed RCM analysis (typically AA and A tier).
- List equipment suitable for condition-based monitoring.
- Identify equipment where additional failure data collection is needed.
- Suggest review frequency for the criticality assessment (typically every 2-3 years or after significant changes).

---

## Quality Criteria

### Completeness
- [ ] 100% of in-scope equipment has a criticality tier assigned.
- [ ] All scoring criteria have documented definitions.
- [ ] Methodology sheet is complete with assumptions and limitations.
- [ ] Justification provided for every AA and A tier assignment.

### Consistency
- [ ] Similar equipment in similar service receives comparable scores (within 1 point per criterion).
- [ ] Override rules are consistently applied.
- [ ] Tier distribution is within expected ranges.
- [ ] Scores align with provided failure data (where available).

### Traceability
- [ ] Every score can be traced to an input data point or stated assumption.
- [ ] Weighting factors and scale definitions are documented.
- [ ] Deviations from standard methodology are documented and justified.

### Usability
- [ ] Output file opens correctly in Excel with all formatting intact.
- [ ] Summary sheet provides quick overview without needing to review full matrix.
- [ ] Column headers are clear and self-explanatory.
- [ ] Conditional formatting aids visual interpretation.

---

## Inter-Agent Dependencies

### Upstream Dependencies (receives input from)

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `extract-data-from-docs` (B-EXT-001) | Structured equipment lists from P&IDs/datasheets | Equipment list population |
| Project Orchestrator | Project context, scope definition, client requirements | Analysis framing |
| Data Ingestion Agent | Historical failure data from CMMS exports | Failure data for scoring |

### Downstream Consumers (provides output to)

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `model-ram-simulation` (B-RAM-001) | Critical equipment list, failure parameters | RAM modeling scope definition |
| `analyze-reliability` (B-REL-001) | Equipment failure data filtered by criticality tier | Focused reliability analysis |
| `model-opex-budget` (B-OPEX-001) | Criticality-driven maintenance strategy costs | OPEX budget allocation |
| `analyze-lifecycle-cost` (B-LCC-001) | Equipment criticality tier for LCC prioritization | LCC analysis scoping |
| `create-client-presentation` (C-PRES-001) | Summary tables and charts | Client deliverable creation |
| `create-weekly-report` (C-WEEK-001) | Analysis progress and preliminary results | Progress reporting |

---

## Templates & References

### Templates
- `templates/criticality_matrix_template.xlsx` - Standard workbook template with pre-formatted sheets.
- `templates/consequence_scales_mining.xlsx` - Mining industry consequence scale calibration.
- `templates/consequence_scales_oilgas.xlsx` - Oil & gas industry consequence scale calibration.
- `templates/consequence_scales_energy.xlsx` - Energy/power generation consequence scale calibration.

### Reference Documents
- VSC internal: "Guia Metodologica - Analisis de Criticidad v3.0"
- ISO 14224:2016 - Collection and exchange of reliability and maintenance data
- NORSOK Z-008:2017 - Risk based maintenance and consequence classification
- OREDA Handbook - Offshore and Onshore Reliability Data

---

## Examples

### Example 1: Mining Concentrator Plant

**Input:**
- Equipment list: 47 items in a copper concentrator (SAG mill, ball mills, cyclones, flotation cells, thickeners, pumps, conveyors).
- Process context: Copper concentrator processing 50,000 TPD, single-line configuration for primary grinding.
- Failure data: 3 years of CMMS data from SAP PM.

**Expected Output:**
- SAG Mill classified as **AA** (single point of failure, C_Production = 5, no redundancy).
- Ball Mill #1 classified as **A** (critical but Ball Mill #2 provides partial redundancy).
- Flotation Cell #6 of 12 classified as **B** (individual cell loss has moderate impact).
- Tailings sump agitator classified as **C** (redundant, low consequence of failure).

**Tier Distribution:** AA: 4 (9%), A: 9 (19%), B: 22 (47%), C: 12 (26%).

### Example 2: Water Treatment Plant

**Input:**
- Equipment list: 85 items across intake, treatment, and distribution.
- Process context: Municipal water treatment, 500 L/s capacity, regulatory compliance required.
- No failure data available (new facility).

**Expected Output:**
- Chlorination system classified as **AA** (safety/regulatory, C_Safety = 5 override).
- Raw water pumps classified as **A** (2x100% configuration but critical function).
- Filter backwash pump classified as **B** (important but intermittent duty).
- Garden irrigation pump classified as **C** (non-critical auxiliary).

**Tier Distribution:** AA: 7 (8%), A: 15 (18%), B: 38 (45%), C: 25 (29%).
