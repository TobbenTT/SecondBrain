# Build Second Brain

## Skill ID: F-002
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Set up and manage a "Second Brain" system for capturing, classifying, routing, extracting, structuring, and surfacing knowledge relevant to OR programs and AI-assisted workflows. Based on Nate B Jones' 12 Engineering Principles for knowledge management, this skill creates an automated pipeline that transforms raw information (articles, notes, documents, conversations, ideas) into structured, actionable knowledge that is always available when needed.

## Intent & Specification

**Problem:** Knowledge workers in OR programs are drowning in information. Valuable insights from meetings, articles, project documents, and conversations are lost because there is no systematic process to capture, classify, and retrieve them. People rely on memory and manual filing, leading to knowledge loss, repeated research, and decisions made without available information.

**Success Criteria:**
- Capture pipeline automatically ingests information from multiple sources
- Classification system categorizes knowledge by topic, urgency, and actionability
- Routing system sends knowledge items to the right person or system
- Extraction system pulls key insights from longer documents
- Structuring system organizes knowledge into retrievable formats
- Nudging system surfaces relevant knowledge at the right time
- System operates with minimal manual intervention after setup

**Constraints:**
- Must integrate with existing tools (Slack, Notion, Claude, Zapier/Make)
- Must be searchable and retrievable within seconds
- Must handle multiple languages (English and Spanish)
- Must respect confidentiality and access controls
- Must not create information overload (filter, not flood)
- Must be maintainable by the team (not just the person who set it up)

## Trigger / Invocation

**Manual Triggers:**
- `build-second-brain setup --stack [slack-notion-claude|custom]`
- `build-second-brain capture --source [url|text|file] --topic [topic]`
- `build-second-brain search --query [question]`
- `build-second-brain review --period [daily|weekly]`
- `build-second-brain maintain --action [prune|reorganize|backup]`

**Automatic Triggers:**
- New item saved/starred in capture source (Slack saved message, web clipper)
- Scheduled review (daily digest, weekly summary)
- Knowledge item aging (6 months without access -> review for relevance)
- New project onboarded (seed second brain with project knowledge)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Capture Sources | Configuration | Yes | Where information comes from |
| Classification Taxonomy | Configuration | Yes | Categories and tags for organization |
| Routing Rules | Configuration | Yes | Where classified items should go |
| Tool Credentials | Secrets Manager | Yes | API access for Slack, Notion, etc. |
| User Preferences | Configuration | No | Topics of interest, notification preferences |
| Existing Knowledge Base | System | No | Existing documents to seed the system |

**System Architecture:**
```yaml
second_brain_stack:
  capture:
    sources:
      - type: "slack"
        trigger: "message saved / emoji reaction :brain:"
        channel_filter: ["#or-system", "#ai-tools", "#project-updates"]
      - type: "web"
        trigger: "browser extension clip"
        format: "markdown"
      - type: "email"
        trigger: "forward to brain@{domain}"
        parser: "extract_subject_body_links"
      - type: "manual"
        trigger: "command or form submission"
      - type: "meeting_notes"
        trigger: "post-meeting summary"
      - type: "document_update"
        trigger: "doc-control notification of new/revised document"

  classify:
    taxonomy:
      domains:
        - "OR Methodology"
        - "Operations"
        - "Maintenance"
        - "HSE"
        - "HR & People"
        - "Finance"
        - "Project Management"
        - "AI & Automation"
        - "Industry Trends"
        - "Client Intelligence"
      actionability:
        - "Reference" # store for later lookup
        - "Action" # requires follow-up
        - "Insight" # inform thinking/decisions
        - "Template" # reusable pattern or process
      urgency:
        - "Immediate" # act today
        - "This Week" # review this week
        - "Archive" # store for future reference

  route:
    rules:
      - condition: "domain=Maintenance AND actionability=Action"
        destination: "notion://OR-System/Maintenance/Action-Items"
        notify: "agent-maintenance"
      - condition: "domain=AI & Automation AND actionability=Insight"
        destination: "notion://Second-Brain/AI-Insights"
        notify: "none"
      - condition: "urgency=Immediate"
        destination: "slack://direct-message"
        notify: "user"

  extract:
    methods:
      - type: "key_points"
        description: "Extract 3-5 key takeaways from any document"
      - type: "action_items"
        description: "Extract actionable tasks with owners and dates"
      - type: "definitions"
        description: "Extract new terms, acronyms, and definitions"
      - type: "connections"
        description: "Identify links to existing knowledge items"

  structure:
    formats:
      - type: "atomic_note"
        description: "One idea per note, with title, content, source, tags"
      - type: "map_of_content"
        description: "Index page linking related atomic notes"
      - type: "project_context"
        description: "Structured project knowledge for AI context loading"
      - type: "decision_log"
        description: "Decisions with context, rationale, and outcome"

  nudge:
    triggers:
      - type: "context_match"
        description: "Surface relevant items when working on related topic"
      - type: "daily_review"
        description: "Morning digest of new items and pending actions"
      - type: "weekly_review"
        description: "Weekly summary of captured knowledge and gaps"
      - type: "decay_alert"
        description: "Items not accessed in 6 months flagged for review"
```

## Output Specification

**Primary Outputs:**

1. **Configured Second Brain System:** Working pipeline from capture to nudge
2. **Knowledge Base:** Structured collection of atomic notes, maps, and references
3. **Daily/Weekly Digests:** Curated summaries of captured knowledge
4. **Search Results:** Instant retrieval of relevant knowledge

**Atomic Note Format:**
```markdown
# {Title}
**ID:** KB-{NNN}
**Created:** {Date}
**Source:** {URL or reference}
**Domain:** {domain tag}
**Tags:** {tag1, tag2, tag3}
**Actionability:** {Reference / Action / Insight / Template}

## Key Insight
{1-3 sentences capturing the core idea}

## Details
{Expanded content, quotes, data}

## Connections
- Related to: [[KB-{related_id}]] {title}
- Supports: {project, decision, or deliverable}
- Contradicts: {if applicable}

## Source Context
{Where this came from, credibility assessment}

---
Last Accessed: {Date}
Access Count: {N}
```

**Map of Content Format:**
```markdown
# Map: {Topic Name}
**Last Updated:** {Date}
**Items:** {count}

## Core Concepts
- [[KB-001]] {title} - {1-line summary}
- [[KB-015]] {title} - {1-line summary}

## Best Practices
- [[KB-023]] {title}
- [[KB-045]] {title}

## Case Studies
- [[KB-067]] {title}

## Open Questions
- {Question 1 - no answer captured yet}
- {Question 2}

## Action Items
- [ ] {Action from KB-023}
- [x] {Completed action from KB-045}
```

## Methodology & Standards

- **Capture Everything, Filter Later:** Low friction capture. Do not evaluate during capture. Classify and filter in a separate step.
- **Atomic Notes:** One idea per note. Notes should be self-contained and linkable. Inspired by Zettelkasten methodology.
- **Progressive Summarization:** Layer 1: raw capture. Layer 2: bold key passages. Layer 3: highlight within bold. Layer 4: summary in own words. Each layer adds distillation.
- **Maps of Content:** Instead of rigid folders, use fluid maps that link related notes. A note can appear in multiple maps.
- **PARA Framework:** Organize by: Projects (active, with deadlines), Areas (ongoing responsibilities), Resources (reference material), Archives (completed/inactive). Based on Tiago Forte's methodology.
- **Regular Review:** Daily: process inbox. Weekly: review and connect. Monthly: prune and reorganize. Quarterly: audit and restructure.

## Step-by-Step Execution

### Step 1: Define Knowledge Architecture
1. Identify key knowledge domains for the team/project
2. Define classification taxonomy (domains, tags, actionability, urgency)
3. Define PARA categories for the specific context
4. Design folder/database structure in Notion (or chosen tool)
5. Create initial Maps of Content for each major domain

### Step 2: Configure Capture Pipeline
1. Set up Slack integration:
   - Configure emoji reaction trigger (:brain:) for knowledge capture
   - Set up channel monitoring for key channels
   - Create Zapier/Make automation: Slack save -> Notion inbox
2. Set up web capture:
   - Install browser extension (Notion Web Clipper or equivalent)
   - Configure default capture database and format
3. Set up email capture:
   - Create capture email address
   - Configure email parsing and forwarding to Notion
4. Set up manual capture:
   - Create quick-capture form (Notion template or Slack command)
   - Mobile-friendly capture option

### Step 3: Configure Classification Engine
1. Set up AI-assisted classification:
   - When item arrives in inbox, AI reads content
   - AI suggests: domain, tags, actionability, urgency
   - Routes to appropriate location based on rules
2. Define routing rules per classification combination
3. Configure notification triggers for urgent or action items
4. Test classification accuracy with sample items

### Step 4: Configure Extraction Pipeline
1. For each captured item:
   - Extract key points (3-5 bullet summary)
   - Extract action items (if any)
   - Extract new definitions or terminology
   - Identify connections to existing knowledge items
2. Store extraction results as metadata on the note
3. Create links between connected notes

### Step 5: Build Structuring Workflows
1. Set up atomic note creation workflow:
   - Raw capture -> classify -> extract -> create atomic note
   - Ensure one idea per note with proper metadata
2. Set up Map of Content maintenance:
   - When new note is created, check if it fits existing maps
   - If yes: add link to relevant maps
   - If no map exists for this topic: create new map when 3+ related notes exist
3. Set up project context builder:
   - When working on a project, compile relevant notes into context document
   - This becomes the AI context loading package

### Step 6: Configure Nudging System
1. Daily digest:
   - Morning notification with: new items captured yesterday, pending actions, items to review
   - Format: brief summary with links to full notes
2. Context matching:
   - When user starts working on a topic, surface related knowledge items
   - Integration with vibe-working-session skill
3. Decay alerts:
   - Monthly review of items not accessed in 6+ months
   - Suggest: archive, delete, or refresh

### Step 7: Seed with Existing Knowledge
1. Import key existing documents into the system
2. Process through classification and extraction pipelines
3. Create initial Maps of Content from bulk import
4. Identify gaps in knowledge base

### Step 8: Train and Document
1. Create user guide for the second brain system
2. Train team members on capture habits
3. Define maintenance responsibilities
4. Set up monitoring for system health (capture rate, classification accuracy, usage metrics)

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Capture Rate | Items captured per week | > 20 (team) |
| Classification Accuracy | Items correctly classified by AI | > 85% |
| Retrieval Speed | Time from search to finding answer | < 30 seconds |
| Knowledge Currency | Items reviewed within last 6 months | > 70% |
| Connection Density | Average links per atomic note | > 2 |
| User Adoption | Team members actively capturing | > 80% of team |
| Action Completion | Action items completed from captures | > 60% |
| System Maintenance | Weekly review completed on time | > 90% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Specifications stored in second brain |
| `vibe-working-session` | Bidirectional | Sessions load context from second brain; outputs stored back |
| `notebooklm-context-builder` | Downstream | Second brain content curated for NotebookLM |
| `agent-doc-control` | Bidirectional | Formal documents tracked in both systems |
| `audit-ai-workflow` | Downstream | Audit insights stored in second brain |
| `create-agent-specification` | Downstream | Agent specs stored and retrieved from second brain |

## Templates & References

**Quick Capture Template:**
```
Source: {URL or "manual"}
Key Insight: {1-2 sentences}
Tags: {comma-separated}
Action Required: {yes/no}
```

**Weekly Review Checklist:**
```
[ ] Process all items in inbox (classify and route)
[ ] Review action items (complete, defer, or delegate)
[ ] Connect new notes to existing maps
[ ] Archive resolved/irrelevant items
[ ] Identify knowledge gaps for this week's work
[ ] Update Maps of Content if needed
```

## Examples

**Example 1: Capture from Slack**
```
Trigger: User reacts with :brain: to a Slack message about RCM methodology

Captured Message: "For our criticality analysis, we should consider using a semi-quantitative
approach per ISO 14224 rather than pure qualitative. The quantitative data from similar plants
shows that pump failures follow a Weibull distribution with beta=1.8."

Processing:
  1. Classify: Domain=Maintenance, Tags=[RCM, criticality, statistics], Actionability=Insight
  2. Extract: Key insight = "Semi-quantitative criticality analysis per ISO 14224 is preferred.
     Pump failure data follows Weibull with beta=1.8."
  3. Route: notion://Second-Brain/Maintenance/RCM-Methodology
  4. Connect: Links to [[KB-034]] "Criticality Analysis Methods" and [[KB-056]] "Pump Reliability Data"
  5. Create atomic note KB-089

Output: Atomic note created, linked, and filed. No action required.
```

**Example 2: Weekly Review**
```
Command: build-second-brain review --period weekly

Weekly Review Summary:
  Items Captured This Week: 23
    - 8 from Slack
    - 6 from web clips
    - 5 from meeting notes
    - 4 manual captures

  By Domain:
    Maintenance: 7 | Operations: 5 | AI & Automation: 6 | HSE: 3 | Other: 2

  Action Items:
    - [NEW] Research Weibull analysis tools for RCM (from KB-089)
    - [NEW] Share shift pattern benchmarks with agent-operations (from KB-091)
    - [PENDING] Update CMMS specification with SAP-PM best practices (from KB-078)
    - [COMPLETED] Document GenSpark prompt patterns (from KB-082)

  Maps Updated: Maintenance/RCM-Methodology, AI/Prompt-Engineering
  Knowledge Gaps Identified: No captures on "Commissioning Participation" this month

  Recommendation: Seek information on commissioning participation best practices to fill gap.
```
