// ============================================================================
// MINIGAME 2: HON NA SMAJLÍKY / ESCAPE THE SMILEY (minigame_smiley.js)
// - Pevný 2D pohled shora na celé hlavní město Happy Train současně
//   (8 obvodových uzlů J_NW..J_SW + středový uzel J_CENTER, 24 povrchových hran
//   a všechny přechodové oblouky window.turnoutCurves ze skutečné 3D sítě)
// - Offscreen cache statické 2D mapy města (dřevěné pražce, dvoukolejná trať,
//   řeka, mosty, severní horský tunel a 12 ilustrovaných orientačních dominant)
//   pro stabilních 60 FPS na Samsung Smart TV AU8100, PC i mobilu
// - Pohyb mašinky Tobyho + 3 sběrných vagónků výhradně po kolejích
// - Ovládání stejné jako v 3D hře:
//   ◀ / ▶ = volba výhybky (Vlevo / Rovně / Vpravo) se svítícími šipkami na kolejích
//   ▲ / ▼ = zrychlení / zpomalení Tobyho (stupně 1..5, bez nechtěného couvání)
//   OK / Enter / klepnutí na Tobyho = Krátké veselé turbo + zahoukání + bublinkový magnet
//   Dotyk / myš = přímé klepnutí na větev výhybky, smajlíka nebo obrázková tlačítka
// - 5 osobností smajlíků (Provokatér, Mrkálek, Strašpytel, Kulišák, Zlatá hvězdička)
//   + bonusoví kamarádi (Kačenka, Duhový míč) + adaptivní pomoc dítěti po 16 s
// - Trvalé ukládání sbírky do localStorage ('happyTrain_smileyChase_v1')
// ============================================================================

(function () {
  'use strict';

  var STORAGE_KEY_SMILEY = 'happyTrain_smileyChase_v1';
  var TWO_PI = Math.PI * 2;

  // 9 uzlů hlavního městského okruhu a středu (vylučuje vzdálený Bangkok a placené brány EXIT_*)
  var CITY_NODE_IDS = [
    'J_NW', 'J_NORTH', 'J_NE', 'J_EAST',
    'J_SE', 'J_SOUTH', 'J_SW', 'J_WEST', 'J_CENTER'
  ];
  var CITY_NODE_SET = {};
  for (var ni = 0; ni < CITY_NODE_IDS.length; ni++) {
    CITY_NODE_SET[CITY_NODE_IDS[ni]] = true;
  }

  // Rozsah souřadnic hlavního města ve 3D světě (X: -235..+245, Z: -185..+215) s okrajem pro dominanty
  var WORLD_BOUNDS = {
    minX: -280,
    maxX: 290,
    minZ: -230,
    maxZ: 255
  };

  // Rychlostní stupně Tobyho (m/s ve 3D souřadnicích kolejí) – vždy vpřed, aby 4leté dítě nezůstalo stát
  var TOBY_SPEED_MAP = {
    1: 42,
    2: 58,
    3: 76,
    4: 94,
    5: 112
  };

  // Definice osobností smajlíků a bonusových objektů
  var SMILEY_TYPES = {
    provokater: {
      id: 'provokater',
      color: '#facc15',
      border: '#ca8a04',
      cheek: '#f43f5e',
      speedMult: 0.54,
      radiusPx: 22,
      isStar: false
    },
    mrkalek: {
      id: 'mrkalek',
      color: '#f472b6',
      border: '#be185d',
      cheek: '#fb7185',
      speedMult: 0.62,
      radiusPx: 21,
      isStar: false
    },
    straspytel: {
      id: 'straspytel',
      color: '#38bdf8',
      border: '#0284c7',
      cheek: '#f472b6',
      speedMult: 0.50,
      radiusPx: 21,
      isStar: false
    },
    kulisak: {
      id: 'kulisak',
      color: '#4ade80',
      border: '#15803d',
      cheek: '#facc15',
      speedMult: 0.66,
      radiusPx: 21,
      isStar: false
    },
    star: {
      id: 'star',
      color: '#fde047',
      border: '#d97706',
      cheek: '#fb923c',
      speedMult: 0.78,
      radiusPx: 24,
      isStar: true
    },
    duck: {
      id: 'duck',
      color: '#fde047',
      border: '#ea580c',
      cheek: '#fb923c',
      speedMult: 0.56,
      radiusPx: 21,
      isStar: false
    },
    ball: {
      id: 'ball',
      color: '#a855f7',
      border: '#6b21a8',
      cheek: '#fde047',
      speedMult: 0.64,
      radiusPx: 20,
      isStar: false
    }
  };

  // ==========================================================================
  // 1. ZVUKOVÉ EFEKTY (ČISTÉ WEB AUDIO API, 0 % MLUVENÉ ŘEČI, ANTI-SPAM)
  // ==========================================================================
  var lastSfxMs = {
    switchBeep: 0,
    speedBeep: 0,
    turboHorn: 0,
    giggle: 0,
    catchPop: 0,
    starFanfare: 0,
    wagonCelebration: 0
  };

  function canPlaySfx(key, cooldownMs) {
    var now = performance.now();
    if (now - (lastSfxMs[key] || 0) < cooldownMs) return false;
    lastSfxMs[key] = now;
    return true;
  }

  function getAudioCtx() {
    if (typeof window.initAudio === 'function') {
      try { window.initAudio(); } catch (e) {}
    }
    if (typeof window.audioCtx !== 'undefined' && window.audioCtx) {
      if (window.audioCtx.state === 'suspended') {
        try { window.audioCtx.resume(); } catch (e2) {}
      }
      return window.audioCtx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !window._smileyFallbackAudioCtx) {
      try { window._smileyFallbackAudioCtx = new AC(); } catch (e3) {}
    }
    return window._smileyFallbackAudioCtx || null;
  }

  function playSwitchClickSfx(choice) {
    if (!canPlaySfx('switchBeep', 75)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'triangle';
      var freq = choice === 'left' ? 523.25 : (choice === 'right' ? 659.25 : 587.33);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + 0.09);
      g.gain.setValueAtTime(0.11, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  function playSpeedStepSfx(stage) {
    if (!canPlaySfx('speedBeep', 80)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      var baseFreq = 340 + stage * 75;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.11);
      g.gain.setValueAtTime(0.10, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  function playTurboMagnetHornSfx() {
    if (!canPlaySfx('turboHorn', 320)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.5];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = i < 2 ? 'triangle' : 'sine';
        var t0 = now + i * 0.055;
        osc.frequency.setValueAtTime(notes[i], t0);
        osc.frequency.exponentialRampToValueAtTime(notes[i] * 1.06, t0 + 0.24);
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.26);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.28);
      }
    } catch (e) {}
  }

  function playSmileyGiggleSfx(pitchMult) {
    if (!canPlaySfx('giggle', 450)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var pm = pitchMult || 1.0;
      var notes = [680 * pm, 860 * pm, 740 * pm, 980 * pm];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        var t0 = now + i * 0.065;
        osc.frequency.setValueAtTime(notes[i], t0);
        osc.frequency.exponentialRampToValueAtTime(notes[i] * 1.12, t0 + 0.055);
        g.gain.setValueAtTime(0.08, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.065);
      }
    } catch (e) {}
  }

  function playCatchSmileySfx(isStar) {
    if (!canPlaySfx('catchPop', 90)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var chord = isStar
        ? [587.33, 783.99, 987.77, 1174.66, 1567.98]
        : [523.25, 659.25, 783.99, 1046.50];
      for (var i = 0; i < chord.length; i++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        var t0 = now + i * 0.06;
        osc.frequency.setValueAtTime(chord[i], t0);
        osc.frequency.exponentialRampToValueAtTime(chord[i] * 1.08, t0 + 0.28);
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.15, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.30);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.32);
      }
    } catch (e) {}
  }

  function playWagonFullFanfareSfx() {
    if (!canPlaySfx('wagonCelebration', 800)) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        var t0 = now + i * 0.085;
        osc.frequency.setValueAtTime(notes[i], t0);
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.16, t0 + 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.48);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 2. TRVALÉ UKLÁDÁNÍ SBÍRKY DO LOCALSTORAGE ('happyTrain_smileyChase_v1')
  // ==========================================================================
  function loadSmileySaveData() {
    var def = {
      totalCaught: 0,
      starsCaught: 0,
      caughtByType: {
        provokater: 0,
        mrkalek: 0,
        straspytel: 0,
        kulisak: 0,
        star: 0,
        duck: 0,
        ball: 0
      }
    };
    try {
      if (!window.localStorage) return def;
      var raw = window.localStorage.getItem(STORAGE_KEY_SMILEY);
      if (!raw) return def;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        def.totalCaught = Number(parsed.totalCaught) || 0;
        def.starsCaught = Number(parsed.starsCaught) || 0;
        if (parsed.caughtByType && typeof parsed.caughtByType === 'object') {
          for (var k in def.caughtByType) {
            if (Object.prototype.hasOwnProperty.call(def.caughtByType, k)) {
              def.caughtByType[k] = Number(parsed.caughtByType[k]) || 0;
            }
          }
        }
      }
    } catch (e) {}
    return def;
  }

  function saveSmileySaveData(saveObj) {
    try {
      if (!window.localStorage || !saveObj) return;
      window.localStorage.setItem(STORAGE_KEY_SMILEY, JSON.stringify(saveObj));
    } catch (e) {}
  }

  // ==========================================================================
  // 3. ČTENÍ SKUTEČNÉ KOLEJOVÉ SÍTĚ HAPPY TRAIN (window.nodes, window.edges)
  // ==========================================================================
  function buildCityTrackNetwork() {
    var cityEdges = [];
    var edgeById = {};
    var turnoutMap = {};

    if (typeof window.edges !== 'undefined' && Array.isArray(window.edges)) {
      for (var i = 0; i < window.edges.length; i++) {
        var e = window.edges[i];
        if (!e || e.isSubway || e.isTurnout) continue;
        if (!CITY_NODE_SET[e.from] || !CITY_NODE_SET[e.to]) continue;
        if (!e.curve || typeof e.curve.getPointAt !== 'function') continue;
        cityEdges.push(e);
        edgeById[e.id] = e;
      }
    }

    if (typeof window.turnoutCurves !== 'undefined' && window.turnoutCurves) {
      for (var tk in window.turnoutCurves) {
        if (Object.prototype.hasOwnProperty.call(window.turnoutCurves, tk)) {
          var tc = window.turnoutCurves[tk];
          if (tc && tc.sourceEdge && tc.targetEdge && edgeById[tc.sourceEdge.id] && edgeById[tc.targetEdge.id]) {
            turnoutMap[tk] = tc;
          }
        }
      }
    }

    // Výpočet větví (left, straight, right) striktně v rámci 9 uzlů hlavního města
    function getCityBranches(currentEdge) {
      if (!currentEdge) return { left: null, straight: null, right: null };
      var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
      if (!baseEdge) return { left: null, straight: null, right: null };

      var node = baseEdge.to;
      var candidates = [];
      for (var j = 0; j < cityEdges.length; j++) {
        var cand = cityEdges[j];
        if (cand.from === node && cand.to !== baseEdge.from) {
          candidates.push(cand);
        }
      }
      if (candidates.length === 0) {
        for (var k = 0; k < cityEdges.length; k++) {
          if (cityEdges[k].from === node) candidates.push(cityEdges[k]);
        }
      }
      if (candidates.length === 0) {
        return { left: baseEdge, straight: baseEdge, right: baseEdge };
      }

      var p1 = baseEdge.curve.getPointAt(0.84);
      var inDir = baseEdge.curve.getTangentAt(0.84);
      var inLen = Math.hypot(inDir.x, inDir.z) || 1;
      var inX = inDir.x / inLen;
      var inZ = inDir.z / inLen;

      var scored = [];
      for (var c = 0; c < candidates.length; c++) {
        var ce = candidates[c];
        var p2 = ce.curve.getPointAt(0.18);
        var dx = p2.x - p1.x;
        var dz = p2.z - p1.z;
        var dLen = Math.hypot(dx, dz) || 1;
        var outX = dx / dLen;
        var outZ = dz / dLen;
        var cross = inX * outZ - inZ * outX;
        var dot = inX * outX + inZ * outZ;
        var angle = Math.atan2(cross, dot);
        scored.push({ edge: ce, angle: angle });
      }

      // Ve 2D zobrazení (X doprava, Z dolů) záporný úhel znamená odbočení doleva z pohledu jízdy vlaku,
      // kladný úhel znamená odbočení doprava:
      scored.sort(function (a, b) {
        return a.angle - b.angle;
      });

      if (scored.length >= 3) {
        var midBest = scored[1];
        for (var m = 1; m < scored.length - 1; m++) {
          if (Math.abs(scored[m].angle) < Math.abs(midBest.angle)) {
            midBest = scored[m];
          }
        }
        return {
          left: scored[0].edge,
          straight: midBest.edge,
          right: scored[scored.length - 1].edge
        };
      }

      var straightBest = scored[0];
      for (var s = 1; s < scored.length; s++) {
        if (Math.abs(scored[s].angle) < Math.abs(straightBest.angle)) {
          straightBest = scored[s];
        }
      }

      return {
        left: scored[0].edge,
        straight: straightBest.edge,
        right: scored[scored.length - 1].edge
      };
    }

    return {
      edges: cityEdges,
      edgeById: edgeById,
      turnouts: turnoutMap,
      getBranches: getCityBranches
    };
  }

  // ==========================================================================
  // 4. HLAVNÍ TOVÁRNA MINIHRY HON NA SMAJLÍKY
  // ==========================================================================
  function createSmileyChaseMinigame() {
    var state = null;

    function computeProjection(w, h) {
      var topPad = Math.max(66, Math.min(88, h * 0.10));
      var bottomPad = Math.max(76, Math.min(104, h * 0.12));
      var sidePad = Math.max(28, w * 0.04);

      var availW = Math.max(200, w - sidePad * 2);
      var availH = Math.max(180, h - topPad - bottomPad);

      var worldW = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
      var worldH = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;

      var scale = Math.min(availW / worldW, availH / worldH);
      var centerX = (WORLD_BOUNDS.minX + WORLD_BOUNDS.maxX) * 0.5;
      var centerZ = (WORLD_BOUNDS.minZ + WORLD_BOUNDS.maxZ) * 0.5;

      var screenCenterX = w * 0.5;
      var screenCenterY = topPad + availH * 0.5;

      return {
        w: w,
        h: h,
        scale: scale,
        centerX: centerX,
        centerZ: centerZ,
        screenCenterX: screenCenterX,
        screenCenterY: screenCenterY,
        toScreenX: function (wx) {
          return screenCenterX + (wx - centerX) * scale;
        },
        toScreenY: function (wz) {
          return screenCenterY + (wz - centerZ) * scale;
        },
        toWorldX: function (sx) {
          return centerX + (sx - screenCenterX) / scale;
        },
        toWorldZ: function (sy) {
          return centerZ + (sy - screenCenterY) / scale;
        }
      };
    }

    // Vykreslení zaobleného obdélníku
    function roundRectPath(ctx, x, y, w, h, r) {
      var rr = Math.min(r, w * 0.5, h * 0.5);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
    }

    // ========================================================================
    // 5. PŘEDKRESLENÍ STATICKÉ 2D MAPY MĚSTA DO OFFSCREEN CANVASU (60 FPS)
    // ========================================================================
    function buildOffscreenCityMap(proj, net) {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(proj.w * dpr));
      off.height = Math.max(1, Math.floor(proj.h * dpr));
      var ctx = off.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var w = proj.w;
      var h = proj.h;
      var s = proj.scale;

      // 1) Svěží zelený trávník dětské vláčkodráhy
      var bgGrad = ctx.createRadialGradient(
        proj.screenCenterX, proj.screenCenterY, Math.min(w, h) * 0.08,
        proj.screenCenterX, proj.screenCenterY, Math.max(w, h) * 0.72
      );
      bgGrad.addColorStop(0, '#84cc16');
      bgGrad.addColorStop(0.55, '#65a30d');
      bgGrad.addColorStop(1, '#3f6212');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Jemné světle zelené louky v rozích města
      var meadows = [
        { x: -150, z: -100, rx: 85, rz: 65, col: 'rgba(163, 230, 53, 0.28)' },
        { x: 155, z: -95, rx: 80, rz: 60, col: 'rgba(163, 230, 53, 0.25)' },
        { x: 145, z: 115, rx: 90, rz: 70, col: 'rgba(190, 242, 100, 0.24)' },
        { x: -140, z: 115, rx: 85, rz: 65, col: 'rgba(163, 230, 53, 0.26)' }
      ];
      for (var mi = 0; mi < meadows.length; mi++) {
        var md = meadows[mi];
        ctx.fillStyle = md.col;
        ctx.beginPath();
        ctx.ellipse(
          proj.toScreenX(md.x),
          proj.toScreenY(md.z),
          md.rx * s,
          md.rz * s,
          0, 0, TWO_PI
        );
        ctx.fill();
      }

      // 2) Modrá řeka (západní a jižní tok) + vodní příkop Atlantidy kolem Zámku (J_CENTER)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      var riverPts = [
        { x: -275, z: -135 },
        { x: -205, z: -65 },
        { x: -145, z: 0 },
        { x: -165, z: 105 },
        { x: -105, z: 175 },
        { x: -25, z: 255 }
      ];
      // Pískový břeh řeky
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = Math.max(18, 34 * s);
      ctx.beginPath();
      for (var ri = 0; ri < riverPts.length; ri++) {
        var rpx = proj.toScreenX(riverPts[ri].x);
        var rpy = proj.toScreenY(riverPts[ri].z);
        if (ri === 0) ctx.moveTo(rpx, rpy);
        else ctx.lineTo(rpx, rpy);
      }
      ctx.stroke();

      // Modrá voda řeky
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(13, 25 * s);
      ctx.stroke();

      // Středový vodní příkop kolem Zámku tisíce dobrodružství (J_CENTER: 0, 15)
      var cx0 = proj.toScreenX(0);
      var cz0 = proj.toScreenY(15);
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = Math.max(2, 3 * s);
      ctx.beginPath();
      ctx.arc(cx0, cz0, 52 * s, 0, TWO_PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(cx0, cz0, 32 * s, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // 3) Pískové městské cestičky a silnice spojující dominanty
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.lineWidth = Math.max(5, 9 * s);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx0, cz0, 118 * s, 0, TWO_PI);
      ctx.stroke();
      ctx.restore();

      // 4) Pomocná funkce pro vykreslení dřevěného lože, pražců a kolejnic podél 3D křivky
      function drawWoodenTrackSegment(curve, parCurve, uStart, uEnd, steps, isBridge) {
        if (!curve) return;
        var pts = [];
        for (var i = 0; i <= steps; i++) {
          var u = uStart + (uEnd - uStart) * (i / steps);
          var p = curve.getPointAt(u);
          var p2 = parCurve ? parCurve.getPointAt(u) : p;
          var mx = (p.x + p2.x) * 0.5;
          var mz = (p.z + p2.z) * 0.5;
          pts.push({
            sx: proj.toScreenX(mx),
            sy: proj.toScreenY(mz),
            p1x: proj.toScreenX(p.x),
            p1y: proj.toScreenY(p.z),
            p2x: proj.toScreenX(p2.x),
            p2y: proj.toScreenY(p2.z)
          });
        }

        // a) Tmavší stín pod dřevěnou kolejí (nebo kamenné zábradlí mostu)
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = isBridge ? '#64748b' : '#78350f';
        ctx.lineWidth = Math.max(14, (isBridge ? 24 : 20) * s);
        ctx.beginPath();
        for (var j = 0; j < pts.length; j++) {
          if (j === 0) ctx.moveTo(pts[j].sx, pts[j].sy);
          else ctx.lineTo(pts[j].sx, pts[j].sy);
        }
        ctx.stroke();

        // b) Světlé bukové dřevo vláčkodráhy
        ctx.strokeStyle = isBridge ? '#cbd5e1' : '#f3cfa4';
        ctx.lineWidth = Math.max(11, 16 * s);
        ctx.stroke();

        // c) Dřevěné pražce kolmo na trať
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = Math.max(2, 2.8 * s);
        var sleeperStep = Math.max(1, Math.floor(steps / 14));
        for (var k = 1; k < pts.length - 1; k += sleeperStep) {
          var dx = pts[k + 1].sx - pts[k - 1].sx;
          var dy = pts[k + 1].sy - pts[k - 1].sy;
          var len = Math.hypot(dx, dy) || 1;
          var nx = -dy / len;
          var ny = dx / len;
          var halfW = Math.max(5.5, 7.6 * s);
          ctx.beginPath();
          ctx.moveTo(pts[k].sx - nx * halfW, pts[k].sy - ny * halfW);
          ctx.lineTo(pts[k].sx + nx * halfW, pts[k].sy + ny * halfW);
          ctx.stroke();
        }

        // d) Ocelové kolejnice (obě koleje dvoukolejné trati)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = Math.max(2.0, 2.6 * s);
        ctx.beginPath();
        for (var r1 = 0; r1 < pts.length; r1++) {
          if (r1 === 0) ctx.moveTo(pts[r1].p1x, pts[r1].p1y);
          else ctx.lineTo(pts[r1].p1x, pts[r1].p1y);
        }
        ctx.stroke();

        if (parCurve) {
          ctx.beginPath();
          for (var r2 = 0; r2 < pts.length; r2++) {
            if (r2 === 0) ctx.moveTo(pts[r2].p2x, pts[r2].p2y);
            else ctx.lineTo(pts[r2].p2x, pts[r2].p2y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5) Vykreslení všech přechodových oblouků výhybek (turnoutCurves)
      var drawnTurnouts = {};
      for (var tk in net.turnouts) {
        if (!Object.prototype.hasOwnProperty.call(net.turnouts, tk)) continue;
        var tc = net.turnouts[tk];
        var pairKey = [tc.sourceEdge.from, tc.sourceEdge.to, tc.targetEdge.from, tc.targetEdge.to].sort().join('|');
        if (drawnTurnouts[pairKey]) continue;
        drawnTurnouts[pairKey] = true;
        drawWoodenTrackSegment(tc.curve, tc.parallelCurve, 0.0, 1.0, 12, false);
      }

      // 6) Vykreslení všech 12 obousměrných hlavních tratí (u: 0.14 .. 0.86)
      var drawnUndirectedEdges = {};
      for (var ei = 0; ei < net.edges.length; ei++) {
        var edge = net.edges[ei];
        var uKey = [edge.from, edge.to].sort().join('--');
        if (drawnUndirectedEdges[uKey]) continue;
        drawnUndirectedEdges[uKey] = true;
        var isBridgeEdge =
          uKey === 'J_CENTER--J_WEST' ||
          uKey === 'J_NW--J_WEST' ||
          uKey === 'J_EAST--J_NE' ||
          uKey === 'J_SOUTH--J_SW';
        drawWoodenTrackSegment(edge.curve, edge.parallelCurve, 0.14, 0.86, 28, isBridgeEdge);
      }

      // 7) Dekorativní stromy a lesíky mimo koleje
      var treeSpots = [
        { x: -65, z: -95, r: 13 }, { x: -42, z: -108, r: 11 },
        { x: 75, z: -95, r: 13 },  { x: 98, z: -82, r: 11 },
        { x: -95, z: 75, r: 13 },  { x: -118, z: 92, r: 11 },
        { x: 92, z: 82, r: 13 },   { x: 115, z: 68, r: 12 },
        { x: -245, z: -115, r: 14 }, { x: 255, z: -95, r: 14 },
        { x: 255, z: 105, r: 14 },   { x: -245, z: 115, r: 14 }
      ];
      for (var ti = 0; ti < treeSpots.length; ti++) {
        var tr = treeSpots[ti];
        var tx = proj.toScreenX(tr.x);
        var ty = proj.toScreenY(tr.z);
        var rad = Math.max(7, tr.r * s);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.arc(tx + 2, ty + 3, rad, 0, TWO_PI);
        ctx.fill();

        ctx.fillStyle = ti % 3 === 0 ? '#15803d' : (ti % 3 === 1 ? '#16a34a' : '#ca8a04');
        ctx.beginPath();
        ctx.arc(tx, ty, rad, 0, TWO_PI);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.arc(tx - rad * 0.28, ty - rad * 0.28, rad * 0.45, 0, TWO_PI);
        ctx.fill();
      }

      // 8) 12 IKONICKÝCH DOMINANT MĚSTA HAPPY TRAIN (pro okamžitou orientaci dítěte)
      drawCityLandmarksOnMap(ctx, proj);

      return off;
    }

    function drawCityLandmarksOnMap(ctx, proj) {
      var s = proj.scale;

      // A) STŘED MĚSTA (J_CENTER: 0, 15): Zámek tisíce dobrodružství
      var cx = proj.toScreenX(0);
      var cz = proj.toScreenY(15);
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      roundRectPath(ctx, cx - 22 * s, cz - 18 * s, 44 * s, 36 * s, 6 * s);
      ctx.fill();
      ctx.stroke();
      // 4 modré pohádkové věžičky v rozích zámku
      var turrets = [[-20, -16], [20, -16], [-20, 16], [20, 16], [0, 0]];
      for (var i = 0; i < turrets.length; i++) {
        var tx = cx + turrets[i][0] * s;
        var ty = cz + turrets[i][1] * s;
        var tr = (i === 4 ? 12 : 8.5) * s;
        ctx.fillStyle = i === 4 ? '#3b82f6' : '#2563eb';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, tr, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        // Zlatá špička věže
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(tx, ty, tr * 0.36, 0, TWO_PI);
        ctx.fill();
      }
      ctx.restore();

      // B) SEVERNÍ HORSKÝ TUNEL (u J_NORTH: 65, -185) – dřevěno-kamenný tunel přes koleje
      var tunX = proj.toScreenX(65);
      var tunY = proj.toScreenY(-185);
      ctx.save();
      ctx.fillStyle = '#78716c';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2.5;
      roundRectPath(ctx, tunX - 38 * s, tunY - 20 * s, 76 * s, 40 * s, 12 * s);
      ctx.fill();
      ctx.stroke();
      // Zelený vrcholek hory se sněhem
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.ellipse(tunX, tunY - 4 * s, 30 * s, 14 * s, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(tunX, tunY - 6 * s, 16 * s, 7 * s, 0, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // C) EIFFELOVA VĚŽ (mezi J_NW a J_NORTH: -30, -210)
      var eifX = proj.toScreenX(-32);
      var eifY = proj.toScreenY(-206);
      ctx.save();
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eifX, eifY - 22 * s);
      ctx.lineTo(eifX + 16 * s, eifY + 14 * s);
      ctx.lineTo(eifX - 16 * s, eifY + 14 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(eifX, eifY - 22 * s, 4 * s, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // D) PYRAMIDY V GÍZE (severovýchod: 248, -95)
      var pyrX = proj.toScreenX(254);
      var pyrY = proj.toScreenY(-85);
      ctx.save();
      for (var p = 0; p < 2; p++) {
        var px = pyrX + (p * 22 - 10) * s;
        var py = pyrY + (p * 14 - 6) * s;
        var sz = (p === 0 ? 18 : 14) * s;
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, py - sz);
        ctx.lineTo(px + sz, py + sz * 0.7);
        ctx.lineTo(px - sz, py + sz * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // E) JEWEL DOME S VODOPÁDEM (jihovýchod: 255, 95)
      var jwlX = proj.toScreenX(252);
      var jwlY = proj.toScreenY(98);
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(jwlX, jwlY, 22 * s, 0, TWO_PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(jwlX, jwlY, 7 * s, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // F) SLUNEČNÁ FARMA SE ZVÍŘÁTKY (jihovýchod: 105, 175)
      var frmX = proj.toScreenX(108);
      var frmY = proj.toScreenY(168);
      ctx.save();
      ctx.strokeStyle = '#92400e';
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.lineWidth = 2.5;
      roundRectPath(ctx, frmX - 24 * s, frmY - 16 * s, 48 * s, 32 * s, 5 * s);
      ctx.fill();
      ctx.stroke();
      // Červená stodola u ohrady
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.fillRect(frmX - 22 * s, frmY - 14 * s, 16 * s, 12 * s);
      ctx.strokeRect(frmX - 22 * s, frmY - 14 * s, 16 * s, 12 * s);
      ctx.restore();

      // G) DĚTSKÝ ZÁBAVNÍ PARK S RUSKÝM KOLEM (jihozápad: -105, 175)
      var funX = proj.toScreenX(-105);
      var funY = proj.toScreenY(168);
      ctx.save();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(funX, funY, 18 * s, 0, TWO_PI);
      ctx.stroke();
      for (var g = 0; g < 6; g++) {
        var ga = (g / 6) * TWO_PI;
        ctx.fillStyle = g % 2 === 0 ? '#facc15' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(funX + Math.cos(ga) * 18 * s, funY + Math.sin(ga) * 18 * s, 4.2 * s, 0, TWO_PI);
        ctx.fill();
      }
      ctx.restore();

      // H) BIG BEN & VĚTRNÉ MLÝNY (západ: -252, 95)
      var benX = proj.toScreenX(-252);
      var benY = proj.toScreenY(92);
      ctx.save();
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 2;
      roundRectPath(ctx, benX - 11 * s, benY - 22 * s, 22 * s, 44 * s, 4 * s);
      ctx.fill();
      ctx.stroke();
      // Hodinový ciferník Big Benu
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(benX, benY - 6 * s, 6.5 * s, 0, TWO_PI);
      ctx.fill();
      ctx.restore();

      // I) RŮŽOVÝ DOMEČEK MAMINKY (severozápad: -215, -95)
      var momX = proj.toScreenX(-218);
      var momY = proj.toScreenY(-95);
      ctx.save();
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      roundRectPath(ctx, momX - 18 * s, momY - 13 * s, 36 * s, 26 * s, 5 * s);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#be185d';
      ctx.beginPath();
      ctx.moveTo(momX, momY - 24 * s);
      ctx.lineTo(momX + 21 * s, momY - 11 * s);
      ctx.lineTo(momX - 21 * s, momY - 11 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // J) ČERVENÉ NÁDRAŽÍ S HODINAMI (uprostřed severní a jižní spojky)
      var stations = [
        { x: 26, z: -85, col: '#16a34a' },
        { x: 26, z: 112, col: '#2563eb' }
      ];
      for (var si = 0; si < stations.length; si++) {
        var st = stations[si];
        var sx = proj.toScreenX(st.x);
        var sy = proj.toScreenY(st.z);
        ctx.save();
        ctx.fillStyle = st.col;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        roundRectPath(ctx, sx - 14 * s, sy - 9 * s, 28 * s, 18 * s, 4 * s);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5 * s, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }
    }

    // ========================================================================
    // 6. POHYB PO KOLEJÍCH (TRACK FOLLOWER PRO TOBYHO I SMAJLÍKY)
    // ========================================================================
    function evaluateEntityPose(entity) {
      if (!entity || !entity.edge || !entity.edge.curve) {
        return { x: 0, z: 15, angle: 0, inTunnel: false };
      }
      var uClamped = Math.max(0, Math.min(1, entity.u));
      var pt = entity.edge.curve.getPointAt(uClamped);
      var tan = entity.edge.curve.getTangentAt(uClamped);
      var angle = Math.atan2(tan.z, tan.x);

      // Severní horský tunel kolem J_NORTH (x: 25..105, z: -205..-165)
      var inTunnel = (pt.z < -162 && pt.x > 25 && pt.x < 105);
      return {
        x: pt.x,
        z: pt.z,
        angle: angle,
        inTunnel: inTunnel
      };
    }

    function advanceTrackEntity(entity, distMeters, net, chooseBranchFn) {
      if (!entity || !entity.edge) return;
      var remaining = distMeters;
      var safety = 0;

      while (remaining > 0.001 && safety < 6) {
        safety++;
        var curveLen = (entity.edge.curve && typeof entity.edge.curve.getLength === 'function')
          ? entity.edge.curve.getLength()
          : 160;
        curveLen = Math.max(18, curveLen);

        var maxU = entity.edge.isTurnout ? 1.0 : 0.84;
        var remU = Math.max(0, maxU - entity.u);
        var remMeters = remU * curveLen;

        if (remaining < remMeters) {
          entity.u += remaining / curveLen;
          remaining = 0;
        } else {
          remaining -= remMeters;
          if (!entity.edge.isTurnout) {
            var br = net.getBranches(entity.edge);
            var chosenEdge = chooseBranchFn ? chooseBranchFn(entity, br) : (br.straight || br.left || br.right);
            if (!chosenEdge) chosenEdge = br.straight || entity.edge;

            var tKey = entity.edge.id + '=>' + chosenEdge.id;
            var turnoutObj = net.turnouts[tKey];
            if (turnoutObj && turnoutObj.curve) {
              entity.edge = turnoutObj;
              entity.u = 0.0;
            } else {
              entity.edge = chosenEdge;
              entity.u = 0.16;
            }
          } else {
            var nextMain = entity.edge.targetEdge;
            if (nextMain) {
              entity.edge = nextMain;
              entity.u = 0.16;
            } else {
              entity.u = 0.16;
            }
          }
        }
      }
    }

    // ========================================================================
    // 7. VYTVÁŘENÍ A CHOVÁNÍ SMAJLÍKŮ NA KOLEJÍCH
    // ========================================================================
    function spawnNewSmiley(st, forcedTypeId) {
      if (!st || !st.net || st.net.edges.length === 0) return;

      var typePool = ['provokater', 'mrkalek', 'straspytel', 'kulisak'];
      if (st.sessionCaughtCount >= 2) {
        typePool.push('duck', 'ball');
      }
      var chosenType = forcedTypeId || typePool[Math.floor(Math.random() * typePool.length)];
      var def = SMILEY_TYPES[chosenType] || SMILEY_TYPES.provokater;

      // Vybereme hranu dostatečně daleko od Tobyho, aby smajlík nevznikl přímo pod koly
      var bestEdge = st.net.edges[0];
      var bestDist = -1;
      for (var attempt = 0; attempt < 10; attempt++) {
        var cand = st.net.edges[Math.floor(Math.random() * st.net.edges.length)];
        var midPt = cand.curve.getPointAt(0.5);
        var d = Math.hypot(midPt.x - st.toby.x, midPt.z - st.toby.z);
        if (d > bestDist) {
          bestDist = d;
          bestEdge = cand;
        }
        if (d > 165) break;
      }

      var spawnU = 0.28 + Math.random() * 0.42;
      var sEnt = {
        uid: ++st.smileyUidCounter,
        typeId: chosenType,
        def: def,
        edge: bestEdge,
        u: spawnU,
        x: 0,
        z: 0,
        angle: 0,
        inTunnel: false,
        chaseTimer: 0,
        tauntPauseTimer: 0,
        tauntCooldown: 2.5 + Math.random() * 2.5,
        winkTimer: 0,
        scaredActive: false,
        helpingChild: false,
        turnToggle: Math.random() < 0.5 ? 1 : -1,
        bouncePhase: Math.random() * TWO_PI
      };
      var pose = evaluateEntityPose(sEnt);
      sEnt.x = pose.x;
      sEnt.z = pose.z;
      sEnt.angle = pose.angle;
      sEnt.inTunnel = pose.inTunnel;

      st.smileys.push(sEnt);
    }

    function updateSmileyEntity(sEnt, dt, st) {
      sEnt.chaseTimer += dt;
      sEnt.bouncePhase += dt * 7.5;

      var distToToby = Math.hypot(sEnt.x - st.toby.x, sEnt.z - st.toby.z);

      // Adaptivní pomoc pro dítě (po 16 sekundách honičky smajlík zpomalí, zamává a jede vstříc Tobymu)
      if (sEnt.chaseTimer >= 16.0 && !sEnt.helpingChild) {
        sEnt.helpingChild = true;
      }

      var baseTobySpeed = TOBY_SPEED_MAP[3]; // 76 m/s referenční rychlost
      var speedMult = sEnt.def.speedMult;

      // Specifické chování podle osobnosti smajlíka:
      if (sEnt.helpingChild) {
        speedMult = 0.30;
      } else if (sEnt.typeId === 'provokater') {
        // 1. Provokatér: občas zastaví, vyplázne jazyk a počká, až se Toby přiblíží na 88 m
        if (sEnt.tauntPauseTimer > 0) {
          sEnt.tauntPauseTimer -= dt;
          speedMult = 0.05;
          if (distToToby < 88) {
            sEnt.tauntPauseTimer = 0;
            sEnt.tauntCooldown = 4.2;
            playSmileyGiggleSfx(1.08);
          }
        } else {
          sEnt.tauntCooldown -= dt;
          if (sEnt.tauntCooldown <= 0 && distToToby > 105 && !sEnt.edge.isTurnout) {
            sEnt.tauntPauseTimer = 2.4;
          }
        }
      } else if (sEnt.typeId === 'mrkalek') {
        // 2. Mrkálek: při přiblížení k Tobymu mrkne a vypustí srdíčko
        if (distToToby < 115 && sEnt.winkTimer <= 0) {
          sEnt.winkTimer = 2.2;
          playSmileyGiggleSfx(1.22);
        }
        if (sEnt.winkTimer > 0) sEnt.winkTimer = Math.max(0, sEnt.winkTimer - dt);
      } else if (sEnt.typeId === 'straspytel') {
        // 3. Strašpytel: když je Toby blízko (< 115 m), vykulí oči a zrychlí, ale Toby na rychlost 4-5 nebo Turbo je rychlejší!
        if (distToToby < 115) {
          if (!sEnt.scaredActive) {
            sEnt.scaredActive = true;
            playSmileyGiggleSfx(0.92);
          }
          speedMult = 0.85;
        } else {
          sEnt.scaredActive = false;
          speedMult = 0.48;
        }
      } else if (sEnt.typeId === 'kulisak') {
        // 4. Kulišák: v severním tunelu krátce zpomalí a vykoukne
        if (sEnt.inTunnel) {
          speedMult = 0.42;
        }
      } else if (sEnt.typeId === 'star') {
        // 5. Zlatá hvězdička: zanechává třpytivou stopu
        if (Math.random() < 0.45) {
          spawnSparkleParticle(st, sEnt.x, sEnt.z, '#fde047');
        }
      }

      // Pokud je aktivní bublinkový magnet (OK) a smajlík je v dosahu 58 m, magnet ho přitahuje k Tobymu!
      if (st.toby.magnetTimer > 0 && distToToby < 58) {
        var pullFactor = Math.min(1, dt * 6.5);
        sEnt.x += (st.toby.x - sEnt.x) * pullFactor;
        sEnt.z += (st.toby.z - sEnt.z) * pullFactor;
        return;
      }

      var stepMeters = baseTobySpeed * speedMult * dt;
      advanceTrackEntity(sEnt, stepMeters, st.net, function (ent, br) {
        var options = [];
        if (br.left) options.push(br.left);
        if (br.straight && options.indexOf(br.straight) === -1) options.push(br.straight);
        if (br.right && options.indexOf(br.right) === -1) options.push(br.right);
        if (options.length === 0) return br.straight;

        // Pokud smajlík pomáhá dítěti (po 16 s), vybírá větev nejblíže k Tobymu!
        if (ent.helpingChild) {
          var bestToward = options[0];
          var minD = 999999;
          for (var i = 0; i < options.length; i++) {
            var p = options[i].curve.getPointAt(0.5);
            var d = Math.hypot(p.x - st.toby.x, p.z - st.toby.z);
            if (d < minD) {
              minD = d;
              bestToward = options[i];
            }
          }
          return bestToward;
        }

        // Strašpytel vybírá větev směrem od Tobyho
        if (ent.typeId === 'straspytel' && ent.scaredActive) {
          var bestAway = options[0];
          var maxD = -1;
          for (var j = 0; j < options.length; j++) {
            var p2 = options[j].curve.getPointAt(0.5);
            var d2 = Math.hypot(p2.x - st.toby.x, p2.z - st.toby.z);
            if (d2 > maxD) {
              maxD = d2;
              bestAway = options[j];
            }
          }
          return bestAway;
        }

        // Mrkálek střídá levou a pravou větev
        if (ent.typeId === 'mrkalek') {
          ent.turnToggle = -ent.turnToggle;
          return ent.turnToggle > 0 ? (br.left || br.straight) : (br.right || br.straight);
        }

        // Kulišák miluje středové náměstí J_CENTER a severní tunel J_NORTH
        if (ent.typeId === 'kulisak') {
          for (var k = 0; k < options.length; k++) {
            if (options[k].to === 'J_CENTER' || options[k].to === 'J_NORTH') {
              return options[k];
            }
          }
        }

        return options[Math.floor(Math.random() * options.length)];
      });

      var pose = evaluateEntityPose(sEnt);
      sEnt.x = pose.x;
      sEnt.z = pose.z;
      sEnt.angle = pose.angle;
      sEnt.inTunnel = pose.inTunnel;
    }

    // ========================================================================
    // 8. ČÁSTICOVÉ EFEKTY A SKÁKAJÍCÍ CHYCENÍ SMAJLÍCI DO VAGÓNKU
    // ========================================================================
    function spawnSparkleParticle(st, wx, wz, color) {
      if (st.particles.length >= 90) st.particles.shift();
      var ang = Math.random() * TWO_PI;
      var spd = 8 + Math.random() * 28;
      st.particles.push({
        wx: wx + (Math.random() - 0.5) * 8,
        wz: wz + (Math.random() - 0.5) * 8,
        vx: Math.cos(ang) * spd,
        vz: Math.sin(ang) * spd,
        size: 4 + Math.random() * 5,
        color: color || '#fde047',
        life: 0.55 + Math.random() * 0.35,
        maxLife: 0.9
      });
    }

    function spawnCatchCelebrationBurst(st, wx, wz, isStar) {
      var colors = isStar
        ? ['#fde047', '#facc15', '#fb923c', '#ffffff']
        : ['#facc15', '#f472b6', '#38bdf8', '#4ade80', '#fb923c'];
      var count = isStar ? 28 : 18;
      for (var i = 0; i < count; i++) {
        if (st.particles.length >= 90) st.particles.shift();
        var ang = (i / count) * TWO_PI + Math.random() * 0.25;
        var spd = 22 + Math.random() * (isStar ? 65 : 42);
        st.particles.push({
          wx: wx,
          wz: wz,
          vx: Math.cos(ang) * spd,
          vz: Math.sin(ang) * spd,
          size: (isStar ? 6 : 5) + Math.random() * 4,
          color: colors[i % colors.length],
          life: 0.75 + Math.random() * 0.35,
          maxLife: 1.1
        });
      }
    }

    function triggerCatchSmiley(st, sEnt) {
      var isStar = Boolean(sEnt.def && sEnt.def.isStar);
      playCatchSmileySfx(isStar);
      spawnCatchCelebrationBurst(st, sEnt.x, sEnt.z, isStar);

      // Aktualizace uloženého skóre v localStorage
      st.saveData.totalCaught = (st.saveData.totalCaught || 0) + 1;
      if (isStar) {
        st.saveData.starsCaught = (st.saveData.starsCaught || 0) + 1;
      }
      if (st.saveData.caughtByType) {
        st.saveData.caughtByType[sEnt.typeId] = (st.saveData.caughtByType[sEnt.typeId] || 0) + 1;
      }
      saveSmileySaveData(st.saveData);

      st.sessionCaughtCount++;
      st.badgePulseTimer = 0.45;
      st.lastCaughtType = sEnt.typeId;

      if (st.hostApi && typeof st.hostApi.setScoreText === 'function') {
        st.hostApi.setScoreText('😄 ' + st.saveData.totalCaught + '  ⭐ ' + st.saveData.starsCaught);
      }

      // Animace radostného skoku smajlíka do volného vagónku za Tobym
      var targetSeatIdx = Math.min(2, st.wagonPassengers.length);
      st.jumpingToWagon.push({
        typeId: sEnt.typeId,
        def: sEnt.def,
        startX: sEnt.x,
        startZ: sEnt.z,
        seatIdx: targetSeatIdx,
        progress: 0
      });

      // Každé 3 chycené smajlíky odměníme vzácnou Zlatou hvězdičkou na kolejích!
      if (st.sessionCaughtCount % 3 === 0) {
        var hasStarAlready = false;
        for (var i = 0; i < st.smileys.length; i++) {
          if (st.smileys[i].typeId === 'star') hasStarAlready = true;
        }
        if (!hasStarAlready) {
          spawnNewSmiley(st, 'star');
        }
      }
    }

    // ========================================================================
    // 9. AKCE OVLÁDÁNÍ (TV DÁLKOVÝ OVLADAČ, KLÁVESNICE, DOTYK A MYŠ)
    // ========================================================================
    function changeSwitchChoice(st, dirDelta) {
      if (!st || !st.toby) return;
      var cur = st.toby.switchChoice;
      if (dirDelta < 0) {
        st.toby.switchChoice = cur === 'right' ? 'straight' : 'left';
      } else if (dirDelta > 0) {
        st.toby.switchChoice = cur === 'left' ? 'straight' : 'right';
      } else {
        st.toby.switchChoice = 'straight';
      }
      st.toby.switchIndicatorTimer = 1.4;
      playSwitchClickSfx(st.toby.switchChoice);
    }

    function changeTobySpeed(st, stageDelta) {
      if (!st || !st.toby) return;
      var nextStage = Math.max(1, Math.min(5, st.toby.speedStage + stageDelta));
      st.toby.speedStage = nextStage;
      playSpeedStepSfx(nextStage);
    }

    function triggerTurboAndMagnet(st) {
      if (!st || !st.toby) return;
      st.toby.turboTimer = 2.4;
      st.toby.magnetTimer = 2.6;
      playTurboMagnetHornSfx();
      for (var i = 0; i < 10; i++) {
        spawnSparkleParticle(st, st.toby.x, st.toby.z, i % 2 === 0 ? '#38bdf8' : '#fef047');
      }
    }

    function handleCanvasPointerTap(st, normX, normY) {
      if (!st || !st.proj) return;
      var sx = normX * st.proj.w;
      var sy = normY * st.proj.h;

      // 1) Kontrola kliknutí na spodní obrázková tlačítka (Vlevo, Rovně/Rychleji, Vpravo, Pomaleji, Turbo Magnet)
      for (var i = 0; i < st.uiButtons.length; i++) {
        var b = st.uiButtons[i];
        if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
          if (b.id === 'BTN_LEFT') changeSwitchChoice(st, -1);
          else if (b.id === 'BTN_STRAIGHT') {
            st.toby.switchChoice = 'straight';
            st.toby.switchIndicatorTimer = 1.4;
            playSwitchClickSfx('straight');
          } else if (b.id === 'BTN_RIGHT') changeSwitchChoice(st, 1);
          else if (b.id === 'BTN_FASTER') changeTobySpeed(st, 1);
          else if (b.id === 'BTN_SLOWER') changeTobySpeed(st, -1);
          else if (b.id === 'BTN_TURBO') triggerTurboAndMagnet(st);
          return;
        }
      }

      // 2) Kontrola přímého klepnutí na bublinu větve výhybky na mapě (⬅, ⬆, ➡)
      for (var j = 0; j < st.branchTapTargets.length; j++) {
        var bt = st.branchTapTargets[j];
        if (Math.hypot(sx - bt.sx, sy - bt.sy) <= bt.r) {
          st.toby.switchChoice = bt.choice;
          st.toby.switchIndicatorTimer = 1.4;
          playSwitchClickSfx(bt.choice);
          return;
        }
      }

      // 3) Kontrola klepnutí přímo na mašinku Tobyho -> spustí Turbo + Zahoukání + Bublinkový magnet
      var tobySx = st.proj.toScreenX(st.toby.x);
      var tobySy = st.proj.toScreenY(st.toby.z);
      if (Math.hypot(sx - tobySx, sy - tobySy) <= 44) {
        triggerTurboAndMagnet(st);
        return;
      }

      // 4) Klepnutí kamkoliv na mapu (např. na smajlíka nebo kolej) -> vybere větev výhybky, která vede nejblíže k místu dotyku!
      var tapWx = st.proj.toWorldX(sx);
      var tapWz = st.proj.toWorldZ(sy);
      var baseEdge = st.toby.edge.isTurnout ? st.toby.edge.targetEdge : st.toby.edge;
      if (baseEdge) {
        var br = st.net.getBranches(baseEdge);
        var choices = ['left', 'straight', 'right'];
        var bestChoice = st.toby.switchChoice;
        var bestDist = 999999;
        for (var c = 0; c < choices.length; c++) {
          var ch = choices[c];
          var candEdge = br[ch];
          if (!candEdge || !candEdge.curve) continue;
          var pMid = candEdge.curve.getPointAt(0.42);
          var d = Math.hypot(pMid.x - tapWx, pMid.z - tapWz);
          if (d < bestDist) {
            bestDist = d;
            bestChoice = ch;
          }
        }
        st.toby.switchChoice = bestChoice;
        st.toby.switchIndicatorTimer = 1.4;
        playSwitchClickSfx(bestChoice);
      }
    }

    // ========================================================================
    // 10. VYKRESLOVÁNÍ DYNAMICKÝCH PRVKŮ (VÝHYBKY, TOBY, VAGÓNKY, SMAJLÍCI, UI)
    // ========================================================================
    function drawGlowingSwitchBranches(ctx, st) {
      var proj = st.proj;
      var s = proj.scale;
      var baseEdge = st.toby.edge.isTurnout ? st.toby.edge.targetEdge : st.toby.edge;
      if (!baseEdge) return;

      var br = st.net.getBranches(baseEdge);
      var choices = [
        { key: 'left', edge: br.left, color: '#facc15', arrow: '⬅' },
        { key: 'straight', edge: br.straight, color: '#4ade80', arrow: '⬆' },
        { key: 'right', edge: br.right, color: '#fb923c', arrow: '➡' }
      ];

      st.branchTapTargets = [];
      var drawnEdgeIds = {};

      for (var i = 0; i < choices.length; i++) {
        var item = choices[i];
        if (!item.edge || !item.edge.curve) continue;
        var isSelected = (st.toby.switchChoice === item.key);
        if (!isSelected && drawnEdgeIds[item.edge.id]) continue;
        drawnEdgeIds[item.edge.id] = true;

        var turnoutObj = st.net.turnouts[baseEdge.id + '=>' + item.edge.id];
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = item.color;
        ctx.lineWidth = isSelected ? Math.max(7, 10 * s) : Math.max(3.5, 5 * s);
        ctx.globalAlpha = isSelected ? (0.82 + Math.sin(st.animTime * 7) * 0.16) : 0.36;

        ctx.beginPath();
        var started = false;
        if (turnoutObj && turnoutObj.curve) {
          for (var t = 0; t <= 8; t++) {
            var tp = turnoutObj.curve.getPointAt(t / 8);
            var tsx = proj.toScreenX(tp.x);
            var tsy = proj.toScreenY(tp.z);
            if (!started) {
              ctx.moveTo(tsx, tsy);
              started = true;
            } else {
              ctx.lineTo(tsx, tsy);
            }
          }
        }
        for (var u = 0.16; u <= 0.52; u += 0.04) {
          var ep = item.edge.curve.getPointAt(u);
          var esx = proj.toScreenX(ep.x);
          var esy = proj.toScreenY(ep.z);
          if (!started) {
            ctx.moveTo(esx, esy);
            started = true;
          } else {
            ctx.lineTo(esx, esy);
          }
        }
        ctx.stroke();

        // Světelné běžící šipky po zvolené větvi
        if (isSelected) {
          var flowU = 0.18 + ((st.animTime * 0.28) % 0.30);
          var fp = item.edge.curve.getPointAt(flowU);
          var ftan = item.edge.curve.getTangentAt(flowU);
          var fang = Math.atan2(ftan.z, ftan.x);
          ctx.translate(proj.toScreenX(fp.x), proj.toScreenY(fp.z));
          ctx.rotate(fang);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(7 * s, 0);
          ctx.lineTo(-5 * s, -6 * s);
          ctx.lineTo(-5 * s, 6 * s);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Klikací terčík větve pro dotykové ovládání
        var badgePt = item.edge.curve.getPointAt(0.34);
        var bsx = proj.toScreenX(badgePt.x);
        var bsy = proj.toScreenY(badgePt.z);
        var brad = isSelected ? Math.max(15, 18 * s) : Math.max(12, 14 * s);
        st.branchTapTargets.push({ choice: item.key, sx: bsx, sy: bsy, r: brad + 8 });

        ctx.save();
        ctx.globalAlpha = isSelected ? 0.96 : 0.65;
        ctx.fillStyle = isSelected ? item.color : '#1e293b';
        ctx.strokeStyle = isSelected ? '#ffffff' : item.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(bsx, bsy, brad, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#0f172a' : '#ffffff';
        ctx.font = '900 ' + Math.round(brad * 1.05) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.arrow, bsx, bsy + 1);
        ctx.restore();
      }
    }

    function drawSmileyCharacter2D(ctx, sx, sy, radius, typeId, def, bouncePhase, sEnt, tobyX, tobyZ, proj) {
      ctx.save();
      var bobY = Math.sin(bouncePhase || 0) * 2.5;
      var stretchX = 1 + Math.sin((bouncePhase || 0) * 2) * 0.04;
      var stretchY = 1 - Math.sin((bouncePhase || 0) * 2) * 0.04;

      ctx.translate(sx, sy + bobY);
      ctx.scale(stretchX, stretchY);

      // Stín pod smajlíkem
      ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.85, radius * 0.82, radius * 0.34, 0, 0, TWO_PI);
      ctx.fill();

      // Záře kolem Zlaté hvězdičky
      if (typeId === 'star') {
        var glow = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius * 1.65);
        glow.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
        glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.65, 0, TWO_PI);
        ctx.fill();

        // Pěticípá hvězda
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var p = 0; p < 10; p++) {
          var rStar = (p % 2 === 0) ? radius * 1.18 : radius * 0.54;
          var aStar = (p / 10) * TWO_PI - Math.PI * 0.5;
          var px = Math.cos(aStar) * rStar;
          var py = Math.sin(aStar) * rStar;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (typeId === 'duck') {
        // Roztomilá žlutá kačenka na kolejích
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        // Oranžový zobáček
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.28, radius * 0.42, radius * 0.24, 0, 0, TWO_PI);
        ctx.fill();
      } else if (typeId === 'ball') {
        // Duhový plážový míč
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 0.66);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI * 0.66, Math.PI * 1.33);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Kulaté tělíčko smajlíka s 3D odleskem
        var bodyGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.35, radius * 0.15, 0, 0, radius);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.22, def.color);
        bodyGrad.addColorStop(1, def.border);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
      }

      // Růžové tvářičky
      ctx.fillStyle = def.cheek || '#f43f5e';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(-radius * 0.48, radius * 0.12, radius * 0.18, 0, TWO_PI);
      ctx.arc(radius * 0.48, radius * 0.12, radius * 0.18, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Oči smajlíka (dívají se směrem k Tobymu!)
      var lookAngle = 0;
      if (typeof tobyX === 'number' && proj && sEnt) {
        lookAngle = Math.atan2(proj.toScreenY(tobyZ) - sy, proj.toScreenX(tobyX) - sx);
      }
      var pupilDx = Math.cos(lookAngle) * radius * 0.08;
      var pupilDy = Math.sin(lookAngle) * radius * 0.08;

      // Levé oko
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-radius * 0.30, -radius * 0.18, radius * 0.22, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-radius * 0.30 + pupilDx, -radius * 0.18 + pupilDy, radius * 0.12, 0, TWO_PI);
      ctx.fill();

      // Pravé oko (Mrkálek mrká pravým očkem!)
      var isWinking = (typeId === 'mrkalek' && ((sEnt && sEnt.winkTimer > 0) || Math.sin(bouncePhase * 0.5) > 0.4));
      if (isWinking) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(radius * 0.30, -radius * 0.16, radius * 0.18, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(radius * 0.30, -radius * 0.18, radius * 0.22, 0, TWO_PI);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(radius * 0.30 + pupilDx, -radius * 0.18 + pupilDy, radius * 0.12, 0, TWO_PI);
        ctx.fill();
      }

      // Ústa podle osobnosti
      if (typeId === 'straspytel' && sEnt && sEnt.scaredActive) {
        // Překvapené kulaté "O"
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, radius * 0.32, radius * 0.20, 0, TWO_PI);
        ctx.fill();
      } else if (typeId !== 'duck') {
        // Veselý úsměv
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, radius * 0.10, radius * 0.38, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Provokatér vyplazuje růžový jazýček
        if (typeId === 'provokater') {
          ctx.fillStyle = '#fb7185';
          ctx.strokeStyle = '#be123c';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(radius * 0.10, radius * 0.48, radius * 0.16, radius * 0.22, 0.15, 0, TWO_PI);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Pokud smajlík po 16 sekundách pomáhá dítěti, mává malým zlatým praporkem
      if (sEnt && sEnt.helpingChild) {
        var wave = Math.sin(bouncePhase * 1.8) * 0.32;
        ctx.save();
        ctx.translate(radius * 0.85, -radius * 0.65);
        ctx.rotate(wave);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -14);
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(14, -9);
        ctx.lineTo(0, -4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    function drawTobyAndCollectorWagons2D(ctx, st) {
      var proj = st.proj;
      var s = proj.scale;
      var tobySx = proj.toScreenX(st.toby.x);
      var tobySy = proj.toScreenY(st.toby.z);

      // 1) Bublinkový magnet kolem Tobyho při stisku OK / Enter
      if (st.toby.magnetTimer > 0) {
        var magR = 56 * s * (0.92 + Math.sin(st.animTime * 14) * 0.08);
        ctx.save();
        var magGrad = ctx.createRadialGradient(tobySx, tobySy, magR * 0.2, tobySx, tobySy, magR);
        magGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        magGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.28)');
        magGrad.addColorStop(1, 'rgba(250, 204, 21, 0.65)');
        ctx.fillStyle = magGrad;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tobySx, tobySy, magR, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 2) Vykreslení 3 sběrných vagónků za Tobym (od posledního k prvnímu)
      var wagonColors = ['#f59e0b', '#ec4899', '#10b981'];
      for (var wIdx = 2; wIdx >= 0; wIdx--) {
        var wPose = st.wagonPoses[wIdx];
        if (!wPose) continue;
        var wsx = proj.toScreenX(wPose.x);
        var wsy = proj.toScreenY(wPose.z);
        var wLen = Math.max(24, 30 * s);
        var wWid = Math.max(16, 20 * s);

        ctx.save();
        ctx.translate(wsx, wsy);
        ctx.rotate(wPose.angle);

        // Spojovací spřáhlo k předchozímu vozu
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(wLen * 0.45, 0);
        ctx.lineTo(wLen * 0.72, 0);
        ctx.stroke();

        // Tělo otevřeného vagónku
        ctx.fillStyle = wagonColors[wIdx];
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.2;
        roundRectPath(ctx, -wLen * 0.5, -wWid * 0.5, wLen, wWid, 5);
        ctx.fill();
        ctx.stroke();

        // Vnitřní sedátko pro smajlíka
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        roundRectPath(ctx, -wLen * 0.34, -wWid * 0.34, wLen * 0.68, wWid * 0.68, 4);
        ctx.fill();
        ctx.restore();

        // Pokud ve vagónku sedí chycený smajlík, vykreslíme ho jak se spokojeně veze!
        var passenger = st.wagonPassengers[wIdx];
        if (passenger) {
          drawSmileyCharacter2D(
            ctx,
            wsx,
            wsy,
            Math.max(10, 12.5 * s),
            passenger.typeId,
            passenger.def,
            st.animTime * 8 + wIdx,
            null,
            st.toby.x,
            st.toby.z,
            proj
          );
        }
      }

      // 3) Vykreslení samotné mašinky Tobyho z ptačí perspektivy
      var locoLen = Math.max(36, 46 * s);
      var locoWid = Math.max(22, 28 * s);

      ctx.save();
      ctx.translate(tobySx, tobySy);
      ctx.rotate(st.toby.angle);

      // Stín pod mašinkou
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      roundRectPath(ctx, -locoLen * 0.52 + 2, -locoWid * 0.52 + 3, locoLen * 1.04, locoWid * 1.04, 8);
      ctx.fill();

      // Červená kola na bocích
      ctx.fillStyle = '#ef4444';
      var wheelOffsets = [-locoLen * 0.30, 0, locoLen * 0.28];
      for (var wi = 0; wi < wheelOffsets.length; wi++) {
        ctx.fillRect(wheelOffsets[wi] - 4, -locoWid * 0.58, 8, 4);
        ctx.fillRect(wheelOffsets[wi] - 4, locoWid * 0.58 - 4, 8, 4);
      }

      // Zlatý pluh vpředu (cowcatcher)
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(locoLen * 0.64, 0);
      ctx.lineTo(locoLen * 0.42, -locoWid * 0.46);
      ctx.lineTo(locoLen * 0.42, locoWid * 0.46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tyrkysový kotel a kabina Tobyho
      ctx.fillStyle = st.toby.turboTimer > 0 ? '#06b6d4' : '#0d9488';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.6;
      roundRectPath(ctx, -locoLen * 0.5, -locoWid * 0.48, locoLen, locoWid * 0.96, 7);
      ctx.fill();
      ctx.stroke();

      // Krémová střecha kabiny vzadu
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      roundRectPath(ctx, -locoLen * 0.46, -locoWid * 0.42, locoLen * 0.44, locoWid * 0.84, 5);
      ctx.fill();
      ctx.stroke();

      // Zlatý komínek vpředu
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(locoLen * 0.22, 0, locoWid * 0.22, 0, TWO_PI);
      ctx.fill();
      ctx.stroke();

      // Veselé oči Tobyho vpředu na čele mašinky
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(locoLen * 0.42, -locoWid * 0.20, locoWid * 0.14, 0, TWO_PI);
      ctx.arc(locoLen * 0.42, locoWid * 0.20, locoWid * 0.14, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(locoLen * 0.45, -locoWid * 0.20, locoWid * 0.07, 0, TWO_PI);
      ctx.arc(locoLen * 0.45, locoWid * 0.20, locoWid * 0.07, 0, TWO_PI);
      ctx.fill();

      // Krátká šipka přímo před čelem Tobyho při přepnutí výhybky (pro okamžitou orientaci)
      if (st.toby.switchIndicatorTimer > 0) {
        var indAlpha = Math.min(1, st.toby.switchIndicatorTimer);
        var turnAngle = st.toby.switchChoice === 'left' ? -0.55 : (st.toby.switchChoice === 'right' ? 0.55 : 0);
        var indColor = st.toby.switchChoice === 'left' ? '#facc15' : (st.toby.switchChoice === 'right' ? '#fb923c' : '#4ade80');
        ctx.save();
        ctx.globalAlpha = indAlpha;
        ctx.translate(locoLen * 0.82, 0);
        ctx.rotate(turnAngle);
        ctx.fillStyle = indColor;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-4, -9);
        ctx.lineTo(-4, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    function drawTopCollectionStripAndBottomControls(ctx, st, w, h) {
      st.uiButtons = [];

      // 1) Horní sběratelský pás chycených smajlíků (uprostřed nahoře, bez dlouhých textů)
      var badgeTypes = ['provokater', 'mrkalek', 'straspytel', 'kulisak', 'star'];
      var pillW = Math.min(390, Math.max(260, w * 0.36));
      var pillH = 48;
      var pillX = (w - pillW) * 0.5;
      var pillY = 12;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      roundRectPath(ctx, pillX, pillY, pillW, pillH, 24);
      ctx.fill();
      ctx.stroke();

      var slotW = pillW / badgeTypes.length;
      for (var i = 0; i < badgeTypes.length; i++) {
        var tId = badgeTypes[i];
        var def = SMILEY_TYPES[tId];
        var count = (st.saveData.caughtByType && st.saveData.caughtByType[tId]) || 0;
        var bx = pillX + slotW * (i + 0.5);
        var by = pillY + pillH * 0.5;
        var isPulsing = (st.badgePulseTimer > 0 && st.lastCaughtType === tId);
        var sc = isPulsing ? (1 + Math.sin(st.badgePulseTimer * 18) * 0.22) : 1;

        ctx.save();
        ctx.translate(bx - 12, by);
        ctx.scale(sc, sc);
        drawSmileyCharacter2D(ctx, 0, 0, 12, tId, def, st.animTime * 3 + i, null);
        ctx.restore();

        ctx.fillStyle = count > 0 ? '#fef08a' : '#94a3b8';
        ctx.font = '900 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), bx + 4, by + 1);
      }
      ctx.restore();

      // 2) Spodní obrázkový ovládací panel (přehledný na TV i dotykový na mobilu/PC)
      var dockW = Math.min(540, w - 24);
      var dockH = 62;
      var dockX = (w - dockW) * 0.5;
      var dockY = h - dockH - 12;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.8;
      roundRectPath(ctx, dockX, dockY, dockW, dockH, 22);
      ctx.fill();
      ctx.stroke();

      var buttons = [
        {
          id: 'BTN_LEFT',
          icon: '⬅',
          active: st.toby.switchChoice === 'left',
          bg: st.toby.switchChoice === 'left' ? '#facc15' : '#1e293b',
          fg: st.toby.switchChoice === 'left' ? '#0f172a' : '#facc15',
          border: '#facc15'
        },
        {
          id: 'BTN_STRAIGHT',
          icon: '⬆',
          active: st.toby.switchChoice === 'straight',
          bg: st.toby.switchChoice === 'straight' ? '#4ade80' : '#1e293b',
          fg: st.toby.switchChoice === 'straight' ? '#052e16' : '#4ade80',
          border: '#4ade80'
        },
        {
          id: 'BTN_RIGHT',
          icon: '➡',
          active: st.toby.switchChoice === 'right',
          bg: st.toby.switchChoice === 'right' ? '#fb923c' : '#1e293b',
          fg: st.toby.switchChoice === 'right' ? '#431407' : '#fb923c',
          border: '#fb923c'
        },
        {
          id: 'BTN_SLOWER',
          icon: '🐢 ▼',
          active: false,
          bg: '#1e293b',
          fg: '#cbd5e1',
          border: '#64748b'
        },
        {
          id: 'BTN_FASTER',
          icon: '⚡' + st.toby.speedStage + ' ▲',
          active: st.toby.speedStage >= 4,
          bg: '#0284c7',
          fg: '#ffffff',
          border: '#38bdf8'
        },
        {
          id: 'BTN_TURBO',
          icon: '🧲 OK',
          active: st.toby.magnetTimer > 0,
          bg: st.toby.magnetTimer > 0 ? '#ec4899' : '#be185d',
          fg: '#ffffff',
          border: '#fef08a'
        }
      ];

      var pad = 8;
      var gap = 7;
      var btnW = (dockW - pad * 2 - gap * (buttons.length - 1)) / buttons.length;
      var btnH = dockH - pad * 2;

      for (var bIdx = 0; bIdx < buttons.length; bIdx++) {
        var b = buttons[bIdx];
        var bx2 = dockX + pad + bIdx * (btnW + gap);
        var by2 = dockY + pad;

        st.uiButtons.push({ id: b.id, x: bx2, y: by2, w: btnW, h: btnH });

        ctx.fillStyle = b.bg;
        ctx.strokeStyle = b.border;
        ctx.lineWidth = b.active ? 3 : 2;
        roundRectPath(ctx, bx2, by2, btnW, btnH, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = b.fg;
        ctx.font = '900 ' + (w < 640 ? 15 : 18) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.icon, bx2 + btnW * 0.5, by2 + btnH * 0.5 + 1);
      }

      ctx.restore();
    }

    // ========================================================================
    // 11. VEŘEJNÉ ROZHRANÍ MODULU PRO HAPPYTRAINMINIGAMES
    // ========================================================================
    return {
      start: function (options, hostApi) {
        var net = buildCityTrackNetwork();
        var saveData = loadSmileySaveData();

        // Výchozí trať Tobyho: jižní vjezd směrem na západ nebo střed
        var startEdge = net.edgeById['J_SOUTH->J_SW'] || net.edges[0] || null;
        var initialPose = evaluateEntityPose({ edge: startEdge, u: 0.35 });

        var pathHistory = [];
        for (var h = 0; h < 120; h++) {
          pathHistory.push({
            x: initialPose.x - Math.cos(initialPose.angle) * h * 0.8,
            z: initialPose.z - Math.sin(initialPose.angle) * h * 0.8,
            angle: initialPose.angle
          });
        }

        state = {
          hostApi: hostApi,
          net: net,
          saveData: saveData,
          sessionCaughtCount: 0,
          smileyUidCounter: 0,
          animTime: 0,
          badgePulseTimer: 0,
          lastCaughtType: null,
          proj: null,
          offscreenMap: null,
          lastW: 0,
          lastH: 0,
          toby: {
            edge: startEdge,
            u: 0.35,
            x: initialPose.x,
            z: initialPose.z,
            angle: initialPose.angle,
            inTunnel: false,
            speedStage: 3,
            switchChoice: 'straight',
            switchIndicatorTimer: 0,
            turboTimer: 0,
            magnetTimer: 0,
            smokeTimer: 0
          },
          pathHistory: pathHistory,
          wagonPoses: [
            { x: initialPose.x, z: initialPose.z, angle: initialPose.angle },
            { x: initialPose.x, z: initialPose.z, angle: initialPose.angle },
            { x: initialPose.x, z: initialPose.z, angle: initialPose.angle }
          ],
          wagonPassengers: [],
          jumpingToWagon: [],
          wagonCelebrationTimer: 0,
          smileys: [],
          particles: [],
          branchTapTargets: [],
          uiButtons: []
        };

        if (hostApi && typeof hostApi.setScoreText === 'function') {
          hostApi.setScoreText('😄 ' + saveData.totalCaught + '  ⭐ ' + saveData.starsCaught);
        }

        // Nasadíme první 3 smajlíky s různými osobnostmi
        spawnNewSmiley(state, 'provokater');
        spawnNewSmiley(state, 'mrkalek');
        spawnNewSmiley(state, 'straspytel');
      },

      onAction: function (action, payload) {
        if (!state) return false;

        // 1) Klepnutí prstem nebo myší na plátno
        if (action === 'JUMP' && payload && typeof payload.x === 'number' && typeof payload.y === 'number') {
          handleCanvasPointerTap(state, payload.x, payload.y);
          return true;
        }

        // 2) Šipky Vlevo / Vpravo -> přepnutí výhybky
        if (action === 'LEFT') {
          changeSwitchChoice(state, -1);
          return true;
        }
        if (action === 'RIGHT') {
          changeSwitchChoice(state, 1);
          return true;
        }

        // 3) Šipka Dolů -> zpomalení Tobyho
        if (action === 'DOWN') {
          changeTobySpeed(state, -1);
          return true;
        }

        // 4) Rozlišení šipky Nahoru (ArrowUp) od tlačítka OK / Enter / Mezerník
        if (action === 'JUMP' || action === 'CONFIRM' || action === 'UP') {
          var keyName = (payload && payload.key) || (payload && payload.originalEvent && payload.originalEvent.key) || '';
          var keyCode = (payload && payload.originalEvent && (payload.originalEvent.keyCode || payload.originalEvent.which)) || 0;
          if (action === 'UP' || keyName === 'ArrowUp' || keyCode === 38) {
            changeTobySpeed(state, 1);
            return true;
          }
          // OK / Enter / Mezerník -> Krátké veselé turbo + zahoukání + bublinkový magnet!
          triggerTurboAndMagnet(state);
          return true;
        }

        return false;
      },

      update: function (dt, w, h) {
        if (!state) return;
        state.animTime += dt;

        // Přepočet projekce a offscreen mapy pouze při startu nebo změně rozlišení okna
        if (!state.proj || state.lastW !== w || state.lastH !== h) {
          state.lastW = w;
          state.lastH = h;
          state.proj = computeProjection(w, h);
          state.offscreenMap = buildOffscreenCityMap(state.proj, state.net);
        }

        if (state.badgePulseTimer > 0) {
          state.badgePulseTimer = Math.max(0, state.badgePulseTimer - dt);
        }
        if (state.toby.switchIndicatorTimer > 0) {
          state.toby.switchIndicatorTimer = Math.max(0, state.toby.switchIndicatorTimer - dt);
        }
        if (state.toby.turboTimer > 0) {
          state.toby.turboTimer = Math.max(0, state.toby.turboTimer - dt);
        }
        if (state.toby.magnetTimer > 0) {
          state.toby.magnetTimer = Math.max(0, state.toby.magnetTimer - dt);
        }

        // 1) Posun mašinky Tobyho po kolejích
        var baseSpeed = TOBY_SPEED_MAP[state.toby.speedStage] || 76;
        var turboBoost = state.toby.turboTimer > 0 ? 1.48 : 1.0;
        var distStep = baseSpeed * turboBoost * dt;

        advanceTrackEntity(state.toby, distStep, state.net, function (tobyEnt, br) {
          return br[tobyEnt.switchChoice] || br.straight || br.left || br.right;
        });

        var tPose = evaluateEntityPose(state.toby);
        state.toby.x = tPose.x;
        state.toby.z = tPose.z;
        state.toby.angle = tPose.angle;
        state.toby.inTunnel = tPose.inTunnel;

        // Ukládání historie stopy pro 3 vagónky za Tobym
        var headHist = state.pathHistory[0];
        if (!headHist || Math.hypot(state.toby.x - headHist.x, state.toby.z - headHist.z) >= 1.2) {
          state.pathHistory.unshift({
            x: state.toby.x,
            z: state.toby.z,
            angle: state.toby.angle
          });
          if (state.pathHistory.length > 180) {
            state.pathHistory.pop();
          }
        }

        // Výpočet pozic 3 vagónků v přesných rozestupech za Tobym (26 m, 46 m, 66 m)
        var targetDistances = [26, 46, 66];
        var accDist = 0;
        var wIdx = 0;
        for (var hi = 1; hi < state.pathHistory.length && wIdx < 3; hi++) {
          var pPrev = state.pathHistory[hi - 1];
          var pCur = state.pathHistory[hi];
          accDist += Math.hypot(pCur.x - pPrev.x, pCur.z - pPrev.z);
          while (wIdx < 3 && accDist >= targetDistances[wIdx]) {
            state.wagonPoses[wIdx] = {
              x: pCur.x,
              z: pCur.z,
              angle: pCur.angle
            };
            wIdx++;
          }
        }

        // Obláčky páry z komínku Tobyho
        state.toby.smokeTimer -= dt;
        if (state.toby.smokeTimer <= 0) {
          state.toby.smokeTimer = state.toby.turboTimer > 0 ? 0.08 : 0.22;
          spawnSparkleParticle(
            state,
            state.toby.x,
            state.toby.z,
            state.toby.turboTimer > 0 ? '#bae6fd' : 'rgba(255,255,255,0.85)'
          );
        }

        // 2) Aktualizace smajlíků na kolejích a detekce chycení
        var catchRadius = state.toby.magnetTimer > 0 ? 40 : 28;
        for (var si = state.smileys.length - 1; si >= 0; si--) {
          var sEnt = state.smileys[si];
          updateSmileyEntity(sEnt, dt, state);

          var dToby = Math.hypot(sEnt.x - state.toby.x, sEnt.z - state.toby.z);
          if (dToby <= catchRadius) {
            triggerCatchSmiley(state, sEnt);
            state.smileys.splice(si, 1);
          }
        }

        // Udržujeme na mapě vždy 3 smajlíky
        while (state.smileys.length < 3) {
          spawnNewSmiley(state, null);
        }

        // 3) Animace naskočení chyceného smajlíka do vagónku
        for (var ji = state.jumpingToWagon.length - 1; ji >= 0; ji--) {
          var jmp = state.jumpingToWagon[ji];
          jmp.progress += dt * 2.4;
          if (jmp.progress >= 1.0) {
            state.wagonPassengers.push({
              typeId: jmp.typeId,
              def: jmp.def
            });
            state.jumpingToWagon.splice(ji, 1);

            // Pokud jsou všechny 3 vagónky plné, spustíme velkou oslavu a uvolníme místa pro další smajlíky!
            if (state.wagonPassengers.length >= 3) {
              state.wagonCelebrationTimer = 1.2;
              playWagonFullFanfareSfx();
              spawnCatchCelebrationBurst(state, state.toby.x, state.toby.z, true);
            }
          }
        }

        if (state.wagonCelebrationTimer > 0) {
          state.wagonCelebrationTimer -= dt;
          if (state.wagonCelebrationTimer <= 0) {
            state.wagonPassengers = [];
          }
        }

        // 4) Aktualizace částic
        for (var pi = state.particles.length - 1; pi >= 0; pi--) {
          var pt = state.particles[pi];
          pt.wx += pt.vx * dt;
          pt.wz += pt.vz * dt;
          pt.life -= dt;
          if (pt.life <= 0) {
            state.particles.splice(pi, 1);
          }
        }
      },

      render: function (ctx, w, h) {
        if (!state || !state.proj) return;
        var proj = state.proj;

        // 1) Vykreslení předkreslené 2D mapy města z offscreen bufferu (< 0.4 ms)
        if (state.offscreenMap) {
          ctx.drawImage(state.offscreenMap, 0, 0, w, h);
        }

        // 2) Svítící navigační větve výhybky před mašinkou
        drawGlowingSwitchBranches(ctx, state);

        // 3) Částice (obláčky páry, konfety, třpytky hvězdičky)
        for (var pi = 0; pi < state.particles.length; pi++) {
          var p = state.particles[pi];
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(proj.toScreenX(p.wx), proj.toScreenY(p.wz), p.size, 0, TWO_PI);
          ctx.fill();
          ctx.restore();
        }

        // 4) Smajlíci a roztomilé objekty na kolejích
        for (var si = 0; si < state.smileys.length; si++) {
          var sEnt = state.smileys[si];
          var sx = proj.toScreenX(sEnt.x);
          var sy = proj.toScreenY(sEnt.z);
          var rad = Math.max(17, sEnt.def.radiusPx * proj.scale * 0.92);

          // Pokud je smajlík v severním tunelu, vykreslíme ho poloprůhledně jako vykukujícího z tunelu
          ctx.save();
          if (sEnt.inTunnel) ctx.globalAlpha = 0.62;
          drawSmileyCharacter2D(
            ctx,
            sx,
            sy,
            rad,
            sEnt.typeId,
            sEnt.def,
            sEnt.bouncePhase,
            sEnt,
            state.toby.x,
            state.toby.z,
            proj
          );
          ctx.restore();
        }

        // 5) Vláček Toby a jeho 3 sběrné vagónky
        drawTobyAndCollectorWagons2D(ctx, state);

        // 6) Smajlíci skákající obloukem do vagónku po chycení
        for (var ji = 0; ji < state.jumpingToWagon.length; ji++) {
          var jmp = state.jumpingToWagon[ji];
          var targetPose = state.wagonPoses[jmp.seatIdx] || state.toby;
          var curWx = jmp.startX + (targetPose.x - jmp.startX) * jmp.progress;
          var curWz = jmp.startZ + (targetPose.z - jmp.startZ) * jmp.progress;
          var jumpArcPx = Math.sin(jmp.progress * Math.PI) * 48;
          drawSmileyCharacter2D(
            ctx,
            proj.toScreenX(curWx),
            proj.toScreenY(curWz) - jumpArcPx,
            18,
            jmp.typeId,
            jmp.def,
            state.animTime * 12,
            null
          );
        }

        // 7) Horní sběratelský pás a spodní ovládací lišta
        drawTopCollectionStripAndBottomControls(ctx, state, w, h);
      },

      stop: function () {
        state = null;
      }
    };
  }

  function registerSmileyMinigame() {
    if (window.HappyTrainMinigames && typeof window.HappyTrainMinigames.register === 'function') {
      window.HappyTrainMinigames.register('escape_smiley', createSmileyChaseMinigame());
    }
  }

  registerSmileyMinigame();
  window.addEventListener('DOMContentLoaded', registerSmileyMinigame);
})();
