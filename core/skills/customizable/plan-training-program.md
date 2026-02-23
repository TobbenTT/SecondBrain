# Plan Training Program

## Skill ID: M-04

## Version: 1.0.0

## Category: M. Workforce Readiness

## Priority: P2 - Medium (essential for operational competency but typically follows staffing and organizational design)

---

## Purpose

Plan comprehensive training programs for operations and maintenance teams preparing for new facility startup, major expansions, or ongoing workforce development. This skill transforms competency requirements derived from organizational design, operating procedures, and regulatory mandates into a structured training program that includes needs analysis, curriculum design, schedule development, vendor coordination, delivery tracking, and effectiveness evaluation using the Kirkpatrick four-level model.

The workforce readiness challenge is one of the most underestimated risks in industrial Operational Readiness. The World Economic Forum estimates that 40% of the global industrial workforce will need reskilling by 2025 due to technology advancement, digitalization, and changing operational paradigms. For new facility startups in mining, oil and gas, and chemical processing, the training challenge is even more acute: an entirely new workforce must be brought to operational competency in a compressed timeline, often 6-12 months before first production. This workforce typically comprises a mix of experienced hires (who must learn new site-specific systems and procedures), recent graduates (who require foundational and practical training), and promoted personnel (who need to develop new competencies for higher-responsibility roles). The training must cover technical operations, maintenance practices, safety systems, emergency response, environmental compliance, quality management, and digital tools -- often simultaneously.

Training investment typically represents 15-25% of the total Operational Readiness budget, yet it is consistently one of the most underestimated line items. Industry data from the Mining Industry Human Resources Council (MiHR) and the Society for Maintenance and Reliability Professionals (SMRP) indicates that the average training cost per worker for a greenfield mining operation ranges from $15,000 to $40,000, encompassing vendor-provided equipment training, regulatory certification, site-specific procedure training, and on-the-job competency development. Organizations that underestimate training requirements face delayed startups (average 3-6 months when training is inadequate), increased incident rates during ramp-up (2-4x the steady-state rate), accelerated equipment degradation due to operator error, and high early turnover as workers feel unprepared and unsupported. A study by the Aberdeen Group found that best-in-class organizations that invest in structured training programs achieve 20% higher equipment availability, 30% lower maintenance costs, and 50% lower incident rates during the first year of operations compared to industry average.

This skill addresses Pain Point W-03 (Workforce Competency Gap) in the OR System framework. It establishes a systematic training program that maps every role to required competencies, identifies gaps between current and required competency levels, designs curricula that address gaps through the most effective learning methods, coordinates vendor and internal training resources, tracks completion and assessment results, and evaluates training effectiveness at all four Kirkpatrick levels (reaction, learning, behavior, results). The skill integrates with MCP servers for learning management system interaction, material storage, and schedule coordination.

---

## Intent & Specification

### Problem Statement

Industrial organizations preparing for new operations or major changes face a training challenge of enormous scope and complexity. A typical facility with 500-1,000 workers across operations, maintenance, HSE, and support functions may require 200-400 distinct training courses covering technical, safety, regulatory, and behavioral competencies. Without systematic planning, training programs suffer from: incomplete coverage (critical competencies missed), poor sequencing (advanced training delivered before prerequisites), vendor schedule conflicts (OEM training windows missed during construction), inadequate assessment (completion tracked but competency not verified), and no effectiveness measurement (investment returns unknown). The result is a workforce that is formally "trained" but not competent, leading to incidents, quality failures, and delayed ramp-up.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Competency Gap Analysis**: Compare the required competency profile for each role (derived from organizational design, job descriptions, and regulatory requirements) against the current competency levels of assigned or planned personnel. Produce a quantified gap analysis showing the specific competencies that need development, the magnitude of the gap, and the number of personnel affected.

2. **Training Needs Assessment**: Transform competency gaps into training requirements, identifying the most appropriate training method (classroom, e-learning, simulation, on-the-job, vendor-provided, mentoring) for each competency. Consider adult learning principles, the criticality of the competency, and the available time before the competency is needed.

3. **Curriculum Design**: Design a structured curriculum using the ADDIE (Analysis, Design, Development, Implementation, Evaluation) instructional design model. Organize training into logical programs (e.g., Operator Fundamentals, Advanced Process Control, Maintenance Technician Certification) with clear learning objectives, prerequisites, content outlines, assessment methods, and competency standards.

4. **Vendor Training Identification and Coordination**: Identify required vendor-provided training (OEM equipment training, specialized software training, regulatory certification training). Coordinate vendor availability with the project construction and commissioning schedule. Ensure vendor training is delivered at the optimal time -- not too early (knowledge decay) and not too late (needed for commissioning participation).

5. **Schedule Development**: Create a comprehensive training schedule that accounts for prerequisite sequencing, facility/equipment availability (some training requires access to installed equipment), personnel availability (balancing training with other pre-startup activities), trainer/vendor availability, training venue capacity, and the critical path to operational readiness.

6. **Resource Allocation**: Estimate and plan for all training resources: internal trainers, external vendors, training facilities, equipment (simulators, training rigs), materials, travel and accommodation, and training management administration. Produce a training budget aligned with the OR project budget.

7. **Delivery Tracking**: Monitor training delivery against the plan, tracking completion rates, assessment results, no-show rates, and schedule adherence. Identify and escalate deviations that threaten readiness timelines.

8. **Effectiveness Evaluation**: Design and implement training effectiveness evaluation at all four Kirkpatrick levels: Level 1 (Reaction -- participant satisfaction), Level 2 (Learning -- knowledge/skill acquisition), Level 3 (Behavior -- on-the-job application), Level 4 (Results -- operational performance impact). Use evaluation results to improve future training delivery.

---

## Trigger / Invocation

```
/plan-training-program
```

**Aliases**: `/training-plan`, `/training-program`, `/programa-capacitacion`, `/plan-capacitacion`

**Natural Language Triggers (EN)**:
- "Plan the training program for the new facility"
- "Create a training needs analysis"
- "Design a training curriculum for operations and maintenance"
- "Schedule vendor training for equipment commissioning"
- "Track training completion for startup readiness"
- "Evaluate training effectiveness"
- "Build a competency development plan"

**Natural Language Triggers (ES)**:
- "Planificar el programa de capacitacion para la nueva instalacion"
- "Crear un analisis de necesidades de capacitacion"
- "Disenar un curriculo de entrenamiento para operaciones y mantenimiento"
- "Programar la capacitacion de proveedores para puesta en marcha"
- "Seguimiento de la finalizacion de capacitacion para la preparacion de inicio"
- "Evaluar la efectividad de la capacitacion"
- "Construir un plan de desarrollo de competencias"

**Trigger Conditions**:
- Organizational design is approved and staffing plan is in development
- New facility startup requires workforce training program
- Competency matrix identifies gaps requiring training
- Vendor training windows are approaching and need coordination
- Management requests training readiness status for startup go/no-go decision
- Regulatory training requirements are identified through regulatory mapping
- Post-startup evaluation reveals competency deficiencies requiring remediation

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `organizational_design` | .xlsx, .docx | Organizational structure with all roles, reporting lines, and headcount per role. Must include operations, maintenance, HSE, and support functions |
| `competency_requirements` | .xlsx | Required competencies per role with target proficiency levels (1-5 scale). Typically derived from job descriptions, operating procedures, and regulatory requirements |
| `startup_timeline` | .xlsx, .docx | Project schedule showing key milestones: recruitment, equipment installation, commissioning phases, PSSR, first production. Training must be complete before corresponding milestones |
| `workforce_profile` | .xlsx | Current or planned workforce roster with existing qualifications, certifications, experience, and current competency levels (where available) |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `regulatory_training_requirements` | .xlsx | Mandatory training requirements from regulatory mapping (L-01) including SERNAGEOMIN, SEREMI Salud, SEC, and DT requirements |
| `equipment_list` | .xlsx | Major equipment list with OEM-specific training requirements and vendor contact information |
| `operating_procedures` | .docx | Draft or final operating procedures for curriculum content development |
| `maintenance_strategy` | .docx, .xlsx | Maintenance strategy identifying specialized maintenance training requirements |
| `previous_training_records` | .xlsx | Historical training records for existing personnel being transferred or promoted |
| `training_budget` | .xlsx | Approved training budget allocation and constraints |
| `vendor_contracts` | .pdf | Equipment supply contracts specifying vendor-provided training obligations |
| `site_facilities_plan` | .pdf | Training facility availability (classrooms, workshops, simulators, control room trainer) |
| `similar_facility_training` | .xlsx | Training program from a similar facility for benchmarking and accelerated development |
| `incident_learnings` | .xlsx | Incident investigation findings identifying training-related root causes (from L-02) |

### Context Enrichment

The agent will automatically enrich the training plan by:
- Querying the learning management system (via mcp-lms) for existing courses and content
- Cross-referencing regulatory requirements (from L-01) for mandatory certifications
- Checking incident history (from L-02) for training-related root causes
- Benchmarking training hours per role against industry standards (OPITO, SMRP, MiHR)
- Identifying vendor training obligations from equipment procurement contracts
- Reviewing competency frameworks from industry bodies (OPITO, SMRP, ISA)

### Input Validation Rules

- Organizational design must include all roles that will be present during operations
- Competency requirements must cover technical, safety, regulatory, and behavioral competencies
- Startup timeline must identify the date by which each role must be fully competent
- Workforce profile must indicate whether positions are filled or vacant (affects training scheduling)
- Regulatory training requirements must specify certification validity periods and renewal cycles

---

## Output Specification

### Deliverable 1: Training Needs Analysis (.xlsx)

**Filename**: `{ProjectCode}_Training_Needs_Analysis_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Executive Summary"
- Total roles assessed, total personnel, total unique competencies
- Overall gap magnitude: number of role-competency gaps to close
- Total training hours estimated (classroom, OJT, e-learning)
- Total training courses required (internal, vendor, external)
- Budget estimate summary
- Critical path items (training that gates startup milestones)

#### Sheet 2: "Competency Gap Matrix"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Role_ID | Unique role identifier | OPS-001 |
| B | Role_Title | Role name | Control Room Operator |
| C | Department | Organizational unit | Operations |
| D | Headcount | Number of personnel in this role | 12 |
| E | Competency_ID | Unique competency identifier | COMP-PROC-015 |
| F | Competency_Name | Competency description | Process Control System (DCS) Operation |
| G | Competency_Category | Technical / Safety / Regulatory / Behavioral / Digital | Technical |
| H | Required_Level | Target proficiency level (1-5) | 4 - Proficient |
| I | Current_Level | Current average proficiency level | 2 - Basic |
| J | Gap_Magnitude | Required minus Current | 2 |
| K | Criticality | Critical / High / Medium / Low | Critical |
| L | Training_Method | Classroom / E-learning / OJT / Simulator / Vendor / Mentoring | Vendor + Simulator |
| M | Training_Course | Recommended course or program | DCS Operator Certification (Honeywell/ABB) |
| N | Training_Hours | Estimated hours to close gap | 80 |
| O | Training_Provider | Internal / Vendor name / External provider | Honeywell |
| P | Must_Complete_By | Date by which competency must be achieved | 2025-06-01 |
| Q | Prerequisite | Prerequisites for this training | Basic Process Operations (COMP-PROC-001) |
| R | Assessment_Method | How competency will be verified | Practical assessment on simulator + written exam |
| S | Certification_Required | Yes/No and certification name | Yes - DCS Operator Level 2 |
| T | Renewal_Period | Certification or refresher period | 24 months |

#### Sheet 3: "Gap Summary by Department"
- Pivot analysis showing gap distribution by department and competency category
- Heat map of gap magnitude by role and competency area
- Pareto chart of largest gaps by training hours required

#### Sheet 4: "Regulatory Training Requirements"
- All mandatory regulatory training identified from regulatory mapping
- Certification body, validity period, renewal requirements
- Linked to specific roles and personnel counts

#### Sheet 5: "Vendor Training Requirements"
- OEM-specific training requirements by equipment
- Vendor training offerings (standard packages, customizable options)
- Vendor lead times and availability constraints
- Contract training obligations vs. additional training recommendations

### Deliverable 2: Training Plan & Schedule (.xlsx)

**Filename**: `{ProjectCode}_Training_Plan_Schedule_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Training Program Summary"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Program_ID | Unique program identifier | PROG-OPS-001 |
| B | Program_Name | Training program name | Control Room Operator Development Program |
| C | Target_Roles | Roles covered by this program | Control Room Operator, Senior Operator |
| D | Target_Headcount | Number of personnel to be trained | 24 |
| E | Total_Hours | Total program duration in hours | 480 |
| F | Number_of_Courses | Number of courses in the program | 12 |
| G | Duration_Weeks | Total calendar weeks | 16 |
| H | Start_Date | Program start date | 2025-02-01 |
| I | End_Date | Program end date | 2025-05-30 |
| J | Method_Mix | % Classroom / % OJT / % Simulator / % E-learning | 30% / 40% / 20% / 10% |
| K | Trainers_Required | Internal trainers needed | 3 senior operators + 1 process engineer |
| L | Vendor_Training | Vendor courses included | Honeywell DCS (40h), ABB Drives (16h) |
| M | Estimated_Cost | Total estimated program cost | $125,000 |
| N | Critical_Path | Is this program on the startup critical path? | Yes - must complete before hot commissioning |

#### Sheet 2: "Course Schedule"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Course_ID | Unique course identifier | CRS-OPS-001-03 |
| B | Course_Name | Course title | DCS Fundamentals and Navigation |
| C | Program_ID | Parent program | PROG-OPS-001 |
| D | Prerequisites | Required prior courses | CRS-OPS-001-01, CRS-OPS-001-02 |
| E | Delivery_Method | Classroom / Simulator / OJT / E-learning / Blended | Classroom + Simulator |
| F | Duration_Hours | Course duration | 24 |
| G | Session_Count | Number of sessions to deliver | 3 (8 people per session) |
| H | Start_Date | First session start date | 2025-03-01 |
| I | End_Date | Last session end date | 2025-03-15 |
| J | Trainer | Trainer name or role | Honeywell Certified Trainer |
| K | Location | Training venue | Site Training Center - Room A |
| L | Equipment_Required | Special equipment needed | DCS Training Simulator |
| M | Materials | Course materials and references | Honeywell DCS Manual, Site-specific config |
| N | Max_Participants | Maximum per session | 8 |
| O | Assessment | Assessment method | Practical simulator assessment (pass mark 80%) |
| P | Cost_Per_Session | Cost per delivery session | $8,000 |
| Q | Status | Planned / Confirmed / In Progress / Complete / Cancelled | Confirmed |

#### Sheet 3: "Gantt View"
- Visual Gantt chart showing all training programs and courses over time
- Milestone markers for: recruitment complete, equipment available, commissioning start, PSSR, first production
- Resource loading by trainer/venue per week
- Critical path highlighting

#### Sheet 4: "Vendor Training Coordination"

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Vendor_Name | Equipment vendor/OEM |
| B | Equipment | Equipment covered |
| C | Training_Type | Standard / Customized / On-site / Factory |
| D | Duration | Training duration |
| E | Location | Training delivery location |
| F | Participants | Number of participants |
| G | Preferred_Dates | Vendor-available dates |
| H | Booked_Dates | Confirmed dates |
| I | Contract_Obligation | Included in contract? (Y/N) |
| J | Additional_Cost | Cost for non-contract training |
| K | Trainer_Qualifications | Required trainer qualifications |
| L | Prerequisites_for_Participants | Pre-training requirements |
| M | Deliverables | Certificates, manuals, assessments |
| N | Status | Requested / Confirmed / Delivered / Cancelled |

#### Sheet 5: "Resource Allocation"
- Trainer workload by week (internal and external)
- Training venue utilization by week
- Equipment/simulator availability by week
- Budget allocation by program, month, and cost category
- Budget vs. actual tracking

### Deliverable 3: Curriculum Design (.docx)

**Filename**: `{ProjectCode}_Training_Curriculum_v{version}_{date}.docx`

**Document Structure (30-50 pages)**:

1. **Executive Summary** (2-3 pages)
   - Training program overview and objectives
   - Alignment with OR milestones and startup timeline
   - Key programs and target audiences
   - Budget summary and resource requirements

2. **Training Philosophy and Approach** (2-3 pages)
   - Adult learning principles applied
   - ADDIE instructional design methodology
   - Competency-based training approach
   - Blended learning strategy (classroom + OJT + digital)
   - Assessment and competency verification approach

3. **Competency Framework** (3-5 pages)
   - Competency model overview (technical, safety, regulatory, behavioral, digital)
   - Proficiency level definitions (1-Awareness through 5-Expert)
   - Competency mapping to roles
   - Gap analysis summary

4. **Training Programs** (10-20 pages, one section per program)
   For each program:
   - Program objectives and target audience
   - Competencies addressed
   - Course sequence with prerequisites (flow diagram)
   - Individual course descriptions:
     - Learning objectives (SMART)
     - Content outline / topic list
     - Delivery method and duration
     - Required resources (trainers, equipment, materials)
     - Assessment criteria and pass standards
   - Program completion requirements
   - Certification or qualification awarded

5. **Vendor Training Integration** (3-4 pages)
   - Vendor-provided training summary
   - Integration with internal training sequences
   - Vendor training quality requirements
   - Knowledge transfer requirements (train-the-trainer)

6. **Regulatory and Mandatory Training** (2-3 pages)
   - Complete list of regulatory-mandated training by role
   - Certification requirements and renewal cycles
   - Approved training providers and accreditation
   - Record-keeping requirements per regulation

7. **On-the-Job Training (OJT) Program** (3-4 pages)
   - OJT methodology and structured approach
   - OJT mentor/assessor qualification requirements
   - OJT task lists by role
   - OJT assessment criteria and sign-off process
   - Progression from supervised to independent operation

8. **Assessment and Competency Verification** (2-3 pages)
   - Assessment methods by competency type:
     - Written examinations (knowledge)
     - Practical assessments (skills)
     - Simulation exercises (decision-making)
     - Behavioral observation (behaviors)
   - Pass standards and remediation process
   - Competency sign-off authority and documentation

9. **Training Effectiveness Evaluation** (2-3 pages)
   - Kirkpatrick four-level evaluation framework:
     - Level 1 (Reaction): Course evaluation surveys
     - Level 2 (Learning): Pre/post assessments
     - Level 3 (Behavior): 90-day on-the-job observation
     - Level 4 (Results): KPI correlation analysis
   - Evaluation schedule and responsibilities
   - Continuous improvement process

10. **Appendices**
    - Complete competency-to-course mapping matrix
    - Course catalog with full descriptions
    - OJT task lists by role
    - Assessment templates
    - Evaluation survey templates

### Deliverable 4: Vendor Training Coordination (.xlsx)

**Filename**: `{ProjectCode}_Vendor_Training_Coordination_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Vendor Training Master List"
- All vendor training requirements consolidated
- Contract vs. additional training distinction
- Cost summary per vendor
- Scheduling status

#### Sheet 2: "Vendor Communication Log"
- Record of all communications with vendors regarding training
- Requests, confirmations, changes, cancellations
- Contact details and response timelines

#### Sheet 3: "Vendor Training Quality Checklist"
- Quality requirements for each vendor training delivery
- Pre-training checks (materials, equipment, venue)
- Post-training deliverables (certificates, assessments, manuals)
- Trainer qualification verification

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| OPITO (Offshore Petroleum Industry Training Organization) | Competency framework and training standards for oil and gas operations; applied as best practice benchmark for structured competency-based training in all industrial sectors |
| SMRP (Society for Maintenance and Reliability Professionals) | Maintenance competency domains and body of knowledge; defines competency requirements for maintenance roles across five pillars: Business & Management, Manufacturing Process Reliability, Equipment Reliability, Organization & Leadership, Work Management |
| ADDIE Instructional Design Model | Analysis, Design, Development, Implementation, Evaluation -- the foundational framework for all training curriculum development in this skill |
| Kirkpatrick Four-Level Evaluation Model | Reaction, Learning, Behavior, Results -- the standard framework for evaluating training program effectiveness |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| ISO 19011:2018 | Guidelines for auditing management systems -- Specifically Clause 7 on auditor competence and training requirements |
| ISO 10015:2019 | Quality management -- Guidelines for competence management and people development |
| ISO 45001:2018 | Clause 7.2 Competence and Clause 7.3 Awareness -- Requirements for occupational safety competence |
| ISA/IEC 62443 | Industrial cybersecurity training requirements for personnel operating control systems |
| NCCER (National Center for Construction Education and Research) | Standardized craft training curricula for construction and maintenance trades |
| ASNT (American Society for Nondestructive Testing) | NDT technician qualification and certification requirements (Level I, II, III) |

### Chilean Regulatory Training Requirements

| Regulation | Training Requirement | Target Roles | Frequency |
|-----------|---------------------|--------------|-----------|
| DS 132 (SERNAGEOMIN) | Mining safety induction, role-specific safety training, emergency response | All mine site personnel | Initial + annual refresher |
| DS 594 (SEREMI Salud) | Occupational hygiene, hazardous materials handling, PPE usage | All workers exposed to hazards | Initial + when conditions change |
| Ley 16.744 | Occupational risk prevention, right-to-know (Derecho a Saber) | All workers | Initial + annual |
| NCh Elec. 4/2003 (SEC) | Electrical safety for qualified and authorized persons | Electrical workers | Initial + certification renewal |
| DS 43/DS 78 | Hazardous substances management training | Personnel handling hazardous chemicals | Initial + biennial |
| Codigo del Trabajo | Labor rights, internal regulations, anti-harassment | All workers | Initial + when regulations change |
| ONEMI/SENAPRED | Emergency preparedness and evacuation | All workers | Initial + semi-annual drills |

### Key Frameworks

**ADDIE Model Application**:
- **Analysis**: Competency gap analysis, training needs assessment, learner analysis, context analysis
- **Design**: Learning objectives, assessment strategy, content structure, delivery methods, sequencing
- **Development**: Content creation, materials development, trainer preparation, pilot testing
- **Implementation**: Training delivery, logistics management, participant tracking, issue resolution
- **Evaluation**: Four-level Kirkpatrick evaluation, continuous improvement, ROI analysis

**Competency Proficiency Levels**:

| Level | Name | Description | Typical Training Method |
|-------|------|-------------|------------------------|
| 1 | Awareness | Knows the concept exists and its basic purpose | E-learning, orientation |
| 2 | Basic | Can perform basic tasks with guidance and supervision | Classroom + supervised OJT |
| 3 | Competent | Can perform independently under normal conditions | Classroom + OJT + assessment |
| 4 | Proficient | Can handle complex situations and train others | Advanced training + extensive OJT + mentoring |
| 5 | Expert | Can innovate, optimize, and lead in the competency area | Experience + specialized programs + industry engagement |

---

## Step-by-Step Execution

### Phase 1: Analysis (Steps 1-4)

**Step 1: Define Training Program Scope and Objectives**
- Review the organizational design for all roles requiring training
- Confirm the startup timeline and key milestones that gate training completion
- Identify the training program objectives aligned with OR readiness criteria
- Determine scope: which roles, which competencies, which phases of readiness
- Establish success criteria: what does "training complete" mean for startup approval?
- Identify constraints: budget, timeline, facility availability, workforce availability

**Step 2: Perform Competency Gap Analysis**
- For each role in the organizational design:
  - Compile the required competency profile (technical, safety, regulatory, behavioral, digital)
  - Define the target proficiency level for each competency (1-5 scale)
  - Assess the current proficiency level of assigned or typical personnel
  - Calculate the gap magnitude (required minus current)
  - Classify the gap criticality: Critical (safety, startup-blocking), High (operations-affecting), Medium (performance-enhancing), Low (nice-to-have)
- Produce the Competency Gap Matrix
- Quantify total training effort: total person-hours of training required
- Identify roles with the largest gaps and highest training investment needs

**Step 3: Assess Training Needs**
- For each identified gap, determine the optimal training approach:
  - **Classroom training**: For knowledge-heavy competencies, theory, regulations, standards
  - **Simulator training**: For process control, emergency response, complex decision-making
  - **On-the-job training (OJT)**: For hands-on skills, equipment-specific procedures, site familiarity
  - **E-learning**: For compliance training, awareness topics, pre-reading, refreshers
  - **Vendor training**: For OEM-specific equipment operation and maintenance
  - **Mentoring/coaching**: For leadership, behavioral, and experience-based competencies
- Determine training provider for each need:
  - Internal (existing expertise within the organization)
  - Vendor/OEM (equipment-specific knowledge)
  - External provider (specialized courses, certifications)
  - Combined (vendor delivers, internal supplements with site-specific context)
- Estimate training hours per course and per program

**Step 4: Identify Regulatory and Mandatory Training**
- Cross-reference with regulatory mapping (L-01 output) for all mandatory training:
  - Safety inductions (SERNAGEOMIN DS 132, Ley 16.744)
  - Occupational hygiene (DS 594)
  - Hazardous materials handling (DS 43/78)
  - Electrical safety (SEC)
  - First aid and emergency response (ONEMI)
  - Labor rights (Codigo del Trabajo)
- Identify required certifications and their issuing bodies
- Note certification validity periods and renewal requirements
- Verify that all mandatory training is included in the gap matrix
- Flag any training that requires accredited providers or regulatory approval

### Phase 2: Design (Steps 5-8)

**Step 5: Design Training Programs and Curricula**
- Group training needs into logical programs:
  - **Operations Training Program**: Process fundamentals, DCS operation, equipment operation, quality management
  - **Maintenance Training Program**: Craft skills, equipment-specific maintenance, reliability techniques, CMMS
  - **HSE Training Program**: Safety induction, hazard identification, risk assessment, emergency response, environmental compliance
  - **Leadership/Supervision Program**: Frontline leadership, crew management, performance management, communication
  - **Digital Skills Program**: CMMS usage, DCS/SCADA, data analysis tools, mobile technology
- For each program, design the curriculum:
  - Define overall program objectives and outcomes
  - Sequence courses with prerequisites (learning path)
  - Develop course descriptions with SMART learning objectives
  - Define assessment methods and pass criteria for each course
  - Identify materials and resources required
  - Estimate total program duration and calendar time

**Step 6: Design On-the-Job Training (OJT) Structure**
- For each role requiring OJT:
  - Define the OJT task list (specific tasks the trainee must demonstrate)
  - Set proficiency criteria for each task (e.g., "can perform independently without errors")
  - Identify OJT mentors/assessors and their qualification requirements
  - Design the OJT progression: observe > assist > perform supervised > perform independently
  - Define the OJT assessment and sign-off process
  - Determine the typical OJT duration per role (often 2-6 months)
- Develop OJT logbooks for each role
- Establish the mentor-to-trainee ratio (typically 1:2 to 1:4)
- Plan for OJT delivery during commissioning activities where possible (real equipment, supervised practice)

**Step 7: Design Assessment and Competency Verification**
- For each course and program:
  - Define the assessment type: written exam, practical demonstration, simulation exercise, oral examination, portfolio
  - Set pass marks (typically 70-80% for knowledge, 100% for safety-critical practical assessments)
  - Define the remediation process for those who do not pass (re-training, additional OJT, re-assessment)
  - Identify assessor qualifications (who can assess and sign off competency?)
- Design the competency sign-off framework:
  - Course completion certificate (training attended)
  - Competency assessment result (knowledge/skill verified)
  - OJT sign-off (on-the-job performance verified)
  - Role authorization (all requirements met, authorized to perform the role independently)

**Step 8: Plan Kirkpatrick Evaluation Framework**
- Design evaluation instruments for each level:
  - **Level 1 (Reaction)**: End-of-course evaluation survey (content relevance, trainer effectiveness, facilities, overall satisfaction). Target: >4.0 / 5.0 average
  - **Level 2 (Learning)**: Pre/post knowledge assessments, practical skills tests. Target: >20% improvement, >80% pass rate
  - **Level 3 (Behavior)**: 90-day post-training observation checklists, supervisor assessments. Target: >80% observed applying training on the job
  - **Level 4 (Results)**: Correlation analysis of training completion with operational KPIs (incident rates, equipment availability, quality metrics, ramp-up speed). Target: measurable improvement in KPIs
- Define data collection methods and responsibilities
- Set evaluation timelines (Level 1: immediate, Level 2: during course, Level 3: 60-90 days post, Level 4: 6-12 months post)

### Phase 3: Development and Implementation (Steps 9-12)

**Step 9: Develop the Training Schedule**
- Build the master training schedule:
  - Map all courses to calendar dates considering:
    - Prerequisite sequencing (foundation courses before advanced)
    - Equipment availability (OJT and simulator training requires installed equipment)
    - Vendor availability (OEM training windows, trainer travel schedules)
    - Personnel availability (not everyone can be in training simultaneously)
    - Venue capacity (classroom seats, simulator capacity)
    - Seasonal factors (weather, holidays, shutdown windows)
  - Identify the critical path: training activities that directly gate startup milestones
  - Build float into non-critical-path activities
  - Plan multiple sessions for courses with large participant numbers
- Validate the schedule against the project master schedule
- Identify conflicts and resolve through prioritization or additional resources

**Step 10: Allocate Resources and Develop Budget**
- Internal trainers:
  - Identify qualified internal trainers for each course
  - Assess trainer workload and availability
  - Plan train-the-trainer sessions where needed
  - Estimate trainer preparation and delivery time
- External resources:
  - Confirm vendor training bookings and costs
  - Source external training providers for specialized courses
  - Negotiate group rates and on-site delivery options
- Facilities and equipment:
  - Confirm training venue availability and capacity
  - Identify equipment needs (simulators, training rigs, PPE for practical training)
  - Arrange for off-site training venues if on-site not available
- Materials:
  - Course materials development or procurement
  - Reference manuals and procedure copies
  - E-learning platform and content licenses
- Budget:
  - Compile total training budget by program, cost category, and month
  - Compare against approved budget and flag variances
  - Identify cost optimization opportunities (combine sessions, use internal trainers, leverage vendor contracts)

**Step 11: Coordinate Vendor Training**
- For each vendor training requirement:
  - Contact vendor training department to confirm availability
  - Negotiate dates aligned with project schedule and equipment delivery
  - Confirm training content covers site-specific configuration (not just generic equipment)
  - Ensure vendor provides assessment and certification documentation
  - Negotiate train-the-trainer sessions to build internal capability
  - Confirm logistics: venue, equipment, materials, participant prerequisites
- Update the vendor training coordination tracker
- Identify backup dates for critical vendor training

**Step 12: Configure Learning Management System (LMS)**
- Set up the training program structure in the LMS (via mcp-lms):
  - Create course catalog with all planned courses
  - Configure program enrollment rules and prerequisites
  - Set up competency tracking with proficiency levels
  - Configure assessment instruments and scoring
  - Set up completion tracking and certification management
  - Configure reporting dashboards
- Enroll personnel in their assigned training programs
- Set up automated notifications for upcoming training sessions
- Configure training record archiving for regulatory compliance

### Phase 4: Monitoring and Evaluation (Steps 13-16)

**Step 13: Track Training Delivery and Completion**
- Monitor training delivery against the plan:
  - Completion rate by course, program, department, and individual
  - Assessment results and pass rates
  - No-show and reschedule rates
  - Schedule adherence (planned vs. actual dates)
- Generate weekly training status reports:
  - Progress toward startup readiness targets
  - Courses at risk of delay
  - Personnel with incomplete training blocking role authorization
  - Budget utilization vs. plan
- Escalate deviations that threaten startup readiness

**Step 14: Manage Training Issues and Remediation**
- For personnel who do not pass assessments:
  - Identify the knowledge/skill gap that caused the failure
  - Design and schedule remedial training
  - Reassess within the defined timeframe
  - Escalate if multiple failures indicate a systemic issue (course design, trainer quality, participant selection)
- For courses behind schedule:
  - Identify root cause (vendor delay, facility unavailable, personnel unavailable)
  - Implement recovery actions (additional sessions, compressed schedule, alternative delivery method)
  - Update the master schedule and communicate impacts

**Step 15: Evaluate Training Effectiveness**
- Execute the Kirkpatrick evaluation plan:
  - **Level 1**: Collect and analyze course evaluation surveys
  - **Level 2**: Compile assessment results and calculate knowledge gain
  - **Level 3**: Conduct 90-day post-training behavioral observations
  - **Level 4**: Correlate training metrics with operational performance (after startup)
- Produce training effectiveness report:
  - Overall program effectiveness rating
  - Course-level effectiveness analysis
  - Trainer effectiveness comparison
  - ROI analysis where Level 4 data is available
  - Recommendations for improvement

**Step 16: Generate Training Readiness Certification**
- For the startup go/no-go decision:
  - Produce a training readiness certificate showing:
    - All personnel have completed required training programs
    - All competency assessments have been passed
    - All OJT has been completed and signed off
    - All regulatory certifications are current and valid
    - All role authorizations have been issued
  - Identify any conditional readiness items (training complete except for specific items with mitigation plans)
  - Provide the certificate to the PSSR review team
- Store all training records in the document management system (mcp-sharepoint)
- Configure ongoing training tracking for post-startup refresher and development needs

---

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| Competency coverage (all roles and required competencies mapped) | 20% | 100% | >98% | Audit of gap matrix against organizational design and regulatory requirements |
| Training plan completeness (course for every identified gap) | 15% | 100% | >95% | Cross-check of training courses against gap matrix |
| Schedule feasibility (no unresolvable conflicts, prerequisites respected) | 15% | 100% feasible | >95% | Schedule validation against constraints and milestone dates |
| Vendor training confirmed (all required vendor training booked) | 10% | 100% confirmed | >90% | Status of vendor training coordination tracker |
| Completion rate (personnel completing on time) | 15% | >95% | >90% | LMS completion tracking against due dates |
| Assessment pass rate (first attempt) | 10% | >85% | >75% | LMS assessment results analysis |
| Kirkpatrick Level 1 satisfaction | 5% | >4.2/5.0 | >3.8/5.0 | Course evaluation survey averages |
| Kirkpatrick Level 2 knowledge gain | 5% | >25% improvement | >20% | Pre/post assessment comparison |
| Budget adherence | 5% | Within 5% of plan | Within 15% of plan | Actual vs. budgeted training cost |

### Automated Quality Checks

- [ ] Every role in the organizational design has a competency profile
- [ ] Every competency gap has an assigned training course or program
- [ ] Every course has defined learning objectives, assessment method, and pass criteria
- [ ] All prerequisite relationships are defined and sequencing is valid (no circular dependencies)
- [ ] All regulatory-mandated training is included with correct certification requirements
- [ ] All vendor training requirements are identified and in the coordination tracker
- [ ] Training schedule does not exceed venue capacity or trainer availability
- [ ] Budget is allocated for all planned training activities
- [ ] OJT task lists exist for all roles requiring on-the-job training
- [ ] Assessment instruments are defined for all courses
- [ ] Kirkpatrick evaluation instruments are designed for all programs
- [ ] Training completion targets are aligned with startup milestones on the critical path
- [ ] Remediation procedures are defined for assessment failures
- [ ] All training records are configured for regulatory retention requirements

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-org-design` | Organizational structure, role definitions, headcount plan | Critical | mcp-sharepoint |
| `create-staffing-plan` | Workforce profile, recruitment timeline, personnel assignments | Critical | mcp-sharepoint |
| `track-competency-matrix` | Current competency levels of assigned personnel | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory training requirements by role and jurisdiction | Critical | mcp-sharepoint |
| `track-incident-learnings` (L-02) | Training-related root causes from incident investigations | High | mcp-sharepoint |
| `create-operations-manual` | Operating procedures driving technical competency requirements | High | mcp-sharepoint |
| `create-maintenance-strategy` | Maintenance competency requirements and specialized training needs | High | mcp-sharepoint |
| `create-commissioning-plan` | Commissioning schedule for vendor training timing and OJT opportunities | Medium | mcp-sharepoint |
| `create-asset-register` | Equipment list for vendor training identification | Medium | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `prepare-pssr-package` | Training readiness certification for pre-startup safety review | Critical | mcp-sharepoint |
| `model-rampup-trajectory` | Training completion milestones affecting ramp-up capability | High | mcp-sharepoint |
| `model-opex-budget` | Training budget for OPEX modeling | Medium | mcp-sharepoint |
| `create-kpi-dashboard` | Training KPIs (completion rate, assessment results, effectiveness) | Medium | mcp-sharepoint |
| `track-competency-matrix` | Updated competency levels after training completion | High | mcp-sharepoint |
| `create-or-framework` | Training program as component of OR readiness assessment | High | mcp-sharepoint |
| `unify-operational-data` (N-01) | Training data for integration into unified operational dashboard | Medium | mcp-sharepoint |

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-lms` | Learning management system for course catalog, enrollment, completion tracking, assessment management, and certification tracking | `create_course`, `enroll_learner`, `track_completion`, `record_assessment`, `generate_certificate`, `query_training_records`, `create_report` |
| `mcp-sharepoint` | Store training curriculum documents, course materials, assessment templates, and training records as controlled documents | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `share_with_team` |
| `mcp-outlook` | Schedule training sessions, send enrollment notifications, reminders for upcoming training, and escalate overdue completion | `create_calendar_event`, `send_invitation`, `send_reminder`, `schedule_recurring` |
| `mcp-excel` | Generate and format the training needs analysis, training schedule, and vendor coordination workbooks | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |
| `mcp-teams` | Distribute training announcements, share course materials, and facilitate trainer-trainee communication | `post_message`, `share_document`, `create_channel`, `schedule_meeting` |

---

## Templates & References

### Templates
- `templates/training_needs_analysis_template.xlsx` - TNA workbook with competency gap matrix and summary dashboards
- `templates/training_plan_schedule_template.xlsx` - Training schedule with Gantt view and resource loading
- `templates/curriculum_design_template.docx` - Curriculum document with VSC branding
- `templates/vendor_training_coordination_template.xlsx` - Vendor coordination tracker
- `templates/course_evaluation_L1_template.xlsx` - Kirkpatrick Level 1 survey template
- `templates/pre_post_assessment_L2_template.xlsx` - Kirkpatrick Level 2 assessment template
- `templates/behavioral_observation_L3_template.xlsx` - Kirkpatrick Level 3 observation checklist
- `templates/ojt_logbook_template.xlsx` - OJT task list and sign-off logbook

### Reference Documents
- OPITO Competence Assessment and Verification Guidelines
- SMRP Body of Knowledge (5 Pillars of Maintenance and Reliability)
- ADDIE Model: Instructional Systems Design Guide (US Army, adapted for industrial use)
- Kirkpatrick Partners: The New World Kirkpatrick Model (2016)
- ISO 10015:2019 - Guidelines for competence management and people development
- Mining Industry Human Resources Council (MiHR): National Occupational Standards for Mining
- VSC Training Program Standard v2.0

### Reference Datasets
- Standard competency catalog for mining operations (200+ competencies)
- Standard competency catalog for maintenance trades (150+ competencies)
- Typical training hours by role and industry benchmarks
- Approved training provider directory (Chile)
- Regulatory training requirement database (Chilean regulations)
- Average training costs per category and delivery method

---

## Examples

### Example 1: Copper Concentrator Plant - Greenfield Startup, Atacama Region

**Input:**
- Facility: New copper concentrator, 80,000 TPD, flotation process
- Workforce: 620 personnel (Operations: 280, Maintenance: 180, HSE: 40, Support: 120)
- Timeline: Startup in 14 months, recruitment starts in 2 months
- Key Equipment: SAG mill (Metso), ball mills (FLSmidth), flotation cells (Outotec), thickeners (WesTech)
- Experience Mix: 40% experienced hires, 35% junior/mid-level, 25% recent graduates

**Expected Output:**
- Training Needs Analysis:
  - 487 unique competency gaps across all roles
  - 142 distinct training courses required
  - Total training effort: 186,000 person-hours
  - Critical path: DCS operator certification (must complete 3 months before hot commissioning)

- Training Plan:
  - 12 training programs (Operations Fundamentals, Advanced Process Control, Maintenance Craft Skills, Reliability Engineering, HSE Core, Emergency Response, Leadership, Digital Skills, Vendor Equipment, Regulatory Compliance, Environmental Compliance, Quality Management)
  - Vendor training: 18 vendor courses from 6 OEMs over 4 months
  - OJT: 6-month structured OJT program for all operators and technicians
  - Training delivered in 3 phases: Foundation (months 1-4), Technical (months 3-8), Commissioning OJT (months 8-14)

- Budget: $4.2M total ($6,800 per person average)
  - Vendor training: $1.4M (33%)
  - Internal delivery: $0.9M (21%)
  - External providers: $0.7M (17%)
  - Facilities and equipment: $0.5M (12%)
  - Materials and e-learning: $0.4M (10%)
  - Travel and logistics: $0.3M (7%)

### Example 2: Gas Compression Station Expansion - Existing Facility, Biobio Region

**Input:**
- Facility: Addition of 2 new compressor trains to existing 3-train station
- Workforce: 45 additional personnel (Operations: 25, Maintenance: 15, HSE: 5)
- Timeline: Startup in 8 months; existing personnel being cross-trained on new equipment
- Key Equipment: Solar Titan turbines (new model), Dresser-Rand compressors
- Experience Mix: 60% internal transfers (experienced on existing equipment), 40% new hires

**Expected Output:**
- Training Needs Analysis:
  - 156 unique competency gaps
  - 48 distinct training courses (many leveraging existing site courses)
  - Total training effort: 28,000 person-hours
  - Critical path: Solar Titan turbine operator certification

- Training Plan:
  - 6 programs (New Equipment Familiarization, Turbine Operations, Compressor Maintenance, Safety Refresher, Digital Systems Update, Vendor Specific)
  - Vendor training: 6 vendor courses from 2 OEMs
  - OJT: 3-month structured OJT leveraging existing site mentors
  - Existing site courses reused for 65% of training needs (cost saving)

- Budget: $680K total ($15,100 per person average)
  - Vendor training: $320K (47%)
  - Internal delivery: $120K (18%)
  - External providers: $80K (12%)
  - Facilities and equipment: $60K (9%)
  - Materials: $50K (7%)
  - Travel: $50K (7%)
