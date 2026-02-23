# Track Incident Learnings

## Skill ID: L-02

## Version: 1.0.0

## Category: L. Compliance Intelligence

## Priority: P1 - Critical (foundational for safety culture, regulatory compliance, and operational continuity)

---

## Purpose

Track incident investigation learnings and ensure systematic implementation of corrective actions across all operational sites. This skill transforms incident investigations from isolated, reactive events into a structured organizational learning system that captures root causes, tracks corrective action implementation to closure, disseminates learnings across the organization, and verifies the effectiveness of implemented actions to prevent recurrence.

The failure of industrial organizations to learn from incidents is one of the most persistent and costly problems in operational safety. Research consistently demonstrates that 60-70% of incidents are recurrences of previously investigated events where corrective actions were either not implemented, not sustained, or not shared across sites. The Heinrich/Bird safety pyramid principle established that for every major injury, there are approximately 10 minor injuries, 30 property damage events, and 600 near-misses. Organizations that fail to systematically capture and act on learnings from the broader base of this pyramid -- particularly near-misses and minor incidents -- inevitably face escalation to serious and fatal events. The Deepwater Horizon disaster (2010, $65B+ cost), the Pike River Mine disaster (2010, 29 fatalities), and the Samarco dam failure (2015, 19 fatalities, $7B+ cost) all had precursor incidents that were investigated but whose learnings were not effectively implemented or transferred.

The economic impact of incident recurrence extends far beyond direct injury costs. The National Safety Council estimates the average cost of a workplace fatality at $1.3M, a medically consulted injury at $44,000, and a day-away-from-work case at $49,000. When considering indirect costs (production loss, investigation time, regulatory penalties, legal liability, increased insurance premiums, reputational damage, workforce morale impact), the total cost multiplier ranges from 4x to 10x the direct cost. In mining operations, a single serious incident can trigger regulatory shutdown orders costing $1M-5M per day in lost production. Chilean regulatory bodies (SERNAGEOMIN, SMA, Direccion del Trabajo) have increasingly imposed punitive sanctions for organizations demonstrating patterns of recurrent incidents, with fines escalating for each successive occurrence.

This skill addresses Pain Point MT-03 (Incident Learning Ineffectiveness) in the OR System framework. It establishes a closed-loop incident learning system that ensures every investigation produces actionable learnings, every corrective action is tracked to verified closure, every relevant learning is shared across sites and work groups, and the effectiveness of implemented actions is verified through leading indicators and trend analysis. The skill integrates with MCP servers for incident database management, investigation document storage, learning dissemination through team communications, and automated action tracking with escalation reminders.

---

## Intent & Specification

### Problem Statement

Most industrial organizations conduct incident investigations but fail to close the learning loop. Investigations produce reports that sit in filing cabinets. Corrective actions are assigned but not tracked to completion -- industry data suggests only 40-60% of identified corrective actions are fully implemented within their target timelines. Learnings remain siloed within the investigating team or site and are not shared with other work groups, shifts, or locations that face similar risks. There is rarely any verification that implemented actions actually prevent recurrence. This systemic failure creates a cycle of repeated incidents, escalating consequences, and eroding safety culture.

### What the Agent MUST Do

The AI agent MUST understand and execute the following core requirements:

1. **Incident Classification and Triage**: Receive incident notifications and classify them by type (injury, illness, environmental, property damage, near-miss, process safety event), severity (actual and potential), and investigation level required. Apply a consistent classification taxonomy aligned with ICAM, OSHA, and organizational standards.

2. **Investigation Management**: Launch and track investigations appropriate to the incident severity. Ensure investigation teams are properly constituted, investigation timelines are adhered to, and investigation methodology (ICAM, TapRooT, 5-Why, Fault Tree Analysis) is correctly applied. Track investigation progress and escalate delays.

3. **Root Cause Analysis Verification**: Review investigation findings to verify that root causes have been identified at the organizational/systemic level (not just immediate/direct causes). Ensure the causal analysis traces back through individual/team actions, task/environmental conditions, and organizational factors to identify systemic deficiencies.

4. **Corrective Action Definition and Quality**: Ensure corrective actions address root causes (not just symptoms), are specific (SMART criteria), have assigned owners with authority to implement, have realistic but aggressive timelines, and include defined completion criteria and verification methods.

5. **Action Tracking and Escalation**: Track every corrective action from assignment through implementation and verification. Provide automated reminders at defined intervals. Escalate overdue actions through the management hierarchy. Report action closure rates and aging analysis.

6. **Learning Dissemination**: Extract key learnings from each investigation and distribute them to all relevant stakeholders (similar operations, work groups, contractors, and peer sites). Generate learning bulletins in accessible formats. Track acknowledgment of learning receipt and incorporation into work practices.

7. **Effectiveness Verification**: After corrective actions are implemented and bedded down, verify their effectiveness through follow-up audits, trend analysis, and leading indicator monitoring. If recurrence is detected, trigger re-investigation with elevated priority.

8. **Trend Analysis and Pattern Recognition**: Analyze incident data over time to identify trends, patterns, and emerging risks. Produce periodic trend reports that inform proactive risk management decisions. Identify systemic organizational factors that contribute to multiple incident types.

---

## Trigger / Invocation

```
/track-incident-learnings
```

**Aliases**: `/incident-tracking`, `/incident-learnings`, `/seguimiento-incidentes`, `/aprendizaje-incidentes`

**Natural Language Triggers (EN)**:
- "Track incident investigation learnings"
- "Set up an incident corrective action tracker"
- "Create an incident learning bulletin"
- "Analyze incident trends for this facility"
- "Track corrective action implementation status"
- "Distribute safety learnings from this investigation"
- "Verify effectiveness of corrective actions"

**Natural Language Triggers (ES)**:
- "Rastrear aprendizajes de investigacion de incidentes"
- "Configurar un seguimiento de acciones correctivas"
- "Crear un boletin de aprendizaje de incidentes"
- "Analizar tendencias de incidentes para esta instalacion"
- "Seguimiento del estado de implementacion de acciones correctivas"
- "Distribuir aprendizajes de seguridad"
- "Verificar efectividad de acciones correctivas"

**Trigger Conditions**:
- An incident is reported and requires investigation tracking
- An investigation is completed and learnings need to be disseminated
- Corrective actions are overdue and require escalation
- Periodic trend analysis is scheduled (monthly/quarterly)
- Management requests incident learning status report
- A recurrent incident is detected requiring re-investigation
- Pre-startup safety review requires incident learning clearance

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `incident_report` | .docx, .pdf, text, or database record | Initial incident report including: date/time, location, description, people involved, injury/damage details, initial classification |
| `facility_context` | Text | Facility name, type, location, and organizational structure for routing investigations and learnings |
| `incident_classification_matrix` | .xlsx, .docx | Organization's incident classification system with severity scales and investigation level triggers |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| `investigation_report` | .docx, .pdf | Completed investigation report with root cause analysis, findings, and recommended corrective actions |
| `historical_incident_data` | .xlsx, database | Historical incident records for trend analysis and recurrence detection |
| `corrective_action_register` | .xlsx | Existing corrective action tracker with current status |
| `organizational_chart` | .xlsx, .pdf | Reporting structure for escalation routing and learning distribution |
| `site_risk_register` | .xlsx | Current risk register for linking incidents to known risks |
| `operating_procedures` | .docx | Relevant SOPs for identifying procedural root causes |
| `training_records` | .xlsx | Training completion records for competency-related root causes |
| `previous_learnings` | .pptx, .docx | Previous learning bulletins for cross-referencing |
| `regulatory_reporting_requirements` | .xlsx | Regulatory timelines and formats for incident reporting (SERNAGEOMIN, OSHA, SMA) |

### Context Enrichment

The agent will automatically enrich incident analysis by:
- Querying the incident database (via mcp-incident-db) for similar past incidents
- Cross-referencing the incident against the facility risk register
- Checking corrective action history for the involved equipment/area
- Reviewing training records for involved personnel
- Identifying similar incidents at peer sites for cross-site learning
- Checking regulatory reporting timelines for the incident type

### Input Validation Rules

- Incident reports must include at minimum: date, location, description, and initial classification
- Investigation reports must include root cause analysis using a recognized methodology
- Corrective actions must be stated in SMART format (Specific, Measurable, Achievable, Relevant, Time-bound)
- Historical incident data must include consistent classification taxonomy for trend analysis
- Regulatory reporting deadlines must be flagged if the incident meets reporting thresholds

---

## Output Specification

### Deliverable 1: Investigation Report (.docx)

**Filename**: `{ProjectCode}_Investigation_Report_{IncidentID}_v{version}_{date}.docx`

**Document Structure (15-30 pages depending on severity)**:

1. **Executive Summary** (1-2 pages)
   - Incident overview and classification
   - Key findings and root causes
   - Critical corrective actions required
   - Regulatory reporting status

2. **Incident Description** (2-3 pages)
   - Detailed narrative of events (timeline)
   - People involved (roles, not names for confidentiality)
   - Environmental and operating conditions
   - Equipment and systems involved
   - Immediate response actions taken
   - Witness statements summary

3. **Investigation Methodology** (1-2 pages)
   - Investigation team composition and qualifications
   - Methodology applied (ICAM, TapRooT, 5-Why, FTA)
   - Evidence collected and analyzed
   - Investigation timeline

4. **Causal Analysis** (3-5 pages)
   - ICAM Analysis Structure:
     - **Absent/Failed Defenses**: Barriers that should have prevented the incident
     - **Individual/Team Actions**: Specific actions or inactions contributing to the incident
     - **Task/Environmental Conditions**: Conditions that influenced behavior
     - **Organizational Factors**: Systemic failures in management systems, culture, or resources
   - Causal factor charting or fault tree diagram
   - Root cause identification and validation
   - Contributing factors analysis

5. **Findings** (2-3 pages)
   - Numbered findings linked to causal analysis
   - Classification of findings: Organizational, Procedural, Technical, Competency, Cultural
   - Findings priority: Critical, Significant, Improvement

6. **Corrective Actions** (2-3 pages)
   - SMART corrective actions for each finding
   - Action hierarchy: Eliminate, Substitute, Engineer, Administrative, PPE
   - Responsible owner and due date for each action
   - Completion criteria and verification method
   - Estimated cost and resource requirements

7. **Lessons Learned** (1-2 pages)
   - Key learnings extracted from the investigation
   - Applicability to other sites, operations, or work groups
   - Recommended distribution channels

8. **Regulatory Reporting** (1 page)
   - Applicable regulatory reporting requirements triggered
   - Reporting timelines and status
   - Report content requirements per authority

9. **Appendices**
   - Evidence photographs and diagrams
   - Witness statements (anonymized)
   - Causal factor charts
   - Timeline of events
   - Reference documents

### Deliverable 2: Corrective Action Tracker (.xlsx)

**Filename**: `{ProjectCode}_Corrective_Action_Tracker_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Action Register"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | Action_ID | Unique action identifier | CA-2025-001-01 |
| B | Incident_ID | Source incident reference | INC-2025-001 |
| C | Finding_Ref | Related investigation finding | F-003 |
| D | Action_Description | Detailed description of the corrective action | Install high-level alarm (LAHH) on acid tank TK-401 with independent shutdown |
| E | Action_Type | Eliminate / Substitute / Engineer / Admin / PPE | Engineer |
| F | Hierarchy_Level | Hierarchy of controls level (1-5) | 3 |
| G | Root_Cause_Addressed | Which root cause this action targets | OF-02: Inadequate engineering design standards |
| H | Owner_Name | Responsible person | John Smith, Maintenance Manager |
| I | Owner_Department | Responsible department | Maintenance |
| J | Assigned_Date | Date action was assigned | 2025-01-15 |
| K | Due_Date | Target completion date | 2025-03-15 |
| L | Priority | Critical / High / Medium / Low | Critical |
| M | Status | Not Started / In Progress / Complete - Pending Verification / Verified Effective / Overdue / Cancelled | In Progress |
| N | Progress_Notes | Latest progress update | PO issued for LAHH instrument, delivery expected Feb 28 |
| O | Last_Updated | Date of last status update | 2025-02-01 |
| P | Days_Open | Calculated days since assignment | 17 |
| Q | Days_Overdue | Calculated days past due date (if applicable) | 0 |
| R | Completion_Date | Actual completion date | -- |
| S | Completion_Evidence | Description of evidence confirming completion | Installation completion certificate, functional test record |
| T | Verification_Method | How effectiveness will be verified | 6-month review of alarm activation records and near-miss data |
| U | Verification_Due_Date | Date for effectiveness verification | 2025-09-15 |
| V | Verification_Status | Not Due / Pending / Verified Effective / Not Effective | Not Due |
| W | Verification_Notes | Results of effectiveness verification | -- |
| X | Escalation_Level | Current escalation level (0-3) | 0 |
| Y | Cost_Estimate | Estimated implementation cost | $15,000 |
| Z | Actual_Cost | Actual implementation cost | -- |

#### Sheet 2: "Dashboard"
- Summary statistics: Total actions, by status, by priority, by department
- Aging analysis: Actions open >30, >60, >90 days
- Closure rate trend (monthly)
- Overdue action escalation summary
- Hierarchy of controls distribution (% of actions at each level)
- Actions by root cause category

#### Sheet 3: "Escalation Log"
| Column | Field Name | Description |
|--------|-----------|-------------|
| A | Escalation_ID | Unique escalation identifier |
| B | Action_ID | Related corrective action |
| C | Escalation_Level | Level 1 (Supervisor) / Level 2 (Manager) / Level 3 (Director/VP) |
| D | Escalation_Date | Date escalation was triggered |
| E | Escalation_Reason | Overdue / Stalled / Resource Constraint / Scope Change |
| F | Escalated_To | Name and role of escalation recipient |
| G | Response_Required_By | Deadline for escalation response |
| H | Response_Received | Date response was received |
| I | Resolution | Description of resolution or decision |
| J | Status | Open / Resolved |

#### Sheet 4: "Effectiveness Review"
- Actions that have completed their verification period
- Effectiveness assessment results
- Actions requiring re-investigation or additional measures
- Trend analysis of action effectiveness by type and hierarchy level

### Deliverable 3: Learning Bulletin (.pptx)

**Filename**: `{ProjectCode}_Learning_Bulletin_{IncidentID}_{date}.pptx`

**Slide Structure (4-6 slides)**:

#### Slide 1: "Safety Learning Bulletin" (Title Slide)
- Bulletin number and date
- Incident type icon and severity classification
- One-line summary of the incident
- Distribution: All Operations / Specific Work Groups

#### Slide 2: "What Happened?"
- Simple narrative of the incident (3-5 bullet points)
- Incident timeline (simplified)
- Supporting photograph or diagram (if available)
- Actual and potential severity assessment

#### Slide 3: "Why Did It Happen?" (Root Causes)
- Root causes in plain language (not technical jargon)
- Visual representation of causal chain (simplified bow-tie or fault tree)
- Absent or failed defenses highlighted
- Organizational factors identified

#### Slide 4: "What Are We Doing About It?" (Actions)
- Key corrective actions being implemented
- Timeline for implementation
- How these actions prevent recurrence
- Who is responsible

#### Slide 5: "What Can YOU Do?" (Personal Actions)
- 3-5 specific actions that workers in similar roles can take
- Questions to ask before starting similar work
- Stop-work authority reminder
- How to report similar hazards or near-misses

#### Slide 6: "Discussion Questions" (For Toolbox Talks)
- 3-4 discussion questions for team meetings
- "What if?" scenarios for the team to consider
- Acknowledgment section (team/date/supervisor)

### Deliverable 4: Action Closure Report (.xlsx)

**Filename**: `{ProjectCode}_Action_Closure_Report_{Period}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Closure Summary"
- Period covered
- Total actions tracked, closed, overdue, cancelled
- Closure rate percentage
- Average time to closure by priority
- Actions requiring re-investigation

#### Sheet 2: "Closed Actions Detail"
- Full detail of all actions closed in the period
- Evidence documentation references
- Verification results

#### Sheet 3: "Overdue Actions"
- All overdue actions with escalation status
- Root cause of delay
- Revised target dates
- Management response

#### Sheet 4: "Trend Analysis"
- Monthly/quarterly closure rate trends
- Incident recurrence analysis
- Effectiveness verification results trend
- Leading indicator analysis

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| ICAM (Incident Cause Analysis Method) | Primary investigation methodology for organizational factor analysis. 4-level causal analysis: Absent/Failed Defenses, Individual/Team Actions, Task/Environmental Conditions, Organizational Factors |
| TapRooT Root Cause Analysis | Systematic root cause analysis methodology with corrective action identification. Used for complex or high-severity investigations |
| ISO 45001:2018 | Occupational health and safety management systems -- Clause 10.2 Incident, nonconformity, and corrective action |
| OSHA Recordkeeping Standards (29 CFR 1904) | US regulatory requirements for incident recording and reporting (applied as international best practice benchmark) |

### Secondary Standards

| Standard | Application |
|----------|-------------|
| IEC 62740:2015 | Root cause analysis -- Principles and methodology for investigation of failures |
| ISO 14001:2015 | Environmental management systems -- Clause 10.2 for environmental incidents |
| CCPS Process Safety Metrics | Process safety event classification and metrics framework |
| ICMM Health and Safety Performance | Mining industry incident classification and reporting standards |
| API 754 | Process safety performance indicators for the refining and petrochemical industries |
| Heinrich/Bird Pyramid | Safety pyramid model for incident ratio and leading indicator framework |

### Chilean Regulatory Requirements for Incident Reporting

| Regulatory Body | Reporting Trigger | Timeline | Format |
|-----------------|-------------------|----------|--------|
| SERNAGEOMIN | Fatal incident or serious injury in mining | Immediate notification + written report within 24 hours | SIGMIN portal + formal letter |
| SERNAGEOMIN | Mining accident with >3 days lost time | Within 48 hours | SIGMIN portal |
| Direccion del Trabajo | Workplace accident with >1 day lost time | Within 24 hours (DIAT form) | RALF portal |
| SMA | Environmental incident or non-compliance | Immediate notification + formal report within 5 days | SMA portal + formal letter |
| SEREMI de Salud | Occupational illness diagnosis | Within 24 hours (DIEP form) | SEREMI Salud portal |
| ONEMI/SENAPRED | Emergency requiring external response | Immediate notification | Emergency communication protocol |
| SERNAGEOMIN | Dam safety incident (tailings) | Immediate notification | SIGMIN + direct communication |

### Investigation Methodology Selection Matrix

| Incident Severity | Actual Consequence | Investigation Level | Methodology | Timeline |
|-------------------|-------------------|---------------------|-------------|----------|
| Level 5 - Catastrophic | Fatality, major environmental disaster, >$10M loss | Full ICAM Investigation | ICAM + Fault Tree + Bow-Tie | 30 days |
| Level 4 - Major | Serious injury (hospitalization), significant environmental release, $1M-10M loss | Formal Investigation | ICAM or TapRooT | 21 days |
| Level 3 - Moderate | Medical treatment injury, contained environmental release, $100K-1M loss | Standard Investigation | ICAM (simplified) or 5-Why | 14 days |
| Level 2 - Minor | First aid injury, minor release, $10K-100K loss | Supervisor Investigation | 5-Why | 7 days |
| Level 1 - Insignificant | Near-miss, no injury, <$10K loss | Near-Miss Analysis | 5-Why or Rapid Investigation | 5 days |
| High Potential | Near-miss with high potential consequence regardless of actual outcome | Formal Investigation (as if actual consequence occurred) | ICAM or TapRooT | 21 days |

### Corrective Action Hierarchy of Controls

| Level | Control Type | Effectiveness | Reliability | Example |
|-------|-------------|---------------|-------------|---------|
| 1 | Elimination | Highest | Highest | Remove the hazard entirely (change process to eliminate hazardous step) |
| 2 | Substitution | High | High | Replace with less hazardous material or process |
| 3 | Engineering Controls | High | High | Physical barriers, interlocks, guards, ventilation systems |
| 4 | Administrative Controls | Moderate | Moderate | Procedures, training, signage, permit-to-work, job rotation |
| 5 | PPE | Lowest | Lowest | Personal protective equipment (last resort) |

---

## Step-by-Step Execution

### Phase 1: Incident Receipt and Classification (Steps 1-3)

**Step 1: Receive and Register the Incident**
- Receive incident notification through incident database (mcp-incident-db) or manual input
- Assign a unique incident identifier following the organization's numbering convention
- Record initial details: date/time, location, persons involved, description of events
- Record actual consequence (what happened) and potential consequence (what could have happened)
- Capture immediate response actions taken
- Verify if any regulatory reporting thresholds are triggered
- Initiate regulatory notification process if required (flag deadlines)

**Step 2: Classify the Incident**
- Apply the organization's incident classification matrix:
  - **Type**: Personal Injury / Occupational Illness / Environmental Release / Property Damage / Near-Miss / Process Safety Event / Security / Vehicle / Fire / Other
  - **Actual Severity**: Level 1-5 based on actual consequences
  - **Potential Severity**: Level 1-5 based on worst-case plausible outcome
  - **Investigation Level**: Determined by the higher of actual or potential severity
- Identify the applicable investigation methodology based on classification
- Check for "High Potential" flag: incidents with minor actual consequences but major potential consequences must be investigated at the higher potential level
- Cross-reference against historical incident data for recurrence indicators

**Step 3: Launch the Investigation**
- Based on the investigation level:
  - **Level 5/4**: Notify senior management, appoint formal investigation team lead, assemble multi-disciplinary team, preserve evidence, initiate regulatory notifications
  - **Level 3**: Assign investigation to area supervisor with HSE support, preserve evidence
  - **Level 2/1**: Assign to direct supervisor for rapid investigation
- Generate investigation launch notification via mcp-teams
- Set investigation timeline and milestones based on severity
- Create investigation checklist appropriate to the methodology
- Ensure investigation team has access to relevant data, records, and personnel

### Phase 2: Investigation and Root Cause Analysis (Steps 4-6)

**Step 4: Gather Evidence and Construct Timeline**
- Collect and organize all available evidence:
  - Witness statements (interviews within 24-48 hours)
  - Physical evidence (photographs, equipment condition, samples)
  - Documentary evidence (procedures, permits, training records, maintenance records)
  - Electronic evidence (SCADA data, camera footage, access records, radio communications)
  - Environmental evidence (conditions, weather, lighting, noise)
- Construct a detailed timeline of events from normal operations through the incident to the response
- Identify the point(s) of deviation from normal or expected sequence
- Preserve evidence chain for potential regulatory or legal proceedings

**Step 5: Perform Root Cause Analysis**
- Apply the selected investigation methodology:

**ICAM Analysis**:
  - Identify **Absent or Failed Defenses**: What barriers should have prevented the incident? Why were they absent or why did they fail?
  - Identify **Individual/Team Actions**: What actions or errors contributed? (NOT blame -- understanding of behavioral context)
  - Identify **Task/Environmental Conditions**: What conditions influenced behavior? (fatigue, time pressure, complexity, environment, equipment design, procedures)
  - Identify **Organizational Factors**: What systemic failures created the conditions? (management decisions, resource allocation, culture, competency management, change management, risk management, contractor management)

**TapRooT Analysis** (for complex investigations):
  - Apply SnapCharT (timeline charting with causal factors)
  - Apply Root Cause Tree with branch navigation
  - Generate corrective action recommendations from the tree

**5-Why Analysis** (for simpler investigations):
  - Start with the event and ask "Why?" five times to reach systemic causes
  - Ensure each "Why?" is evidence-based, not speculative
  - Continue beyond five if the root cause is not yet systemic

- Document the complete causal chain from immediate causes to root/organizational causes
- Validate root causes against evidence (each root cause must be supported by evidence)

**Step 6: Develop Findings and Corrective Actions**
- Formulate numbered findings from the causal analysis:
  - Each finding must state what was found, why it matters, and what needs to change
  - Classify findings: Organizational, Procedural, Technical, Competency, Cultural
  - Prioritize findings: Critical, Significant, Improvement

- Develop corrective actions for each finding:
  - Apply the Hierarchy of Controls (prefer elimination/engineering over administrative/PPE)
  - Each action must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
  - Assign an owner with the authority and resources to implement
  - Define completion criteria: what does "done" look like?
  - Define verification method: how will effectiveness be confirmed?
  - Assess implementation cost and resource requirements
  - Set due dates considering urgency, complexity, and procurement lead times

### Phase 3: Action Tracking and Learning Dissemination (Steps 7-10)

**Step 7: Enter Corrective Actions into Tracking System**
- Register all corrective actions in the Corrective Action Tracker (via mcp-incident-db)
- Set automated reminder schedule:
  - Weekly status update reminders to action owners
  - 14-day advance alert before due date
  - 7-day advance alert before due date
  - Daily alerts for overdue actions
- Define escalation triggers:
  - Level 1 escalation (to supervisor): Action overdue by 7 days
  - Level 2 escalation (to manager): Action overdue by 14 days
  - Level 3 escalation (to director): Action overdue by 30 days
- Send initial notification to all action owners via mcp-outlook

**Step 8: Generate and Distribute Learning Bulletin**
- Extract key learnings from the investigation:
  - What happened (simplified, non-technical narrative)
  - Why it happened (root causes in plain language)
  - What is being done (corrective actions summary)
  - What individuals can do (personal actions and awareness)
- Create the Learning Bulletin presentation (4-6 slides)
- Include discussion questions for toolbox talks and safety meetings
- Identify distribution audience:
  - Direct relevance: Same site, same work type, same equipment
  - Indirect relevance: Other sites, similar processes, shared risk profiles
  - Organizational learning: All operations, leadership, corporate HSE
- Distribute via mcp-teams to appropriate channels
- Track acknowledgment of receipt and toolbox talk completion
- Store bulletin in investigation archive (mcp-sharepoint)

**Step 9: Monitor Corrective Action Implementation**
- Conduct weekly review of corrective action status:
  - Contact action owners for progress updates
  - Update the tracker with current status and progress notes
  - Identify actions at risk of becoming overdue
  - Trigger escalations for overdue actions
- Generate monthly corrective action status report:
  - Total actions: open, closed, overdue, cancelled
  - Closure rate percentage and trend
  - Aging analysis (days open distribution)
  - Escalation summary
  - Actions requiring management attention
- Verify completion evidence when actions are reported as complete:
  - Does the evidence demonstrate the action was fully implemented?
  - Does the implementation match the intended scope?
  - Is the documentation sufficient for audit purposes?
- Send status reports to investigation sponsor and HSE leadership

**Step 10: Close Completed Actions with Evidence**
- For each action reported as complete:
  - Review completion evidence against defined completion criteria
  - Confirm the action addresses the identified root cause
  - Verify that the action is consistent with the hierarchy of controls level specified
  - Document the completion evidence in the tracker
  - Set the effectiveness verification review date (typically 3-6 months post-implementation)
  - Update the action status to "Complete - Pending Verification"
- Generate action closure notification to investigation team and sponsor

### Phase 4: Effectiveness Verification and Trend Analysis (Steps 11-14)

**Step 11: Verify Corrective Action Effectiveness**
- At the scheduled verification date (3-6 months post-implementation):
  - Review incident data for recurrence of similar incidents
  - Review leading indicators related to the root cause
  - Conduct field verification that the implemented action remains in place and functioning
  - Interview workers and supervisors on the effectiveness and sustainability of the change
  - Check for unintended consequences or workarounds
- Classify effectiveness:
  - **Verified Effective**: No recurrence, action in place and functioning, workers confirm improvement
  - **Partially Effective**: Some improvement but additional measures needed
  - **Not Effective**: Recurrence detected or action has degraded; trigger re-investigation
- Update the action tracker with verification results
- If action is not effective, generate a new corrective action or elevate to higher hierarchy of controls level

**Step 12: Perform Trend Analysis**
- Analyze incident data on a monthly and quarterly basis:
  - Incident frequency and severity trends (TRIR, LTIFR, SIFR)
  - Incident type distribution and trends
  - Recurrence rate (% of incidents that are repeat events)
  - High-potential incident ratio
  - Near-miss reporting rate (leading indicator of reporting culture)
  - Corrective action closure rate and aging trends
  - Root cause category distribution (what systemic factors are most common?)
- Identify emerging patterns:
  - Increasing frequency in specific categories or areas
  - Common root cause themes across multiple incidents
  - Seasonal or operational-phase patterns
  - Contractor vs. employee incident patterns
  - Time-of-day and shift patterns
- Generate trend analysis report with visualizations and actionable insights

**Step 13: Update Organizational Risk Profile**
- Feed investigation findings and trend analysis back into the risk management process:
  - Update the site risk register with new or modified risk assessments
  - Adjust risk ratings based on incident data (increase likelihood for risks that have materialized)
  - Identify new risks not previously captured in the register
  - Recommend updates to safety critical control effectiveness ratings
  - Provide input to management review and safety performance reporting

**Step 14: Generate Periodic Learning Summary**
- Produce quarterly and annual incident learning summaries:
  - Summary of all investigations completed in the period
  - Key themes and organizational learning priorities
  - Corrective action performance metrics
  - Effectiveness verification results
  - Cross-site learning sharing achievements
  - Recommendations for systemic improvement initiatives
  - Benchmarking against industry performance (where data available)
- Present to management review forum for strategic decision-making
- Archive in organizational knowledge management system (mcp-sharepoint)

---

## Quality Criteria

### Scoring Table

| Criterion | Weight | Target | Minimum Acceptable | Measurement Method |
|-----------|--------|--------|--------------------|--------------------|
| Investigation timeliness (completed within defined timeline) | 15% | >95% | >90% | Comparison of completion date vs. target date by severity level |
| Root cause depth (reaches organizational/systemic level) | 20% | 100% of Level 3+ investigations | >95% | Review of causal analysis -- must identify organizational factors |
| Corrective action quality (SMART, addresses root cause, appropriate hierarchy level) | 20% | >95% of actions meet SMART criteria | >90% | Audit of action register against SMART criteria |
| Action closure rate (within target timeline) | 15% | >85% closed on time | >75% | Tracker analysis: actions closed on or before due date |
| Learning dissemination reach (relevant audiences receive bulletin) | 10% | >90% of target audience acknowledge receipt | >80% | Acknowledgment tracking via mcp-teams |
| Effectiveness verification completion | 10% | 100% of closed actions verified within 6 months | >90% | Tracker analysis: verification completed vs. due |
| Incident recurrence rate (same root cause within 12 months) | 10% | <10% recurrence | <15% | Trend analysis comparing incident root causes |

### Automated Quality Checks

- [ ] Every reported incident has a unique identifier and complete classification
- [ ] Investigation team composition meets requirements for the investigation level
- [ ] Investigation is completed within the timeline for its severity level
- [ ] Root cause analysis reaches organizational/systemic factors (not just immediate causes)
- [ ] Every finding has at least one corrective action
- [ ] Every corrective action has an assigned owner, due date, and completion criteria
- [ ] Corrective actions demonstrate preference for higher hierarchy of controls levels
- [ ] No more than 30% of corrective actions are administrative-only (training, procedures)
- [ ] Overdue actions have escalation records
- [ ] Learning bulletins are generated within 5 business days of investigation completion
- [ ] Learning bulletins are distributed to all identified relevant audiences
- [ ] Effectiveness verification is scheduled for all closed actions
- [ ] Regulatory reporting deadlines are met for all reportable incidents
- [ ] Trend analysis is produced on the scheduled frequency (monthly/quarterly)
- [ ] Investigation reports are stored in the document management system with proper metadata

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Input Received | Criticality | MCP Integration |
|-------------|---------------|-------------|-----------------|
| `create-risk-assessment` | Risk register for incident-to-risk cross-referencing | High | mcp-sharepoint |
| `map-regulatory-requirements` (L-01) | Regulatory reporting requirements for incidents | Critical | mcp-sharepoint |
| `create-asset-register` | Equipment data for equipment-related incidents | Medium | mcp-sharepoint |
| `track-competency-matrix` | Training records for competency-related root causes | High | mcp-sharepoint |
| `generate-operating-procedures` | SOPs for procedural deviation analysis | Medium | mcp-sharepoint |
| `create-org-design` | Organizational structure for escalation routing | Medium | mcp-sharepoint |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Output Provided | Criticality | MCP Integration |
|-------------|----------------|-------------|-----------------|
| `create-risk-assessment` | Incident data for risk register updates and likelihood calibration | High | mcp-sharepoint |
| `create-maintenance-strategy` | Equipment failure incidents for maintenance strategy refinement | High | mcp-sharepoint |
| `plan-training-program` (M-04) | Training gaps identified through incident root causes | High | mcp-sharepoint |
| `create-kpi-dashboard` | Incident metrics and safety KPIs (TRIR, LTIFR, SIFR, closure rate) | Critical | mcp-sharepoint |
| `prepare-pssr-package` | Open corrective action status for PSSR clearance | Critical | mcp-sharepoint |
| `audit-compliance-readiness` | Incident investigation compliance for regulatory audit readiness | High | mcp-sharepoint |
| `generate-esg-report` | Safety performance data for ESG/sustainability reporting | Medium | mcp-sharepoint |
| `create-operations-manual` | Updated procedures based on investigation findings | Medium | mcp-sharepoint |
| `unify-operational-data` (N-01) | Incident data for unified operational data platform | Medium | mcp-sharepoint |

---

## MCP Integrations

| MCP Server | Purpose | Key Operations |
|------------|---------|----------------|
| `mcp-incident-db` | Primary incident database for recording incidents, investigations, corrective actions, and trend data | `create_incident`, `update_incident`, `query_incidents`, `create_action`, `update_action`, `query_actions`, `generate_trend_report` |
| `mcp-sharepoint` | Store investigation reports, learning bulletins, and trend analysis documents as controlled records | `upload_document`, `create_folder`, `set_metadata`, `manage_versions`, `search_documents` |
| `mcp-teams` | Distribute learning bulletins, investigation notifications, and action reminders to team channels | `post_message`, `create_channel`, `share_document`, `track_acknowledgment`, `tag_stakeholders` |
| `mcp-outlook` | Send corrective action reminders, escalation notifications, and regulatory reporting deadline alerts | `send_email`, `create_reminder`, `schedule_recurring`, `send_escalation` |
| `mcp-excel` | Generate and format the corrective action tracker, closure reports, and trend analysis with charts | `create_workbook`, `format_cells`, `add_formulas`, `create_charts`, `apply_conditional_formatting` |

---

## Templates & References

### Templates
- `templates/investigation_report_template_ICAM.docx` - Full ICAM investigation report template
- `templates/investigation_report_template_5why.docx` - Simplified 5-Why investigation template
- `templates/corrective_action_tracker_template.xlsx` - CA tracker with dashboards and escalation formulas
- `templates/learning_bulletin_template.pptx` - Safety learning bulletin (4-6 slides)
- `templates/action_closure_report_template.xlsx` - Monthly action closure report
- `templates/trend_analysis_template.xlsx` - Incident trend analysis workbook with charts
- `templates/incident_classification_matrix.xlsx` - Standard incident classification and investigation level matrix

### Reference Documents
- ICAM Investigation Methodology Guide v4.0 (Minerals Council of Australia)
- TapRooT Root Cause Analysis System (System Improvements, Inc.)
- ISO 45001:2018 - Occupational health and safety management systems
- IEC 62740:2015 - Root cause analysis
- CCPS Guidelines for Investigating Process Safety Incidents (3rd Edition)
- ICMM Good Practice Guidance on Occupational Health Risk Assessment
- VSC Incident Investigation Standard v2.0

### Reference Datasets
- Standard incident classification taxonomy (aligned with ICAM and OSHA)
- Root cause category taxonomy (organizational factors, task conditions, individual actions, defenses)
- Corrective action hierarchy of controls reference
- Chilean regulatory reporting thresholds and timelines
- Industry benchmark incident rates by sector (ICMM, IOGP, BSEE)
- Standard investigation team composition by severity level

---

## Examples

### Example 1: Conveyor Belt Entanglement Incident - Copper Mine, Atacama Region

**Incident:**
- Worker's sleeve caught in conveyor return roller during routine inspection
- Result: Fracture and soft tissue injury to left forearm (Lost Time Injury)
- Potential: Amputation or fatality

**Investigation (ICAM Level 3 - Formal):**
- Absent/Failed Defenses: Guard removed during previous maintenance and not replaced; no lock-out tag-out (LOTO) for routine inspection; no motion detection interlocking
- Individual/Team Actions: Worker reached across moving conveyor to clear material buildup; did not apply LOTO
- Task/Environmental Conditions: Material buildup required frequent manual clearing; poor lighting at conveyor underside; time pressure from production targets; loose-fitting coveralls
- Organizational Factors: LOTO procedure did not cover routine inspections (only maintenance); no engineering solution for material buildup; production pressure culture; PPE standard did not address sleeve fit for conveyor work

**Corrective Actions (8 actions):**
1. [Engineering] Install motion-sensing interlock on all return rollers in inspection zones -- Priority: Critical, Due: 30 days
2. [Engineering] Install material flow design improvement to eliminate buildup at transfer point -- Priority: High, Due: 60 days
3. [Administrative] Update LOTO procedure to include ALL interactions with moving equipment including routine inspections -- Priority: Critical, Due: 7 days
4. [Administrative] Revise PPE standard to require close-fitting sleeves for conveyor area work -- Priority: High, Due: 14 days
5. [Engineering] Install adequate lighting at all conveyor inspection points -- Priority: Medium, Due: 45 days
6. [Administrative] Brief all conveyor operators and maintenance personnel on updated LOTO and PPE requirements -- Priority: Critical, Due: 14 days
7. [Organizational] Review production incentive system to ensure it does not create pressure to bypass safety controls -- Priority: High, Due: 60 days
8. [Administrative] Conduct conveyor guarding audit across all sites -- Priority: High, Due: 30 days

**Learning Bulletin Distribution:**
- Direct: All conveyor operators, maintenance crews at the mine site (150 people)
- Indirect: All other mine sites in the company portfolio (4 sites, ~2,000 people)
- Organizational: Corporate HSE, Operations VP, all site managers

### Example 2: Chemical Spill Near-Miss - Lithium Processing Plant, Antofagasta Region

**Incident:**
- Overflow of sulfuric acid from intermediate storage tank during batch transfer
- ~200 liters overflowed into bund; no personnel injuries; no environmental release beyond bund
- Potential: Loss of containment beyond bund reaching drainage channel to salt flat (major environmental incident, SMA-reportable)

**Investigation (ICAM Level 3 - Formal, escalated due to high potential):**
- Absent/Failed Defenses: High-level alarm bypassed during previous batch (maintenance tag); independent high-high alarm not installed (design gap); operator reliance on visual level indication
- Individual/Team Actions: Operator left transfer unattended to assist with another task; did not verify alarm status before starting transfer
- Task/Environmental Conditions: Simultaneous tasks requiring operator attention; batch transfer procedure did not specify continuous attendance; shift handover did not communicate alarm bypass status
- Organizational Factors: Alarm management procedure did not require formal approval for bypass; staffing level insufficient for simultaneous operations; shift handover protocol inadequate for safety-critical information; Management of Change (MOC) not applied to alarm bypass

**Corrective Actions (10 actions):**
1. [Engineering] Install independent LAHH with automatic transfer shutdown on all acid storage tanks -- Priority: Critical, Due: 45 days
2. [Administrative] Implement formal alarm bypass management procedure requiring supervisor approval, time limit, and compensating measures -- Priority: Critical, Due: 14 days
3. [Administrative] Update batch transfer procedure to require continuous operator attendance until automatic shutdown is confirmed -- Priority: Critical, Due: 7 days
4. [Administrative] Revise shift handover protocol to include mandatory communication of all active alarm bypasses and safety-critical status changes -- Priority: High, Due: 14 days
5. [Organizational] Conduct staffing review for simultaneous operations to ensure adequate coverage -- Priority: High, Due: 30 days
6. [Engineering] Install bund level monitoring with alarm to control room for all chemical storage bunds -- Priority: Medium, Due: 60 days
7. [Administrative] Apply MOC process retroactively to all current alarm bypasses and establish MOC trigger for future bypasses -- Priority: High, Due: 21 days
8. [Administrative] Brief all operators on alarm management requirements and bypass risks -- Priority: Critical, Due: 7 days
9. [Organizational] Conduct alarm rationalization study for the entire acid plant area -- Priority: Medium, Due: 90 days
10. [Administrative] Conduct environmental spill response drill specifically for acid storage area -- Priority: High, Due: 30 days

**Trend Analysis Insight:**
- This is the 3rd alarm bypass-related near-miss in 6 months across the company
- Pattern indicates systemic weakness in alarm management governance
- Recommendation: Corporate-wide alarm management standard development (escalated to VP Operations)
