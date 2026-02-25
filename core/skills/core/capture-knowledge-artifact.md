# Capture Knowledge Artifact

## Skill ID: G-001
## Version: 1.0.0
## Category: G. Knowledge & Memory Management
## Priority: High

## Purpose

Capture and structure knowledge from any source -- projects, meetings, lessons learned, conversations, documents, web content, and agent outputs -- into standardized knowledge cards for the VSC Second Brain. Based on Nate B Jones' Building Block 1 (The Dropbox), this skill implements frictionless, 5-second knowledge capture that transforms raw information into structured, tagged, connected knowledge artifacts that are immediately searchable and retrievable. It is the entry point for all knowledge flowing into the system, ensuring nothing valuable is lost while maintaining quality and structure from the moment of capture.

## Intent & Specification

**Problem:** Knowledge in OR programs is generated constantly -- in meetings, Slack conversations, project deliverables, research sessions, client interactions, and agent outputs -- but the vast majority of it disappears. People read an article, gain an insight, and forget it within a week. A meeting produces three critical decisions but the notes sit in a folder nobody opens again. An agent generates a brilliant analysis that is never referenced by any other agent or project. The root cause is that capture is too slow, too structured, and too disconnected from the workflow. When capturing knowledge requires opening a separate tool, filling out a form, and categorizing content, people skip it. Knowledge capture must be as fast as saving a bookmark -- under 5 seconds for initial capture -- with structured enrichment happening asynchronously.

**Success Criteria:**
- Initial capture takes under 5 seconds (bookmark speed)
- Captured artifacts are automatically enriched with metadata, tags, and connections within 60 seconds
- Knowledge cards follow a standardized format that is both human-readable and machine-parseable
- Every artifact has: source, date, domain tag, actionability level, and at least one connection to existing knowledge
- Capture works from any source: Slack, web, email, meetings, documents, manual input, agent output
- Artifacts are searchable within seconds of capture
- Capture rate exceeds 20 artifacts per week per active user
- Less than 10% of captured artifacts are duplicates of existing knowledge

**Constraints:**
- Capture must be frictionless: if it takes more than 5 seconds, people will not do it
- Must work from multiple entry points (Slack reaction, web clipper, command, voice, email forward)
- Must handle both English and Spanish content
- Must respect confidentiality markings (internal, client, public)
- Must not create information overload (capture is not hoarding -- quality filtering applies)
- Must integrate with the existing Second Brain architecture from `build-second-brain`
- Must produce artifacts compatible with `curate-knowledge-flow` downstream processing

## Trigger / Invocation

**Manual Triggers:**
- `capture-knowledge-artifact capture --source [url|text|file] --quick` (5-second capture)
- `capture-knowledge-artifact capture --source [url|text|file] --enriched` (enriched capture with tagging)
- `capture-knowledge-artifact from-meeting --notes [file] --date [date]`
- `capture-knowledge-artifact from-agent --agent [name] --output [file]` (capture agent output as knowledge)
- `capture-knowledge-artifact from-lesson --project [name] --lesson [text]`
- `capture-knowledge-artifact batch --folder [path]` (batch capture from a folder of documents)

**Automatic Triggers:**
- Slack emoji reaction :brain: on a message -> capture the message
- Agent completes deliverable with quality score >91% -> capture key insights
- Meeting notes filed by agent-doc-control -> extract and capture knowledge cards
- Weekly review identifies knowledge gaps -> prompt capture for gap areas
- Vibe working session closes -> capture session lessons automatically
- Document updated in doc-control -> capture delta (what changed and why)

**Integration Triggers:**
- Web clipper browser extension saves a page
- Email forwarded to capture@{domain} address
- Voice memo transcribed and submitted
- Zapier/Make automation from connected tools

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Raw Content | User / Agent / System | Yes | The information to capture (text, URL, file, transcript) |
| Source Attribution | System / User | Yes | Where the information came from |
| Capture Mode | User / Config | No | quick (5s, minimal metadata) or enriched (60s, full metadata) |
| Domain Hint | User | No | Suggested domain classification (overridden by auto-classification) |
| Confidentiality | User / Config | No | internal / client / public (default: internal) |
| Project Context | System | No | Active project for automatic association |
| Related Artifacts | System | No | Existing artifacts to check for connections |

**Source Type Handlers:**
```yaml
source_handlers:
  url:
    action: "fetch page, extract main content, strip boilerplate"
    metadata: "title, author, date, domain"
    format: "markdown"
  text:
    action: "accept raw text as-is"
    metadata: "user-provided or inferred"
    format: "markdown"
  file:
    action: "read file, extract content based on file type"
    supported: [".md", ".txt", ".pdf", ".docx", ".xlsx", ".pptx"]
    metadata: "file metadata + content extraction"
    format: "markdown summary + file reference"
  slack_message:
    action: "extract message text, thread context, attachments"
    metadata: "channel, author, timestamp, thread_id"
    format: "markdown with context"
  meeting_transcript:
    action: "extract key points, decisions, action items"
    metadata: "meeting title, date, attendees"
    format: "structured meeting knowledge card"
  agent_output:
    action: "extract methodology, key findings, reusable patterns"
    metadata: "agent name, task, quality score"
    format: "structured agent knowledge card"
  email:
    action: "extract subject, key content, attachments"
    metadata: "sender, date, subject"
    format: "markdown summary"
```

## Output Specification

**Primary Output: Knowledge Card**

```markdown
# {Title}
## Card ID: KC-{NNNN}
## Created: {Date}
## Source: {Source attribution with link}
## Captured By: {User or Agent}
## Capture Mode: {Quick / Enriched}

---

## Classification
- **Domain:** {Primary domain from taxonomy}
- **Sub-domain:** {More specific category}
- **Tags:** {tag1, tag2, tag3, tag4}
- **Actionability:** {Reference / Action / Insight / Template / Decision}
- **Urgency:** {Immediate / This Week / Archive}
- **Confidentiality:** {Internal / Client / Public}
- **Project:** {Associated project or "General"}

## Core Content

### Key Insight
{1-3 sentences capturing the essential knowledge. This is what someone scanning quickly needs to know.}

### Details
{Expanded content. For articles: key points and supporting evidence. For meetings: decisions and rationale. For lessons: what happened, why, and what to do differently. For agent outputs: methodology and reusable findings.}

### Raw Source
{Original content or link to original. Preserved for reference. Collapsed by default in display.}

## Connections
- **Supports:** {Link to KC-XXXX or project/deliverable this knowledge supports}
- **Contradicts:** {Link to KC-XXXX if this challenges existing knowledge}
- **Extends:** {Link to KC-XXXX if this builds on existing knowledge}
- **Related:** {Links to KC-XXXX for topically related artifacts}

## Actionability
- **Action Required:** {Yes / No}
- **Action:** {Specific action if applicable}
- **Owner:** {Person or agent responsible}
- **Due:** {Date if applicable}
- **Status:** {Pending / In Progress / Completed / N/A}

---
## Metadata
- Last Accessed: {Date}
- Access Count: {N}
- Quality Score: {auto-assessed 1-5}
- Enrichment Status: {Pending / Complete}
- Review Date: {Next scheduled review}
```

**Quick Capture Card (5-second version):**
```markdown
# KC-{NNNN}: {Auto-generated title}
**Source:** {URL or "manual"} | **Date:** {now}
**Quick Note:** {User's raw input or auto-extracted key line}
**Auto-Tags:** {AI-suggested tags, pending confirmation}
**Status:** Pending Enrichment
```

**Meeting Knowledge Card:**
```markdown
# KC-{NNNN}: Meeting - {Title}
**Date:** {meeting date} | **Attendees:** {list}

## Decisions
1. {Decision 1 with rationale}
2. {Decision 2 with rationale}

## Key Insights
- {Insight 1}
- {Insight 2}

## Action Items
- [ ] {Action 1} — Owner: {name} — Due: {date}
- [ ] {Action 2} — Owner: {name} — Due: {date}

## Open Questions
- {Question 1 — to be resolved by {date/event}}
```

## Methodology & Standards

- **The Dropbox Principle (Jones Building Block 1):** The capture mechanism must be as frictionless as dropping a file into a folder. Zero cognitive overhead during capture. All classification, enrichment, and connection happens asynchronously after the initial capture. The human's only job at capture time is to identify that something is worth keeping. Everything else is automated.

- **Two-Phase Capture:**
  - **Phase 1: Quick Capture (5 seconds):** User signals "this is worth keeping" via any trigger (emoji, clip, command). System captures the raw content with minimal metadata (source, date, user). Card created with status "Pending Enrichment."
  - **Phase 2: Enrichment (60 seconds, asynchronous):** AI processes the raw capture to: generate a title, extract key insight (1-3 sentences), classify by domain and tags, assess actionability and urgency, identify connections to existing artifacts, generate the full knowledge card. User is notified when enrichment is complete for optional review.

- **Knowledge Card Quality Levels:**
  - **Level 1 (Raw):** Quick capture with auto-generated metadata. Useful for reference but not yet structured. Quality: 2/5.
  - **Level 2 (Enriched):** AI-enriched with title, key insight, classification, and initial connections. Quality: 3/5.
  - **Level 3 (Curated):** Human-reviewed enrichment, connections verified, actionability confirmed. Quality: 4/5.
  - **Level 4 (Canonical):** Fully validated, deeply connected, referenced by multiple artifacts. Becomes part of methodology knowledge. Quality: 5/5.

- **Deduplication Protocol:**
  - Before creating a new card, check for existing cards with >80% content similarity
  - If duplicate found: merge new information into existing card (update, do not duplicate)
  - If partial overlap: create new card with explicit connection to overlapping card
  - Track deduplication rate as a system health metric

- **Source Quality Assessment:**
  - Primary sources (original research, official standards, direct observation): High confidence
  - Secondary sources (articles summarizing primary research, vendor documentation): Medium confidence
  - Tertiary sources (social media, opinion pieces, unverified claims): Low confidence
  - Confidence level recorded on the knowledge card for retrieval weighting

- **Classification Taxonomy (aligned with Second Brain):**
  ```
  Domains: OR Methodology, Operations, Maintenance, HSE, HR & People, Finance,
           Project Management, AI & Automation, Industry Trends, Client Intelligence
  Actionability: Reference, Action, Insight, Template, Decision
  Urgency: Immediate, This Week, Archive
  Confidentiality: Internal, Client, Public
  ```

## Step-by-Step Execution

### Step 1: Receive Capture Signal
1. Detect the capture trigger:
   - Slack :brain: reaction -> extract message and thread context
   - Web clipper -> fetch and extract page content
   - Manual command -> accept user input
   - Agent output -> receive deliverable and metadata
   - Meeting notes -> receive transcript or notes file
   - Email forward -> parse email content
2. Record the source attribution (URL, channel, agent, file path)
3. Record the timestamp and capturing user/agent
4. Assign a new card ID: KC-{next sequential number}

### Step 2: Quick Capture (5-second phase)
1. Extract the raw content from the source:
   - For URLs: fetch page, extract main content body
   - For Slack: extract message text plus 2 messages of thread context
   - For files: extract text content (OCR if needed for images/PDFs)
   - For manual: accept the text as provided
2. Store the raw content in the quick capture card format
3. Auto-generate a provisional title from the first sentence or subject
4. Apply auto-tags using keyword extraction (pre-enrichment)
5. Set status to "Pending Enrichment"
6. Make the card immediately searchable (raw content indexed)
7. Acknowledge capture to user: "Captured as KC-{NNNN}. Enriching..."

### Step 3: Enrichment (60-second asynchronous phase)
1. **Title Generation:** Create a concise, descriptive title (5-10 words) that captures the core topic
2. **Key Insight Extraction:** Distill the content to 1-3 sentences that convey the essential knowledge. Ask: "If someone had 10 seconds to understand this, what do they need to know?"
3. **Domain Classification:** Analyze content to assign primary domain and sub-domain from the taxonomy
4. **Tag Generation:** Generate 3-6 tags covering: topic, methodology, industry, application area
5. **Actionability Assessment:**
   - Reference: information to store for later lookup
   - Action: requires someone to do something
   - Insight: changes how we think about something
   - Template: reusable pattern or process
   - Decision: records a decision with rationale
6. **Urgency Assessment:** Immediate (act today), This Week (review soon), Archive (store for future)
7. **Connection Discovery:**
   - Search existing knowledge cards for related content
   - Identify supports/contradicts/extends/related connections
   - Link to relevant projects and deliverables
8. **Action Item Extraction:** If actionable, extract who/what/when
9. Update the card from quick capture to enriched format
10. Set enrichment status to "Complete"
11. Notify user: "KC-{NNNN} enriched. [View card]"

### Step 4: Deduplication Check
1. Search for existing cards with similar content:
   - Title similarity > 80%
   - Key insight overlap > 70%
   - Same source URL (exact match)
2. If duplicate found:
   - If new content adds information: merge into existing card, note the update
   - If new content is identical: discard and notify user of existing card
3. If partial overlap found:
   - Create the new card
   - Add explicit "Related" connection to overlapping card
   - Flag for curator review

### Step 5: Quality Assessment
1. Score the knowledge card (1-5):
   - 1: Raw capture only, no enrichment possible (e.g., broken link)
   - 2: Quick capture with auto-tags but limited content
   - 3: Enriched with title, insight, classification, connections
   - 4: Curated and verified by human
   - 5: Canonical knowledge, deeply connected, methodology-grade
2. Assess source confidence: High, Medium, Low
3. Set review date based on urgency:
   - Immediate: review today
   - This Week: review within 7 days
   - Archive: review in 6 months (decay check)

### Step 6: Route and Notify
1. Apply routing rules from `curate-knowledge-flow`:
   - If actionable with specific agent: route to agent inbox
   - If project-specific: associate with project knowledge base
   - If general methodology: route to methodology knowledge base
2. If urgency is Immediate: send notification via Slack or designated channel
3. If action items extracted: create tasks in Shared Task List
4. Update Maps of Content if the card fits an existing map
5. If no map exists but 3+ cards now exist for this topic: flag for new map creation

### Step 7: Store and Index
1. Store the knowledge card in the Second Brain repository
2. Index for full-text search
3. Update the knowledge graph (connections between cards)
4. Update domain statistics (cards per domain, capture rate)
5. Log the capture event for analytics

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Capture Speed | Time from trigger to card created (quick phase) | < 5 seconds |
| Enrichment Speed | Time from quick capture to enriched card | < 60 seconds |
| Enrichment Accuracy | Auto-classification matches human judgment | > 85% |
| Connection Discovery | Cards with at least 1 connection to existing card | > 70% |
| Deduplication Rate | Duplicate cards caught before creation | > 90% |
| Capture Rate | Artifacts captured per week per active user | > 20 |
| Key Insight Quality | Insight accurately represents source content | > 90% |
| Searchability | Card findable within 30 seconds of capture | 100% |
| Source Attribution | Cards with complete source attribution | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `build-second-brain` | Upstream | Provides the knowledge architecture and storage |
| `curate-knowledge-flow` | Downstream | Curates and routes captured artifacts |
| `generate-daily-nudge` | Downstream | Surfaced artifacts appear in daily nudges |
| `sync-memory-agents` | Downstream | Captured knowledge synced to agent memories |
| `vibe-working-session` | Upstream | Session lessons captured automatically |
| `agent-doc-control` | Upstream | Document updates trigger capture |
| `orchestrate-or-agents` | Upstream | Agent outputs trigger capture for high-quality deliverables |
| `define-intent-specification` | Upstream | Specifications captured as template artifacts |

## Templates & References

**Quick Capture Shortcuts:**
```
Slack:     React with :brain: to any message
Web:       Click browser extension "Capture to Second Brain"
Command:   capture-knowledge-artifact capture --quick --source "paste text here"
Email:     Forward to capture@vsc.cl with subject as title
Voice:     "Hey Claude, capture this: [speak insight]"
Meeting:   Auto-triggered when meeting notes are filed
Agent:     Auto-triggered when agent output scores > 91%
```

**Enrichment Prompt Template (used by the AI enrichment engine):**
```
Given the following raw content captured from {source_type}:

{raw_content}

1. Generate a concise title (5-10 words)
2. Extract the key insight (1-3 sentences, what someone needs to know in 10 seconds)
3. Classify: Domain = {choose from taxonomy}, Sub-domain = {specific}
4. Generate 3-6 tags
5. Assess actionability: Reference / Action / Insight / Template / Decision
6. Assess urgency: Immediate / This Week / Archive
7. If actionable: extract who/what/when
8. Search for connections to: {list of recent card titles}
```

## Examples

**Example 1: Slack Capture**
```
Trigger: User reacts with :brain: to a Slack message in #or-system

Slack Message: "Talked to ClienteX today. They mentioned their CMMS migration from SAP-PM
to Maximo took 18 months and they wish they had done parallel running for 3 months
instead of just 1 month. Key lesson for our CMMS strategy."

Quick Capture (5 seconds):
  KC-0234: ClienteX CMMS Migration Lesson
  Source: Slack #or-system | User: @carlos
  Quick Note: "ClienteX CMMS migration SAP-PM to Maximo, 18 months, parallel running 3 months recommended"
  Auto-Tags: CMMS, migration, SAP-PM, Maximo, ClienteX
  Status: Pending Enrichment

Enriched Card (45 seconds later):
  KC-0234: ClienteX CMMS Migration - Parallel Running Duration Lesson
  Domain: Operations
  Sub-domain: CMMS Strategy
  Tags: CMMS, migration, SAP-PM, Maximo, ClienteX, parallel-running, lessons-learned
  Actionability: Insight
  Urgency: This Week
  Key Insight: "ClienteX's SAP-PM to Maximo migration took 18 months. They recommend 3 months
    of parallel running instead of 1 month. Directly relevant to our CMMS strategy."
  Connections:
    - Related: KC-0178 "CMMS Selection Criteria for Lithium Plants"
    - Supports: KC-0201 "Longer Parallel Running Reduces Data Migration Risk"
    - Project: Lithium Plant - Maintenance Systems
  Action: Review current CMMS migration timeline and adjust parallel running period.
  Owner: agent-maintenance
```

**Example 2: Agent Output Capture**
```
Trigger: agent-maintenance completes Maintenance Strategy with quality score 93%

Agent Output: Maintenance Strategy Document (45 pages)

Capture Process:
  1. Extract key methodology insights (not the whole document)
  2. Identify reusable patterns and approaches

Generated Cards:
  KC-0235: Criticality-Based Maintenance Strategy for Lithium Evaporators
    Key Insight: "Evaporator trains in lithium plants show criticality driven primarily
      by production impact (70% weight) rather than safety (20%) due to redundancy design."
    Actionability: Template (reusable for similar plants)

  KC-0236: Condition Monitoring Technology Selection for Brine Service
    Key Insight: "Corrosion monitoring via ultrasonic thickness measurement is more effective
      than vibration analysis for brine-service pumps due to the primary failure mode being
      internal erosion-corrosion rather than bearing failure."
    Actionability: Insight

  KC-0237: Maintenance KPI Benchmarks - Lithium Industry 2025
    Key Insight: "Industry benchmark maintenance cost for lithium carbonate plants is
      $12-18/ton product. Plants with mature PdM programs achieve $10-13/ton."
    Actionability: Reference
```

**Example 3: Meeting Knowledge Capture**
```
Trigger: agent-doc-control files meeting notes for Steering Committee Meeting 2025-05-20

Generated Card:
  KC-0240: Meeting - Steering Committee 2025-05-20

  Decisions:
  1. OPEX budget approved at $45M/year with 10% contingency for Year 1
  2. Ramp-up period extended from 6 to 9 months based on benchmark data
  3. Third-party maintenance contractor scope limited to non-critical equipment only

  Key Insights:
  - Client expressed concern about operator competency timeline
  - Finance flagged that energy cost sensitivity is the largest OPEX risk
  - Safety director requires all maintenance SOPs to include LOTO verification steps

  Action Items:
  - [ ] Update OPEX model with approved budget figures — Owner: agent-finance — Due: 2025-05-25
  - [ ] Revise ramp-up plan for 9-month period — Owner: agent-operations — Due: 2025-05-30
  - [ ] Define contractor scope boundaries — Owner: agent-procurement — Due: 2025-06-05

  Connections:
  - Extends: KC-0189 "OPEX Budget Development Process"
  - Related: KC-0210 "Ramp-Up Duration Benchmarks"
  - Supports: KC-0195 "Contractor vs In-House Maintenance Decision Framework"
```
