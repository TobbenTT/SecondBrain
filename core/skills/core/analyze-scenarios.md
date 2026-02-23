# Analyze Scenarios

## Skill ID: B-SCEN-002

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P2 - High (supports strategic decision-making and investment justification)

---

## Purpose

Perform economic and operational scenario analysis (what-if modeling) to evaluate the impact of varying key parameters on project outcomes, asset performance, and financial returns. This skill enables structured sensitivity analysis, multi-scenario comparison, and risk-adjusted decision support for industrial asset management projects.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Define** a base case scenario from provided parameters (financial, operational, or technical).
2. **Identify** key variables for sensitivity testing based on uncertainty and impact.
3. **Generate** multiple scenarios (optimistic, pessimistic, most likely, and user-defined) with systematically varied parameters.
4. **Calculate** the impact of parameter variations on target KPIs (NPV, IRR, availability, production output, OPEX, etc.).
5. **Produce** tornado diagrams, spider charts, and scenario comparison tables.
6. **Deliver** results in `.xlsx` (model) and `.pptx` (executive presentation) formats.

The analysis must be transparent, reproducible, and suitable for executive-level decision-making.

---

## Trigger / Invocation

**Command:** `/analyze-scenarios`

**Trigger Conditions:**
- User requests "what-if analysis," "sensitivity analysis," or "scenario comparison."
- A project requires evaluation of multiple investment or operational alternatives.
- Upstream analysis (e.g., LCC, RAM, OPEX budget) needs to be stress-tested against parameter uncertainty.

**Aliases:**
- `/what-if`
- `/sensitivity-analysis`
- `/scenario-comparison`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `base_case_parameters` | `.xlsx`, JSON, or structured text | Complete set of parameters defining the base case scenario |
| `variables_to_test` | List (text or `.xlsx`) | Parameters to vary, with proposed ranges (min, max, or discrete values) |
| `target_kpis` | List | KPIs to measure impact on (e.g., NPV, IRR, availability, OPEX) |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `calculation_model` | `.xlsx` | Existing financial/operational model to use as engine |
| `scenario_definitions` | `.xlsx` or JSON | Pre-defined scenario sets with specific parameter combinations |
| `probability_distributions` | `.xlsx` or JSON | Statistical distributions for Monte Carlo-based scenario analysis |
| `constraints` | Text | Physical, regulatory, or business constraints on variable ranges |
| `discount_rate` | Number | Discount rate for NPV calculations (default: 8-10%) |
| `analysis_horizon` | Number | Time horizon in years for the analysis |
| `presentation_template` | `.pptx` | VSC branded template for output presentation |

### Input Validation Rules

1. Base case must contain at least 3 quantifiable parameters.
2. Variables to test must have defined ranges (minimum and maximum values, or discrete options).
3. Target KPIs must be calculable from the base case parameters.
4. Variable ranges must be physically and operationally realistic.

---

## Output Specification

### Primary Output 1: Scenario Model (`.xlsx`)

**File naming:** `{project_code}_scenario_analysis_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Key findings, recommended scenario, risk highlights |
| `Base Case` | Full base case parameter set and calculated KPIs |
| `Sensitivity Table` | One-at-a-time sensitivity results for each variable |
| `Tornado Data` | Ranked impact data for tornado diagram |
| `Spider Chart Data` | Multi-variable sensitivity data for spider/radar chart |
| `Scenario Comparison` | Side-by-side comparison of all defined scenarios |
| `Scenario Details` | Detailed calculations for each scenario |
| `Monte Carlo Results` | Distribution of outcomes if probabilistic analysis performed |
| `Assumptions` | Full list of assumptions, constraints, and data sources |

### Primary Output 2: Executive Presentation (`.pptx`)

**File naming:** `{project_code}_scenario_analysis_presentation_{YYYYMMDD}.pptx`

**Slide structure:**

| Slide | Content |
|-------|---------|
| 1 | Title slide with project name and date |
| 2 | Analysis objective and scope |
| 3 | Base case summary (key parameters and KPIs) |
| 4 | Tornado diagram - sensitivity ranking |
| 5 | Spider chart - multi-variable sensitivity |
| 6 | Scenario comparison table |
| 7 | Scenario comparison charts (bar/column) |
| 8 | Risk assessment and key drivers |
| 9 | Recommendations and decision framework |
| 10 | Appendix - assumptions and methodology |

---

## Methodology & Standards

### Analysis Types

#### 1. One-at-a-Time (OAT) Sensitivity Analysis
- Vary each parameter individually while holding others at base case.
- Test at minimum: -20%, -10%, base, +10%, +20% (or custom ranges).
- Calculate impact on each target KPI.
- Rank variables by impact magnitude for tornado diagram.

#### 2. Multi-Variable Scenario Analysis
- Define discrete scenarios (minimum 3: pessimistic, base, optimistic).
- Each scenario sets multiple variables simultaneously.
- Calculate all target KPIs for each scenario.
- Present side-by-side comparison.

#### 3. Monte Carlo Simulation (if probability distributions provided)
- Run minimum 10,000 iterations.
- Sample from defined probability distributions.
- Generate output distribution histograms.
- Report P10, P50, P90 values for target KPIs.
- Calculate probability of meeting threshold values.

### Scenario Definition Framework

| Scenario | Description | Parameter Selection Logic |
|----------|-------------|--------------------------|
| **Pessimistic (P90)** | Worst realistic case | 10th percentile of favorable variables, 90th of unfavorable |
| **Conservative** | Below-average conditions | 25th percentile of favorable, 75th of unfavorable |
| **Base Case (P50)** | Most likely / expected | Mean or mode of all distributions |
| **Optimistic (P10)** | Best realistic case | 90th percentile of favorable, 10th of unfavorable |
| **Stress Test** | Extreme downside | Simultaneous worst-case for top 3 impact variables |

### Common Variable Categories for Industrial Projects

| Category | Variables | Typical Range |
|----------|-----------|---------------|
| **Economic** | Commodity prices, exchange rates, inflation, discount rate | +/- 20-30% |
| **Operational** | Availability, throughput, utilization, quality | +/- 5-15% |
| **Cost** | Labor rates, energy costs, spare parts, contractor rates | +/- 10-25% |
| **Technical** | Failure rates, MTTR, equipment life, degradation rate | +/- 15-30% |
| **Schedule** | Project duration, ramp-up time, commissioning delays | +/- 10-50% |

---

## Step-by-Step Execution

### Phase 1: Setup (Steps 1-3)

**Step 1: Parse and validate base case.**
- Extract all parameters from provided base case data.
- Identify parameter types (economic, operational, technical, schedule).
- Calculate base case KPIs to establish reference values.
- Validate that the base case produces reasonable results.

**Step 2: Define sensitivity variables and ranges.**
- Review user-specified variables to test.
- If not provided, recommend top 10-15 variables based on typical impact and uncertainty.
- Validate that proposed ranges are physically and operationally realistic.
- Confirm variable independence assumptions (or note correlations).

**Step 3: Establish calculation model.**
- If an existing model is provided, validate its structure and formulas.
- If no model exists, build a simplified calculation engine linking inputs to KPIs.
- Document all formulas and relationships.
- Verify model produces correct base case results.

### Phase 2: Analysis Execution (Steps 4-6)

**Step 4: Run one-at-a-time sensitivity analysis.**
- For each variable, calculate KPI values at each test point (e.g., -20%, -10%, 0%, +10%, +20%).
- Record absolute and percentage change in each KPI.
- Rank variables by impact magnitude on the primary KPI.
- Generate tornado diagram data.

**Step 5: Run multi-variable scenario analysis.**
- Calculate KPI values for each defined scenario.
- Create scenario comparison table with all KPIs.
- Calculate incremental differences between scenarios.
- Identify break-even points and threshold crossings.

**Step 6: Run Monte Carlo simulation (if applicable).**
- Define probability distributions for each variable.
- Execute simulation runs (minimum 10,000 iterations).
- Generate output distributions for each KPI.
- Calculate statistical measures (mean, std dev, percentiles).
- Determine probability of meeting specific thresholds.

### Phase 3: Output & Interpretation (Steps 7-9)

**Step 7: Build analysis workbook.**
- Populate all sheets with calculated results.
- Create formatted tables with conditional formatting.
- Generate chart data for tornado, spider, and comparison charts.
- Include all assumptions and methodology documentation.

**Step 8: Build executive presentation.**
- Create clear, executive-level slides following the specified structure.
- Embed charts and tables with consistent formatting.
- Write concise insights and recommendations per slide.
- Ensure visual consistency with VSC brand guidelines.

**Step 9: Synthesize key findings.**
- Identify the top 3-5 most impactful variables.
- Highlight scenarios that cross critical thresholds (e.g., NPV turns negative).
- Provide specific, actionable recommendations.
- Quantify the value of information / value of flexibility.

---

## Quality Criteria

### Analytical Rigor
- [ ] Base case KPIs are correctly calculated and validated.
- [ ] Sensitivity ranges are realistic and justified.
- [ ] Tornado diagram correctly ranks variables by impact magnitude.
- [ ] All scenarios are internally consistent (no contradictory assumptions).
- [ ] Monte Carlo results converge (if applicable, check with 5,000 vs 10,000 iterations).

### Clarity of Communication
- [ ] Executive summary clearly states the "so what" for decision-makers.
- [ ] Charts are properly labeled with titles, axes, units, and legends.
- [ ] Recommendations are specific, actionable, and linked to analysis results.
- [ ] Assumptions are transparent and accessible.

### Completeness
- [ ] All user-specified variables are tested.
- [ ] All user-specified KPIs are reported.
- [ ] Both upside and downside variations are covered.
- [ ] Break-even and threshold values are identified where relevant.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-lifecycle-cost` (B-LCC-003) | LCC base case parameters | LCC sensitivity analysis |
| `model-ram-simulation` (B-RAM-007) | RAM model parameters | Availability/reliability sensitivity |
| `model-opex-budget` (B-OPEX-008) | OPEX budget parameters | Budget sensitivity analysis |
| `analyze-equipment-criticality` (B-CRIT-001) | Criticality-driven cost parameters | Risk-based scenario definition |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-client-presentation` (C-PRES-012) | Charts, tables, key findings | Client deliverable creation |
| `create-executive-briefing` (C-BRIEF-018) | Summary findings and recommendations | Pre-meeting preparation |
| `create-case-study` (C-CASE-019) | Scenario results demonstrating value | Case study development |

---

## Templates & References

### Templates
- `templates/scenario_analysis_template.xlsx` - Standard workbook with pre-formatted sheets and formulas.
- `templates/scenario_presentation_template.pptx` - VSC branded presentation template.
- `templates/tornado_chart_template.xlsx` - Pre-formatted tornado diagram template.

### Reference Documents
- VSC internal: "Guia de Analisis de Escenarios y Sensibilidad v2.0"
- PMI Practice Standard for Scheduling (for schedule risk analysis)
- AACE International Recommended Practice 40R-08 (Contingency Estimating)

---

## Examples

### Example 1: Mining OPEX Optimization

**Input:**
- Base case: Annual OPEX USD 45M, availability 92%, throughput 50,000 TPD.
- Variables: labor cost (+/-15%), energy cost (+/-25%), spare parts cost (+/-20%), maintenance strategy (3 options), availability target (90-95%).
- Target KPIs: Total OPEX, unit cost (USD/ton), NPV of savings vs. current state.

**Expected Output:**
- Tornado showing energy cost and availability are the top two impact variables.
- Three scenarios show OPEX range of USD 38M-52M.
- Break-even availability for investment justification: 93.5%.
- Recommendation: Prioritize energy efficiency and availability improvement over labor cost reduction.

### Example 2: Desalination Plant Investment Decision

**Input:**
- Base case: CAPEX USD 120M, water price USD 0.85/m3, 25-year horizon.
- Variables: CAPEX (+/-20%), water price (+/-30%), discount rate (6-12%), membrane life (5-8 years), energy cost (+/-25%).
- Target KPIs: NPV, IRR, LCOW (levelized cost of water), payback period.

**Expected Output:**
- Spider chart showing water price and discount rate as dominant drivers.
- Pessimistic scenario: NPV = -USD 15M (project not viable if water price drops 25%).
- Monte Carlo: 72% probability of positive NPV, P50 IRR = 11.2%.
- Recommendation: Secure long-term water purchase agreement to de-risk investment.
