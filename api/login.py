"""Vercel Python Serverless Function: GET /api/login"""

import os
import urllib.parse
from http.server import BaseHTTPRequestHandler

AUTH_URL = "https://accounts.spotify.com/authorize"
SCOPES = "user-read-currently-playing user-read-recently-played"


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        client_id = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
        if not client_id:
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                b"<h3>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Vercel Environment Variables first, then Redeploy.</h3>"
            )
            return

        redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "").strip()
        if not redirect_uri:
            host = self.headers.get("x-forwarded-host") or self.headers.get("host")
            proto = self.headers.get("x-forwarded-proto", "https")
            redirect_uri = f"{proto}://{host}/api/callback"

        params = urllib.parse.urlencode(
            {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
                "scope": SCOPES,
            }
        )
        self.send_response(302)
        self.send_header("Location", f"{AUTH_URL}?{params}")
        self.end_headers()
