# Load SAP PM/MM Master Data

## Skill ID: AM-SAP-02
## Version: 1.0.0
## Category: D. Technical Deliverables
## Priority: P1 - High

---

## Purpose

Manage the complete master data loading process for SAP PM/MM go-live in capital projects transitioning from construction to operations. This skill orchestrates the end-to-end sequence of creating, validating, transforming, and loading all master data objects required for a fully functional SAP Plant Maintenance (PM) and Materials Management (MM) environment — from the foundational class system and functional location hierarchy through to activated maintenance plans and outline agreements.

Master data loading is one of the highest-risk workstreams in any SAP implementation for industrial operations. The interdependencies between data objects are strict and unforgiving: an equipment master cannot reference a functional location that does not exist, a maintenance plan cannot reference a task list or strategy that has not been loaded, and a BOM cannot reference materials that are not yet in the system. A single broken dependency can cascade into thousands of load errors, consuming weeks of cutover time that the project does not have.

For large mining operations, the scale compounds the challenge:

- **Volume**: 5,000-20,000 equipment masters, 10,000-40,000 material masters, 500-3,000 task lists — each record requiring 50-200 populated fields
- **Interdependency**: 13 major data object types with strict loading sequence dependencies — loading out of order produces referential integrity failures
- **Quality**: A single typo in a functional location code propagates errors to every equipment, BOM, task list, and maintenance plan that references it
- **Timeline**: The cutover window is typically 6-8 months of parallel loading, culminating in a 2-week dress rehearsal and final data refresh
- **Governance**: Multiple data stewards across Operations, Maintenance, Warehouse, and Engineering must validate their respective data domains

This skill ensures that the master data loading sequence is executed correctly, on time, and with full traceability — so that on go-live day, every maintenance planner can create a work order, every warehouse operator can issue a spare part, and every reliability engineer can analyze failure history using properly structured catalog codes that trace directly to the VSC Failure Modes Table.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Sequence Enforcement**: The 13-step master data loading sequence has hard dependencies. The agent must enforce the correct loading order and prevent attempts to load downstream objects before their prerequisites are complete and validated.

2. **Volume Planning**: For each data object type, the agent must estimate loading volumes based on the project's asset register, then plan loading capacity (records per day), resource allocation (data stewards, SAP consultants), and elapsed time.

3. **Template Management**: Each data object type requires a specific loading template with mandatory and optional fields. The agent must generate, distribute, validate, and collect templates — ensuring that data stewards populate them correctly before loading attempts.

4. **Quality Gate Enforcement**: Four quality gates must be passed for each data object before loading proceeds: template completeness, cross-reference validation, business rule validation, and sample verification by the data steward.

5. **Cutover Timeline Tracking**: The agent must track actual progress against the cutover timeline (T-6 months to T+1 month), identify delays, calculate schedule impact, and escalate when critical path items are at risk.

6. **Catalog Configuration**: SAP catalog profiles (damage codes, cause codes, object part codes, activity codes) must be configured to align with the VSC Failure Modes Table, ensuring that failure data captured in SAP traces directly to the standardized 18 mechanisms and 46 causes.

7. **Error Management**: Loading errors must be captured, classified (data error vs. configuration error vs. system error), routed to the correct resolver, tracked to closure, and prevented from recurring through template rule updates.

8. **Dress Rehearsal Coordination**: The T-2 week dress rehearsal is a full regression test of all loaded data. The agent must define test scenarios, coordinate testers, track defects, and confirm readiness for go-live.

---

## VSC Failure Modes Table Reference

**MANDATORY RULE:** The SAP catalog configuration (damage codes, cause codes, catalog profiles) MUST be derived from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). This ensures that when a technician closes a notification in SAP, the failure codes they select trace directly to the FM Table's standardized structure.

### FM Table to SAP Catalog Mapping

The VSC Failure Modes Table defines 72 standardized failure modes using the three-part structure:

| FM Table Element | SAP Catalog Object | Mapping Rule |
|------------------|-------------------|--------------|
| **18 Mechanisms** (HOW it fails) | Damage Code Groups (Catalog Type C) | Each mechanism becomes one SAP damage code group containing specific damage codes |
| **46 Causes** (WHY it fails) | Cause Code Groups (Catalog Type 5) | Each cause becomes one SAP cause code, organized into logical cause groups |
| **Equipment Classes** | Catalog Profiles | Each equipment class gets a catalog profile that restricts available damage/cause codes to those relevant for that class |
| **FM Combinations** (Mechanism + Cause) | Notification Code Combinations | Valid mechanism-cause combinations from the FM Table are enforced as valid code combinations in SAP |

### The 18 Official FM-Mechanisms (SAP Damage Code Groups)

All SAP damage codes MUST map to one of these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules

1. **No ad-hoc damage or cause codes.** Every code in the SAP catalog must trace to the FM Table. Codes like "other", "miscellaneous", or "unknown" are NOT permitted as permanent codes (a temporary "to be determined" code may exist during ramp-up with a mandatory 30-day resolution policy).
2. **Catalog profiles per equipment class.** A centrifugal pump must not show damage codes for "Arcs" or "Short-Circuits" (electrical mechanisms). Catalog profiles restrict available codes to relevant mechanisms per equipment class.
3. **Consistency with upstream deliverables.** The SAP damage/cause codes must be identical to those used in the FMECA workbook, maintenance strategy, and initial spares list — ensuring end-to-end traceability from failure mode analysis through to SAP failure recording.
4. **Bilingual descriptions.** All catalog codes must have descriptions in both English and Spanish (or the project's operational languages), using the exact translations from the FM Table.

---

## Trigger / Invocation

```
/load-sap-master-data
```

**Aliases**: `/sap-master-data`, `/sap-data-load`, `/carga-datos-maestros-sap`

**Primary Trigger Commands:**
- `load-sap-master-data plan --project [name] --equipment-register [file]`
- `load-sap-master-data sequence --step [1-13] --action [prepare|validate|load|verify]`
- `load-sap-master-data status --project [name]`
- `load-sap-master-data quality-gate --step [1-13] --gate [1-4]`
- `load-sap-master-data cutover-timeline --project [name]`
- `load-sap-master-data catalog-config --fm-table [file]`
- `load-sap-master-data dress-rehearsal --project [name]`
- `load-sap-master-data error-report --step [1-13]`

**Trigger Conditions:**
- SAP system landscape provisioned (DEV, QAS, PRD environments available)
- SAP PM/MM configuration (customizing) completed by SAP functional team
- Equipment register available (from `create-asset-register`)
- Maintenance strategies defined (from `create-maintenance-strategy` / `develop-maintenance-strategy`)
- OR Orchestrator assigns SAP data loading workstream
- Cutover planning phase initiated (typically T-8 to T-6 months before go-live)

---

## Input Requirements

### Required Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Equipment Register | `create-asset-register` / mcp-sharepoint | .xlsx | Master equipment list with FLOC hierarchy, tag numbers, equipment types, OEM, model numbers, criticality ratings, ISO 14224 classification |
| SAP Configuration Baseline | SAP Functional Team | .docx / .xlsx | Completed SAP PM/MM customizing: plant structure, planning plants, maintenance plant, MRP settings, number ranges, organizational structure |
| Maintenance Strategy Documents | `create-maintenance-strategy` / `develop-maintenance-strategy` | .xlsx / .docx | Maintenance strategies (time-based, counter-based, condition-based) with task lists, frequencies, and material requirements |
| VSC Failure Modes Table | `methodology/standards/` | .xlsx | Official FM Table with 18 mechanisms, 46 causes, 72 combinations for catalog configuration |
| Material Masters Source Data | Engineering / Vendors / Warehouse | .xlsx / .csv | Spare parts lists, consumables lists, service descriptions from vendor documentation and warehouse planning |
| Vendor Master Data | Procurement / `agent-procurement` | .xlsx | Vendor names, addresses, payment terms, purchasing organization assignments |
| Project Cutover Schedule | `agent-project` / PMO | .xlsx / .mpp | Go-live date, system-by-system cutover sequence, dress rehearsal dates, blackout periods |

### Strongly Recommended Inputs

| Input | Source | Format | Description |
|-------|--------|--------|-------------|
| Equipment BOM Data | Vendors / Engineering | .xlsx | Bill of Materials for equipment assemblies — components, quantities, item categories |
| FMECA Workbook | `develop-maintenance-strategy` | .xlsx | Failure modes, effects, criticality — drives task list content and catalog codes |
| P&ID References | Engineering / mcp-sharepoint | .pdf | For validating functional location hierarchy against process design |
| Measuring Point Definitions | Reliability Engineering | .xlsx | Measurement positions, characteristic types, counter readings for condition monitoring |
| Outline Agreement Data | Procurement / Legal | .xlsx / .docx | Framework contracts for O&M services: scope, pricing, validity periods, release procedures |
| Legacy CMMS Data | Operations (brownfield) | .xlsx / .csv / database export | Existing maintenance data for migration: equipment history, material catalogs, PM schedules |

### Optional Inputs

| Input | Source | Format | Default if Absent |
|-------|--------|--------|-------------------|
| SAP Naming Convention Guide | SAP CoE / Client | .docx | VSC standard SAP naming conventions applied |
| Data Migration Strategy Document | SAP Project Team | .docx | VSC standard migration approach applied |
| Number Range Allocation | SAP Basis / Functional | .xlsx | Standard SAP number ranges used |
| Custom ABAP Program Specifications | SAP Technical Team | .docx | Standard LSMW / Migration Cockpit used |
| Training Material Requirements | `plan-training-program` | .docx | Standard SAP PM/MM training curriculum applied |

### Configuration Schema

```yaml
sap_master_data_config:
  project_code: "PRJ-001"
  project_name: "Sierra Verde Copper Mine"
  sap_version: "S/4HANA 2023"  # or "ECC 6.0 EHP8"
  go_live_date: "2027-06-01"

  sap_organizational:
    client: "100"
    company_code: "SV01"
    plant: "SV01"
    planning_plant: "SV01"
    maintenance_plant: "SV01"
    purchasing_organization: "SV01"
    storage_location: "0001"

  loading_tools:
    primary: "S/4HANA Migration Cockpit"  # or "LSMW" for ECC
    secondary: "BAPIs"
    bom_loader: "RIIFBI10"
    custom_programs: ["ZPM_LOAD_TASKL", "ZMM_LOAD_MATBOM"]

  volume_estimates:
    functional_locations: 6500
    equipment_masters: 15000
    material_masters: 25000
    vendor_masters: 800
    equipment_bom: 3500
    bom_items: 35000
    task_lists: 1800
    maintenance_strategies: 45
    maintenance_plans: 1200
    measuring_points: 6000
    outline_agreements: 120
    catalog_codes: 450

  quality_gates:
    gate_1_completeness: 100  # % mandatory fields populated
    gate_2_cross_reference: 100  # % referential integrity checks passed
    gate_3_business_rules: 95  # % business rule validations passed
    gate_4_sample_verification: 10  # % random sample verified by steward

  completeness_by_criticality:
    A_class:
      mandatory_fields: 100  # %
      optional_fields: 80   # %
    B_class:
      mandatory_fields: 100
      optional_fields: 50
    C_class:
      mandatory_fields: 100
      optional_fields: 0

  cutover_timeline:
    t_minus_6_months: "FL hierarchy + class system"
    t_minus_5_months: "Vendor masters"
    t_minus_4_months: "Equipment masters"
    t_minus_3_months: "Material masters"
    t_minus_2_months: "Equipment BOM"
    t_minus_6_weeks: "Task lists + maintenance strategies"
    t_minus_4_weeks: "Maintenance plans activated"
    t_minus_2_weeks: "Dress rehearsal"
    t_minus_1_week: "Final data refresh + validation"
    t_zero: "Go-live"
    t_plus_1_month: "Post go-live data cleansing sprint"
```

---

## Output Specification

### Primary Output: Master Data Loading Package

**Output directory:** `{ProjectCode}_SAP_Master_Data_Loading/`

```yaml
outputs:
  master_data_loading_plan:
    filename: "{ProjectCode}_SAP_MD_Loading_Plan_v{version}_{date}.xlsx"
    description: "Complete loading plan with sequence, volumes, timelines, responsibilities"
    sheets:
      - "Loading Sequence": 13-step dependency matrix with predecessors, durations, resources
      - "Volume Summary": Record counts by object type with loading capacity estimates
      - "Cutover Timeline": Gantt-style timeline from T-6 months to T+1 month
      - "Resource Plan": Data stewards, SAP consultants, testers per loading phase
      - "Risk Register": Loading risks with probability, impact, mitigation

  loading_templates:
    directory: "templates/"
    files:
      - "01_Class_System_Template.xlsx"
      - "02_Functional_Location_Template.xlsx"
      - "03_Vendor_Master_Template.xlsx"
      - "04_Material_Master_Template.xlsx"
      - "05_Equipment_Master_Template.xlsx"
      - "06_Material_Info_Record_Template.xlsx"
      - "07_Equipment_BOM_Template.xlsx"
      - "08_Measuring_Point_Template.xlsx"
      - "09_Task_List_Template.xlsx"
      - "10_Maintenance_Strategy_Template.xlsx"
      - "11_Maintenance_Plan_Template.xlsx"
      - "12_Outline_Agreement_Template.xlsx"

  catalog_configuration:
    filename: "{ProjectCode}_SAP_Catalog_Config_v{version}_{date}.xlsx"
    description: "Damage codes, cause codes, object part codes, activity codes mapped from FM Table"
    sheets:
      - "Damage Codes (Cat C)": 18 damage code groups mapped from FM Table mechanisms
      - "Cause Codes (Cat 5)": 46 cause codes mapped from FM Table causes
      - "Object Part Codes (Cat B)": Component/part codes per equipment class
      - "Activity Codes (Cat A)": Maintenance activity codes (repair, replace, inspect, etc.)
      - "Catalog Profiles": Equipment class to catalog code mapping
      - "FM Table Traceability": Full cross-reference from FM Table to SAP codes

  quality_gate_reports:
    filename: "{ProjectCode}_QG_Report_Step{N}_Gate{G}_{date}.xlsx"
    description: "Quality gate pass/fail report per loading step"

  cutover_tracker:
    filename: "{ProjectCode}_Cutover_Tracker_v{version}_{date}.xlsx"
    description: "Live tracker of loading progress, errors, and resolution status"

  error_log:
    filename: "{ProjectCode}_Loading_Error_Log_{date}.xlsx"
    description: "All loading errors with classification, root cause, resolution, and prevention"

  dress_rehearsal_report:
    filename: "{ProjectCode}_Dress_Rehearsal_Report_v{version}_{date}.docx"
    description: "Full regression test results with go/no-go recommendation"

  post_golive_cleansing_plan:
    filename: "{ProjectCode}_Post_GoLive_Data_Cleansing_v{version}_{date}.xlsx"
    description: "Known data issues deferred to post go-live with resolution timeline"
```

### Formatting Standards
- Header row: Bold, dark blue background (#003366), white font
- Loading step status: Green (complete), Yellow (in progress), Red (blocked/overdue), Grey (not started)
- Quality gate results: Pass (green checkmark), Fail (red X), Conditional Pass (amber triangle)
- Error severity: Critical (red), Major (orange), Minor (yellow), Info (blue)
- Cross-reference links between templates (hyperlinks to related records)
- All date fields in ISO 8601 format (YYYY-MM-DD)
- All monetary values formatted with thousand separators

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| **ISO 14224:2016** | Equipment taxonomy and failure coding — drives equipment classification, functional location hierarchy, and catalog code structure |
| **ISO 55001:2014** | Asset management systems — lifecycle perspective for master data completeness requirements |
| **IEC 81346** | Reference designation system — for functional location coding conventions |
| **ISO 14224 Annex A** | Equipment class definitions — direct mapping to SAP equipment categories and object types |

### SAP Standards & Best Practices

| Standard | Application |
|----------|-------------|
| **SAP PM Master Data Guide** | Official SAP documentation for PM master data object relationships and mandatory fields |
| **SAP Best Practices for Mining** | Industry-specific SAP configuration and master data recommendations for mining operations |
| **SAP S/4HANA Migration Cockpit** | Standard migration tool for S/4HANA projects — replaces LSMW |
| **BAPI Documentation** | Business Application Programming Interface specifications for automated data loading |
| **SAP Note 110604** | Master data loading sequence for Plant Maintenance |

### Loading Tools Reference

| Tool | SAP Version | Use Case | Strengths | Limitations |
|------|-------------|----------|-----------|-------------|
| **LSMW** (Legacy System Migration Workbench) | ECC 6.0 | Batch loading from flat files | Well-documented, recording-based, reusable | Deprecated in S/4HANA, limited error handling |
| **BAPIs** (Business Application Programming Interfaces) | ECC + S/4HANA | Automated loading via API calls | Full validation, error handling, logging | Requires ABAP development for wrapper programs |
| **S/4HANA Migration Cockpit** | S/4HANA | Standard migration tool | Built-in templates, staging tables, simulation mode | Limited customization for complex transformations |
| **Direct Input Programs** | ECC + S/4HANA | Specific object types (e.g., RIIFBI10 for BOM) | Fast, bulk loading for specific objects | No universal tool; different program per object type |
| **Custom ABAP Programs** | ECC + S/4HANA | Complex transformations | Full flexibility | Development and testing effort; maintenance burden |
| **Excel-based Templates with VBA** | N/A (pre-loading) | Data collection and pre-validation | Familiar to data stewards, built-in validation macros | File size limits, version control challenges |

### Data Governance Framework

#### Data Stewards per Object Type

| Data Object | Responsible Data Steward | Backup Steward | Validation Authority |
|-------------|------------------------|----------------|---------------------|
| Functional Location Hierarchy | Process / Operations Engineering | Plant Manager | VP Operations |
| Equipment Masters | Maintenance Engineering | Reliability Engineering | Maintenance Manager |
| Material Masters (spare parts) | Warehouse / Inventory Management | Procurement | Supply Chain Manager |
| Material Masters (services) | Procurement | Contract Management | Procurement Manager |
| Vendor Masters | Procurement | Finance (AP) | Procurement Manager |
| Equipment BOM | Maintenance Engineering + Vendors | Reliability Engineering | Maintenance Manager |
| Task Lists | Reliability Engineering | Maintenance Planning | Reliability Manager |
| Maintenance Strategies | Reliability Engineering | Maintenance Engineering | Reliability Manager |
| Maintenance Plans | Maintenance Planning | Reliability Engineering | Planning Superintendent |
| Measuring Points | Reliability Engineering / Condition Monitoring | Instrumentation Engineering | Reliability Manager |
| Catalog Codes | Reliability Engineering | Maintenance Engineering | Reliability Manager |
| Outline Agreements | Procurement / Contract Management | Legal | Procurement Manager |

#### Quality Gates

| Gate | Name | Validation Scope | Performed By | Pass Criteria |
|------|------|-----------------|-------------|---------------|
| **Gate 1** | Template Completeness Check | All mandatory fields populated, correct data types, valid value ranges | Loading Team (automated) | 100% mandatory fields populated |
| **Gate 2** | Cross-Reference Validation | Referential integrity: parent objects exist, codes are valid, links are correct | Loading Team (automated) | 100% cross-references valid |
| **Gate 3** | Business Rule Validation | Domain-specific rules: Criticality A equipment must have PM plan, rotating equipment must have measuring points, etc. | Data Steward + Loading Team | 95% business rules passed (remaining 5% documented with justification) |
| **Gate 4** | Sample Verification | 10% random sample verified by data steward against source documents | Data Steward (manual) | 100% of sampled records confirmed accurate |

#### Completeness Criteria by Equipment Criticality

| Criticality | Mandatory Fields | Optional Fields | PM Coverage | BOM Coverage | Measuring Points |
|-------------|-----------------|-----------------|-------------|--------------|------------------|
| **A-class** | 100% populated | 80% populated | 100% must have active PM plan | 100% must have BOM | 100% rotating equipment |
| **B-class** | 100% populated | 50% populated | 90% must have active PM plan | 80% must have BOM | Rotating + high-value static |
| **C-class** | 100% populated | Not required | Run-to-failure acceptable | Not required | Not required |

---

## Step-by-Step Execution

### Master Data Loading Sequence — 13 Steps

The following 13 steps MUST be executed in sequence. Each step's prerequisites must be validated (all four quality gates passed) before proceeding to the next step.

---

#### Step 1: SAP Configuration (Prerequisite — SAP Team)

- **Prerequisite Steps**: None (this is the foundation)
- **Data Source**: SAP Functional Design Documents, Blueprint
- **Responsible Team**: SAP Functional Consultants (PM, MM, FI)
- **Volume Estimate**: N/A (configuration, not data loading)
- **Validation Criteria**: Configuration transport successfully imported to QAS; organizational structure, number ranges, and customizing tables verified
- **Typical Issues**:
  - Issue: Configuration not transported to QAS on time → Mitigation: Include config transport in cutover plan with hard deadlines
  - Issue: Number range conflicts between PM and MM → Mitigation: Coordinate number range allocation in design phase
  - Issue: Missing authorization roles for data loading → Mitigation: Create loading-specific roles with broad PM/MM authorization

**Key Configuration Items:**
- Plant structure (maintenance plant, planning plant, work centers)
- PM organizational structure (planner groups, maintenance activity types)
- MM organizational structure (purchasing organization, storage locations, MRP profiles)
- Number ranges (functional locations, equipment, materials, maintenance plans)
- Catalog types and code groups (damage, cause, object part, activity)
- Maintenance order types and notification types
- Settlement rules and cost element assignments

---

#### Step 2: Class System (Characteristics, Classes, Class Types)

- **Prerequisite Steps**: Step 1 (Configuration complete)
- **Data Source**: Equipment datasheets, ISO 14224 taxonomy, client standards
- **Responsible Team**: SAP PM Consultant + Maintenance Engineering
- **Volume Estimate**: 50-200 classes, 200-1,000 characteristics
- **Validation Criteria**: All classes assigned to correct class types (003 for equipment, 017 for documents); characteristics have correct data types and value ranges
- **Typical Issues**:
  - Issue: Over-classification (too many classes/characteristics) → Mitigation: Start with ISO 14224 standard classes; add custom classes only when business need is demonstrated
  - Issue: Characteristic value lists incomplete → Mitigation: Pre-populate from datasheets and vendor documentation

**Loading Tool**: Manual configuration in SAP (transaction CL02/CT04) or LSMW/Migration Cockpit for bulk characteristics.

---

#### Step 3: Functional Location Hierarchy

- **Prerequisite Steps**: Step 1 (Configuration), Step 2 (Class System)
- **Data Source**: `create-asset-register` output (FLOC hierarchy sheet), P&IDs, plant layout drawings
- **Responsible Team**: Process/Operations Engineering (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 3,000-10,000 functional locations
- **Validation Criteria**: Hierarchy integrity (no orphans, no circular references); FLOC codes follow naming convention; every FLOC has description in both languages; structure indicators correctly set (A/B for single/multiple equipment installation)
- **Typical Issues**:
  - Issue: Hierarchy too deep (>8 levels) → Mitigation: Limit to 5-6 levels per SAP best practice; use equipment sub-objects for component-level detail
  - Issue: Naming convention inconsistencies from multiple contributors → Mitigation: Centralized naming authority; automated naming convention validation in template
  - Issue: Process changes during loading invalidate hierarchy → Mitigation: Design change freeze 4 weeks before loading start; MOC process for exceptions

**Loading Tool**: LSMW (recording on transaction IL01) or S/4HANA Migration Cockpit (Functional Location migration object).

**Key Fields**: FLOC code, description (EN/ES), category, structure indicator, company code, cost center, planning plant, business area, object type, class assignments, location data.

---

#### Step 4: Vendor Masters

- **Prerequisite Steps**: Step 1 (Configuration — purchasing organization defined)
- **Data Source**: Procurement database, vendor qualification records, existing ERP data
- **Responsible Team**: Procurement (data steward), SAP MM Consultant (loading)
- **Volume Estimate**: 300-1,500 vendors
- **Validation Criteria**: All vendors have complete address data; purchasing organization assignments correct; payment terms defined; bank details validated; tax classifications complete
- **Typical Issues**:
  - Issue: Incomplete vendor data (missing bank details, tax IDs) → Mitigation: Create placeholder records with mandatory follow-up; flag incomplete vendors as "blocked for payment" until data complete
  - Issue: Duplicate vendors (same vendor, different names/addresses) → Mitigation: Vendor deduplication check using tax ID and address matching before loading
  - Issue: Regional vendor variations (Chile RUT format, local payment terms) → Mitigation: Country-specific template with local field validation

**Loading Tool**: LSMW (recording on transaction XK01) or S/4HANA Migration Cockpit (Supplier migration object).

**Key Fields**: Vendor number, name, address, tax ID (RUT for Chile), purchasing organization, payment terms, currency, bank details, partner functions.

---

#### Step 5: Material Masters (Spare Parts, Consumables, Services)

- **Prerequisite Steps**: Step 1 (Configuration), Step 4 (Vendor Masters — for info record linkage)
- **Data Source**: `generate-initial-spares-list` output, vendor catalogs, warehouse planning documents
- **Responsible Team**: Warehouse/Inventory Management (data steward for spare parts), Procurement (data steward for services), SAP MM Consultant (loading)
- **Volume Estimate**: 10,000-40,000 material masters
- **Validation Criteria**: Material descriptions follow naming standard (noun-modifier format); material groups correctly assigned; MRP views populated for stocked items; purchasing views populated for all items; units of measure consistent; no duplicate materials
- **Typical Issues**:
  - Issue: Material master duplicates (same part, different descriptions) → Mitigation: Material description standards enforced via template validation; mandatory search-before-create policy; fuzzy matching algorithm on description + manufacturer + part number
  - Issue: Inconsistent units of measure → Mitigation: UoM standardization table (project-wide); automated UoM conversion check in template
  - Issue: Missing MRP parameters for stocked items → Mitigation: Default MRP profiles by material group; Min-Max parameters from `generate-initial-spares-list`
  - Issue: Service material configuration issues → Mitigation: Separate template for service materials with service-specific fields

**Loading Tool**: LSMW (recording on transaction MM01) or S/4HANA Migration Cockpit (Material migration object). Note: Material masters require multiple views (Basic Data, MRP, Purchasing, Storage, Accounting) — each view may need separate loading pass.

**Key Fields**: Material number, description (EN/ES), material type (ERSA/HIBE/DIEN), material group, base UoM, purchasing group, MRP type, reorder point, safety stock, lot size, storage location, valuation class, standard price.

---

#### Step 6: Equipment Masters

- **Prerequisite Steps**: Step 1 (Configuration), Step 2 (Class System), Step 3 (Functional Locations)
- **Data Source**: `create-asset-register` output (equipment register sheet), vendor datasheets
- **Responsible Team**: Maintenance Engineering (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 5,000-20,000 equipment records
- **Validation Criteria**: Every equipment record assigned to a valid functional location; serial numbers unique where provided; class assignments match class system; manufacturer and model populated for Criticality A and B; construction type (object type) correctly classified
- **Typical Issues**:
  - Issue: Equipment not yet physically installed (greenfield) → Mitigation: Load with status "INST" (installed) for commissioned equipment, "AVLB" (available) for equipment in warehouse; update status during commissioning sequence
  - Issue: Missing serial numbers for large equipment → Mitigation: Populate during commissioning; use placeholder with mandatory follow-up flag
  - Issue: Incorrect FL assignment (equipment mapped to wrong system) → Mitigation: Cross-validate against P&IDs and plant layout; data steward sign-off per area

**Loading Tool**: LSMW (recording on transaction IE01) or S/4HANA Migration Cockpit (Equipment migration object).

**Key Fields**: Equipment number, description (EN/ES), equipment category (M for machinery), functional location, construction type (object type), manufacturer, model, serial number, start-up date, cost center, class assignments, permit indicator, criticality (user status).

---

#### Step 7: Material Info Records (Vendor-Material Price Agreements)

- **Prerequisite Steps**: Step 4 (Vendor Masters), Step 5 (Material Masters)
- **Data Source**: Vendor quotations, purchase order history, procurement agreements
- **Responsible Team**: Procurement (data steward), SAP MM Consultant (loading)
- **Volume Estimate**: 15,000-60,000 info records (average 1.5 vendors per material)
- **Validation Criteria**: Vendor-material combinations valid; prices in correct currency; validity periods defined; purchasing organization assignment correct; no duplicate info records for same vendor-material combination
- **Typical Issues**:
  - Issue: Price data outdated (quotes >12 months old) → Mitigation: Flag records with prices older than 12 months; create with "estimated" indicator; schedule vendor price confirmation
  - Issue: Multiple currency issues (USD, CLP, EUR) → Mitigation: Standardize on project currency; load currency conversion factors

**Loading Tool**: LSMW (recording on transaction ME11) or BAPI_INFORECORD_CREATE.

**Key Fields**: Vendor number, material number, purchasing organization, plant, net price, currency, price unit, order UoM, planned delivery time, minimum order quantity, validity period.

---

#### Step 8: Equipment BOM (Bill of Materials)

- **Prerequisite Steps**: Step 5 (Material Masters), Step 6 (Equipment Masters)
- **Data Source**: Vendor BOM data, engineering drawings, `generate-initial-spares-list` output
- **Responsible Team**: Maintenance Engineering + Vendors (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 1,000-5,000 BOMs with 15,000-50,000 BOM items
- **Validation Criteria**: Every BOM item references a valid material master; quantities and UoM correct; item categories correct (stock item L, non-stock item N, document item D); BOM usage set to PM (plant maintenance); no circular BOM references
- **Typical Issues**:
  - Issue: BOM explosion inconsistencies (missing sub-assemblies, wrong quantities) → Mitigation: OEM verification of BOM structure; cross-check BOM items against initial spares list; automated quantity reasonableness check
  - Issue: Material masters not yet loaded for BOM items → Mitigation: Strictly enforce Step 5 completion before Step 8; pre-load material stubs if BOM data arrives before full material master data
  - Issue: BOM too detailed or too shallow → Mitigation: Target maintainable item level (items a technician would replace, not individual bolts); 15-30 items per equipment BOM is typical

**Loading Tool**: Direct Input program RIIFBI10 (transaction IBIP) for bulk BOM loading — significantly faster than LSMW for BOMs. Alternative: BAPI_EQMT_BOM_CREATE.

**Key Fields**: Equipment number, BOM usage (PM), BOM header (base quantity), item number, component (material number), item quantity, UoM, item category, valid-from date.

---

#### Step 9: Measuring Points (Condition-Based Maintenance)

- **Prerequisite Steps**: Step 6 (Equipment Masters)
- **Data Source**: Condition monitoring program, P&IDs (instrument list), reliability engineering specifications
- **Responsible Team**: Reliability Engineering / Condition Monitoring (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 2,000-10,000 measuring points
- **Validation Criteria**: Each measuring point linked to valid equipment; characteristic type correct (measurement or counter); units of measure correct; counter overflow values set; target and threshold values defined where applicable
- **Typical Issues**:
  - Issue: Measuring point units mismatch (e.g., vibration in mm/s vs. in/s) → Mitigation: UoM standardization table; project-wide adoption of SI units (or explicit conversion tables for OEM equipment using imperial units)
  - Issue: Counter measuring points with incorrect overflow values → Mitigation: Validate overflow value against equipment operating profile (e.g., hour meter overflow at 99,999 hours)
  - Issue: Too many measuring points (every instrument point loaded as SAP measuring point) → Mitigation: Only load measuring points that trigger maintenance actions; historian/SCADA handles operational monitoring

**Loading Tool**: LSMW (recording on transaction IK01) or BAPI_MEASPOINT_CREATE.

**Key Fields**: Measuring point number, description (EN/ES), equipment number, characteristic type (measurement/counter), UoM, decimal places, target value, upper/lower limits, counter overflow, annual estimate.

---

#### Step 10: Task Lists (General and Equipment-Specific)

- **Prerequisite Steps**: Step 5 (Material Masters — for material components in task list operations), Step 6 (Equipment Masters — for equipment-specific task lists)
- **Data Source**: `create-maintenance-strategy` output, `develop-maintenance-strategy` FMECA-derived tasks, OEM maintenance manuals
- **Responsible Team**: Reliability Engineering (data steward), Maintenance Planning (reviewer), SAP PM Consultant (loading)
- **Volume Estimate**: 500-3,000 task lists (general task lists for equipment classes + equipment-specific task lists for critical equipment)
- **Validation Criteria**: Task list operations have clear descriptions; estimated durations realistic; material components reference valid material masters; qualification requirements defined for safety-critical tasks; task list group and counter follow naming convention
- **Typical Issues**:
  - Issue: Task list over-engineering (copy-paste from OEM manual without RCM-based filtering) → Mitigation: Only include tasks justified by FMECA analysis; apply RCM decision logic per SAE JA1011; typical task list has 5-15 operations, not 50
  - Issue: Missing material components (task says "replace seal" but no seal material assigned) → Mitigation: Cross-reference task list operations with BOM items and initial spares list; automated check for replacement tasks without material components
  - Issue: Inconsistent task descriptions across similar equipment → Mitigation: Standardized operation text library; template operations for common tasks (lubrication, alignment, vibration check)

**Loading Tool**: LSMW (recording on transaction IA05 for general task list, IA01 for equipment-specific) or BAPI_ALM_TASKLIST_CREATE.

**Key Fields**: Task list group, group counter, description (EN/ES), plant, work center, usage (PM), status, operation number, operation description, duration, UoM (hours), number of capacities, material components (material number, quantity, UoM), qualification keys.

---

#### Step 11: Maintenance Strategies (Time-Based, Counter-Based, Condition-Based)

- **Prerequisite Steps**: Step 1 (Configuration — strategy types and scheduling parameters configured)
- **Data Source**: `create-maintenance-strategy` output, reliability engineering specifications
- **Responsible Team**: Reliability Engineering (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 20-100 maintenance strategies (relatively few, as strategies are reused across equipment)
- **Validation Criteria**: Strategy type correct (time-based, counter-based); maintenance packages defined with correct cycle lengths and units; scheduling parameters correct (call horizon, tolerance, shift factors); strategy descriptions clearly indicate applicability
- **Typical Issues**:
  - Issue: Over-proliferation of strategies (unique strategy per equipment instead of reusable strategies) → Mitigation: Design strategies at equipment class level; a well-designed PM program uses 20-50 strategies for an entire site, not hundreds
  - Issue: Counter-based strategy without measuring point linkage → Mitigation: Verify measuring points (Step 9) exist for every counter-based strategy; include measuring point reference in strategy documentation
  - Issue: Scheduling parameter conflicts (overlapping maintenance packages with incompatible shift factors) → Mitigation: Scheduling simulation in QAS before production loading

**Loading Tool**: Manual configuration in SAP (transaction IP11) for small volumes; LSMW for bulk loading.

**Key Fields**: Strategy number, description (EN/ES), strategy type (time/counter), call object (maintenance plan), scheduling indicator, maintenance packages (package number, cycle length, UoM, hierarchy indicator, description), shift factors, tolerance percentages.

---

#### Step 12: Maintenance Plans (Linking Strategies + Task Lists + Equipment)

- **Prerequisite Steps**: Step 6 (Equipment Masters), Step 10 (Task Lists), Step 11 (Maintenance Strategies)
- **Data Source**: `create-maintenance-strategy` output, maintenance planning matrix
- **Responsible Team**: Maintenance Planning (data steward), SAP PM Consultant (loading)
- **Volume Estimate**: 300-2,000 maintenance plans
- **Validation Criteria**: Every maintenance plan references valid strategy, task list, and equipment/functional location; scheduling parameters correct; start date and call horizon aligned with go-live date; planned cost center assignment correct; maintenance plans generate correct maintenance call objects (orders or notifications)
- **Typical Issues**:
  - Issue: Maintenance plan scheduling conflicts (too many plans scheduled on same day/week) → Mitigation: Scheduling simulation before activation; stagger start dates to distribute workload; use factory calendar for scheduling
  - Issue: Task list-to-strategy package mismatch → Mitigation: Verify package-to-operation assignment (which operations execute at which frequency); cross-reference with maintenance strategy document
  - Issue: Mass activation overwhelming the planning horizon → Mitigation: Activate in batches by system/area; stagger activation over 2 weeks; monitor IP30 (deadline monitoring) after each batch

**Loading Tool**: LSMW (recording on transaction IP01) or BAPI_ALM_MAINTPLAN_CREATE. Activation via transaction IP10 (individual) or custom ABAP for mass activation.

**Key Fields**: Maintenance plan number, description (EN/ES), plan category (PM plan), strategy, maintenance item (task list reference, equipment/FL reference, maintenance activity type, order type), scheduling parameters (start date, call horizon, scheduling period), planner group, cost center.

---

#### Step 13: Outline Agreements (Framework Contracts for O&M Services)

- **Prerequisite Steps**: Step 4 (Vendor Masters), Step 5 (Material Masters — for service materials)
- **Data Source**: Procurement / Contract Management, legal agreements
- **Responsible Team**: Procurement / Contract Management (data steward), SAP MM Consultant (loading)
- **Volume Estimate**: 50-200 outline agreements
- **Validation Criteria**: Agreement type correct (contract vs. scheduling agreement); vendor and material assignments valid; pricing conditions correct; validity period covers operational period; release procedures defined; budget limits set
- **Typical Issues**:
  - Issue: Contract terms not finalized before loading deadline → Mitigation: Load agreement structure with placeholder pricing; update pricing when contracts signed; use "blocked for release" status until pricing confirmed
  - Issue: Service scope definition mismatch between contract and SAP service master → Mitigation: Map contract line items to SAP service specifications before loading; reconcile with legal team

**Loading Tool**: LSMW (recording on transaction ME31K for contracts, ME31L for scheduling agreements) or BAPI_CONTRACT_CREATE.

**Key Fields**: Agreement type, vendor, purchasing organization, validity period, target value, item category, material/service, quantity, price, price unit, release procedure, payment terms.

---

## Typical Volumes for Large Mining Operations

| Data Object | Typical Range | Fields per Record | Loading Effort (Days) | Notes |
|-------------|--------------|-------------------|-----------------------|-------|
| Functional Locations | 3,000 - 10,000 | 30-50 | 10-20 | Foundation; must be loaded first |
| Equipment Masters | 5,000 - 20,000 | 50-80 | 15-40 | Largest volume after materials |
| Material Masters | 10,000 - 40,000 | 80-200 (multiple views) | 20-60 | Most complex; multiple views per record |
| Vendor Masters | 300 - 1,500 | 40-60 | 5-10 | Includes purchasing org assignments |
| Material Info Records | 15,000 - 60,000 | 15-25 | 5-15 | High volume but simple structure |
| Equipment BOM | 1,000 - 5,000 headers | 10-15 per header | 10-25 | 15,000-50,000 BOM items total |
| Task Lists | 500 - 3,000 | 20-40 per task list | 15-30 | Includes 5-15 operations each |
| Maintenance Strategies | 20 - 100 | 15-25 | 3-5 | Few but critical; reused across equipment |
| Maintenance Plans | 300 - 2,000 | 20-35 | 10-20 | Must link strategy + task list + equipment |
| Measuring Points | 2,000 - 10,000 | 15-25 | 5-15 | Counter + measurement types |
| Outline Agreements | 50 - 200 | 30-50 | 5-10 | Framework contracts for services |
| Catalog Codes | 200 - 500 | 5-10 | 5-10 | Damage, cause, object part, activity |

---

## Cutover Timeline

The following timeline assumes a go-live date of T=0. All dates are expressed relative to go-live.

| Milestone | Timing | Data Objects Loaded | Quality Gate | Dependencies |
|-----------|--------|--------------------|--------------|--------------------|
| **Foundation Loading** | T-6 months | FL hierarchy + Class System | Gates 1-4 passed | SAP config complete |
| **Vendor Loading** | T-5 months | Vendor Masters | Gates 1-4 passed | SAP config complete |
| **Equipment Loading** | T-4 months | Equipment Masters | Gates 1-4 passed | FL hierarchy loaded |
| **Material Loading** | T-3 months | Material Masters | Gates 1-4 passed | Vendor masters loaded |
| **BOM Loading** | T-2 months | Equipment BOM | Gates 1-4 passed | Equipment + materials loaded |
| **Task Lists + Strategies** | T-6 weeks | Task Lists + Maintenance Strategies | Gates 1-4 passed | Materials loaded (for components) |
| **Plan Activation** | T-4 weeks | Maintenance Plans (loaded + activated) | Gates 1-4 passed | Strategies + task lists + equipment |
| **Catalog Configuration** | T-4 weeks | Catalog codes + profiles | FM Table traceability verified | Class system loaded |
| **Outline Agreements** | T-4 weeks | Framework contracts | Gates 1-4 passed | Vendor + material masters loaded |
| **Measuring Points** | T-3 weeks | Measuring Points | Gates 1-4 passed | Equipment masters loaded |
| **Dress Rehearsal** | T-2 weeks | Full regression test | All scenarios pass | All data loaded |
| **Final Data Refresh** | T-1 week | Delta load + corrections | Final validation | Dress rehearsal defects resolved |
| **Go-Live** | T=0 | SAP PM operational | Go-live checklist 100% | All quality gates passed |
| **Post Go-Live Cleansing** | T+1 month | Data cleansing sprint | Known issues resolved | Operational feedback captured |

### Critical Path

The critical path runs through: Configuration → FL Hierarchy → Equipment Masters → Material Masters → Equipment BOM → Task Lists → Maintenance Plans → Dress Rehearsal → Go-Live.

Any delay on this path directly delays go-live. Vendor masters, info records, measuring points, and outline agreements are parallel paths with float.

---

## Data Migration Strategy

### Source Data Mapping

| Source Type | Typical Sources | Mapping Approach |
|-------------|----------------|-----------------|
| **Spreadsheets** | Equipment lists, vendor catalogs, spares lists | Direct column mapping via loading templates; VBA macros for validation |
| **Legacy CMMS** | SAP ECC, Maximo, Infor EAM, Prism | Database extraction; field-by-field mapping document; transformation rules for code conversion |
| **Vendor Data** | OEM manuals, datasheets, BOM packages | Manual extraction to templates; OCR for scanned documents; vendor data request packages |
| **P&IDs** | Engineering drawings | Manual extraction of FL hierarchy and equipment tags; intelligent P&ID parsing where available |
| **Engineering Databases** | SPI/Intools, SmartPlant, AVEVA | Structured export; direct field mapping to SAP fields |

### Data Cleansing Rules

| Rule Category | Rule | Example |
|---------------|------|---------|
| **Duplicates** | Identify and merge duplicate records based on key fields | Two material records for "SKF 6205-2RS" with different descriptions → merge to single record |
| **Naming Standards** | Enforce noun-modifier description format | "Pump, Centrifugal, Slurry Transfer, 250 m3/h" (not "Slurry Transfer Pump 250 m3/h") |
| **Unit Conversion** | Standardize to project UoM | Convert imperial units (gal, in, lb) to SI (L, mm, kg) where project standard is metric |
| **Code Mapping** | Map legacy codes to SAP values | Legacy criticality "H/M/L" → SAP user status "CRIT-A/CRIT-B/CRIT-C" |
| **Abbreviations** | Standardize abbreviations | "Cntrf." "Centrif." "CENT" → "Centrifugal" |
| **Special Characters** | Remove or replace unsupported characters | Remove accented characters from technical descriptions (SAP field limitations) |

### Transformation Rules

| Transformation | Source | Target | Rule |
|---------------|--------|--------|------|
| FL Code Generation | Asset register FLOC hierarchy | SAP FLOC code | Apply naming convention: {PLANT}-{AREA}-{SYSTEM}-{EQUIP} with max 30 characters |
| Equipment Object Type | ISO 14224 equipment class | SAP construction type | Mapping table: ISO 14224 class → SAP object type (one-to-one) |
| Material Type | Spares list category | SAP material type | "Spare Part" → ERSA, "Consumable" → HIBE, "Service" → DIEN |
| Criticality | A/B/C rating | SAP user status | A → "CRIT-A" (user status), B → "CRIT-B", C → "CRIT-C" |
| FM Table → Damage Codes | FM mechanism | SAP code group + code | "Wears" → Code Group "FM-WEAR" → Code "WEAR-01" through "WEAR-nn" |
| FM Table → Cause Codes | FM cause | SAP code group + code | "Abrasive media" → Code Group "FM-ABRA" → Code "ABRA-01" |

### Error Handling

| Error Type | Handling Rule | Queue | SLA |
|------------|--------------|-------|-----|
| **Reject** | Record fails mandatory field validation | Return to data steward for correction | 48 hours |
| **Quarantine** | Record passes structure validation but fails business rule | Hold in staging table; route to business analyst | 1 week |
| **Manual Review** | Record has ambiguous data requiring SME judgment | Route to subject matter expert via loading dashboard | 2 weeks |
| **Auto-Correct** | Record has correctable formatting issues (case, spacing, abbreviation) | Apply transformation rule automatically; log correction | Immediate |
| **Defer** | Non-critical data gap that does not block go-live | Add to post go-live cleansing plan | T+1 month |

---

## Catalog Configuration (Notifications and Work Orders)

### Criticality Catalogs

| Criticality | Code | Description | Sub-Categories |
|-------------|------|-------------|----------------|
| **A — Critical** | CRIT-A | Failure causes immediate safety risk, environmental release, or >$1M/day production loss | A1: Safety-critical, A2: Production-critical, A3: Environmentally-critical |
| **B — Major** | CRIT-B | Failure causes $100K-$1M/day production loss or significant quality impact | B1: High production impact, B2: Quality impact, B3: Regulatory compliance |
| **C — Minor** | CRIT-C | Failure causes <$100K/day impact; workaround available | C1: Low production impact, C2: Convenience, C3: Cosmetic |

### Failure Code Catalogs (ISO 14224 / FM Table Aligned)

#### Damage Codes (Catalog Type C) — Mapped from FM Table Mechanisms

| Code Group | FM Table Mechanism | SAP Damage Codes (Examples) |
|------------|-------------------|----------------------------|
| FM-ARC | Arcs | ARC-01: Electrical arcing on contacts, ARC-02: Arc flash damage |
| FM-BLK | Blocks | BLK-01: Flow blockage, BLK-02: Mechanical seizure |
| FM-BRK | Breaks/Fracture/Separates | BRK-01: Shaft fracture, BRK-02: Housing crack propagation, BRK-03: Coupling separation |
| FM-COR | Corrodes | COR-01: External surface corrosion, COR-02: Internal process-side corrosion, COR-03: Galvanic corrosion |
| FM-CRK | Cracks | CRK-01: Fatigue crack, CRK-02: Stress corrosion crack, CRK-03: Thermal crack |
| FM-DEG | Degrades | DEG-01: Elastomer degradation, DEG-02: Insulation degradation, DEG-03: Lubricant degradation |
| FM-DIS | Distorts | DIS-01: Thermal distortion, DIS-02: Mechanical deformation, DIS-03: Creep deformation |
| FM-DRF | Drifts | DRF-01: Calibration drift, DRF-02: Set point drift, DRF-03: Signal drift |
| FM-EXP | Expires | EXP-01: Certification expiry, EXP-02: Shelf life expiry, EXP-03: Warranty expiry |
| FM-IMM | Immobilised (binds/jams) | IMM-01: Bearing seizure, IMM-02: Valve stem binding, IMM-03: Gearbox jam |
| FM-LPR | Looses Preload | LPR-01: Bolt loosening, LPR-02: Belt tension loss, LPR-03: Spring preload loss |
| FM-OPC | Open-Circuit | OPC-01: Conductor break, OPC-02: Fuse blow, OPC-03: Contact separation |
| FM-OVH | Overheats/Melts | OVH-01: Bearing overheat, OVH-02: Motor winding overheat, OVH-03: Seal melt |
| FM-SEV | Severs (cut/tear/hole) | SEV-01: Belt cut, SEV-02: Diaphragm tear, SEV-03: Pipe wall perforation |
| FM-SHC | Short-Circuits | SHC-01: Winding short, SHC-02: Cable insulation breakdown, SHC-03: Control board short |
| FM-THO | Thermally Overloads | THO-01: Motor thermal overload, THO-02: Transformer overload, THO-03: Cable thermal overload |
| FM-WSH | Washes Off | WSH-01: Coating washout, WSH-02: Grease wash-off, WSH-03: Protective layer removal |
| FM-WER | Wears | WER-01: Abrasive wear, WER-02: Adhesive wear, WER-03: Erosive wear, WER-04: Fretting wear |

#### Cause Codes (Catalog Type 5) — Mapped from FM Table Causes

The 46 official causes from the FM Table become SAP cause code groups organized by cause category. Examples:

| Cause Category | FM Table Causes | SAP Cause Code Group |
|---------------|-----------------|---------------------|
| Operational | Overload, Over-speed, Misoperation, Process upset | CAU-OPR |
| Environmental | Corrosive atmosphere, High humidity, Temperature extremes, UV exposure | CAU-ENV |
| Wear/Aging | Abrasive media, Normal wear-out, Cyclic fatigue, Thermal cycling | CAU-WEA |
| Design/Manufacture | Design deficiency, Manufacturing defect, Material defect, Incorrect specification | CAU-DES |
| Maintenance | Improper lubrication, Incorrect installation, Missed inspection, Contamination | CAU-MNT |
| External | Foreign object damage, Vandalism/sabotage, Natural disaster, Third-party damage | CAU-EXT |

#### Object Part Codes (Catalog Type B)

| Equipment Class | Object Parts |
|----------------|-------------|
| Centrifugal Pump | Impeller, Casing, Shaft, Mechanical Seal, Bearings, Coupling, Base Frame |
| Electric Motor | Stator, Rotor, Bearings (DE), Bearings (NDE), Fan, Terminal Box, Frame |
| Gearbox | Gear Set, Input Shaft, Output Shaft, Bearings, Seals, Housing, Oil System |
| Conveyor | Belt, Pulleys (Head/Tail), Idlers, Drive Assembly, Take-up System, Structure |
| Crusher | Mantle, Concave, Eccentric, Main Shaft, Spider, Hydraulic System, Lubrication System |

#### Activity Codes (Catalog Type A)

| Code | Activity | Description |
|------|----------|-------------|
| ACT-INS | Inspect | Visual or instrument-based inspection without disassembly |
| ACT-REP | Repair | Restoration of function with component repair |
| ACT-RPL | Replace | Full component replacement |
| ACT-OVH | Overhaul | Major disassembly, inspection, and component replacement |
| ACT-LUB | Lubricate | Lubrication service (oil change, grease application) |
| ACT-CAL | Calibrate | Instrument calibration or adjustment |
| ACT-TST | Test | Functional test or performance test |
| ACT-CLN | Clean | Cleaning or flushing operation |
| ACT-ALN | Align | Shaft alignment or belt alignment |
| ACT-BAL | Balance | Dynamic or static balancing |
| ACT-MOD | Modify | Equipment modification or upgrade |

### Catalog Profiles

Each equipment class receives a catalog profile that restricts the available damage codes, cause codes, object part codes, and activity codes to only those relevant for that equipment class. This prevents technicians from selecting irrelevant codes.

| Equipment Class | Relevant Damage Code Groups | Relevant Cause Groups | Object Part Profile |
|----------------|---------------------------|----------------------|-------------------|
| Centrifugal Pump | FM-WER, FM-COR, FM-BRK, FM-IMM, FM-SEV, FM-DEG, FM-LPR | CAU-OPR, CAU-WEA, CAU-MNT, CAU-ENV | Pump parts |
| Electric Motor | FM-THO, FM-SHC, FM-OPC, FM-OVH, FM-WER, FM-DEG, FM-DRF | CAU-OPR, CAU-WEA, CAU-MNT, CAU-ENV, CAU-DES | Motor parts |
| Gearbox | FM-WER, FM-BRK, FM-CRK, FM-IMM, FM-OVH, FM-LPR | CAU-OPR, CAU-WEA, CAU-MNT, CAU-DES | Gearbox parts |
| Conveyor | FM-WER, FM-SEV, FM-BRK, FM-LPR, FM-DIS, FM-COR | CAU-OPR, CAU-WEA, CAU-MNT, CAU-EXT | Conveyor parts |
| Crusher | FM-WER, FM-BRK, FM-IMM, FM-DIS, FM-COR, FM-OVH | CAU-OPR, CAU-WEA, CAU-MNT, CAU-DES | Crusher parts |
| Instrument/Transmitter | FM-DRF, FM-DEG, FM-OPC, FM-SHC, FM-EXP | CAU-ENV, CAU-MNT, CAU-DES, CAU-WEA | Instrument parts |

---

## Common Issues and Mitigation

| # | Issue | Impact | Probability | Mitigation | Responsible |
|---|-------|--------|-------------|------------|-------------|
| 1 | Incomplete vendor data (missing bank details, tax IDs, addresses) | Blocks purchase order creation; delays spare parts procurement | High | Create placeholder vendor records flagged as "blocked for payment"; mandatory data completion campaign parallel to loading; 48-hour SLA for vendor data steward | Procurement |
| 2 | BOM explosion inconsistencies (wrong quantities, missing sub-assemblies, orphan items) | Incorrect spare parts allocation; work order material lists incomplete | High | OEM verification of BOM structure against assembly drawings; cross-check BOM items against initial spares list; automated quantity reasonableness check (flag items >100 qty) | Maintenance Eng. + Vendors |
| 3 | Task list over-engineering (copy-paste from OEM manual without RCM filtering) | Excessive PM workload; planner frustration; actual compliance drops below 50% | High | Only include tasks justified by FMECA/RCM analysis per SAE JA1011; target 5-15 operations per task list; peer review by reliability engineer before loading | Reliability Eng. |
| 4 | Material master duplicates (same part with different descriptions) | Inventory fragmentation; incorrect MRP calculations; wasted warehouse space | High | Enforce noun-modifier description standard; mandatory search-before-create policy using fuzzy matching; automated deduplication scan before each loading batch | Warehouse/Inventory |
| 5 | Measuring point units mismatch (mm/s vs. in/s, C vs. F) | Incorrect alarm thresholds; failed condition monitoring; potential equipment damage | Medium | Project-wide UoM standardization table; automated UoM validation in template; flag all non-SI units for review | Reliability Eng. |
| 6 | Maintenance plan scheduling conflicts (hundreds of plans due on same day) | Work overload on go-live week; impossible to execute all scheduled PM | Medium | Scheduling simulation in QAS before activation; stagger start dates using factory calendar offset; workload leveling analysis before activation | Maintenance Planning |
| 7 | FL hierarchy changes after equipment loading (process design changes) | Mass equipment re-assignment required; cascading BOM and PM plan impacts | Medium | Design change freeze 4 weeks before FL loading; MOC process for late changes; impact assessment required for any FL change after Step 3 | Operations Eng. |
| 8 | Catalog code mapping ambiguity (FM Table mechanism does not clearly map to observed failure) | Inconsistent failure coding; unreliable failure analysis | Medium | Provide decision tree for ambiguous cases; mandatory catalog training for all technicians; first-month "buddy system" for notification coding | Reliability Eng. |

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Loading sequence compliance | All 13 steps executed in correct order with gates passed | 100% | 100% |
| FL hierarchy integrity | No orphan FLOCs, no circular references, naming convention compliance | 100% | 100% |
| Equipment-to-FL assignment | All equipment assigned to valid FLOC | 100% | 100% |
| Material master completeness (mandatory fields) | % of mandatory fields populated per material view | >98% | >95% |
| Material duplicate rate | Duplicate materials in final loaded data | <0.5% | <1.0% |
| BOM coverage (Criticality A equipment) | % of A-class equipment with complete BOM | >95% | >90% |
| Task list coverage (Criticality A equipment) | % of A-class equipment with active task list | 100% | >95% |
| Maintenance plan activation (Criticality A) | % of A-class equipment with active maintenance plan | 100% | >95% |
| Catalog code FM Table traceability | % of damage/cause codes traceable to FM Table | 100% | 100% |
| Measuring point coverage (rotating equipment) | % of rotating equipment with measuring points | >90% | >80% |
| Info record coverage | % of stocked materials with at least one info record | >85% | >75% |
| Dress rehearsal pass rate | % of test scenarios that pass without defects | >95% | >90% |
| Loading error rate | Errors per 1,000 records loaded | <20 | <50 |
| Data steward sign-off | All data stewards signed off on their domain | 100% | 100% |
| Bilingual description coverage | % of records with both EN and ES descriptions | >95% | >90% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment register + FLOC hierarchy | Provides the foundational equipment list and functional location structure for Steps 3, 6, 8 |
| `develop-maintenance-strategy` (J-01) | FMECA + task lists + strategies | Provides failure modes (for catalog codes), task list content, maintenance strategies, and plan definitions for Steps 10-12 |
| `create-maintenance-strategy` | Maintenance strategy documents | Strategic maintenance approach that drives task list design and strategy configuration |
| `generate-initial-spares-list` (K-01) | Spare parts list with BOM data | Provides material master source data, BOM structure, and vendor-material relationships for Steps 5, 7, 8 |
| `manage-vendor-documentation` (I-01) | Vendor manuals + BOM packages | Provides OEM data for equipment masters, BOM, and task lists |
| `agent-procurement` | Vendor master data + outline agreements | Provides vendor data for Step 4 and contract data for Step 13 |
| `agent-project` | Project schedule + cutover dates | Provides go-live date and system-by-system commissioning sequence for cutover timeline |
| `agent-finance` | Cost center structure + settlement rules | Provides financial master data for equipment cost assignments and maintenance order settlement |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `prepare-pssr-package` (I-04) | SAP data readiness confirmation | PSSR checklist includes verification that SAP master data is loaded and validated for each system |
| `model-rampup-trajectory` (H-04) | SAP PM readiness percentage | Data loading completion feeds into overall operational readiness assessment |
| `plan-training-program` | Loaded SAP data for training | Training scenarios use actual loaded master data in QAS environment |
| `create-kpi-dashboard` | SAP PM master data baseline | KPI calculations require loaded equipment, maintenance plans, and catalog codes |
| `agent-maintenance` | Operational SAP PM environment | Maintenance agent operates on the loaded master data post go-live |
| `agent-operations` | Functional location hierarchy | Operations agent uses FL hierarchy for operational reporting and notification creation |
| `track-or-deliverables` | Loading progress metrics | OR tracker monitors data loading completion percentage as a key readiness metric |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-framework` | Alignment | SAP master data scope must align with OR framework system boundaries and readiness definitions |
| `analyze-equipment-criticality` | Criticality ratings | Equipment criticality (A/B/C) drives completeness requirements and PM plan coverage targets |
| `optimize-pm-program` | PM program validation | Post go-live PM program optimization uses loaded task lists and maintenance plans as baseline |
| `benchmark-maintenance-kpis` | Baseline KPIs | Loaded master data enables baseline KPI calculation for maintenance benchmarking |

---

## Templates & References

### Templates

- `templates/01_Class_System_Template.xlsx` — Characteristics, classes, and class types with value lists and data type definitions
- `templates/02_Functional_Location_Template.xlsx` — FLOC hierarchy with mandatory fields, naming convention validation, and parent-child relationships
- `templates/03_Vendor_Master_Template.xlsx` — Vendor records with country-specific fields (RUT for Chile, RFC for Mexico, etc.)
- `templates/04_Material_Master_Template.xlsx` — Material masters with multi-view structure (basic data, MRP, purchasing, storage, accounting)
- `templates/05_Equipment_Master_Template.xlsx` — Equipment records with class assignments, FL linkage, and criticality flags
- `templates/06_Material_Info_Record_Template.xlsx` — Vendor-material price agreements with validity periods
- `templates/07_Equipment_BOM_Template.xlsx` — BOM headers and items with material linkage and quantity validation
- `templates/08_Measuring_Point_Template.xlsx` — Measurement and counter definitions with UoM and threshold values
- `templates/09_Task_List_Template.xlsx` — Task list headers, operations, and material components
- `templates/10_Maintenance_Strategy_Template.xlsx` — Strategy definitions with package structures and scheduling parameters
- `templates/11_Maintenance_Plan_Template.xlsx` — Plan definitions linking strategies, task lists, and equipment
- `templates/12_Outline_Agreement_Template.xlsx` — Framework contract structure with line items and release procedures
- `templates/Catalog_Configuration_Workbook.xlsx` — Damage, cause, object part, and activity codes with FM Table mapping
- `templates/Quality_Gate_Checklist.xlsx` — Gate 1-4 checklist per loading step
- `templates/Cutover_Tracker_Dashboard.xlsx` — Progress tracking with RAG status per step

### Reference Documents

- ISO 14224:2016 — Equipment taxonomy tables (Annex A) for equipment classification
- ISO 55001:2014 — Asset management system requirements
- IEC 81346 — Reference designation system for industrial plants
- SAP Note 110604 — Master data loading sequence for Plant Maintenance
- SAP Best Practices for Mining — Industry-specific PM/MM configuration guide
- SAP S/4HANA Migration Cockpit documentation
- SMRP Best Practice 5.1 — Asset Identification and Hierarchy
- VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`)
- VSC FLOC Naming Convention Standard (internal)
- VSC Equipment Classification Guide (internal)

### Reference Datasets

- ISO 14224 Equipment Class Master List — for class system and object type configuration
- SAP PM Transaction Code Reference (IL01, IE01, IK01, IA05, IP01, etc.)
- Standard material description dictionary (noun-modifier format, EN/ES)
- UoM conversion and standardization tables
- SAP number range allocation reference
- FM Table mechanism-to-damage-code mapping table
- FM Table cause-to-cause-code mapping table

---

## MCP Integrations

### mcp-erp (SAP)

```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Direct SAP system integration for master data loading and validation"
capabilities:
  - Execute LSMW/Migration Cockpit loads via batch input
  - Call BAPIs for individual record creation and validation
  - Run direct input programs (RIIFBI10 for BOM)
  - Query loaded data for cross-reference validation
  - Execute mass change transactions for corrections
  - Monitor batch job status for large loading runs
  - Extract error logs from loading sessions
  - Activate maintenance plans (IP10/IP30)
  - Execute scheduling simulation for maintenance plans
authentication: SAP GUI / RFC / OData (S/4HANA)
usage_in_skill:
  - Steps 2-13: Execute data loading via appropriate tool per step
  - Gates 1-2: Automated validation queries against SAP tables
  - Cutover: Monitor loading progress and error rates
  - Dress rehearsal: Execute test scenarios against loaded data
```

### mcp-sharepoint

```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage for loading templates, source data, and reports"
capabilities:
  - Store and retrieve loading templates (version-controlled)
  - Distribute templates to data stewards
  - Collect completed templates from data stewards
  - Store quality gate reports and error logs
  - Store cutover tracker and progress reports
  - Store dress rehearsal report and go-live approval documents
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Pre-loading: Distribute templates, collect source data
  - During loading: Store error logs, quality gate reports
  - Post-loading: Store dress rehearsal report, go-live package
```

### mcp-project-online

```yaml
name: "mcp-project-online"
server: "@anthropic/project-online-mcp"
purpose: "Cutover schedule integration for timeline tracking"
capabilities:
  - Read project schedule milestones (go-live date, commissioning dates)
  - Update loading progress against cutover plan
  - Trigger schedule alerts when critical path items are delayed
  - Report loading completion to OR PMO dashboard
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Cutover planning: Align loading timeline with project milestones
  - Progress tracking: Update percentage complete per loading step
  - Escalation: Trigger alerts for critical path delays
```

---

## Examples

### Example 1: Master Data Loading for 15,000 Equipment Greenfield Copper Mine

```
Command: load-sap-master-data plan --project "Sierra Verde" --equipment-register "SV-EQ-REG-001.xlsx"

Context:
  - Project: Sierra Verde copper concentrator (greenfield)
  - SAP version: S/4HANA 2023
  - Go-live date: 2027-06-01
  - Plant capacity: 120,000 tpd ore processing

Volume Assessment:
  | Data Object              | Count    | Loading Tool              | Est. Days |
  |--------------------------|----------|---------------------------|-----------|
  | Class System             | 120 classes, 450 characteristics | Manual + Migration Cockpit | 8 |
  | Functional Locations     | 6,500    | Migration Cockpit         | 15        |
  | Vendor Masters           | 820      | Migration Cockpit         | 6         |
  | Equipment Masters        | 15,000   | Migration Cockpit         | 30        |
  | Material Masters         | 25,000   | Migration Cockpit + BAPI  | 45        |
  | Material Info Records    | 32,000   | BAPI (batch)              | 10        |
  | Equipment BOM            | 3,500 (35,000 items) | RIIFBI10          | 20        |
  | Measuring Points         | 6,200    | BAPI                      | 8         |
  | Task Lists               | 1,800    | Migration Cockpit         | 25        |
  | Maintenance Strategies   | 42       | Manual + Migration Cockpit | 3        |
  | Maintenance Plans        | 1,200    | Migration Cockpit         | 15        |
  | Outline Agreements       | 115      | Migration Cockpit         | 8         |
  | Catalog Codes            | 420      | Manual configuration      | 10        |

Cutover Schedule (Go-Live: 2027-06-01):
  | Date           | Milestone                                | Status   |
  |----------------|------------------------------------------|----------|
  | 2026-12-01     | T-6m: FL hierarchy + class system loaded  | On track |
  | 2027-01-01     | T-5m: Vendor masters loaded               | On track |
  | 2027-02-01     | T-4m: Equipment masters loaded            | On track |
  | 2027-03-01     | T-3m: Material masters loaded             | On track |
  | 2027-04-01     | T-2m: Equipment BOM loaded                | On track |
  | 2027-04-20     | T-6w: Task lists + strategies loaded      | On track |
  | 2027-05-04     | T-4w: Maintenance plans activated         | On track |
  | 2027-05-04     | T-4w: Catalog codes + outline agreements  | On track |
  | 2027-05-11     | T-3w: Measuring points loaded             | On track |
  | 2027-05-18     | T-2w: DRESS REHEARSAL                     | Critical |
  | 2027-05-25     | T-1w: Final data refresh + validation     | Critical |
  | 2027-06-01     | T=0: GO-LIVE                              | Target   |
  | 2027-07-01     | T+1m: Post go-live data cleansing         | Planned  |

Resource Plan:
  | Role                        | FTE | Period         |
  |-----------------------------|-----|----------------|
  | SAP PM Functional Consultant | 2   | T-6m to T+1m  |
  | SAP MM Functional Consultant | 1.5 | T-5m to T+1m  |
  | SAP ABAP Developer           | 1   | T-6m to T-2w  |
  | Data Steward - Operations    | 1   | T-6m to T-4m  |
  | Data Steward - Maintenance   | 2   | T-4m to T+1m  |
  | Data Steward - Warehouse     | 1   | T-3m to T+1m  |
  | Data Steward - Procurement   | 1   | T-5m to T-4w  |
  | Data Steward - Reliability   | 1.5 | T-6w to T+1m  |
  | QA/Testing Lead              | 1   | T-2m to T+1m  |

Quality Gate Summary (Example — Step 6: Equipment Masters):
  Gate 1 (Template Completeness):
    - 15,000 records submitted
    - Mandatory fields: 100% populated (PASS)
    - 342 records with missing optional fields (acceptable per B/C class criteria)

  Gate 2 (Cross-Reference):
    - FL assignment: 15,000/15,000 valid FLOCs (PASS)
    - Class assignment: 14,892/15,000 valid class references (108 pending — class not yet created)
    - Action: Create 12 missing classes before re-validation

  Gate 3 (Business Rules):
    - Criticality A equipment with PM plan reference: 2,100/2,100 (100%) (PASS)
    - Rotating equipment with measuring point flag: 4,820/5,100 (94.5%) (PASS — 280 deferred)
    - Equipment status correctly set: 15,000/15,000 (PASS)

  Gate 4 (Sample Verification):
    - 1,500 records sampled (10%)
    - 1,487 confirmed accurate by data steward (99.1%) (PASS)
    - 13 records with minor corrections applied

  Overall: GATE PASSED — Equipment masters approved for production loading

Output:
  "SAP Master Data Loading Plan generated for Sierra Verde.
   Total: 15,000 equipment across 13 loading steps over 7 months.
   Cutover window: 2026-12-01 to 2027-07-01.
   Critical path: FL → Equipment → Materials → BOM → Task Lists → Plans → Dress Rehearsal.
   Resource requirement: 12 FTE peak (T-3m to T-4w).
   42 maintenance strategies serving 1,200 maintenance plans.
   420 catalog codes mapped to VSC Failure Modes Table.
   File: SV_SAP_MD_Loading_Plan_v1.0_20261001.xlsx"
```

### Example 2: Catalog Profile Configuration — FM Table to SAP Mapping for Centrifugal Pump

```
Command: load-sap-master-data catalog-config --fm-table "VSC_Failure_Modes_Table.xlsx" --equipment-class "Centrifugal Pump"

Context:
  - Equipment class: Centrifugal Pump (ISO 14224: Rotating Equipment > Pump > Centrifugal)
  - Catalog profile: PUMP-CENT
  - Target: Configure SAP catalog codes so that when a technician creates a notification
    for a centrifugal pump, only relevant failure codes appear

FM Table Analysis for Centrifugal Pump:
  Relevant Mechanisms (Damage Codes):
  | FM Table Mechanism        | SAP Code Group | SAP Damage Codes                                    |
  |---------------------------|----------------|-----------------------------------------------------|
  | Wears                     | FM-WER         | WER-01: Impeller abrasive wear                      |
  |                           |                | WER-02: Wear ring erosion                            |
  |                           |                | WER-03: Shaft sleeve wear                            |
  |                           |                | WER-04: Bearing wear (journal/rolling element)       |
  | Corrodes                  | FM-COR         | COR-01: Casing internal corrosion                    |
  |                           |                | COR-02: Impeller corrosion-erosion                   |
  |                           |                | COR-03: External surface corrosion                   |
  | Breaks/Fracture/Separates | FM-BRK         | BRK-01: Shaft fracture                               |
  |                           |                | BRK-02: Impeller blade fracture                      |
  |                           |                | BRK-03: Coupling element fracture                    |
  | Immobilised (binds/jams)  | FM-IMM         | IMM-01: Bearing seizure                              |
  |                           |                | IMM-02: Pump seizure (solids ingestion)              |
  | Severs (cut/tear/hole)    | FM-SEV         | SEV-01: Mechanical seal face damage                  |
  |                           |                | SEV-02: Gasket tear/blowout                          |
  |                           |                | SEV-03: Casing erosion perforation                   |
  | Degrades                  | FM-DEG         | DEG-01: Mechanical seal elastomer degradation        |
  |                           |                | DEG-02: O-ring/gasket degradation                    |
  |                           |                | DEG-03: Coupling element degradation                 |
  | Looses Preload            | FM-LPR         | LPR-01: Foundation bolt loosening                    |
  |                           |                | LPR-02: Bearing preload loss                         |
  |                           |                | LPR-03: Gland packing preload loss                   |

  Excluded Mechanisms (not relevant for centrifugal pumps):
  - Arcs (electrical — covered under motor, not pump)
  - Short-Circuits (electrical)
  - Open-Circuit (electrical)
  - Thermally Overloads (electrical — covered under motor)
  - Drifts (instrumentation)
  - Expires (certification/shelf life)
  - Washes Off (coatings — rare for pumps)

  Relevant Causes (Cause Codes):
  | FM Table Cause                    | SAP Cause Code | Cause Group |
  |-----------------------------------|----------------|-------------|
  | Abrasive media (slurry particles) | CAU-WEA-01     | CAU-WEA     |
  | Normal wear-out (operational age) | CAU-WEA-02     | CAU-WEA     |
  | Cyclic fatigue (pressure pulsation)| CAU-WEA-03    | CAU-WEA     |
  | Cavitation                        | CAU-OPR-01     | CAU-OPR     |
  | Dry running                       | CAU-OPR-02     | CAU-OPR     |
  | Overload (excessive flow/head)    | CAU-OPR-03     | CAU-OPR     |
  | Misalignment                      | CAU-MNT-01     | CAU-MNT     |
  | Improper lubrication              | CAU-MNT-02     | CAU-MNT     |
  | Incorrect installation            | CAU-MNT-03     | CAU-MNT     |
  | Contamination (process fluid)     | CAU-MNT-04     | CAU-MNT     |
  | Corrosive atmosphere              | CAU-ENV-01     | CAU-ENV     |
  | Design deficiency                 | CAU-DES-01     | CAU-DES     |
  | Manufacturing defect              | CAU-DES-02     | CAU-DES     |
  | Foreign object damage             | CAU-EXT-01     | CAU-EXT     |

  Object Part Codes (Catalog B) for PUMP-CENT profile:
  | Code    | Object Part       | Description                    |
  |---------|-------------------|--------------------------------|
  | OBJ-IMP | Impeller          | Pump impeller/runner           |
  | OBJ-CAS | Casing            | Pump casing/volute             |
  | OBJ-SFT | Shaft             | Pump shaft                     |
  | OBJ-MSL | Mechanical Seal   | Mechanical seal assembly       |
  | OBJ-BRG | Bearings          | Bearing assembly (DE + NDE)    |
  | OBJ-CPL | Coupling          | Shaft coupling assembly        |
  | OBJ-WRG | Wear Rings        | Casing and impeller wear rings |
  | OBJ-FRM | Base Frame        | Pump baseplate/frame           |
  | OBJ-GLD | Gland Packing     | Stuffing box packing (if applicable) |
  | OBJ-SLV | Shaft Sleeve      | Shaft protection sleeve        |

SAP Catalog Profile Configuration (Transaction QS41):
  Profile ID: PUMP-CENT
  Description EN: Centrifugal Pump Failure Catalog Profile
  Description ES: Perfil de Catalogo de Fallas para Bomba Centrifuga

  Assigned Code Groups:
    Catalog C (Damage):  FM-WER, FM-COR, FM-BRK, FM-IMM, FM-SEV, FM-DEG, FM-LPR
    Catalog 5 (Cause):   CAU-OPR, CAU-WEA, CAU-MNT, CAU-ENV, CAU-DES, CAU-EXT
    Catalog B (Object):  OBJ-IMP, OBJ-CAS, OBJ-SFT, OBJ-MSL, OBJ-BRG, OBJ-CPL,
                         OBJ-WRG, OBJ-FRM, OBJ-GLD, OBJ-SLV
    Catalog A (Activity): ACT-INS, ACT-REP, ACT-RPL, ACT-OVH, ACT-LUB, ACT-ALN, ACT-BAL

Traceability Example (Notification Scenario):
  A technician reports a pump failure on equipment 300-PP-001A (Slurry Transfer Pump A).

  In SAP Notification (IW21):
    Equipment: 300-PP-001A
    Catalog Profile: PUMP-CENT (auto-assigned from equipment class)

    Damage Code:    WER-01 (Impeller abrasive wear)
      → FM Table:   Mechanism = "Wears"
    Cause Code:     CAU-WEA-01 (Abrasive media — slurry particles)
      → FM Table:   Cause = "Abrasive media (slurry particles)"
    Object Part:    OBJ-IMP (Impeller)
    Activity:       ACT-RPL (Replace)

    Full FM Table Reference:
      "[Impeller] Wears due to Abrasive media (slurry particles)"

    This notification feeds directly into:
      - Failure analysis (MCBR/MCBZ reports)
      - Reliability trending (MTBF by failure mechanism)
      - Spare parts consumption tracking (impeller stock depletion)
      - Maintenance strategy review (is PM frequency adequate?)

Output:
  "Catalog profile PUMP-CENT configured for Centrifugal Pump class.
   7 damage code groups (21 damage codes) mapped from FM Table mechanisms.
   14 cause codes mapped from FM Table causes across 6 cause groups.
   10 object part codes defined.
   7 activity codes assigned.
   Profile restricts technicians to only pump-relevant failure codes.
   Full traceability from SAP notification → FM Table → FMECA maintained.
   File: SV_SAP_Catalog_Config_v1.0_20261115.xlsx"
```

---

*This skill is maintained by the VSC OR System multi-agent architecture. Last updated: 2026-02-17.*
*Skill ID: AM-SAP-02 | Category: D. Technical Deliverables | Priority: High*
