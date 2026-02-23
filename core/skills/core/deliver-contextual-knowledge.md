# KM-02: Deliver Contextual Knowledge

## 1. Purpose

Deliver the right knowledge to the right person at the right time, directly at the point of need -- eliminating the 30--40% of work time that industrial workers waste searching for information (McKinsey, 2023). This skill transforms the knowledge base from a passive repository into an active, intelligent delivery system that understands user context (role, task, location, equipment, current situation) and proactively surfaces relevant knowledge.

Rather than requiring workers to know what to search for and where to find it, this skill anticipates information needs based on work context, pushes relevant knowledge to users through their preferred channels, and learns from usage patterns to continuously improve relevance. It bridges the critical "last mile" gap between knowledge existing somewhere in the organization and knowledge being available when a decision must be made.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | KM-02                                                                                       |
| **Agent**              | Agent 12 -- Knowledge Management Curator                                                     |
| **Domain**             | Knowledge Management                                                                         |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Initial setup: 5--10 days; Delivery: real-time (< 3 seconds)                                |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | A-02: Workers spend 30--40% of time searching for information (McKinsey, 2023)             |
| **Secondary Pain**     | H-03: $31.5B annual loss from poor KM -- delivery is half the problem (IDC, 2023)          |
| **Value Created**      | Contextual knowledge delivery reduces search time by 75% and improves decision quality by 40%|

### Functional Intent

This skill SHALL:
- Accept natural language queries and return contextually ranked knowledge results
- Proactively push relevant knowledge based on detected user context (role, task, asset, situation)
- Integrate with existing work tools (Teams, mobile, work order systems) for in-workflow delivery
- Personalize results based on user role, expertise level, and usage history
- Provide multi-format delivery (text summaries, documents, video clips, decision trees)
- Track knowledge usage, effectiveness, and user satisfaction
- Identify and report knowledge gaps (queries with no satisfactory results)
- Support offline/low-connectivity scenarios for field workers
- Respond within 3 seconds for query-based delivery

---

## 3. Trigger / Invocation

### Direct Invocation

```
/deliver-contextual-knowledge --query "[natural language question]" --context [asset-id|task-id|situation] --format [summary|full|decision-tree|checklist]
```

### Contextual Triggers (Proactive Push)

- Work order opened for specific equipment (push maintenance history, known issues, procedures)
- Alarm triggered in control system (push troubleshooting guides, similar incidents)
- Shift handover initiated (push critical information for incoming shift)
- Permit-to-work issued for high-risk activity (push safety procedures, hazard data)
- New employee assigned to unfamiliar task (push onboarding knowledge, training materials)
- Recurring question detected (push FAQ or knowledge article to broader audience)
- Agent detects knowledge gap in another agent's workflow

---

## 4. Input Requirements

### Required Inputs (Query Mode)

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `query`                      | String        | User input                 | Natural language question or keyword search                      |
| `user_context`               | Object        | Auto-detected / Manual     | User role, department, site, current task                        |

### Required Inputs (Push Mode)

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `trigger_event`              | Object        | System event               | Event type, asset ID, situation context                          |
| `target_user`                | Object        | Auto-detected              | User to receive knowledge, their role and context                |

### Optional Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `expertise_level`            | Enum          | User profile               | novice, intermediate, expert -- affects content depth            |
| `preferred_format`           | Enum          | User preference            | summary, detailed, visual, step-by-step                          |
| `language`                   | Enum          | User preference            | Content language: en, es, pt                                     |
| `connectivity`               | Enum          | Auto-detected              | online, limited, offline                                         |
| `urgency`                    | Enum          | Context-derived            | critical (safety), high, normal, low                             |
| `feedback_on_previous`       | Object        | User input                 | Relevance feedback on previous delivery for learning             |

---

## 5. Output Specification

### Primary Outputs

| Output                          | Format       | Destination              | Description                                                   |
|---------------------------------|--------------|--------------------------|---------------------------------------------------------------|
| `knowledge_results`             | JSON         | User interface (Teams/Web)| Ranked list of relevant knowledge items with context           |
| `contextual_summary`            | Markdown     | User interface            | AI-generated summary tailored to user's specific question      |
| `recommended_actions`           | JSON         | User interface            | Suggested next steps based on knowledge content                |
| `knowledge_gap_report`          | JSON         | Agent 12                  | Failed or low-confidence queries indicating knowledge gaps     |
| `usage_analytics`               | JSON         | mcp-powerbi               | Delivery metrics, usage patterns, satisfaction data            |

### Output Schema: Knowledge Delivery Response

```json
{
  "delivery_id": "KD-2025-089234",
  "query": "How to troubleshoot high vibration on SAG mill main bearing?",
  "user": {
    "role": "Maintenance Technician",
    "expertise": "intermediate",
    "site": "Minera Norte"
  },
  "contextual_summary": "High vibration on SAG mill main bearings is typically caused by misalignment, bearing wear, or foundation issues. Based on recent RCA from SAG Mill #2 (Nov 2024), the most common root cause at your site is misalignment exceeding 0.003 inches. Recommended first steps: 1) Check alignment readings vs. last baseline, 2) Review vibration spectrum for bearing defect frequencies, 3) Inspect lubrication condition.",
  "results": [
    {
      "rank": 1,
      "knowledge_id": "KI-2025-003456",
      "title": "Crusher Bearing Failure Mode Analysis -- SAG Mill #2",
      "relevance_score": 0.94,
      "match_reasons": ["asset_match", "topic_match", "recent_validated"],
      "snippet": "Root cause: misalignment exceeded 0.003 inches...",
      "format": "technical_analysis",
      "source_path": "/Knowledge-Base/Maintenance/Reliability/KI-2025-003456",
      "quick_actions": ["View full report", "Open related work orders", "Contact author"]
    },
    {
      "rank": 2,
      "knowledge_id": "KI-2025-003100",
      "title": "SAG Mill Main Bearing Lubrication Best Practices",
      "relevance_score": 0.87,
      "match_reasons": ["asset_match", "topic_related"],
      "snippet": "Lubrication frequency for main bearings should be...",
      "format": "best_practice",
      "quick_actions": ["View procedure", "Download checklist"]
    }
  ],
  "total_results": 8,
  "response_time_ms": 1200,
  "confidence": "high",
  "knowledge_gap_detected": false
}
```

---

## 6. Methodology & Standards

### Theoretical Foundation

- **Context-Aware Computing** (Dey & Abowd) -- Using environmental context to deliver relevant information
- **Just-in-Time Knowledge** -- Delivering knowledge at the moment of need, not before
- **Performance Support Systems** (Gloria Gery) -- Embedded support in the work environment
- **Information Foraging Theory** (Pirolli & Card) -- Optimizing information scent for efficient retrieval
- **Cognitive Load Theory** (Sweller) -- Presenting information to minimize extraneous cognitive load
- **Personalization & Adaptive Systems** -- Tailoring content to user characteristics and preferences

### Industry Statistics

| Statistic                                                            | Source                      | Year |
|----------------------------------------------------------------------|-----------------------------|------|
| Workers spend 30--40% of time searching for information               | McKinsey                     | 2023 |
| 67% of workers say they can't find the information they need          | Coveo Workplace Survey       | 2024 |
| Contextual delivery reduces search time by 75%                        | Gartner                      | 2023 |
| 44% of the time, workers give up searching and recreate content       | IDC                          | 2023 |
| Proactive knowledge push increases usage 3.2x vs. passive repository  | APQC                        | 2024 |
| Mobile-accessible knowledge: 58% higher field worker adoption         | Aberdeen Group               | 2023 |
| Personalized knowledge delivery improves decision quality by 40%      | Deloitte Knowledge Survey    | 2024 |
| Average time to answer via traditional search: 8.5 min; contextual: 1.2 min | Forrester              | 2023 |

### Relevance Ranking Algorithm

Knowledge results are ranked using a composite score:

```
Relevance_Score = (Semantic_Match * 0.30) + (Context_Match * 0.25) + (Quality_Score * 0.15) +
                  (Recency * 0.10) + (Usage_Popularity * 0.10) + (Personalization * 0.10)
```

| Component          | Description                                                          | Range |
|--------------------|----------------------------------------------------------------------|-------|
| Semantic Match     | NLP similarity between query and knowledge content                   | 0--1  |
| Context Match      | Relevance to user's current context (asset, task, role, site)        | 0--1  |
| Quality Score      | Knowledge item quality score from KM-01                              | 0--1  |
| Recency            | Inverse of age, weighted by knowledge type expected freshness        | 0--1  |
| Usage Popularity   | How often this item is accessed by similar users in similar contexts  | 0--1  |
| Personalization    | Match to user's role, expertise level, and historical preferences    | 0--1  |

### Delivery Modes

| Mode              | Trigger                    | Channel            | Response Time  | Content Depth |
|-------------------|----------------------------|--------------------|----------------|---------------|
| Query (Search)    | User asks a question       | Teams bot / Web UI | < 3 seconds    | Full results   |
| Push (Proactive)  | System event detected      | Teams notification | < 30 seconds   | Summary + link |
| Embedded          | Work order / permit opened | In-app widget      | < 5 seconds    | Contextual card|
| Offline Pack      | Field worker sync          | Mobile app         | Pre-loaded     | Essential docs |
| Escalation        | No results found           | Expert connection  | < 5 minutes    | Live support   |

---

## 7. Step-by-Step Execution

### Phase 1: Delivery System Configuration (Day 1--5)

**Step 1.1: Context Model Configuration**
```
ACTION: Define context attributes that influence knowledge delivery
INPUTS: Organizational structure, asset hierarchy, role definitions
PROCESS:
  1. Configure context dimensions:
     - User context: role, department, site, expertise_level, language
     - Task context: work_order_type, permit_type, activity_code
     - Asset context: equipment_id, system, area, criticality
     - Situation context: alarm_state, operating_mode, incident_type
     - Temporal context: shift, time_of_day, season
  2. Define context-to-knowledge mapping rules:
     - Role -> relevant knowledge domains and depth
     - Asset -> associated procedures, history, specifications
     - Task -> applicable procedures, checklists, safety data
     - Situation -> troubleshooting guides, incident history
  3. Configure expertise level adaptations:
     - Novice: step-by-step procedures, definitions, training links
     - Intermediate: key points, references, decision support
     - Expert: data, analysis, advanced troubleshooting, root causes
OUTPUT: Context model configuration, mapping rules
MCP: mcp-sharepoint (organizational data), mcp-teams (user profiles)
```

**Step 1.2: Delivery Channel Setup**
```
ACTION: Configure knowledge delivery through work tools
INPUTS: Technology landscape, user preferences
PROCESS:
  1. Teams Bot Integration:
     - Configure conversational knowledge bot
     - Set up channel notifications for proactive push
     - Enable @mention triggers for knowledge queries
  2. Web Portal:
     - Configure search interface with faceted filters
     - Set up personalized dashboard per role
     - Enable knowledge cards and quick actions
  3. Mobile App (Field Workers):
     - Configure offline content sync rules
     - Set up push notification preferences
     - Enable voice query for hands-free access
  4. Embedded Widgets:
     - CMMS/EAM work order knowledge panel
     - Control system alarm knowledge links
     - Permit-to-work safety knowledge cards
  5. Configure delivery preferences by role:
     - Control room operators: embedded in control system interface
     - Maintenance technicians: mobile app + Teams bot
     - Engineers: web portal + Teams bot
     - Supervisors: Teams notifications + dashboard
OUTPUT: Delivery channel configurations, user preference profiles
MCP: mcp-teams (bot deployment, channel setup), mcp-sharepoint (web portal)
```

**Step 1.3: Proactive Push Rule Configuration**
```
ACTION: Define rules for automatic knowledge delivery
INPUTS: Context model, common work scenarios
PROCESS:
  1. Work Order Push Rules:
     - New PM work order -> push PM procedure + last findings + parts list
     - Corrective maintenance -> push troubleshooting guide + similar work orders
     - Complex task -> push safety procedures + required certifications
  2. Alarm Push Rules:
     - Critical alarm -> push emergency procedures + last incident report
     - Repeated alarm pattern -> push root cause analysis + known solutions
     - New/unknown alarm -> push general troubleshooting + escalation contacts
  3. Shift Push Rules:
     - Shift start -> push handover notes + active alarms + pending tasks
     - Shift end -> push handover template + open item reminders
  4. Learning Push Rules:
     - First time performing task -> push detailed procedure + training video
     - New knowledge published in user's domain -> push notification
     - Trending topic in peer group -> push relevant content
  5. Set push frequency limits to prevent notification fatigue:
     - Max 5 proactive pushes per shift
     - Priority filtering: critical always, high max 3, normal max 2
OUTPUT: Push rule configuration, frequency limits
MCP: mcp-teams (notification delivery), mcp-sharepoint (rule storage)
```

### Phase 2: Query Processing Pipeline (Real-time)

**Step 2.1: Query Understanding**
```
ACTION: Parse and enrich user query with context
INPUTS: query, user_context
PROCESS:
  1. Natural Language Processing:
     a. Tokenize and normalize query
     b. Identify entities (asset names, system names, technical terms)
     c. Detect intent (troubleshoot, find_procedure, understand_concept, get_data)
     d. Resolve abbreviations and acronyms
  2. Context Enrichment:
     a. Resolve user context (current role, site, shift, active tasks)
     b. Resolve asset context (if asset mentioned, load asset profile)
     c. Resolve temporal context (current operating conditions)
     d. Check user's recent queries for conversational context
  3. Query Expansion:
     a. Add synonyms for technical terms
     b. Add related asset IDs (parent systems, similar equipment)
     c. Add domain-specific context from user role
  4. Intent Classification:
     - Procedural: "How do I..." -> prioritize SOPs, work instructions
     - Troubleshooting: "Why is..." -> prioritize RCAs, troubleshooting guides
     - Factual: "What is..." -> prioritize specifications, standards
     - Historical: "When did..." -> prioritize logs, reports, incidents
OUTPUT: Enriched query object with intent, entities, context
```

**Step 2.2: Knowledge Retrieval & Ranking**
```
ACTION: Search knowledge base and rank results
INPUTS: Enriched query
PROCESS:
  1. Multi-strategy search:
     a. Semantic search: Vector similarity against knowledge embeddings
     b. Keyword search: Full-text search with boosted fields
     c. Graph search: Follow knowledge graph relationships from matched entities
     d. Metadata search: Filter by context (domain, asset, role relevance)
  2. Merge and deduplicate results
  3. Apply ranking algorithm (6-component composite score)
  4. Apply access control filters (user permissions)
  5. Apply freshness filter (exclude expired items, warn about aging items)
  6. Select top N results (default: 5 for query, 3 for push)
  7. Generate contextual summary from top results
OUTPUT: Ranked results with contextual summary
```

**Step 2.3: Response Generation & Delivery**
```
ACTION: Format and deliver knowledge to user
INPUTS: Ranked results, user preferences
PROCESS:
  1. Generate contextual summary:
     - Extract key points from top 3 results
     - Tailor language to user's expertise level
     - Include specific recommendations if applicable
     - Cite sources with confidence indicators
  2. Format results based on user preference:
     - Summary: 2--3 sentence answer + source links
     - Detailed: Full knowledge items with highlights
     - Visual: Decision tree or flowchart if available
     - Step-by-step: Procedure format with checkpoints
  3. Add quick actions:
     - "View full document"
     - "Open related work order"
     - "Contact subject matter expert"
     - "Was this helpful?" feedback button
  4. Deliver through appropriate channel
  5. Log delivery for analytics
OUTPUT: Formatted knowledge delivery, usage log entry
MCP: mcp-teams (bot response / notification), mcp-sharepoint (document links)
```

### Phase 3: Continuous Improvement (Ongoing)

**Step 3.1: Usage Analytics & Gap Detection**
```
ACTION: Analyze delivery patterns and identify gaps
INPUTS: Delivery logs, user feedback
PROCESS:
  1. Track delivery metrics:
     - Query volume and patterns (trending topics)
     - Click-through rates on results
     - Time-to-resolution after delivery
     - User satisfaction ratings
     - Repeat queries (indicates unsatisfied need)
  2. Detect knowledge gaps:
     - Queries with zero results
     - Queries with low relevance scores (< 0.50)
     - Queries with negative user feedback
     - Topics with high query volume but low quality scores
  3. Generate gap report for KM-01:
     - Priority 1: Safety-related gaps (no knowledge for safety queries)
     - Priority 2: High-frequency gaps (many people asking, no good answer)
     - Priority 3: Role-critical gaps (essential knowledge missing for key roles)
  4. Recommend knowledge creation priorities
OUTPUT: Analytics dashboard, knowledge gap report, creation priorities
MCP: mcp-powerbi (analytics dashboard), mcp-sharepoint (gap report)
```

**Step 3.2: Relevance Model Tuning**
```
ACTION: Improve ranking and delivery based on feedback
INPUTS: Usage analytics, user feedback, expert evaluation
PROCESS:
  1. Analyze feedback signals:
     - Explicit: thumbs up/down, ratings, comments
     - Implicit: click-through, time on page, return to search
  2. Adjust ranking weights:
     - If high-quality items being missed: increase quality weight
     - If contextual matches poor: refine context mapping rules
     - If outdated content ranking high: increase recency weight
  3. Retrain personalization model:
     - Update user preference profiles from behavior
     - Refine role-based knowledge domain mappings
     - Improve expertise level detection
  4. A/B test ranking changes on subset of queries
  5. Deploy improved model when metrics improve
OUTPUT: Updated ranking model, A/B test results
```

---

## 8. Quality Criteria

| Metric                              | Target         | Measurement                                          |
|--------------------------------------|----------------|------------------------------------------------------|
| Query Response Time                  | < 3 seconds    | System latency monitoring                             |
| Push Delivery Latency                | < 30 seconds from trigger | Event-to-delivery tracking               |
| Result Relevance (user-rated)        | >= 4.0/5.0     | Feedback ratings                                      |
| Zero-Result Rate                     | < 5%           | Query analytics                                       |
| Click-Through Rate                   | >= 60% on top-3 results | Click analytics                             |
| Knowledge Gap Detection              | 100% zero-result queries logged | Gap report completeness             |
| User Adoption                        | >= 70% of target users active monthly | Usage analytics           |
| Search-to-Resolution Time            | < 2 minutes (median) | Time tracking                                |
| Proactive Push Acceptance            | >= 50% of pushes viewed | Notification analytics                  |

---

## 9. Inter-Agent Dependencies

| Agent       | Direction  | Skill/Data                | Purpose                                              |
|-------------|-----------|---------------------------|------------------------------------------------------|
| Agent 12    | Upstream  | KM-01 (Capture & Classify) | Knowledge items as the retrieval corpus               |
| Agent 12    | Upstream  | KM-04 (Maintain Currency)  | Freshness scores and expiration flags                 |
| Agent 12    | Downstream| KM-01 (Knowledge Capture)  | Gap reports trigger new knowledge creation            |
| Agent 8     | Consumer  | COMM work context          | Commissioning context for knowledge delivery          |
| Agent 10    | Consumer  | PERF analysis context      | Performance analysis context for knowledge delivery   |
| Agent 11    | Consumer  | DT initiative context      | DT initiative context for knowledge delivery          |

---

## 10. MCP Integrations

### mcp-sharepoint
```yaml
purpose: "Knowledge base search, document retrieval, knowledge portal"
operations:
  - action: "search"
    resource: "knowledge_base"
    method: "semantic + keyword"
    filters: ["domain", "asset", "role", "freshness"]
  - action: "read"
    resource: "document"
    path: "/Knowledge-Base/{domain}/{id}"
  - action: "read"
    resource: "user_profile"
    attributes: ["role", "department", "site", "expertise"]
```

### mcp-teams
```yaml
purpose: "Query bot interface, proactive push notifications, expert connection"
operations:
  - action: "respond"
    resource: "bot_message"
    format: "adaptive_card"
    template: "KM02_KnowledgeResult"
  - action: "send"
    resource: "notification"
    template: "KM02_ProactivePush"
  - action: "connect"
    resource: "expert_call"
    when: "escalation_triggered"
```

---

## 11. Templates & References

### Knowledge Result Card Template (Teams Adaptive Card)

```json
{
  "type": "AdaptiveCard",
  "body": [
    {"type": "TextBlock", "text": "Based on your question about SAG mill vibration...", "wrap": true, "weight": "bolder"},
    {"type": "TextBlock", "text": "[AI-generated contextual summary]", "wrap": true},
    {"type": "FactSet", "facts": [
      {"title": "Confidence", "value": "High (94%)"},
      {"title": "Sources", "value": "3 knowledge items"}
    ]},
    {"type": "Container", "items": [
      {"type": "TextBlock", "text": "Top Results:", "weight": "bolder"},
      {"type": "TextBlock", "text": "1. SAG Mill Bearing Failure Analysis (4.2/5 quality)", "wrap": true},
      {"type": "TextBlock", "text": "2. Main Bearing Lubrication Practices (4.0/5 quality)", "wrap": true}
    ]}
  ],
  "actions": [
    {"type": "Action.OpenUrl", "title": "View Full Results", "url": "..."},
    {"type": "Action.Submit", "title": "Helpful", "data": {"feedback": "positive"}},
    {"type": "Action.Submit", "title": "Not Helpful", "data": {"feedback": "negative"}}
  ]
}
```

---

## 12. Examples

### Example 1: Maintenance Technician Query

**Context**: Maintenance technician on night shift needs troubleshooting guidance for pump cavitation.

**Invocation**:
```
/deliver-contextual-knowledge --query "pump 203A cavitation how to fix" --context asset:PMP-203A --format step-by-step
```

**Response**:
- **Contextual Summary**: "Pump 203A (centrifugal, 150HP) has experienced cavitation 3 times in the past 12 months. Root cause has been suction line restriction (2x) and NPSH margin erosion from elevated fluid temperature (1x). Immediate steps: 1) Check suction strainer DP, 2) Verify fluid temperature vs. design, 3) Check suction valve fully open."
- **Top Results**: Troubleshooting guide (rank 1), last 2 work orders with resolution (rank 2-3), pump specification sheet (rank 4)
- **Response Time**: 1.8 seconds
- **User Feedback**: Thumbs up, resolved issue in 15 minutes

### Example 2: Proactive Push -- Alarm Triggered

**Context**: High-pressure alarm triggers on reactor vessel. System automatically pushes knowledge to control room operator.

**Trigger Event**: Alarm PIC-401 > High-High at Reactor #3

**Pushed Knowledge**:
- Emergency procedure for reactor high pressure (immediate)
- Last similar alarm event report (2024-08-15) with resolution
- Relief valve inspection status (last tested 2024-11-01, PASSED)
- Contact: On-call process engineer (phone number)

**Delivery**: Teams notification + embedded panel in DCS HMI
**Response Time**: 8 seconds from alarm
