"""Tests for agents/pm.py — PM Router Agent"""
import pytest
from db.connection import set_connection, reset_connection


class TestIsSoftwareTask:
    def test_software_in_ai_category(self, db_with_ideas):
        from agents.pm import _is_software_task
        idea = db_with_ideas.execute(
            "SELECT * FROM ideas WHERE id=2"
        ).fetchone()
        assert _is_software_task(idea) is True

    def test_software_in_ai_type(self, test_db):
        from agents.pm import _is_software_task
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_type, code_stage) "
            "VALUES (100, 'test', 'software', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=100").fetchone()
        assert _is_software_task(idea) is True

    def test_desarrollo_in_category(self, test_db):
        from agents.pm import _is_software_task
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (101, 'test', 'Desarrollo Web', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=101").fetchone()
        assert _is_software_task(idea) is True

    def test_keyword_in_text(self, test_db):
        from agents.pm import _is_software_task
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage) "
            "VALUES (102, 'Crear un script para automatizar deploys', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=102").fetchone()
        assert _is_software_task(idea) is True

    def test_not_software(self, db_with_ideas):
        from agents.pm import _is_software_task
        idea = db_with_ideas.execute(
            "SELECT * FROM ideas WHERE id=3"
        ).fetchone()
        assert _is_software_task(idea) is False


class TestDetectAgentFromCategory:
    def test_finanzas_maps_to_finance(self, test_db):
        from agents.pm import _detect_agent_from_category
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (110, 'test', 'Finanzas', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=110").fetchone()
        assert _detect_agent_from_category(idea) == 'finance'

    def test_operaciones_maps_to_staffing(self, test_db):
        from agents.pm import _detect_agent_from_category
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (111, 'test', 'Operaciones', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=111").fetchone()
        assert _detect_agent_from_category(idea) == 'staffing'

    def test_capacitacion_maps_to_training(self, test_db):
        from agents.pm import _detect_agent_from_category
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (112, 'test', 'Capacitacion', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=112").fetchone()
        assert _detect_agent_from_category(idea) == 'training'

    def test_unknown_category_returns_none(self, test_db):
        from agents.pm import _detect_agent_from_category
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (113, 'test', 'Personal', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=113").fetchone()
        assert _detect_agent_from_category(idea) is None

    def test_hse_maps_to_compliance(self, test_db):
        from agents.pm import _detect_agent_from_category
        test_db.execute(
            "INSERT INTO ideas (id, text, ai_category, code_stage) "
            "VALUES (114, 'test', 'HSE', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=114").fetchone()
        assert _detect_agent_from_category(idea) == 'compliance'


class TestDetectAgentFromKeywords:
    def test_presupuesto_detects_finance(self, test_db):
        from agents.pm import _detect_agent_from_keywords
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage) "
            "VALUES (120, 'Crear presupuesto OPEX para el proyecto', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=120").fetchone()
        assert _detect_agent_from_keywords(idea) == 'finance'

    def test_dotacion_detects_staffing(self, test_db):
        from agents.pm import _detect_agent_from_keywords
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage) "
            "VALUES (121, 'Necesitamos plan de dotacion de personal', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=121").fetchone()
        assert _detect_agent_from_keywords(idea) == 'staffing'

    def test_capacitacion_detects_training(self, test_db):
        from agents.pm import _detect_agent_from_keywords
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage) "
            "VALUES (122, 'Disenar programa de capacitacion para HSE', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=122").fetchone()
        assert _detect_agent_from_keywords(idea) == 'training'

    def test_no_keywords_returns_none(self, test_db):
        from agents.pm import _detect_agent_from_keywords
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage) "
            "VALUES (123, 'Revisar contrato con proveedor', 'organized')"
        )
        idea = test_db.execute("SELECT * FROM ideas WHERE id=123").fetchone()
        assert _detect_agent_from_keywords(idea) is None


class TestPMCiclo:
    def test_routes_consulting_agent(self, db_with_ideas):
        from agents.pm import ciclo
        set_connection(db_with_ideas)
        try:
            routed = ciclo()
            assert routed >= 1
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=1"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
        finally:
            reset_connection()

    def test_routes_software_task(self, db_with_ideas):
        from agents.pm import ciclo
        set_connection(db_with_ideas)
        try:
            ciclo()
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=2"
            ).fetchone()
            assert row['execution_status'] == 'queued_software'
        finally:
            reset_connection()

    def test_routes_skills_fallback(self, db_with_ideas):
        from agents.pm import ciclo
        set_connection(db_with_ideas)
        try:
            ciclo()
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=9"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
        finally:
            reset_connection()

    def test_skips_unroutable_idea(self, db_with_ideas):
        from agents.pm import ciclo
        set_connection(db_with_ideas)
        try:
            ciclo()
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=3"
            ).fetchone()
            assert row['execution_status'] is None
        finally:
            reset_connection()

    def test_returns_zero_when_no_ideas(self, test_db):
        from agents.pm import ciclo
        set_connection(test_db)
        try:
            assert ciclo() == 0
        finally:
            reset_connection()

    def test_sets_executed_by_pm(self, db_with_ideas):
        from agents.pm import ciclo
        set_connection(db_with_ideas)
        try:
            ciclo()
            row = db_with_ideas.execute(
                "SELECT executed_by FROM ideas WHERE id=1"
            ).fetchone()
            assert row['executed_by'] == 'PM'
        finally:
            reset_connection()

    def test_routes_by_category_finanzas(self, test_db):
        """Ideas with ai_category='Finanzas' route to consulting via finance agent."""
        from agents.pm import ciclo
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage, ai_category, priority) "
            "VALUES (130, 'Revisar presupuesto Q2', 'organized', 'Finanzas', 'media')"
        )
        set_connection(test_db)
        try:
            routed = ciclo()
            assert routed == 1
            row = test_db.execute(
                "SELECT execution_status, suggested_agent FROM ideas WHERE id=130"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
            assert row['suggested_agent'] == 'finance'
        finally:
            reset_connection()

    def test_routes_by_category_operaciones(self, test_db):
        """Ideas with ai_category='Operaciones' route to consulting via staffing agent."""
        from agents.pm import ciclo
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage, ai_category, priority) "
            "VALUES (131, 'Planificar turnos', 'organized', 'Operaciones', 'alta')"
        )
        set_connection(test_db)
        try:
            ciclo()
            row = test_db.execute(
                "SELECT execution_status, suggested_agent FROM ideas WHERE id=131"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
            assert row['suggested_agent'] == 'staffing'
        finally:
            reset_connection()

    def test_routes_by_keywords_in_text(self, test_db):
        """Ideas with consulting keywords in text get routed even without ai_category."""
        from agents.pm import ciclo
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage, priority) "
            "VALUES (132, 'Crear presupuesto OPEX para mantenimiento', 'organized', 'alta')"
        )
        set_connection(test_db)
        try:
            ciclo()
            row = test_db.execute(
                "SELECT execution_status, suggested_agent FROM ideas WHERE id=132"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
            assert row['suggested_agent'] == 'finance'
        finally:
            reset_connection()

    def test_retries_failed_idea(self, test_db):
        """Failed ideas get re-queued by PM retry logic."""
        from agents.pm import ciclo
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage, execution_status, execution_error, "
            "suggested_agent, priority) "
            "VALUES (140, 'Presupuesto OPEX fallido', 'organized', 'failed', "
            "'Ninguno de los modelos respondio', 'finance', 'alta')"
        )
        set_connection(test_db)
        try:
            routed = ciclo()
            assert routed >= 1
            row = test_db.execute(
                "SELECT execution_status, execution_error FROM ideas WHERE id=140"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
            assert '[RETRY]' in row['execution_error']
        finally:
            reset_connection()

    def test_retry_stops_after_max(self, test_db):
        """Failed ideas stop being retried after max retries."""
        from agents.pm import ciclo
        test_db.execute(
            "INSERT INTO ideas (id, text, code_stage, execution_status, execution_error, "
            "suggested_agent, priority) "
            "VALUES (141, 'Idea que falla siempre', 'organized', 'failed', "
            "'Error original\n[RETRY] Re-encolada por PM\n[RETRY] Re-encolada por PM', "
            "'finance', 'alta')"
        )
        set_connection(test_db)
        try:
            routed = ciclo()
            # Should NOT retry — already has 2 retries
            row = test_db.execute(
                "SELECT execution_status FROM ideas WHERE id=141"
            ).fetchone()
            assert row['execution_status'] == 'failed'
        finally:
            reset_connection()
