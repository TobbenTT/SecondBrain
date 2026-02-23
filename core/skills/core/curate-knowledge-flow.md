# Curate Knowledge Flow

## Skill ID: G-002
## Version: 1.0.0
## Category: G. Knowledge & Memory Management
## Priority: High

## Purpose

Manage the knowledge taxonomy, prompt library, and retrieval routing for VSC's Second Brain system. This skill is the intelligence layer between raw knowledge capture and knowledge consumption, ensuring that captured artifacts are correctly classified, stored in the right location, surfaced to the right agents and people at the right time, and maintained over their lifecycle. Inspired by the emerging role of Knowledge-Flow Curator described by Nate B Jones, this skill maintains classification buckets, routing rules, cross-project knowledge sharing protocols, and the overall health of the knowledge ecosystem. It prevents the Second Brain from becoming a disorganized dump of information by applying continuous curation.

## Intent & Specification

**Problem:** Knowledge management systems fail not because of capture (that is solved by `capture-knowledge-artifact`) but because of curation. Without active curation, knowledge bases become graveyards: full of content, impossible to navigate, with outdated information sitting alongside current insights. The specific failure modes are: (1) Misclassification -- artifacts tagged incorrectly, making them unfindable; (2) Orphaned knowledge -- artifacts with no connections, invisible to retrieval; (3) Knowledge silos -- project-specific knowledge never promoted to cross-project methodology; (4) Stale content -- outdated artifacts presented alongside current ones without distinction; (5) Retrieval failure -- the right knowledge exists but is not surfaced when needed; (6) Taxonomy drift -- categories become inconsistent as different people classify differently.

**Success Criteria:**
- Knowledge taxonomy is maintained with clear, non-overlapping categories
- Classification accuracy exceeds 90% (verified by periodic human review)
- Prompt library is organized, versioned, and searchable
- Retrieval routing delivers relevant knowledge to requesting agents/users >85% of the time
- Cross-project knowledge is identified and promoted to methodology library within 2 weeks
- Stale content is flagged for review within 30 days of becoming outdated
- Orphaned artifacts (no connections) represent <10% of the knowledge base
- Taxonomy is reviewed and updated quarterly

**Constraints:**
- Must maintain consistency across multiple curators (human and AI)
- Must handle bilingual content (English and Spanish) with unified taxonomy
- Must respect confidentiality boundaries (client knowledge stays in client projects)
- Must not create bottlenecks (curation should be mostly automated with human oversight)
- Must support knowledge sharing without leaking project-specific client information
- Must integrate with all capture sources and consumption points in the system
- Must produce audit trail of curation decisions

## Trigger / Invocation

**Manual Triggers:**
- `curate-knowledge-flow classify --artifact [KC-NNNN]` (reclassify an artifact)
- `curate-knowledge-flow route --artifact [KC-NNNN] --destination [target]`
- `curate-knowledge-flow promote --artifact [KC-NNNN] --to methodology` (promote to methodology)
- `curate-knowledge-flow review --scope [domain|project|all] --period [timeframe]`
- `curate-knowledge-flow taxonomy update --action [add|merge|split|retire] --category [name]`
- `curate-knowledge-flow search --query [question] --context [project|domain|all]`
- `curate-knowledge-flow health` (knowledge base health report)

**Automatic Triggers:**
- New artifact captured by `capture-knowledge-artifact` -> classify and route
- Artifact not accessed in 6 months -> flag for staleness review
- Multiple artifacts on same topic detected -> suggest consolidation
- New project onboarded -> seed project knowledge base from methodology library
- Agent requests knowledge -> execute retrieval routing
- Weekly scheduled review -> generate curation report
- Quarterly taxonomy review trigger

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Knowledge Artifacts | capture-knowledge-artifact | Yes | Artifacts to classify and route |
| Taxonomy Definition | Configuration | Yes | Current classification taxonomy |
| Routing Rules | Configuration | Yes | Rules for where artifacts should go |
| Project Registry | System | Yes | Active projects and their knowledge boundaries |
| Agent Registry | System | Yes | Active agents and their knowledge needs |
| Usage Analytics | System | No | Artifact access patterns and search queries |
| Curator Feedback | Human / Agent | No | Corrections to auto-classification |
| Cross-Reference Index | System | No | Existing connections between artifacts |

**Taxonomy Structure:**
```yaml
knowledge_taxonomy:
  domains:
    OR_Methodology:
      sub_domains:
        - "Operations Readiness Framework"
        - "Transition Planning"
        - "Commissioning Participation"
        - "Steady-State Operations"
      description: "Core OR methodology, frameworks, and best practices"

    Operations:
      sub_domains:
        - "Process Operations"
        - "Shift Management"
        - "SOP Development"
        - "CMMS & Systems"
        - "Operator Competency"
      description: "Plant operations knowledge"

    Maintenance:
      sub_domains:
        - "Maintenance Strategy"
        - "Reliability Engineering"
        - "Predictive Maintenance"
        - "Spare Parts Management"
        - "Shutdown Planning"
      description: "Maintenance engineering and execution knowledge"

    HSE:
      sub_domains:
        - "Safety Management"
        - "Environmental Management"
        - "Emergency Response"
        - "Regulatory Compliance"
        - "Risk Assessment"
      description: "Health, safety, and environmental knowledge"

    HR_People:
      sub_domains:
        - "Organization Design"
        - "Staffing & Recruitment"
        - "Training & Competency"
        - "Labor Relations"
        - "Change Management"
      description: "Human resources and organizational knowledge"

    Finance:
      sub_domains:
        - "OPEX Modeling"
        - "Budgeting"
        - "Contract Management"
        - "Cost Benchmarking"
      description: "Financial planning and management knowledge"

    Project_Management:
      sub_domains:
        - "Planning & Scheduling"
        - "Stakeholder Management"
        - "Risk Management"
        - "Reporting"
        - "Governance"
      description: "Project execution and management knowledge"

    AI_Automation:
      sub_domains:
        - "Prompt Engineering"
        - "Agent Design"
        - "Workflow Automation"
        - "AI Tools & Platforms"
        - "AI Governance"
      description: "AI/automation methodology and tools knowledge"

    Industry_Trends:
      sub_domains:
        - "Lithium Industry"
        - "Mining Technology"
        - "Sustainability"
        - "Market Intelligence"
      description: "Industry-wide trends and intelligence"

    Client_Intelligence:
      sub_domains:
        - "Client Standards"
        - "Client Preferences"
        - "Relationship History"
        - "Competitor Intelligence"
      description: "Client-specific knowledge (confidentiality restricted)"

  cross_cutting_tags:
    - "lessons-learned"
    - "best-practice"
    - "anti-pattern"
    - "benchmark"
    - "template"
    - "tool-technique"
    - "regulation-standard"
    - "vendor-oem"
```

## Output Specification

**Primary Outputs:**

1. **Classified and Routed Artifacts:** Knowledge cards with verified classification and routing

2. **Curation Report:**
```markdown
# Knowledge Curation Report
## Period: {date range}
## Generated: {date}

### Knowledge Base Health
- Total artifacts: {N}
- New this period: {N}
- Classified correctly (spot-check): {N}%
- Orphaned (no connections): {N} ({N}%)
- Stale (not accessed in 6+ months): {N} ({N}%)
- Duplicates detected and merged: {N}

### Domain Distribution
| Domain | Count | New | Stale | Health |
|--------|-------|-----|-------|--------|
| {domain} | {N} | {N} | {N} | {good/attention/critical} |

### Routing Effectiveness
- Retrieval requests: {N}
- Relevant results delivered: {N}%
- Failed retrievals (no results): {N}
- Common failed queries: {list}

### Curation Actions Taken
- Reclassified: {N} artifacts
- Connections added: {N}
- Promoted to methodology: {N}
- Archived (stale): {N}
- Merged (duplicates): {N}

### Recommendations
1. {Recommendation for taxonomy improvement}
2. {Knowledge gap to address}
3. {Stale content to review}
```

3. **Taxonomy Update Record:**
```markdown
# Taxonomy Update: {description}
## Date: {date}
## Action: {add / merge / split / retire}
## Category: {affected category}
## Rationale: {why this change}
## Impact: {N artifacts reclassified}
## Approved by: {name}
```

4. **Retrieval Result:**
```markdown
# Knowledge Retrieval: {query}
## Context: {project / domain / all}
## Results: {N} artifacts found

### Most Relevant
1. **KC-{NNNN}:** {title} — Relevance: {high/medium} — {1-line summary}
2. **KC-{NNNN}:** {title} — Relevance: {high/medium} — {1-line summary}
3. **KC-{NNNN}:** {title} — Relevance: {medium} — {1-line summary}

### Also Related
- KC-{NNNN}: {title}
- KC-{NNNN}: {title}

### Knowledge Gaps
- No artifacts found for: {aspect of query not covered}
- Suggested capture: {what knowledge would fill the gap}
```

## Methodology & Standards

- **Knowledge-Flow Curator Role:** This is not passive filing. The curator actively manages the flow of knowledge through the system. Key responsibilities: (1) Ensure correct classification at ingest; (2) Build and maintain connections between artifacts; (3) Promote project-specific knowledge to methodology when it has cross-project value; (4) Retire stale content before it misleads; (5) Fill knowledge gaps by triggering capture requests; (6) Optimize retrieval routing based on usage patterns.

- **Classification Protocol:**
  - Primary domain: the single best-fit domain from the taxonomy
  - Sub-domain: the most specific applicable sub-domain
  - Tags: 3-6 descriptive tags including at least one cross-cutting tag
  - Actionability: Reference / Action / Insight / Template / Decision
  - Confidence: Auto-classified (pending review) or Human-verified
  - When classification is ambiguous: assign to the domain where the artifact will be most useful for retrieval, not where it was generated

- **Routing Rules Engine:**
  ```yaml
  routing_rules:
    - name: "Action items to responsible agent"
      condition: "actionability == 'Action' AND owner is agent"
      destination: "{owner_agent}/inbox"
      priority: "high"
      notification: "immediate"

    - name: "Project knowledge to project base"
      condition: "project != 'General'"
      destination: "projects/{project}/knowledge"
      priority: "normal"
      notification: "none"

    - name: "Methodology insights to methodology library"
      condition: "actionability == 'Insight' AND domain IN ['OR_Methodology', 'AI_Automation']"
      destination: "methodology/{domain}"
      priority: "normal"
      notification: "weekly_digest"

    - name: "Templates to prompt library"
      condition: "actionability == 'Template'"
      destination: "prompt_library/{domain}"
      priority: "normal"
      notification: "none"

    - name: "Client intelligence restricted routing"
      condition: "domain == 'Client_Intelligence'"
      destination: "clients/{client}/intelligence"
      access_control: "client_team_only"
      priority: "normal"
      notification: "none"

    - name: "Urgent items to daily nudge"
      condition: "urgency == 'Immediate'"
      destination: "nudge_queue"
      priority: "critical"
      notification: "immediate"
  ```

- **Cross-Project Knowledge Promotion:**
  - When an artifact from a specific project is also valuable for other projects, it should be promoted to the methodology library
  - Promotion criteria: (1) The insight is not client-specific; (2) It applies to at least 2 projects; (3) It represents a best practice, lesson learned, or reusable pattern
  - Promotion process: create a generalized version (strip project-specific details), file in methodology library, link back to original project artifact
  - The original project artifact remains in the project knowledge base

- **Staleness Management:**
  - Artifacts not accessed in 6 months are flagged for review
  - Review options: confirm (still relevant, update review date), update (refresh content), archive (move to archive), delete (permanently remove if no value)
  - Archived artifacts are searchable but deprioritized in retrieval results
  - Deleted artifacts are logged for audit but content is removed

- **Prompt Library Management:**
  - The prompt library is a curated collection of reusable prompts with contracts
  - Organized by domain and use case
  - Each prompt has a contract (from `create-prompt-contract`) and usage statistics
  - Prompts are versioned and tested before promotion to the library
  - Deprecated prompts are archived with migration notes to replacement prompts

## Step-by-Step Execution

### Step 1: Classify Incoming Artifact
1. Receive new artifact from `capture-knowledge-artifact`
2. Review the auto-classification (domain, sub-domain, tags, actionability)
3. Apply classification rules:
   - Does the domain match the content? If not, reclassify
   - Are tags specific enough for retrieval? If not, add tags
   - Is actionability correctly assessed? Verify
4. Check for existing artifacts in the same sub-domain:
   - Are there similar artifacts? If so, should this be merged or linked?
   - Does this contradict existing artifacts? If so, flag for resolution
5. Set classification confidence: auto (pending review) or verified

### Step 2: Build Connections
1. Search for related artifacts using:
   - Same domain/sub-domain
   - Overlapping tags
   - Content similarity (semantic search)
   - Same project or deliverable
2. For each potential connection, determine relationship type:
   - Supports: this artifact reinforces or provides evidence for another
   - Contradicts: this artifact challenges or disagrees with another
   - Extends: this artifact builds upon or adds detail to another
   - Related: topically connected but not directional
3. Create bidirectional links (both artifacts reference each other)
4. Update Maps of Content if the artifact fits an existing map
5. If 3+ unconnected artifacts exist for a new topic: create a new Map of Content

### Step 3: Apply Routing Rules
1. Evaluate the artifact against all routing rules
2. Route to primary destination based on first matching rule
3. Apply secondary routing if multiple rules match (copy to multiple destinations)
4. Enforce access control for confidential artifacts
5. Queue notifications based on rule configuration
6. Log routing decision for audit

### Step 4: Assess Cross-Project Value
1. If the artifact is project-specific, evaluate for promotion:
   - Is the insight generalizable (not client-specific)?
   - Would other projects benefit from this knowledge?
   - Does it represent a best practice, lesson learned, or reusable pattern?
2. If promotion criteria met:
   - Create a generalized version (strip project details, anonymize client)
   - File generalized version in methodology library
   - Link back to project-specific original
   - Notify relevant agents and team members
3. If not promotable: keep in project knowledge base only

### Step 5: Manage Prompt Library
1. When a new prompt template artifact is captured:
   - Verify it has a prompt contract (or create one)
   - Test the prompt with sample inputs
   - Categorize by domain and use case
   - Assign version number
   - Add to the prompt library index
2. When an existing prompt is updated:
   - Version the update (MAJOR.MINOR.PATCH)
   - If breaking change: notify all users of the prompt
   - Deprecate old version with migration notes
   - Update prompt library index
3. Monthly: review prompt usage statistics
   - High-use prompts: prioritize maintenance and improvement
   - Low-use prompts: assess value, consider retirement
   - Failed prompts (low quality scores): flag for redesign

### Step 6: Execute Retrieval Routing
1. Receive retrieval request (query + context)
2. Parse the query to identify:
   - Key concepts and entities
   - Relevant domains and sub-domains
   - Time relevance (recent vs. historical)
   - Confidentiality scope (project-specific or general)
3. Search the knowledge base:
   - Full-text search against artifact content
   - Tag-based filtering
   - Connection graph traversal
   - Recency weighting (newer artifacts scored higher)
4. Rank results by relevance:
   - Content match quality
   - Source confidence level
   - Artifact quality score
   - Access frequency (popular artifacts ranked higher)
   - Freshness (recent artifacts ranked higher)
5. Return top results with relevance explanation
6. Identify knowledge gaps (aspects of query not covered)
7. Log retrieval for analytics

### Step 7: Perform Staleness Review
1. Query for artifacts not accessed in the staleness threshold period (default: 6 months)
2. For each stale artifact:
   - Is the content still current? (check for dated references, superseded standards)
   - Is the topic still relevant? (check against current project needs)
   - Are connections still valid? (check linked artifacts)
3. Assign disposition:
   - Confirm: still relevant, update review date, keep active
   - Update: content needs refresh, flag for re-enrichment
   - Archive: no longer relevant but may have historical value
   - Delete: no value, remove (with audit log)
4. Execute disposition actions
5. Update knowledge base statistics

### Step 8: Generate Curation Report
1. Compile period statistics:
   - New artifacts, classifications, routings
   - Retrieval requests and success rates
   - Staleness review results
   - Taxonomy changes
2. Calculate knowledge base health metrics:
   - Classification accuracy (sample-based)
   - Orphan rate (artifacts with no connections)
   - Stale rate (artifacts past review date)
   - Duplicate rate (detected duplicates)
3. Identify trends:
   - Growing domains (where knowledge is accumulating)
   - Shrinking domains (where capture has slowed)
   - Retrieval failures (what people search for but cannot find)
4. Generate recommendations:
   - Taxonomy adjustments needed
   - Knowledge gaps to fill
   - Curation process improvements
5. Distribute report to knowledge stakeholders

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Classification Accuracy | Auto-classification matches human review | > 90% |
| Routing Effectiveness | Relevant knowledge delivered on retrieval | > 85% |
| Connection Density | Average connections per artifact | > 2.0 |
| Orphan Rate | Artifacts with zero connections | < 10% |
| Staleness Rate | Artifacts past review date | < 15% |
| Promotion Rate | Project knowledge promoted to methodology per quarter | > 5 artifacts |
| Retrieval Speed | Time from query to results | < 5 seconds |
| Taxonomy Consistency | Classification consistency across curators | > 85% |
| Knowledge Gap Detection | Failed queries leading to capture requests | 100% documented |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `capture-knowledge-artifact` | Upstream | Provides raw captured artifacts for curation |
| `build-second-brain` | Bidirectional | Operates within the Second Brain architecture |
| `generate-daily-nudge` | Downstream | Surfaces curated knowledge in daily briefings |
| `sync-memory-agents` | Downstream | Curated knowledge synced to agent memories |
| `create-prompt-contract` | Bidirectional | Manages prompt contracts in the prompt library |
| `define-intent-specification` | Upstream | Specifications captured and curated as templates |
| All `agent-*` | Consumer | Agents query knowledge base through curation routing |
| `orchestrate-or-agents` | Consumer | Orchestrator uses curated knowledge for task context |

## Templates & References

**Routing Rule Template:**
```yaml
- name: "{descriptive name}"
  condition: "{field} {operator} {value} [AND/OR {field} {operator} {value}]"
  destination: "{path or target}"
  access_control: "{all / team_only / client_team_only}"
  priority: "{critical / high / normal / low}"
  notification: "{immediate / daily_digest / weekly_digest / none}"
```

**Taxonomy Change Request Template:**
```markdown
Taxonomy Change Request
  Action: {add / merge / split / retire}
  Category: {domain or sub-domain}
  Rationale: {why this change is needed}
  Impact Assessment: {N artifacts affected}
  Proposed Change: {specific change description}
  Requested By: {name}
  Date: {date}
```

**Knowledge Health Dashboard Metrics:**
```
Total Artifacts: {N}
Active (accessed in 6 months): {N} ({N}%)
Stale (not accessed in 6 months): {N} ({N}%)
Orphaned (no connections): {N} ({N}%)
Average Quality Score: {X}/5
Top Domain: {domain} ({N} artifacts)
Weakest Domain: {domain} ({N} artifacts, {N} gaps identified)
Retrieval Success Rate: {N}%
```

## Examples

**Example 1: Classifying and Routing a New Artifact**
```
Trigger: New artifact KC-0250 captured from agent-maintenance output

Artifact: "Predictive Maintenance ROI Analysis for Lithium Plant Pumps"

Classification:
  Auto-suggested: Domain=Maintenance, Sub-domain=Predictive Maintenance
  Curator Review: Confirmed. Added sub-domain tag "Cost Benchmarking" (cross-domain)
  Tags: predictive-maintenance, ROI, pumps, lithium, benchmark, cost-analysis
  Actionability: Insight (informs PdM investment decisions)
  Urgency: This Week

Routing:
  Primary: projects/lithium-plant/knowledge/maintenance
  Secondary: methodology/Maintenance/Predictive-Maintenance (promoted: generalizable insight)
  Notification: weekly_digest to agent-finance (cost data relevant)

Connections Added:
  - Extends: KC-0198 "PdM Technology Selection Guide"
  - Supports: KC-0215 "Maintenance Cost Benchmarks for Lithium"
  - Related: KC-0230 "Pump Failure Mode Analysis"
```

**Example 2: Handling a Retrieval Request**
```
Query: "What are the best practices for shift handover in continuous process plants?"
Context: Lithium Plant project, agent-operations requesting

Retrieval Process:
  1. Parse: concepts = [shift handover, best practices, continuous process]
  2. Search: domain=Operations, sub-domain=Shift Management, tags=shift-handover
  3. Results found: 7 artifacts

Results Returned:
  Most Relevant:
  1. KC-0145: "Shift Handover Protocol for Continuous Operations" — Relevance: high
     Summary: Structured handover protocol with checklist, 15-minute overlap minimum
  2. KC-0167: "Lessons from SQM Shift Handover Failures" — Relevance: high
     Summary: Three incidents traced to poor handover, root causes and fixes
  3. KC-0189: "Digital Shift Handover Tools Comparison" — Relevance: medium
     Summary: Comparison of CMMS-based vs standalone handover tools

  Knowledge Gaps:
  - No artifacts on "shift handover during ramp-up phase" (relevant to current project phase)
  - Capture request generated: "Research shift handover adaptations for plant ramp-up"
```

**Example 3: Quarterly Taxonomy Review**
```
Command: curate-knowledge-flow review --scope all --period quarterly

Taxonomy Review Results:
  Period: Q1 2025

  Domain Health:
  | Domain | Artifacts | Growth | Health |
  |--------|-----------|--------|--------|
  | Maintenance | 89 | +23 | Good |
  | Operations | 67 | +15 | Good |
  | AI & Automation | 54 | +31 | Good (fast growing) |
  | HSE | 34 | +5 | Attention (slow growth) |
  | Finance | 28 | +8 | Good |
  | HR & People | 22 | +3 | Attention (slow growth) |

  Taxonomy Changes Recommended:
  1. ADD sub-domain: AI_Automation -> "AI Governance" (12 artifacts currently tagged
     "AI governance" with no sub-domain)
  2. SPLIT sub-domain: Operations -> "CMMS & Systems" into "CMMS" and "Digital Systems"
     (18 artifacts spanning two distinct topics)
  3. RETIRE sub-domain: Industry_Trends -> "Market Intelligence" (0 artifacts in 6 months,
     merged into Client_Intelligence)

  Promotion Queue:
  - 4 artifacts from Lithium Plant project identified for methodology promotion
  - 2 prompt templates from AI working sessions ready for prompt library
```
