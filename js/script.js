/**
 * ============================================================================
 * ALEXANDER // RETRO PIXEL RPG & ARCADE JAVASCRIPT ENGINE
 * Full-Stack Interactive Retro System: Web Audio Chiptune, Pixel Canvas,
 * Typewriter Dialogue, CRT Shaders, Keyboard Shortcuts & Konami Easter Egg
 * ============================================================================
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. Web Audio API — 8-Bit Chiptune Synthesizer & Sound Effects Engine
     ------------------------------------------------------------------------ */
  let audioCtx = null;
  let masterGain = null;
  let sfxEnabled = true;
  let bgmPlaying = false;
  let bgmIntervalId = null;
  let currentVol = 0.75; // Louder, punchier arcade volume

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(currentVol, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Play short 8-bit retro sound blip
  function playBeep(freq = 600, duration = 0.06, type = "square") {
    if (!sfxEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx || !masterGain) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.28, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Play 8-bit Quest Loot / Level-Up Jingle
  function playFanfare() {
    if (!sfxEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx || !masterGain) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const startTime = audioCtx.currentTime + index * 0.11;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.32, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.19);
      });
    } catch (e) {}
  }

  /* ------------------------------------------------------------------------
     Classic Upbeat 8-Bit Arcade / RPG Adventure Theme
     Polyphonic dual-channel: Square Wave Lead + Punchy Bass Channel
     ------------------------------------------------------------------------ */
  // Frequency reference constants
  const NOTE = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, REST: 0
  };

  // Upbeat, heroic 8-bit adventure soundtrack pattern (Lead + Bass in sync)
  const ARCADE_SCORE = [
    // Phrase 1: The Adventure Begins!
    { lead: NOTE.E5, bass: NOTE.C3, len: 0.14 },
    { lead: NOTE.E5, bass: NOTE.G3, len: 0.14 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.08 },
    { lead: NOTE.E5, bass: NOTE.C3, len: 0.14 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.08 },
    { lead: NOTE.C5, bass: NOTE.G3, len: 0.14 },
    { lead: NOTE.E5, bass: NOTE.C3, len: 0.16 },
    { lead: NOTE.G5, bass: NOTE.G3, len: 0.28 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.12 },
    { lead: NOTE.G4, bass: NOTE.G3, len: 0.24 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.12 },

    // Phrase 2: Hero's Stride
    { lead: NOTE.C5, bass: NOTE.A3, len: 0.20 },
    { lead: NOTE.G4, bass: NOTE.E3, len: 0.16 },
    { lead: NOTE.E4, bass: NOTE.A3, len: 0.18 },
    { lead: NOTE.A4, bass: NOTE.F3, len: 0.18 },
    { lead: NOTE.B4, bass: NOTE.C3, len: 0.18 },
    { lead: NOTE.A4, bass: NOTE.F3, len: 0.14 },
    { lead: NOTE.G4, bass: NOTE.G3, len: 0.22 },

    // Phrase 3: Rising Fanfare
    { lead: NOTE.E5, bass: NOTE.C3, len: 0.15 },
    { lead: NOTE.G5, bass: NOTE.G3, len: 0.15 },
    { lead: NOTE.A5, bass: NOTE.A3, len: 0.22 },
    { lead: NOTE.F5, bass: NOTE.F3, len: 0.15 },
    { lead: NOTE.G5, bass: NOTE.C3, len: 0.18 },
    { lead: NOTE.E5, bass: NOTE.G3, len: 0.16 },
    { lead: NOTE.C5, bass: NOTE.A3, len: 0.15 },
    { lead: NOTE.D5, bass: NOTE.F3, len: 0.15 },
    { lead: NOTE.B4, bass: NOTE.G3, len: 0.28 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.14 },

    // Phrase 4: Victory Loop Arpeggio
    { lead: NOTE.G5, bass: NOTE.C3, len: 0.12 },
    { lead: NOTE.F5, bass: NOTE.G3, len: 0.12 },
    { lead: NOTE.D5, bass: NOTE.A3, len: 0.14 },
    { lead: NOTE.E5, bass: NOTE.C3, len: 0.18 },
    { lead: NOTE.C5, bass: NOTE.F3, len: 0.16 },
    { lead: NOTE.D5, bass: NOTE.G3, len: 0.18 },
    { lead: NOTE.C5, bass: NOTE.C3, len: 0.32 },
    { lead: NOTE.REST, bass: NOTE.REST, len: 0.18 },
  ];

  let scoreIndex = 0;

  function startChiptuneBGM() {
    if (bgmPlaying) return;
    initAudioContext();
    bgmPlaying = true;
    updateBGMUI();

    function step() {
      if (!bgmPlaying || !audioCtx || !masterGain) return;
      const beat = ARCADE_SCORE[scoreIndex];
      scoreIndex = (scoreIndex + 1) % ARCADE_SCORE.length;

      const now = audioCtx.currentTime;
      const playDur = beat.len * 0.88;

      try {
        // Channel 1: Lead Melody (Authentic Punchy 8-bit Square Wave)
        if (beat.lead && beat.lead > 0) {
          const leadOsc = audioCtx.createOscillator();
          const leadGain = audioCtx.createGain();

          leadOsc.type = "square";
          leadOsc.frequency.setValueAtTime(beat.lead, now);

          // Loud punchy attack with 8-bit staccato decay
          leadGain.gain.setValueAtTime(0.24, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + playDur);

          leadOsc.connect(leadGain);
          leadGain.connect(masterGain);

          leadOsc.start(now);
          leadOsc.stop(now + playDur);
        }

        // Channel 2: Rhythmic Pulse Bass (Provides the retro gaming groove)
        if (beat.bass && beat.bass > 0) {
          const bassOsc = audioCtx.createOscillator();
          const bassGain = audioCtx.createGain();

          bassOsc.type = "square";
          bassOsc.frequency.setValueAtTime(beat.bass, now);

          bassGain.gain.setValueAtTime(0.18, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + playDur);

          bassOsc.connect(bassGain);
          bassGain.connect(masterGain);

          bassOsc.start(now);
          bassOsc.stop(now + playDur);
        }
      } catch (e) {}

      bgmIntervalId = window.setTimeout(step, beat.len * 1000);
    }

    step();
  }

  function stopChiptuneBGM() {
    bgmPlaying = false;
    if (bgmIntervalId) {
      clearTimeout(bgmIntervalId);
      bgmIntervalId = null;
    }
    updateBGMUI();
  }

  function updateBGMUI() {
    const icon = document.getElementById("bgm-btn-icon");
    const label = document.getElementById("bgm-btn-label");
    if (icon) icon.textContent = bgmPlaying ? "⏹" : "▶";
    if (label) label.textContent = bgmPlaying ? "BGM: ON" : "BGM: OFF";
  }

  /* ------------------------------------------------------------------------
     2. Toast Notification System
     ------------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(text) {
    const toast = document.getElementById("rpg-toast");
    const msg = document.getElementById("toast-message");
    if (!toast || !msg) return;

    msg.textContent = text;
    toast.classList.add("is-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  /* ------------------------------------------------------------------------
     3. CRT Scanline Toggle System
     ------------------------------------------------------------------------ */
  function initCRTToggle() {
    const crtBtn = document.getElementById("crt-toggle");
    if (!crtBtn) return;

    const savedCRT = localStorage.getItem("rpg-crt");
    const isCRTActive = savedCRT !== "off";

    document.body.classList.toggle("crt-enabled", isCRTActive);
    crtBtn.querySelector(".btn-text").textContent = isCRTActive ? "CRT: ON" : "CRT: OFF";

    crtBtn.addEventListener("click", () => {
      playBeep(900, 0.05);
      const currentlyOn = document.body.classList.toggle("crt-enabled");
      crtBtn.querySelector(".btn-text").textContent = currentlyOn ? "CRT: ON" : "CRT: OFF";
      localStorage.setItem("rpg-crt", currentlyOn ? "on" : "off");
      showToast(currentlyOn ? "CRT Scanlines Enabled" : "CRT Scanlines Disabled");
    });
  }

  /* ------------------------------------------------------------------------
     4. Sound Effects & BGM Control
     ------------------------------------------------------------------------ */
  function initAudioControls() {
    const sfxBtn = document.getElementById("sfx-toggle");
    const sfxText = document.getElementById("sfx-toggle-text");
    const bgmBtn = document.getElementById("bgm-play-btn");
    const volSlider = document.getElementById("bgm-volume");

    if (sfxBtn && sfxText) {
      sfxBtn.addEventListener("click", () => {
        sfxEnabled = !sfxEnabled;
        sfxText.textContent = sfxEnabled ? "SFX: ON" : "SFX: OFF";
        if (sfxEnabled) playBeep(750, 0.06);
        showToast(sfxEnabled ? "Sound FX: ON" : "Sound FX: MUTED");
      });
    }

    if (bgmBtn) {
      bgmBtn.addEventListener("click", () => {
        playBeep(650, 0.04);
        if (bgmPlaying) {
          stopChiptuneBGM();
          showToast("8-Bit BGM Paused");
        } else {
          startChiptuneBGM();
          showToast("8-Bit BGM Playing");
        }
      });
    }

    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        currentVol = Number(e.target.value) / 100;
        if (masterGain && audioCtx) {
          masterGain.gain.setValueAtTime(currentVol, audioCtx.currentTime);
        }
      });
    }

    // Attach click sound to all buttons & links with .pixel-btn
    document.querySelectorAll(".pixel-btn, .hud-link").forEach((el) => {
      el.addEventListener("click", () => {
        playBeep(880, 0.04, "square");
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Day / Night Theme Toggle
     ------------------------------------------------------------------------ */
  function initThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle");
    const themeText = document.getElementById("theme-toggle-text");
    if (!themeBtn) return;

    const root = document.documentElement;
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";

    function updateLabel(theme) {
      if (themeText) {
        themeText.textContent = theme === "light" ? "☀️ DAY" : "🌙 NIGHT";
      }
    }

    updateLabel(current);

    themeBtn.addEventListener("click", () => {
      playBeep(1100, 0.07, "triangle");
      const active = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = active === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("rpg-theme", next);
      updateLabel(next);
      showToast(next === "light" ? "Handheld Arcade Mode" : "Dungeon Night Mode");
      window.dispatchEvent(new CustomEvent("rpgthemechange", { detail: { theme: next } }));
    });
  }

  /* ------------------------------------------------------------------------
     6. Dialogue Typewriter Animation
     ------------------------------------------------------------------------ */
  function initTypewriter() {
    const el = document.getElementById("typewriter-text");
    if (!el) return;

    const fullText = el.textContent.trim();
    el.textContent = "";
    let charIdx = 0;
    let typingTimer = null;

    function typeChar() {
      if (charIdx < fullText.length) {
        el.textContent += fullText[charIdx];
        charIdx += 1;
        // Subtle blip on letters occasionally
        if (charIdx % 4 === 0) {
          playBeep(320, 0.02, "triangle");
        }
        typingTimer = setTimeout(typeChar, 24);
      }
    }

    typeChar();

    // Click on dialogue box skips to full text
    el.closest(".dialogue-box")?.addEventListener("click", () => {
      if (charIdx < fullText.length) {
        clearTimeout(typingTimer);
        el.textContent = fullText;
        charIdx = fullText.length;
        playBeep(600, 0.04);
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. Fullscreen 8-Bit Pixel Starfield Canvas
     ------------------------------------------------------------------------ */
  function initPixelCanvas() {
    const canvas = document.getElementById("rpg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars = [];
    let shootingPixels = [];
    let animId = null;

    const PIXEL_SCALE = 3; // Blocky pixel art star size

    function createStars() {
      const count = Math.min(130, Math.floor((width * height) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.floor((Math.random() * width) / PIXEL_SCALE) * PIXEL_SCALE,
        y: Math.floor((Math.random() * height) / PIXEL_SCALE) * PIXEL_SCALE,
        size: Math.random() > 0.8 ? PIXEL_SCALE * 2 : PIXEL_SCALE,
        twinkleRate: Math.random() * 0.04 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.65,
      }));
    }

    function spawnShootingPixel() {
      const startX = Math.random() * width * 0.7;
      const startY = Math.random() * height * 0.4;
      const speed = 4.5 + Math.random() * 3.5;
      shootingPixels.push({
        x: startX,
        y: startY,
        vx: speed,
        vy: speed * 0.65,
        len: 8,
        life: 1.0,
        decay: 0.025,
      });
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createStars();
    }

    let time = 0;
    function render() {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // Spawn shooting stars randomly
      if (Math.random() < 0.007) {
        spawnShootingPixel();
      }

      // Draw pixel stars
      stars.forEach((s) => {
        const alpha = 0.25 + Math.abs(Math.sin(time * s.twinkleRate + s.twinklePhase)) * 0.75;
        if (isLight) {
          ctx.fillStyle = s.isGold
            ? `rgba(178, 115, 0, ${alpha.toFixed(2)})`
            : `rgba(90, 80, 65, ${(alpha * 0.45).toFixed(2)})`;
        } else {
          ctx.fillStyle = s.isGold
            ? `rgba(246, 196, 69, ${alpha.toFixed(2)})`
            : `rgba(200, 215, 230, ${alpha.toFixed(2)})`;
        }
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // Draw shooting pixel streaks
      shootingPixels = shootingPixels.filter((sh) => sh.life > 0);
      shootingPixels.forEach((sh) => {
        for (let i = 0; i < sh.len; i += 1) {
          const trailAlpha = (sh.life * (1 - i / sh.len)).toFixed(2);
          const px = sh.x - sh.vx * (i * 0.4);
          const py = sh.y - sh.vy * (i * 0.4);

          ctx.fillStyle = isLight
            ? `rgba(178, 115, 0, ${trailAlpha})`
            : `rgba(246, 196, 69, ${trailAlpha})`;

          ctx.fillRect(
            Math.floor(px / PIXEL_SCALE) * PIXEL_SCALE,
            Math.floor(py / PIXEL_SCALE) * PIXEL_SCALE,
            PIXEL_SCALE,
            PIXEL_SCALE
          );
        }

        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= sh.decay;
      });

      animId = requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("rpgthemechange", () => render());

    resize();
    render();
  }

  /* ------------------------------------------------------------------------
     8. Mobile HUD Menu Drawer
     ------------------------------------------------------------------------ */
  function initMobileMenu() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-hud");
    if (!menuBtn || !drawer) return;

    menuBtn.addEventListener("click", () => {
      playBeep(700, 0.05);
      const isOpen = drawer.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      menuBtn.querySelector("span").textContent = isOpen ? "✕" : "☰";
    });

    drawer.querySelectorAll(".mobile-hud-link").forEach((link) => {
      link.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.querySelector("span").textContent = "☰";
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. Keyboard Shortcuts & Konami Code Easter Egg
     ------------------------------------------------------------------------ */
  function initKeyboardControls() {
    // Keys [1]-[5] quick navigate to sections
    const keyMap = {
      "1": "#about",
      "2": "#skills",
      "3": "#projects",
      "4": "#journey",
      "5": "#contact",
    };

    // Konami code sequence
    const KONAMI = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let konamiIndex = 0;

    window.addEventListener("keydown", (e) => {
      // Ignore if typing inside input or textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      // Section shortcuts
      if (keyMap[e.key]) {
        e.preventDefault();
        const target = document.querySelector(keyMap[e.key]);
        if (target) {
          playBeep(920, 0.07);
          target.scrollIntoView({ behavior: "smooth" });
          showToast(`NAVIGATING TO [${keyMap[e.key].replace("#", "").toUpperCase()}]`);
        }
      }

      // Konami code detection
      if (e.key.toLowerCase() === KONAMI[konamiIndex].toLowerCase()) {
        konamiIndex += 1;
        playBeep(450 + konamiIndex * 80, 0.05);

        if (konamiIndex === KONAMI.length) {
          konamiIndex = 0;
          playFanfare();
          showToast("★ CHEAT CODE UNLOCKED: 9999 HP & INFINITE MANA! ★");

          // Temporarily boost HP & MP bars visually
          const hpBar = document.querySelector(".hp-bar");
          const mpBar = document.querySelector(".mp-bar");
          const hpVal = document.querySelector(".hp-text");
          const mpVal = document.querySelector(".mp-text");

          if (hpBar) hpBar.style.boxShadow = "0 0 15px #ff5252";
          if (mpBar) mpBar.style.boxShadow = "0 0 15px #448aff";
          if (hpVal) hpVal.textContent = "9999 / 9999 (GOD MODE)";
          if (mpVal) mpVal.textContent = "9999 / 9999 (INFINITE)";
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. Contact Form Dispatch
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      playFanfare();

      const name = (document.getElementById("name")?.value || "").trim();
      const email = (document.getElementById("email")?.value || "").trim();
      const message = (document.getElementById("message")?.value || "").trim();

      status.className = "form-status is-success";
      status.textContent = "DISPATCH TRANSMITTED! PREPARING COURIER...";

      // Open mailto fallback client
      const subject = encodeURIComponent(`[Quest Proposal] From ${name}`);
      const body = encodeURIComponent(
        `Adventurer: ${name}\nEmail: ${email}\n\nObjective:\n${message}`
      );
      window.setTimeout(() => {
        window.location.href = `mailto:ag8634557@gmail.com?subject=${subject}&body=${body}`;
        showToast("Opening Email Client for Alexander...");
      }, 700);
    });
  }

  /* ------------------------------------------------------------------------
     11. Live Spotify Tavern Jukebox Sync
     ------------------------------------------------------------------------ */
  function initSpotifySync() {
    if (window.location.protocol === "file:") return;

    const SPOTIFY_API_URL = "/api/spotify";
    const statusEl = document.getElementById("spotify-status");
    const iframeEl = document.getElementById("spotify-embed");
    if (!statusEl || !iframeEl) return;

    let currentTrackId = "4COy5i3OryqUNAJMvE6Lfv";

    async function sync() {
      if (document.hidden) return;
      try {
        const res = await fetch(SPOTIFY_API_URL, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.trackId) return;

        statusEl.textContent = data.isPlaying
          ? "Now Playing · Spotify"
          : "Recently Played · Spotify";

        if (data.trackId !== currentTrackId) {
          currentTrackId = data.trackId;
          iframeEl.src = `https://open.spotify.com/embed/track/${encodeURIComponent(
            data.trackId
          )}?utm_source=generator&theme=0`;
        }
      } catch (e) {}
    }

    sync();
    setInterval(sync, 30000);
  }

  /* ------------------------------------------------------------------------
     12. Dynamic Copyright Year
     ------------------------------------------------------------------------ */
  function initFooterYear() {
    const yr = document.getElementById("current-year");
    if (yr) yr.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     Initialization
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initCRTToggle();
    initAudioControls();
    initThemeToggle();
    initTypewriter();
    initPixelCanvas();
    initMobileMenu();
    initKeyboardControls();
    initContactForm();
    initSpotifySync();
    initFooterYear();
  });
})();
