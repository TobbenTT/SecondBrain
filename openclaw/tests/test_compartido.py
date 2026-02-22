"""Tests for compartido.py — Shared module"""
import pytest
from unittest.mock import patch, MagicMock


class TestConfig:
    def test_config_has_required_keys(self):
        from compartido import CONFIG
        assert 'gemini_api_key' in CONFIG
        assert 'anthropic_api_key' in CONFIG
        assert 'gemini_model' in CONFIG
        assert 'claude_model' in CONFIG
        assert 'local_model' in CONFIG
        assert 'ollama_url' in CONFIG
        assert 'intervalo_pm' in CONFIG
        assert 'intervalo_consulting' in CONFIG

    def test_config_intervalos_are_ints(self):
        from compartido import CONFIG
        assert isinstance(CONFIG['intervalo_pm'], int)
        assert isinstance(CONFIG['intervalo_dev'], int)
        assert isinstance(CONFIG['intervalo_qa'], int)
        assert isinstance(CONFIG['intervalo_consulting'], int)
        assert isinstance(CONFIG['intervalo_reviewer'], int)


class TestAIClients:
    def test_pensar_con_gemini_returns_string(self, mock_gemini):
        from compartido import pensar_con_gemini
        result = pensar_con_gemini("test prompt")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_pensar_con_gemini_empty_on_no_client(self):
        from compartido import pensar_con_gemini
        import compartido
        original = compartido.cliente_gemini
        compartido.cliente_gemini = None
        result = pensar_con_gemini("test")
        assert result == ""
        compartido.cliente_gemini = original

    def test_pensar_con_claude_returns_string(self, mock_claude):
        from compartido import pensar_con_claude
        result = pensar_con_claude("test prompt", sistema="test system")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_pensar_con_claude_empty_on_no_client(self):
        from compartido import pensar_con_claude
        import compartido
        original = compartido.cliente_claude
        compartido.cliente_claude = None
        result = pensar_con_claude("test")
        assert result == ""
        compartido.cliente_claude = original

    def test_pensar_con_local_returns_string(self):
        from compartido import pensar_con_local
        with patch('compartido.requests.post') as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {"response": "local response"}
            mock_post.return_value = mock_resp
            result = pensar_con_local("test")
            assert result == "local response"

    def test_pensar_con_local_empty_on_failure(self):
        from compartido import pensar_con_local
        with patch('compartido.requests.post', side_effect=Exception("connection refused")):
            result = pensar_con_local("test")
            assert result == ""


class TestUtilities:
    def test_log_prints_formatted(self, capsys):
        from compartido import log
        log("TEST", "hello world", "+")
        captured = capsys.readouterr()
        assert "[TEST]" in captured.out
        assert "hello world" in captured.out

    def test_hablar_no_crash_when_disabled(self):
        from compartido import hablar
        hablar("test")  # Should not raise
