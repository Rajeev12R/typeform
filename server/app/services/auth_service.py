import secrets
import json
import os
from typing import Dict, Optional

SESSION_FILE = "sessions.json"

def _load_sessions() -> Dict[str, int]:
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def _save_sessions(sessions: Dict[str, int]):
    with open(SESSION_FILE, "w") as f:
        json.dump(sessions, f)

SESSIONS: Dict[str, int] = _load_sessions()

def create_session(user_id: int) -> str:
    """Generates a secure session token and stores it in memory and disk."""
    session_id = secrets.token_urlsafe(32)
    SESSIONS[session_id] = user_id
    _save_sessions(SESSIONS)
    return session_id

def get_user_id(session_id: str) -> Optional[int]:
    """Retrieves the user_id associated with a given session token."""
    return SESSIONS.get(session_id)

def destroy_session(session_id: str) -> None:
    """Removes a session from memory and disk."""
    if session_id in SESSIONS:
        del SESSIONS[session_id]
        _save_sessions(SESSIONS)
