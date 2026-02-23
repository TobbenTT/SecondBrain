# Analyze Benchmark

## Skill ID: B-BENCH-006

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P2 - High (provides external context for performance assessment and target-setting)

---

## Purpose

Perform benchmarking analysis comparing an organization's operational and asset management KPIs against industry peers, best-in-class performers, and recognized standards. This skill enables data-driven target-setting, identifies improvement opportunities, and provides external validation of performance levels for industrial and mining operations.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Collect** and normalize the client's current KPI data across key performance dimensions.
2. **Compare** against industry benchmarks using VSC's benchmark database, public industry data, and recognized standards.
3. **Identify** performance gaps and areas of relative strength.
4. **Quantify** the value of closing performance gaps (potential savings, production gains).
5. **Generate** outputs in `.xlsx` (detailed analysis) and `.pptx` (executive comparison) formats.

---

## Trigger / Invocation

**Command:** `/analyze-benchmark`

**Trigger Conditions:**
- User requests KPI benchmarking or industry comparison.
- A project needs external context for performance targets.
- Gap assessment requires industry reference points.
- Client needs to justify improvement investments with benchmark data.

**Aliases:**
- `/benchmark`
- `/kpi-comparison`
- `/industry-benchmark`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `current_kpis` | `.xlsx`, `.csv`, or structured text | Current KPI values with units and calculation methodology |
| `industry_sector` | Text | Industry for benchmark selection: mining, oil & gas, energy, water, manufacturing |
| `asset_context` | Text | Operational context: asset types, size, age, operating conditions |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `benchmark_database` | `.xlsx` | Custom or VSC benchmark database for comparison |
| `peer_group` | Text or list | Specific peer companies or operations for comparison |
| `target_quartile` | Text | Desired performance target: median, top quartile, top decile |
| `comparison_period` | Text | Time period for trend comparison (e.g., 3-year trend) |
| `kpi_definitions` | `.xlsx` or text | Definitions and calculation methods for provided KPIs |
| `financial_context` | `.xlsx` | Revenue, production volume, asset replacement value for normalization |
| `presentation_template` | `.pptx` | VSC branded template for output |

### Input Validation Rules

1. KPI data must include values, units, and the time period they cover.
2. Industry sector must be specified for relevant benchmark selection.
3. KPI calculation methods should be documented to ensure like-for-like comparison.
4. At least 5 KPIs must be provided for meaningful benchmarking.

---

## Output Specification

### Primary Output 1: Benchmark Analysis (`.xlsx`)

**File naming:** `{project_code}_benchmark_analysis_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Key findings, quartile positioning, top improvement opportunities |
| `KPI Dashboard` | All KPIs with current value, benchmark ranges (Q1-Q4), and positioning |
| `Detailed Comparison` | Per-KPI analysis with statistical distribution context |
| `Gap Quantification` | Value of closing gaps in financial/operational terms |
| `Normalization Notes` | How KPIs were normalized for fair comparison |
| `Benchmark Sources` | Data sources, sample sizes, vintage of benchmark data |
| `Trend Analysis` | Year-over-year trend comparison (if historical data provided) |
| `Improvement Targets` | Proposed targets with phased achievement timeline |

### Primary Output 2: Executive Presentation (`.pptx`)

**File naming:** `{project_code}_benchmark_presentation_{YYYYMMDD}.pptx`

**Slide structure:**

| Slide | Content |
|-------|---------|
| 1 | Title slide |
| 2 | Benchmarking scope and methodology |
| 3 | Overall performance positioning (radar/spider chart) |
| 4 | Quartile distribution summary (traffic light table) |
| 5-8 | Detailed KPI category comparisons (1 slide per category) |
| 9 | Top improvement opportunities ranked by value |
| 10 | Proposed targets and improvement timeline |
| 11 | Appendix - benchmark data sources and methodology |

---

## Methodology & Standards

### Benchmark KPI Framework

#### Maintenance & Reliability KPIs

| KPI | Unit | Typical Q1 | Typical Q2 | Typical Q3 | Typical Q4 |
|-----|------|-----------|-----------|-----------|-----------|
| Overall Equipment Availability | % | >95% | 92-95% | 88-92% | <88% |
| MTBF (weighted average) | Hours | >2000 | 1000-2000 | 500-1000 | <500 |
| MTTR (weighted average) | Hours | <4 | 4-8 | 8-16 | >16 |
| PM Compliance | % | >95% | 90-95% | 80-90% | <80% |
| Planned vs Unplanned Work | Ratio | >80:20 | 70:30 | 60:40 | <60:40 |
| Schedule Compliance | % | >90% | 80-90% | 70-80% | <70% |
| Maintenance Cost as % of RAV | % | <2.5% | 2.5-3.5% | 3.5-5% | >5% |
| Maintenance Cost per Ton | USD/ton | Varies | Varies | Varies | Varies |

#### Operational KPIs

| KPI | Unit | Application |
|-----|------|-------------|
| OEE (Overall Equipment Effectiveness) | % | Manufacturing, processing |
| Utilization Rate | % | Mobile equipment, fleet |
| Throughput vs Design Capacity | % | Process plants |
| Energy Intensity | kWh/ton | Processing, mining |
| Water Intensity | m3/ton | Mining, processing |
| Yield / Recovery | % | Processing, metallurgical |

#### Financial KPIs

| KPI | Unit | Application |
|-----|------|-------------|
| Maintenance Cost / Revenue | % | All industries |
| Maintenance Cost / RAV | % | All industries |
| CAPEX / RAV | % | Asset-intensive industries |
| Stores Inventory / RAV | % | All industries |
| Contractor Cost / Total Maintenance Cost | % | All industries |

#### People & Organization KPIs

| KPI | Unit | Application |
|-----|------|-------------|
| Maintenance FTE per Equipment Count | Ratio | All industries |
| Planner to Craftsman Ratio | Ratio | All industries |
| Training Hours per Employee per Year | Hours | All industries |
| Wrench Time (direct work time) | % | Maintenance workforce productivity |

### Normalization Methodology

To ensure fair comparison, KPIs must be normalized for:

1. **Scale:** Normalize costs by production volume, RAV, or revenue.
2. **Complexity:** Account for asset age, technology generation, and operating conditions.
3. **Geography:** Adjust for labor rates, energy costs, and regulatory environment.
4. **Scope:** Ensure consistent boundaries (e.g., include/exclude overhead, contractors).
5. **Operating conditions:** Mining depth, ore hardness, climate, continuous vs. batch operation.

### Benchmark Data Sources (Hierarchy)

1. **VSC proprietary database** - Client project data (anonymized).
2. **Industry associations** - ICMM, CIMM, SMRP, EFNMS benchmarking surveys.
3. **Published studies** - Solomon Associates, Independent Project Analysis (IPA), McKinsey.
4. **Public reporting** - Annual reports, sustainability reports, NI 43-101.
5. **Standards references** - SMRP Best Practices, EN 15341 maintenance KPIs.

---

## Step-by-Step Execution

### Phase 1: Data Preparation (Steps 1-3)

**Step 1: Validate and normalize client KPIs.**
- Verify KPI definitions and calculation methodology.
- Normalize KPIs to standard units and bases.
- Identify any KPIs that cannot be compared due to non-standard definitions.
- Document normalization adjustments applied.

**Step 2: Select appropriate benchmark set.**
- Identify the most relevant industry sub-sector.
- Select benchmark data matching the client's operational context.
- Determine sample size and vintage of benchmark data.
- Note any limitations of the available benchmark data.

**Step 3: Align KPI definitions.**
- Map client KPI definitions to benchmark KPI definitions.
- Identify and document any definition mismatches.
- Apply correction factors where definitions differ.
- Flag KPIs where comparison is approximate due to definition differences.

### Phase 2: Analysis (Steps 4-6)

**Step 4: Calculate quartile positioning.**
- For each KPI, determine the client's position relative to benchmark distribution.
- Classify into quartile: Q1 (top), Q2, Q3, Q4 (bottom).
- Calculate percentile ranking where sufficient data exists.
- Create traffic light scoring (Green=Q1-Q2, Yellow=Q3, Red=Q4).

**Step 5: Quantify improvement potential.**
- For each KPI below target quartile, calculate the gap.
- Translate KPI gaps into financial/operational impact.
- Estimate potential savings from reaching target quartile.
- Rank improvement opportunities by value.

**Step 6: Identify patterns and insights.**
- Look for systemic patterns (e.g., all reliability KPIs lagging = reliability culture issue).
- Identify areas of relative strength (above benchmark).
- Cross-reference with gap assessment findings (if available).
- Develop narrative insights for executive audience.

### Phase 3: Output & Recommendations (Steps 7-9)

**Step 7: Build analysis workbook.**
- Populate all sheets with benchmark data and comparisons.
- Create chart-ready data for radar, bar, and quartile distribution charts.
- Document all sources and methodology.

**Step 8: Build executive presentation.**
- Create visually impactful comparison slides.
- Use consistent color coding (green/yellow/red for quartile positioning).
- Include key insights and "so what" messages per slide.

**Step 9: Develop improvement targets.**
- Propose phased improvement targets (Year 1, Year 2, Year 3).
- Align targets with realistic improvement trajectories.
- Estimate resources and investment needed to achieve targets.
- Link benchmark targets to specific improvement initiatives.

---

## Quality Criteria

### Comparison Validity
- [ ] KPI definitions are aligned between client and benchmark data.
- [ ] Normalization adjustments are documented and reasonable.
- [ ] Benchmark data is from relevant industry/sub-sector.
- [ ] Sample sizes and data vintage are disclosed.

### Analytical Depth
- [ ] All provided KPIs are benchmarked (or reasons for exclusion stated).
- [ ] Gap quantification includes financial impact estimates.
- [ ] Patterns across KPI categories are identified and interpreted.
- [ ] Trends are analyzed if historical data is available.

### Actionability
- [ ] Improvement targets are realistic and phased.
- [ ] Top improvement opportunities are clearly prioritized.
- [ ] Links between KPI gaps and root causes are explored.
- [ ] Presentation is suitable for executive and operational audiences.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-gap-assessment` (B-GAP-005) | Maturity scores | Complement quantitative KPI benchmark with qualitative maturity |
| `extract-data-from-docs` (C-EXT-014) | KPI data from reports | Structured KPI extraction |
| `research-deep-topic` (C-RES-009) | Industry benchmark references | Benchmark data sourcing |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-client-presentation` (C-PRES-012) | Benchmark charts and tables | Client deliverable |
| `analyze-scenarios` (B-SCEN-002) | Target KPI values for scenario modeling | What-if analysis of reaching targets |
| `create-case-study` (C-CASE-019) | Benchmark positioning improvement | Value demonstration |

---

## Templates & References

### Templates
- `templates/benchmark_analysis_template.xlsx` - Standard benchmark workbook.
- `templates/benchmark_presentation_template.pptx` - VSC branded benchmark presentation.
- `templates/kpi_definition_catalog.xlsx` - Standard KPI definitions (EN 15341 aligned).

### Reference Documents
- EN 15341:2019 - Maintenance Key Performance Indicators
- SMRP Best Practices (5th Edition) - Maintenance & Reliability metrics
- ICMM Health & Safety indicators
- VSC internal: "Base de Datos de Benchmarking Industrial v4.0"

---

## Examples

### Example 1: Copper Mine Maintenance Benchmarking

**Input:**
- Current KPIs: Availability 89%, MTBF 650h, PM compliance 78%, maintenance cost 4.2% of RAV, planned/unplanned ratio 55:45.
- Industry: Copper mining, open pit, 100,000 TPD.
- Benchmark target: Top quartile within 3 years.

**Expected Output:**
- Current positioning: Q3-Q4 across most maintenance KPIs.
- Key gaps: PM compliance (Q4, gap to Q1 = 17 points), planned/unplanned ratio (Q4, gap = 25 points).
- Estimated value of reaching Q2: USD 8.5M/year in avoided downtime and reduced CM costs.
- Top recommendations: Improve planning/scheduling capability, implement condition monitoring.
- 3-year target path: Year 1 reach Q3, Year 2 reach Q2, Year 3 approach Q1.

### Example 2: Water Treatment Plant Operational Benchmark

**Input:**
- Current KPIs: Energy intensity 0.45 kWh/m3, chemical cost USD 0.08/m3, staffing 1.2 FTE/MLD, availability 96%.
- Industry: Municipal water treatment, 200 MLD capacity.
- Benchmark: Latin American utilities.

**Expected Output:**
- Overall positioning: Q2 (above average for region).
- Relative strength: Availability (Q1, 96% vs median 93%).
- Improvement area: Energy intensity (Q3, 0.45 vs Q1 <0.35 kWh/m3).
- Potential savings from energy optimization: USD 380K/year.
- Recommendation: Pump efficiency optimization and process control tuning.
