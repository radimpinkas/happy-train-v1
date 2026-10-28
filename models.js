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
  var bronzeMat = new THREE.MeshStandardMaterial({ map: latticeTex, color: 0xd97706, roughness: 0.34, metalness: 0.58 });
  var solidBronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.36, metalness: 0.62 });
  var goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.26, metalness: 0.68 });
  var deckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.42, metalness: 0.42 });
  var stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 });
  var warmStoneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.48 });
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

  scene.add(g);

  // Cheerful Parisian Visitors waving near the plaza on the flat plain
  spawnPerson(ex + 18, ey, ez + 18, 0xef4444, 0x1e3a8a, false, 1.45, 0.4);
  spawnPerson(ex - 16, ey, ez + 20, 0x38bdf8, null, false, 1.42, -0.3);

  // Wide panoramic perspective framing the ENTIRE 77m Eiffel Tower from base legs to top spire + the train!
  // Handled with a smooth 5-second timer (`5000 ms`) in `installModelsFrameEnhancer()` so it never stays locked too long!
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

  var frontLookX = mx + 6.5 * sinH;
  var frontLookZ = mz + 6.5 * cosH;
  window.registerLandmarkShowcase('J_WEST', 'J_NW', {
    lookTarget: new THREE.Vector3(frontLookX, my + 5.5, frontLookZ),
    camHeight: 16.5,
    camBack: 32,
    camSide: -24,
    lookLerp: 0.68
  });
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

  var frontLookGX = gx + 4.0 * sinG;
  var frontLookGZ = gz + 4.0 * cosG;
  window.registerLandmarkShowcase('J_NORTH', 'J_NE', {
    lookTarget: new THREE.Vector3(frontLookGX, gy + 9.5, frontLookGZ),
    camHeight: 22.0,
    camBack: 44,
    camSide: -30,
    lookLerp: 0.62
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

// 2) Wrap `renderer.render` so every frame right before WebGL draw:
//    - AI trains never deadlock with Toby inside turnouts/junctions (fixes train stopping at Jewel!).
//    - Jewel camera looks smoothly FORWARD along the track at high elevation (showing all 7 floors & full waterfall without spinning!).
//    - Eiffel Tower camera frames the ENTIRE 77m tower from legs to top antenna even while approaching J_NW!
(function installModelsFrameEnhancer() {
  if (typeof renderer === 'undefined' || !renderer || !renderer.render || renderer._modelsEnhanced) return;
  renderer._modelsEnhanced = true;
  var origRender = renderer.render.bind(renderer);

  renderer.render = function(sceneArg, cameraArg) {
    try {
      // A) Prevent mutual AI-train / Player-train turnout deadlock at Jewel & all junctions
      if (window.aiTrains && window.pState && window.playerLoco) {
        for (var aii = 0; aii < window.aiTrains.length; aii++) {
          var ai = window.aiTrains[aii];
          if (!ai || !ai.edge) continue;
          var nearPlayer = ai.loco && ai.loco.position && (ai.loco.position.distanceTo(window.playerLoco.position) < 30.0);
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

      // A2) Animate Automatic Airport Parking Barrier Boom (`window.airportParkingBarrier`)
      //     Raises smoothly whenever any road vehicle (`livingVehicles` on `loopIdx = 2` or `airportShuttleBuses`)
      //     approaches the parking entrance, and lowers once it passes!
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
        // Rotate around X axis from 0 (horizontal across road) to -Math.PI * 0.44 (vertical open!)
        apb.pivot.rotation.x = -apb.openAmount * Math.PI * 0.44;
        if (apb.statusMat) {
          apb.statusMat.color.setHex(apb.openAmount > 0.25 ? 0x22c55e : 0xef4444);
        }
      }

      // B) 3-Stage Cinematic Camera for Jewel (`5s pre-entry high pull-back` -> `top-of-dome interior follow` + `3s waterfall close-up`)
      //    & 5-Second Smooth Camera Showcase for Eiffel Tower
      if (window.pState && window.pState.edge && window.playerLoco && window.smoothCamPos && window.smoothCamLook && cameraArg) {
        if (!window._enhancerCamPos) {
          window._enhancerCamPos = window.smoothCamPos.clone();
          window._enhancerCamLook = window.smoothCamLook.clone();
        }

        var curEdge = window.pState.edge;
        var baseEdge = curEdge.isTurnout ? curEdge.targetEdge : curEdge;
        var edgeId = baseEdge ? baseEdge.id : curEdge.id;
        var pos = window.playerLoco.position;
        var ct = Math.max(0, Math.min(1, window.pState.t || 0));
        var tan = (curEdge.curve && curEdge.curve.getTangentAt)
          ? curEdge.curve.getTangentAt(ct).normalize()
          : new THREE.Vector3(0, 0, 1);
        var perpVec = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

        // Standard driving camera baseline
        var normalCamPos = pos.clone()
          .sub(tan.clone().multiplyScalar(54.0))
          .add(perpVec.clone().multiplyScalar(36.0))
          .add(new THREE.Vector3(0, 38.0, 0));
        var normalCamLook = pos.clone()
          .add(tan.clone().multiplyScalar(12.0))
          .add(new THREE.Vector3(0, 2.5, 0));

        // ====================================================================
        // 1. JEWEL CHANGI CINEMATIC CAMERA CHOREOGRAPHY + 3-SECOND WATERFALL CLOSE-UP:
        //    - STAGE 1 (5 seconds before entering Jewel):
        //      Camera pulls back (`68m`) and rises high (`+44m`) behind the train, framing the train on the
        //      elevated Skytrain bridge, the opening glass portal doors, and the entire toroidal Jewel dome!
        //    - STAGE 2 (Inside Jewel):
        //      Camera glides into the top of the dome (`od vrcholu kopule`, `+30.5m` above track) and follows
        //      the train, capturing the entire Jewel interior!
        //    - STAGE 3 (Special 3-Second Close-Up on the Rain Vortex Waterfall):
        //      When the train reaches the heart of Jewel (`ct >= 0.34`), the camera glides in for a dedicated
        //      3.0-second close-up shot purely of the cascading Rain Vortex waterfall, glowing turquoise plunge
        //      pool, rising mist, and roof Oculus, synchronized with realistic cascading waterfall sound!
        // ====================================================================
        var isApproachingJewel = false;
        var isInsideJewel = false;
        var approachingSouthPortal = false;
        var distToJewelPortal = 999.0;

        if (!window.pState.inSubway && window.jewelDomeCenterWorld && window.jewelNorthPortalPos && window.jewelSouthPortalPos) {
          if (!curEdge.isTurnout && (edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST')) {
            approachingSouthPortal = (edgeId === 'J_SE->J_EAST');
            var jLen = (curEdge.curve && curEdge.curve.getLength) ? (curEdge.curve.getLength() || 200.0) : 200.0;
            if (ct < 0.20) {
              isApproachingJewel = true;
              distToJewelPortal = (0.20 - ct) * jLen;
            } else if (ct <= 0.88) {
              isInsideJewel = true;
              distToJewelPortal = 0.0;
            }
          } else if (curEdge.isTurnout && (edgeId === 'J_EAST->J_SE' || edgeId === 'J_SE->J_EAST')) {
            approachingSouthPortal = (edgeId === 'J_SE->J_EAST');
            var tLen = (curEdge.curve && curEdge.curve.getLength) ? (curEdge.curve.getLength() || 62.0) : 62.0;
            isApproachingJewel = true;
            distToJewelPortal = Math.max(0.0, 1.0 - ct) * tLen + 8.0;
          } else if (!curEdge.isTurnout && (curEdge.to === 'J_EAST' || curEdge.to === 'J_SE') && window.getBranches) {
            var brJ = window.getBranches(curEdge);
            var nextJ = brJ ? (brJ[window.pState.switchChoice] || brJ.straight) : null;
            if (nextJ && (nextJ.id === 'J_EAST->J_SE' || nextJ.id === 'J_SE->J_EAST')) {
              approachingSouthPortal = (nextJ.id === 'J_SE->J_EAST');
              var aLen = (curEdge.curve && curEdge.curve.getLength) ? (curEdge.curve.getLength() || 200.0) : 200.0;
              var remCur = Math.max(0.0, 0.84 - ct) * aLen;
              distToJewelPortal = remCur + 70.0;
              isApproachingJewel = true;
            }
          }
        }

        var nowMs = performance.now();
        if (isInsideJewel) {
          if (ct >= 0.34 && !window._waterfallCloseUpTriggeredInPass) {
            window._waterfallCloseUpTriggeredInPass = true;
            window._waterfallCloseUpStartMs = nowMs;
          }
        } else {
          window._waterfallCloseUpTriggeredInPass = false;
        }

        var targetWfCloseUpBlend = 0.0;
        var wfProgress = 0.0;
        if (isInsideJewel && window._waterfallCloseUpStartMs) {
          var elapsedWfMs = nowMs - window._waterfallCloseUpStartMs;
          if (elapsedWfMs >= 0 && elapsedWfMs <= 3000) {
            wfProgress = elapsedWfMs / 3000.0;
            if (elapsedWfMs < 520) {
              var uWfIn = elapsedWfMs / 520.0;
              targetWfCloseUpBlend = uWfIn * uWfIn * (3.0 - 2.0 * uWfIn);
            } else if (elapsedWfMs > 2480) {
              var uWfOut = (3000.0 - elapsedWfMs) / 520.0;
              targetWfCloseUpBlend = uWfOut * uWfOut * (3.0 - 2.0 * uWfOut);
            } else {
              targetWfCloseUpBlend = 1.0;
            }
          }
        }
        window._jewelWfCloseUpBlend = (window._jewelWfCloseUpBlend || 0.0) + (targetWfCloseUpBlend - (window._jewelWfCloseUpBlend || 0.0)) * 0.14;

        var speedMps = Math.max(12.0, Math.abs(window.pState.currentVel || 0.25) * 60.0);
        var secondsToPortal = distToJewelPortal / speedMps;

        var targetJewelMasterBlend = 0.0;
        var targetStage2Blend = 0.0;

        if (isApproachingJewel && secondsToPortal <= 5.0) {
          // Stage 1: Ramp up smoothly starting 5.0 seconds before entering the Jewel portal!
          var uPre = Math.max(0.0, Math.min(1.0, (5.0 - secondsToPortal) / 1.25));
          targetJewelMasterBlend = uPre * uPre * (3.0 - 2.0 * uPre);
          targetStage2Blend = 0.0;
        } else if (isInsideJewel) {
          // Stage 2: Inside Jewel — transition smoothly from Stage 1 (pre-entry high pull-back) to Stage 2 (top-of-dome interior follow)
          if (ct > 0.78) {
            var uExit = Math.max(0.0, Math.min(1.0, (0.88 - ct) / 0.10));
            targetJewelMasterBlend = uExit * uExit * (3.0 - 2.0 * uExit);
          } else {
            targetJewelMasterBlend = 1.0;
          }
          var uInDome = Math.max(0.0, Math.min(1.0, (ct - 0.19) / 0.10));
          targetStage2Blend = uInDome * uInDome * (3.0 - 2.0 * uInDome);
        }

        window._jewelCamBlend = (window._jewelCamBlend || 0.0) + (targetJewelMasterBlend - (window._jewelCamBlend || 0.0)) * 0.09;
        window._jewelStage2Blend = (window._jewelStage2Blend || 0.0) + (targetStage2Blend - (window._jewelStage2Blend || 0.0)) * 0.08;

        // Update Realistic Jewel Waterfall Sound (swells to full close-up waterfall roar during the 3s waterfall showcase!)
        if (window.updateJewelWaterfallAudio) {
          var distToVortex = window.jewelVortexWorldPos ? pos.distanceTo(window.jewelVortexWorldPos) : 999.0;
          var proximityGain = (!window.pState.inSubway && distToVortex < 95.0)
            ? Math.pow(Math.max(0.0, 1.0 - distToVortex / 95.0), 1.6) * 0.18
            : 0.0;
          var insideBoost = isInsideJewel ? 0.22 : 0.0;
          var closeUpBoost = (window._jewelWfCloseUpBlend || 0.0) * 0.44;
          var targetWfVol = Math.min(0.48, Math.max(proximityGain, insideBoost) + closeUpBoost);
          window.updateJewelWaterfallAudio(targetWfVol, window._jewelWfCloseUpBlend || 0.0);
        }

        // Smoothly adjust glass dome shell opacity so from outside (Stage 1) the building glass is crisp & solid (0.64),
        // and when inside at the top of the dome (Stage 2) the interior is 100% vivid and unobstructed (0.28)!
        if (window.jewelGlassDomeMat) {
          var desiredDomeOpacity = 0.64 - (window._jewelCamBlend * window._jewelStage2Blend) * 0.36;
          window.jewelGlassDomeMat.opacity += (desiredDomeOpacity - window.jewelGlassDomeMat.opacity) * 0.12;
        }

        var activeCustomBlend = 0.0;
        var customTargetCam = normalCamPos;
        var customTargetLook = normalCamLook;

        if (window._jewelCamBlend > 0.003 && window.jewelInwardLeftVec && window.jewelDomeCenterWorld && window.jewelVortexWorldPos) {
          var inwardLeft = window.jewelInwardLeftVec;
          var portalTargetPos = approachingSouthPortal ? window.jewelSouthPortalPos : window.jewelNorthPortalPos;
          var domeEntryFocus = portalTargetPos.clone().lerp(window.jewelDomeCenterWorld, 0.36);

          var toPortalDir = domeEntryFocus.clone().sub(pos);
          toPortalDir.y = 0;
          if (toPortalDir.lengthSq() > 0.001) toPortalDir.normalize();
          else toPortalDir.copy(tan);

          var chaseForward = tan.clone().lerp(toPortalDir, 0.65).normalize();

          // STAGE 1 CAMERA: High (`+44m`) and pulled back (`68m`) behind the train, capturing the train
          // on the Skytrain viaduct entering the Jewel building through the opening sliding glass doors!
          var stage1CamPos = pos.clone()
            .sub(chaseForward.clone().multiplyScalar(68.0))
            .sub(inwardLeft.clone().multiplyScalar(8.5))
            .add(new THREE.Vector3(0, 44.0, 0));
          var stage1CamLook = pos.clone()
            .lerp(domeEntryFocus, 0.54)
            .add(new THREE.Vector3(0, 10.5, 0));

          // STAGE 2 CAMERA: At the top of the dome (`od vrcholu kopule`, `y = domeCenter.y + 30.5m`) following
          // the train and looking down across the entire Jewel interior (Oculus, Rain Vortex waterfall,
          // turquoise plunge pool, 6 stepped rainforest terraces, shops, `JEWEL` living wall, and the train)!
          var domeCrownY = window.jewelDomeCenterWorld.y + 30.5;
          var followPos = pos.clone()
            .sub(tan.clone().multiplyScalar(34.0))
            .add(inwardLeft.clone().multiplyScalar(5.0));
          var crownAnchor = window.jewelDomeCenterWorld.clone()
            .sub(tan.clone().multiplyScalar(18.0))
            .add(inwardLeft.clone().multiplyScalar(4.0));
          var stage2CamPos = followPos.clone().lerp(crownAnchor, 0.38);
          stage2CamPos.y = domeCrownY;

          var trainLookAhead = pos.clone()
            .add(tan.clone().multiplyScalar(8.0))
            .add(new THREE.Vector3(0, 2.5, 0));
          var stage2CamLook = trainLookAhead.clone().lerp(window.jewelVortexWorldPos, 0.56);

          // STAGE 3 CAMERA (3-SECOND WATERFALL CLOSE-UP):
          // Positioned inside the atrium right in front of the HSBC Rain Vortex waterfall (`16.2m` in front of the vortex),
          // framing ONLY the cascading water funnel, glowing turquoise plunge pool, rising mist, and roof Oculus!
          var wfLateralSweep = Math.sin(wfProgress * Math.PI * 2.0) * 3.8;
          var wfCloseUpCamPos = window.jewelVortexWorldPos.clone()
            .sub(inwardLeft.clone().multiplyScalar(16.2))
            .add(tan.clone().multiplyScalar(wfLateralSweep - 2.0));
          wfCloseUpCamPos.y = window.jewelDomeCenterWorld.y + 11.5 + wfProgress * 4.5;

          var wfCloseUpCamLook = window.jewelVortexWorldPos.clone();
          wfCloseUpCamLook.y = window.jewelDomeCenterWorld.y + 10.5 + Math.sin(wfProgress * Math.PI) * 7.5;

          var interiorCamPos = stage2CamPos.clone().lerp(wfCloseUpCamPos, window._jewelWfCloseUpBlend || 0.0);
          var interiorCamLook = stage2CamLook.clone().lerp(wfCloseUpCamLook, window._jewelWfCloseUpBlend || 0.0);

          var jewelCombinedCam = stage1CamPos.clone().lerp(interiorCamPos, window._jewelStage2Blend);
          var jewelCombinedLook = stage1CamLook.clone().lerp(interiorCamLook, window._jewelStage2Blend);

          customTargetCam = normalCamPos.clone().lerp(jewelCombinedCam, window._jewelCamBlend);
          customTargetLook = normalCamLook.clone().lerp(jewelCombinedLook, window._jewelCamBlend);
          activeCustomBlend = window._jewelCamBlend;
        }

        // ====================================================================
        // 2. EIFFEL TOWER 5-SECOND SMOOTH CAMERA SHOWCASE:
        // ====================================================================
        if (window.eiffelWorldCenter && !window.pState.inSubway) {
          var isOnEiffelTrack = (edgeId === 'J_NW->J_NORTH' || edgeId === 'J_NORTH->J_NW') && !curEdge.isTurnout && ct >= 0.12 && ct <= 0.88;

          if (isOnEiffelTrack) {
            if (!window._wasOnEiffelTrack) {
              window._wasOnEiffelTrack = true;
              window._eiffelShowcaseStartMs = nowMs;
            }
          } else {
            window._wasOnEiffelTrack = false;
          }

          var targetEiffelBlend = 0.0;
          if (isOnEiffelTrack && window._eiffelShowcaseStartMs) {
            var elapsedEiffelMs = nowMs - window._eiffelShowcaseStartMs;
            if (elapsedEiffelMs >= 0 && elapsedEiffelMs <= 5000) {
              if (elapsedEiffelMs < 1100) {
                var uIn = elapsedEiffelMs / 1100.0;
                targetEiffelBlend = uIn * uIn * (3.0 - 2.0 * uIn);
              } else if (elapsedEiffelMs > 3900) {
                var uOut = (5000.0 - elapsedEiffelMs) / 1100.0;
                targetEiffelBlend = uOut * uOut * (3.0 - 2.0 * uOut);
              } else {
                targetEiffelBlend = 1.0;
              }
            }
          }

          window._eiffelCamBlend = (window._eiffelCamBlend || 0.0) + (targetEiffelBlend - (window._eiffelCamBlend || 0.0)) * 0.09;

          if (window._eiffelCamBlend > 0.003 && activeCustomBlend < 0.01) {
            var toEiffel = window.eiffelWorldCenter.clone().sub(pos);
            var horizToEiffel = new THREE.Vector3(toEiffel.x, 0, toEiffel.z);
            if (horizToEiffel.lengthSq() < 0.001) horizToEiffel.set(0, 0, -1);
            horizToEiffel.normalize();

            var targetCamEiffel = pos.clone()
              .sub(tan.clone().multiplyScalar(92.0))
              .sub(horizToEiffel.clone().multiplyScalar(96.0))
              .add(new THREE.Vector3(0, 32.0, 0));

            var eiffelMidSpire = new THREE.Vector3(
              window.eiffelWorldCenter.x,
              window.eiffelWorldCenter.y + 39.0,
              window.eiffelWorldCenter.z
            );
            var targetLookEiffel = pos.clone()
              .add(tan.clone().multiplyScalar(8.0))
              .add(new THREE.Vector3(0, 6.0, 0))
              .lerp(eiffelMidSpire, 0.72);

            customTargetCam = normalCamPos.clone().lerp(targetCamEiffel, window._eiffelCamBlend);
            customTargetLook = normalCamLook.clone().lerp(targetLookEiffel, window._eiffelCamBlend);
            activeCustomBlend = window._eiffelCamBlend;
          }
        }

        // Apply custom camera smoothly without any tug-of-war against `game.js`
        if (activeCustomBlend > 0.003) {
          var camLerpSpeed = (window._jewelWfCloseUpBlend && window._jewelWfCloseUpBlend > 0.05) ? 0.18 : 0.14;
          var lookLerpSpeed = (window._jewelWfCloseUpBlend && window._jewelWfCloseUpBlend > 0.05) ? 0.20 : 0.16;
          window._enhancerCamPos.lerp(customTargetCam, camLerpSpeed);
          window._enhancerCamLook.lerp(customTargetLook, lookLerpSpeed);
          window.smoothCamPos.copy(window._enhancerCamPos);
          window.smoothCamLook.copy(window._enhancerCamLook);
          cameraArg.position.copy(window._enhancerCamPos);
          cameraArg.lookAt(window._enhancerCamLook);
        } else {
          window._enhancerCamPos.copy(window.smoothCamPos);
          window._enhancerCamLook.copy(window.smoothCamLook);
        }
      }
    } catch (err) {}

    return origRender(sceneArg, cameraArg);
  };
})();

// ============================================================================
// REALISTIC ACOUSTIC WATERFALL SOUND ENGINE (For Jewel Rain Vortex) &
// AUTHENTIC MULTI-CHIME STEAM LOCOMOTIVE WHISTLE (`window.playTrainHorn`)
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
          // Seamless loop crossfade angle
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

          // Organic water stream surging modulation (seamless over 4.0s loop)
          var surge1 = 0.86 + 0.14 * Math.sin(loopAng * 2.0 + ch * 1.1);
          var surge2 = 0.90 + 0.10 * Math.cos(loopAng * 5.0 - ch * 0.8);
          var dropletSparkle = white * 0.065 * (0.75 + 0.25 * Math.sin(loopAng * 11.0 + t * 3.0));

          data[i] = (deepRumble * surge1 + pink * surge2 + dropletSparkle) * 0.85;
        }
      }

      var src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      // Warm resonant filter that opens up as the camera moves into the 3-second waterfall close-up
      var lpFilter = audioCtx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);
      lpFilter.Q.setValueAtTime(0.65, audioCtx.currentTime);

      // Plunge pool body resonance around 185 Hz
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

    // Open filter brightness during the 3s waterfall close-up so individual cascading water streams & splashes shine
    var targetCutoff = 1650 + (closeUpBlend || 0.0) * 3600;
    wfNodes.lpFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
  };

  // ==========================================================================
  // AUTHENTIC HERITAGE STEAM LOCOMOTIVE WHISTLE (`window.playTrainHorn`)
  // Multi-chamber cylindrical brass bell chord + steam pressure pitch bend +
  // boiler vibrato + high-pressure steam valve hiss + outdoor valley echo!
  // ==========================================================================
  var cachedBrassWave = null;
  var cachedWarmShaperCurve = null;

  function getSteamBrassPeriodicWave(ctx) {
    if (cachedBrassWave) return cachedBrassWave;
    // Cylindrical stopped brass whistle pipe harmonic spectrum (strong fundamental + rich 2nd/3rd/4th/5th/6th harmonics)
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

    // Trigger the signature glossy iridescent chimney steam/bubble bursts
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

    // Master Whistle Acoustic Chain: Resonant Horn Body Filter -> Warm Brass Saturation -> Valley Echo + Dry Out
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

    // Outdoor Valley Echo (dual-tap warm acoustic reflection)
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

    // Connect Valley Echo taps
    masterWhistleGain.connect(echoFilter);
    echoFilter.connect(echoDelay1);
    echoDelay1.connect(echoGain1);
    echoGain1.connect(audioCtx.destination);
    echoFilter.connect(echoDelay2);
    echoDelay2.connect(echoGain2);
    echoGain2.connect(audioCtx.destination);

    // Authentic 5-Chime Heritage Steam Whistle Tuning (Rich C#6/9 / E-major/minor blend with natural pipe detuning)
    // Plus a deep sub-harmonic boiler pipe resonance (146.83 Hz) for unmistakable heavy steam locomotive weight!
    var chimePipes = [
      { freq: 146.83, weight: 0.42, detune: -3.0 }, // Deep boiler resonance pipe (D3)
      { freq: 293.66, weight: 1.00, detune:  0.0 }, // Main long bell chamber (D4)
      { freq: 349.23, weight: 0.88, detune: +4.5 }, // Minor third / warm chime chamber (F4)
      { freq: 440.00, weight: 0.92, detune: -2.5 }, // Fifth chime chamber (A4)
      { freq: 523.25, weight: 0.68, detune: +3.5 }, // Seventh chime chamber (C5)
      { freq: 587.33, weight: 0.50, detune: -4.0 }  // High crown chamber (D5)
    ];

    // Two expressive steam lever pulls: "WHOOOO — WHOOOOOOOO-ooo"
    var pulls = [
      { start: 0.02, dur: 0.44, level: 0.92, tailDrop: 0.965 },
      { start: 0.54, dur: 0.88, level: 1.00, tailDrop: 0.925 }
    ];

    // Natural steam boiler pressure vibrato LFO (~5.8 Hz)
    var vibLfo = audioCtx.createOscillator();
    vibLfo.type = 'sine';
    vibLfo.frequency.setValueAtTime(5.8, now);
    var vibGain = audioCtx.createGain();
    vibGain.gain.setValueAtTime(2.6, now); // +/- 2.6 Hz organic pressure flutter
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

        // Steam pressure pitch envelope: scoops up as valve opens, holds steady, then sighs downward as valve closes!
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

    // High-Pressure Steam Jet & Valve Chuff Layer (starts 20ms before the brass bells speak, just like real steam!)
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

      // Turbulent aperture hiss filter (1750 Hz bandpass)
      var jetFilter = audioCtx.createBiquadFilter();
      jetFilter.type = 'bandpass';
      jetFilter.frequency.setValueAtTime(1750, now);
      jetFilter.Q.setValueAtTime(0.85, now);

      // High-pressure steam sizzle filter (3200 Hz highpass)
      var sizzleFilter = audioCtx.createBiquadFilter();
      sizzleFilter.type = 'highpass';
      sizzleFilter.frequency.setValueAtTime(3200, now);

      var steamEnv = audioCtx.createGain();
      steamEnv.gain.setValueAtTime(0.0001, now);
      // Pull 1 steam burst (initial valve chuff spike -> sustain -> brief dip)
      steamEnv.gain.linearRampToValueAtTime(0.11, now + 0.025);
      steamEnv.gain.exponentialRampToValueAtTime(0.055, now + 0.09);
      steamEnv.gain.setValueAtTime(0.052, now + 0.42);
      steamEnv.gain.exponentialRampToValueAtTime(0.012, now + 0.51);
      // Pull 2 steam burst (second valve chuff spike -> sustain -> long steam exhaust tail)
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
})();


