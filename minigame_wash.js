// ============================================================================
// MINIGAME: HAPPY TRAIN WASH – KOMPLETNÍ INTERAKTIVNÍ VERZE (minigame_wash.js)
// 4 Fáze:
//   1. SOAP (Houba: přímé mytí tažením prstu/myši, skutečné rozpouštění špíny,
//      organický růst pěny, deformace houby, praskací bubliny, kýchnutí komína)
//   2. WASH (Konvička: proud vody z hubičky reagující na pohyb, vodní cákance,
//      smývání pěny a stékání kapek po povrchu mašinky do mokré vrstvy)
//   3. SHINE (Měkký hadřík: stírání kapek, přechod z matného do zrcadlového
//      lesku, světelné odlesky a třpytky)
//   4. DECORATE (8 veselých nálepek: přetahování prstem/myší kamkoliv na vláček,
//      ukládání do localStorage uvnitř minihry, Slavnostní přehlídka kdykoliv)
// + Podpora ovládání na Samsung Smart TV (šipky + podržení nebo přepnutí OK)
// ============================================================================

(function () {
  'use strict';

  var STORAGE_KEY_STICKERS_V2 = 'happyTrain_washStickers_v2';
  var STORAGE_KEY_SCORE_V2 = 'happyTrain_washStars_v2';

  var TRAIN_THEMES = [
    { body: '#0d9488', bodyDark: '#0f766e', cab: '#0f766e', roof: '#fef3c7', trim: '#eab308', wheel: '#0d9488' },
    { body: '#3b82f6', bodyDark: '#1d4ed8', cab: '#1e40af', roof: '#fef08a', trim: '#f59e0b', wheel: '#2563eb' },
    { body: '#ec4899', bodyDark: '#be185d', cab: '#9d174d', roof: '#fdf2f8', trim: '#facc15', wheel: '#db2777' },
    { body: '#10b981', bodyDark: '#047857', cab: '#065f46', roof: '#ecfdf5', trim: '#fbbf24', wheel: '#059669' }
  ];

  var STICKER_PALETTE = [
    { id: 'star',      bg: '#fef9c3', border: '#eab308' },
    { id: 'heart',     bg: '#ffe4e6', border: '#f43f5e' },
    { id: 'rainbow',   bg: '#e0f2fe', border: '#38bdf8' },
    { id: 'crown',     bg: '#fef3c7', border: '#d97706' },
    { id: 'lightning', bg: '#e0f2fe', border: '#0284c7' },
    { id: 'flower',    bg: '#fce7f3', border: '#ec4899' },
    { id: 'sun',       bg: '#fef08a', border: '#ca8a04' },
    { id: 'ladybug',   bg: '#fee2e2', border: '#ef4444' }
  ];

  // ==========================================================================
  // 1. PŘIROZENÉ ZVUKY PŘES EXISTUJÍCÍ AUDIO.JS (ANTI-SPAM OCHRANA, 0 % ŘEČI)
  // ==========================================================================
  var lastSoundMs = {
    scrub: 0,
    pop: 0,
    water: 0,
    shine: 0,
    sneeze: 0,
    giggle: 0,
    sticker: 0,
    chime: 0
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

  function canPlay(key, cooldownMs) {
    var now = performance.now();
    if (now - (lastSoundMs[key] || 0) < cooldownMs) return false;
    lastSoundMs[key] = now;
    return true;
  }

  function playScrubSpongeSound() {
    if (!canPlay('scrub', 170)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      var f = 340 + Math.random() * 180;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.45, now + 0.09);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  function playBubblePopSound(pitchBoost) {
    if (!canPlay('pop', 95)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      var f = (520 + Math.random() * 260) * (pitchBoost || 1);
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.85, now + 0.075);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  function playWaterPourSound() {
    if (!canPlay('water', 185)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var dur = 0.16;
      var len = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;

      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(880 + Math.random() * 340, now);
      filter.Q.setValueAtTime(1.5, now);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.042, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
    } catch (e) {}
  }

  function playClothShineSound() {
    if (!canPlay('shine', 190)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var freqs = [987.77, 1174.66, 1318.51, 1567.98];
      var f = freqs[Math.floor(Math.random() * freqs.length)];
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.18, now + 0.10);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.048, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  function playChimneySneezeSound() {
    if (!canPlay('sneeze', 1400)) return;
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.linearRampToValueAtTime(720, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.24);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  function playTrainGiggleSound() {
    if (!canPlay('giggle', 1500)) return;
    if (typeof window.playHappyLaugh === 'function') {
      try {
        window.playHappyLaugh();
        return;
      } catch (e) {}
    }
  }

  function playStickerPlaceSound() {
    if (!canPlay('sticker', 180)) return;
    if (typeof window.playCollectSound === 'function') {
      try {
        window.playCollectSound();
        return;
      } catch (e) {}
    }
  }

  function playParadeFanfareSound() {
    if (!canPlay('chime', 600)) return;
    if (typeof window.playTrainHorn === 'function') {
      try { window.playTrainHorn(); } catch (e) {}
    }
    var ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.5];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], now + i * 0.08);
        gain.gain.setValueAtTime(0.055, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      }
    } catch (e) {}
  }

  // Pojistka: Pokud v předchozí verzi existovala testovací 3D nálepka na playerLoco, bezpečně ji odstraníme
  setTimeout(function () {
    try {
      if (window.playerLoco && window.playerLoco.getObjectByName) {
        var oldBadge = window.playerLoco.getObjectByName('happyTrainWashStickerGroup');
        if (oldBadge) window.playerLoco.remove(oldBadge);
      }
    } catch (e) {}
  }, 500);

  // ==========================================================================
  // 2. KRESLENÍ VEKTOROVÝCH SYMBOLŮ NÁLEPEK (8 MOTIVŮ)
  // ==========================================================================
  function drawStickerGraphic(ctx, id, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);

    if (id === 'star') {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = r * 0.12;
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
    } else if (id === 'heart') {
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.78);
      ctx.bezierCurveTo(-r * 1.15, r * 0.1, -r * 0.95, -r * 0.85, 0, -r * 0.28);
      ctx.bezierCurveTo(r * 0.95, -r * 0.85, r * 1.15, r * 0.1, 0, r * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'rainbow') {
      var cols = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#38bdf8'];
      ctx.lineCap = 'round';
      for (var c = 0; c < cols.length; c++) {
        ctx.strokeStyle = cols[c];
        ctx.lineWidth = r * 0.16;
        ctx.beginPath();
        ctx.arc(0, r * 0.35, r * (0.92 - c * 0.15), Math.PI, 0);
        ctx.stroke();
      }
    } else if (id === 'crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, r * 0.55);
      ctx.lineTo(-r * 0.88, -r * 0.35);
      ctx.lineTo(-r * 0.36, r * 0.08);
      ctx.lineTo(0, -r * 0.68);
      ctx.lineTo(r * 0.36, r * 0.08);
      ctx.lineTo(r * 0.88, -r * 0.35);
      ctx.lineTo(r * 0.78, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'lightning') {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = r * 0.12;
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
    } else if (id === 'flower') {
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#be185d';
      ctx.lineWidth = r * 0.08;
      for (var p = 0; p < 6; p++) {
        var pa = (p * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(Math.cos(pa) * r * 0.48, Math.sin(pa) * r * 0.48, r * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'sun') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = r * 0.14;
      for (var sr = 0; sr < 8; sr++) {
        var sa = (sr * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * r * 0.55, Math.sin(sa) * r * 0.55);
        ctx.lineTo(Math.cos(sa) * r * 0.92, Math.sin(sa) * r * 0.92);
        ctx.stroke();
      }
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (id === 'ladybug') {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.arc(0, r * 0.08, r * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.64);
      ctx.lineTo(0, r * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-r * 0.32, -r * 0.05, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.32, -r * 0.05, r * 0.14, 0, Math.PI * 2);
      ctx.arc(-r * 0.24, r * 0.38, r * 0.13, 0, Math.PI * 2);
      ctx.arc(r * 0.24, r * 0.38, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================================================
  // 3. GEOMETRIE POVRCHU MAŠINKY A STAVOVÁ MŘÍŽKA (360 BUNĚK + ORGANICKÉ STOPY)
  // ==========================================================================
  // Lokální souřadnicový systém mašinky: x v [-250..+260], y v [-175..+155]
  function isPointInsideLocomotiveLocal(lx, ly) {
    // Zadní kabina: [-215..-45], [-155..+80]
    if (lx >= -215 && lx <= -45 && ly >= -155 && ly <= 80) return true;
    // Hlavní kotel: [-60..+195], [-88..+80]
    if (lx >= -60 && lx <= 195 && ly >= -88 && ly <= 80) return true;
    // Komín: [+92..+158], [-178..-85]
    if (lx >= 92 && lx <= 158 && ly >= -178 && ly <= -85) return true;
    // Parní dóm: kruh (48, -85), r = 38
    if (Math.hypot(lx - 48, ly - -85) <= 38) return true;
    // Obličej mašinky vpředu: kruh (185, -4), r = 64
    if (Math.hypot(lx - 185, ly - -4) <= 64) return true;
    // Spodní rám a pluh: [-225..+245], [68..112]
    if (lx >= -225 && lx <= 245 && ly >= 68 && ly <= 112) return true;
    // 3 kola: (-135, 112), (-5, 112), (120, 112), r = 46
    if (Math.hypot(lx - -135, ly - 112) <= 46) return true;
    if (Math.hypot(lx - -5, ly - 112) <= 46) return true;
    if (Math.hypot(lx - 120, ly - 112) <= 46) return true;
    return false;
  }

  // Vytvoří mřížku 24 × 15 (360 buněk) filtrovanou přes siluetu mašinky,
  // přičemž každá buňka dostane nepravidelný organický posun (jitter) a shluk pod-bublin,
  // takže pěna ani špína NIKDY netvoří pravidelnou mozaiku koleček!
  function buildTrainSurfaceGrid() {
    var cols = 24;
    var rows = 15;
    var cells = [];
    var gridMap = []; // [row][col] -> cell reference pro rychlé stékání vody dolů

    for (var r = 0; r < rows; r++) {
      gridMap[r] = [];
      for (var c = 0; c < cols; c++) {
        var baseLx = -220 + (c / (cols - 1)) * 455;
        var baseLy = -168 + (r / (rows - 1)) * 315;

        if (!isPointInsideLocomotiveLocal(baseLx, baseLy)) {
          gridMap[r][c] = null;
          continue;
        }

        // Organický posun buňky (eliminuje pravidelný rastr)
        var jx = (Math.sin(r * 7.13 + c * 3.71) * 0.5) * 14;
        var jy = (Math.cos(c * 5.39 + r * 2.93) * 0.5) * 14;
        var lx = baseLx + jx;
        var ly = baseLy + jy;

        var isChimney = (lx >= 85 && lx <= 165 && ly <= -75);
        var isBelly = (lx >= -50 && lx <= 160 && ly >= -55 && ly <= 55);

        // Počáteční špína: nepravidelné cákance bláta, sazí u komína a skvrn (cca 75 % plochy je ušpiněno)
        var wave = Math.sin(lx * 0.032) * Math.cos(ly * 0.038) + Math.sin((lx + ly) * 0.025);
        var initDirt = isChimney ? 0.95 : Math.max(0.22, Math.min(1.0, 0.68 + wave * 0.38));

        // 3 organické pod-tvary pro každou buňku (aby stopy pěny a bláta měly měkký, nepravidelný tvar)
        var subBlobs = [];
        for (var b = 0; b < 3; b++) {
          var ang = (b * Math.PI * 2) / 3 + (r * 1.7 + c * 2.3);
          subBlobs.push({
            ox: Math.cos(ang) * (7 + (b * 3)),
            oy: Math.sin(ang) * (6 + (b * 2.5)),
            rad: 14 + ((r + c + b) % 4) * 3.5,
            hueShift: ((r * 3 + c * 5 + b * 7) % 24) - 12
          });
        }

        var cell = {
          row: r,
          col: c,
          lx: lx,
          ly: ly,
          isChimney: isChimney,
          isBelly: isBelly,
          dirt: initDirt,
           dirtColor: isChimney ? '#334155' : ((r + c) % 5 === 0 ? '#9d174d' : '#713f12'),
          foam: 0.0,
          wet: 0.0,
          shine: 0.0,
          sparklePhase: Math.random() * Math.PI * 2,
          subBlobs: subBlobs
        };

        cells.push(cell);
        gridMap[r][c] = cell;
      }
    }

    return {
      cols: cols,
      rows: rows,
      cells: cells,
      gridMap: gridMap
    };
  }

  // ==========================================================================
  // 4. HLAVNÍ MODUL MINIHRY HAPPY TRAIN WASH
  // ==========================================================================
  function createHappyTrainWashMinigame() {
    var state = null;
    var hudCallbacks = null;

    function loadSavedStars() {
      try {
        var raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_SCORE_V2) : null;
        var n = parseInt(raw, 10);
        return isFinite(n) && n >= 0 ? n : 0;
      } catch (e) {
        return 0;
      }
    }

    function saveStars(val) {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_SCORE_V2, String(val));
        }
      } catch (e) {}
    }

    function loadSavedStickers() {
      try {
        var raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_STICKERS_V2) : null;
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 14);
        }
      } catch (e) {}
      return [];
    }

    function saveStickers(list) {
      try {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY_STICKERS_V2, JSON.stringify(list.slice(0, 14)));
        }
      } catch (e) {}
    }

    function updateScoreBadge() {
      if (hudCallbacks && typeof hudCallbacks.setScoreText === 'function') {
        hudCallbacks.setScoreText('⭐ ' + state.stars);
      }
    }

    function startNewTrain(keepThemeIdx) {
      var grid = buildTrainSurfaceGrid();
      state.surface = grid;
      state.themeIdx = typeof keepThemeIdx === 'number'
        ? keepThemeIdx
        : ((state.themeIdx + 1) % TRAIN_THEMES.length);
      state.toolMode = 0; // 0 = Houba (SOAP), 1 = Konvička (WASH), 2 = Hadřík (SHINE), 3 = Nálepky (DECORATE)
      state.freeBubbles = [];
      state.waterStream = [];
      state.waterSplashes = [];
      state.rivulets = [];
      state.sparkles = [];
      state.confetti = [];
      state.chimneyPuffs = [];
      state.chimneyTickle = 0;
      state.giggleTimer = 0;
      state.sneezeTimer = 0;
      state.paradeTimer = 0;
      state.jumpOffset = 0;
      state.jumpVel = 0;
      state.trainEnterAnim = 0;
      state.trainExitAnim = 0;
      state.isExitingTrain = false;
      state.tvToolActive = false;
      state.tvInDock = false;
      state.tvCarryingStickerId = null;
    }

    // Převod mezi obrazovkovými normalizovanými souřadnicemi (0..1) a lokálními souřadnicemi mašinky
    function getTrainTransform(w, h) {
      var scale = Math.min(w / 690, h / 480) * 1.02;
      var cx = w * 0.5 + (state ? state.trainOffsetPx : 0);
      var cy = h * 0.44 + (state ? state.jumpOffset * h : 0);
      return { cx: cx, cy: cy, scale: scale };
    }

    function normToTrainLocal(normX, normY, w, h) {
      var tr = getTrainTransform(w, h);
      return {
        lx: (normX * w - tr.cx) / tr.scale,
        ly: (normY * h - tr.cy) / tr.scale
      };
    }

    function trainLocalToScreen(lx, ly, w, h) {
      var tr = getTrainTransform(w, h);
      return {
        x: tr.cx + lx * tr.scale,
        y: tr.cy + ly * tr.scale,
        scale: tr.scale
      };
    }

    // Výpočet postupu jednotlivých fází pro jemné zvýraznění dalšího doporučeného nástroje (bez nuceného přepnutí!)
    function computePhaseMetrics() {
      var cells = state.surface.cells;
      var n = cells.length || 1;
      var dirtSum = 0;
      var foamSum = 0;
      var wetSum = 0;
      var shineSum = 0;
      for (var i = 0; i < n; i++) {
        var c = cells[i];
        dirtSum += c.dirt;
        foamSum += c.foam;
        wetSum += c.wet;
        shineSum += c.shine;
      }
      return {
        avgDirt: dirtSum / n,
        avgFoam: foamSum / n,
        avgWet: wetSum / n,
        avgShine: shineSum / n
      };
    }

    function getRecommendedNextTool(metrics) {
      if (metrics.avgDirt > 0.28 && metrics.avgFoam < 0.35) return 0; // Doporučena Houba
      if (metrics.avgFoam >= 0.25 || metrics.avgDirt > 0.18) return 1; // Doporučena Konvička
      if (metrics.avgWet > 0.12 || metrics.avgShine < 0.45) return 2; // Doporučen Hadřík
      return 3; // Doporučeno Zdobení nálepkami
    }

    // Prasknutí volné bubliny dotykem nebo přejetím
    function tryPopFreeBubbleAt(normX, normY, radiusNorm) {
      var hitR = radiusNorm || 0.055;
      var poppedAny = false;
      for (var i = state.freeBubbles.length - 1; i >= 0; i--) {
        var b = state.freeBubbles[i];
        if (Math.hypot(b.x - normX, b.y - normY) <= hitR + b.rNorm) {
          // Rozprsknutí bubliny na malé kapičky
          for (var d = 0; d < 5; d++) {
            var a = (d * Math.PI * 2) / 5;
            state.waterSplashes.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(a) * 0.14,
              vy: Math.sin(a) * 0.14 - 0.04,
              r: 3.5,
              color: 'hsla(' + b.hue + ', 90%, 75%, 0.9)',
              life: 0.45
            });
          }
          state.freeBubbles.splice(i, 1);
          poppedAny = true;
        }
      }
      if (poppedAny) {
        playBubblePopSound(1.25);
      }
      return poppedAny;
    }

    function triggerChimneySneeze() {
      state.sneezeTimer = 0.7;
      state.chimneyTickle = 0;
      playChimneySneezeSound();

      var w = window.innerWidth || 1280;
      var h = window.innerHeight || 720;
      var sp = trainLocalToScreen(125, -165, w, h);
      var nx = sp.x / w;
      var ny = sp.y / h;

      // Obláčky pěny z komína
      for (var p = 0; p < 8; p++) {
        state.chimneyPuffs.push({
          x: nx + (Math.random() - 0.5) * 0.04,
          y: ny,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.16 - Math.random() * 0.22,
          r: 16 + Math.random() * 18,
          life: 1.0
        });
      }
      // Volné praskací bubliny z komína
      for (var b = 0; b < 8; b++) {
        if (state.freeBubbles.length < 45) {
          state.freeBubbles.push({
            x: nx + (Math.random() - 0.5) * 0.06,
            y: ny,
            vx: (Math.random() - 0.5) * 0.18,
            vy: -0.08 - Math.random() * 0.14,
            r: 14 + Math.random() * 14,
            rNorm: 0.022,
            hue: Math.floor(Math.random() * 360),
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    function spawnParadeCelebration() {
      state.paradeTimer = 2.6;
      state.jumpVel = -0.38;
      state.stars += 3;
      saveStars(state.stars);
      updateScoreBadge();
      playParadeFanfareSound();

      var colors = ['#facc15', '#38bdf8', '#f43f5e', '#4ade80', '#a855f7', '#fb923c'];
      for (var i = 0; i < 55; i++) {
        state.confetti.push({
          x: 0.18 + Math.random() * 0.64,
          y: 0.15 + Math.random() * 0.25,
          vx: (Math.random() - 0.5) * 0.42,
          vy: -0.18 - Math.random() * 0.24,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 8,
          w: 9 + Math.random() * 7,
          h: 6 + Math.random() * 5,
          color: colors[i % colors.length],
          life: 1.0
        });
      }
    }

    // Aplikace aktivního nástroje (Houba / Konvička / Hadřík) v jednom bodě stopy
    function applyToolStepAtNorm(normX, normY, w, h, strength) {
      if (!state || state.isExitingTrain) return;
      var loc = normToTrainLocal(normX, normY, w, h);
      var lx = loc.lx;
      var ly = loc.ly;
      var cells = state.surface.cells;
      var reachLocal = 54; // Dosah nástroje v lokálních souřadnicích mašinky
      var touchedCells = 0;
      var touchedChimney = false;
      var touchedBelly = false;

      if (state.toolMode === 0) {
        // FÁZE 1: SOAP (Mytí houbou — skutečně odstraňuje špínu a vytváří pěnu)
        for (var i = 0; i < cells.length; i++) {
          var c = cells[i];
          var d = Math.hypot(c.lx - lx, c.ly - ly);
          if (d <= reachLocal) {
            var wgt = Math.max(0.25, 1 - d / reachLocal) * strength;
            // Skutečné rozpouštění špíny drhnutím
            c.dirt = Math.max(0, c.dirt - 0.26 * wgt);
            // Viditelný nárůst pěny v místě tahu
            c.foam = Math.min(1.0, c.foam + 0.34 * wgt);
            // Pod pěnou povrch zvlhne a ztratí starý suchý lesk
            c.wet = Math.min(0.6, c.wet + 0.15 * wgt);
            c.shine = Math.max(0, c.shine - 0.2 * wgt);
            touchedCells++;
            if (c.isChimney) touchedChimney = true;
            if (c.isBelly) touchedBelly = true;
          }
        }

        if (touchedCells > 0) {
          playScrubSpongeSound();
          if (touchedChimney) {
            state.chimneyTickle += 0.22 * strength;
            if (state.chimneyTickle >= 1.0 && state.sneezeTimer <= 0) {
              triggerChimneySneeze();
            }
          }
          if (touchedBelly && Math.random() < 0.14) {
            state.giggleTimer = 0.55;
            playTrainGiggleSound();
          }
          // Uvolňování praskacích bublin při mytí
          if (Math.random() < 0.42 && state.freeBubbles.length < 45) {
            state.freeBubbles.push({
              x: normX + (Math.random() - 0.5) * 0.05,
              y: normY + (Math.random() - 0.5) * 0.04,
              vx: (Math.random() - 0.5) * 0.07,
              vy: -0.04 - Math.random() * 0.07,
              r: 12 + Math.random() * 14,
              rNorm: 0.022,
              hue: Math.floor(Math.random() * 360),
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      } else if (state.toolMode === 1) {
        // FÁZE 2: WASH (Oplachování konvičkou — proud vody dopadá do bodu (lx, ly))
        for (var j = 0; j < cells.length; j++) {
          var cw = cells[j];
          var dw = Math.hypot(cw.lx - lx, cw.ly - ly);
          if (dw <= reachLocal * 1.08) {
            var ww = Math.max(0.3, 1 - dw / (reachLocal * 1.08)) * strength;
            // Voda smývá pěnu i případnou zbylou špínu a zanechává mokrý povrch
            cw.foam = Math.max(0, cw.foam - 0.38 * ww);
            cw.dirt = Math.max(0, cw.dirt - 0.22 * ww);
            cw.wet = Math.min(1.0, cw.wet + 0.45 * ww);
            touchedCells++;

            // Spuštění stékajícího pramínku (rivulet) dolů po povrchu mašinky
            if (Math.random() < 0.22 && state.rivulets.length < 36) {
              state.rivulets.push({
                lx: cw.lx + (Math.random() - 0.5) * 10,
                ly: cw.ly,
                vy: 135 + Math.random() * 65,
                row: cw.row,
                col: cw.col,
                life: 0.85
              });
            }
          }
        }

        playWaterPourSound();
        // Vodní cákanec v místě dopadu proudu
        if (touchedCells > 0 && state.waterSplashes.length < 55) {
          for (var sp = 0; sp < 3; sp++) {
            var sa = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
            state.waterSplashes.push({
              x: normX,
              y: normY,
              vx: Math.cos(sa) * (0.08 + Math.random() * 0.12),
              vy: Math.sin(sa) * (0.08 + Math.random() * 0.12),
              r: 3 + Math.random() * 3.5,
              color: '#38bdf8',
              life: 0.38
            });
          }
        }
      } else if (state.toolMode === 2) {
        // FÁZE 3: SHINE (Leštění měkkým hadříkem — suší vodu a leští čistý lak)
        for (var k = 0; k < cells.length; k++) {
          var cs = cells[k];
          var ds = Math.hypot(cs.lx - lx, cs.ly - ly);
          if (ds <= reachLocal * 1.05) {
            var ws = Math.max(0.3, 1 - ds / (reachLocal * 1.05)) * strength;
            // Hadřík stírá vodní kapky a případné zbytky pěny
            cs.wet = Math.max(0, cs.wet - 0.42 * ws);
            cs.foam = Math.max(0, cs.foam - 0.25 * ws);
            cs.dirt = Math.max(0, cs.dirt - 0.08 * ws);
            // Na čistém povrchu roste zrcadlový lesk
            if (cs.dirt < 0.25 && cs.foam < 0.2) {
              cs.shine = Math.min(1.0, cs.shine + 0.36 * ws);
              touchedCells++;
            }
          }
        }

        if (touchedCells > 0) {
          playClothShineSound();
          if (Math.random() < 0.25) {
            state.giggleTimer = 0.4;
          }
          if (Math.random() < 0.45 && state.sparkles.length < 35) {
            state.sparkles.push({
              x: normX + (Math.random() - 0.5) * 0.06,
              y: normY + (Math.random() - 0.5) * 0.05,
              vx: (Math.random() - 0.5) * 0.06,
              vy: -0.05 - Math.random() * 0.06,
              size: 9 + Math.random() * 10,
              color: ['#fef08a', '#ffffff', '#38bdf8', '#f472b6'][Math.floor(Math.random() * 4)],
              life: 0.75
            });
          }
        }
      }
    }

    // Souvislá interpolace stopy mezi předchozím a novým bodem tahu (žádné vynechané mezery při rychlém tahu!)
    function applyInterpolatedStroke(x0, y0, x1, y1, w, h, strength) {
      var dist = Math.hypot(x1 - x0, y1 - y0);
      var stepLen = 0.014;
      var steps = Math.max(1, Math.min(18, Math.ceil(dist / stepLen)));
      for (var s = 1; s <= steps; s++) {
        var t = s / steps;
        var ix = x0 + (x1 - x0) * t;
        var iy = y0 + (y1 - y0) * t;
        applyToolStepAtNorm(ix, iy, w, h, strength / Math.sqrt(steps));
        if (state.toolMode === 0 || state.toolMode === 1) {
          tryPopFreeBubbleAt(ix, iy, 0.045);
        }
      }
    }

    // ========================================================================
    // 5. INTERAKCE SE SPODNÍ LIŠTOU A DRAG & DROP NÁLEPEK
    // ========================================================================
    function getDockLayout(w, h) {
      var dockY = h * 0.80;
      var dockH = h * 0.17;
      var cy = dockY + dockH * 0.5;

      // 4 hlavní nástroje vlevo: Houba (0), Konvička (1), Hadřík (2), Nálepky (3)
      var tools = [
        { mode: 0, nx: 0.11, ny: cy / h },
        { mode: 1, nx: 0.20, ny: cy / h },
        { mode: 2, nx: 0.29, ny: cy / h },
        { mode: 3, nx: 0.38, ny: cy / h }
      ];

      // 8 nálepek uprostřed + tlačítko Smazat poslední nálepku
      var stickers = [];
      for (var i = 0; i < STICKER_PALETTE.length; i++) {
        var row = i < 4 ? 0 : 1;
        var col = i % 4;
        stickers.push({
          id: STICKER_PALETTE[i].id,
          nx: 0.48 + col * 0.058,
          ny: (dockY + dockH * (row === 0 ? 0.30 : 0.72)) / h
        });
      }
      var trashBtn = { nx: 0.725, ny: cy / h };

      // Slavnostní přehlídka (🎺✨) a Další mašinka (🚂🔄) vpravo
      var paradeBtn = { nx: 0.815, ny: cy / h };
      var nextTrainBtn = { nx: 0.905, ny: cy / h };

      return {
        dockY: dockY,
        dockH: dockH,
        tools: tools,
        stickers: stickers,
        trashBtn: trashBtn,
        paradeBtn: paradeBtn,
        nextTrainBtn: nextTrainBtn
      };
    }

    function handlePointerDown(normX, normY) {
      var w = window.innerWidth || 1280;
      var h = window.innerHeight || 720;
      var layout = getDockLayout(w, h);

      // 1. Nejprve zkusíme prasknout letící bublinu, pokud na ni dítě kleplo
      if (normY < 0.78 && tryPopFreeBubbleAt(normX, normY, 0.048)) {
        state.isPointerDragging = true;
        state.toolX = normX;
        state.toolY = normY;
        state.prevToolX = normX;
        state.prevToolY = normY;
        return;
      }

      // 2. Kontrola klepnutí do spodní lišty (normY >= 0.78)
      if (normY >= 0.78) {
        // Přepnutí 4 hlavních fází / nástrojů
        for (var t = 0; t < layout.tools.length; t++) {
          if (Math.hypot(normX - layout.tools[t].nx, normY - layout.tools[t].ny) < 0.046) {
            state.toolMode = layout.tools[t].mode;
            state.tvToolActive = false;
            state.tvCarryingStickerId = null;
            playClothShineSound();
            return;
          }
        }

        // Uchopení nálepky z palety (začátek Drag & Drop, i když bylo vybráno jiné tlačítko — automaticky přepne na Decorate!)
        for (var s = 0; s < layout.stickers.length; s++) {
          var st = layout.stickers[s];
          if (Math.hypot(normX - st.nx, normY - st.ny) < 0.034) {
            state.toolMode = 3;
            state.draggingSticker = {
              id: st.id,
              x: normX,
              y: normY,
              scale: 1.15
            };
            state.isPointerDragging = true;
            playStickerPlaceSound();
            return;
          }
        }

        // Tlačítko Koš (odebere poslední nalepenou nálepku)
        if (Math.hypot(normX - layout.trashBtn.nx, normY - layout.trashBtn.ny) < 0.038) {
          if (state.placedStickers.length > 0) {
            state.placedStickers.pop();
            saveStickers(state.placedStickers);
            playBubblePopSound(0.8);
          }
          return;
        }

        // Tlačítko Slavnostní přehlídka (🎺✨ — dostupné KDYKOLIV!)
        if (Math.hypot(normX - layout.paradeBtn.nx, normY - layout.paradeBtn.ny) < 0.046) {
          spawnParadeCelebration();
          return;
        }

        // Tlačítko Další mašinka (🚂🔄)
        if (Math.hypot(normX - layout.nextTrainBtn.nx, normY - layout.nextTrainBtn.ny) < 0.046) {
          state.isExitingTrain = true;
          state.trainExitAnim = 0;
          if (typeof window.playTrainHorn === 'function') {
            try { window.playTrainHorn(); } catch (e) {}
          }
          return;
        }
        return;
      }

      // 3. Pokud jsme ve fázi 4 (DECORATE), zkusíme uchopit již nalepenou nálepku na mašince pro přesunutí
      if (state.toolMode === 3) {
        var loc = normToTrainLocal(normX, normY, w, h);
        for (var p = state.placedStickers.length - 1; p >= 0; p--) {
          var ps = state.placedStickers[p];
          if (Math.hypot(ps.lx - loc.lx, ps.ly - loc.ly) <= 34) {
            state.placedStickers.splice(p, 1);
            saveStickers(state.placedStickers);
            state.draggingSticker = {
              id: ps.id,
              x: normX,
              y: normY,
              scale: 1.15
            };
            state.isPointerDragging = true;
            playStickerPlaceSound();
            return;
          }
        }
        // Pokud dítě ve fázi 4 kleplo přímo na mašinku a mělo vybranou nálepku, rovnou ji umístí
        if (state.selectedStickerId && isPointInsideLocomotiveLocal(loc.lx, loc.ly)) {
          if (state.placedStickers.length >= 14) state.placedStickers.shift();
          state.placedStickers.push({
            id: state.selectedStickerId,
            lx: loc.lx,
            ly: loc.ly,
            bounce: 1.0
          });
          saveStickers(state.placedStickers);
          playStickerPlaceSound();
          return;
        }
      }

      // 4. Jinak začíná přímé mytí / oplachování / leštění tažením prstu nebo myši!
      state.isPointerDragging = true;
      state.toolX = normX;
      state.toolY = normY;
      state.prevToolX = normX;
      state.prevToolY = normY;
      applyToolStepAtNorm(normX, normY, w, h, 1.15);
    }

    function handlePointerMove(normX, normY) {
      var w = window.innerWidth || 1280;
      var h = window.innerHeight || 720;

      // Výpočet rychlosti pohybu pro deformaci houby a náklon konvičky
      state.toolVx = normX - state.toolX;
      state.toolVy = normY - state.toolY;
      state.prevToolX = state.toolX;
      state.prevToolY = state.toolY;
      state.toolX = normX;
      state.toolY = Math.min(0.77, normY);

      if (state.draggingSticker) {
        state.draggingSticker.x = normX;
        state.draggingSticker.y = normY;
        return;
      }

      // Na PC bez stisknutého tlačítka myši pouze pohybujeme náhledem nástroje, ale nemyjeme!
      if (!state.isPointerDragging) return;

      if (normY < 0.78) {
        applyInterpolatedStroke(state.prevToolX, state.prevToolY, state.toolX, state.toolY, w, h, 1.0);
      }
    }

    function handlePointerUp() {
      var w = window.innerWidth || 1280;
      var h = window.innerHeight || 720;

      if (state.draggingSticker) {
        var ds = state.draggingSticker;
        state.draggingSticker = null;
        state.selectedStickerId = ds.id;

        if (ds.y < 0.78) {
          var loc = normToTrainLocal(ds.x, ds.y, w, h);
          if (isPointInsideLocomotiveLocal(loc.lx, loc.ly)) {
            if (state.placedStickers.length >= 14) {
              state.placedStickers.shift();
            }
            state.placedStickers.push({
              id: ds.id,
              lx: loc.lx,
              ly: loc.ly,
              bounce: 1.0
            });
            saveStickers(state.placedStickers);
            playStickerPlaceSound();
            state.sparkles.push({
              x: ds.x,
              y: ds.y,
              vx: 0,
              vy: -0.05,
              size: 18,
              color: '#facc15',
              life: 0.7
            });
          }
        }
      }

      state.isPointerDragging = false;
    }

    // ========================================================================
    // 6. OVLÁDÁNÍ DÁLKOVÝM OVLADAČEM SAMSUNG SMART TV (KROK 5)
    // ========================================================================
    // Položky ve spodní liště při navigaci na TV:
    // 0..3 = 4 nástroje (Houba, Konvička, Hadřík, Nálepky)
    // 4..11 = 8 nálepek
    // 12 = Koš, 13 = Slavnostní přehlídka, 14 = Další mašinka
    function handleTvDirection(dir) {
      if (state.tvInDock) {
        if (dir === 'LEFT') {
          state.tvDockIndex = (state.tvDockIndex + 14) % 15;
          playClothShineSound();
        } else if (dir === 'RIGHT') {
          state.tvDockIndex = (state.tvDockIndex + 1) % 15;
          playClothShineSound();
        } else if (dir === 'UP') {
          state.tvInDock = false;
          playClothShineSound();
        }
        return;
      }

      // Pohyb nástroje nad mašinkou pomocí šipek TV ovladače
      var stepX = 0.055;
      var stepY = 0.055;
      if (dir === 'LEFT') state.tvVelX = -0.38;
      if (dir === 'RIGHT') state.tvVelX = 0.38;
      if (dir === 'UP') state.tvVelY = -0.34;
      if (dir === 'DOWN') {
        if (state.toolY >= 0.67) {
          state.tvInDock = true;
          state.tvToolActive = false;
          playClothShineSound();
          return;
        }
        state.tvVelY = 0.34;
      }

      var prevX = state.toolX;
      var prevY = state.toolY;
      if (dir === 'LEFT') state.toolX = Math.max(0.20, state.toolX - stepX);
      if (dir === 'RIGHT') state.toolX = Math.min(0.80, state.toolX + stepX);
      if (dir === 'UP') state.toolY = Math.max(0.18, state.toolY - stepY);
      if (dir === 'DOWN') state.toolY = Math.min(0.70, state.toolY + stepY);

      state.toolVx = state.toolX - prevX;
      state.toolVy = state.toolY - prevY;

      // Pokud je na TV zapnutý přítlak nástroje (přepnutím nebo podržením OK), pohyb šipkou rovnou myje/lije/leští!
      if (state.tvToolActive && state.toolMode < 3) {
        var w = window.innerWidth || 1280;
        var h = window.innerHeight || 720;
        applyInterpolatedStroke(prevX, prevY, state.toolX, state.toolY, w, h, 1.35);
      }
    }

    function handleTvConfirmDown() {
      var w = window.innerWidth || 1280;
      var h = window.innerHeight || 720;

      if (state.tvInDock) {
        var idx = state.tvDockIndex;
        if (idx >= 0 && idx <= 3) {
          state.toolMode = idx;
          state.tvInDock = false;
          state.tvToolActive = (idx < 3); // Rovnou zapne přítlak vybraného nástroje pro pohodlné mytí šipkami!
          state.tvCarryingStickerId = null;
          playClothShineSound();
        } else if (idx >= 4 && idx <= 11) {
          var stId = STICKER_PALETTE[idx - 4].id;
          state.toolMode = 3;
          state.tvCarryingStickerId = stId;
          state.selectedStickerId = stId;
          state.tvInDock = false;
          playStickerPlaceSound();
        } else if (idx === 12) {
          if (state.placedStickers.length > 0) {
            state.placedStickers.pop();
            saveStickers(state.placedStickers);
            playBubblePopSound(0.8);
          }
        } else if (idx === 13) {
          spawnParadeCelebration();
        } else if (idx === 14) {
          state.isExitingTrain = true;
          state.trainExitAnim = 0;
          if (typeof window.playTrainHorn === 'function') {
            try { window.playTrainHorn(); } catch (e) {}
          }
        }
        return;
      }

      // Pokud jsme nad mašinkou ve fázi 4 (Nálepky), stisk OK přilepí nesenou nálepku
      if (state.toolMode === 3) {
        var carryId = state.tvCarryingStickerId || state.selectedStickerId || 'star';
        var loc = normToTrainLocal(state.toolX, state.toolY, w, h);
        if (isPointInsideLocomotiveLocal(loc.lx, loc.ly)) {
          if (state.placedStickers.length >= 14) state.placedStickers.shift();
          state.placedStickers.push({
            id: carryId,
            lx: loc.lx,
            ly: loc.ly,
            bounce: 1.0
          });
          saveStickers(state.placedStickers);
          playStickerPlaceSound();
        }
        return;
      }

      // Ve fázích 1–3 (Houba, Konvička, Hadřík) přepne stisk OK aktivní přítlak nástroje
      // A současně provede okamžitý záběr v aktuálním místě!
      state.tvOkHeld = true;
      state.tvToolActive = !state.tvToolActive;
      if (state.tvToolActive) {
        applyToolStepAtNorm(state.toolX, state.toolY, w, h, 1.5);
      }
    }

    // ========================================================================
    // 7. VYKRESLOVÁNÍ MAŠINKY, VRSTEV POVRCHU, NÁSTROJŮ A LIŠTY
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

    function defineLocomotiveSilhouetteClipPath(ctx) {
      ctx.beginPath();
      // Kabina
      ctx.rect(-215, -155, 172, 235);
      // Kotel
      ctx.rect(-60, -88, 255, 168);
      // Komín
      ctx.rect(92, -178, 66, 95);
      // Parní dóm
      ctx.arc(48, -85, 38, Math.PI, 0);
      // Obličej vpředu
      ctx.arc(185, -4, 65, 0, Math.PI * 2);
      // Rám a pluh
      ctx.rect(-225, 68, 470, 44);
      // 3 kola
      ctx.moveTo(-135 + 45, 112);
      ctx.arc(-135, 112, 45, 0, Math.PI * 2);
      ctx.moveTo(-5 + 45, 112);
      ctx.arc(-5, 112, 45, 0, Math.PI * 2);
      ctx.moveTo(120 + 45, 112);
      ctx.arc(120, 112, 45, 0, Math.PI * 2);
    }

    function drawLocomotiveAndSurfaceLayers(ctx, w, h, metrics) {
      var tr = getTrainTransform(w, h);
      var theme = TRAIN_THEMES[state.themeIdx];

      ctx.save();
      ctx.translate(tr.cx, tr.cy);
      ctx.scale(tr.scale, tr.scale);

      // 0. Stín pod mašinkou
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 152, 255, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. ZÁKLADNÍ TĚLO MAŠINKY (Kabina, Kotel, Komín, Kola)
      ctx.fillStyle = theme.cab;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -212, -138, 168, 218, 20);
      ctx.fill();
      ctx.stroke();

      // Střecha kabiny
      ctx.fillStyle = theme.roof;
      drawRoundedRect(ctx, -226, -158, 196, 32, 14);
      ctx.fill();
      ctx.stroke();

      // Okno kabiny
      var winGrad = ctx.createLinearGradient(-182, -108, -182, -26);
      winGrad.addColorStop(0, '#e0f2fe');
      winGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = winGrad;
      ctx.strokeStyle = theme.trim;
      ctx.lineWidth = 6;
      drawRoundedRect(ctx, -184, -108, 112, 80, 14);
      ctx.fill();
      ctx.stroke();

      // Hlavní válcový kotel
      ctx.fillStyle = theme.body;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -60, -86, 248, 166, 28);
      ctx.fill();
      ctx.stroke();

      // Zlaté obruče kotle
      ctx.fillStyle = theme.trim;
      ctx.fillRect(6, -84, 18, 162);
      ctx.fillRect(96, -84, 18, 162);

      // Komín (při kýchnutí se pružně nafoukne)
      var snz = state.sneezeTimer > 0 ? 1 + Math.sin(state.sneezeTimer * 20) * 0.18 : 1;
      ctx.save();
      ctx.translate(125, -86);
      ctx.scale(snz, 2 - snz);
      ctx.fillStyle = theme.cab;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, -26, -80, 52, 80, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.trim;
      drawRoundedRect(ctx, -35, -94, 70, 22, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Parní dóm
      ctx.fillStyle = theme.trim;
      ctx.beginPath();
      ctx.arc(48, -86, 34, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Spodní červený rám a pluh
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

      // 3 velká kola
      var wheelXs = [-135, -5, 120];
      var wheelSpin = state.paradeTimer > 0 ? state.time * 9.0 : state.time * 1.1;
      for (var wk = 0; wk < wheelXs.length; wk++) {
        ctx.save();
        ctx.translate(wheelXs[wk], 112);
        ctx.rotate(wheelSpin);
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

      // Obličej mašinky vpředu vpravo
      ctx.save();
      ctx.translate(184, -4);
      ctx.fillStyle = '#fde6c4';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tvářičky
      ctx.fillStyle = 'rgba(244, 63, 94, 0.36)';
      ctx.beginPath();
      ctx.arc(-28, 18, 14, 0, Math.PI * 2);
      ctx.arc(32, 18, 14, 0, Math.PI * 2);
      ctx.fill();

      // Oči sledující aktivní nástroj
      var lookDx = Math.max(-6, Math.min(6, (state.toolX - 0.62) * 24));
      var lookDy = Math.max(-5, Math.min(5, (state.toolY - 0.44) * 24));
      var isHappySquint = state.giggleTimer > 0 || state.paradeTimer > 0 || state.sneezeTimer > 0;

      [-18, 22].forEach(function (ex) {
        if (isHappySquint) {
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

      // Ústa podle čistoty a reakce
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      if (state.sneezeTimer > 0) {
        // Kýchnutí "O"
        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(2, 22, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (metrics.avgDirt > 0.48 && state.giggleTimer <= 0 && state.paradeTimer <= 0) {
        // Komický vyplazený jazýček na špínu
        ctx.beginPath();
        ctx.arc(2, 20, 18, 0.15, Math.PI - 0.15);
        ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(10, 31, 9, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Široký spokojený úsměv
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

      // ======================================================================
      // 2. OŘÍZNUTÉ POVRCHOVÉ VRSTVY (WET, SHINE, DIRT, FOAM, RIVULETS, NÁLEPKY)
      // ======================================================================
      ctx.save();
      defineLocomotiveSilhouetteClipPath(ctx);
      ctx.clip();

      var cells = state.surface.cells;

      // Vrstva A: Mokrý povrch a sedící kapky vody (wet > 0.05)
      for (var i = 0; i < cells.length; i++) {
        var cw = cells[i];
        if (cw.wet > 0.05) {
          ctx.fillStyle = 'rgba(14, 116, 144, ' + (cw.wet * 0.22).toFixed(2) + ')';
          ctx.beginPath();
          ctx.arc(cw.lx, cw.ly, 22, 0, Math.PI * 2);
          ctx.fill();

          if (cw.wet > 0.25 && (i % 2 === 0)) {
            ctx.fillStyle = 'rgba(186, 230, 253, ' + (cw.wet * 0.85).toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(cw.lx + 4, cw.ly + 5, 4.5 * cw.wet, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Vrstva B: Zrcadlový lesk a třpytky po vyleštění hadříkem (shine > 0.08)
      for (var j = 0; j < cells.length; j++) {
        var cs = cells[j];
        if (cs.shine > 0.08 && cs.dirt < 0.2) {
          ctx.save();
          ctx.translate(cs.lx, cs.ly);
          ctx.rotate(-0.45);
          ctx.fillStyle = 'rgba(255, 255, 255, ' + (cs.shine * 0.34).toFixed(2) + ')';
          ctx.fillRect(-18, -7, 36, 14);
          ctx.restore();

          if (cs.shine > 0.55 && (j % 3 === 0)) {
            var spPulse = 0.5 + 0.5 * Math.sin(state.time * 6 + cs.sparklePhase);
            var sr = 9 * cs.shine * spPulse;
            if (sr > 2) {
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.moveTo(cs.lx, cs.ly - sr);
              ctx.lineTo(cs.lx + sr * 0.3, cs.ly - sr * 0.3);
              ctx.lineTo(cs.lx + sr, cs.ly);
              ctx.lineTo(cs.lx + sr * 0.3, cs.ly + sr * 0.3);
              ctx.lineTo(cs.lx, cs.ly + sr);
              ctx.lineTo(cs.lx - sr * 0.3, cs.ly + sr * 0.3);
              ctx.lineTo(cs.lx - sr, cs.ly);
              ctx.lineTo(cs.lx - sr * 0.3, cs.ly - sr * 0.3);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Vrstva C: Skutečná špína (dirt > 0.04) — vykreslená jako organické nepravidelné cákance
      for (var d = 0; d < cells.length; d++) {
        var cd = cells[d];
        if (cd.dirt > 0.04) {
          ctx.save();
          ctx.globalAlpha = Math.min(0.92, cd.dirt * 0.9);
          ctx.fillStyle = cd.dirtColor;
          for (var sb = 0; sb < cd.subBlobs.length; sb++) {
            var b = cd.subBlobs[sb];
            ctx.beginPath();
            ctx.arc(
              cd.lx + b.ox * cd.dirt,
              cd.ly + b.oy * cd.dirt,
              b.rad * (0.45 + 0.55 * cd.dirt),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Vrstva D: Nadýchaná mýdlová pěna (foam > 0.04) — organické shluky překrývajících se bublinek
      for (var f = 0; f < cells.length; f++) {
        var cf = cells[f];
        if (cf.foam > 0.04) {
          ctx.save();
          for (var fb = 0; fb < cf.subBlobs.length; fb++) {
            var sub = cf.subBlobs[fb];
            var fr = sub.rad * (0.5 + 0.72 * cf.foam);
            var fx = cf.lx + sub.ox * 0.85;
            var fy = cf.ly + sub.oy * 0.85;
            ctx.fillStyle = 'rgba(240, 249, 255, ' + Math.min(0.95, cf.foam * 0.92).toFixed(2) + ')';
            ctx.strokeStyle = 'rgba(125, 211, 252, ' + Math.min(0.9, cf.foam * 0.85).toFixed(2) + ')';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Lesklé prasátko na pěnové bublince
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Vrstva E: Stékající pramínky vody (rivulets) po boku mašinky
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.82)';
      ctx.fillStyle = '#bae6fd';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      for (var rv = 0; rv < state.rivulets.length; rv++) {
        var riv = state.rivulets[rv];
        ctx.beginPath();
        ctx.moveTo(riv.lx, riv.ly - 18);
        ctx.lineTo(riv.lx, riv.ly);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(riv.lx, riv.ly, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Konec clipu siluety

      // Vrstva F: Nalepené nálepky na mašince
      for (var st = 0; st < state.placedStickers.length; st++) {
        var ps = state.placedStickers[st];
        var bounceScale = 1 + (ps.bounce > 0 ? Math.sin(ps.bounce * Math.PI) * 0.35 : 0);
        if (state.paradeTimer > 0) {
          bounceScale *= 1 + Math.sin(state.time * 12 + st) * 0.12;
        }
        ctx.save();
        ctx.translate(ps.lx, ps.ly);
        ctx.scale(bounceScale, bounceScale);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerGraphic(ctx, ps.id, 0, 0, 19);
        ctx.restore();
      }

      ctx.restore();
    }

    // Vykreslení aktivního nástroje (1. Pružná houba, 2. Konvička s proudem vody z hubičky, 3. Měkký hadřík, 4. Nálepka)
    function drawActiveToolAndWaterStream(ctx, w, h) {
      if (state.draggingSticker) {
        var ds = state.draggingSticker;
        ctx.save();
        ctx.translate(ds.x * w, ds.y * h);
        ctx.scale(1.22, 1.22);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerGraphic(ctx, ds.id, 0, 0, 24);
        ctx.restore();
        return;
      }

      if (state.tvInDock) return;

      var tx = state.toolX * w;
      var ty = state.toolY * h;
      var isUsing = state.isPointerDragging || state.tvToolActive || state.tvOkHeld;

      if (state.toolMode === 0) {
        // FÁZE 1: Žlutá mycí houba, která se deformuje podle pohybu a přítlaku
        var speed = Math.min(0.06, Math.hypot(state.toolVx, state.toolVy));
        var stretch = 1 + speed * 4.5 + (isUsing ? 0.12 : 0);
        var squash = (1 / stretch) * (isUsing ? 0.88 : 1.0);
        var tilt = Math.max(-0.45, Math.min(0.45, state.toolVx * 8));

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(tilt);
        ctx.scale(stretch, squash);

        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = isUsing ? '#ffffff' : '#ca8a04';
        ctx.lineWidth = isUsing ? 5 : 4;
        drawRoundedRect(ctx, -44, -30, 88, 60, 20);
        ctx.fill();
        ctx.stroke();

        // Póry houby
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(-18, -8, 6, 0, Math.PI * 2);
        ctx.arc(16, -10, 5, 0, Math.PI * 2);
        ctx.arc(2, 10, 7, 0, Math.PI * 2);
        ctx.arc(-12, 12, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Čepička pěny na houbě při mytí
        if (isUsing) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(-22, -26, 14, 0, Math.PI * 2);
          ctx.arc(0, -30, 16, 0, Math.PI * 2);
          ctx.arc(22, -26, 13, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (state.toolMode === 1) {
        // FÁZE 2: Konvička s proudem vody vycházejícím přímo z hubičky do bodu dopadu (tx, ty)
        var canX = tx - 78;
        var canY = ty - 68;
        var pourTilt = (isUsing ? 0.58 : 0.18) + Math.max(-0.22, Math.min(0.22, state.toolVx * 5));

        // Přesná pozice špičky hubičky konvičky po natočení
        var localSpoutX = 58;
        var localSpoutY = -12;
        var spoutX = canX + Math.cos(pourTilt) * localSpoutX - Math.sin(pourTilt) * localSpoutY;
        var spoutY = canY + Math.sin(pourTilt) * localSpoutX + Math.cos(pourTilt) * localSpoutY;

        // Vykreslení souvislého obloukového proudu vody z hubičky do bodu dopadu (tx, ty)
        if (isUsing) {
          var ctrlX = (spoutX + tx) * 0.5 + 18 - state.toolVx * 260;
          var ctrlY = spoutY - 8;

          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
          ctx.lineWidth = 16;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(spoutX, spoutY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(spoutX, spoutY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
          ctx.stroke();

          // Korunka vodního cákance v bodě dopadu (tx, ty)
          ctx.fillStyle = '#bae6fd';
          for (var c = 0; c < 5; c++) {
            var ca = Math.PI + (c / 4) * Math.PI + Math.sin(state.time * 18 + c) * 0.2;
            var cr = 16 + Math.sin(state.time * 22 + c * 2) * 6;
            ctx.beginPath();
            ctx.arc(tx + Math.cos(ca) * cr, ty + Math.sin(ca) * cr * 0.6, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Samotné tělo konvičky
        ctx.save();
        ctx.translate(canX, canY);
        ctx.rotate(pourTilt);

        // Ucho konvičky
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(-28, 0, 22, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Hubička konvičky
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(18, -4);
        ctx.lineTo(56, -18);
        ctx.lineTo(56, -6);
        ctx.lineTo(22, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Růžice kropítka na konci hubičky
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(58, -12, 6, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nádoba konvičky
        ctx.fillStyle = '#38bdf8';
        drawRoundedRect(ctx, -28, -26, 54, 52, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (state.toolMode === 2) {
        // FÁZE 3: Měkký lešticí hadřík
        var clothWave = Math.sin(state.time * 10) * (isUsing ? 0.18 : 0.06);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(clothWave + state.toolVx * 6);

        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = isUsing ? '#fef08a' : '#be185d';
        ctx.lineWidth = isUsing ? 5 : 4;
        ctx.beginPath();
        ctx.moveTo(-42, -26);
        ctx.quadraticCurveTo(0, -34, 42, -22);
        ctx.quadraticCurveTo(48, 8, 36, 32);
        ctx.quadraticCurveTo(0, 24, -38, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        drawStickerGraphic(ctx, 'star', 0, 2, 16);
        ctx.restore();
      } else if (state.toolMode === 3) {
        // FÁZE 4: Kurzor pro umístění nálepky (na TV nebo před přetažením)
        var previewId = state.tvCarryingStickerId || state.selectedStickerId || 'star';
        ctx.save();
        ctx.translate(tx, ty);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerGraphic(ctx, previewId, 0, 0, 20);
        ctx.restore();
      }
    }

    function drawBottomDock(ctx, w, h, recommendedMode) {
      var layout = getDockLayout(w, h);

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, w * 0.04, layout.dockY, w * 0.92, layout.dockH, 24);
      ctx.fill();
      ctx.stroke();

      var toolR = Math.min(w * 0.036, layout.dockH * 0.36);
      var toolColors = ['#facc15', '#38bdf8', '#f472b6', '#a855f7'];

      // 1. 4 hlavní nástroje fází (Soap, Wash, Shine, Decorate)
      for (var t = 0; t < layout.tools.length; t++) {
        var tl = layout.tools[t];
        var tx = tl.nx * w;
        var ty = tl.ny * h;
        var isSelected = state.toolMode === t;
        var isRecommended = (recommendedMode === t && !isSelected);
        var isTvDockFocus = state.tvInDock && state.tvDockIndex === t;

        ctx.save();
        ctx.translate(tx, ty);
        var scale = isSelected ? 1.12 : (isRecommended ? 1.05 + Math.sin(state.time * 7) * 0.06 : 1.0);
        ctx.scale(scale, scale);

        if (isRecommended) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, toolR + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isSelected ? toolColors[t] : '#1e293b';
        ctx.strokeStyle = isTvDockFocus ? '#fef08a' : (isSelected ? '#ffffff' : toolColors[t]);
        ctx.lineWidth = isTvDockFocus || isSelected ? 5 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, toolR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ikona uvnitř tlačítka fáze (bez textu)
        if (t === 0) {
          // Houba
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 2.5;
          drawRoundedRect(ctx, -toolR * 0.55, -toolR * 0.36, toolR * 1.1, toolR * 0.72, 7);
          ctx.fill();
          ctx.stroke();
        } else if (t === 1) {
          // Konvička
          ctx.fillStyle = '#7dd3fc';
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 2.5;
          drawRoundedRect(ctx, -toolR * 0.42, -toolR * 0.32, toolR * 0.72, toolR * 0.64, 6);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(toolR * 0.28, -toolR * 0.1);
          ctx.lineTo(toolR * 0.65, -toolR * 0.35);
          ctx.stroke();
        } else if (t === 2) {
          // Lešticí hadřík s hvězdičkou
          ctx.fillStyle = '#fbcfe8';
          drawRoundedRect(ctx, -toolR * 0.48, -toolR * 0.38, toolR * 0.96, toolR * 0.76, 8);
          ctx.fill();
          drawStickerGraphic(ctx, 'star', 0, 0, toolR * 0.38);
        } else {
          // Paleta nálepek
          drawStickerGraphic(ctx, 'heart', -toolR * 0.22, -toolR * 0.15, toolR * 0.34);
          drawStickerGraphic(ctx, 'star', toolR * 0.24, toolR * 0.18, toolR * 0.34);
        }
        ctx.restore();
      }

      // 2. Paleta 8 nálepek uprostřed lišty
      var stR = Math.min(w * 0.023, layout.dockH * 0.21);
      for (var s = 0; s < layout.stickers.length; s++) {
        var st = layout.stickers[s];
        var def = STICKER_PALETTE[s];
        var sx = st.nx * w;
        var sy = st.ny * h;
        var isTvStFocus = state.tvInDock && state.tvDockIndex === (4 + s);
        var isActiveSt = state.selectedStickerId === st.id && state.toolMode === 3;

        ctx.save();
        ctx.translate(sx, sy);
        if (isTvStFocus || isActiveSt) ctx.scale(1.16, 1.16);
        ctx.fillStyle = def.bg;
        ctx.strokeStyle = isTvStFocus ? '#fef08a' : def.border;
        ctx.lineWidth = isTvStFocus || isActiveSt ? 4 : 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, stR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawStickerGraphic(ctx, st.id, 0, 0, stR * 0.68);
        ctx.restore();
      }

      // Tlačítko Koš (vrácení poslední nálepky)
      var trX = layout.trashBtn.nx * w;
      var trY = layout.trashBtn.ny * h;
      var trFocus = state.tvInDock && state.tvDockIndex === 12;
      ctx.save();
      ctx.translate(trX, trY);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = trFocus ? '#fef08a' : '#94a3b8';
      ctx.lineWidth = trFocus ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, stR * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-stR * 0.45, -stR * 0.45);
      ctx.lineTo(stR * 0.45, stR * 0.45);
      ctx.moveTo(stR * 0.45, -stR * 0.45);
      ctx.lineTo(-stR * 0.45, stR * 0.45);
      ctx.stroke();
      ctx.restore();

      // 3. Tlačítko Slavnostní přehlídka (🎺✨ — dostupné KDYKOLIV!)
      var pX = layout.paradeBtn.nx * w;
      var pY = layout.paradeBtn.ny * h;
      var pFocus = state.tvInDock && state.tvDockIndex === 13;
      ctx.save();
      ctx.translate(pX, pY);
      var pScale = 1.0 + Math.sin(state.time * 5) * 0.04;
      ctx.scale(pScale, pScale);
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = pFocus ? '#ffffff' : '#fef08a';
      ctx.lineWidth = pFocus ? 5 : 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, toolR * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawStickerGraphic(ctx, 'crown', 0, -2, toolR * 0.58);
      ctx.restore();

      // 4. Tlačítko Další mašinka (🚂🔄)
      var nX = layout.nextTrainBtn.nx * w;
      var nY = layout.nextTrainBtn.ny * h;
      var nFocus = state.tvInDock && state.tvDockIndex === 14;
      ctx.save();
      ctx.translate(nX, nY);
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = nFocus ? '#fef08a' : '#dcfce7';
      ctx.lineWidth = nFocus ? 5 : 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, toolR * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-toolR * 0.45, -toolR * 0.22);
      ctx.lineTo(toolR * 0.08, -toolR * 0.22);
      ctx.lineTo(toolR * 0.08, -toolR * 0.48);
      ctx.lineTo(toolR * 0.58, 0);
      ctx.lineTo(toolR * 0.08, toolR * 0.48);
      ctx.lineTo(toolR * 0.08, toolR * 0.22);
      ctx.lineTo(-toolR * 0.45, toolR * 0.22);
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
          stars: loadSavedStars(),
          placedStickers: loadSavedStickers(),
          selectedStickerId: 'star',
          draggingSticker: null,
          themeIdx: -1,
          toolMode: 0,
          toolX: 0.48,
          toolY: 0.44,
          prevToolX: 0.48,
          prevToolY: 0.44,
          toolVx: 0,
          toolVy: 0,
          isPointerDragging: false,
          tvToolActive: false,
          tvOkHeld: false,
          tvInDock: false,
          tvDockIndex: 0,
          tvCarryingStickerId: null,
          tvVelX: 0,
          tvVelY: 0,
          trainOffsetPx: 0
        };
        startNewTrain(0);
        updateScoreBadge();
      },

      onAction: function (action, payload) {
        if (!state) return false;

        // Podpora uvolnění tlačítka na TV / klávesnici (Krok 5)
        if (action === 'KEY_UP') {
          state.tvOkHeld = false;
          return true;
        }

        // Rozlišení šipky nahoru na klávesnici/TV od kliknutí na plátno
        if (action === 'JUMP') {
          if (payload && payload.originalEvent) {
            var k = payload.originalEvent.key || '';
            var kc = payload.originalEvent.keyCode || 0;
            if (k === 'ArrowUp' || kc === 38) {
              handleTvDirection('UP');
              return true;
            }
            handleTvConfirmDown();
            return true;
          }
          if (payload && (typeof payload.x === 'number' || typeof payload.normX === 'number')) {
            var px = typeof payload.x === 'number' ? payload.x : payload.normX;
            var py = typeof payload.y === 'number' ? payload.y : payload.normY;
            handlePointerDown(px, py);
            return true;
          }
          handleTvConfirmDown();
          return true;
        }

        if (action === 'DRAG_MOVE') {
          if (payload && (typeof payload.x === 'number' || typeof payload.normX === 'number')) {
            var mx = typeof payload.x === 'number' ? payload.x : payload.normX;
            var my = typeof payload.y === 'number' ? payload.y : payload.normY;
            handlePointerMove(mx, my);
            return true;
          }
          return false;
        }

        if (action === 'DRAG_END') {
          handlePointerUp();
          return true;
        }

        if (action === 'LEFT' || action === 'RIGHT' || action === 'UP' || action === 'DOWN') {
          handleTvDirection(action);
          return true;
        }

        if (action === 'CONFIRM') {
          handleTvConfirmDown();
          return true;
        }

        return false;
      },

      update: function (dt, w, h) {
        if (!state) return;
        state.time += dt;

        // Příjezd a odjezd mašinky
        if (state.isExitingTrain) {
          state.trainExitAnim += dt * 1.8;
          state.trainOffsetPx = state.trainExitAnim * w * 0.95;
          if (state.trainExitAnim >= 1.0) {
            startNewTrain();
          }
          return;
        } else if (state.trainEnterAnim < 1.0) {
          state.trainEnterAnim = Math.min(1.0, state.trainEnterAnim + dt * 2.2);
          var ease = 1 - Math.pow(1 - state.trainEnterAnim, 3);
          state.trainOffsetPx = -(1 - ease) * w * 0.85;
        } else {
          state.trainOffsetPx = 0;
        }

        // Tlumení rychlosti nástroje
        state.toolVx *= Math.pow(0.08, dt);
        state.toolVy *= Math.pow(0.08, dt);

        // Pokud uživatel drží tlačítko OK na TV nebo drží prst na místě s konvičkou, voda plynule teče dál
        if ((state.isPointerDragging || state.tvToolActive || state.tvOkHeld) && !state.tvInDock && !state.draggingSticker) {
          if (state.toolMode === 1) {
            applyToolStepAtNorm(state.toolX, state.toolY, w, h, dt * 3.8);
          }
        }

        if (state.giggleTimer > 0) state.giggleTimer = Math.max(0, state.giggleTimer - dt);
        if (state.sneezeTimer > 0) state.sneezeTimer = Math.max(0, state.sneezeTimer - dt);
        if (state.paradeTimer > 0) state.paradeTimer = Math.max(0, state.paradeTimer - dt);

        // Radostný poskok mašinky při přehlídce
        if (state.jumpOffset < 0 || state.jumpVel !== 0) {
          state.jumpOffset += state.jumpVel * dt;
          state.jumpVel += 1.25 * dt;
          if (state.jumpOffset >= 0) {
            state.jumpOffset = 0;
            state.jumpVel = 0;
            if (state.paradeTimer > 1.2) {
              state.jumpVel = -0.26;
            }
          }
        }

        // Pružinová animace čerstvě nalepených nálepek
        for (var st = 0; st < state.placedStickers.length; st++) {
          if (state.placedStickers[st].bounce > 0) {
            state.placedStickers[st].bounce = Math.max(0, state.placedStickers[st].bounce - dt * 3.2);
          }
        }

        // Fyzika stékajících pramínků vody (rivulets) po boku mašinky
        var gridMap = state.surface.gridMap;
        var rows = state.surface.rows;
        for (var rv = state.rivulets.length - 1; rv >= 0; rv--) {
          var riv = state.rivulets[rv];
          riv.ly += riv.vy * dt;
          riv.life -= dt;

          // Pramínek při stékání dolů smývá pěnu z nižších řádků mřížky!
          var nextRow = Math.min(rows - 1, riv.row + 1);
          if (gridMap[nextRow] && gridMap[nextRow][riv.col]) {
            var belowCell = gridMap[nextRow][riv.col];
            belowCell.foam = Math.max(0, belowCell.foam - dt * 1.6);
            belowCell.dirt = Math.max(0, belowCell.dirt - dt * 0.6);
            belowCell.wet = Math.min(1.0, belowCell.wet + dt * 2.0);
            riv.row = nextRow;
          }

          if (riv.life <= 0 || riv.ly > 125) {
            state.rivulets.splice(rv, 1);
          }
        }

        // Pohyb volných praskacích bublin
        for (var b = state.freeBubbles.length - 1; b >= 0; b--) {
          var bub = state.freeBubbles[b];
          bub.x += bub.vx * dt + Math.sin(state.time * 2.5 + bub.phase) * 0.015 * dt;
          bub.y += bub.vy * dt;
          if (bub.y < 0.06 || bub.x < 0.05 || bub.x > 0.95) {
            state.freeBubbles.splice(b, 1);
          }
        }

        // Pohyb obláčků pěny z komína
        for (var cp = state.chimneyPuffs.length - 1; cp >= 0; cp--) {
          var puff = state.chimneyPuffs[cp];
          puff.x += puff.vx * dt;
          puff.y += puff.vy * dt;
          puff.r += 18 * dt;
          puff.life -= dt * 1.1;
          if (puff.life <= 0) state.chimneyPuffs.splice(cp, 1);
        }

        // Vodní cákance
        for (var ws = state.waterSplashes.length - 1; ws >= 0; ws--) {
          var spl = state.waterSplashes[ws];
          spl.x += spl.vx * dt;
          spl.y += spl.vy * dt;
          spl.vy += 0.45 * dt;
          spl.life -= dt;
          if (spl.life <= 0) state.waterSplashes.splice(ws, 1);
        }

        // Třpytky
        for (var spk = state.sparkles.length - 1; spk >= 0; spk--) {
          var s = state.sparkles[spk];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life -= dt;
          if (s.life <= 0) state.sparkles.splice(spk, 1);
        }

        // Konfety při přehlídce
        for (var cf = state.confetti.length - 1; cf >= 0; cf--) {
          var c = state.confetti[cf];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.vy += 0.38 * dt;
          c.rot += c.vRot * dt;
          c.life -= dt * 0.42;
          if (c.life <= 0) state.confetti.splice(cf, 1);
        }
      },

      render: function (ctx, w, h) {
        if (!state) return;

        var metrics = computePhaseMetrics();
        var recommendedMode = getRecommendedNextTool(metrics);

        // 1. Slunečné pozadí myčky
        var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#38bdf8');
        bgGrad.addColorStop(0.60, '#bae6fd');
        bgGrad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Duha na obloze při vysokém lesku nebo při Slavnostní přehlídce
        if (metrics.avgShine > 0.35 || state.paradeTimer > 0) {
          var rCols = ['rgba(244,63,94,0.24)', 'rgba(250,204,21,0.24)', 'rgba(74,222,128,0.24)', 'rgba(56,189,248,0.24)'];
          for (var rc = 0; rc < rCols.length; rc++) {
            ctx.strokeStyle = rCols[rc];
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.72, Math.min(w, h) * (0.56 - rc * 0.03), Math.PI * 1.08, Math.PI * 1.92);
            ctx.stroke();
          }
        }

        // Podlaha myčky a koleje
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, h * 0.67, w, h * 0.33);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, h * 0.67, w, 12);

        ctx.fillStyle = '#78350f';
        for (var tr = 0; tr < 18; tr++) {
          ctx.fillRect((tr / 18) * w, h * 0.685, w * 0.03, 14);
        }
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, h * 0.68, w, 6);

        // Barevný oblouk myčky v pozadí
        var archW = Math.min(w * 0.78, 880);
        var archX = (w - archW) * 0.5;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 16;
        drawRoundedRect(ctx, archX, h * 0.11, archW, h * 0.57, 40);
        ctx.stroke();

        // 2. Vláček s oříznutými vrstvami povrchu (Wet, Shine, Dirt, Foam, Rivulets, Stickers)
        drawLocomotiveAndSurfaceLayers(ctx, w, h, metrics);

        // 3. Obláčky pěny vyfouknuté z komína
        for (var cp = 0; cp < state.chimneyPuffs.length; cp++) {
          var puff = state.chimneyPuffs[cp];
          ctx.save();
          ctx.globalAlpha = Math.max(0, puff.life);
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(puff.x * w, puff.y * h, puff.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 4. Volné interaktivní bubliny (lze je prasknout dotykem!)
        for (var b = 0; b < state.freeBubbles.length; b++) {
          var bub = state.freeBubbles[b];
          var bx = bub.x * w;
          var by = bub.y * h;
          ctx.save();
          ctx.fillStyle = 'hsla(' + bub.hue + ', 88%, 85%, 0.65)';
          ctx.strokeStyle = 'hsla(' + bub.hue + ', 92%, 62%, 0.92)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(bx, by, bub.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.beginPath();
          ctx.arc(bx - bub.r * 0.32, by - bub.r * 0.32, bub.r * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 5. Vodní cákance a třpytky
        for (var ws = 0; ws < state.waterSplashes.length; ws++) {
          var spl = state.waterSplashes[ws];
          ctx.fillStyle = spl.color;
          ctx.beginPath();
          ctx.arc(spl.x * w, spl.y * h, spl.r, 0, Math.PI * 2);
          ctx.fill();
        }

        for (var spk = 0; spk < state.sparkles.length; spk++) {
          var s = state.sparkles[spk];
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 6. Konfety při Slavnostní přehlídce
        for (var cf = 0; cf < state.confetti.length; cf++) {
          var c = state.confetti[cf];
          ctx.save();
          ctx.translate(c.x * w, c.y * h);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
          ctx.restore();
        }

        // 7. Aktivní nástroj (Houba / Konvička s proudem vody / Hadřík / Nesená nálepka)
        drawActiveToolAndWaterStream(ctx, w, h);

        // 8. Spodní obrázková lišta (4 fáze, 8 nálepek, Koš, Přehlídka kdykoliv, Další mašinka)
        drawBottomDock(ctx, w, h, recommendedMode);
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
