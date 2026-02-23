# Validate Output Quality

## Skill ID: F-009
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: Critical

## Purpose

Validate any AI-generated output against its original intent specification, producing a structured quality scorecard across six weighted dimensions. This skill ensures that every deliverable leaving the OR multi-agent system meets SME-grade quality standards before it reaches a human reviewer. It is the last automated checkpoint between generation and delivery, catching errors, gaps, inconsistencies, and misalignment that would otherwise require expensive human rework cycles. Used by the Quality Validator agent, TaskCompleted hooks, and any agent that needs to self-assess its own output before submission.

## Intent & Specification

**Problem:** AI-generated outputs frequently pass superficial review but fail under scrutiny. A document may look professional but contain inaccurate technical data. A plan may cover all sections but contradict decisions made in a related deliverable. An analysis may be thorough but impossible to act on because it lacks clear recommendations. Without a systematic, multi-dimensional quality validation framework, quality assessment is subjective, inconsistent, and dependent on whoever happens to review the output. This leads to deliverables that vary wildly in quality, rework cycles that consume 30-40% of project time, and erosion of client trust when substandard outputs slip through.

**Success Criteria:**
- Every AI-generated output is scored across 6 weighted quality dimensions before delivery
- Scoring is consistent: the same output receives the same score regardless of which agent or session runs the validation
- Outputs scoring above 91% are SME-grade and can be delivered with minimal human review
- Outputs scoring 75-90% are flagged for targeted improvement with specific feedback
- Outputs scoring below 75% are rejected with clear rationale and remediation guidance
- Validation time is under 5 minutes for standard documents (under 20 pages)
- False positive rate (passing outputs that should fail) is below 5%
- False negative rate (failing outputs that should pass) is below 10%

**Constraints:**
- Must validate against a specific intent specification (not generic quality)
- Must produce actionable feedback (not just scores, but what to fix)
- Must handle all output types: documents, data models, analyses, plans, presentations
- Must not require domain expertise in the validator (the specification provides the criteria)
- Must be fast enough to run as part of automated hooks without creating bottlenecks
- Must produce auditable validation records for traceability
- Must integrate with the OR multi-agent system via Shared Task List and hook architecture

## Trigger / Invocation

**Manual Triggers:**
- `validate-output-quality validate --output [file] --spec [intent-spec-file]`
- `validate-output-quality score --output [file] --dimension [dimension]`
- `validate-output-quality compare --output1 [file] --output2 [file] --spec [spec]`
- `validate-output-quality report --project [name] --period [date-range]`

**Automatic Triggers:**
- TaskCompleted hook: agent marks a task as done -> validation runs automatically
- TeammateIdle hook: when an idle agent can be assigned validation work
- Pre-delivery gate: before any deliverable is sent to client or stakeholder
- Quality audit: periodic batch validation of recent outputs

**Recommended Invocation Points:**
- After every agent completes a deliverable
- Before filing a document via agent-doc-control
- Before presenting output in a vibe working session checkpoint
- When an output has been revised (validate the revision)
- During weekly quality reviews of agent outputs

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Output to Validate | Agent / User | Yes | The AI-generated deliverable (document, analysis, model, plan) |
| Intent Specification | define-intent-specification | Yes | The specification that defines what the output should be |
| Validation Level | User / Hook Config | No | quick (2 min), standard (5 min), deep (15 min) |
| Domain Standards | Knowledge Base | No | Applicable industry or client standards |
| Related Deliverables | Doc Control | No | Related outputs for consistency checking |
| Previous Validation | System | No | Previous validation results for the same output (for revision tracking) |
| Custom Weights | User | No | Override default dimension weights for specific use cases |

## Output Specification

**Primary Output: Quality Validation Scorecard**

```markdown
# Quality Validation Scorecard
## Output: {Output Title}
## Spec Reference: {IS-NNN}
## Validated: {Date and Time}
## Validator: {Agent or User}
## Validation Level: {Quick / Standard / Deep}

---

## Overall Score: {XX.X}% — {PASS / CONDITIONAL PASS / FAIL}

## Dimension Scores

| # | Dimension | Weight | Score (0-100) | Weighted Score | Verdict |
|---|-----------|--------|---------------|----------------|---------|
| 1 | Technical Accuracy | 30% | {score} | {weighted} | {pass/flag/fail} |
| 2 | Completeness | 25% | {score} | {weighted} | {pass/flag/fail} |
| 3 | Consistency | 15% | {score} | {weighted} | {pass/flag/fail} |
| 4 | Format & Structure | 10% | {score} | {weighted} | {pass/flag/fail} |
| 5 | Actionability | 10% | {score} | {weighted} | {pass/flag/fail} |
| 6 | Traceability | 10% | {score} | {weighted} | {pass/flag/fail} |

## Dimension Detail

### 1. Technical Accuracy (30%)
**Score: {score}/100**
**Assessment:** {Description of accuracy evaluation}
- Verified facts/data points: {N} of {N}
- Errors found: {list or "none"}
- Standards compliance: {compliant / non-compliant / N/A}
- Domain accuracy: {assessment}

### 2. Completeness (25%)
**Score: {score}/100**
**Assessment:** {Description of completeness evaluation}
- Required sections present: {N} of {N}
- Missing elements: {list or "none"}
- Depth of coverage: {adequate / insufficient / exceeds requirements}
- Specification requirements met: {N} of {N}

### 3. Consistency (15%)
**Score: {score}/100**
**Assessment:** {Description of consistency evaluation}
- Internal consistency: {consistent / inconsistencies found}
- Terminology consistency: {consistent / varies}
- Cross-deliverable alignment: {aligned / misaligned / N/A}
- Data consistency: {consistent / discrepancies found}

### 4. Format & Structure (10%)
**Score: {score}/100**
**Assessment:** {Description of format evaluation}
- Template compliance: {compliant / deviations found}
- Structure follows specification: {yes / partially / no}
- Formatting quality: {professional / acceptable / poor}
- Readability: {high / medium / low}

### 5. Actionability (10%)
**Score: {score}/100**
**Assessment:** {Description of actionability evaluation}
- Clear recommendations: {yes / partially / no}
- Next steps defined: {yes / partially / no}
- Decision-ready: {yes / needs clarification / no}
- Audience appropriateness: {appropriate / needs adjustment}

### 6. Traceability (10%)
**Score: {score}/100**
**Assessment:** {Description of traceability evaluation}
- Source references provided: {all / partial / none}
- Methodology documented: {yes / partially / no}
- Assumptions stated: {yes / partially / no}
- Audit trail: {complete / partial / missing}

## Feedback Summary

### Strengths
- {Strength 1}
- {Strength 2}

### Required Improvements (for CONDITIONAL PASS)
1. {Specific improvement with location and guidance}
2. {Specific improvement with location and guidance}

### Critical Issues (for FAIL)
1. {Critical issue with impact and remediation path}

## Recommendation
{DELIVER / REVISE AND REVALIDATE / REJECT AND REGENERATE}

---
## Validation Metadata
- Validation duration: {seconds}
- Confidence level: {high / medium / low}
- Automated checks passed: {N} of {N}
- Manual review recommended: {yes / no}
```

**Quick Validation Output (2 minutes):**
```markdown
# Quick Validation: {Output Title}
## Spec: {IS-NNN} | Date: {Date}

| Dimension | Score | Status |
|-----------|-------|--------|
| Technical Accuracy (30%) | {score} | {ok/flag/fail} |
| Completeness (25%) | {score} | {ok/flag/fail} |
| Consistency (15%) | {score} | {ok/flag/fail} |
| Format (10%) | {score} | {ok/flag/fail} |
| Actionability (10%) | {score} | {ok/flag/fail} |
| Traceability (10%) | {score} | {ok/flag/fail} |

**Overall: {XX.X}% — {PASS / CONDITIONAL / FAIL}**
**Top Issue:** {Most critical finding or "None"}
**Action:** {Deliver / Fix [specific issue] / Regenerate}
```

## Methodology & Standards

- **Six-Dimension Quality Framework:** Quality is not one thing. An output can be technically accurate but incomplete, or complete but inconsistent. The six dimensions capture different facets of quality, each with independent scoring:

  1. **Technical Accuracy (30% weight):** Are the facts, data, calculations, and technical claims correct? Does the output comply with applicable standards? Would a subject matter expert find errors? This is the highest-weighted dimension because inaccurate outputs are dangerous -- they can lead to wrong decisions, safety risks, or regulatory non-compliance.

  2. **Completeness (25% weight):** Does the output cover everything specified in the intent specification? Are all required sections present? Is the depth of coverage adequate? Missing content means the output cannot serve its intended purpose without additional work.

  3. **Consistency (15% weight):** Is the output internally consistent (no contradictions)? Does terminology remain uniform? Does the output align with related deliverables? Inconsistency undermines credibility and creates confusion.

  4. **Format & Structure (10% weight):** Does the output follow the specified template and structure? Is it professionally formatted? Is it readable by the intended audience? Poor formatting reduces usability even when content is good.

  5. **Actionability (10% weight):** Can the intended audience use this output to take action? Are recommendations clear? Are next steps defined? An output that is correct but not actionable fails its purpose.

  6. **Traceability (10% weight):** Can the output be traced back to its sources? Are assumptions documented? Is the methodology transparent? Traceability enables audit, review, and future updates.

- **Scoring Protocol:**
  - Each dimension scored 0-100 independently
  - Weighted scores summed for overall percentage
  - Thresholds: >91% = PASS (SME-grade), 75-90% = CONDITIONAL PASS, <75% = FAIL
  - Any single dimension scoring below 50% triggers automatic FAIL regardless of overall score

- **Validation Against Specification:** The validator does not assess generic quality. It specifically checks whether the output fulfills the intent specification. If the spec says "Include 5-year OPEX projection," the validator checks for exactly that. This anchors quality to intent, not opinion.

- **Feedback Specificity:** Feedback must be specific enough that the producing agent can fix the issue without guessing. "Section 3 is incomplete" is not acceptable. "Section 3 is missing the risk mitigation strategies required by spec IS-012 section 4.2" is acceptable.

- **Progressive Validation:** Quick validation for drafts and intermediate outputs. Standard validation for final deliverables. Deep validation for critical or client-facing deliverables. The level determines how many checks are performed, not the rigor of each check.

## Step-by-Step Execution

### Step 1: Load Validation Context
1. Receive the output to validate (document, analysis, model, plan)
2. Load the corresponding intent specification
3. Load applicable domain standards (if referenced in spec)
4. Load related deliverables (if consistency checking is needed)
5. Determine validation level (quick, standard, deep)
6. Load custom weights if provided (otherwise use defaults)

### Step 2: Validate Technical Accuracy (30%)
1. Extract all factual claims, data points, and calculations from the output
2. Cross-reference against:
   - Source data referenced in the specification
   - Industry standards and regulations cited
   - Known domain facts from the knowledge base
   - Internal calculations (verify math)
3. Check for:
   - Incorrect data or statistics
   - Misapplied standards or regulations
   - Flawed calculations or logic errors
   - Outdated information presented as current
   - Unsupported claims (stated as fact without evidence)
4. Score: 100 = all facts verified, no errors; 0 = pervasive inaccuracies
5. Record each error found with location and correct information

### Step 3: Validate Completeness (25%)
1. Extract the list of required elements from the intent specification:
   - Required sections and subsections
   - Required data points or analyses
   - Required recommendations or conclusions
   - Required supporting materials (appendices, references)
2. Check each required element against the output:
   - Present and adequate = full credit
   - Present but superficial = partial credit
   - Missing = no credit
3. Check depth of coverage:
   - Does each section provide sufficient detail for the specified audience?
   - Are complex topics adequately explained?
   - Are edge cases or exceptions addressed?
4. Score: 100 = all elements present with adequate depth; 0 = majority missing
5. Record each missing or insufficient element

### Step 4: Validate Consistency (15%)
1. Internal consistency checks:
   - Do numbers cited in different sections match?
   - Do conclusions align with the analysis?
   - Do recommendations follow from findings?
   - Are there contradictory statements?
2. Terminology consistency:
   - Is the same term used for the same concept throughout?
   - Are abbreviations defined and used consistently?
   - Do headings follow a consistent style?
3. Cross-deliverable consistency (if related outputs provided):
   - Do shared data points match?
   - Do referenced decisions align?
   - Do timelines and dates agree?
4. Score: 100 = fully consistent internally and externally; 0 = pervasive contradictions
5. Record each inconsistency found with locations

### Step 5: Validate Format & Structure (10%)
1. Template compliance:
   - Does the output follow the specified template?
   - Are all template sections present?
   - Are section names and ordering correct?
2. Structure quality:
   - Is the document logically organized?
   - Do sections flow naturally?
   - Are headings and subheadings appropriate?
3. Formatting quality:
   - Are tables properly formatted?
   - Are lists consistent in style?
   - Are figures and charts labeled?
   - Is the visual presentation professional?
4. Readability:
   - Is language appropriate for the audience?
   - Is sentence structure clear?
   - Are paragraphs reasonable length?
5. Score: 100 = perfect template compliance and formatting; 0 = unformatted or wrong structure
6. Record each formatting deviation

### Step 6: Validate Actionability (10%)
1. Recommendation clarity:
   - Are recommendations explicitly stated?
   - Are they specific enough to act on?
   - Do they include who should do what by when?
2. Decision readiness:
   - Does the output provide enough information for the intended decision?
   - Are options presented with pros/cons if applicable?
   - Are risks and trade-offs clearly stated?
3. Next steps:
   - Are next steps defined?
   - Is the sequence logical?
   - Are dependencies identified?
4. Audience appropriateness:
   - Is the level of detail right for the audience?
   - Is technical language appropriate?
   - Can the audience use this without additional interpretation?
5. Score: 100 = immediately actionable by target audience; 0 = no clear actions or unusable
6. Record each actionability gap

### Step 7: Validate Traceability (10%)
1. Source referencing:
   - Are data sources cited?
   - Are external standards referenced with document numbers?
   - Can claims be traced to their origin?
2. Methodology transparency:
   - Is the approach/methodology documented?
   - Are tools and models identified?
   - Could someone replicate the work from the documentation?
3. Assumption documentation:
   - Are assumptions explicitly stated?
   - Are limitations acknowledged?
   - Are boundary conditions defined?
4. Audit trail:
   - Is revision history maintained?
   - Are authorship and review dates recorded?
   - Can the validation itself be audited?
5. Score: 100 = fully traceable end-to-end; 0 = no sources, assumptions, or methodology documented
6. Record each traceability gap

### Step 8: Calculate Overall Score and Determine Verdict
1. Calculate weighted scores:
   - Technical Accuracy score x 0.30
   - Completeness score x 0.25
   - Consistency score x 0.15
   - Format score x 0.10
   - Actionability score x 0.10
   - Traceability score x 0.10
2. Sum weighted scores for overall percentage
3. Check for automatic fail triggers:
   - Any dimension below 50% = automatic FAIL
   - Technical Accuracy below 70% = automatic FAIL (for safety-critical outputs)
4. Apply verdict:
   - >91% and no auto-fail triggers = PASS (SME-grade)
   - 75-90% and no auto-fail triggers = CONDITIONAL PASS
   - <75% or any auto-fail trigger = FAIL

### Step 9: Generate Feedback and Recommendations
1. For PASS:
   - Highlight strengths
   - Note minor improvement opportunities (optional)
   - Recommend: DELIVER
2. For CONDITIONAL PASS:
   - List required improvements in priority order
   - For each: specify location, issue, expected fix
   - Estimate revision effort
   - Recommend: REVISE AND REVALIDATE
3. For FAIL:
   - List critical issues
   - Assess root cause (specification gap? context gap? capability gap?)
   - Recommend: REJECT AND REGENERATE (with guidance on what to change)

### Step 10: Record and Report
1. Generate the Quality Validation Scorecard (full or quick format)
2. Store validation record for audit trail
3. Update task status in Shared Task List
4. Notify producing agent of results
5. If FAIL: create remediation task in Shared Task List
6. If PASS: authorize next step (delivery, filing, etc.)
7. Update quality metrics dashboard

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Validation Consistency | Same output receives same score (+/- 3%) across runs | > 95% of cases |
| False Positive Rate | Passing outputs that should fail | < 5% |
| False Negative Rate | Failing outputs that should pass | < 10% |
| Validation Speed | Time to complete standard validation | < 5 minutes |
| Feedback Actionability | Feedback specific enough to fix without guessing | 100% |
| Specification Coverage | Spec requirements checked during validation | > 95% |
| Improvement Correlation | Scores improve after applying feedback | > 85% of cases |
| Stakeholder Trust | Human reviewers agree with validation verdict | > 90% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Provides the specification against which output is validated |
| `orchestrate-or-agents` | Upstream | Triggers validation via TaskCompleted hooks |
| All `agent-*` | Upstream | Produce outputs that this skill validates |
| `agent-doc-control` | Downstream | Validated outputs filed in document control |
| `design-quality-gate` | Sibling | Quality gates use this skill's scoring framework |
| `build-second-brain` | Downstream | Validation patterns and lessons stored in knowledge base |
| `create-prompt-contract` | Upstream | Prompt contracts define expected output format for validation |
| `generate-daily-nudge` | Downstream | Quality metrics fed into daily briefings |

## Templates & References

**Dimension Weight Override Template:**
```yaml
custom_weights:
  technical_accuracy: 0.40  # Safety-critical output: increase accuracy weight
  completeness: 0.25
  consistency: 0.10
  format: 0.05
  actionability: 0.10
  traceability: 0.10
  # Weights must sum to 1.00
```

**Auto-Fail Rules Configuration:**
```yaml
auto_fail_rules:
  - dimension: "technical_accuracy"
    threshold: 50
    applies_to: "all"
  - dimension: "technical_accuracy"
    threshold: 70
    applies_to: "safety_critical"
  - dimension: "any"
    threshold: 50
    applies_to: "all"
  - condition: "completeness < 60 AND format < 60"
    applies_to: "client_facing"
```

**Validation Level Configuration:**
```yaml
validation_levels:
  quick:
    duration_target: "2 minutes"
    checks: ["completeness_section_count", "format_template_match", "accuracy_spot_check"]
    output: "quick_scorecard"
  standard:
    duration_target: "5 minutes"
    checks: ["all_dimensions_full_check"]
    output: "full_scorecard"
  deep:
    duration_target: "15 minutes"
    checks: ["all_dimensions_full_check", "cross_deliverable_consistency", "source_verification", "calculation_audit"]
    output: "full_scorecard_with_appendix"
```

## Examples

**Example 1: Validating a Maintenance Strategy Document**
```
Command: validate-output-quality validate --output "Maintenance-Strategy-Rev0.md" --spec "IS-012-Maint-Strategy.md"

Quality Validation Scorecard:
  Output: Maintenance Strategy - Lithium Plant
  Spec: IS-012
  Level: Standard

  Overall Score: 87.5% — CONDITIONAL PASS

  Dimension Scores:
  | Dimension | Weight | Score | Weighted | Verdict |
  |-----------|--------|-------|----------|---------|
  | Technical Accuracy | 30% | 92 | 27.6 | pass |
  | Completeness | 25% | 80 | 20.0 | flag |
  | Consistency | 15% | 90 | 13.5 | pass |
  | Format | 10% | 95 | 9.5 | pass |
  | Actionability | 10% | 85 | 8.5 | pass |
  | Traceability | 10% | 84 | 8.4 | flag |

  Required Improvements:
  1. Completeness: Section 5 "Predictive Maintenance Technology Roadmap" is present but lacks
     the 3-year implementation timeline required by spec IS-012 section 5.3.
  2. Traceability: OEM recommendations in Section 3.2 reference "vendor documentation" without
     specific document numbers. Spec requires traceable references.

  Recommendation: REVISE AND REVALIDATE
  Estimated Revision Effort: 30 minutes (add timeline to Section 5, add document references to Section 3.2)
```

**Example 2: Quick Validation of an OPEX Model**
```
Command: validate-output-quality validate --output "OPEX-Model-v2.xlsx" --spec "IS-015-OPEX.md" --level quick

Quick Validation: OPEX Model v2
  Spec: IS-015 | Date: 2025-06-15

  | Dimension | Score | Status |
  |-----------|-------|--------|
  | Technical Accuracy (30%) | 95 | ok |
  | Completeness (25%) | 93 | ok |
  | Consistency (15%) | 88 | ok |
  | Format (10%) | 90 | ok |
  | Actionability (10%) | 91 | ok |
  | Traceability (10%) | 92 | ok |

  Overall: 92.4% — PASS
  Top Issue: None critical. Minor: sensitivity analysis only covers 2 of 3 specified variables.
  Action: Deliver (note minor gap for next revision)
```

**Example 3: Failed Validation with Remediation**
```
Command: validate-output-quality validate --output "Staffing-Plan-Draft.md" --spec "IS-020-Staffing.md"

Quality Validation Scorecard:
  Output: Staffing Plan - Operations Department
  Spec: IS-020
  Level: Standard

  Overall Score: 62.3% — FAIL

  Critical Issues:
  1. Technical Accuracy (45/100): Shift pattern calculations contain errors. The 4x3 rotation
     shown requires 5 crews but only 4 are budgeted. Annual hours per person calculated at
     2,080 but the specified Chilean labor law limit is 1,800 effective hours.
  2. Completeness (70/100): Missing entire Section 6 "Training and Competency Requirements"
     which is a required section per spec.
  3. Actionability (55/100): Staffing numbers are provided without cost implications. Spec
     requires each position to include estimated annual cost in CLP.

  Root Cause Assessment:
  - Shift calculation error suggests wrong labor law parameters were loaded
  - Missing section suggests incomplete specification reading
  - Missing cost data suggests agent-finance data was not integrated

  Recommendation: REJECT AND REGENERATE
  Remediation:
  1. Reload Chilean labor law parameters (1,800 effective hours, not 2,080)
  2. Recalculate shift patterns with correct crew requirements
  3. Add Section 6 per template from doc-control
  4. Request cost data from agent-finance before regenerating
```
