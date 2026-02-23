# Audit AI Workflow

## Skill ID: F-003
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Assess current workflows and identify where AI agents can add the most value. Based on Nate B Jones' "capability overhang" concept -- the gap between what AI technology can do and what organizations actually use it for -- this skill systematically analyzes existing processes, scores their AI-automation potential, prioritizes opportunities, and produces an actionable roadmap for AI integration. It prevents both under-adoption (missing obvious AI opportunities) and over-adoption (forcing AI where it adds no value).

## Intent & Specification

**Problem:** Organizations have a massive capability overhang: AI technology has advanced far faster than workflows have adapted. Teams continue manual processes that AI could handle in seconds, while simultaneously forcing AI into tasks where it adds friction. Without a systematic audit, AI adoption is random, driven by enthusiasm rather than value. This leads to toy projects that do not scale, missed high-value opportunities, and AI fatigue from poor implementations.

**Success Criteria:**
- Complete inventory of current workflows in the target area
- Each workflow scored on AI-automation potential using consistent criteria
- High-value AI opportunities identified and prioritized
- Implementation difficulty assessed for each opportunity
- Actionable roadmap with quick wins, medium-term, and strategic initiatives
- Expected value quantified (time saved, quality improved, cost reduced)
- Workflows where AI should NOT be applied are explicitly identified

**Constraints:**
- Must assess workflows objectively (not just automate everything)
- Must consider human factors (trust, skill loss, job satisfaction)
- Must account for data availability and quality
- Must respect regulatory constraints on AI usage
- Must produce actionable recommendations, not theoretical analysis
- Must be repeatable (can audit again in 6 months to track progress)

## Trigger / Invocation

**Manual Triggers:**
- `audit-ai-workflow audit --scope [department|process|project]`
- `audit-ai-workflow score --workflow [name]`
- `audit-ai-workflow roadmap --scope [scope] --horizon [months]`
- `audit-ai-workflow compare --audit1 [file] --audit2 [file]` (progress tracking)

**Recommended Triggers:**
- Quarterly for active departments
- At project kickoff (audit project workflows before starting)
- When new AI tools become available (reassess opportunities)
- After major process changes

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Workflow Inventory | Interviews / Docs | Yes | List of processes to audit |
| Process Documentation | Doc Control | No | Existing SOPs, process maps |
| Time/Effort Data | Team / System | No | How long tasks currently take |
| Quality Metrics | Team / System | No | Error rates, rework frequency |
| Tool Inventory | IT / Config | Yes | Current tools and AI capabilities available |
| Team Capabilities | Interviews | No | Team's AI literacy and comfort level |
| Regulatory Constraints | Agent-Legal | No | Rules about AI usage in regulated processes |
| Budget Parameters | Agent-Finance | No | Available budget for AI initiatives |

## Output Specification

**Primary Output: AI Workflow Audit Report**

```markdown
# AI Workflow Audit Report
## Scope: {Department / Process / Project}
## Date: {Date}
## Auditor: {Name / Agent}

### Executive Summary
{2-3 paragraphs summarizing findings, top opportunities, and recommended next steps}

### Capability Overhang Score: {X}/10
{How much untapped AI potential exists in this scope}

### Workflow Assessment Matrix
| Workflow | Current State | AI Potential | Difficulty | Priority | Value |
|----------|--------------|-------------|------------|----------|-------|
| {name}   | {manual/partial/automated} | {high/med/low} | {easy/med/hard} | {1-5} | {$$$} |

### Top 5 Opportunities
1. {Opportunity with expected impact}
2. ...

### Quick Wins (implement in < 2 weeks)
{List with specific actions}

### Medium-Term (implement in 1-3 months)
{List with project plans}

### Strategic (implement in 3-12 months)
{List with roadmap}

### Do NOT Automate
{Workflows where AI should not be applied, with rationale}

### Roadmap
{Timeline visualization of recommended implementations}
```

**Workflow Scoring Card:**
```yaml
workflow_score:
  name: "Monthly Report Generation"
  current_state:
    manual_effort_hours: 16
    frequency: "monthly"
    people_involved: 3
    error_rate: "15% require correction"
    quality_consistency: "variable"
  ai_potential:
    score: 8  # out of 10
    reasoning: "Highly structured, data-driven, template-based"
    applicable_ai_capabilities:
      - "Data extraction from multiple sources"
      - "Template-based document generation"
      - "Consistency checking"
      - "Trend analysis and visualization"
    estimated_automation_level: "85%"
    residual_human_role: "Review and approve final output"
  implementation:
    difficulty: "medium"
    prerequisites: ["Clean data sources", "Report template standardization"]
    tools_needed: ["Airtable API", "Document generation", "Claude"]
    timeline: "4 weeks"
    cost: "$2,000 setup + minimal ongoing"
  value:
    time_saved_monthly: 12  # hours
    quality_improvement: "Consistent formatting, fewer errors"
    annual_value: "$15,000 (time) + $5,000 (quality)"
  priority: 1
  recommendation: "IMPLEMENT - Quick win with high value and medium difficulty"
```

## Methodology & Standards

- **Capability Overhang Assessment:** Score the gap between available AI capability and current usage. High overhang = large untapped potential. Score 1-10 where 10 means AI could transform the workflow but is not being used at all.

- **AI Potential Scoring Criteria:**
  - **Repetitiveness (0-2):** How repetitive is the task? (2 = highly repetitive)
  - **Structure (0-2):** How structured are inputs and outputs? (2 = highly structured)
  - **Data Availability (0-2):** Is the data needed accessible and clean? (2 = readily available)
  - **Error Impact (0-2):** What is the impact of AI errors? (2 = low impact, easily caught)
  - **Volume (0-2):** How much volume/frequency? (2 = high volume/frequency)
  - **Total: 0-10** (higher = better candidate for AI)

- **Implementation Difficulty Criteria:**
  - Easy: existing tools can do it, minimal integration needed, team ready
  - Medium: some tool setup needed, moderate integration, training required
  - Hard: new tools needed, complex integration, significant change management

- **Prioritization Matrix:** AI Potential (high) x Difficulty (low) = Priority 1 (quick wins). AI Potential (high) x Difficulty (high) = Priority 2 (strategic). AI Potential (low) = Do not prioritize.

- **Human-in-the-Loop Assessment:** For each workflow, determine: where must a human remain? What decisions cannot be delegated? What skills might atrophy? What new skills are needed?

## Step-by-Step Execution

### Step 1: Inventory Workflows
1. Identify all workflows in the audit scope
2. For each workflow, document:
   - Name and description
   - Trigger (what starts it)
   - Steps (high-level process flow)
   - Inputs and outputs
   - People involved and roles
   - Tools currently used
   - Frequency and volume
   - Time per cycle
3. Categorize workflows by type: decision-making, document creation, data processing, communication, analysis, monitoring

### Step 2: Assess Current State
1. For each workflow:
   - Measure manual effort (hours per cycle)
   - Assess quality consistency (error rate, rework rate)
   - Identify pain points (bottlenecks, delays, frustrations)
   - Document current tool usage
   - Note any partial automation already in place
2. Calculate total manual effort across all workflows

### Step 3: Score AI Potential
1. For each workflow, apply the 5-criteria scoring system:
   - Repetitiveness (0-2)
   - Structure (0-2)
   - Data Availability (0-2)
   - Error Impact (0-2)
   - Volume (0-2)
2. Calculate total AI Potential score (0-10)
3. For high-scoring workflows (7+), detail which AI capabilities apply
4. For low-scoring workflows (0-3), note why AI is not suitable

### Step 4: Assess Implementation Difficulty
1. For each high-potential workflow:
   - What tools are needed? (existing or new?)
   - What integrations are required?
   - What data preparation is needed?
   - What training/change management is needed?
   - What are the technical risks?
2. Rate difficulty: Easy / Medium / Hard
3. Estimate timeline and cost

### Step 5: Calculate Value
1. For each opportunity:
   - Time savings: hours saved x hourly cost
   - Quality improvement: reduced errors, rework, risk
   - Speed improvement: faster cycle time
   - Scalability: ability to handle increased volume
2. Annualize the value estimate
3. Calculate ROI: value / cost

### Step 6: Prioritize and Create Roadmap
1. Plot opportunities on Priority Matrix (AI Potential vs Difficulty)
2. Classify into:
   - Quick Wins: high potential, easy implementation (do first)
   - Medium-Term: high potential, medium difficulty (plan and execute)
   - Strategic: high potential, hard implementation (roadmap and invest)
   - Do Not Automate: low potential (explicitly exclude)
3. Sequence implementations considering:
   - Dependencies between workflows
   - Team capacity for change
   - Budget availability
   - Learning curve (start easy, build confidence)

### Step 7: Produce Report
1. Write executive summary highlighting top findings
2. Calculate overall Capability Overhang Score
3. Detail top 5 opportunities with full scoring cards
4. List all workflows with assessment matrix
5. Produce implementation roadmap with timeline
6. Include "Do Not Automate" section with rationale
7. Provide recommendations for next steps

### Step 8: Follow-Up Plan
1. Schedule implementation reviews (monthly)
2. Define success metrics for each implementation
3. Plan re-audit in 6 months to track progress
4. Document lessons learned from implementations

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Workflow Coverage | Workflows audited vs total in scope | > 90% |
| Scoring Consistency | Same workflow scores similarly by different auditors | Within 1 point |
| Opportunity Validation | Recommended implementations that deliver value | > 70% |
| Quick Win Success | Quick wins implemented within 2 weeks | > 80% |
| Value Realization | Actual value vs estimated value | Within 30% |
| Report Actionability | Recommendations with specific actions | 100% |
| Audit Timeliness | Audit completed within planned timeframe | > 90% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Audit uses intent spec for each AI implementation |
| `create-agent-specification` | Downstream | Audit identifies need for new agents |
| `build-second-brain` | Downstream | Audit insights stored in knowledge base |
| `vibe-working-session` | Downstream | Implementations may use vibe sessions |
| `orchestrate-or-agents` | Bidirectional | Audit may assess the OR multi-agent system itself |
| `agent-or-pmo` | Consumer | PMO uses audit for AI strategy governance |

## Templates & References

**Workflow Inventory Template:**
```
| # | Workflow Name | Type | Trigger | Frequency | Effort (hrs) | People | Tools |
|---|--------------|------|---------|-----------|-------------|--------|-------|
```

**Scoring Quick Reference:**
```
AI Potential Score (0-10):
  9-10: Automate immediately
  7-8:  Strong candidate, plan implementation
  4-6:  Partial automation possible, assess further
  1-3:  Low potential, likely not worth automating
  0:    Do not automate
```

## Examples

**Example 1: OR Department Workflow Audit**
```
Command: audit-ai-workflow audit --scope "OR Department"

Workflows Audited: 25

Capability Overhang Score: 7/10 (significant untapped potential)

Top 5 Opportunities:
  1. Monthly OR Report Generation (Score: 9, Difficulty: Medium, Value: $20K/yr)
  2. Document Search and Retrieval (Score: 8, Difficulty: Easy, Value: $15K/yr)
  3. Meeting Minutes and Action Tracking (Score: 8, Difficulty: Easy, Value: $12K/yr)
  4. SOP First Draft Generation (Score: 7, Difficulty: Medium, Value: $30K/yr)
  5. Spare Parts Data Extraction (Score: 7, Difficulty: Medium, Value: $18K/yr)

Quick Wins (< 2 weeks):
  - Document search agent (using existing Claude + doc-control)
  - Meeting minutes automation (Otter.ai + Claude summarization)
  - Email RFI template generation (Claude with standard template)

Do NOT Automate:
  - Safety-critical decision making (human judgment required)
  - Stakeholder relationship management (requires human trust)
  - Contract negotiations (legal and commercial judgment)
```
