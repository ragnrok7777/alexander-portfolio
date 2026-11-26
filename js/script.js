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

  // Play classic Mario 2-tone coin chime (B5 -> E6)
  function playCoinChime() {
    if (!sfxEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx || !masterGain) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.08);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------------
     Arcade Mini-Game State (Coin & Score Tracking)
     ------------------------------------------------------------------------ */
  let coinsCount = 0;
  let totalScore = 0;

  function initArcadeGameCounters() {
    try {
      coinsCount = parseInt(localStorage.getItem("rpg-coins") || "0", 10);
      totalScore = parseInt(localStorage.getItem("rpg-score") || "0", 10);
    } catch (e) {}
    updateHudCounters();
  }

  function updateHudCounters() {
    const coinEl = document.getElementById("hud-coin-count");
    const scoreEl = document.getElementById("hud-score-val");
    if (coinEl) {
      coinEl.textContent = `x ${coinsCount < 10 ? "0" + coinsCount : coinsCount}`;
    }
    if (scoreEl) {
      scoreEl.textContent = String(totalScore).padStart(6, "0");
    }
  }

  function addCoin(points = 100) {
    coinsCount += 1;
    totalScore += points;
    try {
      localStorage.setItem("rpg-coins", coinsCount);
      localStorage.setItem("rpg-score", totalScore);
    } catch (e) {}

    playCoinChime();
    updateHudCounters();

    const coinPill = document.querySelector(".hud-coin-pill");
    if (coinPill) {
      coinPill.classList.remove("coin-bump");
      void coinPill.offsetWidth;
      coinPill.classList.add("coin-bump");
    }
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
     7. Fullscreen 8-Bit Pixel Starfield & Animated Mario Runner Canvas
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
    let clouds = [];
    let mysteryBlocks = [];
    let activeCoins = [];
    let animId = null;

    const PIXEL_SCALE = 3; // Star scale
    const SPRITE_SCALE = 3; // Mario pixel block size (3px per sprite pixel = 48px tall)

    // Classic 16x12 Authentic 8-Bit Mario Sprite Matrices
    const MARIO_F1 = [
      "....RRRRR...",
      "...RRRRRRRRR",
      "...DDDSSDS..",
      "..DSDSSSDSSS",
      "..DSDDSSDS..",
      "..DDSSSSD...",
      "....SSSSSS..",
      "...RRBRR....",
      "..RRRBRRR...",
      ".RRRRBRRRR..",
      ".SSBBYBBSS..",
      ".SSBBBBBBSS.",
      "...BBBBBB...",
      "..DDD..DDD..",
      ".DDD....DDD.",
      "............"
    ];

    const MARIO_F2 = [
      "....RRRRR...",
      "...RRRRRRRRR",
      "...DDDSSDS..",
      "..DSDSSSDSSS",
      "..DSDDSSDS..",
      "..DDSSSSD...",
      "....SSSSSS..",
      "...RRBRR....",
      "..RRRBRRR...",
      ".RRRRBRRRR..",
      ".SSBBYBBSS..",
      ".SSBBBBBBSS.",
      "...BBBBBB...",
      "...DDD..DDD.",
      "....DDD..DD.",
      "............"
    ];

    const MARIO_F3 = [
      "....RRRRR...",
      "...RRRRRRRRR",
      "...DDDSSDS..",
      "..DSDSSSDSSS",
      "..DSDDSSDS..",
      "..DDSSSSD...",
      "....SSSSSS..",
      "...RRBRR....",
      "..RRRBRRR...",
      ".RRRRBRRRR..",
      ".SSBBYBBSS..",
      ".SSBBBBBBSS.",
      "...BBBBBB...",
      "..DDD....DDD",
      ".DDD......DDD",
      "............"
    ];

    const MARIO_JUMP = [
      "....RRRRR...",
      "...RRRRRRRRR",
      "...DDDSSDS..",
      "..DSDSSSDSSS",
      "..DSDDSSDS..",
      "..DDSSSSD...",
      "....SSSSSS..",
      "..SSRRBRRSS.",
      ".SSRRRBRRRSS",
      ".SSRRRBRRRSS",
      "...BBBYBBB..",
      "...BBBBBBB..",
      "..BBBB.BBBB.",
      ".DDD.....DDD",
      ".DD.......DD",
      "............"
    ];

    // Mario Runner State
    const mario = {
      x: -60,
      y: 0,
      groundY: 0,
      vx: 3.2,
      vy: 0,
      gravity: 0.55,
      isJumping: false,
      frameTick: 0,
      currentFrame: 0,
      width: 12 * SPRITE_SCALE,
      height: 16 * SPRITE_SCALE,
    };

    function createStars() {
      const count = Math.min(110, Math.floor((width * height) / 15000));
      stars = Array.from({ length: count }, () => ({
        x: Math.floor((Math.random() * width) / PIXEL_SCALE) * PIXEL_SCALE,
        y: Math.floor((Math.random() * (height - 80)) / PIXEL_SCALE) * PIXEL_SCALE,
        size: Math.random() > 0.82 ? PIXEL_SCALE * 2 : PIXEL_SCALE,
        twinkleRate: Math.random() * 0.04 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.65,
      }));
    }

    function createClouds() {
      clouds = [
        { x: width * 0.15, y: 70, speed: 0.35, size: 4 },
        { x: width * 0.55, y: 110, speed: 0.25, size: 5 },
        { x: width * 0.88, y: 55, speed: 0.4, size: 3.5 },
      ];
    }

    function createBlocks() {
      mysteryBlocks = [];
      const count = Math.max(2, Math.floor(width / 380));
      for (let i = 0; i < count; i += 1) {
        mysteryBlocks.push({
          x: 220 + i * 360,
          y: mario.groundY - 78,
          w: 16 * SPRITE_SCALE,
          h: 16 * SPRITE_SCALE,
          bounceY: 0,
          isHit: false,
          animPhase: Math.random() * Math.PI,
        });
      }
    }

    function spawnShootingPixel() {
      const startX = Math.random() * width * 0.7;
      const startY = Math.random() * (height * 0.45);
      const speed = 4.8 + Math.random() * 3.5;
      shootingPixels.push({
        x: startX,
        y: startY,
        vx: speed,
        vy: speed * 0.65,
        len: 8,
        life: 1.0,
        decay: 0.024,
      });
    }

    function triggerMarioJump() {
      if (!mario.isJumping) {
        mario.isJumping = true;
        mario.vy = -12.5;
        playBeep(480, 0.08, "square");
      }
    }
    triggerMarioJumpRef = triggerMarioJump;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Ground sits 22px from bottom of screen
      mario.groundY = height - 24 - mario.height;
      if (!mario.isJumping) {
        mario.y = mario.groundY;
      }

      createStars();
      createClouds();
      createBlocks();
    }

    // Draw an authentic 8-bit cloud with pixel blocks (GTA VI Dusk Tint)
    function drawPixelCloud(cx, cy, s) {
      ctx.fillStyle = "rgba(255, 42, 141, 0.14)";
      const p = s;
      // Cloud shape
      ctx.fillRect(cx, cy, p * 8, p * 4);
      ctx.fillRect(cx - p * 3, cy + p * 2, p * 14, p * 3);
      ctx.fillRect(cx + p * 2, cy - p * 2, p * 5, p * 3);
    }

    // Draw 8-Bit Mario Sprite
    function drawMarioSprite(x, y, isLight) {
      let matrix = MARIO_F1;
      if (mario.isJumping) {
        matrix = MARIO_JUMP;
      } else {
        const runCycle = [MARIO_F1, MARIO_F2, MARIO_F3, MARIO_F2];
        matrix = runCycle[mario.currentFrame % runCycle.length];
      }

      // Color palette mappings
      const colorMap = {
        R: isLight ? "#c92a2a" : "#e52521", // Classic Mario Red
        B: isLight ? "#1864ab" : "#2b4cde", // Classic Overalls Blue
        S: isLight ? "#e0a96d" : "#fcc082", // Peach / Skin Tone
        D: isLight ? "#5c3d1e" : "#5c2c0e", // Hair / Boots
        Y: "#fcc419",                       // Gold button
      };

      for (let r = 0; r < matrix.length; r += 1) {
        const row = matrix[r];
        for (let c = 0; c < row.length; c += 1) {
          const char = row[c];
          if (char !== "." && colorMap[char]) {
            ctx.fillStyle = colorMap[char];
            ctx.fillRect(
              Math.floor(x + c * SPRITE_SCALE),
              Math.floor(y + r * SPRITE_SCALE),
              SPRITE_SCALE,
              SPRITE_SCALE
            );
          }
        }
      }
    }

    // Draw [?] Mystery Block
    function drawMysteryBlock(block, isLight) {
      const bx = block.x;
      const by = block.y + block.bounceY;
      const bw = block.w;
      const bh = block.h;

      // Block body
      ctx.fillStyle = block.isHit
        ? (isLight ? "#9e8065" : "#634731")
        : (isLight ? "#d48806" : "#e59b12");
      ctx.fillRect(bx, by, bw, bh);

      // Block pixel borders
      ctx.strokeStyle = isLight ? "#5c3c12" : "#382006";
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, by, bw, bh);

      // 4 corner bolts
      ctx.fillStyle = isLight ? "#ffd591" : "#ffe7ba";
      ctx.fillRect(bx + 4, by + 4, 3, 3);
      ctx.fillRect(bx + bw - 7, by + 4, 3, 3);
      ctx.fillRect(bx + 4, by + bh - 7, 3, 3);
      ctx.fillRect(bx + bw - 7, by + bh - 7, 3, 3);

      // Animated '?' sign
      if (!block.isHit) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", bx + bw / 2, by + bh / 2);
      }
    }

    let time = 0;
    function render() {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // 1. Draw Clouds
      clouds.forEach((cl) => {
        drawPixelCloud(cl.x, cl.y, cl.size);
        cl.x += cl.speed;
        if (cl.x > width + 80) cl.x = -80;
      });

      // 2. Spawn shooting stars
      if (Math.random() < 0.007) {
        spawnShootingPixel();
      }

      // 3. Draw Stars (GTA VI Neon Pink & Vice Cyan)
      stars.forEach((s) => {
        const alpha = 0.25 + Math.abs(Math.sin(time * s.twinkleRate + s.twinklePhase)) * 0.75;
        if (isLight) {
          ctx.fillStyle = s.isGold
            ? `rgba(217, 0, 108, ${alpha.toFixed(2)})`
            : `rgba(0, 139, 163, ${(alpha * 0.5).toFixed(2)})`;
        } else {
          ctx.fillStyle = s.isGold
            ? `rgba(255, 42, 141, ${alpha.toFixed(2)})`
            : `rgba(0, 240, 255, ${(alpha * 0.85).toFixed(2)})`;
        }
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // 4. Draw Shooting Pixel Comets (GTA VI Sunset Glow)
      shootingPixels = shootingPixels.filter((sh) => sh.life > 0);
      shootingPixels.forEach((sh) => {
        for (let i = 0; i < sh.len; i += 1) {
          const trailAlpha = (sh.life * (1 - i / sh.len)).toFixed(2);
          const px = sh.x - sh.vx * (i * 0.4);
          const py = sh.y - sh.vy * (i * 0.4);

          ctx.fillStyle = isLight
            ? `rgba(217, 0, 108, ${trailAlpha})`
            : `rgba(255, 42, 141, ${trailAlpha})`;

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

      // 5. Draw 8-Bit Ground Terrain Along Bottom (Vice City Purple Bricks)
      const groundH = 24;
      const groundY = height - groundH;

      ctx.fillStyle = isLight ? "#9c428a" : "#49156e"; // Brick surface
      ctx.fillRect(0, groundY, width, groundH);

      ctx.fillStyle = isLight ? "#d9006c" : "#ff2a8d"; // Neon pink mortar line
      ctx.fillRect(0, groundY, width, 3);

      // Checkered brick vertical notches
      ctx.fillStyle = isLight ? "#5c1b50" : "#28083e";
      for (let bx = 0; bx < width; bx += 32) {
        ctx.fillRect(bx, groundY + 3, 3, groundH - 3);
      }

      // 6. Update & Draw Mystery [?] Blocks
      mysteryBlocks.forEach((block) => {
        // Smooth bounce return
        if (block.bounceY < 0) {
          block.bounceY += 1.2;
          if (block.bounceY > 0) block.bounceY = 0;
        }

        drawMysteryBlock(block, isLight);

        // Check Mario hit under block!
        const marioMidX = mario.x + mario.width / 2;
        if (
          !block.isHit &&
          mario.isJumping &&
          mario.vy < 0 &&
          marioMidX >= block.x - 10 &&
          marioMidX <= block.x + block.w + 10 &&
          Math.abs(mario.y - (block.y + block.h)) < 16
        ) {
          block.isHit = true;
          block.bounceY = -9;
          mario.vy = 2; // Bounce head down

          // Spawn Golden Coin & Increment Score
          activeCoins.push({
            x: block.x + block.w / 2,
            y: block.y - 10,
            vy: -7.5,
            life: 1.0,
            rot: 0,
          });

          addCoin(100); // Coin sound + HUD counter increment!
        }
      });

      // 7. Update & Draw Flying Coins
      activeCoins = activeCoins.filter((c) => c.life > 0);
      activeCoins.forEach((c) => {
        c.y += c.vy;
        c.vy += 0.45; // gravity
        c.rot += 0.25;
        c.life -= 0.024;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = isLight ? "#faad14" : "#ffec3d";

        // Pixel coin ellipse
        const coinW = Math.max(3, Math.abs(Math.cos(c.rot)) * 12);
        ctx.fillRect(-coinW / 2, -10, coinW, 20);

        // "+100" Points popup
        ctx.fillStyle = isLight ? "#d9006c" : "#00f0ff";
        ctx.font = "bold 11px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText("+100", 0, -18);

        ctx.restore();
      });

      // 8. Update & Draw Mario Runner
      mario.x += mario.vx;

      // Running cycle tick
      mario.frameTick += 1;
      if (mario.frameTick % 7 === 0) {
        mario.currentFrame += 1;
      }

      // Physics (Jumping / Gravity)
      if (mario.isJumping) {
        mario.y += mario.vy;
        mario.vy += mario.gravity;

        if (mario.y >= mario.groundY) {
          mario.y = mario.groundY;
          mario.isJumping = false;
          mario.vy = 0;
        }
      } else {
        mario.y = mario.groundY;

        // Auto-jump to hit [?] blocks as Mario runs near them
        mysteryBlocks.forEach((block) => {
          if (!block.isHit && Math.abs(mario.x + mario.width / 2 - (block.x + block.w / 2)) < 30) {
            triggerMarioJump();
          }
        });
      }

      // Loop Mario from right side back to left side
      if (mario.x > width + 60) {
        mario.x = -60;
        // Reset blocks for next loop
        mysteryBlocks.forEach((b) => {
          b.isHit = false;
          b.bounceY = 0;
        });
      }

      // Render Mario
      drawMarioSprite(mario.x, mario.y, isLight);

      animId = requestAnimationFrame(render);
    }

    // Interactive jumps on user input!
    window.addEventListener("click", (e) => {
      // If not clicking a form control or button, Mario jumps!
      if (!["INPUT", "TEXTAREA", "BUTTON", "A"].includes(e.target.tagName)) {
        triggerMarioJump();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        triggerMarioJump();
      }
    });

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
     13. Neon Pixel Particle Click Sparkles
     ------------------------------------------------------------------------ */
  function createClickSparkles(x, y) {
    if (!x && !y) return;
    const colors = ["#ff2a8d", "#00f0ff", "#ffd000", "#ff6a00", "#ffffff"];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "pixel-click-sparkle";
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.4 - 0.2);
      const dist = 18 + Math.random() * 24;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 450);
    }
  }

  function initClickSparkles() {
    window.addEventListener("click", (e) => {
      createClickSparkles(e.clientX, e.clientY);
    });
  }

  /* ------------------------------------------------------------------------
     14. Mobile [A] Arcade Jump Button
     ------------------------------------------------------------------------ */
  function initMobileJumpButton() {
    const btn = document.getElementById("mobile-jump-btn");
    if (!btn) return;

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (typeof triggerMarioJumpRef === "function") triggerMarioJumpRef();
      if (e.touches && e.touches[0]) {
        createClickSparkles(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    btn.addEventListener("click", () => {
      if (typeof triggerMarioJumpRef === "function") triggerMarioJumpRef();
    });
  }

  /* ------------------------------------------------------------------------
     15. Retro RPG Resume / Inventory Scroll Modal
     ------------------------------------------------------------------------ */
  function initResumeModal() {
    const modal = document.getElementById("resume-modal");
    const openBtn = document.getElementById("resume-open-btn");
    const closeBtn = document.getElementById("resume-modal-close");
    const copyBtn = document.getElementById("copy-email-btn");
    const emailEl = document.getElementById("copyable-email");
    if (!modal) return;

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      playBeep(780, 0.08, "square");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      playBeep(420, 0.08, "square");
      document.body.style.overflow = "";
    }

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    if (copyBtn && emailEl) {
      copyBtn.addEventListener("click", () => {
        const email = emailEl.textContent || "ag8634557@gmail.com";
        navigator.clipboard.writeText(email).then(() => {
          playFanfare();
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = "<span>✔ COPIED TO CLIPBOARD!</span>";
          setTimeout(() => {
            copyBtn.innerHTML = origText;
          }, 2000);
        }).catch(() => {
          window.location.href = `mailto:${email}`;
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Initialization
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initArcadeGameCounters();
    initClickSparkles();
    initMobileJumpButton();
    initResumeModal();
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
