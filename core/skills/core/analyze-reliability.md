# Analyze Reliability

## Skill ID: B-REL-004

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P1 - Critical (foundational for maintenance strategy and RAM modeling)

---

## Purpose

Perform statistical reliability analysis of industrial equipment using Weibull analysis, exponential distribution modeling, and classical reliability metrics (MTBF, MTTR, failure rate). This skill transforms raw failure data into actionable reliability parameters that drive maintenance interval optimization, spare parts planning, and availability improvement.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Process** raw failure and maintenance data from CMMS exports or structured datasets.
2. **Fit** statistical distributions (Weibull 2P/3P, Exponential, Lognormal) to failure data.
3. **Calculate** key reliability metrics: MTBF, MTTR, failure rate (lambda), availability.
4. **Estimate** Weibull parameters (beta - shape, eta - characteristic life, gamma - location).
5. **Determine** failure patterns (infant mortality, random, wear-out) from beta parameter.
6. **Optimize** maintenance intervals based on reliability targets.
7. **Generate** `.xlsx` analysis with statistical results and reliability charts.

---

## Trigger / Invocation

**Command:** `/analyze-reliability`

**Trigger Conditions:**
- User provides failure data and requests reliability analysis.
- Maintenance interval optimization is needed.
- RAM modeling requires equipment reliability parameters.
- Equipment criticality analysis needs reliability-based failure rate inputs.

**Aliases:**
- `/reliability-analysis`
- `/weibull-analysis`
- `/mtbf-analysis`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `failure_data` | `.xlsx`, `.csv` | Failure records with dates, equipment IDs, and failure modes |
| `equipment_context` | Text | Equipment type, operating conditions, duty cycle |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `operating_hours` | `.xlsx` or number | Calendar-to-operating hours conversion, utilization factor |
| `suspension_data` | `.xlsx` | Right-censored data (equipment still running without failure) |
| `maintenance_records` | `.xlsx` | Preventive maintenance and repair records with durations |
| `equipment_population` | Number | Total number of identical equipment in the fleet |
| `operating_start_date` | Date | Start of operation for age-based analysis |
| `target_reliability` | Number | Desired reliability level (e.g., R(t) = 0.90) for interval calculation |
| `cost_data` | `.xlsx` | PM and CM costs for cost-optimized interval analysis |
| `grouping_criteria` | Text | How to group analysis (by equipment type, failure mode, system) |

### Failure Data Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `equipment_tag` | Equipment identifier | PU-2301A |
| `failure_date` | Date/time of failure | 2024-03-15 08:30 |
| `failure_mode` | Description of how it failed | Bearing seizure |
| `time_to_failure` | Operating time between failures (hours or days) | 4,320 hours |
| `repair_duration` | Time to repair (hours) | 6.5 hours |

### Input Validation Rules

1. Minimum 5 failure data points per equipment/failure mode for Weibull analysis (7+ preferred).
2. Failure dates must be chronologically ordered and within a plausible range.
3. Time-to-failure values must be positive non-zero numbers.
4. If operating hours are not provided, calendar time will be used with stated assumptions.
5. Suspension (censored) data must be clearly identified as such.

---

## Output Specification

### Primary Output: Reliability Analysis (`.xlsx`)

**File naming:** `{project_code}_reliability_analysis_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Summary` | Key findings: MTBF, MTTR, availability, Weibull parameters, failure pattern per equipment |
| `Data Preparation` | Cleaned and ranked failure data, median rank calculations |
| `Weibull Analysis` | Weibull parameters (beta, eta, gamma), goodness-of-fit metrics |
| `Reliability Curves` | R(t), F(t), f(t), h(t) curve data points for charting |
| `MTBF & MTTR` | Calculated MTBF, MTTR, availability per equipment and failure mode |
| `Optimal Intervals` | Reliability-based and cost-based optimal PM intervals |
| `Trend Analysis` | Failure trend analysis (improving, stable, or deteriorating) |
| `Charts Data` | Pre-formatted data for Weibull plot, reliability curve, bathtub curve, trend chart |
| `Methodology` | Statistical methods used, assumptions, confidence intervals |

### Summary Sheet - Key Metrics Table

| Metric | Per Equipment | Description |
|--------|--------------|-------------|
| `MTBF` | Hours or days | Mean Time Between Failures |
| `MTTR` | Hours | Mean Time To Repair |
| `Failure Rate (lambda)` | Failures/1000 hours | Instantaneous failure rate |
| `Availability (Ai)` | Percentage | Inherent availability = MTBF / (MTBF + MTTR) |
| `Weibull Beta` | Dimensionless | Shape parameter (failure pattern indicator) |
| `Weibull Eta` | Hours or days | Characteristic life (63.2% failures) |
| `Weibull Gamma` | Hours or days | Location parameter (failure-free period) |
| `B10 Life` | Hours or days | Time at which 10% of population will have failed |
| `Failure Pattern` | Text | Infant mortality / Random / Wear-out |
| `Optimal PM Interval` | Hours or days | Recommended preventive maintenance interval |
| `Confidence Level` | Percentage | Statistical confidence of the analysis |

---

## Methodology & Standards

### Reference Standards

| Standard | Application |
|----------|-------------|
| ISO 14224:2016 | Failure data collection and equipment taxonomy (failure mode classification per VSC Failure Modes Table) |
| IEC 61649:2008 | Weibull analysis methodology |
| IEC 60300-3-2 | Collection of dependability data from the field |
| MIL-HDBK-189 | Reliability growth management |
| IEEE 493 (Gold Book) | Recommended practice for reliability of industrial power systems |

### Weibull Distribution

The two-parameter Weibull distribution is the primary tool:

```
Reliability function:
R(t) = exp[-(t/eta)^beta]

Cumulative distribution function (CDF):
F(t) = 1 - exp[-(t/eta)^beta]

Probability density function (PDF):
f(t) = (beta/eta) * (t/eta)^(beta-1) * exp[-(t/eta)^beta]

Hazard function (failure rate):
h(t) = (beta/eta) * (t/eta)^(beta-1)

Where:
- beta (shape parameter) indicates failure pattern:
  beta < 1: Infant mortality (decreasing failure rate)
  beta = 1: Random failures (constant failure rate, exponential distribution)
  beta > 1: Wear-out (increasing failure rate)
  beta = 3.44: Approximates normal distribution

- eta (characteristic life): time at which 63.2% of the population has failed
```

### Three-Parameter Weibull

When a failure-free period exists:

```
R(t) = exp[-((t - gamma)/eta)^beta]   for t > gamma

Where gamma = minimum life (failure-free period / location parameter)
```

### Parameter Estimation Methods

1. **Median Rank Regression (MRR):** Default method for small samples (n < 20).
   - Calculate median ranks: F(i) = (i - 0.3) / (n + 0.4) [Bernard's approximation]
   - Linearize: ln(ln(1/(1-F))) vs. ln(t)
   - Fit by least squares regression
   - beta = slope, eta = exp(-intercept/slope)

2. **Maximum Likelihood Estimation (MLE):** Preferred for larger samples (n >= 20) and censored data.
   - Iteratively solve likelihood equations
   - Handles right-censored (suspended) data naturally
   - Provides confidence intervals for parameters

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** Every failure mode used in reliability analysis grouping, Weibull stratification, or failure classification MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted. Consistent failure mode classification is essential for meaningful statistical analysis.

#### Failure Mode Structure (Three-Part Definition)

Every failure mode in reliability analysis MUST follow this three-part structure to enable proper data stratification and Weibull parameter estimation per failure mode:

| Component | Definition |
|-----------|-----------|
| **QUE falla** (What) | The specific component, part, or element that fails (e.g., impeller, bearing, seal, filter, sensor, cable) |
| **COMO falla** (Mechanism) | One of the 18 official VSC mechanisms from the FM Table (e.g., Wears, Corrodes, Cracks, Blocks, Degrades) |
| **POR QUE falla** (Cause) | One of the 46 official VSC causes from the FM Table (e.g., Contamination, Mechanical overload, Age, Cyclic loading) |

**Combined format:** `[What] -> [Mechanism] due to [Cause]`
**Example:** `Impeller -> Wears due to Abrasion` | `Bearing -> Overheats/Melts due to Lack of lubrication` | `Cable -> Short-Circuits due to Breakdown in insulation`

#### The 18 Official VSC Failure Mechanisms

Arcs | Blocks | Breaks/Fracture/Separates | Corrodes | Cracks | Degrades | Distorts | Drifts | Expires | Immobilised (binds/jams) | Looses Preload | Open-Circuit | Overheats/Melts | Severs (cut, tear, hole) | Short-Circuits | Thermally Overloads | Washes Off | Wears

#### Compliance Rules for Reliability Analysis

1. **NO ad-hoc failure mode descriptions.** When classifying failure data for Weibull analysis, always decompose into What + Mechanism + Cause per the VSC FM Table. Generic descriptions like "bearing failure" must be refined to "Bearing -> Wears due to Contamination" or similar.
2. **Data stratification by failure mode:** Weibull analysis must be performed per distinct failure mode (Mechanism + Cause combination). Mixing different failure modes in a single Weibull analysis produces misleading beta and eta values — the VSC FM Table ensures consistent stratification.
3. **Cross-reference column:** The FM Table includes "Other Mechanisms grouped" and "Other Causes grouped" columns for reliability investigations — use these to aggregate statistically similar failure modes when individual sample sizes are insufficient (n < 5).
4. **Mixed failure mode detection (Step 3):** When checking for mixed failure populations, use the VSC FM Table mechanism categories to identify whether multiple distinct mechanisms are present in the dataset before fitting distributions.
5. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency in reliability parameters.

### Goodness-of-Fit Assessment

- **Correlation Coefficient (r^2):** r^2 > 0.90 indicates acceptable fit.
- **Anderson-Darling statistic:** Lower is better; compare against critical values.
- **Visual assessment:** Weibull probability plot linearity.
- If Weibull does not fit well, test Lognormal and Exponential distributions.

### Optimal PM Interval Calculation

**Reliability-based interval:**
```
t_PM = eta * [-ln(R_target)]^(1/beta)

Where R_target = desired reliability at PM interval (e.g., 0.90 for 90%)
```

**Cost-optimized interval (when cost data available):**
```
Minimize: C_total(t) = [Cp * R(t) + Cf * (1-R(t))] / integral[0 to t] R(u) du

Where:
- Cp = cost of planned maintenance
- Cf = cost of failure (repair + downtime + consequential costs)
- R(t) = reliability function at time t
```

---

## Step-by-Step Execution

### Phase 1: Data Preparation (Steps 1-3)

**Step 1: Ingest and clean failure data.**
- Parse failure records from provided data.
- Remove duplicate entries and obvious data errors.
- Convert all time values to consistent units (hours or days).
- Identify and flag outliers for review.
- Calculate time-to-failure (TBF) between consecutive failures.

**Step 2: Classify and group data (per VSC Failure Modes Table).**
- Group failures by equipment, failure mode, or system as specified.
- **MANDATORY:** Classify all failure modes using the VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) — each failure must be mapped to a specific Mechanism (from 18) and Cause (from 46) to enable proper Weibull stratification.
- Verify minimum sample size (n >= 5) per group; flag groups with insufficient data.
- Identify censored/suspended data (equipment still running).
- Determine if data is complete, right-censored, or interval-censored.

**Step 3: Prepare data for analysis.**
- Sort time-to-failure values in ascending order.
- Calculate median ranks (Bernard's approximation).
- Prepare linearized Weibull coordinates.
- Check for mixed failure modes (multiple failure populations).

### Phase 2: Statistical Analysis (Steps 4-7)

**Step 4: Fit Weibull distribution.**
- Apply MRR for small samples or MLE for larger/censored samples.
- Estimate beta (shape) and eta (characteristic life) parameters.
- Test 3-parameter Weibull if data suggests a failure-free period.
- Calculate goodness-of-fit metrics (r^2, Anderson-Darling).

**Step 5: Calculate reliability metrics.**
- MTBF = eta * Gamma(1 + 1/beta) [Weibull-based MTBF].
- Calculate MTTR from repair duration data.
- Inherent Availability: Ai = MTBF / (MTBF + MTTR).
- Calculate B10, B5, B1 lives (time to 10%, 5%, 1% failure probability).
- Generate reliability curve R(t) data points.

**Step 6: Interpret failure pattern.**
- Classify based on beta:
  - beta < 0.95: Infant mortality pattern - investigate installation quality, commissioning.
  - 0.95 <= beta <= 1.05: Random failures - time-based PM is not effective.
  - beta > 1.05: Wear-out pattern - time-based PM is appropriate.
  - beta > 3: Rapid wear-out - strict interval replacement warranted.
- Provide maintenance strategy implications for each pattern.

**Step 7: Calculate optimal PM intervals.**
- For wear-out failures (beta > 1): calculate reliability-based PM interval.
- If cost data available: calculate cost-optimized PM interval.
- Compare calculated intervals with current maintenance practice.
- Quantify availability improvement from optimized intervals.

### Phase 3: Output Generation (Steps 8-10)

**Step 8: Build analysis workbook.**
- Populate all sheets as specified in output structure.
- Create chart data for: Weibull probability plot, reliability curves, hazard function, trend analysis.
- Format summary with clear presentation of key metrics.

**Step 9: Perform trend analysis.**
- Test for reliability growth or deterioration over time.
- Plot failure rate trend (Crow-AMSAA or Duane model if applicable).
- Identify if current failure pattern is changing (accelerating degradation).

**Step 10: Formulate recommendations.**
- State recommended PM intervals with reliability justification.
- Identify failure modes where design changes are more effective than PM.
- Highlight equipment with insufficient data for reliable analysis.
- Recommend data collection improvements for future analyses.

---

## Quality Criteria

### Statistical Validity
- [ ] Minimum sample size requirements are met (n >= 5 per analysis group).
- [ ] Weibull fit achieves r^2 > 0.90 or acceptable Anderson-Darling statistic.
- [ ] Confidence intervals are reported for key parameters.
- [ ] Censored data is properly handled in parameter estimation.
- [ ] Mixed failure modes are identified and analyzed separately.

### Analytical Completeness
- [ ] All equipment/failure modes in scope are analyzed.
- [ ] Both time-domain and trend analyses are performed.
- [ ] PM interval recommendations include both reliability-based and cost-based (if data available).
- [ ] Current vs. recommended intervals are compared.

### Practical Relevance
- [ ] Failure patterns are interpreted with practical maintenance implications.
- [ ] Recommendations are operationally feasible.
- [ ] Results are consistent with engineering judgment and operating experience.
- [ ] Data limitations and confidence levels are clearly stated.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `extract-data-from-docs` (C-EXT-014) | Structured failure data from CMMS reports | Failure data input |
| `analyze-equipment-criticality` (B-CRIT-001) | Criticality tier | Prioritize reliability analysis for critical equipment |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `model-ram-simulation` (B-RAM-007) | Weibull parameters, failure rates, MTTR | RAM simulation input |
| `analyze-lifecycle-cost` (B-LCC-003) | Failure rates, repair costs | Corrective maintenance cost modeling |
| `analyze-equipment-criticality` (B-CRIT-001) | Failure frequency data | Probability scoring in criticality |
| `model-opex-budget` (B-OPEX-008) | Maintenance frequency and cost estimates | Budget planning |

---

## Templates & References

### Templates
- `templates/reliability_analysis_template.xlsx` - Standard workbook with formulas.
- `templates/weibull_plot_template.xlsx` - Pre-formatted Weibull probability plot.
- `templates/failure_data_collection_template.xlsx` - Standardized data collection format.

### Reference Documents
- VSC internal: "Guia de Analisis de Confiabilidad v3.0"
- Abernethy, R.B. "The New Weibull Handbook" (5th Edition)
- IEC 61649:2008 - Weibull analysis
- OREDA Handbook - Offshore and Onshore Reliability Data

---

## Examples

### Example 1: Conveyor Belt Drive Motor Analysis

**Input:**
- 18 failure events over 5 years for 4 identical drive motors.
- Failure modes: bearing failure (10 events), winding insulation (5 events), cooling fan (3 events).
- Average MTTR: 12 hours (bearing), 48 hours (winding), 4 hours (fan).

**Expected Output:**
- Bearing failures: beta = 2.1, eta = 8,200 hours (wear-out pattern).
  - Recommended PM: bearing replacement every 5,500 hours (R(t)=0.90).
- Winding insulation: beta = 3.8, eta = 28,000 hours (rapid wear-out).
  - Recommended PM: winding inspection/test every 18,000 hours.
- Cooling fan: beta = 0.8 (infant mortality - investigate installation practice).
  - Time-based PM not recommended; improve installation QA.
- Overall MTBF: 2,800 hours, Ai = 98.5%.

### Example 2: Slurry Pump Reliability Assessment

**Input:**
- 42 failure events across 8 identical slurry pumps over 3 years.
- Primary failure mode: impeller wear (28 events).
- Censored data: 3 pumps still running at analysis date.

**Expected Output:**
- Impeller wear: beta = 4.2, eta = 2,100 hours (rapid wear-out, predictable).
- B10 life: 1,200 hours (10% probability of failure).
- Optimal PM interval: impeller replacement at 1,400 hours (R=0.90, cost-optimized).
- Current practice: 2,000 hours (R=0.62 at current interval - too long).
- Projected availability improvement from interval optimization: 92.1% to 95.3%.
