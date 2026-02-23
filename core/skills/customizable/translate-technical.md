# Translate Technical

## Skill ID: C-TRANS-011

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (enables multi-language deliverables for LATAM and international clients)

---

## Purpose

Perform high-quality technical translation between Spanish (ES), English (EN), and Portuguese (PT), specialized for industrial, mining, energy, and asset management terminology. This skill ensures that technical meaning, industry-specific terminology, and document formatting are preserved across languages, producing professional-grade translated documents suitable for client delivery.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Translate** technical documents while preserving meaning, terminology accuracy, and formatting.
2. **Apply** industry-specific glossaries for mining, oil & gas, energy, water, and asset management.
3. **Maintain** document structure, tables, figures references, and formatting.
4. **Adapt** content for regional variations (e.g., Chilean vs. Mexican Spanish, Brazilian vs. European Portuguese).
5. **Deliver** output in `.docx` format matching the source document structure.

---

## Trigger / Invocation

**Command:** `/translate-technical`

**Trigger Conditions:**
- User provides a document requiring translation.
- A deliverable needs to be produced in a different language.
- Multi-language documentation is required for an international project.

**Aliases:**
- `/translate`
- `/traducir`
- `/traduzir`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `source_document` | `.docx`, `.pdf`, `.md`, or text | Document to be translated |
| `source_language` | Text | Source language: ES, EN, or PT (auto-detect if not specified) |
| `target_language` | Text | Target language: ES, EN, or PT |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `glossary` | `.xlsx` or `.csv` | Project-specific or client-specific glossary of terms |
| `regional_variant` | Text | Regional preference: ES-CL (Chile), ES-MX (Mexico), ES-PE (Peru), PT-BR (Brazil), PT-PT (Portugal), EN-US, EN-GB |
| `industry_sector` | Text | Industry for terminology calibration: mining, oil & gas, energy, water, manufacturing |
| `formality_level` | Text | Formal (default for technical), semi-formal, informal |
| `preserve_formatting` | Boolean | Maintain original document formatting (default: true) |
| `reviewer_notes` | Text | Specific translation preferences or instructions |
| `parallel_text` | `.docx` | Previously translated document for consistency reference |

### Input Validation Rules

1. Source and target language must be different.
2. Source document must be text-based (not scanned images without OCR).
3. If glossary is provided, it must have at minimum: source term, target term.

---

## Output Specification

### Primary Output: Translated Document (`.docx`)

**File naming:** `{original_filename}_{target_language}_{YYYYMMDD}.docx`

**Output characteristics:**
- Preserves original document structure (headings, sections, paragraphs).
- Maintains tables, figure references, and cross-references.
- Preserves formatting (bold, italic, bullet points, numbering).
- Technical terms translated according to industry glossary.
- Units and number formats adapted to target locale (if requested).
- Headers/footers translated.

### Secondary Output: Translation Notes (`.md`)

**File naming:** `{original_filename}_translation_notes_{YYYYMMDD}.md`

**Content:**
- List of key terminology decisions and rationale.
- Terms with ambiguous translation (multiple valid options).
- Cultural adaptations made.
- Any untranslatable terms left in original language.
- Glossary of specialized terms used in the translation.

---

## Methodology & Standards

### Translation Principles

1. **Accuracy:** Technical meaning must be precisely preserved. No interpretation or simplification that changes technical meaning.
2. **Consistency:** Same source term is always translated to the same target term throughout the document.
3. **Naturalness:** Translation reads naturally in the target language; not word-for-word literal.
4. **Completeness:** All text content is translated, including tables, captions, annotations, headers, and footers.
5. **Industry Alignment:** Terminology follows established industry usage in the target language.

### Industry Terminology Glossaries

#### Asset Management (EN-ES Core Terms)

| English | Spanish | Notes |
|---------|---------|-------|
| Asset Management | Gestion de Activos | Not "Administracion de Activos" |
| Reliability | Confiabilidad | LATAM standard; "Fiabilidad" in Spain |
| Availability | Disponibilidad | |
| Maintainability | Mantenibilidad | |
| Life Cycle Cost | Costo de Ciclo de Vida | |
| Condition Monitoring | Monitoreo de Condicion | |
| Preventive Maintenance | Mantenimiento Preventivo | |
| Corrective Maintenance | Mantenimiento Correctivo | |
| Predictive Maintenance | Mantenimiento Predictivo | |
| Root Cause Analysis | Analisis de Causa Raiz | |
| Failure Mode | Modo de Falla | |
| Mean Time Between Failures | Tiempo Medio Entre Fallas | |
| Risk Assessment | Evaluacion de Riesgos | |
| Key Performance Indicator | Indicador Clave de Desempeno | |
| Spare Parts | Repuestos / Partes de Repuesto | "Repuestos" preferred in LATAM |
| Overhaul | Overhaul / Revision Mayor | "Overhaul" commonly used as-is |
| Turnaround | Parada de Planta / Turnaround | |
| Shutdown | Detencion / Parada | Context-dependent |
| Commissioning | Puesta en Marcha / Comisionamiento | |
| Decommissioning | Desmantelamiento / Descomisionamiento | |

#### Mining (EN-ES Core Terms)

| English | Spanish | Notes |
|---------|---------|-------|
| SAG Mill | Molino SAG | Acronym preserved |
| Ball Mill | Molino de Bolas | |
| Flotation Cell | Celda de Flotacion | |
| Thickener | Espesador | |
| Conveyor Belt | Correa Transportadora | "Cinta" in some regions |
| Haul Truck | Camion de Extraccion / CAEX | |
| Crusher | Chancador (CL) / Trituradora (general) | Regional variation |
| Tailings | Relaves | |
| Ore | Mineral | |
| Concentrate | Concentrado | |
| Recovery | Recuperacion | |
| Throughput | Rendimiento / Procesamiento | Context-dependent |
| Run-of-Mine | ROM / Mineral Run-of-Mine | |

### Translation Process Standards

1. **First pass:** Complete draft translation focusing on meaning transfer.
2. **Terminology check:** Verify all technical terms against glossary.
3. **Consistency check:** Ensure terminology consistency throughout document.
4. **Readability review:** Ensure natural flow in target language.
5. **Formatting check:** Verify all formatting elements are preserved.
6. **Numbers and units:** Verify correct format for target locale.

### Number and Unit Formatting by Locale

| Element | EN-US | ES-CL | PT-BR |
|---------|-------|-------|-------|
| Decimal separator | . (period) | , (comma) | , (comma) |
| Thousands separator | , (comma) | . (period) | . (period) |
| Date format | MM/DD/YYYY | DD/MM/YYYY | DD/MM/YYYY |
| Currency | USD 1,000.50 | USD 1.000,50 | R$ 1.000,50 |

---

## Step-by-Step Execution

### Phase 1: Preparation (Steps 1-3)

**Step 1: Analyze source document.**
- Detect source language (confirm or auto-detect).
- Identify document type and industry sector.
- Scan for technical terminology density.
- Note formatting elements to preserve (tables, figures, headers).

**Step 2: Load terminology resources.**
- Load industry-specific glossary for the relevant sector.
- Load any project-specific or client-specific glossary.
- If parallel text provided, extract terminology usage patterns.
- Create working glossary for this translation.

**Step 3: Plan translation approach.**
- Identify sections requiring special attention (highly technical, legal, regulatory).
- Note any content that should not be translated (proper nouns, brand names, codes).
- Determine number/unit format adaptation requirements.
- Note regional language preferences.

### Phase 2: Translation (Steps 4-6)

**Step 4: Translate main content.**
- Translate section by section, maintaining document structure.
- Apply consistent terminology from glossary.
- Preserve all formatting elements.
- Flag ambiguous terms or passages for translation notes.

**Step 5: Translate supplementary elements.**
- Translate tables (headers and content).
- Translate figure captions and annotations.
- Translate headers, footers, and metadata.
- Translate table of contents and index entries.
- Adapt cross-references to translated content.

**Step 6: Review and refine.**
- Consistency check: verify same term is used throughout.
- Readability review: ensure natural flow.
- Technical accuracy: verify technical meaning is preserved.
- Format check: confirm all formatting is intact.

### Phase 3: Quality & Delivery (Steps 7-8)

**Step 7: Produce translation notes.**
- Document key terminology decisions.
- List ambiguous terms with chosen translation and alternatives.
- Note any cultural or regional adaptations.
- Compile glossary of specialized terms used.

**Step 8: Deliver outputs.**
- Generate `.docx` translated document.
- Generate `.md` translation notes.
- Confirm output matches original document structure and page flow.

---

## Quality Criteria

### Accuracy
- [ ] Technical meaning is precisely preserved in all sections.
- [ ] Numbers, data, and formulas are correctly transferred.
- [ ] No content is omitted or added beyond translation.

### Terminology
- [ ] Industry-standard terminology is used throughout.
- [ ] Terminology is consistent within the document.
- [ ] Glossary terms are correctly applied.
- [ ] Regional language preferences are followed.

### Readability
- [ ] Translation reads naturally in the target language.
- [ ] Sentence structure is adapted (not literal word-for-word).
- [ ] Appropriate register/formality for the document type.

### Formatting
- [ ] Document structure (headings, sections) is preserved.
- [ ] Tables, figures, and references are intact.
- [ ] Number and date formats match target locale.
- [ ] Headers, footers, and metadata are translated.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Any skill producing `.docx` output | Source documents for translation | Translation input |
| User | Source documents, language pair, preferences | Task specification |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-client-presentation` (C-PRES-012) | Translated content for multi-language presentations | Presentation localization |
| `create-case-study` (C-CASE-019) | Translated case studies | Multi-language case studies |
| Any skill requiring translated input | Translated documents | Localized content |

---

## Templates & References

### Templates
- `templates/translation_notes_template.md` - Standard translation notes format.
- `templates/glossary_template.xlsx` - Project glossary template.

### Reference Glossaries
- `glossaries/asset_management_EN_ES.xlsx` - Asset management terminology EN-ES.
- `glossaries/asset_management_EN_PT.xlsx` - Asset management terminology EN-PT.
- `glossaries/mining_EN_ES.xlsx` - Mining industry terminology EN-ES.
- `glossaries/oil_gas_EN_ES.xlsx` - Oil & gas terminology EN-ES.
- `glossaries/energy_EN_ES.xlsx` - Energy/power terminology EN-ES.

### Reference Documents
- VSC internal: "Glosario Tecnico VSC v2.0"
- ISO 55000 series (official EN and ES versions for terminology alignment)

---

## Examples

### Example 1: Maintenance Strategy Report EN to ES

**Input:**
- Source: "Maintenance Strategy Optimization Report.docx" (45 pages, English)
- Target: Spanish (Chile)
- Industry: Copper mining

**Expected Output:**
- "Maintenance_Strategy_Optimization_Report_ES_20241215.docx" (47 pages - Spanish typically 5-10% longer than English)
- All technical terms follow mining industry Spanish standards (Chile variant).
- "Crusher" translated as "Chancador" (Chilean usage, not "Trituradora").
- Translation notes documenting 12 key terminology decisions.

### Example 2: Proposal Document ES to EN

**Input:**
- Source: "Propuesta Tecnica - Gestion de Activos Planta Desaladora.docx" (28 pages, Spanish)
- Target: English (US)
- Industry: Water/desalination

**Expected Output:**
- "Propuesta_Tecnica_Gestion_Activos_Planta_Desaladora_EN_20241215.docx" (26 pages)
- "Gestion de Activos" consistently translated as "Asset Management".
- Technical KPIs and financial figures correctly formatted for EN-US locale.
- Professional tone maintained for client-facing proposal.
