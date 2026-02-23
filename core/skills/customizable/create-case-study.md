# Create Case Study

## Skill ID: C-CASE-019

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (critical for marketing, proposals, and credibility building)

---

## Purpose

Develop professional VSC case studies that communicate project value, methodology, and results in a compelling narrative format. This skill transforms raw project data and outcomes into polished, publishable case studies suitable for marketing materials, proposals, website content, and sales collateral.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Structure** project outcomes into the standard case study narrative (Challenge-Approach-Results).
2. **Quantify** value delivered using clear, compelling metrics and KPIs.
3. **Highlight** VSC's methodology and differentiators.
4. **Produce** outputs in both `.docx` (detailed) and `.pptx` (visual) formats.
5. **Ensure** client confidentiality by anonymizing sensitive information when needed.

---

## Trigger / Invocation

**Command:** `/create-case-study`

**Trigger Conditions:**
- User requests a case study from a completed or ongoing project.
- Marketing materials need project success stories.
- A proposal requires relevant project examples.
- Website or LinkedIn content needs case study material.

**Aliases:**
- `/case-study`
- `/success-story`
- `/project-case`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `project_data` | Text, `.xlsx`, or `.docx` | Project scope, context, approach, and activities performed |
| `results` | Text or `.xlsx` | Quantified outcomes: KPIs improved, savings achieved, goals met |
| `kpis` | List or `.xlsx` | Specific before/after metrics demonstrating value |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `client_name` | Text | Client name (or indicate if anonymization is required) |
| `client_industry` | Text | Industry sector for context |
| `project_duration` | Text | Project timeline |
| `team_size` | Number | VSC team size on the project |
| `client_testimonial` | Text | Client quote or endorsement |
| `photos` | `.jpg`, `.png` | Project or site photos (with permission) |
| `challenges_faced` | Text | Specific challenges encountered and how they were overcome |
| `vsc_differentiator` | Text | What made VSC's approach unique or superior |
| `target_audience` | Text | Who will read the case study (prospects in same industry, general market) |
| `language` | Text | Output language: ES, EN, PT |
| `confidentiality` | Text | Level of anonymization: full name, industry only, fully anonymous |
| `tools_used` | List | Specific methodologies, tools, or technologies used |

---

## Output Specification

### Primary Output 1: Case Study Document (`.docx`)

**File naming:** `VSC_case_study_{client_or_code}_{YYYYMMDD}.docx`

**Document structure:**

```
[Header with VSC branding]

CASE STUDY
==========

[Hero section with key metric and one-line summary]

CLIENT PROFILE
--------------
- Industry: [Industry]
- Location: [Country/Region]
- Operation: [Type and scale]
- Assets: [Scope of asset base]

THE CHALLENGE
-------------
[2-3 paragraphs describing the client's situation and pain points]

Key Challenges:
- [Challenge 1]
- [Challenge 2]
- [Challenge 3]

OUR APPROACH
------------
[2-3 paragraphs describing VSC's methodology and approach]

Key Activities:
- [Activity 1]
- [Activity 2]
- [Activity 3]

Methodology / Standards Applied:
- [Standard 1]
- [Standard 2]

THE RESULTS
-----------
[1-2 paragraphs summarizing the outcomes]

Key Metrics:
| KPI | Before | After | Improvement |
|-----|--------|-------|-------------|
| [KPI 1] | [Value] | [Value] | [% or absolute] |
| [KPI 2] | [Value] | [Value] | [% or absolute] |
| [KPI 3] | [Value] | [Value] | [% or absolute] |

Financial Impact:
- [Savings / Revenue gain / Cost reduction quantified]
- [ROI calculation]

CLIENT TESTIMONIAL (if available)
---------------------------------
"[Quote from client stakeholder]"
- [Name], [Title], [Company]

VALUE DELIVERED
--------------
[Summary paragraph emphasizing the broader value and applicability]

Key Takeaways:
1. [Lesson or insight applicable to similar organizations]
2. [Lesson or insight]
3. [Lesson or insight]

ABOUT VSC
---------
[Standard VSC boilerplate]

[Footer with contact information]
```

### Primary Output 2: Case Study Presentation (`.pptx`)

**File naming:** `VSC_case_study_{client_or_code}_presentation_{YYYYMMDD}.pptx`

**Slide structure (6-8 slides):**

| Slide | Content |
|-------|---------|
| 1 | Title: Case study name, hero metric, client logo placeholder |
| 2 | Client profile and challenge summary |
| 3 | The challenge (visual: pain points with icons/images) |
| 4 | Our approach (visual: methodology timeline or framework diagram) |
| 5 | Results dashboard (key metrics with before/after visuals) |
| 6 | Financial impact (ROI, savings, payback) |
| 7 | Client testimonial (if available) |
| 8 | Key takeaways and VSC contact information |

---

## Methodology & Standards

### Case Study Narrative Framework

#### Challenge-Approach-Results (CAR)

```
Challenge (30% of content):
- Paint the picture of the problem.
- Make it relatable to the target audience.
- Quantify the pain (cost of inaction, risk, lost production).
- Create emotional and rational motivation.

Approach (30% of content):
- Describe what VSC did, not just what was done.
- Highlight methodology and standards.
- Show the team's expertise and collaboration with the client.
- Include specific tools and techniques used.

Results (40% of content):
- Lead with the most impressive metric.
- Show before/after comparison.
- Quantify financial impact (savings, revenue, ROI).
- Include operational improvements (availability, reliability, safety).
- Mention intangible benefits (culture change, capability building).
```

### Metric Presentation Guidelines

1. **Lead with the biggest number:** The most impressive result should appear first and prominently.
2. **Before/After pairs:** Always show the baseline and the improved state.
3. **Relative and absolute:** Show both percentage improvement and absolute value.
4. **Financial translation:** Convert operational improvements to financial impact where possible.
5. **Time context:** Specify when results were measured (e.g., "within 6 months of implementation").

### Anonymization Levels

| Level | What is disclosed | What is hidden |
|-------|-------------------|----------------|
| **Full disclosure** | Client name, specific details | Nothing |
| **Industry only** | Industry, general scale, location region | Company name, exact location, specific equipment models |
| **Fully anonymous** | Industry type only | Company name, location, specific details |

### Quality Standards

1. **Truthful:** All metrics must be accurate and verifiable.
2. **Compelling:** The narrative should engage the reader and demonstrate clear value.
3. **Specific:** Avoid vague claims; use concrete numbers and examples.
4. **Concise:** Document case study: 2-4 pages. Presentation: 6-8 slides.
5. **Professional:** Consistent with VSC brand standards.
6. **Reusable:** Written for the target audience, not just the specific client.

---

## Step-by-Step Execution

### Phase 1: Data Collection & Analysis (Steps 1-3)

**Step 1: Gather project information.**
- Collect project scope, approach, activities, and timeline.
- Gather results data: KPIs, metrics, financial outcomes.
- Identify the most compelling outcomes.
- Check client authorization for case study use.

**Step 2: Identify the narrative angle.**
- Determine the primary message (e.g., "RAM analysis identified hidden bottleneck saving USD 8M").
- Select the most impactful "hero metric" for the lead.
- Identify the target audience for the case study.
- Determine anonymization level required.

**Step 3: Structure the story.**
- Define the challenge (3 key pain points).
- Outline the approach (key activities and methodology).
- Compile results (ordered by impact).
- Identify a client testimonial or endorsement (if available).

### Phase 2: Content Creation (Steps 4-6)

**Step 4: Write the challenge section.**
- Describe the client's situation in relatable terms.
- Quantify the pain (cost, risk, lost production).
- Make it relevant to the target audience.
- Build tension that the approach section will resolve.

**Step 5: Write the approach section.**
- Describe VSC's methodology in accessible language.
- Highlight what was unique or differentiated about the approach.
- Show collaboration with the client team.
- Reference relevant standards and frameworks.

**Step 6: Write the results section.**
- Lead with the hero metric.
- Present before/after comparisons for key KPIs.
- Translate operational improvements to financial impact.
- Include ROI calculation.
- Add key takeaways applicable to similar organizations.

### Phase 3: Production & Quality (Steps 7-9)

**Step 7: Build the document.**
- Assemble the `.docx` with proper formatting and branding.
- Add client profile section.
- Include testimonial if available.
- Add VSC boilerplate.

**Step 8: Build the presentation.**
- Create 6-8 slides following the specified structure.
- Design visually impactful results slides.
- Include charts and metrics visualizations.
- Apply VSC brand template.

**Step 9: Quality review.**
- Verify all metrics are accurate and well-sourced.
- Confirm anonymization requirements are met.
- Check narrative flow and compelling nature.
- Ensure both document and presentation are consistent.
- Verify client authorization.

---

## Quality Criteria

### Content Quality
- [ ] Hero metric is prominently featured and compelling.
- [ ] Challenge is relatable and creates tension.
- [ ] Approach clearly explains VSC's value-add.
- [ ] Results are quantified with before/after metrics.
- [ ] Financial impact is calculated (ROI, payback, savings).

### Accuracy
- [ ] All metrics are accurate and traceable to project data.
- [ ] Timeline and scope are correctly stated.
- [ ] Methodology description is factually correct.
- [ ] Anonymization requirements are fully met.

### Professional Standards
- [ ] Consistent with VSC brand guidelines.
- [ ] Document is 2-4 pages (concise, not bloated).
- [ ] Presentation is 6-8 slides (impactful, not cluttered).
- [ ] No spelling, grammar, or formatting errors.
- [ ] Suitable for external publication.

### Marketing Effectiveness
- [ ] Case study would be compelling to the target audience.
- [ ] Key takeaways are applicable beyond this specific client.
- [ ] VSC's expertise and methodology are clearly demonstrated.
- [ ] Call to action or contact information is included.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-equipment-criticality` (B-CRIT-001) | Criticality analysis results | Results content |
| `analyze-reliability` (B-REL-004) | Reliability improvement metrics | Results content |
| `model-ram-simulation` (B-RAM-007) | Availability improvement data | Results content |
| `analyze-lifecycle-cost` (B-LCC-003) | LCC savings calculations | Financial impact |
| `analyze-benchmark` (B-BENCH-006) | Before/after benchmark positioning | Comparative results |
| `analyze-gap-assessment` (B-GAP-005) | Maturity improvement data | Assessment results |
| `analyze-scenarios` (B-SCEN-002) | Scenario analysis outcomes | Decision support results |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `create-linkedin-content` (C-LINK-016) | Case study teasers for social media | Content marketing |
| `create-client-presentation` (C-PRES-012) | Case study slides for proposals | Sales support |
| `translate-technical` (C-TRANS-011) | Case study for translation | Multi-language versions |

---

## Templates & References

### Templates
- `templates/case_study_template.docx` - Standard VSC case study document template.
- `templates/case_study_presentation_template.pptx` - Visual case study presentation template.

### Reference Documents
- VSC internal: "Guia de Desarrollo de Casos de Estudio v1.0"
- VSC internal: "Brand Guidelines - Case Studies"
- VSC internal: "Politica de Uso de Informacion de Clientes"

---

## Examples

### Example 1: Mining RAM Study Case Study

**Input:**
- Project: RAM analysis for copper concentrator, 47 equipment items.
- Duration: 8 weeks, 3-person VSC team.
- Results: Identified SAG mill gearbox as true bottleneck (not assumed crusher).
  Availability: 88.5% to 93.2%. Production gain: 1.2M tons/year. ROI: 14:1.
- Client: Anonymized as "Major copper producer in northern Chile."

**Expected Output:**
- Hero metric: "USD 8M annual production gain identified through data-driven RAM analysis."
- Challenge: Concentrator experiencing frequent unplanned downtime; maintenance resources misallocated to assumed bottleneck.
- Approach: Monte Carlo RAM simulation, Weibull reliability analysis, bottleneck identification.
- Results: 4.7% availability improvement, 1.2M additional tons/year, 14:1 ROI.
- Key takeaway: "Data-driven analysis reveals that operational bottlenecks often differ from management assumptions."

### Example 2: Asset Management Assessment Case Study

**Input:**
- Project: ISO 55001 gap assessment and improvement roadmap for water utility.
- Duration: 6 weeks assessment + 12 months implementation support.
- Results: Maturity 1.8 to 3.1 (Level 3 achieved). 18 improvements implemented. Maintenance cost reduced 12%.
- Client: Full disclosure authorized - "Aguas Regionales SA."

**Expected Output:**
- Hero metric: "From maturity 1.8 to 3.1: a water utility's journey to ISO 55001 readiness in 12 months."
- Challenge: Reactive maintenance culture, no formal AM framework, regulatory pressure for certification.
- Approach: PAS 55/ISO 55001 gap assessment, prioritized roadmap, phased implementation.
- Results: 72% maturity improvement, 18 processes formalized, 12% maintenance cost reduction.
- Testimonial: Quote from utility General Manager.
