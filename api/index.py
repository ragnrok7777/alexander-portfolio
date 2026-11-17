"""
Spotify Live Now-Playing & Recently-Played API (Flask on Vercel)
Routes:
  - /api/spotify  -> Live currently playing or recently played track JSON
  - /api/login    -> One-time Spotify OAuth login to generate Refresh Token
  - /api/callback -> Displays your SPOTIFY_REFRESH_TOKEN to paste in Vercel
"""

import base64
import os
import time
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request

load_dotenv()

app = Flask(__name__)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "").strip()
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "").strip()
REFRESH_TOKEN = os.getenv("SPOTIFY_REFRESH_TOKEN", "").strip()

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing"
SPOTIFY_RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1"
SCOPES = "user-read-currently-playing user-read-recently-played"

_token_cache = {"access_token": None, "expires_at": 0.0}


def _get_redirect_uri() -> str:
    env_uri = os.getenv("SPOTIFY_REDIRECT_URI", "").strip()
    if env_uri:
        return env_uri
    return f"{request.url_root.rstrip('/')}/api/callback"


def _basic_auth_header() -> str:
    raw = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("utf-8")


def _get_access_token() -> str:
    now = time.time()
    if _token_cache["access_token"] and now < _token_cache["expires_at"] - 30:
        return _token_cache["access_token"]

    if not (CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN):
        raise RuntimeError(
            "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REFRESH_TOKEN."
        )

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        headers={
            "Authorization": _basic_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "refresh_token",
            "refresh_token": REFRESH_TOKEN,
        },
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()

    _token_cache["access_token"] = payload["access_token"]
    _token_cache["expires_at"] = now + int(payload.get("expires_in", 3600))
    return _token_cache["access_token"]


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


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/login")
def spotify_login():
    if not (CLIENT_ID and CLIENT_SECRET):
        return (
            "<h3>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Vercel Environment Variables first.</h3>",
            400,
        )
    params = urlencode(
        {
            "client_id": CLIENT_ID,
            "response_type": "code",
            "redirect_uri": _get_redirect_uri(),
            "scope": SCOPES,
        }
    )
    return redirect(f"{SPOTIFY_AUTH_URL}?{params}")


@app.route("/api/callback")
def spotify_callback():
    code = request.args.get("code")
    if not code:
        return "<h3>Authorization failed or canceled.</h3>", 400

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        headers={
            "Authorization": _basic_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": _get_redirect_uri(),
        },
        timeout=10,
    )
    if not response.ok:
        return f"<h3>Token exchange failed:</h3><pre>{response.text}</pre>", 400

    refresh_token = response.json().get("refresh_token", "")
    return f"""
    <body style="background:#09090b;color:#f5f5f7;font-family:system-ui;padding:2rem;">
      <h2 style="color:#ebd2aa;">Spotify Connected!</h2>
      <p>Copy this refresh token into Vercel &rarr; Project Settings &rarr; Environment Variables as <code>SPOTIFY_REFRESH_TOKEN</code>, then Redeploy:</p>
      <pre style="background:#14141a;padding:1rem;border-radius:8px;overflow:auto;border:1px solid #d4af7a;">{refresh_token}</pre>
    </body>
    """


@app.route("/api/spotify")
def get_spotify_status():
    try:
        token = _get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        now_resp = requests.get(SPOTIFY_NOW_PLAYING_URL, headers=headers, timeout=10)
        if now_resp.status_code == 200:
            data = now_resp.json()
            item = data.get("item")
            if item and item.get("id"):
                return jsonify(_format_track(item, bool(data.get("is_playing"))))

        recent_resp = requests.get(
            SPOTIFY_RECENTLY_PLAYED_URL, headers=headers, timeout=10
        )
        recent_resp.raise_for_status()
        items = recent_resp.json().get("items", [])
        if items and items[0].get("track"):
            return jsonify(_format_track(items[0]["track"], False))

        return jsonify({"isPlaying": False, "trackId": None}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
