# Create OR Playbook
## Skill ID: A-OR-PLAYBOOK-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P0 - Foundational

## Purpose

Generate a comprehensive Operational Readiness (OR) Playbook that serves as the master reference document for a specific project's OR program. The OR Playbook is VSC's proprietary methodology document that articulates the complete OR strategy, covering the 6-level OR structure, 9 OR processes, and phase-based activities across the project lifecycle. It is the single source of truth that guides all OR-related decisions, activities, and deliverables from project inception through sustained operations.

The OR Playbook is the foundational document of the VSC OR System. It translates the generic OR framework into a project-specific implementation plan, tailored to the client's industry, project type, organizational maturity, and operational context. Every other OR deliverable (maintenance strategies, spare parts plans, commissioning plans, etc.) derives its scope, standards, and governance from the Playbook. Without a well-defined Playbook, OR activities lack coherence, scope boundaries are unclear, and the transition from project to operations becomes fragmented and risky.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **6-Level OR Structure**: The Playbook must define and apply VSC's 6-level OR structure:
   - **Level 1 - Strategic**: OR vision, strategy, and alignment with business objectives
   - **Level 2 - Governance**: OR governance framework, stage-gates, decision rights, RACI
   - **Level 3 - Management Areas (Domains)**: The 9 OR management areas/domains covering all aspects of operational readiness
   - **Level 4 - Processes**: Specific OR processes within each management area
   - **Level 5 - Activities**: Detailed activities and tasks within each process
   - **Level 6 - Deliverables**: Specific outputs, documents, and artifacts produced by each activity

2. **9 OR Processes (Management Areas)**: The Playbook must cover all 9 VSC OR management areas:
   1. **Organization & People**: Organizational design, staffing, competency, training
   2. **Asset Management & Maintenance**: Maintenance strategy, CMMS, spare parts, reliability
   3. **Operations Management**: Operating procedures, production planning, process optimization
   4. **Health, Safety & Environment (HSE)**: Safety management, environmental management, emergency response
   5. **Supply Chain & Logistics**: Procurement, warehousing, logistics, contract management
   6. **Technology & Systems**: IT/OT systems, CMMS, ERP, automation, data management
   7. **Regulatory & Compliance**: Permits, licenses, regulatory compliance, statutory requirements
   8. **Commissioning & Startup**: Pre-commissioning, commissioning, TCCC, ramp-up
   9. **Continuous Improvement**: Performance management, KPIs, lessons learned, optimization

3. **Phase-Based Activities**: The Playbook must map all activities to project phases:
   - **Conceptual/Pre-Feasibility**: High-level OR strategy and requirements
   - **Feasibility/Basic Engineering**: OR framework design, staffing strategy, key decisions
   - **Detailed Engineering**: Detailed OR planning, procedure development, system design
   - **Construction**: Preparation, training, system configuration, pre-commissioning
   - **Commissioning & Startup**: Execution of all OR deliverables, handover, ramp-up
   - **Operations (Steady State)**: Sustained operations, optimization, continuous improvement

4. **Project-Specific Customization**: The Playbook must be tailored to the specific project context -- industry sector (mining, O&G, power, chemicals), project type (greenfield, brownfield, expansion), geographic context, organizational maturity, and client-specific requirements.

5. **Integration with OR Framework**: The Playbook must align with the project's OR Framework (stage-gates, RACI, governance) and serve as the detailed implementation guide for achieving OR milestones.

## Trigger / Invocation

```
/create-or-playbook
```

**Aliases**: `/or-playbook`, `/playbook-or`, `/playbook`

**Trigger Conditions**:
- New project requires OR program establishment
- User provides project context and OR requirements
- OR Framework has been defined and Playbook implementation is needed
- Existing Playbook requires update for phase transition
- Client requests comprehensive OR methodology document

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Project Context | .docx, text | Project name, industry sector, project type (greenfield/brownfield/expansion), plant description, location, design capacity, expected timeline, owner/operator identity |
| Current Project Phase | Text | Which phase the project is currently in (conceptual, feasibility, detailed engineering, construction, commissioning) |
| Management Areas in Scope | Text, .xlsx | Which of the 9 management areas are in scope for the OR program (typically all 9, but may be limited for specific engagements) |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| OR Framework Document | .docx | From `create-or-framework` -- stage-gate definitions, governance structure |
| Client OR Maturity Assessment | .xlsx | Assessment of client's current OR maturity level across domains |
| Project Master Schedule | .xlsx, .mpp | Project timeline with key milestones for phase alignment |
| Organizational Chart | .docx, .pdf | Client's organizational structure (existing and planned) |
| Equipment List / Asset Register | .xlsx | From `create-asset-register` -- for asset management domain scoping |
| Regulatory Requirements | .docx | Applicable regulations and compliance obligations |
| Client Policies & Standards | .docx, .pdf | Client's existing management system documents, policies, standards |
| Previous OR Playbooks | .docx | Reference playbooks from similar projects |
| Stakeholder Analysis | .xlsx | Key stakeholders and their OR-related roles and interests |
| Lessons Learned Database | .xlsx | Lessons from previous projects for incorporation |
| Budget & Resource Constraints | .xlsx | Available budget and resources for OR program |

### Input Validation Rules

- Project context must include at minimum: industry sector, project type, and current phase
- If fewer than 5 management areas are in scope, validate with user that reduced scope is intentional
- Project without a defined timeline will receive a generic phase-based structure
- Missing OR Framework triggers recommendation to create it first or concurrently

## Output Specification

### Primary Output: OR Playbook (.docx)

**Filename**: `{ProjectCode}_OR_Playbook_v{version}_{date}.docx`

**Document Structure (60-120 pages)**:

### Part 1: Strategic Foundation (15-25 pages)

**Chapter 1: Introduction & Purpose** (3-4 pages)
- Document purpose and scope
- OR Playbook philosophy -- why Operational Readiness matters
- Relationship to project objectives and business case
- How to use this Playbook
- Document control and update process

**Chapter 2: Project Context** (4-5 pages)
- Project overview and description
- Design capacity and key process parameters
- Geographic and environmental context
- Organizational context (owner, operator, EPC, consultants)
- Project lifecycle and current phase
- Key project milestones relevant to OR

**Chapter 3: OR Vision & Strategy** (4-5 pages)
- OR vision statement for the project
- Strategic OR objectives (aligned with business objectives)
- OR success criteria and KPIs
- OR risk summary (key risks to achieving operational readiness)
- OR philosophy: what "ready" means for this project

**Chapter 4: OR Structure & Framework** (4-6 pages)
- VSC 6-Level OR Structure explanation and application
- 9 Management Areas overview and inter-relationships
- Phase-gate alignment and OR milestones
- OR readiness assessment methodology
- Integration with project management framework
- OR Maturity Model: current state and target state

### Part 2: Governance & Organization (10-15 pages)

**Chapter 5: OR Governance** (5-7 pages)
- OR governance structure
- Stage-gate framework with OR-specific gates
- Decision rights and authority matrix
- OR Steering Committee composition and charter
- Reporting structure and frequency
- Escalation process
- OR readiness review process (gate reviews)

**Chapter 6: OR Organization** (5-8 pages)
- OR team structure and roles
- RACI matrix for OR processes
- Interface management (with EPC, vendors, operations)
- Stakeholder management approach
- Communication plan
- OR meeting cadence and forums

### Part 3: Management Area Playbooks (30-60 pages)

For EACH of the 9 management areas, a dedicated chapter with consistent structure:

**Chapter 7-15: [Management Area Name]** (3-7 pages each)

Each management area chapter includes:

7.1 / 8.1 / ... **Scope & Objectives**
- What this management area covers
- Boundaries and interfaces with other areas
- Specific objectives for this project

7.2 / 8.2 / ... **Current State Assessment**
- Assessment of current readiness in this area
- Gap analysis against target state
- Key risks and challenges

7.3 / 8.3 / ... **Phase-Based Activity Plan**
Table showing activities per project phase:

| Phase | Key Activities | Deliverables | Responsible | Timeline |
|-------|---------------|-------------|-------------|----------|
| Conceptual | ... | ... | ... | ... |
| Feasibility | ... | ... | ... | ... |
| Detail Eng. | ... | ... | ... | ... |
| Construction | ... | ... | ... | ... |
| Commissioning | ... | ... | ... | ... |
| Operations | ... | ... | ... | ... |

7.4 / 8.4 / ... **Deliverables Register**
- Complete list of deliverables for this management area
- Deliverable description, owner, due date (by phase/gate)
- Quality standards and review requirements

7.5 / 8.5 / ... **Standards & References**
- Applicable standards, regulations, and best practices
- Client-specific standards and requirements
- VSC methodology references

7.6 / 8.6 / ... **KPIs & Metrics**
- Leading indicators for readiness progress
- Lagging indicators for performance
- Target values and measurement methodology

7.7 / 8.7 / ... **Dependencies & Interfaces**
- Dependencies on other management areas
- External dependencies (EPC, vendors, regulators)
- Critical path items

**Management Area Chapter Content Guide**:

**Chapter 7: Organization & People**
- Organizational design principles and target structure
- Staffing plan: positions, competencies, recruitment timeline
- Training strategy and competency matrix
- Knowledge transfer plan (from EPC/vendors to operations)
- Change management approach

**Chapter 8: Asset Management & Maintenance**
- Maintenance philosophy and strategy
- Asset register development plan
- Maintenance strategy methodology (RCM/FMEA)
- CMMS implementation plan
- Spare parts strategy
- Reliability program development

**Chapter 9: Operations Management**
- Operating philosophy and modes of operation
- Standard Operating Procedures (SOP) development plan
- Production planning and scheduling approach
- Process optimization strategy
- Shift structure and roster design

**Chapter 10: Health, Safety & Environment**
- HSE management system framework
- Safety risk management approach
- Environmental management plan
- Emergency response plan development
- Occupational health program
- Safety culture development

**Chapter 11: Supply Chain & Logistics**
- Procurement strategy for operations
- Warehouse and inventory management plan
- Logistics and transportation plan
- Contract management framework
- Vendor management approach

**Chapter 12: Technology & Systems**
- IT/OT systems architecture for operations
- CMMS selection and implementation plan
- ERP configuration for operations
- Process automation and control systems
- Data management and analytics strategy
- Cybersecurity requirements

**Chapter 13: Regulatory & Compliance**
- Regulatory landscape analysis
- Permit and license inventory
- Compliance calendar and obligations
- Environmental monitoring and reporting
- Stakeholder and community engagement

**Chapter 14: Commissioning & Startup**
- Commissioning philosophy and approach
- System turnover plan
- Startup sequence and TCCC criteria
- Ramp-up strategy
- Performance guarantee testing

**Chapter 15: Continuous Improvement**
- Performance management framework
- KPI dashboard design
- Lessons learned methodology
- Benchmarking approach
- Management of Change (MOC) process
- Maturity roadmap for ongoing improvement

### Part 4: Implementation & Monitoring (10-15 pages)

**Chapter 16: OR Master Schedule** (3-4 pages)
- OR activity timeline aligned with project phases
- Key milestones and gate dates
- Critical path for OR readiness
- Resource loading overview

**Chapter 17: OR Readiness Assessment** (3-4 pages)
- Readiness assessment methodology
- Assessment criteria by management area
- Scoring system and readiness levels
- Assessment schedule (per gate)
- Remediation process for gaps

**Chapter 18: Risk Management** (2-3 pages)
- OR risk register summary
- Top OR risks and mitigations
- Risk monitoring and reporting

**Chapter 19: Budget & Resources** (2-3 pages)
- OR program budget summary
- Resource plan (internal + external)
- Cost tracking and reporting

### Part 5: Appendices

- Appendix A: OR Deliverables Master Register (complete list across all domains)
- Appendix B: RACI Matrix (detailed)
- Appendix C: OR Readiness Assessment Scorecards
- Appendix D: OR Risk Register
- Appendix E: Glossary of Terms
- Appendix F: Reference Documents Index

### Secondary Output: OR Deliverables Tracker (.xlsx)

**Filename**: `{ProjectCode}_OR_Deliverables_Tracker_v{version}_{date}.xlsx`

#### Sheet 1: "Deliverables Register"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Deliverable_ID | Unique identifier (e.g., OR-AM-001) |
| B | Management_Area | Which of the 9 areas |
| C | Deliverable_Name | Deliverable title |
| D | Description | Brief description |
| E | Phase_Required | Which phase gate requires this |
| F | Owner_Role | Who is responsible |
| G | Reviewer_Role | Who reviews/approves |
| H | Due_Date | Target completion date |
| I | Status | Not Started / In Progress / Draft / Review / Approved |
| J | % Complete | Completion percentage |
| K | Quality_Score | Assessment score (if reviewed) |
| L | Dependencies | Prerequisite deliverables |
| M | Notes | Comments and context |

#### Sheet 2: "Readiness Scorecard"
Assessment scoring per management area per gate:
- Gate 1 through Gate N readiness scores
- Red/Amber/Green status per area
- Overall readiness percentage
- Trend visualization

#### Sheet 3: "OR Schedule Summary"
High-level schedule with milestones by management area and phase.

#### Sheet 4: "RACI Matrix"
Detailed RACI for all OR processes and deliverables.

### Formatting Standards
- Professional document with VSC corporate branding
- Management Area color coding (consistent across all OR documents):
  - Org & People: Blue (#0066CC)
  - Asset Management: Green (#008000)
  - Operations: Orange (#FF8C00)
  - HSE: Red (#CC0000)
  - Supply Chain: Purple (#660099)
  - Technology: Teal (#008080)
  - Regulatory: Brown (#8B4513)
  - Commissioning: Navy (#001F3F)
  - Continuous Improvement: Gold (#DAA520)
- Chapter headers and sub-headers consistently formatted
- Tables numbered and cross-referenced
- Page headers with project name and chapter title
- Page footers with document number, version, and page number

## Methodology & Standards

### VSC Proprietary Methodology
- **VSC 6-Level OR Structure** - Proprietary framework for organizing OR activities from strategic to deliverable level
- **VSC 9 OR Processes Model** - Comprehensive coverage model for all operational readiness domains
- **VSC Phase-Gate OR Methodology** - Phase-aligned approach ensuring OR activities progress with project phases
- **VSC OR Maturity Model** - 5-level maturity model for assessing and targeting OR capability

### Industry Standards & Frameworks
- **ISO 55000 Series** - Asset management (foundation for Asset Management domain)
- **ISO 45001** - Occupational health and safety management (HSE domain)
- **ISO 14001** - Environmental management systems (HSE domain)
- **ISO 9001** - Quality management systems (Continuous Improvement domain)
- **ISO 31000** - Risk management (cross-cutting)

### OR Industry Frameworks
- **CII (Construction Industry Institute)** - Project and operations readiness practices
- **IPA (Independent Project Analysis)** - Operational readiness benchmarking
- **AACE International** - Cost and schedule management for OR programs
- **GFMAM** - Global Forum on Maintenance and Asset Management (Asset Management domain)

### Mining-Specific Standards (if applicable)
- **ICMM** - International Council on Mining and Metals guidelines
- **MAC** - Mining Association of Canada - Towards Sustainable Mining
- **IRMA** - Initiative for Responsible Mining Assurance
- **JORC** - Joint Ore Reserves Committee (for production planning context)

### Chilean Regulatory Framework
- **DS 132** - Mining Safety Regulation
- **DS 594** - Workplace conditions
- **Ley 19.300** - Environmental framework law
- **NCh-ISO standards** - Chilean adoptions of ISO standards

## Step-by-Step Execution

### Phase 1: Context Analysis (Steps 1-3)

**Step 1: Analyze Project Context**
- Parse project description and identify key parameters:
  - Industry sector and sub-sector
  - Project type (greenfield, brownfield, expansion, conversion)
  - Scale (capacity, investment, workforce size)
  - Geographic factors (Chile, remote site, altitude, climate)
  - Timeline and current phase
  - Organizational complexity (JV, owner-operated, contract-operated)

**Step 2: Assess OR Scope**
- Confirm which management areas are in scope
- Assess the depth required for each area based on:
  - Project complexity
  - Client OR maturity
  - Current phase (earlier phases need more strategic content, later phases need more tactical content)
  - Available inputs and data
- Identify any non-standard management areas required

**Step 3: Establish Tailoring Parameters**
- Industry-specific terminology and standards
- Phase-specific emphasis (which chapters need more detail)
- Client-specific policies and standards to integrate
- Previous lessons learned to incorporate
- Risk profile that drives OR priorities

### Phase 2: Strategic Foundation (Steps 4-5)

**Step 4: Develop OR Vision & Strategy**
- Draft OR vision statement aligned with project objectives
- Define strategic OR objectives (SMART objectives)
- Establish OR success criteria and key milestones
- Develop high-level OR risk profile
- Define OR philosophy appropriate to project context

**Step 5: Define OR Structure & Governance**
- Apply VSC 6-Level OR Structure to the project
- Map management areas to project organizational structure
- Define phase-gate alignment specific to the project
- Establish governance framework (if not already defined by `create-or-framework`)
- Create RACI matrix for OR processes

### Phase 3: Management Area Development (Steps 6-8)

**Step 6: Develop Each Management Area Chapter**
For each of the 9 management areas in scope:
- Define scope and objectives specific to the project
- Assess current state (if data available) and identify gaps
- Develop phase-based activity plan with deliverables
- Identify applicable standards and references
- Define KPIs and metrics
- Map dependencies and interfaces

Content depth guidance:
- **Current phase and earlier**: Summary-level activity descriptions (completed or in-progress)
- **Next phase**: Detailed activity descriptions with specific deliverables and timelines
- **Future phases**: Outline-level descriptions with key milestones and dependencies

**Step 7: Build Deliverables Register**
For each management area:
- List all required deliverables across all phases
- Assign ownership and review responsibilities
- Set target dates aligned with phase gates
- Identify dependencies between deliverables
- Estimate effort and resources required

**Step 8: Cross-Reference and Integrate**
- Verify inter-area dependencies are consistent (e.g., training plan references competency matrix from staffing plan)
- Ensure deliverables don't have gaps (every OR domain has deliverables in every relevant phase)
- Validate KPIs are measurable and non-redundant
- Ensure RACI is complete and consistent

### Phase 4: Implementation Planning (Steps 9-10)

**Step 9: Develop OR Master Schedule**
- Map all OR activities onto project timeline
- Identify OR critical path (which activities must be complete for each gate)
- Resource-load the OR schedule
- Identify constraints and bottlenecks
- Align with project master schedule milestones

**Step 10: Develop Readiness Assessment Framework**
- Define readiness criteria per management area per gate
- Create scoring rubric (e.g., 1-5 scale per criterion)
- Define overall readiness thresholds (e.g., no area below 3, overall average above 3.5)
- Plan assessment schedule and process
- Define remediation process for gaps

### Phase 5: Output Generation (Steps 11-12)

**Step 11: Generate OR Playbook Document**
- Compile all chapters into the document structure
- Apply VSC formatting and branding
- Create table of contents, list of tables, list of figures
- Cross-reference all internal links
- Generate executive summary
- Quality review for consistency and completeness

**Step 12: Generate Supporting Outputs**
- Create OR Deliverables Tracker workbook
- Populate Readiness Scorecard template
- Generate OR Schedule Summary
- Create RACI Matrix
- Compile reference document index

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Management areas covered | 100% of in-scope areas | 100% |
| Phase-activity coverage per area | >90% of standard activities | >80% |
| Deliverables registered per area | >95% of standard deliverables | >85% |
| RACI completeness | 100% of processes have RACI | >95% |
| KPIs defined per area | >3 KPIs per area | >2 KPIs per area |
| Cross-references validated | 100% | >95% |
| Document length (for full scope) | 60-120 pages | >50 pages |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Strategic Alignment**: OR vision and objectives must clearly link to project business objectives. The Playbook must demonstrate how OR contributes to project success.
- **Project Specificity**: The Playbook must be clearly tailored to the specific project. Generic content without project context is unacceptable. Industry terminology, local regulations, and project-specific challenges must be reflected.
- **Coherence**: All 9 management areas must integrate logically. Dependencies must be consistent. The Playbook must read as a unified strategy, not a collection of independent chapters.
- **Actionability**: Every management area must have specific, measurable deliverables with owners and timelines. The Playbook must enable action, not just describe intent.
- **Scalability**: The structure must accommodate updates as the project progresses through phases.

### Validation Process
1. Management area coverage check (all in-scope areas fully developed)
2. Phase-activity alignment validation (activities in correct phases)
3. Deliverables register completeness check
4. RACI matrix consistency check (no gaps, no conflicts)
5. Cross-reference validation (inter-area dependencies consistent)
6. Project-specificity assessment (no generic/boilerplate content)
7. Final quality score calculation

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-or-framework` | Governance framework | Stage-gate definitions, RACI structure, governance model feed into Chapters 5-6 |
| `create-asset-register` | Asset data | Equipment scope informs Asset Management domain |
| `create-risk-assessment` | Risk profile | Operational risks inform HSE domain and overall OR risk register |
| Document Ingestion Agent | Client documents | Client policies, standards, and existing documents feed project-specific customization |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-maintenance-strategy` | Maintenance philosophy | Asset Management chapter defines maintenance approach that guides strategy development |
| `create-spare-parts-strategy` | Spares philosophy | Asset Management chapter defines spare parts philosophy |
| `create-commissioning-plan` | Commissioning philosophy | Commissioning chapter defines approach that guides detailed planning |
| `create-shutdown-plan` | Maintenance domain | Asset Management domain context for shutdown planning |
| `create-rampup-plan` | Ramp-up context | Commissioning and Operations chapters define ramp-up approach |
| `create-kpi-dashboard` | KPI definitions | KPIs defined per management area feed dashboard design |
| ALL other skills | Overall OR context | The Playbook provides the overarching context for all OR deliverables |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-or-framework` | Mutual alignment | Playbook and Framework must be fully aligned -- Framework defines governance, Playbook provides implementation detail |

## Templates & References

### Templates
- `templates/or_playbook_template.docx` - Master Playbook template with VSC branding and chapter structure
- `templates/or_deliverables_tracker_template.xlsx` - Deliverables tracker template
- `templates/or_readiness_scorecard_template.xlsx` - Readiness assessment template
- `templates/raci_matrix_template.xlsx` - RACI matrix template
- `templates/or_risk_register_template.xlsx` - OR risk register template

### Reference Documents
- VSC OR Methodology Guide v4.0 (internal)
- VSC 6-Level OR Structure Definition (internal)
- VSC 9 OR Processes Model (internal)
- VSC OR Maturity Model v2.0 (internal)
- CII Best Practices - Operational Readiness
- IPA Benchmarking - OR Performance Data
- ISO 55000 Series - Asset Management
- GFMAM Asset Management Landscape

### Reference Playbooks
- Reference Playbook: Large-Scale Copper Concentrator (greenfield)
- Reference Playbook: Gold Heap Leach Operation (greenfield)
- Reference Playbook: Lithium Brine Processing Plant (greenfield)
- Reference Playbook: Concentrator Expansion (brownfield)
- Reference Playbook: Desalination Plant for Mining (greenfield)

## Examples

### Example OR Playbook Table of Contents

```
OR PLAYBOOK - PROYECTO COBRE VERDE
Planta Concentradora de Cobre - 120,000 tpd
Version 1.0 | Fase: Ingenieria de Detalle

TABLE OF CONTENTS
==================

PART 1: STRATEGIC FOUNDATION
  Chapter 1: Introduction & Purpose .......................... 5
  Chapter 2: Project Context ................................ 9
  Chapter 3: OR Vision & Strategy ........................... 14
  Chapter 4: OR Structure & Framework ....................... 19

PART 2: GOVERNANCE & ORGANIZATION
  Chapter 5: OR Governance .................................. 25
  Chapter 6: OR Organization ................................ 32

PART 3: MANAGEMENT AREA PLAYBOOKS
  Chapter 7:  Organization & People ......................... 40
  Chapter 8:  Asset Management & Maintenance ................ 48
  Chapter 9:  Operations Management ......................... 56
  Chapter 10: Health, Safety & Environment .................. 63
  Chapter 11: Supply Chain & Logistics ...................... 71
  Chapter 12: Technology & Systems .......................... 77
  Chapter 13: Regulatory & Compliance ....................... 84
  Chapter 14: Commissioning & Startup ....................... 90
  Chapter 15: Continuous Improvement ........................ 97

PART 4: IMPLEMENTATION & MONITORING
  Chapter 16: OR Master Schedule ............................ 103
  Chapter 17: OR Readiness Assessment ....................... 108
  Chapter 18: Risk Management ............................... 113
  Chapter 19: Budget & Resources ............................ 117

APPENDICES
  Appendix A: OR Deliverables Master Register ............... 121
  Appendix B: RACI Matrix .................................. 130
  Appendix C: OR Readiness Assessment Scorecards ............ 135
  Appendix D: OR Risk Register ............................. 140
  Appendix E: Glossary of Terms ............................ 143
  Appendix F: Reference Documents Index .................... 146

Total Pages: ~148
```

### Example Management Area Activity Plan

```
CHAPTER 8: ASSET MANAGEMENT & MAINTENANCE
Phase-Based Activity Plan
==========================================

| Phase           | Key Activities                                          | Deliverables                        | Owner           | Gate  |
|-----------------|---------------------------------------------------------|-------------------------------------|-----------------|-------|
| Conceptual      | - Define maintenance philosophy                         | Maintenance Philosophy Statement    | OR Lead         | Gate 1|
|                 | - Identify critical asset classes                       | Preliminary Asset Classification    | Reliability Eng | Gate 1|
|                 |                                                         |                                     |                 |       |
| Feasibility     | - Develop RAM analysis requirements                     | RAM Basis of Design                 | Reliability Eng | Gate 2|
|                 | - Define CMMS requirements                              | CMMS Functional Requirements        | IT/OT Lead      | Gate 2|
|                 | - Develop preliminary maintenance strategy              | Maintenance Strategy (Preliminary)  | Maint. Manager  | Gate 2|
|                 |                                                         |                                     |                 |       |
| Detail Eng.     | - Build asset register from equipment lists             | Asset Register (ISO 14224)          | Reliability Eng | Gate 3|
|                 | - Perform RCM/FMEA on critical equipment                | RCM/FMEA Reports                    | Reliability Eng | Gate 3|
|                 | - Develop spare parts strategy (VED-ABC)                | Spare Parts Master                  | Maint. Planner  | Gate 3|
|                 | - Select and configure CMMS                             | CMMS Configuration Spec             | IT/OT Lead      | Gate 3|
|                 | - Develop maintenance procedures                        | Maintenance Procedure Library        | Maint. Manager  | Gate 3|
|                 |                                                         |                                     |                 |       |
| Construction    | - Populate CMMS with asset data and PM plans            | CMMS Loaded and Tested              | IT/OT Lead      | Gate 4|
|                 | - Procure initial spare parts inventory                 | Spare Parts Received & Cataloged    | Supply Chain    | Gate 4|
|                 | - Train maintenance team on procedures and CMMS         | Maintenance Team Trained            | Training Lead   | Gate 4|
|                 | - Set up maintenance workshop and tools                 | Workshop Operational                | Maint. Manager  | Gate 4|
|                 |                                                         |                                     |                 |       |
| Commissioning   | - Support commissioning with maintenance expertise      | Commissioning Support Log           | Maint. Manager  | Gate 5|
|                 | - Validate PM plans during equipment testing            | Validated PM Schedules              | Reliability Eng | Gate 5|
|                 | - Begin warranty management tracking                    | Warranty Register Active            | Maint. Planner  | Gate 5|
|                 |                                                         |                                     |                 |       |
| Operations      | - Execute preventive maintenance program                | PM Compliance Reports               | Maint. Manager  | Ongoing|
|                 | - Monitor equipment reliability and optimize strategies | Reliability Analysis Reports        | Reliability Eng | Ongoing|
|                 | - Manage spare parts inventory optimization             | Inventory Optimization Reports      | Supply Chain    | Ongoing|

KPIs:
  - PM Schedule Compliance: Target >90%
  - Overall Equipment Effectiveness (OEE): Target >85%
  - Mean Time Between Failure (MTBF): Improving trend
  - Spare Parts Service Level: Target >95%
  - Maintenance Cost per Ton Processed: Below benchmark
```

### Example OR Readiness Scorecard

```
OR READINESS ASSESSMENT - GATE 3 (End of Detail Engineering)
=============================================================

| Management Area             | Score (1-5) | Status | Key Gaps                                    |
|-----------------------------|-------------|--------|---------------------------------------------|
| 1. Organization & People    |    3.5      | AMBER  | 40% of positions still vacant               |
| 2. Asset Mgmt & Maintenance |    4.0      | GREEN  | Spare parts procurement pending             |
| 3. Operations Management    |    3.2      | AMBER  | 60% of SOPs drafted, none approved          |
| 4. HSE                      |    4.2      | GREEN  | ERP drill not yet conducted                 |
| 5. Supply Chain & Logistics |    3.0      | AMBER  | Warehouse design not finalized              |
| 6. Technology & Systems     |    3.8      | GREEN  | CMMS UAT pending                            |
| 7. Regulatory & Compliance  |    4.5      | GREEN  | All permits on track                        |
| 8. Commissioning & Startup  |    3.5      | AMBER  | Commissioning team not fully mobilized      |
| 9. Continuous Improvement   |    2.8      | RED    | KPI framework not defined                   |
|-----------------------------|-------------|--------|---------------------------------------------|
| OVERALL                     |    3.6      | AMBER  | Must address Organization & CI before Gate 4|

Scoring: 1=Not Started, 2=Initiated, 3=In Progress, 4=Substantially Ready, 5=Fully Ready
Status:  GREEN (>=4.0), AMBER (3.0-3.9), RED (<3.0)
Gate 3 Threshold: Overall >=3.5, No area below 2.5 -- PASS (with conditions)
```
