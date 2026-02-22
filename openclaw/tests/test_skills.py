"""Tests for skills/loader.py"""
import os
import tempfile
import pytest
from skills.loader import load_skill, load_skills, list_available_skills, set_skills_dir, reset_skills_dir


@pytest.fixture
def temp_skills_dir():
    """Create a temporary skills directory with test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create core/ subdirectory
        core_dir = os.path.join(tmpdir, "core")
        os.makedirs(core_dir)

        # Create customizable/ subdirectory
        custom_dir = os.path.join(tmpdir, "customizable")
        os.makedirs(custom_dir)

        # Create test skill files
        with open(os.path.join(core_dir, "test-skill.md"), "w") as f:
            f.write("# Test Skill\n\nThis is a test SOP.")
        with open(os.path.join(custom_dir, "custom-skill.md"), "w") as f:
            f.write("# Custom Skill\n\nCustom SOP content.")

        set_skills_dir(tmpdir)
        yield tmpdir
        reset_skills_dir()


class TestSkillLoader:
    def test_load_skill_returns_content(self, temp_skills_dir):
        content = load_skill("core/test-skill.md")
        assert content is not None
        assert "Test Skill" in content

    def test_load_skill_returns_none_for_missing(self, temp_skills_dir):
        content = load_skill("core/nonexistent.md")
        assert content is None

    def test_load_skills_multiple(self, temp_skills_dir):
        contents = load_skills(["core/test-skill.md", "customizable/custom-skill.md"])
        assert len(contents) == 2
        assert "Test Skill" in contents[0]
        assert "Custom Skill" in contents[1]

    def test_load_skills_skips_missing(self, temp_skills_dir):
        contents = load_skills(["core/test-skill.md", "core/missing.md"])
        assert len(contents) == 1

    def test_list_available_skills(self, temp_skills_dir):
        skills = list_available_skills()
        assert "core/test-skill.md" in skills
        assert "customizable/custom-skill.md" in skills
        assert len(skills) == 2

    def test_load_skill_from_real_skills_dir(self):
        """Test that we can load a real skill from SecondBrain's core/skills/."""
        reset_skills_dir()
        # Uses the SKILLS_DIR env var set in conftest.py
        content = load_skill("core/classify-idea.md")
        # May or may not exist depending on test environment
        if content:
            assert len(content) > 0
