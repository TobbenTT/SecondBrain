"""
SQLite connection manager for OpenClaw.
Connects to the SAME database as the SecondBrain dashboard.
Uses WAL mode for concurrent access (dashboard Node.js + OpenClaw Python).

Each thread gets its own connection to avoid SQLite threading issues.
"""
import os
import sqlite3
import threading
from pathlib import Path

_local = threading.local()
_db_path = None
_path_lock = threading.Lock()

# For testing: injected connection overrides per-thread connections
_test_db = None


def _resolve_db_path():
    """Resolve and cache the database path (once, thread-safe)."""
    global _db_path
    if _db_path is not None:
        return _db_path

    with _path_lock:
        if _db_path is not None:
            return _db_path

        path = os.getenv("DB_PATH", "../apps/dashboard/data/second_brain.db")
        if not os.path.isabs(path):
            path = str((Path(__file__).parent.parent / path).resolve())

        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Database not found: {path}\n"
                "Make sure SecondBrain dashboard has been started at least once."
            )

        _db_path = path
        return _db_path


def _create_connection(path):
    """Create a new SQLite connection with standard PRAGMAs."""
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA busy_timeout = 5000")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_connection():
    """Get a SQLite connection for the current thread.

    Each thread gets its own connection for safe concurrent access.
    WAL mode allows multiple readers + one writer across threads and processes.
    """
    # Test mode: return injected connection
    if _test_db is not None:
        return _test_db

    # Thread-local connection
    conn = getattr(_local, 'conn', None)
    if conn is not None:
        return conn

    path = _resolve_db_path()
    _local.conn = _create_connection(path)
    return _local.conn


def close_connection():
    """Close the current thread's connection. Call from each thread on shutdown."""
    conn = getattr(_local, 'conn', None)
    if conn is not None:
        conn.close()
        _local.conn = None


def close_all():
    """Reset path cache. Individual threads should call close_connection()."""
    global _db_path
    with _path_lock:
        _db_path = None


def reset_connection():
    """Reset for testing — clears test DB and path cache."""
    global _test_db, _db_path
    _test_db = None
    _db_path = None
    _local.conn = None


def set_connection(conn):
    """Inject a connection for testing (shared across all threads in test)."""
    global _test_db
    _test_db = conn
