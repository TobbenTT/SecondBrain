# Generate Daily Nudge

## Skill ID: G-003
## Version: 1.0.0
## Category: G. Knowledge & Memory Management
## Priority: High

## Purpose

Generate daily Slack nudges that synthesize the state of all agents, pending tasks, blockers, priorities, and relevant knowledge insights into an actionable daily briefing for each team member. Based on Nate B Jones' Building Block 7 (Tap on the Shoulder), this skill proactively surfaces the information people need before they realize they need it. Instead of team members checking multiple dashboards, reading through Slack channels, and querying agents for status, the daily nudge brings a personalized, prioritized briefing to them every morning. It transforms passive knowledge management into active knowledge delivery.

## Intent & Specification

**Problem:** In a multi-agent OR system, information is distributed across agents, projects, knowledge bases, task lists, and communication channels. Team members start their day without a clear picture of: what their agents accomplished overnight, what tasks are blocked and why, what priorities have shifted, what knowledge was captured that is relevant to their work, and what deadlines are approaching. They spend the first 30-60 minutes of each day piecing together this picture manually -- checking Slack, reviewing task boards, reading agent status updates, and asking colleagues for updates. This is wasted time that could be eliminated by a proactive intelligence briefing.

**Success Criteria:**
- Daily nudge delivered to each team member by 08:00 local time
- Nudge contains: top 3 priorities, blocked items with root cause, agent status summary, relevant new knowledge, approaching deadlines
- Nudge is personalized per team member (only relevant information for their role and projects)
- Total reading time is under 3 minutes (concise, scannable format)
- Nudge is actionable: each item has a clear next action or is informational only
- Team members report the nudge saves them >20 minutes of morning catch-up
- Nudge accuracy: >90% of items are genuinely relevant to the recipient
- Blockers surfaced in nudge are resolved 40% faster than those discovered manually

**Constraints:**
- Must aggregate data from multiple sources (Shared Task List, agent state files, knowledge base, calendar, Slack)
- Must respect information boundaries (project-specific data only to project team members)
- Must be concise (3-minute read maximum, not an information dump)
- Must be Slack-formatted (blocks, sections, emoji for visual scanning)
- Must handle timezone differences for distributed teams
- Must not overwhelm recipients with low-value notifications
- Must gracefully handle missing data (if an agent is offline, note it rather than omit)
- Must be customizable per user (notification preferences, topics of interest)

## Trigger / Invocation

**Manual Triggers:**
- `generate-daily-nudge now --user [name]` (generate nudge on demand for a specific user)
- `generate-daily-nudge preview --user [name]` (preview without sending)
- `generate-daily-nudge configure --user [name]` (configure user preferences)
- `generate-daily-nudge report --period [week|month]` (nudge effectiveness report)

**Automatic Triggers:**
- Scheduled: Every weekday at configured time (default 07:30 local time per user timezone)
- Event-driven: Critical blocker detected -> immediate nudge to affected team members
- Event-driven: Deadline within 24 hours -> urgent nudge to task owner
- Event-driven: Agent failure -> immediate nudge to responsible team member

**Configurable Triggers:**
- Monday nudge: includes weekly overview and priorities
- Friday nudge: includes weekly summary and next week preview
- Custom schedules per user preference

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| User Profile | Configuration | Yes | Team member name, role, projects, preferences |
| Shared Task List | System | Yes | Current tasks, statuses, assignments, deadlines |
| Agent State Files | System | Yes | Current state of all agents (status, progress, blockers) |
| Knowledge Base (new items) | Second Brain | Yes | Recently captured knowledge artifacts |
| Calendar | Integration | No | Upcoming meetings, deadlines, milestones |
| Slack Activity | Integration | No | Important messages, unresolved threads |
| Quality Metrics | validate-output-quality | No | Recent validation results |
| Previous Nudge | System | No | Yesterday's nudge (for continuity tracking) |
| User Preferences | Configuration | No | Notification preferences, topics of interest, delivery time |

**User Profile Configuration:**
```yaml
user_profile:
  name: "Carlos Mendez"
  role: "OR Lead"
  timezone: "America/Santiago"
  delivery_time: "07:30"
  projects:
    - name: "Lithium Plant"
      role: "Project Lead"
      agents: ["agent-operations", "agent-maintenance", "agent-hse", "agent-hr"]
    - name: "Copper Mine OR"
      role: "Advisor"
      agents: ["agent-operations"]
  preferences:
    include_knowledge_insights: true
    include_quality_metrics: true
    include_agent_status: true
    max_items_per_section: 5
    priority_threshold: "medium"  # only show medium and above
    language: "en"
    format: "slack_blocks"
```

## Output Specification

**Primary Output: Daily Nudge (Slack Message)**

```markdown
:sunrise: **Good morning, {Name}!** Here is your daily briefing for {Date}.

---

:dart: **TOP PRIORITIES TODAY**
1. :red_circle: **{Priority 1}** — {brief description} — *Action: {what to do}*
2. :orange_circle: **{Priority 2}** — {brief description} — *Action: {what to do}*
3. :yellow_circle: **{Priority 3}** — {brief description} — *Action: {what to do}*

---

:no_entry: **BLOCKERS** ({N} items)
- :rotating_light: **{Blocker 1}:** {description} — *Blocked since: {date}* — *Root cause: {cause}* — *Suggested action: {action}*
- :warning: **{Blocker 2}:** {description} — *Blocked since: {date}* — *Root cause: {cause}*

---

:robot_face: **AGENT STATUS**
| Agent | Status | Last Action | Next Task |
|-------|--------|-------------|-----------|
| {agent-name} | :white_check_mark: Active | {last completed} | {next task} |
| {agent-name} | :hourglass: Waiting | {waiting for} | {blocked by} |
| {agent-name} | :sleeping: Idle | {last active} | No tasks assigned |

---

:calendar: **DEADLINES THIS WEEK**
- :red_circle: **{deadline_item}** — Due: {date} ({N} days) — Status: {status}
- :orange_circle: **{deadline_item}** — Due: {date} ({N} days) — Status: {status}

---

:bulb: **KNOWLEDGE INSIGHTS** (new since yesterday)
- :new: **{KC-NNNN}: {title}** — {1-line summary} — *Relevant to: {project/task}*
- :new: **{KC-NNNN}: {title}** — {1-line summary}

---

:chart_with_upwards_trend: **QUALITY SNAPSHOT**
- Deliverables validated: {N} | Passed: {N} | Conditional: {N} | Failed: {N}
- Average quality score: {X}%
- {Notable quality item if any}

---

:mega: **HEADS UP**
- {Any important announcements, schedule changes, or notable events}

---
_Generated at {time} | Reply to this message to give feedback | `/nudge configure` to customize_
```

**Compact Nudge (for low-activity days):**
```markdown
:sunrise: **{Name}** — {Date} Briefing

:dart: **Priorities:** {Priority 1} | {Priority 2} | {Priority 3}
:no_entry: **Blockers:** {None / N items — top: {blocker summary}}
:robot_face: **Agents:** All active | {N} tasks in progress | {N} completed yesterday
:calendar: **Deadlines:** {None this week / Next: {item} in {N} days}
:bulb: **New Knowledge:** {N} artifacts captured | Top: {title}

_All clear today. Focus on your priorities._
```

**Critical Alert Nudge (event-driven, immediate):**
```markdown
:rotating_light: **URGENT: {Alert Title}**

**What:** {Description of the issue}
**Impact:** {What is affected and how}
**Root Cause:** {Known or suspected cause}
**Recommended Action:** {Immediate steps}
**Who:** {Who needs to act}

_This alert was generated because {trigger reason}. Reply to acknowledge._
```

## Methodology & Standards

- **The Tap on the Shoulder (Jones Building Block 7):** The daily nudge simulates a knowledgeable colleague who taps you on the shoulder each morning and says: "Here is what you need to know today." It is proactive (pushes information to you), personalized (only what matters to you), contextual (connects information to your current work), and actionable (tells you what to do, not just what happened). The nudge is not a report -- it is a briefing.

- **Information Hierarchy:**
  1. **Blockers first:** Anything preventing progress gets top visibility. Blockers that have existed for >2 days get escalated formatting.
  2. **Priorities second:** The three most important things to focus on today, derived from task deadlines, project milestones, and blocker resolution needs.
  3. **Status third:** Agent and task status for situational awareness. Condensed to a scannable table.
  4. **Knowledge fourth:** New insights that are relevant to the recipient's current work. Only the most relevant items, not everything captured.
  5. **Heads up last:** Non-urgent but notable information (schedule changes, announcements, FYI items).

- **Personalization Rules:**
  - Each team member receives only information relevant to their role and projects
  - Project-specific data is shown only to team members assigned to that project
  - Agent status is shown only for agents the team member works with
  - Knowledge insights are filtered by the recipient's domain interests
  - Priority ranking considers the recipient's specific responsibilities

- **Conciseness Rules:**
  - Total nudge: maximum 500 words (3-minute read)
  - Each section: maximum 5 items (prioritized by importance)
  - Each item: maximum 2 lines (headline + action)
  - If more items exist: "and {N} more items. See full dashboard."
  - Use emoji and formatting for visual scanning (not decoration)

- **Continuity Tracking:**
  - Compare today's nudge with yesterday's nudge
  - Highlight items that changed status (resolved blockers, new blockers, completed tasks)
  - Track multi-day blockers with age indicator ("blocked for 3 days")
  - Note items carried over from previous nudge ("still pending: {item}")

- **Nudge Effectiveness Measurement:**
  - Track: open rate, time-to-read, action taken within 1 hour
  - Survey: monthly "Is the nudge useful?" pulse (1-5 scale)
  - Metric: blocker resolution time with nudge vs. without
  - Metric: morning catch-up time before and after nudge adoption

## Step-by-Step Execution

### Step 1: Gather Data Sources
1. Load user profile and preferences for the target recipient
2. Query Shared Task List:
   - Tasks assigned to the user or their agents
   - Tasks with approaching deadlines
   - Tasks that are blocked
   - Tasks completed since last nudge
3. Query agent state files:
   - Current status of each agent relevant to the user
   - Last completed action per agent
   - Current active task per agent
   - Blockers reported by agents
4. Query knowledge base (via curate-knowledge-flow):
   - New artifacts captured since last nudge
   - Filter for relevance to user's projects and interests
   - Limit to top 3-5 most relevant
5. Query calendar (if integrated):
   - Meetings today
   - Deadlines this week
   - Milestones approaching
6. Query quality metrics (if configured):
   - Recent validation results for user's deliverables
   - Notable quality events (failures, exceptional passes)
7. Load previous nudge for continuity tracking

### Step 2: Identify Blockers
1. From Shared Task List: tasks with status "Blocked"
2. From agent state files: agents reporting "waiting" status
3. For each blocker:
   - Determine root cause (what is blocking and why)
   - Calculate blocker age (days since blocked)
   - Identify resolution path (who can unblock, what action needed)
   - Assess impact (what downstream tasks are affected)
4. Rank blockers by: impact severity, blocker age, resolution urgency
5. Flag critical blockers (>3 days, high impact) for escalation formatting

### Step 3: Determine Top Priorities
1. Collect candidate priorities from:
   - Tasks with deadlines within 3 days
   - Blocker resolution actions (unblocking others)
   - High-priority tasks in Shared Task List
   - Items carried over from previous nudge as unresolved
   - Orchestrator-assigned focus items
2. Rank by: deadline urgency, impact on others, strategic importance
3. Select top 3 priorities
4. For each priority: formulate a clear action statement ("Review and approve X," "Unblock Y by providing Z")

### Step 4: Summarize Agent Status
1. For each agent relevant to the user:
   - Current status: Active (working on task), Waiting (blocked), Idle (no task), Error (failed)
   - Last completed action with timestamp
   - Current task in progress
   - Next queued task
2. Highlight anomalies:
   - Agent idle for >24 hours (may need task assignment)
   - Agent in error state (needs intervention)
   - Agent waiting for >48 hours (blocker may need escalation)
3. Format as scannable table with status emoji

### Step 5: Curate Knowledge Insights
1. Query knowledge base for artifacts captured since last nudge
2. Filter for relevance:
   - Same project as user's active projects
   - Same domain as user's role focus
   - Tagged with user's interest topics
3. Rank by relevance and source confidence
4. Select top 3-5 items
5. For each: generate one-line summary and relevance explanation

### Step 6: Compile Deadlines
1. From Shared Task List: tasks with deadlines within 7 days
2. From calendar: milestones and due dates
3. For each deadline:
   - Calculate days remaining
   - Assess current status (on track, at risk, overdue)
   - Color-code by urgency (red: <=2 days, orange: 3-5 days, yellow: 6-7 days)
4. Sort by date ascending

### Step 7: Generate Quality Snapshot (if configured)
1. Pull validation results from last 24 hours
2. Summarize: total validated, passed, conditional, failed
3. Calculate average quality score
4. Highlight any notable quality events:
   - First-time pass on a difficult deliverable
   - Repeated failure on a specific deliverable type
   - Quality trend (improving or degrading)

### Step 8: Add Heads Up Items
1. Check for system announcements or schedule changes
2. Check for upcoming events relevant to the user
3. Check for notable changes in project scope or timeline
4. Check for new team members, tool changes, or process updates
5. Include only items that are genuinely noteworthy (not noise)

### Step 9: Apply Continuity Tracking
1. Compare with yesterday's nudge:
   - Which blockers are resolved? (celebrate with checkmark)
   - Which blockers are ongoing? (note age increase)
   - Which priorities were completed? (remove and replace)
   - Which priorities are carried over? (mark as "still pending")
2. Note new items that appeared since yesterday
3. Track nudge-over-nudge trends (are things improving or deteriorating?)

### Step 10: Format and Deliver
1. Determine nudge format:
   - Full nudge: standard day with multiple items across sections
   - Compact nudge: low-activity day with minimal items
   - Critical alert: immediate event requiring attention
2. Apply Slack formatting:
   - Use blocks and sections for visual structure
   - Use emoji for status indicators (not decoration)
   - Use bold for scannable headlines
   - Use italics for action items
3. Check conciseness: total word count under 500 words
4. Deliver via Slack direct message at configured time
5. Log delivery for analytics

### Step 11: Handle Feedback and Adaptation
1. Monitor user reactions to the nudge (emoji reactions, replies)
2. Track which nudge sections users engage with
3. If user replies with feedback: log and adjust preferences
4. Monthly: analyze nudge effectiveness metrics
5. Quarterly: adjust nudge content and format based on data

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Delivery Timeliness | Nudge delivered by configured time | > 99% |
| Relevance Accuracy | Items genuinely relevant to recipient | > 90% |
| Reading Time | Time to read the complete nudge | < 3 minutes |
| Blocker Detection | Blockers surfaced in nudge vs. total blockers | > 95% |
| Actionability | Items with clear next action | > 80% |
| User Satisfaction | Monthly pulse score (1-5) | > 4.0 |
| Time Savings | Morning catch-up time reduction | > 20 minutes |
| Blocker Resolution | Time to resolve blockers surfaced in nudge | 40% faster |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `orchestrate-or-agents` | Upstream | Provides Shared Task List and agent status data |
| `capture-knowledge-artifact` | Upstream | Provides recently captured knowledge for insights |
| `curate-knowledge-flow` | Upstream | Provides filtered, relevant knowledge for the recipient |
| `validate-output-quality` | Upstream | Provides quality metrics and validation results |
| `sync-memory-agents` | Upstream | Provides consolidated agent state for status summary |
| All `agent-*` | Upstream | Agent state files provide status, progress, blockers |
| `design-quality-gate` | Upstream | Gate pass/fail rates included in quality snapshot |
| `build-second-brain` | Upstream | Knowledge base provides new artifacts for insights |

## Templates & References

**Nudge Configuration Template:**
```yaml
nudge_config:
  user: "{name}"
  delivery:
    time: "07:30"
    timezone: "America/Santiago"
    channel: "direct_message"
    format: "slack_blocks"
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  content:
    priorities: {max: 3, threshold: "medium"}
    blockers: {max: 5, include_resolved: true}
    agent_status: {show: true, agents: "project_relevant"}
    deadlines: {horizon_days: 7, max: 5}
    knowledge: {max: 3, relevance_threshold: 0.7}
    quality: {show: true, period: "24h"}
    heads_up: {max: 3}
  special:
    monday: {include_weekly_overview: true}
    friday: {include_weekly_summary: true, include_next_week_preview: true}
```

**Slack Block Template (for formatting):**
```json
{
  "blocks": [
    {"type": "header", "text": {"type": "plain_text", "text": ":sunrise: Good morning, {Name}!"}},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*TOP PRIORITIES TODAY*"}},
    {"type": "section", "text": {"type": "mrkdwn", "text": "1. :red_circle: *{Priority}* — {action}"}},
    {"type": "divider"},
    {"type": "context", "elements": [{"type": "mrkdwn", "text": "Generated at {time} | /nudge configure"}]}
  ]
}
```

## Examples

**Example 1: Standard Weekday Nudge**
```
Trigger: Scheduled at 07:30 for Carlos Mendez (OR Lead, Lithium Plant)

:sunrise: Good morning, Carlos! Here is your daily briefing for Tuesday, June 3, 2025.

:dart: TOP PRIORITIES TODAY
1. :red_circle: Review Maintenance Strategy Rev1 — Quality validation passed (93%).
   Needs your approval before client submission. Action: Review and approve by EOD.
2. :orange_circle: Unblock OPEX Model — agent-finance waiting for energy cost
   assumptions from agent-operations. Action: Confirm energy rates with operations team.
3. :yellow_circle: Prepare Steering Committee presentation — Meeting Thursday.
   Agent-communications has draft ready. Action: Review slides by tomorrow noon.

:no_entry: BLOCKERS (2 items)
- :rotating_light: OPEX Model energy inputs — Blocked 3 days. Root cause: energy supplier
  has not confirmed tariff schedule. Suggested action: escalate to procurement.
- :warning: SOP batch for Area 200 — Blocked 1 day. Root cause: P&ID revision pending
  from engineering. Suggested action: check with engineering lead on timeline.

:robot_face: AGENT STATUS
| Agent | Status | Last Action | Next Task |
|-------|--------|-------------|-----------|
| agent-operations | :white_check_mark: Active | Completed shift schedule Rev2 | SOP Area 100-03 |
| agent-maintenance | :white_check_mark: Active | Completed Maint Strategy Rev1 | Spare parts list |
| agent-hse | :hourglass: Waiting | Completed risk assessment | Waiting: SOP review queue |
| agent-hr | :white_check_mark: Active | Updated org chart | Training plan Section 3 |

:calendar: DEADLINES THIS WEEK
- :red_circle: Maintenance Strategy client submission — Due: Thu Jun 5 (2 days)
- :orange_circle: OPEX Model draft — Due: Fri Jun 6 (3 days)

:bulb: KNOWLEDGE INSIGHTS
- :new: KC-0250: PdM ROI benchmarks for lithium pumps — Relevant to maintenance strategy
- :new: KC-0251: Chilean labor law update on shift patterns — Relevant to staffing plan

:chart_with_upwards_trend: QUALITY SNAPSHOT
- Validated: 4 | Passed: 3 | Conditional: 1 | Failed: 0
- Average score: 91.2%

All clear on other fronts. Focus on unblocking the OPEX model today.
```

**Example 2: Compact Low-Activity Day**
```
Trigger: Scheduled at 07:30, minimal overnight activity

:sunrise: Carlos — Wednesday, June 4, 2025

:dart: Priorities: Steering Committee prep | OPEX model follow-up | SOP review
:no_entry: Blockers: 1 remaining (OPEX energy inputs — day 4, escalated to procurement)
:robot_face: Agents: 4 active | 6 tasks in progress | 3 completed yesterday
:calendar: Deadlines: Maint Strategy submission tomorrow
:bulb: New Knowledge: 1 artifact — KC-0252: Commissioning lessons from similar plant

All clear today. Focus on your priorities.
```

**Example 3: Critical Alert Nudge**
```
Trigger: Event-driven — agent-maintenance reports error state

:rotating_light: URGENT: agent-maintenance has entered error state

What: agent-maintenance failed during spare parts list generation with context window
overflow. Last valid checkpoint was at item 847 of 1,200.
Impact: Spare parts deliverable (due Friday) is blocked. Downstream: procurement
RFQ cannot start until spare parts list is complete.
Root Cause: Input equipment list exceeded context window capacity.
Recommended Action: Split spare parts task into 3 sub-tasks (400 items each)
and restart agent-maintenance.
Who: Carlos (as agent owner) — /restart agent-maintenance --task split

This alert was generated because agent-maintenance entered error state during
a priority deliverable. Reply to acknowledge.
```
