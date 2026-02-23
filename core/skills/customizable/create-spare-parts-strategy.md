# Create Spare Parts Strategy
## Skill ID: A-SPARE-PARTS-001
## Version: 1.0.0
## Category: A. Document Generation
## Priority: P1 - Critical

## Purpose

Develop a comprehensive spare parts strategy that determines what spare parts to stock, in what quantities, and at what criticality level, using VED (Vital-Essential-Desirable) and ABC (cost-based) classification methodologies. This skill transforms raw vendor spare parts lists, equipment criticality data, and maintenance strategies into a rationalized spare parts master with clear stocking decisions, inventory optimization recommendations, and procurement priorities.

Effective spare parts management is a cornerstone of Operational Readiness. Insufficient sparing leads to extended downtime and lost production; excessive sparing ties up capital and increases carrying costs. This skill ensures that every spare part decision is risk-informed, data-driven, and aligned with the plant's maintenance philosophy and production targets.

## Intent & Specification

The AI agent MUST understand the following core goals:

1. **VED-ABC Matrix Classification**: Every spare part must be classified along two dimensions -- criticality (VED: Vital, Essential, Desirable) based on impact on production/safety, and cost (ABC: A=high value, B=medium value, C=low value). The intersection of these two dimensions determines the stocking strategy.

2. **Lead Time Risk Assessment**: Parts with long lead times (>12 weeks) combined with high criticality require different stocking strategies than fast-moving consumables. The agent must factor in supplier lead times, geographic supply chain risks, and sole-source dependencies.

3. **Insurance Spares vs. Operational Spares**: The agent must distinguish between insurance spares (high-value, low-probability-of-use items kept for catastrophic failures) and operational spares (routine replacement items consumed during preventive/corrective maintenance).

4. **Capital vs. Revenue Classification**: Spare parts must be classified as capital spares (high value, typically >$5,000, capitalized on balance sheet) or revenue spares (consumed as operational expense).

5. **Interchangeability & Standardization**: The agent must identify opportunities for parts standardization across equipment, reducing the total number of unique SKUs while maintaining coverage.

6. **Initial Provisioning Quantities**: For greenfield projects, the agent must calculate recommended initial stock quantities for the first 2 years of operation based on expected failure rates, maintenance intervals, and lead times.

## Trigger / Invocation

```
/create-spare-parts-strategy
```

**Aliases**: `/spare-parts`, `/spares-strategy`, `/estrategia-repuestos`

**Trigger Conditions**:
- User provides vendor spare parts recommendations (VRSPLs)
- User provides equipment criticality analysis results
- User requests spare parts classification or inventory planning
- Maintenance strategy outputs are available as input
- Project is in late detailed engineering or pre-commissioning phase

## Input Requirements

### Mandatory Inputs

| Input | Format | Description |
|-------|--------|-------------|
| Vendor Recommended Spare Parts Lists (VRSPLs) | .xlsx, .csv, .pdf | Vendor-provided spare parts recommendations per equipment package. Must contain: part number, description, recommended quantity, unit price |
| Equipment Criticality Analysis | .xlsx | Equipment criticality ratings (A/B/C or equivalent) from asset register or RCM analysis. Minimum: tag number + criticality rating |
| Equipment List / Asset Register | .xlsx | Master equipment list with tag numbers, descriptions, and equipment types. Ideally from `create-asset-register` output |

### Optional Inputs (Enhance Quality)

| Input | Format | Description |
|-------|--------|-------------|
| Maintenance Strategy Documents | .xlsx, .docx | RCM/FMEA outputs showing failure modes and maintenance task intervals -- drives consumption forecasting |
| Vendor Lead Time Data | .xlsx | Supplier-confirmed lead times per part or equipment package |
| Bill of Materials (BOMs) | .xlsx, .pdf | Equipment BOMs showing component breakdown and replacement hierarchy |
| Historical Consumption Data | .xlsx | If brownfield/expansion: actual spare parts usage history from existing operations |
| Unit Price Catalogs | .xlsx, .pdf | Current pricing for spare parts (for ABC cost classification) |
| Logistics & Warehousing Constraints | .docx | Available warehouse space, environmental storage requirements, shelf life limitations |
| Client Stocking Policy | .docx | Client-specific policies on minimum/maximum stock levels, reorder points, safety stock calculations |
| Insurance Requirements | .docx | Insurance policy requirements for specific spare parts to be on-site |

### Input Validation Rules

- VRSPLs without unit prices trigger a warning; ABC classification will use estimated values
- Equipment without criticality ratings defaults to "B" (medium) with a flag for review
- Parts without lead time data are assigned a default of 16 weeks for international sourcing
- Duplicate part numbers across vendors are flagged for interchangeability analysis

## Output Specification

### Primary Output: Spare Parts Master (.xlsx)

**Filename**: `{ProjectCode}_Spare_Parts_Strategy_v{version}_{date}.xlsx`

**Workbook Structure**:

#### Sheet 1: "Spare Parts Master"

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | SPM_ID | Unique spare part master ID | SPM-00001 |
| B | Parent_Tag_Number | Equipment tag number | 100-PP-001 |
| C | Parent_Description | Equipment description | Centrifugal Pump - Slurry Transfer |
| D | Equipment_Criticality | Equipment criticality (A/B/C) | A |
| E | Vendor_Part_Number | Vendor/OEM part number | 65432-001 |
| F | Manufacturer_Part_Number | Manufacturer catalog number | SKF-22320E |
| G | Part_Description | Spare part description | Spherical Roller Bearing |
| H | Part_Description_ES | Spanish description | Rodamiento de Rodillos Esfericos |
| I | Material_Group | Material group/category | Bearings |
| J | VED_Classification | Vital/Essential/Desirable | V - Vital |
| K | ABC_Classification | A (high cost)/B/C (low cost) | B - Medium Value |
| L | VED_ABC_Matrix | Combined classification | VB |
| M | Stocking_Decision | Stock/Non-Stock/Insurance | Stock - Safety Stock |
| N | Spare_Type | Insurance/Operational/Consumable | Operational |
| O | Capital_Revenue | Capital Spare / Revenue Spare | Revenue |
| P | Unit_Price_USD | Unit price in USD | 1,250.00 |
| Q | Recommended_Qty_Vendor | Vendor recommended quantity | 4 |
| R | Calculated_Initial_Qty | Agent-calculated initial stock qty | 2 |
| S | Final_Recommended_Qty | Final recommended quantity | 3 |
| T | Total_Value_USD | Total value (price x qty) | 3,750.00 |
| U | Reorder_Point | Min stock level triggering reorder | 1 |
| V | Reorder_Quantity | Quantity to reorder | 2 |
| W | Lead_Time_Weeks | Supplier lead time | 12 |
| X | Shelf_Life_Years | Shelf life / storage limit | 5 |
| Y | Storage_Requirements | Special storage conditions | Climate controlled |
| Z | Interchangeable_With | Cross-reference to equivalent parts | SPM-00045, SPM-00089 |
| AA | Number_Installed | Qty installed in plant | 8 |
| AB | Mean_Time_Between_Failure_hrs | MTBF if known | 25,000 |
| AC | Annual_Consumption_Estimate | Estimated annual usage | 1.5 |
| AD | Sole_Source | Yes/No | No |
| AE | Vendor_Name | Primary supplier | SKF Chile |
| AF | Alternative_Vendor | Alternative supplier | FAG/Schaeffler |
| AG | Notes | Additional notes | Common across all slurry pumps |

#### Sheet 2: "VED-ABC Matrix Summary"
Matrix visualization showing parts count and total value per VED-ABC cell:

```
         | A (High $) | B (Med $)  | C (Low $)  | Total
---------|------------|------------|------------|-------
V-Vital  |   VA: xx   |   VB: xx   |   VC: xx   |  xxx
E-Essent |   EA: xx   |   EB: xx   |   EC: xx   |  xxx
D-Desir  |   DA: xx   |   DB: xx   |   DC: xx   |  xxx
---------|------------|------------|------------|-------
Total    |    xxx     |    xxx     |    xxx     |  xxx
```

With associated stocking policies per cell and total inventory value.

#### Sheet 3: "Insurance Spares"
Dedicated list of insurance spares with:
- Justification for insurance classification
- Estimated replacement time
- Failure scenario description
- Storage requirements
- Preservation/maintenance-in-storage requirements
- Total insurance spare value

#### Sheet 4: "Interchangeability Register"
Cross-reference matrix showing which parts are interchangeable across equipment:
- Part families with common specifications
- Standardization opportunities
- Potential SKU reduction analysis

#### Sheet 5: "Procurement Plan"
Priority-ordered procurement list with:
- Procurement priority (1=immediate, 2=pre-commissioning, 3=post-SOP)
- Required delivery date
- Estimated procurement lead time
- Budget allocation per phase

#### Sheet 6: "Investment Summary"
Financial summary:
- Total initial spares investment (capital + revenue)
- Annual carrying cost estimate (typically 15-25% of inventory value)
- Cost by category (VED, ABC, equipment type, area)
- Insurance spares value
- Recommended annual replenishment budget

#### Sheet 7: "Data Quality & Gaps"
- Completeness analysis
- Items requiring review
- Missing pricing data
- Unclassified items

### Formatting Standards
- Header row: Bold, dark green background (#006633), white font
- VED color coding: V=Red, E=Orange, D=Green
- ABC color coding: A=Dark blue, B=Medium blue, C=Light blue
- Currency fields: USD format with 2 decimal places, thousands separator
- Data validation dropdowns for: VED, ABC, Stocking Decision, Spare Type
- Conditional formatting for high-value items (>$10,000)
- Freeze panes on header row and ID columns

### Secondary Output: Strategy Report (.docx)

**Filename**: `{ProjectCode}_Spare_Parts_Strategy_Report_v{version}_{date}.docx`

Report structure (10-20 pages):
1. Executive Summary
2. Scope and Methodology
3. VED-ABC Classification Results
4. Insurance Spares Justification
5. Interchangeability & Standardization Opportunities
6. Initial Provisioning Recommendations
7. Inventory Management Policies (reorder points, safety stock)
8. Procurement Strategy & Timeline
9. Financial Summary & Budget
10. Recommendations & Next Steps

## Methodology & Standards

### Primary Standards
- **VED Analysis** (Vital-Essential-Desirable): Criticality-based classification method widely used in industrial spare parts management.
- **ABC Analysis** (Activity-Based Costing/Pareto): Cost-based classification where typically A=top 20% items representing 80% of value.
- **ISO 14224:2016** - Equipment taxonomy for linking parts to equipment classes.
- **ISO 55000 Series** - Asset management principles for lifecycle cost optimization.

### Supporting Methodologies
- **SDE Analysis** (Scarce-Difficult-Easy to obtain): Supply availability classification.
- **FSN Analysis** (Fast-Slow-Non-moving): Consumption velocity classification.
- **MUSIC-3D** (Multi-Unit Spares Inventory Control): For calculating optimal stock levels of repairable spares shared across multiple identical units.
- **Poisson Distribution**: For calculating initial provisioning quantities based on failure rates and lead times.

### Industry Guidelines
- **SMRP Best Practice 5.4** - Spare Parts Management
- **API 689** - Collection and Exchange of Reliability and Maintenance Data for Equipment (complements ISO 14224)
- **NORSOK Z-008** - Risk-based maintenance and consequence classification (for criticality input)

### Financial Standards
- **IAS 16** - Property, Plant and Equipment (for capital spare classification)
- **IAS 2** - Inventories (for revenue spare valuation)
- Carrying cost calculation: 15-25% of inventory value annually (includes storage, insurance, obsolescence, capital cost)

## VSC Failure Modes Table — Mandatory Standard

**MANDATORY RULE:** Every spare part identified and classified by this skill MUST be traceable to one or more specific failure modes from the official **VSC Failure Modes Table** (`methodology/standards/VSC_Failure_Modes_Table.xlsx`). Spare parts that cannot be linked to a standardized failure mode must be flagged for review.

### Failure Mode Structure

The VSC Failure Modes Table defines 72 standardized failure modes. Each spare part exists because a component can fail in a specific way. The failure mode that drives the spare part requirement MUST follow the three-part structure:

| Element | Definition | Example |
|---------|-----------|---------|
| **WHAT** | The component that fails and requires the spare part | Spherical Roller Bearing |
| **HOW** (FM-Mechanism) | How the component fails — one of 18 official mechanisms | Wears |
| **WHY** (FM-Cause) | The root cause driving the failure mechanism — from 46 official causes | Lubricant contamination (particles) |

**Complete failure mode definition:** *"Spherical Roller Bearing Wears due to Lubricant contamination (particles)"*

### The 18 Official FM-Mechanisms

All failure mechanisms referenced in the Spare Parts Master, insurance spare justifications, and VED classification rationale MUST use ONLY these 18 mechanisms:

`Arcs` · `Blocks` · `Breaks/Fracture/Separates` · `Corrodes` · `Cracks` · `Degrades` · `Distorts` · `Drifts` · `Expires` · `Immobilised (binds/jams)` · `Looses Preload` · `Open-Circuit` · `Overheats/Melts` · `Severs (cut/tear/hole)` · `Short-Circuits` · `Thermally Overloads (burns/overheats/melts)` · `Washes Off` · `Wears`

### Compliance Rules for Spare Parts Strategy

1. **Spare Parts Master — Failure Mode Column:** The Spare Parts Master workbook (Sheet 1) MUST include a column `FM_Reference` linking each spare part to its originating failure mode(s) from the VSC Failure Modes Table, using the format "[Mechanism] due to [Cause]".
2. **VED Classification Justification:** VED classification rationale for Vital and Essential parts MUST reference the specific failure mode and its consequence, using standardized nomenclature from the table.
3. **Insurance Spare Justification (Sheet 3):** Each insurance spare's "Failure scenario description" MUST use the official failure mode naming convention — e.g., "Breaks/Fracture/Separates due to Fatigue (cyclic loading)" rather than free-text descriptions like "gear breaks".
4. **No Ad-Hoc Descriptions:** Free-text failure descriptions such as "pump fails", "bearing goes bad", or "seal leaks" are NOT acceptable. All references must use the standardized three-part structure.
5. **FMECA Cross-Reference:** Every spare part derived from the maintenance strategy MUST cross-reference the specific FMECA failure mode row that generated the spare requirement.
6. **Consistency Across Deliverables:** Failure mode references in the Spare Parts Master, Insurance Spares sheet, and Strategy Report MUST be identical to those in the upstream FMECA — no paraphrasing or abbreviation.

## Step-by-Step Execution

### Phase 1: Data Collection & Preparation (Steps 1-3)

**Step 1: Ingest and Parse VRSPLs**
- Import all vendor recommended spare parts lists
- Normalize part numbers, descriptions, and pricing to common format
- Map each spare part to its parent equipment using tag numbers
- Flag parts without parent equipment mapping

**Step 2: Merge with Equipment Data**
- Link spare parts to equipment records from asset register
- Import equipment criticality ratings
- Import maintenance strategy data (failure modes, task intervals) if available
- Calculate number of identical equipment units per part (installed base)

**Step 3: Data Enrichment**
- Research and assign lead times where not provided
- Identify sole-source parts
- Determine shelf life and storage requirements per material type
- Identify interchangeable parts across equipment packages

### Phase 2: Classification (Steps 4-6)

**Step 4: VED Classification**
Apply VED classification based on:
- **Vital (V)**: Failure of part causes immediate production loss, safety hazard, or environmental incident. Equipment criticality A. No workaround available. Lead time exceeds acceptable downtime.
- **Essential (E)**: Failure causes partial production loss or degraded operation. Equipment criticality A or B. Temporary workaround may exist. Moderate impact on safety/environment.
- **Desirable (D)**: Failure causes minor inconvenience, no production impact, or equipment has full redundancy. Equipment criticality B or C. Easy to obtain or fabricate locally.

Decision rules:
- Equipment Criticality A + long lead time (>12 weeks) = V
- Equipment Criticality A + short lead time = E minimum
- Equipment Criticality B + long lead time = E
- Equipment Criticality B + short lead time = D or E
- Equipment Criticality C = D (unless safety-related)
- Safety-critical parts = V regardless of equipment criticality

**Step 5: ABC Classification**
Apply ABC classification using Pareto analysis:
- **A Items**: Top 10-20% of parts by annual usage value, representing ~70-80% of total value
- **B Items**: Next 20-30% of parts by annual usage value, representing ~15-20% of total value
- **C Items**: Bottom 50-70% of parts by annual usage value, representing ~5-10% of total value

For initial provisioning (no consumption history):
- Use unit price x estimated annual consumption
- If consumption data unavailable, use unit price x vendor recommended quantity as proxy

**Step 6: VED-ABC Matrix Stocking Decisions**
Apply stocking policy per matrix cell:

| Cell | Stocking Policy |
|------|----------------|
| VA | Must stock. Insurance spare. Maximum safety stock. Dual sourcing required. |
| VB | Must stock. Safety stock. Consider insurance spare for long lead time items. |
| VC | Must stock. Minimum safety stock. Bulk purchase for cost efficiency. |
| EA | Stock. Economic order quantity optimization. Regular review cycle. |
| EB | Stock. Standard reorder point. Quarterly review. |
| EC | Stock. Minimum quantity. Can use consignment or vendor-managed inventory. |
| DA | Review case-by-case. Stock only if lead time justifies. Consider on-demand procurement. |
| DB | Non-stock. Procure on demand. Establish blanket purchase orders. |
| DC | Non-stock. Procure on demand. Local sourcing preferred. |

### Phase 3: Quantity Optimization (Steps 7-8)

**Step 7: Calculate Initial Provisioning Quantities**
For each part, calculate recommended initial stock:

- **Insurance spares**: Typically 1 unit per risk scenario (may be shared across identical equipment)
- **Operational spares (with MTBF data)**:
  ```
  Q = (Installed_Base x Operating_Hours_per_Year x Lead_Time_Years) / MTBF
  Add safety factor based on VED classification:
    V: +50% safety factor
    E: +25% safety factor
    D: no safety factor
  Round up to nearest whole number
  ```
- **Operational spares (without MTBF data)**:
  ```
  Use vendor recommendation as baseline
  Adjust based on: installed base, lead time, VED classification
  Cross-reference with industry benchmark data for similar equipment
  ```
- **Consumables**: Based on maintenance strategy intervals and task frequencies

**Step 8: Calculate Reorder Points and Quantities**
For stocked items:
```
Reorder Point = (Average Daily Demand x Lead Time Days) + Safety Stock
Safety Stock = Z-score x StdDev(Demand) x sqrt(Lead Time Days)
  Z-score: V=2.33 (99%), E=1.65 (95%), D=1.28 (90%)

Economic Order Quantity (EOQ) = sqrt(2 x Annual Demand x Order Cost / Holding Cost per Unit)
```

### Phase 4: Financial Analysis & Reporting (Steps 9-11)

**Step 9: Financial Summary**
- Calculate total initial spares investment
- Classify capital vs. revenue spares
- Calculate annual carrying cost projection
- Prepare budget breakdown by area, equipment type, and procurement phase
- Identify top 20 highest-value spare parts for management review

**Step 10: Interchangeability Analysis**
- Group parts by specification (size, rating, material, type)
- Identify potential standardization opportunities
- Calculate potential SKU reduction and cost savings
- Document cross-reference recommendations

**Step 11: Generate Outputs**
- Create Spare Parts Master workbook with all sheets
- Generate Strategy Report document
- Prepare procurement plan with phased delivery schedule
- Create executive summary dashboard

## Quality Criteria

### Quantitative Thresholds

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| VED classification coverage | 100% | >95% |
| ABC classification coverage | 100% | >95% |
| Parts linked to parent equipment | 100% | >98% |
| Pricing data availability | >90% | >80% |
| Lead time data availability | >85% | >75% |
| Interchangeability analysis coverage | >80% | >70% |
| Initial quantity calculation coverage | 100% | >95% |
| SME approval rating | >95% | >91% |

### Qualitative Standards

- **Classification Consistency**: Identical parts across different equipment must receive the same VED-ABC classification unless parent equipment criticality differs.
- **Financial Accuracy**: Total investment figures must reconcile -- sum of line items must equal reported totals.
- **Procurement Feasibility**: Recommended quantities and delivery schedules must be achievable given stated lead times.
- **Risk Alignment**: Insurance spare justifications must clearly articulate the failure scenario and business impact.
- **Actionable Output**: A Procurement Manager must be able to issue purchase orders directly from the procurement plan sheet.

### Validation Process
1. VED-ABC matrix completeness check (no unclassified items)
2. Financial reconciliation (line items vs. totals)
3. Insurance spare justification review
4. Lead time vs. delivery date feasibility check
5. Interchangeability cross-reference validation
6. Final quality score calculation

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-asset-register` | Equipment list + criticality | Provides structured equipment data with criticality ratings and ISO 14224 classification |
| `create-maintenance-strategy` | Failure modes + task intervals | Provides MTBF estimates, failure modes, and PM frequencies for consumption forecasting |
| Document Ingestion Agent | VRSPL parsing | Parses vendor spare parts lists from various formats |

### Downstream Dependencies (Outputs TO other agents)
| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `create-commissioning-plan` | Commissioning spares | Provides list of spares required for commissioning activities |
| `create-shutdown-plan` | Shutdown spares | Provides spare parts requirements for planned shutdowns |
| CMMS Configuration Agent | Material master | Spare parts data for CMMS material master setup |
| Procurement Agent | Purchase orders | Procurement plan for spare parts purchasing |
| `create-kpi-dashboard` | Inventory KPIs | Spare parts value and fill rate metrics |

### Peer Dependencies (Collaborative)
| Agent/Skill | Interaction | Description |
|-------------|-------------|-------------|
| `create-risk-assessment` | Risk alignment | Insurance spare decisions align with risk assessment findings |
| `create-or-framework` | Budget alignment | Spare parts budget aligns with overall OR budget framework |

## Templates & References

### Templates
- `templates/spare_parts_master_template.xlsx` - Blank spare parts master with all sheets and formatting
- `templates/ved_abc_matrix_template.xlsx` - VED-ABC classification matrix template
- `templates/insurance_spares_justification_template.docx` - Insurance spare justification form
- `templates/procurement_plan_template.xlsx` - Phased procurement plan template

### Reference Documents
- VED-ABC Classification Guide (VSC internal methodology)
- ISO 14224:2016 - Equipment taxonomy (for parts-to-equipment mapping)
- SMRP Best Practice 5.4 - Spare Parts Management
- Industry benchmark MTBF data tables
- Standard material group classification reference

### Reference Datasets
- Standard spare parts material groups taxonomy
- Lead time benchmarks by material group and geography
- Carrying cost calculation parameters by industry
- Currency exchange rate tables (USD/CLP/EUR)

## Examples

### Example VED-ABC Matrix Output

```
VED-ABC CLASSIFICATION MATRIX - PROJECT ALPHA
==============================================

                | A (>$5,000)  | B ($500-5,000) | C (<$500)    | TOTAL
----------------|--------------|----------------|--------------|--------
V - Vital       |  VA: 23 pcs  |  VB: 67 pcs    |  VC: 145 pcs | 235
                |  $2.1M       |  $89K          |  $12K        | $2.2M
----------------|--------------|----------------|--------------|--------
E - Essential   |  EA: 45 pcs  |  EB: 234 pcs   |  EC: 567 pcs | 846
                |  $890K       |  $345K         |  $78K        | $1.3M
----------------|--------------|----------------|--------------|--------
D - Desirable   |  DA: 12 pcs  |  DB: 189 pcs   |  DC: 1,234   | 1,435
                |  $156K       |  $123K         |  $89K        | $368K
----------------|--------------|----------------|--------------|--------
TOTAL           |  80 pcs      |  490 pcs       |  1,946 pcs   | 2,516
                |  $3.15M      |  $557K         |  $179K       | $3.89M

STOCKING SUMMARY:
  Must Stock (V + EA + EB):     1,081 items  (43%)  = $3.53M (91%)
  Conditional Stock (EC + DA):    579 items  (23%)  = $234K  (6%)
  Non-Stock (DB + DC):          1,423 items  (57%)  = $212K  (5%)  -- Note: many DB/DC overlap

INSURANCE SPARES: 23 items, Total Value: $2.1M
  - SAG Mill Pinion Gear (100-ML-001): $450,000
  - Ball Mill Trunnion Bearing (100-ML-002): $280,000
  - Gearbox Assembly - Conveyor Drive (300-CV-001): $185,000
  ...

INITIAL PROVISIONING INVESTMENT: $3.89M
  Phase 1 (Pre-commissioning): $2.8M  (insurance + vital spares)
  Phase 2 (SOP -3 months):     $780K  (essential operational spares)
  Phase 3 (Post-SOP):          $310K  (desirable + replenishment)

ANNUAL CARRYING COST ESTIMATE: $778K (20% of inventory value)
```

### Example Spare Parts Master Row

```
| SPM_ID    | Parent_Tag | Equipment_Crit | Vendor_PN   | Description              | VED | ABC | Matrix | Stocking      | Type       | Price    | Vendor_Qty | Calc_Qty | Final_Qty | Lead_Time | Installed |
|-----------|-----------|----------------|-------------|--------------------------|-----|-----|--------|---------------|------------|----------|------------|----------|-----------|-----------|-----------|
| SPM-00001 | 100-PP-001| A              | IMP-45678   | Impeller - 316SS         | V   | A   | VA     | Insurance     | Insurance  | $12,500  | 2          | 1        | 1         | 24 weeks  | 4         |
| SPM-00002 | 100-PP-001| A              | SKF-22320E  | Bearing DE - Spherical   | V   | B   | VB     | Safety Stock  | Operational| $1,250   | 4          | 3        | 4         | 12 weeks  | 8         |
| SPM-00003 | 100-PP-001| A              | SEAL-M120   | Mechanical Seal Assembly | V   | A   | VA     | Safety Stock  | Operational| $8,900   | 2          | 2        | 2         | 16 weeks  | 4         |
| SPM-00004 | 200-AG-001| B              | BELT-5VX    | V-Belt Set               | E   | C   | EC     | Min Stock     | Consumable | $85      | 12         | 8        | 10        | 4 weeks   | 6         |
```
