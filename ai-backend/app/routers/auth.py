import os, sqlite3
from datetime import datetime, timedelta, timezone

import bcrypt, jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from app.db.database import get_conn

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGO = "HS256"
TOKEN_DAYS = 7
bearer = HTTPBearer()


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=6, max_length=72)   # bcrypt reads max 72 bytes


def _make_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET, algorithm=ALGO)


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    """Dependency for protected endpoints: returns the user id from the token."""
    try:
        payload = jwt.decode(cred.credentials, SECRET, algorithms=[ALGO])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(401, "Invalid or expired token. Please log in again.")


@router.post("/signup")
def signup(c: Credentials):
    email = c.email.strip().lower()
    if "@" not in email:
        raise HTTPException(422, "Enter a valid email.")
    pw_hash = bcrypt.hashpw(c.password.encode(), bcrypt.gensalt()).decode()
    try:
        with get_conn() as conn:
            cur = conn.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, pw_hash))
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(409, "An account with this email already exists.")
    return {"token": _make_token(user_id), "email": email}


@router.post("/login")
def login(c: Credentials):
    email = c.email.strip().lower()
    with get_conn() as conn:
        row = conn.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,)).fetchone()
    if not row or not bcrypt.checkpw(c.password.encode(), row["password_hash"].encode()):
        raise HTTPException(401, "Incorrect email or password.")
    return {"token": _make_token(row["id"]), "email": email}