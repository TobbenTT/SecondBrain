"""Tests for agents/builder.py — BUILDER Build & Validation Agent"""
import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch
from db.connection import set_connection, reset_connection


class TestExtraerArchivos:
    def test_extracts_markdown_format(self):
        from agents.builder import _extraer_archivos
        output = (
            "**Motor:** gemini\n\n"
            "**Archivo: main.py**\n```python\nprint('hello')\n```\n\n"
            "**Archivo: utils.py**\n```python\ndef foo(): pass\n```"
        )
        archivos = _extraer_archivos(output)
        assert len(archivos) == 2
        assert archivos[0][0] == 'main.py'
        assert "print('hello')" in archivos[0][1]
        assert archivos[1][0] == 'utils.py'

    def test_extracts_raw_file_format(self):
        from agents.builder import _extraer_archivos
        output = "=== FILE: app.py ===\nprint('app')\n=== ENDFILE ==="
        archivos = _extraer_archivos(output)
        assert len(archivos) == 1
        assert archivos[0][0] == 'app.py'
        assert "print('app')" in archivos[0][1]

    def test_fallback_single_block_to_main_py(self):
        from agents.builder import _extraer_archivos
        output = "Some text\n```python\nprint('hello')\n```"
        archivos = _extraer_archivos(output)
        assert len(archivos) == 1
        assert archivos[0][0] == 'main.py'

    def test_returns_empty_for_no_code(self):
        from agents.builder import _extraer_archivos
        archivos = _extraer_archivos("just plain text, no code blocks")
        assert archivos == []


class TestSafeFilename:
    def test_strips_directory_traversal(self):
        from agents.builder import _safe_filename
        result = _safe_filename('../../etc/passwd')
        assert result is not None
        assert '..' not in result

    def test_strips_backslash_traversal(self):
        from agents.builder import _safe_filename
        result = _safe_filename('..\\..\\evil.py')
        assert result is not None
        assert '..' not in result

    def test_rejects_dotfiles(self):
        from agents.builder import _safe_filename
        assert _safe_filename('.bashrc') is None

    def test_normal_filename_passes(self):
        from agents.builder import _safe_filename
        assert _safe_filename('main.py') == 'main.py'

    def test_subdirectory_allowed(self):
        from agents.builder import _safe_filename
        result = _safe_filename('templates/index.html')
        assert result == 'templates/index.html'


class TestEscribirProyecto:
    def test_writes_files_to_disk(self):
        from agents.builder import _escribir_proyecto
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)):
                archivos = [('main.py', 'print("hello")'), ('utils.py', 'pass')]
                project_dir, err = _escribir_proyecto(999, archivos)
                assert err is None
                assert project_dir is not None
                assert (project_dir / 'main.py').exists()
                assert (project_dir / 'utils.py').exists()

    def test_generates_requirements_if_missing(self):
        from agents.builder import _escribir_proyecto
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)):
                archivos = [('main.py', 'import flask\napp = flask.Flask(__name__)')]
                project_dir, _ = _escribir_proyecto(998, archivos)
                req = project_dir / 'requirements.txt'
                assert req.exists()
                assert 'flask' in req.read_text()

    def test_preserves_existing_requirements(self):
        from agents.builder import _escribir_proyecto
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)):
                archivos = [
                    ('main.py', 'import flask'),
                    ('requirements.txt', 'flask==3.0.0\ngunicorn')
                ]
                project_dir, _ = _escribir_proyecto(997, archivos)
                req = project_dir / 'requirements.txt'
                assert 'gunicorn' in req.read_text()


class TestBuilderCiclo:
    def test_processes_developed_idea(self, db_with_ideas):
        from agents.builder import ciclo
        set_connection(db_with_ideas)
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)), \
                     patch('agents.builder._crear_venv') as mock_venv, \
                     patch('agents.builder._instalar_dependencias', return_value=(True, None)), \
                     patch('agents.builder._validar_sintaxis', return_value=(True, None)), \
                     patch('agents.builder._intentar_ejecucion', return_value=(True, {'type': 'script', 'stdout': 'OK'})):
                    mock_venv.return_value = (('/fake/python', '/fake/pip'), None)
                    result = ciclo()

                assert result == 1
                row = db_with_ideas.execute(
                    "SELECT execution_status, execution_output FROM ideas WHERE id=5"
                ).fetchone()
                assert row['execution_status'] == 'built'
                assert 'Build Report' in row['execution_output']
        finally:
            reset_connection()

    def test_returns_zero_when_no_tasks(self, test_db):
        from agents.builder import ciclo
        set_connection(test_db)
        try:
            assert ciclo() == 0
        finally:
            reset_connection()

    def test_sends_back_on_no_files(self, db_with_ideas):
        """If no code files can be extracted, sends back to queued_software."""
        db_with_ideas.execute(
            "UPDATE ideas SET execution_output = 'just text, no code blocks' WHERE id=5"
        )
        db_with_ideas.commit()
        set_connection(db_with_ideas)
        try:
            from agents.builder import ciclo
            result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status, execution_error FROM ideas WHERE id=5"
            ).fetchone()
            assert row['execution_status'] == 'queued_software'
            assert 'BUILDER RECHAZADO' in row['execution_error']
        finally:
            reset_connection()

    def test_sends_back_on_syntax_error(self, db_with_ideas):
        from agents.builder import ciclo
        set_connection(db_with_ideas)
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)), \
                     patch('agents.builder._crear_venv', return_value=(('/fake/python', '/fake/pip'), None)), \
                     patch('agents.builder._instalar_dependencias', return_value=(True, None)), \
                     patch('agents.builder._validar_sintaxis', return_value=(False, 'SyntaxError in main.py')):
                    result = ciclo()

                assert result == 0
                row = db_with_ideas.execute(
                    "SELECT execution_status, execution_error FROM ideas WHERE id=5"
                ).fetchone()
                assert row['execution_status'] == 'queued_software'
                assert 'SyntaxError' in row['execution_error']
        finally:
            reset_connection()

    def test_sends_back_on_runtime_error(self, db_with_ideas):
        from agents.builder import ciclo
        set_connection(db_with_ideas)
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)), \
                     patch('agents.builder._crear_venv', return_value=(('/fake/python', '/fake/pip'), None)), \
                     patch('agents.builder._instalar_dependencias', return_value=(True, None)), \
                     patch('agents.builder._validar_sintaxis', return_value=(True, None)), \
                     patch('agents.builder._intentar_ejecucion', return_value=(False, 'ModuleNotFoundError: flask')):
                    result = ciclo()

                assert result == 0
                row = db_with_ideas.execute(
                    "SELECT execution_status, execution_error FROM ideas WHERE id=5"
                ).fetchone()
                assert row['execution_status'] == 'queued_software'
                assert 'Runtime error' in row['execution_error']
        finally:
            reset_connection()

    def test_blocks_after_max_failures(self, db_with_ideas):
        db_with_ideas.execute(
            "UPDATE ideas SET execution_error = 'BUILDER RECHAZADO\nBUILDER RECHAZADO\nBUILDER RECHAZADO' WHERE id = 5"
        )
        db_with_ideas.commit()
        set_connection(db_with_ideas)
        try:
            from agents.builder import ciclo
            result = ciclo()
            assert result == 0
            row = db_with_ideas.execute(
                "SELECT execution_status FROM ideas WHERE id=5"
            ).fetchone()
            assert row['execution_status'] == 'blocked'
        finally:
            reset_connection()

    def test_registers_project_in_dashboard(self, db_with_ideas):
        """On successful build, project should be registered in the projects table."""
        from agents.builder import ciclo
        set_connection(db_with_ideas)
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                with patch('agents.builder.PROJECTS_DIR', Path(tmpdir)), \
                     patch('agents.builder._crear_venv') as mock_venv, \
                     patch('agents.builder._instalar_dependencias', return_value=(True, None)), \
                     patch('agents.builder._validar_sintaxis', return_value=(True, None)), \
                     patch('agents.builder._intentar_ejecucion', return_value=(True, {'type': 'webapp', 'port': 5105, 'pid': 1234})):
                    mock_venv.return_value = (('/fake/python', '/fake/pip'), None)
                    result = ciclo()

                assert result == 1
                proj = db_with_ideas.execute(
                    "SELECT * FROM projects WHERE id = '5'"
                ).fetchone()
                assert proj is not None
                assert 'backup' in proj['name'].lower() or 'Script' in proj['name']
                assert proj['url'] == 'http://localhost:5105'
                assert proj['status'] == 'development'
                assert proj['icon'] == '🤖'
        finally:
            reset_connection()
