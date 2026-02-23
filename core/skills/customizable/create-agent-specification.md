# Create Agent Specification

## Skill ID: F-004
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Create detailed CLAUDE.md system prompts and specification documents for new AI agents. This skill defines the role, scope, tools, rules, interaction patterns, quality criteria, and behavioral boundaries for an agent, producing a complete specification that can be deployed to Windsurf, Claude Projects, or any AI platform. It ensures that every agent in the system is well-defined, consistent, and aligned with the overall architecture.

## Intent & Specification

**Problem:** AI agents are often created ad-hoc with vague system prompts that lead to inconsistent behavior, scope creep, conflicts with other agents, and poor output quality. Without a structured specification process, agents drift in behavior over time, overlap with other agents' responsibilities, and fail to integrate properly with the multi-agent system.

**Success Criteria:**
- Every agent has a complete specification document following a standard template
- Agent role and scope are clearly defined with explicit boundaries
- Interaction patterns with other agents are documented
- Quality criteria are measurable and testable
- Agent specification is detailed enough for deployment without additional interpretation
- Specifications are versioned and managed through github-prompt-manager

**Constraints:**
- Must produce specifications compatible with Claude/Windsurf system prompt format
- Must align with the OR multi-agent system architecture
- Must define clear boundaries (what the agent does and does NOT do)
- Must include testable quality criteria
- Must be maintainable (updates do not require full rewrite)
- Must use the define-intent-specification skill as input where available

## Trigger / Invocation

**Manual Triggers:**
- `create-agent-specification new --agent [name] --role [description]`
- `create-agent-specification update --agent [name] --section [section]`
- `create-agent-specification validate --agent [name]`
- `create-agent-specification compare --agent1 [name] --agent2 [name]` (overlap check)

**Automatic Triggers:**
- New agent identified during audit-ai-workflow
- Agent performance below quality criteria (triggers specification review)
- Architecture change requiring new agent

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Agent Name | User / Orchestrator | Yes | Identifier for the agent |
| Role Description | User / Intent Spec | Yes | High-level description of what the agent does |
| Domain Context | User / Knowledge Base | Yes | Industry and project context |
| Tool Inventory | System Config | Yes | Available tools the agent can use |
| Agent Registry | System Config | Yes | Existing agents to avoid overlap |
| Quality Requirements | User / Standards | Yes | Performance expectations |
| Intent Specification | define-intent-specification | Recommended | Detailed intent for the agent |
| Interaction Patterns | Architecture | Yes | How agent communicates with others |

## Output Specification

**Primary Output: Agent Specification Document (CLAUDE.md format)**

```markdown
# {Agent Name}

## Identity
You are {agent_name}, the {role_description} for the {system_name}.

## Role & Scope

### What You Do
{List of responsibilities and capabilities}

### What You Do NOT Do
{Explicit boundaries - tasks that belong to other agents}

### Your Authority Level
- Can decide: {list of decisions within authority}
- Must escalate: {list of decisions requiring human/orchestrator input}
- Must defer to: {list of other agents for specific topics}

## Context
{Background information the agent needs about the domain, project, organization}

## Tools & Capabilities
| Tool | Purpose | Usage Rules |
|------|---------|-------------|
| {tool} | {what it does} | {when and how to use it} |

## Rules & Constraints

### Hard Rules (never violate)
1. {Rule 1}
2. {Rule 2}

### Soft Rules (follow unless context requires otherwise)
1. {Guideline 1}
2. {Guideline 2}

### Safety Rules
1. {Safety-specific rules}

## Communication Protocol

### Receiving Tasks
{How the agent receives work from the orchestrator}

### Reporting Progress
{How the agent reports status updates}

### Requesting Help
{How the agent asks for information from other agents}

### Escalating Issues
{When and how to escalate problems}

### Inbox Message Format
{Standard format for sending/receiving messages}

## Output Standards

### Document Outputs
{Format, style, and quality requirements for documents}

### Data Outputs
{Format, validation, and quality requirements for data}

### Communication Outputs
{Tone, format, and style for messages}

## Quality Criteria
| Criterion | Metric | Target | Measurement |
|-----------|--------|--------|-------------|
| {criterion} | {metric} | {target} | {how to measure} |

## Error Handling
### When You Do Not Know
{What to do when lacking information or expertise}

### When You Disagree
{How to handle conflicts with other agents or instructions}

### When You Fail
{How to handle task failures gracefully}

## Examples
### Example 1: {Typical Task}
Input: {what is received}
Process: {what the agent does}
Output: {what is produced}

### Example 2: {Edge Case}
Input: {unusual scenario}
Process: {how agent handles it}
Output: {expected behavior}
```

## Methodology & Standards

- **Role Clarity:** Every agent must have a one-sentence role statement that anyone can understand. If the role cannot be stated simply, it is too broad.
- **Boundary Definition:** Explicit boundaries are more important than responsibilities. What the agent does NOT do prevents conflicts and scope creep.
- **Authority Levels:** Three levels: autonomous decision, escalate to orchestrator, defer to specialist agent. Every action falls into one category.
- **Tool Documentation:** Every tool the agent can use must be listed with usage rules. Agents should not use tools not in their specification.
- **Quality as Code:** Quality criteria must be measurable. "Good quality" is not acceptable. "Reports contain all required sections and pass validation" is measurable.
- **Example-Driven:** At least 2 examples (typical and edge case) to anchor behavior expectations.
- **Anti-Pattern Documentation:** Explicitly state common mistakes the agent should avoid.

## Step-by-Step Execution

### Step 1: Define Agent Identity
1. Name the agent (following naming convention: agent-{domain})
2. Write one-sentence role statement
3. Identify the agent's primary value proposition (why does this agent exist?)
4. Determine the agent's position in the multi-agent architecture

### Step 2: Define Scope and Boundaries
1. List all responsibilities (what the agent does)
2. List explicit exclusions (what the agent does NOT do)
3. Identify overlap risk with existing agents
4. Define authority levels for common decisions
5. Document escalation triggers

### Step 3: Define Context Requirements
1. What domain knowledge does the agent need?
2. What project-specific information is required?
3. What standards and regulations apply?
4. What terminology must the agent understand?
5. Create context loading specification

### Step 4: Define Tools and Capabilities
1. List all tools the agent can use
2. For each tool: define purpose and usage rules
3. Define tool interactions (which tools work together)
4. Define tool limitations and fallback behaviors

### Step 5: Define Communication Protocol
1. How does the agent receive tasks? (Shared Task List format)
2. How does the agent report progress? (Status update format)
3. How does the agent request help? (Inbox message format)
4. How does the agent escalate issues? (Escalation criteria and format)
5. Define message templates for common interactions

### Step 6: Define Output Standards
1. For each output type:
   - Document format and template
   - Data format and schema
   - Quality validation rules
   - Review and approval workflow
2. Define naming conventions for outputs
3. Define filing/storage requirements

### Step 7: Define Quality Criteria
1. For each quality dimension:
   - Define measurable metric
   - Set target value
   - Define measurement method
   - Define what happens when target is missed
2. Include both functional quality (does it work?) and non-functional quality (is it timely, consistent, usable?)

### Step 8: Write Examples
1. Write 2-3 examples of typical tasks showing:
   - Input received
   - Process followed
   - Output produced
2. Write 1-2 edge case examples showing:
   - Unusual or ambiguous scenarios
   - How the agent handles uncertainty
   - Escalation behavior

### Step 9: Validate Specification
1. Check completeness: all sections populated
2. Check clarity: could another person build this agent from the spec?
3. Check consistency: no contradictions between sections
4. Check boundaries: no overlap with other agent specifications
5. Check quality criteria: all measurable and testable
6. Peer review with domain expert

### Step 10: Deploy and Version
1. File specification in github repository
2. Deploy via github-prompt-manager or github-skill-deployer
3. Register agent in agent registry
4. Notify orchestrator of new/updated agent
5. Version the specification

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Specification Completeness | All required sections populated | 100% |
| Role Clarity | One-sentence role understandable by non-expert | Yes |
| Boundary Definition | Explicit exclusions defined | > 5 per agent |
| Quality Measurability | Quality criteria with measurable metrics | 100% |
| Example Coverage | Typical + edge case examples | > 2 per agent |
| Overlap Detection | No unresolved overlap with other agents | 0 overlaps |
| Deployment Readiness | Spec can be deployed without modification | Yes |
| Peer Review | Specification reviewed by domain expert | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Intent spec used as input for agent spec |
| `github-prompt-manager` | Downstream | Agent specs deployed as system prompts |
| `github-skill-deployer` | Downstream | Agent skill files deployed to workspace |
| `orchestrate-or-agents` | Consumer | Orchestrator uses specs to assign tasks |
| `audit-ai-workflow` | Upstream | Audit identifies need for new agents |
| `agent-doc-control` | Downstream | Specs filed as controlled documents |

## Templates & References

**Agent Naming Convention:**
```
agent-{domain}         (e.g., agent-operations, agent-maintenance)
agent-{function}       (e.g., agent-doc-control, agent-communications)
orchestrate-{system}   (e.g., orchestrate-or-agents)
```

**Quick Agent Spec (for simple agents):**
```markdown
# {Agent Name}
Role: {one sentence}
Does: {3-5 bullet points}
Does NOT: {3-5 bullet points}
Tools: {list}
Communicates with: {list}
Quality: {2-3 measurable criteria}
```

## Examples

**Example 1: Creating Specification for a New Agent**
```
Command: create-agent-specification new --agent "agent-quality" --role "Quality and laboratory management"

Process:
  1. Define identity: "agent-quality - Quality Management specialist for the OR system"
  2. Define scope:
     Does: quality management system, laboratory procedures, sampling plans, product specifications, quality KPIs
     Does NOT: process operations (agent-operations), environmental monitoring (agent-hse), equipment maintenance (agent-maintenance)
  3. Define boundaries: Can approve sampling procedures. Must escalate product spec deviations. Defers to agent-hse on environmental sampling.
  4. Define tools: Document generation, data analysis, LIMS configuration
  5. Define communications: Reports to orchestrator, sends specs to agent-procurement, receives quality standards from agent-legal
  6. Define quality criteria: Sampling plan coverage 100%, lab procedure compliance 100%, product spec deviation response < 4 hours
  7. Write examples: typical (develop sampling plan), edge case (product off-spec during ramp-up)
  8. Validate and file

Output: Complete agent-quality specification ready for deployment.
```

**Example 2: Overlap Detection**
```
Command: create-agent-specification compare --agent1 agent-operations --agent2 agent-maintenance

Overlap Analysis:
  Potential Overlaps Found: 3

  1. "Operator rounds" - operations defines what to check, maintenance defines inspection criteria
     Resolution: Operations owns the round schedule and execution. Maintenance specifies technical inspection points. Clear interface.

  2. "Equipment isolation (LOTO)" - both agents reference LOTO
     Resolution: HSE agent owns the LOTO procedure. Operations executes for operational isolation. Maintenance executes for maintenance isolation. Both follow HSE procedure.

  3. "Troubleshooting" - both agents may troubleshoot equipment issues
     Resolution: Operations troubleshoots process issues (wrong parameters). Maintenance troubleshoots equipment issues (mechanical failure). Escalation to both when unclear.

  Recommendation: Add explicit boundary statements to both agent specifications for these 3 areas.
```
