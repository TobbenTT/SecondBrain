# GenSpark PPTX Enhancer

## Skill ID: D-004
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: Medium

## Purpose

Enhance PowerPoint presentations by leveraging GenSpark AI capabilities to improve visual design, content structure, data visualization, and narrative flow. This skill takes draft PPTX files, analyzes their content and structure, sends targeted enhancement requests to GenSpark, and produces polished presentations that meet professional standards for OR deliverables, client presentations, and executive reporting.

## Intent & Specification

**Problem:** OR teams produce content-rich but visually inconsistent presentations. Slides vary in formatting, lack compelling data visualization, have inconsistent terminology, and often fail to tell a coherent story. Manual enhancement is time-consuming and requires design skills most engineers lack. GenSpark can enhance presentations but requires structured prompting to produce OR-quality outputs.

**Success Criteria:**
- Presentations have consistent formatting, fonts, and color schemes
- Data tables are converted to appropriate charts and visualizations
- Narrative flow follows a logical structure (context, analysis, recommendation)
- Content density is optimized (not too sparse, not too dense per slide)
- OR-specific terminology and frameworks are correctly applied
- Brand guidelines are followed (logos, colors, footer format)
- Enhancement turnaround is under 15 minutes for a 30-slide deck

**Constraints:**
- Must preserve original content accuracy (enhance, not alter facts)
- Must maintain client confidentiality (no sensitive data sent to public APIs without authorization)
- Must support both English and Spanish presentations
- Must preserve embedded charts and links where possible
- Must output valid PPTX format compatible with Microsoft 365
- GenSpark API rate limits and token constraints apply

## Trigger / Invocation

**Manual Triggers:**
- `genspark-pptx-enhancer enhance --file [path] --style [template]`
- `genspark-pptx-enhancer review --file [path]` (analysis only, no changes)
- `genspark-pptx-enhancer fix --file [path] --issues [formatting|content|visuals|all]`

**Automatic Triggers:**
- Presentation uploaded to "For Enhancement" folder in shared drive
- OR report generation pipeline produces draft PPTX
- Pre-meeting enhancement trigger (24 hours before scheduled presentation)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| PPTX File | File system / Upload | Yes | The presentation to enhance |
| Style Template | Configuration | No | Brand/style template to apply (default: VSC OR Standard) |
| Enhancement Scope | Command argument | No | What to enhance: formatting, content, visuals, all (default: all) |
| Audience | Command argument | No | Target audience: executive, technical, client, internal |
| Language | Command argument | No | Output language: en, es (default: auto-detect) |
| Brand Assets | Configuration | No | Logos, color palette, font specifications |
| Content Guidelines | Configuration | No | OR-specific terminology and framework references |
| Confidentiality Level | Command argument | No | public, internal, confidential (affects what can be sent externally) |

**Style Template Configuration:**
```yaml
style_template:
  name: "VSC OR Standard"
  colors:
    primary: "#1B365D"
    secondary: "#4A90D9"
    accent: "#E67E22"
    success: "#27AE60"
    warning: "#F39C12"
    danger: "#E74C3C"
    background: "#FFFFFF"
    text: "#333333"
  fonts:
    title: "Calibri Bold, 28pt"
    subtitle: "Calibri, 20pt"
    body: "Calibri, 14pt"
    caption: "Calibri, 10pt"
  layout:
    title_position: "top-left"
    logo_position: "top-right"
    footer: "{Project Name} | {Date} | {Confidentiality} | Page {#}"
    margins: "0.5in"
  chart_style:
    default_type: "bar"
    color_sequence: ["#1B365D", "#4A90D9", "#E67E22", "#27AE60", "#F39C12"]
    gridlines: true
    data_labels: true
```

## Output Specification

**Primary Outputs:**
1. **Enhanced PPTX File:** Polished presentation with all enhancements applied
2. **Enhancement Report:** Detailed log of changes made
3. **Review Summary:** High-level summary for presenter review

**Enhancement Report:**
```json
{
  "file_name": "OR_Monthly_Report_v2_enhanced.pptx",
  "original_file": "OR_Monthly_Report_v2.pptx",
  "timestamp": "2025-04-15T14:30:00Z",
  "enhancements": {
    "slides_modified": 24,
    "slides_total": 30,
    "formatting_fixes": 45,
    "charts_created": 8,
    "tables_reformatted": 5,
    "content_restructured": 3,
    "images_repositioned": 12,
    "text_refined": 15,
    "slides_reordered": 2
  },
  "changes_by_slide": [
    {
      "slide": 1,
      "changes": ["Applied title slide template", "Added logo", "Updated date format"]
    },
    {
      "slide": 5,
      "changes": ["Converted data table to bar chart", "Reduced text density", "Added section header"]
    }
  ],
  "warnings": [
    "Slide 12: Chart data source link broken - static copy preserved",
    "Slide 18: Image resolution low (72dpi) - may appear blurry when projected"
  ]
}
```

## Methodology & Standards

- **Content Preservation:** Original data, facts, and conclusions are never altered. Enhancement applies to presentation, not substance.
- **Progressive Enhancement:** Start with formatting consistency, then structure, then visuals, then narrative flow.
- **Audience Adaptation:** Executive decks favor high-level visuals and key metrics. Technical decks favor detailed data and methodology. Client decks favor polished design and clear takeaways.
- **Data Visualization Standards:** Follow Edward Tufte principles - maximize data-ink ratio, minimize chartjunk, use appropriate chart types for data relationships.
- **Slide Density:** Target 3-5 key points per slide. Move dense content to appendix slides.
- **Narrative Arc:** Introduction (context/problem), Analysis (data/findings), Recommendation (actions/next steps), Appendix (supporting detail).

## Step-by-Step Execution

### Step 1: Analyze Input Presentation
1. Open PPTX file and extract all content (text, images, charts, tables)
2. Identify slide types (title, content, data, divider, conclusion, appendix)
3. Catalog formatting inconsistencies (fonts, sizes, colors, alignment)
4. Identify data tables that could be visualized
5. Assess content density per slide
6. Check brand compliance (logos, colors, footer)
7. Detect language and terminology patterns

### Step 2: Create Enhancement Plan
1. Based on analysis, prioritize enhancements:
   a. Critical: formatting inconsistencies, missing branding, broken elements
   b. Important: data visualization opportunities, content density issues
   c. Nice-to-have: narrative flow optimization, animation suggestions
2. Estimate enhancement effort and set expectations
3. Check confidentiality level and determine what can be sent to GenSpark

### Step 3: Apply Formatting Consistency
1. Apply style template to all slides (fonts, colors, backgrounds)
2. Standardize title positions, bullet formatting, and spacing
3. Add/update headers and footers
4. Apply consistent logo placement
5. Fix alignment and spacing issues
6. Standardize date formats and number formatting

### Step 4: Enhance Data Visualization
1. For each data table:
   a. Analyze data structure (comparison, trend, composition, distribution)
   b. Select appropriate chart type
   c. Generate chart with brand colors and proper labels
   d. Place chart on slide, move raw data to notes or appendix
2. For existing charts:
   a. Apply brand color scheme
   b. Ensure proper labels, legends, and titles
   c. Remove unnecessary gridlines or decoration

### Step 5: Optimize Content Structure
1. Review content density per slide:
   a. If too dense: split into multiple slides or move detail to appendix
   b. If too sparse: consolidate with adjacent slides
2. Add section divider slides for major topic transitions
3. Ensure conclusion/recommendation slides summarize key points
4. Add slide numbers and agenda references

### Step 6: Refine Narrative Flow
1. Send slide outline to GenSpark for narrative analysis
2. Identify logical gaps or ordering issues
3. Suggest slide reordering for better story flow
4. Add transition phrases or connecting content between sections
5. Ensure executive summary slide captures all key messages

### Step 7: Quality Assurance
1. Verify all original content is preserved (diff check)
2. Test PPTX opens correctly in Microsoft 365
3. Check all internal links and cross-references
4. Verify chart data accuracy matches original tables
5. Spell-check in target language
6. Generate enhancement report

### Step 8: Deliver and Log
1. Save enhanced PPTX with naming convention: `{original}_enhanced.pptx`
2. Generate review summary for presenter
3. Log enhancement operation
4. Notify requestor of completion

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Content Preservation | Original facts and data unchanged | 100% |
| Format Consistency | Slides following style template | > 95% |
| Brand Compliance | Correct logos, colors, fonts | 100% |
| Data Visualization | Tables converted to appropriate charts | > 80% of candidates |
| Slide Density | Slides within 3-5 key points | > 90% |
| Enhancement Speed | Time for 30-slide deck | < 15 minutes |
| File Compatibility | Opens correctly in MS 365 | 100% |
| Presenter Satisfaction | Feedback rating | > 4/5 |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `generate-or-report` | Upstream | Report generator produces draft PPTX for enhancement |
| `airtable-report-generator` | Upstream | CRM reports may need enhancement before presentation |
| `agent-or-pmo` | Consumer | PMO presentations enhanced for gate reviews |
| `agent-communications` | Consumer | Stakeholder presentations enhanced |
| `agent-doc-control` | Downstream | Enhanced presentations filed in document repository |

## Templates & References

**Slide Type Templates:**
```
Title Slide: Project name, subtitle, date, logos, classification
Agenda Slide: Numbered list with section references
Section Divider: Section title, icon, brief description
Content Slide: Header, 3-5 bullet points, supporting visual
Data Slide: Header, chart/graph, key insight callout
Comparison Slide: Side-by-side or matrix layout
Timeline Slide: Horizontal or vertical milestone view
Dashboard Slide: 4-6 KPI tiles with status indicators
Recommendation Slide: Header, action items, owners, dates
Appendix Slide: Detailed data, references, supporting material
```

**Enhancement Checklist:**
```
[ ] Style template applied consistently
[ ] All slides have headers and footers
[ ] Logo correctly placed on all slides
[ ] Font sizes consistent by element type
[ ] Color scheme follows brand guidelines
[ ] Data tables have corresponding visualizations
[ ] Slide density within target range
[ ] Narrative flow is logical
[ ] Spelling and grammar checked
[ ] File opens correctly in target application
[ ] Original content verified unchanged
```

## Examples

**Example 1: Monthly OR Report Enhancement**
```
Command: genspark-pptx-enhancer enhance --file "OR_Monthly_Mar2025.pptx" --audience executive

Analysis:
  - 30 slides, 8 formatting inconsistencies, 5 data tables without charts
  - 3 slides over-dense (>8 points), 2 slides under-dense
  - Missing section dividers, no executive summary

Enhancements Applied:
  1. Applied VSC OR Standard template to all slides
  2. Created 5 charts: 2 bar charts (progress), 1 line chart (trend), 1 pie chart (budget), 1 Gantt (schedule)
  3. Split 3 dense slides into 6 slides + moved detail to appendix
  4. Added executive summary slide with 5 key metrics
  5. Added 4 section dividers
  6. Reordered slides for narrative flow
  7. Added consistent footers and slide numbers

Output: "OR_Monthly_Mar2025_enhanced.pptx" (38 slides, fully formatted)
```

**Example 2: Client Presentation Review Only**
```
Command: genspark-pptx-enhancer review --file "Client_Presentation_ClienteX.pptx"

Review Summary:
  Issues Found: 12
  Critical:
    - Slide 3: Wrong logo version (old branding)
    - Slide 14: Data table shows internal cost codes (confidential)
  Important:
    - Slides 7-10: Inconsistent bullet formatting
    - Slide 15: Pie chart with 12 slices (too many, consolidate)
    - Slides 2, 8, 19: Text overflows text box
  Minor:
    - Slide 1: Date format "03/15/25" should be "March 15, 2025"
    - Slides 5, 9: Alignment slightly off

  Recommendation: Address critical issues before client meeting. Run full enhancement to fix all issues.
```
