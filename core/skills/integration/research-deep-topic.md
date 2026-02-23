# Research Deep Topic

## Skill ID: C-RES-009

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P1 - Critical (accelerates knowledge acquisition and report quality)

---

## Purpose

Conduct comprehensive technical deep research on a specified topic, synthesizing information from multiple sources to produce a well-structured executive research report. This skill is designed for industrial asset management, reliability engineering, mining, energy, and infrastructure topics, delivering research quality suitable for client-facing reports, proposal support, and internal knowledge building.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Research** a technical topic in depth using multiple source types (academic papers, industry standards, case studies, vendor documentation, regulatory sources).
2. **Synthesize** findings into a coherent, structured narrative.
3. **Provide** executive-level summaries alongside technical detail.
4. **Deliver** outputs in `.md` (quick review) and `.docx` (formal report) formats.
5. **Cite** all sources with proper references.

---

## Trigger / Invocation

**Command:** `/research-deep-topic`

**Trigger Conditions:**
- User requests technical research on a specific topic.
- A proposal or report requires state-of-the-art review on a technology or methodology.
- Internal knowledge building requires structured research.
- Client questions require evidence-based responses.

**Aliases:**
- `/deep-research`
- `/technical-research`
- `/research`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `topic` | Text | Clear statement of the research topic |
| `scope` | Text | Boundaries: what to include/exclude, geographic focus, time period |
| `depth_level` | Text | Level of detail: "Executive Overview" (2-5 pages), "Standard" (5-15 pages), "Deep Dive" (15-30+ pages) |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `audience` | Text | Target audience (C-level, technical manager, engineer, regulator) |
| `context` | Text | Why this research is needed; specific questions to answer |
| `known_sources` | List | Sources already known that should be included |
| `language` | Text | Output language (ES/EN/PT, default: match input language) |
| `industry_focus` | Text | Specific industry application (mining, oil & gas, energy, water) |
| `deliverable_format` | Text | Preferred format (.md only, .docx only, or both) |
| `deadline_context` | Text | How quickly results are needed (affects depth vs. speed tradeoff) |

---

## Output Specification

### Primary Output 1: Research Report (`.md`)

**File naming:** `{topic_slug}_research_report_{YYYYMMDD}.md`

**Report structure:**

```markdown
# [Research Topic Title]

## Executive Summary
[1-2 paragraph summary of key findings and implications]

## 1. Introduction & Context
### 1.1 Background
### 1.2 Scope and Objectives
### 1.3 Methodology

## 2. Current State of Knowledge
### 2.1 [Key Theme 1]
### 2.2 [Key Theme 2]
### 2.3 [Key Theme 3]

## 3. Industry Applications & Case Studies
### 3.1 [Case Study / Application 1]
### 3.2 [Case Study / Application 2]

## 4. Best Practices & Standards
### 4.1 Relevant Standards and Frameworks
### 4.2 Industry Best Practices

## 5. Emerging Trends & Future Outlook
### 5.1 Technology Trends
### 5.2 Regulatory Trends
### 5.3 Market Trends

## 6. Implications for [Client/Project/VSC]
### 6.1 Key Takeaways
### 6.2 Recommendations
### 6.3 Risks and Considerations

## 7. References
[Numbered reference list with full citations]

## Appendices (if applicable)
```

### Primary Output 2: Formal Report (`.docx`)

**File naming:** `{topic_slug}_research_report_{YYYYMMDD}.docx`

Same content as `.md` but formatted with:
- VSC document template (header, footer, styles).
- Table of contents.
- List of figures and tables.
- Professional formatting and pagination.

---

## Methodology & Standards

### Research Methodology

#### Source Hierarchy (priority order)

1. **Tier 1 - Primary/Authoritative:**
   - International standards (ISO, IEC, IEEE, ASTM).
   - Peer-reviewed academic journals.
   - Government and regulatory publications.

2. **Tier 2 - Industry:**
   - Industry association publications (ICMM, SMRP, EFNMS, IAM).
   - Conference proceedings (CMCM, MARCON, WCEAM).
   - Recognized industry reports (McKinsey, Deloitte, Ernst & Young).

3. **Tier 3 - Practitioner:**
   - Vendor/OEM technical documentation and white papers.
   - Case studies from reputable companies.
   - Trade publications and specialized media.

4. **Tier 4 - Supporting:**
   - Industry websites and blogs from recognized experts.
   - Online databases and repositories.
   - News articles from established media.

#### Research Process

1. **Scope definition:** Clarify topic boundaries, key questions, and depth requirements.
2. **Source identification:** Systematic search across source tiers.
3. **Source evaluation:** Assess credibility, relevance, recency, and authority.
4. **Information extraction:** Extract key findings, data points, and insights.
5. **Synthesis:** Integrate findings into coherent themes and narrative.
6. **Gap identification:** Note where information is insufficient or contradictory.
7. **Quality review:** Verify facts, check for bias, ensure balanced perspective.

#### Depth Level Guidelines

| Depth Level | Pages | Sources | Typical Turnaround |
|-------------|-------|---------|-------------------|
| Executive Overview | 2-5 | 5-10 | Fast (hours) |
| Standard | 5-15 | 10-25 | Medium (1 day) |
| Deep Dive | 15-30+ | 25-50+ | Extended (2-3 days) |

### Quality Standards for Research

1. **Accuracy:** All factual claims are supported by cited sources.
2. **Currency:** Information is current (prefer sources < 5 years old unless historical context needed).
3. **Balance:** Multiple perspectives are presented; biases are acknowledged.
4. **Relevance:** All content directly serves the stated scope and audience.
5. **Clarity:** Technical content is explained at the appropriate level for the audience.
6. **Originality:** Synthesis provides unique insights, not just compilation.

---

## Step-by-Step Execution

### Phase 1: Planning (Steps 1-2)

**Step 1: Clarify research scope.**
- Confirm topic, scope boundaries, and key questions.
- Identify the target audience and appropriate depth level.
- Determine output format(s) required.
- Set expectations for coverage and limitations.

**Step 2: Design research plan.**
- Define search terms and queries.
- Identify key source categories to investigate.
- Plan the report structure based on expected content themes.
- Estimate effort and identify any potential limitations.

### Phase 2: Research Execution (Steps 3-5)

**Step 3: Conduct systematic search.**
- Search across source tiers for relevant information.
- Prioritize authoritative and recent sources.
- Document all sources with full citation information.
- Note source quality and relevance assessment.

**Step 4: Extract and organize findings.**
- Extract key data points, findings, and insights from each source.
- Organize by theme/topic area.
- Identify areas of consensus and areas of debate/contradiction.
- Note gaps in available information.

**Step 5: Synthesize and analyze.**
- Develop coherent narrative across themes.
- Identify patterns, trends, and implications.
- Formulate insights specific to the client/project context.
- Develop recommendations based on evidence.

### Phase 3: Report Production (Steps 6-8)

**Step 6: Draft report.**
- Write executive summary (last, after full analysis).
- Develop each section with appropriate depth.
- Include relevant data, statistics, and examples.
- Ensure logical flow and clear transitions.

**Step 7: Add references and citations.**
- Format all references consistently.
- Ensure every factual claim has a supporting citation.
- Add figures, tables, and diagrams where they add value.

**Step 8: Quality review and finalize.**
- Review for accuracy, completeness, and clarity.
- Check for bias or unsupported claims.
- Verify all references are accessible and correctly cited.
- Produce final `.md` and `.docx` outputs.

---

## Quality Criteria

### Content Quality
- [ ] Executive summary captures all key findings in 1-2 paragraphs.
- [ ] All factual claims are supported by cited sources.
- [ ] Minimum source count met for the specified depth level.
- [ ] Information is current (majority of sources < 5 years old).
- [ ] Multiple perspectives are represented.

### Structure & Readability
- [ ] Report follows the specified structure.
- [ ] Content flows logically from section to section.
- [ ] Technical terms are defined or explained for the target audience.
- [ ] Figures and tables are properly labeled and referenced.

### Relevance & Actionability
- [ ] Content directly addresses the stated scope and questions.
- [ ] Implications for the client/project are explicitly stated.
- [ ] Recommendations are specific and evidence-based.
- [ ] Report is at the appropriate depth level for the audience.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| Project Orchestrator | Research requests from project scope | Task assignment |
| User | Topic, scope, and context specification | Research framing |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-client-presentation` (C-PRES-012) | Research findings for slides | Presentation content |
| `analyze-gap-assessment` (B-GAP-005) | Best practice references | Assessment calibration |
| `analyze-benchmark` (B-BENCH-006) | Industry benchmark data | Benchmark sourcing |
| `create-case-study` (C-CASE-019) | Technical context for case studies | Background content |
| `create-executive-briefing` (C-BRIEF-018) | Topic briefing material | Meeting preparation |

---

## Templates & References

### Templates
- `templates/research_report_template.docx` - VSC research report template.
- `templates/research_report_structure.md` - Standard markdown structure.

### Reference Documents
- VSC internal: "Guia de Investigacion Tecnica y Reporte v1.0"
- Standard citation format: APA 7th Edition (adapted for technical reports)

---

## Examples

### Example 1: Predictive Maintenance Technologies for Mining

**Input:**
- Topic: "Predictive Maintenance Technologies applicable to SAG Mill operations"
- Scope: Current technologies, implementation case studies, ROI evidence, emerging AI/ML applications
- Depth: Standard (5-15 pages)
- Audience: Mining VP Operations
- Industry: Copper mining

**Expected Output:**
- 12-page report covering vibration analysis, oil analysis, thermography, acoustic emission, and AI/ML approaches.
- 18 cited sources (3 academic papers, 5 industry reports, 4 case studies, 6 vendor/practitioner sources).
- Key finding: Vibration-based monitoring with ML pattern recognition achieves 85-92% failure prediction accuracy for SAG mill gear drives.
- Recommendation: Phased implementation starting with vibration monitoring, adding AI analytics in Phase 2.

### Example 2: ISO 55001 Implementation Best Practices

**Input:**
- Topic: "Best practices for ISO 55001 implementation in Latin American utilities"
- Scope: Implementation frameworks, common challenges, success factors, case studies from LATAM
- Depth: Executive Overview (2-5 pages)
- Audience: C-level utility executives
- Language: Spanish

**Expected Output:**
- 4-page executive summary in Spanish.
- 8 cited sources including IAM, GFMAM, and 3 LATAM case studies.
- Key finding: Organizations achieve certification in 18-36 months; critical success factor is leadership commitment.
- Recommendation: Start with gap assessment, focus on quick wins to build momentum.
