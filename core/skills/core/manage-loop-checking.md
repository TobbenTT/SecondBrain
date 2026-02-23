# Manage Loop Checking and Alarm Rationalization

## Skill ID: R-03
## Version: 1.0.0
## Category: R. Commissioning Intelligence
## Priority: P1 - High

---

## Purpose

Manage the systematic execution of loop checking activities and alarm rationalization during the commissioning phase of capital projects, ensuring that every instrument loop is verified end-to-end and that the alarm system is rationalized per ISA-18.2/IEC 62682 before process introduction. This skill coordinates the generation, tracking, and completion of loop check packages while simultaneously rationalizing the alarm database to prevent alarm floods during initial startup and steady-state operations.

The need for this skill is acute and well-documented. Industry data reveals that 50% of process plant alarms during startup are nuisance alarms -- alarms that annunciate but require no operator action, or that are configured at incorrect setpoints for startup conditions (Pain Point CE-05, EEMUA Publication 191 / ISA-18.2). During the critical first hours and days of plant startup, operators face alarm rates of 10-50 alarms per 10 minutes, far exceeding the manageable rate of 1-2 alarms per 10 minutes recommended by EEMUA 191. This alarm flood overwhelms operators, masks genuine safety alarms behind a wall of nuisance alerts, degrades situational awareness, and directly contributes to startup incidents.

The root causes of alarm floods during startup are systemic:
- **Alarms configured for steady-state operation** are activated during transient startup conditions, generating hundreds of expected-but-nuisance alarms as process variables traverse from ambient to operating conditions.
- **No startup-specific alarm shelving strategy** exists, so operators either acknowledge alarms reflexively (defeating the purpose of alarming) or disable alarms indiscriminately (creating safety blind spots).
- **Loop checking is disconnected from alarm rationalization.** Loop checks verify that instruments read and transmit correctly, but do not verify that the associated alarms are configured correctly, have appropriate setpoints, and are classified per a rationalized priority scheme.
- **Incomplete loop checking** leaves instruments untested or partially tested, resulting in false readings, stuck signals, or communication failures that generate spurious alarms during startup.
- **No integrated tracking** of loop check status and alarm rationalization status, making it impossible to determine commissioning readiness from an instrumentation perspective.

The consequences are severe. The Buncefield incident (2005, UK) was contributed to by failed level instrumentation and alarm management failures. The CSB investigation of the BP Texas City explosion (2005) identified inadequate alarm management during startup as a contributing factor. ASM Consortium research estimates that effective alarm management reduces operator error during abnormal situations by 30-50%.

This skill integrates loop checking execution management with alarm rationalization to produce a commissioning-ready instrumentation and alarm system, verified end-to-end, classified per ISA-18.2, and configured with a startup-specific alarm management strategy.

---

## Intent & Specification

| Attribute              | Value                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | R-03                                                                                        |
| **Agent**              | Agent 8 -- Commissioning Intelligence                                                        |
| **Domain**             | Commissioning Intelligence                                                                   |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Setup: 5-10 days; Execution: 4-16 weeks (depends on loop count)                              |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | CE-05: 50% of alarms during startup are nuisance alarms (EEMUA 191, ISA-18.2)            |
| **Secondary Pain**     | CE-04: 30-40% of startup incidents trace to incomplete pre-startup verification (CCPS)       |
| **Value Created**      | Reduce alarm flood incidents by 70-80%; reduce startup duration by 15-25%; zero missed safety alarms |

### Functional Intent

This skill SHALL:

1. **Generate Loop Check Packages**: Automatically generate loop check sheets from instrument index/IO lists, including expected signal ranges, termination details, calibration requirements, and acceptance criteria for each loop type (analog input, analog output, digital input, digital output, serial/fieldbus).

2. **Track Loop Check Execution**: Maintain a real-time loop check tracker showing completion status per system, per area, per loop type, with RAG dashboard and trend analysis toward commissioning milestones.

3. **Rationalize Alarm Database**: Apply ISA-18.2 / IEC 62682 alarm rationalization methodology to the alarm database, classifying each alarm by priority (Critical, High, Medium, Low, Diagnostic), verifying setpoints against process design, and documenting the rationalization basis.

4. **Develop Startup Alarm Strategy**: Create a startup-specific alarm shelving plan that defines which alarms to suppress during each startup phase, which alarms must remain active at all times (safety-critical), and the conditions under which suppressed alarms are automatically re-enabled.

5. **Integrate Loop Check and Alarm Status**: Provide a unified view of instrumentation commissioning readiness that combines loop check completion, alarm rationalization status, and safety instrumented system (SIS) verification into a single readiness metric.

6. **Generate Commissioning Certificates**: Produce loop check completion certificates per system/subsystem that serve as formal evidence for PSSR package (DOC-04) and regulatory compliance.

---

## Trigger / Invocation

### Direct Invocation

```
/manage-loop-checking --project [name] --action [generate|track|rationalize|startup-strategy|report]
```

### Command Variants
- `/manage-loop-checking generate --project [name] --system [system_code]` -- Generate loop check packages
- `/manage-loop-checking track --project [name]` -- Show current loop check status dashboard
- `/manage-loop-checking rationalize --project [name] --system [system_code]` -- Execute alarm rationalization
- `/manage-loop-checking startup-strategy --project [name]` -- Generate startup alarm shelving plan
- `/manage-loop-checking report --project [name] --format [xlsx|pdf|dashboard]` -- Generate status report
- `/manage-loop-checking certificate --project [name] --system [system_code]` -- Generate completion certificate

### Aliases
- `/loop-check`, `/loop-checking`, `/alarm-rationalization`, `/alarm-management`

### Contextual Triggers
- Instrument index / IO list is published or updated
- Commissioning phase begins for a system
- System approaching PSSR readiness (T-30 days triggers alarm rationalization push)
- Alarm database export received from DCS/PLC vendor
- Commissioning manager requests instrumentation readiness assessment
- Agent 8 detects instrumentation gaps during commissioning sequence modeling (R-01)

---

## Input Requirements

### Required Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `instrument_index` | .xlsx / .csv | Engineering / mcp-sharepoint | Complete instrument index listing all instrument tags, types, service descriptions, ranges, P&ID references, and IO assignments |
| `io_list` | .xlsx | DCS/PLC vendor / mcp-sharepoint | Input/Output list mapping instrument tags to controller modules, channels, signal types, and communication protocols |
| `alarm_database` | .xlsx / .csv | DCS/PLC vendor | Current alarm configuration database with tag names, alarm types (HH/H/L/LL/DEV/ROC), setpoints, priorities, and enable/disable status |
| `process_design_basis` | .docx / .xlsx | Process engineering | Process design conditions including normal operating ranges, startup conditions, shutdown conditions, and safety limits for all process variables |
| `project_code` | text | User | Project identifier for file naming and database organization |

### Optional Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `cause_and_effect_matrix` | .xlsx | Engineering | C&E matrix defining safety interlock logic and alarm-to-action relationships |
| `sif_verification_records` | .xlsx | SIS vendor | Safety Instrumented Function test records for SIL-rated loops |
| `cable_schedule` | .xlsx | Electrical engineering | Cable routing and termination details for physical loop verification |
| `vendor_calibration_data` | .pdf / .xlsx | Instrument vendors | Factory calibration certificates for instruments |
| `previous_loop_checks` | .xlsx | Prior project phase | Partial loop check results from earlier commissioning phases |
| `operator_alarm_feedback` | .docx / survey | Operations | Operator input on alarm usefulness from similar facilities |
| `p_and_id_set` | .pdf | Engineering | Current P&IDs for cross-reference during loop verification |

### Input Validation Rules

```yaml
validation:
  instrument_index:
    required_columns: ["tag_number", "instrument_type", "service", "range_min", "range_max", "engineering_unit", "pid_reference", "io_type"]
    min_records: 50
    tag_format_regex: "^[A-Z]{2,4}-\\d{2,5}[A-Z]?$"
  io_list:
    required_columns: ["tag_number", "controller", "module", "channel", "signal_type", "range"]
    must_match: "instrument_index.tag_number"
  alarm_database:
    required_columns: ["tag_name", "alarm_type", "setpoint", "priority", "enabled"]
    priority_values: ["Critical", "High", "Medium", "Low", "Diagnostic", "Journal"]
  process_design_basis:
    must_include: ["normal_operating_range", "startup_range", "safety_limits"]
```

---

## Output Specification

### Deliverable 1: Loop Check Packages (.xlsx per system)

**Filename**: `{ProjectCode}_LoopCheck_{SystemCode}_v{Version}_{YYYYMMDD}.xlsx`

**Workbook Structure**:

#### Sheet: "Loop Check Summary"
| Loop Tag | Type | Description | P&ID | IO Type | Status | Checked By | Date | Certificate |
|----------|------|-------------|------|---------|--------|-----------|------|-------------|
| FT-10001 | Flow Transmitter | SAG Mill Feed Flow | 100-001 | AI | PASS | J. Lopez | 2026-03-15 | LC-100-001 |
| LT-10005 | Level Transmitter | Sump Level | 100-003 | AI | FAIL | M. Silva | 2026-03-16 | -- |

#### Sheet: "Loop Check Sheets" (one per loop)
Individual loop check sheet containing:
- Loop identification (tag, description, P&ID, location)
- Instrument specifications (type, range, signal, manufacturer, model)
- Termination details (field junction box, marshalling cabinet, controller I/O)
- Test procedure (step-by-step verification for loop type)
- Acceptance criteria (accuracy, response time, signal quality)
- Test results (measured values, pass/fail, deviations)
- Signatures (checker, witness, approver)

### Deliverable 2: Alarm Rationalization Register (.xlsx)

**Filename**: `{ProjectCode}_Alarm_Rationalization_{Version}_{YYYYMMDD}.xlsx`

#### Sheet: "Alarm Master Register"
| Tag | Alarm Type | Description | Setpoint | EU | Priority | Consequence of Deviation | Operator Response | Response Time | Classification | Rationalized | Notes |
|-----|-----------|-------------|----------|----|----------|-------------------------|-------------------|---------------|---------------|-------------|-------|
| FT-10001 | HH | SAG Feed Flow Very High | 850 | m3/h | High | Mill overload, potential liner damage | Reduce feed rate, verify scalping screen | 5 min | Safety | Yes | Per HAZOP Rec #12 |
| FT-10001 | H | SAG Feed Flow High | 780 | m3/h | Medium | Approaching capacity limit | Monitor trend, prepare to reduce feed | 15 min | Operational | Yes | |
| FT-10001 | L | SAG Feed Flow Low | 400 | m3/h | Medium | Underloading, inefficient grinding | Check feed conveyor, investigate blockage | 15 min | Operational | Yes | |
| FT-10001 | LL | SAG Feed Flow Very Low | 200 | m3/h | High | Mill running empty risk, liner damage | Stop mill feed, initiate controlled shutdown | 3 min | Safety | Yes | Linked to SIF-100-003 |

#### Sheet: "Alarm Statistics Summary"
| Metric | Before Rationalization | After Rationalization | Target (EEMUA 191) |
|--------|----------------------|----------------------|-------------------|
| Total Configured Alarms | 4,250 | 2,180 | -- |
| Alarms Removed (no value) | -- | 1,420 (33.4%) | >30% typical |
| Alarms Reclassified | -- | 650 (15.3%) | -- |
| Critical Priority | 180 (4.2%) | 95 (4.4%) | <5% |
| High Priority | 680 (16.0%) | 420 (19.3%) | <15% |
| Medium Priority | 1,850 (43.5%) | 1,100 (50.5%) | ~50% |
| Low Priority | 1,540 (36.2%) | 565 (25.9%) | ~30% |

### Deliverable 3: Startup Alarm Shelving Plan (.xlsx + .docx)

**Filename**: `{ProjectCode}_Startup_Alarm_Plan_v{Version}_{YYYYMMDD}.xlsx`

Defines alarm state transitions through startup phases:

| Tag | Alarm | Startup Phase 1 (Cold Commissioning) | Phase 2 (Hot Startup) | Phase 3 (Feed Introduction) | Phase 4 (Ramp-Up) | Phase 5 (Steady State) |
|-----|-------|--------------------------------------|----------------------|---------------------------|-------------------|----------------------|
| FT-10001 HH | Feed Flow VH | SHELVED | SHELVED | ACTIVE | ACTIVE | ACTIVE |
| FT-10001 LL | Feed Flow VL | SHELVED | ACTIVE | ACTIVE | ACTIVE | ACTIVE |
| TT-10012 HH | Bearing Temp VH | ACTIVE | ACTIVE | ACTIVE | ACTIVE | ACTIVE |
| PT-10008 H | Discharge Press H | SHELVED | SHELVED | SHELVED | ACTIVE | ACTIVE |

### Deliverable 4: Loop Check Completion Dashboard (Power BI / Airtable)

**Dashboard Components:**
- Overall loop check completion gauge (% complete with target overlay)
- Completion by system (horizontal bar chart with RAG coding)
- Completion by loop type (AI, AO, DI, DO, Serial)
- Daily/weekly completion trend (line chart with forecast to completion)
- Failed loop punch list (table with priority and resolution status)
- Alarm rationalization progress (% rationalized by system)
- Commissioning readiness scorecard (loop checks + alarms + SIS = overall readiness)

### Deliverable 5: Loop Check Completion Certificates (.pdf)

**Filename**: `{ProjectCode}_LoopCheck_Certificate_{SystemCode}_{YYYYMMDD}.pdf`

Formal certificate stating:
- System identification and boundaries
- Total loops checked and results (pass/fail/deferred)
- Failed loops: punch list reference and resolution plan
- Alarm rationalization status for the system
- Statement of commissioning readiness (instrumentation perspective)
- Signatures: Commissioning Lead, I&C Supervisor, Operations Representative

---

## Methodology & Standards

### Loop Checking Methodology

#### Loop Types and Test Procedures

| Loop Type | Test Method | Acceptance Criteria |
|-----------|------------|-------------------|
| Analog Input (4-20mA) | Inject calibrated signal at sensor; verify reading at DCS within +/-0.5% of span | Signal accurate, trend displays correctly, alarm setpoints trigger at correct values |
| Analog Output (4-20mA) | Command output from DCS; verify at field device (valve position, VSD speed) within +/-1% | Control element responds correctly, feedback signal matches command |
| Digital Input (24VDC) | Simulate field device state change; verify state at DCS within 1 second | Correct state displayed, SOE timestamp accurate |
| Digital Output (24VDC) | Command output from DCS; verify at field device (solenoid, motor start) | Device operates correctly, feedback confirms actuation |
| HART | Verify HART communication, read device configuration, verify diagnostics | All HART parameters readable, device health OK |
| Fieldbus (FF/Profibus) | Verify bus communication, check device status, validate block configuration | Device online, all function blocks executing, diagnostics clear |
| Safety (SIL-rated) | Full SIF test per IEC 61511; verify logic solver, sensor, and final element | SIF operates within specified SIL requirements; documented per SIL verification plan |

#### Loop Check Execution Sequence

1. **Pre-check verification**: Confirm power available, wiring terminated, cable continuity tested
2. **Signal injection**: Apply known input at the field instrument
3. **Signal path verification**: Verify signal at each junction point (JB, marshalling, IO card)
4. **DCS display verification**: Confirm correct reading on operator display
5. **Alarm verification**: Confirm alarms trigger at correct setpoints with correct priority
6. **Control loop verification** (if applicable): Verify PID response in manual mode
7. **Documentation**: Record all test results, sign off, update tracker

### Alarm Rationalization Methodology (ISA-18.2 / IEC 62682)

#### ISA-18.2 Alarm Lifecycle

The skill follows the complete ISA-18.2 alarm lifecycle:

1. **Philosophy**: Establish alarm management philosophy document (principles, goals, metrics)
2. **Identification**: Identify all potential alarm points from P&IDs, HAZOP, C&E matrices
3. **Rationalization**: Systematic review of each alarm against criteria:
   - What is the abnormal condition?
   - What is the consequence if no action is taken?
   - What is the operator action required?
   - What is the available response time?
   - Is this alarm unique or duplicated?
   - Is the setpoint appropriate for the process condition?
4. **Design**: Configure alarms per rationalized requirements (setpoints, priorities, deadbands)
5. **Implementation**: Deploy alarm configuration to DCS/PLC
6. **Operation**: Monitor alarm system performance per EEMUA 191 KPIs
7. **Maintenance**: Ongoing rationalization, bad actor alarm elimination

#### Alarm Priority Classification (per ISA-18.2)

| Priority | Consequence of Missing Alarm | Operator Response Time | Maximum Alarm Rate Contribution |
|----------|----------------------------|----------------------|-------------------------------|
| Critical | Potential fatality, major environmental release, or catastrophic equipment damage | < 5 minutes | < 5% of total alarms |
| High | Potential injury, significant environmental release, or major equipment damage | 5-15 minutes | < 15% of total alarms |
| Medium | Minor injury potential, production impact, or moderate equipment damage | 15-60 minutes | ~ 50% of total alarms |
| Low | No immediate safety impact, minor production or quality impact | > 60 minutes | ~ 30% of total alarms |
| Diagnostic | Equipment health monitoring, no operator action required | Information only | Separate from alarm system (journal) |

#### EEMUA 191 Performance Benchmarks

| Metric | Overloaded | Reactive | Stable | Robust | Target |
|--------|-----------|----------|--------|--------|--------|
| Alarms per operator per 10 min (average) | >10 | 5-10 | 1-5 | <1 | <1 |
| Alarms per operator per 10 min (peak) | >100 | 50-100 | 10-50 | <10 | <10 |
| % time with alarm rate >10/10min | >30% | 10-30% | 1-10% | <1% | <1% |
| Standing alarms | >100 | 50-100 | 10-50 | <10 | <10 |
| Stale alarms (>24h standing) | >50 | 20-50 | 5-20 | <5 | 0 |
| Chattering alarms | >20 | 10-20 | 2-10 | 0 | 0 |
| Alarm floods (>10 alarms/10min) | Daily | Weekly | Monthly | Rare | Rare |

### Applicable Standards

- **ISA-18.2-2016** -- Management of Alarm Systems for the Process Industries
- **IEC 62682:2014** -- Management of alarm systems for the process industries (ISO adoption of ISA-18.2)
- **EEMUA Publication 191** -- Alarm Systems: A Guide to Design, Management and Procurement (3rd Ed.)
- **IEC 61511** -- Functional safety: Safety instrumented systems for the process industry (SIS loop testing)
- **ISA-5.1** -- Instrumentation Symbols and Identification
- **IEC 61131-3** -- Programmable controllers Part 3: Programming languages
- **ISO 14224** -- Petroleum, petrochemical and natural gas industries: Collection and exchange of reliability and maintenance data
- **API RP 554** -- Process Control Systems Functions and Functional Specification Development
- **NAMUR NE 107** -- Self-monitoring and diagnosis of field devices

### Industry Statistics

| Statistic | Source | Year |
|-----------|--------|------|
| 50% of alarms during startup are nuisance alarms | EEMUA / ISA-18.2 | 2020 |
| Operators respond to only 1 in 5 alarms during alarm floods | ASM Consortium | 2019 |
| 30-50% reduction in operator error from effective alarm management | ASM Consortium | 2020 |
| Average alarm count reduced 50-70% through rationalization | Honeywell/Emerson benchmark data | 2022 |
| 76% of plants have not completed formal alarm rationalization | PAS Global Alarm Metrics Report | 2021 |
| Alarm flood contribution to 23% of major process incidents | HSE UK, Investigation data | 2018 |
| Average cost of alarm rationalization: $200-500 per alarm point | Industry benchmarks | 2023 |
| ROI of alarm management program: 5-10x within 2 years | ISA-18.2 committee data | 2020 |

---

## Step-by-Step Execution

### Phase 1: Setup and Data Preparation (Steps 1-4)

**Step 1: Ingest and Validate Instrument Index and IO List**
- Receive instrument index from mcp-sharepoint (engineering document library)
- Validate completeness: every instrument tag must have type, range, P&ID reference, and IO assignment
- Cross-reference with IO list: every tag in instrument index must appear in IO list with valid controller/module/channel assignment
- Flag discrepancies: tags in IO list not in instrument index (orphan IOs), tags in instrument index without IO assignment (unconnected instruments)
- Generate validation report with discrepancy count, resolution actions, and data quality score
- Store validated instrument master in mcp-airtable as the single source of truth

**Step 2: Generate Loop Check Packages by System**
- Group instruments by system/subsystem based on P&ID reference or area code
- For each system, generate loop check package containing:
  - Loop check summary sheet (all loops in the system with status tracking columns)
  - Individual loop check sheets per loop (populated from instrument index and IO list data)
  - Test procedure for each loop type (standardized per methodology above)
  - Acceptance criteria pre-populated from engineering data (ranges, accuracy, response time)
- Calculate statistics: total loops per system, loops by type, estimated testing duration (based on industry norms: 30 min/analog loop, 15 min/digital loop, 60 min/SIL loop)
- Store loop check packages in mcp-sharepoint (commissioning library) and create tracking records in mcp-airtable

**Step 3: Ingest and Validate Alarm Database**
- Receive alarm database export from DCS/PLC vendor (via mcp-sharepoint or direct upload)
- Validate structure: every alarm must have tag, alarm type, setpoint, priority, and enabled/disabled status
- Cross-reference with instrument index: every alarm tag must correspond to a valid instrument
- Flag issues: alarms on non-existent tags, alarms with default (likely incorrect) setpoints, alarms with no priority assigned
- Calculate baseline alarm statistics:
  - Total configured alarms
  - Alarms per operator position (target: < 300 per EEMUA 191)
  - Priority distribution (% Critical/High/Medium/Low)
  - Alarms per P&ID (indicator of over-alarming in specific areas)
- Generate alarm database health report

**Step 4: Obtain Process Design Basis for Alarm Setpoint Verification**
- Retrieve process design basis from mcp-sharepoint (engineering documents)
- For each process variable with alarms:
  - Document normal operating range (startup, steady-state, shutdown)
  - Document safety limits (relief valve settings, design limits)
  - Document control targets (setpoints, operating windows)
- Map alarm setpoints against process conditions:
  - Verify HH alarm < safety limit (must provide warning before safety system activates)
  - Verify H alarm within operational range (not so tight it alarms during normal variation)
  - Verify L alarm provides meaningful early warning of low condition
  - Verify LL alarm provides sufficient time for operator response before safety consequence
- Flag alarms with setpoints outside reasonable range (potential configuration errors)

### Phase 2: Loop Check Execution Management (Steps 5-8)

**Step 5: Coordinate Loop Check Execution Scheduling**
- Interface with commissioning schedule (from model-commissioning-sequence R-01) to align loop check execution with system commissioning sequence
- Generate daily/weekly loop check work plans:
  - Prioritize: safety systems first, then process-critical loops, then monitoring loops
  - Group by physical area to minimize field travel
  - Coordinate with electrical energization schedule (cannot test until power available)
  - Coordinate with DCS commissioning team (cannot test DCS points until controller commissioned)
- Distribute work plans to I&C commissioning teams via mcp-outlook
- Track resource allocation: I&C technicians, test equipment, DCS support

**Step 6: Track Loop Check Progress in Real Time**
- Update mcp-airtable loop check tracker as results are reported:
  - PASS: Loop verified, mark complete with date and checker initials
  - FAIL: Loop failed, create punch list item with failure description, assign for resolution
  - DEFERRED: Loop cannot be tested (prerequisite not met), document reason and expected test date
  - NOT APPLICABLE: Loop removed from scope (with engineering approval documentation)
- Calculate completion metrics:
  - Overall completion % (total and by system)
  - Pass rate (passes / completed tests)
  - Failure rate by category (wiring errors, calibration issues, DCS configuration, instrument defects)
  - Completion velocity (loops completed per day, trending to forecast completion date)
- Update dashboard in mcp-airtable / mcp-powerbi (via track-or-deliverables H-02)
- Generate daily flash report for commissioning management

**Step 7: Manage Failed Loop Resolution**
- For each failed loop check:
  - Classify failure type: wiring error, calibration out-of-tolerance, DCS configuration error, instrument hardware defect, cable damage, junction box issue
  - Assign to responsible party: I&C contractor (wiring), instrument vendor (hardware), DCS vendor (configuration), commissioning team (re-test)
  - Set priority based on loop criticality: safety loops = 24h resolution target, process-critical = 48h, monitoring = 1 week
  - Track resolution progress in mcp-airtable
  - Generate re-test work orders when resolution reported
  - Verify re-test results and update loop check status
- Analyze failure patterns:
  - If >10% failure rate in a system: flag for systemic investigation (bulk wiring issue, wrong cable type, vendor defect batch)
  - Pareto of failure types: drive corrective actions for top failure categories
  - Report failure trends to commissioning management

**Step 8: Verify Safety Instrumented Systems (SIS) Loops**
- For all SIL-rated loops (from cause and effect matrix / SIS specification):
  - Verify loop check completed with enhanced test procedure per IEC 61511
  - Verify SIF function test documented (input-to-output verification through logic solver)
  - Verify proof test results within SIL requirements (response time, accuracy, diagnostic coverage)
  - Verify bypass/override management documented (temporary bypasses for commissioning tracked)
  - Cross-reference with SIF verification records from SIS vendor
- Produce SIS loop verification summary as a separate deliverable for PSSR package
- Flag any SIS loops not fully verified as HOLD items for PSSR

### Phase 3: Alarm Rationalization (Steps 9-12)

**Step 9: Conduct Alarm Rationalization Workshops**
- Organize alarm rationalization sessions by system (typically 50-200 alarms per system):
  - Participants: operations representative, process engineer, instrument engineer, HSE representative
  - Duration: typically 100-150 alarms per 8-hour session (EEMUA 191 guidance)
  - Material: alarm database extract, P&IDs, process design basis, HAZOP study
- For each alarm, systematically determine:
  1. Is this a valid alarm? (Does it require operator action? If not, reclassify as diagnostic or remove)
  2. What is the consequence if the operator does not respond? (Determines priority)
  3. What is the correct operator response? (Must be specific, not "investigate")
  4. What is the available response time? (Determines priority and display requirements)
  5. Is the setpoint correct for process conditions? (Verify against design basis)
  6. Is this alarm duplicated by another alarm? (Eliminate redundancy)
  7. Is the deadband sufficient to prevent chattering? (Minimum 1-2% of span)
- Document rationalization basis for every alarm in the alarm rationalization register
- Track workshop progress and alarm rationalization completion per system

**Step 10: Implement Alarm Configuration Changes**
- Compile all alarm configuration changes from rationalization:
  - Alarms to remove (no operator action required)
  - Alarms to reclassify (change priority based on consequence analysis)
  - Alarms to re-setpoint (adjust based on process design basis verification)
  - Alarms to add (identified during rationalization as missing protection)
  - Deadband adjustments (prevent chattering)
- Produce alarm configuration change request document for DCS vendor
- Verify implementation: compare post-change alarm database against rationalized register
- Run acceptance test: simulate alarm conditions for sample of modified alarms to verify correct behavior
- Update alarm master register with "as-implemented" status

**Step 11: Develop Startup Alarm Shelving Plan**
- Define startup phases for the facility:
  - Phase 1: Cold commissioning (utilities energized, no process media)
  - Phase 2: Hot commissioning (heat-up, catalyst loading, or equivalent pre-startup activities)
  - Phase 3: Process introduction (first feed / hydrocarbons / chemicals introduced)
  - Phase 4: Ramp-up (increasing throughput toward design rate)
  - Phase 5: Steady-state operation (design conditions achieved)
- For each alarm in the rationalized database:
  - Determine the earliest startup phase at which the alarm is meaningful
  - Classify as ACTIVE (alarm operational) or SHELVED (alarm suppressed) for each phase
  - Safety-critical alarms (linked to SIS or HAZOP critical recommendations): NEVER shelved; ACTIVE in all phases
  - Process alarms: shelved during phases where the process variable is expected to be outside normal range
  - Equipment protection alarms (bearing temperature, vibration): ACTIVE from equipment energization onward
- Define automatic transition rules:
  - Phase transition triggers (e.g., "Phase 3 begins when feed flow exceeds 10% of design rate")
  - Automatic un-shelving of alarms as phase transitions occur
  - Maximum shelving duration (no alarm shelved >72 hours without re-authorization)
- Produce startup alarm shelving plan document for operator training and DCS implementation
- Produce DCS configuration specification for alarm shelving automation

**Step 12: Produce Alarm System Performance Baseline**
- Configure alarm system performance monitoring per EEMUA 191 KPIs:
  - Alarm rate per operator per 10-minute period (average, peak, distribution)
  - Standing alarm count (alarms active for >24 hours)
  - Chattering alarm count (alarms that activate >3 times per minute)
  - Stale alarm count (alarms active >7 days)
  - Most frequent alarms (top 10 "bad actor" alarms by count)
  - Alarm priority distribution (should match rationalized plan)
- Set baseline targets for first 30 days of operation
- Configure alarm KPI dashboard in mcp-powerbi for ongoing monitoring
- Schedule 30-day post-startup alarm system review

### Phase 4: Integration and Certification (Steps 13-16)

**Step 13: Generate Integrated Instrumentation Readiness Assessment**
- Compile unified readiness view per system:
  - Loop check completion: X of Y loops passed (Z%)
  - Failed loops: X items on punch list, Y resolved, Z remaining
  - Alarm rationalization: X of Y alarms rationalized (Z%)
  - Alarm configuration: X of Y changes implemented and verified (Z%)
  - SIS verification: X of Y SIFs tested and documented (Z%)
  - Startup alarm plan: Complete/In Progress/Not Started
- Calculate weighted readiness score:
  - SIS verification weight: 3x (safety-critical)
  - Loop checks weight: 2x (functional verification)
  - Alarm rationalization weight: 2x (operational effectiveness)
  - Startup alarm plan weight: 1x (operational efficiency)
- Generate readiness report for commissioning management and PSSR team

**Step 14: Produce Loop Check Completion Certificates**
- For each system where loop checks are 100% complete (or approved deferred items documented):
  - Generate formal loop check completion certificate
  - List all loops tested with results
  - Document any deferred items with approved deferral rationale
  - Obtain signatures: Commissioning I&C Lead, Commissioning Manager, Operations Representative
  - Store certificate in mcp-sharepoint (commissioning records library)
  - Link certificate to PSSR checklist item (for prepare-pssr-package DOC-04)

**Step 15: Support PSSR Package with Instrumentation Evidence**
- Provide to prepare-pssr-package (DOC-04) skill:
  - Loop check completion certificates per system
  - Alarm rationalization register (showing all alarms reviewed and classified)
  - SIS verification summary
  - Startup alarm shelving plan
  - Any open instrumentation punch list items with resolution plans
  - Statement of instrumentation commissioning readiness per system
- Flag any instrumentation-related HOLD items for PSSR (unverified safety loops, un-rationalized safety alarms)

**Step 16: Transition to Operational Alarm Management**
- Hand over alarm rationalization register to operations team as the "Master Alarming Document" (MAD)
- Hand over alarm KPI monitoring configuration to operations
- Configure ongoing alarm performance reporting (monthly alarm system health report)
- Schedule first post-startup alarm rationalization review (typically 90 days after steady-state achieved)
- Document lessons learned from commissioning alarm management for future projects
- Archive all commissioning records in mcp-sharepoint per document retention policy

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Loop Check Coverage | Loops tested / Total loops in scope | 100% | >98% (deferred items documented) |
| Loop Check Pass Rate | Passed loops / Tested loops | >95% | >90% |
| Failed Loop Resolution Time | Average days from fail to re-test pass | <5 days | <10 days |
| SIS Loop Verification | SIL loops fully verified / Total SIL loops | 100% | 100% (non-negotiable) |
| Alarm Rationalization Coverage | Alarms rationalized / Total alarms | 100% | >95% |
| Alarm Reduction | Alarms removed or reclassified / Original alarm count | >30% | >20% |
| Nuisance Alarm Elimination | Nuisance alarms identified and addressed | >90% | >80% |
| Startup Alarm Plan Coverage | Process alarms with startup phase assignment | 100% | >95% |
| Alarm Rate Post-Startup | Average alarms per operator per 10 min (first 30 days) | <5 | <10 |
| Standing Alarms Post-Startup | Standing alarms after 30 days operation | <10 | <25 |
| Data Accuracy | Instrument index to IO list match | 100% | >99% |
| Certificate Completeness | Systems with formal completion certificates | 100% of commissioned systems | >95% |
| Documentation Quality | Alarm rationalization basis documented per alarm | 100% | >95% |
| Tracker Currency | Dashboard data age | <24 hours | <48 hours |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents/skills)

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `model-commissioning-sequence` (R-01) | Commissioning schedule and system sequence for loop check planning | Critical |
| `track-punchlist-items` (R-02) | Punch list tracking system for failed loop items | High |
| `manage-vendor-documentation` (DOC-01) | Vendor instrument data sheets and calibration certificates | High |
| `create-commissioning-plan` | Overall commissioning plan including I&C commissioning scope | High |
| Engineering deliverables (via mcp-sharepoint) | Instrument index, IO list, alarm database, P&IDs, C&E matrix | Critical |
| DCS/PLC vendor | Alarm database export, controller configuration, SIS test records | Critical |

### Downstream Dependencies (Outputs TO other agents/skills)

| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `prepare-pssr-package` (DOC-04) | Loop check certificates, alarm rationalization register, SIS verification summary | When system reaches PSSR readiness |
| `track-or-deliverables` (H-02) | Loop check and alarm rationalization completion metrics for OR tracking | Weekly status update |
| `generate-operating-procedures` (DOC-02) | Alarm response procedures generated from rationalization (operator response column) | After rationalization complete |
| `create-training-plan` | Alarm management training requirements for operators | After startup alarm plan developed |
| `agent-operations` | Startup alarm shelving plan for operator awareness and training | Before initial startup |
| `agent-hse` | Safety alarm classification and SIS verification results | For safety dossier |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `orchestrate-or-program` (H-01) | Status reporting | Loop check and alarm status feeds into overall OR readiness |
| `benchmark-maintenance-kpis` (MAINT-04) | Alarm KPIs | Post-startup alarm performance feeds into KPI benchmarking |
| `map-regulatory-requirements` (COMP-01) | Regulatory mapping | Ensures alarm management meets regulatory requirements |

---

## MCP Integrations

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage for engineering inputs, loop check packages, alarm registers, and certificates"
capabilities:
  - Retrieve instrument index, IO lists, alarm databases, P&IDs from engineering libraries
  - Store loop check packages and completion certificates
  - Store alarm rationalization register and startup alarm plans
  - Manage document revision control for alarm database updates
  - Archive commissioning records
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Step 1: Retrieve instrument index and IO list
  - Step 2: Store generated loop check packages
  - Step 3: Retrieve alarm database export
  - Step 4: Retrieve process design basis documents
  - Step 10: Store alarm configuration change requests
  - Step 14: Store loop check completion certificates
  - Step 16: Archive all commissioning records
```

### mcp-airtable
```yaml
name: "mcp-airtable"
server: "@anthropic/airtable-mcp"
purpose: "Real-time loop check tracking database and alarm rationalization progress tracking"
capabilities:
  - Create and maintain loop check tracker (per-loop status tracking)
  - Track alarm rationalization progress per system
  - Support dashboard views for completion metrics and trends
  - Manage failed loop punch list items
  - Store alarm workshop progress and decisions
  - Generate filtered views by system, status, priority, and type
authentication: API Key
usage_in_skill:
  - Step 1: Store validated instrument master database
  - Step 2: Create loop check tracking records
  - Step 6: Real-time loop check status updates
  - Step 7: Manage failed loop resolution tracking
  - Step 9: Track alarm rationalization workshop progress
  - Step 13: Generate integrated readiness views
```

---

## Templates & References

### Loop Check Sheet Template (Analog Input)

```
=============================================================
LOOP CHECK SHEET - ANALOG INPUT
=============================================================
Project: {ProjectCode}              System: {SystemCode}
Loop Tag: {TagNumber}               P&ID: {PIDRef}
Description: {ServiceDescription}
Location: {Area/Building/Level}

INSTRUMENT SPECIFICATIONS:
  Type: {InstrumentType}           Manufacturer: {Mfr}
  Model: {Model}                   Serial No: {SN}
  Range: {RangeMin} to {RangeMax} {EU}
  Signal: {SignalType} (e.g., 4-20 mA)
  Accuracy: +/- {Accuracy}% of span

TERMINATION PATH:
  Field Device -> JB {JBNumber} TB {TerminalBlock}
  JB -> Marshalling Cabinet {MCNumber} TB {TerminalBlock}
  MC -> Controller {ControllerName} Module {Module} Ch {Channel}

TEST PROCEDURE:
  1. Verify power supply: {ExpectedVoltage}VDC [ ] OK [ ] FAIL
  2. Apply 0% input ({RangeMin} {EU}): DCS reads _____ (expected: {RangeMin})
  3. Apply 25% input: DCS reads _____ (expected: {25%Value})
  4. Apply 50% input: DCS reads _____ (expected: {50%Value})
  5. Apply 75% input: DCS reads _____ (expected: {75%Value})
  6. Apply 100% input ({RangeMax} {EU}): DCS reads _____ (expected: {RangeMax})
  7. Verify alarms:
     - HH alarm at {HHSetpoint}: [ ] Triggered [ ] Not triggered
     - H alarm at {HSetpoint}: [ ] Triggered [ ] Not triggered
     - L alarm at {LSetpoint}: [ ] Triggered [ ] Not triggered
     - LL alarm at {LLSetpoint}: [ ] Triggered [ ] Not triggered
  8. Verify trend display on operator screen: [ ] OK [ ] FAIL
  9. Verify engineering units display: [ ] OK [ ] FAIL

RESULT: [ ] PASS  [ ] FAIL  [ ] DEFERRED

If FAIL - Failure Description: _________________________________
Punch List Reference: _________________________________________

Checked By: _____________ Date: ___________
Witnessed By: ____________ Date: ___________
=============================================================
```

### Alarm Rationalization Workshop Agenda Template

```markdown
## Alarm Rationalization Workshop
## System: {SystemCode} - {SystemDescription}
## Date: {Date}  |  Duration: {Hours} hours

### Attendees
| Name | Role | Signature |
|------|------|-----------|
| {Name} | Operations Representative | |
| {Name} | Process Engineer | |
| {Name} | Instrument Engineer | |
| {Name} | HSE Representative | |

### Material
- Alarm database extract for {SystemCode} ({AlarmCount} alarms)
- P&IDs: {PIDList}
- Process Design Basis (relevant sections)
- HAZOP Study: {HAZOPRef} (relevant nodes)
- ISA-18.2 priority classification criteria

### Process
For each alarm, determine:
1. Valid alarm? (Y/N) -- Does it require operator action?
2. Consequence (Safety/Environmental/Production/Equipment)
3. Priority (Critical/High/Medium/Low/Diagnostic)
4. Operator response (specific action in < 20 words)
5. Response time (minutes)
6. Setpoint verification (correct per design basis?)
7. Deadband (sufficient to prevent chattering?)

### Target
- {AlarmCount} alarms to rationalize
- Expected removal rate: 30-50%
- Estimated pace: 100-150 alarms per 8-hour session
```

### Reference Documents
- ISA-18.2-2016 -- Management of Alarm Systems for the Process Industries
- IEC 62682:2014 -- Management of alarm systems for the process industries
- EEMUA Publication 191 (3rd Edition) -- Alarm Systems: A Guide to Design, Management and Procurement
- IEC 61511-1 -- Functional Safety: Safety Instrumented Systems
- API RP 554 -- Process Control Systems Functions and Functional Specification Development
- CCPS "Guidelines for Safe Automation of Chemical Processes" (2nd Edition)
- ASM Consortium "Effective Alarm Management Practices" (2009)
- PAS Global "State of Alarm Management" annual report
- NAMUR NE 107 -- Self-monitoring and diagnosis of field devices

---

## Examples

### Example 1: Loop Check Progress Dashboard

```
LOOP CHECK STATUS - Cerro Alto Copper Concentrator
================================================================
Report Date: 2026-04-15  |  Target Completion: 2026-05-30

OVERALL PROGRESS:
  Total Loops: 2,450
  Completed:   1,680 (68.6%)  [+185 this week]
  Passed:      1,612 (96.0% pass rate)
  Failed:         68 (awaiting resolution: 23, re-tested: 45)
  Deferred:       42 (prerequisites not met)
  Remaining:     728

  Completion Rate: 37 loops/day -> Forecast: 2026-05-13 (17 days ahead)

BY SYSTEM:
  +------------------+-------+----------+------+--------+-----+
  | System           | Total | Complete | Pass | Failed | RAG |
  +------------------+-------+----------+------+--------+-----+
  | 100 - Crushing   |   320 |   310    | 305  |    5   | GRN |
  | 200 - Grinding   |   480 |   420    | 402  |   18   | GRN |
  | 300 - Flotation  |   520 |   350    | 338  |   12   | AMB |
  | 400 - Thickening |   280 |   200    | 192  |    8   | GRN |
  | 500 - Filtration  |   240 |   150    | 145  |    5   | AMB |
  | 600 - Tailings   |   180 |   120    | 115  |    5   | GRN |
  | 700 - Reagents   |   130 |    80    |  75  |    5   | AMB |
  | 800 - Utilities  |   300 |    50    |  40  |   10   | RED |
  +------------------+-------+----------+------+--------+-----+

FAILURE ANALYSIS:
  Wiring errors:          28 (41.2%)
  Calibration OOT:        15 (22.1%)
  DCS configuration:      12 (17.6%)
  Instrument defect:       8 (11.8%)
  Cable damage:            5 (7.4%)

  Action: Wiring contractor root cause meeting scheduled 2026-04-16.
          Bulk re-inspection of System 800 wiring ordered.
```

### Example 2: Alarm Rationalization Results

```
ALARM RATIONALIZATION SUMMARY - Cerro Alto Copper Concentrator
================================================================
Rationalization Period: 2026-03-01 to 2026-04-10

BEFORE RATIONALIZATION:
  Total Configured Alarms:   5,120
  Alarms per Operator:       640 (4 operator positions)
  EEMUA 191 Assessment:      OVERLOADED

RATIONALIZATION RESULTS:
  Alarms Reviewed:           5,120 (100%)
  Alarms Removed:            1,790 (35.0%)
    - No operator action:      850 (diagnostic only -> journal)
    - Duplicate/redundant:     420 (covered by other alarms)
    - Not valid alarm:         320 (instrument health, not process)
    - Never activates:         200 (setpoint unreachable in practice)
  Alarms Reclassified:         920 (18.0%)
  Setpoints Adjusted:          430 (8.4%)
  Deadbands Added/Adjusted:    680 (13.3%)
  New Alarms Added:             40 (gaps identified during review)

AFTER RATIONALIZATION:
  Total Active Alarms:       3,370
  Alarms per Operator:       843 -> reduced to meaningful alarms only
  Priority Distribution:
    Critical:   145 (4.3%)  -- target <5%    [PASS]
    High:       505 (15.0%) -- target <15%   [PASS]
    Medium:   1,685 (50.0%) -- target ~50%   [PASS]
    Low:      1,035 (30.7%) -- target ~30%   [PASS]

  EEMUA 191 Forecast:        STABLE (target achieved)

STARTUP ALARM PLAN:
  Phase 1 (Cold Commissioning): 1,200 alarms active (35.6%)
  Phase 2 (Hot Startup):        2,100 alarms active (62.3%)
  Phase 3 (Feed Introduction):  2,800 alarms active (83.1%)
  Phase 4 (Ramp-Up):            3,100 alarms active (92.0%)
  Phase 5 (Steady State):       3,370 alarms active (100%)

  Safety alarms ACTIVE in ALL phases: 145 (100% of Critical)
```

### Example 3: Integrated Readiness Assessment

```
INSTRUMENTATION COMMISSIONING READINESS - System 200 (Grinding)
================================================================
Assessment Date: 2026-04-20  |  PSSR Target: 2026-05-05

COMPONENT                    | STATUS    | SCORE  | WEIGHT | WEIGHTED
-----------------------------------------------------------------
Loop Checks Complete         | 420/480   | 87.5%  | 2x     | 175.0
Failed Loops Resolved        | 15/18     | 83.3%  | 2x     | 166.7
Alarm Rationalization        | 480/480   | 100%   | 2x     | 200.0
Alarm Config Implemented     | 460/480   | 95.8%  | 2x     | 191.7
SIS Loop Verification        | 24/24     | 100%   | 3x     | 300.0
Startup Alarm Plan           | Complete  | 100%   | 1x     | 100.0
-----------------------------------------------------------------
WEIGHTED READINESS SCORE:                                    94.4%

READINESS ASSESSMENT: CONDITIONAL READY
  - 60 loops remaining for loop check (estimated 2 days)
  - 3 failed loops pending resolution (pump flow transmitters)
  - 20 alarm config changes pending DCS vendor implementation

RECOMMENDATION: System 200 will be ready for PSSR by 2026-04-25,
5 days ahead of target. Remaining items tracked as punch list.
```
