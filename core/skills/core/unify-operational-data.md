# Unify Operational Data

## Skill ID: N-01

## Version: 1.0.0

## Category: N. Integration & Decision

## Priority: P1 - High (foundational for data-driven decision-making and operational intelligence)

---

## Purpose

Unify operational data from siloed enterprise systems into a single source of truth that enables consistent, reliable, and timely decision-making across all operational functions. This skill transforms the fragmented data landscape of industrial facilities -- where critical information is trapped in 8-15 disconnected systems -- into an integrated data architecture with defined master data, quality rules, and unified dashboards that empower operators, engineers, and managers to make data-driven decisions with confidence.

The data fragmentation problem in industrial operations is pervasive and severely underestimated. A typical mining, oil and gas, or chemical processing facility operates with a constellation of disconnected information systems: ERP (SAP, Oracle) for financial and procurement data, CMMS (SAP PM, Maximo, Infor EAM) for maintenance management, SCADA/DCS (Honeywell, ABB, Yokogawa) for real-time process data, LIMS (Laboratory Information Management System) for quality data, document management systems for procedures and drawings, HR systems for workforce data, safety databases for incident and risk data, and specialized systems for environmental monitoring, energy management, and production planning. Each system was implemented independently, often by different vendors, at different times, with different data models, naming conventions, and update frequencies. The result is a fragmented data landscape where the same physical asset may be identified differently in each system, KPIs calculated from different sources produce conflicting numbers, and no single view of operational performance exists.

The business impact of data silos is substantial and well-documented. McKinsey research indicates that only 20-30% of data collected in industrial operations is actually used for decision-making; the remainder is trapped in silos, degraded in quality, or inaccessible to the people who need it. Gartner estimates that poor data quality costs organizations an average of $12.9 million per year. In industrial operations specifically, data silos contribute to delayed maintenance decisions (increasing unplanned downtime by 15-25%), inconsistent reporting to management and regulators (creating compliance risk), duplicated data entry (wasting 10-15% of administrative time), inability to perform cross-functional analytics (predictive maintenance, integrated planning), and conflicting performance reports that erode trust in data and drive decision-making back to intuition. The total productivity loss attributable to data fragmentation is estimated at 10-15% of revenue for industrial operations.

This skill addresses Pain Point M-04 (Data Utilization Gap) in the OR System framework. It establishes a systematic approach to data integration that begins with understanding the current data landscape, defines a target integration architecture, establishes master data governance, implements data quality rules, designs integration interfaces (ETL/API), and specifies unified dashboards that bring together process, maintenance, safety, quality, and financial data into a coherent operational picture. The skill integrates with MCP servers for direct connection to enterprise systems, process historians, and analytical tools.

---

## Intent & Specification

### Problem Statement

Industrial facilities invest millions in operational technology (OT) and information technology (IT) systems, yet the data produced by these systems remains fragmented across organizational and technological boundaries. Maintenance teams cannot easily access process data to correlate equipment condition with operating parameters. Operations cannot view maintenance backlogs alongside production plans. Safety teams cannot integrate incident data with process deviations and training records. Management receives conflicting KPI reports from different systems. This fragmentation prevents the organization from leveraging its data assets for predictive analytics, integrated planning, and real-time operational intelligence.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Current State Data Landscape Mapping**: Inventory all existing data systems in the facility, documenting their purpose, data content, data model, update frequency, data owners, user base, interfaces (existing or planned), and data quality characteristics. Create a comprehensive map of the current data architecture including data flows between systems.

2. **Data Source Inventory and Classification**: For each identified data source, catalog the specific data elements available, their definitions, formats, quality, and business criticality. Classify data into categories: master data (relatively static reference data), transactional data (event-driven records), time-series data (process measurements), and unstructured data (documents, images, comments).

3. **Data Quality Assessment**: Evaluate the quality of data in each source system across six dimensions defined by ISO 8000 and DAMA-DMBOK: completeness (are all required fields populated?), accuracy (does data reflect reality?), consistency (same data in different systems match?), timeliness (is data current?), uniqueness (no unwanted duplicates?), and validity (data conforms to defined rules?). Quantify data quality issues and estimate the business impact of poor quality.

4. **Master Data Definition**: Define the master data entities that must be consistent across all systems: equipment/asset master (physical hierarchy, attributes, classifications), material master (spare parts, consumables, chemicals), organizational structure (cost centers, work centers, functional locations), personnel master (employees, roles, competencies), and vendor/customer master. For each master entity, define the authoritative source system (system of record) and the data governance rules.

5. **Integration Architecture Design**: Design the target integration architecture following ISA-95 (enterprise-control integration) standards, defining: which systems need to exchange data, what data elements flow between systems, the integration pattern (real-time API, batch ETL, event-driven, data lake), the integration technology platform, and the data transformation and mapping rules.

6. **Data Quality Rules and Governance**: Establish automated data quality rules that will be applied at data creation, integration, and consumption points. Define data governance roles: data owners (accountable for data quality), data stewards (responsible for day-to-day data management), and data consumers (who use the data and report quality issues).

7. **Unified Dashboard Specification**: Design the specifications for unified operational dashboards that bring together data from multiple systems to provide cross-functional visibility. Define dashboard audiences, KPIs, data sources, refresh rates, drill-down capabilities, and alert thresholds.

8. **Validation and Rollout Planning**: Define the validation approach to verify that integrated data is accurate and complete. Plan the phased rollout of data integration, starting with the highest-value use cases and building incrementally.

---

## Trigger / Invocation

```
/unify-operational-data
```

**Aliases**: `/data-integration`, `/data-unification`, `/unificar-datos`, `/integracion-datos`

**Natural Language Triggers (EN)**:
- "Unify operational data across our systems"
- "Create a data integration architecture"
- "Map our data sources and define a single source of truth"
- "Design a master data management strategy"
- "Assess data quality across our operational systems"
- "Specify a unified operational dashboard"
- "Break down data silos between maintenance and operations"

**Natural Language Triggers (ES)**:
- "Unificar los datos operacionales entre nuestros sistemas"
- "Crear una arquitectura de integracion de datos"
- "Mapear nuestras fuentes de datos y definir una unica fuente de verdad"
- "Disenar una estrategia de gestion de datos maestros"
- "Evaluar la calidad de datos en nuestros sistemas operacionales"
- "Especificar un dashboard operacional unificado"
- "Romper los silos de datos entre mantenimiento y operaciones"

**Trigger Conditions**:
- New facility startup requires integration of newly implemented systems
- Management identifies conflicting KPIs from different data sources
- Digital transformation initiative requires data foundation
- Predictive maintenance or advanced analytics project requires integrated data
- Regulatory reporting reveals data inconsistencies across systems
- Organizational efficiency study identifies data entry duplication
- OR framework assessment identifies data integration as a readiness gap

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `system_inventory` | .xlsx, text | List of all IT/OT systems in the facility: system name, vendor, version, purpose, primary users, data content summary |
| `facility_description` | .docx, text | Description of the facility including process type, organizational structure, operational functions, and key business processes |
| `business_requirements` | .docx, text | Key business questions and decisions that require integrated data. What do managers, engineers, and operators need to know that they currently cannot easily access? |
| `organizational_structure` | .xlsx | Organizational chart with roles, departments, and reporting lines for data governance assignment |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `system_documentation` | .pdf, .docx | Technical documentation for each system: data models, data dictionaries, interface specifications |
| `existing_interfaces` | .xlsx | Current system integrations: source, target, data elements, frequency, technology |
| `data_samples` | .xlsx, .csv | Sample data extracts from key systems for quality assessment |
| `kpi_definitions` | .xlsx | Current KPI definitions including data sources, calculation formulas, and known discrepancies |
| `it_architecture` | .pdf, .docx | Current IT infrastructure documentation: servers, networks, databases, middleware |
| `compliance_requirements` | .xlsx | Data-related compliance requirements (regulatory reporting, audit trails, data retention) |
| `digital_strategy` | .docx | Organization's digital transformation strategy and roadmap |
| `budget_constraints` | .xlsx | Available budget for data integration technology and implementation |
| `asset_register` | .xlsx | Equipment/asset register for master data cross-referencing |
| `maintenance_data` | .xlsx | Maintenance work orders and history for data quality assessment |
| `process_data_historian` | Historian export | Sample process data for time-series integration assessment |

### Context Enrichment

The agent will automatically enrich the data integration plan by:
- Querying connected systems (via MCP servers) for data schema and sample data
- Cross-referencing asset identifiers across systems to detect inconsistencies
- Analyzing data update patterns to determine optimal integration frequencies
- Benchmarking the facility's data maturity against industry frameworks (DAMA-DMBOK)
- Identifying industry-standard integration patterns for the specific system combination
- Reviewing ISA-95 models for the facility's industry sector

### Input Validation Rules

- System inventory must include at minimum: system name, vendor, primary function, and key data entities
- Business requirements must specify at least 5 cross-functional questions that require integrated data
- Organizational structure must identify potential data owners for key functional areas
- If existing interfaces exist, they must be documented to avoid duplication or conflict
- Data samples (if provided) must include column headers and data type descriptions

---

## Output Specification

### Deliverable 1: Data Integration Architecture (.docx)

**Filename**: `{ProjectCode}_Data_Integration_Architecture_v{version}_{date}.docx`

**Document Structure (30-45 pages)**:

1. **Executive Summary** (2-3 pages)
   - Current state data landscape overview
   - Key data challenges and business impact
   - Target state integration architecture summary
   - Implementation roadmap and investment overview
   - Expected benefits and ROI estimate

2. **Current State Assessment** (5-8 pages)
   - System inventory with data landscape diagram
   - Data flow map (current integrations and manual transfers)
   - Data quality assessment summary
   - Pain point analysis by functional area:
     - Operations: process data accessibility, production reporting
     - Maintenance: work order to process correlation, spare parts visibility
     - HSE: incident data to process/training correlation
     - Finance: cost allocation accuracy, budget vs. actual
     - Management: KPI consistency, reporting timeliness
   - Data maturity assessment using DAMA-DMBOK maturity model

3. **Business Requirements Analysis** (3-4 pages)
   - Cross-functional decision requirements mapped to data needs
   - Use case prioritization matrix (business value vs. implementation complexity)
   - Critical data pathways: which data flows are most important for operations?
   - Future-state analytics requirements (predictive maintenance, digital twin, AI/ML)

4. **Target State Architecture** (5-8 pages)
   - ISA-95 integration model applied to the facility:
     - Level 0-2: Physical process and control (SCADA/DCS)
     - Level 3: Manufacturing operations management (MES/MOM)
     - Level 4: Business planning and logistics (ERP)
   - Integration architecture diagram showing:
     - All systems and their data flows
     - Integration layer (middleware, API gateway, data platform)
     - Master data management hub
     - Data warehouse / data lake
     - Analytics and reporting layer
   - Integration patterns by data type:
     - Real-time process data: OPC-UA to historian to dashboard
     - Transactional data: API/ETL between CMMS/ERP/HR
     - Master data: Hub-and-spoke synchronization
     - Document data: Enterprise content management
   - Technology platform recommendations

5. **Master Data Management** (3-5 pages)
   - Master data entity definitions
   - System of Record designation per entity
   - Data governance model: owners, stewards, consumers
   - Master data matching and deduplication rules
   - Master data lifecycle management

6. **Data Quality Framework** (3-4 pages)
   - Data quality dimensions and measurement methods
   - Quality rules by data entity and system
   - Quality monitoring and reporting approach
   - Data cleansing strategy for existing data
   - Ongoing data quality assurance processes

7. **Integration Design Specifications** (5-8 pages)
   - For each integration point:
     - Source and target systems
     - Data elements exchanged
     - Transformation and mapping rules
     - Integration pattern (real-time, batch, event-driven)
     - Frequency and latency requirements
     - Error handling and retry logic
     - Monitoring and alerting
   - API specifications (for real-time integrations)
   - ETL job specifications (for batch integrations)

8. **Implementation Roadmap** (3-4 pages)
   - Phased implementation plan:
     - Phase 1: Master data alignment and critical integrations
     - Phase 2: Operational dashboards and reporting
     - Phase 3: Advanced analytics and predictive capabilities
   - Timeline with milestones
   - Resource requirements per phase
   - Risk assessment and mitigation
   - Budget estimate per phase

9. **Governance and Operations** (2-3 pages)
   - Data governance organizational structure
   - Roles and responsibilities matrix (RACI)
   - Data governance policies and procedures
   - Change management for data structures
   - Training requirements for data stewards

10. **Appendices**
    - Detailed system inventory
    - Data dictionary (key entities and attributes)
    - Integration mapping tables
    - Technology evaluation matrix
    - Vendor comparison (if applicable)

### Deliverable 2: Master Data Model (.xlsx)

**Filename**: `{ProjectCode}_Master_Data_Model_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Entity Overview"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Entity_ID | Unique entity identifier | MDM-EQP-001 |
| B | Entity_Name | Master data entity name | Equipment Master |
| C | Entity_Description | Full description of the entity | Physical asset record containing all equipment attributes, hierarchy position, and technical data |
| D | System_of_Record | Authoritative source system | SAP PM (CMMS) |
| E | Secondary_Systems | Other systems containing this data | SCADA (tag mapping), DMS (drawings), Safety DB (risk data) |
| F | Record_Count | Approximate number of records | 3,500 |
| G | Data_Owner | Business owner responsible for data quality | Maintenance Manager |
| H | Data_Steward | Person responsible for day-to-day data management | Maintenance Planner Lead |
| I | Update_Frequency | How often data changes | Low (new equipment, modifications, decommissions) |
| J | Sync_Frequency | How often systems are synchronized | Real-time for critical attributes, daily batch for all |
| K | Quality_Score | Current data quality assessment (1-5) | 3.2 |
| L | Critical_Attributes | Most important attributes for this entity | Equipment_Tag, Description, Functional_Location, Criticality, Status |

#### Sheet 2: "Equipment Master"
- Complete attribute definition for the equipment master data entity
- Attribute name, description, data type, format, valid values, source system, mapping to other systems
- Business rules for equipment identification, naming conventions, and hierarchy

#### Sheet 3: "Material Master"
- Complete attribute definition for the material/spare parts master data entity
- Attributes: material number, description, classification, unit of measure, storage location, reorder point, lead time, vendor, cost
- Cross-reference: material-to-equipment (bill of materials)

#### Sheet 4: "Organizational Master"
- Cost centers, work centers, functional locations, planning groups
- Mapping between organizational entities across systems

#### Sheet 5: "Personnel Master"
- Employee attributes relevant to operational systems
- Competency, certification, and authorization data
- System access and role assignments

#### Sheet 6: "Cross-Reference Matrix"
- Mapping table: how the same entity is identified in each system
- Equipment tag in CMMS vs. SCADA tag vs. ERP asset number vs. DMS document reference
- Matching rules and confidence levels

#### Sheet 7: "Data Governance Rules"
- For each master data entity and attribute:
  - Mandatory/optional classification
  - Valid value ranges or domain values
  - Format and naming convention rules
  - Change authorization requirements
  - Audit trail requirements

### Deliverable 3: Data Quality Report (.xlsx)

**Filename**: `{ProjectCode}_Data_Quality_Report_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Quality Dashboard"
- Overall data quality score by system and by entity
- Quality dimension scores: completeness, accuracy, consistency, timeliness, uniqueness, validity
- Trend analysis (if historical data available)
- Top 10 data quality issues by business impact

#### Sheet 2: "Quality Assessment Detail"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | System | Source system assessed | SAP PM |
| B | Entity | Data entity | Equipment Master |
| C | Attribute | Specific attribute | Functional_Location |
| D | Records_Assessed | Number of records evaluated | 3,500 |
| E | Completeness_Score | % of records with this attribute populated | 87% |
| F | Accuracy_Score | % of records with correct values (verified against source) | 92% |
| G | Consistency_Score | % of records consistent across systems | 71% |
| H | Timeliness_Score | % of records updated within acceptable timeframe | 85% |
| I | Uniqueness_Score | % of records that are not unwanted duplicates | 94% |
| J | Validity_Score | % of records conforming to defined business rules | 88% |
| K | Overall_Quality_Score | Weighted average of all dimensions | 86% |
| L | Issue_Description | Description of quality issues found | 13% of equipment missing functional location assignment; 29% inconsistency between CMMS and SCADA tag naming |
| M | Business_Impact | Impact of the quality issue | Incorrect cost allocation for 13% of equipment; maintenance work orders not linked to correct process data |
| N | Remediation_Action | Recommended action to fix | Mass data update to assign functional locations; tag naming convention alignment project |
| O | Remediation_Effort | Estimated effort (hours/days) | 40 hours (data steward + system admin) |
| P | Priority | Critical / High / Medium / Low | High |

#### Sheet 3: "Consistency Analysis"
- Cross-system comparison for shared data elements
- Discrepancy counts and examples
- Root cause of inconsistencies (naming conventions, update timing, manual entry errors)

#### Sheet 4: "Quality Rules Catalog"
- All defined data quality rules
- Rule ID, description, data entity, attribute, validation logic
- Automated vs. manual check classification
- Check frequency

#### Sheet 5: "Remediation Plan"
- Prioritized data cleansing activities
- Timeline, resource requirements, and dependencies
- Expected quality improvement targets

### Deliverable 4: Unified Dashboard Specification (.docx)

**Filename**: `{ProjectCode}_Unified_Dashboard_Specification_v{version}_{date}.docx`

**Document Structure (20-30 pages)**:

1. **Dashboard Strategy** (2-3 pages)
   - Dashboard portfolio overview (which dashboards for which audiences)
   - Design principles (actionable, real-time where needed, drill-down capable)
   - Technology platform specification (Power BI, Tableau, OSIsoft PI Vision, custom)
   - Refresh rate and data latency requirements by dashboard

2. **Executive Operations Dashboard** (3-4 pages)
   - Audience: Plant Manager, Operations VP, Site Leadership
   - KPIs: Overall equipment effectiveness (OEE), production vs. plan, safety metrics (TRIR, SIFR), environmental compliance, maintenance backlog, workforce availability
   - Data sources: ERP (production/financial), CMMS (maintenance), SCADA (process), Safety DB (incidents), HR (attendance)
   - Layout specification with wireframe
   - Drill-down paths: summary > department > area > equipment

3. **Operations Dashboard** (3-4 pages)
   - Audience: Control Room Operators, Shift Supervisors, Process Engineers
   - KPIs: Real-time process performance, production rates, quality parameters, utility consumption, shift targets vs. actual
   - Data sources: SCADA/DCS (real-time), LIMS (quality), ERP (production plan)
   - Refresh rate: Real-time (5-15 second update)
   - Alert thresholds and escalation rules

4. **Maintenance Dashboard** (3-4 pages)
   - Audience: Maintenance Planner, Maintenance Manager, Reliability Engineers
   - KPIs: Backlog (hours and aging), PM compliance, MTBF/MTTR, equipment availability, work order completion rate, spare parts availability
   - Data sources: CMMS (work orders, PM schedule), SCADA (equipment runtime, alarms), ERP (spare parts inventory, costs)
   - Predictive indicators: equipment condition trends, alarm frequency patterns

5. **HSE Dashboard** (3-4 pages)
   - Audience: HSE Manager, Site Manager, Corporate HSE
   - KPIs: Incident rates (TRIR, LTIFR, SIFR), near-miss reporting rate, corrective action closure rate, training completion, environmental monitoring compliance, audit findings
   - Data sources: Safety DB (incidents, actions), Training/LMS (completion), Environmental monitoring, CMMS (safety work orders)

6. **Integrated Analysis Views** (3-4 pages)
   - Cross-functional analytics specifications:
     - Equipment health: combining process data, maintenance history, and inspection results
     - Cost attribution: linking maintenance costs to process area, equipment, and failure type
     - Workforce effectiveness: correlating training, experience, shift patterns with performance
     - Compliance status: combining regulatory requirements, monitoring data, and reporting status
   - Data lake / analytics platform requirements

7. **Technical Specifications** (3-4 pages)
   - Data source connections and authentication
   - Data transformation and calculation logic for each KPI
   - Caching strategy for performance optimization
   - Mobile responsiveness and offline capability requirements
   - Security and role-based access control
   - Backup and disaster recovery for dashboard platform

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| ISA-95 (IEC 62264) | Enterprise-control system integration -- Defines the standard model for integrating enterprise (ERP/Level 4) and control (SCADA-DCS/Level 0-2) systems through the manufacturing operations management layer (Level 3). Provides the canonical reference architecture for industrial data integration |
| OPC-UA (IEC 62541) | Open Platform Communications Unified Architecture -- The standard for industrial interoperability enabling secure, reliable, and platform-independent data exchange between industrial automation systems and enterprise IT systems |
| ISO 8000 | Data quality -- International standard for defining and measuring data quality. Provides the framework for data quality assessment, improvement, and governance |
| DAMA-DMBOK (Data Management Body of Knowledge) | Comprehensive framework for data management practices including data governance, data architecture, data quality, master data management, and metadata management |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| ISA-88 (IEC 61512) | Batch control standard -- Relevant for batch process data integration and recipe management |
| ISA-18.2 (IEC 62682) | Alarm management -- Standard for alarm data integration and analysis across SCADA/DCS systems |
| ISO 14224:2016 | Petroleum, petrochemical, and natural gas industries -- Collection and exchange of reliability and maintenance data. Provides the standard taxonomy for equipment classification and failure data |
| ISO 55000:2014 | Asset management -- Framework for data requirements supporting asset management decisions |
| MIMOSA (Machinery Information Management Open Systems Alliance) | Open standards for operations and maintenance data exchange in asset-intensive industries |
| B2MML (Business To Manufacturing Markup Language) | XML implementation of ISA-95 for system integration |

### Key Frameworks

**ISA-95 Functional Hierarchy Applied to Data Integration**:

| Level | Name | Systems | Data Type | Integration Pattern |
|-------|------|---------|-----------|---------------------|
| Level 4 | Business Planning & Logistics | ERP, Finance, HR, Procurement | Transactional, master data | API/ETL, daily-weekly batch |
| Level 3 | Manufacturing Operations Management | CMMS, MES, LIMS, Quality, Scheduling | Transactional, workflow | API/ETL, near-real-time to hourly |
| Level 2 | Monitoring, Supervisory Control | SCADA, HMI, Historians | Time-series, alarm events | OPC-UA, real-time streaming |
| Level 1 | Sensing, Manipulation | PLC, DCS controllers | Real-time measurement | OPC-UA, sub-second |
| Level 0 | Physical Process | Sensors, actuators, instruments | Raw signals | Direct wiring, fieldbus |

**DAMA-DMBOK Data Management Areas**:
1. **Data Governance**: Policies, standards, roles, responsibilities
2. **Data Architecture**: Models, integration, data flow design
3. **Data Modeling and Design**: Conceptual, logical, physical data models
4. **Data Storage and Operations**: Database management, backup, performance
5. **Data Security**: Access control, encryption, privacy
6. **Data Integration and Interoperability**: ETL, API, data exchange
7. **Document and Content Management**: Unstructured data management
8. **Reference and Master Data**: Master data management, code lists
9. **Data Warehousing and Business Intelligence**: Analytics, reporting
10. **Metadata Management**: Data about data, catalogs, lineage
11. **Data Quality**: Assessment, improvement, monitoring

**Data Quality Dimensions (ISO 8000)**:

| Dimension | Definition | Measurement Method | Target |
|-----------|-----------|-------------------|--------|
| Completeness | All required data elements are present | % of mandatory fields populated | >98% |
| Accuracy | Data correctly represents the real-world entity | Verification against source/field audit | >95% |
| Consistency | Same data in different systems has same values | Cross-system comparison | >95% |
| Timeliness | Data is up-to-date and available when needed | Age of data vs. acceptable latency | >95% |
| Uniqueness | No unwanted duplicate records | Duplicate detection analysis | >99% |
| Validity | Data conforms to defined business rules and formats | Validation against rules catalog | >98% |

---

## Step-by-Step Execution

### Phase 1: Discovery and Assessment (Steps 1-4)

**Step 1: Map the Current Data Landscape**
- Inventory all IT and OT systems in the facility:
  - System name, vendor, version, deployment date
  - Primary purpose and functional area served
  - Key data entities and approximate record counts
  - Data model type (relational, time-series, document, hybrid)
  - User base: who accesses data, how many users, frequency
  - System owner and technical support contact
- Create the system landscape diagram showing:
  - All systems and their relationships
  - Existing interfaces and data flows
  - Manual data transfers (spreadsheets, email, paper)
  - Data islands (systems with no interfaces)
- Classify systems by ISA-95 level

**Step 2: Inventory Data Sources and Elements**
- For each system, catalog the key data entities and attributes:
  - Entity name (e.g., Equipment, Work Order, Process Measurement)
  - Key attributes with data types and formats
  - Business definitions for each attribute
  - Data volumes and growth rates
  - Update frequency (real-time, daily, weekly, event-driven)
  - Data retention policies
- Identify data that exists in multiple systems (redundancy map)
- Map cross-system identifiers (how is the same asset identified in each system?)
- Document data access methods (API, database query, file export, web service)

**Step 3: Assess Data Quality**
- For each key data entity in each system, evaluate the six quality dimensions:
  - **Completeness**: Query for null/blank values in mandatory fields
  - **Accuracy**: Sample verification of data against source records or field audit
  - **Consistency**: Cross-system comparison of shared data elements (same equipment, same tag, same material)
  - **Timeliness**: Check data freshness (last update timestamp vs. expected update frequency)
  - **Uniqueness**: Run duplicate detection on key identifiers
  - **Validity**: Check data against defined business rules (valid value ranges, format standards)
- Quantify quality scores per entity, per system, per dimension
- Identify the root causes of quality issues:
  - Data entry errors (lack of validation, poor UI design)
  - Integration failures (interfaces not running, mapping errors)
  - Process gaps (no defined process for data creation/update)
  - Naming convention inconsistencies (different conventions in different systems)
  - Stale data (records not updated after changes)
- Estimate the business impact of identified quality issues

**Step 4: Analyze Business Requirements for Integrated Data**
- Interview key stakeholders (or analyze provided requirements) to identify:
  - What decisions require data from multiple systems?
  - What reports currently require manual data compilation?
  - What KPIs have known discrepancies between systems?
  - What analytics or insights are desired but cannot be produced?
  - What regulatory reports require data from multiple sources?
- Prioritize use cases by business value and feasibility:
  - **Quick wins**: High value, low complexity (e.g., aligning equipment tags)
  - **Strategic**: High value, high complexity (e.g., predictive maintenance data platform)
  - **Tactical**: Medium value, low complexity (e.g., automated report generation)
  - **Future state**: Medium value, high complexity (e.g., digital twin)
- Define specific KPIs and their data source mapping
- Document latency requirements (how quickly must data be available?)

### Phase 2: Architecture Design (Steps 5-8)

**Step 5: Define Master Data Model**
- For each master data entity (equipment, material, organizational, personnel, vendor):
  - Define the authoritative source (system of record)
  - Define the canonical data model (standard attributes, naming conventions, valid values)
  - Define matching rules for cross-system record linking
  - Define data governance: who creates, who updates, who approves changes
  - Define the synchronization strategy to secondary systems
- Build the cross-reference mapping:
  - Equipment: CMMS tag <> SCADA tag <> ERP asset number <> DMS document reference
  - Material: CMMS material number <> ERP material number <> vendor part number
  - Location: CMMS functional location <> ERP cost center <> SCADA area/unit
- Define naming convention standards for all new data creation
- Design the master data lifecycle: create, validate, approve, distribute, update, retire

**Step 6: Design Integration Architecture**
- Select the integration architecture pattern:
  - **Point-to-point**: Simple but does not scale (acceptable for <5 systems)
  - **Enterprise Service Bus (ESB)**: Middleware-mediated integration (suitable for transactional data)
  - **Data Lake/Warehouse**: Centralized data store (suitable for analytics and reporting)
  - **Hybrid**: Combination of real-time integration and data lake (recommended for most industrial facilities)
- For each required data flow, define:
  - Source system and target system
  - Data elements to be exchanged
  - Transformation rules (format conversion, unit conversion, code mapping)
  - Integration pattern: real-time API, near-real-time streaming, batch ETL
  - Frequency and acceptable latency
  - Error handling: what happens if the integration fails?
  - Monitoring: how will integration health be tracked?
- Design the technology stack:
  - OPC-UA gateway for SCADA/DCS integration
  - API layer (REST/SOAP) for enterprise system integration
  - ETL tools for batch data movement
  - Data platform for central storage and analytics
  - Metadata catalog for data discovery

**Step 7: Establish Data Quality Rules and Governance**
- Define automated data quality rules:
  - **At creation**: Mandatory field checks, format validation, duplicate detection, reference data validation
  - **At integration**: Cross-system consistency checks, transformation validation, completeness verification
  - **At consumption**: Freshness checks, anomaly detection, threshold alerting
- Design the data quality monitoring dashboard:
  - Quality scores by system, entity, and dimension
  - Quality trend analysis
  - Data quality issue log with remediation tracking
- Define the data governance organizational structure:
  - **Data Governance Council**: Senior leaders who set data policy and resolve disputes
  - **Data Owners**: Business managers accountable for data quality in their domain
  - **Data Stewards**: Practitioners responsible for day-to-day data management
  - **Data Engineers**: Technical staff who build and maintain integrations
  - **Data Consumers**: All users who access data, with responsibility to report issues
- Develop data governance policies:
  - Data creation and change management policy
  - Data quality standards and acceptable thresholds
  - Data access and security policy
  - Data retention and archival policy
  - Data issue resolution process

**Step 8: Specify Unified Dashboards**
- For each identified dashboard audience:
  - Define the dashboard purpose and key questions it answers
  - List all KPIs with precise definitions:
    - KPI name and business definition
    - Calculation formula
    - Data sources (system, entity, attribute)
    - Refresh rate requirement
    - Target values and alert thresholds
    - Drill-down capability (from summary to detail)
  - Design the layout wireframe:
    - Information hierarchy (most important KPIs prominent)
    - Visualization types (gauges, trend charts, tables, heat maps)
    - Filter and navigation controls
    - Mobile and desktop layouts
  - Define alert and notification rules:
    - Threshold-based alerts (KPI exceeds limit)
    - Trend-based alerts (KPI degrading over time)
    - Missing data alerts (expected data not received)
    - Notification channels: in-dashboard, email, Teams, SMS

### Phase 3: Implementation Planning (Steps 9-12)

**Step 9: Design ETL/API Specifications**
- For each integration point defined in Step 6, develop detailed specifications:
  - **Source extraction**: SQL queries, API calls, OPC subscriptions, or file exports
  - **Transformation logic**: Field mapping, data type conversion, unit conversion, code translation, calculated fields, aggregation rules
  - **Target loading**: Insert/update logic, conflict resolution, error records handling
  - **Scheduling**: Execution frequency, time windows, dependencies on other jobs
  - **Monitoring**: Success/failure alerting, row count validation, quality checks post-load
- For real-time integrations:
  - API endpoint definitions (URL, method, authentication, request/response format)
  - Event subscription configuration (OPC-UA, MQTT, webhook)
  - Latency and throughput requirements
  - Failover and retry policies
- For batch integrations:
  - ETL job sequence and dependency chains
  - Data staging and validation steps
  - Incremental vs. full load strategies
  - Recovery and restart procedures

**Step 10: Define Data Validation Approach**
- Design the validation framework:
  - **Unit testing**: Each integration point validated individually (correct data mapping, no data loss)
  - **Integration testing**: End-to-end data flow from source to dashboard verified
  - **User acceptance testing**: Business users verify data accuracy and dashboard usability
  - **Reconciliation testing**: Source system counts and totals match integrated data
- Define test scenarios and expected results for each integration
- Plan data migration validation (for initial loading of historical data)
- Define the parallel run period (old and new reporting running simultaneously)

**Step 11: Plan Phased Implementation**
- Define implementation phases:
  - **Phase 1 (Foundation, Months 1-3)**: Master data alignment, equipment cross-referencing, CMMS-ERP integration for cost reporting
  - **Phase 2 (Operations, Months 3-6)**: SCADA-to-historian-to-dashboard integration, real-time operations dashboard, process-maintenance correlation
  - **Phase 3 (Analytics, Months 6-12)**: Data lake build-out, advanced analytics, predictive maintenance data pipeline, HSE integrated reporting
  - **Phase 4 (Optimization, Months 12-18)**: Machine learning models, digital twin data feeds, automated regulatory reporting
- For each phase:
  - Deliverables and acceptance criteria
  - Resource requirements (data engineers, system administrators, business analysts, vendor support)
  - Budget allocation
  - Risk assessment and mitigation
  - Dependencies on other OR activities

**Step 12: Develop Change Management and Training Plan**
- Identify stakeholders affected by data integration:
  - Who will use new dashboards and reports?
  - Who will change their data entry practices?
  - Who will take on data governance roles?
  - Who will lose existing (familiar) reports?
- Develop the change management approach:
  - Communication plan: why data integration matters, what will change, when
  - Training plan for data stewards, dashboard users, and governance council members
  - Champion network: identify early adopters to drive adoption
  - Feedback mechanism: how users report issues and suggest improvements
- Develop training materials:
  - Dashboard user guides
  - Data entry standards and best practices
  - Data governance procedures
  - Data quality issue reporting process

### Phase 4: Validation and Delivery (Steps 13-16)

**Step 13: Validate Data Integration Outputs**
- Cross-validate all deliverables:
  - Architecture document reviewed by IT, OT, and business stakeholders
  - Master data model reviewed by data owners for each entity
  - Data quality report reviewed by system administrators and data stewards
  - Dashboard specifications reviewed by intended audience
- Verify technical feasibility:
  - Confirm connectivity to all source systems is possible
  - Verify API availability and documentation for enterprise systems
  - Confirm OPC-UA or historian access for process data
  - Validate technology platform compatibility

**Step 14: Finalize Data Governance Framework**
- Confirm data governance roles and secure organizational commitment:
  - Data Governance Council members confirmed
  - Data Owner assignments confirmed per entity
  - Data Steward assignments confirmed per system
- Publish data governance policies and procedures
- Establish the governance cadence:
  - Monthly data quality review meetings
  - Quarterly governance council meetings
  - Annual data governance maturity assessment

**Step 15: Produce Implementation Package**
- Compile all deliverables into a complete implementation package:
  - Data Integration Architecture document
  - Master Data Model workbook
  - Data Quality Report and remediation plan
  - Unified Dashboard Specification
  - Detailed ETL/API specifications (technical appendix)
  - Implementation project plan with resource and budget requirements
  - Change management and training plan
- Present to project leadership for approval and funding

**Step 16: Store and Distribute Outputs**
- Store all deliverables in the project document management system (via mcp-sharepoint)
- Distribute architecture document to IT, OT, and business leadership
- Distribute data quality report to data owners and stewards
- Distribute dashboard specifications to operations, maintenance, HSE, and management
- Configure document version control for ongoing updates
- Schedule the first quarterly data governance review

---

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| System coverage (all operational systems mapped) | 20% | 100% | >95% | Audit of system inventory against IT/OT asset list |
| Master data entity completeness (all key entities defined) | 15% | 100% | >95% | Review of master data model against business requirements |
| Data quality assessment depth (all key entities assessed) | 15% | 100% of key entities across all systems | >90% | Coverage analysis of quality assessment report |
| Integration specification completeness (all required data flows defined) | 15% | 100% of prioritized use cases | >90% | Cross-check of integration specs against business requirements |
| Dashboard specification coverage (all audiences and KPIs defined) | 10% | All 4 audience dashboards specified | >3 dashboards | Review of dashboard specification document |
| Stakeholder validation (approval from data owners and IT) | 10% | >95% approval | >90% | Sign-off tracking from review process |
| Implementation feasibility (technically achievable with available technology) | 10% | 100% of Phase 1 verified | >90% | Technical feasibility review with IT team |
| Standards alignment (ISA-95, ISO 8000, DAMA-DMBOK) | 5% | Full alignment | Major elements aligned | Standards compliance review |

### Automated Quality Checks

- [ ] Every system in the facility has been inventoried with required attributes
- [ ] Every system has been classified by ISA-95 level
- [ ] Every master data entity has a defined system of record
- [ ] Every master data entity has an assigned data owner and data steward
- [ ] Cross-reference mapping exists for equipment across all systems
- [ ] Data quality has been assessed across all six dimensions for key entities
- [ ] Every business requirement has been mapped to data sources and integration points
- [ ] Every KPI in the dashboard specification has a defined calculation formula and data sources
- [ ] Every integration point has a defined pattern (API/ETL/streaming), frequency, and error handling
- [ ] Data governance roles are assigned to named individuals
- [ ] Implementation roadmap has defined phases, timelines, and resource requirements
- [ ] Data quality remediation plan is prioritized and resourced
- [ ] Dashboard wireframes are defined for all specified audiences
- [ ] Technology platform recommendations are justified with evaluation criteria

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-asset-register` | Equipment master data and hierarchy for cross-system alignment | Critical | mcp-cmms |
| `create-kpi-dashboard` | KPI definitions and reporting requirements for dashboard specification | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory reporting data requirements for compliance integration | High | mcp-sharepoint |
| `track-incident-learnings` (L-02) | Incident data structure and integration needs for safety dashboards | Medium | mcp-incident-db |
| `plan-training-program` (M-04) | Training data integration requirements for workforce dashboards | Medium | mcp-lms |
| `create-maintenance-strategy` | Maintenance data requirements for reliability analytics | High | mcp-cmms |
| `assess-digital-maturity` | Current digital maturity baseline and improvement targets | Medium | mcp-sharepoint |
| `create-or-framework` | OR data requirements and readiness metrics | High | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `create-kpi-dashboard` | Integrated data architecture enabling cross-functional KPI calculations | Critical | mcp-excel |
| `analyze-reliability` | Integrated process + maintenance data for reliability analysis | High | mcp-cmms, mcp-scada |
| `analyze-failure-patterns` | Correlated failure data across CMMS, SCADA, and quality systems | High | mcp-cmms |
| `benchmark-maintenance-kpis` | Consistent, quality-assured maintenance data for benchmarking | Medium | mcp-cmms |
| `model-opex-budget` | Integrated cost data for OPEX modeling | Medium | mcp-erp |
| `generate-performance-report` | Unified data feed for automated performance reporting | High | mcp-excel |
| `generate-esg-report` | Integrated environmental, safety, and social data for ESG reporting | Medium | mcp-sharepoint |
| `audit-compliance-readiness` | Data quality and governance evidence for compliance auditing | Medium | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Integrated data enabling automated regulatory reporting | Medium | mcp-sharepoint |

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-erp` (SAP/Oracle) | Connect to ERP system for financial, procurement, material, and organizational master data extraction and integration | `query_master_data`, `extract_transactions`, `get_cost_data`, `query_material_master`, `get_organizational_structure` |
| `mcp-cmms` (SAP PM/Maximo) | Connect to CMMS for maintenance master data, work orders, failure history, PM schedules, and spare parts data | `query_equipment_master`, `extract_work_orders`, `get_failure_data`, `query_pm_schedule`, `get_spare_parts_bom` |
| `mcp-scada` | Connect to SCADA/DCS historian for real-time and historical process data, alarms, and events | `subscribe_tags`, `query_historian`, `get_alarm_data`, `extract_trends`, `configure_calculations` |
| `mcp-excel` | Generate and format the master data model, data quality report, and analysis workbooks | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |
| `mcp-sharepoint` | Store all deliverables as controlled documents and distribute to stakeholders | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `share_with_team` |

---

## Templates & References

### Templates
- `templates/data_integration_architecture_template.docx` - Architecture document with ISA-95 framework and VSC branding
- `templates/master_data_model_template.xlsx` - Master data model workbook with entity sheets and governance rules
- `templates/data_quality_assessment_template.xlsx` - Quality assessment workbook with scoring and visualization
- `templates/dashboard_specification_template.docx` - Dashboard spec with wireframe layouts and KPI definitions
- `templates/system_inventory_template.xlsx` - System landscape inventory template
- `templates/etl_specification_template.xlsx` - ETL/API technical specification template

### Reference Documents
- ISA-95 (IEC 62264) Enterprise-Control System Integration Parts 1-5
- OPC-UA Specification (IEC 62541) Parts 1-14
- ISO 8000 Data Quality Series
- DAMA-DMBOK2: Data Management Body of Knowledge (2nd Edition, 2017)
- ISO 14224:2016 - Petroleum and natural gas industries: Reliability and maintenance data
- ISA-18.2 (IEC 62682) - Management of Alarm Systems
- VSC Data Integration Standard v1.5
- McKinsey: "Industry 4.0: Capturing Value at Scale in Discrete Manufacturing"
- Gartner: "Measuring the Business Value of Data Quality" (2023)

### Reference Datasets
- Standard system landscape for mining operations (typical systems and interfaces)
- Standard system landscape for oil and gas operations
- ISA-95 model mapping templates for common ERP/CMMS/SCADA combinations
- Equipment tag naming convention standards (ISO 14224, KKS, RDS-PP)
- OPC-UA tag mapping templates for major DCS/SCADA vendors
- Master data attribute catalogs for equipment, material, and organizational entities
- Data quality benchmark scores by industry

---

## Examples

### Example 1: Copper Mine and Concentrator - Atacama Region, Chile

**Input:**
- Facility: Open-pit copper mine with concentrator plant, 80,000 TPD
- Systems:
  - SAP ECC (ERP): Finance, procurement, HR, payroll
  - SAP PM (CMMS): Maintenance management, 3,500 equipment records
  - Honeywell Experion (DCS): Process control, 12,000 I/O points
  - OSIsoft PI (Historian): Process data archive, 8,000 tags
  - Wenco Fleet Management: Mine fleet dispatching and productivity
  - Modular Mining (Dispatch): Truck-shovel assignment and haulage
  - LIMS (LabWare): Assay and metallurgical accounting
  - GIS (ArcGIS): Spatial data, mine planning, environmental monitoring
  - Isometrix: Safety, environment, and risk management
  - SharePoint: Document management
  - Kronos: Workforce time and attendance
- Key Pain Points: Equipment tags differ between SAP PM and PI; maintenance costs not linked to production loss; no integrated view of mine-to-mill performance; safety incidents not correlated with process deviations

**Expected Output:**
- Data Integration Architecture:
  - ISA-95 model mapped to 11 systems across Levels 0-4
  - 14 integration points defined (6 real-time via OPC-UA, 8 batch via ETL)
  - Hybrid architecture: OPC-UA gateway + ETL middleware + data lake
  - Phase 1 (Foundation): Equipment master alignment (SAP PM <> PI tag mapping: 3,500 equipment to 8,000 tags)
  - Phase 2 (Operations): Mine-to-mill data flow integration; real-time operations dashboard
  - Phase 3 (Analytics): Predictive maintenance data pipeline; integrated cost-per-ton analysis

- Master Data Model:
  - 5 master data entities defined with 287 attributes total
  - Equipment cross-reference: SAP PM tag <> PI tag <> Wenco equipment ID <> Isometrix asset code
  - 23% of equipment records have inconsistent naming between SAP PM and PI (requiring remediation)

- Data Quality Report:
  - Overall quality score: 71% (target: 90%)
  - Critical issue: 31% of SAP PM equipment records missing cost center assignment
  - Critical issue: 18% of PI tags not mapped to SAP PM equipment
  - Estimated business impact of quality issues: $2.1M/year in misallocated costs and missed optimization

- Unified Dashboards: 4 dashboards specified
  - Executive: OEE, cost-per-ton, safety metrics, production vs. plan
  - Operations: Real-time process performance, mine-to-mill KPIs, quality
  - Maintenance: Backlog aging, PM compliance, equipment availability, cost
  - HSE: Incident trends, corrective actions, environmental compliance

### Example 2: Gas Processing Plant - Biobio Region, Chile

**Input:**
- Facility: Natural gas processing and compression, 50 MMSCFD
- Systems:
  - SAP S/4HANA (ERP): Finance, procurement, HR
  - IBM Maximo (CMMS): Maintenance management, 1,200 equipment records
  - ABB 800xA (DCS): Process control, 4,500 I/O points
  - ABB Ability (Historian): Process data, 3,200 tags
  - Enablon: HSE management
  - SharePoint: Document management
  - ADP: HR and payroll
- Key Pain Points: Maximo work orders not linked to ABB process data; cannot correlate equipment trips with process conditions; regulatory environmental reporting requires manual data compilation from 3 systems; spare parts in Maximo not synchronized with SAP procurement

**Expected Output:**
- Data Integration Architecture:
  - ISA-95 model mapped to 7 systems
  - 9 integration points (3 real-time, 6 batch)
  - Focus: Maximo-ABB integration for condition-based maintenance; Maximo-SAP synchronization for procurement
  - Technology: ABB Ability edge gateway (OPC-UA) + MuleSoft middleware + Azure data platform

- Master Data Model:
  - Equipment cross-reference: Maximo asset <> ABB tag <> SAP functional location
  - Material synchronization: Maximo item master <> SAP material master (1,800 items)

- Data Quality Report:
  - Overall quality score: 76%
  - Key issue: 22% of Maximo equipment records have no ABB tag mapping
  - Key issue: Material descriptions inconsistent between Maximo and SAP for 35% of items

- Unified Dashboards: 3 dashboards specified
  - Operations: Gas processing rates, quality, compressor performance, utility consumption
  - Maintenance: Compressor health, vibration trends, PM compliance, spare parts availability
  - HSE: Environmental monitoring (emissions, discharges), safety metrics, regulatory compliance status
