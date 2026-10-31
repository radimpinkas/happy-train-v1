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

// Shared cached materials & geometries for high-detail 3D cartoon characters (`window.spawnPerson`)
var _personShared = null;
function getPersonShared() {
  if (_personShared) return _personShared;
  _personShared = {
    skinMat: new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.45, emissive: 0x7c2d12, emissiveIntensity: 0.04 }),
    shoeMat: new THREE.MeshStandardMaterial({ color: 0x3b1909, roughness: 0.55 }),
    soleMat: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.40 }),
    buckleMat: new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.65, roughness: 0.25 }),
    scleraMat: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    pupilMat: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
    blushMat: new THREE.MeshBasicMaterial({ color: 0xfb7185 }),
    mouthMat: new THREE.MeshBasicMaterial({ color: 0xe11d48 }),
    irisMats: [
      new THREE.MeshBasicMaterial({ color: 0x78350f }),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8 }),
      new THREE.MeshBasicMaterial({ color: 0x15803d })
    ],
    pantsMats: [
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.52 }),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.52 }),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.52 }),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.52 })
    ],
    hairMats: [
      new THREE.MeshStandardMaterial({ color: 0x5c280e, roughness: 0.55 }),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.55 }),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 }),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.55 })
    ],
    legGeo: new THREE.CylinderGeometry(0.18, 0.15, 1.05, 10),
    shoeGeo: new THREE.SphereGeometry(0.20, 10, 8),
    hipsGeo: new THREE.CylinderGeometry(0.42, 0.40, 0.34, 12),
    skirtGeo: new THREE.CylinderGeometry(0.38, 0.68, 1.08, 16),
    torsoGeo: new THREE.CylinderGeometry(0.44, 0.39, 1.18, 14),
    shoulderGeo: new THREE.SphereGeometry(0.46, 12, 10),
    neckGeo: new THREE.CylinderGeometry(0.15, 0.18, 0.28, 10),
    headGeo: new THREE.SphereGeometry(0.52, 20, 16),
    earGeo: new THREE.SphereGeometry(0.12, 8, 8),
    noseGeo: new THREE.SphereGeometry(0.09, 10, 8),
    scleraGeo: new THREE.SphereGeometry(0.10, 10, 8),
    irisGeo: new THREE.SphereGeometry(0.062, 8, 8),
    pupilGeo: new THREE.SphereGeometry(0.038, 8, 8),
    catchGeo: new THREE.SphereGeometry(0.019, 6, 6),
    browGeo: new THREE.BoxGeometry(0.15, 0.038, 0.04),
    blushGeo: new THREE.SphereGeometry(0.075, 8, 6),
    smileGeo: new THREE.TorusGeometry(0.12, 0.032, 6, 12, Math.PI),
    teethGeo: new THREE.BoxGeometry(0.15, 0.045, 0.035),
    hairCapGeo: new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
    quiffGeo: new THREE.SphereGeometry(0.28, 10, 8),
    armGeo: new THREE.CylinderGeometry(0.13, 0.11, 0.88, 10),
    handGeo: new THREE.SphereGeometry(0.14, 10, 8)
  };
  return _personShared;
}

window.spawnPerson = function(x, y, z, shirtCol, hatCol, showHello, scale, rotY) {
  var S = getPersonShared();
  var g = new THREE.Group();
  var groundH = (y !== null && y !== undefined) ? y : terrainY(x, z);
  g.position.set(x, groundH, z);
  var sc = (scale || 1.35) * 0.86;
  g.scale.set(sc, sc, sc);

  var seed = Math.abs(Math.round(x * 7 + z * 13));
  var isSkirt = (seed % 3 === 1);
  var pantsMat = S.pantsMats[seed % S.pantsMats.length];
  var hairMat = S.hairMats[seed % S.hairMats.length];
  var irisMat = S.irisMats[seed % S.irisMats.length];
  var topMat = new THREE.MeshStandardMaterial({ color: shirtCol || 0x38bdf8, roughness: 0.48 });

  // 1. Legs / Skirt & Shoes
  if (isSkirt) {
    var skirt = new THREE.Mesh(S.skirtGeo, pantsMat);
    skirt.position.y = 0.82;
    g.add(skirt);
  } else {
    var hips = new THREE.Mesh(S.hipsGeo, pantsMat);
    hips.position.y = 1.18;
    g.add(hips);
  }
  [-0.20, 0.20].forEach(function(lx) {
    var leg = new THREE.Mesh(S.legGeo, isSkirt ? S.skinMat : pantsMat);
    leg.position.set(lx, 0.62, 0);
    var shoe = new THREE.Mesh(S.shoeGeo, S.shoeMat);
    shoe.scale.set(0.92, 0.62, 1.45);
    shoe.position.set(lx, 0.13, 0.12);
    g.add(leg, shoe);
  });

  // 2. Sculpted Torso, Shoulders, Collar & Neck
  var torso = new THREE.Mesh(S.torsoGeo, topMat);
  torso.position.y = 1.82;
  torso.castShadow = true;
  var shoulders = new THREE.Mesh(S.shoulderGeo, topMat);
  shoulders.scale.set(1.18, 0.45, 0.85);
  shoulders.position.y = 2.30;
  var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 12), S.soleMat);
  collar.position.y = 2.42;
  var neck = new THREE.Mesh(S.neckGeo, S.skinMat);
  neck.position.y = 2.52;
  g.add(torso, shoulders, collar, neck);

  // 3. Expressive 3D Cartoon Head with 3D Eyes, Irises, Pupils, Specular Catchlights, Eyebrows, Rosy Cheeks, Nose & Smile
  var headGroup = new THREE.Group();
  headGroup.position.y = 2.98;
  var head = new THREE.Mesh(S.headGeo, S.skinMat);
  head.scale.set(0.96, 1.03, 0.96);
  headGroup.add(head);

  [-1, 1].forEach(function(side) {
    var ex = side * 0.175;
    var sclera = new THREE.Mesh(S.scleraGeo, S.scleraMat);
    sclera.scale.set(0.95, 1.15, 0.45);
    sclera.position.set(ex, 0.08, 0.465);
    var iris = new THREE.Mesh(S.irisGeo, irisMat);
    iris.scale.set(1.0, 1.08, 0.45);
    iris.position.set(ex, 0.08, 0.495);
    var pupil = new THREE.Mesh(S.pupilGeo, S.pupilMat);
    pupil.scale.set(1.0, 1.05, 0.45);
    pupil.position.set(ex, 0.08, 0.512);
    var catchlight = new THREE.Mesh(S.catchGeo, S.scleraMat);
    catchlight.position.set(ex - 0.02, 0.11, 0.528);
    var brow = new THREE.Mesh(S.browGeo, hairMat);
    brow.position.set(ex, 0.23, 0.475);
    brow.rotation.z = side * -0.14;
    var blush = new THREE.Mesh(S.blushGeo, S.blushMat);
    blush.scale.set(1.22, 0.72, 0.35);
    blush.position.set(side * 0.25, -0.04, 0.44);
    var ear = new THREE.Mesh(S.earGeo, S.skinMat);
    ear.scale.set(0.55, 0.92, 0.70);
    ear.position.set(side * 0.48, 0.02, -0.02);
    headGroup.add(sclera, iris, pupil, catchlight, brow, blush, ear);
  });

  var nose = new THREE.Mesh(S.noseGeo, S.skinMat);
  nose.scale.set(0.90, 0.85, 1.15);
  nose.position.set(0, -0.01, 0.515);
  var smileMouth = new THREE.Mesh(S.smileGeo, S.mouthMat);
  smileMouth.rotation.x = Math.PI;
  smileMouth.position.set(0, -0.13, 0.475);
  var smileTeeth = new THREE.Mesh(S.teethGeo, S.scleraMat);
  smileTeeth.position.set(0, -0.14, 0.48);
  headGroup.add(nose, smileMouth, smileTeeth);

  // 4. Sculpted 3D Hair & Optional Hat
  var hairCap = new THREE.Mesh(S.hairCapGeo, hairMat);
  hairCap.position.set(0, 0.07, -0.04);
  hairCap.rotation.x = -0.24;
  var quiff = new THREE.Mesh(S.quiffGeo, hairMat);
  quiff.scale.set(1.32, 0.48, 0.82);
  quiff.position.set(0.04, 0.46, 0.22);
  quiff.rotation.z = -0.12;
  headGroup.add(hairCap, quiff);

  if (hatCol) {
    var hatMat = new THREE.MeshStandardMaterial({ color: hatCol, roughness: 0.42 });
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.26, 14), hatMat);
    cap.position.set(0, 0.48, 0);
    var visor = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.06, 14, 1, false, -Math.PI * 0.4, Math.PI * 0.8), hatMat);
    visor.position.set(0, 0.38, 0.16);
    headGroup.add(cap, visor);
  }
  g.add(headGroup);

  // 5. Left Resting Arm + Animated Right Waving Arm with Hand
  var leftArm = new THREE.Mesh(S.armGeo, topMat);
  leftArm.position.set(-0.54, 1.82, 0);
  leftArm.rotation.z = 0.20;
  var leftHand = new THREE.Mesh(S.handGeo, S.skinMat);
  leftHand.position.set(-0.63, 1.34, 0.05);
  g.add(leftArm, leftHand);

  var armPivot = new THREE.Group();
  armPivot.position.set(0.50, 2.22, 0);
  var arm = new THREE.Mesh(S.armGeo, topMat);
  arm.position.set(0.24, 0.36, 0.04);
  arm.rotation.z = -0.35;
  var rightHand = new THREE.Mesh(S.handGeo, S.skinMat);
  rightHand.position.set(0.40, 0.78, 0.08);
  armPivot.add(arm, rightHand);
  g.add(armPivot);

  if (rotY !== undefined && rotY !== null) {
    g.rotation.y = rotY;
  } else {
    // Orient naturally toward nearest track center so characters face the train
    g.rotation.y = Math.atan2(-x, -z);
  }

  scene.add(g);
  var obj = { group: g, armPivot: armPivot, phase: Math.random() * 6 };
  wavingHumans.push(obj);
  return obj;
};

// Registry of 3D Landmark Camera Showcases keyed by edge ID ('A->B' and 'B->A')
window.landmarkShowcases = {};
window.registerLandmarkShowcase = function(edgeA, edgeB, config) {
  if (config && config.lookTarget && !(config.lookTarget instanceof THREE.Vector3)) {
    config.lookTarget = new THREE.Vector3(config.lookTarget.x, config.lookTarget.y, config.lookTarget.z);
  }
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
    var faceTrackRotY = Math.atan2(perp.x, perp.z);
    for (var pi = 0; pi < 4; pi++) {
      var startDist = -7.6;
      var along = (pi - 1.5) * 2.6;
      var baseTrackPt = midPt.clone().add(tan.clone().multiplyScalar(along));
      var pPos = baseTrackPt.clone().add(perp.clone().multiplyScalar(startDist));
      var p = spawnPerson(pPos.x, midPt.y, pPos.z, [0xf472b6, 0x22c55e, 0xfacc15, 0x38bdf8][pi], [null, 0xef4444, null, 0x1d4ed8][pi], false, 1.32, faceTrackRotY);
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

  // 4. 3 Telescopic Glass Jet Bridges (Aerobridges) extending from the Terminal Rotundas toward the Apron
  [-36, 0, 32].forEach(function(jbz) {
    var jbG = new THREE.Group();
    jbG.position.set(-19.2, 4.8, jbz);
    var tubeGlass = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.8, 2.6), cyanGlassMat);
    var tubeRoof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.42, 2.85), whiteRoofMat);
    tubeRoof.position.y = 1.5;
    var tubeFloor = tubeRoof.clone();
    tubeFloor.position.y = -1.5;
    var accordionHood = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.9, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    accordionHood.rotation.z = Math.PI / 2;
    accordionHood.position.set(-5.2, 0, 0);
    var supportLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 4.8, 10), mullionMat);
    supportLeg.position.set(-3.8, -2.4, 0);
    var wheelPair = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 10), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    wheelPair.rotation.x = Math.PI / 2;
    wheelPair.position.set(-3.8, -4.4, 0);
    jbG.add(tubeGlass, tubeRoof, tubeFloor, accordionHood, supportLeg, wheelPair);
    termGroup.add(jbG);
  });

  ag.add(termGroup);

  // 5. Branded Wide-Body Passenger Airliners ("Emirates", "scoot", and "QATAR")
  //    Parked cleanly side-by-side on the open apron in front of the terminal so Qatar stands right beside Scoot
  //    and zero part of any aircraft touches or clips the terminal building!
  var emiratesJet = buildBrandedWidebodyJet('emirates', 1.04);
  emiratesJet.position.set(-6, 0.35, -30);
  emiratesJet.rotation.y = 0.28; // Crisp 3/4 side profile showing "Emirates" + UAE tail fin
  ag.add(emiratesJet);

  var scootJet = buildBrandedWidebodyJet('scoot', 0.98);
  scootJet.position.set(-12, 0.35, -2);
  scootJet.rotation.y = 0.24; // Crisp yellow/white "scoot" side profile in the center stand
  ag.add(scootJet);

  var qatarJet1 = buildBrandedWidebodyJet('qatar', 1.00);
  qatarJet1.position.set(-18, 0.35, 26);
  qatarJet1.rotation.y = 0.22; // Parked neatly beside the Scoot airplane on the open apron, 100% clear of the terminal!
  ag.add(qatarJet1);

  // Mobile Passenger Boarding Stairs Trucks docked beside the Emirates, Scoot & Qatar Jets
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
  ag.add(buildBoardingStairsTruck(-14, -22, 1.8));
  ag.add(buildBoardingStairsTruck(-20,   6, 1.7));
  ag.add(buildBoardingStairsTruck(-26,  34, 1.7));

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

  // 12B. Automatic Parking Entrance Barrier Boom & Blue Attendant Booth BESIDE the Road!
  //      ("1. Auta při vjezdu na letiště projíždějí budkou, měly by projíždět závorou, která se vždy zvedne, když auta přijedou.")
  //      The airport road (`loopIdx = 2`) passes through `world (272, py, 14)` (= `local (-24, 0, 0)` in `parkG`)
  //      heading East-Southeast (`roadYaw ~ 1.48 rad`). We place the blue attendant booth safely OFF the asphalt
  //      road at `local (-25.5, _, -8.4)` and the yellow barrier pedestal on the road curb at `local (-22.5, _, -4.8)`,
  //      with a red-and-white striped boom arm extending across the road lane (`z = -4.8 .. +3.8`) that raises
  //      automatically whenever any car/bus/tractor approaches!
  var boothGroup = new THREE.Group();
  boothGroup.position.set(-25.5, 0.2, -8.4);

  var kioskBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 3.5, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.32 })
  );
  kioskBody.position.y = 1.75;
  kioskBody.castShadow = true;

  var kioskRoof = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.42, 3.4),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 })
  );
  kioskRoof.position.y = 3.65;

  var kioskWin = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 1.35, 2.92),
    new THREE.MeshBasicMaterial({ color: 0xbae6fd })
  );
  kioskWin.position.y = 2.15;

  var ticketKioskMachine = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.65, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  ticketKioskMachine.position.set(2.4, 0.85, 1.8);
  boothGroup.add(kioskBody, kioskRoof, kioskWin, ticketKioskMachine);
  parkG.add(boothGroup);

  // Automatic Barrier Pedestal on the Southern Curb of the Entrance Road (`local x = -22.5, z = -4.8`)
  var gatePedGroup = new THREE.Group();
  gatePedGroup.position.set(-22.5, 0.2, -4.8);

  var gatePedBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.35, 1.15),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  );
  gatePedBase.position.y = 0.18;

  var gatePed = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.85, 0.95),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.32 })
  );
  gatePed.position.y = 1.10;

  var gatePedCap = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.28, 1.05),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
  );
  gatePedCap.position.y = 2.12;

  var gateStatusLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  var gateStatusLight = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), gateStatusLightMat);
  gateStatusLight.position.set(0, 2.42, 0);

  // Rotating Barrier Boom Pivot (rotates around X axis: 0 = horizontal across road lane `z = -4.8 .. +3.8`,
  // -Math.PI * 0.44 = raised vertically when a vehicle approaches!)
  var gateBoomPivot = new THREE.Group();
  gateBoomPivot.position.set(0, 1.68, 0);

  // Red-and-White Striped Barrier Boom Arm (8.6m long spanning across the entire road width!)
  var boomArmGroup = new THREE.Group();
  var numBoomSegs = 8;
  var segLenBoom = 1.06;
  var redBoomMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  var whiteBoomMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (var bsi = 0; bsi < numBoomSegs; bsi++) {
    var bSeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, segLenBoom, 10),
      bsi % 2 === 0 ? redBoomMat : whiteBoomMat
    );
    bSeg.rotation.x = Math.PI / 2;
    bSeg.position.z = 0.55 + bsi * segLenBoom;
    boomArmGroup.add(bSeg);
  }
  // Glowing red LED safety lights along the barrier boom
  [2.5, 5.2, 8.0].forEach(function(lz) {
    var bLed = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), redBoomMat);
    bLed.position.set(0, 0.18, lz);
    boomArmGroup.add(bLed);
  });

  gateBoomPivot.add(boomArmGroup);
  gatePedGroup.add(gatePedBase, gatePed, gatePedCap, gateStatusLight, gateBoomPivot);
  parkG.add(gatePedGroup);

  // Export barrier state for automatic vehicle-proximity animation in the frame loop!
  window.airportParkingBarrier = {
    worldPos: new THREE.Vector3(px - 22.5, py + 0.5, pz - 0.5),
    pivot: gateBoomPivot,
    statusMat: gateStatusLightMat,
    openAmount: 0.0
  };

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

  var frontFaceZ = 3.0;
  var frontFaceY = 1.25;
  var headlightSpreadX = 0.92;
  var headlightY = 1.05;

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

    frontFaceZ = 3.02;
    frontFaceY = 1.22;
    headlightSpreadX = 0.96;
    headlightY = 1.12;

    [[-1.55, 1.55], [1.55, 1.55], [-1.55, -1.55], [1.55, -1.55]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.82, 0.52);
      wh.position.set(wp[0], 0.82, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 4.4, 6.6, 0.06);

  } else if (vehicleKind === 'bus') {
    var isSchoolBus = (colHex === 0xfacc15 || colHex === 0xeab308 || colHex === 0xf59e0b);
    var cabinBox = new THREE.Mesh(new THREE.BoxGeometry(3.55, 3.25, 7.1), bodyMat);
    cabinBox.position.set(0, 2.25, -0.5);
    cabinBox.castShadow = true;
    var roofCap = new THREE.Mesh(new THREE.CylinderGeometry(1.74, 1.74, 7.0, 16, 1, false, 0, Math.PI), bodyMat);
    roofCap.rotation.z = Math.PI / 2;
    roofCap.rotation.y = Math.PI / 2;
    roofCap.position.set(0, 3.75, -0.5);

    var noseHood = new THREE.Mesh(new THREE.BoxGeometry(3.15, 1.78, 2.15), bodyMat);
    noseHood.position.set(0, 1.50, 3.55);

    var stripe1 = new THREE.Mesh(new THREE.BoxGeometry(3.64, 0.24, 7.12), darkTrimMat);
    stripe1.position.set(0, 1.90, -0.5);
    var stripe2 = stripe1.clone();
    stripe2.position.set(0, 1.48, -0.5);

    if (isSchoolBus) {
      // Iconic Yellow School Bus Header Board, Flashing Roof Beacons & Red Stop Sign Arm
      var schoolSignCanv = document.createElement('canvas');
      schoolSignCanv.width = 256; schoolSignCanv.height = 64;
      var sctx = schoolSignCanv.getContext('2d');
      sctx.fillStyle = '#facc15';
      sctx.fillRect(0, 0, 256, 64);
      sctx.strokeStyle = '#0f172a';
      sctx.lineWidth = 6;
      sctx.strokeRect(3, 3, 250, 58);
      sctx.fillStyle = '#0f172a';
      sctx.font = 'bold 34px sans-serif';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText('SCHOOL BUS', 128, 34);
      var schoolSignTex = new THREE.CanvasTexture(schoolSignCanv);
      var signPlate = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.56), new THREE.MeshBasicMaterial({ map: schoolSignTex }));
      signPlate.position.set(0, 4.05, 3.05);
      var signPlateBack = signPlate.clone();
      signPlateBack.rotation.y = Math.PI;
      signPlateBack.position.set(0, 4.05, -4.06);
      g.add(signPlate, signPlateBack);

      [-1.1, 1.1].forEach(function(bx) {
        var beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        beacon.position.set(bx, 4.35, 2.75);
        g.add(beacon);
      });

      var stopSign = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
      stopSign.rotation.z = Math.PI / 2;
      stopSign.position.set(-1.86, 2.15, 1.85);
      g.add(stopSign);
    }

    for (var wi = 0; wi < 5; wi++) {
      var wPane = new THREE.Mesh(new THREE.BoxGeometry(3.66, 1.05, 0.98), cyanGlassMat);
      wPane.position.set(0, 2.78, -3.1 + wi * 1.28);
      g.add(wPane);
    }

    var busWin = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.18), cyanGlassMat);
    busWin.position.set(0, 2.88, 3.08);
    g.add(busWin);

    var busFace = createCartoonFacePlane(2.95, 1.75, 'transparent', 'bus_grille');
    busFace.position.set(0, 1.48, 4.66);
    g.add(cabinBox, roofCap, noseHood, stripe1, stripe2, busFace);

    frontFaceZ = 4.70;
    frontFaceY = 1.45;
    headlightSpreadX = 1.18;
    headlightY = 1.22;

    [[-1.78, 2.6], [1.78, 2.6], [-1.78, -2.4], [1.78, -2.4]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.96, 0.62);
      wh.position.set(wp[0], 0.96, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 5.2, 10.0, 0.06);

  } else if (vehicleKind === 'excavator') {
    // 3D Construction Excavator (Bagr) with Caterpillar Tracks, Rotating Cab & Articulated Hydraulic Arm + Toothed Bucket!
    var trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    var steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.55 });
    var pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });

    var chassisBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 4.4), darkTrimMat);
    chassisBase.position.set(0, 0.95, 0);
    g.add(chassisBase);

    [-1.55, 1.55].forEach(function(tx) {
      var tread = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.15, 5.2), trackMat);
      tread.position.set(tx, 0.62, 0);
      var fSprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.86, 14), trackMat);
      fSprocket.rotation.z = Math.PI / 2;
      fSprocket.position.set(tx, 0.62, 2.55);
      var rSprocket = fSprocket.clone();
      rSprocket.position.set(tx, 0.62, -2.55);
      g.add(tread, fSprocket, rSprocket);
      for (var rwi = -2; rwi <= 2; rwi++) {
        var roller = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.90, 10), steelMat);
        roller.rotation.z = Math.PI / 2;
        roller.position.set(tx, 0.45, rwi * 1.05);
        g.add(roller);
      }
    });

    var upperDeck = new THREE.Mesh(new THREE.BoxGeometry(3.35, 1.25, 4.8), bodyMat);
    upperDeck.position.set(0, 1.95, -0.25);
    upperDeck.castShadow = true;
    var counterweight = new THREE.Mesh(new THREE.BoxGeometry(3.42, 1.45, 1.25), darkTrimMat);
    counterweight.position.set(0, 2.05, -2.35);
    var cabFrame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.15, 2.45), bodyMat);
    cabFrame.position.set(-0.72, 3.35, 0.45);
    var cabGlass = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.65, 2.15), cyanGlassMat);
    cabGlass.position.set(-0.72, 3.42, 0.52);
    var roofBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.38, 10), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    roofBeacon.position.set(-0.72, 4.62, 0.45);
    var exFace = createCartoonFacePlane(3.1, 1.35, 'transparent', 'car_smile');
    exFace.position.set(0, 1.95, 2.22);
    g.add(upperDeck, counterweight, cabFrame, cabGlass, roofBeacon, exFace);

    frontFaceZ = 2.26;
    frontFaceY = 1.90;
    headlightSpreadX = 1.15;
    headlightY = 1.75;

    var boomGroup = new THREE.Group();
    boomGroup.position.set(0.75, 2.35, 1.45);
    var lowerBoom = new THREE.Mesh(new THREE.BoxGeometry(0.58, 3.8, 0.68), bodyMat);
    lowerBoom.position.set(0, 1.65, 1.05);
    lowerBoom.rotation.x = 0.52;
    var hydCylinder1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.4, 8), pistonMat);
    hydCylinder1.position.set(0, 1.15, 1.45);
    hydCylinder1.rotation.x = 0.42;
    var dipperStick = new THREE.Mesh(new THREE.BoxGeometry(0.48, 3.1, 0.56), bodyMat);
    dipperStick.position.set(0, 2.45, 3.25);
    dipperStick.rotation.x = 1.85;
    var bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.35, 10, 1, false, 0, Math.PI * 1.15), darkTrimMat);
    bucket.rotation.z = Math.PI / 2;
    bucket.rotation.x = 0.45;
    bucket.position.set(0, 1.25, 4.55);
    for (var bti = -2; bti <= 2; bti++) {
      var tooth = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.38, 6), pistonMat);
      tooth.rotation.x = Math.PI * 0.65;
      tooth.position.set(bti * 0.25, 0.92, 5.18);
      boomGroup.add(tooth);
    }
    boomGroup.add(lowerBoom, hydCylinder1, dipperStick, bucket);
    g.add(boomGroup);
    addContactShadow(g, 5.0, 8.8, 0.06);

  } else if (vehicleKind === 'tractor') {
    // 3D Farm Tractor (Traktor) with Giant Rear Treaded Tires, Smaller Front Wheels, Chimney Exhaust & Glazed Cab!
    var yellowRimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.2 });
    var tireBlackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    var exhaustMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.7 });

    var engineHood = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.65, 3.35), bodyMat);
    engineHood.position.set(0, 2.05, 1.55);
    engineHood.castShadow = true;
    var hoodTop = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 3.32, 12, 1, false, 0, Math.PI), bodyMat);
    hoodTop.rotation.z = Math.PI / 2;
    hoodTop.rotation.y = Math.PI / 2;
    hoodTop.position.set(0, 2.85, 1.55);

    var tractorCab = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.55, 2.55), bodyMat);
    tractorCab.position.set(0, 3.15, -1.05);
    tractorCab.castShadow = true;
    var cabWinGlass = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.75, 2.25), cyanGlassMat);
    cabWinGlass.position.set(0, 3.35, -1.02);
    var cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.32, 2.85), bodyMat);
    cabRoof.position.set(0, 4.52, -1.05);
    var rearFenderL = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.82, 16, 1, false, 0, Math.PI), bodyMat);
    rearFenderL.rotation.z = Math.PI / 2;
    rearFenderL.position.set(-1.55, 1.58, -1.25);
    var rearFenderR = rearFenderL.clone();
    rearFenderR.position.x = 1.55;

    var exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.15, 10), exhaustMat);
    exhaustPipe.position.set(-0.72, 3.65, 1.95);
    var exhaustTip = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.35, 10), exhaustMat);
    exhaustTip.position.set(-0.72, 4.75, 2.02);
    exhaustTip.rotation.x = -0.35;

    var trFace = createCartoonFacePlane(1.92, 1.58, 'transparent', 'car_smile');
    trFace.position.set(0, 2.05, 3.28);
    g.add(engineHood, hoodTop, tractorCab, cabWinGlass, cabRoof, rearFenderL, rearFenderR, exhaustPipe, exhaustTip, trFace);

    frontFaceZ = 3.32;
    frontFaceY = 2.00;
    headlightSpreadX = 0.78;
    headlightY = 1.85;

    [-1.68, 1.68].forEach(function(rx) {
      var rearW = new THREE.Group();
      rearW.position.set(rx, 1.48, -1.25);
      var rTire = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.86, 20), tireBlackMat);
      rTire.rotation.z = Math.PI / 2;
      var rRim = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.90, 16), yellowRimMat);
      rRim.rotation.z = Math.PI / 2;
      var rHub = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.94, 12), darkTrimMat);
      rHub.rotation.z = Math.PI / 2;
      rearW.add(rTire, rRim, rHub);
      g.add(rearW);
    });
    [-1.32, 1.32].forEach(function(fx) {
      var frontW = new THREE.Group();
      frontW.position.set(fx, 0.88, 2.15);
      var fTire = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.56, 16), tireBlackMat);
      fTire.rotation.z = Math.PI / 2;
      var fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.60, 14), yellowRimMat);
      fRim.rotation.z = Math.PI / 2;
      frontW.add(fTire, fRim);
      g.add(frontW);
    });
    addContactShadow(g, 4.8, 7.8, 0.06);

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

    frontFaceZ = 3.72;
    frontFaceY = 1.42;
    headlightSpreadX = 1.12;
    headlightY = 1.18;

    [[-1.7, 2.1], [1.7, 2.1], [-1.7, -2.1], [1.7, -2.1]].forEach(function(wp) {
      var wh = createCarWheelGroup(0.92, 0.58);
      wh.position.set(wp[0], 0.92, wp[1]);
      g.add(wh);
    });
    addContactShadow(g, 4.8, 8.6, 0.06);
  }

  // ==========================================================================
  // 3D FLASHING HEADLIGHTS & BIG CHEERFUL SMILE FOR RAILWAY CROSSING GREETINGS
  // ("3. Auta na přejezdu blikají na vláček a usmívají se.")
  // ==========================================================================
  var crossingLights = [];
  [-1, 1].forEach(function(sideSign) {
    var hlGroup = new THREE.Group();
    hlGroup.position.set(sideSign * headlightSpreadX, headlightY, frontFaceZ + 0.04);

    var bezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.055, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.2 })
    );
    var bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), bulbMat);
    bulb.scale.set(1.0, 1.0, 0.45);

    var haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var halo = new THREE.Mesh(new THREE.CircleGeometry(0.72, 16), haloMat);
    halo.position.z = 0.06;

    var beamCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.15, 4.6, 14, 1, true),
      haloMat
    );
    beamCone.rotation.x = -Math.PI / 2;
    beamCone.position.set(0, -0.08, 2.35);

    hlGroup.add(bezel, bulb, halo, beamCone);
    g.add(hlGroup);
    crossingLights.push({
      group: hlGroup,
      bulb: bulb,
      bulbMat: bulbMat,
      halo: halo,
      beamCone: beamCone,
      haloMat: haloMat
    });
  });

  // Big Beaming 3D Smile & Happy Rosy Cheeks when smiling at the train at a crossing
  var crossingSmileGroup = new THREE.Group();
  crossingSmileGroup.position.set(0, frontFaceY - 0.26, frontFaceZ + 0.06);

  var smileArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.095, 10, 20, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xe11d48 })
  );
  smileArc.rotation.z = Math.PI;
  smileArc.position.y = 0.14;

  var whiteTeeth = new THREE.Mesh(
    new THREE.CircleGeometry(0.50, 18, Math.PI, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  whiteTeeth.position.set(0, 0.12, -0.01);

  [-0.68, 0.68].forEach(function(cx) {
    var rosyCheek = new THREE.Mesh(
      new THREE.CircleGeometry(0.20, 12),
      new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.85 })
    );
    rosyCheek.position.set(cx, 0.16, 0.01);
    crossingSmileGroup.add(rosyCheek);
  });

  crossingSmileGroup.add(smileArc, whiteTeeth);
  g.add(crossingSmileGroup);

  g.userData.crossingLights = crossingLights;
  g.userData.crossingSmileGroup = crossingSmileGroup;

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

// Spawn 24 Friendly Storybook Vehicles across the Complete Connected Road Network (including Yellow School Buses, Excavators & Tractors)!
livingVehicles.push(createLivingRoadVehicle("🚗 Ruby Red Car",        0xef4444, 'mini',      0, 0.02));
livingVehicles.push(createLivingRoadVehicle("🚌 Yellow School Bus",   0xfacc15, 'bus',       0, 0.11));
livingVehicles.push(createLivingRoadVehicle("🚜 Green Farm Tractor",  0x16a34a, 'tractor',   0, 0.21));
livingVehicles.push(createLivingRoadVehicle("🚜 Mighty Yellow Digger",0xf59e0b, 'excavator', 0, 0.31));
livingVehicles.push(createLivingRoadVehicle("🚙 Sky Blue Coupe",      0x38bdf8, 'mini',      0, 0.41));
livingVehicles.push(createLivingRoadVehicle("🚌 Sunny School Bus",    0xeab308, 'bus',       0, 0.51));
livingVehicles.push(createLivingRoadVehicle("🚜 Red Country Tractor", 0xdc2626, 'tractor',   0, 0.61));
livingVehicles.push(createLivingRoadVehicle("🚜 Builder Excavator",   0xfacc15, 'excavator', 0, 0.71));
livingVehicles.push(createLivingRoadVehicle("🚐 Berry Ice-Cream Van", 0xf472b6, 'van',       0, 0.81));
livingVehicles.push(createLivingRoadVehicle("🚌 Happy School Bus",    0xfacc15, 'bus',       0, 0.91));

livingVehicles.push(createLivingRoadVehicle("🚙 Barnaby Blue Car",    0x0284c7, 'mini',      1, 0.04));
livingVehicles.push(createLivingRoadVehicle("🚌 Buster School Bus",   0xfacc15, 'bus',       1, 0.14));
livingVehicles.push(createLivingRoadVehicle("🚜 Big Yellow Excavator",0xeab308, 'excavator', 1, 0.24));
livingVehicles.push(createLivingRoadVehicle("🚜 Johnny Green Tractor",0x15803d, 'tractor',   1, 0.34));
livingVehicles.push(createLivingRoadVehicle("🚗 Pippa Green Car",     0x22c55e, 'mini',      1, 0.44));
livingVehicles.push(createLivingRoadVehicle("🚌 Golden School Bus",   0xfacc15, 'bus',       1, 0.54));
livingVehicles.push(createLivingRoadVehicle("🚜 Orange Power Digger", 0xf97316, 'excavator', 1, 0.64));
livingVehicles.push(createLivingRoadVehicle("🚜 Blue Holland Tractor",0x2563eb, 'tractor',   1, 0.74));
livingVehicles.push(createLivingRoadVehicle("🚐 Postman Red Van",     0xdc2626, 'van',       1, 0.84));
livingVehicles.push(createLivingRoadVehicle("🚙 Indigo Family Car",   0x6366f1, 'mini',      1, 0.94));

// Spawn 4 vehicles on the Connected Airport & Parking Lot Road Loop (loopIdx = 2)!
livingVehicles.push(createLivingRoadVehicle("🚌 Airport School Bus",  0xfacc15, 'bus',       2, 0.08));
livingVehicles.push(createLivingRoadVehicle("🚜 Airport Crew Tractor",0x16a34a, 'tractor',   2, 0.34));
livingVehicles.push(createLivingRoadVehicle("🚙 Holiday Family Car",  0xef4444, 'mini',      2, 0.60));
livingVehicles.push(createLivingRoadVehicle("🚜 Runway Excavator",    0xf59e0b, 'excavator', 2, 0.84));

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
    var headGroup = new THREE.Group();
    headGroup.position.set(0, 1.85, 1.45);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 10), darkMat);
    head.scale.set(0.9, 0.95, 1.25);
    headGroup.add(head);
    g.add(headGroup);

    // 4 Sheep Legs (with articulated front-right & front-left legs so sheep wave to the train!)
    function makeSheepLeg(lx, lz) {
      var piv = new THREE.Group();
      piv.position.set(lx, 0.95, lz);
      var legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.95, 8), darkMat);
      legMesh.position.y = -0.45;
      var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), darkMat);
      hoof.position.set(0, -0.90, 0.06);
      piv.add(legMesh, hoof);
      g.add(piv);
      return piv;
    }
    var sLeftFore  = makeSheepLeg(-0.48,  0.65);
    var sRightFore = makeSheepLeg( 0.48,  0.65);
    makeSheepLeg(-0.48, -0.65);
    makeSheepLeg( 0.48, -0.65);
    g.userData = { rightForeleg: sRightFore, leftForeleg: sLeftFore, headGroup: headGroup };
  } else if (type === 'cow') {
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.45, 3.1), whiteMat); body.position.y = 1.55;
    var patch1 = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.85, 1.1), blackMat); patch1.position.set(0, 1.7, 0.3);
    var headGroupCow = new THREE.Group();
    headGroupCow.position.set(0, 2.25, 1.85);
    var headCow = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.25), whiteMat);
    var face = createCartoonFacePlane(1.1, 1.0, '#f472b6'); face.position.set(0, 0, 0.65);
    headGroupCow.add(headCow, face);
    g.add(body, patch1, headGroupCow);

    // 4 Cow Legs (with articulated front-right & front-left legs so Daisy the Cow waves to the train!)
    function makeCowLeg(lx, lz) {
      var piv = new THREE.Group();
      piv.position.set(lx, 1.05, lz);
      var legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.05, 10), whiteMat);
      legMesh.position.y = -0.50;
      var hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.24, 10), blackMat);
      hoof.position.set(0, -0.98, 0.05);
      piv.add(legMesh, hoof);
      g.add(piv);
      return piv;
    }
    var cLeftFore  = makeCowLeg(-0.65,  1.05);
    var cRightFore = makeCowLeg( 0.65,  1.05);
    makeCowLeg(-0.65, -1.05);
    makeCowLeg( 0.65, -1.05);
    g.userData = { rightForeleg: cRightFore, leftForeleg: cLeftFore, headGroup: headGroupCow };
  } else {
    var yelMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 2.9), yelMat); body.position.y = 2.2;
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.58, 4.6, 8), yelMat); neck.position.set(0, 4.4, 1.35);
    g.add(body, neck);
  }
  return g;
}

window.daisyTheCow = createDetailedAnimal('cow');
(function placeDaisyTheCowAtTrackLevel() {
  var cowEdge = edges.find(function(ed) { return ed.id === 'J_NE->J_EAST'; });
  if (cowEdge && cowEdge.curve) {
    var cowPt = cowEdge.curve.getPointAt(0.20);
    var cowTan = cowEdge.curve.getTangentAt(0.20).normalize();
    var cowPerp = new THREE.Vector3(-cowTan.z, 0, cowTan.x).normalize();
    var cowWorld = cowPt.clone().add(cowPerp.clone().multiplyScalar(-8.2));
    var gY = terrainY(cowWorld.x, cowWorld.z);
    var padH = Math.max(0.6, cowPt.y - gY);
    var padG = new THREE.Group();
    padG.position.set(cowWorld.x, cowPt.y, cowWorld.z);
    var earthCone = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.8 + padH * 0.45, padH, 20),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 })
    );
    earthCone.position.y = -padH * 0.5;
    var grassTop = new THREE.Mesh(
      new THREE.CylinderGeometry(4.3, 4.3, 0.28, 20),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.70 })
    );
    grassTop.position.y = -0.10;
    padG.add(earthCone, grassTop);
    scene.add(padG);
    daisyTheCow.position.set(cowWorld.x, cowPt.y, cowWorld.z);
    daisyTheCow.lookAt(cowPt.x, cowPt.y, cowPt.z);
  } else {
    daisyTheCow.position.set(175, terrainY(175, -185), -185);
  }
})();
scene.add(daisyTheCow);

window.trackSheepFlocks = [];
[
  { edgeId: 'J_SOUTH->J_SW', t: 0.25 },
  { edgeId: 'J_SE->J_SOUTH', t: 0.22 }
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
  // Positioned at ez = -266 so the 32m Champ de Mars plaza sits strictly north of the road at (-95, -225),
  // keeping the asphalt road 100% uncovered and continuous!
  var ex = -108, ez = -266;
  var flatPlainY = 7.35; // Matches natural terrain height so the road at z = -225 is never buried!

  // Push the 3 giant northern backdrop hill spheres (created in tracks.js at z = -260..-285) 150m further north
  // so they stand majestically on the distant horizon and NEVER swallow the Eiffel Tower or Grandma's House + Kaufland!
  scene.traverse(function(obj) {
    if (obj.isMesh && obj.scale && obj.scale.x >= 90 && obj.position.z <= -220 && !obj.userData._shiftedNorthHorizon) {
      obj.userData._shiftedNorthHorizon = true;
      obj.position.z -= 150;
    }
  });

  // Flatten the 3D terrain mesh & height function strictly under the Eiffel Tower plaza (z < -231, clear of the road!)
  // AND under Grandma's House + Kaufland in Bohumín (z < -204, clear of the J_NORTH->J_NE railway tracks!)
  var origGetTerrainHeight = window.getTerrainHeight;
  if (origGetTerrainHeight && !window._eiffelTerrainFlattened) {
    window._eiffelTerrainFlattened = true;
    window.getTerrainHeight = function(x, z) {
      var rawH = origGetTerrainHeight(x, z);
      // 1) Eiffel Tower level plain (strictly north of z = -231 so the road at z = -225 is 100% untouched!)
      if (z < -231.0) {
        var dxE = (x - ex) / 48.0;
        var dzE = (z - ez) / 34.0;
        var dE = Math.hypot(dxE, dzE);
        if (dE < 1.0) {
          var blendE = dE <= 0.68 ? 0.0 : (dE - 0.68) / 0.32;
          var sBlendE = blendE * blendE * (3.0 - 2.0 * blendE);
          return flatPlainY * (1.0 - sBlendE) + rawH * sBlendE;
        }
      }
      // 2) Bohumín level plain for Grandma's 3-story house (z = -226) & Kaufland 50m behind it (z = -292),
      //    kept strictly north of z = -202 so the railway track J_NORTH->J_NE is NEVER buried!
      if (z < -202.0) {
        var dxG = (x - 150.0) / 68.0;
        var dzG = (z - (-262.0)) / 58.0;
        var dG = Math.hypot(dxG, dzG);
        if (dG < 1.0) {
          var blendG = dG <= 0.72 ? 0.0 : (dG - 0.72) / 0.28;
          var sBlendG = blendG * blendG * (3.0 - 2.0 * blendG);
          return 3.20 * (1.0 - sBlendG) + rawH * sBlendG;
        }
      }
      return rawH;
    };

    scene.children.forEach(function(ch) {
      if (ch.isMesh && ch.geometry && ch.geometry.attributes && ch.geometry.attributes.position && ch.geometry.attributes.position.count > 10000) {
        var pAttr = ch.geometry.attributes.position;
        var cAttr = ch.geometry.attributes.color;
        var meadowCol = new THREE.Color(0x4ade80);
        for (var vi = 0; vi < pAttr.count; vi++) {
          var vx = pAttr.getX(vi);
          var vz = pAttr.getZ(vi);
          var dE = (vz < -231.0) ? Math.hypot((vx - ex) / 48.0, (vz - ez) / 34.0) : 99.0;
          var dG = (vz < -202.0) ? Math.hypot((vx - 150.0) / 68.0, (vz - (-262.0)) / 58.0) : 99.0;
          if (dE < 1.0 || dG < 1.0) {
            var newVy = window.getTerrainHeight(vx, vz);
            pAttr.setY(vi, newVy);
            if (cAttr && newVy < 16.5) {
              cAttr.setXYZ(vi, meadowCol.r, meadowCol.g, meadowCol.b);
            }
          }
        }
        pAttr.needsUpdate = true;
        if (cAttr) cAttr.needsUpdate = true;
        ch.geometry.computeVertexNormals();
      }
    });
  }

  var ey = flatPlainY;
  var g = new THREE.Group();
  g.position.set(ex, ey, ez);

  // Expansive Flat Champ de Mars Park Lawn & Stone Promenade Terrace Pad (radius 32m -> ends at z = -234, clear of road!)
  var parkLawnPad = new THREE.Mesh(
    new THREE.CylinderGeometry(31.5, 33.0, 0.5, 44),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.75 })
  );
  parkLawnPad.position.y = 0.15;
  g.add(parkLawnPad);

  // Procedural Wrought-Iron Lattice Truss Texture for Authentic Eiffel Filigree
  function createEiffelLatticeTex() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#9a4406';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    for (var y = 0; y < 256; y += 64) {
      ctx.strokeRect(4, y + 4, 248, 56);
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(256, y + 64);
      ctx.moveTo(256, y); ctx.lineTo(0, y + 64);
      ctx.stroke();
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    for (var y2 = 0; y2 < 256; y2 += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y2); ctx.lineTo(256, y2);
      ctx.stroke();
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 2, 6) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  var latticeTex = createEiffelLatticeTex();
  var bronzeMat = new THREE.MeshStandardMaterial({
    map: latticeTex,
    color: 0xd97706,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    roughness: 0.34,
    metalness: 0.58
  });
  var solidBronzeMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    emissive: 0xd97706,
    emissiveIntensity: 0.0,
    roughness: 0.36,
    metalness: 0.62
  });
  var goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.0,
    roughness: 0.26,
    metalness: 0.68
  });
  var deckMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    emissive: 0xb45309,
    emissiveIntensity: 0.0,
    roughness: 0.42,
    metalness: 0.42
  });
  var stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 });
  var warmStoneMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    roughness: 0.48
  });
  var glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // Grand Parisian Champ de Mars Promenade Plaza with Concentric Cobblestone Rings & Parterres
  var outerPlaza = new THREE.Mesh(new THREE.CylinderGeometry(28.5, 30.0, 0.7, 40), stoneMat);
  outerPlaza.position.y = 0.35;
  var innerPlaza = new THREE.Mesh(new THREE.CylinderGeometry(22.0, 22.8, 0.9, 36), warmStoneMat);
  innerPlaza.position.y = 0.48;
  var centerMedallion = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.0, 1.05, 28), new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.45 }));
  centerMedallion.position.y = 0.54;
  g.add(outerPlaza, innerPlaza, centerMedallion);

  // 8 Parisian Garden Parterres with Manicured Hedges, Trees & Colorful Blossoms
  var flowerPalette = [0xf43f5e, 0xfacc15, 0xa855f7, 0x38bdf8, 0xfb7185];
  for (var pi = 0; pi < 8; pi++) {
    var pAng = (pi / 8) * Math.PI * 2 + Math.PI * 0.125;
    var px = Math.cos(pAng) * 24.5;
    var pz = Math.sin(pAng) * 24.5;
    var bed = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.65, 14), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 }));
    bed.position.set(px, 0.85, pz);
    g.add(bed);
    for (var fi = 0; fi < 6; fi++) {
      var fa = (fi / 6) * Math.PI * 2;
      var flw = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), new THREE.MeshBasicMaterial({ color: flowerPalette[(pi + fi) % flowerPalette.length] }));
      flw.position.set(px + Math.cos(fa) * 1.4, 1.32, pz + Math.sin(fa) * 1.4);
      g.add(flw);
    }
    if (pi % 2 === 0) {
      // Classic Black & Gold Parisian Wrought-Iron Streetlamp
      var lampG = new THREE.Group();
      lampG.position.set(Math.cos(pAng) * 20.5, 0.8, Math.sin(pAng) * 20.5);
      var post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 5.2, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 }));
      post.position.y = 2.6;
      var globe = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 12), glowMat);
      globe.position.y = 5.4;
      var crown = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.55, 8), goldTrimMat);
      crown.position.y = 5.95;
      lampG.add(post, globe, crown);
      g.add(lampG);
    }
  }

  var legSpreadBot = 12.6;
  var legSpreadMid1 = 6.9;
  var legSpreadMid2 = 3.5;

  // 4 Tapered Lattice Legs with Masonry Plinths & 3D Cross-Braced Struts
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c) {
    var plinthBase = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.6, 5.8), stoneMat);
    plinthBase.position.set(c[0] * legSpreadBot, 0.8, c[1] * legSpreadBot);
    var plinthTop = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 5.0), warmStoneMat);
    plinthTop.position.set(c[0] * legSpreadBot, 2.2, c[1] * legSpreadBot);
    g.add(plinthBase, plinthTop);

    // Lower leg (y = 2.5 -> 18.5)
    var p0 = new THREE.Vector3(c[0] * legSpreadBot, 2.5, c[1] * legSpreadBot);
    var p1 = new THREE.Vector3(c[0] * legSpreadMid1, 18.5, c[1] * legSpreadMid1);
    var dir1 = p1.clone().sub(p0);
    var leg1 = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 2.25, dir1.length(), 8), bronzeMat);
    leg1.position.copy(p0.clone().lerp(p1, 0.5));
    leg1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir1.clone().normalize());
    leg1.castShadow = true;
    g.add(leg1);

    // Horizontal truss collars along lower leg
    for (var s1 = 1; s1 <= 4; s1++) {
      var lp = p0.clone().lerp(p1, s1 / 5);
      var collar = new THREE.Mesh(new THREE.BoxGeometry(3.2 - s1 * 0.25, 0.38, 3.2 - s1 * 0.25), goldTrimMat);
      collar.position.copy(lp);
      g.add(collar);
    }

    // Middle leg (y = 19.0 -> 36.5)
    var p2 = new THREE.Vector3(c[0] * legSpreadMid2, 36.5, c[1] * legSpreadMid2);
    var dir2 = p2.clone().sub(p1);
    var leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.32, dir2.length(), 8), bronzeMat);
    leg2.position.copy(p1.clone().lerp(p2, 0.5));
    leg2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2.clone().normalize());
    leg2.castShadow = true;
    g.add(leg2);
  });

  // 4 Grand Decorative Base Arches with Dual Filigree Rings & Spandrel Struts
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(rotY) {
    var archG = new THREE.Group();
    archG.rotation.y = rotY;
    var archOuter = new THREE.Mesh(new THREE.TorusGeometry(9.6, 0.55, 10, 28, Math.PI), goldTrimMat);
    archOuter.position.set(0, 2.6, legSpreadBot * 0.86);
    var archInner = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.38, 8, 24, Math.PI), solidBronzeMat);
    archInner.position.set(0, 2.6, legSpreadBot * 0.86);
    archG.add(archOuter, archInner);
    for (var ai = 1; ai < 8; ai++) {
      var aTheta = (ai / 8) * Math.PI;
      var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.3, 0.26), goldTrimMat);
      spoke.position.set(Math.cos(aTheta) * 9.0, 2.6 + Math.sin(aTheta) * 9.0, legSpreadBot * 0.86);
      spoke.rotation.z = aTheta - Math.PI * 0.5;
      archG.add(spoke);
    }
    g.add(archG);
  });

  // 1st Grand Observation Deck (y = 18.5) with Panoramic Restaurant Windows & Golden Frieze
  var deck1 = new THREE.Mesh(new THREE.BoxGeometry(18.2, 2.4, 18.2), deckMat);
  deck1.position.y = 18.5;
  var deck1Win = new THREE.Mesh(new THREE.BoxGeometry(16.8, 1.2, 16.8), glowMat);
  deck1Win.position.y = 20.1;
  var rail1 = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.65, 19.0), goldTrimMat);
  rail1.position.y = 20.8;
  g.add(deck1, deck1Win, rail1);

  // 2nd Observation Deck (y = 36.5) with Double-Tier Viewing Gallery
  var deck2 = new THREE.Mesh(new THREE.BoxGeometry(10.8, 2.0, 10.8), deckMat);
  deck2.position.y = 36.5;
  var deck2Win = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.0, 9.6), glowMat);
  deck2Win.position.y = 37.8;
  var rail2 = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.58, 11.6), goldTrimMat);
  rail2.position.y = 38.4;
  g.add(deck2, deck2Win, rail2);

  // Upper Lattice Spire Tower (y = 37.5 -> 62.5) with Cross-Braced Filigree Rings
  var upperSpire = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 3.9, 25.0, 8), bronzeMat);
  upperSpire.position.y = 50.0;
  upperSpire.castShadow = true;
  g.add(upperSpire);

  for (var ry = 22; ry <= 60; ry += 3.8) {
    var ringW = ry < 36 ? (15.4 - (ry - 20) * 0.36) : (7.6 - (ry - 36) * 0.19);
    var ring = new THREE.Mesh(new THREE.BoxGeometry(ringW, 0.42, ringW), goldTrimMat);
    ring.position.y = ry;
    g.add(ring);
  }

  // 3rd Summit Gustave Eiffel Cupola, Glowing Lighthouse Beacon & French Tricolor Flag
  var deck3 = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 1.9, 18), deckMat);
  deck3.position.y = 62.8;
  var cupola = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.6, 4.4, 18), goldTrimMat);
  cupola.position.y = 65.6;
  var cupolaDome = new THREE.Mesh(new THREE.SphereGeometry(1.75, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), goldTrimMat);
  cupolaDome.position.y = 67.8;
  var antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.42, 9.5, 10), glowMat);
  antenna.position.y = 72.5;
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(1.28, 14, 14), glowMat);
  beacon.position.y = 69.2;
  window.eiffelBeacon = beacon;
  g.add(deck3, cupola, cupolaDome, antenna, beacon);

  // ============================================================================
  // PARISIAN GOLDEN NIGHT ILLUMINATION (`1. prosím o nasvícení eiffel tower v noci`)
  // ============================================================================
  var nightGroup = new THREE.Group();
  g.add(nightGroup);

  // 1) 3 Tiered Golden Architectural PointLights (Base Arches, Mid Decks & Summit Crown)
  var baseNightLight = new THREE.PointLight(0xffb703, 0.0, 105, 1.3);
  baseNightLight.position.set(0, 14.0, 0);
  var midNightLight = new THREE.PointLight(0xfbbf24, 0.0, 110, 1.3);
  midNightLight.position.set(0, 39.0, 0);
  var topNightLight = new THREE.PointLight(0xfef08a, 0.0, 130, 1.25);
  topNightLight.position.set(0, 69.2, 0);
  nightGroup.add(baseNightLight, midNightLight, topNightLight);

  // 2) Glowing Golden Contour Festoons along the 4 Arches, 1st Deck, 2nd Deck & 3rd Deck
  var contourGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  });
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(rotY) {
    var archGlow = new THREE.Mesh(new THREE.TorusGeometry(9.0, 0.28, 8, 28, Math.PI), contourGlowMat);
    archGlow.rotation.y = rotY;
    archGlow.position.set(0, 2.6, legSpreadBot * 0.86);
    if (rotY === Math.PI * 0.5) archGlow.position.set(legSpreadBot * 0.86, 2.6, 0);
    else if (rotY === Math.PI) archGlow.position.set(0, 2.6, -legSpreadBot * 0.86);
    else if (rotY === Math.PI * 1.5) archGlow.position.set(-legSpreadBot * 0.86, 2.6, 0);
    nightGroup.add(archGlow);
  });

  var deck1GlowRim = new THREE.Mesh(new THREE.BoxGeometry(19.35, 0.52, 19.35), contourGlowMat);
  deck1GlowRim.position.y = 19.6;
  var deck2GlowRim = new THREE.Mesh(new THREE.BoxGeometry(11.85, 0.48, 11.85), contourGlowMat);
  deck2GlowRim.position.y = 37.4;
  var deck3GlowRim = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 0.55, 20), contourGlowMat);
  deck3GlowRim.position.y = 63.6;
  nightGroup.add(deck1GlowRim, deck2GlowRim, deck3GlowRim);

  // 3) Iconic Rotating Twin Golden Searchlight Beams (`Phare de la Tour Eiffel`) at Summit (`y = 69.2`)
  var beaconRotor = new THREE.Group();
  beaconRotor.position.set(0, 69.2, 0);
  var searchBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var beamGeo = new THREE.ConeGeometry(7.5, 48.0, 18, 1, true);
  var searchBeam1 = new THREE.Mesh(beamGeo, searchBeamMat);
  searchBeam1.rotation.z = Math.PI * 0.5;
  searchBeam1.position.set(24.0, 0, 0);
  var searchBeam2 = new THREE.Mesh(beamGeo, searchBeamMat);
  searchBeam2.rotation.z = -Math.PI * 0.5;
  searchBeam2.position.set(-24.0, 0, 0);
  var beaconHalo = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 16), searchBeamMat);
  beaconRotor.add(searchBeam1, searchBeam2, beaconHalo);
  nightGroup.add(beaconRotor);

  // 4) 68 Sparkling Golden-White Diamond Bulbs (`Scintillement de la Tour Eiffel`) across Legs, Decks & Spire
  var sparkleGeo = new THREE.SphereGeometry(0.44, 8, 8);
  var sparkleMatA = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
  var sparkleMatB = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.0, depthWrite: false });
  var sparkleMatC = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.0, depthWrite: false });
  var sparkleMats = [sparkleMatA, sparkleMatB, sparkleMatC];
  var sparkleBulbs = [];

  function addSparkleBulb(bx, by, bz, idx) {
    var sm = new THREE.Mesh(sparkleGeo, sparkleMats[idx % 3]);
    sm.position.set(bx, by, bz);
    nightGroup.add(sm);
    sparkleBulbs.push({ mesh: sm, phase: idx * 1.37 });
  }

  var spIdx = 0;
  // Sparkles along the 4 tapered legs (`y = 4 -> 36`)
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c) {
    for (var ls = 0; ls < 8; ls++) {
      var uL = ls / 7.0;
      var sy = 4.0 + uL * 31.5;
      var spread = legSpreadBot * (1.0 - uL) + legSpreadMid2 * uL;
      var outSign = 1.08;
      addSparkleBulb(c[0] * spread * outSign, sy, c[1] * spread * outSign, spIdx++);
    }
  });
  // Sparkles along the upper spire (`y = 39 -> 66`)
  for (var us = 0; us < 36; us++) {
    var uS = us / 35.0;
    var spy = 39.0 + uS * 27.5;
    var spRad = (3.9 * (1.0 - uS) + 1.55 * uS) + 0.35;
    var spAng = us * 2.39996;
    addSparkleBulb(Math.cos(spAng) * spRad, spy, Math.sin(spAng) * spRad, spIdx++);
  }

  window.eiffelNightSystem = {
    emissiveMats: [
      { mat: bronzeMat, maxInt: 0.95 },
      { mat: solidBronzeMat, maxInt: 0.85 },
      { mat: goldTrimMat, maxInt: 1.18 },
      { mat: deckMat, maxInt: 0.72 },
      { mat: warmStoneMat, maxInt: 0.35 }
    ],
    baseLight: baseNightLight,
    midLight: midNightLight,
    topLight: topNightLight,
    contourMat: contourGlowMat,
    searchBeamMat: searchBeamMat,
    beaconRotor: beaconRotor,
    sparkleMats: sparkleMats,
    sparkleBulbs: sparkleBulbs,
    currentBlend: 0.0
  };

  scene.add(g);

  // Cheerful Parisian Visitors waving near the plaza on the flat plain
  spawnPerson(ex + 18, ey, ez + 18, 0xef4444, 0x1e3a8a, false, 1.45, 0.4);
  spawnPerson(ex - 16, ey, ez + 20, 0x38bdf8, null, false, 1.42, -0.3);

  // Wide panoramic perspective framing the ENTIRE 77m Eiffel Tower from base legs to top spire + the train!
  window.eiffelWorldCenter = new THREE.Vector3(ex, ey, ez);
})();

// 2. BIG BEN & PALACE OF WESTMINSTER (`J_SW -> J_WEST` at x = -286, z = 92)
(function buildBigBenLandmark() {
  var bx = -286, bz = 92;
  var by = terrainY(bx, bz);
  var g = new THREE.Group();
  g.position.set(bx, by, bz);

  // Procedural Neo-Gothic Honey-Limestone Vertical Fluting & Tracery Texture
  function createGothicLimestoneTex() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 256, 256);
    for (var x = 0; x < 256; x += 16) {
      ctx.fillStyle = (x % 32 === 0) ? '#ca8a04' : '#fde047';
      ctx.fillRect(x, 0, 6, 256);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(x + 12, 0, 2, 256);
    }
    for (var y = 0; y < 256; y += 64) {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, y, 256, 8);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, y + 8, 256, 4);
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 2, 4) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // High-Resolution 512x512 Big Ben Great Clock of Westminster Dial Texture
  function createBigBenClockTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    // Ornate Neo-Gothic Gilded Frame & Spandrels
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 24;
    ctx.strokeRect(14, 14, 484, 484);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 452, 452);

    // Corner Gothic quatrefoil spandrel ornaments
    [[72, 72], [440, 72], [72, 440], [440, 440]].forEach(function(sp) {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sp[0], sp[1], 14, 0, Math.PI * 2);
      ctx.fill();
    });

    // Illuminated Opal-Glass Clock Dial
    var dialGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 205);
    dialGrad.addColorStop(0.0, '#ffffff');
    dialGrad.addColorStop(0.75, '#fefce8');
    dialGrad.addColorStop(1.0, '#fde68a');
    ctx.fillStyle = dialGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 202, 0, Math.PI * 2);
    ctx.fill();

    // Outer & Inner Gilded Chapter Rings
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 202, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 152, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(256, 256, 86, 0, Math.PI * 2);
    ctx.stroke();

    // 60 Minute Ticks & 12 Bold Gothic Hour Numerals
    for (var m = 0; m < 60; m++) {
      var a = (m / 60) * Math.PI * 2 - Math.PI * 0.5;
      var isHour = (m % 5 === 0);
      ctx.strokeStyle = isHour ? '#0f172a' : '#78350f';
      ctx.lineWidth = isHour ? 11 : 4;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(a) * (isHour ? 156 : 182), 256 + Math.sin(a) * (isHour ? 156 : 182));
      ctx.lineTo(256 + Math.cos(a) * 194, 256 + Math.sin(a) * 194);
      ctx.stroke();
    }

    // Ornate Copper/Gold Minute & Hour Hands
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 256); ctx.lineTo(256, 108);
    ctx.moveTo(256, 256); ctx.lineTo(366, 256);
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(256, 256); ctx.lineTo(256, 114);
    ctx.moveTo(256, 256); ctx.lineTo(360, 256);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(256, 256, 22, 0, Math.PI * 2);
    ctx.fill();
    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var gothicStoneMat = new THREE.MeshStandardMaterial({ map: createGothicLimestoneTex(), roughness: 0.48, metalness: 0.14 });
  var sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.50, metalness: 0.12 });
  var creamStoneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.42 });
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.24, metalness: 0.68 });
  var slateRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.36, metalness: 0.35 });
  var clockFaceMat = new THREE.MeshBasicMaterial({ map: createBigBenClockTex() });
  var londonRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32, metalness: 0.18 });

  // Westminster Cobblestone Embankment Terrace & Parapet Wall
  var terrace = new THREE.Mesh(new THREE.BoxGeometry(44, 1.2, 42), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }));
  terrace.position.set(4, 0.6, -4);
  g.add(terrace);

  // Palace of Westminster Gothic Wing with Rhythmic Golden Buttresses, Tall Arched Windows & Crenellations
  var wing = new THREE.Mesh(new THREE.BoxGeometry(28, 13.5, 15.5), gothicStoneMat);
  wing.position.set(0, 6.75, -17.5);
  wing.castShadow = true;
  var wingRoof = new THREE.Mesh(new THREE.BoxGeometry(29.2, 2.2, 16.5), slateRoofMat);
  wingRoof.position.set(0, 14.2, -17.5);
  g.add(wing, wingRoof);

  for (var wb = -12; wb <= 12; wb += 4.8) {
    var buttress = new THREE.Mesh(new THREE.BoxGeometry(1.1, 15.2, 16.8), creamStoneMat);
    buttress.position.set(wb, 7.6, -17.5);
    var bPin = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.8, 4), goldMat);
    bPin.position.set(wb, 16.5, -9.4);
    bPin.rotation.y = Math.PI / 4;
    var bPinBack = bPin.clone();
    bPinBack.position.z = -25.6;
    g.add(buttress, bPin, bPinBack);

    if (wb < 12) {
      var gWin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.2, 16.0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      gWin.position.set(wb + 2.4, 7.2, -17.5);
      g.add(gWin);
    }
  }

  // Main Elizabeth Tower (Big Ben) Neo-Gothic Shaft (y = 0 -> 36) with 4 Corner Buttress Piers & Recessed Lancets
  var basePlinth = new THREE.Mesh(new THREE.BoxGeometry(14.6, 5.5, 14.6), creamStoneMat);
  basePlinth.position.y = 2.75;
  var shaft = new THREE.Mesh(new THREE.BoxGeometry(12.6, 36.5, 12.6), gothicStoneMat);
  shaft.position.y = 18.25;
  shaft.castShadow = true;
  g.add(basePlinth, shaft);

  [[-6.3, -6.3], [6.3, -6.3], [-6.3, 6.3], [6.3, 6.3]].forEach(function(cp) {
    var pier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 46.8, 2.4), creamStoneMat);
    pier.position.set(cp[0], 23.4, cp[1]);
    var pinnacleBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 2.6), goldMat);
    pinnacleBase.position.set(cp[0], 47.4, cp[1]);
    var pinnacle = new THREE.Mesh(new THREE.ConeGeometry(1.55, 5.2, 4), goldMat);
    pinnacle.position.set(cp[0], 51.0, cp[1]);
    pinnacle.rotation.y = Math.PI / 4;
    g.add(pier, pinnacleBase, pinnacle);
  });

  for (var bandY = 7.5; bandY <= 33; bandY += 6.5) {
    var band = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.95, 13.6), goldMat);
    band.position.y = bandY;
    g.add(band);
  }

  // Grand Clock Stage Housing (y = 36 -> 47) with Protruding 3D Golden Bezels & 4 Illuminated Clock Faces
  var clockLowerCornice = new THREE.Mesh(new THREE.BoxGeometry(15.6, 1.2, 15.6), goldMat);
  clockLowerCornice.position.y = 35.4;
  var clockHousing = new THREE.Mesh(new THREE.BoxGeometry(14.8, 11.0, 14.8), creamStoneMat);
  clockHousing.position.y = 41.0;
  var goldCornice = new THREE.Mesh(new THREE.BoxGeometry(15.8, 1.4, 15.8), goldMat);
  goldCornice.position.y = 46.8;
  g.add(clockLowerCornice, clockHousing, goldCornice);

  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(ry) {
    var faceHolder = new THREE.Group();
    faceHolder.position.y = 41.0;
    faceHolder.rotation.y = ry;
    var dial = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 9.4), clockFaceMat);
    dial.position.z = 7.48;
    var bezelRing = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.34, 10, 32), goldMat);
    bezelRing.position.z = 7.56;
    faceHolder.add(dial, bezelRing);
    g.add(faceHolder);
  });

  // Colonnaded Belfry Stage, Steep Slate Roof with Golden Dormer Lucarnes & Ayrton Light Spire (y = 47 -> 74)
  var belfryCore = new THREE.Mesh(new THREE.BoxGeometry(10.6, 5.4, 10.6), slateRoofMat);
  belfryCore.position.y = 49.6;
  var belfryRoofRim = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.9, 12.2), goldMat);
  belfryRoofRim.position.y = 52.4;
  g.add(belfryCore, belfryRoofRim);

  // Belfry arched columns around perimeter
  for (var bc = -4.5; bc <= 4.5; bc += 2.25) {
    var colZ1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 5.2, 8), goldMat);
    colZ1.position.set(bc, 49.6, 5.6);
    var colZ2 = colZ1.clone(); colZ2.position.z = -5.6;
    var colX1 = colZ1.clone(); colX1.position.set(5.6, 49.6, bc);
    var colX2 = colZ1.clone(); colX2.position.set(-5.6, 49.6, bc);
    g.add(colZ1, colZ2, colX1, colX2);
  }

  var lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(9.8, 8.8, 4), slateRoofMat);
  lowerRoof.position.y = 56.8;
  lowerRoof.rotation.y = Math.PI / 4;
  var lanternStage = new THREE.Mesh(new THREE.BoxGeometry(5.8, 4.4, 5.8), goldMat);
  lanternStage.position.y = 61.5;
  var upperSpire = new THREE.Mesh(new THREE.ConeGeometry(4.9, 9.8, 4), slateRoofMat);
  upperSpire.position.y = 68.0;
  upperSpire.rotation.y = Math.PI / 4;
  var crownOrb = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  crownOrb.position.y = 73.4;
  g.add(lowerRoof, lanternStage, upperSpire, crownOrb);

  // 4 Golden Gothic Lucarne Dormers on the Spire Roof
  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach(function(ry) {
    var lucG = new THREE.Group();
    lucG.position.y = 56.2;
    lucG.rotation.y = ry;
    var lucBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.8), goldMat);
    lucBox.position.z = 4.6;
    var lucPeak = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 4), goldMat);
    lucPeak.position.set(0, 2.0, 4.6);
    lucPeak.rotation.y = Math.PI / 4;
    lucG.add(lucBox, lucPeak);
    g.add(lucG);
  });

  // Iconic London Street Props: Red Double-Decker Routemaster Bus & Classic Red K6 Telephone Box!
  var busG = new THREE.Group();
  busG.position.set(14.5, 1.2, 6.0);
  busG.rotation.y = -0.22;
  var busBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.6, 11.2), londonRedMat);
  busBody.position.y = 3.2;
  busBody.castShadow = true;
  var busRoof = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 11.2, 14, 1, false, 0, Math.PI), londonRedMat);
  busRoof.rotation.z = Math.PI * 0.5;
  busRoof.rotation.y = Math.PI * 0.5;
  busRoof.position.y = 6.0;
  var busBand = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.38, 11.3), creamStoneMat);
  busBand.position.y = 3.4;
  var winLower = new THREE.Mesh(new THREE.BoxGeometry(4.30, 1.35, 9.2), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
  winLower.position.set(0, 2.3, 0.2);
  var winUpper = new THREE.Mesh(new THREE.BoxGeometry(4.30, 1.35, 9.8), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
  winUpper.position.set(0, 4.7, 0);
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.5, 0.2), new THREE.MeshBasicMaterial({ color: 0xe0f2fe }));
  windshield.position.set(0, 4.7, 5.62);
  busG.add(busBody, busRoof, busBand, winLower, winUpper, windshield);
  [-3.4, 3.4].forEach(function(wz) {
    [-2.0, 2.0].forEach(function(wx) {
      var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.55, 14), slateRoofMat);
      wheel.rotation.z = Math.PI * 0.5;
      wheel.position.set(wx, 0.85, wz);
      busG.add(wheel);
    });
  });
  g.add(busG);

  // Classic Red London Telephone Box (K6)
  var boothG = new THREE.Group();
  boothG.position.set(9.2, 1.2, -6.5);
  var boothBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.6, 2.1), londonRedMat);
  boothBody.position.y = 2.3;
  var boothWindows = new THREE.Mesh(new THREE.BoxGeometry(2.16, 3.2, 1.65), new THREE.MeshBasicMaterial({ color: 0xe0f2fe }));
  boothWindows.position.y = 2.5;
  var boothDome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), londonRedMat);
  boothDome.position.y = 4.4;
  boothG.add(boothBody, boothWindows, boothDome);
  g.add(boothG);

  scene.add(g);

  // Waving Londoners beside the Telephone Booth & Embankment
  spawnPerson(bx + 11.5, by + 1.2, bz - 3.0, 0x1e3a8a, 0xdc2626, false, 1.45, 1.35);
  spawnPerson(bx + 10.5, by + 1.2, bz + 12.5, 0xfacc15, null, false, 1.40, 1.50);

  window.registerLandmarkShowcase('J_SW', 'J_WEST', {
    lookTarget: new THREE.Vector3(bx, by + 22.0, bz),
    camHeight: 66,
    camBack: 62,
    camSide: -46,
    lookLerp: 0.50
  });
})();

// 3. ROMAN COLOSSEUM (`J_SE -> J_SOUTH` at x = 115, z = 258)
(function buildColosseumLandmark() {
  var cx = 115, cz = 258;
  var cy = terrainY(cx, cz);
  var g = new THREE.Group();
  g.position.set(cx, cy, cz);
  g.scale.set(1.18, 1.0, 0.92); // Authentic elliptical Flavian Amphitheatre footprint

  // Procedural Roman Travertine Ashlar Stone Block Texture
  function createTravertineStoneTex() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 256, 256);
    var palette = ['#fbbf24', '#f59e0b', '#d97706', '#fde68a', '#b45309'];
    for (var r = 0; r < 8; r++) {
      var y = r * 32;
      var off = (r % 2) * 32;
      for (var col = -1; col < 5; col++) {
        var x = col * 64 + off;
        ctx.fillStyle = palette[Math.abs(r * 3 + col) % palette.length];
        ctx.fillRect(x + 2, y + 2, 60, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(x + 2, y + 2, 60, 4);
      }
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 2, 2) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  var travertineTex = createTravertineStoneTex();
  var travertineMat = new THREE.MeshStandardMaterial({ map: travertineTex, color: 0xfbbf24, roughness: 0.62, metalness: 0.08 });
  var creamArchMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.50 });
  var warmBrickMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.68 });
  var darkArchMat = new THREE.MeshStandardMaterial({ color: 0x3b1704, roughness: 0.85 });
  var sandMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.82 });
  var bronzeShieldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.68, roughness: 0.28 });

  // Grand Elliptical Travertine Cobblestone Piazza, Stepped Stylobate Podium & Arena Floor
  var piazza = new THREE.Mesh(new THREE.CylinderGeometry(33.5, 35.0, 0.65, 44), new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.65 }));
  piazza.position.y = 0.32;
  var podiumStep1 = new THREE.Mesh(new THREE.CylinderGeometry(29.2, 30.2, 1.1, 40), creamArchMat);
  podiumStep1.position.y = 0.75;
  var podiumStep2 = new THREE.Mesh(new THREE.CylinderGeometry(27.8, 28.6, 1.2, 40), travertineMat);
  podiumStep2.position.y = 1.45;
  var arenaSand = new THREE.Mesh(new THREE.CylinderGeometry(17.8, 17.8, 2.1, 36), sandMat);
  arenaSand.position.y = 1.05;
  g.add(piazza, podiumStep1, podiumStep2, arenaSand);

  // Arena Floor Hypogeum Details (Ancient Underground Substructure Channels & Imperial Pulvinar Box)
  for (var hz = -9; hz <= 9; hz += 4.5) {
    var hypoWall = new THREE.Mesh(new THREE.BoxGeometry(18.0 - Math.abs(hz) * 0.8, 0.75, 1.1), warmBrickMat);
    hypoWall.position.set(0, 2.15, hz);
    g.add(hypoWall);
  }
  var pulvinarBox = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 3.8), creamArchMat);
  pulvinarBox.position.set(0, 3.8, -17.5);
  var pulvinarCanopy = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.6, 4.2), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.45 }));
  pulvinarCanopy.position.set(0, 5.6, -17.5);
  g.add(pulvinarBox, pulvinarCanopy);

  // 3 Tiers of Authentic 3D Semi-Circular Arched Roman Arcades (28 Bays) + Classical Orders (Doric, Ionic, Corinthian)
  var numBays = 28;
  var outerR = 26.6;
  var pierGeo = new THREE.BoxGeometry(1.95, 5.4, 2.8);
  var colGeo = new THREE.CylinderGeometry(0.38, 0.44, 5.0, 10);
  var capGeo = new THREE.BoxGeometry(1.15, 0.52, 1.15);
  var archTorusGeo = new THREE.TorusGeometry(1.55, 0.44, 8, 16, Math.PI);
  var keystoneGeo = new THREE.BoxGeometry(0.68, 0.95, 2.95);
  var spandrelGeo = new THREE.BoxGeometry(3.8, 1.15, 2.65);
  var nicheGeo = new THREE.BoxGeometry(2.9, 4.4, 1.5);

  for (var tier = 0; tier < 3; tier++) {
    var tierY = 1.8 + tier * 5.8;
    var innerR = 21.8 - tier * 1.45;

    // Prominent Travertine Entablature Cornice Ring Above Each Tier
    var entablature = new THREE.Mesh(new THREE.CylinderGeometry(outerR + 1.35, outerR + 1.25, 0.95, 44), creamArchMat);
    entablature.position.y = tierY + 5.45;
    g.add(entablature);

    for (var b = 0; b < numBays; b++) {
      var ang = (b / numBays) * Math.PI * 2;
      var nextAng = ((b + 0.5) / numBays) * Math.PI * 2;

      // Travertine Arcade Pier
      var px = Math.cos(ang) * outerR;
      var pz = Math.sin(ang) * outerR;
      var pier = new THREE.Mesh(pierGeo, travertineMat);
      pier.position.set(px, tierY + 2.7, pz);
      pier.rotation.y = -ang + Math.PI * 0.5;
      pier.castShadow = true;
      g.add(pier);

      // Engaged Classical Half-Column with Base & Capital on Outer Facade
      var colX = Math.cos(ang) * (outerR + 1.12);
      var colZ = Math.sin(ang) * (outerR + 1.12);
      var col = new THREE.Mesh(colGeo, creamArchMat);
      col.position.set(colX, tierY + 2.7, colZ);
      var cap = new THREE.Mesh(capGeo, creamArchMat);
      cap.position.set(colX, tierY + 5.05, colZ);
      cap.rotation.y = -ang + Math.PI * 0.5;
      var base = cap.clone();
      base.position.y = tierY + 0.35;
      g.add(col, cap, base);

      // 3D Semi-Circular Roman Arch Ring (`TorusGeometry`), Keystone & Deep Vaulted Niche
      var ax = Math.cos(nextAng) * outerR;
      var az = Math.sin(nextAng) * outerR;
      var archGroup = new THREE.Group();
      archGroup.position.set(ax, tierY, az);
      archGroup.rotation.y = -nextAng + Math.PI * 0.5;

      var archRing = new THREE.Mesh(archTorusGeo, creamArchMat);
      archRing.position.set(0, 2.75, 0.95);
      var keystone = new THREE.Mesh(keystoneGeo, creamArchMat);
      keystone.position.set(0, 4.45, 0);
      var spandrel = new THREE.Mesh(spandrelGeo, travertineMat);
      spandrel.position.set(0, 4.78, 0);
      var archBack = new THREE.Mesh(nicheGeo, darkArchMat);
      archBack.position.set(0, 2.25, -0.35);

      archGroup.add(archRing, keystone, spandrel, archBack);
      g.add(archGroup);
    }

    // Inner Tiered Marble Cavea Seating Bowl & Radial Vomitoria Aisles
    var seatStep = new THREE.Mesh(new THREE.CylinderGeometry(innerR + 1.6, innerR - 1.2, 5.3, 36, 1, true), creamArchMat);
    seatStep.position.y = tierY + 2.65;
    var innerWall = new THREE.Mesh(new THREE.CylinderGeometry(outerR - 1.4, outerR - 1.4, 5.4, 36, 1, true), warmBrickMat);
    innerWall.position.y = tierY + 2.7;
    g.add(seatStep, innerWall);
  }

  // Iconic 4th-Tier Imperial Attic Wall (Spanning the Intact Outer Half with Corinthian Pilasters, Windows & Bronze Shields, plus Stepped Ruin Wings)
  for (var b4 = 0; b4 < 18; b4++) {
    var ang4 = (b4 / numBays) * Math.PI * 2 - Math.PI * 0.22;
    var wx = Math.cos(ang4) * 26.4;
    var wz = Math.sin(ang4) * 26.4;
    var isWingEdge = (b4 === 0 || b4 === 17);
    var atticH = isWingEdge ? 3.2 : 5.8;

    var atticG = new THREE.Group();
    atticG.position.set(wx, 19.2, wz);
    atticG.rotation.y = -ang4 + Math.PI * 0.5;

    var atticBlock = new THREE.Mesh(new THREE.BoxGeometry(5.9, atticH, 2.3), travertineMat);
    atticBlock.position.y = atticH * 0.5;
    atticBlock.castShadow = true;
    atticG.add(atticBlock);

    if (!isWingEdge) {
      var pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.75, 5.6, 2.6), creamArchMat);
      pilaster.position.set(-2.7, 2.8, 0.1);
      var crown = new THREE.Mesh(new THREE.BoxGeometry(6.1, 1.05, 2.85), creamArchMat);
      crown.position.set(0, 6.0, 0.1);
      atticG.add(pilaster, crown);

      if (b4 % 2 === 0) {
        var win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 2.45), darkArchMat);
        win.position.set(0, 2.8, 0);
        atticG.add(win);
      } else {
        var shield = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.35, 16), bronzeShieldMat);
        shield.rotation.x = Math.PI * 0.5;
        shield.position.set(0, 3.0, 1.15);
        atticG.add(shield);
      }
    }
    g.add(atticG);
  }

  scene.add(g);

  // Mediterranean Roman Stone Pines (Umbrella Pines), Triumphal Column & Waving Tourists outside the Colosseum
  [[-38, -16, 1.15], [38, -14, 1.25], [-34, 22, 1.05], [36, 20, 1.18]].forEach(function(up) {
    var px = cx + up[0], pz = cz + up[1], psc = up[2];
    var py = terrainY(px, pz);
    var pineG = new THREE.Group();
    pineG.position.set(px, py, pz);
    pineG.scale.set(psc, psc, psc);
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 8.5, 10), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 }));
    trunk.position.y = 4.25;
    trunk.castShadow = true;
    var umbrella1 = new THREE.Mesh(new THREE.SphereGeometry(4.8, 16, 12), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 }));
    umbrella1.scale.set(1.35, 0.48, 1.35);
    umbrella1.position.y = 8.8;
    umbrella1.castShadow = true;
    var umbrella2 = new THREE.Mesh(new THREE.SphereGeometry(3.6, 14, 10), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 }));
    umbrella2.scale.set(1.25, 0.45, 1.25);
    umbrella2.position.set(0.6, 10.2, 0.4);
    pineG.add(trunk, umbrella1, umbrella2);
    scene.add(pineG);
  });

  spawnPerson(cx - 24, cy, cz - 24, 0xef4444, 0xfacc15, false, 1.45, 2.8);
  spawnPerson(cx + 22, cy, cz - 25, 0x38bdf8, null, false, 1.42, -2.7);

  // Handled by the Unified 4-Landmark Centered Camera in `installModelsFrameEnhancer()`
  window.colosseumWorldCenter = new THREE.Vector3(cx, cy, cz);
})();

// 4. DOWNTOWN GLASS SKYSCRAPER (`J_NORTH -> J_CENTER` at x = -52, z = -108)
(function buildSkyscraperLandmark() {
  var sx = -52, sz = -108;
  var sy = terrainY(sx, sz);
  var g = new THREE.Group();
  g.position.set(sx, sy, sz);

  // Procedural Reflective Curtain-Wall Glass & Illuminated Office Grid Texture
  function createSkyscraperGlassTex() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 512;
    var ctx = c.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 256, 512);
    grad.addColorStop(0.0, '#0369a1');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1.0, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    for (var r = 0; r < 16; r++) {
      for (var col = 0; col < 8; col++) {
        var lit = ((r * 5 + col * 3) % 7 === 0);
        ctx.fillStyle = lit ? '#fef08a' : ((r + col) % 2 === 0 ? '#38bdf8' : '#0ea5e9');
        ctx.fillRect(col * 32 + 4, r * 32 + 4, 24, 24);
      }
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 2, 3) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  var glassTex = createSkyscraperGlassTex();
  var glassMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.14, metalness: 0.72 });
  var brightGlassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.24, metalness: 0.82 });
  var goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

  // Forecourt Granite Plaza & Tiered Turquoise Plaza Fountain
  var plaza = new THREE.Mesh(new THREE.CylinderGeometry(24, 25.5, 0.8, 36), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 }));
  plaza.position.y = 0.4;
  var podium = new THREE.Mesh(new THREE.BoxGeometry(24.5, 5.2, 24.5), steelMat);
  podium.position.y = 2.6;
  var lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(22.5, 3.8, 25.0), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
  lobbyGlass.position.y = 2.4;
  var tier1 = new THREE.Mesh(new THREE.BoxGeometry(18.8, 25, 18.8), glassMat);
  tier1.position.y = 17.5;
  tier1.castShadow = true;
  var tier2 = new THREE.Mesh(new THREE.BoxGeometry(14.8, 21, 14.8), glassMat);
  tier2.position.y = 40.0;
  tier2.castShadow = true;
  var tier3 = new THREE.Mesh(new THREE.BoxGeometry(10.6, 15.5, 10.6), glassMat);
  tier3.position.y = 58.0;
  var crownRing = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 6.6, 7.0, 20), steelMat);
  crownRing.position.y = 69.0;
  var spire = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.90, 14.5, 12), goldGlowMat);
  spire.position.y = 79.5;
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  beacon.position.y = 87.0;
  g.add(plaza, podium, lobbyGlass, tier1, tier2, tier3, crownRing, spire, beacon);

  // Corner Steel Mega-Columns & Sky-Garden Landscaped Setback Terraces
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c) {
    var col1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 50.0, 1.4), steelMat);
    col1.position.set(c[0] * 9.3, 25.0, c[1] * 9.3);
    var tree1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 10), greenMat);
    tree1.position.set(c[0] * 8.2, 31.2, c[1] * 8.2);
    var tree2 = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), greenMat);
    tree2.position.set(c[0] * 6.2, 51.4, c[1] * 6.2);
    g.add(col1, tree1, tree2);
  });

  // Horizontal Sky-Garden Ledges & Illuminated Curtain-Wall Stripes
  for (var fl = 8; fl <= 64; fl += 4.5) {
    var w = fl < 30 ? 19.4 : (fl < 50 ? 15.4 : 11.2);
    var band = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, w), (Math.round(fl) % 9 === 0) ? goldGlowMat : steelMat);
    band.position.y = fl;
    g.add(band);
  }

  scene.add(g);
  window.skyscraperLandmarkGroup = g;

  window.registerLandmarkShowcase('J_NORTH', 'J_CENTER', {
    lookTarget: new THREE.Vector3(sx, sy + 28.0, sz),
    camHeight: 24,
    camBack: 44,
    camSide: 32
  });
})();

// 5. JEWEL SINGAPORE DRIVE-THROUGH WATERFALL HYPERMARKET (`J_EAST -> J_SE`)
// Rebuilt to match `/public/assets/aistudio/image_f2b93fd1.png` (Exterior) AND `/public/assets/aistudio/image_e865e179.png` (Interior Pass-Through View):
// - Monumental toroidal glass-and-steel diagrid dome with crystal sky reflections & circular roof Oculus collar
// - Exterior & Interior lush vertical green living plant walls with glowing 3D multi-faceted Lotus Emblem & bold white "JEWEL" sign
// - Elevated white concrete Skytrain viaduct with glass balustrades curving along the right side of the interior frame (`image_e865e179.png`)
// - Central cascading crystal-white & turquoise HSBC Rain Vortex waterfall pouring from the Oculus into a glowing turquoise circular plunge pool
// - 6 stepped curved Shiseido Forest Valley & warm-lit shopping gallery terraces with palm trees, tropical flowers, hedges & visitors
(function buildJewelSingaporeWaterfallHypermarket() {
  var jewelEdge = edges.find(function(e) { return e.id === 'J_EAST->J_SE'; });
  if (!jewelEdge) return;

  var midPt = jewelEdge.curve.getPointAt(0.50);
  var tan = jewelEdge.curve.getTangentAt(0.50).normalize();
  var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  var ang = Math.atan2(tan.x, tan.z);

  // Anchor `domeG` directly at `midPt` with `rotation.y = ang`:
  // - Local `+Z` = forward along `J_EAST -> J_SE` (`tan`)
  // - Local `-X` = `+perp` (West = RIGHT side of the screen when looking forward along `+Z`)
  //   -> Main track is at `local x = 0.0`, parallel second track is at `local x = -4.4` (Skytrain center = `local x = -2.2`)!
  // - Local `+X` = `-perp` (East = LEFT side of the screen when looking forward along `+Z`)
  //   -> HSBC Rain Vortex waterfall & turquoise plunge pool are centered at `vortexX = +18.5` (to the LEFT of the train, matching `image_e865e179.png`!)
  var domeCenter = midPt.clone();
  var domeG = new THREE.Group();
  domeG.position.set(domeCenter.x, midPt.y - 0.3, domeCenter.z);
  domeG.rotation.y = ang;

  var vortexX = 18.5; // 20.7m to the left (`+X`) of the Skytrain viaduct (`local x = -2.2`), matching `image_e865e179.png`!

  // ----------------------------------------------------------------------------
  // Procedural Textures for Diagrid Glass Dome, Warm Golden Boutiques, Fine Water & JEWEL Living Plant Wall
  // ----------------------------------------------------------------------------
  function createJewelDiagridDomeTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    var skyG = ctx.createLinearGradient(0, 0, 0, 512);
    skyG.addColorStop(0.0, 'rgba(186, 230, 253, 0.42)');
    skyG.addColorStop(0.5, 'rgba(125, 211, 252, 0.32)');
    skyG.addColorStop(1.0, 'rgba(224, 242, 254, 0.38)');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, 512, 512);

    // Crisp silver-white diamond/triangular steel diagrid lattice (`image_f2b93fd1.png` & `image_e865e179.png`)
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.95)';
    ctx.lineWidth = 6;
    var step = 64;
    for (var y = 0; y <= 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(512, y);
      ctx.stroke();
    }
    for (var x = -512; x <= 1024; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 512, 512);
      ctx.moveTo(x + 512, 0); ctx.lineTo(x, 512);
      ctx.stroke();
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 6, 4) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createJewelBoutiqueMallTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 256);

    var shopColors = ['#fef08a', '#fde68a', '#ffedd5', '#fef9c3', '#bae6fd', '#fde047'];
    for (var s = 0; s < 8; s++) {
      var sx = s * 64;
      var sg = ctx.createLinearGradient(sx, 16, sx, 240);
      sg.addColorStop(0.0, '#ffffff');
      sg.addColorStop(0.45, shopColors[s % shopColors.length]);
      sg.addColorStop(1.0, '#f59e0b');
      ctx.fillStyle = sg;
      ctx.fillRect(sx + 5, 18, 54, 220);

      // Warm boutique display shelves & signage (`image_e865e179.png`)
      ctx.fillStyle = 'rgba(146, 64, 14, 0.32)';
      ctx.fillRect(sx + 10, 92, 44, 8);
      ctx.fillRect(sx + 10, 152, 44, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 12, 30, 40, 14);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(sx, 0, 5, 256);
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 5, 1) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createFineRainVortexTex(seedOffset) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    // Shimmering crystal-white & aqua water curtain sheen (`image_e865e179.png`)
    for (var x = 0; x < 512; x += 4) {
      var alpha = 0.22 + 0.12 * Math.sin((x + seedOffset) * 0.11) + 0.08 * Math.cos((x - seedOffset) * 0.27);
      ctx.fillStyle = 'rgba(240, 253, 255, ' + alpha.toFixed(3) + ')';
      ctx.fillRect(x, 0, 4, 512);
    }

    // 280 delicate vertical falling water strands & foamy white streaks
    for (var s = 0; s < 280; s++) {
      var sx = ((s * 61 + seedOffset * 17) % 508);
      var sy = ((s * 89 + seedOffset * 29) % 450);
      var sw = 1.6 + (s % 3) * 1.2;
      var sh = 36 + (s % 6) * 22;
      var g = ctx.createLinearGradient(sx, sy, sx, sy + sh);
      g.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
      g.addColorStop(0.3, 'rgba(224, 242, 254, 0.68)');
      g.addColorStop(0.75, 'rgba(255, 255, 255, 0.95)');
      g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx, sy, sw, sh);
    }

    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 3, 2) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // High-Resolution Lush Living Green Wall Texture with Faceted Lotus & Bold "JEWEL" Typography (`image_f2b93fd1.png` & `image_e865e179.png`)
  function createJewelLivingWallTex() {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var ctx = c.getContext('2d');

    // Deep lush vertical foliage backdrop
    var bg = ctx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0.0, '#14532d');
    bg.addColorStop(0.5, '#166534');
    bg.addColorStop(1.0, '#15803d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    // Hundreds of organic leaf clusters across the living wall
    var leafCols = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#14532d', '#86efac'];
    for (var li = 0; li < 420; li++) {
      ctx.fillStyle = leafCols[li % leafCols.length];
      var lx = (li * 73) % 1024;
      var ly = (li * 53) % 512;
      var lr = 10 + (li % 5) * 4;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Faceted Geometric Lotus / Jewel Emblem in upper center
    var cx = 512, cy = 195;
    var petals = [
      { ang: 0, len: 118, w: 46, col1: '#ffffff', col2: '#bae6fd' },
      { ang: -0.46, len: 106, w: 42, col1: '#e0f2fe', col2: '#7dd3fc' },
      { ang:  0.46, len: 106, w: 42, col1: '#fef9c3', col2: '#fde047' },
      { ang: -0.88, len: 92,  w: 38, col1: '#bae6fd', col2: '#38bdf8' },
      { ang:  0.88, len: 92,  w: 38, col1: '#fef08a', col2: '#facc15' },
      { ang: -1.25, len: 76,  w: 32, col1: '#7dd3fc', col2: '#0284c7' },
      { ang:  1.25, len: 76,  w: 32, col1: '#fde68a', col2: '#f59e0b' }
    ];
    petals.forEach(function(p) {
      ctx.save();
      ctx.translate(cx, cy + 28);
      ctx.rotate(p.ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-p.w, -p.len * 0.55);
      ctx.lineTo(0, -p.len);
      ctx.closePath();
      ctx.fillStyle = p.col1;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.w, -p.len * 0.55);
      ctx.lineTo(0, -p.len);
      ctx.closePath();
      ctx.fillStyle = p.col2;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });

    // Bold White 3D-Shaded "JEWEL" Wordmark below the Lotus Emblem
    ctx.save();
    ctx.shadowColor = 'rgba(6, 78, 59, 0.92)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 132px "Fredoka", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JEWEL', 512, 378);
    ctx.restore();

    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  var diagridDomeTex = createJewelDiagridDomeTex();
  var boutiqueMallTex = createJewelBoutiqueMallTex();
  var vortexTexOuter = createFineRainVortexTex(0);
  var vortexTexInner = createFineRainVortexTex(173);
  var jewelLivingWallTex = createJewelLivingWallTex();
  if (window.waterfallTextures) {
    window.waterfallTextures.push(vortexTexOuter, vortexTexInner);
  }

  var steelRibMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.45, roughness: 0.22 });
  var whiteArchMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.12 });
  var glassDomeMat = new THREE.MeshStandardMaterial({
    map: diagridDomeTex,
    color: 0xbae6fd,
    roughness: 0.10,
    metalness: 0.22,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var terraceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  var creamTerraceMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.38 });
  var darkGraniteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.2 });
  var turquoiseRimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.22, metalness: 0.25 });
  var shopFacadeMat = new THREE.MeshBasicMaterial({ map: boutiqueMallTex, side: THREE.DoubleSide });
  var glassRailMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.48,
    roughness: 0.08,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  var foliageDarkMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.60 });
  var foliageMidMat  = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.56 });
  var foliageLushMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.52 });
  var foliageLimeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.48 });
  var trunkBarkMat   = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });

  // Helper: Build 3D Vertical Living Green Wall with 3D Faceted Lotus Sculpture & 3D "JEWEL" Sign (`image_f2b93fd1.png` & `image_e865e179.png`)
  function createJewelLivingWallMonument(width, height) {
    var lwG = new THREE.Group();

    // Curved/box lush green living wall backing
    var backBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1.4), foliageMidMat);
    lwG.add(backBox);

    // 3D foliage puffs around the perimeter of the living wall
    for (var fi = 0; fi < 28; fi++) {
      var fx = (fi % 7 - 3) * (width * 0.14);
      var fy = (Math.floor(fi / 7) - 1.5) * (height * 0.24);
      if (Math.abs(fx) < width * 0.34 && Math.abs(fy) < height * 0.34) continue;
      var puff = new THREE.Mesh(
        new THREE.SphereGeometry(1.15 + (fi % 3) * 0.35, 10, 8),
        fi % 2 === 0 ? foliageLushMat : foliageLimeMat
      );
      puff.scale.set(1.2, 0.85, 0.55);
      puff.position.set(fx, fy, 0.65);
      lwG.add(puff);
    }

    // High-res Living Wall + Lotus + "JEWEL" Sign Face
    var facePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.94, height * 0.92),
      new THREE.MeshBasicMaterial({ map: jewelLivingWallTex })
    );
    facePlane.position.z = 0.76;
    lwG.add(facePlane);

    // 3D Sculpted Multi-Faceted Glowing Lotus / Diamond Jewel Crowns projecting out of the living wall!
    var lotus3D = new THREE.Group();
    lotus3D.position.set(0, height * 0.14, 1.05);
    var facetWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var facetCyanMat  = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
    var facetGoldMat  = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.85, -0.42, 0, 0.42, 0.85].forEach(function(angZ, idx) {
      var pH = (idx === 2) ? (height * 0.26) : (idx === 1 || idx === 3 ? height * 0.22 : height * 0.18);
      var pR = width * 0.045;
      var cone = new THREE.Mesh(
        new THREE.ConeGeometry(pR, pH, 4),
        idx === 2 ? facetWhiteMat : (idx < 2 ? facetCyanMat : facetGoldMat)
      );
      cone.rotation.z = angZ;
      cone.position.set(-Math.sin(angZ) * (pH * 0.42), Math.cos(angZ) * (pH * 0.42) - height * 0.06, 0.15);
      lotus3D.add(cone);
    });
    lwG.add(lotus3D);

    // White architectural frame trim
    var topTrim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.55, 1.65), whiteArchMat);
    topTrim.position.y = height * 0.5;
    var botTrim = topTrim.clone();
    botTrim.position.y = -height * 0.5;
    lwG.add(topTrim, botTrim);

    return lwG;
  }

  // ============================================================================
  // 0. CHANGI TERMINAL 3 ➔ JEWEL ELEVATED SKYTRAIN BRIDGE & SLEEK WHITE PORTAL DOORS
  // ============================================================================
  var airportEdge = edges.find(function(e) { return e.id === 'J_NE->J_EAST'; });
  var viaductWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.24, metalness: 0.15 });
  var viaductPillarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.32, metalness: 0.20 });
  var viaductCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var portalDoorGlassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.08,
    metalness: 0.25,
    transparent: true,
    opacity: 0.52,
    side: THREE.DoubleSide
  });

  // Sunken Reflecting Pool & Lower Rainforest Canyon directly under the Skytrain Viaduct (`local x = -2.2`)
  var sunkenCanyonRim = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.6, 86.0), darkGraniteMat);
  sunkenCanyonRim.position.set(-2.2, -1.8, 0);
  var sunkenReflectingWater = new THREE.Mesh(
    new THREE.BoxGeometry(13.2, 0.35, 82.0),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.10, metalness: 0.25 })
  );
  sunkenReflectingWater.position.set(-2.2, -1.55, 0);
  domeG.add(sunkenCanyonRim, sunkenReflectingWater);

  function buildSkytrainViaductAlongEdge(edgeObj, tStart, tEnd, segCount, isInsideJewel) {
    if (!edgeObj || !edgeObj.curve) return;
    var viaductGroup = new THREE.Group();
    for (var s = 0; s < segCount; s++) {
      var u0 = tStart + (s / segCount) * (tEnd - tStart);
      var u1 = tStart + ((s + 1) / segCount) * (tEnd - tStart);
      var uMid = (u0 + u1) * 0.5;
      var p0 = edgeObj.curve.getPointAt(u0);
      var p1 = edgeObj.curve.getPointAt(u1);
      var pMid = edgeObj.curve.getPointAt(uMid);
      var segTan = p1.clone().sub(p0);
      var segLen = segTan.length() + 0.45;
      segTan.normalize();
      var segPerp = new THREE.Vector3(-segTan.z, 0, segTan.x).normalize();
      var segYaw = Math.atan2(segTan.x, segTan.z);

      var deckCenter = pMid.clone().add(segPerp.clone().multiplyScalar(2.2));
      var segG = new THREE.Group();
      segG.position.set(deckCenter.x, pMid.y, deckCenter.z);
      segG.rotation.y = segYaw;

      var deckSlab = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.72, segLen), viaductWhiteMat);
      deckSlab.position.y = -0.58;
      var underSpine = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.15, segLen * 0.96), viaductPillarMat);
      underSpine.position.y = -1.35;
      segG.add(deckSlab, underSpine);

      // Left & Right White Skytrain Bridge Parapet Curbs & Tempered Glass Balustrades (`image_e865e179.png`)
      [-5.55, 5.55].forEach(function(pxSide) {
        var curb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.75, segLen), viaductWhiteMat);
        curb.position.set(pxSide, -0.05, 0);
        var ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, segLen), viaductCyanMat);
        ledStrip.position.set(pxSide, 0.36, 0);
        var glassWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.96, segLen * 0.98), glassRailMat);
        glassWall.position.set(pxSide, 0.84, 0);
        var topRail = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, segLen), whiteArchMat);
        topRail.position.set(pxSide, 1.36, 0);
        segG.add(curb, ledStrip, glassWall, topRail);
      });

      if (s % 2 === 0) {
        var groundY = isInsideJewel ? (midPt.y - 2.2) : Math.min(pMid.y - 2.6, terrainY(deckCenter.x, deckCenter.z) - 0.3);
        var pierH = Math.max(2.2, (pMid.y - 1.2) - groundY);
        var capBeam = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.85, 2.2), viaductWhiteMat);
        capBeam.position.set(0, -1.85, 0);
        var pierCol = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, pierH, 16), viaductWhiteMat);
        pierCol.position.set(0, -1.85 - pierH * 0.5, 0);
        segG.add(capBeam, pierCol);
      }

      if (!isInsideJewel && s % 3 === 1) {
        var archL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.6, 0.65), viaductWhiteMat);
        archL.position.set(-5.55, 3.8, 0);
        var archR = archL.clone();
        archR.position.x = 5.55;
        var archTop = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.65, 0.85), viaductWhiteMat);
        archTop.position.set(0, 7.7, 0);
        var archLed = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.18, 0.92), viaductCyanMat);
        archLed.position.set(0, 7.35, 0);
        segG.add(archL, archR, archTop, archLed);
      }

      viaductGroup.add(segG);
    }
    scene.add(viaductGroup);
  }

  if (airportEdge) {
    buildSkytrainViaductAlongEdge(airportEdge, 0.56, 0.98, 12, false);
    var t3Pt = airportEdge.curve.getPointAt(0.60);
    var t3Tan = airportEdge.curve.getTangentAt(0.60).normalize();
    var t3Perp = new THREE.Vector3(-t3Tan.z, 0, t3Tan.x).normalize();
    var t3Mid = t3Pt.clone().add(t3Perp.clone().multiplyScalar(2.2));
    var t3Gantry = new THREE.Group();
    t3Gantry.position.copy(t3Mid);
    t3Gantry.rotation.y = Math.atan2(t3Tan.x, t3Tan.z);
    var t3Sign = makeSign("✈️ CHANGI T3 SKYTRAIN ➔ JEWEL", "#0284c7", "#ffffff", 14.5, 2.8);
    t3Sign.position.set(0, 9.2, 0);
    t3Gantry.add(t3Sign);
    scene.add(t3Gantry);
  }

  buildSkytrainViaductAlongEdge(jewelEdge, 0.02, 0.22, 6, false);
  buildSkytrainViaductAlongEdge(jewelEdge, 0.22, 0.78, 16, true);
  buildSkytrainViaductAlongEdge(jewelEdge, 0.78, 0.92, 4, false);

  // Automatic Sliding Glass Portal Doors styled in sleek White & Sky-Blue Architecture (`image_f2b93fd1.png`)
  var jewelAutoPortals = [];
  function buildJewelSlidingPortal(edgeT, portalLabel) {
    var pPt = jewelEdge.curve.getPointAt(edgeT);
    var pTan = jewelEdge.curve.getTangentAt(edgeT).normalize();
    var pPerp = new THREE.Vector3(-pTan.z, 0, pTan.x).normalize();
    var pCenter = pPt.clone().add(pPerp.clone().multiplyScalar(2.2));

    var portalG = new THREE.Group();
    portalG.position.copy(pCenter);
    portalG.rotation.y = Math.atan2(pTan.x, pTan.z);

    var postL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9.2, 1.8), whiteArchMat);
    postL.position.set(-6.2, 4.6, 0);
    var postR = postL.clone();
    postR.position.x = 6.2;

    var pocketL = new THREE.Mesh(new THREE.BoxGeometry(5.4, 7.4, 1.2), glassRailMat);
    pocketL.position.set(-8.6, 3.7, 0);
    var pocketR = pocketL.clone();
    pocketR.position.x = 8.6;

    var headerBeam = new THREE.Mesh(new THREE.BoxGeometry(22.0, 1.6, 2.2), whiteArchMat);
    headerBeam.position.set(0, 9.0, 0);
    var headerArch = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.65, 12, 28, Math.PI), whiteArchMat);
    headerArch.position.set(0, 9.2, 0);

    var pSign = makeSign(portalLabel, "#0284c7", "#ffffff", 12.5, 2.2);
    pSign.position.set(0, 11.2, 1.15);
    var pSignBack = makeSign(portalLabel, "#0284c7", "#ffffff", 12.5, 2.2);
    pSignBack.rotation.y = Math.PI;
    pSignBack.position.set(0, 11.2, -1.15);

    var statusMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    var beaconL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), statusMat);
    beaconL.position.set(-5.2, 9.0, 1.2);
    var beaconR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), statusMat);
    beaconR.position.set(5.2, 9.0, 1.2);

    function createSlidingDoorLeaf(sideSign) {
      var leafG = new THREE.Group();
      var glassPane = new THREE.Mesh(new THREE.BoxGeometry(5.3, 7.1, 0.24), portalDoorGlassMat);
      glassPane.position.y = 3.65;
      var topFrame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.38, 0.38), whiteArchMat);
      topFrame.position.y = 7.25;
      var botFrame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.38, 0.38), whiteArchMat);
      botFrame.position.y = 0.25;
      var midBar = new THREE.Mesh(new THREE.BoxGeometry(5.35, 0.22, 0.32), whiteArchMat);
      midBar.position.y = 3.4;
      var edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 7.1, 0.34), statusMat);
      edgeGlow.position.set(-sideSign * 2.62, 3.65, 0);
      leafG.add(glassPane, topFrame, botFrame, midBar, edgeGlow);
      return leafG;
    }

    var leftDoor = createSlidingDoorLeaf(-1);
    var rightDoor = createSlidingDoorLeaf(1);
    leftDoor.position.x = -2.7;
    rightDoor.position.x = 2.7;

    portalG.add(postL, postR, pocketL, pocketR, headerBeam, headerArch, pSign, pSignBack, beaconL, beaconR, leftDoor, rightDoor);
    scene.add(portalG);

    jewelAutoPortals.push({
      worldPos: pCenter,
      leftDoor: leftDoor,
      rightDoor: rightDoor,
      statusMat: statusMat,
      openAmount: 0.0
    });
  }

  var northPortalInfo = buildJewelSlidingPortal(0.20, "💎 JEWEL CHANGI AIRPORT");
  var southPortalInfo = buildJewelSlidingPortal(0.80, "✈️ TERMINAL 3 SKYTRAIN");

  // ============================================================================
  // 1. MONUMENTAL TOROIDAL DIAGRID GLASS & STEEL DOME (`image_f2b93fd1.png` & `image_e865e179.png`)
  //    Full-height toroidal dome curving from the central Oculus (`y = 36.2m`) up to the crown (`y = 41.2m`)
  //    and all the way down to the ground podium (`y = 1.2m`), arching cleanly over the Skytrain portals!
  // ============================================================================
  function getJewelDomePoint(rAng, u) {
    var cosA = Math.cos(rAng);
    var sinA = Math.sin(rAng);
    var rad = 7.4 + u * 35.6; // r = 7.4m (Oculus) to 43.0m (outer perimeter)
    var rx = vortexX + cosA * rad;
    var rz = sinA * rad * 1.22;

    // True toroidal profile curving all the way down to y = 1.2m at u = 1.0
    var archH = 36.2 + Math.sin(u * Math.PI * 0.78) * 7.6 - Math.pow(u, 2.05) * 35.0;

    // Arch cleanly above the Skytrain entrance/exit corridor (`rx` near `-2.2m`) so the train enters through the portal doors!
    var distFromTrackX = Math.abs(rx - (-2.2));
    if (distFromTrackX < 9.5 && u > 0.52) {
      var portalClearance = 9.4 + (1.0 - (distFromTrackX / 9.5)) * 2.2;
      var blendPortal = Math.min(1.0, (u - 0.52) / 0.30);
      archH = Math.max(archH, portalClearance * blendPortal);
    }
    return new THREE.Vector3(rx, Math.max(1.2, archH), rz);
  }

  var numRadialRibs = 32;
  for (var ri = 0; ri < numRadialRibs; ri++) {
    var rAng = (ri / numRadialRibs) * Math.PI * 2;
    var ribPts = [];
    var rSteps = 18;
    for (var rs = 0; rs <= rSteps; rs++) {
      ribPts.push(getJewelDomePoint(rAng, rs / rSteps));
    }
    var ribCurve = new THREE.CatmullRomCurve3(ribPts);
    var ribMesh = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 22, 0.34, 6, false), steelRibMat);
    domeG.add(ribMesh);
  }

  // Concentric Toroidal White Steel Ring Purlins from Oculus all the way down the facade (`ci = 0 .. 10`)
  for (var ci = 0; ci <= 10; ci++) {
    var uRing = ci / 10;
    var ringPts = [];
    for (var s = 0; s <= 48; s++) {
      var a = (s / 48) * Math.PI * 2;
      ringPts.push(getJewelDomePoint(a, uRing));
    }
    var ringCurve = new THREE.CatmullRomCurve3(ringPts, true);
    var ringTube = new THREE.Mesh(
      new THREE.TubeGeometry(ringCurve, 52, (ci === 0 || ci === 10) ? 0.68 : 0.30, 8, true),
      whiteArchMat
    );
    domeG.add(ringTube);
  }

  // Full-Height Parametric Toroidal Diagrid Glass Shell (curves all the way to the ground podium + arches over portals!)
  var uSegs = 20;
  var aSegs = 56;
  var domePosArr = [];
  var domeUvArr = [];
  var domeIdxArr = [];
  for (var iu = 0; iu <= uSegs; iu++) {
    var uVal = iu / uSegs;
    for (var ia = 0; ia <= aSegs; ia++) {
      var aVal = (ia / aSegs) * Math.PI * 2;
      var dp = getJewelDomePoint(aVal, uVal);
      domePosArr.push(dp.x, dp.y, dp.z);
      domeUvArr.push((ia / aSegs) * 8.0, uVal * 4.0);
    }
  }
  for (var iu2 = 0; iu2 < uSegs; iu2++) {
    for (var ia2 = 0; ia2 < aSegs; ia2++) {
      var row1 = iu2 * (aSegs + 1);
      var row2 = (iu2 + 1) * (aSegs + 1);
      domeIdxArr.push(row1 + ia2, row2 + ia2, row1 + ia2 + 1);
      domeIdxArr.push(row1 + ia2 + 1, row2 + ia2, row2 + ia2 + 1);
    }
  }
  var customDomeGeo = new THREE.BufferGeometry();
  customDomeGeo.setAttribute('position', new THREE.Float32BufferAttribute(domePosArr, 3));
  customDomeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(domeUvArr, 2));
  customDomeGeo.setIndex(domeIdxArr);
  customDomeGeo.computeVertexNormals();

  glassDomeMat.opacity = 0.62;
  var toroidalGlassDome = new THREE.Mesh(customDomeGeo, glassDomeMat);
  toroidalGlassDome.renderOrder = 3;
  domeG.add(toroidalGlassDome);
  window.jewelGlassDomeMat = glassDomeMat;

  // Helper: creates a true hollow 3D curved arc band (only between rInner and rOuter, with ZERO solid disk across the interior r < rInner!)
  function createHollowArcBandGeo(rInner, rOuter, height, segs, thetaStart, thetaLen) {
    var halfH = height * 0.5;
    var pos = [];
    var norm = [];
    var uvs = [];
    var indices = [];

    function addQuad(p0, p1, p2, p3, nx, ny, nz) {
      var base = pos.length / 3;
      pos.push(
        p0[0], p0[1], p0[2],
        p1[0], p1[1], p1[2],
        p2[0], p2[1], p2[2],
        p3[0], p3[1], p3[2]
      );
      for (var k = 0; k < 4; k++) norm.push(nx, ny, nz);
      uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    for (var s = 0; s < segs; s++) {
      var a0 = thetaStart + (s / segs) * thetaLen;
      var a1 = thetaStart + ((s + 1) / segs) * thetaLen;
      var sin0 = Math.sin(a0), cos0 = Math.cos(a0);
      var sin1 = Math.sin(a1), cos1 = Math.cos(a1);
      var sinM = Math.sin((a0 + a1) * 0.5), cosM = Math.cos((a0 + a1) * 0.5);

      var i0B = [sin0 * rInner, -halfH, cos0 * rInner];
      var i1B = [sin1 * rInner, -halfH, cos1 * rInner];
      var i1T = [sin1 * rInner,  halfH, cos1 * rInner];
      var i0T = [sin0 * rInner,  halfH, cos0 * rInner];

      var o0B = [sin0 * rOuter, -halfH, cos0 * rOuter];
      var o1B = [sin1 * rOuter, -halfH, cos1 * rOuter];
      var o1T = [sin1 * rOuter,  halfH, cos1 * rOuter];
      var o0T = [sin0 * rOuter,  halfH, cos0 * rOuter];

      // Inner vertical wall (facing center)
      addQuad(i1B, i0B, i0T, i1T, -sinM, 0, -cosM);
      // Outer vertical wall (facing outward)
      addQuad(o0B, o1B, o1T, o0T, sinM, 0, cosM);
      // Top horizontal ring walkway
      addQuad(i0T, o0T, o1T, i1T, 0, 1, 0);
      // Bottom horizontal ring soffit
      addQuad(o0B, i0B, i1B, o1B, 0, -1, 0);

      if (s === 0) {
        addQuad(o0B, o0T, i0T, i0B, -cos0, 0, sin0);
      }
      if (s === segs - 1) {
        addQuad(i1B, i1T, o1T, o1B, cos1, 0, -sin1);
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }

  // Curved Exterior Architectural Limestone Base Podium ONLY along the outer eastern forest perimeter (strictly hollow so it never covers the atrium or tracks!)
  var podiumWallGeo = createHollowArcBandGeo(42.2, 44.2, 3.6, 44, -Math.PI * 0.04, Math.PI * 1.08);
  var podiumWall = new THREE.Mesh(podiumWallGeo, creamTerraceMat);
  podiumWall.scale.set(1.0, 1.0, 1.22);
  podiumWall.position.set(vortexX, 1.6, 0);
  domeG.add(podiumWall);

  // Exterior Lush Vertical Green Living Plant Walls with 3D Glowing Lotus & Bold White "JEWEL" Sign
  // Positioned right beside the North & South Skytrain Entrance Portals facing the approaching train & camera (`image_f2b93fd1.png`)!
  var exteriorLivingWall = createJewelLivingWallMonument(24.0, 12.5);
  exteriorLivingWall.position.set(11.5, 11.8, -46.5);
  exteriorLivingWall.rotation.y = Math.PI * 0.94;
  domeG.add(exteriorLivingWall);

  var exteriorLivingWallSouth = createJewelLivingWallMonument(24.0, 12.5);
  exteriorLivingWallSouth.position.set(11.5, 11.8, 46.5);
  exteriorLivingWallSouth.rotation.y = Math.PI * 0.06;
  domeG.add(exteriorLivingWallSouth);

  // ============================================================================
  // 2. CENTRAL ILLUMINATED OCULUS & CRYSTAL-AQUA HSBC RAIN VORTEX WATERFALL (`image_e865e179.png`)
  // ============================================================================
  var oculusCollarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  var oculusInnerGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, depthWrite: false });

  var oculusOuterBezel = new THREE.Mesh(new THREE.TorusGeometry(7.55, 0.92, 16, 48), whiteArchMat);
  oculusOuterBezel.rotation.x = Math.PI / 2;
  oculusOuterBezel.position.set(vortexX, 36.2, 0);

  var oculusWhiteLip = new THREE.Mesh(new THREE.TorusGeometry(6.85, 0.65, 14, 44), oculusInnerGlowMat);
  oculusWhiteLip.rotation.x = Math.PI / 2;
  oculusWhiteLip.position.set(vortexX, 35.6, 0);
  domeG.add(oculusOuterBezel, oculusWhiteLip);

  var outerWaterMat = new THREE.MeshStandardMaterial({
    map: vortexTexOuter,
    color: 0xe0f2fe,
    emissive: 0x0284c7,
    emissiveIntensity: 0.28,
    roughness: 0.06,
    metalness: 0.08,
    transparent: true,
    opacity: 0.64,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var innerWaterMat = new THREE.MeshStandardMaterial({
    map: vortexTexInner,
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35,
    roughness: 0.05,
    metalness: 0.06,
    transparent: true,
    opacity: 0.50,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  var outerProfilePts = [];
  var innerProfilePts = [];
  for (var pyStep = 0; pyStep <= 28; pyStep++) {
    var uY = pyStep / 28;
    var curY = 1.0 + uY * 34.8;
    var topFlare = Math.pow(uY, 2.4) * 3.85;
    var botFlare = Math.pow(1.0 - uY, 2.0) * 1.45;
    var rOuter = 3.15 + topFlare + botFlare;
    var rInner = rOuter * 0.84;
    outerProfilePts.push(new THREE.Vector2(rOuter, curY));
    innerProfilePts.push(new THREE.Vector2(rInner, curY));
  }

  var outerVortexMesh = new THREE.Mesh(new THREE.LatheGeometry(outerProfilePts, 48), outerWaterMat);
  outerVortexMesh.position.set(vortexX, 0, 0);
  outerVortexMesh.renderOrder = 2;
  var innerVortexMesh = new THREE.Mesh(new THREE.LatheGeometry(innerProfilePts, 36), innerWaterMat);
  innerVortexMesh.position.set(vortexX, 0, 0);
  innerVortexMesh.renderOrder = 1;
  domeG.add(innerVortexMesh, outerVortexMesh);

  var lightBeamGeo = new THREE.CylinderGeometry(0.18, 0.32, 33.5, 8, 1, true);
  var lightBeamMats = [];
  for (var lbi = 0; lbi < 12; lbi++) {
    var lbAng = (lbi / 12) * Math.PI * 2;
    var lbMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    lightBeamMats.push(lbMat);
    var lbMesh = new THREE.Mesh(lightBeamGeo, lbMat);
    lbMesh.position.set(vortexX + Math.cos(lbAng) * 3.45, 18.0, Math.sin(lbAng) * 3.45);
    domeG.add(lbMesh);
  }

  // ============================================================================
  // 3. CIRCULAR VIEWING PROMENADE & GLOWING TURQUOISE PLUNGE POOL (`image_e865e179.png`)
  // ============================================================================
  var groundPlaza = new THREE.Mesh(new THREE.CylinderGeometry(14.2, 14.8, 0.55, 48), creamTerraceMat);
  groundPlaza.position.set(vortexX, 0.28, 0);
  var poolOuterCurb = new THREE.Mesh(new THREE.CylinderGeometry(11.4, 11.8, 1.35, 48), whiteArchMat);
  poolOuterCurb.position.set(vortexX, 0.68, 0);
  var poolInnerWall = new THREE.Mesh(new THREE.CylinderGeometry(10.6, 10.6, 1.42, 48), turquoiseRimMat);
  poolInnerWall.position.set(vortexX, 0.70, 0);
  var glassViewingBarrier = new THREE.Mesh(new THREE.CylinderGeometry(11.9, 11.9, 2.2, 48, 1, true), glassRailMat);
  glassViewingBarrier.position.set(vortexX, 1.45, 0);
  var barrierHandrail = new THREE.Mesh(new THREE.TorusGeometry(11.9, 0.09, 8, 48), whiteArchMat);
  barrierHandrail.rotation.x = Math.PI / 2;
  barrierHandrail.position.set(vortexX, 2.55, 0);
  domeG.add(groundPlaza, poolOuterCurb, poolInnerWall, glassViewingBarrier, barrierHandrail);

  var poolGlowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  var poolMistMat = new THREE.MeshBasicMaterial({
    color: 0xa5f3fc,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });
  var poolWater = new THREE.Mesh(new THREE.CylinderGeometry(10.4, 8.2, 1.48, 48), poolGlowMat);
  poolWater.position.set(vortexX, 0.92, 0);
  var poolSoftMistDisc = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 9.6, 0.45, 40), poolMistMat);
  poolSoftMistDisc.position.set(vortexX, 1.56, 0);
  var poolInnerCoreGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4, 5.4, 0.65, 36),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, depthWrite: false })
  );
  poolInnerCoreGlow.position.set(vortexX, 1.68, 0);
  domeG.add(poolWater, poolSoftMistDisc, poolInnerCoreGlow);

  var poolRipples = [];
  for (var rpi = 0; rpi < 8; rpi++) {
    var ripMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.68,
      depthWrite: false
    });
    var ripMesh = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.10, 8, 40), ripMat);
    ripMesh.rotation.x = Math.PI / 2;
    ripMesh.position.set(vortexX, 1.76, 0);
    domeG.add(ripMesh);
    poolRipples.push({ mesh: ripMesh, mat: ripMat, phase: rpi / 8 });
  }

  var streamGeo = new THREE.SphereGeometry(0.24, 8, 8);
  var streamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.82,
    depthWrite: false
  });
  var physicsStreams = [];
  for (var psi = 0; psi < 110; psi++) {
    var sMesh = new THREE.Mesh(streamGeo, streamMat);
    domeG.add(sMesh);
    physicsStreams.push({
      mesh: sMesh,
      angle: (psi * 2.39996) % (Math.PI * 2),
      phase: psi / 110,
      gravityRate: 0.34 + (psi % 6) * 0.024,
      radialLayer: (psi % 3 === 0) ? 0.86 : 1.01
    });
  }

  var splashGeo = new THREE.SphereGeometry(0.26, 8, 8);
  var splashMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  });
  var splashParticles = [];
  for (var spi = 0; spi < 36; spi++) {
    var spMesh = new THREE.Mesh(splashGeo, splashMat);
    domeG.add(spMesh);
    splashParticles.push({
      mesh: spMesh,
      angle: (spi / 36) * Math.PI * 2,
      phase: spi / 36,
      speed: 0.72 + (spi % 4) * 0.14,
      maxHeight: 2.6 + (spi % 5) * 0.65,
      radialSpeed: 2.5 + (spi % 3) * 0.80
    });
  }

  var dropGeo = new THREE.SphereGeometry(0.28, 8, 8);
  for (var di = 0; di < 36; di++) {
    var dMesh = new THREE.Mesh(dropGeo, streamMat);
    dMesh.scale.set(0.55, 2.4, 0.55);
    domeG.add(dMesh);
    window.jewelWaterfallDrops.push({
      mesh: dMesh,
      centerX: vortexX,
      angle: (di / 36) * Math.PI * 2,
      progress: di / 36,
      speed: 0.014 + (di % 4) * 0.003
    });
  }

  var jewelPoolLight = new THREE.PointLight(0x22d3ee, 0.95, 65);
  jewelPoolLight.position.set(vortexX, 5.5, 0);
  var jewelOculusLight = new THREE.PointLight(0x38bdf8, 0.75, 75);
  jewelOculusLight.position.set(vortexX, 33.5, 0);
  domeG.add(jewelPoolLight, jewelOculusLight);

  // Primary crystal-turquoise palette (`image_f2b93fd1.png` & `image_e865e179.png`) + gentle color-changing Light & Sound Show
  var showPalettes = [
    { oculus: new THREE.Color(0x00d2ff), waterEmit: new THREE.Color(0x0284c7), waterTint: new THREE.Color(0xf0f9ff), pool: new THREE.Color(0x06b6d4), mist: new THREE.Color(0xa5f3fc) },
    { oculus: new THREE.Color(0x38bdf8), waterEmit: new THREE.Color(0x0ea5e9), waterTint: new THREE.Color(0xe0f2fe), pool: new THREE.Color(0x22d3ee), mist: new THREE.Color(0xbae6fd) },
    { oculus: new THREE.Color(0x10b981), waterEmit: new THREE.Color(0x059669), waterTint: new THREE.Color(0xecfdf5), pool: new THREE.Color(0x14b8a6), mist: new THREE.Color(0x99f6e4) },
    { oculus: new THREE.Color(0xa855f7), waterEmit: new THREE.Color(0x9333ea), waterTint: new THREE.Color(0xfdf4ff), pool: new THREE.Color(0xc084fc), mist: new THREE.Color(0xf5d0fe) },
    { oculus: new THREE.Color(0xf43f5e), waterEmit: new THREE.Color(0xe11d48), waterTint: new THREE.Color(0xfff1f2), pool: new THREE.Color(0xfb7185), mist: new THREE.Color(0xfecdd3) }
  ];

  var lastPhysicsTime = performance.now();
  var showTime = 0;
  poolWater.onBeforeRender = function() {
    var now = performance.now();
    var dt = Math.min(0.05, Math.max(0.004, (now - lastPhysicsTime) * 0.001));
    if (now - lastPhysicsTime < 8) return;
    lastPhysicsTime = now;
    showTime += dt;

    for (var pi = 0; pi < jewelAutoPortals.length; pi++) {
      var portal = jewelAutoPortals[pi];
      var minDist = 999.0;
      if (window.playerLoco && window.playerLoco.position) {
        minDist = Math.min(minDist, portal.worldPos.distanceTo(window.playerLoco.position));
      }
      if (window.playerCoaches) {
        for (var pci = 0; pci < window.playerCoaches.length; pci++) {
          if (window.playerCoaches[pci] && window.playerCoaches[pci].position) {
            minDist = Math.min(minDist, portal.worldPos.distanceTo(window.playerCoaches[pci].position));
          }
        }
      }
      if (window.aiTrains) {
        for (var aii = 0; aii < window.aiTrains.length; aii++) {
          var ai = window.aiTrains[aii];
          if (ai && ai.loco && ai.loco.position) {
            minDist = Math.min(minDist, portal.worldPos.distanceTo(ai.loco.position));
          }
        }
      }
      var targetOpen = (minDist < 42.0) ? 1.0 : 0.0;
      portal.openAmount += (targetOpen - portal.openAmount) * Math.min(1.0, dt * 6.5);
      var slideOffset = portal.openAmount * 5.2;
      portal.leftDoor.position.x = -2.7 - slideOffset;
      portal.rightDoor.position.x =  2.7 + slideOffset;
      portal.statusMat.color.setHex(portal.openAmount > 0.25 ? 0x22c55e : 0x38bdf8);
    }

    var cyclePos = (showTime * 0.22) % showPalettes.length;
    var idxA = Math.floor(cyclePos);
    var idxB = (idxA + 1) % showPalettes.length;
    var blend = cyclePos - idxA;
    var sBlend = blend * blend * (3.0 - 2.0 * blend);
    var palA = showPalettes[idxA];
    var palB = showPalettes[idxB];

    oculusCollarMat.color.copy(palA.oculus).lerp(palB.oculus, sBlend);
    outerWaterMat.emissive.copy(palA.waterEmit).lerp(palB.waterEmit, sBlend);
    outerWaterMat.color.copy(palA.waterTint).lerp(palB.waterTint, sBlend);
    innerWaterMat.emissive.copy(palA.oculus).lerp(palB.oculus, sBlend);
    poolGlowMat.color.copy(palA.pool).lerp(palB.pool, sBlend);
    poolMistMat.color.copy(palA.mist).lerp(palB.mist, sBlend);
    splashMat.color.copy(palA.waterTint).lerp(palB.waterTint, sBlend);
    jewelPoolLight.color.copy(poolGlowMat.color);
    jewelOculusLight.color.copy(oculusCollarMat.color);

    for (var bi = 0; bi < lightBeamMats.length; bi++) {
      var wave = 0.5 + 0.5 * Math.sin(showTime * 3.2 + bi * 0.52);
      var beamPal = showPalettes[(idxA + (bi % 2)) % showPalettes.length];
      lightBeamMats[bi].color.copy(beamPal.oculus);
      lightBeamMats[bi].opacity = 0.12 + wave * 0.20;
    }

    vortexTexOuter.offset.y += dt * 0.92;
    vortexTexInner.offset.y += dt * 1.35;
    vortexTexInner.offset.x = Math.sin(now * 0.0007) * 0.06;

    for (var i = 0; i < physicsStreams.length; i++) {
      var st = physicsStreams[i];
      st.phase += dt * st.gravityRate;
      if (st.phase >= 1.0) st.phase -= 1.0;

      var fallFrac = st.phase * st.phase;
      var curY = 35.6 - fallFrac * 34.2;
      var uY = (curY - 1.0) / 34.8;
      var instSpeed = 0.3 + 2.2 * st.phase;

      var topFl = Math.pow(Math.max(0, uY), 2.4) * 3.85;
      var botFl = Math.pow(Math.max(0, 1.0 - uY), 2.0) * 1.45;
      var rCur = (3.15 + topFl + botFl) * st.radialLayer;
      var swirlAng = st.angle + fallFrac * 0.25;

      st.mesh.position.set(
        vortexX + Math.cos(swirlAng) * rCur,
        curY,
        Math.sin(swirlAng) * rCur
      );
      var stretchY = 1.3 + instSpeed * 2.4;
      var invR = 0.72 / Math.sqrt(stretchY);
      st.mesh.scale.set(invR, stretchY, invR);
    }

    for (var j = 0; j < splashParticles.length; j++) {
      var sp = splashParticles[j];
      sp.phase += dt * sp.speed;
      if (sp.phase >= 1.0) sp.phase -= 1.0;
      var u = sp.phase;
      var py = 1.65 + 4.0 * sp.maxHeight * u * (1.0 - u);
      var pr = 3.2 + u * sp.radialSpeed;
      sp.mesh.position.set(
        vortexX + Math.cos(sp.angle) * pr,
        py,
        Math.sin(sp.angle) * pr
      );
      var sScale = 1.1 - u * 0.5;
      sp.mesh.scale.set(sScale, sScale * (1.0 + Math.abs(0.5 - u)), sScale);
    }

    for (var k = 0; k < poolRipples.length; k++) {
      var rp = poolRipples[k];
      rp.phase += dt * 0.30;
      if (rp.phase >= 1.0) rp.phase -= 1.0;
      var rScale = 3.2 + rp.phase * 6.2;
      rp.mesh.scale.set(rScale, rScale, 1.0);
      rp.mat.color.copy(poolMistMat.color);
      rp.mat.opacity = 0.68 * (1.0 - rp.phase) * (1.0 - rp.phase);
    }
  };

  // ============================================================================
  // 4. 6-STORY STEPPED SHISEIDO FOREST VALLEY, SHOPPING GALLERIES & INTERIOR "JEWEL" LIVING WALL (`image_e865e179.png`)
  // ============================================================================
  var numFloors = 6;
  var flowerPalette = [0xf43f5e, 0xfacc15, 0xf97316, 0xec4899, 0x38bdf8];
  for (var tLevel = 0; tLevel < numFloors; tLevel++) {
    var ty = 2.6 + tLevel * 4.2;
    var tRad = 15.2 + tLevel * 2.65;
    var arcStart = -Math.PI * 0.04;
    var arcLen = Math.PI * 1.08;

    // True hollow curved terrace ring (NO solid disk across the central waterfall atrium!)
    var terraceArc = new THREE.Mesh(
      createHollowArcBandGeo(tRad - 0.25, tRad + 2.85, 1.30, 44, arcStart, arcLen),
      tLevel % 2 === 0 ? terraceMat : creamTerraceMat
    );
    terraceArc.position.set(vortexX, ty, 0);

    var glassBalustrade = new THREE.Mesh(
      new THREE.CylinderGeometry(tRad - 0.15, tRad - 0.15, 1.35, 44, 1, true, arcStart, arcLen),
      glassRailMat
    );
    glassBalustrade.position.set(vortexX, ty + 1.25, 0);

    var shopArc = new THREE.Mesh(
      new THREE.CylinderGeometry(tRad + 2.65, tRad + 2.65, 3.15, 44, 1, true, arcStart + 0.03, arcLen - 0.06),
      shopFacadeMat
    );
    shopArc.position.set(vortexX, ty + 2.15, 0);

    // True hollow curved hedge planter band along the terrace walkway
    var hedgeArc = new THREE.Mesh(
      createHollowArcBandGeo(tRad + 0.15, tRad + 1.05, 0.95, 44, arcStart, arcLen),
      tLevel % 2 === 0 ? foliageLushMat : foliageLimeMat
    );
    hedgeArc.position.set(vortexX, ty + 1.05, 0);

    domeG.add(terraceArc, glassBalustrade, shopArc, hedgeArc);

    var treesOnFloor = 12 + tLevel * 2;
    for (var ti = 0; ti < treesOnFloor; ti++) {
      var tAng = arcStart + 0.05 + (ti / (treesOnFloor - 1)) * (arcLen - 0.10);
      var tx = vortexX + Math.sin(tAng) * (tRad + 0.55);
      var tz = Math.cos(tAng) * (tRad + 0.55);
      if (tx < 6.5) continue; // Keep 100% clear of the Skytrain viaduct on the right (`local x = -2.2`)

      var bush = new THREE.Mesh(
        new THREE.SphereGeometry(1.4 + (ti % 3) * 0.35, 10, 8),
        (ti + tLevel) % 3 === 0 ? foliageDarkMat : ((ti % 2 === 0) ? foliageLushMat : foliageLimeMat)
      );
      bush.scale.set(1.25, 0.85, 1.25);
      bush.position.set(tx, ty + 1.5, tz);
      domeG.add(bush);

      if (ti % 2 === 0) {
        var vine = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.08, 2.8, 6), foliageLimeMat);
        vine.position.set(vortexX + Math.sin(tAng) * (tRad - 0.22), ty - 0.4, Math.cos(tAng) * (tRad - 0.22));
        domeG.add(vine);
      }

      if (ti % 3 === 1 && tLevel < 5) {
        var palmG = new THREE.Group();
        palmG.position.set(tx, ty + 0.8, tz);
        var trkH = 4.6 + (ti % 3) * 1.2;
        var trk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, trkH, 8), trunkBarkMat);
        trk.position.y = trkH * 0.5;
        palmG.add(trk);
        // Radiating tropical palm fronds + lush canopy (`image_e865e179.png`)
        for (var pfi = 0; pfi < 6; pfi++) {
          var pfa = (pfi / 6) * Math.PI * 2;
          var frond = new THREE.Mesh(new THREE.SphereGeometry(1.45, 8, 6), pfi % 2 === 0 ? foliageLushMat : foliageLimeMat);
          frond.scale.set(1.6, 0.28, 0.55);
          frond.rotation.y = pfa;
          frond.rotation.z = -0.35;
          frond.position.set(Math.cos(pfa) * 1.15, trkH + 0.2, Math.sin(pfa) * 1.15);
          palmG.add(frond);
        }
        domeG.add(palmG);
      }

      if (ti % 2 === 1 && tLevel <= 4) {
        var flwCol = flowerPalette[(ti + tLevel) % flowerPalette.length];
        var flwOrb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 8), new THREE.MeshBasicMaterial({ color: flwCol }));
        flwOrb.position.set(tx, ty + 2.15, tz);
        domeG.add(flwOrb);
      }
    }
  }

  // Prominent Interior Vertical Green Living Plant Wall with Glowing 3D Lotus Emblem & Bold White "JEWEL" Sign
  // mounted on the left terrace wall facing the interior pass-through camera (`image_e865e179.png` left side!)
  var interiorLivingWall = createJewelLivingWallMonument(19.5, 10.5);
  interiorLivingWall.position.set(vortexX + 14.2, 14.8, 3.5);
  interiorLivingWall.rotation.y = -Math.PI * 0.44;
  domeG.add(interiorLivingWall);

  // ============================================================================
  // 5. HERO FOREGROUND RAINFOREST PALMS, TROPICAL TREES & FLOWER BEDS (`image_e865e179.png`)
  // ============================================================================
  var heroTreeSpots = [
    [ 6.2, -22.0, 1.38], [ 5.8, -11.5, 1.32], [ 5.8, 11.5, 1.35], [ 6.2, 22.0, 1.38],
    [12.5, -18.5, 1.45], [12.5,  18.5, 1.45], [29.5, -16.0, 1.42], [29.5, 16.0, 1.42]
  ];
  heroTreeSpots.forEach(function(ht, idx) {
    var treeG = new THREE.Group();
    treeG.position.set(ht[0], 0.5, ht[1]);
    var sc = ht[2];
    treeG.scale.set(sc, sc, sc);

    var mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.64, 7.8, 10), trunkBarkMat);
    mainTrunk.position.y = 3.9;
    var canopy1 = new THREE.Mesh(new THREE.SphereGeometry(3.1, 14, 12), foliageLushMat);
    canopy1.scale.set(1.3, 0.65, 1.3);
    canopy1.position.set(0, 8.2, 0);
    var canopy2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 10), foliageLimeMat);
    canopy2.scale.set(1.25, 0.65, 1.25);
    canopy2.position.set(-1.8, 7.8, 0.8);
    var canopy3 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10), foliageMidMat);
    canopy3.scale.set(1.25, 0.65, 1.25);
    canopy3.position.set(1.8, 8.0, -0.6);

    var baseFern = new THREE.Mesh(new THREE.SphereGeometry(1.65, 10, 8), idx % 2 === 0 ? foliageLushMat : foliageLimeMat);
    baseFern.scale.set(1.35, 0.55, 1.35);
    baseFern.position.y = 0.65;

    var bollardGlow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bollardGlow.position.set(1.1, 1.2, 0.9);

    treeG.add(mainTrunk, canopy1, canopy2, canopy3, baseFern, bollardGlow);
    domeG.add(treeG);
  });

  scene.add(domeG);

  // ============================================================================
  // 6. VISITORS, PHOTOGRAPHERS & SHOPPERS AROUND THE WATERFALL & TERRACES
  //    (Standing with full bodies visible on the ground promenade y=0.56 and open terrace walkways!)
  // ============================================================================
  var cosD = Math.cos(ang);
  var sinD = Math.sin(ang);
  function spawnJewelVisitor(localX, localY, localZ, shirtHex, hatHex, scaleVal, lookAtVortex) {
    var wx = domeCenter.x + localX * cosD + localZ * sinD;
    var wz = domeCenter.z - localX * sinD + localZ * cosD;
    var wy = (midPt.y - 0.3) + localY;
    var rotY = lookAtVortex
      ? Math.atan2((domeCenter.x + vortexX * cosD) - wx, (domeCenter.z - vortexX * sinD) - wz)
      : ang + Math.PI * 0.5;
    return spawnPerson(wx, wy, wz, shirtHex, hatHex, false, scaleVal || 1.28, rotY);
  }

  var visitorShirts = [0xef4444, 0x38bdf8, 0xfacc15, 0xf472b6, 0x22c55e, 0xa855f7, 0xf97316, 0xffffff, 0x1d4ed8];
  for (var vi = 0; vi < 14; vi++) {
    var vAng = -Math.PI * 0.72 + (vi / 13) * Math.PI * 1.44;
    var vDist = 12.6 + (vi % 3) * 0.65;
    var vx = vortexX + Math.cos(vAng) * vDist;
    var vz = Math.sin(vAng) * vDist;
    if (vx < 6.0) continue;
    spawnJewelVisitor(
      vx,
      0.56,
      vz,
      visitorShirts[vi % visitorShirts.length],
      (vi % 4 === 0) ? 0x1e293b : null,
      1.26 + (vi % 3) * 0.08,
      true
    );
  }

  for (var tiVis = 0; tiVis < 8; tiVis++) {
    var tvAng = Math.PI * 0.14 + (tiVis / 7) * Math.PI * 0.72;
    var tvFloor = tiVis % 3;
    var tvRad = (15.2 + tvFloor * 2.65) + 1.55;
    var tvY = (2.6 + tvFloor * 4.2) + 0.65;
    spawnJewelVisitor(
      vortexX + Math.sin(tvAng) * tvRad,
      tvY,
      Math.cos(tvAng) * tvRad,
      visitorShirts[(tiVis + 5) % visitorShirts.length],
      null,
      1.22,
      true
    );
  }

  // Export exact world vectors & portal positions for the 2-stage Jewel camera choreography in `installModelsFrameEnhancer()`:
  // - Stage 1 (5s before entry): pulls high & far back behind the train to frame the train entering the Jewel building
  // - Stage 2 (inside Jewel): follows the train from the top of the dome (`od vrcholu kopule`), framing the entire interior!
  var inwardLeftVec = perp.clone().multiplyScalar(-1.0).normalize(); // Local +X in domeG (towards waterfall on the left!)
  window.jewelDomeCenterWorld = domeCenter.clone();
  window.jewelNorthPortalPos = jewelEdge.curve.getPointAt(0.20).add(perp.clone().multiplyScalar(2.2));
  window.jewelSouthPortalPos = jewelEdge.curve.getPointAt(0.80).add(perp.clone().multiplyScalar(2.2));
  window.jewelVortexWorldPos = domeCenter.clone()
    .add(inwardLeftVec.clone().multiplyScalar(vortexX))
    .add(new THREE.Vector3(0, 13.5, 0));
  window.jewelInwardLeftVec = inwardLeftVec.clone();
  window.jewelTrackTanVec = tan.clone();
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

  // Expressive arched eyebrows (jet-black for Vietnamese Mom!)
  ctx.strokeStyle = (isGrandma || isGrandpa) ? '#94a3b8' : (isMom ? '#0f172a' : '#451a03');
  ctx.lineWidth = isDad || isGrandpa ? 11 : 8;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.quadraticCurveTo(210, 178, 232, 192); ctx.moveTo(184, 196); ctx.quadraticCurveTo(208, 176, 232, 190); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(280, 190); ctx.quadraticCurveTo(304, 176, 328, 196); ctx.stroke();

  // Large Disney/Pixar Expressive Eyes (Sclera, Dark Vietnamese Brown/Black Iris for Mom, Pupil & Dual Specular Catchlights)
  [210, 302].forEach(function(ex, idx) {
    var ey = 232;
    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(ex, ey, 24, 27, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isMom ? '#0f172a' : '#451a03';
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

    // Rich dark espresso/black iris for Vietnamese Mom, warm chestnut for others
    var irisGrad = ctx.createRadialGradient(ex, ey + 2, 3, ex, ey + 2, 16);
    irisGrad.addColorStop(0.0, isMom ? '#292524' : '#78350f');
    irisGrad.addColorStop(0.7, isMom ? '#1c1917' : '#b45309');
    irisGrad.addColorStop(1.0, '#0f172a');
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

  // Mom: Vietnamese Mom with glossy jet-black hair (`0x0f172a`), warm cream-ivory knit top (`0xfef3c7`) + sky-blue A-line midi skirt (`0x1d4ed8`)
  // Dad: Rolled-sleeve denim-blue collared shirt (`0x1d4ed8`) over white crew tee + warm beige/khaki chinos (`0xd6d3d1`) + chestnut beard/hair (`0x4a200a`)
  var topHex  = isMom ? 0xfef3c7 : (isDad ? 0x1d4ed8 : (isGrandma ? 0xc084fc : 0x15803d));
  var botHex  = isMom ? 0x1d4ed8 : (isDad ? 0xd6d3d1 : (isGrandma ? 0x7e22ce : 0x78350f));
  var hairHex = (isGrandma || isGrandpa) ? 0xe2e8f0 : (isMom ? 0x0f172a : 0x4a200a);

  var topMat  = new THREE.MeshStandardMaterial({ color: topHex, roughness: 0.48 });
  var botMat  = new THREE.MeshStandardMaterial({ color: botHex, roughness: 0.50 });
  var hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: isMom ? 0.28 : 0.55 });

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
  var irisMat   = new THREE.MeshBasicMaterial({ color: isMom ? 0x1c1917 : 0x78350f });
  var pupilMat  = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  var blushMat  = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
  var browMat   = new THREE.MeshBasicMaterial({ color: (isGrandma || isGrandpa) ? 0x94a3b8 : (isMom ? 0x0f172a : 0x451a03) });

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
    var bun = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 12), hairMat);
    bun.position.set(0, 0.56, -0.32);
    var gBangsL = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), hairMat);
    gBangsL.scale.set(1.2, 0.45, 0.75);
    gBangsL.position.set(-0.26, 0.48, 0.30);
    gBangsL.rotation.z = 0.32;
    var gBangsR = gBangsL.clone();
    gBangsR.position.x = 0.26;
    gBangsR.rotation.z = -0.32;
    headGroup.add(bun, gBangsL, gBangsR);
    // Golden round reading glasses
    var glassGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 });
    [-0.20, 0.20].forEach(function(gx) {
      var rim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.018, 8, 18), glassGold);
      rim.position.set(gx, 0.09, 0.59);
      headGroup.add(rim);
    });
  } else if (isGrandpa) {
    var gpQuiff = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), hairMat);
    gpQuiff.scale.set(1.3, 0.48, 0.82);
    gpQuiff.position.set(0, 0.52, 0.24);
    var gpMustache = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.075, 0.09), hairMat);
    gpMustache.position.set(0, -0.09, 0.57);
    headGroup.add(gpQuiff, gpMustache);
    var glassGold2 = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 });
    [-0.20, 0.20].forEach(function(gx) {
      var rim2 = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.018, 8, 18), glassGold2);
      rim2.position.set(gx, 0.09, 0.59);
      headGroup.add(rim2);
    });
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

// 6. MOM & DAD'S VIETNAMESE TROPICAL BUNGALOW (`J_WEST -> J_NW` at x = -238, z = -144)
//    - Single-story white flat-roof bungalow ("přízemní bungalov, má plochou střechu a bílou barvu")
//    - Giant grand entrance double doors ("obrovské vchodové dveře")
//    - "VIETNAM" welcome sign ("cedule VIETNAM") & ~12 curved Coconut Palms ("asi 10 kokosových palem")
//    - Silver-grey Honda AIR Blade scooter ("stříbrně šedý scooter Honda AIR Blade") instead of a car
//    - Vietnamese Mom with glossy jet-black hair ("Maminka má černé vlasy, je to vietnamka") & Dad waving
//    - Blue Intex 3.66m swimming pool with crystal-clear water, sand filter pump & chlorinator ("modrý bazén intex 3.66m s krásně čistou vodou s pískovou filtrací a chlorinátorem")
//    - 3m-wide tropical stream on the right side with jumping fish, crawling crabs, coconut palms & jackfruit trees ("3 metry široký potok, ve kterém skáčou ryby a kolem lezou krabi a kolem potoka jsou všude palmy a jackfruity")
window.vietnamJumpingFish = [];
window.vietnamCrawlingCrabs = [];
(function buildMomAndDadHouseLandmark() {
  var mx = -238, mz = -144;
  var my = terrainY(mx, mz);
  var g = new THREE.Group();
  g.position.set(mx, my, mz);
  var houseRotY = Math.PI * 0.36;
  g.rotation.y = houseRotY;

  var cottageSunLight = new THREE.PointLight(0xfff7ed, 0.28, 78);
  cottageSunLight.position.set(0, 20, 18);
  g.add(cottageSunLight);

  var pureWhiteWallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.34, metalness: 0.04 });
  var offWhiteTrimMat  = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38 });
  var darkParapetMat   = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.42, metalness: 0.25 });
  var teakWoodMat      = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.36, metalness: 0.12 });
  var richMahoganyMat  = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.32, metalness: 0.15 });
  var goldHandleMat    = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.20, metalness: 0.85 });
  var glassDoorMat     = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.12, metalness: 0.25, transparent: true, opacity: 0.78 });
  var warmGlowMat      = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var patioTileMat     = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.42 });
  var stoneStepMat     = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.50 });

  // 1. Lush Tropical Vietnamese Garden Lawn & Tiled Forecourt Terrace
  var lawnBase = new THREE.Mesh(
    new THREE.CylinderGeometry(34.0, 35.5, 0.70, 44),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.72 })
  );
  lawnBase.position.y = 0.25;
  lawnBase.receiveShadow = true;
  g.add(lawnBase);

  var frontPatio = new THREE.Mesh(new THREE.BoxGeometry(22.0, 0.32, 9.5), patioTileMat);
  frontPatio.position.set(0, 0.58, 10.2);
  frontPatio.receiveShadow = true;
  g.add(frontPatio);

  // 2. Single-Story White Flat-Roof Bungalow ("přízemní bungalov, má plochou střechu a bílou barvu")
  var plinth = new THREE.Mesh(new THREE.BoxGeometry(21.4, 1.1, 14.4), stoneStepMat);
  plinth.position.set(0, 0.95, 0);
  var bungalowWalls = new THREE.Mesh(new THREE.BoxGeometry(20.6, 6.2, 13.6), pureWhiteWallMat);
  bungalowWalls.position.set(0, 4.4, 0);
  bungalowWalls.castShadow = true;
  bungalowWalls.receiveShadow = true;

  // Modern Cantilevered Flat Roof Slab with Overhang, Parapet Rim & Warm LED Soffit Strip
  var flatRoofSlab = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.85, 16.4), pureWhiteWallMat);
  flatRoofSlab.position.set(0, 7.82, 0.4);
  flatRoofSlab.castShadow = true;
  var roofParapet = new THREE.Mesh(new THREE.BoxGeometry(23.4, 0.36, 16.6), darkParapetMat);
  roofParapet.position.set(0, 8.38, 0.4);
  var roofTopDeck = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.18, 15.4), offWhiteTrimMat);
  roofTopDeck.position.set(0, 8.52, 0.4);
  var ledSoffitStrip = new THREE.Mesh(new THREE.BoxGeometry(21.8, 0.10, 0.35), warmGlowMat);
  ledSoffitStrip.position.set(0, 7.36, 7.85);
  g.add(plinth, bungalowWalls, flatRoofSlab, roofParapet, roofTopDeck, ledSoffitStrip);

  // Elegant Modern Front Veranda Pillars Supporting the Flat Roof Overhang
  [-9.6, 9.6].forEach(function(px) {
    var col = new THREE.Mesh(new THREE.BoxGeometry(0.85, 6.6, 0.85), pureWhiteWallMat);
    col.position.set(px, 4.2, 7.6);
    var colBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.9, 1.15), darkParapetMat);
    colBase.position.set(px, 1.1, 7.6);
    g.add(col, colBase);
  });

  // 3. GIANT GRAND ENTRANCE DOORS ("má obrovské vchodové dveře" - Massive 4-Panel Vietnamese Teakwood & Glass Grand Double Entrance!)
  var grandDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.75, 0.52), richMahoganyMat);
  grandDoorFrame.position.set(0, 4.15, 6.82);
  var grandDoorBackdrop = new THREE.Mesh(new THREE.BoxGeometry(6.1, 5.3, 0.32), warmGlowMat);
  grandDoorBackdrop.position.set(0, 4.10, 6.72);
  g.add(grandDoorFrame, grandDoorBackdrop);

  // 4 Tall Carved Wooden & Frosted-Glass Door Leaves (2 outer sidelights + 2 huge central swinging leaves)
  [-2.25, -0.76, 0.76, 2.25].forEach(function(dx, dIdx) {
    var isCenterLeaf = (dIdx === 1 || dIdx === 2);
    var leafW = isCenterLeaf ? 1.46 : 1.38;
    var doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, 5.22, 0.56), teakWoodMat);
    doorLeaf.position.set(dx, 4.08, 6.88);
    var upperGlassInsert = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.36, 2.85, 0.62), glassDoorMat);
    upperGlassInsert.position.set(dx, 4.82, 6.89);
    var lowerCarvedPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.34, 1.45, 0.62), richMahoganyMat);
    lowerCarvedPanel.position.set(dx, 2.32, 6.89);
    g.add(doorLeaf, upperGlassInsert, lowerCarvedPanel);

    // Ornate Vietnamese Golden Lattice Bars across the glass inserts
    for (var gyBar = 3.8; gyBar <= 5.8; gyBar += 0.65) {
      var hBar = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.34, 0.08, 0.66), goldHandleMat);
      hBar.position.set(dx, gyBar, 6.90);
      g.add(hBar);
    }
  });

  // Twin Long Golden Pull Handles on the Giant Center Doors
  [-0.22, 0.22].forEach(function(hx) {
    var longHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.45, 12), goldHandleMat);
    longHandle.position.set(hx, 3.95, 7.26);
    g.add(longHandle);
  });

  // Grand Wide Front Entrance Steps leading up to the Giant Doors
  var step1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.36, 2.4), stoneStepMat);
  step1.position.set(0, 0.76, 7.6);
  var step2 = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.36, 1.6), pureWhiteWallMat);
  step2.position.set(0, 1.12, 7.2);
  g.add(step1, step2);

  // Panoramic Side Bungalow Windows with Dark Anthracite Frames & Tropical Planter Boxes
  [-6.8, 6.8].forEach(function(wx) {
    var winFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 0.42), darkParapetMat);
    winFrame.position.set(wx, 4.35, 6.80);
    var winGlass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.0, 0.46), glassDoorMat);
    winGlass.position.set(wx, 4.35, 6.83);
    var winGlow = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 0.30), warmGlowMat);
    winGlow.position.set(wx, 4.35, 6.72);
    g.add(winFrame, winGlass, winGlow);
  });

  // 4. "VIETNAM" WELCOME SIGN ("cedule VIETNAM") with Golden Star Emblem in the Front Garden!
  (function buildVietnamSign() {
    var signG = new THREE.Group();
    signG.position.set(-8.6, 0.65, 14.8);
    signG.rotation.y = 0.18;

    var c = document.createElement('canvas');
    c.width = 512; c.height = 192;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 178);

    // Draw golden 5-pointed Vietnamese star on the left
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    var sx = 92, sy = 96, outerR = 48, innerR = 20;
    for (var si = 0; si < 10; si++) {
      var r = (si % 2 === 0) ? outerR : innerR;
      var a = (si * Math.PI) / 5 - Math.PI / 2;
      if (si === 0) ctx.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
      else ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VIETNAM', 318, 100);

    var vTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
    var boardMat = new THREE.MeshBasicMaterial({ map: vTex });
    var boardBox = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.85, 0.32), darkParapetMat);
    boardBox.position.y = 4.2;
    var boardFront = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.7), boardMat);
    boardFront.position.set(0, 4.2, 0.18);
    var boardBack = boardFront.clone();
    boardBack.rotation.y = Math.PI;
    boardBack.position.z = -0.18;

    [-2.8, 2.8].forEach(function(px) {
      var post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.4, 12), darkParapetMat);
      post.position.set(px, 2.2, 0);
      signG.add(post);
    });
    signG.add(boardBox, boardFront, boardBack);
    g.add(signG);
  })();

  // 5. SILVER-GREY HONDA AIR BLADE SCOOTER ("místo auta stříbrně šedý scooter Honda AIR Blade")
  (function buildHondaAirBladeScooter() {
    var scootG = new THREE.Group();
    scootG.position.set(-7.8, 0.74, 10.6);
    scootG.rotation.y = 0.55;
    scootG.scale.set(1.38, 1.38, 1.38);

    var silverMetallicMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.22, metalness: 0.75 });
    var gunmetalGreyMat   = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.28, metalness: 0.65 });
    var matteBlackMat     = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    var chromeMat         = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.90 });
    var redTailMat        = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    var ledHeadMat        = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    // Cast 5-Spoke Black Sport Scooter Wheels (14-inch Air Blade style)
    [-1.15, 1.15].forEach(function(wz) {
      var whG = new THREE.Group();
      whG.position.set(0, 0.55, wz);
      var tire = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.14, 12, 24), matteBlackMat);
      tire.rotation.y = Math.PI / 2;
      var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.14, 14), matteBlackMat);
      rim.rotation.z = Math.PI / 2;
      var brakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), chromeMat);
      brakeDisc.rotation.z = Math.PI / 2;
      whG.add(tire, rim, brakeDisc);
      scootG.add(whG);
    });

    // Air Blade Central Spine Tunnel, Footboards & Underbone Frame
    var spineTunnel = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 1.35), gunmetalGreyMat);
    spineTunnel.position.set(0, 0.78, 0.05);
    var footboard = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.16, 1.25), matteBlackMat);
    footboard.position.set(0, 0.54, 0.05);

    // Sculpted Silver-Grey Aerodynamic Front Fairing & Dual Sharp LED Headlights
    var frontFairing = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.35, 0.78), silverMetallicMat);
    frontFairing.position.set(0, 1.28, 0.88);
    frontFairing.rotation.x = -0.26;
    var frontMudguard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.68), silverMetallicMat);
    frontMudguard.position.set(0, 0.92, 1.18);
    frontMudguard.rotation.x = 0.25;
    var darkVisor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.46, 0.14), matteBlackMat);
    darkVisor.position.set(0, 1.98, 0.82);
    darkVisor.rotation.x = -0.35;

    // Twin V-Shaped LED Headlamps
    [-0.24, 0.24].forEach(function(hx) {
      var hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.12), ledHeadMat);
      hl.position.set(hx, 1.32, 1.26);
      hl.rotation.z = hx > 0 ? 0.25 : -0.25;
      scootG.add(hl);
    });

    // Telescopic Front Fork Tubes
    [-0.22, 0.22].forEach(function(fx) {
      var fork = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.95, 8), chromeMat);
      fork.position.set(fx, 0.88, 1.05);
      fork.rotation.x = -0.24;
      scootG.add(fork);
    });

    // Handlebars, Brake Levers & Rearview Mirrors
    var handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.35, 10), chromeMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 1.96, 0.66);
    [-0.56, 0.56].forEach(function(mx2) {
      var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 8), matteBlackMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(mx2, 1.96, 0.66);
      var mStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 6), matteBlackMat);
      mStem.position.set(mx2 * 0.85, 2.15, 0.68);
      var mHead = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.08), matteBlackMat);
      mHead.position.set(mx2 * 0.96, 2.34, 0.68);
      scootG.add(grip, mStem, mHead);
    });

    // Rear Silver-Grey Body Panels with "AIR BLADE" Badge, Stepped Two-Tone Seat & Exhaust Pipe
    var rearBody = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.68, 1.52), silverMetallicMat);
    rearBody.position.set(0, 1.18, -0.78);
    rearBody.rotation.x = 0.10;
    var steppedSeat = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.34, 1.42), matteBlackMat);
    steppedSeat.position.set(0, 1.54, -0.68);
    steppedSeat.rotation.x = 0.08;
    var rearSpoiler = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.45), gunmetalGreyMat);
    rearSpoiler.position.set(0, 1.56, -1.48);
    var tailLamp = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.12), redTailMat);
    tailLamp.position.set(0, 1.32, -1.56);

    // Upswept Sport Exhaust Muffler with Silver Heat Shield on Right Side
    var muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 1.15, 12), matteBlackMat);
    muffler.rotation.x = Math.PI / 2 - 0.22;
    muffler.position.set(0.54, 0.78, -0.95);
    var heatShield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.72), silverMetallicMat);
    heatShield.rotation.x = -0.22;
    heatShield.position.set(0.68, 0.80, -0.95);

    // "HONDA AIR BLADE" Side Decal Plate
    var abCanv = document.createElement('canvas');
    abCanv.width = 256; abCanv.height = 64;
    var abCtx = abCanv.getContext('2d');
    abCtx.fillStyle = '#cbd5e1';
    abCtx.fillRect(0, 0, 256, 64);
    abCtx.fillStyle = '#dc2626';
    abCtx.font = 'italic bold 28px sans-serif';
    abCtx.textAlign = 'center';
    abCtx.fillText('AIR BLADE', 128, 42);
    var abTex = new THREE.CanvasTexture(abCanv);
    var abMat = new THREE.MeshBasicMaterial({ map: abTex });
    [-0.48, 0.48].forEach(function(sx2) {
      var decal = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.28), abMat);
      decal.position.set(sx2, 1.20, -0.78);
      decal.rotation.y = sx2 > 0 ? Math.PI / 2 : -Math.PI / 2;
      scootG.add(decal);
    });

    scootG.add(spineTunnel, footboard, frontFairing, frontMudguard, darkVisor, handlebar, rearBody, steppedSeat, rearSpoiler, tailLamp, muffler, heatShield);
    g.add(scootG);
  })();

  // 6. BLUE INTEX 3.66m SWIMMING POOL WITH CRYSTAL-CLEAR WATER, SAND FILTER & CHLORINATOR
  //    ("modrý bazén intex 3.66m s krásně čistou vodou s pískovou filtrací a chlorinátorem")
  (function buildIntexPoolWithFiltration() {
    var poolG = new THREE.Group();
    poolG.position.set(-16.2, 0.55, -0.8);

    // Custom Canvas Texture for the Blue Intex PVC Wall with Full, Unclipped White "INTEX" Branding
    // ("3. na bazénu jde vidět jen písmena EX, prosím aby byl vidět celý nápis INTEX.")
    var wallCanv = document.createElement('canvas');
    wallCanv.width = 1024; wallCanv.height = 128;
    var wctx = wallCanv.getContext('2d');
    var wallGrad = wctx.createLinearGradient(0, 0, 0, 128);
    wallGrad.addColorStop(0.0, '#0284c7');
    wallGrad.addColorStop(0.5, '#0369a1');
    wallGrad.addColorStop(1.0, '#1d4ed8');
    wctx.fillStyle = wallGrad;
    wctx.fillRect(0, 0, 1024, 128);
    wctx.fillStyle = '#ffffff';
    wctx.font = '900 44px "Arial Black", sans-serif';
    wctx.textAlign = 'center';
    wctx.textBaseline = 'middle';
    [128, 384, 640, 896].forEach(function(lx) {
      wctx.fillText('INTEX', lx, 68);
    });
    var poolWallTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(wallCanv) : new THREE.CanvasTexture(wallCanv);

    // Dedicated Centered Front-Facing Curved "INTEX" Logo Band so the entire word "INTEX" is 100% visible
    // dead-center from both the railway track and the Mom & Dad's House showcase camera!
    var logoCanv = document.createElement('canvas');
    logoCanv.width = 512; logoCanv.height = 128;
    var lctx = logoCanv.getContext('2d');
    lctx.fillStyle = '#0369a1';
    lctx.fillRect(0, 0, 512, 128);
    lctx.fillStyle = '#ffffff';
    lctx.font = '900 78px "Arial Black", sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText('INTEX', 256, 66);
    var poolLogoTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(logoCanv) : new THREE.CanvasTexture(logoCanv);

    // Crystal-Clear Mosaic Tile Pool Floor Texture
    var tileCanv = document.createElement('canvas');
    tileCanv.width = 256; tileCanv.height = 256;
    var tctx = tileCanv.getContext('2d');
    tctx.fillStyle = '#38bdf8';
    tctx.fillRect(0, 0, 256, 256);
    for (var tx = 0; tx < 256; tx += 32) {
      for (var ty = 0; ty < 256; ty += 32) {
        tctx.fillStyle = ((tx + ty) / 32) % 2 === 0 ? '#7dd3fc' : '#0ea5e9';
        tctx.fillRect(tx + 2, ty + 2, 28, 28);
      }
    }
    var mosaicTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(tileCanv, 3, 3) : new THREE.CanvasTexture(tileCanv);
    mosaicTex.wrapS = THREE.RepeatWrapping;
    mosaicTex.wrapT = THREE.RepeatWrapping;

    var poolRad = 4.6;
    var poolH   = 2.15;

    var linerWall = new THREE.Mesh(
      new THREE.CylinderGeometry(poolRad, poolRad + 0.15, poolH, 40, 1, true),
      new THREE.MeshStandardMaterial({ map: poolWallTex, roughness: 0.32, side: THREE.DoubleSide })
    );
    linerWall.position.y = poolH * 0.5;
    linerWall.rotation.y = Math.PI * 0.25;

    // Place centered curved "INTEX" logo bands facing the front/camera angles so all 5 letters I-N-T-E-X are always visible!
    [-0.36, 0.22, Math.PI * 0.68].forEach(function(bandYaw) {
      var logoArc = new THREE.Mesh(
        new THREE.CylinderGeometry(poolRad + 0.14, poolRad + 0.17, 0.92, 24, 1, true, -0.34, 0.68),
        new THREE.MeshBasicMaterial({ map: poolLogoTex, side: THREE.DoubleSide })
      );
      logoArc.position.y = poolH * 0.52;
      logoArc.rotation.y = bandYaw;
      poolG.add(logoArc);
    });

    var topCollar = new THREE.Mesh(
      new THREE.TorusGeometry(poolRad, 0.24, 14, 36),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.28 })
    );
    topCollar.rotation.x = Math.PI / 2;
    topCollar.position.y = poolH;

    var legFrameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.4 });
    for (var li = 0; li < 12; li++) {
      var lAng = (li / 12) * Math.PI * 2;
      var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, poolH, 8), legFrameMat);
      leg.position.set(Math.cos(lAng) * (poolRad + 0.14), poolH * 0.5, Math.sin(lAng) * (poolRad + 0.14));
      poolG.add(leg);
    }

    var mosaicFloor = new THREE.Mesh(
      new THREE.CircleGeometry(poolRad - 0.06, 36),
      new THREE.MeshBasicMaterial({ map: mosaicTex })
    );
    mosaicFloor.rotation.x = -Math.PI / 2;
    mosaicFloor.position.y = 0.12;

    var clearWaterSurface = new THREE.Mesh(
      new THREE.CircleGeometry(poolRad - 0.08, 36),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.18,
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.62
      })
    );
    clearWaterSurface.rotation.x = -Math.PI / 2;
    clearWaterSurface.position.y = poolH - 0.22;

    var ladderG = new THREE.Group();
    ladderG.position.set(poolRad, 0, 0);
    [-0.45, 0.45].forEach(function(lz) {
      var outerRail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), legFrameMat);
      outerRail.position.set(0.45, 1.35, lz);
      outerRail.rotation.z = 0.22;
      var innerRail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), legFrameMat);
      innerRail.position.set(-0.45, 1.35, lz);
      innerRail.rotation.z = -0.22;
      ladderG.add(outerRail, innerRail);
    });
    for (var stp = 0; stp < 4; stp++) {
      var stepOut = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.92), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
      stepOut.position.set(0.65 - stp * 0.14, 0.55 + stp * 0.55, 0);
      ladderG.add(stepOut);
    }

    // EXTERNAL SAND FILTER PUMP & SALTWATER CHLORINATOR ("s pískovou filtrací a chlorinátorem")
    var equipPad = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.24, 2.6), stoneStepMat);
    equipPad.position.set(-1.2, 0.12, -poolRad - 2.1);

    var sandTankMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.2 });
    var valveBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
    var sandTank = new THREE.Mesh(new THREE.SphereGeometry(0.88, 18, 16), sandTankMat);
    sandTank.scale.set(1.0, 1.25, 1.0);
    sandTank.position.set(-2.0, 1.25, -poolRad - 2.1);
    var tankBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.82, 0.32, 16), valveBlackMat);
    tankBase.position.set(-2.0, 0.28, -poolRad - 2.1);
    var multiportValve = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.52, 12), valveBlackMat);
    multiportValve.position.set(-2.0, 2.48, -poolRad - 2.1);
    var valveHandle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.16), valveBlackMat);
    valveHandle.position.set(-1.85, 2.78, -poolRad - 2.1);
    var pressureGauge = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    pressureGauge.rotation.x = Math.PI / 2;
    pressureGauge.position.set(-2.0, 2.45, -poolRad - 1.62);

    var pumpMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.15, 14), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 }));
    pumpMotor.rotation.z = Math.PI / 2;
    pumpMotor.position.set(-0.85, 0.72, -poolRad - 2.2);

    var chlorinatorBox = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.92, 0.78), sandTankMat);
    chlorinatorBox.position.set(0.25, 0.68, -poolRad - 2.0);
    var chlorinatorScreen = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.32, 0.82), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    chlorinatorScreen.position.set(0.25, 0.82, -poolRad - 2.0);
    var electrolyticCell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.78, 12), glassDoorMat);
    electrolyticCell.rotation.z = Math.PI / 2;
    electrolyticCell.position.set(0.25, 1.32, -poolRad - 1.85);

    var hoseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    var hoseBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
    var intakeHose = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.45, 10), hoseMat);
    intakeHose.rotation.x = Math.PI / 2 + 0.25;
    intakeHose.position.set(-1.35, 1.15, -poolRad - 1.05);
    var returnHose = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.35, 10), hoseBlueMat);
    returnHose.rotation.x = Math.PI / 2 + 0.18;
    returnHose.position.set(0.25, 1.32, -poolRad - 0.95);

    poolG.add(
      linerWall, topCollar, mosaicFloor, clearWaterSurface, ladderG,
      equipPad, sandTank, tankBase, multiportValve, valveHandle, pressureGauge,
      pumpMotor, chlorinatorBox, chlorinatorScreen, electrolyticCell, intakeHose, returnHose
    );
    g.add(poolG);
  })();

  // 7. 3-METER-WIDE TROPICAL STREAM ON THE RIGHT SIDE WITH JUMPING FISH & CRAWLING CRABS
  //    ("Vedle domu z pravé strany teče 3 metry široký potok, ve kterém skáčou ryby a kolem lezou krabi")
  (function buildRightSideStreamWithFishAndCrabs() {
    var streamX = 16.5;
    var streamLen = 46.0;
    var streamWidth = 3.5;

    var streamG = new THREE.Group();
    streamG.position.set(streamX, 0.42, 0.5);

    var streamBed = new THREE.Mesh(
      new THREE.BoxGeometry(streamWidth + 1.2, 0.28, streamLen),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 })
    );
    streamBed.position.y = 0.08;
    var streamWater = new THREE.Mesh(
      new THREE.BoxGeometry(streamWidth, 0.36, streamLen - 0.4),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
        roughness: 0.12,
        metalness: 0.18,
        transparent: true,
        opacity: 0.82
      })
    );
    streamWater.position.y = 0.24;
    streamG.add(streamBed, streamWater);

    var rockMatA = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 });
    var rockMatB = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.80 });
    for (var rz = -21; rz <= 21; rz += 2.2) {
      [-1, 1].forEach(function(bankSide) {
        var rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.52 + (Math.abs(rz) % 3) * 0.16, 1),
          (Math.round(rz) + bankSide) % 2 === 0 ? rockMatA : rockMatB
        );
        rock.scale.set(1.2, 0.65, 1.1);
        rock.position.set(bankSide * (streamWidth * 0.5 + 0.35), 0.32, rz);
        streamG.add(rock);
      });
    }

    var bridgeG = new THREE.Group();
    bridgeG.position.set(0, 0.55, 8.5);
    var bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.26, 2.6), teakWoodMat);
    bridgeDeck.position.y = 0.35;
    [-1.15, 1.15].forEach(function(bz) {
      var bRail = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.16), teakWoodMat);
      bRail.position.set(0, 1.15, bz);
      var bPostL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), teakWoodMat);
      bPostL.position.set(-2.3, 0.72, bz);
      var bPostR = bPostL.clone();
      bPostR.position.x = 2.3;
      bridgeG.add(bRail, bPostL, bPostR);
    });
    streamG.add(bridgeG);

    // 6 ANIMATED JUMPING FISH ("ve kterém skáčou ryby")
    var fishColors = [0xf97316, 0xfacc15, 0xef4444, 0x38bdf8, 0xfb7185, 0xf59e0b];
    for (var fi = 0; fi < 6; fi++) {
      var fishG = new THREE.Group();
      var fMat = new THREE.MeshStandardMaterial({ color: fishColors[fi % fishColors.length], roughness: 0.25, metalness: 0.3 });
      var fBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), fMat);
      fBody.scale.set(0.65, 0.85, 1.65);
      var fTail = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.55, 4), fMat);
      fTail.rotation.x = -Math.PI / 2;
      fTail.position.set(0, 0, -0.75);
      var fEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      fEyeL.position.set(-0.22, 0.10, 0.45);
      var fEyeR = fEyeL.clone();
      fEyeR.position.x = 0.22;
      fishG.add(fBody, fTail, fEyeL, fEyeR);

      var baseZ = -16.0 + fi * 6.2;
      fishG.position.set((fi % 2 === 0 ? -0.45 : 0.45), 0.3, baseZ);
      streamG.add(fishG);
      window.vietnamJumpingFish.push({
        mesh: fishG,
        baseX: (fi % 2 === 0 ? -0.55 : 0.55),
        baseZ: baseZ,
        phase: fi * 1.15
      });
    }

    // 6 ANIMATED CRAWLING CRABS ON THE STREAM BANKS ("a kolem lezou krabi")
    var crabRedMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35 });
    var crabOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.38 });
    for (var ci = 0; ci < 6; ci++) {
      var crabG = new THREE.Group();
      var cMat = (ci % 2 === 0) ? crabRedMat : crabOrangeMat;
      var carapace = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), cMat);
      carapace.scale.set(1.35, 0.55, 1.05);
      carapace.position.y = 0.28;
      crabG.add(carapace);

      [-0.22, 0.22].forEach(function(cx2) {
        var stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 6), cMat);
        stalk.position.set(cx2, 0.52, 0.32);
        var cEye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
        cEye.position.set(cx2, 0.66, 0.34);
        var clawArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 8), cMat);
        clawArm.position.set(cx2 * 2.4, 0.38, 0.38);
        clawArm.rotation.z = cx2 > 0 ? -0.45 : 0.45;
        var pincer = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), cMat);
        pincer.scale.set(0.85, 0.65, 1.45);
        pincer.position.set(cx2 * 2.8, 0.52, 0.52);
        crabG.add(stalk, cEye, clawArm, pincer);
      });

      [-1, 1].forEach(function(side) {
        [-0.24, 0, 0.24].forEach(function(lz) {
          var cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.48, 6), cMat);
          cLeg.position.set(side * 0.68, 0.18, lz);
          cLeg.rotation.z = side * 0.85;
          crabG.add(cLeg);
        });
      });

      var bankX = (ci % 2 === 0 ? -1 : 1) * (streamWidth * 0.5 + 1.15);
      var bankZ = -14.0 + ci * 5.6;
      crabG.position.set(bankX, 0.22, bankZ);
      streamG.add(crabG);
      window.vietnamCrawlingCrabs.push({
        mesh: crabG,
        baseX: bankX,
        baseZ: bankZ,
        phase: ci * 1.4
      });
    }

    g.add(streamG);
  })();

  // 8. ~12 CURVED VIETNAMESE COCONUT PALMS & 5 JACKFRUIT TREES AROUND THE HOUSE & STREAM
  //    ("Kolem domu, kde bydlí mamka s taťkou by mělo být asi 10 kokosových palem" + "kolem potoka jsou všude palmy a jackfruity")
  var palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.72 });
  var palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.48, side: THREE.DoubleSide });
  var palmLimeMat  = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45, side: THREE.DoubleSide });
  var coconutMat   = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.55 });

  function addCoconutPalm(px, pz, scaleVal, leanAng) {
    var palmG = new THREE.Group();
    palmG.position.set(px, 0.45, pz);
    palmG.scale.set(scaleVal, scaleVal, scaleVal);
    palmG.rotation.y = leanAng || 0;

    var segCount = 7;
    var curX = 0, curY = 0;
    for (var s = 0; s < segCount; s++) {
      var segH = 1.45;
      var tilt = 0.08 + s * 0.032;
      var rBot = 0.48 * (1 - s * 0.07);
      var rTop = 0.48 * (1 - (s + 1) * 0.07);
      var seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH, 10), palmTrunkMat);
      seg.position.set(curX + Math.sin(tilt) * segH * 0.5, curY + Math.cos(tilt) * segH * 0.5, 0);
      seg.rotation.z = -tilt;
      seg.castShadow = true;
      palmG.add(seg);
      curX += Math.sin(tilt) * segH;
      curY += Math.cos(tilt) * segH;
    }

    for (var ci = 0; ci < 5; ci++) {
      var cAng = (ci / 5) * Math.PI * 2;
      var coco = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), coconutMat);
      coco.position.set(curX + Math.cos(cAng) * 0.42, curY - 0.25, Math.sin(cAng) * 0.42);
      palmG.add(coco);
    }

    for (var fi = 0; fi < 8; fi++) {
      var fAng = (fi / 8) * Math.PI * 2;
      var frondPivot = new THREE.Group();
      frondPivot.position.set(curX, curY + 0.1, 0);
      frondPivot.rotation.y = fAng;
      var frondBlade = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.14, 1.15),
        fi % 2 === 0 ? palmFrondMat : palmLimeMat
      );
      frondBlade.position.set(1.85, -0.35, 0);
      frondBlade.rotation.z = -0.34;
      frondPivot.add(frondBlade);
      palmG.add(frondPivot);
    }
    g.add(palmG);
  }

  var coconutPalmCoords = [
    [-12.5, -10.5, 1.15,  0.4], [-4.5, -12.0, 1.22,  0.8], [ 4.5, -12.0, 1.18, -0.5], [11.5, -10.5, 1.20, -0.3],
    [-22.5,  -6.5, 1.12,  0.2], [-22.5,  6.5, 1.16, -0.4], [-13.5, 14.5, 1.08,  0.6],
    [ 12.2,  13.5, 1.15, -0.2], [ 21.5, 14.0, 1.18, -0.7], [ 22.0,  2.5, 1.24, -0.4],
    [ 21.8,  -8.5, 1.16,  0.3], [ 21.2, -16.5, 1.12, 0.9]
  ];
  coconutPalmCoords.forEach(function(cp) {
    addCoconutPalm(cp[0], cp[1], cp[2], cp[3]);
  });

  // 5 Vietnamese Jackfruit Trees ("jackfruity" - lush canopy with bumpy green-gold jackfruits hanging from trunk & branches!)
  var jackfruitSkinMat = new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.65 });
  var jackfruitGoldMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.58 });
  var darkLeafMat      = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });

  function addJackfruitTree(jx, jz, jScale) {
    var jfTree = new THREE.Group();
    jfTree.position.set(jx, 0.45, jz);
    jfTree.scale.set(jScale, jScale, jScale);

    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.78, 5.2, 12), palmTrunkMat);
    trunk.position.y = 2.6;
    trunk.castShadow = true;
    var crownMain = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 14), darkLeafMat);
    crownMain.position.set(0, 6.2, 0);
    var crownL = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 12), palmFrondMat);
    crownL.position.set(-1.6, 5.6, 0.7);
    var crownR = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 12), palmLimeMat);
    crownR.position.set(1.6, 5.7, -0.6);
    jfTree.add(trunk, crownMain, crownL, crownR);

    for (var ji = 0; ji < 6; ji++) {
      var jAng = (ji / 6) * Math.PI * 2;
      var jf = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 10, 10),
        ji % 2 === 0 ? jackfruitSkinMat : jackfruitGoldMat
      );
      jf.scale.set(0.85, 1.45, 0.85);
      var rDist = (ji < 3) ? 0.78 : 1.55;
      var yHeight = (ji < 3) ? (2.2 + ji * 0.65) : (4.1 + (ji % 2) * 0.45);
      jf.position.set(Math.cos(jAng) * rDist, yHeight, Math.sin(jAng) * rDist);
      jfTree.add(jf);
    }
    g.add(jfTree);
  }

  [
    [12.2, -4.5, 1.15],
    [12.4,  4.8, 1.18],
    [21.6, -3.2, 1.14],
    [21.5,  8.8, 1.16],
    [13.0, -14.0, 1.10]
  ].forEach(function(jp) {
    addJackfruitTree(jp[0], jp[1], jp[2]);
  });

  scene.add(g);

  // 9. HERO VIETNAMESE MOM (WITH JET-BLACK HAIR) & DAD WAVING IN FRONT OF THEIR BUNGALOW!
  var cosH = Math.cos(houseRotY);
  var sinH = Math.sin(houseRotY);
  function placeParentInGarden(role, localX, localZ, yawOff) {
    var wx = mx + localX * cosH + localZ * sinH;
    var wz = mz - localX * sinH + localZ * cosH;
    return buildDetailedFamilyPerson(role, wx, wz, houseRotY + (yawOff || 0), 2.08);
  }
  placeParentInGarden('dad', -2.4, 13.8, 0.08);
  placeParentInGarden('mom',  2.4, 13.8, -0.08);

  // Handled by the Unified 4-Landmark Centered Camera in `installModelsFrameEnhancer()`
  window.momHouseWorldCenter = new THREE.Vector3(mx, my, mz);
})();

// 7. GRANDMA & GRANDPA'S 3-STORY YELLOW HOUSE IN BOHUMÍN (`J_NORTH -> J_NE` at x = 148, z = -226)
//    - Standing on flat level ground ("postav ho na rovinu")
//    - 3-story yellow house ("udělej ho žlutý se třemi patry")
//    - Municipal sign "BOHUMÍN" beside the house ("vedle domu dej i ceduli BOHUMÍN")
//    - Two parked cars beside the house:
//      1) White 2001 Škoda Fabia ("bílá škoda fabia rok výroby 2001")
//      2) Metallic Green 2000 Renault Mégane ("renault megane rok výroby 2000 zelená metalíza")
//    - Kaufland hypermarket in the background ("V pozadí je kaufland")
(function buildGrandmaAndGrandpaHouseLandmark() {
  var gx = 148, gz = -226;
  var gy = 3.20; // Matches natural Bohumín terrain height so the J_NORTH->J_NE railway track is never buried!
  var g = new THREE.Group();
  g.position.set(gx, gy, gz);
  var houseRotY = -0.32;
  g.rotation.y = houseRotY;

  var grandmaSunLight = new THREE.PointLight(0xfff7ed, 0.26, 75);
  grandmaSunLight.position.set(0, 22, 18);
  g.add(grandmaSunLight);

  // Procedural Terracotta Roof Tile Texture
  function createGrandmaRoofTileTex() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(0, 0, 512, 512);
    var cols = 8, rows = 8;
    var cw = 512 / cols, rh = 512 / rows;
    for (var r = 0; r < rows; r++) {
      for (var col = 0; col < cols; col++) {
        var x = col * cw, y = r * rh;
        var gTile = ctx.createLinearGradient(x, y, x + cw, y);
        gTile.addColorStop(0.0, '#7c2d12');
        gTile.addColorStop(0.3, '#b45309');
        gTile.addColorStop(0.55, ((r + col) % 2 === 0) ? '#ea580c' : '#d97706');
        gTile.addColorStop(0.85, '#9a3412');
        gTile.addColorStop(1.0, '#431407');
        ctx.fillStyle = gTile;
        ctx.fillRect(x, y, cw, rh);
      }
    }
    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c, 2.5, 2.0) : new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  var roofTileTex     = createGrandmaRoofTileTex();
  var cottageRoofMat  = new THREE.MeshStandardMaterial({ map: roofTileTex, color: 0xea580c, roughness: 0.42, metalness: 0.05 });
  var yellowWallMat   = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.40 }); // Sunny Yellow 3-Story Facade!
  var yellowAccentMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.38 });
  var stonePlinthMat  = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.65 });
  var timberMat       = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.58 });
  var greenShutterMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.38 });
  var warmWinMat      = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var whiteTrimMat    = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32 });
  var asphaltMat      = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.72 });

  // 1. Wide Flat Bohumín Meadow Pad & Paved Driveway for the 2 Cars
  var gardenPad = new THREE.Mesh(
    new THREE.CylinderGeometry(38.0, 40.0, 0.60, 44),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.70 })
  );
  gardenPad.position.y = 0.22;
  g.add(gardenPad);

  var driveway = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.34, 15.0), asphaltMat);
  driveway.position.set(17.2, 0.48, 6.2);
  g.add(driveway);

  // 2. 3-STORY YELLOW HOUSE ("udělej ho žlutý se třemi patry")
  var plinth = new THREE.Mesh(new THREE.BoxGeometry(18.2, 1.6, 13.8), stonePlinthMat);
  plinth.position.y = 1.0;
  var yellowHouseBody = new THREE.Mesh(new THREE.BoxGeometry(17.6, 14.4, 13.2), yellowWallMat);
  yellowHouseBody.position.y = 8.8; // 3 full stories: y = 1.6 -> 16.0m!
  yellowHouseBody.castShadow = true;
  g.add(plinth, yellowHouseBody);

  // Crisp White Horizontal Cornice Bands dividing Floor 1, Floor 2 & Floor 3 + Corner Pilasters
  [6.2, 10.8, 15.8].forEach(function(cyBand) {
    var band = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.38, 13.6), whiteTrimMat);
    band.position.y = cyBand;
    g.add(band);
  });
  [[-8.75, -6.55], [8.75, -6.55], [-8.75, 6.55], [8.75, 6.55]].forEach(function(cp) {
    var pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.65, 14.5, 0.65), yellowAccentMat);
    pilaster.position.set(cp[0], 8.8, cp[1]);
    g.add(pilaster);
  });

  // Pitched Hip/Gable Terracotta Roof on Top of the 3rd Story (y = 16.0m)
  var roofGroup = new THREE.Group();
  roofGroup.position.y = 16.0;
  var roofPitch = 0.54;
  var slopeW = 9.8;
  var roofSpanX = 19.2;
  [-1, 1].forEach(function(sideZ) {
    var slopePivot = new THREE.Group();
    slopePivot.position.set(0, 2.5, sideZ * 3.8);
    slopePivot.rotation.x = sideZ * roofPitch;
    var deck = new THREE.Mesh(new THREE.BoxGeometry(roofSpanX, 0.52, slopeW), cottageRoofMat);
    slopePivot.add(deck);
    roofGroup.add(slopePivot);
  });
  [-8.6, 8.6].forEach(function(gxSide) {
    for (var gs = 0; gs < 6; gs++) {
      var gw = 13.0 * (1 - gs / 6);
      var gSl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, gw), yellowWallMat);
      gSl.position.set(gxSide, 0.42 + gs * 0.78, 0);
      roofGroup.add(gSl);
    }
  });
  var chimney = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6.5, 2.2), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.65 }));
  chimney.position.set(-5.5, 4.2, -1.8);
  roofGroup.add(chimney);
  g.add(roofGroup);

  // 3 Rows of Windows across All 3 Floors (1st Floor y = 3.9, 2nd Floor y = 8.5, 3rd Floor y = 13.2)
  var flowerCols = [0xf43f5e, 0xec4899, 0xa855f7, 0xef4444];
  [3.9, 8.5, 13.2].forEach(function(wy, floorIdx) {
    [-5.4, 0.0, 5.4].forEach(function(wx, colIdx) {
      if (floorIdx === 0 && colIdx === 1) return; // Ground-floor center has the front door
      var winFrame = new THREE.Mesh(new THREE.BoxGeometry(2.65, 2.55, 0.36), whiteTrimMat);
      winFrame.position.set(wx, wy, 6.64);
      var winGlass = new THREE.Mesh(new THREE.BoxGeometry(2.25, 2.15, 0.42), warmWinMat);
      winGlass.position.set(wx, wy, 6.68);
      var shL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.48, 0.42), greenShutterMat);
      shL.position.set(wx - 1.62, wy, 6.70);
      var shR = shL.clone();
      shR.position.x = wx + 1.62;
      var planter = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.52, 0.72), timberMat);
      planter.position.set(wx, wy - 1.42, 6.95);
      g.add(winFrame, winGlass, shL, shR, planter);

      for (var fb = -1; fb <= 1; fb++) {
        var flBall = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 8, 8),
          new THREE.MeshBasicMaterial({ color: flowerCols[(floorIdx + colIdx + fb + 3) % flowerCols.length] })
        );
        flBall.position.set(wx + fb * 0.72, wy - 0.98, 7.05);
        g.add(flBall);
      }
    });
  });

  // Ground-Floor Entrance Porch & 2nd-Floor Balcony with White Balustrade
  var porchDeck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.75, 3.6), stonePlinthMat);
  porchDeck.position.set(0, 0.65, 8.2);
  var balconySlab = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.45, 3.8), whiteTrimMat);
  balconySlab.position.set(0, 6.2, 8.2);
  var balconyRail = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.15, 0.22), whiteTrimMat);
  balconyRail.position.set(0, 6.95, 9.95);
  [-3.2, 3.2].forEach(function(px) {
    var pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 5.2, 12), whiteTrimMat);
    pCol.position.set(px, 3.4, 9.7);
    g.add(pCol);
  });
  var doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.1, 4.4, 0.36), whiteTrimMat);
  doorFrame.position.set(0, 3.2, 6.66);
  var frontDoor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.1, 0.44), timberMat);
  frontDoor.position.set(0, 3.1, 6.72);
  g.add(porchDeck, balconySlab, balconyRail, doorFrame, frontDoor);

  // 3. CZECH MUNICIPAL SIGN "BOHUMÍN" ("a vedle domu dej i ceduli BOHUMÍN")
  (function buildBohuminSign() {
    var signG = new THREE.Group();
    signG.position.set(-13.8, 0.45, 11.8);
    signG.rotation.y = 0.22;

    var c = document.createElement('canvas');
    c.width = 512; c.height = 192;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 172);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOHUMÍN', 256, 100);

    var bTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
    var signMat = new THREE.MeshBasicMaterial({ map: bTex });
    var signBacking = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.0, 0.28), stonePlinthMat);
    signBacking.position.y = 4.4;
    var signFront = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 2.85), signMat);
    signFront.position.set(0, 4.4, 0.16);
    var signBack = signFront.clone();
    signBack.rotation.y = Math.PI;
    signBack.position.z = -0.16;

    [-3.0, 3.0].forEach(function(px) {
      var post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 4.5, 10), stonePlinthMat);
      post.position.set(px, 2.25, 0);
      signG.add(post);
    });
    signG.add(signBacking, signFront, signBack);
    g.add(signG);
  })();

  // 4. TWO HIGH-CRAFT ICONIC REAL-WORLD CARS BESIDE GRANDMA'S HOUSE IN BOHUMÍN:
  //    ("4. U domečku od babičky prosím o vylepšení aut fabia a megane, aby byly v krásné grafice a šlo podle tvaru a detailů poznat, že se opravdu jedná o tato vozidla.")
  //    - White 2001 Škoda Fabia Mk1 (6Y) 5-Door Hatchback ("bílá škoda fabia rok výroby 2001")
  //    - Metallic Emerald Green 2000 Renault Mégane Mk1 Phase 2 ("renault megane rok výroby 2000 zelená metalíza")
  function createBohuminCarFrontFasciaTex(isFabia) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');

    if (isFabia) {
      // Candy White 2001 Škoda Fabia Mk1 Front Fascia
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 256);

      // Black protective bumper impact strip & lower air dam with fog lights
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(24, 142, 464, 24);
      ctx.fillRect(68, 186, 376, 46);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(115, 202); ctx.lineTo(397, 202);
      ctx.moveTo(115, 216); ctx.lineTo(397, 216);
      ctx.stroke();
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(76, 194, 42, 28);
      ctx.fillRect(394, 194, 42, 28);

      // Iconic 2001 Škoda Fabia Trapezoidal Chrome-Surround Grille with Vertical Slats
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(156, 48); ctx.lineTo(356, 48);
      ctx.lineTo(344, 122); ctx.lineTo(168, 122);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(168, 58); ctx.lineTo(344, 58);
      ctx.lineTo(334, 114); ctx.lineTo(178, 114);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      for (var gx = 182; gx <= 330; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, 60); ctx.lineTo(gx, 112);
        ctx.stroke();
      }

      // Round Škoda Green Winged-Arrow Emblem on top chrome grille boss
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(256, 54, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(256, 54, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath(); ctx.arc(256, 54, 12, 0, Math.PI * 2); ctx.fill();

      // Clear-lens Rectangular-Trapezoidal Halogen Headlamps + Amber Corner Indicators
      [[34, 148, true], [364, 478, false]].forEach(function(hl) {
        var x0 = hl[0], x1 = hl[1], isLeft = hl[2];
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x0, 54, x1 - x0, 66);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.strokeRect(x0, 54, x1 - x0, 66);
        ctx.fillStyle = '#f59e0b';
        if (isLeft) ctx.fillRect(x0 + 4, 58, 26, 58);
        else ctx.fillRect(x1 - 30, 58, 26, 58);
        ctx.fillStyle = '#fefce8';
        ctx.beginPath();
        ctx.arc(isLeft ? x0 + 58 : x1 - 58, 87, 22, 0, Math.PI * 2);
        ctx.arc(isLeft ? x0 + 94 : x1 - 94, 87, 16, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Emerald Metallic Green 2000 Renault Mégane Mk1 Phase 2 Front Fascia
      ctx.fillStyle = '#047857';
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(28, 146, 456, 20);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(84, 184, 344, 46, 22);
      else ctx.rect(84, 184, 344, 46);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(112, 207, 16, 0, Math.PI * 2);
      ctx.arc(400, 207, 16, 0, Math.PI * 2);
      ctx.fill();

      // Signature 2000 Renault Mégane Phase-2 Twin Split "Bird-Beak" Honeycomb Grilles
      [146, 278].forEach(function(gx) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(gx, 64, 88, 52, 14);
        else ctx.rect(gx, 64, 88, 52);
        ctx.fill();
        ctx.stroke();
      });

      // Central Chrome Renault Diamond ("Kosočtverec") Emblem on the Nose Beak
      ctx.save();
      ctx.translate(256, 92);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -26); ctx.lineTo(20, 0); ctx.lineTo(0, 26); ctx.lineTo(-20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 12); ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Swept-Back Almond "Cat-Eye" Headlamps with Inner Amber Turn Signals
      [[32, 138, true], [374, 480, false]].forEach(function(hl) {
        var x0 = hl[0], x1 = hl[1], isLeft = hl[2];
        var cx = (x0 + x1) * 0.5;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(cx, 88, 54, 30, isLeft ? 0.12 : -0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(isLeft ? cx - 12 : cx + 12, 88, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(isLeft ? cx + 26 : cx - 26, 90, 13, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  function createBohuminCarRearFasciaTex(isFabia) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = isFabia ? '#f8fafc' : '#047857';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 168, 464, 24);

    if (isFabia) {
      // Iconic 2001 Škoda Fabia Mk1 Tall Vertical Red-White-Red Tail Light Clusters
      [28, 412].forEach(function(tx) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(tx, 28, 72, 124);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(tx + 10, 68, 52, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(tx + 10, 92, 52, 18);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 4;
        ctx.strokeRect(tx, 28, 72, 124);
      });
      ctx.fillStyle = '#16a34a';
      ctx.beginPath(); ctx.arc(256, 62, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FABIA', 356, 136);
    } else {
      // 2000 Renault Mégane Mk1 Phase 2 Curved Wrap-Around Red/Tinted Tail Lights
      [26, 396].forEach(function(tx) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(tx, 46, 90, 96, 22);
        else ctx.rect(tx, 46, 90, 96);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(tx + 12, 82, 66, 22);
      });
      ctx.save();
      ctx.translate(256, 64);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(14, 0); ctx.lineTo(0, 18); ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MÉGANE', 256, 136);
    }

    return window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
  }

  function createDetailedAlloyWheel(radius, width) {
    var wg = new THREE.Group();
    var tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.82 });
    var alloyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.78 });
    var darkHubMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });

    var tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 24), tireMat);
    tire.rotation.z = Math.PI / 2;
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, width + 0.04, 20), darkHubMat);
    rim.rotation.z = Math.PI / 2;
    var rimLip = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.66, 0.05, 8, 20), alloyMat);
    rimLip.rotation.y = Math.PI / 2;
    rimLip.position.x = width * 0.52;
    var rimLip2 = rimLip.clone();
    rimLip2.position.x = -width * 0.52;
    wg.add(tire, rim, rimLip, rimLip2);

    for (var sp = 0; sp < 5; sp++) {
      var sa = (sp / 5) * Math.PI * 2;
      var spoke = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, radius * 0.62, 0.11), alloyMat);
      spoke.rotation.x = sa;
      spoke.position.set(0, Math.cos(sa) * radius * 0.30, Math.sin(sa) * radius * 0.30);
      wg.add(spoke);
    }
    var centerCap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, width + 0.10, 12), alloyMat);
    centerCap.rotation.z = Math.PI / 2;
    wg.add(centerCap);
    return wg;
  }

  function buildParkedBohuminCar(modelType, localX, localZ) {
    var carG = new THREE.Group();
    carG.position.set(localX, 0.65, localZ);
    carG.scale.set(1.18, 1.18, 1.18);

    var isFabia = (modelType === 'fabia2001');
    var bodyMat = new THREE.MeshStandardMaterial(
      isFabia
        ? { color: 0xf8fafc, roughness: 0.20, metalness: 0.15 } // Candy White 2001 Škoda Fabia Mk1
        : { color: 0x047857, roughness: 0.18, metalness: 0.72 } // Emerald Metallic Green 2000 Renault Mégane Mk1 Phase 2
    );
    var trimBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 });
    var glassMat     = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.08, metalness: 0.45 });
    var darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.10, metalness: 0.60 });
    var chromeMat    = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.15, metalness: 0.88 });

    // 1. Authentic Sculpted 2D Side-Profile ExtrudeGeometry Car Body
    var profShape = new THREE.Shape();
    if (isFabia) {
      profShape.moveTo(-3.05, 0.48);
      profShape.lineTo( 3.05, 0.46);
      profShape.quadraticCurveTo(3.22, 0.78, 3.16, 1.28);
      profShape.lineTo( 1.55, 1.48);
      profShape.lineTo( 0.55, 2.52);
      profShape.lineTo(-2.15, 2.50);
      profShape.lineTo(-2.35, 2.54);
      profShape.lineTo(-2.98, 1.46);
      profShape.lineTo(-3.16, 1.05);
      profShape.closePath();
    } else {
      profShape.moveTo(-3.12, 0.48);
      profShape.lineTo( 3.12, 0.46);
      profShape.quadraticCurveTo(3.32, 0.82, 3.15, 1.20);
      profShape.quadraticCurveTo(2.30, 1.42, 1.42, 1.46);
      profShape.quadraticCurveTo(0.85, 2.15, 0.35, 2.44);
      profShape.quadraticCurveTo(-0.85, 2.56, -1.95, 2.34);
      profShape.quadraticCurveTo(-2.65, 1.92, -3.02, 1.42);
      profShape.quadraticCurveTo(-3.24, 1.05, -3.12, 0.48);
      profShape.closePath();
    }

    var bodyExtrude = new THREE.ExtrudeGeometry(profShape, {
      depth: 2.76,
      bevelEnabled: true,
      bevelThickness: 0.24,
      bevelSize: 0.20,
      bevelSegments: 4,
      curveSegments: 20
    });
    bodyExtrude.translate(0, 0, -1.38);
    bodyExtrude.rotateY(Math.PI / 2);
    var mainBodyMesh = new THREE.Mesh(bodyExtrude, bodyMat);
    mainBodyMesh.castShadow = true;
    mainBodyMesh.receiveShadow = true;
    carG.add(mainBodyMesh);

    // 2. Front & Rear High-Resolution Textured Fascia Plates + 3D Bumpers
    var frontFasciaMat = new THREE.MeshBasicMaterial({ map: createBohuminCarFrontFasciaTex(isFabia) });
    var rearFasciaMat  = new THREE.MeshBasicMaterial({ map: createBohuminCarRearFasciaTex(isFabia) });

    var frontFascia = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 1.02), frontFasciaMat);
    frontFascia.position.set(0, 1.02, 3.38);
    var rearFascia = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 1.05), rearFasciaMat);
    rearFascia.rotation.y = Math.PI;
    rearFascia.position.set(0, 1.08, -3.38);
    carG.add(frontFascia, rearFascia);

    var frontBumper = new THREE.Mesh(new THREE.BoxGeometry(3.16, 0.46, 0.42), bodyMat);
    frontBumper.position.set(0, 0.66, 3.25);
    var frontStrip = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.14, 0.46), trimBlackMat);
    frontStrip.position.set(0, 0.76, 3.26);
    var rearBumper = new THREE.Mesh(new THREE.BoxGeometry(3.16, 0.48, 0.42), bodyMat);
    rearBumper.position.set(0, 0.68, -3.25);
    var rearStrip = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.14, 0.46), trimBlackMat);
    rearStrip.position.set(0, 0.78, -3.26);
    carG.add(frontBumper, frontStrip, rearBumper, rearStrip);

    // 3. Glazed Front Windshield, Rear Heated Window & Side Door Windows with B/C Pillars
    var frontWindshield = new THREE.Mesh(new THREE.PlaneGeometry(2.58, 1.18), glassMat);
    frontWindshield.position.set(0, 2.02, isFabia ? 1.18 : 1.05);
    frontWindshield.rotation.x = isFabia ? -0.74 : -0.82;

    var rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.48, 1.08), darkGlassMat);
    rearWindow.position.set(0, 2.00, isFabia ? -2.56 : -2.42);
    rearWindow.rotation.x = isFabia ? (Math.PI + 0.56) : (Math.PI + 0.68);
    carG.add(frontWindshield, rearWindow);

    [-1, 1].forEach(function(sideSign) {
      var sx = sideSign * 1.62;
      var winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.76), glassMat);
      winFront.rotation.y = sideSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      winFront.position.set(sx, 2.02, 0.12);
      var winRear = new THREE.Mesh(new THREE.PlaneGeometry(isFabia ? 1.12 : 1.05, 0.74), glassMat);
      winRear.rotation.y = sideSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      winRear.position.set(sx, 2.02, -1.18);
      var bPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.80, 0.22), trimBlackMat);
      bPillar.position.set(sx, 2.02, -0.52);

      var sideMolding = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.13, 3.85), trimBlackMat);
      sideMolding.position.set(sx, 0.92, -0.10);

      var handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.34), isFabia ? trimBlackMat : bodyMat);
      handle1.position.set(sx, 1.42, -0.22);
      var handle2 = handle1.clone();
      handle2.position.set(sx, 1.42, -1.42);

      var mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.18), trimBlackMat);
      mirrorArm.position.set(sx + sideSign * 0.10, 1.66, 0.72);
      var mirrorHousing = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), bodyMat);
      mirrorHousing.scale.set(1.2, 0.75, 0.85);
      mirrorHousing.position.set(sx + sideSign * 0.24, 1.68, 0.68);

      [1.92, -1.95].forEach(function(wz) {
        var arch = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.12, 8, 16, Math.PI), bodyMat);
        arch.rotation.y = Math.PI / 2;
        arch.position.set(sx * 0.95, 0.68, wz);
        carG.add(arch);
      });

      carG.add(winFront, winRear, bPillar, sideMolding, handle1, handle2, mirrorArm, mirrorHousing);
    });

    if (isFabia) {
      var fabiaGrille3D = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.38, 0.14), chromeMat);
      fabiaGrille3D.position.set(0, 1.18, 3.36);
      var fabiaGrilleBlack = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.28, 0.16), trimBlackMat);
      fabiaGrilleBlack.position.set(0, 1.18, 3.37);
      var skodaRoundel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 14), new THREE.MeshBasicMaterial({ color: 0x16a34a }));
      skodaRoundel.rotation.x = Math.PI / 2;
      skodaRoundel.position.set(0, 1.34, 3.38);
      carG.add(fabiaGrille3D, fabiaGrilleBlack, skodaRoundel);
    } else {
      var meganeBeak = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 1.65), bodyMat);
      meganeBeak.position.set(0, 1.40, 2.38);
      meganeBeak.rotation.x = 0.11;
      var renaultDiamond3D = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.16), chromeMat);
      renaultDiamond3D.rotation.z = Math.PI / 4;
      renaultDiamond3D.position.set(0, 1.16, 3.38);
      carG.add(meganeBeak, renaultDiamond3D);
    }

    var antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.95, 6), trimBlackMat);
    antenna.position.set(0, 2.88, isFabia ? -1.85 : 0.15);
    antenna.rotation.x = -0.52;
    carG.add(antenna);

    var lpCanv = document.createElement('canvas');
    lpCanv.width = 256; lpCanv.height = 64;
    var lpCtx = lpCanv.getContext('2d');
    lpCtx.fillStyle = '#ffffff';
    lpCtx.fillRect(0, 0, 256, 64);
    lpCtx.fillStyle = '#1d4ed8';
    lpCtx.fillRect(0, 0, 30, 64);
    lpCtx.fillStyle = '#ffffff';
    lpCtx.font = 'bold 16px sans-serif';
    lpCtx.textAlign = 'center';
    lpCtx.fillText('CZ', 15, 52);
    lpCtx.strokeStyle = '#0f172a';
    lpCtx.lineWidth = 6;
    lpCtx.strokeRect(3, 3, 250, 58);
    lpCtx.fillStyle = '#0f172a';
    lpCtx.font = 'bold 32px sans-serif';
    lpCtx.fillText(isFabia ? 'FABIA 01' : 'MEGANE 00', 142, 43);
    var lpTex = new THREE.CanvasTexture(lpCanv);
    var lpFront = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.32), new THREE.MeshBasicMaterial({ map: lpTex }));
    lpFront.position.set(0, 0.62, 3.48);
    var lpRear = lpFront.clone();
    lpRear.rotation.y = Math.PI;
    lpRear.position.set(0, 0.72, -3.48);
    carG.add(lpFront, lpRear);

    [[-1.60, 1.92], [1.60, 1.92], [-1.60, -1.95], [1.60, -1.95]].forEach(function(wp) {
      var wh = createDetailedAlloyWheel(0.68, 0.44);
      wh.position.set(wp[0], 0.68, wp[1]);
      carG.add(wh);
    });
    if (typeof addContactShadow === 'function') {
      addContactShadow(carG, 3.8, 6.8, 0.04);
    }

    g.add(carG);
  }

  buildParkedBohuminCar('fabia2001',  14.2, 6.2);
  buildParkedBohuminCar('megane2000', 20.2, 6.2);

  // 5. KAUFLAND HYPERMARKET ~50M IN THE BACKGROUND ("Kaufland v Bohumíně by měl být v pozadí, asi 50m, ne hned u domu")
  (function buildKauflandHypermarket() {
    var kfG = new THREE.Group();
    kfG.position.set(4.0, 0.25, -66.0);

    var kfWhiteMat  = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.38 });
    var kfSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.35 });
    var kfRedMat    = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32 });
    var kfGlassMat  = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.78 });

    var mainHall = new THREE.Mesh(new THREE.BoxGeometry(38.0, 11.5, 16.5), kfSilverMat);
    mainHall.position.y = 5.75;
    mainHall.castShadow = true;
    var redRoofBand = new THREE.Mesh(new THREE.BoxGeometry(38.6, 1.85, 17.0), kfRedMat);
    redRoofBand.position.y = 11.2;
    var entranceTower = new THREE.Mesh(new THREE.BoxGeometry(14.5, 14.2, 17.6), kfWhiteMat);
    entranceTower.position.set(0, 7.1, 0.8);
    var entranceGlass = new THREE.Mesh(new THREE.BoxGeometry(11.5, 6.8, 1.2), kfGlassMat);
    entranceGlass.position.set(0, 3.6, 9.2);
    kfG.add(mainHall, redRoofBand, entranceTower, entranceGlass);

    // Giant Illuminated "KAUFLAND" Facade Sign & Tall Roadside Kaufland Pylon Tower!
    var kfCanv = document.createElement('canvas');
    kfCanv.width = 512; kfCanv.height = 160;
    var kctx = kfCanv.getContext('2d');
    kctx.fillStyle = '#ffffff';
    kctx.fillRect(0, 0, 512, 160);
    kctx.strokeStyle = '#dc2626';
    kctx.lineWidth = 14;
    kctx.strokeRect(7, 7, 498, 146);
    kctx.fillStyle = '#dc2626';
    kctx.fillRect(28, 28, 104, 104);
    kctx.fillStyle = '#ffffff';
    kctx.font = '900 76px sans-serif';
    kctx.textAlign = 'center';
    kctx.textBaseline = 'middle';
    kctx.fillText('K', 80, 82);
    kctx.fillStyle = '#dc2626';
    kctx.font = '900 68px sans-serif';
    kctx.fillText('Kaufland', 316, 84);

    var kfTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(kfCanv) : new THREE.CanvasTexture(kfCanv);
    var kfSignMat = new THREE.MeshBasicMaterial({ map: kfTex });

    var facadeSignBack = new THREE.Mesh(new THREE.BoxGeometry(16.5, 4.8, 0.65), kfRedMat);
    facadeSignBack.position.set(0, 16.5, 9.4);
    var facadeSignFront = new THREE.Mesh(new THREE.PlaneGeometry(16.0, 4.5), kfSignMat);
    facadeSignFront.position.set(0, 16.5, 9.78);
    kfG.add(facadeSignBack, facadeSignFront);

    var pylonMast = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 22.0, 14), stonePlinthMat);
    pylonMast.position.set(22.5, 11.0, 10.0);
    var pylonBox = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.4, 1.2), kfRedMat);
    pylonBox.position.set(22.5, 22.5, 10.0);
    var pylonFace1 = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 3.1), kfSignMat);
    pylonFace1.position.set(22.5, 22.5, 10.65);
    var pylonFace2 = pylonFace1.clone();
    pylonFace2.rotation.y = Math.PI;
    pylonFace2.position.z = 9.35;
    kfG.add(pylonMast, pylonBox, pylonFace1, pylonFace2);

    g.add(kfG);
  })();

  scene.add(g);

  // 6. Hero Grandma & Grandpa Waving in Front of Their 3-Story Yellow House in Bohumín!
  var cosG = Math.cos(houseRotY);
  var sinG = Math.sin(houseRotY);
  function placeGrandparentInGarden(role, localX, localZ, yawOff) {
    var wx = gx + localX * cosG + localZ * sinG;
    var wz = gz - localX * sinG + localZ * cosG;
    return buildDetailedFamilyPerson(role, wx, wz, houseRotY + (yawOff || 0), 2.02);
  }
  placeGrandparentInGarden('grandpa', -2.2, 13.8, 0.08);
  placeGrandparentInGarden('grandma',  2.2, 13.8, -0.08);

  // Handled by the Unified 4-Landmark Centered Camera in `installModelsFrameEnhancer()`
  window.grandmaHouseWorldCenter = new THREE.Vector3(gx + 2.0 * cosG, gy, gz - 2.0 * sinG);
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

// UPGRADED 3D FAIRYTALE SAILBOATS ON THE RIVER ("5. Prosím o vylepšení plachetnic, které plavou po řece")
window.boats = [];
(function buildDetailedRiverSailboats() {
  var hullColors  = [0x1d4ed8, 0xdc2626, 0x047857, 0xf59e0b, 0x7c3aed];
  var stripeCols  = [0xef4444, 0x38bdf8, 0xfacc15, 0xec4899, 0x10b981];
  var teakDeckMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.52 });
  var whiteHullMat= new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28 });
  var mastWoodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.42 });
  var brassMat    = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.78 });
  var glassPortMat= new THREE.MeshBasicMaterial({ color: 0xbae6fd });

  for (var bi = 0; bi < 5; bi++) {
    var bg = new THREE.Group();
    bg.scale.set(0.92, 0.92, 0.92);

    var hullColMat = new THREE.MeshStandardMaterial({ color: hullColors[bi % hullColors.length], roughness: 0.30, metalness: 0.15 });
    var sailAccentMat = new THREE.MeshStandardMaterial({ color: stripeCols[bi % stripeCols.length], roughness: 0.38, side: THREE.DoubleSide });
    var sailCreamMat  = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.38, side: THREE.DoubleSide });

    // Sculpted Yacht Hull: Main Midship + Tapered Bow Cone + White Gunwale Trim + Teak Deck
    var hullMid = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 1.55, 6.8, 16), hullColMat);
    hullMid.rotation.z = Math.PI / 2;
    hullMid.scale.set(0.55, 1.0, 1.0);
    hullMid.position.set(-0.4, 0.85, 0);

    var bowCone = new THREE.Mesh(new THREE.ConeGeometry(2.25, 3.6, 16), hullColMat);
    bowCone.rotation.z = -Math.PI / 2;
    bowCone.scale.set(0.55, 1.0, 1.0);
    bowCone.position.set(4.6, 0.85, 0);

    var gunwaleStripe = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 4.1), whiteHullMat);
    gunwaleStripe.position.set(0.4, 1.48, 0);

    var teakDeck = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.18, 3.8), teakDeckMat);
    teakDeck.position.set(0.3, 1.62, 0);

    // Cozy Yacht Cabin with Porthole Windows & Lifebuoy Ring
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.15, 2.5), whiteHullMat);
    cabin.position.set(-0.6, 2.22, 0);
    var cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.20, 2.7), teakDeckMat);
    cabinRoof.position.set(-0.6, 2.85, 0);
    [-0.8, 0.4].forEach(function(px) {
      [-1.28, 1.28].forEach(function(pz) {
        var portRim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), brassMat);
        portRim.rotation.x = Math.PI / 2;
        portRim.position.set(px, 2.25, pz);
        var portGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.15, 12), glassPortMat);
        portGlass.rotation.x = Math.PI / 2;
        portGlass.position.set(px, 2.25, pz);
        bg.add(portRim, portGlass);
      });
    });

    var lifebuoy = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 8, 16), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    lifebuoy.rotation.y = Math.PI / 2;
    lifebuoy.position.set(-2.35, 2.25, 0);

    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.20, 11.2, 12), mastWoodMat);
    mast.position.set(0.8, 7.2, 0);
    var boom = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 5.2, 10), mastWoodMat);
    boom.rotation.z = Math.PI / 2;
    boom.position.set(-1.6, 3.3, 0);
    var bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.8, 8), mastWoodMat);
    bowsprit.rotation.z = -Math.PI / 2 + 0.22;
    bowsprit.position.set(6.4, 1.85, 0);

    // Billowing Curved 3D Mainsail + Colorful Regatta Accent Band + Forward Headsail (Jib)
    var mainSail = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 3.6, 7.8, 16, 1, true, -0.42, 0.84),
      sailCreamMat
    );
    mainSail.position.set(-0.9, 7.4, -2.2);
    mainSail.scale.set(1.0, 1.0, 0.35);

    var mainSailStripe = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.2, 1.35, 16, 1, true, -0.42, 0.84),
      sailAccentMat
    );
    mainSailStripe.position.set(-0.9, 6.2, -2.22);
    mainSailStripe.scale.set(1.02, 1.0, 0.36);

    var jibSail = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 7.2, 12, 1, true, 0, Math.PI),
      sailAccentMat
    );
    jibSail.scale.set(1.15, 1.0, 0.28);
    jibSail.position.set(3.4, 6.5, 0);
    jibSail.rotation.z = 0.22;

    var pennant = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.6, 4), sailAccentMat);
    pennant.rotation.z = Math.PI / 2;
    pennant.position.set(0.0, 12.6, 0);

    bg.add(hullMid, bowCone, gunwaleStripe, teakDeck, cabin, cabinRoof, lifebuoy, mast, boom, bowsprit, mainSail, mainSailStripe, jibSail, pennant);
    scene.add(bg);
    boats.push({ mesh: bg, x: -240 + bi * 75, dir: bi % 2 === 0 ? 1 : -1, speed: 0.22 });
  }
})();

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

// 8. FULL 3D FOOTBALL STADIUM BOWL WITH FLOODLIGHTS & ANIMATED 3D CARTOON PLAYERS (`J_SOUTH -> J_SW` at x = -115, z = 282)
window.soccerPlayers = [];
var stadG = new THREE.Group();
var stX = -115, stZ = 282;
var stY = terrainY(stX, stZ);
stadG.position.set(stX, stY, stZ);

var stPromenade = new THREE.Mesh(
  new THREE.BoxGeometry(10.5, 0.36, 22.0),
  new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55 })
);
stPromenade.position.set(6.0, 0.18, -42.0);
stadG.add(stPromenade);

// Striped Mowed Grass Pitch Texture
(function() {
  var pc = document.createElement('canvas');
  pc.width = 256; pc.height = 256;
  var pctx = pc.getContext('2d');
  for (var stp = 0; stp < 8; stp++) {
    pctx.fillStyle = (stp % 2 === 0) ? '#16a34a' : '#22c55e';
    pctx.fillRect(0, stp * 32, 256, 32);
  }
  pctx.strokeStyle = '#ffffff';
  pctx.lineWidth = 4;
  pctx.strokeRect(24, 16, 208, 224);
  pctx.strokeRect(76, 16, 104, 42);
  pctx.strokeRect(76, 198, 104, 42);
  var pitchTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(pc) : new THREE.CanvasTexture(pc);
  var pitch = new THREE.Mesh(new THREE.CylinderGeometry(24, 25, 1.2, 40), new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.72 }));
  pitch.position.y = 0.3;
  stadG.add(pitch);
})();

var centerCircle = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.18, 8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
centerCircle.rotation.x = Math.PI / 2;
centerCircle.position.y = 0.92;
var halfwayLine = new THREE.Mesh(new THREE.BoxGeometry(36, 0.12, 0.32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
halfwayLine.position.y = 0.92;

// Tiered Stadium Grandstand Bowl, Exterior Architectural Ribbing & Wide Open-Bowl Roof Canopy Rim
var lowerStand = new THREE.Mesh(
  new THREE.CylinderGeometry(28.5, 24.5, 5.5, 40, 1, true),
  new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, side: THREE.DoubleSide })
);
lowerStand.position.y = 3.2;
var upperStand = new THREE.Mesh(
  new THREE.CylinderGeometry(33.0, 28.5, 6.2, 40, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5, side: THREE.DoubleSide })
);
upperStand.position.y = 8.8;
var outerFacade = new THREE.Mesh(
  new THREE.CylinderGeometry(33.6, 33.6, 11.8, 40, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide })
);
outerFacade.position.y = 6.0;
var stadiumCanopy = new THREE.Mesh(
  new THREE.RingGeometry(27.8, 34.4, 40),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, side: THREE.DoubleSide })
);
stadiumCanopy.rotation.x = -Math.PI / 2;
stadiumCanopy.position.y = 12.0;

var stRibMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.3 });
for (var sri = 0; sri < 20; sri++) {
  var srAng = (sri / 20) * Math.PI * 2;
  var rib = new THREE.Mesh(new THREE.BoxGeometry(0.85, 12.2, 1.4), stRibMat);
  rib.position.set(Math.cos(srAng) * 33.9, 6.1, Math.sin(srAng) * 33.9);
  rib.rotation.y = -srAng + Math.PI * 0.5;
  stadG.add(rib);
}

[-16.5, 16.5].forEach(function(gz) {
  var goal = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.8, 1.8), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true }));
  goal.position.set(0, 2.2, gz);
  stadG.add(goal);
});

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

window.soccerBall = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
soccerBall.position.y = 1.45;
stadG.add(centerCircle, halfwayLine, lowerStand, upperStand, outerFacade, stadiumCanopy, soccerBall);

// 6 Hero-Scale 3D Cartoon Soccer Players clearly visible from the high aerial camera!
(function() {
  var S = getPersonShared();
  var whiteShortsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  for (var spi = 0; spi < 6; spi++) {
    var spGroup = new THREE.Group();
    spGroup.position.y = 0.9;
    spGroup.scale.set(1.22, 1.22, 1.22);
    var jerseyMat = new THREE.MeshStandardMaterial({ color: spi < 3 ? 0xef4444 : 0x2563eb, roughness: 0.42 });
    var hairM = S.hairMats[spi % S.hairMats.length];

    [-0.18, 0.18].forEach(function(lx) {
      var leg = new THREE.Mesh(S.legGeo, S.skinMat);
      leg.position.set(lx, 0.55, 0);
      var boot = new THREE.Mesh(S.shoeGeo, S.shoeMat);
      boot.scale.set(0.9, 0.6, 1.4);
      boot.position.set(lx, 0.12, 0.10);
      spGroup.add(leg, boot);
    });
    var shorts = new THREE.Mesh(S.hipsGeo, whiteShortsMat);
    shorts.position.y = 1.12;
    var torso = new THREE.Mesh(S.torsoGeo, jerseyMat);
    torso.position.y = 1.75;
    var head = new THREE.Mesh(S.headGeo, S.skinMat);
    head.position.y = 2.75;
    var hair = new THREE.Mesh(S.hairCapGeo, hairM);
    hair.position.set(0, 2.82, -0.04);
    hair.rotation.x = -0.24;
    [-1, 1].forEach(function(side) {
      var eye = new THREE.Mesh(S.pupilGeo, S.pupilMat);
      eye.position.set(side * 0.16, 2.82, 0.48);
      var arm = new THREE.Mesh(S.armGeo, jerseyMat);
      arm.position.set(side * 0.52, 1.75, 0);
      arm.rotation.z = side * -0.25;
      spGroup.add(eye, arm);
    });
    spGroup.add(shorts, torso, head, hair);
    stadG.add(spGroup);
    soccerPlayers.push({ mesh: spGroup, angle: (spi / 6) * Math.PI * 2, radius: 7.5 + (spi % 2) * 6.5 });
  }
})();
scene.add(stadG);

// High aerial stadium camera perspective ("pohled z větší výšky, aby šli vidět fotbalisté jak hrají")
window.registerLandmarkShowcase('J_SOUTH', 'J_SW', {
  lookTarget: new THREE.Vector3(stX, stY + 2.0, stZ),
  camHeight: 74,
  camBack: 54,
  camSide: -38,
  lookLerp: 0.58
});

// Self-contained Animation Loop for Jumping Fish & Crawling Crabs in Mom & Dad's Vietnamese Stream
(function startVietnamStreamWildlifeAnim() {
  function tickVietnamWildlife() {
    var t = performance.now() * 0.001;
    if (window.vietnamJumpingFish && window.vietnamJumpingFish.length) {
      for (var fi = 0; fi < window.vietnamJumpingFish.length; fi++) {
        var fObj = window.vietnamJumpingFish[fi];
        var cycle = (t * 1.45 + fObj.phase) % (Math.PI * 2);
        var jumpSin = Math.sin(cycle);
        if (jumpSin > 0) {
          fObj.mesh.position.y = 0.25 + jumpSin * 2.35;
          fObj.mesh.position.z = fObj.baseZ + Math.cos(cycle) * 1.25;
          fObj.mesh.rotation.x = -Math.cos(cycle) * 0.95;
        } else {
          fObj.mesh.position.y = 0.12;
          fObj.mesh.rotation.x = 0;
        }
      }
    }
    if (window.vietnamCrawlingCrabs && window.vietnamCrawlingCrabs.length) {
      for (var ci = 0; ci < window.vietnamCrawlingCrabs.length; ci++) {
        var cObj = window.vietnamCrawlingCrabs[ci];
        var scurry = Math.sin(t * 2.2 + cObj.phase);
        cObj.mesh.position.z = cObj.baseZ + scurry * 1.65;
        cObj.mesh.rotation.z = Math.sin(t * 8.5 + cObj.phase) * 0.10;
      }
    }
    requestAnimationFrame(tickVietnamWildlife);
  }
  requestAnimationFrame(tickVietnamWildlife);
})();

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

// ============================================================================
// METRO RAMP TRACK ISOLATION, DEADLOCK-FREE JUNCTIONS & CAMERA CHOREOGRAPHY
// ============================================================================
// 1) Move underground metro ramp track meshes (sleepers, rails, ballast outside the cavern `|x| > 63.0`)
//    into their own Metro Line's `rampTunnelGroup` so the two diagonal metro lines NEVER cross tracks inside the tunnel!
(function isolateMetroRampTrackMeshes() {
  if (!window.undergroundWorldGroup || !window.subwayEdges || window.subwayEdges.length < 3) return;
  var line0 = window.subwayEdges[0];
  var line2 = window.subwayEdges[2];
  if (!line0 || !line2 || !line0.rampTunnelGroup || !line2.rampTunnelGroup) return;

  function minCurveDistSq(pt, curve) {
    var best = 999999999;
    for (var i = 0; i <= 48; i++) {
      var u = 0.18 + (i / 48) * 0.64;
      var cp = curve.getPointAt(u);
      var dSq = (pt.x - cp.x) * (pt.x - cp.x) + (pt.y - cp.y) * (pt.y - cp.y) + (pt.z - cp.z) * (pt.z - cp.z);
      if (dSq < best) best = dSq;
    }
    return best;
  }

  var childrenCopy = window.undergroundWorldGroup.children.slice();
  for (var ci = 0; ci < childrenCopy.length; ci++) {
    var ch = childrenCopy[ci];
    if (ch && ch.isMesh && Math.abs(ch.position.x) > 63.0 && ch.position.y > -28.0) {
      var d0 = minCurveDistSq(ch.position, line0.curve);
      var d2 = minCurveDistSq(ch.position, line2.curve);
      if (d0 <= d2) {
        line0.rampTunnelGroup.add(ch);
      } else {
        line2.rampTunnelGroup.add(ch);
      }
    }
  }
})();

// 1B) Fix 3-Branch Railway Junction Routing (`window.getBranches`) & Rebuild 3D Junction Direction Signs
//     Guarantees that at 3-way junctions (such as `J_SE` before Jewel on `J_SOUTH->J_SE` and `J_NORTH`),
//     all 3 branches (`left`, `straight`, `right`) are 100% distinct:
//     - On `J_SOUTH->J_SE`: Left (`⬅`) = Metro 3->1, Straight (`⬆`) = Jewel Hypermarket (`J_SE->J_EAST`), Right (`➡`) = Egypt Pyramids!
(function fixThreeWayJunctionBranchesAndSigns() {
  if (typeof edges === 'undefined' || !edges || !edges.length) return;

  window.getBranches = function(currentEdge) {
    var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
    var node = baseEdge.to;
    var p1 = baseEdge.curve.getPointAt(0.84);
    var inDir = baseEdge.curve.getTangentAt(0.84).normalize();

    var candidates = edges.filter(function(e) {
      if (e.from !== node || e.to === baseEdge.from) return false;
      return true;
    });
    if (candidates.length === 0) {
      candidates = edges.filter(function(e) { return e.from === node && !e.isSubway; });
    }

    var scored = candidates.map(function(e) {
      var p2 = e.curve.getPointAt(0.18);
      var outDir = p2.clone().sub(p1).normalize();
      var cross = inDir.x * outDir.z - inDir.z * outDir.x;
      var dot = inDir.x * outDir.x + inDir.z * outDir.z;
      var angle = Math.atan2(cross, dot);
      return { edge: e, angle: angle };
    });

    scored.sort(function(a, b) { return a.angle - b.angle; });

    if (scored.length >= 3) {
      var midCandidates = scored.slice(1, scored.length - 1);
      var midBest = midCandidates.reduce(function(best, cur) {
        return Math.abs(cur.angle) < Math.abs(best.angle) ? cur : best;
      }, midCandidates[0]);
      return {
        left: scored[0].edge,
        straight: midBest.edge,
        right: scored[scored.length - 1].edge
      };
    }

    var straight = scored.reduce(function(best, cur) {
      return Math.abs(cur.angle) < Math.abs(best.angle) ? cur : best;
    }, scored[0]).edge;

    return {
      left: scored[0].edge,
      straight: straight,
      right: scored[scored.length - 1].edge
    };
  };

  // Rebuild `window.junctionSignsGroup` so all 3D junction signposts reflect the complete 3-way branches
  if (window.junctionSignsGroup) {
    while (window.junctionSignsGroup.children.length > 0) {
      window.junctionSignsGroup.remove(window.junctionSignsGroup.children[0]);
    }

    function getBranchDestinationInfo(bEdge) {
      if (!bEdge) return { icon: 'fountain', badgeCol: '#0284c7' };
      if (bEdge.isSubway) return { icon: 'metro', badgeCol: '#2563eb' };
      if (bEdge.to === 'EXIT_ALPS') return { icon: 'alps', badgeCol: '#0284c7' };
      if (bEdge.to === 'EXIT_EGYPT') return { icon: 'egypt', badgeCol: '#ca8a04' };
      var stIcon = (bEdge.station && bEdge.station.icon) ? bEdge.station.icon : '';
      var badgeColors = {
        eiffel: '#b45309',
        grandma_house: '#be185d',
        airport: '#0284c7',
        jewel: '#0d9488',
        colosseum: '#c2410c',
        stadium: '#15803d',
        bigben: '#a16207',
        mom_house: '#e11d48',
        skyscraper: '#1d4ed8',
        fountain: '#0369a1'
      };
      if (stIcon && badgeColors[stIcon]) {
        return { icon: stIcon, badgeCol: badgeColors[stIcon] };
      }
      return { icon: 'fountain', badgeCol: '#0284c7' };
    }

    function drawBigDirectionArrow(ctx, dirType, cx, cy, size) {
      ctx.save();
      ctx.translate(cx, cy);
      if (dirType === 'left') ctx.rotate(-Math.PI * 0.5);
      else if (dirType === 'right') ctx.rotate(Math.PI * 0.5);

      var s = size * 0.52;
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.92, -s * 0.05);
      ctx.lineTo(s * 0.42, -s * 0.05);
      ctx.lineTo(s * 0.42, s * 0.92);
      ctx.lineTo(-s * 0.42, s * 0.92);
      ctx.lineTo(-s * 0.42, -s * 0.05);
      ctx.lineTo(-s * 0.92, -s * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    function drawPictogramIcon(ctx, iconType, cx, cy, r) {
      if (window.drawLandmarkPictogram) {
        window.drawLandmarkPictogram(ctx, iconType, cx, cy, r);
        return;
      }
      if (iconType === 'metro' && window.drawPragueMetroSymbol) {
        window.drawPragueMetroSymbol(ctx, cx, cy, r, '#d9261c');
      }
    }

    function createJunctionSignCanvas(rows) {
      var rowH = 168;
      var padY = 20;
      var c = document.createElement('canvas');
      c.width = 520;
      c.height = padY * 2 + rows.length * rowH;
      var ctx = c.getContext('2d');

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 12;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(8, 8, c.width - 16, c.height - 16, 34);
      else ctx.rect(8, 8, c.width - 16, c.height - 16);
      ctx.fill();
      ctx.stroke();

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var ry = padY + i * rowH;
        var cardH = rowH - 12;
        var cy = ry + cardH * 0.5;

        ctx.fillStyle = r.info.badgeCol;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(24, ry + 6, c.width - 48, cardH, 26);
        else ctx.rect(24, ry + 6, c.width - 48, cardH);
        ctx.fill();
        ctx.stroke();

        drawBigDirectionArrow(ctx, r.dirType, 130, cy + 6, 98);
        drawPictogramIcon(ctx, r.info.icon, 355, cy + 6, 68);
      }
      return c;
    }

    var postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
    var trimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

    edges.forEach(function(e) {
      if (e.isSubway || e.isTurnout) return;
      if (e.to.indexOf('EXIT_') === 0) return;

      var br = window.getBranches(e);
      if (!br) return;

      var rows = [];
      var usedIds = {};
      if (br.left && (!br.straight || br.left.id !== br.straight.id)) {
        usedIds[br.left.id] = true;
        rows.push({ dirType: 'left', info: getBranchDestinationInfo(br.left) });
      }
      if (br.straight && !usedIds[br.straight.id]) {
        usedIds[br.straight.id] = true;
        rows.push({ dirType: 'straight', info: getBranchDestinationInfo(br.straight) });
      }
      if (br.right && !usedIds[br.right.id]) {
        usedIds[br.right.id] = true;
        rows.push({ dirType: 'right', info: getBranchDestinationInfo(br.right) });
      }
      if (rows.length === 0) return;

      var uSign = 0.81;
      var pt = e.curve.getPointAt(uSign);
      var tan = e.curve.getTangentAt(uSign).normalize();
      var rightVec = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      var signPos = pt.clone().add(rightVec.clone().multiplyScalar(7.8));

      var signG = new THREE.Group();
      signG.position.copy(signPos);

      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 9.6, 10), postMat);
      pole.position.y = 1.4;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), trimMat);
      cap.position.y = 6.2;
      signG.add(pole, cap);

      var signCanvas = createJunctionSignCanvas(rows);
      var signTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(signCanvas) : new THREE.CanvasTexture(signCanvas);
      var signSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: true })
      );
      var signH = 2.4 * rows.length;
      signSprite.scale.set(7.4, signH, 1);
      signSprite.position.set(0, 6.4 + signH * 0.45, 0);
      signG.add(signSprite);

      window.junctionSignsGroup.add(signG);
    });
  }

  setTimeout(function() {
    if (typeof window.updateHUD === 'function') window.updateHUD();
  }, 30);
})();

// // 2) Wrap `renderer.render` so every frame right before WebGL draw:
//    - 1. UNIFIED 3.0-SECOND (`3000 ms`) CAMERA PERSPECTIVE SHOWCASE for all important objects
//         (Eiffel Tower, Colosseum, Mom's House, Grandma's House, Airport, Jewel Waterfall,
//          Soccer Stadium, Big Ben, Skyscraper, Fountain Square, Track Monsters, Rabbit,
//          Squirrel, Owl, Cow, Sheep), while keeping the camera at a CONSTANT ANGLE ABOVE
//          THE TRAIN at all other times so it never gets confused or spins!
//    - 2. MUTUAL TRAIN HORN GREETINGS when passing other trains (`window.aiTrains`).
//    - 3. FLASHING HEADLIGHTS & SMILING FACES for cars stopped at railway crossings (`window.livingVehicles`).
//    - 4. EDUCATIONAL ENGLISH OBJECT DESCRIPTIONS when focusing on any object for 3 seconds.
(function installModelsFrameEnhancer() {
  if (typeof renderer === 'undefined' || !renderer || !renderer.render || renderer._modelsEnhanced) return;
  renderer._modelsEnhanced = true;
  var origRender = renderer.render.bind(renderer);

  // Per-object showcase state: strictly 3.0 seconds (3000 ms) per pass with cooldown
  var activeShowcaseState = {
    id: null,
    startMs: -99999,
    camPos: null,
    camLook: null,
    targetFov: 36.0
  };
  var showcaseCooldowns = {};

  renderer.render = function(sceneArg, cameraArg) {
    try {
      var nowMs = performance.now();

      // ======================================================================
      // A) AI TRAINS: PREVENT TURNOUT DEADLOCK + MUTUAL HORN GREETING WHEN PASSING!
      //    ("2. Pokud se vláček míjí s jinými vláčky, mašinky na sebe troubí na pozdrav.")
      // ======================================================================
      if (window.aiTrains && window.pState && window.playerLoco) {
        if (!window._aiPassGreetingTriggered) window._aiPassGreetingTriggered = {};
        for (var aii = 0; aii < window.aiTrains.length; aii++) {
          var ai = window.aiTrains[aii];
          if (!ai || !ai.edge) continue;
          var distToPlayer = (ai.loco && ai.loco.position)
            ? ai.loco.position.distanceTo(window.playerLoco.position)
            : 999.0;
          var nearPlayer = (distToPlayer < 30.0);

          // Mutual horn greeting when trains pass each other (< 30m, resets when > 46m)
          if (!window.pState.inSubway && distToPlayer < 30.0) {
            if (!window._aiPassGreetingTriggered[aii]) {
              window._aiPassGreetingTriggered[aii] = true;
              // 1. Player locomotive honks immediately in greeting!
              if (typeof window.playTrainHorn === 'function') {
                window.playTrainHorn();
              }
              // 2. Passing AI locomotive answers with its own joyful two-tone steam whistle 340ms later!
              (function(friendIdx, friendTrain) {
                setTimeout(function() {
                  if (typeof window.playFriendTrainGreetingHorn === 'function') {
                    window.playFriendTrainGreetingHorn(friendIdx);
                  }
                  if (friendTrain && friendTrain.loco && typeof window.spawnSmoke === 'function') {
                    var cPos = new THREE.Vector3(0, 4.9, 1.35);
                    friendTrain.loco.localToWorld(cPos);
                    window.spawnSmoke(cPos, true);
                  }
                }, 340);
              })(aii, ai);
            }
          } else if (distToPlayer > 46.0) {
            window._aiPassGreetingTriggered[aii] = false;
          }

          if (ai.edge.isTurnout || (nearPlayer && window.pState.t > 0.65)) {
            var spd = ai.baseSpeed || 0.38;
            ai.currentSpeed = spd;
            var pCurve = ai.edge.parallelCurve || ai.edge.curve;
            var cLen = (pCurve && pCurve.getLength) ? (pCurve.getLength() || 60) : 60;
            ai.t += spd / cLen;
            if (ai.edge.isTurnout && ai.t >= 1.0) {
              ai.edge = ai.edge.targetEdge;
              ai.t = 0.24;
            }
            var actC = ai.edge.parallelCurve || ai.edge.curve;
            if (actC && actC.getPointAt) {
              var ap = actC.getPointAt(Math.max(0, Math.min(1, ai.t)));
              var atan = actC.getTangentAt(Math.max(0, Math.min(1, ai.t)));
              ai.loco.position.copy(ap);
              ai.loco.lookAt(ap.clone().add(atan));
              var wp = actC.getPointAt(Math.max(0, ai.t - 5.8 / (actC.getLength() || 60)));
              ai.wagon.position.copy(wp);
              ai.wagon.lookAt(ap);
            }
          }
        }
      }

      // ======================================================================
      // A2) AUTOMATIC AIRPORT PARKING BARRIER BOOM (`window.airportParkingBarrier`)
      // ======================================================================
      if (window.airportParkingBarrier && window.airportParkingBarrier.pivot) {
        var apb = window.airportParkingBarrier;
        var minVehDist = 999.0;
        if (window.livingVehicles) {
          for (var lvi = 0; lvi < window.livingVehicles.length; lvi++) {
            var lv = window.livingVehicles[lvi];
            if (lv && lv.mesh && lv.mesh.position) {
              var dVeh = apb.worldPos.distanceTo(lv.mesh.position);
              if (dVeh < minVehDist) minVehDist = dVeh;
            }
          }
        }
        if (window.airportShuttleBuses) {
          for (var sbi = 0; sbi < window.airportShuttleBuses.length; sbi++) {
            var sb = window.airportShuttleBuses[sbi];
            if (sb && sb.mesh && sb.mesh.position) {
              var dBus = apb.worldPos.distanceTo(sb.mesh.position);
              if (dBus < minVehDist) minVehDist = dBus;
            }
          }
        }
        var targetOpenBoom = (minVehDist < 24.0) ? 1.0 : 0.0;
        apb.openAmount += (targetOpenBoom - apb.openAmount) * 0.14;
        apb.pivot.rotation.x = -apb.openAmount * Math.PI * 0.44;
        if (apb.statusMat) {
          apb.statusMat.color.setHex(apb.openAmount > 0.25 ? 0x22c55e : 0xef4444);
        }
      }

      // ======================================================================
      // A3) CARS AT RAILWAY CROSSINGS FLASH HEADLIGHTS & SMILE AT THE TRAIN!
      //     ("3. Auta na přejezdu blikají na vláček a usmívají se.")
      // ======================================================================
      if (window.livingVehicles) {
        for (var cvi = 0; cvi < window.livingVehicles.length; cvi++) {
          var veh = window.livingVehicles[cvi];
          if (!veh || !veh.mesh || !veh.mesh.userData) continue;

          // Check if vehicle is waiting at a closed railway crossing (`veh.isStopped` or near an active crossing)
          var isAtClosedCrossing = Boolean(veh.isStopped);
          if (!isAtClosedCrossing && window.levelCrossings && veh.mesh.position) {
            for (var xci = 0; xci < window.levelCrossings.length; xci++) {
              var xc = window.levelCrossings[xci];
              if (xc && xc.gateTarget > 0.25 && xc.pos && xc.pos.distanceTo(veh.mesh.position) < 22.0) {
                isAtClosedCrossing = true;
                break;
              }
            }
          }

          var cLights = veh.mesh.userData.crossingLights;
          var cSmile  = veh.mesh.userData.crossingSmileGroup;
          var cMouth  = veh.mesh.userData.mouth;

          if (isAtClosedCrossing) {
            // Big beaming 3D smile + rosy cheeks while greeting the train!
            if (cSmile) {
              cSmile.visible = true;
              var smilePulse = 1.0 + Math.sin(nowMs * 0.012 + cvi) * 0.08;
              cSmile.scale.set(smilePulse, smilePulse, 1.0);
            }
            if (cMouth) cMouth.visible = false;

            // Joyful friendly bounce while flashing headlights at the train
            if (veh.mesh.children && veh.mesh.children[0]) {
              veh.mesh.children[0].position.y = Math.abs(Math.sin(nowMs * 0.010 + cvi)) * 0.14;
            }

            // Flash headlights on and off (~4.5 Hz bright high-beam wink!)
            if (cLights) {
              var flashWave = Math.sin(nowMs * 0.028 + cvi * 1.7);
              var isBeamOn = (flashWave > -0.15);
              if (cLights.haloL) cLights.haloL.visible = isBeamOn;
              if (cLights.haloR) cLights.haloR.visible = isBeamOn;
              if (cLights.coneL) cLights.coneL.visible = isBeamOn;
              if (cLights.coneR) cLights.coneR.visible = isBeamOn;
              if (cLights.lensMat && cLights.lensMat.color) {
                cLights.lensMat.color.setHex(isBeamOn ? 0xffffff : 0xfffbeb);
              }
              if (cLights.haloMat) {
                cLights.haloMat.opacity = isBeamOn ? (0.75 + 0.25 * Math.max(0, flashWave)) : 0.08;
              }
              if (cLights.coneMat) {
                cLights.coneMat.opacity = isBeamOn ? (0.34 + 0.16 * Math.max(0, flashWave)) : 0.0;
              }
            }
          } else {
            if (cSmile) cSmile.visible = false;
            if (cMouth) cMouth.visible = true;
            if (veh.mesh.children && veh.mesh.children[0]) {
              veh.mesh.children[0].position.y = 0;
            }
            if (cLights) {
              if (cLights.haloL) cLights.haloL.visible = false;
              if (cLights.haloR) cLights.haloR.visible = false;
              if (cLights.coneL) cLights.coneL.visible = false;
              if (cLights.coneR) cLights.coneR.visible = false;
            }
          }
        }
      }

      // ======================================================================
      // A4) EIFFEL TOWER NIGHT ILLUMINATION (`1. prosím o nasvícení eiffel tower v noci`)
      // ======================================================================
      if (window.eiffelNightSystem) {
        var ens = window.eiffelNightSystem;
        var hoursNow = (typeof gameTimeSeconds === 'number') ? ((gameTimeSeconds / 300.0) * 24.0) : 12.0;
        var isFullNight = (hoursNow >= 20.0 || hoursNow < 5.5);
        var isTwilight = (hoursNow >= 18.0 && hoursNow < 20.0) || (hoursNow >= 5.5 && hoursNow < 7.0);
        var sunDark = (typeof sunLight !== 'undefined' && sunLight && typeof sunLight.intensity === 'number' && sunLight.intensity < 0.35);
        var targetNight = (isFullNight || sunDark) ? 1.0 : (isTwilight ? 0.48 : 0.0);

        ens.currentBlend += (targetNight - ens.currentBlend) * 0.06;
        var nb = ens.currentBlend;

        if (ens.emissiveMats) {
          for (var emi = 0; emi < ens.emissiveMats.length; emi++) {
            var emItem = ens.emissiveMats[emi];
            if (emItem && emItem.mat) {
              emItem.mat.emissiveIntensity = emItem.maxInt * nb;
            }
          }
        }
        if (ens.baseLight) ens.baseLight.intensity = 2.6 * nb;
        if (ens.midLight)  ens.midLight.intensity  = 3.0 * nb;
        if (ens.topLight)  ens.topLight.intensity  = 3.6 * nb;
        if (ens.contourMat) ens.contourMat.opacity = 0.88 * nb;
        if (ens.searchBeamMat) ens.searchBeamMat.opacity = 0.44 * nb;
        if (ens.beaconRotor) {
          ens.beaconRotor.rotation.y = nowMs * 0.0009;
        }
        if (ens.sparkleMats) {
          for (var smi = 0; smi < ens.sparkleMats.length; smi++) {
            var twk = 0.30 + 0.70 * Math.pow(0.5 + 0.5 * Math.sin(nowMs * 0.009 + smi * 2.1), 2.0);
            ens.sparkleMats[smi].opacity = nb * twk;
          }
        }
        if (ens.sparkleBulbs && nb > 0.02) {
          for (var sbi2 = 0; sbi2 < ens.sparkleBulbs.length; sbi2++) {
            var sbItem = ens.sparkleBulbs[sbi2];
            var scPulse = 0.65 + 0.85 * Math.abs(Math.sin(nowMs * 0.0065 + sbItem.phase));
            sbItem.mesh.scale.set(scPulse, scPulse, scPulse);
          }
        }
      }

      // ======================================================================
      // B) WIDE PANORAMIC WORLD CAMERA SYSTEM
      //    - 1. 360° Panoramic Horizon Ring, Distant Rolling Hills & Sky Clouds:
      //         Extends the visible world to 1800m+ with soft atmospheric fog
      //         so the horizon, distant hills, and sky are genuinely visible.
      //    - 2. Base Panoramic Camera (Section 2):
      //         * Distance: `48.0m` behind locomotive (`50.2m` slant distance)
      //           so the locomotive occupies ~10.3% of screen height (`8–12%`)
      //           primarily via physical camera distance rather than extreme FOV.
      //         * Height & Pitch: `14.2m` above rails looking `54.0m` ahead at
      //           `+5.4m` (`pitch = -4.93°`), placing the train in the lower
      //           third of the screen (`NDC Y ≈ -0.38`) and the horizon at
      //           `NDC Y ≈ +0.20` with ~40% of the screen showing sky, horizon,
      //           and wide surrounding landscape.
      //         * FOV: `46.0°` natural wide-angle panoramic lens.
      //    - 3. Large Landmarks 3D Bounding-Box Frustum Solver (Section 3):
      //         * Projects all 9 3D bounding points of the landmark (base, top
      //           spire/roof, left/right edges) + foreground train into NDC and
      //           iteratively adjusts optical center and camera retreat distance
      //           so 100% of the landmark (from base to summit) fits on screen
      //           with generous margins.
      //    - 4. Small Animals & Characters (Section 4):
      //         * ZERO automatic zoom (`FOV = 46.0°`) and NO close-up cut!
      //         * Keeps the panoramic distance (`~45–48m`), gently pans toward
      //           the animal in context with its surroundings and the train, and
      //           uses 3D Raycast + obstacle cylinder checks to step around any
      //           intervening trees or buildings.
      // ======================================================================
      if (!window._panoramicHorizonBuilt && typeof scene !== 'undefined' && scene) {
        window._panoramicHorizonBuilt = true;
        try {
          if (scene.fog && typeof scene.fog.density === 'number') {
            scene.fog.density = 0.00024;
          }
          if (cameraArg && typeof cameraArg.far === 'number' && cameraArg.far < 3200) {
            cameraArg.far = 3200;
            if (typeof cameraArg.updateProjectionMatrix === 'function') {
              cameraArg.updateProjectionMatrix();
            }
          }
          var horizonGroup = new THREE.Group();
          horizonGroup.name = 'panoramicHorizonScenery';

          // Outer rolling meadow skirt extending terrain out to radius 1950m so the horizon is seamless
          var outerSkirtMat = new THREE.MeshStandardMaterial({ color: 0x38c172, roughness: 0.90, metalness: 0.0 });
          var outerSkirt = new THREE.Mesh(new THREE.RingGeometry(820, 1950, 64, 1), outerSkirtMat);
          outerSkirt.rotation.x = -Math.PI / 2;
          outerSkirt.position.y = -1.2;
          horizonGroup.add(outerSkirt);

          // 24 Distant Panoramic Rolling Hills & Mountain Silhouettes around the 360° horizon
          var hillPalette = [0x22c55e, 0x16a34a, 0x34d399, 0x15803d];
          for (var hi = 0; hi < 24; hi++) {
            var hAng = (hi / 24) * Math.PI * 2.0 + (hi % 2) * 0.06;
            var hDist = 760 + (hi % 3) * 145;
            var hRad = 155 + (hi % 4) * 45;
            var hHeight = 38 + (hi % 5) * 14;
            var hillMesh = new THREE.Mesh(
              new THREE.SphereGeometry(1.0, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
              new THREE.MeshStandardMaterial({ color: hillPalette[hi % hillPalette.length], roughness: 0.88 })
            );
            hillMesh.scale.set(hRad * 1.35, hHeight, hRad * 0.95);
            hillMesh.position.set(Math.cos(hAng) * hDist, -3.5, Math.sin(hAng) * hDist);
            hillMesh.rotation.y = -hAng + Math.PI * 0.5;
            horizonGroup.add(hillMesh);
          }

          // 28 Fluffy Storybook Sky Clouds floating above the horizon
          var cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
          for (var cli = 0; cli < 28; cli++) {
            var cAng = (cli / 28) * Math.PI * 2.0;
            var cDist = 520 + (cli % 4) * 165;
            var cY = 82 + (cli % 5) * 16;
            var cGroup = new THREE.Group();
            cGroup.position.set(Math.cos(cAng) * cDist, cY, Math.sin(cAng) * cDist);
            cGroup.rotation.y = -cAng + Math.PI * 0.5;
            var puffs = [
              [0, 0, 0, 22, 11, 14],
              [-18, -2, 2, 16, 8.5, 11],
              [18, -1.5, -2, 17, 9, 11],
              [6, 5, 3, 14, 8, 10]
            ];
            for (var pfi = 0; pfi < puffs.length; pfi++) {
              var pf = puffs[pfi];
              var pm = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), cloudMat);
              pm.scale.set(pf[3], pf[4], pf[5]);
              pm.position.set(pf[0], pf[1], pf[2]);
              cGroup.add(pm);
            }
            horizonGroup.add(cGroup);
          }

          scene.add(horizonGroup);
          window.panoramicHorizonGroup = horizonGroup;
        } catch (hErr) {}
      }

      if (window.panoramicHorizonGroup && window.pState) {
        window.panoramicHorizonGroup.visible = !window.pState.inSubway;
      }

      if (window.pState && window.pState.edge && window.playerLoco && window.smoothCamPos && window.smoothCamLook && cameraArg) {
        if (!window._camSysState) {
          window._camSysState = {
            lastMs: nowMs,
            pos: window.smoothCamPos.clone(),
            look: window.smoothCamLook.clone(),
            posVel: new THREE.Vector3(0, 0, 0),
            lookVel: new THREE.Vector3(0, 0, 0),
            dir: null,
            dirVel: new THREE.Vector3(0, 0, 0),
            curveLead: new THREE.Vector3(0, 0, 0),
            curveLeadVel: new THREE.Vector3(0, 0, 0),
            reverseBlend: 0.0,
            reverseVel: 0.0,
            speedBlend: 0.2,
            speedVel: 0.0,
            fov: (cameraArg && typeof cameraArg.fov === 'number') ? cameraArg.fov : 46.0,
            fovVel: 0.0,
            activePoiId: null,
            activePoiSwitchMs: -99999,
            poiWeight: 0.0,
            poiWeightVel: 0.0,
            poiOffsetPos: new THREE.Vector3(0, 0, 0),
            poiOffsetPosVel: new THREE.Vector3(0, 0, 0),
            poiLookPoint: window.smoothCamLook.clone(),
            poiLookVel: new THREE.Vector3(0, 0, 0),
            poiTargetFov: 46.0,
            narratedReadyMap: {},
            selectedAnimalAngleIdx: 0
          };
        }

        var cs = window._camSysState;
        var dtCam = Math.min(0.067, Math.max(0.002, (nowMs - cs.lastMs) / 1000.0));
        cs.lastMs = nowMs;

        // Critically-damped 2nd-order spring helpers (FPS-independent, zero overshoot/jerk)
        function smoothDampScalar(current, target, stateObj, velProp, smoothTime, dt, maxSpeed) {
          var st = Math.max(0.0001, smoothTime);
          var omega = 2.0 / st;
          var x = omega * dt;
          var exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
          var change = current - target;
          var origTo = target;
          var maxChg = (maxSpeed || 9999.0) * st;
          change = Math.max(-maxChg, Math.min(maxChg, change));
          target = current - change;
          var v = stateObj[velProp] || 0.0;
          var temp = (v + omega * change) * dt;
          stateObj[velProp] = (v - omega * temp) * exp;
          var out = target + (change + temp) * exp;
          if ((origTo - current > 0.0) === (out > origTo)) {
            out = origTo;
            stateObj[velProp] = (out - origTo) / Math.max(0.0001, dt);
          }
          return out;
        }

        function smoothDampVec3(curV, tgtV, velV, smoothTime, dt, maxSpeed) {
          var st = Math.max(0.0001, smoothTime);
          var omega = 2.0 / st;
          var x = omega * dt;
          var exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
          var dx = curV.x - tgtV.x;
          var dy = curV.y - tgtV.y;
          var dz = curV.z - tgtV.z;
          var maxChg = (maxSpeed || 9999.0) * st;
          var sqD = dx * dx + dy * dy + dz * dz;
          if (sqD > maxChg * maxChg) {
            var mag = Math.sqrt(sqD);
            dx = (dx / mag) * maxChg;
            dy = (dy / mag) * maxChg;
            dz = (dz / mag) * maxChg;
          }
          var tx = curV.x - dx;
          var ty = curV.y - dy;
          var tz = curV.z - dz;
          var tempX = (velV.x + omega * dx) * dt;
          var tempY = (velV.y + omega * dy) * dt;
          var tempZ = (velV.z + omega * dz) * dt;
          velV.x = (velV.x - omega * tempX) * exp;
          velV.y = (velV.y - omega * tempY) * exp;
          velV.z = (velV.z - omega * tempZ) * exp;
          curV.x = tx + (dx + tempX) * exp;
          curV.y = ty + (dy + tempY) * exp;
          curV.z = tz + (dz + tempZ) * exp;
        }

        function smootherstep01(u) {
          var c = Math.max(0.0, Math.min(1.0, u));
          return c * c * c * (c * (c * 6.0 - 15.0) + 10.0);
        }

        var curEdge = window.pState.edge;
        var baseEdge = curEdge.isTurnout ? curEdge.targetEdge : curEdge;
        var edgeId = baseEdge ? baseEdge.id : curEdge.id;
        var pos = window.playerLoco.position;
        var ct = Math.max(0.0, Math.min(1.0, window.pState.t || 0.0));
        var curVel = window.pState.currentVel || 0.0;
        var absVel = Math.abs(curVel);
        var isReversing = (curVel < -0.006 || window.pState.speedStage === -1);
        var camAspect = (cameraArg && cameraArg.aspect) ? cameraArg.aspect : (window.innerWidth / Math.max(1, window.innerHeight));

        // --------------------------------------------------------------------
        // 1. MULTI-SAMPLE PREDICTIVE TRACK DIRECTION & CURVE ANTICIPATION
        // --------------------------------------------------------------------
        var rawTanNow = new THREE.Vector3(0, 0, 1);
        var rawTanAhead = new THREE.Vector3(0, 0, 1);
        var rawTanBehind = new THREE.Vector3(0, 0, 1);
        if (curEdge.curve && curEdge.curve.getTangentAt) {
          rawTanNow = curEdge.curve.getTangentAt(ct).normalize();
          var dtAhead = isReversing ? -0.055 : 0.055;
          var dtBehind = isReversing ? 0.035 : -0.035;
          rawTanAhead = curEdge.curve.getTangentAt(Math.max(0.0, Math.min(1.0, ct + dtAhead))).normalize();
          rawTanBehind = curEdge.curve.getTangentAt(Math.max(0.0, Math.min(1.0, ct + dtBehind))).normalize();
        }

        var blendedFlatTan = new THREE.Vector3(
          rawTanBehind.x * 0.22 + rawTanNow.x * 0.44 + rawTanAhead.x * 0.34,
          0.0,
          rawTanBehind.z * 0.22 + rawTanNow.z * 0.44 + rawTanAhead.z * 0.34
        );
        if (blendedFlatTan.lengthSq() < 0.0001) {
          blendedFlatTan.set(rawTanNow.x, 0.0, rawTanNow.z);
        }
        if (blendedFlatTan.lengthSq() < 0.0001) {
          blendedFlatTan.set(0.0, 0.0, 1.0);
        }
        blendedFlatTan.normalize();

        if (!cs.dir) {
          cs.dir = blendedFlatTan.clone();
        } else {
          var dirSmoothTime = (absVel < 0.005) ? 0.58 : Math.max(0.34, 0.50 - Math.min(0.14, absVel * 0.22));
          smoothDampVec3(cs.dir, blendedFlatTan, cs.dirVel, dirSmoothTime, dtCam, 8.0);
          cs.dir.y = 0.0;
          if (cs.dir.lengthSq() > 0.0001) cs.dir.normalize();
        }
        window._smoothTrainDir = cs.dir.clone();

        var forwardDir = cs.dir;
        var trackRight = new THREE.Vector3(-forwardDir.z, 0.0, forwardDir.x).normalize();

        // Curve anticipation vector: smoothly opens the view into upcoming turns
        var rawCurveDelta = new THREE.Vector3(
          (rawTanAhead.x - rawTanNow.x) * 14.0,
          0.0,
          (rawTanAhead.z - rawTanNow.z) * 14.0
        );
        smoothDampVec3(cs.curveLead, rawCurveDelta, cs.curveLeadVel, 0.44, dtCam, 22.0);

        var targetSpeedNorm = Math.min(1.0, absVel / 0.68);
        cs.speedBlend = smoothDampScalar(cs.speedBlend, targetSpeedNorm, cs, 'speedVel', 0.55, dtCam, 3.0);
        var targetRevBlend = isReversing ? 1.0 : 0.0;
        cs.reverseBlend = smoothDampScalar(cs.reverseBlend, targetRevBlend, cs, 'reverseVel', 0.62, dtCam, 2.5);

        // --------------------------------------------------------------------
        // 2. NEW WIDE PANORAMIC BASE CAMERA (Section 2 Requirements)
        //    - Physical Distance: `48.0m` behind locomotive (up to `52.0m` at
        //      express speed), shrinking the locomotive naturally in 3D space
        //      to `~10.3%` of screen height (`8–12%` target range).
        //    - Height: `14.2m` above track (`pos.y + 14.2m`).
        //    - Look-Ahead Target: `54.0m` ahead of locomotive at height
        //      `pos.y + 5.4m` -> shallow pitch angle of `-4.93°` (instead of
        //      the old steep `-18.14°`).
        //    - Result:
        //      * Locomotive sits in the lower third (`NDC Y ≈ -0.38`, ~31% from bottom).
        //      * Horizon sits at `NDC Y ≈ +0.20` (~60% from bottom), leaving ~40%
        //        of the screen for sky, clouds, horizon hills & distant landmarks!
        // --------------------------------------------------------------------
        var baseBackDist = 48.0 + cs.speedBlend * 4.0 + cs.reverseBlend * 6.0;
        var baseHeight = 14.2 + cs.speedBlend * 0.8 + cs.reverseBlend * 1.8;
        var baseSideOffset = 3.6 + cs.reverseBlend * 5.2;

        var behindTrainCamPos = new THREE.Vector3(
          pos.x - forwardDir.x * baseBackDist + trackRight.x * baseSideOffset,
          pos.y + baseHeight,
          pos.z - forwardDir.z * baseBackDist + trackRight.z * baseSideOffset
        );

        var forwardLookLead = (54.0 + cs.speedBlend * 6.0) * (1.0 - cs.reverseBlend * 1.25);
        var behindTrainCamLook = new THREE.Vector3(
          pos.x + forwardDir.x * forwardLookLead + cs.curveLead.x * (1.0 - cs.reverseBlend * 0.5),
          pos.y + 5.40 - cs.reverseBlend * 0.40,
          pos.z + forwardDir.z * forwardLookLead + cs.curveLead.z * (1.0 - cs.reverseBlend * 0.5)
        );

        var baseDrivingCamPos = behindTrainCamPos.clone();
        var baseDrivingCamLook = behindTrainCamLook.clone();
        var baseDrivingFov = 46.0;

        // --------------------------------------------------------------------
        // 3. SCREEN-SPACE PROJECTION & 3D FRUSTUM-FITTING HELPERS
        // --------------------------------------------------------------------
        function projectWorldPointToNDC(worldPt, camOrigin, camLookAt, fovDeg, aspect) {
          var fwd = camLookAt.clone().sub(camOrigin);
          var fLen = fwd.length();
          if (fLen < 0.0001) return { x: 0, y: 0, z: 1, behind: false };
          fwd.divideScalar(fLen);

          var worldUp = new THREE.Vector3(0, 1, 0);
          var right = new THREE.Vector3().crossVectors(fwd, worldUp);
          if (right.lengthSq() < 0.0001) right.set(1, 0, 0);
          else right.normalize();
          var up = new THREE.Vector3().crossVectors(right, fwd).normalize();

          var rel = worldPt.clone().sub(camOrigin);
          var cz = rel.dot(fwd);
          var cx = rel.dot(right);
          var cy = rel.dot(up);

          if (cz <= 0.25) {
            return { x: cx >= 0 ? 4.0 : -4.0, y: cy >= 0 ? 4.0 : -4.0, z: cz, behind: true };
          }
          var halfTanY = Math.tan((fovDeg * Math.PI / 180.0) * 0.5);
          var halfTanX = halfTanY * Math.max(1.0, aspect || 1.7778);
          return {
            x: cx / (cz * halfTanX),
            y: cy / (cz * halfTanY),
            z: cz,
            behind: false
          };
        }

        // --------------------------------------------------------------------
        // 4. JEWEL CHANGI AIRPORT DRIVE-THROUGH CHOREOGRAPHY (`J_EAST <-> J_SE`)
        // --------------------------------------------------------------------
        if (!window.pState.inSubway && !curEdge.isTurnout && (edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST') &&
            window.jewelDomeCenterWorld && window.jewelVortexWorldPos && window.jewelInwardLeftVec) {
          var uJewel = (edgeId === 'J_EAST->J_SE') ? ct : (1.0 - ct);
          if (uJewel >= 0.02 && uJewel <= 0.90) {
            var inwardLeft = window.jewelInwardLeftVec;
            var entryPortalPos = (edgeId === 'J_EAST->J_SE')
              ? (window.jewelNorthPortalPos || window.jewelDomeCenterWorld)
              : (window.jewelSouthPortalPos || window.jewelDomeCenterWorld);

            // Stage 1 (uJewel < 0.22): Wide panoramic exterior bridge approach showing full Jewel glass dome + train
            var preEntryCamPos = pos.clone()
              .sub(forwardDir.clone().multiplyScalar(48.0))
              .add(inwardLeft.clone().multiplyScalar(14.0))
              .add(new THREE.Vector3(0, 16.5, 0));
            var preEntryCamLook = pos.clone()
              .add(forwardDir.clone().multiplyScalar(22.0))
              .lerp(entryPortalPos, 0.52)
              .add(new THREE.Vector3(0, 8.5, 0));

            // Stage 2 (uJewel >= 0.22): Inside dome panoramic view framing full Rain Vortex waterfall from pool to roof oculus
            var domeFollowCamPos = pos.clone()
              .sub(forwardDir.clone().multiplyScalar(32.0))
              .sub(inwardLeft.clone().multiplyScalar(15.5));
            domeFollowCamPos.y = window.jewelDomeCenterWorld.y + 16.0;

            var trainLeadInJewel = pos.clone().add(forwardDir.clone().multiplyScalar(10.0)).add(new THREE.Vector3(0, 3.2, 0));
            var vortexFocus = new THREE.Vector3(
              window.jewelVortexWorldPos.x,
              window.jewelDomeCenterWorld.y + 13.0,
              window.jewelVortexWorldPos.z
            );
            var domeFollowCamLook = trainLeadInJewel.lerp(vortexFocus, 0.62);

            var jewelPassPos, jewelPassLook;
            if (uJewel < 0.20) {
              jewelPassPos = preEntryCamPos;
              jewelPassLook = preEntryCamLook;
            } else if (uJewel < 0.34) {
              var sTrans = smootherstep01((uJewel - 0.20) / 0.14);
              jewelPassPos = preEntryCamPos.clone().lerp(domeFollowCamPos, sTrans);
              jewelPassLook = preEntryCamLook.clone().lerp(domeFollowCamLook, sTrans);
            } else {
              jewelPassPos = domeFollowCamPos;
              jewelPassLook = domeFollowCamLook;
            }

            var jewelEnv = 1.0;
            if (uJewel < 0.14) {
              jewelEnv = smootherstep01((uJewel - 0.02) / 0.12);
            } else if (uJewel > 0.76) {
              jewelEnv = smootherstep01((0.90 - uJewel) / 0.14);
            }

            baseDrivingCamPos.lerp(jewelPassPos, jewelEnv);
            baseDrivingCamLook.lerp(jewelPassLook, jewelEnv);
            baseDrivingFov = 46.0 + 3.0 * jewelEnv;
          }
        }

        // --------------------------------------------------------------------
        // 5. SPATIAL POI WEIGHT & LARGE/SMALL OBJECT COMPOSERS
        // --------------------------------------------------------------------
        function computeSpatialPoiWeight(anchorPt, spec) {
          var dx = anchorPt.x - pos.x;
          var dz = anchorPt.z - pos.z;
          var signedAlong = dx * forwardDir.x + dz * forwardDir.z;
          var perpDist = Math.abs(-dx * forwardDir.z + dz * forwardDir.x);

          if (perpDist > (spec.maxPerpDist || 110.0)) return 0.0;

          var perpFade = 1.0;
          var innerPerp = (spec.maxPerpDist || 110.0) * 0.70;
          if (perpDist > innerPerp) {
            perpFade = 1.0 - smootherstep01((perpDist - innerPerp) / Math.max(1.0, (spec.maxPerpDist || 110.0) - innerPerp));
          }

          var alongWeight = 0.0;
          var approachDist = spec.approachDist || 90.0;
          var peakAhead = spec.peakAheadDist || 22.0;
          var peakBehind = spec.peakBehindDist !== undefined ? spec.peakBehindDist : -12.0;
          var departDist = spec.departDist || 48.0;

          if (signedAlong > peakAhead) {
            if (signedAlong >= approachDist) return 0.0;
            alongWeight = smootherstep01((approachDist - signedAlong) / Math.max(1.0, approachDist - peakAhead));
          } else if (signedAlong >= peakBehind) {
            alongWeight = 1.0;
          } else {
            var behindPast = -signedAlong;
            var peakBehindAbs = -peakBehind;
            if (behindPast >= departDist) return 0.0;
            alongWeight = 1.0 - smootherstep01((behindPast - peakBehindAbs) / Math.max(1.0, departDist - peakBehindAbs));
          }

          return alongWeight * perpFade;
        }

        // ====================================================================
        // CATEGORY A SOLVER: LARGE LANDMARKS WITH 3D BOUNDING-BOX FRUSTUM FIT
        // Guarantees 100% of the landmark (base, top spire/roof, left & right
        // edges) AND the foreground train fit inside safe screen margins!
        // ====================================================================
        function buildLargeLandmarkCandidate(spec) {
          if (!spec || !spec.center) return null;
          var w = computeSpatialPoiWeight(spec.center, spec);
          if (w <= 0.005) return null;

          var cx = spec.center.x;
          var cz = spec.center.z;
          var baseY = (spec.baseY !== undefined) ? spec.baseY : spec.center.y;
          var objHeight = spec.height || 30.0;
          var objRadius = spec.radius || 24.0;

          var toObjX = cx - pos.x;
          var toObjZ = cz - pos.z;
          var sideDot = toObjX * trackRight.x + toObjZ * trackRight.z;
          var sideSign = (sideDot >= 0.0) ? 1.0 : -1.0;

          // Initial wide cinematic camera position on the opposite side of the track from the landmark
          var backDist = spec.camBack || 54.0;
          var oppSideDist = spec.camOppositeSide || 22.0;
          var camHeight = spec.camHeight || 15.2;
          var fov = spec.targetFov || 48.0;

          var camPos = new THREE.Vector3(
            pos.x - forwardDir.x * backDist - trackRight.x * (sideSign * oppSideDist),
            pos.y + camHeight,
            pos.z - forwardDir.z * backDist - trackRight.z * (sideSign * oppSideDist)
          );

          // Initial optical target between the foreground train corridor and the landmark's vertical midpoint
          var trainLeadDist = isReversing ? -6.0 : 14.0;
          var trainFocus = new THREE.Vector3(
            pos.x + forwardDir.x * trainLeadDist,
            pos.y + 2.8,
            pos.z + forwardDir.z * trainLeadDist
          );
          var landmarkLookY = (spec.lookHeightOffset !== undefined)
            ? (baseY + spec.lookHeightOffset)
            : (baseY + objHeight * 0.48);
          var landmarkMid = new THREE.Vector3(cx, landmarkLookY, cz);
          var camLook = trainFocus.clone().lerp(landmarkMid, spec.lookShare || 0.62);

          // Iterative 3D Bounding-Box Frustum Solver (verifies base, summit, sides & train all fit in NDC!)
          var safeMaxX = 0.78;
          var safeMinY = -0.74;
          var safeMaxY = 0.68; // Keeps top spire strictly below the top UI bar (`#top-bar`)

          for (var iter = 0; iter < 8; iter++) {
            var viewDirXZ = new THREE.Vector3(cx - camPos.x, 0, cz - camPos.z);
            if (viewDirXZ.lengthSq() < 0.001) viewDirXZ.set(0, 0, 1);
            else viewDirXZ.normalize();
            var rightXZ = new THREE.Vector3(-viewDirXZ.z, 0, viewDirXZ.x);

            // 9 bounding points: Landmark Base, Landmark Summit, Landmark Left/Right Base & Upper, + Train Base/Top/Lead
            var boundPts = [
              new THREE.Vector3(cx - viewDirXZ.x * objRadius * 0.45, baseY, cz - viewDirXZ.z * objRadius * 0.45),
              new THREE.Vector3(cx, baseY + objHeight, cz),
              new THREE.Vector3(cx - rightXZ.x * objRadius, baseY + 1.0, cz - rightXZ.z * objRadius),
              new THREE.Vector3(cx + rightXZ.x * objRadius, baseY + 1.0, cz + rightXZ.z * objRadius),
              new THREE.Vector3(cx - rightXZ.x * objRadius * 0.65, baseY + objHeight * 0.78, cz - rightXZ.z * objRadius * 0.65),
              new THREE.Vector3(cx + rightXZ.x * objRadius * 0.65, baseY + objHeight * 0.78, cz + rightXZ.z * objRadius * 0.65),
              new THREE.Vector3(pos.x, pos.y, pos.z),
              new THREE.Vector3(pos.x, pos.y + 4.35, pos.z),
              new THREE.Vector3(pos.x + forwardDir.x * 12.0, pos.y + 2.2, pos.z + forwardDir.z * 12.0)
            ];

            var minNX = 999.0, maxNX = -999.0, minNY = 999.0, maxNY = -999.0;
            for (var bpi = 0; bpi < boundPts.length; bpi++) {
              var pr = projectWorldPointToNDC(boundPts[bpi], camPos, camLook, fov, camAspect);
              if (pr.x < minNX) minNX = pr.x;
              if (pr.x > maxNX) maxNX = pr.x;
              if (pr.y < minNY) minNY = pr.y;
              if (pr.y > maxNY) maxNY = pr.y;
            }

            var spanX = maxNX - minNX;
            var spanY = maxNY - minNY;
            var centerNX = 0.5 * (minNX + maxNX);
            var centerNY = 0.5 * (minNY + maxNY);
            var desiredCenterNY = 0.5 * (safeMinY + safeMaxY); // -0.03

            var fitsX = (minNX >= -safeMaxX && maxNX <= safeMaxX);
            var fitsY = (minNY >= safeMinY && maxNY <= safeMaxY);
            if (fitsX && fitsY) break;

            // 1) Re-center optical axis (`camLook`) in camera right/up plane so the bounding box is centered
            var fwdVec = camLook.clone().sub(camPos);
            var lookDist = fwdVec.length();
            if (lookDist > 0.1) {
              fwdVec.divideScalar(lookDist);
              var rVec = new THREE.Vector3().crossVectors(fwdVec, new THREE.Vector3(0, 1, 0)).normalize();
              var uVec = new THREE.Vector3().crossVectors(rVec, fwdVec).normalize();
              var halfTanY = Math.tan((fov * Math.PI / 180.0) * 0.5);
              var halfTanX = halfTanY * Math.max(1.0, camAspect);

              var errX = centerNX * lookDist * halfTanX * 0.72;
              var errY = (centerNY - desiredCenterNY) * lookDist * halfTanY * 0.75;
              camLook.addScaledVector(rVec, errX);
              camLook.addScaledVector(uVec, errY);
            }

            // 2) If total angular span exceeds the safe screen margins, retreat camera backward & slightly widen FOV
            var allowedSpanX = safeMaxX * 2.0; // 1.56
            var allowedSpanY = safeMaxY - safeMinY; // 1.42
            var overflowRatio = Math.max(spanX / allowedSpanX, spanY / allowedSpanY);
            if (overflowRatio > 1.0) {
              var retreatStep = Math.min(1.24, 1.0 + (overflowRatio - 1.0) * 0.68);
              var anchorMid = trainFocus.clone().lerp(landmarkMid, 0.35);
              var awayVec = camPos.clone().sub(anchorMid);
              awayVec.x *= retreatStep;
              awayVec.z *= retreatStep;
              awayVec.y = Math.max(awayVec.y, (pos.y + camHeight) - anchorMid.y);
              camPos.copy(anchorMid).add(awayVec);
              fov = Math.min(52.5, fov + (overflowRatio - 1.0) * 2.2);
            }
            if (spec.minCamHeight && camPos.y < pos.y + spec.minCamHeight) {
              camPos.y = pos.y + spec.minCamHeight;
            }
          }

          return {
            id: spec.id,
            narrationId: spec.narrationId || spec.id,
            category: 'large',
            weight: w,
            priority: spec.priority || 1.05,
            camPos: camPos,
            camLook: camLook,
            targetFov: fov
          };
        }

        // ====================================================================
        // CATEGORY B SOLVER: SMALL ANIMALS & CHARACTERS (Section 4)
        // - NO automatic zoom (`targetFov = baseDrivingFov = 46.0°`).
        // - NO extreme close-up (`camBack ≈ 45–48m`, keeping the wide panoramic
        //   world, horizon, train, and animal's surroundings in one continuous scene).
        // - Raycast + 3D Obstacle Cylinder Avoidance: checks if any tree trunk,
        //   canopy, house, or pole blocks the line of sight from `camPos` to the
        //   animal, and automatically slides the camera laterally to an
        //   unobstructed panoramic vantage!
        // ====================================================================
        function gatherAnimalObstacles(excludeObjList) {
          var obsList = [];
          // 1. Interactive character trees (Monster hiding trees, Squirrel tree trunk, Owl tree trunk)
          var sb = window.storybookInteractiveCharacters;
          if (sb) {
            if (sb.monsters) {
              for (var mi = 0; mi < sb.monsters.length; mi++) {
                var m = sb.monsters[mi];
                if (m && m.hidingTreePos) {
                  obsList.push({ x: m.hidingTreePos.x, z: m.hidingTreePos.z, minY: m.hidingTreePos.y, maxY: m.hidingTreePos.y + 12.5, rad: 3.2, mesh: m.hidingTree });
                }
              }
            }
            if (sb.squirrel && sb.squirrel.worldPos) {
              var sqP = sb.squirrel.worldPos;
              obsList.push({ x: sqP.x, z: sqP.z, minY: sqP.y, maxY: sqP.y + 12.5, rad: 1.65, mesh: sb.squirrel.obj ? sb.squirrel.obj.envGroup : null });
            }
            if (sb.owl && sb.owl.worldPos) {
              var owP = sb.owl.worldPos;
              obsList.push({ x: owP.x, z: owP.z, minY: owP.y, maxY: owP.y + 11.5, rad: 1.55, mesh: sb.owl.obj ? sb.owl.obj.envGroup : null });
            }
          }
          // 2. Nearby houses (`window.surfaceHousesList`)
          if (window.surfaceHousesList) {
            for (var hi = 0; hi < window.surfaceHousesList.length; hi++) {
              var hMesh = window.surfaceHousesList[hi];
              if (hMesh && hMesh.visible && hMesh.position && hMesh.position.y > -100) {
                obsList.push({ x: hMesh.position.x, z: hMesh.position.z, minY: hMesh.position.y, maxY: hMesh.position.y + 14.0, rad: 7.5, mesh: hMesh });
              }
            }
          }
          // 3. Locomotive body (so the locomotive itself never blocks the animal!)
          obsList.push({ x: pos.x, z: pos.z, minY: pos.y, maxY: pos.y + 4.5, rad: 2.6, mesh: window.playerLoco });
          return obsList;
        }

        function computeSightlineOcclusionPenalty(camOrigin, targetPt, obstacles, animalRootMesh) {
          var penalty = 0.0;
          var segX = targetPt.x - camOrigin.x;
          var segY = targetPt.y - camOrigin.y;
          var segZ = targetPt.z - camOrigin.z;
          var segLenSqXZ = segX * segX + segZ * segZ;
          var segLenXZ = Math.sqrt(segLenSqXZ);
          if (segLenXZ < 0.1) return 0.0;

          // A) Analytical 3D Cylinder/Segment Intersection against all nearby obstacles
          for (var oi = 0; oi < obstacles.length; oi++) {
            var ob = obstacles[oi];
            if (ob.mesh && ob.mesh === animalRootMesh) continue;
            var toObX = ob.x - camOrigin.x;
            var toObZ = ob.z - camOrigin.z;
            var u = (toObX * segX + toObZ * segZ) / segLenSqXZ;
            // Only check obstacles strictly between camera (u > 0.05) and animal (u < 0.96)
            if (u > 0.05 && u < 0.96) {
              var closestX = camOrigin.x + u * segX;
              var closestZ = camOrigin.z + u * segZ;
              var rayYAtU = camOrigin.y + u * segY;
              if (rayYAtU >= (ob.minY - 0.5) && rayYAtU <= (ob.maxY + 0.5)) {
                var distXZ = Math.hypot(ob.x - closestX, ob.z - closestZ);
                if (distXZ < ob.rad) {
                  penalty += 100.0 * (1.0 - distXZ / ob.rad);
                } else if (distXZ < ob.rad + 1.8) {
                  penalty += 18.0 * (1.0 - (distXZ - ob.rad) / 1.8);
                }
              }
            }
          }

          // B) THREE.Raycaster check if available on the runtime THREE object
          if (typeof THREE.Raycaster === 'function' && scene && scene.children) {
            try {
              if (!window._animalCamRaycaster) {
                window._animalCamRaycaster = new THREE.Raycaster();
              }
              var rc = window._animalCamRaycaster;
              if (typeof camera !== 'undefined' && camera) {
                rc.camera = camera;
              }
              var rayDir = targetPt.clone().sub(camOrigin);
              var totalDist = rayDir.length();
              if (totalDist > 1.0) {
                rayDir.divideScalar(totalDist);
                rc.set(camOrigin, rayDir);
                rc.near = 1.5;
                rc.far = Math.max(2.0, totalDist - 1.6);
                var testMeshes = [];
                for (var oi2 = 0; oi2 < obstacles.length; oi2++) {
                  if (obstacles[oi2].mesh && obstacles[oi2].mesh !== animalRootMesh) {
                    testMeshes.push(obstacles[oi2].mesh);
                  }
                }
                if (testMeshes.length > 0 && typeof rc.intersectObjects === 'function') {
                  var hits = rc.intersectObjects(testMeshes, true);
                  if (hits && hits.length > 0) {
                    penalty += 120.0;
                  }
                }
              }
            } catch (rcErr) {}
          }

          return penalty;
        }

        function buildSmallCharacterCandidate(spec) {
          if (!spec || !spec.anchorPos || !spec.focusPos) return null;
          var w = computeSpatialPoiWeight(spec.anchorPos, spec);
          if (spec.activeBoost && w > 0.05) {
            w = Math.min(1.0, Math.max(w, 0.85));
          }
          if (w <= 0.005) return null;

          var toCharX = spec.focusPos.x - pos.x;
          var toCharZ = spec.focusPos.z - pos.z;
          var sideDot = toCharX * trackRight.x + toCharZ * trackRight.z;
          var sideSign = (sideDot >= 0.0) ? 1.0 : -1.0;

          // Evaluate 7 panoramic candidate vantages (keeping panoramic distance ~45-48m and height ~14.2m, NO zoom!)
          var baseBack = spec.camBack || 46.5;
          var baseH = spec.camHeight || 14.2;
          var lateralMultipliers = [1.0, 1.55, 0.45, 2.15, -0.65, 2.75, -1.25];
          var heightOffsets = [0.0, 0.5, 0.0, 1.4, 0.8, 2.4, 1.6];
          var backOffsets = [0.0, -2.5, 2.0, -5.0, 0.0, -6.5, -2.0];

          var obstacles = gatherAnimalObstacles();
          var bestPos = null;
          var bestLook = null;
          var bestCost = 999999.0;

          for (var ai = 0; ai < lateralMultipliers.length; ai++) {
            var latShift = (spec.camLateralShift !== undefined ? spec.camLateralShift : (sideSign * 6.8)) * lateralMultipliers[ai];
            var candBack = baseBack + backOffsets[ai];
            var candH = baseH + heightOffsets[ai];

            var candPos = new THREE.Vector3(
              pos.x - forwardDir.x * candBack + trackRight.x * latShift,
              pos.y + candH,
              pos.z - forwardDir.z * candBack + trackRight.z * latShift
            );

            // Gentle panoramic pan toward the animal while preserving the forward horizon look-ahead!
            var lookShare = spec.lookShare || 0.32;
            var animalWorldLook = new THREE.Vector3(
              spec.focusPos.x,
              Math.max(pos.y + 4.8, spec.focusPos.y + 1.8),
              spec.focusPos.z
            );
            var candLook = behindTrainCamLook.clone().lerp(animalWorldLook, lookShare);

            // Check 1: Raycast / Cylinder occlusion between camera and animal
            var occPenalty = computeSightlineOcclusionPenalty(candPos, spec.focusPos, obstacles, spec.animalRootMesh);

            // Check 2: Verify both animal and locomotive project cleanly inside the panoramic frame
            var prAnimal = projectWorldPointToNDC(spec.focusPos, candPos, candLook, baseDrivingFov, camAspect);
            var prLoco = projectWorldPointToNDC(new THREE.Vector3(pos.x, pos.y + 2.2, pos.z), candPos, candLook, baseDrivingFov, camAspect);
            var framePenalty = 0.0;
            if (prAnimal.behind || Math.abs(prAnimal.x) > 0.78 || prAnimal.y < -0.75 || prAnimal.y > 0.68) {
              framePenalty += 45.0;
            }
            if (prLoco.behind || Math.abs(prLoco.x) > 0.80 || prLoco.y < -0.78 || prLoco.y > 0.55) {
              framePenalty += 35.0;
            }

            // Prefer minimal deviation from the primary panoramic angle unless occluded
            var angleDeviationCost = ai * 2.2;
            var totalCost = occPenalty + framePenalty + angleDeviationCost;
            if (totalCost < bestCost) {
              bestCost = totalCost;
              bestPos = candPos;
              bestLook = candLook;
              if (occPenalty === 0.0 && framePenalty === 0.0) break;
            }
          }

          return {
            id: spec.id,
            narrationId: spec.narrationId || spec.id,
            category: 'small',
            weight: w,
            priority: spec.priority || 1.16,
            camPos: bestPos,
            camLook: bestLook,
            targetFov: baseDrivingFov // Strictly 46.0° (NO zoom on small animals!)
          };
        }

        var candidates = [];

        if (!window.pState.inSubway) {
          // ------------------------------------------------------------------
          // CATEGORY B: SMALL CHARACTERS & ANIMALS (Panoramic, Zoom-Free, Occlusion-Free)
          // ------------------------------------------------------------------
          var sbChars = window.storybookInteractiveCharacters;
          if (sbChars) {
            // 1) Two Track Monsters (`Strašidla sedící na kolejích`)
            if (sbChars.monsters && sbChars.monsters.length) {
              for (var mIdx = 0; mIdx < sbChars.monsters.length; mIdx++) {
                var mInst = sbChars.monsters[mIdx];
                if (!mInst || !mInst.model || !mInst.model.root) continue;
                var mRootPos = mInst.model.root.position;
                var mDistToTrain = pos.distanceTo(mInst.trackCenterPos);
                var mActiveAnim = (
                  mInst.state === 'STARTLED' ||
                  mInst.state === 'RUNNING_OFF' ||
                  (mInst.state === 'HIDING_PEEKING' && mInst.stateTimer < 4.2) ||
                  Boolean(mInst.preStartleHornTriggered) ||
                  (mInst.state === 'SITTING' && mDistToTrain <= 64.0)
                );
                var treeSideDot = (-mInst.perp.x) * trackRight.x + (-mInst.perp.z) * trackRight.z;
                var treeLateralShift = (treeSideDot >= 0.0 ? 1.0 : -1.0) * 7.2;

                var mCand = buildSmallCharacterCandidate({
                  id: 'monster_' + mIdx,
                  narrationId: 'monster_' + mIdx,
                  anchorPos: mInst.trackCenterPos,
                  focusPos: new THREE.Vector3(mRootPos.x, mRootPos.y + 2.1, mRootPos.z),
                  animalRootMesh: mInst.model.root,
                  approachDist: 82.0,
                  peakAheadDist: 42.0,
                  peakBehindDist: -14.0,
                  departDist: 36.0,
                  maxPerpDist: 36.0,
                  camBack: 44.0,
                  camLateralShift: treeLateralShift,
                  camHeight: 14.2,
                  lookShare: 0.36,
                  priority: 1.32,
                  activeBoost: mActiveAnim
                });
                if (mCand) candidates.push(mCand);
              }
            }

            // 2) White Rabbit (`Králík u cesty`)
            if (sbChars.rabbit && sbChars.rabbit.obj && sbChars.rabbit.worldPos) {
              var rState = sbChars.rabbit;
              var rHopY = (rState.obj.bodyGroup && rState.obj.bodyGroup.position) ? rState.obj.bodyGroup.position.y * 0.45 : 0.0;
              var rCand = buildSmallCharacterCandidate({
                id: 'rabbit',
                narrationId: 'rabbit',
                anchorPos: rState.trackAnchorPos || rState.worldPos,
                focusPos: new THREE.Vector3(rState.worldPos.x, rState.worldPos.y + 1.85 + rHopY, rState.worldPos.z),
                animalRootMesh: rState.obj.root,
                approachDist: 52.0,
                peakAheadDist: 18.0,
                peakBehindDist: -8.0,
                departDist: 28.0,
                maxPerpDist: 28.0,
                camBack: 46.0,
                camHeight: 14.0,
                lookShare: 0.30,
                priority: 1.18,
                activeBoost: (rState.state === 'HOPPING_AND_WAVING')
              });
              if (rCand) candidates.push(rCand);
            }

            // 3) Orange Squirrel (`Veverka u stromu` — uses true world coordinates of `squirrelGroup`)
            if (sbChars.squirrel && sbChars.squirrel.obj && sbChars.squirrel.worldPos) {
              var sqState = sbChars.squirrel;
              var sqWorldPt = new THREE.Vector3(sqState.worldPos.x, sqState.worldPos.y + 2.4, sqState.worldPos.z);
              if (sqState.obj.squirrelGroup && typeof sqState.obj.envGroup.localToWorld === 'function') {
                sqWorldPt.copy(sqState.obj.squirrelGroup.position);
                sqState.obj.envGroup.localToWorld(sqWorldPt);
                sqWorldPt.y += 0.9;
              }
              var sqCand = buildSmallCharacterCandidate({
                id: 'squirrel',
                narrationId: 'squirrel',
                anchorPos: sqState.trackAnchorPos || sqState.worldPos,
                focusPos: sqWorldPt,
                animalRootMesh: sqState.obj.squirrelGroup,
                approachDist: 52.0,
                peakAheadDist: 18.0,
                peakBehindDist: -8.0,
                departDist: 28.0,
                maxPerpDist: 28.0,
                camBack: 46.0,
                camHeight: 14.2,
                lookShare: 0.32,
                priority: 1.18,
                activeBoost: (sqState.state === 'SPIN_AND_LEAP')
              });
              if (sqCand) candidates.push(sqCand);
            }

            // 4) Friendly Owl (`Sova u stromu` — uses true world coordinates of `owlGroup`)
            if (sbChars.owl && sbChars.owl.obj && sbChars.owl.worldPos) {
              var oState = sbChars.owl;
              var owlWorldPt = new THREE.Vector3(oState.worldPos.x, oState.worldPos.y + 4.85, oState.worldPos.z);
              if (oState.obj.owlGroup && typeof oState.obj.envGroup.localToWorld === 'function') {
                owlWorldPt.copy(oState.obj.owlGroup.position);
                oState.obj.envGroup.localToWorld(owlWorldPt);
                owlWorldPt.y += 0.8;
              }
              var oCand = buildSmallCharacterCandidate({
                id: 'owl',
                narrationId: 'owl',
                anchorPos: oState.trackAnchorPos || oState.worldPos,
                focusPos: owlWorldPt,
                animalRootMesh: oState.obj.owlGroup,
                approachDist: 52.0,
                peakAheadDist: 18.0,
                peakBehindDist: -8.0,
                departDist: 28.0,
                maxPerpDist: 28.0,
                camBack: 46.0,
                camHeight: 14.2,
                lookShare: 0.32,
                priority: 1.18,
                activeBoost: (oState.state === 'GREETING')
              });
              if (oCand) candidates.push(oCand);
            }
          }

          // 5) Daisy the Friendly Cow (`Kravička`)
          if (window.daisyTheCow && window.daisyTheCow.position) {
            var cowP = window.daisyTheCow.position;
            var cowCand = buildSmallCharacterCandidate({
              id: 'cow',
              narrationId: 'cow',
              anchorPos: cowP,
              focusPos: new THREE.Vector3(cowP.x, cowP.y + 2.0, cowP.z),
              animalRootMesh: window.daisyTheCow,
              approachDist: 48.0,
              peakAheadDist: 16.0,
              peakBehindDist: -6.0,
              departDist: 26.0,
              maxPerpDist: 28.0,
              camBack: 46.5,
              camHeight: 14.2,
              lookShare: 0.28,
              priority: 1.12,
              activeBoost: false
            });
            if (cowCand) candidates.push(cowCand);
          }

          // 6) Fluffy Sheep Flocks (`Ovečky`)
          if (window.trackSheepFlocks) {
            for (var sfi = 0; sfi < window.trackSheepFlocks.length; sfi++) {
              var fl = window.trackSheepFlocks[sfi];
              if (fl && fl.basePos) {
                var shPos = (fl.group && fl.group.position) ? fl.group.position : fl.basePos;
                var shCand = buildSmallCharacterCandidate({
                  id: 'sheep_' + sfi,
                  narrationId: 'sheep_' + sfi,
                  anchorPos: fl.basePos,
                  focusPos: new THREE.Vector3(shPos.x, shPos.y + 1.6, shPos.z),
                  animalRootMesh: fl.group,
                  approachDist: 48.0,
                  peakAheadDist: 16.0,
                  peakBehindDist: -6.0,
                  departDist: 26.0,
                  maxPerpDist: 28.0,
                  camBack: 46.5,
                  camHeight: 14.2,
                  lookShare: 0.28,
                  priority: 1.10,
                  activeBoost: false
                });
                if (shCand) candidates.push(shCand);
              }
            }
          }

          // ------------------------------------------------------------------
          // CATEGORY A: LARGE LANDMARKS (Full 3D Bounding-Box Frustum Fit)
          // ------------------------------------------------------------------
          // 1) HSBC Rain Vortex Waterfall inside Jewel (`jewel`)
          if ((edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST') &&
              window.jewelDomeCenterWorld && window.jewelVortexWorldPos && window.jewelInwardLeftVec) {
            var jCand = buildLargeLandmarkCandidate({
              id: 'jewel',
              narrationId: 'jewel',
              center: window.jewelVortexWorldPos,
              baseY: window.jewelDomeCenterWorld.y,
              height: 28.0,
              radius: 26.0,
              approachDist: 68.0,
              peakAheadDist: 18.0,
              peakBehindDist: -12.0,
              departDist: 38.0,
              maxPerpDist: 56.0,
              camBack: 42.0,
              camOppositeSide: 16.0,
              camHeight: 14.5,
              lookShare: 0.60,
              targetFov: 48.0,
              priority: 1.12
            });
            if (jCand) candidates.push(jCand);
          }

          // 2) Eiffel Tower (`eiffel`, H = 76.5m at -108, 7.35, -266)
          if (window.eiffelWorldCenter) {
            var eifCand = buildLargeLandmarkCandidate({
              id: 'eiffel',
              narrationId: 'eiffel',
              center: window.eiffelWorldCenter,
              baseY: window.eiffelWorldCenter.y,
              height: 76.8,
              radius: 24.0,
              approachDist: 120.0,
              peakAheadDist: 32.0,
              peakBehindDist: -18.0,
              departDist: 64.0,
              maxPerpDist: 112.0,
              camBack: 66.0,
              camOppositeSide: 28.0,
              camHeight: 16.5,
              lookShare: 0.68,
              targetFov: 50.0,
              priority: 1.10
            });
            if (eifCand) candidates.push(eifCand);
          }

          // 3) Roman Colosseum (`colosseum`, H = 26m, W = 64m at 115, cy, 258)
          if (window.colosseumWorldCenter) {
            var colCand = buildLargeLandmarkCandidate({
              id: 'colosseum',
              narrationId: 'colosseum',
              center: window.colosseumWorldCenter,
              baseY: window.colosseumWorldCenter.y,
              height: 28.0,
              radius: 34.0,
              approachDist: 105.0,
              peakAheadDist: 26.0,
              peakBehindDist: -14.0,
              departDist: 54.0,
              maxPerpDist: 102.0,
              camBack: 54.0,
              camOppositeSide: 22.0,
              camHeight: 16.0,
              lookShare: 0.60,
              targetFov: 48.0,
              priority: 1.06
            });
            if (colCand) candidates.push(colCand);
          }

          // 4) Mom & Dad's House in Vietnam (`mom_house`)
          if (window.momHouseWorldCenter) {
            var momCand = buildLargeLandmarkCandidate({
              id: 'mom_house',
              narrationId: 'mom_house',
              center: window.momHouseWorldCenter,
              baseY: window.momHouseWorldCenter.y,
              height: 17.0,
              radius: 28.0,
              approachDist: 88.0,
              peakAheadDist: 22.0,
              peakBehindDist: -10.0,
              departDist: 44.0,
              maxPerpDist: 88.0,
              camBack: 48.0,
              camOppositeSide: 18.0,
              camHeight: 14.8,
              lookShare: 0.56,
              targetFov: 47.0,
              priority: 1.04
            });
            if (momCand) candidates.push(momCand);
          }

          // 5) Grandma & Grandpa's House in Bohumín (`grandma_house`)
          if (window.grandmaHouseWorldCenter) {
            var gmaCand = buildLargeLandmarkCandidate({
              id: 'grandma_house',
              narrationId: 'grandma_house',
              center: window.grandmaHouseWorldCenter,
              baseY: window.grandmaHouseWorldCenter.y,
              height: 24.0,
              radius: 30.0,
              approachDist: 88.0,
              peakAheadDist: 22.0,
              peakBehindDist: -10.0,
              departDist: 44.0,
              maxPerpDist: 88.0,
              camBack: 50.0,
              camOppositeSide: 19.0,
              camHeight: 15.2,
              lookShare: 0.58,
              targetFov: 47.5,
              priority: 1.04
            });
            if (gmaCand) candidates.push(gmaCand);
          }

          // 6) International Airport (`airport` on J_NE->J_EAST at 324, 0, -64)
          var airCand = buildLargeLandmarkCandidate({
            id: 'airport',
            narrationId: 'airport',
            center: new THREE.Vector3(324, 0, -64),
            baseY: 0.0,
            height: 40.0,
            radius: 54.0,
            approachDist: 115.0,
            peakAheadDist: 28.0,
            peakBehindDist: -16.0,
            departDist: 58.0,
            maxPerpDist: 115.0,
            camBack: 58.0,
            camOppositeSide: 24.0,
            camHeight: 16.5,
            lookShare: 0.62,
            targetFov: 49.0,
            priority: 1.05
          });
          if (airCand) candidates.push(airCand);

          // 7) Champions Soccer Stadium (`stadium` on J_SOUTH->J_SW at -115, stY, 282)
          // High aerial vantage (`camHeight: 54.0m`) so the camera looks cleanly OVER the 12m outer stadium wall/canopy
          // right onto the green soccer pitch, 6 running players (`window.soccerPlayers`), and ball (`window.soccerBall`)!
          var stadY = (typeof window.getTerrainHeight === 'function') ? window.getTerrainHeight(-115, 282) : 0.0;
          var stadCand = buildLargeLandmarkCandidate({
            id: 'stadium',
            narrationId: 'stadium',
            center: new THREE.Vector3(-115, stadY, 282),
            baseY: stadY,
            height: 22.0,
            radius: 38.0,
            lookHeightOffset: 1.8,
            minCamHeight: 52.0,
            approachDist: 108.0,
            peakAheadDist: 28.0,
            peakBehindDist: -18.0,
            departDist: 56.0,
            maxPerpDist: 112.0,
            camBack: 44.0,
            camOppositeSide: 12.0,
            camHeight: 54.0,
            lookShare: 0.66,
            targetFov: 50.0,
            priority: 1.06
          });
          if (stadCand) candidates.push(stadCand);

          // 8) Big Ben Clocktower (`bigben`, H = 74m on J_SW->J_WEST at -286, by, 92)
          var benY = (typeof window.getTerrainHeight === 'function') ? window.getTerrainHeight(-286, 92) : 0.0;
          var benCand = buildLargeLandmarkCandidate({
            id: 'bigben',
            narrationId: 'bigben',
            center: new THREE.Vector3(-286, benY, 92),
            baseY: benY,
            height: 74.0,
            radius: 20.0,
            approachDist: 112.0,
            peakAheadDist: 28.0,
            peakBehindDist: -14.0,
            departDist: 56.0,
            maxPerpDist: 110.0,
            camBack: 64.0,
            camOppositeSide: 26.0,
            camHeight: 16.5,
            lookShare: 0.66,
            targetFov: 49.5,
            priority: 1.03
          });
          if (benCand) candidates.push(benCand);

          // 9) Crystal Skyscraper (`skyscraper`, H = 87m on J_NORTH->J_CENTER at -52, sy, -108)
          var skyY = (typeof window.getTerrainHeight === 'function') ? window.getTerrainHeight(-52, -108) : 0.0;
          var skyCand = buildLargeLandmarkCandidate({
            id: 'skyscraper',
            narrationId: 'skyscraper',
            center: new THREE.Vector3(-52, skyY, -108),
            baseY: skyY,
            height: 86.0,
            radius: 20.0,
            approachDist: 105.0,
            peakAheadDist: 24.0,
            peakBehindDist: -12.0,
            departDist: 52.0,
            maxPerpDist: 98.0,
            camBack: 66.0,
            camOppositeSide: 26.0,
            camHeight: 16.8,
            lookShare: 0.68,
            targetFov: 50.0,
            priority: 1.01
          });
          if (skyCand) candidates.push(skyCand);

          // 10) Central Fountain Plaza (`fountain` at 32, fy, 6)
          var fntY = (typeof window.getTerrainHeight === 'function') ? window.getTerrainHeight(32, 6) : 0.0;
          var fntCand = buildLargeLandmarkCandidate({
            id: 'fountain',
            narrationId: 'fountain',
            center: new THREE.Vector3(32, fntY, 6),
            baseY: fntY,
            height: 15.0,
            radius: 20.0,
            approachDist: 78.0,
            peakAheadDist: 18.0,
            peakBehindDist: -8.0,
            departDist: 38.0,
            maxPerpDist: 74.0,
            camBack: 48.0,
            camOppositeSide: 16.0,
            camHeight: 14.5,
            lookShare: 0.52,
            targetFov: 46.5,
            priority: 0.99
          });
          if (fntCand) candidates.push(fntCand);

          // 11) Bangkok Chao Phraya River Adventure POIs (Anantara Resort, Anantara Boat, IconSiam, Railway Bridge)
          if (typeof window.appendBangkokCameraCandidates === 'function') {
            window.appendBangkokCameraCandidates(candidates, buildLargeLandmarkCandidate);
          }
        }

        // --------------------------------------------------------------------
        // 6. SELECT SINGLE BEST POI WITH HYSTERESIS (PREVENT CAMERA FLICKERING)
        // --------------------------------------------------------------------
        var bestPoi = null;
        var bestScore = 0.0;
        var currentActiveCand = null;

        for (var ci = 0; ci < candidates.length; ci++) {
          var cand = candidates[ci];
          var isCurrent = (cand.id === cs.activePoiId);
          if (isCurrent) currentActiveCand = cand;
          var hysteresisBoost = isCurrent ? 1.25 : 1.0;
          var score = cand.weight * cand.priority * hysteresisBoost;
          if (score > bestScore) {
            bestScore = score;
            bestPoi = cand;
          }
        }

        // Enforce a 1.4s minimum hold before switching from one valid POI to another
        if (bestPoi && cs.activePoiId && bestPoi.id !== cs.activePoiId && currentActiveCand && currentActiveCand.weight > 0.12) {
          if ((nowMs - cs.activePoiSwitchMs) < 1400) {
            bestPoi = currentActiveCand;
          }
        }

        if (bestPoi && bestPoi.weight > 0.02) {
          if (cs.activePoiId !== bestPoi.id) {
            cs.activePoiId = bestPoi.id;
            cs.activePoiSwitchMs = nowMs;
          }
          if (bestPoi.weight >= 0.52) {
            var lastNarrMs = cs.narratedReadyMap[bestPoi.id] || -99999;
            if ((nowMs - lastNarrMs) > 14000) {
              cs.narratedReadyMap[bestPoi.id] = nowMs;
              if (typeof window.triggerEnglishShowcaseNarration === 'function') {
                window.triggerEnglishShowcaseNarration(bestPoi.narrationId);
              }
            }
          }
        } else if (!bestPoi || bestPoi.weight <= 0.008) {
          if (cs.poiWeight < 0.02) {
            cs.activePoiId = null;
          }
        }

        var activeIdsNow = {};
        for (var aIdx = 0; aIdx < candidates.length; aIdx++) {
          activeIdsNow[candidates[aIdx].id] = candidates[aIdx].weight;
        }
        for (var kId in cs.narratedReadyMap) {
          if (Object.prototype.hasOwnProperty.call(cs.narratedReadyMap, kId)) {
            if (!activeIdsNow[kId] || activeIdsNow[kId] < 0.02) {
              if ((nowMs - cs.narratedReadyMap[kId]) > 4500) {
                delete cs.narratedReadyMap[kId];
              }
            }
          }
        }

        var isMonsterPoi = Boolean(bestPoi && bestPoi.id && bestPoi.id.indexOf('monster_') === 0);
        var poiBlendSmoothTime = isMonsterPoi
          ? 0.28
          : (bestPoi
              ? Math.max(0.40, 0.62 - cs.speedBlend * 0.16)
              : Math.max(0.52, 0.76 - cs.speedBlend * 0.16));
        var targetPoiWeight = bestPoi ? bestPoi.weight : 0.0;
        cs.poiWeight = smoothDampScalar(cs.poiWeight, targetPoiWeight, cs, 'poiWeightVel', poiBlendSmoothTime, dtCam, 2.6);
        window._unifiedShowcaseBlend = cs.poiWeight;

        if (bestPoi) {
          var desiredOffset = bestPoi.camPos.clone().sub(baseDrivingCamPos);
          var offsetSmooth = isMonsterPoi ? 0.30 : 0.48;
          var lookSmooth = isMonsterPoi ? 0.28 : 0.44;
          smoothDampVec3(cs.poiOffsetPos, desiredOffset, cs.poiOffsetPosVel, offsetSmooth, dtCam, 65.0);
          smoothDampVec3(cs.poiLookPoint, bestPoi.camLook, cs.poiLookVel, lookSmooth, dtCam, 75.0);
          cs.poiTargetFov = bestPoi.targetFov || baseDrivingFov;
        } else {
          smoothDampVec3(cs.poiLookPoint, baseDrivingCamLook, cs.poiLookVel, 0.50, dtCam, 60.0);
          cs.poiTargetFov = baseDrivingFov;
        }

        // --------------------------------------------------------------------
        // 7. AUDIO, TRANSPARENCY & GENTLE MONSTER SAFETY CRAWL
        // --------------------------------------------------------------------
        if (window.updateJewelWaterfallAudio) {
          var distToVortex = window.jewelVortexWorldPos ? pos.distanceTo(window.jewelVortexWorldPos) : 999.0;
          var isInsideJewelNow = (!window.pState.inSubway && (edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST') && ct >= 0.20 && ct <= 0.88);
          var proximityGain = (!window.pState.inSubway && distToVortex < 95.0)
            ? Math.pow(Math.max(0.0, 1.0 - distToVortex / 95.0), 1.6) * 0.18
            : 0.0;
          var insideBoost = isInsideJewelNow ? 0.24 : 0.0;
          var jewelFocusBoost = (cs.activePoiId === 'jewel' ? cs.poiWeight : 0.0) * 0.42;
          var targetWfVol = Math.min(0.48, Math.max(proximityGain, insideBoost) + jewelFocusBoost);
          window.updateJewelWaterfallAudio(targetWfVol, (cs.activePoiId === 'jewel' ? cs.poiWeight : 0.0));
        }

        if (window.jewelGlassDomeMat) {
          var insideJewelForGlass = (!window.pState.inSubway && (edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST') && ct >= 0.18 && ct <= 0.88);
          var desiredDomeOpacity = insideJewelForGlass ? 0.28 : 0.64;
          window.jewelGlassDomeMat.opacity += (desiredDomeOpacity - window.jewelGlassDomeMat.opacity) * (1.0 - Math.exp(-6.0 * dtCam));
        }

        if (window.skyscraperLandmarkGroup) {
          var hideSkyForEiffel = Boolean(cs.poiWeight > 0.18 && cs.activePoiId === 'eiffel');
          window.skyscraperLandmarkGroup.visible = !hideSkyForEiffel;
        }
        if (cs.poiWeight > 0.05 && window.tunnelRoofMeshes) {
          for (var tri = 0; tri < window.tunnelRoofMeshes.length; tri++) {
            var trm = window.tunnelRoofMeshes[tri];
            if (trm && typeof trm.opacity === 'number') {
              trm.opacity = Math.min(trm.opacity, Math.max(0.18, 1.0 - cs.poiWeight * 0.82));
            }
          }
        }

        if (window._storybookMonsterHoldCrawl && window.pState && window.pState.currentVel > 0.015) {
          var crawlTarget = window._storybookMonsterStopWait ? 0.010 : 0.032;
          window.pState.currentVel += (crawlTarget - window.pState.currentVel) * (1.0 - Math.exp(-12.0 * dtCam));
        } else if ((window._storybookSlowdownRequested || (cs.poiWeight > 0.28 && cs.activePoiId)) && window.pState && window.pState.currentVel > 0.125) {
          window.pState.currentVel += (0.12 - window.pState.currentVel) * (1.0 - Math.exp(-6.0 * dtCam));
        }

        // --------------------------------------------------------------------
        // 8. TERRAIN & BUILDING COLLISION AVOIDANCE + FINAL STEADICAM DAMPING
        // --------------------------------------------------------------------
        if (!window.pState.inSubway) {
          var finalTargetCam = baseDrivingCamPos.clone().addScaledVector(cs.poiOffsetPos, cs.poiWeight);
          var finalTargetLook = baseDrivingCamLook.clone().lerp(cs.poiLookPoint, cs.poiWeight);

          if (typeof window.getTerrainHeight === 'function') {
            var terrAtCam = window.getTerrainHeight(finalTargetCam.x, finalTargetCam.z);
            var midX = 0.5 * (finalTargetCam.x + pos.x);
            var midZ = 0.5 * (finalTargetCam.z + pos.z);
            var terrAtMid = window.getTerrainHeight(midX, midZ);
            var minSafeY = Math.max(terrAtCam + 5.2, terrAtMid + 4.2, pos.y + 8.0);
            if (finalTargetCam.y < minSafeY) {
              finalTargetCam.y = minSafeY;
            }
          }

          var solidObstacles = [
            { pos: window.eiffelWorldCenter, rad: 24.0, maxH: 77.0 },
            { pos: window.colosseumWorldCenter, rad: 32.0, maxH: 28.0 },
            { pos: window.momHouseWorldCenter, rad: 18.0, maxH: 18.0 },
            { pos: window.grandmaHouseWorldCenter, rad: 18.0, maxH: 24.0 },
            { pos: new THREE.Vector3(105, 0, 56), rad: 15.0, maxH: 46.0 },
            { pos: new THREE.Vector3(-102, 0, -56), rad: 17.0, maxH: 54.0 },
            { pos: new THREE.Vector3(-255, 0, 128), rad: 28.0, maxH: 26.0 }
          ];
          if (Array.isArray(window.bangkokObstacles)) {
            for (var boi = 0; boi < window.bangkokObstacles.length; boi++) {
              solidObstacles.push(window.bangkokObstacles[boi]);
            }
          }
          for (var oi = 0; oi < solidObstacles.length; oi++) {
            var obs = solidObstacles[oi];
            if (obs && obs.pos && finalTargetCam.y < (obs.pos.y + obs.maxH)) {
              var odx = finalTargetCam.x - obs.pos.x;
              var odz = finalTargetCam.z - obs.pos.z;
              var odist = Math.hypot(odx, odz);
              if (odist < obs.rad && odist > 0.001) {
                var pushScale = obs.rad / odist;
                finalTargetCam.x = obs.pos.x + odx * pushScale;
                finalTargetCam.z = obs.pos.z + odz * pushScale;
              }
            }
          }

          var camPosSmoothTime = Math.max(0.30, 0.44 - cs.speedBlend * 0.10);
          var camLookSmoothTime = Math.max(0.26, 0.38 - cs.speedBlend * 0.08);
          smoothDampVec3(cs.pos, finalTargetCam, cs.posVel, camPosSmoothTime, dtCam, 90.0);
          smoothDampVec3(cs.look, finalTargetLook, cs.lookVel, camLookSmoothTime, dtCam, 100.0);

          var desiredFov = baseDrivingFov + (cs.poiTargetFov - baseDrivingFov) * cs.poiWeight;
          cs.fov = smoothDampScalar(cs.fov, desiredFov, cs, 'fovVel', 0.44, dtCam, 25.0);
          if (cameraArg && typeof cameraArg.fov === 'number' && typeof cameraArg.updateProjectionMatrix === 'function') {
            if (Math.abs(cameraArg.fov - cs.fov) > 0.01) {
              cameraArg.fov = cs.fov;
              cameraArg.updateProjectionMatrix();
            }
          }

          window._enhancerCamPos = cs.pos;
          window._enhancerCamLook = cs.look;
          window.smoothCamPos.copy(cs.pos);
          window.smoothCamLook.copy(cs.look);
          cameraArg.position.copy(cs.pos);
          cameraArg.lookAt(cs.look);
        } else {
          // Inside underground Metro caverns: keep `game.js` 2.5D underground diorama camera untouched
          cs.pos.copy(window.smoothCamPos);
          cs.look.copy(window.smoothCamLook);
          cs.posVel.set(0, 0, 0);
          cs.lookVel.set(0, 0, 0);
          window._enhancerCamPos = cs.pos;
          window._enhancerCamLook = cs.look;
        }
      }
    } catch (err) {}

    return origRender(sceneArg, cameraArg);
  };
})();

// ============================================================================
// REALISTIC ACOUSTIC WATERFALL SOUND ENGINE (For Jewel Rain Vortex),
// AUTHENTIC MULTI-CHIME STEAM LOCOMOTIVE WHISTLE (`window.playTrainHorn`),
// FRIEND TRAIN GREETING WHISTLE (`window.playFriendTrainGreetingHorn`), &
// VARIED ENGLISH VOICE LINES + EDUCATIONAL OBJECT DESCRIPTIONS FOR KIDS
// ============================================================================
(function installRealisticWaterfallAndSteamWhistleAudio() {
  var wfNodes = null;
  var currentWfGain = 0.0;

  function ensureWaterfallAudioGraph() {
    if (wfNodes) return wfNodes;
    if (!hasUserGesture || !audioCtx) return null;
    try {
      var sr = audioCtx.sampleRate || 44100;
      var loopSec = 4.0;
      var len = Math.floor(sr * loopSec);
      var buf = audioCtx.createBuffer(2, len, sr);

      for (var ch = 0; ch < 2; ch++) {
        var data = buf.getChannelData(ch);
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        var brown = 0;
        for (var i = 0; i < len; i++) {
          var t = i / sr;
          var loopAng = (i / len) * Math.PI * 2.0;
          var white = Math.random() * 2.0 - 1.0;

          // Paul Kellet's Pink Noise filter (natural 1/f cascading water spectrum)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          var pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
          b6 = white * 0.115926;

          // Deep Brown Noise (heavy plunge pool water mass)
          brown = (brown + 0.02 * white) / 1.02;
          var deepRumble = brown * 0.42;

          var surge1 = 0.86 + 0.14 * Math.sin(loopAng * 2.0 + ch * 1.1);
          var surge2 = 0.90 + 0.10 * Math.cos(loopAng * 5.0 - ch * 0.8);
          var dropletSparkle = white * 0.065 * (0.75 + 0.25 * Math.sin(loopAng * 11.0 + t * 3.0));

          data[i] = (deepRumble * surge1 + pink * surge2 + dropletSparkle) * 0.85;
        }
      }

      var src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      var lpFilter = audioCtx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);
      lpFilter.Q.setValueAtTime(0.65, audioCtx.currentTime);

      var poolEq = audioCtx.createBiquadFilter();
      poolEq.type = 'peaking';
      poolEq.frequency.setValueAtTime(185, audioCtx.currentTime);
      poolEq.Q.setValueAtTime(0.9, audioCtx.currentTime);
      poolEq.gain.setValueAtTime(5.5, audioCtx.currentTime);

      var masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      src.connect(poolEq);
      poolEq.connect(lpFilter);
      lpFilter.connect(masterGain);
      masterGain.connect(audioCtx.destination);
      src.start(0);

      wfNodes = {
        src: src,
        lpFilter: lpFilter,
        masterGain: masterGain
      };
      return wfNodes;
    } catch (e) {
      return null;
    }
  }

  window.updateJewelWaterfallAudio = function(targetGain, closeUpBlend) {
    if (!hasUserGesture) return;
    if (targetGain > 0.005 && !wfNodes) {
      if (window.initAudio) window.initAudio();
      ensureWaterfallAudioGraph();
    }
    if (!wfNodes || !audioCtx) return;

    currentWfGain += (targetGain - currentWfGain) * 0.10;
    var now = audioCtx.currentTime;
    var safeGain = Math.max(0.0001, currentWfGain);
    wfNodes.masterGain.gain.setTargetAtTime(safeGain, now, 0.06);

    var targetCutoff = 1650 + (closeUpBlend || 0.0) * 3600;
    wfNodes.lpFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
  };

  // ==========================================================================
  // AUTHENTIC HERITAGE STEAM LOCOMOTIVE WHISTLE (`window.playTrainHorn`)
  // ==========================================================================
  var cachedBrassWave = null;
  var cachedWarmShaperCurve = null;

  function getSteamBrassPeriodicWave(ctx) {
    if (cachedBrassWave) return cachedBrassWave;
    var real = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    var imag = new Float32Array([0.0, 1.00, 0.42, 0.68, 0.24, 0.32, 0.12, 0.08]);
    cachedBrassWave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    return cachedBrassWave;
  }

  function getWarmBrassShaperCurve() {
    if (cachedWarmShaperCurve) return cachedWarmShaperCurve;
    var samples = 1024;
    var curve = new Float32Array(samples);
    for (var i = 0; i < samples; i++) {
      var x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * 1.85);
    }
    cachedWarmShaperCurve = curve;
    return cachedWarmShaperCurve;
  }

  window.playTrainHorn = function() {
    if (window.initAudio) window.initAudio();

    if (typeof spawnGlossyChimneyBurst === 'function') {
      spawnGlossyChimneyBurst(16);
      setTimeout(function() { spawnGlossyChimneyBurst(12); }, 140);
      setTimeout(function() { spawnGlossyChimneyBurst(10); }, 280);
    }

    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    var now = audioCtx.currentTime;
    var brassWave = getSteamBrassPeriodicWave(audioCtx);

    var hornBodyFilter = audioCtx.createBiquadFilter();
    hornBodyFilter.type = 'lowpass';
    hornBodyFilter.frequency.setValueAtTime(2350, now);
    hornBodyFilter.Q.setValueAtTime(1.15, now);

    var throatResonance = audioCtx.createBiquadFilter();
    throatResonance.type = 'peaking';
    throatResonance.frequency.setValueAtTime(880, now);
    throatResonance.Q.setValueAtTime(1.4, now);
    throatResonance.gain.setValueAtTime(4.5, now);

    var shaper = audioCtx.createWaveShaper();
    shaper.curve = getWarmBrassShaperCurve();
    shaper.oversample = '2x';

    var masterWhistleGain = audioCtx.createGain();
    masterWhistleGain.gain.setValueAtTime(0.26, now);

    var echoDelay1 = audioCtx.createDelay(1.0);
    echoDelay1.delayTime.setValueAtTime(0.175, now);
    var echoGain1 = audioCtx.createGain();
    echoGain1.gain.setValueAtTime(0.22, now);

    var echoDelay2 = audioCtx.createDelay(1.0);
    echoDelay2.delayTime.setValueAtTime(0.355, now);
    var echoGain2 = audioCtx.createGain();
    echoGain2.gain.setValueAtTime(0.11, now);

    var echoFilter = audioCtx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.setValueAtTime(1350, now);

    throatResonance.connect(hornBodyFilter);
    hornBodyFilter.connect(shaper);
    shaper.connect(masterWhistleGain);
    masterWhistleGain.connect(audioCtx.destination);

    masterWhistleGain.connect(echoFilter);
    echoFilter.connect(echoDelay1);
    echoDelay1.connect(echoGain1);
    echoGain1.connect(audioCtx.destination);
    echoFilter.connect(echoDelay2);
    echoDelay2.connect(echoGain2);
    echoGain2.connect(audioCtx.destination);

    var chimePipes = [
      { freq: 146.83, weight: 0.42, detune: -3.0 },
      { freq: 293.66, weight: 1.00, detune:  0.0 },
      { freq: 349.23, weight: 0.88, detune: +4.5 },
      { freq: 440.00, weight: 0.92, detune: -2.5 },
      { freq: 523.25, weight: 0.68, detune: +3.5 },
      { freq: 587.33, weight: 0.50, detune: -4.0 }
    ];

    var pulls = [
      { start: 0.02, dur: 0.44, level: 0.92, tailDrop: 0.965 },
      { start: 0.54, dur: 0.88, level: 1.00, tailDrop: 0.925 }
    ];

    var vibLfo = audioCtx.createOscillator();
    vibLfo.type = 'sine';
    vibLfo.frequency.setValueAtTime(5.8, now);
    var vibGain = audioCtx.createGain();
    vibGain.gain.setValueAtTime(2.6, now);
    vibLfo.connect(vibGain);
    vibLfo.start(now);
    vibLfo.stop(now + 1.65);

    pulls.forEach(function(pull) {
      var t0 = now + pull.start;
      var tAttack = t0 + 0.065;
      var tSustainEnd = t0 + pull.dur - 0.14;
      var tEnd = t0 + pull.dur;

      chimePipes.forEach(function(pipe) {
        var osc = audioCtx.createOscillator();
        if (brassWave) {
          osc.setPeriodicWave(brassWave);
        } else {
          osc.type = 'sawtooth';
        }
        osc.detune.setValueAtTime(pipe.detune, t0);

        var fBase = pipe.freq;
        osc.frequency.setValueAtTime(fBase * 0.945, t0);
        osc.frequency.exponentialRampToValueAtTime(fBase * 1.004, tAttack);
        osc.frequency.exponentialRampToValueAtTime(fBase, tAttack + 0.06);
        osc.frequency.setValueAtTime(fBase, tSustainEnd);
        osc.frequency.exponentialRampToValueAtTime(fBase * pull.tailDrop, tEnd);

        vibGain.connect(osc.frequency);

        var pGain = audioCtx.createGain();
        var peakVal = 0.16 * pipe.weight * pull.level;
        pGain.gain.setValueAtTime(0.0001, t0);
        pGain.gain.linearRampToValueAtTime(peakVal, tAttack);
        pGain.gain.setValueAtTime(peakVal * 0.92, tSustainEnd);
        pGain.gain.exponentialRampToValueAtTime(0.0001, tEnd);

        osc.connect(pGain);
        pGain.connect(throatResonance);

        osc.start(t0);
        osc.stop(tEnd + 0.02);
      });
    });

    try {
      var totalDur = 1.55;
      var bufLen = Math.floor(audioCtx.sampleRate * totalDur);
      var steamBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      var out = steamBuf.getChannelData(0);
      var lastSample = 0;
      for (var s = 0; s < bufLen; s++) {
        var w = Math.random() * 2.0 - 1.0;
        lastSample = 0.62 * lastSample + 0.38 * w;
        out[s] = lastSample;
      }

      var steamNoise = audioCtx.createBufferSource();
      steamNoise.buffer = steamBuf;

      var jetFilter = audioCtx.createBiquadFilter();
      jetFilter.type = 'bandpass';
      jetFilter.frequency.setValueAtTime(1750, now);
      jetFilter.Q.setValueAtTime(0.85, now);

      var sizzleFilter = audioCtx.createBiquadFilter();
      sizzleFilter.type = 'highpass';
      sizzleFilter.frequency.setValueAtTime(3200, now);

      var steamEnv = audioCtx.createGain();
      steamEnv.gain.setValueAtTime(0.0001, now);
      steamEnv.gain.linearRampToValueAtTime(0.11, now + 0.025);
      steamEnv.gain.exponentialRampToValueAtTime(0.055, now + 0.09);
      steamEnv.gain.setValueAtTime(0.052, now + 0.42);
      steamEnv.gain.exponentialRampToValueAtTime(0.012, now + 0.51);
      steamEnv.gain.linearRampToValueAtTime(0.12, now + 0.555);
      steamEnv.gain.exponentialRampToValueAtTime(0.062, now + 0.64);
      steamEnv.gain.setValueAtTime(0.058, now + 1.28);
      steamEnv.gain.exponentialRampToValueAtTime(0.0005, now + 1.52);

      steamNoise.connect(jetFilter);
      steamNoise.connect(sizzleFilter);
      jetFilter.connect(steamEnv);
      sizzleFilter.connect(steamEnv);
      steamEnv.connect(audioCtx.destination);
      steamEnv.connect(echoFilter);

      steamNoise.start(now);
      steamNoise.stop(now + totalDur);
    } catch (e) {}
  };

  // ==========================================================================
  // FRIEND TRAIN GREETING HORN (`window.playFriendTrainGreetingHorn`)
  // Cheerful higher-pitched two-toot answer whistle when an AI friend train
  // passes Toby on the tracks! ("2. Pokud se vláček míjí s jinými vláčky, mašinky na sebe troubí na pozdrav.")
  // ==========================================================================
  window.playFriendTrainGreetingHorn = function(friendIdx) {
    if (!hasUserGesture || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      var brassWave = getSteamBrassPeriodicWave(audioCtx);
      // Distinct cheerful pitch per friend locomotive (Rosie, Bruno, Thomas)
      var pitchFactor = [1.26, 0.88, 1.15][(friendIdx || 0) % 3];
      var chord = [330.0 * pitchFactor, 415.3 * pitchFactor, 493.88 * pitchFactor];
      var toots = [
        { start: 0.0,  dur: 0.22 },
        { start: 0.28, dur: 0.36 }
      ];
      toots.forEach(function(toot) {
        var t0 = now + toot.start;
        var tEnd = t0 + toot.dur;
        chord.forEach(function(freq) {
          var osc = audioCtx.createOscillator();
          if (brassWave) osc.setPeriodicWave(brassWave);
          else osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 0.96, t0);
          osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.04);
          osc.frequency.setValueAtTime(freq, tEnd - 0.06);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.94, tEnd);

          var g = audioCtx.createGain();
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.linearRampToValueAtTime(0.085, t0 + 0.035);
          g.gain.setValueAtTime(0.075, tEnd - 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, tEnd);

          osc.connect(g);
          g.connect(audioCtx.destination);
          osc.start(t0);
          osc.stop(tEnd + 0.02);
        });
      });
    } catch (e) {}
  };

  // ==========================================================================
  // 4. VARIED ENGLISH SPEED/SLOWDOWN PHRASES & EDUCATIONAL OBJECT DESCRIPTIONS
  //    ("4. Prosím o vytvoření i jiných hlášek např. při zrychlení a zpomalení
  //     vláčku, ať se hláška neopakuje pořád dokola. Hra by měla učit děti
  //     anglicky, proto by bylo fajn, kdyby vláček popisoval i objekty co vidí,
  //     na které je zaměřen detail kamery.")
  // ==========================================================================
  var accelPhrases = [
    "Faster, faster! Let's go! Speed {S}!",
    "Full steam ahead! We are going faster!",
    "Choo choo! Speeding up to number {S}!",
    "Hold on tight! The train is going fast!",
    "Look how fast our wheels are spinning! Speed {S}!",
    "Here we go! Up, up, up to speed {S}!",
    "Super express train! Zoom, zoom, zoom!",
    "Puff, puff, chugga chugga! Going faster now!"
  ];
  var decelPhrases = [
    "Slowing down! Easy does it, little train!",
    "Brakes on! Let's go nice and slow!",
    "Slower now! Gently down to speed {S}!",
    "Careful and slow! Looking around the tracks!",
    "Whoa there, little engine! Going slower now!",
    "Taking it easy! Slowing down to number {S}!"
  ];
  var stopPhrases = [
    "All stopped! Brakes say shhh! Time to rest!",
    "Stop! The train is standing still now!",
    "Station stop! Zero speed, good job driver!",
    "Phew! Our wheels have stopped turning!"
  ];
  var reversePhrases = [
    "Backing up! Beep, beep! Going backwards!",
    "Reverse gear! Watch out behind the train!",
    "Chugga chugga backwards! Slowly backing up!",
    "Going in reverse! Beep, beep, careful behind us!"
  ];

  var accelIdx = 0;
  var decelIdx = 0;
  var stopIdx  = 0;
  var revIdx   = 0;

  // Educational English vocabulary & descriptions for every object focused by the 3-second camera
  var showcaseEnglishLessons = {
    eiffel: [
      "Look! This is the Eiffel Tower in Paris! It is a very tall iron tower!",
      "Wow, the Eiffel Tower! Can you say Eiffel Tower? It reaches high into the sky!"
    ],
    colosseum: [
      "Look! This is the Colosseum in Rome! It is a famous ancient stone arena!",
      "We see the big round Colosseum! Ancient Romans built it a long time ago!"
    ],
    mom_house: [
      "Look! This is Mommy and Daddy's house! Look at the blue swimming pool and palm trees!",
      "Hello Mommy and Daddy! Here is our family home with a garden and a blue pool!"
    ],
    grandma_house: [
      "Look! This is Grandma and Grandpa's yellow house! I see their blue and red cars outside!",
      "Hello Grandma and Grandpa! Their big yellow house has solar panels on the roof!"
    ],
    airport: [
      "Look! This is the Airport! Big airplanes fly high up into the clouds from here!",
      "We are at the International Airport! Airplanes take off and land on the runway!"
    ],
    jewel: [
      "Look inside the glass dome! A giant waterfall is splashing down through the green forest!",
      "Wow, this is the Jewel waterfall! Listen to the water falling from the roof!"
    ],
    stadium: [
      "Look! This is the Soccer Stadium! Players kick the ball and score goals on the green field!",
      "What a big Stadium! Fans cheer when the players kick the football into the net!"
    ],
    bigben: [
      "Look! This is Big Ben, the famous clock tower in London! Tick-tock goes the big golden clock!",
      "Can you see the big clock tower? That is Big Ben! It tells the time for everyone!"
    ],
    skyscraper: [
      "Look up! That is a tall glass Skyscraper! It has so many windows shining in the sun!",
      "What a tall Skyscraper! Office workers look out from the top floor high above the city!"
    ],
    fountain: [
      "Look! This is the Fountain Square! Cool blue water is dancing and splashing in the park!",
      "We see the sparkling water Fountain! People love to walk around the park plaza!"
    ],
    monster_0: [
      "Haha! Look at the funny purple monster! It jumped high up and hid behind the tree!",
      "Peek-a-boo, silly purple monster! Don't sit on the train tracks!"
    ],
    monster_1: [
      "Haha! Look at the fluffy colorful monster with one big eye! It ran behind the tree!",
      "What a funny fuzzy monster! It is sticking out its tongue at our train!"
    ],
    rabbit: [
      "Look! A cute white Rabbit with long ears! The little bunny is jumping and waving hello!",
      "Hello, little white Rabbit! Look how high the bunny can hop, hop, hop!"
    ],
    squirrel: [
      "Look! An orange Squirrel with a bushy tail! It jumped right up onto the tree branch!",
      "Hello, clever Squirrel! The squirrel loves to climb trees and eat crunchy acorns!"
    ],
    owl: [
      "Look up in the tree! A wise brown Owl! The owl flaps its wings and says hoo-hoo!",
      "Hello, friendly Owl! Owls have big round eyes and sit high up on the branch!"
    ],
    cow: [
      "Look! A spotted farm Cow on the green grass! The cow says moo and gives us fresh milk!",
      "Hello, Daisy the Cow! Can you see the white and brown cow grazing in the meadow?"
    ],
    sheep_0: [
      "Look! Soft white Sheep in the green pasture! The fluffy sheep say baa, baa!",
      "Hello, little wooly Sheep! Look at the white flock of sheep on the hill!"
    ],
    sheep_1: [
      "Look! Fluffy white Sheep by the tracks! Sheep give us warm wool for winter sweaters!",
      "Baa, baa! Look at the happy white Sheep waving at our train!"
    ],
    anantara: [
      "Welcome to Anantara! Look at the tropical hotel with golden Thai roofs and palm trees by the river!",
      "Look! A beautiful river and the Anantara Riverside Hotel! Can you see the wooden boat pier?"
    ],
    anantara_boat: [
      "Here comes the boat! Look at the Anantara shuttle boat sailing across the river!",
      "Toot toot! Wave hello to the passengers on the wooden Anantara hotel boat!"
    ],
    iconsiam: [
      "Welcome to IconSiam! Look at the giant golden shopping mall, dancing fountains, and tall skyscrapers!",
      "Wow, this is IconSiam by the Chao Phraya River! Look at the big Ferris wheel and sparkling water show!"
    ],
    bkk_bridge: [
      "Let's cross the river! We are riding high up over the big railway bridge!",
      "Look down at the wide Chao Phraya River! Our train is crossing the grand arch bridge!"
    ]
  };
  var lessonVariantCount = {};

  window.triggerEnglishShowcaseNarration = function(focusId) {
    if (!focusId || !showcaseEnglishLessons[focusId]) return;
    var variants = showcaseEnglishLessons[focusId];
    var idx = (lessonVariantCount[focusId] || 0) % variants.length;
    lessonVariantCount[focusId] = (lessonVariantCount[focusId] || 0) + 1;
    var text = variants[idx];
    window._lastShowcaseSpeechMs = performance.now();
    if (typeof window.speakCharacter === 'function') {
      window.speakCharacter('train', '🚂 Little Train Toby', '#ef4444', text);
    }
  };

  // Wrap `window.speakCharacter` so repetitive speed/slowdown phrases from `game.js`
  // are automatically replaced with varied, educational English lines, and don't interrupt
  // an active 3-second object description!
  if (typeof window.speakCharacter === 'function' && !window.speakCharacter._variedEnglishWrapped) {
    var origSpeakChar = window.speakCharacter;
    var wrappedSpeak = function(role, speakerName, avatarColorHex, text, explicitClipKey) {
      if (arguments.length === 2 && typeof speakerName === 'string') {
        text = speakerName;
        speakerName = '🚂 Little Train Toby';
        avatarColorHex = '#ef4444';
        role = 'train';
      }
      if ((role === 'toby' || role === 'train') && typeof text === 'string') {
        role = 'train';
        var nowMs = performance.now();
        var duringShowcaseLesson = (window._lastShowcaseSpeechMs && (nowMs - window._lastShowcaseSpeechMs) < 3100);

        // 1) Intercept repetitive `Chugga chugga! Speed X!`
        var speedMatch = text.match(/^Chugga chugga!\s*Speed\s*(\d+)!?$/i);
        if (speedMatch) {
          if (duringShowcaseLesson) return; // Let the 3s object description play uninterrupted!
          var spdNum = parseInt(speedMatch[1], 10);
          if (spdNum === 0) {
            text = stopPhrases[stopIdx % stopPhrases.length];
            stopIdx++;
          } else {
            var tplA = accelPhrases[accelIdx % accelPhrases.length];
            accelIdx++;
            text = tplA.replace('{S}', String(spdNum));
          }
        }
        // 2) Intercept repetitive `Slowing down!`
        else if (/^Slowing down!?$/i.test(text)) {
          if (duringShowcaseLesson) return;
          var curStage = (window.pState && typeof window.pState.speedStage === 'number') ? window.pState.speedStage : 1;
          if (curStage <= 0) {
            text = stopPhrases[stopIdx % stopPhrases.length];
            stopIdx++;
          } else {
            var tplD = decelPhrases[decelIdx % decelPhrases.length];
            decelIdx++;
            text = tplD.replace('{S}', String(curStage));
          }
        }
        // 3) Intercept repetitive `Backing up! Beep beep!`
        else if (/^Backing up!\s*Beep beep!?$/i.test(text)) {
          if (duringShowcaseLesson) return;
          text = reversePhrases[revIdx % reversePhrases.length];
          revIdx++;
        }
      }
      return origSpeakChar(role, speakerName, avatarColorHex, text, explicitClipKey);
    };
    wrappedSpeak._variedEnglishWrapped = true;
    window.speakCharacter = wrappedSpeak;
  }
})();

// ============================================================================
// 4 NEW INTERACTIVE STORYBOOK CHARACTERS MODULE
// 1. Two Cute Track Monsters ("Strašidla sedící na kolejích" — behind Mom's house & behind Grandma's house)
// 2. Cute White Rabbit by the Track ("Králík u cesty" — 3 energetic hops + front paw wave)
// 3. Cheerful Orange Squirrel by a Colorful Tree ("Veverka u stromu" — 2 rapid 360° spins + parabolic leap onto branch)
// 4. Friendly Owl on a Tree Branch ("Sova u stromu" — head turn toward train + wing flapping greeting + hoot)
// ============================================================================
(function installFourInteractiveStorybookCharacters() {
  if (typeof THREE === 'undefined' || typeof scene === 'undefined' || !window.edges) return;
  if (window._storybookInteractiveCharsInstalled) return;
  window._storybookInteractiveCharsInstalled = true;

  // --------------------------------------------------------------------------
  // A) PROCEDURAL 3D SPEECH BUBBLE SPRITE HELPER
  // --------------------------------------------------------------------------
  function createComicBubbleSprite(text, bgColor, borderColor, textColor, widthWorld, heightWorld) {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 192);
    ctx.save();

    // Rounded speech bubble with bottom pointer triangle
    var rx = 24, ry = 18, rw = 464, rh = 122, rad = 36;
    ctx.beginPath();
    ctx.moveTo(rx + rad, ry);
    ctx.lineTo(rx + rw - rad, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
    ctx.lineTo(rx + rw, ry + rh - rad);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
    ctx.lineTo(286, ry + rh);
    ctx.lineTo(256, 178);
    ctx.lineTo(226, ry + rh);
    ctx.lineTo(rx + rad, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
    ctx.lineTo(rx, ry + rad);
    ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
    ctx.closePath();

    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = borderColor || '#9333ea';
    ctx.stroke();

    ctx.fillStyle = textColor || '#1e1b4b';
    ctx.font = '900 54px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, ry + rh * 0.52);
    ctx.restore();

    var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(canvas) : new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(widthWorld || 7.5, heightWorld || 2.8, 1);
    sprite.renderOrder = 999;
    sprite.visible = false;
    return { sprite: sprite, canvas: canvas, ctx: ctx, tex: tex };
  }

  function updateComicBubbleText(bubbleObj, text, bgColor, borderColor, textColor) {
    if (!bubbleObj || bubbleObj._lastText === text) return;
    bubbleObj._lastText = text;
    var ctx = bubbleObj.ctx;
    ctx.clearRect(0, 0, 512, 192);
    var rx = 24, ry = 18, rw = 464, rh = 122, rad = 36;
    ctx.beginPath();
    ctx.moveTo(rx + rad, ry);
    ctx.lineTo(rx + rw - rad, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
    ctx.lineTo(rx + rw, ry + rh - rad);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
    ctx.lineTo(286, ry + rh);
    ctx.lineTo(256, 178);
    ctx.lineTo(226, ry + rh);
    ctx.lineTo(rx + rad, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
    ctx.lineTo(rx, ry + rad);
    ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
    ctx.closePath();

    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = borderColor || '#9333ea';
    ctx.stroke();

    ctx.fillStyle = textColor || '#1e1b4b';
    ctx.font = '900 50px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, ry + rh * 0.52);
    bubbleObj.tex.needsUpdate = true;
  }

  // --------------------------------------------------------------------------
  // B) WEB AUDIO SOUND EFFECTS FOR MONSTERS & ANIMALS (STRICT < 20m PROXIMITY!)
  //    ("3. Zvuk, který vydávají strašidla a ostatní zvířátka by měl jít slyšet
  //     jen, když jsou od sebe blíže než 20m.")
  // --------------------------------------------------------------------------
  function isWithin20mOfPlayerTrain(worldPos) {
    if (!window.playerLoco || !window.playerLoco.position || !worldPos) return false;
    if (window.pState && window.pState.inSubway) return false;
    return window.playerLoco.position.distanceTo(worldPos) < 20.0;
  }

  // Wrap existing sheep (`playSheepBaa`) and cow (`playCowMoo`) sounds so ALL animals obey the < 20m rule!
  if (typeof window.playSheepBaa === 'function' && !window._sheepBaa20mWrapped) {
    window._sheepBaa20mWrapped = true;
    var origPlaySheepBaa = window.playSheepBaa;
    window.playSheepBaa = function() {
      if (!window.playerLoco || !window.playerLoco.position || !window.trackSheepFlocks) return;
      var minSheepDist = 999999;
      for (var sfi = 0; sfi < window.trackSheepFlocks.length; sfi++) {
        var fl = window.trackSheepFlocks[sfi];
        if (fl && fl.group && fl.group.position) {
          var sd = window.playerLoco.position.distanceTo(fl.group.position);
          if (sd < minSheepDist) minSheepDist = sd;
        } else if (fl && fl.basePos) {
          var sd2 = window.playerLoco.position.distanceTo(fl.basePos);
          if (sd2 < minSheepDist) minSheepDist = sd2;
        }
      }
      if (minSheepDist < 20.0) {
        origPlaySheepBaa();
      }
    };
  }

  if (typeof window.playCowMoo === 'function' && !window._cowMoo20mWrapped) {
    window._cowMoo20mWrapped = true;
    var origPlayCowMoo = window.playCowMoo;
    window.playCowMoo = function() {
      if (!window.playerLoco || !window.playerLoco.position || !window.daisyTheCow || !window.daisyTheCow.position) return;
      if (window.playerLoco.position.distanceTo(window.daisyTheCow.position) < 20.0) {
        origPlayCowMoo();
      }
    };
  }

  function playMonsterHelpSound(pitchMultiplier, worldPos) {
    if (!isWithin20mOfPlayerTrain(worldPos)) return;
    if (typeof hasUserGesture !== 'undefined' && !hasUserGesture) return;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      var pm = pitchMultiplier || 1.0;

      // Comical elongated cartoon "HEEEEELP!" vocal formant synth
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Dramatic rising startle pitch -> sustained vibrating "HEEELP!" -> trailing off
      osc1.frequency.setValueAtTime(290 * pm, now);
      osc1.frequency.exponentialRampToValueAtTime(640 * pm, now + 0.16);
      osc1.frequency.setValueAtTime(620 * pm, now + 0.55);
      osc1.frequency.exponentialRampToValueAtTime(380 * pm, now + 1.05);

      osc2.frequency.setValueAtTime(580 * pm, now);
      osc2.frequency.exponentialRampToValueAtTime(1280 * pm, now + 0.16);
      osc2.frequency.setValueAtTime(1240 * pm, now + 0.55);
      osc2.frequency.exponentialRampToValueAtTime(760 * pm, now + 1.05);

      // Vibrato LFO for comical quivering voice
      var lfo = audioCtx.createOscillator();
      var lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(14.0, now);
      lfoGain.gain.setValueAtTime(28.0 * pm, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Vowel formant filter ("EEE-AAH")
      var formant = audioCtx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(1450, now);
      formant.frequency.linearRampToValueAtTime(1850, now + 0.25);
      formant.frequency.linearRampToValueAtTime(1100, now + 1.0);
      formant.Q.setValueAtTime(2.4, now);

      var env = audioCtx.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.20, now + 0.04);
      env.gain.setValueAtTime(0.18, now + 0.68);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 1.08);

      osc1.connect(formant);
      osc2.connect(formant);
      formant.connect(env);
      env.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);
      osc1.stop(now + 1.10);
      osc2.stop(now + 1.10);
      lfo.stop(now + 1.10);
    } catch (e) {}
  }

  function playMonsterTongueSound(pitchMultiplier, worldPos) {
    if (!isWithin20mOfPlayerTrain(worldPos)) return;
    if (typeof hasUserGesture !== 'undefined' && !hasUserGesture) return;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      var pm = pitchMultiplier || 1.0;

      // Playful cartoon "Bleh! / Blllrp!" tongue-sticking-out raspberry sound
      var osc = audioCtx.createOscillator();
      var lfo = audioCtx.createOscillator();
      var lfoGain = audioCtx.createGain();
      var env = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240 * pm, now);
      osc.frequency.linearRampToValueAtTime(320 * pm, now + 0.14);
      osc.frequency.linearRampToValueAtTime(210 * pm, now + 0.42);

      lfo.type = 'square';
      lfo.frequency.setValueAtTime(28.0, now);
      lfoGain.gain.setValueAtTime(55.0 * pm, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.14, now + 0.03);
      env.gain.setValueAtTime(0.12, now + 0.32);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 0.46);

      osc.connect(env);
      env.connect(audioCtx.destination);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.48);
      lfo.stop(now + 0.48);
    } catch (e) {}
  }

  function playRabbitHopAndWaveSound(worldPos) {
    if (!isWithin20mOfPlayerTrain(worldPos)) return;
    if (typeof hasUserGesture !== 'undefined' && !hasUserGesture) return;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      // 3 cute springy hop boings at t = 0.0, 0.52, 1.04
      [0.0, 0.52, 1.04].forEach(function(offset, idx) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        var baseF = 340 + idx * 55;
        osc.frequency.setValueAtTime(baseF, now + offset);
        osc.frequency.exponentialRampToValueAtTime(baseF * 1.85, now + offset + 0.22);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.linearRampToValueAtTime(0.14, now + offset + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + offset + 0.26);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.28);
      });
    } catch (e) {}
  }

  function playSquirrelSpinAndJumpSound(worldPos) {
    if (!isWithin20mOfPlayerTrain(worldPos)) return;
    if (typeof hasUserGesture !== 'undefined' && !hasUserGesture) return;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      // Rapid cheerful twirl notes (0.0 -> 0.7s) + upward branch leap whoosh (0.85 -> 1.35s)
      var notes = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
      notes.forEach(function(freq, i) {
        var t0 = now + i * 0.095;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.11, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.11);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.12);
      });
      // Leap upward whistle
      var leapOsc = audioCtx.createOscillator();
      var leapGain = audioCtx.createGain();
      leapOsc.type = 'sine';
      leapOsc.frequency.setValueAtTime(480, now + 0.82);
      leapOsc.frequency.exponentialRampToValueAtTime(1220, now + 1.35);
      leapGain.gain.setValueAtTime(0.0001, now + 0.82);
      leapGain.gain.linearRampToValueAtTime(0.12, now + 0.88);
      leapGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.40);
      leapOsc.connect(leapGain);
      leapGain.connect(audioCtx.destination);
      leapOsc.start(now + 0.82);
      leapOsc.stop(now + 1.42);
    } catch (e) {}
  }

  function playOwlHootSound(worldPos) {
    if (!isWithin20mOfPlayerTrain(worldPos)) return;
    if (typeof hasUserGesture !== 'undefined' && !hasUserGesture) return;
    if (typeof audioCtx === 'undefined' || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      // Classic warm woodland owl "Hoo-hoo! Hoo-hoo!"
      var pattern = [
        { start: 0.00, dur: 0.28, f1: 440, f2: 415 },
        { start: 0.36, dur: 0.58, f1: 392, f2: 349.23 },
        { start: 1.18, dur: 0.26, f1: 440, f2: 415 },
        { start: 1.52, dur: 0.56, f1: 392, f2: 349.23 }
      ];
      pattern.forEach(function(h) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.f1, now + h.start);
        osc.frequency.exponentialRampToValueAtTime(h.f2, now + h.start + h.dur);
        gain.gain.setValueAtTime(0.0001, now + h.start);
        gain.gain.linearRampToValueAtTime(0.15, now + h.start + 0.045);
        gain.gain.setValueAtTime(0.13, now + h.start + h.dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + h.start + h.dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + h.start);
        osc.stop(now + h.start + h.dur + 0.02);
      });
    } catch (e) {}
  }

  // Helper: Build 3D Expressive Sticking-Out Cartoon Tongue (`vyplázne jazyk`)
  function createPeekingTongueMesh() {
    var tg = new THREE.Group();
    var pinkTongueMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.28 });
    var grooveMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35 });

    var shaft = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.78), pinkTongueMat);
    shaft.position.set(0, -0.10, 0.42);
    shaft.rotation.x = 0.28;
    tg.add(shaft);

    var tip = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), pinkTongueMat);
    tip.scale.set(1.02, 0.42, 1.15);
    tip.position.set(0, -0.22, 0.78);
    tip.rotation.x = 0.32;
    tg.add(tip);

    var groove = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.68), grooveMat);
    groove.position.set(0, -0.04, 0.46);
    groove.rotation.x = 0.28;
    tg.add(groove);

    tg.position.set(0, -0.18, 0.14);
    tg.visible = false;
    return tg;
  }

  // --------------------------------------------------------------------------
  // C) 3D MODEL BUILDERS FOR THE 4 CHARACTERS & THEIR TREES
  // --------------------------------------------------------------------------

  // 1A. MONSTER #1: Glossy Purple Two-Eyed Antenna Monster (`image_27cfcc7b.png`)
  function buildPurpleAntennaMonster() {
    var root = new THREE.Group();
    var bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    var purpleMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.20, metalness: 0.08 });
    var lightPurpleMat = new THREE.MeshStandardMaterial({ color: 0xd8b4fe, roughness: 0.26, metalness: 0.04 });
    var darkMouthMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.65 });
    var tongueMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.30 });
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.14 });
    var irisMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.18 });
    var pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    // Bean/pill-shaped glossy purple torso
    var torso = new THREE.Mesh(new THREE.SphereGeometry(1.38, 28, 24), purpleMat);
    torso.scale.set(1.04, 1.38, 0.90);
    torso.position.set(0, 1.85, 0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    // Lighter lavender belly oval patches (matching reference image)
    [-0.55, 0.55].forEach(function(bx) {
      var patch = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 14), lightPurpleMat);
      patch.scale.set(1.1, 0.85, 0.45);
      patch.position.set(bx, 0.68, 0.96);
      patch.rotation.z = bx > 0 ? -0.25 : 0.25;
      bodyGroup.add(patch);
    });

    // 2 Ball-Tipped Antennae on top of head
    var leftAntennaPivot = new THREE.Group();
    leftAntennaPivot.position.set(-0.62, 3.48, 0.10);
    var rightAntennaPivot = new THREE.Group();
    rightAntennaPivot.position.set(0.62, 3.48, 0.10);
    [leftAntennaPivot, rightAntennaPivot].forEach(function(piv, idx) {
      var side = idx === 0 ? -1 : 1;
      var stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.18, 0.68, 12), purpleMat);
      stalk.position.set(side * 0.18, 0.28, 0);
      stalk.rotation.z = -side * 0.48;
      var tipBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 16), purpleMat);
      tipBall.scale.set(1.12, 0.96, 1.0);
      tipBall.position.set(side * 0.36, 0.62, 0);
      piv.add(stalk, tipBall);
      bodyGroup.add(piv);
    });

    // 2 Huge Bulging White Eyeballs side-by-side with Sky-Blue Irises & Black Pupils
    var leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.52, 2.58, 0.96);
    var rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.52, 2.58, 0.96);

    [leftEyeGroup, rightEyeGroup].forEach(function(eg, idx) {
      var rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 12, 24), purpleMat);
      eg.add(rim);
      var sclera = new THREE.Mesh(new THREE.SphereGeometry(0.51, 22, 20), whiteMat);
      sclera.scale.set(0.96, 1.10, 0.76);
      eg.add(sclera);
      var iris = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 14), irisMat);
      iris.scale.set(1.0, 1.0, 0.45);
      iris.position.set(idx === 0 ? 0.05 : -0.05, 0.08, 0.34);
      eg.add(iris);
      var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), pupilMat);
      pupil.scale.set(1.0, 1.0, 0.45);
      pupil.position.set(idx === 0 ? 0.05 : -0.05, 0.08, 0.41);
      eg.add(pupil);
      var highlight = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), whiteMat);
      highlight.position.set((idx === 0 ? 0.05 : -0.05) - 0.06, 0.15, 0.46);
      eg.add(highlight);
      bodyGroup.add(eg);
    });

    // Giant Expressive Mouth with Curved Upper Tooth Plate, 4 Lower Teeth & Purple Tongue
    var mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, 1.46, 1.05);
    bodyGroup.add(mouthGroup);

    var mouthRim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.11, 14, 28), purpleMat);
    mouthRim.scale.set(1.18, 0.88, 0.70);
    mouthGroup.add(mouthRim);

    var mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.74, 20, 18), darkMouthMat);
    mouthCavity.scale.set(1.15, 0.84, 0.38);
    mouthCavity.position.z = -0.06;
    mouthGroup.add(mouthCavity);

    // Curved upper white tooth plate
    var upperTeeth = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.15, 12, 20, Math.PI * 0.82), whiteMat);
    upperTeeth.rotation.z = Math.PI * 0.09;
    upperTeeth.scale.set(1.22, 0.72, 0.55);
    upperTeeth.position.set(0, 0.16, 0.10);
    mouthGroup.add(upperTeeth);

    // 4 individual lower white teeth
    [-0.36, -0.12, 0.12, 0.36].forEach(function(tx) {
      var lTooth = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.16, 0.14), whiteMat);
      lTooth.position.set(tx, -0.46, 0.10);
      mouthGroup.add(lTooth);
    });

    // Glossy purple tongue inside mouth + 3D Sticking-Out Tongue (`peekingTongue`)
    var tongue = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), tongueMat);
    tongue.scale.set(1.25, 0.38, 0.65);
    tongue.position.set(0, -0.32, 0.02);
    mouthGroup.add(tongue);

    var peekingTongue = createPeekingTongueMesh();
    mouthGroup.add(peekingTongue);

    // 2 Articulated Purple Arms with 5 Spread Fingers per Hand
    function createFiveFingerArm(side) {
      var armPivot = new THREE.Group();
      armPivot.position.set(side * 1.28, 1.72, 0.10);

      var armShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.05, 12), purpleMat);
      armShaft.position.set(side * 0.45, 0.25, 0);
      armShaft.rotation.z = -side * 1.10;
      armPivot.add(armShaft);

      var handGroup = new THREE.Group();
      handGroup.position.set(side * 0.98, 0.48, 0.05);
      var palm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), purpleMat);
      palm.scale.set(1.15, 1.05, 0.62);
      handGroup.add(palm);

      // 5 spread fingers with bulbous tips
      var fingerAngles = [-0.85, -0.42, 0.0, 0.42, 0.85];
      fingerAngles.forEach(function(ang) {
        var fG = new THREE.Group();
        fG.rotation.z = -side * (ang - 0.35);
        var fCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.38, 10), purpleMat);
        fCyl.position.y = 0.34;
        var fTip = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), purpleMat);
        fTip.position.y = 0.54;
        fG.add(fCyl, fTip);
        handGroup.add(fG);
      });

      armPivot.add(handGroup);
      return armPivot;
    }

    var leftArm = createFiveFingerArm(-1);
    var rightArm = createFiveFingerArm(1);
    bodyGroup.add(leftArm, rightArm);

    // 2 Articulated Legs with 3-Toed Purple Feet
    function createThreeToedLeg(side) {
      var legPivot = new THREE.Group();
      legPivot.position.set(side * 0.65, 0.55, 0.05);

      var legShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.62, 12), purpleMat);
      legShaft.position.set(side * 0.08, -0.24, 0);
      legPivot.add(legShaft);

      var footGroup = new THREE.Group();
      footGroup.position.set(side * 0.14, -0.52, 0.22);
      var footBase = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), purpleMat);
      footBase.scale.set(1.25, 0.52, 1.35);
      footGroup.add(footBase);

      [-0.28, 0.0, 0.28].forEach(function(tx) {
        var toe = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 10), purpleMat);
        toe.scale.set(0.92, 0.72, 1.35);
        toe.position.set(tx, -0.03, 0.38);
        footGroup.add(toe);
      });

      legPivot.add(footGroup);
      return legPivot;
    }

    var leftLeg = createThreeToedLeg(-1);
    var rightLeg = createThreeToedLeg(1);
    bodyGroup.add(leftLeg, rightLeg);

    // Floating Comic Speech Bubble ("HEEELP!")
    var bubble = createComicBubbleSprite('HEEELP! 😱', '#fef08a', '#9333ea', '#581c87', 8.2, 3.1);
    bubble.sprite.position.set(0, 5.2, 0);
    root.add(bubble.sprite);

    root.scale.setScalar(1.15);

    return {
      root: root,
      bodyGroup: bodyGroup,
      leftEye: leftEyeGroup,
      rightEye: rightEyeGroup,
      mouth: mouthGroup,
      peekingTongue: peekingTongue,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftAntenna: leftAntennaPivot,
      rightAntenna: rightAntennaPivot,
      bubble: bubble
    };
  }

  // 1B. MONSTER #2: Fluffy Multi-Colored One-Eyed Horned Monster (`image_0d3e40c2.png`)
  function buildFluffyCyclopsMonster() {
    var root = new THREE.Group();
    var bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // Procedural high-detail multi-colored curly fur canvas texture (blue, cyan, magenta-pink, violet)
    var furCan = document.createElement('canvas');
    furCan.width = 256;
    furCan.height = 256;
    var fCtx = furCan.getContext('2d');
    fCtx.fillStyle = '#311068';
    fCtx.fillRect(0, 0, 256, 256);
    var furColors = ['#1d4ed8', '#2563eb', '#06b6d4', '#ec4899', '#db2777', '#7c3aed', '#9333ea', '#38bdf8'];
    for (var fi = 0; fi < 2200; fi++) {
      fCtx.strokeStyle = furColors[fi % furColors.length];
      fCtx.lineWidth = 2.2;
      var fx = Math.random() * 256;
      var fy = Math.random() * 256;
      fCtx.beginPath();
      fCtx.moveTo(fx, fy);
      fCtx.quadraticCurveTo(fx + (Math.random() - 0.5) * 18, fy + (Math.random() - 0.5) * 18, fx + (Math.random() - 0.5) * 22, fy + (Math.random() - 0.5) * 22);
      fCtx.stroke();
    }
    var furTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(furCan) : new THREE.CanvasTexture(furCan);
    var furryBodyMat = new THREE.MeshStandardMaterial({ map: furTex, roughness: 0.72, metalness: 0.02 });

    var coreSphere = new THREE.Mesh(new THREE.SphereGeometry(1.56, 28, 24), furryBodyMat);
    coreSphere.scale.set(1.06, 1.02, 0.96);
    coreSphere.position.set(0, 2.05, 0);
    coreSphere.castShadow = true;
    bodyGroup.add(coreSphere);

    // 72 3D multi-colored fur tufts around the body for authentic 3D fluffiness
    var tuftPalette = [0x1d4ed8, 0x06b6d4, 0xec4899, 0x7c3aed, 0x3b82f6, 0xdb2777];
    var tuftMats = tuftPalette.map(function(hex) {
      return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.65 });
    });
    var tuftGeo = new THREE.SphereGeometry(0.34, 10, 8);
    for (var ti = 0; ti < 72; ti++) {
      // Fibonacci sphere distribution avoiding the central eye & mouth zone on front (+Z)
      var phi = Math.acos(1 - 2 * (ti + 0.5) / 72);
      var theta = Math.PI * (1 + Math.sqrt(5)) * ti;
      var dx = Math.sin(phi) * Math.cos(theta);
      var dy = Math.cos(phi);
      var dz = Math.sin(phi) * Math.sin(theta);
      // Leave clear opening on the front face for the cyclops eye and mouth
      if (dz > 0.52 && dy > -0.45 && dy < 0.65 && Math.abs(dx) < 0.62) continue;

      var tuft = new THREE.Mesh(tuftGeo, tuftMats[ti % tuftMats.length]);
      tuft.scale.set(1.1, 0.78, 1.25);
      tuft.position.set(dx * 1.48, 2.05 + dy * 1.42, dz * 1.36);
      tuft.lookAt(dx * 3.0, 2.05 + dy * 3.0, dz * 3.0);
      bodyGroup.add(tuft);
    }

    // 2 Pink-Magenta Curved Horns on top (`image_0d3e40c2.png`)
    var hornMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.32, metalness: 0.08 });
    [-0.78, 0.78].forEach(function(hx) {
      var side = hx > 0 ? 1 : -1;
      var horn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.72, 14), hornMat);
      horn.position.set(hx, 3.46, 0.22);
      horn.rotation.z = -side * 0.28;
      horn.rotation.x = 0.15;
      bodyGroup.add(horn);
    });

    // 1 Giant Central Cyclops Eye with Purple Upper Eyelid Hood
    var cyclopsEyeGroup = new THREE.Group();
    cyclopsEyeGroup.position.set(0, 2.68, 1.32);
    bodyGroup.add(cyclopsEyeGroup);

    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12 });
    var pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    var eyelidMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.32 });

    var eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.56, 22, 20), whiteMat);
    eyeball.scale.set(1.05, 0.96, 0.75);
    cyclopsEyeGroup.add(eyeball);

    var eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.60, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.48),
      eyelidMat
    );
    eyelid.scale.set(1.06, 0.96, 0.78);
    eyelid.rotation.x = -0.35;
    cyclopsEyeGroup.add(eyelid);

    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), pupilMat);
    pupil.scale.set(1.0, 1.0, 0.45);
    pupil.position.set(-0.04, 0.02, 0.36);
    cyclopsEyeGroup.add(pupil);

    var catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), whiteMat);
    catchlight.position.set(-0.14, 0.12, 0.46);
    cyclopsEyeGroup.add(catchlight);

    // Wide Open Mouth with 4 Upper White Teeth, 2 Lower White Teeth & 3D Sticking-Out Tongue (`peekingTongue`)
    var mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, 1.72, 1.30);
    bodyGroup.add(mouthGroup);

    var mouthCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x58131d, roughness: 0.65 })
    );
    mouthCavity.scale.set(1.22, 0.68, 0.36);
    mouthGroup.add(mouthCavity);

    // 4 Upper blocky white teeth
    [-0.36, -0.12, 0.12, 0.36].forEach(function(tx) {
      var uTooth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.20, 0.14), whiteMat);
      uTooth.position.set(tx, 0.32, 0.16);
      mouthGroup.add(uTooth);
    });
    // 2 Lower white teeth
    [-0.26, 0.26].forEach(function(tx) {
      var lTooth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.14), whiteMat);
      lTooth.position.set(tx, -0.34, 0.16);
      mouthGroup.add(lTooth);
    });

    var peekingTongue = createPeekingTongueMesh();
    mouthGroup.add(peekingTongue);

    // Long Thin Indigo-Purple Articulated Arms & Legs (`image_0d3e40c2.png`)
    var limbMat = new THREE.MeshStandardMaterial({ color: 0x5b21b6, roughness: 0.35, metalness: 0.05 });

    function createIndigoArm(side) {
      var armPivot = new THREE.Group();
      armPivot.position.set(side * 1.42, 2.02, 0.05);

      var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.05, 12), limbMat);
      upperArm.position.set(side * 0.48, 0.0, 0);
      upperArm.rotation.z = Math.PI * 0.5;
      armPivot.add(upperArm);

      var elbow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), limbMat);
      elbow.position.set(side * 0.98, 0.0, 0);
      armPivot.add(elbow);

      var foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.95, 12), limbMat);
      foreArm.position.set(side * 1.02, 0.46, 0);
      armPivot.add(foreArm);

      var fist = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), limbMat);
      fist.scale.set(1.15, 0.95, 0.85);
      fist.position.set(side * 1.02, 0.96, 0.05);
      armPivot.add(fist);

      return armPivot;
    }

    var leftArm = createIndigoArm(-1);
    var rightArm = createIndigoArm(1);
    bodyGroup.add(leftArm, rightArm);

    function createIndigoLeg(side) {
      var legPivot = new THREE.Group();
      legPivot.position.set(side * 0.55, 0.78, 0.08);

      var thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.78, 12), limbMat);
      thigh.position.set(0, -0.36, 0.12);
      thigh.rotation.x = -0.25;
      legPivot.add(thigh);

      var boot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), limbMat);
      boot.scale.set(0.95, 0.65, 1.55);
      boot.position.set(0, -0.72, 0.34);
      legPivot.add(boot);

      return legPivot;
    }

    var leftLeg = createIndigoLeg(-1);
    var rightLeg = createIndigoLeg(1);
    bodyGroup.add(leftLeg, rightLeg);

    // Floating Comic Speech Bubble ("HEEELP!")
    var bubble = createComicBubbleSprite('HEEELP! 😱', '#fef08a', '#ec4899', '#831843', 8.2, 3.1);
    bubble.sprite.position.set(0, 5.3, 0);
    root.add(bubble.sprite);

    root.scale.setScalar(1.15);

    return {
      root: root,
      bodyGroup: bodyGroup,
      leftEye: cyclopsEyeGroup,
      rightEye: cyclopsEyeGroup,
      mouth: mouthGroup,
      peekingTongue: peekingTongue,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftAntenna: null,
      rightAntenna: null,
      bubble: bubble
    };
  }

  // Helper: Dedicated Hiding Tree + Bush beside the track for each Track Monster
  function buildMonsterHidingTree() {
    var g = new THREE.Group();
    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    var leafMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
    var leafMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.50 });
    var bushMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.55 });

    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.95, 5.6, 14), trunkMat);
    trunk.position.y = 2.8;
    trunk.castShadow = true;
    g.add(trunk);

    var crownPositions = [
      [0, 6.2, 0, 2.5, leafMat1],
      [-1.4, 5.4, 0.8, 1.9, leafMat2],
      [1.4, 5.5, -0.6, 1.9, leafMat2],
      [0.2, 7.4, 0.3, 1.8, leafMat2]
    ];
    crownPositions.forEach(function(cp) {
      var cMesh = new THREE.Mesh(new THREE.SphereGeometry(cp[3], 16, 14), cp[4]);
      cMesh.position.set(cp[0], cp[1], cp[2]);
      cMesh.castShadow = true;
      g.add(cMesh);
    });

    // Low side bush next to the trunk
    var bush = new THREE.Mesh(new THREE.SphereGeometry(1.35, 14, 12), bushMat);
    bush.scale.set(1.25, 0.82, 1.1);
    bush.position.set(-1.35, 0.95, 0.45);
    g.add(bush);

    return g;
  }

  // 2. KRÁLÍK U CESTY: Cute White Rabbit (`image_67733db9.png` center)
  function buildStorybookWhiteRabbit() {
    var root = new THREE.Group();
    var bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    var whiteFurMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.02 });
    var creamBellyMat = new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.36 });
    var pinkInnerMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.35 });
    var nosePinkMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.25 });
    var darkEyeMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });
    var pureWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Plump pear-shaped white body
    var torso = new THREE.Mesh(new THREE.SphereGeometry(1.08, 24, 20), whiteFurMat);
    torso.scale.set(1.02, 1.18, 0.95);
    torso.position.set(0, 1.32, 0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    var belly = new THREE.Mesh(new THREE.SphereGeometry(0.84, 20, 16), creamBellyMat);
    belly.scale.set(0.88, 1.04, 0.52);
    belly.position.set(0, 1.26, 0.72);
    bodyGroup.add(belly);

    // Fluffy cotton-ball tail in back
    var cottonTail = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 14), whiteFurMat);
    cottonTail.position.set(0, 0.82, -1.02);
    bodyGroup.add(cottonTail);

    // Head with sculpted chubby cheeks
    var headGroup = new THREE.Group();
    headGroup.position.set(0, 2.68, 0.12);
    bodyGroup.add(headGroup);

    var headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.96, 24, 20), whiteFurMat);
    headSphere.scale.set(1.08, 0.98, 0.96);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    [-0.58, 0.58].forEach(function(cx) {
      var cheek = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 14), whiteFurMat);
      cheek.scale.set(1.1, 0.82, 0.88);
      cheek.position.set(cx, -0.18, 0.32);
      headGroup.add(cheek);

      var blush = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), pinkInnerMat);
      blush.scale.set(1.2, 0.65, 0.35);
      blush.position.set(cx * 1.05, -0.12, 0.76);
      headGroup.add(blush);
    });

    // Long Upright White Ears with Soft Pink Inner Channels (`image_67733db9.png`)
    function createRabbitEar(side) {
      var earPivot = new THREE.Group();
      earPivot.position.set(side * 0.38, 0.78, -0.05);

      var outerEar = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), whiteFurMat);
      outerEar.scale.set(0.85, 2.75, 0.45);
      outerEar.position.set(side * 0.08, 0.82, 0);
      outerEar.rotation.z = -side * 0.10;
      earPivot.add(outerEar);

      var innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), pinkInnerMat);
      innerEar.scale.set(0.75, 2.35, 0.32);
      innerEar.position.set(side * 0.08, 0.80, 0.09);
      innerEar.rotation.z = -side * 0.10;
      earPivot.add(innerEar);

      return earPivot;
    }

    var leftEar = createRabbitEar(-1);
    var rightEar = createRabbitEar(1);
    headGroup.add(leftEar, rightEar);

    // Big Expressive Dark Eyes with Dual Catchlights
    [-0.34, 0.34].forEach(function(ex) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), darkEyeMat);
      eye.scale.set(0.92, 1.15, 0.55);
      eye.position.set(ex, 0.14, 0.84);
      headGroup.add(eye);

      var c1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pureWhiteMat);
      c1.position.set(ex - 0.05, 0.22, 0.95);
      var c2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), pureWhiteMat);
      c2.position.set(ex + 0.06, 0.06, 0.95);
      headGroup.add(c1, c2);
    });

    // Cute Pink Nose & Open Cheerful Smile with Buck Teeth
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), nosePinkMat);
    nose.scale.set(1.25, 0.85, 0.85);
    nose.position.set(0, -0.04, 0.96);
    headGroup.add(nose);

    var smileMouth = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), nosePinkMat);
    smileMouth.scale.set(1.15, 0.65, 0.45);
    smileMouth.position.set(0, -0.32, 0.86);
    headGroup.add(smileMouth);

    [-0.06, 0.06].forEach(function(tx) {
      var tooth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.06), pureWhiteMat);
      tooth.position.set(tx, -0.25, 0.94);
      headGroup.add(tooth);
    });

    // Articulated Front Paws (`rightArm` waves hello!)
    function createRabbitArm(side) {
      var armPivot = new THREE.Group();
      armPivot.position.set(side * 0.86, 1.78, 0.25);

      var armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.82, 12), whiteFurMat);
      armMesh.position.set(side * 0.18, -0.32, 0.18);
      armMesh.rotation.z = side * 0.35;
      armMesh.rotation.x = 0.35;
      armPivot.add(armMesh);

      var paw = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), whiteFurMat);
      paw.position.set(side * 0.30, -0.68, 0.32);
      armPivot.add(paw);

      return armPivot;
    }

    var leftArm = createRabbitArm(-1);
    var rightArm = createRabbitArm(1);
    bodyGroup.add(leftArm, rightArm);

    // Big White Hind Feet
    var leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), whiteFurMat);
    leftFoot.scale.set(0.85, 0.48, 1.55);
    leftFoot.position.set(-0.56, 0.24, 0.38);
    var rightFoot = leftFoot.clone();
    rightFoot.position.set(0.56, 0.24, 0.38);
    bodyGroup.add(leftFoot, rightFoot);

    // Scenic Flower Meadow Patch under the Rabbit
    var meadowPad = new THREE.Group();
    var grassDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.9, 0.24, 20),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.75 })
    );
    grassDisc.position.y = 0.12;
    meadowPad.add(grassDisc);
    root.add(meadowPad);

    var bubble = createComicBubbleSprite('Hello, train! 🐰', '#ffffff', '#f43f5e', '#881337', 7.8, 2.9);
    bubble.sprite.position.set(0, 5.4, 0);
    root.add(bubble.sprite);

    root.scale.setScalar(1.12);

    return {
      root: root,
      bodyGroup: bodyGroup,
      headGroup: headGroup,
      leftEar: leftEar,
      rightEar: rightEar,
      leftArm: leftArm,
      rightArm: rightArm,
      leftFoot: leftFoot,
      rightFoot: rightFoot,
      bubble: bubble
    };
  }

  // 3. VEVERKA U STROMU: Cheerful Orange Squirrel + Colorful Storybook Pom-Pom Tree (`image_67733db9.png` left)
  function buildStorybookSquirrelAndTree() {
    var envGroup = new THREE.Group();

    // A) Colorful Rainbow/Pom-Pom Storybook Tree (`image_67733db9.png`) with a sturdy lower landing branch!
    var treeGroup = new THREE.Group();
    envGroup.add(treeGroup);

    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
    var mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.35, 8.2, 16), trunkMat);
    mainTrunk.position.set(0, 4.1, 0);
    mainTrunk.castShadow = true;
    treeGroup.add(mainTrunk);

    // Colorful pastel/rainbow bark ribs along the lower trunk (inspired by `image_67733db9.png`!)
    var ribColors = [0xf43f5e, 0xf59e0b, 0xfacc15, 0x22c55e, 0x06b6d4, 0x8b5cf6, 0xec4899];
    for (var ri = 0; ri < ribColors.length; ri++) {
      var ang = (ri / ribColors.length) * Math.PI * 2.0;
      var ribMat = new THREE.MeshStandardMaterial({ color: ribColors[ri], roughness: 0.45 });
      var rib = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 6.2, 10), ribMat);
      rib.position.set(Math.cos(ang) * 0.92, 3.1, Math.sin(ang) * 0.92);
      treeGroup.add(rib);
    }

    // Sturdy Lower Wooden Branch extending toward the approaching train & track (`local -X, +Z`) to exact landing perch `(-1.85, 4.30, 1.85)`
    var branchBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 3.2, 12), trunkMat);
    branchBeam.position.set(-1.10, 4.05, 1.10);
    branchBeam.rotation.z = 1.12;
    branchBeam.rotation.y = 0.68;
    branchBeam.castShadow = true;
    treeGroup.add(branchBeam);

    // Flat wooden perch knot at the tip of the branch where the squirrel lands `(-1.85, 4.18, 1.85)`
    var perchPad = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.58, 0.26, 14), trunkMat);
    perchPad.position.set(-1.85, 4.18, 1.85);
    treeGroup.add(perchPad);

    // Multi-colored spherical pom-pom foliage canopy (`image_67733db9.png`)
    var pomColors = [0xec4899, 0xf43f5e, 0xf97316, 0xfacc15, 0x4ade80, 0x22c55e, 0x38bdf8, 0x8b5cf6, 0xa855f7];
    var pomPositions = [
      [0, 9.6, 0, 2.2], [-2.2, 8.2, 0.8, 1.65], [2.2, 8.3, 0.7, 1.65],
      [0, 8.4, 2.1, 1.6], [0, 8.4, -2.1, 1.6], [-1.6, 9.5, -1.4, 1.55],
      [1.6, 9.5, -1.4, 1.55], [-1.5, 9.6, 1.5, 1.5], [1.5, 9.6, 1.5, 1.5],
      [-2.9, 7.1, -0.4, 1.35], [2.9, 7.2, -0.4, 1.35], [0, 11.1, 0.2, 1.55]
    ];
    pomPositions.forEach(function(pp, idx) {
      var pMat = new THREE.MeshStandardMaterial({ color: pomColors[idx % pomColors.length], roughness: 0.38 });
      var sphere = new THREE.Mesh(new THREE.SphereGeometry(pp[3], 18, 16), pMat);
      sphere.position.set(pp[0], pp[1], pp[2]);
      sphere.castShadow = true;
      treeGroup.add(sphere);
    });

    // Foreground Mossy Wooden Log at `[-0.85, 0.36, 3.45]` on the clear track-facing side where the squirrel starts
    var groundLog = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 2.8, 14), trunkMat);
    groundLog.rotation.z = Math.PI * 0.5;
    groundLog.rotation.y = -0.18;
    groundLog.position.set(-0.85, 0.36, 3.45);
    groundLog.castShadow = true;
    envGroup.add(groundLog);

    // B) Cheerful Orange Squirrel (`squirrelGroup`)
    var squirrelGroup = new THREE.Group();
    var startGroundPos = new THREE.Vector3(-0.85, 0.68, 3.45);
    var branchLandingPos = new THREE.Vector3(-1.85, 4.32, 1.85);
    squirrelGroup.position.copy(startGroundPos);
    envGroup.add(squirrelGroup);

    var orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.34 });
    var brightOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.32 });
    var creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.38 });
    var darkEyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
    var whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    var sqBody = new THREE.Group();
    squirrelGroup.add(sqBody);

    var torso = new THREE.Mesh(new THREE.SphereGeometry(0.82, 20, 18), orangeMat);
    torso.scale.set(0.96, 1.18, 0.90);
    torso.position.set(0, 0.98, 0);
    torso.castShadow = true;
    sqBody.add(torso);

    var belly = new THREE.Mesh(new THREE.SphereGeometry(0.66, 16, 14), creamMat);
    belly.scale.set(0.84, 1.02, 0.48);
    belly.position.set(0, 0.94, 0.54);
    sqBody.add(belly);

    var head = new THREE.Mesh(new THREE.SphereGeometry(0.76, 22, 18), brightOrangeMat);
    head.scale.set(1.06, 0.96, 0.96);
    head.position.set(0, 2.02, 0.10);
    head.castShadow = true;
    sqBody.add(head);

    // Cream cheeks
    [-0.44, 0.44].forEach(function(cx) {
      var cheek = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 12), creamMat);
      cheek.scale.set(1.1, 0.78, 0.85);
      cheek.position.set(cx, 1.84, 0.36);
      sqBody.add(cheek);
    });

    // Pointed Squirrel Ears with Tufts
    [-0.44, 0.44].forEach(function(ex) {
      var side = ex > 0 ? 1 : -1;
      var ear = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.62, 12), orangeMat);
      ear.position.set(ex, 2.74, 0.04);
      ear.rotation.z = -side * 0.22;
      sqBody.add(ear);
    });

    // Expressive Eyes, Nose & Toothy Smile
    [-0.26, 0.26].forEach(function(ex) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), darkEyeMat);
      eye.scale.set(0.92, 1.15, 0.55);
      eye.position.set(ex, 2.12, 0.76);
      sqBody.add(eye);
      var catchL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), whiteMat);
      catchL.position.set(ex - 0.04, 2.18, 0.85);
      sqBody.add(catchL);
    });

    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), darkEyeMat);
    nose.position.set(0, 1.94, 0.86);
    sqBody.add(nose);

    [-0.05, 0.05].forEach(function(tx) {
      var tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.05), whiteMat);
      tooth.position.set(tx, 1.74, 0.80);
      sqBody.add(tooth);
    });

    // Articulated Front Paws (`leftArm`, `rightArm` — wave hello to the train when in camera view!)
    function createSquirrelArm(side) {
      var armPivot = new THREE.Group();
      armPivot.position.set(side * 0.58, 1.48, 0.22);

      var armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.62, 10), brightOrangeMat);
      armMesh.position.set(side * 0.14, -0.24, 0.14);
      armMesh.rotation.z = side * 0.35;
      armMesh.rotation.x = 0.35;
      armPivot.add(armMesh);

      var paw = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), creamMat);
      paw.position.set(side * 0.24, -0.52, 0.26);
      armPivot.add(paw);

      return armPivot;
    }

    var leftArm = createSquirrelArm(-1);
    var rightArm = createSquirrelArm(1);
    sqBody.add(leftArm, rightArm);

    // Giant Fluffy S-Curved Bushy Tail (`tailGroup`)
    var tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.65, -0.58);
    sqBody.add(tailGroup);

    var tailSegments = [
      [0, 0.15, -0.35, 0.48, orangeMat],
      [0, 0.55, -0.72, 0.62, brightOrangeMat],
      [0, 1.08, -0.95, 0.74, orangeMat],
      [0, 1.68, -0.98, 0.82, brightOrangeMat],
      [0, 2.25, -0.78, 0.76, orangeMat],
      [0, 2.68, -0.45, 0.58, creamMat]
    ];
    tailSegments.forEach(function(ts) {
      var tSphere = new THREE.Mesh(new THREE.SphereGeometry(ts[3], 16, 14), ts[4]);
      tSphere.position.set(ts[0], ts[1], ts[2]);
      tSphere.castShadow = true;
      tailGroup.add(tSphere);
    });

    var bubble = createComicBubbleSprite('Wheee! Hi! 🐿️', '#fffbeb', '#f97316', '#9a3412', 7.6, 2.8);
    bubble.sprite.position.set(0, 4.2, 0);
    squirrelGroup.add(bubble.sprite);

    return {
      envGroup: envGroup,
      squirrelGroup: squirrelGroup,
      sqBody: sqBody,
      tailGroup: tailGroup,
      leftArm: leftArm,
      rightArm: rightArm,
      startGroundPos: startGroundPos,
      branchLandingPos: branchLandingPos,
      bubble: bubble
    };
  }

  // 4. SOVA U STROMU: Friendly Owl Perched on a Woodland Tree Branch (`image_67733db9.png` right)
  function buildStorybookOwlAndTree() {
    var envGroup = new THREE.Group();

    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2d0c, roughness: 0.75 });
    var leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
    var leafMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.50 });

    // Sturdy Woodland Tree
    var mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.45, 8.6, 16), trunkMat);
    mainTrunk.position.set(0, 4.3, 0);
    mainTrunk.castShadow = true;
    envGroup.add(mainTrunk);

    var foliageSpheres = [
      [0, 9.4, 0, 2.6, leafMat1],
      [-1.8, 8.6, -0.5, 2.0, leafMat2],
      [1.9, 8.4, -0.7, 2.1, leafMat2],
      [0.3, 10.6, 0.4, 1.9, leafMat2]
    ];
    foliageSpheres.forEach(function(fs) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(fs[3], 16, 14), fs[4]);
      m.position.set(fs[0], fs[1], fs[2]);
      m.castShadow = true;
      envGroup.add(m);
    });

    // Sturdy Horizontal Perch Branch extending toward the approaching train & track (`local -X, +Z`) at `y = 4.45m`
    var perchBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 3.6, 14), trunkMat);
    perchBranch.rotation.z = Math.PI * 0.5;
    perchBranch.rotation.y = 0.58;
    perchBranch.position.set(-1.35, 4.45, 1.05);
    perchBranch.castShadow = true;
    envGroup.add(perchBranch);

    // Friendly Owl Group perched squarely on the track-facing branch (`[-2.05, 4.68, 1.65]`)
    var owlGroup = new THREE.Group();
    owlGroup.position.set(-2.05, 4.68, 1.65);
    envGroup.add(owlGroup);

    var slatePlumageMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.42 });
    var darkPlumageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.48 });
    var creamChestMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.40 });
    var discWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.32 });
    var amberEyeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.18 });
    var beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28 });
    var pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    var pureWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Plump Owl Torso
    var owlTorso = new THREE.Mesh(new THREE.SphereGeometry(1.05, 22, 20), slatePlumageMat);
    owlTorso.scale.set(1.02, 1.24, 0.94);
    owlTorso.position.set(0, 1.22, 0);
    owlTorso.castShadow = true;
    owlGroup.add(owlTorso);

    // Cream-Beige Feathered Chest
    var chest = new THREE.Mesh(new THREE.SphereGeometry(0.86, 20, 16), creamChestMat);
    chest.scale.set(0.88, 1.06, 0.54);
    chest.position.set(0, 1.16, 0.64);
    owlGroup.add(chest);

    // Subtle dark chevron feather markings on the chest
    [-0.28, 0.0, 0.28].forEach(function(mx, idx) {
      var mark = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.05), darkPlumageMat);
      mark.position.set(mx, 1.32 - (idx % 2) * 0.22, 1.08);
      owlGroup.add(mark);
    });

    // Independently Articulated Left & Right Multi-Layered Wings (`leftWingPivot`, `rightWingPivot`)
    function createOwlWing(side) {
      var wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.92, 1.72, 0.0);

      var mainWing = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 14), slatePlumageMat);
      mainWing.scale.set(0.38, 1.38, 0.72);
      mainWing.position.set(side * 0.24, -0.52, 0.0);
      mainWing.castShadow = true;
      wingPivot.add(mainWing);

      var tipFeathers = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12), darkPlumageMat);
      tipFeathers.scale.set(0.32, 1.15, 0.58);
      tipFeathers.position.set(side * 0.30, -0.92, -0.05);
      wingPivot.add(tipFeathers);

      return wingPivot;
    }

    var leftWing = createOwlWing(-1);
    var rightWing = createOwlWing(1);
    owlGroup.add(leftWing, rightWing);

    // Articulated Owl Head (`headGroup`) — rotates toward the approaching train!
    var headGroup = new THREE.Group();
    headGroup.position.set(0, 2.42, 0.08);
    owlGroup.add(headGroup);

    var headBase = new THREE.Mesh(new THREE.SphereGeometry(0.94, 22, 18), slatePlumageMat);
    headBase.scale.set(1.14, 0.92, 0.94);
    headBase.castShadow = true;
    headGroup.add(headBase);

    // Binocular Facial Discs & Huge Amber-Gold Owl Eyes (`image_67733db9.png` right)
    [-0.42, 0.42].forEach(function(ex) {
      var outerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.16, 20), darkPlumageMat);
      outerRim.rotation.x = Math.PI * 0.5;
      outerRim.position.set(ex, 0.06, 0.68);
      headGroup.add(outerRim);

      var whiteDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 20), discWhiteMat);
      whiteDisc.rotation.x = Math.PI * 0.5;
      whiteDisc.position.set(ex, 0.06, 0.70);
      headGroup.add(whiteDisc);

      var iris = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), amberEyeMat);
      iris.scale.set(1.0, 1.0, 0.52);
      iris.position.set(ex, 0.06, 0.78);
      headGroup.add(iris);

      var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), pupilMat);
      pupil.scale.set(1.0, 1.0, 0.55);
      pupil.position.set(ex, 0.06, 0.86);
      headGroup.add(pupil);

      var catchL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), pureWhiteMat);
      catchL.position.set(ex - 0.07, 0.14, 0.96);
      headGroup.add(catchL);
    });

    // Dramatic V-Shaped Feathered Brow Ridges / Ear Tufts (`image_67733db9.png`)
    [-1, 1].forEach(function(side) {
      var brow = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.24), discWhiteMat);
      brow.position.set(side * 0.42, 0.46, 0.76);
      brow.rotation.z = side * 0.34;
      headGroup.add(brow);
    });

    // Curved Golden-Orange Owl Beak
    var beak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.44, 12), beakMat);
    beak.rotation.x = Math.PI * 0.68;
    beak.position.set(0, -0.10, 0.92);
    headGroup.add(beak);

    // Golden-Orange Talons gripping the branch
    [-0.36, 0.36].forEach(function(tx) {
      [-0.10, 0.0, 0.10].forEach(function(toeX) {
        var talon = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.28, 8), beakMat);
        talon.position.set(tx + toeX, 0.08, 0.22);
        talon.rotation.x = 0.55;
        owlGroup.add(talon);
      });
    });

    var bubble = createComicBubbleSprite('Hoo-hoo! 🦉', '#fef3c7', '#d97706', '#78350f', 7.4, 2.8);
    bubble.sprite.position.set(0, 4.4, 0);
    owlGroup.add(bubble.sprite);

    return {
      envGroup: envGroup,
      owlGroup: owlGroup,
      headGroup: headGroup,
      leftWing: leftWing,
      rightWing: rightWing,
      bubble: bubble
    };
  }

  // --------------------------------------------------------------------------
  // D) PLACE ALL 4 CHARACTERS ALONG THE RAILWAY TRACKS
  // --------------------------------------------------------------------------
  function findSurfaceEdge(edgeId) {
    for (var i = 0; i < window.edges.length; i++) {
      if (window.edges[i] && window.edges[i].id === edgeId) return window.edges[i];
    }
    return null;
  }

  function getTrackFrameAt(edge, u) {
    var pt = edge.curve.getPointAt(u).clone();
    var tan = edge.curve.getTangentAt(u).clone().normalize();
    // Match `addBidirectionalTrack` perpendicular convention (`-tan.z, 0, tan.x`)
    var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    return { pt: pt, tan: tan, perp: perp };
  }

  var edgeWestNW  = findSurfaceEdge('J_WEST->J_NW');
  var edgeNorthNE = findSurfaceEdge('J_NORTH->J_NE');
  var edgeSeSouth = findSurfaceEdge('J_SE->J_SOUTH') || edgeNorthNE;
  if (!edgeWestNW || !edgeNorthNE) return;

  // Helper: Builds a lush green storybook meadow terrace pad whose top sits at the
  // exact level of the railway track (`topY = frame.pt.y`) so animals & hiding trees
  // are ALWAYS at the same level as the train (`nikdy pod úrovní vláčku`)!
  function buildTrackLevelMeadowTerrace(x, z, topY, topRadius) {
    var naturalGroundY = window.getTerrainHeight ? window.getTerrainHeight(x, z) : (topY - 1.5);
    var terraceH = Math.max(0.65, topY - naturalGroundY);
    var terraceG = new THREE.Group();
    terraceG.position.set(x, topY, z);

    var slopeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(topRadius, topRadius + 1.2 + terraceH * 0.45, terraceH, 24),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 })
    );
    slopeMesh.position.y = -terraceH * 0.5;
    slopeMesh.receiveShadow = true;

    var lawnTop = new THREE.Mesh(
      new THREE.CylinderGeometry(topRadius + 0.15, topRadius + 0.25, 0.30, 24),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.68 })
    );
    lawnTop.position.y = -0.10;
    lawnTop.receiveShadow = true;

    terraceG.add(slopeMesh, lawnTop);
    scene.add(terraceG);
    return terraceG;
  }

  // 1. TWO TRACK MONSTERS ("Strašidla sedící na kolejích"):
  //    - Monster #1 (Purple 2-eyed antenna monster): Behind Mom & Dad's House on `J_WEST->J_NW` at `u = 0.79`
  //    - Monster #2 (Fluffy multi-colored 1-eyed monster): Behind Grandma's House on `J_NORTH->J_NE` at `u = 0.79`
  var monsterInstances = [];

  function spawnTrackMonsterOnEdge(edge, uTrack, modelObj, pitchMult, labelName) {
    var frame = getTrackFrameAt(edge, uTrack);
    var railSurfaceY = frame.pt.y + 0.18;
    var hidingLateral = -11.2; // Safe hiding spot behind tree well outside both tracks
    var hideWorldPos = frame.pt.clone().add(frame.perp.clone().multiplyScalar(hidingLateral));
    var hideGroundY = frame.pt.y; // Keep hiding spot & tree at exact track level!

    // Place dedicated hiding tree at `lateral = -9.6m` on a track-level green meadow terrace
    var treePos = frame.pt.clone().add(frame.perp.clone().multiplyScalar(-9.6));
    var treeGroundY = frame.pt.y;
    var treeTerrace = buildTrackLevelMeadowTerrace(treePos.x, treePos.z, treeGroundY, 4.8);
    var hidingTree = buildMonsterHidingTree();
    hidingTree.position.set(treePos.x, treeGroundY, treePos.z);
    scene.add(hidingTree);

    modelObj.root.position.set(frame.pt.x, railSurfaceY, frame.pt.z);
    // Stand with back turned to oncoming train (`+tan` looks away from oncoming train)
    modelObj.root.lookAt(frame.pt.clone().add(frame.tan));
    scene.add(modelObj.root);

    monsterInstances.push({
      name: labelName,
      model: modelObj,
      hidingTree: hidingTree,
      hidingTreeTerrace: treeTerrace,
      hidingTreePos: new THREE.Vector3(treePos.x, treeGroundY, treePos.z),
      trackCenterPos: new THREE.Vector3(frame.pt.x, railSurfaceY, frame.pt.z),
      parallelTrackPos: new THREE.Vector3(
        frame.pt.x + frame.perp.x * 4.4,
        railSurfaceY,
        frame.pt.z + frame.perp.z * 4.4
      ),
      tan: frame.tan.clone(),
      perp: frame.perp.clone(),
      railY: railSurfaceY,
      hideGroundY: hideGroundY,
      hidingLateral: hidingLateral,
      currentLateral: 0.0,
      activeSeatLateral: 0.0,
      state: 'SITTING', // 'SITTING' (standing with back turned) | 'STARTLED' | 'RUNNING_OFF' | 'HIDING_PEEKING' | 'RETURNING'
      stateTimer: 0.0,
      awayTimer: 0.0,
      tongueSoundPlayed: false,
      startleAwayTarget: null,
      pitchMult: pitchMult
    });
  }

  spawnTrackMonsterOnEdge(edgeWestNW, 0.79, buildPurpleAntennaMonster(), 1.0, '👾 Purple Track Monster (Mom\'s House)');
  spawnTrackMonsterOnEdge(edgeNorthNE, 0.79, buildFluffyCyclopsMonster(), 0.88, '👹 Fluffy Track Monster (Grandma\'s House)');

  // 2. KRÁLÍK U CESTY (White Rabbit in the SOUTH region on `J_SE->J_SOUTH` at `u = 0.78`, lateral `-7.8m`,
  //    placed at exact track level `y = rabbitFrame.pt.y` so it is 100% visible at train height and evenly spaced across the map!)
  var rabbitFrame = getTrackFrameAt(edgeSeSouth, 0.78);
  var rabbitWorldPos = rabbitFrame.pt.clone().add(rabbitFrame.perp.clone().multiplyScalar(-7.8));
  rabbitWorldPos.y = rabbitFrame.pt.y;
  var rabbitTerrace = buildTrackLevelMeadowTerrace(rabbitWorldPos.x, rabbitWorldPos.z, rabbitWorldPos.y, 4.5);
  var rabbitObj = buildStorybookWhiteRabbit();
  rabbitObj.root.position.copy(rabbitWorldPos);
  rabbitObj.root.lookAt(rabbitFrame.pt.x, rabbitWorldPos.y, rabbitFrame.pt.z);
  scene.add(rabbitObj.root);

  var rabbitState = {
    obj: rabbitObj,
    terrace: rabbitTerrace,
    trackAnchorPos: rabbitFrame.pt.clone(),
    worldPos: rabbitWorldPos.clone(),
    tan: rabbitFrame.tan.clone(),
    perp: rabbitFrame.perp.clone(),
    state: 'IDLE', // 'IDLE' | 'HOPPING_AND_WAVING' | 'COOLDOWN'
    timer: 0.0,
    honkedThisPass: false
  };

  // 3. VEVERKA U STROMU (Orange Squirrel + Colorful Storybook Tree in the NORTH-EAST region on `J_NORTH->J_NE` at `u = 0.20`,
  //    lateral `-8.4m`, placed at exact track level `y = sqFrame.pt.y` so it is at train height and far from Rabbit & Owl!)
  var sqFrame = getTrackFrameAt(edgeNorthNE, 0.20);
  var sqTreeWorldPos = sqFrame.pt.clone().add(sqFrame.perp.clone().multiplyScalar(-8.4));
  sqTreeWorldPos.y = sqFrame.pt.y;
  var sqTerrace = buildTrackLevelMeadowTerrace(sqTreeWorldPos.x, sqTreeWorldPos.z, sqTreeWorldPos.y, 5.2);
  var squirrelObj = buildStorybookSquirrelAndTree();
  squirrelObj.envGroup.position.copy(sqTreeWorldPos);
  squirrelObj.envGroup.lookAt(sqFrame.pt.x, sqTreeWorldPos.y, sqTreeWorldPos.z);
  scene.add(squirrelObj.envGroup);

  var squirrelState = {
    obj: squirrelObj,
    terrace: sqTerrace,
    trackAnchorPos: sqFrame.pt.clone(),
    worldPos: sqTreeWorldPos.clone(),
    tan: sqFrame.tan.clone(),
    perp: sqFrame.perp.clone(),
    state: 'GROUND_IDLE', // 'GROUND_IDLE' | 'SPIN_AND_LEAP' | 'PERCHED_ON_BRANCH' | 'HOPPING_DOWN'
    timer: 0.0,
    honkedThisPass: false
  };

  // 4. SOVA U STROMU (Friendly Owl on Tree Branch in the NORTH-WEST region on `J_WEST->J_NW` at `u = 0.20`,
  //    lateral `-8.4m`, placed at exact track level `y = owlFrame.pt.y` so it is at train height and evenly spaced!)
  var owlFrame = getTrackFrameAt(edgeWestNW, 0.20);
  var owlTreeWorldPos = owlFrame.pt.clone().add(owlFrame.perp.clone().multiplyScalar(-8.4));
  owlTreeWorldPos.y = owlFrame.pt.y;
  var owlTerrace = buildTrackLevelMeadowTerrace(owlTreeWorldPos.x, owlTreeWorldPos.z, owlTreeWorldPos.y, 5.2);
  var owlObj = buildStorybookOwlAndTree();
  owlObj.envGroup.position.copy(owlTreeWorldPos);
  owlObj.envGroup.lookAt(owlFrame.pt.x, owlTreeWorldPos.y, owlFrame.pt.z);
  scene.add(owlObj.envGroup);

  var owlState = {
    obj: owlObj,
    terrace: owlTerrace,
    trackAnchorPos: owlFrame.pt.clone(),
    worldPos: owlTreeWorldPos.clone(),
    tan: owlFrame.tan.clone(),
    perp: owlFrame.perp.clone(),
    state: 'PERCHED_IDLE', // 'PERCHED_IDLE' | 'GREETING' | 'COOLDOWN'
    timer: 0.0,
    honkedThisPass: false
  };

  // Expose registry for inspection & testing
  window.storybookInteractiveCharacters = {
    monsters: monsterInstances,
    rabbit: rabbitState,
    squirrel: squirrelState,
    owl: owlState
  };

  // Clear any randomly spawned background trees or houses that accidentally landed inside the
  // 16m sightline corridor around our interactive animals so they are never buried in random foliage!
  (function clearRandomFoliageFromAnimalCorridors() {
    var protectedObjects = [
      rabbitObj.root, rabbitTerrace,
      squirrelObj.envGroup, sqTerrace,
      owlObj.envGroup, owlTerrace,
      window.daisyTheCow
    ];
    for (var mi2 = 0; mi2 < monsterInstances.length; mi2++) {
      protectedObjects.push(
        monsterInstances[mi2].model.root,
        monsterInstances[mi2].hidingTree,
        monsterInstances[mi2].hidingTreeTerrace
      );
    }
    if (window.trackSheepFlocks) {
      for (var si2 = 0; si2 < window.trackSheepFlocks.length; si2++) {
        if (window.trackSheepFlocks[si2].group) protectedObjects.push(window.trackSheepFlocks[si2].group);
      }
    }

    var clearCenters = [
      { pos: rabbitWorldPos, rad: 16.5 },
      { pos: rabbitFrame.pt, rad: 14.0 },
      { pos: sqTreeWorldPos, rad: 16.5 },
      { pos: sqFrame.pt, rad: 14.0 },
      { pos: owlTreeWorldPos, rad: 16.5 },
      { pos: owlFrame.pt, rad: 14.0 }
    ];
    for (var mi3 = 0; mi3 < monsterInstances.length; mi3++) {
      clearCenters.push({ pos: monsterInstances[mi3].trackCenterPos, rad: 15.0 });
      clearCenters.push({ pos: monsterInstances[mi3].hidingTreePos, rad: 14.0 });
    }
    if (window.daisyTheCow && window.daisyTheCow.position) {
      clearCenters.push({ pos: window.daisyTheCow.position, rad: 15.0 });
    }

    if (scene && scene.children) {
      for (var ci2 = scene.children.length - 1; ci2 >= 0; ci2--) {
        var ch = scene.children[ci2];
        if (!ch || !ch.position || protectedObjects.indexOf(ch) !== -1) continue;
        // Only check small/medium environment props (random trees, bushes, random houses) whose root position is near an animal
        var chScale = (ch.scale && typeof ch.scale.x === 'number') ? ch.scale.x : 1.0;
        if (chScale > 2.5) continue;
        var isRandomProp = (
          (ch.children && ch.children.length >= 2 && ch.children.length <= 8) ||
          (window.surfaceHousesList && window.surfaceHousesList.indexOf(ch) !== -1)
        );
        if (!isRandomProp) continue;
        // Never touch track, road, or landmark groups at (0,0,0)
        if (Math.abs(ch.position.x) < 0.01 && Math.abs(ch.position.z) < 0.01) continue;

        for (var k = 0; k < clearCenters.length; k++) {
          var cc = clearCenters[k];
          var dXZ = Math.hypot(ch.position.x - cc.pos.x, ch.position.z - cc.pos.z);
          if (dXZ < cc.rad) {
            ch.visible = false;
            ch.position.y = -500;
            break;
          }
        }
      }
    }
  })();

  // --------------------------------------------------------------------------
  // E) HELPER: FIND CLOSEST APPROACHING TRAIN & SPEED FOR ANY TRACK POINT
  // --------------------------------------------------------------------------
  function getClosestTrainApproachInfo(trackPt, parallelTrackPt) {
    var bestDist = 999999;
    var bestSpeedMps = 8.4;
    var bestTrainPos = null;
    var isOnParallelTrack = false;
    var isPlayerClosest = false;

    if (window.playerLoco && window.pState && !window.pState.inSubway) {
      var pPos = window.playerLoco.position;
      var dPlayer = pPos.distanceTo(trackPt);
      var pSpeedMps = Math.max(8.4, Math.abs(window.pState.currentVel || 0.14) * 60.0);
      if (dPlayer < bestDist) {
        bestDist = dPlayer;
        bestSpeedMps = pSpeedMps;
        bestTrainPos = pPos;
        isOnParallelTrack = false;
        isPlayerClosest = true;
      }
      // Also check rear wagon distance so monster stays safely hidden until the ENTIRE train has passed!
      if (window.playerCoaches && window.playerCoaches.length > 0) {
        var lastCoach = window.playerCoaches[window.playerCoaches.length - 1];
        if (lastCoach && lastCoach.position) {
          var dCoach = lastCoach.position.distanceTo(trackPt);
          if (dCoach < bestDist) {
            bestDist = dCoach;
            bestSpeedMps = pSpeedMps;
            bestTrainPos = lastCoach.position;
            isPlayerClosest = true;
          }
        }
      }
    }

    if (window.aiTrains && parallelTrackPt) {
      for (var i = 0; i < window.aiTrains.length; i++) {
        var ai = window.aiTrains[i];
        if (ai && ai.loco && ai.loco.position) {
          var dAi = ai.loco.position.distanceTo(parallelTrackPt);
          var aiSpeedMps = Math.max(10.0, Math.abs(ai.currentSpeed || ai.baseSpeed || 0.25) * 60.0);
          if (dAi < bestDist) {
            bestDist = dAi;
            bestSpeedMps = aiSpeedMps;
            bestTrainPos = ai.loco.position;
            isOnParallelTrack = true;
            isPlayerClosest = false;
          }
        }
      }
    }

    return {
      dist: bestDist,
      speedMps: bestSpeedMps,
      trainPos: bestTrainPos,
      isOnParallelTrack: isOnParallelTrack,
      isPlayerClosest: isPlayerClosest
    };
  }

  // Helper: Check if the player train is currently moving TOWARD a given world point
  function isPlayerApproachingPoint(targetWorldPt) {
    if (!window.playerLoco || !window.pState || !window.pState.edge || !window.pState.edge.curve) return false;
    var pPos = window.playerLoco.position;
    var ct = Math.max(0, Math.min(1, window.pState.t || 0));
    var tan = window.pState.edge.curve.getTangentAt(ct).normalize();
    if ((window.pState.currentVel || 0) < -0.01) tan.negate();
    var toTarget = targetWorldPt.clone().sub(pPos);
    toTarget.y = 0;
    if (toTarget.lengthSq() < 0.001) return true;
    toTarget.normalize();
    return toTarget.dot(tan) > 0.10;
  }

  // --------------------------------------------------------------------------
  // F) PER-FRAME ANIMATION, CAMERA CHOREOGRAPHY & STATE MACHINE UPDATE
  // --------------------------------------------------------------------------
  var lastUpdateMs = performance.now();

  function updateAllInteractiveStorybookCharacters() {
    var nowMs = performance.now();
    var dt = Math.min(0.08, Math.max(0.004, (nowMs - lastUpdateMs) / 1000.0));
    lastUpdateMs = nowMs;
    var timeSec = nowMs * 0.001;

    var charCamActive = false;
    var charCamPos = null;
    var charCamLook = null;
    var requestSlowdown = false;
    var requestMonsterHoldCrawl = false;

    var playerActiveOnSurface = Boolean(window.playerLoco && window.pState && !window.pState.inSubway);
    var pPos = playerActiveOnSurface ? window.playerLoco.position : null;
    var pTan = null;
    if (playerActiveOnSurface && window.pState.edge && window.pState.edge.curve) {
      var curT = Math.max(0, Math.min(1, window.pState.t || 0));
      pTan = window.pState.edge.curve.getTangentAt(curT).normalize();
      if ((window.pState.currentVel || 0) < -0.01) pTan.negate();
    }

    // Trigger sheep & cow sounds (< 20m) AND make sheep & Daisy the Cow wave to the train whenever in camera view (<= 46m)!
    if (playerActiveOnSurface && pPos) {
      if (window.trackSheepFlocks) {
        for (var sfi = 0; sfi < window.trackSheepFlocks.length; sfi++) {
          var fl = window.trackSheepFlocks[sfi];
          if (fl && fl.basePos) {
            var dSheep = pPos.distanceTo(fl.basePos);
            if (dSheep < 19.5 && !fl._baaPlayedWithin20m && typeof window.playSheepBaa === 'function') {
              fl._baaPlayedWithin20m = true;
              window.playSheepBaa();
            } else if (dSheep > 32.0) {
              fl._baaPlayedWithin20m = false;
            }
            // Wave sheep front hoof/paw when in camera view (`dSheep <= 46m`)!
            if (fl.group && fl.group.children) {
              var sheepInCam = (dSheep <= 46.0);
              for (var sci = 0; sci < fl.group.children.length; sci++) {
                var shMesh = fl.group.children[sci];
                if (shMesh && shMesh.userData) {
                  if (sheepInCam) {
                    shMesh.lookAt(pPos.x, fl.group.position.y, pPos.z);
                    if (shMesh.userData.rightForeleg) {
                      shMesh.userData.rightForeleg.rotation.x = -1.35;
                      shMesh.userData.rightForeleg.rotation.z = -0.75 + Math.sin(timeSec * 15.0 + sci) * 0.48;
                    }
                    if (shMesh.userData.headGroup) {
                      shMesh.userData.headGroup.rotation.x = Math.sin(timeSec * 8.0 + sci) * 0.18;
                    }
                  } else {
                    if (shMesh.userData.rightForeleg) {
                      shMesh.userData.rightForeleg.rotation.x = 0.0;
                      shMesh.userData.rightForeleg.rotation.z = 0.0;
                    }
                    if (shMesh.userData.headGroup) {
                      shMesh.userData.headGroup.rotation.x = 0.0;
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (window.daisyTheCow && window.daisyTheCow.position) {
        var dCow = pPos.distanceTo(window.daisyTheCow.position);
        if (dCow < 19.5 && !window.daisyTheCow._mooPlayedWithin20m && typeof window.playCowMoo === 'function') {
          window.daisyTheCow._mooPlayedWithin20m = true;
          window.playCowMoo();
        } else if (dCow > 30.0) {
          window.daisyTheCow._mooPlayedWithin20m = false;
        }
        // Wave Daisy the Cow's front hoof when in camera view (`dCow <= 46m`)!
        if (window.daisyTheCow.userData) {
          if (dCow <= 46.0) {
            window.daisyTheCow.lookAt(pPos.x, window.daisyTheCow.position.y, pPos.z);
            if (window.daisyTheCow.userData.rightForeleg) {
              window.daisyTheCow.userData.rightForeleg.rotation.x = -1.38;
              window.daisyTheCow.userData.rightForeleg.rotation.z = -0.82 + Math.sin(timeSec * 14.0) * 0.46;
            }
            if (window.daisyTheCow.userData.headGroup) {
              window.daisyTheCow.userData.headGroup.rotation.z = Math.sin(timeSec * 7.0) * 0.14;
            }
          } else {
            if (window.daisyTheCow.userData.rightForeleg) {
              window.daisyTheCow.userData.rightForeleg.rotation.x = 0.0;
              window.daisyTheCow.userData.rightForeleg.rotation.z = 0.0;
            }
            if (window.daisyTheCow.userData.headGroup) {
              window.daisyTheCow.userData.headGroup.rotation.z = 0.0;
            }
          }
        }
      }
    }

    // ========================================================================
    // 1. UPDATE BOTH TRACK MONSTERS ("Strašidla sedící na kolejích")
    //    - Stands with back turned to train before honk ("štrašidlo stojí před zatroubením k vláčku zády")
    //    - 3s before startle (`dist <= 45m` down to `19.5m`):
    //      Smooth camera zoom from ~10m higher above the train (`y = pPos.y + 14.5m`),
    //      showing both the front of the train (`začátek vláčku`) AND the monster,
    //      while slowing the train to minimum speed!
    //    - 0.5s BEFORE startle (`1. zatroubení vláčku prosím o 0.5s před zleknutím strašidla`):
    //      Train blows its horn (`zatrub`) while monster still has its back turned,
    //      and exactly 0.50s later the monster startles, turns around 180° (`otočí se`),
    //      bulges its eyes (`vytřeští oči`), jumps ~5m high (`vyskočí asi 5m do výšky`),
    //      screams "HEEELP!" (audible within < 20m), runs off tracks (`uteče`),
    //      hides behind the tree (`schová se za strom`), and after 2s peeks out
    //      and sticks out its tongue (`a za 2s vykoukne a vyplázne jazyk`)!
    // ========================================================================
    window._storybookMonsterStopWait = false;
    for (var mi = 0; mi < monsterInstances.length; mi++) {
      var m = monsterInstances[mi];
      var mod = m.model;
      var info = getClosestTrainApproachInfo(m.trackCenterPos, m.parallelTrackPos);
      var playerDistToMonsterTrack = (playerActiveOnSurface && pPos) ? pPos.distanceTo(m.trackCenterPos) : 999999;
      var playerApproachingMonster = playerActiveOnSurface && isPlayerApproachingPoint(m.trackCenterPos);

      // Horn triggers only AFTER the monster has been clearly visible in the camera shot for >= 2.20s ("alespoň 2s před zahoukáním vláčku a zleknutím strašidla"),
      // and exact 0.50s after the horn the monster startles!
      var hornTriggerDist = 21.5;
      var preZoomDist = 64.0;
      var minPreHornCamSeconds = 2.20;
      var resetDist = 32.0;

      if (m.state === 'SITTING') {
        m.stateTimer += dt;
        var targetSeat = info.isOnParallelTrack ? 4.4 : 0.0;
        m.activeSeatLateral += (targetSeat - m.activeSeatLateral) * Math.min(1.0, dt * 4.0);
        m.currentLateral = m.activeSeatLateral;

        var sitWorldPos = m.trackCenterPos.clone().add(m.perp.clone().multiplyScalar(m.currentLateral));
        mod.root.position.set(sitWorldPos.x, m.railY, sitWorldPos.z);

        // Stand with BACK TURNED toward the approaching train ("štrašidlo stojí před zatroubením k vláčku zády")
        if (info.trainPos && info.dist < 160.0) {
          var awayDx = sitWorldPos.x - info.trainPos.x;
          var awayDz = sitWorldPos.z - info.trainPos.z;
          if (awayDx * awayDx + awayDz * awayDz > 0.001) {
            mod.root.lookAt(sitWorldPos.x + awayDx, m.railY, sitWorldPos.z + awayDz);
          }
        }

        // Upright standing idle pose with back turned to the train
        mod.bodyGroup.position.y = Math.sin(timeSec * 2.6 + mi) * 0.05;
        mod.bodyGroup.rotation.z = Math.sin(timeSec * 1.8 + mi) * 0.04;
        mod.leftEye.scale.setScalar(1.0);
        mod.rightEye.scale.setScalar(1.0);
        mod.mouth.scale.set(0.85, 0.35 + Math.sin(timeSec * 2.2) * 0.06, 0.85);
        if (mod.peekingTongue) mod.peekingTongue.visible = false;
        mod.leftArm.rotation.z = 0.42;
        mod.rightArm.rotation.z = -0.42;
        mod.leftLeg.rotation.x = 0.0;
        mod.rightLeg.rotation.x = 0.0;
        mod.leftLeg.position.z = 0.05;
        mod.rightLeg.position.z = 0.05;
        mod.bubble.sprite.visible = false;

        // Track how long the monster has been visible in the focused camera shot before the horn
        var isCamShowingMonster = Boolean(
          playerActiveOnSurface &&
          playerDistToMonsterTrack <= preZoomDist &&
          (playerApproachingMonster || playerDistToMonsterTrack <= 26.0) &&
          (!window._camSysState || (window._camSysState.activePoiId === 'monster_' + mi && window._camSysState.poiWeight >= 0.40) || playerDistToMonsterTrack <= 48.0)
        );
        if (isCamShowingMonster) {
          m.preHornVisibleTimer = (m.preHornVisibleTimer || 0.0) + dt;
        } else if (playerDistToMonsterTrack > preZoomDist + 8.0) {
          m.preHornVisibleTimer = 0.0;
        }

        var isPlayerTriggering = (playerDistToMonsterTrack <= 42.0);
        var hasBeenVisible2Seconds = !isPlayerTriggering || ((m.preHornVisibleTimer || 0.0) >= minPreHornCamSeconds);

        // Step 1: When train reaches `dist <= 21.5m` AND the monster has been visible in the camera shot for >= 2.20s,
        // blow the train horn 0.5s BEFORE startle!
        if (info.dist <= hornTriggerDist && hasBeenVisible2Seconds && !m.preStartleHornTriggered) {
          m.preStartleHornTriggered = true;
          m.preStartleHornTimer = 0.0;
          if (playerDistToMonsterTrack <= 25.0 && typeof window.playTrainHorn === 'function') {
            window.playTrainHorn();
          }
        }

        // Step 2: Count 0.50s after the train horn, then trigger STARTLED!
        if (m.preStartleHornTriggered) {
          m.preStartleHornTimer = (m.preStartleHornTimer || 0.0) + dt;
          if (m.preStartleHornTimer >= 0.50) {
            m.preStartleHornTriggered = false;
            m.preStartleHornTimer = 0.0;
            m.state = 'STARTLED';
            m.stateTimer = 0.0;
            m.awayTimer = 0.0;
            m.tongueSoundPlayed = false;

            // Record initial away-facing point so monster smoothly spins 180° to face the train!
            if (info.trainPos) {
              m.startleAwayTarget = new THREE.Vector3(
                sitWorldPos.x + (sitWorldPos.x - info.trainPos.x),
                m.railY,
                sitWorldPos.z + (sitWorldPos.z - info.trainPos.z)
              );
            } else {
              m.startleAwayTarget = sitWorldPos.clone().add(m.tan);
            }

            mod.leftEye.scale.setScalar(1.52);
            mod.rightEye.scale.setScalar(1.52);
            mod.mouth.scale.set(1.22, 1.38, 1.12);
            if (mod.peekingTongue) mod.peekingTongue.visible = false;
            mod.leftArm.rotation.z = -1.35;
            mod.rightArm.rotation.z = 1.35;
            updateComicBubbleText(mod.bubble, 'HEEELP! 😱', '#fef08a', '#9333ea', '#581c87');
            mod.bubble.sprite.visible = true;
            playMonsterHelpSound(m.pitchMult, mod.root.position);
          }
        }
      } else if (m.state === 'STARTLED') {
        m.stateTimer += dt;
        var startleDur = 0.78;
        var pStartle = Math.min(1.0, m.stateTimer / startleDur);

        var sitPosNow = m.trackCenterPos.clone().add(m.perp.clone().multiplyScalar(m.currentLateral));

        // Jump ~5m high into the air (`vyskočí asi 5m do výšky`)!
        var jumpHeight5m = Math.sin(pStartle * Math.PI) * 5.0;
        mod.root.position.set(sitPosNow.x, m.railY + jumpHeight5m, sitPosNow.z);
        mod.bodyGroup.position.y = 0.0;
        mod.bodyGroup.rotation.z = Math.sin(m.stateTimer * 36.0) * 0.12;

        // Bulge eyes wide open (`vytřeští oči`), open mouth wide, wave hands up!
        mod.leftEye.scale.setScalar(1.52);
        mod.rightEye.scale.setScalar(1.52);
        mod.mouth.scale.set(1.22, 1.38, 1.12);
        if (mod.peekingTongue) mod.peekingTongue.visible = false;
        mod.leftArm.rotation.z = -1.35 + Math.sin(m.stateTimer * 28.0) * 0.25;
        mod.rightArm.rotation.z = 1.35 - Math.sin(m.stateTimer * 28.0) * 0.25;
        mod.leftLeg.rotation.x = 0.28;
        mod.rightLeg.rotation.x = -0.28;
        mod.leftLeg.position.z = 0.05;
        mod.rightLeg.position.z = 0.05;
        mod.bubble.sprite.visible = true;

        // Turn 180° around from back-turned to facing the train (`otočí se`) over the first 0.24s!
        if (info.trainPos) {
          var uTurn = Math.min(1.0, m.stateTimer / 0.24);
          var awayPt = m.startleAwayTarget || sitPosNow.clone().add(m.tan);
          var towardPt = new THREE.Vector3(info.trainPos.x, mod.root.position.y, info.trainPos.z);
          var sidePivot = sitPosNow.clone().sub(m.perp.clone().multiplyScalar(6.0));
          var lookPt;
          if (uTurn < 0.5) {
            lookPt = awayPt.clone().lerp(sidePivot, uTurn * 2.0);
          } else {
            lookPt = sidePivot.clone().lerp(towardPt, (uTurn - 0.5) * 2.0);
          }
          lookPt.y = mod.root.position.y;
          mod.root.lookAt(lookPt);
        }

        if (m.stateTimer >= startleDur) {
          m.state = 'RUNNING_OFF';
          m.stateTimer = 0.0;
        }
      } else if (m.state === 'RUNNING_OFF') {
        m.stateTimer += dt;
        var runDur = 0.76;
        var uRun = Math.min(1.0, m.stateTimer / runDur);
        var easeRun = 1.0 - Math.pow(1.0 - uRun, 2.2);

        m.currentLateral = m.activeSeatLateral + (m.hidingLateral - m.activeSeatLateral) * easeRun;
        var curPos = m.trackCenterPos.clone().add(m.perp.clone().multiplyScalar(m.currentLateral));
        var curY = m.railY + (m.hideGroundY - m.railY) * easeRun;
        mod.root.position.set(curPos.x, curY, curPos.z);

        // Look in the direction of escape (`-perp`) while sprinting behind the tree
        var escapeTarget = curPos.clone().sub(m.perp);
        mod.root.lookAt(escapeTarget.x, curY, escapeTarget.z);

        mod.bodyGroup.position.y = Math.abs(Math.sin(m.stateTimer * 28.0)) * 0.48;
        mod.bodyGroup.rotation.z = Math.sin(m.stateTimer * 28.0) * 0.22;
        mod.leftEye.scale.setScalar(1.36);
        mod.rightEye.scale.setScalar(1.36);
        mod.mouth.scale.set(1.15, 1.25, 1.05);
        if (mod.peekingTongue) mod.peekingTongue.visible = false;
        mod.leftArm.rotation.z = -1.30 + Math.sin(m.stateTimer * 30.0) * 0.35;
        mod.rightArm.rotation.z = 1.30 + Math.cos(m.stateTimer * 30.0) * 0.35;
        mod.leftLeg.rotation.x = Math.sin(m.stateTimer * 28.0) * 0.85;
        mod.rightLeg.rotation.x = -Math.sin(m.stateTimer * 28.0) * 0.85;
        mod.bubble.sprite.visible = true;

        if (uRun >= 1.0) {
          m.state = 'HIDING_PEEKING';
          m.stateTimer = 0.0;
          m.awayTimer = 0.0;
          m.tongueSoundPlayed = false;
          mod.bubble.sprite.visible = false;
        }
      } else if (m.state === 'HIDING_PEEKING') {
        m.stateTimer += dt;
        m.currentLateral = m.hidingLateral;

        // "schová se za strom a za 2s vykoukne a vyplázne jazyk":
        // Phase 1 (0.0s -> 2.0s): Stay hidden behind the tree trunk
        // Phase 2 (2.0s+): Peek out from behind the tree and stick out tongue!
        var isPeekingNow = (m.stateTimer >= 2.0);
        var uPeek = isPeekingNow ? Math.min(1.0, (m.stateTimer - 2.0) / 0.38) : 0.0;
        var peekShiftAlongTrack = uPeek * 1.85;

        var hidePos = m.trackCenterPos.clone()
          .add(m.perp.clone().multiplyScalar(m.hidingLateral))
          .add(m.tan.clone().multiplyScalar(peekShiftAlongTrack));
        mod.root.position.set(hidePos.x, m.hideGroundY, hidePos.z);

        if (info.trainPos) {
          mod.root.lookAt(info.trainPos.x, m.hideGroundY, info.trainPos.z);
        } else {
          mod.root.lookAt(m.trackCenterPos.x, m.hideGroundY, m.trackCenterPos.z);
        }

        mod.bodyGroup.position.y = Math.sin(timeSec * 3.0) * 0.05;
        mod.bodyGroup.rotation.z = -0.36 * uPeek;
        mod.leftEye.scale.setScalar(isPeekingNow ? 1.24 : 1.05);
        mod.rightEye.scale.setScalar(isPeekingNow ? 1.24 : 1.05);
        mod.mouth.scale.set(isPeekingNow ? 1.05 : 0.75, isPeekingNow ? 0.95 : 0.40, 0.90);
        mod.leftArm.rotation.z = 0.25;
        mod.rightArm.rotation.z = -0.25;
        mod.leftLeg.rotation.x = 0.0;
        mod.rightLeg.rotation.x = 0.0;

        if (isPeekingNow) {
          if (mod.peekingTongue) {
            mod.peekingTongue.visible = true;
            mod.peekingTongue.rotation.z = Math.sin(timeSec * 14.0) * 0.22;
            mod.peekingTongue.scale.set(1.0, 1.0, 0.95 + Math.sin(timeSec * 10.0) * 0.18);
          }
          updateComicBubbleText(mod.bubble, 'Bleh! 😛', '#fce7f3', '#ec4899', '#831843');
          mod.bubble.sprite.visible = (m.stateTimer < 4.8);
          if (!m.tongueSoundPlayed) {
            m.tongueSoundPlayed = true;
            playMonsterTongueSound(m.pitchMult, mod.root.position);
          }
        } else {
          if (mod.peekingTongue) mod.peekingTongue.visible = false;
          mod.bubble.sprite.visible = false;
        }

        // Stay safely hidden until the train has departed beyond `resetDist`
        if (info.dist > resetDist && m.stateTimer > 2.8) {
          m.awayTimer += dt;
          if (m.awayTimer >= 0.6) {
            m.state = 'RETURNING';
            m.stateTimer = 0.0;
            if (mod.peekingTongue) mod.peekingTongue.visible = false;
            mod.bubble.sprite.visible = false;
          }
        } else {
          m.awayTimer = 0.0;
        }
      } else if (m.state === 'RETURNING') {
        if (info.dist <= hornTriggerDist) {
          m.state = 'STARTLED';
          m.stateTimer = 0.0;
          updateComicBubbleText(mod.bubble, 'HEEELP! 😱', '#fef08a', '#9333ea', '#581c87');
          mod.bubble.sprite.visible = true;
          playMonsterHelpSound(m.pitchMult, mod.root.position);
          continue;
        }

        m.stateTimer += dt;
        var retDur = 1.4;
        var uRet = Math.min(1.0, m.stateTimer / retDur);
        var easeRet = uRet * uRet * (3.0 - 2.0 * uRet);

        m.currentLateral = m.hidingLateral + (0.0 - m.hidingLateral) * easeRet;
        var retPos = m.trackCenterPos.clone().add(m.perp.clone().multiplyScalar(m.currentLateral));
        var retY = m.hideGroundY + (m.railY - m.hideGroundY) * easeRet;
        mod.root.position.set(retPos.x, retY, retPos.z);
        mod.root.lookAt(m.trackCenterPos.x, retY, m.trackCenterPos.z);

        if (mod.peekingTongue) mod.peekingTongue.visible = false;
        mod.bodyGroup.position.y = Math.abs(Math.sin(m.stateTimer * 14.0)) * 0.24;
        mod.bodyGroup.rotation.z = Math.sin(m.stateTimer * 14.0) * 0.10;
        mod.leftLeg.rotation.x = Math.sin(m.stateTimer * 14.0) * 0.55;
        mod.rightLeg.rotation.x = -Math.sin(m.stateTimer * 14.0) * 0.55;

        if (uRet >= 1.0) {
          m.state = 'SITTING';
          m.stateTimer = 0.0;
          m.activeSeatLateral = 0.0;
          m.preStartleHornTriggered = false;
          m.preStartleHornTimer = 0.0;
          m.preHornVisibleTimer = 0.0;
        }
      }

      // CAMERA CHOREOGRAPHY FOR THIS MONSTER:
      // Hold train crawl while waiting for the >= 2.20s pre-horn camera view AND during the 0.5s pre-startle horn & jump off the rails so the train never collides!
      var isPreStartleApproach = (m.state === 'SITTING' && ((playerDistToMonsterTrack <= preZoomDist && playerApproachingMonster) || playerDistToMonsterTrack <= 26.0 || m.preStartleHornTriggered));
      var isStartleOrPeekSequence = (
        playerDistToMonsterTrack <= 52.0 &&
        (m.state === 'STARTLED' || m.state === 'RUNNING_OFF' || (m.state === 'HIDING_PEEKING' && m.stateTimer < 3.8))
      );

      if (playerActiveOnSurface && pPos && pTan && (isPreStartleApproach || isStartleOrPeekSequence)) {
        requestSlowdown = true;
        var waitingFor2SecPreHorn = (m.state === 'SITTING' && !m.preStartleHornTriggered && (m.preHornVisibleTimer || 0.0) < minPreHornCamSeconds && playerDistToMonsterTrack <= 25.5);
        if ((waitingFor2SecPreHorn || m.preStartleHornTriggered || m.state === 'STARTLED' || m.state === 'RUNNING_OFF') && playerDistToMonsterTrack <= 25.5) {
          requestMonsterHoldCrawl = true;
          if (playerDistToMonsterTrack <= 19.5) {
            window._storybookMonsterStopWait = true;
          }
        }

        var dirToMonster = m.trackCenterPos.clone().sub(pPos);
        dirToMonster.y = 0;
        if (dirToMonster.lengthSq() > 0.001) dirToMonster.normalize();
        else dirToMonster.copy(pTan);

        var forwardViewDir = pTan.clone().lerp(dirToMonster, 0.65).normalize();
        var trainFrontNose = pPos.clone().add(pTan.clone().multiplyScalar(3.4));

        charCamPos = pPos.clone()
          .sub(forwardViewDir.clone().multiplyScalar(15.8))
          .sub(m.perp.clone().multiplyScalar(5.0))
          .add(new THREE.Vector3(0, 8.8, 0));

        var monsterVisualTarget = mod.root.position.clone().add(new THREE.Vector3(0, 2.2, 0));
        var noseVisualTarget = trainFrontNose.clone().add(new THREE.Vector3(0, 1.8, 0));
        charCamLook = noseVisualTarget.lerp(monsterVisualTarget, 0.54);
        charCamActive = true;
        window._storybookCharId = 'monster_' + mi;
      }
    }

    // ========================================================================
    // 2. UPDATE WHITE RABBIT BY THE TRACK ("Králík u cesty")
    //    - NEVER displays any "Hello, train!" text bubble (`rObj.bubble.sprite.visible = false`)
    //    - Calls out "Hello, train!" with a cute generated bunny voice when < 20m!
    //    - Waves its front paws to the train continuously whenever in the camera view!
    // ========================================================================
    var rObj = rabbitState.obj;
    var pDistRabbitTrack = (playerActiveOnSurface && pPos) ? pPos.distanceTo(rabbitState.trackAnchorPos) : 999999;
    var pDistRabbitWorld = (playerActiveOnSurface && pPos) ? pPos.distanceTo(rabbitState.worldPos) : 999999;
    var isRabbitInCameraView = (pDistRabbitTrack <= 26.0 || pDistRabbitWorld <= 38.0 || rabbitState.state === 'HOPPING_AND_WAVING');

    // Never show the "Hello, train!" floating text subtitle on the rabbit!
    if (rObj.bubble && rObj.bubble.sprite) {
      rObj.bubble.sprite.visible = false;
    }

    if (pPos && isRabbitInCameraView) {
      rObj.root.lookAt(pPos.x, rabbitState.worldPos.y, pPos.z);
    }

    if (rabbitState.state === 'IDLE') {
      rabbitState.timer += dt;
      rObj.bodyGroup.position.y = Math.sin(timeSec * 2.5) * 0.04;
      rObj.bodyGroup.rotation.x = 0.0;
      rObj.leftEar.rotation.x = Math.sin(timeSec * 2.2) * 0.06;
      rObj.rightEar.rotation.x = Math.cos(timeSec * 2.4) * 0.06;

      // Trigger automatically whenever the train comes within < 20m (`19.6m`)!
      if (pDistRabbitWorld <= 19.6) {
        rabbitState.state = 'HOPPING_AND_WAVING';
        rabbitState.timer = 0.0;
        if (!rabbitState.honkedThisPass && typeof window.playTrainHorn === 'function') {
          rabbitState.honkedThisPass = true;
          window.playTrainHorn();
        }
        playRabbitHopAndWaveSound(rabbitState.worldPos);
      }
    } else if (rabbitState.state === 'HOPPING_AND_WAVING') {
      rabbitState.timer += dt;
      var rt = rabbitState.timer;

      // Phase 1 (0.0s -> 1.56s): 3 energetic vertical hops (`třikrát výrazně poskočí`) while waving!
      if (rt < 1.56) {
        var hopPhase = (rt / 1.56) * Math.PI * 3.0;
        var hopSin = Math.abs(Math.sin(hopPhase));
        rObj.bodyGroup.position.y = hopSin * 2.55;
        rObj.bodyGroup.rotation.x = Math.cos(hopPhase) * 0.16;
        rObj.leftEar.rotation.x = -hopSin * 0.35;
        rObj.rightEar.rotation.x = -hopSin * 0.35;
        rObj.leftFoot.rotation.x = hopSin * 0.55;
        rObj.rightFoot.rotation.x = hopSin * 0.55;
      }
      // Phase 2 (1.56s -> 3.00s): Continue waving on the meadow pad
      else if (rt < 3.00) {
        rObj.bodyGroup.position.y = 0.0;
        rObj.bodyGroup.rotation.x = 0.0;
        rObj.leftEar.rotation.x = 0.05;
        rObj.rightEar.rotation.x = 0.05;
        rObj.leftFoot.rotation.x = 0.0;
        rObj.rightFoot.rotation.x = 0.0;
      } else {
        rabbitState.state = 'COOLDOWN';
        rabbitState.timer = 0.0;
      }
    } else if (rabbitState.state === 'COOLDOWN') {
      rObj.bodyGroup.position.y = Math.sin(timeSec * 2.5) * 0.04;
      if (pDistRabbitWorld > 23.0) {
        rabbitState.state = 'IDLE';
        rabbitState.timer = 0.0;
        rabbitState.honkedThisPass = false;
      }
    }

    // Wave front paws continuously whenever the rabbit is in the camera view!
    if (isRabbitInCameraView) {
      rObj.rightArm.rotation.x = -0.92;
      rObj.rightArm.rotation.z = -2.20 + Math.sin(timeSec * 16.0) * 0.48;
      rObj.leftArm.rotation.x = -0.45;
      rObj.leftArm.rotation.z = 0.85 + Math.cos(timeSec * 16.0) * 0.28;
    } else {
      rObj.rightArm.rotation.x = 0.0;
      rObj.rightArm.rotation.z = 0.0;
      rObj.leftArm.rotation.x = 0.0;
      rObj.leftArm.rotation.z = 0.0;
    }

    if (!charCamActive && playerActiveOnSurface && pPos && pTan && (pDistRabbitTrack <= 20.0 || rabbitState.state === 'HOPPING_AND_WAVING')) {
      requestSlowdown = true;
      charCamPos = pPos.clone()
        .sub(pTan.clone().multiplyScalar(15.2))
        .add(rabbitState.perp.clone().multiplyScalar(5.0))
        .add(new THREE.Vector3(0, 7.8, 0));
      var rTarget = rabbitState.worldPos.clone().add(new THREE.Vector3(0, 2.0, 0));
      var pTargetR = pPos.clone().add(pTan.clone().multiplyScalar(4.5)).add(new THREE.Vector3(0, 2.0, 0));
      charCamLook = pTargetR.lerp(rTarget, 0.52);
      charCamActive = true;
      window._storybookCharId = 'rabbit';
    }

    // ========================================================================
    // 3. UPDATE ORANGE SQUIRREL BY THE TREE ("Veverka u stromu")
    //    - Smooth camera zoom framing both the train and the squirrel + tree
    //    - Automatically spins twice (`2x 360°`), leaps onto the branch, and plays sound when < 20m!
    //    - Waves both front paws to the train continuously whenever in the camera view!
    // ========================================================================
    var sqObj = squirrelState.obj;
    var pDistSqTrack = (playerActiveOnSurface && pPos) ? pPos.distanceTo(squirrelState.trackAnchorPos) : 999999;
    var pDistSqWorld = (playerActiveOnSurface && pPos) ? pPos.distanceTo(squirrelState.worldPos) : 999999;
    var isSquirrelInCameraView = (
      pDistSqTrack <= 26.0 ||
      pDistSqWorld <= 38.0 ||
      squirrelState.state === 'SPIN_AND_LEAP' ||
      squirrelState.state === 'PERCHED_ON_BRANCH'
    );

    if (squirrelState.state === 'GROUND_IDLE') {
      squirrelState.timer += dt;
      sqObj.squirrelGroup.position.copy(sqObj.startGroundPos);
      sqObj.sqBody.rotation.set(0, 0, 0);
      sqObj.tailGroup.rotation.x = Math.sin(timeSec * 3.2) * 0.12;
      sqObj.bubble.sprite.visible = false;

      // Trigger automatically whenever the train comes within < 20m (`19.6m`)!
      if (pDistSqWorld <= 19.6) {
        squirrelState.state = 'SPIN_AND_LEAP';
        squirrelState.timer = 0.0;
        sqObj.bubble.sprite.visible = true;
        if (!squirrelState.honkedThisPass && typeof window.playTrainHorn === 'function') {
          squirrelState.honkedThisPass = true;
          window.playTrainHorn();
        }
        playSquirrelSpinAndJumpSound(squirrelState.worldPos);
      }
    } else if (squirrelState.state === 'SPIN_AND_LEAP') {
      squirrelState.timer += dt;
      var st = squirrelState.timer;

      // Phase 1 (0.0s -> 0.82s): Spin twice rapidly around vertical axis (`dvakrát rychle otočí kolem své osy`)
      if (st < 0.82) {
        var uSpin = st / 0.82;
        var easeSpin = uSpin * (2.0 - uSpin);
        sqObj.squirrelGroup.position.copy(sqObj.startGroundPos);
        sqObj.squirrelGroup.position.y += Math.sin(uSpin * Math.PI) * 0.55;
        sqObj.sqBody.rotation.y = easeSpin * Math.PI * 4.0;
        sqObj.sqBody.rotation.x = 0.0;
        sqObj.tailGroup.rotation.x = 0.25;
      }
      // Phase 2 (0.82s -> 1.62s): Parabolic leap from ground log onto the tree branch (`vyskočí na strom / větev`)
      else if (st < 1.62) {
        var uJump = Math.min(1.0, (st - 0.82) / 0.80);
        var easeJump = uJump * uJump * (3.0 - 2.0 * uJump);
        sqObj.squirrelGroup.position.lerpVectors(sqObj.startGroundPos, sqObj.branchLandingPos, easeJump);
        sqObj.squirrelGroup.position.y += Math.sin(uJump * Math.PI) * 2.35;
        sqObj.sqBody.rotation.y = 0.0;
        sqObj.sqBody.rotation.x = Math.cos(uJump * Math.PI) * -0.42;
        sqObj.tailGroup.rotation.x = -0.35;
      } else {
        sqObj.squirrelGroup.position.copy(sqObj.branchLandingPos);
        sqObj.sqBody.rotation.set(0, 0, 0);
        squirrelState.state = 'PERCHED_ON_BRANCH';
        squirrelState.timer = 0.0;
      }
    } else if (squirrelState.state === 'PERCHED_ON_BRANCH') {
      squirrelState.timer += dt;
      sqObj.squirrelGroup.position.copy(sqObj.branchLandingPos);
      sqObj.squirrelGroup.position.y += Math.sin(timeSec * 4.5) * 0.06;
      sqObj.sqBody.rotation.y = Math.sin(timeSec * 2.5) * 0.18;
      sqObj.tailGroup.rotation.x = Math.sin(timeSec * 5.0) * 0.22;
      sqObj.bubble.sprite.visible = (squirrelState.timer < 2.2);

      // Once the train has driven or reversed away (`pDistSqWorld > 23.0m`), hop cleanly back down to the ground log
      if (pDistSqWorld > 23.0 && squirrelState.timer > 1.2) {
        squirrelState.state = 'HOPPING_DOWN';
        squirrelState.timer = 0.0;
        sqObj.bubble.sprite.visible = false;
      }
    } else if (squirrelState.state === 'HOPPING_DOWN') {
      squirrelState.timer += dt;
      var uDown = Math.min(1.0, squirrelState.timer / 0.72);
      sqObj.squirrelGroup.position.lerpVectors(sqObj.branchLandingPos, sqObj.startGroundPos, uDown);
      sqObj.squirrelGroup.position.y += Math.sin(uDown * Math.PI) * 1.45;
      if (uDown >= 1.0) {
        sqObj.squirrelGroup.position.copy(sqObj.startGroundPos);
        squirrelState.state = 'GROUND_IDLE';
        squirrelState.timer = 0.0;
        squirrelState.honkedThisPass = false;
      }
    }

    // Wave squirrel's front paws continuously whenever in the camera view!
    if (isSquirrelInCameraView && sqObj.rightArm && sqObj.leftArm) {
      sqObj.rightArm.rotation.x = -0.90;
      sqObj.rightArm.rotation.z = -2.15 + Math.sin(timeSec * 18.0) * 0.50;
      sqObj.leftArm.rotation.x = -0.75;
      sqObj.leftArm.rotation.z = 1.85 + Math.cos(timeSec * 18.0) * 0.42;
    } else if (sqObj.rightArm && sqObj.leftArm) {
      sqObj.rightArm.rotation.x = 0.0;
      sqObj.rightArm.rotation.z = 0.0;
      sqObj.leftArm.rotation.x = 0.0;
      sqObj.leftArm.rotation.z = 0.0;
    }

    if (!charCamActive && playerActiveOnSurface && pPos && pTan && (pDistSqTrack <= 20.0 || squirrelState.state === 'SPIN_AND_LEAP' || (squirrelState.state === 'PERCHED_ON_BRANCH' && squirrelState.timer < 1.4))) {
      requestSlowdown = true;
      charCamPos = pPos.clone()
        .sub(pTan.clone().multiplyScalar(15.6))
        .add(squirrelState.perp.clone().multiplyScalar(5.0))
        .add(new THREE.Vector3(0, 8.3, 0));
      var sqTarget = squirrelState.worldPos.clone().add(new THREE.Vector3(0, 3.2, 0));
      var pTargetSq = pPos.clone().add(pTan.clone().multiplyScalar(4.5)).add(new THREE.Vector3(0, 2.1, 0));
      charCamLook = pTargetSq.lerp(sqTarget, 0.52);
      charCamActive = true;
      window._storybookCharId = 'squirrel';
    }

    // ========================================================================
    // 4. UPDATE FRIENDLY OWL ON TREE BRANCH ("Sova u stromu")
    //    - Automatically turns head toward train, waves wings in greeting whenever in camera view, and hoots when < 20m!
    // ========================================================================
    var oObj = owlState.obj;
    var pDistOwlTrack = (playerActiveOnSurface && pPos) ? pPos.distanceTo(owlState.trackAnchorPos) : 999999;
    var pDistOwlWorld = (playerActiveOnSurface && pPos) ? pPos.distanceTo(owlState.worldPos) : 999999;
    var isOwlInCameraView = (pDistOwlTrack <= 26.0 || pDistOwlWorld <= 38.0 || owlState.state === 'GREETING');

    var targetHeadYaw = Math.sin(timeSec * 1.2) * 0.15;
    var targetHeadPitch = 0.0;
    if (pPos && pDistOwlWorld < 48.0) {
      var localTrain = oObj.owlGroup.worldToLocal(pPos.clone());
      targetHeadYaw = Math.max(-1.25, Math.min(1.25, Math.atan2(localTrain.x, Math.max(0.5, localTrain.z))));
      targetHeadPitch = 0.16;
    }
    oObj.headGroup.rotation.y += (targetHeadYaw - oObj.headGroup.rotation.y) * Math.min(1.0, dt * 6.5);
    oObj.headGroup.rotation.x += (targetHeadPitch - oObj.headGroup.rotation.x) * Math.min(1.0, dt * 6.5);

    if (owlState.state === 'PERCHED_IDLE') {
      owlState.timer += dt;
      oObj.owlGroup.position.y = 4.68 + Math.sin(timeSec * 2.0) * 0.03;
      oObj.bubble.sprite.visible = false;

      // Trigger automatically whenever the train comes within < 20m (`19.6m`)!
      if (pDistOwlWorld <= 19.6) {
        owlState.state = 'GREETING';
        owlState.timer = 0.0;
        oObj.bubble.sprite.visible = true;
        if (!owlState.honkedThisPass && typeof window.playTrainHorn === 'function') {
          owlState.honkedThisPass = true;
          window.playTrainHorn();
        }
        playOwlHootSound(owlState.worldPos);
      }
    } else if (owlState.state === 'GREETING') {
      owlState.timer += dt;
      var ot = owlState.timer;

      // Flap & wave both wings energetically in greeting (`několikrát zamává křídly na pozdrav`)
      if (ot < 3.00) {
        var flapWave = Math.abs(Math.sin((ot / 3.00) * Math.PI * 5.0));
        oObj.owlGroup.position.y = 4.68 + flapWave * 0.26;
      } else {
        oObj.owlGroup.position.y = 4.68;
        oObj.bubble.sprite.visible = false;
        owlState.state = 'COOLDOWN';
        owlState.timer = 0.0;
      }
    } else if (owlState.state === 'COOLDOWN') {
      if (pDistOwlWorld > 23.0) {
        owlState.state = 'PERCHED_IDLE';
        owlState.timer = 0.0;
        owlState.honkedThisPass = false;
      }
    }

    // Wave owl wings continuously whenever the owl is in the camera view!
    if (isOwlInCameraView) {
      var wingWave = 0.95 + Math.sin(timeSec * 14.0) * 0.45;
      oObj.leftWing.rotation.z = wingWave;
      oObj.rightWing.rotation.z = -wingWave;
    } else {
      oObj.leftWing.rotation.z = 0.0;
      oObj.rightWing.rotation.z = 0.0;
    }

    if (!charCamActive && playerActiveOnSurface && pPos && pTan && (pDistOwlTrack <= 20.0 || owlState.state === 'GREETING')) {
      requestSlowdown = true;
      charCamPos = pPos.clone()
        .sub(pTan.clone().multiplyScalar(19.5))
        .add(owlState.perp.clone().multiplyScalar(14.5))
        .add(new THREE.Vector3(0, 11.0, 0));
      var owlTarget = owlState.worldPos.clone().add(new THREE.Vector3(0, 5.8, 0));
      var pTargetOwl = pPos.clone().add(pTan.clone().multiplyScalar(2.5)).add(new THREE.Vector3(0, 2.5, 0));
      charCamLook = pTargetOwl.lerp(owlTarget, 0.58);
      charCamActive = true;
      window._storybookCharId = 'owl';
    }

    // 5. DAISY THE COW & FLUFFY SHEEP FLOCK CAMERA TARGETS (for unified 3s camera showcase)
    if (!charCamActive && playerActiveOnSurface && pPos && pTan) {
      if (window.daisyTheCow && window.daisyTheCow.position) {
        var distCowCam = pPos.distanceTo(window.daisyTheCow.position);
        if (distCowCam <= 19.5) {
          requestSlowdown = true;
          var cowPos = window.daisyTheCow.position;
          var toCowPerp = new THREE.Vector3(-pTan.z, 0, pTan.x).normalize();
          charCamPos = pPos.clone()
            .sub(pTan.clone().multiplyScalar(18.5))
            .add(toCowPerp.clone().multiplyScalar(13.5))
            .add(new THREE.Vector3(0, 10.5, 0));
          var cowTarget = cowPos.clone().add(new THREE.Vector3(0, 2.2, 0));
          var pTargetCow = pPos.clone().add(pTan.clone().multiplyScalar(2.5)).add(new THREE.Vector3(0, 2.0, 0));
          charCamLook = pTargetCow.lerp(cowTarget, 0.56);
          charCamActive = true;
          window._storybookCharId = 'cow';
        }
      }
      if (!charCamActive && window.trackSheepFlocks) {
        for (var sfi2 = 0; sfi2 < window.trackSheepFlocks.length; sfi2++) {
          var fl2 = window.trackSheepFlocks[sfi2];
          if (fl2 && fl2.basePos && pPos.distanceTo(fl2.basePos) <= 22.0) {
            requestSlowdown = true;
            var shWorld = fl2.group ? fl2.group.position : fl2.basePos;
            charCamPos = pPos.clone()
              .sub(pTan.clone().multiplyScalar(18.5))
              .sub(fl2.perp.clone().multiplyScalar(13.5))
              .add(new THREE.Vector3(0, 10.5, 0));
            var shTarget = shWorld.clone().add(new THREE.Vector3(0, 1.8, 0));
            var pTargetSh = pPos.clone().add(pTan.clone().multiplyScalar(2.5)).add(new THREE.Vector3(0, 2.0, 0));
            charCamLook = pTargetSh.lerp(shTarget, 0.56);
            charCamActive = true;
            window._storybookCharId = 'sheep_' + sfi2;
            break;
          }
        }
      }
    }

    if (!charCamActive) {
      window._storybookCharId = null;
    }

    // Export camera & slowdown state for `installModelsFrameEnhancer()`
    window._storybookCharCamActive = charCamActive;
    if (charCamActive && charCamPos && charCamLook) {
      window._storybookCharCamPos = charCamPos;
      window._storybookCharCamLook = charCamLook;
    }
    window._storybookSlowdownRequested = requestSlowdown;
    window._storybookMonsterHoldCrawl = requestMonsterHoldCrawl;
  }

  // Hook into `renderer.render` so all 4 characters update smoothly every frame
  if (typeof renderer !== 'undefined' && renderer && renderer.render) {
    var prevRender = renderer.render.bind(renderer);
    renderer.render = function(sceneArg, cameraArg) {
      try {
        updateAllInteractiveStorybookCharacters();
      } catch (e) {}
      return prevRender(sceneArg, cameraArg);
    };
  }
})();

// ============================================================================
// BANGKOK CHAO PHRAYA RIVER ADVENTURE EXPANSION (SINGLE-FILE MODULE IN models.js)
// - New Right-Hand Railway Branch from J_NW (between Eiffel Tower & Mom's House)
//   passing behind Mom's House -> Anantara Riverside Hotel -> 1km River Track ->
//   IconSiam Megacomplex -> Grand Tied-Arch Railway Bridge -> Opposite Bank ->
//   Return Loop back to J_NW behind Mom's House
// - Anantara Riverside Hotel (Riverfront Main Facade + Railway Garden Facade + Wooden Pier)
// - Anantara Shuttle Boat (Animated pier-to-pier + synchronized bridge departure)
// - IconSiam Shopping Complex, Ferris Wheel, Bangkok Skyline, Night Illumination &
//   The ICONIC Multimedia Dancing Fountains with Web Audio Music
// ============================================================================
(function installBangkokChaoPhrayaExpansion() {
  if (typeof THREE === 'undefined' || typeof scene === 'undefined' || !window.nodes || !window.edges) return;
  if (window._bangkokChaoPhrayaInstalled) return;
  window._bangkokChaoPhrayaInstalled = true;

  var bkkRootGroup = new THREE.Group();
  bkkRootGroup.name = 'BangkokChaoPhrayaExpansion';
  scene.add(bkkRootGroup);

  var bkkNightLights = []; // { mat, dayHex, nightHex } or { light, dayInt, nightInt }
  var bkkWavingPeople = []; // { armPivot, phase, baseZ }
  window.bangkokObstacles = [];

  // --------------------------------------------------------------------------
  // 1. CHAO PHRAYA RIVER VALLEY TERRAIN CARVING & WATERWAY (WEST OF MOM'S HOUSE)
  // --------------------------------------------------------------------------
  function getChaoPhrayaCenterX(z) {
    return -472.0 + Math.sin(z * 0.0085) * 14.0;
  }

  var origGetTerrainHeight = window.getTerrainHeight;
  window.getTerrainHeight = function(x, z) {
    var baseH = origGetTerrainHeight ? origGetTerrainHeight(x, z) : 0.0;
    // Keep everything east of x = -325 (including Mom's House at -238, -144) 100% untouched!
    if (x > -318 || z < -280 || z > 375) return baseH;

    var blendX = Math.min(1.0, Math.max(0.0, (-318.0 - x) / 34.0));
    blendX = blendX * blendX * (3.0 - 2.0 * blendX);

    var blendZ = 1.0;
    if (z < -230) {
      blendZ = Math.max(0.0, (z + 280.0) / 50.0);
    } else if (z > 320) {
      blendZ = Math.max(0.0, (375.0 - z) / 55.0);
    }
    var blend = blendX * blendZ;
    if (blend <= 0.0001) return baseH;

    var riverCenterX = getChaoPhrayaCenterX(z);
    var distFromRiver = Math.abs(x - riverCenterX);
    var riverHalfWidth = 57.0;

    var targetBkkH = 2.2;
    if (distFromRiver < riverHalfWidth - 5.0) {
      targetBkkH = -4.2; // Deep riverbed under the Chao Phraya water surface (y = -1.35)
    } else if (distFromRiver < riverHalfWidth + 6.0) {
      var bankT = (distFromRiver - (riverHalfWidth - 5.0)) / 11.0;
      bankT = bankT * bankT * (3.0 - 2.0 * bankT);
      targetBkkH = -4.2 + bankT * 6.4; // Smooth embankment rise to y = +2.2m
    } else {
      // Gentle tropical coastal plain on both banks
      targetBkkH = 2.2 + Math.sin(x * 0.02 + z * 0.015) * 0.35;
    }

    return baseH * (1.0 - blend) + targetBkkH * blend;
  };

  // Update the existing `grass` terrain mesh vertices in-place for the carved river valley
  if (typeof grass !== 'undefined' && grass && grass.geometry && grass.geometry.attributes && grass.geometry.attributes.position) {
    var gPos = grass.geometry.attributes.position;
    for (var gi = 0; gi < gPos.count; gi++) {
      var gx = gPos.getX(gi);
      var gz = gPos.getZ(gi);
      if (gx < -315 && gz >= -285 && gz <= 380) {
        gPos.setY(gi, window.getTerrainHeight(gx, gz));
      }
    }
    gPos.needsUpdate = true;
    grass.geometry.computeVertexNormals();
  }

  // Build the wide tropical Chao Phraya River water surface & embankments
  var riverWaterY = -1.35;
  var riverWaveStrips = [];
  (function buildChaoPhrayaRiverAndPromenades() {
    var riverGroup = new THREE.Group();
    bkkRootGroup.add(riverGroup);

    var zStart = -255;
    var zEnd = 345;
    var zSteps = 60;
    var dz = (zEnd - zStart) / zSteps;
    var halfW = 57.5;

    var waterMat = new THREE.MeshStandardMaterial({
      color: 0x0e7490,
      roughness: 0.16,
      metalness: 0.28,
      emissive: 0x083344,
      emissiveIntensity: 0.22
    });
    var seawallMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.75 });
    var promenadeMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.65 });
    var goldBollardMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.6 });

    for (var s = 0; s < zSteps; s++) {
      var z0 = zStart + s * dz;
      var z1 = z0 + dz;
      var zMid = 0.5 * (z0 + z1);
      var cx = getChaoPhrayaCenterX(zMid);
      var nextCx = getChaoPhrayaCenterX(z1);
      var yaw = Math.atan2(nextCx - getChaoPhrayaCenterX(z0), dz);
      var segLen = Math.hypot(nextCx - getChaoPhrayaCenterX(z0), dz) + 0.8;

      var wSeg = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2.0, 0.5, segLen), waterMat);
      wSeg.position.set(cx, riverWaterY - 0.25, zMid);
      wSeg.rotation.y = yaw;
      wSeg.receiveShadow = true;
      riverGroup.add(wSeg);

      // East & West stone seawalls + waterfront promenades
      var eastBankX = cx + halfW;
      var westBankX = cx - halfW;

      var eastWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, segLen), seawallMat);
      eastWall.position.set(eastBankX + 1.0, 0.1, zMid);
      eastWall.rotation.y = yaw;
      riverGroup.add(eastWall);

      var eastWalk = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.36, segLen), promenadeMat);
      eastWalk.position.set(eastBankX + 5.2, 2.25, zMid);
      eastWalk.rotation.y = yaw;
      eastWalk.receiveShadow = true;
      riverGroup.add(eastWalk);

      var westWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, segLen), seawallMat);
      westWall.position.set(westBankX - 1.0, 0.1, zMid);
      westWall.rotation.y = yaw;
      riverGroup.add(westWall);

      var westWalk = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.36, segLen), promenadeMat);
      westWalk.position.set(westBankX - 4.2, 2.25, zMid);
      westWalk.rotation.y = yaw;
      westWalk.receiveShadow = true;
      riverGroup.add(westWalk);

      // Animated shimmering water ripple strips
      if (s % 2 === 0) {
        var rippleMat = new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.35
        });
        var ripple = new THREE.Mesh(new THREE.PlaneGeometry(18 + (s % 3) * 8, 1.6), rippleMat);
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.set(cx + ((s % 5) - 2) * 14, riverWaterY + 0.05, zMid);
        riverGroup.add(ripple);
        riverWaveStrips.push({ mesh: ripple, baseX: ripple.position.x, baseZ: zMid, phase: s * 0.7 });
      }

      // Golden Thai riverfront bollards & tropical palms along the promenade
      if (s % 3 === 0 && zMid > -200 && zMid < 290) {
        var bolE = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 1.1, 8), goldBollardMat);
        bolE.position.set(eastBankX + 1.3, 2.8, zMid);
        riverGroup.add(bolE);

        var bolW = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 1.1, 8), goldBollardMat);
        bolW.position.set(westBankX - 1.3, 2.8, zMid);
        riverGroup.add(bolW);
      }
    }
  })();

  // Helper to build lush tropical coconut palms
  function createBangkokPalmTree(x, y, z, scale) {
    var s = scale || 1.0;
    var pg = new THREE.Group();
    pg.position.set(x, y, z);
    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x78553a, roughness: 0.85 });
    var frondMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55, side: THREE.DoubleSide });
    var cocoMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

    var segs = 6;
    var curX = 0, curY = 0;
    for (var i = 0; i < segs; i++) {
      var h = 1.45 * s;
      var rBot = (0.42 - i * 0.04) * s;
      var rTop = (0.38 - i * 0.04) * s;
      var tMesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8), trunkMat);
      tMesh.position.set(curX, curY + h * 0.5, 0);
      tMesh.rotation.z = -i * 0.035;
      tMesh.castShadow = true;
      pg.add(tMesh);
      curY += h * 0.94;
      curX += Math.sin(i * 0.035) * h * 0.45;
    }

    var crown = new THREE.Group();
    crown.position.set(curX, curY, 0);
    pg.add(crown);

    for (var c = 0; c < 3; c++) {
      var ca = (c / 3) * Math.PI * 2;
      var coco = new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 8, 8), cocoMat);
      coco.position.set(Math.cos(ca) * 0.32 * s, -0.2 * s, Math.sin(ca) * 0.32 * s);
      crown.add(coco);
    }

    var frondCount = 8;
    for (var f = 0; f < frondCount; f++) {
      var ang = (f / frondCount) * Math.PI * 2;
      var fHolder = new THREE.Group();
      fHolder.rotation.y = ang;
      var leaf = new THREE.Mesh(new THREE.BoxGeometry(0.75 * s, 0.08 * s, 3.6 * s), frondMat);
      leaf.position.set(0, 0.15 * s, 1.75 * s);
      leaf.rotation.x = 0.38;
      leaf.castShadow = true;
      fHolder.add(leaf);
      crown.add(fHolder);
    }
    bkkRootGroup.add(pg);
    return pg;
  }

  // Helper to create cheerful waving people for piers, promenade & boat
  function createBangkokPerson(shirtHex, pantsHex, hatHex, scale) {
    var s = scale || 1.0;
    var p = new THREE.Group();
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
    var shirtMat = new THREE.MeshStandardMaterial({ color: shirtHex || 0x38bdf8, roughness: 0.5 });
    var pantsMat = new THREE.MeshStandardMaterial({ color: pantsHex || 0x1e3a8a, roughness: 0.6 });

    var legs = new THREE.Mesh(new THREE.BoxGeometry(0.46 * s, 0.65 * s, 0.28 * s), pantsMat);
    legs.position.y = 0.32 * s;
    p.add(legs);

    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.56 * s, 0.72 * s, 0.34 * s), shirtMat);
    torso.position.y = 0.98 * s;
    p.add(torso);

    var head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 12, 12), skinMat);
    head.position.y = 1.56 * s;
    p.add(head);

    if (hatHex) {
      var hat = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.38 * s, 0.18 * s, 12), new THREE.MeshStandardMaterial({ color: hatHex, roughness: 0.5 }));
      hat.position.y = 1.78 * s;
      p.add(hat);
    }

    var leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16 * s, 0.56 * s, 0.16 * s), shirtMat);
    leftArm.position.set(-0.38 * s, 0.96 * s, 0);
    p.add(leftArm);

    var rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.36 * s, 1.24 * s, 0);
    var rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16 * s, 0.58 * s, 0.16 * s), shirtMat);
    rightArm.position.set(0.06 * s, 0.26 * s, 0);
    rightArmPivot.add(rightArm);
    rightArmPivot.rotation.z = -0.45;
    p.add(rightArmPivot);

    bkkWavingPeople.push({
      armPivot: rightArmPivot,
      phase: Math.random() * Math.PI * 2,
      baseZ: -0.45
    });
    return p;
  }

  // --------------------------------------------------------------------------
  // 2. NEW RAILWAY BRANCH & LOOP (NODES, EDGES, TURNOUTS, SIGNPOSTS)
  // --------------------------------------------------------------------------
  (function buildBangkokRailwayLoopAndTurnouts() {
    // 3 New Junction Nodes forming the Chao Phraya Riverside Loop (matching tracks.js `{ id, pos, name }` schema!)
    window.nodes['J_BKK_ANANTARA'] = {
      id: 'J_BKK_ANANTARA',
      pos: new THREE.Vector3(-348.0, 2.8, -125.0),
      name: "🏨 Anantara Riverside Hotel"
    };
    window.nodes['J_BKK_ICONSIAM'] = {
      id: 'J_BKK_ICONSIAM',
      pos: new THREE.Vector3(-368.0, 4.2, 215.0),
      name: "🛍️ IconSiam & Dancing Fountains"
    };
    window.nodes['J_BKK_WESTBANK'] = {
      id: 'J_BKK_WESTBANK',
      pos: new THREE.Vector3(-562.0, 3.6, 20.0),
      name: "🌉 Chao Phraya Railway Bridge"
    };

    var jNwPos = (window.nodes['J_NW'] && window.nodes['J_NW'].pos)
      ? window.nodes['J_NW'].pos.clone()
      : new THREE.Vector3(-125.0, 12.4, -185.0);
    var jAnantaraPos = window.nodes['J_BKK_ANANTARA'].pos.clone();
    var jIconsiamPos = window.nodes['J_BKK_ICONSIAM'].pos.clone();
    var jWestbankPos = window.nodes['J_BKK_WESTBANK'].pos.clone();

    var bkkBaseEdges = [
      // 1) Branch off from J_NW (-125, 12.4, -185) behind Mom's House (-238, 0.85, -144) to Anantara (-348, 2.8, -125)
      {
        from: 'J_NW',
        to: 'J_BKK_ANANTARA',
        pts: [
          jNwPos.clone(),
          new THREE.Vector3(-186.0, 9.2, -214.0),
          new THREE.Vector3(-258.0, 5.4, -212.0),
          new THREE.Vector3(-318.0, 3.2, -176.0),
          jAnantaraPos.clone()
        ],
        landmark: { type: 'anantara', name: '🏨 Anantara Riverside Hotel' },
        station: {
          type: 'landmark',
          icon: 'anantara',
          name: '🏨 Anantara Riverside Hotel',
          emoji: '🏨',
          voice: 'Welcome to the Chao Phraya River and the Anantara Riverside Hotel!'
        }
      },
      // 2) Scenic ~1km Riverside Railway along the East Bank past Anantara Resort & IconSiam
      {
        from: 'J_BKK_ANANTARA',
        to: 'J_BKK_ICONSIAM',
        pts: [
          jAnantaraPos.clone(),
          new THREE.Vector3(-358.0, 2.8, -42.0),
          new THREE.Vector3(-365.0, 2.8, 52.0),
          new THREE.Vector3(-366.0, 3.0, 142.0),
          jIconsiamPos.clone()
        ],
        landmark: { type: 'iconsiam', name: '🛍️ IconSiam & Dancing Fountains' },
        station: {
          type: 'landmark',
          icon: 'iconsiam',
          name: '🛍️ IconSiam & Dancing Fountains',
          emoji: '🛍️',
          voice: 'Look at the golden IconSiam mall, the Ferris wheel, and the dancing water fountains!'
        }
      },
      // 3) Grand Chao Phraya Tied-Arch Railway Bridge crossing the wide river south of IconSiam
      {
        from: 'J_BKK_ICONSIAM',
        to: 'J_BKK_WESTBANK',
        pts: [
          jIconsiamPos.clone(),
          new THREE.Vector3(-396.0, 9.2, 252.0),
          new THREE.Vector3(-474.0, 14.2, 260.0),
          new THREE.Vector3(-548.0, 9.0, 232.0),
          new THREE.Vector3(-568.0, 4.0, 130.0),
          jWestbankPos.clone()
        ],
        landmark: { type: 'bkk_bridge', name: '🌉 Chao Phraya Railway Bridge' },
        station: {
          type: 'bridge_suspension',
          icon: 'bkk_bridge',
          name: '🌉 Chao Phraya Railway Bridge',
          emoji: '🌉',
          voice: 'Riding high across the grand Chao Phraya River railway bridge! Look at the Anantara boat below!'
        }
      },
      // 4) Opposite Bank Northbound Return & Northern River Crossing back behind Mom's House
      {
        from: 'J_BKK_WESTBANK',
        to: 'J_BKK_ANANTARA',
        pts: [
          jWestbankPos.clone(),
          new THREE.Vector3(-564.0, 4.0, -95.0),
          new THREE.Vector3(-540.0, 8.6, -182.0),
          new THREE.Vector3(-472.0, 11.8, -198.0),
          new THREE.Vector3(-395.0, 7.2, -172.0),
          jAnantaraPos.clone()
        ],
        landmark: { type: 'anantara', name: '🏨 Anantara & Return to City' },
        station: {
          type: 'landmark',
          icon: 'anantara',
          name: '🏨 Anantara & Return to City',
          emoji: '🏨',
          voice: 'Crossing back to Anantara Riverside and heading toward Mommy and Daddy\'s house!'
        }
      }
    ];

    var trackOffset = 2.2;
    var newDirectedEdges = [];

    function createOffsetTrackCurve(pts, sideSign) {
      var baseCurve = new THREE.CatmullRomCurve3(pts, false);
      var samples = 28;
      var offsetPts = [];
      for (var i = 0; i <= samples; i++) {
        var t = i / samples;
        var p = baseCurve.getPointAt(t);
        var tan = baseCurve.getTangentAt(t).normalize();
        var right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        offsetPts.push(p.clone().addScaledVector(right, sideSign * trackOffset));
      }
      return new THREE.CatmullRomCurve3(offsetPts, false);
    }

    bkkBaseEdges.forEach(function(be) {
      var fwdCurve = createOffsetTrackCurve(be.pts, -1);
      var fwdParCurve = createOffsetTrackCurve(be.pts, 1);
      var revPts = be.pts.slice().reverse();
      var revCurve = createOffsetTrackCurve(revPts, -1);
      var revParCurve = createOffsetTrackCurve(revPts, 1);

      var fwdEdge = {
        id: be.from + '->' + be.to,
        from: be.from,
        to: be.to,
        curve: fwdCurve,
        parallelCurve: fwdParCurve,
        isSubway: false,
        landmark: be.landmark,
        station: be.station
      };
      var revEdge = {
        id: be.to + '->' + be.from,
        from: be.to,
        to: be.from,
        curve: revCurve,
        parallelCurve: revParCurve,
        isSubway: false,
        landmark: be.landmark,
        station: be.station
      };

      window.edges.push(fwdEdge, revEdge);
      if (Array.isArray(window.physicalTracksToRender)) {
        window.physicalTracksToRender.push(fwdEdge);
      }
      newDirectedEdges.push(fwdEdge, revEdge);
    });

    // Render physical ballast, wooden sleepers, and steel rails for all new Bangkok tracks
    var sleeperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
    var railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.65 });
    var ballastMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.9 });
    var deckConcreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });

    function renderTrackGeometryForCurve(curve, startT, endT, includeEmbankment) {
      var len = curve.getLength() * (endT - startT);
      var steps = Math.max(8, Math.floor(len / 2.2));
      for (var i = 0; i <= steps; i++) {
        var t = startT + (i / steps) * (endT - startT);
        var p = curve.getPointAt(t);
        var tan = curve.getTangentAt(t).normalize();
        var yaw = Math.atan2(tan.x, tan.z);

        // Wooden sleeper
        var slp = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 0.62), sleeperMat);
        slp.position.set(p.x, p.y + 0.10, p.z);
        slp.rotation.y = yaw;
        bkkRootGroup.add(slp);

        // Left & right steel rails
        var rightVec = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
        var segLen = (len / steps) * 1.08;
        [-0.88, 0.88].forEach(function(rOff) {
          var rl = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.26, segLen), railMat);
          rl.position.set(p.x + rightVec.x * rOff, p.y + 0.26, p.z + rightVec.z * rOff);
          rl.rotation.y = yaw;
          bkkRootGroup.add(rl);
        });

        // Ballast bed or bridge concrete deck
        if (includeEmbankment && i % 2 === 0) {
          var terrH = window.getTerrainHeight(p.x, p.z);
          var clearH = p.y - terrH;
          if (clearH > 2.2) {
            var deck = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.65, segLen * 2.05), deckConcreteMat);
            deck.position.set(p.x, p.y - 0.32, p.z);
            deck.rotation.y = yaw;
            bkkRootGroup.add(deck);
          } else {
            var balH = Math.max(0.5, clearH + 0.35);
            var bal = new THREE.Mesh(new THREE.BoxGeometry(4.6, balH, segLen * 2.05), ballastMat);
            bal.position.set(p.x, p.y - balH * 0.5 + 0.04, p.z);
            bal.rotation.y = yaw;
            bkkRootGroup.add(bal);
          }
        }
      }
    }

    newDirectedEdges.forEach(function(e) {
      renderTrackGeometryForCurve(e.curve, 0.16, 0.84, true);
    });

    // Build smooth Hermite turnout curves (`window.turnoutCurves`) matching tracks.js schema
    // (`isTurnout: true`, `sourceEdge`, `targetEdge`, `curve`, `parallelCurve`) for J_NW and Bangkok nodes!
    var bkkNodesToConnect = ['J_NW', 'J_BKK_ANANTARA', 'J_BKK_ICONSIAM', 'J_BKK_WESTBANK'];
    bkkNodesToConnect.forEach(function(jId) {
      var incomingList = window.edges.filter(function(e) { return e.to === jId && !e.isTurnout; });
      var outgoingList = window.edges.filter(function(e) { return e.from === jId && !e.isTurnout; });
      var nodeObj = window.nodes[jId];
      var nodePos = (nodeObj && nodeObj.pos) ? nodeObj.pos : new THREE.Vector3();

      function buildFillet(cIn, cOut) {
        var p0 = cIn.getPointAt(0.84);
        var t0 = cIn.getTangentAt(0.84).normalize();
        var p4 = cOut.getPointAt(0.16);
        var t4 = cOut.getTangentAt(0.16).normalize();
        var dist = p0.distanceTo(p4);
        var handleLen = Math.max(4.0, dist * 0.35);

        var c1 = p0.clone().addScaledVector(t0, handleLen);
        var c3 = p4.clone().addScaledVector(t4, -handleLen);
        var mid = c1.clone().lerp(c3, 0.5).lerp(nodePos, 0.20);
        mid.y = 0.5 * (p0.y + p4.y);
        return new THREE.CatmullRomCurve3([p0, c1, mid, c3, p4], false);
      }

      incomingList.forEach(function(inEdge) {
        outgoingList.forEach(function(outEdge) {
          if (inEdge.from === outEdge.to) return; // No U-turns
          if (inEdge.isSubway && outEdge.isSubway) return;
          var key = inEdge.id + '=>' + outEdge.id;
          if (window.turnoutCurves[key]) return;

          var tCurve = buildFillet(inEdge.curve, outEdge.curve);
          var parCurve = buildFillet(inEdge.parallelCurve || inEdge.curve, outEdge.parallelCurve || outEdge.curve);
          var isSubTurn = Boolean(inEdge.isSubway || outEdge.isSubway);

          window.turnoutCurves[key] = {
            id: 'TURNOUT_' + key,
            from: inEdge.to,
            to: outEdge.to,
            isTurnout: true,
            isSubway: false,
            sourceEdge: inEdge,
            targetEdge: outEdge,
            curve: tCurve,
            parallelCurve: parCurve,
            station: isSubTurn ? (outEdge.isSubway ? outEdge.station : inEdge.station) : null
          };

          // Render physical turnout rails & sleepers
          renderTrackGeometryForCurve(tCurve, 0.0, 1.0, false);
        });
      });
    });

    // Enhance `window.getBranches` so:
    // - At J_NW coming from Eiffel Tower (`J_NORTH->J_NW`):
    //     Left = Metro 1, Straight = Mom's House (`J_NW->J_WEST`), Right = Bangkok Chao Phraya (`J_NW->J_BKK_ANANTARA`)
    // - Once on the Bangkok loop, leaving the switch on `straight` naturally guides the train
    //   all the way around Anantara -> IconSiam -> Bridge -> Westbank -> Anantara -> back to Mom's House track (`J_NW->J_WEST`)!
    var origGetBranches = window.getBranches;
    window.getBranches = function(currentEdge) {
      var res = origGetBranches ? origGetBranches(currentEdge) : { left: null, straight: null, right: null };
      if (!currentEdge) return res;
      var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
      if (!baseEdge) return res;

      function findEdge(id) {
        for (var i = 0; i < window.edges.length; i++) {
          if (window.edges[i].id === id) return window.edges[i];
        }
        return null;
      }

      // 1) Coming from Eiffel Tower (`J_NORTH->J_NW`) -> Right branch goes to Anantara & Chao Phraya River!
      if (baseEdge.id === 'J_NORTH->J_NW') {
        var eMetro = findEdge('METRO_J_NW->J_SE') || res.left;
        var eMom = findEdge('J_NW->J_WEST') || res.straight;
        var eBkk = findEdge('J_NW->J_BKK_ANANTARA') || res.right;
        return { left: eMetro, straight: eMom, right: eBkk };
      }
      // 2) Coming from Mom's House (`J_WEST->J_NW`) -> Left branch goes to Anantara & Chao Phraya River!
      if (baseEdge.id === 'J_WEST->J_NW') {
        var eBkk2 = findEdge('J_NW->J_BKK_ANANTARA');
        var eEiffel = findEdge('J_NW->J_NORTH') || res.straight;
        var eMetro2 = findEdge('METRO_J_NW->J_SE') || res.right;
        return { left: eBkk2 || eEiffel, straight: eEiffel, right: eMetro2 };
      }
      // 3) Returning from Anantara back to J_NW (`J_BKK_ANANTARA->J_NW`) -> Straight continues past Mom's House!
      if (baseEdge.id === 'J_BKK_ANANTARA->J_NW') {
        var eEif3 = findEdge('J_NW->J_NORTH');
        var eMom3 = findEdge('J_NW->J_WEST');
        var eMet3 = findEdge('METRO_J_NW->J_SE');
        return { left: eEif3 || eMom3, straight: eMom3, right: eMet3 || eMom3 };
      }
      // 4) Arriving at Anantara Junction from J_NW (`J_NW->J_BKK_ANANTARA`):
      //    Straight = 1km Riverside Track to IconSiam (`J_BKK_ANANTARA->J_BKK_ICONSIAM`)
      //    Right = Northern River Bridge (`J_BKK_ANANTARA->J_BKK_WESTBANK`)
      if (baseEdge.id === 'J_NW->J_BKK_ANANTARA') {
        var eIcon = findEdge('J_BKK_ANANTARA->J_BKK_ICONSIAM');
        var eWest = findEdge('J_BKK_ANANTARA->J_BKK_WESTBANK');
        return { left: eIcon, straight: eIcon, right: eWest || eIcon };
      }
      // 5) Completing the loop from Opposite Bank (`J_BKK_WESTBANK->J_BKK_ANANTARA`):
      //    Straight = Return behind Mom's House to main track (`J_BKK_ANANTARA->J_NW`)
      //    Right = Repeat the riverside loop to IconSiam (`J_BKK_ANANTARA->J_BKK_ICONSIAM`)
      if (baseEdge.id === 'J_BKK_WESTBANK->J_BKK_ANANTARA') {
        var eRetNw = findEdge('J_BKK_ANANTARA->J_NW');
        var eIcon2 = findEdge('J_BKK_ANANTARA->J_BKK_ICONSIAM');
        return { left: eRetNw, straight: eRetNw, right: eIcon2 || eRetNw };
      }
      // 6) Reverse along East Bank (`J_BKK_ICONSIAM->J_BKK_ANANTARA`):
      if (baseEdge.id === 'J_BKK_ICONSIAM->J_BKK_ANANTARA') {
        var eWest2 = findEdge('J_BKK_ANANTARA->J_BKK_WESTBANK');
        var eRetNw2 = findEdge('J_BKK_ANANTARA->J_NW');
        return { left: eWest2 || eRetNw2, straight: eRetNw2, right: eRetNw2 };
      }
      return res;
    };

    // Extend `window.drawLandmarkPictogram` with custom child-friendly icons for Anantara, IconSiam & Bridge
    var origDrawPictogram = window.drawLandmarkPictogram;
    window.drawLandmarkPictogram = function(ctx, type, cx, cy, r) {
      if (type === 'anantara') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
        // Golden Thai multi-tiered roof + 3-pyramid Anantara emblem
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.65);
        ctx.lineTo(cx - r * 0.62, cy + r * 0.05);
        ctx.lineTo(cx + r * 0.62, cy + r * 0.05);
        ctx.closePath();
        ctx.fill();
        // River waves below
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.55, cy + r * 0.42);
        ctx.quadraticCurveTo(cx, cy + r * 0.22, cx + r * 0.55, cy + r * 0.42);
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (type === 'iconsiam') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1b4b';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
        // Golden pleated crown + cyan fountain jets
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.55, cy + r * 0.15);
        ctx.lineTo(cx - r * 0.25, cy - r * 0.55);
        ctx.lineTo(cx, cy - r * 0.25);
        ctx.lineTo(cx + r * 0.25, cy - r * 0.55);
        ctx.lineTo(cx + r * 0.55, cy + r * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 3.5;
        for (var fj = -1; fj <= 1; fj++) {
          ctx.beginPath();
          ctx.moveTo(cx + fj * r * 0.28, cy + r * 0.58);
          ctx.lineTo(cx + fj * r * 0.28, cy + r * 0.22);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (type === 'bkk_bridge') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        // Tied-arch railway bridge silhouette
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.18, r * 0.58, Math.PI, 0, false);
        ctx.moveTo(cx - r * 0.68, cy + r * 0.18);
        ctx.lineTo(cx + r * 0.68, cy + r * 0.18);
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (origDrawPictogram) {
        return origDrawPictogram(ctx, type, cx, cy, r);
      }
    };

    // Rebuild `window.junctionSignsGroup` so all 3D junction signposts (including J_NW -> Anantara!)
    // use the unified pictorial arrow+badge sprites
    if (window.junctionSignsGroup) {
      while (window.junctionSignsGroup.children.length > 0) {
        window.junctionSignsGroup.remove(window.junctionSignsGroup.children[0]);
      }

      function getBkkBranchInfo(bEdge) {
        if (!bEdge) return { icon: 'fountain', badgeCol: '#0284c7' };
        if (bEdge.isSubway) return { icon: 'metro', badgeCol: '#2563eb' };
        if (bEdge.to === 'EXIT_ALPS') return { icon: 'alps', badgeCol: '#0284c7' };
        if (bEdge.to === 'EXIT_EGYPT') return { icon: 'egypt', badgeCol: '#ca8a04' };
        var stIcon = (bEdge.station && bEdge.station.icon)
          ? bEdge.station.icon
          : ((bEdge.landmark && bEdge.landmark.type) ? bEdge.landmark.type : '');
        var badgeColors = {
          eiffel: '#b45309',
          grandma_house: '#be185d',
          airport: '#0284c7',
          jewel: '#0d9488',
          colosseum: '#c2410c',
          stadium: '#15803d',
          bigben: '#a16207',
          mom_house: '#e11d48',
          skyscraper: '#1d4ed8',
          fountain: '#0369a1',
          anantara: '#0f766e',
          iconsiam: '#b45309',
          bkk_bridge: '#0369a1'
        };
        if (stIcon && badgeColors[stIcon]) {
          return { icon: stIcon, badgeCol: badgeColors[stIcon] };
        }
        return { icon: 'fountain', badgeCol: '#0284c7' };
      }

      function drawBkkArrow(ctx, dirType, cx, cy, size) {
        ctx.save();
        ctx.translate(cx, cy);
        if (dirType === 'left') ctx.rotate(-Math.PI * 0.5);
        else if (dirType === 'right') ctx.rotate(Math.PI * 0.5);
        var s = size * 0.52;
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.92, -s * 0.05);
        ctx.lineTo(s * 0.42, -s * 0.05);
        ctx.lineTo(s * 0.42, s * 0.92);
        ctx.lineTo(-s * 0.42, s * 0.92);
        ctx.lineTo(-s * 0.42, -s * 0.05);
        ctx.lineTo(-s * 0.92, -s * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      var postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
      var trimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

      window.edges.forEach(function(e) {
        if (e.isSubway || e.isTurnout) return;
        if (e.to.indexOf('EXIT_') === 0) return;

        var br = window.getBranches(e);
        if (!br) return;

        var rows = [];
        var usedIds = {};
        if (br.left && (!br.straight || br.left.id !== br.straight.id)) {
          usedIds[br.left.id] = true;
          rows.push({ dirType: 'left', info: getBkkBranchInfo(br.left) });
        }
        if (br.straight && !usedIds[br.straight.id]) {
          usedIds[br.straight.id] = true;
          rows.push({ dirType: 'straight', info: getBkkBranchInfo(br.straight) });
        }
        if (br.right && !usedIds[br.right.id]) {
          usedIds[br.right.id] = true;
          rows.push({ dirType: 'right', info: getBkkBranchInfo(br.right) });
        }
        if (rows.length < 2) return;

        var rowH = 168;
        var padY = 20;
        var c = document.createElement('canvas');
        c.width = 520;
        c.height = padY * 2 + rows.length * rowH;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 12;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(8, 8, c.width - 16, c.height - 16, 34);
        else ctx.rect(8, 8, c.width - 16, c.height - 16);
        ctx.fill();
        ctx.stroke();

        for (var rIdx = 0; rIdx < rows.length; rIdx++) {
          var r = rows[rIdx];
          var ry = padY + rIdx * rowH;
          var cardH = rowH - 12;
          var cy = ry + cardH * 0.5;
          ctx.fillStyle = r.info.badgeCol;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 5;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(24, ry + 6, c.width - 48, cardH, 26);
          else ctx.rect(24, ry + 6, c.width - 48, cardH);
          ctx.fill();
          ctx.stroke();
          drawBkkArrow(ctx, r.dirType, 130, cy + 6, 98);
          if (window.drawLandmarkPictogram) {
            window.drawLandmarkPictogram(ctx, r.info.icon, 355, cy + 6, 68);
          }
        }

        var uSign = 0.81;
        var pt = e.curve.getPointAt(uSign);
        var tan = e.curve.getTangentAt(uSign).normalize();
        var rightVec = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        var signPos = pt.clone().add(rightVec.clone().multiplyScalar(7.8));

        var signG = new THREE.Group();
        signG.position.copy(signPos);
        var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 9.6, 10), postMat);
        pole.position.y = 1.4;
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), trimMat);
        cap.position.y = 6.2;
        signG.add(pole, cap);

        var signTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new THREE.CanvasTexture(c);
        var signSprite = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: true })
        );
        var signH = 2.4 * rows.length;
        signSprite.scale.set(7.4, signH, 1);
        signSprite.position.set(0, 6.4 + signH * 0.45, 0);
        signG.add(signSprite);

        window.junctionSignsGroup.add(signG);
      });
    }
  })();

  // Helper to create crisp canvas signage textures (ANANTARA / ICONSIAM)
  function createSignageTexture(titleText, subtitleText, drawAnantaraLogo, bgHex, borderHex, textHex) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 192;
    var ctx = c.getContext('2d');

    ctx.fillStyle = bgHex || '#1c1917';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = borderHex || '#fbbf24';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, c.width - 12, c.height - 12);

    ctx.fillStyle = textHex || '#fde68a';
    if (drawAnantaraLogo) {
      // Iconic Anantara triangle pyramid above 2 smaller triangles + horizontal bar
      var cx = c.width * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, 22);
      ctx.lineTo(cx - 22, 54);
      ctx.lineTo(cx + 22, 54);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 24, 58);
      ctx.lineTo(cx - 42, 82);
      ctx.lineTo(cx - 6, 82);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 24, 58);
      ctx.lineTo(cx + 6, 82);
      ctx.lineTo(cx + 42, 82);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(cx - 48, 86, 96, 4);

      ctx.font = 'bold 44px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(titleText, cx, 134);
      if (subtitleText) {
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(subtitleText, cx, 164);
      }
    } else {
      ctx.font = 'bold 64px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleText, c.width * 0.5, subtitleText ? 84 : 96);
      if (subtitleText) {
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(subtitleText, c.width * 0.5, 146);
      }
    }
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // --------------------------------------------------------------------------
  // 3. ANANTARA RIVERSIDE BANGKOK RESORT & BOAT PIER
  //    - West Side (Riverfront): Main grand entrance portico with ANANTARA sign,
  //      outdoor dining terraces with umbrellas, and wooden Thai boat pier.
  //    - East Side (Railway view): Multi-story Thai resort wings with tiered
  //      dark roofs & golden chofah finials, balconies, tropical garden & pool.
  // --------------------------------------------------------------------------
  window.anantaraWorldCenter = new THREE.Vector3(-396.0, 2.2, -42.0);
  window.anantaraPierDockPos = new THREE.Vector3(-429.5, riverWaterY + 0.2, -42.0);
  window.bangkokObstacles.push({ pos: window.anantaraWorldCenter, rad: 28.0, maxH: 26.0 });

  (function buildAnantaraRiversideHotel() {
    var hotelG = new THREE.Group();
    hotelG.position.copy(window.anantaraWorldCenter);
    bkkRootGroup.add(hotelG);

    var creamWallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 });
    var teakWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    var thaiRoofMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5, metalness: 0.15 });
    var goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x78350f,
      emissiveIntensity: 0.25
    });
    var winGlassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xfde68a,
      emissiveIntensity: 0.22
    });
    bkkNightLights.push({ mat: winGlassMat, dayHex: 0x22d3ee, nightHex: 0xfef08a, dayInt: 0.18, nightInt: 1.15 });
    bkkNightLights.push({ mat: goldTrimMat, dayHex: 0x78350f, nightHex: 0xf59e0b, dayInt: 0.2, nightInt: 0.85 });

    // Helper to build a multi-story Thai resort wing with balconies & tiered Thai gable roof
    function buildThaiResortWing(wx, wz, widthX, lengthZ, floors, rotY) {
      var wg = new THREE.Group();
      wg.position.set(wx, 0, wz);
      wg.rotation.y = rotY || 0;

      var floorH = 2.85;
      var totalH = floors * floorH;

      var core = new THREE.Mesh(new THREE.BoxGeometry(widthX, totalH, lengthZ), creamWallMat);
      core.position.y = totalH * 0.5;
      core.castShadow = true;
      core.receiveShadow = true;
      wg.add(core);

      // Balconies & illuminated windows on every floor (both East railway side & West river side)
      for (var f = 0; f < floors; f++) {
        var fy = f * floorH + 0.2;
        var slab = new THREE.Mesh(new THREE.BoxGeometry(widthX + 1.4, 0.28, lengthZ + 1.4), teakWoodMat);
        slab.position.y = fy;
        wg.add(slab);

        var rail = new THREE.Mesh(new THREE.BoxGeometry(widthX + 1.5, 0.42, lengthZ + 1.5), goldTrimMat);
        rail.position.y = fy + 0.55;
        wg.add(rail);

        var winBand = new THREE.Mesh(new THREE.BoxGeometry(widthX + 0.15, floorH * 0.58, lengthZ * 0.88), winGlassMat);
        winBand.position.y = fy + floorH * 0.52;
        wg.add(winBand);
      }

      // Two-tiered Thai pitched roof with golden ridge & chofah finials
      for (var tier = 0; tier < 2; tier++) {
        var tw = (widthX + 2.6) * (1.0 - tier * 0.24);
        var tl = (lengthZ + 2.6) * (1.0 - tier * 0.18);
        var th = 2.6 - tier * 0.45;
        var ty = totalH + tier * 1.9 + th * 0.5;

        var roofMesh = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(tw, tl) * 0.54, th, 4), thaiRoofMat);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.scale.set(tw / Math.hypot(tw, tl), 1.0, tl / Math.hypot(tw, tl));
        roofMesh.position.y = ty;
        roofMesh.castShadow = true;
        wg.add(roofMesh);

        // Golden roof trim & upward chofah spires at the corners
        var trim = new THREE.Mesh(new THREE.BoxGeometry(tw * 0.72, 0.22, tl * 0.72), goldTrimMat);
        trim.position.y = ty - th * 0.44;
        wg.add(trim);

        [-1, 1].forEach(function(sz) {
          var spire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.6, 6), goldTrimMat);
          spire.position.set(0, ty + th * 0.45, sz * (tl * 0.34));
          spire.rotation.x = sz * 0.25;
          wg.add(spire);
        });
      }

      hotelG.add(wg);
    }

    // Main Central Grand Pavilion + North & South Courtyards (visible from both river and railway!)
    buildThaiResortWing(0, 0, 14.0, 28.0, 5, 0);
    buildThaiResortWing(4.0, -22.0, 12.0, 20.0, 4, 0.18);
    buildThaiResortWing(4.0, 22.0, 12.0, 20.0, 4, -0.18);
    buildThaiResortWing(12.0, -11.0, 10.0, 16.0, 3, 0);
    buildThaiResortWing(12.0, 11.0, 10.0, 16.0, 3, 0);

    // Signboard texture with Anantara logo
    var anantaraSignTex = createSignageTexture('ANANTARA', 'RIVERSIDE BANGKOK RESORT', true, '#1c1917', '#fbbf24', '#fde68a');
    var signMat = new THREE.MeshBasicMaterial({ map: anantaraSignTex });

    // 1) West Side (Riverfront Main Portico facing the Chao Phraya River)
    var westPortico = new THREE.Mesh(new THREE.BoxGeometry(5.5, 7.2, 16.0), teakWoodMat);
    westPortico.position.set(-8.5, 3.6, 0);
    hotelG.add(westPortico);

    var westSign = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 4.6), signMat);
    westSign.position.set(-11.35, 4.6, 0);
    westSign.rotation.y = -Math.PI / 2;
    hotelG.add(westSign);

    // 2) East Side (Railway-facing Portico & Lagoon Pool so the train sees ANANTARA clearly too!)
    var eastPortico = new THREE.Mesh(new THREE.BoxGeometry(5.2, 6.8, 15.0), teakWoodMat);
    eastPortico.position.set(16.5, 3.4, 0);
    hotelG.add(eastPortico);

    var eastSign = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 4.4), signMat);
    eastSign.position.set(19.18, 4.5, 0);
    eastSign.rotation.y = Math.PI / 2;
    hotelG.add(eastSign);

    // Turquoise Resort Lagoon Pool & Sun Umbrellas on the Railway Garden Side (East)
    var poolWater = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 8.5, 0.25, 24),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.15, emissive: 0x0891b2, emissiveIntensity: 0.35 })
    );
    poolWater.position.set(24.0, 0.15, 0);
    hotelG.add(poolWater);

    // Riverfront Outdoor Dining Terrace with Cream Parasol Umbrellas (West side by the river)
    var umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.5 });
    for (var ui = -2; ui <= 2; ui++) {
      var uz = ui * 7.5;
      var uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), teakWoodMat);
      uPole.position.set(-15.5, 1.3, uz);
      hotelG.add(uPole);
      var uTop = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.85, 12), umbrellaMat);
      uTop.position.set(-15.5, 2.65, uz);
      hotelG.add(uTop);
    }

    // Wooden Anantara Boat Pier extending out into the Chao Phraya River (West side)
    var pierG = new THREE.Group();
    pierG.position.set(-20.0, 0, 0);
    hotelG.add(pierG);

    var deckPlankMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    var pierDeck = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.45, 7.2), deckPlankMat);
    pierDeck.position.set(-6.0, -0.4, 0);
    pierG.add(pierDeck);

    // Wooden pilings in the water + dual Thai pavilion roofs over the pier
    [-12.5, -7.5, -2.5].forEach(function(px) {
      [-3.0, 3.0].forEach(function(pz) {
        var piling = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 5.2, 8), teakWoodMat);
        piling.position.set(px, -2.0, pz);
        pierG.add(piling);
      });
    });

    [-4.5, -10.5].forEach(function(px) {
      var pavRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.1, 4), thaiRoofMat);
      pavRoof.rotation.y = Math.PI / 4;
      pavRoof.position.set(px, 3.3, 0);
      pierG.add(pavRoof);
      var pavSpire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.1, 6), goldTrimMat);
      pavSpire.position.set(px, 4.6, 0);
      pierG.add(pavSpire);
    });

    // Waving hotel guests & staff on the Anantara Pier and Railway Garden
    var pierGuest1 = createBangkokPerson(0xf43f5e, 0xffffff, 0xfde047, 1.15);
    pierGuest1.position.set(-11.5, -0.15, -1.8);
    pierGuest1.rotation.y = -Math.PI / 2;
    pierG.add(pierGuest1);

    var pierGuest2 = createBangkokPerson(0x22c55e, 0x1e293b, null, 1.1);
    pierGuest2.position.set(-11.5, -0.15, 1.8);
    pierGuest2.rotation.y = -Math.PI / 2;
    pierG.add(pierGuest2);

    var gardenGreeter = createBangkokPerson(0xf59e0b, 0x451a03, 0xfbbf24, 1.2);
    gardenGreeter.position.set(29.0, 0.1, -6.5);
    gardenGreeter.rotation.y = Math.PI / 2;
    hotelG.add(gardenGreeter);

    // Surround Anantara with lush tropical coconut palms
    var palmOffsets = [
      [-14, -18], [-14, 18], [18, -28], [18, 28], [26, -14], [26, 14], [30, 0], [-16, -9], [-16, 9]
    ];
    palmOffsets.forEach(function(po, idx) {
      createBangkokPalmTree(
        window.anantaraWorldCenter.x + po[0],
        window.anantaraWorldCenter.y,
        window.anantaraWorldCenter.z + po[1],
        0.95 + (idx % 3) * 0.15
      );
    });
  })();

  // --------------------------------------------------------------------------
  // 4. ICONSIAM SHOPPING MEGACOMPLEX, RIVERFRONT FERRIS WHEEL, BANGKOK SKYLINE,
  //    NIGHT ILLUMINATION & THE ICONIC MULTIMEDIA DANCING FOUNTAINS + MUSIC
  // --------------------------------------------------------------------------
  window.iconsiamWorldCenter = new THREE.Vector3(-404.0, 2.2, 142.0);
  window.iconsiamPierDockPos = new THREE.Vector3(-429.5, riverWaterY + 0.2, 142.0);
  window.bangkokObstacles.push({ pos: window.iconsiamWorldCenter, rad: 34.0, maxH: 48.0 });

  var iconsiamFerrisWheelWheel = null;
  var iconsiamFountainJets = [];
  var iconsiamFountainLight = null;

  (function buildIconSiamAndBangkokSkyline() {
    var iconG = new THREE.Group();
    iconG.position.copy(window.iconsiamWorldCenter);
    bkkRootGroup.add(iconG);

    var goldGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.16,
      metalness: 0.55,
      emissive: 0xd97706,
      emissiveIntensity: 0.35
    });
    var champagneFrameMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.75,
      emissive: 0x92400e,
      emissiveIntensity: 0.28
    });
    var darkMarbleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.3 });
    var roofGardenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 });

    bkkNightLights.push({ mat: goldGlassMat, dayHex: 0xb45309, nightHex: 0xfef08a, dayInt: 0.28, nightInt: 1.45 });
    bkkNightLights.push({ mat: champagneFrameMat, dayHex: 0x78350f, nightHex: 0xf59e0b, dayInt: 0.22, nightInt: 1.10 });

    // 5 Stepped Luxury Glass & Champagne-Gold Terraced Mall Levels
    var levels = [
      { w: 24.0, l: 58.0, h: 4.8 },
      { w: 21.5, l: 52.0, h: 4.6 },
      { w: 19.0, l: 46.0, h: 4.5 },
      { w: 16.5, l: 38.0, h: 4.4 },
      { w: 13.5, l: 30.0, h: 4.2 }
    ];
    var curY = 0;
    levels.forEach(function(lv, idx) {
      var glassBox = new THREE.Mesh(new THREE.BoxGeometry(lv.w, lv.h, lv.l), goldGlassMat);
      glassBox.position.y = curY + lv.h * 0.5;
      glassBox.castShadow = true;
      glassBox.receiveShadow = true;
      iconG.add(glassBox);

      // Pleated diagonal golden facade mullions
      for (var zi = -Math.floor(lv.l * 0.42); zi <= Math.floor(lv.l * 0.42); zi += 6) {
        var finE = new THREE.Mesh(new THREE.BoxGeometry(0.45, lv.h, 0.45), champagneFrameMat);
        finE.position.set(lv.w * 0.5 + 0.15, curY + lv.h * 0.5, zi);
        finE.rotation.x = (idx % 2 === 0) ? 0.16 : -0.16;
        iconG.add(finE);

        var finW = new THREE.Mesh(new THREE.BoxGeometry(0.45, lv.h, 0.45), champagneFrameMat);
        finW.position.set(-lv.w * 0.5 - 0.15, curY + lv.h * 0.5, zi);
        finW.rotation.x = (idx % 2 === 0) ? -0.16 : 0.16;
        iconG.add(finW);
      }

      // Lush green rooftop terrace slab
      var slab = new THREE.Mesh(new THREE.BoxGeometry(lv.w + 1.8, 0.45, lv.l + 1.8), champagneFrameMat);
      slab.position.y = curY + lv.h;
      iconG.add(slab);

      var gardenStrip = new THREE.Mesh(new THREE.BoxGeometry(lv.w + 1.0, 0.25, lv.l + 1.0), roofGardenMat);
      gardenStrip.position.y = curY + lv.h + 0.26;
      iconG.add(gardenStrip);

      curY += lv.h;
    });

    // Iconic Golden Pleated "Sabai" Roof Crowns on top of IconSiam (matching concept art!)
    [-8.5, 0, 8.5].forEach(function(cz, cIdx) {
      var crownH = (cIdx === 1) ? 11.5 : 8.5;
      var crownR = (cIdx === 1) ? 8.2 : 6.2;
      var crown = new THREE.Mesh(new THREE.ConeGeometry(crownR, crownH, 4), champagneFrameMat);
      crown.position.set(0, curY + crownH * 0.48, cz);
      crown.rotation.y = Math.PI / 4;
      crown.scale.set(0.75, 1.0, 1.25);
      crown.castShadow = true;
      iconG.add(crown);
    });

    // Giant Illuminated "ICONSIAM" Signboards on BOTH West (Riverfront) & East (Railway) Facades
    var iconSignTex = createSignageTexture('ICONSIAM', 'CHAO PHRAYA RIVERFRONT', false, '#111827', '#fbbf24', '#fef08a');
    var iconSignMat = new THREE.MeshBasicMaterial({ map: iconSignTex });

    var westBannerBacking = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.6, 26.0), darkMarbleMat);
    westBannerBacking.position.set(-10.8, 15.6, 0);
    iconG.add(westBannerBacking);

    var westBanner = new THREE.Mesh(new THREE.PlaneGeometry(24.8, 4.8), iconSignMat);
    westBanner.position.set(-11.55, 15.6, 0);
    westBanner.rotation.y = -Math.PI / 2;
    iconG.add(westBanner);

    var eastBannerBacking = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.6, 26.0), darkMarbleMat);
    eastBannerBacking.position.set(10.8, 15.6, 0);
    iconG.add(eastBannerBacking);

    var eastBanner = new THREE.Mesh(new THREE.PlaneGeometry(24.8, 4.8), iconSignMat);
    eastBanner.position.set(11.55, 15.6, 0);
    eastBanner.rotation.y = Math.PI / 2;
    iconG.add(eastBanner);

    // IconSiam Waterfront Pier (West side on the Chao Phraya River)
    var iconPier = new THREE.Group();
    iconPier.position.set(-18.0, 0, 0);
    iconG.add(iconPier);

    var pierDeck = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.5, 18.0), darkMarbleMat);
    pierDeck.position.set(-4.5, -0.35, 0);
    iconPier.add(pierDeck);

    var pierCanopy = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.45, 14.0), champagneFrameMat);
    pierCanopy.position.set(-5.5, 3.4, 0);
    iconPier.add(pierCanopy);

    // Waving visitors on the IconSiam Promenade & Pier
    [-12, -5, 4, 12].forEach(function(vz, vIdx) {
      var colors = [0xec4899, 0x3b82f6, 0x10b981, 0xf97316];
      var visitor = createBangkokPerson(colors[vIdx % colors.length], 0x1e293b, (vIdx % 2 === 0 ? 0xfef08a : null), 1.12);
      visitor.position.set(14.5, 0.1, vz);
      visitor.rotation.y = Math.PI / 2;
      iconG.add(visitor);
    });

    // Riverfront Ferris Wheel ("Asiatique / Riverfront Eye" just north of IconSiam, matching concept art!)
    var wheelBaseG = new THREE.Group();
    wheelBaseG.position.set(-4.0, 0, -44.0);
    iconG.add(wheelBaseG);

    var strutMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.6 });
    var wheelGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55
    });
    bkkNightLights.push({ mat: wheelGlowMat, dayHex: 0x0284c7, nightHex: 0x38bdf8, dayInt: 0.35, nightInt: 1.65 });

    [-2.4, 2.4].forEach(function(sx) {
      var leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 18.0, 8), strutMat);
      leg1.position.set(sx, 8.5, -3.5);
      leg1.rotation.x = 0.22;
      wheelBaseG.add(leg1);

      var leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 18.0, 8), strutMat);
      leg2.position.set(sx, 8.5, 3.5);
      leg2.rotation.x = -0.22;
      wheelBaseG.add(leg2);
    });

    iconsiamFerrisWheelWheel = new THREE.Group();
    iconsiamFerrisWheelWheel.position.set(0, 17.0, 0);
    wheelBaseG.add(iconsiamFerrisWheelWheel);

    var wheelRadius = 11.5;
    var rim = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.32, 10, 32), wheelGlowMat);
    rim.rotation.y = Math.PI / 2;
    iconsiamFerrisWheelWheel.add(rim);

    for (var sp = 0; sp < 12; sp++) {
      var sAng = (sp / 12) * Math.PI * 2;
      var spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, wheelRadius * 2, 6), strutMat);
      spoke.rotation.x = sAng;
      iconsiamFerrisWheelWheel.add(spoke);

      var podMat = new THREE.MeshStandardMaterial({
        color: (sp % 2 === 0) ? 0xf43f5e : 0xfacc15,
        roughness: 0.3,
        emissive: (sp % 2 === 0) ? 0xbe123c : 0xca8a04,
        emissiveIntensity: 0.35
      });
      var pod = new THREE.Mesh(new THREE.SphereGeometry(0.82, 10, 10), podMat);
      pod.position.set(0, Math.sin(sAng) * wheelRadius, Math.cos(sAng) * wheelRadius);
      iconsiamFerrisWheelWheel.add(pod);
    }

    // Surrounding Bangkok High-Rise Skyscrapers (Magnolia Waterfront Residences & Mandarin Oriental Towers)
    var towerSpecs = [
      { dx: -2.0, dz: 44.0, w: 13.0, d: 13.0, h: 52.0, col: 0xe2e8f0, win: 0x38bdf8 },
      { dx: 8.0, dz: 58.0, w: 11.5, d: 11.5, h: 42.0, col: 0xfef3c7, win: 0xfde047 },
      { dx: 10.0, dz: -62.0, w: 12.0, d: 12.0, h: 38.0, col: 0xdbeafe, win: 0x60a5fa },
      { dx: -175.0, dz: -35.0, w: 14.0, d: 14.0, h: 46.0, col: 0xf1f5f9, win: 0x38bdf8 },
      { dx: -182.0, dz: 25.0, w: 15.0, d: 12.0, h: 54.0, col: 0xfef9c3, win: 0xfbbf24 },
      { dx: -178.0, dz: 85.0, w: 13.0, d: 13.0, h: 40.0, col: 0xe0f2fe, win: 0x22d3ee }
    ];
    towerSpecs.forEach(function(ts) {
      var tg = new THREE.Group();
      tg.position.set(ts.dx, 0, ts.dz);
      var tBody = new THREE.Mesh(
        new THREE.BoxGeometry(ts.w, ts.h, ts.d),
        new THREE.MeshStandardMaterial({ color: ts.col, roughness: 0.35, metalness: 0.35 })
      );
      tBody.position.y = ts.h * 0.5;
      tBody.castShadow = true;
      tg.add(tBody);

      var tWinMat = new THREE.MeshStandardMaterial({
        color: ts.win,
        roughness: 0.2,
        metalness: 0.5,
        emissive: ts.win,
        emissiveIntensity: 0.25
      });
      bkkNightLights.push({ mat: tWinMat, dayHex: ts.win, nightHex: 0xfef08a, dayInt: 0.2, nightInt: 1.25 });

      var winCore = new THREE.Mesh(new THREE.BoxGeometry(ts.w + 0.16, ts.h * 0.88, ts.d * 0.82), tWinMat);
      winCore.position.y = ts.h * 0.5;
      tg.add(winCore);

      var spire = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.9, 6.5, 8), champagneFrameMat);
      spire.position.y = ts.h + 3.25;
      tg.add(spire);
      iconG.add(tg);
    });

    // THE ICONIC MULTIMEDIA DANCING FOUNTAIN SHOW (on both the East Railway Promenade & West Riverfront!)
    var jetColors = [0x38bdf8, 0xf472b6, 0xfacc15, 0x4ade80, 0xc084fc, 0xfb923c];
    for (var fi = 0; fi < 16; fi++) {
      var fz = -26.0 + (fi / 15) * 52.0;
      var colHex = jetColors[fi % jetColors.length];

      // East Promenade Fountain Jet (right next to the railway track so the player sees it up close!)
      var jetMatE = new THREE.MeshStandardMaterial({
        color: colHex,
        transparent: true,
        opacity: 0.88,
        roughness: 0.15,
        emissive: colHex,
        emissiveIntensity: 0.85
      });
      var jetMeshE = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.52, 5.5, 10), jetMatE);
      jetMeshE.position.set(15.8, 2.75, fz);
      iconG.add(jetMeshE);

      // West Riverfront Fountain Jet (along the Chao Phraya pier)
      var jetMeshW = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.58, 6.5, 10), jetMatE);
      jetMeshW.position.set(-14.8, 3.25, fz);
      iconG.add(jetMeshW);

      iconsiamFountainJets.push({
        meshE: jetMeshE,
        meshW: jetMeshW,
        mat: jetMatE,
        index: fi,
        baseZ: fz
      });
    }

    iconsiamFountainLight = new THREE.PointLight(0xfbbf24, 1.4, 95);
    iconsiamFountainLight.position.set(16.0, 14.0, 0);
    iconG.add(iconsiamFountainLight);
    bkkNightLights.push({ light: iconsiamFountainLight, dayInt: 0.6, nightInt: 2.6 });

    // Tropical palms along the IconSiam railway avenue
    for (var pi = -3; pi <= 3; pi++) {
      if (pi === 0) continue;
      createBangkokPalmTree(
        window.iconsiamWorldCenter.x + 20.5,
        window.iconsiamWorldCenter.y,
        window.iconsiamWorldCenter.z + pi * 12.0,
        1.05
      );
    }
  })();

  // --------------------------------------------------------------------------
  // 5. GRAND CHAO PHRAYA TIED-ARCH RAILWAY BRIDGE & NORTHERN RETURN VIADUCT
  // --------------------------------------------------------------------------
  window.bkkBridgeWorldCenter = new THREE.Vector3(-474.0, 14.2, 260.0);

  (function buildChaoPhrayaRailwayBridges() {
    var whiteSteelMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.65 });
    var pierConcreteMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 });
    var lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.9
    });
    bkkNightLights.push({ mat: lampGlowMat, dayHex: 0xfef08a, nightHex: 0xfde047, dayInt: 0.35, nightInt: 1.8 });

    function decorateBridgeSpan(edgeId, archPeakHeight, hasGrandTiedArch) {
      var eObj = window.edges.find(function(x) { return x.id === edgeId; });
      if (!eObj) return;
      var curve = eObj.curve;
      var steps = 32;

      for (var i = 3; i <= steps - 3; i++) {
        var t = i / steps;
        var p = curve.getPointAt(t);
        var tan = curve.getTangentAt(t).normalize();
        var right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        var yaw = Math.atan2(tan.x, tan.z);

        // Wide bridge deck slab spanning both tracks + safety parapets
        var centerPt = p.clone().addScaledVector(right, -2.4);
        var slab = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.9, 6.8), pierConcreteMat);
        slab.position.set(centerPt.x, centerPt.y - 0.55, centerPt.z);
        slab.rotation.y = yaw;
        bkkRootGroup.add(slab);

        [-5.1, 5.1].forEach(function(sideOff) {
          var rail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.35, 6.8), whiteSteelMat);
          rail.position.set(centerPt.x + right.x * sideOff, centerPt.y + 0.55, centerPt.z + right.z * sideOff);
          rail.rotation.y = yaw;
          bkkRootGroup.add(rail);
        });

        // Bridge street lamps & tied-arch suspension ribs over the river channel
        var normSpan = (t - 0.18) / 0.48;
        if (hasGrandTiedArch && normSpan >= 0.0 && normSpan <= 1.0) {
          var archH = Math.sin(normSpan * Math.PI) * archPeakHeight;
          [-5.0, 5.0].forEach(function(sideOff) {
            var archNode = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 6.8), whiteSteelMat);
            archNode.position.set(centerPt.x + right.x * sideOff, centerPt.y + archH + 0.8, centerPt.z + right.z * sideOff);
            archNode.rotation.y = yaw;
            bkkRootGroup.add(archNode);

            if (archH > 1.8) {
              var hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, archH, 6), whiteSteelMat);
              hanger.position.set(centerPt.x + right.x * sideOff, centerPt.y + archH * 0.5 + 0.4, centerPt.z + right.z * sideOff);
              bkkRootGroup.add(hanger);
            }
          });

          if (i % 3 === 0 && archH > 5.0) {
            var crossBeam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.5, 0.6), whiteSteelMat);
            crossBeam.position.set(centerPt.x, centerPt.y + archH + 0.8, centerPt.z);
            crossBeam.rotation.y = yaw;
            bkkRootGroup.add(crossBeam);
          }
        }

        // Glowing warm street lamps along the bridge
        if (i % 3 === 0) {
          [-5.1, 5.1].forEach(function(sideOff) {
            var post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.4, 6), whiteSteelMat);
            post.position.set(centerPt.x + right.x * sideOff, centerPt.y + 1.8, centerPt.z + right.z * sideOff);
            bkkRootGroup.add(post);

            var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), lampGlowMat);
            bulb.position.set(centerPt.x + right.x * sideOff, centerPt.y + 3.6, centerPt.z + right.z * sideOff);
            bkkRootGroup.add(bulb);
          });
        }

        // Heavy river piers outside the main central navigation channel
        if (i === 6 || i === 10 || i === 18 || i === 23) {
          var pierH = centerPt.y + 4.5;
          var pier = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, pierH, 12), pierConcreteMat);
          pier.position.set(centerPt.x, centerPt.y - pierH * 0.5 - 0.4, centerPt.z);
          bkkRootGroup.add(pier);
        }
      }
    }

    // 1) Main Southern Grand Chao Phraya Tied-Arch Railway Bridge (after IconSiam)
    decorateBridgeSpan('J_BKK_ICONSIAM->J_BKK_WESTBANK', 15.5, true);
    // 2) Northern Return River Bridge (connecting Opposite Bank back behind Mom's House)
    decorateBridgeSpan('J_BKK_WESTBANK->J_BKK_ANANTARA', 9.5, true);
  })();

  // --------------------------------------------------------------------------
  // 6. ANANTARA HOTEL SHUTTLE BOAT (3D MODEL + SMOOTH SAILING + BRIDGE SYNC)
  //    Matches both the concept art and the real Bangkok photo:
  //    - Dark mahogany wooden hull with gold trim & "ANANTARA" on sides + bow
  //    - Curved dark Thai gable roof with golden chofah finials & "ANANTARA" on roof
  //    - Rooftop signboard ("ATTITUDE / ANANTARA RIVERSIDE")
  //    - Orange life buoys along railings, Thai flag & Anantara pennant
  //    - Captain + 6 waving passengers & trailing white water wake
  // --------------------------------------------------------------------------
  var anantaraBoatGroup = new THREE.Group();
  window.anantaraBoatGroup = anantaraBoatGroup;
  bkkRootGroup.add(anantaraBoatGroup);

  var boatWakeMeshes = [];
  var boatState = {
    z: -42.0,
    x: -446.0,
    yaw: 0.0,
    dir: 1, // +1 sailing South to IconSiam (+Z), -1 sailing North to Anantara (-Z)
    dockPauseTimer: 0.0,
    bridgeSyncActive: false,
    lastSyncTriggerTime: -999.0,
    lastHornTime: -999.0
  };

  (function buildAnantaraShuttleBoat() {
    var hullWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a1d0d, roughness: 0.45, metalness: 0.15 });
    var deckTeakMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
    var roofDarkMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45, metalness: 0.2 });
    var goldEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x854d0e,
      emissiveIntensity: 0.3
    });

    // Main Wooden Hull (16.5m long, 4.8m wide)
    var hullCenter = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.45, 11.6), hullWoodMat);
    hullCenter.position.y = 0.65;
    hullCenter.castShadow = true;
    anantaraBoatGroup.add(hullCenter);

    // Tapered Bow (+Z front) & Stern (-Z rear)
    var bowMesh = new THREE.Mesh(new THREE.ConeGeometry(3.25, 4.4, 4), hullWoodMat);
    bowMesh.rotation.x = Math.PI / 2;
    bowMesh.rotation.z = Math.PI / 4;
    bowMesh.scale.set(1.0, 1.0, 0.45);
    bowMesh.position.set(0, 0.72, 7.9);
    anantaraBoatGroup.add(bowMesh);

    var sternMesh = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.35, 2.4), hullWoodMat);
    sternMesh.position.set(0, 0.65, -6.8);
    anantaraBoatGroup.add(sternMesh);

    // Golden hull pinstripe & wooden passenger deck
    var goldBelt = new THREE.Mesh(new THREE.BoxGeometry(4.76, 0.18, 12.2), goldEdgeMat);
    goldBelt.position.y = 1.18;
    anantaraBoatGroup.add(goldBelt);

    var deckFloor = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.2, 13.4), deckTeakMat);
    deckFloor.position.y = 1.38;
    anantaraBoatGroup.add(deckFloor);

    // "ANANTARA" Signboards on Port, Starboard, and Front Bow
    var hullSignTex = createSignageTexture('ANANTARA', 'RIVERSIDE SHUTTLE', false, '#3b1508', '#facc15', '#fef08a');
    var hullSignMat = new THREE.MeshBasicMaterial({ map: hullSignTex });

    [-2.36, 2.36].forEach(function(sx) {
      var sideSign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.88), hullSignMat);
      sideSign.position.set(sx, 0.78, 0.4);
      sideSign.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      anantaraBoatGroup.add(sideSign);
    });

    var bowSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.72), hullSignMat);
    bowSign.position.set(0, 1.05, 6.25);
    anantaraBoatGroup.add(bowSign);

    // Wooden balustrade railings + 6 Orange & White Life Buoys along the sides
    var ringOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    [-2.05, 2.05].forEach(function(sx) {
      var topRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 11.8), hullWoodMat);
      topRail.position.set(sx, 2.15, -0.4);
      anantaraBoatGroup.add(topRail);

      for (var pIdx = -5; pIdx <= 4; pIdx++) {
        var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), hullWoodMat);
        pillar.position.set(sx, 2.55, pIdx * 1.15);
        anantaraBoatGroup.add(pillar);
      }

      [-3.2, 0.0, 3.2].forEach(function(bz) {
        var buoy = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 8, 16), ringOrangeMat);
        buoy.position.set(sx + (sx > 0 ? 0.1 : -0.1), 1.85, bz);
        buoy.rotation.y = Math.PI / 2;
        anantaraBoatGroup.add(buoy);
      });
    });

    // Curved Traditional Dark Thai Gable Roof with Golden Trim & "ANANTARA" Roof Logo (matching real photo!)
    var roofTex = createSignageTexture('ANANTARA', 'RIVERSIDE BANGKOK RESORT', true, '#27272a', '#facc15', '#fde047');
    var roofLogoMat = new THREE.MeshBasicMaterial({ map: roofTex });

    [-1, 1].forEach(function(sideSign) {
      var slope = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.16, 12.2), roofDarkMat);
      slope.position.set(sideSign * 1.15, 4.35, -0.2);
      slope.rotation.z = -sideSign * 0.52;
      slope.castShadow = true;
      anantaraBoatGroup.add(slope);

      var logoPanel = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.2), roofLogoMat);
      logoPanel.position.set(sideSign * 1.22, 4.46, -0.2);
      logoPanel.rotation.x = -Math.PI / 2;
      logoPanel.rotation.y = -sideSign * 0.52;
      logoPanel.rotation.z = sideSign > 0 ? -Math.PI / 2 : Math.PI / 2;
      anantaraBoatGroup.add(logoPanel);
    });

    var ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 12.6), goldEdgeMat);
    ridgeBeam.position.set(0, 5.05, -0.2);
    anantaraBoatGroup.add(ridgeBeam);

    // Golden Chofah Finials at front & rear roof peaks + Rooftop Signboard ("ATTITUDE")
    [-6.3, 5.9].forEach(function(rz) {
      var chofah = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.15, 6), goldEdgeMat);
      chofah.position.set(0, 5.55, rz);
      anantaraBoatGroup.add(chofah);
    });

    var topBoard = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 3.2), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    topBoard.position.set(0, 5.58, -0.2);
    anantaraBoatGroup.add(topBoard);

    // Thai Flag at the Stern + Dark Anantara Pennant Flag at the Bow
    function createBoatFlag(zPos, flagHex) {
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 6), goldEdgeMat);
      pole.position.set(0, 2.8, zPos);
      anantaraBoatGroup.add(pole);
      var cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.82),
        new THREE.MeshBasicMaterial({ color: flagHex, side: THREE.DoubleSide })
      );
      cloth.position.set(0, 3.65, zPos - 0.65);
      cloth.rotation.y = Math.PI / 2;
      anantaraBoatGroup.add(cloth);
    }
    createBoatFlag(-7.5, 0x1d4ed8);
    createBoatFlag(7.2, 0x1e293b);

    // Captain at the Helm + 6 Seated & Standing Waving Passengers
    var captain = createBangkokPerson(0x1e3a8a, 0x0f172a, 0xffffff, 1.05);
    captain.position.set(0, 1.45, 4.6);
    anantaraBoatGroup.add(captain);

    var passColors = [0xf43f5e, 0x38bdf8, 0xfacc15, 0x4ade80, 0xa855f7, 0xfb923c];
    for (var pi = 0; pi < 6; pi++) {
      var px = (pi % 2 === 0) ? -1.15 : 1.15;
      var pz = -3.4 + Math.floor(pi / 2) * 2.6;
      var passenger = createBangkokPerson(passColors[pi], 0x1e293b, (pi % 3 === 0 ? 0xfde047 : null), 0.98);
      passenger.position.set(px, 1.42, pz);
      passenger.rotation.y = (px > 0) ? Math.PI / 2 : -Math.PI / 2;
      anantaraBoatGroup.add(passenger);
    }

    // Warm Cabin Lantern Light for Night Cruises
    var cabinLight = new THREE.PointLight(0xfef08a, 1.1, 28);
    cabinLight.position.set(0, 3.8, 0);
    anantaraBoatGroup.add(cabinLight);
    bkkNightLights.push({ light: cabinLight, dayInt: 0.4, nightInt: 2.0 });

    // Trailing White Water Wake Foams behind the boat
    var wakeMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.68, side: THREE.DoubleSide });
    for (var wi = 1; wi <= 4; wi++) {
      var wakePlane = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + wi * 1.1, 2.2), wakeMat);
      wakePlane.rotation.x = -Math.PI / 2;
      wakePlane.position.set(0, 0.08, -7.2 - wi * 2.5);
      anantaraBoatGroup.add(wakePlane);
      boatWakeMeshes.push({ mesh: wakePlane, idx: wi });
    }
  })();

  // Procedural Web Audio Boat Horn & IconSiam Dancing Fountain Musical Chimes
  function playAnantaraBoatHornSound() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!window._bkkAudioCtx) window._bkkAudioCtx = new Ctx();
      var ctx = window._bkkAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      [185.0, 233.08].forEach(function(freq) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.08);
        gain.gain.setValueAtTime(0.11, now + 0.42);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.88);
      });
    } catch (e) {}
  }

  var lastFountainNoteMs = 0;
  var fountainNoteIdx = 0;
  var pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 880.0, 783.99];

  function playIconSiamFountainMusicStep(distToIconSiam, isEveningShow) {
    if (distToIconSiam > 92.0) return;
    var nowMs = performance.now();
    var stepInterval = isEveningShow ? 340 : 520;
    if (nowMs - lastFountainNoteMs < stepInterval) return;
    lastFountainNoteMs = nowMs;

    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!window._bkkAudioCtx) window._bkkAudioCtx = new Ctx();
      var ctx = window._bkkAudioCtx;
      if (ctx.state === 'suspended') return;

      var prox = Math.max(0.0, 1.0 - distToIconSiam / 92.0);
      var vol = prox * (isEveningShow ? 0.065 : 0.035);
      if (vol <= 0.003) return;

      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      var freq = pentatonicScale[fountainNoteIdx % pentatonicScale.length];
      fountainNoteIdx++;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // 7. PANORAMIC CAMERA CANDIDATES & FRAME-BY-FRAME ANIMATION UPDATE
  // --------------------------------------------------------------------------
  window.appendBangkokCameraCandidates = function(candidates, buildLargeLandmarkCandidate) {
    if (!Array.isArray(candidates) || typeof buildLargeLandmarkCandidate !== 'function') return;

    // 1) Anantara Riverside Bangkok Resort & Boat Pier
    var anantaraCand = buildLargeLandmarkCandidate({
      id: 'anantara',
      narrationId: 'anantara',
      center: new THREE.Vector3(-402.0, 6.0, -42.0),
      baseY: 2.2,
      height: 22.0,
      radius: 34.0,
      approachDist: 98.0,
      peakAheadDist: 24.0,
      peakBehindDist: -14.0,
      departDist: 52.0,
      maxPerpDist: 92.0,
      camBack: 56.0,
      camOppositeSide: 24.0,
      camHeight: 16.5,
      lookShare: 0.56,
      targetFov: 48.0,
      priority: 1.12
    });
    if (anantaraCand) candidates.push(anantaraCand);

    // 2) IconSiam Megacomplex, Ferris Wheel & Dancing Fountains
    var iconsiamCand = buildLargeLandmarkCandidate({
      id: 'iconsiam',
      narrationId: 'iconsiam',
      center: new THREE.Vector3(-406.0, 12.0, 142.0),
      baseY: 2.2,
      height: 36.0,
      radius: 42.0,
      approachDist: 112.0,
      peakAheadDist: 28.0,
      peakBehindDist: -16.0,
      departDist: 56.0,
      maxPerpDist: 96.0,
      camBack: 64.0,
      camOppositeSide: 28.0,
      camHeight: 18.5,
      lookShare: 0.58,
      targetFov: 49.5,
      priority: 1.18
    });
    if (iconsiamCand) candidates.push(iconsiamCand);

    // 3) Grand Chao Phraya Tied-Arch Railway Bridge (+ Synchronized Anantara Boat on the River!)
    var bridgeCand = buildLargeLandmarkCandidate({
      id: 'bkk_bridge',
      narrationId: 'bkk_bridge',
      center: new THREE.Vector3(-472.0, 10.5, 250.0),
      baseY: 0.0,
      height: 28.0,
      radius: 48.0,
      approachDist: 108.0,
      peakAheadDist: 26.0,
      peakBehindDist: -18.0,
      departDist: 54.0,
      maxPerpDist: 96.0,
      camBack: 62.0,
      camOppositeSide: 26.0,
      camHeight: 21.0,
      lookShare: 0.54,
      targetFov: 50.0,
      priority: 1.15
    });
    if (bridgeCand) candidates.push(bridgeCand);

    // 4) Anantara Shuttle Boat (when sailing along the open river between Anantara & IconSiam)
    if (window.anantaraBoatGroup) {
      var boatCand = buildLargeLandmarkCandidate({
        id: 'anantara_boat',
        narrationId: 'anantara_boat',
        center: window.anantaraBoatGroup.position.clone().add(new THREE.Vector3(0, 3.0, 0)),
        baseY: riverWaterY,
        height: 8.0,
        radius: 14.0,
        approachDist: 75.0,
        peakAheadDist: 16.0,
        peakBehindDist: -10.0,
        departDist: 38.0,
        maxPerpDist: 105.0,
        camBack: 50.0,
        camOppositeSide: 20.0,
        camHeight: 15.0,
        lookShare: 0.48,
        targetFov: 47.0,
        priority: 1.02
      });
      if (boatCand) candidates.push(boatCand);
    }
  };

  var lastBkkFrameMs = performance.now();

  function updateBangkokChaoPhrayaWorld() {
    var nowMs = performance.now();
    var dt = Math.min(0.08, Math.max(0.001, (nowMs - lastBkkFrameMs) * 0.001));
    lastBkkFrameMs = nowMs;
    var tSec = nowMs * 0.001;

    var trainPos = (typeof playerLoco !== 'undefined' && playerLoco)
      ? playerLoco.position
      : ((window.playerLoco && window.playerLoco.position) ? window.playerLoco.position : null);
    var curEdgeId = (window.pState && window.pState.edge) ? window.pState.edge.id : '';
    var curT = (window.pState && typeof window.pState.t === 'number') ? window.pState.t : 0.0;

    // 1) Animate Chao Phraya River ripples
    for (var ri = 0; ri < riverWaveStrips.length; ri++) {
      var rw = riverWaveStrips[ri];
      rw.mesh.position.z = rw.baseZ + Math.sin(tSec * 1.4 + rw.phase) * 1.8;
      rw.mesh.material.opacity = 0.24 + 0.16 * Math.sin(tSec * 2.2 + rw.phase);
    }

    // 2) Rotate the IconSiam Riverfront Ferris Wheel smoothly
    if (iconsiamFerrisWheelWheel) {
      iconsiamFerrisWheelWheel.rotation.x = tSec * 0.28;
    }

    // 3) Day / Sunset / Night Detection for IconSiam Illumination & Dancing Fountains
    var gTime = (typeof gameTimeSeconds === 'number')
      ? ((gameTimeSeconds / 300.0) * 24.0)
      : ((typeof window.gameTime === 'number') ? window.gameTime : 12.0);
    var isEveningOrNight = (gTime >= 17.0 || gTime <= 6.5);

    for (var ni = 0; ni < bkkNightLights.length; ni++) {
      var nl = bkkNightLights[ni];
      if (nl.mat) {
        nl.mat.emissive.setHex(isEveningOrNight ? nl.nightHex : nl.dayHex);
        nl.mat.emissiveIntensity = isEveningOrNight ? nl.nightInt : nl.dayInt;
      } else if (nl.light) {
        nl.light.intensity = isEveningOrNight ? nl.nightInt : nl.dayInt;
      }
    }

    // 4) Animate IconSiam's "The ICONIC Multimedia Water Features" Dancing Fountains & Music
    var distToIconSiam = (trainPos && window.iconsiamWorldCenter)
      ? trainPos.distanceTo(window.iconsiamWorldCenter)
      : 999.0;
    var fountainEnergy = isEveningOrNight ? 1.35 : (distToIconSiam < 120.0 ? 1.0 : 0.55);

    for (var fi = 0; fi < iconsiamFountainJets.length; fi++) {
      var fj = iconsiamFountainJets[fi];
      var wave = 0.45 + 0.55 * Math.abs(Math.sin(tSec * 3.4 + fj.index * 0.45));
      var sy = Math.max(0.2, wave * fountainEnergy);
      fj.meshE.scale.y = sy;
      fj.meshE.position.y = 2.2 + sy * 2.75;
      fj.meshW.scale.y = sy * 1.1;
      fj.meshW.position.y = 2.2 + sy * 3.1;
    }
    if (trainPos) {
      playIconSiamFountainMusicStep(distToIconSiam, isEveningOrNight);
    }

    // 5) Animate Waving People on Piers, Promenade & Anantara Boat
    for (var wi = 0; wi < bkkWavingPeople.length; wi++) {
      var wp = bkkWavingPeople[wi];
      wp.armPivot.rotation.z = wp.baseZ + Math.sin(tSec * 6.5 + wp.phase) * 0.45;
    }

    // 6) Anantara Hotel Shuttle Boat Movement + Synchronized Bridge Departure Moment!
    // Check if the player train is approaching IconSiam / the Grand Railway Bridge:
    var approachingBridgeFromIconSiam = (
      (curEdgeId === 'J_BKK_ANANTARA->J_BKK_ICONSIAM' && curT > 0.72) ||
      (curEdgeId === 'J_BKK_ICONSIAM->J_BKK_WESTBANK' && curT < 0.65)
    );

    if (approachingBridgeFromIconSiam && !boatState.bridgeSyncActive && (tSec - boatState.lastSyncTriggerTime) > 18.0) {
      // Trigger the live synchronized moment: Boat is at IconSiam Pier, blows its horn,
      // and sails out toward the river & railway bridge alongside the train!
      boatState.bridgeSyncActive = true;
      boatState.lastSyncTriggerTime = tSec;
      boatState.z = Math.max(138.0, Math.min(165.0, boatState.z));
      boatState.dir = 1;
      boatState.dockPauseTimer = 0.0;
      playAnantaraBoatHornSound();
    } else if (!approachingBridgeFromIconSiam && boatState.bridgeSyncActive && boatState.z > 228.0) {
      boatState.bridgeSyncActive = false;
    }

    // Also toot the boat horn warmly if the player train passes close to the boat
    if (trainPos && trainPos.distanceTo(anantaraBoatGroup.position) < 68.0 && (tSec - boatState.lastHornTime) > 16.0) {
      boatState.lastHornTime = tSec;
      playAnantaraBoatHornSound();
    }

    var minDockZ = -42.0; // Anantara Pier
    var maxDockZ = boatState.bridgeSyncActive ? 236.0 : 142.0; // IconSiam Pier (or 236m out under the Bridge during sync!)

    if (boatState.dockPauseTimer > 0) {
      boatState.dockPauseTimer -= dt;
    } else {
      var cruiseSpeed = boatState.bridgeSyncActive ? 17.5 : 13.5; // m/s
      boatState.z += boatState.dir * cruiseSpeed * dt;

      if (boatState.z >= maxDockZ) {
        boatState.z = maxDockZ;
        boatState.dir = -1;
        boatState.bridgeSyncActive = false;
        boatState.dockPauseTimer = 2.6;
      } else if (boatState.z <= minDockZ) {
        boatState.z = minDockZ;
        boatState.dir = 1;
        boatState.dockPauseTimer = 2.6;
      }
    }

    // Pull smoothly into the East Bank piers (`x = -433.5`) when near Anantara (`z = -42`) or IconSiam (`z = 142`),
    // and cruise in the navigable river channel (`x ≈ -452`) in between
    var distToAnantaraDock = Math.abs(boatState.z - (-42.0));
    var distToIconSiamDock = Math.abs(boatState.z - 142.0);
    var dockPull = 0.0;
    if (distToAnantaraDock < 22.0) {
      dockPull = 1.0 - (distToAnantaraDock / 22.0);
    } else if (!boatState.bridgeSyncActive && distToIconSiamDock < 22.0) {
      dockPull = 1.0 - (distToIconSiamDock / 22.0);
    }
    var channelX = getChaoPhrayaCenterX(boatState.z) + 18.0;
    var pierSideX = -433.5;
    var targetBoatX = channelX * (1.0 - dockPull) + pierSideX * dockPull;

    var prevX = boatState.x;
    boatState.x += (targetBoatX - boatState.x) * Math.min(1.0, dt * 3.5);

    var targetYaw = (boatState.dir > 0) ? 0.0 : Math.PI;
    var dxStep = boatState.x - prevX;
    targetYaw += Math.max(-0.35, Math.min(0.35, dxStep * 2.5 * boatState.dir));

    // Shortest-angle smooth yaw interpolation
    var yawDiff = targetYaw - boatState.yaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    boatState.yaw += yawDiff * Math.min(1.0, dt * 4.2);

    anantaraBoatGroup.position.set(
      boatState.x,
      riverWaterY + 0.12 + Math.sin(tSec * 2.6) * 0.08,
      boatState.z
    );
    anantaraBoatGroup.rotation.y = boatState.yaw;
    anantaraBoatGroup.rotation.z = Math.sin(tSec * 2.1) * 0.025;
    anantaraBoatGroup.rotation.x = Math.cos(tSec * 1.8) * 0.018;

    // Pulse water wake foam behind the boat when moving
    var isBoatMoving = (boatState.dockPauseTimer <= 0.05);
    for (var wki = 0; wki < boatWakeMeshes.length; wki++) {
      var wm = boatWakeMeshes[wki];
      wm.mesh.visible = isBoatMoving;
      if (isBoatMoving) {
        var pulse = 0.85 + 0.25 * Math.sin(tSec * 7.0 - wm.idx * 1.1);
        wm.mesh.scale.set(pulse, pulse, 1.0);
      }
    }
  }

  // Hook into `renderer.render` so the Bangkok river, boat, Ferris wheel, and fountains animate every frame
  if (typeof renderer !== 'undefined' && renderer && renderer.render) {
    var prevRenderBkk = renderer.render.bind(renderer);
    renderer.render = function(sceneArg, cameraArg) {
      try {
        updateBangkokChaoPhrayaWorld();
      } catch (e) {}
      return prevRenderBkk(sceneArg, cameraArg);
    };
  }
})();



