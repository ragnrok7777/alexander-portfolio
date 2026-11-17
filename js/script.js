/* ==========================================================================
   PORTFOLIO SCRIPTS — Vanilla JavaScript
   Step 6: Interactions, Scroll Reveals, Card Sheen & Ambient Canvas
   ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Mark document as JS-enhanced (used by Step 6 CSS reveal choreography)
  document.documentElement.classList.add("js-ready");

  /* ------------------------------------------------------------------------
     1. Toast Notification Helper
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message, duration = 3200) {
    if (!toastEl || !message) return;

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, duration);
  }

  /* ------------------------------------------------------------------------
     2. Sticky Header & Back-to-Top Visibility
     ------------------------------------------------------------------------ */
  function initScrollChrome() {
    const header = document.getElementById("site-header");
    const backToTop = document.getElementById("back-to-top");

    const onScroll = () => {
      const y = window.scrollY;
      if (header) {
        header.classList.toggle("is-scrolled", y > 24);
      }
      if (backToTop) {
        backToTop.classList.toggle("is-visible", y > 420);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggleBtn = document.getElementById("menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (!toggleBtn || !mobileNav) return;

    const mobileLinks = mobileNav.querySelectorAll("a");

    const setMenuState = (isOpen) => {
      toggleBtn.classList.toggle("is-open", isOpen);
      mobileNav.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      toggleBtn.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
    };

    toggleBtn.addEventListener("click", () => {
      const currentlyOpen = toggleBtn.classList.contains("is-open");
      setMenuState(!currentlyOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileNav.classList.contains("is-open")) {
        setMenuState(false);
        toggleBtn.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900 && mobileNav.classList.contains("is-open")) {
        setMenuState(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Smooth Anchor Scrolling & Active Nav Highlighting (Scroll Spy)
     ------------------------------------------------------------------------ */
  function initNavigationSpy() {
    const navLinks = Array.from(document.querySelectorAll(".desktop-nav .nav-link"));
    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        return id && id.startsWith("#") ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    // Smooth scrolling for non-placeholder in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.hasAttribute("data-placeholder-link")) return;

      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        event.preventDefault();
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "start",
        });

        // Update URL hash cleanly without jumping
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", targetId);
        }
      });
    });

    if (!sections.length) return;

    const setActiveLink = (activeId) => {
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("is-active", isMatch);
      });
    };

    const heroSection = document.getElementById("hero");
    const observedSections = heroSection ? [heroSection, ...sections] : sections;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id === "hero" ? "" : entry.target.id);
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    observedSections.forEach((section) => observer.observe(section));

    // Handle edge positions: very top of page & very bottom of page (tall screens)
    const onScrollEdge = () => {
      if (window.scrollY < 100) {
        setActiveLink("");
        return;
      }
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (nearBottom) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) setActiveLink(lastSection.id);
      }
    };

    window.addEventListener("scroll", onScrollEdge, { passive: true });
  }

  /* ------------------------------------------------------------------------
     5. Interactive Project Bubbles (Supports Multiple Projects)
     ------------------------------------------------------------------------ */
  function initProjectBubble() {
    const items = Array.from(document.querySelectorAll("[data-project-item]"));
    if (!items.length) return;

    const setItemOpen = (item, isOpen) => {
      const trigger = item.querySelector("[data-project-trigger]");
      const panel = item.querySelector("[data-project-panel]");
      if (!trigger || !panel) return;

      trigger.classList.toggle("is-open", isOpen);
      panel.classList.toggle("is-open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));
    };

    const closeAll = (exceptItem = null) => {
      items.forEach((item) => {
        if (item !== exceptItem) setItemOpen(item, false);
      });
    };

    items.forEach((item) => {
      const trigger = item.querySelector("[data-project-trigger]");
      if (!trigger) return;

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const currentlyOpen = trigger.classList.contains("is-open");
        closeAll(item);
        setItemOpen(item, !currentlyOpen);
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInside = items.some((item) => item.contains(event.target));
      if (!clickedInside) closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openItem = items.find((item) =>
          item.querySelector("[data-project-trigger]")?.classList.contains("is-open")
        );
        if (openItem) {
          closeAll();
          openItem.querySelector("[data-project-trigger]")?.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. Placeholder Link Handler
     ------------------------------------------------------------------------ */
  function initPlaceholderLinks() {
    const placeholders = document.querySelectorAll("[data-placeholder-link]");
    placeholders.forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        const message = el.getAttribute("data-placeholder-link") || "Link coming soon.";
        showToast(message);
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. Contact Form Validation & Submission Feedback
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const statusEl = document.getElementById("form-status");
    if (!form || !statusEl) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setStatus = (message, type) => {
      statusEl.textContent = message;
      statusEl.classList.remove("is-success", "is-error");
      if (type) statusEl.classList.add(`is-${type}`);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const subject = form.elements.subject.value.trim();
      const message = form.elements.message.value.trim();

      if (!name || !email || !subject || !message) {
        setStatus("Please fill in all fields before sending your message.", "error");
        return;
      }

      if (!emailRegex.test(email)) {
        setStatus("Please enter a valid email address.", "error");
        form.elements.email.focus();
        return;
      }

      if (message.length < 10) {
        setStatus("Please write a short message of at least 10 characters.", "error");
        form.elements.message.focus();
        return;
      }

      const mailtoSubject = encodeURIComponent(`[Portfolio] ${subject}`);
      const mailtoBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );
      window.location.href = `mailto:ag8634557@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      setStatus(
        `Thanks, ${name}! Your email app is opening with your message addressed to ag8634557@gmail.com.`,
        "success"
      );
      showToast("Opening your email app to send the message!");
      form.reset();
    });
  }

  /* ------------------------------------------------------------------------
     8. Scroll Reveal Observer (Pairs with Step 6 CSS Animations)
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (!revealEls.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    // Trigger above-the-fold hero elements smoothly after initial paint
    const heroReveals = document.querySelectorAll("#hero [data-reveal]");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        heroReveals.forEach((el) => el.classList.add("is-revealed"));
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.1,
      }
    );

    revealEls.forEach((el) => {
      if (!el.closest("#hero")) {
        revealObserver.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------------
     8b. Subtle Pointer-Tracked Card Sheen (Desktop / Fine Pointer Only)
     ------------------------------------------------------------------------ */
  function initCardGlow() {
    if (
      prefersReducedMotion.matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const glowCards = document.querySelectorAll(
      ".skill-card, .pillar-card, .project-card"
    );

    glowCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x.toFixed(1)}%`);
        card.style.setProperty("--my", `${y.toFixed(1)}%`);
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. Subtle Cinematic Hero Canvas Background
     ------------------------------------------------------------------------ */
  function initHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;
    let isHeroVisible = true;
    const pointer = { x: null, y: null };

    const createParticles = () => {
      const count = Math.min(48, Math.max(20, Math.floor((width * height) / 26000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.4 + 0.6,
        gold: Math.random() > 0.55,
      }));
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw subtle filament lines between nearby particles
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.14;
            ctx.strokeStyle = `rgba(212, 175, 122, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // Gentle pointer attraction halo
        if (pointer.x !== null && pointer.y !== null) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < 150) {
            const alpha = (1 - pdist / 150) * 0.22;
            ctx.strokeStyle = `rgba(235, 210, 170, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = p.gold
          ? "rgba(235, 210, 170, 0.55)"
          : "rgba(245, 245, 247, 0.32)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!isHeroVisible || document.hidden || prefersReducedMotion.matches) {
        animationFrameId = null;
        return;
      }
      drawFrame();
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }
      if (!animationFrameId && isHeroVisible && !document.hidden) {
        animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.addEventListener("mousemove", (event) => {
        const rect = heroSection.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      });
      heroSection.addEventListener("mouseleave", () => {
        pointer.x = null;
        pointer.y = null;
      });

      if ("IntersectionObserver" in window) {
        const heroObserver = new IntersectionObserver(
          (entries) => {
            isHeroVisible = entries[0].isIntersecting;
            if (isHeroVisible) startLoop();
          },
          { threshold: 0.05 }
        );
        heroObserver.observe(heroSection);
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) startLoop();
    });

    window.addEventListener("resize", resize);
    resize();
    startLoop();
  }

  /* ------------------------------------------------------------------------
     10. Ambient Background Tune + Volume Control + Smart Spotify Handoff
     ------------------------------------------------------------------------ */
  function initAmbientTune() {
    const widgetEl = document.getElementById("sound-widget");
    const toggleBtn = document.getElementById("sound-toggle");
    const labelEl = document.getElementById("sound-label");
    const volumeSlider = document.getElementById("sound-volume");
    const spotifyCard = document.getElementById("spotify-card");
    const spotifyIframe = document.getElementById("spotify-embed");
    if (!widgetEl || !toggleBtn || !volumeSlider) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      widgetEl.style.display = "none";
      return;
    }

    let ctx = null;
    let masterGain = null;
    let delayNode = null;
    let isPlaying = false;
    let userMuted = false;
    let pausedForSpotify = false;
    let isHoveringSpotify = false;
    let loopTimer = null;
    let stepIndex = 0;

    // Load saved volume if available (0.0 to 1.0)
    let volume = 0.65;
    try {
      const savedVol = window.localStorage.getItem("portfolio_volume");
      if (savedVol !== null) {
        const parsed = Number(savedVol);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          volume = parsed / 100;
          volumeSlider.value = String(parsed);
        }
      }
    } catch {
      // Ignore storage errors on restricted origins
    }

    const syncSliderVisual = () => {
      const pct = Math.round(volume * 100);
      volumeSlider.style.setProperty("--vol", `${pct}%`);
    };
    syncSliderVisual();

    // Warm Minimal Luxury progression: Am9 -> Fmaj7 -> Cmaj7 -> G6
    const progression = [
      { pad: [220.0, 261.63, 329.63, 392.0], arp: [493.88, 659.25, 587.33, 523.25] },
      { pad: [174.61, 220.0, 261.63, 329.63], arp: [440.0, 523.25, 659.25, 523.25] },
      { pad: [130.81, 196.0, 246.94, 329.63], arp: [392.0, 493.88, 659.25, 587.33] },
      { pad: [196.0, 246.94, 293.66, 329.63], arp: [440.0, 587.33, 493.88, 392.0] },
    ];

    const ensureAudioGraph = () => {
      if (ctx) return;
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1150, ctx.currentTime);

      delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.setValueAtTime(0.38, ctx.currentTime);

      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.28, ctx.currentTime);

      const wetGain = ctx.createGain();
      wetGain.gain.setValueAtTime(0.32, ctx.currentTime);

      filter.connect(masterGain);
      filter.connect(delayNode);
      delayNode.connect(feedback);
      feedback.connect(delayNode);
      delayNode.connect(wetGain);
      wetGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      ctx._busFilter = filter;
    };

    const playPadChord = (freqs, startTime, duration) => {
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime((i - 1.5) * 4, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 1.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx._busFilter);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      });
    };

    const playBellNote = (freq, startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.075, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx._busFilter);
      osc.start(startTime);
      osc.stop(startTime + 1.9);
    };

    const scheduleBar = () => {
      if (!isPlaying || !ctx) return;
      const bar = progression[stepIndex % progression.length];
      const now = ctx.currentTime + 0.05;
      const barDuration = 3.6;

      playPadChord(bar.pad, now, barDuration + 0.4);
      bar.arp.forEach((note, idx) => {
        playBellNote(note, now + idx * 0.85);
      });

      stepIndex += 1;
      loopTimer = window.setTimeout(scheduleBar, barDuration * 1000);
    };

    const applyGain = (targetVol, rampSeconds = 0.15) => {
      if (!ctx || !masterGain) return;
      const now = ctx.currentTime;
      const clamped = Math.max(0.0001, targetVol);
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
      masterGain.gain.linearRampToValueAtTime(clamped, now + rampSeconds);
    };

    const updateUI = () => {
      const active = isPlaying && volume > 0;
      widgetEl.classList.toggle("is-playing", active);
      toggleBtn.setAttribute("aria-pressed", String(active));
      toggleBtn.setAttribute(
        "aria-label",
        active ? "Mute ambient tune" : "Play ambient tune"
      );
      if (labelEl) {
        if (active) {
          labelEl.textContent = "On";
        } else if (pausedForSpotify) {
          labelEl.textContent = "Spotify";
        } else {
          labelEl.textContent = "Muted";
        }
      }
    };

    const startTune = async (silentOnBlock = false) => {
      try {
        ensureAudioGraph();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        if (ctx.state !== "running") {
          return false;
        }
        if (volume === 0) {
          volume = 0.5;
          volumeSlider.value = "50";
          syncSliderVisual();
        }
        pausedForSpotify = false;
        if (isPlaying) {
          applyGain(volume, 0.2);
          updateUI();
          return true;
        }

        isPlaying = true;
        userMuted = false;
        applyGain(volume, 0.75);

        window.clearTimeout(loopTimer);
        scheduleBar();
        updateUI();
        return true;
      } catch {
        if (!silentOnBlock) {
          showToast("Tap the sound button to start the tune.");
        }
        return false;
      }
    };

    const stopTune = (byUser = true, forSpotify = false) => {
      if (byUser) userMuted = true;
      pausedForSpotify = forSpotify;
      isPlaying = false;
      window.clearTimeout(loopTimer);
      applyGain(0.0001, 0.28);
      updateUI();
    };

    toggleBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      removeUnlockListeners();
      if (isPlaying) {
        stopTune(true, false);
      } else {
        startTune(false);
      }
    });

    volumeSlider.addEventListener("input", () => {
      const pct = Number(volumeSlider.value);
      volume = pct / 100;
      syncSliderVisual();

      try {
        window.localStorage.setItem("portfolio_volume", String(pct));
      } catch {
        // Ignore storage errors
      }

      if (pct === 0) {
        stopTune(true, false);
      } else if (!isPlaying) {
        removeUnlockListeners();
        startTune(false);
      } else {
        applyGain(volume, 0.08);
        updateUI();
      }
    });

    // Smart Audio Handoff: when visitor clicks inside the Spotify embed, fade out background tune
    if (spotifyCard) {
      spotifyCard.addEventListener("pointerenter", () => {
        isHoveringSpotify = true;
      });
      spotifyCard.addEventListener("pointerleave", () => {
        isHoveringSpotify = false;
      });
    }

    window.addEventListener("blur", () => {
      const focusedSpotify =
        spotifyIframe && document.activeElement === spotifyIframe;
      if (focusedSpotify || isHoveringSpotify) {
        removeUnlockListeners();
        if (isPlaying) {
          stopTune(true, true);
          showToast("Switched audio to Spotify preview.");
        } else {
          userMuted = true;
          pausedForSpotify = true;
          updateUI();
        }
      }
    });

    // Attempt autoplay on visit; unlock on earliest user gesture outside the Spotify card
    const unlockOnFirstGesture = async (event) => {
      if (
        event.target &&
        (widgetEl.contains(event.target) ||
          (spotifyCard && spotifyCard.contains(event.target)))
      ) {
        return;
      }
      if (userMuted || isPlaying) {
        removeUnlockListeners();
        return;
      }
      const started = await startTune(true);
      if (started) {
        removeUnlockListeners();
      }
    };

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlockOnFirstGesture);
      window.removeEventListener("touchstart", unlockOnFirstGesture);
      window.removeEventListener("click", unlockOnFirstGesture);
      window.removeEventListener("keydown", unlockOnFirstGesture);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isPlaying) {
        stopTune(false, false);
      } else if (!document.hidden && !userMuted && !pausedForSpotify && ctx && volume > 0) {
        startTune(true);
      }
    });

    updateUI();

    startTune(true).then((started) => {
      if (!started) {
        window.addEventListener("pointerdown", unlockOnFirstGesture, { passive: true });
        window.addEventListener("touchstart", unlockOnFirstGesture, { passive: true });
        window.addEventListener("click", unlockOnFirstGesture, { passive: true });
        window.addEventListener("keydown", unlockOnFirstGesture, { passive: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     11. Live Spotify Sync (Connects to /api/spotify on Vercel)
     ------------------------------------------------------------------------ */
  function initSpotifyLiveSync() {
    // Automatically uses /api/spotify when hosted on Vercel
    if (window.location.protocol === "file:") return;

    const SPOTIFY_API_URL = "/api/spotify";
    const POLL_INTERVAL_MS = 30000;

    const cardEl = document.getElementById("spotify-card");
    const statusEl = document.getElementById("spotify-status");
    const iframeEl = document.getElementById("spotify-embed");
    if (!cardEl || !statusEl || !iframeEl) return;

    let currentTrackId = "4COy5i3OryqUNAJMvE6Lfv";

    const syncSpotify = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(SPOTIFY_API_URL, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.trackId) return;

        cardEl.classList.toggle("is-live", Boolean(data.isPlaying));
        statusEl.textContent = data.isPlaying
          ? "Now Playing · Spotify"
          : "Recently Played · Spotify";

        if (data.trackId !== currentTrackId) {
          currentTrackId = data.trackId;
          iframeEl.src = `https://open.spotify.com/embed/track/${encodeURIComponent(
            data.trackId
          )}?utm_source=generator&theme=0`;
        }
      } catch {
        // Backend not running yet — silently keep default embedded track
      }
    };

    syncSpotify();
    window.setInterval(syncSpotify, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncSpotify();
    });
  }

  /* ------------------------------------------------------------------------
     12. Dynamic Copyright Year
     ------------------------------------------------------------------------ */
  function initFooterYear() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /* ------------------------------------------------------------------------
     Initialize All Modules
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initScrollChrome();
    initMobileNav();
    initNavigationSpy();
    initProjectBubble();
    initPlaceholderLinks();
    initContactForm();
    initScrollReveal();
    initCardGlow();
    initHeroCanvas();
    initAmbientTune();
    initSpotifyLiveSync();
    initFooterYear();
  });
})();
