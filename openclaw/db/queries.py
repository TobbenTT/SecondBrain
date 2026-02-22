"""
Named SQL queries for OpenClaw agents.
All database interactions go through these functions.

The ideas table columns used by OpenClaw:
  - execution_status: Pipeline state (NULL, queued_software, queued_consulting,
                      in_progress, developed, reviewing, completed, failed, blocked)
  - execution_output: Generated document/code (markdown)
  - execution_error:  Error details if failed
  - executed_at:      Timestamp of last execution action
  - executed_by:      Agent name (e.g. 'PM', 'DEV', 'QA', 'CONSULTING-staffing')
  - code_stage:       CODE flow stage (captured, organized, distilled, expressed)
  - suggested_agent:  AI-suggested agent (staffing, training, finance, compliance)
  - suggested_skills: JSON array of skill paths
"""


# ─── PM Agent Queries ────────────────────────────────────────────────────────

def get_routable_ideas(db):
    """Ideas organized by dashboard, not yet routed by PM.
    PM picks these up and sets execution_status to queued_software or queued_consulting.
    """
    return db.execute("""
        SELECT id, text, ai_type, ai_category, suggested_agent, suggested_skills,
               execution_status, code_stage, priority, assigned_to
        FROM ideas
        WHERE code_stage = 'organized'
          AND (execution_status IS NULL OR execution_status = '')
        ORDER BY
            CASE priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
            created_at ASC
    """).fetchall()


# ─── Pipeline Queries ────────────────────────────────────────────────────────

def get_ideas_in_status(db, execution_status):
    """Get ideas in a specific execution state."""
    return db.execute("""
        SELECT id, text, ai_type, ai_category, suggested_agent, suggested_skills,
               execution_status, execution_output, execution_error, code_stage,
               priority, assigned_to, ai_summary, related_area_id
        FROM ideas
        WHERE execution_status = ?
        ORDER BY
            CASE priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
            created_at ASC
    """, [execution_status]).fetchall()


def update_execution_status(db, idea_id, status, output=None, error=None, agent_name=None):
    """Update idea with execution results.

    When status='completed', also moves code_stage to 'expressed'.
    When status='reviewing', moves code_stage to 'distilled'.
    The dashboard reads these same columns.
    """
    # Determine code_stage update
    code_stage_sql = "code_stage"
    if status == 'completed':
        code_stage_sql = "'expressed'"
    elif status in ('reviewing', 'developed', 'built'):
        code_stage_sql = "'distilled'"

    # When completed, also move to para_type='project' and is_project=1 (Proyectos GTD section)
    para_type_sql = "para_type"
    is_project_sql = "is_project"
    if status == 'completed':
        para_type_sql = "'project'"
        is_project_sql = "1"

    db.execute(f"""
        UPDATE ideas SET
            execution_status = ?,
            execution_output = COALESCE(?, execution_output),
            execution_error = ?,
            executed_at = datetime('now'),
            executed_by = ?,
            code_stage = {code_stage_sql},
            para_type = {para_type_sql},
            is_project = {is_project_sql}
        WHERE id = ?
    """, [status, output, error, agent_name, idea_id])
    db.commit()


def count_previous_failures(db, idea_id):
    """Count how many times an idea has been rejected (for blocking logic)."""
    row = db.execute("""
        SELECT execution_error FROM ideas WHERE id = ?
    """, [idea_id]).fetchone()
    if not row or not row['execution_error']:
        return 0
    # Count occurrences of RECHAZADO in error history
    return row['execution_error'].count('RECHAZADO') + row['execution_error'].count('REJECTED')


# ─── Context & Reference Queries ─────────────────────────────────────────────

def get_context_string(db):
    """Load context items as a formatted string for AI prompts."""
    items = db.execute(
        "SELECT key, content FROM context_items ORDER BY last_updated DESC LIMIT 20"
    ).fetchall()
    if not items:
        return "No hay contexto almacenado."
    return "\n".join(f"- {r['key']}: {r['content']}" for r in items)


def get_users(db):
    """Get team members for assignment context."""
    return db.execute(
        "SELECT username, role, department, expertise FROM users"
    ).fetchall()


def get_areas(db):
    """Get active responsibility areas."""
    return db.execute(
        "SELECT id, name, description FROM areas WHERE status = 'active'"
    ).fetchall()


def save_context_item(db, key, content, category='resource'):
    """Save a generated output as a context/memory item."""
    existing = db.execute(
        "SELECT id FROM context_items WHERE key = ?", [key]
    ).fetchone()
    if existing:
        db.execute("""
            UPDATE context_items SET content = ?, category = ?, last_updated = datetime('now')
            WHERE key = ?
        """, [content, category, key])
    else:
        db.execute("""
            INSERT INTO context_items (key, content, category, para_type, code_stage, last_updated)
            VALUES (?, ?, ?, 'resource', 'expressed', datetime('now'))
        """, [key, content, category])
    db.commit()


# ─── Retry Queries ──────────────────────────────────────────────────────────

def get_retryable_failed_ideas(db, max_retries=2):
    """Get failed ideas that can be retried (failed less than max_retries times).
    PM uses this to re-queue ideas that failed due to transient AI issues.
    """
    rows = db.execute("""
        SELECT id, text, ai_type, ai_category, suggested_agent, suggested_skills,
               execution_status, execution_error, code_stage, priority, assigned_to
        FROM ideas
        WHERE execution_status = 'failed'
          AND code_stage != 'expressed'
        ORDER BY executed_at ASC
    """).fetchall()

    retryable = []
    for row in rows:
        error = row['execution_error'] or ''
        # Count retry markers
        retry_count = error.count('[RETRY]')
        if retry_count < max_retries:
            retryable.append(row)
    return retryable


# ─── Stats Queries ───────────────────────────────────────────────────────────

def get_pipeline_stats(db):
    """Get pipeline status counts for the status monitor."""
    return db.execute("""
        SELECT
            SUM(CASE WHEN execution_status IS NULL AND code_stage = 'organized' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN execution_status LIKE 'queued_%' THEN 1 ELSE 0 END) as queued,
            SUM(CASE WHEN execution_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN execution_status = 'developed' THEN 1 ELSE 0 END) as building,
            SUM(CASE WHEN execution_status IN ('built', 'reviewing') THEN 1 ELSE 0 END) as in_review,
            SUM(CASE WHEN execution_status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN execution_status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN execution_status = 'blocked' THEN 1 ELSE 0 END) as blocked
        FROM ideas
    """).fetchone()
