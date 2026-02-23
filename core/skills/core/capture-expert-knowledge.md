# Capture Expert Knowledge

## Skill ID: M-03
## Version: 1.0.0
## Category: M. Workforce Readiness (Agent 5)
## Priority: P1 - Critical

---

## Purpose

Capture tacit and explicit expert knowledge from experienced personnel before retirement, turnover, or role transition, transforming undocumented expertise into structured, searchable, and transferable knowledge assets. This skill addresses the existential threat of institutional knowledge loss by conducting structured knowledge elicitation sessions, producing knowledge maps, decision trees, troubleshooting guides, and multimedia knowledge artifacts that preserve decades of operational wisdom for the next generation of workers.

The industrial knowledge crisis is arguably the most underestimated risk facing asset-intensive operations worldwide. The numbers are alarming:

- **50% of experienced industrial workers will retire by 2030** (Pain Point E-05, McKinsey Global Institute / Bureau of Labor Statistics). In mining and oil & gas, the demographic cliff is steeper: average maintenance workforce age exceeds 50 in many facilities, with critical concentrations of expertise in workers aged 55-65. When these workers leave, they take an irreplaceable asset: the tacit knowledge accumulated over 20-40 years of dealing with equipment, processes, and situations that no manual, procedure, or training course can fully capture.

- **$31.5 billion in annual productivity losses attributable to knowledge management failures** (Pain Point H-03, HBR / APQC Knowledge Management Survey). This figure captures the cost of re-learning what was once known, repeating mistakes that experienced workers would have prevented, and making suboptimal decisions due to missing context.

- **60-70% of organizational knowledge is tacit** (Nonaka & Takeuchi, "The Knowledge-Creating Company"). Tacit knowledge -- the "I just know when the pump sounds wrong" or "We always check this valve first because it sticks in winter" -- cannot be extracted by simply reading manuals. It requires deliberate, structured elicitation techniques that create the conditions for experts to articulate what they know intuitively.

- **Critical incident analysis reveals knowledge gaps**: Post-incident investigations repeatedly identify "loss of experienced personnel" as a contributing factor. The CSB (Chemical Safety Board) has documented multiple cases where incidents occurred because replacement workers lacked the accumulated wisdom of their predecessors -- knowledge that was never documented because "everyone knew" the local practice.

- **Commissioning and ramp-up performance degrades without institutional knowledge**: Operations that lose expert knowledge during handover from project to operations consistently underperform during ramp-up. Equipment-specific "tribal knowledge" about operating limits, common failure modes, and workarounds is essential for troubleshooting the inevitable startup issues.

The challenge is not merely recording what experts know -- it is eliciting knowledge that experts themselves may not recognize as valuable. Expert knowledge is often unconscious competence: the expert makes correct decisions without being able to articulate why. This skill employs structured interview techniques, cognitive task analysis, and decision-mapping methodologies to surface and document this hidden expertise.

---

## Intent & Specification

The AI agent MUST understand and execute the following:

1. **Knowledge Elicitation is Not an Interview**: Standard interviews yield only surface-level knowledge. The agent must apply structured knowledge elicitation techniques designed to surface tacit knowledge:
   - **Critical Decision Method (CDM)**: Probe past critical incidents to extract decision-making rationale
   - **Cognitive Task Analysis (CTA)**: Map the expert's cognitive process for complex tasks
   - **Process Tracing**: Walk through tasks step by step, probing for decision points and alternative paths
   - **Scenario-Based Elicitation**: Present hypothetical scenarios and capture the expert's diagnostic reasoning
   - **Repertory Grid Technique**: Identify distinctions the expert makes that novices do not

2. **Multi-Format Knowledge Capture**: Expert knowledge must be captured in multiple formats to maximize utility:
   - **Knowledge Maps**: Visual representations of knowledge domains, showing relationships between concepts
   - **Decision Trees**: Structured if-then logic for diagnostic and troubleshooting processes
   - **Annotated Procedures**: Standard procedures enhanced with expert tips, warnings, and explanations of "why"
   - **Troubleshooting Guides**: Symptom-cause-action matrices derived from expert experience
   - **Stories and Case Studies**: Narrative accounts of critical incidents with lessons learned
   - **Video/Audio Recordings**: Captured demonstrations and explanations (where permitted)

3. **Knowledge Validation**: Captured knowledge must be validated through:
   - Review by the expert (did we capture it correctly?)
   - Review by a second expert (is this consistent with broader experience?)
   - Review by a novice (is this understandable and usable?)
   - Technical accuracy check (does this align with engineering principles and standards?)

4. **Knowledge Prioritization**: Not all knowledge is equally valuable. The agent must prioritize capture based on:
   - **Criticality**: How severe are the consequences if this knowledge is lost?
   - **Uniqueness**: How many other people hold this knowledge? (single point of failure = highest priority)
   - **Demand frequency**: How often is this knowledge needed in operations?
   - **Documentation gap**: Is this knowledge already captured elsewhere?
   - **Time urgency**: How soon will the expert depart?

5. **Integration with Knowledge Management System**: Captured knowledge must be structured for integration into the organization's knowledge management system, including proper tagging, categorization, cross-referencing with equipment/process identifiers, and search optimization.

6. **Cultural Sensitivity**: Knowledge capture must be conducted respectfully, acknowledging the expert's contribution and avoiding any implication that the expert is being "replaced" or that their role is diminished. The framing should emphasize legacy, mentorship, and organizational resilience.

7. **Language**: Spanish (Latin American) for deliverables; technical terminology preserved in original language.

---

## Trigger / Invocation

```
/capture-expert-knowledge
```

### Natural Language Triggers
- "Capture the expert knowledge of [name/role] before retirement"
- "Document the tribal knowledge for [equipment/process]"
- "Create a knowledge map for [domain/system]"
- "Extract troubleshooting knowledge from experienced personnel"
- "We have a retirement wave coming -- help us preserve institutional knowledge"
- "Capturar conocimiento experto de [nombre/rol] antes de su retiro"
- "Documentar conocimiento tacito sobre [equipo/proceso]"
- "Preservar el conocimiento institucional ante jubilaciones"

### Aliases
- `/knowledge-capture`
- `/expert-knowledge`
- `/tacit-knowledge`

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `expert_profile` | Expert's name, role, years of experience, areas of expertise, planned departure date (retirement/transition) | Text / .xlsx | HR system / User / `track-competency-matrix` |
| `knowledge_domain` | The specific knowledge domain(s) to capture (equipment type, process area, troubleshooting domain, management domain) | Text | User / `track-competency-matrix` (retirement risk analysis) |
| `facility_context` | Facility description, equipment types, process descriptions relevant to the knowledge domain | .docx / text | mcp-sharepoint / User |
| `urgency_level` | How soon the expert is departing: Immediate (<3 months), Near-term (3-12 months), Planned (>12 months) | Text | User |

### Optional Inputs (Strongly Recommended)

| Input | Description | Default if Absent |
|-------|-------------|-------------------|
| `competency_matrix_output` | Retirement risk analysis from competency matrix identifying critical knowledge at risk | Agent conducts initial knowledge risk assessment |
| `existing_documentation` | Current SOPs, maintenance procedures, training materials related to the knowledge domain | Agent identifies documentation gaps during capture |
| `incident_history` | Past incidents where the expert's knowledge was critical to resolution | Agent probes for incident narratives during interview |
| `equipment_failure_history` | CMMS data for equipment in the expert's domain | Agent captures failure knowledge without equipment data context |
| `successor_list` | Identified successors who will receive the captured knowledge | Knowledge artifacts created for general audience |
| `knowledge_management_taxonomy` | Organization's knowledge classification system | VSC standard taxonomy applied |
| `available_media` | Whether video/audio recording is permitted and equipment is available | Text-based capture only |
| `session_constraints` | Available time with expert, scheduling preferences, location | 4-6 sessions of 2 hours each assumed |

### Context Enrichment (Automatic)

The agent will automatically:
- Retrieve the expert's competency profile from `track-competency-matrix` output
- Access equipment documentation (datasheets, manuals, P&IDs) for the knowledge domain from mcp-sharepoint
- Retrieve CMMS failure history for equipment in the expert's domain via mcp-cmms
- Pull existing SOPs and procedures related to the knowledge domain
- Access incident investigation reports relevant to the expert's area
- Retrieve organizational knowledge management taxonomy and templates
- Access industry knowledge base for the equipment/process type to identify standard vs. unique knowledge

---

## Output Specification

### Deliverable 1: Knowledge Capture Report (.docx)

**Filename**: `{ProjectCode}_Knowledge_Capture_{ExpertName}_{Domain}_v{Version}_{YYYYMMDD}.docx`

**Target Length**: 25-60 pages per expert/domain

**Structure**:

1. **Cover Page** -- Expert identification, knowledge domain, capture dates, VSC branding
2. **Knowledge Capture Summary** (2-3 pages)
   - Expert profile (experience, roles held, unique qualifications)
   - Knowledge domains captured
   - Capture methodology used
   - Total sessions conducted, hours invested
   - Key knowledge assets produced
   - Knowledge criticality assessment
   - Recommended dissemination plan
3. **Knowledge Domain Map** (3-5 pages)
   - Visual knowledge map showing domains, sub-domains, and relationships
   - Knowledge inventory: what was captured, what remains undocumented
   - Cross-references to existing documentation
   - Unique knowledge identification (knowledge held only by this expert)
4. **Critical Decisions and Reasoning** (5-15 pages)
   - For each critical decision domain:
     - Decision scenario description
     - Expert's decision-making process (step by step)
     - Key indicators the expert monitors
     - Thresholds and trigger points
     - Alternative actions considered and why rejected
     - Common mistakes novices make
     - "If I could only teach one thing about this..."
5. **Troubleshooting Guides** (5-15 pages)
   - Symptom-cause-action matrices for key equipment/processes
   - Diagnostic decision trees (structured if-then-else logic)
   - Expert tips and warnings for each troubleshooting path
   - Non-obvious failure modes the expert has encountered
   - "The manual says X, but in practice you should Y because..."
6. **Annotated Procedures** (5-10 pages)
   - Standard procedures enhanced with expert annotations:
     - Why each step matters (not just what to do)
     - Common pitfalls and how to avoid them
     - Environmental conditions that change the approach
     - Time-saving techniques that maintain quality
     - Quality checkpoints the expert always verifies
7. **Stories and Case Studies** (3-8 pages)
   - Narrative accounts of significant events:
     - "The time the pump seized during commissioning and how we saved the mill"
     - "Why we always check the bypass valve before starting the compressor"
     - "The pattern I noticed that predicted the heat exchanger failure 3 weeks early"
   - Each story structured as: Situation, Challenge, Action, Result, Lesson
8. **Knowledge Transfer Recommendations** (2-3 pages)
   - Recommended training for successors based on captured knowledge
   - Suggested mentoring assignments
   - Hands-on experiences the successor must have
   - Knowledge that requires ongoing practice to maintain
   - References to related knowledge artifacts and documentation
9. **Appendices**
   - A: Complete knowledge elicitation session notes
   - B: Decision trees (full-size printable versions)
   - C: Troubleshooting matrices (full-size)
   - D: Audio/video recording index (if captured)
   - E: Cross-reference to equipment tags, procedures, and standards

### Deliverable 2: Decision Trees and Knowledge Maps (.xlsx / .vsdx / .pdf)

**Filename**: `{ProjectCode}_Decision_Trees_{ExpertName}_{Domain}_v{Version}_{YYYYMMDD}.xlsx`

Visual decision trees in flowchart format for each major troubleshooting or decision domain. Printable as wall-mounted reference guides for the workshop or control room.

### Deliverable 3: Troubleshooting Quick Reference Cards (.docx / .pdf)

**Filename**: `{ProjectCode}_Troubleshooting_Cards_{Domain}_v{Version}_{YYYYMMDD}.docx`

Laminated-ready quick reference cards (1-2 pages each) for the top 10-20 troubleshooting scenarios, designed for field use. Format: Symptom | Likely Cause | Diagnostic Check | Corrective Action | Expert Tip.

### Deliverable 4: Knowledge Transfer Session Plans (.docx)

**Filename**: `{ProjectCode}_Knowledge_Transfer_Plan_{Domain}_v{Version}_{YYYYMMDD}.docx`

Structured plan for transferring captured knowledge to successors, including: session topics, hands-on exercises, mentoring assignments, assessment criteria, and timeline.

### Deliverable 5: Multimedia Knowledge Library (optional, if recording permitted)

**Folder**: `{ProjectCode}_Knowledge_Library_{ExpertName}/`

Indexed collection of video/audio recordings of the expert demonstrating critical tasks, explaining decision-making, or narrating case studies. Each recording tagged with: topic, equipment, duration, and searchable summary.

---

## Methodology & Standards

### Knowledge Elicitation Frameworks

| Method | Application | When to Use |
|--------|-------------|-------------|
| **Critical Decision Method (CDM)** | Probe past decisions during critical incidents; extract decision cues, strategies, and mental models | High-stakes decisions, emergency response, non-routine situations |
| **Cognitive Task Analysis (CTA)** | Map the complete cognitive process for complex tasks; identify knowledge, skills, and decision points | Complex maintenance procedures, process optimization, diagnostic tasks |
| **Process Tracing** | Walk through a task step-by-step with the expert, probing at each step for "what are you looking for?" and "what would change your approach?" | Standard tasks with hidden complexity, procedures where experience matters |
| **Scenario-Based Elicitation** | Present "what if" scenarios and capture the expert's reasoning for each | Rare events, emergency scenarios, equipment failure modes not recently experienced |
| **Repertory Grid Technique** | Identify the distinctions experts make that novices do not (e.g., "what tells you this is a bearing problem vs. a misalignment?") | Diagnostic expertise, pattern recognition, condition assessment |
| **Structured Interview** | Systematic questioning following a topic guide; useful for declarative knowledge | Factual knowledge, historical context, organizational relationships |
| **Observation and Think-Aloud** | Observe the expert performing a task while narrating their thought process | Hands-on tasks, control room operations, field inspections |

### Knowledge Artifact Types

| Artifact | Description | Format | Use Case |
|----------|-------------|--------|----------|
| **Knowledge Map** | Visual hierarchy of knowledge domains showing breadth and depth of expertise | Mind map / tree diagram | Overview of expert's knowledge; identifies gaps for capture |
| **Decision Tree** | Structured if-then logic for diagnostic or decision processes | Flowchart (.vsdx / .xlsx) | Troubleshooting, fault diagnosis, maintenance decisions |
| **Troubleshooting Matrix** | Symptom-cause-action table for rapid fault diagnosis | Table (.xlsx) | Field reference, control room reference, training material |
| **Annotated Procedure** | Standard SOP with expert commentary, warnings, and tips in margin notes | .docx with annotations | Enhanced training, onboarding, procedure improvement |
| **Case Study** | Narrative account of a significant event with lessons learned | .docx narrative | Training, safety meetings, knowledge sharing sessions |
| **Quick Reference Card** | 1-2 page condensed guide for a specific task or scenario | Laminated .pdf | Field pocket guide, workshop wall poster |
| **Video Demonstration** | Expert performing and explaining a task or diagnostic process | .mp4 indexed | Training library, onboarding, self-paced learning |
| **Mental Model Diagram** | Visual representation of how the expert conceptualizes the system | Diagram (.vsdx) | Training, conceptual understanding, system thinking |

### Knowledge Criticality Assessment

```
For each knowledge domain held by the expert:

Criticality Score = Uniqueness x Impact x Frequency x Documentation_Gap

Uniqueness (1-5):
  5 = Only this expert holds this knowledge (single point of failure)
  4 = This expert + 1 other person (limited redundancy)
  3 = 2-3 other people hold partial knowledge
  2 = Several people hold similar knowledge but less deep
  1 = Common knowledge, widely held in the organization

Impact (1-5):
  5 = Safety-critical: Loss could cause injury, environmental harm, or major incident
  4 = Production-critical: Loss directly impacts production output or quality
  3 = Cost-significant: Loss results in increased maintenance cost, rework, or delays
  2 = Efficiency-related: Loss causes minor productivity reductions
  1 = Convenience: Loss causes minor inconvenience

Frequency (1-5):
  5 = Needed daily in normal operations
  4 = Needed weekly or during routine activities
  3 = Needed monthly or during periodic activities
  2 = Needed quarterly or during shutdowns
  1 = Needed rarely (annual events, emergency situations only)

Documentation_Gap (1-5):
  5 = No documentation exists; knowledge is entirely tacit
  4 = Minimal documentation; key details undocumented
  3 = Partial documentation; significant gaps in "how" and "why"
  2 = Good documentation exists but lacks expert nuances
  1 = Comprehensive documentation; capture adds marginal value

Priority Score = Uniqueness x Impact x Frequency x Documentation_Gap
  Critical: Score > 200 (immediate capture priority)
  High: Score 100-200 (capture within current quarter)
  Medium: Score 50-100 (capture within 6 months)
  Low: Score < 50 (capture if time permits)
```

### Knowledge Transfer Effectiveness Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Knowledge artifacts produced per expert | 8-15 artifacts | Count of documents, decision trees, guides, videos |
| Successor competency gain | +1 to +2 proficiency levels | Pre/post assessment via competency matrix |
| Knowledge retrieval success | >80% of queries answered by knowledge base | Test queries against captured knowledge |
| Time to independent competency | 30-50% reduction vs. unstructured learning | Compare new hire time-to-competency |
| Knowledge reuse rate | >75% of artifacts accessed within 12 months | Knowledge system usage analytics |
| Expert satisfaction | >4/5 on capture quality | Expert review survey |
| Novice usability | >4/5 on clarity and utility | Successor feedback survey |

---

## Step-by-Step Execution

### Phase 1: Knowledge Risk Assessment & Planning (Steps 1-4)

**Step 1: Identify and profile the expert.**
- Retrieve expert's profile from HR system or competency matrix
- Document: name, role, years of experience, key qualifications, areas of expertise, planned departure date
- Identify the expert's unique knowledge contributions:
  - What does this person know that nobody else does?
  - What questions do colleagues always bring to this person?
  - What equipment or processes are associated with this person's name?
- Review the expert's competency matrix assessment (Level 4-5 competencies = priority capture targets)
- Review the retirement risk analysis from `track-competency-matrix`
- **Quality gate**: Expert identified with clear scope of knowledge to capture

**Step 2: Assess knowledge criticality and prioritize domains.**
- List all knowledge domains held by the expert
- Score each domain using the Knowledge Criticality Assessment formula (Uniqueness x Impact x Frequency x Documentation_Gap)
- Rank domains by priority score
- Select top 5-10 domains for capture (based on available time and criticality)
- Cross-reference with existing documentation: what is already written vs. what is purely tacit?
- Identify successor(s) for each knowledge domain
- **Quality gate**: Priority domains selected; capture plan scoped to available time with expert

**Step 3: Design the knowledge capture plan.**
- Determine total available time with the expert:
  - Immediate departure (<3 months): Intensive capture (2-3 sessions per week, 2-3 hours each)
  - Near-term (3-12 months): Standard capture (1-2 sessions per week)
  - Planned (>12 months): Comprehensive capture with validation cycles (1 session per week)
- Design capture session plan:
  - Session 1: Knowledge mapping and prioritization (overview)
  - Sessions 2-N: Deep-dive into each priority domain using appropriate elicitation method
  - Validation session: Expert reviews captured artifacts
  - Transfer session: Expert and successor review together
- Select elicitation methods for each domain:
  - Troubleshooting expertise: CDM + scenario-based elicitation
  - Procedural expertise: Process tracing + observation
  - Diagnostic expertise: Repertory grid + scenario-based
  - Decision-making: CDM + cognitive task analysis
  - Organizational knowledge: Structured interview
- Arrange logistics: meeting room, recording equipment (if permitted), note-taking tools
- Brief the expert: explain the purpose, process, and value of their contribution
- **Quality gate**: Capture plan documented; expert has agreed and understands the process

**Step 4: Prepare domain-specific question guides.**
- For each priority domain, prepare a structured question guide:
  - Opening questions: "Walk me through a typical day when you deal with [domain]"
  - Probing questions: "What are you looking for when you inspect [equipment]?" / "How do you know it is [X] and not [Y]?"
  - Decision-point questions: "At this point, what determines whether you do A or B?"
  - Exception questions: "What changes in winter/summer/at altitude/with new ore type?"
  - Failure mode questions: "What is the worst thing that can happen with this equipment?"
  - Expert tip questions: "What do you wish you had known on your first day?"
  - Legacy questions: "If you could only teach one thing to your successor, what would it be?"
- Prepare reference materials to bring to sessions:
  - Equipment drawings, P&IDs for the knowledge domain
  - CMMS failure history for the equipment
  - Existing SOPs and procedures to annotate
  - Photos of the equipment/area
- **Quality gate**: Question guide covers breadth and depth of each priority domain

### Phase 2: Knowledge Elicitation Sessions (Steps 5-8)

**Step 5: Conduct knowledge mapping session (Session 1).**
- Begin with rapport building and clear explanation of purpose
- Ask the expert to describe their areas of expertise at a high level
- Together, build a knowledge map:
  - Central node: The expert's name/role
  - Primary branches: Major knowledge domains (e.g., "SAG mill maintenance," "Flotation circuit optimization," "Emergency response leadership")
  - Secondary branches: Sub-topics within each domain
  - Leaf nodes: Specific knowledge items (e.g., "Liner bolt torque sequence," "Feed density sweet spot for SAG")
- For each domain, assess: Uniqueness, Impact, Frequency, Documentation Gap (refine initial scoring)
- Identify the "golden nuggets": knowledge the expert considers most valuable and least documented
- Confirm priority domains and session plan
- Record the session (if permitted) and capture notes in real-time
- **Quality gate**: Knowledge map complete; priority domains confirmed; expert engaged and contributing

**Step 6: Conduct deep-dive elicitation sessions (Sessions 2-N).**
- For each priority domain, use the selected elicitation method:

  **Troubleshooting domains (CDM + Scenario):**
  - "Tell me about a time when [equipment] failed in an unusual way"
  - "What were the first signs something was wrong?"
  - "What did you check first? Why?"
  - "What would you have done differently if [condition X] had been different?"
  - "Present scenario: The vibration on Pump PP-3201A suddenly increases by 50%. Walk me through your diagnostic process."
  - Build decision tree from responses

  **Procedural domains (Process Tracing):**
  - "Walk me through the complete procedure for [task], step by step"
  - At each step: "What are you looking for here?" / "What would make you stop and check?"
  - "Is there anything the written procedure misses or gets wrong?"
  - "What do beginners usually struggle with in this step?"
  - Annotate the existing procedure with expert insights

  **Diagnostic domains (Repertory Grid):**
  - "When you assess a bearing, how do you distinguish between a lubrication problem and a misalignment?"
  - "What does a 'good' [equipment] look/sound/feel like vs. a 'bad' one?"
  - "What are the three most important things to check on [equipment]?"
  - Build discrimination matrix from responses

- After each session:
  - Transcribe key points within 24 hours
  - Draft knowledge artifacts (decision trees, troubleshooting matrices, annotated procedures)
  - Identify follow-up questions for next session
  - Send draft artifacts to expert for review before next session
- **Quality gate**: Each session produces at least 2-3 discrete knowledge artifacts in draft form

**Step 7: Capture case studies and stories.**
- Dedicate at least one session to narrative knowledge capture:
  - "What are the top 5 most challenging situations you have faced in your career here?"
  - For each: What was the situation? What made it difficult? What did you do? What was the result? What would you do differently today?
  - "What is the most important lesson you have learned about [equipment/process]?"
  - "Is there a story that you tell new workers to help them understand [domain]?"
- Structure each story using the SCAR format:
  - **Situation**: Context (when, where, what was happening)
  - **Challenge**: What went wrong or what was difficult
  - **Action**: What the expert did (and the reasoning behind it)
  - **Result**: What happened as a consequence
  - **Lesson**: What should be remembered and applied in the future
- Record stories verbatim where possible (audio/video with permission)
- **Quality gate**: At least 5 stories captured per major knowledge domain

**Step 8: Validate captured knowledge.**
- Present all drafted knowledge artifacts to the expert for review:
  - Decision trees: "Is this logic correct? Am I missing any branches?"
  - Troubleshooting matrices: "Are these the right symptoms, causes, and actions?"
  - Annotated procedures: "Did I capture your tips correctly?"
  - Case studies: "Is this an accurate account of what happened?"
- If possible, have a second expert review for consistency and completeness
- Have a novice or early-career employee review for clarity:
  - "Do you understand this decision tree?"
  - "Can you follow the troubleshooting guide?"
  - "Are there terms or concepts you do not understand?"
- Revise artifacts based on all three reviews
- Perform technical accuracy check: do the captured practices align with engineering standards and safety requirements?
- **Quality gate**: Expert confirms accuracy; novice confirms usability; technical accuracy verified

### Phase 3: Knowledge Artifact Production (Steps 9-12)

**Step 9: Produce formal decision trees.**
- Convert session-captured decision logic into formal flowcharts:
  - Standard flowchart symbols (decision diamonds, action rectangles, start/end ovals)
  - Color-coded paths: green (normal), amber (caution), red (stop/escalate)
  - Each decision point includes the diagnostic check or observation
  - Each action includes the expert's tip or warning
  - Include "escalate" paths for situations beyond the operator's capability
- Format for multiple uses:
  - Full-size (A1/A0) for wall mounting in workshops or control rooms
  - A4 size for inclusion in procedures and training materials
  - Digital format for knowledge management system
- Cross-reference with equipment tags, procedure numbers, and standard references
- **Quality gate**: Decision trees are logically complete (no dead ends); expert has validated

**Step 10: Produce troubleshooting quick reference cards.**
- For the top 10-20 troubleshooting scenarios identified by the expert:
  - Create 1-2 page quick reference cards in standardized format:

    | Symptom | Probable Cause | Diagnostic Check | Corrective Action | Expert Tip |
    |---------|---------------|-----------------|-------------------|------------|
    | High vibration, 1x shaft speed | Mechanical unbalance | Check vibration spectrum; 1x dominant | Balance in-situ or remove for shop balance | "If it started suddenly after a PM, check for missing weights or incorrectly assembled components" |

  - Design for lamination and field use (weather-resistant, pocket-sized or clipboard-sized)
  - Include safety warnings for any diagnostic or corrective action with hazard potential
  - Group cards by equipment type or process area for easy reference
- **Quality gate**: Cards are clear, concise, and validated by expert; safety warnings present

**Step 11: Compile the Knowledge Capture Report.**
- Write the complete Knowledge Capture Report following the output specification structure
- Include:
  - Expert profile and unique contribution acknowledgment
  - Knowledge domain map with visual
  - Critical decisions and reasoning sections (from CDM sessions)
  - Troubleshooting guides (from scenario and process tracing sessions)
  - Annotated procedures (enhanced SOPs)
  - Case studies and stories (SCAR format)
  - Knowledge transfer recommendations for successors
- Ensure all artifacts are cross-referenced and indexed
- Include appendices with full session notes and recording index
- **Quality gate**: Report is comprehensive and self-contained; reader can understand the knowledge without the expert present

**Step 12: Index and store knowledge artifacts in the knowledge management system.**
- Tag each knowledge artifact with:
  - Equipment tags (if equipment-specific)
  - Process area
  - Knowledge domain
  - Competency linkage (to competency matrix)
  - Expert source (for provenance)
  - Creation date and version
  - Keywords for search optimization
  - Target audience (operations, maintenance, supervision, management)
- Store in mcp-sharepoint knowledge library with appropriate folder structure
- Store in mcp-onenote for searchable team access (if applicable)
- Update knowledge map in organizational knowledge management system
- **Quality gate**: All artifacts stored, tagged, searchable, and accessible to target audience

### Phase 4: Knowledge Transfer & Monitoring (Steps 13-16)

**Step 13: Design knowledge transfer sessions for successors.**
- For each identified successor:
  - Map their current competency level against the captured knowledge
  - Design a personalized transfer plan:
    - Review sessions: Read and discuss knowledge artifacts with the expert (if still available)
    - Hands-on sessions: Perform tasks alongside the expert using annotated procedures
    - Scenario exercises: Work through troubleshooting scenarios using decision trees
    - Mentoring sessions: Regular 1:1 discussions on specific topics
    - Independent practice: Apply knowledge under reduced supervision
    - Assessment: Demonstrate competency through practical assessment
  - Sequence sessions to build progressively from foundational to advanced knowledge
  - Estimate total transfer time: typically 20-40 hours per major knowledge domain
- **Quality gate**: Transfer plan has specific sessions, timeline, and assessment criteria

**Step 14: Facilitate initial knowledge transfer sessions.**
- If the expert is still available:
  - Conduct facilitated sessions where expert walks successor through key artifacts
  - Expert demonstrates critical tasks while successor observes and takes notes
  - Successor attempts tasks under expert guidance
  - Expert provides real-time feedback and additional context
- If the expert has already departed:
  - Facilitate self-study of knowledge artifacts
  - Use video recordings (if available) for demonstration review
  - Arrange peer mentoring with the next most experienced person
  - Schedule practice sessions with coaching
- Track session completion and successor feedback
- **Quality gate**: At least 80% of planned transfer sessions completed

**Step 15: Measure knowledge transfer effectiveness.**
- Assess successor competency levels post-transfer:
  - Knowledge test: Can the successor explain key concepts and decision rationale?
  - Practical assessment: Can the successor perform critical tasks to standard?
  - Scenario assessment: Can the successor diagnose and resolve troubleshooting scenarios?
  - Compare pre-transfer and post-transfer competency levels
- Track operational indicators:
  - Repeat failure rate for equipment in the expert's domain
  - Time to resolve issues in the expert's knowledge area
  - Number of times knowledge artifacts are accessed (usage rate)
  - Incident rate attributable to knowledge gaps
- Report results to `track-competency-matrix` for competency level updates
- **Quality gate**: Successor demonstrates measurable competency improvement

**Step 16: Establish knowledge maintenance plan.**
- Knowledge artifacts must be maintained as living documents:
  - Annual review: Are decision trees still accurate? Have new failure modes been discovered?
  - Incident trigger: After any significant event in the knowledge domain, review and update artifacts
  - Technology change: If equipment or process changes, update affected knowledge artifacts
  - Feedback loop: Collect feedback from artifact users and incorporate improvements
- Assign knowledge steward (typically the successor or reliability engineer) for ongoing maintenance
- Set review calendar and reminders
- Track artifact currency in knowledge management system
- **Quality gate**: Maintenance plan documented; knowledge steward assigned; review schedule active

---

## Quality Criteria

### Knowledge Capture Quality (Target: >85% Knowledge Retrieval on Independent Assessment)

| Criterion | Weight | Description | Verification Method |
|-----------|--------|-------------|---------------------|
| Knowledge Coverage | 25% | All priority knowledge domains identified and captured; no critical domains missed | Knowledge map completeness audit; expert confirmation |
| Elicitation Depth | 25% | Tacit knowledge surfaced beyond what is already documented; decision rationale captured, not just procedures | Compare captured artifacts with existing documentation; identify unique content |
| Artifact Usability | 20% | Knowledge artifacts are clear, structured, and usable by non-experts | Novice comprehension test; readability assessment |
| Expert Validation | 15% | Expert confirms that captured artifacts accurately represent their knowledge | Expert sign-off on all artifacts |
| Transfer Effectiveness | 10% | Successors demonstrate measurable competency improvement after knowledge transfer | Pre/post competency assessment comparison |
| Searchability | 5% | Knowledge artifacts are properly tagged, indexed, and retrievable through the knowledge management system | Search test: can users find relevant knowledge in <2 minutes? |

### Automated Quality Checks

- [ ] Every priority knowledge domain has at least one knowledge artifact produced
- [ ] Every decision tree has been validated by the expert (sign-off recorded)
- [ ] Every troubleshooting matrix has been reviewed by a novice for clarity
- [ ] All knowledge artifacts are tagged with equipment, process, and competency references
- [ ] All knowledge artifacts are stored in the knowledge management system (mcp-sharepoint)
- [ ] Knowledge transfer plan exists for every critical knowledge domain
- [ ] At least one successor is identified for every critical knowledge domain
- [ ] Session notes exist for every elicitation session conducted
- [ ] Expert satisfaction survey completed (>4/5 quality rating)
- [ ] No captured knowledge contradicts established safety procedures or engineering standards
- [ ] Knowledge criticality assessment completed for all domains
- [ ] Multimedia recordings (if captured) are indexed with topic, equipment, and duration

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)

| Agent/Skill | Input Provided | Criticality | MCP Channel |
|-------------|---------------|-------------|-------------|
| `track-competency-matrix` (M-02) | Retirement risk analysis, expert identification, critical knowledge domains at risk | Critical | Internal |
| `model-staffing-requirements` (M-01) | Workforce demographics, retirement projections | High | Internal |
| Agent 3 (Maintenance) / `agent-maintenance` | Equipment failure history, maintenance procedures for knowledge domain context | High | mcp-cmms |
| Agent 2 (Operations) / `agent-operations` | Operating procedures, process descriptions for knowledge domain context | High | mcp-sharepoint |
| `develop-maintenance-strategy` (MAINT-01) | Equipment-specific knowledge requirements from RCM analysis | Medium | Internal |
| Agent 5 (HR) / `agent-hr` | Employee profiles, retirement dates, succession planning data | Critical | mcp-sharepoint |

### Downstream Dependencies (Outputs To)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `plan-training-program` (M-04) | Knowledge transfer requirements for training program design | Automatic |
| `track-competency-matrix` (M-02) | Successor competency updates after knowledge transfer | On completion |
| `generate-operating-procedures` (I-02) | Enhanced procedures with expert annotations | On request |
| `create-operations-manual` | Expert knowledge content for operations manual enrichment | On request |
| `create-maintenance-manual` | Expert knowledge content for maintenance manual enrichment | On request |
| `build-second-brain` (G-01) | Knowledge artifacts for organizational knowledge base | Automatic |
| `capture-and-classify-knowledge` (Q-01) | Structured knowledge for classification and indexing | Automatic |
| `orchestrate-or-program` (H-01) | Knowledge capture status for OR readiness tracking | Automatic |

### MCP Integrations

| MCP Server | Purpose | Operations |
|------------|---------|------------|
| **mcp-teams** | Schedule and conduct knowledge elicitation sessions (remote or hybrid); record sessions (with permission); coordinate with expert and successors | `POST /meetings`, `GET /recordings`, `POST /channels/{channel}/messages` |
| **mcp-sharepoint** | Retrieve existing documentation for the knowledge domain; store knowledge capture deliverables; manage knowledge library | `GET /documents/{library}`, `POST /documents/{library}`, `SEARCH /documents`, `GET /lists/{list}` |
| **mcp-onenote** | Store structured session notes, annotated diagrams, and searchable knowledge cards in team notebooks | `POST /notebooks/{notebook}/sections/{section}/pages`, `GET /notebooks`, `SEARCH /pages` |

---

## Templates & References

### Document Templates
- `VSC_Knowledge_Capture_Report_Template_v2.0.docx` -- Knowledge capture report template with VSC branding
- `VSC_Decision_Tree_Template_v1.5.vsdx` -- Flowchart template for diagnostic decision trees
- `VSC_Troubleshooting_Card_Template_v2.0.docx` -- Quick reference card template for field use
- `VSC_Knowledge_Map_Template_v1.0.vsdx` -- Visual knowledge map template
- `VSC_Knowledge_Elicitation_Session_Guide_v3.0.docx` -- Facilitator guide for structured knowledge capture sessions
- `VSC_Knowledge_Transfer_Plan_Template_v2.0.docx` -- Successor knowledge transfer plan template
- `VSC_SCAR_Case_Study_Template_v1.0.docx` -- Situation-Challenge-Action-Result case study template

### Reference Data Sources
- Nonaka, I. & Takeuchi, H. (1995): "The Knowledge-Creating Company" -- SECI knowledge conversion model
- Klein, G. (1998): "Sources of Power: How People Make Decisions" -- Critical Decision Method, cognitive task analysis
- Hoffman, R.R., Crandall, B., & Shadbolt, N. (1998): "Use of the Critical Decision Method to Elicit Expert Knowledge" -- CDM methodology
- APQC Knowledge Management Best Practices -- Knowledge capture and transfer frameworks
- NASA Lessons Learned Information System -- Knowledge capture methodology for high-consequence domains
- EPRI Nuclear Knowledge Management -- Power industry knowledge capture programs
- ISO 30401:2018 -- Knowledge Management Systems -- Requirements
- IAEA Nuclear Knowledge Management -- Methodology for capturing critical knowledge in nuclear operations
- DuPont Knowledge Management Framework -- Industrial knowledge capture and transfer methodology

### Knowledge Base
- VSC knowledge capture case studies from prior projects
- Industry-specific knowledge domain libraries (mining, O&G, power)
- Knowledge elicitation question banks by domain
- Troubleshooting template libraries by equipment type
- Expert knowledge artifact examples from comparable operations

---

## Examples

### Example 1: Crusher Expert Knowledge Capture

**Expert**: H. Munoz, Crusher Specialist, 28 years experience, retiring in 14 months
**Domain**: Gyratory crusher overhaul, operation, and troubleshooting
**Priority Score**: 625 (Uniqueness: 5 x Impact: 5 x Frequency: 5 x Doc_Gap: 5) -- CRITICAL

**Knowledge Map**:
```
H. Munoz - Crusher Knowledge
|
+-- Gyratory Crusher Operations
|   +-- Feed management (ore size, moisture, clay content)
|   +-- CSS setting optimization by ore type
|   +-- Spider bushing lubrication nuances
|   +-- Mantle and concave wear pattern interpretation
|   +-- Power draw diagnostics
|
+-- Crusher Overhaul
|   +-- Mantle change procedure (14 non-obvious steps not in OEM manual)
|   +-- Concave segment removal sequence (learned from 2018 incident)
|   +-- Spider cap alignment technique (unique to this crusher model)
|   +-- Eccentric assembly inspection criteria (beyond OEM specs)
|   +-- Hydraulic system bleeding sequence (order matters!)
|
+-- Troubleshooting
|   +-- Vibration pattern interpretation (12 distinct patterns identified)
|   +-- Oil temperature anomaly diagnosis
|   +-- Abnormal noise classification (grinding vs. hammering vs. rattling)
|   +-- Feed distribution imbalance detection
|   +-- Power spike root causes (7 categories)
|
+-- Safety-Critical Knowledge
|   +-- "Kill zone" awareness during mantle lift
|   +-- Hydraulic energy isolation sequence
|   +-- Confined space entry specifics for crusher cavity
|   +-- Emergency lowering procedure (manual override)
```

**Sample Decision Tree (Excerpt): High Vibration Diagnosis**
```
START: Crusher vibration alarm activated

--> Check vibration magnitude vs. baseline
    |
    +-- >3x baseline?
    |   YES --> IMMEDIATE: Reduce feed rate 50%. If vibration persists >5 min, STOP crusher.
    |           "Never run a crusher with 3x vibration for more than 5 minutes.
    |            I've seen a mainshaft crack from this in 2015."
    |   NO --> Continue diagnosis
    |
    +-- Is vibration at 1x shaft speed?
    |   YES --> Likely unbalance
    |           +-- Check feed distribution (camera or visual)
    |           |   +-- Uneven feed --> Adjust feed distribution
    |           |   +-- Even feed --> Check for broken mantle segment
    |           |       "Tap the mantle with a rubber mallet. A broken segment
    |           |        sounds hollow, not ringing."
    |   NO --> Check frequency pattern
    |           +-- Multiple frequencies (broadband) --> Bearing or bushing wear
    |           |   "Check oil temperature. If oil temp is up AND vibration is
    |           |    broadband, the eccentric bushing is the first suspect."
    |           +-- Specific frequency (harmonic) --> Gear mesh or drive train
    |               "Count the teeth. If the frequency matches gear mesh,
    |                check the pinion for wear."
```

### Example 2: Knowledge Transfer Effectiveness Tracking

```
KNOWLEDGE TRANSFER REPORT
Expert: H. Munoz (Crusher Specialist)
Successor: R. Perez (Mechanical Fitter, 5 years experience)
Transfer Period: 6 months (Aug 2025 - Jan 2026)

Competency Assessment (Pre vs. Post Transfer):

| Competency | Pre-Transfer | Post-Transfer | Change | Target |
|-----------|-------------|--------------|--------|--------|
| Crusher overhaul | Level 2 | Level 3 | +1 | Level 4 (24 months) |
| Vibration diagnosis | Level 1 | Level 3 | +2 | Level 3 (ACHIEVED) |
| Feed optimization | Level 1 | Level 2 | +1 | Level 3 (12 months) |
| Safety procedures | Level 3 | Level 4 | +1 | Level 4 (ACHIEVED) |
| Troubleshooting | Level 2 | Level 3 | +1 | Level 4 (18 months) |

Knowledge Artifact Usage:
- Decision trees accessed 47 times in 6 months (high usage)
- Troubleshooting cards accessed 31 times
- Annotated overhaul procedure used in 2 actual overhauls (with expert present for first)
- Case studies shared in 3 safety meetings

Transfer Effectiveness Score: 78% (Good - on track for full competency within 24 months)

Remaining Actions:
- R. Perez must lead next crusher overhaul independently (scheduled Q2 2026)
- Advanced vibration interpretation training (external course, March 2026)
- Continue monthly mentoring sessions with H. Munoz (remote, post-retirement, if agreed)
```
