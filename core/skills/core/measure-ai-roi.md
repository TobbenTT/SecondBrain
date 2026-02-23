# DT-03: Measure AI ROI

## 1. Purpose

Provide a rigorous, multi-dimensional framework for calculating the Return on Investment (ROI) of AI and machine learning implementations in industrial operations. This skill addresses the critical challenge that only 5--15% of AI use cases are successfully operationalized (McKinsey AI Survey, 2023), largely because organizations lack structured methods to quantify AI value, track benefits realization, and make data-driven investment decisions.

The framework goes beyond simple cost-benefit analysis to encompass total cost of ownership (TCO), direct and indirect benefits, risk-adjusted returns, time-to-value metrics, and strategic value that traditional ROI calculations miss. It enables organizations to compare AI investments against alternatives, justify continued funding, and identify underperforming deployments early.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | DT-03                                                                                       |
| **Agent**              | Agent 11 -- Digital Transformation Orchestrator                                              |
| **Domain**             | Digital Transformation / Financial Analysis                                                  |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | 3--7 business days per use case evaluation                                                   |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | G-01: Only 5--15% of AI use cases are successfully operationalized (McKinsey, 2023)        |
| **Secondary Pain**     | B-01: 70--80% of AI pilots fail to scale to production (Gartner, 2023)                      |
| **Value Created**      | Organizations with formal AI ROI frameworks are 3.2x more likely to scale AI investments    |

### Functional Intent

This skill SHALL:
- Calculate comprehensive Total Cost of Ownership (TCO) for AI implementations
- Quantify direct financial benefits (cost reduction, revenue increase, productivity gains)
- Estimate indirect and strategic benefits (risk reduction, compliance, innovation enablement)
- Compute risk-adjusted ROI, NPV, IRR, and payback period
- Track benefits realization against business case projections
- Generate comparative analysis across multiple AI use cases for portfolio optimization
- Produce executive-ready investment reports with sensitivity analysis

---

## 3. Trigger / Invocation

### Direct Invocation

```
/measure-ai-roi --use-case [use-case-id] --phase [pre-investment|post-pilot|post-deployment|ongoing] --comparison-period [months]
```

### Contextual Triggers

- Pre-investment evaluation of proposed AI use case
- Post-pilot assessment to decide on scaling investment
- Quarterly/annual benefits realization review
- Portfolio optimization across multiple AI investments
- Budget defense or reallocation request
- DT-02 roadmap initiative requires business case validation

---

## 4. Input Requirements

### Required Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `use_case_definition`        | Object        | mcp-sharepoint             | Description, scope, objectives of the AI use case                |
| `cost_data`                  | Object        | mcp-excel / mcp-sharepoint | All cost components (development, infrastructure, operations)    |
| `benefit_projections`        | Object        | mcp-excel                  | Expected benefits with quantification methodology                |
| `evaluation_phase`           | Enum          | Manual                     | pre-investment, post-pilot, post-deployment, or ongoing          |
| `baseline_metrics`           | Object        | mcp-powerbi / mcp-excel    | Pre-AI performance metrics for comparison                        |

### Optional Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `actual_performance`         | Object        | mcp-powerbi                | Post-deployment actual metrics (for post-deployment/ongoing)     |
| `risk_parameters`            | Object        | Manual                     | Probability distributions for Monte Carlo simulation             |
| `discount_rate`              | Number        | Manual                     | WACC or hurdle rate for NPV calculations (default: 10%)          |
| `alternative_scenarios`      | Array[Object] | Manual                     | Non-AI alternatives for comparative analysis                     |
| `industry_benchmarks`        | Object        | mcp-sharepoint             | Industry-specific ROI benchmarks for similar AI use cases        |

### Input Validation Rules

```yaml
validation:
  cost_data:
    required_categories: ["development", "infrastructure", "data", "operations", "change_management"]
    all_values: { type: number, min: 0 }
  benefit_projections:
    required: ["category", "annual_value", "confidence_level", "quantification_method"]
    confidence_level: { allowed: ["high", "medium", "low"] }
  discount_rate:
    type: number
    min: 0.01
    max: 0.30
    default: 0.10
```

---

## 5. Output Specification

### Primary Outputs

| Output                          | Format       | Destination              | Description                                                   |
|---------------------------------|--------------|--------------------------|---------------------------------------------------------------|
| `roi_analysis`                  | JSON + XLSX  | mcp-sharepoint           | Complete ROI calculation with all components                   |
| `executive_investment_report`   | PDF / PPTX   | mcp-sharepoint           | Executive summary with key financial metrics                   |
| `sensitivity_analysis`          | XLSX + Chart | mcp-powerbi              | Tornado charts and scenario analysis                           |
| `benefits_tracker`              | XLSX + Dashboard | mcp-powerbi           | Ongoing benefits realization tracking dashboard                |
| `portfolio_comparison`          | JSON + Chart | mcp-powerbi              | Cross-use-case comparison for portfolio decisions              |

### Output Schema: ROI Analysis

```json
{
  "analysis_id": "DT03-2025-001",
  "use_case": "Predictive Maintenance -- Crusher Fleet",
  "evaluation_phase": "post-pilot",
  "analysis_date": "2025-06-15",
  "time_horizon_years": 5,
  "financial_summary": {
    "total_investment": 850000,
    "total_benefits_5yr": 4200000,
    "net_present_value": 2150000,
    "internal_rate_of_return": 0.48,
    "payback_period_months": 18,
    "simple_roi_percent": 394,
    "risk_adjusted_roi_percent": 276,
    "benefit_cost_ratio": 4.94
  },
  "cost_breakdown": {
    "development": {"year_0": 350000, "year_1": 50000, "annual_ongoing": 25000},
    "infrastructure": {"year_0": 150000, "year_1": 20000, "annual_ongoing": 60000},
    "data_preparation": {"year_0": 100000, "year_1": 30000, "annual_ongoing": 15000},
    "change_management": {"year_0": 80000, "year_1": 40000, "annual_ongoing": 10000},
    "operations_support": {"year_0": 0, "year_1": 80000, "annual_ongoing": 80000}
  },
  "benefits_breakdown": {
    "direct": [
      {"category": "Unplanned downtime reduction", "annual_value": 520000, "confidence": "high"},
      {"category": "Maintenance cost optimization", "annual_value": 180000, "confidence": "high"},
      {"category": "Spare parts inventory reduction", "annual_value": 60000, "confidence": "medium"}
    ],
    "indirect": [
      {"category": "Safety incident reduction", "annual_value": 120000, "confidence": "medium"},
      {"category": "Equipment life extension", "annual_value": 80000, "confidence": "low"}
    ],
    "strategic": [
      {"category": "Data foundation for autonomous operations", "value": "enabling", "confidence": "low"}
    ]
  },
  "sensitivity_results": {
    "best_case_npv": 3200000,
    "worst_case_npv": 850000,
    "breakeven_adoption_rate": 0.35,
    "most_sensitive_variable": "unplanned_downtime_reduction_rate"
  }
}
```

---

## 6. Methodology & Standards

### Theoretical Foundation

- **Total Cost of Ownership (TCO)** -- Gartner TCO framework adapted for AI/ML workloads
- **Real Options Analysis** -- Valuing strategic optionality of AI platform investments
- **Monte Carlo Simulation** -- Probabilistic ROI modeling under uncertainty
- **Balanced Scorecard** -- Multi-perspective value measurement (Financial, Customer, Process, Learning)
- **AI-specific ROI Framework** -- Adapted from MIT Sloan "Measuring AI ROI" methodology

### Industry Statistics

| Statistic                                                            | Source                      | Year |
|----------------------------------------------------------------------|-----------------------------|------|
| Only 5--15% of AI use cases reach full operationalization             | McKinsey AI Survey           | 2023 |
| Average AI project ROI: 1.3% of revenue (when successful)            | McKinsey                     | 2023 |
| 74% of organizations struggle to quantify AI business value           | Gartner                      | 2024 |
| Median time to ROI for industrial AI: 9--18 months                    | BCG                          | 2023 |
| Predictive maintenance AI shows 10--40% maintenance cost reduction    | McKinsey Operations          | 2023 |
| AI-driven quality improvements: 20--50% defect reduction              | WEF Lighthouse Network       | 2023 |
| Top-quartile AI implementers: 5--10x ROI vs. average                  | Accenture                    | 2024 |
| Hidden costs (data prep, change mgmt) typically 2--3x initial estimate| Deloitte AI Institute        | 2023 |

### Cost Categories (Total Cost of Ownership)

#### 1. Development Costs (One-time + Iterative)
- Data acquisition and preparation (typically 40--60% of development cost)
- Model development and training (compute, data science labor)
- Integration development (API, system connectors, UI)
- Testing and validation (model performance, integration, UAT)
- Security and compliance review

#### 2. Infrastructure Costs
- Cloud compute (training and inference)
- Data storage (raw, processed, feature store)
- MLOps platform (model registry, pipeline orchestration)
- Edge computing hardware (for OT deployments)
- Network upgrades (bandwidth, latency requirements)

#### 3. Operational Costs (Ongoing)
- Model monitoring and retraining
- Data pipeline maintenance
- Infrastructure operations
- Support and incident management
- License and subscription fees

#### 4. People Costs
- Data science / ML engineering team
- Domain expert involvement
- IT/OT support resources
- Project management
- Training for end users

#### 5. Change Management Costs
- Change impact assessment
- Communication and engagement
- Training program development and delivery
- Resistance management
- Post-deployment adoption support

### Benefit Quantification Methods

| Benefit Type              | Quantification Method                                         | Confidence |
|---------------------------|---------------------------------------------------------------|------------|
| Downtime Reduction        | (Baseline_downtime - AI_downtime) * Cost_per_hour             | High       |
| Maintenance Cost Savings  | Baseline_maintenance_cost - Optimized_cost                    | High       |
| Energy Efficiency         | (Baseline_consumption - Optimized_consumption) * Energy_cost  | High       |
| Quality Improvement       | Defect_reduction_rate * Cost_per_defect * Volume              | Medium     |
| Safety Improvement        | Incident_reduction * Average_incident_cost                    | Medium     |
| Productivity Gain         | Time_saved * Loaded_labor_cost * Utilization_improvement      | Medium     |
| Inventory Optimization    | Inventory_reduction * Carrying_cost_rate                      | Medium     |
| Revenue Uplift            | Throughput_increase * Margin_per_unit                         | Low        |
| Equipment Life Extension  | Extended_years * Replacement_cost * Discount_factor           | Low        |

---

## 7. Step-by-Step Execution

### Phase 1: Scope & Baseline (Day 1--2)

**Step 1.1: Use Case Definition & Boundary Setting**
```
ACTION: Define the evaluation scope and boundaries
INPUTS: use_case_definition, evaluation_phase
PROCESS:
  1. Document use case scope: systems, processes, users affected
  2. Define evaluation boundary (what's in/out of ROI calculation)
  3. Identify counterfactual (what happens without AI)
  4. Set time horizon for analysis (typically 3--5 years)
  5. Confirm discount rate with finance team
OUTPUT: Evaluation scope document with clear boundaries
MCP: mcp-sharepoint (use case documentation)
```

**Step 1.2: Baseline Metric Collection**
```
ACTION: Collect pre-AI performance baselines
INPUTS: baseline_metrics
PROCESS:
  1. Identify all metrics that AI is expected to improve
  2. Collect minimum 12 months of historical baseline data
  3. Validate data quality and completeness
  4. Calculate baseline statistics (mean, std dev, trends)
  5. Document any baseline anomalies or external factors
  6. Establish measurement methodology for ongoing tracking
OUTPUT: Validated baseline dataset with statistical summary
MCP: mcp-excel (data collection), mcp-powerbi (baseline visualization)
```

### Phase 2: Cost Analysis (Day 2--4)

**Step 2.1: Total Cost of Ownership Calculation**
```
ACTION: Calculate comprehensive TCO across all categories
INPUTS: cost_data, time_horizon
PROCESS:
  1. Collect actual/estimated costs for all 5 categories
  2. Separate one-time costs from recurring costs
  3. Model cost evolution over time horizon:
     - Development costs decrease after year 1
     - Infrastructure costs may scale with usage
     - Operational costs typically stabilize by year 2
     - People costs may decrease as team efficiency grows
  4. Apply cost escalation factors (inflation, license increases)
  5. Calculate total undiscounted and discounted (NPV) cost streams
OUTPUT: TCO model with year-by-year cost breakdown
MCP: mcp-excel (cost modeling)
```

**Step 2.2: Hidden Cost Identification**
```
ACTION: Identify and quantify commonly overlooked costs
INPUTS: use_case_definition, cost_data
PROCESS:
  1. Technical debt costs (workarounds, manual interventions)
  2. Data quality remediation costs
  3. Opportunity cost of team allocation
  4. Integration maintenance as dependent systems change
  5. Regulatory compliance costs (model explainability, auditing)
  6. Model degradation and retraining costs
  7. Vendor lock-in switching costs (if applicable)
  8. Add 15--25% contingency for unknown unknowns (based on phase)
OUTPUT: Hidden cost inventory with estimates
```

### Phase 3: Benefits Analysis (Day 3--5)

**Step 3.1: Direct Benefits Quantification**
```
ACTION: Calculate tangible, measurable financial benefits
INPUTS: benefit_projections, baseline_metrics, actual_performance (if post-deployment)
PROCESS:
  1. For each direct benefit category:
     a. Define measurement formula
     b. If pre-investment: use projection with confidence ranges
     c. If post-deployment: use actual measured improvement
     d. Apply conservative, moderate, and optimistic scenarios
     e. Validate with operational stakeholders
  2. Calculate annual benefit streams over time horizon
  3. Model benefit ramp-up (typically 3--6 months to full benefit)
  4. Apply adoption rate factors (not 100% from day 1)
OUTPUT: Direct benefits model with scenario ranges
MCP: mcp-excel (benefit calculations), mcp-powerbi (actual vs. projected tracking)
```

**Step 3.2: Indirect and Strategic Benefits Assessment**
```
ACTION: Estimate indirect and strategic value
INPUTS: use_case_definition, industry_benchmarks
PROCESS:
  1. Indirect benefits (quantifiable but less certain):
     - Safety improvement value
     - Environmental/ESG compliance value
     - Employee satisfaction and retention impact
     - Customer satisfaction improvement
  2. Strategic benefits (qualitative with proxy metrics):
     - Platform/data asset creation for future use cases
     - Organizational learning and capability building
     - Competitive positioning and market differentiation
     - Regulatory preparedness
  3. Assign monetary proxies where possible
  4. Document qualitative benefits for balanced scorecard
OUTPUT: Indirect benefits estimates, strategic value narrative
```

### Phase 4: ROI Calculation & Analysis (Day 5--6)

**Step 4.1: Financial Metric Computation**
```
ACTION: Calculate all key financial ROI metrics
INPUTS: TCO model, benefits model, discount_rate
PROCESS:
  1. Simple ROI = (Total Benefits - Total Costs) / Total Costs * 100
  2. NPV = SUM(Annual_Net_Benefits / (1 + r)^t) for t = 0 to T
  3. IRR = Rate where NPV = 0 (solve iteratively)
  4. Payback Period = Time when cumulative net benefits > 0
  5. Benefit-Cost Ratio = PV(Benefits) / PV(Costs)
  6. Risk-Adjusted ROI = ROI * Probability_of_Success * Adoption_Rate
  7. Calculate for conservative, moderate, and optimistic scenarios
OUTPUT: Complete financial metrics table
MCP: mcp-excel (financial calculations)
```

**Step 4.2: Sensitivity Analysis**
```
ACTION: Identify key value drivers and their impact on ROI
INPUTS: Financial model, risk_parameters
PROCESS:
  1. Identify top 8--10 input variables with uncertainty
  2. For each variable:
     a. Define range (pessimistic to optimistic)
     b. Calculate NPV at each extreme
     c. Calculate NPV sensitivity coefficient
  3. Generate tornado chart (most to least sensitive)
  4. Run Monte Carlo simulation (10,000 iterations):
     a. Sample from probability distributions
     b. Calculate NPV for each iteration
     c. Generate probability distribution of outcomes
     d. Calculate P10, P50, P90 NPV values
  5. Identify breakeven conditions for key variables
OUTPUT: Tornado chart, Monte Carlo distribution, breakeven analysis
MCP: mcp-powerbi (sensitivity visualization)
```

### Phase 5: Reporting & Tracking (Day 6--7)

**Step 5.1: Investment Report Generation**
```
ACTION: Create executive-ready investment analysis report
INPUTS: All analysis outputs
PROCESS:
  1. Executive Summary (1 page):
     - Investment recommendation (Go/No-Go/Conditional)
     - Key financial metrics summary
     - Top 3 risks and mitigations
  2. Detailed Analysis (5--8 pages):
     - TCO breakdown with charts
     - Benefits analysis with confidence levels
     - Financial metrics with scenario ranges
     - Sensitivity analysis with tornado chart
     - Monte Carlo results with probability curves
  3. Appendices:
     - Detailed assumptions and methodology
     - Data sources and validation
     - Benchmark comparisons
OUTPUT: Investment report (PDF/PPTX)
MCP: mcp-sharepoint (report storage)
```

**Step 5.2: Benefits Tracking Dashboard Setup**
```
ACTION: Configure ongoing benefits realization tracking
INPUTS: roi_analysis, baseline_metrics
PROCESS:
  1. Define tracking metrics aligned with benefit categories
  2. Set up automated data collection from source systems
  3. Configure dashboard with:
     - Projected vs. actual benefit curves
     - Cumulative ROI tracker
     - Leading indicators for benefit realization
     - Alert thresholds for underperformance
  4. Define review cadence (monthly for first year, quarterly after)
  5. Create benefit realization report template
OUTPUT: Benefits tracking dashboard (Power BI)
MCP: mcp-powerbi (dashboard creation), mcp-sharepoint (report template)
```

---

## 8. Quality Criteria

| Metric                              | Target         | Measurement                                        |
|--------------------------------------|----------------|-----------------------------------------------------|
| Cost Completeness                    | All 5 categories covered | TCO audit checklist                          |
| Benefit Substantiation               | >= 80% benefits with evidence | Evidence trail review                  |
| Assumption Documentation             | 100% assumptions documented | Assumption register audit                |
| Financial Model Accuracy             | Within 20% of actuals (post-deployment) | Actual vs. projected comparison |
| Sensitivity Coverage                 | Top 10 variables analyzed | Variable list review                      |
| Report Timeliness                    | <= 7 business days | Delivery tracking                              |
| Stakeholder Confidence               | >= 4.0/5.0 credibility rating | Post-presentation survey             |

---

## 9. Inter-Agent Dependencies

| Agent       | Direction  | Skill/Data                | Purpose                                              |
|-------------|-----------|---------------------------|------------------------------------------------------|
| Agent 11    | Upstream  | DT-02 (Roadmap)            | Initiative scope and budget for ROI evaluation        |
| Agent 10    | Upstream  | PERF-01 (KPIs)             | Operational baseline metrics for benefit calculation  |
| Agent 10    | Upstream  | PERF-02 (Improvements)     | Identified improvement opportunities as use cases     |
| Agent 11    | Downstream| DT-02 (Roadmap update)     | ROI results for initiative re-prioritization          |
| Agent 10    | Downstream| PERF-03 (Reports)          | ROI tracking data for performance reports             |

---

## 10. MCP Integrations

### mcp-excel
```yaml
purpose: "Financial modeling, cost/benefit calculations, TCO analysis"
operations:
  - action: "create"
    resource: "roi_model"
    template: "DT03_ROI_Model_v1"
  - action: "read"
    resource: "cost_data"
    path: "/AI-Investments/{use_case}/costs.xlsx"
  - action: "write"
    resource: "analysis_results"
    path: "/AI-Investments/{use_case}/roi_analysis.xlsx"
```

### mcp-powerbi
```yaml
purpose: "Benefits tracking dashboards, sensitivity visualizations"
operations:
  - action: "create"
    resource: "dashboard"
    template: "DT03_BenefitsTracker"
  - action: "create"
    resource: "report"
    template: "DT03_SensitivityAnalysis"
  - action: "refresh"
    resource: "dataset"
    schedule: "monthly"
```

### mcp-sharepoint
```yaml
purpose: "Report storage, benchmark database, use case documentation"
operations:
  - action: "read"
    resource: "benchmarks"
    path: "/AI-Investments/Benchmarks/{industry}/"
  - action: "write"
    resource: "investment_report"
    path: "/AI-Investments/{use_case}/Reports/"
```

---

## 11. Templates & References

### ROI Summary Template

```
| Metric                  | Conservative | Moderate | Optimistic |
|-------------------------|-------------|----------|------------|
| Total Investment (5yr)  | $X          | $X       | $X         |
| Total Benefits (5yr)    | $X          | $X       | $X         |
| NPV                     | $X          | $X       | $X         |
| IRR                     | X%          | X%       | X%         |
| Payback Period          | X months    | X months | X months   |
| Simple ROI              | X%          | X%       | X%         |
| Risk-Adjusted ROI       | X%          | X%       | X%         |
| Recommendation          | [Go/No-Go/Conditional]              |
```

### Industry ROI Benchmarks

| Use Case                       | Typical ROI Range | Typical Payback | Data Source          |
|--------------------------------|-------------------|-----------------|----------------------|
| Predictive Maintenance         | 200--500%         | 12--24 months   | McKinsey, 2023       |
| Quality Prediction             | 150--400%         | 9--18 months    | BCG, 2023            |
| Energy Optimization            | 100--300%         | 6--12 months    | WEF Lighthouse       |
| Supply Chain Optimization      | 100--250%         | 12--24 months   | Gartner, 2024        |
| Autonomous Operations          | 300--800%         | 24--48 months   | McKinsey, 2024       |
| Process Optimization (APC)     | 150--350%         | 6--15 months    | ARC Advisory, 2023   |

---

## 12. Examples

### Example 1: Pre-Investment Evaluation -- Predictive Maintenance

**Context**: Evaluating $850K investment in ML-based predictive maintenance for crusher fleet (8 units).

**Invocation**:
```
/measure-ai-roi --use-case "PdM-Crusher-Fleet" --phase pre-investment --comparison-period 60
```

**Key Results**:
- NPV (moderate): $2.15M over 5 years
- IRR: 48%
- Payback: 18 months
- Most sensitive variable: downtime reduction rate (breakeven at 35% of projected reduction)
- Recommendation: **Go** -- robust positive NPV even in conservative scenario

### Example 2: Post-Pilot Assessment -- Quality Prediction

**Context**: After 3-month pilot, assessing whether to scale quality prediction AI from 1 line to all 4 lines.

**Invocation**:
```
/measure-ai-roi --use-case "QualityAI-Line1" --phase post-pilot --comparison-period 36
```

**Key Results**:
- Pilot showed 28% defect reduction (projected was 35%)
- Revised NPV: $420K (down from projected $650K)
- Scaling investment: $320K for remaining 3 lines
- Risk: Model accuracy varies by product type
- Recommendation: **Conditional Go** -- scale to Lines 2--3 first, Line 4 after validation
