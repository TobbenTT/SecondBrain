# Vibe Working Session Orchestrator

## Skill ID: F-005
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Structure a "vibe working session" -- an intensive, focused AI-assisted work session -- with proper intent definition, context loading, iterative refinement, and quality validation. This skill prevents the common failure of getting AI outputs that do not match intent by establishing a clear protocol for how humans and AI collaborate in real-time to produce high-quality deliverables. It transforms ad-hoc AI usage into a disciplined, repeatable process.

## Intent & Specification

**Problem:** Most AI working sessions are unstructured. Users open a chat, type a vague prompt, get a mediocre response, try to fix it with follow-up prompts, lose context as the conversation grows, and eventually give up or accept subpar output. The session lacks: clear intent, proper context loading, iterative quality checks, and a systematic approach to refinement. This "vibe coding/working" without structure is the #1 source of AI productivity loss.

**Success Criteria:**
- Every vibe session starts with a clear intent specification (even if quick)
- Context is loaded systematically before generation starts
- Outputs are iteratively refined with structured quality checks
- Session produces a deliverable that matches the original intent
- Session time is productive (no more than 20% on setup, 60% on generation, 20% on refinement)
- Session outputs are captured and stored for future reference
- Lessons learned from the session improve future sessions

**Constraints:**
- Must be lightweight enough that users actually follow it (not bureaucratic)
- Must work with any AI tool (Claude, Windsurf, Cursor, etc.)
- Must support different session types (writing, analysis, coding, design)
- Must handle context window limitations gracefully
- Must produce auditable outputs (what was the intent, what was produced)
- Must integrate with second brain for context retrieval and output storage

## Trigger / Invocation

**Manual Triggers:**
- `vibe-working-session start --topic [topic] --type [write|analyze|code|design]`
- `vibe-working-session resume --session [id]`
- `vibe-working-session checkpoint` (mid-session quality check)
- `vibe-working-session close --session [id]`

**Recommended Triggers:**
- Before any significant AI-assisted work (>30 minutes expected)
- When a previous unstructured session produced poor results
- When multiple people will collaborate with AI on the same deliverable
- When the output is a formal deliverable (not casual exploration)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Topic/Task | User | Yes | What the session will produce |
| Session Type | User | No | write, analyze, code, design (default: write) |
| Intent Specification | define-intent-specification | Recommended | Clear spec for the output |
| Context Documents | Second Brain / Doc Control | Recommended | Reference materials |
| Quality Criteria | Intent Spec / User | Recommended | How to evaluate output |
| Time Budget | User | No | How long the session should last |
| AI Tool | User / Config | No | Which AI platform to use |

## Output Specification

**Primary Outputs:**
1. **Session Deliverable:** The actual work product (document, analysis, code, design)
2. **Session Log:** Record of the session for learning and audit
3. **Quality Assessment:** Evaluation of deliverable against criteria

**Session Log:**
```yaml
session_log:
  session_id: "VS-2025-042"
  date: "2025-04-15"
  duration_minutes: 90
  topic: "Develop Maintenance Strategy Document"
  type: "write"
  intent_spec: "IS-012"
  ai_tool: "Claude (Windsurf)"

  phases:
    setup:
      duration_minutes: 15
      intent_defined: true
      context_loaded:
        - "Maintenance Philosophy (from second brain)"
        - "Criticality Analysis Results"
        - "Industry benchmarks for lithium plants"
        - "Client maintenance standards"
      quality_criteria_set: true

    generation:
      duration_minutes: 55
      iterations: 4
      checkpoints_passed: 3
      major_refinements: 2
      context_window_resets: 0

    refinement:
      duration_minutes: 15
      quality_check_result: "pass"
      revisions_made: 3
      final_review: "approved"

    closeout:
      duration_minutes: 5
      deliverable_filed: true
      lessons_captured: 2
      second_brain_updated: true

  deliverable:
    title: "Maintenance Strategy - Lithium Plant"
    format: "markdown"
    word_count: 4500
    quality_score: "4/5"
    filed_at: "doc-control/03-Maintenance/03.01-Strategy/"

  lessons_learned:
    - "Loading OEM data for specific equipment improved PM plan specificity"
    - "Breaking the document into sections and generating one at a time improved quality"
```

## Methodology & Standards

- **Session Structure:** Every vibe working session follows four phases:
  1. **SETUP (15-20%):** Define intent, load context, set quality criteria
  2. **GENERATE (50-60%):** Produce content iteratively with checkpoints
  3. **REFINE (15-20%):** Quality check, revise, polish
  4. **CLOSE (5-10%):** File output, capture lessons, update second brain

- **Context Loading Protocol:**
  - Load the intent specification first (this is the AI's mission)
  - Load reference documents relevant to the task
  - Load examples of similar outputs (what good looks like)
  - Load constraints and standards to follow
  - Keep context focused -- not everything, just what is needed

- **Iterative Generation:**
  - Break large deliverables into sections
  - Generate one section at a time
  - Quality check each section before proceeding
  - If quality degrades: checkpoint, reload context, continue
  - Do NOT try to generate everything in one prompt

- **Quality Checkpoints:**
  - After each major section: "Does this match the intent?"
  - After 30 minutes: "Is the context still effective or degraded?"
  - Before closing: "Does the complete deliverable meet success criteria?"
  - If any checkpoint fails: stop, diagnose, adjust approach

- **Context Window Management:**
  - Monitor context window usage (roughly track conversation length)
  - When approaching limits: summarize progress, start new conversation, reload essential context
  - Never rely on early conversation content being fully retained in long sessions

## Step-by-Step Execution

### Phase 1: SETUP (15-20% of session time)

#### Step 1: Define Intent
1. If intent specification exists: load it
2. If not: create a Quick Spec using `define-intent-specification --level quick`
3. Confirm: "What are we making? What does success look like?"
4. Set time budget for the session

#### Step 2: Load Context
1. Query second brain for relevant knowledge items
2. Gather reference documents from doc-control
3. Find examples of similar outputs
4. Load applicable standards and templates
5. Prepare context package (ordered by relevance)

#### Step 3: Set Quality Criteria
1. From intent specification or user input, define:
   - Completeness criteria (what must be included)
   - Accuracy criteria (how to verify correctness)
   - Style criteria (tone, format, structure)
   - Audience criteria (who will use this)
2. Create quick checklist for checkpoint assessments

#### Step 4: Prime the AI
1. Load context into AI tool in this order:
   a. Role/identity (who is the AI in this session)
   b. Task description (what to produce)
   c. Reference materials (what to draw from)
   d. Constraints (what to follow and avoid)
   e. Output format (how to structure the result)
   f. Quality criteria (how to self-check)
2. Confirm AI understanding: "Summarize what you will produce"
3. Adjust if the summary does not match intent

### Phase 2: GENERATE (50-60% of session time)

#### Step 5: Section-by-Section Generation
1. Break deliverable into sections (from intent spec outline)
2. For each section:
   a. Provide section-specific instructions
   b. Reference relevant context for that section
   c. Generate the section
   d. Quick quality check: relevant, accurate, complete?
   e. If good: accept and proceed to next section
   f. If not: refine with specific feedback, regenerate

#### Step 6: Mid-Session Checkpoints
1. After every 2-3 sections (or every 30 minutes):
   a. Review progress against intent specification
   b. Check for drift (is the output still on-topic?)
   c. Check context quality (is the AI still drawing on loaded context?)
   d. If context degraded: summarize progress, reload context if needed
2. Adjust approach if needed:
   - More specific prompts if output is too generic
   - More examples if style is wrong
   - More constraints if scope is creeping

### Phase 3: REFINE (15-20% of session time)

#### Step 7: Full Quality Review
1. Read the complete deliverable end-to-end
2. Check against quality criteria checklist:
   - [ ] Completeness: all required sections present
   - [ ] Accuracy: facts and data verified
   - [ ] Consistency: terminology, formatting, style uniform
   - [ ] Audience: appropriate level of detail and language
   - [ ] Intent alignment: matches what was specified
3. List revisions needed (be specific)

#### Step 8: Targeted Revisions
1. For each revision:
   a. Quote the specific section to change
   b. Explain what is wrong and what is needed
   c. Apply the revision
   d. Verify the fix does not break surrounding content
2. Do a final pass for polish (formatting, typos, flow)

### Phase 4: CLOSE (5-10% of session time)

#### Step 9: File and Store
1. Save the deliverable in the appropriate location
2. File via agent-doc-control if it is a formal document
3. Update Shared Task List if this was an assigned task

#### Step 10: Capture Lessons
1. What worked well in this session?
2. What would you do differently next time?
3. What context was most useful?
4. What was missing from the context?
5. Store lessons in second brain for future sessions

#### Step 11: Update Systems
1. Update second brain with:
   - New knowledge items generated during session
   - Connections between session output and existing knowledge
2. If the session produced reusable patterns: create template
3. Close session log with final metrics

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Intent Alignment | Output matches specification | > 90% match |
| Session Efficiency | Productive time / total time | > 80% |
| Setup Compliance | Sessions starting with intent + context | > 90% |
| Checkpoint Compliance | Checkpoints completed per protocol | 100% |
| First-Time Quality | Deliverables passing review without major rework | > 70% |
| Context Effectiveness | Context loaded and utilized | All loaded context referenced |
| Lesson Capture | Sessions with lessons documented | > 80% |
| Output Reusability | Deliverables usable as-is by audience | > 85% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Intent spec defines what the session produces |
| `build-second-brain` | Bidirectional | Context loaded from second brain; outputs stored back |
| `notebooklm-context-builder` | Upstream | NotebookLM notebooks used for domain context |
| `agent-doc-control` | Downstream | Deliverables filed in document control |
| `orchestrate-or-agents` | Upstream | Sessions may be assigned as tasks |
| `audit-ai-workflow` | Upstream | Audit identifies tasks suitable for vibe sessions |

## Templates & References

**Session Kickoff Template:**
```
=== VIBE WORKING SESSION ===
Session ID: VS-{YYYY}-{NNN}
Date: {Date}
Topic: {What we are producing}
Type: {write / analyze / code / design}
Time Budget: {X minutes}

INTENT (Quick Spec):
  Making: {one sentence}
  Success = : {3 criteria}
  Constraints: {top 3}
  Output: {format and length}

CONTEXT LOADED:
  1. {Document/knowledge item 1}
  2. {Document/knowledge item 2}
  3. {Example/template}
  4. {Standards/constraints}

QUALITY CHECKLIST:
  [ ] Complete (all sections)
  [ ] Accurate (facts verified)
  [ ] Consistent (uniform style)
  [ ] Audience-appropriate
  [ ] Matches intent

Let's begin.
===
```

## Examples

**Example 1: Writing Session for OR Strategy Document**
```
Command: vibe-working-session start --topic "OR Strategy Document" --type write

SETUP (15 min):
  1. Load intent spec IS-005 "OR Strategy for Lithium Plant"
  2. Context loaded: project description, stakeholder map, OR methodology, example strategy from previous project
  3. Quality criteria: covers all 8 strategy sections, aligned with client standards, approved by steering committee
  4. AI primed with role, task, context, constraints

GENERATE (55 min):
  1. Section 1: Introduction and Background (5 min) - quality check: PASS
  2. Section 2: OR Scope and Objectives (8 min) - quality check: PASS
  3. Section 3: Organization and Governance (10 min) - quality check: REVISE (missing gate criteria)
     -> Revised with specific gate criteria from governance framework -> PASS
  4. [Checkpoint at 30 min: on track, context effective]
  5. Section 4-8: (32 min) - all pass quality checks

REFINE (15 min):
  1. Full read-through: 2 consistency issues (terminology), 1 missing cross-reference
  2. Applied 3 revisions
  3. Final check: PASS all criteria

CLOSE (5 min):
  1. Filed: doc-control/01-Management/01.01-Strategy/LIT-PMO-STR-001-OR-Strategy-Rev0.md
  2. Lessons: "Loading the previous project example was the most valuable context item"
  3. Updated second brain with OR strategy patterns

Output: OR Strategy Document complete, 4500 words, filed and ready for review.
Session duration: 90 minutes, efficiency: 87%.
```
