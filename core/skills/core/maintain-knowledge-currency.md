# Maintain Knowledge Currency

## Skill ID: Q-04
## Version: 1.0.0
## Category: Q. Knowledge Management
## Priority: P2 - Medium

---

## Purpose

Maintain the currency, accuracy, and relevance of organizational knowledge assets across the enterprise knowledge base, preventing knowledge decay that degrades decision quality, causes operational incidents, and erodes competitive advantage. This skill provides continuous monitoring, automated expiry detection, SME review scheduling, and systematic update workflows that ensure every knowledge asset in the organization's Second Brain remains current, verified, and trustworthy -- or is explicitly flagged, archived, or retired when it no longer meets currency standards.

Knowledge assets lose value at 15-25% per year if not actively maintained, with the rate of decay accelerating in regulatory-driven domains (where regulations change frequently), technology-driven domains (where equipment and software evolve rapidly), and personnel-driven domains (where tacit knowledge walks out the door with retiring experts). A 2023 study by APQC (American Productivity & Quality Center) found that organizations with formal knowledge currency programs achieve 35% higher knowledge reuse rates, 40% faster time-to-competency for new employees, and 25% fewer knowledge-related operational incidents compared to organizations that rely on ad-hoc or reactive knowledge maintenance. The Gartner Group estimates that poor knowledge management costs organizations $5.7 million per year for every 1,000 employees in lost productivity and duplicated effort.

The consequences of knowledge decay in industrial operations are particularly severe. Outdated operating procedures have been cited as contributing factors in multiple major incidents investigated by the US Chemical Safety Board (CSB), including the 2005 BP Texas City explosion where outdated startup procedures were a documented cause (CSB Investigation Report No. 2005-04-I-TX). OSHA PSM enforcement data shows that "operating procedure currency" violations (29 CFR 1910.119(f)(1) -- annual certification that procedures are current) rank consistently among the top 3 most-cited PSM elements, with penalties of $15,000-$156,259 per violation. Beyond safety, outdated knowledge causes maintenance technicians to use superseded repair procedures (leading to rework and equipment damage), engineers to make decisions based on stale design data (leading to suboptimal designs), and operators to follow obsolete practices that reduce efficiency.

Organizations typically have 30-40% of their documented knowledge outdated at any given time (AIIM International, 2022; McKinsey Global Institute, 2023). This represents a massive hidden liability: every outdated document is a potential source of error, every expired procedure is a potential safety incident, and every stale data set is a potential bad decision. This skill addresses these systemic failures by establishing automated currency monitoring, trigger-based review initiation, SME accountability enforcement, and a continuous improvement cycle that drives knowledge currency from the typical 60-70% baseline toward the 95%+ target required for operational excellence.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | Q-04                                                                                        |
| **Agent**              | Agent 12 -- Knowledge Management Curator                                                     |
| **Domain**             | Knowledge Management                                                                         |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | Medium                                                                                       |
| **Estimated Duration** | Setup: 5-10 days; Execution: continuous (ongoing lifecycle management)                        |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | KD-01: Knowledge assets lose 15-25% of value per year without maintenance (APQC, 2023)    |
| **Secondary Pain**     | A-02: Workers spend 30-40% of time searching for information, much of which is outdated (McKinsey) |
| **Value Created**      | Reduce knowledge-related incidents by 25%; increase knowledge reuse by 35%; achieve >95% currency |

### Functional Intent

This skill SHALL:

1. **Inventory All Knowledge Assets**: Maintain a comprehensive, continuously updated inventory of all knowledge assets in the organizational knowledge base, including documents, procedures, data sets, lessons learned, expert knowledge captures, training materials, and reference data. Each asset must have defined metadata including owner, creation date, last review date, review frequency, expiry date, and currency status.

2. **Assess Currency Using Dual Methods**: Apply both date-based currency assessment (has the review period expired?) and trigger-based currency assessment (has a change event occurred that invalidates the content?) to every knowledge asset. Date-based assessment catches routine aging; trigger-based assessment catches event-driven invalidation (e.g., a regulation change that makes a compliance procedure outdated, or an equipment modification that makes a maintenance procedure incorrect).

3. **Define and Enforce Expiry Rules**: Establish and enforce knowledge asset expiry rules based on asset type, criticality, regulatory requirements, and domain volatility. Rules must cover mandatory review frequencies (e.g., OSHA requires annual procedure certification), recommended review frequencies (e.g., best practice data reviewed every 2 years), and trigger-based review requirements (e.g., any referenced equipment modification triggers procedure review).

4. **Automate Monitoring and Alerting**: Continuously monitor knowledge asset expiry dates and trigger events, generating graduated alerts (90-day, 60-day, 30-day, 7-day, and expired) to asset owners and knowledge management administrators. Alerts must be actionable, containing the specific asset details, expiry rationale, required action, and deadline.

5. **Schedule and Track SME Reviews**: When a knowledge asset requires review (either date-triggered or event-triggered), automatically identify the appropriate Subject Matter Expert (SME), schedule the review, track progress, and escalate when reviews are overdue. The skill must handle SME unavailability (designate alternates) and workload balancing (distribute reviews evenly across SMEs).

6. **Manage Version Control and Archive/Retire Decisions**: When knowledge assets are updated following review, ensure proper version control (previous version archived, new version published, all references updated). When knowledge assets are no longer relevant, manage the retirement process (archive with retention period, remove from active search results, notify stakeholders).

7. **Produce Currency Dashboard and Reports**: Provide real-time visibility into overall knowledge base health through currency dashboards showing percentage current by domain, asset type, criticality, and owner. Generate periodic reports for management review, audit preparation, and continuous improvement.

8. **Drive Continuous Improvement**: Analyze knowledge currency patterns to identify systemic issues (domains with chronically low currency, owners who consistently miss review deadlines, asset types that decay fastest) and generate improvement recommendations.

---

## Trigger / Invocation

### Direct Invocation

```
/maintain-knowledge-currency --action [audit|monitor|schedule|report|retire] --scope [all|domain|owner|asset-type]
```

### Command Variants
- `/maintain-knowledge-currency audit --scope all` -- Full knowledge base currency audit
- `/maintain-knowledge-currency audit --scope domain --domain [maintenance|operations|safety|engineering]` -- Domain-specific audit
- `/maintain-knowledge-currency monitor` -- Display current monitoring dashboard
- `/maintain-knowledge-currency schedule --owner [owner_name]` -- Show/manage SME review schedule
- `/maintain-knowledge-currency report --format [xlsx|pdf|dashboard]` -- Generate currency report
- `/maintain-knowledge-currency retire --asset [asset_id]` -- Initiate asset retirement process

### Aliases
- `/knowledge-currency`, `/knowledge-audit`, `/kb-currency`, `/vigencia-conocimiento`, `/knowledge-health`

### Natural Language Triggers (EN)
- "How current is our knowledge base?"
- "Which documents are expired or expiring soon?"
- "Schedule SME reviews for the maintenance domain"
- "Show me the knowledge currency dashboard"
- "What procedures need to be reviewed this quarter?"
- "Audit knowledge currency for the operations team"
- "Retire outdated lessons learned from 2020"

### Natural Language Triggers (ES)
- "Que tan actualizada esta nuestra base de conocimiento?"
- "Que documentos estan vencidos o por vencer?"
- "Programar revisiones de SME para el dominio de mantencion"
- "Mostrar el dashboard de vigencia del conocimiento"
- "Que procedimientos necesitan revision este trimestre?"

### Contextual Triggers
- Scheduled daily automated currency scan (midnight local time)
- A source document or regulation is updated (trigger-based review cascade)
- An equipment modification (MOC) is approved (triggers review of related knowledge assets)
- An incident or near-miss references a knowledge asset (triggers immediate currency verification)
- A new employee onboarding queries the knowledge base (triggers currency check on accessed assets)
- Quarterly management review cycle (triggers comprehensive currency report)
- External audit notification (triggers pre-audit currency assessment)
- Another agent (e.g., `deliver-contextual-knowledge`) flags a potentially outdated asset during retrieval

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `knowledge_asset_inventory` | .xlsx / Airtable | mcp-sharepoint / mcp-airtable | Complete inventory of all knowledge assets with metadata: asset ID, title, type, domain, owner, creation date, last review date, review frequency, expiry date, criticality, current version, storage location |
| `expiry_rule_set` | .xlsx / .yaml | Knowledge management admin | Defined expiry rules by asset type and criticality: review frequency, trigger events, maximum age, regulatory requirements |
| `sme_register` | .xlsx | HR / Knowledge management | Register of Subject Matter Experts with domains of expertise, availability, workload capacity, and alternate/backup SMEs |
| `trigger_event_feed` | API / .xlsx | Multiple sources | Feed of events that trigger knowledge currency review: regulation changes, equipment modifications (MOC), incident reports, organizational changes, technology updates |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `regulatory_change_log` | .xlsx / API | Compliance team / `audit-compliance-readiness` | Log of regulatory changes that may affect knowledge asset currency (new regulations, amended standards, updated codes) |
| `moc_register` | .xlsx | Engineering / `manage-moc-workflow` | Management of Change register for equipment and process modifications that may invalidate existing knowledge assets |
| `incident_register` | .xlsx | HSE / incident management system | Incident and near-miss reports that reference knowledge assets (indicates asset was used and should be verified current) |
| `usage_analytics` | .xlsx / API | Knowledge base system | Knowledge asset access and usage data: which assets are accessed most frequently, which are never accessed, search queries that return outdated results |
| `organizational_change_log` | .xlsx | HR | Personnel changes (departures, role changes) that affect knowledge asset ownership and SME availability |
| `training_curriculum` | .xlsx | Training / `create-training-plan` | Training materials linked to knowledge assets that must stay synchronized |
| `previous_currency_reports` | .xlsx | mcp-sharepoint | Historical currency audit reports for trend analysis |

### Context Enrichment

The skill automatically enriches inputs by:
- Querying mcp-sharepoint for document metadata (revision dates, approval status, access frequency)
- Cross-referencing with `track-document-currency` (DOC-03) for controlled document currency status
- Checking `audit-compliance-readiness` (COMP-04) for regulatory compliance knowledge requirements
- Querying `capture-and-classify-knowledge` (KM-01) for recently ingested knowledge that may supersede existing assets
- Monitoring `manage-moc-workflow` for change events that trigger knowledge review

### Input Validation Rules

```yaml
validation:
  knowledge_asset_inventory:
    required_columns: ["asset_id", "title", "asset_type", "domain", "owner", "creation_date", "last_review_date", "review_frequency_days", "criticality"]
    asset_type_values: ["procedure", "work_instruction", "lesson_learned", "reference_data", "training_material", "expert_knowledge", "best_practice", "standard", "template", "checklist"]
    criticality_values: ["Critical", "High", "Medium", "Low"]
    domain_values: ["operations", "maintenance", "safety", "engineering", "procurement", "hr", "finance", "management"]
    date_format: "YYYY-MM-DD"
  expiry_rule_set:
    required_columns: ["asset_type", "criticality", "review_frequency_days", "max_age_days", "regulatory_basis"]
    review_frequency_must_be_positive: true
  sme_register:
    required_columns: ["sme_id", "name", "domain", "expertise_areas", "email", "max_reviews_per_month", "backup_sme_id"]
    must_have_backup: true
```

---

## Output Specification

### Deliverable 1: Knowledge Currency Audit Report (.docx)

**Filename**: `{OrgCode}_Knowledge_Currency_Audit_v{Version}_{YYYYMMDD}.docx`

**Document Structure (15-30 pages)**:

1. **Executive Summary** (2-3 pages)
   - Overall knowledge base currency score (% of assets current)
   - Currency trend (improving, stable, declining) with 6-month trendline
   - Critical findings: expired critical assets, regulatory compliance gaps
   - Top 5 recommendations for improving knowledge currency
   - Key metrics dashboard (visual summary)

2. **Methodology** (2-3 pages)
   - Audit scope and criteria
   - Date-based currency assessment methodology
   - Trigger-based currency assessment methodology
   - Currency scoring model (how currency score is calculated)
   - Data sources and validation approach

3. **Currency Assessment by Domain** (4-8 pages)
   For each knowledge domain (operations, maintenance, safety, engineering, etc.):
   - Total assets in domain
   - Currency score (% current)
   - Expired assets count and list
   - Assets expiring within 30/60/90 days
   - Domain-specific risks from knowledge decay
   - Trend vs. previous audit
   - Improvement recommendations

4. **Currency Assessment by Asset Type** (3-5 pages)
   For each asset type (procedures, lessons learned, reference data, etc.):
   - Currency metrics
   - Decay rate analysis (how fast this asset type becomes outdated)
   - Comparison to industry benchmarks

5. **SME Review Performance** (2-3 pages)
   - Review completion rate by SME
   - Average review turnaround time
   - Overdue reviews by SME and domain
   - SME workload distribution analysis
   - Recommendations for workload rebalancing

6. **Regulatory Compliance Currency** (2-3 pages)
   - Assets with regulatory review requirements
   - Compliance rate (% meeting regulatory review frequency)
   - Specific regulatory gaps identified
   - Remediation plan and timeline

7. **Recommendations and Action Plan** (2-3 pages)
   - Prioritized list of improvement actions
   - Resource requirements for knowledge currency improvement
   - Target currency score and timeline to achieve
   - Quick wins (actions that can improve currency score within 30 days)

8. **Appendices**
   - Complete expired asset inventory
   - Expiring assets (next 90 days) with review schedule
   - SME review assignment matrix
   - Trigger event log for the audit period

### Deliverable 2: Expiry Calendar (.xlsx)

**Filename**: `{OrgCode}_Knowledge_Expiry_Calendar_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Expiry Overview"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Asset_ID | Knowledge asset identifier | KA-OPS-001 |
| B | Title | Asset title | SAG Mill Startup Procedure |
| C | Asset_Type | Type of knowledge asset | Procedure |
| D | Domain | Knowledge domain | Operations |
| E | Owner | Asset owner name | C. Mendez |
| F | Criticality | Critical / High / Medium / Low | Critical |
| G | Last_Review_Date | Date of last review/update | 2025-06-15 |
| H | Review_Frequency | Review frequency in days | 365 |
| I | Expiry_Date | Calculated expiry date | 2026-06-15 |
| J | Days_Until_Expiry | Days remaining until expiry (negative if expired) | -45 |
| K | Currency_Status | Current / Expiring Soon / Expired | Expired |
| L | Trigger_Events | Recent trigger events affecting this asset | MOC-2026-015: SAG Mill liner material change |
| M | Assigned_Reviewer | SME assigned for review | J. Martinez |
| N | Review_Due_Date | Date by which review must be completed | 2026-07-15 |
| O | Review_Status | Not Scheduled / Scheduled / In Progress / Complete | Scheduled |
| P | Regulatory_Requirement | Regulatory basis for review (if any) | OSHA 29 CFR 1910.119(f)(1) - annual certification |
| Q | Risk_If_Not_Reviewed | Impact of continued use of potentially outdated asset | High - safety-critical procedure; outdated content could lead to incorrect startup sequence |

#### Sheet 2: "Calendar View"

Monthly calendar showing:
- Assets expiring each month (12-month rolling view)
- Reviews scheduled each month
- Reviews completed each month
- Cumulative currency score projection

#### Sheet 3: "Trigger Event Log"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Event_ID | Trigger event identifier |
| B | Event_Date | Date of trigger event |
| C | Event_Type | Regulation Change / MOC / Incident / Technology / Organizational |
| D | Event_Description | Description of the event |
| E | Affected_Assets | Knowledge assets affected by this event |
| F | Review_Required | Yes / No (with rationale) |
| G | Review_Initiated | Date review was initiated |
| H | Review_Status | Status of triggered review |

### Deliverable 3: Update Queue (.xlsx)

**Filename**: `{OrgCode}_Knowledge_Update_Queue_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Priority Update Queue"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Queue_Position | Priority rank in update queue | 1 |
| B | Asset_ID | Knowledge asset identifier | KA-OPS-001 |
| C | Title | Asset title | SAG Mill Startup Procedure |
| D | Priority_Score | Calculated priority score (0-100) | 95 |
| E | Priority_Basis | Why this asset is high priority | Expired critical procedure + MOC trigger event + referenced in recent incident |
| F | Days_Expired | Days past expiry (0 if not yet expired) | 45 |
| G | Trigger_Count | Number of trigger events affecting this asset | 2 |
| H | Usage_Frequency | Access count in last 90 days | 47 |
| I | Criticality | Asset criticality level | Critical |
| J | Assigned_SME | Reviewer assigned | J. Martinez |
| K | Review_Start | Scheduled review start date | 2026-07-01 |
| L | Review_Due | Review completion deadline | 2026-07-15 |
| M | Estimated_Effort | Estimated review hours | 8 |
| N | Status | Queued / Assigned / In Review / Updated / Published | Assigned |
| O | Update_Type | Minor Update / Major Revision / Retire / Confirm Current | Major Revision |

Priority score calculation:
- Criticality weight: Critical=40, High=30, Medium=20, Low=10
- Expiry weight: Days expired x 0.5 (max 30 points)
- Trigger events: 10 points per trigger event (max 20 points)
- Usage frequency: High use=10, Medium=5, Low=0
- Regulatory requirement: +10 if regulatory review is required

### Deliverable 4: SME Review Schedule (.xlsx)

**Filename**: `{OrgCode}_SME_Review_Schedule_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet 1: "SME Assignment Matrix"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | SME_ID | SME identifier |
| B | SME_Name | SME full name |
| C | Domain | Primary domain of expertise |
| D | Expertise_Areas | Specific expertise areas |
| E | Max_Reviews_Month | Maximum reviews capacity per month |
| F | Current_Assigned | Currently assigned reviews |
| G | Utilization_Pct | Review workload utilization |
| H | Overloaded | Overloaded flag (>100% capacity) |
| I | Backup_SME | Designated backup reviewer |
| J | Availability_Notes | Known absences, leave, travel |

#### Sheet 2: "Review Schedule (12-Month)"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Review_ID | Unique review identifier |
| B | Asset_ID | Knowledge asset to be reviewed |
| C | Asset_Title | Asset title |
| D | Review_Type | Date-Triggered / Event-Triggered / Proactive |
| E | Assigned_SME | Assigned reviewer |
| F | Scheduled_Start | Review start date |
| G | Due_Date | Review completion deadline |
| H | Estimated_Hours | Estimated review effort |
| I | Status | Scheduled / In Progress / Complete / Overdue / Cancelled |
| J | Completion_Date | Actual completion date |
| K | Outcome | Confirmed Current / Minor Update / Major Revision / Retired |
| L | Notes | Review notes and findings |

#### Sheet 3: "SME Performance Metrics"

| Metric | Calculation | Target | Current |
|--------|------------|--------|---------|
| Review completion rate | Completed / Assigned | >95% | |
| Average turnaround time | Avg days from assignment to completion | <14 days | |
| Overdue rate | Overdue reviews / Total assigned | <5% | |
| Quality score | Reviews passing QA check / Total completed | >90% | |
| Workload balance | Std deviation of utilization across SMEs | <15% | |

---

## Methodology & Standards

### Primary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| ISO 30401:2018 | Knowledge Management Systems -- Requirements | Provides the management system framework for knowledge currency, including requirements for knowledge asset lifecycle management, monitoring, and continuous improvement |
| ISO 9001:2015 | Quality Management Systems -- Requirements (Clause 7.5) | Documented information control requirements including creation, update, retention, and disposition of quality-relevant knowledge assets |
| OSHA 29 CFR 1910.119(f)(1) | Process Safety Management -- Operating Procedures | Mandates annual certification that operating procedures are current and accurate; establishes minimum review frequency for safety-critical procedures |
| ISO 55001:2014 | Asset Management -- Management Systems | Knowledge management requirements for asset management including maintenance of asset knowledge currency |

### Secondary Standards

| Standard | Description | Application |
|----------|-------------|-------------|
| APQC Knowledge Management Framework | American Productivity & Quality Center KM best practices | Provides benchmarking data and best practice guidance for knowledge currency programs |
| ISO 30400:2016 | Human Resource Management -- Vocabulary | Defines competency and knowledge terminology used in currency assessment |
| ANSI/NISO Z39.19 | Guidelines for Construction of Controlled Vocabularies | Taxonomy and classification standards for knowledge asset categorization |
| ISO 15489-1:2016 | Records Management | Records lifecycle management principles applied to knowledge asset retention and disposition |
| ITIL Knowledge Management | IT Infrastructure Library KM practices | Knowledge article lifecycle management methodology adaptable to operational knowledge |

### Key Frameworks
- **APQC Knowledge Flow Process**: Captures knowledge lifecycle from creation through sharing, application, and retirement, with currency checkpoints at each transition.
- **DIKW Hierarchy (Data-Information-Knowledge-Wisdom)**: Framework for assessing at which level knowledge decay occurs and applying appropriate currency interventions.
- **ISO 30401 Knowledge Lifecycle**: Creation > Capture > Organization > Storage > Sharing > Application > Review > Update/Retire -- with currency assessment at the Review stage.
- **OSHA PSM Document Currency Model**: Regulatory-driven model requiring annual procedure certification, applicable as the minimum standard for safety-critical knowledge assets.

### Company-Specific Document Lifecycle Policies
- VSC Knowledge Asset Lifecycle Policy v2.0
- VSC Document Control Procedure v3.5
- VSC SME Review Protocol v1.5
- VSC Knowledge Retirement Standard v1.0

### Industry Statistics

| Statistic | Source | Year |
|-----------|--------|------|
| Knowledge assets lose 15-25% of value per year without maintenance | APQC | 2023 |
| 30-40% of documented knowledge is outdated at any given time | AIIM International / McKinsey | 2022-2023 |
| Organizations with formal KM programs achieve 35% higher knowledge reuse | APQC | 2023 |
| Poor KM costs $5.7M per year per 1,000 employees | Gartner | 2022 |
| Operating procedure currency violations are top-3 OSHA PSM citations | OSHA Enforcement Data | 2023 |
| 40% faster time-to-competency with current knowledge base | APQC | 2023 |
| 25% fewer knowledge-related incidents with formal currency programs | APQC / DNV | 2022 |
| Average review turnaround: 10-21 days (industry benchmark) | Knowledge Management Institute | 2023 |

---

## Step-by-Step Execution

### Phase 1: Knowledge Asset Inventory and Baseline (Steps 1-3)

**Step 1: Conduct Knowledge Asset Inventory**
- Query mcp-sharepoint for all document libraries containing knowledge assets:
  - Operating procedures, work instructions, SOPs, EOPs
  - Maintenance procedures, repair procedures, PM checklists
  - Engineering standards, design specifications, calculation sheets
  - Lessons learned, incident investigation reports, case studies
  - Training materials, competency frameworks, assessment guides
  - Reference data, equipment data sheets, material specifications
  - Best practices, guidelines, templates, checklists
- For each knowledge asset, extract metadata:
  - Asset ID (assign if not existing), title, asset type, domain
  - Owner/author, creation date, last modification date, last review date
  - Version number, document status (draft, approved, obsolete)
  - Storage location (SharePoint library, folder path, URL)
  - Related assets (references, dependencies, supersedes)
- Cross-reference with `capture-and-classify-knowledge` (KM-01) taxonomy for consistent classification
- Identify orphan assets (no owner, no review date, no classification) and flag for remediation
- Generate inventory summary: total assets by type, domain, criticality, and currency status
- Store complete inventory in mcp-airtable as the knowledge asset master register

**Step 2: Assess Current Currency Status (Date-Based)**
- For each knowledge asset, calculate currency status:
  - **Current**: Last review date + review frequency > today (still within review period)
  - **Expiring Soon**: Last review date + review frequency is within 90 days of today
  - **Expired**: Last review date + review frequency < today (past due for review)
  - **Never Reviewed**: No last review date recorded (created but never formally reviewed)
  - **No Expiry Rule**: No review frequency assigned (needs rule assignment)
- Apply regulatory review requirements where applicable:
  - Operating procedures: annual review per OSHA 29 CFR 1910.119(f)(1)
  - Safety studies (HAZOP, LOPA, SIL): review per MOC trigger or 5-year cycle per API RP 754
  - Emergency procedures: annual review per OSHA 29 CFR 1910.38
  - Training materials: review when source content changes or annually
- Calculate baseline currency score:
  - Overall: (Current assets / Total assets) x 100
  - By domain, by asset type, by criticality, by owner
  - Weighted score: Critical assets weighted 3x, High 2x, Medium 1x, Low 0.5x
- Generate baseline currency assessment report
- Flag all expired Critical and High assets for immediate review (Priority 1)

**Step 3: Assess Currency Status (Trigger-Based)**
- Query trigger event sources for recent events affecting knowledge currency:
  - **Regulation changes**: Query `audit-compliance-readiness` (COMP-04) and regulatory change feed for new or amended regulations affecting existing knowledge assets
  - **Equipment modifications**: Query `manage-moc-workflow` for approved MOCs and identify all knowledge assets referencing modified equipment or processes
  - **Incident findings**: Query incident register for incidents that reference knowledge assets or whose root cause analysis identifies knowledge gaps
  - **Technology changes**: Review technology change log for software updates, equipment upgrades, or methodology changes
  - **Organizational changes**: Query HR change log for personnel changes affecting asset ownership or SME availability
- For each trigger event:
  - Identify all affected knowledge assets (using cross-reference metadata and keyword search)
  - Classify the impact: content invalidated (requires revision), context changed (requires review), no impact (document)
  - Override date-based currency status if trigger event invalidates content (asset is "Expired by Trigger" even if date-based status is "Current")
- Update knowledge asset inventory with trigger-based currency status
- Add trigger-affected assets to the review queue with elevated priority

### Phase 2: Expiry Rule Definition and Monitoring (Steps 4-6)

**Step 4: Define Expiry Rules**
- Establish the expiry rule set for each asset type and criticality combination:

  | Asset Type | Critical | High | Medium | Low |
  |-----------|----------|------|--------|-----|
  | Operating Procedure | 365 days (regulatory) | 365 days | 730 days | 730 days |
  | Maintenance Procedure | 365 days | 365 days | 730 days | 1095 days |
  | Lesson Learned | 730 days | 730 days | 1095 days | 1825 days |
  | Reference Data | 365 days | 365 days | 730 days | 1095 days |
  | Training Material | 365 days | 365 days | 730 days | 730 days |
  | Expert Knowledge | 730 days | 730 days | 1095 days | 1825 days |
  | Best Practice | 730 days | 730 days | 1095 days | 1825 days |
  | Standard/Template | 1095 days | 1095 days | 1825 days | 1825 days |
  | Checklist | 365 days | 365 days | 730 days | 1095 days |

- Define trigger-based expiry rules:
  - MOC affecting referenced equipment -> immediate review required
  - Regulation change affecting compliance requirements -> 30-day review required
  - Incident referencing the knowledge asset -> 14-day review required
  - Technology change affecting referenced tools/systems -> 60-day review required
  - Owner departure from organization -> 30-day review and ownership transfer required
- Define maximum age rules (regardless of review frequency):
  - Critical assets: maximum 5 years without major revision
  - High assets: maximum 7 years without major revision
  - Medium assets: maximum 10 years without major revision
  - Low assets: maximum 10 years; consider retirement if not accessed in 3 years
- Store expiry rules in mcp-airtable linked to asset type/criticality combinations
- Publish expiry rules to all knowledge asset owners via mcp-outlook notification

**Step 5: Configure Automated Monitoring**
- Set up automated daily currency scan:
  - Scan all knowledge assets against expiry rules
  - Calculate days-to-expiry for each asset
  - Identify assets entering new alert thresholds (90-day, 60-day, 30-day, 7-day, expired)
  - Check for new trigger events from event feeds
  - Update currency status in mcp-airtable
- Configure graduated alert notifications via mcp-outlook:
  - **90 days to expiry**: Information notice to asset owner ("Your asset expires in 90 days, please plan review")
  - **60 days to expiry**: Reminder to asset owner with review scheduling request
  - **30 days to expiry**: Urgent notice to asset owner AND their manager; SME review must be scheduled
  - **7 days to expiry**: Final warning to asset owner, manager, AND KM administrator
  - **Expired**: Expiry notification to all stakeholders; asset flagged with "EXPIRED -- VERIFY BEFORE USE" warning in knowledge base; escalation to domain manager
- Configure trigger-event monitoring:
  - Subscribe to MOC approval notifications from `manage-moc-workflow`
  - Subscribe to regulatory change notifications from `audit-compliance-readiness`
  - Subscribe to incident report notifications from HSE system
  - Process each event against the trigger-based expiry rules
- Generate daily monitoring summary for KM administrator (count of new alerts, escalations, completions)

**Step 6: Schedule SME Reviews**
- For each knowledge asset requiring review (date-triggered or event-triggered):
  - Identify the appropriate SME from the SME register based on domain and expertise match
  - Check SME availability and current workload (max reviews per month capacity)
  - If primary SME is unavailable or overloaded, assign to backup SME
  - Schedule the review with:
    - Start date (typically 7 days after assignment for planning)
    - Due date (per urgency: expired=14 days, 30-day warning=30 days, 60-day warning=60 days)
    - Estimated effort hours (based on asset type and complexity)
    - Review scope: confirm current, minor update, major revision, or retire
  - Send review assignment notification via mcp-outlook with:
    - Asset details and current version
    - Expiry reason (date-based, trigger event, or both)
    - Specific review focus areas (what may have changed)
    - Review completion form/template
    - Due date and escalation protocol
- Balance SME workload:
  - Distribute reviews evenly across available SMEs in each domain
  - No SME should exceed 80% of their monthly review capacity
  - Stagger review due dates to avoid end-of-month clustering
- Track review acceptance: SME must acknowledge assignment within 48 hours
- Escalate unacknowledged assignments to SME's manager after 48 hours

### Phase 3: Review Execution and Version Control (Steps 7-10)

**Step 7: Prioritize Updates in Queue**
- Calculate priority score for each asset requiring update (per priority scoring model):
  - Criticality weight: Critical=40, High=30, Medium=20, Low=10
  - Expiry weight: Days expired x 0.5 (max 30 points)
  - Trigger event weight: 10 points per trigger event (max 20 points)
  - Usage frequency weight: High-use=10, Medium=5, Low=0
  - Regulatory requirement weight: +10 if regulatory review is required
- Sort update queue by priority score (descending)
- Group by domain and SME for efficient batch review
- Publish update queue to domain managers and KM administrator
- Review and adjust priorities weekly based on operational needs

**Step 8: Execute Version Control**
- When SME completes review, process the outcome:
  - **Confirmed Current**: Update last review date; reset expiry clock; publish confirmation
  - **Minor Update**: SME submits tracked changes; QA review; publish new minor version (e.g., v2.1 -> v2.2); archive previous version; update all cross-references
  - **Major Revision**: SME submits rewritten content; peer review; QA review; approval workflow; publish new major version (e.g., v2.2 -> v3.0); archive previous version; notify all stakeholders; update training materials if applicable
  - **Retire**: Initiate retirement workflow (Step 10)
- Version control protocol:
  - Previous version moved to archive with "SUPERSEDED" watermark
  - New version published to active library with correct metadata
  - All assets referencing the updated asset are flagged for reference verification
  - Change log entry recorded: what changed, why, who approved, effective date
- Store version history in mcp-sharepoint with full audit trail
- Notify stakeholders of published updates via mcp-outlook

**Step 9: Manage Currency Dashboard**
- Maintain real-time knowledge currency dashboard with the following components:

  **Panel 1: Overall Currency Score**
  - Gauge chart: Overall currency percentage (target >95%)
  - Trend line: 12-month currency score trend
  - Benchmark comparison: current score vs. industry average (60-70%) and target (95%)

  **Panel 2: Currency by Domain**
  - Horizontal bar chart: currency % by domain with RAG coding
  - Operations / Maintenance / Safety / Engineering / Procurement / HR / Management

  **Panel 3: Currency by Asset Type**
  - Stacked bar chart: current / expiring / expired by asset type

  **Panel 4: Expiry Forecast**
  - Area chart: assets expiring per month (12-month forward view)
  - Overlay: SME review capacity (can we handle the expiry volume?)

  **Panel 5: SME Review Performance**
  - Table: SME name, assigned, completed, overdue, avg turnaround
  - Highlight overdue reviews in red

  **Panel 6: Risk Heat Map**
  - Matrix: domain vs. criticality with cell color = currency % (green >90%, amber 70-90%, red <70%)

- Publish dashboard to mcp-sharepoint and distribute link to management
- Refresh dashboard data from mcp-airtable every 4 hours

**Step 10: Manage Archive and Retirement**
- For knowledge assets identified for retirement:
  - Verify no active references or dependencies from other current assets
  - Verify no regulatory retention requirement preventing retirement
  - Verify no operational need for the content (check usage analytics: zero access in last 12 months)
  - If dependencies exist: update referencing assets first, then retire
  - If retention requirement exists: archive with retention period, remove from active search
  - If operational need exists: flag for review instead of retirement
- Retirement workflow:
  - SME recommends retirement with rationale
  - Domain manager approves retirement
  - KM administrator executes:
    - Move asset to archive library with "RETIRED" classification
    - Remove from active knowledge base search results
    - Set retention period (per records management policy: typically 7-10 years)
    - Notify stakeholders who accessed the asset in the last 12 months
    - Update knowledge asset inventory
  - Record retirement decision in audit trail

### Phase 4: Continuous Improvement and Reporting (Steps 11-13)

**Step 11: Generate Periodic Reports**
- Generate monthly knowledge currency summary report:
  - Currency score trend (current month vs. previous months)
  - Assets reviewed this month (count, outcomes)
  - Assets expired this month (count, remediation status)
  - SME review performance metrics
  - Trigger events processed this month
- Generate quarterly comprehensive Knowledge Currency Audit Report (per Deliverable 1 specification):
  - Full domain-by-domain analysis
  - Regulatory compliance assessment
  - SME workload analysis
  - Trend analysis and forecasting
  - Improvement recommendations
- Generate annual knowledge currency year-in-review:
  - Year-over-year currency improvement (or decline)
  - Total reviews completed, assets updated, assets retired
  - ROI analysis: incidents prevented, time saved, compliance achieved
  - Strategic recommendations for next year

**Step 12: Analyze Patterns and Drive Improvement**
- Analyze knowledge currency patterns quarterly:
  - **Chronic decay domains**: Which domains consistently have lowest currency? Root cause: insufficient SME capacity, rapid change rate, or poor ownership discipline?
  - **Ownership gaps**: Which owners consistently miss review deadlines? Root cause: workload, awareness, or accountability?
  - **Asset type decay rates**: Which asset types expire fastest? Should review frequencies be adjusted?
  - **Trigger event effectiveness**: Are trigger-based reviews catching real invalidation, or generating false positives?
  - **Usage vs. currency correlation**: Are high-use assets more current than low-use assets? (They should be, but often are not)
- Generate improvement recommendations:
  - Adjust review frequencies based on actual decay rate data
  - Reassign overloaded SME workload to backup reviewers
  - Implement content-based change detection to supplement date-based expiry
  - Automate review for low-complexity assets (reference data, templates)
  - Invest in domains with chronically low currency
- Track improvement action implementation and measure impact

**Step 13: Feed Knowledge Currency into Organizational Learning**
- Integrate knowledge currency data with other organizational learning systems:
  - Feed currency metrics to `benchmark-maintenance-kpis` (MAINT-04) as a KM health indicator
  - Report regulatory currency compliance to `audit-compliance-readiness` (COMP-04)
  - Share currency insights with `generate-lessons-learned` for cross-project learning
  - Provide currency status to `deliver-contextual-knowledge` so it can flag potentially outdated assets at point of retrieval
  - Update `build-second-brain` with currency metadata for trust-scoring in knowledge retrieval
- Close the feedback loop:
  - When an incident investigation identifies outdated knowledge as a contributing factor, increase criticality rating and reduce review frequency for that asset type
  - When an audit finding identifies knowledge gaps, create new knowledge assets and add to currency monitoring
  - When a new employee reports difficulty finding current knowledge, analyze usage patterns and improve currency for high-demand domains

---

## Quality Criteria

### Scoring Table

| Criterion | Metric | Weight | Target | Minimum Acceptable |
|-----------|--------|--------|--------|-------------------|
| Overall currency score | % of knowledge assets current (date + trigger) | 20% | >95% | >85% |
| Critical asset currency | % of Critical-rated assets current | 15% | 100% | >95% |
| Regulatory compliance | % of regulatory-required reviews completed on time | 15% | 100% | 100% (non-negotiable) |
| SME review completion rate | Reviews completed on time / Reviews assigned | 10% | >95% | >85% |
| Average review turnaround | Days from assignment to completion | 10% | <14 days | <21 days |
| Trigger event response time | Days from trigger event to review initiation | 10% | <7 days | <14 days |
| Inventory completeness | % of actual knowledge assets captured in inventory | 5% | >98% | >90% |
| Ownership coverage | % of assets with assigned, active owner | 5% | 100% | >95% |
| Dashboard currency | Dashboard data age | 5% | <4 hours | <24 hours |
| Retirement effectiveness | Assets retired that had zero access in 12 months | 5% | >80% of eligible | >60% of eligible |

### Automated Quality Checks

1. **Expired asset alert**: Flag all assets past expiry date with no scheduled review
2. **Orphan asset detection**: Flag assets with no assigned owner or with owner who has left the organization
3. **Review overdue alert**: Flag all SME reviews past due date
4. **Regulatory gap detection**: Flag any regulatory-required asset (OSHA annual certification) that is expired
5. **Trigger event coverage**: Verify all MOC approvals and regulation changes have been cross-referenced against affected assets
6. **SME overload detection**: Flag SMEs assigned reviews exceeding their monthly capacity
7. **Classification consistency**: Verify all assets have criticality assigned and criticality aligns with asset type and domain
8. **Stale inventory detection**: Flag assets not accessed in 24+ months for retirement consideration
9. **Version control integrity**: Verify no active assets have duplicate versions in the knowledge base
10. **Cross-reference integrity**: Verify no active asset references a retired or superseded asset

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `capture-and-classify-knowledge` (KM-01) | New knowledge assets ingested into the knowledge base (triggers inventory update) | Critical | mcp-airtable |
| `track-document-currency` (DOC-03) | Controlled document currency status for knowledge assets that are also controlled documents | High | mcp-sharepoint |
| `manage-moc-workflow` | MOC approval notifications triggering knowledge asset review | High | mcp-sharepoint |
| `audit-compliance-readiness` (COMP-04) | Regulatory change notifications affecting knowledge asset currency | High | mcp-sharepoint |
| `generate-lessons-learned` | New lessons learned requiring currency monitoring setup | Medium | mcp-sharepoint |
| HR / organizational change feed | Personnel changes affecting asset ownership and SME availability | Medium | mcp-outlook |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Criticality | MCP Channel |
|-------------|----------------|-------------|-------------|
| `deliver-contextual-knowledge` | Currency status metadata enabling trust-scoring at point of retrieval | Critical | mcp-airtable |
| `build-second-brain` | Currency metadata for knowledge base indexing and search ranking | High | mcp-airtable |
| `audit-compliance-readiness` (COMP-04) | Regulatory knowledge currency compliance evidence for audits | High | mcp-sharepoint |
| `benchmark-maintenance-kpis` (MAINT-04) | Knowledge currency KPI for maintenance management health metrics | Medium | mcp-sharepoint |
| `track-or-deliverables` (H-02) | Knowledge readiness metrics for OR program tracking | Medium | mcp-airtable |
| `create-training-plan` | Training material currency status for training program alignment | Medium | mcp-sharepoint |

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-sharepoint` | Document management system integration for knowledge asset metadata, version control, and archive management | Read document metadata (revision dates, approval status, access frequency); Manage document lifecycle (publish, archive, retire); Store audit reports and currency certificates; Retrieve trigger event documents (MOCs, incident reports); Manage document library organization |
| `mcp-outlook` | Notification and alert delivery for expiry warnings, review assignments, and escalations | Send graduated expiry alerts (90/60/30/7/0 days); Deliver SME review assignments; Trigger escalation emails for overdue reviews; Distribute periodic currency reports; Schedule review meetings; Send retirement notifications to stakeholders |
| `mcp-excel` | Complex currency calculations, trend analysis, and report generation | Calculate priority scores for update queue; Perform trend analysis on currency data; Generate Pareto and statistical analyses; Model SME workload distribution; Forecast expiry volumes and review capacity; Produce audit report statistical tables |
| `mcp-airtable` | Knowledge asset master register and real-time tracking database | Maintain knowledge asset inventory with all metadata; Track review assignments and completion; Support dashboard views with real-time currency metrics; Manage update queue prioritization; Store trigger event log; Generate filtered views by domain, type, owner, and status |

---

## Templates & References

### Templates
- `templates/knowledge_currency_audit_report.docx` - Comprehensive audit report template with VSC branding
- `templates/knowledge_expiry_calendar.xlsx` - Expiry calendar workbook template with conditional formatting
- `templates/knowledge_update_queue.xlsx` - Priority update queue template with scoring formula
- `templates/sme_review_schedule.xlsx` - SME review assignment and tracking template
- `templates/sme_review_form.docx` - Review completion form for SME use (review outcome, changes made, rationale)
- `templates/knowledge_retirement_form.docx` - Retirement request and approval form
- `templates/knowledge_currency_dashboard.pbix` - Power BI dashboard template (if using Power BI)
- `templates/expiry_rule_set.xlsx` - Expiry rule configuration template

### Reference Documents
- ISO 30401:2018 - Knowledge Management Systems -- Requirements
- ISO 9001:2015 - Quality Management Systems (Clause 7.5: Documented Information)
- OSHA 29 CFR 1910.119(f)(1) - Operating Procedures Currency Requirements
- APQC Knowledge Management Framework and Benchmarking Reports (2023)
- ISO 15489-1:2016 - Records Management
- VSC Knowledge Asset Lifecycle Policy v2.0
- VSC Document Control Procedure v3.5

### Reference Datasets
- APQC knowledge management benchmarking data (currency rates by industry)
- OSHA PSM enforcement citation data (procedure currency violations)
- Knowledge decay rate models by domain and asset type
- SME review effort benchmarks by asset complexity
- Industry-standard review frequency recommendations by asset type

---

## Examples

### Example 1: Knowledge Currency Audit Dashboard -- Mining Operation

```
KNOWLEDGE CURRENCY AUDIT - Cerro Alto Copper Concentrator
================================================================
Audit Date: 2026-06-30  |  Audit Period: Q2 2026
Total Knowledge Assets: 2,845  |  Previous Audit: 2026-03-31

OVERALL CURRENCY SCORE: 78.2% (Target: >95%)
  Trend: +4.3% from Q1 2026 (73.9%)
  Industry Benchmark: 65% (mining sector average)
  Status: ABOVE BENCHMARK but BELOW TARGET

CURRENCY BY DOMAIN:
  +------------------+-------+---------+----------+---------+-------+
  | Domain           | Total | Current | Expiring  | Expired | Score |
  +------------------+-------+---------+----------+---------+-------+
  | Operations       |   520 |   445   |    42    |    33   | 85.6% |
  | Maintenance      |   680 |   510   |    85    |    85   | 75.0% |
  | Safety/HSE       |   340 |   310   |    18    |    12   | 91.2% |
  | Engineering      |   425 |   320   |    55    |    50   | 75.3% |
  | Procurement      |   180 |   135   |    25    |    20   | 75.0% |
  | HR/Training      |   280 |   215   |    35    |    30   | 76.8% |
  | Management       |   420 |   290   |    65    |    65   | 69.0% |
  +------------------+-------+---------+----------+---------+-------+

CRITICAL ASSET CURRENCY: 92.4% (Target: 100%)
  Total Critical assets: 185
  Current: 171  |  Expiring: 8  |  Expired: 6

  EXPIRED CRITICAL ASSETS (Immediate Action Required):
  1. KA-OPS-012  SAG Mill Emergency Shutdown Procedure    Expired 45 days
                 Trigger: MOC-2026-015 (liner material change)
                 SME: J. Martinez  |  Review IN PROGRESS (due 2026-07-10)

  2. KA-SAF-008  Confined Space Entry - Process Vessels   Expired 22 days
                 Trigger: Regulation change (DS 132 amendment)
                 SME: P. Silva  |  Review SCHEDULED (due 2026-07-15)

  3. KA-MNT-034  Ball Mill Gearbox Overhaul Procedure     Expired 15 days
                 Trigger: Vendor bulletin (revised torque specs)
                 SME: R. Torres  |  Review NOT YET ASSIGNED

  4-6. [Three additional expired critical assets listed...]

REGULATORY COMPLIANCE:
  OSHA Annual Procedure Certification: 89.2% complete (Target: 100%)
    47 procedures due for annual certification this quarter
    42 completed (89.4%)
    5 overdue (ACTION REQUIRED)

SME REVIEW PERFORMANCE (Q2 2026):
  +------------------+----------+-----------+---------+---------+
  | SME              | Assigned | Completed | Overdue | Avg Days|
  +------------------+----------+-----------+---------+---------+
  | J. Martinez      |    12    |    10     |    1    |  11.5   |
  | P. Silva         |    15    |    12     |    2    |  14.2   |
  | C. Mendez        |     8    |     8     |    0    |   8.5   |
  | R. Torres        |    10    |     7     |    2    |  16.8   |
  | M. Gonzalez      |    11    |    11     |    0    |   9.2   |
  +------------------+----------+-----------+---------+---------+

TOP RECOMMENDATIONS:
  1. IMMEDIATE: Assign SME review for 3 expired critical assets (KA-MNT-034)
  2. URGENT: Complete 5 overdue OSHA annual procedure certifications
  3. Q3 TARGET: Achieve 85% currency in Management domain (currently 69%)
  4. CAPACITY: Redistribute R. Torres workload; consistently overloaded
  5. PROCESS: Implement automated trigger monitoring for MOC events
```

### Example 2: Knowledge Decay Prevention -- Oil & Gas Operation

```
KNOWLEDGE CURRENCY IMPROVEMENT PROGRAM - Atacama Gas Processing
================================================================
Program Start: 2026-01-01  |  Current Report: 2026-06-30

CURRENCY SCORE PROGRESSION:
  Jan 2026: 58.2%  (Baseline -- below industry average)
  Feb 2026: 61.5%  (+3.3%)
  Mar 2026: 67.8%  (+6.3%)
  Apr 2026: 72.1%  (+4.3%)
  May 2026: 78.5%  (+6.4%)
  Jun 2026: 83.2%  (+4.7%)

  6-Month Improvement: +25.0 percentage points
  Monthly Average Gain: +4.2 percentage points
  Forecast to 95% Target: October 2026 (at current rate)

TRIGGER-BASED REVIEW EFFECTIVENESS:
  Trigger Events Processed (Q2): 45
  +--------------------+-------+-----------+---------+----------+
  | Trigger Type       | Count | Assets    | Reviews | Avg Days |
  |                    |       | Affected  | Initiated| to Review|
  +--------------------+-------+-----------+---------+----------+
  | MOC Approved       |   18  |    62     |   62    |   5.2    |
  | Regulation Change  |    4  |    28     |   28    |   8.5    |
  | Incident Reference |    8  |    15     |   15    |   3.1    |
  | Technology Change   |    6  |    22     |   22    |   7.8    |
  | Personnel Change   |    9  |    34     |   30    |  12.4    |
  +--------------------+-------+-----------+---------+----------+

  Key Finding: Incident-triggered reviews have fastest turnaround
  (urgency drives action). Personnel change triggers have slowest
  (ownership transfer is a bottleneck). Recommendation: Implement
  automatic backup-SME assignment for personnel departures.

RETIREMENT PROGRAM:
  Assets reviewed for retirement: 180
  Assets retired: 112 (62%)
    - No access in 24+ months: 68
    - Superseded by newer asset: 28
    - No longer applicable (process/equipment removed): 16
  Assets retained (still relevant): 52
  Assets requiring update before decision: 16

  Impact: Removing 112 outdated assets from search results
  reduced "outdated result" complaints by 45% (user feedback data).

COST-BENEFIT ANALYSIS:
  Investment:
    - KM Administrator time: 320 hours (Q1-Q2) = $28,800
    - SME review time: 1,200 hours (Q1-Q2) = $144,000
    - Tool configuration: $15,000
    Total Investment: $187,800

  Value Generated:
    - Regulatory compliance gap closure: avoided est. $250,000 in
      potential OSHA citations (5 expired procedures x avg $50K)
    - Incident prevention: 2 near-misses traced to outdated procedures
      in Q1 (pre-program); 0 in Q2 (post-improvement). Estimated
      incident cost avoidance: $500,000+
    - Time savings: 15% reduction in time spent verifying document
      currency before use. For 200 knowledge workers: 3,000 hours/year
      = $270,000/year in productivity
    Total Estimated Annual Value: $1,020,000+

  ROI: 5.4x (first year projected)

NEXT QUARTER TARGETS:
  1. Achieve 90% overall currency score
  2. Achieve 100% critical asset currency (currently 96.5%)
  3. Complete all overdue OSHA annual certifications
  4. Implement automated MOC-to-knowledge trigger pipeline
  5. Onboard 3 additional SMEs in maintenance domain (capacity gap)
  6. Launch self-service currency check tool for knowledge consumers
```
