# Summarize Documents

## Skill ID: C-SUM-010

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P1 - Critical (daily productivity tool for document-heavy consulting work)

---

## Purpose

Generate executive summaries of long technical documents, extracting key information, findings, recommendations, and action items. This skill enables rapid document comprehension for consultants handling large volumes of technical reports, standards, contracts, and project documentation in asset management and industrial contexts.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Ingest** long documents in PDF and DOCX formats.
2. **Analyze** document structure, content hierarchy, and key information.
3. **Extract** critical elements: findings, recommendations, data points, decisions, action items.
4. **Produce** structured executive summaries calibrated to the target audience.
5. **Deliver** output in `.md` format for quick review and downstream use.

---

## Trigger / Invocation

**Command:** `/summarize-documents`

**Trigger Conditions:**
- User provides a document and requests a summary.
- A project requires rapid review of multiple documents.
- Pre-meeting preparation needs document synthesis.
- Knowledge transfer requires distillation of lengthy reports.

**Aliases:**
- `/summarize`
- `/executive-summary`
- `/doc-summary`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `source_documents` | `.pdf`, `.docx` (single or multiple) | Document(s) to be summarized |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `summary_type` | Text | Type: "executive" (1-2 pages), "detailed" (3-5 pages), "bullet points" (1 page) |
| `audience` | Text | Target reader: C-level, technical manager, project team, regulator |
| `focus_areas` | List | Specific topics or sections to emphasize |
| `language` | Text | Output language (default: match source document language) |
| `questions` | List | Specific questions the summary should answer |
| `context` | Text | Why the summary is needed (meeting prep, review, knowledge transfer) |
| `max_length` | Text | Maximum summary length (pages or word count) |

### Input Validation Rules

1. Source documents must be readable (not scanned images without OCR).
2. If multiple documents are provided, clarify if a single combined summary or individual summaries are needed.
3. Documents over 200 pages should be summarized in sections or with focus areas specified.

---

## Output Specification

### Primary Output: Executive Summary (`.md`)

**File naming:** `{original_filename}_summary_{YYYYMMDD}.md`

**Summary structure (Executive type):**

```markdown
# Executive Summary: [Document Title]

**Source:** [Original document filename and metadata]
**Date:** [Summary date]
**Prepared for:** [Audience]

## Key Takeaways
- [3-5 bullet points capturing the most important information]

## Document Overview
[1 paragraph: what the document is, who produced it, its purpose]

## Main Findings
### [Finding Category 1]
[Summary of key findings]

### [Finding Category 2]
[Summary of key findings]

## Recommendations
[Numbered list of recommendations from the document]

## Data Highlights
[Key numbers, statistics, KPIs mentioned in the document]

## Action Items / Next Steps
[If applicable: specific actions, responsibilities, deadlines mentioned]

## Critical Risks / Issues
[If applicable: risks, concerns, or issues raised in the document]

## Relevance to [Client/Project]
[Brief note on how this document relates to current work]
```

**Summary structure (Detailed type):**
- Same structure as Executive but with expanded sections.
- Includes section-by-section summary of the source document.
- Preserves more data points and nuance.
- Includes a table of contents.

**Summary structure (Bullet Points type):**
- Flat bullet-point list organized by theme.
- Maximum 1 page.
- Prioritized by importance.

---

## Methodology & Standards

### Summarization Methodology

#### Information Extraction Hierarchy

1. **Critical information (always include):**
   - Document purpose and scope.
   - Key findings and conclusions.
   - Recommendations and action items.
   - Quantitative data and KPIs.
   - Risks, issues, and warnings.
   - Decisions made or required.

2. **Important information (include in Detailed summaries):**
   - Methodology and approach used.
   - Supporting evidence and data.
   - Stakeholder positions and concerns.
   - Timeline and milestones.
   - Budget and resource information.
   - Regulatory and compliance aspects.

3. **Supporting information (include only if specifically requested):**
   - Detailed technical descriptions.
   - Historical context and background.
   - Appendix content.
   - Administrative details.

#### Summary Length Guidelines

| Summary Type | Target Length | Compression Ratio |
|-------------|-------------|-------------------|
| Bullet Points | 0.5-1 page | 50:1 to 100:1 |
| Executive | 1-2 pages | 20:1 to 50:1 |
| Detailed | 3-5 pages | 10:1 to 20:1 |

#### Audience Calibration

| Audience | Focus | Language Level | Detail Level |
|----------|-------|---------------|-------------|
| C-level | Business impact, decisions, risks | Non-technical, strategic | Minimal technical detail |
| Technical Manager | Findings, recommendations, resources | Semi-technical | Moderate detail |
| Project Team | Methods, data, action items | Technical | High detail |
| Regulator | Compliance, evidence, standards | Formal, regulatory | Standard-specific |

### Quality Standards

1. **Fidelity:** Summary must accurately represent the source document. No added interpretation unless explicitly requested.
2. **Proportionality:** Space allocated in summary should reflect importance in source.
3. **Objectivity:** Summary must be neutral; preserve the source author's tone and conclusions.
4. **Completeness:** No critical information should be omitted.
5. **Clarity:** Summary must be self-contained and understandable without reading the source.

---

## Step-by-Step Execution

### Phase 1: Document Analysis (Steps 1-3)

**Step 1: Ingest and scan document.**
- Parse the document structure (chapters, sections, headings).
- Identify document type (report, standard, contract, proposal, study).
- Note document metadata (author, date, organization, version).
- Estimate document length and complexity.

**Step 2: Identify key content areas.**
- Locate executive summaries or abstracts in the source (use as reference, not copy).
- Identify sections containing findings, recommendations, and conclusions.
- Flag quantitative data, tables, and charts with key numbers.
- Note any action items, deadlines, or decision points.

**Step 3: Determine summary approach.**
- Confirm summary type and target length.
- Adapt structure based on document type.
- Identify focus areas based on user guidance or inferred relevance.
- Plan the summary outline.

### Phase 2: Summarization (Steps 4-6)

**Step 4: Extract critical information.**
- Pull key findings and conclusions from each major section.
- Extract all recommendations (numbered, with brief rationale).
- Capture quantitative highlights (KPIs, metrics, financial figures).
- Note risks, issues, and concerns raised.
- List action items with owners and deadlines (if specified in source).

**Step 5: Synthesize into summary structure.**
- Write key takeaways (3-5 bullet points of highest importance).
- Develop document overview paragraph.
- Organize findings by theme or document section.
- Compile recommendations list.
- Prepare data highlights section.

**Step 6: Calibrate for audience.**
- Adjust language level for target audience.
- Emphasize aspects most relevant to the audience.
- Remove or simplify content below the audience's interest level.
- Add context bridges where needed for audience comprehension.

### Phase 3: Quality & Delivery (Steps 7-8)

**Step 7: Quality check.**
- Verify accuracy of all extracted facts and figures against source.
- Confirm no critical information is omitted.
- Check summary length against target.
- Ensure summary is self-contained and readable.

**Step 8: Deliver output.**
- Produce `.md` file with proper formatting.
- If multiple documents, provide individual summaries and/or a combined synthesis.
- Include source document metadata for traceability.

---

## Quality Criteria

### Accuracy
- [ ] All facts, figures, and quotes accurately represent the source document.
- [ ] No information is fabricated or inferred beyond what the source states.
- [ ] Recommendations and action items match the source exactly.

### Completeness
- [ ] All critical information categories are covered.
- [ ] No major finding or recommendation is omitted.
- [ ] Key quantitative data points are included.

### Usability
- [ ] Summary is self-contained (reader can understand without source).
- [ ] Structure is clear with effective headings and bullet points.
- [ ] Length meets the specified target.
- [ ] Language is appropriate for the target audience.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `extract-data-from-docs` (C-EXT-014) | Structured data from complex documents | Enhanced extraction for data-heavy docs |
| User | Source documents and summarization requirements | Task input |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-executive-briefing` (C-BRIEF-018) | Document summaries | Pre-meeting briefing content |
| `research-deep-topic` (C-RES-009) | Summarized reference materials | Research source processing |
| `analyze-gap-assessment` (B-GAP-005) | Summarized AM documentation | Evidence processing |
| `create-client-presentation` (C-PRES-012) | Key findings for slides | Presentation content |

---

## Templates & References

### Templates
- `templates/executive_summary_template.md` - Standard summary structure.
- `templates/multi_document_synthesis_template.md` - Template for multi-document summaries.

### Reference Documents
- VSC internal: "Estandar de Resumenes Ejecutivos v1.0"

---

## Examples

### Example 1: 150-page Maintenance Strategy Report

**Input:**
- Source: "Estrategia de Mantenimiento Planta Concentradora - Informe Final.pdf" (150 pages)
- Summary type: Executive (1-2 pages)
- Audience: VP Operations
- Focus: Key recommendations and estimated savings

**Expected Output:**
- 1.5-page executive summary.
- Key takeaways: 5 bullets covering strategic shift to condition-based maintenance, 3 priority equipment groups, USD 4.2M estimated annual savings, 18-month implementation timeline, required investment of USD 1.8M.
- 8 numbered recommendations extracted.
- Data highlights: current availability 88%, target 93%, ROI 2.3:1.

### Example 2: Multiple Standard Documents

**Input:**
- Sources: ISO 55001 (30 pages), PAS 55 (40 pages), GFMAM Landscape (80 pages)
- Summary type: Detailed (3-5 pages)
- Audience: Project team
- Focus: Comparison of requirements across the three frameworks

**Expected Output:**
- 4-page comparative summary.
- Side-by-side comparison table of key requirements.
- Common themes and unique elements per framework.
- Recommendation on which framework to adopt as primary reference.
