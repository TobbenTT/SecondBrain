"""Tests for agents/dev.py — DEV Code Generation Agent"""
import pytest
from unittest.mock import patch, MagicMock
from db.connection import set_connection, reset_connection


class TestExtraerCodigo:
    def test_extracts_file_pattern(self):
        from agents.dev import _extraer_codigo
        raw = "=== FILE: main.py ===\nprint('hello')\n=== ENDFILE ==="
        result = _extraer_codigo(raw)
        assert "main.py" in result
        assert "print('hello')" in result

    def test_extracts_markdown_blocks(self):
        from agents.dev import _extraer_codigo
        raw = "Aqui esta:\n```python\ndef foo():\n    return 42\n```"
        result = _extraer_codigo(raw)
        assert "def foo():" in result
        assert "return 42" in result

    def test_fallback_to_raw_text(self):
        from agents.dev import _extraer_codigo
        raw = "just plain code without markers"
        result = _extraer_codigo(raw)
        assert result == "just plain code without markers"

    def test_extracts_multiple_files(self):
        from agents.dev import _extraer_codigo
        raw = (
            "=== FILE: a.py ===\ncode_a\n=== ENDFILE ===\n"
            "=== FILE: b.py ===\ncode_b\n=== ENDFILE ==="
        )
        result = _extraer_codigo(raw)
        assert "a.py" in result
        assert "b.py" in result
        assert "code_a" in result
        assert "code_b" in result


class TestProgramarConIA:
    def test_gemini_success(self):
        from agents.dev import _programar_con_ia
        with patch('agents.dev.pensar_con_gemini', return_value="code here"):
            result, offline = _programar_con_ia("build X")
            assert result == "code here"
            assert offline is False

    def test_gemini_fails_uses_local(self):
        from agents.dev import _programar_con_ia
        with patch('agents.dev.pensar_con_gemini', return_value=""), \
             patch('agents.dev.pensar_con_local', return_value="local code"), \
             patch('agents.dev.time') as mock_time:
            result, offline = _programar_con_ia("build X")
            assert result == "local code"
            assert offline is True

    def test_correction_goes_direct_to_local(self):
        from agents.dev import _programar_con_ia
        with patch('agents.dev.pensar_con_local', return_value="fixed code") as mock_local, \
             patch('agents.dev.pensar_con_gemini') as mock_gemini:
            result, offline = _programar_con_ia("build X", error_previo="bugs", es_correccion=True)
            assert result == "fixed code"
            assert offline is True
            mock_gemini.assert_not_called()

    def test_all_fail_returns_empty(self):
        from agents.dev import _programar_con_ia
        with patch('agents.dev.pensar_con_gemini', return_value=""), \
             patch('agents.dev.pensar_con_local', return_value=""), \
             patch('agents.dev.time'):
            result, offline = _programar_con_ia("build X")
            assert result == ""


class TestDevCiclo:
    def test_processes_queued_software(self, db_with_ideas):
        from agents.dev import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.dev.pensar_con_gemini', return_value="print('done')"):
                result = ciclo()
            assert result == 1
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=4"
            ).fetchone()
            assert row['execution_status'] == 'developed'
        finally:
            reset_connection()

    def test_returns_zero_when_no_tasks(self, test_db):
        from agents.dev import ciclo
        set_connection(test_db)
        try:
            assert ciclo() == 0
        finally:
            reset_connection()

    def test_blocks_after_max_corrections(self, db_with_ideas):
        from agents.dev import ciclo
        # Set up idea 4 as rejected multiple times
        db_with_ideas.execute(
            "UPDATE ideas SET execution_error = 'RECHAZADO\nRECHAZADO\nRECHAZADO' WHERE id = 4"
        )
        set_connection(db_with_ideas)
        try:
            result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=4"
            ).fetchone()
            assert row['execution_status'] == 'blocked'
        finally:
            reset_connection()

    def test_failed_on_no_ai_response(self, db_with_ideas):
        from agents.dev import ciclo
        set_connection(db_with_ideas)
        try:
            with patch('agents.dev.pensar_con_gemini', return_value=""), \
                 patch('agents.dev.pensar_con_local', return_value=""), \
                 patch('agents.dev.time'):
                result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=4"
            ).fetchone()
            assert row['execution_status'] == 'failed'
        finally:
            reset_connection()
