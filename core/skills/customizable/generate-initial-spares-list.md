# Generate Initial Spare Parts List

## Skill ID: K-01
## Version: 1.0.0
## Category: K. Procurement Intelligence
## Priority: P1 - High

---

## Purpose

Generate a comprehensive initial spare parts list for a capital project transitioning to operations, using equipment register data, FMECA analysis, vendor recommendations, and VED/ABC classification methodology. This skill produces a categorized, budgeted, and procurement-sequenced spare parts inventory that covers insurance spares (catastrophic failure), commissioning spares (startup support), and 2-year operational spares (routine maintenance) -- ensuring the new or expanded facility has the right parts, in the right quantities, at the right time, for the right cost.

Spare parts readiness is one of the most frequently underestimated and late-delivered elements of Operational Readiness. Industry data from the Corporate Pain Points Research Report paints a clear picture of the problem:

**Pain Point D-04: 30-40% of spares arrive late for commissioning.** Deloitte's research finds that initial spare parts procurement is consistently one of the last OR workstreams to be addressed, creating a dangerous gap between when equipment is commissioned and when replacement parts are available. When a critical pump fails during ramp-up and the spare impeller has a 24-week lead time, the $12,000 part costs the project $45 million per month in lost production while it is on order.

The spare parts problem compounds across multiple dimensions:

- **Late identification:** Spare parts lists are often not generated until detailed engineering is nearly complete, leaving insufficient lead time for procurement of long-lead items (some components require 12-18 months)
- **Incomplete coverage:** Vendor recommended spare parts lists (VRSL) typically cover only 60-70% of actual needs; the remaining 30-40% must be identified through FMECA-based analysis of failure modes and maintenance strategies
- **Over-specification combined with under-specification:** Projects simultaneously carry 25-30% excess inventory in fast-moving items while lacking critical insurance spares (Pain Point P-03: 15-25% excess MRO inventory)
- **Budget competition:** Spare parts budgets compete with EPC contingency, and are frequently cut during value engineering exercises without understanding the consequence on operational availability
- **Warehouse readiness:** Parts arrive before the warehouse is ready, or the warehouse is ready but parts have not arrived -- logistical coordination failures
- **Data quality:** Spare parts data (part numbers, specifications, interchangeability) is inconsistent between vendor catalogs, engineering databases, and procurement systems

The economic case for getting spare parts right is compelling. SMRP Best Practice 5.5 (Inventory Management) establishes that optimal spare parts investment for a well-managed plant is 0.5-1.5% of Replacement Asset Value (RAV). For a $4.5 billion mining project, this translates to $22.5M-$67.5M in spare parts inventory -- a significant investment that must be optimized, not guessed at. Industry data shows that the cost of stockout (emergency procurement, expediting, lost production) is 5-20x the cost of carrying the spare part in inventory, while the cost of excess inventory ties up capital and consumes warehouse space.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **Equipment Register Parsing**: Ingest the complete equipment register (from create-asset-register skill or client data) and classify every equipment item by type, criticality, and spare parts requirement level. The register provides the "denominator" -- ensuring no equipment is overlooked in the spare parts analysis.

2. **FMECA-Based Spare Parts Identification**: For every equipment item with Criticality A or B rating, cross-reference the FMECA analysis (from develop-maintenance-strategy, J-01) to identify:
   - Components subject to planned replacement (scheduled discard tasks)
   - Components subject to condition-based replacement (on-condition tasks with known replacement items)
   - Components required for corrective maintenance of anticipated failure modes
   - This approach ensures spare parts are linked to specific failure modes, not just generic vendor recommendations.

3. **Vendor Recommended Spare Parts List (VRSL) Integration**: Incorporate vendor-recommended spare parts from equipment purchase orders and vendor manuals. VRSLs are the starting point but NOT the final answer -- they must be validated against FMECA findings and operating context. Vendors tend to over-recommend consumables (their revenue source) and under-recommend strategic spares (expensive items customers resist buying).

4. **VED/ABC Classification**: Apply dual-dimension classification to every spare part:
   - **VED (Vital-Essential-Desirable)**: Based on operational criticality of the equipment that uses the part and the consequence of not having the part when needed
   - **ABC (by value)**: Based on annual consumption value (unit cost x annual usage)
   - The VED-ABC matrix determines inventory policy: V-A items get highest service levels, D-C items get minimum stocking or no stock

5. **Insurance Spares Identification**: Identify long-lead, high-value components that must be held as insurance against catastrophic failure. Criteria: lead time >6 months, replacement cost >$50,000 or >10% of equipment cost, failure results in >$1M production loss, no alternative source available. Insurance spares are typically capital items, not expensed.

6. **Commissioning Spares Identification**: Identify parts likely to be consumed during commissioning and startup: gaskets, seals, filters, instrument elements, wear parts that may fail during initial operation. Commissioning spares are additional to operational spares and must be on-site before commissioning begins.

7. **Procurement Sequencing**: Sequence spare parts procurement based on lead time, commissioning date, and criticality to ensure parts arrive when needed -- not too early (warehouse not ready, storage degradation) and not too late (commissioning without spares).

8. **Budget Development**: Calculate the total initial spare parts investment by category (insurance, commissioning, 2-year operational), by system, and by procurement phase. Provide comparison against industry benchmarks (SMRP: 0.5-1.5% of RAV for operational spares; insurance spares additional).

---

## Trigger / Invocation

```
/generate-initial-spares-list
```

**Aliases**: `/spares-list`, `/initial-spares`, `/spare-parts-list`, `/lista-repuestos-inicial`

**Primary Trigger Commands:**
- `generate-initial-spares-list full --project [name] --equipment-register [file]`
- `generate-initial-spares-list by-system --project [name] --system [system-code]`
- `generate-initial-spares-list insurance --project [name]`
- `generate-initial-spares-list commissioning --project [name]`
- `generate-initial-spares-list budget --project [name]`
- `generate-initial-spares-list long-lead --project [name]`
- `generate-initial-spares-list vendor-review --project [name] --vendor [vendor-name]`

**Trigger Conditions:**
- Detailed engineering reaches 60%+ completion (equipment register stabilized)
- Equipment purchase orders placed (vendor recommended spare parts lists available)
- FMECA analysis completed for critical equipment (maintenance strategy available)
- Commissioning plan developed (timeline for spare parts delivery known)
- OR Orchestrator (H-01) assigns spare parts workstream to agent-procurement
- Budget allocation for initial spare parts approved

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Equipment Register | create-asset-register / mcp-sharepoint | Yes | Master equipment list with functional hierarchy, tag numbers, equipment types, OEM, model numbers, and criticality ratings |
| Equipment Criticality Ratings | analyze-equipment-criticality / develop-maintenance-strategy (J-01) | Yes | A/B/C criticality classification for all equipment items |
| Project Timeline | mcp-project-online | Yes | Commissioning start date, commercial operation date, mechanical completion dates by system |
| Design Capacity Parameters | Engineering documentation | Yes | Nameplate capacity, throughput, product -- for production loss calculations |
| Financial Parameters | agent-finance | Yes | Product value per unit, operating cost, discount rate -- for stockout cost calculations |

### Strongly Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| FMECA Workbook | develop-maintenance-strategy (J-01) | Failure modes, recommended maintenance tasks, replacement components, and task frequencies |
| Vendor Recommended Spare Parts Lists (VRSL) | Vendor technical proposals / mcp-sharepoint | OEM-recommended spare parts lists from equipment purchase orders |
| Vendor O&M Manuals | manage-vendor-documentation (I-01) | Parts catalogs, cross-reference drawings, bill of materials from vendor documentation |
| Maintenance Strategy Report | develop-maintenance-strategy (J-01) | PM task list with material requirements, CBM program, overhaul specifications |
| Equipment Datasheets | Engineering / mcp-sharepoint | Technical specifications including materials of construction, operating conditions, duty cycle |
| Process Flow Diagrams | Engineering / mcp-sharepoint | Process design, series/parallel equipment configurations, redundancy |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Existing Spare Parts Catalog | mcp-erp (SAP MM) | If brownfield/expansion: current spare parts master data | Greenfield (no existing catalog) |
| Industry Failure Rate Data | OREDA / IEEE 493 | Generic failure rates by equipment type for consumption estimation | OREDA 6th edition defaults |
| Site Logistics Data | Client | Warehouse location, storage conditions, transportation constraints | Standard industrial warehouse assumed |
| Corporate Inventory Policy | Client | Min/Max policies, service level targets, carrying cost rates | SMRP best practice defaults |
| Insurance Requirements | Risk/Insurance team | Insurance underwriter requirements for spare parts coverage | Standard industrial practice |
| Budget Constraints | Client / agent-finance | Maximum initial spare parts investment | Unconstrained; benchmark comparison provided |

### Configuration Schema
```yaml
spares_config:
  project_code: "PRJ-001"
  project_name: "Sierra Verde Copper Expansion"
  industry: "mining"
  sub_sector: "copper_concentrator"

  rav_estimate: 4500000000  # Replacement Asset Value (USD)
  commissioning_start: "2027-07-01"
  commercial_operation: "2028-01-01"

  classification:
    ved_categories:
      vital: "Equipment failure causes safety incident, environmental release, or >$1M/day production loss"
      essential: "Equipment failure causes $100K-$1M/day production loss or significant quality impact"
      desirable: "Equipment failure causes <$100K/day impact, workaround available"
    abc_thresholds:
      A_above: 80  # Top 20% of items by annual value = 80% of total value
      B_between: [80, 95]  # Next 15% of items = 15% of total value
      C_below: 95  # Bottom 65% of items = 5% of total value

  inventory_policy:
    service_level_VA: 0.99  # 99% for Vital-A items
    service_level_VB: 0.98
    service_level_EA: 0.97
    service_level_EB: 0.95
    service_level_others: 0.90
    carrying_cost_rate: 0.25  # 25% of item value per year
    reorder_lead_time_safety: 1.5  # Safety factor on quoted lead time

  insurance_spares:
    lead_time_threshold_months: 6
    cost_threshold_usd: 50000
    production_loss_threshold_usd_day: 1000000

  commissioning_spares:
    quantity_multiplier: 1.5  # 1.5x normal consumption rate during commissioning
    coverage_months: 3  # 3 months of commissioning support

  operational_spares:
    coverage_years: 2  # 2 years of operational spares
    reorder_method: "min_max"  # min_max, eoq, kanban
```

---

## Output Specification

### Primary Output: Initial Spare Parts Master List (.xlsx)

**Filename:** `{ProjectCode}_Initial_Spares_List_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Executive Summary"
- Total spare parts count by category (insurance, commissioning, 2-year operational)
- Total investment by category and by system
- VED/ABC distribution matrix with item counts and values
- Comparison against industry benchmarks (% of RAV)
- Long-lead items requiring immediate procurement action
- Key risks and recommendations

#### Sheet 2: "Insurance Spares"
| # | Part Description | Equipment Tag | Equipment Description | OEM | OEM Part # | Specification | Qty | Unit Cost ($) | Total Cost ($) | Lead Time (weeks) | Justification | Production Loss ($/day) | Order By Date |
|---|-----------------|---------------|----------------------|-----|-----------|--------------|-----|--------------|---------------|-------------------|---------------|------------------------|---------------|

#### Sheet 3: "Commissioning Spares"
| # | Part Description | Equipment Tag | Equipment Description | OEM | OEM Part # | Specification | Qty | Unit Cost ($) | Total Cost ($) | Lead Time (weeks) | Required By Date | System | Failure Mode Reference |
|---|-----------------|---------------|----------------------|-----|-----------|--------------|-----|--------------|---------------|-------------------|-----------------|--------|----------------------|

#### Sheet 4: "2-Year Operational Spares"
| # | Part Description | Equipment Tag | Equipment Description | OEM | OEM Part # | Specification | VED | ABC | Qty/Year | 2-Year Qty | Unit Cost ($) | Total Value ($) | Min Stock | Max Stock | Reorder Point | Lead Time (weeks) | Source (FMECA/VRSL/Generic) | PM Task Reference |
|---|-----------------|---------------|----------------------|-----|-----------|--------------|-----|-----|---------|-----------|--------------|---------------|-----------|-----------|---------------|-------------------|-----------------------------|-------------------|

#### Sheet 5: "VED-ABC Matrix"
Cross-tabulation of all spare parts by VED and ABC classification:

|  | A (High Value) | B (Medium Value) | C (Low Value) | Total |
|--|---------------|-----------------|--------------|-------|
| Vital | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX |
| Essential | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX |
| Desirable | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX |
| Total | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX | Items: XX, Value: $XX |

Inventory policy matrix:
| VED-ABC | Service Level | Reorder Method | Safety Stock | Review Frequency |
|---------|--------------|---------------|--------------|-----------------|
| V-A | 99% | Min-Max with safety stock | 2x lead time demand | Weekly |
| V-B | 98% | Min-Max | 1.5x lead time demand | Bi-weekly |
| V-C | 97% | Reorder point | 1x lead time demand | Monthly |
| E-A | 97% | Min-Max | 1.5x lead time demand | Bi-weekly |
| E-B | 95% | Min-Max | 1x lead time demand | Monthly |
| E-C | 93% | Reorder point | 0.5x lead time demand | Monthly |
| D-A | 90% | EOQ | Minimal | Quarterly |
| D-B | 85% | Reorder point | None | Quarterly |
| D-C | 80% | No stock / purchase on demand | None | N/A |

#### Sheet 6: "Long-Lead Items"
Items requiring procurement action within 30 days, sorted by criticality:
| Priority | Part Description | Equipment Tag | Lead Time (weeks) | Required By | Order By (Latest) | Status | PO Number |
|----------|-----------------|---------------|-------------------|-------------|-------------------|--------|-----------|

#### Sheet 7: "Procurement Schedule"
Month-by-month procurement timeline:
| Month | Items to Order | Estimated Cost | Cumulative Cost | Items Arriving | Cumulative Received |
|-------|---------------|---------------|----------------|----------------|-------------------|

#### Sheet 8: "Budget Summary"
| Category | Item Count | Total Value ($) | % of RAV | Industry Benchmark | Variance |
|----------|-----------|----------------|---------|-------------------|----------|
| Insurance Spares | XX | $X,XXX,XXX | X.XX% | 0.2-0.5% RAV | Within/Over/Under |
| Commissioning Spares | XX | $X,XXX,XXX | X.XX% | $500-2,000/equip | Within/Over/Under |
| 2-Year Operational Spares | XX | $X,XXX,XXX | X.XX% | 0.5-1.5% RAV | Within/Over/Under |
| **Total** | **XX** | **$X,XXX,XXX** | **X.XX%** | **0.8-2.5% RAV** | -- |

#### Sheet 9: "By-System Summary"
| System Code | System Name | Equipment Count | Spares Count | Insurance ($) | Commissioning ($) | Operational ($) | Total ($) |
|-------------|------------|----------------|-------------|--------------|-------------------|----------------|-----------|

#### Sheet 10: "Data Sources & Traceability"
For each spare part: source of identification (FMECA failure mode, VRSL, generic database, SME recommendation), confidence level, and assumptions.

### Formatting Standards
- Header row: Bold, dark green background (#006633), white font
- Insurance spares: Blue row highlight (#E6F0FF)
- Commissioning spares: Yellow row highlight (#FFFCE6)
- Long-lead items (>26 weeks): Red flag icon in lead time column
- VED classification: V=Red text, E=Amber text, D=Green text
- ABC classification: A=Bold, B=Normal, C=Italic
- All monetary values formatted with thousand separators and 2 decimal places
- Part numbers and specifications in monospace font for clarity

---

## Methodology & Standards

### Primary Standards

| Standard | Application |
|----------|-------------|
| **ISO 14224:2016** | Equipment taxonomy and failure coding -- ensures spare parts are linked to standardized failure modes |
| **ISO 55001:2014** | Asset management -- lifecycle cost perspective for inventory investment decisions |
| **SMRP Best Practice 5.5** | Inventory Management -- benchmark targets for spare parts investment as % of RAV |
| **SMRP Best Practice 5.5.1** | MRO Inventory Value as % of RAV: target 0.5-1.5% |
| **VED Analysis (Vital-Essential-Desirable)** | Criticality-based classification standard for spare parts in process industries |
| **ABC Analysis (Pareto)** | Value-based classification: 80/20 rule applied to annual consumption value |
| **SAE JA1011/JA1012** | RCM standard -- spare parts requirements derived from maintenance task analysis |

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** Every spare part in the initial spares list MUST be traceable to one or more specific failure modes from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Spare parts that cannot be linked to a standardized failure mode must be flagged for review and justified separately.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. Each spare part exists because a specific component can fail in a specific way. The failure mode driving the spare part requirement MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component that fails and requires the spare part | Pump Impeller |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Wears |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Abrasive media (slurry particles) |

**Complete failure mode definition:** *"Pump Impeller Wears due to Abrasive media (slurry particles)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in the initial spares list, insurance spare justifications, and FMECA traceability columns MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for Initial Spares Lists

1. **Spares-to-Failure-Mode Traceability:** The primary workbook sheets (Insurance Spares, Commissioning Spares, 2-Year Operational Spares) MUST include a `Failure_Mode_Reference` column linking each spare part to the specific failure mode(s) from the VSC Failure Modes Table that justify its inclusion, using the format "[Mechanism] due to [Cause]".
2. **FMECA-Derived Spares (Step 2):** When extracting spare parts from FMECA analysis, the failure mode ID and full failure mode name from the VSC table MUST be preserved in the traceability chain — from FMECA row to spare part line item.
3. **Insurance Spare Justifications (Sheet 2):** Each insurance spare's "Justification" field MUST reference the catastrophic failure mode it protects against, using official table nomenclature — e.g., "Breaks/Fracture/Separates due to Fatigue (cyclic loading)" rather than "gear breaks".
4. **Commissioning Spares (Sheet 3):** The `Failure Mode Reference` column MUST identify which failure modes are anticipated during startup that drive the commissioning spare requirement.
5. **VRSL Validation Against FMECA (Step 3):** When validating vendor-recommended spare parts against FMECA findings, the comparison MUST be done at the failure mode level — matching VRSL items to specific VSC Failure Modes Table entries.
6. **No Ad-Hoc Descriptions:** Free-text failure descriptions such as "pump fails", "bearing goes bad", or "seal leaks" are NOT acceptable in any column or justification. All references must use the standardized three-part structure.
7. **Data Sources & Traceability Sheet (Sheet 10):** The traceability sheet MUST include the full VSC Failure Modes Table reference for each spare part, ensuring end-to-end auditability from failure mode to stocked spare.
8. **Consistency Across Deliverables:** Failure mode references in the initial spares list MUST be identical to those in the upstream FMECA workbook and maintenance strategy — no paraphrasing or abbreviation.

### Spare Parts Category Definitions

**Insurance Spares:**
- Long-lead, high-value components held against catastrophic or random failure
- Examples: gearbox assemblies, motor rotors, compressor rotors, large castings, transformer windings
- Typically capitalized (not expensed), stored in climate-controlled environment
- Quantity: usually 1 per equipment item (or 1 per fleet if multiple identical units)
- Decision criteria: Lead time > 6 months AND (replacement cost > $50,000 OR production loss > $1M/day)
- Industry benchmark: 0.2-0.5% of RAV

**Commissioning Spares:**
- Parts likely to be consumed during commissioning and startup
- Examples: gaskets, seals, filters, instrument elements, fuses, wear plates, calibration gases
- Quantity: 1.5x normal consumption rate for 3-month commissioning period
- Includes: initial charge items (lubricants, chemicals, catalysts), first-fill items
- Must be on-site before commissioning begins
- Industry benchmark: $500-$2,000 per equipment item

**2-Year Operational Spares:**
- Routine maintenance parts for planned and anticipated unplanned maintenance
- Examples: bearings, seals, gaskets, V-belts, filter elements, instrument transmitters, pump impellers
- Quantity: calculated from PM task frequencies, FMECA failure rates, and service level targets
- 2-year horizon provides buffer for establishing reorder patterns and local procurement sources
- Industry benchmark: 0.5-1.5% of RAV for annual consumption

### Min-Max Inventory Methodology

```
Minimum Stock Level = (Average Daily Demand x Lead Time in Days) + Safety Stock
Maximum Stock Level = Minimum Stock + Economic Order Quantity (EOQ)
Reorder Point = Minimum Stock Level
Safety Stock = Z-score x Standard Deviation of Demand x Square Root of Lead Time

Where:
  Z-score corresponds to target service level:
    99% -> Z = 2.33
    97% -> Z = 1.88
    95% -> Z = 1.65
    90% -> Z = 1.28
```

### Industry Benchmarks

| Metric | World-Class | Top Quartile | Median | Bottom Quartile |
|--------|------------|--------------|--------|-----------------|
| MRO Inventory Value (% RAV) | 0.5-0.8% | 0.8-1.2% | 1.5-2.5% | >3.0% |
| Stockout Rate (critical items) | <1% | 1-3% | 5-10% | >15% |
| Inventory Turnover Ratio | 1.5-2.5x | 1.0-1.5x | 0.6-1.0x | <0.5x |
| Obsolete Inventory | <3% | 3-5% | 8-15% | >20% |
| Emergency Purchase Orders | <5% | 5-10% | 15-25% | >30% |
| Insurance Spares Coverage | >95% critical | >90% | 70-85% | <65% |

---

## Step-by-Step Execution

### Phase 1: Data Acquisition & Equipment Analysis (Steps 1-4)

**Step 1: Ingest and Validate Equipment Register**
1. Import equipment register from mcp-sharepoint or mcp-erp
2. Validate hierarchy: Plant > Area > System > Equipment > Component
3. Verify mandatory fields: tag number, description, equipment type, OEM, model number
4. Cross-reference with criticality ratings (from analyze-equipment-criticality)
5. Count equipment by type: rotating, static, electrical, instrumentation, structural
6. Identify equipment families (identical or similar units): enables fleet-level spare parts strategy
7. Flag equipment without OEM/model data (spare parts identification will be limited)
8. Generate equipment summary: total count, by type, by criticality, by system

**Step 2: Ingest FMECA and Maintenance Strategy Data**
1. Import FMECA workbook from develop-maintenance-strategy (J-01) via mcp-sharepoint
2. Extract scheduled discard tasks: identify components with planned replacement intervals
3. Extract on-condition tasks: identify components that may need replacement based on condition
4. Extract corrective maintenance expectations: identify components prone to random failure
5. Map each maintenance task to required spare parts and materials
6. Calculate annual consumption rate for each component:
   - Scheduled replacement: quantity per event x events per year
   - On-condition replacement: probability of replacement per inspection x inspections per year
   - Corrective replacement: failure rate x mean quantity per repair event
7. Flag equipment items in the register that have NO FMECA (typically Criticality C): apply generic spare parts approach

**Step 3: Ingest Vendor Recommended Spare Parts Lists (VRSL)**
1. Collect VRSLs from vendor technical proposals and O&M manuals via mcp-sharepoint
2. Parse VRSLs into standardized format: part number, description, specification, recommended quantity, unit cost, lead time
3. Cross-reference VRSL items with equipment register tag numbers
4. Categorize VRSL items by vendor category:
   - Commissioning/startup spares (for initial operation)
   - 1-year operational spares
   - 2-year operational spares
   - Insurance/capital spares
5. Flag VRSLs that are missing (not all vendors provide comprehensive lists)
6. Flag equipment where VRSL is the ONLY source of spare parts data (no FMECA available)
7. Critically evaluate VRSL quantities: compare against FMECA consumption rates
   - Overspecified: VRSL quantity > 2x FMECA-calculated quantity (may reduce)
   - Underspecified: VRSL missing items identified in FMECA (must add)
   - Absent: VRSL item has no FMECA correlation (evaluate: consumable/genuine need vs. vendor upselling)

**Step 4: Build Interchangeability and Standardization Register**
1. Identify common components across equipment fleet:
   - Same bearings used in multiple pumps
   - Same seals/gaskets across valve families
   - Same V-belts/coupling elements across drives
   - Same instrument transmitters across measurement points
2. Group interchangeable items to enable pooled inventory:
   - One stock item serves multiple equipment items
   - Reduces total inventory by 15-30% compared to equipment-specific stocking
3. Identify standardization opportunities:
   - Non-standard components that could be replaced with standard equivalents during commissioning
   - Multiple similar-but-different components that could be rationalized to one specification
4. Flag sole-source items: parts available from only one supplier (risk factor for lead time and price)
5. Identify proprietary vs. generic equivalents: many vendor-branded parts have generic equivalents at 30-50% lower cost

### Phase 2: Classification & Optimization (Steps 5-8)

**Step 5: Perform VED Classification**
1. For each spare part, classify as Vital, Essential, or Desirable:
   - **Vital (V):** Equipment using this part is Criticality A, AND the part's failure mode has safety or high-production consequences, AND no workaround or alternative exists. Examples: specific bearings for SAG mill main drive, proprietary control valves for critical process streams, SIS-rated instruments.
   - **Essential (E):** Equipment using this part is Criticality A or B, AND failure causes significant production impact, BUT workaround may exist (e.g., manual operation, partial capacity). Examples: pump mechanical seals, motor bearings, standard instrument transmitters.
   - **Desirable (D):** Equipment using this part is Criticality B or C, AND failure causes minor impact, AND workarounds are readily available. Examples: non-critical gaskets, general lighting components, non-process instrument elements.
2. Override rules:
   - All safety-critical items (SIS-rated, fire protection, pressure relief) are automatically Vital
   - All items with lead time > 6 months are elevated one category (D->E, E->V)
   - All sole-source items are elevated one category
3. Document VED rationale for all Vital items (audit trail)

**Step 6: Perform ABC Classification**
1. Calculate annual consumption value for each spare part:
   - Annual Value = Unit Cost x Annual Consumption Quantity
2. Rank all spare parts by annual consumption value (descending)
3. Apply Pareto classification:
   - **A items:** Top items representing cumulative 80% of total annual value (typically 15-20% of items)
   - **B items:** Next items representing cumulative 80-95% of total annual value (typically 15-25% of items)
   - **C items:** Remaining items representing 5% of total annual value (typically 55-70% of items)
4. For insurance spares (no annual consumption): classify based on replacement cost
   - A: > $100,000 unit cost
   - B: $10,000-$100,000
   - C: < $10,000

**Step 7: Calculate Stocking Quantities**
1. For each spare part, calculate stocking parameters based on VED-ABC matrix:
   - Determine target service level from VED-ABC policy matrix
   - Calculate average demand and demand variability
   - Calculate lead time (quoted + safety factor)
   - Apply Min-Max formula (see Methodology section)
2. For insurance spares: quantity = 1 per equipment item (or 1 per fleet for identical units)
3. For commissioning spares: quantity = 1.5x normal consumption rate x 3 months
4. For 2-year operational spares: quantity = 2 years x annual consumption rate, rounded up
5. Apply rounding rules:
   - Integer quantities only (no fractional parts)
   - Minimum quantity = 1 for any stocked item
   - Package quantity alignment (if parts come in boxes of 10, order in multiples of 10)
6. Calculate total investment: sum of (quantity x unit cost) for all parts

**Step 8: Sequence Procurement Timeline**
1. For each spare part, calculate "Order By" date:
   - Order By = Required On-Site Date - Lead Time - Receiving/QC Time (2 weeks) - Safety Margin (4 weeks)
2. Required On-Site dates:
   - Insurance spares: 2 months before commissioning start
   - Commissioning spares: 1 month before commissioning start
   - Operational spares (first year): Before commercial operation date
   - Operational spares (second year): 6 months after commercial operation
3. Sort all procurement actions by Order By date
4. Identify items requiring IMMEDIATE action (Order By date within 30 days)
5. Group procurement by vendor for consolidated purchase orders (price leverage)
6. Identify items where vendor procurement discount is available (early ordering incentive)
7. Generate month-by-month procurement budget forecast

### Phase 3: Validation & Deliverable Generation (Steps 9-12)

**Step 9: Validate Against Industry Benchmarks**
1. Calculate total initial investment as percentage of RAV:
   - Target: 0.8-2.5% of RAV (all categories combined)
   - Flag if outside range: under-investment or over-investment
2. Calculate investment per equipment item:
   - Target: $2,000-$8,000 per rotating equipment item
   - Target: $500-$2,000 per static equipment item
   - Target: $300-$1,500 per instrument item
3. Validate VED distribution:
   - Expected: V = 10-15%, E = 25-35%, D = 50-65% (by item count)
   - Expected: V = 50-70%, E = 20-35%, D = 5-15% (by value)
4. Validate ABC distribution follows 80/20 rule
5. Compare insurance spares coverage against equipment criticality:
   - All Criticality A equipment should have insurance spare coverage
   - 80%+ of Criticality B equipment with long-lead components should have coverage
6. Flag anomalies for review

**Step 10: Perform Budget Optimization**
1. If total investment exceeds budget constraint:
   - Identify D-C items that can be moved to "purchase on demand" (lowest impact)
   - Reduce safety stock levels for E-B and E-C items
   - Evaluate fleet-level sharing opportunities (reduce from per-unit to per-fleet)
   - Identify generic equivalents for proprietary components
   - Prioritize by NPV impact: calculate stockout cost vs. carrying cost for each item
2. If total investment is well within budget:
   - Consider increasing coverage for E-B items to provide margin
   - Consider adding commissioning spares for medium-criticality equipment
   - Consider pre-positioning vendor-managed inventory arrangements
3. Generate budget optimization scenarios: minimum, recommended, maximum

**Step 11: Generate ERP/CMMS Material Master Data**
1. For each spare part, generate material master record compatible with target ERP:
   - Material number (per client numbering convention)
   - Material description (standardized naming convention)
   - Material group and classification
   - Unit of measure
   - Plant/storage location
   - MRP type and parameters (Min, Max, Reorder Point)
   - Purchasing data (preferred vendor, lead time, price)
   - Equipment link (which equipment uses this part)
   - BOM reference (where in the equipment BOM this part sits)
2. Format for SAP MM upload (or Maximo/Infor EAM as applicable)
3. Include quality assurance data: inspection required (Y/N), certificate required (Y/N)
4. Include storage requirements: climate-controlled, hazardous material, shelf life

**Step 12: Compile Final Deliverables**
1. Generate Initial Spare Parts Master List workbook (all 10 sheets)
2. Generate procurement action report (items requiring immediate ordering)
3. Generate budget summary for management approval
4. Generate long-lead items alert with specific procurement recommendations
5. Store all outputs in mcp-sharepoint with version control
6. Upload material master data to mcp-erp for procurement system setup
7. Notify agent-procurement (via orchestrator) that spare parts list is ready for procurement execution

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Equipment Coverage | % of equipment items with spare parts identified | >95% for Criticality A, >85% for B | >90% A, >75% B |
| FMECA Traceability | % of parts linked to specific failure modes | >80% for Criticality A equipment | >60% |
| VRSL Integration | % of vendor-recommended items validated/included | 100% reviewed, >85% included | 100% reviewed |
| VED-ABC Completeness | % of items classified on both dimensions | 100% | 100% |
| Insurance Spares Coverage | % of Criticality A equipment with insurance spares | >95% | >90% |
| Budget Benchmark | Total investment within % of RAV benchmark | 0.8-2.5% RAV | 0.5-3.5% RAV |
| Lead Time Accuracy | Quoted lead times validated with vendors | >80% validated | >60% validated |
| Interchangeability Mapping | Common parts identified and pooled | >90% of common parts identified | >75% |
| Procurement Sequencing | Long-lead items identified with order-by dates | 100% of >26-week items | 100% |
| ERP Data Quality | Material master records pass ERP validation | >95% accepted | >90% accepted |
| Duplicate Detection | No duplicate parts in final list | Zero duplicates | Zero duplicates |
| Unit Cost Accuracy | Prices validated against recent quotes | >70% validated within 12 months | >50% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment register | Master equipment list with hierarchy, OEM data, and model numbers |
| `analyze-equipment-criticality` | Criticality ratings | A/B/C criticality classification that drives VED classification |
| `develop-maintenance-strategy` (J-01) | FMECA data | Failure modes, maintenance tasks, and component replacement requirements |
| `manage-vendor-documentation` (I-01) | Vendor manuals & VRSLs | Vendor-recommended spare parts lists and parts catalogs |
| `agent-finance` | Budget parameters | Financial data for stockout cost calculations and budget constraints |
| `agent-project` | Project schedule | Commissioning dates by system for procurement sequencing |
| `model-commissioning-sequence` (R-01) | Commissioning sequence | System-by-system commissioning timeline for parts delivery scheduling |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `optimize-mro-inventory` (K-02) | Baseline inventory | Initial spares list serves as baseline for ongoing MRO inventory optimization |
| `track-long-lead-procurement` (K-03) | Long-lead items | Long-lead spare parts feed into procurement tracking workflow |
| `prepare-pssr-package` (I-04) | Spares readiness | PSSR checklist includes verification that critical spare parts are on-site |
| `model-rampup-trajectory` (H-04) | Readiness input | Spare parts readiness percentage feeds into ramp-up trajectory model |
| `agent-procurement` | Procurement execution | Agent-procurement uses the spares list to execute purchase orders |
| `model-opex-budget` | Budget input | Annual spare parts consumption cost feeds into OPEX model |
| `agent-maintenance` | PM material lists | Spare parts linked to PM tasks for CMMS work order material planning |

### Peer Dependencies (Collaborative)

| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-spare-parts-strategy` | Strategy alignment | Strategy document provides policy framework; this skill executes the detailed list |
| `agent-doc-control` | Document management | Spare parts list is a controlled document with revision management |

---

## MCP Integrations

### mcp-erp
```yaml
name: "mcp-erp"
server: "@vsc/erp-mcp"
purpose: "ERP integration for material master data and procurement"
capabilities:
  - Read existing material master data (brownfield/expansion projects)
  - Upload new material master records for spare parts
  - Query vendor pricing and lead time data from purchasing records
  - Read equipment BOM (Bill of Materials) data
  - Generate purchase requisitions for approved spare parts
  - Check existing inventory levels (brownfield)
authentication: API Key + OAuth2
usage_in_skill:
  - Step 1: Read existing equipment data from ERP (if available)
  - Step 3: Query vendor pricing history for cost validation
  - Step 4: Read equipment BOMs for interchangeability analysis
  - Step 11: Upload material master records for new spare parts
  - Step 12: Generate purchase requisitions for immediate procurement
```

### mcp-cmms
```yaml
name: "mcp-cmms"
server: "@vsc/cmms-mcp"
purpose: "CMMS integration for maintenance task material linking"
capabilities:
  - Read PM task material requirements from CMMS
  - Link spare parts to maintenance work order task lists
  - Upload spare parts data as BOM items in equipment records
  - Query failure history for consumption rate calculation (brownfield)
  - Validate equipment tag numbers against CMMS master data
authentication: API Key + OAuth2
usage_in_skill:
  - Step 2: Read PM task material requirements from maintenance plans
  - Step 4: Validate equipment tags against CMMS master data
  - Step 11: Upload spare parts as equipment BOM items in CMMS
```

### mcp-sharepoint
```yaml
name: "mcp-sharepoint"
server: "@anthropic/sharepoint-mcp"
purpose: "Document storage and data access for spare parts analysis"
capabilities:
  - Read equipment register, FMECA workbooks, vendor documentation
  - Read vendor recommended spare parts lists from project document library
  - Store completed spare parts list with version control
  - Access project schedule and commissioning plan
  - Distribute spare parts reports to stakeholders
authentication: OAuth2 (Microsoft Entra ID)
usage_in_skill:
  - Steps 1-3: Read input data (equipment register, FMECA, VRSLs)
  - Step 12: Store completed spare parts list and procurement reports
```

---

## Templates & References

### Templates
- `templates/initial_spares_list_template.xlsx` -- Master spare parts list workbook with all sheets pre-formatted
- `templates/ved_abc_classification_template.xlsx` -- VED/ABC classification workbook with decision matrix
- `templates/insurance_spares_justification.docx` -- Insurance spare justification template for capital approval
- `templates/procurement_schedule_template.xlsx` -- Month-by-month procurement timeline template
- `templates/material_master_upload_SAP.xlsx` -- SAP MM material master upload format
- `templates/material_master_upload_Maximo.xlsx` -- IBM Maximo material master upload format

### Reference Documents
- ISO 14224:2016 -- Equipment taxonomy and failure coding
- ISO 55001:2014 -- Asset management systems
- SMRP Best Practice 5.5 -- Inventory Management
- SMRP Best Practice 5.5.1 -- MRO Inventory Value as % of RAV
- SAE JA1011/JA1012 -- Reliability Centered Maintenance (spare parts from FMECA)
- OREDA Handbook 6th Edition -- Generic failure rate data for consumption estimation
- VSC Corporate Pain Points Research Report -- D-04, P-03 statistics

### Reference Datasets
- Equipment type spare parts libraries (pumps, compressors, motors, valves, instruments, conveyors, crushers, mills)
- Generic bearing cross-reference database
- Generic seal and gasket cross-reference database
- Industry-typical lead times by equipment type and manufacturer
- Regional supplier databases (Chile, Peru, Australia, Canada)

---

## Examples

### Example 1: Full Initial Spares List for Copper Concentrator

```
Command: generate-initial-spares-list full --project "Sierra Verde" --equipment-register "SV-EQ-REG-001.xlsx"

Process:
  Step 1: Equipment Register
    - Total equipment: 2,847 items
    - Criticality A: 312 items (11%)
    - Criticality B: 798 items (28%)
    - Criticality C: 1,737 items (61%)
    - Equipment types: 847 rotating, 1,203 static, 412 electrical, 385 instrument

  Steps 2-3: Data Integration
    - FMECA available for: 1,110 items (100% of A+B)
    - VRSL available from: 42 vendors covering 78% of equipment value
    - VRSL items parsed: 12,456 line items
    - FMECA-derived items: 8,234 line items
    - After deduplication and consolidation: 15,892 unique spare parts

  Steps 4: Interchangeability
    - 15,892 items reduced to 11,247 unique stock items (29% reduction through pooling)
    - 187 bearing types consolidated to 94 standardized bearings
    - 312 seal types consolidated to 156 standardized seals

  Steps 5-6: VED-ABC Classification
    - VED Distribution: V=1,237 (11%), E=3,148 (28%), D=6,862 (61%)
    - ABC Distribution: A=1,687 (15%), B=2,249 (20%), C=7,311 (65%)
    - VA items: 287 (highest attention: 2.5% of items, 45% of value)

  Step 7: Stocking Quantities
    Insurance Spares:
    - 47 items totaling $18.2M (0.40% of RAV)
    - Includes: SAG mill main gear set ($2.1M), crusher mantle/concave sets ($890K),
      4 gearbox assemblies ($320K each), 6 motor rotors ($180K each), etc.

    Commissioning Spares:
    - 2,156 items totaling $4.8M
    - Average $1,685 per equipment item (within benchmark)
    - Includes 1.5x consumption factor for startup burn-in period

    2-Year Operational Spares:
    - 8,044 items totaling $32.4M (0.72% of RAV annual = 1.44% for 2 years)

  Summary:
    | Category | Items | Value | % of RAV |
    |----------|-------|-------|----------|
    | Insurance Spares | 47 | $18.2M | 0.40% |
    | Commissioning Spares | 2,156 | $4.8M | 0.11% |
    | 2-Year Operational Spares | 8,044 | $32.4M | 0.72%/yr |
    | **Total** | **11,247** | **$55.4M** | **1.23%** |

    Industry benchmark (all categories): 0.8-2.5% of RAV
    Project result: 1.23% of RAV -- WITHIN BENCHMARK (slightly below median)

  Long-Lead Items Requiring Immediate Action (8 items):
    1. SAG mill main gear set: 52-week lead time, order by TODAY
    2. Crusher concave set: 40-week lead time, order within 2 weeks
    3. Primary cyclone cluster: 36-week lead time, order within 4 weeks
    ... (5 more items)

Output:
  "Sierra Verde Initial Spare Parts List generated.
   11,247 unique stock items identified across 2,847 equipment items.
   Total investment: $55.4M (1.23% of RAV - within industry benchmark).
   47 insurance spares ($18.2M), 2,156 commissioning spares ($4.8M),
   8,044 operational spares ($32.4M for 2 years).
   8 LONG-LEAD items require procurement action within 30 days.
   29% inventory reduction achieved through interchangeability pooling.
   File: SV_Initial_Spares_List_v1.0_20260415.xlsx"
```

### Example 2: Insurance Spares Justification for Board Approval

```
Command: generate-initial-spares-list insurance --project "Sierra Verde"

Process:
  Top 10 Insurance Spares by Value:

  | # | Part | Equipment | Value | Lead Time | Stockout Cost/Month |
  |---|------|-----------|-------|-----------|-------------------|
  | 1 | SAG Mill Main Gear Set | ML-3101 | $2.1M | 52 weeks | $45M |
  | 2 | Ball Mill Ring Gear | ML-3201 | $1.4M | 48 weeks | $45M |
  | 3 | Primary Crusher Mantle + Concave | CR-1101 | $890K | 40 weeks | $22M |
  | 4 | Thickener Rake Drive Gearbox | TK-4201 | $420K | 36 weeks | $12M |
  | 5 | SAG Mill Motor Rotor | MO-3101 | $380K | 44 weeks | $45M |
  | 6 | Ball Mill Motor Stator | MO-3201 | $350K | 44 weeks | $45M |
  | 7 | Compressor Rotor Assembly | CP-6101A | $320K | 32 weeks | $8M |
  | 8 | HP Transformer Winding | TR-E001 | $310K | 40 weeks | $45M |
  | 9 | Concentrate Filter Press Plates | FP-5101 | $280K | 28 weeks | $15M |
  | 10 | Cyclone Feed Pump Impeller Set | PP-3201 | $250K | 24 weeks | $22M |

  ROI Justification (SAG Mill Gear Set example):
    - Investment: $2.1M (one-time capital)
    - Carrying cost: $525K/year (25% of value)
    - Stockout risk: 2% probability per year (OREDA data for gear failures)
    - Stockout cost: $45M/month x 12 months (gear set lead time) = $540M
    - Expected annual stockout cost without spare: $540M x 2% = $10.8M
    - ROI: ($10.8M - $0.525M) / $2.1M = 489% return in Year 1

  Total Insurance Spares: 47 items, $18.2M investment
  Expected value protection: $127M/year in avoided production losses

Output:
  "Insurance Spares Capital Approval Request:
   47 insurance spare items totaling $18.2M.
   Expected risk mitigation value: $127M/year.
   Board ROI: 598% aggregate return on insurance spares investment.
   All items have lead times >6 months and protect against >$1M/day production loss.
   Recommendation: APPROVE full insurance spares budget."
```
