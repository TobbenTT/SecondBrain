# Identify Improvement Opportunities

## Skill ID: S-02
## Version: 1.0.0
## Category: S. Performance Analytics
## Priority: P1 - High

---

## Purpose

Systematically identify, quantify, and prioritize operational improvement opportunities through data-driven analysis of KPI gaps, failure patterns, process bottlenecks, and cost inefficiencies. This skill transforms raw performance data into a ranked portfolio of improvement projects with estimated ROI, effort levels, and implementation timelines, enabling management to allocate resources to the highest-value improvements first.

The fundamental challenge in operational improvement is not a lack of problems -- most facilities have hundreds of potential improvement areas. The challenge is identifying which improvements will deliver the most value relative to the effort and investment required (Pain Point G-04, Decision Intelligence Gap). Without structured prioritization, organizations fall into common traps: pursuing low-impact "pet projects" championed by influential individuals, spreading resources too thin across too many initiatives, or tackling symptoms rather than root causes. McKinsey research on operational excellence programs shows that organizations with structured improvement identification and prioritization achieve 2-3x the value capture compared to ad-hoc approaches.

This skill applies a systematic methodology combining multiple analytical techniques:
- **Bad Actor Analysis**: Identify the 10-20% of equipment/processes generating 60-80% of losses (Pareto principle)
- **OEE Loss Waterfall Analysis**: Decompose overall equipment effectiveness into availability, performance, and quality losses with root cause attribution
- **Maintenance Cost Pareto**: Identify the highest-cost maintenance areas and their drivers
- **Benchmarking Gap Analysis**: Quantify the gap between current performance and top-quartile benchmarks in business-value terms
- **Process Bottleneck Identification**: Locate capacity constraints limiting throughput
- **Energy and Resource Optimization**: Identify consumption inefficiencies
- **ROI Estimation**: Estimate the financial return for each improvement opportunity using standard engineering economics

The output is a prioritized Improvement Opportunity Register that serves as the basis for annual improvement planning, capital budgeting, and continuous improvement program management.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | S-02                                                                                        |
| **Agent**              | Agent 10 -- Performance Analytics                                                            |
| **Domain**             | Performance Analytics                                                                        |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Initial analysis: 5-10 days; Ongoing: monthly refresh with quarterly deep-dive               |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | G-04: Decision intelligence gap -- organizations lack structured methods to identify and prioritize where to invest improvement resources |
| **Secondary Pain**     | SM-01: 3-5x performance variance between quartiles, driven by failure to systematically close gaps |
| **Value Created**      | Typical improvement portfolio: 10-25% reduction in maintenance costs, 3-8% availability improvement, 5-15% productivity gain |

### Functional Intent

This skill SHALL:

1. **Consume KPI data** from calculate-operational-kpis (S-01) to identify performance gaps.
2. **Consume failure data** from analyze-failure-patterns (MAINT-03) to identify reliability improvement opportunities.
3. **Perform multi-dimensional analysis** (Pareto, waterfall, gap analysis, trend analysis) to identify improvement areas.
4. **Quantify each opportunity** in business terms: annual value ($), investment required ($), net present value, payback period, and internal rate of return.
5. **Prioritize opportunities** using a structured framework: Impact vs. Effort matrix, risk-adjusted ROI, and strategic alignment.
6. **Produce an Improvement Opportunity Register** that ranks all identified opportunities for management decision-making.
7. **Track improvement implementation** and measure actual value captured against estimates.
8. **Support continuous improvement cycles** with monthly opportunity refresh and quarterly portfolio review.

---

## Trigger / Invocation

### Direct Invocation

```
/identify-improvement-opportunities --project [name] --scope [full|production|maintenance|reliability|cost|energy] --depth [screening|detailed]
```

### Command Variants
- `/identify-improvement-opportunities full --project [name]` -- Complete analysis across all domains
- `/identify-improvement-opportunities bad-actors --project [name] --top [N]` -- Top N bad actor analysis
- `/identify-improvement-opportunities gap-analysis --project [name] --benchmark [smrp|budget|best-achieved]`
- `/identify-improvement-opportunities bottleneck --project [name] --system [system_code]`
- `/identify-improvement-opportunities roi --opportunity [opp_id]` -- Detailed ROI for specific opportunity
- `/identify-improvement-opportunities portfolio --project [name]` -- Current improvement portfolio status

### Aliases
- `/improvement-opportunities`, `/find-improvements`, `/improvement-analysis`, `/opportunity-register`

### Automatic Triggers
- **Monthly**: Refresh improvement opportunity register with latest KPI data
- **Quarterly**: Deep-dive analysis with expanded scope and updated benchmarks
- **KPI alert**: RED alert from calculate-operational-kpis (S-01) triggers targeted analysis
- **Post-incident**: Significant incident triggers analysis of systemic improvement needs
- **Budget cycle**: Annual budget preparation triggers comprehensive improvement portfolio update

### Contextual Triggers
- Management requests "where should we invest in improvement?"
- Annual improvement planning cycle begins
- Significant performance deviation detected (new bad actor, step-change in KPI)
- Benchmark comparison reveals new gaps
- Capital budget approval process requires prioritized improvement list

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `kpi_data` | JSON / .xlsx | calculate-operational-kpis (S-01) via mcp-powerbi | Current and historical KPI values with trends, targets, and gaps |
| `work_order_data` | .xlsx / API | CMMS (mcp-cmms) | Work order history: equipment, failure mode, cost, downtime, frequency (minimum 12 months) |
| `downtime_data` | .xlsx / API | DCS / Production system | Downtime events with duration, cause, and production impact |
| `cost_data` | .xlsx / API | ERP (mcp-erp) | Maintenance and operating cost breakdown by category, equipment, and cost center |
| `equipment_register` | .xlsx / API | CMMS (mcp-cmms) | Equipment hierarchy, criticality, replacement values |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `benchmark_data` | .xlsx | SMRP / Industry / benchmark-maintenance-kpis (MAINT-04) | Quartile benchmarks for gap quantification |
| `failure_analysis` | .xlsx / .docx | analyze-failure-patterns (MAINT-03) | Bad actor list, RCA findings, defect elimination priorities |
| `energy_data` | .xlsx / API | Energy management system | Energy consumption by equipment/process for efficiency analysis |
| `production_rates` | .xlsx | Operations | Revenue per unit of output for production loss valuation |
| `labor_rates` | .xlsx | HR / Finance | Fully loaded labor rates for improvement project costing |
| `capital_budget_constraints` | .xlsx | Finance | Available capital budget for improvement investments |
| `strategic_priorities` | .docx | Management | Strategic objectives for alignment scoring |
| `previous_improvement_register` | .xlsx | mcp-sharepoint | Prior improvement opportunities for continuity |

### Input Validation Rules

```yaml
validation:
  kpi_data:
    required: ["OEE", "availability", "throughput", "maint_cost_pct_rav", "pm_compliance", "reactive_pct"]
    min_history: "12 months for trend analysis"
    checks:
      - "All KPIs have both actual and target values"
      - "Trend direction calculated for each KPI"
  work_order_data:
    min_records: 500
    required_fields: ["equipment_tag", "wo_type", "labor_hours", "material_cost", "downtime_hours", "completion_date"]
    checks:
      - "Equipment tags match equipment register"
      - "Cost values are positive"
  downtime_data:
    required_fields: ["equipment_tag", "start_time", "duration_hours", "cause_code", "production_loss"]
    checks:
      - "Total downtime reconciles with availability KPI (tolerance 5%)"
```

---

## Output Specification

### Deliverable 1: Improvement Opportunity Register (.xlsx)

**Filename**: `{ProjectCode}_Improvement_Register_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

#### Sheet 1: "Executive Summary"
| Metric | Value |
|--------|-------|
| Total Opportunities Identified | 45 |
| Total Annual Value Potential | $12.8M |
| Quick Wins (< $50K invest, < 6 months) | 12 opportunities, $3.2M value |
| Strategic Projects (> $50K invest) | 18 opportunities, $8.4M value |
| Low-Hanging Fruit (high ROI, low effort) | 8 opportunities, $2.1M value |
| Top 5 by Value | Listed with summary |

#### Sheet 2: "Opportunity Register"
| Opp ID | Title | Domain | Source Analysis | Annual Value ($) | Investment ($) | Payback (months) | NPV ($) | IRR (%) | Effort (1-5) | Impact (1-5) | Priority Rank | Status |
|--------|-------|--------|-----------------|-----------------|---------------|-------------------|---------|---------|-------------|-------------|-------------|--------|
| OPP-001 | Eliminate SAG Mill bearing repeat failures | Reliability | Bad Actor #1 | $1,850K | $120K | 0.8 | $4,200K | 280% | 2 | 5 | 1 | New |
| OPP-002 | PM optimization - remove NVA PMs | Maintenance | PM analysis | $680K | $45K | 0.8 | $1,550K | 310% | 2 | 4 | 2 | New |
| OPP-003 | Flotation recovery improvement | Production | OEE Quality loss | $2,400K | $350K | 1.8 | $3,800K | 185% | 3 | 5 | 3 | New |

#### Sheet 3: "Pareto Analysis"
Equipment-level Pareto showing:
- Top 20 bad actors by downtime hours
- Top 20 bad actors by maintenance cost
- Top 20 bad actors by failure frequency
- Cumulative impact curves showing % of total from top N items

#### Sheet 4: "OEE Loss Waterfall"
OEE component breakdown with loss attribution:
- Availability losses by cause (mechanical, process, electrical, external)
- Performance losses by cause (reduced speed, minor stops, startup)
- Quality losses by cause (off-spec, rework, waste)
- Each loss valued in production-equivalent dollars

#### Sheet 5: "Gap Analysis"
KPI-level gap quantification:
| KPI | Current | Target | Gap | Business Impact of Gap ($) | Improvement Initiative | Priority |
|-----|---------|--------|-----|--------------------------|----------------------|----------|

#### Sheet 6: "Impact-Effort Matrix"
Visual classification of all opportunities:
- Quadrant 1 (High Impact, Low Effort): **Quick Wins** -- implement immediately
- Quadrant 2 (High Impact, High Effort): **Strategic Projects** -- plan and resource
- Quadrant 3 (Low Impact, Low Effort): **Fill-ins** -- do when convenient
- Quadrant 4 (Low Impact, High Effort): **Deprioritize** -- defer or eliminate

#### Sheet 7: "ROI Detail"
For each opportunity:
- Cost-benefit analysis with assumptions
- 5-year NPV calculation
- Sensitivity analysis (optimistic, base case, pessimistic)
- Risk factors and mitigation

#### Sheet 8: "Implementation Roadmap"
Phased implementation plan:
| Phase | Timeframe | Opportunities | Investment | Expected Value | Cumulative Value |
|-------|-----------|--------------|-----------|---------------|-----------------|
| Quick Wins | Months 1-3 | OPP-002, OPP-005, OPP-008... | $95K | $1.8M/year | $1.8M |
| Phase 1 | Months 3-6 | OPP-001, OPP-004, OPP-011... | $350K | $3.5M/year | $5.3M |
| Phase 2 | Months 6-12 | OPP-003, OPP-007, OPP-015... | $850K | $4.2M/year | $9.5M |
| Phase 3 | Months 12-24 | OPP-009, OPP-014, OPP-022... | $1.2M | $3.3M/year | $12.8M |

### Deliverable 2: Power BI Improvement Dashboard (via mcp-powerbi)

**Dashboard Components:**
- Improvement value waterfall (total potential by domain)
- Impact-Effort scatter plot (interactive, click for detail)
- Bad actor Pareto chart (switchable: by downtime, cost, frequency)
- OEE loss tree (drill-down from OEE to individual loss causes)
- Implementation progress tracker (planned vs. actual value capture)
- Opportunity pipeline funnel (identified -> analyzed -> approved -> implementing -> captured)

### Deliverable 3: Executive Improvement Brief (.docx)

**Filename**: `{ProjectCode}_Improvement_Brief_v{Version}_{YYYYMMDD}.docx`

4-6 page brief containing:
1. Performance snapshot (key KPIs with gaps highlighted)
2. Top 10 improvement opportunities (one-paragraph description, value, investment, priority)
3. Quick wins available for immediate action
4. Investment required and expected return (portfolio summary)
5. Recommended next steps

---

## Methodology & Standards

### Analytical Methodologies

#### 1. Pareto Analysis (Bad Actor Identification)

The Pareto principle (80/20 rule) is the foundation of improvement prioritization. Equipment-level Pareto analysis identifies the vital few assets generating the most losses:

```
Process:
1. Extract all downtime events and corrective work orders for analysis period
2. Aggregate by equipment tag: total downtime hours, total cost, failure count
3. Rank by each metric (separate Pareto for downtime, cost, frequency)
4. Calculate cumulative percentage
5. Identify the "vital few": equipment contributing to 80% of losses
6. Cross-reference: equipment appearing in top 20 on multiple Paretosare highest priority
```

**Industry Benchmark**: Typically 10-15% of equipment generates 60-80% of corrective maintenance (SMRP data). A structured bad actor elimination program targeting top 20 assets yields 15-30% reduction in total corrective maintenance within 12-18 months.

#### 2. OEE Loss Waterfall Analysis

Decomposes OEE into its three components and attributes losses to specific causes:

```
Calendar Time (8,760 hours/year)
  - Planned downtime (shutdowns, holidays) = Loading Losses
  = Scheduled Time
  - Equipment failures = Availability Losses (Unplanned)
  - Process upsets = Availability Losses (Unplanned)
  - Planned maintenance = Availability Losses (Planned)
  = Operating Time
  - Speed reductions = Performance Losses
  - Minor stops = Performance Losses
  = Net Operating Time
  - Off-spec product = Quality Losses
  - Rework = Quality Losses
  = Value-Added Time

Each loss category is valued in production-equivalent dollars:
  Loss Value ($) = Lost Hours x Hourly Production Rate x Product Value
```

#### 3. Benchmarking Gap Analysis

Quantifies the gap between current KPIs and benchmark targets in business value:

```
For each KPI gap:
  Gap = Target Value - Current Value
  Business Impact = f(Gap, Production Rate, Cost Structure)

Examples:
  Availability gap: 93% target - 91% current = 2% gap
    = 175 additional operating hours/year
    = 175 x 1,900 tons/hour = 332,500 additional tons
    = 332,500 x $50/ton margin = $16.6M/year opportunity

  Reactive maintenance gap: 15% target - 28% current = 13% gap
    = 13% x $50M maintenance budget = $6.5M excess reactive cost
    = Realistic capture: 40-60% = $2.6-3.9M/year savings

  PM compliance gap: 95% target - 88% current = 7% gap
    = Impact on availability: estimated 0.5-1.0% availability improvement
    = Impact on reactive: estimated 5-8% reduction in reactive work
```

#### 4. ROI Estimation Methodology

Standard engineering economics applied to each improvement opportunity:

```
Annual Value = Avoided Cost + Production Gain + Risk Reduction
  Avoided Cost = (Current Annual Loss - Expected Post-Improvement Loss)
  Production Gain = Additional Output x Unit Revenue
  Risk Reduction = Probability Reduction x Consequence Value (for safety/environmental)

Investment = Capital Cost + Implementation Cost + Disruption Cost
  Capital Cost = Equipment, materials, installation
  Implementation Cost = Engineering, project management, training
  Disruption Cost = Production loss during implementation

NPV = SUM(Annual Value / (1+r)^t) - Investment, for t = 1 to 5 years
  r = Discount rate (typically 10-15% for industrial projects)

Payback Period = Investment / Annual Value (simple payback)

IRR = rate where NPV = 0

Sensitivity Analysis:
  Optimistic case: Value +30%, Investment -10%
  Base case: Best estimate
  Pessimistic case: Value -30%, Investment +30%
```

#### 5. Impact-Effort Prioritization Matrix

Two-dimensional scoring framework:

```
IMPACT SCORE (1-5):
  5 = >$1M annual value AND/OR safety-critical improvement
  4 = $500K-$1M annual value
  3 = $200K-$500K annual value
  2 = $50K-$200K annual value
  1 = <$50K annual value

EFFORT SCORE (1-5):
  1 = Minimal effort, no capital, <1 month, existing resources
  2 = Low effort, <$50K, 1-3 months, minor disruption
  3 = Moderate effort, $50K-$200K, 3-6 months, some disruption
  4 = High effort, $200K-$1M, 6-12 months, significant resources
  5 = Major effort, >$1M, >12 months, major project required

PRIORITY RANKING = Impact Score / Effort Score (higher = better)
  Quick Win: Impact >= 3 AND Effort <= 2
  Strategic: Impact >= 4 AND Effort >= 3
  Fill-in: Impact <= 2 AND Effort <= 2
  Deprioritize: Impact <= 2 AND Effort >= 3
```

### Standards Applied

- **SMRP Best Practice** -- Benchmark data for gap analysis
- **Lean Six Sigma** -- DMAIC methodology for improvement identification
- **TPM (Total Productive Maintenance)** -- OEE loss structure and focused improvement pillars
- **RCM (Reliability Centered Maintenance)** -- Failure mode analysis for reliability improvements
- **ISO 55000** -- Asset management decision-making framework (risk-based, lifecycle value)
- **AACE International** -- Cost estimation and engineering economics standards

### Industry Statistics on Improvement Value

| Improvement Type | Typical Value Range | Typical Investment | Typical Payback |
|-----------------|--------------------|--------------------|-----------------|
| Bad actor elimination (top 20) | 15-30% reduction in CM cost | $50K-$200K per asset | 3-12 months |
| PM optimization | 10-25% reduction in PM cost | $50K-$150K (analysis) | 3-6 months |
| Planning & scheduling improvement | 10-15% labor productivity gain | $100K-$300K (systems + training) | 6-12 months |
| Predictive maintenance expansion | 20-40% reduction in failures | $200K-$1M (technology + training) | 12-24 months |
| Energy optimization | 5-15% energy cost reduction | $100K-$500K | 12-24 months |
| Process optimization | 2-8% throughput improvement | $100K-$2M | 6-18 months |
| Inventory optimization | 15-25% MRO inventory reduction | $50K-$150K (analysis + system) | 3-12 months |

---

## Step-by-Step Execution

### Phase 1: Data Collection and Baseline Analysis (Steps 1-4)

**Step 1: Acquire Performance Data from Upstream Skills**
- Retrieve current KPI dataset from calculate-operational-kpis (S-01):
  - All production, maintenance, reliability, and cost KPIs with 12+ months history
  - Targets and benchmark comparisons
  - Trend analysis results
  - Active KPI alerts
- Retrieve failure analysis from analyze-failure-patterns (MAINT-03):
  - Bad actor list (top 20 by downtime, cost, frequency)
  - Root cause analysis findings
  - Repeat failure patterns
  - Defect elimination status
- Retrieve benchmark data from benchmark-maintenance-kpis (MAINT-04):
  - SMRP quartile positioning for each maintenance KPI
  - Gap quantification in business terms
- Validate data completeness and flag any gaps affecting analysis quality

**Step 2: Perform OEE Loss Waterfall Analysis**
- Decompose OEE into Availability x Performance x Quality components
- For Availability losses:
  - Categorize all unplanned downtime by cause (mechanical, electrical, instrumentation, process, external)
  - Further decompose each cause to specific equipment/system
  - Rank by downtime hours and production value lost
- For Performance losses:
  - Identify periods of reduced throughput (actual < design rate)
  - Categorize causes: hard ore, equipment degradation, bottleneck, operator choice
  - Quantify throughput gap and value
- For Quality losses:
  - Identify off-spec production events
  - Categorize causes: process variability, equipment condition, raw material quality
  - Quantify quality loss value (reprocessing cost, revenue reduction, waste)
- Calculate total loss value for each category and cause

**Step 3: Perform Equipment-Level Pareto Analysis**
- Extract corrective work order data for analysis period (12-36 months)
- Aggregate by equipment tag:
  - Total downtime hours
  - Total maintenance cost (labor + materials + contractors)
  - Failure count
  - Mean Time Between Failures
  - Average repair time
- Generate three Pareto charts (downtime, cost, frequency)
- Identify "triple-threat" bad actors appearing in top 20 on all three Paretoss
- For each top-20 bad actor:
  - Document failure modes and root causes (from MAINT-03 if available)
  - Estimate annual cost of current failure pattern
  - Identify potential elimination strategies

**Step 4: Perform Benchmarking Gap Analysis**
- For each KPI with benchmark data:
  - Calculate gap to next quartile boundary
  - Calculate gap to top quartile (stretch target)
  - Translate gap to business value:
    - Availability gap -> production hours -> tons/revenue
    - Maintenance cost gap -> direct savings
    - PM compliance gap -> indirect impact on reliability and availability
    - Reactive % gap -> labor efficiency and emergency cost premium
  - Classify: quick-win (easy to close) vs. strategic (requires sustained effort)
- Rank gaps by business value (largest value first)

### Phase 2: Opportunity Identification and Quantification (Steps 5-8)

**Step 5: Identify Reliability Improvement Opportunities**
- From bad actor analysis and OEE availability losses:
  - For each top-20 bad actor, define improvement opportunity:
    - Description: what needs to change (design modification, PM strategy change, operating practice change)
    - Root cause addressed: what failure mode will be eliminated or reduced
    - Expected impact: estimated reduction in failure frequency and downtime
    - Investment required: capital, labor, materials, engineering
  - From common-mode failures: identify fleet-wide improvements
  - From infant mortality patterns: identify workmanship or installation quality improvements
  - From age-related failures: identify proactive replacement or refurbishment opportunities

**Step 6: Identify Maintenance Effectiveness Opportunities**
- From KPI gap analysis:
  - PM optimization: review PM compliance and effectiveness data
    - Identify PMs with no findings in 3+ years (candidates for elimination or frequency reduction)
    - Identify PMs that consistently find defects (validate frequency is adequate)
    - Estimate savings from removing non-value-adding PMs (typically 15-30% of PM program)
  - Planning & scheduling improvement:
    - Quantify wrench time gap value (each 1% wrench time improvement = X additional labor hours)
    - Quantify schedule compliance gap (poor scheduling = emergency overtime, parts expediting)
  - Predictive maintenance expansion:
    - Identify critical equipment without PdM coverage
    - Estimate value of early failure detection vs. run-to-failure
  - Contractor optimization:
    - If contractor % exceeds benchmark, identify work types that could be insourced
    - Estimate cost difference between in-house and contract execution
  - Inventory optimization:
    - If stockout rate high, quantify production impact
    - If inventory value excessive, quantify carrying cost savings from right-sizing

**Step 7: Identify Production and Process Opportunities**
- From OEE performance and quality losses:
  - Throughput improvement: identify bottleneck equipment/process and capacity increase options
  - Recovery improvement: identify process optimization opportunities for yield enhancement
  - Quality improvement: identify sources of off-spec production and corrective measures
  - Energy efficiency: identify high-consumption equipment and optimization opportunities
- From operational practice analysis:
  - Startup/shutdown optimization: reduce transition time and associated losses
  - Changeover optimization: reduce product changeover time and waste
  - Operating envelope optimization: identify conservative operating practices limiting throughput

**Step 8: Quantify Each Opportunity (ROI Estimation)**
- For each identified opportunity:
  - Estimate annual value (avoided cost + production gain + risk reduction)
  - Estimate investment required (capital + implementation + disruption)
  - Calculate financial metrics: NPV (5-year), payback period, IRR
  - Perform sensitivity analysis (optimistic, base, pessimistic scenarios)
  - Assign confidence level: High (>80% confidence in estimate), Medium (50-80%), Low (<50%)
  - Document assumptions and data sources
- Apply cross-checks:
  - Total improvement value should be plausible relative to current cost/revenue base
  - No single opportunity should claim >50% of total losses (likely overestimated)
  - Sum of availability improvements should not exceed total availability gap

### Phase 3: Prioritization and Portfolio Construction (Steps 9-12)

**Step 9: Score and Rank Opportunities**
- Apply Impact-Effort scoring to each opportunity:
  - Impact score (1-5) based on annual value, safety impact, strategic alignment
  - Effort score (1-5) based on investment, duration, complexity, disruption
  - Priority score = Impact / Effort
- Apply strategic alignment weighting:
  - Multiply priority score by strategic alignment factor (0.5-1.5) based on management priorities
  - Safety improvements receive automatic 1.5x multiplier
- Generate ranked opportunity list
- Classify into quadrants: Quick Wins, Strategic Projects, Fill-ins, Deprioritize

**Step 10: Construct Implementation Roadmap**
- Phase opportunities into implementation waves:
  - Wave 1 (0-3 months): Quick wins requiring minimal investment
  - Wave 2 (3-6 months): High-priority opportunities requiring moderate planning
  - Wave 3 (6-12 months): Strategic projects requiring capital approval
  - Wave 4 (12-24 months): Large-scale improvements requiring significant preparation
- For each wave:
  - Total investment required
  - Expected annual value when fully implemented
  - Resource requirements (FTE, contractor, capital)
  - Dependencies between opportunities
  - Risk factors and contingencies
- Validate roadmap against capital budget constraints and resource availability

**Step 11: Produce Improvement Opportunity Register**
- Compile all opportunities into the Improvement Register workbook:
  - Executive summary sheet with portfolio overview
  - Detailed register with all quantification
  - Pareto analysis sheets
  - OEE loss waterfall
  - Gap analysis
  - Impact-Effort matrix
  - ROI details
  - Implementation roadmap
- Quality-check all calculations and cross-references
- Store in mcp-sharepoint (improvement library) and publish dashboard via mcp-powerbi

**Step 12: Present and Distribute**
- Generate Executive Improvement Brief (.docx) summarizing top findings
- Update Power BI improvement dashboard
- Distribute to stakeholders via mcp-outlook:
  - Executive summary to senior management
  - Full register to improvement program manager
  - Domain-specific extracts to functional managers (maintenance, operations, engineering)
- Schedule improvement portfolio review meeting

### Phase 4: Tracking and Continuous Improvement (Steps 13-16)

**Step 13: Track Improvement Implementation**
- For approved improvements:
  - Create tracking records in mcp-airtable or mcp-sharepoint
  - Assign implementation owner and target dates
  - Define success KPIs (what will we measure to confirm improvement worked?)
  - Track milestone progress (planning, procurement, implementation, commissioning, verification)
- Report implementation progress in monthly KPI cycle

**Step 14: Measure Value Capture**
- For implemented improvements:
  - Compare actual KPI performance against baseline (pre-improvement)
  - Calculate actual value captured: actual cost reduction, actual availability improvement, actual throughput gain
  - Compare actual vs. estimated value (for calibrating future estimates)
  - Document lessons learned: what worked, what did not, what would we do differently
- Generate value capture report showing cumulative improvement value

**Step 15: Refresh Opportunity Register (Monthly)**
- Update with latest KPI data (from S-01 monthly cycle)
- Add new opportunities identified from recent data
- Remove or close opportunities that have been implemented
- Re-rank remaining opportunities based on updated data
- Flag any opportunities where the underlying problem has worsened (urgency increasing)

**Step 16: Conduct Quarterly Portfolio Review**
- Comprehensive review of improvement portfolio:
  - Progress on approved improvements
  - Value capture vs. targets
  - New opportunities identified
  - Changes in priority due to operational or strategic shifts
  - Portfolio balance: mix of quick wins, strategic projects, and sustaining improvements
  - Resource adequacy: do we have enough people/budget to execute the pipeline?
- Produce quarterly improvement portfolio report for management steering committee

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Opportunity Coverage | All OEE loss categories analyzed | 100% | >90% |
| Bad Actor Coverage | Top 20 bad actors identified and analyzed | 100% | Top 20 on at least one Pareto |
| Quantification Rigor | Opportunities with full ROI calculation | >80% | >60% |
| Estimate Accuracy | Actual value capture vs. estimate (tracked over time) | Within +/-30% | Within +/-50% |
| Assumptions Documented | Opportunities with explicit documented assumptions | 100% | >90% |
| Prioritization Consistency | Impact-Effort scoring applied uniformly | 100% | 100% |
| Data Currency | Analysis based on data no older than | 3 months | 6 months |
| Actionability | Opportunities with clear implementation path defined | >90% | >80% |
| Value Coverage | Total identified value vs. total performance gap | >60% of gap explained | >40% |
| Stakeholder Usefulness | Survey: "Register helps me decide where to invest" | >4.0/5.0 | >3.5/5.0 |
| Register Freshness | Time since last full refresh | <1 month | <3 months |
| Implementation Tracking | Approved improvements with active tracking | 100% | >90% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `calculate-operational-kpis` (S-01) | KPI data with gaps, trends, alerts | Critical |
| `analyze-failure-patterns` (MAINT-03) | Bad actor list, RCA findings, failure patterns | Critical |
| `benchmark-maintenance-kpis` (MAINT-04) | SMRP quartile data and gap quantification | High |
| CMMS data via mcp-cmms | Work order and equipment data | Critical |
| ERP data via mcp-erp | Cost and production data | Critical |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `generate-performance-report` (S-03) | Improvement portfolio summary for management reports | Monthly/Quarterly |
| `develop-maintenance-strategy` (MAINT-01) | Reliability improvement opportunities informing strategy updates | Quarterly |
| `optimize-pm-program` (MAINT-02) | PM optimization opportunities identified | Quarterly |
| `model-opex-budget` | Improvement investment and savings for budget model | Annual |
| `agent-or-pmo` | Improvement portfolio for OR governance | Monthly |
| `accelerate-decision-cycle` (INTG-03) | Prioritized improvement options for decision support | On demand |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Extract work order, equipment, and failure data for Pareto and bad actor analysis"
capabilities:
  - Extract corrective work orders with cost, downtime, and failure coding
  - Access equipment hierarchy for Pareto aggregation
  - Retrieve PM compliance and work management data
  - Access reliability data (MTBF, MTTR, failure rates)
authentication: API Key / Service Account
usage_in_skill:
  - Step 1: Retrieve work order and equipment data
  - Step 3: Equipment-level Pareto analysis
  - Step 5: Reliability improvement opportunity identification
  - Step 6: Maintenance effectiveness analysis
```

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Retrieve KPI data from dashboards and publish improvement analysis dashboards"
capabilities:
  - Read KPI datasets from calculate-operational-kpis (S-01) dashboards
  - Create improvement opportunity dashboard
  - Publish interactive Impact-Effort scatter plot
  - Create OEE loss waterfall visualization
  - Configure drill-down from opportunity to supporting data
authentication: Service Principal
usage_in_skill:
  - Step 1: Retrieve KPI data
  - Step 11: Publish improvement dashboard
  - Step 14: Update value capture tracking visualization
```

### mcp-excel
```yaml
name: "mcp-excel"
server: "@anthropic/excel-mcp"
purpose: "Generate detailed Improvement Opportunity Register workbook"
capabilities:
  - Create multi-sheet workbook with calculations, charts, and formatting
  - Generate Pareto charts and waterfall diagrams
  - Build Impact-Effort scatter plot
  - Create ROI calculation tables with sensitivity analysis
  - Format conditional formatting for RAG indicators
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 11: Generate Improvement Opportunity Register workbook
  - Step 14: Update value capture tracking workbook
```

---

## Templates & References

### Improvement Opportunity Card Template

```markdown
## Improvement Opportunity: {OPP-ID}
## Title: {Title}
## Domain: {Reliability / Maintenance / Production / Cost / Energy}
## Priority: {Rank} / {Total}

### Problem Statement
{What is the current situation? What losses are being incurred?}

### Root Cause
{Why does this problem exist? What is driving the losses?}

### Proposed Improvement
{What specific change will address the root cause?}

### Expected Benefits
| Benefit | Annual Value | Confidence |
|---------|-------------|------------|
| Downtime reduction | $XXX,XXX | {H/M/L} |
| Cost savings | $XXX,XXX | {H/M/L} |
| Production gain | $XXX,XXX | {H/M/L} |
| Total | $X,XXX,XXX | |

### Investment Required
| Item | Cost | Timeline |
|------|------|----------|
| {Capital/materials} | $XXX,XXX | {months} |
| {Engineering/implementation} | $XXX,XXX | {months} |
| Total | $XXX,XXX | |

### Financial Summary
| Metric | Base Case | Optimistic | Pessimistic |
|--------|-----------|-----------|-------------|
| NPV (5yr) | $X.XM | $X.XM | $X.XM |
| Payback | X.X months | X.X months | X.X months |
| IRR | XXX% | XXX% | XXX% |

### Implementation Requirements
- Resources: {FTE, skills, contractor}
- Duration: {months}
- Dependencies: {other improvements, shutdowns, capital approval}
- Risks: {technical, schedule, resource}

### Success Metrics
- KPI 1: {metric, baseline, target, measurement frequency}
- KPI 2: {metric, baseline, target, measurement frequency}
```

### Reference Documents
- SMRP Body of Knowledge -- Improvement and performance measurement
- Lean Six Sigma Green/Black Belt Body of Knowledge -- DMAIC methodology
- TPM Focused Improvement Pillar -- Loss structure and elimination techniques
- ISO 55000 -- Asset management decision-making framework
- Wireman, T. "Total Productive Maintenance" (2nd Ed.)
- Moubray, J. "Reliability-Centered Maintenance" -- Failure analysis basis
- AACE International Recommended Practices -- Cost estimation
- VSC Internal: "Guia de Identificacion de Oportunidades de Mejora v2.0"

---

## Examples

### Example 1: Monthly Improvement Identification

```
Trigger: Monthly refresh (February 2026, using January data)

Process:
  1. Data Acquired:
     - KPIs from S-01: OEE 78.5%, availability 91.2%, reactive 28%
     - Bad actors from MAINT-03: top 20 updated, SAG bearing #1
     - Benchmarks from MAINT-04: 8 KPIs in Q3, 4 in Q2

  2. OEE Loss Waterfall:
     - Availability losses: 63.4 hrs ($4.8M annualized)
       Top cause: SAG mill bearing failures ($1.85M)
     - Performance losses: 32.0 hrs ($2.4M annualized)
       Top cause: Hard ore throughput reduction ($1.6M)
     - Quality losses: 59.3 hrs ($4.5M annualized)
       Top cause: Flotation recovery variation ($2.4M)
     - Total loss value: $11.7M annualized

  3. Opportunities Identified:
     - 6 new opportunities from January data
     - 39 existing opportunities updated
     - 3 opportunities closed (implemented successfully)
     - Total active: 42 opportunities, $12.8M total value

  4. Top 5 Quick Wins:
     1. PM optimization (remove NVA PMs): $680K/yr, $45K invest
     2. Conveyor belt tracking adjustment: $320K/yr, $15K invest
     3. Pump seal upgrade (common-mode): $280K/yr, $85K invest
     4. Alarm rationalization (reduce operator errors): $250K/yr, $40K invest
     5. Shift handover improvement (reduce startup losses): $180K/yr, $10K invest

Output:
  "Improvement register refreshed with January data.
   42 active opportunities totaling $12.8M annual value.
   6 new opportunities identified, 3 closed (value captured: $420K/yr).
   5 quick wins available for immediate action ($1.7M value, $195K invest).
   Register published: [SharePoint link]
   Dashboard updated: https://app.powerbi.com/sv-improvements"
```

### Example 2: Bad Actor Deep Dive

```
Trigger: Bad actor #1 investigation (SAG Mill #2 Main Bearing)

Analysis:
  Equipment: SAG-ML-002 (Main Bearing Assembly)
  Analysis Period: January 2024 - January 2026 (24 months)

  Failure History:
    Events: 7 failures in 24 months (MTBF: 3.4 months)
    Total Downtime: 312 hours (avg 44.6 hours per event)
    Total Cost: $1,850K (labor $420K, materials $1,180K, contractor $250K)
    Production Loss: 593,400 tons = $29.7M revenue impact at $50/ton margin

  Root Cause Pattern:
    - 4 of 7 failures: misalignment (exceeding 0.003" tolerance)
    - 2 of 7 failures: lubrication degradation (oil analysis shows contamination)
    - 1 of 7 failures: manufacturing defect (bearing cage fracture)

  Improvement Opportunity: OPP-001
    Actions:
    a. Install laser alignment system (permanent alignment monitoring): $45K
    b. Upgrade to synthetic lubricant with automatic oil conditioning: $35K
    c. Install continuous vibration monitoring (early detection): $40K
    Total Investment: $120K

    Expected Impact:
    - Eliminate 4 misalignment failures/year -> 178 hours recovered
    - Reduce lubrication failures by 80% -> 36 hours recovered
    - Early detection reduces remaining failure severity by 50% -> 12 hours recovered
    - Total: 226 hours recovered -> 429,400 tons -> $21.5M production value
    - Maintenance savings: $1.2M/year avoided repair cost

    Financial Summary:
    NPV (5-year, 12% discount): $4.2M
    Payback: 0.8 months
    IRR: >500%

  Recommendation: HIGHEST PRIORITY - implement immediately
```
