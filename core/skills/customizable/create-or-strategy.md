# Create OR Strategy

## Skill ID: F-006
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: Critical

## Purpose

Generate a comprehensive OR (Operational Readiness) Strategy document that defines how Operational Readiness will be managed for a specific project. This is the foundational document that establishes the OR program's scope, approach, governance, timeline, budget, and success criteria. It is the first major deliverable required for Gate G1 approval and sets the direction for all subsequent OR activities.

## Intent & Specification

**Problem:** Projects often start OR activities without a cohesive strategy, leading to fragmented efforts, misaligned priorities, inconsistent approaches across workstreams, and stakeholder confusion about what OR is trying to achieve. Without a strategy document, there is no agreed-upon framework for decision-making, resource allocation, or success measurement.

**Success Criteria:**
- Strategy document covers all 8 required sections (see Output Specification)
- Document is specific to the project (not generic boilerplate)
- Scope clearly defines what is in and out of the OR program
- Timeline is realistic and back-calculated from commissioning dates
- Budget estimate is within +/- 30% accuracy
- Governance framework defines clear decision rights and gate criteria
- Document is approved by the steering committee at Gate G1

**Constraints:**
- Must align with the project's overall execution strategy
- Must reflect the project's actual scope, timeline, and complexity
- Must comply with client governance and reporting standards
- Must be achievable with available resources
- Must be produced within 4-6 weeks of OR program initiation
- Must serve as the reference document for all subsequent OR planning

## Trigger / Invocation

**Manual Triggers:**
- `create-or-strategy generate --project [name] --config [file]`
- `create-or-strategy update --strategy [file] --section [section]`
- `create-or-strategy validate --strategy [file]`

**Orchestrator-Assigned:**
- First major task assigned after project onboarding
- Assigned to multiple agents for their workstream inputs

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Project Description | Client / Project | Yes | Project scope, technology, capacity |
| Project Schedule | Agent-Project | Yes | Key milestones, commissioning dates |
| Project Organization | Client / Project | Yes | Existing project team structure |
| Stakeholder Register | Agent-Communications | Yes | Key stakeholders and their interests |
| Client OR Standards | Client | No | Client-specific OR requirements |
| Benchmark Data | Knowledge Base | No | OR benchmarks for similar projects |
| Regulatory Context | Agent-Legal | Yes | Key regulatory requirements |
| Budget Parameters | Agent-Finance | Yes | Budget envelope for OR program |
| Risk Assessment | Agent-HSE | Yes | Initial risk profile |

**Project Description Template:**
```yaml
project:
  name: "Lithium Plant"
  client: "SQM"
  location: "Atacama, Chile"
  technology: "Lithium carbonate extraction and purification"
  capacity: "100,000 tonnes per year"
  capital_cost: "$1.2 billion"
  phase: "Detailed Engineering"
  epc_contractor: "Bechtel"
  key_dates:
    fid: "2025-01-15"
    engineering_complete: "2026-03-01"
    mechanical_completion: "2026-09-01"
    commissioning_start: "2026-09-15"
    first_product: "2027-01-01"
    commercial_operation: "2027-06-01"
  complexity:
    process_areas: 5
    major_equipment: 1200+
    hazardous_materials: true
    environmental_sensitivity: "high (desert ecosystem)"
    remote_location: true
    workforce_availability: "limited locally"
```

## Output Specification

**Primary Output: OR Strategy Document**

```markdown
# Operational Readiness Strategy
## {Project Name}
## Document Number: {Project}-PMO-STR-001
## Revision: 0
## Date: {Date}
## Status: {Draft / For Review / Approved}
## Classification: {Internal / Confidential}

---

## 1. EXECUTIVE SUMMARY
{1-page summary: what is OR, why it matters for this project, key decisions, timeline, budget}

## 2. PROJECT CONTEXT
### 2.1 Project Overview
{Description of the project: technology, capacity, location, status}

### 2.2 Project Timeline and Key Milestones
{Timeline with milestones relevant to OR}

### 2.3 Project Complexity and Risk Profile
{Assessment of what makes this project challenging from an OR perspective}

### 2.4 Lessons Learned from Similar Projects
{Relevant benchmarks and lessons from past projects}

## 3. OR SCOPE AND OBJECTIVES
### 3.1 OR Definition
{What Operational Readiness means for this project}

### 3.2 OR Objectives
{3-5 measurable objectives for the OR program}

### 3.3 OR Scope
{What is included in the OR program}

### 3.4 Out of Scope
{What is explicitly excluded}

### 3.5 OR Management Areas
{List of workstreams and their brief scope}
  - Operations
  - Maintenance
  - HSE & Process Safety
  - People & Organization
  - Finance
  - Legal & Regulatory
  - Procurement & Contracts
  - Project Integration
  - Communications & Change Management
  - Document Control

## 4. OR ORGANIZATION AND GOVERNANCE
### 4.1 OR Organization Structure
{Org chart: OR Lead, workstream leads, reporting lines}

### 4.2 Roles and Responsibilities
{RACI matrix for key OR activities}

### 4.3 Governance Framework
{Gate structure: G0-G4 with criteria and deliverables}

### 4.4 Decision-Making Authority
{Who decides what at each level}

### 4.5 Reporting Structure
{Multi-level reporting: executive, management, operational}

### 4.6 Interface with Project Organization
{How OR interfaces with EPC, client project team}

## 5. OR APPROACH AND METHODOLOGY
### 5.1 Overall Approach
{Phased approach, progressive buildup, key principles}

### 5.2 Phase 1: Strategy and Planning
{Activities, deliverables, timeline}

### 5.3 Phase 2: Detailed Development
{Activities, deliverables, timeline}

### 5.4 Phase 3: Implementation and Testing
{Activities, deliverables, timeline}

### 5.5 Phase 4: Commissioning Participation
{Activities, deliverables, timeline}

### 5.6 Phase 5: Commercial Operation
{Activities, deliverables, timeline}

### 5.7 AI-Enabled OR (Optional)
{How AI agents and tools will be used to accelerate OR}

## 6. OR TIMELINE AND MILESTONES
### 6.1 OR Master Schedule (High-Level)
{Gantt chart or timeline showing all workstreams and gates}

### 6.2 Key Milestones
{Table of milestones with dates}

### 6.3 Dependencies with Project Schedule
{Critical dependencies between OR and EPC}

### 6.4 Critical Path
{What is on the critical path and what drives the timeline}

## 7. OR BUDGET
### 7.1 Budget Summary
{Total OR budget by category}

### 7.2 Budget by Workstream
{Breakdown by management area}

### 7.3 Budget by Phase
{Spending profile over time}

### 7.4 Key Budget Assumptions
{What assumptions drive the budget estimate}

### 7.5 Contingency
{Risk-based contingency assessment}

## 8. RISKS AND MITIGATION
### 8.1 OR Program Risks
{Top 10 risks to OR program success}

### 8.2 Mitigation Strategies
{Mitigation plan for each top risk}

### 8.3 Risk Monitoring
{How risks will be tracked and managed}

## APPENDICES
### A. Stakeholder Register
### B. RACI Matrix
### C. Gate Deliverable Matrix
### D. Preliminary WBS
### E. Glossary of Terms
```

## Methodology & Standards

- **Structured Approach:** OR Strategy follows a recognized OR methodology (IPA, ICTC, or client-specific) adapted to project context.
- **Back-Scheduling:** All dates back-calculated from commercial operation date. OR activities scheduled to be complete before they are needed (not just-in-time).
- **Benchmarking:** Budget and timeline benchmarked against similar projects. OR typically represents 3-5% of CAPEX for mining/process projects.
- **Risk-Based:** OR scope and effort prioritized based on risk assessment. Higher-risk areas get more attention and earlier start.
- **Stakeholder-Aligned:** Strategy document reviewed with key stakeholders before Gate G1 submission to ensure buy-in.

## Step-by-Step Execution

### Step 1: Gather Project Context
1. Obtain project description, schedule, and organization from agent-project
2. Obtain regulatory context from agent-legal
3. Obtain initial risk profile from agent-hse
4. Obtain budget parameters from agent-finance
5. Obtain stakeholder register from agent-communications
6. Research benchmarks for similar projects

### Step 2: Define OR Scope and Objectives
1. Workshop (or structured session) with key stakeholders to define:
   - What OR means for this specific project
   - Which management areas are in scope
   - What the top 3-5 measurable objectives are
2. Define explicit exclusions (out of scope)
3. Document in Section 3 of the strategy

### Step 3: Design Governance Framework
1. Define gate structure (typically G0-G4):
   - G0: OR mandate (decide to do OR)
   - G1: Strategy approved (this document)
   - G2: Plans complete (detailed plans per workstream)
   - G3: Ready for commissioning (team, systems, procedures ready)
   - G4: Ready for operations (full operational capability)
2. Define gate criteria and required deliverables
3. Define decision authority at each level
4. Define reporting cadence and format
5. Document in Section 4

### Step 4: Develop Approach and Timeline
1. Define OR phases aligned with project phases
2. For each phase, list key activities and deliverables
3. Create high-level schedule (Gantt or milestone chart)
4. Identify dependencies with project schedule
5. Determine critical path
6. Document in Sections 5 and 6

### Step 5: Estimate Budget
1. Estimate OR costs by category:
   - OR team labor (internal + consultants)
   - Recruitment costs
   - Training costs
   - Systems (CMMS, tools)
   - Spare parts initial stock
   - Emergency equipment
   - Contingency
2. Validate against benchmarks (3-5% of CAPEX for mining)
3. Present as summary and by workstream
4. Document in Section 7

### Step 6: Assess Risks
1. Identify top 10 risks to OR success:
   - Typical: late start, insufficient budget, key personnel not available, EPC information delays, regulatory changes, labor market shortage
2. For each risk: assess likelihood and impact
3. Define mitigation strategies
4. Document in Section 8

### Step 7: Write Executive Summary
1. After all sections complete, write the executive summary
2. Highlight: why OR matters, key approach, timeline, budget, top risks
3. Keep to 1 page

### Step 8: Review and Submit
1. Internal review with OR team
2. Stakeholder review (key stakeholders per register)
3. Incorporate feedback
4. Submit for Gate G1 approval
5. File in document control

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Section Completeness | All 8 sections populated with project-specific content | 100% |
| Project Specificity | Generic content / total content | < 10% generic |
| Timeline Realism | Milestones back-calculated and achievable | Validated |
| Budget Accuracy | Estimate within acceptable range | +/- 30% |
| Stakeholder Alignment | Key stakeholders reviewed and concur | > 80% |
| Gate Criteria Clarity | Each gate has measurable pass/fail criteria | 100% |
| Risk Coverage | Top risks identified with mitigations | > 10 risks |
| Approval at G1 | Strategy approved without major revision | First submission |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Assigns task | Orchestrator triggers strategy development |
| `agent-or-pmo` | Collaborates | PMO defines governance framework and gate structure |
| `agent-project` | Provides input | Project schedule, milestones, EPC context |
| `agent-finance` | Provides input | Budget parameters and validation |
| `agent-hse` | Provides input | Risk assessment |
| `agent-legal` | Provides input | Regulatory context |
| `agent-communications` | Provides input | Stakeholder register |
| `agent-hr` | Provides input | Workforce availability assessment |
| All agents | Downstream | Strategy guides all subsequent OR work |

## Templates & References

**Gate Deliverable Matrix Template:**
```
| Deliverable | G1 | G2 | G3 | G4 | Responsible |
|-------------|----|----|----|----|-------------|
| OR Strategy | X  |    |    |    | OR-PMO |
| OR Plan 360 |    | X  |    |    | All Agents |
| Staffing Plan|   | X  |    |    | HR |
| All SOPs    |    |    | X  |    | Operations |
| CMMS Ready  |    |    | X  |    | Maintenance |
| Team Trained|    |    |    | X  | HR |
```

## Examples

**Example 1: Generate OR Strategy for Lithium Plant**
```
Command: create-or-strategy generate --project "Lithium Plant" --config lithium-config.yaml

Process:
  1. Load project context: $1.2B lithium plant, Atacama Chile, 100K tpa
  2. Commissioning: Sep 2026 -> back-calculate OR start: Jun 2025 (15 months)
  3. Define scope: all 10 management areas in scope
  4. Governance: 5 gates (G0-G4), steering committee oversight
  5. Budget estimate: $42M (3.5% of CAPEX)
     - Labor: $12M, Recruitment: $3M, Training: $5M
     - Systems: $2M, Spare Parts: $8M, Emergency: $2M
     - Contingency: $10M (24%)
  6. Top risks: late start (MITIGATED - starting now), workforce shortage in Atacama,
     EPC information delays, complex process chemistry
  7. Timeline: 5 phases over 24 months

Output: 35-page OR Strategy document ready for Gate G1 review.
```
