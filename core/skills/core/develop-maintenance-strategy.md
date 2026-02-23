# Develop Maintenance Strategy
## Skill ID: MAINT-01
## Version: 1.0.0
## Category: Maintenance Intelligence (Agent 3)
## Priority: P1 - Critical

---

## Purpose

Develop comprehensive, RCM-based maintenance strategies for industrial facilities that shift organizations from reactive to proactive maintenance regimes. This skill applies Reliability Centered Maintenance methodology (SAE JA1011/JA1012) to determine the optimal maintenance approach for every asset based on its criticality, failure characteristics, and operating context.

The maintenance strategy is the single most impactful document in operational readiness. Industry data consistently shows that reactive maintenance costs 2-5x more than planned maintenance (Pain M-03), and 55-65% of organizations remain predominantly reactive (Pain PE-02). Furthermore, studies by the Electric Power Research Institute (EPRI) and independent consultants reveal that 30-50% of existing preventive maintenance tasks add no value -- they neither prevent failures nor detect degradation (Pain SM-05). This skill addresses all three pain points by creating strategies grounded in failure analysis rather than arbitrary calendar intervals.

A properly developed RCM-based strategy typically achieves: 25-40% reduction in total maintenance costs within 2-3 years, 10-25% improvement in asset availability, 50-70% reduction in reactive/emergency work orders, and measurable improvements in safety and environmental compliance. The strategy also provides the analytical foundation for spare parts optimization, workforce planning, and CMMS configuration.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **RCM as the Non-Negotiable Foundation**: Every maintenance task recommendation must trace back to a specific failure mode identified through systematic RCM analysis per SAE JA1011. No task should exist "because the OEM said so" without first validating through the RCM decision logic that the task is technically feasible and worth doing.

2. **Criticality-Driven Depth of Analysis**: Not all assets warrant full RCM. The agent must apply a tiered approach:
   - **Criticality A (High)**: Full classical RCM with complete FMECA, minimum 8-15 failure modes per equipment
   - **Criticality B (Medium)**: Streamlined RCM with focused FMECA, minimum 4-8 failure modes per equipment
   - **Criticality C (Low)**: Manufacturer-recommended maintenance or run-to-failure, 2-4 dominant failure modes only

3. **Condition-Based Maintenance as First Choice**: For every failure mode with a detectable degradation pattern (P-F curve interval > inspection interval), CBM must be the first option evaluated. Time-based preventive maintenance is only selected when CBM is not technically feasible or economically justified.

4. **Quantitative Decision-Making**: Where data exists, maintenance intervals must be calculated using Weibull analysis or equivalent reliability methods, not estimated from "experience." When data is insufficient, the agent must clearly state assumptions and recommend data collection strategies.

5. **CMMS-Ready Output**: Every maintenance task must be specified to a level of detail sufficient for direct loading into SAP PM, IBM Maximo, Infor EAM, or equivalent CMMS -- including task descriptions, frequencies, craft assignments, estimated durations, material requirements, and work order types.

6. **Total Cost of Ownership Perspective**: The strategy must quantify the lifecycle cost implications of maintenance decisions, including the cost of planned maintenance, expected cost of residual failures, spare parts inventory costs, and CBM technology investment costs.

7. **Living Document Philosophy**: The strategy must include mechanisms for continuous improvement -- feedback loops from failure analysis, PM task effectiveness reviews, and trigger points for strategy revision.

8. **Language**: Spanish (Latin American) for all deliverables, with industry-standard English technical terms preserved (RCM, FMECA, CBM, MTBF, P-F interval, etc.).

---

## Trigger / Invocation

```
/develop-maintenance-strategy
```

### Natural Language Triggers
- "Develop an RCM-based maintenance strategy for [facility/system]"
- "Create a reliability-centered maintenance plan"
- "Shift our maintenance from reactive to proactive"
- "Build a maintenance strategy using RCM methodology for [industry] application"
- "Desarrollar estrategia de mantenimiento basada en RCM"
- "Crear plan de mantenimiento centrado en confiabilidad para [planta]"
- "Necesitamos pasar de mantenimiento reactivo a proactivo"

### Aliases
- `/rcm-strategy`
- `/maintenance-strategy-rcm`
- `/maint-strategy`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `equipment_register` | Master equipment list with functional hierarchy (plant > area > system > equipment > component), tag numbers, descriptions, and equipment types | .xlsx / .csv | Client / Engineering |
| `operating_context` | Process description including duty cycle (continuous/batch/standby), throughput targets, environmental conditions, and performance standards | .docx / .pdf / text | Client Operations / Engineering |
| `industry_sector` | Primary industry (Mining, Oil & Gas, Power Generation, Water/Wastewater, Chemical, Pulp & Paper, Cement, Food & Beverage) | Text | User |
| `criticality_assessment` | Equipment criticality ratings (A/B/C) or raw risk assessment data; if not available, the agent will perform criticality assessment as Phase 1 | .xlsx | Client / Agent |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `failure_history` | CMMS work order export with failure dates, failure modes, repair descriptions, and downtime durations (minimum 2 years recommended) | OREDA / IEEE 493 generic data applied |
| `equipment_datasheets` | Technical specifications (capacity, materials, design conditions) | Industry-typical specifications assumed |
| `vendor_maintenance_manuals` | OEM-recommended maintenance schedules and procedures | Generic OEM recommendations by equipment type |
| `p_and_ids` | Piping & Instrumentation Diagrams showing process flows, instrumentation, and protection systems | Process description used; hidden function analysis flagged as limited |
| `existing_pm_program` | Current preventive maintenance tasks, frequencies, and procedures | Greenfield (no existing program) assumed |
| `regulatory_requirements` | Country and industry-specific mandatory maintenance and inspection requirements | Chilean regulatory framework applied (SEC, SERNAGEOMIN, SMA as applicable) |
| `cmms_platform` | Target CMMS system for plan upload | Generic output (SAP PM field mapping compatible) |
| `risk_matrix` | Client's corporate risk assessment matrix | VSC standard 5x5 consequence-probability matrix |
| `annual_operating_hours` | Expected operating hours per year per equipment | 8,000 hours/year for continuous; 4,000 for intermittent |
| `availability_targets` | Target mechanical/process availability | Industry-typical: Mining 90-92%, O&G 95-97%, Power 92-95% |
| `spare_parts_catalog` | Existing spare parts inventory and procurement data | Generated from FMECA analysis |
| `budget_constraints` | Maintenance budget limits or cost reduction targets | Unconstrained optimization; budget impact reported |

### Context Enrichment (Automatic)

The agent will automatically:
- Query OREDA (Offshore and Onshore Reliability Data) for generic failure rates by equipment type when site-specific data is unavailable
- Retrieve IEEE 493 Gold Book data for electrical equipment reliability parameters
- Access the **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) for failure mode classification (18 mechanisms, 46 causes), supplemented by ISO 14224 for equipment taxonomy
- Pull CBM technology applicability matrices (which technologies apply to which equipment types and failure modes)
- Identify applicable regulatory inspection requirements for the jurisdiction
- Retrieve industry-specific maintenance KPI benchmarks from SMRP (Society for Maintenance & Reliability Professionals)
- Access VSC internal equipment failure mode libraries from prior projects

---

## Output Specification

### Deliverable 1: Maintenance Strategy Report (.docx)

**Filename**: `{ProjectCode}_Estrategia_Mantenimiento_RCM_{SystemCode}_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 40-80 pages depending on scope (excluding appendices)

**Structure**:

1. **Cover Page** -- VSC branding, project identification, system scope, revision status
2. **Document Control** -- Revision history, review and approval matrix, distribution list
3. **Table of Contents** -- Auto-generated, minimum 3 levels
4. **Executive Summary** (3-4 pages)
   - Current state assessment (reactive vs. proactive ratio)
   - Key findings from criticality and RCM analysis
   - Recommended maintenance mix (target: PM 35-45%, PdM 20-30%, CM 15-25%, RTF 5-10%)
   - Estimated cost impact (current vs. optimized)
   - Top 10 high-impact recommendations
   - Implementation timeline summary
5. **Introduction & Scope** (2-3 pages)
   - Project context and objectives
   - Systems and equipment within scope (with equipment count by type)
   - Methodology overview (RCM per SAE JA1011)
   - Standards and references
   - Exclusions and limitations
6. **Operating Context** (3-5 pages)
   - Process description and flow diagrams
   - Operating modes and duty cycles
   - Environmental conditions (temperature, humidity, altitude, corrosive agents, abrasives)
   - Performance requirements (throughput, quality, availability targets)
   - Safety and environmental regulatory requirements
   - Interaction between systems (dependencies, redundancy)
7. **Criticality Analysis** (5-8 pages)
   - 7.1 Criticality methodology (risk matrix, consequence categories, probability scales)
   - 7.2 Criticality results summary table (all equipment with ratings)
   - 7.3 Criticality distribution analysis (expected: A 10-15%, B 25-35%, C 50-65%)
   - 7.4 Pareto analysis of critical equipment by system
   - 7.5 Criticality heat maps by plant area
   - 7.6 Comparison with industry benchmarks
8. **RCM Analysis** (10-20 pages)
   - 8.1 RCM methodology and SAE JA1011 compliance statement
   - 8.2 Functional analysis summary (functions and functional failures by system)
   - 8.3 Failure mode identification summary (total failure modes analyzed, distribution by consequence type)
   - 8.4 RCM decision logic application (task selection statistics)
   - 8.5 System-by-system strategy summary:
     - For each major system: operating context, critical equipment, dominant failure modes, recommended maintenance approach, key findings
   - 8.6 Run-to-failure justifications (for failure modes assigned RTF)
   - 8.7 Design-out maintenance recommendations (for failure modes where redesign is more effective than maintenance)
9. **Condition-Based Maintenance Program** (5-8 pages)
   - 9.1 CBM technology selection rationale
   - 9.2 Vibration analysis program (equipment scope, measurement points, frequencies, alarm limits per ISO 10816/20816)
   - 9.3 Infrared thermography program (electrical and mechanical applications, survey routes)
   - 9.4 Oil analysis program (equipment scope, test suites, sampling frequencies, limits)
   - 9.5 Ultrasonic testing program (leak detection, bearing assessment, steam trap survey)
   - 9.6 Motor current analysis / electrical testing program
   - 9.7 Other technologies (acoustic emission, laser alignment, performance monitoring)
   - 9.8 CBM route design and resource requirements
   - 9.9 CBM technology investment estimate
10. **Maintenance Task Summary** (3-5 pages)
    - 10.1 Total task count by type (PM, PdM, Inspection, CM, RTF)
    - 10.2 Annual maintenance labor hours by craft (mechanical, electrical, instrumentation, predictive)
    - 10.3 Task frequency distribution (daily, weekly, monthly, quarterly, semi-annual, annual, shutdown)
    - 10.4 Running vs. shutdown task analysis
    - 10.5 Maintenance workload profile (weekly/monthly labor hour forecast)
11. **Spare Parts Requirements** (2-3 pages)
    - 11.1 Critical spare parts identified from FMECA
    - 11.2 Insurance spares recommendation
    - 11.3 Consumables and routine replacement parts
    - 11.4 Estimated annual spare parts cost
12. **Maintenance Organization Requirements** (2-3 pages)
    - 12.1 Estimated FTE by craft/discipline derived from workload analysis
    - 12.2 Skill and certification requirements
    - 12.3 Specialist resources (CBM technicians, reliability engineers)
    - 12.4 Contractor vs. in-house analysis
13. **Maintenance KPI Framework** (2-3 pages)
    - 13.1 Leading and lagging KPIs per SMRP best practice
    - 13.2 Target values with benchmarking rationale
    - 13.3 KPI measurement frequency and data sources
    - 13.4 Dashboard specification
14. **Implementation Roadmap** (2-3 pages)
    - 14.1 CMMS configuration requirements and timeline
    - 14.2 Phase 1: Quick wins (0-6 months)
    - 14.3 Phase 2: Full program deployment (6-18 months)
    - 14.4 Phase 3: Optimization and continuous improvement (18+ months)
    - 14.5 Change management considerations
15. **Appendices**
    - A: Complete equipment register with criticality ratings
    - B: Reference to FMECA workbook (.xlsx)
    - C: CBM technology specifications
    - D: Regulatory maintenance requirements register
    - E: Industry benchmark data sources

### Deliverable 2: RCM/FMECA Analysis Workbook (.xlsx)

**Filename**: `{ProjectCode}_RCM_FMECA_{SystemCode}_v{Version}_{YYYYMMDD}.xlsx`

**Sheets**: Equipment Register, Criticality Analysis, Functional Analysis, FMECA Worksheet, Maintenance Plan Summary, CBM Program, Spare Parts Requirements, KPI Targets, Maintenance Workload Model

### Deliverable 3: CMMS Upload Package (.xlsx)

**Filename**: `{ProjectCode}_CMMS_Upload_{SystemCode}_v{Version}_{YYYYMMDD}.xlsx`

Pre-formatted maintenance plans ready for CMMS import with fields mapped to SAP PM / Maximo / Infor EAM standard schemas.

---

## Methodology & Standards

### Primary Standards (Mandatory Compliance)

| Standard | Application |
|----------|-------------|
| **SAE JA1011:2009** | Evaluation criteria for RCM processes -- every analysis MUST satisfy all seven RCM questions |
| **SAE JA1012:2011** | Guide to the RCM Standard -- detailed methodology reference |
| **ISO 14224:2016** | Collection and exchange of reliability and maintenance data -- equipment taxonomy reference (failure mode classification per VSC Failure Modes Table) |
| **ISO 55000:2014 / 55001 / 55002** | Asset Management -- strategic alignment of maintenance strategy with organizational objectives |
| **SMRP Best Practice Metrics** | Maintenance KPI definitions, calculations, and benchmark targets |

### Secondary Standards (Reference)

| Standard | Application |
|----------|-------------|
| **ISO 13306:2017** | Maintenance terminology -- standard definitions |
| **ISO 17359:2018** | Condition monitoring -- general guidelines for CBM program design |
| **ISO 10816 / ISO 20816** | Vibration severity evaluation criteria for rotating machinery |
| **ISO 18436** | Condition monitoring and diagnostics -- competency requirements |
| **EN 16646:2014** | Maintenance within physical asset management |
| **NORSOK Z-008:2017** | Risk-based maintenance and consequence classification |
| **API 580/581** | Risk-Based Inspection for pressure equipment |
| **IEEE 493 (Gold Book)** | Recommended practice for design of reliable industrial/commercial power systems |
| **OREDA Handbook** | Offshore and Onshore Reliability Data |
| **MIL-STD-1629A** | Procedures for FMECA (historical reference) |

### RCM Seven Questions (SAE JA1011)

For EVERY failure mode, the analysis MUST answer:
1. What are the functions and associated desired standards of performance of the asset in its present operating context? (Functions)
2. In what ways can it fail to fulfill its functions? (Functional Failures)
3. What causes each functional failure? (Failure Modes)
4. What happens when each failure occurs? (Failure Effects)
5. In what way does each failure matter? (Failure Consequences)
6. What should be done to predict or prevent each failure? (Proactive Tasks)
7. What should be done if a suitable proactive task cannot be found? (Default Actions)

### RCM Decision Logic Tree

```
For each Failure Mode:
|
+-- Is the failure evident to operators during normal duties?
|   |
|   +-- YES (Evident Failure) --------> Consequence Assessment:
|   |   |
|   |   +-- Safety/Environmental consequence?
|   |   |   +-- YES --> On-condition task feasible? --> YES: Apply CBM
|   |   |   |          Scheduled restoration feasible? --> YES: Apply PM
|   |   |   |          Scheduled discard feasible? --> YES: Apply replacement
|   |   |   |          Combination of tasks? --> YES: Apply combination
|   |   |   |          NO feasible task --> REDESIGN IS MANDATORY
|   |   |
|   |   +-- Operational consequence? (affects output/quality/service)
|   |   |   +-- YES --> On-condition task feasible AND justified? --> YES: Apply CBM
|   |   |   |          Scheduled restoration feasible AND justified? --> YES: Apply PM
|   |   |   |          Scheduled discard feasible AND justified? --> YES: Apply replacement
|   |   |   |          NO feasible/justified task --> Run-to-Failure acceptable
|   |   |
|   |   +-- Non-operational consequence (repair cost only)
|   |       +-- On-condition task feasible AND cost-justified? --> YES: Apply CBM
|   |       +-- Scheduled restoration cost-justified? --> YES: Apply PM
|   |       +-- NO cost justification --> Run-to-Failure
|   |
|   +-- NO (Hidden Failure) ---------> Hidden Function Assessment:
|       |
|       +-- Safety/Environmental consequence if protective device fails AND
|       |   the protected function also fails?
|       |   +-- YES --> Failure-finding task feasible? --> YES: Apply FFT
|       |   |          On-condition task feasible? --> YES: Apply CBM
|       |   |          Scheduled restoration feasible? --> YES: Apply PM
|       |   |          NO feasible task --> REDESIGN IS MANDATORY
|       |
|       +-- No safety/environmental consequence of multiple failure
|           +-- Failure-finding task cost-justified? --> YES: Apply FFT
|           +-- NO --> Run-to-Failure acceptable
```

### Maintenance Task Type Definitions

| Task Type | Code | Description | Applicable When |
|-----------|------|-------------|-----------------|
| On-Condition (CBM) | OC | Monitor condition parameter; act on threshold exceedance | Detectable degradation with sufficient P-F interval |
| Scheduled Restoration | SR | Restore equipment to "as new" condition at fixed interval | Age-reliability relationship exists (Weibull beta > 1) |
| Scheduled Discard | SD | Replace component at fixed interval regardless of condition | Wear-out item, restoration not feasible |
| Failure-Finding | FF | Test hidden function at defined interval to verify operability | Protective devices, standby equipment, safety systems |
| Run-to-Failure | RTF | No scheduled maintenance; repair on failure | Non-critical, no safety/environmental consequence, no cost justification for PM |
| Combination | COMB | Multiple task types for the same failure mode | Complex failure modes requiring layered protection |
| Redesign | RD | Modify equipment or process to eliminate failure mode | Safety/environmental failure mode with no feasible task |

### Industry Benchmark Data

| Metric | World-Class | Top Quartile | Median | Bottom Quartile |
|--------|------------|--------------|--------|-----------------|
| Planned vs. Unplanned Work | >90% planned | 80-90% | 50-60% | <40% |
| PM/PdM Compliance | >95% | 90-95% | 75-85% | <70% |
| Schedule Compliance | >90% | 85-90% | 70-80% | <60% |
| Maintenance Cost (% RAV) | 1.5-2.5% | 2.5-3.5% | 3.5-5.0% | >5.0% |
| Emergency Work Orders | <2% | 2-5% | 10-20% | >25% |
| Wrench Time | >55% | 45-55% | 25-35% | <25% |
| MTBF Improvement | >10%/year | 5-10%/year | 0-5%/year | Declining |
| Reactive Maintenance Cost Multiplier | -- | 1.5x planned | 2-3x planned | 3-5x planned |

### VSC Failure Modes Table — Mandatory Standard

> **MANDATORY RULE:** Every failure mode identified in this RCM/FMECA analysis MUST be classified using the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). No alternative failure mode taxonomy is permitted. This table supersedes generic ISO 14224 failure coding for all VSC failure mode classification purposes.

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

#### Compliance Rules for RCM/FMECA Development

1. **NO ad-hoc failure mode descriptions.** Never write free-text failure modes like "pump fails" or "valve malfunction." Always decompose into What + Mechanism + Cause using the VSC FM Table.
2. **Every FMECA worksheet row** must have columns: Component (What), FM-Mechanism (from 18), FM-Cause (from 46), with the combined FM name auto-generated as "[Mechanism] due to [Cause]".
3. **Step 9 (Failure Mode Identification)** of this skill's execution MUST use the VSC FM Table as the primary failure mode classification source. ISO 14224 serves as supplementary reference for equipment taxonomy only.
4. **Cross-reference column:** The FM Table includes "Other Mechanisms grouped" and "Other Causes grouped" columns for reliability investigations -- use these to consolidate similar failure modes during Pareto analysis.
5. **Description of FM Application:** The FM Table includes recommended components and maintenance strategies for each failure mode -- use these as starting points when developing maintenance tasks in Steps 10-12, then customize for the specific operating context.
6. **Consistency across agents:** All VSC agents (Maintenance, Operations, Asset Management, Commissioning, etc.) that identify failure modes MUST use this same table, ensuring cross-project and cross-agent consistency.
7. **FMECA Workbook (Deliverable 2):** The RCM/FMECA workbook sheets must include dedicated columns for FM-Mechanism and FM-Cause drawn exclusively from the VSC FM Table, in addition to any ISO 14224 reference coding.

---

## Step-by-Step Execution

### Phase 1: Data Acquisition & Validation (Steps 1-4)

**Step 1: Receive and validate the equipment register.**
- Parse the equipment hierarchy and validate tag numbering conventions (ISA 5.1 or client standard)
- Verify functional hierarchy completeness (no orphan tags, no missing levels)
- Count equipment by type: rotating (pumps, compressors, fans, motors), static (vessels, heat exchangers, piping), electrical (transformers, switchgear, MCCs), instrumentation (transmitters, valves, analyzers)
- Flag any gaps: missing descriptions, duplicate tags, inconsistent naming
- Generate equipment count summary by system and type
- **Quality gate**: Equipment register must be >95% complete before proceeding

**Step 2: Establish the operating context for each system.**
- Document primary functions and quantified performance standards (e.g., "Transfer 500 m3/hr of slurry at 15 bar to thickener")
- Record operating mode: continuous (24/7), semi-continuous (5x2 shifts), batch, campaign, or standby
- Document environmental conditions: ambient temperature range, humidity, altitude, dust/particulate levels, corrosive atmosphere, seismic zone
- Identify regulatory constraints: mandatory inspections, environmental permits, safety case requirements
- Quantify production impact: revenue loss per hour of downtime, penalty clauses, supply chain impacts
- Map system interdependencies: series/parallel configurations, redundancy, shared utilities
- **Output**: Operating context document per system

**Step 3: Collect and validate failure data.**
- If historical data available: extract from CMMS, clean, and classify using the VSC Failure Modes Table (per `methodology/standards/VSC_Failure_Modes_Table.xlsx`)
- Calculate actual MTBF, MTTR, and failure rates per equipment type
- Identify top failure modes by frequency and by consequence
- Perform Weibull analysis for equipment types with sufficient data (n >= 5 failures)
- If no historical data: apply OREDA/IEEE 493 generic failure rates with stated assumptions
- Cross-reference failure data with vendor warranty claims and known defect bulletins
- **Quality gate**: Failure data source (actual or generic) documented for every equipment type

**Step 4: Review OEM maintenance recommendations.**
- Extract vendor-recommended maintenance tasks, intervals, and procedures
- Evaluate OEM recommendations critically (OEM interests may not align with owner interests)
- Identify warranty-mandated maintenance that must be preserved regardless of RCM outcome
- Note any OEM service contracts that influence maintenance approach
- Compile lubrication requirements (types, quantities, intervals)
- **Output**: OEM recommendation register cross-referenced to equipment

### Phase 2: Criticality Analysis (Steps 5-7)

**Step 5: Perform equipment criticality assessment.**
- Apply 5x5 risk matrix (or client's corporate matrix if provided)
- Assess each equipment item against consequence categories:
  - Safety: potential for injury, fatality, or process safety event (1-5)
  - Environmental: potential for emissions, spills, or environmental damage (1-5)
  - Production: throughput loss, product quality impact, downstream effects (1-5)
  - Maintenance cost: repair cost, secondary damage, long lead-time parts (1-5)
  - Reputation/regulatory: compliance violations, community impact (1-5)
- Assess probability of failure based on: historical data, generic data, operating context, age, condition (1-5)
- Calculate Risk Priority Number: RPN = Maximum Consequence Score x Probability
- Assign criticality band: A (Critical: RPN 15-25), B (Important: RPN 8-14), C (General: RPN 1-7)

**Step 6: Validate criticality distribution.**
- Check distribution against expected ranges:
  - Criticality A: 10-15% of total equipment (flag if outside 8-20%)
  - Criticality B: 25-35% of total equipment (flag if outside 20-40%)
  - Criticality C: 50-65% of total equipment (flag if outside 45-70%)
- If distribution is skewed, review and recalibrate criteria
- Cross-check: all safety-critical equipment (SIL-rated, pressure relief, fire protection) must be Criticality A
- Generate Pareto charts: top critical equipment by system, by consequence type

**Step 7: Determine analysis depth per criticality band.**
- Criticality A: Full classical RCM analysis (complete FMECA, all seven RCM questions, CBM assessment)
- Criticality B: Streamlined RCM (focused FMECA on dominant failure modes, task selection for top 80% of risk)
- Criticality C: Generic maintenance strategy (OEM-based with basic validation) or run-to-failure
- Document analysis depth decision and resource allocation

### Phase 3: RCM/FMECA Analysis (Steps 8-12)

**Step 8: Perform functional analysis.**
- For each system: define boundaries, interfaces, and interactions
- Identify all functions (primary and secondary) with quantified performance standards
- Format: "To [verb] [object] [performance standard] [operating context]"
- Example: "To pump process water from Tank T-100 to Reactor R-200 at 150 m3/hr minimum, 12 bar discharge pressure, continuously during production"
- Identify functional failures: all ways each function can be lost or degraded

**Step 9: Identify failure modes and effects (per VSC Failure Modes Table).**
- For each functional failure, identify all reasonably likely failure modes
- **MANDATORY: Use the VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`) as the primary failure mode classification source. Every failure mode MUST be decomposed into the three-part structure: **What** (component) + **Mechanism** (from 18 official VSC mechanisms) + **Cause** (from 46 official VSC causes)
- ISO 14224 equipment taxonomy may be used as supplementary reference for equipment classification, but failure mode naming and coding MUST follow the VSC FM Table format: "[Mechanism] due to [Cause]"
- Document for each failure mode:
  - **Component (What):** The specific part or element that fails
  - **FM-Mechanism (How):** Selected from the 18 VSC mechanisms (e.g., Wears, Corrodes, Cracks, Blocks)
  - **FM-Cause (Why):** Selected from the 46 VSC causes (e.g., Contamination, Mechanical overload, Cyclic loading)
  - **Combined FM Name:** Auto-generated as "[Mechanism] due to [Cause]"
  - Local effect (what happens to the equipment)
  - System effect (what happens to the system)
  - Plant effect (what happens to the facility -- production, safety, environment)
  - Detection method (how operators/maintainers know the failure has occurred or is developing)
  - Evidence of failure (what is seen, heard, smelled, alarmed)
- Classify consequence: Safety, Environmental, Operational, Non-operational, or Hidden
- Use the FM Table's "Description of FM Application" column as a starting reference for identifying applicable components and maintenance strategies per failure mode

**Step 10: Apply RCM decision logic for task selection.**
- For each failure mode, walk through the RCM decision tree
- For on-condition tasks: identify the P-F interval, select monitoring technology, set frequency at no more than half the P-F interval
- For scheduled restoration: determine interval from reliability data (Weibull analysis) or OEM recommendation validated against operating experience
- For scheduled discard: identify life-limited components with known wear-out characteristics
- For failure-finding tasks: calculate required test interval to achieve target availability of the hidden function
- For run-to-failure: document the justification (why no proactive task is warranted)
- For redesign: document the failure mode that cannot be managed by maintenance alone

**Step 11: Optimize and package maintenance tasks.**
- Group tasks by equipment to form efficient work packages
- Harmonize frequencies: align to standard calendar intervals (daily, weekly, monthly, quarterly, semi-annual, annual, biennial, major overhaul)
- Identify task bundling opportunities (tasks on same equipment at same frequency combined into single work order)
- Classify by equipment state required: running (online) vs. shutdown (offline)
- Estimate duration, crew size, craft requirements, tools, and materials for each task
- Calculate total annual maintenance hours by craft

**Step 12: Design the Condition-Based Maintenance program.**
- For every on-condition task identified in Step 10:
  - Select optimal CBM technology (vibration, thermography, oil analysis, ultrasound, motor current analysis, performance monitoring, visual/borescope)
  - Define measurement points (location on equipment, orientation, sensor type)
  - Establish baseline values and alarm/alert thresholds (per ISO 10816, OEM specs, or experience)
  - Set monitoring frequency (continuous online, periodic route-based, campaign)
  - Design efficient monitoring routes (geographic sequence, estimated route time)
- Estimate CBM technology investment (instruments, software, training)
- Calculate expected ROI of CBM program

### Phase 4: Deliverable Generation (Steps 13-16)

**Step 13: Compile the FMECA workbook.**
- Populate all worksheets with analysis data
- Apply conditional formatting for criticality highlighting
- Add data validation drop-downs for standardized fields
- Include formula-driven summary statistics
- Generate pivot-table-ready data structure

**Step 14: Write the maintenance strategy report.**
- Executive summary with quantified findings and recommendations
- Criticality analysis results with visualizations (Pareto, heat maps, distribution charts)
- System-by-system strategy narrative with key findings
- CBM program specification
- Maintenance workload analysis and organization requirements
- Implementation roadmap with milestones and dependencies

**Step 15: Prepare the CMMS upload package.**
- Map maintenance tasks to CMMS fields (task list, operation, frequency, craft, duration, materials)
- Generate maintenance item codes compatible with target CMMS
- Create bill of materials for each maintenance task
- Package in import-ready format

**Step 16: Perform cross-reference validation.**
- Every equipment item has a criticality rating -- no gaps
- Every Criticality A/B item has complete FMECA -- no missing analyses
- Every failure mode has a task decision -- no blanks in decision column
- FMECA tasks match maintenance plan summary -- totals reconcile
- CBM program references correct equipment tags and technologies -- no mismatches
- Spare parts link to specific maintenance tasks -- traceability complete
- Tag numbers consistent across all deliverables -- zero discrepancies

---

## Quality Criteria

### Content Quality (Target: >91% SME Approval Rate)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| SAE JA1011 Compliance | 25% | RCM process demonstrably satisfies all seven questions for every failure mode | Checklist audit against JA1011 evaluation criteria |
| Failure Mode Completeness | 20% | All reasonably likely failure modes identified; no dominant modes missed | SME review; comparison with OREDA/industry failure mode libraries |
| Task Selection Logic | 20% | Correct application of RCM decision logic; task type appropriate for failure mode | Decision logic audit trail; consequence classification review |
| Criticality Accuracy | 15% | Risk ratings reflect actual operational consequences; distribution within expected ranges | Validation workshop; distribution analysis |
| CBM Appropriateness | 10% | CBM technologies are technically feasible and correctly specified for each application | CBM specialist review; technology-failure mode compatibility check |
| Implementability | 10% | Tasks sufficiently detailed for CMMS configuration without further interpretation | CMMS administrator review; field trial of sample tasks |

### Automated Quality Checks

- [ ] Every equipment item in register has a criticality rating
- [ ] Criticality distribution: A 10-15%, B 25-35%, C 50-65% (flag deviations)
- [ ] Every Criticality A item has complete FMECA (minimum 8 failure modes)
- [ ] Every Criticality B item has streamlined FMECA (minimum 4 failure modes)
- [ ] Every failure mode has a non-blank task decision
- [ ] No "TBD," "pending," or placeholder entries in any deliverable
- [ ] Task frequencies are standard intervals (not arbitrary numbers)
- [ ] CBM alert/alarm thresholds specified with units for every on-condition task
- [ ] Spare parts identified for every scheduled restoration/discard task
- [ ] Annual maintenance hours by craft sum correctly
- [ ] Equipment tags are consistent across all sheets and documents
- [ ] Function statements follow "To [verb] [object] [performance standard]" format
- [ ] VSC Failure Modes Table (18 mechanisms, 46 causes) used correctly throughout FMECA per `methodology/standards/VSC_Failure_Modes_Table.xlsx`
- [ ] All run-to-failure decisions have documented justification
- [ ] Safety/environmental failure modes never assigned run-to-failure without redesign recommendation

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| Agent 1 (Project Intelligence) | Equipment register, project scope, timeline | Critical | mcp-sharepoint |
| Agent 2 (Engineering Intelligence) | Equipment datasheets, P&IDs, process descriptions | Critical | mcp-sharepoint |
| Agent 5 (Workforce Readiness) | Workforce constraints, skill availability | Medium | mcp-sharepoint |
| Agent 9 (Asset Management) | Asset management policy, lifecycle objectives | High | mcp-sharepoint |
| `analyze-equipment-criticality` | Pre-existing criticality assessment | High | Internal |
| `analyze-reliability` | Weibull parameters, MTBF/MTTR from failure analysis | High | Internal |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `optimize-pm-program` (MAINT-02) | Baseline PM program for optimization | Sequential |
| `analyze-failure-patterns` (MAINT-03) | Failure mode library for pattern matching | On request |
| `benchmark-maintenance-kpis` (MAINT-04) | KPI targets from strategy | Automatic |
| `plan-turnaround` (MAINT-05) | Shutdown maintenance scope from RCM | On request |
| `model-staffing-requirements` (WF-01) | Maintenance labor hours for FTE calculation | Automatic |
| `track-competency-matrix` (WF-02) | Skill requirements from maintenance tasks | Automatic |
| `plan-training-program` (WF-04) | Training needs from new CBM/maintenance technologies | Automatic |
| `create-spare-parts-strategy` | Spare parts requirements from FMECA | Automatic |
| `create-kpi-dashboard` | KPI definitions and targets | Automatic |
| `create-maintenance-manual` | Detailed procedure development from task list | Sequential |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-cmms** | Extract failure history; upload maintenance plans | `GET /work-orders`, `GET /equipment`, `POST /maintenance-plans`, `GET /failure-codes` |
| **mcp-sharepoint** | Retrieve vendor manuals, P&IDs, datasheets; store deliverables | `GET /documents/{library}`, `POST /documents/{library}`, `GET /lists/{list}` |

---

## Templates & References

### Document Templates
- `VSC_Estrategia_Mantenimiento_RCM_Template_v3.0.docx` -- Strategy report template with VSC branding
- `VSC_RCM_FMECA_Workbook_Template_v4.0.xlsx` -- Standard FMECA workbook with all sheets pre-formatted
- `VSC_Criticality_Matrix_5x5_Template_v2.1.xlsx` -- Risk matrix and criticality assessment template
- `VSC_CBM_Program_Template_v2.0.xlsx` -- CBM route, threshold, and technology selection template
- `VSC_CMMS_Upload_Template_SAP_v1.5.xlsx` -- SAP PM compatible upload format
- `VSC_CMMS_Upload_Template_Maximo_v1.5.xlsx` -- IBM Maximo compatible upload format

### Reference Data Sources
- OREDA Handbook (6th Edition, 2015) -- Generic failure rate data for process industry equipment
- IEEE 493 Gold Book (2007) -- Reliability data for industrial and commercial power systems
- ISO 14224:2016 Annex A-F -- Equipment-specific failure mode and mechanism taxonomies
- EPRI AP-5311 -- Generic Component Failure Database for nuclear/power industry
- VSC Equipment Failure Mode Library -- Internal repository of 2,500+ failure modes by equipment type
- SMRP Best Practice Metrics -- Maintenance KPI definitions, formulas, and quartile benchmarks

### Knowledge Base
- Past RCM/FMECA projects by industry sector (mining, O&G, power, water)
- Equipment type failure mode libraries (pumps, compressors, motors, valves, heat exchangers, conveyors, crushers, mills)
- CBM technology selection matrices and P-F interval guides
- Maintenance strategy best practices documentation
- Regulatory maintenance requirement registers by jurisdiction

---

## Examples

### Example 1: Centrifugal Slurry Pump RCM Analysis

**Equipment**: PP-3201A/B, Cyclone Feed Pumps (2x100% redundant)
**Industry**: Copper Mining, Concentrator Plant
**Criticality**: A (Critical) -- RPN 20/25 (Safety=3, Production=5, Probability=4)

| RCM Field | Value |
|-----------|-------|
| **Function** | F1: To pump copper concentrate slurry from sump S-3200 to cyclone cluster CY-3301 at 450 m3/hr minimum, 28 bar discharge pressure, continuously during concentrator operation (8,000 hrs/year) |
| **Functional Failure** | FF1.1: Unable to deliver required flow rate (< 450 m3/hr) |
| **Failure Mode** | FM1.1.1: Impeller erosive wear due to abrasive slurry (d80 = 150 micron, SG 1.45) |
| **Failure Cause** | Progressive material loss from high-chrome impeller surfaces due to particle impingement; rate depends on slurry concentration, particle size, and velocity |
| **Local Effect** | Reduced pump efficiency (head-capacity curve shift), increased vibration, increased motor current draw |
| **System Effect** | Reduced cyclone feed rate, sub-optimal classification, reduced recovery |
| **Plant Effect** | Auto-changeover to standby pump (2 min). If standby unavailable: concentrator throughput reduced 100% until repair (est. 8-12 hours for impeller change) |
| **Consequence** | Operational (production impact if both pumps unavailable simultaneously) |
| **Task 1 (CBM)** | Vibration monitoring: overall velocity + spectral analysis at 4 points (DE bearing, NDE bearing, pump casing horizontal, pump casing vertical). Monthly route-based. Alert: 6.0 mm/s RMS. Alarm: 11.0 mm/s RMS (ISO 10816-3, Group 2, rigid foundation) |
| **Task 2 (CBM)** | Performance monitoring: discharge pressure vs. flow trending. Weekly (automated from DCS data). Alert: >10% deviation from baseline curve |
| **Task 3 (PM)** | Impeller condition inspection during planned pump changeover (quarterly). Visual assessment of wear pattern and remaining material thickness |
| **Task 4 (SD)** | Scheduled impeller replacement at 4,500 operating hours (based on Weibull analysis: beta=3.8, eta=5,200 hrs, target R(t)=0.90 at replacement interval) |
| **Spare Parts** | 1x impeller (high-chrome 28%), 1x wear plate, 1x shaft sleeve, 1x mechanical seal cartridge, 1x gasket set |
| **Estimated Annual Cost** | 2x impeller replacements @ USD 12,500 each = USD 25,000 parts; 2x 12-hour interventions @ 3 mechanics = 72 labor hours |

### Example 2: Strategy Distribution Summary (Mining Concentrator)

**Scope**: 850 equipment items across grinding, flotation, thickening, and filtration circuits

| Maintenance Type | % of Tasks | % of Annual Hours | Industry Benchmark |
|------------------|-----------|-------------------|-------------------|
| Condition-Based (PdM) | 28% | 15% | Top quartile: 25-30% |
| Preventive (Time-Based PM) | 38% | 45% | Target: 35-45% |
| Inspection / Failure-Finding | 12% | 8% | Target: 10-15% |
| Run-to-Failure (Corrective) | 18% | 5% (planned buffer) | Target: <20% |
| Design-Out Recommendations | 4% | N/A (CAPEX projects) | Continuous improvement |

**Key Findings**:
- 127 failure modes (15% of total analyzed) addressed by CBM, covering 68% of total production risk
- 42 existing PM tasks identified for elimination (no valid failure mode justification) -- saving 2,400 annual labor hours
- 8 design-out recommendations for chronic failure modes costing >USD 50,000/year each
- Estimated annual maintenance cost reduction: 22% (from USD 8.2M to USD 6.4M) within 24 months of full implementation
