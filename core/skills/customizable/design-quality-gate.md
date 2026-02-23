# Design Quality Gate

## Skill ID: F-011
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Design quality gate criteria and validation checklists for any deliverable in the OR multi-agent system. A quality gate is the set of pass/fail criteria that a deliverable must satisfy before it can advance to the next stage -- whether that stage is human review, client delivery, downstream agent consumption, or archival. This skill creates the rules used by hooks (TaskCompleted, TeammateIdle, PreDelivery) and by the `validate-output-quality` skill to determine what passes, what gets sent back for improvement with specific feedback, and what gets rejected outright. It is the design-time complement to the run-time validation skill.

## Intent & Specification

**Problem:** Without predefined quality gates, every deliverable review is ad-hoc. One reviewer might focus on formatting while another focuses on technical accuracy, leading to inconsistent quality standards. Agents complete tasks and declare "done" without any objective criteria for what "done" means. Hooks that fire on task completion have no rules to evaluate against, so they either rubber-stamp everything or create bottlenecks by requiring human review of every output. The result is a system that either lets poor quality through or slows everything down with manual gatekeeping.

**Success Criteria:**
- Every deliverable type in the OR system has a predefined quality gate specification
- Quality gates are specific enough for automated evaluation (no subjective criteria without operationalization)
- Each gate defines three outcomes: PASS (advance), CONDITIONAL PASS (fix specific items), FAIL (reject)
- Quality gates integrate with TaskCompleted and TeammateIdle hooks for automated enforcement
- Gates are configurable per project, client, and deliverable type
- Time to design a quality gate for a new deliverable type is under 30 minutes
- Quality gates reduce escaped defects (defects reaching the client) by >70%

**Constraints:**
- Must produce machine-evaluable criteria (for automated hooks) alongside human-readable descriptions
- Must be compatible with the six-dimension framework from `validate-output-quality`
- Must support different rigor levels (internal draft, internal final, client draft, client final)
- Must handle both document-type deliverables and data-type deliverables
- Must not create bureaucratic overhead (gates should accelerate quality, not slow delivery)
- Must be reusable across projects with configuration rather than redesign
- Must produce clear, actionable feedback when a deliverable does not pass

## Trigger / Invocation

**Manual Triggers:**
- `design-quality-gate create --deliverable-type [type] --rigor [internal|client|regulatory]`
- `design-quality-gate customize --gate [file] --project [name]` (adapt existing gate for project)
- `design-quality-gate validate --gate [file]` (check gate specification completeness)
- `design-quality-gate test --gate [file] --sample [deliverable]` (dry-run gate on a sample)
- `design-quality-gate list --scope [project|all]` (list all defined gates)

**Automatic Triggers:**
- New deliverable type identified in project scope -> design quality gate
- Quality validation fails repeatedly for same type -> review and tighten gate
- Client feedback indicates quality issue -> update relevant gates
- New project onboarding -> customize gates for project context

**Recommended Invocation Points:**
- During project setup (define gates for all planned deliverables)
- When creating a new skill that produces deliverables
- When a new agent specification is created (define output quality gates)
- After post-mortem reveals quality escape

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Deliverable Type | User / Orchestrator | Yes | Type of deliverable the gate applies to (e.g., "Maintenance Strategy," "OPEX Model," "SOP") |
| Rigor Level | User / Project Config | Yes | internal_draft, internal_final, client_draft, client_final, regulatory |
| Intent Specification | define-intent-specification | Recommended | The spec defining what the deliverable should be |
| Domain Standards | Knowledge Base | No | Applicable industry or client standards |
| Client Requirements | Project Config | No | Client-specific quality requirements |
| Previous Gate Results | System | No | Historical pass/fail data for this deliverable type |
| Prompt Contract | create-prompt-contract | No | Contract defining expected output format |
| Related Gates | System | No | Gates for related deliverables (for consistency) |

## Output Specification

**Primary Output: Quality Gate Specification**

```markdown
# Quality Gate: {Deliverable Type}
## Gate ID: {QG-NNN}
## Version: {Major.Minor}
## Rigor Level: {internal_draft / internal_final / client_draft / client_final / regulatory}
## Applicable To: {List of deliverable types or agents}
## Created: {Date}
## Author: {Name}

---

## Gate Summary
{One paragraph describing what this gate checks and why}

## Pass Thresholds
| Outcome | Overall Score | Dimension Minimums | Condition |
|---------|--------------|-------------------|-----------|
| PASS | >= {X}% | All dimensions >= {Y}% | {any additional conditions} |
| CONDITIONAL PASS | >= {X}% | No dimension < {Y}% | {conditions for conditional} |
| FAIL | < {X}% | OR any dimension < {Y}% | {auto-fail conditions} |

## Checklist

### Mandatory Checks (all must pass for PASS)
- [ ] {Check 1: description} — Evaluation: {how to verify}
- [ ] {Check 2: description} — Evaluation: {how to verify}
- [ ] {Check 3: description} — Evaluation: {how to verify}

### Standard Checks (80% must pass for PASS)
- [ ] {Check 4: description} — Evaluation: {how to verify}
- [ ] {Check 5: description} — Evaluation: {how to verify}

### Enhanced Checks (required for client_final and regulatory only)
- [ ] {Check 6: description} — Evaluation: {how to verify}
- [ ] {Check 7: description} — Evaluation: {how to verify}

## Dimension-Specific Criteria

### Technical Accuracy Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| TA-01 | {specific check} | {how to evaluate} | {rigor levels} |
| TA-02 | {specific check} | {how to evaluate} | {rigor levels} |

### Completeness Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| CO-01 | {specific check} | {how to evaluate} | {rigor levels} |
| CO-02 | {specific check} | {how to evaluate} | {rigor levels} |

### Consistency Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| CN-01 | {specific check} | {how to evaluate} | {rigor levels} |

### Format Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| FM-01 | {specific check} | {how to evaluate} | {rigor levels} |

### Actionability Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| AC-01 | {specific check} | {how to evaluate} | {rigor levels} |

### Traceability Gate
| Check | Criterion | Evaluation Method | Required for |
|-------|-----------|-------------------|-------------|
| TR-01 | {specific check} | {how to evaluate} | {rigor levels} |

## Feedback Templates

### CONDITIONAL PASS Feedback
```
Gate: {QG-NNN} | Result: CONDITIONAL PASS | Score: {X}%
Required before advancement:
1. {Specific fix with location and expected change}
2. {Specific fix with location and expected change}
Estimated effort: {time}
Revalidation required: {yes/no}
```

### FAIL Feedback
```
Gate: {QG-NNN} | Result: FAIL | Score: {X}%
Critical issues:
1. {Issue with impact and root cause}
2. {Issue with impact and root cause}
Remediation path: {regenerate / major revision / specification review}
Escalation: {if needed, who to notify}
```

## Hook Integration

### TaskCompleted Hook Configuration
```yaml
hook: TaskCompleted
gate: QG-{NNN}
trigger: "agent marks task as done"
action:
  pass: "advance task to next stage"
  conditional: "return to agent with feedback, keep task open"
  fail: "reject output, create remediation task, notify orchestrator"
timeout: {seconds}
```

### TeammateIdle Hook Configuration
```yaml
hook: TeammateIdle
gate: QG-{NNN}
trigger: "idle agent available for review"
action: "assign pending validation to idle agent using this gate"
priority: {priority level}
```

## Configuration Overrides
{Project-specific or client-specific overrides for this gate}

---
## Revision History
| Rev | Date | Author | Changes |
|-----|------|--------|---------|
| 1.0 | {Date} | {Author} | Initial gate design |
```

**Compact Gate Format (for simple deliverables):**
```markdown
# Gate: {Type} (QG-{NNN})
**Rigor:** {level}

**PASS when:**
- Overall score >= {X}%
- All mandatory checks pass
- {additional condition}

**Mandatory Checks:**
- [ ] {check 1}
- [ ] {check 2}
- [ ] {check 3}

**FAIL when:**
- Any mandatory check fails
- Overall score < {X}%
- {auto-fail condition}

**Hook:** TaskCompleted -> validate -> {pass/conditional/fail}
```

## Methodology & Standards

- **Gate Design Principles:**
  1. **Objective over Subjective:** Every check must be evaluable without subjective judgment. "Well-written" is subjective. "Follows SOP template structure with all 9 required sections" is objective.
  2. **Mandatory vs Standard vs Enhanced:** Not all checks are equal. Mandatory checks are non-negotiable (safety, regulatory, structural completeness). Standard checks cover quality norms. Enhanced checks apply only to high-rigor deliverables.
  3. **Fail Fast, Feedback Specific:** When a gate fails, the feedback must tell the producing agent exactly what to fix. Generic "improve quality" is forbidden.
  4. **Rigor Proportional to Risk:** Internal drafts need lighter gates than client-facing documents. Regulatory submissions need the heaviest gates. Design gates with the right rigor for the context.
  5. **Reusable by Design:** Gates should be parameterizable. The same gate structure for "Strategy Document" can be customized per project by adjusting thresholds and adding project-specific checks.

- **Rigor Level Definitions:**
  - **internal_draft:** Minimum viable quality for team review. Focus on completeness and structure. Accuracy checked at high level. Score threshold: 70%.
  - **internal_final:** Quality sufficient for internal approval. All dimensions checked. Score threshold: 80%.
  - **client_draft:** Quality suitable for client review. Enhanced formatting and consistency. Score threshold: 85%.
  - **client_final:** Publication-ready quality. All enhanced checks. Score threshold: 91%.
  - **regulatory:** Maximum rigor. Full traceability, source verification, calculation audit. Score threshold: 95%.

- **Checklist Design Rules:**
  - Each check must be a single, atomic verification (not compound)
  - Each check must have a defined evaluation method (not just "check if good")
  - Each check must map to at least one quality dimension
  - Mandatory checks should number 3-7 (too few = not rigorous, too many = bottleneck)
  - Standard checks should number 5-15 depending on deliverable complexity
  - Enhanced checks should add 3-8 additional verifications

- **Hook Integration Protocol:**
  - TaskCompleted hook: fires when any agent marks a task as complete. The hook loads the applicable quality gate and runs automated validation. Results determine next action.
  - TeammateIdle hook: fires when an agent has no assigned tasks. The hook checks for pending validations and assigns them to the idle agent using the appropriate quality gate.
  - PreDelivery hook: fires before any deliverable is sent to external stakeholder. Enforces client_final or regulatory rigor level regardless of original setting.

- **Gate Evolution:**
  - Track pass/fail/conditional rates per gate over time
  - If a gate passes everything (>95% pass rate): it may be too lenient, review and tighten
  - If a gate fails everything (<50% pass rate): it may be too strict or the producing agents need improvement
  - Adjust gates quarterly based on quality metrics and client feedback

## Step-by-Step Execution

### Step 1: Identify the Deliverable and Context
1. Determine the deliverable type (e.g., Maintenance Strategy, SOP, OPEX Model, Risk Assessment)
2. Identify the rigor level required (internal_draft through regulatory)
3. Load the intent specification for the deliverable (if available)
4. Load the prompt contract (if available)
5. Identify applicable standards and client requirements
6. Check for existing gates for similar deliverable types

### Step 2: Define Pass Thresholds
1. Set the overall score thresholds for PASS, CONDITIONAL PASS, and FAIL based on rigor level:
   - Use the standard thresholds as starting point (70/80/85/91/95%)
   - Adjust based on client expectations and deliverable criticality
2. Set dimension-specific minimums:
   - Technical Accuracy minimum: typically 70% (80% for safety-critical)
   - Completeness minimum: typically 60% (80% for client-final)
   - Other dimensions: typically 50% minimum
3. Define auto-fail conditions:
   - Any mandatory check failure = auto FAIL
   - Safety-critical error detected = auto FAIL
   - Client-specified mandatory requirements missing = auto FAIL

### Step 3: Design Mandatory Checks
1. Identify the non-negotiable requirements for this deliverable type:
   - Structural: required sections/components present
   - Safety: safety-critical content included and correct
   - Regulatory: compliance requirements met
   - Client: client-specified must-haves
2. For each mandatory check, define:
   - The check description (what is being verified)
   - The evaluation method (how to verify: automated pattern match, content check, calculation verification)
   - The failure impact (what happens if this check fails)
3. Keep mandatory checks to 3-7 items (focus on critical requirements)

### Step 4: Design Standard Checks
1. Identify the quality expectations for a well-executed deliverable:
   - Accuracy: data points verified, calculations correct, standards properly applied
   - Completeness: depth of coverage adequate, edge cases addressed
   - Consistency: terminology uniform, cross-references valid, data aligned
   - Format: template followed, professional presentation, appropriate length
   - Actionability: recommendations clear, next steps defined, audience appropriate
   - Traceability: sources cited, assumptions stated, methodology documented
2. For each standard check, define:
   - Check description
   - Evaluation method
   - Which quality dimension it maps to
   - Which rigor levels require it
3. Target 5-15 standard checks depending on deliverable complexity

### Step 5: Design Enhanced Checks (for client_final and regulatory)
1. Identify additional verifications needed for high-stakes deliverables:
   - Source verification: trace every data point to its source
   - Calculation audit: independently verify all calculations
   - Cross-deliverable consistency: check against all related deliverables
   - Peer review compliance: verify peer review has been completed
   - Formatting perfection: zero formatting errors
   - Legal/regulatory review: verify regulatory compliance claims
2. For each enhanced check, define the same attributes as standard checks
3. Target 3-8 enhanced checks

### Step 6: Create Feedback Templates
1. Design CONDITIONAL PASS feedback template:
   - List specific items to fix with precise locations
   - Estimate revision effort
   - Indicate whether revalidation is required after fixes
2. Design FAIL feedback template:
   - List critical issues with impact assessment
   - Provide root cause analysis (why did this fail?)
   - Define remediation path (minor revision, major revision, regeneration)
   - Identify escalation needs (notify orchestrator, notify user, notify client)
3. Ensure feedback is specific enough for the producing agent to act without ambiguity

### Step 7: Configure Hook Integration
1. Define TaskCompleted hook behavior:
   - Which gate applies to which task types
   - Timeout for automated validation
   - Actions for each outcome (pass, conditional, fail)
   - Notification rules
2. Define TeammateIdle hook behavior:
   - Priority for validation assignments
   - Which agents can perform validation for which deliverable types
   - Queue management rules
3. Define PreDelivery hook behavior:
   - Mandatory rigor level override for external deliverables
   - Bypass conditions (if any, e.g., previously validated and unchanged)

### Step 8: Test the Gate
1. Dry-run the gate against a known-good deliverable:
   - Should receive PASS
   - If not: gate may be too strict, adjust
2. Dry-run against a known-poor deliverable:
   - Should receive FAIL
   - If not: gate may be too lenient, tighten
3. Dry-run against a borderline deliverable:
   - Should receive CONDITIONAL PASS
   - Verify feedback is specific and actionable
4. Adjust thresholds and checks based on test results

### Step 9: Document and Deploy
1. Complete the Quality Gate Specification document
2. Version the gate (start at 1.0)
3. Register the gate in the quality gate registry
4. Configure hooks to use the gate
5. Notify affected agents and operators
6. Store in knowledge base for reference

### Step 10: Monitor and Evolve
1. Track gate metrics monthly:
   - Pass rate, conditional rate, fail rate
   - Average score by dimension
   - Most common failure reasons
   - Time spent on remediation
2. Review gates quarterly:
   - Are thresholds appropriate?
   - Are checks still relevant?
   - Do new failure patterns suggest new checks?
3. Update gate version when changes are made

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Gate Completeness | All required sections populated | 100% |
| Check Objectivity | Checks with defined evaluation method | 100% |
| Feedback Specificity | Feedback that enables fix without guessing | 100% |
| Rigor Appropriateness | Gates calibrated to correct rigor level | Validated by test run |
| Escaped Defects | Defects reaching clients after passing gate | < 5% |
| False Fail Rate | Deliverables failing that should pass | < 10% |
| Gate Design Time | Time to design gate for new deliverable type | < 30 minutes |
| Hook Integration | Gates successfully integrated with hooks | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `validate-output-quality` | Downstream | Uses gate criteria to perform validation scoring |
| `define-intent-specification` | Upstream | Intent specs provide requirements that gates verify |
| `create-prompt-contract` | Upstream | Prompt contracts define expected formats gates check |
| `orchestrate-or-agents` | Consumer | Orchestrator enforces gates via hooks |
| All `agent-*` | Consumer | Agents must satisfy gates for their deliverables |
| `agent-doc-control` | Consumer | Doc control gates ensure document standards |
| `build-second-brain` | Downstream | Gate designs stored in knowledge base |
| `generate-daily-nudge` | Downstream | Gate pass/fail rates reported in daily nudge |

## Templates & References

**Gate Design Quick Reference:**
```
Rigor Thresholds:
  internal_draft:  PASS >= 70%, FAIL < 55%
  internal_final:  PASS >= 80%, FAIL < 65%
  client_draft:    PASS >= 85%, FAIL < 70%
  client_final:    PASS >= 91%, FAIL < 75%
  regulatory:      PASS >= 95%, FAIL < 80%

Check Counts by Rigor:
  internal_draft:  3 mandatory, 5 standard, 0 enhanced
  internal_final:  5 mandatory, 8 standard, 0 enhanced
  client_draft:    5 mandatory, 10 standard, 3 enhanced
  client_final:    7 mandatory, 12 standard, 5 enhanced
  regulatory:      7 mandatory, 15 standard, 8 enhanced
```

**Common Mandatory Checks (reusable across deliverable types):**
```markdown
- [ ] MC-01: All sections specified in intent specification are present
- [ ] MC-02: Document follows the required template structure
- [ ] MC-03: No placeholder text or TODO markers remain in the output
- [ ] MC-04: All data tables contain actual values (no blanks or "TBD")
- [ ] MC-05: Safety-critical content reviewed and marked as verified
- [ ] MC-06: Document metadata (title, date, author, revision) is complete
- [ ] MC-07: All cross-references resolve to actual content
```

## Examples

**Example 1: Designing a Gate for SOP Deliverables**
```
Command: design-quality-gate create --deliverable-type "Standard Operating Procedure" --rigor client_final

Quality Gate: QG-015-SOP
Rigor: client_final

Pass Thresholds:
  PASS: >= 91%, all mandatory checks pass, all dimensions >= 60%
  CONDITIONAL: >= 85%, no mandatory fails, max 2 standard fails
  FAIL: < 85% OR any mandatory fail

Mandatory Checks (7):
  MC-01: All 9 SOP template sections present (Purpose through References)
  MC-02: Safety requirements section is non-empty and specific to the procedure
  MC-03: Procedure steps are numbered, sequential, and include cautions where needed
  MC-04: Equipment tags match the plant equipment register
  MC-05: LOTO requirements specified for all energy isolation points
  MC-06: Emergency response references included for hazardous procedures
  MC-07: Document metadata complete (SOP number, revision, area, effective date)

Standard Checks (12):
  SC-01: Procedure steps written in imperative form ("Open valve XV-101")
  SC-02: Each step is a single action (no compound steps)
  SC-03: Required tools and materials list is complete
  SC-04: Prerequisites are defined and verifiable
  SC-05: Post-operation checks verify the procedure was successful
  SC-06: Terminology consistent with plant glossary
  SC-07: Step sequence is operationally logical
  SC-08: Caution/Warning/Danger notices properly classified
  SC-09: Cross-references to other SOPs are valid
  SC-10: Written at appropriate reading level for field operators
  SC-11: Includes hold points where supervisor verification is required
  SC-12: Estimated procedure duration is specified

Enhanced Checks (5):
  EC-01: Peer-reviewed by operations SME
  EC-02: HSE agent review completed
  EC-03: Cross-referenced with P&IDs and verified
  EC-04: Emergency procedures aligned with Emergency Response Plan
  EC-05: Formatting meets client document standards manual
```

**Example 2: Customizing a Gate for Project Context**
```
Command: design-quality-gate customize --gate "QG-010-Strategy-Document" --project "Lithium-Plant"

Original Gate: QG-010 (Strategy Document, client_final)

Project Customizations:
  1. Added mandatory check: "Must reference Lithium Plant design basis document (LIT-ENG-DB-001)"
  2. Added standard check: "Must include ramp-up considerations for Year 1"
  3. Modified threshold: Technical Accuracy minimum raised from 70% to 80% (client requirement)
  4. Added enhanced check: "Must include comparison to Salar de Atacama benchmark data"
  5. Added client terminology requirement: "Use 'brine' not 'leach solution' per client standard"

Output: QG-010-LIT (project-specific variant)
  Inherits all checks from QG-010
  Adds 5 project-specific checks
  Modified thresholds apply to this project only
```

**Example 3: Gate Test Run**
```
Command: design-quality-gate test --gate "QG-015-SOP" --sample "SOP-Area100-Startup-Draft.md"

Dry Run Results:
  Gate: QG-015-SOP | Sample: SOP-Area100-Startup-Draft.md

  Mandatory Checks: 5 of 7 PASS
    [FAIL] MC-04: Equipment tag "PU-102A" not found in equipment register (register has "PU-102-A")
    [FAIL] MC-05: LOTO requirements missing for HX-103 steam isolation

  Standard Checks: 10 of 12 PASS
    [FAIL] SC-08: Step 12 uses "Caution" but should be "Warning" (involves hot surfaces > 60C)
    [FAIL] SC-11: No hold points defined for nitrogen purge verification

  Overall: Would result in FAIL (mandatory check failures)

  Gate Assessment:
  - Gate correctly caught equipment tag format mismatch (real issue)
  - Gate correctly caught missing LOTO requirement (real safety issue)
  - Gate may be overly strict on SC-08 Caution/Warning classification (review threshold)
  - Recommendation: Gate is well-calibrated. Adjust SC-08 to flag as advisory rather than fail.
```
