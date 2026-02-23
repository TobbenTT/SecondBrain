# Create KPI Dashboard
## Skill ID: create-kpi-dashboard
## Version: 1.0.0
## Category: A - Document Generation
## Priority: High

## Purpose
Defines comprehensive Key Performance Indicator (KPI) frameworks for industrial operations and maintenance, including operational KPIs (OEE, availability, throughput, quality), maintenance KPIs (MTBF, MTTR, PM compliance, backlog), project KPIs (SPI, CPI), and safety KPIs (TRIFR, LTIFR). This skill designs the complete performance measurement system and dashboard layout for monitoring facility performance from Day 1 of operations.

KPIs are the language of performance management. Without a well-defined KPI framework, management cannot objectively assess operational health, identify improvement opportunities, or make data-driven decisions. The KPI dashboard is the daily management tool that connects strategic objectives to operational reality, enabling proactive management rather than reactive firefighting.

## Intent & Specification
The AI agent MUST understand that:

1. **KPIs Must Be Aligned to Business Objectives**: Every KPI must trace back to a strategic objective (safety, production, cost, reliability, environmental). Measuring things that do not drive decisions is wasteful.
2. **Leading vs. Lagging Balance**: The framework must include both leading indicators (predictive, actionable) and lagging indicators (outcome-based, confirmatory). Over-reliance on lagging indicators means problems are detected too late.
3. **Data Availability is a Constraint**: Every KPI must have a viable data source. Defining KPIs for which data cannot be collected is futile. The design must consider what data will be available from DCS, CMMS, SCADA, ERP, and manual sources.
4. **Hierarchy of KPIs**: KPIs cascade from strategic (monthly board review) to tactical (weekly management) to operational (daily/shift-level). Different audiences need different views.
5. **Benchmarking Gives Context**: KPIs without benchmarks are meaningless numbers. Every KPI must include industry benchmark ranges and target-setting methodology.
6. **Dashboard Design Matters**: The visual design of dashboards directly affects their utility. Information overload kills effectiveness. Each dashboard view should have 5-8 KPIs maximum.
7. **Language**: Spanish (Latin American), with KPI abbreviations in their standard English form (OEE, MTBF, MTTR, TRIFR, etc.).

## VSC Failure Modes Table Reference

KPIs that reference failure categories (e.g., MTBF by failure mechanism, top failure causes, failure mode Pareto analysis) MUST use the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) taxonomy. Failure categorization in dashboards should align with the 18 standard mechanisms and 46 standard causes for consistent cross-project benchmarking.

## Trigger / Invocation
```
/create-kpi-dashboard
```

### Natural Language Triggers
- "Define KPIs for [facility/plant]"
- "Create a KPI dashboard for operations and maintenance"
- "Design performance metrics for [project/plant]"
- "Build a KPI framework for [industry] operations"
- "Definir KPIs operacionales y de mantenimiento"
- "Crear dashboard de indicadores de gestion"
- "Disenar marco de indicadores de desempeno"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `operational_objectives` | Strategic and operational objectives for the facility | .docx / Text | Client / Operations Strategy |
| `industry_sector` | Mining, Energy, Oil & Gas, Water, etc. | Text | User |
| `facility_description` | Plant capacity, configuration, processes | .docx / Text | Engineering |
| `organizational_structure` | Who reviews which KPIs (management levels) | .pptx / .xlsx | create-org-design |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `industry_benchmarks` | Sector-specific KPI benchmarks (Solomon, CRU, etc.) | VSC internal benchmarks |
| `maintenance_strategy` | Maintenance KPI targets from RCM analysis | Industry averages |
| `staffing_plan` | Workforce KPI requirements | Derive from org design |
| `contract_scopes` | Contractor KPIs for service contracts | From contract specifications |
| `data_sources` | Available data systems (DCS, CMMS, SCADA, ERP, LMS) | Assume standard systems |
| `existing_kpis` | Current KPIs in use (brownfield) | None (greenfield) |
| `reporting_frequency` | Desired reporting cadence | Shift/Daily/Weekly/Monthly |
| `dashboard_platform` | Target BI tool (Power BI, Tableau, SAP Analytics) | Power BI |
| `target_availability` | Plant availability target | 92% (industry dependent) |
| `budget_targets` | Operational and maintenance budget targets | Industry benchmarks |

### Context Enrichment
The agent should automatically:
- Retrieve industry KPI benchmarks for the sector
- Identify standard KPI definitions from ISO/EN standards
- Pull data source mappings for common CMMS and DCS platforms
- Search knowledge base for similar facility KPI frameworks
- Identify regulatory reporting KPIs required by jurisdiction

## Output Specification

### Document 1: KPI Definition Workbook (.xlsx)
**Filename**: `VSC_KPIs_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: KPI Master List
| Column | Description |
|--------|-------------|
| KPI ID | Unique identifier (e.g., KPI-OPS-001) |
| KPI Name | Full name (e.g., Overall Equipment Effectiveness) |
| KPI Abbreviation | Standard abbreviation (e.g., OEE) |
| Category | Safety / Production / Maintenance / Cost / Quality / Environmental / HR |
| Subcategory | More specific grouping |
| Type | Leading / Lagging |
| Strategic Objective | Which business objective this KPI supports |
| Owner | Role accountable for this KPI |
| Audience Level | Strategic / Tactical / Operational |

#### Sheet 2: KPI Definitions
| Column | Description |
|--------|-------------|
| KPI ID | Reference to master list |
| KPI Name | Full name |
| Purpose | Why this KPI matters / what question it answers |
| Formula | Exact calculation formula |
| Numerator Definition | Precise definition of the numerator |
| Denominator Definition | Precise definition of the denominator |
| Unit | Percentage, hours, count, ratio, USD, etc. |
| Data Source | Where the data comes from (DCS, CMMS, ERP, manual) |
| Measurement Frequency | Real-time / Shift / Daily / Weekly / Monthly / Quarterly |
| Reporting Frequency | When it is reported (may differ from measurement) |
| Aggregation Method | Sum / Average / Weighted Average / Cumulative |
| Target | Target value |
| Industry Benchmark | Benchmark range (25th, median, 75th percentile) |
| Alert Threshold | Value that triggers review (yellow) |
| Alarm Threshold | Value that triggers action (red) |
| Trend Direction | Higher is better / Lower is better |

#### Sheet 3: Safety KPIs
| KPI | Formula | Target | Benchmark | Frequency |
|-----|---------|--------|-----------|-----------|
| LTIFR | (Lost Time Injuries x 1,000,000) / Hours Worked | 0 | < 1.0 (mining) | Monthly |
| TRIFR | (Total Recordable Injuries x 1,000,000) / Hours Worked | < 3.0 | < 5.0 (mining) | Monthly |
| Near Miss Reporting Rate | Near Misses Reported / 200,000 Hours Worked | > 50 | > 30 | Monthly |
| Safety Observation Rate | Observations Conducted / Planned Observations x 100% | > 95% | > 90% | Weekly |
| Overdue Corrective Actions | Open corrective actions past due date | 0 | < 5 | Weekly |
| HSE Training Compliance | Completed HSE Training / Required HSE Training x 100% | 100% | > 95% | Monthly |
| Environmental Non-Compliance | Number of environmental non-compliance events | 0 | 0 | Monthly |

#### Sheet 4: Production/Operations KPIs
| KPI | Formula | Target | Benchmark | Frequency |
|-----|---------|--------|-----------|-----------|
| OEE | Availability x Performance x Quality | > 85% | 75-85% | Daily |
| Plant Availability | Operating Hours / (Operating + Downtime) x 100% | > 92% | 90-95% | Daily |
| Utilization | Actual Throughput / Design Throughput x 100% | > 95% | 90-98% | Shift |
| Recovery (mining) | Product Recovered / Feed Content x 100% | > 90% | 88-93% | Shift |
| Throughput | Actual production rate (tph, bbl/d, MW, m3/hr) | Design rate | Industry specific | Shift |
| Quality Compliance | Product within specification / Total product x 100% | > 98% | > 95% | Shift |
| Unplanned Shutdowns | Number of unplanned shutdown events per month | < 2 | < 3 | Monthly |
| Operating Cost per Unit | Total operating cost / Units produced | Budget | Industry quartile | Monthly |
| Energy Intensity | Energy consumed / Units produced (kWh/ton, BTU/bbl) | Budget | Industry average | Daily |
| Water Consumption | Water consumed / Units produced (m3/ton) | Budget | Industry average | Daily |

#### Sheet 5: Maintenance KPIs
| KPI | Formula | Target | Benchmark | Frequency |
|-----|---------|--------|-----------|-----------|
| MTBF | Operating Hours / Number of Failures | Increasing | Equipment-specific | Monthly |
| MTTR | Total Repair Time / Number of Repairs | Decreasing | < 4 hrs average | Monthly |
| PM Compliance | PM WOs Completed On Schedule / PM WOs Planned x 100% | > 95% | > 90% | Weekly |
| Schedule Compliance | WOs Completed as Scheduled / WOs Scheduled x 100% | > 90% | > 85% | Weekly |
| Schedule Loading | Scheduled Hours / Available Hours x 100% | 80-90% | 75-90% | Weekly |
| Reactive Maintenance % | CM Hours / Total Maintenance Hours x 100% | < 25% | < 30% | Monthly |
| Planned Maintenance % | (PM + PdM + Project) Hours / Total Hours x 100% | > 75% | > 70% | Monthly |
| Maintenance Backlog | Ready-to-schedule WOs expressed in weeks of capacity | 2-4 weeks | 2-6 weeks | Weekly |
| Wrench Time | Productive hands-on time / Available time x 100% | > 55% | 35-55% | Quarterly |
| Maintenance Cost per RAV | Annual Maint Cost / Replacement Asset Value x 100% | 2-3% | 2-5% | Annually |
| Spare Parts Service Level | Parts Available When Needed / Parts Requested x 100% | > 97% | > 95% | Monthly |
| Work Order Close-out Rate | WOs Closed within 5 days of completion / Total x 100% | > 95% | > 90% | Weekly |
| Equipment Criticality A Availability | Availability of critical equipment | > 97% | > 95% | Daily |

#### Sheet 6: Project KPIs (During OR/Construction Phase)
| KPI | Formula | Target | Description |
|-----|---------|--------|-------------|
| SPI (Schedule Performance Index) | Earned Value / Planned Value | 1.0 | > 1.0 = ahead of schedule |
| CPI (Cost Performance Index) | Earned Value / Actual Cost | 1.0 | > 1.0 = under budget |
| OR Readiness Score | Completed OR deliverables / Total OR deliverables x 100% | > 95% at commissioning | Tracks OR progress |
| Staffing Progress | Actual hires / Planned hires x 100% | Per buildup plan | Tracks recruitment |
| Training Progress | Training hours delivered / Training hours planned x 100% | Per training plan | Tracks capability building |
| Punch List Closure Rate | Closed items / Total items x 100% | > 95% at handover | Tracks commissioning progress |
| Procedure Completion | Approved procedures / Required procedures x 100% | 100% before commissioning | Tracks documentation |

#### Sheet 7: HR/Organizational KPIs
| KPI | Formula | Target | Benchmark | Frequency |
|-----|---------|--------|-----------|-----------|
| Absenteeism Rate | Absent Days / Available Days x 100% | < 3% | < 5% | Monthly |
| Turnover Rate | Departures / Average Headcount x 100% per year | < 8% | < 10% (mining) | Quarterly |
| Training Hours per Person | Total training hours / Headcount | > 40 hrs/yr | > 30 hrs/yr | Quarterly |
| Competency Assessment Pass Rate | Passed / Assessed x 100% | > 90% | > 85% | Quarterly |
| Overtime Rate | Overtime Hours / Regular Hours x 100% | < 10% | < 15% | Monthly |

#### Sheet 8: Dashboard Design Specifications
| Column | Description |
|--------|-------------|
| Dashboard Name | Name of the dashboard view |
| Audience | Who uses this dashboard |
| Review Frequency | How often it is reviewed |
| KPIs Included | Which KPIs appear on this dashboard (max 8) |
| Visualization Type | Chart type (gauge, trend, bar, table, heatmap) |
| Data Refresh | Real-time / Hourly / Daily / Weekly |
| Drill-Down Available | Can users drill into detail (Y/N) |
| Filters Available | Time period, area, equipment, shift |
| Alert Mechanism | Email / SMS / Dashboard highlight |

### Document 2: Dashboard Design Presentation (.pptx)
**Filename**: `VSC_Dashboard_{ProjectCode}_{Version}_{Date}.pptx`

**Slides**:
1. **Title** - KPI Framework and Dashboard Design
2. **KPI Philosophy** - Strategic alignment, leading/lagging balance, data-driven culture
3. **KPI Hierarchy** - Strategic > Tactical > Operational cascade diagram
4. **Safety Dashboard** - Layout mockup with safety KPIs
5. **Production Dashboard** - Layout mockup with production/operations KPIs
6. **Maintenance Dashboard** - Layout mockup with maintenance KPIs
7. **Cost Dashboard** - Layout mockup with cost KPIs
8. **Executive Dashboard** - Consolidated top-level view
9. **Daily Management Board** - Shift/daily meeting dashboard
10. **Weekly Review Dashboard** - Tactical management review dashboard
11. **Monthly Report Dashboard** - Strategic monthly review view
12. **Data Architecture** - Data sources, ETL, refresh frequencies
13. **Alert & Escalation Framework** - How alerts trigger actions
14. **Implementation Roadmap** - Phases for dashboard deployment

### Dashboard Mockup Standards
- **Color System**: Green (target met or exceeded), Yellow (below target but above alert), Red (below alert threshold)
- **Trend Arrows**: Up/Down/Flat indicators for trend direction
- **Sparklines**: 12-period trend lines for each KPI
- **Gauges**: For percentage-based KPIs with Green/Yellow/Red zones
- **Pareto Charts**: For failure analysis, downtime causes
- **Heatmaps**: For cross-equipment/cross-shift performance comparison
- **Maximum 8 KPIs per dashboard view** - avoid information overload
- **Clean white background** with minimal visual clutter

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 55001** | Asset management KPIs |
| **EN 15341** | Maintenance Key Performance Indicators (definitive European standard) |
| **SMRP Best Practices** | Society for Maintenance & Reliability Professionals - KPI definitions |
| **ISO 22400** | Manufacturing operations management - KPIs |
| **SEMI E10** | Equipment reliability and availability (semiconductor but widely used) |

### KPI Definition Best Practices (SMART)
- **Specific**: Clearly defined, no ambiguity in what is measured
- **Measurable**: Quantifiable with available data
- **Achievable**: Targets are realistic given current conditions
- **Relevant**: Aligned with business objectives and drives decisions
- **Time-bound**: Has a defined measurement period and reporting frequency

### OEE Framework Detail
```
OEE = Availability x Performance x Quality

Availability = (Planned Production Time - Unplanned Downtime) / Planned Production Time
Performance = (Actual Output / Theoretical Maximum Output) during operating time
Quality = (Good Output / Total Output)

World-Class OEE: > 85%
Typical OEE: 60-75%

Six Big Losses (OEE drivers):
1. Breakdowns (Availability)
2. Setup/Adjustment (Availability)
3. Idling/Minor Stops (Performance)
4. Reduced Speed (Performance)
5. Process Defects (Quality)
6. Startup Losses (Quality)
```

### Maintenance KPI Relationships
```
Equipment Availability = MTBF / (MTBF + MTTR)

Where:
- MTBF = Mean Time Between Failures = Operating Hours / Number of Failures
- MTTR = Mean Time To Repair = Total Downtime for Repair / Number of Repairs
- To improve Availability: Increase MTBF (better maintenance strategy) or Decrease MTTR (better planning, parts, skills)

Maintenance Cost Effectiveness:
- Preventive/Predictive : Corrective ratio should be 70:30 or better
- Maintenance cost per RAV: 2-3% is world-class for continuous processing
- Wrench Time: 55%+ is world-class (time actually doing maintenance work)
```

## Step-by-Step Execution

### Phase 1: Strategic Alignment (Steps 1-3)
1. **Define Business Objectives**: Identify the top 5-7 strategic objectives for the facility:
   - Safety (zero harm, regulatory compliance)
   - Production (throughput, quality, availability)
   - Cost (operating cost per unit, maintenance cost)
   - Reliability (equipment availability, MTBF improvement)
   - Environmental (emissions, water, waste)
   - People (retention, capability, engagement)
2. **Map KPIs to Objectives**: For each objective:
   - Select 2-4 KPIs that measure progress toward the objective
   - Ensure a mix of leading and lagging indicators
   - Verify data availability for each candidate KPI
   - Remove KPIs that cannot be measured with available systems
3. **Define KPI Hierarchy**: Structure KPIs into levels:
   - **Level 1 (Strategic)**: Plant Manager / Executive (5-8 KPIs, monthly review)
   - **Level 2 (Tactical)**: Department Managers (8-12 KPIs per department, weekly review)
   - **Level 3 (Operational)**: Supervisors / Operators (5-8 KPIs per area, daily/shift review)
   - Define roll-up logic (how operational KPIs aggregate to tactical and strategic)

### Phase 2: KPI Definition (Steps 4-6)
4. **Define Each KPI**: For every KPI in the framework:
   - Write the formula with precise numerator and denominator definitions
   - Specify the unit of measurement
   - Define inclusions and exclusions (e.g., "unplanned downtime" excludes planned shutdowns)
   - Specify the data source(s)
   - Define measurement and reporting frequency
   - Set the aggregation method (sum, average, weighted)
5. **Set Targets and Thresholds**: For each KPI:
   - Research industry benchmarks (25th, median, 75th percentile)
   - Set initial target (typically at median or 75th percentile)
   - Define alert threshold (yellow zone - management attention)
   - Define alarm threshold (red zone - action required)
   - Plan for target progression over time (year 1, year 2, year 3)
6. **Define Data Architecture**: For each KPI:
   - Identify the primary data source system
   - Define the data extraction method (API, SQL query, manual entry)
   - Specify data refresh frequency
   - Define data quality rules (validation, cleansing)
   - Map to target BI platform data model

### Phase 3: Dashboard Design (Steps 7-9)
7. **Design Dashboard Views**: For each audience level:
   - Select KPIs to display (maximum 8 per view)
   - Choose visualization types (gauges, trends, bars, tables)
   - Design layout with priority hierarchy (most important top-left)
   - Include drill-down navigation
   - Define filter capabilities (time, area, equipment, shift)
8. **Design Alert System**: Define how KPI alerts work:
   - Threshold-based alerts (KPI crosses from green to yellow/red)
   - Trend-based alerts (KPI trending in wrong direction for N periods)
   - Notification mechanism (dashboard highlight, email, SMS)
   - Escalation procedure (who is notified at each threshold)
   - Response protocol (what action is expected when alert triggers)
9. **Create Dashboard Mockups**: Design visual mockups for each dashboard view:
   - Executive/strategic dashboard
   - Operations daily dashboard
   - Maintenance weekly dashboard
   - Safety dashboard
   - Shift handover dashboard
   - Daily management meeting dashboard

### Phase 4: Document Generation & Quality (Steps 10-12)
10. **Generate KPI Workbook (.xlsx)**: Compile all KPI definitions, targets, and design specs.
11. **Generate Dashboard Design (.pptx)**: Create mockups and implementation plan.
12. **Quality Review**: Verify alignment, completeness, and measurability.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Strategic Alignment | 20% | Every KPI traces to a business objective |
| Definition Precision | 20% | Formulas are unambiguous; no room for interpretation |
| Benchmarking | 15% | Targets are grounded in industry benchmarks, not arbitrary |
| Data Feasibility | 15% | Every KPI has a viable data source |
| Leading/Lagging Balance | 10% | Framework includes both predictive and outcome measures |
| Dashboard Usability | 10% | Dashboards are clean, focused, and actionable |
| Completeness | 10% | All key areas covered (Safety, Production, Maintenance, Cost, People, Environment) |

### Automated Quality Checks
- [ ] Every KPI has a complete formula with numerator and denominator defined
- [ ] Every KPI has units specified
- [ ] Every KPI has a data source identified
- [ ] Every KPI has a target, alert threshold, and alarm threshold
- [ ] Every KPI has an industry benchmark reference
- [ ] No dashboard view has more than 8 KPIs
- [ ] Leading and lagging indicator ratio is at least 40:60
- [ ] All OEE components (Availability, Performance, Quality) are defined
- [ ] Critical maintenance KPIs present (MTBF, MTTR, PM Compliance, Backlog)
- [ ] Safety KPIs include both leading (observations, near-misses) and lagging (TRIFR, LTIFR)
- [ ] KPI hierarchy covers all management levels
- [ ] Alert/escalation framework is defined for all critical KPIs
- [ ] No conflicting KPI definitions (e.g., two different availability calculations)
- [ ] Color coding is consistent across all dashboards

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-maintenance-strategy` | Maintenance KPI targets from RCM analysis | High |
| `create-org-design` | Organizational structure for KPI ownership | High |
| `create-staffing-plan` | Workforce KPI requirements | Medium |
| `create-contract-scope` | Contractor KPIs for monitoring | Medium |
| `create-training-plan` | Training KPI definitions | Medium |
| `hse-agent` | Safety KPI requirements and regulatory targets | High |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-change-mgmt-plan` | Performance measurement as change driver | On request |
| `dashboard-implementation-agent` | KPI specs for BI tool configuration | On request |
| `create-contract-scope` | KPI definitions for contractor performance management | Automatic |
| `create-vsc-proposals` | KPI framework as proposed deliverable | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `create-maintenance-strategy` | Maintenance KPI alignment | During maintenance KPI definition |
| `hse-agent` | Safety KPI validation | During safety KPI definition |
| `data-architecture-agent` | Data source and ETL design | During data architecture phase |
| `review-documents` | Document quality review | After assembly |

## Templates & References

### Document Templates
- `VSC_KPI_Framework_Template_v2.0.xlsx` - KPI definition workbook template
- `VSC_Dashboard_Template_v1.5.pptx` - Dashboard mockup template
- `VSC_KPI_Card_Template_v1.0.docx` - Individual KPI definition card template

### Reference Standards
- EN 15341:2019 - Maintenance Key Performance Indicators
- SMRP Best Practice Metrics (5th Edition)
- ISO 22400 - Manufacturing KPIs
- Solomon Associates benchmark methodology
- IFPIMM maintenance performance indicators

## Examples

### Example: Executive Dashboard Layout (Plant Manager View)

```
+-----------------------------------------------------------------------+
| DASHBOARD EJECUTIVO - PLANTA CONCENTRADORA             Fecha: 2025-01-15 |
+-----------------------------------------------------------------------+
|                                                                       |
|  SEGURIDAD                    PRODUCCION                              |
|  +-----------+  +-----------+ +-----------+  +-----------+            |
|  | TRIFR     |  | Dias sin  | | OEE       |  | Throughput|            |
|  | [GAUGE]   |  | LTI       | | [GAUGE]   |  | [TREND]   |            |
|  | 2.1       |  | 127 dias  | | 83.2%     |  | 118 ktpd  |            |
|  | Target:<3 |  |           | | Target>85%|  | Target:120|            |
|  +-----------+  +-----------+ +-----------+  +-----------+            |
|                                                                       |
|  MANTENIMIENTO                COSTOS                                  |
|  +-----------+  +-----------+ +-----------+  +-----------+            |
|  | Disp.Eqpo |  | PM Compl. | | OpCost/ton|  | Maint Cost|            |
|  | [GAUGE]   |  | [GAUGE]   | | [TREND]   |  | [TREND]   |            |
|  | 94.1%     |  | 96.2%     | | $12.35    |  | 2.8% RAV  |            |
|  | Target>92%|  | Target>95%| | Budget:$12| | Target<3% |            |
|  +-----------+  +-----------+ +-----------+  +-----------+            |
|                                                                       |
|  TENDENCIAS (12 meses)                    TOP 5 PERDIDAS              |
|  +-------------------------------+       +-------------------+       |
|  | [OEE trend sparkline]         |       | 1. Chancado: 45hr |       |
|  | [Availability sparkline]      |       | 2. Molienda: 32hr |       |
|  | [Throughput sparkline]        |       | 3. Flotacion: 18hr|       |
|  | [Cost sparkline]              |       | 4. Electrica: 12hr|       |
|  +-------------------------------+       | 5. Instr: 8hr     |       |
|                                          +-------------------+       |
+-----------------------------------------------------------------------+
```

### Example: KPI Definition Card

```
KPI ID: KPI-MNT-001
Nombre: MTBF - Tiempo Medio Entre Fallas
Categoria: Mantenimiento - Confiabilidad
Tipo: Lagging

DEFINICION:
Tiempo promedio de operacion entre fallas para un equipo o grupo de equipos.

FORMULA:
MTBF = Horas de Operacion / Numero de Fallas

Donde:
- Horas de Operacion: Total de horas que el equipo estuvo en servicio durante el periodo
- Numero de Fallas: Total de eventos de falla que causaron detencion no programada
- EXCLUYE: Detenciones programadas (PM, turnaround), detenciones por falta de demanda

UNIDAD: Horas

FUENTE DE DATOS: CMMS (SAP PM - tipos de orden ZM01, ZM02 = fallas)

FRECUENCIA:
- Medicion: Continua (por evento)
- Reporte: Mensual (promedio 12 meses rodante)
- Revision: Mensual (reunion gerencia mantenimiento)

META: Tendencia creciente; equipo-especifico (ver tabla de referencia)
ALERTA: Si MTBF cae > 20% respecto al promedio de 12 meses
ALARMA: Si MTBF cae > 40% respecto al promedio de 12 meses

BENCHMARK:
- Bombas centrifugas: 18,000 - 36,000 hrs (best practice)
- Motores electricos: 50,000 - 100,000 hrs
- Correas transportadoras: 4,000 - 8,000 hrs (mineria)

RESPONSABLE: Ingeniero de Confiabilidad
AUDIENCIA: Superintendente de Mantenimiento, Gerente de Planta

ACCIONES CUANDO FUERA DE META:
1. Revisar ordenes de trabajo recientes para identificar modo de falla dominante
2. Realizar analisis de causa raiz (RCA) si MTBF en alarma
3. Revisar estrategia de mantenimiento (RCM) para el equipo
4. Considerar rediseno o reemplazo si tendencia persistente a la baja
```
