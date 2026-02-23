# NotebookLM Context Builder

## Skill ID: D-003
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: Medium

## Purpose

Prepare, curate, and structure source documents for ingestion into Google NotebookLM to create specialized knowledge bases for OR (Operational Readiness) workstreams. This skill automates the process of selecting relevant documents, formatting them for optimal NotebookLM processing, organizing them into thematic notebooks, and validating that the resulting knowledge base provides accurate and complete coverage of the target domain.

## Intent & Specification

**Problem:** Building effective NotebookLM notebooks requires careful curation of source documents. Teams dump entire document repositories into notebooks without considering relevance, format compatibility, token limits, or thematic coherence. This produces notebooks that give poor answers, miss critical context, or confuse unrelated topics. Manual curation is time-consuming and inconsistent.

**Success Criteria:**
- Source documents are automatically filtered for relevance to the target topic
- Documents are formatted and chunked for optimal NotebookLM ingestion
- Each notebook has a clear thematic scope with no off-topic sources
- Source coverage is validated against a topic checklist
- Notebook configuration (name, description, source organization) is consistent
- Process is repeatable and auditable

**Constraints:**
- NotebookLM supports up to 50 sources per notebook
- Individual source size limit: approximately 500,000 words per source
- Supported formats: Google Docs, Google Slides, PDFs, web URLs, text/Markdown, YouTube URLs
- Must not include confidential/restricted documents without authorization
- Must handle multilingual documents (English and Spanish primarily)
- Must respect document access permissions

## Trigger / Invocation

**Manual Triggers:**
- `notebooklm-context-builder create --topic [topic] --scope [project/workstream]`
- `notebooklm-context-builder update --notebook [id] --add-sources`
- `notebooklm-context-builder validate --notebook [id]`
- `notebooklm-context-builder curate --document-list [file]`

**Automatic Triggers:**
- New OR project onboarded (creates standard set of notebooks)
- Major document revision published (triggers notebook update)
- Weekly validation check on active notebooks

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Topic/Theme | Command argument | Yes | The knowledge domain for the notebook |
| Project Scope | Command argument | Yes | Project or workstream to filter documents |
| Document Repository Path | Configuration | Yes | Root path for document search (Google Drive, SharePoint) |
| Document Registry | Agent (doc-control) | Yes | Structured index of available documents |
| Topic Checklist | Configuration | No | Expected topics/subtopics for coverage validation |
| Existing Notebook ID | Command argument | Conditional | For update/validate operations |
| Inclusion/Exclusion Rules | Configuration | No | Filters for document selection |
| Language Preference | Configuration | No | Primary language for the notebook |

**Topic Checklist Example:**
```yaml
topic: "Maintenance Readiness"
required_subtopics:
  - "Asset Register"
  - "Criticality Analysis"
  - "RCM / FMECA"
  - "Preventive Maintenance Plans"
  - "Spare Parts Strategy"
  - "CMMS Configuration"
  - "Maintenance KPIs"
  - "Shutdown Planning"
  - "Lubrication Program"
  - "Condition Monitoring"
desired_subtopics:
  - "Maintenance Philosophy"
  - "Contractor Management"
  - "Workshop Requirements"
  - "Tool & Equipment Lists"
```

## Output Specification

**Primary Outputs:**
1. **Notebook Configuration File:** YAML specification for the notebook
2. **Curated Source List:** Ordered list of documents with metadata
3. **Coverage Report:** Gap analysis against topic checklist
4. **Formatted Sources:** Documents prepared for ingestion (if reformatting needed)

**Notebook Configuration:**
```yaml
notebook:
  name: "OR - Maintenance Readiness - Lithium Plant"
  description: "Knowledge base covering maintenance readiness for the Lithium Plant project. Includes asset management, RCM, PM plans, spare parts, and CMMS configuration."
  project: "Lithium Plant"
  workstream: "Maintenance"
  created: "2025-04-01"
  last_updated: "2025-04-15"
  sources:
    - id: 1
      title: "Maintenance Philosophy Document"
      type: "google-doc"
      url: "https://docs.google.com/..."
      relevance_score: 0.95
      topics_covered: ["Maintenance Philosophy", "Maintenance KPIs"]
      word_count: 12000
      language: "en"
    - id: 2
      title: "Asset Register - Lithium Plant"
      type: "pdf"
      path: "/OR/Maintenance/Asset_Register_v3.pdf"
      relevance_score: 0.98
      topics_covered: ["Asset Register", "Criticality Analysis"]
      word_count: 45000
      language: "en"
  total_sources: 28
  total_word_count: 580000
  coverage:
    required_topics_covered: 9
    required_topics_total: 10
    missing_topics: ["Condition Monitoring"]
    coverage_percentage: 90
```

**Coverage Report:**
```
=== Coverage Report: Maintenance Readiness ===

Required Topics:
  [x] Asset Register ............... 3 sources (Asset Register v3, Equipment List, Tag Structure)
  [x] Criticality Analysis ........ 2 sources (Criticality Matrix, ABC Classification)
  [x] RCM / FMECA ................. 2 sources (RCM Study Report, FMECA Worksheets)
  [x] Preventive Maintenance Plans . 4 sources (PM Plans Area 100-400)
  [x] Spare Parts Strategy ......... 2 sources (Spare Parts Philosophy, Initial Stock List)
  [x] CMMS Configuration .......... 1 source  (SAP-PM Config Spec)
  [x] Maintenance KPIs ............. 1 source  (KPI Framework)
  [x] Shutdown Planning ............ 1 source  (Shutdown Strategy)
  [x] Lubrication Program .......... 1 source  (Lubrication Schedule)
  [ ] Condition Monitoring ......... 0 sources  ** GAP **

Desired Topics:
  [x] Maintenance Philosophy ....... 1 source
  [ ] Contractor Management ........ 0 sources
  [x] Workshop Requirements ........ 1 source
  [ ] Tool & Equipment Lists ....... 0 sources

Summary: 90% required coverage (9/10), 50% desired coverage (2/4)
Action Required: Source document for Condition Monitoring
```

## Methodology & Standards

- **Relevance Scoring:** Documents scored 0-1 based on keyword overlap, metadata tags, and document type alignment with target topic. Threshold: 0.6 for inclusion.
- **Deduplication:** When multiple versions of a document exist, only the latest approved version is included.
- **Chunking Strategy:** Documents exceeding NotebookLM size limits are split by logical sections (chapters, major headings) rather than arbitrary character counts.
- **Thematic Coherence:** Each notebook targets a single OR workstream or tightly related cluster. Cross-cutting topics get their own notebook.
- **Source Ordering:** Sources ordered by relevance score descending, then by document hierarchy (philosophy first, then standards, then procedures, then records).
- **Metadata Enrichment:** Each source annotated with topics covered, word count, language, and last revision date.
- **Access Control:** Documents checked against access permissions before inclusion. Restricted documents flagged but not included without authorization.

## Step-by-Step Execution

### Step 1: Define Notebook Scope
1. Parse topic and project scope from invocation
2. Load topic checklist for the specified domain
3. Define search parameters (keywords, document types, date ranges)
4. Identify target notebook structure (new or update existing)

### Step 2: Discover Candidate Documents
1. Query document registry (from `agent-doc-control`) for matching documents
2. Search document repository using keyword and metadata filters
3. Include documents from standard OR document hierarchy
4. Collect candidate list with full metadata

### Step 3: Score and Filter Documents
1. For each candidate document:
   a. Calculate relevance score based on title, keywords, metadata tags, and content sample
   b. Check document status (approved, draft, superseded)
   c. Check access permissions
   d. Estimate word count and format compatibility
2. Filter out: score < 0.6, superseded versions, inaccessible documents
3. Sort by relevance score descending

### Step 4: Curate Final Source List
1. Select top documents up to 50-source limit
2. Ensure topic checklist coverage:
   a. Map each document to topics it covers
   b. Identify gaps in required topics
   c. If gaps exist, lower relevance threshold or flag for manual sourcing
3. Check total word count against NotebookLM limits
4. Remove redundant sources (same topic, lower relevance)

### Step 5: Prepare Sources for Ingestion
1. For each source:
   a. If Google Doc/Slides: verify sharing settings, generate direct link
   b. If PDF: verify file is text-searchable (not scanned image)
   c. If too large: split into logical sections
   d. If format incompatible: convert to supported format
   e. If multilingual: note primary language, add translation notes if needed
2. Generate formatted source list with ingestion instructions

### Step 6: Generate Notebook Configuration
1. Create notebook YAML configuration file
2. Write notebook name and description following naming convention
3. List all sources with metadata
4. Calculate and include coverage statistics

### Step 7: Generate Coverage Report
1. Map all sources against topic checklist
2. Identify gaps and partial coverage
3. Generate human-readable coverage report
4. If gaps in required topics: create action items
5. Recommend additional sources if known

### Step 8: Validate and Deliver
1. Validate configuration file completeness
2. Verify all source links are accessible
3. Generate delivery package (config + source list + coverage report)
4. If auto-create enabled: create NotebookLM notebook and add sources
5. Log the operation

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Topic Coverage | Required topics covered / total required | > 90% |
| Source Relevance | Average relevance score of included sources | > 0.75 |
| Source Currency | Sources with latest version included | 100% |
| Format Compatibility | Sources in NotebookLM-compatible format | 100% |
| Duplicate Prevention | No redundant document versions | 0 duplicates |
| Size Compliance | Total word count within limits | < 500K per source |
| Source Count | Sources per notebook | 15-50 |
| Access Compliance | Only authorized documents included | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `agent-doc-control` | Critical Input | Provides document registry and repository structure |
| `orchestrate-or-agents` | Upstream | May request notebook creation as part of project onboarding |
| `agent-maintenance` | Consumer/Input | Primary consumer for maintenance notebooks; provides topic checklist |
| `agent-operations` | Consumer/Input | Consumer for operations notebooks |
| `agent-hse` | Consumer/Input | Consumer for HSE notebooks |
| `agent-hr` | Consumer/Input | Consumer for HR/training notebooks |
| `build-second-brain` | Sibling | Complementary skill for personal knowledge management |

## Templates & References

**Notebook Naming Convention:**
```
OR - {Workstream} - {Project Name}
OR - {Cross-cutting Topic} - {Project Name}

Examples:
  OR - Maintenance Readiness - Lithium Plant
  OR - HSE & Process Safety - Copper Concentrator
  OR - Cross-cutting - Regulatory Compliance - Lithium Plant
```

**Standard Notebooks per OR Project:**
```yaml
standard_notebooks:
  - topic: "Operations Readiness"
    subtopics: ["Operating Model", "SOPs", "Shift Structure", "Commissioning"]
  - topic: "Maintenance Readiness"
    subtopics: ["Asset Register", "RCM", "PM Plans", "Spare Parts", "CMMS"]
  - topic: "HSE & Process Safety"
    subtopics: ["HAZOP", "Risk Assessment", "Emergency Response", "Permits"]
  - topic: "People & Organization"
    subtopics: ["Org Design", "Staffing", "Training", "Competency"]
  - topic: "Project Context"
    subtopics: ["Project Overview", "Design Basis", "Process Description", "Schedule"]
  - topic: "Contracts & Procurement"
    subtopics: ["O&M Contracts", "Spare Parts Procurement", "Vendor Management"]
  - topic: "Regulatory & Legal"
    subtopics: ["Permits", "Environmental", "Labor Law", "Compliance"]
```

## Examples

**Example 1: Create New Maintenance Notebook**
```
Command: notebooklm-context-builder create --topic "Maintenance Readiness" --scope "Lithium Plant"

Process:
  1. Load maintenance topic checklist (10 required, 4 desired subtopics)
  2. Query doc-control for Lithium Plant maintenance documents -> 67 candidates
  3. Score and filter -> 34 documents above 0.6 threshold
  4. Curate to 28 sources covering 9/10 required topics
  5. Gap identified: "Condition Monitoring" - no source document exists
  6. Prepare sources: 25 Google Docs, 2 PDFs, 1 Google Slides
  7. Generate config, coverage report

Output:
  - Notebook config: "OR - Maintenance Readiness - Lithium Plant"
  - 28 sources curated, 580K total words
  - Coverage: 90% required, 50% desired
  - Action: Commission "Condition Monitoring Strategy" document
```

**Example 2: Update Existing Notebook After Document Revision**
```
Command: notebooklm-context-builder update --notebook "NB-MAINT-001" --add-sources

Process:
  1. Load existing notebook config (28 sources)
  2. Check document registry for new/revised documents since last update
  3. Found: "PM Plans Area 500 v2.0" (new), "Asset Register v4" (revision)
  4. Add PM Plans Area 500 v2.0 (new source, relevance 0.92)
  5. Replace Asset Register v3 with v4 (updated source)
  6. Re-validate coverage: now 10/10 required (Condition Monitoring doc added)
  7. Update notebook config, generate delta report

Output:
  - 2 sources updated, 1 added
  - Coverage improved: 90% -> 100% required topics
  - Notebook source count: 29
```

**Example 3: Validate Notebook Quality**
```
Command: notebooklm-context-builder validate --notebook "NB-MAINT-001"

Output:
  Validation Results for "OR - Maintenance Readiness - Lithium Plant":

  Source Accessibility: 28/29 accessible
    FAIL: "Lubrication Schedule v1.pdf" - file not found (moved or deleted)

  Source Currency: 27/29 current
    WARNING: "Spare Parts Philosophy" - v1.0 in notebook, v1.1 available
    WARNING: "SAP-PM Config Spec" - last revised 14 months ago, may be outdated

  Format Compliance: 29/29 compatible

  Topic Coverage: 100% required, 75% desired

  Recommendations:
    1. Replace missing Lubrication Schedule source
    2. Update Spare Parts Philosophy to v1.1
    3. Review SAP-PM Config Spec for currency
```
