# Create LinkedIn Content

## Skill ID: C-LINK-016

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P3 - Medium (supports brand building and thought leadership)

---

## Purpose

Create compelling LinkedIn posts for VSC brand presence and individual consultant thought leadership. This skill generates content that positions VSC and its consultants as subject matter experts in asset management, reliability engineering, and industrial operations, driving engagement, brand awareness, and lead generation.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Draft** LinkedIn posts optimized for engagement and professional positioning.
2. **Adapt** tone and style for personal brand (individual consultant) or company page (VSC).
3. **Incorporate** industry insights, project learnings, and thought leadership angles.
4. **Optimize** for LinkedIn algorithm best practices (formatting, hashtags, CTAs).
5. **Deliver** publish-ready content in `.md` format.

---

## Trigger / Invocation

**Command:** `/create-linkedin-content`

**Trigger Conditions:**
- User requests a LinkedIn post draft.
- Thought leadership content creation is needed.
- VSC brand content calendar requires posts.
- Project milestone or achievement warrants social media sharing.

**Aliases:**
- `/linkedin-post`
- `/linkedin`
- `/social-media`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `topic` | Text | Subject matter or theme of the post |
| `key_message` | Text | The core insight, lesson, or point to communicate |
| `audience` | Text | Target audience: asset management professionals, mining executives, engineers, general industrial |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `post_type` | Text | Type: thought leadership, case study teaser, industry insight, how-to, question/poll, announcement |
| `author_profile` | Text | Personal brand (consultant name, expertise area) or VSC company page |
| `language` | Text | Post language: ES, EN, PT (default: match input) |
| `tone` | Text | Professional, conversational, provocative, educational (default: professional-conversational) |
| `data_points` | Text | Specific numbers, statistics, or results to include |
| `call_to_action` | Text | Desired reader action: comment, share, visit website, contact |
| `hashtags` | List | Specific hashtags to include |
| `max_length` | Text | Short (< 500 chars), Standard (500-1500 chars), Long (1500-3000 chars) |
| `visual_suggestion` | Boolean | Whether to suggest accompanying image/graphic concepts |

---

## Output Specification

### Primary Output: LinkedIn Post (`.md`)

**File naming:** `linkedin_post_{topic_slug}_{YYYYMMDD}.md`

**Output structure:**

```markdown
# LinkedIn Post: [Topic]

## Post Details
- **Author:** [Personal name / VSC]
- **Type:** [Thought Leadership / Case Study Teaser / etc.]
- **Target Audience:** [Description]
- **Language:** [ES/EN/PT]
- **Estimated Read Time:** [X seconds]

## Post Content

[Full post text, ready to copy-paste into LinkedIn]

## Hashtags
[Hashtag suggestions, 3-5 relevant hashtags]

## Visual Suggestion
[Description of recommended accompanying image, infographic, or carousel concept]

## Engagement Strategy
- **Best posting time:** [Suggested day/time for target audience]
- **First comment:** [Suggested first comment to boost engagement]
- **Engagement prompts:** [How to respond to comments]

## Alternative Versions
### Version B (shorter/longer)
[Alternative version with different angle or length]
```

---

## Methodology & Standards

### LinkedIn Content Principles

1. **Value First:** Every post must provide value (insight, learning, tool, perspective).
2. **Authentic Voice:** Sound like a real professional, not a marketing bot.
3. **Specific > Generic:** Use concrete examples, numbers, and real situations.
4. **Engagement-Oriented:** Invite discussion, not just broadcast.
5. **Professional Positioning:** Reinforce expertise without being overtly promotional.

### Post Format Best Practices

#### Hook (First 2-3 lines)
- Must stop the scroll. Visible before "see more."
- Use a bold statement, surprising statistic, or provocative question.
- Avoid clickbait; deliver on the promise.

#### Body
- Short paragraphs (1-3 lines each).
- Use line breaks for readability.
- Include a specific story, example, or data point.
- Build to the key insight or lesson.

#### Closing
- State the key takeaway clearly.
- Include a call to action (question, invitation to comment).
- Add hashtags (3-5 relevant ones).

### Content Types and Structures

| Type | Structure | Best For |
|------|-----------|----------|
| **Thought Leadership** | Bold claim > Supporting evidence > Implication > Question | Building authority |
| **Case Study Teaser** | Challenge > Approach > Result (specific numbers) > Lesson | Demonstrating value |
| **Industry Insight** | Trend observation > Data > What it means > What to do | Showing awareness |
| **How-To / Framework** | Problem > Framework intro > Steps (numbered) > Application | Providing tools |
| **Question / Poll** | Context > Provocative question > Your perspective > Invite discussion | Driving engagement |
| **Announcement** | News > Why it matters > What's next | Company milestones |
| **Lesson Learned** | Situation > What went wrong/right > Key learning > Advice | Authentic sharing |

### Hashtag Strategy

| Category | Hashtags (ES) | Hashtags (EN) |
|----------|---------------|---------------|
| Asset Management | #GestionDeActivos #ISO55000 | #AssetManagement #ISO55000 |
| Reliability | #Confiabilidad #MantenimientoPredictivo | #Reliability #PredictiveMaintenance |
| Mining | #Mineria #MiningIndustry | #Mining #MiningIndustry |
| General Industry | #IndustriaMinera #Operaciones | #IndustrialOperations #OandM |
| VSC Specific | #VSCConsultores #VSCChile | #VSCConsultants |

### LinkedIn Algorithm Optimization

1. **No external links in post body** (reduces reach by ~40%). Put links in first comment.
2. **Encourage comments** (comments weight 5x more than likes for reach).
3. **Reply to comments within 1 hour** of posting for algorithm boost.
4. **Post timing:** Tuesday-Thursday, 7-9 AM local time for LATAM professional audience.
5. **Optimal length:** 1,000-1,500 characters for maximum engagement.
6. **Use emojis sparingly** in professional context (1-3 max, relevant ones only).
7. **Carousels and documents** get higher reach than text-only posts.

---

## Step-by-Step Execution

### Phase 1: Content Planning (Steps 1-2)

**Step 1: Define post strategy.**
- Clarify topic, key message, and target audience.
- Select post type based on content and objective.
- Determine tone and length.
- Identify the unique angle or insight.

**Step 2: Research and prepare content.**
- Identify supporting data points or statistics.
- Consider the audience's pain points and interests.
- Find the "hook" - what will stop the scroll.
- Plan the narrative arc (hook > body > takeaway > CTA).

### Phase 2: Content Creation (Steps 3-5)

**Step 3: Write the hook.**
- Draft first 2-3 lines that are visible before "see more."
- Test: "Would I stop scrolling for this?"
- Ensure the hook connects to the key message.

**Step 4: Develop the body.**
- Write the supporting narrative with specific examples.
- Include data points, stories, or frameworks.
- Keep paragraphs short (1-3 lines).
- Build toward the key insight.

**Step 5: Craft the closing.**
- State the takeaway clearly.
- Add a specific, open-ended question or call to action.
- Select 3-5 relevant hashtags.
- Draft a suggested first comment (often includes the link or additional context).

### Phase 3: Optimization (Steps 6-7)

**Step 6: Optimize for engagement.**
- Review against LinkedIn algorithm best practices.
- Suggest optimal posting time.
- Draft engagement strategy (first comment, response approach).
- Create an alternative version for A/B testing.

**Step 7: Suggest visual companion.**
- Recommend an image, infographic, or carousel concept.
- Describe the visual in enough detail for a designer to create.
- Suggest a carousel structure if applicable (slide count, key message per slide).

---

## Quality Criteria

### Content Quality
- [ ] Post provides genuine value (insight, learning, or perspective).
- [ ] Key message is clear and memorable.
- [ ] Specific examples, numbers, or stories are included.
- [ ] Tone is authentic and appropriate for the author/brand.

### Engagement Optimization
- [ ] Hook stops the scroll (first 2-3 lines are compelling).
- [ ] Call to action is specific and inviting.
- [ ] Hashtags are relevant (3-5, not overloaded).
- [ ] No external links in post body.

### Professional Standards
- [ ] Content is factually accurate.
- [ ] No confidential client information disclosed.
- [ ] Consistent with VSC brand positioning.
- [ ] Appropriate for professional platform.

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `create-case-study` (C-CASE-019) | Case study results for teaser posts | Case study content |
| `research-deep-topic` (C-RES-009) | Industry insights and data | Thought leadership content |
| User | Topic, message, and context | Post specification |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| None (final output for social media publishing) | | |

---

## Templates & References

### Templates
- `templates/linkedin_post_template.md` - Standard post structure.
- `templates/linkedin_carousel_template.md` - Carousel post planning template.

### Reference Documents
- VSC internal: "Guia de Comunicaciones y Marca Personal v1.0"
- VSC internal: "Calendario de Contenido LinkedIn"

---

## Examples

### Example 1: Thought Leadership Post (ES)

**Input:**
- Topic: Importance of data quality in asset management.
- Key message: Poor data quality is the #1 reason AM projects fail, not technology.
- Audience: Asset management professionals in LATAM.
- Author: Individual consultant.

**Expected Output:**

```
El 80% de los proyectos de gestion de activos que he visto fracasar
no fallaron por falta de tecnologia.

Fallaron por falta de datos confiables.

En los ultimos 5 anos he evaluado mas de 30 organizaciones
industriales en LATAM. El patron es siempre el mismo:

- Invierten USD 2M en un sistema de gestion.
- Los datos de falla estan incompletos o mal clasificados.
- Los KPIs calculados no son confiables.
- Las decisiones se siguen tomando "por experiencia."

La tecnologia es un habilitador, no una solucion.

Antes de invertir en el proximo software de IA predictiva,
preguntate: mis datos de falla de los ultimos 3 anos
estan completos y correctamente clasificados?

Si la respuesta es no, ahi esta tu verdadero primer proyecto.

Cual ha sido tu experiencia con la calidad de datos
en gestion de activos? Me interesa escuchar.

#GestionDeActivos #Confiabilidad #ISO55000 #Mantenimiento #DataQuality
```

### Example 2: Case Study Teaser (EN)

**Input:**
- Topic: RAM analysis improved plant availability.
- Key message: Proper RAM modeling identified a USD 8M/year production loss bottleneck.
- Audience: Mining industry executives.
- Author: VSC company page.

**Expected Output:**

```
A copper concentrator was losing USD 8M per year
in production. Nobody knew the real bottleneck.

Everyone assumed it was the SAG mill.
The data told a different story.

Our RAM simulation of 47 equipment items revealed
that the REAL constraint was the thickener underflow
pump station - a seemingly "non-critical" system.

Results after addressing the true bottleneck:
- Availability: 88.5% to 93.2%
- Annual production gain: 1.2M additional tons
- ROI on the fix: 14:1 in the first year

Three lessons from this project:

1. Intuition is not a substitute for data-driven analysis.
2. Bottlenecks often hide in unexpected places.
3. A structured RAM approach pays for itself many times over.

Have you ever discovered a hidden bottleneck in your operation?

#Mining #Reliability #AssetManagement #RAM #CopperMining
```
