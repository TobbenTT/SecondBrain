# Define Intent & Specification

## Skill ID: F-001
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: Critical

## Purpose

Define the INTENT behind any AI-driven work before starting execution. Based on Nate B Jones' framework of progressive specification (elevator pitch, executive overview, full project specification, code-level specification), this skill creates a specification document that ensures AI agents produce exactly what is needed. It prevents the common failure of getting technically correct outputs that completely miss the point by forcing clarity of intent before any work begins.

## Intent & Specification

**Problem:** The number one failure mode in AI-assisted work is getting outputs that do not match the user's actual intent. Users jump straight into prompting without defining what success looks like, what constraints apply, or how the output will be used. This leads to extensive rework cycles, wasted context windows, and frustration. The root cause is that intent is never explicitly defined -- it remains implicit in the user's head while the AI guesses at it.

**Success Criteria:**
- Every significant AI-driven task has an explicit intent specification before work begins
- The specification captures: problem, success criteria, constraints, output format, and quality criteria
- Progressive specification allows starting with a rough idea and refining to precision
- Specification is reusable (same spec produces consistent results across different sessions)
- Time from vague idea to clear specification is under 30 minutes
- Downstream agents/tasks reference the specification to stay aligned
- Rework cycles reduced by >50% compared to unspecified work

**Constraints:**
- Must be fast enough that users do not skip it (under 30 minutes for full spec)
- Must work at multiple levels of detail (quick spec vs. detailed spec)
- Must produce a document that AI agents can consume as instructions
- Must capture human judgment and domain expertise that AI cannot infer
- Must be adaptable to any domain (not just OR-specific)
- Must integrate with the OR multi-agent system via Shared Task List

## Trigger / Invocation

**Manual Triggers:**
- `define-intent-specification create --topic [topic] --level [quick|standard|detailed]`
- `define-intent-specification refine --spec [file]` (iterate on existing spec)
- `define-intent-specification validate --spec [file]` (check spec completeness)

**Automatic Triggers:**
- Orchestrator detects new task without specification -> prompts user to create one
- Agent receives ambiguous instructions -> requests specification
- Quality check fails on deliverable -> trace back to specification gaps

**Recommended Invocation Points:**
- Before starting any new OR deliverable
- Before assigning a task to an agent
- Before starting a vibe working session
- Before creating a new agent specification
- When a task has been reworked more than twice

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Topic/Task Description | User | Yes | What needs to be done (can be rough) |
| Specification Level | User | No | quick (5 min), standard (15 min), detailed (30 min) |
| Domain Context | User / System | No | Industry, project, constraints context |
| Audience | User | No | Who will use the output |
| Existing Materials | User / Doc Control | No | Related documents, examples, templates |
| Previous Specifications | System | No | Related specs for reference |

## Output Specification

**Primary Output: Intent Specification Document**

```markdown
# Intent Specification: {Title}
## Spec ID: {IS-NNN}
## Created: {Date}
## Author: {Name}
## Level: {Quick / Standard / Detailed}
## Status: {Draft / Reviewed / Approved}

---

## 1. ELEVATOR PITCH (1-2 sentences)
{What is this, in the simplest possible terms?}

## 2. PROBLEM STATEMENT
### What problem are we solving?
{Clear description of the problem or need}

### Who has this problem?
{Stakeholder or user affected}

### What happens if we do not solve it?
{Consequences of inaction}

### What has been tried before?
{Previous attempts and why they fell short}

## 3. SUCCESS CRITERIA
### What does "done" look like?
{Concrete, measurable criteria for completion}

### What does "excellent" look like?
{Criteria that distinguish good from great}

### What does "failed" look like?
{Anti-patterns and failure modes to avoid}

## 4. CONSTRAINTS
### Hard Constraints (must comply)
- {Constraint 1: regulatory, technical, time, budget}
- {Constraint 2}

### Soft Constraints (should comply if possible)
- {Preference 1}
- {Preference 2}

### Out of Scope (explicitly excluded)
- {What this is NOT}
- {What we will NOT do}

## 5. OUTPUT SPECIFICATION
### Format
{Document type, file format, structure}

### Length/Size
{Expected size, page count, word count}

### Structure
{Outline or table of contents of expected output}

### Examples
{Reference examples of similar outputs}

## 6. QUALITY CRITERIA
### Accuracy
{How will we verify the output is correct?}

### Completeness
{What constitutes a complete output?}

### Usability
{Can the intended audience use the output as-is?}

### Consistency
{Does it align with related deliverables?}

## 7. CONTEXT & REFERENCES
### Background Documents
{List of documents the AI should reference}

### Domain Knowledge
{Specific domain facts the AI needs to know}

### Terminology
{Key terms and their definitions}

### Standards
{Applicable standards, templates, guidelines}

## 8. PROMPT/INSTRUCTION SET (for AI agent)
{The actual instruction derived from sections 1-7 that an AI agent should follow}

---
## Revision History
| Rev | Date | Author | Changes |
|-----|------|--------|---------|
| 0   | {Date} | {Author} | Initial specification |
```

**Quick Spec Output (5 minutes):**
```markdown
# Quick Spec: {Title}
## Elevator Pitch: {1 sentence}
## Problem: {1-2 sentences}
## Success Criteria: {3 bullet points}
## Constraints: {3 bullet points}
## Output Format: {1 sentence}
## Quality Check: {How will we know it is good?}
```

## Methodology & Standards

- **Progressive Specification:** Start vague, get precise. The framework supports four levels of detail:
  1. **Elevator Pitch** (30 seconds): One sentence describing what and why
  2. **Executive Overview** (5 minutes): Problem, success criteria, key constraints
  3. **Full Specification** (15-30 minutes): Complete spec document with all sections
  4. **Code-Level Specification** (30-60 minutes): Detailed enough for an AI to execute with minimal ambiguity

- **Intent Before Execution:** The cardinal rule is: never start execution without at least a Quick Spec. The more significant the task, the more detailed the specification should be.

- **Specification Validation:** A good specification can be handed to a different person (or AI) and they would produce substantially the same output. If two people would interpret it differently, it needs refinement.

- **Anti-Pattern Detection:** Common specification failures:
  - Too vague: "Make it good" (what is good?)
  - Too narrow: Over-specifying how, under-specifying what
  - Missing audience: Not defining who uses the output
  - Missing constraints: Not defining what cannot be done
  - Missing examples: Not showing what similar outputs look like

- **Iteration Protocol:** Specifications should be refined based on:
  1. Initial draft by user
  2. AI challenge questions (does the spec have gaps?)
  3. User refinement based on questions
  4. Validation (could someone else execute from this spec?)

## Step-by-Step Execution

### Step 1: Capture the Elevator Pitch
1. Ask the user: "In one sentence, what do you need?"
2. Record the elevator pitch
3. Identify key nouns (the "what") and key verbs (the "action")
4. Determine if this is a: create, analyze, improve, document, decide, or communicate task
5. Assess appropriate specification level based on task complexity

### Step 2: Define the Problem
1. Ask: "What problem are we solving?"
2. Challenge: "What happens if we do NOT do this?"
3. Ask: "Who cares about this? Who will use the output?"
4. Ask: "Has this been attempted before? What went wrong?"
5. Record answers in Problem Statement section

### Step 3: Define Success Criteria
1. Ask: "How will you know this is done?"
2. Push for specificity: convert adjectives to metrics
   - "A good report" -> "A report that the steering committee approves without major revision"
   - "Complete analysis" -> "Analysis covering all 10 process areas with risk ratings"
3. Ask: "What would make this excellent vs. merely acceptable?"
4. Ask: "What are the ways this could fail? What should we definitely avoid?"
5. Record criteria in Success Criteria section

### Step 4: Identify Constraints
1. Ask: "What MUST this comply with?" (hard constraints)
   - Regulations, standards, templates, deadlines, budgets
   - Technical limitations (tool capabilities, data availability)
   - Organizational constraints (approvals, policies)
2. Ask: "What SHOULD this comply with if possible?" (soft constraints)
   - Preferences, nice-to-haves, style guides
3. Ask: "What is explicitly OUT OF SCOPE?"
   - Prevent scope creep by defining boundaries
4. Record in Constraints section

### Step 5: Specify the Output
1. Ask: "What format should the output be in?"
   - Document type, file format, presentation format
2. Ask: "How long/detailed should it be?"
   - Page count, section count, depth of analysis
3. Ask: "What structure should it follow?"
   - Provide outline, table of contents, or reference example
4. Ask: "Can you show me an example of something similar?"
   - Reference documents, competitor examples, previous versions
5. Record in Output Specification section

### Step 6: Define Quality Criteria
1. Ask: "How will we verify the output is correct?"
   - Review process, validation checks, accuracy tests
2. Ask: "What constitutes a complete output?"
   - Checklist of required elements
3. Ask: "Can the intended audience use this as-is?"
   - Usability assessment
4. Ask: "Does this need to be consistent with other deliverables?"
   - Cross-references, terminology, formatting
5. Record in Quality Criteria section

### Step 7: Compile Context and References
1. List all documents the AI should reference
2. Note domain-specific knowledge needed
3. Define key terminology
4. Reference applicable standards and templates
5. Record in Context section

### Step 8: Generate Prompt/Instruction Set
1. Synthesize sections 1-7 into a clear instruction for the AI agent
2. Structure as: role, context, task, constraints, output format, quality criteria
3. Test instruction clarity: could a different AI produce the right output from this?
4. If not: refine until unambiguous
5. Record in Prompt/Instruction Set section

### Step 9: Validate and Finalize
1. Review complete specification for internal consistency
2. Check for gaps: any section left blank or vague?
3. Ask user to confirm: "Does this capture your intent?"
4. If yes: set status to "Approved"
5. If no: iterate on unclear sections
6. File specification in document control (via agent-doc-control)

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Specification Completeness | All required sections populated | 100% for standard/detailed |
| Specification Clarity | Could a different AI produce same output? | Yes (validated) |
| Time to Specification | Time from start to approved spec | < 30 min (detailed) |
| Rework Reduction | Tasks needing major rework after spec | < 20% |
| User Satisfaction | User confirms intent captured correctly | > 90% |
| Reusability | Spec produces consistent results across sessions | Yes |
| Downstream Adoption | Tasks referencing specification | > 80% of significant tasks |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Upstream | Orchestrator may require specs before task assignment |
| All `agent-*` | Downstream | Agents reference specifications for task execution |
| `create-agent-specification` | Sibling | Uses this framework for agent-level specifications |
| `vibe-working-session` | Upstream | Vibe sessions start with intent specification |
| `build-second-brain` | Downstream | Specifications stored in second brain for reference |
| `agent-doc-control` | Downstream | Specifications filed as controlled documents |

## Templates & References

**Quick Spec Template (5-minute version):**
```markdown
# Quick Spec: {Title}
**Date:** {Date}

**Elevator Pitch:** {One sentence: what and why}

**Problem:** {1-2 sentences describing the problem}

**Success = :**
1. {Measurable criterion 1}
2. {Measurable criterion 2}
3. {Measurable criterion 3}

**Constraints:**
- MUST: {Hard constraint}
- MUST NOT: {Exclusion}
- SHOULD: {Preference}

**Output:** {Format, length, structure in one sentence}

**Good enough when:** {Single quality check}
```

**Specification Challenge Questions:**
```
1. If I gave this spec to someone else, would they produce the same output? (Clarity)
2. Is there anything I am assuming that is not written down? (Completeness)
3. Could this output be "correct" but still useless? (Relevance)
4. What is the simplest version of this that would still be valuable? (Scope)
5. What will the user DO with this output next? (Utility)
6. What would make me reject this output? (Quality)
```

## Examples

**Example 1: Quick Spec for SOP Development**
```
Command: define-intent-specification create --topic "SOPs for Area 100" --level quick

Quick Spec: Area 100 Standard Operating Procedures

Elevator Pitch: Write 18 SOPs for Area 100 (Evaporation) so operators can safely
start, operate, and shut down the evaporation process.

Problem: No operating procedures exist for the new evaporation area.
Operators cannot be trained or certified without approved SOPs.

Success =:
1. All 18 SOPs written per template, covering normal, startup, shutdown, and emergency
2. Each SOP reviewed by HSE agent for safety compliance
3. SOPs are specific to THIS plant (not generic)

Constraints:
- MUST: Follow client SOP template (from doc-control)
- MUST: Include safety requirements per HSE standards
- MUST NOT: Include design information (only operational steps)
- SHOULD: Be written at a level understandable by field operators

Output: 18 Markdown files, each 5-15 pages, following SOP template structure

Good enough when: A qualified operator can follow the SOP to safely perform the procedure
without needing to ask for additional information.
```

**Example 2: Detailed Spec for OPEX Model**
```
Command: define-intent-specification create --topic "OPEX Model" --level detailed

[Full specification document generated with all 8 sections]

Key sections:
  Problem: "No OPEX model exists. Leadership cannot make operating decisions
   without understanding cost implications."

  Success Criteria:
  - Bottom-up OPEX model with inputs from all workstreams
  - Unit cost calculated ($/ton)
  - 5-year projection with Year 1 ramp-up
  - Sensitivity analysis on 3 key variables
  - Benchmarked against industry data

  Constraints:
  - MUST use client chart of accounts
  - MUST handle CLP and USD
  - MUST NOT include CAPEX items
  - SHOULD align with project financial model

  Output: Excel model + executive summary (5 pages)

  Prompt/Instruction Set:
  "You are agent-finance. Using the inputs collected from all agents,
   build a bottom-up OPEX model for the Lithium Plant. Structure costs
   by: labor, materials, services, utilities. Project for 5 years with
   Year 1 including ramp-up premium of 15%. Calculate unit cost at
   design throughput. Run sensitivity analysis on energy cost (+/- 20%),
   labor cost (+/- 10%), and production rate (80-110% of design).
   Compare to industry benchmark of $145-180/ton."
```

**Example 3: Spec Validation**
```
Command: define-intent-specification validate --spec "IS-012-OPEX-Model.md"

Validation Results:
  [PASS] Elevator Pitch: Clear and concise
  [PASS] Problem Statement: Specific with consequences defined
  [PASS] Success Criteria: 5 measurable criteria
  [PASS] Constraints: Hard, soft, and exclusions defined
  [WARNING] Output Specification: No example referenced
  [PASS] Quality Criteria: Accuracy and completeness defined
  [WARNING] Context: Missing reference to client chart of accounts document
  [PASS] Prompt/Instruction Set: Clear, executable

  Overall: PASS WITH WARNINGS
  Recommendations:
  1. Add reference to similar OPEX model as example
  2. Reference specific client chart of accounts document number
```
