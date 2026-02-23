# Resolve Cross-Functional Conflicts

## Skill ID: N-02
## Version: 1.0.0
## Category: N. Integration & Decision
## Priority: P2 - Medium

---

## Purpose

Resolve cross-functional conflicts that arise between departments, agents, and workstreams during Operational Readiness (OR) program execution. This skill provides a structured, data-driven methodology for identifying conflicting requirements, analyzing multi-dimensional impacts, generating decision briefs, and facilitating stakeholder alignment -- transforming organizational silos into coordinated decision-making.

Cross-functional conflicts are among the most destructive and pervasive problems in capital project execution and operational readiness programs. Boston Consulting Group research shows that organizational silos cause 30-40% of project value destruction in large capital programs (Pain Point B-03). These conflicts manifest as competing priorities between departments (Operations wants maximum redundancy; Finance wants minimum CAPEX), contradictory specifications (Engineering specifies one vendor; Procurement has a corporate framework agreement with another), resource contention (Maintenance and Operations both need the same SMEs during commissioning), and timeline incompatibilities (HR cannot recruit until Operations defines the operating model, but Operations cannot define the model until Engineering completes the design).

In traditional project execution, these conflicts fester unresolved for weeks or months, with each department optimizing for its own objectives at the expense of the whole. McKinsey's research on organizational health finds that companies with strong cross-functional collaboration deliver 2.4x better total returns to shareholders. Conversely, Deloitte reports that 67% of cross-functional projects fail to achieve their objectives, with inter-departmental conflict cited as the primary root cause in 45% of cases.

The OR System's multi-agent architecture creates unique opportunities for conflict detection and resolution. Because every agent's work products, dependencies, and constraints are digitally tracked, conflicts can be detected automatically at the point of origin -- before they escalate into entrenched positions. This skill transforms conflict resolution from a political exercise into an analytical process, providing decision-makers with objective impact analyses and evidence-based recommendations.

---

## Intent & Specification

**Problem:** Organizational silos and cross-functional conflicts systematically degrade the quality and timeliness of Operational Readiness programs. Specific manifestations include:

- **Competing resource demands** (Pain Point B-03): During commissioning peak, Operations, Maintenance, HSE, and Engineering all require access to the same limited pool of field-experienced engineers. Without structured arbitration, the loudest voice or highest-ranking sponsor wins, not the activity with the greatest impact on project success.
- **Contradictory requirements**: Maintenance strategy calls for standardized equipment to simplify spare parts; Engineering has already specified best-of-breed from multiple vendors. HSE requires additional safety interlocks; Operations argues they will increase spurious trips and reduce availability. These contradictions, if unresolved, create rework loops that consume 10-15% of engineering effort (CII research).
- **Timeline dependencies with circular logic**: HR needs the operating model to develop the staffing plan; Operations needs staffing constraints to finalize the operating model; Finance needs both to build the OPEX budget. These dependency loops create 2-4 week decision latency cycles (Pain Point B-04).
- **Information asymmetry**: Each department has visibility into its own data but lacks context from adjacent domains. Maintenance knows the equipment failure history; Finance knows the budget constraints; Operations knows the production targets. Without integration, each department makes locally optimal but globally suboptimal decisions.
- **Escalation failure**: Conflicts that should be resolved at the working level are escalated to executives who lack domain expertise, or worse, are not escalated at all and resurface during commissioning as critical deficiencies.

**Success Criteria:**
- Cross-functional conflicts detected within 24 hours of manifestation (vs. industry average of 2-4 weeks)
- 80% of conflicts resolved at working level without executive escalation (vs. industry average of 40%)
- Decision brief generation time reduced from 2-3 weeks to 2-4 hours
- Conflict resolution cycle time reduced from 2-4 weeks to 3-5 business days
- Zero unresolved cross-functional conflicts at gate reviews
- Stakeholder satisfaction with conflict resolution process >4.0/5.0
- Reduction in rework attributable to unresolved conflicts by >60%
- Complete audit trail of all conflict analyses, decisions, and rationale

**Constraints:**
- Must not override established governance and decision authority frameworks
- Must present balanced analyses that represent all stakeholder perspectives fairly
- Must escalate safety-related conflicts immediately regardless of normal process
- Must operate in bilingual mode (English/Spanish) for Latin American projects
- Must integrate with project-specific RACI matrices and decision authority levels
- Must produce outputs compatible with existing project reporting frameworks
- Must maintain confidentiality of commercially sensitive information during analysis
- Must respect cultural contexts and organizational hierarchies in stakeholder engagement

---

## Trigger / Invocation

**Primary Triggers:**
- `resolve-cross-functional-conflicts detect --project [name]`
- `resolve-cross-functional-conflicts analyze --conflict [id] --departments [list]`
- `resolve-cross-functional-conflicts brief --conflict [id] --audience [executive|management|working]`
- `resolve-cross-functional-conflicts resolve --conflict [id] --recommendation [option]`
- `resolve-cross-functional-conflicts status --project [name]`
- `resolve-cross-functional-conflicts escalate --conflict [id] --level [L1|L2|L3|L4]`
- `resolve-cross-functional-conflicts report --project [name] --period [weekly|monthly|gate]`

**Aliases:** `/resolve-conflicts`, `/cross-functional`, `/conflict-resolution`, `/resolver-conflictos`

**Automatic Triggers:**
- Agent detects contradictory requirements between two or more domain deliverables
- Resource contention identified where two agents request the same resource for overlapping periods
- Dependency deadlock detected (circular dependency chain with no resolution path)
- Deliverable review identifies conflicting assumptions between domains
- Gate review preparation reveals unresolved inter-domain issues
- Schedule deviation >10% attributed to cross-functional coordination failure
- Stakeholder raises formal objection to another domain's deliverable or recommendation

**Event-Driven Triggers:**
- Weekly cross-functional alignment scan (automated)
- Agent-to-agent escalation request via Inbox
- OR Orchestrator identifies blocked dependency chain
- Client requests conflict resolution support
- Management of Change (MOC) creates cross-functional impacts

---

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Conflict Description | Agent detection / User report | Yes | Clear statement of the conflict: who, what, why, and impact |
| Affected Domains | Agent metadata | Yes | List of OR domains/agents involved in the conflict |
| Domain Positions | Agent deliverables / stakeholder input | Yes | Each domain's stated requirement, rationale, and constraints |
| Project Context | mcp-sharepoint | Yes | Project scope, timeline, budget, and strategic priorities |
| RACI Matrix | mcp-sharepoint | Yes | Decision authority framework showing who Decides for each domain |
| Deliverable Dependencies | mcp-cmms / mcp-erp / Airtable | Yes | Dependency register showing how the conflicting items connect |
| Risk Register | mcp-sharepoint / Airtable | No | Existing risk entries related to the conflict domains |
| Budget Data | mcp-erp | No | Financial implications of each position (cost, NPV impact) |
| Schedule Data | mcp-project-online | No | Timeline implications of each position (delay, critical path impact) |
| Historical Precedents | Knowledge base | No | Similar conflicts from past projects and their resolutions |
| Stakeholder Preferences | mcp-teams / meeting records | No | Informal positions, concerns, and negotiation boundaries |
| Corporate Standards | mcp-sharepoint | No | Company policies, standards, or directives that constrain options |

**Conflict Registration Schema:**
```yaml
conflict:
  id: "CF-{ProjectCode}-{Year}-{Sequence}"
  title: "Descriptive conflict title"
  project: "Project Name"
  detected_date: "2026-02-17"
  detected_by: "agent-maintenance / user / automated-scan"
  detection_method: "dependency_analysis | deliverable_review | resource_contention | stakeholder_report"

  parties:
    - domain: "Maintenance"
      agent: "agent-maintenance"
      position: "Require standardized Metso crushers across all circuits"
      rationale: "Reduce spare parts inventory by 40%, simplify training, single CMMS config"
      constraints: "CMMS configuration deadline in 3 months"
      sponsor: "Maintenance Manager"
    - domain: "Engineering"
      agent: "agent-project"
      position: "Best-of-breed: Metso primary, FLSmidth secondary, Sandvik tertiary"
      rationale: "Each circuit has different duty; best-of-breed optimizes performance by 8-12%"
      constraints: "Equipment specifications already issued for bid"
      sponsor: "Engineering Manager"
    - domain: "Procurement"
      agent: "agent-procurement"
      position: "Corporate framework agreement with FLSmidth for all crushing"
      rationale: "15% volume discount; established supply chain; proven commercial terms"
      constraints: "Framework agreement expires in 6 months; renewal contingent on volume"
      sponsor: "Procurement Director"

  classification:
    type: "technical | commercial | resource | timeline | regulatory | strategic"
    severity: "critical | high | medium | low"
    urgency: "immediate | this_week | this_month | next_gate"
    domains_affected: 3
    deliverables_blocked: 12
    schedule_impact_days: 15
    cost_impact_estimate: "$2.5M"

  status: "detected | under_analysis | brief_generated | in_resolution | resolved | escalated"
  target_resolution_date: "2026-03-03"
  actual_resolution_date: null
  resolution_method: null
  decision_authority: "Project Director"
```

---

## Output Specification

### Primary Output 1: Conflict Analysis Report (.docx)

**Filename:** `{ProjectCode}_Conflict_Analysis_{ConflictID}_v{version}_{date}.docx`

**Structure (10-25 pages):**

1. **Executive Summary** (1 page)
   - Conflict statement in one paragraph
   - Domains involved and their positions
   - Quantified impact (cost, schedule, risk)
   - Recommended resolution with rationale
   - Decision required and deadline

2. **Conflict Context** (2-3 pages)
   - Project background relevant to the conflict
   - Timeline of how the conflict emerged
   - Stakeholder map specific to this conflict
   - Related decisions and precedents

3. **Position Analysis** (3-5 pages, one section per party)
   - Each domain's position stated objectively
   - Supporting evidence and rationale
   - Constraints and non-negotiable requirements
   - Risks if this position is adopted
   - Risks if this position is rejected

4. **Multi-Dimensional Impact Analysis** (3-5 pages)
   - Cost impact matrix (CAPEX, OPEX, lifecycle cost, NPV)
   - Schedule impact analysis (critical path, float consumption, milestone risk)
   - Safety and environmental impact assessment
   - Operational performance impact (availability, throughput, quality)
   - Risk profile comparison (risk register integration)
   - Stakeholder impact assessment

5. **Options Analysis** (3-5 pages)
   - Option A through N (all viable alternatives)
   - For each option: description, cost, schedule, risk, pros, cons
   - Decision matrix with weighted criteria
   - Sensitivity analysis on key assumptions

6. **Recommendation** (1-2 pages)
   - Recommended option with clear rationale
   - Implementation requirements
   - Residual risks and mitigation
   - Stakeholder communication plan
   - Follow-up actions and timeline

7. **Appendices**
   - Detailed cost models
   - Schedule impact simulations
   - Risk assessment worksheets
   - Stakeholder consultation records

### Primary Output 2: Decision Brief (.pptx)

**Filename:** `{ProjectCode}_Decision_Brief_{ConflictID}_v{version}_{date}.pptx`

**Structure (5-8 slides):**
- Slide 1: Conflict summary (what, who, why it matters)
- Slide 2: Each party's position (side-by-side comparison)
- Slide 3: Impact analysis (cost, schedule, risk dashboard)
- Slide 4: Options comparison matrix
- Slide 5: Recommended resolution with evidence
- Slide 6: Implementation roadmap
- Slide 7: Decision request and timeline
- Slide 8: Appendix -- key assumptions and data sources

### Secondary Outputs:

**Conflict Register Update** (mcp-airtable / SharePoint List):
| Field | Type | Description |
|-------|------|-------------|
| Conflict ID | Auto-number | Unique identifier (CF-PRJ-YYYY-NNN) |
| Title | Text | Descriptive title |
| Domains Involved | Multi-select | All affected domains |
| Classification | Selection | Technical / Commercial / Resource / Timeline / Regulatory / Strategic |
| Severity | Selection | Critical / High / Medium / Low |
| Status | Selection | Detected / Under Analysis / Brief Generated / In Resolution / Resolved / Escalated |
| Cost Impact | Currency | Estimated financial impact |
| Schedule Impact | Number | Days of potential delay |
| Deliverables Blocked | Number | Count of blocked deliverables |
| Resolution Method | Selection | Consensus / Compromise / Arbitration / Executive Decision / Escalation |
| Decision Authority | Person | Who made the final decision |
| Resolution Summary | Text | What was decided and why |
| Lessons Learned | Text | What to do differently next time |
| Date Detected | Date | When conflict was first identified |
| Date Resolved | Date | When final decision was made |

**Stakeholder Alignment Communication** (via mcp-teams / mcp-outlook):
- Decision notification to all affected parties
- Implementation action items assigned
- Updated deliverable timelines communicated
- Risk register updated with resolution outcomes

---

## Methodology & Standards

### Conflict Resolution Framework

The skill applies a structured five-phase conflict resolution framework adapted from Harvard Negotiation Project principles, PMI conflict management best practices, and industrial project arbitration methodologies:

```
Phase 1: DETECT       Phase 2: ANALYZE        Phase 3: OPTIONS       Phase 4: DECIDE       Phase 5: IMPLEMENT
-----------------     -------------------     ------------------     -----------------     -------------------
Identify conflict     Understand positions    Generate alternatives   Select resolution     Execute decision
Classify severity     Map impacts             Evaluate trade-offs     Obtain authority       Communicate broadly
Register formally     Identify root cause     Score options           Document rationale    Update deliverables
Notify stakeholders   Quantify consequences   Test feasibility        Assign actions        Monitor compliance
Set resolution SLA    Detect hidden issues    Rank by criteria        Close conflict        Capture lessons
```

### Conflict Classification Taxonomy

| Type | Description | Typical Resolution | Example |
|------|-------------|-------------------|---------|
| **Technical** | Conflicting technical specifications or design choices | Expert review + decision matrix | Equipment standardization vs. best-of-breed |
| **Commercial** | Competing commercial interests or budget allocation | Cost-benefit analysis + NPV modeling | Contract strategy disagreement |
| **Resource** | Multiple demands on same limited resource | Priority-based allocation + sequencing | SME availability during commissioning |
| **Timeline** | Incompatible schedules or dependency deadlocks | Critical path analysis + fast-tracking | Circular dependency between OR domains |
| **Regulatory** | Compliance requirements conflicting with project constraints | Regulatory liaison + risk-based approach | Environmental permit vs. construction schedule |
| **Strategic** | Different interpretations of project objectives or priorities | Executive alignment + strategy clarification | Risk appetite disagreement between owner and operator |

### Severity Assessment Matrix

| Severity | Deliverables Blocked | Schedule Impact | Cost Impact | Safety Relevance | Resolution SLA |
|----------|---------------------|-----------------|-------------|-----------------|----------------|
| **Critical** | >10 deliverables | >30 days delay | >$5M | Direct safety impact | 48 hours to decision brief |
| **High** | 5-10 deliverables | 15-30 days delay | $1-5M | Indirect safety impact | 5 business days |
| **Medium** | 2-5 deliverables | 5-15 days delay | $100K-$1M | No safety impact | 10 business days |
| **Low** | 1 deliverable | <5 days delay | <$100K | No safety impact | Next regular review |

### Industry Standards and References

- **PMI PMBOK 7th Edition** - Conflict management as a project leadership competency; stakeholder engagement strategies
- **Harvard Negotiation Project** - "Getting to Yes" principled negotiation framework; focus on interests not positions
- **ISO 31000:2018** - Risk management framework applied to decision-making under uncertainty
- **CII RT-316** - Alignment During Pre-Project Planning; impact of misalignment on project outcomes
- **IPA Research** - Impact of organizational silos on capital project performance; alignment metrics
- **BCG Studies** - Organizational silos cause 30-40% of project value destruction in large capital programs
- **McKinsey Organizational Health Index** - Cross-functional collaboration as top driver of organizational health
- **Deloitte Cross-Functional Project Research** - 67% failure rate; inter-departmental conflict as primary cause

### Pain Points Addressed with Quantified Impact

| Pain Point | Industry Statistic | VSC Target | Improvement |
|-----------|-------------------|------------|-------------|
| B-03: Organizational Silos | 30-40% project value destruction from silos | <10% value loss from coordination failures | 66-75% improvement |
| B-04: Decision Latency | 2-4 weeks per decision cycle | 3-5 business days | 60-80% faster |
| M-07: Knowledge Transfer Failure | Engineering decisions lost in transition | Full decision audit trail maintained | Systematic prevention |
| D-01: OR Deficiencies at Handover | 60%+ gaps driven by unresolved conflicts | <10% conflict-related gaps | 83% improvement |
| CII Rework Data | 10-15% of engineering effort is rework from contradictions | <3% rework from resolved conflicts | 70-80% reduction |

---

## Step-by-Step Execution

### Phase 1: Conflict Detection & Registration (Steps 1-3)

**Step 1: Detect and Capture the Conflict**
1. Receive conflict signal from one of the detection channels:
   - **Automated scan**: Weekly cross-reference of all agent deliverables to detect contradictory assumptions, specifications, or requirements. Compare key parameters across domain outputs (e.g., equipment specifications in Engineering vs. standardization requirements in Maintenance vs. framework agreements in Procurement).
   - **Agent escalation**: An agent reports via Inbox that it cannot proceed because of a conflicting requirement from another agent. Parse the escalation to identify the specific conflicting elements.
   - **Dependency deadlock**: The orchestrator detects a circular dependency chain where Domain A waits for Domain B, which waits for Domain C, which waits for Domain A. Identify the minimum set of decisions needed to break the deadlock.
   - **Stakeholder report**: A human stakeholder raises a concern about conflicting directions. Capture the concern in structured format.
   - **Deliverable review finding**: During quality validation of a deliverable, a conflict with another domain's output is identified.
2. Validate that this is a genuine cross-functional conflict (not an internal domain issue):
   - Involves two or more distinct OR domains or departments
   - Cannot be resolved by a single domain acting alone
   - Has measurable impact on project deliverables, schedule, or cost
3. Check conflict register for duplicates or related existing conflicts
4. If new: assign Conflict ID (CF-{ProjectCode}-{Year}-{Sequence})

**Step 2: Classify and Prioritize the Conflict**
1. Determine conflict type: Technical, Commercial, Resource, Timeline, Regulatory, or Strategic
2. Assess severity using the severity matrix:
   - Count deliverables currently blocked or at risk
   - Estimate schedule impact in days (query mcp-project-online for critical path analysis)
   - Estimate cost impact (query mcp-erp for budget implications)
   - Assess safety relevance (any safety-related deliverable affected?)
3. Set resolution SLA based on severity level
4. Identify decision authority from RACI matrix:
   - Working-level resolution (domain leads) for Medium/Low
   - Management resolution (OR Manager) for High
   - Executive resolution (Project Director / VP) for Critical
5. Assign conflict to the appropriate resolution track

**Step 3: Register and Notify**
1. Create conflict record in the Conflict Register (mcp-airtable or SharePoint)
2. Notify all affected domain agents of the conflict registration via Inbox
3. Notify the identified decision authority via mcp-outlook
4. Post conflict notification in the OR program channel via mcp-teams
5. Update the OR Dashboard with the new conflict (mcp-powerbi integration)
6. Block affected deliverables in the tracking system with conflict reference
7. Set calendar reminders for SLA milestones (50% of SLA, 75% of SLA, SLA deadline)

### Phase 2: Multi-Perspective Analysis (Steps 4-7)

**Step 4: Gather Each Party's Full Position**
1. Request structured position statements from each affected agent/domain:
   - What is your specific requirement or recommendation?
   - What is the technical/business rationale?
   - What evidence supports your position? (data, standards, analysis, experience)
   - What are your constraints? (non-negotiable requirements, regulatory mandates, contractual obligations)
   - What is the consequence if your position is not adopted?
   - What flexibility exists in your position? (areas of potential compromise)
2. Query relevant MCP sources for supporting data:
   - mcp-cmms: Equipment data, failure history, maintenance requirements
   - mcp-erp: Cost data, procurement status, budget allocations
   - mcp-sharepoint: Standards, specifications, prior decisions, corporate policies
3. Review historical precedents from the knowledge base:
   - Similar conflicts in past projects
   - Resolutions adopted and their outcomes
   - Lessons learned applicable to this conflict
4. Identify hidden stakeholders: parties not directly involved but affected by the outcome

**Step 5: Perform Root Cause Analysis**
1. Apply the "Five Whys" technique to understand why the conflict exists:
   - Is it a genuine trade-off (mutually exclusive options)?
   - Is it an information asymmetry (one party lacks data the other has)?
   - Is it a timing issue (decisions made in wrong sequence)?
   - Is it a scope ambiguity (unclear boundaries of responsibility)?
   - Is it a priority misalignment (different optimization objectives)?
2. Map the conflict to the project WBS to understand structural causes:
   - Were dependencies correctly identified in planning?
   - Were interfaces between domains adequately defined?
   - Were decision points scheduled in the right sequence?
3. Determine if the conflict is a symptom of a systemic issue:
   - Pattern analysis: has this type of conflict occurred before?
   - Process gap: is there a missing coordination mechanism?
   - Governance gap: is there unclear decision authority?
4. Document root cause findings for the analysis report

**Step 6: Quantify Multi-Dimensional Impacts**
1. **Cost Impact Analysis:**
   - CAPEX impact of each party's position (equipment, construction, installation)
   - OPEX impact over asset lifecycle (maintenance cost, energy, consumables, labor)
   - Total lifecycle cost comparison using NPV at project discount rate
   - Opportunity cost of delay while conflict remains unresolved
   - Rework cost if wrong decision is made and must be reversed later
2. **Schedule Impact Analysis:**
   - Map each position's timeline requirements against the project master schedule
   - Identify critical path impacts using mcp-project-online data
   - Quantify float consumption for each option
   - Assess impact on gate review dates and commissioning milestones
   - Calculate cost of delay per day for schedule-sensitive decisions
3. **Safety and Environmental Impact:**
   - Compare safety risk profiles of each position
   - Assess regulatory compliance implications
   - Evaluate process safety impacts (HAZOP, LOPA considerations)
   - Determine environmental permit implications
4. **Operational Performance Impact:**
   - Model production throughput under each position
   - Compare availability and reliability projections
   - Assess maintainability and operability differences
   - Evaluate flexibility and future expansion implications
5. **Risk Profile Comparison:**
   - Identify risks specific to each position
   - Score using the project risk matrix (Probability x Consequence)
   - Aggregate into composite risk scores for comparison
   - Identify risks that are unique to specific options vs. common to all

**Step 7: Identify Interests Behind Positions**
1. Distinguish between stated positions and underlying interests:
   - Position: "We need Metso crushers everywhere" (Maintenance)
   - Interest: "We need to minimize spare parts complexity and training burden"
   - Position: "We need best-of-breed selection" (Engineering)
   - Interest: "We need to optimize circuit performance for each duty"
2. Map areas of interest overlap (shared interests across parties)
3. Identify potential integrative solutions that satisfy multiple interests:
   - Can standardization be achieved within a single vendor's product range?
   - Can performance optimization be achieved with a reduced vendor set?
   - Are there technical solutions that bridge the gap?
4. Document the interest map for use in option generation

### Phase 3: Option Generation & Evaluation (Steps 8-10)

**Step 8: Generate Resolution Options**
1. Generate a comprehensive set of options (minimum 4, typically 5-7):
   - **Option A**: Adopt Party 1's position fully
   - **Option B**: Adopt Party 2's position fully
   - **Option C**: Adopt Party 3's position fully (if applicable)
   - **Option D**: Compromise solution (split the difference)
   - **Option E**: Integrative solution (creative alternative that addresses all interests)
   - **Option F**: Phased approach (adopt one position now, transition to another later)
   - **Option G**: Deferred decision (gather more information before deciding)
2. For each option, define:
   - Detailed description of what would be implemented
   - Requirements for implementation (resources, timeline, approvals)
   - Impact on each affected deliverable
   - Estimated cost (CAPEX + OPEX lifecycle)
   - Estimated schedule impact
   - Risk profile
   - Stakeholder acceptance likelihood
3. Validate feasibility of each option:
   - Technical feasibility (can it actually be done?)
   - Commercial feasibility (are the terms available?)
   - Schedule feasibility (can it be done in time?)
   - Regulatory feasibility (does it comply with all requirements?)

**Step 9: Evaluate Options Using Weighted Decision Matrix**
1. Define evaluation criteria (standard set, adjusted per conflict type):
   - Safety impact (weight: 25% for safety-relevant; 10% otherwise)
   - Lifecycle cost / NPV (weight: 20-25%)
   - Schedule impact (weight: 15-20%)
   - Operational performance (weight: 15-20%)
   - Implementation risk (weight: 10-15%)
   - Stakeholder alignment (weight: 5-10%)
   - Strategic alignment (weight: 5-10%)
2. Score each option against each criterion (1-5 scale):
   - 5: Significantly positive impact
   - 4: Moderately positive impact
   - 3: Neutral
   - 2: Moderately negative impact
   - 1: Significantly negative impact
3. Calculate weighted scores and rank options
4. Perform sensitivity analysis:
   - Vary criteria weights +/- 20% to test robustness of ranking
   - Test key assumptions (e.g., discount rate, failure rates, production volumes)
   - Identify conditions under which the ranking would change
5. Document the analysis transparently so decision-makers can validate

**Step 10: Formulate Recommendation**
1. Select the highest-ranked option as the primary recommendation
2. If the top two options are within 5% of each other, present both as viable
3. Draft the recommendation with:
   - Clear statement of recommended option
   - Key rationale (top 3 reasons)
   - Expected outcomes (cost, schedule, risk, performance)
   - Implementation requirements and timeline
   - Residual risks and mitigation measures
   - Conditions or monitoring requirements
   - Fallback position if recommended option encounters problems
4. Prepare dissenting position summaries (for any party whose position was not adopted)
5. Identify stakeholder communication requirements for the recommendation

### Phase 4: Decision & Resolution (Steps 11-13)

**Step 11: Generate Decision Brief**
1. Produce the Conflict Analysis Report (.docx) with full detail
2. Produce the Decision Brief (.pptx) for the appropriate audience:
   - Executive level: 5-8 slides, focus on impact and recommendation
   - Management level: 8-12 slides, include options analysis detail
   - Working level: Full report with all supporting data
3. Distribute pre-read materials via mcp-outlook:
   - Decision authority receives full package 48 hours before decision meeting
   - All affected parties receive the Decision Brief 24 hours before
4. Schedule decision meeting via mcp-teams:
   - Include all affected domain representatives
   - Include decision authority
   - Include neutral facilitator (OR Orchestrator / PMO)
5. Post decision meeting agenda in OR program channel

**Step 12: Facilitate Decision**
1. Support the decision meeting:
   - Present conflict summary and analysis
   - Facilitate discussion of each party's perspective
   - Present options analysis and recommendation
   - Answer questions using the detailed analysis data
   - Record the decision, rationale, and any conditions
2. If consensus reached: document the agreed resolution
3. If no consensus: apply the escalation protocol:
   - Summarize areas of agreement and disagreement
   - Identify the specific points requiring arbitration
   - Escalate to the next level of decision authority per RACI
   - Provide the full analysis package to the escalation authority
4. Record the decision formally:
   - Decision statement (what was decided)
   - Decision rationale (why this option was selected)
   - Decision authority (who made the decision)
   - Conditions (any requirements attached to the decision)
   - Dissenting views (documented for the record)
   - Effective date (when the decision takes effect)

**Step 13: Communicate and Close**
1. Issue formal decision notification to all affected parties via mcp-outlook
2. Update the Conflict Register with resolution details
3. Post decision summary in OR program channel via mcp-teams
4. Update the OR Dashboard to reflect conflict resolution
5. Remove deliverable blocks in the tracking system
6. Assign implementation actions from the decision:
   - Which agents need to update their deliverables?
   - What timeline for incorporating the decision?
   - Who monitors compliance with the decision?
7. Update the Risk Register:
   - Close risks that are resolved by the decision
   - Add new residual risks from the resolution
   - Update risk scores for affected items

### Phase 5: Implementation Monitoring & Learning (Steps 14-16)

**Step 14: Monitor Decision Implementation**
1. Track that all affected deliverables are updated per the decision:
   - Set implementation milestone dates
   - Monitor agent deliverable updates via Airtable
   - Flag non-compliance (deliverable not updated by deadline)
2. Verify that the decision is consistently applied:
   - Cross-check downstream deliverables for alignment
   - Ensure no "workarounds" that circumvent the decision
3. Monitor for unintended consequences:
   - New conflicts triggered by the resolution
   - Unexpected cost or schedule impacts
   - Stakeholder dissatisfaction requiring attention

**Step 15: Verify Resolution Effectiveness**
1. At the next gate review, assess whether the resolution achieved its intended outcome:
   - Were the projected cost savings/impacts realized?
   - Was the schedule impact as predicted?
   - Are affected stakeholders aligned with the outcome?
   - Did the resolution create any new problems?
2. If the resolution is not working as intended:
   - Re-open the conflict with new information
   - Apply the same analysis process with updated data
   - Escalate if the original decision authority needs to reconsider
3. Document the resolution outcome in the conflict record

**Step 16: Capture Lessons Learned**
1. For every resolved conflict, capture:
   - What caused the conflict? (root cause)
   - How could it have been prevented? (process improvement)
   - What worked well in the resolution? (best practice)
   - What should be done differently? (improvement opportunity)
   - Is there a process change that would prevent recurrence?
2. Update the knowledge base with conflict resolution patterns:
   - By conflict type (technical, commercial, resource, etc.)
   - By industry sector (mining, O&G, power, etc.)
   - By project phase (FEED, detailed engineering, construction, etc.)
3. Feed lessons into the OR program planning process:
   - Improve WBS dependency identification
   - Improve interface definition between domains
   - Improve decision sequencing in the OR timeline
4. Generate periodic conflict trend analysis:
   - Total conflicts by type, severity, and domain
   - Average resolution time vs. SLA
   - Escalation rate and effectiveness
   - Repeat conflict patterns indicating systemic issues

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Detection Speed | Time from conflict manifestation to formal registration | <24 hours | <48 hours |
| Analysis Completeness | All parties' positions documented with evidence | 100% | 100% |
| Impact Quantification | Cost, schedule, and risk quantified for each option | All 3 dimensions | At least cost + schedule |
| Options Generated | Number of viable resolution options presented | >=5 options | >=3 options |
| Decision Brief Quality | Decision-maker rates brief as sufficient for decision | >4.5/5 | >4.0/5 |
| Resolution Cycle Time | Days from detection to formal decision | <5 business days | <10 business days |
| Working-Level Resolution | % resolved without executive escalation | >80% | >60% |
| SLA Compliance | % conflicts resolved within severity-based SLA | >90% | >80% |
| Stakeholder Satisfaction | Parties rate process as fair and transparent | >4.0/5 | >3.5/5 |
| Decision Implementation | % of decisions fully implemented on schedule | >95% | >90% |
| Audit Trail Completeness | Full documentation of analysis, decision, rationale | 100% | 100% |
| Rework Reduction | Rework attributable to unresolved conflicts | <3% of effort | <5% of effort |
| Conflict Recurrence | Same conflict re-emerging after resolution | <5% recurrence | <10% recurrence |
| Lessons Captured | Lessons learned documented for each resolved conflict | 100% | >90% |

### Automated Quality Checks

- [ ] Every conflict has a unique ID and is registered in the Conflict Register
- [ ] All affected domains/agents are identified and notified
- [ ] Each party's position is documented with supporting evidence
- [ ] Cost impact quantified with stated assumptions
- [ ] Schedule impact quantified with critical path reference
- [ ] Minimum 3 resolution options generated and evaluated
- [ ] Decision matrix uses weighted criteria with sensitivity analysis
- [ ] Recommendation clearly stated with rationale
- [ ] Decision authority identified from RACI matrix
- [ ] Decision documented with date, authority, rationale, and conditions
- [ ] All affected deliverables updated post-decision
- [ ] Conflict Register status updated to "Resolved"
- [ ] No "TBD" or placeholder entries in any deliverable
- [ ] Lessons learned captured and stored in knowledge base

---

## Inter-Agent Dependencies

| Agent/Skill | Dependency Type | Description |
|-------------|----------------|-------------|
| `orchestrate-or-program` (H-01) | Upstream / Trigger | Orchestrator detects blocked dependencies and triggers conflict resolution |
| `agent-operations` | Input Provider | Provides operations requirements, constraints, and impact assessments |
| `agent-maintenance` | Input Provider | Provides maintenance strategy requirements, standardization needs, and CMMS impacts |
| `agent-hse` | Input Provider | Provides safety and environmental requirements; escalation for safety-related conflicts |
| `agent-hr` | Input Provider | Provides workforce constraints, training impacts, and organizational requirements |
| `agent-finance` | Input Provider | Provides cost data, budget constraints, NPV analysis, and financial impact assessments |
| `agent-legal` | Input Provider | Provides regulatory constraints, contractual obligations, and compliance requirements |
| `agent-procurement` | Input Provider | Provides commercial terms, supply chain constraints, and vendor relationship impacts |
| `agent-project` | Input Provider | Provides schedule data, engineering specifications, and interface requirements |
| `agent-communications` | Downstream | Receives conflict resolution outcomes for stakeholder communication |
| `agent-doc-control` | Service Agent | Stores conflict analysis reports, decision briefs, and audit trail documents |
| `accelerate-decision-cycle` (N-03) | Peer Skill | Provides decision acceleration support when conflict resolution requires rapid decision |
| `unify-operational-data` (N-01) | Upstream Skill | Provides unified data view that helps detect information-asymmetry conflicts |
| `track-or-deliverables` (H-02) | Data Source | Provides deliverable status data to identify blocked items and impacts |
| `generate-or-gate-review` (H-03) | Downstream Skill | Gate review packages include conflict resolution status and outstanding conflicts |
| `validate-output-quality` (F-05) | Quality Gate | Validates conflict analysis reports meet quality standards before distribution |
| `sync-airtable-jira` (D-01) | Integration | Syncs conflict register with Jira for human task tracking |

---

## MCP Integrations

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "Access equipment data, maintenance requirements, and failure history for technical conflicts"
capabilities:
  - Query equipment specifications and configuration data
  - Retrieve maintenance strategy requirements by equipment
  - Access failure history and reliability data for evidence-based analysis
  - Identify spare parts commonality and standardization impacts
  - Query CMMS configuration requirements and constraints
authentication: API Key + OAuth2
usage_in_skill:
  - Step 4: Retrieve equipment data to support domain position analysis
  - Step 6: Quantify maintenance cost impacts of each resolution option
  - Step 8: Generate technical feasibility data for option evaluation
  - Step 14: Monitor implementation of maintenance-related decisions
```

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "Access financial data, procurement status, and budget allocations for cost impact analysis"
capabilities:
  - Query purchase orders, contracts, and procurement commitments
  - Retrieve budget allocations by cost center and domain
  - Access vendor pricing and commercial terms
  - Calculate lifecycle cost models for equipment alternatives
  - Track financial implications of decision options
authentication: OAuth2 (SAP / Oracle integration)
usage_in_skill:
  - Step 4: Retrieve commercial data for procurement-related conflicts
  - Step 6: Quantify cost impacts (CAPEX, OPEX, lifecycle) for each option
  - Step 9: Validate financial feasibility of resolution options
  - Step 14: Track financial compliance with decision outcomes
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Real-time conflict coordination, decision meetings, and stakeholder notifications"
capabilities:
  - Post conflict notifications in OR program channel
  - Schedule decision meetings with all affected parties
  - Share decision briefs and pre-read materials
  - Record meeting decisions and action items
  - Facilitate asynchronous stakeholder input collection
  - Generate meeting summaries and minutes
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 3: Post conflict registration notification
  - Step 4: Collect stakeholder input asynchronously
  - Step 11: Schedule and support decision meetings
  - Step 12: Facilitate decision-making and record outcomes
  - Step 13: Communicate decisions to all affected parties
```

---

## Templates & References

### Conflict Analysis Report Template
```
CONFLICT ANALYSIS REPORT
========================
Conflict ID: {CF-ProjectCode-Year-Sequence}
Title: {Descriptive Title}
Date: {Date}
Analyst: {Agent/Person}
Decision Authority: {Name, Role}
Resolution SLA: {Date}

1. EXECUTIVE SUMMARY
   - Conflict: {one paragraph}
   - Parties: {Domain A vs. Domain B vs. Domain C}
   - Impact: ${X}M cost | {Y} days schedule | {Z} deliverables blocked
   - Recommendation: Option {X} - {description}
   - Decision Required By: {date}

2. POSITION ANALYSIS
   Domain A: {position, rationale, evidence, constraints}
   Domain B: {position, rationale, evidence, constraints}
   Domain C: {position, rationale, evidence, constraints}

3. IMPACT ANALYSIS
   Cost:     Option A ${X}M | Option B ${Y}M | Option C ${Z}M
   Schedule: Option A {X}d  | Option B {Y}d  | Option C {Z}d
   Risk:     Option A {H/M/L}| Option B {H/M/L}| Option C {H/M/L}

4. OPTIONS & RECOMMENDATION
   [Weighted decision matrix]
   Recommended: Option {X}
   Rationale: {top 3 reasons}
```

### Decision Brief Template (PowerPoint)
```
Slide 1: CONFLICT SUMMARY
  - What: {conflict description}
  - Who: {domains involved}
  - Impact: {cost, schedule, deliverables}
  - Urgency: {SLA deadline}

Slide 2: POSITIONS
  +-------------------+-------------------+-------------------+
  | Domain A          | Domain B          | Domain C          |
  | Position:         | Position:         | Position:         |
  | Rationale:        | Rationale:        | Rationale:        |
  | Constraint:       | Constraint:       | Constraint:       |
  +-------------------+-------------------+-------------------+

Slide 3: IMPACT DASHBOARD
  [Cost comparison chart] [Schedule comparison chart] [Risk heat map]

Slide 4: OPTIONS MATRIX
  | Criterion (weight) | Option A | Option B | Option C | Option D | Option E |
  | Safety (25%)       |    5     |    4     |    4     |    5     |    5     |
  | Cost (20%)         |    3     |    4     |    5     |    4     |    4     |
  | Schedule (20%)     |    4     |    3     |    3     |    4     |    5     |
  | Performance (15%)  |    5     |    4     |    3     |    4     |    4     |
  | Risk (10%)         |    4     |    3     |    4     |    4     |    4     |
  | Alignment (10%)    |    3     |    3     |    4     |    4     |    5     |
  | WEIGHTED SCORE     |   4.05   |   3.55   |   3.75   |   4.20   |   4.45   |

Slide 5: RECOMMENDATION
  Recommended: Option E - {description}
  Rationale: {key reasons}
  Implementation: {key steps and timeline}
  Residual Risk: {mitigation plan}

Slide 6: DECISION REQUEST
  Decision Authority: {Name, Role}
  Decision Deadline: {Date}
  Required: Approve / Reject / Request Additional Analysis
```

### Escalation Matrix
```
| Level | Trigger | Decision Authority | Response Time | Engagement |
|-------|---------|-------------------|---------------|------------|
| L0: Auto-Resolve | Information asymmetry resolved by data sharing | Domain leads | 24 hours | Automated |
| L1: Working Level | Low-medium conflict, domain leads can negotiate | Domain leads with mediator | 5 business days | Facilitated meeting |
| L2: Management | High conflict, domain leads cannot agree | OR Manager / PMO | 3 business days | Decision brief + meeting |
| L3: Executive | Critical conflict, management cannot agree | Project Director / VP | 48 hours | Executive brief + decision session |
| L4: Steering Committee | Strategic conflict affecting project viability | Project Steering Committee | 24 hours | Board-level brief |
| Safety Override | Any conflict with direct safety implications | HSE Director (immediate stop work authority) | Immediate | Emergency protocol |
```

---

## Examples

### Example 1: Equipment Standardization vs. Best-of-Breed Conflict

```
Conflict ID: CF-SV-2026-003
Title: Crusher Equipment Standardization vs. Performance Optimization
Severity: HIGH
Domains: Maintenance, Engineering, Procurement

Detection:
  Agent-maintenance submitted equipment standardization requirement in Maintenance
  Strategy deliverable. Agent-project's engineering specifications already issued with
  three different crusher vendors. Agent-procurement flagged corporate framework agreement
  with a fourth vendor. Automated scan detected contradictions across three deliverables.

Positions:
  Maintenance: "Standardize all crushers to Metso GP series. Reduces spare parts SKUs by
  40% (from 340 to 204). Single CMMS configuration. One vendor training program. Estimated
  OPEX saving: $1.2M/year in spare parts + $400K/year in training = $1.6M/year."

  Engineering: "Best-of-breed for each duty. Primary: Metso GP500 (proven in this ore type).
  Secondary: FLSmidth XL500 (better wear life for secondary duty). Tertiary: Sandvik CH890
  (superior fines handling). Combined throughput optimization: +8% vs. single-vendor at
  estimated $12M/year additional revenue."

  Procurement: "Corporate framework with ThyssenKrupp Kubria. 15% volume discount = $3.4M
  CAPEX saving. Pre-negotiated T&Cs. Established supply chain with 4-week lead times vs.
  12-16 weeks for non-framework vendors."

Analysis:
  Lifecycle cost (30-year NPV at 8%):
    - Metso standardization: NPV = $847M (high CAPEX, low OPEX, moderate performance)
    - Best-of-breed mix: NPV = $892M (moderate CAPEX, moderate OPEX, high performance)
    - ThyssenKrupp framework: NPV = $831M (low CAPEX, high OPEX, moderate performance)
    - Compromise: Metso primary + secondary, Sandvik tertiary: NPV = $878M

  Schedule impact:
    - Metso standard: 0 days (specifications can be updated quickly)
    - Best-of-breed: +15 days (procurement packages already issued; revisions needed)
    - ThyssenKrupp: +30 days (new specifications required; vendor qualification needed)
    - Compromise: +5 days (minor specification update)

Recommendation: Option D - Compromise (Metso primary + secondary, Sandvik tertiary)
  Rationale:
  1. Captures 85% of the standardization benefit (spare parts SKUs reduced by 32%)
  2. Retains the critical tertiary circuit optimization (+5% throughput for fines)
  3. NPV of $878M is 97% of best-case and 5.7% above ThyssenKrupp option
  4. Minimal schedule impact (+5 days vs. +15 or +30)
  5. Satisfies Maintenance's training simplification (2 vendors vs. 3)
  6. Does not trigger corporate framework penalty (volume threshold not met for TK)

Decision: Approved by Project Director on 2026-02-24
Implementation: Engineering to update specifications within 10 business days.
Procurement to issue revised bid packages. Maintenance to update CMMS config plan.
```

### Example 2: Circular Dependency Resolution (Operating Model Deadlock)

```
Conflict ID: CF-SV-2026-007
Title: Operating Model - Staffing Plan - OPEX Budget Circular Dependency
Severity: CRITICAL
Domains: Operations, HR, Finance

Detection:
  Orchestrator identified circular dependency deadlock:
  - Operations cannot finalize operating model without knowing budget constraints (Finance)
  - Finance cannot finalize OPEX budget without knowing headcount (HR)
  - HR cannot finalize headcount without knowing operating model (Operations)
  All three deliverables blocked for 3 weeks. Gate G2 at risk.

Root Cause Analysis:
  Decisions were sequenced incorrectly in the original OR WBS. The three deliverables
  were treated as independent when they are interdependent. No iteration mechanism
  was planned.

Resolution Approach: Phased iteration with progressive refinement
  Iteration 1 (Week 1):
    - Operations develops preliminary operating model with 3 scenarios (lean/base/robust)
    - Finance provides budget envelope (range, not fixed number)
    - HR develops parametric staffing model (FTE per operating scenario)

  Iteration 2 (Week 2):
    - Operations selects preferred scenario based on budget envelope
    - HR refines staffing plan for selected scenario
    - Finance develops detailed OPEX budget based on refined headcount

  Iteration 3 (Week 3):
    - Final alignment workshop: all three domains validate integrated package
    - Resolve any remaining delta items
    - Joint sign-off on integrated operating model + staffing plan + OPEX budget

Decision: Approved by OR Manager on 2026-02-18
Result: Deadlock broken. All three deliverables completed within 3 weeks. Gate G2
  preparation back on track. Lesson learned: add iteration cycles to OR WBS for
  interdependent deliverables.
```

### Example 3: Safety vs. Availability Conflict

```
Conflict ID: CF-SV-2026-012
Title: Additional Safety Interlocks vs. Plant Availability Impact
Severity: CRITICAL (safety-relevant)
Domains: HSE, Operations, Engineering

Detection:
  HSE agent recommended 12 additional safety interlock functions (SIF) based on HAZOP
  review. Operations flagged concern that historical data from similar plants shows
  each additional SIF increases spurious trip rate by 0.3-0.5 trips/year, projecting
  3.6-6.0 additional spurious trips/year, equating to $4.8M-$8.0M lost production.

Resolution:
  Safety override protocol activated (safety conflicts get immediate priority).
  SIL assessment conducted per IEC 61511 for each proposed SIF.
  Result:
    - 8 of 12 SIFs confirmed as required by quantitative risk assessment (LOPA)
    - 4 of 12 SIFs found to have alternative risk reduction measures available
    - For the 8 required SIFs: high-reliability design (SIL 2 architecture 1oo2D)
      reduces spurious trip rate to 0.05/year per SIF vs. 0.3-0.5 for basic design
    - Net impact: 0.4 additional spurious trips/year vs. 3.6-6.0 original projection
    - Cost of high-reliability design: $680K additional CAPEX (vs. $4.8M-$8.0M annual loss)

Decision: Approved by Project Director on 2026-02-19
  - Implement 8 SIFs with high-reliability architecture
  - Implement 4 alternative risk reduction measures (procedural + alarm management)
  - Safety requirement fully satisfied; availability impact minimized to <0.1%
```
