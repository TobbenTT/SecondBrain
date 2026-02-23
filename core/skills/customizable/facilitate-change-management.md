# DT-04: Facilitate Change Management

## 1. Purpose

Develop and execute comprehensive change management plans for digital transformation initiatives, addressing the stark reality that only 34% of change initiatives succeed (Gartner, 2023). This skill provides a structured, evidence-based approach to managing the human side of technology adoption in industrial environments, where resistance to change can render even the most technically sound solutions ineffective.

The skill integrates proven change management methodologies (Prosci ADKAR, Kotter, Lewin) with industrial-specific considerations: shift-based workforces, OT/IT cultural divides, safety-critical environments, union dynamics, and multi-site rollouts. It produces actionable change plans with measurable adoption targets, stakeholder engagement strategies, communication campaigns, and resistance management protocols.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | DT-04                                                                                       |
| **Agent**              | Agent 11 -- Digital Transformation Orchestrator                                              |
| **Domain**             | Digital Transformation / Organizational Change Management                                    |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | 5--10 business days (plan development); ongoing (execution support)                          |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | G-06: Only 34% of change initiatives succeed (Gartner, 2023)                               |
| **Secondary Pain**     | M-01: 70% DT failure, primarily attributed to people/culture factors (McKinsey, 2023)       |
| **Value Created**      | Structured change management increases initiative success rate by 6x (Prosci, 2023)         |

### Functional Intent

This skill SHALL:
- Assess change impact and organizational readiness for specific digital initiatives
- Identify and analyze all stakeholder groups with influence/impact mapping
- Develop ADKAR-based change plans with measurable milestones
- Design multi-channel communication campaigns tailored to industrial audiences
- Create training and competency development programs for new digital tools
- Establish resistance identification and management protocols
- Monitor adoption metrics and recommend corrective actions
- Support multi-site and phased rollout strategies

---

## 3. Trigger / Invocation

### Direct Invocation

```
/facilitate-change-management --initiative [initiative-id] --scope [site|multi-site|organization] --phase [planning|execution|sustainment]
```

### Contextual Triggers

- DT-02 roadmap initiative enters implementation phase
- New technology deployment is approved
- Adoption metrics fall below threshold (< 60% target usage)
- Stakeholder resistance signals detected (survey scores, participation rates)
- Post-deployment assessment reveals low user adoption
- Organizational restructuring accompanies digital initiative

---

## 4. Input Requirements

### Required Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `initiative_definition`      | Object        | DT-02 / mcp-sharepoint     | Initiative scope, technology, timeline, affected processes       |
| `affected_stakeholders`      | Array[Object] | mcp-teams / mcp-sharepoint | All groups impacted by the change with roles and locations       |
| `current_state_description`  | Object        | mcp-sharepoint             | Current processes, tools, behaviors being changed                |
| `desired_future_state`       | Object        | mcp-sharepoint             | Target processes, tools, behaviors after change                  |
| `executive_sponsor`          | Object        | Manual                     | Identified executive sponsor with commitment level               |

### Optional Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `maturity_assessment`        | Object        | DT-01 output               | People & Culture dimension scores                                |
| `previous_change_history`    | Array[Object] | mcp-sharepoint             | Recent change initiatives and their outcomes                     |
| `union_agreements`           | Object        | mcp-sharepoint             | Labor agreements affecting technology adoption                   |
| `cultural_factors`           | Object        | Manual                     | Organization-specific cultural characteristics                   |
| `training_infrastructure`    | Object        | mcp-sharepoint             | Available training delivery methods and capacity                 |

---

## 5. Output Specification

### Primary Outputs

| Output                          | Format       | Destination              | Description                                                   |
|---------------------------------|--------------|--------------------------|---------------------------------------------------------------|
| `change_management_plan`        | PDF + JSON   | mcp-sharepoint           | Comprehensive change plan with all components                  |
| `stakeholder_analysis`          | XLSX + JSON  | mcp-sharepoint           | Stakeholder mapping with engagement strategies                 |
| `communication_plan`            | XLSX + Calendar | mcp-outlook / mcp-teams | Scheduled communications across all channels                 |
| `training_program`              | PDF + Schedule | mcp-sharepoint / mcp-teams | Training curriculum, schedule, and materials plan            |
| `adoption_dashboard`            | Dashboard    | mcp-powerbi              | Real-time adoption metrics and engagement tracking             |
| `resistance_management_log`     | XLSX         | mcp-sharepoint           | Identified resistance with mitigation actions                  |

### Output Schema: Change Management Plan

```json
{
  "plan_id": "DT04-2025-001",
  "initiative": "Predictive Maintenance System -- Crusher Fleet",
  "initiative_id": "INI-003",
  "change_scope": {
    "sites_affected": 2,
    "people_affected": 145,
    "processes_changed": 6,
    "roles_impacted": ["Maintenance Planner", "Reliability Engineer", "Maintenance Technician", "Operations Supervisor"]
  },
  "change_impact_assessment": {
    "overall_impact": "high",
    "technical_complexity": "medium",
    "cultural_shift_required": "high",
    "timeline_pressure": "medium",
    "risk_level": "high"
  },
  "adkar_plan": {
    "awareness": {
      "target_date": "2025-04-15",
      "activities": [],
      "success_metric": "85% awareness survey score"
    },
    "desire": {
      "target_date": "2025-05-15",
      "activities": [],
      "success_metric": "70% express willingness to adopt"
    },
    "knowledge": {
      "target_date": "2025-07-01",
      "activities": [],
      "success_metric": "90% complete training, 80% pass assessment"
    },
    "ability": {
      "target_date": "2025-08-15",
      "activities": [],
      "success_metric": "75% demonstrate proficiency in supervised use"
    },
    "reinforcement": {
      "target_date": "2025-12-31",
      "activities": [],
      "success_metric": "85% sustained daily usage after 90 days"
    }
  },
  "stakeholder_groups": [],
  "communication_plan": {},
  "training_plan": {},
  "resistance_mitigation": {},
  "adoption_targets": {
    "month_1": 40,
    "month_3": 70,
    "month_6": 85,
    "month_12": 95
  }
}
```

---

## 6. Methodology & Standards

### Theoretical Foundation

- **Prosci ADKAR Model** -- Individual change framework: Awareness, Desire, Knowledge, Ability, Reinforcement
- **Kotter's 8-Step Change Model** -- Organizational change acceleration
- **Lewin's Change Model** -- Unfreeze-Change-Refreeze for behavioral anchoring
- **Bridges' Transition Model** -- Managing psychological transitions (Ending, Neutral Zone, New Beginning)
- **Satir Change Model** -- Predicting performance dip during change adoption
- **Diffusion of Innovation** (Rogers) -- Adoption curve targeting (Innovators, Early Adopters, Majority, Laggards)

### Industry Statistics

| Statistic                                                           | Source                    | Year |
|---------------------------------------------------------------------|---------------------------|------|
| Only 34% of change initiatives succeed                               | Gartner                   | 2023 |
| Projects with excellent change management: 7x more likely to succeed | Prosci Best Practices     | 2023 |
| 70% of DT failures attributed to people/culture, not technology      | McKinsey                  | 2023 |
| Employee resistance is #1 obstacle to change (cited by 76% of leaders)| Prosci                   | 2023 |
| Structured change management delivers 143% ROI vs. none              | Prosci                    | 2023 |
| 62% of industrial workers fear job loss from automation               | Deloitte                  | 2024 |
| Training adequacy correlates with 89% higher adoption rates           | Brandon Hall Group        | 2023 |
| Active executive sponsorship increases success by 72%                 | Prosci                    | 2023 |
| Multi-site rollouts without local change champions: 45% failure rate  | McKinsey                  | 2023 |

### Change Impact Assessment Matrix

| Factor                  | Low (1)                          | Medium (3)                        | High (5)                          |
|-------------------------|----------------------------------|-----------------------------------|-----------------------------------|
| People Affected         | < 50                             | 50--200                           | > 200                             |
| Process Change Depth    | Minor adjustments                | Significant workflow changes       | Fundamental process redesign       |
| Technology Complexity   | Familiar interface/tools         | New tools, moderate learning       | Entirely new technology paradigm   |
| Cultural Shift          | Consistent with current culture  | Moderate behavior change needed    | Contradicts existing norms         |
| Timeline Pressure       | > 12 months                      | 6--12 months                       | < 6 months                         |
| Previous Change Fatigue | Low (< 2 recent changes)        | Moderate (2--4 recent changes)     | High (> 4 recent changes)          |

### Stakeholder Analysis Framework

```
Power/Influence
     High  |  Monitor      |  Manage Closely  |
           |  (Keep        |  (Key Players)    |
           |   Informed)   |                   |
     Low   |  Minimal      |  Keep Satisfied   |
           |  Effort       |  (Supporters)     |
           +---------------+-------------------+
              Low                High
                    Interest/Impact
```

Categories:
- **Champions**: High influence, high interest, positive disposition -- leverage as advocates
- **Sponsors**: High influence, high interest -- critical for visible leadership support
- **Resistors**: Any influence level, negative disposition -- require targeted intervention
- **Fence-sitters**: Moderate influence, undecided -- priority for Desire-building activities
- **Silent Majority**: Low influence, low awareness -- require Awareness campaign reach

---

## 7. Step-by-Step Execution

### Phase 1: Change Impact Assessment (Day 1--3)

**Step 1.1: Change Characterization**
```
ACTION: Define the nature and scope of the change
INPUTS: initiative_definition, current_state_description, desired_future_state
PROCESS:
  1. Document what is changing:
     - Processes (which workflows, how many steps, what frequency)
     - Technology (which systems, interfaces, data flows)
     - Roles (which responsibilities shift, new skills required)
     - Reporting/metrics (what gets measured differently)
     - Organization structure (if applicable)
  2. Score change impact on 6-factor matrix (People, Process, Technology, Culture, Timeline, Fatigue)
  3. Calculate composite Change Impact Score (1--5)
  4. Determine change management resource level required:
     - Score 1--2: Light touch (embedded in project)
     - Score 3: Moderate (dedicated part-time CM resource)
     - Score 4--5: Heavy (dedicated full-time CM team)
OUTPUT: Change characterization document, impact score
MCP: mcp-sharepoint (initiative documentation)
```

**Step 1.2: Stakeholder Analysis**
```
ACTION: Map all stakeholders and their change disposition
INPUTS: affected_stakeholders, organizational context
PROCESS:
  1. Identify all stakeholder groups (minimum categories):
     - Executive leadership
     - Middle management / supervisors
     - Technical specialists (IT, OT, engineering)
     - Front-line workers / operators
     - Union representatives
     - External partners/vendors
     - Customers (if affected)
  2. For each group, assess:
     - Influence level (1--5)
     - Impact level (1--5)
     - Current disposition (Champion/Supporter/Neutral/Skeptic/Resistor)
     - Key concerns and motivations
     - Preferred communication channels
     - Historical change response patterns
  3. Plot on Power/Interest grid
  4. Identify key individuals within each group
  5. Design engagement strategy per group
OUTPUT: Stakeholder analysis matrix, engagement strategy
MCP: mcp-teams (stakeholder identification), mcp-sharepoint (analysis storage)
```

**Step 1.3: Organizational Readiness Assessment**
```
ACTION: Evaluate organizational readiness for this specific change
INPUTS: maturity_assessment (DT-01 People & Culture), previous_change_history
PROCESS:
  1. Assess readiness dimensions:
     - Sponsor readiness: Is executive sponsor active and visible?
     - Leadership readiness: Are middle managers equipped to lead change?
     - Workforce readiness: Digital literacy levels, change fatigue
     - Infrastructure readiness: Training capacity, communication channels
     - Cultural readiness: Openness to experimentation, trust levels
  2. Review lessons from previous change initiatives
  3. Identify readiness gaps requiring pre-change intervention
  4. Calculate overall readiness score (1--5)
OUTPUT: Readiness assessment, pre-change intervention list
MCP: mcp-forms (readiness survey), mcp-sharepoint (historical data)
```

### Phase 2: Change Plan Development (Day 3--7)

**Step 2.1: ADKAR Plan Design**
```
ACTION: Design activities for each ADKAR element
INPUTS: Change characterization, stakeholder analysis, readiness assessment
PROCESS:
  AWARENESS (Why is this change happening?):
  1. Craft key messages: business case, urgency, consequences of inaction
  2. Design awareness campaign:
     - Town halls with executive sponsor (all shifts)
     - Team briefings by supervisors
     - Intranet/digital signage content
     - FAQ document addressing top concerns
  3. Set awareness target: 85% can articulate why the change is happening

  DESIRE (I want to participate and support):
  4. Identify WIIFM (What's In It For Me) for each stakeholder group
  5. Engage early adopters and champions
  6. Address fears directly (job security, skill obsolescence, workload)
  7. Create peer advocacy program
  8. Set desire target: 70% express willingness to participate

  KNOWLEDGE (I know how):
  9. Design training curriculum (role-based):
     - E-learning modules for foundational concepts
     - Hands-on workshops for tool-specific skills
     - Simulation/sandbox environments for practice
     - Job aids and quick reference guides
  10. Plan training delivery across shifts and sites
  11. Set knowledge target: 90% complete training, 80% pass assessment

  ABILITY (I can do it):
  12. Design supervised practice period
  13. Establish buddy/mentor system
  14. Create support mechanisms (help desk, floor support)
  15. Plan go-live support with extra staffing
  16. Set ability target: 75% demonstrate proficiency within 4 weeks

  REINFORCEMENT (I will continue):
  17. Design recognition program for adoption
  18. Plan celebration of milestones and quick wins
  19. Establish ongoing feedback mechanisms
  20. Create performance metrics tied to new ways of working
  21. Set reinforcement target: 85% sustained usage after 90 days

OUTPUT: Complete ADKAR plan with activities, owners, dates, metrics
MCP: mcp-sharepoint (plan document), mcp-teams (activity scheduling)
```

**Step 2.2: Communication Plan Design**
```
ACTION: Create multi-channel communication plan
INPUTS: ADKAR plan, stakeholder analysis
PROCESS:
  1. Define communication objectives by ADKAR phase
  2. Design messages for each stakeholder group:
     - Executive messaging: Strategic value, competitive advantage
     - Management messaging: Team impact, support resources, expectations
     - Worker messaging: Personal benefit, job security, skill development
     - Union messaging: Consultation, worker protection, upskilling commitment
  3. Select channels by audience:
     - Shift workers: Pre-shift toolbox talks, digital signage, mobile app
     - Office workers: Email, Teams channels, intranet
     - Management: Briefing documents, leadership forums
     - All: Town halls, video messages from sponsor
  4. Create communication calendar with cadence:
     - Pre-launch: Weekly communications
     - Launch phase: Daily updates
     - Post-launch: Weekly then bi-weekly
  5. Design feedback collection mechanisms
  6. Assign communication owners for each channel
OUTPUT: Communication plan with calendar, message templates, channel map
MCP: mcp-outlook (email scheduling), mcp-teams (channel creation), mcp-sharepoint (content storage)
```

**Step 2.3: Training Program Design**
```
ACTION: Develop role-based training curriculum
INPUTS: desired_future_state, affected_stakeholders, training_infrastructure
PROCESS:
  1. Conduct training needs analysis by role:
     - Map current skills to required skills
     - Identify skill gaps per role
     - Determine training depth (awareness/competence/mastery)
  2. Design training curriculum:
     - Module 1: Context and purpose (all roles, 30 min)
     - Module 2: System navigation and basics (all users, 2 hours)
     - Module 3: Role-specific workflows (by role, 2--4 hours)
     - Module 4: Advanced features (power users, 4 hours)
     - Module 5: Troubleshooting and support (support team, 8 hours)
  3. Select delivery methods:
     - E-learning (self-paced foundation)
     - Instructor-led workshops (hands-on skills)
     - On-the-job coaching (application support)
     - Simulation environment (safe practice)
  4. Schedule training across shifts (3-shift operations require 3x sessions)
  5. Design assessment/certification process
  6. Create job aids and quick reference cards
OUTPUT: Training curriculum, schedule, materials plan, assessment criteria
MCP: mcp-teams (training sessions), mcp-sharepoint (materials), mcp-forms (assessments)
```

### Phase 3: Execution & Monitoring (Ongoing)

**Step 3.1: Change Network Activation**
```
ACTION: Establish and activate change agent network
INPUTS: stakeholder_analysis (identified champions)
PROCESS:
  1. Recruit change champions (1 per 25--30 affected workers)
  2. Train change champions:
     - Change management fundamentals
     - Key messages and talking points
     - Resistance identification and escalation
     - Feedback collection and reporting
  3. Establish regular champion check-in cadence (weekly during transition)
  4. Provide champions with toolkits and support materials
  5. Recognize and reward champion contributions
OUTPUT: Active change network with defined responsibilities
MCP: mcp-teams (champion channel), mcp-sharepoint (toolkit)
```

**Step 3.2: Adoption Monitoring & Intervention**
```
ACTION: Track adoption metrics and intervene when needed
INPUTS: adoption_targets, system usage data, survey responses
PROCESS:
  1. Monitor leading indicators:
     - System login frequency and duration
     - Feature usage rates by role
     - Training completion and assessment scores
     - Help desk ticket volume and themes
     - Champion-reported concerns
  2. Monitor lagging indicators:
     - ADKAR survey scores (monthly pulse)
     - Process compliance rates
     - Performance metrics (old vs. new way)
     - Employee satisfaction scores
  3. Weekly adoption review:
     - Compare actuals to targets
     - Identify at-risk groups or sites
     - Trigger interventions for groups below threshold
  4. Intervention protocols:
     - Below 60%: Additional training sessions, increased floor support
     - Below 40%: Root cause analysis, sponsor intervention, process adjustment
     - Below 20%: Escalation to steering committee, potential pause and reset
OUTPUT: Adoption dashboard (real-time), weekly adoption report, intervention actions
MCP: mcp-powerbi (adoption dashboard), mcp-forms (pulse surveys), mcp-teams (intervention coordination)
```

**Step 3.3: Resistance Management**
```
ACTION: Proactively identify and manage resistance
INPUTS: stakeholder_analysis, adoption_monitoring data, champion feedback
PROCESS:
  1. Classify resistance types:
     - Informational: "I don't understand" -> More communication/training
     - Emotional: "I'm afraid" -> Address fears, provide safety net
     - Values-based: "This is wrong" -> Engage in dialogue, find alignment
     - Political: "This threatens me" -> Negotiate, restructure incentives
     - Behavioral: "I won't change" -> Coaching, accountability, consequences
  2. For each resistance pocket:
     a. Diagnose root cause (1-on-1 conversations, anonymous survey)
     b. Design targeted intervention
     c. Assign intervention owner
     d. Set resolution timeline
     e. Track progress
  3. Escalation path:
     - Level 1: Change champion handles locally
     - Level 2: Manager coaching and support
     - Level 3: Change management team intervention
     - Level 4: Executive sponsor engagement
  4. Document lessons for future initiatives
OUTPUT: Resistance log with interventions, resolution tracking
MCP: mcp-sharepoint (resistance log), mcp-teams (escalation communication)
```

---

## 8. Quality Criteria

| Metric                              | Target         | Measurement                                          |
|--------------------------------------|----------------|------------------------------------------------------|
| Stakeholder Coverage                 | 100% affected groups analyzed | Stakeholder map completeness audit        |
| ADKAR Awareness Score                | >= 85%         | Awareness survey at 30 days                          |
| Training Completion Rate             | >= 90%         | LMS tracking                                          |
| Training Assessment Pass Rate        | >= 80%         | Assessment results                                    |
| Adoption Rate (Month 3)             | >= 70%         | System usage analytics                                |
| Adoption Rate (Month 6)             | >= 85%         | System usage analytics                                |
| Sustained Adoption (Month 12)       | >= 90%         | System usage analytics                                |
| Resistance Resolution Rate           | >= 75% within 30 days | Resistance log tracking                        |
| Sponsor Visibility                   | >= 1 visible action per month | Communication tracking                  |
| Communication Reach                  | >= 90% of affected population | Channel analytics                       |

---

## 9. Inter-Agent Dependencies

| Agent       | Direction  | Skill/Data                | Purpose                                              |
|-------------|-----------|---------------------------|------------------------------------------------------|
| Agent 11    | Upstream  | DT-01 (Assessment)         | People & Culture maturity scores, readiness data      |
| Agent 11    | Upstream  | DT-02 (Roadmap)            | Initiative scope, timeline, affected stakeholders     |
| Agent 12    | Upstream  | KM-02 (Knowledge Delivery) | Training content and knowledge base integration       |
| Agent 12    | Downstream| KM-01 (Knowledge Capture)  | Lessons learned from change management execution      |
| Agent 10    | Downstream| PERF-01 (KPIs)             | Adoption metrics feeding into operational KPIs        |

---

## 10. MCP Integrations

### mcp-teams
```yaml
purpose: "Change network coordination, training delivery, communication channels"
operations:
  - action: "create"
    resource: "channel"
    name: "Change-Champions-{initiative}"
  - action: "create"
    resource: "meeting"
    type: "town_hall"
    recurring: true
  - action: "send"
    resource: "adaptive_card"
    template: "DT04_ChangeUpdate"
```

### mcp-forms
```yaml
purpose: "ADKAR surveys, readiness assessments, feedback collection"
operations:
  - action: "create"
    resource: "survey"
    template: "DT04_ADKAR_Pulse"
  - action: "create"
    resource: "survey"
    template: "DT04_Readiness_Assessment"
  - action: "read"
    resource: "responses"
    aggregation: "anonymous"
```

### mcp-outlook
```yaml
purpose: "Communication campaign delivery, stakeholder scheduling"
operations:
  - action: "send"
    resource: "campaign_email"
    template: "DT04_ChangeComms_{phase}"
  - action: "schedule"
    resource: "meeting"
    type: "sponsor_briefing"
```

### mcp-sharepoint
```yaml
purpose: "Change plan storage, training materials, resistance log"
operations:
  - action: "write"
    resource: "change_plan"
    path: "/Change-Management/{initiative}/"
  - action: "write"
    resource: "training_materials"
    path: "/Change-Management/{initiative}/Training/"
  - action: "readwrite"
    resource: "resistance_log"
    path: "/Change-Management/{initiative}/Resistance/"
```

---

## 11. Templates & References

### ADKAR Assessment Survey Template

```
For each statement, rate your agreement (1=Strongly Disagree, 5=Strongly Agree):

AWARENESS:
1. I understand why this change is happening
2. I understand the risks of not making this change
3. I can explain the business reasons to a colleague

DESIRE:
4. I want to participate in this change
5. I believe this change will benefit me personally
6. I am motivated to learn the new way of working

KNOWLEDGE:
7. I know what I need to do differently
8. I have received adequate training
9. I know where to get help when I need it

ABILITY:
10. I can perform my work using the new system/process
11. I feel confident in my ability to work the new way
12. I can troubleshoot common issues independently

REINFORCEMENT:
13. I am recognized when I use the new system/process
14. My supervisor supports and encourages the new way
15. The new way of working is now my default approach
```

### Communication Message Framework

| Audience        | Key Message                                | Channel           | Frequency     |
|-----------------|--------------------------------------------|--------------------|---------------|
| Executive       | Strategic value, competitive positioning   | Steering report    | Monthly       |
| Middle Managers | Team impact, how to support, expectations  | Manager briefing   | Bi-weekly     |
| Shift Workers   | Personal benefit, job security, training   | Toolbox talk       | Weekly        |
| IT/OT Staff     | Technical architecture, support roles      | Technical brief    | As needed     |
| Union Reps      | Worker protection, upskilling, consultation| Dedicated meetings | Monthly       |

---

## 12. Examples

### Example 1: Predictive Maintenance System Rollout

**Context**: Rolling out ML-based predictive maintenance to 145 maintenance and operations staff across 2 mine sites.

**Invocation**:
```
/facilitate-change-management --initiative "INI-003-PdM-Crushers" --scope multi-site --phase planning
```

**Key Outputs**:
- **Impact Score**: 4.2/5 (High) -- new technology, significant process change, safety-critical environment
- **Stakeholder Groups**: 6 groups identified, 12 champions recruited
- **Key Resistance Risk**: Maintenance technicians fear job reduction (addressed with reskilling commitment and "technology augments, not replaces" messaging)
- **Training Plan**: 3-tier curriculum, 480 training-hours across 2 sites, 3 shifts each
- **Adoption Targets**: M1: 40%, M3: 70%, M6: 85%, M12: 95%
- **Budget**: $120K for change management activities

**Outcome**: Achieved 78% adoption at Month 3 (vs. 70% target) and 91% at Month 6, driven by strong champion network and visible executive support.

### Example 2: Digital Work Permit System

**Context**: Replacing paper-based work permit system with digital platform for 500+ field workers.

**Invocation**:
```
/facilitate-change-management --initiative "INI-007-Digital-Permits" --scope organization --phase planning
```

**Key Outputs**:
- **Impact Score**: 3.8/5 (High) -- touches safety-critical process, affects all field workers
- **Critical Success Factor**: Union engagement from day 1 (negotiated digital literacy training as part of adoption)
- **Special Consideration**: Multi-language support needed (Spanish primary, some Quechua speakers)
- **Risk**: Low digital literacy among 35% of field workforce -- addressed with extended peer-buddy program
- **Adoption Strategy**: Phased by area (pilot area first, then rolling expansion)
