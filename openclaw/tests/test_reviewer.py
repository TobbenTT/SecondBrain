"""Tests for agents/reviewer.py — Reviewer Quality Agent"""
import pytest
from unittest.mock import patch
from db.connection import set_connection, reset_connection


class TestReviewerCiclo:
    def test_approves_good_document(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            review_text = (
                "VEREDICTO: APROBADO\n"
                "SCORE: 9\n"
                "RESUMEN: Documento completo y profesional\n"
                "DETALLES:\n- Completo\n- Bien estructurado"
            )
            with patch('agents.reviewer.pensar_con_claude', return_value=review_text):
                result = ciclo()
            assert result >= 1
            row = db_with_ideas.execute(
                "SELECT execution_status, code_stage FROM ideas WHERE id=7"
            ).fetchone()
            assert row['execution_status'] == 'completed'
            assert row['code_stage'] == 'expressed'
        finally:
            reset_connection()

    def test_rejects_incomplete_document(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            review_text = (
                "VEREDICTO: RECHAZADO\n"
                "SCORE: 4\n"
                "RESUMEN: Falta detalle\n"
                "DETALLES:\n- Sin numeros\n- Generico"
            )
            with patch('agents.reviewer.pensar_con_claude', return_value=review_text):
                result = ciclo()
            assert result >= 1
            row = db_with_ideas.execute(
                "SELECT execution_status, execution_error FROM ideas WHERE id=7"
            ).fetchone()
            assert row['execution_status'] == 'queued_consulting'
            assert 'RECHAZADO' in row['execution_error']
        finally:
            reset_connection()

    def test_fallback_to_gemini_when_claude_fails(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.reviewer.pensar_con_claude', return_value=""), \
                 patch('agents.reviewer.pensar_con_gemini', return_value="VEREDICTO: APROBADO\nSCORE: 8\nRESUMEN: OK\nDETALLES:\n- Bien"):
                result = ciclo()
            assert result >= 1
            row = db_with_ideas.execute(
                "SELECT execution_status, execution_output FROM ideas WHERE id=7"
            ).fetchone()
            assert row['execution_status'] == 'completed'
            assert 'Gemini' in row['execution_output']
        finally:
            reset_connection()

    def test_marks_failed_when_no_model_responds(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.reviewer.pensar_con_claude', return_value=""), \
                 patch('agents.reviewer.pensar_con_gemini', return_value=""), \
                 patch('agents.reviewer.pensar_con_local', return_value=""):
                result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status, execution_error FROM ideas WHERE id=7"
            ).fetchone()
            assert row['execution_status'] == 'failed'
            assert 'Ningún modelo de IA respondió' in (row['execution_error'] or '')
        finally:
            reset_connection()

    def test_returns_zero_when_no_tasks(self, test_db):
        from agents.reviewer import ciclo
        set_connection(test_db)
        try:
            assert ciclo() == 0
        finally:
            reset_connection()

    def test_appends_review_to_output(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            review_text = (
                "VEREDICTO: APROBADO\n"
                "SCORE: 8\n"
                "RESUMEN: Bien\n"
                "DETALLES:\n- OK"
            )
            with patch('agents.reviewer.pensar_con_claude', return_value=review_text):
                ciclo()
            row = db_with_ideas.execute(
                "SELECT execution_output FROM ideas WHERE id=7"
            ).fetchone()
            assert "Quality Review (Reviewer" in row['execution_output']
            assert "APROBADO" in row['execution_output']
        finally:
            reset_connection()

    def test_handles_exception_gracefully(self, db_with_ideas):
        from agents.reviewer import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.reviewer.pensar_con_claude', side_effect=Exception("API error")):
                result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=7"
            ).fetchone()
            assert row['execution_status'] == 'reviewing'
        finally:
            reset_connection()
