# Model RAM Simulation

## Skill ID: B-RAM-007

## Version: 1.0.0

## Category: B. Analysis & Modeling

## Priority: P1 - Critical (drives availability targets, redundancy design, and production assurance)

---

## Purpose

Perform Reliability, Availability, and Maintainability (RAM) modeling using Monte Carlo simulation to predict system-level availability, production throughput, and identify bottlenecks in industrial process configurations. This skill quantifies the impact of equipment reliability, redundancy, and maintenance strategy on system performance, supporting design optimization and operational decision-making.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Build** a system reliability block diagram (RBD) from process configuration data.
2. **Assign** reliability parameters (Weibull, exponential, or lognormal distributions) to each block.
3. **Execute** Monte Carlo simulation to model system behavior over the analysis period.
4. **Calculate** system availability, production losses, and bottleneck identification.
5. **Evaluate** design alternatives (redundancy configurations, maintenance strategies).
6. **Generate** `.xlsx` simulation results with statistical summaries and charts.

---

## VSC Failure Modes Table Reference

RAM simulation failure mode inputs MUST align with the official VSC Failure Modes Table (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Equipment failure modes used in reliability block diagrams and Monte Carlo simulations should follow the standard structure: **[WHAT] → [Mechanism] due to [Cause]** (18 mechanisms, 46 causes, 72 combinations). This ensures traceability between RAM models, FMECA, and maintenance strategies.

## Trigger / Invocation

**Command:** `/model-ram-simulation`

**Trigger Conditions:**
- User requests RAM analysis, availability modeling, or production assurance study.
- Design phase needs to evaluate redundancy options.
- Operations need to quantify availability improvement from maintenance strategy changes.
- New project requires production throughput prediction with confidence levels.

**Aliases:**
- `/ram-analysis`
- `/availability-simulation`
- `/monte-carlo-ram`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `system_configuration` | `.xlsx`, text, or diagram description | Process flow and equipment configuration (series, parallel, standby, k-out-of-n) |
| `equipment_reliability_data` | `.xlsx` | Reliability parameters per equipment: distribution type, MTBF/Weibull parameters, MTTR |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `production_rates` | `.xlsx` or text | Throughput capacity per equipment/subsystem |
| `buffer_storage` | `.xlsx` or text | Buffer/stockpile capacities between process stages |
| `maintenance_schedule` | `.xlsx` | Planned shutdown schedule (duration, frequency) |
| `spare_parts_availability` | `.xlsx` | Spare parts lead times and stock levels |
| `repair_crew_constraints` | `.xlsx` or text | Number of repair crews, shift patterns |
| `startup_delays` | `.xlsx` or text | Restart time after failure repair |
| `degraded_modes` | `.xlsx` | Partial capacity operating modes |
| `simulation_parameters` | JSON or text | Number of iterations, simulation period, random seed |
| `design_alternatives` | `.xlsx` | Alternative configurations to compare |

### Equipment Reliability Data - Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `equipment_tag` | Equipment identifier | PU-2301A |
| `distribution_type` | Statistical distribution | Weibull, Exponential, Lognormal |
| `MTTF or Weibull_eta` | Mean time to failure or characteristic life | 8,760 hours |
| `Weibull_beta` | Shape parameter (if Weibull) | 1.8 |
| `MTTR` | Mean time to repair | 12 hours |
| `MTTR_distribution` | Repair time distribution | Lognormal(mu=2.5, sigma=0.6) |
| `configuration` | Series, parallel, standby, k-of-n | 2-of-3 parallel |
| `planned_downtime` | Scheduled maintenance days/year | 14 days |

### Input Validation Rules

1. System configuration must define all equipment and their logical relationships.
2. Every equipment in the configuration must have reliability parameters assigned.
3. MTBF/MTTF must be positive values; Weibull beta must be > 0.
4. MTTR must be positive and physically reasonable (0.5 to 720 hours).
5. Simulation period must be >= 1 year for meaningful statistical results.

---

## Output Specification

### Primary Output: RAM Simulation Results (`.xlsx`)

**File naming:** `{project_code}_RAM_simulation_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Executive Summary` | Key results: system availability, production, confidence intervals |
| `System Results` | System-level availability, throughput, downtime summary |
| `Equipment Results` | Per-equipment availability, failure frequency, downtime contribution |
| `Production Analysis` | Annual production distribution, P10/P50/P90 values |
| `Bottleneck Analysis` | Equipment ranked by impact on system availability |
| `Downtime Breakdown` | Categorized downtime: CM, PM, standby, logistics delays |
| `Sensitivity Results` | Impact of improving individual equipment on system availability |
| `Alternative Comparison` | Comparison of design/strategy alternatives (if applicable) |
| `Simulation Parameters` | All input parameters, assumptions, number of iterations |
| `Convergence Check` | Convergence verification of Monte Carlo simulation |
| `Charts Data` | Data for availability distribution, Pareto, trend charts |

### Key Output Metrics

| Metric | Description |
|--------|-------------|
| `System Availability (Ao)` | Operational availability including PM and CM downtime |
| `System Availability (Ai)` | Inherent availability (CM downtime only) |
| `Mean Production` | Average annual production (tons, m3, MWh, etc.) |
| `P10 Production` | Production at 10th percentile (worst case) |
| `P50 Production` | Production at 50th percentile (most likely) |
| `P90 Production` | Production at 90th percentile (best case) |
| `Mean Downtime Events` | Average number of system downtime events per year |
| `Mean Downtime Hours` | Average annual system downtime hours |
| `Maximum Single Event` | Longest single downtime event observed in simulation |
| `Production Loss Value` | Total production loss in financial terms |
| `Bottleneck Equipment` | Equipment causing the most system downtime |

---

## Methodology & Standards

### Reference Standards

| Standard | Application |
|----------|-------------|
| IEC 61078:2016 | Reliability block diagrams |
| IEC 61165:2006 | Fault tree analysis |
| ISO 14224:2016 | Reliability data |
| IEC 60300-3-1 | Dependability analysis techniques |
| NORSOK Z-016 | Regularity management & reliability technology |
| IEEE 493 (Gold Book) | Reliability of industrial power systems |

### System Configuration Types

#### Series Configuration
```
A --> B --> C
System operates only if ALL components operate.
Availability_sys = A_a * A_b * A_c
```

#### Active Parallel (Redundant)
```
    |--> A --|
X --|--> B --|--> Y
    |--> C --|
System operates if at least one path operates (k-of-n where k=1).
```

#### Standby Redundancy
```
A (active) with B (standby, starts on A failure)
Switchover time and standby failure rate apply.
```

#### k-out-of-n Configuration
```
System requires k of n units to be operational.
Example: 3-of-4 pumps required for full capacity.
```

#### Complex Systems (with buffers)
```
Stage 1 --> [Buffer] --> Stage 2 --> [Buffer] --> Stage 3
Buffers decouple stages, allowing independent operation during short outages.
```

### Monte Carlo Simulation Methodology

```
For each iteration (i = 1 to N):
  1. Generate random failure times for each equipment from its distribution.
  2. Generate random repair times for each equipment from its MTTR distribution.
  3. Simulate the system timeline over the analysis period:
     a. Track equipment states (operating, failed, under repair, standby, PM).
     b. Apply system logic (series/parallel/standby/k-of-n).
     c. Model buffer effects (accumulation and depletion).
     d. Record system state transitions.
  4. Calculate system metrics:
     - Availability = uptime / total time
     - Production = sum of throughput during uptime (accounting for partial capacity)
     - Downtime events = count of system failure events

After N iterations:
  Calculate statistical summaries:
  - Mean, standard deviation, percentiles (P10, P50, P90)
  - Confidence intervals
  - Verify convergence (mean stabilization)
```

### Simulation Parameters (Defaults)

| Parameter | Default | Range |
|-----------|---------|-------|
| Number of iterations | 10,000 | 1,000 - 100,000 |
| Simulation period | 10 years | 1 - 30 years |
| Time step | 1 hour | 0.1 - 24 hours |
| Confidence level | 90% | 80% - 99% |
| Random seed | Auto | User-defined for reproducibility |

### Convergence Criteria

The simulation has converged when:
- Mean availability changes by < 0.1% between consecutive 1,000-iteration blocks.
- Standard deviation of the mean < 0.5% of the mean value.
- P10 and P90 values stabilize within 1% of their final values.

---

## Step-by-Step Execution

### Phase 1: Model Construction (Steps 1-4)

**Step 1: Parse system configuration.**
- Interpret the system configuration into a reliability block diagram structure.
- Identify series, parallel, standby, and k-of-n relationships.
- Map buffer/storage elements between process stages.
- Validate that the configuration is logically complete (no orphaned equipment).

**Step 2: Assign reliability parameters.**
- Map equipment reliability data to the block diagram.
- Validate distribution parameters (beta, eta, MTTR, etc.).
- For equipment without data, assign generic parameters from ISO 14224/OREDA with noted uncertainty.
- Define planned maintenance schedule impacts.

**Step 3: Define production model.**
- Assign throughput capacity to each process stage.
- Define partial capacity operating modes (if applicable).
- Model buffer capacities and fill/depletion rates.
- Define system-level production calculation logic.

**Step 4: Configure simulation parameters.**
- Set number of iterations (default 10,000).
- Define simulation period.
- Set random seed for reproducibility.
- Configure repair crew constraints and spare parts delays.

### Phase 2: Simulation Execution (Steps 5-7)

**Step 5: Run Monte Carlo simulation.**
- Execute the simulation for the specified number of iterations.
- For each iteration, simulate the full analysis period.
- Track all equipment and system state transitions.
- Calculate per-iteration metrics (availability, production, downtime).

**Step 6: Verify convergence.**
- Check convergence criteria after every 1,000 iterations.
- If not converged, continue simulation up to maximum iterations.
- Report convergence status in output.
- If not converged, recommend increasing iterations.

**Step 7: Calculate statistical results.**
- Compute mean, standard deviation, percentiles for all metrics.
- Calculate confidence intervals for key metrics.
- Identify bottleneck equipment (largest contribution to system downtime).
- Compute sensitivity of system availability to individual equipment improvements.

### Phase 3: Analysis & Output (Steps 8-10)

**Step 8: Perform bottleneck analysis.**
- Rank equipment by contribution to system downtime.
- Create Pareto chart of downtime contributors.
- Calculate "improvement potential" - impact of improving each equipment by 10%.
- Identify redundancy effectiveness (does added redundancy deliver expected benefit?).

**Step 9: Compare alternatives (if applicable).**
- Run simulation for each design/strategy alternative.
- Calculate differential availability and production.
- Quantify the value of each alternative (production gain * unit value).
- Rank alternatives by benefit/cost ratio.

**Step 10: Build output workbook.**
- Populate all sheets with simulation results.
- Create chart data for distribution histograms, Pareto, trend plots.
- Document all parameters, assumptions, and methodology.
- Provide clear executive summary with key decisions supported.

---

## Quality Criteria

### Model Validity
- [ ] System configuration correctly represents the physical process.
- [ ] All equipment have appropriate reliability parameters assigned.
- [ ] Buffer effects are correctly modeled (if applicable).
- [ ] Planned maintenance downtime is included.
- [ ] Repair crew constraints are realistic.

### Statistical Rigor
- [ ] Simulation has converged (convergence check passed).
- [ ] Sufficient iterations for stable percentile estimates (minimum 5,000 for P10/P90).
- [ ] Confidence intervals are reported for key metrics.
- [ ] Random seed is documented for reproducibility.

### Practical Relevance
- [ ] Results are consistent with operational experience (if available).
- [ ] Bottleneck identification aligns with engineering judgment.
- [ ] Production estimates are physically achievable.
- [ ] Recommendations are operationally implementable.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-reliability` (B-REL-004) | Weibull parameters, MTBF, MTTR | Equipment reliability input |
| `analyze-equipment-criticality` (B-CRIT-001) | Critical equipment list | Focus RAM on critical equipment |
| `extract-data-from-docs` (C-EXT-014) | Equipment data from P&IDs, datasheets | System configuration input |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `analyze-scenarios` (B-SCEN-002) | Availability scenarios | What-if analysis |
| `analyze-lifecycle-cost` (B-LCC-003) | Downtime costs, availability impact | LCC production loss component |
| `model-opex-budget` (B-OPEX-008) | Maintenance frequency from simulation | OPEX budget inputs |
| `create-client-presentation` (C-PRES-012) | RAM results, charts | Client deliverable |

---

## Templates & References

### Templates
- `templates/ram_simulation_template.xlsx` - Standard RAM workbook with input sheets.
- `templates/rbd_template.xlsx` - Reliability block diagram documentation template.
- `templates/reliability_data_generic.xlsx` - Generic reliability data from OREDA/IEEE 493.

### Reference Documents
- VSC internal: "Metodologia de Modelamiento RAM v2.0"
- NORSOK Z-016:2003 - Regularity management & reliability technology
- OREDA Handbook - Offshore and Onshore Reliability Data
- IEEE 493 Gold Book - Reliability of industrial power systems

---

## Examples

### Example 1: Copper Concentrator Availability Study

**Input:**
- System: SAG mill - Ball mill - Cyclones - Flotation - Thickener (series with some parallel).
- Configuration: 1x SAG, 2x Ball Mill (parallel, both needed for capacity), 12x flotation cells (9-of-12 needed).
- Equipment data: SAG MTBF 1,200h, Ball Mill MTBF 3,500h, Flotation Cell MTBF 8,000h.
- Planned downtime: 14 days/year plant shutdown.
- Simulation: 10,000 iterations, 10-year period.

**Expected Output:**
- System availability (Ao): 89.2% (P10: 86.5%, P50: 89.3%, P90: 91.8%).
- Bottleneck: SAG mill (contributes 45% of unplanned downtime).
- Annual production: P50 = 16.3M tons, P10 = 15.1M tons.
- Recommendation: SAG mill gearbox reliability improvement would increase system availability by 1.8%.

### Example 2: Desalination Plant Design Optimization

**Input:**
- Three design alternatives for RO train configuration: 3x50%, 2x75%, 4x33%.
- Each with different CAPEX but same total capacity.
- Equipment reliability from generic data (OREDA + manufacturer guarantees).
- Target: 95% minimum availability with 90% confidence.

**Expected Output:**
- 3x50%: Ao = 97.2% (P10: 95.8%) - meets target, moderate CAPEX.
- 2x75%: Ao = 93.1% (P10: 90.2%) - does NOT meet target at 90% confidence.
- 4x33%: Ao = 98.5% (P10: 97.1%) - exceeds target, highest CAPEX.
- Recommendation: 3x50% configuration provides best balance of reliability and cost.
- Incremental CAPEX for 4x33% vs 3x50%: USD 18M; incremental availability: 1.3%.
