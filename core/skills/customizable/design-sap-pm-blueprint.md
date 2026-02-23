# Design SAP PM/MM Implementation Blueprint
## Skill ID: AM-SAP-01
## Version: 1.0.0
## Category: D. Technical Deliverables
## Priority: P1 - High

---

## Purpose

Design the complete configuration blueprint for SAP PM (Plant Maintenance) and SAP MM (Materials Management) implementation for a greenfield mining project in Chile. This skill produces a fully specified, CMMS-ready blueprint that covers every dimension of the SAP PM/MM module configuration: organizational structure, functional location hierarchy, equipment master data, classification system, notification types, work order types, maintenance strategies, task lists, PM-MM integration for spare parts and procurement, Fiori mobile applications, SAP APM (Asset Performance Management), Chilean regulatory mapping (DS 132 / SERNAGEOMIN), and outline agreements for O&M contracts.

This skill is **specifically optimized for SAP** -- not for generic CMMS platforms. It reflects SAP-specific transaction codes, table structures, master data concepts, and configuration objects (IMG paths). The target context is **gran mineria en Chile** (Codelco, BHP, Antofagasta Minerals, SQM, Teck QB2, Anglo American, Lundin Mining), where SAP S/4HANA is the dominant ERP platform. Mining operations in Chile present unique SAP configuration challenges: high-altitude desert environments, extreme equipment duty cycles (24/7/365 at >3,500 meters above sea level), bilingual master data requirements (Spanish operational / English technical), Chilean regulatory frameworks (DS 132, SERNAGEOMIN reporting, SEC electrical regulations), and complex integration with process historians (OSIsoft PI, AVEVA) for condition-based maintenance.

A properly designed SAP PM/MM blueprint accelerates implementation by 30-40%, reduces post-go-live configuration rework by 60-70%, and ensures that maintenance data structures support downstream analytics, reliability engineering, and asset performance management from Day 1.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **SAP-Native Design**: Every configuration element must reference actual SAP objects -- transaction codes (IW21, IW31, IP10, IA05, etc.), table names (IFLO, EQUI, AUFK, QMEL, etc.), IMG configuration paths, and standard SAP field names. Generic CMMS terminology is insufficient; the blueprint must be directly implementable by an SAP ABAP/functional consultant.

2. **Functional Location Hierarchy as Foundation**: The FL hierarchy is the backbone of the entire SAP PM configuration. It must be designed with 6-7 levels following the standard mining hierarchy: Site > Plant > Area > System > Equipment Train > Major Component > Sub-Component. Naming conventions must be concise (SAP FLOC limited to 40 characters), meaningful, and extensible.

3. **Chilean Mining Context**: The blueprint must account for the specific regulatory, operational, and organizational context of Chilean copper/lithium mining:
   - DS 132 (Reglamento de Seguridad Minera) mandatory inspection requirements mapped to SAP PM07 order type
   - SERNAGEOMIN maintenance log reporting via SAP notification history
   - Chilean labor code considerations for shift patterns and maintenance crew rostering
   - Bilingual master data (Spanish descriptions for operators, English for technical/OEM reference)
   - Integration with Chilean procurement practices (framework contracts, service entry sheets for contratistas)

4. **PM-MM Integration as Critical Path**: The interface between Plant Maintenance and Materials Management is where most SAP implementations fail. The blueprint must specify every integration point: material reservations from PM orders, purchase requisition generation for non-stock items, service procurement for contractor work, MRP profiles by spare part type, and stock category management.

5. **VSC Failure Modes Table to SAP Catalog Mapping**: The blueprint must demonstrate a 1:1 mapping between the 72 failure mode combinations in the VSC Failure Modes Table (18 mechanisms x 46 causes) and SAP catalog profiles (damage code groups, cause code groups). This creates a standardized failure coding system that enables reliability analytics directly from SAP data.

6. **Mobile-First Operations**: Modern mining maintenance requires SAP Fiori apps for field execution. The blueprint must specify which Fiori apps to deploy, how they integrate with the PM/MM backend, and what offline capabilities are required for underground or remote pit operations with limited connectivity.

7. **Condition-Based Maintenance Integration**: The blueprint must address SAP APM (Asset Performance Management) configuration for predictive maintenance, including integration with historian systems (OSIsoft PI, AVEVA Wonderware), machine learning anomaly detection setup, and measuring point/counter configuration in SAP PM.

---

## VSC Failure Modes Table -- SAP Catalog Mapping

**MANDATORY RULE:** The SAP catalog profile configuration designed by this skill MUST create a direct 1:1 mapping between the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) and SAP PM catalog codes.

### Mapping Logic

| VSC FM Table Element | SAP PM Catalog Object | SAP Transaction | SAP Table |
|----------------------|----------------------|-----------------|-----------|
| Failure Mechanism (18 types) | Damage Code Group (e.g., WEAR, CORR, CRAC) | QS41 | QPCT |
| Failure Cause (46 types) | Cause Code (within cause code group) | QS41 | QPCT |
| FM Combination (72 entries) | Catalog Profile (assigned per equipment class) | QS51 | QPAM |
| Equipment Class | Catalog Profile Assignment | QS51 | TQ80 |

### The 18 Damage Code Groups (from VSC FM Mechanisms)

| VSC Mechanism | SAP Damage Code Group | SAP Code | Description (ES) |
|---------------|----------------------|----------|------------------|
| Arcs | ARC | ARC-01 | Arco electrico |
| Blocks | BLK | BLK-01 | Bloqueo / obstruccion |
| Breaks/Fracture/Separates | BRK | BRK-01 | Rotura / fractura / separacion |
| Corrodes | COR | COR-01 | Corrosion |
| Cracks | CRK | CRK-01 | Fisura / agrietamiento |
| Degrades | DEG | DEG-01 | Degradacion |
| Distorts | DST | DST-01 | Deformacion |
| Drifts | DRF | DRF-01 | Deriva / descalibracion |
| Expires | EXP | EXP-01 | Expiracion / vencimiento |
| Immobilised (binds/jams) | IMM | IMM-01 | Inmovilizacion / atascamiento |
| Looses Preload | LPR | LPR-01 | Perdida de precarga |
| Open-Circuit | OPC | OPC-01 | Circuito abierto |
| Overheats/Melts | OVH | OVH-01 | Sobrecalentamiento / fusion |
| Severs (cut/tear/hole) | SEV | SEV-01 | Corte / desgarro / perforacion |
| Short-Circuits | SHC | SHC-01 | Cortocircuito |
| Thermally Overloads | THL | THL-01 | Sobrecarga termica |
| Washes Off | WSH | WSH-01 | Lavado / desprendimiento |
| Wears | WEA | WEA-01 | Desgaste |

### Compliance Rules

1. Every SAP catalog profile created in the blueprint MUST map to the VSC FM Table. No ad-hoc damage codes outside this taxonomy.
2. Cause codes within each damage code group MUST correspond to the 46 VSC causes (e.g., "Abrasion", "Contamination", "Cyclic loading", "Moisture ingress").
3. Catalog profiles are assigned per equipment class (e.g., PUMP_CENTRIFUGAL gets catalog profile CP-PUMP-CENT containing only the relevant damage/cause code combinations for that equipment type).
4. The mapping enables direct extraction of reliability data from SAP for Weibull analysis, Pareto charts, and MTBF/MTTR calculations using standardized failure coding.

---

## Trigger / Invocation

```
/design-sap-pm-blueprint
```

### Natural Language Triggers
- "Design SAP PM configuration for our mining project"
- "Create the SAP PM/MM blueprint for the concentrator plant"
- "Configure SAP Plant Maintenance module for a copper mine"
- "Build the CMMS blueprint using SAP for our greenfield project in Chile"
- "Disenar el blueprint de SAP PM/MM para el proyecto minero"
- "Configurar SAP PM para planta concentradora"

### Aliases
- `/sap-pm-blueprint`
- `/sap-pm-config`
- `/blueprint-sap-pm`
- `/configuracion-sap-pm`

---

## Input Requirements

### Required Inputs

| Input | Format | Description | Source |
|-------|--------|-------------|--------|
| Equipment Register / Asset Register | .xlsx, .csv | Master equipment list with FLOC hierarchy, tag numbers, criticality ratings, equipment types. Ideally from `create-asset-register` output | Client / Engineering / Agent |
| Plant Hierarchy Definition | .xlsx, .docx, text | Site structure: site, plants, areas, systems, equipment trains. Must include physical layout and process flow logic | Client / Engineering |
| Project Context | Text | Project name, mining type (copper, lithium, gold), plant capacity (TPD), location, altitude, client name, SAP system landscape (S/4HANA version, on-premise vs. cloud) | User |
| Maintenance Organization Structure | .xlsx, .docx | Maintenance departments, workshops, planner groups, craft disciplines, contractor scope | Client / Operations |

### Optional Inputs (Strongly Recommended)

| Input | Format | Default if Absent |
|-------|--------|-------------------|
| Criticality Analysis Results | .xlsx | Agent performs criticality assessment using VSC methodology |
| Maintenance Strategy Documents | .xlsx, .docx | Agent applies RCM-based strategy per `develop-maintenance-strategy` output |
| Spare Parts Strategy | .xlsx | Agent references `create-spare-parts-strategy` output for MM configuration |
| Existing SAP Configuration (brownfield) | .xlsx, .docx | Greenfield (blank configuration) assumed |
| Client SAP Naming Standards | .docx | VSC standard naming conventions applied |
| OEM Maintenance Manuals | .pdf | Generic OEM intervals by equipment type applied |
| DS 132 Compliance Register | .xlsx | Standard DS 132 requirements for mining applied |
| Process Historian Details | .docx | OSIsoft PI assumed as default historian |
| Mobile Strategy Requirements | .docx | Standard Fiori apps for mining maintenance assumed |
| Contractor Management Requirements | .docx | Standard Chilean contratista framework assumed |

### Input Validation Rules

- Equipment register must contain minimum: tag number, description, FLOC assignment, equipment type
- Plant hierarchy must have at least 4 levels (Site > Plant > Area > System)
- SAP system version must be specified (ECC 6.0 EHP8 or S/4HANA 20xx)
- Equipment without criticality ratings default to "B" with flag for review
- Missing organizational structure triggers a recommendation to complete before blueprint finalization

---

## Output Specification

### Primary Output: SAP PM/MM Blueprint Document (.docx)

**Filename**: `{ProjectCode}_SAP_PM_MM_Blueprint_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 80-120 pages (excluding appendices)

**Structure**:

```yaml
document:
  title: "SAP PM/MM Implementation Blueprint"
  subtitle: "{Project Name} - {Client Name}"
  sections:
    1_cover_page:
      - VSC branding, project identification, SAP system landscape
      - Blueprint version, approval matrix
    2_document_control:
      - Revision history, reviewers, distribution
    3_executive_summary:
      pages: 3-5
      content:
        - Blueprint scope and SAP module coverage
        - Key configuration decisions summary
        - Equipment count and hierarchy statistics
        - Integration architecture overview
        - Implementation timeline alignment
    4_sap_organizational_structure:
      pages: 5-8
      content:
        - Company code, controlling area, plant assignments
        - Maintenance plant (SWERK) configuration
        - Planning plant (IWERK) configuration
        - Work centers (workshops, field crews, contractors)
        - Planner groups by discipline
        - Maintenance activity types for cost allocation
        - ABC indicator configuration
    5_functional_location_hierarchy:
      pages: 10-15
      content:
        - Hierarchy design (6-7 levels with naming convention)
        - FL category configuration
        - FL structure indicators
        - Characteristics assignment at each level
        - Sample hierarchy trees by plant area
        - Numbering scheme and extensibility rules
    6_equipment_master_configuration:
      pages: 8-12
      content:
        - Equipment categories and object types
        - Equipment master data fields (mandatory/optional by criticality)
        - Equipment-to-FL assignment rules
        - Serial number management
        - Manufacturer and model master data
        - Equipment status management (user statuses)
    7_classification_system:
      pages: 8-10
      content:
        - Class types for equipment (002) and FL (003)
        - Equipment classes by type
        - Characteristics (nameplate data fields)
        - Search help configuration
        - Inherited characteristics through hierarchy
    8_notification_configuration:
      pages: 6-8
      content:
        - Standard notification types (M1, M2, M3)
        - Custom notification types (Z1-Z4)
        - Catalog profiles (damage, cause, activity codes)
        - VSC FM Table mapping to catalog codes
        - Notification workflow and authorization
    9_work_order_configuration:
      pages: 8-10
      content:
        - Order types PM01-PM08
        - Order status management (user statuses)
        - Settlement rules and cost allocation
        - Permit management integration
        - Order priority and scheduling parameters
    10_maintenance_strategies:
      pages: 8-10
      content:
        - Time-based strategies
        - Counter-based strategies
        - Condition-based strategies
        - Multi-package strategies
        - Scheduling parameters and tolerances
    11_task_list_design:
      pages: 6-8
      content:
        - General maintenance task lists
        - Equipment-specific task lists
        - Task list operations and sub-operations
        - Qualification requirements
        - Material assignments (BOM linkage)
    12_pm_mm_integration:
      pages: 10-12
      content:
        - Reservation flow (PM order to goods issue)
        - Purchase requisition generation
        - Service procurement (service entry sheets)
        - Material types for spare parts
        - MRP profiles by spare type
        - Stock categories and valuation
    13_sap_fiori_mobile:
      pages: 4-6
      content:
        - Fiori app selection and configuration
        - Offline capability for remote operations
        - Mobile notification creation
        - Mobile order confirmation
    14_sap_apm_integration:
      pages: 4-6
      content:
        - Predictive maintenance setup
        - Historian integration (PI/AVEVA)
        - Measuring points and counters
        - ML anomaly detection configuration
    15_ds132_regulatory_mapping:
      pages: 4-6
      content:
        - Statutory inspections to PM07 mapping
        - LOTO/permit management
        - SERNAGEOMIN reporting
        - Annual inspection calendar
    16_outline_agreements:
      pages: 4-6
      content:
        - Framework contracts for maintenance services
        - Service specifications and task catalogs
        - Price agreement types
    17_implementation_roadmap:
      pages: 3-5
      content:
        - Phase 1: Core configuration (FL, equipment, notifications, orders)
        - Phase 2: Strategy, task lists, PM plans
        - Phase 3: MM integration, Fiori, APM
        - Data migration approach
        - Testing and cutover plan
    appendices:
      - A: Complete FL hierarchy tree
      - B: Equipment master field specifications
      - C: Catalog code master list (VSC FM Table mapping)
      - D: SAP transaction code reference
      - E: IMG configuration path reference
```

### Secondary Output: SAP Configuration Workbook (.xlsx)

**Filename**: `{ProjectCode}_SAP_PM_MM_Config_Workbook_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**:

| Sheet | Content |
|-------|---------|
| FL Hierarchy | Complete functional location hierarchy with all levels, naming codes, descriptions (EN/ES) |
| Equipment Master | Equipment master records with all SAP fields populated |
| Classification | Classes, characteristics, and values for equipment classification |
| Catalog Codes | Damage codes, cause codes, activity codes mapped from VSC FM Table |
| Notification Types | Configuration of M1-M3 and Z1-Z4 notification types |
| Order Types | PM01-PM08 configuration with settlement rules |
| Maintenance Strategies | Strategy definitions with packages and scheduling parameters |
| Task Lists | General and equipment-specific task lists with operations |
| Material Types | MM material types, MRP profiles, and stock categories |
| Fiori Apps | Fiori app catalog with configuration parameters |
| Regulatory Mapping | DS 132 requirements mapped to SAP objects |
| Outline Agreements | Framework contract templates and service specifications |

### Formatting Standards

- Header row: Bold, SAP blue background (#0070AD), white font
- SAP transaction codes: monospace font (Consolas)
- SAP field names: `FIELD_NAME` format in code style
- Bilingual descriptions: EN column + ES column side by side
- Data validation dropdowns for all coded fields
- Conditional formatting: Red for mandatory fields missing data, Yellow for optional gaps
- Freeze panes on header row and key identifier columns

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **SAP S/4HANA PM Best Practices** | SAP-delivered scope items for plant maintenance configuration baseline |
| **ISO 14224:2016** | Equipment taxonomy and failure coding reference (supplemented by VSC FM Table for failure mode classification) |
| **ISO 55000/55001/55002** | Asset management system alignment -- SAP configuration must support ISO 55001 certification requirements |
| **SMRP Best Practice Metrics** | Maintenance KPI definitions that SAP reports must support |
| **SAE JA1011/JA1012** | RCM methodology -- SAP maintenance strategies must reflect RCM-based task selection |

### Chilean Regulatory Standards

| Standard | Application |
|----------|-------------|
| **DS 132** | Reglamento de Seguridad Minera -- Mandatory inspections, LOTO, maintenance records |
| **SERNAGEOMIN** | Mining regulator reporting requirements for maintenance and safety |
| **SEC (Superintendencia de Electricidad y Combustibles)** | Electrical installation inspection and maintenance requirements |
| **DS 594** | Reglamento sobre condiciones sanitarias y ambientales basicas en los lugares de trabajo |
| **NCh-ISO 9001** | Quality management system -- SAP processes must support QMS requirements |

### SAP Configuration Standards

| Standard | Application |
|----------|-------------|
| **SAP Activate Methodology** | Implementation methodology: Discover, Prepare, Explore, Realize, Deploy, Run |
| **SAP Best Practice Content** | Pre-configured business processes for mining industry |
| **SAP Fiori Design Guidelines** | UX standards for mobile app configuration |
| **ASAP Methodology** | Accelerated SAP implementation for PM/MM modules |

### VSC-Specific Standards

- VSC FLOC Naming Convention Standard v3.0
- VSC Equipment Classification Guide v2.1
- VSC Failure Modes Table (18 mechanisms, 46 causes, 72 combinations)
- VSC SAP PM Configuration Baseline (internal)
- VSC Catalog Profile Standard for Mining v1.0

---

## Step-by-Step Execution

### Phase 1: Scoping & Data Validation (Steps 1-3)

**Step 1: Receive and validate all inputs.**
- Parse the equipment register and validate FLOC hierarchy completeness
- Verify SAP system landscape information (S/4HANA version, client number, logical system)
- Count total equipment by type, area, criticality
- Validate organizational structure: plants, work centers, planner groups
- Confirm project context: mining type, capacity, location, altitude
- **Quality gate**: Equipment register >95% complete with FLOC assignments

**Step 2: Define SAP organizational structure.**
- Map client legal entity to SAP company code
- Define controlling area and cost center hierarchy for maintenance
- Configure maintenance plant (SWERK) -- typically one per mine site
- Configure planning plant (IWERK) -- same as SWERK for single-site operations
- Design work center hierarchy:
  - Workshops: Mechanical Workshop, Electrical Workshop, Instrument Workshop
  - Field Crews: Mechanical Field, Electrical Field, Lubrication Crew
  - Contractors: Major Contractor Work Center per contract scope
- Define planner groups by discipline:
  - 001 = Mechanical Planner
  - 002 = Electrical Planner
  - 003 = Instrumentation Planner
  - 004 = Civil/Structural Planner
  - 005 = Reliability Engineer
- Configure maintenance activity types for cost allocation:
  - PM1 = Internal Labor
  - PM2 = External Labor (Contractors)
  - PM3 = Materials
  - PM4 = External Services
- **Output**: SAP Organizational Structure configuration document

**Step 3: Design the Functional Location hierarchy.**
- Define 6-7 level hierarchy per project scope:
  - Level 1: Site (e.g., CL-MIN-FAE = Faena Minera)
  - Level 2: Plant (e.g., CL-MIN-FAE-CON = Concentradora)
  - Level 3: Area (e.g., CL-MIN-FAE-CON-MOL = Molienda)
  - Level 4: System (e.g., CL-MIN-FAE-CON-MOL-SAG = SAG Mill System)
  - Level 5: Equipment Train (e.g., CL-MIN-FAE-CON-MOL-SAG-01 = SAG Mill 01)
  - Level 6: Major Component (e.g., CL-MIN-FAE-CON-MOL-SAG-01-MOT = Motor)
  - Level 7: Sub-Component (optional, e.g., CL-MIN-FAE-CON-MOL-SAG-01-MOT-BRG = Bearing)
- Define FL structure indicator in SAP (transaction IL01):
  - Edit mask defining allowed characters and segment lengths per level
  - Hierarchy levels mapped to structure indicator segments
- Define FL category per level:
  - M = Mechanical/Process Equipment
  - E = Electrical Equipment
  - I = Instrumentation
  - S = Structural/Civil
- Assign characteristics per FL level using classification (CT04):
  - Level 1: Geographic coordinates, altitude, climate zone
  - Level 2: Plant capacity, process type, commissioning date
  - Level 3: Area function, environmental conditions
  - Level 4: System capacity, redundancy type (N+0, N+1, 2x100%)
  - Level 5-7: Equipment-specific attributes
- **Output**: Complete FL hierarchy tree with naming conventions

### Phase 2: Equipment & Classification Configuration (Steps 4-6)

**Step 4: Configure equipment categories and object types.**
- Define equipment categories (transaction IE01 / field EQART):
  - M = Mechanical Equipment
  - E = Electrical Equipment
  - I = Instrumentation and Control
  - V = Valves and Actuators
  - B = Buildings and Civil Structures
  - P = Piping Systems
- Define object types per category:
  - M: PUMP-CENT (centrifugal pump), PUMP-PD (positive displacement), COMP-CENT (centrifugal compressor), COMP-RECIP (reciprocating compressor), CONV-BELT (belt conveyor), CRUSH-JAW (jaw crusher), CRUSH-GYR (gyratory crusher), MILL-SAG (SAG mill), MILL-BALL (ball mill), SCRN-VIB (vibrating screen), CYCL-HYDR (hydrocyclone), THICK (thickener), FILT-PRESS (filter press), AGIT (agitator), FAN-CENT (centrifugal fan), BLWR (blower)
  - E: XFMR-PWR (power transformer), XFMR-DIST (distribution transformer), SWGR-HV (HV switchgear), SWGR-MV (MV switchgear), MCC (motor control center), MOT-HV (HV motor), MOT-LV (LV motor), VFD (variable frequency drive), GEN-DSEL (diesel generator), UPS (uninterruptible power supply), CABLE-HV (HV cable)
  - I: XMTR-PRESS (pressure transmitter), XMTR-FLOW (flow transmitter), XMTR-LEVEL (level transmitter), XMTR-TEMP (temperature transmitter), ANLZ (analyzer), PLC (programmable logic controller), DCS (distributed control system), CV (control valve), SV (solenoid valve), PSV (pressure safety valve)
  - V: VALVE-GATE, VALVE-GLOBE, VALVE-BALL, VALVE-BFLY, VALVE-CHECK, VALVE-PLUG, ACTUAT-PNEU, ACTUAT-ELEC, ACTUAT-HYDR
  - B: BLDG, SILO, TANK-STOR, PIPE-RACK, FOUND
  - P: PIPE-CS (carbon steel), PIPE-SS (stainless steel), PIPE-HDPE, PIPE-FRP
- Define equipment master data fields -- mandatory vs. optional by criticality:
  - Criticality A: ALL fields mandatory (nameplate, manufacturer, model, serial, weight, power, materials, P&ID ref, datasheet ref, warranty date)
  - Criticality B: Core fields mandatory (manufacturer, model, serial, power)
  - Criticality C: Minimum fields mandatory (manufacturer, model)
- **Output**: Equipment category and object type configuration

**Step 5: Design the classification system.**
- Define class type 002 (Equipment) and 003 (Functional Location) classes in transaction CL02:
  - PUMP_CENTRIFUGAL: capacity_m3h, head_m, power_kW, speed_rpm, material_casing, material_impeller, seal_type, manufacturer, model, serial_no
  - PUMP_PD: capacity_m3h, discharge_pressure_bar, power_kW, type (diaphragm/piston/gear/screw), material, manufacturer, model, serial_no
  - MOTOR_ELECTRIC: power_kW, voltage_V, current_A, speed_rpm, frame_size, enclosure_IP, insulation_class, duty_rating, manufacturer, model, serial_no
  - CRUSHER_JAW: capacity_tph, feed_opening_mm, CSS_mm, power_kW, weight_kg, manufacturer, model, serial_no
  - CRUSHER_GYRATORY: capacity_tph, mantle_diameter_mm, throw_mm, power_kW, weight_kg, manufacturer, model, serial_no
  - MILL_SAG: diameter_ft, length_ft, power_kW, speed_rpm, ball_charge_pct, liner_type, manufacturer, model, serial_no
  - MILL_BALL: diameter_ft, length_ft, power_kW, speed_rpm, ball_charge_pct, liner_type, manufacturer, model, serial_no
  - CONVEYOR_BELT: length_m, width_mm, speed_ms, capacity_tph, belt_type, belt_rating, inclination_deg, drive_power_kW, manufacturer, model
  - TRANSFORMER_POWER: capacity_MVA, voltage_primary_kV, voltage_secondary_kV, cooling_type, impedance_pct, vector_group, manufacturer, model, serial_no
  - VFD: power_kW, voltage_V, current_A, type (LV/MV), cooling_type, manufacturer, model, serial_no
  - SCREEN_VIBRATING: capacity_tph, deck_count, aperture_mm, amplitude_mm, frequency_hz, manufacturer, model, serial_no
  - THICKENER: diameter_m, depth_m, capacity_m3h, underflow_solids_pct, rake_drive_kW, manufacturer, model
  - HYDROCYCLONE: diameter_mm, vortex_finder_mm, spigot_mm, feed_pressure_bar, cut_size_um, manufacturer, model
- Configure search helps (transaction SE11) for key characteristics:
  - F4 help for manufacturer (linked to vendor master)
  - F4 help for material types (ASTM/EN standards)
  - F4 help for enclosure/IP ratings
- **Output**: Complete classification system design with classes and characteristics

**Step 6: Configure notification types and catalog profiles.**
- Standard notification types (transaction IW21, table QMEL):
  - M1 = Malfunction Report (equipment failure / averia)
  - M2 = Maintenance Request (preventive finding / hallazgo preventivo)
  - M3 = Activity Report (completed work documentation / informe de actividad)
- Custom notification types (IMG configuration):
  - Z1 = Operator Round Finding (hallazgo de ronda operacional)
  - Z2 = Condition Monitoring Alert (alerta de monitoreo de condicion)
  - Z3 = Statutory Inspection Finding (hallazgo de inspeccion reglamentaria)
  - Z4 = Safety Observation (observacion de seguridad -- HSE integration)
- Configure catalog profiles (transaction QS51):
  - Damage catalog: 18 code groups mapped from VSC FM Table mechanisms
  - Cause catalog: 46 codes mapped from VSC FM Table causes
  - Activity catalog: standard repair activities (replace, repair, adjust, clean, lubricate, inspect, calibrate, align, balance, overhaul)
- Assign catalog profiles per equipment class:
  - Each equipment class gets a tailored catalog profile containing only relevant damage/cause combinations
  - Example: PUMP_CENTRIFUGAL gets catalog profile CP-PUMP-CENT with damage codes WEA, COR, BRK, IMM, OVH, SEV and associated cause codes
- Configure notification workflow:
  - Priority levels: 1 = Emergency (immediate), 2 = Urgent (24h), 3 = Normal (planning cycle), 4 = Low (next opportunity)
  - Authorization: who can create, change, complete each notification type
  - Automatic work order generation from M1 priority 1/2 notifications
- **Output**: Notification type and catalog profile configuration

### Phase 3: Work Order & Strategy Configuration (Steps 7-10)

**Step 7: Configure work order types.**
- Define order types (transaction IW31, table AUFK / field AUART):
  - PM01 = Corrective Maintenance (Mantenimiento Correctivo -- breakdown/averia)
  - PM02 = Planned Corrective (Correctivo Planificado -- identified defect, planned repair)
  - PM03 = Preventive Maintenance (Mantenimiento Preventivo -- PM plan generated)
  - PM04 = Condition-Based Maintenance (Mantenimiento Basado en Condicion -- PdM triggered)
  - PM05 = Shutdown/Turnaround Work (Trabajo de Parada Mayor)
  - PM06 = Project/Modification Work (Trabajo de Proyecto/Modificacion -- CAPEX)
  - PM07 = Statutory Inspection (Inspeccion Reglamentaria -- DS 132 / SERNAGEOMIN)
  - PM08 = Operator Round (Ronda Operacional)
- Configure order status management (user statuses):
  - CRTD = Created
  - PLAN = Planned
  - SCHD = Scheduled
  - MATL = Materials Staged
  - PRMT = Permit Issued
  - RELD = Released for Execution
  - STRT = Work Started
  - PCNF = Partially Confirmed
  - CNFM = Technically Complete
  - TECO = Technically Closed
  - CLSD = Business Complete (settled)
- Configure settlement rules per order type:
  - PM01-PM04: Settle to cost center (OPEX maintenance budget)
  - PM05: Settle to internal order (shutdown budget)
  - PM06: Settle to WBS element (CAPEX project)
  - PM07: Settle to cost center (compliance budget)
  - PM08: Settle to cost center (operations budget)
- Configure permit management integration:
  - Link PM orders to permit-to-work system
  - LOTO isolation management (DS 132 compliance)
  - Hot work permits, confined space permits, height work permits
- **Output**: Work order type configuration with statuses and settlement rules

**Step 8: Design maintenance strategies.**
- Time-based strategies (transaction IP11):
  - STRAT-D = Daily (1 day cycle)
  - STRAT-W = Weekly (7 day cycle)
  - STRAT-M = Monthly (30 day cycle / 1 month)
  - STRAT-Q = Quarterly (90 day cycle / 3 months)
  - STRAT-S = Semi-Annual (180 day cycle / 6 months)
  - STRAT-A = Annual (365 day cycle / 12 months)
  - STRAT-2Y = Biennial (730 day cycle / 24 months)
  - STRAT-5Y = Major Overhaul (1825 day cycle / 60 months)
- Counter-based strategies (transaction IP11):
  - STRAT-OH = Operating Hours based (counter type: running hours)
  - STRAT-CY = Cycles based (counter type: start/stop cycles, crusher cycles)
  - STRAT-TN = Tonnage based (counter type: tonnes processed)
  - STRAT-KM = Distance based (counter type: kilometers traveled -- for haul trucks)
- Condition-based strategies:
  - Measuring points configured per equipment (transaction IK01)
  - Threshold alerts linked to notification generation (Z2 type)
  - Integration with historian data for automatic counter/measurement updates
  - CBM technologies mapped: vibration, thermography, oil analysis, ultrasound, motor current analysis
- Multi-package strategies:
  - Combine time and counter triggers (e.g., every 2000 hours OR 6 months, whichever comes first)
  - Package hierarchy: Package A (minor service) included in Package B (major service)
  - Scheduling parameters: call horizon (%), tolerance (%), shift factor for early/late scheduling
- Strategy packages with scheduling parameters:
  - Cycle modification factor for harsh environments (e.g., 0.8 for high-dust areas)
  - Scheduling period, call horizon, shift factor early/late, tolerance
  - Factory calendar assignment (Chilean holidays, mine-specific shutdown calendar)
- **Output**: Complete maintenance strategy configuration with all packages

**Step 9: Design task lists.**
- General maintenance task lists (transaction IA05, type A):
  - Created per equipment class (e.g., task list for all centrifugal pumps)
  - Operations represent standard maintenance steps
  - Each operation includes: description, estimated hours, work center (craft), qualification requirement
  - Material components linked to BOM
- Equipment-specific task lists (transaction IA05, type E):
  - Created for AA/A-critical equipment requiring specialized procedures
  - More detailed operations than general task lists
  - Equipment-specific safety precautions and LOTO requirements
  - Specific tooling and special equipment referenced
- Task list operations structure:
  - Operation 0010: Safety preparation / Isolation / LOTO
  - Operation 0020-nnnn: Maintenance work steps (sequential)
  - Operation nnnn: Reassembly / De-isolation
  - Operation nnnn: Functional test / Run-in
  - Operation nnnn: Documentation / Notification update
  - Sub-operations for parallel work within a single step
- Qualification requirements per operation:
  - Electrical: Licencia SEC Clase A/B/C/D
  - Mechanical: Certificacion de torque, alineamiento laser
  - Instrumentation: Calibracion certificada
  - Safety: Trabajo en altura, espacio confinado, LOTO autorizado
- Inspection rounds task lists:
  - Operator rounds (PM08): sensory checks, readings, minor adjustments
  - Predictive routes: vibration, thermography, oil sampling sequences
  - Statutory inspections: DS 132 mandated checks with sign-off points
- **Output**: Task list design specification with sample task lists

**Step 10: Configure PM-MM integration.**
- Reservation flow (PM order to material consumption):
  - PM order created with material components from task list BOM
  - SAP generates automatic reservation (transaction MB21 / movement type 261)
  - Warehouse picks materials against reservation
  - Goods issue posted (transaction MIGO / movement type 261)
  - If material unavailable: availability check triggers procurement
- Purchase requisition generation from PM orders:
  - Non-stock items in PM order generate purchase requisition (PR)
  - PR flow: PM order component (non-stock) -> PR (ME51N) -> PO (ME21N) -> GR (MIGO 101) -> IR (MIRO)
  - Direct procurement for emergency items with release strategy bypass
- Service procurement (contractor work):
  - Service entry sheets (transaction ML81N) for contractor time and materials
  - Service master records for standard maintenance services
  - Blanket PO for recurring services with service entry confirmation
  - Outline agreements (transaction ME31K) for framework contracts
- Material types for spare parts:
  - ERSA = Spare Parts (Repuestos) -- valuated, MRP-planned
  - HIBE = Operating Supplies / Consumables (Suministros Operacionales) -- consumables, batch-managed
  - NLAG = Non-Valuated Material (Material en Consignacion) -- consignment stock from vendor
  - IBAU = Maintenance Assemblies (Conjuntos de Mantenimiento) -- refurbishable/repairable items, serialized
  - DIEN = Services (Servicios) -- service master records for contractor work
- MRP profiles by spare part type:
  - VB = Manual Reorder Point (insurance/capital spares -- no automatic procurement; manual review required)
  - ND = No MRP (run-to-failure parts -- procured only on demand from PM order)
  - PD = MRP with Forecast (high-consumption consumables -- automatic PR generation on reorder point)
  - VV = Consumption-Based Planning (operational spares with predictable demand)
- Stock categories:
  - Unrestricted-use stock: Available for PM order consumption
  - Quality inspection stock: Parts received pending QC release
  - Blocked stock: Defective or quarantined parts
  - Consignment stock: Vendor-owned parts at client warehouse
  - In-transit stock: Parts between warehouse locations
- **Output**: PM-MM integration configuration specification

### Phase 4: Advanced Configuration & Regulatory Mapping (Steps 11-14)

**Step 11: Configure SAP Fiori apps for mobile maintenance.**
- Priority Fiori apps for mining maintenance:
  - **My Maintenance Notifications** (F0862): Create, display, and process maintenance notifications from mobile device. Supports offline mode for underground/remote operations.
  - **Maintenance Order Confirmation** (F1584): Confirm work order operations (time, activities, measurements) from field. Barcode/QR code scanning for equipment lookup.
  - **Equipment Lookup** (F0900): Search and display equipment master data, technical specifications, and maintenance history. Supports NFC/barcode scanning.
  - **Functional Location Overview** (F0893): Navigate FL hierarchy, view installed equipment, pending notifications, and open work orders per location.
  - **Maintenance Order Operations** (F2723): View and manage order operation details, material requirements, and work instructions.
  - **Malfunction Report** (F1602): Simplified notification creation for operators with photo attachment capability.
- Offline configuration:
  - Offline data sync strategy for areas without connectivity (pit, underground, remote substations)
  - Conflict resolution rules when multiple technicians update same order offline
  - Data package size optimization (FL subtree preload, limited history depth)
- **Output**: Fiori app configuration and deployment specification

**Step 12: Configure SAP APM (Asset Performance Management).**
- Predictive maintenance integration:
  - SAP Predictive Maintenance and Service (PdMS) configuration
  - Equipment models linking SAP equipment master to ML models
  - Alert-to-notification workflow: ML anomaly -> SAP notification Z2 -> work order PM04
- Historian integration:
  - OSIsoft PI integration via SAP Plant Connectivity (PCo)
  - AVEVA Historian integration via OPC-UA connector
  - Data mapping: historian tags to SAP measuring points
  - Automatic counter updates (operating hours, cycles, tonnage) from historian
- Measuring points and counters (transaction IK01):
  - Measuring points per equipment class (vibration, temperature, pressure, flow, current)
  - Counter types: operating hours (HOURS), cycles (CYCLES), tonnage (TONNES), distance (KM)
  - Threshold configuration: lower limit, upper limit, alert threshold, alarm threshold
  - Automatic notification generation on threshold exceedance
- ML anomaly detection:
  - Equipment model training using 6-12 months of historian data
  - Anomaly scoring for rotating equipment (pumps, mills, crushers, motors)
  - Health indicator calculation and trending
  - Integration with SAP Analytics Cloud for asset health dashboards
- **Output**: SAP APM configuration specification

**Step 13: Map DS 132 and Chilean regulatory requirements to SAP.**
- Statutory inspections mapped to SAP PM07 order type:
  - Pressure vessel inspections (DS 132 Art. 268-275) -> PM07 + strategy STRAT-A
  - Lifting equipment inspections (DS 132 Art. 276-285) -> PM07 + strategy STRAT-S
  - Electrical installation inspections (SEC regulations) -> PM07 + strategy STRAT-A
  - Fire protection system inspections -> PM07 + strategy STRAT-Q
  - Emergency vehicle inspections -> PM07 + strategy STRAT-M
- LOTO procedures mapped to SAP permit management:
  - DS 132 Articles on energy isolation (bloqueo y etiquetado)
  - Isolation points defined at FL level using characteristics
  - Permit-to-work prerequisite before PM order release to RELD status
  - Electronic sign-off via Fiori app
- SERNAGEOMIN maintenance log reporting:
  - Notification history (M1, M2, M3, Z1-Z4) constitutes the maintenance log
  - SAP report (transaction IW28, IW29, IW39) configured for SERNAGEOMIN extract format
  - Statutory notification Z3 provides audit trail for regulatory inspections
  - Annual reporting via SAP BW/Analytics Cloud dashboard
- Annual inspection plan mapped to SAP maintenance calendar:
  - All PM07 orders scheduled via SAP maintenance plan (transaction IP10)
  - Calendar view in SAP (transaction IP19) showing statutory due dates
  - Automatic call generation 30 days before due date
  - Escalation workflow for overdue statutory inspections
- **Output**: DS 132/SERNAGEOMIN regulatory mapping to SAP configuration

**Step 14: Configure outline agreements for O&M contracts.**
- Framework contracts (transaction ME31K):
  - Contract type MK (quantity contract) for recurring spare parts supply
  - Contract type WK (value contract) for maintenance service packages
  - Target quantity/value based on annual maintenance budget allocation
  - Validity period: typically 1-3 years with renewal options
- Service specifications:
  - Service master records (transaction AC03) for standard maintenance activities
  - Task catalogs linking service lines to SAP task list operations
  - Performance standards and SLA definitions embedded in service specifications
  - Penalty/bonus clauses linked to KPI measurement in SAP
- Price agreement types:
  - Unit rate contracts: price per service unit (e.g., CLP/hour for mechanical labor)
  - Lump sum contracts: fixed price for defined scope (e.g., annual conveyor belt replacement program)
  - Cost-plus contracts: reimbursable with overhead/profit percentage (for variable scope work)
  - Schedule of rates: pre-agreed rates for common activities (published in outline agreement)
- Integration with PM order settlement:
  - Contractor PM orders reference outline agreement
  - Service entry sheet (ML81N) created against outline agreement
  - Automatic price determination from agreement conditions
  - Budget control via commitment management and funds management
- **Output**: Outline agreement configuration for O&M contracts

### Phase 5: Validation & Deliverable Generation (Steps 15-16)

**Step 15: Cross-validation and quality assurance.**
- Validate FL hierarchy:
  - Every equipment item has a valid FL assignment (no orphans)
  - Naming convention consistency across all levels
  - No duplicate FL codes
  - Parent-child relationships are logically consistent
- Validate catalog profile coverage:
  - Every equipment class has an assigned catalog profile
  - All 18 VSC FM mechanisms mapped to damage code groups
  - All 46 VSC FM causes mapped to cause codes
  - No orphan catalog codes without equipment class assignment
- Validate PM-MM integration:
  - Material types correctly assigned per spare part category
  - MRP profiles match spare part criticality (VED classification)
  - Reservation and PR generation paths tested conceptually
- Validate regulatory mapping:
  - Every DS 132 mandatory inspection has a corresponding SAP PM07 maintenance plan
  - LOTO requirements linked to FL isolation points
  - SERNAGEOMIN reporting data available from SAP notification history
- Validate strategy completeness:
  - Every AA/A-critical equipment has at least one maintenance strategy assigned
  - All strategy packages have valid scheduling parameters
  - Task lists linked to maintenance plans
- **Output**: Validation report with findings and resolutions

**Step 16: Generate blueprint document and configuration workbook.**
- Compile all configuration outputs into the blueprint document (.docx):
  - Apply VSC document template with branding
  - Include configuration screenshots / mockups where applicable
  - Executive summary synthesizing key decisions
  - Implementation roadmap with dependencies and timeline
- Generate SAP configuration workbook (.xlsx):
  - All sheets populated per output specification
  - Data validation applied to all coded fields
  - Cross-sheet references verified
  - Print areas and formatting finalized
- Peer review checklist:
  - SAP functional consultant review for technical accuracy
  - Maintenance SME review for operational completeness
  - Client review for organizational alignment
- **Output**: Final blueprint document and configuration workbook

---

## Quality Criteria

### Content Quality (Target: >91% SME Approval Rate)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| SAP Technical Accuracy | 25% | All SAP transaction codes, table names, field names, and IMG paths are correct and current for stated SAP version | SAP functional consultant review |
| FL Hierarchy Completeness | 20% | Hierarchy covers all equipment in register; naming convention is consistent, concise, and extensible | Automated hierarchy validation; cross-check with equipment register |
| PM-MM Integration Correctness | 20% | Reservation flow, PR generation, service procurement, and material types correctly specified | SAP MM consultant review; end-to-end process walkthrough |
| VSC FM Table Mapping Accuracy | 15% | 1:1 mapping between 72 FM combinations and SAP catalog codes; catalog profiles correctly assigned per equipment class | Automated cross-reference check; catalog profile audit |
| Regulatory Compliance | 10% | All DS 132 mandatory inspections mapped; SERNAGEOMIN reporting requirements addressed | Regulatory compliance specialist review |
| Implementability | 10% | Blueprint is directly usable by SAP implementation team without ambiguity; IMG paths, field values, and configuration steps are specific enough for realization | SAP basis/ABAP consultant review |

### Automated Quality Checks

- [ ] Every equipment in register has a valid FL assignment
- [ ] FL naming convention follows defined pattern at every level
- [ ] No duplicate FL codes in hierarchy
- [ ] Every equipment class has a catalog profile assigned
- [ ] All 18 VSC FM mechanisms mapped to SAP damage code groups
- [ ] All 46 VSC FM causes mapped to SAP cause codes
- [ ] All 8 work order types (PM01-PM08) have settlement rules defined
- [ ] All maintenance strategies have valid scheduling parameters
- [ ] Every AA/A-critical equipment has at least one task list
- [ ] PM-MM material types cover all spare part categories (ERSA, HIBE, NLAG, IBAU, DIEN)
- [ ] MRP profiles assigned per material type
- [ ] All DS 132 inspections mapped to PM07 maintenance plans
- [ ] Fiori apps specified with offline configuration for remote operations
- [ ] Outline agreement types cover all contractor scenarios
- [ ] Bilingual descriptions (EN/ES) provided for all master data

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `create-asset-register` (A-ASSET-REG-001) | Equipment register with FLOC hierarchy, criticality ratings, ISO 14224 classification | Critical | mcp-sharepoint |
| `develop-maintenance-strategy` (MAINT-01) | RCM-based maintenance tasks, CBM program, task frequencies, failure modes from VSC FM Table | Critical | Internal |
| `create-spare-parts-strategy` (A-SPARE-PARTS-001) | VED-ABC classified spare parts master, MRP recommendations, insurance spares list | Critical | Internal |
| Agent 9 (Asset Management) | Asset management policy, lifecycle objectives, AM maturity assessment | High | mcp-sharepoint |
| Agent 1 (Project Intelligence) | Project scope, timeline, organizational structure | High | mcp-sharepoint |
| `map-regulatory-requirements` | DS 132 compliance register, SERNAGEOMIN requirements | High | Internal |
| `create-org-design` | Maintenance organization structure, planner groups, craft disciplines | Medium | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| SAP Implementation Team | Complete configuration blueprint and workbook | Direct handoff |
| `create-maintenance-manual` | SAP-specific procedure references (transaction codes, order types) | Sequential |
| `create-kpi-dashboard` | SAP report specifications for KPI extraction (IW28, IW39 variants) | Automatic |
| `optimize-mro-inventory` (K-02) | SAP MM configuration baseline for inventory optimization | Sequential |
| `create-training-plan` | SAP PM/MM training requirements for maintenance staff and planners | Automatic |
| `track-or-deliverables` | SAP configuration milestone tracking | Automatic |
| `audit-compliance-readiness` | Regulatory mapping completeness for compliance audit | On request |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-framework` | Alignment | SAP PM blueprint scope must align with OR framework system boundaries and timeline |
| `create-commissioning-plan` | Coordination | CMMS go-live must precede commissioning; commissioning data loads into SAP |
| `assess-am-maturity` | Baseline | SAP configuration maturity targets derived from AM maturity assessment |
| `develop-samp` (Strategic Asset Management Plan) | Strategic alignment | SAP PM configuration must support SAMP objectives and KPIs |

---

## Templates & References

### Document Templates
- `VSC_SAP_PM_Blueprint_Template_v2.0.docx` -- Blueprint document template with VSC branding and section structure
- `VSC_SAP_PM_Config_Workbook_Template_v2.0.xlsx` -- Configuration workbook with all sheets pre-formatted
- `VSC_SAP_FL_Hierarchy_Template_Mining_v1.0.xlsx` -- FL hierarchy template for mining projects
- `VSC_SAP_Catalog_Profile_Template_v1.0.xlsx` -- Catalog profile template with VSC FM Table pre-mapped

### Reference Documents
- SAP S/4HANA Plant Maintenance Configuration Guide (SAP Help Portal)
- SAP Best Practices for Mining (SAP Scope Item J58: Plant Maintenance)
- ISO 14224:2016 Equipment Taxonomy Tables (Annex A)
- DS 132 Reglamento de Seguridad Minera (full text)
- SERNAGEOMIN Maintenance Reporting Guidelines
- VSC Failure Modes Table (18 mechanisms, 46 causes, 72 combinations)
- VSC FLOC Naming Convention Standard v3.0
- VSC Equipment Classification Guide v2.1
- SMRP Best Practice Metrics for Maintenance KPIs

### Reference Datasets
- SAP Transaction Code Reference for PM/MM modules
- SAP IMG Path Reference for Plant Maintenance configuration
- SAP Fiori App Library for Asset Management
- Chilean mining regulatory requirements register
- Standard equipment object type codes for mining industry

---

## Examples

### Example 1: SAP PM Blueprint for 100,000 TPD Copper Mine Concentrator

**Project**: Proyecto Cobre Verde -- 100,000 TPD copper concentrator
**Client**: Minera del Pacifico S.A.
**SAP System**: S/4HANA 2023, on-premise
**Equipment Count**: 2,847 equipment items across 6 plant areas

**SAP Organizational Structure**:

```
Company Code:       CL01 (Minera del Pacifico S.A.)
Controlling Area:   CL01
Maintenance Plant:  CL01 (Faena Cobre Verde)
Planning Plant:     CL01
Work Centers:
  MECH-SHOP  = Taller Mecanico (15 FTE)
  ELEC-SHOP  = Taller Electrico (8 FTE)
  INST-SHOP  = Taller Instrumentacion (5 FTE)
  MECH-FIELD = Mecanicos de Campo (25 FTE)
  ELEC-FIELD = Electricistas de Campo (12 FTE)
  LUBR-CREW  = Equipo de Lubricacion (4 FTE)
  CONTR-MECH = Contratista Mecanico (Austral Maintenance)
  CONTR-ELEC = Contratista Electrico (Sigdo Koppers)
Planner Groups:
  001 = Planificador Mecanico (2 FTE)
  002 = Planificador Electrico (1 FTE)
  003 = Planificador Instrumentacion (1 FTE)
  004 = Planificador Civil (1 FTE, shared)
  005 = Ingeniero de Confiabilidad (1 FTE)
```

**Functional Location Hierarchy (Sample -- Molienda Area)**:

```
Level 1: CL-CV                          (Site: Faena Cobre Verde)
Level 2: CL-CV-CON                      (Plant: Concentradora)
Level 3: CL-CV-CON-MOL                  (Area: Molienda)
Level 4: CL-CV-CON-MOL-SAG             (System: SAG Mill System)
         CL-CV-CON-MOL-BOL             (System: Ball Mill System)
         CL-CV-CON-MOL-CLS             (System: Clasificacion)
         CL-CV-CON-MOL-TRN             (System: Transferencia y Bombeo)
Level 5: CL-CV-CON-MOL-SAG-01          (Equipment Train: SAG Mill 01)
         CL-CV-CON-MOL-SAG-02          (Equipment Train: SAG Mill 02)
         CL-CV-CON-MOL-BOL-01          (Equipment Train: Ball Mill 01)
         CL-CV-CON-MOL-BOL-02          (Equipment Train: Ball Mill 02)
         CL-CV-CON-MOL-CLS-HC01        (Equipment Train: Hydrocyclone Cluster 01)
Level 6: CL-CV-CON-MOL-SAG-01-MOT      (Major Component: Motor Principal 22MW)
         CL-CV-CON-MOL-SAG-01-GMX      (Major Component: Gearless Drive / GMD)
         CL-CV-CON-MOL-SAG-01-LUB      (Major Component: Sistema Lubricacion)
         CL-CV-CON-MOL-SAG-01-HID      (Major Component: Sistema Hidraulico)
         CL-CV-CON-MOL-SAG-01-LNR      (Major Component: Revestimientos)
         CL-CV-CON-MOL-SAG-01-DSC      (Major Component: Trommel / Discharge)
Level 7: CL-CV-CON-MOL-SAG-01-LUB-PP1  (Sub-Component: Bomba Lubricacion 1)
         CL-CV-CON-MOL-SAG-01-LUB-PP2  (Sub-Component: Bomba Lubricacion 2)
         CL-CV-CON-MOL-SAG-01-LUB-CLR  (Sub-Component: Enfriador Aceite)
         CL-CV-CON-MOL-SAG-01-LUB-FLT  (Sub-Component: Filtro Aceite)
```

**Equipment Count by Area and Category**:

```
Area                    | M-Mech | E-Elec | I-Instr | V-Valve | P-Piping | TOTAL
------------------------|--------|--------|---------|---------|----------|------
MOL - Molienda          |   187  |   124  |   156   |   203   |    45    |  715
FLO - Flotacion         |   134  |    89  |   178   |   267   |    56    |  724
ESP - Espesamiento      |    67  |    45  |    89   |   112   |    23    |  336
FIL - Filtracion        |    56  |    34  |    67   |    89   |    12    |  258
REA - Reactivos         |    23  |    18  |    45   |    78   |    15    |  179
UTL - Servicios/Utilities|   189  |   156  |   134   |   112   |    44    |  635
------------------------|--------|--------|---------|---------|----------|------
TOTAL                   |   656  |   466  |   669   |   861   |   195    | 2,847
```

**Notification Type Configuration**:

```
Type | Description                  | Catalog Profile | Priority Default | Auto-WO
-----|------------------------------|-----------------|------------------|--------
M1   | Aviso de Averia              | CP-DAMAGE-STD   | 2 - Urgent       | Yes (P1/P2)
M2   | Solicitud de Mantenimiento   | CP-MAINT-REQ    | 3 - Normal       | No
M3   | Informe de Actividad         | CP-ACTIVITY     | 4 - Low          | No
Z1   | Hallazgo Ronda Operacional   | CP-OPR-ROUND    | 3 - Normal       | No
Z2   | Alerta Monitoreo Condicion   | CP-CBM-ALERT    | 2 - Urgent       | Yes
Z3   | Hallazgo Inspeccion Regla.   | CP-STATUTORY    | 2 - Urgent       | No
Z4   | Observacion de Seguridad     | CP-SAFETY       | 1 - Emergency    | Yes
```

**Work Order Type Summary**:

```
Type | Description                    | Settlement      | Budget Category
-----|--------------------------------|-----------------|----------------
PM01 | Mantenimiento Correctivo       | Cost Center     | OPEX - Maintenance
PM02 | Correctivo Planificado         | Cost Center     | OPEX - Maintenance
PM03 | Mantenimiento Preventivo       | Cost Center     | OPEX - Maintenance
PM04 | Mantenimiento Basado Condicion | Cost Center     | OPEX - Maintenance
PM05 | Trabajo Parada Mayor           | Internal Order  | OPEX - Shutdown
PM06 | Proyecto / Modificacion        | WBS Element     | CAPEX - Project
PM07 | Inspeccion Reglamentaria       | Cost Center     | OPEX - Compliance
PM08 | Ronda Operacional              | Cost Center     | OPEX - Operations
```

---

### Example 2: Catalog Profile Configuration Mapping VSC FM Table to SAP Damage/Cause Codes

**Equipment Class**: PUMP_CENTRIFUGAL
**Catalog Profile**: CP-PUMP-CENT
**SAP Configuration Path**: SPRO > Plant Maintenance > Maintenance Processing > Catalogs > Define Catalog Profile

**Damage Code Groups (from VSC FM Mechanisms applicable to centrifugal pumps)**:

```
Code Group | VSC Mechanism              | SAP Damage Code | Description (ES)
-----------|----------------------------|-----------------|---------------------------
WEA        | Wears                      | WEA-PUMP        | Desgaste
COR        | Corrodes                   | COR-PUMP        | Corrosion
BRK        | Breaks/Fracture/Separates  | BRK-PUMP        | Rotura / Fractura
IMM        | Immobilised (binds/jams)   | IMM-PUMP        | Inmovilizacion / Atascamiento
OVH        | Overheats/Melts            | OVH-PUMP        | Sobrecalentamiento
SEV        | Severs (cut/tear/hole)     | SEV-PUMP        | Corte / Desgarro / Perforacion
LPR        | Looses Preload             | LPR-PUMP        | Perdida de Precarga
DEG        | Degrades                   | DEG-PUMP        | Degradacion
CRK        | Cracks                     | CRK-PUMP        | Fisura
```

**Cause Codes (from VSC FM Causes applicable to centrifugal pumps)**:

```
Damage Group | Cause Code | VSC Cause                          | SAP Code  | Description (ES)
-------------|------------|------------------------------------|-----------|-------------------------------------
WEA          | ABR        | Abrasion                           | WEA-ABR   | Abrasion por particulas solidas
WEA          | ERO        | Erosion                            | WEA-ERO   | Erosion por flujo de pulpa
WEA          | CAV        | Cavitation                         | WEA-CAV   | Cavitacion
WEA          | LUB        | Lack of lubrication                | WEA-LUB   | Falta de lubricacion
WEA          | CON        | Contamination (particles)          | WEA-CON   | Contaminacion del lubricante
COR          | CHM        | Chemical attack                    | COR-CHM   | Ataque quimico (pH, reactivos)
COR          | GAL        | Galvanic corrosion                 | COR-GAL   | Corrosion galvanica
COR          | MIC        | Microbiologically influenced       | COR-MIC   | Corrosion microbiologica
BRK          | FAT        | Fatigue (cyclic loading)           | BRK-FAT   | Fatiga por carga ciclica
BRK          | OVL        | Mechanical overload                | BRK-OVL   | Sobrecarga mecanica
BRK          | IMP        | Impact / shock                     | BRK-IMP   | Impacto / choque
IMM          | CON        | Contamination (foreign object)     | IMM-CON   | Contaminacion (objeto extrano)
IMM          | BLD        | Buildup / deposits                 | IMM-BLD   | Acumulacion de depositos
OVH          | LUB        | Lack of lubrication                | OVH-LUB   | Falta de lubricacion
OVH          | ALG        | Misalignment                       | OVH-ALG   | Desalineamiento
OVH          | OVL        | Overload (duty beyond design)      | OVH-OVL   | Sobrecarga (operacion fuera diseno)
SEV          | ERO        | Erosion (high velocity slurry)     | SEV-ERO   | Erosion por pulpa alta velocidad
LPR          | VIB        | Vibration                          | LPR-VIB   | Vibracion excesiva
LPR          | INC        | Incorrect assembly                 | LPR-INC   | Montaje incorrecto
DEG          | AGE        | Age / natural degradation          | DEG-AGE   | Envejecimiento / degradacion natural
DEG          | UV         | UV / environmental exposure        | DEG-UV    | Exposicion ambiental
CRK          | FAT        | Fatigue (cyclic loading)           | CRK-FAT   | Fatiga por carga ciclica
CRK          | THR        | Thermal cycling                    | CRK-THR   | Ciclaje termico
CRK          | SCC        | Stress corrosion cracking          | CRK-SCC   | Corrosion bajo tension
```

**SAP Transaction Sequence for Catalog Configuration**:

```
Step 1: QS41 - Create Code Groups for Damage Catalog
        - Code Group: WEA (Desgaste)
        - Add codes: WEA-ABR, WEA-ERO, WEA-CAV, WEA-LUB, WEA-CON

Step 2: QS41 - Create Code Groups for Cause Catalog
        - Code Group: WEA-CAUSES
        - Add codes: ABR, ERO, CAV, LUB, CON (with descriptions)

Step 3: QS51 - Create Catalog Profile CP-PUMP-CENT
        - Assign Damage Catalog: code groups WEA, COR, BRK, IMM, OVH, SEV, LPR, DEG, CRK
        - Assign Cause Catalog: all applicable cause code groups
        - Assign Activity Catalog: standard repair activities

Step 4: Assign Catalog Profile to Equipment Class
        - Equipment class PUMP_CENTRIFUGAL -> Catalog Profile CP-PUMP-CENT
        - All centrifugal pumps inherit this catalog profile
```

**Resulting Reliability Data Flow**:

```
Field Technician closes notification:
  Equipment: 300-PP-001A (Slurry Transfer Pump A)
  Notification Type: M1 (Aviso de Averia)
  Damage Code: WEA-ABR (Desgaste por Abrasion)
  Cause Code: ABR (Abrasion por particulas solidas)
  Component: Impeller (Impulsor)
  Activity: Replace (Reemplazar)
       |
       v
SAP Notification History (table QMEL + QMFE + QMUR)
       |
       v
Reliability Analytics (SAP Analytics Cloud / BW):
  - Pareto chart: Top damage codes for PUMP_CENTRIFUGAL class
  - Trend: WEA-ABR frequency over time for pump fleet
  - MTBF calculation: Mean time between WEA-ABR failures for 300-PP-001A
  - Cost analysis: Total cost of WEA-ABR failures across all pumps
  - Weibull analysis input: failure dates for WEA-ABR on pump impellers
       |
       v
VSC FM Table traceability:
  FM = "Impeller -> Wears due to Abrasion"
  Mapped 1:1 from SAP damage/cause codes back to VSC FM Table entry
```

---

## MCP Integration

### MCP Servers Required

| MCP Server | Purpose | Authentication | Key Operations |
|------------|---------|---------------|----------------|
| **mcp-sharepoint** | Store/retrieve blueprint documents, equipment registers, regulatory references, vendor manuals | OAuth2 | `GET /documents/{library}`, `POST /documents/{library}` |
| **mcp-cmms** | Validate SAP PM configuration against live system; extract existing config for brownfield | SAP RFC / REST API | `GET /equipment`, `GET /functional-locations`, `GET /catalog-profiles`, `GET /maintenance-plans` |
| **mcp-excel** | Generate configuration workbook with proper formatting, data validation, cross-sheet references | Local | `CREATE /workbook`, `WRITE /sheet/{name}`, `FORMAT /range` |
| **mcp-erp** | Validate SAP organizational structure, company codes, cost centers, material master | SAP RFC / OData | `GET /org-structure`, `GET /cost-centers`, `GET /material-master` |

### MCP Integration Points

1. **Input Gathering**: `mcp-sharepoint` retrieves equipment registers, maintenance strategy documents, and regulatory references from project document library
2. **Configuration Validation**: `mcp-cmms` (SAP PM) validates that proposed configuration does not conflict with existing SAP settings (for brownfield projects)
3. **Output Delivery**: `mcp-sharepoint` stores finalized blueprint document and configuration workbook in the designated project library with version control
4. **Cross-Agent Data Flow**: Configuration workbook data feeds into downstream agents (`create-training-plan`, `create-kpi-dashboard`, `optimize-mro-inventory`) via `mcp-sharepoint` shared data layer
