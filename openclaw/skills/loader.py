"""
Skills Loader — Reads SOP markdown files from core/skills/ directory.
These files serve as the knowledge base for consulting agents.

Uses mtime-based caching: files are only re-read from disk when modified.
"""
import os
from pathlib import Path

_skills_dir = None
_content_cache = {}  # full_path -> (content, mtime)


def _get_skills_dir():
    """Resolve and cache the skills directory path."""
    global _skills_dir
    if _skills_dir is not None:
        return _skills_dir

    skills_path = os.getenv("SKILLS_DIR", "../core/skills")
    if not os.path.isabs(skills_path):
        skills_path = str((Path(__file__).parent.parent / skills_path).resolve())

    _skills_dir = skills_path
    return _skills_dir


def reset_skills_dir():
    """Reset cached path (for testing)."""
    global _skills_dir
    _skills_dir = None


def set_skills_dir(path):
    """Override skills directory (for testing)."""
    global _skills_dir
    _skills_dir = path


def load_skill(relative_path):
    """Load a single skill file content with mtime-based caching.

    Returns cached content if file hasn't been modified since last read.
    Automatically invalidates when skills are edited via dashboard.

    Args:
        relative_path: Path relative to skills dir, e.g. 'customizable/create-staffing-plan.md'

    Returns:
        File content as string, or None if not found.
    """
    skills_dir = _get_skills_dir()
    full_path = os.path.join(skills_dir, relative_path)
    if not os.path.exists(full_path):
        return None

    mtime = os.path.getmtime(full_path)
    cached = _content_cache.get(full_path)
    if cached and cached[1] == mtime:
        return cached[0]

    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    _content_cache[full_path] = (content, mtime)
    return content


def load_skills(skill_paths):
    """Load multiple skill files.

    Args:
        skill_paths: List of relative paths.

    Returns:
        List of content strings (skips missing files).
    """
    contents = []
    for p in skill_paths:
        content = load_skill(p)
        if content:
            contents.append(content)
    return contents


def list_available_skills():
    """List all .md files in the skills directory tree.

    Returns:
        Sorted list of relative paths (forward slashes).
    """
    skills_dir = _get_skills_dir()
    if not os.path.exists(skills_dir):
        return []

    result = []
    for root, _, files in os.walk(skills_dir):
        for f in files:
            if f.endswith(".md"):
                rel = os.path.relpath(os.path.join(root, f), skills_dir)
                result.append(rel.replace("\\", "/"))
    return sorted(result)
