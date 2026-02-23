# Generate Lessons Learned

## Skill ID: Q-03
## Version: 1.0.0
## Category: Q. Knowledge Management
## Priority: P1 - High

---

## Purpose

Generate structured, actionable lessons learned reports from project data, operational events, incident investigations, and team input, ensuring that organizational knowledge from both successes and failures is captured, validated, disseminated, and most critically -- applied to prevent recurrence of problems and replicate successes. This skill implements a complete lessons learned lifecycle from identification through to verified closure of resulting actions.

The imperative for effective lessons learned management is starkly illustrated by industry data: 60-70% of incidents in industrial operations are recurrences of previously identified problems (Pain Point MT-03, CCPS "Guidelines for Investigating Process Safety Incidents," 2019; Energy Institute "Hearts and Minds" research). This recurrence rate means that organizations are suffering the same consequences -- injuries, environmental releases, production losses, equipment damage -- repeatedly, despite having experienced and (often) documented the problem before. The knowledge existed to prevent the recurrence, but it was not effectively captured, disseminated, or applied.

The root causes of this knowledge failure are well-understood:
- **Lessons are captured but not disseminated**: Reports are filed in SharePoint libraries where they are never read by the people who need them. A 2023 APQC study found that only 18% of lessons learned are ever accessed after initial filing.
- **Lessons lack specificity**: Vague lessons like "improve communication" or "follow procedures" provide no actionable guidance. They cannot be implemented because they do not describe a specific change to a specific process.
- **No action tracking**: Lessons identify changes needed but no one is assigned to implement them, no deadline is set, and no follow-up occurs. The lesson becomes a documented intention rather than an implemented improvement.
- **No contextual delivery**: Even when lessons are well-documented, they are not surfaced at the moment of relevance. A project team repeating an activity does not receive lessons from the previous team that performed the same activity.
- **No feedback loop**: There is no mechanism to verify whether a lesson was actually applied and whether the intended outcome was achieved.

This skill addresses all five failures by implementing a structured lessons learned process that produces specific, actionable lessons with assigned actions, tracks implementation to closure, disseminates lessons through contextual delivery (via deliver-contextual-knowledge Q-02), and verifies effectiveness through a feedback loop.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | Q-03                                                                                        |
| **Agent**              | Agent 12 -- Knowledge Management Curator                                                     |
| **Domain**             | Knowledge Management                                                                         |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Per session: 2-4 hours; Per project closure: 2-5 days; Ongoing: continuous capture            |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | MT-03: 60-70% recurrence rate for previously identified incidents and problems (CCPS, Energy Institute) |
| **Secondary Pain**     | H-03: $31.5B annual loss from failure to share knowledge effectively (IDC, 2023)             |
| **Value Created**      | 30-50% reduction in incident recurrence; 20-30% reduction in project repeat mistakes; accelerated organizational learning |

### Functional Intent

This skill SHALL:

1. **Facilitate structured lessons learned capture** from multiple sources: incident investigations, project milestones, operational events, audits, near-misses, and team retrospectives.
2. **Generate standardized lessons learned reports** with specific, actionable content including: what happened, why it happened, what should be done differently, and who is responsible for implementation.
3. **Classify and index lessons** using the organizational knowledge taxonomy (from capture-and-classify-knowledge Q-01) for searchable retrieval.
4. **Create and track corrective actions** arising from each lesson, with assigned owners, deadlines, and verification criteria.
5. **Disseminate lessons** to relevant audiences through targeted distribution (via mcp-outlook), knowledge base publication (via mcp-sharepoint), and contextual delivery triggers (via deliver-contextual-knowledge Q-02).
6. **Maintain a searchable lessons learned database** that supports query by topic, asset type, project phase, event type, and date range.
7. **Verify effectiveness** by tracking whether lessons were applied and whether recurrence was prevented.
8. **Generate periodic lessons learned summary reports** for management showing capture rates, application rates, and recurrence prevention metrics.

---

## Trigger / Invocation

### Direct Invocation

```
/generate-lessons-learned --source [incident|project|operational|audit|retrospective] --scope [single|batch|project-closure] --project [name]
```

### Command Variants
- `/generate-lessons-learned incident --ref [incident_id]` -- Generate LL from incident investigation
- `/generate-lessons-learned project-closure --project [name]` -- Comprehensive project closure LL
- `/generate-lessons-learned retrospective --team [team_name] --topic [topic]` -- Team retrospective LL
- `/generate-lessons-learned search --topic [keywords] --asset [type] --period [range]` -- Search existing LL
- `/generate-lessons-learned status --project [name]` -- Status of LL actions and application
- `/generate-lessons-learned summary --period [monthly|quarterly|annual]` -- Management summary

### Aliases
- `/lessons-learned`, `/ll-report`, `/capture-lessons`, `/lecciones-aprendidas`

### Contextual Triggers
- Incident investigation completed (automatic LL generation from investigation report)
- Project gate review completed (LL capture for the phase)
- Project closeout initiated (comprehensive LL capture process)
- Audit completed (LL from audit findings)
- Near-miss reported (rapid LL capture)
- Teams channel message tagged with #lesson-learned or #leccion-aprendida
- Operational event with significant impact (production loss >$100K, safety event, environmental event)
- Commissioning milestone reached (LL from commissioning phase)
- Quarterly LL review cycle (aggregate analysis of lessons captured in the period)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `lesson_source` | enum | User / Automatic trigger | Source type: incident, project, operational, audit, retrospective, near-miss |
| `event_description` | text / .docx | User / Investigation report / mcp-sharepoint | Description of what happened -- the event, situation, or project experience |
| `project_context` | text | User / Project config | Project name, phase, system, and team for contextual classification |

### Conditional Inputs (by source type)

| Input | Type | Source | Condition | Description |
|-------|------|--------|-----------|-------------|
| `incident_report` | .docx / .pdf | HSE system / mcp-sharepoint | Source = incident | Formal incident investigation report with root causes and recommendations |
| `project_milestone_report` | .docx | Project manager / mcp-sharepoint | Source = project | Project milestone report or phase completion summary |
| `audit_report` | .docx | Auditor / mcp-sharepoint | Source = audit | Audit findings report with observations and non-conformances |
| `retrospective_notes` | .docx / text | Team / mcp-teams | Source = retrospective | Team retrospective session notes (what worked, what didn't, what to change) |
| `near_miss_report` | .docx / form | HSE system / mcp-sharepoint | Source = near-miss | Near-miss report form with description and contributing factors |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `related_lessons` | .xlsx / JSON | LL database (mcp-sharepoint) | Previous lessons on same topic/asset for linkage and recurrence detection |
| `team_input` | text / survey | mcp-teams / mcp-forms | Individual team member perspectives gathered via survey |
| `supporting_data` | .xlsx / .pdf | Various | Performance data, photos, drawings supporting the lesson |
| `stakeholder_list` | .xlsx | mcp-sharepoint | Stakeholders who should receive the lesson |
| `distribution_scope` | enum | User | site, business_unit, company, industry |

### Input Validation Rules

```yaml
validation:
  event_description:
    min_length: 100  # Minimum 100 characters to ensure sufficient detail
    must_contain: ["what happened OR que paso", "outcome OR resultado"]
  incident_report:
    must_contain_sections: ["root_cause_analysis", "recommendations", "corrective_actions"]
    checks:
      - "At least 1 root cause identified"
      - "At least 1 corrective action defined"
  project_context:
    required_fields: ["project_name", "phase", "date"]
  lesson_source:
    allowed: ["incident", "project", "operational", "audit", "retrospective", "near_miss", "commissioning"]
```

---

## Output Specification

### Deliverable 1: Lessons Learned Report (.docx)

**Filename**: `{ProjectCode}_LL_Report_{LessonID}_v{Version}_{YYYYMMDD}.docx`

**Structure**:

1. **Lesson Header**
   - Lesson ID: LL-{Year}-{Sequence} (e.g., LL-2026-0042)
   - Title: Concise, descriptive title (e.g., "SAG Mill Bearing Failure During Startup Due to Inadequate Alignment Verification")
   - Source: Incident / Project / Operational / Audit / Retrospective
   - Date of Event: Date the situation occurred
   - Project/Site: Where it happened
   - System/Asset: Equipment or process involved
   - Severity: Critical / High / Medium / Low
   - Classification: Safety / Reliability / Quality / Schedule / Cost / Management

2. **Context** (What was the situation?)
   - Background and operational context
   - What was being done at the time
   - Who was involved
   - What conditions existed

3. **Event Description** (What happened?)
   - Factual description of the event or experience
   - Timeline of events (if applicable)
   - Immediate consequences (safety, production, cost, environmental)
   - Photos or diagrams (if available)

4. **Root Cause Analysis** (Why did it happen?)
   - Physical/technical root cause
   - Human factors root cause
   - Organizational/systemic root cause
   - Contributing factors
   - RCA methodology used (5-Why, Fishbone, Fault Tree, etc.)

5. **Lesson Statement** (What should be done differently?)
   - Clear, specific, actionable statement
   - Written as a positive directive (what TO DO, not what NOT to do)
   - Applicable scope: when and where does this lesson apply?
   - Example of correct application

6. **Corrective Actions**
   | Action ID | Description | Owner | Due Date | Status | Verification Criteria |
   |-----------|-------------|-------|----------|--------|---------------------|
   | LL-2026-0042-A01 | Revise bearing alignment verification procedure to include laser alignment check | Reliability Engineer | 2026-04-15 | Open | Procedure updated, approved, and implemented |
   | LL-2026-0042-A02 | Add alignment verification to PSSR checklist for all rotating equipment | Commissioning Lead | 2026-03-30 | Open | PSSR template updated and used on next startup |
   | LL-2026-0042-A03 | Brief all commissioning teams on bearing alignment requirements | Training Coordinator | 2026-03-15 | Open | Briefing completed, attendance records filed |

7. **Applicability and Distribution**
   - Who needs to know this lesson?
   - What projects/sites/teams should receive it?
   - What activities should trigger recall of this lesson?
   - Keywords for searchability
   - Related lessons (links to similar/connected lessons)

8. **Verification and Effectiveness**
   - How will we verify the lesson was applied?
   - What metric will show recurrence prevention?
   - Review date for effectiveness assessment

### Deliverable 2: Lessons Learned Database Entry (JSON / mcp-sharepoint)

```json
{
  "lesson_id": "LL-2026-0042",
  "title": "SAG Mill Bearing Failure During Startup Due to Inadequate Alignment Verification",
  "source_type": "incident",
  "source_ref": "INC-2026-015",
  "event_date": "2026-02-10",
  "capture_date": "2026-02-14",
  "project": "Sierra Verde Copper Expansion",
  "site": "Sierra Verde Mine",
  "system": "200 - Grinding Circuit",
  "asset_tags": ["SAG-ML-002"],
  "severity": "high",
  "classification": ["reliability", "commissioning"],
  "lifecycle_phase": "commissioning",
  "lesson_statement": "All rotating equipment with bearings >100mm shaft diameter must undergo laser alignment verification as a mandatory step in the commissioning procedure, with documented acceptance criteria of <0.002 inches misalignment, before being authorized for operation.",
  "root_causes": {
    "physical": "Main bearing misalignment exceeded tolerance (0.005 inches vs. 0.002 inch limit)",
    "human": "Alignment was checked visually but not verified with laser alignment tool; commissioning procedure did not require laser alignment",
    "organizational": "Commissioning procedure was generic and did not specify alignment verification method for large rotating equipment"
  },
  "consequences": {
    "safety": "None (equipment protection systems activated)",
    "production": "312 hours downtime, 593,400 tons lost production",
    "cost": "$1,850,000 (repair + production loss)",
    "environmental": "None"
  },
  "actions": [
    {
      "action_id": "LL-2026-0042-A01",
      "description": "Revise bearing alignment verification procedure to include laser alignment check",
      "owner": "J. Martinez, Reliability Engineer",
      "due_date": "2026-04-15",
      "status": "open",
      "verification": "Procedure updated, approved, and implemented"
    }
  ],
  "applicability": {
    "asset_types": ["SAG mills", "ball mills", "large pumps", "compressors", "fans"],
    "lifecycle_phases": ["commissioning", "post-maintenance-startup"],
    "trigger_activities": ["bearing replacement", "coupling alignment", "motor replacement", "PSSR"],
    "distribution_scope": "company"
  },
  "taxonomy": ["Maintenance", "Reliability", "Rotating Equipment", "Alignment", "Commissioning", "Startup"],
  "keywords": ["bearing", "alignment", "misalignment", "laser alignment", "startup", "commissioning", "SAG mill", "rotating equipment"],
  "related_lessons": ["LL-2024-0018", "LL-2025-0055"],
  "effectiveness": {
    "metric": "Bearing failure rate within 6 months of commissioning/major maintenance",
    "baseline": "2 failures per year",
    "target": "0 failures per year",
    "review_date": "2026-08-15",
    "status": "pending"
  },
  "metadata": {
    "author": "Agent 12 - Knowledge Management",
    "reviewer": "Carlos Mendoza, Senior Reliability Engineer",
    "approved_by": "Operations Manager",
    "version": "1.0",
    "last_updated": "2026-02-14",
    "language": "en",
    "confidentiality": "internal"
  }
}
```

### Deliverable 3: Project Closure Lessons Learned Report (.docx)

**Filename**: `{ProjectCode}_LL_Project_Closure_v{Version}_{YYYYMMDD}.docx`

Comprehensive project closure report (15-30 pages) structured by project phase and domain:

1. Executive Summary (2 pages)
   - Project overview and key performance indicators
   - Top 10 lessons (5 positive, 5 corrective)
   - Total lessons captured: X (Y critical, Z high, W medium)
   - Actions: X total, Y completed, Z in progress, W open
   - Recommendations for future projects

2. Lessons by Project Phase (10-15 pages)
   - Front-End Engineering & Design (FEED)
   - Detailed Engineering
   - Procurement
   - Construction
   - Commissioning & Startup
   - Ramp-Up
   - Each phase: what worked well, what didn't, specific lessons, actions

3. Lessons by Domain (5-10 pages)
   - Operations readiness
   - Maintenance preparedness
   - HSE and process safety
   - People and organization
   - Technology and systems
   - Vendor and contractor management
   - Documentation and knowledge management

4. Action Register (2-3 pages)
   - All corrective actions with owners and status
   - Priority classification for future project application
   - Implementation timeline

5. Appendices
   - Detailed lesson cards for all captured lessons
   - Team input summary (retrospective results)
   - Performance data supporting lessons

### Deliverable 4: Lessons Learned Summary Dashboard (Power BI or Excel)

**Dashboard Components:**
- Total lessons captured (cumulative, by period, by source)
- Lessons by severity and classification (stacked bar)
- Action completion rate (gauge with trend)
- Recurrence tracking (incidents that repeated vs. lessons that should have prevented them)
- Lessons by project phase and domain (heat map)
- Top lessons by applicability (most broadly relevant)
- Search interface for lesson database
- Lesson capture rate trend (lessons per month, target overlay)

---

## Methodology & Standards

### Lessons Learned Capture Process

The skill follows a structured 7-step lessons learned process based on best practices from the US Army's Center for Army Lessons Learned (CALL), NASA's Lessons Learned system, and the CCPS process safety lessons learned framework:

```
1. IDENTIFY: Recognize that a learning opportunity exists
   Triggers: incident, near-miss, audit finding, project milestone, success, problem

2. COLLECT: Gather all relevant data and perspectives
   Sources: reports, data, interviews, observations, team retrospectives

3. ANALYZE: Determine root causes and derive actionable insights
   Methods: 5-Why, Fishbone, Fault Tree, Timeline Analysis

4. DOCUMENT: Write the lesson in standard format with specificity and actionability
   Quality test: Could someone who wasn't involved understand and apply this?

5. VALIDATE: Subject matter expert review confirms accuracy and relevance
   Required: At least one SME and one management approver

6. DISSEMINATE: Deliver to everyone who needs it through multiple channels
   Channels: email, knowledge base, contextual delivery, training, briefings

7. VERIFY: Confirm the lesson was applied and prevented recurrence
   Evidence: action closure, procedure update, training completion, KPI improvement
```

### Lesson Quality Standards

A high-quality lesson must pass the "5 Cs" test:

| Criterion | Description | Test Question |
|-----------|-------------|---------------|
| **Concrete** | Describes specific events, equipment, conditions -- not abstractions | Can you visualize exactly what happened? |
| **Causal** | Identifies root causes, not just symptoms | Does it answer "why?" at least 3 levels deep? |
| **Corrective** | Specifies exactly what to do differently | Could someone implement this without further clarification? |
| **Contextual** | Defines when and where the lesson applies | Would the right person find this at the right time? |
| **Confirmed** | Validated by SME and tracked to implementation | Has an expert confirmed accuracy? Is there an action plan? |

**Anti-patterns (low-quality lessons to reject):**
- "Improve communication" -- What communication? Between whom? About what? How?
- "Follow procedures" -- Which procedure? Why wasn't it followed? What needs to change?
- "Plan better" -- What aspect of planning? What was missing? What tool or process would help?
- "Allow more time" -- How much more? For what activity? What caused the time shortage?

### Recurrence Prevention Framework

The skill tracks lesson effectiveness through a recurrence prevention model:

```
For each lesson:
  1. Define the FAILURE MODE the lesson addresses
  2. Define the BARRIER the lesson establishes (procedure change, design change, training, etc.)
  3. Track BARRIER IMPLEMENTATION (action completion)
  4. Monitor RECURRENCE: has the same or similar failure mode occurred since the barrier was implemented?
  5. Calculate PREVENTION RATE: (similar opportunities - recurrences) / similar opportunities

Target: >90% prevention rate (i.e., <10% recurrence after lesson applied)
```

### Industry Statistics on Lessons Learned

| Statistic | Source | Year |
|-----------|--------|------|
| 60-70% of incidents are recurrences of known problems | CCPS / Energy Institute | 2019 |
| Only 18% of lessons learned are ever accessed after filing | APQC | 2023 |
| Organizations with effective LL: 32% fewer incidents | Dupont Safety Resources | 2022 |
| Average project repeats 25-35% of previous project mistakes | CII (Construction Industry Institute) | 2020 |
| 85% of lessons learned are too vague to implement | NASA Lessons Learned program analysis | 2021 |
| Cost of not learning: $3.1M per incident recurrence (average) | Marsh / Munich Re | 2023 |
| Effective LL programs reduce project cost overrun by 15-20% | IPA (Independent Project Analysis) | 2022 |
| Time to capture LL degrades after 30 days (memory decay) | Ebbinghaus forgetting curve research | Classic |

### Standards Applied

- **CCPS "Guidelines for Investigating Process Safety Incidents"** -- Incident LL methodology
- **ISO 30401:2018** -- Knowledge management systems requirements (LL as a KMS component)
- **PMI PMBOK 7th Edition** -- Project lessons learned process
- **NASA/SP-2012-605** -- NASA Lessons Learned Process
- **IAEA Safety Standards** -- Learning from events in nuclear industry (applicable methodology)
- **US Army CALL (Center for Army Lessons Learned)** -- Structured LL capture and dissemination
- **APQC Knowledge Management Framework** -- LL as a KM process area

---

## Step-by-Step Execution

### Phase 1: Lesson Identification and Data Collection (Steps 1-4)

**Step 1: Receive Trigger and Determine Scope**
- Identify lesson source: incident report, project milestone, audit finding, team retrospective, near-miss, operational event
- Determine capture scope:
  - Single lesson: one specific event or experience
  - Batch: multiple lessons from a project phase or event
  - Project closure: comprehensive all-phase, all-domain lesson capture
- Identify participants:
  - Who was involved in the event/experience?
  - Who are the subject matter experts for validation?
  - Who are the stakeholders for distribution?
- Set timeline: LL capture should occur within 30 days of the event (memory decay begins immediately)

**Step 2: Gather Source Material**
- For incident-sourced lessons:
  - Retrieve incident investigation report from mcp-sharepoint or HSE system
  - Extract root causes, contributing factors, and recommendations
  - Review corrective actions already assigned
  - Check for similar previous incidents (recurrence detection)
- For project-sourced lessons:
  - Retrieve project milestone reports and status data
  - Review project KPIs: cost, schedule, quality, safety performance
  - Identify variances from plan and their causes
  - Collect project team retrospective input
- For operational-sourced lessons:
  - Retrieve operational data from relevant period (KPIs from S-01)
  - Review work orders, downtime events, and process data
  - Gather operator and supervisor observations
- For audit-sourced lessons:
  - Retrieve audit report with findings and observations
  - Classify findings by severity and systemic nature
  - Identify repeat findings from previous audits

**Step 3: Facilitate Team Input Collection**
- For project closure or retrospective lessons:
  - Distribute structured questionnaire via mcp-teams or mcp-outlook:
    - "What worked well that should be repeated?"
    - "What did not work well that should be changed?"
    - "What would you do differently if starting over?"
    - "What knowledge was missing that caused problems?"
    - "What tools, processes, or resources were inadequate?"
  - Conduct facilitated team retrospective session (if applicable):
    - Start-Stop-Continue framework
    - Timeline exercise (walk through project phases, identify key moments)
    - Anonymous input for sensitive topics
  - Compile individual and team inputs into consolidated themes
- For incident lessons:
  - Interview key witnesses (if not already covered in investigation)
  - Gather perspectives from different disciplines (operations, maintenance, engineering, HSE)
  - Identify any perspectives not captured in the formal investigation

**Step 4: Analyze Root Causes and Derive Insights**
- For each identified issue or experience:
  - Apply appropriate RCA methodology:
    - 5-Why: for straightforward causal chains
    - Fishbone/Ishikawa: for multi-factor analysis
    - Fault Tree: for complex failure scenarios
    - Timeline Analysis: for event sequences
  - Determine root cause depth:
    - Physical root cause (what broke, what malfunctioned, what was missing)
    - Human root cause (what error, what skill gap, what procedure gap)
    - Organizational root cause (what management system failure, what cultural factor, what resource constraint)
  - Quantify consequences:
    - Safety impact (injuries, potential injuries, near-miss severity)
    - Production impact (downtime hours, tons lost, revenue impact)
    - Cost impact (repair cost, expediting cost, penalty cost)
    - Schedule impact (days delayed)
  - Identify the generalizable lesson (not just specific to this event, but applicable broadly)

### Phase 2: Lesson Documentation (Steps 5-8)

**Step 5: Write Lesson Statements**
- For each identified lesson, write a lesson statement that passes the 5 Cs test:
  - **Concrete**: Reference specific equipment types, procedures, conditions
  - **Causal**: Explain why the standard approach failed
  - **Corrective**: State exactly what should be done differently
  - **Contextual**: Define when and where this lesson applies
  - **Confirmed**: Identify who can validate this lesson
- Examples of good vs. poor lesson statements:
  - POOR: "Ensure alignment is checked before startup"
  - GOOD: "All rotating equipment with bearings >100mm shaft diameter must undergo laser alignment verification (acceptance: <0.002 inches) as a mandatory commissioning step before startup authorization. Visual alignment alone is insufficient for equipment above this threshold."
  - POOR: "Improve vendor communication"
  - GOOD: "Vendor data sheet submissions must be validated against P&ID design parameters within 5 business days of receipt. Assign a discipline engineer as single point of accountability for each vendor, with weekly status reports to the document controller."

**Step 6: Define Corrective Actions**
- For each lesson, define specific corrective actions:
  - Action description: exactly what needs to change (procedure, design, training, tool, process)
  - Owner: named individual (not a role or department)
  - Due date: specific date (not "ASAP" or "when convenient")
  - Verification criteria: how will we confirm the action is complete and effective?
  - Priority: Critical (must complete before next similar activity), High (within 30 days), Medium (within 90 days), Low (within 180 days)
- Validate actions are implementable:
  - Does the owner have authority and resources?
  - Is the timeline realistic?
  - Are there dependencies on other actions or approvals?
  - Is there a risk of the action creating new problems?
- Register actions in tracking system (mcp-airtable or mcp-sharepoint list)

**Step 7: Classify and Index the Lesson**
- Apply knowledge taxonomy (from capture-and-classify-knowledge Q-01):
  - Domain: maintenance, operations, safety, engineering, management, procurement, etc.
  - Asset type: specific equipment categories the lesson applies to
  - Lifecycle phase: FEED, detailed engineering, procurement, construction, commissioning, operations
  - Event type: failure, near-miss, audit finding, project variance, success
  - Severity: critical, high, medium, low
- Add keywords for searchability (minimum 5 keywords per lesson)
- Link to related lessons:
  - Previous similar lessons (for recurrence detection)
  - Complementary lessons (different aspects of the same topic)
  - Superseded lessons (if this lesson updates a previous one)
- Set applicability triggers:
  - What activities, equipment types, or project phases should trigger recall of this lesson?
  - These triggers are used by deliver-contextual-knowledge (Q-02) for proactive delivery

**Step 8: Validate with Subject Matter Experts**
- Route lesson to identified SME(s) for validation:
  - Send lesson draft via mcp-teams or mcp-outlook for review
  - SME validates: factual accuracy, root cause correctness, action appropriateness, lesson applicability
  - SME may: approve as-is, suggest modifications, reject with rationale
- Route to management approver:
  - Validates: actions are resourced, distribution scope is appropriate, no confidentiality concerns
  - Approves for publication and dissemination
- Update lesson status: Draft -> Validated -> Approved
- Target turnaround: validation within 5 business days of submission

### Phase 3: Dissemination and Integration (Steps 9-12)

**Step 9: Publish to Lessons Learned Database**
- Create lesson record in mcp-sharepoint lessons learned library:
  - Full lesson document (.docx)
  - Metadata (all classification and indexing fields)
  - Action records linked to lesson
  - Supporting documents (investigation report, data, photos)
- Create/update lesson in searchable database:
  - Ensure lesson appears in search results for all classified keywords and taxonomy terms
  - Link to related lessons (bidirectional links)
  - Set expiration/review date (default: 5 years, critical lessons: 10 years)
- Notify capture-and-classify-knowledge (Q-01) of new knowledge item for integration into broader knowledge base

**Step 10: Distribute to Targeted Audiences**
- Determine distribution based on applicability:
  - Immediate team: all individuals involved in the event
  - Functional community: all personnel in the relevant discipline/function
  - Site: all personnel at the same facility
  - Business unit: all facilities in the business unit
  - Company: all facilities company-wide
  - Industry: published through industry sharing mechanisms (if approved)
- Execute distribution via mcp-outlook:
  - Send lesson summary email with link to full report in mcp-sharepoint
  - Include: lesson title, event date, severity, lesson statement, key actions, applicability
  - Request read confirmation for critical lessons
- Post in relevant mcp-teams channels:
  - Project team channel
  - Discipline/function channels (e.g., #reliability, #safety, #commissioning)
  - Knowledge sharing channel (#lessons-learned)
- Register with deliver-contextual-knowledge (Q-02):
  - Set trigger conditions for future contextual delivery
  - When someone starts a similar activity, the lesson will be proactively surfaced

**Step 11: Integrate into Procedures and Training**
- For lessons requiring procedure changes:
  - Notify generate-operating-procedures (DOC-02) of required procedure updates
  - Track procedure update as a corrective action
  - Verify updated procedure references the lesson learned
- For lessons requiring training updates:
  - Notify plan-training-program (M-04) of training content updates needed
  - Create lesson learned briefing material for toolbox talks
  - Add to new employee onboarding material (if broadly applicable)
- For lessons requiring design standard changes:
  - Notify engineering team of recommended design standard update
  - Track standard update as a corrective action

**Step 12: Configure Recurrence Monitoring**
- For each lesson:
  - Define the failure mode or problem the lesson addresses
  - Define the monitoring method (KPI tracking, incident reporting, audit checking)
  - Set baseline: frequency/severity before lesson implementation
  - Set target: expected frequency/severity after lesson implementation
  - Schedule effectiveness review date (typically 6-12 months after all actions completed)
- Register monitoring with calculate-operational-kpis (S-01) or track-incident-learnings (COMP-02) as appropriate

### Phase 4: Action Tracking and Effectiveness Verification (Steps 13-16)

**Step 13: Track Corrective Action Implementation**
- For each corrective action in the register:
  - Monitor progress against due date
  - Send reminders at T-14 days, T-7 days, and T-1 day before due date (via mcp-outlook)
  - If overdue: escalate to action owner's manager
  - If overdue >14 days: escalate to site/project management
  - When completed: collect evidence of completion (procedure revision, training records, photos)
  - Verify completion meets the verification criteria defined in Step 6
  - Update action status: Open -> In Progress -> Complete -> Verified
- Generate weekly action tracking report for management visibility

**Step 14: Verify Lesson Application**
- At the scheduled effectiveness review date:
  - Check: were all corrective actions completed? (If not, why not?)
  - Check: has the lesson been applied in subsequent similar activities?
  - Check: has recurrence occurred since lesson implementation?
  - If recurrence occurred: analyze why the lesson did not prevent it
    - Was the lesson not disseminated to the right people?
    - Was the lesson disseminated but not applied?
    - Was the corrective action inadequate?
    - Were there different root causes for the recurrence?
  - Update lesson effectiveness status: Effective / Partially Effective / Ineffective
  - If Ineffective: initiate enhanced lesson and action development

**Step 15: Generate Management Summary Reports**
- Monthly: lessons learned activity summary
  - Lessons captured this month: count by source, severity, domain
  - Actions: new, completed, overdue
  - Recurrence events detected
- Quarterly: comprehensive lessons learned analytics
  - Capture rate trend (lessons per month vs. target)
  - Action completion rate and aging
  - Recurrence rate vs. baseline
  - Top themes across lessons (what are we repeatedly learning about?)
  - Knowledge dissemination effectiveness (% of lessons accessed, % applied)
  - ROI of lessons learned program (prevented recurrence value)
- Annual: lessons learned program effectiveness report
  - Year-over-year recurrence rate trend
  - Total prevented cost (estimated from prevented recurrences)
  - Program maturity assessment
  - Recommendations for program improvement

**Step 16: Maintain and Evolve Lesson Database**
- Periodic database maintenance:
  - Archive lessons that have exceeded their review date without recurrence (effectiveness confirmed)
  - Update lessons that have been superseded by newer knowledge
  - Merge duplicate or highly similar lessons
  - Review and refresh keyword indexing for search optimization
- Evolve capture process based on feedback:
  - Survey lesson users: "Did you find the lesson useful? Did you apply it?"
  - Analyze search patterns: what are people looking for but not finding?
  - Identify capture gaps: what types of events are not generating lessons?
  - Adjust triggers and prompts to improve capture coverage

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Lesson Specificity | Lessons passing 5 Cs quality test (peer review) | >90% | >80% |
| Capture Timeliness | Lessons captured within 30 days of event | >90% | >75% |
| Action Completion Rate | Actions completed by due date | >85% | >70% |
| Action Overdue Aging | Average overdue days for open actions | <7 days | <14 days |
| SME Validation Rate | Lessons validated by SME before publication | 100% | >95% |
| Dissemination Reach | Lessons delivered to all applicable audiences | >95% | >85% |
| Search Relevance | Search returns relevant lesson in top 5 results | >90% | >80% |
| Recurrence Prevention | Recurrence rate after lesson implementation | <15% | <25% |
| Lesson Capture Rate | Lessons captured per significant event | >80% | >60% |
| Database Currency | Lessons reviewed within expiration period | >90% | >80% |
| User Satisfaction | "Lessons are useful and actionable" (survey) | >4.0/5.0 | >3.5/5.0 |
| Application Rate | Lessons that were demonstrably applied | >70% | >50% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `track-incident-learnings` (COMP-02) | Incident investigation reports and findings | Critical |
| `generate-performance-report` (S-03) | Performance data supporting lessons (trends, events) | High |
| `capture-and-classify-knowledge` (Q-01) | Knowledge taxonomy for lesson classification | High |
| `analyze-failure-patterns` (MAINT-03) | Failure analysis data for reliability lessons | High |
| `orchestrate-or-program` (H-01) | Project milestones triggering phase LL capture | Medium |
| `prepare-pssr-package` (DOC-04) | PSSR findings as source for commissioning lessons | Medium |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `deliver-contextual-knowledge` (Q-02) | Lessons with trigger conditions for contextual delivery | On lesson publication |
| `maintain-knowledge-currency` (Q-04) | Lesson records for currency management | Continuous |
| `capture-and-classify-knowledge` (Q-01) | Lesson documents as knowledge items | On lesson publication |
| `generate-operating-procedures` (DOC-02) | Procedure change requirements from lessons | On action requiring procedure update |
| `plan-training-program` (M-04) | Training content updates from lessons | On action requiring training update |
| `design-quality-gate` (F-06) | Lesson patterns for quality gate criteria | Quarterly |

---

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Lessons learned database storage, document management, and distribution"
capabilities:
  - Store lesson documents and metadata in lessons learned library
  - Manage searchable database with taxonomy-based navigation
  - Track action items in SharePoint lists
  - Maintain version control for lesson updates
  - Provide search API for lesson retrieval
  - Store supporting documents (investigation reports, data, photos)
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 2: Retrieve source documents (incident reports, audit reports)
  - Step 9: Publish lessons to database
  - Step 10: Store distribution records
  - Step 13: Track actions in SharePoint list
  - Step 16: Maintain and archive lesson database
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Team retrospective facilitation, lesson dissemination, and knowledge sharing"
capabilities:
  - Post lesson summaries to relevant channels
  - Facilitate retrospective discussions via structured threads
  - Monitor #lesson-learned tagged messages for capture triggers
  - Send review requests to SMEs
  - Coordinate team input collection
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Facilitate team retrospective input collection
  - Step 8: Route lessons to SMEs for validation
  - Step 10: Post lessons to relevant channels for dissemination
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Lesson distribution, action reminders, and stakeholder notifications"
capabilities:
  - Send lesson summary emails to targeted distribution lists
  - Send action reminders and escalation notifications
  - Send questionnaires for team input collection
  - Track email delivery for critical lessons
  - Schedule recurring management summary reports
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Distribute team input questionnaires
  - Step 10: Send lessons to targeted audiences
  - Step 13: Send action reminders and escalation emails
  - Step 15: Distribute management summary reports
```

---

## Templates & References

### Lesson Learned Email Distribution Template

```
Subject: [LESSON LEARNED - {Severity}] {Title} | LL-{ID}
From: OR Knowledge Management <or-km@vsc.cl>
To: {Distribution List}

=================================================================
LESSONS LEARNED ALERT
=================================================================

Lesson ID:    LL-{Year}-{Sequence}
Severity:     {Critical/High/Medium/Low}
Source:        {Incident/Project/Operational/Audit}
Date:         {Event Date}
Project/Site: {Location}
Equipment:    {Asset Tags}

LESSON STATEMENT:
{Clear, specific, actionable lesson statement}

WHAT HAPPENED:
{Brief event description in 3-5 sentences}

ROOT CAUSE:
{Brief root cause summary}

ACTIONS REQUIRED:
{List of actions with owners and dates}

APPLICABILITY:
This lesson applies when: {trigger conditions}
Asset types: {equipment categories}
Project phases: {lifecycle phases}

Full report: {SharePoint link}
Related lessons: {links}

=================================================================
Please confirm you have read and understood this lesson.
If this lesson affects your current work, contact {owner} to discuss.
=================================================================
```

### Project Closure Retrospective Questionnaire

```markdown
## Project Lessons Learned -- Team Retrospective
## Project: {Project Name}  |  Phase: {Phase}

Thank you for contributing to our lessons learned process. Your input
helps prevent repeat problems and replicate successes on future projects.

### Section 1: What Worked Well (Please be specific)
1. What was the biggest success or positive outcome in this project phase?
2. What process, tool, or practice worked particularly well?
3. What should we definitely repeat on the next project?

### Section 2: What Did Not Work Well (Please be specific)
4. What was the biggest challenge or problem in this project phase?
5. What caused the most rework, delays, or frustration?
6. What process, tool, or practice was inadequate?

### Section 3: Recommendations
7. If you could change one thing about how this phase was executed, what would it be?
8. What knowledge or information was missing that would have helped?
9. What training or skills development would have improved outcomes?

### Section 4: Knowledge to Preserve
10. What critical knowledge from this project should be documented for future teams?
11. Who on this team holds unique knowledge that should be captured before team dispersal?

Please submit responses by {date}. Responses will be compiled anonymously.
```

### Reference Documents
- CCPS "Guidelines for Investigating Process Safety Incidents" (3rd Ed.)
- NASA/SP-2012-605 "NASA Lessons Learned Process"
- PMI PMBOK 7th Edition -- Lessons Learned Practice Guide
- ISO 30401:2018 -- Knowledge management systems requirements
- US Army CALL Handbook "Establishing a Lessons Learned Program"
- APQC "Lessons Learned Best Practices" (2023)
- Energy Institute "Hearts and Minds: Learning from Incidents"
- CII (Construction Industry Institute) -- Project lessons learned research

---

## Examples

### Example 1: Incident-Sourced Lesson Learned

```
Trigger: Incident investigation completed (INC-2026-015)

Process:
  1. Source Material:
     - Incident report received from mcp-sharepoint
     - Event: SAG Mill #2 bearing failure during commissioning startup
     - Root cause: Misalignment not verified with laser tool
     - Consequences: 312h downtime, $1.85M cost

  2. Analysis:
     - Physical: 0.005" misalignment vs. 0.002" tolerance
     - Human: Commissioning procedure allowed visual alignment check only
     - Organizational: Generic commissioning procedure not tailored for large rotating equipment
     - Recurrence check: Similar incident LL-2024-0018 at different site (lesson not applied here)

  3. Lesson Generated:
     Title: "Laser Alignment Verification Required for Large Rotating Equipment Commissioning"
     Statement: "All rotating equipment with bearings >100mm shaft diameter must undergo
     laser alignment verification (acceptance: <0.002 inches) as a mandatory commissioning
     step before startup authorization."

     3 corrective actions defined:
     A01: Update commissioning procedure (Reliability Eng, Apr 15)
     A02: Add to PSSR checklist (Commissioning Lead, Mar 30)
     A03: Brief all commissioning teams (Training Coord, Mar 15)

  4. Validation:
     - SME review: Senior Reliability Engineer confirmed accuracy
     - Management approval: Operations Manager approved for company-wide distribution

  5. Distribution:
     - Email to: 45 commissioning and maintenance engineers (company-wide)
     - Teams: #commissioning, #reliability, #maintenance channels
     - Knowledge base: published with trigger tags for PSSR and commissioning activities
     - Recurrence flag: LL-2024-0018 linked as related (same failure, different site)

Output:
  "Lesson LL-2026-0042 generated and published.
   Severity: High. Source: Incident INC-2026-015.
   3 corrective actions assigned.
   Distributed to 45 engineers company-wide.
   Recurrence detected: similar to LL-2024-0018 (lesson was not applied at this site).
   Effectiveness review scheduled: August 2026."
```

### Example 2: Project Closure Lessons Learned

```
Trigger: Project closure -- Sierra Verde Phase 1 Commissioning

Process:
  1. Scope: Comprehensive lessons learned for 18-month commissioning phase
  2. Input Collection:
     - 24 team members surveyed via questionnaire
     - 4 retrospective sessions conducted (Operations, Maintenance, HSE, Engineering)
     - Project KPI data analyzed (schedule, cost, safety, quality)
     - 8 incident investigations reviewed

  3. Results:
     - Total lessons captured: 67
       Critical: 8, High: 22, Medium: 28, Low: 9
     - Categories:
       Commissioning planning & sequencing: 14 lessons
       Vendor documentation management: 11 lessons
       Training and competency: 10 lessons
       Safety and process safety: 9 lessons
       Equipment reliability: 8 lessons
       Procurement and spare parts: 8 lessons
       Communication and coordination: 7 lessons

  4. Top 5 Lessons:
     1. "Start PSSR documentation assembly at mechanical completion, not 2 weeks before startup"
        Value: Avoided 3-week startup delay
     2. "Require vendor commissioning support personnel confirmed and scheduled 6 months before need"
        Value: Avoided $800K in premium mobilization costs
     3. "Laser alignment mandatory for all rotating equipment >50kW"
        Value: Prevented 3 bearing failures estimated at $5.5M
     4. "Operator training must include 40 hours simulator time before first startup"
        Value: Reduced startup errors by 60%
     5. "Establish alarm rationalization baseline 3 months before first startup"
        Value: Reduced alarm flood incidents to zero

  5. Corrective Actions: 42 total
     Completed (during project): 18
     In progress: 15
     Open (for future projects): 9

Output:
  "Project closure lessons learned report generated.
   67 lessons captured across 7 categories.
   42 corrective actions (18 complete, 15 in progress, 9 for future projects).
   Report stored: /Projects/SierraVerde/Lessons-Learned/
   Lessons published to knowledge base for future project application.
   Distributed to 45 project team members and corporate engineering."
```
