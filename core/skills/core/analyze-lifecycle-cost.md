# Analyze Lifecycle Cost

## Skill ID: B-LCC-003

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P1 - Critical (drives investment decisions and maintenance strategy economics)

---

## Purpose

Perform Life Cycle Cost (LCC) and Total Cost of Ownership (TCO) analysis for industrial assets, enabling economically optimal decisions across acquisition, operation, maintenance, and disposal phases. This analysis provides the financial foundation for asset management strategy, capital planning, equipment selection, and maintenance policy optimization.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Construct** a comprehensive LCC/TCO model covering all cost phases of an asset's life cycle.
2. **Calculate** present value costs using discounted cash flow methodology.
3. **Compare** alternatives (e.g., repair vs. replace, OEM vs. alternative, different maintenance strategies).
4. **Identify** the economically optimal replacement timing (economic life).
5. **Generate** structured outputs in `.xlsx` format with full cost breakdowns, sensitivity analysis, and decision support.

The analysis follows ISO 15663 (Petroleum and natural gas - Life cycle costing) and IEC 60300-3-3 (Dependability management - Life cycle costing) principles.

---

## Trigger / Invocation

**Command:** `/analyze-lifecycle-cost`

**Trigger Conditions:**
- User requests LCC, TCO, or whole-life cost analysis.
- A capital investment decision requires economic justification.
- Comparison of equipment alternatives or maintenance strategies is needed.
- Asset replacement timing optimization is required.

**Aliases:**
- `/lcc-analysis`
- `/total-cost-ownership`
- `/tco`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `asset_description` | Text | Asset type, specifications, and operational context |
| `capex_data` | `.xlsx`, JSON, or text | Acquisition costs: purchase price, installation, commissioning, engineering |
| `opex_projections` | `.xlsx` or text | Annual operating and maintenance costs (labor, materials, energy, consumables) |
| `analysis_period` | Number | Analysis horizon in years |
| `discount_rate` | Number | Real or nominal discount rate (%) |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `failure_data` | `.xlsx` | Historical failure rates and repair costs for reliability-based cost modeling |
| `degradation_model` | Text or `.xlsx` | Performance degradation curve (efficiency loss, output decline) |
| `energy_consumption` | `.xlsx` or text | Energy consumption profile and energy cost projections |
| `salvage_value` | Number | Estimated residual/salvage value at end of life |
| `disposal_cost` | Number | End-of-life disposal, decommissioning, remediation costs |
| `alternatives` | `.xlsx` | Multiple equipment options or strategy options for comparison |
| `inflation_rates` | `.xlsx` or text | Differential inflation rates by cost category |
| `tax_implications` | Text | Depreciation schedules, tax credits, or incentives |
| `production_value` | Number | Revenue/production value per unit for opportunity cost calculation |
| `risk_factors` | `.xlsx` | Risk events with probability and cost impact |

### Input Validation Rules

1. CAPEX must include at minimum: equipment purchase price.
2. OPEX must cover at minimum: maintenance labor, maintenance materials, energy.
3. Discount rate must be between 0% and 25%.
4. Analysis period must be between 1 and 50 years.
5. If alternatives are provided, all must use consistent assumptions and boundaries.

---

## Output Specification

### Primary Output: LCC Model (`.xlsx`)

**File naming:** `{project_code}_LCC_model_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Key results: total LCC, annualized cost, recommended option, payback period |
| `Cost Breakdown` | Hierarchical cost breakdown by phase and category |
| `Cash Flow Profile` | Year-by-year cash flow table with NPV calculations |
| `Cost Comparison` | Side-by-side comparison of alternatives (if applicable) |
| `Economic Life` | Optimal replacement timing analysis |
| `Sensitivity` | Sensitivity analysis of key cost drivers |
| `Risk Adjusted` | Risk-adjusted costs including probabilistic events |
| `Assumptions` | Full list of assumptions, data sources, and methodology notes |
| `Charts` | Cost breakdown pie chart, cash flow waterfall, comparison bar chart data |

### Cash Flow Profile - Column Structure

| Column | Description |
|--------|-------------|
| `Year` | Year number (0 = acquisition, 1-N = operating years) |
| `CAPEX` | Capital expenditure (Year 0 + major overhauls) |
| `Preventive Maintenance` | Scheduled/planned maintenance costs |
| `Corrective Maintenance` | Unplanned repair costs (reliability-based) |
| `Energy` | Energy/utility costs |
| `Consumables` | Consumable materials and supplies |
| `Labor (Operations)` | Operating labor costs |
| `Insurance` | Insurance premiums |
| `Downtime Cost` | Production loss / opportunity cost of downtime |
| `Major Overhauls` | Scheduled major maintenance events |
| `Disposal/Salvage` | End-of-life costs (positive) or salvage value (negative) |
| `Total Annual Cost` | Sum of all cost categories |
| `Discount Factor` | (1 + r)^(-t) |
| `NPV Annual Cost` | Total Annual Cost * Discount Factor |
| `Cumulative NPV` | Running total of NPV |

---

## Methodology & Standards

### Reference Standards

| Standard | Application |
|----------|-------------|
| ISO 15663:2000 | Life cycle costing methodology for petroleum/gas industry |
| IEC 60300-3-3:2017 | Dependability management - Life cycle costing |
| ISO 55000:2014 | Asset management - cost optimization principle |
| ASTM E917 | Practice for Measuring Life-Cycle Costs of Buildings and Systems |
| AS/NZS 4536 | Life cycle costing - An application guide |

### LCC Cost Structure (ISO 15663 aligned)

```
Total LCC = CAPEX + OPEX + Risk Costs + Disposal Costs - Salvage Value

Where:
CAPEX = Purchase + Engineering + Installation + Commissioning + Spares (initial)
OPEX = SUM over life of:
  - Preventive Maintenance (PM)
  - Corrective Maintenance (CM)
  - Operating Labor
  - Energy & Utilities
  - Consumables & Supplies
  - Insurance & Taxes
  - Major Overhauls / Turnarounds
  - Administrative Overhead

Risk Costs = SUM(Probability_i * Consequence_i) for identified risk events
Disposal = Decommissioning + Remediation + Removal - Scrap Value
```

### Discounted Cash Flow Methodology

```
NPV = SUM from t=0 to T of [Ct / (1 + r)^t]

Where:
- Ct = Total cost in year t
- r = Real discount rate (if using constant prices) or nominal rate (if using current prices)
- T = Analysis period in years

Equivalent Annual Cost (EAC):
EAC = NPV * [r(1+r)^T] / [(1+r)^T - 1]
```

### Corrective Maintenance Cost Estimation (reliability-based)

```
Annual CM Cost = Failure_Rate * (MTTR * Labor_Rate + Average_Repair_Material_Cost + Downtime_Cost)

Where:
- Failure_Rate = 1 / MTBF (failures per year)
- MTTR = Mean Time To Repair (hours)
- Labor_Rate = Maintenance labor cost per hour (including overhead)
- Average_Repair_Material_Cost = Average spare parts and materials per repair
- Downtime_Cost = Production_Rate * Margin * MTTR (opportunity cost)
```

### Economic Life Calculation

```
Economic Life = Year t* where EAC(t*) is minimized

EAC(t) = [CAPEX * CRF(t) + PV(OPEX through year t) * CRF(t)]

Where CRF(t) = Capital Recovery Factor = r(1+r)^t / [(1+r)^t - 1]
```

---

## Step-by-Step Execution

### Phase 1: Model Setup (Steps 1-3)

**Step 1: Define scope and boundaries.**
- Identify the asset(s) to be analyzed.
- Define system boundaries (what costs are included/excluded).
- Confirm the analysis period and discount rate.
- Identify if this is a single-asset LCC or a comparison of alternatives.

**Step 2: Gather and organize cost data.**
- Structure CAPEX data by component (purchase, installation, engineering, commissioning).
- Structure OPEX data by category and year.
- Identify major overhaul schedules and costs.
- Determine energy consumption profiles and cost escalation rates.
- Estimate corrective maintenance costs from failure data (if available).

**Step 3: Establish assumptions and escalation.**
- Define inflation/escalation rates per cost category.
- Set labor rate escalation (may differ from general inflation).
- Define energy cost escalation trajectory.
- Document all assumptions with sources and confidence levels.
- Apply differential escalation if using nominal discount rate.

### Phase 2: Model Construction (Steps 4-6)

**Step 4: Build year-by-year cash flow model.**
- Create annual cost projections for each cost category.
- Apply escalation factors to base-year costs.
- Include scheduled major overhauls at appropriate intervals.
- Model corrective maintenance costs with potential increase over asset age.
- Include degradation effects on performance/energy efficiency.

**Step 5: Calculate LCC metrics.**
- Calculate NPV of all cash flows.
- Calculate Equivalent Annual Cost (EAC).
- Determine economic life (optimal replacement timing).
- Calculate cost per unit of output (e.g., USD/ton, USD/MWh, USD/m3).
- If comparing alternatives, calculate differential NPV and incremental benefits.

**Step 6: Perform sensitivity analysis.**
- Identify top 5-8 cost drivers.
- Test sensitivity of LCC to +/-20% variation in each driver.
- Create tornado diagram ranking variable impact.
- Identify break-even values for key decision parameters.

### Phase 3: Output & Recommendations (Steps 7-9)

**Step 7: Build output workbook.**
- Populate all sheets as specified.
- Create charts: cost breakdown pie, cash flow waterfall, comparison bars.
- Format with conditional formatting and clear labels.
- Include data validation and formula documentation.

**Step 8: Risk-adjusted analysis.**
- If risk factors provided, calculate expected risk costs.
- Add risk-adjusted LCC as a separate view.
- Quantify contingency recommendation based on risk exposure.

**Step 9: Formulate recommendations.**
- State the recommended option/strategy with economic justification.
- Quantify the economic advantage of the recommended option.
- Highlight key risks and their financial impact.
- Recommend timing for asset replacement (if applicable).
- Identify opportunities for cost reduction.

---

## Quality Criteria

### Financial Accuracy
- [ ] NPV calculations use correct discount factors for each year.
- [ ] Cost escalation is consistently applied across all categories.
- [ ] Major overhaul costs are placed in correct years.
- [ ] Salvage/disposal values are applied at end of analysis period.
- [ ] EAC calculation is mathematically correct.

### Model Integrity
- [ ] Cash flow totals reconcile across all sheets.
- [ ] Sensitivity analysis results are consistent with the base model.
- [ ] All formulas reference correct cells (no hardcoded values in formulas).
- [ ] Model handles different analysis periods correctly.

### Completeness
- [ ] All relevant cost categories are included.
- [ ] Assumptions sheet documents every key assumption.
- [ ] Sensitivity tests cover all major cost drivers.
- [ ] Comparison of alternatives uses consistent boundaries and assumptions.

### Decision Support
- [ ] Executive summary clearly states the recommendation.
- [ ] Economic advantage is quantified in absolute and relative terms.
- [ ] Key risks and their financial impact are highlighted.
- [ ] Break-even analysis identifies critical thresholds.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-equipment-criticality` (B-CRIT-001) | Equipment criticality tier | Prioritize LCC analysis for critical assets |
| `analyze-reliability` (B-REL-004) | Failure rates, MTBF, Weibull parameters | Corrective maintenance cost estimation |
| `model-opex-budget` (B-OPEX-008) | Detailed OPEX breakdown | OPEX input for LCC model |
| `extract-data-from-docs` (C-EXT-014) | Equipment specifications, costs from datasheets | CAPEX and technical parameter input |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `analyze-scenarios` (B-SCEN-002) | LCC base case parameters | Scenario/sensitivity analysis |
| `create-client-presentation` (C-PRES-012) | LCC comparison charts and tables | Client deliverable |
| `create-case-study` (C-CASE-019) | LCC savings and ROI calculations | Case study value demonstration |

---

## Templates & References

### Templates
- `templates/lcc_model_template.xlsx` - Standard LCC workbook with pre-built formulas.
- `templates/lcc_comparison_template.xlsx` - Multi-alternative comparison template.
- `templates/cost_category_checklist.xlsx` - Checklist of cost categories to ensure completeness.

### Reference Documents
- VSC internal: "Metodologia LCC para Proyectos de Gestion de Activos v2.5"
- ISO 15663:2000 - Life cycle costing for petroleum and natural gas
- IEC 60300-3-3:2017 - Dependability management, Part 3-3: Application guide - Life cycle costing

---

## Examples

### Example 1: Pump Replacement Decision

**Input:**
- Existing pump: 15 years old, increasing failures (4/year), MTTR 8h, repair cost USD 12K avg.
- New pump option A: USD 85K installed, expected 0.5 failures/year, MTTR 4h.
- New pump option B: USD 120K installed, expected 0.3 failures/year, MTTR 3h, 15% more energy efficient.
- Analysis period: 10 years, discount rate: 8%.

**Expected Output:**
- Existing pump 10-year NPV: USD 520K (rising CM costs dominate).
- Option A 10-year NPV: USD 310K (lower TCO, moderate improvement).
- Option B 10-year NPV: USD 285K (highest CAPEX but energy savings offset).
- Recommendation: Option B with payback in 3.2 years vs. existing, 5.1 years vs. Option A.

### Example 2: Mining Haul Truck Fleet LCC

**Input:**
- New fleet: 10 x 240-ton haul trucks, USD 5.5M each.
- Operating context: copper mine, 8,000 operating hours/year, 15-year life.
- OPEX: tires USD 180K/year, engine rebuild at 20,000h (USD 400K), fuel USD 1.2M/year per truck.
- Discount rate: 10%.

**Expected Output:**
- Per-truck LCC: USD 28.5M NPV over 15 years (CAPEX 19%, Fuel 42%, Maintenance 27%, Tires 6%, Other 6%).
- Fleet LCC: USD 285M NPV.
- Economic life: 12 years (EAC minimized, increasing maintenance costs vs. declining capital recovery).
- Key sensitivity: fuel price (+/-25% changes LCC by +/-10.5%).
