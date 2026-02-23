# Benchmark Maintenance KPIs
## Skill ID: MAINT-04
## Version: 1.0.0
## Category: Maintenance Intelligence (Agent 3)
## Priority: P1 - Critical

---

## Purpose

Benchmark an organization's maintenance and reliability Key Performance Indicators (KPIs) against SMRP (Society for Maintenance & Reliability Professionals) best practice standards, industry quartile data, and peer facility comparisons. This skill quantifies the gap between current performance and world-class benchmarks, identifies improvement priorities, and establishes measurable targets for the maintenance transformation journey.

The need for rigorous benchmarking is acute: SMRP data reveals a 3-5x variance in maintenance cost performance between top-quartile and bottom-quartile facilities within the same industry sector (Pain SM-01). A copper mine in the top quartile may spend 2.0% of Replacement Asset Value (RAV) on maintenance, while a bottom-quartile mine spends 7.5% of RAV -- for similar production output. Without benchmarking, organizations lack the objective reference points needed to set realistic targets, justify investment in reliability improvement, and measure progress.

This skill produces a comprehensive KPI benchmark dashboard covering the five SMRP pillars of maintenance excellence: Business & Management, Manufacturing Process Reliability, Equipment Reliability, Organization & Leadership, and Work Management. Each KPI is assessed against quartile boundaries with gap analysis and prioritized improvement recommendations.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **SMRP Best Practice as the Primary Framework**: All KPIs must align with SMRP Best Practice metrics (5th Edition), which are the globally recognized standard for maintenance and reliability measurement. Each metric has a precise definition, formula, and quartile benchmark.

2. **Balanced Scorecard Approach**: KPIs must cover both leading indicators (predict future performance) and lagging indicators (measure past results). A common failure is over-reliance on lagging indicators (e.g., maintenance cost) while ignoring leading indicators (e.g., PM compliance, planning accuracy) that drive future outcomes.

3. **Industry-Specific Benchmarks**: Benchmark targets must be calibrated to the specific industry (mining, oil & gas, power, etc.) because absolute values vary significantly. Mining maintenance costs are typically higher (3-5% RAV) than oil & gas (1.5-3% RAV) due to harsher operating conditions and wear-intensive processes.

4. **Data Integrity Assessment**: Before benchmarking, the agent must assess data quality. Benchmarking with inaccurate data produces misleading results. Common data integrity issues include: inconsistent work order coding, incomplete time tracking, incorrect asset valuations, and missing failure classifications.

5. **Gap Quantification in Business Terms**: Every gap between current and target performance must be translated into business impact -- dollars saved, hours recovered, availability improvement, or risk reduction -- not just abstract percentage points.

6. **Quartile Positioning**: For each KPI, the agent must determine the organization's quartile position (1st = top, 4th = bottom) and the specific gap to the next quartile, providing a realistic stepping-stone improvement path rather than an unreachable "world-class" target.

7. **Language**: Spanish (Latin American) with English SMRP metric names preserved as standard.

---

## Trigger / Invocation

```
/benchmark-maintenance-kpis
```

### Natural Language Triggers
- "Benchmark our maintenance KPIs against industry"
- "How do our maintenance metrics compare to best practice?"
- "Perform SMRP benchmarking assessment"
- "Where do we stand on maintenance performance?"
- "Comparar nuestros KPI de mantenimiento con la industria"
- "Benchmarking de indicadores de mantenimiento vs SMRP"

### Aliases
- `/maintenance-benchmarking`
- `/kpi-benchmark`
- `/smrp-benchmark`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `maintenance_cost_data` | Total maintenance expenditure broken down by: labor, materials, contractors, overhead. Minimum 12 months. | .xlsx | Finance / ERP (mcp-cmms) |
| `production_data` | Production output, operating hours, and downtime records | .xlsx | Operations / DCS |
| `work_order_summary` | Work order counts by type (PM, PdM, CM, Emergency), completion rates, backlog | .xlsx / CMMS export | CMMS (mcp-cmms) |
| `asset_valuation` | Replacement Asset Value (RAV) or Current Replacement Value (CRV) of maintained assets | .xlsx / text | Finance / Engineering |
| `industry_sector` | Primary industry for benchmark comparison | Text | User |
| `headcount_data` | Maintenance workforce FTE by craft/role | .xlsx / text | HR / Maintenance |

### Optional Inputs

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `availability_data` | Equipment/system availability records by month | Calculate from downtime data |
| `safety_data` | Maintenance-related safety incidents (TRIR, LTIR) | Exclude safety KPIs |
| `inventory_data` | Spare parts inventory value, stockout rate, turns | Exclude inventory KPIs |
| `planning_scheduling_data` | Planned vs. actual hours, schedule compliance, backlog age | Estimate from WO data |
| `reliability_data` | MTBF, MTTR by equipment type | Calculate from WO history |
| `energy_consumption` | Maintenance-related energy costs | Exclude energy KPI |
| `contractor_data` | Contractor vs. in-house work split and performance | Partial analysis only |
| `peer_benchmarks` | Client-provided peer comparison data | Use SMRP/industry generic benchmarks |
| `previous_benchmarks` | Prior benchmarking results for trend analysis | Treat as baseline assessment |

---

## Output Specification

### Deliverable 1: KPI Benchmark Report (.docx)

**Filename**: `{ProjectCode}_KPI_Benchmark_Report_v{Version}_{YYYYMMDD}.docx`

**Structure**:
1. Executive Summary (3-4 pages)
   - Overall maintenance maturity score (1-5 scale across SMRP pillars)
   - Quartile positioning summary (radar chart across key metrics)
   - Top 5 strengths and top 5 improvement opportunities
   - Estimated financial impact of closing top gaps
   - Priority roadmap for improvement
2. Methodology & Data Quality Assessment (2-3 pages)
   - SMRP framework description
   - Benchmark data sources and vintage
   - Data quality score and limitations
3. KPI Dashboard Summary (3-5 pages)
   - Complete KPI table with: current value, quartile position, target, gap, trend
   - Color-coded performance indicators (red/yellow/green)
   - Spider/radar chart across SMRP pillars
4. Detailed Analysis by SMRP Pillar (15-25 pages)
   - Pillar 1: Business & Management (cost KPIs)
   - Pillar 2: Manufacturing Process Reliability (availability, OEE)
   - Pillar 3: Equipment Reliability (MTBF, failure rates, defect elimination)
   - Pillar 4: Organization & Leadership (training, safety, culture)
   - Pillar 5: Work Management (planning, scheduling, backlog)
5. Gap Analysis & Improvement Priorities (5-8 pages)
   - Gap quantification for each KPI (current vs. target)
   - Business impact of closing each gap ($ or hours)
   - Prioritization matrix (impact vs. effort)
   - Quick wins vs. strategic improvements
6. Target Setting & Roadmap (3-5 pages)
   - Recommended targets by timeframe (6 months, 12 months, 24 months)
   - Improvement initiatives mapped to KPI targets
   - Resource requirements
7. Appendices
   - SMRP metric definitions and formulas
   - Industry benchmark data tables
   - Detailed data quality assessment

### Deliverable 2: KPI Dashboard Workbook (.xlsx)

**Filename**: `{ProjectCode}_KPI_Dashboard_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

| Sheet | Content |
|-------|---------|
| `Dashboard` | Visual summary with gauges, traffic lights, and trend arrows for all KPIs |
| `SMRP Pillar 1` | Business & Management KPIs with calculations and benchmarks |
| `SMRP Pillar 2` | Manufacturing Process Reliability KPIs |
| `SMRP Pillar 3` | Equipment Reliability KPIs |
| `SMRP Pillar 4` | Organization & Leadership KPIs |
| `SMRP Pillar 5` | Work Management KPIs |
| `Quartile Chart Data` | Data for radar/spider chart generation |
| `Trend Analysis` | Monthly KPI values with 12-month trend and forecast |
| `Gap Analysis` | Current vs. target with business impact quantification |
| `Action Plan` | Improvement actions linked to KPI targets with owners and timelines |
| `Benchmark Reference` | SMRP quartile data by industry sector |

### Deliverable 3: PowerBI Dashboard Specification (.json / .pbix)

**Filename**: `{ProjectCode}_KPI_Dashboard_Spec_v{Version}_{YYYYMMDD}.json`

Specification for automated KPI dashboard connecting to CMMS and ERP data sources, designed for ongoing monitoring via mcp-powerbi.

---

## Methodology & Standards

### SMRP Best Practice KPI Framework (5th Edition)

#### Pillar 1: Business & Management

| KPI | SMRP ID | Formula | Top Quartile | Median | Bottom Quartile |
|-----|---------|---------|-------------|--------|-----------------|
| Maintenance Cost as % of RAV | 5.1.1 | Total Maint Cost / RAV x 100 | <2.5% | 3.5-5.0% | >6.0% |
| Maintenance Cost per Unit of Output | 5.1.2 | Total Maint Cost / Production Units | Industry-specific | Industry-specific | Industry-specific |
| Maintenance Cost per Maintenance FTE | 5.1.3 | Total Maint Cost / Maint FTE | $80-120K | $60-80K | <$50K or >$150K |
| Contractor Cost as % of Total Maint | 5.1.5 | Contractor Cost / Total Maint Cost x 100 | 20-30% | 35-50% | >60% |
| Material Cost as % of Total Maint | 5.1.6 | Material Cost / Total Maint Cost x 100 | 40-50% | 50-60% | >65% |

#### Pillar 2: Manufacturing Process Reliability

| KPI | SMRP ID | Formula | Top Quartile | Median | Bottom Quartile |
|-----|---------|---------|-------------|--------|-----------------|
| Overall Equipment Effectiveness (OEE) | 5.2.1 | Availability x Performance x Quality | >85% | 60-75% | <55% |
| Mechanical Availability | 5.2.2 | (Scheduled Time - Downtime) / Scheduled Time x 100 | >95% | 88-93% | <85% |
| Production Plan Attainment | 5.2.3 | Actual Output / Planned Output x 100 | >95% | 85-92% | <80% |
| Mean Time Between Failures (MTBF) | 5.2.4 | Operating Time / Number of Failures | Increasing trend | Stable | Decreasing |
| Mean Time To Repair (MTTR) | 5.2.5 | Total Repair Time / Number of Repairs | <4 hours | 4-8 hours | >12 hours |

#### Pillar 3: Equipment Reliability

| KPI | SMRP ID | Formula | Top Quartile | Median | Bottom Quartile |
|-----|---------|---------|-------------|--------|-----------------|
| Reactive Maintenance % | 5.3.1 | Emergency + Unplanned WOs / Total WOs x 100 | <10% | 25-40% | >55% |
| PM + PdM Compliance | 5.3.2 | PM/PdM Completed on Time / Scheduled x 100 | >95% | 80-90% | <75% |
| PdM Program Coverage | 5.3.3 | Equipment Covered by PdM / Critical Equipment x 100 | >80% | 40-60% | <25% |
| Defect Elimination Rate | 5.3.4 | Repeat Failures Eliminated / Total Chronic Failures x 100 | >15%/year | 5-10%/year | <5%/year |
| CBM Effectiveness | 5.3.5 | Failures Predicted by CBM / Total Failures x 100 | >50% | 20-35% | <15% |

#### Pillar 4: Organization & Leadership

| KPI | SMRP ID | Formula | Top Quartile | Median | Bottom Quartile |
|-----|---------|---------|-------------|--------|-----------------|
| Maintenance Training Hours per FTE | 5.4.1 | Total Training Hours / Maint FTE | >80 hrs/year | 40-60 hrs | <24 hrs |
| Maintenance Safety (TRIR) | 5.4.2 | (Incidents x 200,000) / Hours Worked | <1.0 | 2.0-4.0 | >5.0 |
| Maintenance Overtime % | 5.4.3 | Overtime Hours / Total Hours x 100 | <5% | 8-12% | >15% |
| Supervisor-to-Craft Ratio | 5.4.4 | Supervisors / Craft Workers | 1:8-12 | 1:6-8 | 1:3-5 |
| Multi-Skill Ratio | 5.4.5 | Workers with 2+ trade certifications / Total Workers | >30% | 15-25% | <10% |

#### Pillar 5: Work Management

| KPI | SMRP ID | Formula | Top Quartile | Median | Bottom Quartile |
|-----|---------|---------|-------------|--------|-----------------|
| Planned Work % | 5.5.1 | Planned WOs / Total WOs x 100 | >90% | 60-75% | <50% |
| Schedule Compliance | 5.5.2 | Scheduled WOs Completed / Scheduled WOs x 100 | >90% | 70-80% | <60% |
| Wrench Time | 5.5.3 | Direct Work Time / Available Work Time x 100 | >55% | 30-40% | <25% |
| Ready Backlog (Weeks) | 5.5.4 | Ready Backlog Hours / Weekly Available Craft Hours | 2-4 weeks | 4-8 weeks | >10 weeks |
| Work Order Accuracy | 5.5.5 | Actual Hours within +/-10% of Planned / Total WOs x 100 | >80% | 50-65% | <40% |

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** All failure mode data used in KPI benchmarking, root cause Pareto analysis, and defect elimination tracking MUST reference failure modes exclusively from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No ad-hoc or free-text failure mode descriptions are permitted in KPI dashboards or benchmark reports.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. When benchmarking KPIs that depend on failure classification data (MTBF, reactive maintenance %, defect elimination rate, bad actor analysis), all failure modes MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component or equipment that failed | Motor Winding |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Thermally Overloads (burns/overheats/melts) |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Overloading (sustained above rating) |

**Complete failure mode definition:** *"Motor Winding Thermally Overloads due to Overloading (sustained above rating)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in KPI dashboards, root cause Pareto charts, bad actor reports, and defect elimination registers MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for KPI Benchmarking

1. **MTBF and MTTR Calculations (Pillar 2 & 3):** When calculating MTBF and MTTR by failure mode category, the failure mode classification MUST use the 18 official FM-Mechanisms from the VSC Failure Modes Table. This enables consistent trending and valid comparison against benchmarks.
2. **Root Cause Pareto Analysis:** Pareto charts of failure causes in the benchmark report MUST be grouped by FM-Mechanism and FM-Cause from the VSC table. Pareto charts using ad-hoc categories (e.g., "mechanical", "electrical", "other") are NOT acceptable as primary analysis — they may be used only as supplementary high-level summaries.
3. **Reactive Maintenance % (SMRP 5.3.1):** When analyzing reactive work orders to identify the dominant failure modes driving reactive maintenance, each work order MUST be classified against the VSC Failure Modes Table to produce actionable root cause insights.
4. **Defect Elimination Rate (SMRP 5.3.4):** Chronic/repeat failures targeted for elimination MUST be identified and tracked using VSC Failure Modes Table nomenclature, enabling consistent measurement of elimination progress across reporting periods.
5. **Bad Actor Analysis:** Top bad actor equipment lists MUST include the dominant failure mode(s) from the VSC table for each bad actor, using the format "[Mechanism] due to [Cause]".
6. **No Ad-Hoc Descriptions:** Failure classifications such as "mechanical failure", "electrical problem", or "unknown" are NOT acceptable in KPI analysis. All failure data must be coded to the standardized three-part structure before benchmarking calculations.
7. **Data Quality Assessment (Step 2):** The data quality validation MUST assess whether work order failure coding aligns with the VSC Failure Modes Table. Low alignment (<60%) must be flagged as a data quality limitation affecting benchmark reliability.
8. **Consistency with CMMS Coding:** Failure mode codes in the CMMS (extracted via mcp-cmms) MUST map to the VSC Failure Modes Table. If CMMS coding does not align, a mapping table MUST be created as part of the benchmarking process.

### Industry-Specific Benchmark Adjustments

| Industry | Maint Cost % RAV | Typical Availability | Reactive % | Notes |
|----------|-----------------|---------------------|-------------|-------|
| Mining (Surface) | 3.0-5.0% | 85-92% | 25-45% | Harsh environment, mobile + fixed plant |
| Mining (Underground) | 4.0-6.0% | 80-90% | 30-50% | Access constraints, ventilation |
| Oil & Gas (Upstream) | 1.5-3.0% | 92-97% | 15-30% | High consequence, regulated |
| Oil & Gas (Downstream) | 2.0-3.5% | 93-97% | 15-25% | Turnaround-intensive |
| Power Generation | 1.5-3.0% | 90-95% | 15-30% | Regulated, high availability |
| Water/Wastewater | 2.5-4.5% | 90-95% | 25-40% | Regulatory compliance critical |
| Chemical/Petrochemical | 2.0-4.0% | 92-96% | 15-25% | Process safety critical |
| Pulp & Paper | 3.0-5.0% | 88-94% | 20-35% | Continuous process |
| Cement | 3.0-5.0% | 85-92% | 25-40% | Heavy wear environment |

---

## Step-by-Step Execution

### Phase 1: Data Collection & Validation (Steps 1-3)

**Step 1: Gather KPI source data.**
- Extract maintenance cost data from CMMS/ERP via mcp-cmms (labor, materials, contractors, overhead)
- Extract work order data: counts by type, completion dates, actual hours, PM compliance records
- Obtain production data: operating hours, output, downtime hours by cause
- Obtain asset valuation (RAV) from finance or engineering
- Obtain workforce data: FTE by role, training hours, safety statistics
- Collect spare parts inventory data if available

**Step 2: Validate data quality.**
- Cross-check total maintenance cost with financial records (variance < 5%)
- Verify work order type coding consistency (sample audit of 50+ WOs)
- Confirm RAV basis: insured value, replacement value, or book value (must use replacement value for SMRP benchmarking)
- Check for data completeness: any months with missing data, any cost categories excluded
- Assess overall data quality score (High/Medium/Low confidence by KPI)
- Document all data quality issues and their impact on benchmark reliability

**Step 3: Determine appropriate benchmarks.**
- Select primary benchmark set based on industry sector
- Identify any client-provided peer comparison data
- Adjust benchmark values for country-specific factors (labor cost, regulatory environment)
- Document benchmark sources and vintage (year of data)

### Phase 2: KPI Calculation & Quartile Positioning (Steps 4-6)

**Step 4: Calculate all KPIs.**
- For each SMRP metric: apply the standard formula using validated input data
- Calculate monthly, quarterly, and annual values where applicable
- Calculate 12-month rolling average for trend analysis
- Flag any KPIs that cannot be calculated due to missing data

**Step 5: Determine quartile positioning.**
- For each calculated KPI:
  - Compare against industry-specific quartile boundaries
  - Assign quartile (Q1 = top performance, Q4 = bottom)
  - Calculate gap: distance to next quartile boundary (in native units and %)
  - Calculate gap: distance to top quartile (stretch target)
- Generate composite maturity score by SMRP pillar (weighted average of constituent KPI quartile positions)

**Step 6: Analyze trends.**
- For each KPI with sufficient historical data (12+ months):
  - Plot monthly trend
  - Calculate trend direction (improving, stable, deteriorating)
  - Apply statistical trend test (linear regression, R-squared)
  - Forecast 6-month and 12-month trajectory if trend continues
  - Identify inflection points (when trend changed direction -- correlate with events)

### Phase 3: Gap Analysis & Recommendations (Steps 7-9)

**Step 7: Quantify gaps in business terms.**
- For each KPI gap:
  - Translate percentage gap into business impact
  - Example: "Reactive maintenance at 42% (Q3) vs. target 15% (Q1) = excess reactive cost of $2.1M/year"
  - Example: "Mechanical availability at 89% (Q2) vs. target 95% (Q1) = 528 additional production hours/year = $3.2M revenue opportunity"
  - Rank gaps by business impact (largest dollar impact first)

**Step 8: Identify improvement priorities.**
- Create prioritization matrix: Business Impact (Y-axis) vs. Implementation Effort (X-axis)
  - Quadrant 1 (High Impact, Low Effort): Quick wins -- implement immediately
  - Quadrant 2 (High Impact, High Effort): Strategic projects -- plan and resource
  - Quadrant 3 (Low Impact, Low Effort): Fill in -- do when convenient
  - Quadrant 4 (Low Impact, High Effort): Deprioritize -- defer or eliminate
- Identify KPI interdependencies: improving one KPI may automatically improve others
  - Example: Improving planned work % drives improvements in schedule compliance, wrench time, and ultimately reactive maintenance %

**Step 9: Set targets and build roadmap.**
- For each priority KPI, set phased targets:
  - 6-month target: realistic improvement from current baseline (typically move to next quartile boundary)
  - 12-month target: sustained improvement trajectory
  - 24-month target: aspirational but achievable (typically 1-2 quartile improvement)
- Map improvement initiatives to KPI targets:
  - Planning & scheduling improvement --> Planned work %, schedule compliance, wrench time
  - PM optimization --> PM compliance, reactive %, cost
  - CBM program expansion --> PdM coverage, CBM effectiveness, MTBF
  - Defect elimination --> Repeat failure rate, MTBF, reactive %
  - Training program --> Multi-skill ratio, maintenance safety
- Estimate resource requirements for each initiative

### Phase 4: Deliverable Generation (Steps 10-12)

**Step 10: Build KPI dashboard workbook via mcp-excel.**
- Create visual dashboard with gauges, traffic lights, and trend arrows
- Populate all SMRP pillar sheets with calculated KPIs and benchmarks
- Generate chart data for radar/spider chart, Pareto of gaps, trend charts
- Build action plan tracker linked to KPI targets

**Step 11: Generate benchmark report.**
- Write executive summary with headline findings and business impact
- Compile detailed pillar-by-pillar analysis
- Present gap analysis with prioritization matrix
- Document target-setting rationale and roadmap

**Step 12: Create PowerBI dashboard specification via mcp-powerbi.**
- Define data connections to CMMS and ERP
- Specify KPI calculations as DAX measures
- Design dashboard layout with drill-down capability
- Configure automated refresh schedule

---

## Quality Criteria

### Analytical Quality

| Criterion | Weight | Target |
|-----------|--------|--------|
| KPI formula accuracy | 25% | 100% of KPIs calculated per SMRP standard formulas |
| Benchmark relevance | 20% | Industry-specific benchmarks used; generic only where industry-specific unavailable |
| Data quality transparency | 20% | Confidence level stated for each KPI; limitations documented |
| Gap quantification | 20% | >80% of gaps translated to business impact ($) |
| Actionable recommendations | 15% | Each gap has specific, prioritized improvement action |

### Automated Checks

- [ ] All SMRP metric formulas applied correctly
- [ ] RAV basis documented and appropriate (replacement value, not book value)
- [ ] Quartile boundaries sourced from current SMRP/industry data
- [ ] All KPIs have data quality confidence rating
- [ ] Gap calculations are arithmetically correct
- [ ] Business impact estimates use documented assumptions
- [ ] Targets are phased (6/12/24 months) and progressive
- [ ] No conflicting recommendations between KPI improvements

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| CMMS data via mcp-cmms | Work orders, costs, equipment data | Critical |
| `develop-maintenance-strategy` (MAINT-01) | Maintenance mix targets from RCM | High |
| `optimize-pm-program` (MAINT-02) | PM compliance and effectiveness data | High |
| `analyze-failure-patterns` (MAINT-03) | Failure rates, MTBF, repeat failure data | High |
| Agent 9 (Asset Management) | Asset management maturity context | Medium |

### Downstream Dependencies

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `assess-am-maturity` (AM-01) | Maintenance KPI data for maturity assessment | Automatic |
| `develop-samp` (AM-02) | KPI targets for SAMP alignment | On request |
| `accelerate-decision-cycle` (INTG-03) | KPI dashboards for decision support | Automatic |
| `create-kpi-dashboard` | Detailed dashboard specification | Automatic |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-cmms** | Extract maintenance costs, work orders, equipment data | `GET /costs`, `GET /work-orders`, `GET /kpi-data` |
| **mcp-powerbi** | Create and publish KPI dashboards | `POST /datasets`, `POST /reports`, `PUT /dashboards` |
| **mcp-excel** | Generate KPI workbook with calculations and charts | `POST /workbooks`, `PUT /sheets`, `POST /charts` |

---

## Templates & References

### Templates
- `VSC_KPI_Benchmark_Report_Template_v2.0.docx`
- `VSC_KPI_Dashboard_Template_v3.0.xlsx`
- `VSC_PowerBI_KPI_Dashboard_Template_v1.0.pbix`

### Reference Documents
- SMRP Best Practice 5th Edition -- Metric definitions, formulas, and quartile data
- Wireman, T. "Benchmarking Best Practices in Maintenance Management"
- IDCON Maintenance Management KPI Reference
- Solomon Associates -- Asset-intensive industry benchmarking (oil & gas, power)
- VSC Internal: "Guia de Indicadores de Mantenimiento y Confiabilidad v3.0"

---

## Examples

### Example 1: Mining Concentrator KPI Summary

| KPI | Current | Quartile | Target (12mo) | Gap ($) |
|-----|---------|----------|---------------|---------|
| Maint Cost % RAV | 5.8% | Q3 | 4.0% (Q2) | $2.7M/year |
| Mechanical Availability | 88.5% | Q3 | 92.0% (Q2) | $4.1M production |
| Reactive Maintenance % | 42% | Q4 | 25% (Q2) | $1.8M/year |
| PM Compliance | 74% | Q3 | 90% (Q1) | Enables all above |
| Wrench Time | 28% | Q3 | 42% (Q2) | 11,200 hrs/year recovered |
| Schedule Compliance | 65% | Q3 | 82% (Q2) | Enables wrench time |
| MTBF (overall) | 320 hrs | Q3 | 520 hrs (Q2) | Reduces reactive |
| Ready Backlog | 9.2 weeks | Q3 | 4.0 weeks (Q1) | Planning effectiveness |

**Total Improvement Opportunity**: $8.6M/year in maintenance cost reduction and production recovery
**Priority Actions**: (1) Planning & scheduling improvement program, (2) PM optimization, (3) CBM expansion, (4) Top 20 bad actor elimination
