# Create Executive Briefing

## Skill ID: C-BRIEF-018

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (ensures prepared, confident client interactions)

---

## Purpose

Prepare comprehensive executive briefing documents for pre-meeting preparation, providing consultants with the context, intelligence, and talking points needed for effective client interactions. This skill aggregates information about the client, meeting participants, agenda topics, and relevant project status into a concise briefing that enables well-prepared, confident, and productive meetings.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Compile** relevant information about meeting attendees, their organization, and current context.
2. **Summarize** project status and key discussion points for the upcoming meeting.
3. **Prepare** talking points, questions to ask, and potential objections to address.
4. **Identify** risks, sensitivities, and political dynamics to be aware of.
5. **Deliver** a concise `.md` briefing document readable in 5-10 minutes.

---

## Trigger / Invocation

**Command:** `/create-executive-briefing`

**Trigger Conditions:**
- User has an upcoming client meeting and needs preparation.
- A critical project meeting requires strategic preparation.
- New client engagement requires background research on participants.
- Recurring meeting needs updated context briefing.

**Aliases:**
- `/briefing`
- `/meeting-prep`
- `/pre-meeting`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `meeting_context` | Text | Meeting purpose, type (kickoff, review, negotiation, presentation), and date |
| `attendees` | List | Names, titles, and organizations of meeting participants |
| `agenda` | List or text | Meeting agenda or key topics to be discussed |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `project_status` | Text or `.docx` | Current project status, recent deliverables, open issues |
| `client_background` | Text | Client company information, industry, recent news |
| `previous_meetings` | `.docx` or text | Previous meeting minutes or notes for continuity |
| `open_action_items` | List | Outstanding action items from previous interactions |
| `risk_factors` | Text | Known sensitivities, political dynamics, or concerns |
| `vsc_objectives` | Text | VSC's strategic objectives for this meeting |
| `competitor_context` | Text | Known competitors or alternative approaches the client is considering |
| `decision_points` | List | Decisions that need to be made during this meeting |
| `language` | Text | Briefing language (default: match user language) |

---

## Output Specification

### Primary Output: Executive Briefing (`.md`)

**File naming:** `briefing_{client_name}_{meeting_type}_{YYYYMMDD}.md`

**Briefing structure:**

```markdown
# Executive Briefing
## [Meeting Title] | [Date] | [Time]

---

### MEETING ESSENTIALS
- **Purpose:** [One sentence meeting purpose]
- **Type:** [Kickoff / Review / Negotiation / Presentation / Workshop]
- **Duration:** [Expected duration]
- **Location:** [Physical / Virtual / Hybrid]
- **VSC Objective:** [What we want to achieve in this meeting]

---

### ATTENDEES

| Name | Title | Organization | Role in Meeting | Notes |
|------|-------|-------------|-----------------|-------|
| [Name] | [Title] | [Org] | Decision maker | [Key info] |
| [Name] | [Title] | [Org] | Technical lead | [Key info] |

**Key Decision Maker:** [Name and brief profile]
**Key Influencer:** [Name and brief note on their perspective]

---

### CLIENT CONTEXT
[2-3 paragraphs covering:]
- Company overview and current situation.
- Recent developments or news relevant to the meeting.
- Strategic priorities and challenges.
- Relationship history with VSC.

---

### PROJECT STATUS (if applicable)
- **Overall Status:** [Green / Yellow / Red]
- **Key Achievements:** [Recent accomplishments]
- **Open Issues:** [Current issues requiring attention]
- **Budget Status:** [On track / At risk]
- **Schedule Status:** [On track / At risk]

---

### AGENDA ANALYSIS

#### Topic 1: [Agenda Item]
- **Context:** [What we know about this topic]
- **Client's likely position:** [What we expect them to say/want]
- **Our recommendation:** [What we should recommend]
- **Supporting data:** [Key data points to reference]

#### Topic 2: [Agenda Item]
[Same structure...]

---

### TALKING POINTS
1. [Key point to make, with supporting data]
2. [Key point to make, with supporting data]
3. [Key point to make, with supporting data]

---

### QUESTIONS TO ASK
1. [Strategic question to gather information]
2. [Clarifying question on key topic]
3. [Question to advance relationship/project]

---

### POTENTIAL OBJECTIONS & RESPONSES

| Objection | Recommended Response |
|-----------|---------------------|
| "[Possible objection 1]" | [Recommended response with rationale] |
| "[Possible objection 2]" | [Recommended response with rationale] |

---

### WATCH POINTS & SENSITIVITIES
- [Political dynamic or sensitivity to be aware of]
- [Topic to avoid or handle carefully]
- [Organizational change or tension relevant to the meeting]

---

### DESIRED OUTCOMES
1. [Specific outcome we want from this meeting]
2. [Specific agreement or decision needed]
3. [Specific next step to propose]

---

### FOLLOW-UP PLAN
- **During meeting:** [Who takes notes, who leads each topic]
- **After meeting:** [Follow-up email within X hours, next deliverable]
- **Next meeting:** [Proposed date/topics for next interaction]
```

---

## Methodology & Standards

### Briefing Preparation Framework

1. **Know the People:** Understand who will be in the room, their roles, motivations, and decision-making power.
2. **Know the Context:** Understand the client's current situation, challenges, and priorities.
3. **Know the History:** Understand previous interactions, commitments made, and relationship dynamics.
4. **Know the Objective:** Be clear about what VSC wants to achieve in this specific meeting.
5. **Know the Risks:** Understand potential objections, sensitivities, and political dynamics.

### Attendee Profiling

For each key attendee, understand:
- **Role:** Decision maker, influencer, technical expert, gate keeper, end user.
- **Motivation:** What do they care about? Cost, risk, innovation, compliance, career.
- **Communication style:** Data-driven, relationship-oriented, big-picture, detail-focused.
- **Known positions:** Any known opinions or preferences relevant to the agenda.
- **History with VSC:** Previous interactions, relationship quality, trust level.

### Meeting Type Preparation

| Meeting Type | Key Preparation Focus |
|-------------|----------------------|
| **Kickoff** | Clear scope, expectations, team introductions, governance structure |
| **Status Review** | Progress data, issues prepared with solutions, next steps clear |
| **Technical Review** | Data ready, technical questions anticipated, expert backup available |
| **Negotiation** | BATNA prepared, concession strategy, key terms identified |
| **Presentation** | Rehearsed delivery, Q&A anticipated, backup slides ready |
| **Workshop** | Facilitation plan, exercises prepared, materials ready |
| **Steering Committee** | Executive summary, decisions needed, risk escalation ready |

---

## Step-by-Step Execution

### Phase 1: Information Gathering (Steps 1-3)

**Step 1: Compile meeting essentials.**
- Confirm date, time, location, duration.
- List all attendees with roles and titles.
- Clarify meeting purpose and agenda.
- Identify VSC's strategic objectives for the meeting.

**Step 2: Research client context.**
- Review client company information and recent developments.
- Check previous meeting notes and action items.
- Review project status and recent deliverables.
- Identify any relevant industry news or events.

**Step 3: Profile key attendees.**
- Identify decision makers and influencers.
- Note communication preferences and known positions.
- Understand organizational dynamics and reporting relationships.
- Flag any new attendees requiring special attention.

### Phase 2: Analysis & Strategy (Steps 4-5)

**Step 4: Analyze each agenda topic.**
- For each agenda item, assess client's likely position.
- Prepare VSC's recommended position with supporting data.
- Identify potential areas of agreement and disagreement.
- Prepare fallback positions if needed.

**Step 5: Prepare for contingencies.**
- Anticipate potential objections and prepare responses.
- Identify watch points and sensitivities.
- Prepare "if asked" topics (things that might come up unexpectedly).
- Define desired outcomes and minimum acceptable outcomes.

### Phase 3: Briefing Production (Steps 6-7)

**Step 6: Draft briefing document.**
- Compile all information into the standard briefing structure.
- Write concise, actionable content.
- Highlight the most critical elements visually (bold, callouts).
- Keep total length to 2-4 pages (5-10 minute read).

**Step 7: Quality review.**
- Verify all facts and figures.
- Confirm attendee names and titles.
- Ensure talking points are specific and data-supported.
- Verify desired outcomes are realistic and measurable.

---

## Quality Criteria

### Completeness
- [ ] All attendees are profiled with relevant information.
- [ ] All agenda topics are analyzed with recommended positions.
- [ ] Talking points are prepared with supporting data.
- [ ] Potential objections have prepared responses.

### Actionability
- [ ] VSC objectives are clear and specific.
- [ ] Desired outcomes are measurable.
- [ ] Questions to ask are strategic and purposeful.
- [ ] Follow-up plan is defined.

### Conciseness
- [ ] Briefing is readable in 5-10 minutes.
- [ ] No unnecessary background information.
- [ ] Key information is visually highlighted.
- [ ] Structure allows easy scanning.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `create-meeting-minutes` (C-MIN-015) | Previous meeting outcomes, action items | Continuity and follow-up context |
| `create-weekly-report` (C-WEEK-013) | Project status data | Current project context |
| `summarize-documents` (C-SUM-010) | Summarized project documents | Background information |
| `research-deep-topic` (C-RES-009) | Industry context and trends | Client environment understanding |
| `analyze-scenarios` (B-SCEN-002) | Analysis results | Technical discussion preparation |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-meeting-minutes` (C-MIN-015) | Meeting context for minutes | Post-meeting documentation |
| `create-email-followup` (C-EMAIL-017) | Meeting outcomes for follow-up | Post-meeting communication |

---

## Templates & References

### Templates
- `templates/executive_briefing_template.md` - Standard briefing template.
- `templates/negotiation_briefing_template.md` - Negotiation-specific briefing.

### Reference Documents
- VSC internal: "Guia de Preparacion de Reuniones Ejecutivas v1.0"

---

## Examples

### Example 1: Project Kickoff Meeting

**Input:**
- Meeting: Kickoff for AM Assessment at Minera Pacifica, Feb 20 2025, 9am, client offices.
- Attendees: VP Operations (decision maker), AM Manager, Maintenance Superintendent, 2 area supervisors.
- Agenda: Project scope review, team introductions, data requirements, timeline, governance.
- VSC objective: Align on scope, secure data access commitment, establish governance cadence.

**Expected Output:**
- 3-page briefing with attendee profiles noting VP is new (6 months in role, comes from oil & gas).
- Client context highlighting recent production losses driving the AM initiative.
- Talking points emphasizing quick wins within first 3 months.
- Key question: "What does success look like for this project in your view?" (directed at VP).
- Watch point: AM Manager may feel threatened by external assessment; position as collaborative.
- Desired outcomes: (1) Scope confirmed and signed, (2) CMMS data access granted by Feb 24, (3) Weekly governance meetings agreed.

### Example 2: Steering Committee Presentation

**Input:**
- Meeting: Quarterly steering committee, 3 executive attendees.
- Agenda: Project status, preliminary findings, budget update, timeline adjustment request.
- Context: Project is Yellow status; need to request 2-week extension due to data quality issues.

**Expected Output:**
- Briefing focused on presenting the extension request positively.
- Talking point: "The additional 2 weeks ensures the reliability analysis is based on clean data, which directly impacts the quality of maintenance strategy recommendations."
- Potential objection: "Why wasn't this identified earlier?" Response: "Data quality assessment was part of Phase 1 findings; the extent of data cleaning required became clear during detailed analysis."
- Desired outcome: Extension approved without budget increase.
