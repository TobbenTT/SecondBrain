# Airtable Report Generator

## Skill ID: D-006
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: High

## Purpose

Automatically generate structured reports from Airtable CRM data, producing formatted outputs for executive dashboards, pipeline reviews, project status updates, and client-facing summaries. This skill queries Airtable bases, aggregates and analyzes data, applies report templates, and delivers reports in multiple formats (Markdown, PPTX, PDF, HTML) on schedule or on demand.

## Intent & Specification

**Problem:** CRM data in Airtable contains valuable insights about OR opportunities, project pipelines, and client relationships, but extracting this data into meaningful reports requires manual querying, copying, formatting, and analysis. Reports are inconsistent, often outdated by the time they are presented, and lack the analytical depth that decision-makers need.

**Success Criteria:**
- Reports are generated automatically on schedule or on demand
- Data is always current (queried at generation time, not cached)
- Reports follow consistent templates with proper formatting
- Key metrics are calculated and highlighted (pipeline value, win rate, stage distribution)
- Trend analysis shows period-over-period changes
- Reports are delivered in the requested format(s)
- Report generation completes within 5 minutes for standard reports

**Constraints:**
- Must use Airtable API for data access (respect rate limits: 5 requests/second)
- Must handle large datasets efficiently (pagination for 1000+ records)
- Must protect confidential data (client names, contract values) based on report audience
- Must support both English and Spanish report generation
- Must produce valid output formats (Markdown, PPTX, PDF)
- Must handle missing or incomplete data gracefully

## Trigger / Invocation

**Scheduled Triggers:**
- Weekly pipeline report: Monday 07:00 local time
- Monthly executive summary: 1st of month, 08:00 local time
- Quarterly business review report: end of Q, 08:00 local time

**Manual Triggers:**
- `airtable-report-generator generate --report [type] --period [range]`
- `airtable-report-generator generate --report pipeline --format pptx`
- `airtable-report-generator generate --report custom --query [filter] --template [name]`
- `airtable-report-generator list-reports` (show available report types)
- `airtable-report-generator preview --report [type]` (generate preview without delivery)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Report Type | Command argument | Yes | Type of report to generate |
| Airtable Base ID | Configuration | Yes | Source Airtable base |
| Airtable API Key | Secrets Manager | Yes | Authentication |
| Period/Date Range | Command argument | No | Reporting period (default: current period) |
| Output Format | Command argument | No | md, pptx, pdf, html (default: md) |
| Audience | Command argument | No | executive, management, operational, client |
| Language | Command argument | No | en, es (default: en) |
| Delivery Target | Configuration | No | Email, Slack, file path, drive folder |
| Custom Filters | Command argument | No | Additional Airtable formula filters |

**Report Types Configuration:**
```yaml
report_types:
  pipeline:
    name: "Pipeline Report"
    description: "Current opportunity pipeline by stage, value, and probability"
    table: "Opportunities"
    views: ["Active Pipeline"]
    metrics:
      - total_pipeline_value
      - weighted_pipeline_value
      - opportunities_by_stage
      - average_deal_size
      - expected_close_date_distribution
    schedule: "weekly"
    default_format: "md"

  executive_summary:
    name: "Executive Summary"
    description: "High-level business performance with KPIs and trends"
    tables: ["Opportunities", "Projects", "Clients"]
    metrics:
      - revenue_ytd
      - win_rate
      - pipeline_growth
      - active_projects
      - client_satisfaction
    schedule: "monthly"
    default_format: "pptx"

  project_status:
    name: "Project Status Report"
    description: "Active project status, milestones, and risks"
    table: "Projects"
    views: ["Active Projects"]
    metrics:
      - project_health
      - milestone_completion
      - budget_variance
      - risk_count_by_severity
    schedule: "weekly"
    default_format: "md"

  client_portfolio:
    name: "Client Portfolio Report"
    description: "Client relationship overview and opportunity history"
    tables: ["Clients", "Opportunities", "Projects"]
    metrics:
      - revenue_by_client
      - opportunity_history
      - active_engagements
      - relationship_health
    schedule: "quarterly"
    default_format: "pptx"

  custom:
    name: "Custom Report"
    description: "User-defined query with custom template"
    table: "user-specified"
    metrics: "user-specified"
    schedule: "on-demand"
    default_format: "md"
```

## Output Specification

**Primary Outputs:**
1. **Formatted Report:** Document in requested format with data, analysis, and visualizations
2. **Report Metadata:** JSON record of report generation
3. **Data Snapshot:** Raw data used for the report (for audit/reproducibility)

**Report Metadata:**
```json
{
  "report_id": "rpt-20250415-pipeline-001",
  "report_type": "pipeline",
  "generated_at": "2025-04-15T07:00:00Z",
  "period": {
    "start": "2025-04-08",
    "end": "2025-04-15"
  },
  "data_source": {
    "base_id": "appXXXXXXX",
    "table": "Opportunities",
    "records_queried": 145,
    "records_included": 82
  },
  "output": {
    "format": "md",
    "file_path": "/reports/pipeline/2025-W16-pipeline.md",
    "file_size_kb": 45
  },
  "metrics_summary": {
    "total_pipeline_value": 12500000,
    "weighted_pipeline_value": 5250000,
    "opportunities_count": 82,
    "average_deal_size": 152439,
    "change_from_last_period": {
      "pipeline_value": "+8.5%",
      "opportunity_count": "+3"
    }
  },
  "delivery": {
    "targets": ["slack:#or-reports", "drive:/Reports/Pipeline/"],
    "status": "delivered"
  }
}
```

**Pipeline Report Template (Markdown):**
```markdown
# OR Pipeline Report
**Period:** {start_date} - {end_date}
**Generated:** {timestamp}

## Executive Summary
- Total Pipeline Value: **${total_pipeline_value}** ({change_value} vs last period)
- Weighted Pipeline: **${weighted_pipeline_value}**
- Active Opportunities: **{count}** ({change_count} vs last period)
- Average Deal Size: **${avg_deal_size}**

## Pipeline by Stage
| Stage | Count | Value | Weighted | Avg Days in Stage |
|-------|-------|-------|----------|-------------------|
| {stage_rows} |

## Top Opportunities
| Opportunity | Client | Value | Stage | Expected Close | Owner |
|-------------|--------|-------|-------|----------------|-------|
| {top_10_rows} |

## Movement This Period
### New Opportunities ({new_count})
{new_opportunities_list}

### Advanced Stage ({advanced_count})
{advanced_opportunities_list}

### Won ({won_count}, ${won_value})
{won_opportunities_list}

### Lost ({lost_count}, ${lost_value})
{lost_opportunities_list}

## Trends
- Pipeline Value (12 weeks): {trend_chart_or_sparkline}
- Win Rate (12 weeks): {win_rate_trend}
- Average Cycle Time: {avg_cycle_time} days

## Risks & Attention Items
{risks_and_flags}

---
Report ID: {report_id} | Data as of: {data_timestamp}
```

## Methodology & Standards

- **Data Currency:** Reports always query live Airtable data at generation time. No stale caches.
- **Calculation Consistency:** Metrics use standardized formulas documented in configuration. Same metric always calculated the same way.
- **Period Comparison:** All key metrics show period-over-period change (absolute and percentage).
- **Data Completeness:** Missing fields flagged in report footnotes. Reports generated even with incomplete data (with warnings).
- **Audience Sensitivity:** Client-facing reports exclude internal comments, cost details, and competitive information. Executive reports show summary metrics. Operational reports show full detail.
- **Pagination:** API queries handle pagination transparently for datasets exceeding Airtable's 100-record page size.
- **Error Handling:** API failures retry with exponential backoff. If data unavailable, report generated with available data and clear indication of missing sections.

## Step-by-Step Execution

### Step 1: Initialize Report Request
1. Parse report type, period, format, and audience
2. Load report type configuration (tables, views, metrics, template)
3. Validate API credentials and connectivity
4. Determine date range for the reporting period
5. Load previous period's data snapshot for comparison

### Step 2: Query Airtable Data
1. For each configured table/view:
   a. Build API query with date filters, sort, and field selection
   b. Execute paginated query (handle 100-record pages)
   c. Collect all matching records
   d. Handle rate limiting (max 5 req/sec, back off on 429)
2. Join related records across tables (e.g., opportunities with clients)
3. Save raw data snapshot for audit trail

### Step 3: Calculate Metrics
1. For each configured metric:
   a. Apply standardized formula to queried data
   b. Calculate current period value
   c. Calculate previous period value (from snapshot or query)
   d. Compute period-over-period change (absolute and %)
   e. Flag anomalies (>20% change, missing data)
2. Generate summary statistics (totals, averages, distributions)
3. Identify top/bottom items for highlight sections

### Step 4: Analyze Trends
1. Query historical data for trend analysis (12 periods back)
2. Calculate trend lines for key metrics
3. Identify significant trend changes (acceleration, reversal)
4. Generate trend data for visualization

### Step 5: Apply Report Template
1. Load template for the report type and format
2. Populate template with calculated metrics and data
3. Format numbers (currency, percentages, dates) per locale
4. Apply audience filtering:
   - Remove sensitive fields for external audiences
   - Summarize detail for executive audiences
   - Include full detail for operational audiences
5. Generate data tables and visualization placeholders

### Step 6: Format Output
1. For Markdown: render complete document, validate formatting
2. For PPTX: create presentation using style template (invoke `genspark-pptx-enhancer` if configured)
3. For PDF: render from Markdown via HTML intermediate
4. For HTML: apply responsive template with interactive charts
5. Validate output file integrity

### Step 7: Deliver Report
1. Save report to configured file path with naming convention
2. Deliver to configured targets:
   - Slack: post summary with file attachment
   - Email: send with formatted body and attachment
   - Drive: upload to designated folder
3. Log delivery status for each target

### Step 8: Post-Generation
1. Archive data snapshot with report ID
2. Log report metadata
3. Update report generation history
4. If scheduled: confirm next generation date
5. If anomalies detected: notify stakeholders

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Data Accuracy | Metrics match manual calculation | 100% |
| Report Completeness | All template sections populated | > 95% |
| Generation Speed | Time for standard report | < 5 minutes |
| Delivery Success | Reports delivered to all targets | > 99% |
| Schedule Adherence | Reports generated on time | 100% |
| Format Validity | Output files open correctly | 100% |
| Trend Accuracy | Historical data correctly compared | 100% |
| Data Currency | Time between query and delivery | < 10 minutes |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `sync-airtable-jira` | Upstream | Ensures Airtable data is current with Jira status |
| `genspark-pptx-enhancer` | Downstream | Enhances PPTX report output |
| `agent-or-pmo` | Consumer | PMO uses reports for governance and gate reviews |
| `agent-finance` | Consumer | Finance uses pipeline data for forecasting |
| `agent-communications` | Consumer | Communications uses reports for stakeholder updates |
| `generate-or-report` | Sibling | OR-specific reports may incorporate CRM data |
| `orchestrate-or-agents` | Upstream | May trigger report generation as part of workflows |

## Templates & References

**Report Naming Convention:**
```
{YYYY}-{period}-{report_type}.{format}

Examples:
  2025-W16-pipeline.md
  2025-04-executive-summary.pptx
  2025-Q1-client-portfolio.pdf
  2025-W16-project-status.md
```

**Metric Formulas:**
```yaml
metrics:
  total_pipeline_value:
    formula: "SUM(Value) WHERE Status NOT IN ('Won', 'Lost', 'Cancelled')"
    format: "currency_usd"

  weighted_pipeline_value:
    formula: "SUM(Value * Probability) WHERE Status NOT IN ('Won', 'Lost', 'Cancelled')"
    format: "currency_usd"

  win_rate:
    formula: "COUNT(Won) / (COUNT(Won) + COUNT(Lost)) * 100"
    format: "percentage"
    period: "rolling_12_months"

  average_deal_size:
    formula: "AVG(Value) WHERE Status NOT IN ('Cancelled')"
    format: "currency_usd"

  pipeline_growth:
    formula: "(current_pipeline - previous_pipeline) / previous_pipeline * 100"
    format: "percentage_change"

  average_cycle_time:
    formula: "AVG(Close Date - Create Date) WHERE Status = 'Won'"
    format: "days"
```

## Examples

**Example 1: Weekly Pipeline Report**
```
Command: airtable-report-generator generate --report pipeline --format md

Process:
  1. Query "Opportunities" table, "Active Pipeline" view -> 82 records
  2. Calculate metrics:
     - Total Pipeline: $12.5M (+8.5% vs last week)
     - Weighted: $5.25M (+12.1%)
     - Count: 82 (+3 new)
     - Avg Deal Size: $152K
  3. Stage distribution: Prospecting(25), Qualified(18), Proposal(22), Negotiation(12), Closing(5)
  4. Movement: 5 new, 8 advanced, 2 won ($340K), 0 lost
  5. Render Markdown template
  6. Save: /reports/pipeline/2025-W16-pipeline.md
  7. Deliver: Slack #or-reports, Google Drive

Output: Report generated and delivered. Total pipeline $12.5M, up 8.5%.
```

**Example 2: Monthly Executive Summary (PPTX)**
```
Command: airtable-report-generator generate --report executive_summary --format pptx --audience executive

Process:
  1. Query 3 tables: Opportunities, Projects, Clients
  2. Calculate 15 executive metrics
  3. Generate 12-month trend data
  4. Create PPTX with executive template:
     - Slide 1: Title + key metrics dashboard
     - Slide 2: Pipeline overview (chart)
     - Slide 3: Won/Lost analysis
     - Slide 4: Active projects status
     - Slide 5: Client portfolio summary
     - Slide 6: Trends and outlook
  5. Send to genspark-pptx-enhancer for polish
  6. Deliver to executive distribution list

Output: "2025-04-executive-summary.pptx" (6 slides, enhanced)
```

**Example 3: Custom Report with Filters**
```
Command: airtable-report-generator generate --report custom --query "Client='ClienteX' AND Status!='Cancelled'" --template client_history --format pdf

Process:
  1. Query Opportunities filtered by Client=ClienteX, excluding Cancelled -> 15 records
  2. Query Projects for ClienteX -> 3 projects
  3. Calculate client-specific metrics:
     - Total lifetime value: $4.2M
     - Active pipeline: $1.8M
     - Win rate with ClienteX: 72%
     - Average deal size: $280K
  4. Render client_history template
  5. Convert to PDF
  6. Save: /reports/custom/2025-04-ClienteX-client-history.pdf

Output: Custom ClienteX client history report generated. 15 opportunities, $4.2M lifetime value.
```
