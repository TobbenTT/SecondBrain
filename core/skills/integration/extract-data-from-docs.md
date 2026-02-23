# Extract Data from Documents

## Skill ID: C-EXT-014

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P1 - Critical (unlocks data trapped in unstructured documents for analysis)

---

## Purpose

Extract structured data from engineering documents such as P&IDs (Piping and Instrumentation Diagrams), datasheets, equipment lists, and technical specifications. This skill converts unstructured or semi-structured document content into organized, analysis-ready tabular data in Excel format, enabling downstream analysis skills to operate on clean, structured inputs.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Process** engineering documents in PDF and image formats using OCR and document understanding.
2. **Identify** and extract structured data elements (equipment tags, specifications, parameters).
3. **Map** extracted data to standardized schemas for consistency.
4. **Validate** extracted data for completeness and accuracy.
5. **Deliver** clean, structured data in `.xlsx` format ready for analysis.

---

## Trigger / Invocation

**Command:** `/extract-data-from-docs`

**Trigger Conditions:**
- User provides P&IDs, datasheets, or technical documents and needs structured data.
- An upstream analysis (criticality, reliability, LCC) needs equipment data input.
- Project requires building an equipment database from engineering documents.
- Data migration or digitization is needed.

**Aliases:**
- `/extract-data`
- `/data-extraction`
- `/digitize-docs`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `source_documents` | `.pdf`, `.png`, `.jpg`, `.tiff` | Engineering documents to extract data from |
| `extraction_target` | Text | What data to extract: "equipment list," "instrument list," "valve list," "specifications," etc. |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `output_schema` | `.xlsx` or JSON | Desired column structure for the output |
| `reference_data` | `.xlsx` | Existing equipment list or database for cross-referencing and validation |
| `naming_convention` | Text | Equipment tagging/naming convention used (KKS, ISA, custom) |
| `document_index` | `.xlsx` | Index of documents with drawing numbers, revision, and scope |
| `extraction_rules` | Text | Specific extraction rules or field mappings |
| `quality_threshold` | Text | Acceptable OCR confidence level (default: 90%) |

### Input Validation Rules

1. Source documents must be legible (minimum 150 DPI for scanned documents).
2. Extraction target must be clearly defined (what data elements are needed).
3. If P&IDs, the drawing scale and legend should be readable.
4. Multiple-page documents should be properly ordered.

---

## Output Specification

### Primary Output: Structured Data (`.xlsx`)

**File naming:** `{project_code}_extracted_data_{extraction_target}_{YYYYMMDD}.xlsx`

**Workbook structure:**

| Sheet | Content |
|-------|---------|
| `Extracted Data` | Clean, structured data in tabular format |
| `Extraction Log` | Per-item extraction confidence, source document, page reference |
| `Validation Report` | Data validation results: completions, errors, warnings |
| `Source Index` | List of source documents processed with metadata |
| `Unmapped Items` | Items that could not be confidently extracted or mapped |

### Equipment List Extraction Schema (Default)

| Column | Description | Example |
|--------|-------------|---------|
| `Equipment_Tag` | Equipment identifier/tag number | PU-2301A |
| `Equipment_Description` | Descriptive name | Slurry Pump A |
| `Equipment_Type` | Equipment category | Centrifugal Pump |
| `System` | Process system | Grinding |
| `Area` | Plant area | Area 230 |
| `P&ID_Reference` | Source P&ID drawing number | PID-230-001 Rev.C |
| `Service` | Service/medium | Cyclone Underflow Slurry |
| `Design_Pressure` | Design pressure | 10 barg |
| `Design_Temperature` | Design temperature | 65 C |
| `Material` | Construction material | A516 Gr.70 |
| `Size` | Equipment size/rating | 8x6-16 |
| `Motor_Power` | Motor/driver rated power | 250 kW |
| `Flow_Rate` | Design flow rate | 450 m3/h |
| `Manufacturer` | Equipment manufacturer (if on datasheet) | Metso |
| `Model` | Equipment model (if on datasheet) | HM250 |
| `Weight` | Equipment weight | 3,500 kg |
| `Extraction_Confidence` | OCR/extraction confidence percentage | 95% |

### Instrument List Extraction Schema

| Column | Description | Example |
|--------|-------------|---------|
| `Instrument_Tag` | Instrument tag (ISA format) | FIT-2301 |
| `Instrument_Type` | Instrument type | Flow Transmitter |
| `Service` | Measured variable/service | Slurry Flow |
| `Range` | Measurement range | 0-600 m3/h |
| `P&ID_Reference` | Source P&ID | PID-230-001 |
| `Loop_Number` | Control loop reference | LC-2301 |
| `Signal_Type` | Signal type | 4-20mA HART |
| `Location` | Installation location | Pipeline |

---

## Methodology & Standards

### Document Types and Extraction Approaches

| Document Type | Primary Data | Extraction Method |
|---------------|-------------|-------------------|
| **P&ID** | Equipment tags, instruments, line numbers, control loops | Symbol recognition + text OCR |
| **Equipment Datasheet** | Specifications, dimensions, materials, ratings | Form field extraction |
| **Equipment List** | Tags, descriptions, quantities, weights | Table extraction |
| **Valve List** | Valve tags, types, sizes, ratings, actuators | Table extraction |
| **Instrument List / Index** | Tags, types, ranges, signals, loops | Table extraction |
| **Line List** | Line numbers, sizes, specs, insulation | Table extraction |
| **Motor List** | Motor tags, power, voltage, speed, frame | Table extraction |

### OCR and Extraction Pipeline

```
1. Document Pre-processing:
   - Deskew and orient pages correctly.
   - Enhance contrast for better OCR.
   - Split multi-page documents into individual pages.
   - Identify document type (P&ID, datasheet, table, etc.).

2. Content Recognition:
   - For tables: Detect table structure (rows, columns, headers).
   - For P&IDs: Identify equipment symbols, tags, instrument bubbles.
   - For datasheets: Identify form fields and their values.
   - Apply OCR to extract text content.

3. Data Structuring:
   - Map recognized content to output schema fields.
   - Apply naming convention rules for tag validation.
   - Cross-reference with existing data (if provided).
   - Calculate extraction confidence per field.

4. Validation:
   - Check tag format against naming convention.
   - Verify completeness (required fields populated).
   - Cross-reference between documents (e.g., P&ID equipment vs. equipment list).
   - Flag low-confidence extractions for manual review.
```

### Tag Naming Convention Validation

| Convention | Format | Example |
|-----------|--------|---------|
| KKS | System+Equipment+Component | 1HLA10AP001 |
| ISA-based | Type-AreaNumber | FIT-2301 |
| Custom | Varies by client | PU-2301A |

### Quality Control Process

1. **Automated validation:** Tag format, data types, range checks.
2. **Cross-document validation:** Equipment on P&ID should appear in equipment list.
3. **Confidence scoring:** Each extracted value gets a confidence score.
4. **Manual review flagging:** Items below confidence threshold flagged for human review.
5. **Statistical summary:** Extraction rate, confidence distribution, error rate.

---

## Step-by-Step Execution

### Phase 1: Document Processing (Steps 1-3)

**Step 1: Receive and classify documents.**
- Identify document types (P&ID, datasheet, equipment list, etc.).
- Create a document index with filename, type, and scope.
- Check document quality (resolution, legibility, orientation).
- Flag documents that may be problematic for extraction.

**Step 2: Pre-process documents.**
- Apply image enhancement where needed (deskew, contrast, noise reduction).
- Split multi-page PDFs into individual pages.
- Identify document orientation and correct if necessary.
- Detect areas of interest within each page.

**Step 3: Configure extraction.**
- Load the appropriate extraction schema for the target data type.
- Configure naming convention rules for tag validation.
- Load reference data for cross-referencing (if provided).
- Set confidence thresholds.

### Phase 2: Extraction (Steps 4-6)

**Step 4: Extract data from documents.**
- Apply OCR and document understanding to extract text content.
- For tables: extract row-by-row with header mapping.
- For P&IDs: identify equipment symbols and associated tag labels.
- For datasheets: extract field-value pairs.

**Step 5: Structure and map data.**
- Map extracted content to the output schema columns.
- Apply data type conversions (text, numbers, units).
- Resolve abbreviations and shorthand notations.
- Handle multi-value fields (e.g., "2x50% pumps").

**Step 6: Calculate confidence scores.**
- Assign confidence score per extracted field.
- Confidence based on: OCR quality, format match, cross-reference validation.
- Flag items below threshold for manual review.
- Calculate overall extraction statistics.

### Phase 3: Validation & Output (Steps 7-9)

**Step 7: Validate extracted data.**
- Check tag formats against naming conventions.
- Verify data completeness (required fields populated).
- Cross-reference between documents for consistency.
- Identify duplicates and conflicts.

**Step 8: Build output workbook.**
- Populate the Extracted Data sheet with validated data.
- Create the Extraction Log with per-item details.
- Generate the Validation Report with statistics and flagged items.
- List unmapped or low-confidence items for manual review.

**Step 9: Summarize extraction results.**
- Report total items extracted vs. expected.
- Report extraction confidence distribution.
- List items requiring manual review.
- Provide recommendations for improving extraction quality.

---

## Quality Criteria

### Extraction Accuracy
- [ ] Extraction confidence >= 90% for text-based documents.
- [ ] Extraction confidence >= 80% for P&IDs and complex drawings.
- [ ] Equipment tags match naming convention format.
- [ ] Numerical values include correct units.

### Completeness
- [ ] All in-scope documents are processed.
- [ ] All extractable data fields are populated.
- [ ] Unmapped items are documented with source reference.
- [ ] Cross-document references are resolved.

### Data Quality
- [ ] No duplicate entries (or duplicates flagged).
- [ ] Data types are correct (numbers as numbers, text as text).
- [ ] Units are consistent throughout the dataset.
- [ ] Validation report identifies all quality issues.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| User | Source engineering documents | Extraction input |
| Project Orchestrator | Document scope and extraction requirements | Task specification |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `analyze-equipment-criticality` (B-CRIT-001) | Structured equipment list | Criticality analysis input |
| `analyze-reliability` (B-REL-004) | Equipment parameters | Reliability analysis input |
| `model-ram-simulation` (B-RAM-007) | System configuration data | RAM model construction |
| `model-opex-budget` (B-OPEX-008) | Equipment inventory | Maintenance cost estimation |
| `analyze-lifecycle-cost` (B-LCC-003) | Equipment specifications and costs | LCC model input |

---

## Templates & References

### Templates
- `templates/equipment_list_extraction_schema.xlsx` - Standard equipment list schema.
- `templates/instrument_list_extraction_schema.xlsx` - Standard instrument list schema.
- `templates/datasheet_extraction_schema.xlsx` - Datasheet field mapping template.

### Reference Documents
- ISA-5.1 - Instrumentation Symbols and Identification
- ISO 14617 - Graphical symbols for diagrams
- ISO 14224 - Equipment taxonomy and classification

---

## Examples

### Example 1: P&ID Equipment Extraction

**Input:**
- 35 P&IDs for a copper concentrator plant (PDF, 11x17 format).
- Extraction target: Equipment list.
- Naming convention: XX-NNNN (Type-Number), e.g., PU-2301.

**Expected Output:**
- 247 equipment items extracted across all P&IDs.
- Extraction confidence: 92% average (P&ID OCR).
- 18 items flagged for manual review (low confidence or ambiguous tags).
- Cross-reference: 3 tags found on P&IDs not in client's existing equipment list.

### Example 2: Equipment Datasheet Extraction

**Input:**
- 60 equipment datasheets (PDF, manufacturer format).
- Extraction target: Equipment specifications.
- Fields needed: tag, description, type, design pressure, design temperature, material, weight, motor power.

**Expected Output:**
- 60 equipment records with 8 specification fields each.
- Extraction confidence: 95% (structured form fields).
- 5 datasheets with partially illegible fields (flagged).
- Specifications compiled into a single structured spreadsheet.
