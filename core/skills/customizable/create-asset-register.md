# Create Asset Register
## Skill ID: A-ASSET-REG-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Generate a comprehensive master asset register from raw equipment lists, P&IDs, and datasheets. The asset register serves as the foundational data backbone for all Operational Readiness (OR) activities, including maintenance strategy development, spare parts planning, CMMS configuration, and lifecycle cost analysis. Without a properly structured asset register, downstream OR processes cannot function effectively.

This skill transforms unstructured or semi-structured equipment data into a standardized, hierarchical asset taxonomy compliant with ISO 14224 (Petroleum, petrochemical and natural gas industries -- Collection and exchange of reliability and maintenance data for equipment). The register enables consistent asset identification across all project phases, from engineering through commissioning to steady-state operations.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Data Normalization**: Raw equipment lists from multiple sources (vendors, EPC contractors, owner's engineering) use inconsistent naming conventions, numbering schemes, and classification systems. The agent must normalize all inputs into a single coherent taxonomy.

2. **Hierarchical Structure**: Assets must be organized in a Functional Location (FLOC) hierarchy following the plant's Technical Object Structure (TOS). This typically follows: Site > Area/Unit > System > Equipment > Component/Maintainable Item.

3. **ISO 14224 Compliance**: Equipment classification, equipment types, and taxonomy levels must conform to ISO 14224:2016 categories. The agent must map each equipment item to its correct ISO 14224 equipment class, subunit, and maintainable item level.

4. **Completeness Validation**: The agent must identify gaps in the source data -- missing tag numbers, unclassified equipment, orphan items without parent systems, and duplicate entries.

5. **Downstream Readiness**: The output register must be directly importable into CMMS platforms (SAP PM, Maximo, Infor EAM) and must include all mandatory fields required by the target CMMS.

## VSC Failure Modes Table Reference

The asset register may link to the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) as the standard failure mode library for each equipment class. When downstream skills (maintenance strategy, FMECA) consume the asset register, failure modes are assigned using the table's **[WHAT] → [Mechanism] due to [Cause]** structure (18 mechanisms, 46 causes, 72 combinations).

## Trigger / Invocation

```
/create-asset-register
```

**Aliases**: `/asset-register`, `/equipment-register`, `/registro-activos`

**Trigger Conditions**:
- User provides equipment lists (any format: .xlsx, .csv, .pdf, .docx)
- User provides P&ID references or extractions
- User requests asset hierarchy creation or FLOC structure
- Downstream skills (maintenance strategy, spare parts) require asset register as input

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Equipment List(s) | .xlsx, .csv, .pdf | Master equipment list(s) from EPC/engineering. Must contain at minimum: tag number, equipment description, equipment type |
| Plant/Site Hierarchy Definition | .xlsx, .docx, or text | Definition of site structure: areas, units, systems. Can be extracted from project scope documents |
| Project Context | Text | Project name, industry sector (mining, O&G, power, etc.), plant type, geographic location |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| P&IDs | .pdf, .dwg references | Process and Instrumentation Diagrams for system-level validation and parent-child relationships |
| Equipment Datasheets | .pdf, .xlsx | Detailed specifications for key attributes (design pressure, flow rates, materials, etc.) |
| Vendor Equipment Lists | .xlsx, .csv | Vendor-specific sublists with serial numbers, model numbers |
| Existing FLOC Structure | .xlsx | If migrating from an existing plant, the current FLOC hierarchy |
| CMMS Field Mapping | .xlsx, .docx | Target CMMS platform field requirements for direct import compatibility |
| Naming Convention Standard | .docx | Client-specific naming/numbering conventions for tag numbers and FLOC codes |

### Input Validation Rules

- Equipment lists with fewer than 10 items trigger a warning for potential incompleteness
- Tag numbers must follow a recognizable pattern (agent attempts auto-detection)
- Duplicate tag numbers across input files are flagged immediately
- Equipment without descriptions are flagged as incomplete records

## Output Specification

### Primary Output: Asset Register (.xlsx)

**Filename**: `{ProjectCode}_Asset_Register_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Asset Register"
Master register with the following columns:

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | FLOC_Level_1 | Site/Plant | PLANTA-CU-01 |
| B | FLOC_Level_2 | Area/Unit | AREA-100 |
| C | FLOC_Level_3 | System | SYS-MOLIENDA |
| D | FLOC_Level_4 | Equipment | MOL-CR-001 |
| E | FLOC_Level_5 | Component/MI | MOL-CR-001-MOT |
| F | FLOC_Code | Full FLOC path | PLANTA-CU-01.AREA-100.SYS-MOLIENDA.MOL-CR-001 |
| G | Tag_Number | Engineering tag | 100-PP-001 |
| H | Equipment_Description | Full description | Centrifugal Pump - Slurry Transfer |
| I | Equipment_Description_ES | Spanish description | Bomba Centrifuga - Transferencia de Pulpa |
| J | ISO14224_Class | ISO 14224 class | Rotating Equipment |
| K | ISO14224_Type | ISO 14224 type | Centrifugal Pump |
| L | Equipment_Category | Category code | PUMP-CENT |
| M | Criticality_Rating | ABC criticality | A |
| N | System_Code | Parent system | 100-SYS-SLURRY |
| O | Area_Code | Parent area | AREA-100 |
| P | Manufacturer | OEM | Metso/Outotec |
| Q | Model_Number | Model | HM150 |
| R | Serial_Number | Serial | If available |
| S | Design_Capacity | Capacity | 250 m3/h |
| T | Material_Class | Material | SS316L |
| U | Weight_kg | Weight | 2,500 |
| V | Power_kW | Power rating | 75 |
| W | Voltage_V | Voltage | 4,160 |
| X | Location_Building | Physical location | Concentrator Building |
| Y | Location_Level | Floor/Level | Ground Floor |
| Z | Spared | Yes/No | Yes |
| AA | Spare_Tag | Spare equipment tag | 100-PP-001A/B |
| AB | P&ID_Reference | P&ID number | 100-PID-001 Rev C |
| AC | Datasheet_Reference | Datasheet ref | DS-100-PP-001 |
| AD | Status | Registration status | Complete / Incomplete / Review |
| AE | Notes | Agent notes | Missing datasheet, weight estimated |

#### Sheet 2: "FLOC Hierarchy"
Tree-structure view of the full FLOC hierarchy with indent levels, parent-child relationships, and item counts per level.

#### Sheet 3: "ISO 14224 Mapping"
Cross-reference table mapping each equipment type to its ISO 14224 classification, including taxonomy level, equipment class, subunit breakdown.

#### Sheet 4: "Data Quality Report"
Summary of data quality findings:
- Total assets registered
- Assets per FLOC level
- Completeness percentage per field
- Duplicate entries found
- Orphan items (no parent system)
- Missing mandatory fields
- Suggested corrections

#### Sheet 5: "Statistics"
Summary statistics:
- Equipment count by type, area, system
- Equipment count by criticality
- Equipment count by ISO 14224 class
- Coverage analysis (% of P&ID equipment captured)

### Formatting Standards
- Header row: Bold, dark blue background (#003366), white font
- Data validation dropdowns for: Criticality_Rating, ISO14224_Class, Status
- Conditional formatting: Red for "Incomplete" status, Yellow for "Review"
- Column widths auto-fitted to content
- Freeze panes on header row and FLOC columns (A-F)
- Named ranges for key data tables
- Print area defined for each sheet

### Secondary Output: Summary Report (.docx)

Brief narrative report (2-4 pages) covering:
- Scope of the asset register (number of assets, areas covered)
- Data sources used and their quality assessment
- Key decisions made during classification
- Gaps and recommendations for data completion
- FLOC hierarchy diagram (text-based tree)

## Methodology & Standards

### Primary Standards
- **ISO 14224:2016** - Collection and exchange of reliability and maintenance data for equipment. Defines equipment taxonomy, classification, and data collection requirements.
- **ISO 55000:2014** - Asset management overview, principles, and terminology.
- **ISO 55001:2014** - Asset management systems requirements.

### Supporting Standards & Frameworks
- **EN 13306:2017** - Maintenance terminology. Used for consistent maintenance-related descriptors.
- **IEC 81346** - Industrial systems, installations and equipment -- Structuring principles and reference designations. For reference designation systems.
- **KKS (Kraftwerk-Kennzeichensystem)** - Power plant classification system (if applicable to power sector projects).
- **RDS-PP** - Reference Designation System for Power Plants (if applicable).

### Industry Best Practices
- SAP PM functional location hierarchy design guidelines
- IBM Maximo asset hierarchy best practices
- SMRP (Society for Maintenance and Reliability Professionals) asset hierarchy guidelines
- GFMAM (Global Forum on Maintenance and Asset Management) asset information requirements

### VSC-Specific Standards
- VSC FLOC Naming Convention Standard (internal)
- VSC Equipment Classification Guide (internal)
- VSC OR System taxonomy mapping tables

## Step-by-Step Execution

### Phase 1: Input Analysis & Validation (Steps 1-3)

**Step 1: Receive and Parse Input Files**
- Ingest all provided equipment lists, P&IDs, and datasheets
- Identify file formats and extract structured data
- Log all source files with metadata (filename, date, version, source/originator)

**Step 2: Input Quality Assessment**
- Count total equipment items across all inputs
- Identify the tag numbering convention used (auto-detect pattern)
- Check for duplicate tag numbers within and across files
- Assess field completeness for each input file
- Generate initial data quality score (0-100%)

**Step 3: Define Plant Hierarchy**
- Extract or confirm the site/area/unit/system hierarchy from project documentation
- If not provided, propose a hierarchy based on tag number prefixes and equipment groupings
- Validate hierarchy against P&ID system boundaries (if P&IDs provided)
- Present hierarchy to user for confirmation before proceeding

### Phase 2: Data Normalization & Classification (Steps 4-7)

**Step 4: Normalize Equipment Data**
- Standardize equipment descriptions (consistent capitalization, abbreviation handling)
- Normalize units of measurement (all to SI or project-standard units)
- Clean tag numbers (remove extra spaces, standardize separators)
- Merge duplicate entries, preserving the most complete data from each source
- Create bilingual descriptions (English + Spanish) where possible

**Step 5: ISO 14224 Classification**
- Map each equipment item to its ISO 14224 equipment class
- Assign taxonomy levels per ISO 14224:
  - Level 1: Industry
  - Level 2: Business category
  - Level 3: Installation
  - Level 4: Plant/Unit
  - Level 5: Section/System
  - Level 6: Equipment unit (class)
  - Level 7: Subunit
  - Level 8: Component/Maintainable item
  - Level 9: Part
- For equipment not covered by ISO 14224, use the closest analogous classification and flag for review

**Step 6: Build FLOC Structure**
- Generate FLOC codes following the confirmed hierarchy
- Assign each equipment item to its correct position in the FLOC tree
- Create parent-child relationships
- Identify equipment that spans multiple systems (shared/common equipment)
- Handle spared equipment (A/B designations, standby units)

**Step 7: Enrich Data from Datasheets**
- If datasheets are provided, extract key attributes:
  - Design capacity, pressure, temperature
  - Materials of construction
  - Power ratings, voltage, frequency
  - Physical dimensions and weight
  - Manufacturer, model, serial number
- Cross-reference datasheet data with equipment list data for consistency
- Flag discrepancies between sources

### Phase 3: Quality Assurance & Validation (Steps 8-9)

**Step 8: Completeness & Consistency Checks**
- Verify every equipment item has a valid FLOC assignment
- Check for orphan equipment (items without parent systems)
- Verify ISO 14224 classification for all items
- Check for missing mandatory fields per output specification
- Validate tag number uniqueness
- Cross-check equipment counts against P&ID equipment counts (if available)
- Verify parent-child relationships are logically consistent

**Step 9: Generate Data Quality Report**
- Calculate overall register completeness percentage
- List all data gaps with severity classification:
  - Critical: Missing tag number, missing FLOC assignment
  - Major: Missing ISO 14224 class, missing description
  - Minor: Missing datasheet reference, missing location
- Provide specific recommendations for each gap
- Summarize statistics by area, system, equipment type

### Phase 4: Output Generation (Steps 10-11)

**Step 10: Generate Asset Register Workbook**
- Create .xlsx file with all five sheets as specified
- Apply formatting standards (headers, conditional formatting, data validation)
- Set up named ranges and print areas
- Validate Excel formulas and cross-sheet references

**Step 11: Generate Summary Report**
- Create .docx summary report with:
  - Executive summary of register scope
  - Data source inventory
  - FLOC hierarchy diagram
  - Key findings and recommendations
  - Data quality dashboard
- Apply VSC document formatting standards

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Field completeness (mandatory fields) | >95% | >90% |
| ISO 14224 classification accuracy | >95% | >91% |
| FLOC hierarchy consistency | 100% | 100% |
| Duplicate detection accuracy | >99% | >95% |
| Tag number validation | 100% | 100% |
| Bilingual description coverage | >90% | >80% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Hierarchy Logic**: Every equipment item must have a logical path from site to component level. No orphan items allowed.
- **Classification Consistency**: Similar equipment types must be classified identically across the register. No inconsistent ISO 14224 mappings for the same equipment type.
- **Naming Convention Adherence**: All FLOC codes and tag numbers must follow the defined naming convention without exceptions.
- **Data Traceability**: Every data point must be traceable to its source document (file name, sheet, row reference).
- **Professional Quality**: The output must be directly usable by a Reliability Engineer or CMMS Administrator without significant rework.

### Validation Process
1. Automated validation checks (duplicates, completeness, format)
2. Cross-reference validation (tag numbers vs. P&IDs)
3. ISO 14224 mapping review (spot-check 10% of entries)
4. FLOC hierarchy integrity check (parent-child consistency)
5. Final quality score calculation and reporting

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| Document Ingestion Agent | Input processing | Parses raw equipment lists, P&IDs, datasheets into structured data |
| OCR/Data Extraction Agent | Data extraction | Extracts equipment data from scanned PDFs and drawings |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-maintenance-strategy` | Asset register | Uses asset register as the basis for RCM/FMEA analysis |
| `create-spare-parts-strategy` | Asset register + criticality | Uses equipment list and criticality for spare parts classification |
| `create-risk-assessment` | Equipment list | Uses equipment data for operational risk identification |
| `create-commissioning-plan` | Asset register | Uses equipment list for commissioning sequence planning |
| `create-shutdown-plan` | Asset register | Uses asset data for shutdown scope definition |
| CMMS Configuration Agent | Asset register | Imports FLOC hierarchy and equipment data into CMMS |
| `create-kpi-dashboard` | Asset statistics | Uses asset counts and classifications for KPI baseline |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-framework` | Alignment | Asset register scope must align with OR framework system boundaries |
| `create-or-playbook` | Reference | Asset register structure reflects OR domain definitions |

## Templates & References

### Templates
- `templates/asset_register_template.xlsx` - Blank asset register template with all sheets, formatting, and data validation pre-configured
- `templates/floc_hierarchy_template.xlsx` - FLOC hierarchy template with example structure
- `templates/iso14224_mapping_table.xlsx` - Complete ISO 14224 equipment classification reference table
- `templates/data_quality_checklist.xlsx` - Data quality validation checklist

### Reference Documents
- ISO 14224:2016 Equipment taxonomy tables (Annex A)
- VSC FLOC Naming Convention Guide v3.0
- VSC Equipment Classification Standard v2.1
- SAP PM FLOC Configuration Guide
- Maximo Asset Hierarchy Setup Guide
- SMRP Best Practice 5.1 - Asset Identification and Hierarchy

### Reference Datasets
- ISO 14224 Equipment Class Master List
- Standard equipment abbreviation dictionary (EN/ES)
- Unit of measurement conversion tables
- Material classification reference (ASTM/EN standards)

## Examples

### Example Output Structure

**Asset Register - Sheet 1 Sample Rows:**

```
| FLOC_L1      | FLOC_L2   | FLOC_L3        | FLOC_L4      | FLOC_L5          | FLOC_Code                                        | Tag_Number | Description                        | ISO14224_Class     | ISO14224_Type    | Criticality |
|--------------|-----------|----------------|--------------|------------------|--------------------------------------------------|------------|------------------------------------|--------------------|------------------|-------------|
| PLANTA-CU-01 | AREA-100  | SYS-MOLIENDA   | MOL-SAG-001  |                  | PLANTA-CU-01.AREA-100.SYS-MOLIENDA.MOL-SAG-001  | 100-ML-001 | SAG Mill 40ft x 22ft               | Rotating Equipment | Mill             | A           |
| PLANTA-CU-01 | AREA-100  | SYS-MOLIENDA   | MOL-SAG-001  | MOL-SAG-001-MOT  | PLANTA-CU-01.AREA-100.SYS-MOLIENDA.MOL-SAG-001.MOT | 100-ML-001-M01 | SAG Mill Drive Motor 22MW     | Rotating Equipment | Electric Motor   | A           |
| PLANTA-CU-01 | AREA-100  | SYS-MOLIENDA   | MOL-SAG-001  | MOL-SAG-001-LUB  | PLANTA-CU-01.AREA-100.SYS-MOLIENDA.MOL-SAG-001.LUB | 100-ML-001-L01 | SAG Mill Lubrication System   | Static Equipment   | Lubrication Sys  | A           |
| PLANTA-CU-01 | AREA-200  | SYS-FLOTACION   | FLO-CEL-001  |                  | PLANTA-CU-01.AREA-200.SYS-FLOTACION.FLO-CEL-001 | 200-FL-001 | Rougher Flotation Cell #1          | Static Equipment   | Flotation Cell   | B           |
| PLANTA-CU-01 | AREA-300  | SYS-BOMBEO     | BOM-CEN-001  |                  | PLANTA-CU-01.AREA-300.SYS-BOMBEO.BOM-CEN-001    | 300-PP-001A| Slurry Transfer Pump A (Spared)    | Rotating Equipment | Centrifugal Pump | A           |
```

**FLOC Hierarchy - Sample Tree:**

```
PLANTA-CU-01 (Planta Concentradora de Cobre)
  |-- AREA-100 (Molienda)
  |     |-- SYS-MOLIENDA (Sistema de Molienda)
  |     |     |-- MOL-SAG-001 (Molino SAG)
  |     |     |     |-- MOL-SAG-001-MOT (Motor Principal)
  |     |     |     |-- MOL-SAG-001-LUB (Sistema Lubricacion)
  |     |     |     |-- MOL-SAG-001-HID (Sistema Hidraulico)
  |     |     |-- MOL-BOL-001 (Molino de Bolas)
  |     |-- SYS-CLASIFICACION (Sistema de Clasificacion)
  |     |     |-- HID-CIC-001 (Hidrociclon Cluster 1)
  |-- AREA-200 (Flotacion)
  |     |-- SYS-FLOTACION (Sistema de Flotacion)
  |     |     |-- FLO-CEL-001 (Celda Rougher 1)
  |-- AREA-300 (Bombeo y Transporte)
        |-- SYS-BOMBEO (Sistema de Bombeo)
              |-- BOM-CEN-001 (Bomba Centrifuga Pulpa)
```

**Data Quality Report - Sample:**

```
ASSET REGISTER DATA QUALITY SUMMARY
====================================
Total Assets Registered: 1,247
  - Level 4 (Equipment): 823
  - Level 5 (Components): 424

Field Completeness:
  - Tag Number: 100% (1,247/1,247)
  - Description: 99.8% (1,244/1,247) -- 3 items missing
  - ISO 14224 Class: 97.2% (1,212/1,247) -- 35 items unclassified
  - Criticality: 85.6% (1,068/1,247) -- 179 items pending
  - Manufacturer: 72.1% (899/1,247) -- requires datasheet input

Duplicates Found: 12 (resolved: 10, pending review: 2)
Orphan Items: 0
Overall Quality Score: 89.4% -- Target: >91%
Recommendation: Provide datasheets for Area-300 to improve completeness
```
