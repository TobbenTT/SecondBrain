# Create OR Plan 360

## Skill ID: F-007
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: Critical

## Purpose

Generate a comprehensive OR Plan 360 -- a detailed plan covering all management areas of Operational Readiness for a specific project. This is the master planning document that translates the OR Strategy (Gate G1) into actionable plans by management area, with specific deliverables, timelines, resources, and interdependencies. It is the primary deliverable for Gate G2 approval and serves as the execution roadmap for the entire OR program.

## Intent & Specification

**Problem:** After the OR Strategy is approved, teams struggle to translate strategic intent into detailed plans. Without a comprehensive 360-degree plan, workstreams plan in isolation, interdependencies are missed, resource conflicts go undetected, and there is no single reference for what needs to happen, when, and by whom. The OR Plan 360 bridges the gap between strategy and execution.

**Success Criteria:**
- Plan covers all management areas defined in the OR Strategy
- Each area has specific deliverables with owners, timelines, and acceptance criteria
- Interdependencies between areas are mapped and sequenced
- Resource requirements are quantified and reconciled
- Plan is integrated with the master project schedule
- Budget is refined to +/- 15% accuracy
- Plan is approved at Gate G2

**Constraints:**
- Must be consistent with the approved OR Strategy
- Must integrate inputs from all specialist agents
- Must be specific enough for execution (not just high-level intentions)
- Must handle interdependencies explicitly
- Must be updatable as the project progresses
- Must be produced within the Gate G2 timeline

## Trigger / Invocation

**Manual Triggers:**
- `create-or-plan generate --project [name] --strategy [file]`
- `create-or-plan update --plan [file] --area [management-area]`
- `create-or-plan validate --plan [file]`
- `create-or-plan integrate --plan [file]` (integrate all agent inputs)

**Orchestrator-Assigned:**
- After Gate G1 approval, orchestrator assigns plan development
- Each agent contributes their management area section

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Approved OR Strategy | Gate G1 / Doc Control | Yes | Foundation for the plan |
| Agent Workstream Plans | All specialist agents | Yes | Detailed plans per area |
| Project Schedule (Level 3) | Agent-Project | Yes | Detailed project milestones |
| Resource Availability | Agent-HR / Client | Yes | People available for OR |
| Refined Budget | Agent-Finance | Yes | Updated budget estimates |
| Risk Register | Agent-HSE | Yes | Current risk assessment |
| Dependency Matrix | Agent-Project / Orchestrator | Yes | Cross-workstream dependencies |
| Lessons Learned | Knowledge Base | No | Relevant lessons from past projects |

## Output Specification

**Primary Output: OR Plan 360 Document**

```markdown
# Operational Readiness Plan 360
## {Project Name}
## Document Number: {Project}-PMO-PLA-001
## Revision: 0
## Date: {Date}
## Status: {Draft / For Review / Approved}

---

## PART A: PLAN OVERVIEW

### 1. Purpose and Scope
{What this document covers and how it relates to the OR Strategy}

### 2. Plan Summary Dashboard
{Visual dashboard showing all areas, status, and key dates}

### 3. Master Timeline
{Integrated timeline showing all workstream activities}

### 4. Interdependency Map
{Visual showing how workstreams connect and depend on each other}

### 5. Resource Summary
{Total resource requirements by period}

### 6. Budget Summary
{Refined budget by area and by period}

---

## PART B: MANAGEMENT AREA PLANS

### 7. Operations Readiness Plan
#### 7.1 Scope and Objectives
#### 7.2 Operating Model Plan
  - Deliverable: Operating Model Document
  - Owner: Agent-Operations
  - Timeline: {start} to {end}
  - Key Activities: task analysis, shift design, crew sizing, model validation
  - Dependencies: process design from EPC, regulatory input from Legal
  - Resources: Operations Lead + 2 process engineers (3 months)
  - Acceptance Criteria: approved by Operations Manager and reviewed by HR

#### 7.3 SOP Development Plan
  - Deliverable: SOP Register + all SOPs
  - Owner: Agent-Operations
  - Timeline: {start} to {end}
  - Key Activities: SOP register, drafting, HSE review, approval, training
  - Dependencies: P&IDs from EPC, HAZOP from HSE, operating model
  - Resources: SOP writer + SMEs per area (8 months)
  - Acceptance Criteria: all critical SOPs approved and trained before commissioning

#### 7.4 Commissioning Participation Plan
#### 7.5 Ramp-Up Plan
#### 7.6 Operations KPIs

### 8. Maintenance Readiness Plan
#### 8.1 Scope and Objectives
#### 8.2 Asset Register Plan
#### 8.3 Criticality Analysis Plan
#### 8.4 RCM/FMECA Plan
#### 8.5 PM Plan Development
#### 8.6 Spare Parts Strategy
#### 8.7 CMMS Configuration Plan
#### 8.8 Maintenance KPIs

### 9. HSE & Process Safety Plan
#### 9.1 Scope and Objectives
#### 9.2 Process Safety Management Plan
#### 9.3 HAZOP Action Closure Plan
#### 9.4 Emergency Response Plan
#### 9.5 Permit-to-Work Implementation Plan
#### 9.6 HSE Training Plan
#### 9.7 HSE KPIs

### 10. People & Organization Plan
#### 10.1 Scope and Objectives
#### 10.2 Organization Design Plan
#### 10.3 Staffing and Recruitment Plan
#### 10.4 Training and Competency Plan
#### 10.5 Workforce Transition Plan
#### 10.6 HR Policies

### 11. Financial Plan
#### 11.1 OPEX Model
#### 11.2 O&M Budget
#### 11.3 Business Cases

### 12. Legal & Regulatory Plan
#### 12.1 Regulatory Compliance Plan
#### 12.2 Permit Acquisition Plan
#### 12.3 Contract Review Plan

### 13. Procurement & Contracts Plan
#### 13.1 O&M Contract Plan
#### 13.2 Spare Parts Procurement Plan
#### 13.3 Supply Chain Setup Plan

### 14. Project Integration Plan
#### 14.1 Schedule Integration
#### 14.2 Interface Management
#### 14.3 Commissioning Integration
#### 14.4 Handover Plan

### 15. Communications Plan
#### 15.1 Stakeholder Communication Plan
#### 15.2 Change Management Plan
#### 15.3 RFI Management Plan

### 16. Document Control Plan
#### 16.1 Repository Setup
#### 16.2 Document Management Procedures
#### 16.3 TOP Management

---

## PART C: INTEGRATION AND GOVERNANCE

### 17. Interdependency Register
{Complete list of cross-workstream dependencies with timing}

### 18. Resource Plan
{Month-by-month resource requirements by role and workstream}

### 19. Budget Detail
{Refined budget by area, by quarter, with assumptions}

### 20. Risk Register (Updated)
{Risks updated based on detailed planning}

### 21. Quality Assurance Plan
{How OR deliverables will be quality-checked}

### 22. Change Management Process
{How plan changes will be managed}

---

## APPENDICES
### A. Deliverable Register (all deliverables with owners, dates, status)
### B. RACI Matrix (detailed)
### C. Interdependency Matrix
### D. Resource Loading Charts
### E. Detailed WBS
```

## Methodology & Standards

- **360-Degree Coverage:** Every management area in the OR Strategy has a corresponding detailed plan section. No gaps.
- **Deliverable-Driven:** Each plan section defines specific deliverables with owners, dates, and acceptance criteria. Activities serve deliverables, not the other way around.
- **Dependency-Aware:** Every plan section identifies inputs from other areas and outputs to other areas. The Interdependency Register is the integration mechanism.
- **Resource-Validated:** Resource requirements are summed across all areas and validated against availability. Overloads are resolved before plan approval.
- **Budget-Refined:** Budget is refined from +/- 30% (Strategy) to +/- 15% (Plan) based on detailed activity planning.

## Step-by-Step Execution

### Step 1: Initiate Plan Development
1. Load approved OR Strategy
2. Confirm scope: which management areas are included
3. Assign plan section development to specialist agents via orchestrator
4. Set timeline for plan delivery (typically 3-4 months for full plan)
5. Schedule integration workshops

### Step 2: Develop Area Plans (Parallel)
1. Each specialist agent develops their management area section:
   - Agent-Operations -> Sections 7.1-7.6
   - Agent-Maintenance -> Sections 8.1-8.8
   - Agent-HSE -> Sections 9.1-9.7
   - Agent-HR -> Sections 10.1-10.6
   - Agent-Finance -> Section 11
   - Agent-Legal -> Section 12
   - Agent-Procurement -> Section 13
   - Agent-Project -> Section 14
   - Agent-Communications -> Section 15
   - Agent-Doc-Control -> Section 16
2. Each section must follow the standard structure:
   - Scope, deliverables, activities, dependencies, resources, timeline, acceptance criteria

### Step 3: Identify Interdependencies
1. Each agent identifies:
   - What inputs they need from other agents (and when)
   - What outputs they provide to other agents (and when)
2. Compile into Interdependency Register
3. Resolve timing conflicts (if agent A needs input from agent B, but B delivers later)
4. Create sequenced dependency chain

### Step 4: Integrate Resources
1. Compile resource requirements from all agents
2. Create month-by-month resource loading chart
3. Identify overloads and conflicts
4. Resolve: adjust timing, add resources, or revise scope
5. Validate total resource cost against budget

### Step 5: Refine Budget
1. Compile cost estimates from all agents
2. Validate against budget envelope from Strategy
3. If over budget: prioritize and adjust
4. If under budget: confirm contingency allocation
5. Present budget at +/- 15% accuracy

### Step 6: Integrate and Synthesize
1. Orchestrator collects all agent contributions
2. Ensure consistency in terminology, formatting, and cross-references
3. Build Plan Overview (Part A) from synthesized agent inputs
4. Build Integration section (Part C) from consolidated data
5. Produce complete OR Plan 360 document

### Step 7: Review and Approve
1. Internal review with OR team
2. Cross-workstream review (each agent reviews adjacent areas)
3. Stakeholder review
4. Incorporate feedback
5. Submit for Gate G2 approval

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Area Coverage | Management areas with detailed plans | 100% |
| Deliverable Definition | Deliverables with owner, date, criteria | 100% |
| Dependency Mapping | Cross-area dependencies identified | > 95% |
| Resource Validation | Resource requirements reconciled | 100% |
| Budget Accuracy | Within +/- 15% of final actual | Yes |
| Integration Quality | No conflicts between area plans | 0 conflicts |
| Stakeholder Buy-In | Stakeholders concur with plan | > 80% |
| Gate G2 Approval | Approved without major revision | First submission |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Coordinates | Orchestrator manages plan development process |
| `create-or-strategy` | Upstream | Strategy document is input to plan |
| All specialist agents | Contributors | Each agent contributes their management area |
| `agent-or-pmo` | Governance | PMO validates governance and gate alignment |
| `agent-project` | Integration | Project agent provides schedule integration |
| `agent-finance` | Validation | Finance validates budget and resource costs |
| `generate-or-report` | Downstream | Plan data feeds into OR reporting |

## Templates & References

**Deliverable Register Template:**
```
| ID | Deliverable | Area | Owner | Start | Due | Gate | Status | Acceptance Criteria |
|----|-------------|------|-------|-------|-----|------|--------|-------------------|
| D-001 | Operating Model | Operations | Agent-Ops | 2025-07 | 2025-10 | G2 | In Progress | Approved by Ops Mgr |
| D-002 | Asset Register | Maintenance | Agent-Maint | 2025-07 | 2025-09 | G2 | In Progress | 98% P&ID coverage |
```

**Interdependency Register Template:**
```
| ID | From Area | To Area | Description | Required By | Impact if Late |
|----|-----------|---------|-------------|-------------|----------------|
| DEP-001 | Operations | HR | Headcount requirements | 2025-08-01 | Delays recruitment |
| DEP-002 | Maintenance | Procurement | Spare parts specs | 2025-09-01 | Delays ordering |
| DEP-003 | HSE | Operations | SOP safety review | 2025-11-01 | Delays SOP approval |
```

## Examples

**Example 1: OR Plan 360 Generation**
```
Command: create-or-plan generate --project "Lithium Plant" --strategy "LIT-PMO-STR-001-Rev0.md"

Process:
  1. Load OR Strategy: 10 management areas in scope, G2 target Dec 2025
  2. Assign sections to 10 agents in parallel
  3. Collect agent contributions over 8 weeks:
     - Operations: 6 deliverables, 45 activities, 3 dependencies
     - Maintenance: 7 deliverables, 60 activities, 5 dependencies
     - HSE: 7 deliverables, 40 activities, 4 dependencies
     - HR: 5 deliverables, 35 activities, 6 dependencies
     - (... all 10 areas)
  4. Total: 52 deliverables, 350+ activities, 45 interdependencies
  5. Integration:
     - 3 resource conflicts resolved (HSE + Operations compete for same SMEs)
     - 2 timeline conflicts resolved (Maintenance needs vendor data before RCM)
     - Budget refined to $44M (+/- 15%)
  6. Plan synthesized: 85 pages + 5 appendices

Output: OR Plan 360 complete with 52 deliverables across 10 areas.
  Resource peak: 22 FTE in months 6-9.
  Budget: $44M refined.
  Ready for Gate G2 review.
```
