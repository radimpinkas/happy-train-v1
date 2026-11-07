// ============================================================================
// MINIGAME: HAPPY TRAIN WASH (minigame_wash.js)
// Samostatný modulární soubor pro minihru č. 4 v Zámku tisíce dobrodružství.
// Pravidla:
// - 0 % textových či mluvených komentářů pro děti (pouze animace, výrazy a zvuky)
// - Nevyžaduje 100 % vyčištění (oslava a automatické dočištění už při ~76 %)
// - Maximálně tolerantní ovládání pro Samsung Smart TV ovladač (velký nástroj + magnet)
// - Kultivované zvuky přes existující audio.js (window.audioCtx) s anti-spam limitem
// - Samolepky uložené v localStorage + bezpečné neinvazivní připnutí na 3D playerLoco
// ============================================================================

(function () {
  'use strict';

  var STORAGE_KEY_STICKER = 'happyTrain_washSticker_v1';
  var STORAGE_KEY_SCORE = 'happyTrain_washStars_v1';

  // Barevné varianty mašinek, které postupně přijíždějí do myčky
  var TRAIN_THEMES = [
    { body: '#0d9488', cab: '#0f766e', roof: '#fef3c7', trim: '#eab308', wheel: '#0d9488' }, // Tyrkysový Toby
    { body: '#3b82f6', cab: '#1d4ed8', roof: '#fef08a', trim: '#f59e0b', wheel: '#2563eb' }, // Modrý expres
    { body: '#ec4899', cab: '#be185d', roof: '#fdf2f8', trim: '#facc15', wheel: '#db2777' }, // Růžová pohádková
    { body: '#10b981', cab: '#047857', roof: '#ecfdf5', trim: '#fbbf24', wheel: '#059669' }  // Smaragdová mašinka
  ];

  var STICKER_DEFS = [
    { id: 'star',      color: '#facc15', stroke: '#b45309', bg: '#fef9c3' },
    { id: 'heart',     color: '#f43f5e', stroke: '#9f1239', bg: '#ffe4e6' },
    { id: 'crown',     color: '#fbbf24', stroke: '#92400e', bg: '#fef3c7' },
    { id: 'lightning', color: '#38bdf8', stroke: '#0369a1', bg: '#e0f2fe' }
  ];

  // ==========================================================================
  // 1. KULTIVOVANÉ ZVUKY PŘES EXISTUJÍCÍ AUDIO.JS (ANTI-SPAM THROTTLING)
  // ==========================================================================
  var lastSoundTime = {
    bubble: 0,
    splash: 0,
    polish: 0,
    giggle: 0,
    sneeze: 0,
    sticker: 0,
    step: 0
  };

  function getSharedAudioCtx() {
    if (typeof window.initAudio === 'function') {
      try { window.initAudio(); } catch (e) {}
    }
    if (typeof window.audioCtx !== 'undefined' && window.audioCtx) {
      if (window.audioCtx.state === 'suspended') {
        try { window.audioCtx.resume(); } catch (e2) {}
      }
      return window.audioCtx;
    }
    return null;
  }

  function canPlaySound(key, cooldownMs) {
    var now = performance.now();
    if (now - (lastSoundTime[key] || 0) < cooldownMs) return false;
    lastSoundTime[key] = now;
    return true;
  }

  function playBubblePopSound() {
    if (!canPlaySound('bubble', 190)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      var baseFreq = 420 + Math.random() * 260;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, now + 0.085);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  function playWaterSplashSound() {
    if (!canPlaySound('splash', 220)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var dur = 0.16;
      var bufLen = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buf;

      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950 + Math.random() * 350, now);
      filter.Q.setValueAtTime(1.4, now);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  function playPolishSparkleSound() {
    if (!canPlaySound('polish', 210)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var freqs = [880, 1174.66, 1567.98];
      var f = freqs[Math.floor(Math.random() * freqs.length)];
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.25, now + 0.11);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  function playGentleGiggleSound() {
    if (!canPlaySound('giggle', 1400)) return;
    if (typeof window.playHappyLaugh === 'function') {
      try {
        window.playHappyLaugh();
        return;
      } catch (e) {}
    }
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 587.33, 783.99];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[i], now + i * 0.07);
        gain.gain.setValueAtTime(0.055, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.12);
      }
    } catch (e) {}
  }

  function playChimneySneezeSound() {
    if (!canPlaySound('sneeze', 1600)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(680, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.22);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  function playStickerPopSound() {
    if (!canPlaySound('sticker', 260)) return;
    if (typeof window.playCollectSound === 'function') {
      try {
        window.playCollectSound();
        return;
      } catch (e) {}
    }
  }

  function playStepCompleteChime() {
    if (!canPlaySound('step', 500)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.5];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], now + i * 0.065);
        gain.gain.setValueAtTime(0.065, now + i * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.065);
        osc.stop(now + i * 0.065 + 0.24);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 2. BEZPEČNÉ PŘIPNUTÍ SAMOLEPKY NA 3D MAŠINKU V HLAVNÍM SVĚTĚ (0 ZÁSAHŮ DO MODELS.JS)
  // ==========================================================================
  function drawStickerSymbol2D(ctx, stickerId, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    if (stickerId === 'star') {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = r * 0.14;
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a1 = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        var a2 = a1 + Math.PI / 5;
        if (i === 0) ctx.moveTo(Math.cos(a1) * r, Math.sin(a1) * r);
        else ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
        ctx.lineTo(Math.cos(a2) * r * 0.45, Math.sin(a2) * r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (stickerId === 'heart') {
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = r * 0.14;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.78);
      ctx.bezierCurveTo(-r * 1.15, r * 0.1, -r * 0.95, -r * 0.85, 0, -r * 0.28);
      ctx.bezierCurveTo(r * 0.95, -r * 0.85, r * 1.15, r * 0.1, 0, r * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (stickerId === 'crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = r * 0.14;
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, r * 0.55);
      ctx.lineTo(-r * 0.88, -r * 0.35);
      ctx.lineTo(-r * 0.36, r * 0.08);
      ctx.lineTo(0, -r * 0.65);
      ctx.lineTo(r * 0.36, r * 0.08);
      ctx.lineTo(r * 0.88, -r * 0.35);
      ctx.lineTo(r * 0.78, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (stickerId === 'lightning') {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = r * 0.14;
      ctx.beginPath();
      ctx.moveTo(r * 0.18, -r * 0.88);
      ctx.lineTo(-r * 0.58, r * 0.06);
      ctx.lineTo(-r * 0.04, r * 0.06);
      ctx.lineTo(-r * 0.24, r * 0.88);
      ctx.lineTo(r * 0.58, -r * 0.08);
      ctx.lineTo(r * 0.06, -r * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function applyStickerTo3DPlayerLoco(stickerId) {
    try {
      if (window.localStorage) {
        if (stickerId) window.localStorage.setItem(STORAGE_KEY_STICKER, stickerId);
      }
    } catch (e) {}

    if (!window.THREE || !window.playerLoco) return;
    try {
      var THREE = window.THREE;
      var existing = window.playerLoco.getObjectByName('happyTrainWashStickerGroup');
      if (existing) {
        window.playerLoco.remove(existing);
      }
      if (!stickerId) return;

      var c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      var ctx = c.getContext('2d');

      // Kulatý bílý podklad samolepky se zlatým okrajem
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#eab308';
      ctx.stroke();

      drawStickerSymbol2D(ctx, stickerId, 64, 64, 38);

      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      var mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        roughness: 0.2
      });

      var group = new THREE.Group();
      group.name = 'happyTrainWashStickerGroup';

      var geo = new THREE.PlaneGeometry(0.95, 0.95);
      var leftBadge = new THREE.Mesh(geo, mat);
      leftBadge.position.set(-2.03, 2.95, -2.35);
      leftBadge.rotation.y = -Math.PI / 2;

      var rightBadge = new THREE.Mesh(geo, mat);
      rightBadge.position.set(2.03, 2.95, -2.35);
      rightBadge.rotation.y = Math.PI / 2;

      group.add(leftBadge, rightBadge);
      window.playerLoco.add(group);
    } catch (e) {}
  }

  // Při načtení skriptu obnovíme poslední vybranou samolepku na 3D mašinku
  setTimeout(function () {
    try {
      var savedSticker = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_STICKER) : null;
      if (savedSticker) applyStickerTo3DPlayerLoco(savedSticker);
    } catch (e) {}
  }, 900);

  // ==========================================================================
  // 3. STAV A LOGIKA MINIHRY HAPPY TRAIN WASH
  // ==========================================================================
  function createHappyTrainWashMinigame() {
    var state = null;
    var hudCallbacks = null;

    function loadSavedScore() {
      try {
        var raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_SCORE) : null;
        var n = parseInt(raw, 10);
        return isFinite(n) && n >= 0 ? n : 0;
      } catch (e) {
        return 0;
      }
    }

    function saveScore(val) {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_SCORE, String(val));
        }
      } catch (e) {}
    }

    function loadSavedSticker() {
      try {
        var s = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_STICKER) : null;
        return s || 'star';
      } catch (e) {
        return 'star';
      }
    }

    function buildDirtSpots() {
      // 7 velkých, vtipných skvrn rozmístěných po mašince v normalizovaných souřadnicích vůči středu mašinky
      return [
        { id: 0, kind: 'mud',      relX: -0.22, relY: -0.02, radius: 0.11, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 1, kind: 'icecream', relX: -0.24, relY: -0.25, radius: 0.10, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 2, kind: 'mud',      relX:  0.02, relY:  0.04, radius: 0.12, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 3, kind: 'leaf',     relX:  0.24, relY: -0.02, radius: 0.10, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 4, kind: 'ladybug',  relX:  0.20, relY: -0.29, radius: 0.09, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 5, kind: 'mud',      relX: -0.14, relY:  0.21, radius: 0.10, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 },
        { id: 6, kind: 'jam',      relX:  0.14, relY:  0.21, radius: 0.10, dirt: 1.0, foam: 0.0, shine: 0.0, wobble: 0 }
      ];
    }

    function setupNewTrainRound(keepThemeIdx) {
      var nextThemeIdx = typeof keepThemeIdx === 'number'
        ? keepThemeIdx
        : ((state ? state.themeIdx + 1 : 0) % TRAIN_THEMES.length);

      state.themeIdx = nextThemeIdx;
      state.step = 0; // 0 = Houba (Mydlení), 1 = Sprcha (Oplach), 2 = Leštění + Samolepky
      state.celebrating = false;
      state.celebrateTimer = 0;
      state.trainEnterAnim = 0; // 0 -> 1 příjezd mašinky zleva
      state.trainExitAnim = 0;
      state.isExiting = false;
      state.spots = buildDirtSpots();
      state.bubbles = [];
      state.waterDrops = [];
      state.sparkles = [];
      state.confetti = [];
      state.chimneyBubbles = [];
      state.giggleTimer = 0;
      state.sneezeTimer = 0;
      state.jumpOffset = 0;
      state.jumpVel = 0;
      state.idleHintTimer = 0;
      state.dockFocusIdx = 0; // 0..3 = samolepky, 4 = Další mašinka (aktivní ve kroku 2 / při oslavě)

      // Výchozí pozice nástroje přímo na první skvrně
      state.toolNormX = 0.42;
      state.toolNormY = 0.46;
      state.targetToolNormX = 0.42;
      state.targetToolNormY = 0.46;
      state.toolActionPulse = 0;
    }

    function updateHudScore() {
      if (hudCallbacks && typeof hudCallbacks.setScoreText === 'function') {
        hudCallbacks.setScoreText('⭐ ' + state.stars);
      }
    }

    // Spočítá postup v aktuálním kroku (0..1). Práh pro splnění je ~0.76 (nevyžaduje 100 %!)
    function computeStepProgress() {
      if (!state || !state.spots || state.spots.length === 0) return 0;
      var sum = 0;
      var n = state.spots.length;
      for (var i = 0; i < n; i++) {
        var sp = state.spots[i];
        if (state.step === 0) {
          sum += (1 - sp.dirt);
        } else if (state.step === 1) {
          var cleanedFoam = sp.dirt <= 0.15 ? (1 - sp.foam) : 0;
          sum += Math.max(0, Math.min(1, cleanedFoam));
        } else {
          sum += sp.shine;
        }
      }
      return sum / n;
    }

    function spawnSparkleBurst(normX, normY, count) {
      for (var i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var spd = 0.08 + Math.random() * 0.22;
        state.sparkles.push({
          x: normX,
          y: normY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.06,
          size: 8 + Math.random() * 12,
          color: ['#facc15', '#38bdf8', '#f472b6', '#4ade80', '#ffffff'][i % 5],
          life: 1.0
        });
      }
    }

    function spawnConfettiExplosion() {
      var colors = ['#facc15', '#38bdf8', '#f43f5e', '#4ade80', '#a855f7', '#fb923c'];
      for (var i = 0; i < 65; i++) {
        state.confetti.push({
          x: 0.15 + Math.random() * 0.7,
          y: 0.12 + Math.random() * 0.25,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -0.18 - Math.random() * 0.25,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 8,
          w: 9 + Math.random() * 8,
          h: 6 + Math.random() * 6,
          color: colors[i % colors.length],
          life: 1.0
        });
      }
    }

    function triggerChimneyBubbleSneeze() {
      state.sneezeTimer = 0.65;
      playChimneySneezeSound();
      for (var i = 0; i < 14; i++) {
        state.chimneyBubbles.push({
          x: 0.61 + (Math.random() - 0.5) * 0.04,
          y: 0.24,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.18 - Math.random() * 0.22,
          r: 9 + Math.random() * 14,
          hue: Math.floor(Math.random() * 360),
          life: 1.0
        });
      }
    }

    // Automatické dočištění zbytku při dosažení ~76 % (aby dítě nemuselo lovit poslední kousek)
    function checkAndAutoAdvanceStep() {
      if (!state || state.isExiting) return;
      var prog = computeStepProgress();

      if (state.step === 0 && prog >= 0.76) {
        // Automaticky proměníme zbylou špínu v pěnu
        for (var i = 0; i < state.spots.length; i++) {
          state.spots[i].dirt = 0;
          state.spots[i].foam = 1.0;
        }
        state.step = 1;
        state.idleHintTimer = 0;
        playStepCompleteChime();
        triggerChimneyBubbleSneeze();
        snapToolToNearestActiveSpot();
      } else if (state.step === 1 && prog >= 0.76) {
        // Automaticky spláchneme zbylou pěnu
        for (var j = 0; j < state.spots.length; j++) {
          state.spots[j].dirt = 0;
          state.spots[j].foam = 0;
          state.spots[j].shine = Math.max(state.spots[j].shine, 0.2);
        }
        state.bubbles = [];
        state.step = 2;
        state.idleHintTimer = 0;
        playStepCompleteChime();
        spawnSparkleBurst(0.5, 0.45, 18);
        snapToolToNearestActiveSpot();
      } else if (state.step === 2 && !state.celebrating && prog >= 0.72) {
        // Automaticky doleštíme mašinku do 100% lesku a spustíme oslavu!
        for (var k = 0; k < state.spots.length; k++) {
          state.spots[k].shine = 1.0;
        }
        triggerCelebration();
      }
    }

    function triggerCelebration() {
      if (state.celebrating) return;
      state.celebrating = true;
      state.celebrateTimer = 0;
      state.jumpVel = -0.42;
      state.stars += 5;
      saveScore(state.stars);
      updateHudScore();
      spawnConfettiExplosion();
      spawnSparkleBurst(0.5, 0.42, 28);
      playStepCompleteChime();
      if (typeof window.playTrainHorn === 'function') {
        try { window.playTrainHorn(); } catch (e) {}
      }
      // Po oslavě zvýrazníme na spodní liště tlačítko Další mašinka (index 4),
      // takže další stisk OK přiveze novou mašinku, nebo šipkami ◀ ▶ lze vybírat samolepky
      state.dockFocusIdx = 4;
    }

    function getSpotNormCoords(sp) {
      return {
        x: 0.5 + sp.relX * 0.78,
        y: 0.47 + sp.relY * 0.68
      };
    }

    function needsWorkInCurrentStep(sp) {
      if (state.step === 0) return sp.dirt > 0.08;
      if (state.step === 1) return sp.foam > 0.08;
      return sp.shine < 0.92;
    }

    function snapToolToNearestActiveSpot() {
      var bestSpot = null;
      var bestDist = 999;
      for (var i = 0; i < state.spots.length; i++) {
        var sp = state.spots[i];
        if (!needsWorkInCurrentStep(sp)) continue;
        var c = getSpotNormCoords(sp);
        var d = Math.hypot(c.x - state.targetToolNormX, c.y - state.targetToolNormY);
        if (d < bestDist) {
          bestDist = d;
          bestSpot = c;
        }
      }
      if (bestSpot) {
        state.targetToolNormX = bestSpot.x;
        state.targetToolNormY = bestSpot.y;
      }
    }

    // Aplikuje aktivní nástroj (Houba / Sprcha / Leštička) v okolí bodu (normX, normY)
    function applyToolAt(normX, normY, powerMultiplier) {
      if (!state || state.isExiting) return;
      state.idleHintTimer = 0;
      var mult = powerMultiplier || 1.0;
      var reach = 0.16 * (mult > 1.2 ? 1.35 : 1.0); // Velmi tolerantní poloměr dosahu
      var anyTouched = false;

      for (var i = 0; i < state.spots.length; i++) {
        var sp = state.spots[i];
        var sc = getSpotNormCoords(sp);
        var dist = Math.hypot(normX - sc.x, normY - sc.y);
        if (dist <= reach) {
          var falloff = Math.max(0.35, 1 - dist / reach);
          if (state.step === 0 && sp.dirt > 0) {
            sp.dirt = Math.max(0, sp.dirt - 0.28 * falloff * mult);
            sp.foam = Math.min(1.0, sp.foam + 0.36 * falloff * mult);
            sp.wobble = 1.0;
            anyTouched = true;
          } else if (state.step === 1 && sp.foam > 0) {
            sp.foam = Math.max(0, sp.foam - 0.32 * falloff * mult);
            sp.wobble = 1.0;
            anyTouched = true;
          } else if (state.step === 2 && sp.shine < 1.0) {
            sp.shine = Math.min(1.0, sp.shine + 0.34 * falloff * mult);
            sp.wobble = 1.0;
            anyTouched = true;
          }
        }
      }

      // Částice a zvuky podle aktivního nástroje
      if (state.step === 0) {
        playBubblePopSound();
        if (anyTouched && Math.random() < 0.28) {
          state.giggleTimer = 0.55;
          playGentleGiggleSound();
        }
        for (var b = 0; b < (mult > 1.2 ? 7 : 3); b++) {
          if (state.bubbles.length < 70) {
            state.bubbles.push({
              x: normX + (Math.random() - 0.5) * 0.11,
              y: normY + (Math.random() - 0.5) * 0.09,
              r: 10 + Math.random() * 16,
              hue: Math.floor(Math.random() * 360),
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      } else if (state.step === 1) {
        playWaterSplashSound();
        // Oplachování praská i okolní volné bubliny
        for (var k = state.bubbles.length - 1; k >= 0; k--) {
          var bub = state.bubbles[k];
          if (Math.hypot(bub.x - normX, bub.y - normY) < reach * 1.2) {
            state.bubbles.splice(k, 1);
          }
        }
        for (var w = 0; w < (mult > 1.2 ? 10 : 5); w++) {
          state.waterDrops.push({
            x: normX + (Math.random() - 0.5) * 0.08,
            y: normY + (Math.random() - 0.5) * 0.06,
            vx: (Math.random() - 0.5) * 0.26,
            vy: -0.10 - Math.random() * 0.16,
            r: 4 + Math.random() * 5,
            life: 1.0
          });
        }
      } else {
        playPolishSparkleSound();
        spawnSparkleBurst(normX, normY, mult > 1.2 ? 9 : 4);
      }

      checkAndAutoAdvanceStep();
    }

    // Pohyb šipkami na Samsung TV ovladači s magnetickým přitahováním k nejbližší špíně
    function moveToolByDirection(dx, dy) {
      if (!state || state.isExiting) return;
      state.idleHintTimer = 0;

      // Pokud už probíhá oslava, šipky ◀ ▶ přepínají samolepky a tlačítko Další mašinka
      if (state.celebrating && dy === 0 && dx !== 0) {
        state.dockFocusIdx = (state.dockFocusIdx + (dx > 0 ? 1 : -1) + 5) % 5;
        if (state.dockFocusIdx < 4) {
          var chosen = STICKER_DEFS[state.dockFocusIdx].id;
          state.activeSticker = chosen;
          state.stickerBounce = 1.0;
          applyStickerTo3DPlayerLoco(chosen);
          playStickerPopSound();
          spawnSparkleBurst(0.38, 0.50, 10);
        } else {
          playPolishSparkleSound();
        }
        return;
      }

      // Hledáme nejbližší aktivní skvrnu ve směru šipky (Soft-Magnet Assist)
      var bestSpot = null;
      var bestScore = 999;
      for (var i = 0; i < state.spots.length; i++) {
        var sp = state.spots[i];
        if (!needsWorkInCurrentStep(sp)) continue;
        var sc = getSpotNormCoords(sp);
        var vx = sc.x - state.targetToolNormX;
        var vy = sc.y - state.targetToolNormY;
        var dist = Math.hypot(vx, vy);
        if (dist < 0.02) continue;
        var dot = (vx * dx + vy * dy) / dist;
        if (dot > 0.15) {
          var score = dist / (dot + 0.35);
          if (score < bestScore) {
            bestScore = score;
            bestSpot = sc;
          }
        }
      }

      if (bestSpot) {
        state.targetToolNormX = bestSpot.x;
        state.targetToolNormY = bestSpot.y;
      } else {
        state.targetToolNormX = Math.max(0.24, Math.min(0.76, state.targetToolNormX + dx * 0.12));
        state.targetToolNormY = Math.max(0.24, Math.min(0.66, state.targetToolNormY + dy * 0.11));
      }

      state.toolActionPulse = 1.0;
      applyToolAt(state.targetToolNormX, state.targetToolNormY, 1.35);
    }

    function triggerConfirmAction() {
      if (!state || state.isExiting) return;
      state.idleHintTimer = 0;

      // Pokud jsme v režimu oslavy a je vybrané tlačítko Další mašinka (dockFocusIdx === 4), přivezeme další mašinku
      if (state.celebrating) {
        if (state.dockFocusIdx === 4) {
          state.isExiting = true;
          state.trainExitAnim = 0;
          if (typeof window.playTrainHorn === 'function') {
            try { window.playTrainHorn(); } catch (e) {}
          }
          return;
        } else {
          var stId = STICKER_DEFS[state.dockFocusIdx].id;
          state.activeSticker = stId;
          state.stickerBounce = 1.0;
          applyStickerTo3DPlayerLoco(stId);
          playStickerPopSound();
          spawnSparkleBurst(0.38, 0.50, 12);
          state.dockFocusIdx = 4; // Po nalepení přesuneme fokus na tlačítko Další mašinka
          return;
        }
      }

      // Během mytí udělá stisk OK velký plošný šplouch na aktuální skvrně a posune nástroj na další!
      state.toolActionPulse = 1.0;
      applyToolAt(state.targetToolNormX, state.targetToolNormY, 1.85);
      snapToolToNearestActiveSpot();
    }

    // Kliknutí / dotyk na spodní lištu nástrojů a samolepek
    function handleDockPointerDown(normX, normY) {
      if (normY < 0.78) return false;

      // 3 nástroje vlevo (x: 0.08 .. 0.44)
      for (var t = 0; t < 3; t++) {
        var tx = 0.13 + t * 0.11;
        if (Math.abs(normX - tx) < 0.052) {
          state.step = t;
          state.idleHintTimer = 0;
          playPolishSparkleSound();
          snapToolToNearestActiveSpot();
          return true;
        }
      }

      // 4 samolepky uprostřed/vpravo (x: 0.48 .. 0.78)
      for (var s = 0; s < STICKER_DEFS.length; s++) {
        var sx = 0.51 + s * 0.082;
        if (Math.abs(normX - sx) < 0.038) {
          var chosenId = STICKER_DEFS[s].id;
          state.activeSticker = chosenId;
          state.stickerBounce = 1.0;
          state.dockFocusIdx = s;
          applyStickerTo3DPlayerLoco(chosenId);
          playStickerPopSound();
          spawnSparkleBurst(0.38, 0.50, 12);
          return true;
        }
      }

      // Tlačítko Další mašinka zcela vpravo (x: 0.87)
      if (normX >= 0.81 && normX <= 0.95) {
        state.isExiting = true;
        state.trainExitAnim = 0;
        if (typeof window.playTrainHorn === 'function') {
          try { window.playTrainHorn(); } catch (e) {}
        }
        return true;
      }

      return false;
    }

    // ========================================================================
    // 4. VYKRESLOVÁNÍ (2D CANVAS — ŽÁDNÝ TEXT, ČISTÁ VIZUÁLNÍ POHÁDKA)
    // ========================================================================
    function drawRoundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function drawLocomotive2D(ctx, cx, cy, scale, theme) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Stín pod mašinkou
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 148, 250, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Zadní kabina strojvedoucího
      ctx.fillStyle = theme.cab;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -210, -135, 165, 215, 20);
      ctx.fill();
      ctx.stroke();

      // Střecha kabiny
      ctx.fillStyle = theme.roof;
      drawRoundedRect(ctx, -225, -155, 195, 32, 14);
      ctx.fill();
      ctx.stroke();

      // Okno kabiny
      var winGrad = ctx.createLinearGradient(-180, -105, -180, -25);
      winGrad.addColorStop(0, '#bae6fd');
      winGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = winGrad;
      ctx.strokeStyle = theme.trim;
      ctx.lineWidth = 6;
      drawRoundedRect(ctx, -182, -105, 110, 78, 14);
      ctx.fill();
      ctx.stroke();

      // Hlavní válcový kotel mašinky
      ctx.fillStyle = theme.body;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -60, -85, 245, 165, 28);
      ctx.fill();
      ctx.stroke();

      // Zlaté ozdobné pruhy na kotli
      ctx.fillStyle = theme.trim;
      ctx.fillRect(5, -83, 18, 161);
      ctx.fillRect(95, -83, 18, 161);

      // Komín s veselým zlatým lemem (při pšiknutí se nafoukne)
      var sneezeScale = state.sneezeTimer > 0 ? 1 + Math.sin(state.sneezeTimer * 18) * 0.16 : 1;
      ctx.save();
      ctx.translate(125, -85);
      ctx.scale(sneezeScale, 2 - sneezeScale);
      ctx.fillStyle = theme.cab;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -26, -78, 52, 78, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.trim;
      drawRoundedRect(ctx, -34, -92, 68, 22, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Parní dóm na kotli
      ctx.fillStyle = theme.trim;
      ctx.beginPath();
      ctx.arc(48, -85, 34, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Spodní zlato-červený rám a pluh (cowcatcher)
      ctx.fillStyle = '#ef4444';
      drawRoundedRect(ctx, -225, 68, 435, 32, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.trim;
      ctx.beginPath();
      ctx.moveTo(195, 68);
      ctx.lineTo(255, 112);
      ctx.lineTo(195, 112);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3 velká pohádková kola
      var wheelXs = [-135, -5, 120];
      for (var w = 0; w < wheelXs.length; w++) {
        var wx = wheelXs[w];
        var wy = 112;
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(state.time * 1.4);

        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.wheel;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = theme.trim;
        ctx.lineWidth = 4;
        for (var sp = 0; sp < 4; sp++) {
          var a = (sp * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * -28, Math.sin(a) * -28);
          ctx.lineTo(Math.cos(a) * 28, Math.sin(a) * 28);
          ctx.stroke();
        }

        ctx.fillStyle = theme.trim;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Samolepka na boku kabiny (s pružinovým efektem)
      if (state.activeSticker) {
        var sb = 1 + Math.sin(state.stickerBounce * Math.PI) * 0.38;
        ctx.save();
        ctx.translate(-128, 18);
        ctx.scale(sb, sb);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerSymbol2D(ctx, state.activeSticker, 0, 0, 21);
        ctx.restore();
      }

      // Velký kreslený obličej mašinky vpředu vpravo
      ctx.save();
      ctx.translate(182, -4);
      ctx.fillStyle = '#fde6c4';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Růžové tvářičky
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(-28, 18, 14, 0, Math.PI * 2);
      ctx.arc(32, 18, 14, 0, Math.PI * 2);
      ctx.fill();

      // Oči sledující aktivní nástroj (nebo přivřené smíchy při lechtání houbou)
      var lookDx = Math.max(-6, Math.min(6, (state.toolNormX - 0.62) * 24));
      var lookDy = Math.max(-5, Math.min(5, (state.toolNormY - 0.45) * 24));
      var isLaughing = state.giggleTimer > 0 || state.celebrating;

      [-18, 22].forEach(function (ex) {
        if (isLaughing && Math.sin(state.time * 16) > -0.2) {
          // Veselé obloučky smějících se očí
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(ex, -14, 13, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(ex, -14, 14, 17, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(ex + lookDx * 0.6, -14 + lookDy * 0.6, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(ex + lookDx * 0.7, -14 + lookDy * 0.7, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex + lookDx * 0.4 - 3, -18, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Úsměv podle čistoty (zamazaná mašinka vyplazuje jazýček, umytá se široce směje)
      var totalDirt = 0;
      for (var d = 0; d < state.spots.length; d++) totalDirt += state.spots[d].dirt;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      if (totalDirt > 4.2 && state.giggleTimer <= 0) {
        // Komický výraz s vyplazeným jazýčkem na špínu
        ctx.beginPath();
        ctx.arc(2, 20, 18, 0.15, Math.PI - 0.15);
        ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(10, 31, 9, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Široký šťastný úsměv
        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(2, 16, 22, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(2, 28, 12, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    }

    function drawDirtAndFoamOnTrain(ctx, w, h) {
      for (var i = 0; i < state.spots.length; i++) {
        var sp = state.spots[i];
        var sc = getSpotNormCoords(sp);
        var px = sc.x * w + state.trainOffsetPx;
        var py = sc.y * h + state.jumpOffset * h;
        var baseR = Math.min(w, h) * sp.radius;
        var wob = sp.wobble > 0 ? 1 + Math.sin(state.time * 28) * 0.12 * sp.wobble : 1;

        // 1. Špína (Bláto, Zmrzlina, List, Beruška, Marmeláda)
        if (sp.dirt > 0.03) {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(sp.dirt * wob, sp.dirt * wob);
          if (sp.kind === 'icecream') {
            // Spadlý kornoutek s jahodovou zmrzlinou
            ctx.fillStyle = '#f472b6';
            ctx.strokeStyle = '#9d174d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 4, baseR * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.moveTo(-baseR * 0.35, -4);
            ctx.lineTo(baseR * 0.1, -baseR * 0.85);
            ctx.lineTo(baseR * 0.42, 2);
            ctx.closePath();
            ctx.fill();
          } else if (sp.kind === 'leaf') {
            // Barevný podzimní lístek
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, baseR * 0.62, baseR * 0.38, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (sp.kind === 'ladybug') {
            // Roztomilá usměvavá beruška
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, baseR * 0.48, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-8, -5, 4, 0, Math.PI * 2);
            ctx.arc(7, -4, 4, 0, Math.PI * 2);
            ctx.arc(0, 7, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Cákance bláta / marmelády
            ctx.fillStyle = sp.kind === 'jam' ? 'rgba(190, 24, 93, 0.88)' : 'rgba(113, 63, 18, 0.88)';
            ctx.strokeStyle = sp.kind === 'jam' ? '#831843' : '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (var b = 0; b < 7; b++) {
              var ang = (b * Math.PI * 2) / 7;
              var br = baseR * (b % 2 === 0 ? 0.62 : 0.42);
              var bx = Math.cos(ang) * baseR * 0.35;
              var by = Math.sin(ang) * baseR * 0.28;
              ctx.moveTo(bx + br, by);
              ctx.arc(bx, by, br, 0, Math.PI * 2);
            }
            ctx.fill();
          }
          ctx.restore();
        }

        // 2. Bohatá mýdlová pěna
        if (sp.foam > 0.03) {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(sp.foam * wob, sp.foam * wob);
          for (var f = 0; f < 6; f++) {
            var fa = (f * Math.PI * 2) / 6 + state.time * 0.6;
            var fx = Math.cos(fa) * baseR * 0.36;
            var fy = Math.sin(fa) * baseR * 0.30;
            var fr = baseR * 0.44;
            ctx.fillStyle = 'rgba(240, 249, 255, 0.92)';
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }

        // 3. Třpytivé hvězdičky na vyleštěném místě
        if (sp.shine > 0.25 && sp.dirt <= 0.05 && sp.foam <= 0.05) {
          var pulse = 0.65 + Math.sin(state.time * 5 + i * 1.3) * 0.35;
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(sp.shine * pulse, sp.shine * pulse);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          for (var s = 0; s < 4; s++) {
            var sa = (s * Math.PI) / 2;
            ctx.lineTo(Math.cos(sa) * 18, Math.sin(sa) * 18);
            ctx.lineTo(Math.cos(sa + Math.PI / 4) * 5, Math.sin(sa + Math.PI / 4) * 5);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    function drawActiveToolCursor(ctx, w, h) {
      var tx = state.toolNormX * w;
      var ty = state.toolNormY * h;
      var pulse = 1 + state.toolActionPulse * 0.25 + Math.sin(state.time * 6) * 0.05;

      // Pokud dítě 2.5 s nic nedělá a ještě neoslavujeme, ukážeme jemnou animovanou šipku k nejbližší skvrně (bez textu!)
      if (!state.celebrating && state.idleHintTimer > 2.2) {
        var nearest = null;
        var bestD = 999;
        for (var i = 0; i < state.spots.length; i++) {
          if (!needsWorkInCurrentStep(state.spots[i])) continue;
          var sc = getSpotNormCoords(state.spots[i]);
          var d = Math.hypot(sc.x - state.toolNormX, sc.y - state.toolNormY);
          if (d < bestD) {
            bestD = d;
            nearest = sc;
          }
        }
        if (nearest) {
          ctx.save();
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
          ctx.lineWidth = 6;
          ctx.setLineDash([12, 10]);
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(nearest.x * w, nearest.y * h);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(pulse, pulse);

      // Jemný kruh dosahu nástroje
      ctx.strokeStyle = state.step === 0
        ? 'rgba(250, 204, 21, 0.55)'
        : state.step === 1
          ? 'rgba(56, 189, 248, 0.55)'
          : 'rgba(244, 114, 182, 0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 54, 0, Math.PI * 2);
      ctx.stroke();

      if (state.step === 0) {
        // Žlutá mýdlová houba s bublinkami
        ctx.rotate(Math.sin(state.time * 8) * 0.14);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 5;
        drawRoundedRect(ctx, -40, -28, 80, 56, 18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(-16, -8, 6, 0, Math.PI * 2);
        ctx.arc(14, -10, 5, 0, Math.PI * 2);
        ctx.arc(2, 10, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (state.step === 1) {
        // Modrá vodní sprcha stříkající kapky
        ctx.rotate(-0.35 + Math.sin(state.time * 7) * 0.08);
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 5;
        drawRoundedRect(ctx, -36, -18, 52, 36, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#bae6fd';
        drawRoundedRect(ctx, 12, -26, 20, 52, 8);
        ctx.fill();
        ctx.stroke();
      } else {
        // Kouzelná hvězdičková leštička
        ctx.rotate(state.time * 1.5);
        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = '#9d174d';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerSymbol2D(ctx, 'star', 0, 0, 24);
      }

      ctx.restore();
    }

    function drawBottomVisualDock(ctx, w, h) {
      var dockY = h * 0.82;
      var dockH = h * 0.15;

      // Poloprůhledný pohádkový panel dole
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, w * 0.05, dockY, w * 0.90, dockH, 26);
      ctx.fill();
      ctx.stroke();

      var cy = dockY + dockH * 0.5;
      var btnR = Math.min(w * 0.042, dockH * 0.38);

      // 1. 3 velké nástroje (Houba, Sprcha, Leštička) + vizuální fajfka po dokončení kroku
      var toolColors = ['#facc15', '#38bdf8', '#f472b6'];
      for (var t = 0; t < 3; t++) {
        var tx = w * (0.13 + t * 0.11);
        var isCurrent = state.step === t && !state.celebrating;
        var isDone = state.step > t || state.celebrating;

        ctx.save();
        ctx.translate(tx, cy);
        if (isCurrent) {
          var s = 1.12 + Math.sin(state.time * 7) * 0.06;
          ctx.scale(s, s);
        }

        ctx.fillStyle = isCurrent ? toolColors[t] : 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = isCurrent ? '#ffffff' : toolColors[t];
        ctx.lineWidth = isCurrent ? 5 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, btnR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Kreslená ikona nástroje (žádný text!)
        if (t === 0) {
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          drawRoundedRect(ctx, -btnR * 0.55, -btnR * 0.38, btnR * 1.1, btnR * 0.76, 8);
          ctx.fill();
          ctx.stroke();
        } else if (t === 1) {
          ctx.fillStyle = '#7dd3fc';
          ctx.beginPath();
          ctx.arc(0, 4, btnR * 0.42, 0, Math.PI * 2);
          ctx.moveTo(0, -btnR * 0.55);
          ctx.lineTo(-btnR * 0.38, 2);
          ctx.lineTo(btnR * 0.38, 2);
          ctx.closePath();
          ctx.fill();
        } else {
          drawStickerSymbol2D(ctx, 'star', 0, 0, btnR * 0.58);
        }

        if (isDone) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(btnR * 0.68, -btnR * 0.68, btnR * 0.34, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(btnR * 0.52, -btnR * 0.68);
          ctx.lineTo(btnR * 0.65, -btnR * 0.54);
          ctx.lineTo(btnR * 0.84, -btnR * 0.80);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. 4 velké samolepky (Hvězda, Srdíčko, Korunka, Blesk)
      for (var st = 0; st < STICKER_DEFS.length; st++) {
        var def = STICKER_DEFS[st];
        var sx = w * (0.51 + st * 0.082);
        var isSelSticker = state.activeSticker === def.id;
        var isTvFocus = state.celebrating && state.dockFocusIdx === st;

        ctx.save();
        ctx.translate(sx, cy);
        if (isSelSticker || isTvFocus) {
          ctx.scale(1.12, 1.12);
        }
        ctx.fillStyle = def.bg;
        ctx.strokeStyle = isTvFocus ? '#facc15' : (isSelSticker ? def.stroke : '#64748b');
        ctx.lineWidth = isTvFocus || isSelSticker ? 5 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, btnR * 0.86, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        drawStickerSymbol2D(ctx, def.id, 0, 0, btnR * 0.54);
        ctx.restore();
      }

      // 3. Velké zelené obrázkové tlačítko "Další mašinka" (🚂 ➡️) vpravo
      var nextX = w * 0.875;
      var nextFocused = state.celebrating && state.dockFocusIdx === 4;
      ctx.save();
      ctx.translate(nextX, cy);
      if (state.celebrating) {
        var ns = 1.08 + Math.sin(state.time * 8) * 0.07;
        ctx.scale(ns, ns);
      }
      ctx.fillStyle = state.celebrating ? '#22c55e' : '#334155';
      ctx.strokeStyle = nextFocused ? '#fef08a' : '#86efac';
      ctx.lineWidth = nextFocused ? 6 : 3;
      drawRoundedRect(ctx, -btnR * 1.25, -btnR * 0.85, btnR * 2.5, btnR * 1.7, 18);
      ctx.fill();
      ctx.stroke();

      // Šipka doprava uvnitř tlačítka Další mašinka
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-btnR * 0.55, -btnR * 0.25);
      ctx.lineTo(btnR * 0.1, -btnR * 0.25);
      ctx.lineTo(btnR * 0.1, -btnR * 0.55);
      ctx.lineTo(btnR * 0.72, 0);
      ctx.lineTo(btnR * 0.1, btnR * 0.55);
      ctx.lineTo(btnR * 0.1, btnR * 0.25);
      ctx.lineTo(-btnR * 0.55, btnR * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    return {
      title: 'Happy Train Wash',

      start: function (options, callbacks) {
        hudCallbacks = callbacks || null;
        state = {
          time: 0,
          stars: loadSavedScore(),
          activeSticker: loadSavedSticker(),
          stickerBounce: 0,
          themeIdx: -1,
          trainOffsetPx: 0,
          isPointerDown: false
        };
        setupNewTrainRound(0);
        updateHudScore();
        applyStickerTo3DPlayerLoco(state.activeSticker);
      },

      onAction: function (action, payload) {
        if (!state) return false;

        if (action === 'LEFT') {
          moveToolByDirection(-1, 0);
          return true;
        }
        if (action === 'RIGHT') {
          moveToolByDirection(1, 0);
          return true;
        }
        if (action === 'UP') {
          moveToolByDirection(0, -1);
          return true;
        }
        if (action === 'DOWN') {
          moveToolByDirection(0, 1);
          return true;
        }
        if (action === 'CONFIRM') {
          triggerConfirmAction();
          return true;
        }

        // Dotyk prstem / kliknutí myší nebo klávesa Space
        if (action === 'JUMP') {
          if (payload && payload.source === 'pointer' && typeof payload.normX === 'number') {
            if (handleDockPointerDown(payload.normX, payload.normY)) {
              return true;
            }
            state.isPointerDown = true;
            state.targetToolNormX = Math.max(0.15, Math.min(0.85, payload.normX));
            state.targetToolNormY = Math.max(0.15, Math.min(0.75, payload.normY));
            state.toolNormX = state.targetToolNormX;
            state.toolNormY = state.targetToolNormY;
            state.toolActionPulse = 1.0;
            applyToolAt(state.toolNormX, state.toolNormY, 1.35);
            return true;
          }
          triggerConfirmAction();
          return true;
        }

        if (action === 'DRAG_MOVE') {
          if (payload && typeof payload.normX === 'number' && payload.normY < 0.78) {
            state.targetToolNormX = Math.max(0.15, Math.min(0.85, payload.normX));
            state.targetToolNormY = Math.max(0.15, Math.min(0.75, payload.normY));
            state.toolNormX = state.targetToolNormX;
            state.toolNormY = state.targetToolNormY;
            applyToolAt(state.toolNormX, state.toolNormY, 0.85);
            return true;
          }
          return false;
        }

        if (action === 'DRAG_END') {
          state.isPointerDown = false;
          return true;
        }

        return false;
      },

      update: function (dt, w, h) {
        if (!state) return;
        state.time += dt;
        state.idleHintTimer += dt;

        // Příjezd a odjezd mašinky
        if (state.isExiting) {
          state.trainExitAnim += dt * 1.8;
          state.trainOffsetPx = state.trainExitAnim * w * 0.95;
          if (state.trainExitAnim >= 1.0) {
            setupNewTrainRound();
          }
          return;
        } else if (state.trainEnterAnim < 1.0) {
          state.trainEnterAnim = Math.min(1.0, state.trainEnterAnim + dt * 2.1);
          var ease = 1 - Math.pow(1 - state.trainEnterAnim, 3);
          state.trainOffsetPx = -(1 - ease) * w * 0.85;
        } else {
          state.trainOffsetPx = 0;
        }

        // Plynulé přiblížení nástroje k cíli
        state.toolNormX += (state.targetToolNormX - state.toolNormX) * Math.min(1, dt * 14);
        state.toolNormY += (state.targetToolNormY - state.toolNormY) * Math.min(1, dt * 14);

        if (state.toolActionPulse > 0) {
          state.toolActionPulse = Math.max(0, state.toolActionPulse - dt * 4.5);
        }
        if (state.stickerBounce > 0) {
          state.stickerBounce = Math.max(0, state.stickerBounce - dt * 3.2);
        }
        if (state.giggleTimer > 0) {
          state.giggleTimer = Math.max(0, state.giggleTimer - dt);
        }
        if (state.sneezeTimer > 0) {
          state.sneezeTimer = Math.max(0, state.sneezeTimer - dt);
        }

        // Radostný výskok mašinky při oslavě
        if (state.jumpOffset < 0 || state.jumpVel !== 0) {
          state.jumpOffset += state.jumpVel * dt;
          state.jumpVel += 1.25 * dt;
          if (state.jumpOffset >= 0) {
            state.jumpOffset = 0;
            state.jumpVel = 0;
          }
        }

        for (var i = 0; i < state.spots.length; i++) {
          if (state.spots[i].wobble > 0) {
            state.spots[i].wobble = Math.max(0, state.spots[i].wobble - dt * 3.5);
          }
        }

        // Aktualizace kapek vody
        for (var wd = state.waterDrops.length - 1; wd >= 0; wd--) {
          var drop = state.waterDrops[wd];
          drop.x += drop.vx * dt;
          drop.y += drop.vy * dt;
          drop.vy += 0.65 * dt;
          drop.life -= dt * 2.2;
          if (drop.life <= 0) state.waterDrops.splice(wd, 1);
        }

        // Aktualizace hvězdiček
        for (var sp = state.sparkles.length - 1; sp >= 0; sp--) {
          var s = state.sparkles[sp];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life -= dt * 1.8;
          if (s.life <= 0) state.sparkles.splice(sp, 1);
        }

        // Aktualizace pšiknutých bublin z komína
        for (var cb = state.chimneyBubbles.length - 1; cb >= 0; cb--) {
          var b = state.chimneyBubbles[cb];
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dt * 0.9;
          if (b.life <= 0) state.chimneyBubbles.splice(cb, 1);
        }

        // Aktualizace konfet při oslavě
        for (var cf = state.confetti.length - 1; cf >= 0; cf--) {
          var c = state.confetti[cf];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.vy += 0.42 * dt;
          c.rot += c.vRot * dt;
          c.life -= dt * 0.45;
          if (c.life <= 0) state.confetti.splice(cf, 1);
        }
      },

      render: function (ctx, w, h) {
        if (!state) return;

        // 1. Slunečné pozadí myčky s duhou
        var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#38bdf8');
        bgGrad.addColorStop(0.62, '#bae6fd');
        bgGrad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Jemná duha na obloze při kroku 2 nebo oslavě
        if (state.step === 2 || state.celebrating) {
          var rainbowColors = ['rgba(244,63,94,0.22)', 'rgba(250,204,21,0.22)', 'rgba(74,222,128,0.22)', 'rgba(56,189,248,0.22)'];
          for (var r = 0; r < rainbowColors.length; r++) {
            ctx.strokeStyle = rainbowColors[r];
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.72, Math.min(w, h) * (0.56 - r * 0.03), Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
          }
        }

        // Podlaha myčky a koleje
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, h * 0.68, w, h * 0.32);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, h * 0.68, w, 12);

        // Kolejové pražce
        ctx.fillStyle = '#78350f';
        for (var tr = 0; tr < 18; tr++) {
          ctx.fillRect((tr / 18) * w, h * 0.695, w * 0.03, 14);
        }
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, h * 0.69, w, 6);

        // Barevná brána myčky v pozadí s rotujícími pěnovými kartáči po stranách
        var archW = Math.min(w * 0.76, 860);
        var archX = (w - archW) * 0.5;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 18;
        drawRoundedRect(ctx, archX, h * 0.12, archW, h * 0.57, 42);
        ctx.stroke();

        // Levý a pravý rotující kartáč myčky
        [archX + 16, archX + archW - 16].forEach(function (bx, idx) {
          ctx.save();
          ctx.translate(bx, h * 0.42);
          ctx.fillStyle = idx === 0 ? '#38bdf8' : '#f472b6';
          for (var k = 0; k < 6; k++) {
            var ky = -90 + k * 34 + Math.sin(state.time * 6 + k) * 4;
            ctx.beginPath();
            ctx.arc(0, ky, 24, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });

        // 2. Hlavní mašinka uprostřed myčky
        var locoScale = Math.min(w / 760, h / 540) * 0.95;
        var locoCx = w * 0.5 + state.trainOffsetPx;
        var locoCy = h * 0.47 + state.jumpOffset * h;
        drawLocomotive2D(ctx, locoCx, locoCy, locoScale, TRAIN_THEMES[state.themeIdx]);

        // 3. Špína, pěna a lesk na mašince
        drawDirtAndFoamOnTrain(ctx, w, h);

        // 4. Volné duhové mýdlové bubliny
        for (var b = 0; b < state.bubbles.length; b++) {
          var bub = state.bubbles[b];
          var bx = bub.x * w + Math.sin(state.time * 3 + bub.phase) * 6;
          var by = bub.y * h + Math.cos(state.time * 2.5 + bub.phase) * 5;
          ctx.save();
          ctx.fillStyle = 'hsla(' + bub.hue + ', 85%, 85%, 0.62)';
          ctx.strokeStyle = 'hsla(' + bub.hue + ', 90%, 65%, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(bx, by, bub.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.beginPath();
          ctx.arc(bx - bub.r * 0.32, by - bub.r * 0.32, bub.r * 0.24, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Bubliny pšiknuté z komína
        for (var cb = 0; cb < state.chimneyBubbles.length; cb++) {
          var chB = state.chimneyBubbles[cb];
          ctx.save();
          ctx.globalAlpha = Math.max(0, chB.life);
          ctx.fillStyle = 'hsla(' + chB.hue + ', 90%, 82%, 0.75)';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(chB.x * w, chB.y * h, chB.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Vodní kapky ze sprchy
        ctx.fillStyle = '#38bdf8';
        for (var wd = 0; wd < state.waterDrops.length; wd++) {
          var drop = state.waterDrops[wd];
          ctx.beginPath();
          ctx.arc(drop.x * w, drop.y * h, drop.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Třpytivé hvězdičky
        for (var sp = 0; sp < state.sparkles.length; sp++) {
          var s = state.sparkles[sp];
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Konfety při oslavě
        for (var cf = 0; cf < state.confetti.length; cf++) {
          var c = state.confetti[cf];
          ctx.save();
          ctx.translate(c.x * w, c.y * h);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
          ctx.restore();
        }

        // 5. Aktivní nástroj (Houba / Sprcha / Leštička)
        if (!state.celebrating) {
          drawActiveToolCursor(ctx, w, h);
        }

        // 6. Spodní obrázkový panel nástrojů, samolepek a tlačítka Další mašinka
        drawBottomVisualDock(ctx, w, h);
      },

      stop: function () {
        state = null;
      }
    };
  }

  function registerWashModule() {
    if (window.HappyTrainMinigames && typeof window.HappyTrainMinigames.register === 'function') {
      window.HappyTrainMinigames.register('train_wash', createHappyTrainWashMinigame());
    }
  }

  registerWashModule();
  window.addEventListener('DOMContentLoaded', registerWashModule);
})();
