"""Vercel Python Serverless Function: GET /api/callback"""

import base64
import html
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

TOKEN_URL = "https://accounts.spotify.com/api/token"


class handler(BaseHTTPRequestHandler):
    def _send_html(self, status: int, content: str):
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        code = (query.get("code") or [""])[0]
        if not code:
            self._send_html(400, "<h3>Spotify authorization failed or was canceled.</h3>")
            return

        client_id = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "").strip()
        redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "").strip()
        if not redirect_uri:
            host = self.headers.get("x-forwarded-host") or self.headers.get("host")
            proto = self.headers.get("x-forwarded-proto", "https")
            redirect_uri = f"{proto}://{host}/api/callback"

        creds = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
        body = urllib.parse.urlencode(
            {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            TOKEN_URL,
            data=body,
            headers={
                "Authorization": f"Basic {creds}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            err = html.escape(exc.read().decode("utf-8", errors="ignore"))
            self._send_html(400, f"<h3>Spotify token exchange failed:</h3><pre>{err}</pre>")
            return

        refresh_token = html.escape(data.get("refresh_token", ""))
        self._send_html(
            200,
            f"""
            <body style="background:#09090b;color:#f5f5f7;font-family:system-ui;padding:2rem;max-width:720px;margin:auto;">
              <h2 style="color:#ebd2aa;">Spotify Connected!</h2>
              <p>Copy this refresh token and add it in <strong>Vercel &rarr; Settings &rarr; Environment Variables</strong> as <code>SPOTIFY_REFRESH_TOKEN</code>, then click <strong>Redeploy</strong>:</p>
              <pre style="background:#14141a;padding:1rem;border-radius:8px;overflow:auto;border:1px solid #d4af7a;user-select:all;">{refresh_token}</pre>
            </body>
            """,
        )
