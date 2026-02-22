"""Tests for agents/consulting.py — Consulting Document Agent"""
import json
import pytest
from unittest.mock import patch, MagicMock
from db.connection import set_connection, reset_connection


class TestBuildPrompt:
    def test_includes_skills_in_prompt(self):
        from agents.consulting import _build_prompt
        config = {'name': 'Test Agent', 'skills': []}
        skills = ["# Skill 1\nContent here", "# Skill 2\nMore content"]
        sys_prompt, user_prompt = _build_prompt("test", config, skills, "Make a plan", "Context")
        assert "SKILL 1" in sys_prompt
        assert "SKILL 2" in sys_prompt
        assert "Content here" in sys_prompt
        assert "More content" in sys_prompt

    def test_includes_agent_name(self):
        from agents.consulting import _build_prompt
        config = {'name': 'Staffing Agent — Experto en Dotacion', 'skills': []}
        sys_prompt, _ = _build_prompt("staffing", config, ["skill"], "idea", "ctx")
        assert "Staffing Agent" in sys_prompt

    def test_includes_idea_in_user_prompt(self):
        from agents.consulting import _build_prompt
        config = {'name': 'Agent', 'skills': []}
        _, user_prompt = _build_prompt("test", config, ["skill"], "Plan de dotacion", "ctx")
        assert "Plan de dotacion" in user_prompt

    def test_includes_context_in_user_prompt(self):
        from agents.consulting import _build_prompt
        config = {'name': 'Agent', 'skills': []}
        _, user_prompt = _build_prompt("test", config, ["skill"], "idea", "Value Strategy")
        assert "Value Strategy" in user_prompt


class TestGetSkillPaths:
    def test_from_agent_map(self):
        from agents.consulting import _get_skill_paths, AGENT_SKILLS_MAP
        task = MagicMock()
        task.__getitem__ = lambda self, key: {
            'suggested_agent': 'staffing',
            'suggested_skills': None
        }[key]
        paths = _get_skill_paths(task)
        assert 'customizable/create-staffing-plan.md' in paths

    def test_from_suggested_skills_json(self):
        from agents.consulting import _get_skill_paths
        task = MagicMock()
        task.__getitem__ = lambda self, key: {
            'suggested_agent': 'unknown_agent',
            'suggested_skills': '["core/audit-compliance-readiness.md"]'
        }[key]
        paths = _get_skill_paths(task)
        assert 'core/audit-compliance-readiness.md' in paths

    def test_returns_empty_for_unknown_no_skills(self):
        from agents.consulting import _get_skill_paths
        task = MagicMock()
        task.__getitem__ = lambda self, key: {
            'suggested_agent': 'unknown_agent',
            'suggested_skills': None
        }[key]
        paths = _get_skill_paths(task)
        assert paths == []

    def test_handles_invalid_json_gracefully(self):
        from agents.consulting import _get_skill_paths
        task = MagicMock()
        task.__getitem__ = lambda self, key: {
            'suggested_agent': 'unknown_agent',
            'suggested_skills': 'not valid json'
        }[key]
        paths = _get_skill_paths(task)
        assert paths == []


class TestConsultingCiclo:
    def test_processes_queued_consulting(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value="## Plan Completo\n1. Fase 1"), \
                 patch('agents.consulting.load_skills', return_value=["# Skill content"]):
                result = ciclo()
            assert result == 1
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=6"
            ).fetchone()
            assert row['execution_status'] == 'reviewing'
        finally:
            reset_connection()

    def test_saves_output(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value="Output document"), \
                 patch('agents.consulting.load_skills', return_value=["# Skill"]):
                ciclo()
            row = db_with_ideas.execute(
                "SELECT execution_output FROM ideas WHERE id=6"
            ).fetchone()
            assert "Output document" in row['execution_output']
            assert "Agente:" in row['execution_output']
        finally:
            reset_connection()

    def test_fallback_to_local_on_gemini_fail(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value=""), \
                 patch('agents.consulting.pensar_con_local', return_value="Local output"), \
                 patch('agents.consulting.load_skills', return_value=["# Skill"]):
                result = ciclo()
            assert result == 1
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=6"
            ).fetchone()
            assert row['execution_status'] == 'reviewing'
        finally:
            reset_connection()

    def test_fails_on_no_skills(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.load_skills', return_value=[]):
                result = ciclo()
            assert result == 0
        finally:
            reset_connection()

    def test_fails_when_no_ai_response(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value=""), \
                 patch('agents.consulting.pensar_con_local', return_value=""), \
                 patch('agents.consulting.load_skills', return_value=["# Skill"]):
                result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=6"
            ).fetchone()
            assert row['execution_status'] == 'failed'
        finally:
            reset_connection()

    def test_returns_zero_when_no_tasks(self, test_db):
        from agents.consulting import ciclo
        set_connection(test_db)
        try:
            assert ciclo() == 0
        finally:
            reset_connection()

    def test_includes_reviewer_feedback_on_retry(self, db_with_ideas):
        from agents.consulting import ciclo
        # Simulate rejected idea coming back
        db_with_ideas.execute(
            "UPDATE ideas SET execution_error = 'Falta especificidad' WHERE id = 6"
        )
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value="Improved doc") as mock_gemini, \
                 patch('agents.consulting.load_skills', return_value=["# Skill"]):
                ciclo()
            # The prompt should include the feedback
            call_args = mock_gemini.call_args[0][0]
            assert 'FEEDBACK DEL REVISOR' in call_args
            assert 'Falta especificidad' in call_args
        finally:
            reset_connection()

    def test_saves_context_item(self, db_with_ideas):
        from agents.consulting import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.consulting.pensar_con_gemini', return_value="Document output"), \
                 patch('agents.consulting.load_skills', return_value=["# Skill"]):
                ciclo()
            row = db_with_ideas.execute(
                "SELECT * FROM context_items WHERE key = 'output-finance-6'"
            ).fetchone()
            assert row is not None
            assert 'Document output' in row['content']
        finally:
            reset_connection()
