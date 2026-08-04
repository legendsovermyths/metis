"""Thin Vertex AI Gemini client mirroring service/src/llm_client/clients/gemini.

Auth: VERTEX_AI_SERVICE_ACCOUNT (JSON) from service/.env, JWT -> access token.
Endpoint: generateContent on the `global` location, same as prod.
"""
import base64
import json
import os
import time
from pathlib import Path

import requests
from dotenv import dotenv_values
from google.oauth2 import service_account
from google.auth.transport.requests import Request

MODEL = "gemini-3.1-pro-preview"
VERTEX_BASE = "https://aiplatform.googleapis.com"
SCOPE = "https://www.googleapis.com/auth/cloud-platform"

_REPO_ROOT = Path(__file__).resolve().parents[2]
_ENV_PATH = _REPO_ROOT / "service" / ".env"


def _load_sa() -> dict:
    raw = dotenv_values(_ENV_PATH).get("VERTEX_AI_SERVICE_ACCOUNT")
    if not raw:
        raise RuntimeError(f"VERTEX_AI_SERVICE_ACCOUNT not found in {_ENV_PATH}")
    return json.loads(raw)


class Gemini:
    def __init__(self, model: str = MODEL):
        self.model = model
        sa = _load_sa()
        self.project_id = sa["project_id"]
        self._creds = service_account.Credentials.from_service_account_info(
            sa, scopes=[SCOPE]
        )
        self._session = requests.Session()

    def _token(self) -> str:
        if not self._creds.valid:
            self._creds.refresh(Request())
        return self._creds.token

    def _url(self) -> str:
        return (
            f"{VERTEX_BASE}/v1/projects/{self.project_id}/locations/global/"
            f"publishers/google/models/{self.model}:generateContent"
        )

    def generate(
        self,
        prompt: str,
        system: str = "",
        pdf_path: str | None = None,
        json_mode: bool = True,
    ) -> str:
        parts = [{"text": prompt}]
        if pdf_path:
            data = base64.b64encode(Path(pdf_path).read_bytes()).decode()
            parts.append({"inlineData": {"mimeType": "application/pdf", "data": data}})

        body = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": parts}],
        }
        if json_mode:
            body["generationConfig"] = {"responseMimeType": "application/json"}

        for attempt in range(3):
            resp = self._session.post(
                self._url(),
                headers={
                    "Authorization": f"Bearer {self._token()}",
                    "Content-Type": "application/json",
                },
                json=body,
                timeout=180,
            )
            if resp.status_code == 200:
                out = resp.json()
                return out["candidates"][0]["content"]["parts"][0]["text"]
            if resp.status_code in (429, 500, 503) and attempt < 2:
                time.sleep(2 * (attempt + 1))
                continue
            raise RuntimeError(f"Vertex {resp.status_code}: {resp.text[:500]}")
        raise RuntimeError("unreachable")

    def generate_json(self, prompt: str, system: str = "", pdf_path: str | None = None):
        raw = self.generate(prompt, system=system, pdf_path=pdf_path, json_mode=True)
        return json.loads(raw)
