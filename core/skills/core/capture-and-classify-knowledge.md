# KM-01: Capture and Classify Knowledge

## 1. Purpose

Systematically capture, structure, and classify organizational knowledge from multiple heterogeneous sources into a unified Second Brain knowledge repository. This skill addresses the staggering $31.5 billion annual loss that Fortune 500 companies suffer from poor knowledge management (IDC, 2023), and the broader reality that critical operational knowledge walks out the door with every retiring expert.

In industrial operations, knowledge is fragmented across email threads, shared drives, tribal memory, vendor documentation, incident reports, meeting recordings, and the minds of experienced operators. This skill provides automated and semi-automated pipelines to extract, enrich, classify, and store this knowledge in a retrievable, maintainable, and contextually linked format that serves as the foundation for all other knowledge management capabilities.

---

## 2. Intent & Specification

| Attribute              | Value                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------|
| **Skill ID**           | KM-01                                                                                       |
| **Agent**              | Agent 12 -- Knowledge Management Curator                                                     |
| **Domain**             | Knowledge Management                                                                         |
| **Version**            | 1.0.0                                                                                        |
| **Complexity**         | High                                                                                         |
| **Estimated Duration** | Initial setup: 10--20 days; Ongoing: continuous                                              |
| **Maturity**           | Production                                                                                   |
| **Pain Point Addressed** | H-03: $31.5 billion annual loss from poor knowledge management in Fortune 500 (IDC, 2023) |
| **Secondary Pain**     | A-02: Workers spend 30--40% of time searching for information (McKinsey, 2023)              |
| **Value Created**      | Effective KM reduces time-to-competency by 50% and decision latency by 35%                  |

### Functional Intent

This skill SHALL:
- Automatically discover and ingest knowledge from 8+ source types (documents, emails, chats, recordings, databases, wikis, vendor portals, incident systems)
- Extract structured knowledge elements from unstructured content using NLP/AI
- Classify knowledge using a multi-dimensional taxonomy (domain, asset, lifecycle phase, criticality)
- Detect and link relationships between knowledge items (references, dependencies, contradictions)
- Assign quality scores, ownership, and expiration dates to all knowledge items
- Maintain knowledge provenance (source, author, date, modification history)
- Support both automated bulk ingestion and manual expert knowledge capture
- Integrate with Second Brain architecture for unified search and retrieval

---

## 3. Trigger / Invocation

### Direct Invocation

```
/capture-and-classify-knowledge --source [sharepoint|teams|email|manual|vendor|incident] --scope [bulk|targeted|single] --domain [maintenance|operations|safety|engineering|all]
```

### Contextual Triggers

- New document uploaded to monitored SharePoint libraries
- Incident report completed (post-incident knowledge capture)
- Project milestone reached (lessons learned capture)
- Expert retirement or transition announced (knowledge extraction priority)
- Teams channel conversation tagged with #knowledge or #lesson-learned
- Vendor documentation updated (new revision detected)
- Agent 12 detects knowledge gap from failed queries in KM-02

---

## 4. Input Requirements

### Required Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `source_type`                | Enum          | Manual / Auto-detected     | Source system: sharepoint, teams, email, manual, vendor, incident|
| `content`                    | Mixed         | Source system               | Raw content to be processed (document, message, recording, etc.)|
| `capture_scope`              | Enum          | Manual                     | bulk (library scan), targeted (specific topic), single (one item)|
| `domain_context`             | Enum          | Manual / Auto-detected     | Knowledge domain for classification context                      |

### Optional Inputs

| Input                        | Type          | Source                     | Description                                                     |
|------------------------------|---------------|----------------------------|-----------------------------------------------------------------|
| `taxonomy_override`          | Object        | mcp-sharepoint             | Custom taxonomy for organization-specific classification         |
| `subject_matter_expert`      | Object        | Manual                     | SME for validation of extracted knowledge                        |
| `priority_level`             | Enum          | Manual                     | Urgency: critical, high, normal, low                             |
| `related_assets`             | Array[String] | mcp-sharepoint             | Asset tags for knowledge-to-asset linking                        |
| `expiration_policy`          | Object        | Manual / Default           | Knowledge freshness rules for this content type                  |

### Input Validation Rules

```yaml
validation:
  content:
    max_file_size_mb: 500
    supported_formats: ["pdf", "docx", "xlsx", "pptx", "msg", "eml", "mp4", "mp3", "txt", "html", "json", "csv"]
    language_detection: true
    supported_languages: ["en", "es", "pt"]
  source_type:
    allowed: ["sharepoint", "teams", "email", "manual", "vendor", "incident", "onenote", "notion"]
  capture_scope:
    allowed: ["bulk", "targeted", "single"]
```

---

## 5. Output Specification

### Primary Outputs

| Output                          | Format       | Destination              | Description                                                   |
|---------------------------------|--------------|--------------------------|---------------------------------------------------------------|
| `knowledge_items`               | JSON         | Second Brain repository   | Structured knowledge items with metadata and classification    |
| `capture_report`                | JSON + XLSX  | mcp-sharepoint           | Summary of captured, classified, and flagged items             |
| `knowledge_graph_updates`       | JSON         | Second Brain graph DB     | Relationship data between knowledge items                      |
| `quality_flags`                 | JSON         | Agent 12 queue           | Items requiring SME review, deduplication, or conflict resolution|
| `taxonomy_suggestions`          | JSON         | Agent 12                 | Proposed new taxonomy terms discovered during classification   |

### Output Schema: Knowledge Item

```json
{
  "knowledge_id": "KI-2025-003456",
  "title": "Crusher Bearing Failure Mode Analysis -- SAG Mill #2",
  "type": "technical_analysis",
  "domain": "maintenance",
  "sub_domain": "reliability_engineering",
  "asset_tags": ["SAG-ML-002", "BEARING-MAIN-001"],
  "lifecycle_phase": "operations",
  "criticality": "high",
  "content": {
    "summary": "Root cause analysis of recurring main bearing failures on SAG Mill #2...",
    "full_text": "...",
    "key_findings": ["Misalignment exceeded 0.003 inches", "Lubrication frequency insufficient"],
    "recommendations": ["Increase alignment checks to quarterly", "Upgrade to synthetic lubricant"],
    "data_references": ["vibration_data_2024Q3.csv", "maintenance_log_SAG2_2024.xlsx"]
  },
  "classification": {
    "primary_taxonomy": ["Maintenance", "Reliability", "Failure Analysis", "Rotating Equipment"],
    "secondary_taxonomy": ["SAG Mill", "Bearings", "Alignment", "Lubrication"],
    "knowledge_type": "explicit",
    "format_origin": "document",
    "confidence_score": 0.92
  },
  "metadata": {
    "source": "sharepoint",
    "source_path": "/Engineering/Reliability/RCA Reports/2024/SAG2-Bearing-RCA.docx",
    "author": "Carlos Mendoza",
    "author_role": "Senior Reliability Engineer",
    "created_date": "2024-11-15",
    "captured_date": "2025-01-20",
    "last_validated": "2025-01-20",
    "expiration_date": "2026-01-20",
    "language": "es",
    "quality_score": 4.2,
    "validation_status": "sme_validated"
  },
  "relationships": [
    {"type": "references", "target": "KI-2025-002890", "label": "Previous RCA for SAG Mill #1"},
    {"type": "supersedes", "target": "KI-2024-001234", "label": "Earlier bearing analysis"},
    {"type": "related_to", "target": "KI-2025-003100", "label": "Lubrication best practices"}
  ],
  "access_control": {
    "visibility": "internal",
    "departments": ["Maintenance", "Engineering", "Operations"],
    "classification": "confidential"
  }
}
```

### Knowledge Type Taxonomy

| Level 1         | Level 2                    | Level 3 Examples                                          |
|-----------------|----------------------------|-----------------------------------------------------------|
| Technical       | Procedures                 | SOPs, Work Instructions, Checklists                       |
| Technical       | Specifications             | Equipment specs, Material specs, Design criteria          |
| Technical       | Analysis                   | RCA, FMEA, Reliability studies, Engineering calculations  |
| Technical       | Standards                  | Industry standards, Company standards, Regulatory         |
| Operational     | Operating Procedures       | Startup, Shutdown, Normal, Emergency                      |
| Operational     | Performance Data           | KPIs, Benchmarks, Trend analysis                          |
| Operational     | Incident Records           | Near-miss, Incidents, Accident investigations             |
| Management      | Strategies                 | Business plans, Budgets, Roadmaps                         |
| Management      | Policies                   | HSE, HR, IT, Procurement policies                         |
| Management      | Lessons Learned            | Project lessons, Incident lessons, Improvement ideas      |
| Tacit           | Expert Knowledge           | Decision heuristics, Troubleshooting guides, Experience   |
| Tacit           | Contextual                 | Site-specific conditions, Cultural factors, History       |
| External        | Vendor Documentation       | Manuals, Bulletins, Technical notes                       |
| External        | Industry Intelligence      | Benchmarks, Best practices, Research                      |

---

## 6. Methodology & Standards

### Theoretical Foundation

- **Nonaka & Takeuchi SECI Model** -- Socialization, Externalization, Combination, Internalization
- **DIKW Pyramid** -- Data, Information, Knowledge, Wisdom hierarchy
- **Cynefin Framework** -- Knowledge classification by domain complexity
- **Dublin Core Metadata Standard** -- Metadata element set for knowledge items
- **ISO 30401:2018** -- Knowledge management systems requirements
- **APQC Knowledge Management Framework** -- Process-based KM approach

### Industry Statistics

| Statistic                                                           | Source                    | Year |
|---------------------------------------------------------------------|---------------------------|------|
| $31.5 billion lost annually by Fortune 500 from poor KM             | IDC                       | 2023 |
| Workers spend 30--40% of time searching for information              | McKinsey                  | 2023 |
| 42% of organizational knowledge exists only in employees' heads      | Panopto                   | 2023 |
| 70% of knowledge is lost when an expert retires                      | APQC                      | 2023 |
| Organizations with mature KM: 35% higher productivity                | Deloitte                  | 2024 |
| Average employee recreates 11 existing documents per year            | IDC                       | 2023 |
| Only 20% of organizational knowledge is codified and accessible      | Gartner                   | 2024 |
| AI-assisted knowledge capture increases extraction efficiency by 5x  | MIT Sloan                 | 2024 |

### Knowledge Capture Methods by Type

| Knowledge Type    | Capture Method                           | Automation Level | Quality Control           |
|-------------------|------------------------------------------|------------------|---------------------------|
| Documents         | Automated ingestion + NLP extraction     | High             | AI classification + spot check |
| Email threads     | Selective capture with relevance filter   | Medium           | User-tagged + AI filter    |
| Chat conversations| Keyword/hashtag triggered capture         | Medium           | Champion-curated           |
| Meeting recordings| Transcription + key-point extraction     | High             | Speaker validation         |
| Expert interviews | Structured interview + transcription     | Low              | SME review required        |
| Incident reports  | Automated pipeline from incident system  | High             | Investigator sign-off      |
| Vendor docs       | Version-monitored ingestion              | High             | Engineering review         |
| Tribal knowledge  | Facilitated knowledge elicitation sessions| Low             | Peer review + SME review   |

---

## 7. Step-by-Step Execution

### Phase 1: Source Discovery & Configuration (Day 1--5)

**Step 1.1: Knowledge Source Inventory**
```
ACTION: Map all knowledge sources across the organization
INPUTS: organizational profile, technology inventory
PROCESS:
  1. Catalog primary knowledge repositories:
     - SharePoint sites and document libraries (structure, volume, permissions)
     - Teams channels and conversations (active channels, file sharing)
     - Email (shared mailboxes, distribution lists with technical content)
     - OneNote notebooks (individual and shared)
     - Notion workspaces (if applicable)
     - File shares / network drives (legacy content)
  2. Catalog secondary knowledge sources:
     - CMMS/EAM work order history
     - Incident management system
     - Vendor portals and documentation
     - Training materials (LMS)
     - Engineering drawings and P&IDs
  3. For each source:
     - Estimate volume (documents, messages, hours of recordings)
     - Assess content quality (structured vs. unstructured)
     - Identify access permissions required
     - Determine update frequency
     - Assess strategic importance
  4. Prioritize sources by: volume * quality * strategic_importance
OUTPUT: Knowledge source inventory with prioritization
MCP: mcp-sharepoint (site enumeration), mcp-teams (channel listing), mcp-onenote (notebook discovery)
```

**Step 1.2: Taxonomy Configuration**
```
ACTION: Configure or customize knowledge classification taxonomy
INPUTS: taxonomy_override (if any), industry context
PROCESS:
  1. Load base taxonomy (4-level hierarchical classification)
  2. Customize for organization:
     - Add organization-specific asset types
     - Add site-specific terminology
     - Map to existing document classification (if any)
     - Add industry-specific categories
  3. Configure auto-classification rules:
     - Keyword-to-taxonomy mapping
     - Document type patterns (file naming, metadata)
     - Source-to-domain mapping (e.g., /Maintenance/ -> Maintenance domain)
  4. Define quality scoring rubric:
     - Completeness (0--1): All required fields populated
     - Currency (0--1): Age vs. expected freshness
     - Authority (0--1): Author expertise level
     - Relevance (0--1): Alignment with operational needs
     - Accessibility (0--1): Format usability
     - Quality Score = weighted average (default equal weights)
  5. Validate taxonomy with domain SMEs
OUTPUT: Configured taxonomy, auto-classification rules, quality rubric
MCP: mcp-sharepoint (taxonomy storage), mcp-notion (taxonomy visualization)
```

**Step 1.3: Ingestion Pipeline Configuration**
```
ACTION: Set up automated ingestion pipelines for each source
INPUTS: Knowledge source inventory, taxonomy configuration
PROCESS:
  1. For each prioritized source, configure:
     - Connection and authentication
     - Content filters (file types, date ranges, folders)
     - Extraction rules (what metadata to capture)
     - Classification pipeline (auto-classify then queue for review)
     - Deduplication rules (hash-based + semantic similarity)
     - Scheduling (real-time, daily, weekly depending on source)
  2. Configure NLP extraction pipeline:
     - Entity recognition (assets, people, locations, chemicals)
     - Key phrase extraction
     - Summary generation
     - Relationship detection
     - Language detection and translation support
  3. Set up quality control queues:
     - Auto-approved: high-confidence classification (>= 0.90)
     - SME review: medium-confidence (0.70--0.89)
     - Manual classification: low-confidence (< 0.70)
  4. Test pipeline with sample data (100 items per source)
OUTPUT: Configured ingestion pipelines, test results
MCP: mcp-sharepoint (document pipeline), mcp-teams (chat pipeline), mcp-onenote (notebook pipeline)
```

### Phase 2: Bulk Knowledge Capture (Day 5--15)

**Step 2.1: Document Library Ingestion**
```
ACTION: Process existing document libraries
INPUTS: SharePoint libraries, ingestion pipelines
PROCESS:
  1. Scan all configured libraries for eligible documents
  2. Filter: exclude templates, drafts, personal files
  3. Process each document:
     a. Extract text content (OCR for scanned documents)
     b. Extract metadata (author, dates, properties)
     c. Run NLP pipeline (entities, key phrases, summary)
     d. Auto-classify using taxonomy rules
     e. Detect duplicates against existing knowledge base
     f. Assign quality score
     g. Create knowledge item record
  4. Process batch statistics:
     - Total documents scanned
     - Successfully processed
     - Duplicates detected and merged
     - Items requiring SME review
     - Classification confidence distribution
  5. Queue low-confidence items for human review
OUTPUT: Knowledge items (bulk), processing statistics, review queue
MCP: mcp-sharepoint (document access), mcp-notion (knowledge base storage)
```

**Step 2.2: Communication Knowledge Capture**
```
ACTION: Extract knowledge from Teams conversations and email threads
INPUTS: Teams channels, monitored mailboxes
PROCESS:
  1. Scan configured Teams channels for knowledge-bearing content:
     - Messages with file attachments
     - Threads with > 5 replies (indicates substantive discussion)
     - Messages tagged with #knowledge or #lesson-learned
     - Messages from designated SMEs
  2. For email:
     - Scan shared technical mailboxes
     - Process threads matching keyword filters
     - Extract attached documents for separate processing
  3. For each qualifying communication:
     a. Extract conversation thread (full context)
     b. Identify key knowledge points
     c. Determine if this is new knowledge or supplements existing
     d. Create knowledge item or link to existing item
     e. Tag with participants as knowledge contributors
  4. Flag sensitive/confidential communications for review
OUTPUT: Communication-sourced knowledge items, contributor tags
MCP: mcp-teams (conversation access), mcp-outlook (email access)
```

**Step 2.3: Expert Knowledge Elicitation**
```
ACTION: Capture tacit knowledge from subject matter experts
INPUTS: subject_matter_expert list, knowledge gap analysis
PROCESS:
  1. Prioritize experts for knowledge elicitation:
     - Retirement within 24 months (critical)
     - Sole holder of critical knowledge (critical)
     - Transitioning to new role (high)
     - Recognized domain experts (normal)
  2. For each expert, conduct structured elicitation:
     a. Pre-interview: identify knowledge domains and prepare questions
     b. Interview (60--90 minutes, recorded with consent):
        - "What are the top 5 things a new person in your role must know?"
        - "What are the most common mistakes and how to avoid them?"
        - "What decision rules do you use for [specific situation]?"
        - "Walk me through how you troubleshoot [common problem]"
     c. Post-interview: transcribe, extract knowledge items, create decision trees
     d. Validation: expert reviews captured knowledge for accuracy
  3. Convert tacit knowledge to explicit artifacts:
     - Decision trees and flowcharts
     - Troubleshooting guides
     - Best practice documents
     - Experience-based rules and heuristics
OUTPUT: Tacit knowledge items (validated), expert knowledge maps
MCP: mcp-teams (interview recording), mcp-sharepoint (knowledge storage), mcp-onenote (interview notes)
```

### Phase 3: Classification & Enrichment (Ongoing)

**Step 3.1: Quality Review & Enrichment**
```
ACTION: Review and enhance knowledge items in quality queues
INPUTS: Review queue (medium and low confidence items)
PROCESS:
  1. Present items to appropriate SME reviewers
  2. SME actions:
     a. Validate or correct classification
     b. Add missing metadata (asset tags, domain, criticality)
     c. Improve summary/key findings
     d. Confirm or adjust quality score
     e. Add relationship links to other knowledge items
     f. Set or adjust expiration date
  3. System updates:
     - Update classification confidence to "sme_validated"
     - Update quality score based on enrichment
     - Re-index for search
  4. Track review metrics:
     - Queue depth and aging
     - Reviewer throughput
     - Classification accuracy (auto vs. SME corrected)
OUTPUT: Enriched and validated knowledge items
MCP: mcp-sharepoint (review workflow), mcp-teams (reviewer notifications)
```

**Step 3.2: Knowledge Graph Construction**
```
ACTION: Build and maintain knowledge relationship graph
INPUTS: All knowledge items with relationships
PROCESS:
  1. For each new knowledge item:
     a. Identify explicit references (cited documents, standards)
     b. Detect semantic relationships (similar topics, same assets)
     c. Identify temporal relationships (supersedes, updates, contradicts)
     d. Link to asset hierarchy (equipment -> system -> area -> site)
     e. Link to organizational structure (department, team, role)
  2. Detect knowledge clusters:
     - Groups of items frequently accessed together
     - Topics with dense inter-linking
     - Orphan items with no relationships (flag for review)
  3. Identify knowledge contradictions:
     - Items with conflicting recommendations
     - Outdated items contradicted by newer evidence
     - Queue contradictions for resolution
  4. Generate knowledge maps for visual exploration
OUTPUT: Knowledge graph updates, contradiction flags, knowledge maps
MCP: mcp-notion (graph visualization), mcp-sharepoint (graph data storage)
```

---

## 8. Quality Criteria

| Metric                              | Target         | Measurement                                          |
|--------------------------------------|----------------|------------------------------------------------------|
| Source Coverage                      | >= 80% of identified sources connected | Source inventory audit      |
| Auto-Classification Accuracy         | >= 85% agreement with SME review | Classification audit sample |
| Knowledge Item Completeness          | >= 90% required fields populated | Metadata completeness check  |
| Duplicate Detection Rate             | >= 95% duplicates caught | Manual dedup audit on sample         |
| SME Review Queue Aging               | < 5 business days average | Queue aging metrics               |
| Capture Throughput                   | >= 500 items/day (bulk), >= 50/day (ongoing) | Processing metrics |
| Quality Score Distribution           | >= 70% of items scoring >= 3.5/5 | Quality score analysis       |
| Expert Knowledge Capture Rate        | >= 2 experts/month | Elicitation session tracking             |
| Knowledge Graph Connectivity         | < 5% orphan items | Graph analysis                            |

---

## 9. Inter-Agent Dependencies

| Agent       | Direction  | Skill/Data                | Purpose                                              |
|-------------|-----------|---------------------------|------------------------------------------------------|
| Agent 12    | Downstream| KM-02 (Deliver Knowledge)  | Knowledge items as retrieval candidates               |
| Agent 12    | Downstream| KM-03 (Lessons Learned)    | Lessons learned as a knowledge capture source         |
| Agent 12    | Downstream| KM-04 (Maintain Currency)  | Knowledge items for freshness auditing                |
| Agent 11    | Upstream  | DT-01 (Assessment)         | KM maturity gaps drive capture priorities             |
| Agent 8     | Upstream  | COMM skills                | Commissioning documents as knowledge source           |
| Agent 10    | Upstream  | PERF-03 (Reports)          | Performance reports as knowledge items                |

---

## 10. MCP Integrations

### mcp-sharepoint
```yaml
purpose: "Primary document source, knowledge base storage, taxonomy management"
operations:
  - action: "read"
    resource: "document_libraries"
    scan_mode: "recursive"
    filters: ["modified_after", "file_type", "metadata"]
  - action: "write"
    resource: "knowledge_base"
    path: "/Knowledge-Base/{domain}/{sub_domain}/"
  - action: "manage"
    resource: "taxonomy"
    path: "/Knowledge-Base/Taxonomy/"
```

### mcp-teams
```yaml
purpose: "Chat/conversation knowledge capture, SME coordination"
operations:
  - action: "read"
    resource: "channel_messages"
    filters: ["hashtag", "attachment", "reply_count"]
  - action: "read"
    resource: "meeting_transcripts"
  - action: "send"
    resource: "notification"
    template: "KM01_ReviewRequest"
```

### mcp-onenote
```yaml
purpose: "Notebook knowledge capture, interview notes"
operations:
  - action: "read"
    resource: "notebooks"
    scope: "shared"
  - action: "read"
    resource: "pages"
    filters: ["tag", "modified_after"]
```

### mcp-notion
```yaml
purpose: "Knowledge graph visualization, taxonomy management"
operations:
  - action: "create"
    resource: "database"
    template: "KM01_KnowledgeBase"
  - action: "update"
    resource: "page"
    type: "knowledge_item"
  - action: "query"
    resource: "database"
    filters: ["domain", "asset", "quality_score"]
```

---

## 11. Templates & References

### Expert Knowledge Elicitation Interview Guide

```markdown
## Pre-Interview Preparation
- Review expert's role and domain (15 min)
- Identify knowledge areas to cover based on gap analysis
- Prepare 10--15 structured questions

## Interview Structure (60--90 min)
1. **Role Overview** (5 min): Confirm scope and knowledge domains
2. **Critical Knowledge** (20 min):
   - "What are the top 5 things someone must know to do your job?"
   - "What knowledge is not written down anywhere?"
3. **Decision-Making** (20 min):
   - "How do you decide when to [critical decision]?"
   - "What signals tell you something is wrong with [system/process]?"
4. **Troubleshooting** (20 min):
   - "Walk me through diagnosing [common problem]"
   - "What are the most common mistakes and how to avoid them?"
5. **Relationships & Context** (10 min):
   - "Who else holds important knowledge about this?"
   - "What external resources do you rely on?"
6. **Wrap-up** (5 min): Confirm follow-up review session

## Post-Interview
- Transcribe and extract knowledge items (within 48 hours)
- Create draft decision trees / troubleshooting guides
- Schedule validation review with expert (30 min)
```

---

## 12. Examples

### Example 1: Bulk Capture from Maintenance Library

**Context**: Processing 8,500 documents from /Maintenance/ SharePoint library for a mining operation.

**Invocation**:
```
/capture-and-classify-knowledge --source sharepoint --scope bulk --domain maintenance
```

**Results**:
- **Scanned**: 8,500 documents
- **Processed**: 7,200 (1,300 excluded: templates, drafts, personal)
- **Knowledge Items Created**: 5,800 (1,400 duplicates merged)
- **Auto-Classified (high confidence)**: 4,060 (70%)
- **SME Review Required**: 1,450 (25%)
- **Manual Classification**: 290 (5%)
- **Top Domains**: Preventive Maintenance (32%), Corrective Maintenance (24%), Reliability (18%), Safety (14%), Engineering (12%)
- **Processing Time**: 4.5 hours

### Example 2: Expert Knowledge Capture -- Retiring Metallurgist

**Context**: Senior metallurgist retiring in 6 months; sole expert on concentrate grade optimization.

**Invocation**:
```
/capture-and-classify-knowledge --source manual --scope targeted --domain operations
```

**Results**:
- **Sessions Conducted**: 6 (total 8 hours)
- **Knowledge Items Created**: 47
- **Artifacts Generated**: 3 decision trees, 5 troubleshooting guides, 12 best practice notes, 2 training modules
- **Critical Knowledge Preserved**: Flotation circuit tuning heuristics, reagent interaction rules, seasonal adjustment factors
- **Validated By**: 2 peer metallurgists confirmed accuracy
- **Impact**: New metallurgist reached competency in 3 months vs. typical 12 months
