# Sync Airtable-Jira

## Skill ID: D-001
## Version: 1.0.0
## Category: D. Integration & Workflow
## Priority: High

## Purpose

Synchronize CRM opportunities tracked in Airtable with corresponding Jira tasks to ensure that every commercial opportunity with OR implications is reflected in the project execution backlog. This eliminates manual data entry, reduces information lag between commercial and delivery teams, and ensures OR readiness activities start as soon as opportunities reach qualifying stages.

## Intent & Specification

**Problem:** OR opportunities tracked in Airtable CRM are disconnected from Jira project management. Teams manually create Jira tasks when opportunities advance, leading to delays, missed items, and inconsistent data between systems.

**Success Criteria:**
- Every qualifying Airtable opportunity has a corresponding Jira epic/task within 5 minutes of stage change
- Bidirectional sync maintains data consistency (status, dates, key fields)
- No duplicate Jira issues created for the same opportunity
- Sync errors are logged and surfaced for human resolution
- Audit trail of all sync operations is maintained

**Constraints:**
- Must use Airtable API and Jira REST API (or Atlassian Connect)
- Must respect API rate limits for both platforms
- Must handle network failures gracefully with retry logic
- Must not overwrite manual Jira modifications without conflict resolution
- Must comply with data access policies (only sync non-sensitive fields)

## Trigger / Invocation

**Automatic Triggers:**
- Airtable record enters qualifying stage (e.g., "Proposal Sent", "Qualified", "Won")
- Airtable record field is modified (key fields: status, dates, scope, value)
- Jira issue status changes (feedback loop to Airtable)
- Scheduled full reconciliation (daily at 06:00 UTC)

**Manual Triggers:**
- Agent command: `sync-airtable-jira --opportunity [ID]`
- Agent command: `sync-airtable-jira --full-reconciliation`
- Agent command: `sync-airtable-jira --dry-run` (preview without changes)

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Airtable Base ID | Configuration | Yes | The Airtable base containing the CRM |
| Airtable Table Name | Configuration | Yes | Table with opportunities (e.g., "Opportunities") |
| Airtable API Key | Secrets Manager | Yes | Authentication token |
| Jira Project Key | Configuration | Yes | Target Jira project (e.g., "OR") |
| Jira API Token | Secrets Manager | Yes | Authentication token |
| Jira Domain | Configuration | Yes | e.g., "vscteam.atlassian.net" |
| Field Mapping | Configuration | Yes | JSON mapping of Airtable fields to Jira fields |
| Stage Filter | Configuration | Yes | Which Airtable stages trigger sync |
| Opportunity Record | Airtable webhook/poll | Conditional | Specific record data when triggered by change |

**Field Mapping Example:**
```json
{
  "airtable_to_jira": {
    "Opportunity Name": "summary",
    "Description": "description",
    "Client": "customfield_10001",
    "Target Date": "duedate",
    "OR Stage": "customfield_10002",
    "Value (USD)": "customfield_10003",
    "Owner": "assignee",
    "Priority": "priority"
  },
  "jira_to_airtable": {
    "status": "Jira Status",
    "key": "Jira Key",
    "updated": "Last Jira Update"
  }
}
```

## Output Specification

**Primary Outputs:**
1. **Jira Issue (Created/Updated):** Epic or Task in Jira with all mapped fields populated
2. **Airtable Record Update:** Jira Key and status written back to Airtable record
3. **Sync Log Entry:** JSON record of the sync operation

**Sync Log Schema:**
```json
{
  "sync_id": "uuid",
  "timestamp": "ISO-8601",
  "direction": "airtable_to_jira | jira_to_airtable | bidirectional",
  "airtable_record_id": "recXXXXXXXXXX",
  "jira_issue_key": "OR-123",
  "operation": "create | update | skip | error",
  "fields_synced": ["field1", "field2"],
  "conflicts": [],
  "error": null
}
```

**Error Outputs:**
- Conflict report when both sides modified the same field
- Missing field report when required mappings cannot be resolved
- Rate limit warning with retry schedule

## Methodology & Standards

- **Idempotency:** Every sync operation must be idempotent. Running the same sync twice produces the same result.
- **Conflict Resolution:** Last-write-wins with human override. Conflicts are flagged, not silently resolved.
- **Data Integrity:** Use Airtable record ID as the canonical link. Store in Jira custom field and Airtable linked field.
- **Error Handling:** Exponential backoff for API failures. Max 3 retries. Alert after final failure.
- **Logging:** All operations logged to structured log (JSON). Retained for 90 days.
- **Security:** API keys stored in secrets manager, never in code or logs. All API calls over HTTPS.

## Step-by-Step Execution

### Step 1: Initialize Configuration
1. Load field mapping configuration
2. Validate API credentials for both Airtable and Jira
3. Test connectivity to both services
4. Load last sync state (checkpoint)

### Step 2: Fetch Source Data
1. Query Airtable for records matching stage filter
2. For each record, check if a Jira Key already exists in the linked field
3. Separate records into: new (no Jira Key), existing (has Jira Key), archived

### Step 3: Process New Records
1. For each new record:
   a. Map Airtable fields to Jira fields using field mapping
   b. Create Jira issue (Epic for large opportunities, Task for smaller)
   c. Write Jira Key back to Airtable record
   d. Log sync operation

### Step 4: Process Existing Records
1. For each existing record:
   a. Fetch current Jira issue state
   b. Compare Airtable fields with Jira fields
   c. If Airtable is newer: update Jira fields
   d. If Jira is newer: update Airtable fields
   e. If conflict: log conflict, flag for human review
   f. Log sync operation

### Step 5: Reverse Sync (Jira to Airtable)
1. Query Jira for issues updated since last sync checkpoint
2. For each issue with an Airtable record link:
   a. Update Airtable record with Jira status and dates
   b. Log sync operation

### Step 6: Reconciliation & Reporting
1. Compare total records in scope vs. synced records
2. Identify orphaned Jira issues (no Airtable match)
3. Identify Airtable records missing Jira links
4. Generate sync summary report
5. Update checkpoint timestamp

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Sync Latency | Time from Airtable change to Jira update | < 5 minutes |
| Data Accuracy | Fields correctly mapped and transferred | 100% |
| Duplicate Prevention | Zero duplicate Jira issues per opportunity | 0 duplicates |
| Error Rate | Failed sync operations / total operations | < 1% |
| Conflict Detection | Conflicts identified and flagged | 100% detected |
| Uptime | Sync service availability | 99.5% |
| Audit Completeness | Operations with full log entries | 100% |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `agent-or-pmo` | Consumer | Uses synced data for portfolio dashboard and gate reviews |
| `agent-project` | Consumer | Receives new Jira epics for WBS integration |
| `agent-procurement` | Consumer | Triggered when opportunity requires RFP preparation |
| `agent-doc-control` | Consumer | Creates document folders when new opportunity synced |
| `airtable-report-generator` | Downstream | Uses synced data for CRM reporting |
| `orchestrate-or-agents` | Upstream | May invoke this skill as part of onboarding workflow |

## Templates & References

**Jira Issue Template (Epic):**
```
Summary: [OR] {Opportunity Name} - {Client}
Description:
  OR Opportunity synced from Airtable CRM.

  Client: {Client}
  Value: {Value}
  Target Start: {Target Date}
  OR Stage: {OR Stage}

  ---
  Airtable Record: {Record URL}
  Synced: {Timestamp}

Labels: or-opportunity, crm-synced
Epic Link: (auto-generated)
```

**Configuration File Template:**
```yaml
sync_config:
  airtable:
    base_id: "appXXXXXXXXXXXX"
    table: "Opportunities"
    view: "OR Qualifying"
    stage_filter:
      - "Proposal Sent"
      - "Qualified"
      - "Won"
  jira:
    domain: "vscteam.atlassian.net"
    project_key: "OR"
    issue_type_default: "Epic"
    issue_type_small: "Task"
    small_threshold_usd: 50000
  sync:
    interval_minutes: 5
    full_reconciliation_cron: "0 6 * * *"
    retry_max: 3
    retry_backoff_seconds: [30, 120, 600]
```

## Examples

**Example 1: New Opportunity Synced**
```
Input: Airtable record "Mining Project Alpha" moves to "Qualified" stage
Process:
  1. Webhook fires, agent receives record data
  2. No existing Jira Key found
  3. Creates Jira Epic "OR-145: [OR] Mining Project Alpha - Minera XYZ"
  4. Writes "OR-145" back to Airtable "Jira Key" field
  5. Logs: { operation: "create", airtable_record_id: "recABC123", jira_issue_key: "OR-145" }
Output: Jira epic created, Airtable updated, log entry written
```

**Example 2: Status Update Reverse Sync**
```
Input: Jira issue OR-145 status changes from "To Do" to "In Progress"
Process:
  1. Jira webhook fires
  2. Agent looks up Airtable record via Jira Key "OR-145"
  3. Updates Airtable "Jira Status" field to "In Progress"
  4. Logs: { operation: "update", direction: "jira_to_airtable" }
Output: Airtable record reflects current Jira status
```

**Example 3: Conflict Detection**
```
Input: Both Airtable "Target Date" and Jira "Due Date" modified within same sync window
Process:
  1. Agent detects both sides have changes to mapped field
  2. Compares timestamps - cannot determine winner
  3. Flags conflict in sync log
  4. Sends notification to OR-PMO agent
  5. Neither side overwritten
Output: Conflict logged, human review requested
```
