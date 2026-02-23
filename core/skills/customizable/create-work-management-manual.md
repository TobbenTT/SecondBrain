# Create Work Management Manual

> **Skill ID:** AM-WM-01
> **Version:** 1.0.0
> **Category:** D. Technical Deliverables
> **Priority:** High
> **Last Updated:** 2026-02-17
> **Owner Agent:** Agent-Maintenance / Agent-Operations

---

## 1. Purpose

This skill generates a complete **Work Management Manual** for a mining operation, establishing the end-to-end process by which maintenance work is identified, planned, scheduled, executed, completed, and analyzed. The manual serves as the single authoritative reference for how maintenance work flows through the organization from the moment a need is recognized to the moment value is captured through performance analysis.

Work management is the operational backbone of asset management. While a Maintenance Strategy defines WHAT to do and WHEN, the Work Management Manual defines HOW work moves through the system every day. It bridges the gap between strategy documents and the daily reality of wrench-turning, ensuring that the right work is done at the right time by the right people with the right parts and the right safety controls.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                          |
|------------------------|------------------------------------------------------------------------------------------------|
| **Deliverable**        | Work Management Manual (80-150 pages typical)                                                  |
| **Format**             | Structured document with process maps, RACI matrices, KPI tables, and template appendices      |
| **Audience**           | Maintenance Managers, Planners, Schedulers, Supervisors, Reliability Engineers, Operations      |
| **Compliance**         | ISO 55000:2014 (Clauses 8, 9, 10), SMRP Best Practices, DS 132 (Chile), SERNAGEOMIN standards |
| **Integration**        | VSC Failure Modes Table linkage: each failure mode's maintenance strategy maps to a work management process step |
| **Language**           | English (with Chilean regulatory references in Spanish where required)                          |
| **Maturity Target**    | Supports organizations from Level 2 (Developing) to Level 4 (Optimizing) on the VSC AM Maturity Model |

### Core Design Principle

Every failure mode in the VSC Failure Modes Table has an assigned maintenance strategy (PM, CBM, PdM, CM, FF, RTF). This manual defines precisely HOW each strategy executes in daily operations: how the work order is created, who plans it, how materials are staged, who approves the schedule, how quality is verified, and how the outcome feeds back into reliability improvement.

---

## 3. Trigger / Invocation

This skill is invoked when:

- A greenfield or brownfield mining project requires a Work Management Manual as part of Operational Readiness
- An existing operation is undergoing a maintenance transformation or improvement program
- A maintenance maturity assessment has identified work management process gaps
- A CMMS/EAM implementation (SAP PM, Maximo, Pronto) requires business process documentation
- The VSC OR deliverable tracker flags AM-WM-01 as pending or in-progress
- The user explicitly requests: `create-work-management-manual`

**Example invocations:**

```
/create-work-management-manual --site "Cerro Verde" --capacity "120,000 TPD" --cmms "SAP PM"
/create-work-management-manual --scope "concentrator" --criticality-model "VSC-4tier"
/create-work-management-manual --mode "backlog-recovery" --current-backlog-weeks 12
```

---

## 4. Input Requirements

| # | Input                          | Required | Source                        | Description                                                                 |
|---|--------------------------------|----------|-------------------------------|-----------------------------------------------------------------------------|
| 1 | Site/Operation Name            | Yes      | User / Project Context        | Name and location of the mining operation                                    |
| 2 | Processing Capacity            | Yes      | User / Design Docs            | Nameplate throughput (TPD, MTPA) and commodity                               |
| 3 | Equipment Criticality Model    | Yes      | analyze-equipment-criticality | Criticality rankings (AA/A/B/C) for all maintainable assets                  |
| 4 | VSC Failure Modes Table        | Yes      | analyze-failure-patterns      | Failure modes with assigned maintenance strategies per asset class            |
| 5 | CMMS Platform                  | Yes      | User / IT Context             | SAP PM, Maximo, Pronto, Infor EAM, or other                                 |
| 6 | Organizational Structure       | Recommended | create-org-design          | Maintenance org chart, reporting lines, shift patterns                        |
| 7 | Existing Procedures            | Recommended | Document Repository        | Current SOPs, work instructions, planning standards                          |
| 8 | Maintenance KPI Baseline       | Recommended | benchmark-maintenance-kpis | Current state KPIs for gap identification                                    |
| 9 | Regulatory Requirements        | Recommended | map-regulatory-requirements| DS 132, SERNAGEOMIN, site-specific permits                                   |
| 10| Spare Parts Strategy           | Optional | create-spare-parts-strategy   | MRO inventory policy, min/max levels, lead times                             |
| 11| Shutdown/Turnaround Calendar   | Optional | plan-turnaround               | Major shutdown windows affecting scheduling                                  |
| 12| AM Maturity Assessment         | Optional | assess-am-maturity            | Current maturity level to calibrate manual complexity                         |

---

## 5. Output Specification

```yaml
deliverable:
  id: "AM-WM-01"
  title: "Work Management Manual"
  version: "1.0.0"
  format: "docx + pdf"
  language: "en"
  classification: "Confidential - Client"

structure:
  sections:
    - id: "1"
      title: "Introduction & Scope"
      content:
        - purpose_and_objectives
        - scope_boundaries
        - definitions_and_abbreviations
        - document_governance
        - referenced_standards

    - id: "2"
      title: "Maintenance Philosophy"
      content:
        - asset_management_policy_alignment
        - maintenance_strategy_hierarchy
        - reactive_vs_preventive_vs_predictive_vs_cbm
        - iso_55000_clause_8_alignment
        - continuous_improvement_commitment

    - id: "3"
      title: "Maintenance Strategy Mix"
      content:
        - strategy_definitions:
            - PM: "Preventive Maintenance - time/usage based"
            - CBM: "Condition-Based Maintenance - sensor/inspection triggered"
            - PdM: "Predictive Maintenance - analytics-driven"
            - CM: "Corrective Maintenance - planned repair of known defect"
            - FF: "Failure Finding - testing hidden function"
            - RTF: "Run to Failure - deliberate decision for non-critical"
        - criticality_strategy_matrix:
            AA_critical: "PM + CBM + PdM (zero unplanned downtime target)"
            A_important: "PM + CBM (high planned ratio)"
            B_standard: "PM + CM (standard care)"
            C_low: "RTF + CM (repair on failure acceptable)"
        - failure_modes_table_linkage

    - id: "4"
      title: "Roles & Responsibilities (RACI)"
      content:
        - role_definitions:
            - maintenance_planner
            - maintenance_scheduler
            - maintenance_supervisor
            - maintenance_technician
            - equipment_operator
            - reliability_engineer
        - raci_matrix_by_process_step
        - shift_coverage_model
        - escalation_paths

    - id: "5"
      title: "6-Step Work Management Process"
      subsections:
        - step_1_identify:
            - notification_sources
            - operator_rounds
            - condition_monitoring_alerts
            - pm_auto_generation
            - priority_classification
        - step_2_plan:
            - scope_definition
            - materials_and_parts
            - tools_and_equipment
            - labor_estimation
            - safety_requirements
            - job_plan_library
        - step_3_schedule:
            - weekly_scheduling_cycle
            - daily_scheduling
            - backlog_management
            - schedule_freeze_policy
            - coordination_with_operations
        - step_4_execute:
            - pre_job_briefing
            - permit_to_work
            - quality_checkpoints
            - supervision_requirements
        - step_5_complete:
            - work_order_closeout
            - as_found_as_left_recording
            - failure_code_entry
            - material_consumption_posting
            - technical_feedback
        - step_6_analyze:
            - kpi_review_cycle
            - bad_actor_analysis
            - repeat_failure_investigation
            - continuous_improvement_actions
            - management_of_change

    - id: "6"
      title: "Backlog Management"
      content:
        - backlog_definitions
        - ready_backlog_vs_total_backlog
        - backlog_aging_policy
        - backlog_weeks_calculation
        - backlog_reduction_strategies

    - id: "7"
      title: "Schedule Freeze Policy"
      content:
        - freeze_window_definition
        - break_in_work_criteria
        - emergency_vs_urgent_vs_routine
        - approval_authority_matrix
        - schedule_change_documentation

    - id: "8"
      title: "KPIs & Performance Measurement"
      content:
        - smrp_aligned_kpis:
            schedule_compliance: ">80-90%"
            pm_compliance: ">95%"
            corrective_ratio: "<20%"
            wrench_time: ">35%"
            backlog_weeks: "2-4 weeks"
            mtbf: "trending upward"
            mttr: "trending downward"
        - kpi_reporting_frequency
        - dashboard_design
        - management_review_cadence

    - id: "9"
      title: "ISO 55000 Alignment"
      content:
        - clause_8_operation
        - clause_9_performance_evaluation
        - clause_10_improvement
        - audit_readiness_checklist

    - id: "10"
      title: "Chilean Mining Regulatory Context"
      content:
        - ds_132_requirements
        - sernageomin_obligations
        - safety_critical_maintenance
        - regulatory_record_keeping

    - id: "11"
      title: "Appendices"
      content:
        - appendix_a_process_flow_diagrams
        - appendix_b_raci_matrix_full
        - appendix_c_job_plan_templates
        - appendix_d_kpi_calculation_formulas
        - appendix_e_failure_code_taxonomy
        - appendix_f_glossary

metadata:
  pages_estimate: "80-150"
  review_cycle: "annual"
  approval_authority: "Maintenance Manager + Operations Manager"
```

---

## 6. Methodology & Standards

### 6.1 Maintenance Philosophy Framework

The manual establishes a layered philosophy moving from reactive to proactive:

1. **Reactive Maintenance (Run-to-Failure):** Deliberate strategy for Criticality C assets where failure consequence is negligible. Not a default; a conscious decision documented in the criticality assessment.

2. **Preventive Maintenance (PM):** Time-based or usage-based interventions. Calendar-driven (e.g., every 90 days) or meter-driven (e.g., every 5,000 hours). Applied across all criticality tiers as a baseline.

3. **Condition-Based Maintenance (CBM):** Triggered by measurable condition indicators (vibration, temperature, oil analysis, ultrasound). Applied to Criticality AA and A assets where condition monitoring is economically justified.

4. **Predictive Maintenance (PdM):** Advanced analytics and machine learning applied to condition data to predict remaining useful life. Applied to Criticality AA assets and high-value rotating equipment.

5. **Failure Finding (FF):** Periodic testing of protective devices and hidden functions (pressure relief valves, emergency shutoffs, backup systems). Required by safety regulations and standards.

### 6.2 ISO 55000 Alignment

| ISO 55000 Clause | Work Management Manual Section | Requirement Addressed                                    |
|-------------------|-------------------------------|----------------------------------------------------------|
| 8.1 Operational Planning | Sections 3, 5 | Planning and control of maintenance activities             |
| 8.2 Management of Change | Section 5.6    | Process for managing changes to maintenance approach       |
| 9.1 Monitoring & Measurement | Section 8  | KPIs, performance evaluation, data collection             |
| 9.2 Internal Audit | Section 9              | Audit criteria and compliance verification                 |
| 9.3 Management Review | Section 8            | Review inputs, outputs, improvement decisions              |
| 10.1 Nonconformity | Section 5.6            | Corrective action for process deviations                   |
| 10.2 Preventive Action | Section 5.6         | Proactive improvement based on trend analysis              |
| 10.3 Continual Improvement | Section 5.6     | Systematic improvement of work management processes        |

### 6.3 SMRP Best Practice Metrics

All KPIs are aligned to SMRP (Society for Maintenance & Reliability Professionals) metric definitions:

| Metric ID | KPI                        | Formula                                                              | Target          |
|-----------|----------------------------|----------------------------------------------------------------------|-----------------|
| SMRP 5.1  | Schedule Compliance        | (Scheduled jobs completed / Scheduled jobs planned) x 100            | 80-90%          |
| SMRP 5.2  | PM Compliance              | (PMs completed on time / PMs due) x 100                             | > 95%           |
| SMRP 5.3  | Planned Work Ratio         | (Planned work orders / Total work orders) x 100                     | > 80%           |
| SMRP 5.4  | Corrective Ratio           | (Corrective WOs / Total WOs) x 100                                  | < 20%           |
| SMRP 5.5  | Wrench Time                | (Direct work time / Available shift time) x 100                     | > 35%           |
| Custom     | Backlog Weeks              | Total ready backlog hours / Weekly available labor hours             | 2-4 weeks       |
| SMRP 3.1  | MTBF                       | Total operating time / Number of failures                            | Trending up     |
| SMRP 3.2  | MTTR                       | Total repair time / Number of repairs                                | Trending down   |

### 6.4 Chilean Mining Regulatory Context

The manual incorporates requirements from:

- **DS 132 (Decreto Supremo 132):** Reglamento de Seguridad Minera. Establishes mandatory safety requirements for mining operations in Chile, including maintenance of safety-critical equipment, inspection frequencies, and record-keeping obligations.

- **SERNAGEOMIN (Servicio Nacional de Geologia y Mineria):** The regulatory authority requiring approved maintenance plans for safety-critical systems, certified personnel for specific maintenance tasks, and periodic reporting on equipment condition and integrity.

- **Regulatory record-keeping:** Maintenance records must be retained for the periods specified by DS 132, available for SERNAGEOMIN inspection, and traceable to specific assets, personnel, and dates.

### 6.5 VSC Failure Modes Table Integration

The VSC Failure Modes Table is the bridge between reliability engineering and daily work management:

```
Failure Mode (FM Table) --> Maintenance Strategy (FM Table) --> Work Management Process (This Manual)
   |                            |                                    |
   | e.g., Bearing wear         | e.g., CBM - Vibration Analysis     | e.g., Step 1: Auto-alert from
   | on SAG Mill Pinion         | every 7 days, replace at            |     vibration system
   |                            | threshold 8 mm/s                    | Step 2: Planner creates WO
   |                            |                                    | Step 3: Scheduler slots in
   |                            |                                    |     next available window
   |                            |                                    | Step 4: Technician executes
   |                            |                                    | Step 5: Records as-found/as-left
   |                            |                                    | Step 6: Reliability reviews trend
```

---

## 7. Step-by-Step Execution

### Phase 1: Context Gathering (Steps 1-3)

**Step 1 — Collect Site Context**
Gather site name, commodity, processing capacity, CMMS platform, and organizational structure. Validate that equipment criticality rankings are available (output from `analyze-equipment-criticality`).

**Step 2 — Review Failure Modes Table**
Import the VSC Failure Modes Table for the site. Map each failure mode's assigned maintenance strategy (PM/CBM/PdM/CM/FF/RTF) to the work management process steps. Identify the volume of work orders expected by strategy type.

**Step 3 — Assess Current State**
If the operation is existing (brownfield), review current KPI baselines from `benchmark-maintenance-kpis`. Identify the gap between current and target performance. If greenfield, use industry benchmarks for the commodity and scale.

### Phase 2: Philosophy & Strategy (Steps 4-6)

**Step 4 — Define Maintenance Philosophy**
Draft the maintenance philosophy section aligned to the client's asset management policy. Map the reactive-to-proactive hierarchy. Reference ISO 55000 Clause 8 requirements for operational planning and control.

**Step 5 — Build Criticality-Strategy Matrix**
Create the matrix mapping Criticality AA/A/B/C to maintenance strategy mix (PM/CBM/PdM/CM/FF/RTF). Define the decision logic for strategy selection. This matrix is the governing framework for all work order generation.

**Step 6 — Define Roles and RACI**
Document each role's responsibilities in the work management process:

| Role                  | Primary Responsibility                                          |
|-----------------------|-----------------------------------------------------------------|
| Maintenance Planner   | Job plan creation, materials identification, labor estimation    |
| Maintenance Scheduler | Weekly/daily schedule, resource leveling, backlog management     |
| Maintenance Supervisor| Crew assignment, execution oversight, quality verification       |
| Maintenance Technician| Physical execution, as-found/as-left recording, feedback         |
| Equipment Operator    | Notification creation, operator rounds, equipment release        |
| Reliability Engineer  | Failure analysis, strategy optimization, continuous improvement   |

Build the full RACI matrix across all 6 process steps.

### Phase 3: 6-Step Process Design (Steps 7-12)

**Step 7 — Design Step 1: Identify**
Document all work identification sources:
- Operator notifications (manual entry in CMMS)
- Operator rounds (structured inspection checklists)
- Condition monitoring alerts (vibration, oil, thermography, ultrasound)
- PM auto-generation (CMMS-triggered time/usage-based work orders)
- Corrective work requests (from inspections, audits, incident investigations)
- Engineering modifications and improvement projects

Define priority classification (Emergency / Urgent / High / Normal / Low) with response time targets.

**Step 8 — Design Step 2: Plan**
Define the planning process:
- Scope definition (clear task descriptions, acceptance criteria)
- Materials and parts (BOM identification, reservation in CMMS, procurement if needed)
- Tools and equipment (special tools, lifting equipment, scaffolding)
- Labor estimation (trade hours, multi-trade coordination)
- Safety requirements (PTW type, isolations, confined space, working at height)
- Job plan library (standard job plans for recurring tasks, linked to failure modes)

**Step 9 — Design Step 3: Schedule**
Define the scheduling cycle:
- **Weekly scheduling:** T-5 scheduling meeting, operations coordination, resource leveling
- **Daily scheduling:** T-1 confirmation, crew assignment, material staging verification
- **Backlog management:** Ready backlog vs. total backlog, aging rules, priority rebalancing
- **Schedule freeze policy:** Freeze window (typically T-1 or T-2), break-in criteria, approval authority

**Step 10 — Design Step 4: Execute**
Define execution standards:
- Pre-job briefing requirements (scope, hazards, isolations, quality points)
- Permit to Work (PTW) process integration
- Quality checkpoints (in-process verification, hold points, witness points)
- Supervision requirements by job complexity and risk level
- Escalation procedures for scope changes or unexpected conditions

**Step 11 — Design Step 5: Complete**
Define work order close-out requirements:
- Technical completion (all tasks done, acceptance criteria met)
- As-found / as-left condition recording (mandatory for Criticality AA/A)
- Failure code entry (failure mode, failure cause, failure mechanism from taxonomy)
- Material consumption posting (actual parts used, returns, scrap)
- Labor time recording (actual hours by trade)
- Technical feedback (observations, recommendations, photos)

**Step 12 — Design Step 6: Analyze**
Define the analysis and improvement cycle:
- **Weekly:** KPI review (schedule compliance, PM compliance, backlog)
- **Monthly:** Bad actor analysis (top 10 assets by downtime/cost), repeat failure review
- **Quarterly:** Management review (ISO 55000 Clause 9.3), strategy effectiveness assessment
- **Annually:** Full work management process audit, KPI target recalibration
- Continuous improvement actions tracked in a register with owners and due dates

### Phase 4: Supporting Processes (Steps 13-15)

**Step 13 — Define Backlog Management**
Document backlog management rules:
- **Ready backlog:** Fully planned, materials available, can be scheduled. Target: 2-4 weeks.
- **Total backlog:** All open work orders including those awaiting planning or materials.
- **Aging policy:** Work orders older than 90 days reviewed for relevance; older than 180 days escalated.
- **Backlog weeks calculation:** Total ready backlog labor hours / Weekly available labor hours.
- **Backlog reduction:** If backlog exceeds 6 weeks, trigger backlog blitz protocol (overtime, contractor surge, priority review).

**Step 14 — Define KPI Framework**
Build the KPI dashboard specification:
- Data sources (CMMS queries, manual inputs)
- Calculation formulas (aligned to SMRP definitions)
- Reporting frequency (daily/weekly/monthly)
- Visualization requirements (trend charts, gauges, Pareto charts)
- Distribution list and review meeting cadence

**Step 15 — Compile Appendices and Templates**
Assemble all supporting materials:
- Process flow diagrams (swimlane format showing role interactions)
- RACI matrix (complete, by sub-step)
- Job plan templates (by equipment class)
- KPI calculation worksheets
- Failure code taxonomy (aligned to ISO 14224 where applicable)
- Glossary of terms

### Phase 5: Review & Finalization (Steps 16-17)

**Step 16 — Quality Review**
Execute quality review against the criteria in Section 8. Verify ISO 55000 alignment, SMRP metric consistency, regulatory compliance, and Failure Modes Table traceability.

**Step 17 — Finalize and Deliver**
Produce final document in DOCX and PDF formats. Register in the VSC deliverable tracker as AM-WM-01. Notify dependent agents (Agent-Operations, Agent-Commissioning) of availability.

---

## 8. Quality Criteria

| #  | Criterion                              | Standard / Threshold                                                       | Verification Method          |
|----|----------------------------------------|----------------------------------------------------------------------------|------------------------------|
| 1  | All 6 process steps documented         | Each step has inputs, process, outputs, roles, and CMMS transactions       | Section-by-section review    |
| 2  | RACI matrix complete                   | Every process sub-step has R, A, C, I assigned to defined roles            | Matrix completeness check    |
| 3  | KPIs aligned to SMRP                   | All KPIs traceable to SMRP metric IDs with correct formulas               | Formula audit                |
| 4  | Criticality-strategy matrix present    | All 4 tiers (AA/A/B/C) mapped to maintenance strategies                   | Matrix review                |
| 5  | Failure Modes Table linkage            | At least 3 examples showing FM -> Strategy -> WM process flow              | Traceability check           |
| 6  | ISO 55000 Clauses 8, 9, 10 addressed  | Explicit reference to each sub-clause with corresponding manual section    | Cross-reference table        |
| 7  | Chilean regulatory compliance          | DS 132 and SERNAGEOMIN requirements identified and addressed               | Regulatory checklist         |
| 8  | Backlog management defined             | Ready vs. total backlog, aging policy, target weeks documented             | Section review               |
| 9  | Schedule freeze policy defined         | Freeze window, break-in criteria, approval authority specified             | Section review               |
| 10 | KPI targets set                        | Schedule Compliance >80%, PM Compliance >95%, Corrective <20%, Wrench >35% | Target validation            |
| 11 | Templates provided                     | At least 5 usable templates in appendices                                  | Template count and quality   |
| 12 | Process flow diagrams included         | Swimlane diagrams for each of the 6 steps                                 | Diagram review               |

---

## 9. Inter-Agent Dependencies

| Agent                  | Dependency Type | Description                                                                  |
|------------------------|-----------------|------------------------------------------------------------------------------|
| Agent-Maintenance      | Owner           | Primary agent responsible for generating and maintaining this deliverable     |
| Agent-Operations       | Contributor     | Provides operations interface requirements (equipment release, notifications) |
| Agent-HSE              | Contributor     | Provides PTW process, safety requirements for maintenance execution           |
| Agent-Procurement      | Input           | Provides spare parts lead times and MRO inventory policies                    |
| Agent-Project-Control  | Input           | Provides schedule constraints for greenfield commissioning windows             |
| Agent-Commissioning    | Consumer        | Uses manual to establish work management processes during commissioning        |
| Agent-HR               | Input           | Provides shift patterns, labor availability, competency frameworks            |
| Agent-Doc-Control      | Consumer        | Registers and controls the manual as a controlled document                    |
| Agent-OR-PMO           | Consumer        | Tracks AM-WM-01 status in the OR deliverable tracker                         |

---

## 10. Templates

### Template 10.1: Weekly Scheduling Meeting Agenda

```markdown
# Weekly Maintenance Scheduling Meeting
**Site:** [Site Name]
**Date:** [Date] | **Week:** [Week Number]
**Attendees:** Scheduler, Planners, Supervisors, Operations Coordinator, Reliability Engineer

## 1. Review of Last Week
- Schedule compliance: ___% (Target: >80%)
- PM compliance: ___% (Target: >95%)
- Break-in work count: ___
- Key deviations and root causes

## 2. Backlog Status
- Ready backlog: ___ hours (___ weeks)
- Total backlog: ___ hours
- Aging work orders (>90 days): ___
- Priority 1-2 work orders awaiting schedule: ___

## 3. Next Week Schedule Review
- Total planned hours: ___
- Available labor hours: ___
- Utilization target: ____%
- Operations windows confirmed: [Y/N]
- Materials staged and verified: [Y/N]

## 4. Coordination Items
- Shutdowns/outages affecting schedule: ___
- Contractor availability: ___
- Long-lead parts status: ___

## 5. Actions and Decisions
| Action | Owner | Due Date |
|--------|-------|----------|
|        |       |          |
```

### Template 10.2: Job Plan Template

```markdown
# Standard Job Plan
**Job Plan ID:** JP-[Area]-[Equip Class]-[Seq]
**Title:** [Descriptive Title]
**Equipment Class:** [e.g., Centrifugal Pump]
**Linked Failure Mode:** [FM ID from Failure Modes Table]
**Maintenance Strategy:** [PM / CBM / PdM / FF]

## Scope
[Clear description of what this job accomplishes and acceptance criteria]

## Safety Requirements
- PTW Type: [Hot Work / Cold Work / Confined Space / Height / Electrical]
- Isolations Required: [Y/N] — [Details]
- PPE: [Standard + Specific]
- Minimum Crew: [Number and trades]

## Materials (Bill of Materials)
| Item | Part Number | Description | Qty | Unit |
|------|-------------|-------------|-----|------|
| 1    |             |             |     |      |

## Tools & Equipment
| Item | Description | Availability Check |
|------|-------------|--------------------|
| 1    |             | [ ]                |

## Task Steps
| Step | Description | Trade | Est. Hours | Quality Check |
|------|-------------|-------|------------|---------------|
| 1    |             |       |            | [ ]           |

## Total Estimated Labor: ___ hours
## Estimated Duration: ___ hours (critical path)

## As-Found / As-Left Recording
| Measurement | As-Found | As-Left | Tolerance |
|-------------|----------|---------|-----------|
|             |          |         |           |

## Failure Codes (if corrective)
- Failure Mode: ___
- Failure Cause: ___
- Failure Mechanism: ___

## Technical Notes
[Lessons learned, tips, cautions, referenced documents]
```

### Template 10.3: Backlog Health Report

```markdown
# Backlog Health Report
**Site:** [Site Name] | **Period:** [Month/Year]

## Summary
| Metric                    | Value     | Target   | Status |
|---------------------------|-----------|----------|--------|
| Ready Backlog (hours)     |           |          |        |
| Ready Backlog (weeks)     |           | 2-4 wks  |        |
| Total Backlog (hours)     |           |          |        |
| Aging >90 days (count)    |           | <5%      |        |
| Aging >180 days (count)   |           | 0        |        |
| Priority 1-2 in backlog   |           | 0        |        |

## Backlog by Priority
| Priority   | Count | Hours | % of Total |
|------------|-------|-------|------------|
| Emergency  |       |       |            |
| Urgent     |       |       |            |
| High       |       |       |            |
| Normal     |       |       |            |
| Low        |       |       |            |

## Backlog by Work Type
| Work Type   | Count | Hours | % of Total |
|-------------|-------|-------|------------|
| PM          |       |       |            |
| CBM         |       |       |            |
| CM          |       |       |            |
| Project     |       |       |            |

## Trend (Last 6 Months)
[Backlog weeks trend chart placeholder]

## Actions
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
|        |       |     |        |
```

---

## 11. Examples

### Example 1: Work Management Manual for a 20,000 TPD Copper Concentrator

**Context:** A new copper concentrator in Chile's Atacama region, processing 20,000 TPD of sulfide ore through SAG/Ball mill grinding, flotation, and thickening/filtration. SAP PM is the CMMS. The maintenance team comprises 85 personnel across 4 shifts.

**Maintenance Philosophy excerpt:**

> "Minera Atacama Concentrator adopts a reliability-centered maintenance philosophy where maintenance strategy selection is driven by equipment criticality and failure consequence analysis. Our goal is to achieve >92% physical availability through a proactive maintenance regime where at least 80% of all work is planned and scheduled. We commit to zero tolerance for unplanned failures on Criticality AA equipment (SAG Mill, Ball Mill, Primary Crusher) and systematic condition monitoring of all Criticality A equipment."

**Criticality-Strategy Matrix:**

| Criticality | Assets (Examples)                          | Strategy Mix                    | Target Planned % |
|-------------|--------------------------------------------|---------------------------------|-------------------|
| AA          | SAG Mill, Ball Mill, Primary Crusher       | PM + CBM + PdM                  | >95%              |
| A           | Flotation cells, Thickeners, Conveyors     | PM + CBM                        | >85%              |
| B           | Pumps (non-critical), HVAC, Lighting       | PM + CM                         | >75%              |
| C           | Hand tools, Non-critical instruments       | RTF + CM                        | N/A               |

**Failure Modes Table Linkage Example:**

| Asset           | Failure Mode              | FM ID     | Strategy | WM Process Trigger                              |
|-----------------|---------------------------|-----------|----------|--------------------------------------------------|
| SAG Mill Pinion | Bearing wear              | FM-SAG-01 | CBM      | Vibration alert auto-creates notification in SAP  |
| Ball Mill Motor | Stator winding insulation | FM-BM-03  | PdM      | PdM analytics flags degradation trend             |
| Flotation Cell  | Impeller wear             | FM-FL-07  | PM       | SAP auto-generates WO at 4,000 operating hours    |
| Thickener Rake  | Torque arm fatigue crack  | FM-TH-02  | CBM      | Ultrasound inspection finding triggers notification|

**KPI Targets (Year 1 Ramp-Up):**

| KPI                    | Month 1-3  | Month 4-6  | Month 7-12 | Steady State |
|------------------------|------------|------------|------------|--------------|
| Schedule Compliance    | >60%       | >70%       | >80%       | >90%         |
| PM Compliance          | >80%       | >90%       | >95%       | >95%         |
| Corrective Ratio       | <40%       | <30%       | <20%       | <15%         |
| Wrench Time            | >25%       | >30%       | >35%       | >40%         |
| Backlog Weeks          | <8         | <6         | <4         | 2-4          |

**Schedule Freeze Policy:**

> The weekly maintenance schedule is frozen at T-2 (two business days before execution week begins). After freeze, only Emergency (Priority 1) and Urgent safety-related (Priority 2) work may break into the schedule. All break-in work requires Maintenance Superintendent approval and is documented with a Break-In Work Request form. The target is less than 10% break-in work as a percentage of total scheduled hours.

---

### Example 2: Backlog Reduction Initiative with KPI Analysis

**Context:** An existing open-pit copper mine with a 60,000 TPD concentrator has a maintenance backlog of 12 weeks (target: 4 weeks). Schedule compliance has dropped to 55%. The Work Management Manual is being revised to include a backlog reduction plan.

**Current State Assessment:**

| KPI                    | Current  | Target   | Gap       |
|------------------------|----------|----------|-----------|
| Ready Backlog          | 12 weeks | 4 weeks  | -8 weeks  |
| Schedule Compliance    | 55%      | 85%      | -30%      |
| PM Compliance          | 72%      | 95%      | -23%      |
| Corrective Ratio       | 45%      | 20%      | -25%      |
| Wrench Time            | 22%      | 35%      | -13%      |
| Planned Work Ratio     | 48%      | 80%      | -32%      |

**Root Cause Analysis of Backlog Growth:**
1. **Poor planning quality:** 40% of planned jobs require re-planning due to missing materials or incorrect scope.
2. **No schedule freeze:** Operations breaks into the schedule daily, displacing planned work.
3. **Reactive culture:** Supervisors prioritize urgent calls over scheduled work.
4. **Inadequate failure coding:** Without proper failure data, repeat failures are not identified.
5. **Planner-to-technician ratio:** Current 1:40 (target 1:20-25).

**Backlog Reduction Plan (12-Week Sprint):**

| Week  | Action                                                    | KPI Impact Expected         |
|-------|-----------------------------------------------------------|-----------------------------|
| 1-2   | Backlog screening: cancel obsolete WOs (>180 days)        | Backlog -2 weeks            |
| 1-2   | Implement schedule freeze policy (T-1 initially)          | Schedule compliance +10%    |
| 3-4   | Job plan quality blitz: rewrite top 50 job plans          | Planning rework -50%        |
| 3-6   | Hire 2 additional planners (ratio from 1:40 to 1:28)     | Planned work ratio +15%     |
| 5-8   | Contractor surge for backlog execution (focus Crit A/B)   | Backlog -4 weeks            |
| 6-8   | Implement failure coding standard and training            | Corrective ratio -10% (6mo) |
| 9-12  | Wrench time study and delay elimination                   | Wrench time +5%             |
| 9-12  | Tighten schedule freeze to T-2                            | Schedule compliance +10%    |

**Projected KPI Trajectory:**

| KPI                    | Week 0   | Week 4   | Week 8   | Week 12  |
|------------------------|----------|----------|----------|----------|
| Ready Backlog (weeks)  | 12       | 9        | 6        | 4        |
| Schedule Compliance    | 55%      | 65%      | 75%      | 80%      |
| PM Compliance          | 72%      | 80%      | 88%      | 92%      |
| Corrective Ratio       | 45%      | 40%      | 32%      | 25%      |

**Integration with 6-Step Process:**
The backlog reduction does not bypass the 6-step process; it strengthens it. Every backlog work order still flows through Identify -> Plan -> Schedule -> Execute -> Complete -> Analyze. The surge effort provides additional labor capacity, but the process discipline remains. The improvement actions (better planning, schedule freeze, failure coding) permanently improve the process for the long term.

---

## 12. MCP Integration

### 12.1 Context Protocol

This skill integrates with the VSC Multi-Agent system via the Model Context Protocol:

```yaml
mcp_integration:
  context_sources:
    - source: "analyze-equipment-criticality"
      data: "Criticality rankings (AA/A/B/C) for all maintainable assets"
      format: "JSON / CSV"
      refresh: "On demand or when asset register changes"

    - source: "analyze-failure-patterns"
      data: "VSC Failure Modes Table with strategy assignments"
      format: "JSON / CSV"
      refresh: "On demand or after RCM/FMEA updates"

    - source: "benchmark-maintenance-kpis"
      data: "Current KPI baselines and industry benchmarks"
      format: "JSON"
      refresh: "Monthly"

    - source: "create-org-design"
      data: "Maintenance organization structure and shift patterns"
      format: "JSON / Org chart"
      refresh: "On demand"

    - source: "map-regulatory-requirements"
      data: "DS 132, SERNAGEOMIN, and site-specific regulatory requirements"
      format: "JSON / Compliance matrix"
      refresh: "On regulatory change"

  output_consumers:
    - consumer: "Agent-Commissioning"
      usage: "Uses WM Manual to establish maintenance processes during commissioning"

    - consumer: "Agent-Operations"
      usage: "References WM Manual for operator notification and equipment release processes"

    - consumer: "Agent-OR-PMO"
      usage: "Tracks AM-WM-01 deliverable status in OR program"

    - consumer: "design-sap-pm-blueprint"
      usage: "Uses WM process definitions to configure CMMS workflows"

    - consumer: "optimize-pm-program"
      usage: "References WM Manual KPI targets for PM optimization"

  memory_persistence:
    - key: "wm_manual_version"
      value: "Current version of the Work Management Manual"
      scope: "site"

    - key: "wm_kpi_targets"
      value: "Approved KPI targets from the manual"
      scope: "site"

    - key: "wm_backlog_status"
      value: "Latest backlog weeks and health status"
      scope: "site"
      refresh: "weekly"
```

### 12.2 Airtable Integration

When the VSC Airtable deliverable tracker is active:

- **On generation:** Create record in Deliverables table with ID = AM-WM-01, Status = Draft
- **On review completion:** Update status to Under Review, log reviewer comments
- **On approval:** Update status to Approved, set next review date (annual)
- **On revision:** Increment version, maintain revision history

### 12.3 CMMS Data Pull

For brownfield operations, the skill can pull data from the CMMS to inform the manual:

- Work order history (12+ months) for KPI baseline calculation
- Current backlog extract for backlog health assessment
- PM schedule and compliance data
- Failure code usage analysis
- Planner and scheduler workload metrics

---

## 13. Revision History

| Version | Date       | Author         | Description                        |
|---------|------------|----------------|------------------------------------|
| 1.0.0   | 2026-02-17 | VSC OR System  | Initial release                    |

---

*This skill is part of the VSC OR System — Category D: Technical Deliverables. It supports the Asset Management workstream by defining the operational process through which maintenance strategies are executed daily.*
