// ============================================================================
// MODULE 7: MINIGAMES.JS
// 1. Modulární registr a správce miniher (window.HappyTrainMinigames)
//    Umožňuje v budoucnu přidávat další minihry v samostatných souborech
//    pomocí HappyTrainMinigames.register('id', { ... })
// 2. První hratelná minihra: "Samá díra" (sama_dira) pro děti 4–6 let
//    - Ovládání jedním tlačítkem / dotykem (OK / ▲ / Mezerník / klepnutí na plátno)
//    - Přísné oddělení tlačítka "Zpět do světa" ([data-minigame-ui="back"]) od skoku
//    - Bezpečné pozastavení a 100% obnovení 3D světa přes pauseMainWorld / resumeMainWorld
// ============================================================================

(function initHappyTrainMinigamesSystem() {
  var registry = {};
  var activeMinigameId = null;
  var activeModule = null;
  var overlayEl = null;
  var canvasEl = null;
  var ctx2d = null;
  var rafId = null;
  var lastFrameTimeMs = 0;

  function ensureMinigameOverlayDom() {
    if (overlayEl && canvasEl) return;

    if (!document.getElementById('happy-train-minigames-styles')) {
      var st = document.createElement('style');
      st.id = 'happy-train-minigames-styles';
      st.textContent = [
        '#minigame-overlay {',
        '  position: fixed;',
        '  inset: 0;',
        '  z-index: 80;',
        '  background: #0f172a;',
        '  display: none;',
        '  flex-direction: column;',
        '  user-select: none;',
        '  -webkit-user-select: none;',
        '  touch-action: none;',
        '}',
        '#minigame-overlay.show {',
        '  display: flex;',
        '}',
        '#minigame-hud-bar {',
        '  position: absolute;',
        '  top: 12px;',
        '  left: 16px;',
        '  right: 16px;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  z-index: 85;',
        '  pointer-events: none;',
        '}',
        '#minigame-back-btn {',
        '  pointer-events: auto;',
        '  background: linear-gradient(135deg, #ef4444, #dc2626);',
        '  color: #ffffff;',
        '  border: 3px solid #fef08a;',
        '  padding: 10px 20px;',
        '  border-radius: 18px;',
        '  font-size: 16px;',
        '  font-weight: 900;',
        '  cursor: pointer;',
        '  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);',
        '  touch-action: none;',
        '  transition: transform 0.12s ease;',
        '}',
        '#minigame-back-btn:active {',
        '  transform: scale(0.95);',
        '}',
        '#minigame-laser-btn {',
        '  pointer-events: auto;',
        '  background: linear-gradient(135deg, #f43f5e, #be123c);',
        '  color: #ffffff;',
        '  border: 3px solid #fda4af;',
        '  padding: 10px 18px;',
        '  border-radius: 18px;',
        '  font-size: 16px;',
        '  font-weight: 900;',
        '  cursor: pointer;',
        '  box-shadow: 0 8px 22px rgba(244, 63, 94, 0.55);',
        '  touch-action: none;',
        '  transition: transform 0.12s ease;',
        '}',
        '#minigame-laser-btn:active {',
        '  transform: scale(0.94);',
        '}',
        '#minigame-score-badge {',
        '  pointer-events: none;',
        '  background: rgba(15, 23, 42, 0.88);',
        '  border: 3px solid #facc15;',
        '  color: #fef08a;',
        '  padding: 8px 20px;',
        '  border-radius: 18px;',
        '  font-size: 20px;',
        '  font-weight: 900;',
        '  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);',
        '}',
        '#minigame-canvas {',
        '  width: 100vw;',
        '  height: 100vh;',
        '  display: block;',
        '  touch-action: none;',
        '  cursor: pointer;',
        '}',
        '@media (max-width: 768px) {',
        '  #minigame-back-btn, #minigame-laser-btn {',
        '    padding: 8px 14px;',
        '    font-size: 14px;',
        '  }',
        '  #minigame-score-badge {',
        '    padding: 6px 14px;',
        '    font-size: 16px;',
        '  }',
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(st);
    }

    overlayEl = document.createElement('div');
    overlayEl.id = 'minigame-overlay';
    overlayEl.innerHTML = [
      '<div id="minigame-hud-bar" data-minigame-ui="hud">',
      '  <button type="button" id="minigame-back-btn" data-minigame-ui="back" aria-label="Zpět do 3D světa">',
      '    ⬅ Zpět do světa (BACK)',
      '  </button>',
      '  <div style="display:flex;align-items:center;gap:12px;">',
      '    <button type="button" id="minigame-laser-btn" data-minigame-ui="laser" aria-label="Vystřelit červený laser">',
      '      🔴 LASER (▼)',
      '    </button>',
      '    <div id="minigame-score-badge" data-minigame-ui="score">⭐ 0</div>',
      '  </div>',
      '</div>',
      '<canvas id="minigame-canvas"></canvas>'
    ].join('');
    document.body.appendChild(overlayEl);

    canvasEl = document.getElementById('minigame-canvas');
    ctx2d = canvasEl.getContext('2d');

    // Tlačítko Zpět má vlastní Pointer Event se stopPropagation(),
    // takže dotyk na tlačítko Zpět NIKDY nevyvolá skok v minihře!
    var backBtn = document.getElementById('minigame-back-btn');
    if (backBtn) {
      backBtn.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeActiveMinigame();
      }, { passive: false });
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // Tlačítko Laser (pro dotykové obrazovky a myš; na TV a klávesnici střílí šipka dolů ▼)
    var laserBtn = document.getElementById('minigame-laser-btn');
    if (laserBtn) {
      laserBtn.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (activeModule && typeof activeModule.onAction === 'function') {
          activeModule.onAction('DOWN', { source: 'laser-btn' });
        }
      }, { passive: false });
      laserBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // Navázání Pointer Events pouze na samotné herní plátno (#minigame-canvas)
    if (window.HappyTrainController && window.HappyTrainController.bindMinigameCanvasPointerEvents) {
      window.HappyTrainController.bindMinigameCanvasPointerEvents(canvasEl, {
        onPointerDown: function(pt) {
          if (activeModule && typeof activeModule.onAction === 'function') {
            activeModule.onAction('JUMP', pt);
          }
        },
        onPointerMove: function(pt) {
          if (activeModule && typeof activeModule.onAction === 'function') {
            activeModule.onAction('DRAG_MOVE', pt);
          }
        },
        onPointerUp: function(pt) {
          if (activeModule && typeof activeModule.onAction === 'function') {
            activeModule.onAction('DRAG_END', pt);
          }
        }
      });
    }

    window.addEventListener('resize', resizeMinigameCanvas);
  }

  function resizeMinigameCanvas() {
    if (!canvasEl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasEl.width = Math.floor(window.innerWidth * dpr);
    canvasEl.height = Math.floor(window.innerHeight * dpr);
    if (ctx2d) {
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function minigameLoop(nowMs) {
    if (!activeModule) return;
    rafId = requestAnimationFrame(minigameLoop);
    var dt = lastFrameTimeMs > 0 ? Math.min(0.05, (nowMs - lastFrameTimeMs) / 1000) : 0.016;
    lastFrameTimeMs = nowMs;

    var w = window.innerWidth;
    var h = window.innerHeight;
    if (typeof activeModule.update === 'function') {
      activeModule.update(dt, w, h);
    }
    if (ctx2d && typeof activeModule.render === 'function') {
      activeModule.render(ctx2d, w, h);
    }
  }

  function launchMinigame(id, options) {
    var mod = registry[id];
    if (!mod) return false;

    ensureMinigameOverlayDom();

    if (window.HappyTrainController && window.HappyTrainController.hideStationPrompt) {
      window.HappyTrainController.hideStationPrompt();
    }

    // 1. Bezpečně pozastavíme hlavní 3D svět (zachová tep requestAnimationFrame i přesnou pozici vlaku)
    if (typeof window.pauseMainWorld === 'function') {
      window.pauseMainWorld();
    }

    activeMinigameId = id;
    activeModule = mod;
    overlayEl.classList.add('show');
    resizeMinigameCanvas();

    if (typeof mod.start === 'function') {
      mod.start(options || {}, {
        setScoreText: function(txt) {
          var badge = document.getElementById('minigame-score-badge');
          if (badge) badge.textContent = txt;
        },
        close: closeActiveMinigame
      });
    }

    lastFrameTimeMs = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(minigameLoop);
    return true;
  }

  function closeActiveMinigame() {
    if (!activeModule) return;
    cancelAnimationFrame(rafId);
    rafId = null;

    if (typeof activeModule.stop === 'function') {
      activeModule.stop();
    }

    activeModule = null;
    activeMinigameId = null;

    if (overlayEl) {
      overlayEl.classList.remove('show');
    }

    // 2. Bezpečně obnovíme hlavní 3D svět přesně v místě, kde byl pozastaven
    if (typeof window.resumeMainWorld === 'function') {
      window.resumeMainWorld();
    }
  }

  window.HappyTrainMinigames = {
    register: function(id, moduleDef) {
      registry[id] = moduleDef;
    },
    launch: launchMinigame,
    closeActive: closeActiveMinigame,
    isActive: function() {
      return Boolean(activeModule);
    },
    getActiveId: function() {
      return activeMinigameId;
    },
    handleAction: function(action, payload) {
      if (!activeModule) return false;
      if (action === 'BACK') {
        closeActiveMinigame();
        return true;
      }
      if (typeof activeModule.onAction === 'function') {
        return activeModule.onAction(action, payload);
      }
      return false;
    }
  };

  // Alias pro přímé volání z castle.js (window.SamaDiraMinigame)
  window.SamaDiraMinigame = {
    start: function(opts) {
      return launchMinigame('sama_dira', opts || { source: 'castle' });
    },
    stop: closeActiveMinigame,
    isActive: function() {
      return activeMinigameId === 'sama_dira' && Boolean(activeModule);
    }
  };

  // ==========================================================================
  // ZVUKOVÉ EFEKTY MINIHRY (ČISTÉ WEB AUDIO BEZ HOUKÁNÍ VLÁČKU!)
  // ==========================================================================
  function getMinigameAudioCtx() {
    if (typeof window.initAudio === 'function') {
      try { window.initAudio(); } catch (e) {}
    }
    if (typeof window.audioCtx !== 'undefined' && window.audioCtx) {
      return window.audioCtx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !window._minigameFallbackAudioCtx) {
      try { window._minigameFallbackAudioCtx = new AC(); } catch (e) {}
    }
    return window._minigameFallbackAudioCtx || null;
  }

  // Jednoduché čisté "cink" mince při výskoku (žádné houkání vláčku!)
  function playJumpCoinChime(isSecondJump) {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      var f1 = isSecondJump ? 1174.66 : 987.77; // D6 nebo B5
      var f2 = isSecondJump ? 1567.98 : 1318.51; // G6 nebo E6
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.setValueAtTime(f2, now + 0.065);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Krátký sci-fi zvuk červeného laseru (při stisku šipky dolů ▼)
  function playLaserPewSound(locoTier) {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = locoTier >= 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(960 + (locoTier || 0) * 140, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.13);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Zvuk odpálení rakety (pro vylepšené mašinky Hokkaido / Tryskovou / Vesmírnou)
  function playRocketWhooshSound() {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  // Veselý zvuk přejetí / rozbití překážky nebo výskoku na hrbolu
  function playObstacleFunSound(obsType) {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      if (obsType === 'bump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
      } else if (obsType === 'tree') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(290, now + 0.14);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  // Slavnostní fanfára při novém vagónku, novém levelu nebo evoluci mašinky!
  function playEvolutionFanfareSound() {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var notes = [523.25, 659.25, 783.99, 1046.50];
      for (var i = 0; i < notes.length; i++) {
        var now = ctx.currentTime + i * 0.08;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      }
    } catch (e) {}
  }

  // Jemné drcnutí, když mašinka spadne do díry (motivuje dítě vyskočit včas!)
  function playHoleDipThudSound() {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(72, now + 0.16);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  // Zvuk sestřelení létajícího UFO
  function playUfoBoomSound() {
    var ctx = getMinigameAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.24);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  // ==========================================================================
  // MINIHRA 1: "SAMÁ DÍRA" (sama_dira) — KREATIVNÍ VÍCEÚROVŇOVÁ EDICE S UFO
  // - Každých 60 sekund nový Level s kreativními překážkami (krabice, stromy,
  //   hrboly/skokánky, balíky sena, duhové dorty, vesmírné krystaly).
  // - Na obloze létají barevná UFO s mimozemšťánkem, která může mašinka
  //   sestřelit červenými lasery a raketami (šipka dolů ▼)!
  // - Vagónky nasbírané v minihře zůstávají pouze uvnitř minihry (max 5).
  // - Bez zbytečných komentářů nad vláčkem.
  // ==========================================================================
  var BALL_PALETTE = [
    '#f43f5e', // rubínově červená
    '#a855f7', // magická fialová
    '#3b82f6', // azurově modrá
    '#10b981', // smaragdově zelená
    '#f59e0b', // jantarově zlatá
    '#ec4899'  // cukrově růžová
  ];

  var UFO_PALETTE = [
    '#a855f7',
    '#06b6d4',
    '#ec4899',
    '#10b981',
    '#f59e0b'
  ];

  var WAGON_COLORS = [
    { body: '#f59e0b', roof: '#fde047', cargo: 'coal' },
    { body: '#ec4899', roof: '#fbcfe8', cargo: 'crystals' },
    { body: '#3b82f6', roof: '#bae6fd', cargo: 'stars' },
    { body: '#10b981', roof: '#a7f3d0', cargo: 'gifts' },
    { body: '#8b5cf6', roof: '#ddd6fe', cargo: 'rockets' }
  ];

  var LOCO_TIERS = [
    {
      tier: 0,
      name: '🚂 Klasická parní mašinka',
      badgeColor: '#14b8a6',
      announce: 'Jedeme! Sbírej body a sestřeluj UFO — za každých 100 bodů dostaneš vagónek a za 5 vagónků novou mašinku!'
    },
    {
      tier: 1,
      name: '🚄 Rychlovlak Hokkaido Shinkansen',
      badgeColor: '#10b981',
      announce: 'Páni! Nasbírali jsme 5 vagónků! Tvoje mašinka se proměnila v japonský rychlovlak Hokkaido a střílí i rakety!'
    },
    {
      tier: 2,
      name: '🚀 Zlatý tryskový expres s tryskama',
      badgeColor: '#f59e0b',
      announce: 'Neuvěřitelné! Dalších 5 vagónků! Teď řídíš Zlatý tryskový expres s tryskovým pohonem a dvojitými raketami!'
    },
    {
      tier: 3,
      name: '🛸 Vesmírná galaktická mašinka',
      badgeColor: '#a855f7',
      announce: 'Jupí! Maximální evoluce! Řídíš futuristickou vesmírnou mašinku s plazmovými tryskama, lasery a vesmírnými raketami!'
    }
  ];

  var OBSTACLE_CATALOG = [
    { type: 'box',     label: 'Dřevěná krabice',   w: 44, h: 42, color: '#d97706' },
    { type: 'bump',    label: 'Skokánek na trati', w: 68, h: 26, color: '#f59e0b' },
    { type: 'tree',    label: 'Pohádkový stromek', w: 42, h: 58, color: '#16a34a' },
    { type: 'hay',     label: 'Kulaty balík sena', w: 48, h: 44, color: '#eab308' },
    { type: 'cake',    label: 'Obří duhový dort',  w: 48, h: 48, color: '#ec4899' },
    { type: 'crystal', label: 'Vesmírný krystal',  w: 42, h: 56, color: '#38bdf8' }
  ];

  var samaDiraState = {
    score: 0,
    distance: 0,
    elapsedTime: 0,
    level: 1,
    locoTier: 0,
    wagonsCount: 0,
    totalWagonsEarned: 0,
    speed: 255,
    wheelAngle: 0,
    trainY: 0,          // Výška nad kolejemi (0 = na kolejích, >0 = ve vzduchu, <0 = spadl do díry)
    trainVy: 0,
    jumpsUsed: 0,
    inHoleDip: false,
    trailHistory: [],   // Historie výšky mašinky pro plynulé poskakování připojených vagónků
    holes: [],
    obstacles: [],      // Kreativní překážky na trati (krabice, stromy, hrboly, balíky sena, dorty, krystaly)
    stars: [],
    balls: [],          // Létající barevné kuličky
    ufos: [],           // Létající talíře UFO na obloze, které lze sestřelit
    lasers: [],         // Krátké červené lasery vystřelené mašinkou
    rockets: [],        // Naváděné rakety s kouřovou stopou (od tieru 1 Hokkaido výše)
    clouds: [],
    puffs: [],
    sparkles: [],
    hudApi: null
  };

  function pickObstacleSpecForLevel(level) {
    var maxIndex = Math.min(OBSTACLE_CATALOG.length, 3 + level);
    var idx = Math.floor(Math.random() * maxIndex);
    return OBSTACLE_CATALOG[idx];
  }

  function createObstacleAt(xPos, level) {
    var spec = pickObstacleSpecForLevel(level);
    return {
      x: xPos,
      type: spec.type,
      label: spec.label,
      width: spec.w,
      height: spec.h,
      color: spec.color,
      interacted: false,
      clearedRewarded: false,
      squashed: false,
      squashProgress: 0
    };
  }

  function spawnInitialSamaDiraWorld() {
    samaDiraState.holes = [];
    samaDiraState.obstacles = [];
    samaDiraState.stars = [];
    samaDiraState.balls = [];
    samaDiraState.ufos = [];
    samaDiraState.lasers = [];
    samaDiraState.rockets = [];
    samaDiraState.clouds = [];
    samaDiraState.puffs = [];
    samaDiraState.sparkles = [];
    samaDiraState.trailHistory = [];
    samaDiraState.inHoleDip = false;

    for (var t = 0; t < 240; t++) {
      samaDiraState.trailHistory.push(0);
    }

    for (var c = 0; c < 6; c++) {
      samaDiraState.clouds.push({
        x: c * 280 + Math.random() * 120,
        y: 65 + Math.random() * 95,
        scale: 0.75 + Math.random() * 0.55,
        speed: 22 + Math.random() * 18
      });
    }

    var nextHoleX = 640;
    for (var i = 0; i < 6; i++) {
      var holeW = 104 + (i % 3) * 18;
      samaDiraState.holes.push({
        x: nextHoleX,
        width: holeW,
        fellIn: false,
        clearedRewarded: false
      });

      // Oblouk hvězdiček nad dírou (navádí dítě ke skoku před dírou)
      samaDiraState.stars.push({
        x: nextHoleX + holeW * 0.5,
        heightAboveTrack: 118,
        collected: false,
        isDiamond: (i % 2 === 1)
      });

      // Kreativní překážka uprostřed mezi dírami (krabice, stromek, hrbol/skokánek...)
      var obsX = nextHoleX + holeW + 185;
      var obs = createObstacleAt(obsX, samaDiraState.level);
      samaDiraState.obstacles.push(obs);

      // Hvězdička nebo diamant vysoko nad překážkou (motivuje k přeskočení překážky!)
      samaDiraState.stars.push({
        x: obsX + obs.width * 0.5,
        heightAboveTrack: obs.height + 68,
        collected: false,
        isDiamond: (i % 3 === 0)
      });

      nextHoleX += 470 + Math.floor(Math.random() * 130);
    }

    // Létající barevné kuličky ve vzduchu (lze je sestřelit červeným laserem/raketou ▼ nebo sebrat ve výskoku)
    for (var b = 0; b < 8; b++) {
      samaDiraState.balls.push({
        x: 420 + b * 240 + Math.random() * 80,
        baseHeight: 52 + (b % 4) * 36,
        amp: 14 + (b % 3) * 7,
        freq: 2.2 + (b % 3) * 0.55,
        phase: b * 1.1,
        r: 17 + (b % 2) * 3,
        speedOffset: 25 + (b % 3) * 18,
        color: BALL_PALETTE[b % BALL_PALETTE.length]
      });
    }

    // Létající talíře UFO na obloze (lze je sestřelit červenými lasery a raketami ▼)
    for (var u = 0; u < 4; u++) {
      samaDiraState.ufos.push({
        x: 520 + u * 360 + Math.random() * 110,
        baseHeight: 115 + (u % 3) * 42,
        amp: 20 + (u % 2) * 10,
        freq: 1.8 + (u % 3) * 0.45,
        phase: u * 1.5,
        rx: 34,
        ry: 13,
        speedOffset: 42 + (u % 3) * 20,
        hullColor: UFO_PALETTE[u % UFO_PALETTE.length]
      });
    }
  }

  function updateHudScoreAndBadges() {
    if (samaDiraState.hudApi && samaDiraState.hudApi.setScoreText) {
      samaDiraState.hudApi.setScoreText(
        '⭐ ' + samaDiraState.score + '  •  🚃 ' + samaDiraState.wagonsCount + '/5  •  LVL ' + samaDiraState.level
      );
    }
  }

  function addSamaDiraPoints(pts) {
    var prevScore = samaDiraState.score;
    samaDiraState.score += pts;

    var prevHundreds = Math.floor(prevScore / 100);
    var newHundreds = Math.floor(samaDiraState.score / 100);

    var prevTier = samaDiraState.locoTier;
    var computedTier = Math.min(LOCO_TIERS.length - 1, Math.floor(samaDiraState.score / 500));

    // Počet vagónků čistě uvnitř minihry (max 5; nepřenáší se ven do 3D světa!)
    if (computedTier >= LOCO_TIERS.length - 1 && samaDiraState.score >= 1500) {
      samaDiraState.wagonsCount = Math.min(5, Math.floor((samaDiraState.score - 1500) / 100) + 1);
    } else {
      samaDiraState.wagonsCount = Math.min(5, Math.floor((samaDiraState.score % 500) / 100));
    }

    if (newHundreds > prevHundreds) {
      samaDiraState.totalWagonsEarned += (newHundreds - prevHundreds);

      if (computedTier > prevTier) {
        samaDiraState.locoTier = computedTier;
        var tierInfo = LOCO_TIERS[computedTier];
        playEvolutionFanfareSound();
        if (typeof window.speakCharacter === 'function') {
          window.speakCharacter('train', tierInfo.name, tierInfo.badgeColor, tierInfo.announce);
        }
      } else {
        playEvolutionFanfareSound();
      }
    }

    updateHudScoreAndBadges();

    if (window.pState) {
      window.pState.score = (window.pState.score || 0) + pts;
      var mainScoreEl = document.getElementById('score-val');
      if (mainScoreEl) mainScoreEl.textContent = window.pState.score;
    }
  }

  function triggerTrainJump() {
    // 1. Skok ze země nebo těsně u země (s čistým cinknutím mince místo houkání!)
    if (samaDiraState.trainY <= 18 && samaDiraState.jumpsUsed === 0) {
      samaDiraState.trainVy = 605 + samaDiraState.locoTier * 20;
      samaDiraState.jumpsUsed = 1;
      samaDiraState.inHoleDip = false;
      playJumpCoinChime(false);

      for (var i = 0; i < 6; i++) {
        samaDiraState.puffs.push({
          x: 0,
          y: 0,
          vx: -40 - Math.random() * 50,
          vy: 45 + Math.random() * 55,
          r: 10 + Math.random() * 8,
          alpha: 0.9,
          color: i % 2 === 0 ? '#fde047' : '#38bdf8'
        });
      }
      return true;
    }

    // 2. Druhý pomocný skok ve vzduchu (nebo vyskočení z díry)
    if (samaDiraState.jumpsUsed === 1 && samaDiraState.trainVy < 270) {
      samaDiraState.trainVy = 465 + samaDiraState.locoTier * 20;
      samaDiraState.jumpsUsed = 2;
      samaDiraState.inHoleDip = false;
      playJumpCoinChime(true);

      for (var j = 0; j < 5; j++) {
        samaDiraState.puffs.push({
          x: 0,
          y: 0,
          vx: -30 - Math.random() * 40,
          vy: 30 + Math.random() * 40,
          r: 9 + Math.random() * 6,
          alpha: 0.9,
          color: '#f472b6'
        });
      }
      return true;
    }
    return false;
  }

  // Vystřelení červených laserů A naváděných raket při stisku šipky dolů (▼)
  function triggerTrainLaser() {
    var w = window.innerWidth || 1280;
    var trainCenterX = Math.min(280, Math.max(150, w * 0.24));
    var noseX = trainCenterX + 60;
    var baseH = samaDiraState.trainY + 38;
    var tier = samaDiraState.locoTier;

    playLaserPewSound(tier);

    // 1. Krátké červené lasery ve 3 úhlech (na překážky na trati, kuličky uprostřed i vysoko létající UFO!)
    samaDiraState.lasers.push({
      x: noseX,
      heightAboveTrack: Math.max(18, baseH - 12),
      vx: 920 + tier * 80,
      vy: -8,
      len: 40 + tier * 6,
      life: 0.72
    });
    samaDiraState.lasers.push({
      x: noseX,
      heightAboveTrack: baseH + 8,
      vx: 880 + tier * 80,
      vy: 145,
      len: 38 + tier * 6,
      life: 0.75
    });
    samaDiraState.lasers.push({
      x: noseX,
      heightAboveTrack: baseH + 16,
      vx: 850 + tier * 80,
      vy: 265,
      len: 40 + tier * 6,
      life: 0.78
    });

    // Vesmírná mašinka (tier 3) střílí navíc čtvrtý středový turbo-laser!
    if (tier >= 3) {
      samaDiraState.lasers.push({
        x: noseX + 6,
        heightAboveTrack: baseH,
        vx: 1060,
        vy: 65,
        len: 52,
        life: 0.78
      });
    }

    // 2. Od mašinky Hokkaido (tier >= 1) střílí mašinka také naváděné RAKETY s plamenem!
    if (tier >= 1) {
      playRocketWhooshSound();
      var rocketCount = tier >= 2 ? 2 : 1;
      for (var ri = 0; ri < rocketCount; ri++) {
        samaDiraState.rockets.push({
          x: noseX - 6,
          heightAboveTrack: baseH + 14 + ri * 18,
          vx: 640 + tier * 65,
          vy: (ri === 0 ? 60 : 180),
          life: 1.35,
          tier: tier
        });
      }
    }

    return true;
  }

  function spawnObstacleBurstParticles(x, heightAboveTrack, color, count) {
    for (var i = 0; i < count; i++) {
      var ang = (i / count) * Math.PI * 2;
      var spd = 75 + Math.random() * 115;
      samaDiraState.sparkles.push({
        x: x,
        y: heightAboveTrack,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd + 40,
        alpha: 1.0,
        color: i % 2 === 0 ? color : '#fde047'
      });
    }
  }

  window.HappyTrainMinigames.register('sama_dira', {
    title: 'Samá díra',

    start: function(options, hudApi) {
      samaDiraState.score = 0;
      samaDiraState.distance = 0;
      samaDiraState.elapsedTime = 0;
      samaDiraState.level = 1;
      samaDiraState.locoTier = 0;
      samaDiraState.wagonsCount = 0;
      samaDiraState.totalWagonsEarned = 0;
      samaDiraState.speed = 255;
      samaDiraState.trainY = 0;
      samaDiraState.trainVy = 0;
      samaDiraState.jumpsUsed = 0;
      samaDiraState.inHoleDip = false;
      samaDiraState.hudApi = hudApi;

      spawnInitialSamaDiraWorld();
      updateHudScoreAndBadges();

      if (typeof window.playMagicSubwaySound === 'function') {
        window.playMagicSubwaySound();
      }
      if (typeof window.speakCharacter === 'function') {
        window.speakCharacter(
          'train',
          '🚂 Little Train Toby',
          '#0d9488',
          'Jedeme! Skákej přes díry a sestřeluj létající UFO! Za každých 100 bodů dostaneš vagónek a za 5 vagónků novou mašinku!'
        );
      }
    },

    onAction: function(action) {
      if (action === 'DOWN') {
        return triggerTrainLaser();
      }
      if (action === 'JUMP' || action === 'CONFIRM' || action === 'UP') {
        return triggerTrainJump();
      }
      return false;
    },

    update: function(dt, w, h) {
      // 1. Časovač levelů — každou 1 minutu (60 sekund) postup do dalšího Levelu!
      samaDiraState.elapsedTime += dt;
      var targetLevel = 1 + Math.floor(samaDiraState.elapsedTime / 60);
      if (targetLevel > samaDiraState.level) {
        samaDiraState.level = targetLevel;
        samaDiraState.speed = Math.min(340, 255 + (samaDiraState.level - 1) * 18);
        addSamaDiraPoints(50);
        playEvolutionFanfareSound();
        if (typeof window.speakCharacter === 'function') {
          window.speakCharacter(
            'mom',
            '👩 Maminka',
            '#ec4899',
            'Skvělá práce! Postupuješ do dalšího levelu!'
          );
        }
      }

      var spd = samaDiraState.speed + samaDiraState.locoTier * 14;
      samaDiraState.distance += spd * dt;
      samaDiraState.wheelAngle += dt * 9.8;

      // Uložíme aktuální výšku mašinky do historie pro připojené vagónky
      samaDiraState.trailHistory.unshift(samaDiraState.trainY);
      if (samaDiraState.trailHistory.length > 260) {
        samaDiraState.trailHistory.pop();
      }

      // Posun obláčků
      for (var ci = 0; ci < samaDiraState.clouds.length; ci++) {
        var cl = samaDiraState.clouds[ci];
        cl.x -= cl.speed * dt;
        if (cl.x < -180) {
          cl.x = w + 160;
        }
      }

      // Posun děr v kolejích
      var trainCenterX = Math.min(280, Math.max(150, w * 0.24));
      var overHole = null;

      for (var hi = 0; hi < samaDiraState.holes.length; hi++) {
        var hole = samaDiraState.holes[hi];
        hole.x -= spd * dt;

        // Kontrola, zda je mašinka nad dírou
        if (trainCenterX > hole.x + 12 && trainCenterX < hole.x + hole.width - 10) {
          overHole = hole;
        }

        // Odměna +20 ⭐ za čisté přeskočení díry bez spadnutí
        if (!hole.fellIn && !hole.clearedRewarded && hole.x + hole.width < trainCenterX - 24) {
          hole.clearedRewarded = true;
          addSamaDiraPoints(20);
        }
      }

      // Recyklace děr, které odjely doleva, a generování nových překážek mezi nimi
      var firstHole = samaDiraState.holes[0];
      if (firstHole && firstHole.x + firstHole.width < -120) {
        var lastHole = samaDiraState.holes[samaDiraState.holes.length - 1];
        var newX = Math.max(w + 190, lastHole.x + 450 + Math.floor(Math.random() * 140));
        var newW = 100 + Math.floor(Math.random() * 36);
        firstHole.x = newX;
        firstHole.width = newW;
        firstHole.fellIn = false;
        firstHole.clearedRewarded = false;
        samaDiraState.holes.push(samaDiraState.holes.shift());

        // Přidáme hvězdičku nad díru
        samaDiraState.stars.push({
          x: newX + newW * 0.5,
          heightAboveTrack: 118,
          collected: false,
          isDiamond: Math.random() < 0.45
        });

        // Přidáme kreativní překážku za díru (v Levelu 2+ mohou být i 2 překážky za sebou s rozestupem!)
        var obsX1 = newX + newW + 170;
        var newObs1 = createObstacleAt(obsX1, samaDiraState.level);
        samaDiraState.obstacles.push(newObs1);

        samaDiraState.stars.push({
          x: obsX1 + newObs1.width * 0.5,
          heightAboveTrack: newObs1.height + 68,
          collected: false,
          isDiamond: Math.random() < 0.4
        });

        if (samaDiraState.level >= 2 && Math.random() < 0.55) {
          var obsX2 = obsX1 + 145;
          var newObs2 = createObstacleAt(obsX2, samaDiraState.level);
          samaDiraState.obstacles.push(newObs2);
        }
      }

      // Posun a interakce s kreativními překážkami na kolejích (MAŠINKA NIKDY NEZASTAVÍ!)
      for (var oi = samaDiraState.obstacles.length - 1; oi >= 0; oi--) {
        var obs = samaDiraState.obstacles[oi];
        obs.x -= spd * dt;

        if (obs.squashed) {
          obs.squashProgress = Math.min(1, obs.squashProgress + dt * 5.0);
        }

        if (obs.x + obs.width < -140) {
          samaDiraState.obstacles.splice(oi, 1);
          continue;
        }

        // 1. Kontrola zásahu překážky červeným laserem nebo raketou (kromě skokánku/hrbolu)
        if (!obs.interacted && obs.type !== 'bump') {
          var hitByProjectile = false;

          for (var lzi = samaDiraState.lasers.length - 1; lzi >= 0; lzi--) {
            var lzr = samaDiraState.lasers[lzi];
            if (
              lzr.x + lzr.len > obs.x &&
              lzr.x < obs.x + obs.width &&
              lzr.heightAboveTrack >= -5 &&
              lzr.heightAboveTrack <= obs.height + 22
            ) {
              samaDiraState.lasers.splice(lzi, 1);
              hitByProjectile = true;
              break;
            }
          }

          if (!hitByProjectile) {
            for (var rki = samaDiraState.rockets.length - 1; rki >= 0; rki--) {
              var rkt = samaDiraState.rockets[rki];
              if (
                rkt.x + 24 > obs.x &&
                rkt.x - 12 < obs.x + obs.width &&
                rkt.heightAboveTrack >= -8 &&
                rkt.heightAboveTrack <= obs.height + 28
              ) {
                samaDiraState.rockets.splice(rki, 1);
                hitByProjectile = true;
                break;
              }
            }
          }

          if (hitByProjectile) {
            obs.interacted = true;
            obs.clearedRewarded = true;
            addSamaDiraPoints(20);
            playObstacleFunSound(obs.type);
            spawnObstacleBurstParticles(obs.x + obs.width * 0.5, obs.height * 0.6, obs.color, 14);
            samaDiraState.obstacles.splice(oi, 1);
            continue;
          }
        }

        // 2. Kontrola kontaktu mašinky s překážkou
        var trainFrontX = trainCenterX + 46;
        var trainBackX = trainCenterX - 46;
        if (!obs.interacted && trainFrontX > obs.x + 6 && trainBackX < obs.x + obs.width - 6) {
          if (samaDiraState.trainY >= obs.height - 8) {
            // Dítě vyskočilo nad překážku
          } else {
            // Mašinka do překážky narazila — NIKDY NEZASTAVÍ, ale vesele ji přejede!
            obs.interacted = true;
            obs.clearedRewarded = true;
            playObstacleFunSound(obs.type);

            if (obs.type === 'bump') {
              samaDiraState.trainVy = Math.max(samaDiraState.trainVy, 480);
              samaDiraState.trainY = Math.max(samaDiraState.trainY, 6);
              samaDiraState.jumpsUsed = 1;
              addSamaDiraPoints(15);
              spawnObstacleBurstParticles(obs.x + obs.width * 0.5, 18, '#fde047', 10);
            } else if (obs.type === 'tree') {
              obs.squashed = true;
              samaDiraState.trainVy = Math.max(samaDiraState.trainVy, 210);
              samaDiraState.trainY = Math.max(0, samaDiraState.trainY + 4);
              addSamaDiraPoints(8);
              spawnObstacleBurstParticles(obs.x + obs.width * 0.5, 34, '#4ade80', 12);
            } else {
              obs.squashed = true;
              samaDiraState.trainVy = Math.max(samaDiraState.trainVy, 185);
              samaDiraState.trainY = Math.max(0, samaDiraState.trainY + 3);
              addSamaDiraPoints(8);
              spawnObstacleBurstParticles(obs.x + obs.width * 0.5, obs.height * 0.6, obs.color, 14);
            }
          }
        }

        // 3. Odměna +20 ⭐ za čisté přeskočení překážky
        if (!obs.interacted && !obs.clearedRewarded && obs.x + obs.width < trainBackX - 8) {
          obs.clearedRewarded = true;
          addSamaDiraPoints(20);
          playJumpCoinChime(true);
        }
      }

      // Fyzika skoku a spadnutí/vyjetí z díry (BEZ PRUŽINKY!)
      if (samaDiraState.trainY > 0 || samaDiraState.trainVy > 0) {
        samaDiraState.trainY += samaDiraState.trainVy * dt;
        samaDiraState.trainVy -= 1280 * dt;

        if (!overHole && samaDiraState.trainY <= 0) {
          samaDiraState.trainY = 0;
          samaDiraState.trainVy = 0;
          samaDiraState.jumpsUsed = 0;
          samaDiraState.inHoleDip = false;
        }
      }

      if (overHole && samaDiraState.trainY <= 0) {
        var holeProgress = Math.max(0, Math.min(1, (trainCenterX - overHole.x) / overHole.width));
        if (!overHole.fellIn) {
          overHole.fellIn = true;
          samaDiraState.inHoleDip = true;
          addSamaDiraPoints(5);
          playHoleDipThudSound();

          for (var dp = 0; dp < 6; dp++) {
            samaDiraState.puffs.push({
              x: trainCenterX - 10 + (dp - 3) * 12,
              y: -12,
              vx: -35 - Math.random() * 35,
              vy: 25 + Math.random() * 45,
              r: 9 + Math.random() * 6,
              alpha: 0.85,
              color: '#d97706'
            });
          }
        }

        var targetDipY;
        if (holeProgress < 0.28) {
          targetDipY = -32 * (holeProgress / 0.28);
        } else if (holeProgress < 0.68) {
          targetDipY = -32 + Math.sin(holeProgress * 28) * 2.5;
        } else {
          targetDipY = -32 * (1 - (holeProgress - 0.68) / 0.32);
        }
        samaDiraState.trainY += (targetDipY - samaDiraState.trainY) * Math.min(1, dt * 18);
        samaDiraState.trainVy = 0;
        samaDiraState.jumpsUsed = 0;
      } else if (!overHole && samaDiraState.trainY < 0) {
        samaDiraState.trainY = Math.min(0, samaDiraState.trainY + 240 * dt);
        if (samaDiraState.trainY >= -0.5) {
          samaDiraState.trainY = 0;
          samaDiraState.inHoleDip = false;
        }
        samaDiraState.trainVy = 0;
        samaDiraState.jumpsUsed = 0;
      }

      // Posun krátkých červených laserů
      for (var li = samaDiraState.lasers.length - 1; li >= 0; li--) {
        var lz = samaDiraState.lasers[li];
        lz.x += lz.vx * dt;
        lz.heightAboveTrack += lz.vy * dt;
        lz.life -= dt;
        if (lz.life <= 0 || lz.x > w + 120) {
          samaDiraState.lasers.splice(li, 1);
        }
      }

      // Posun a jemné navádění raket (na nejbližší UFO nebo kuličku!)
      for (var rki2 = samaDiraState.rockets.length - 1; rki2 >= 0; rki2--) {
        var rkt2 = samaDiraState.rockets[rki2];
        var bestTargetY = null;
        var bestDistX = 9999;

        for (var uiT = 0; uiT < samaDiraState.ufos.length; uiT++) {
          var uCand = samaDiraState.ufos[uiT];
          var dxU = uCand.x - rkt2.x;
          if (dxU > 10 && dxU < bestDistX) {
            bestDistX = dxU;
            bestTargetY = uCand.currentHeight || uCand.baseHeight;
          }
        }
        for (var biT = 0; biT < samaDiraState.balls.length; biT++) {
          var bCand = samaDiraState.balls[biT];
          var dxB = bCand.x - rkt2.x;
          if (dxB > 10 && dxB < bestDistX) {
            bestDistX = dxB;
            bestTargetY = bCand.currentHeight || bCand.baseHeight;
          }
        }
        if (bestTargetY !== null) {
          var dyTarget = bestTargetY - rkt2.heightAboveTrack;
          rkt2.vy += Math.max(-460, Math.min(460, dyTarget * 6.5)) * dt;
        }

        rkt2.x += rkt2.vx * dt;
        rkt2.heightAboveTrack += rkt2.vy * dt;
        rkt2.life -= dt;

        // Kouřová/plazmová stopa za raketou
        if (Math.random() < 0.65) {
          samaDiraState.puffs.push({
            x: rkt2.x - 10,
            y: rkt2.heightAboveTrack,
            vx: -60 - Math.random() * 30,
            vy: (Math.random() - 0.5) * 25,
            r: 5 + Math.random() * 4,
            alpha: 0.75,
            color: rkt2.tier >= 3 ? '#c084fc' : '#fb923c'
          });
        }

        if (rkt2.life <= 0 || rkt2.x > w + 140) {
          samaDiraState.rockets.splice(rki2, 1);
        }
      }

      // Pohyb létajících UFO na obloze a detekce sestřelení laserem nebo raketou!
      for (var ui = 0; ui < samaDiraState.ufos.length; ui++) {
        var ufo = samaDiraState.ufos[ui];
        ufo.x -= (spd * 0.65 + ufo.speedOffset) * dt;
        var ufoHeight = ufo.baseHeight + Math.sin(samaDiraState.distance * 0.011 * ufo.freq + ufo.phase) * ufo.amp;
        ufo.currentHeight = ufoHeight;

        var ufoHit = false;

        // 1. Zásah červeným laserem
        for (var lziU = samaDiraState.lasers.length - 1; lziU >= 0; lziU--) {
          var lzrU = samaDiraState.lasers[lziU];
          var uldx = ufo.x - (lzrU.x + lzrU.len * 0.5);
          var uldy = ufoHeight - lzrU.heightAboveTrack;
          if (Math.abs(uldx) < ufo.rx + lzrU.len * 0.55 && Math.abs(uldy) < ufo.ry + 24) {
            samaDiraState.lasers.splice(lziU, 1);
            ufoHit = true;
            break;
          }
        }

        // 2. Zásah naváděnou raketou
        if (!ufoHit) {
          for (var rkiU = samaDiraState.rockets.length - 1; rkiU >= 0; rkiU--) {
            var rktU = samaDiraState.rockets[rkiU];
            var urdx = ufo.x - rktU.x;
            var urdy = ufoHeight - rktU.heightAboveTrack;
            if (Math.abs(urdx) < ufo.rx + 26 && Math.abs(urdy) < ufo.ry + 26) {
              samaDiraState.rockets.splice(rkiU, 1);
              ufoHit = true;
              break;
            }
          }
        }

        // 3. Kontakt s vysoko skákající mašinkou
        if (!ufoHit) {
          var utdx = ufo.x - trainCenterX;
          var utdy = ufoHeight - (samaDiraState.trainY + 46);
          if (Math.abs(utdx) < ufo.rx + 42 && Math.abs(utdy) < ufo.ry + 36) {
            ufoHit = true;
          }
        }

        if (ufoHit) {
          addSamaDiraPoints(30);
          playUfoBoomSound();
          spawnObstacleBurstParticles(ufo.x, ufoHeight, ufo.hullColor, 18);
          ufo.x = w + 180 + Math.random() * 320;
          ufo.baseHeight = 110 + Math.random() * 95;
          ufo.hullColor = UFO_PALETTE[Math.floor(Math.random() * UFO_PALETTE.length)];
        } else if (ufo.x < -90) {
          ufo.x = w + 160 + Math.random() * 280;
          ufo.baseHeight = 110 + Math.random() * 95;
          ufo.hullColor = UFO_PALETTE[Math.floor(Math.random() * UFO_PALETTE.length)];
        }
      }

      // Pohyb létajících barevných kuliček a detekce zásahu červeným laserem, raketou nebo mašinkou
      for (var bi = 0; bi < samaDiraState.balls.length; bi++) {
        var ball = samaDiraState.balls[bi];
        ball.x -= (spd * 0.72 + ball.speedOffset) * dt;
        var ballHeight = ball.baseHeight + Math.sin(samaDiraState.distance * 0.012 * ball.freq + ball.phase) * ball.amp;
        ball.currentHeight = ballHeight;

        var popped = false;

        // 1. Zásah krátkým červeným laserem
        for (var lzi2 = samaDiraState.lasers.length - 1; lzi2 >= 0; lzi2--) {
          var lzr2 = samaDiraState.lasers[lzi2];
          var ldx = ball.x - (lzr2.x + lzr2.len * 0.5);
          var ldy = ballHeight - lzr2.heightAboveTrack;
          if (Math.abs(ldx) < ball.r + lzr2.len * 0.55 && Math.abs(ldy) < ball.r + 18) {
            samaDiraState.lasers.splice(lzi2, 1);
            popped = true;
            break;
          }
        }

        // 2. Zásah naváděnou raketou
        if (!popped) {
          for (var rki3 = samaDiraState.rockets.length - 1; rki3 >= 0; rki3--) {
            var rkt3 = samaDiraState.rockets[rki3];
            var rdx = ball.x - rkt3.x;
            var rdy = ballHeight - rkt3.heightAboveTrack;
            if (Math.abs(rdx) < ball.r + 24 && Math.abs(rdy) < ball.r + 22) {
              samaDiraState.rockets.splice(rki3, 1);
              popped = true;
              break;
            }
          }
        }

        // 3. Sebrání kuličky přímo mašinkou při skoku
        if (!popped) {
          var bdx = ball.x - trainCenterX;
          var bdy = ballHeight - (samaDiraState.trainY + 44);
          if (bdx * bdx + bdy * bdy < (ball.r + 44) * (ball.r + 44)) {
            popped = true;
          }
        }

        if (popped) {
          addSamaDiraPoints(15);
          playJumpCoinChime(true);
          spawnObstacleBurstParticles(ball.x, ballHeight, ball.color, 12);
          ball.x = w + 160 + Math.random() * 260;
          ball.baseHeight = 48 + Math.random() * 115;
          ball.color = BALL_PALETTE[Math.floor(Math.random() * BALL_PALETTE.length)];
        } else if (ball.x < -80) {
          ball.x = w + 140 + Math.random() * 240;
          ball.baseHeight = 48 + Math.random() * 115;
          ball.color = BALL_PALETTE[Math.floor(Math.random() * BALL_PALETTE.length)];
        }
      }

      // Sbírání hvězdiček (+10 ⭐) a diamantů (+25 ⭐)
      for (var si = samaDiraState.stars.length - 1; si >= 0; si--) {
        var st = samaDiraState.stars[si];
        st.x -= spd * dt;
        if (st.x < -100) {
          samaDiraState.stars.splice(si, 1);
          continue;
        }
        if (!st.collected) {
          var dx = st.x - trainCenterX;
          var dy = st.heightAboveTrack - (samaDiraState.trainY + 42);
          if (dx * dx + dy * dy < 68 * 68) {
            st.collected = true;
            var pts = st.isDiamond ? 25 : 10;
            addSamaDiraPoints(pts);
            if (typeof window.playCollectSound === 'function') {
              window.playCollectSound();
            }
            spawnObstacleBurstParticles(st.x, st.heightAboveTrack, st.isDiamond ? '#38bdf8' : '#fde047', 8);
          }
        }
      }

      // Kouř z komína (pro parní mašinku) nebo trysková plazma (pro tryskovou a vesmírnou mašinku)
      if (Math.random() < 0.45) {
        if (samaDiraState.locoTier === 0) {
          samaDiraState.puffs.push({
            x: trainCenterX + 34,
            y: samaDiraState.trainY + 86,
            vx: -65 - Math.random() * 25,
            vy: 38 + Math.random() * 25,
            r: 8 + Math.random() * 6,
            alpha: 0.75,
            color: '#f8fafc'
          });
        } else if (samaDiraState.locoTier >= 2) {
          samaDiraState.puffs.push({
            x: trainCenterX - 62,
            y: samaDiraState.trainY + 28,
            vx: -140 - Math.random() * 45,
            vy: (Math.random() - 0.5) * 20,
            r: 7 + Math.random() * 5,
            alpha: 0.85,
            color: samaDiraState.locoTier === 3 ? '#38bdf8' : '#fb923c'
          });
        }
      }

      for (var pi = samaDiraState.puffs.length - 1; pi >= 0; pi--) {
        var pf = samaDiraState.puffs[pi];
        if (pf.x === 0 && pf.y === 0) {
          pf.x = trainCenterX + 32;
          pf.y = samaDiraState.trainY + 84;
        }
        pf.x += pf.vx * dt;
        pf.y += pf.vy * dt;
        pf.r += 14 * dt;
        pf.alpha -= 0.95 * dt;
        if (pf.alpha <= 0) samaDiraState.puffs.splice(pi, 1);
      }

      for (var ki = samaDiraState.sparkles.length - 1; ki >= 0; ki--) {
        var sk = samaDiraState.sparkles[ki];
        sk.x += sk.vx * dt;
        sk.y += sk.vy * dt;
        sk.alpha -= 1.8 * dt;
        if (sk.alpha <= 0) samaDiraState.sparkles.splice(ki, 1);
      }
    },

    render: function(ctx, w, h) {
      var groundY = Math.floor(h * 0.72);
      var trainCenterX = Math.min(280, Math.max(150, w * 0.24));
      var trainName = (typeof window.getTrainName === 'function') ? window.getTrainName() : 'Daníček';
      var tier = samaDiraState.locoTier;

      // 1. Pohádková obloha (mění jemně atmosféru podle Levelu a vesmírné evoluce!)
      var skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (tier >= 3) {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.55, '#4c1d95');
        skyGrad.addColorStop(1, '#7dd3fc');
      } else if (samaDiraState.level % 3 === 2) {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#fde68a');
      } else {
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Sluníčko / planeta
      ctx.fillStyle = tier >= 3 ? '#f472b6' : '#fde047';
      ctx.beginPath();
      ctx.arc(w - 110, 95, 42, 0, Math.PI * 2);
      ctx.fill();
      if (tier >= 3) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(w - 110, 95, 64, 16, -0.25, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Obláčky
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      for (var ci = 0; ci < samaDiraState.clouds.length; ci++) {
        var cl = samaDiraState.clouds[ci];
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, 26 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 24 * cl.scale, cl.y - 8 * cl.scale, 32 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 52 * cl.scale, cl.y, 24 * cl.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Vzdálené zelené kopečky
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (var hx = 0; hx <= w + 60; hx += 60) {
        var hillH = Math.sin((hx + samaDiraState.distance * 0.22) * 0.008) * 38 + 52;
        ctx.lineTo(hx, groundY - hillH);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // 3. Tráva a zem pod kolejemi
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, groundY, w, 24);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, groundY + 24, w, h - groundY - 24);

      // Pražce a koleje
      var sleeperSpacing = 36;
      var offsetSleeper = -(samaDiraState.distance % sleeperSpacing);
      ctx.fillStyle = '#92400e';
      for (var sx = offsetSleeper; sx < w + sleeperSpacing; sx += sleeperSpacing) {
        ctx.fillRect(sx, groundY - 4, 18, 12);
      }
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, groundY - 10, w, 7);

      // 4. Díry v kolejích (skutečné prohlubně se šikmým výjezdem bez pružinek!)
      for (var hi = 0; hi < samaDiraState.holes.length; hi++) {
        var hole = samaDiraState.holes[hi];

        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(hole.x, groundY - 12, hole.width, 14);

        var holeDepth = 38;
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(hole.x, groundY);
        ctx.lineTo(hole.x + hole.width * 0.22, groundY + holeDepth);
        ctx.lineTo(hole.x + hole.width * 0.72, groundY + holeDepth);
        ctx.lineTo(hole.x + hole.width, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(hole.x, groundY - 4);
        ctx.lineTo(hole.x + hole.width * 0.22, groundY + holeDepth - 4);
        ctx.lineTo(hole.x + hole.width * 0.72, groundY + holeDepth - 4);
        ctx.lineTo(hole.x + hole.width, groundY - 4);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.fillRect(hole.x - 6, groundY - 14, 7, 20);
        ctx.fillRect(hole.x + hole.width - 1, groundY - 14, 7, 20);
      }

      // 4B. Kreativní překážky na kolejích (krabice, stromky, hrboly/skokánky, balíky sena, dorty, krystaly)
      for (var oi = 0; oi < samaDiraState.obstacles.length; oi++) {
        var obs = samaDiraState.obstacles[oi];
        var baseObsY = groundY - 10;
        ctx.save();
        ctx.translate(obs.x + obs.width * 0.5, baseObsY);

        if (obs.squashed) {
          ctx.scale(1.0 + obs.squashProgress * 0.35, Math.max(0.28, 1.0 - obs.squashProgress * 0.65));
        }

        if (obs.type === 'box') {
          var bw = obs.width;
          var bh = obs.height;
          ctx.fillStyle = '#d97706';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.fillRect(-bw * 0.5, -bh, bw, bh);
          ctx.strokeRect(-bw * 0.5, -bh, bw, bh);
          ctx.beginPath();
          ctx.moveTo(-bw * 0.5, -bh);
          ctx.lineTo(bw * 0.5, 0);
          ctx.moveTo(bw * 0.5, -bh);
          ctx.lineTo(-bw * 0.5, 0);
          ctx.stroke();
        } else if (obs.type === 'bump') {
          var rw = obs.width;
          var rh = obs.height;
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-rw * 0.5, 0);
          ctx.quadraticCurveTo(0, -rh * 1.8, rw * 0.5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (obs.type === 'tree') {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(-7, -20, 14, 20);
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.moveTo(0, -obs.height);
          ctx.lineTo(24, -18);
          ctx.lineTo(-24, -18);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(0, -obs.height - 6);
          ctx.lineTo(18, -32);
          ctx.lineTo(-18, -32);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === 'hay') {
          var hr = obs.height * 0.5;
          ctx.fillStyle = '#eab308';
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -hr, hr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, -hr, hr * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obs.type === 'cake') {
          var cw = obs.width;
          var ch = obs.height;
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(-cw * 0.5, -ch * 0.55, cw, ch * 0.55);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-cw * 0.4, -ch * 0.85, cw * 0.8, ch * 0.3);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, -ch, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -obs.height);
          ctx.lineTo(20, -obs.height * 0.45);
          ctx.lineTo(12, 0);
          ctx.lineTo(-12, 0);
          ctx.lineTo(-20, -obs.height * 0.45);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      // 5. Létající barevné kuličky ve vzduchu
      for (var bi = 0; bi < samaDiraState.balls.length; bi++) {
        var ball = samaDiraState.balls[bi];
        var by = groundY - (ball.currentHeight || ball.baseHeight);
        ctx.save();
        ctx.translate(ball.x, by);

        ctx.fillStyle = ball.color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, ball.r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = ball.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(-ball.r * 0.32, -ball.r * 0.32, ball.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5B. Létající talíře UFO na obloze (s mimozemšťánkem v kopuli a blikajícími světýlky!)
      var ufoLights = ['#fde047', '#38bdf8', '#f43f5e', '#4ade80', '#c084fc'];
      for (var ui = 0; ui < samaDiraState.ufos.length; ui++) {
        var ufo = samaDiraState.ufos[ui];
        var uy = groundY - (ufo.currentHeight || ufo.baseHeight);
        ctx.save();
        ctx.translate(ufo.x, uy);
        ctx.rotate(Math.sin(samaDiraState.wheelAngle * 0.8 + ui) * 0.08);

        // Jemný světelný kužel pod UFO
        ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.beginPath();
        ctx.moveTo(-12, 8);
        ctx.lineTo(12, 8);
        ctx.lineTo(26, 44);
        ctx.lineTo(-26, 44);
        ctx.closePath();
        ctx.fill();

        // Průhledná skleněná kopule UFO
        ctx.fillStyle = 'rgba(186, 230, 253, 0.88)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -4, 17, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Roztomilý zelený mimozemšťánek v kopuli
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-3, -11, 2, 0, Math.PI * 2);
        ctx.arc(3, -11, 2, 0, Math.PI * 2);
        ctx.fill();

        // Kovový talíř UFO
        ctx.fillStyle = ufo.hullColor;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, ufo.rx, ufo.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Blikající barevná světýlka po obvodu talíře
        for (var liU = -2; liU <= 2; liU++) {
          var lColIdx = (Math.floor(samaDiraState.wheelAngle * 2) + liU + 10) % ufoLights.length;
          ctx.fillStyle = ufoLights[lColIdx];
          ctx.beginPath();
          ctx.arc(liU * 11, 1, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. Hvězdičky a diamanty
      for (var si = 0; si < samaDiraState.stars.length; si++) {
        var st = samaDiraState.stars[si];
        if (st.collected) continue;
        var sy = groundY - st.heightAboveTrack + Math.sin(samaDiraState.wheelAngle + st.x * 0.02) * 6;
        ctx.save();
        ctx.translate(st.x, sy);
        if (st.isDiamond) {
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.lineTo(18, 0);
          ctx.lineTo(0, 20);
          ctx.lineTo(-18, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (var p = 0; p < 5; p++) {
            var a1 = (p * 72 - 90) * Math.PI / 180;
            var a2 = ((p * 72 + 36) - 90) * Math.PI / 180;
            ctx.lineTo(Math.cos(a1) * 20, Math.sin(a1) * 20);
            ctx.lineTo(Math.cos(a2) * 9, Math.sin(a2) * 9);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Krátké červené lasery vystřelené mašinkou (šipka dolů ▼)
      for (var li = 0; li < samaDiraState.lasers.length; li++) {
        var lz = samaDiraState.lasers[li];
        var ly = groundY - lz.heightAboveTrack;
        var angle = Math.atan2(-lz.vy, lz.vx);
        ctx.save();
        ctx.translate(lz.x, ly);
        ctx.rotate(angle);

        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.fillRect(-4, -7, lz.len + 8, 14);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, -4, lz.len, 8);
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(4, -1.8, lz.len - 8, 3.6);
        ctx.restore();
      }

      // 7B. Naváděné rakety (pro Hokkaido, Tryskový expres a Vesmírnou mašinku!)
      for (var rki = 0; rki < samaDiraState.rockets.length; rki++) {
        var rkt = samaDiraState.rockets[rki];
        var ry = groundY - rkt.heightAboveTrack;
        var rAngle = Math.atan2(-rkt.vy, rkt.vx);
        ctx.save();
        ctx.translate(rkt.x, ry);
        ctx.rotate(rAngle);

        // Plamen trysky rakety
        ctx.fillStyle = rkt.tier >= 3 ? '#38bdf8' : '#f97316';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();

        // Tělo rakety
        ctx.fillStyle = rkt.tier >= 3 ? '#f472b6' : '#f8fafc';
        ctx.fillRect(-6, -5, 18, 10);

        // Špička rakety
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(12, -6);
        ctx.lineTo(22, 0);
        ctx.lineTo(12, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Třpytky
      for (var ki = 0; ki < samaDiraState.sparkles.length; ki++) {
        var sk = samaDiraState.sparkles[ki];
        ctx.fillStyle = sk.color;
        ctx.globalAlpha = Math.max(0, sk.alpha);
        ctx.beginPath();
        ctx.arc(sk.x, groundY - sk.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Kouř a trysková plazma
      for (var pi = 0; pi < samaDiraState.puffs.length; pi++) {
        var pf = samaDiraState.puffs[pi];
        ctx.fillStyle = pf.color;
        ctx.globalAlpha = Math.max(0, pf.alpha);
        ctx.beginPath();
        ctx.arc(pf.x, groundY - pf.y, pf.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 8A. Vykreslení připojených vagónků za mašinkou (1 až 5 vagónků podle bodů!)
      var wagonSpacing = 74;
      for (var wgi = samaDiraState.wagonsCount - 1; wgi >= 0; wgi--) {
        var wagX = trainCenterX - 78 - wgi * wagonSpacing;
        if (wagX < -70) continue;
        var histIdx = Math.min(samaDiraState.trailHistory.length - 1, (wgi + 1) * 14);
        var wagY = samaDiraState.trailHistory[histIdx] || 0;
        var wagBaseY = groundY - 10 - wagY;
        var wStyle = WAGON_COLORS[wgi % WAGON_COLORS.length];

        ctx.save();
        ctx.translate(wagX, wagBaseY);

        // Spojovací táhlo k předchozímu vozu
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(28, -14);
        ctx.lineTo(48, -14);
        ctx.stroke();

        // Korba vagónku
        ctx.fillStyle = tier >= 3 ? '#312e81' : wStyle.body;
        ctx.strokeStyle = tier >= 3 ? '#38bdf8' : wStyle.roof;
        ctx.lineWidth = 2.5;
        ctx.fillRect(-28, -42, 56, 28);
        ctx.strokeRect(-28, -42, 56, 28);

        // Náklad ve vagónku (hvězdičky / krystaly)
        ctx.fillStyle = wStyle.roof;
        ctx.beginPath();
        ctx.arc(-10, -45, 7, 0, Math.PI * 2);
        ctx.arc(4, -47, 8, 0, Math.PI * 2);
        ctx.arc(16, -44, 6, 0, Math.PI * 2);
        ctx.fill();

        // Kola vagónku
        var wagWheels = [-16, 16];
        for (var wwi = 0; wwi < wagWheels.length; wwi++) {
          ctx.save();
          ctx.translate(wagWheels[wwi], -8);
          ctx.rotate(samaDiraState.wheelAngle);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = tier >= 3 ? '#38bdf8' : '#facc15';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // 8B. Vykreslení hlavní mašinky podle dosažené evoluce (Tier 0 až Tier 3!)
      var locoBaseY = groundY - 10 - samaDiraState.trainY;
      ctx.save();
      ctx.translate(trainCenterX, locoBaseY);

      var tilt = Math.max(-0.22, Math.min(0.22, -samaDiraState.trainVy * 0.00035));
      if (samaDiraState.trainY < -4) {
        tilt = -0.10;
      }
      ctx.rotate(tilt);

      if (tier === 0) {
        // --- TIER 0: KLASICKÁ PARNÍ MAŠINKA TOBY ---
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-58, -22, 116, 14);

        ctx.fillStyle = '#0d9488';
        ctx.fillRect(-54, -68, 48, 46);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-58, -74, 56, 8);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(-44, -58, 28, 22);

        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(-6, -56, 56, 34);

        ctx.fillStyle = '#e11d48';
        ctx.fillRect(48, -42, 8, 10);

        ctx.fillStyle = '#0f766e';
        ctx.fillRect(24, -82, 16, 26);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(21, -86, 22, 6);
      } else if (tier === 1) {
        // --- TIER 1: JAPONSKÝ RYCHLOVLAK SHINKANSEN HOKKAIDO (H5) ---
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-60, -14);
        ctx.lineTo(-60, -56);
        ctx.lineTo(18, -56);
        ctx.quadraticCurveTo(56, -54, 68, -22);
        ctx.lineTo(68, -14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(-60, -38);
        ctx.lineTo(-60, -56);
        ctx.lineTo(18, -56);
        ctx.quadraticCurveTo(46, -54, 58, -38);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-60, -38, 118, 6);

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(8, -50);
        ctx.lineTo(36, -46);
        ctx.lineTo(44, -38);
        ctx.lineTo(8, -38);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-18, -64, 26, 8);
      } else if (tier === 2) {
        // --- TIER 2: ZLATÝ TRYSKOVÝ EXPRES S TRYSKAMA ---
        var jetLen = 28 + Math.sin(samaDiraState.wheelAngle * 4) * 10;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-60, -44);
        ctx.lineTo(-60 - jetLen, -32);
        ctx.lineTo(-60, -20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.moveTo(-60, -14);
        ctx.lineTo(-60, -58);
        ctx.lineTo(24, -58);
        ctx.lineTo(70, -24);
        ctx.lineTo(70, -14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.fillRect(-60, -40, 120, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-52, -70, 38, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(10, -52, 30, 12);
      } else {
        // --- TIER 3: FUTURISTICKÁ VESMÍRNÁ MAŠINKA S PLAZMOVÝMI TRYSKAMA ---
        var plasmaLen = 38 + Math.sin(samaDiraState.wheelAngle * 5) * 12;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(-62, -52);
        ctx.lineTo(-62 - plasmaLen, -36);
        ctx.lineTo(-62, -18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-62, -45);
        ctx.lineTo(-62 - plasmaLen * 0.7, -36);
        ctx.lineTo(-62, -25);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4c1d95';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-62, -14);
        ctx.lineTo(-56, -62);
        ctx.lineTo(26, -62);
        ctx.lineTo(74, -26);
        ctx.lineTo(74, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f472b6';
        ctx.fillRect(-44, -74, 44, 12);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-20, -82, 24, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(10, -54, 34, 14);
      }

      // Jmenovka na boku mašinky
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.fillRect(-16, -36, 48, 15);
      ctx.strokeRect(-16, -36, 48, 15);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(trainName.slice(0, 9), 8, -25);

      // Veselý obličej na čele mašinky
      var eyeX = tier === 0 ? 44 : 52;
      var eyeY = tier === 0 ? -46 : -30;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Kola mašinky
      var wheelPositions = [-38, 0, 34];
      for (var wi = 0; wi < wheelPositions.length; wi++) {
        var wx = wheelPositions[wi];
        ctx.save();
        ctx.translate(wx, -8);
        ctx.rotate(samaDiraState.wheelAngle);
        ctx.fillStyle = tier >= 3 ? '#0ea5e9' : '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = tier >= 3 ? '#f472b6' : '#facc15';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.lineTo(9, 0);
        ctx.moveTo(0, -9);
        ctx.lineTo(0, 9);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      // 8C. Horní informační panel: Level, odpočet do dalšího levelu, vagónky a typ mašinky
      var secToNextLevel = Math.max(0, 60 - Math.floor(samaDiraState.elapsedTime % 60));
      var tierInfoNow = LOCO_TIERS[tier];
      ctx.save();
      var infoW = Math.min(w - 40, 760);
      var infoX = (w - infoW) * 0.5;
      var infoY = 74;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = tierInfoNow.badgeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(infoX, infoY, infoW, 38, 14);
      } else {
        ctx.rect(infoX, infoY, infoW, 38);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        tierInfoNow.name +
          '   •   🚃 Vagónky: ' + samaDiraState.wagonsCount + '/5 (další za ' + (100 - (samaDiraState.score % 100)) + ' ⭐)' +
          '   •   ⏱️ Další level za: ' + secToNextLevel + ' s',
        w * 0.5,
        infoY + 24
      );
      ctx.restore();

      // 9. Spodní nápověda ovládání (TV / Mobil / PC)
      ctx.save();
      var barW = Math.min(w - 32, 780);
      var barX = (w - barW) * 0.5;
      var barY = h - 56;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(barX, barY, barW, 42, 16);
      } else {
        ctx.rect(barX, barY, barW, 42);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      var weaponLabel = tier >= 1 ? '🔴 LASERY + 🚀 RAKETY: šipka ▼' : '🔴 ČERVENÝ LASER: šipka ▼';
      ctx.fillText('🦘 SKOK PŘES DÍRY A PŘEKÁŽKY: OK / šipka ▲   •   ' + weaponLabel, w * 0.5, barY + 26);
      ctx.restore();
    },

    stop: function() {
      samaDiraState.holes = [];
      samaDiraState.obstacles = [];
      samaDiraState.stars = [];
      samaDiraState.balls = [];
      samaDiraState.lasers = [];
      samaDiraState.rockets = [];
      samaDiraState.puffs = [];
      samaDiraState.sparkles = [];
    }
  });
})();

