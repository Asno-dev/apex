"""APEX v2 — Hermes Agent plugin adapter."""

import json
import os
from pathlib import Path

APEX_DIR = Path(__file__).parent.parent
SKILLS_DIR = APEX_DIR / "skills"


def get_skill_content(agent_name: str) -> str | None:
    """Get skill content for an agent."""
    skill_path = SKILLS_DIR / f"apex-{agent_name}" / "SKILL.md"
    if skill_path.exists():
        content = skill_path.read_text()
        # Strip YAML frontmatter
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                return parts[2].strip()
    return None


def get_main_skill() -> str | None:
    """Get main APEX skill content."""
    skill_path = SKILLS_DIR / "apex" / "SKILL.md"
    if skill_path.exists():
        content = skill_path.read_text()
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                return parts[2].strip()
    return None
