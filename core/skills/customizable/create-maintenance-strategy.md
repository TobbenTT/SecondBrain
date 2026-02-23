# Create Maintenance Strategy
## Skill ID: create-maintenance-strategy
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose
Generates comprehensive maintenance strategies based on Reliability Centered Maintenance (RCM), Failure Mode Effects and Criticality Analysis (FMECA), and Condition-Based Maintenance (CBM) methodologies. This skill produces the foundational maintenance documentation that determines how each asset in an industrial facility will be maintained throughout its operational life.

The maintenance strategy is a cornerstone of Operational Readiness. It directly impacts asset availability, maintenance costs, safety outcomes, and operational performance. A well-developed strategy ensures that maintenance resources are allocated based on risk and criticality rather than arbitrary schedules, resulting in optimized total cost of ownership.

## Intent & Specification
The AI agent MUST understand that:

1. **RCM is the Core Methodology**: Reliability Centered Maintenance (per SAE JA1011/JA1012) is the systematic process used to determine maintenance requirements. The agent must follow the RCM logic tree rigorously, not approximate it.
2. **FMECA is the Analytical Engine**: Each equipment item undergoes Failure Mode, Effects, and Criticality Analysis to identify how it can fail, the consequences of each failure mode, and the appropriate maintenance task to address it.
3. **CBM is the Modern Overlay**: Condition-Based Maintenance (predictive/prescriptive) technologies must be recommended where technically feasible and economically justified, moving maintenance from time-based to condition-based wherever possible.
4. **Criticality Drives Strategy**: Not all equipment is equal. A criticality analysis (using risk matrices aligned with ISO 14224 equipment taxonomy and the VSC Failure Modes Table for failure mode classification) determines the depth of analysis each asset receives.
5. **Output Must Be Implementable**: The strategy documents must be detailed enough to be directly loaded into a CMMS (SAP PM, Maximo, Infor EAM) as maintenance plans and task lists.
6. **Industry Context Matters**: Maintenance strategies vary significantly between mining, oil & gas, power generation, and water treatment. The agent must apply industry-specific failure data and benchmarks.
7. **Language**: Spanish (Latin American) by default, with technical terms in their standard English form where industry convention requires it (e.g., MTBF, FMECA, RCM).

## Trigger / Invocation
```
/create-maintenance-strategy
```

### Natural Language Triggers
- "Create a maintenance strategy for [plant/equipment]"
- "Develop RCM analysis for [system]"
- "Generate FMECA worksheets for [equipment list]"
- "Build a maintenance plan using RCM methodology"
- "Crear estrategia de mantenimiento para [planta/equipo]"
- "Desarrollar analisis RCM/FMECA"
- "Generar plan de mantenimiento basado en confiabilidad"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `equipment_list` | Master equipment list with tag numbers, descriptions, and hierarchy | .xlsx / .csv | Client / Engineering |
| `equipment_datasheets` | Technical specifications for each equipment type | .pdf / .xlsx | Vendor / Engineering |
| `process_description` | Description of the process and how equipment functions within it | .docx / .pdf | Engineering |
| `operating_context` | Operating environment, duty cycle, throughput requirements | Text / .docx | Client Operations |
| `industry_sector` | Mining, Oil & Gas, Power, Water, etc. | Text | User |
| `site_location` | Geographic location (affects environmental factors) | Text | User |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `failure_history` | Historical failure data (work orders, breakdown records) | Industry generic data (OREDA, IEEE 493) |
| `p_and_ids` | Piping & Instrumentation Diagrams | Derive from process description |
| `existing_maintenance_plans` | Current PM procedures if brownfield | None (greenfield assumed) |
| `vendor_maintenance_manuals` | OEM recommended maintenance | Generic OEM recommendations |
| `criticality_matrix` | Client's risk assessment matrix | VSC standard 5x5 matrix |
| `cmms_system` | Target CMMS for plan upload | Generic (SAP PM compatible) |
| `regulatory_requirements` | Country/industry-specific maintenance regulations | Chilean/LATAM standards |
| `spare_parts_catalog` | Spare parts lists and lead times | Generate from analysis |
| `operating_hours` | Annual operating hours per equipment | 8,000 hrs/year (continuous) |
| `target_availability` | Target plant/system availability | 92% (industry dependent) |

### Context Enrichment
The agent should automatically:
- Search OREDA (Offshore and Onshore Reliability Data) or equivalent databases for generic failure rates when site-specific data is unavailable
- Retrieve applicable regulatory maintenance requirements (e.g., pressure vessel inspections, electrical testing)
- Pull CBM technology catalogs for applicable predictive techniques
- Identify industry benchmarks for maintenance KPIs (MTBF, MTTR, availability)

## Output Specification

### Document 1: Maintenance Strategy Report (.docx)
**Filename**: `VSC_EstrategiaMto_{ProjectCode}_{SystemCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project identification
2. **Document Control** - Revision history, approval matrix
3. **Table of Contents**
4. **Executive Summary** (2-3 pages)
   - Strategy overview and key findings
   - Criticality distribution summary
   - Recommended maintenance mix (PM/PdM/CM/RTF)
   - Estimated maintenance cost profile
5. **Introduction & Scope** (1-2 pages)
   - Systems and equipment covered
   - Methodology overview
   - Standards and references
6. **Operating Context** (2-3 pages)
   - Process description
   - Operating environment and conditions
   - Performance requirements and targets
   - Regulatory and HSE requirements
7. **Criticality Analysis** (3-5 pages)
   - 7.1 Criticality methodology and matrix
   - 7.2 Criticality results by system
   - 7.3 Criticality distribution charts
   - 7.4 High-criticality equipment summary
8. **RCM Analysis Summary** (5-10 pages)
   - 8.1 RCM methodology (SAE JA1011 compliance statement)
   - 8.2 Functional analysis summary
   - 8.3 Failure mode analysis summary
   - 8.4 Maintenance task selection logic
   - 8.5 Default strategy rationale
   - 8.6 Key findings and recommendations by system
9. **Maintenance Strategy by System** (variable)
   - For each system:
     - System description and boundaries
     - Equipment within scope
     - Criticality summary
     - Recommended maintenance approach
     - Key maintenance tasks summary
     - CBM recommendations
     - Spare parts requirements
10. **Condition-Based Maintenance Program** (3-5 pages)
    - 10.1 CBM technology recommendations
    - 10.2 Vibration analysis program
    - 10.3 Thermography program
    - 10.4 Oil analysis program
    - 10.5 Ultrasound program
    - 10.6 Other technologies (motor current analysis, alignment, etc.)
    - 10.7 CBM route design and frequencies
11. **Maintenance Organization Requirements** (2-3 pages)
    - Estimated maintenance workforce
    - Skill requirements
    - Tool and workshop requirements
12. **Maintenance KPIs** (1-2 pages)
    - Recommended KPI framework
    - Target values and benchmarks
13. **Implementation Roadmap** (1-2 pages)
    - CMMS configuration requirements
    - Rollout plan
    - Continuous improvement cycle
14. **Appendices**
    - A: Complete equipment list with criticality ratings
    - B: RCM/FMECA worksheets (reference to .xlsx)
    - C: CBM technology specification sheets
    - D: Regulatory maintenance requirements register

### Document 2: RCM/FMECA Workbook (.xlsx)
**Filename**: `VSC_RCM_FMECA_{ProjectCode}_{SystemCode}_{Version}_{Date}.xlsx`

**Sheets**:

#### Sheet 1: Equipment Register
| Column | Description |
|--------|-------------|
| Tag Number | Equipment tag (e.g., P-2101A) |
| Description | Equipment description |
| System | Parent system |
| Equipment Type | Pump, motor, valve, etc. |
| Manufacturer | OEM |
| Model | Model number |
| Criticality Score | Calculated criticality (1-25) |
| Criticality Rating | A (Critical), B (Important), C (General) |

#### Sheet 2: Criticality Analysis
| Column | Description |
|--------|-------------|
| Tag Number | Equipment tag |
| Safety Consequence (1-5) | Impact on personnel safety |
| Environmental Consequence (1-5) | Environmental impact |
| Production Consequence (1-5) | Impact on production/throughput |
| Maintenance Cost Consequence (1-5) | Repair cost impact |
| Probability of Failure (1-5) | Likelihood based on history/data |
| Risk Priority Number | Consequence x Probability |
| Criticality Rating | A/B/C classification |

#### Sheet 3: Functional Analysis
| Column | Description |
|--------|-------------|
| System | System name |
| Subsystem | Subsystem name |
| Tag Number | Equipment tag |
| Function Number | F1, F2, F3... |
| Primary/Secondary | Function classification |
| Function Statement | "To [verb] [object] [performance standard]" |
| Functional Failure | Ways the function can fail |

#### Sheet 4: FMECA Worksheet (Core Analysis)
| Column | Description |
|--------|-------------|
| Tag Number | Equipment tag |
| Function | Function reference |
| Functional Failure | Failure mode reference |
| Failure Mode | Specific failure mechanism |
| Failure Cause | Root cause |
| Failure Effect (Local) | Effect on the equipment |
| Failure Effect (System) | Effect on the system |
| Failure Effect (Plant) | Effect on the plant |
| Detection Method | How the failure is detected |
| Safety Consequence | Y/N |
| Environmental Consequence | Y/N |
| Operational Consequence | Y/N |
| Non-Operational Consequence | Y/N |
| Recommended Task | Maintenance task type |
| Task Description | Specific maintenance activity |
| Frequency | Task interval |
| Responsible | Craft/trade |
| Estimated Duration | Task duration (hours) |
| CBM Technology | Applicable PdM technology |
| Spare Parts Required | Parts needed for task |

#### Sheet 5: Maintenance Plan Summary
| Column | Description |
|--------|-------------|
| Task ID | Unique task identifier |
| Tag Number | Equipment tag |
| Task Type | PM/PdM/CM/Inspection |
| Task Description | Activity description |
| Frequency | Daily/Weekly/Monthly/Quarterly/Annual/Condition |
| Duration (hrs) | Estimated task duration |
| Craft | Required trade/skill |
| Crew Size | Number of technicians |
| Equipment State | Running/Shutdown |
| Safety Permits | Required permits |
| Special Tools | Required special tools |
| Materials/Parts | Required materials |
| CMMS Task Code | For CMMS upload |

#### Sheet 6: CBM Program
| Column | Description |
|--------|-------------|
| Tag Number | Equipment tag |
| CBM Technology | Vibration/Thermo/Oil/Ultrasound/etc. |
| Measurement Point | Location on equipment |
| Parameter | What is measured |
| Frequency | Measurement interval |
| Alert Threshold | Warning level |
| Alarm Threshold | Action required level |
| Route | CBM route assignment |

#### Sheet 7: Spare Parts Requirements
| Column | Description |
|--------|-------------|
| Tag Number | Equipment tag |
| Part Number | Spare part number |
| Description | Part description |
| Quantity per Event | Parts per maintenance event |
| Annual Consumption | Expected annual usage |
| Unit Cost (USD) | Part unit cost |
| Lead Time (weeks) | Procurement lead time |
| Stocking Policy | Stock/Non-stock/Insurance |

#### Sheet 8: KPI Targets
| Column | Description |
|--------|-------------|
| KPI | Key Performance Indicator name |
| Definition | How it is calculated |
| Target | Target value |
| Benchmark | Industry benchmark |
| Measurement Frequency | How often measured |

## Methodology & Standards

### Primary Standards (Mandatory Compliance)
| Standard | Application |
|----------|-------------|
| **SAE JA1011** | Evaluation criteria for RCM processes - the strategy MUST meet all criteria |
| **SAE JA1012** | Guide to the RCM standard - methodology reference |
| **ISO 14224** | Collection and exchange of reliability and maintenance data - equipment taxonomy reference (failure mode classification per VSC Failure Modes Table) |
| **ISO 55000/55001/55002** | Asset Management - strategic alignment of maintenance with asset management objectives |

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** Every failure mode identified in this maintenance strategy — whether in FMECA worksheets, criticality analysis, or CBM program design — MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted. This table supersedes generic ISO 14224 failure coding for all VSC failure mode classification purposes.

#### Failure Mode Structure (Three-Part Definition)

Every failure mode in any RCM, FMECA, reliability, or maintenance analysis conducted by VSC agents MUST follow this three-part structure:

| Component | Definition |
|-----------|-----------|
| **QUE falla** (What) | The specific component, part, or element that fails (e.g., impeller, bearing, seal, filter, sensor, cable) |
| **COMO falla** (Mechanism) | One of the 18 official VSC mechanisms from the FM Table (e.g., Wears, Corrodes, Cracks, Blocks, Degrades) |
| **POR QUE falla** (Cause) | One of the 46 official VSC causes from the FM Table (e.g., Contamination, Mechanical overload, Age, Cyclic loading) |

**Combined format:** `[What] -> [Mechanism] due to [Cause]`
**Example:** `Impeller -> Wears due to Abrasion` | `Bearing -> Overheats/Melts due to Lack of lubrication` | `Cable -> Short-Circuits due to Breakdown in insulation`

#### The 18 Official VSC Failure Mechanisms

Arcs | Blocks | Breaks/Fracture/Separates | Corrodes | Cracks | Degrades | Distorts | Drifts | Expires | Immobilised (binds/jams) | Looses Preload | Open-Circuit | Overheats/Melts | Severs (cut, tear, hole) | Short-Circuits | Thermally Overloads | Washes Off | Wears

#### Compliance Rules for Maintenance Strategy Creation

1. **NO ad-hoc failure mode descriptions.** Never write free-text failure modes like "pump fails" or "valve malfunction." Always decompose into What + Mechanism + Cause using the VSC FM Table.
2. **Every FMECA worksheet row** (Sheet 4 of the RCM/FMECA Workbook) must have columns: Component (What), FM-Mechanism (from 18), FM-Cause (from 46), with the combined FM name auto-generated as "[Mechanism] due to [Cause]".
3. **Failure Mode Analysis (Step 8):** When identifying failure modes for each functional failure, use the VSC FM Table as the primary classification source. ISO 14224 serves as supplementary reference for equipment taxonomy only.
4. **Cross-reference column:** The FM Table includes "Other Mechanisms grouped" and "Other Causes grouped" columns for reliability investigations — use these to consolidate similar failure modes during Pareto analysis.
5. **Description of FM Application:** The FM Table includes recommended components and maintenance strategies for each failure mode — use these as starting points when selecting maintenance tasks in Step 9 (Task Selection), then customize for the specific operating context.
6. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency.
7. **RCM/FMECA Workbook (Document 2):** The FMECA Worksheet sheet must include dedicated columns for FM-Mechanism and FM-Cause drawn exclusively from the VSC FM Table.

### Secondary Standards (Reference)
| Standard | Application |
|----------|-------------|
| **ISO 13306** | Maintenance terminology |
| **ISO 13381-1** | Condition monitoring and diagnostics - prognostics |
| **ISO 17359** | Condition monitoring - general guidelines |
| **ISO 10816 / ISO 20816** | Vibration monitoring standards |
| **EN 16646** | Maintenance within physical asset management |
| **NORSOK Z-008** | Risk-based maintenance and consequence classification |
| **API 580/581** | Risk-Based Inspection (for pressure equipment) |
| **IEEE 493 (Gold Book)** | Reliability data for industrial/commercial power systems |
| **OREDA** | Offshore and Onshore Reliability Data handbook |

### RCM Logic Tree (SAE JA1011 Compliant)
The agent MUST follow this decision logic for each failure mode:
1. Is the failure evident to the operating crew under normal circumstances?
2. Does the failure mode cause a safety or environmental consequence?
3. Does the failure mode cause an operational consequence?
4. What proactive maintenance task is technically feasible and worth doing?
   - On-condition task (CBM) - preferred where feasible
   - Scheduled restoration task
   - Scheduled discard task
   - Failure-finding task (for hidden failures)
5. If no proactive task is feasible/justified: Run-to-failure (corrective maintenance)

### Criticality Assessment Methodology
- 5x5 risk matrix (Consequence x Probability)
- Consequence categories: Safety, Environment, Production, Cost, Reputation
- Probability based on: Historical data, generic data (OREDA/IEEE), expert judgment
- Criticality bands: A (Critical: score 15-25), B (Important: score 8-14), C (General: score 1-7)
- Analysis depth: Criticality A = Full RCM, Criticality B = Streamlined RCM, Criticality C = Generic/OEM strategy

## Step-by-Step Execution

### Phase 1: Data Collection & Preparation (Steps 1-4)
1. **Receive and Validate Equipment List**: Parse the equipment list, validate tag numbering convention, identify hierarchy (plant > area > system > equipment > component). Flag any gaps.
2. **Establish Operating Context**: Document for each system:
   - Primary function and performance standards
   - Operating mode (continuous, batch, standby)
   - Environmental conditions (temperature, humidity, dust, corrosion)
   - Regulatory constraints
   - Production impact of failure (tons/hour, MW, m3/day lost)
3. **Gather Failure Data**: For each equipment type:
   - Extract historical failure data if available (minimum 2 years preferred)
   - Map to generic failure data from OREDA/IEEE if site data unavailable
   - Identify dominant failure modes by equipment type
   - Calculate or estimate MTBF and MTTR
4. **Review Vendor Documentation**: Extract OEM-recommended maintenance from datasheets and manuals:
   - Scheduled maintenance intervals
   - Lubrication requirements
   - Inspection requirements
   - Overhaul/rebuild intervals
   - Warranty conditions affecting maintenance

### Phase 2: Criticality Analysis (Steps 5-6)
5. **Perform Criticality Assessment**: For each equipment item:
   - Assess consequence in each category (Safety, Environment, Production, Cost)
   - Assess probability of failure
   - Calculate Risk Priority Number (RPN)
   - Assign criticality rating (A/B/C)
   - Document rationale for each rating
6. **Validate Criticality Results**:
   - Check distribution (typically 10-15% A, 25-35% B, 50-65% C)
   - Verify that known critical equipment is rated appropriately
   - Adjust if distribution is significantly skewed
   - Generate criticality Pareto charts and distribution summary

### Phase 3: RCM/FMECA Analysis (Steps 7-10)
7. **Functional Analysis**: For each system in scope:
   - Define system boundaries
   - Identify primary and secondary functions
   - Define performance standards for each function
   - Identify functional failures (ways each function can fail)
8. **Failure Mode Analysis (per VSC Failure Modes Table)**: For each functional failure:
   - Identify all reasonably likely failure modes
   - **MANDATORY:** Classify each failure mode using the VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) with the three-part structure: **What** (component) + **Mechanism** (from 18 official VSC mechanisms) + **Cause** (from 46 official VSC causes)
   - Format each failure mode as "[Mechanism] due to [Cause]" per the VSC FM Table
   - Document local, system, and plant-level effects
   - Classify the consequence (Safety/Environmental/Operational/Non-operational)
   - Determine if failure is hidden or evident
9. **Task Selection**: For each failure mode, apply the RCM decision logic:
   - Determine if an on-condition (CBM) task is feasible
   - If not, evaluate scheduled restoration
   - If not, evaluate scheduled discard
   - For hidden failures, evaluate failure-finding tasks
   - If no proactive task is justified, accept run-to-failure
   - For each selected task: define task description, frequency, craft, duration
10. **Task Optimization**:
    - Group tasks by equipment to create efficient work packages
    - Align task frequencies with operational windows (shifts, shutdowns)
    - Consolidate similar tasks across equipment types
    - Identify tasks requiring shutdown vs. running equipment
    - Estimate total maintenance labor hours by craft

### Phase 4: CBM Program Design (Steps 11-12)
11. **CBM Technology Selection**: For each on-condition task:
    - Select the appropriate CBM technology
    - Define measurement points on equipment
    - Set measurement parameters and units
    - Establish baseline values, alert and alarm thresholds
    - Define monitoring frequency
    - Specify instrumentation requirements
12. **CBM Route Design**:
    - Group measurement points into logical routes
    - Optimize route sequence for efficiency
    - Estimate route duration and frequency
    - Define data analysis and reporting requirements
    - Identify online (continuous) vs. periodic monitoring needs

### Phase 5: Document Generation (Steps 13-15)
13. **Generate FMECA Workbook (.xlsx)**: Compile all analysis worksheets with:
    - Equipment register with criticality
    - Complete FMECA worksheets per system
    - Maintenance plan summary
    - CBM program details
    - Spare parts requirements
    - KPI targets
14. **Generate Strategy Report (.docx)**: Write the maintenance strategy report with:
    - Executive summary of findings and recommendations
    - Criticality analysis results and charts
    - RCM analysis summary per system
    - CBM program description
    - Maintenance organization requirements
    - Implementation roadmap
15. **Cross-Reference Validation**: Ensure:
    - Every equipment item has a criticality rating
    - Every Criticality A/B item has FMECA analysis
    - Every failure mode has a task decision
    - FMECA task descriptions match maintenance plan summary
    - CBM program references correct equipment and technologies
    - Spare parts link to maintenance tasks that require them

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| SAE JA1011 Compliance | 25% | RCM process meets all evaluation criteria in SAE JA1011 |
| Failure Mode Completeness | 20% | All reasonably likely failure modes identified per equipment type |
| Task Selection Logic | 20% | Correct application of RCM decision logic for every failure mode |
| Criticality Accuracy | 15% | Risk ratings reflect actual operational consequences |
| CBM Appropriateness | 10% | CBM technologies are technically feasible and correctly specified |
| Implementability | 10% | Tasks can be directly loaded into CMMS without further interpretation |

### Automated Quality Checks
- [ ] Every equipment item in the register has a criticality rating assigned
- [ ] Criticality distribution falls within expected ranges (A: 10-15%, B: 25-35%, C: 50-65%)
- [ ] Every Criticality A item has a complete FMECA analysis
- [ ] Every Criticality B item has at minimum a streamlined FMECA
- [ ] Every failure mode in FMECA has a task decision (no blanks)
- [ ] No "TBD" or placeholder entries remain in any worksheet
- [ ] Task frequencies are expressed in standard intervals (not arbitrary)
- [ ] CBM thresholds are specified with units for every on-condition task
- [ ] Spare parts are identified for every preventive/scheduled task
- [ ] Maintenance plan hours sum correctly by craft and period
- [ ] All failure modes classified per VSC Failure Modes Table (18 mechanisms, 46 causes) from `methodology/standards/VSC_Failure_Modes_Table.xlsx`
- [ ] Function statements follow "To [verb] [object] [performance standard]" format
- [ ] Equipment tag numbers are consistent between all sheets/documents

### SAE JA1011 Compliance Verification
The strategy MUST satisfy all seven questions of the RCM process:
1. What are the functions and performance standards of the asset in its present operating context?
2. In what ways can it fail to fulfill its functions?
3. What causes each functional failure?
4. What happens when each failure occurs?
5. In what way does each failure matter?
6. What should be done to predict or prevent each failure?
7. What should be done if a suitable proactive task cannot be found?

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `engineering-data-agent` | Equipment lists, datasheets, P&IDs | Critical |
| `process-engineering-agent` | Process descriptions, operating context | Critical |
| `hse-agent` | Safety consequence data, regulatory requirements | High |
| `reliability-data-agent` | Failure history, OREDA data, MTBF/MTTR | High |
| `vendor-management-agent` | OEM maintenance manuals and recommendations | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-maintenance-manual` | RCM task list as basis for detailed procedures | Automatic |
| `create-staffing-plan` | Maintenance labor hours for workforce calculation | Automatic |
| `create-training-plan` | Skill requirements derived from maintenance tasks | Automatic |
| `create-kpi-dashboard` | Maintenance KPI definitions and targets | Automatic |
| `create-contract-scope` | Outsourced maintenance scope definition | On request |
| `cmms-configuration-agent` | Maintenance plans for CMMS upload | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | Safety consequence validation | During criticality analysis |
| `operations-agent` | Operational consequence validation | During criticality analysis |
| `reliability-engineer-agent` | FMECA review and task validation | During RCM analysis |
| `cbm-specialist-agent` | CBM technology selection and thresholds | During CBM program design |

## Templates & References

### Document Templates
- `VSC_MaintenanceStrategy_Template_v2.0.docx` - Strategy report template
- `VSC_RCM_FMECA_Template_v3.1.xlsx` - Standard FMECA workbook template
- `VSC_Criticality_Matrix_v2.0.xlsx` - Criticality assessment template
- `VSC_CBM_Program_Template_v1.5.xlsx` - CBM route and threshold template

### Reference Data
- OREDA Handbook (latest edition) - Generic failure rate data
- IEEE 493 Gold Book - Power system reliability data
- **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) — 72 failure modes, 18 mechanisms, 46 causes (MANDATORY for all failure mode classification)
- ISO 14224 failure mode coding tables (supplementary equipment taxonomy reference)
- VSC failure mode library by equipment type
- VSC CBM technology selection matrix
- Industry-specific maintenance benchmarks

### Knowledge Base
- Past RCM/FMECA studies by industry sector
- Equipment type failure mode libraries
- CBM case studies and technology guides
- Maintenance strategy best practices library

## Examples

### Example: Centrifugal Pump FMECA Entry

**Equipment**: P-2101A, Centrifugal Process Water Pump
**Criticality**: A (Critical) - Score 20/25

| Field | Value |
|-------|-------|
| Function | F1: To transfer process water from Tank T-2100 to Reactor R-2201 at 150 m3/hr, 12 bar discharge pressure, continuously |
| Functional Failure | FF1.1: Unable to deliver any flow |
| Failure Mode | FM1.1.1: Impeller wear (erosion/corrosion) |
| Failure Cause | Abrasive solids in process water causing progressive impeller material loss |
| Local Effect | Reduced pump efficiency, decreased discharge pressure, increased vibration |
| System Effect | Reduced water supply to reactor, potential process upset |
| Plant Effect | Production rate reduction of 30% until standby pump started (15 min switchover) |
| Detection | Vibration monitoring, discharge pressure trending, performance monitoring |
| Consequence | Operational (production impact during switchover) |
| Recommended Task | On-condition: Vibration monitoring (overall + spectral analysis) |
| Frequency | Monthly (route-based) |
| Craft | Predictive Maintenance Technician |
| Duration | 0.25 hrs per point (4 measurement points) |
| CBM Technology | Vibration analysis - accelerometer, velocity, displacement |
| Alert Threshold | Overall velocity > 4.5 mm/s RMS |
| Alarm Threshold | Overall velocity > 7.1 mm/s RMS (per ISO 10816-3, Group 2) |
| Secondary Task | Scheduled restoration: Impeller replacement at condition-based interval (estimated 18-24 months based on wear rate monitoring) |
| Spare Parts | 1x impeller, 1x wear ring set, 1x mechanical seal, 1x gasket set |
