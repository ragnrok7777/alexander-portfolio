"""Vercel Python Serverless Function: GET /api/spotify"""

import base64
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

TOKEN_URL = "https://accounts.spotify.com/api/token"
NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"
RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1"


def _get_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    creds = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    body = urllib.parse.urlencode(
        {"grant_type": "refresh_token", "refresh_token": refresh_token}
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
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["access_token"]


def _spotify_get(url: str, access_token: str):
    req = urllib.request.Request(
        url, headers={"Authorization": f"Bearer {access_token}"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status == 204:
            return None
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else None


def _format_track(track: dict, is_playing: bool) -> dict:
    artists = ", ".join(a.get("name", "") for a in track.get("artists", []))
    album = track.get("album", {})
    images = album.get("images", [])
    return {
        "isPlaying": is_playing,
        "trackId": track.get("id"),
        "title": track.get("name"),
        "artist": artists,
        "album": album.get("name"),
        "albumArt": images[0]["url"] if images else None,
        "songUrl": track.get("external_urls", {}).get("spotify"),
    }


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        client_id = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
        client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "").strip()
        refresh_token = os.getenv("SPOTIFY_REFRESH_TOKEN", "").strip()

        if not (client_id and client_secret and refresh_token):
            self._send_json(
                500,
                {
                    "error": "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REFRESH_TOKEN in Vercel Environment Variables."
                },
            )
            return

        try:
            token = _get_access_token(client_id, client_secret, refresh_token)

            now_data = _spotify_get(NOW_PLAYING_URL, token)
            if now_data and now_data.get("item") and now_data["item"].get("id"):
                self._send_json(
                    200,
                    _format_track(now_data["item"], bool(now_data.get("is_playing"))),
                )
                return

            recent_data = _spotify_get(RECENTLY_PLAYED_URL, token)
            items = (recent_data or {}).get("items", [])
            if items and items[0].get("track"):
                self._send_json(200, _format_track(items[0]["track"], False))
                return

            self._send_json(200, {"isPlaying": False, "trackId": None})
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            self._send_json(exc.code, {"error": f"Spotify HTTP {exc.code}: {detail}"})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})
