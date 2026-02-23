# Create Meeting Minutes

## Skill ID: C-MIN-015

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (ensures accountability and continuity in project communication)

---

## Purpose

Generate professional meeting minutes with structured action items, decisions logged, and key discussion points captured. This skill transforms raw meeting notes or transcripts into formal, distributable meeting records that ensure accountability, traceability, and follow-up on commitments made during project meetings.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Process** raw meeting notes, transcripts, or audio transcription outputs.
2. **Structure** content into a formal meeting minutes format.
3. **Extract** and clearly tag action items with owners, due dates, and priority.
4. **Document** decisions made with rationale and participants who agreed.
5. **Deliver** output in `.docx` format suitable for distribution and archival.

---

## Trigger / Invocation

**Command:** `/create-meeting-minutes`

**Trigger Conditions:**
- User provides meeting notes or transcript and requests formal minutes.
- Post-meeting documentation is needed.
- Action item tracking requires structured recording.

**Aliases:**
- `/meeting-minutes`
- `/minutes`
- `/acta`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `meeting_notes` | Text, `.md`, `.docx`, or audio transcript | Raw meeting notes, transcript, or bullet points |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `meeting_metadata` | Text | Meeting title, date, time, location, platform (Teams/Zoom) |
| `attendees` | List | Attendee names, roles/organizations |
| `agenda` | List | Original meeting agenda items |
| `previous_minutes` | `.docx` | Previous meeting's minutes for action item follow-up |
| `project_context` | Text | Project name, phase, and current status for context |
| `language` | Text | Output language (default: match input language) |
| `distribution_list` | List | Who should receive the minutes |
| `action_item_prefix` | Text | Action item ID format (e.g., "AI-XXX", "ACC-XXX") |

---

## Output Specification

### Primary Output: Meeting Minutes (`.docx`)

**File naming:** `{project_code}_meeting_minutes_{meeting_number}_{YYYYMMDD}.docx`

**Document structure:**

```
MEETING MINUTES
==============

Meeting Title: [Title]
Date: [Date]
Time: [Start Time - End Time]
Location: [Physical location / Virtual platform]
Project: [Project Name]
Minutes Number: [Sequential number]
Prepared by: [Name]

ATTENDEES
---------
| Name | Organization/Role | Present/Absent |
|------|-------------------|----------------|
| [Name] | [Role] | Present |
| [Name] | [Role] | Absent (excused) |

AGENDA
------
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

DISCUSSION SUMMARY
------------------

### 1. [Agenda Item 1 Title]

[Summary of discussion points]

**Key Points:**
- [Point 1]
- [Point 2]

**Decision:** [Decision made, if any]

**Action Items:**
- AI-001: [Action description] | Owner: [Name] | Due: [Date] | Priority: [H/M/L]

### 2. [Agenda Item 2 Title]
[...]

ACTION ITEMS SUMMARY
--------------------
| ID | Action | Owner | Due Date | Priority | Status |
|----|--------|-------|----------|----------|--------|
| AI-001 | [Description] | [Name] | [Date] | High | Open |
| AI-002 | [Description] | [Name] | [Date] | Medium | Open |

DECISIONS LOG
-------------
| # | Decision | Rationale | Agreed By |
|---|----------|-----------|-----------|
| D-001 | [Decision text] | [Brief rationale] | [Names/consensus] |

PREVIOUS ACTION ITEMS REVIEW (if applicable)
--------------------------------------------
| ID | Action | Owner | Original Due | Status | Notes |
|----|--------|-------|-------------|--------|-------|
| AI-prev-001 | [Description] | [Name] | [Date] | Closed | [Resolution] |
| AI-prev-002 | [Description] | [Name] | [Date] | Carried Forward | [Updated due date] |

NEXT MEETING
-----------
Date: [Next meeting date/time]
Location: [Location/platform]
Proposed Agenda: [Topics for next meeting]

DISTRIBUTION LIST
-----------------
[List of recipients]

---
Prepared by: [Name] | Date: [Date] | Approved by: [Name]
```

---

## Methodology & Standards

### Meeting Minutes Best Practices

1. **Objectivity:** Record what was discussed and decided, not personal opinions or interpretations.
2. **Clarity:** Use clear, concise language. Avoid ambiguity.
3. **Completeness:** Capture all decisions, action items, and significant discussion points.
4. **Accuracy:** Names, dates, numbers, and commitments must be precise.
5. **Timeliness:** Minutes should be distributed within 24-48 hours of the meeting.

### Action Item Requirements

Every action item must include:
- **Unique ID:** Sequential identifier (format: AI-NNN or project-specific prefix).
- **Description:** Clear, specific, and actionable statement (starts with a verb).
- **Owner:** Single named individual responsible (not a group or department).
- **Due Date:** Specific calendar date (not "ASAP" or "next week").
- **Priority:** High (H), Medium (M), or Low (L).
- **Status:** Open, In Progress, Closed, Overdue, Carried Forward.

### Action Item Wording Guidelines

| Bad | Good |
|-----|------|
| "Look into the pump issue" | "Investigate root cause of PU-2301A vibration alarm and report findings" |
| "Follow up on data" | "Provide CMMS failure data extract for grinding equipment (2022-2024)" |
| "Update the team" | "Present revised maintenance strategy to Operations team at next weekly meeting" |

### Decision Documentation

Each decision must include:
- What was decided (clear statement).
- Brief rationale (why this option was chosen).
- Who agreed (names or "consensus" if unanimous).
- Any conditions or caveats attached to the decision.

---

## Step-by-Step Execution

### Phase 1: Input Processing (Steps 1-3)

**Step 1: Parse meeting notes.**
- Extract meeting metadata (date, time, attendees, location).
- Identify agenda items (explicit or inferred from discussion flow).
- Flag action items (look for keywords: "will," "should," "needs to," "by [date]").
- Flag decisions (look for keywords: "agreed," "decided," "approved," "confirmed").

**Step 2: Structure discussion content.**
- Organize notes by agenda item or topic.
- Separate factual discussion from action items and decisions.
- Identify and attribute statements to speakers where possible.
- Consolidate redundant or repeated points.

**Step 3: Extract action items and decisions.**
- Create formal action item entries with all required fields.
- Infer due dates if not explicitly stated (flag for confirmation).
- Assign unique action item IDs.
- Create formal decision entries with rationale and agreement.

### Phase 2: Document Creation (Steps 4-6)

**Step 4: Write discussion summaries.**
- Summarize each agenda item discussion concisely.
- Focus on key points, conclusions, and outcomes.
- Remove tangential discussion not relevant to project outcomes.
- Maintain objective, factual tone.

**Step 5: Compile action items and decisions tables.**
- Create action items summary table with all required fields.
- Create decisions log with rationale.
- If previous minutes available, update previous action item status.
- Note items carried forward with updated due dates.

**Step 6: Complete meeting minutes document.**
- Assemble all sections in the standard format.
- Add next meeting details (if discussed).
- Add distribution list.
- Apply document formatting and template.

### Phase 3: Quality & Delivery (Steps 7-8)

**Step 7: Quality check.**
- Verify all action items have complete information (owner, date, description).
- Confirm decisions are accurately captured.
- Check names and dates for accuracy.
- Ensure minutes read coherently without the original notes.

**Step 8: Finalize and deliver.**
- Generate `.docx` output with proper formatting.
- Note any items requiring confirmation or clarification from attendees.
- Flag action items with missing due dates or owners for follow-up.

---

## Quality Criteria

### Completeness
- [ ] All agenda items are covered in the discussion summary.
- [ ] All action items identified in notes are captured with full details.
- [ ] All decisions are documented with rationale.
- [ ] Attendee list is complete.

### Accuracy
- [ ] Names are correctly spelled.
- [ ] Dates and deadlines are correct.
- [ ] Technical details and numbers accurately reflect the discussion.
- [ ] Action item descriptions clearly convey the required action.

### Actionability
- [ ] Every action item has a single named owner.
- [ ] Every action item has a specific due date.
- [ ] Action descriptions start with a verb and are specific enough to execute.
- [ ] Previous action items are tracked and updated.

### Professionalism
- [ ] Objective, factual tone throughout.
- [ ] Consistent formatting and structure.
- [ ] No spelling or grammar errors.
- [ ] Suitable for client distribution and project records.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| User | Meeting notes, transcripts, audio transcriptions | Raw input |
| `summarize-documents` (C-SUM-010) | Pre-meeting document summaries | Context for discussion interpretation |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-weekly-report` (C-WEEK-013) | Action items and decisions | Weekly report content |
| `create-executive-briefing` (C-BRIEF-018) | Meeting outcomes and open items | Pre-meeting context |
| `create-email-followup` (C-EMAIL-017) | Action items for follow-up emails | Post-meeting communication |

---

## Templates & References

### Templates
- `templates/meeting_minutes_template.docx` - Standard meeting minutes template.
- `templates/action_item_tracker.xlsx` - Master action item tracking spreadsheet.

### Reference Documents
- VSC internal: "Estandar de Actas de Reunion v1.5"
- Robert's Rules of Order (for formal meeting governance reference)

---

## Examples

### Example 1: Project Kickoff Meeting

**Input (raw notes):**
```
Meeting with Minera XYZ, Feb 12 2025, 10am-12pm, client offices.
Present: Juan Perez (VSC PM), Maria Lopez (client AM Manager), Pedro Gomez (client Maint Sup).
Discussed project scope - client wants criticality for 250 equipment in concentrator.
Need CMMS data - Maria will send SAP extract by Feb 19.
Agreed to use ISO 14224 taxonomy. Pedro wants to include mobile equipment too.
Decision: Include mobile equipment in scope (total ~320 items now).
Next meeting Feb 19, same time.
```

**Expected Output:**
- Formal minutes document with proper header and attendee table.
- Discussion: Scope finalized at ~320 equipment items including mobile equipment.
- Decision D-001: "Include mobile equipment in criticality analysis scope, expanding from 250 to ~320 items. Rationale: Mobile fleet represents significant maintenance cost. Agreed by: M. Lopez, P. Gomez, J. Perez."
- Action AI-001: "Provide SAP PM failure data extract for concentrator and mobile equipment (2022-2024)" | Owner: Maria Lopez | Due: Feb 19 | Priority: High.
- Action AI-002: "Update project scope document to reflect inclusion of mobile equipment" | Owner: Juan Perez | Due: Feb 14 | Priority: Medium.

### Example 2: Technical Review Meeting

**Input:**
- Transcript from Teams meeting, 45 minutes, 6 attendees.
- Topic: Review of reliability analysis results for grinding circuit.

**Expected Output:**
- Discussion summary organized by reviewed equipment (SAG mill, ball mills, cyclones).
- 4 action items extracted from discussion.
- 2 decisions documented (PM interval changes approved for SAG mill gearbox and ball mill motor).
- Previous action items from last meeting updated (2 closed, 1 carried forward).
