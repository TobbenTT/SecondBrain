# Manage MOC Workflow

## Skill ID: I-05
## Version: 1.0.0
## Category: I. Documentation Lifecycle
## Priority: P1 - High

---

## Purpose

Manage end-to-end Management of Change (MOC) workflows for industrial operations, ensuring that every change to process, equipment, technology, procedures, or organization is systematically evaluated for risk, properly approved, fully implemented, and formally closed before the change becomes operational. This skill automates MOC form generation, impact assessment routing, multi-party approval coordination, implementation tracking, and post-change verification while maintaining the rigorous documentation trail required by process safety regulations.

Management of Change is one of the most critical elements of process safety management. When change management fails, the consequences are catastrophic. The CSB (Chemical Safety and Hazard Investigation Board) has identified inadequate management of change as a contributing or root cause in over 40% of investigated incidents, including the 2005 BP Texas City explosion (15 fatalities), the 2010 Tesoro Anacortes refinery explosion (7 fatalities), and the 2019 Philadelphia Energy Solutions refinery fire. OSHA PSM enforcement data consistently ranks MOC violations among the top 3 most-cited elements, with penalties up to $156,259 per willful violation.

This skill directly addresses Pain Point D-07 from the Corporate Pain Points Research Report, which documents that safety incidents traced to inadequate change management represent a recurring pattern across capital-intensive industries. Research by the Center for Chemical Process Safety (CCPS) indicates that 80% of process safety incidents involve some form of unmanaged change -- either a change that was not recognized as a change, a change that bypassed the MOC process, or a change where the MOC was completed but implementation was incomplete. The Mary Kay O'Connor Process Safety Center at Texas A&M University found that organizations with mature MOC systems experience 60-80% fewer process safety events than those with informal change management.

Beyond safety, poor change management drives operational problems: engineering changes that cascade into undocumented procedure modifications, equipment modifications that invalidate maintenance strategies, organizational changes that create competency gaps, and technology changes that outpace training programs. Each of these cascades erodes the integrity of the operational management system built during the Operational Readiness program.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **MOC Initiation & Classification**: Generate properly classified MOC forms based on the type of change (process, equipment, technology, procedural, organizational, temporary, emergency). Classification determines the required impact assessment scope, approval authority level, and pre-startup review requirements. The agent must distinguish between changes that require MOC (modifications to process safety information) and replacements-in-kind (RIK) that do not trigger MOC but must be documented.

2. **Impact Assessment Coordination**: Route MOC packages to affected disciplines for impact assessment. Every change has potential cascading effects across multiple domains: a process parameter change may affect operating procedures, alarm settings, safety instrumented systems, environmental permits, training requirements, and maintenance strategies. The agent must identify all affected domains, solicit impact assessments from each, and consolidate findings into a comprehensive impact evaluation.

3. **Risk Assessment Integration**: Ensure every MOC includes an appropriate risk assessment proportionate to the change's complexity and potential consequences. Simple changes may require a "What-If" analysis; complex changes may require a full HAZOP or LOPA. The agent must determine the appropriate risk assessment methodology, coordinate its execution, and verify that all identified risks have acceptable mitigation.

4. **Multi-Level Approval Routing**: Route MOC packages through the appropriate approval chain based on change classification and risk level. Low-risk procedural changes may require supervisor approval; high-risk process changes may require Plant Manager and corporate HSE approval. The agent must track approval status, send reminders for overdue approvals, and escalate stalled MOCs.

5. **Implementation Tracking**: Track all implementation actions required before the change becomes operational. This includes: updating P&IDs and other process safety information, revising operating procedures, updating CMMS and maintenance plans, conducting affected-personnel training, modifying safety instrumented systems, updating emergency response plans, and obtaining any required regulatory approvals or permit modifications.

6. **Pre-Startup Safety Review (PSSR) Coordination**: For MOCs that modify process equipment or change process parameters, ensure that a PSSR is conducted before the change becomes operational. The agent coordinates with the prepare-pssr-package (I-04) skill to generate the MOC-triggered PSSR.

7. **Temporary Change Management**: Track temporary changes with defined expiration dates. Temporary changes that exceed their authorized duration are escalated. Temporary changes must be either removed (restored to original condition) or converted to permanent changes (with full permanent MOC) before expiration.

8. **Emergency Change Management**: Support emergency changes that must be implemented immediately for safety reasons. Emergency MOCs receive expedited processing but must still be retroactively documented, assessed, and approved within 72 hours of implementation.

9. **MOC Register & Analytics**: Maintain a complete register of all MOCs with their status, and analyze MOC data for patterns: recurring change types, approval bottleneck identification, implementation closure rates, and correlation between MOC quality and incident rates.

---

## Trigger / Invocation

```
/manage-moc-workflow
```

**Aliases**: `/moc`, `/management-of-change`, `/change-management-workflow`, `/gestion-del-cambio`

**Primary Trigger Commands:**
- `manage-moc-workflow initiate --type [process|equipment|technology|procedural|organizational|temporary|emergency]`
- `manage-moc-workflow status --moc-id [MOC-XXXX]`
- `manage-moc-workflow approve --moc-id [MOC-XXXX] --approver [name]`
- `manage-moc-workflow implement --moc-id [MOC-XXXX] --action [action-id]`
- `manage-moc-workflow close --moc-id [MOC-XXXX]`
- `manage-moc-workflow report --period [monthly|quarterly|annual]`
- `manage-moc-workflow audit --scope [site|department|period]`
- `manage-moc-workflow expire-check --scope [all-temporary]`

**Trigger Conditions:**
- User requests a new MOC for a proposed change
- Engineering change notice (ECN) received from EPC or engineering team
- Equipment modification requested by maintenance or operations
- Procedure revision requested that alters process safety information
- Organizational restructuring that affects safety-critical roles
- Temporary change approaching or exceeding expiration date
- Emergency change implemented and requiring retroactive documentation
- Regulatory change requiring process or procedure modification
- Technology upgrade or software change affecting process control systems
- Audit finding requiring corrective change with MOC documentation

---

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Change Description | Text | Clear, detailed description of the proposed change: what is being changed, from what current state, to what new state, and why |
| Change Type | Selection | Process / Equipment / Technology / Procedural / Organizational / Temporary / Emergency |
| Change Scope | .docx, text | System boundaries, equipment affected, area/unit, drawing references |
| Originator | Text | Person requesting the change with role and department |
| Justification | Text | Business or safety rationale for the change, including consequences of not making the change |
| Proposed Implementation Date | Date | Target date for the change to become operational |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Affected P&IDs | .pdf, .dwg | Current P&IDs showing the systems to be changed |
| Preliminary Risk Assessment | .xlsx, .docx | If the originator has already conducted a risk assessment |
| Budget Estimate | Number | Estimated cost of implementing the change |
| Duration (Temporary Changes) | Date range | Start and end dates for temporary changes, maximum 90 days |
| Related MOCs | MOC IDs | Previous or concurrent MOCs related to this change |
| Vendor Documentation | .pdf | Vendor recommendations or technical data supporting the change |
| Regulatory Correspondence | .pdf | Any regulatory communications related to the change |
| Incident/Event Reference | Text | If the change is in response to an incident or near-miss |
| Drawing Markups | .pdf, .dwg | Red-line markups showing proposed change on drawings |
| Process Simulation Data | .xlsx | Process simulation results supporting the change (if applicable) |

### Input Validation Rules

- Change description must be specific enough to determine scope (reject vague descriptions like "improve pump performance")
- Temporary changes must have an expiration date no more than 90 days from implementation (per OSHA PSM guidance)
- Emergency changes must include immediate safety justification and must be initiated within 24 hours of emergency implementation
- Equipment tag numbers must match the asset register (validated against mcp-cmms)
- P&ID references must be validated against the document management system (mcp-sharepoint)
- Budget estimates above $100,000 require additional financial approval routing

---

## Output Specification

### Primary Output: MOC Package (.xlsx + .docx)

**Filename:** `{SiteCode}_MOC_{MOC-Number}_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "MOC Cover Sheet"
| Field | Content |
|-------|---------|
| MOC Number | MOC-{SiteCode}-{Year}-{Sequence} (e.g., MOC-MDP-2026-047) |
| Change Title | Brief descriptive title (max 80 characters) |
| Change Type | Process / Equipment / Technology / Procedural / Organizational / Temporary / Emergency |
| Change Classification | Minor / Moderate / Major / Critical (determines approval level) |
| Originator | Name, role, department |
| Date Initiated | YYYY-MM-DD |
| Affected System(s) | System codes and descriptions |
| Affected Equipment | Equipment tag numbers |
| Affected P&IDs | Drawing numbers and revisions |
| Affected Area(s) | Plant area/unit codes |
| Change Duration | Permanent / Temporary (expiry date) |
| Risk Level | Low / Medium / High / Critical |
| MOC Status | Initiated / Under Review / Approved / In Implementation / Awaiting PSSR / Closed / Rejected |
| Approval Authority | Based on classification and risk level |

#### Sheet 2: "Change Description & Justification"
- Detailed description of current state
- Detailed description of proposed change
- Technical justification
- Business justification
- Consequences of not implementing the change
- Alternatives considered and reasons for rejection
- Diagrams, markups, or sketches (embedded or referenced)

#### Sheet 3: "Impact Assessment Matrix"
| Domain | Assessed By | Impact | Details | Actions Required | Status |
|--------|-------------|--------|---------|-----------------|--------|
| Process Safety Information | Process Engineer | YES | P&IDs require update; process data sheets affected | Update P&IDs to as-built; revise PDS-100-003 | PENDING |
| Operating Procedures | Operations Superintendent | YES | SOP-100-005 requires revision for new setpoints | Revise SOP-100-005 Section 4.3; retrain 12 operators | PENDING |
| Maintenance Procedures | Maintenance Planner | YES | New bearing type requires updated PM task | Update PM task PMT-100-PP-001-Q1; add new spare part | PENDING |
| Training Requirements | Training Coordinator | YES | Operators need training on new operating parameters | 2-hour classroom + 1-hour practical per operator | PENDING |
| Safety Instrumented Systems | Instrument Engineer | NO | SIS logic unaffected; alarm setpoints unchanged | None | COMPLETE |
| Emergency Response | HSE Manager | NO | Emergency scenarios unchanged | None | COMPLETE |
| Environmental Permits | Environmental Specialist | REVIEW | Potential air quality impact; need emission calculation | Complete dispersion modeling by {date} | IN PROGRESS |
| Regulatory Compliance | Legal/Compliance | NO | No regulatory change triggered | None | COMPLETE |
| CMMS/Asset Data | CMMS Administrator | YES | Equipment parameters require update in SAP | Update functional location and BOM in SAP PM | PENDING |
| Spare Parts | Warehouse Manager | YES | New bearing type required; old type to be phased out | Order 2x new bearings; return old stock | PENDING |
| Alarm Management | Alarm Management Lead | YES | 2 alarm setpoints require modification | Submit Alarm MOC form; update alarm database | PENDING |
| Insurance | Risk Manager | NO | No change to insured values or risk profile | None | COMPLETE |

#### Sheet 4: "Risk Assessment"
- Risk assessment methodology used (What-If, HAZOP, LOPA, Bow-Tie)
- Identified hazards and scenarios
- Risk ranking before mitigation
- Recommended safeguards and mitigations
- Residual risk after mitigation
- ALARP demonstration (for High/Critical changes)

#### Sheet 5: "Approval Register"
| Approver Role | Name | Required/Advisory | Approval Status | Date | Signature | Comments |
|---------------|------|------------------|----------------|------|-----------|----------|
| Area Supervisor | J. Martinez | Required | APPROVED | 2026-03-15 | [sig] | |
| Operations Manager | C. Mendez | Required | APPROVED | 2026-03-16 | [sig] | Condition: training complete before implementation |
| HSE Manager | P. Silva | Required | PENDING | -- | -- | Awaiting environmental review |
| Maintenance Manager | R. Torres | Advisory | APPROVED | 2026-03-15 | [sig] | Spare parts lead time: 4 weeks |
| Plant Manager | A. Rodriguez | Required (Major) | PENDING | -- | -- | Will approve after HSE sign-off |

#### Sheet 6: "Implementation Action Tracker"
| Action # | Description | Responsible | Due Date | Status | Evidence | Verified By |
|----------|-------------|-------------|----------|--------|----------|-------------|
| IMP-001 | Update P&ID 100-005 Rev D to show new pump impeller | Drafting | 2026-04-01 | IN PROGRESS | -- | -- |
| IMP-002 | Revise SOP-100-005 Section 4.3 with new setpoints | Ops Engineer | 2026-04-05 | NOT STARTED | -- | -- |
| IMP-003 | Conduct operator training (12 operators x 3 hours) | Training | 2026-04-10 | NOT STARTED | -- | -- |
| IMP-004 | Order 2x new bearings (8-week lead time) | Procurement | 2026-03-20 | ORDERED | PO-2026-1234 | -- |
| IMP-005 | Update SAP PM: equipment BOM and PM task | CMMS Admin | 2026-04-01 | NOT STARTED | -- | -- |
| IMP-006 | Complete environmental dispersion modeling | Env. Specialist | 2026-04-15 | IN PROGRESS | -- | -- |
| IMP-007 | Conduct PSSR before startup | PSSR Team | 2026-04-20 | NOT STARTED | -- | -- |

#### Sheet 7: "PSSR Requirements" (if applicable)
- PSSR required: YES/NO (based on MOC classification)
- PSSR scope: description of what the PSSR must verify
- PSSR team composition
- PSSR scheduled date
- PSSR status and link to prepare-pssr-package (I-04)

#### Sheet 8: "Temporary Change Log" (if applicable)
| Field | Content |
|-------|---------|
| Temporary Change Authorization Date | 2026-03-15 |
| Maximum Duration | 90 days |
| Expiration Date | 2026-06-13 |
| Reversal Plan | Detailed description of how to restore original condition |
| Extension Request (if any) | Date requested, justification, new expiry |
| Conversion to Permanent | If converting, reference permanent MOC number |
| Actual Removal/Conversion Date | YYYY-MM-DD |
| Restoration Verified By | Name, date, signature |

### Secondary Output: MOC Summary Report (.docx)
**Filename:** `{SiteCode}_MOC_Summary_{MOC-Number}_{date}.docx`

Narrative report (3-8 pages) for management review:
1. Change summary and justification
2. Impact assessment summary
3. Risk assessment findings and mitigations
4. Approval status
5. Implementation plan and schedule
6. PSSR requirements (if applicable)
7. Recommendation for approval

### Tertiary Output: MOC Register & Analytics (.xlsx)
**Filename:** `{SiteCode}_MOC_Register_{period}.xlsx`

Site-wide MOC register with analytics:
- All active MOCs with status
- Overdue implementation actions
- Temporary changes approaching expiration
- MOC cycle time analysis (initiation to closure)
- MOC volume trends by type and department
- Implementation closure rate
- Correlation analysis: MOC quality vs. incident data

### Formatting Standards
- Header row: Bold, dark blue background (#003366), white font
- Status coding: COMPLETE=Green, IN PROGRESS=Amber, NOT STARTED=Grey, OVERDUE=Red, REJECTED=Dark Red
- Risk coding: CRITICAL=Red, HIGH=Orange, MEDIUM=Amber, LOW=Green
- All PSSR-required MOCs highlighted with bold border
- Temporary change expiration dates highlighted in yellow when within 14 days
- Overdue actions highlighted in red with automatic escalation flag

---

## Methodology & Standards

### Primary Regulatory Standards

- **OSHA 29 CFR 1910.119(l)** - Management of Change: Core US PSM requirement. Requires written procedures to manage changes (except RIK) to process chemicals, technology, equipment, and procedures. Must address: (1) technical basis for change, (2) impact on safety and health, (3) modifications to operating procedures, (4) necessary time period for change, (5) authorization requirements for change. Affected employees must be informed and trained before startup.
- **EPA 40 CFR 68.75** - Management of Change: RMP program requirement mirroring OSHA PSM MOC requirements.
- **API RP 750** - Management of Process Hazards: Industry recommended practice for process hazard management including MOC.

### International Standards

- **Seveso III Directive (2012/18/EU) Article 10** - Requires safety management system including MOC procedures for major hazard sites.
- **UK COMAH Regulations** - Control of Major Accident Hazards: Requires formal MOC as part of the Safety Report.
- **IEC 61511-1 (SIS)** - Functional Safety: Requires management of change for safety instrumented systems, including SIL verification after modification.
- **ISO 45001:2018** - Occupational Health and Safety Management Systems: Section 8.1.3 requires management of change processes.

### Chilean Regulatory Standards

- **DS 132 Art. 21** - Reglamento de Seguridad Minera: Requires authorization and safety review before equipment or process modifications in mining operations.
- **DS 594** - Workplace safety conditions: Changes affecting workplace safety must be assessed and controlled.
- **SERNAGEOMIN Circular Letters** - Mining-specific change management requirements, particularly for tailings facilities, ventilation systems, and geotechnical modifications.
- **SMA (Superintendencia del Medio Ambiente)** - Environmental permit conditions may require notification or approval of changes affecting emissions or discharges.

### Industry Best Practices

- **CCPS "Guidelines for the Management of Change for Process Safety"** (2008): Comprehensive industry guidance for MOC programs, including scope determination, impact assessment, risk evaluation, approval, implementation, and close-out.
- **CCPS "Recognizing and Responding to Normalization of Deviance"** (2018): Addresses how accumulated small changes, each individually "acceptable," can collectively drift the operation into a dangerous state.
- **API 750** - Management of Process Hazards: Addresses MOC within the broader process safety context.
- **Energy Institute "Hearts and Minds" MOC guidance**: Behavioral aspects of change management.

### Industry Statistics

- 80% of process safety incidents involve some form of unmanaged change (CCPS, 2018 data)
- MOC violations rank top 3 in OSHA PSM citations annually (OSHA enforcement data)
- Average MOC cycle time (initiation to closure): 45-90 days for moderate changes (industry benchmark)
- Typical MOC volume: 200-500 per year for a medium-size refinery or chemical plant (CCPS data)
- 40% of MOCs are incomplete at time of implementation -- i.e., not all implementation actions closed (CCPS audit data)
- 25% of temporary changes exceed their authorized duration (industry audit findings)
- Organizations with mature MOC programs: 60-80% fewer process safety events (Mary Kay O'Connor Center, Texas A&M)
- Cost of OSHA PSM MOC violation: $15,811 (serious) to $156,259 (willful) per citation (2024 rates)
- Average cost of a process safety incident attributable to MOC failure: $10M-$100M+ (CSB investigation data)

### MOC Classification Matrix

| Change Type | Classification Criteria | Risk Assessment Required | Approval Authority |
|------------|------------------------|------------------------|--------------------|
| **Minor** | No change to PSI; no SIS impact; single equipment; operating within existing envelope | What-If (documented) | Area Supervisor |
| **Moderate** | Changes to PSI; affects operating procedures; single system; within design limits | What-If or Checklist HAZOP | Operations Manager + HSE |
| **Major** | Changes to process conditions beyond design basis; SIS modifications; multiple systems | Full HAZOP node review | Plant Manager + HSE Manager |
| **Critical** | New process chemistry; significant capacity increase; changes to relief system design basis | Full HAZOP + LOPA + Independent Review | VP Operations + Corporate HSE |

---

## Step-by-Step Execution

### Phase 1: MOC Initiation & Classification (Steps 1-3)

**Step 1: Receive and Validate Change Request**
1. Receive change request from originator (via mcp-teams, mcp-outlook, or direct input)
2. Validate that the request describes an actual change (not a replacement-in-kind):
   - Replacement-in-kind (RIK): same specification, same materials, same design -- document but does not require MOC
   - Change: any deviation from current process safety information -- requires MOC
   - When in doubt: treat as a change (conservative approach)
3. Validate completeness of required information:
   - Change description is specific and unambiguous
   - Affected systems and equipment are identified by tag number
   - Justification is documented
   - Proposed timeline is stated
4. Assign MOC number: MOC-{SiteCode}-{Year}-{Sequence}
5. Register MOC in the MOC tracking database (mcp-sharepoint)
6. Send acknowledgment to originator with MOC number and expected timeline

**Step 2: Classify the Change**
1. Determine change type:
   - **Process**: Changes to process parameters (temperature, pressure, flow, composition, setpoints)
   - **Equipment**: Changes to equipment (new equipment, modified equipment, different materials/capacity)
   - **Technology**: Changes to process control systems, software, automation, instrumentation
   - **Procedural**: Changes to operating procedures, maintenance procedures, emergency procedures
   - **Organizational**: Changes to staffing structure, roles, responsibilities, shift patterns
   - **Temporary**: Any change with a defined end date (max 90 days)
   - **Emergency**: Changes implemented immediately for safety; retroactive documentation required
2. Determine classification level (Minor/Moderate/Major/Critical) using the classification matrix:
   - Assess whether process safety information is affected
   - Assess whether safety instrumented systems are affected
   - Assess the number of systems/areas affected
   - Assess whether operating envelope changes
3. Determine required risk assessment methodology based on classification
4. Determine required approval authority chain based on classification
5. Estimate MOC timeline based on classification and complexity
6. Notify originator of classification, required approvals, and expected timeline

**Step 3: Initiate Impact Assessment**
1. Identify all domains potentially affected by the change:
   - Process Safety Information (P&IDs, PFDs, process data sheets, equipment data sheets)
   - Operating Procedures (SOPs, EOPs, startup/shutdown procedures)
   - Maintenance Procedures (PM tasks, inspection procedures, spare parts lists)
   - Training Requirements (operator training, maintenance training, emergency drills)
   - Safety Instrumented Systems (SIS logic, alarm setpoints, trip settings)
   - Emergency Response Plans (fire response, evacuation, spill response)
   - Environmental Compliance (permits, emissions, discharges, waste management)
   - Regulatory Requirements (operating licenses, regulatory notifications)
   - CMMS/Asset Data (equipment parameters, BOMs, functional locations)
   - Spare Parts Inventory (new parts required, obsolete parts removed)
   - Alarm Management (new alarms, modified alarms, rationalization)
   - Insurance (property values, risk profile, notifications)
2. Generate impact assessment forms for each affected domain
3. Route impact assessment forms to responsible subject matter experts via mcp-outlook
4. Set due dates for impact assessment returns (typically 5-10 business days)
5. Track impact assessment status and send reminders at 50% and 75% of due date

### Phase 2: Risk Assessment & Approval (Steps 4-7)

**Step 4: Consolidate Impact Assessments**
1. Collect all returned impact assessments
2. Follow up on overdue assessments (escalate via mcp-teams if >2 days late)
3. Consolidate findings into the Impact Assessment Matrix
4. Identify total scope of implementation actions required
5. Estimate total implementation cost and duration
6. Flag any showstopper findings that may require the change to be reconsidered
7. Prepare consolidated impact summary for risk assessment team

**Step 5: Coordinate Risk Assessment**
1. Select risk assessment methodology based on MOC classification:
   - Minor: Documented What-If analysis (by area supervisor and process engineer)
   - Moderate: What-If analysis or Checklist HAZOP (3-5 participants, 2-4 hours)
   - Major: Full HAZOP node review for affected nodes (5-8 participants, 1-2 days)
   - Critical: Full HAZOP + LOPA + Independent Review (8-12 participants, 2-5 days)
2. Schedule risk assessment session via mcp-teams
3. Prepare risk assessment materials:
   - Current P&IDs and process description
   - Proposed change description with markups
   - Impact assessment summary
   - Previous incident/near-miss data for similar changes
   - Relevant industry incident data (CSB investigations, CCPS process safety beacons)
4. Conduct risk assessment:
   - Identify hazards introduced or modified by the change
   - Assess risk before mitigation (using site risk matrix)
   - Identify safeguards and mitigations (existing and proposed)
   - Assess residual risk after mitigation
   - Document findings, recommendations, and action items
5. If risk is unacceptable: return to originator with recommendations to modify the change
6. If risk is acceptable: proceed to approval routing

**Step 6: Route for Approval**
1. Generate approval package including:
   - MOC cover sheet with classification and risk level
   - Change description and justification
   - Impact assessment matrix (consolidated)
   - Risk assessment findings and recommendations
   - Implementation action plan with timeline and cost
   - PSSR requirements (if applicable)
2. Route to required approvers based on classification:
   - Minor: Area Supervisor
   - Moderate: Operations Manager + HSE Manager
   - Major: Plant Manager + HSE Manager + Engineering Manager
   - Critical: VP Operations + Corporate HSE Director + Plant Manager
3. Send approval package via mcp-outlook with clear decision request
4. Track approval status daily:
   - Send reminder at 3 days if no response
   - Send escalation at 5 days if no response
   - Notify originator and management at 7 days if still pending
5. Record approvals with dates, signatures, and any conditions
6. Handle rejection: document rejection reason, notify originator, archive MOC as rejected

**Step 7: Handle Approval Conditions**
1. If approved with conditions (common):
   - Document all conditions clearly
   - Assign condition owners and due dates
   - Track condition fulfillment
   - Conditions must be met before implementation can proceed
2. If partially approved:
   - Identify which parts are approved and which require further work
   - Communicate scope limitations to implementation team
3. If approved:
   - Notify all stakeholders of approval via mcp-teams
   - Release implementation actions for execution
   - Update MOC status to "IN IMPLEMENTATION"

### Phase 3: Implementation & Verification (Steps 8-12)

**Step 8: Execute Implementation Actions**
1. Release implementation action tracker to all responsible parties
2. Track action completion daily/weekly based on criticality:
   - Critical path actions: daily tracking
   - Non-critical actions: weekly tracking
3. Coordinate sequencing of implementation actions:
   - P&ID updates before procedure revisions (procedures reference drawings)
   - Procedure revisions before training (training uses current procedures)
   - Training before operational startup (operators must be trained)
   - CMMS updates before PM task activation
   - Spare parts procurement before equipment modification
4. Track evidence of completion for each action:
   - Updated document numbers and revision letters
   - Training attendance records
   - CMMS change confirmation screenshots
   - Procurement order confirmations
5. Send weekly implementation status summary to MOC originator and approvers

**Step 9: Coordinate Training Requirements**
1. Identify all personnel affected by the change:
   - Operators who use affected procedures
   - Maintenance technicians who maintain affected equipment
   - Emergency responders if emergency response is affected
   - Supervisors who authorize affected activities
2. Determine training method and content:
   - Classroom briefing for simple procedural changes (30-60 minutes)
   - Hands-on training for equipment modifications (2-4 hours)
   - Full competency assessment for complex process changes (1-2 days)
   - Tabletop exercise for emergency response changes (2-4 hours)
3. Schedule training sessions via mcp-teams
4. Track training completion:
   - Maintain attendance records with signatures
   - Verify comprehension (test or practical demonstration for significant changes)
   - Document training materials used
5. Training must be complete before the change becomes operational (per OSHA 29 CFR 1910.119(l)(3))

**Step 10: Coordinate PSSR (if required)**
1. Determine if PSSR is required:
   - Required: Equipment modifications, process changes affecting PSI, SIS modifications
   - Not required: Procedural changes only, organizational changes
   - Judgment: Technology changes assessed case-by-case
2. If required, invoke prepare-pssr-package (I-04) skill:
   - Pass MOC documentation as input
   - Specify MOC-specific PSSR scope (focused on areas of change)
   - Ensure PSSR team includes MOC originator
3. Track PSSR completion:
   - PSSR must be completed before the change becomes operational
   - PSSR findings may generate additional implementation actions
   - HOLD items from PSSR must be resolved before startup
4. If PSSR is "NOT APPROVED":
   - Escalate to MOC approvers immediately
   - Change cannot become operational until PSSR is approved

**Step 11: Verify Implementation Completeness**
1. Before authorizing the change to become operational, verify:
   - All implementation actions marked "COMPLETE" with evidence
   - All training completed and documented
   - All approval conditions met
   - PSSR approved (if required)
   - All affected documentation updated and controlled
   - CMMS/asset data updated
   - Environmental/regulatory notifications sent (if required)
2. Generate implementation verification checklist
3. Conduct physical verification (if equipment change):
   - Field walkdown to verify installation matches approved design
   - Valve lineup verification
   - Instrument calibration verification
   - Safety device testing (if affected)
4. Obtain implementation verification signature from responsible engineer

**Step 12: Close MOC**
1. When all implementation actions are verified complete:
   - Generate MOC closure package
   - Obtain closure signatures from: originator, area supervisor, HSE representative
   - Update MOC status to "CLOSED"
   - Record closure date and final status
2. For temporary changes:
   - If expired: verify reversal to original condition
   - If converting to permanent: generate new permanent MOC
   - Document actual removal/restoration date
   - Verify reversal verification signature
3. Archive complete MOC package in mcp-sharepoint:
   - All forms, assessments, approvals, implementation evidence, PSSR records
   - Maintain for minimum 5 years (or per regulatory requirement, whichever is longer)
4. Update MOC register with final data

### Phase 4: Analytics & Continuous Improvement (Steps 13-14)

**Step 13: Generate MOC Analytics Report**
1. Monthly/quarterly MOC analytics:
   - Total MOCs initiated, approved, rejected, closed
   - Average cycle time by classification level
   - Implementation action closure rate (target: >95% on time)
   - Temporary change expiration compliance (target: 100%)
   - Overdue action items (target: zero)
   - MOC volume by department and type
   - Repeat changes (same equipment/system changed multiple times)
2. Identify trends and patterns:
   - Departments with highest MOC volume (may indicate design issues)
   - Recurring change types (may indicate systemic problems)
   - Approval bottlenecks (slow approvers)
   - Implementation quality issues (actions closed without adequate evidence)
3. Correlate with safety performance:
   - Near-miss events related to changes
   - Incidents involving recently-changed systems
   - OSHA/regulatory audit findings related to MOC

**Step 14: Audit and Improve MOC Process**
1. Conduct annual MOC process audit:
   - Sample 10-20% of closed MOCs for quality review
   - Verify all elements complete and adequately documented
   - Verify training records match affected personnel
   - Verify P&IDs and procedures updated to reflect changes
   - Check for "normalization of deviance" -- accumulated minor changes
2. Benchmark MOC process against CCPS best practices
3. Identify improvement opportunities:
   - Process simplification (without reducing rigor)
   - Tool improvements (automation, digital workflows)
   - Training improvements (MOC awareness, RIK vs. change determination)
4. Update MOC procedure based on audit findings
5. Report audit results to management

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| MOC Completeness | All required sections populated, no blanks | 100% | 100% |
| Classification Accuracy | MOC classification validated by HSE review | >95% correct | >90% |
| Impact Assessment Coverage | All affected domains identified and assessed | 100% | >95% |
| Risk Assessment Conducted | Appropriate risk assessment per classification | 100% | 100% |
| Approval Turnaround | Approvals obtained within target cycle time | <10 business days | <15 business days |
| Implementation Closure Rate | Actions closed on time | >95% | >85% |
| Training Completion | All affected personnel trained before operational | 100% | 100% |
| PSSR Completion | PSSR conducted before startup (when required) | 100% | 100% |
| Temporary Change Compliance | Temporary changes removed/converted before expiry | 100% | >95% |
| Documentation Update | All PSI documents updated to reflect change | 100% | 100% |
| MOC Closure Rate | MOCs closed within 90 days of implementation | >90% | >80% |
| Emergency MOC Retroactive | Emergency MOCs fully documented within 72 hours | 100% | 100% |
| Archive Completeness | All MOC records archived per retention policy | 100% | 100% |
| Regulatory Compliance | MOC process satisfies OSHA/EPA/local requirements | 100% | 100% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `agent-operations` | Change origination | Operations team initiates MOCs for process and procedural changes; provides operating context and impact assessment |
| `agent-maintenance` | Change origination | Maintenance team initiates MOCs for equipment modifications; provides technical impact assessment and PM plan updates |
| `agent-hse` | Risk assessment | HSE provides risk assessment facilitation, safety impact evaluation, and regulatory compliance verification |
| `manage-vendor-documentation` (I-01) | Vendor data | Vendor documentation supporting equipment modifications and technology changes |
| `generate-operating-procedures` (I-02) | Procedure status | Current procedure revision status for impact assessment and update tracking |
| `track-document-currency` (I-03) | Document currency | Verification that all affected documents are current before MOC modifies them |
| `map-regulatory-requirements` (L-01) | Regulatory mapping | Identifies which regulatory requirements are affected by the proposed change |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `prepare-pssr-package` (I-04) | PSSR trigger | MOC completion triggers PSSR when equipment or process changes are involved |
| `track-incident-learnings` (L-02) | Change correlation | MOC data feeds into incident analysis to correlate changes with safety events |
| `audit-compliance-readiness` (L-04) | Compliance evidence | MOC register and records provide evidence for PSM/regulatory compliance audits |
| `generate-operating-procedures` (I-02) | Procedure updates | MOC implementation actions include procedure revision requirements |
| `develop-maintenance-strategy` (J-01) | Strategy updates | Equipment changes may trigger maintenance strategy revisions |
| `optimize-pm-program` (J-02) | PM plan updates | Equipment MOCs require PM program modifications in CMMS |
| `track-competency-matrix` (M-02) | Training triggers | MOCs generate training requirements for affected personnel |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `agent-project` | EPC interface | Engineering change notices from EPC phase feed into MOC process during commissioning |
| `agent-doc-control` | Document management | Document control manages revision control for all documents affected by MOCs |
| `orchestrate-or-program` (H-01) | OR integration | MOCs during OR phase tracked as part of overall OR program management |

---

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Central repository for MOC documentation and register"
capabilities:
  - Store MOC packages (forms, assessments, approvals, evidence)
  - Maintain MOC tracking register as SharePoint list
  - Manage document approval workflows for MOC approvals
  - Version control for MOC documents
  - Archive closed MOCs per retention policy
  - Search and retrieve historical MOC data for analytics
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Register new MOC in tracking database
  - Step 3: Route impact assessment forms to assessors
  - Step 6: Publish approval package
  - Step 8: Track implementation evidence documents
  - Step 12: Archive complete MOC package
  - Step 13: Query MOC register for analytics
```

### mcp-teams
```yaml
name: "mcp-teams"
server: "@anthropic/teams-mcp"
purpose: "Real-time coordination for MOC workflow participants"
capabilities:
  - Post MOC notifications in relevant department channels
  - Schedule risk assessment meetings
  - Schedule training sessions for affected personnel
  - Send urgent notifications for emergency MOCs
  - Facilitate discussion threads for MOC review
  - Coordinate multi-party impact assessment
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 1: Notify affected departments of new MOC
  - Step 5: Schedule and support risk assessment sessions
  - Step 7: Notify stakeholders of approval decisions
  - Step 9: Schedule training sessions
  - Step 11: Coordinate implementation verification
```

### mcp-outlook
```yaml
name: "mcp-outlook"
server: "@anthropic/outlook-mcp"
purpose: "Formal communication and approval routing for MOC workflow"
capabilities:
  - Send MOC initiation notifications to affected parties
  - Route impact assessment forms with response tracking
  - Distribute approval packages to approval authorities
  - Send reminders for overdue assessments and approvals
  - Distribute implementation status reports
  - Send temporary change expiration warnings
  - Formal escalation notifications for stalled MOCs
authentication: OAuth2 (Microsoft 365)
usage_in_skill:
  - Step 1: Send MOC acknowledgment to originator
  - Step 3: Route impact assessment forms to SMEs
  - Step 6: Send approval packages to approval authorities
  - Step 8: Send implementation status summaries weekly
  - Step 12: Send MOC closure notification
  - Step 13: Distribute MOC analytics reports
```

---

## Templates & References

### Templates
- `templates/moc_package_template.xlsx` -- Master MOC package workbook with all sheets pre-formatted
- `templates/moc_cover_sheet.xlsx` -- MOC cover sheet with classification matrix
- `templates/moc_impact_assessment_form.xlsx` -- Domain-specific impact assessment form
- `templates/moc_risk_assessment_whatif.xlsx` -- What-If risk assessment template
- `templates/moc_implementation_tracker.xlsx` -- Implementation action tracking template
- `templates/moc_temporary_change_log.xlsx` -- Temporary change management template
- `templates/moc_emergency_change_form.xlsx` -- Emergency change retroactive documentation
- `templates/moc_closure_checklist.xlsx` -- MOC closure verification checklist
- `templates/moc_analytics_report.xlsx` -- Monthly/quarterly MOC analytics report template
- `templates/moc_summary_report.docx` -- MOC narrative summary for management review

### Reference Documents
- OSHA 29 CFR 1910.119(l) -- Management of Change
- EPA 40 CFR 68.75 -- Management of Change (RMP)
- CCPS "Guidelines for the Management of Change for Process Safety" (2008)
- CCPS "Recognizing and Responding to Normalization of Deviance" (2018)
- API RP 750 -- Management of Process Hazards
- IEC 61511-1 -- Functional Safety (MOC for SIS)
- ISO 45001:2018 Section 8.1.3 -- Management of Change
- DS 132 (Chile) -- Reglamento de Seguridad Minera
- CSB Investigation Reports (Texas City, Tesoro, PES)
- Company PSM Manual -- MOC section

### Reference Datasets
- MOC classification decision tree (interactive guide)
- RIK vs. Change determination examples by equipment type
- Impact assessment routing matrix (change type vs. affected domains)
- Risk assessment methodology selection guide
- Approval authority matrix by site and classification level
- Historical MOC database for pattern analysis
- Industry incident database (MOC-related events)

---

## Examples

### Example 1: Process Parameter Change MOC

```
Command: manage-moc-workflow initiate --type process

Input:
  Originator: Carlos Mendez, Operations Superintendent
  Change: Increase cyclone feed pump discharge pressure setpoint from
          28 bar to 32 bar to improve cyclone classification efficiency.
  Affected Equipment: PP-3201A/B, PI-3201, PIC-3201
  Justification: Process optimization study shows 32 bar discharge pressure
                 improves classification efficiency by 8%, increasing overall
                 copper recovery by 0.3%.

Process:
  Step 1: Validated change request; assigned MOC-MDP-2026-047
  Step 2: Classification:
    - Type: Process (operating parameter change)
    - PSI Affected: Yes (operating limits in process data sheet)
    - SIS Impact: Assessed - High-pressure trip at 35 bar unchanged; adequate margin
    - Classification: MODERATE
    - Risk assessment: What-If analysis required
    - Approval: Operations Manager + HSE Manager

  Step 3: Impact assessment routed to 12 domains
    Results (consolidated):
    - Process Safety Info: YES - Update PDS-100-003 operating pressure range
    - Operating Procedures: YES - Revise SOP-100-005 startup/normal operation setpoints
    - Maintenance: YES - Review pump seal and gasket specifications for higher pressure
    - Training: YES - Brief 12 operators on new operating parameters
    - SIS: NO - High-pressure trip at 35 bar provides adequate margin
    - Emergency Response: NO - No change to emergency scenarios
    - Environmental: NO - No change to emissions or discharges
    - CMMS: YES - Update equipment operating parameters in SAP
    - Spare Parts: MAYBE - Higher pressure may increase seal failure rate (review)
    - Alarm Management: YES - High-pressure alarm needs review (currently at 31 bar)

  Step 5: Risk Assessment (What-If):
    - What if pressure exceeds 35 bar? -> Trip activates, safe shutdown (existing safeguard)
    - What if seal fails at higher pressure? -> Same consequence as current, slightly higher
      probability. Mitigation: verify seal rating >= 40 bar (confirmed by vendor)
    - What if alarm at 31 bar causes nuisance trips at 32 bar operating? -> CRITICAL:
      Must raise high-pressure alarm to 33.5 bar BEFORE change
    - Risk level: MEDIUM (acceptable with alarm modification)

  Step 6: Approval obtained: Operations Manager (Day 3), HSE Manager (Day 5)
    Condition: Alarm setpoint modification must be completed simultaneously

  Implementation Actions (7 items):
    IMP-001: Update PDS-100-003 (Process Engineer, 5 days)
    IMP-002: Revise SOP-100-005 (Ops Engineer, 7 days)
    IMP-003: Submit Alarm MOC for setpoint change 31->33.5 bar (Alarm Lead, 3 days)
    IMP-004: Brief 12 operators (Training Coordinator, 3 sessions x 1 hour)
    IMP-005: Update SAP equipment parameters (CMMS Admin, 1 day)
    IMP-006: Verify pump seal rating (Maintenance Engineer, 2 days)
    IMP-007: PSSR not required (parameter change within equipment design limits)

  All actions completed in 15 business days. MOC closed Day 18.

Output:
  "MOC-MDP-2026-047 CLOSED.
   Change implemented: Cyclone feed pump pressure increased 28->32 bar.
   All 7 implementation actions verified complete.
   12 operators trained. Alarm setpoint updated. Procedures revised.
   No PSSR required (within equipment design limits).
   Expected benefit: 0.3% improvement in Cu recovery."
```

### Example 2: Emergency MOC for Safety-Critical Situation

```
Command: manage-moc-workflow initiate --type emergency

Input:
  Originator: Pedro Silva, HSE Manager
  Emergency: Pressure relief valve PSV-5101 on ammonia storage tank found to be
            set 15% above design pressure during routine inspection. Tank currently
            in service with 80% inventory. Temporary shim installed to reduce set
            pressure to correct value. Requires retroactive MOC documentation.
  Implemented: 2026-04-10 at 14:30 (emergency response)

Process:
  Step 1: Emergency MOC registered: MOC-MDP-2026-E003
    - Emergency classification: CRITICAL (safety-critical equipment, ammonia)
    - Retroactive documentation deadline: 72 hours (2026-04-13)

  Step 2: Emergency actions verified:
    - Temporary shim installed by certified PSV technician
    - Set pressure verified by pop test: 12.5 bar (design: 12.5 bar)
    - Temporary change documented with expiration: 30 days
    - Permanent repair (PSV rebuild or replacement) to be scheduled

  Impact Assessment (expedited):
    - PSI: YES - Update PSV data sheet with inspection findings
    - Maintenance: YES - Schedule PSV removal and bench test/rebuild
    - Spare Parts: YES - Order replacement PSV spring assembly
    - Regulatory: YES - Notify SERNAGEOMIN of safety device non-conformance
    - Investigation: YES - Determine root cause (incorrect spring, calibration drift?)

  Risk Assessment (retroactive HAZOP review):
    - Scenario: PSV did not protect at design pressure during overpressure event
    - Consequence: Potential ammonia release (PSM-covered process)
    - Probability: Low (overpressure event would need to occur during the window)
    - Compensating measures: Correct shim installed, verified by pop test,
      process operating within normal parameters, operators briefed
    - Determination: Emergency response was appropriate and timely

  Approval (retroactive):
    - Plant Manager: Approved (Day 1, emergency authority invoked)
    - HSE Manager: Approved (Day 1, as originator)
    - Corporate HSE: Notified and approved (Day 2)
    - SERNAGEOMIN: Notified per regulatory requirement (Day 2)

Output:
  "MOC-MDP-2026-E003 (EMERGENCY) documented and approved retroactively.
   Emergency response verified appropriate.
   Temporary change (shim) authorized for 30 days.
   Permanent MOC MOC-MDP-2026-048 initiated for PSV rebuild/replacement.
   Root cause investigation initiated (target: 14 days).
   Regulatory notification submitted to SERNAGEOMIN."
```

### Example 3: Temporary Change Approaching Expiration

```
Trigger: Automated daily scan of temporary changes approaching expiration

Process:
  Scan results (3 items requiring attention):

  1. MOC-MDP-2026-T012: Temporary bypass on level transmitter LT-2105
     - Installed: 2026-02-15 | Expires: 2026-05-16 (in 14 days)
     - Reason: Transmitter failed; replacement on order (8-week lead time)
     - Status: Replacement received, installation scheduled for 2026-05-10
     - Action: ON TRACK - Removal scheduled before expiry

  2. MOC-MDP-2026-T008: Temporary operating procedure for manual valve operation
     - Installed: 2026-01-20 | Expires: 2026-04-20 (EXPIRED 26 days ago)
     - Reason: Actuator failure on valve HV-3302
     - Status: Actuator replacement parts still on order; ETA 2026-06-01
     - Action: OVERDUE - Requires extension authorization or conversion

  3. MOC-MDP-2026-T015: Temporary increase in shift manning (5th operator)
     - Installed: 2026-03-01 | Expires: 2026-05-30 (in 28 days)
     - Reason: Compensating measure for alarm system upgrade in progress
     - Status: Alarm system upgrade 60% complete; expected completion 2026-07-15
     - Action: EXTENSION NEEDED - Alarm upgrade will not complete before expiry

  Actions taken:
  - T012: Confirmation sent to maintenance scheduler; on track for removal
  - T008: ESCALATION sent to Plant Manager (expired temporary change)
         Extension request generated requiring Plant Manager + HSE Manager approval
         Maximum extension: 90 additional days with documented justification
  - T015: Extension request generated with justification
         Routed to Operations Manager + HSE Manager for approval

Output:
  "Temporary Change Scan - 3 items requiring attention:
   T012: ON TRACK for removal (14 days remaining)
   T008: OVERDUE by 26 days - ESCALATION to Plant Manager
   T015: Extension request generated (28 days remaining)

   CRITICAL: MOC-MDP-2026-T008 has exceeded authorized duration.
   Immediate management attention required per OSHA PSM 1910.119(l).
   Extension or conversion to permanent MOC must be authorized within 48 hours."
```
