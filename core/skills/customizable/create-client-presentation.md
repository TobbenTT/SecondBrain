# Create Client Presentation

## Skill ID: C-PRES-012

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P1 - Critical (primary client deliverable format)

---

## Purpose

Create professional, VSC-branded executive presentations for client delivery, transforming analysis results, project findings, and strategic recommendations into visually compelling and narratively coherent slide decks. This skill ensures consistency in visual identity, messaging structure, and professional quality across all client-facing presentations.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Structure** presentation content following proven storytelling frameworks (situation-complication-resolution, pyramid principle).
2. **Design** slides following VSC brand guidelines and professional presentation standards.
3. **Integrate** data from upstream analyses (criticality, RAM, LCC, benchmarks, scenarios) into clear charts and tables.
4. **Produce** `.pptx` files ready for client delivery or minor refinement.
5. **Adapt** tone, depth, and visual complexity based on audience profile.

---

## Trigger / Invocation

**Command:** `/create-client-presentation`

**Trigger Conditions:**
- User requests a client presentation or slide deck.
- Project deliverables include a presentation component.
- Analysis results need to be packaged for executive communication.
- A proposal or workshop requires slide materials.

**Aliases:**
- `/presentation`
- `/create-pptx`
- `/slides`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `content` | Text, `.md`, `.docx`, `.xlsx`, or combination | Source content for the presentation |
| `audience` | Text | Target audience: Board, C-level, VP, Manager, Technical, Workshop |
| `purpose` | Text | Presentation purpose: deliver findings, propose strategy, sell project, workshop, training |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `presentation_template` | `.pptx` | VSC branded template to use as base |
| `slide_count_target` | Number | Target number of slides (default: 15-25 for standard delivery) |
| `duration` | Number | Presentation time in minutes (to calibrate content density) |
| `language` | Text | Presentation language (ES/EN/PT) |
| `charts_data` | `.xlsx` | Data for charts and graphs |
| `images` | `.png`, `.jpg` | Images, diagrams, or photos to include |
| `previous_presentation` | `.pptx` | Previous version for update/revision |
| `key_message` | Text | The single most important message to convey |
| `client_name` | Text | Client name for title slides and headers |
| `project_name` | Text | Project name for context |
| `confidentiality` | Text | Confidentiality marking: Public, Internal, Confidential, Restricted |

---

## Output Specification

### Primary Output: Presentation (`.pptx`)

**File naming:** `{client_code}_{project_code}_presentation_{YYYYMMDD}.pptx`

**Standard slide structure (for Findings/Recommendations presentation):**

| Slide | Type | Content |
|-------|------|---------|
| 1 | Title | Project name, client logo placeholder, date, confidentiality |
| 2 | Agenda | Numbered agenda items matching presentation sections |
| 3 | Context | Project background, objectives, scope |
| 4 | Methodology | Approach, standards used, data sources |
| 5 | Section Divider | "Key Findings" |
| 6-10 | Content | Key findings with supporting data/charts (1 message per slide) |
| 11 | Section Divider | "Recommendations" |
| 12-15 | Content | Recommendations with justification and expected impact |
| 16 | Implementation | Proposed roadmap/timeline |
| 17 | Investment & Returns | Cost-benefit summary |
| 18 | Next Steps | Clear action items with owners and dates |
| 19 | Q&A | Questions slide |
| 20+ | Appendix | Supporting data, detailed tables, methodology details |

### Slide Design Specifications

| Element | Specification |
|---------|---------------|
| **Title Font** | Calibri or Arial, 28-32pt, Bold, Dark Gray (#333333) |
| **Body Font** | Calibri or Arial, 16-20pt, Regular, Dark Gray (#555555) |
| **Bullet Points** | Maximum 5 bullets per slide, max 2 lines per bullet |
| **Charts** | Clean, minimal design; max 2 charts per slide |
| **Colors** | VSC palette: Primary blue, accent green/orange, neutral grays |
| **Footer** | VSC logo, slide number, confidentiality marking, date |
| **Layout** | Maximum 60% text, minimum 40% visual/white space |

---

## Methodology & Standards

### Presentation Frameworks

#### Situation-Complication-Resolution (SCR)
Best for: Findings and recommendations presentations.
```
Situation: Where are we now? (Current state, context)
Complication: What is the problem/challenge? (Gaps, risks, costs)
Resolution: What should we do? (Recommendations, expected outcomes)
```

#### Pyramid Principle (Minto)
Best for: Complex technical presentations.
```
Start with the conclusion/recommendation.
Support with 3-5 key arguments.
Back each argument with data and evidence.
Detail in appendix.
```

#### AIDA (Attention-Interest-Desire-Action)
Best for: Proposals and sales presentations.
```
Attention: Compelling opening (industry trend, risk, opportunity).
Interest: Relevant capability and experience.
Desire: Value proposition and differentiation.
Action: Clear next steps and call to action.
```

### Slide Design Principles

1. **One Message Per Slide:** Each slide has a single clear takeaway, stated in the slide title.
2. **Slide Title = Key Message:** Title is a complete sentence stating the finding/insight, not just a topic label.
3. **Data Visualization First:** Prefer charts/diagrams over text tables where possible.
4. **Progressive Disclosure:** Complex information revealed through slide sequence, not single dense slides.
5. **Consistent Visual Language:** Same chart type for same data type throughout.
6. **Accessible Design:** Minimum contrast ratio 4.5:1, avoid red-green only distinctions.

### Slide Title Examples

| Bad (Topic-based) | Good (Message-based) |
|-------------------|---------------------|
| "Availability Results" | "Plant availability improved from 88% to 93% after strategy implementation" |
| "Maintenance Costs" | "Corrective maintenance accounts for 62% of total maintenance spend" |
| "Recommendations" | "Three priority actions will reduce unplanned downtime by 35%" |
| "Benchmarking" | "Current performance is in Q3; Q1 target is achievable within 24 months" |

### Chart Type Selection Guide

| Data Type | Recommended Chart | When to Use |
|-----------|------------------|-------------|
| Composition (parts of whole) | Pie chart, Stacked bar | Budget breakdown, criticality distribution |
| Comparison | Horizontal bar chart | Benchmark comparison, ranking |
| Trend over time | Line chart | KPI trends, availability history |
| Relationship | Scatter plot | Correlation between variables |
| Distribution | Histogram, Box plot | Reliability data, cost distribution |
| Process/Flow | Flowchart, Swimlane | Methodology, implementation roadmap |
| Sensitivity | Tornado diagram | Scenario analysis results |
| Maturity | Radar/Spider chart | Gap assessment results |
| Timeline | Gantt-style | Implementation roadmap |

---

## Step-by-Step Execution

### Phase 1: Planning (Steps 1-3)

**Step 1: Define presentation objectives.**
- Confirm audience, purpose, and key message.
- Determine appropriate framework (SCR, Pyramid, AIDA).
- Set target slide count based on duration (1 slide per 1-2 minutes).
- Identify available content inputs.

**Step 2: Structure the narrative.**
- Outline the story arc (beginning, middle, end).
- Define the key messages per section (3-5 sections maximum).
- Identify where data/charts will be needed.
- Plan the appendix content.

**Step 3: Gather and organize content.**
- Extract key findings from source analyses.
- Identify the most impactful data points and charts.
- Select appropriate chart types for each data visualization.
- Gather required images, diagrams, or photos.

### Phase 2: Content Creation (Steps 4-6)

**Step 4: Create slide content.**
- Write message-based titles for each slide.
- Develop bullet points (max 5, max 2 lines each).
- Create text boxes for key callouts and highlights.
- Write speaker notes with additional context per slide.

**Step 5: Create data visualizations.**
- Build charts from provided data.
- Apply consistent formatting and color scheme.
- Add data labels, legends, and source notes.
- Ensure charts are readable at projection distance.

**Step 6: Build the presentation.**
- Apply VSC template (or specified template).
- Assemble slides in logical narrative order.
- Add section dividers for major transitions.
- Include agenda, Q&A, and appendix slides.
- Apply consistent formatting throughout.

### Phase 3: Polish & Delivery (Steps 7-8)

**Step 7: Quality review.**
- Verify narrative flow and logical coherence.
- Check all data accuracy (numbers match source).
- Ensure visual consistency (fonts, colors, alignment).
- Review slide titles for message clarity.
- Confirm slide count is appropriate for duration.

**Step 8: Finalize and deliver.**
- Add confidentiality markings.
- Include VSC branding elements.
- Create speaker notes for key slides.
- Export final `.pptx` file.

---

## Quality Criteria

### Content Quality
- [ ] Clear narrative arc from situation through resolution.
- [ ] One clear message per slide.
- [ ] Slide titles are complete message sentences.
- [ ] Data accurately represents source analyses.
- [ ] Recommendations are specific and actionable.

### Visual Quality
- [ ] Consistent use of template and brand guidelines.
- [ ] Charts are clear, properly labeled, and readable.
- [ ] Maximum 5 bullet points per slide, max 2 lines each.
- [ ] Adequate white space (minimum 40% per slide).
- [ ] Font sizes readable at projection distance (min 16pt body).

### Professional Standards
- [ ] No spelling or grammar errors.
- [ ] Consistent terminology throughout.
- [ ] Source citations for all data points.
- [ ] Confidentiality marking on every slide.
- [ ] Slide numbers on all content slides.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `analyze-equipment-criticality` (B-CRIT-001) | Criticality results, distribution charts | Analysis content |
| `analyze-scenarios` (B-SCEN-002) | Scenario charts, tornado diagrams | Scenario analysis slides |
| `analyze-lifecycle-cost` (B-LCC-003) | LCC comparison charts | Cost analysis slides |
| `analyze-reliability` (B-REL-004) | Reliability curves, Weibull plots | Reliability slides |
| `analyze-gap-assessment` (B-GAP-005) | Maturity radar charts, gap tables | Assessment slides |
| `analyze-benchmark` (B-BENCH-006) | Benchmark comparison charts | Benchmarking slides |
| `model-ram-simulation` (B-RAM-007) | RAM results, availability distribution | RAM analysis slides |
| `research-deep-topic` (C-RES-009) | Research findings | Technical content |
| `summarize-documents` (C-SUM-010) | Document summaries | Background content |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| `translate-technical` (C-TRANS-011) | Presentation for translation | Multi-language versions |
| `create-case-study` (C-CASE-019) | Presentation slides | Case study visual content |

---

## Templates & References

### Templates
- `templates/vsc_presentation_template.pptx` - Standard VSC branded template.
- `templates/vsc_proposal_template.pptx` - Proposal/sales presentation template.
- `templates/vsc_workshop_template.pptx` - Workshop/training presentation template.

### Reference Documents
- VSC internal: "Guia de Identidad Visual y Presentaciones v2.0"
- VSC internal: "Brand Guidelines - VSC Consultores"

---

## Examples

### Example 1: Maintenance Strategy Findings Presentation

**Input:**
- Content: Criticality analysis results, reliability analysis, maintenance strategy recommendations.
- Audience: VP Operations and Maintenance Manager.
- Purpose: Present findings and get approval for strategy implementation.
- Duration: 45 minutes.

**Expected Output:**
- 22 slides + 8 appendix slides.
- Story arc: Current situation (high CM costs, low availability) > Root causes (criticality gaps, reactive culture) > Recommended strategy (shift to CBM for AA/A equipment) > Expected outcomes (93% availability, USD 4M savings) > Implementation roadmap (18 months, 3 phases).

### Example 2: Proposal Presentation

**Input:**
- Content: VSC capabilities, proposed methodology, team, timeline, investment.
- Audience: Client CEO and Board.
- Purpose: Win a new asset management consulting project.
- Duration: 30 minutes.

**Expected Output:**
- 15 slides.
- AIDA framework: Industry challenge > VSC differentiation > Proposed approach > Expected value > Investment and timeline > Next steps.
- Professional, aspirational tone. Client-specific customization.
