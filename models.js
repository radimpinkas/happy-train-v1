// ============================================================================
// MODULE 3: MODELS.JS (Refined Scale 2.5D Storybook Train Toby, Wagons, Charlie Helicopter,
// Rounded Cars on Complete Road Network, Terrain-Grounded Landmarks & Night/Tunnel Lights)
// ============================================================================

window.nightGlowMaterials = [];
window.wavingHumans = [];

function terrainY(x, z) {
  return window.getTerrainHeight ? window.getTerrainHeight(x, z) : 0;
}

function addContactShadow(group, width, length, yOffset) {
  if (!window.contactShadowTex) return;
  var sm = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshBasicMaterial({
      map: window.contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.70
    })
  );
  sm.rotation.x = -Math.PI / 2;
  sm.position.y = yOffset !== undefined ? yOffset : 0.06;
  group.add(sm);
}

window.createCartoonFacePlane = function(width, height, bgHex, styleOpt) {
  var c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');

  if (bgHex && bgHex !== 'transparent') {
    ctx.fillStyle = bgHex;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(6, 6, 244, 244, 36);
    else ctx.rect(6, 6, 244, 244);
    ctx.fill();
    ctx.stroke();
  }

  [74, 182].forEach(function(ex) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(ex, 92, 34, 43, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = '#0f172a'; ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.ellipse(ex + 3, 98, 17, 22, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(ex - 5, 86, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + 9, 108, 3.5, 0, Math.PI * 2); ctx.fill();
  });

  if (styleOpt === 'mini_grille') {
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(128, 134, 42, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (styleOpt === 'bus_grille') {
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.fillRect(88, 114, 80, 34);
    ctx.strokeRect(88, 114, 80, 34);
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(128, 162, 52, 0.08 * Math.PI, 0.92 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#0f172a'; ctx.stroke();

  var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  );
};

// ============================================================================
// STORYBOOK 2.5D PINE TREES, BLOSSOM TREES & BUSHES (Grounded on 3D Terrain!)
// ============================================================================
var pineTextures = [];
function getStorybookPineTexture(variantIdx) {
  if (pineTextures[variantIdx]) return pineTextures[variantIdx];
  var c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  var ctx = c.getContext('2d');

  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(114, 312);
  ctx.lineTo(120, 230);
  ctx.lineTo(136, 230);
  ctx.lineTo(142, 312);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  var topCols = ['#10b981', '#059669', '#34d399'];
  var midCols = ['#047857', '#065f46', '#047857'];
  var botCols = ['#064e3b', '#022c22', '#065f46'];

  function drawTier(apexY, baseY, halfW, fillCol) {
    var grad = ctx.createLinearGradient(128 - halfW, apexY, 128 + halfW, baseY);
    grad.addColorStop(0, topCols[variantIdx % 3]);
    grad.addColorStop(0.55, fillCol);
    grad.addColorStop(1, botCols[variantIdx % 3]);
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(128, apexY);
    ctx.quadraticCurveTo(128 - halfW * 0.45, (apexY + baseY) * 0.5, 128 - halfW, baseY - 8);
    ctx.lineTo(128 - halfW * 0.65, baseY - 18);
    ctx.lineTo(128 - halfW * 0.48, baseY + 4);
    ctx.lineTo(128 - halfW * 0.22, baseY - 12);
    ctx.lineTo(128, baseY + 8);
    ctx.lineTo(128 + halfW * 0.22, baseY - 12);
    ctx.lineTo(128 + halfW * 0.48, baseY + 4);
    ctx.lineTo(128 + halfW * 0.65, baseY - 18);
    ctx.lineTo(128 + halfW, baseY - 8);
    ctx.quadraticCurveTo(128 + halfW * 0.45, (apexY + baseY) * 0.5, 128, apexY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawTier(140, 268, 96, midCols[variantIdx % 3]);
  drawTier( 78, 198, 76, midCols[(variantIdx + 1) % 3]);
  drawTier( 18, 128, 56, topCols[variantIdx % 3]);

  pineTextures[variantIdx] = window.upgradeCanvasTex(c);
  return pineTextures[variantIdx];
}

window.spawnStorybookPine = function(x, y, z, scale, variantIdx) {
  var g = new THREE.Group();
  var groundH = (y !== null && y !== undefined) ? y : terrainY(x, z);
  g.position.set(x, groundH, z);
  var sc = (scale || 1.0) * 0.82;
  g.scale.set(sc, sc, sc);

  var tex = getStorybookPineTexture(variantIdx || 0);
  var mat = new THREE.MeshLambertMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.35,
    side: THREE.DoubleSide
  });

  var p1 = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 11.5), mat);
  p1.position.y = 5.5;
  var p2 = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 11.5), mat);
  p2.position.y = 5.5;
  p2.rotation.y = Math.PI * 0.38;
  g.add(p1, p2);
  addContactShadow(g, 5.5, 5.5, 0.05);
  scene.add(g);
  return g;
};

window.spawnStorybookBlossomTree = function(x, y, z, style, scale) {
  var c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');

  if (style === 'pink_autumn') {
    ctx.strokeStyle = '#451a03';
    ctx.fillStyle = '#92400e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(114, 245);
    ctx.quadraticCurveTo(122, 185, 120, 145);
    ctx.lineTo(75, 102); ctx.lineTo(84, 94); ctx.lineTo(125, 134);
    ctx.lineTo(128, 88); ctx.lineTo(136, 88); ctx.lineTo(135, 134);
    ctx.lineTo(175, 96); ctx.lineTo(184, 105); ctx.lineTo(136, 148);
    ctx.quadraticCurveTo(136, 185, 144, 245);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var leafCols = ['#f472b6', '#fb923c', '#c084fc', '#facc15', '#f9a8d4'];
    for (var i = 0; i < 36; i++) {
      var ang = (i / 36) * Math.PI * 2;
      var rad = 18 + (i % 4) * 17;
      var lx = 128 + Math.cos(ang) * rad * 1.25;
      var ly = 104 + Math.sin(ang) * rad * 0.72;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(i * 1.7) * 0.6);
      ctx.fillStyle = leafCols[i % leafCols.length];
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(112, 245);
    ctx.quadraticCurveTo(122, 195, 120, 150);
    ctx.lineTo(92, 120); ctx.lineTo(102, 112); ctx.lineTo(128, 138);
    ctx.lineTo(156, 112); ctx.lineTo(166, 120); ctx.lineTo(138, 150);
    ctx.quadraticCurveTo(138, 195, 146, 245);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    var puffs = [[90, 110, 38], [166, 110, 38], [128, 86, 44], [72, 130, 30], [184, 130, 30], [128, 120, 42]];
    puffs.forEach(function(pf) {
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pf[0], pf[1], pf[2], 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    for (var b = 0; b < 22; b++) {
      var bx = 68 + ((b * 37) % 120);
      var by = 66 + ((b * 29) % 78);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var tex = window.upgradeCanvasTex(c);
  var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide });
  var g = new THREE.Group();
  g.position.set(x, terrainY(x, z), z);
  var sc = (scale || 1.0) * 0.85;
  g.scale.set(sc, sc, sc);

  var p1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat);
  p1.position.y = 4.8;
  var p2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat);
  p2.position.y = 4.8;
  p2.rotation.y = Math.PI * 0.28;
  g.add(p1, p2);
  addContactShadow(g, 5.2, 5.2, 0.05);
  scene.add(g);
  return g;
};

(function populateHeroViaductFoliage() {
  window.spawnStorybookBlossomTree(-52, null, -146, 'pink_autumn', 1.05);
  window.spawnStorybookBlossomTree( 24, null, -142, 'white_spring', 1.05);
  window.spawnStorybookBlossomTree(-85, null,  -25, 'pink_autumn', 1.0);
  window.spawnStorybookBlossomTree( 95, null,   45, 'white_spring', 1.0);

  var heroPines = [
    [-98, -168, 1.1, 0],
    [-68, -202, 1.2, 1],
    [-18, -204, 1.2, 2],
    [ 12, -202, 1.2, 0],
    [ 38, -198, 1.1, 1]
  ];
  heroPines.forEach(function(hp) {
    window.spawnStorybookPine(hp[0], null, hp[1], hp[2], hp[3]);
  });
})();

window.spawnPerson = function(x, y, z, shirtCol, hatCol, showHello, scale) {
  var g = new THREE.Group();
  var groundH = (y !== null && y !== undefined) ? y : terrainY(x, z);
  g.position.set(x, groundH, z);
  var sc = (scale || 1.35) * 0.82;
  g.scale.set(sc, sc, sc);
  var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.5, 12), new THREE.MeshStandardMaterial({ color: shirtCol }));
  torso.position.y = 1.2;
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde68a }));
  head.position.y = 2.3;
  var armPivot = new THREE.Group();
  armPivot.position.set(0.5, 1.7, 0);
  var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.0, 8), new THREE.MeshStandardMaterial({ color: shirtCol }));
  arm.position.set(0.25, 0.4, 0);
  armPivot.add(arm);
  g.add(torso, head, armPivot);
  if (hatCol) {
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.25, 10), new THREE.MeshStandardMaterial({ color: hatCol }));
    cap.position.y = 2.7;
    g.add(cap);
  }
  if (showHello) {
    var hSp = makeSign("👋 HELLO!", "#ffffff", "#0f172a", 6.0, 1.8);
    hSp.position.set(0, 3.8, 0);
    g.add(hSp);
  }
  scene.add(g);
  var obj = { group: g, armPivot: armPivot, phase: Math.random() * 6 };
  wavingHumans.push(obj);
  return obj;
};

// Build Stations & Depot
window.stationPhysicals = {};
physicalTracksToRender.forEach(function(e) {
  if (!e.station) return;
  var midPt = e.curve.getPointAt(0.50);
  var tan = e.curve.getTangentAt(0.50).normalize();
  var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  var ang = Math.atan2(tan.x, tan.z);

  if (e.station.type === 'depot') {
    var depotG = new THREE.Group();
    depotG.position.copy(midPt);
    depotG.rotation.y = ang;
    var wMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
    var wL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 10, 22), wMat); wL.position.set(-8.5, 5, 0);
    var wR = wL.clone(); wR.position.set(12.5, 5, 0);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(23, 1.8, 23), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    roof.position.set(2.0, 10.5, 0);
    var dSign = makeSign("🏗️ CENTRAL TRAIN DEPOT", "#0f172a", "#fde047", 22, 5.0);
    dSign.position.set(2.0, 15, 0);
    depotG.add(wL, wR, roof, dSign);
    scene.add(depotG);
    return;
  }

  if (e.station.type === 'station') {
    var platPos = midPt.clone().add(perp.clone().multiplyScalar(-8.2));
    var sg = new THREE.Group();
    sg.position.copy(platPos);
    sg.rotation.y = ang;
    // Station foundation pillar down to terrain if on a hillside
    var gY = terrainY(platPos.x, platPos.z);
    var fndH = Math.max(1.0, platPos.y - gY + 1.2);
    var fnd = new THREE.Mesh(new THREE.BoxGeometry(5.2, fndH, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    fnd.position.y = -fndH * 0.5 + 0.6;
    var plat = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
    plat.position.y = 0.5;
    var canopy = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.6, 16.5), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    canopy.position.y = 5.4;
    var sign = makeSign(e.station.emoji + ' ' + e.station.name, '#0f172a', '#fde047', 22, 5.0);
    sign.position.set(0, 9.0, 0);
    sg.add(fnd, plat, canopy, sign);
    scene.add(sg);

    var pax = [];
    for (var pi = 0; pi < 4; pi++) {
      var startDist = -7.6;
      var along = (pi - 1.5) * 2.6;
      var baseTrackPt = midPt.clone().add(tan.clone().multiplyScalar(along));
      var pPos = baseTrackPt.clone().add(perp.clone().multiplyScalar(startDist));
      var p = spawnPerson(pPos.x, midPt.y, pPos.z, [0xf472b6, 0x22c55e, 0xfacc15, 0x38bdf8][pi], null, false, 1.25);
      pax.push({ human: p, baseTrackPt: baseTrackPt, perp: perp.clone(), dist: startDist, boarded: false });
    }
    stationPhysicals[e.station.name] = { pax: pax, visitedThisEdge: false };
  }
});

// --- GRAND CENTRAL SQUARE WITH ANIMATED WATER FOUNTAIN ---
window.fountainDrops = [];
(function buildCentralFountainSquare() {
  var fGroup = new THREE.Group();
  var fx = 28, fz = -20;
  fGroup.position.set(fx, terrainY(fx, fz), fz);
  var plaza = new THREE.Mesh(new THREE.CylinderGeometry(15, 16, 0.6, 28), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
  plaza.position.y = 0.25;
  var basin = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.5, 1.6, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
  basin.position.y = 0.9;
  var centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 4.8, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  centerPillar.position.y = 2.4;
  var fSign = makeSign("⛲ GRAND FOUNTAIN SQUARE", "#0284c7", "#fde047", 20, 4.8);
  fSign.position.set(0, 10.5, 0);
  fGroup.add(plaza, basin, centerPillar, fSign);

  var dropGeo = new THREE.SphereGeometry(0.36, 6, 6);
  var dropMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
  for (var i = 0; i < 24; i++) {
    var d = new THREE.Mesh(dropGeo, dropMat);
    fGroup.add(d);
    fountainDrops.push({ mesh: d, angle: (i / 24) * Math.PI * 2, progress: (i / 24) });
  }
  scene.add(fGroup);
})();

// --- 2 AIRPORTS WITH TALKING AIRPLANES & RED HELICOPTER CHARLIE ---
window.aircraftList = [];
function buildAirport(x, z, name) {
  var ag = new THREE.Group();
  ag.position.set(x, terrainY(x, z), z);
  var runway = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 82), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  runway.position.y = 0.25;
  var tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 15, 14), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  tower.position.set(-12, 7.5, 0);
  var towerTop = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 2.6, 3.4, 14), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  towerTop.position.set(-12, 16, 0);
  var aSign = makeSign("✈️ " + name, "#0f172a", "#38bdf8", 22, 5.0);
  aSign.position.set(-12, 22, 0);
  ag.add(runway, tower, towerTop, aSign);
  scene.add(ag);
}
buildAirport(305, -155, "NORTH CITY AIRPORT");
buildAirport(305,  140, "SOUTH HARBOR AIRPORT");

// ============================================================================
// HERO CHARACTER #2: CHARLIE THE RED-AND-YELLOW HELICOPTER (Compact 0.58 Scale!)
// ============================================================================
function createTalkingHelicopter(name, bodyHex) {
  var g = new THREE.Group();
  g.scale.set(0.58, 0.58, 0.58);

  var cabinUpper = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 24, 20),
    new THREE.MeshStandardMaterial({ color: bodyHex || 0xef4444, roughness: 0.3 })
  );
  cabinUpper.scale.set(1.05, 0.88, 1.42);
  g.add(cabinUpper);

  var yellowBelly = new THREE.Mesh(
    new THREE.SphereGeometry(3.32, 22, 16, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.32 })
  );
  yellowBelly.scale.set(1.06, 0.88, 1.43);
  g.add(yellowBelly);

  [-3.25, 3.25].forEach(function(wx) {
    var sideWin = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
    );
    sideWin.scale.set(0.35, 0.85, 1.25);
    sideWin.position.set(wx, 0.45, 0.6);
    g.add(sideWin);
  });

  var frontCanopy = createCartoonFacePlane(3.6, 2.9, '#67e8f9');
  frontCanopy.position.set(0, 0.35, 4.82);
  frontCanopy.rotation.x = -0.12;
  g.add(frontCanopy);

  var skidMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.3 });
  [-1.95, 1.95].forEach(function(sx) {
    var skidBar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 7.6, 10), skidMat);
    skidBar.rotation.x = Math.PI / 2;
    skidBar.position.set(sx, -2.75, 0.4);
    var tipUp = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.22, 8, 12, Math.PI * 0.6), skidMat);
    tipUp.rotation.y = Math.PI / 2;
    tipUp.position.set(sx, -2.1, 4.1);

    var strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8), skidMat);
    strut1.position.set(sx * 0.85, -1.95, 1.8);
    var strut2 = strut1.clone();
    strut2.position.set(sx * 0.85, -1.95, -1.2);
    g.add(skidBar, tipUp, strut1, strut2);
  });

  var tailBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 1.35, 7.8, 14),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.32 })
  );
  tailBoom.rotation.x = Math.PI / 2;
  tailBoom.position.set(0, 0.45, -6.5);

  var tailStripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.35, 7.2),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  tailStripe.position.set(0, 0.2, -6.4);

  var tailFin = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 2.8, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  tailFin.position.set(0, 1.1, -9.9);
  tailFin.rotation.x = -0.25;
  g.add(tailBoom, tailStripe, tailFin);

  var mastDome = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.5, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  mastDome.position.y = 3.0;
  g.add(mastDome);

  var rotor = new THREE.Group();
  rotor.position.y = 3.65;
  for (var rb = 0; rb < 2; rb++) {
    var bGroup = new THREE.Group();
    bGroup.rotation.y = rb * Math.PI * 0.5;
    var whiteBlade = new THREE.Mesh(
      new THREE.BoxGeometry(14.5, 0.18, 1.15),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    var redTip1 = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.22, 1.18),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    redTip1.position.x = 6.2;
    var redTip2 = redTip1.clone();
    redTip2.position.x = -6.2;
    bGroup.add(whiteBlade, redTip1, redTip2);
    rotor.add(bGroup);
  }
  g.add(rotor);

  g.userData = { rotor: rotor, name: name };
  scene.add(g);
  return g;
}

function createTalkingAirplane(name) {
  var g = new THREE.Group();
  g.scale.set(0.68, 0.68, 0.68);
  var fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.8, 14, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  fuselage.rotation.x = Math.PI / 2;
  var wings = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 3.6), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
  var tailWing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.5, 2.8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  tailWing.position.set(0, 2.2, -5.8);
  var face = createCartoonFacePlane(2.8, 2.5, '#ffffff');
  face.position.set(0, 0.2, 7.05);
  g.add(fuselage, wings, tailWing, face);
  scene.add(g);
  return g;
}

window.heliCharlie = createTalkingHelicopter("Charlie the Helicopter", 0xef4444);
window.planeSky = createTalkingAirplane("Sky the Airplane");

// ============================================================================
// HERO ROAD VEHICLES (Refined 0.64 Scale, Clean Silhouette Without Giant Tags!)
// ============================================================================
window.livingVehicles = [];

function createCarWheelGroup(radius, width) {
  var wg = new THREE.Group();
  var tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 })
  );
  tire.rotation.z = Math.PI / 2;
  var rim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width + 0.08, 12),
    new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
  );
  rim.rotation.z = Math.PI / 2;
  wg.add(tire, rim);
  return wg;
}

function createLivingRoadVehicle(name, colHex, vehicleKind, loopIdx, startProgress) {
  var g = new THREE.Group();
  g.scale.set(0.64, 0.64, 0.64);
  var bodyMat = new THREE.MeshStandardMaterial({ color: colHex, roughness: 0.28, metalness: 0.08 });
  var cyanGlassMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
  var darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  if (vehicleKind === 'mini') {
    var carShape = new THREE.Shape();
    carShape.moveTo(-2.6, 0.55);
    carShape.quadraticCurveTo(-2.8, 1.6, -2.1, 1.9);
    carShape.quadraticCurveTo(-1.4, 3.15, -0.2, 3.2);
    carShape.lineTo(1.1, 3.15);
    carShape.quadraticCurveTo(2.0, 3.0, 2.35, 1.85);
    carShape.quadraticCurveTo(2.75, 1.5, 2.65, 0.55);
    carShape.closePath();

    var extCar = new THREE.ExtrudeGeometry(carShape, {
      depth: 2.7,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.30,
      bevelSegments: 3,
      curveSegments: 16
    });
    extCar.translate(0, 0, -1.35);
    extCar.rotateY(-Math.PI / 2);
    var bodyMesh = new THREE.Mesh(extCar, bodyMat);
    bodyMesh.castShadow = true;
    g.add(bodyMesh);

    var sideGlass = new THREE.Mesh(new THREE.BoxGeometry(3.18, 1.05, 2.35), cyanGlassMat);
    sideGlass.position.set(0, 2.35, -0.35);
    g.add(sideGlass);

    var frontWin = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 1.15), cyanGlassMat);
    frontWin.position.set(0, 2.35, 1.38);
    frontWin.rotation.x = -0.38;
    g.add(frontWin);

    var miniFace = createCartoonFacePlane(2.55, 1.55, 'transparent', 'mini_grille');
    miniFace.position.set(0, 1.25, 2.98);
    g.add(miniFace);

    [[-1.55, 1.55], [1.55, 1.55], [-1.55, -1.55], [1.55, -1.55]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.82, 0.52);
      wh.position.set(wp[0], 0.82, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 4.4, 6.6, 0.06);

  } else if (vehicleKind === 'bus') {
    var cabinBox = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 6.8), bodyMat);
    cabinBox.position.set(0, 2.2, -0.6);
    cabinBox.castShadow = true;
    var roofCap = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, 6.7, 16, 1, false, 0, Math.PI), bodyMat);
    roofCap.rotation.z = Math.PI / 2;
    roofCap.rotation.y = Math.PI / 2;
    roofCap.position.set(0, 3.7, -0.6);

    var noseHood = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.75, 2.1), bodyMat);
    noseHood.position.set(0, 1.48, 3.4);

    var stripe1 = new THREE.Mesh(new THREE.BoxGeometry(3.58, 0.22, 6.82), darkTrimMat);
    stripe1.position.set(0, 1.85, -0.6);
    var stripe2 = stripe1.clone();
    stripe2.position.set(0, 1.45, -0.6);

    for (var wi = 0; wi < 5; wi++) {
      var wPane = new THREE.Mesh(new THREE.BoxGeometry(3.62, 1.05, 0.98), cyanGlassMat);
      wPane.position.set(0, 2.75, -3.1 + wi * 1.25);
      g.add(wPane);
    }

    var busWin = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.15), cyanGlassMat);
    busWin.position.set(0, 2.85, 2.84);
    g.add(busWin);

    var busFace = createCartoonFacePlane(2.9, 1.75, 'transparent', 'bus_grille');
    busFace.position.set(0, 1.45, 4.52);
    g.add(cabinBox, roofCap, noseHood, stripe1, stripe2, busFace);

    [[-1.75, 2.5], [1.75, 2.5], [-1.75, -2.4], [1.75, -2.4]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.95, 0.6);
      wh.position.set(wp[0], 0.95, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 5.2, 9.8, 0.06);

  } else {
    var vanCargo = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.35, 5.4), bodyMat);
    vanCargo.position.set(0, 2.3, -0.7);
    vanCargo.castShadow = true;
    var vanNose = new THREE.Mesh(new THREE.BoxGeometry(3.15, 1.75, 2.0), bodyMat);
    vanNose.position.set(0, 1.5, 2.6);
    var vanBumper = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.55, 0.6), darkTrimMat);
    vanBumper.position.set(0, 0.78, 3.5);

    var vanWinFront = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.25), cyanGlassMat);
    vanWinFront.position.set(0, 2.8, 2.04);
    vanWinFront.rotation.x = -0.22;
    var vanWinSide = new THREE.Mesh(new THREE.BoxGeometry(3.48, 1.15, 1.55), cyanGlassMat);
    vanWinSide.position.set(0, 2.75, 0.85);

    var vanFace = createCartoonFacePlane(2.85, 1.7, 'transparent', 'bus_grille');
    vanFace.position.set(0, 1.45, 3.68);
    g.add(vanCargo, vanNose, vanBumper, vanWinFront, vanWinSide, vanFace);

    [[-1.7, 2.1], [1.7, 2.1], [-1.7, -2.1], [1.7, -2.1]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.92, 0.58);
      wh.position.set(wp[0], 0.92, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 4.8, 8.6, 0.06);
  }

  scene.add(g);
  return {
    mesh: g,
    name: name,
    kind: vehicleKind,
    loopIdx: loopIdx,
    progress: startProgress,
    speed: vehicleKind === 'bus' ? 0.00088 : 0.00096
  };
}

// Spawn 18 Friendly Storybook Vehicles across the Complete Connected Road Network (9 per loop)!
livingVehicles.push(createLivingRoadVehicle("🚗 Ruby Red Car",       0xef4444, 'mini', 0, 0.02));
livingVehicles.push(createLivingRoadVehicle("🚌 Buster School Bus",  0xfacc15, 'bus',  0, 0.13));
livingVehicles.push(createLivingRoadVehicle("🚐 Willy White Van",    0xf8fafc, 'van',  0, 0.24));
livingVehicles.push(createLivingRoadVehicle("🚕 Sunny City Taxi",    0xf97316, 'mini', 0, 0.35));
livingVehicles.push(createLivingRoadVehicle("🚙 Sky Blue Coupe",     0x38bdf8, 'mini', 0, 0.46));
livingVehicles.push(createLivingRoadVehicle("🚐 Berry Ice-Cream Van",0xf472b6, 'van',  0, 0.57));
livingVehicles.push(createLivingRoadVehicle("🚗 Minty Green Mini",   0x10b981, 'mini', 0, 0.68));
livingVehicles.push(createLivingRoadVehicle("🚌 City Express Bus",   0xf59e0b, 'bus',  0, 0.79));
livingVehicles.push(createLivingRoadVehicle("🚙 Violet Roadster",    0xa855f7, 'mini', 0, 0.90));

livingVehicles.push(createLivingRoadVehicle("🚙 Barnaby Blue Car",   0x0284c7, 'mini', 1, 0.05));
livingVehicles.push(createLivingRoadVehicle("🚐 Postman Red Van",    0xdc2626, 'van',  1, 0.16));
livingVehicles.push(createLivingRoadVehicle("🚌 Sunny School Bus",   0xeab308, 'bus',  1, 0.27));
livingVehicles.push(createLivingRoadVehicle("🚗 Pippa Green Car",    0x22c55e, 'mini', 1, 0.38));
livingVehicles.push(createLivingRoadVehicle("🚕 Golden Cab",         0xfbbf24, 'mini', 1, 0.49));
livingVehicles.push(createLivingRoadVehicle("🚐 Bakery Delivery Van",0xfed7aa, 'van',  1, 0.60));
livingVehicles.push(createLivingRoadVehicle("🚗 Coral Pink Mini",    0xfb7185, 'mini', 1, 0.71));
livingVehicles.push(createLivingRoadVehicle("🚌 Meadow Tour Bus",    0x4ade80, 'bus',  1, 0.82));
livingVehicles.push(createLivingRoadVehicle("🚙 Indigo Family Car",  0x6366f1, 'mini', 1, 0.93));

// --- FLOWERS, BEES & BUTTERFLIES (Grounded on 3D Terrain!) ---
var flowerPositions = [];
var petalColors = [0xffffff, 0xf472b6, 0xfacc15, 0x38bdf8, 0xffffff, 0xc084fc];
var stemMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
var centerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

for (var fi = 0; fi < 190; fi++) {
  var fx = (Math.random() - 0.5) * 520;
  var fz = (Math.random() - 0.5) * 520;
  if (isNearTrack(fx, fz, 10.0) || Math.abs(fz + 85) < 26) continue;
  var fy = terrainY(fx, fz);
  var fg = new THREE.Group();
  fg.position.set(fx, fy, fz);
  var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 5), stemMat); stem.position.y = 0.45;
  var center = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), centerMat); center.position.y = 0.95;
  var pMat = new THREE.MeshBasicMaterial({ color: petalColors[fi % petalColors.length] });
  for (var pi2 = 0; pi2 < 6; pi2++) {
    var pa2 = (pi2 / 6) * Math.PI * 2;
    var petal = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), pMat);
    petal.scale.set(1, 0.35, 1);
    petal.position.set(Math.cos(pa2) * 0.46, 0.92, Math.sin(pa2) * 0.46);
    fg.add(petal);
  }
  fg.add(stem, center);
  scene.add(fg);
  if (flowerPositions.length < 48) flowerPositions.push(new THREE.Vector3(fx, fy + 1.6, fz));
}

window.flyingInsects = [];
var beeYellow = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
var beeBlack = new THREE.MeshBasicMaterial({ color: 0x0f172a });
var beeWingMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.75, side: THREE.DoubleSide });

flowerPositions.forEach(function(fPos, idx) {
  var isButterfly = idx % 2 === 0;
  var ig = new THREE.Group();
  ig.position.copy(fPos);
  if (isButterfly) {
    var bCol = [0xf43f5e, 0x38bdf8, 0xa855f7, 0xf97316, 0xfacc15][idx % 5];
    var wMat = new THREE.MeshBasicMaterial({ color: bCol, side: THREE.DoubleSide });
    var wL = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), wMat); wL.position.x = -0.48;
    var wR = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), wMat); wR.position.x = 0.48;
    ig.add(wL, wR);
    ig.userData = { wL: wL, wR: wR };
  } else {
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), beeYellow); body.scale.set(1, 1, 1.4);
    var stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.26, 8), beeBlack); stripe.rotation.x = Math.PI / 2;
    var wL2 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), beeWingMat); wL2.position.set(-0.35, 0.32, 0);
    var wR2 = wL2.clone(); wR2.position.set(0.35, 0.32, 0);
    ig.add(body, stripe, wL2, wR2);
    ig.userData = { wL: wL2, wR: wR2 };
  }
  scene.add(ig);
  flyingInsects.push({ mesh: ig, basePos: fPos.clone(), phase: idx * 0.9, speed: 1.5 + (idx % 3) * 0.4 });
});

function createDetailedAnimal(type) {
  var g = new THREE.Group();
  g.scale.set(0.82, 0.82, 0.82);
  if (type === 'sheep') {
    var woolMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    [[0,1.4,0,1.15], [0,1.5,0.7,0.95], [0,1.5,-0.7,0.95], [-0.55,1.4,0,0.85], [0.55,1.4,0,0.85]].forEach(function(s) {
      var puff = new THREE.Mesh(new THREE.SphereGeometry(s[3], 10, 10), woolMat);
      puff.position.set(s[0], s[1], s[2]); g.add(puff);
    });
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 10), darkMat);
    head.scale.set(0.9, 0.95, 1.25); head.position.set(0, 1.85, 1.45);
    g.add(head);
  } else if (type === 'cow') {
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.45, 3.1), whiteMat); body.position.y = 1.55;
    var patch1 = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.85, 1.1), blackMat); patch1.position.set(0, 1.7, 0.3);
    var head = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.25), whiteMat); head.position.set(0, 2.25, 1.85);
    var face = createCartoonFacePlane(1.1, 1.0, '#f472b6'); face.position.set(0, 2.25, 2.5);
    g.add(body, patch1, head, face);
  } else {
    var yelMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 2.9), yelMat); body.position.y = 2.2;
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.58, 4.6, 8), yelMat); neck.position.set(0, 4.4, 1.35);
    g.add(body, neck);
  }
  return g;
}

window.daisyTheCow = createDetailedAnimal('cow');
daisyTheCow.position.set(175, terrainY(175, -185), -185);
var daisySign = makeSign("🐄 Daisy the Friendly Cow", "#14532d", "#fde047", 17, 4.0);
daisySign.position.set(0, 5.2, 0);
daisyTheCow.add(daisySign);
scene.add(daisyTheCow);

window.trackSheepFlocks = [];
[
  { edgeId: 'J_SOUTH->J_SW', t: 0.25 },
  { edgeId: 'J_SE->J_SOUTH', t: 0.25 }
].forEach(function(cfg) {
  var e = edges.find(function(ed) { return ed.id === cfg.edgeId; });
  if (!e) return;
  var pt = e.curve.getPointAt(cfg.t);
  var tan = e.curve.getTangentAt(cfg.t).normalize();
  var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  var flockG = new THREE.Group();
  flockG.position.copy(pt);
  for (var s = 0; s < 4; s++) {
    var sh = createDetailedAnimal('sheep');
    sh.position.set((s - 1.5) * 1.6, 0, (s % 2) * 1.3);
    flockG.add(sh);
  }
  scene.add(flockG);
  trackSheepFlocks.push({ group: flockG, basePos: pt.clone(), perp: perp, offsetDist: 0, scattering: false, honked: false });
});

// Houses with Night-Glowing Windows & Foundation Base on Sloped Hills!
var sharedWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
nightGlowMaterials.push(sharedWindowMat);

function buildHouse(x, y, z, w, d, h, wallCol, roofCol, title) {
  if (isNearTrack(x, z, Math.max(w, d) * 0.75 + 11)) return;
  var g = new THREE.Group();
  var groundH = terrainY(x, z);
  g.position.set(x, groundH, z);
  g.scale.set(0.84, 0.84, 0.84);

  // Stone foundation plinth so houses sit level on sloped hills without floating corners
  var plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 3.0, d + 0.6), new THREE.MeshStandardMaterial({ color: 0x64748b }));
  plinth.position.y = -1.2;
  var walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: wallCol, roughness: 0.75 }));
  walls.position.y = h / 2; walls.castShadow = true;
  var roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.55, 4), new THREE.MeshStandardMaterial({ color: roofCol }));
  roof.position.y = h + h * 0.27; roof.rotation.y = Math.PI / 4;
  var w1 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.3, 0.3), sharedWindowMat);
  w1.position.set(-w * 0.26, h * 0.6, d / 2 + 0.1);
  var w2 = w1.clone(); w2.position.set(w * 0.26, h * 0.6, d / 2 + 0.1);
  g.add(plinth, walls, roof, w1, w2);
  if (title) {
    var sp = makeSign(title, '#0f172a', '#fde047', 21, 4.8);
    sp.position.set(0, h + 7.5, 0);
    g.add(sp);
  }
  scene.add(g);
}

buildHouse(-195, 0, -245, 16, 12, 9, 0xfef08a, 0xdc2626, "🏡 MOM & DAD'S HOUSE");
spawnPerson(-185, null, -230, 0xec4899, null, true, 1.5);
spawnPerson(-181, null, -230, 0x2563eb, null, true, 1.55);

buildHouse(195, 0, -235, 16, 12, 8.5, 0xfed7aa, 0x9a3412, "👵 GRANDMA & GRANDPA'S");
spawnPerson(185, null, -220, 0xa855f7, null, true, 1.5);
spawnPerson(189, null, -220, 0x15803d, null, true, 1.55);

buildHouse(115, 0, -255, 22, 14, 11, 0xfb923c, 0xb91c1c, "🏫 SUNNY SCHOOL");
buildHouse(165, 0, -255, 18, 13, 9.5, 0xf472b6, 0x831843, "🎠 KINDERGARTEN");
buildHouse(255, 0,  225, 26, 16, 11, 0x3b82f6, 0x1e3a8a, "🛒 MEGA HYPERMARKET");

// Lush Forest Park with 2.5D Storybook Pine Trees grounded on terrain
for (var ti2 = 0; ti2 < 80; ti2++) {
  var tx = -330 + (ti2 % 12) * 18;
  var tz = -110 + Math.floor(ti2 / 12) * 28;
  if (isNearTrack(tx, tz, 13) || Math.abs(tz + 85) < 26) continue;
  window.spawnStorybookPine(tx, null, tz, 0.92 + (ti2 % 3) * 0.14, ti2 % 3);
}

var wCols = [0xfef08a, 0xbae6fd, 0xfbcfe8, 0xfed7aa, 0xd9f99d];
var rCols = [0xdc2626, 0x1d4ed8, 0x047857, 0x7c2d12, 0x6d28d9];
for (var hx = -210; hx <= 210; hx += 58) {
  for (var hz = -170; hz <= 190; hz += 58) {
    if (Math.abs(hz + 85) < 30 || Math.hypot(hx, hz) < 48) continue;
    var ci = Math.abs(Math.floor(hx + hz)) % wCols.length;
    buildHouse(hx, 0, hz, 10, 9, 7.5 + (ci % 3) * 1.5, wCols[ci], rCols[ci], null);
  }
}

// Sparkling Blue River sitting inside the carved River Valley at z = -85
var river = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 34),
  new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.22 })
);
river.rotation.x = -Math.PI / 2;
river.position.set(0, -0.35, -85);
scene.add(river);

window.boats = [];
for (var bi = 0; bi < 5; bi++) {
  var bg = new THREE.Group();
  bg.scale.set(0.80, 0.80, 0.80);
  var hull = new THREE.Mesh(new THREE.BoxGeometry(8, 1.8, 3.8), new THREE.MeshStandardMaterial({ color: [0xffffff, 0xef4444, 0xfacc15][bi % 3] }));
  hull.position.y = 0.6;
  var sail = new THREE.Mesh(new THREE.ConeGeometry(2.8, 7.5, 3), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  sail.position.set(0, 4.9, 0);
  bg.add(hull, sail);
  scene.add(bg);
  boats.push({ mesh: bg, x: -240 + bi * 95, dir: bi % 2 === 0 ? 1 : -1, speed: 0.22 });
}

window.windmillBlades = new THREE.Group();
var wmG = new THREE.Group();
wmG.position.set(-150, terrainY(-150, 260), 260);
var wmTower = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 6.2, 22, 12), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
wmTower.position.y = 11;
windmillBlades.position.set(0, 19, 4.3);
for (var wi = 0; wi < 4; wi++) {
  var bl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 13, 0.3), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  bl.position.y = 6.5;
  var pv = new THREE.Group(); pv.rotation.z = (wi * Math.PI) / 2; pv.add(bl);
  windmillBlades.add(pv);
}
wmG.add(wmTower, windmillBlades);
scene.add(wmG);

window.soccerPlayers = [];
var stadG = new THREE.Group();
stadG.position.set(-245, terrainY(-245, 235), 235);
var pitch = new THREE.Mesh(new THREE.CylinderGeometry(24, 25, 1.2, 28), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
pitch.position.y = 0.3;
window.soccerBall = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
soccerBall.position.y = 1.4;
stadG.add(pitch, soccerBall);
for (var spi = 0; spi < 6; spi++) {
  var spMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 8), new THREE.MeshStandardMaterial({ color: spi < 3 ? 0xef4444 : 0x2563eb }));
  spMesh.position.y = 1.6;
  stadG.add(spMesh);
  soccerPlayers.push({ mesh: spMesh, angle: (spi / 6) * Math.PI * 2, radius: 7 + (spi % 2) * 6 });
}
var stSign = makeSign("⚽ FOOTBALL STADIUM", "#064e3b", "#fde047", 21, 4.8);
stSign.position.set(0, 14, 0);
stadG.add(stSign);
scene.add(stadG);

window.activeCrossings = [];
window.roadVehicles = [];
window.railwaySignals = {};
Object.keys(nodes).forEach(function(k, idx) {
  var n = nodes[k];
  if (n.isExit) return;
  var sg = new THREE.Group();
  // Place railway signal neatly beside the outer track so it NEVER stands on the rails!
  sg.position.set(n.pos.x - 7.5, n.pos.y, n.pos.z + 7.5);
  sg.scale.set(0.76, 0.76, 0.76);
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  pole.position.y = 3.5;
  var box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.8, 1.3), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  box.position.y = 7.2;
  var redL = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), new THREE.MeshBasicMaterial({ color: 0x450a0a }));
  redL.position.set(0, 7.8, 0.68);
  var grnL = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  grnL.position.set(0, 6.6, 0.68);
  sg.add(pole, box, redL, grnL);
  scene.add(sg);
  railwaySignals[k] = { isGreen: true, redL: redL, grnL: grnL, timer: idx * 110 };
});

window.collectibles = [];
var cTypes = ['heart', 'diamond', 'duck'];
physicalTracksToRender.forEach(function(e, idx) {
  if (e.to.indexOf('EXIT_') === 0) return;
  [0.25, 0.75].forEach(function(tPos, j) {
    var type = cTypes[(idx + j) % 3];
    var g = new THREE.Group();
    var col = type === 'heart' ? 0xf43f5e : (type === 'diamond' ? 0x38bdf8 : 0xfacc15);
    var m = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, type === 'duck' ? 1 : 0), new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 }));
    g.add(m);
    var pt = e.curve.getPointAt(tPos);
    g.position.set(pt.x, pt.y + 1.9, pt.z);
    scene.add(g);
    collectibles.push({ mesh: g, type: type, basePos: pt.clone(), cooldown: 0 });
  });
});

// ============================================================================
// HERO CHARACTER #1: LITTLE TRAIN TOBY & OPEN RED-YELLOW WAGONS (Refined 0.64 Scale!)
// ============================================================================
window.wheelMeshes = [];

function createStorybookTrainWheel(radius, rimHex, tireHex, hubHex) {
  var wg = new THREE.Group();
  var tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.42, 20),
    new THREE.MeshStandardMaterial({ color: tireHex || 0x1e293b, roughness: 0.5 })
  );
  tire.rotation.z = Math.PI / 2;
  var disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, 0.48, 18),
    new THREE.MeshStandardMaterial({ color: rimHex, roughness: 0.3 })
  );
  disc.rotation.z = Math.PI / 2;
  var hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, 0.55, 14),
    new THREE.MeshBasicMaterial({ color: hubHex || 0x0f172a })
  );
  hub.rotation.z = Math.PI / 2;
  var spoke = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, radius * 1.45, 0.22),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  wg.add(tire, disc, hub, spoke);
  return wg;
}

function createLocomotiveCartoonEye(isLeft) {
  var eg = new THREE.Group();
  var eyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  eyeWhite.scale.set(0.65, 1.15, 0.95);

  var pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  pupil.position.set(isLeft ? 0.12 : -0.12, 0.02, 0.52);

  var glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  glint.position.set(isLeft ? 0.2 : -0.2, 0.22, 0.78);

  var lash = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.11, 8, 14, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  lash.position.set(0, 0.18, 0.32);
  eg.add(eyeWhite, pupil, glint, lash);
  return eg;
}

window.createDetailedLocomotive = function(primaryHex, cabinHex, isBullet) {
  var g = new THREE.Group();
  // Scaled down to 0.64 so Toby & his wagons look neat and well-proportioned on the tracks!
  g.scale.set(0.64, 0.64, 0.64);

  var yellowMat = new THREE.MeshStandardMaterial({ color: primaryHex || 0xfacc15, roughness: 0.28 });
  var redMat    = new THREE.MeshStandardMaterial({ color: cabinHex || 0xef4444, roughness: 0.30 });
  var cyanMat   = new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.25 });
  var darkMat   = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  var runningBoard = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.55, 9.2), redMat);
  runningBoard.position.set(0, 1.35, 0.1);
  var underFrame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.65, 8.6), darkMat);
  underFrame.position.set(0, 0.9, 0.1);
  g.add(runningBoard, underFrame);

  var cabBody = new THREE.Mesh(new THREE.BoxGeometry(3.85, 3.9, 3.6), redMat);
  cabBody.position.set(0, 3.45, -2.4);
  cabBody.castShadow = true;

  var cabWinSide = new THREE.Mesh(
    new THREE.BoxGeometry(4.02, 1.65, 2.0),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
  );
  cabWinSide.position.set(0, 3.75, -2.4);

  var roofYellowRim = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.52, 4.2), yellowMat);
  roofYellowRim.position.set(0, 5.55, -2.4);
  var roofRedCap = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.38, 3.85), redMat);
  roofRedCap.position.set(0, 5.95, -2.4);
  var cyanRoofDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    cyanMat
  );
  cyanRoofDome.position.set(0, 6.05, -2.4);
  g.add(cabBody, cabWinSide, roofYellowRim, roofRedCap, cyanRoofDome);

  var boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 5.2, 24), yellowMat);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.set(0, 3.1, 1.75);
  boiler.castShadow = true;

  var frontCyanDoor = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.35, 24), cyanMat);
  frontCyanDoor.rotation.x = Math.PI / 2;
  frontCyanDoor.position.set(0, 3.1, 4.32);

  // Glowing Front Headlight Lamp on the Nose Boss!
  var lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var noseBoss = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), lampMat);
  noseBoss.position.set(0, 3.1, 4.55);

  var leftEye = createLocomotiveCartoonEye(true);
  leftEye.position.set(1.38, 3.32, 3.92);
  leftEye.rotation.y = 0.28;
  var rightEye = createLocomotiveCartoonEye(false);
  rightEye.position.set(-1.38, 3.32, 3.92);
  rightEye.rotation.y = -0.28;

  var smileTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.11, 8, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  smileTorus.rotation.z = Math.PI;
  smileTorus.position.set(0, 2.25, 4.48);

  g.add(boiler, frontCyanDoor, noseBoss, leftEye, rightEye, smileTorus);

  var chimneyCollar = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.22, 12, 20), cyanMat);
  chimneyCollar.rotation.x = Math.PI / 2;
  chimneyCollar.position.set(0, 4.75, 2.85);

  var chimneyPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.62, 1.65, 18), redMat);
  chimneyPipe.position.set(0, 5.45, 2.85);

  var chimneyRim = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.20, 12, 20), redMat);
  chimneyRim.rotation.x = Math.PI / 2;
  chimneyRim.position.set(0, 6.22, 2.85);

  var chimneyHole = new THREE.Mesh(
    new THREE.CircleGeometry(0.68, 16),
    new THREE.MeshBasicMaterial({ color: 0x450a0a })
  );
  chimneyHole.rotation.x = -Math.PI / 2;
  chimneyHole.position.set(0, 6.33, 2.85);
  g.add(chimneyCollar, chimneyPipe, chimneyRim, chimneyHole);

  var plowRed = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.1, 1.05, 5, 1, false, -Math.PI * 0.2, Math.PI * 1.4), redMat);
  plowRed.position.set(0, 0.85, 4.25);
  var plowLip = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 1.4), darkMat);
  plowLip.position.set(0, 0.42, 4.55);
  g.add(plowRed, plowLip);

  [-2.05, 2.05].forEach(function(wx) {
    var bigW = createStorybookTrainWheel(1.42, 0xef4444, 0x1e293b, 0x0f172a);
    bigW.position.set(wx, 1.42, -2.0);
    g.add(bigW);
    wheelMeshes.push(bigW);

    var smallW1 = createStorybookTrainWheel(0.78, 0xef4444, 0x1e293b, 0x0f172a);
    smallW1.position.set(wx, 0.78, 0.95);
    var smallW2 = createStorybookTrainWheel(0.78, 0xef4444, 0x1e293b, 0x0f172a);
    smallW2.position.set(wx, 0.78, 2.75);
    g.add(smallW1, smallW2);
    wheelMeshes.push(smallW1, smallW2);
  });

  // Headlight Cone Beam (Hidden in daylight, shines strictly FORWARD inside dark tunnels & at night!)
  var beam = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 22, 18, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 2.5, 15.6);
  beam.visible = false;
  g.userData.beam = beam;
  g.userData.noseLamp = noseBoss;
  g.add(beam);

  addContactShadow(g, 4.8, 9.6, 0.06);
  return g;
};

window.createDetailedCoach = function(colHex) {
  var g = new THREE.Group();
  g.scale.set(0.64, 0.64, 0.64);

  var redHopperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.32 });
  var yellowTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28 });
  var darkInsideMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 });

  var chassis = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.55, 6.4), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  chassis.position.set(0, 1.15, 0);
  g.add(chassis);

  var hopperBody = new THREE.Mesh(new THREE.BoxGeometry(3.45, 2.35, 5.8), redHopperMat);
  hopperBody.position.set(0, 2.55, 0);
  hopperBody.castShadow = true;

  var topRim = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.36, 6.1), yellowTrimMat);
  topRim.position.set(0, 3.78, 0);

  var cavity = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.22, 5.45), darkInsideMat);
  cavity.position.set(0, 3.88, 0);
  g.add(hopperBody, topRim, cavity);

  [-2.65, 0.0, 2.65].forEach(function(rz) {
    var rib = new THREE.Mesh(new THREE.BoxGeometry(3.65, 2.4, 0.45), yellowTrimMat);
    rib.position.set(0, 2.55, rz);
    g.add(rib);
  });

  [-1.75, 1.75].forEach(function(wz) {
    [-1.8, 1.8].forEach(function(wx) {
      var cw = createStorybookTrainWheel(1.08, 0x06b6d4, 0x0f172a, 0x1e293b);
      cw.position.set(wx, 1.08, wz);
      g.add(cw);
      wheelMeshes.push(cw);
    });
  });

  addContactShadow(g, 4.4, 6.8, 0.06);
  return g;
};
