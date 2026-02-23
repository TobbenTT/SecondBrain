# Create OR Framework
## Skill ID: A-OR-FRAMEWORK-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P0 - Foundational

## Purpose

Design and document the Operational Readiness (OR) governance framework that defines stage-gates, RACI matrices, governance structures, and Key Performance Indicators (KPIs) for a project's transition from engineering through commissioning to sustained operations. The OR Framework establishes the "rules of the game" -- who makes decisions, when critical checkpoints occur, what must be achieved at each gate, and how readiness is measured and reported.

The OR Framework is the governance backbone of the OR program. While the OR Playbook provides the "what and how" (methodology and activities), the Framework provides the "who, when, and how well" (governance, gates, and metrics). Without a robust framework, OR activities lack accountability, milestones become arbitrary, and the transition from project to operations is poorly controlled. This skill ensures that OR governance is structured, measurable, and aligned with the project's management system.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **Stage-Gate Design**: Define a series of OR-specific stage-gates aligned with project phases. Each gate must have:
   - Clear entry criteria (what must be in place to start the phase)
   - Gate deliverables (what must be presented at the gate review)
   - Pass/fail criteria (quantitative thresholds for gate approval)
   - Gate review process (who reviews, how decisions are made)
   - Conditional pass provisions (what conditions allow proceeding with outstanding items)

2. **RACI Matrix**: Develop a comprehensive RACI (Responsible, Accountable, Consulted, Informed) matrix that covers all OR processes, deliverables, and decisions across all stakeholder groups (Owner, EPC, Vendors, Operations, OR Team, Management).

3. **Governance Structure**: Define the OR governance hierarchy including:
   - OR Steering Committee (strategic oversight)
   - OR Working Groups (domain-specific execution)
   - Reporting lines and escalation paths
   - Decision rights and authority levels
   - Meeting cadences and forums

4. **KPI Framework**: Establish a balanced set of KPIs that measure:
   - OR readiness progress (leading indicators)
   - OR performance outcomes (lagging indicators)
   - Deliverable completion rates
   - Gate compliance scores
   - Resource utilization and budget adherence

5. **Integration with Project Governance**: The OR Framework must integrate with (not duplicate) the existing project management framework, PMO governance, and client management system.

## Trigger / Invocation

```
/create-or-framework
```

**Aliases**: `/or-framework`, `/framework-or`, `/or-governance`

**Trigger Conditions**:
- New project requires OR governance structure
- User requests stage-gate definition or RACI development
- OR program needs governance redesign or update
- OR Playbook development requires framework foundation
- Client requests OR governance assessment or improvement

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Project Type & Context | .docx, text | Project type (greenfield/brownfield/expansion), industry sector, scale, complexity, owner/operator model |
| Organization Structure | .docx, .pdf, text | Organizational structure: owner team, EPC contractor, EPCM model, operations team (existing or planned), key stakeholder groups |
| Project Timeline | .xlsx, .mpp, text | Master project schedule with major phase dates: FEL stages, detailed engineering, construction, commissioning, startup, commercial operation |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Client Governance Standards | .docx, .pdf | Client's existing project governance framework, management system, decision authority matrix |
| OR Playbook | .docx | From `create-or-playbook` -- if available, ensures framework-playbook alignment |
| Project Execution Plan (PEP) | .docx, .pdf | Overall project execution strategy and governance |
| Stakeholder Analysis | .xlsx | Key stakeholders, their roles, influence, and OR-related interests |
| OR Maturity Assessment | .xlsx | Current OR maturity level for calibrating gate criteria |
| Previous OR Framework | .docx, .xlsx | Reference frameworks from similar projects |
| Regulatory Timeline | .xlsx | Key regulatory milestones that constrain OR gates |
| Budget Structure | .xlsx | Project budget structure for OR cost tracking alignment |

### Input Validation Rules

- Project timeline must include at least 4 identifiable phases for meaningful stage-gate design
- Organization structure must identify at minimum: project owner, EPC/EPCM contractor, and operations entity
- Projects without a defined timeline receive a generic phase-based framework with placeholder dates
- If OR Playbook exists, framework must reference and align with its management area structure

## Output Specification

### Primary Output 1: OR Framework Document (.docx)

**Filename**: `{ProjectCode}_OR_Framework_v{version}_{date}.docx`

**Document Structure (30-50 pages)**:

**1. Executive Summary** (2-3 pages)
- Framework purpose and scope
- Governance model overview
- Stage-gate summary
- Key roles and responsibilities

**2. Introduction** (2-3 pages)
- OR Framework objectives
- Relationship to project governance
- Relationship to OR Playbook
- Framework ownership and maintenance
- Glossary of governance terms

**3. OR Governance Model** (5-7 pages)

3.1 Governance Hierarchy
- OR Steering Committee: composition, charter, authority, meeting frequency
- OR Program Manager: role, authority, reporting lines
- OR Working Groups: per management area, composition, meeting frequency
- Integration with PMO and project governance
- Governance organization chart

3.2 Decision Rights & Authority Matrix
- Strategic decisions (Steering Committee level)
- Tactical decisions (Program Manager level)
- Operational decisions (Working Group level)
- Escalation process and thresholds
- Decision authority matrix table

3.3 Meeting Cadence & Forums

| Forum | Frequency | Chair | Attendees | Purpose |
|-------|-----------|-------|-----------|---------|
| OR Steering Committee | Monthly | Project Director | Senior mgmt, OR Lead | Strategic oversight, gate decisions |
| OR Core Team Meeting | Bi-weekly | OR Program Manager | OR domain leads | Progress tracking, issue resolution |
| OR Working Group (per domain) | Weekly | Domain Lead | Domain team members | Activity execution, deliverable review |
| OR-EPC Interface Meeting | Bi-weekly | OR PM + EPC PM | Interface managers | Coordination, handover planning |
| OR Readiness Review | Per gate | OR PM | All stakeholders | Gate review and readiness assessment |

3.4 Reporting Structure
- Weekly OR status report (content, audience, format)
- Monthly OR dashboard (content, audience, format)
- Gate review report (content, audience, format)
- Escalation reports (triggers, format, recipients)

3.5 Communication Plan
- Internal OR communications
- Stakeholder communications
- Change communication protocols

**4. Stage-Gate Framework** (8-12 pages)

4.1 Stage-Gate Overview
- Number of gates and their alignment with project phases
- Gate philosophy: purpose of gates, not just checkpoints
- Relationship between project gates and OR gates
- Visual timeline showing gate positions

4.2 Gate Definitions (for each gate):

**Gate 0: OR Initiation**
- Phase: End of Conceptual / Start of Feasibility
- Purpose: Confirm OR program scope, governance, and resourcing
- Entry Criteria:
  - Project scope defined and approved
  - OR budget allocated
  - OR Program Manager appointed
- Gate Deliverables:
  - OR Framework (this document) approved
  - OR Playbook outline developed
  - OR risk register initiated
  - OR team structure defined
- Pass Criteria:
  - All deliverables submitted and reviewed
  - OR Steering Committee endorsed
  - Budget confirmed for next phase
- Gate Decision Options: Pass / Conditional Pass / Hold / Fail

**Gate 1: OR Strategy Confirmed**
- Phase: End of Feasibility / Start of Basic Engineering
- Purpose: Confirm OR strategies across all management areas
- [Similar structure with specific criteria]

**Gate 2: OR Plans Developed**
- Phase: End of Basic Engineering / Start of Detailed Engineering
- Purpose: Confirm detailed OR plans are developed for implementation
- [Similar structure]

**Gate 3: OR Preparation Complete**
- Phase: End of Detailed Engineering / Start of Construction
- Purpose: Confirm OR preparations are sufficient to support construction-phase activities
- [Similar structure]

**Gate 4: OR Ready for Commissioning**
- Phase: End of Construction / Start of Commissioning
- Purpose: Confirm all OR systems, people, and processes are ready to support commissioning
- [Similar structure -- this is typically the most critical gate]

**Gate 5: OR Ready for Operations**
- Phase: End of Commissioning / Commercial Operation Declaration
- Purpose: Confirm the operation is ready for sustained commercial production
- [Similar structure]

**Gate 6: OR Steady State Achieved**
- Phase: 6-12 months post-startup
- Purpose: Confirm the operation has achieved steady-state performance targets
- [Similar structure]

4.3 Gate Review Process
- Gate review preparation (timeline, responsibilities, document submission)
- Gate review meeting format and agenda
- Gate decision criteria and scoring methodology
- Gate decision documentation
- Conditional pass management (tracking conditions, deadlines, escalation)
- Failed gate remediation process

4.4 Gate Readiness Assessment Methodology
- Scoring criteria per management area (1-5 scale)
- Minimum thresholds per area and overall
- Red/Amber/Green status definitions
- Readiness assessment template reference

**5. RACI Matrix** (6-8 pages)

5.1 RACI Principles
- Definitions: Responsible, Accountable, Consulted, Informed
- Rules: One "A" per row, "R" can have multiple, etc.
- How to read and use the RACI matrix
- RACI maintenance and update process

5.2 Stakeholder Roles for RACI
Define each stakeholder group used in the RACI:
- Project Owner / Client
- Project Director
- OR Program Manager
- OR Domain Leads (per management area)
- EPC Project Manager
- EPC Engineering Manager
- Construction Manager
- Commissioning Manager
- Operations Manager
- Maintenance Manager
- HSE Manager
- Supply Chain Manager
- IT/OT Manager
- HR/Training Manager
- Finance/Commercial Manager
- Vendor/OEM Representatives

5.3 RACI Matrices
Detailed RACI tables organized by:
- OR management processes (9 areas)
- Gate deliverables (per gate)
- Key decisions (strategic, tactical)
- Handover activities

5.4 Interface Management
- Owner-EPC interface RACI
- Project-Operations interface RACI
- EPC-Vendor interface RACI
- Construction-Commissioning interface RACI

**6. KPI Framework** (5-7 pages)

6.1 KPI Philosophy
- Balanced scorecard approach for OR
- Leading vs. lagging indicators
- KPI ownership and accountability
- Measurement frequency and data sources

6.2 OR Readiness KPIs (Leading Indicators)

| KPI | Description | Target | Measurement | Frequency |
|-----|-------------|--------|-------------|-----------|
| Deliverable Completion Rate | % of planned deliverables completed vs. due | >90% | Deliverables tracker | Monthly |
| Gate Readiness Score | Average readiness score across management areas | >3.5/5 | Readiness assessment | Per gate |
| Staffing Fill Rate | % of OR/Operations positions filled vs. plan | >80% by Gate 4 | HR tracker | Monthly |
| Training Completion Rate | % of required training modules completed | >90% by Gate 5 | Training tracker | Monthly |
| Procedure Completion Rate | % of required SOPs/procedures approved | >95% by Gate 5 | Procedure tracker | Monthly |
| CMMS Readiness | % of CMMS configuration and data loading complete | 100% by Gate 4 | CMMS project tracker | Monthly |
| Spare Parts Procurement | % of initial spare parts received | >95% by Gate 4 | Procurement tracker | Monthly |
| Regulatory Compliance | % of required permits/licenses obtained | 100% by Gate 5 | Compliance register | Monthly |

6.3 OR Performance KPIs (Lagging Indicators -- Post-Startup)

| KPI | Description | Target | Measurement | Frequency |
|-----|-------------|--------|-------------|-----------|
| Ramp-Up Achievement | Actual production vs. ramp-up curve target | >90% of target | Production data | Weekly |
| Equipment Availability | Overall equipment availability | >90% | CMMS data | Weekly |
| Safety Performance | TRIR (Total Recordable Incident Rate) | <1.0 | Safety reporting | Monthly |
| PM Schedule Compliance | % of scheduled PMs completed on time | >85% | CMMS data | Monthly |
| Startup Incident Count | Number of startup-related incidents/events | Trending down | Incident reports | Monthly |
| Unplanned Downtime | Hours of unplanned downtime per month | <target hrs | Production data | Monthly |
| Budget Compliance | OR program actual spend vs. budget | Within +10% | Financial reports | Monthly |

6.4 KPI Dashboard Design
- Dashboard layout and visualization
- Data sources and integration
- Reporting frequency and distribution
- Escalation thresholds (Red/Amber/Green)

6.5 Performance Review Process
- Monthly performance review meetings
- Quarterly trend analysis
- Gate-specific performance reporting
- Annual OR program effectiveness review

**7. Risk Governance** (3-4 pages)
- OR risk management approach
- Risk register ownership and maintenance
- Risk review frequency and forums
- Risk escalation criteria
- Integration with project risk management

**8. Change Management** (3-4 pages)
- OR scope change management process
- Gate criteria change management
- RACI change management
- Framework version control and updates
- Impact assessment process for changes

**9. Appendices**
- Appendix A: Detailed RACI Matrices (full tables)
- Appendix B: Gate Deliverables Checklists (per gate)
- Appendix C: Gate Readiness Assessment Templates
- Appendix D: KPI Measurement Definitions
- Appendix E: Reporting Templates
- Appendix F: Glossary

### Primary Output 2: Framework Workbook (.xlsx)

**Filename**: `{ProjectCode}_OR_Framework_Workbook_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Stage-Gate Summary"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Gate_Number | Gate identifier (0-6) |
| B | Gate_Name | Gate name |
| C | Project_Phase_End | Which project phase this gate concludes |
| D | Target_Date | Target gate review date |
| E | Entry_Criteria | List of entry criteria |
| F | Key_Deliverables | Required deliverables |
| G | Pass_Criteria | Quantitative pass thresholds |
| H | Gate_Chair | Who chairs the review |
| I | Decision_Authority | Who makes the gate decision |
| J | Status | Planned/Scheduled/Complete/Deferred |
| K | Actual_Date | Actual gate review date |
| L | Decision | Pass/Conditional/Hold/Fail |
| M | Conditions | Outstanding conditions (if conditional) |

#### Sheet 2: "RACI Matrix"
Full RACI matrix with:
- Rows: OR processes, deliverables, and decisions (200+ rows)
- Columns: All stakeholder roles (15+ columns)
- Cells: R, A, C, I, or blank
- Color coding: R=Blue, A=Red, C=Yellow, I=Green
- Filtering by management area, phase, stakeholder

#### Sheet 3: "KPI Register"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | KPI_ID | Unique KPI identifier |
| B | KPI_Name | KPI name |
| C | Management_Area | Which domain this KPI measures |
| D | KPI_Type | Leading / Lagging |
| E | Description | Detailed description |
| F | Formula | How to calculate |
| G | Data_Source | Where data comes from |
| H | Target_Value | Target value |
| I | Red_Threshold | Red threshold (unacceptable) |
| J | Amber_Threshold | Amber threshold (at risk) |
| K | Green_Threshold | Green threshold (on track) |
| L | Measurement_Frequency | How often measured |
| M | Owner | Who is accountable for this KPI |
| N | Reporting_Forum | Where this KPI is reported |

#### Sheet 4: "Gate Deliverables Checklist"
Per gate, a checklist of all required deliverables:
- Deliverable name, owner, status, score
- Organized by management area
- Overall gate readiness calculation

#### Sheet 5: "Governance Calendar"
Annual/project calendar showing:
- Gate review dates
- Steering Committee meetings
- Working Group meetings
- Reporting deadlines
- Readiness assessment dates
- Key milestones

#### Sheet 6: "Decision Authority Matrix"
Decision types mapped to authority levels:
- Decision description
- Decision category (Strategic/Tactical/Operational)
- Authority level (Steering Committee/Program Manager/Working Group)
- Escalation path
- Required inputs/approvals

### Formatting Standards
- Document: VSC corporate branding, professional formatting
- RACI cells: Bold single letter, color-coded backgrounds (R=Light Blue, A=Light Red, C=Light Yellow, I=Light Green)
- Gate diagrams: Chevron/arrow process flow with gate diamonds
- KPI dashboards: Gauge/traffic light visualizations
- Header row: Bold, dark blue background (#003366), white font
- Conditional formatting for status fields (Green/Amber/Red)

## Methodology & Standards

### Primary Standards
- **PMI PMBOK 7th Edition** - Project management framework (governance, stakeholders, schedule management)
- **ISO 21500:2021** - Guidance on project management (governance principles)
- **PRINCE2** - Structured project management methodology (stage-gate concepts)
- **ISO 55001:2014** - Asset management system requirements (governance for asset lifecycle)

### Governance Frameworks
- **COBIT** - Framework for IT/OT governance (Technology domain governance)
- **COSO ERM** - Enterprise risk management framework (risk governance)
- **King IV** - Corporate governance principles (applicable to governance structure design)

### OR-Specific Frameworks
- **CII RT-233** - Comprehensive framework for operational readiness (gate criteria research)
- **IPA (Independent Project Analysis)** - Benchmarking data for OR readiness metrics and gate effectiveness
- **AACE International** - Recommended practices for project governance and controls

### RACI Standards
- **RACI Model** (Smith & Erwin, 2005) - Standard RACI methodology
- **RASCI Variant** - Extended model with Supportive role (used when needed)
- **DACI Variant** - Driver, Approver, Contributor, Informed (alternative for decision-focused matrices)

### KPI Standards
- **ISO 55002** - Asset management guidance (KPI development for asset management)
- **EN 15341** - Maintenance KPIs (maintenance-specific metrics)
- **SMRP Best Practices** - Maintenance and reliability metrics
- **Balanced Scorecard** (Kaplan & Norton) - Balanced KPI framework methodology

### Chilean Standards
- **NCh-ISO 9001** - Quality management systems (governance requirements)
- **NCh-ISO 14001** - Environmental management (environmental governance)
- **Ley de Sociedades Anonimas** - Corporate governance requirements (for governance structure)

## Step-by-Step Execution

### Phase 1: Context Analysis (Steps 1-2)

**Step 1: Analyze Project Governance Context**
- Review project type, complexity, and organizational model
- Identify existing governance structures (PMO, project governance, client management system)
- Determine the OR Framework's position within the overall governance hierarchy
- Identify all stakeholder groups and their roles
- Assess decision-making culture (centralized vs. distributed)

**Step 2: Define Framework Parameters**
- Determine number of gates (typically 5-7 for greenfield, 3-5 for brownfield)
- Align gates with project phase transitions
- Identify key regulatory/compliance milestones that constrain gates
- Determine RACI stakeholder roles based on organizational structure
- Define KPI categories based on management areas in scope

### Phase 2: Governance Design (Steps 3-4)

**Step 3: Design Governance Structure**
- Define OR Steering Committee composition and charter
- Define OR Program Manager role and authority
- Design Working Group structure per management area
- Map reporting lines and escalation paths
- Define meeting cadences and forums
- Design decision authority matrix with delegation levels
- Create governance organization chart

**Step 4: Design Stage-Gates**
For each gate:
- Define gate purpose and alignment with project phase
- Develop entry criteria (what must exist to enter the gate review)
- Define gate deliverables organized by management area
- Set pass criteria with quantitative thresholds:
  - Per-area minimum scores
  - Overall minimum score
  - Mandatory deliverables (no exceptions)
  - Allowable conditions for conditional pass
- Define gate review process (preparation, review meeting, decision, documentation)
- Design conditional pass tracking mechanism
- Define remediation process for failed gates

### Phase 3: RACI & Accountability (Steps 5-6)

**Step 5: Develop RACI Matrix**
- List all OR processes and deliverables (from Playbook management areas or standard list)
- List all stakeholder roles
- Assign RACI designations applying these rules:
  - Each row has exactly one "A" (single point of accountability)
  - "R" may have multiple assignees but should be limited
  - "C" is used for subject matter experts whose input is needed
  - "I" is used for stakeholders who need to be kept informed
  - Every deliverable must have an R and an A
  - The same person/role can be both R and A
- Validate for conflicts (same role as both A and C is allowed but should be reviewed)
- Validate for gaps (no row without an A)

**Step 6: Define Interface Management**
- Map critical interfaces between stakeholder groups
- Define interface protocols:
  - Owner-EPC: Engineering data handover, vendor information, design changes
  - Project-Operations: Knowledge transfer, staffing transition, asset handover
  - EPC-Vendors: Technical data, commissioning support, warranty management
  - Construction-Commissioning: System turnover, simultaneous operations
- Assign interface owners and coordination mechanisms

### Phase 4: KPI & Measurement (Steps 7-8)

**Step 7: Develop KPI Framework**
- Define leading indicators (readiness progress metrics)
- Define lagging indicators (post-startup performance metrics)
- For each KPI, specify:
  - Definition and formula
  - Data source and collection method
  - Target value with Red/Amber/Green thresholds
  - Measurement frequency
  - KPI owner
  - Reporting forum
- Validate KPIs for:
  - Balance across management areas
  - Measurability (data is actually available)
  - Actionability (can drive improvement actions)
  - Non-redundancy (no duplicate metrics)

**Step 8: Design Reporting & Dashboard**
- Define weekly status report template
- Define monthly dashboard template with KPI visualizations
- Define gate review report template
- Design escalation report format and triggers
- Establish reporting cadence calendar
- Define data collection and reporting responsibilities

### Phase 5: Output Generation (Steps 9-10)

**Step 9: Generate Framework Document**
- Compile all governance elements into the document structure
- Create governance diagrams (org chart, gate process flow, escalation matrix)
- Include detailed RACI matrices
- Include KPI definitions and dashboard design
- Write executive summary
- Apply VSC formatting and branding

**Step 10: Generate Framework Workbook**
- Create Stage-Gate Summary sheet with all gate definitions
- Create full RACI Matrix with color coding and filtering
- Create KPI Register with all metrics and thresholds
- Create Gate Deliverables Checklist per gate
- Create Governance Calendar
- Create Decision Authority Matrix
- Apply formatting standards

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Gates defined with complete criteria | 100% | 100% |
| RACI rows with assigned Accountable | 100% | 100% |
| RACI rows with assigned Responsible | 100% | 100% |
| KPIs per management area | >3 per area | >2 per area |
| Gate deliverables coverage per management area | 100% of areas have deliverables at each relevant gate | >90% |
| Decision authority coverage | 100% of decision types mapped | >95% |
| Meeting cadence defined for all forums | 100% | 100% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Governance Clarity**: Any stakeholder should be able to answer "who decides this?" by consulting the framework. Ambiguity in decision rights is unacceptable.
- **Gate Rigor**: Gate criteria must be specific and measurable, not vague statements. "Maintenance strategy developed" is insufficient; "Maintenance strategy covering >90% of critical equipment, reviewed by Reliability Engineer, approved by Maintenance Manager" is the standard.
- **RACI Consistency**: The RACI must be internally consistent and aligned with the organizational structure. Roles not in the org chart cannot appear in the RACI.
- **KPI Measurability**: Every KPI must have a defined data source. KPIs without realistic data collection mechanisms are flagged and replaced.
- **Integration**: The OR Framework must reference and integrate with the project governance framework, not operate as a parallel or competing governance system.
- **Practicality**: The governance burden must be proportionate to the project size. Over-governance is as problematic as under-governance.

### Validation Process
1. Gate criteria completeness and specificity check
2. RACI integrity validation (one A per row, no gaps)
3. KPI measurability and data source validation
4. Governance structure consistency with org chart
5. Framework-Playbook alignment check (if both exist)
6. Stakeholder role completeness check
7. Final quality score calculation

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-or-playbook` | Management area definitions | If Playbook exists, Framework must align with its management area structure and deliverables |
| Document Ingestion Agent | Client governance docs | Parses client governance standards and project execution plans |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-or-playbook` | Governance structure | Framework provides governance model that Playbook must reflect |
| `create-commissioning-plan` | Gate criteria | Commissioning milestones must align with Framework gates |
| `create-rampup-plan` | Performance targets | Ramp-up KPIs must align with Framework KPI definitions |
| `create-kpi-dashboard` | KPI definitions | Framework KPIs feed directly into dashboard design |
| ALL other skills | RACI alignment | All deliverables produced by other skills have RACI assignments defined in the Framework |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-playbook` | Mutual alignment | Framework and Playbook are companion documents that must be fully consistent |

## Templates & References

### Templates
- `templates/or_framework_template.docx` - Framework document template with VSC branding
- `templates/or_framework_workbook_template.xlsx` - Workbook template with all sheets
- `templates/raci_matrix_template.xlsx` - RACI matrix template with standard roles and processes
- `templates/stage_gate_template.xlsx` - Stage-gate definition template
- `templates/kpi_register_template.xlsx` - KPI register template
- `templates/gate_review_report_template.docx` - Gate review report template

### Reference Documents
- PMI PMBOK 7th Edition - Project governance
- CII RT-233 - Operational Readiness framework
- IPA Benchmarking - OR gate effectiveness data
- VSC OR Governance Standard v3.0 (internal)
- VSC Stage-Gate Design Guide v2.0 (internal)

### Reference Frameworks
- Reference Framework: Large Copper Mine (7-gate model)
- Reference Framework: Lithium Processing Plant (5-gate model)
- Reference Framework: Desalination Plant (6-gate model)
- Reference Framework: Brownfield Expansion (4-gate model)

## Examples

### Example Stage-Gate Timeline

```
OR STAGE-GATE FRAMEWORK - PROJECT COPPER GREEN
================================================

PROJECT PHASES:
  Conceptual | Feasibility | Basic Eng. | Detail Eng. | Construction | Commissioning | Operations
  -----------|-------------|------------|-------------|--------------|---------------|------------>

OR GATES:
     G0          G1            G2            G3             G4              G5           G6
     |           |             |             |              |               |            |
  OR Init.   Strategy      Plans         Prep.         Ready for      Ready for    Steady
  Confirmed  Confirmed     Developed     Complete      Commission     Operations   State
  Q1-2025    Q3-2025       Q1-2026       Q3-2026       Q2-2027        Q4-2027      Q2-2028

GATE 4 DETAIL (Most Critical Gate):
  Entry Criteria:
    - Construction >85% complete
    - All commissioning systems defined
    - Operations team >80% staffed

  Gate Deliverables (by Management Area):
    [1] Org & People:     Operations org chart final, >80% positions filled, core training complete
    [2] Asset Management: Asset register 100% loaded in CMMS, PM schedules configured, spares >90% received
    [3] Operations:       >90% SOPs approved, shift roster confirmed, control room operational
    [4] HSE:              ERP approved and drilled, all safety systems tested, permits obtained
    [5] Supply Chain:     Warehouse operational, vendor contracts in place, consumables stocked
    [6] Technology:       CMMS live, ERP configured, IT/OT infrastructure operational
    [7] Regulatory:       All required permits/licenses obtained
    [8] Commissioning:    Commissioning plan approved, team mobilized, pre-comm checklists ready
    [9] Cont. Improvement: KPI dashboard configured, baseline data collection started

  Pass Criteria:
    - Overall readiness score: >= 3.5/5.0
    - No management area below 3.0/5.0
    - All mandatory deliverables submitted (no exceptions for items marked "mandatory")
    - Maximum 5 conditional items (must be resolved within 30 days)
```

### Example RACI Matrix (Excerpt)

```
RACI MATRIX - OR PROCESSES (Excerpt)
=====================================

Process / Deliverable          | ProjDir | OR PM | OpsMgr | MaintMgr | EPC PM | HSE Mgr | IT Mgr | HR Mgr |
-------------------------------|---------|-------|--------|----------|--------|---------|--------|--------|
OR Framework Development       |    A    |   R   |   C    |    C     |   C    |    I    |   I    |   I    |
OR Playbook Development        |    I    |   A   |   R    |    C     |   C    |    C    |   C    |   C    |
Gate Review - Decision         |    A    |   R   |   C    |    C     |   C    |    C    |   I    |   I    |
Asset Register Development     |    I    |   C   |   C    |    A     |   R    |    I    |   I    |   I    |
Maintenance Strategy           |    I    |   C   |   C    |    A     |   C    |    I    |   I    |   I    |
Spare Parts Strategy           |    I    |   C   |   I    |    A     |   C    |    I    |   I    |   I    |
SOP Development                |    I    |   C   |   A    |    C     |   R    |    C    |   I    |   I    |
HSE Management System          |    I    |   C   |   C    |    I     |   C    |    A    |   I    |   I    |
Emergency Response Plan        |    I    |   C   |   C    |    I     |   C    |    A    |   I    |   I    |
CMMS Implementation            |    I    |   C   |   C    |    R     |   C    |    I    |   A    |   I    |
Staffing Plan                  |    A    |   C   |   R    |    C     |   I    |    I    |   I    |   R    |
Training Program               |    I    |   C   |   C    |    C     |   I    |    C    |   I    |   A    |
Commissioning Plan             |    I    |   C   |   C    |    C     |   A    |    C    |   I    |   I    |
Performance KPI Dashboard      |    I    |   A   |   R    |    C     |   I    |    C    |   R    |   I    |

Legend: R=Responsible, A=Accountable, C=Consulted, I=Informed
```

### Example KPI Dashboard Design

```
OR KPI DASHBOARD - GATE 4 READINESS
=====================================

OVERALL READINESS: 3.7 / 5.0 [=======|   ] 74% -- AMBER (Target: 3.5 = PASS)

BY MANAGEMENT AREA:
  [1] Org & People:        3.5/5  [=======  ] AMBER  -- 12 positions still open
  [2] Asset Management:    4.2/5  [========= ] GREEN  -- On track
  [3] Operations:          3.3/5  [======   ] AMBER  -- SOP development behind
  [4] HSE:                 4.5/5  [========= ] GREEN  -- Strong performance
  [5] Supply Chain:        3.8/5  [========  ] GREEN  -- Warehouse fitout in progress
  [6] Technology:          4.0/5  [========  ] GREEN  -- CMMS UAT underway
  [7] Regulatory:          4.5/5  [========= ] GREEN  -- All permits on track
  [8] Commissioning:       3.2/5  [======   ] AMBER  -- Team mobilization delayed
  [9] Cont. Improvement:   2.5/5  [=====    ] RED    -- KPI framework not started

LEADING INDICATORS:
  Deliverable Completion:  78% (Target: >85%)     AMBER
  Staffing Fill Rate:      72% (Target: >80%)     AMBER
  Training Completion:     65% (Target: >75%)     AMBER
  CMMS Configuration:      88% (Target: >90%)     GREEN
  Spare Parts Received:    91% (Target: >90%)     GREEN
  Procedures Approved:     62% (Target: >80%)     RED

TOP 3 RISKS:
  1. Operations staffing gap may delay SOP validation (Impact: Gate 4 delay)
  2. CI domain significantly behind - no KPI framework (Impact: Gate 5 readiness)
  3. Commissioning team mobilization 4 weeks behind plan (Impact: Critical path)
```
