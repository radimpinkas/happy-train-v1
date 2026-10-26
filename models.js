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
  scene.add(g);
  var obj = { group: g, armPivot: armPivot, phase: Math.random() * 6 };
  wavingHumans.push(obj);
  return obj;
};

// Registry of 3D Landmark Camera Showcases keyed by edge ID ('A->B' and 'B->A')
window.landmarkShowcases = {};
window.registerLandmarkShowcase = function(edgeA, edgeB, config) {
  window.landmarkShowcases[edgeA + '->' + edgeB] = config;
  window.landmarkShowcases[edgeB + '->' + edgeA] = config;
};
window.jewelWaterfallDrops = [];
window.airportRadars = [];

// Helper to strip leading emoji from station title so the illustrated sign shows clean text next to the picture
function cleanStationTitle(rawName) {
  return String(rawName || 'Station').replace(/^[^\wA-Za-z]+\s*/, '');
}

// Build Illustrated Stations & Platforms for All Surface Landmark Stops
window.stationPhysicals = {};
physicalTracksToRender.forEach(function(e) {
  if (!e.station || e.to.indexOf('EXIT_') === 0) return;
  if (e.station.type === 'cross_west' || e.station.type === 'cross_east') return;

  var midPt = e.curve.getPointAt(0.50);
  var tan = e.curve.getTangentAt(0.50).normalize();
  var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  var ang = Math.atan2(tan.x, tan.z);
  var stCleanName = cleanStationTitle(e.station.name);
  var stIcon = e.station.icon || 'fountain';

  var badgePalette = {
    eiffel: '#78350f',
    grandma_house: '#831843',
    airport: '#0c4a6e',
    jewel: '#134e4a',
    colosseum: '#7c2d12',
    stadium: '#14532d',
    bigben: '#713f12',
    mom_house: '#881337',
    skyscraper: '#1e3a8a',
    fountain: '#0f172a'
  };
  var signBg = badgePalette[stIcon] || '#0f172a';

  if (e.station.type === 'station' && stIcon !== 'mom_house' && stIcon !== 'grandma_house') {
    var platPos = midPt.clone().add(perp.clone().multiplyScalar(-8.4));
    var sg = new THREE.Group();
    sg.position.copy(platPos);
    sg.rotation.y = ang;

    var gY = terrainY(platPos.x, platPos.z);
    var fndH = Math.max(1.0, platPos.y - gY + 1.2);
    var fnd = new THREE.Mesh(new THREE.BoxGeometry(5.4, fndH, 17.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    fnd.position.y = -fndH * 0.5 + 0.6;

    var plat = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.0, 17.2), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 }));
    plat.position.y = 0.5;
    var yellowLine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.04, 16.8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    yellowLine.position.set(2.1, 0.52, 0);

    var canopy = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.65, 17.6), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 }));
    canopy.position.y = 5.6;
    var canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.24, 17.8), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
    canopyTrim.position.y = 5.3;

    [-6.2, 0, 6.2].forEach(function(pz) {
      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.8, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 }));
      col.position.set(-1.4, 3.0, pz);
      sg.add(col);
    });

    var sign = window.makeStationSign
      ? window.makeStationSign(stCleanName, stIcon, signBg, 22, 5.2)
      : makeSign(e.station.name, signBg, '#fde047', 22, 5.0);
    sign.position.set(0, 9.2, 0);
    sg.add(fnd, plat, yellowLine, canopy, canopyTrim, sign);
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
  } else {
    // Illustrated Station Sign beside Viaducts, Bridges, Houses & Jewel Hypermarket Entrance
    var isHouseStop = (stIcon === 'mom_house' || stIcon === 'grandma_house');
    var signOffset = (e.station.type === 'jewel_dome') ? -14.5 : (stIcon === 'airport' ? 10.5 : (stIcon === 'mom_house' ? -12.0 : -9.2));
    var sampleU = (e.station.type === 'jewel_dome' || stIcon === 'airport') ? 0.21 : (stIcon === 'mom_house' ? 0.79 : 0.50);
    var samplePt = e.curve.getPointAt(sampleU);
    var signPos = samplePt.clone().add(perp.clone().multiplyScalar(signOffset));
    var postG = new THREE.Group();
    postG.position.copy(signPos);
    var postH = isHouseStop ? 5.2 : 7.2;
    var signW = isHouseStop ? 16.5 : 22;
    var signH = isHouseStop ? 4.0 : 5.2;
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, postH, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 }));
    pole.position.y = postH * 0.5;
    var sign2 = window.makeStationSign
      ? window.makeStationSign(stCleanName, stIcon, signBg, signW, signH)
      : makeSign(e.station.name, signBg, '#fde047', signW, signH);
    sign2.position.set(0, postH + signH * 0.45, 0);
    postG.add(pole, sign2);
    scene.add(postG);
    if (isHouseStop) {
      stationPhysicals[e.station.name] = { pax: [], visitedThisEdge: false };
    }
  }
});

// --- GRAND CENTRAL SQUARE WITH ANIMATED 3-TIER WATER FOUNTAIN ---
window.fountainDrops = [];
(function buildCentralFountainSquare() {
  var fGroup = new THREE.Group();
  var fx = 32, fz = 6;
  var fy = terrainY(fx, fz);
  fGroup.position.set(fx, fy, fz);

  var plaza = new THREE.Mesh(new THREE.CylinderGeometry(18, 19, 0.6, 32), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 }));
  plaza.position.y = 0.25;
  var goldRim = new THREE.Mesh(new THREE.TorusGeometry(11.2, 0.55, 12, 36), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 }));
  goldRim.rotation.x = Math.PI / 2;
  goldRim.position.y = 1.45;
  var basin = new THREE.Mesh(new THREE.CylinderGeometry(11.0, 11.8, 1.8, 28), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 }));
  basin.position.y = 0.9;
  var midTier = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.4, 1.1, 24), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
  midTier.position.y = 3.2;
  var topTier = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.85, 20), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 }));
  topTier.position.y = 5.4;
  var centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.1, 6.6, 18), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 }));
  centerPillar.position.y = 3.3;
  var finial = new THREE.Mesh(new THREE.SphereGeometry(1.05, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.2 }));
  finial.position.y = 6.9;

  var fSign = window.makeStationSign
    ? window.makeStationSign("Fountain Square", "fountain", "#0369a1", 22, 5.2)
    : makeSign("⛲ Fountain Square", "#0284c7", "#fde047", 20, 4.8);
  fSign.position.set(0, 13.5, 0);
  fGroup.add(plaza, goldRim, basin, midTier, topTier, centerPillar, finial, fSign);

  var dropGeo = new THREE.SphereGeometry(0.42, 8, 8);
  var dropMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
  for (var i = 0; i < 32; i++) {
    var d = new THREE.Mesh(dropGeo, dropMat);
    fGroup.add(d);
    fountainDrops.push({ mesh: d, angle: (i / 32) * Math.PI * 2, progress: (i / 32) });
  }
  scene.add(fGroup);

  window.registerLandmarkShowcase('J_CENTER', 'J_SOUTH', {
    lookTarget: new THREE.Vector3(fx, fy + 5.0, fz),
    camHeight: 23,
    camBack: 40,
    camSide: 28
  });
})();

// ============================================================================
// DISNEY-PIXAR QUALITY 3D INTERNATIONAL AIRPORT & PARKING LOT (`image_35160969.png`)
// Includes:
// - Sweeping Double-Wave White Roof Terminal with Blue Glass Curtain Wall,
//   Circular Glass Rotunda Concourses & "AIRPORT ✈️" Facade Sign
// - Tall Cylindrical Air Traffic Control Tower with Turquoise Glass Cab & Spinning Radar
// - 3 Telescopic Glass Jet Bridges (Aerobridges) + Mobile Boarding Stairs
// - 4 Branded Wide-Body Airliners ("Emirates" with UAE flag tail, "scoot / flyscoot.com"
//   in yellow/white, and two "QATAR" burgundy/pearl-grey wide-body jets)
// - 2 Circular Helipads ("H") + 2 Small Propeller Planes on Yellow Apron Stands
// - Ground Support Tugs, Baggage Carts, Catering Truck, Windsock & Floodlight Masts
// - Wooden Post-and-Rail Fence with Flowering Bushes along the Railway Track
// - Animated Airport Shuttle Buses, Flying Helicopters & Road-Connected Parking Lot!
// ============================================================================
window.aircraftList = [];
window.airportShuttleBuses = [];
window.airportFlyingHelis = [];
window.airportFlyingPlanes = [];
window.airportPropellers = [];
window.airportWindsocks = [];

// Custom High-Resolution Procedural Airline Livery & Tail Fin Canvas Textures
function createAirlineFuselageSideTex(brand, isRightSide) {
  var c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  var ctx = c.getContext('2d');

  // Subtle cylindrical 3D top-to-bottom shading gradient
  var shade = ctx.createLinearGradient(0, 0, 0, 256);
  shade.addColorStop(0.0, '#f8fafc');
  shade.addColorStop(0.25, '#ffffff');
  shade.addColorStop(0.72, '#f1f5f9');
  shade.addColorStop(1.0, '#cbd5e1');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 1024, 256);

  if (brand === 'emirates') {
    // Golden & red lower belly cheatline
    ctx.fillStyle = '#d97706';
    ctx.fillRect(40, 178, 944, 7);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(40, 187, 944, 4);

    // Bold Golden "Emirates" Serif Title + Arabic Calligraphy ("الإمارات")
    ctx.fillStyle = '#b45309';
    ctx.font = '900 72px "Georgia", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Emirates', 470, 114);
    ctx.font = '700 36px sans-serif';
    ctx.fillText('الإمارات', 745, 108);

  } else if (brand === 'scoot') {
    // Iconic Scoot Diagonal Bright Sunny Yellow Rear/Tail & Belly Livery!
    // Note: On left side (looking at +X), nose is on right (+Z) or left (-Z); we draw symmetric bold yellow bands
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    if (isRightSide) {
      ctx.moveTo(0, 0);
      ctx.lineTo(480, 0);
      ctx.lineTo(680, 256);
      ctx.lineTo(0, 256);
    } else {
      ctx.moveTo(1024, 0);
      ctx.lineTo(544, 0);
      ctx.lineTo(344, 256);
      ctx.lineTo(1024, 256);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 170, 1024, 86);

    // Bold "scoot" & "flyscoot.com" branding
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 66px "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('scoot', isRightSide ? 680 : 344, 112);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 6;
    ctx.font = '900 44px "Fredoka", "Arial Black", sans-serif';
    ctx.strokeText('flyscoot.com', 512, 218);
    ctx.fillText('flyscoot.com', 512, 218);

  } else if (brand === 'qatar') {
    // Pearl-grey belly & sweeping burgundy accent stripe
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 174, 1024, 82);
    ctx.fillStyle = '#881337';
    ctx.fillRect(40, 168, 944, 6);

    // Deep Burgundy "QATAR" Serif Title
    ctx.fillStyle = '#881337';
    ctx.font = '900 74px "Georgia", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('QATAR', 485, 114);
  }

  // Crisp Cabin Passenger Windows & Outlined Passenger Doors
  for (var wx = 88; wx <= 936; wx += 22) {
    if (wx === 220 || wx === 528 || wx === 836) {
      // Cabin exit door outline
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(wx - 4, 124, 16, 36);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(wx, 130, 8, 10);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(wx, 132, 11, 15, 4);
      else ctx.rect(wx, 132, 11, 15);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wx + 2, 134, 7, 5);
    }
  }

  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
}

function createAirlineTailTex(brand) {
  var c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');

  if (brand === 'emirates') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    // Green top diagonal band
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(256, 0); ctx.lineTo(256, 85); ctx.lineTo(0, 115);
    ctx.closePath(); ctx.fill();
    // Black bottom diagonal band
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 175); ctx.lineTo(256, 150); ctx.lineTo(256, 256); ctx.lineTo(0, 256);
    ctx.closePath(); ctx.fill();
    // Red leading-edge stripe
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(82, 0); ctx.lineTo(46, 256); ctx.lineTo(0, 256);
    ctx.closePath(); ctx.fill();
  } else if (brand === 'scoot') {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 256);
    // White & yellow circular Scoot emblem + diagonal text
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(128, 132);
    ctx.rotate(-0.42);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 6;
    ctx.font = '900 62px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('scoot', 0, 18);
    ctx.fillText('scoot', 0, 18);
    ctx.restore();
  } else if (brand === 'qatar') {
    ctx.fillStyle = '#881337';
    ctx.fillRect(0, 0, 256, 256);
    // Stylized White Oryx Emblem Circle on Burgundy Tail Fin
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(134, 128, 68, 0, Math.PI * 2);
    ctx.fill();
    // Stylized Oryx horns & head silhouette in burgundy
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(118, 155); ctx.quadraticCurveTo(105, 100, 158, 76);
    ctx.moveTo(128, 155); ctx.quadraticCurveTo(120, 105, 168, 86);
    ctx.stroke();
    ctx.fillStyle = '#881337';
    ctx.font = '900 32px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText('QATAR', 134, 174);
  }
  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
}

function buildBrandedWidebodyJet(brand, scaleVal) {
  var jet = new THREE.Group();
  var sc = scaleVal || 1.0;
  jet.scale.set(sc, sc, sc);

  var leftSideTex  = createAirlineFuselageSideTex(brand, false);
  var rightSideTex = createAirlineFuselageSideTex(brand, true);
  var tailTex      = createAirlineTailTex(brand);

  var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.20, metalness: 0.10 });
  var bellyMat = new THREE.MeshStandardMaterial({
    color: brand === 'scoot' ? 0xfacc15 : (brand === 'qatar' ? 0xe2e8f0 : 0xf8fafc),
    roughness: 0.24,
    metalness: 0.12
  });
  var wingMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.26,
    metalness: 0.18
  });
  var engineRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.72, roughness: 0.20 });
  var engineCowlingMat = new THREE.MeshStandardMaterial({
    color: brand === 'scoot' ? 0xfacc15 : (brand === 'qatar' ? 0x881337 : 0xffffff),
    roughness: 0.22,
    metalness: 0.12
  });
  var fanDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  var tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  var cockpitMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  // 1. Smooth Sculpted Wide-Body Fuselage Core (along Z, nose at +Z)
  var body = new THREE.Mesh(new THREE.CylinderGeometry(2.62, 2.48, 24.8, 28), whiteMat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 3.6;
  body.castShadow = true;
  jet.add(body);

  // Wing-box aerodynamic belly fairing
  var bellyFairing = new THREE.Mesh(new THREE.SphereGeometry(2.45, 20, 14), bellyMat);
  bellyFairing.scale.set(1.06, 0.52, 3.2);
  bellyFairing.position.set(0, 2.35, 0.5);
  jet.add(bellyFairing);

  // 2. Dedicated Left & Right Curved Livery Decal Shells (100% Unstretched Brand Titles & Cabin Windows!)
  // Left side of fuselage (+X face, phiStart = 0, phiLength = Math.PI)
  var leftShellGeo = new THREE.CylinderGeometry(2.65, 2.51, 24.4, 24, 1, true, 0, Math.PI);
  leftShellGeo.rotateX(Math.PI / 2);
  var leftPos = leftShellGeo.attributes.position;
  var leftUv  = leftShellGeo.attributes.uv;
  for (var li = 0; li < leftPos.count; li++) {
    var ly = leftPos.getY(li);
    var lz = leftPos.getZ(li);
    leftUv.setXY(li, (12.2 - lz) / 24.4, (ly + 2.65) / 5.30);
  }
  var leftShell = new THREE.Mesh(
    leftShellGeo,
    new THREE.MeshStandardMaterial({ map: leftSideTex, roughness: 0.22, metalness: 0.08 })
  );
  leftShell.position.y = 3.6;
  jet.add(leftShell);

  // Right side of fuselage (-X face, phiStart = Math.PI, phiLength = Math.PI)
  var rightShellGeo = new THREE.CylinderGeometry(2.65, 2.51, 24.4, 24, 1, true, Math.PI, Math.PI);
  rightShellGeo.rotateX(Math.PI / 2);
  var rightPos = rightShellGeo.attributes.position;
  var rightUv  = rightShellGeo.attributes.uv;
  for (var ri = 0; ri < rightPos.count; ri++) {
    var ry = rightPos.getY(ri);
    var rz = rightPos.getZ(ri);
    rightUv.setXY(ri, (rz + 12.2) / 24.4, (ry + 2.65) / 5.30);
  }
  var rightShell = new THREE.Mesh(
    rightShellGeo,
    new THREE.MeshStandardMaterial({ map: rightSideTex, roughness: 0.22, metalness: 0.08 })
  );
  rightShell.position.y = 3.6;
  jet.add(rightShell);

  // 3. Rounded Aerodynamic Radome Nose Cone & Multi-Pane Cockpit Windshield Visor
  var nose = new THREE.Mesh(new THREE.SphereGeometry(2.62, 24, 20), whiteMat);
  nose.scale.set(1.0, 0.94, 1.85);
  nose.position.set(0, 3.48, 12.2);
  var radomeTip = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 14), bellyMat);
  radomeTip.scale.set(1.0, 0.9, 1.5);
  radomeTip.position.set(0, 3.18, 15.6);

  var windshield = new THREE.Mesh(new THREE.SphereGeometry(2.22, 18, 14), cockpitMat);
  windshield.scale.set(0.96, 0.52, 1.15);
  windshield.position.set(0, 4.35, 13.4);
  windshield.rotation.x = 0.22;
  jet.add(nose, radomeTip, windshield);

  // 4. Smooth Tapered Tail Cone & APU Exhaust Tip
  var tailConeMat = new THREE.MeshStandardMaterial({
    color: brand === 'scoot' ? 0xfacc15 : (brand === 'qatar' ? 0x881337 : 0xffffff),
    roughness: 0.24
  });
  var tailCone = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 2.48, 7.2, 24), tailConeMat);
  tailCone.rotation.x = -Math.PI / 2;
  tailCone.position.set(0, 3.72, -15.8);
  var apuTip = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 0.9, 12), engineRimMat);
  apuTip.rotation.x = -Math.PI / 2;
  apuTip.position.set(0, 3.82, -19.6);
  jet.add(tailCone, apuTip);

  // 5. Swept-Back Airfoil Main Wings, Flap Track Fairings, Blended Winglets & High-Bypass Turbofan Engines
  [-1, 1].forEach(function(side) {
    var wingG = new THREE.Group();
    var wingPanel = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.38, 4.6), wingMat);
    wingPanel.position.set(side * 8.4, 3.0, 0.2);
    wingPanel.rotation.y = side * -0.26;
    wingPanel.rotation.z = side * 0.05;
    wingPanel.castShadow = true;
    wingG.add(wingPanel);

    // 3 Under-wing flap track canoe fairings
    [5.2, 8.8, 12.2].forEach(function(fx) {
      var fairing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 2.2, 8), bellyMat);
      fairing.rotation.x = Math.PI / 2;
      fairing.position.set(side * fx, 2.75, -1.6 - (fx - 5.0) * 0.22);
      wingG.add(fairing);
    });

    // Tall Blended Sharklet Winglet
    var winglet = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 2.6, 2.1),
      new THREE.MeshStandardMaterial({
        color: brand === 'scoot' ? 0xfacc15 : (brand === 'qatar' ? 0x881337 : 0xdc2626),
        roughness: 0.25
      })
    );
    winglet.position.set(side * 15.6, 4.4, -1.6);
    winglet.rotation.z = side * -0.18;
    wingG.add(winglet);
    jet.add(wingG);

    // High-Bypass Turbofan Engine Nacelle + Pylon + Metallic Intake Lip + Fan Cone
    var engX = side * 6.5;
    var engZ = 2.4;
    var pylon = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 2.8), wingMat);
    pylon.position.set(engX, 2.55, engZ - 0.2);
    var nacelle = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.24, 4.4, 22), engineCowlingMat);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(engX, 1.82, engZ);
    nacelle.castShadow = true;
    var intakeRim = new THREE.Mesh(new THREE.TorusGeometry(1.34, 0.16, 12, 24), engineRimMat);
    intakeRim.position.set(engX, 1.82, engZ + 2.2);
    var fanDisk = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.26, 0.35, 18), fanDarkMat);
    fanDisk.rotation.x = Math.PI / 2;
    fanDisk.position.set(engX, 1.82, engZ + 2.02);
    var spinnerCone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.85, 12), engineRimMat);
    spinnerCone.rotation.x = Math.PI / 2;
    spinnerCone.position.set(engX, 1.82, engZ + 2.25);
    jet.add(pylon, nacelle, intakeRim, fanDisk, spinnerCone);
  });

  // 6. Tall Swept Vertical Stabilizer (Tail Fin) with Branded Livery Texture
  var tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(6.2, 0);
  tailShape.lineTo(2.6, 8.2);
  tailShape.lineTo(-1.0, 8.2);
  tailShape.closePath();
  var tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.52, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 });
  tailGeo.translate(-2.4, 0, -0.26);
  tailGeo.rotateY(Math.PI * 0.5);

  var uvAttr = tailGeo.attributes.uv;
  var posAttr = tailGeo.attributes.position;
  for (var ui = 0; ui < posAttr.count; ui++) {
    var py = posAttr.getY(ui);
    var pz = posAttr.getZ(ui);
    uvAttr.setXY(ui, (pz + 3.8) / 7.6, py / 8.4);
  }
  var tailFin = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({ map: tailTex, roughness: 0.25 }));
  tailFin.position.set(0, 4.8, -13.6);
  tailFin.castShadow = true;

  var hStab = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.34, 3.0), wingMat);
  hStab.position.set(0, 4.1, -14.8);
  jet.add(tailFin, hStab);

  // 7. Nose & Main Multi-Wheel Bogie Landing Gear
  var strutMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65 });
  [[0, 10.4], [-2.9, -1.2], [2.9, -1.2]].forEach(function(gp) {
    var strut = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 2.0, 10), strutMat);
    strut.position.set(gp[0], 1.15, gp[1]);
    var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.92, 14), tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(gp[0], 0.58, gp[1]);
    jet.add(strut, wheel);
  });

  addContactShadow(jet, 14.0, 26.0, 0.05);
  return jet;
}

// Small Propeller Plane Builder (Blue/White Low-Wing, Red/White High-Wing, Yellow Flying Biplane)
function buildLightPropellerPlane(colorScheme) {
  var g = new THREE.Group();
  var mainHex = colorScheme === 'blue' ? 0x1d4ed8 : (colorScheme === 'red' ? 0xdc2626 : 0xfacc15);
  var whiteMat = new THREE.MeshStandardMaterial({ color: colorScheme === 'yellow' ? 0xfacc15 : 0xffffff, roughness: 0.24 });
  var accentMat = new THREE.MeshStandardMaterial({ color: mainHex, roughness: 0.26 });
  var glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

  var body = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.64, 7.8, 16), whiteMat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 1.68;
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.44, 7.4), accentMat);
  stripe.position.set(0, 1.58, 0);
  var nose = new THREE.Mesh(new THREE.SphereGeometry(1.02, 14, 14), accentMat);
  nose.scale.set(1.0, 0.92, 1.4);
  nose.position.set(0, 1.68, 3.9);
  var canopy = new THREE.Mesh(new THREE.SphereGeometry(0.92, 14, 12), glassMat);
  canopy.scale.set(0.96, 0.75, 1.7);
  canopy.position.set(0, 2.30, 0.8);

  var wingY = colorScheme === 'red' ? 2.52 : 1.48;
  var wing = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.24, 1.95), colorScheme === 'red' ? accentMat : whiteMat);
  wing.position.set(0, wingY, 0.8);
  var wingTips = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.18, 0.48), accentMat);
  wingTips.position.set(0, wingY + 0.04, 1.48);

  // If yellow scheme, add an upper biplane wing & struts for extra fairytale charm!
  if (colorScheme === 'yellow') {
    var upperWing = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.22, 1.85), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28 }));
    upperWing.position.set(0, 2.95, 0.9);
    g.add(upperWing);
    [-3.6, 3.6].forEach(function(sx) {
      var wStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.45, 6), darkMat);
      wStrut.position.set(sx, 2.22, 0.85);
      g.add(wStrut);
    });
  }

  var tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.30, 2.2, 1.5), accentMat);
  tailFin.position.set(0, 2.55, -3.4);
  var hTail = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.20, 1.15), accentMat);
  hTail.position.set(0, 1.88, -3.4);

  // Spinning Nose Propeller
  var propPivot = new THREE.Group();
  propPivot.position.set(0, 1.68, 5.28);
  var spinner = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.70, 12), accentMat);
  spinner.rotation.x = Math.PI / 2;
  var blade1 = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.24, 0.08), darkMat);
  var blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.65, 0.08), darkMat);
  propPivot.add(spinner, blade1, blade2);
  window.airportPropellers.push(propPivot);

  // Tricycle Landing Gear
  [[0, 3.1], [-1.4, -0.2], [1.4, -0.2]].forEach(function(wp) {
    var strut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 6), darkMat);
    strut.position.set(wp[0], 0.85, wp[1]);
    var wh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.30, 10), darkMat);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wp[0], 0.36, wp[1]);
    g.add(strut, wh);
  });

  g.add(body, stripe, nose, canopy, wing, wingTips, tailFin, hTail, propPivot);
  addContactShadow(g, 6.5, 6.8, 0.04);
  return g;
}

// Airport Helicopter Builder (Matching Red/White and Blue/White/Yellow Helicopters in `image_7985496f.png`)
function buildAirportHelicopter(scheme) {
  var g = new THREE.Group();
  var isBlue = (scheme === 'blue');
  var primaryMat = new THREE.MeshStandardMaterial({ color: isBlue ? 0x1d4ed8 : 0xdc2626, roughness: 0.22 });
  var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
  var yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28 });
  var glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  var upperCabin = new THREE.Mesh(new THREE.SphereGeometry(2.15, 22, 18), isBlue ? whiteMat : primaryMat);
  upperCabin.scale.set(1.0, 0.88, 1.52);
  upperCabin.position.y = 2.18;
  var lowerBelly = new THREE.Mesh(new THREE.SphereGeometry(2.10, 20, 16), isBlue ? primaryMat : whiteMat);
  lowerBelly.scale.set(1.02, 0.66, 1.48);
  lowerBelly.position.y = 1.65;
  var accentBelt = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.30, 5.5), yellowMat);
  accentBelt.position.set(0, 1.88, 0.1);

  var cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(1.80, 18, 14), glassMat);
  cockpitGlass.scale.set(0.96, 0.80, 1.18);
  cockpitGlass.position.set(0, 2.25, 1.38);

  var tailBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.82, 5.6, 14), primaryMat);
  tailBoom.rotation.x = Math.PI / 2;
  tailBoom.position.set(0, 2.28, -4.5);
  var tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.30, 2.2, 1.2), primaryMat);
  tailFin.position.set(0, 2.90, -7.0);
  tailFin.rotation.x = -0.25;

  // Landing Skids
  [-1.4, 1.4].forEach(function(sx) {
    var skid = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.4, 8), darkMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(sx, 0.22, 0.2);
    var st1 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 6), darkMat);
    st1.position.set(sx * 0.85, 0.85, 1.2);
    var st2 = st1.clone();
    st2.position.set(sx * 0.85, 0.85, -1.0);
    g.add(skid, st1, st2);
  });

  // Main Rotor
  var rotorPivot = new THREE.Group();
  rotorPivot.position.set(0, 4.10, 0);
  var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.46, 12), darkMat);
  var b1 = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.10, 0.68), darkMat);
  var b2 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.10, 10.8), yellowMat);
  rotorPivot.add(hub, b1, b2);
  window.airportPropellers.push(rotorPivot);

  g.add(upperCabin, lowerBelly, accentBelt, cockpitGlass, tailBoom, tailFin, rotorPivot);
  addContactShadow(g, 5.2, 6.6, 0.04);
  g.userData = { rotor: rotorPivot };
  return g;
}

// Airport Low-Floor White & Blue Shuttle Bus (`image_7985496f.png` right side)
function buildAirportShuttleBusMesh() {
  var bus = new THREE.Group();
  var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
  var blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.28 });
  var glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  var lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  var body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 8.8), whiteMat);
  body.position.y = 1.85;
  body.castShadow = true;
  var blueSkirt = new THREE.Mesh(new THREE.BoxGeometry(3.26, 0.78, 8.86), blueMat);
  blueSkirt.position.y = 0.98;
  var windowBand = new THREE.Mesh(new THREE.BoxGeometry(3.28, 1.15, 7.9), glassMat);
  windowBand.position.set(0, 2.15, 0.1);
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(2.95, 1.25, 0.2), glassMat);
  windshield.position.set(0, 2.12, 4.38);
  var roofAc = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 3.6), whiteMat);
  roofAc.position.set(0, 3.28, -0.5);

  [[-1.1, 4.42], [1.1, 4.42]].forEach(function(lp) {
    var hl = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), lightMat);
    hl.position.set(lp[0], 1.05, lp[1]);
    bus.add(hl);
  });

  [[-1.55, 2.6], [1.55, 2.6], [-1.55, -2.6], [1.55, -2.6]].forEach(function(wp) {
    var wh = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.45, 12), tireMat);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wp[0], 0.58, wp[1]);
    bus.add(wh);
  });

  bus.add(body, blueSkirt, windowBand, windshield, roofAc);
  addContactShadow(bus, 4.2, 9.6, 0.04);
  return bus;
}

// Build the Complete International Airport, Apron, Terminal, Control Tower, Planes, Helis, Horizon Mountains & Parking Lot!
(function buildReferenceAirportComplex() {
  var ax = 324, az = -64;
  var ay = terrainY(ax, az);
  var ag = new THREE.Group();
  ag.position.set(ax, ay, az);

  // 1. Expansive Concrete/Tarmac Airport Apron with Painted Stand Circles, Taxi Lines & Service Roadway
  function createApronSurfaceTexture() {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 1024;
    var ctx = c.getContext('2d');
    var tarmacGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    tarmacGrad.addColorStop(0.0, '#94a3b8');
    tarmacGrad.addColorStop(0.5, '#cbd5e1');
    tarmacGrad.addColorStop(1.0, '#94a3b8');
    ctx.fillStyle = tarmacGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle concrete slab expansion joints
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
    ctx.lineWidth = 3;
    for (var gx = 0; gx <= 1024; gx += 64) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, gx); ctx.lineTo(1024, gx); ctx.stroke();
    }

    // Yellow aircraft stand lead-in lines
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    [230, 510, 770].forEach(function(ly) {
      ctx.beginPath(); ctx.moveTo(180, ly); ctx.lineTo(840, ly); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(310, 50); ctx.lineTo(310, 970); ctx.stroke();

    // Red-and-white hatched ground vehicle service road lane (`image_7985496f.png` center apron!)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 9;
    ctx.strokeRect(435, 50, 98, 920);
    ctx.fillStyle = '#ffffff';
    for (var zy = 75; zy < 940; zy += 44) {
      ctx.fillRect(448, zy, 72, 15);
    }

    // 2 Helipad Circles ("H") + 2 Small Plane Stand Circles in foreground apron
    function drawHelipad(cx, cy, r, drawH) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 13;
      ctx.stroke();
      if (drawH) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 56px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', cx, cy);
      }
    }
    drawHelipad(205, 320, 58, true);
    drawHelipad(335, 495, 50, false);
    drawHelipad(225, 675, 58, true);
    drawHelipad(185, 865, 50, false);

    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var apronMesh = new THREE.Mesh(
    new THREE.BoxGeometry(148, 0.38, 162),
    new THREE.MeshStandardMaterial({ map: createApronSurfaceTexture(), roughness: 0.72 })
  );
  apronMesh.position.set(2, 0.19, 0);
  apronMesh.receiveShadow = true;
  ag.add(apronMesh);

  // Active Runway Strip behind the terminal/apron on the eastern coastal edge (`x = +66`)
  var runwayMesh = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.44, 168),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.72 })
  );
  runwayMesh.position.set(66, 0.22, 0);
  ag.add(runwayMesh);
  var rwDashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (var rwz = -72; rwz <= 72; rwz += 12) {
    var rwDash = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.50, 6.4), rwDashMat);
    rwDash.position.set(66, 0.24, rwz);
    ag.add(rwDash);
  }

  // 1B. SCENIC HORIZON BACKDROP: Deep Azure Coastal Sea Bay, Golden Sandy Beach, Distant City Skyline & Lush Green Mountains!
  var beachShore = new THREE.Mesh(
    new THREE.PlaneGeometry(38, 280),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.85 })
  );
  beachShore.rotation.x = -Math.PI / 2;
  beachShore.position.set(92, -0.04, 0);
  ag.add(beachShore);

  var seaBay = new THREE.Mesh(
    new THREE.PlaneGeometry(210, 310),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.18, metalness: 0.18 })
  );
  seaBay.rotation.x = -Math.PI / 2;
  seaBay.position.set(175, -0.08, 0);
  ag.add(seaBay);

  //Lush Green Mountain Ridges & Coastal City Skyline along the Airport Horizon (`image_7985496f.png` top background!)
  var mountainDarkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.88 });
  var mountainMidMat  = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.86 });
  var mountainLiteMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
  var airportMountains = [
    { x:  92, y: -6, z: -105, rx: 42, ry: 28, rz: 48, mat: mountainDarkMat },
    { x: 108, y: -8, z:  -52, rx: 48, ry: 35, rz: 56, mat: mountainMidMat },
    { x:  96, y: -6, z:    6, rx: 40, ry: 25, rz: 48, mat: mountainLiteMat },
    { x: 115, y: -8, z:   64, rx: 46, ry: 31, rz: 54, mat: mountainMidMat },
    { x:  62, y: -5, z: -118, rx: 38, ry: 24, rz: 40, mat: mountainLiteMat }
  ];
  airportMountains.forEach(function(mh) {
    var hillM = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mh.mat);
    hillM.scale.set(mh.rx, mh.ry, mh.rz);
    hillM.position.set(mh.x, mh.y, mh.z);
    ag.add(hillM);
  });

  // Distant Coastal City Skyline Towers along the Bay (`image_7985496f.png` upper right!)
  var skylineCols = [0x93c5fd, 0xbfdbfe, 0x7dd3fc, 0xe2e8f0, 0x60a5fa];
  for (var skyI = 0; skyI < 14; skyI++) {
    var stW = 5.5 + (skyI % 3) * 2.2;
    var stH = 12.0 + (skyI % 5) * 4.8;
    var stD = 5.5 + ((skyI + 1) % 3) * 2.0;
    var stMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stW, stH, stD),
      new THREE.MeshStandardMaterial({ color: skylineCols[skyI % skylineCols.length], roughness: 0.35, metalness: 0.3 })
    );
    stMesh.position.set(84 + (skyI % 3) * 7.5, stH * 0.5, -28 + skyI * 8.2);
    ag.add(stMesh);
  }

  // 2. Iconic Sweeping Double-Wave White Roof Airport Terminal with Multi-Pane Glass Curtain Wall & "AIRPORT ✈️" Sign!
  //    Centered at `local x = +35, z = +2` and rotated `rotation.y = -0.32` so the Control Tower and full
  //    "AIRPORT ✈️" wave arch face the railway camera directly without any left-edge cropping!
  var termGroup = new THREE.Group();
  termGroup.position.set(35, 0.35, 2);
  termGroup.rotation.y = -0.32;

  function createTerminalGlassCurtainTex() {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var ctx = c.getContext('2d');

    var glassGrad = ctx.createLinearGradient(0, 0, 0, 512);
    glassGrad.addColorStop(0.0, '#0369a1');
    glassGrad.addColorStop(0.35, '#0284c7');
    glassGrad.addColorStop(0.70, '#0ea5e9');
    glassGrad.addColorStop(1.0, '#0c4a6e');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm glowing interior concourse lounges & duty-free levels visible through the glass
    ctx.fillStyle = 'rgba(254, 240, 138, 0.38)';
    ctx.fillRect(0, 185, 1024, 65);
    ctx.fillRect(0, 325, 1024, 85);

    // Diagonal sky reflection sheen across glass panes
    ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
    for (var d = -200; d < 1024; d += 180) {
      ctx.beginPath();
      ctx.moveTo(d, 512); ctx.lineTo(d + 90, 512); ctx.lineTo(d + 280, 0); ctx.lineTo(d + 190, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Horizontal silver floor spandrel beams & vertical aluminum window mullions
    ctx.fillStyle = '#e2e8f0';
    [175, 310, 435].forEach(function(hy) {
      ctx.fillRect(0, hy, 1024, 12);
    });
    for (var vx = 0; vx <= 1024; vx += 32) {
      ctx.fillStyle = (vx % 128 === 0) ? '#f8fafc' : 'rgba(226, 232, 240, 0.65)';
      ctx.fillRect(vx, 0, (vx % 128 === 0) ? 7 : 3, 512);
    }

    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var whiteRoofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.22, metalness: 0.14 });
  var soffitCreamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
  var glassCurtainMat = new THREE.MeshStandardMaterial({
    map: createTerminalGlassCurtainTex(),
    roughness: 0.14,
    metalness: 0.45
  });
  var cyanGlassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var mullionMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.28, metalness: 0.55 });

  // Custom Double-Wave Extruded Terminal Building & Thick Sculpted White Overhanging Roof Shell
  var waveShape = new THREE.Shape();
  waveShape.moveTo(-56, 0);
  waveShape.lineTo(-56, 13.0);
  waveShape.bezierCurveTo(-42, 24.5, -18, 25.2, -2, 16.0);
  waveShape.bezierCurveTo(14, 24.2, 36, 23.0, 56, 12.0);
  waveShape.lineTo(56, 0);
  waveShape.closePath();

  var glassWallGeo = new THREE.ExtrudeGeometry(waveShape, { depth: 25, bevelEnabled: false, curveSegments: 36 });
  glassWallGeo.translate(0, 0, -12.5);
  glassWallGeo.rotateY(-Math.PI * 0.5);
  // Normalize UVs on the extruded glass hall so the curtain-wall texture maps cleanly
  var gwPos = glassWallGeo.attributes.position;
  var gwUv  = glassWallGeo.attributes.uv;
  for (var gi = 0; gi < gwPos.count; gi++) {
    gwUv.setXY(gi, (gwPos.getZ(gi) + 56) / 112, gwPos.getY(gi) / 25.0);
  }
  var glassHall = new THREE.Mesh(glassWallGeo, glassCurtainMat);
  glassHall.castShadow = true;
  glassHall.receiveShadow = true;
  termGroup.add(glassHall);

  // Thick Sculpted White Overhanging Wave Roof Arch Shell (`roofArchGeo`) with Warm Cream Soffit Underside
  var roofArchShape = new THREE.Shape();
  roofArchShape.moveTo(-59, 11.8);
  roofArchShape.bezierCurveTo(-43, 23.8, -18, 24.6, -2, 15.2);
  roofArchShape.bezierCurveTo(14, 23.6, 37, 22.4, 59, 11.0);
  roofArchShape.lineTo(59, 13.8);
  roofArchShape.bezierCurveTo(37, 25.6, 14, 26.8, -2, 18.2);
  roofArchShape.bezierCurveTo(-18, 27.8, -43, 27.0, -59, 14.6);
  roofArchShape.closePath();

  var roofShellGeo = new THREE.ExtrudeGeometry(roofArchShape, {
    depth: 29.5,
    bevelEnabled: true,
    bevelSize: 0.45,
    bevelThickness: 0.45,
    curveSegments: 36
  });
  roofShellGeo.translate(0, 0, -14.75);
  roofShellGeo.rotateY(-Math.PI * 0.5);
  var roofShellMesh = new THREE.Mesh(roofShellGeo, whiteRoofMat);
  roofShellMesh.castShadow = true;
  termGroup.add(roofShellMesh);

  // Warm Cream-Gold Underside Soffit Trim under the Front Overhang (`x = -13.5`)
  var soffitGeo = new THREE.ExtrudeGeometry(roofArchShape, { depth: 3.2, bevelEnabled: false, curveSegments: 32 });
  soffitGeo.translate(0, -0.45, -1.6);
  soffitGeo.rotateY(-Math.PI * 0.5);
  var soffitMesh = new THREE.Mesh(soffitGeo, soffitCreamMat);
  soffitMesh.position.x = -13.2;
  termGroup.add(soffitMesh);

  // Vertical White Structural Curtain-Wall Columns & Diagonal Entrance V-Struts across the Front Facade (`x = -12.6`)
  for (var mz = -52; mz <= 52; mz += 6.5) {
    var mH = 12.8 + Math.sin(((mz + 56) / 112) * Math.PI) * 6.8;
    var mul = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, mH, 10), whiteRoofMat);
    mul.position.set(-12.6, mH * 0.5, mz);
    termGroup.add(mul);
  }

  // Lower Curved Front Entrance Canopy & Drop-Off Portico (`image_7985496f.png` front entrance!)
  var porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.75, 44.0), whiteRoofMat);
  porticoRoof.position.set(-15.2, 6.4, -8.0);
  var porticoGlass = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 42.0), cyanGlassMat);
  porticoGlass.position.set(-15.2, 6.0, -8.0);
  termGroup.add(porticoRoof, porticoGlass);
  for (var pz = -26; pz <= 10; pz += 9) {
    var vStrut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.6, 8), mullionMat);
    vStrut1.position.set(-16.8, 3.2, pz - 0.8);
    vStrut1.rotation.z = -0.18;
    vStrut1.rotation.x = 0.14;
    var vStrut2 = vStrut1.clone();
    vStrut2.position.z = pz + 0.8;
    vStrut2.rotation.x = -0.14;
    termGroup.add(vStrut1, vStrut2);
  }

  // 3 Circular Glass Rotunda Gate Concourses along the base of the Terminal
  [-36, 0, 32].forEach(function(rz) {
    var rotG = new THREE.Group();
    rotG.position.set(-14.8, 0, rz);
    var rotGlass = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 7.6, 24), glassCurtainMat);
    rotGlass.position.y = 3.8;
    var rotRoof = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 7.8, 0.95, 24), whiteRoofMat);
    rotRoof.position.y = 7.7;
    var rotDome = new THREE.Mesh(new THREE.SphereGeometry(5.2, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), whiteRoofMat);
    rotDome.position.y = 8.0;
    var rotMidBand = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 0.65, 24), whiteRoofMat);
    rotMidBand.position.y = 4.2;
    rotG.add(rotGlass, rotRoof, rotDome, rotMidBand);
    termGroup.add(rotG);
  });

  // Giant "AIRPORT ✈️" Facade Sign mounted directly under the Main Wave Arch (`image_7985496f.png`!)
  function createTerminalFacadeSignTex() {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    var ctx = c.getContext('2d');
    var bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
    bgGrad.addColorStop(0, '#0284c7');
    bgGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(8, 8, 1008, 240, 36);
    else ctx.rect(8, 8, 1008, 240);
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.65)';
    ctx.shadowBlur = 12;
    ctx.font = '900 134px "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('AIRPORT', 68, 134);

    // Crisp White Airplane Silhouette Icon on the right
    ctx.save();
    ctx.translate(830, 128);
    ctx.rotate(-0.25);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 78, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(-42, -74); ctx.lineTo(-8, -74); ctx.lineTo(28, 0);
    ctx.lineTo(-8, 74); ctx.lineTo(-42, 74); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-58, 0); ctx.lineTo(-82, -38); ctx.lineTo(-56, -38); ctx.lineTo(-40, 0);
    ctx.lineTo(-56, 38); ctx.lineTo(-82, 38); ctx.closePath();
    ctx.fill();
    ctx.restore();
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var facadeSignBack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.6, 35.0), whiteRoofMat);
  facadeSignBack.position.set(-13.8, 15.6, -15.5);
  var facadeSign = new THREE.Mesh(
    new THREE.PlaneGeometry(34.4, 7.2),
    new THREE.MeshBasicMaterial({ map: createTerminalFacadeSignTex(), transparent: true })
  );
  facadeSign.rotation.y = -Math.PI * 0.5;
  facadeSign.position.set(-14.3, 15.6, -15.5);
  termGroup.add(facadeSignBack, facadeSign);

  // 3. Towering Air Traffic Control Tower rising behind the Left Wave Arch (`image_7985496f.png`!)
  //    Positioned at `local z = -18` so it is 100% inside the camera view on the left side of the terminal!
  var ctGroup = new THREE.Group();
  ctGroup.position.set(-1.5, 0, -18);
  var ctBase = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 8.0, 24), whiteRoofMat);
  ctBase.position.y = 4.0;
  var ctShaft = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.6, 28, 24), whiteRoofMat);
  ctShaft.position.y = 16.0;
  ctShaft.castShadow = true;

  // Vertical architectural shaft ribs & dark blue collar bands
  for (var sri = 0; sri < 8; sri++) {
    var sra = (sri / 8) * Math.PI * 2;
    var sRib = new THREE.Mesh(new THREE.BoxGeometry(0.45, 28, 0.45), mullionMat);
    sRib.position.set(Math.cos(sra) * 4.15, 16.0, Math.sin(sra) * 4.15);
    ctGroup.add(sRib);
  }
  var ctCollarBlue = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 4.0, 2.6, 24),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
  );
  ctCollarBlue.position.y = 28.5;
  var ctCollar1 = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 5.6, 2.8, 24), whiteRoofMat);
  ctCollar1.position.y = 31.0;
  var ctBalcony = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.2, 1.2, 24), mullionMat);
  ctBalcony.position.y = 32.8;
  var ctGlassCab = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 7.6, 6.4, 24), cyanGlassMat);
  ctGlassCab.position.y = 36.4;
  for (var cmi = 0; cmi < 12; cmi++) {
    var cma = (cmi / 12) * Math.PI * 2;
    var cmBar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.6, 6), whiteRoofMat);
    cmBar.position.set(Math.cos(cma) * 8.3, 36.4, Math.sin(cma) * 8.3);
    cmBar.rotation.z = -Math.cos(cma) * 0.18;
    cmBar.rotation.x = -Math.sin(cma) * 0.18;
    ctGroup.add(cmBar);
  }
  var ctCap = new THREE.Mesh(new THREE.CylinderGeometry(9.4, 9.0, 1.6, 24), whiteRoofMat);
  ctCap.position.y = 40.2;
  var ctDome = new THREE.Mesh(new THREE.SphereGeometry(5.6, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), whiteRoofMat);
  ctDome.position.y = 40.8;

  var radarPivot = new THREE.Group();
  radarPivot.position.set(0, 44.2, 0);
  var mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.36, 4.8, 8), whiteRoofMat);
  var radarBar = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.35, 0.8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  radarBar.position.y = 1.3;
  var redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.78, 10, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  redBeacon.position.y = 2.9;
  radarPivot.add(mastPole, radarBar, redBeacon);
  window.airportRadars.push(radarPivot);

  ctGroup.add(ctBase, ctShaft, ctCollarBlue, ctCollar1, ctBalcony, ctGlassCab, ctCap, ctDome, radarPivot);
  termGroup.add(ctGroup);

  // 4. 3 Telescopic Glass Jet Bridges (Aerobridges) extending from the Terminal to the Airliners
  [-36, 0, 32].forEach(function(jbz) {
    var jbG = new THREE.Group();
    jbG.position.set(-22.5, 4.8, jbz);
    var tubeGlass = new THREE.Mesh(new THREE.BoxGeometry(16.5, 2.8, 2.6), cyanGlassMat);
    var tubeRoof = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.42, 2.85), whiteRoofMat);
    tubeRoof.position.y = 1.5;
    var tubeFloor = tubeRoof.clone();
    tubeFloor.position.y = -1.5;
    var accordionHood = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.9, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    accordionHood.rotation.z = Math.PI / 2;
    accordionHood.position.set(-8.2, 0, 0);
    var supportLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 4.8, 10), mullionMat);
    supportLeg.position.set(-5.8, -2.4, 0);
    var wheelPair = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 10), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    wheelPair.rotation.x = Math.PI / 2;
    wheelPair.position.set(-5.8, -4.4, 0);
    jbG.add(tubeGlass, tubeRoof, tubeFloor, accordionHood, supportLeg, wheelPair);
    termGroup.add(jbG);
  });

  ag.add(termGroup);

  // 5. 4 Branded Wide-Body Passenger Airliners ("Emirates", "scoot", and two "QATAR" Jets!)
  //    Angled so their full 3/4 side profiles & tail fins are clearly legible from the railway camera (`image_7985496f.png`!)
  var emiratesJet = buildBrandedWidebodyJet('emirates', 1.06);
  emiratesJet.position.set(-3, 0.35, -30);
  emiratesJet.rotation.y = 0.32; // Shows crisp left side "Emirates" + UAE tail fin toward camera!
  ag.add(emiratesJet);

  var scootJet = buildBrandedWidebodyJet('scoot', 0.96);
  scootJet.position.set(2, 0.35, 2);
  scootJet.rotation.y = 0.24; // Shows crisp yellow/white "scoot" / "flyscoot.com" side profile toward camera!
  ag.add(scootJet);

  var qatarJet1 = buildBrandedWidebodyJet('qatar', 1.02);
  qatarJet1.position.set(12, 0.35, 34);
  qatarJet1.rotation.y = -0.35; // Shows crisp burgundy "QATAR" side profile & Oryx tail fin!
  ag.add(qatarJet1);

  var qatarJet2 = buildBrandedWidebodyJet('qatar', 0.90);
  qatarJet2.position.set(34, 0.35, 56);
  qatarJet2.rotation.y = -0.28;
  ag.add(qatarJet2);

  // Mobile Passenger Boarding Stairs Truck docked beside the Emirates & Scoot Jets (`image_7985496f.png`!)
  function buildBoardingStairsTruck(x, z, rotY) {
    var stG = new THREE.Group();
    stG.position.set(x, 0.36, z);
    stG.rotation.y = rotY;
    var whiteM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    var redCarpetM = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    var yelM = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    var base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 4.6), whiteM);
    base.position.y = 0.85;
    var ramp = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 5.2), whiteM);
    ramp.position.set(0, 2.4, -0.4);
    ramp.rotation.x = 0.48;
    var carpet = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.48, 5.1), redCarpetM);
    carpet.position.copy(ramp.position);
    carpet.rotation.copy(ramp.rotation);
    var railL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.75, 5.2), yelM);
    railL.position.set(-0.88, 2.8, -0.4);
    railL.rotation.x = 0.48;
    var railR = railL.clone();
    railR.position.x = 0.88;
    stG.add(base, ramp, carpet, railL, railR);
    return stG;
  }
  ag.add(buildBoardingStairsTruck(-11, -22, 1.8));
  ag.add(buildBoardingStairsTruck(-6, 10, 1.7));

  // 6. Foreground Apron Helipads ("H") & Small Propeller Planes (`image_7985496f.png` foreground!)
  var redHeliParked = buildAirportHelicopter('red');
  redHeliParked.position.set(-42, 0.36, -24);
  redHeliParked.rotation.y = 0.65;
  ag.add(redHeliParked);

  var bluePropPlane = buildLightPropellerPlane('blue');
  bluePropPlane.position.set(-24, 0.36, -1);
  bluePropPlane.rotation.y = 0.55;
  ag.add(bluePropPlane);

  var blueHeliParked = buildAirportHelicopter('blue');
  blueHeliParked.position.set(-38, 0.36, 22);
  blueHeliParked.rotation.y = -0.55;
  ag.add(blueHeliParked);

  var redPropPlane = buildLightPropellerPlane('red');
  redPropPlane.position.set(-44, 0.36, 48);
  redPropPlane.rotation.y = -0.48;
  ag.add(redPropPlane);

  // 7. Apron Ground Support Vehicles (Yellow Baggage Tugs + Carts, Utility Vans & Catering Truck)
  function buildBaggageTrain(x, z, rotY) {
    var bg = new THREE.Group();
    bg.position.set(x, 0.36, z);
    bg.rotation.y = rotY;
    var yelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    var blueCartMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    var tug = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 2.8), yelMat);
    tug.position.y = 0.95;
    var cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cab.position.set(0, 1.9, 0.3);
    bg.add(tug, cab);
    for (var ci = 1; ci <= 2; ci++) {
      var cart = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 2.4), ci === 1 ? blueCartMat : yelMat);
      cart.position.set(0, 0.8, -ci * 3.1);
      bg.add(cart);
    }
    return bg;
  }
  ag.add(buildBaggageTrain(-26, -38, 0.4));
  ag.add(buildBaggageTrain(-14, -14, -0.3));
  ag.add(buildBaggageTrain(-8,  14, 0.8));
  ag.add(buildBaggageTrain( 8,  24, -0.5));

  // White & Orange Airport Catering Truck (`image_7985496f.png` bottom right)
  var catTruck = new THREE.Group();
  catTruck.position.set(-22, 0.36, 42);
  catTruck.rotation.y = -Math.PI * 0.48;
  var catCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 2.0), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
  catCab.position.set(0, 1.3, 2.4);
  var catBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 4.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  catBox.position.set(0, 1.6, -0.6);
  catTruck.add(catCab, catBox);
  ag.add(catTruck);

  // 8. 3 Tall Apron Floodlight Masts & Red-and-White Striped Windsock (`Větrný rukáv`)
  [[-16, -24], [4, 14], [18, -34]].forEach(function(mp) {
    var mastG = new THREE.Group();
    mastG.position.set(mp[0], 0.36, mp[1]);
    var plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
    plinth.position.y = 0.9;
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 25, 10), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 }));
    pole.position.y = 13.0;
    var crossBar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 0.45), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    crossBar.position.y = 25.5;
    var l1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), new THREE.MeshBasicMaterial({ color: 0xfef9c3 }));
    l1.position.set(-1.2, 26.0, 0.2);
    var l2 = l1.clone();
    l2.position.set(1.2, 26.0, 0.2);
    mastG.add(plinth, pole, crossBar, l1, l2);
    ag.add(mastG);
  });

  // Red-and-White Striped Airport Windsock (`image_7985496f.png` right edge)
  var wsGroup = new THREE.Group();
  wsGroup.position.set(18, 0.36, 52);
  var wsPole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  wsPole.position.y = 7.0;
  var wsSockPivot = new THREE.Group();
  wsSockPivot.position.set(0, 13.8, 0);
  for (var wsi = 0; wsi < 5; wsi++) {
    var rTop = 0.95 - wsi * 0.12;
    var rBot = 0.95 - (wsi + 1) * 0.12;
    var seg = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, 1.1, 12),
      new THREE.MeshBasicMaterial({ color: wsi % 2 === 0 ? 0xef4444 : 0xffffff })
    );
    seg.rotation.z = Math.PI / 2;
    seg.position.x = 0.6 + wsi * 1.05;
    wsSockPivot.add(seg);
  }
  window.airportWindsocks.push(wsSockPivot);
  wsGroup.add(wsPole, wsSockPivot);
  ag.add(wsGroup);

  // 9. Soft Fairytale Studio Fill Light, Wooden Post-and-Rail Fence, Storybook Trees & Lush Flowering Gardens (`image_7985496f.png` & `image_14f8f908.png`!)
  var airportSunFill = new THREE.PointLight(0xfffbeb, 0.22, 160);
  airportSunFill.position.set(-18, 46, 0);
  ag.add(airportSunFill);

  var woodFenceMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.72 });
  var shrubGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.62 });
  var shrubLimeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.62 });
  var trunkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.78 });
  var rockStoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 });
  var flowerPalette = [
    new THREE.MeshBasicMaterial({ color: 0xf97316 }),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e }),
    new THREE.MeshBasicMaterial({ color: 0xc084fc }),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  ];

  function buildAirportStorybookTree(tx, tz, sc) {
    var tg = new THREE.Group();
    tg.position.set(tx, 0.35, tz);
    tg.scale.set(sc, sc, sc);
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.68, 3.6, 10), trunkWoodMat);
    trunk.position.y = 1.8;
    var c1 = new THREE.Mesh(new THREE.SphereGeometry(2.3, 14, 12), shrubGreenMat);
    c1.position.set(0, 4.4, 0);
    var c2 = new THREE.Mesh(new THREE.SphereGeometry(1.75, 12, 10), shrubLimeMat);
    c2.position.set(1.2, 3.9, 0.8);
    var c3 = new THREE.Mesh(new THREE.SphereGeometry(1.65, 12, 10), shrubLimeMat);
    c3.position.set(-1.1, 3.8, -0.7);
    var c4 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), shrubGreenMat);
    c4.position.set(0.2, 5.6, -0.2);
    tg.add(trunk, c1, c2, c3, c4);
    return tg;
  }

  // Landscaped Storybook Trees & Ornamental Rock/Flower Islands flanking the Terminal, Control Tower & Apron Edge
  [
    [-64, -64, 1.15], [-64, -28, 1.05], [-64, 18, 1.10], [-64, 58, 1.20],
    [14, -56, 1.25], [22, -48, 1.05], [20, 48, 1.22], [28, 56, 1.08]
  ].forEach(function(tp) {
    ag.add(buildAirportStorybookTree(tp[0], tp[1], tp[2]));
  });

  // Landscaped Garden Island with Ornamental Boulders & Colorful Flower Clusters near the Foreground Apron Corner
  [[-56, -48], [-56, 36]].forEach(function(ip) {
    var islandBed = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.36, 18), shrubGreenMat);
    islandBed.position.set(ip[0], 0.32, ip[1]);
    var boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 1), rockStoneMat);
    boulder.scale.set(1.3, 0.78, 1.1);
    boulder.position.set(ip[0] + 1.2, 0.75, ip[1] - 0.8);
    ag.add(islandBed, boulder);
    for (var fi = 0; fi < 8; fi++) {
      var fa = (fi / 8) * Math.PI * 2;
      var fCluster = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), flowerPalette[fi % flowerPalette.length]);
      fCluster.scale.set(1.2, 0.75, 1.2);
      fCluster.position.set(ip[0] + Math.cos(fa) * 3.1, 0.68, ip[1] + Math.sin(fa) * 3.1);
      ag.add(fCluster);
    }
  });

  for (var fz = -72; fz <= 72; fz += 5.5) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.48, 2.5, 0.48), woodFenceMat);
    post.position.set(-68.5, 1.25, fz);
    var railTop = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 5.6), woodFenceMat);
    railTop.position.set(-68.5, 2.0, fz + 2.75);
    var railBot = railTop.clone();
    railBot.position.y = 1.08;
    ag.add(post, railTop, railBot);

    if (Math.abs(fz) % 11 < 8) {
      var bMat = (Math.abs(fz) % 2 === 0) ? shrubGreenMat : shrubLimeMat;
      var bushMain = new THREE.Mesh(new THREE.SphereGeometry(1.85, 12, 10), bMat);
      bushMain.scale.set(1.28, 0.90, 1.38);
      bushMain.position.set(-70.2, 0.98, fz + 1.5);
      var bushSide = new THREE.Mesh(new THREE.SphereGeometry(1.42, 10, 10), shrubLimeMat);
      bushSide.position.set(-69.6, 0.78, fz + 3.1);
      ag.add(bushMain, bushSide);

      for (var fli = 0; fli < 4; fli++) {
        var blossom = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), flowerPalette[(Math.abs(Math.floor(fz)) + fli) % flowerPalette.length]);
        blossom.position.set(-70.9 + (fli % 2) * 0.55, 1.58 + (fli % 2) * 0.28, fz + 0.6 + fli * 0.95);
        ag.add(blossom);
      }
    }
  }

  scene.add(ag);

  // 10. Animated Airport Shuttle Buses (`window.airportShuttleBuses`) driving along the Apron, Terminal & Parking Lot!
  var shuttleLoopPts = [
    new THREE.Vector3(ax - 14, ay + 0.4, az + 52),
    new THREE.Vector3(ax - 14, ay + 0.4, az - 44),
    new THREE.Vector3(ax + 10, ay + 0.4, az - 48),
    new THREE.Vector3(ax + 10, ay + 0.4, az + 56),
    new THREE.Vector3(ax - 22, ay + 0.4, az + 76),
    new THREE.Vector3(ax - 34, ay + 0.4, az + 54)
  ];
  var shuttleCurve = new THREE.CatmullRomCurve3(shuttleLoopPts, true);
  [0.0, 0.5].forEach(function(startU) {
    var busMesh = buildAirportShuttleBusMesh();
    busMesh.scale.set(0.88, 0.88, 0.88);
    scene.add(busMesh);
    window.airportShuttleBuses.push({
      mesh: busMesh,
      curve: shuttleCurve,
      progress: startU,
      speed: 0.00095
    });
  });

  // 11. Level-Flying Helicopters & Airplanes in the Sky Above the Airport (`image_7985496f.png` sky!)
  var flyingBlueHeli = buildAirportHelicopter('blue');
  flyingBlueHeli.scale.set(0.95, 0.95, 0.95);
  scene.add(flyingBlueHeli);
  window.airportFlyingHelis.push({
    mesh: flyingBlueHeli,
    mode: 'orbit',
    centerX: ax + 6,
    centerZ: az - 2,
    baseY: ay + 29.0,
    radiusX: 18,
    radiusZ: 28,
    phase: 0.0,
    speed: 0.36
  });

  // Yellow Propeller Biplane & Climbing Passenger Jet in the Sky above the Airport
  var flyingYellowProp = buildLightPropellerPlane('yellow');
  flyingYellowProp.scale.set(0.96, 0.96, 0.96);
  scene.add(flyingYellowProp);
  window.airportFlyingPlanes.push({
    mesh: flyingYellowProp,
    centerX: ax + 18,
    centerZ: az + 26,
    baseY: ay + 34.0,
    radiusX: 28,
    radiusZ: 36,
    phase: 0.6,
    speed: 0.34,
    climbPitch: 0.06
  });

  var climbingJet = buildBrandedWidebodyJet('emirates', 0.50);
  scene.add(climbingJet);
  window.airportFlyingPlanes.push({
    mesh: climbingJet,
    centerX: ax + 48,
    centerZ: az + 14,
    baseY: ay + 44.0,
    radiusX: 38,
    radiusZ: 46,
    phase: 2.1,
    speed: 0.24,
    climbPitch: 0.16
  });

  // 12. REAL-WORLD AIRPORT PARKING LOT (`🅿️ AIRPORT PARKING`) Connected to the City Road Network!
  var px = 296, pz = 14;
  var py = terrainY(px, pz);
  var parkG = new THREE.Group();
  parkG.position.set(px, py, pz);

  function createParkingLotTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 496);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    for (var bx = 46; bx <= 466; bx += 68) {
      ctx.beginPath(); ctx.moveTo(bx, 18); ctx.lineTo(bx, 145); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, 365); ctx.lineTo(bx, 492); ctx.stroke();
    }
    ctx.setLineDash([24, 18]);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(30, 256); ctx.lineTo(482, 256); ctx.stroke();
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var lotPad = new THREE.Mesh(
    new THREE.BoxGeometry(58, 0.34, 42),
    new THREE.MeshStandardMaterial({ map: createParkingLotTex(), roughness: 0.8 })
  );
  lotPad.position.y = 0.17;
  lotPad.receiveShadow = true;
  parkG.add(lotPad);

  var shelterMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.25, metalness: 0.6 });
  var postSteelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });
  [-14.5, 14.5].forEach(function(sz) {
    var canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(48, 0.35, 9.5), shelterMat);
    canopyRoof.position.set(0, 4.4, sz);
    canopyRoof.rotation.x = sz < 0 ? 0.08 : -0.08;
    parkG.add(canopyRoof);
    for (var spx = -20; spx <= 20; spx += 10) {
      var pPost = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.4, 8), postSteelMat);
      pPost.position.set(spx, 2.2, sz + (sz < 0 ? -3.5 : 3.5));
      parkG.add(pPost);
    }
  });

  var kiosk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 2.6), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
  kiosk.position.set(-26, 1.8, 0);
  var kioskWin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 2.7), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
  kioskWin.position.set(-26, 2.2, 0);
  var gatePed = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.9), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  gatePed.position.set(-24, 0.9, -4.5);
  var gateBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  gateBoom.rotation.x = Math.PI * 0.32;
  gateBoom.position.set(-24, 2.8, -6.5);
  parkG.add(kiosk, kioskWin, gatePed, gateBoom);

  function buildParkedCarMesh(colHex) {
    var cg = new THREE.Group();
    cg.scale.set(0.76, 0.76, 0.76);
    var bMat = new THREE.MeshStandardMaterial({ color: colHex, roughness: 0.28, metalness: 0.12 });
    var gMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    var tMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    var lower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 5.2), bMat);
    lower.position.y = 0.9;
    lower.castShadow = true;
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.95, 2.9), bMat);
    cabin.position.set(0, 1.8, -0.2);
    var glass = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.78, 2.6), gMat);
    glass.position.set(0, 1.8, -0.2);
    [[-1.3, 1.6], [1.3, 1.6], [-1.3, -1.6], [1.3, -1.6]].forEach(function(wp) {
      var w = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.38, 10), tMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wp[0], 0.52, wp[1]);
      cg.add(w);
    });
    cg.add(lower, cabin, glass);
    return cg;
  }

  var carPalette = [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xa855f7, 0xf97316, 0xec4899, 0x06b6d4, 0xffffff, 0x14b8a6];
  var bayXList = [-18, -10, -2, 6, 14, 21];
  bayXList.forEach(function(bx, idx) {
    var c1 = buildParkedCarMesh(carPalette[idx % carPalette.length]);
    c1.position.set(bx, 0.34, -14.2);
    parkG.add(c1);
    if (idx !== 2) {
      var c2 = buildParkedCarMesh(carPalette[(idx + 4) % carPalette.length]);
      c2.position.set(bx, 0.34, 14.2);
      c2.rotation.y = Math.PI;
      parkG.add(c2);
    }
  });

  var pSign = makeSign("🅿️ AIRPORT PARKING", "#1d4ed8", "#ffffff", 18, 4.4);
  pSign.position.set(0, 9.5, 0);
  parkG.add(pSign);

  scene.add(parkG);

  // Register the exact 3D Camera Showcase from `image_7985496f.png`:
  // Looking across the train and wooden fence straight onto the Apron, Helicopters, Emirates/Scoot/Qatar Jets,
  // Wave-Roof Terminal with "AIRPORT ✈️" Sign, Control Tower, and Coastal Mountain Horizon!
  window.registerLandmarkShowcase('J_NE', 'J_EAST', {
    lookTarget: new THREE.Vector3(ax + 6, ay + 13.0, az - 2),
    camHeight: 24,
    camBack: 44,
    camSide: -36,
    lookLerp: 0.62
  });
})();

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
  var g = buildBrandedWidebodyJet('emirates', 0.44);
  var face = createCartoonFacePlane(2.4, 2.1, 'transparent');
  face.position.set(0, 3.55, 16.9);
  g.add(face);
  g.userData = { name: name };
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
    speed: 0.00094
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

// Spawn 4 vehicles on the Connected Airport & Parking Lot Road Loop (loopIdx = 2)!
livingVehicles.push(createLivingRoadVehicle("🚌 Airport Shuttle Bus",0x2563eb, 'bus',  2, 0.08));
livingVehicles.push(createLivingRoadVehicle("🚕 Airport Yellow Taxi",0xfacc15, 'mini', 2, 0.34));
livingVehicles.push(createLivingRoadVehicle("🚙 Holiday Family Car", 0xef4444, 'mini', 2, 0.60));
livingVehicles.push(createLivingRoadVehicle("🚐 Airport Hotel Van",  0x38bdf8, 'van',  2, 0.84));

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

window.surfaceHousesList = [];
function buildHouse(x, y, z, w, d, h, wallCol, roofCol, title, iconType) {
  if (isNearTrack(x, z, Math.max(w, d) * 0.85 + 14)) return;
  var radXZ = Math.hypot(x, z);
  if (Math.abs(Math.abs(x) - Math.abs(z)) < 54 && radXZ > 95 && radXZ < 285) return;
  var g = new THREE.Group();
  var groundH = terrainY(x, z);
  g.position.set(x, groundH, z);
  g.scale.set(0.84, 0.84, 0.84);

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
  if (title && iconType && window.makeStationSign) {
    var sp = window.makeStationSign(title, iconType, '#0f172a', 22, 5.2);
    sp.position.set(0, h + 8.0, 0);
    g.add(sp);
  }
  scene.add(g);
  window.surfaceHousesList.push(g);
}

// ============================================================================
// 9 DISNEY-FILM-QUALITY 3D LANDMARKS AROUND THE WORLD!
// ============================================================================

// 1. EIFFEL TOWER (`J_NW -> J_NORTH` at x = -108, z = -246)
(function buildEiffelTowerLandmark() {
  var ex = -108, ez = -246;
  var ey = terrainY(ex, ez);
  var g = new THREE.Group();
  g.position.set(ex, ey, ez);

  var bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.36, metalness: 0.62 });
  var goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.68 });
  var deckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45, metalness: 0.4 });
  var glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // Stone promenade plaza & 4 corner plinths
  var plaza = new THREE.Mesh(new THREE.CylinderGeometry(24, 26, 1.2, 32), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
  plaza.position.y = 0.5;
  g.add(plaza);

  var legSpreadBot = 12.5;
  var legSpreadMid1 = 6.8;
  var legSpreadMid2 = 3.5;

  // 4 Tapered Lattice Legs (Lower & Middle sections) + Base Decorative Arches
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c) {
    var plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.8, 5.2), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    plinth.position.set(c[0] * legSpreadBot, 1.4, c[1] * legSpreadBot);
    g.add(plinth);

    // Lower leg (y = 2 -> 18)
    var p0 = new THREE.Vector3(c[0] * legSpreadBot, 2.0, c[1] * legSpreadBot);
    var p1 = new THREE.Vector3(c[0] * legSpreadMid1, 18.5, c[1] * legSpreadMid1);
    var dir1 = p1.clone().sub(p0);
    var leg1 = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 2.1, dir1.length(), 8), bronzeMat);
    leg1.position.copy(p0.clone().lerp(p1, 0.5));
    leg1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir1.clone().normalize());
    leg1.castShadow = true;
    g.add(leg1);

    // Middle leg (y = 19 -> 36)
    var p2 = new THREE.Vector3(c[0] * legSpreadMid2, 36.5, c[1] * legSpreadMid2);
    var dir2 = p2.clone().sub(p1);
    var leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.2, dir2.length(), 8), bronzeMat);
    leg2.position.copy(p1.clone().lerp(p2, 0.5));
    leg2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2.clone().normalize());
    leg2.castShadow = true;
    g.add(leg2);
  });

  // 4 Grand Base Arches between the legs
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(rotY) {
    var archG = new THREE.Group();
    archG.rotation.y = rotY;
    var archTorus = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.65, 10, 24, Math.PI), goldTrimMat);
    archTorus.position.set(0, 2.5, legSpreadBot * 0.86);
    archG.add(archTorus);
    g.add(archG);
  });

  // 1st Grand Observation Deck (y = 18.5)
  var deck1 = new THREE.Mesh(new THREE.BoxGeometry(17.5, 2.2, 17.5), deckMat);
  deck1.position.y = 18.5;
  var rail1 = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.65, 18.4), goldTrimMat);
  rail1.position.y = 19.8;
  g.add(deck1, rail1);

  // 2nd Observation Deck (y = 36.5)
  var deck2 = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.8, 10.2), deckMat);
  deck2.position.y = 36.5;
  var rail2 = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.55, 11.0), goldTrimMat);
  rail2.position.y = 37.6;
  g.add(deck2, rail2);

  // Upper Lattice Spire Tower (y = 37 -> 62) with Horizontal Filigree Rings
  var upperSpire = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 3.8, 25.0, 8), bronzeMat);
  upperSpire.position.y = 49.5;
  upperSpire.castShadow = true;
  g.add(upperSpire);

  for (var ry = 22; ry <= 58; ry += 4.5) {
    var ringW = ry < 36 ? (15.0 - (ry - 20) * 0.35) : (7.2 - (ry - 36) * 0.20);
    var ring = new THREE.Mesh(new THREE.BoxGeometry(ringW, 0.42, ringW), goldTrimMat);
    ring.position.y = ry;
    g.add(ring);
  }

  // 3rd Summit Cupola & Glowing Golden Lighthouse Beacon (y = 62 -> 74)
  var deck3 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.8, 16), deckMat);
  deck3.position.y = 62.5;
  var cupola = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 4.2, 16), goldTrimMat);
  cupola.position.y = 65.2;
  var antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.45, 9.5, 10), glowMat);
  antenna.position.y = 71.5;
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(1.25, 14, 14), glowMat);
  beacon.position.y = 68.0;
  window.eiffelBeacon = beacon;
  g.add(deck3, cupola, antenna, beacon);

  scene.add(g);

  window.registerLandmarkShowcase('J_NW', 'J_NORTH', {
    lookTarget: new THREE.Vector3(ex, ey + 28.0, ez),
    camHeight: 24,
    camBack: 46,
    camSide: 32
  });
})();

// 2. BIG BEN CLOCK TOWER (`J_SW -> J_WEST` at x = -286, z = 92)
(function buildBigBenLandmark() {
  var bx = -286, bz = 92;
  var by = terrainY(bx, bz);
  var g = new THREE.Group();
  g.position.set(bx, by, bz);

  var sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55, metalness: 0.12 });
  var creamStoneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 });
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.65 });
  var slateRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });

  // Custom High-Resolution Big Ben Clock Face Canvas Texture
  function createBigBenClockTex() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 236, 236);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 96, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (var m = 0; m < 12; m++) {
      var a = (m / 12) * Math.PI * 2;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 74, 128 + Math.sin(a) * 74);
      ctx.lineTo(128 + Math.cos(a) * 88, 128 + Math.sin(a) * 88);
      ctx.stroke();
    }
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(128, 128); ctx.lineTo(128, 62);
    ctx.moveTo(128, 128); ctx.lineTo(178, 128);
    ctx.stroke();
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(128, 128, 9, 0, Math.PI * 2);
    ctx.fill();
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }
  var clockFaceMat = new THREE.MeshBasicMaterial({ map: createBigBenClockTex() });

  // Palace of Westminster Gothic Base Wing beside the Tower
  var wing = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 14), sandstoneMat);
  wing.position.set(0, 6, -16);
  var wingRoof = new THREE.Mesh(new THREE.BoxGeometry(27, 1.8, 15), slateRoofMat);
  wingRoof.position.set(0, 12.6, -16);
  g.add(wing, wingRoof);

  // Main Neo-Gothic Tower Shaft (y = 0 -> 36) with 4 Corner Buttress Piers & Gothic Fluting
  var shaft = new THREE.Mesh(new THREE.BoxGeometry(12.2, 36, 12.2), sandstoneMat);
  shaft.position.y = 18;
  shaft.castShadow = true;
  g.add(shaft);

  [[-6.1, -6.1], [6.1, -6.1], [-6.1, 6.1], [6.1, 6.1]].forEach(function(cp) {
    var pier = new THREE.Mesh(new THREE.BoxGeometry(2.2, 46, 2.2), creamStoneMat);
    pier.position.set(cp[0], 23, cp[1]);
    var pinnacle = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.5, 4), goldMat);
    pinnacle.position.set(cp[0], 48.2, cp[1]);
    pinnacle.rotation.y = Math.PI / 4;
    g.add(pier, pinnacle);
  });

  for (var bandY = 8; bandY <= 32; bandY += 8) {
    var band = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.85, 13.2), creamStoneMat);
    band.position.y = bandY;
    g.add(band);
  }

  // Grand Clock Stage Housing (y = 36 -> 46) with 4 Illuminated Clock Faces on all 4 sides
  var clockHousing = new THREE.Mesh(new THREE.BoxGeometry(14.4, 10.5, 14.4), creamStoneMat);
  clockHousing.position.y = 40.5;
  var goldCornice = new THREE.Mesh(new THREE.BoxGeometry(15.4, 1.2, 15.4), goldMat);
  goldCornice.position.y = 46.0;
  g.add(clockHousing, goldCornice);

  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(ry) {
    var faceHolder = new THREE.Group();
    faceHolder.position.y = 40.5;
    faceHolder.rotation.y = ry;
    var dial = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 8.8), clockFaceMat);
    dial.position.z = 7.28;
    faceHolder.add(dial);
    g.add(faceHolder);
  });

  // Belfry Colonnade & Steep Neo-Gothic Spire Roof (y = 46.5 -> 66)
  var belfry = new THREE.Mesh(new THREE.BoxGeometry(10.8, 5.2, 10.8), goldMat);
  belfry.position.y = 49.0;
  var lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(9.8, 8.5, 4), slateRoofMat);
  lowerRoof.position.y = 55.5;
  lowerRoof.rotation.y = Math.PI / 4;
  var lanternStage = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.2, 5.6), goldMat);
  lanternStage.position.y = 60.2;
  var upperSpire = new THREE.Mesh(new THREE.ConeGeometry(4.8, 9.5, 4), slateRoofMat);
  upperSpire.position.y = 66.5;
  upperSpire.rotation.y = Math.PI / 4;
  var crownOrb = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  crownOrb.position.y = 71.8;

  g.add(belfry, lowerRoof, lanternStage, upperSpire, crownOrb);
  scene.add(g);

  window.registerLandmarkShowcase('J_SW', 'J_WEST', {
    lookTarget: new THREE.Vector3(bx, by + 28.0, bz),
    camHeight: 25,
    camBack: 44,
    camSide: -32
  });
})();

// 3. ROMAN COLOSSEUM (`J_SE -> J_SOUTH` at x = 115, z = 258)
(function buildColosseumLandmark() {
  var cx = 115, cz = 258;
  var cy = terrainY(cx, cz);
  var g = new THREE.Group();
  g.position.set(cx, cy, cz);
  g.scale.set(1.18, 1.0, 0.92); // Authentic elliptical Roman Amphitheater footprint

  var travertineMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.68, metalness: 0.08 });
  var creamArchMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.58 });
  var darkArchMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
  var sandMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.85 });

  // Stone podium & Arena Sand Floor
  var podium = new THREE.Mesh(new THREE.CylinderGeometry(28, 29.5, 1.6, 36), creamArchMat);
  podium.position.y = 0.8;
  var arenaSand = new THREE.Mesh(new THREE.CylinderGeometry(17.5, 17.5, 1.9, 32), sandMat);
  arenaSand.position.y = 0.95;
  g.add(podium, arenaSand);

  // 3 Tiers of Arched Roman Arcades + Iconic Asymmetric 4th Attic Crown Wall
  var numBays = 24;
  for (var tier = 0; tier < 3; tier++) {
    var tierY = 1.6 + tier * 5.8;
    var outerR = 26.5;
    var innerR = 21.5 - tier * 1.4;

    var ringFloor = new THREE.Mesh(new THREE.CylinderGeometry(outerR + 0.5, outerR + 0.5, 0.95, 36), creamArchMat);
    ringFloor.position.y = tierY + 5.4;
    g.add(ringFloor);

    for (var b = 0; b < numBays; b++) {
      var ang = (b / numBays) * Math.PI * 2;
      var nextAng = ((b + 0.5) / numBays) * Math.PI * 2;

      // Stone pillar pier between arches
      var px = Math.cos(ang) * outerR;
      var pz = Math.sin(ang) * outerR;
      var pier = new THREE.Mesh(new THREE.BoxGeometry(2.1, 5.4, 2.8), travertineMat);
      pier.position.set(px, tierY + 2.7, pz);
      pier.rotation.y = -ang + Math.PI * 0.5;
      pier.castShadow = true;
      g.add(pier);

      // Corinthian half-column on outer facade
      var colX = Math.cos(ang) * (outerR + 1.05);
      var colZ = Math.sin(ang) * (outerR + 1.05);
      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 5.2, 10), creamArchMat);
      col.position.set(colX, tierY + 2.7, colZ);
      g.add(col);

      // Recessed dark Roman arch niche with warm golden lantern glow
      var ax = Math.cos(nextAng) * (outerR - 0.4);
      var az = Math.sin(nextAng) * (outerR - 0.4);
      var archBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 1.4), darkArchMat);
      archBack.position.set(ax, tierY + 2.4, az);
      archBack.rotation.y = -nextAng + Math.PI * 0.5;
      var lintel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.3, 2.6), travertineMat);
      lintel.position.set(ax, tierY + 4.75, az);
      lintel.rotation.y = -nextAng + Math.PI * 0.5;
      g.add(archBack, lintel);
    }

    // Inner tiered seating bowl step
    var seatStep = new THREE.Mesh(new THREE.CylinderGeometry(innerR, innerR - 2.2, 5.2, 32, 1, true), creamArchMat);
    seatStep.position.y = tierY + 2.6;
    g.add(seatStep);
  }

  // Iconic 4th Tier Imperial Attic Wall (spanning the intact outer half of the Colosseum silhouette)
  for (var b4 = 0; b4 < 15; b4++) {
    var ang4 = (b4 / numBays) * Math.PI * 2 - Math.PI * 0.15;
    var wx = Math.cos(ang4) * 26.2;
    var wz = Math.sin(ang4) * 26.2;
    var atticBlock = new THREE.Mesh(new THREE.BoxGeometry(4.8, 5.6, 2.2), travertineMat);
    atticBlock.position.set(wx, 21.8, wz);
    atticBlock.rotation.y = -ang4 + Math.PI * 0.5;
    var crown = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.9, 2.6), creamArchMat);
    crown.position.set(wx, 24.8, wz);
    crown.rotation.y = -ang4 + Math.PI * 0.5;
    g.add(atticBlock, crown);
  }

  scene.add(g);

  window.registerLandmarkShowcase('J_SE', 'J_SOUTH', {
    lookTarget: new THREE.Vector3(cx, cy + 12.0, cz),
    camHeight: 22,
    camBack: 42,
    camSide: -30
  });
})();

// 4. DOWNTOWN GLASS SKYSCRAPER (`J_NORTH -> J_CENTER` at x = -52, z = -108)
(function buildSkyscraperLandmark() {
  var sx = -52, sz = -108;
  var sy = terrainY(sx, sz);
  var g = new THREE.Group();
  g.position.set(sx, sy, sz);

  var glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.78 });
  var brightGlassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.8 });
  var goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  var podium = new THREE.Mesh(new THREE.BoxGeometry(24, 4.5, 24), steelMat);
  podium.position.y = 2.25;
  var tier1 = new THREE.Mesh(new THREE.BoxGeometry(18.5, 24, 18.5), glassMat);
  tier1.position.y = 16.5;
  tier1.castShadow = true;
  var tier2 = new THREE.Mesh(new THREE.BoxGeometry(14.5, 20, 14.5), glassMat);
  tier2.position.y = 38.5;
  tier2.castShadow = true;
  var tier3 = new THREE.Mesh(new THREE.BoxGeometry(10.2, 15, 10.2), brightGlassMat);
  tier3.position.y = 56.0;
  var crownRing = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 6.2, 6.5, 16), steelMat);
  crownRing.position.y = 66.5;
  var spire = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.85, 14.0, 12), goldGlowMat);
  spire.position.y = 76.5;
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  beacon.position.y = 83.8;
  g.add(podium, tier1, tier2, tier3, crownRing, spire, beacon);

  // Horizontal Sky-Garden Ledges & Illuminated Curtain-Wall Stripes
  for (var fl = 8; fl <= 60; fl += 5) {
    var w = fl < 28 ? 19.0 : (fl < 48 ? 15.0 : 10.7);
    var band = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, w), (fl % 10 === 0) ? goldGlowMat : steelMat);
    band.position.y = fl;
    g.add(band);
  }

  scene.add(g);

  window.registerLandmarkShowcase('J_NORTH', 'J_CENTER', {
    lookTarget: new THREE.Vector3(sx, sy + 28.0, sz),
    camHeight: 24,
    camBack: 44,
    camSide: 32
  });
})();

// 5. JEWEL SINGAPORE DRIVE-THROUGH WATERFALL HYPERMARKET (`J_EAST -> J_SE`)
// The train drives directly inside through the toroidal glass-and-steel grid-shell dome
// right alongside the giant cascading indoor Rain Vortex waterfall and lush forest valley!
(function buildJewelSingaporeWaterfallHypermarket() {
  var jewelEdge = edges.find(function(e) { return e.id === 'J_EAST->J_SE'; });
  if (!jewelEdge) return;

  var midPt = jewelEdge.curve.getPointAt(0.50);
  var tan = jewelEdge.curve.getTangentAt(0.50).normalize();
  var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  var ang = Math.atan2(tan.x, tan.z);

  // Center the grand dome over the double-track & indoor Rain Vortex plaza (`+11.5m` east of main track)
  var domeCenter = midPt.clone().add(perp.clone().multiplyScalar(11.5));
  var domeG = new THREE.Group();
  domeG.position.set(domeCenter.x, midPt.y - 0.3, domeCenter.z);
  domeG.rotation.y = ang;

  var steelRibMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.22 });
  var goldArchMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.55, roughness: 0.28 });
  var glassDomeMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    roughness: 0.12,
    metalness: 0.25,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var terraceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  var foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });
  var shopGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // 1. Toroidal Glass-and-Steel Grid-Shell Vault Spanning Over the Tracks & Waterfall!
  //    Span width X = 54m (from x = -27m to +27m), Length Z = 96m (from z = -48m to +48m), Apex Height Y = 33m!
  var numRibs = 13;
  var domeLen = 96.0;
  for (var r = 0; r < numRibs; r++) {
    var uRib = r / (numRibs - 1);
    var zPos = (uRib - 0.5) * domeLen;
    var endTaper = Math.sin(uRib * Math.PI); // Smoothly rounds the dome towards north/south portals
    var ribRadiusX = 22.5 + endTaper * 6.5;
    var ribHeightY = 21.0 + endTaper * 12.5;

    var ribPts = [];
    var segs = 24;
    for (var s = 0; s <= segs; s++) {
      var theta = (s / segs) * Math.PI;
      ribPts.push(new THREE.Vector3(-Math.cos(theta) * ribRadiusX, Math.sin(theta) * ribHeightY, zPos));
    }
    var ribCurve = new THREE.CatmullRomCurve3(ribPts);
    var isPortalArch = (r === 0 || r === numRibs - 1 || r === Math.floor(numRibs / 2));
    var ribTube = new THREE.Mesh(
      new THREE.TubeGeometry(ribCurve, 28, isPortalArch ? 0.68 : 0.36, 8, false),
      isPortalArch ? goldArchMat : steelRibMat
    );
    domeG.add(ribTube);
  }

  // Longitudinal Steel Grid-Shell Purlins & Translucent Glass Dome Canopy
  for (var aStep = 1; aStep < 11; aStep++) {
    var thetaL = (aStep / 11) * Math.PI;
    var longPts = [];
    for (var r2 = 0; r2 < numRibs; r2++) {
      var uRib2 = r2 / (numRibs - 1);
      var zP = (uRib2 - 0.5) * domeLen;
      var endT = Math.sin(uRib2 * Math.PI);
      var rx = 22.5 + endT * 6.5;
      var ry = 21.0 + endT * 12.5;
      longPts.push(new THREE.Vector3(-Math.cos(thetaL) * rx, Math.sin(thetaL) * ry, zP));
    }
    var longCurve = new THREE.CatmullRomCurve3(longPts);
    var longTube = new THREE.Mesh(new THREE.TubeGeometry(longCurve, 24, 0.28, 6, false), steelRibMat);
    domeG.add(longTube);
  }

  var glassShell = new THREE.Mesh(
    new THREE.CylinderGeometry(26.5, 26.5, domeLen - 4, 28, 1, true, 0, Math.PI),
    glassDomeMat
  );
  glassShell.rotation.z = Math.PI * 0.5;
  glassShell.rotation.y = Math.PI * 0.5;
  glassShell.scale.set(1.0, 1.15, 1.0);
  glassShell.position.y = 1.0;
  domeG.add(glassShell);

  // 2. Central Roof Oculus Ring & Giant Cascading Indoor "Rain Vortex" Waterfall (at local x = +9.5m, z = 0)
  //    Wait: local x = -11.5m is the main track, local x = -7.1m is the parallel track, so local x = +9.5m is
  //    16.6m clear of the tracks inside the grand atrium!
  var vortexX = 9.5;
  var oculusRing = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.75, 12, 32), goldArchMat);
  oculusRing.rotation.x = Math.PI / 2;
  oculusRing.position.set(vortexX, 31.8, 0);
  domeG.add(oculusRing);

  // Shimmering Animated Water Curtain Funnel (Top Oculus -> Turquoise Reflecting Pool)
  var vortexCanvas = document.createElement('canvas');
  vortexCanvas.width = 256; vortexCanvas.height = 256;
  var vCtx = vortexCanvas.getContext('2d');
  var vGrad = vCtx.createLinearGradient(0, 0, 256, 0);
  vGrad.addColorStop(0.0, '#0284c7');
  vGrad.addColorStop(0.3, '#22d3ee');
  vGrad.addColorStop(0.5, '#f0f9ff');
  vGrad.addColorStop(0.7, '#22d3ee');
  vGrad.addColorStop(1.0, '#0284c7');
  vCtx.fillStyle = vGrad;
  vCtx.fillRect(0, 0, 256, 256);
  vCtx.fillStyle = 'rgba(255,255,255,0.85)';
  for (var vs = 0; vs < 50; vs++) {
    vCtx.fillRect((vs * 37) % 240, (vs * 53) % 210, 6, 42);
  }
  var vortexTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(vortexCanvas, 2, 3) : new THREE.CanvasTexture(vortexCanvas);
  if (window.waterfallTextures) window.waterfallTextures.push(vortexTex);

  var vortexMat = new THREE.MeshBasicMaterial({
    map: vortexTex,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  });

  var upperFunnel = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 2.8, 16.0, 28, 1, true), vortexMat);
  upperFunnel.position.set(vortexX, 23.8, 0);
  var lowerColumn = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 4.8, 15.8, 28, 1, true), vortexMat);
  lowerColumn.position.set(vortexX, 8.0, 0);

  // Glowing Turquoise Splash Pool & Acrylic Cylinder Basin
  var poolRim = new THREE.Mesh(new THREE.CylinderGeometry(10.8, 11.4, 1.8, 32), terraceMat);
  poolRim.position.set(vortexX, 0.9, 0);
  var poolWater = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 2.0, 32), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  poolWater.position.set(vortexX, 0.95, 0);
  var mistRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.85, 10, 24), new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 }));
  mistRing.rotation.x = Math.PI / 2;
  mistRing.position.set(vortexX, 2.1, 0);
  domeG.add(upperFunnel, lowerColumn, poolRim, poolWater, mistRing);

  // Animated Cascading Water Droplets around the Rain Vortex
  var dropGeo = new THREE.SphereGeometry(0.48, 8, 8);
  var dropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  for (var di = 0; di < 36; di++) {
    var dMesh = new THREE.Mesh(dropGeo, dropMat);
    domeG.add(dMesh);
    window.jewelWaterfallDrops.push({
      mesh: dMesh,
      centerX: vortexX,
      angle: (di / 36) * Math.PI * 2,
      progress: di / 36,
      speed: 0.014 + (di % 4) * 0.003
    });
  }

  // 3. Multi-Tier Shiseido Forest Valley Terraces, Lush Indoor Trees & Illuminated Hypermarket Boutiques!
  for (var tLevel = 0; tLevel < 3; tLevel++) {
    var ty = 3.2 + tLevel * 5.2;
    var terraceArc = new THREE.Mesh(
      new THREE.CylinderGeometry(17.5 + tLevel * 2.2, 18.2 + tLevel * 2.2, 1.4, 24, 1, false, -Math.PI * 0.15, Math.PI * 1.3),
      terraceMat
    );
    terraceArc.position.set(vortexX, ty, 0);
    var shopStrip = new THREE.Mesh(
      new THREE.CylinderGeometry(18.0 + tLevel * 2.2, 18.0 + tLevel * 2.2, 2.2, 24, 1, true, -Math.PI * 0.12, Math.PI * 1.24),
      shopGlowMat
    );
    shopStrip.position.set(vortexX, ty + 1.8, 0);
    var hedgeArc = new THREE.Mesh(
      new THREE.CylinderGeometry(16.8 + tLevel * 2.2, 17.2 + tLevel * 2.2, 1.1, 24, 1, false, -Math.PI * 0.15, Math.PI * 1.3),
      foliageMat
    );
    hedgeArc.position.set(vortexX, ty + 0.9, 0);
    domeG.add(terraceArc, shopStrip, hedgeArc);
  }

  // Indoor Botanical Palm & Canopy Trees along both sides of the tracks inside the dome
  [-34, -22, -10, 10, 22, 34].forEach(function(tz, idx) {
    var treeG = new THREE.Group();
    treeG.position.set(idx % 2 === 0 ? -19.5 : 22.0, 0.5, tz);
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 5.5, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    trunk.position.y = 2.75;
    var crown1 = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 12), foliageMat);
    crown1.position.y = 6.2;
    var crown2 = new THREE.Mesh(new THREE.SphereGeometry(2.1, 10, 10), new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
    crown2.position.set(0.8, 7.8, 0.5);
    treeG.add(trunk, crown1, crown2);
    domeG.add(treeG);
  });

  // Warm Interior Point Lights illuminating the Rain Vortex & Glass Dome
  var jewelLight = new THREE.PointLight(0x38bdf8, 1.25, 95);
  jewelLight.position.set(vortexX, 18.0, 0);
  domeG.add(jewelLight);

  scene.add(domeG);

  var vortexWorldPos = domeCenter.clone().add(new THREE.Vector3(0, 13.5, 0));
  window.registerLandmarkShowcase('J_EAST', 'J_SE', {
    isInteriorDome: true,
    lookTarget: vortexWorldPos,
    camHeight: 11.5,
    camBack: 24.0,
    camSide: -8.5
  });
})();

// Helper: High-Resolution Expressive 3D Cartoon Face Texture for Mom, Dad, Grandma & Grandpa (`image_3d2fa6b1.png`!)
function createFamilyCharacterFaceTex(role) {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  var ctx = c.getContext('2d');

  // Warm soft Pixar-style skin tone base with subtle cheek & forehead warmth
  var skinGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 260);
  skinGrad.addColorStop(0.0, '#ffedd5');
  skinGrad.addColorStop(0.65, '#fed7aa');
  skinGrad.addColorStop(1.0, '#fdba74');
  ctx.fillStyle = skinGrad;
  ctx.fillRect(0, 0, 512, 512);

  var isMom     = (role === 'mom');
  var isDad     = (role === 'dad');
  var isGrandma = (role === 'grandma');
  var isGrandpa = (role === 'grandpa');

  // Rosy fairytale blush on both cheeks (centered on front face u = 0.5)
  ctx.fillStyle = isMom || isGrandma ? 'rgba(244, 63, 94, 0.28)' : 'rgba(251, 113, 133, 0.20)';
  ctx.beginPath(); ctx.ellipse(192, 286, 28, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(320, 286, 28, 18, 0, 0, Math.PI * 2); ctx.fill();

  // Expressive arched eyebrows
  ctx.strokeStyle = (isGrandma || isGrandpa) ? '#94a3b8' : '#451a03';
  ctx.lineWidth = isDad || isGrandpa ? 11 : 8;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.quadraticCurveTo(210, 178, 232, 192); ctx.moveTo(184, 196); ctx.quadraticCurveTo(208, 176, 232, 190); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(280, 190); ctx.quadraticCurveTo(304, 176, 328, 196); ctx.stroke();

  // Large Disney/Pixar Expressive Eyes (Sclera, Warm Brown/Blue Iris, Pupil & Dual Specular Catchlights)
  [210, 302].forEach(function(ex, idx) {
    var ey = 232;
    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(ex, ey, 24, 27, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = isMom ? 6 : 4;
    ctx.stroke();

    // Eyelashes for Mom & Grandma
    if (isMom || isGrandma) {
      ctx.beginPath();
      var dir = idx === 0 ? -1 : 1;
      ctx.moveTo(ex + dir * 20, ey - 14);
      ctx.lineTo(ex + dir * 30, ey - 24);
      ctx.moveTo(ex + dir * 23, ey - 4);
      ctx.lineTo(ex + dir * 33, ey - 10);
      ctx.stroke();
    }

    // Rich warm chestnut/hazel iris
    var irisGrad = ctx.createRadialGradient(ex, ey + 2, 3, ex, ey + 2, 16);
    irisGrad.addColorStop(0.0, '#78350f');
    irisGrad.addColorStop(0.7, isMom ? '#92400e' : '#b45309');
    irisGrad.addColorStop(1.0, '#292524');
    ctx.fillStyle = irisGrad;
    ctx.beginPath(); ctx.arc(ex, ey + 2, 15, 0, Math.PI * 2); ctx.fill();

    // Glossy black pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(ex, ey + 2, 8, 0, Math.PI * 2); ctx.fill();

    // Dual bright white specular catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(ex - 5, ey - 5, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + 5, ey + 7, 2.6, 0, Math.PI * 2); ctx.fill();
  });

  // Dad's neat chestnut beard & mustache (`image_3d2fa6b1.png`)
  if (isDad) {
    ctx.fillStyle = '#5c2d0c';
    ctx.beginPath();
    ctx.moveTo(164, 275);
    ctx.quadraticCurveTo(168, 395, 256, 412);
    ctx.quadraticCurveTo(344, 395, 348, 275);
    ctx.quadraticCurveTo(315, 318, 256, 318);
    ctx.quadraticCurveTo(197, 318, 164, 275);
    ctx.closePath();
    ctx.fill();

    // Mustache arch over smile
    ctx.beginPath();
    ctx.ellipse(256, 314, 52, 16, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Cheerful open smiling mouth with bright white teeth & warm tongue
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.arc(256, 320, 34, 0.08 * Math.PI, 0.92 * Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Upper white teeth band
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(256, 320, 31, 0.12 * Math.PI, 0.88 * Math.PI, false);
  ctx.quadraticCurveTo(256, 336, 227, 331);
  ctx.closePath();
  ctx.fill();

  // Warm pink tongue
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.ellipse(256, 344, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lip outline
  ctx.strokeStyle = isMom ? '#e11d48' : '#9f1239';
  ctx.lineWidth = isMom ? 6 : 4;
  ctx.beginPath();
  ctx.arc(256, 320, 34, 0.06 * Math.PI, 0.94 * Math.PI, false);
  ctx.stroke();

  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
}

// Helper: Build Pixar-Quality 3D Family Character (Mom, Dad, Grandma, Grandpa) with Detailed Face, Hair, Outfit & Waving Arm!
function buildDetailedFamilyPerson(role, x, z, rotY, customScale) {
  var g = new THREE.Group();
  var gy = terrainY(x, z);
  g.position.set(x, gy, z);
  g.rotation.y = rotY || 0;

  var isMom     = (role === 'mom');
  var isDad     = (role === 'dad');
  var isGrandma = (role === 'grandma');
  var isGrandpa = (role === 'grandpa');

  // Hero scale for Mom & Dad so they are crystal-clear and expressive from the gameplay camera!
  var charScale = customScale || ((isMom || isDad) ? 1.95 : 1.55);
  g.scale.set(charScale, charScale, charScale);

  // Soft natural cartoon skin & clothing materials with balanced saturation
  var skinMat = new THREE.MeshStandardMaterial({
    color: 0xfdba74,
    roughness: 0.45,
    emissive: 0x7c2d12,
    emissiveIntensity: 0.05
  });
  var faceTex = createFamilyCharacterFaceTex(role);
  var headFaceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.42
  });
  var shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.55 });
  var soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

  // Reference colors from `image_3d2fa6b1.png`:
  // Mom: Warm cream-ivory knit V-neck sweater (`0xfef3c7`) + cornflower/sky-blue A-line midi skirt (`0x1d4ed8`) + rich chestnut wavy hair (`0x6b2f12`)
  // Dad: Rolled-sleeve denim-blue collared shirt (`0x1d4ed8`) over white crew tee + warm beige/khaki chinos (`0xd6d3d1`) + chestnut beard/hair (`0x4a200a`)
  var topHex  = isMom ? 0xfef3c7 : (isDad ? 0x1d4ed8 : (isGrandma ? 0xc084fc : 0x15803d));
  var botHex  = isMom ? 0x1d4ed8 : (isDad ? 0xd6d3d1 : (isGrandma ? 0x7e22ce : 0x78350f));
  var hairHex = (isGrandma || isGrandpa) ? 0xe2e8f0 : (isMom ? 0x6b2f12 : 0x4a200a);

  var topMat  = new THREE.MeshStandardMaterial({ color: topHex, roughness: 0.48 });
  var botMat  = new THREE.MeshStandardMaterial({ color: botHex, roughness: 0.50 });
  var hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.55 });

  // 1. Legs / Flowing A-Line Midi Skirt & Detailed Footwear (`image_3d2fa6b1.png`)
  if (isMom || isGrandma) {
    // Flowing pleated A-line skirt + lower ankles
    var skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.82, 1.38, 22), botMat);
    skirt.position.y = 0.96;
    skirt.castShadow = true;
    var skirtHem = new THREE.Mesh(new THREE.TorusGeometry(0.80, 0.045, 8, 24), botMat);
    skirtHem.rotation.x = Math.PI / 2;
    skirtHem.position.y = 0.28;
    g.add(skirt, skirtHem);

    [-0.23, 0.23].forEach(function(lx) {
      var ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.36, 10), skinMat);
      ankle.position.set(lx, 0.24, 0);
      var shoe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), shoeMat);
      shoe.scale.set(0.92, 0.62, 1.48);
      shoe.position.set(lx, 0.13, 0.14);
      g.add(ankle, shoe);
    });
  } else {
    // Dad / Grandpa tailored trousers, leather belt with gold buckle & casual shoes with white soles
    var hips = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.45, 0.38, 16), botMat);
    hips.position.y = 1.42;
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.485, 0.485, 0.14, 18), shoeMat);
    belt.position.y = 1.54;
    var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.10), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 }));
    buckle.position.set(0, 1.54, 0.46);
    g.add(hips, belt, buckle);

    [-0.24, 0.24].forEach(function(lx) {
      var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.28, 14), botMat);
      leg.position.set(lx, 0.80, 0);
      leg.castShadow = true;
      var cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.10, 14), botMat);
      cuff.position.set(lx, 0.20, 0);
      var shoe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), shoeMat);
      shoe.scale.set(0.96, 0.65, 1.52);
      shoe.position.set(lx, 0.16, 0.15);
      var sole = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.68), soleMat);
      sole.position.set(lx, 0.05, 0.15);
      g.add(leg, cuff, shoe, sole);
    });
  }

  // 2. Sculpted Torso, Neck, Sweater / Button-Up Shirt & Collar (`image_3d2fa6b1.png`)
  var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.44, 1.38, 18), topMat);
  torso.position.y = 2.12;
  torso.castShadow = true;
  var shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 12), topMat);
  shoulders.scale.set(1.22, 0.48, 0.88);
  shoulders.position.y = 2.68;
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.34, 12), skinMat);
  neck.position.y = 2.86;
  g.add(torso, shoulders, neck);

  if (isDad) {
    // Crisp white crew-neck T-shirt visible under Dad's open blue button-up shirt + shirt collar
    var whiteTee = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.92, 0.88), soleMat);
    whiteTee.position.set(0, 2.22, 0.08);
    var collarRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.065, 8, 16, Math.PI * 1.25), topMat);
    collarRim.rotation.x = Math.PI * 0.55;
    collarRim.rotation.z = Math.PI * 0.88;
    collarRim.position.set(0, 2.76, 0.04);
    g.add(whiteTee, collarRim);
  } else if (isMom) {
    // Warm V-neck collar trim & gold necklace pendant on Mom's cream sweater
    var vNeckTrim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), botMat);
    vNeckTrim.rotation.x = Math.PI * 0.55;
    vNeckTrim.position.set(0, 2.72, 0.06);
    var pendant = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7 }));
    pendant.position.set(0, 2.50, 0.48);
    g.add(vNeckTrim, pendant);
  }

  // 3. Expressive 3D Cartoon Head with Unobstructed 3D Eyes, Irises, Pupils, Catchlights, Eyebrows, Rosy Cheeks & Smile!
  var headGroup = new THREE.Group();
  headGroup.position.y = 3.40;

  var headGeo = new THREE.SphereGeometry(0.60, 28, 24);
  headGeo.rotateY(-Math.PI / 2);
  var headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.scale.set(0.96, 1.04, 0.96);
  headGroup.add(headMesh);

  // Large 3D Cartoon Eyes (`[-0.20, 0.20]`), Arched Eyebrows & Rosy Blush Cheeks on Front of Face (`+Z`)
  var scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var irisMat   = new THREE.MeshBasicMaterial({ color: 0x78350f });
  var pupilMat  = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  var blushMat  = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
  var browMat   = new THREE.MeshBasicMaterial({ color: (isGrandma || isGrandpa) ? 0x94a3b8 : 0x451a03 });

  [-1, 1].forEach(function(side) {
    var ex = side * 0.20;
    var sclera = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), scleraMat);
    sclera.scale.set(0.95, 1.15, 0.45);
    sclera.position.set(ex, 0.09, 0.54);
    var iris = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), irisMat);
    iris.scale.set(1.0, 1.08, 0.45);
    iris.position.set(ex, 0.09, 0.575);
    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 10), pupilMat);
    pupil.scale.set(1.0, 1.05, 0.45);
    pupil.position.set(ex, 0.09, 0.595);
    var catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), scleraMat);
    catchlight.position.set(ex - 0.025, 0.125, 0.612);
    var brow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.042, 0.045), browMat);
    brow.position.set(ex, 0.26, 0.55);
    brow.rotation.z = side * -0.14;
    var blush = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), blushMat);
    blush.scale.set(1.25, 0.72, 0.35);
    blush.position.set(side * 0.29, -0.05, 0.51);
    headGroup.add(sclera, iris, pupil, catchlight, brow, blush);
  });

  // Cute sculpted 3D cartoon nose, ears & cheerful smiling mouth with white teeth
  var nose = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), skinMat);
  nose.scale.set(0.90, 0.85, 1.18);
  nose.position.set(0, -0.01, 0.60);
  var smileMouth = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.036, 8, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0xe11d48 }));
  smileMouth.rotation.x = Math.PI;
  smileMouth.position.set(0, -0.15, 0.55);
  var smileTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.04), scleraMat);
  smileTeeth.position.set(0, -0.16, 0.555);
  headGroup.add(nose, smileMouth, smileTeeth);

  [-0.56, 0.56].forEach(function(earX) {
    var ear = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), skinMat);
    ear.scale.set(0.55, 0.95, 0.72);
    ear.position.set(earX, 0.02, -0.02);
    headGroup.add(ear);
  });

  // 4. Sculpted 3D Hair & Facial Hair (Kept high above the eyebrows & strictly below the nose so the face is 100% open!)
  var hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.63, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.48), hairMat);
  hairCap.position.set(0, 0.08, -0.05);
  hairCap.rotation.x = -0.26;
  headGroup.add(hairCap);

  if (isMom) {
    // Voluminous wavy chestnut-brown hair parted high on forehead & cascading over shoulders (`image_3d2fa6b1.png`!)
    var bangsL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), hairMat);
    bangsL.scale.set(1.25, 0.48, 0.78);
    bangsL.position.set(-0.28, 0.48, 0.32);
    bangsL.rotation.z = 0.35;
    var bangsR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), hairMat);
    bangsR.scale.set(1.15, 0.45, 0.75);
    bangsR.position.set(0.28, 0.49, 0.30);
    bangsR.rotation.z = -0.35;
    headGroup.add(bangsL, bangsR);

    [-1, 1].forEach(function(side) {
      var waveUpper = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), hairMat);
      waveUpper.scale.set(0.78, 1.45, 0.95);
      waveUpper.position.set(side * 0.52, -0.14, -0.02);
      var waveLower = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), hairMat);
      waveLower.scale.set(0.82, 1.35, 0.88);
      waveLower.position.set(side * 0.48, -0.58, 0.10);
      headGroup.add(waveUpper, waveLower);
    });
  } else if (isGrandma) {
    var bun = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), hairMat);
    bun.position.set(0, 0.52, -0.36);
    headGroup.add(bun);
  } else if (isDad) {
    // Styled swept-up brown quiff hair + neat mustache & lower-chin beard (`image_3d2fa6b1.png`!)
    var quiff = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), hairMat);
    quiff.scale.set(1.35, 0.52, 0.85);
    quiff.position.set(0.05, 0.54, 0.26);
    quiff.rotation.z = -0.14;
    var mustache = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.065, 0.08), hairMat);
    mustache.position.set(0, -0.09, 0.56);
    var chinBeard = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), hairMat);
    chinBeard.scale.set(1.02, 0.52, 0.92);
    chinBeard.position.set(0, -0.34, 0.14);
    headGroup.add(quiff, mustache, chinBeard);
  }

  g.add(headGroup);

  // 5. Left Resting Arm & Animated Right Waving Arm with Sculpted Palm & Thumb!
  var leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 1.08, 12), topMat);
  leftArm.position.set(-0.62, 2.08, 0);
  leftArm.rotation.z = 0.22;
  var leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.45, 10), isDad ? skinMat : topMat);
  leftForearm.position.set(-0.72, 1.62, 0.06);
  leftForearm.rotation.z = 0.18;
  var leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), skinMat);
  leftHand.position.set(-0.76, 1.38, 0.10);
  g.add(leftArm, leftForearm, leftHand);

  var armPivot = new THREE.Group();
  armPivot.position.set(0.58, 2.58, 0);
  var rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.62, 12), topMat);
  rightSleeve.position.set(0.18, 0.22, 0.04);
  rightSleeve.rotation.z = -0.52;
  var rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.62, 12), skinMat);
  rightForearm.position.set(0.42, 0.66, 0.08);
  rightForearm.rotation.z = -0.25;
  var rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
  rightHand.scale.set(1.0, 1.15, 0.68);
  rightHand.position.set(0.52, 1.02, 0.10);
  var rightThumb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), skinMat);
  rightThumb.position.set(0.38, 0.98, 0.14);
  armPivot.add(rightSleeve, rightForearm, rightHand, rightThumb);
  g.add(armPivot);

  addContactShadow(g, 2.0, 2.0, 0.04);
  scene.add(g);
  var obj = { group: g, armPivot: armPivot, phase: Math.random() * 6 };
  wavingHumans.push(obj);
  return obj;
}

// 6. MOM & DAD'S FAIRYTALE FAMILY COTTAGE (`J_WEST -> J_NW` at x = -238, z = -112)
//    Built to match `/public/assets/aistudio/image_3d2fa6b1.png` & `/public/assets/aistudio/image_82bfab46.png`:
//    - Front-facing pitched terracotta barrel-tile roof with 3D stepped barrel tiles, cross-gable dormer & stone-and-brick chimney
//    - Warm cream-ivory stucco walls with sandstone corner quoins, stone plinth & half-timbered upper gable
//    - Timber gable porch over a sky-blue arched wooden front door with panels, brass handle, stone steps & glowing lantern
//    - Multi-pane casement windows with sky-blue louvered shutters & overflowing colorful window flower boxes
//    - Curved cobblestone path, white picket fence, stone lantern gate pillar, wooden garden bench, blue watering can & blue mailbox
//    - Side driveway with parked metallic-blue family SUV & red bicycle, abundant hydrangea/rose gardens, and hero-scale waving Mom & Dad!
(function buildMomAndDadHouseLandmark() {
  var mx = -238, mz = -144;
  var my = terrainY(mx, mz);
  var g = new THREE.Group();
  g.position.set(mx, my, mz);
  // Oriented so the front facade (+Z), broad front terracotta roof slope, garden & Mom/Dad face the railway track & camera!
  var houseRotY = Math.PI * 0.36;
  g.rotation.y = houseRotY;

  // Gentle Warm Fill Light (balanced so colors stay rich and saturated under ACESFilmicToneMapping!)
  var cottageSunLight = new THREE.PointLight(0xfff7ed, 0.25, 70);
  cottageSunLight.position.set(2, 20, 18);
  g.add(cottageSunLight);

  // High-Contrast Procedural Terracotta Barrel-Tile Roof Texture (`createTerracottaBarrelTileTex`)
  function createTerracottaBarrelTileTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');

    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 512, 512);

    var cols = 8;
    var rows = 8;
    var cw = 512 / cols;
    var rh = 512 / rows;

    for (var r = 0; r < rows; r++) {
      for (var col = 0; col < cols; col++) {
        var x = col * cw;
        var y = r * rh;

        // Cylindrical barrel tile gradient (rich terracotta-red/orange with warm ridge & deep valley shadow)
        var tileGrad = ctx.createLinearGradient(x, y, x + cw, y);
        tileGrad.addColorStop(0.0, '#7c2d12');
        tileGrad.addColorStop(0.22, '#c2410c');
        tileGrad.addColorStop(0.50, ((r + col) % 2 === 0) ? '#ea580c' : '#d97706');
        tileGrad.addColorStop(0.68, '#f97316');
        tileGrad.addColorStop(0.88, '#9a3412');
        tileGrad.addColorStop(1.0, '#431407');
        ctx.fillStyle = tileGrad;
        ctx.fillRect(x, y, cw, rh);

        // Curved overlapping bottom lip of each barrel tile course
        ctx.beginPath();
        ctx.arc(x + cw * 0.5, y + rh - 4, cw * 0.48, 0, Math.PI, false);
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#431407';
        ctx.stroke();

        // Warm terracotta lip highlight
        ctx.beginPath();
        ctx.arc(x + cw * 0.5, y + rh - 9, cw * 0.44, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fdba74';
        ctx.stroke();
      }
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 2.0);
    return tex;
  }

  // Rustic Stone & Brick Masonry Texture for Plinth & Chimney
  function createStoneMasonryTex(isChimney) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 256);
    var stonePalette = isChimney
      ? ['#b45309', '#9a3412', '#78716c', '#a8a29e', '#c2410c', '#d6d3d1']
      : ['#94a3b8', '#cbd5e1', '#64748b', '#a8a29e', '#d6d3d1'];
    for (var sr = 0; sr < 8; sr++) {
      var sy = sr * 32;
      var offset = (sr % 2) * 24;
      for (var sc = -1; sc < 6; sc++) {
        var sx = sc * 52 + offset;
        ctx.fillStyle = stonePalette[Math.abs(sr * 3 + sc) % stonePalette.length];
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(sx + 3, sy + 3, 46, 26, 6);
        else ctx.rect(sx + 3, sy + 3, 46, 26);
        ctx.fill();
      }
    }
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  // Sky-Blue Louvered Window Shutter Texture
  function createLouveredShutterTex() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 128, 256);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 112, 240);
    for (var ly = 24; ly <= 232; ly += 14) {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(16, ly, 96, 6);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(16, ly - 3, 96, 3);
    }
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var roofTileTex   = createTerracottaBarrelTileTex();
  var stoneWallTex  = createStoneMasonryTex(false);
  var chimneyTex    = createStoneMasonryTex(true);
  var shutterTex    = createLouveredShutterTex();

  var creamStuccoMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.48
  });
  var quoinStoneMat  = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.55
  });
  var stoneBaseMat   = new THREE.MeshStandardMaterial({ map: stoneWallTex, roughness: 0.72 });
  var chimneyMat     = new THREE.MeshStandardMaterial({ map: chimneyTex, roughness: 0.68 });
  var terracottaRoofMat = new THREE.MeshStandardMaterial({
    map: roofTileTex,
    roughness: 0.42,
    emissive: 0x431407,
    emissiveIntensity: 0.06
  });
  var terracottaBarrelA = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.40,
    emissive: 0x431407,
    emissiveIntensity: 0.06
  });
  var terracottaBarrelB = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.40,
    emissive: 0x431407,
    emissiveIntensity: 0.06
  });
  var terracottaDarkCap = new THREE.MeshStandardMaterial({
    color: 0x7c2d12,
    roughness: 0.45
  });
  var skyBlueDoorMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.34
  });
  var shutterBlueMat = new THREE.MeshStandardMaterial({
    map: shutterTex,
    roughness: 0.38
  });
  var timberMat      = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.62
  });
  var whiteFenceMat  = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35
  });
  var warmWindowGlowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  var goldMat        = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.65, roughness: 0.22 });

  // 1. Lush Saturated Green Garden Lawn, Side Driveway & Multi-Stone Curved Cobblestone Walk Path (`image_3d2fa6b1.png`)
  var lawn = new THREE.Mesh(
    new THREE.CylinderGeometry(24.5, 25.5, 0.52, 36),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.78 })
  );
  lawn.position.y = 0.24;
  var driveway = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.56, 19.5),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.75 })
  );
  driveway.position.set(-13.8, 0.27, 3.8);
  g.add(lawn, driveway);

  // Detailed Multi-Stone Cobblestone Path curving from the Front Porch Steps (`z = 8.4`) out through the Gate (`z = 19.5`)
  var cobbleColors = [0xcbd5e1, 0xfde68a, 0x94a3b8, 0xd6d3d1, 0xe2e8f0];
  for (var stI = 0; stI < 14; stI++) {
    var pathZ = 8.4 + stI * 0.82;
    var curveX = Math.sin(stI * 0.32) * 0.55;
    for (var sub = -1; sub <= 1; sub++) {
      var stoneMat = new THREE.MeshStandardMaterial({
        color: cobbleColors[(stI + sub + 3) % cobbleColors.length],
        roughness: 0.68
      });
      var cobble = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.74, 0.18, 10), stoneMat);
      cobble.scale.set(1.15, 1.0, 0.82);
      cobble.position.set(curveX + sub * 1.15 + (stI % 2) * 0.18, 0.49, pathZ);
      g.add(cobble);
    }
  }

  // 2. Main Cottage Warm Cream Stucco Walls, Stone Foundation Plinth & Sandstone Corner Quoins (`image_3d2fa6b1.png`)
  var stonePlinth = new THREE.Mesh(new THREE.BoxGeometry(19.2, 2.0, 14.2), stoneBaseMat);
  stonePlinth.position.y = 1.0;
  var mainBody = new THREE.Mesh(new THREE.BoxGeometry(18.6, 9.6, 13.6), creamStuccoMat);
  mainBody.position.y = 6.4;
  mainBody.castShadow = true;
  g.add(stonePlinth, mainBody);

  // Sandstone Corner Quoins along all 4 vertical wall corners
  [[-9.2, 6.7], [9.2, 6.7], [-9.2, -6.7], [9.2, -6.7]].forEach(function(qp) {
    for (var qy = 2.4; qy <= 10.4; qy += 1.15) {
      var quoin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.62, 0.68), quoinStoneMat);
      quoin.position.set(qp[0], qy, qp[1]);
      g.add(quoin);
    }
  });

  // Left & Right Side Gable Triangles (so the Main Roof Ridge runs along X and the Front Roof Slope faces +Z toward the camera!)
  var sideGableShape = new THREE.Shape();
  sideGableShape.moveTo(-6.8, 0);
  sideGableShape.lineTo(6.8, 0);
  sideGableShape.lineTo(0, 6.0);
  sideGableShape.closePath();
  var sideGableGeo = new THREE.ExtrudeGeometry(sideGableShape, { depth: 18.6, bevelEnabled: false });
  sideGableGeo.translate(0, 11.2, -9.3);
  sideGableGeo.rotateY(Math.PI / 2);
  var sideGableMesh = new THREE.Mesh(sideGableGeo, creamStuccoMat);
  g.add(sideGableMesh);

  // 3. Broad Front-Facing & Back-Facing Terracotta Barrel-Tiled Roof Slopes (`image_3d2fa6b1.png`!)
  //    Because `zSide = 1` faces `+Z` (toward the camera), every single terracotta tile & dark stepped collar is clearly visible!
  [-1, 1].forEach(function(zSide) {
    var slopeG = new THREE.Group();
    slopeG.position.set(0, 14.1, zSide * 3.8);
    slopeG.rotation.x = zSide * 0.72;

    var roofDeck = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.56, 10.2), terracottaRoofMat);
    slopeG.add(roofDeck);

    // Warm honey-timber fascia bargeboards on left & right gable edges + front eave fascia
    var eaveTrim = new THREE.Mesh(new THREE.BoxGeometry(20.6, 0.46, 0.42), timberMat);
    eaveTrim.position.set(0, 0.05, zSide * 5.05);
    slopeG.add(eaveTrim);

    // 17 Columns of 3D Sculpted Terracotta Barrel Tiles + Dark Overlapping Course Collars + Scalloped Eave End-Caps!
    for (var tx = -9.6; tx <= 9.6; tx += 1.2) {
      var colIdx = Math.abs(Math.round(tx * 2));
      var bMat = (colIdx % 2 === 0) ? terracottaBarrelA : terracottaBarrelB;
      var barrelRib = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 10.1, 10), bMat);
      barrelRib.rotation.x = Math.PI / 2;
      barrelRib.position.set(tx, 0.34, 0);
      slopeG.add(barrelRib);

      // Contrasting dark burnt-sienna horizontal tile overlap rings along each barrel rib!
      for (var tz = -4.0; tz <= 4.0; tz += 1.6) {
        var tileCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.38, 0.32, 10), terracottaDarkCap);
        tileCollar.rotation.x = Math.PI / 2;
        tileCollar.position.set(tx, 0.38, tz);
        slopeG.add(tileCollar);
      }

      // Clay eave end-cap at the bottom edge of the roof
      var eaveCap = new THREE.Mesh(new THREE.SphereGeometry(0.40, 8, 8), terracottaDarkCap);
      eaveCap.position.set(tx, 0.34, zSide * 5.02);
      slopeG.add(eaveCap);
    }

    g.add(slopeG);
  });

  // Prominent 3D Terracotta Ridge-Cap Spine along the Top Roof Crest (`y = 17.35, z = 0`)
  var mainRidgeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 20.6, 12), terracottaDarkCap);
  mainRidgeCap.rotation.z = Math.PI / 2;
  mainRidgeCap.position.set(0, 17.35, 0);
  g.add(mainRidgeCap);
  for (var rx = -9.6; rx <= 9.6; rx += 1.2) {
    var rRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.10, 8, 14), terracottaBarrelB);
    rRing.rotation.y = Math.PI / 2;
    rRing.position.set(rx, 17.35, 0);
    g.add(rRing);
  }

  // 4. Front Cross-Gable Dormer Peak with Half-Timber Beams, Round Attic Window & 3D Terracotta Roof (`image_3d2fa6b1.png` & `image_82bfab46.png`!)
  var frontGableGroup = new THREE.Group();
  frontGableGroup.position.set(0, 11.0, 2.2);

  var fgShape = new THREE.Shape();
  fgShape.moveTo(-4.8, 0);
  fgShape.lineTo(4.8, 0);
  fgShape.lineTo(0, 5.4);
  fgShape.closePath();
  var fgGeo = new THREE.ExtrudeGeometry(fgShape, { depth: 4.8, bevelEnabled: false });
  var fgWall = new THREE.Mesh(fgGeo, creamStuccoMat);
  frontGableGroup.add(fgWall);

  // Decorative Half-Timbered Gable Beams & Round Multi-Pane Attic Window on the Front Gable
  var vTimber = new THREE.Mesh(new THREE.BoxGeometry(0.32, 5.2, 0.26), timberMat);
  vTimber.position.set(0, 2.6, 4.82);
  var hTimber = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.30, 0.26), timberMat);
  hTimber.position.set(0, 1.2, 4.82);
  var atticWin = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.32, 20), warmWindowGlowMat);
  atticWin.rotation.x = Math.PI / 2;
  atticWin.position.set(0, 2.55, 4.78);
  var atticRim = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.18, 10, 22), whiteFenceMat);
  atticRim.position.set(0, 2.55, 4.92);
  frontGableGroup.add(vTimber, hTimber, atticWin, atticRim);

  // Pitched Terracotta Barrel-Tiled Roof Slopes on the Front Cross-Gable
  [-1, 1].forEach(function(gSide) {
    var fgSlope = new THREE.Group();
    fgSlope.position.set(gSide * 2.6, 2.85, 2.6);
    fgSlope.rotation.z = gSide * -0.82;
    var fgBoard = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.44, 5.8), terracottaRoofMat);
    var fgTrim = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.48, 0.36), timberMat);
    fgTrim.position.set(0, 0, 2.92);
    fgSlope.add(fgBoard, fgTrim);
    for (var dtr = -2.8; dtr <= 2.8; dtr += 0.92) {
      var dRib = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 5.8, 8), Math.abs(Math.round(dtr)) % 2 === 0 ? terracottaBarrelB : terracottaBarrelA);
      dRib.rotation.x = Math.PI / 2;
      dRib.position.set(dtr, 0.26, 0);
      fgSlope.add(dRib);
    }
    frontGableGroup.add(fgSlope);
  });
  var fgRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 5.9, 10), terracottaDarkCap);
  fgRidge.rotation.x = Math.PI / 2;
  fgRidge.position.set(0, 5.55, 2.6);
  frontGableGroup.add(fgRidge);
  g.add(frontGableGroup);

  // 5. Rustic Stone-and-Brick Chimney with Stepped Crown & Twin Terracotta Chimney Pots (`image_3d2fa6b1.png` right roof!)
  var chimney = new THREE.Mesh(new THREE.BoxGeometry(2.8, 8.6, 2.8), chimneyMat);
  chimney.position.set(6.4, 15.8, -1.6);
  var chimCrown = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.58, 3.3), stoneBaseMat);
  chimCrown.position.y = 4.3;
  chimney.add(chimCrown);
  [-0.65, 0.65].forEach(function(cpx) {
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 1.35, 12), terracottaBarrelA);
    pot.position.set(cpx, 5.1, 0);
    var potRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 8, 12), terracottaDarkCap);
    potRim.rotation.x = Math.PI / 2;
    potRim.position.set(cpx, 5.75, 0);
    chimney.add(pot, potRim);
  });
  g.add(chimney);

  // 6. Covered Timber Front Porch Gable Canopy, 3 Curved Stone Steps, Arched Sky-Blue Door & Glowing Hanging Lantern!
  var porchFloor = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.85, 3.6), stoneBaseMat);
  porchFloor.position.set(0, 0.65, 7.8);
  var step1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.32, 0.95), stoneBaseMat);
  step1.position.set(0, 0.48, 9.8);
  var step2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.24, 0.95), stoneBaseMat);
  step2.position.set(0, 0.24, 10.4);
  g.add(porchFloor, step1, step2);

  [-1, 1].forEach(function(pSide) {
    var pSlope = new THREE.Group();
    pSlope.position.set(pSide * 1.85, 7.15, 8.1);
    pSlope.rotation.z = pSide * -0.58;
    var pBoard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.40, 4.2), terracottaRoofMat);
    var pTrim = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.42, 0.32), timberMat);
    pTrim.position.set(0, 0, 2.1);
    pSlope.add(pBoard, pTrim);
    for (var ptr = -1.6; ptr <= 1.6; ptr += 0.8) {
      var pRib = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.2, 8), terracottaBarrelB);
      pRib.rotation.x = Math.PI / 2;
      pRib.position.set(ptr, 0.24, 0);
      pSlope.add(pRib);
    }
    g.add(pSlope);

    // Timber Porch Support Post + Diagonal Knee Brace + Stone Plinth Pedestal
    var postPed = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.85, 0.76), stoneBaseMat);
    postPed.position.set(pSide * 2.7, 1.15, 9.1);
    var pPost = new THREE.Mesh(new THREE.BoxGeometry(0.44, 5.4, 0.44), timberMat);
    pPost.position.set(pSide * 2.7, 3.85, 9.1);
    var brace = new THREE.Mesh(new THREE.BoxGeometry(0.30, 1.35, 0.30), timberMat);
    brace.position.set(pSide * 2.15, 5.75, 9.1);
    brace.rotation.z = pSide * 0.68;
    g.add(postPed, pPost, brace);
  });

  // Detailed Sky-Blue Arched Wooden Front Door with Stone Arch Surround, Recessed Panels, Upper Window Lite & Gold Handle
  var doorArchFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.2, 0.36), quoinStoneMat);
  doorArchFrame.position.set(0, 2.8, 6.72);
  var doorArchTopFrame = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.36, 20), quoinStoneMat);
  doorArchTopFrame.rotation.x = Math.PI / 2;
  doorArchTopFrame.position.set(0, 4.9, 6.72);

  var doorRect = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.0, 0.46), skyBlueDoorMat);
  doorRect.position.set(0, 2.7, 6.78);
  var doorArch = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.46, 20), skyBlueDoorMat);
  doorArch.rotation.x = Math.PI / 2;
  doorArch.position.set(0, 4.7, 6.78);

  // Upper arched glass window lite inside the blue door + recessed lower panels + brass lever handle
  var doorGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.50, 16), warmWindowGlowMat);
  doorGlass.rotation.x = Math.PI / 2;
  doorGlass.position.set(0, 4.55, 6.80);
  [-0.58, 0.58].forEach(function(dpx) {
    var dPanel = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.85, 0.50), shutterBlueMat);
    dPanel.position.set(dpx, 2.35, 6.80);
    g.add(dPanel);
  });
  var doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), goldMat);
  doorKnob.position.set(0.96, 2.75, 7.08);
  var porchLantern = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), warmWindowGlowMat);
  porchLantern.position.set(0, 6.1, 8.9);
  var lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.42, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  lanternCap.position.set(0, 6.48, 8.9);
  g.add(doorArchFrame, doorArchTopFrame, doorRect, doorArch, doorGlass, doorKnob, porchLantern, lanternCap);

  // 7. Multi-Pane Warm-Glowing Casement Windows with Sky-Blue Louvered Shutters & Overflowing Flower Planter Boxes (`image_3d2fa6b1.png`!)
  var flowerCols = [0xdc2626, 0xeab308, 0xea580c, 0xdb2777, 0x7c3aed, 0x2563eb];
  var foliageGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  var foliageLimeMat  = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 });

  [-5.6, 5.6].forEach(function(wx) {
    [4.2, 8.6].forEach(function(wy) {
      var wFrame = new THREE.Mesh(new THREE.BoxGeometry(2.95, 2.95, 0.38), whiteFenceMat);
      wFrame.position.set(wx, wy, 6.74);
      var wGlass = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.55, 0.44), warmWindowGlowMat);
      wGlass.position.set(wx, wy, 6.78);
      // White muntin crossbars
      var mBarV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.48), whiteFenceMat);
      mBarV.position.set(wx, wy, 6.80);
      var mBarH = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.48), whiteFenceMat);
      mBarH.position.set(wx, wy, 6.80);
      g.add(wFrame, wGlass, mBarV, mBarH);

      // Sky-blue louvered shutters on left & right of each window
      [-1.88, 1.88].forEach(function(sx) {
        var shutter = new THREE.Mesh(new THREE.BoxGeometry(0.84, 2.85, 0.42), shutterBlueMat);
        shutter.position.set(wx + sx, wy, 6.80);
        g.add(shutter);
      });

      // Wooden flower box overflowing with lush green foliage & multi-colored blossoms under each window
      var planter = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.62, 0.85), timberMat);
      planter.position.set(wx, wy - 1.65, 7.12);
      g.add(planter);
      for (var fb = -2; fb <= 2; fb++) {
        var leafBed = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), fb % 2 === 0 ? foliageGreenMat : foliageLimeMat);
        leafBed.position.set(wx + fb * 0.58, wy - 1.28, 7.18);
        var flBall = new THREE.Mesh(
          new THREE.SphereGeometry(0.36, 8, 8),
          new THREE.MeshBasicMaterial({ color: flowerCols[Math.abs(Math.round(wx + wy + fb * 2)) % flowerCols.length] })
        );
        flBall.position.set(wx + fb * 0.56, wy - 1.05, 7.26);
        g.add(leafBed, flBall);
      }
    });
  });

  // Climbing Green Ivy Vines & Blossoms creeping up the Left Stucco Wall & Porch Corner (`image_3d2fa6b1.png`!)
  for (var ivyI = 0; ivyI < 12; ivyI++) {
    var ivyLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.52 - (ivyI % 3) * 0.08, 8, 8), ivyI % 2 === 0 ? foliageGreenMat : foliageLimeMat);
    ivyLeaf.scale.set(1.2, 0.9, 0.55);
    ivyLeaf.position.set(-8.6 + Math.sin(ivyI * 0.7) * 0.55, 1.4 + ivyI * 0.72, 6.88);
    g.add(ivyLeaf);
    if (ivyI % 3 === 0) {
      var ivyBloom = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      ivyBloom.position.set(-8.5 + Math.sin(ivyI * 0.7) * 0.55, 1.5 + ivyI * 0.72, 7.08);
      g.add(ivyBloom);
    }
  }

  // 8. Slatted Wooden Garden Bench, Sky-Blue Watering Can, Sky-Blue Mailbox & Stone Lantern Gate Pillar (`image_3d2fa6b1.png`!)
  var benchG = new THREE.Group();
  benchG.position.set(-6.2, 0.45, 11.4);
  benchG.rotation.y = 0.28;
  var bSeat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.26, 1.3), timberMat);
  bSeat.position.y = 0.88;
  var bBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.15, 0.24), timberMat);
  bBack.position.set(0, 1.50, -0.52);
  [-1.55, 1.55].forEach(function(bx) {
    var bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.90, 1.2), timberMat);
    bLeg.position.set(bx, 0.45, 0);
    var bArm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 1.28), timberMat);
    bArm.position.set(bx, 1.22, 0);
    benchG.add(bLeg, bArm);
  });
  // Sky-blue watering can with spout & handle right beside the bench (`image_3d2fa6b1.png`!)
  var wCan = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.85, 14), skyBlueDoorMat);
  wCan.position.set(2.45, 0.45, 0.25);
  var wSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.72, 8), skyBlueDoorMat);
  wSpout.position.set(2.88, 0.62, 0.25);
  wSpout.rotation.z = -0.65;
  var wHandle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 12), skyBlueDoorMat);
  wHandle.position.set(2.15, 0.65, 0.25);
  benchG.add(bSeat, bBack, wCan, wSpout, wHandle);
  g.add(benchG);

  // Sky-Blue American-Style Mailbox on a Wooden Post with Red Flag on the Left of the Front Gate (`image_3d2fa6b1.png`!)
  var mbG = new THREE.Group();
  mbG.position.set(-4.2, 0.45, 16.2);
  var mbPost = new THREE.Mesh(new THREE.BoxGeometry(0.40, 2.5, 0.40), timberMat);
  mbPost.position.y = 1.25;
  var mbBox = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.80, 1.75), skyBlueDoorMat);
  mbBox.position.y = 2.55;
  var mbTop = new THREE.Mesh(new THREE.CylinderGeometry(0.59, 0.59, 1.75, 14), skyBlueDoorMat);
  mbTop.rotation.x = Math.PI / 2;
  mbTop.position.y = 2.95;
  var mbFlag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.32), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  mbFlag.position.set(0.65, 3.08, 0.22);
  mbG.add(mbPost, mbBox, mbTop, mbFlag);
  g.add(mbG);

  // Rustic Stone Gate Pillar with Glowing Warm Garden Lantern on the Right of the Front Gate (`image_3d2fa6b1.png` right foreground!)
  var gatePillarG = new THREE.Group();
  gatePillarG.position.set(4.2, 0.45, 16.2);
  var gPillar = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.8, 1.55), stoneBaseMat);
  gPillar.position.y = 1.4;
  var gPillarCap = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.36, 1.85), quoinStoneMat);
  gPillarCap.position.y = 2.9;
  var gLanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.36, 0.85, 8), warmWindowGlowMat);
  gLanternGlass.position.y = 3.5;
  var gLanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.48, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  gLanternRoof.position.y = 4.12;
  gatePillarG.add(gPillar, gPillarCap, gLanternGlass, gLanternRoof);
  g.add(gatePillarG);

  // 9. Parked Metallic-Blue Family SUV & Red Vintage Bicycle in the Left Driveway (`image_3d2fa6b1.png` left!)
  var suvG = new THREE.Group();
  suvG.position.set(-13.8, 0.54, 3.2);
  suvG.rotation.y = 0.12;
  var suvMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.22, metalness: 0.25, emissive: 0x1e3a8a, emissiveIntensity: 0.12 });
  var suvGlass = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
  var suvTire = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  var suvRim  = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.25 });
  var suvLower = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.50, 7.2), suvMat);
  suvLower.position.y = 1.18;
  suvLower.castShadow = true;
  var suvCabin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.32, 4.5), suvMat);
  suvCabin.position.set(0, 2.42, -0.4);
  var suvWins = new THREE.Mesh(new THREE.BoxGeometry(3.28, 1.02, 4.15), suvGlass);
  suvWins.position.set(0, 2.42, -0.4);
  var suvWindshield = new THREE.Mesh(new THREE.BoxGeometry(2.95, 1.05, 0.2), suvGlass);
  suvWindshield.position.set(0, 2.38, 1.88);
  suvWindshield.rotation.x = -0.25;
  var suvGrille = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.18), suvRim);
  suvGrille.position.set(0, 1.15, 3.62);
  [[-1.25, 3.62], [1.25, 3.62]].forEach(function(hlp) {
    var hl = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), warmWindowGlowMat);
    hl.position.set(hlp[0], 1.28, hlp[1]);
    suvG.add(hl);
  });
  [[-1.8, 2.2], [1.8, 2.2], [-1.8, -2.2], [1.8, -2.2]].forEach(function(wp) {
    var wh = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.52, 14), suvTire);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wp[0], 0.68, wp[1]);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.56, 10), suvRim);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wp[0], 0.68, wp[1]);
    suvG.add(wh, hub);
  });
  suvG.add(suvLower, suvCabin, suvWins, suvWindshield, suvGrille);
  g.add(suvG);

  // Red Vintage Bicycle with Handlebars, Seat & Basket leaning near the Cottage Wall (`image_3d2fa6b1.png`!)
  var bikeG = new THREE.Group();
  bikeG.position.set(-9.6, 0.52, 7.4);
  bikeG.rotation.y = 0.48;
  var bikeRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.28, emissive: 0x991b1b, emissiveIntensity: 0.15 });
  [-0.98, 0.98].forEach(function(bz) {
    var bWheel = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.10, 8, 18), suvTire);
    bWheel.rotation.y = Math.PI / 2;
    bWheel.position.set(0, 0.60, bz);
    bikeG.add(bWheel);
  });
  var bikeFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.95, 8), bikeRed);
  bikeFrame.rotation.x = Math.PI / 2;
  bikeFrame.position.set(0, 0.98, 0);
  var bikeHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8), suvRim);
  bikeHandle.rotation.z = Math.PI / 2;
  bikeHandle.position.set(0, 1.55, 0.88);
  var bikeSeat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.42), timberMat);
  bikeSeat.position.set(0, 1.38, -0.45);
  bikeG.add(bikeFrame, bikeHandle, bikeSeat);
  g.add(bikeG);

  // 10. Two Lush Storybook Deciduous Shade Trees Framing the Cottage + White Picket Fence & Abundant Multi-Tiered Flower Beds!
  [[-12.5, -6.5, 1.35], [12.5, -5.8, 1.42], [13.5, 6.2, 1.15]].forEach(function(tp) {
    var treeG = new THREE.Group();
    treeG.position.set(tp[0], 0.4, tp[1]);
    treeG.scale.set(tp[2], tp[2], tp[2]);
    var tTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 5.2, 10), timberMat);
    tTrunk.position.y = 2.6;
    var cMain = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 14), foliageGreenMat);
    cMain.position.set(0, 6.2, 0);
    var cLeft = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 12), foliageLimeMat);
    cLeft.position.set(-1.8, 5.4, 0.9);
    var cRight = new THREE.Mesh(new THREE.SphereGeometry(2.5, 14, 12), foliageLimeMat);
    cRight.position.set(1.8, 5.5, 0.8);
    var cTop = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 12), foliageGreenMat);
    cTop.position.set(0.2, 8.2, -0.2);
    treeG.add(tTrunk, cMain, cLeft, cRight, cTop);
    g.add(treeG);
  });

  // Helper to spawn lush multi-blossom Hydrangea / Rose Garden Clusters (`image_3d2fa6b1.png` & `image_82bfab46.png`!)
  function addGardenFlowerBedCluster(bx, bz, radius, mainColHex, accentColHex) {
    var bedGroup = new THREE.Group();
    bedGroup.position.set(bx, 0.48, bz);
    var mound = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), foliageGreenMat);
    mound.scale.set(1.35, 0.68, 1.15);
    mound.position.y = radius * 0.35;
    var mound2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.78, 10, 8), foliageLimeMat);
    mound2.scale.set(1.2, 0.72, 1.1);
    mound2.position.set(radius * 0.45, radius * 0.32, 0.25);
    bedGroup.add(mound, mound2);

    var mMat = new THREE.MeshBasicMaterial({ color: mainColHex });
    var aMat = new THREE.MeshBasicMaterial({ color: accentColHex });
    for (var bi = 0; bi < 9; bi++) {
      var ang = (bi / 9) * Math.PI * 2;
      var dist = (bi % 2 === 0) ? radius * 0.65 : radius * 0.32;
      var fl = new THREE.Mesh(new THREE.SphereGeometry(0.36 + (bi % 2) * 0.08, 8, 8), bi % 2 === 0 ? mMat : aMat);
      fl.position.set(Math.cos(ang) * dist, radius * 0.68 + (bi % 2) * 0.16, Math.sin(ang) * dist * 0.85);
      bedGroup.add(fl);
    }
    g.add(bedGroup);
  }

  // Abundant colorful flower beds flanking the front cottage wall, cobblestone path & white picket fence!
  addGardenFlowerBedCluster(-5.8, 7.8, 1.55, 0x2563eb, 0x7c3aed); // Blue & lavender hydrangeas under left window
  addGardenFlowerBedCluster( 5.8, 7.8, 1.55, 0xdc2626, 0xeab308); // Red & yellow roses under right window
  addGardenFlowerBedCluster(-3.5, 9.8, 1.35, 0xdb2777, 0xea580c); // Pink & orange blossoms left of porch steps
  addGardenFlowerBedCluster( 3.5, 9.8, 1.35, 0x2563eb, 0xeab308); // Royal-blue & yellow blossoms right of porch steps
  addGardenFlowerBedCluster(-3.8, 13.0, 1.45, 0xea580c, 0xdc2626); // Along left side of cobblestone path
  addGardenFlowerBedCluster( 4.0, 13.0, 1.45, 0x7c3aed, 0xdb2777); // Along right side of cobblestone path
  addGardenFlowerBedCluster( 7.2, 11.6, 1.65, 0x2563eb, 0x38bdf8); // Big blue hydrangea bush on right lawn
  addGardenFlowerBedCluster(10.2, 10.2, 1.50, 0xdb2777, 0x7c3aed); // Pink & violet flower bush on right lawn
  addGardenFlowerBedCluster(-7.8, 13.8, 1.45, 0xdc2626, 0xeab308); // Red & gold rose cluster near wooden bench
  addGardenFlowerBedCluster(-2.6, 17.6, 1.35, 0xea580c, 0xeab308); // Outside left of front gate
  addGardenFlowerBedCluster( 2.8, 17.6, 1.35, 0xdc2626, 0xdb2777); // Outside right of front gate

  // Crisp White Picket Fence with Pointed Pickets & Lush Front-Edge Flower Borders
  [-9.2, 9.2].forEach(function(rx) {
    var railTop = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.24, 0.20), whiteFenceMat);
    railTop.position.set(rx, 1.82, 16.2);
    var railBot = railTop.clone();
    railBot.position.y = 0.98;
    g.add(railTop, railBot);
  });
  for (var fx = -14.4; fx <= 14.4; fx += 1.35) {
    if (Math.abs(fx) < 3.6) continue; // Wide welcoming front gate opening for Mom & Dad!
    var picket = new THREE.Mesh(new THREE.BoxGeometry(0.46, 2.35, 0.22), whiteFenceMat);
    picket.position.set(fx, 1.25, 16.2);
    var picketTip = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.45, 4), whiteFenceMat);
    picketTip.rotation.y = Math.PI / 4;
    picketTip.position.set(fx, 2.62, 16.2);
    g.add(picket, picketTip);

    if (Math.abs(fx) % 2.7 < 1.5) {
      addGardenFlowerBedCluster(
        fx,
        15.0,
        1.25,
        flowerCols[Math.abs(Math.round(fx)) % flowerCols.length],
        flowerCols[(Math.abs(Math.round(fx)) + 2) % flowerCols.length]
      );
    }
  }

  scene.add(g);

  // 11. Hero-Proportioned 3D Cartoon Mom & Dad standing prominently on the Front Cobblestone Path by the Gate
  //     and waving warmly toward Little Train Toby and the Gameplay Camera (`image_3d2fa6b1.png`!)
  var cosH = Math.cos(houseRotY);
  var sinH = Math.sin(houseRotY);
  function placeParentInGarden(role, localX, localZ, faceYawOffset) {
    var wx = mx + localX * cosH + localZ * sinH;
    var wz = mz - localX * sinH + localZ * cosH;
    return buildDetailedFamilyPerson(role, wx, wz, houseRotY + (faceYawOffset || 0), 2.02);
  }
  placeParentInGarden('dad', -2.1, 13.6, 0.08);
  placeParentInGarden('mom',  2.1, 13.6, -0.08);

  // Register 3D Landmark Camera Showcase for `J_WEST -> J_NW`:
  // Framed close enough and at a warm 3D angle so Mom & Dad's faces, the front terracotta tiled roof,
  // the arched blue door, blue shutters, flower beds, and SUV are crystal-clear!
  var frontLookX = mx + 7.5 * sinH;
  var frontLookZ = mz + 7.5 * cosH;
  window.registerLandmarkShowcase('J_WEST', 'J_NW', {
    lookTarget: new THREE.Vector3(frontLookX, my + 6.8, frontLookZ),
    camHeight: 15.5,
    camBack: 30,
    camSide: -22,
    lookLerp: 0.68
  });
})();

// 7. GRANDMA & GRANDPA'S COZY COUNTRY COTTAGE (`J_NORTH -> J_NE` at x = 148, z = -226)
(function buildGrandmaAndGrandpaHouseLandmark() {
  var gx = 148, gz = -226;
  var gy = terrainY(gx, gz);
  var g = new THREE.Group();
  g.position.set(gx, gy, gz);
  g.rotation.y = -0.35;

  var cottageWallMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.55 });
  var cottageRoofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.50 });
  var timberMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.68 });
  var greenShutterMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });

  var garden = new THREE.Mesh(new THREE.CylinderGeometry(22, 23, 0.6, 28), new THREE.MeshStandardMaterial({ color: 0x86efac }));
  garden.position.y = 0.25;
  var house = new THREE.Mesh(new THREE.BoxGeometry(17, 10.5, 13.5), cottageWallMat);
  house.position.y = 5.5;
  house.castShadow = true;
  var roof = new THREE.Mesh(new THREE.ConeGeometry(14.5, 7.5, 4), cottageRoofMat);
  roof.position.y = 14.3;
  roof.rotation.y = Math.PI / 4;
  var porch = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.8, 4.5), timberMat);
  porch.position.set(0, 0.8, 8.2);
  var porchRoof = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.55, 4.6), cottageRoofMat);
  porchRoof.position.set(0, 5.8, 8.2);
  porchRoof.rotation.x = 0.18;
  var chimney = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6.8, 2.5), new THREE.MeshStandardMaterial({ color: 0x7c2d12 }));
  chimney.position.set(-4.8, 14.8, -2.0);
  var frontDoor = new THREE.Mesh(new THREE.BoxGeometry(2.7, 4.4, 0.42), greenShutterMat);
  frontDoor.position.set(0, 3.0, 6.8);

  [-4.6, 4.6].forEach(function(wx) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 0.4), sharedWindowMat);
    win.position.set(wx, 5.2, 6.8);
    var shL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.7, 0.42), greenShutterMat);
    shL.position.set(wx - 1.7, 5.2, 6.82);
    var shR = shL.clone();
    shR.position.x = wx + 1.7;
    g.add(win, shL, shR);
  });

  // Apple Orchard Trees with Red Apples & Wooden Greenhouse/Coop beside Grandma's Cottage
  [-13.5, 13.5].forEach(function(tx) {
    var appleTree = new THREE.Group();
    appleTree.position.set(tx, 0.4, 4.0);
    var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 4.2, 8), timberMat);
    tr.position.y = 2.1;
    var cr = new THREE.Mesh(new THREE.SphereGeometry(3.4, 14, 12), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
    cr.position.y = 5.4;
    appleTree.add(tr, cr);
    for (var ap = 0; ap < 6; ap++) {
      var apple = new THREE.Mesh(new THREE.SphereGeometry(0.40, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      var aAng = (ap / 6) * Math.PI * 2;
      apple.position.set(Math.cos(aAng) * 2.7, 5.0 + (ap % 2) * 0.8, Math.sin(aAng) * 2.7);
      appleTree.add(apple);
    }
    g.add(appleTree);
  });

  g.add(garden, house, roof, porch, porchRoof, chimney, frontDoor);
  scene.add(g);

  // Detailed 3D Grandma & Grandpa waving warmly from the front garden path!
  buildDetailedFamilyPerson('grandma', gx - 7.5, gz + 15.2, -0.35);
  buildDetailedFamilyPerson('grandpa', gx - 3.8, gz + 16.4, -0.35);

  window.registerLandmarkShowcase('J_NORTH', 'J_NE', {
    lookTarget: new THREE.Vector3(gx, gy + 8.0, gz),
    camHeight: 20,
    camBack: 38,
    camSide: -26,
    lookLerp: 0.54
  });
})();

// Lush Forest Park with 2.5D Storybook Pine Trees grounded on terrain
for (var ti2 = 0; ti2 < 75; ti2++) {
  var tx = -330 + (ti2 % 12) * 18;
  var tz = -110 + Math.floor(ti2 / 12) * 28;
  if (isNearTrack(tx, tz, 15) || Math.abs(tz + 85) < 26) continue;
  if (Math.hypot(tx + 256, tz + 112) < 32 || Math.hypot(tx + 286, tz - 92) < 32) continue;
  window.spawnStorybookPine(tx, null, tz, 0.92 + (ti2 % 3) * 0.14, ti2 % 3);
}

var wCols = [0xfef08a, 0xbae6fd, 0xfbcfe8, 0xfed7aa, 0xd9f99d];
var rCols = [0xdc2626, 0x1d4ed8, 0x047857, 0x7c2d12, 0x6d28d9];
for (var hx = -180; hx <= 180; hx += 64) {
  for (var hz = -160; hz <= 170; hz += 64) {
    if (Math.abs(hz + 85) < 30 || Math.hypot(hx, hz) < 56) continue;
    if (Math.hypot(hx + 52, hz + 108) < 38) continue;
    var ci = Math.abs(Math.floor(hx + hz)) % wCols.length;
    buildHouse(hx, 0, hz, 10, 9, 7.5 + (ci % 3) * 1.5, wCols[ci], rCols[ci], null, null);
  }
}

// Sparkling Blue River sitting inside the carved River Valley at z = -85 (stopping before the Airport Apron at x = 232!)
var river = new THREE.Mesh(
  new THREE.PlaneGeometry(840, 34),
  new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.22 })
);
river.rotation.x = -Math.PI / 2;
river.position.set(-190, -0.35, -85);
scene.add(river);
window.riverMesh = river;

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
  boats.push({ mesh: bg, x: -240 + bi * 75, dir: bi % 2 === 0 ? 1 : -1, speed: 0.22 });
}

window.windmillBlades = new THREE.Group();
var wmG = new THREE.Group();
wmG.position.set(-220, terrainY(-220, 265), 265);
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

// 8. FULL 3D FOOTBALL STADIUM BOWL WITH FLOODLIGHTS & ANIMATED MATCH (`J_SOUTH -> J_SW` at x = -115, z = 258)
window.soccerPlayers = [];
var stadG = new THREE.Group();
var stX = -115, stZ = 258;
var stY = terrainY(stX, stZ);
stadG.position.set(stX, stY, stZ);

var pitch = new THREE.Mesh(new THREE.CylinderGeometry(24, 25, 1.2, 36), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 }));
pitch.position.y = 0.3;
var centerCircle = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.18, 8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
centerCircle.rotation.x = Math.PI / 2;
centerCircle.position.y = 0.92;
var halfwayLine = new THREE.Mesh(new THREE.BoxGeometry(36, 0.12, 0.32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
halfwayLine.position.y = 0.92;

// Tiered Stadium Grandstand Bowl & White Cantilevered Roof Canopy
var lowerStand = new THREE.Mesh(
  new THREE.CylinderGeometry(28.5, 24.5, 5.5, 36, 1, true),
  new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, side: THREE.DoubleSide })
);
lowerStand.position.y = 3.2;
var upperStand = new THREE.Mesh(
  new THREE.CylinderGeometry(33.0, 28.5, 6.2, 36, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5, side: THREE.DoubleSide })
);
upperStand.position.y = 8.8;
var outerFacade = new THREE.Mesh(
  new THREE.CylinderGeometry(33.6, 33.6, 11.8, 36, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide })
);
outerFacade.position.y = 6.0;
var stadiumCanopy = new THREE.Mesh(
  new THREE.RingGeometry(24.5, 34.2, 36),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, side: THREE.DoubleSide })
);
stadiumCanopy.rotation.x = -Math.PI / 2;
stadiumCanopy.position.y = 12.0;

// 2 Soccer Goalposts on Opposite Ends of the Pitch
[-16.5, 16.5].forEach(function(gz) {
  var goal = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.8, 1.8), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true }));
  goal.position.set(0, 2.2, gz);
  stadG.add(goal);
});

// 4 Tall Stadium Floodlight Towers
for (var fli = 0; fli < 4; fli++) {
  var fang = (fli / 4) * Math.PI * 2 + Math.PI * 0.25;
  var fx = Math.cos(fang) * 34.5;
  var fz = Math.sin(fang) * 34.5;
  var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 22, 10), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 }));
  mast.position.set(fx, 11, fz);
  var lightBank = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.6, 1.2), new THREE.MeshBasicMaterial({ color: 0xfef9c3 }));
  lightBank.position.set(fx, 22.5, fz);
  lightBank.lookAt(0, 2.0, 0);
  stadG.add(mast, lightBank);
}

window.soccerBall = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
soccerBall.position.y = 1.4;
stadG.add(pitch, centerCircle, halfwayLine, lowerStand, upperStand, outerFacade, stadiumCanopy, soccerBall);

for (var spi = 0; spi < 6; spi++) {
  var spMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 8), new THREE.MeshStandardMaterial({ color: spi < 3 ? 0xef4444 : 0x2563eb }));
  spMesh.position.y = 1.6;
  stadG.add(spMesh);
  soccerPlayers.push({ mesh: spMesh, angle: (spi / 6) * Math.PI * 2, radius: 7 + (spi % 2) * 6 });
}
scene.add(stadG);

window.registerLandmarkShowcase('J_SOUTH', 'J_SW', {
  lookTarget: new THREE.Vector3(stX, stY + 7.5, stZ),
  camHeight: 23,
  camBack: 42,
  camSide: -28
});

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
// HERO CHARACTER #1: TURQUOISE, CREAM & GOLD STEAM LOCOMOTIVE ("DANÍČEK")
// & MATCHING TREASURE WAGONS (Faithful 3D Model from Reference Sheet!)
// ============================================================================
window.wheelMeshes = [];
window.trainNameplateMaterials = [];

function drawFivePointStar(ctx, cx, cy, spikes, outerR, innerR, fillStyle, strokeStyle, lineWidth) {
  var rot = Math.PI / 2 * 3;
  var x = cx;
  var y = cy;
  var step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (var i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerR;
    y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerR;
    y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth || 3;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

window.createTrainNameplateTexture = function(rawName) {
  var cleanName = String(rawName !== undefined ? rawName : (window.getTrainName ? window.getTrainName() : 'Daníček')).trim();
  if (!cleanName) cleanName = 'Daníček';
  var upperName = cleanName.toUpperCase();

  var c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  var ctx = c.getContext('2d');

  // 1. Metallic Golden Outer Frame with Rounded Corners
  var goldGrad = ctx.createLinearGradient(0, 0, 0, 160);
  goldGrad.addColorStop(0, '#fde047');
  goldGrad.addColorStop(0.5, '#eab308');
  goldGrad.addColorStop(1, '#a16207');
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(6, 6, 500, 148, 36);
  else ctx.rect(6, 6, 500, 148);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#713f12';
  ctx.stroke();

  // 2. Warm Cream Inner Plaque
  var creamGrad = ctx.createLinearGradient(0, 18, 0, 142);
  creamGrad.addColorStop(0, '#fffbeb');
  creamGrad.addColorStop(0.55, '#fef3c7');
  creamGrad.addColorStop(1, '#fde68a');
  ctx.fillStyle = creamGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(18, 18, 476, 124, 26);
  else ctx.rect(18, 18, 476, 124);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  // 3. Left & Right Embossed Golden Stars ("★ DANÍČEK ★")
  drawFivePointStar(ctx, 56, 80, 5, 22, 10, '#f59e0b', '#92400e', 3);
  drawFivePointStar(ctx, 456, 80, 5, 22, 10, '#f59e0b', '#92400e', 3);

  // 4. Auto-Fitting Bold Dark-Teal/Navy Typography so even long names fit cleanly between the stars!
  var maxTextWidth = 336;
  var fontSize = 62;
  var fontFamily = "'Segoe UI', 'Arial Rounded MT Bold', system-ui, sans-serif";
  ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
  var measuredW = ctx.measureText(upperName).width;
  while (measuredW > maxTextWidth && fontSize > 24) {
    fontSize -= 2;
    ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
    measuredW = ctx.measureText(upperName).width;
  }

  ctx.save();
  ctx.translate(256, 84);
  if (measuredW > maxTextWidth) {
    ctx.scale(maxTextWidth / measuredW, 1);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Subtle warm gold shadow under text
  ctx.fillStyle = 'rgba(180, 83, 9, 0.28)';
  ctx.fillText(upperName, 0, 4);

  // Deep teal-navy main lettering matching reference sheet
  ctx.fillStyle = '#0f4c5c';
  ctx.fillText(upperName, 0, 0);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#083344';
  ctx.strokeText(upperName, 0, 0);
  ctx.restore();

  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
};

window.updateTrainNameplates = function(newName) {
  var tex = window.createTrainNameplateTexture(newName);
  for (var i = 0; i < window.trainNameplateMaterials.length; i++) {
    var mat = window.trainNameplateMaterials[i];
    if (mat) {
      if (mat.map && mat.map.dispose) mat.map.dispose();
      mat.map = tex;
      mat.needsUpdate = true;
    }
  }
};

function create3DNameplateGroup(width, height) {
  var g = new THREE.Group();
  var goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.26, metalness: 0.65 });

  var backing = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, height, width),
    goldTrimMat
  );
  g.add(backing);

  var initialName = window.getTrainName ? window.getTrainName() : 'Daníček';
  var tex = window.createTrainNameplateTexture(initialName);
  var plateMat = new THREE.MeshBasicMaterial({ map: tex });
  window.trainNameplateMaterials.push(plateMat);

  var facePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.98, height * 0.96),
    plateMat
  );
  facePlane.position.set(0.09, 0, 0);
  facePlane.rotation.y = Math.PI / 2;
  g.add(facePlane);

  return g;
}

function createSideStarBadgeTexture() {
  var c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  var ctx = c.getContext('2d');
  drawFivePointStar(ctx, 64, 64, 5, 50, 22, '#facc15', '#b45309', 6);
  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
}
var sharedSideStarTex = null;

function createStorybookTrainWheel(radius, rimHex, tireHex, hubHex) {
  var wg = new THREE.Group();
  var creamTireMat = new THREE.MeshStandardMaterial({ color: tireHex || 0xfef3c7, roughness: 0.35 });
  var turqDiscMat  = new THREE.MeshStandardMaterial({ color: rimHex || 0x0d9488, roughness: 0.28, metalness: 0.12 });
  var goldHubMat   = new THREE.MeshStandardMaterial({ color: hubHex || 0xeab308, roughness: 0.24, metalness: 0.68 });
  var darkFlangeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

  // Inner dark rail flange
  var flange = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.14, 24),
    darkFlangeMat
  );
  flange.rotation.z = Math.PI / 2;
  flange.position.x = -0.16;

  // Cream outer tire rim
  var tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.44, 24),
    creamTireMat
  );
  tire.rotation.z = Math.PI / 2;

  // Turquoise wheel disc
  var disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, 0.48, 22),
    turqDiscMat
  );
  disc.rotation.z = Math.PI / 2;

  // Golden radial spokes (4 crossed bars = 8 spokes)
  for (var sp = 0; sp < 4; sp++) {
    var spokeBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, radius * 1.48, 0.14),
      goldHubMat
    );
    spokeBar.rotation.x = (sp / 4) * Math.PI;
    wg.add(spokeBar);
  }

  // Golden center hub & outer cream-cap accent
  var hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.32, radius * 0.32, 0.58, 16),
    goldHubMat
  );
  hub.rotation.z = Math.PI / 2;

  var hubCap = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.22, 12, 12),
    creamTireMat
  );
  hubCap.position.x = 0.24;
  var hubCapIn = hubCap.clone();
  hubCapIn.position.x = -0.24;

  wg.add(flange, tire, disc, hub, hubCap, hubCapIn);
  return wg;
}

function createHeroLocomotiveFaceTexture() {
  var c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  var ctx = c.getContext('2d');

  // Warm ivory-cream sculpted face base with soft radial shading
  var faceGrad = ctx.createRadialGradient(256, 230, 40, 256, 256, 252);
  faceGrad.addColorStop(0, '#fffbeb');
  faceGrad.addColorStop(0.68, '#fde6c4');
  faceGrad.addColorStop(1, '#f3cfa0');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 248, 0, Math.PI * 2);
  ctx.fill();

  // Soft rosy cheeks
  [112, 400].forEach(function(cx) {
    var cheekGrad = ctx.createRadialGradient(cx, 308, 6, cx, 308, 48);
    cheekGrad.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
    cheekGrad.addColorStop(1, 'rgba(251, 113, 133, 0.0)');
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.arc(cx, 308, 48, 0, Math.PI * 2);
    ctx.fill();
  });

  // Friendly arched dark-teal eyebrows ("Přátelský výraz")
  ctx.strokeStyle = '#0f4c5c';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(126, 136);
  ctx.quadraticCurveTo(174, 102, 218, 126);
  ctx.stroke();
  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(294, 126);
  ctx.quadraticCurveTo(338, 102, 386, 136);
  ctx.stroke();

  // Large expressive cartoon eyes with bright ocean-blue irises
  [176, 336].forEach(function(ex, idx) {
    var ey = 214;
    // Sclera (white of eye)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 54, 64, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Ocean-blue iris gradient
    var ix = ex + (idx === 0 ? 6 : -6);
    var iy = ey + 4;
    var irisGrad = ctx.createRadialGradient(ix - 8, iy - 10, 6, ix, iy, 38);
    irisGrad.addColorStop(0, '#38bdf8');
    irisGrad.addColorStop(0.55, '#0284c7');
    irisGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(ix, iy, 33, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deep dark pupil
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(ix, iy + 2, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big primary specular catchlight + secondary sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ix - 10, iy - 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ix + 11, iy + 12, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cute sculpted nose shadow & highlight in center
  var noseGrad = ctx.createRadialGradient(248, 272, 4, 256, 280, 32);
  noseGrad.addColorStop(0, '#fffbeb');
  noseGrad.addColorStop(0.7, '#fcd9a8');
  noseGrad.addColorStop(1, '#d9a973');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(256, 280, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful open smile with white upper teeth and warm red-pink tongue
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(176, 336);
  ctx.quadraticCurveTo(256, 356, 336, 336);
  ctx.quadraticCurveTo(324, 424, 256, 424);
  ctx.quadraticCurveTo(188, 424, 176, 336);
  ctx.closePath();
  ctx.fillStyle = '#881337';
  ctx.fill();
  ctx.clip();

  // Upper white teeth band
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(170, 328, 172, 28);

  // Warm pink-red tongue at bottom of mouth
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.ellipse(256, 408, 52, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Smooth smile outline
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(176, 336);
  ctx.quadraticCurveTo(256, 356, 336, 336);
  ctx.quadraticCurveTo(324, 424, 256, 424);
  ctx.quadraticCurveTo(188, 424, 176, 336);
  ctx.closePath();
  ctx.stroke();

  // Dimple smile corners
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(168, 334, 12, -0.4, 1.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(344, 334, 12, 1.7, 3.5);
  ctx.stroke();

  return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
}
var sharedHeroLocoFaceTex = null;

window.createDetailedLocomotive = function(primaryHex, cabinHex, isBullet) {
  var g = new THREE.Group();
  // Scaled to 0.64 so the train & wagons sit with ideal proportions on the tracks and in tunnels!
  g.scale.set(0.64, 0.64, 0.64);

  // Determine if this is the Player's Hero Turquoise Locomotive (or a custom-colored AI friend)
  var isHeroTurquoise = !isBullet && (!primaryHex || primaryHex === 0x14b8a6 || primaryHex === 0x0d9488 || primaryHex === 0xfacc15);
  var mainBodyHex = isHeroTurquoise ? 0x0d9488 : (primaryHex || 0x38bdf8);
  var secBodyHex  = isHeroTurquoise ? 0x0f766e : (cabinHex || 0x2563eb);

  var turqMat      = new THREE.MeshStandardMaterial({ color: mainBodyHex, roughness: 0.28, metalness: 0.14 });
  var darkTurqMat  = new THREE.MeshStandardMaterial({ color: secBodyHex,  roughness: 0.36, metalness: 0.12 });
  var creamMat     = new THREE.MeshStandardMaterial({ color: 0xfef3c7,    roughness: 0.32, metalness: 0.05 });
  var goldMat      = new THREE.MeshStandardMaterial({ color: 0xeab308,    roughness: 0.24, metalness: 0.68 });
  var darkIronMat  = new THREE.MeshStandardMaterial({ color: 0x1e293b,    roughness: 0.55, metalness: 0.30 });
  var lampGlowMat  = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var glassBlueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // 1. Running Board, Gold Side Trim & Underframe Chassis
  var runningBoard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.48, 9.5), turqMat);
  runningBoard.position.set(0, 1.42, 0.15);
  var goldRunningTrim = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.18, 9.62), goldMat);
  goldRunningTrim.position.set(0, 1.24, 0.15);
  var underFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.68, 8.8), darkIronMat);
  underFrame.position.set(0, 0.90, 0.10);
  g.add(runningBoard, goldRunningTrim, underFrame);

  // 2. Cab with Arched Cream Roof, Gold Window Frames & Hanging Golden Brass Bells ("Kabina a komín")
  var cabBody = new THREE.Mesh(new THREE.BoxGeometry(3.95, 3.85, 3.65), turqMat);
  cabBody.position.set(0, 3.48, -2.35);
  cabBody.castShadow = true;
  g.add(cabBody);

  // Cream & gold lower cab apron with decorative rivets
  var cabApron = new THREE.Mesh(new THREE.BoxGeometry(4.12, 0.85, 3.78), creamMat);
  cabApron.position.set(0, 1.92, -2.35);
  var cabApronGoldRim = new THREE.Mesh(new THREE.BoxGeometry(4.18, 0.16, 3.84), goldMat);
  cabApronGoldRim.position.set(0, 2.38, -2.35);
  g.add(cabApron, cabApronGoldRim);

  // Side cab windows with 3D golden frames
  var cabWinGlass = new THREE.Mesh(new THREE.BoxGeometry(4.06, 1.55, 1.85), glassBlueMat);
  cabWinGlass.position.set(0, 3.88, -2.42);
  g.add(cabWinGlass);

  [-1.99, 1.99].forEach(function(wx) {
    var winFrameTop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 2.15), goldMat);
    winFrameTop.position.set(wx, 4.70, -2.42);
    var winFrameBot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 2.18), goldMat);
    winFrameBot.position.set(wx, 3.04, -2.42);
    var winFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.82, 0.18), goldMat);
    winFrameL.position.set(wx, 3.88, -1.42);
    var winFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.82, 0.18), goldMat);
    winFrameR.position.set(wx, 3.88, -3.42);
    g.add(winFrameTop, winFrameBot, winFrameL, winFrameR);

    // Hanging Golden Brass Bell in front of each cab window ("Kabina a komín")
    var bellBracket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.12), goldMat);
    bellBracket.position.set(wx + (wx > 0 ? 0.14 : -0.14), 4.28, -0.82);
    var bellCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.46, 14), goldMat);
    bellCone.position.set(wx + (wx > 0 ? 0.22 : -0.22), 4.02, -0.82);
    var bellCrown = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), goldMat);
    bellCrown.position.set(wx + (wx > 0 ? 0.22 : -0.22), 4.22, -0.82);
    var bellClapper = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), goldMat);
    bellClapper.position.set(wx + (wx > 0 ? 0.22 : -0.22), 3.76, -0.82);
    g.add(bellBracket, bellCone, bellCrown, bellClapper);
  });

  // Curved overhanging Cream Cab Roof ("Kabina a komín")
  var archRoofGeo = new THREE.CylinderGeometry(2.38, 2.38, 4.35, 24, 1, false, -Math.PI * 0.36, Math.PI * 0.72);
  archRoofGeo.rotateZ(Math.PI / 2);
  archRoofGeo.rotateY(Math.PI / 2);
  var archRoof = new THREE.Mesh(archRoofGeo, creamMat);
  archRoof.scale.set(1.0, 0.46, 1.0);
  archRoof.position.set(0, 4.72, -2.30);
  archRoof.castShadow = true;

  var roofBaseTrim = new THREE.Mesh(new THREE.BoxGeometry(4.42, 0.28, 4.30), creamMat);
  roofBaseTrim.position.set(0, 5.45, -2.30);
  var roofGoldPiping = new THREE.Mesh(new THREE.BoxGeometry(4.48, 0.12, 4.36), goldMat);
  roofGoldPiping.position.set(0, 5.30, -2.30);
  g.add(archRoof, roofBaseTrim, roofGoldPiping);

  // 3. Rounded Turquoise Boiler with Golden Boiler Bands
  var boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.80, 1.80, 5.35, 28), turqMat);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.set(0, 3.16, 1.75);
  boiler.castShadow = true;
  g.add(boiler);

  // 3 Polished Golden Boiler Bands wrapping around the boiler
  [0.15, 1.65, 3.25].forEach(function(bz) {
    var band = new THREE.Mesh(new THREE.TorusGeometry(1.81, 0.075, 12, 28), goldMat);
    band.position.set(0, 3.16, bz);
    g.add(band);
  });

  // Thick Golden Smokebox Bezel Ring around the Front Face
  var frontGoldBezel = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.17, 16, 32), goldMat);
  frontGoldBezel.position.set(0, 3.16, 4.38);
  g.add(frontGoldBezel);

  // 4. Friendly Sculpted 3D Cream Face on the Front ("Přátelský výraz")
  if (!sharedHeroLocoFaceTex) {
    sharedHeroLocoFaceTex = createHeroLocomotiveFaceTexture();
  }
  var faceDiscBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.66, 1.66, 0.26, 32),
    creamMat
  );
  faceDiscBase.rotation.x = Math.PI / 2;
  faceDiscBase.position.set(0, 3.16, 4.38);
  g.add(faceDiscBase);

  var facePlane = new THREE.Mesh(
    new THREE.CircleGeometry(1.64, 32),
    new THREE.MeshBasicMaterial({ map: sharedHeroLocoFaceTex })
  );
  facePlane.position.set(0, 3.16, 4.52);
  g.add(facePlane);

  // Subtle 3D Cream Button Nose bump in center of face for 3/4 view depth
  var noseBump = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfde6c4, roughness: 0.35 })
  );
  noseBump.scale.set(1.1, 0.88, 0.75);
  noseBump.position.set(0, 3.00, 4.58);
  g.add(noseBump);

  // 5. Top Headlamp Housing above the Face & Two Lower Golden Buffer Lamps ("Světlo a přední mřížka")
  var topLampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.72, 18), turqMat);
  topLampBody.rotation.x = Math.PI / 2;
  topLampBody.position.set(0, 5.05, 4.05);
  var topLampRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.08, 12, 20), goldMat);
  topLampRim.position.set(0, 5.05, 4.40);
  var noseBoss = new THREE.Mesh(new THREE.SphereGeometry(0.40, 14, 14), lampGlowMat);
  noseBoss.scale.set(1, 1, 0.45);
  noseBoss.position.set(0, 5.05, 4.42);
  var topLampPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.36, 12), goldMat);
  topLampPedestal.position.set(0, 4.65, 4.02);
  g.add(topLampBody, topLampRim, noseBoss, topLampPedestal);

  // Two lower golden buffer lamps flanking the bottom of the smokebox
  [-1.35, 1.35].forEach(function(lx) {
    var bLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.48, 14), goldMat);
    bLamp.rotation.x = Math.PI / 2;
    bLamp.position.set(lx, 1.88, 4.42);
    var bLens = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), lampGlowMat);
    bLens.position.set(lx, 1.88, 4.67);
    g.add(bLamp, bLens);
  });

  // 6. Tall Flared Turquoise Chimney with Golden Crown Rim + Golden Steam Dome & Whistle
  var chimneyBaseCollar = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.16, 12, 22), goldMat);
  chimneyBaseCollar.rotation.x = Math.PI / 2;
  chimneyBaseCollar.position.set(0, 4.82, 2.95);

  var chimneyPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.62, 1.78, 22), turqMat);
  chimneyPipe.position.set(0, 5.62, 2.95);
  chimneyPipe.castShadow = true;

  var chimneyRim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.21, 14, 24), goldMat);
  chimneyRim.rotation.x = Math.PI / 2;
  chimneyRim.position.set(0, 6.46, 2.95);

  var chimneyHole = new THREE.Mesh(
    new THREE.CircleGeometry(0.74, 18),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  chimneyHole.rotation.x = -Math.PI / 2;
  chimneyHole.position.set(0, 6.58, 2.95);
  g.add(chimneyBaseCollar, chimneyPipe, chimneyRim, chimneyHole);

  // Polished Golden Steam Dome & Whistle behind the chimney
  var domeBase = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.14, 12, 20), goldMat);
  domeBase.rotation.x = Math.PI / 2;
  domeBase.position.set(0, 4.82, 1.15);
  var domeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.55, 20), goldMat);
  domeCyl.position.set(0, 5.08, 1.15);
  var domeCap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), goldMat);
  domeCap.position.set(0, 5.34, 1.15);
  var domeFinial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), goldMat);
  domeFinial.position.set(0, 6.00, 1.15);

  var whistlePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.52, 10), goldMat);
  whistlePipe.position.set(0, 5.12, 3.85);
  var whistleTop = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), goldMat);
  whistleTop.position.set(0, 5.40, 3.85);
  g.add(domeBase, domeCyl, domeCap, domeFinial, whistlePipe, whistleTop);

  // 7. Dynamic 3D Cream & Gold Side Nameplates on BOTH sides of the boiler ("Jmenovka na obou stranách")
  if (isHeroTurquoise) {
    var leftNameplate = create3DNameplateGroup(3.10, 0.96);
    leftNameplate.position.set(1.84, 3.05, 1.65);
    g.add(leftNameplate);

    var rightNameplate = create3DNameplateGroup(3.10, 0.96);
    rightNameplate.position.set(-1.84, 3.05, 1.65);
    rightNameplate.rotation.y = Math.PI;
    g.add(rightNameplate);
  }

  // 8. Slatted Turquoise & Gold Cowcatcher Plow ("Světlo a přední mřížka")
  var plowGroup = new THREE.Group();
  var plowCore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.48, 2.18, 1.15, 5, 1, false, -Math.PI * 0.2, Math.PI * 1.4),
    turqMat
  );
  plowCore.position.set(0, 0.88, 4.30);
  var plowGoldTop = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.18, 0.85), goldMat);
  plowGoldTop.position.set(0, 1.46, 4.55);
  var plowGoldLip = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.24, 1.45), goldMat);
  plowGoldLip.position.set(0, 0.36, 4.65);
  plowGroup.add(plowCore, plowGoldTop, plowGoldLip);

  // Angled golden grille slats on the front cowcatcher
  for (var si = -3; si <= 3; si++) {
    var slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.06, 0.16), goldMat);
    slat.position.set(si * 0.44, 0.90, 5.05 - Math.abs(si) * 0.11);
    slat.rotation.x = -0.36;
    plowGroup.add(slat);
  }
  g.add(plowGroup);

  // 9. Elaborate Wheels, Turquoise Steam Cylinders & Golden Drive Rods ("Detail kol a pohonu")
  var wheelDiscCol = isHeroTurquoise ? 0x0d9488 : mainBodyHex;
  [-2.06, 2.06].forEach(function(wx) {
    var sideSign = wx > 0 ? 1 : -1;

    var bigW = createStorybookTrainWheel(1.42, wheelDiscCol, 0xfef3c7, 0xeab308);
    bigW.position.set(wx, 1.42, -2.05);
    g.add(bigW);
    wheelMeshes.push(bigW);

    var midW = createStorybookTrainWheel(0.92, wheelDiscCol, 0xfef3c7, 0xeab308);
    midW.position.set(wx, 0.92, 0.55);
    var frontW = createStorybookTrainWheel(0.78, wheelDiscCol, 0xfef3c7, 0xeab308);
    frontW.position.set(wx, 0.78, 2.65);
    g.add(midW, frontW);
    wheelMeshes.push(midW, frontW);

    // Horizontal Turquoise Steam Cylinder with Golden Caps behind front wheel
    var steamCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.35, 16), darkTurqMat);
    steamCyl.rotation.x = Math.PI / 2;
    steamCyl.position.set(wx + sideSign * 0.16, 1.52, 1.95);
    var cylCapF = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.14, 16), goldMat);
    cylCapF.rotation.x = Math.PI / 2;
    cylCapF.position.set(wx + sideSign * 0.16, 1.52, 2.62);
    var cylCapB = cylCapF.clone();
    cylCapB.position.set(wx + sideSign * 0.16, 1.52, 1.28);

    // Golden Connecting Drive Rod linking the wheels & steam cylinder
    var mainRod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 3.65), goldMat);
    mainRod.position.set(wx + sideSign * 0.28, 1.15, -0.35);
    var upperRod = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 2.75), goldMat);
    upperRod.position.set(wx + sideSign * 0.26, 1.42, -0.60);
    upperRod.rotation.x = 0.06;

    g.add(steamCyl, cylCapF, cylCapB, mainRod, upperRod);
  });

  // 10. Headlight Cone Beam (Hidden in daylight, shines strictly FORWARD inside dark tunnels & at night!)
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
  beam.position.set(0, 2.8, 15.6);
  beam.visible = false;
  g.userData.beam = beam;
  g.userData.noseLamp = noseBoss;
  g.add(beam);

  addContactShadow(g, 4.8, 9.6, 0.06);
  return g;
};

window.createDetailedCoach = function(colHex, coachIndex) {
  var g = new THREE.Group();
  g.scale.set(0.64, 0.64, 0.64);

  var isPlayerCoach = (coachIndex !== undefined && coachIndex !== null);
  var bodyColorHex = isPlayerCoach ? 0x0d9488 : (colHex || 0x0d9488);

  var turqHopperMat = new THREE.MeshStandardMaterial({ color: bodyColorHex, roughness: 0.30, metalness: 0.12 });
  var creamRimMat   = new THREE.MeshStandardMaterial({ color: 0xfef3c7,     roughness: 0.32 });
  var goldTrimMat   = new THREE.MeshStandardMaterial({ color: 0xeab308,     roughness: 0.25, metalness: 0.65 });
  var darkChassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b,    roughness: 0.60 });
  var darkInsideMat  = new THREE.MeshStandardMaterial({ color: 0x0f4c5c,    roughness: 0.80 });

  // Underframe & Golden Lower Sill with Corner Brackets
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.55, 6.45), darkChassisMat);
  chassis.position.set(0, 1.12, 0);
  var goldBottomBand = new THREE.Mesh(new THREE.BoxGeometry(3.62, 0.24, 6.05), goldTrimMat);
  goldBottomBand.position.set(0, 1.48, 0);
  g.add(chassis, goldBottomBand);

  // Main Turquoise Wagon Body
  var hopperBody = new THREE.Mesh(new THREE.BoxGeometry(3.48, 2.30, 5.85), turqHopperMat);
  hopperBody.position.set(0, 2.65, 0);
  hopperBody.castShadow = true;
  g.add(hopperBody);

  // Cream & Gold Top Rim
  var topCreamRim = new THREE.Mesh(new THREE.BoxGeometry(3.76, 0.30, 6.12), creamRimMat);
  topCreamRim.position.set(0, 3.86, 0);
  var topGoldSubRim = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.14, 6.02), goldTrimMat);
  topGoldSubRim.position.set(0, 3.68, 0);
  g.add(topCreamRim, topGoldSubRim);

  // Corner vertical gold trim posts
  [-2.82, 2.82].forEach(function(rz) {
    var cornerRib = new THREE.Mesh(new THREE.BoxGeometry(3.62, 2.32, 0.26), goldTrimMat);
    cornerRib.position.set(0, 2.65, rz);
    g.add(cornerRib);
  });

  if (isPlayerCoach && coachIndex === 0) {
    // WAGON #1: Rounded Turquoise Tender Hood + Dynamic "★ DANÍČEK ★" Side Nameplates!
    var tenderHood = new THREE.Mesh(new THREE.BoxGeometry(3.16, 0.65, 5.20), turqHopperMat);
    tenderHood.position.set(0, 4.18, 0);
    g.add(tenderHood);

    var leftTenderPlate = create3DNameplateGroup(3.60, 1.06);
    leftTenderPlate.position.set(1.76, 2.65, 0);
    g.add(leftTenderPlate);

    var rightTenderPlate = create3DNameplateGroup(3.60, 1.06);
    rightTenderPlate.position.set(-1.76, 2.65, 0);
    rightTenderPlate.rotation.y = Math.PI;
    g.add(rightTenderPlate);
  } else {
    // WAGON #2 & #3+: Open Treasure Hopper with Golden Star Emblem on Sides & Gold Nuggets / Magic Crystals!
    var cavity = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.22, 5.45), darkInsideMat);
    cavity.position.set(0, 3.92, 0);
    g.add(cavity);

    if (!sharedSideStarTex) {
      sharedSideStarTex = createSideStarBadgeTexture();
    }
    var starMat = new THREE.MeshBasicMaterial({ map: sharedSideStarTex, transparent: true });
    [-1.76, 1.76].forEach(function(sx) {
      var starPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), starMat);
      starPlane.position.set(sx, 2.65, 0);
      starPlane.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.add(starPlane);
    });

    if (!isPlayerCoach || coachIndex % 2 === 1) {
      // Glittering Golden Nuggets Cargo (Wagon #2 in Reference Sheet)
      var nuggetGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.72 });
      var nuggetAmberMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.65 });
      for (var ni = 0; ni < 18; ni++) {
        var nx = ((ni % 3) - 1) * 0.82 + Math.sin(ni * 2.1) * 0.18;
        var nz = (Math.floor(ni / 3) - 2.5) * 0.85;
        var ny = 4.12 + (ni % 2) * 0.28 + (Math.abs(nx) < 0.4 ? 0.25 : 0);
        var nug = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.48 + (ni % 3) * 0.08, 0),
          ni % 2 === 0 ? nuggetGoldMat : nuggetAmberMat
        );
        nug.position.set(nx, ny, nz);
        nug.rotation.set(ni * 0.7, ni * 1.1, ni * 0.5);
        g.add(nug);
      }
    } else {
      // Glowing Violet & Cyan Crystal Spires Cargo (Wagon #3 in Reference Sheet)
      var crystalCols = [0xa855f7, 0x38bdf8, 0xc084fc, 0x6366f1, 0x22d3ee];
      for (var ci = 0; ci < 16; ci++) {
        var cx = ((ci % 3) - 1) * 0.78 + Math.cos(ci * 1.7) * 0.15;
        var cz = (Math.floor(ci / 3) - 2.2) * 0.88;
        var cHeight = 1.05 + (ci % 3) * 0.32;
        var cMat = new THREE.MeshStandardMaterial({
          color: crystalCols[ci % crystalCols.length],
          emissive: crystalCols[ci % crystalCols.length],
          emissiveIntensity: 0.28,
          roughness: 0.18,
          metalness: 0.25
        });
        var crystal = new THREE.Mesh(new THREE.ConeGeometry(0.36, cHeight, 6), cMat);
        crystal.position.set(cx, 3.95 + cHeight * 0.42, cz);
        crystal.rotation.z = ( (ci % 3) - 1 ) * 0.22;
        crystal.rotation.x = Math.sin(ci) * 0.18;
        g.add(crystal);
      }
    }
  }

  // 4 Matching Turquoise, Cream & Gold Coach Wheels
  [-1.75, 1.75].forEach(function(wz) {
    [-1.82, 1.82].forEach(function(wx) {
      var cw = createStorybookTrainWheel(1.06, bodyColorHex, 0xfef3c7, 0xeab308);
      cw.position.set(wx, 1.06, wz);
      g.add(cw);
      wheelMeshes.push(cw);
    });
  });

  addContactShadow(g, 4.4, 6.8, 0.06);
  return g;
};

