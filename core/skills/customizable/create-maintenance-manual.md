# Create Maintenance Manual
## Skill ID: create-maintenance-manual
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose
Generates detailed Preventive Maintenance (PM) and Corrective Maintenance (CM) procedures for industrial equipment and systems. These procedures provide maintenance technicians with step-by-step instructions to safely and effectively execute maintenance tasks identified in the RCM/FMECA-based maintenance strategy.

Maintenance manuals bridge the gap between "what maintenance to do" (defined by the maintenance strategy) and "how to do it" (detailed procedures). Without proper procedures, maintenance quality depends entirely on individual technician experience, leading to inconsistent work quality, safety incidents, extended downtime, and premature equipment failures.

## Intent & Specification
The AI agent MUST understand that:

1. **Procedures Flow from RCM Results**: Every PM procedure must trace back to a maintenance task identified in the RCM/FMECA analysis. The agent should not invent tasks; it translates strategy tasks into executable procedures.
2. **Safety-First Approach**: Every procedure must address isolation requirements (LOTO - Lock Out Tag Out), confined space entry, hot work, working at heights, and chemical exposure as applicable. Maintenance is inherently hazardous work.
3. **Skill-Level Appropriate**: Procedures must be written for the expected skill level of the maintenance workforce. Include sufficient detail for a qualified technician to execute the task without ambiguity, but avoid being patronizingly basic.
4. **CMMS Integration**: Procedures must be structured to link directly to CMMS work order task lists. Each procedure should map to a work order template.
5. **Vendor Manual Compliance**: Procedures must not contradict OEM recommendations unless there is documented engineering justification (e.g., RCM analysis showed the OEM interval is excessive or insufficient).
6. **Tool and Parts Specification**: Every procedure must specify the exact tools, consumables, and spare parts required, including part numbers where available.
7. **Language**: Spanish (Latin American), with part numbers, technical standards, and equipment nomenclature in their original language.

## Trigger / Invocation
```
/create-maintenance-manual
```

### Natural Language Triggers
- "Create maintenance procedures for [equipment/system]"
- "Generate PM procedures for [equipment list]"
- "Write corrective maintenance procedures for [equipment type]"
- "Develop maintenance manual for [plant/area]"
- "Crear procedimientos de mantenimiento para [equipo/sistema]"
- "Generar manual de mantenimiento preventivo/correctivo"
- "Escribir procedimientos PM para [lista de equipos]"

## Input Requirements

### Required Inputs
| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `maintenance_strategy` | RCM/FMECA results with task list | .xlsx (from create-maintenance-strategy) | Maintenance Strategy |
| `equipment_datasheets` | Technical specifications for each equipment type | .pdf / .xlsx | Vendor / Engineering |
| `equipment_list` | Equipment register with tag numbers and hierarchy | .xlsx | Engineering |

### Optional Inputs (Highly Recommended)
| Input | Description | Default |
|-------|-------------|---------|
| `vendor_maintenance_manuals` | OEM maintenance instructions | Use generic best practices |
| `p_and_ids` | P&IDs showing equipment in system context | Reference from operations manual |
| `spare_parts_catalog` | Spare parts lists with part numbers and inventory status | Generate from equipment data |
| `special_tools_inventory` | Available special tools and equipment | Flag where special tools needed |
| `loto_procedures` | Existing LOTO procedures | Generate from equipment isolation points |
| `permit_to_work_system` | Client's PTW system requirements | Reference standard PTW |
| `cmms_system` | Target CMMS for procedure upload | SAP PM compatible format |
| `workshop_capabilities` | Available workshop facilities and equipment | Assume standard industrial workshop |
| `lubrication_database` | Lubricant specifications and equivalences | Use OEM specifications |
| `torque_specifications` | Bolt torque values for critical joints | Use standard tables |
| `alignment_standards` | Acceptable alignment tolerances | Use API/ISO standards |
| `workforce_skill_matrix` | Available technician skill levels | Assume qualified tradesperson |

### Context Enrichment
The agent should automatically:
- Cross-reference RCM task list with vendor recommended maintenance
- Retrieve applicable safety procedures for the maintenance activity type
- Pull torque tables, alignment standards, and clearance specifications from standards databases
- Identify required isolation points from P&IDs
- Search knowledge base for similar procedures from past projects

## Output Specification

### Document: Maintenance Manual (.docx) - Set per System/Area
**Filename**: `VSC_ManualMto_{ProjectCode}_{SystemCode}_{EquipType}_{Version}_{Date}.docx`

**Master Structure**:

#### Part 1: General Information
1. **Introduction**
   - 1.1 Purpose and scope of this manual
   - 1.2 Equipment covered
   - 1.3 How to use this manual
   - 1.4 Relationship to maintenance strategy (RCM reference)
   - 1.5 Document control and revision process

2. **Safety Requirements**
   - 2.1 General safety rules for maintenance work
   - 2.2 Lock Out Tag Out (LOTO) policy and procedures
   - 2.3 Permit to Work (PTW) requirements by task type
   - 2.4 Confined space entry requirements
   - 2.5 Working at heights requirements
   - 2.6 Hot work requirements
   - 2.7 Chemical handling and disposal
   - 2.8 PPE matrix by activity type

3. **Tools and Equipment**
   - 3.1 Standard tool kit specification
   - 3.2 Special tools required (listed per procedure)
   - 3.3 Calibrated instruments required
   - 3.4 Lifting equipment requirements
   - 3.5 Workshop equipment requirements

#### Part 2: Preventive Maintenance Procedures
4. **Lubrication Procedures**
   - Lubrication schedule summary table
   - Individual lubrication procedure per equipment/route
   - Lubricant specification table (with equivalences)
   - Lubrication route maps

5. **Inspection Procedures**
   - Visual inspection checklists per equipment type
   - Condition-based inspection procedures
   - Predictive maintenance data collection procedures (vibration, thermography, oil sampling)

6. **Servicing Procedures**
   - Filter replacement procedures
   - Consumable replacement procedures
   - Cleaning procedures
   - Adjustment and calibration procedures

7. **Preventive Replacement Procedures**
   - Bearing replacement procedures
   - Seal and packing replacement procedures
   - Belt and coupling replacement procedures
   - Wear part replacement procedures

8. **Overhaul Procedures**
   - Major overhaul procedures (full disassembly/reassembly)
   - Partial overhaul procedures
   - Post-overhaul testing and acceptance criteria

#### Part 3: Corrective Maintenance Procedures
9. **Troubleshooting Guides**
   - Symptom-based troubleshooting matrices per equipment type
   - Diagnostic procedures
   - Fault finding flowcharts

10. **Repair Procedures**
    - Common repair procedures per equipment type
    - Emergency repair procedures
    - Temporary repair procedures (with limitations and follow-up requirements)

#### Part 4: Appendices
- A: Spare parts list per equipment (with part numbers, quantities, vendor)
- B: Torque specification tables
- C: Alignment tolerance tables
- D: Clearance and wear limit tables
- E: Lubricant equivalence table
- F: LOTO isolation point register
- G: Procedure-to-CMMS task list mapping table
- H: Forms and checklists (printable)

### Individual Procedure Format

Each maintenance procedure MUST follow this structure:
```
PROCEDIMIENTO DE MANTENIMIENTO
===============================

Codigo: MTP-[System]-[EquipType]-[TaskType]-[Seq]
Titulo: [Descriptive procedure title]
Equipo: [Tag Number] - [Description]
Tipo de Tarea: PM / PdM / CM / Overhaul
Frecuencia: [Interval] (referencia RCM: [FMECA Task ID])
Revision: [Rev Number]
Fecha: [Date]

INFORMACION DEL EQUIPO:
- Tag: [Equipment tag number]
- Descripcion: [Equipment description]
- Fabricante: [Manufacturer]
- Modelo: [Model number]
- Ubicacion: [Physical location]

TIEMPO ESTIMADO: [Duration] horas
PERSONAL REQUERIDO: [Number] x [Craft/Trade]
ESTADO DEL EQUIPO: En operacion / Detenido / Aislado

SEGURIDAD Y PERMISOS:
[ ] LOTO requerido: [Si/No] - Procedimiento LOTO: [LOTO-XXX]
[ ] Permiso de trabajo: [Tipo de permiso]
[ ] Espacio confinado: [Si/No]
[ ] Trabajo en altura: [Si/No] - Altura: [X] metros
[ ] Trabajo en caliente: [Si/No]

PPE REQUERIDO:
- [Specific PPE list]

HERRAMIENTAS REQUERIDAS:
Herramienta                    | Especificacion
-------------------------------|------------------
[Tool 1]                       | [Size/spec]
[Tool 2]                       | [Size/spec]
[Special tool if applicable]   | [Specification]

REPUESTOS Y MATERIALES:
Codigo Parte | Descripcion          | Cantidad | Ubicacion Almacen
-------------|----------------------|----------|------------------
[Part No.]   | [Description]        | [Qty]    | [Bin/Location]
[Part No.]   | [Description]        | [Qty]    | [Bin/Location]

PROCEDIMIENTO PASO A PASO:

Paso | Accion                                    | Criterio/Especificacion      | Observaciones
-----|-------------------------------------------|------------------------------|------------------
1    | Obtener permiso de trabajo y LOTO          | PTW aprobado, LOTO aplicado  | Verificar aislamiento
2    | ⚠ Verificar energia cero en equipo         | Tension = 0V, presion = 0    | NUNCA omitir este paso
3    | [Maintenance action step]                  | [Acceptance criteria]         | [Notes]
4    | [Next step]                                | [Criteria]                    | [Notes]
...
N-1  | Retirar LOTO y devolver permiso de trabajo | LOTO retirado por instalador | Verificar area despejada
N    | Registrar trabajo completado en CMMS        | OT cerrada con datos reales  |

DATOS A REGISTRAR:
- [Measurement 1]: ________ [unit] (Rango aceptable: [min-max])
- [Measurement 2]: ________ [unit] (Rango aceptable: [min-max])
- Condicion general del equipo: ________
- Repuestos utilizados: ________
- Observaciones/hallazgos: ________

CRITERIOS DE ACEPTACION POST-MANTENIMIENTO:
- [Criterion 1]: [Specification]
- [Criterion 2]: [Specification]
- [Performance test result]: [Acceptable range]

NOTAS TECNICAS:
- [Important technical notes, tips, cautions]

REFERENCIA A MANUAL DE FABRICANTE:
- [Vendor manual reference, section/page]
```

## Methodology & Standards

### Primary Standards
| Standard | Application |
|----------|-------------|
| **ISO 14224** | Maintenance data structure and failure coding |
| **SAE JA1011/JA1012** | RCM methodology that drives task selection |
| **ISO 55000** | Asset management framework alignment |
| **OSHA 1910.147** | Control of hazardous energy (LOTO) |
| **ANSI Z244.1** | LOTO standard |

### Equipment-Specific Standards
| Equipment Type | Standards |
|---------------|-----------|
| Rotating Equipment | API 610 (pumps), API 617 (compressors), API 686 (installation/alignment) |
| Pressure Vessels | ASME BPVC Section VIII, API 510 |
| Piping | ASME B31.3, API 570 |
| Electrical | NFPA 70E, IEC 60079 (hazardous areas) |
| Instrumentation | ISA-5.1, IEC 61511 |
| Valves | API 600/602/608, FCI 70-2 |
| Heat Exchangers | TEMA, API 660 |
| Bearings | ISO 15243 (failure modes), SKF/FAG alignment standards |
| Couplings | API 671, manufacturer standards |

### Procedure Writing Methodology
1. **Task Identification**: Start from RCM task list - each task becomes a procedure
2. **Vendor Reference**: Cross-check with OEM maintenance manual
3. **Safety Analysis**: Identify all hazards and required controls (LOTO, permits, PPE)
4. **Step Development**: Break task into individual steps with clear acceptance criteria
5. **Resource Estimation**: Determine time, crew, tools, and parts for each procedure
6. **CMMS Mapping**: Structure for direct upload to CMMS as task list templates

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** Every maintenance procedure generated by this skill MUST reference failure modes exclusively from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No ad-hoc or free-text failure mode descriptions are permitted.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. Every failure mode used in maintenance procedures, troubleshooting guides, and corrective maintenance references MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component or equipment that fails | Mechanical Seal |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Wears |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Lubricant contamination (particles) |

**Complete failure mode definition:** *"Mechanical Seal Wears due to Lubricant contamination (particles)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in PM procedures (Section 4-8), CM troubleshooting guides (Section 9-10), and corrective repair procedures MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for Maintenance Manuals

1. **Troubleshooting Matrices (Section 9):** Each symptom-cause entry in troubleshooting matrices MUST map to a specific failure mode from the VSC Failure Modes Table. The "Cause" column must use the format "[Mechanism] due to [Cause]".
2. **PM Procedure Traceability:** Every PM procedure header field `Referencia RCM: [FMECA Task ID]` MUST trace back to a failure mode in the FMECA that uses VSC Failure Modes Table nomenclature.
3. **Corrective Maintenance Procedures (Section 10):** Repair procedures must reference the specific failure mode(s) they address, using the official table naming convention.
4. **No Ad-Hoc Descriptions:** Descriptions such as "bearing damaged", "valve leaking", or "motor burned out" are NOT acceptable. Use the standardized form: "Wears due to [Cause]", "Corrodes due to [Cause]", "Thermally Overloads due to [Cause]", etc.
5. **Cross-Reference:** The maintenance manual appendix MUST include a cross-reference table mapping each procedure to its originating failure mode(s) from the VSC Failure Modes Table.
6. **Consistency with FMECA:** Failure mode descriptions in maintenance manuals MUST be identical to those in the upstream FMECA workbook — no paraphrasing or abbreviation.

## Step-by-Step Execution

### Phase 1: Input Processing (Steps 1-3)
1. **Parse Maintenance Strategy**: From the RCM/FMECA workbook:
   - Extract all maintenance tasks with: task ID, equipment tag, task type, description, frequency, craft, duration
   - Group tasks by equipment type (all pumps together, all motors, etc.)
   - Identify tasks requiring detailed procedures vs. simple checklists
2. **Parse Vendor Documentation**: From OEM manuals:
   - Extract step-by-step maintenance procedures
   - Note special tool requirements
   - Record torque values, clearances, tolerances
   - Identify OEM-specific spare part numbers
   - Note warranty-affecting requirements
3. **Parse Equipment Data**: From datasheets and specifications:
   - Equipment dimensions and weights (for lifting plans)
   - Material of construction (affects tooling and procedures)
   - Operating parameters (for post-maintenance testing)
   - Lubrication requirements (type, quantity, intervals)
   - Special features or configurations

### Phase 2: Procedure Development (Steps 4-8)
4. **Develop LOTO Procedures**: For each equipment requiring isolation:
   - Identify all energy sources (electrical, mechanical, pneumatic, hydraulic, thermal, chemical, gravity)
   - Define isolation points (breakers, valves, blinds)
   - Specify verification method for zero energy state
   - Create LOTO procedure with step-by-step isolation and de-isolation
5. **Develop Lubrication Procedures**:
   - Create lubrication schedule per equipment
   - Specify lubricant type, grade, quantity, application method
   - Define lubrication routes for efficiency
   - Include oil sampling procedures for oil analysis program
   - Provide lubricant equivalence table (Shell/Mobil/Castrol/Total)
6. **Develop PM Procedures**: For each preventive task:
   - Write step-by-step execution procedure
   - Include all measurements and acceptance criteria
   - Specify torque values, clearances, alignment tolerances
   - Reference applicable standard or vendor specification for each criterion
   - Include post-maintenance testing requirements
7. **Develop CM/Troubleshooting Procedures**: For common failure modes:
   - Create diagnostic flowcharts (symptom > test > diagnosis)
   - Write repair procedures for each common failure mode
   - Include disassembly/reassembly sequences with photos/diagrams placeholders
   - Specify when to repair vs. replace
   - Include temporary repair options with limitations
8. **Develop Overhaul Procedures**: For major maintenance activities:
   - Complete disassembly sequence
   - Inspection and measurement requirements per component
   - Wear limits and replacement criteria
   - Reassembly sequence with critical specifications
   - Alignment and balancing requirements
   - Run-in and acceptance testing procedure

### Phase 3: Resource Specification (Steps 9-10)
9. **Compile Tool Requirements**: For each procedure:
   - Standard tools required (with sizes)
   - Special tools required (with specifications and potential sources)
   - Calibrated instruments needed (torque wrenches, dial indicators, etc.)
   - Lifting equipment if required (capacity, type)
10. **Compile Parts Requirements**: For each procedure:
    - Spare parts required (with part numbers)
    - Consumables required (gaskets, O-rings, lubricants, etc.)
    - Materials required (cleaning agents, sealants, etc.)
    - Cross-reference to spare parts catalog/inventory

### Phase 4: Assembly & Quality (Steps 11-13)
11. **Compile Procedures into Manual**: Organize by:
    - Part 2: Preventive procedures by equipment type
    - Part 3: Corrective/troubleshooting by equipment type
    - Appendices: supporting tables and reference data
12. **Create CMMS Mapping Table**: For each procedure:
    - Map to CMMS work order template code
    - Define task list structure for CMMS upload
    - Specify scheduling parameters (frequency, cycle, trigger)
    - Define required resources for work order planning
13. **Quality Review**:
    - Verify all RCM tasks have corresponding procedures
    - Check safety requirements are complete for each procedure
    - Validate technical specifications against vendor data
    - Confirm spare parts are correctly identified
    - Ensure consistent formatting and terminology

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Accuracy | 25% | Specifications, tolerances, and procedures match vendor/standard requirements |
| Safety Completeness | 25% | LOTO, permits, PPE, and hazard controls are complete and correct |
| RCM Traceability | 15% | Every procedure traces to an RCM task; no orphan procedures |
| Executability | 15% | Steps are clear, logical, and can be followed by a qualified technician |
| Resource Accuracy | 10% | Tools, parts, time estimates are realistic and complete |
| CMMS Readiness | 10% | Procedures are structured for direct CMMS upload |

### Automated Quality Checks
- [ ] Every RCM maintenance task has a corresponding procedure
- [ ] Every procedure specifies equipment state (running/stopped/isolated)
- [ ] Every procedure requiring isolation has a LOTO reference
- [ ] Every procedure specifies PPE requirements
- [ ] Every procedure has time estimate and crew size
- [ ] Every procedure lists required tools and parts
- [ ] Torque values have units and reference standard
- [ ] Clearance/tolerance values have units and acceptance range
- [ ] Post-maintenance test criteria specified for every PM procedure
- [ ] CMMS task code assigned to every procedure
- [ ] Spare part numbers validated against parts catalog
- [ ] No placeholder text remaining
- [ ] Consistent procedure numbering throughout
- [ ] Equipment tags match master equipment list
- [ ] Lubricant specifications include grade and volume

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `create-maintenance-strategy` | RCM/FMECA task list (primary input) | Critical |
| `engineering-data-agent` | Equipment datasheets, vendor manuals | Critical |
| `hse-agent` | LOTO procedures, PTW requirements, safety standards | Critical |
| `spare-parts-agent` | Parts catalog with part numbers and inventory | High |
| `create-operations-manual` | Equipment operating parameters for testing | Medium |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `create-training-plan` | Procedures as basis for maintenance training content | Automatic |
| `create-staffing-plan` | Maintenance labor hours and skill requirements | Automatic |
| `cmms-configuration-agent` | Procedure templates for CMMS upload | On request |
| `create-contract-scope` | Outsourced maintenance scope and procedure specifications | On request |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | Safety content validation | During LOTO and safety step development |
| `reliability-engineer-agent` | Technical accuracy review of specifications | During procedure development |
| `spare-parts-agent` | Parts identification and number verification | During resource specification |
| `review-documents` | Final quality review | After document assembly |

## Templates & References

### Document Templates
- `VSC_MaintenanceManual_Template_v2.0.docx` - Master maintenance manual template
- `VSC_PM_Procedure_Template_v1.5.docx` - Individual PM procedure template
- `VSC_CM_Procedure_Template_v1.5.docx` - Corrective maintenance procedure template
- `VSC_LOTO_Procedure_Template_v1.0.docx` - LOTO procedure template
- `VSC_Overhaul_Procedure_Template_v1.0.docx` - Overhaul procedure template

### Reference Standards
- API 686: Machinery Installation and Installation Design
- SKF Bearing Maintenance Handbook
- Fluke Reliability Predictive Maintenance Guide
- Standard torque tables (ASME PCC-1, EN 1591-1)
- Standard alignment tolerances (API 686 Table 3)

## Examples

### Example: Centrifugal Pump PM Procedure

```
PROCEDIMIENTO DE MANTENIMIENTO PREVENTIVO
==========================================

Codigo: MTP-021-PP-PM-001
Titulo: Inspeccion y Mantenimiento Preventivo Trimestral - Bomba Centrifuga
Equipo: P-2101A - Bomba de Agua de Proceso
Tipo: PM - Mantenimiento Preventivo
Frecuencia: Trimestral (cada 2,160 horas de operacion)
Referencia RCM: FMECA Task FM1.1.1-T1, FM1.2.1-T1, FM1.3.1-T1
Revision: A
Fecha: 2025-01-15

INFORMACION DEL EQUIPO:
- Tag: P-2101A
- Fabricante: Flowserve
- Modelo: HPX 6x4x13
- Potencia motor: 75 kW
- RPM: 1,480
- Ubicacion: Area 21, Nivel +0.00m, junto a tanque T-2100

TIEMPO ESTIMADO: 4.0 horas
PERSONAL REQUERIDO: 1 x Mecanico Industrial + 1 x Ayudante
ESTADO DEL EQUIPO: Detenido y Aislado

SEGURIDAD Y PERMISOS:
[X] LOTO requerido: Si - Procedimiento LOTO: LOTO-P2101A-001
[X] Permiso de trabajo: PTW General (Trabajo mecanico)
[ ] Espacio confinado: No
[ ] Trabajo en altura: No
[ ] Trabajo en caliente: No

PPE REQUERIDO:
- Casco de seguridad
- Lentes de seguridad
- Guantes de trabajo mecanico
- Zapatos de seguridad con punta de acero
- Proteccion auditiva (al ingresar al area)

HERRAMIENTAS REQUERIDAS:
Herramienta                          | Especificacion
-------------------------------------|---------------------------
Juego de llaves combinadas           | 10-32mm
Juego de llaves Allen                | 3-12mm
Torquimetro                          | 20-200 Nm (calibrado)
Reloj comparador con base magnetica  | Resolucion 0.01mm
Galgas de espesor (feeler gauges)    | 0.05-1.0mm
Pistola de grasa neumatica           | Con acople standard
Linterna LED                         | Antiexplosion si zona clasificada
Trapos industriales                  | Libres de pelusas

REPUESTOS Y MATERIALES:
Codigo Parte     | Descripcion               | Cantidad | Almacen
-----------------|---------------------------|----------|--------
GRS-MOBIL-EP2    | Grasa Mobilux EP2         | 200 g    | Bodega Lubricantes
CLN-SOLV-001     | Solvente de limpieza      | 1 litro  | Bodega Quimica
GAK-P2101-KIT    | Kit empaquetaduras bomba  | 1 (stand-by) | Bin A-21-05

PROCEDIMIENTO PASO A PASO:

Paso | Accion                                                   | Criterio                        | Observaciones
-----|----------------------------------------------------------|---------------------------------|------------------
1    | Obtener PTW y aplicar LOTO segun LOTO-P2101A-001.        | PTW firmado, LOTO aplicado      | Verificar energia cero
2    | ⚠ Verificar energia cero: medir tension en bornes del     | 0 V entre todas las fases       | USAR multimetro calibrado
     | motor con multimetro.                                     |                                 |
3    | Realizar inspeccion visual general de la bomba:           | Sin hallazgos anormales         | Registrar cualquier hallazgo
     | - Fugas en sellos, bridas, drenajes                       |                                 |
     | - Corrosion o dano mecanico                               |                                 |
     | - Estado de la base y pernos de anclaje                   |                                 |
     | - Estado de guardas de acoplamiento                       |                                 |
4    | Verificar apriete de pernos de anclaje de bomba.          | Torque: 85 Nm (M16, Gr 8.8)    | Re-torquear si necesario
5    | Verificar apriete de pernos de anclaje del motor.         | Torque: 85 Nm (M16, Gr 8.8)    | Re-torquear si necesario
6    | Retirar guarda de acoplamiento.                           | Guarda retirada sin dano        |
7    | Inspeccionar acoplamiento:                                | Sin desgaste visible            | Reemplazar si elastomero
     | - Estado del elemento elastico                            | Dureza Shore A > 60             | esta agrietado o deformado
     | - Holgura axial                                           | < 0.5mm                         |
8    | Verificar alineamiento del acoplamiento:                  |                                 |
     | - Desalineamiento angular                                 | < 0.05 mm/100mm                 | Usar reloj comparador
     | - Desalineamiento paralelo (offset)                       | < 0.05 mm                       | Referencia: API 686
9    | Si alineamiento fuera de tolerancia, corregir usando      | Dentro de tolerancia API 686    | Documentar valores
     | calzas (shims) bajo patas del motor.                      |                                 | antes y despues
10   | Re-instalar guarda de acoplamiento.                       | Guarda asegurada correctamente  |
11   | Realizar engrase de rodamientos del motor:                |                                 |
     | - Rodamiento lado acople (DE): 15g Mobilux EP2           | Grasa fresca visible en purga   | NO sobre-engrasar
     | - Rodamiento lado ventilador (NDE): 10g Mobilux EP2      | Grasa fresca visible en purga   | Esperar 30 seg entre pulsos
12   | Verificar estado del sello mecanico:                      | Sin goteo visible               | Si goteo > 10 gotas/min,
     | - Observar area de sello por fugas                        |                                 | programar reemplazo
     | - Verificar lineas de quench/flush (si aplica)            | Lineas sin obstruccion          |
13   | Verificar estado del filtro de succion (si aplica):       | dP < 0.5 bar                    | Limpiar si dP > 0.5 bar
14   | Limpiar exterior de la bomba y motor.                     | Equipo limpio                   |
15   | Retirar LOTO segun procedimiento LOTO-P2101A-001.        | LOTO retirado completamente     | Verificar area despejada
16   | Arrancar bomba y monitorear durante 15 minutos:           |                                 |
     | - Vibración (si sensor disponible)                        | < 4.5 mm/s RMS                  | Registrar valores
     | - Temperatura rodamientos (pistola IR)                    | < 70 C                          |
     | - Presion descarga                                        | 10-12 bar (PI-2105)             |
     | - Corriente motor                                         | < 120 A (FLA: 135 A)            |
     | - Ruido anormal                                           | Sin ruido inusual               |
17   | Registrar trabajo en CMMS y cerrar PTW.                   | OT y PTW cerrados               |

DATOS A REGISTRAR:
- Vibracion lado acople (DE): ________ mm/s RMS
- Vibracion lado libre (NDE): ________ mm/s RMS
- Temperatura rodamiento DE: ________ C
- Temperatura rodamiento NDE: ________ C
- Desalineamiento angular: ________ mm/100mm
- Desalineamiento paralelo: ________ mm
- Presion descarga: ________ bar
- Corriente motor: ________ A
- Estado sello mecanico: OK / Goteo leve / Requiere reemplazo
- Observaciones: ________________________________________

CRITERIOS DE ACEPTACION POST-MANTENIMIENTO:
- Vibracion global: < 4.5 mm/s RMS (ISO 10816-3, Grupo 2)
- Temperatura rodamientos: < 70 C (medicion superficial)
- Presion descarga: dentro de +/- 5% del setpoint
- Corriente motor: < 90% de FLA (Full Load Amps)
- Sin fugas visibles en sellos, bridas, o conexiones

REFERENCIA A MANUAL DE FABRICANTE:
- Flowserve HPX Installation, Operation and Maintenance Manual, Section 7: Maintenance
- Flowserve Document No.: FLS-HPX-IOM-2019, Pages 45-62
```
