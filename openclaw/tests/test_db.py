"""Tests for db/connection.py and db/queries.py"""
import sqlite3
import pytest
from db import queries
from db.connection import reset_connection, set_connection


class TestConnection:
    def test_set_connection_works(self, test_db):
        reset_connection()
        set_connection(test_db)
        from db.connection import get_connection
        assert get_connection() is test_db
        reset_connection()

    def test_row_factory_returns_dict_like(self, test_db):
        row = test_db.execute("SELECT username, role FROM users LIMIT 1").fetchone()
        assert row['username'] == 'david'
        assert row['role'] == 'admin'


class TestQueries:
    def test_get_routable_ideas_returns_organized_null_status(self, db_with_ideas):
        ideas = queries.get_routable_ideas(db_with_ideas)
        ids = [i['id'] for i in ideas]
        assert 1 in ids  # organized + agent
        assert 2 in ids  # organized + software
        assert 3 in ids  # organized + no agent
        assert 4 not in ids  # already queued
        assert 8 not in ids  # completed

    def test_get_routable_ideas_ordered_by_priority(self, db_with_ideas):
        ideas = queries.get_routable_ideas(db_with_ideas)
        priorities = [i['priority'] for i in ideas]
        assert priorities[0] == 'alta'

    def test_get_ideas_in_status(self, db_with_ideas):
        sw = queries.get_ideas_in_status(db_with_ideas, 'queued_software')
        assert len(sw) == 1
        assert sw[0]['id'] == 4

    def test_update_execution_status_basic(self, db_with_ideas):
        queries.update_execution_status(db_with_ideas, 1, 'queued_consulting', agent_name='PM')
        row = db_with_ideas.execute("SELECT execution_status, executed_by FROM ideas WHERE id=1").fetchone()
        assert row['execution_status'] == 'queued_consulting'
        assert row['executed_by'] == 'PM'

    def test_update_execution_status_completed_sets_expressed(self, db_with_ideas):
        queries.update_execution_status(db_with_ideas, 5, 'completed', output='Final', agent_name='QA')
        row = db_with_ideas.execute("SELECT code_stage FROM ideas WHERE id=5").fetchone()
        assert row['code_stage'] == 'expressed'

    def test_update_execution_status_reviewing_sets_distilled(self, db_with_ideas):
        queries.update_execution_status(db_with_ideas, 6, 'reviewing', output='Doc', agent_name='CONS')
        row = db_with_ideas.execute("SELECT code_stage FROM ideas WHERE id=6").fetchone()
        assert row['code_stage'] == 'distilled'

    def test_count_previous_failures_zero(self, db_with_ideas):
        assert queries.count_previous_failures(db_with_ideas, 1) == 0

    def test_count_previous_failures_with_rejections(self, db_with_ideas):
        db_with_ideas.execute(
            "UPDATE ideas SET execution_error = 'RECHAZADO\nRECHAZADO' WHERE id = 4"
        )
        assert queries.count_previous_failures(db_with_ideas, 4) == 2

    def test_get_context_string(self, db_with_ideas):
        ctx = queries.get_context_string(db_with_ideas)
        assert 'Value Strategy Consulting' in ctx

    def test_get_users(self, db_with_ideas):
        users = queries.get_users(db_with_ideas)
        names = [u['username'] for u in users]
        assert 'david' in names
        assert 'gonzalo' in names
        assert 'jose' in names

    def test_get_areas(self, db_with_ideas):
        areas = queries.get_areas(db_with_ideas)
        names = [a['name'] for a in areas]
        assert 'Operaciones' in names
        assert 'Finanzas' in names

    def test_save_context_item_new(self, test_db):
        queries.save_context_item(test_db, 'test-key', 'test content', 'test')
        row = test_db.execute("SELECT content FROM context_items WHERE key='test-key'").fetchone()
        assert row['content'] == 'test content'

    def test_save_context_item_update(self, test_db):
        queries.save_context_item(test_db, 'empresa', 'Updated content', 'business')
        row = test_db.execute("SELECT content FROM context_items WHERE key='empresa'").fetchone()
        assert row['content'] == 'Updated content'

    def test_get_pipeline_stats(self, db_with_ideas):
        stats = queries.get_pipeline_stats(db_with_ideas)
        assert stats['completed'] == 1  # idea 8
        assert stats['queued'] >= 1
