# Generate Operating Procedures
## Skill ID: DOC-02
## Version: 1.0.0
## Category: B. Document Generation
## Priority: P1 - Critical
## Agent: Agent 2 - Documentation & Knowledge Management

## Purpose

Auto-generate Standard Operating Procedures (SOPs), Emergency Operating Procedures (EOPs), and Safe Work Procedures (SWPs) from source engineering documents including P&IDs, control narratives, cause-and-effect diagrams, vendor O&M manuals, HAZOP studies, and equipment data sheets. This skill transforms dense engineering information into clear, operator-friendly procedures that meet Process Safety Management (PSM) and regulatory requirements.

The persistent challenge in industrial operations is that 20-40% of PSM-required operating procedures are outdated, incomplete, or nonexistent at the time of startup (CSB investigation findings across multiple incidents; OSHA PSM citation data 2015-2024). This gap exists because procedure writing is labor-intensive (a single SOP for a complex unit operation requires 40-80 hours of engineering and operator input), and projects chronically underestimate the effort required. The result is operators relying on tribal knowledge, informal notes, or procedures from dissimilar facilities -- a direct contributor to operational incidents.

This skill directly addresses Pain Point CE-01 (Commissioning/Engineering Gap - PSM Documentation Currency) by automating the generation of first-draft procedures from engineering source documents, reducing the manual effort by 60-70% while ensuring consistency, completeness, and compliance with OSHA 29 CFR 1910.119 and equivalent international standards.

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Source Document Interpretation**: The agent must be capable of interpreting P&IDs (including ISA symbology per ANSI/ISA-5.1), control narratives, cause-and-effect matrices, HAZOP study findings, vendor O&M manuals, and process descriptions. It must extract operational sequences, safety interlocks, alarm setpoints, and normal operating parameters from these documents.

2. **Procedure Taxonomy**: Generate four distinct types of procedures, each with specific format and content requirements:
   - **SOPs (Standard Operating Procedures)**: Normal startup, shutdown, and steady-state operations
   - **EOPs (Emergency Operating Procedures)**: Response to abnormal situations, trips, and emergency scenarios
   - **SWPs (Safe Work Procedures)**: Task-specific safety procedures (hot work, confined space, line breaking, etc.)
   - **MOPs (Maintenance Operating Procedures)**: Operations support procedures for maintenance activities (equipment isolation, draining, purging)

3. **Operator-Friendly Language**: Procedures must be written at a reading level appropriate for the target audience (typically 8th-10th grade reading level per Flesch-Kincaid). Technical jargon must be used precisely and consistently. Each step must be a single, verifiable action. Conditional logic must follow IF-THEN-ELSE format.

4. **Safety Integration**: Every procedure must incorporate relevant safety information including PPE requirements, hazard identification, safety interlocks that must be active, permit requirements, and emergency response references. HAZOP recommendations must be cross-referenced to relevant procedure steps.

5. **Regulatory Compliance**: Generated procedures must satisfy the requirements of OSHA 29 CFR 1910.119(f) (Operating Procedures), EPA 40 CFR 68, Seveso III Directive (EU), COMAH Regulations (UK), and equivalent Chilean regulations (DS 594, DS 43, NCh 2245).

6. **Bilingual Generation**: Procedures must be generated in both English and Spanish (for Chilean operations), with technical terminology consistency maintained across languages using a controlled vocabulary.

## Trigger / Invocation

```
/generate-operating-procedures
```

**Aliases**: `/gen-sop`, `/operating-procedures`, `/procedimientos-operativos`, `/write-sop`

**Trigger Conditions**:
- Engineering documents (P&IDs, control narratives) are available for a new unit/system
- A new process or equipment is being commissioned and procedures are required
- Existing procedures require comprehensive rewrite due to major modification
- PSSR checklist identifies missing or inadequate operating procedures
- PSM audit identifies procedure gaps or non-conformances
- User requests procedure generation for a specific system, equipment, or operation

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| P&IDs (Piping & Instrumentation Diagrams) | .pdf, .dwg | Process P&IDs for the target system/unit. Minimum requirement for procedure generation. Must be at IFC (Issued for Construction) or As-Built revision |
| Control Narrative / Functional Description | .docx, .pdf | DCS/PLC control logic description including startup sequences, shutdown sequences, interlock descriptions, and alarm setpoints |
| Process Description | .docx, .pdf | Narrative description of the process including design intent, normal operating parameters, and process chemistry/physics |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Cause & Effect Diagrams | .xlsx, .pdf | Trip and interlock logic matrices showing cause-effect relationships |
| HAZOP Study Report | .docx, .xlsx | HAZOP findings with recommendations and safeguards for the target system |
| Vendor O&M Manuals | .pdf | Equipment-specific operating and maintenance instructions from OEM |
| Equipment Data Sheets | .pdf, .xlsx | Design parameters, operating limits, material specifications |
| Existing Procedures (Legacy) | .docx | Existing procedures from similar facilities for reference and consistency |
| Operator Interview Notes | .docx | Notes from operator walkthroughs and interviews capturing tribal knowledge |
| Training Materials | .pptx, .pdf | Existing training content that captures operational knowledge |
| Process Simulation Data | .xlsx | Steady-state and dynamic simulation results showing normal operating envelope |
| Alarm Rationalization Study | .xlsx | Alarm setpoints, priorities, and recommended operator responses |
| SIL Assessment / LOPA Study | .xlsx, .pdf | Safety Instrumented Function details and required response procedures |

### Input Validation Rules

- P&IDs must be legible and at minimum IFC revision; draft P&IDs generate a warning about potential inaccuracy
- Control narratives must reference the same tag numbers as the P&IDs; mismatches are flagged
- Vendor manuals in languages other than English or Spanish are flagged for translation
- Documents older than 5 years are flagged for currency verification
- Incomplete control narratives (e.g., startup sequence defined but no shutdown sequence) trigger gap identification

## Output Specification

### Primary Output: Operating Procedure Document (.docx)

**Filename**: `{ProjectCode}_SOP_{SystemCode}_{ProcedureTitle}_v{version}_{date}.docx`

**Document Structure (per OSHA 29 CFR 1910.119(f) requirements)**:

#### Section 1: Cover Page & Document Control
- Procedure number, title, revision, date
- System/unit name and boundaries
- Author, reviewer, approver names and dates
- Controlled copy number and distribution list
- Next review date (maximum 12 months per PSM requirements)

#### Section 2: Purpose & Scope
- Purpose of the procedure
- System/unit boundaries (reference to P&ID numbers)
- Applicability (which equipment/operations this procedure covers)
- Exclusions (what this procedure does NOT cover)

#### Section 3: Safety Information
- **Hazards**: Chemical hazards (MSDS/SDS references), physical hazards (pressure, temperature, rotating equipment), health hazards
- **PPE Requirements**: Required personal protective equipment with specifications
- **Permits Required**: Hot work, confined space, line break, excavation, elevated work
- **Safety Interlocks**: List of safety interlocks that must be active, with tag numbers and function descriptions
- **Emergency References**: Cross-reference to EOPs, emergency contact numbers, muster point locations

#### Section 4: Prerequisites & Initial Conditions
- Required conditions before starting the procedure
- Equipment status verification checklist
- Utility availability requirements (power, steam, cooling water, instrument air, nitrogen)
- Required tools, materials, and consumables
- Communication requirements (who to notify before starting)

#### Section 5: Procedure Steps
Structured as numbered steps with the following format:
```
Step [N]: [ACTION VERB] [Object] [Condition/Parameter]
         Performed by: [Role]
         Location: [Physical location / Panel reference]
         Expected Response: [What should happen]
         CAUTION: [Safety note if applicable]
         NOTE: [Additional information if applicable]
         IF [condition] THEN [action] ELSE [alternative action]
         Verification: [How to confirm step is complete]
```

Sub-sections within Section 5:
- 5.1: Normal Startup Procedure
- 5.2: Normal Operation (Steady State)
- 5.3: Normal Shutdown Procedure
- 5.4: Emergency Shutdown Procedure
- 5.5: Temporary Operations (if applicable)

#### Section 6: Operating Parameters Table

| Parameter | Tag Number | Unit | Normal Range | Alarm Low | Alarm High | Trip Low | Trip High |
|-----------|-----------|------|-------------|-----------|-----------|----------|----------|
| Discharge Pressure | 100-PT-001 | barg | 8.5-10.0 | 7.5 | 11.0 | 6.5 | 12.0 |

#### Section 7: Abnormal Situations & Troubleshooting
- Symptom-cause-action table for common abnormal conditions
- Reference to Emergency Operating Procedures (EOPs) for serious events
- Decision trees for complex troubleshooting scenarios

#### Section 8: References
- P&ID drawing numbers and revisions
- Control narrative document reference
- Vendor manual references
- Related procedures (cross-references)
- Applicable regulatory standards

#### Section 9: Revision History
- Change log documenting all revisions with description, date, and approver

### Secondary Output: Procedure Matrix (.xlsx)

**Filename**: `{ProjectCode}_Procedure_Matrix_{date}.xlsx`

Summary of all generated procedures with:
- Procedure number, title, type (SOP/EOP/SWP/MOP)
- Associated system/unit
- Source documents used
- Review/approval status
- Gaps identified (missing source data)
- Estimated completion effort for gaps

### Formatting Standards
- Font: Arial 11pt for body text, Arial 14pt bold for headings
- Margins: 2.5cm all sides
- Header: Company logo, procedure number, revision
- Footer: Page number, "CONTROLLED DOCUMENT - UNCONTROLLED WHEN PRINTED"
- Warning/Caution/Note boxes with standard formatting:
  - DANGER: Red border, red text header (imminent hazard, death/serious injury)
  - WARNING: Orange border, orange text header (potential hazard, injury)
  - CAUTION: Yellow border, yellow text header (equipment damage, minor injury)
  - NOTE: Blue border, blue text header (informational)
- Step numbering: Decimal format (5.1.1, 5.1.2, etc.)
- Action verbs: CAPITALIZED at start of each step (OPEN, CLOSE, START, STOP, VERIFY, RECORD, NOTIFY)

## Methodology & Standards

### Primary Regulatory Standards
- **OSHA 29 CFR 1910.119(f)** - Operating Procedures: Core US PSM requirement specifying that operating procedures must address steps for each operating phase, operating limits, safety and health considerations, and safety systems.
- **EPA 40 CFR Part 68** - Risk Management Program: Requires operating procedures as element of prevention program.
- **API RP 2001** - Fire Protection in Refineries: Operating procedure requirements for fire prevention.
- **CCPS Guidelines for Writing Effective Operating and Maintenance Procedures** - Chemical process safety consensus guidelines.
- **ISA-5.1-2022** - Instrumentation Symbols and Identification: Standard for P&ID interpretation.

### Chilean Regulatory Standards
- **DS 594** - Reglamento sobre Condiciones Sanitarias y Ambientales Basicas en los Lugares de Trabajo
- **DS 132** - Reglamento de Seguridad Minera
- **NCh 2245** - Hojas de Datos de Seguridad (Safety Data Sheets)
- **Ley 16.744** - Seguro Social contra Riesgos de Accidentes del Trabajo y Enfermedades Profesionales

### International Standards
- **IEC 62682** - Management of Alarm Systems: For alarm setpoint documentation in procedures
- **IEC 61511** - Safety Instrumented Systems: For SIF/SIL requirements in procedures
- **ISO 45001** - Occupational Health and Safety Management Systems

### Procedure Writing Best Practices
- **CCPS "Guidelines for Writing Effective Operating and Maintenance Procedures"** (2016 edition): Industry gold standard for procedure writing methodology
- **DOE-STD-1029** - Writer's Guide for Technical Procedures (US Department of Energy)
- **NUREG-1358** - Lessons Learned from NRC procedure review programs
- Flesch-Kincaid readability target: Grade level 8-10 for operator procedures
- Maximum procedure length: 50 pages for SOPs; 10 pages for EOPs (must be usable in emergency)
- Single action per step: Each step contains exactly one verifiable action
- Conditional steps: IF-THEN-ELSE format, never embedded conditions within action descriptions

### Industry Statistics
- Average SOP manual effort: 40-80 hours per procedure (for complex unit operations)
- Typical plant requires 200-500 SOPs, 50-150 EOPs, 30-80 SWPs
- 20-40% of PSM-required procedures are outdated at any given time (OSHA citation data)
- Procedure-related causes cited in 60-70% of process safety incidents (CSB investigations)
- Annual procedure review compliance rate: 65-75% across industry (targeted: 100%)
- AI-assisted procedure generation reduces first-draft effort by 60-70% vs. manual writing

## Step-by-Step Execution

### Phase 1: Source Document Analysis (Steps 1-4)

**Step 1: Ingest and Parse P&IDs**
- Import P&IDs for the target system/unit
- Extract key elements using P&ID parsing:
  - Equipment items (tag numbers, types, sizes)
  - Instruments (tag numbers, types, functions, setpoints if shown)
  - Control valves (tag numbers, fail positions, service)
  - Safety devices (PSVs, rupture discs, flame arrestors)
  - Piping (line numbers, sizes, specifications, flow directions)
  - Interlocks (trip functions shown on P&ID)
  - Utility connections (steam, CW, IA, N2)
- Map system boundaries: identify battery limits, incoming/outgoing streams
- Identify operating sequence implied by P&ID (flow path from inlet to outlet)

**Step 2: Parse Control Narrative**
- Extract DCS/PLC control logic:
  - Startup sequence steps (what happens in what order)
  - Shutdown sequence (normal and emergency)
  - Control loops (PID controllers, cascades, ratio controls)
  - Interlock logic (cause-effect relationships)
  - Alarm setpoints and priorities
  - Permissive conditions (what must be true before an action is allowed)
  - Timer sequences (hold times, ramp rates, delays)
- Build operational state machine:
  - States: Idle/Ready/Starting/Running/Stopping/Emergency/Maintenance
  - Transitions: What triggers movement between states
  - Conditions: What must be true in each state

**Step 3: Extract Vendor Information**
- Parse vendor O&M manuals for:
  - Equipment operating limits (min/max temperature, pressure, speed, flow)
  - Startup/shutdown procedures specific to equipment (e.g., pump priming, compressor loading)
  - Lubrication and cooling requirements during operation
  - Alarm and trip conditions specific to equipment
  - Prohibited operations (e.g., "do not dead-head pump", "minimum flow required")
  - Maintenance-in-operation requirements (e.g., bearing temperature monitoring)
- Cross-reference vendor limits with process design parameters:
  - If process operating range exceeds vendor equipment limits, flag as design issue
  - If vendor recommends operating practices not reflected in control narrative, flag for integration

**Step 4: Analyze Safety Information**
- Extract from HAZOP study:
  - Identified hazards relevant to the operating procedures
  - Recommended safeguards that must be referenced in procedures
  - Specific scenarios requiring dedicated EOPs
  - Human factor recommendations (operator actions identified as safeguards)
- Extract from cause-and-effect diagrams:
  - Complete interlock logic tables
  - Trip setpoints and actions
  - Alarm priorities and expected operator responses
- Map safety interlocks to procedure steps where they are relevant

### Phase 2: Procedure Drafting (Steps 5-8)

**Step 5: Define Procedure Scope & Structure**
- Determine which procedures are needed for this system:
  - One SOP per major unit operation (e.g., SOP for Grinding Circuit, SOP for Flotation Cell Bank)
  - One EOP per identified emergency scenario (e.g., EOP for Loss of Cooling Water, EOP for High Pressure Trip)
  - SWPs for maintenance-related operations (e.g., Line Breaking in HF service, Confined Space Entry for Vessel Inspection)
- Create procedure numbering scheme aligned with project convention
- Define procedure boundaries (which equipment/operations each procedure covers)
- Identify cross-references between procedures

**Step 6: Generate Startup Procedure**
- Build startup sequence from control narrative and P&ID:
  1. Pre-startup checks (equipment status, utility availability, permit status)
  2. Utility line-up (establish cooling water, steam, instrument air, nitrogen)
  3. System line-up (open/close valves to establish flow path)
  4. Equipment preparation (prime pumps, pre-lube bearings, energize motors)
  5. Controlled startup (follow DCS startup sequence)
  6. Parameter stabilization (monitor and adjust to reach steady state)
  7. Handover to automatic control (transfer loops from manual to auto)
- For each step:
  - Identify the specific action (OPEN valve XV-100, START pump 100-PP-001A)
  - Identify who performs it (Board Operator, Field Operator)
  - Identify where it is performed (DCS Console, Field - Level 3 Pump Area)
  - Identify expected response (Flow indication FI-100 shows 250 m3/h)
  - Identify verification (Check pressure PI-101 is within 8.5-10.0 barg)
  - Identify cautions/warnings from HAZOP and vendor manuals
  - Identify time constraints (wait 5 minutes for pump to reach operating temperature)

**Step 7: Generate Normal Operations & Shutdown Procedures**
- Normal operations section:
  - Steady-state monitoring parameters and frequencies
  - Routine adjustments and their triggers
  - Sample collection points and frequencies
  - Log sheet requirements
  - Shift handover requirements
  - Operator rounds checklist
- Normal shutdown procedure:
  - Reverse of startup in appropriate sequence
  - Equipment cooldown/depressurization requirements
  - Draining and purging requirements
  - Isolation and lockout requirements
  - Post-shutdown checks and preservation
- Emergency shutdown:
  - Clear, concise steps (maximum 10 steps for immediate actions)
  - Decision tree format for rapid response
  - Immediate actions vs. follow-up actions
  - Communication requirements (who to notify, emergency numbers)
  - Recovery procedure reference (how to restart after ESD)

**Step 8: Generate Abnormal Situation Procedures**
- For each identified abnormal condition (from HAZOP, alarm rationalization):
  - Symptoms: What the operator will see/hear/observe
  - Probable causes: Most likely causes ranked by probability
  - Immediate actions: What to do RIGHT NOW
  - Diagnostic steps: How to determine root cause
  - Corrective actions: How to resolve each probable cause
  - Escalation criteria: When to escalate to supervisor/emergency response
- Format as symptom-cause-action tables for rapid reference
- Cross-reference to relevant EOPs for serious events

### Phase 3: Quality Assurance & Finalization (Steps 9-12)

**Step 9: Regulatory Compliance Check**
- Verify all OSHA 29 CFR 1910.119(f) required elements are present:
  - [ ] Steps for each operating phase (startup, normal, temporary, emergency, shutdown)
  - [ ] Operating limits and consequences of deviation
  - [ ] Safety and health considerations (hazards, PPE, exposure limits)
  - [ ] Safety systems and their functions
  - [ ] Quality control for products (if applicable)
- Check for Chilean regulatory compliance (DS 594, DS 132 requirements)
- Verify all HAZOP safeguard references are incorporated
- Confirm SIL/SIF requirements are reflected in procedures

**Step 10: Readability & Usability Review**
- Calculate Flesch-Kincaid readability score (target: Grade 8-10)
- Review for single-action-per-step compliance
- Verify all conditional steps use IF-THEN-ELSE format
- Check for ambiguous language (e.g., "approximately", "as needed", "periodically" -- replace with specific values)
- Verify consistent use of controlled vocabulary (same action always uses same verb)
- Check procedure length: SOPs should be <50 pages; EOPs should be <10 pages
- Validate all tag numbers reference actual equipment (cross-check against P&ID)

**Step 11: Bilingual Generation**
- Generate Spanish language version maintaining:
  - Identical procedure structure and step numbering
  - Technical terminology consistency (use controlled vocabulary list)
  - Same tag numbers (do not translate tag numbers)
  - Culturally appropriate safety warnings
  - Compliance with Chilean regulatory terminology requirements
- Cross-validate that English and Spanish versions are technically identical

**Step 12: Final Assembly & Publication**
- Assemble final procedure document with all sections
- Apply corporate formatting template
- Generate procedure matrix listing all procedures created, status, and gaps
- Upload to SharePoint document library (via mcp-sharepoint) with metadata:
  - Procedure number, title, revision, status
  - System/area, equipment tags covered
  - Author, review date, next review date
  - Classification: SOP/EOP/SWP/MOP
- Notify stakeholders of new procedures available for review (via mcp-outlook)
- Flag gaps requiring additional source information or SME input

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| OSHA 29 CFR 1910.119(f) compliance (all required elements present) | 100% | 100% (regulatory requirement) |
| Flesch-Kincaid readability grade level | 8-10 | 8-12 |
| Single action per step compliance | 100% | >95% |
| Tag number accuracy (all tags exist on P&ID) | 100% | >99% |
| Operating parameter accuracy (values match source documents) | 100% | >99% |
| Safety interlock coverage (all interlocks referenced in relevant steps) | 100% | >98% |
| HAZOP recommendation integration | >95% | >90% |
| Bilingual consistency (EN-ES technical equivalence) | 100% | >98% |
| Procedure coverage (% of systems with complete SOP set) | 100% | >90% |
| SME technical review approval rate | >90% | >85% |

### Qualitative Standards

- **Operator Usability**: A qualified operator unfamiliar with the specific plant must be able to execute the procedure safely using only the written instructions plus standard training.
- **Verifiability**: Every step must have a verifiable completion criterion. The operator must know when a step is "done."
- **Safety First**: Safety information must be presented BEFORE the step it applies to, never after. Operators should never encounter a hazard before being warned.
- **Consistency**: Identical operations across different procedures must use identical wording. A valve opening procedure should read the same whether in the startup or shutdown section.
- **Maintainability**: Procedures must be structured so that changes to one section do not require changes to unrelated sections. Operating parameters should be in tables (easy to update) rather than embedded in step text.

### Validation Process
1. Automated compliance check against OSHA 29 CFR 1910.119(f) checklist
2. Readability analysis (Flesch-Kincaid scoring)
3. Tag number cross-validation against P&ID tag list
4. Operating parameter cross-validation against control narrative and equipment data sheets
5. Safety interlock coverage verification against cause-and-effect diagrams
6. Peer review by operations SME (experienced operator or operations engineer)
7. Final review by PSM compliance officer

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-vendor-documentation` (DOC-01) | Vendor O&M manuals | Provides approved vendor operating and maintenance manuals as source material |
| `create-asset-register` | Equipment list & tag numbers | Provides validated equipment tag numbers and descriptions for procedure cross-referencing |
| `create-risk-assessment` | HAZOP study results | Provides identified hazards, safeguards, and recommendations for integration into procedures |
| Agent 1 - Project Management | P&IDs and control narratives | Provides engineering source documents at correct revision |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `prepare-pssr-package` (DOC-04) | Completed SOPs/EOPs | Operating procedures are a mandatory PSSR checklist item; must be complete before startup |
| `create-training-plan` | Training source material | Generated SOPs serve as basis for operator training programs and competency assessments |
| `track-document-currency` (DOC-03) | Procedure register | Register of all procedures for ongoing currency tracking and annual review scheduling |
| `manage-moc-workflow` (DOC-05) | Procedure impact assessment | When a MOC is initiated, affected procedures must be identified and updated |
| Agent 5 - Maintenance | Maintenance Operating Procedures | MOPs for equipment isolation, draining, and purging support maintenance activities |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-commissioning-plan` | Commissioning procedures | Operating procedures may reference or be referenced by commissioning procedures for system turnover |
| `create-operations-manual` | Operations manual integration | Generated SOPs are incorporated into the plant operations manual |

## MCP Integrations

### mcp-sharepoint
- **Read**: Retrieve P&IDs, control narratives, HAZOP reports, and vendor manuals from project document libraries; access procedure templates from template library
- **Write**: Upload generated procedures to controlled document library with metadata tags; update procedure register/matrix; publish procedure status dashboards
- **Workflow**: Initiate procedure review and approval workflows in SharePoint; track review status and approvals; manage document version control

### mcp-onedrive
- **Read**: Access working drafts and SME review comments stored in personal/team OneDrive folders
- **Write**: Store draft procedures in working folders for collaborative editing; share review copies with external SMEs
- **Sync**: Synchronize procedure drafts between local editing and cloud storage

### mcp-outlook
- **Send**: Distribute procedures for review to assigned reviewers; notify operations team of new/updated procedures; send reminders for overdue reviews
- **Read**: Receive review comments and approval responses from reviewers via email
- **Calendar**: Schedule procedure review meetings; set reminders for annual procedure review deadlines

## Templates & References

### Templates
- `templates/sop_template.docx` - Standard Operating Procedure template with all required sections
- `templates/eop_template.docx` - Emergency Operating Procedure template (condensed format)
- `templates/swp_template.docx` - Safe Work Procedure template
- `templates/procedure_matrix_template.xlsx` - Procedure tracking matrix template
- `templates/operator_checklist_template.xlsx` - Pre-startup checklist template
- `templates/troubleshooting_table_template.docx` - Symptom-cause-action table template

### Reference Documents
- OSHA 29 CFR 1910.119(f) - Operating Procedures
- CCPS "Guidelines for Writing Effective Operating and Maintenance Procedures"
- DOE-STD-1029 - Writer's Guide for Technical Procedures
- ISA-5.1-2022 - Instrumentation Symbols and Identification
- IEC 62682 - Management of Alarm Systems
- DS 594 (Chile) - Condiciones Sanitarias y Ambientales en Lugares de Trabajo
- Company-specific procedure writing guide (if available)

### Reference Datasets
- Controlled vocabulary list (English-Spanish) for technical terminology
- Standard action verb list for procedure steps
- PPE specification database by hazard type
- Alarm setpoint reference database
- Emergency contact number templates

## Examples

### Example SOP Startup Procedure Step Sequence

```
STANDARD OPERATING PROCEDURE
SOP-100-001: Slurry Pump System - 100-PP-001A/B
Section 5.1: Normal Startup Procedure

PREREQUISITES:
  [ ] PSSR completed and approved for System 100
  [ ] Electrical isolation removed; motor ready for service (MCC confirmed)
  [ ] Cooling water available to seal flush system (CW header > 3.0 barg)
  [ ] Instrument air available (IA header > 6.0 barg)
  [ ] DCS communications confirmed (all I/O healthy, no bad PV signals)
  [ ] Suction tank 100-TK-001 level > 30% (LI-100-001 reading)
  [ ] PPE: Hard hat, safety glasses, hearing protection, steel-toe boots
  [ ] Permit: None required for normal startup

STARTUP SEQUENCE:

Step 5.1.1: VERIFY pump suction valve XV-100-001 is in CLOSED position.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Valve position indicator shows CLOSED
            Verification: DCS indication ZSC-100-001 shows CLOSED (green)

Step 5.1.2: VERIFY pump discharge valve XV-100-002 is in CLOSED position.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Valve position indicator shows CLOSED
            Verification: DCS indication ZSC-100-002 shows CLOSED (green)

Step 5.1.3: OPEN seal flush water supply valve HV-100-010 to pump mechanical seal.
            Performed by: Field Operator
            Location: Pump Area - Level 100, Grid C-3
            Expected Response: Seal flush flow confirmed on FI-100-010 (>2 L/min)
            CAUTION: Do not start pump without seal flush flow confirmed.
                     Running dry will damage mechanical seal within 30 seconds.
            Verification: FI-100-010 reads > 2 L/min on DCS

Step 5.1.4: OPEN pump suction valve XV-100-001 to FULL OPEN position.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Overview Screen
            Expected Response: Valve travels to OPEN in < 30 seconds
            Verification: ZSO-100-001 shows OPEN; suction pressure PI-100-001
                         reads 0.5-1.5 barg
            NOTE: Allow 60 seconds for pump casing to fill before proceeding.
                  Verify no unusual noise from pump casing (cavitation indication).

Step 5.1.5: START pump 100-PP-001A motor from DCS.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: Motor starts; current II-100-001 peaks then settles
                              to 60-80% FLA within 10 seconds
            CAUTION: IF motor current does not settle below 90% FLA within 15
                     seconds, STOP pump immediately and investigate.
            WARNING: Ensure no personnel are near rotating equipment before starting.
                     Verify guard is in place on coupling.
            Verification: Motor running indication HS-100-001 shows RUN (green)
                         Motor current II-100-001 reads 60-80% FLA

Step 5.1.6: OPEN discharge valve XV-100-002 SLOWLY over 60 seconds.
            Performed by: Board Operator (DCS command)
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: Discharge pressure PI-100-002 develops 8.5-10.0 barg
                              Flow FI-100-002 increases to 200-300 m3/h
            CAUTION: Do not open discharge valve fully in one step.
                     Rapid valve opening causes water hammer and pressure surge.
            IF discharge pressure > 11.0 barg THEN STOP pump and investigate.
            IF flow < 150 m3/h with valve fully open THEN check suction conditions.
            Verification: PI-100-002 reads 8.5-10.0 barg
                         FI-100-002 reads 200-300 m3/h

Step 5.1.7: VERIFY all operating parameters are within normal range.
            Performed by: Board Operator
            Location: DCS Console - Area 100 Pump Detail Screen
            Expected Response: All parameters GREEN on DCS overview
            Parameters to verify:
              Suction pressure PI-100-001:     0.5 - 1.5 barg
              Discharge pressure PI-100-002:   8.5 - 10.0 barg
              Flow FI-100-002:                 200 - 300 m3/h
              Motor current II-100-001:        60 - 80% FLA
              Bearing temp DE TI-100-003:      < 80 deg C
              Bearing temp NDE TI-100-004:     < 80 deg C
              Seal flush flow FI-100-010:      > 2 L/min
              Vibration VI-100-001:            < 7.1 mm/s RMS
            NOTIFY Shift Supervisor that pump 100-PP-001A is in service.

Step 5.1.8: TRANSFER flow control loop FIC-100-002 from MANUAL to AUTO.
            Performed by: Board Operator
            Location: DCS Console - Area 100 Control Loop Screen
            Expected Response: Control valve FV-100-002 modulates to maintain
                              setpoint; flow stabilizes at 250 m3/h +/- 5%
            NOTE: Monitor loop for 10 minutes after transfer. If loop oscillates,
                  return to MANUAL and notify Process Engineer for tuning.
            Verification: FIC-100-002 in AUTO mode; PV tracks SP within +/- 5%

STARTUP COMPLETE - Record time and parameters in shift log.
```

### Example Abnormal Situation Table

```
SECTION 7: ABNORMAL SITUATIONS - SLURRY PUMP 100-PP-001A/B

| # | Symptom | Probable Cause | Immediate Action | Corrective Action |
|---|---------|---------------|-----------------|-------------------|
| 1 | High discharge pressure (PI-100-002 > 11.0 barg), alarm PAH-100-002 | Blocked discharge line | REDUCE pump speed or THROTTLE discharge | Investigate blockage; flush line if safe |
|   | | Closed downstream valve | CHECK downstream valve positions | OPEN downstream valve |
|   | | Product viscosity increase | CHECK process conditions | ADJUST process parameters |
| 2 | Low suction pressure (PI-100-001 < 0.3 barg), alarm PAL-100-001 | Low suction tank level | CHECK LI-100-001 level | INCREASE feed to suction tank |
|   | | Blocked suction strainer | STOP pump; CHECK DP across strainer | CLEAN strainer per MOP-100-003 |
|   | | Suction line air entrainment | REDUCE pump speed | VENT pump casing; check suction line integrity |
| 3 | High vibration (VI-100-001 > 7.1 mm/s), alarm VAH-100-001 | Cavitation | REDUCE flow rate; CHECK NPSH | Investigate suction conditions |
|   | | Bearing wear/damage | PREPARE standby pump | SWITCH to standby; schedule bearing replacement |
|   | | Misalignment | MONITOR trend | Schedule alignment check at next shutdown |
|   | | Impeller damage/imbalance | STOP pump if > 11.0 mm/s | Inspect impeller; replace if damaged |
| 4 | High bearing temperature (TI-100-003 > 80C), alarm TAH-100-003 | Lubrication failure | CHECK oil level/grease condition | REPLENISH lubrication per vendor manual |
|   | | Bearing wear | STOP pump if > 95C (TRIP at 100C) | Replace bearing per MOP-100-005 |
|   | | Cooling system failure | CHECK cooling water flow | RESTORE cooling water supply |

IF any TRIP condition is reached, pump will auto-stop via safety interlock.
REFER TO EOP-100-001 for pump trip recovery procedure.
```
