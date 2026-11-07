// ============================================================================
// HAPPY TRAIN - CASTLE OF A THOUSAND ADVENTURES (castle.js)
// - Central Sky-Piercing Neuschwanstein Fairy-Tale Castle at J_CENTER (0, 1.8, 15)
//   reaching 149m into the sky with drifting cloud rings by day & vibrant
//   multi-colored illuminated windows, stained-glass rose windows, fairy-light
//   garlands, and warm glowing palace walls at night!
// - 4 Grand Open Castle Gatehouses with wide-open golden-studded wooden doors
//   on all 4 cardinal railway approaches (South, North, West, East) so every
//   track leads through open doors directly into the Magical Interior Rondel!
// - Grand Circular Railway Rondel (R = 35m) with Sparkling 24k Golden Turnouts
// - Concentric Atlantis Water Moat (R = 39m..67m) with 4 animated spouting Whales!
// - 3 Great White Pyramids of Giza evenly spaced (120 deg apart) on the moat rim!
// - Interior Magical Rondel at (0, -85, -1800) with R = 74m Circular Track,
//   Magical Crystal Tree & Singing Fountains, and 6 Minigame Gates at R = 82m!
// - Vietnam Tropical Sea Lagoon & removal of submerged pine trees around Vietnam!
// ============================================================================
(function () {
  'use strict';

  // Central Map Position right at J_CENTER (0, 1.8, 15)
  var EXT_POS = { x: 0, y: 1.8, z: 15 };
  var R_EXT_RONDEL = 35;
  var R_MOAT_INNER = 39;
  var R_MOAT_OUTER = 67;
  var R_PYRAMIDS = 78;

  // Interior Magical Rondel Hall (isolated below ground at z = -1800)
  var INT_CENTER = { x: 0, y: -85, z: -1800 };
  var R_TRACK = 74;
  var R_GATE = 82;
  var R_DOME = 104;
  var TWO_PI = Math.PI * 2;

  // 8 circular stops inside the Castle Rondel (angles in radians around R = 74m):
  var CASTLE_STOPS = [
    {
      id: 'ENTRY',
      type: 'entry',
      angle: 0,
      title: '🏰 Vstupní brána zámku',
      subtitle: 'Hlavní příjezd ze zlaté odbočky • Šipkami ◄ ► vyber pohádkovou bránu',
      colorHex: 0xfbbf24,
      accentHex: '#fbbf24',
      buttonLabel: '🎡 Další brána (OK)'
    },
    {
      id: 'SAMA_DIRA',
      type: 'minigame',
      minigameId: 'sama_dira',
      ready: true,
      angle: Math.PI * 0.25, // 45 deg
      title: '🦘 1. Samá díra',
      subtitle: 'Skákej s vláčkem přes propasti a sbírej hvězdičky!',
      colorHex: 0xf59e0b,
      accentHex: '#f59e0b',
      buttonLabel: '🎮 Hrát Samá díra (OK)'
    },
    {
      id: 'SMILEY',
      type: 'minigame',
      minigameId: 'escape_smiley',
      ready: false,
      angle: Math.PI * 0.5, // 90 deg
      title: '😄 2. Escape the Smiley',
      subtitle: 'Sbírej hvězdy a ujeď veselému smajlíkovi! (Připravujeme)',
      colorHex: 0xec4899,
      accentHex: '#ec4899',
      buttonLabel: '✨ Brzy otevřeme (OK)'
    },
    {
      id: 'ART_STUDIO',
      type: 'minigame',
      minigameId: 'art_studio',
      ready: false,
      angle: Math.PI * 0.75, // 135 deg
      title: '🎨 3. Art Studio',
      subtitle: 'Kreslení, barvičky a pohádkové samolepky! (Připravujeme)',
      colorHex: 0x8b5cf6,
      accentHex: '#8b5cf6',
      buttonLabel: '✨ Brzy otevřeme (OK)'
    },
    {
      id: 'EXIT',
      type: 'exit',
      angle: Math.PI, // 180 deg (North)
      title: '🚂 Výjezd ze zámku na rondel',
      subtitle: 'Návrat na centrální rondel uprostřed města',
      colorHex: 0x10b981,
      accentHex: '#10b981',
      buttonLabel: '🚂 Vyjet ven do města (OK)'
    },
    {
      id: 'TRAIN_WASH',
      type: 'minigame',
      minigameId: 'train_wash',
      ready: false,
      angle: Math.PI * 1.25, // 225 deg
      title: '🫧 4. Myčka vláčku',
      subtitle: 'Umyj mašinku pěnou, kartáči a ozdob ji! (Připravujeme)',
      colorHex: 0x06b6d4,
      accentHex: '#06b6d4',
      buttonLabel: '✨ Brzy otevřeme (OK)'
    },
    {
      id: 'PARCELS',
      type: 'minigame',
      minigameId: 'parcel_delivery',
      ready: false,
      angle: Math.PI * 1.5, // 270 deg
      title: '📦 5. Doručování zásilek',
      subtitle: 'Třiď barevné dárky a balíčky do správných vagónků! (Připravujeme)',
      colorHex: 0x22c55e,
      accentHex: '#22c55e',
      buttonLabel: '✨ Brzy otevřeme (OK)'
    },
    {
      id: 'MUSIC_STUDIO',
      type: 'minigame',
      minigameId: 'music_studio',
      ready: false,
      angle: Math.PI * 1.75, // 315 deg
      title: '🎵 6. Hudební studio',
      subtitle: 'Zahraj si veselé písničky na kouzelné píšťalky! (Připravujeme)',
      colorHex: 0x3b82f6,
      accentHex: '#3b82f6',
      buttonLabel: '✨ Brzy otevřeme (OK)'
    }
  ];

  var castleState = {
    initialized: false,
    isInside: false,
    isTransitioning: false,
    reentryCooldown: 0,
    doorOpenProgress: 0,      // 0 = giant doors closed, 1 = giant doors swung wide open
    entryCeremonyPhase: 'NONE', // 'NONE' | 'APPROACHING' | 'OPENING_DOORS' | 'ENTERING'
    entryCeremonySpoken: false,
    exitCamHoldTimer: 0,
    selectedStopIdx: 1, // Starts at Gate 1 (Samá díra)
    trainAngle: Math.PI * 0.14,
    targetAngle: Math.PI * 0.25,
    cameraAngle: Math.PI * 0.14,
    autoCruise: true,
    cruiseDir: 1,
    manualSteerHoldTimer: 0,
    exteriorGroup: null,
    exteriorDoorHinges: [],
    exteriorRoofNightMats: [],
    exteriorWallNightMats: [],
    exteriorWindowMats: [],
    exteriorNightLights: [],
    exteriorStars: [],
    portalCurtainMats: [],
    skyCloudRings: [],
    goldenSparkles: [],
    goldenRailMats: [],
    atlantisWhales: [],
    pyramidCapstones: [],
    interiorGroup: null,
    crystalTreeGroup: null,
    crystalMeshes: [],
    fountainDrops: [],
    interiorFireflies: [],
    interiorLanternOrbs: [],
    gateObjects: [],
    goldenSpurEdge: null,
    lastAutoGoldEdgeId: null,
    savedFogDensity: null,
    savedFogColorHex: null,
    savedBgColorHex: null,
    hudEl: null,
    flashEl: null
  };

  window.HappyTrainCastle = castleState;

  function shortestAngleDiff(fromRad, toRad) {
    var diff = (toRad - fromRad) % TWO_PI;
    if (diff > Math.PI) diff -= TWO_PI;
    if (diff < -Math.PI) diff += TWO_PI;
    return diff;
  }

  function normalizeAngle(rad) {
    var r = rad % TWO_PI;
    return r < 0 ? r + TWO_PI : r;
  }

  function cacheCurveLength(c) {
    if (!c) return c;
    var cachedLen = c.getLength();
    c.getLength = function () {
      return cachedLen;
    };
    return c;
  }

  // Majestic Web Audio Royal Harp & Fanfare Chime when the Giant Castle Doors slowly swing open!
  function playCastleDoorOpenFanfare() {
    if (typeof window.initAudio === 'function') {
      try { window.initAudio(); } catch (e) {}
    }
    var ctx = (typeof window.audioCtx !== 'undefined' && window.audioCtx) ? window.audioCtx : null;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !window._castleAudioCtx) {
        try { window._castleAudioCtx = new AC(); } catch (e) {}
      }
      ctx = window._castleAudioCtx;
    }
    if (!ctx) return;
    try {
      var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      for (var i = 0; i < notes.length; i++) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        var startT = ctx.currentTime + i * 0.14;
        osc.frequency.setValueAtTime(notes[i], startT);
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(0.14, startT + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.78);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 0. VIETNAM TROPICAL SEA LAGOON & REMOVAL OF TREES GROWING IN THE SEA
  // ==========================================================================
  function setupVietnamTropicalSeaAndRemoveSeaTrees() {
    if (typeof scene === 'undefined') return;

    // 1. Remove/hide all 2.5D pine trees (`spawnStorybookPine`) that were spawned
    //    in the sea/water area around Vietnam / Mom & Dad's House (`x < -115, z in [-220, +85]`).
    scene.children.forEach(function (obj) {
      if (!obj || !obj.position) return;
      var ox = obj.position.x;
      var oz = obj.position.z;
      if (ox < -115 && ox > -380 && oz > -220 && oz < 85) {
        var is2DPineOrTree = false;
        if (obj.children && obj.children.length >= 2 && obj.children.length <= 4) {
          for (var ci = 0; ci < obj.children.length; ci++) {
            var ch = obj.children[ci];
            if (
              ch &&
              ch.isMesh &&
              ch.geometry &&
              ch.geometry.type === 'PlaneGeometry' &&
              ch.geometry.parameters &&
              ((Math.abs(ch.geometry.parameters.width - 9.0) < 0.2 &&
                Math.abs(ch.geometry.parameters.height - 11.5) < 0.2) ||
                (Math.abs(ch.geometry.parameters.width - 10.0) < 0.2 &&
                  Math.abs(ch.geometry.parameters.height - 10.0) < 0.2))
            ) {
              is2DPineOrTree = true;
              break;
            }
          }
        }
        if (is2DPineOrTree) {
          obj.visible = false;
          obj.scale.set(0.0001, 0.0001, 0.0001);
        }
      }
    });

    // 2. Build a gorgeous Tropical Turquoise Sea Bay & White Sandy Coral Island
    //    around Mom & Dad's Vietnamese Bungalow (`x = -238, z = -144`) so Vietnam
    //    is surrounded by sparkling turquoise sea water with zero trees in the water!
    var vietnamSeaGroup = new THREE.Group();
    vietnamSeaGroup.name = 'VietnamTropicalSeaLagoon';

    var seaLagoonMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.32,
      roughness: 0.16,
      metalness: 0.22,
      side: THREE.DoubleSide
    });
    var seaLagoon = new THREE.Mesh(new THREE.CircleGeometry(54, 64), seaLagoonMat);
    seaLagoon.rotation.x = -Math.PI / 2;
    seaLagoon.position.set(-238, 0.18, -144);
    seaLagoon.scale.set(1.06, 0.96, 1);
    vietnamSeaGroup.add(seaLagoon);

    var sandIslandMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.12,
      roughness: 0.75
    });
    var sandShore = new THREE.Mesh(new THREE.CylinderGeometry(37.5, 41.0, 0.75, 48), sandIslandMat);
    sandShore.position.set(-238, 0.45, -144);
    sandShore.scale.set(1.02, 1, 1.02);
    vietnamSeaGroup.add(sandShore);

    var lushIslandTop = new THREE.Mesh(
      new THREE.CylinderGeometry(35.0, 37.2, 0.85, 48),
      new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.65 })
    );
    lushIslandTop.position.set(-238, 0.56, -144);
    lushIslandTop.scale.set(1.02, 1, 1.02);
    vietnamSeaGroup.add(lushIslandTop);

    scene.add(vietnamSeaGroup);
  }

  // Ensure surface grass & rivers are always visible whenever the train is on the surface
  function ensureSurfaceWorldVisible() {
    if (castleState.isInside) return;
    if (typeof window.pState !== 'undefined' && window.pState && window.pState.inSubway) return;
    if (window.grassMesh && !window.grassMesh.visible) {
      window.grassMesh.visible = true;
    }
    if (window.riverMesh && !window.riverMesh.visible) {
      window.riverMesh.visible = true;
    }
    if (window.tracksRiverMesh && !window.tracksRiverMesh.visible) {
      window.tracksRiverMesh.visible = true;
    }
    if (window.surfaceHousesList) {
      for (var i = 0; i < window.surfaceHousesList.length; i++) {
        if (window.surfaceHousesList[i] && !window.surfaceHousesList[i].visible) {
          window.surfaceHousesList[i].visible = true;
        }
      }
    }
  }

  // ==========================================================================
  // 1. CENTRAL RONDEL, 8 GRAND CASTLE ENTRANCES & GOLDEN TRACK VISUALS
  // ==========================================================================
  function registerCastleTracks() {
    if (typeof window.nodes === 'undefined' || typeof window.edges === 'undefined') {
      return false;
    }
    if (window.nodes.N_CASTLE_PORTAL) return true;

    // Hide the old small fountain at (32, fy, 6) so the Grand Central Rondel & Atlantis Moat are unobstructed
    if (window.fountainDrops && window.fountainDrops.length > 0 && window.fountainDrops[0].mesh) {
      var oldFountainGroup = window.fountainDrops[0].mesh.parent;
      if (oldFountainGroup) {
        oldFountainGroup.visible = false;
      }
    }

    if (window.nodes.J_CENTER) {
      window.nodes.J_CENTER.name = '🏰 Kouzelný Zámek a Rondel';
    }

    // Portal node inside the Golden Gatehouse of the Neuschwanstein Castle
    window.nodes.N_CASTLE_PORTAL = {
      id: 'N_CASTLE_PORTAL',
      pos: new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.25, EXT_POS.z),
      name: '🏰 Zlatá brána Kouzelného Zámku',
      isExit: true,
      unlocked: true
    };

    // Sparkling Golden Spur Curve from South Rondel straight into the South Castle Doors
    var spurPts = [
      new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.12, EXT_POS.z + 37.0),
      new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.16, EXT_POS.z + 29.0),
      new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.20, EXT_POS.z + 20.0),
      new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.22, EXT_POS.z + 10.0),
      new THREE.Vector3(EXT_POS.x, EXT_POS.y + 0.25, EXT_POS.z)
    ];
    var goldenCurve = cacheCurveLength(new THREE.CatmullRomCurve3(spurPts, false));

    var goldenSpurEdge = {
      id: 'J_CENTER->N_CASTLE_PORTAL',
      from: 'J_CENTER',
      to: 'N_CASTLE_PORTAL',
      curve: goldenCurve,
      parallelCurve: goldenCurve,
      isSubway: false,
      isGoldenCastleSpur: true,
      landmark: { type: 'castle', name: '🏰 Zlatá brána do Zámku ✨' },
      station: {
        type: 'castle_spur',
        icon: 'castle',
        name: '🏰 Zlatá brána do Zámku ✨',
        emoji: '🏰',
        voice: 'Vjíždíme otevřenou zlatou branou přímo do pohádkového zámku!'
      }
    };

    // Return edge from N_CASTLE_PORTAL back to J_CENTER so N_CASTLE_PORTAL always has an outgoing edge in window.edges
    var returnSpurPts = spurPts.slice().reverse();
    var returnGoldenCurve = cacheCurveLength(new THREE.CatmullRomCurve3(returnSpurPts, false));
    var goldenReturnEdge = {
      id: 'N_CASTLE_PORTAL->J_CENTER',
      from: 'N_CASTLE_PORTAL',
      to: 'J_CENTER',
      curve: returnGoldenCurve,
      parallelCurve: returnGoldenCurve,
      isSubway: false,
      isGoldenCastleSpur: true,
      landmark: { type: 'castle', name: '🏰 Výjezd ze Zámku ✨' },
      station: goldenSpurEdge.station
    };

    window.edges.push(goldenSpurEdge, goldenReturnEdge);
    castleState.goldenSpurEdge = goldenSpurEdge;

    // Configure turnouts & Golden Carpet visual overlays for ALL 4 incoming city tracks to J_CENTER:
    // Both tracks (`curve` and `parallelCurve`) on all 4 approaches receive golden sparkles and lead
    // straight into the wide-open Royal Gatehouses!
    var incomingCenterIds = [
      'J_SOUTH->J_CENTER',
      'J_EAST->J_CENTER',
      'J_NORTH->J_CENTER',
      'J_WEST->J_CENTER'
    ];

    castleState.gateApproaches = [];

    // Remove any pre-existing landmark showcase on J_CENTER edges so exiting the Castle never triggers an aerial sweep!
    if (typeof window.landmarkShowcases === 'object' && window.landmarkShowcases) {
      delete window.landmarkShowcases['J_CENTER->J_SOUTH'];
      delete window.landmarkShowcases['J_SOUTH->J_CENTER'];
      delete window.landmarkShowcases['J_CENTER->J_NORTH'];
      delete window.landmarkShowcases['J_NORTH->J_CENTER'];
      delete window.landmarkShowcases['J_CENTER->J_WEST'];
      delete window.landmarkShowcases['J_WEST->J_CENTER'];
      delete window.landmarkShowcases['J_CENTER->J_EAST'];
      delete window.landmarkShowcases['J_EAST->J_CENTER'];
    }

    incomingCenterIds.forEach(function (inId, idx) {
      var inEdge = null;
      for (var i = 0; i < window.edges.length; i++) {
        if (window.edges[i].id === inId) {
          inEdge = window.edges[i];
          break;
        }
      }
      if (!inEdge || !inEdge.curve) return;

      var p0 = inEdge.curve.getPointAt(0.84);
      var pPar0 = inEdge.parallelCurve ? inEdge.parallelCurve.getPointAt(0.84) : p0.clone();
      var inTan = inEdge.curve.getTangentAt(0.84).normalize();
      inTan.y = 0;
      if (inTan.lengthSq() < 0.001) inTan.set(0, 0, -1);
      else inTan.normalize();

      var midTrack0 = p0.clone().lerp(pPar0, 0.5);
      // Place the Gatehouse Portal Threshold 5.8m inward along the exact track tangent from u = 0.84
      var portalWorldPos = midTrack0.clone().addScaledVector(inTan, 5.8);
      portalWorldPos.y = EXT_POS.y;
      var outwardDir = new THREE.Vector3(-inTan.x, 0, -inTan.z).normalize();
      var gateYaw = Math.atan2(outwardDir.x, outwardDir.z);

      castleState.gateApproaches.push({
        edgeId: inId,
        gateIndex: idx,
        portalWorldPos: portalWorldPos,
        inTan: inTan,
        outwardDir: outwardDir,
        gateYaw: gateYaw
      });

      // Continue the main track 100% straight along inTan right through the center of the Gatehouse Doors!
      var pEnd = p0.clone().addScaledVector(inTan, 28.0);
      pEnd.y = EXT_POS.y + 0.22;
      var directPts = [
        p0.clone(),
        p0.clone().lerp(pEnd, 0.35),
        p0.clone().lerp(pEnd, 0.70),
        pEnd.clone()
      ];
      var tCurve = cacheCurveLength(new THREE.CatmullRomCurve3(directPts, false));
      buildGoldenTrackVisuals(tCurve, 0.0, 0.85, idx === 0);

      // Also render the parallel track of the double-track straight into the same wide Gatehouse Doorway!
      var pParEnd = pPar0.clone().addScaledVector(inTan, 28.0);
      pParEnd.y = EXT_POS.y + 0.22;
      var parPts = [
        pPar0.clone(),
        pPar0.clone().lerp(pParEnd, 0.35),
        pPar0.clone().lerp(pParEnd, 0.70),
        pParEnd.clone()
      ];
      var tParCurve = cacheCurveLength(new THREE.CatmullRomCurve3(parPts, false));
      buildGoldenTrackVisuals(tParCurve, 0.0, 0.85, false);

      var tKey = inEdge.id + '=>' + goldenSpurEdge.id;
      window.turnoutCurves[tKey] = {
        id: 'TURNOUT_' + tKey,
        from: 'J_CENTER',
        to: 'N_CASTLE_PORTAL',
        isTurnout: true,
        isSubway: false,
        isGoldenCastleTurnout: true,
        sourceEdge: inEdge,
        targetEdge: goldenSpurEdge,
        curve: tCurve,
        parallelCurve: tParCurve,
        station: goldenSpurEdge.station
      };
    });

    // Build the full 360-degree Grand Circular Rondel Track & Royal Promenade around (0, 1.8, 15)
    buildCentralRondelRingVisuals();

    // Hook window.getBranches so approaching J_CENTER from ANY direction offers the Golden Castle Spur,
    // and guard N_CASTLE_PORTAL before calling prevGetBranches so models.js never sees an empty candidate list!
    var prevGetBranches = window.getBranches;
    window.getBranches = function (currentEdge) {
      var fallbackEdge = (window.edges && window.edges[0]) || goldenSpurEdge;
      for (var fi = 0; window.edges && fi < window.edges.length; fi++) {
        if (window.edges[fi].id === 'J_CENTER->J_WEST') {
          fallbackEdge = window.edges[fi];
          break;
        }
      }
      var safeFallback = { left: fallbackEdge, straight: fallbackEdge, right: fallbackEdge };
      if (!currentEdge) return safeFallback;

      var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
      if (!baseEdge) return safeFallback;

      // Immediately handle N_CASTLE_PORTAL or golden castle turnouts BEFORE calling prevGetBranches
      if (
        baseEdge.to === 'N_CASTLE_PORTAL' ||
        baseEdge.from === 'N_CASTLE_PORTAL' ||
        baseEdge.isGoldenCastleSpur ||
        currentEdge.isGoldenCastleTurnout
      ) {
        return safeFallback;
      }

      var res = safeFallback;
      if (prevGetBranches) {
        try {
          var prevRes = prevGetBranches(currentEdge);
          if (prevRes && (prevRes.left || prevRes.straight || prevRes.right)) {
            res = prevRes;
          }
        } catch (err) {
          res = safeFallback;
        }
      }

      if (
        baseEdge.id === 'J_NORTH->J_CENTER' ||
        baseEdge.id === 'J_SOUTH->J_CENTER' ||
        baseEdge.id === 'J_WEST->J_CENTER' ||
        baseEdge.id === 'J_EAST->J_CENTER'
      ) {
        return {
          left: res.left || res.straight || fallbackEdge,
          straight: goldenSpurEdge,
          right: res.right || res.straight || fallbackEdge
        };
      }
      return res;
    };

    // Add custom castle pictogram for junction signs
    var prevDrawPicto = window.drawLandmarkPictogram;
    window.drawLandmarkPictogram = function (ctx, type, cx, cy, r) {
      if (type === 'castle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TWO_PI);
        ctx.fillStyle = '#1e1b4b';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(cx - r * 0.45, cy - r * 0.1, r * 0.9, r * 0.55);
        ctx.fillRect(cx - r * 0.18, cy - r * 0.55, r * 0.36, r * 0.5);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.82);
        ctx.lineTo(cx - r * 0.25, cy - r * 0.52);
        ctx.lineTo(cx + r * 0.25, cy - r * 0.52);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }
      if (prevDrawPicto) {
        return prevDrawPicto(ctx, type, cx, cy, r);
      }
    };

    if (typeof window.updateHUD === 'function') {
      try {
        window.updateHUD();
      } catch (e) {}
    }

    return true;
  }

  function buildGoldenTrackVisuals(curve, uStart, uEnd, isMainSpur) {
    if (!curve || typeof scene === 'undefined') return;
    var g = new THREE.Group();
    var len = curve.getLength() * (uEnd - uStart);
    var steps = Math.max(12, Math.floor(len / 1.4));

    var goldSleeperMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      roughness: 0.22,
      metalness: 0.78
    });
    var goldRailMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.92
    });
    var carpetMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide
    });
    castleState.goldenRailMats.push(goldRailMat, goldSleeperMat);

    var sleeperGeo = new THREE.BoxGeometry(3.8, 0.24, 0.64);
    var carpetGeo = new THREE.PlaneGeometry(2.6, 1.55);
    carpetGeo.rotateX(-Math.PI / 2);

    var leftPts = [];
    var rightPts = [];

    for (var i = 0; i <= steps; i++) {
      var u = uStart + (i / steps) * (uEnd - uStart);
      var pt = curve.getPointAt(u);
      var tan = curve.getTangentAt(u).normalize();
      var yaw = Math.atan2(tan.x, tan.z);
      var right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

      var sleeper = new THREE.Mesh(sleeperGeo, goldSleeperMat);
      sleeper.position.set(pt.x, pt.y + 0.14, pt.z);
      sleeper.rotation.y = yaw;
      g.add(sleeper);

      var carpet = new THREE.Mesh(carpetGeo, carpetMat);
      carpet.position.set(pt.x, pt.y + 0.20, pt.z);
      carpet.rotation.y = yaw;
      g.add(carpet);

      leftPts.push(new THREE.Vector3(pt.x - right.x * 0.88, pt.y + 0.30, pt.z - right.z * 0.88));
      rightPts.push(new THREE.Vector3(pt.x + right.x * 0.88, pt.y + 0.30, pt.z + right.z * 0.88));

      if (i % 2 === 0) {
        var spGeo = new THREE.OctahedronGeometry(0.44, 0);
        var spMat = new THREE.MeshBasicMaterial({
          color: i % 4 === 0 ? 0xffffff : 0xfef08a
        });
        var spMesh = new THREE.Mesh(spGeo, spMat);
        var sideOff = (i % 4 === 0 ? -1 : 1) * (1.35 + (i % 3) * 0.45);
        var baseX = pt.x + right.x * sideOff;
        var baseZ = pt.z + right.z * sideOff;
        var baseY = pt.y + 0.5;
        spMesh.position.set(baseX, baseY, baseZ);
        g.add(spMesh);
        castleState.goldenSparkles.push({
          mesh: spMesh,
          baseX: baseX,
          baseY: baseY,
          baseZ: baseZ,
          phase: i * 0.45,
          speed: 1.4 + (i % 5) * 0.25
        });
      }
    }

    var leftRailCurve = new THREE.CatmullRomCurve3(leftPts);
    var rightRailCurve = new THREE.CatmullRomCurve3(rightPts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(leftRailCurve, steps, 0.14, 8, false), goldRailMat));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(rightRailCurve, steps, 0.14, 8, false), goldRailMat));

    if (isMainSpur) {
      var entryPt = curve.getPointAt(0.18);
      var archGroup = new THREE.Group();
      archGroup.position.set(entryPt.x, entryPt.y, entryPt.z);

      var pillarGeo = new THREE.CylinderGeometry(0.65, 0.82, 8.8, 14);
      var pL = new THREE.Mesh(pillarGeo, goldRailMat);
      pL.position.set(-5.0, 4.4, 0);
      var pR = new THREE.Mesh(pillarGeo, goldRailMat);
      pR.position.set(5.0, 4.4, 0);
      var topArch = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.68, 12, 28, Math.PI), goldRailMat);
      topArch.position.set(0, 8.8, 0);
      archGroup.add(pL, pR, topArch);

      var signTex = createGoldenSpurSignTexture();
      var signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(16.5, 4.0),
        new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide })
      );
      signMesh.position.set(0, 12.6, 0);
      archGroup.add(signMesh);

      g.add(archGroup);
    }

    scene.add(g);
  }

  function createGoldenSpurSignTexture() {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    var ctx = c.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 10;
    roundRect(ctx, 8, 8, 496, 112, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ ZLATÁ BRÁNA DO ZÁMKU 🏰', 256, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px sans-serif';
    ctx.fillText('Jeď rovně otevřenými dveřmi do pohádky!', 256, 90);

    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function buildCentralRondelRingVisuals() {
    if (typeof scene === 'undefined') return;
    var g = new THREE.Group();
    g.position.set(EXT_POS.x, EXT_POS.y, EXT_POS.z);

    var promRing = new THREE.Mesh(
      new THREE.RingGeometry(29.0, 38.8, 72),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xfde68a,
        emissiveIntensity: 0.22,
        roughness: 0.5,
        side: THREE.DoubleSide
      })
    );
    promRing.rotation.x = -Math.PI / 2;
    promRing.position.y = 0.06;
    g.add(promRing);

    var goldBorderRing = new THREE.Mesh(
      new THREE.TorusGeometry(38.8, 0.48, 10, 72),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.8
      })
    );
    goldBorderRing.rotation.x = Math.PI / 2;
    goldBorderRing.position.y = 0.25;
    g.add(goldBorderRing);

    var railMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.85
    });
    var innerRail = new THREE.Mesh(new THREE.TorusGeometry(R_EXT_RONDEL - 0.88, 0.13, 8, 96), railMat);
    innerRail.rotation.x = Math.PI / 2;
    innerRail.position.y = 0.24;
    var outerRail = new THREE.Mesh(new THREE.TorusGeometry(R_EXT_RONDEL + 0.88, 0.13, 8, 96), railMat);
    outerRail.rotation.x = Math.PI / 2;
    outerRail.position.y = 0.24;
    g.add(innerRail, outerRail);

    var sleeperGeo = new THREE.BoxGeometry(0.58, 0.18, 3.4);
    var sleeperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      roughness: 0.65
    });
    var slCount = 110;
    for (var i = 0; i < slCount; i++) {
      var a = (i / slCount) * TWO_PI;
      var sl = new THREE.Mesh(sleeperGeo, sleeperMat);
      sl.position.set(Math.sin(a) * R_EXT_RONDEL, 0.12, Math.cos(a) * R_EXT_RONDEL);
      sl.rotation.y = a;
      g.add(sl);
    }

    scene.add(g);
  }

  // ==========================================================================
  // 2. SKY-PIERCING NEUSCHWANSTEIN FAIRY-TALE CASTLE + 4 OPEN CASTLE DOORS
  //    + VIBRANT NIGHTTIME STAINED-GLASS WINDOWS & FAIRY GARLANDS
  // ==========================================================================
  function buildExteriorCastle() {
    if (typeof scene === 'undefined') return;
    var g = new THREE.Group();
    g.position.set(EXT_POS.x, EXT_POS.y, EXT_POS.z);

    // Warm Self-Luminous Fairy-Tale Materials so the Castle NEVER turns black at night!
    var limestoneMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfde68a,
      emissiveIntensity: 0.22,
      roughness: 0.42,
      metalness: 0.08
    });
    var roseWallMat = new THREE.MeshStandardMaterial({
      color: 0xfce7f3,
      emissive: 0xf472b6,
      emissiveIntensity: 0.24,
      roughness: 0.42,
      metalness: 0.08
    });
    var lavenderWallMat = new THREE.MeshStandardMaterial({
      color: 0xede9fe,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.25,
      roughness: 0.42,
      metalness: 0.08
    });
    var bastionPearlMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.22,
      roughness: 0.48,
      metalness: 0.1
    });
    var gatehouseRubyMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.32,
      roughness: 0.42,
      metalness: 0.12
    });
    castleState.exteriorWallNightMats.push(
      limestoneMat,
      roseWallMat,
      lavenderWallMat,
      bastionPearlMat,
      gatehouseRubyMat
    );

    var roofRoyalBlueMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.42,
      roughness: 0.26,
      metalness: 0.35
    });
    var roofCyanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.42,
      roughness: 0.26,
      metalness: 0.35
    });
    var roofMagentaMat = new THREE.MeshStandardMaterial({
      color: 0xdb2777,
      emissive: 0xec4899,
      emissiveIntensity: 0.45,
      roughness: 0.26,
      metalness: 0.35
    });
    var roofVioletMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.42,
      roughness: 0.26,
      metalness: 0.35
    });
    var goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.68,
      roughness: 0.18,
      metalness: 0.88
    });
    castleState.exteriorRoofNightMats.push(
      roofRoyalBlueMat,
      roofCyanMat,
      roofMagentaMat,
      roofVioletMat,
      goldMat
    );

    // Vibrant Stained-Glass Illuminated Window Materials (100% self-lit day & night!)
    var winGoldMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide });
    var winAmberMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
    var winRoseMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide });
    var winCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    var winVioletMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide });
    var winMintMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide });
    var stainedGlassPalette = [
      winGoldMat,
      winRoseMat,
      winCyanMat,
      winAmberMat,
      winVioletMat,
      winMintMat
    ];

    // Helper: creates a fairy-tale arched window with a golden frame on any wall/tower
    var sharedWinPaneGeo = new THREE.PlaneGeometry(1.65, 2.85);
    var sharedWinArchGeo = new THREE.CircleGeometry(0.825, 14, 0, Math.PI);
    var sharedWinFrameGeo = new THREE.BoxGeometry(2.05, 3.35, 0.18);
    function createIlluminatedArchedWindow(matIdx) {
      var wg = new THREE.Group();
      var wMat = stainedGlassPalette[Math.abs(matIdx) % stainedGlassPalette.length];
      var frame = new THREE.Mesh(sharedWinFrameGeo, goldMat);
      frame.position.z = -0.04;
      var pane = new THREE.Mesh(sharedWinPaneGeo, wMat);
      pane.position.z = 0.08;
      var arch = new THREE.Mesh(sharedWinArchGeo, wMat);
      arch.position.set(0, 1.42, 0.08);
      wg.add(frame, pane, arch);
      return wg;
    }

    // Helper: creates a glowing stained-glass Rose Window (Rozeta)
    function createStainedGlassRoseWindow(radius) {
      var rg = new THREE.Group();
      var outerRim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.35, 10, 28), goldMat);
      rg.add(outerRim);
      var coreDisc = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.94, 28), winAmberMat);
      coreDisc.position.z = 0.04;
      rg.add(coreDisc);
      for (var p = 0; p < 8; p++) {
        var pa = (p / 8) * TWO_PI;
        var petalMat = stainedGlassPalette[p % stainedGlassPalette.length];
        var petal = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.26, 12), petalMat);
        petal.position.set(Math.cos(pa) * radius * 0.56, Math.sin(pa) * radius * 0.56, 0.10);
        rg.add(petal);
      }
      var centerStar = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.28, 16), winCyanMat);
      centerStar.position.z = 0.14;
      rg.add(centerStar);
      return rg;
    }

    // ------------------------------------------------------------------------
    // A) ROYAL ISLAND PLINTH & INNER COLONNADE BASTION (R = 19.5m)
    // ------------------------------------------------------------------------
    var islandBase = new THREE.Mesh(
      new THREE.CylinderGeometry(28.5, 30.5, 2.4, 48),
      bastionPearlMat
    );
    islandBase.position.y = 1.0;
    g.add(islandBase);

    var upperBastion = new THREE.Mesh(
      new THREE.CylinderGeometry(18.2, 19.5, 9.6, 48),
      bastionPearlMat
    );
    upperBastion.position.y = 6.2;
    g.add(upperBastion);

    var batRoofRim = new THREE.Mesh(new THREE.TorusGeometry(18.8, 0.62, 12, 56), goldMat);
    batRoofRim.rotation.x = Math.PI / 2;
    batRoofRim.position.y = 11.2;
    g.add(batRoofRim);

    // ------------------------------------------------------------------------
    // B) 4 TRACK-LOCKED GRAND ROYAL GATEHOUSES WITH GIANT ANIMATED DOORS!
    //    - Each Gatehouse is positioned at the EXACT midpoint (`portalWorldPos`)
    //      and exact tangent angle (`gateYaw`) of its incoming double-track
    //      (`J_SOUTH->J_CENTER`, `J_EAST->J_CENTER`, `J_NORTH->J_CENTER`, `J_WEST->J_CENTER`)!
    //    - Guarantees that BOTH tracks of every double-track pass dead-center
    //      through a single wide 15.2m Golden Archway and Giant Double Doors,
    //      and the train NEVER sees two gates side-by-side or hits a wall between gates!
    // ------------------------------------------------------------------------
    var woodDoorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x92400e,
      emissiveIntensity: 0.50,
      roughness: 0.42,
      metalness: 0.22
    });
    var signTex = createCastleBannerTexture();
    var signBannerMat = new THREE.MeshBasicMaterial({
      map: signTex,
      transparent: true,
      side: THREE.DoubleSide
    });

    castleState.exteriorDoorHinges = [];

    var approaches = (castleState.gateApproaches && castleState.gateApproaches.length === 4)
      ? castleState.gateApproaches
      : [
          { edgeId: 'J_SOUTH->J_CENTER', gateIndex: 0, portalWorldPos: new THREE.Vector3(2.2, EXT_POS.y, EXT_POS.z + 26.2), gateYaw: 0 },
          { edgeId: 'J_EAST->J_CENTER', gateIndex: 1, portalWorldPos: new THREE.Vector3(EXT_POS.x + 26.2, EXT_POS.y, EXT_POS.z + 2.2), gateYaw: Math.PI * 0.5 },
          { edgeId: 'J_NORTH->J_CENTER', gateIndex: 2, portalWorldPos: new THREE.Vector3(5.0, EXT_POS.y, EXT_POS.z - 26.2), gateYaw: Math.PI },
          { edgeId: 'J_WEST->J_CENTER', gateIndex: 3, portalWorldPos: new THREE.Vector3(EXT_POS.x - 26.2, EXT_POS.y, EXT_POS.z + 2.2), gateYaw: Math.PI * 1.5 }
        ];

    for (var gi = 0; gi < approaches.length; gi++) {
      var app = approaches[gi];
      var gateGroup = new THREE.Group();
      // Place gateGroup origin directly at the midpoint between the two tracks at the portal threshold!
      gateGroup.position.set(
        app.portalWorldPos.x - EXT_POS.x,
        0,
        app.portalWorldPos.z - EXT_POS.z
      );
      gateGroup.rotation.y = app.gateYaw;

      var archRadius = 7.5; // 15.0m wide clear doorway encompassing both tracks (-2.2m and +2.2m) with generous margin!
      var gateZ = -3.8;     // Gatehouse body extends inward behind the portal threshold (z = 0)
      var portalZ = 0.0;    // Portal arch & Giant Doors sit right at z = 0
      var bodyWidth = 20.4;
      var bodyHeight = 15.2;

      // Red Bavarian Torbau Gatehouse Wing
      var ghBody = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, 8.2), gatehouseRubyMat);
      ghBody.position.set(0, bodyHeight * 0.5, gateZ);
      gateGroup.add(ghBody);

      var ghRoof = new THREE.Mesh(
        new THREE.ConeGeometry(bodyWidth * 0.68, 8.2, 4),
        roofRoyalBlueMat
      );
      ghRoof.rotation.y = Math.PI / 4;
      ghRoof.position.set(0, bodyHeight + 3.9, gateZ);
      gateGroup.add(ghRoof);

      // Stained-Glass Rose Window above each Gatehouse Arch
      var ghRose = createStainedGlassRoseWindow(2.35);
      ghRose.position.set(0, bodyHeight - 2.3, portalZ + 0.18);
      gateGroup.add(ghRose);

      // Twin Flanking Gatehouse Turrets with Glowing Windows & Cones
      var turretOffset = bodyWidth * 0.5 + 1.0;
      [-turretOffset, turretOffset].forEach(function (tx, tIdx) {
        var gt = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.55, 22.0, 16), limestoneMat);
        gt.position.set(tx, 11.0, gateZ + 1.2);
        var gr = new THREE.Mesh(new THREE.ConeGeometry(3.1, 8.8, 16), roofMagentaMat);
        gr.position.set(tx, 26.2, gateZ + 1.2);
        var gs = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), goldMat);
        gs.position.set(tx, 31.2, gateZ + 1.2);
        gateGroup.add(gt, gr, gs);
        castleState.exteriorStars.push(gs);

        [9.0, 15.8].forEach(function (wy, wIdx) {
          var tw = createIlluminatedArchedWindow(gi + tIdx + wIdx);
          tw.position.set(tx, wy, gateZ + 3.75);
          gateGroup.add(tw);
        });
      });

      // Wide Golden Railway Portal Archway Frame encompassing both tracks of the double-track
      var pillarHeight = 5.8;
      var archTorus = new THREE.Mesh(new THREE.TorusGeometry(archRadius, 0.86, 12, 32, Math.PI), goldMat);
      archTorus.position.set(0, pillarHeight, portalZ);
      var leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.96, pillarHeight, 12), goldMat);
      leftPillar.position.set(-archRadius, pillarHeight * 0.5, portalZ);
      var rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.96, pillarHeight, 12), goldMat);
      rightPillar.position.set(archRadius, pillarHeight * 0.5, portalZ);
      gateGroup.add(archTorus, leftPillar, rightPillar);

      // Deep Illuminated Interior Vestibule Arch & Shimmering Magical Portal Curtain behind the Giant Doors
      var portalCurtainMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide
      });
      castleState.portalCurtainMats.push(portalCurtainMat);

      var portalArchBack = new THREE.Mesh(new THREE.CircleGeometry(archRadius - 0.25, 28, 0, Math.PI), portalCurtainMat);
      portalArchBack.position.set(0, pillarHeight, portalZ - 0.45);
      var portalRectBack = new THREE.Mesh(new THREE.PlaneGeometry((archRadius - 0.25) * 2, pillarHeight), portalCurtainMat);
      portalRectBack.position.set(0, pillarHeight * 0.5, portalZ - 0.45);
      gateGroup.add(portalArchBack, portalRectBack);

      // TWO GIANT ANIMATED WOODEN & GOLD-STUDDED CASTLE DOORS!
      // Start CLOSED (rotation.y = 0) and slowly swing open outward when the train approaches this Gatehouse!
      var leafWidth = archRadius - 0.15;
      var leafHeight = 9.4;
      [-1, 1].forEach(function (sideSign) {
        var doorHinge = new THREE.Group();
        doorHinge.position.set(sideSign * (archRadius - 0.15), 0.2, portalZ + 0.24);
        doorHinge.rotation.y = 0; // Starts closed!

        var doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, leafHeight, 0.50), woodDoorMat);
        doorLeaf.position.set(-sideSign * (leafWidth * 0.5), leafHeight * 0.5, 0);
        doorHinge.add(doorLeaf);

        // Golden upper royal crest arch on each Giant Door leaf
        var doorTopTrim = new THREE.Mesh(new THREE.BoxGeometry(leafWidth * 0.94, 0.58, 0.60), goldMat);
        doorTopTrim.position.set(-sideSign * (leafWidth * 0.5), leafHeight - 0.35, 0);
        doorHinge.add(doorTopTrim);

        // 3 Golden horizontal hinge straps & royal studs on the Giant Castle Door
        [1.6, 4.5, 7.4].forEach(function (hy) {
          var strap = new THREE.Mesh(new THREE.BoxGeometry(leafWidth * 0.92, 0.44, 0.60), goldMat);
          strap.position.set(-sideSign * (leafWidth * 0.48), hy, 0);
          doorHinge.add(strap);
        });

        // Giant Golden Lion Knocker Ring near the center seam of the doors
        var knockRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.17, 10, 18), goldMat);
        knockRing.position.set(-sideSign * (leafWidth * 0.78), 4.1, 0.34);
        doorHinge.add(knockRing);

        gateGroup.add(doorHinge);
        castleState.exteriorDoorHinges.push({
          hinge: doorHinge,
          sideSign: sideSign,
          gateIndex: gi,
          edgeId: app.edgeId,
          portalWorldPos: app.portalWorldPos
        });
      });

      // Illuminated Welcome Banner above each Grand Gatehouse
      var signMesh = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 4.1), signBannerMat);
      signMesh.position.set(0, bodyHeight + 1.2, portalZ + 0.5);
      gateGroup.add(signMesh);

      g.add(gateGroup);
    }

    // ------------------------------------------------------------------------
    // C) MULTI-TIERED NEUSCHWANSTEIN PALAS, KEMENATE & MINSTRELS' HALL (Y = 11m .. 88m)
    //    With Illuminated Arched Windows & Stained-Glass Rose Windows on ALL 4 Sides!
    // ------------------------------------------------------------------------
    // Tier 1: Lower Grand Palas Hall (26 x 24 x 26)
    var lowerPalas = new THREE.Mesh(new THREE.BoxGeometry(26, 24, 26), limestoneMat);
    lowerPalas.position.set(0, 22, 0);
    g.add(lowerPalas);

    var lowerCornice = new THREE.Mesh(new THREE.BoxGeometry(27.4, 1.2, 27.4), goldMat);
    lowerCornice.position.set(0, 34.0, 0);
    g.add(lowerCornice);

    // Tier 2: Pastel Rose Royal Kemenate Wing (20 x 22 x 20)
    var midPalas = new THREE.Mesh(new THREE.BoxGeometry(20, 22, 20), roseWallMat);
    midPalas.position.set(0, 45, 0);
    g.add(midPalas);

    var midCornice = new THREE.Mesh(new THREE.BoxGeometry(21.4, 1.1, 21.4), goldMat);
    midCornice.position.set(0, 56.0, 0);
    g.add(midCornice);

    var midRoof = new THREE.Mesh(new THREE.ConeGeometry(16.2, 13, 4), roofRoyalBlueMat);
    midRoof.rotation.y = Math.PI / 4;
    midRoof.position.set(0, 62.5, 0);
    g.add(midRoof);

    // Tier 3: High Lavender-Ivory Minstrels' Hall (Sängersaal) (14.5 x 22 x 14.5)
    var upperPalas = new THREE.Mesh(new THREE.BoxGeometry(14.5, 22, 14.5), lavenderWallMat);
    upperPalas.position.set(0, 67, 0);
    g.add(upperPalas);

    var upperCornice = new THREE.Mesh(new THREE.BoxGeometry(15.8, 1.0, 15.8), goldMat);
    upperCornice.position.set(0, 78.0, 0);
    g.add(upperCornice);

    var upperRoof = new THREE.Mesh(new THREE.ConeGeometry(12.2, 15, 4), roofCyanMat);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.position.set(0, 85.5, 0);
    g.add(upperRoof);

    // Place Illuminated Arched Windows on ALL 4 FACES (N, S, E, W) of Tier 1, Tier 2, and Tier 3!
    var tierSpecs = [
      { yList: [16, 23, 30], halfW: 13.15, xOffsets: [-8.4, -4.2, 0, 4.2, 8.4], seed: 0 },
      { yList: [39, 46, 52.5], halfW: 10.15, xOffsets: [-6.4, -2.1, 2.1, 6.4], seed: 2 },
      { yList: [61, 68, 74.5], halfW: 7.40, xOffsets: [-3.8, 0, 3.8], seed: 4 }
    ];

    for (var ts = 0; ts < tierSpecs.length; ts++) {
      var spec = tierSpecs[ts];
      for (var yi = 0; yi < spec.yList.length; yi++) {
        var wy = spec.yList[yi];
        for (var xi = 0; xi < spec.xOffsets.length; xi++) {
          var wOff = spec.xOffsets[xi];
          var cIdx = spec.seed + yi + xi;

          // South Face (+Z)
          var wS = createIlluminatedArchedWindow(cIdx);
          wS.position.set(wOff, wy, spec.halfW);
          // North Face (-Z)
          var wN = createIlluminatedArchedWindow(cIdx + 1);
          wN.position.set(wOff, wy, -spec.halfW);
          wN.rotation.y = Math.PI;
          // East Face (+X)
          var wE = createIlluminatedArchedWindow(cIdx + 2);
          wE.position.set(spec.halfW, wy, wOff);
          wE.rotation.y = Math.PI / 2;
          // West Face (-X)
          var wW = createIlluminatedArchedWindow(cIdx + 3);
          wW.position.set(-spec.halfW, wy, wOff);
          wW.rotation.y = -Math.PI / 2;

          g.add(wS, wN, wE, wW);
        }
      }
    }

    // 4 Giant Illuminated Rose Windows on the 4 Upper Gables (Y = 55m)
    for (var rw = 0; rw < 4; rw++) {
      var rAng = (rw / 4) * TWO_PI;
      var rose = createStainedGlassRoseWindow(2.5);
      rose.position.set(Math.sin(rAng) * 10.35, 51.5, Math.cos(rAng) * 10.35);
      rose.rotation.y = rAng;
      g.add(rose);
    }

    // ------------------------------------------------------------------------
    // D) SOARING NEUSCHWANSTEIN SKY-SPIRES REACHING Y = 149 METERS INTO THE SKY!
    //    With Rings of Illuminated Windows on EVERY Cylindrical Tower!
    // ------------------------------------------------------------------------
    var towerConfigs = [
      // 4 Lower Corner Fairy-Tale Turrets (Reaching Y = 72m)
      { x: -14.8, z: 14.8, r: 3.2, y0: 10, h: 46, roofH: 16, mat: limestoneMat, rMat: roofMagentaMat },
      { x: 14.8, z: 14.8, r: 3.2, y0: 10, h: 46, roofH: 16, mat: limestoneMat, rMat: roofMagentaMat },
      { x: -14.8, z: -14.8, r: 3.2, y0: 10, h: 46, roofH: 16, mat: roseWallMat, rMat: roofRoyalBlueMat },
      { x: 14.8, z: -14.8, r: 3.2, y0: 10, h: 46, roofH: 16, mat: roseWallMat, rMat: roofRoyalBlueMat },
      // 2 High Bavarian Watchtowers (Reaching Y = 112m)
      { x: -9.8, z: 0.0, r: 3.5, y0: 40, h: 50, roofH: 20, mat: limestoneMat, rMat: roofCyanMat },
      { x: 9.8, z: 0.0, r: 3.5, y0: 40, h: 50, roofH: 20, mat: limestoneMat, rMat: roofVioletMat },
      // Central Sky-Piercing Neuschwanstein Grand Spire (Reaching Y = 149m!)
      { x: 0, z: 0, r: 4.4, y0: 70, h: 50, roofH: 26, mat: limestoneMat, rMat: roofRoyalBlueMat }
    ];

    for (var ti = 0; ti < towerConfigs.length; ti++) {
      var tc = towerConfigs[ti];
      var cyl = new THREE.Mesh(new THREE.CylinderGeometry(tc.r * 0.90, tc.r, tc.h, 24), tc.mat);
      cyl.position.set(tc.x, tc.y0 + tc.h * 0.5, tc.z);
      g.add(cyl);

      // Decorative Golden Belts & Observation Gallery Ring
      var midBelt = new THREE.Mesh(new THREE.TorusGeometry(tc.r * 0.97, 0.28, 8, 24), goldMat);
      midBelt.rotation.x = Math.PI / 2;
      midBelt.position.set(tc.x, tc.y0 + tc.h * 0.5, tc.z);
      var galRing = new THREE.Mesh(new THREE.TorusGeometry(tc.r * 1.04, 0.42, 10, 24), goldMat);
      galRing.rotation.x = Math.PI / 2;
      galRing.position.set(tc.x, tc.y0 + tc.h - 1.0, tc.z);
      g.add(midBelt, galRing);

      // Rings of Glowing Stained-Glass Windows on the outer surface of EVERY Cylindrical Tower!
      for (var twY = tc.y0 + 6; twY <= tc.y0 + tc.h - 5; twY += 8.0) {
        var curR = tc.r * (1.0 - ((twY - tc.y0) / tc.h) * 0.10) + 0.12;
        for (var wDir = 0; wDir < 4; wDir++) {
          var wa = (wDir / 4) * TWO_PI + (ti % 2) * (Math.PI / 4);
          var tWin = createIlluminatedArchedWindow(ti + wDir + Math.floor(twY));
          tWin.scale.set(0.78, 0.82, 0.78);
          tWin.position.set(tc.x + Math.sin(wa) * curR, twY, tc.z + Math.cos(wa) * curR);
          tWin.rotation.y = wa;
          g.add(tWin);
        }
      }

      // Steep conical Neuschwanstein spire roof
      var cone = new THREE.Mesh(new THREE.ConeGeometry(tc.r * 1.32, tc.roofH, 24), tc.rMat);
      cone.position.set(tc.x, tc.y0 + tc.h + tc.roofH * 0.5, tc.z);
      g.add(cone);

      // Spinning Golden Crown Star at the pinnacle
      var starSize = ti === towerConfigs.length - 1 ? 2.5 : 1.25;
      var star = new THREE.Mesh(new THREE.OctahedronGeometry(starSize, 0), goldMat);
      star.position.set(tc.x, tc.y0 + tc.h + tc.roofH + starSize + 0.5, tc.z);
      g.add(star);
      castleState.exteriorStars.push(star);
    }

    // ------------------------------------------------------------------------
    // E) GLOWING FAIRY-LIGHT GARLANDS DRAPED BETWEEN THE CASTLE TOWERS
    // ------------------------------------------------------------------------
    var garlandPairs = [
      { p1: new THREE.Vector3(-14.8, 52, 14.8), p2: new THREE.Vector3(14.8, 52, 14.8) },
      { p1: new THREE.Vector3(-14.8, 52, -14.8), p2: new THREE.Vector3(14.8, 52, -14.8) },
      { p1: new THREE.Vector3(-14.8, 52, 14.8), p2: new THREE.Vector3(-14.8, 52, -14.8) },
      { p1: new THREE.Vector3(14.8, 52, 14.8), p2: new THREE.Vector3(14.8, 52, -14.8) },
      { p1: new THREE.Vector3(-9.8, 86, 0), p2: new THREE.Vector3(0, 114, 0) },
      { p1: new THREE.Vector3(9.8, 86, 0), p2: new THREE.Vector3(0, 114, 0) }
    ];
    var bulbGeo = new THREE.SphereGeometry(0.58, 10, 10);
    garlandPairs.forEach(function (gp, gpIdx) {
      for (var bi2 = 1; bi2 < 10; bi2++) {
        var u = bi2 / 10;
        var pos = gp.p1.clone().lerp(gp.p2, u);
        pos.y -= Math.sin(u * Math.PI) * 3.6;
        var bulbMat = stainedGlassPalette[(gpIdx + bi2) % stainedGlassPalette.length];
        var bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.copy(pos);
        g.add(bulb);
      }
    });

    // Dedicated Nighttime Castle PointLights
    var nightLightLow = new THREE.PointLight(0xfef08a, 0.8, 180, 1.1);
    nightLightLow.position.set(0, 32, 22);
    var nightLightHigh = new THREE.PointLight(0xf472b6, 0.8, 220, 1.1);
    nightLightHigh.position.set(0, 96, 0);
    g.add(nightLightLow, nightLightHigh);
    castleState.exteriorNightLights.push(nightLightLow, nightLightHigh);

    // ------------------------------------------------------------------------
    // F) DAYTIME SKY-PIERCING FAIRY-TALE CLOUD HALOS (Y = 68m, 98m, 126m)
    // ------------------------------------------------------------------------
    var cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.35,
      roughness: 0.85,
      transparent: true,
      opacity: 0.88
    });
    var cloudLevels = [
      { y: 68, r: 22, count: 6, speed: 0.14 },
      { y: 98, r: 16, count: 5, speed: -0.18 },
      { y: 126, r: 11, count: 4, speed: 0.22 }
    ];
    for (var cl = 0; cl < cloudLevels.length; cl++) {
      var lvl = cloudLevels[cl];
      var ringGroup = new THREE.Group();
      ringGroup.position.y = lvl.y;
      for (var ci = 0; ci < lvl.count; ci++) {
        var ca = (ci / lvl.count) * TWO_PI;
        var puffCluster = new THREE.Group();
        puffCluster.position.set(Math.cos(ca) * lvl.r, 0, Math.sin(ca) * lvl.r);
        var pMain = new THREE.Mesh(new THREE.SphereGeometry(3.6, 12, 12), cloudMat);
        pMain.scale.set(1.5, 0.7, 1.1);
        var pSide1 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 10), cloudMat);
        pSide1.position.set(-2.8, -0.4, 0.6);
        var pSide2 = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 10), cloudMat);
        pSide2.position.set(2.8, -0.2, -0.5);
        puffCluster.add(pMain, pSide1, pSide2);
        puffCluster.rotation.y = -ca;
        ringGroup.add(puffCluster);
      }
      g.add(ringGroup);
      castleState.skyCloudRings.push({ group: ringGroup, speed: lvl.speed });
    }

    // ------------------------------------------------------------------------
    // G) CONCENTRIC ATLANTIS WATER MOAT WITH SPOUTING WHALES (R = 39m .. 67m)
    // ------------------------------------------------------------------------
    buildAtlantisWaterMoatAndWhales(g);

    // ------------------------------------------------------------------------
    // H) 3 GREAT WHITE PYRAMIDS OF GIZA EVENLY SPACED (120 DEG) ON MOAT RIM
    // ------------------------------------------------------------------------
    buildThreeGreatWhitePyramidsOfGiza(g);

    scene.add(g);
    castleState.exteriorGroup = g;
  }

  function buildAtlantisWaterMoatAndWhales(rootGroup) {
    var moatWaterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42,
      roughness: 0.18,
      metalness: 0.25,
      side: THREE.DoubleSide
    });
    var moatWater = new THREE.Mesh(new THREE.RingGeometry(R_MOAT_INNER, R_MOAT_OUTER, 84), moatWaterMat);
    moatWater.rotation.x = -Math.PI / 2;
    moatWater.position.y = -0.35;
    rootGroup.add(moatWater);

    var atlantisGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.85
    });
    [R_MOAT_INNER, 48.0, 58.0, R_MOAT_OUTER].forEach(function (rRing, idx) {
      var torus = new THREE.Mesh(
        new THREE.TorusGeometry(rRing, idx === 0 || idx === 3 ? 0.65 : 0.35, 10, 72),
        atlantisGoldMat
      );
      torus.rotation.x = Math.PI / 2;
      torus.position.y = idx === 0 || idx === 3 ? 0.05 : -0.25;
      rootGroup.add(torus);
    });

    var colMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.3,
      roughness: 0.4
    });
    var crystalMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    for (var c = 0; c < 16; c++) {
      var ca = (c / 16) * TWO_PI + 0.18;
      if (Math.abs(Math.sin(ca * 2)) < 0.28) continue;
      var cx = Math.sin(ca) * (R_MOAT_OUTER - 1.2);
      var cz = Math.cos(ca) * (R_MOAT_OUTER - 1.2);

      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 4.5, 12), colMat);
      col.position.set(cx, 1.9, cz);
      var crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), crystalMat);
      crys.position.set(cx, 4.8, cz);
      rootGroup.add(col, crys);
    }

    var whaleColors = [0x0284c7, 0x2563eb, 0x0d9488, 0x4f46e5];
    for (var w = 0; w < 4; w++) {
      var whaleObj = createAtlantisWhaleModel(whaleColors[w % whaleColors.length], w);
      rootGroup.add(whaleObj.group);
      castleState.atlantisWhales.push(whaleObj);
    }
  }

  function createAtlantisWhaleModel(bodyColorHex, index) {
    var wg = new THREE.Group();
    var bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColorHex,
      emissive: bodyColorHex,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.1
    });
    var bellyMat = new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 0.2,
      roughness: 0.45
    });
    var eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    var spoutMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    var body = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 14), bodyMat);
    body.scale.set(1.15, 0.85, 2.2);
    wg.add(body);

    var belly = new THREE.Mesh(new THREE.SphereGeometry(2.45, 16, 12), bellyMat);
    belly.scale.set(1.05, 0.65, 2.05);
    belly.position.set(0, -0.45, 0.15);
    wg.add(belly);

    [-1.85, 1.85].forEach(function (ex) {
      var eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), eyeWhiteMat);
      eyeW.position.set(ex, 0.45, 3.2);
      var pup = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), pupilMat);
      pup.position.set(ex * 1.08, 0.48, 3.55);
      wg.add(eyeW, pup);
    });

    [-2.8, 2.8].forEach(function (fx) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 1.4), bodyMat);
      fin.position.set(fx, -0.3, 0.8);
      fin.rotation.z = fx < 0 ? 0.35 : -0.35;
      fin.rotation.y = fx < 0 ? 0.25 : -0.25;
      wg.add(fin);
    });

    var dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.8, 10), bodyMat);
    dorsal.position.set(0, 2.1, -1.6);
    dorsal.rotation.x = -0.35;
    wg.add(dorsal);

    var tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.1, -4.8);
    var tailStock = new THREE.Mesh(new THREE.ConeGeometry(1.35, 3.8, 12), bodyMat);
    tailStock.rotation.x = -Math.PI / 2;
    tailStock.position.z = -1.4;
    tailPivot.add(tailStock);

    var flukeL = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 1.3), bodyMat);
    flukeL.position.set(-1.1, 0, -3.2);
    flukeL.rotation.y = 0.35;
    var flukeR = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 1.3), bodyMat);
    flukeR.position.set(1.1, 0, -3.2);
    flukeR.rotation.y = -0.35;
    tailPivot.add(flukeL, flukeR);
    wg.add(tailPivot);

    var spoutDrops = [];
    var dropGeo = new THREE.SphereGeometry(0.36, 8, 8);
    for (var d = 0; d < 10; d++) {
      var dm = new THREE.Mesh(dropGeo, spoutMat);
      wg.add(dm);
      spoutDrops.push({
        mesh: dm,
        progress: d / 10,
        angle: (d / 10) * TWO_PI
      });
    }

    return {
      group: wg,
      tailPivot: tailPivot,
      spoutDrops: spoutDrops,
      angle: (index / 4) * TWO_PI,
      radius: 51.0 + (index % 2) * 5.0,
      speed: 0.18 + (index % 2) * 0.04,
      phase: index * 1.57
    };
  }

  function buildThreeGreatWhitePyramidsOfGiza(rootGroup) {
    var pyramidAngles = [
      (70 * Math.PI) / 180,
      (190 * Math.PI) / 180,
      (310 * Math.PI) / 180
    ];

    var whiteLimestoneMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xfef3c7,
      emissiveIntensity: 0.25,
      roughness: 0.5,
      metalness: 0.08
    });
    var stepBandMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0xcbd5e1,
      emissiveIntensity: 0.2,
      roughness: 0.6
    });
    var capstoneGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.75,
      roughness: 0.15,
      metalness: 0.92
    });
    castleState.exteriorWallNightMats.push(whiteLimestoneMat, stepBandMat);

    for (var i = 0; i < pyramidAngles.length; i++) {
      var a = pyramidAngles[i];
      var px = Math.sin(a) * R_PYRAMIDS;
      var pz = Math.cos(a) * R_PYRAMIDS;

      var pg = new THREE.Group();
      pg.position.set(px, -0.4, pz);
      pg.rotation.y = a + Math.PI;

      var plinth = new THREE.Mesh(new THREE.BoxGeometry(36, 1.4, 36), stepBandMat);
      plinth.position.y = 0.7;
      pg.add(plinth);

      var pyrRadius = 24.5;
      var pyrHeight = 29.0;
      var pyrBody = new THREE.Mesh(new THREE.ConeGeometry(pyrRadius, pyrHeight, 4), whiteLimestoneMat);
      pyrBody.rotation.y = Math.PI / 4;
      pyrBody.position.y = 1.4 + pyrHeight * 0.5;
      pyrBody.castShadow = true;
      pyrBody.receiveShadow = true;
      pg.add(pyrBody);

      for (var tier = 1; tier <= 5; tier++) {
        var frac = tier / 6.5;
        var tierW = (1.0 - frac) * 34.0;
        var tierY = 1.4 + frac * pyrHeight;
        var band = new THREE.Mesh(new THREE.BoxGeometry(tierW, 0.75, tierW), stepBandMat);
        band.position.y = tierY;
        pg.add(band);
      }

      var capRadius = 5.2;
      var capHeight = 6.4;
      var capstone = new THREE.Mesh(new THREE.ConeGeometry(capRadius, capHeight, 4), capstoneGoldMat);
      capstone.rotation.y = Math.PI / 4;
      capstone.position.y = 1.4 + pyrHeight - capHeight * 0.45;
      pg.add(capstone);

      var sunCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), capstoneGoldMat);
      sunCrystal.position.y = 1.4 + pyrHeight + 3.2;
      pg.add(sunCrystal);
      castleState.pyramidCapstones.push(sunCrystal);

      var pylonL = new THREE.Mesh(new THREE.BoxGeometry(4.2, 6.5, 3.2), whiteLimestoneMat);
      pylonL.position.set(-3.8, 3.8, 16.5);
      var pylonR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 6.5, 3.2), whiteLimestoneMat);
      pylonR.position.set(3.8, 3.8, 16.5);
      var lintel = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.4, 3.6), capstoneGoldMat);
      lintel.position.set(0, 7.2, 16.5);
      pg.add(pylonL, pylonR, lintel);

      [-7.5, 7.5].forEach(function (ox) {
        var obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.85, 9.5, 4), whiteLimestoneMat);
        obelisk.rotation.y = Math.PI / 4;
        obelisk.position.set(ox, 5.2, 18.8);
        var obTip = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.6, 4), capstoneGoldMat);
        obTip.rotation.y = Math.PI / 4;
        obTip.position.set(ox, 10.6, 18.8);
        pg.add(obelisk, obTip);
      });

      rootGroup.add(pg);
    }
  }

  function createCastleBannerTexture() {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    var ctx = c.getContext('2d');

    ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 8;
    roundRect(ctx, 8, 8, 496, 112, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 31px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰 VJEZD DO ZÁMKU HER ✨', 256, 48);

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 21px sans-serif';
    ctx.fillText('Otevřená brána • Vjeď dovnitř k minihrám!', 256, 90);

    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // ==========================================================================
  // 3. INTERIOR MAGICAL RONDEL AT (0, -85, -1800), R_TRACK = 74m, R_GATE = 82m
  // ==========================================================================
  function buildInteriorRondel() {
    if (typeof scene === 'undefined') return;
    var root = new THREE.Group();
    root.position.set(INT_CENTER.x, INT_CENTER.y, INT_CENTER.z);
    root.visible = false;

    // 1. Grand Self-Luminous Royal Marble Floor (Radius = 104 m)
    var floorGeo = new THREE.CylinderGeometry(R_DOME, R_DOME, 1.2, 64);
    var floorMat = new THREE.MeshStandardMaterial({
      color: 0x312e81,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.85,
      roughness: 0.4,
      metalness: 0.15
    });
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.6;
    root.add(floorMesh);

    var innerRing = new THREE.Mesh(
      new THREE.RingGeometry(24, 25.4, 64),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide })
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.06;
    root.add(innerRing);

    var outerRing = new THREE.Mesh(
      new THREE.RingGeometry(68, 69.4, 64),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide })
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.06;
    root.add(outerRing);

    // 2. Starry Magical Palace Dome Ceiling
    var domeGeo = new THREE.SphereGeometry(R_DOME, 48, 24, 0, TWO_PI, 0, Math.PI * 0.5);
    var domeMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b4b,
      side: THREE.BackSide
    });
    var domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 0;
    root.add(domeMesh);

    var ribMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    var ribMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R_DOME - 0.6, 16, 12, 0, TWO_PI, 0, Math.PI * 0.48),
      ribMat
    );
    root.add(ribMesh);

    // 3. Circular Track at R_TRACK = 74 m
    buildCircularRondelTrack(root);

    // 4. Centerpiece: Magical Glowing Crystal Tree + Singing Fountains + Enchanted Inner Square Plaza
    buildMagicalCrystalTreeAndFountains(root);
    buildMagicalInnerSquarePlaza(root);

    // 5. Perimeter Gates (Entry, Exit + 6 Minigame Gates at R_GATE = 82 m)
    for (var i = 0; i < CASTLE_STOPS.length; i++) {
      var gateObj = buildRondelGate(CASTLE_STOPS[i], i);
      root.add(gateObj.group);
      castleState.gateObjects.push(gateObj);
    }

    scene.add(root);
    castleState.interiorGroup = root;
  }

  // Magical Inner Square ("vnitřní náměstí") between the Crystal Tree (R=18m) and Circular Track (R=74m):
  // - Starlight radial mosaic pathways connecting the central tree to all 8 gates
  // - 8 Glowing Crystal Obelisk Lanterns around R = 36m with floating starlight orbs
  // - 55 Floating Starlight Fireflies drifting around the inner square and tree
  function buildMagicalInnerSquarePlaza(root) {
    var plazaGroup = new THREE.Group();

    // Concentric golden & amethyst star-rings on the inner square floor
    var ringRadii = [24, 36, 50, 64];
    for (var rIdx = 0; rIdx < ringRadii.length; rIdx++) {
      var rr = ringRadii[rIdx];
      var ringMat = new THREE.MeshBasicMaterial({
        color: rIdx % 2 === 0 ? 0xfacc15 : 0x38bdf8,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide
      });
      var ringMesh = new THREE.Mesh(new THREE.RingGeometry(rr - 0.45, rr + 0.45, 64), ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.09;
      plazaGroup.add(ringMesh);
    }

    // 8 Radial Starlight Pathways from the central Crystal Tree fountain to each Gate
    for (var s = 0; s < CASTLE_STOPS.length; s++) {
      var stop = CASTLE_STOPS[s];
      var rayMat = new THREE.MeshBasicMaterial({
        color: stop.colorHex,
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide
      });
      var rayGeo = new THREE.PlaneGeometry(2.6, 52);
      var rayMesh = new THREE.Mesh(rayGeo, rayMat);
      var midR = 45;
      rayMesh.position.set(Math.sin(stop.angle) * midR, 0.08, Math.cos(stop.angle) * midR);
      rayMesh.rotation.x = -Math.PI / 2;
      rayMesh.rotation.z = -stop.angle;
      plazaGroup.add(rayMesh);
    }

    // 8 Enchanted Crystal Obelisk Lanterns on the inner square (R = 36m)
    var pillarGeo = new THREE.CylinderGeometry(0.65, 1.05, 6.5, 8);
    var pillarMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.45,
      roughness: 0.3
    });
    var orbGeo = new THREE.OctahedronGeometry(1.25, 1);

    for (var l = 0; l < 8; l++) {
      var lAngle = (l / 8) * TWO_PI + Math.PI * 0.125;
      var lx = Math.sin(lAngle) * 36;
      var lz = Math.cos(lAngle) * 36;

      var lanternBase = new THREE.Mesh(pillarGeo, pillarMat);
      lanternBase.position.set(lx, 3.25, lz);
      plazaGroup.add(lanternBase);

      var orbCol = l % 3 === 0 ? 0xfef08a : l % 3 === 1 ? 0x38bdf8 : 0xf472b6;
      var orbMat = new THREE.MeshBasicMaterial({ color: orbCol });
      var orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(lx, 7.8, lz);
      orbMesh.userData = {
        baseX: lx,
        baseY: 7.8,
        baseZ: lz,
        phase: l * 0.85
      };
      plazaGroup.add(orbMesh);
      castleState.interiorLanternOrbs.push(orbMesh);
    }

    // 55 Floating Starlight Fireflies drifting across the inner square & Crystal Tree
    var flyGeo = new THREE.SphereGeometry(0.42, 8, 8);
    for (var ff = 0; ff < 55; ff++) {
      var ffCol = ff % 4 === 0 ? 0xfef08a : ff % 4 === 1 ? 0x67e8f9 : ff % 4 === 2 ? 0xf472b6 : 0xa78bfa;
      var ffMat = new THREE.MeshBasicMaterial({ color: ffCol });
      var ffMesh = new THREE.Mesh(flyGeo, ffMat);
      var ffRadius = 14 + (ff % 11) * 5.2;
      var ffAngle = (ff / 55) * TWO_PI;
      var ffBaseY = 3.5 + (ff % 7) * 3.4;
      ffMesh.userData = {
        radius: ffRadius,
        baseAngle: ffAngle,
        speed: (ff % 2 === 0 ? 1 : -1) * (0.08 + (ff % 5) * 0.03),
        baseY: ffBaseY,
        phase: ff * 0.6
      };
      plazaGroup.add(ffMesh);
      castleState.interiorFireflies.push(ffMesh);
    }

    root.add(plazaGroup);
  }

  function buildCircularRondelTrack(root) {
    var bedGeo = new THREE.RingGeometry(R_TRACK - 2.6, R_TRACK + 2.6, 96);
    var bedMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x334155,
      emissiveIntensity: 0.75,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    var bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.rotation.x = -Math.PI / 2;
    bedMesh.position.y = 0.06;
    root.add(bedMesh);

    var sleeperCount = 180;
    var sleeperGeo = new THREE.BoxGeometry(0.58, 0.22, 3.5);
    var sleeperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0x78350f,
      emissiveIntensity: 0.7,
      roughness: 0.65
    });

    for (var i = 0; i < sleeperCount; i++) {
      var a = (i / sleeperCount) * TWO_PI;
      var sx = Math.sin(a) * R_TRACK;
      var sz = Math.cos(a) * R_TRACK;
      var sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(sx, 0.14, sz);
      sleeper.rotation.y = a;
      root.add(sleeper);
    }

    var railMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.85
    });
    var innerRail = new THREE.Mesh(new THREE.TorusGeometry(R_TRACK - 0.85, 0.13, 8, 120), railMat);
    innerRail.rotation.x = Math.PI / 2;
    innerRail.position.y = 0.28;
    root.add(innerRail);

    var outerRail = new THREE.Mesh(new THREE.TorusGeometry(R_TRACK + 0.85, 0.13, 8, 120), railMat);
    outerRail.rotation.x = Math.PI / 2;
    outerRail.position.y = 0.28;
    root.add(outerRail);
  }

  function buildMagicalCrystalTreeAndFountains(root) {
    var treeGroup = new THREE.Group();

    var basinRim = new THREE.Mesh(
      new THREE.TorusGeometry(18, 0.95, 12, 48),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xd97706,
        emissiveIntensity: 0.75,
        roughness: 0.25,
        metalness: 0.6
      })
    );
    basinRim.rotation.x = Math.PI / 2;
    basinRim.position.y = 0.9;
    treeGroup.add(basinRim);

    var waterDisc = new THREE.Mesh(
      new THREE.CircleGeometry(17.6, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    waterDisc.rotation.x = -Math.PI / 2;
    waterDisc.position.y = 0.45;
    treeGroup.add(waterDisc);

    var trunkMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.65,
      roughness: 0.45
    });
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 4.8, 18, 16), trunkMat);
    trunk.position.y = 9;
    treeGroup.add(trunk);

    var canopySpecs = [
      { x: 0, y: 22, z: 0, r: 8.5, col: 0x67e8f9 },
      { x: -6.5, y: 18.5, z: 4.5, r: 6.0, col: 0xf472b6 },
      { x: 6.5, y: 18.5, z: -4.5, r: 6.0, col: 0xa78bfa },
      { x: 5.5, y: 19.5, z: 5.5, r: 5.5, col: 0xfde047 },
      { x: -5.5, y: 19.5, z: -5.5, r: 5.5, col: 0x4ade80 }
    ];
    for (var i = 0; i < canopySpecs.length; i++) {
      var cs = canopySpecs[i];
      var cMat = new THREE.MeshStandardMaterial({
        color: cs.col,
        emissive: cs.col,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.2
      });
      var cMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(cs.r, 1), cMat);
      cMesh.position.set(cs.x, cs.y, cs.z);
      treeGroup.add(cMesh);
    }

    var crystalGeo = new THREE.OctahedronGeometry(1.45, 0);
    for (var k = 0; k < 12; k++) {
      var colHex = k % 3 === 0 ? 0xfef08a : k % 3 === 1 ? 0x38bdf8 : 0xf472b6;
      var crMat = new THREE.MeshBasicMaterial({ color: colHex });
      var crMesh = new THREE.Mesh(crystalGeo, crMat);
      var baseAngle = (k / 12) * TWO_PI;
      crMesh.userData = {
        baseAngle: baseAngle,
        radius: 12.5 + (k % 2) * 3.0,
        baseY: 13 + (k % 4) * 3.2,
        phase: k * 0.7
      };
      treeGroup.add(crMesh);
      castleState.crystalMeshes.push(crMesh);
    }

    var dropGeo = new THREE.SphereGeometry(0.48, 8, 8);
    var dropMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    for (var f = 0; f < 24; f++) {
      var drop = new THREE.Mesh(dropGeo, dropMat);
      drop.userData = {
        jetIndex: f % 8,
        progress: (f / 24) % 1.0
      };
      treeGroup.add(drop);
      castleState.fountainDrops.push(drop);
    }

    root.add(treeGroup);
    castleState.crystalTreeGroup = treeGroup;
  }

  function buildRondelGate(stopDef, index) {
    var g = new THREE.Group();
    var gx = Math.sin(stopDef.angle) * R_GATE;
    var gz = Math.cos(stopDef.angle) * R_GATE;
    g.position.set(gx, 0, gz);
    g.rotation.y = stopDef.angle + Math.PI;

    var mainMat = new THREE.MeshStandardMaterial({
      color: stopDef.colorHex,
      emissive: stopDef.colorHex,
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.35
    });

    var colGeo = new THREE.CylinderGeometry(1.1, 1.35, 11, 16);
    var leftCol = new THREE.Mesh(colGeo, mainMat);
    leftCol.position.set(-5.8, 5.5, 0);
    var rightCol = new THREE.Mesh(colGeo, mainMat);
    rightCol.position.set(5.8, 5.5, 0);
    g.add(leftCol, rightCol);

    var archMesh = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.95, 12, 32, Math.PI), mainMat);
    archMesh.position.set(0, 11, 0);
    g.add(archMesh);

    var portalMat = new THREE.MeshBasicMaterial({
      color: stopDef.colorHex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    var portalMesh = new THREE.Mesh(new THREE.CircleGeometry(5.3, 28), portalMat);
    portalMesh.position.set(0, 7.5, -0.2);
    g.add(portalMesh);

    var padMat = new THREE.MeshBasicMaterial({
      color: stopDef.colorHex,
      side: THREE.DoubleSide
    });
    var padMesh = new THREE.Mesh(new THREE.RingGeometry(2.2, 3.2, 28), padMat);
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.position.set(0, 0.25, 8.0);
    g.add(padMesh);

    var boardTex = createMinigameBillboardTexture(stopDef);
    var boardMat = new THREE.MeshBasicMaterial({ map: boardTex, side: THREE.DoubleSide });
    var boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 8.6), boardMat);
    boardMesh.position.set(0, 17.5, 0.3);
    g.add(boardMesh);

    var frameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    var frameMesh = new THREE.Mesh(new THREE.BoxGeometry(15.3, 9.4, 0.35), frameMat);
    frameMesh.position.set(0, 17.5, 0.05);
    g.add(frameMesh);

    return {
      index: index,
      stopDef: stopDef,
      group: g,
      mainMat: mainMat,
      portalMat: portalMat,
      portalMesh: portalMesh,
      boardMesh: boardMesh,
      frameMat: frameMat
    };
  }

  function createMinigameBillboardTexture(stopDef) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 300;
    var ctx = c.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 300);

    ctx.strokeStyle = stopDef.accentHex;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 286);

    drawGatePictogram(ctx, stopDef);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(14, 205, 484, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stopDef.title, 256, 238);

    ctx.fillStyle = stopDef.ready || stopDef.type !== 'minigame' ? '#4ade80' : '#fde047';
    ctx.font = 'bold 21px sans-serif';
    var statusText =
      stopDef.type === 'entry'
        ? '✨ Příjezd ze zlaté brány ✨'
        : stopDef.type === 'exit'
          ? '🚂 Stiskni OK pro návrat do města'
          : stopDef.ready
            ? '🟢 PŘIPRAVENO KE HŘE • STISKNI OK!'
            : '🌟 PŘIPRAVUJEME PRO DĚTI 🌟';
    ctx.fillText(statusText, 256, 270);

    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function drawGatePictogram(ctx, stopDef) {
    ctx.save();
    if (stopDef.id === 'SAMA_DIRA') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(40, 165, 135, 22);
      ctx.fillRect(335, 165, 135, 22);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(256, 175, 95, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.translate(256, 92);
      ctx.rotate(-0.18);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-48, -24, 96, 42);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-28, 22, 14, 0, TWO_PI);
      ctx.arc(28, 22, 14, 0, TWO_PI);
      ctx.fill();
    } else {
      ctx.font = '105px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var icon =
        stopDef.id === 'SMILEY'
          ? '😄⭐'
          : stopDef.id === 'ART_STUDIO'
            ? '🎨🖌️'
            : stopDef.id === 'TRAIN_WASH'
              ? '🫧🚂'
              : stopDef.id === 'PARCELS'
                ? '📦🎁'
                : stopDef.id === 'MUSIC_STUDIO'
                  ? '🎵🎹'
                  : stopDef.id === 'EXIT'
                    ? '🚂🌳'
                    : '🏰✨';
      ctx.fillText(icon, 256, 112);
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
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

  // ==========================================================================
  // 4. RONDEL UI OVERLAY, QUICK TELEPORT TO GOLDEN SPUR & PORTAL FLASH
  // ==========================================================================
  function createCastleHUD() {
    if (castleState.hudEl) return;

    var flash = document.createElement('div');
    flash.id = 'castle-portal-flash';
    flash.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:8500;background:radial-gradient(circle, #fef08a 0%, #60a5fa 55%, #1e1b4b 100%);opacity:0;transition:opacity 0.22s ease;';
    document.body.appendChild(flash);
    castleState.flashEl = flash;

    var topBar = document.getElementById('top-bar');
    if (topBar) {
      var driveGoldBtn = document.createElement('button');
      driveGoldBtn.id = 'top-golden-spur-btn';
      driveGoldBtn.type = 'button';
      driveGoldBtn.className = 'ui-panel';
      driveGoldBtn.style.cssText =
        'cursor:pointer;background:linear-gradient(180deg,#facc15 0%,#ca8a04 100%);border:2px solid #fef08a;color:#0f172a;font-weight:900;font-size:13px;padding:4px 11px;border-radius:14px;box-shadow:0 3px 0 #713f12;';
      driveGoldBtn.textContent = '✨ Zlatá odbočka';
      driveGoldBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        driveTrainOntoGoldenCastleSpur();
      });

      var castleBtn = document.createElement('button');
      castleBtn.id = 'top-castle-btn';
      castleBtn.type = 'button';
      castleBtn.className = 'ui-panel';
      castleBtn.style.cssText =
        'cursor:pointer;background:linear-gradient(180deg,#ec4899 0%,#be185d 100%);border:2px solid #fbcfe8;color:#fff;font-weight:900;font-size:13px;padding:4px 11px;border-radius:14px;box-shadow:0 3px 0 #831843;';
      castleBtn.textContent = '🏰 Zámek her';
      castleBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (castleState.isInside) {
          exitAdventureCastleToCity();
        } else {
          enterAdventureCastle();
        }
      });

      var samaBtn = document.getElementById('top-sama-dira-btn');
      if (samaBtn && samaBtn.parentNode === topBar) {
        topBar.insertBefore(driveGoldBtn, samaBtn);
        topBar.insertBefore(castleBtn, samaBtn);
      } else {
        topBar.appendChild(driveGoldBtn);
        topBar.appendChild(castleBtn);
      }
    }

    var hud = document.createElement('div');
    hud.id = 'castle-rondel-hud';
    hud.style.cssText =
      'position:fixed;left:50%;top:62px;transform:translateX(-50%);z-index:6500;display:none;align-items:center;gap:12px;background:rgba(15,23,42,0.92);border:3px solid #fbbf24;border-radius:24px;padding:8px 16px;color:#fff;font-family:sans-serif;box-shadow:0 10px 28px rgba(0,0,0,0.65);min-width:320px;max-width:94vw;';

    hud.innerHTML =
      '<button id="castle-prev-btn" type="button" style="cursor:pointer;background:#1e293b;border:2px solid #94a3b8;color:#fff;font-size:16px;font-weight:900;padding:8px 14px;border-radius:14px;">◄ Předchozí</button>' +
      '<div style="text-align:center;min-width:210px;padding:0 6px;">' +
      '  <div id="castle-hud-title" style="font-size:20px;font-weight:900;color:#fef08a;margin-bottom:2px;">🦘 1. Samá díra</div>' +
      '  <div id="castle-hud-sub" style="font-size:12px;color:#cbd5e1;font-weight:700;">Vláček krouží kolem stromu • Stiskni OK u rozsvícené brány!</div>' +
      '</div>' +
      '<button id="castle-next-btn" type="button" style="cursor:pointer;background:#1e293b;border:2px solid #94a3b8;color:#fff;font-size:16px;font-weight:900;padding:8px 14px;border-radius:14px;">Další ►</button>' +
      '<button id="castle-action-btn" type="button" style="cursor:pointer;background:linear-gradient(180deg,#f59e0b 0%,#d97706 100%);border:2px solid #fef08a;color:#0f172a;font-size:16px;font-weight:900;padding:8px 16px;border-radius:14px;box-shadow:0 3px 0 #78350f;">🎮 Hrát Samá díra (OK)</button>' +
      '<button id="castle-exit-now-btn" type="button" style="cursor:pointer;background:#065f46;border:2px solid #6ee7b7;color:#ecfdf5;font-size:14px;font-weight:800;padding:8px 12px;border-radius:14px;">🚂 Ven do města</button>';

    document.body.appendChild(hud);
    castleState.hudEl = hud;

    document.getElementById('castle-prev-btn').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      stepCastleGate(-1);
    });
    document.getElementById('castle-next-btn').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      stepCastleGate(1);
    });
    document.getElementById('castle-action-btn').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      activateSelectedCastleGate();
    });
    document.getElementById('castle-exit-now-btn').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      exitAdventureCastleToCity();
    });
  }

  function driveTrainOntoGoldenCastleSpur() {
    if (castleState.isInside) {
      exitAdventureCastleToCity();
    }
    if (typeof window.pState === 'undefined' || typeof window.edges === 'undefined') return;

    var approachEdge = null;
    for (var i = 0; i < window.edges.length; i++) {
      if (window.edges[i].id === 'J_SOUTH->J_CENTER') {
        approachEdge = window.edges[i];
        break;
      }
    }
    if (!approachEdge) return;

    castleState.reentryCooldown = 0;
    pState.inSubway = false;
    pState.inTunnel = false;
    pState.atGate = false;
    pState.stationPause = 0;
    pState.edge = approachEdge;
    pState.entryT = 0.16;
    pState.t = 0.54;
    pState.switchChoice = 'straight';
    pState.speedStage = 2;
    pState.currentVel = 0.22;
    pState.prevSegments = [{ edge: approachEdge, startT: 0.16, endT: 0.54 }];

    ensureSurfaceWorldVisible();

    if (typeof window.smoothCamPos !== 'undefined' && typeof window.smoothCamLook !== 'undefined') {
      window.smoothCamPos.set(EXT_POS.x - 42, 34, EXT_POS.z + 125);
      window.smoothCamLook.set(EXT_POS.x, 28, EXT_POS.z);
    }

    if (typeof window.updateHUD === 'function') {
      try {
        window.updateHUD();
      } catch (e) {}
    }

    if (typeof window.speakCharacter === 'function') {
      window.speakCharacter(
        'train',
        '🏰 Little Train Toby',
        '#facc15',
        'Hurá! Jedeme po třpytivé zlaté koleji přímo do otevřených dveří pohádkového zámku Neuschwanstein!'
      );
    }
  }

  function updateCastleHUD() {
    if (!castleState.hudEl) return;
    var stop = CASTLE_STOPS[castleState.selectedStopIdx];
    var titleEl = document.getElementById('castle-hud-title');
    var subEl = document.getElementById('castle-hud-sub');
    var actBtn = document.getElementById('castle-action-btn');
    if (titleEl) {
      titleEl.textContent = stop.title;
      titleEl.style.color = stop.accentHex;
    }
    if (subEl) subEl.textContent = stop.subtitle;
    if (actBtn) actBtn.textContent = stop.buttonLabel;
  }

  function triggerPortalFlash(callback, fastMode) {
    if (!castleState.flashEl) {
      if (callback) callback();
      return;
    }
    castleState.isTransitioning = true;
    var fadeInMs = fastMode ? 120 : 240;
    var fadeOutMs = fastMode ? 140 : 220;
    castleState.flashEl.style.transition = 'opacity ' + (fadeInMs / 1000).toFixed(2) + 's ease';
    castleState.flashEl.style.opacity = '1';

    if (!fastMode && typeof window.playMagicSubwaySound === 'function') {
      try {
        window.playMagicSubwaySound();
      } catch (e) {}
    }

    setTimeout(function () {
      if (callback) callback();
      setTimeout(function () {
        if (castleState.flashEl) {
          castleState.flashEl.style.transition = 'opacity ' + (fadeOutMs / 1000).toFixed(2) + 's ease';
          castleState.flashEl.style.opacity = '0';
        }
        castleState.isTransitioning = false;
      }, fadeOutMs);
    }, fadeInMs);
  }

  // ==========================================================================
  // 5. ENTERING & EXITING THE CASTLE + RONDEL NAVIGATION
  // ==========================================================================
  function enterAdventureCastle() {
    if (castleState.isInside || castleState.isTransitioning) return;

    castleState.entryCeremonyPhase = 'NONE';
    castleState.doorOpenProgress = 1.0;

    // Stop surface train motion & place pState on a standard city edge before entering the interior rondel
    if (typeof pState !== 'undefined') {
      pState.speedStage = 0;
      pState.currentVel = 0;
      if (typeof window.edges !== 'undefined') {
        for (var ei = 0; ei < window.edges.length; ei++) {
          if (window.edges[ei].id === 'J_CENTER->J_SOUTH' || window.edges[ei].id === 'J_CENTER->J_WEST') {
            pState.edge = window.edges[ei];
            pState.entryT = 0.12;
            pState.t = 0.15;
            pState.switchChoice = 'straight';
            break;
          }
        }
      }
    }

    triggerPortalFlash(function () {
      castleState.isInside = true;

      if (typeof pState !== 'undefined') {
        pState.speedStage = 0;
        pState.currentVel = 0;
      }

      if (typeof scene !== 'undefined') {
        if (scene.background && scene.background.getHex) {
          castleState.savedBgColorHex = scene.background.getHex();
          scene.background.setHex(0x1e1b4b);
        }
        if (scene.fog) {
          castleState.savedFogDensity = scene.fog.density;
          if (scene.fog.color && scene.fog.color.getHex) {
            castleState.savedFogColorHex = scene.fog.color.getHex();
            scene.fog.color.setHex(0x1e1b4b);
          }
          scene.fog.density = 0.0001;
        }
      }

      if (castleState.interiorGroup) {
        castleState.interiorGroup.visible = true;
      }

      // Start smoothly approaching Gate 1 ("Samá díra") while slowly cruising around the circle!
      castleState.selectedStopIdx = 1;
      var initialAngle = CASTLE_STOPS[1].angle - 0.14;
      castleState.trainAngle = initialAngle;
      castleState.targetAngle = CASTLE_STOPS[1].angle;
      castleState.cameraAngle = initialAngle;
      castleState.autoCruise = true;
      castleState.cruiseDir = 1;
      castleState.manualSteerHoldTimer = 0;

      if (castleState.hudEl) {
        castleState.hudEl.style.display = 'flex';
      }
      var topBtn = document.getElementById('top-castle-btn');
      if (topBtn) topBtn.textContent = '🚂 Ven ze Zámku';

      updateCastleHUD();

      if (typeof window.speakCharacter === 'function') {
        window.speakCharacter(
          'train',
          '🏰 Little Train Toby',
          '#fef08a',
          'Vítej v Zámku tisíce dobrodružství! Vláček pomalu projíždí kolem kouzelného stromu – jakmile se rozsvítí brána, stiskni OK!'
        );
      }
    }, false);
  }

  // Instant, smooth, natural Castle exit right out of the open South Castle Gatehouse Doors!
  // Camera is placed right behind the train at a low natural height looking forward -> zero roof clipping & zero aerial jump!
  function exitAdventureCastleToCity() {
    if (!castleState.isInside) return;

    castleState.isTransitioning = false;
    castleState.isInside = false;
    castleState.reentryCooldown = 5.5;
    castleState.entryCeremonyPhase = 'NONE';
    castleState.entryCeremonySpoken = false;
    castleState.doorOpenProgress = 1.0;
    castleState.activeDoorGateIdx = 0; // South Gatehouse (index 0) stays wide open while exiting!
    castleState.exitCamHoldTimer = 0.0;
    window._castleExitFollowTimer = 7.5; // Suppresses POI camera sweeps & keeps low follow camera in models.js!

    if (castleState.flashEl) {
      castleState.flashEl.style.transition = 'opacity 0.12s ease';
      castleState.flashEl.style.opacity = '0';
    }

    if (castleState.interiorGroup) {
      castleState.interiorGroup.visible = false;
    }
    if (castleState.hudEl) {
      castleState.hudEl.style.display = 'none';
    }
    var topBtn = document.getElementById('top-castle-btn');
    if (topBtn) topBtn.textContent = '🏰 Zámek her';

    // Keep the South Gatehouse Giant Doors swung wide open as the train exits
    for (var dh = 0; dh < castleState.exteriorDoorHinges.length; dh++) {
      var dObj = castleState.exteriorDoorHinges[dh];
      dObj.hinge.rotation.y = (dObj.gateIndex === 0) ? (dObj.sideSign * 1.22) : 0;
    }

    if (typeof scene !== 'undefined') {
      if (scene.background && castleState.savedBgColorHex !== null) {
        scene.background.setHex(castleState.savedBgColorHex);
      }
      if (scene.fog) {
        if (castleState.savedFogDensity !== null) {
          scene.fog.density = castleState.savedFogDensity;
        }
        if (scene.fog.color && castleState.savedFogColorHex !== null) {
          scene.fog.color.setHex(castleState.savedFogColorHex);
        }
      }
    }

    // Place the train rolling directly out of the open South Castle Gatehouse Doors onto J_CENTER->J_SOUTH!
    if (typeof pState !== 'undefined' && typeof window.edges !== 'undefined') {
      pState.inSubway = false;
      pState.inTunnel = false;
      pState.atGate = false;
      pState.stationPause = 0;

      var exitEdge = null;
      var approachEdge = null;
      for (var i = 0; i < window.edges.length; i++) {
        if (window.edges[i].id === 'J_CENTER->J_SOUTH') {
          exitEdge = window.edges[i];
        } else if (window.edges[i].id === 'J_NORTH->J_CENTER') {
          approachEdge = window.edges[i];
        }
      }
      if (!exitEdge) {
        for (var j = 0; j < window.edges.length; j++) {
          if (window.edges[j].id === 'J_CENTER->J_WEST') {
            exitEdge = window.edges[j];
            break;
          }
        }
      }

      if (exitEdge && exitEdge.curve) {
        var exitT = 0.18; // z ≈ 51m, just outside the open Giant South Castle Doors!
        pState.edge = exitEdge;
        pState.entryT = 0.0;
        pState.t = exitT;
        pState.speedStage = 3; // Smooth, natural cruising speed out of the Castle
        pState.currentVel = 0.36;
        pState.switchChoice = 'straight';
        pState.prevSegments = [];
        if (approachEdge) {
          pState.prevSegments.push({ edge: approachEdge, startT: 0.70, endT: 1.0 });
        }

        // Immediately position the locomotive and ALL coaches emerging through the open Castle Doors!
        var pos = exitEdge.curve.getPointAt(exitT);
        var tan = exitEdge.curve.getTangentAt(exitT).normalize();
        var trackRight = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

        if (typeof playerLoco !== 'undefined') {
          playerLoco.position.copy(pos);
          playerLoco.lookAt(pos.clone().add(tan));
          playerLoco.updateMatrixWorld(true);
        }

        if (typeof playerCoaches !== 'undefined' && Array.isArray(playerCoaches)) {
          var edgeLen = exitEdge.length || exitEdge.curve.getLength() || 198;
          for (var c = 0; c < playerCoaches.length; c++) {
            var coach = playerCoaches[c];
            if (!coach) continue;
            var distBack = 6.2 + c * 5.2;
            var cT = exitT - distBack / edgeLen;
            var cPos, cTan;
            if (cT >= 0) {
              cPos = exitEdge.curve.getPointAt(cT);
              cTan = exitEdge.curve.getTangentAt(cT);
            } else if (approachEdge && approachEdge.curve) {
              var remT = Math.max(0.05, 1.0 + cT);
              cPos = approachEdge.curve.getPointAt(remT);
              cTan = approachEdge.curve.getTangentAt(remT);
            } else {
              cPos = pos.clone().addScaledVector(tan, -distBack);
              cTan = tan.clone();
            }
            coach.position.copy(cPos);
            coach.lookAt(cPos.clone().add(cTan));
            coach.updateMatrixWorld(true);
          }
        }

        // Place camera at a low, natural follow position right behind the locomotive (outside the Castle doors,
        // only 7.6m above the rails) looking FORWARD along the track -> zero roof obstruction & zero aerial jump!
        var exitCamPos = pos.clone()
          .sub(tan.clone().multiplyScalar(17.5))
          .add(trackRight.clone().multiplyScalar(5.2))
          .add(new THREE.Vector3(0, 7.6, 0));
        var exitCamLook = pos.clone()
          .add(tan.clone().multiplyScalar(26.0))
          .add(new THREE.Vector3(0, 3.2, 0));

        if (typeof camera !== 'undefined') {
          camera.fov = 46;
          camera.updateProjectionMatrix();
          camera.position.copy(exitCamPos);
          camera.lookAt(exitCamLook);
        }
        if (typeof window.smoothCamPos !== 'undefined' && typeof window.smoothCamLook !== 'undefined') {
          window.smoothCamPos.copy(exitCamPos);
          window.smoothCamLook.copy(exitCamLook);
        }
        if (typeof window._camSysState !== 'undefined' && window._camSysState) {
          var cs = window._camSysState;
          if (cs.pos) cs.pos.copy(exitCamPos);
          if (cs.look) cs.look.copy(exitCamLook);
          if (cs.posVel) cs.posVel.set(0, 0, 0);
          if (cs.lookVel) cs.lookVel.set(0, 0, 0);
          cs.dir = new THREE.Vector3(tan.x, 0, tan.z).normalize();
          if (cs.dirVel) cs.dirVel.set(0, 0, 0);
          if (cs.curveLead) cs.curveLead.set(0, 0, 0);
          if (cs.curveLeadVel) cs.curveLeadVel.set(0, 0, 0);
          cs.activePoiId = null;
          cs.poiWeight = 0;
          cs.poiWeightVel = 0;
          if (cs.poiOffsetPos) cs.poiOffsetPos.set(0, 0, 0);
          if (cs.poiOffsetPosVel) cs.poiOffsetPosVel.set(0, 0, 0);
          if (cs.poiLookPoint) cs.poiLookPoint.copy(exitCamLook);
          if (cs.poiLookVel) cs.poiLookVel.set(0, 0, 0);
        }
      }
    }

    ensureSurfaceWorldVisible();

    if (typeof window.updateHUD === 'function') {
      try {
        window.updateHUD();
      } catch (e) {}
    }
    if (typeof window.syncCornerSpeedAndSwitchHud === 'function') {
      try {
        window.syncCornerSpeedAndSwitchHud(false);
      } catch (e) {}
    }
  }

  function stepCastleGate(delta) {
    if (!castleState.isInside || castleState.isTransitioning) return;
    var len = CASTLE_STOPS.length;
    castleState.selectedStopIdx = (castleState.selectedStopIdx + delta + len) % len;
    castleState.targetAngle = CASTLE_STOPS[castleState.selectedStopIdx].angle;
    castleState.cruiseDir = delta >= 0 ? 1 : -1;
    // Temporarily glide directly to the chosen gate, then resume slow circular cruise
    castleState.manualSteerHoldTimer = 2.6;
    updateCastleHUD();
  }

  function activateSelectedCastleGate() {
    if (!castleState.isInside || castleState.isTransitioning) return;
    var stop = CASTLE_STOPS[castleState.selectedStopIdx];
    if (!stop) return;

    if (stop.type === 'exit' || stop.type === 'entry') {
      exitAdventureCastleToCity();
      return;
    }

    if (stop.type === 'minigame') {
      if (stop.ready && stop.minigameId && window.HappyTrainMinigames) {
        if (castleState.hudEl) castleState.hudEl.style.display = 'none';
        triggerPortalFlash(function () {
          window.HappyTrainMinigames.launch(stop.minigameId, { source: 'castle' });
        }, true);
      } else if (stop.minigameId === 'sama_dira' && window.SamaDiraMinigame) {
        if (castleState.hudEl) castleState.hudEl.style.display = 'none';
        triggerPortalFlash(function () {
          window.SamaDiraMinigame.start();
        }, true);
      } else if (typeof window.speakCharacter === 'function') {
        window.speakCharacter(
          'mom',
          '✨ Mom Narrator',
          '#ec4899',
          'Tato kouzelná brána se ještě staví! Počkej, až vláček dojede k bráně Samá díra, a stiskni OK.'
        );
      }
    }
  }

  window.enterAdventureCastle = enterAdventureCastle;
  window.exitAdventureCastleToCity = exitAdventureCastleToCity;
  window.stepCastleGate = stepCastleGate;
  window.activateSelectedCastleGate = activateSelectedCastleGate;
  window.driveTrainOntoGoldenCastleSpur = driveTrainOntoGoldenCastleSpur;

  // ==========================================================================
  // 6. FRAME UPDATE: EXTERIOR NEUSCHWANSTEIN, WHALES, SPARKLES & RONDEL CAMERA
  // ==========================================================================
  function updateAdventureCastleFrame(dt) {
    var timeNow = performance.now() * 0.001;

    if (castleState.reentryCooldown > 0) {
      castleState.reentryCooldown = Math.max(0, castleState.reentryCooldown - dt);
    }

    var minigameRunning =
      (window.HappyTrainMinigames && window.HappyTrainMinigames.isActive()) ||
      (window.SamaDiraMinigame && window.SamaDiraMinigame.isActive());

    if (
      castleState.isInside &&
      castleState.hudEl &&
      castleState.hudEl.style.display === 'none' &&
      !minigameRunning
    ) {
      castleState.hudEl.style.display = 'flex';
    }

    // A) WHEN OUTSIDE IN THE CITY: Animate Neuschwanstein, Cloud Halos, Golden Sparkles, Whales & Pyramids
    if (!castleState.isInside && typeof pState !== 'undefined' && typeof playerLoco !== 'undefined') {
      ensureSurfaceWorldVisible();

      // 1. Check Day / Night / Sunset phase so the Castle walls, roofs & windows glow brilliantly at night!
      var gSec = typeof window.gameTimeSeconds === 'number' ? window.gameTimeSeconds : 125;
      var hoursFloat = (gSec / 300) * 24;
      var isNightOrDusk = hoursFloat >= 17.2 || hoursFloat < 6.8;
      var targetRoofEmissive = isNightOrDusk ? 1.15 : 0.35;
      var targetWallEmissive = isNightOrDusk ? 0.68 : 0.20;
      var targetLightInt = isNightOrDusk ? 3.2 : 0.45;

      for (var m = 0; m < castleState.exteriorRoofNightMats.length; m++) {
        var rMat = castleState.exteriorRoofNightMats[m];
        rMat.emissiveIntensity += (targetRoofEmissive - rMat.emissiveIntensity) * 0.08;
      }
      for (var wm = 0; wm < castleState.exteriorWallNightMats.length; wm++) {
        var wMat = castleState.exteriorWallNightMats[wm];
        wMat.emissiveIntensity += (targetWallEmissive - wMat.emissiveIntensity) * 0.08;
      }
      for (var nl = 0; nl < castleState.exteriorNightLights.length; nl++) {
        var nLight = castleState.exteriorNightLights[nl];
        nLight.intensity += (targetLightInt - nLight.intensity) * 0.08;
      }

      // Shimmer the 4 Gatehouse Magical Portal Curtains
      var portalPulse = 0.68 + Math.sin(timeNow * 4.2) * 0.22;
      for (var pm = 0; pm < castleState.portalCurtainMats.length; pm++) {
        castleState.portalCurtainMats[pm].opacity = portalPulse;
      }

      // 2. Spin Golden Spire Stars & Giza Pyramid Solar Crystals
      for (var s = 0; s < castleState.exteriorStars.length; s++) {
        castleState.exteriorStars[s].rotation.y += 1.8 * dt;
      }
      for (var pc = 0; pc < castleState.pyramidCapstones.length; pc++) {
        var cap = castleState.pyramidCapstones[pc];
        cap.rotation.y += 1.5 * dt;
        cap.position.y = 33.6 + Math.sin(timeNow * 2.5 + pc) * 0.65;
      }

      // 3. Slowly rotate the Sky-Piercing Cloud Halos around the high Neuschwanstein spires
      for (var cr = 0; cr < castleState.skyCloudRings.length; cr++) {
        var cRing = castleState.skyCloudRings[cr];
        cRing.group.rotation.y += cRing.speed * dt;
      }

      // 4. Animate Rising Golden Sparkles along the Golden Castle Turnouts
      for (var sp = 0; sp < castleState.goldenSparkles.length; sp++) {
        var spObj = castleState.goldenSparkles[sp];
        var cycle = (timeNow * spObj.speed + spObj.phase) % 1.0;
        spObj.mesh.position.y = spObj.baseY + cycle * 3.8;
        spObj.mesh.rotation.y = timeNow * 3.2 + spObj.phase;
        var sc = Math.sin(cycle * Math.PI) * 1.15;
        spObj.mesh.scale.set(sc, sc, sc);
      }

      var goldPulse = 0.70 + Math.sin(timeNow * 4.5) * 0.28;
      for (var gm = 0; gm < castleState.goldenRailMats.length; gm++) {
        castleState.goldenRailMats[gm].emissiveIntensity = goldPulse;
      }

      // 5. Animate the 4 Atlantis Whales swimming, waving tails, and spouting water fountains!
      for (var w = 0; w < castleState.atlantisWhales.length; w++) {
        var wh = castleState.atlantisWhales[w];
        wh.angle = (wh.angle + wh.speed * dt) % TWO_PI;
        var wx = Math.sin(wh.angle) * wh.radius;
        var wz = Math.cos(wh.angle) * wh.radius;
        var wy = -0.15 + Math.sin(timeNow * 2.4 + wh.phase) * 0.45;

        var wtx = Math.cos(wh.angle);
        var wtz = -Math.sin(wh.angle);
        wh.group.position.set(wx, wy, wz);
        wh.group.rotation.y = Math.atan2(wtx, wtz);
        wh.group.rotation.x = Math.cos(timeNow * 2.4 + wh.phase) * 0.08;

        wh.tailPivot.rotation.x = Math.sin(timeNow * 5.5 + wh.phase) * 0.38;

        for (var d = 0; d < wh.spoutDrops.length; d++) {
          var dr = wh.spoutDrops[d];
          dr.progress = (dr.progress + dt * 0.85) % 1.0;
          var p = dr.progress;
          var spreadR = p * 2.4;
          var dropY = 1.6 + Math.sin(p * Math.PI) * 5.2;
          dr.mesh.position.set(
            Math.cos(dr.angle) * spreadR,
            dropY,
            1.5 + Math.sin(dr.angle) * spreadR
          );
          var dScale = Math.sin(p * Math.PI) * 1.1;
          dr.mesh.scale.set(dScale, dScale, dScale);
        }
      }

      // 6. Auto-default switchChoice to 'straight' (Golden Castle Spur) when entering a track to J_CENTER
      if (
        pState.edge &&
        !pState.edge.isTurnout &&
        pState.edge.to === 'J_CENTER' &&
        castleState.lastAutoGoldEdgeId !== pState.edge.id
      ) {
        castleState.lastAutoGoldEdgeId = pState.edge.id;
        pState.switchChoice = 'straight';
        if (typeof window.updateHUD === 'function') {
          try {
            window.updateHUD();
          } catch (e) {}
        }
      } else if (pState.edge && pState.edge.to !== 'J_CENTER' && !pState.edge.isTurnout) {
        castleState.lastAutoGoldEdgeId = null;
      }

      // 7. GRAND CASTLE DOOR OPENING CEREMONY & ENTRY DETECTION:
      //    - Finds the exact Gatehouse on the track the train is approaching.
      //    - Forces switchChoice = 'straight' during the door-opening ceremony so at u = 0.84
      //      the train ALWAYS drives straight through the center of the open Giant Doors!
      //    - Opens ONLY the Giant Doors of that approached Gatehouse!
      var distToCastleCenter = Math.hypot(
        playerLoco.position.x - EXT_POS.x,
        playerLoco.position.z - EXT_POS.z
      );

      if (typeof window._castleExitFollowTimer === 'number' && window._castleExitFollowTimer > 0) {
        window._castleExitFollowTimer = Math.max(0, window._castleExitFollowTimer - dt);
      }

      if (!castleState.isTransitioning && castleState.reentryCooldown <= 0 && pState.edge && !pState.inSubway) {
        var baseInEdge = pState.edge.isTurnout ? (pState.edge.sourceEdge || pState.edge) : pState.edge;
        var isHeadingToCastle =
          pState.edge.to === 'J_CENTER' ||
          pState.edge.to === 'N_CASTLE_PORTAL' ||
          pState.edge.isGoldenCastleTurnout ||
          (baseInEdge && baseInEdge.to === 'J_CENTER' && distToCastleCenter < 45.0);

        if (isHeadingToCastle && distToCastleCenter < 62.0) {
          // Determine which of the 4 Gatehouses the train is approaching
          var nearestGateIdx = 0;
          var bestGateDist = 999999;
          for (var gCheck = 0; gCheck < castleState.exteriorDoorHinges.length; gCheck++) {
            var dhItem = castleState.exteriorDoorHinges[gCheck];
            if (baseInEdge && dhItem.edgeId === baseInEdge.id) {
              nearestGateIdx = dhItem.gateIndex;
              bestGateDist = 0;
              break;
            }
            if (dhItem.portalWorldPos) {
              var dPortal = Math.hypot(
                playerLoco.position.x - dhItem.portalWorldPos.x,
                playerLoco.position.z - dhItem.portalWorldPos.z
              );
              if (dPortal < bestGateDist) {
                bestGateDist = dPortal;
                nearestGateIdx = dhItem.gateIndex;
              }
            }
          }
          castleState.activeDoorGateIdx = nearestGateIdx;

          // Ensure switchChoice is 'straight' so at u = 0.84 the train drives straight through the open Giant Doors!
          if (!pState.edge.isTurnout && pState.switchChoice !== 'straight') {
            pState.switchChoice = 'straight';
            if (typeof window.updateHUD === 'function') {
              try { window.updateHUD(); } catch (e) {}
            }
          }

          // Phase 1: Train approaches the Castle (42m .. 62m) -> gently slow down & begin cracking doors open
          if (distToCastleCenter > 42.0 && castleState.entryCeremonyPhase === 'NONE') {
            castleState.entryCeremonyPhase = 'APPROACHING';
          }

          if (castleState.entryCeremonyPhase === 'APPROACHING') {
            if (pState.currentVel > 0.16) {
              pState.currentVel = Math.max(0.14, pState.currentVel - dt * 0.45);
            }
            castleState.doorOpenProgress = Math.min(0.25, castleState.doorOpenProgress + dt * 0.22);
            if (distToCastleCenter <= 42.0) {
              castleState.entryCeremonyPhase = 'OPENING_DOORS';
              playCastleDoorOpenFanfare();
              if (!castleState.entryCeremonySpoken && typeof window.speakCharacter === 'function') {
                castleState.entryCeremonySpoken = true;
                window.speakCharacter(
                  'train',
                  '🏰 Little Train Toby',
                  '#fef08a',
                  'Pozor, přijíždíme k Zámku tisíce dobrodružství! Veliké zlaté dveře se před námi pomalu otevírají!'
                );
              }
            }
          }

          // Phase 2: Train pauses right in front of the Giant Doors while they slowly swing open!
          if (castleState.entryCeremonyPhase === 'OPENING_DOORS') {
            pState.currentVel = 0.012; // Almost stopped right before the grand entrance
            castleState.doorOpenProgress = Math.min(1.0, castleState.doorOpenProgress + dt * 0.65);
            if (castleState.doorOpenProgress >= 0.94) {
              castleState.entryCeremonyPhase = 'ENTERING';
            }
          }

          // Phase 3: Giant Doors are wide open! Train smoothly accelerates straight through the grand doorway into the Castle!
          if (castleState.entryCeremonyPhase === 'ENTERING') {
            castleState.doorOpenProgress = Math.min(1.0, castleState.doorOpenProgress + dt * 0.85);
            pState.currentVel = Math.max(pState.currentVel, 0.24);
            if (pState.speedStage < 2) pState.speedStage = 2;

            var enteredThroughOpenDoors =
              distToCastleCenter <= 25.5 ||
              (pState.edge.id === 'J_CENTER->N_CASTLE_PORTAL' && pState.t >= 0.35) ||
              (pState.edge.isGoldenCastleTurnout && pState.t >= 0.32);

            if (enteredThroughOpenDoors) {
              enterAdventureCastle();
              return;
            }
          }
        } else {
          // Far from Castle -> reset ceremony state and gently close doors if cooldown finished
          castleState.entryCeremonyPhase = 'NONE';
          castleState.entryCeremonySpoken = false;
          castleState.doorOpenProgress = Math.max(0.0, castleState.doorOpenProgress - dt * 0.45);
        }
      } else if (castleState.reentryCooldown > 0) {
        // Keep the South Gatehouse Giant Doors wide open while the train is exiting the Castle!
        castleState.doorOpenProgress = 1.0;
        castleState.activeDoorGateIdx = 0;
      }

      // Smooth S-curve easing for the active Gatehouse's Giant Wooden & Gold-Studded Castle Doors
      var smoothOpen =
        castleState.doorOpenProgress *
        castleState.doorOpenProgress *
        (3.0 - 2.0 * castleState.doorOpenProgress);
      for (var dIdx = 0; dIdx < castleState.exteriorDoorHinges.length; dIdx++) {
        var doorItem = castleState.exteriorDoorHinges[dIdx];
        var isTargetGate = (doorItem.gateIndex === castleState.activeDoorGateIdx);
        doorItem.hinge.rotation.y = isTargetGate ? (doorItem.sideSign * smoothOpen * 1.22) : 0;
      }
    }

    // B) WHEN INSIDE THE CASTLE RONDEL: Continuous Slow Circular Train Ride, Proximity Gate Lighting & Panoramic Camera
    if (castleState.isInside && typeof playerLoco !== 'undefined' && typeof camera !== 'undefined') {
      if (typeof pState !== 'undefined') {
        pState.speedStage = 0;
        pState.currentVel = 0;
      }

      if (window.undergroundWorldGroup) {
        window.undergroundWorldGroup.visible = false;
      }

      if (typeof scene !== 'undefined') {
        if (scene.background) scene.background.setHex(0x1e1b4b);
        if (scene.fog) {
          scene.fog.color.setHex(0x1e1b4b);
          scene.fog.density = 0.0001;
        }
      }

      // 1. Continuous Slow Circular Train Ride + Optional Manual Step with ◄ / ►
      var dirSign = castleState.cruiseDir || 1;
      if (castleState.manualSteerHoldTimer > 0) {
        castleState.manualSteerHoldTimer = Math.max(0, castleState.manualSteerHoldTimer - dt);
        var angleDiff = shortestAngleDiff(castleState.trainAngle, castleState.targetAngle);
        var maxStep = 0.95 * dt;
        if (Math.abs(angleDiff) > 0.004) {
          dirSign = angleDiff >= 0 ? 1 : -1;
          castleState.cruiseDir = dirSign;
          if (Math.abs(angleDiff) <= maxStep) {
            castleState.trainAngle = castleState.targetAngle;
          } else {
            castleState.trainAngle = normalizeAngle(
              castleState.trainAngle + Math.sign(angleDiff) * maxStep
            );
          }
        }
      } else if (!minigameRunning) {
        // Slowly and continuously drive around the circular track (R = 74m)
        var cruiseSpeedRad = 0.21; // ~30 seconds per full magical lap around the 8 gates
        castleState.trainAngle = normalizeAngle(
          castleState.trainAngle + dirSign * cruiseSpeedRad * dt
        );
        castleState.targetAngle = castleState.trainAngle;

        // Automatically detect which Gate the locomotive is currently passing and illuminate it!
        var closestIdx = castleState.selectedStopIdx;
        var minGateAngleDist = 999;
        for (var gi = 0; gi < CASTLE_STOPS.length; gi++) {
          var gDist = Math.abs(shortestAngleDiff(castleState.trainAngle, CASTLE_STOPS[gi].angle));
          if (gDist < minGateAngleDist) {
            minGateAngleDist = gDist;
            closestIdx = gi;
          }
        }
        if (closestIdx !== castleState.selectedStopIdx) {
          castleState.selectedStopIdx = closestIdx;
          updateCastleHUD();
        }
      }

      // 2. Position Locomotive and all Coaches along the Circular Track (R_TRACK = 74m)
      var locoAngle = castleState.trainAngle;
      var lx = INT_CENTER.x + Math.sin(locoAngle) * R_TRACK;
      var lz = INT_CENTER.z + Math.cos(locoAngle) * R_TRACK;
      var ly = INT_CENTER.y + 0.35;

      var tx = Math.cos(locoAngle) * dirSign;
      var tz = -Math.sin(locoAngle) * dirSign;

      playerLoco.position.set(lx, ly, lz);
      playerLoco.lookAt(lx + tx, ly, lz + tz);
      playerLoco.updateMatrixWorld(true);

      if (typeof trainHeadLight !== 'undefined' && trainHeadLight) {
        trainHeadLight.position.set(lx + tx * 2, ly + 3.2, lz + tz * 2);
      }

      if (typeof playerCoaches !== 'undefined' && Array.isArray(playerCoaches)) {
        for (var c = 0; c < playerCoaches.length; c++) {
          var coach = playerCoaches[c];
          if (!coach) continue;
          var arcDist = 6.2 + c * 5.2;
          var dTheta = (arcDist / R_TRACK) * dirSign;
          var cAngle = locoAngle - dTheta;
          var cx = INT_CENTER.x + Math.sin(cAngle) * R_TRACK;
          var cz = INT_CENTER.z + Math.cos(cAngle) * R_TRACK;
          var ctxVec = Math.cos(cAngle) * dirSign;
          var ctzVec = -Math.sin(cAngle) * dirSign;

          coach.position.set(cx, ly, cz);
          coach.lookAt(cx + ctxVec, ly, cz + ctzVec);
          coach.updateMatrixWorld(true);
        }
      }

      // 3. Animate Central Magical Crystal Tree, Singing Fountains, Inner Square Lantern Orbs & Fireflies
      for (var k = 0; k < castleState.crystalMeshes.length; k++) {
        var crMesh = castleState.crystalMeshes[k];
        var ud = crMesh.userData;
        var a = ud.baseAngle + timeNow * 0.55;
        crMesh.position.set(
          Math.cos(a) * ud.radius,
          ud.baseY + Math.sin(timeNow * 2.2 + ud.phase) * 1.4,
          Math.sin(a) * ud.radius
        );
        crMesh.rotation.y = timeNow * 1.8;
        crMesh.rotation.x = timeNow * 0.9;
      }

      for (var f = 0; f < castleState.fountainDrops.length; f++) {
        var drop = castleState.fountainDrops[f];
        var fud = drop.userData;
        fud.progress = (fud.progress + dt * 0.65) % 1.0;
        var pDrop = fud.progress;
        var jetAngle = (fud.jetIndex / 8) * TWO_PI + timeNow * 0.25;
        var rNow = 15.5 - pDrop * 10.5;
        var yNow = 0.8 + Math.sin(pDrop * Math.PI) * 9.5;
        drop.position.set(Math.cos(jetAngle) * rNow, yNow, Math.sin(jetAngle) * rNow);
      }

      for (var lo = 0; lo < castleState.interiorLanternOrbs.length; lo++) {
        var orb = castleState.interiorLanternOrbs[lo];
        var oud = orb.userData;
        orb.position.y = oud.baseY + Math.sin(timeNow * 2.6 + oud.phase) * 0.65;
        orb.rotation.y = timeNow * 1.5 + oud.phase;
      }

      for (var ff = 0; ff < castleState.interiorFireflies.length; ff++) {
        var fly = castleState.interiorFireflies[ff];
        var ffUd = fly.userData;
        var ffAng = ffUd.baseAngle + timeNow * ffUd.speed;
        fly.position.set(
          Math.sin(ffAng) * ffUd.radius,
          ffUd.baseY + Math.sin(timeNow * 2.4 + ffUd.phase) * 1.8,
          Math.cos(ffAng) * ffUd.radius
        );
      }

      // 4. Illuminate the Gate that the train is currently passing!
      for (var gIdx = 0; gIdx < castleState.gateObjects.length; gIdx++) {
        var go = castleState.gateObjects[gIdx];
        var isSel = gIdx === castleState.selectedStopIdx;
        var pulse = isSel ? 1.25 + Math.sin(timeNow * 6.5) * 0.35 : 0.35;
        go.mainMat.emissiveIntensity = pulse;
        go.portalMat.opacity = isSel ? 0.88 + Math.sin(timeNow * 7.0) * 0.12 : 0.38;
        var targetScale = isSel ? 1.18 + Math.sin(timeNow * 5.0) * 0.04 : 0.92;
        go.boardMesh.scale.set(targetScale, targetScale, 1);
      }

      // 5. Magical Panoramic Camera:
      //    Positioned in a floating chordal vantage point behind the train over the inner square
      //    so the frame simultaneously captures:
      //    - The Inner Square & Magical Crystal Tree with Singing Fountains (center-right)
      //    - The Train + Coaches cruising along the circular track (center-left)
      //    - The Illuminated Minigame Gate & Live Picture Billboard (ahead of the locomotive)
      var camDiff = shortestAngleDiff(castleState.cameraAngle, castleState.trainAngle);
      castleState.cameraAngle = normalizeAngle(castleState.cameraAngle + camDiff * Math.min(1, dt * 4.5));

      var floatSwayR = Math.cos(timeNow * 0.65) * 2.8;
      var floatSwayY = Math.sin(timeNow * 0.85) * 1.8;
      var R_CAM = 48 + floatSwayR;
      var camOffsetAngle = castleState.cameraAngle - 0.92 * dirSign;
      var camX = INT_CENTER.x + Math.sin(camOffsetAngle) * R_CAM;
      var camZ = INT_CENTER.z + Math.cos(camOffsetAngle) * R_CAM;
      var camY = INT_CENTER.y + 24.5 + floatSwayY;

      var lookAngle = castleState.cameraAngle - 0.14 * dirSign;
      var R_LOOK = 42;
      var lookX = INT_CENTER.x + Math.sin(lookAngle) * R_LOOK;
      var lookZ = INT_CENTER.z + Math.cos(lookAngle) * R_LOOK;
      var lookY = INT_CENTER.y + 10.5 + Math.sin(timeNow * 0.55) * 0.8;

      camera.fov = 52;
      camera.updateProjectionMatrix();
      camera.position.set(camX, camY, camZ);
      camera.lookAt(lookX, lookY, lookZ);
      // NOTE: Do NOT copy interior camera.position (z = -1800) into window.smoothCamPos!
      // Keeping window.smoothCamPos in city coordinates prevents the city camera spring from flying across the map on exit.
    }
  }

  // ==========================================================================
  // 7. INPUT HOOKS (KEYBOARD, TV REMOTE & MOBILE WHEEL OVERRIDE INSIDE CASTLE)
  // ==========================================================================
  function setupCastleControls() {
    window.addEventListener(
      'keydown',
      function (e) {
        if (!castleState.isInside && !castleState.isTransitioning) return;
        if (window.SamaDiraMinigame && window.SamaDiraMinigame.isActive()) return;

        var code = e.keyCode || e.which;
        if (e.key === 'ArrowLeft' || code === 37) {
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(-1);
        } else if (e.key === 'ArrowRight' || code === 39) {
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(1);
        } else if (e.key === 'ArrowUp' || code === 38) {
          e.preventDefault();
          e.stopPropagation();
          activateSelectedCastleGate();
        } else if (e.key === 'ArrowDown' || code === 40) {
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(-1);
        } else if (e.key === 'Enter' || e.key === ' ' || code === 13) {
          e.preventDefault();
          e.stopPropagation();
          activateSelectedCastleGate();
        } else if (
          e.key === 'Escape' ||
          e.key === 'Backspace' ||
          code === 27 ||
          code === 8 ||
          code === 10009 ||
          code === 461
        ) {
          e.preventDefault();
          e.stopPropagation();
          exitAdventureCastleToCity();
        }
      },
      true
    );

    var wLeft = document.getElementById('wheel-left');
    var wRight = document.getElementById('wheel-right');
    var wUp = document.getElementById('wheel-up');
    var wDown = document.getElementById('wheel-down');
    var wOk = document.getElementById('wheel-ok');

    if (wLeft) {
      wLeft.addEventListener(
        'pointerdown',
        function (e) {
          if (!castleState.isInside && !castleState.isTransitioning) return;
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(-1);
        },
        true
      );
    }
    if (wRight) {
      wRight.addEventListener(
        'pointerdown',
        function (e) {
          if (!castleState.isInside && !castleState.isTransitioning) return;
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(1);
        },
        true
      );
    }
    if (wUp) {
      wUp.addEventListener(
        'pointerdown',
        function (e) {
          if (!castleState.isInside && !castleState.isTransitioning) return;
          e.preventDefault();
          e.stopPropagation();
          activateSelectedCastleGate();
        },
        true
      );
    }
    if (wDown) {
      wDown.addEventListener(
        'pointerdown',
        function (e) {
          if (!castleState.isInside && !castleState.isTransitioning) return;
          e.preventDefault();
          e.stopPropagation();
          stepCastleGate(-1);
        },
        true
      );
    }
    if (wOk) {
      wOk.addEventListener(
        'pointerdown',
        function (e) {
          if (!castleState.isInside && !castleState.isTransitioning) return;
          e.preventDefault();
          e.stopPropagation();
          activateSelectedCastleGate();
        },
        true
      );
    }
  }

  // ==========================================================================
  // 8. INITIALIZATION & SAFE RENDER LOOP HOOK (NO PROTOTYPE.RENDER CRASH!)
  // ==========================================================================
  function initAdventureCastle() {
    if (castleState.initialized) return;
    if (typeof THREE === 'undefined' || typeof scene === 'undefined' || typeof renderer === 'undefined') {
      setTimeout(initAdventureCastle, 120);
      return;
    }

    castleState.initialized = true;
    setupVietnamTropicalSeaAndRemoveSeaTrees();
    registerCastleTracks();
    buildExteriorCastle();
    buildInteriorRondel();
    createCastleHUD();
    setupCastleControls();

    var prevRender = renderer.render;
    var lastFrameMs = performance.now();

    renderer.render = function (sc, cam) {
      var nowMs = performance.now();
      var dt = Math.min(0.1, Math.max(0.001, (nowMs - lastFrameMs) * 0.001));
      lastFrameMs = nowMs;

      if (castleState.isInside && sc === scene && cam === camera) {
        updateAdventureCastleFrame(dt);
        // Temporarily mark inSubway = true during prevRender so models.js camera enhancer
        // leaves our interior Castle Rondel camera untouched, then immediately restore it!
        var savedSub = typeof window.pState !== 'undefined' && window.pState ? window.pState.inSubway : false;
        if (typeof window.pState !== 'undefined' && window.pState) {
          window.pState.inSubway = true;
        }
        var res = prevRender.call(this, sc, cam);
        if (typeof window.pState !== 'undefined' && window.pState) {
          window.pState.inSubway = savedSub;
        }
        if (window.undergroundWorldGroup) {
          window.undergroundWorldGroup.visible = false;
        }
        return res;
      }

      if (sc === scene && cam === camera) {
        updateAdventureCastleFrame(dt);
      }
      return prevRender.call(this, sc, cam);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdventureCastle);
  } else {
    setTimeout(initAdventureCastle, 60);
  }
})();
