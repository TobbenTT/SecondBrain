# Generate Performance Report

## Skill ID: S-03
## Version: 1.0.0
## Category: S. Performance Analytics
## Priority: P1 - High

---

## Purpose

Generate multi-level performance reports -- executive, management, and operational -- that distill complex operational data into audience-appropriate narratives with actionable insights. This skill automates the end-to-end report generation lifecycle: data acquisition, analysis, narrative generation, visualization, review, and distribution, transforming what traditionally consumes 3-5 days of analyst time per reporting cycle into a process that takes hours.

The business need is driven by a universal problem in asset-intensive organizations: data overload without information (Pain Point B-04). Modern operations generate terabytes of data from DCS, CMMS, ERP, quality systems, and safety databases. Yet decision-makers at every level consistently report that they lack the information they need to make timely, informed decisions. Deloitte's 2024 survey of industrial executives found that 72% of operational decisions are made with incomplete or stale data, and the average decision latency from "data available" to "decision made" is 2-4 weeks -- primarily because the data-to-insight-to-report pipeline is manual, slow, and resource-constrained.

The consequences of this reporting gap are significant:
- **Executive level**: Board-level decisions about capital allocation, operational strategy, and risk management are based on quarterly reports that are already 4-6 weeks stale when presented. Critical trends are invisible because the reporting granularity is too coarse.
- **Management level**: Functional managers receive department-specific data but lack cross-functional context. The maintenance manager sees maintenance KPIs but not their production impact. The operations manager sees production data but not the maintenance cost implications of production decisions.
- **Operational level**: Shift supervisors and frontline managers have access to real-time process data but lack contextualized analysis. They can see that availability is 89% but do not know if that is good or bad, improving or declining, or what specific actions would improve it.

This skill addresses these gaps by generating tailored reports for each audience level with consistent underlying data, appropriate level of detail, and actionable recommendations. Reports are generated automatically on schedule and on demand, with exception-based highlighting that draws attention to items requiring action rather than burying them in data tables.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | S-03                                                                                        |
| **Agent**              | Agent 10 -- Performance Analytics                                                            |
| **Domain**             | Performance Analytics                                                                        |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Report generation: 2-4 hours per cycle (automated); Setup: 3-5 days                         |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | B-04: Data overload -- 2-4 week decision latency due to manual reporting processes        |
| **Secondary Pain**     | B-03: Functional silos -- each department reports in isolation without cross-functional view  |
| **Value Created**      | 80% reduction in reporting effort, real-time decision support, consistent cross-functional narrative |

### Functional Intent

This skill SHALL:

1. **Consume KPI data** from calculate-operational-kpis (S-01) and improvement data from identify-improvement-opportunities (S-02).
2. **Generate three report tiers** with audience-appropriate content, detail level, and format:
   - **Executive Report** (2-4 pages): Strategic view, headline KPIs, exceptions, decisions needed
   - **Management Report** (8-15 pages): Functional detail, trend analysis, action tracking, resource implications
   - **Operational Report** (2-3 pages per area): Shift/daily operational detail, equipment status, near-term actions
3. **Apply exception-based reporting**: Highlight items requiring attention rather than presenting all data equally.
4. **Generate narrative analysis**: Provide explanatory text that contextualizes numbers (not just tables and charts).
5. **Automate distribution**: Send reports to correct recipients on schedule via mcp-outlook.
6. **Support multiple formats**: Power BI dashboards (interactive), .docx (narrative reports), .xlsx (data-rich), .pptx (presentation-ready).
7. **Maintain report archives**: Store all generated reports in mcp-sharepoint for historical reference.
8. **Support ad-hoc report generation**: Respond to specific queries with targeted report sections.

---

## Trigger / Invocation

### Direct Invocation

```
/generate-performance-report --project [name] --level [executive|management|operational|all] --period [weekly|monthly|quarterly|ytd|custom] --format [docx|pptx|xlsx|dashboard]
```

### Command Variants
- `/generate-performance-report executive --project [name] --period monthly` -- Monthly executive summary
- `/generate-performance-report management --project [name] --domain [production|maintenance|reliability|all]`
- `/generate-performance-report operational --project [name] --area [area_code]`
- `/generate-performance-report custom --project [name] --kpis [kpi_list] --period [range]`
- `/generate-performance-report flash --project [name]` -- Quick status flash report (1-page)

### Aliases
- `/performance-report`, `/ops-report`, `/monthly-report`, `/executive-report`

### Automatic Triggers
- **Daily 07:00**: Generate operational daily flash report
- **Weekly Monday 08:00**: Generate weekly management report
- **Monthly 3rd business day**: Generate monthly executive and management reports
- **Quarterly 5th business day**: Generate quarterly comprehensive report
- **KPI RED alert**: Generate exception flash report for affected area
- **Gate review T-14 days**: Generate performance section for gate review package

### Event-Driven Triggers
- Board meeting approaching (executive report preparation)
- Management review meeting scheduled
- Improvement initiative milestone reached (impact report)
- Significant operational event (incident, record production, major failure)
- External stakeholder request (regulator, investor, partner)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `kpi_data` | JSON / .xlsx | calculate-operational-kpis (S-01) | All calculated KPIs with actuals, targets, trends, and benchmarks |
| `report_level` | enum | User / Automatic trigger | executive, management, operational, or all |
| `report_period` | date range | User / Automatic trigger | Reporting period (week, month, quarter, custom range) |
| `distribution_list` | .xlsx / config | mcp-sharepoint / Project config | Report recipients by level with email addresses |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `improvement_data` | .xlsx / JSON | identify-improvement-opportunities (S-02) | Improvement portfolio status and value capture |
| `incident_data` | .xlsx | HSE system | Safety incidents and near-misses for safety section |
| `project_status` | .xlsx / JSON | track-or-deliverables (H-02) | OR program progress for context |
| `management_commentary` | text | Functional managers | Human-authored commentary to include in reports |
| `previous_reports` | .docx | mcp-sharepoint | Prior reports for consistency and comparison |
| `report_template` | .docx / .pptx | mcp-sharepoint | Client-specific or VSC-branded template |
| `language` | enum | User / Config | Report language: "es" (Spanish), "en" (English), "pt" (Portuguese) |
| `custom_sections` | config | User | Additional sections or custom analysis to include |

### Input Validation Rules

```yaml
validation:
  kpi_data:
    required: true
    min_kpis: 10
    checks:
      - "KPI data covers the full reporting period"
      - "Both actual and target values present for comparison"
      - "Trend data available for at least 3 prior periods"
  distribution_list:
    required: true
    checks:
      - "At least 1 recipient per report level"
      - "Valid email addresses for all recipients"
  report_period:
    checks:
      - "End date <= today (no future reporting)"
      - "Start date <= end date"
      - "Period aligns with data availability"
```

---

## Output Specification

### Deliverable 1: Executive Performance Report (.docx or .pptx)

**Filename**: `{ProjectCode}_Executive_Report_{Period}_v{Version}_{YYYYMMDD}.docx`

**Structure (2-4 pages)**:

1. **Performance Headline** (1/2 page)
   - Overall operational health indicator (GREEN/AMBER/RED)
   - One-sentence performance summary
   - 3-5 headline KPIs with trend arrows and RAG indicators
   - Key achievement or concern for the period

2. **KPI Scorecard** (1 page)
   - Production: OEE, throughput, plan attainment, recovery
   - Maintenance: cost % RAV, availability, PM compliance
   - Reliability: MTBF trend, repeat failures
   - Safety: TRIR, days without incident
   - Cost: cost per ton, budget variance
   - Each KPI with: actual, target, variance, trend, RAG

3. **Exceptions & Decisions Required** (1/2 page)
   - RED items requiring executive attention
   - Decisions needed with recommended options
   - Risks to upcoming period performance

4. **Improvement Portfolio Summary** (1/2 page)
   - Value capture progress vs. plan
   - New opportunities identified
   - Key improvement milestones reached

5. **Outlook** (1/2 page)
   - Forecast for next period based on trends
   - Planned activities that may affect performance (shutdowns, capital projects)
   - Key risks and mitigations

### Deliverable 2: Management Performance Report (.docx)

**Filename**: `{ProjectCode}_Management_Report_{Period}_v{Version}_{YYYYMMDD}.docx`

**Structure (8-15 pages)**:

1. **Executive Summary** (1 page)
   - Period performance summary across all domains
   - Top 3 achievements and top 3 concerns
   - Actions from previous report: status update

2. **Production Performance** (2-3 pages)
   - OEE waterfall analysis (availability x performance x quality)
   - Throughput trend with daily/weekly detail
   - Production plan attainment by product/area
   - Downtime analysis: top causes, trends, actions
   - Recovery/yield trend and quality performance
   - Energy and water intensity

3. **Maintenance Performance** (2-3 pages)
   - Maintenance cost analysis: actual vs. budget, breakdown by type
   - PM compliance trend and analysis of non-compliance causes
   - Planned vs. reactive work balance (trend, root cause of reactive)
   - Work management metrics: schedule compliance, backlog, wrench time
   - Contractor performance and cost analysis
   - Top 10 bad actors with actions

4. **Reliability Performance** (1-2 pages)
   - MTBF/MTTR trends by system
   - Repeat failure analysis and defect elimination progress
   - Predictive maintenance findings and saves
   - Condition monitoring summary

5. **Cost Performance** (1-2 pages)
   - Operating cost per unit trend
   - Budget variance analysis by category
   - MRO inventory performance (turns, stockouts, value)
   - Capital expenditure tracking

6. **Safety Performance** (1 page)
   - Safety KPIs: TRIR, LTIR, near-miss reporting rate
   - Incident summary (if any) with actions
   - Safety observation trends
   - Process safety indicators

7. **Improvement Program** (1-2 pages)
   - Active improvement projects: status, milestones, timeline
   - Value capture: planned vs. actual
   - New opportunities identified
   - Portfolio pipeline health

8. **Action Register** (1 page)
   - Actions from this report (new)
   - Actions from previous report (status update)
   - Overdue actions highlighted

### Deliverable 3: Operational Performance Report (.docx or dashboard)

**Filename**: `{ProjectCode}_Operational_Report_{Area}_{Period}_v{Version}_{YYYYMMDD}.docx`

**Structure (2-3 pages per area)**:

1. **Area Performance Summary**
   - Area-specific KPIs vs. targets
   - Equipment status (running/stopped/maintenance)
   - Current shift performance vs. daily target

2. **Equipment Performance Detail**
   - Availability by equipment with top downtime causes
   - Maintenance activities completed and planned
   - Condition monitoring alerts

3. **Near-Term Actions**
   - Maintenance work scheduled this week
   - Process changes or adjustments planned
   - Safety activities scheduled
   - Items requiring shift attention

### Deliverable 4: Flash Report (1-page, on-demand)

**Filename**: `{ProjectCode}_Flash_Report_{YYYYMMDD}.docx`

Quick status update containing:
- Overall status RAG indicator
- 5 headline KPIs with actuals and trends
- Top exception item requiring attention
- One-paragraph narrative summary

### Report Format Standards

```yaml
formatting:
  executive_report:
    format: ".docx or .pptx (depending on audience preference)"
    max_pages: 4
    charts: "2-3 maximum (OEE gauge, KPI scorecard, trend)"
    language: "Non-technical, business-oriented"
    numbers: "Rounded to 1 decimal place, with context"
    rag_coding: "GREEN (#27AE60), AMBER (#F39C12), RED (#E74C3C)"
    trend_arrows: "UP (green, improving), FLAT (amber, stable), DOWN (red, declining)"
  management_report:
    format: ".docx"
    max_pages: 15
    charts: "8-12 (trend charts, Pareto, waterfall, tables)"
    language: "Technical but accessible, with explanatory narrative"
    numbers: "2 decimal places with units and comparison"
    detail: "KPI decomposition, root cause analysis, action tracking"
  operational_report:
    format: ".docx or Power BI dashboard"
    max_pages: 3
    charts: "Equipment-specific, shift-level granularity"
    language: "Operational, direct, action-oriented"
    update_frequency: "Daily or per shift"
  all_reports:
    branding: "VSC branded header/footer or client template"
    watermark: "CONFIDENTIAL on all pages"
    footer: "Generated by VSC OR System | Date | Page X of Y"
    distribution: "PDF via mcp-outlook + original file via mcp-sharepoint"
```

---

## Methodology & Standards

### Exception-Based Reporting Methodology

The core principle is that reports should highlight exceptions -- items that deviate from expected performance -- rather than presenting all data with equal emphasis. This approach respects the reader's time and directs attention to where action is needed.

```
Exception Hierarchy:
1. RED items (critical): Featured prominently at the top of the report
   - KPIs >20% below target or in bottom quartile
   - Safety incidents or near-misses
   - Equipment failures with production impact >$100K
   - Budget overruns >15%

2. AMBER items (watch): Highlighted in body of report
   - KPIs 5-20% below target or declining trend
   - Approaching threshold conditions
   - Actions overdue by <7 days

3. GREEN items (on track): Summarized in scorecard only
   - KPIs at or above target with stable/improving trend
   - No action required

4. BLUE items (achievement): Called out for recognition
   - KPIs significantly above target (>10%)
   - Records broken
   - Improvement milestones achieved
```

### Narrative Generation Methodology

Reports include human-readable narrative that contextualizes data:

```
Data Point: OEE = 78.5% (target 82.0%, previous month 76.2%)

Narrative:
"Overall Equipment Effectiveness improved to 78.5% in January, up from 76.2%
in December, driven primarily by a 2.1% improvement in availability following
the completion of the SAG mill bearing repair. However, OEE remains 3.5
percentage points below the 82.0% target. The primary gap is in the quality
component (90.5% vs. 92.0% target) due to flotation recovery variability.
The improvement trend is positive -- at the current rate of improvement, OEE
is projected to reach target by Q3 2026. The flotation recovery improvement
project (OPP-003) is expected to accelerate this trajectory."
```

Narrative principles:
1. **State the fact**: What is the KPI value?
2. **Provide comparison**: vs. target, vs. previous period, vs. benchmark
3. **Explain the why**: What drove the result?
4. **Assess the trend**: Is it improving or declining?
5. **Link to action**: What is being done or needs to be done?

### Multi-Level Report Alignment

All three report levels use the same underlying data but present it differently:

| Aspect | Executive | Management | Operational |
|--------|-----------|-----------|-------------|
| Time horizon | Month/Quarter/Year | Week/Month | Shift/Day |
| KPI detail | Top 10 headline KPIs | 30-50 KPIs by domain | Equipment-specific KPIs |
| Analysis depth | Summary with exceptions | Root cause analysis | Immediate action items |
| Narrative tone | Strategic, business impact | Technical, improvement-focused | Tactical, action-oriented |
| Charts | Gauges, scorecards | Trend charts, Paretos | Equipment dashboards |
| Action items | Decisions needed | Improvement actions | Shift tasks |
| Format | 2-4 pages or slides | 8-15 pages | 2-3 pages or dashboard |
| Distribution | Board, VP, GM | Managers, Superintendents | Supervisors, Engineers |

### Standards Applied
- **SMRP Best Practice** -- KPI definitions for maintenance reporting
- **ISO 22400** -- Manufacturing operations management KPIs
- **AACE International** -- Cost reporting standards
- **GRI Standards** -- Sustainability reporting framework (for ESG sections)
- **ISO 55000** -- Asset management information requirements
- **COBIT** -- Information governance for report quality assurance

### Industry Statistics on Reporting

| Statistic | Source | Year |
|-----------|--------|------|
| 72% of operational decisions made with incomplete data | Deloitte | 2024 |
| Average decision latency: 2-4 weeks | McKinsey Operations Practice | 2023 |
| 3-5 analyst-days per monthly management report (manual) | APQC benchmark | 2023 |
| 65% of industrial reports are never fully read | Information Management Group | 2022 |
| Exception-based reports increase action rate by 40% | MIT Sloan | 2023 |
| Automated reporting reduces preparation effort by 75-85% | Gartner | 2024 |
| Real-time dashboards reduce decision latency by 60% | McKinsey Digital | 2024 |

---

## Step-by-Step Execution

### Phase 1: Report Planning and Data Acquisition (Steps 1-4)

**Step 1: Determine Report Scope and Audience**
- Identify trigger: scheduled cycle or ad-hoc request
- Determine report level(s): executive, management, operational, or all
- Determine reporting period: week, month, quarter, YTD, or custom range
- Identify recipients from distribution list
- Load appropriate report template (VSC standard or client-specific)
- Identify any special requirements (focus areas, additional sections, language)

**Step 2: Acquire Performance Data**
- Retrieve KPI dataset from calculate-operational-kpis (S-01):
  - All KPIs for the reporting period with actuals, targets, variances, trends
  - Comparison data: previous period, same period last year, YTD
  - Alert history for the period (RED/AMBER alerts generated)
- Retrieve improvement data from identify-improvement-opportunities (S-02):
  - Active improvement portfolio status
  - Value capture for the period
  - New opportunities identified
- Retrieve additional context data:
  - Safety data from HSE system (incidents, near-misses, TRIR)
  - OR program status from track-or-deliverables (H-02) if applicable
  - Management commentary submissions (if any functional managers provided input)
- Validate data completeness for the reporting period

**Step 3: Analyze Performance Patterns**
- For each KPI domain, perform analytical assessment:
  - Calculate period-over-period change (absolute and %)
  - Determine trend direction and strength (statistical regression)
  - Identify exceptions: KPIs that breached thresholds during the period
  - Identify achievements: KPIs that exceeded targets or set new records
  - Identify root causes for significant deviations (from S-01 and S-02 data)
- Cross-domain analysis:
  - Identify correlations (e.g., PM compliance decline -> reactive increase -> availability decline)
  - Identify trade-offs (e.g., throughput pushed higher -> quality declined)
  - Identify systemic patterns (e.g., multiple KPIs declining in same area -> systemic issue)
- Prepare analytical findings for narrative generation

**Step 4: Identify Actions and Decisions Required**
- Review previous report action register:
  - Which actions have been completed?
  - Which are in progress (update status)?
  - Which are overdue (escalation required)?
- Identify new actions from current period analysis:
  - RED exceptions requiring specific corrective actions
  - Decisions needed from management (resource allocation, investment approval, priority changes)
  - Follow-up items requiring investigation
- Prioritize actions by urgency and impact

### Phase 2: Report Generation (Steps 5-10)

**Step 5: Generate Executive Report Content**
- Create performance headline:
  - Overall status (GREEN/AMBER/RED) with one-sentence summary
  - Period achievement highlight and primary concern
- Populate KPI scorecard:
  - Top 10 KPIs: actual, target, variance, trend arrow, RAG
  - Conditional formatting for visual emphasis
- Write exception narrative:
  - For each RED item: state fact, explain cause, describe action, estimate recovery timeline
  - For AMBER items: brief description and monitoring plan
- Write improvement summary:
  - Value captured this period
  - Key milestones achieved
  - Portfolio health
- Write outlook section:
  - Next period forecast based on trends and planned activities
  - Key risks and mitigations
  - Upcoming decisions or events

**Step 6: Generate Management Report Content**
- Write executive summary (1 page):
  - Period summary across all domains
  - Top 3 achievements and top 3 concerns
  - Previous action status update
- Generate production performance section:
  - OEE waterfall chart and analysis
  - Throughput trend chart (daily points, weekly average, target line)
  - Production plan attainment analysis
  - Downtime Pareto and trend analysis
  - Quality/recovery performance
  - Narrative explaining drivers and actions
- Generate maintenance performance section:
  - Cost trend chart (actual vs. budget, breakdown by type)
  - PM compliance trend and non-compliance analysis
  - Work type distribution (planned vs. reactive) with trend
  - Schedule compliance and backlog analysis
  - Top 10 bad actors table with actions
  - Narrative explaining cost drivers and improvement actions
- Generate reliability performance section:
  - MTBF/MTTR trend charts by system
  - Repeat failure analysis and defect elimination progress
  - PdM findings and saves summary
  - Narrative on reliability improvement trajectory
- Generate cost performance section:
  - Cost per unit trend
  - Budget variance waterfall
  - Inventory performance summary
- Generate safety section:
  - Safety KPIs with trend
  - Incident summary (if any)
  - Proactive safety metrics (observations, near-misses)
- Generate improvement section:
  - Active projects status table
  - Value capture chart (planned vs. actual, cumulative)
  - Pipeline summary
- Compile action register:
  - Previous actions with status updates
  - New actions from current analysis
  - Overdue actions highlighted

**Step 7: Generate Operational Report Content**
- For each operational area:
  - Area KPI summary (availability, throughput, quality by equipment)
  - Equipment status dashboard (running/down/maintenance)
  - Key downtime events for the period with causes
  - Maintenance completed and planned (upcoming week)
  - Condition monitoring highlights (alerts, trends, actions)
  - Shift-specific notes and handover information
  - Near-term action items

**Step 8: Generate Flash Report (if triggered)**
- Create 1-page status update:
  - Overall RAG indicator
  - 5 headline KPIs with actuals and sparklines
  - Top exception requiring attention
  - One-paragraph narrative
- Designed for rapid consumption (2-minute read)

**Step 9: Generate Visualizations and Charts**
- Create all required charts via mcp-powerbi or embedded in documents:
  - OEE gauge with trend inset
  - KPI scorecard with RAG coding
  - Throughput trend (line chart with target)
  - Downtime Pareto (horizontal bar)
  - OEE loss waterfall (cascade chart)
  - Cost trend (stacked bar or area chart)
  - PM compliance trend (line chart)
  - MTBF/MTTR trend (dual-axis line)
  - Bad actor table (formatted with conditional highlighting)
  - Value capture chart (planned vs. actual, cumulative area)
  - Improvement Impact-Effort scatter
- Apply consistent formatting: VSC brand colors, axis labels, data labels, legends
- Ensure all charts have clear titles and interpretive captions

**Step 10: Assemble and Format Reports**
- Assemble content into report templates:
  - Executive report: 2-4 pages, clean layout, minimal text, maximum visual impact
  - Management report: 8-15 pages, structured sections, narrative + charts, action register
  - Operational report: 2-3 pages per area, equipment-focused, action-oriented
- Apply formatting standards:
  - Headers, footers, page numbers
  - VSC or client branding
  - Confidentiality marking
  - Report metadata (author, date, version, period)
- Quality check:
  - Numbers in narrative match numbers in charts and tables
  - All trend arrows correct direction
  - RAG coding consistent between scorecard and narrative
  - No placeholder text remaining
  - Spell check (Spanish and English)
  - Cross-references valid

### Phase 3: Review, Distribution, and Archival (Steps 11-14)

**Step 11: Quality Review**
- Apply validate-output-quality (F-05) quality framework:
  - Data accuracy: all KPI values verified against S-01 calculation
  - Narrative quality: explanations are factual, balanced, and actionable
  - Visual quality: charts readable, properly formatted, accessible
  - Completeness: all required sections present
  - Consistency: cross-report numbers align (executive scorecard matches management detail)
- Flag any issues for resolution before distribution

**Step 12: Distribute Reports**
- Via mcp-outlook:
  - Executive report -> Board members, VP Operations, GM (PDF + original)
  - Management report -> Functional managers, superintendents (PDF + original)
  - Operational report -> Area supervisors, shift leads, engineers (PDF or dashboard link)
  - Flash report -> All operational management (PDF, mobile-friendly)
- Email body includes:
  - One-paragraph period summary
  - 3-5 bullet points highlighting key items
  - Link to Power BI dashboard for interactive exploration
  - Instructions for accessing full data in mcp-sharepoint
- Via mcp-sharepoint:
  - Store all report documents in project reporting library
  - Maintain folder structure: `/Reports/{Year}/{Month}/`
  - Set metadata: report type, period, version, author
  - Apply appropriate access permissions

**Step 13: Update Power BI Dashboards**
- Refresh all dashboard datasets via mcp-powerbi
- Verify dashboard visuals display correctly
- Publish updated dashboards for self-service access
- Verify mobile view renders properly

**Step 14: Archive and Track**
- Store all generated reports in mcp-sharepoint reporting archive
- Update report tracking register (report ID, date, period, distribution, version)
- Log action register items for tracking in next cycle
- Record distribution confirmation (email delivery status)
- Update report metrics: total reports generated, distribution count, feedback received

### Phase 4: Continuous Improvement of Reporting (Steps 15-16)

**Step 15: Collect Feedback**
- Quarterly feedback survey to report recipients:
  - "Does this report provide the information you need?" (1-5)
  - "Is the report at the right level of detail?" (1-5)
  - "Do you take action based on this report?" (Y/N, what action?)
  - "What additional information would be useful?"
  - "What sections do you not read?"
- Analyze feedback patterns:
  - Sections never read -> candidate for removal or restructuring
  - Frequent requests for additional data -> candidate for new section
  - Low action rate -> reporting not driving behavior (investigate why)

**Step 16: Iterate Report Design**
- Based on feedback and usage data:
  - Add or remove report sections
  - Adjust detail level per audience feedback
  - Improve narrative quality based on common questions
  - Add new KPIs requested by stakeholders
  - Remove KPIs that do not drive action
  - Optimize distribution list (add/remove recipients)
  - Adjust formatting for readability improvement
- Document all report design changes with rationale and effective date

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Data Accuracy | KPI values in report match S-01 calculated values | 100% | 100% |
| Report Completeness | All required sections present per report type | 100% | >95% |
| Narrative Quality | Narratives provide context, cause, and action (peer review) | >4.0/5.0 | >3.5/5.0 |
| Timeliness | Report delivered within defined schedule | 100% | >90% |
| Distribution Accuracy | Correct report to correct recipients | 100% | 100% |
| Cross-Report Consistency | Same data produces same numbers across report levels | 100% | 100% |
| Action Register Currency | Previous actions updated with current status | 100% | >95% |
| Formatting Compliance | Branding, layout, and formatting meet standards | 100% | >95% |
| Reader Satisfaction | Recipient survey: "report meets my needs" | >4.0/5.0 | >3.5/5.0 |
| Action Rate | % of report recipients who take action based on report | >60% | >40% |
| Report Preparation Time | Hours from data availability to report distribution | <4 hours | <8 hours |
| Archive Completeness | All generated reports stored in mcp-sharepoint | 100% | 100% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `calculate-operational-kpis` (S-01) | All KPI data with trends, targets, and benchmarks | Critical |
| `identify-improvement-opportunities` (S-02) | Improvement portfolio status and value capture data | High |
| `track-or-deliverables` (H-02) | OR program progress for context section | Medium |
| `analyze-failure-patterns` (MAINT-03) | Bad actor data for maintenance section | Medium |
| `benchmark-maintenance-kpis` (MAINT-04) | Benchmark comparison for management report | Medium |
| HSE system | Safety incidents and KPIs | Medium |
| Functional managers | Management commentary and context | Optional |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `agent-or-pmo` | Performance reports for OR governance and gate reviews | Monthly/Quarterly |
| `generate-or-gate-review` (H-03) | Performance section for gate review package | Gate approaching |
| `generate-or-report` | Performance data for multi-level OR reporting | On request |
| `accelerate-decision-cycle` (INTG-03) | Exception data and decision briefs from report analysis | On alert |
| `generate-lessons-learned` (Q-03) | Performance trends as input for lessons learned analysis | Quarterly |

---

## MCP Integrations

### mcp-powerbi
```yaml
name: "mcp-powerbi"
server: "@vsc/powerbi-mcp"
purpose: "Interactive dashboard generation and data visualization"
capabilities:
  - Create and update Power BI reports and dashboards
  - Generate chart images for embedding in .docx/.pptx reports
  - Publish interactive dashboards for stakeholder self-service
  - Support drill-down from executive to operational detail
  - Mobile-optimized dashboard views
authentication: Service Principal
usage_in_skill:
  - Step 2: Retrieve KPI data from existing dashboards
  - Step 9: Generate charts and visualizations
  - Step 13: Publish updated dashboards
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Automated report distribution to stakeholders"
capabilities:
  - Send reports with PDF and original file attachments
  - Format email body with period summary highlights
  - Include dashboard links
  - Send to distribution lists by report level
  - Track delivery status
  - Schedule recurring distribution
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 12: Distribute reports to all recipients by level
  - Step 15: Send feedback survey to recipients
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Report storage, archival, and template management"
capabilities:
  - Store generated reports in structured library
  - Manage report templates (VSC and client-specific)
  - Maintain report archive with metadata and version control
  - Manage distribution lists as SharePoint lists
  - Provide report history for trend comparison
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve report templates and distribution lists
  - Step 2: Retrieve previous reports for comparison
  - Step 12: Store reports in archive library
  - Step 14: Update report tracking register
```

---

## Templates & References

### Executive Report Template Structure

```markdown
# {Project Name} -- Executive Performance Report
## Period: {Month Year}
## Status: {GREEN/AMBER/RED}

---

### Performance Headline
{One-sentence summary of period performance}

### KPI Scorecard
| KPI | Actual | Target | Var | Trend | RAG |
|-----|--------|--------|-----|-------|-----|
| OEE | {X}% | {Y}% | {Z}% | {dir} | {color} |
| Throughput | {X} tpd | {Y} tpd | {Z}% | {dir} | {color} |
| Availability | {X}% | {Y}% | {Z}% | {dir} | {color} |
| Maint Cost %RAV | {X}% | {Y}% | {Z}% | {dir} | {color} |
| PM Compliance | {X}% | {Y}% | {Z}% | {dir} | {color} |
| Safety (TRIR) | {X} | {Y} | {Z}% | {dir} | {color} |
| Cost/Ton | ${X} | ${Y} | {Z}% | {dir} | {color} |

### Items Requiring Executive Attention
1. **{RED Item}**: {Description} -- **Decision Required**: {What is needed}
2. **{RED Item}**: {Description} -- **Action Underway**: {Status}

### Improvement Value Capture
- YTD value captured: ${X.X}M of ${Y.Y}M target ({Z}%)
- Key milestone: {Achievement}

### Outlook
{2-3 sentences on next period expectations, risks, and planned activities}

---
*Generated by VSC OR System | {Date} | Confidential*
```

### Reference Documents
- SMRP Best Practice -- Reporting KPIs and benchmarks
- ISO 22400 -- Manufacturing operations management reporting
- AACE International -- Cost and performance reporting standards
- GRI Standards -- Sustainability and ESG reporting framework
- COBIT -- Information quality management for reporting
- Tufte, E. "The Visual Display of Quantitative Information" -- Chart design principles
- Few, S. "Information Dashboard Design" -- Dashboard best practices

---

## Examples

### Example 1: Monthly Executive Report Generation

```
Trigger: Monthly cycle (February 3, 2026 -- January report)

Process:
  1. Data Acquired:
     - S-01 KPIs: 52 KPIs calculated for January 2026
     - S-02 Improvements: 42 active opportunities, $420K captured in January
     - Safety: TRIR 0.85, 1 first aid incident, 12 near-miss reports
     - OR Status: 45.4% complete (H-02)

  2. Analysis:
     - Overall status: AMBER (improving)
     - 8 GREEN KPIs, 5 AMBER KPIs, 2 RED KPIs
     - RED: Reactive maintenance 28% (target 15%), Cost/ton $2.85 (target $2.40)
     - Achievement: OEE improved +2.3% month-over-month
     - Concern: Maintenance cost trajectory exceeding budget by 18%

  3. Executive Report Generated (3 pages):
     - Headline: "AMBER - OEE improving to 78.5% (+2.3%); maintenance cost
       overrun requires action"
     - KPI scorecard: 7 headline KPIs with trend and RAG
     - Exception: Reactive maintenance at 28% driving cost overrun;
       root cause: inadequate planning process; action: planning improvement
       program approved (OPP-002), startup February 15
     - Decision required: Approve $350K for flotation recovery project (OPP-003)
     - Improvement: $420K captured in January; YTD $420K of $3.2M target
     - Outlook: Positive trend expected to continue; planned SAG mill
       shutdown in March will impact February/March throughput

  4. Distribution:
     - Sent to 8 executive recipients via mcp-outlook
     - Stored in SharePoint: /Reports/2026/January/Executive/
     - Dashboard updated: https://app.powerbi.com/sv-executive

Output:
  "Executive Performance Report for January 2026 generated and distributed.
   3 pages, AMBER status (improving). 2 RED items flagged.
   Decision required: flotation recovery project approval ($350K).
   Distributed to 8 recipients. Dashboard updated."
```

### Example 2: Operational Flash Report

```
Trigger: KPI RED alert -- SAG Mill availability dropped below 80%

Flash Report Generated:

================================================================
FLASH REPORT -- Sierra Verde Concentrator
Date: February 15, 2026 14:30
Status: RED -- SAG Mill Availability Critical
================================================================

KEY METRICS (Last 24 hours):
  OEE:            62.3%  (target 82%)  RED  [DOWN from 78.5%]
  Throughput:     28,400 tpd (target 48,000)  RED
  SAG Availability: 72.5%  (target 93%)  RED
  Other Equipment: 95.2% (on target)  GREEN

SITUATION:
SAG Mill #2 tripped at 08:15 on main bearing high-temperature
alarm. Investigation revealed bearing lubrication system pump
failure. Maintenance mobilized at 08:30. Estimated repair
time: 12-16 hours. Expected restart: February 16 00:00-04:00.

PRODUCTION IMPACT:
  Estimated lost production: 19,600 tons (12h x 1,633 tph)
  Revenue impact: $980K at current commodity price
  Monthly OEE impact: -1.5% if mill returns by midnight

ACTION:
  1. Bearing lube pump replacement in progress (parts available)
  2. Condition monitoring team inspecting bearing for secondary damage
  3. Operations maximizing Ball Mill throughput to partially compensate
  4. Next update at 18:00 or on material change in status

================================================================
```
