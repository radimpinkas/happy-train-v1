// ============================================================================
// MODULE 2: TRACKS.JS (Smooth 3D Terrain, Curved Railway Turnouts, 5 True At-Grade
// Czech Level Crossings, Clean Single-Track Surface Metro Tunnel Portals &
// 2.5D Fairy-Tale Underground Gnome, Waterfall, Gold Mine & Mushroom Diorama)
// ============================================================================

var scene = new THREE.Scene();
var daySkyColor     = new THREE.Color(0x5ce1e6);
var sunriseSkyColor = new THREE.Color(0xfb7185);
var sunsetSkyColor  = new THREE.Color(0xc026d3);
var nightSkyColor   = new THREE.Color(0x020617);
var metroSkyColor   = new THREE.Color(0x140b29);
var tunnelDarkColor = new THREE.Color(0x030712);

scene.background = daySkyColor.clone();
scene.fog = new THREE.FogExp2(daySkyColor.clone(), 0.00055);

// Wider 2.5D Storybook Perspective Camera so the whole map layout is clear for children
var camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1.5, 2200);
var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
if (THREE.SRGBColorSpace) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
} else if (THREE.sRGBEncoding) {
  renderer.outputEncoding = THREE.sRGBEncoding;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
document.getElementById('canvas-container').appendChild(renderer.domElement);

window.maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4;
window.upgradeCanvasTex = function(texOrCanvas, repeatX, repeatY) {
  var tex = (texOrCanvas && texOrCanvas.isTexture) ? texOrCanvas : new THREE.CanvasTexture(texOrCanvas);
  tex.anisotropy = window.maxAniso;
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
  if (repeatX && repeatY) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
};

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Warm Golden Storybook Lighting
var hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x4ade80, 0.92);
hemiLight.position.set(0, 300, 0);
scene.add(hemiLight);

var sunLight = new THREE.DirectionalLight(0xfff7ed, 1.15);
sunLight.position.set(-180, 260, 200);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 20;
sunLight.shadow.camera.far = 950;
var d = 380;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

var storybookFillLight = new THREE.DirectionalLight(0xfef08a, 0.35);
storybookFillLight.position.set(140, 110, 180);
scene.add(storybookFillLight);

// ============================================================================
// SMOOTH 3D ROLLING TERRAIN HEIGHT FUNCTION (`window.getTerrainHeight`)
// ============================================================================
window.getTerrainHeight = function(x, z) {
  // 1. River Valley channel around z = -85 (Carved below water level y = -1.6)
  var distRiver = Math.abs(z + 85);
  var riverCut = 0;
  if (distRiver < 34) {
    riverCut = -3.8 * Math.cos((distRiver / 34) * (Math.PI * 0.5));
  }

  // 2. Northern Storybook Hill Ridge (z < -135)
  var northHill = 0;
  if (z < -135) {
    var zn = Math.min(1.0, (-135 - z) / 115);
    northHill = 7.5 * (zn * zn * (3 - 2 * zn)) * (0.65 + 0.35 * Math.cos(x * 0.009));
  }

  // 3. Eastern Mountain Ridge (around x = 235, z = 95) for Mountain Tunnel
  var dEastMt = Math.hypot((x - 238) * 0.85, (z - 95) * 0.65);
  var eastHill = dEastMt < 95 ? 9.0 * Math.pow(Math.cos((dEastMt / 95) * (Math.PI * 0.5)), 1.6) : 0;

  // 4. Western Forest Hill (around x = -235, z = -95) for Forest Tunnel
  var dWestMt = Math.hypot((x + 235) * 0.85, (z + 95) * 0.65);
  var westHill = dWestMt < 95 ? 8.5 * Math.pow(Math.cos((dWestMt / 95) * (Math.PI * 0.5)), 1.6) : 0;

  // 5. Gentle rolling meadow waves (kept low in the central city so at-grade crossings are flat & clear!)
  var cityRadius = Math.hypot(x, z - 60);
  var cityFlatFactor = cityRadius < 185 ? 0.18 : 1.0;
  var meadowWave = (Math.sin(x * 0.014) * Math.cos(z * 0.014) * 1.4 + Math.sin((x + z) * 0.008) * 0.9) * cityFlatFactor;
  if (distRiver < 42) {
    meadowWave *= Math.max(0, (distRiver - 22) / 20);
  }

  return riverCut + northHill + eastHill + westHill + meadowWave;
};

// Painterly Meadow Grass Canvas Texture
function createMeadowGrassTexture() {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  var ctx = c.getContext('2d');
  var grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#4ade80');
  grad.addColorStop(0.5, '#22c55e');
  grad.addColorStop(1, '#38c172');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (var i = 0; i < 420; i++) {
    ctx.strokeStyle = (i % 2 === 0) ? 'rgba(21, 128, 61, 0.25)' : 'rgba(134, 239, 172, 0.32)';
    ctx.lineWidth = 2.2;
    var gx = (i * 73) % 500;
    var gy = (i * 137) % 500;
    ctx.beginPath();
    ctx.arc(gx, gy, 7, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  return window.upgradeCanvasTex(c, 36, 36);
}

var grassGeo = new THREE.PlaneGeometry(1800, 1800, 150, 150);
grassGeo.rotateX(-Math.PI / 2);
var gPos = grassGeo.attributes.position;
for (var gi = 0; gi < gPos.count; gi++) {
  var vx = gPos.getX(gi);
  var vz = gPos.getZ(gi);
  gPos.setY(gi, window.getTerrainHeight(vx, vz));
}
grassGeo.computeVertexNormals();

var grassMat = new THREE.MeshStandardMaterial({
  map: createMeadowGrassTexture(),
  roughness: 0.88,
  metalness: 0.02
});
var grass = new THREE.Mesh(grassGeo, grassMat);
grass.receiveShadow = true;
scene.add(grass);

// Sparkling Turquoise Storybook River Water at z = -85
function createWaterRippleTexture() {
  var c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
  ctx.lineWidth = 3;
  for (var i = 0; i < 36; i++) {
    var wx = (i * 53) % 220;
    var wy = (i * 41) % 240;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + 16, wy - 5, wx + 32, wy);
    ctx.stroke();
  }
  return window.upgradeCanvasTex(c, 28, 3);
}

var river = new THREE.Mesh(
  new THREE.PlaneGeometry(1800, 52),
  new THREE.MeshStandardMaterial({ map: createWaterRippleTexture(), roughness: 0.25, metalness: 0.1 })
);
river.rotation.x = -Math.PI / 2;
river.position.set(0, -1.6, -85);
river.receiveShadow = true;
scene.add(river);

// ============================================================================
// HAND-PAINTED RED BRICK VIADUCT TEXTURE & SAFE ELLIPTICAL ARCH GENERATOR
// ============================================================================
function createRedBrickCanvasTexture() {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  var rows = 16, cols = 8;
  var bh = 512 / rows, bw = 512 / cols;
  var palette = ['#b91c1c', '#dc2626', '#991b1b', '#c2410c', '#b91c1c', '#ef4444'];
  for (var r = 0; r < rows; r++) {
    var offset = (r % 2) * (bw * 0.5);
    for (var col = -1; col <= cols; col++) {
      ctx.fillStyle = palette[(r * 5 + col * 3 + 16) % palette.length];
      ctx.fillRect(col * bw + offset + 3, r * bh + 3, bw - 6, bh - 6);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(col * bw + offset + 3, r * bh + 3, bw - 6, 4);
    }
  }
  return window.upgradeCanvasTex(c, 2, 2);
}

window.sharedBrickTex = createRedBrickCanvasTexture();
window.sharedBrickMat = new THREE.MeshStandardMaterial({
  map: window.sharedBrickTex,
  roughness: 0.72,
  metalness: 0.04
});
window.sharedStoneTrimMat = new THREE.MeshStandardMaterial({
  color: 0xfef3c7,
  roughness: 0.6,
  metalness: 0.05
});
window.sharedDarkTunnelMat = new THREE.MeshBasicMaterial({ color: 0x020617 });

window.makeSign = function(text, bg, fg, w, h) {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  var ctx = c.getContext('2d');
  ctx.fillStyle = bg || '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 10;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(10, 10, 492, 108, 32);
  else ctx.rect(10, 10, 492, 108);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = fg || '#fde047';
  ctx.font = '900 30px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66);
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: window.upgradeCanvasTex(c), transparent: true, depthTest: false }));
  sp.scale.set((w || 20) * 0.62, (h || 5.0) * 0.62, 1);
  return sp;
};

// ============================================================================
// RAILWAY NODES & SMOOTH CURVED TRACK NETWORK
// ============================================================================
window.nodes = {
  J_NW:     { id: 'J_NW',     pos: new THREE.Vector3(-125, 12.4, -185), name: "Metro Station 1 & Viaduct West", hasMetro: "Ⓜ️ Metro Station 1", metroCol: '#2563eb' },
  J_NORTH:  { id: 'J_NORTH',  pos: new THREE.Vector3(  65, 12.4, -185), name: "Sunny School Hilltop" },
  J_NE:     { id: 'J_NE',     pos: new THREE.Vector3( 210,  4.2, -165), name: "Metro Station 2 & Grandma", hasMetro: "Ⓜ️ Metro Station 2", metroCol: '#16a34a' },
  J_EAST:   { id: 'J_EAST',   pos: new THREE.Vector3( 245, 11.5,    0), name: "Grand River Bridge" },
  J_SE:     { id: 'J_SE',     pos: new THREE.Vector3( 210,  2.2,  190), name: "Metro Station 3 & Hypermarket", hasMetro: "Ⓜ️ Metro Station 3", metroCol: '#9333ea' },
  J_SOUTH:  { id: 'J_SOUTH',  pos: new THREE.Vector3(   0,  1.8,  215), name: "Central Train Depot" },
  J_SW:     { id: 'J_SW',     pos: new THREE.Vector3(-210,  2.2,  190), name: "Metro Station 4 & Stadium", hasMetro: "Ⓜ️ Metro Station 4", metroCol: '#ea580c' },
  J_WEST:   { id: 'J_WEST',   pos: new THREE.Vector3(-235, 11.2,    0), name: "West Red-Brick Viaduct" },
  J_CENTER: { id: 'J_CENTER', pos: new THREE.Vector3(   0,  1.8,   15), name: "Fountain Central Square" },
  EXIT_ALPS:  { id: 'EXIT_ALPS',  pos: new THREE.Vector3(  65, 12.4, -335), name: "🏔️ Alpine Snow World", isExit: true, unlocked: false },
  EXIT_EGYPT: { id: 'EXIT_EGYPT', pos: new THREE.Vector3( 365,  3.2,  190), name: "🐪 Egypt Pyramids World", isExit: true, unlocked: false }
};

Object.keys(window.nodes).forEach(function(k) {
  var n = window.nodes[k];
  var th = window.getTerrainHeight(n.pos.x, n.pos.z);
  if (n.pos.y < th + 1.0) n.pos.y = th + 1.0;
});

window.edges = [];
window.aiOuterEdges = [];
window.physicalTracksToRender = [];
window.allTrackSamples = [];
window.atGradeTrackSamples = []; // ONLY true ground-level tracks (`gapH <= 2.2m`) for Czech Level Crossings!
window.tunnelZones = [];
window.tunnelRoofMeshes = [];
window.turnoutCurves = {};

function addBidirectionalTrack(nodeA, nodeB, ox, oy, oz, stationCfg) {
  var pA = nodes[nodeA].pos.clone();
  var pB = nodes[nodeB].pos.clone();
  var dirVec = pB.clone().sub(pA).normalize();
  var perp = new THREE.Vector3(-dirVec.z, 0, dirVec.x).normalize().multiplyScalar(4.4);

  var g1 = pA.clone().lerp(pB, 0.22);
  g1.x += (ox || 0) * 0.55; g1.z += (oz || 0) * 0.55;
  g1.y = pA.y + (pB.y - pA.y) * 0.15 + (oy || 0) * 0.4;

  var gMid = new THREE.Vector3(
    (pA.x + pB.x) * 0.5 + (ox || 0),
    (pA.y + pB.y) * 0.5 + (oy || 0),
    (pA.z + pB.z) * 0.5 + (oz || 0)
  );

  var g3 = pA.clone().lerp(pB, 0.78);
  g3.x += (ox || 0) * 0.55; g3.z += (oz || 0) * 0.55;
  g3.y = pA.y + (pB.y - pA.y) * 0.85 + (oy || 0) * 0.4;

  // For J_WEST->J_CENTER and J_CENTER->J_EAST, keep the central city half at ground level (y = 1.8)
  // so city roads form true same-level railway crossings while outer roads pass under brick arches!
  if (nodeA === 'J_WEST' && nodeB === 'J_CENTER') {
    gMid.y = 1.85;
    g3.y = 1.80;
  } else if (nodeA === 'J_CENTER' && nodeB === 'J_EAST') {
    g1.y = 1.80;
    gMid.y = 1.85;
  }

  var rawGuide = new THREE.CatmullRomCurve3([pA, g1, gMid, g3, pB], false);

  var numSamples = 24;
  var ptsAB = [];
  var ptsParallel = [];
  var isHeroViaduct = stationCfg && stationCfg.type === 'hero_viaduct';
  var isViaductOrBridge = stationCfg && (stationCfg.type === 'hero_viaduct' || stationCfg.type === 'viaduct' || stationCfg.type === 'bridge_suspension');
  var isTunnelTrack = stationCfg && stationCfg.type === 'tunnel';

  for (var s = 0; s <= numSamples; s++) {
    var u = s / numSamples;
    var pt = rawGuide.getPointAt(u);
    if (s === 0) pt.copy(pA);
    if (s === numSamples) pt.copy(pB);

    if (!isHeroViaduct && s > 0 && s < numSamples) {
      var th1 = window.getTerrainHeight(pt.x, pt.z);
      var th2 = window.getTerrainHeight(pt.x + perp.x, pt.z + perp.z);
      var minSafeY = Math.max(th1, th2) + 0.95;
      if (Math.abs(pt.z + 85) < 32) {
        minSafeY = Math.max(minSafeY, 3.2);
      }
      if (pt.y < minSafeY) pt.y = minSafeY;
    } else if (isHeroViaduct) {
      pt.y = 12.4;
    }

    ptsAB.push(pt);
    ptsParallel.push(pt.clone().add(perp));
  }

  var curveAB = new THREE.CatmullRomCurve3(ptsAB, false);
  var curveBA = new THREE.CatmullRomCurve3(ptsAB.slice().reverse(), false);
  var curveParallelAB = new THREE.CatmullRomCurve3(ptsParallel, false);
  var curveParallelBA = new THREE.CatmullRomCurve3(ptsParallel.slice().reverse(), false);

  var edgeAB = { id: nodeA + '->' + nodeB, from: nodeA, to: nodeB, curve: curveAB, parallelCurve: curveParallelAB, station: stationCfg || null };
  var edgeBA = { id: nodeB + '->' + nodeA, from: nodeB, to: nodeA, curve: curveBA, parallelCurve: curveParallelBA, station: stationCfg || null };

  edges.push(edgeAB, edgeBA);
  physicalTracksToRender.push(edgeAB);

  for (var i = 0; i <= 48; i++) {
    var uS = i / 48;
    var pMain = curveAB.getPointAt(uS);
    var pPar = curveParallelAB.getPointAt(uS);
    allTrackSamples.push(pMain, pPar);

    // STRICT RULE: Only register a track sample as "at-grade" (`atGradeTrackSamples`)
    // if it is NOT a viaduct/bridge/tunnel AND its height above terrain is <= 2.3m!
    // High embankments (gap > 2.3m) get a brick underpass instead, NEVER barriers on top!
    if (!isViaductOrBridge && !isTunnelTrack && uS >= 0.18 && uS <= 0.82) {
      var tanS = curveAB.getTangentAt(uS).normalize();
      var perpS = new THREE.Vector3(-tanS.z, 0, tanS.x).normalize();
      var midCenter = pMain.clone().add(perpS.multiplyScalar(2.2));
      var terrH = window.getTerrainHeight(midCenter.x, midCenter.z);
      var heightAboveGround = pMain.y - terrH;
      if (heightAboveGround <= 2.35 && Math.abs(midCenter.z + 85) > 35) {
        atGradeTrackSamples.push({
          pos: midCenter,
          tan: tanS,
          edge: edgeAB,
          u: uS,
          y: pMain.y
        });
      }
    }
  }
}

// 1. Outer Ring with Hills, Bridges, Viaducts & Drive-Through Tunnels
addBidirectionalTrack('J_NW', 'J_NORTH', 0, 0.0, 8, {
  type: 'hero_viaduct', name: "🧱 Storybook Brick Viaduct", emoji: "🚂",
  voice: "Look! Toby is crossing the grand red-brick viaduct high above the road!"
});
addBidirectionalTrack('J_NORTH', 'J_NE', 14, 0.5, -18, {
  type: 'station', name: "🏫 Sunny School Hilltop", emoji: "🏫",
  voice: "Sunny School and Kindergarten on the green hill! Now we roll gently down toward Metro Station 2!"
});
addBidirectionalTrack('J_NE', 'J_EAST', 22, 2.0, 0, {
  type: 'bridge_suspension', name: "🌉 Grand River Bridge", emoji: "🌉",
  voice: "Crossing the high brick bridge over the sparkling blue river!"
});
addBidirectionalTrack('J_EAST', 'J_SE', 24, 1.5, 0, {
  type: 'tunnel', name: "⛰️ Dark Mountain Tunnel", emoji: "⛰️",
  voice: "Entering the dark Mountain Tunnel! Toby turns on his bright headlight!"
});
addBidirectionalTrack('J_SE', 'J_SOUTH', 0, 0.0, 18, {
  type: 'depot', name: "🏗️ Central Train Depot", emoji: "🏗️",
  voice: "Rolling through the Central Train Depot and across the Czech railway crossing!"
});
addBidirectionalTrack('J_SOUTH', 'J_SW', 0, 0.0, 18, {
  type: 'station', name: "⚽ City Football Stadium", emoji: "⚽",
  voice: "City Football Stadium and Metro Station 4!"
});
addBidirectionalTrack('J_SW', 'J_WEST', -20, 1.8, 0, {
  type: 'viaduct', name: "🧱 West Red-Brick Viaduct", emoji: "🧱",
  voice: "Climbing up the West Red-Brick Arch Viaduct!"
});
addBidirectionalTrack('J_WEST', 'J_NW', -22, 1.2, -15, {
  type: 'tunnel', name: "🌲 Forest Tunnel & Mom's House", emoji: "🏡",
  voice: "Driving through the Forest Hill Tunnel toward Mom's House and Metro Station 1!"
});

// 2. Cross-Town Tracks meeting at Grand Central Fountain Square (J_CENTER)
addBidirectionalTrack('J_NORTH', 'J_CENTER', 14, 0.4, 0, {
  type: 'station', name: "⛲ Fountain Central Square North", emoji: "⛲",
  voice: "Rolling down the hill to Grand Central Square!"
});
addBidirectionalTrack('J_CENTER', 'J_SOUTH', 0, 0.0, 0, {
  type: 'station', name: "⛲ Fountain Central Square South", emoji: "⛲",
  voice: "Grand Central Square with the big water fountain and railway crossing!"
});
addBidirectionalTrack('J_WEST', 'J_CENTER', 0, 0.0, 0, null);
addBidirectionalTrack('J_CENTER', 'J_EAST', 0, 0.0, 0, null);

// 3. Paid World Exit Spurs
addBidirectionalTrack('J_NORTH', 'EXIT_ALPS', 0, 0, 0, {
  type: 'exit_portal', name: "🏔️ Alpine Tunnel Portal", emoji: "🏔️"
});
addBidirectionalTrack('J_SE', 'EXIT_EGYPT', 0, 0, 0, {
  type: 'exit_portal', name: "🐪 Egypt Tunnel Portal", emoji: "🐪"
});

// ============================================================================
// 4. CLEAN SURFACE-TUNNEL METRO LINES -> CENTRAL FAIRY-TALE UNDERGROUND CAVERN!
// - Routes each Metro branch INWARD along the wide-open diagonal corridor
//   (`dirA = (-pA.x, 0, -pA.z).normalize()`) 61m away from the corner junctions!
// - Maintains a 100% STRAIGHT, HORIZONTAL surface track from 38m to 84m inward
//   so the train rolls straight through the center of the Metro Station Portal
//   archway without ever touching a wall or overlapping any surface track!
// ============================================================================
window.subwayEdges = [];
function addSubwayLine(fromId, toId, unusedA, unusedB, cavernOffsetZ, allowedSurfaceEntryId, label) {
  var pA = nodes[fromId].pos.clone();
  var pB = nodes[toId].pos.clone();

  // Point strictly INWARD from the corner junction (±195, ±195) toward the open diagonal plaza!
  var dirA = new THREE.Vector3(-pA.x, 0, -pA.z).normalize();
  var dirB = new THREE.Vector3(-pB.x, 0, -pB.z).normalize();

  var surfA1 = pA.clone().add(dirA.clone().multiplyScalar(38)); // u = 0.15 (Turnout end: (±168, ±168))
  var surfA2 = pA.clone().add(dirA.clone().multiplyScalar(61)); // u = 0.21 (Portal center: (±152, ±152))
  var surfA3 = pA.clone().add(dirA.clone().multiplyScalar(84)); // u = 0.27 (Inside dark portal hood: (±136, ±136))

  var surfB3 = pB.clone().add(dirB.clone().multiplyScalar(84)); // u = 0.73
  var surfB2 = pB.clone().add(dirB.clone().multiplyScalar(61)); // u = 0.79 (Exit Portal center: (±152, ±152))
  var surfB1 = pB.clone().add(dirB.clone().multiplyScalar(38)); // u = 0.85

  var portalSurfaceYA = Math.max(
    pA.y,
    window.getTerrainHeight(surfA1.x, surfA1.z) + 1.02,
    window.getTerrainHeight(surfA2.x, surfA2.z) + 1.02,
    window.getTerrainHeight(surfA3.x, surfA3.z) + 1.02
  );
  var portalSurfaceYB = Math.max(
    pB.y,
    window.getTerrainHeight(surfB1.x, surfB1.z) + 1.02,
    window.getTerrainHeight(surfB2.x, surfB2.z) + 1.02,
    window.getTerrainHeight(surfB3.x, surfB3.z) + 1.02
  );

  surfA1.y = portalSurfaceYA; surfA2.y = portalSurfaceYA; surfA3.y = portalSurfaceYA;
  surfB1.y = portalSurfaceYB; surfB2.y = portalSurfaceYB; surfB3.y = portalSurfaceYB;

  var signX = (pA.x < pB.x) ? 1 : -1;
  var pCavernStart = new THREE.Vector3(-64 * signX, -25.5, cavernOffsetZ);
  var pCavernMid   = new THREE.Vector3(   0,        -25.5, cavernOffsetZ);
  var pCavernEnd   = new THREE.Vector3( 64 * signX, -25.5, cavernOffsetZ);

  // Build explicit 40-step curve where:
  // - u in [0.15 .. 0.27] is a 100% straight horizontal line from surfA1 through surfA2 to surfA3!
  // - u in [0.34 .. 0.66] is a 100% straight horizontal causeway from pCavernStart to pCavernEnd!
  // - u in [0.73 .. 0.85] is a 100% straight horizontal line from surfB3 through surfB2 to surfB1!
  var numSteps = 40;
  var fixedPts = [];

  for (var k = 0; k <= numSteps; k++) {
    var u = k / numSteps;
    var pt = new THREE.Vector3();

    if (k === 0) {
      pt.copy(pA);
    } else if (k === numSteps) {
      pt.copy(pB);
    } else if (u < 0.15) {
      var tA0 = u / 0.15;
      pt.lerpVectors(pA, surfA1, tA0);
      var minYA0 = window.getTerrainHeight(pt.x, pt.z) + 1.02;
      pt.y = Math.max(pt.y, minYA0);
    } else if (u <= 0.275) {
      // 100% STRAIGHT & LEVEL through the Surface Metro Station Portal!
      var tA1 = (u - 0.15) / 0.125;
      pt.lerpVectors(surfA1, surfA3, tA1);
      pt.y = portalSurfaceYA;
    } else if (u < 0.35) {
      // Smooth descent inside the enclosed tunnel hood
      var tDown = (u - 0.275) / 0.075;
      var sDown = tDown * tDown * (3 - 2 * tDown);
      pt.lerpVectors(surfA3, pCavernStart, sDown);
      pt.y = portalSurfaceYA + (-25.5 - portalSurfaceYA) * sDown;
    } else if (u <= 0.65) {
      // 100% STRAIGHT & LEVEL across the Underground Stone Arch Viaduct Causeway!
      var tCav = (u - 0.35) / 0.30;
      pt.lerpVectors(pCavernStart, pCavernEnd, tCav);
      pt.y = -25.5;
      pt.z = cavernOffsetZ;
    } else if (u < 0.725) {
      // Smooth ascent inside the exit enclosed tunnel hood
      var tUp = (u - 0.65) / 0.075;
      var sUp = tUp * tUp * (3 - 2 * tUp);
      pt.lerpVectors(pCavernEnd, surfB3, sUp);
      pt.y = -25.5 + (portalSurfaceYB - (-25.5)) * sUp;
    } else if (u <= 0.85) {
      // 100% STRAIGHT & LEVEL through the Exit Surface Metro Station Portal!
      var tB1 = (u - 0.725) / 0.125;
      pt.lerpVectors(surfB3, surfB1, tB1);
      pt.y = portalSurfaceYB;
    } else {
      var tB0 = (u - 0.85) / 0.15;
      pt.lerpVectors(surfB1, pB, tB0);
      var minYB0 = window.getTerrainHeight(pt.x, pt.z) + 1.02;
      pt.y = Math.max(pt.y, minYB0);
    }
    fixedPts.push(pt);
  }

  var curve = new THREE.CatmullRomCurve3(fixedPts, false);

  var subEdge = {
    id: 'METRO_' + fromId + '->' + toId,
    from: fromId,
    to: toId,
    allowedSurfaceEntryId: allowedSurfaceEntryId,
    curve: curve,
    parallelCurve: curve,
    isSubway: true,
    portalPosA: surfA2.clone(),
    portalDirA: dirA.clone(),
    portalPosB: surfB2.clone(),
    portalDirB: dirB.clone(),
    cavernSignX: signX,
    cavernOffsetZ: cavernOffsetZ,
    station: {
      type: 'subway',
      name: label,
      emoji: "🚇",
      voice: "Welcome to the Enchanted Underground Gnome World! Look at the cascading turquoise waterfalls, gold minecarts, sparkling diamonds, and glowing magic mushrooms!"
    }
  };
  subwayEdges.push(subEdge);
  edges.push(subEdge);
}

// Metro Line 1 <-> 3 (J_NW <-> J_SE)
addSubwayLine(
  'J_NW', 'J_SE', null, null, -8.0,
  'J_WEST->J_NW',
  "🚇 Metro 1 -> 3 (Enchanted Gnome Cavern)"
);
addSubwayLine(
  'J_SE', 'J_NW', null, null, -8.0,
  'J_SOUTH->J_SE',
  "🚇 Metro 3 -> 1 (Enchanted Gnome Cavern)"
);

// Metro Line 2 <-> 4 (J_NE <-> J_SW)
addSubwayLine(
  'J_NE', 'J_SW', null, null,  8.0,
  'J_NORTH->J_NE',
  "🚇 Metro 2 -> 4 (Crystal Waterfall Cavern)"
);
addSubwayLine(
  'J_SW', 'J_NE', null, null,  8.0,
  'J_SOUTH->J_SW',
  "🚇 Metro 4 -> 2 (Crystal Waterfall Cavern)"
);

// Helper: Finds nearest TRUE ground-level railway track point for flush Czech Level Crossings
window.getClosestAtGradeTrack = function(x, z) {
  var bestD = 999999;
  var bestSample = null;
  for (var i = 0; i < window.atGradeTrackSamples.length; i++) {
    var s = window.atGradeTrackSamples[i];
    var d = Math.hypot(x - s.pos.x, z - s.pos.z);
    if (d < bestD) {
      bestD = d;
      bestSample = s;
    }
  }
  return { dist: bestD, sample: bestSample };
};

// Continuous Road Elevation Function:
// 1. Smoothly ramps over the river at z = -85
// 2. Smoothly rises to match the exact rail height (`sample.y + 0.16`) ONLY at true ground-level crossings!
//    When the track is on a high embankment or viaduct, the road stays at ground level to pass through an underpass!
window.getRoadHeight = function(x, z) {
  var th = window.getTerrainHeight(x, z);
  var baseRoadY = Math.max(0.25, th + 0.22);

  // 1. Smooth river bridge ramp
  var dRiver = Math.abs(z + 85);
  if (dRiver < 54) {
    var ramp = 0.5 * (1.0 + Math.cos((dRiver / 54.0) * Math.PI));
    var bridgeCrownY = 3.2;
    var bankZ = z < -85 ? -85 - 30 : -85 + 30;
    var bankRoadY = Math.max(0.35, window.getTerrainHeight(x, bankZ) + 0.22);
    var blendedBase = dRiver < 28 ? bankRoadY : baseRoadY;
    baseRoadY = blendedBase + (bridgeCrownY - blendedBase) * ramp;
  }

  // 2. Smoothly match track rail height at true ground-level railway crossings (železniční přejezdy na stejné úrovni)
  var trkInfo = window.getClosestAtGradeTrack(x, z);
  if (trkInfo.dist < 28 && trkInfo.sample) {
    var trkTargetY = trkInfo.sample.y + 0.16;
    if (Math.abs(trkTargetY - baseRoadY) <= 2.4) {
      var cRamp = 0.5 * (1.0 + Math.cos((trkInfo.dist / 28.0) * Math.PI));
      baseRoadY = baseRoadY + (trkTargetY - baseRoadY) * cRamp;
    }
  }

  return baseRoadY;
};

// ============================================================================
// COMPLETE 3D CITY ROAD NETWORK & 5 TRUE SAME-LEVEL CZECH RAILWAY CROSSINGS (AŽD)
// ============================================================================
window.roadNetworkCurves = [];
window.roadSamplePoints = [];
window.levelCrossings = [];

// Builds an Authentic Czech Railway Level Crossing (Český železniční přejezd AŽD se závorami a 2 blikajícími červenými světly!)
function buildCzechLevelCrossing(crossPos, roadAng, trackTan) {
  var g = new THREE.Group();
  g.position.set(crossPos.x, crossPos.y, crossPos.z);

  var trkAng = Math.atan2(trackTan.x, trackTan.z);

  // 1. Dark Rubber/Timber Level Crossing Deck flush between the rails and road
  var deck = new THREE.Mesh(
    new THREE.BoxGeometry(10.6, 0.26, 9.8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
  );
  deck.position.y = 0.08;
  deck.rotation.y = trkAng;
  g.add(deck);

  // Red-and-white striped barrier texture
  var barCanvas = document.createElement('canvas');
  barCanvas.width = 256; barCanvas.height = 64;
  var bCtx = barCanvas.getContext('2d');
  for (var st = 0; st < 8; st++) {
    bCtx.fillStyle = st % 2 === 0 ? '#ef4444' : '#ffffff';
    bCtx.fillRect(st * 32, 0, 32, 64);
  }
  var barTex = window.upgradeCanvasTex(barCanvas);
  var barMat = new THREE.MeshStandardMaterial({ map: barTex, roughness: 0.4 });
  var postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.4 });
  var blackBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  var whiteRimMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var redCrossMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  var roadDir = new THREE.Vector3(Math.sin(roadAng), 0, Math.cos(roadAng)).normalize();
  var roadRight = new THREE.Vector3(roadDir.z, 0, -roadDir.x).normalize();

  var pivots = [];
  var leftLights = [];
  var rightLights = [];

  // Place 2 Czech AŽD Signals + Automatic Barriers on both sides of the railway crossing!
  [-1, 1].forEach(function(side) {
    var unitG = new THREE.Group();
    var offsetAlongRoad = roadDir.clone().multiplyScalar(side * 8.6);
    var offsetRightCurb = roadRight.clone().multiplyScalar(side * 4.9);
    unitG.position.copy(offsetAlongRoad).add(offsetRightCurb);
    unitG.rotation.y = roadAng + (side === 1 ? 0 : Math.PI);

    // Signal Post
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 5.2, 12), postMat);
    post.position.y = 2.6;
    unitG.add(post);

    // Czech St. Andrew's Cross (Výstražný kříž - Červenobílý X kříž)
    var crossG = new THREE.Group();
    crossG.position.set(0, 4.7, 0.25);
    [-0.65, 0.65].forEach(function(rz) {
      var whiteBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 0.12), whiteRimMat);
      whiteBar.rotation.z = rz;
      var redTip1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.14), redCrossMat);
      redTip1.position.x = 0.72;
      whiteBar.add(redTip1);
      var redTip2 = redTip1.clone();
      redTip2.position.x = -0.72;
      whiteBar.add(redTip2);
      crossG.add(whiteBar);
    });
    unitG.add(crossG);

    // Czech AŽD 71/97 Warning Light Box (2 Alternating Red Lights side-by-side!)
    var azdRim = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.35, 0.35), whiteRimMat);
    azdRim.position.set(0, 3.25, 0.22);
    var azdBox = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.15, 0.42), blackBoxMat);
    azdBox.position.set(0, 3.25, 0.24);
    unitG.add(azdRim, azdBox);

    var lMat = new THREE.MeshBasicMaterial({ color: 0x3b0707 });
    var rMat = new THREE.MeshBasicMaterial({ color: 0x3b0707 });
    var lBulb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), lMat);
    lBulb.position.set(-0.48, 3.25, 0.46);
    var rBulb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), rMat);
    rBulb.position.set(0.48, 3.25, 0.46);
    unitG.add(lBulb, rBulb);
    leftLights.push(lMat);
    rightLights.push(rMat);

    // Barrier Mechanism Pedestal & Rotating Boom Pivot (Závora)
    var ped = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.85), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    ped.position.set(-0.6, 0.9, 0);
    unitG.add(ped);

    var pivot = new THREE.Group();
    pivot.position.set(-0.6, 1.65, 0);
    pivot.rotation.z = Math.PI * 0.44;

    var boomLen = 9.2;
    var boom = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, boomLen, 10), barMat);
    boom.rotation.z = Math.PI / 2;
    boom.position.x = -boomLen * 0.5 + 0.6;
    pivot.add(boom);

    var boomLight = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    boomLight.position.set(-boomLen * 0.55, 0.22, 0);
    pivot.add(boomLight);

    unitG.add(pivot);
    pivots.push(pivot);
    g.add(unitG);
  });

  scene.add(g);
  window.levelCrossings.push({
    pos: crossPos.clone(),
    pivots: pivots,
    leftLights: leftLights,
    rightLights: rightLights,
    currentAngle: Math.PI * 0.44,
    isClosed: false,
    lastBellTime: 0
  });
}

(function buildCompleteRoadNetwork() {
  // Outer Loop: passes under high viaducts in the north/west/east, and crosses
  // J_SE->J_SOUTH, J_CENTER->J_SOUTH, and J_SOUTH->J_SW at the exact same ground level in the south!
  var mainLoopPts = [
    new THREE.Vector3(-140, 0, -135),
    new THREE.Vector3( -65, 0, -130),
    new THREE.Vector3(   0, 0, -128),
    new THREE.Vector3(  75, 0, -132),
    new THREE.Vector3( 155, 0, -135),
    new THREE.Vector3( 175, 0,  -25), // High track above -> gets brick underpass arch, NOT barriers!
    new THREE.Vector3( 155, 0,  125),
    new THREE.Vector3(  85, 0,  212), // Same-Level Crossing #1 across J_SE->J_SOUTH!
    new THREE.Vector3(   0, 0,  155), // Same-Level Crossing #2 across J_CENTER->J_SOUTH!
    new THREE.Vector3( -85, 0,  212), // Same-Level Crossing #3 across J_SOUTH->J_SW!
    new THREE.Vector3(-155, 0,  120),
    new THREE.Vector3(-175, 0,  -25)  // High track above -> gets brick underpass arch, NOT barriers!
  ];

  // Inner City Loop: drives under the Hero Viaduct Arch in the north, and crosses
  // J_WEST->J_CENTER, J_CENTER->J_SOUTH, and J_CENTER->J_EAST at the exact same ground level in the city!
  var innerLoopPts = [
    new THREE.Vector3( -30, 0, -130),
    new THREE.Vector3( -30, 0, -195), // Drives NORTH dead-center under the Hero Viaduct Arch!
    new THREE.Vector3( -95, 0, -225),
    new THREE.Vector3(-145, 0, -175),
    new THREE.Vector3(-140, 0, -135),
    new THREE.Vector3( -85, 0,  -45),
    new THREE.Vector3( -72, 0,   42), // Same-Level Crossing #4 across J_WEST->J_CENTER!
    new THREE.Vector3(   0, 0,   92), // Same-Level Crossing #5 across J_CENTER->J_SOUTH!
    new THREE.Vector3(  72, 0,   42), // Same-Level Crossing #6 across J_CENTER->J_EAST!
    new THREE.Vector3(  85, 0,  -45),
    new THREE.Vector3(  75, 0, -132)
  ];

  [mainLoopPts, innerLoopPts].forEach(function(rawPts) {
    rawPts.forEach(function(p) {
      p.y = window.getRoadHeight(p.x, p.z);
    });
    var curve = new THREE.CatmullRomCurve3(rawPts, true);
    window.roadNetworkCurves.push(curve);
  });

  var curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  var asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.80,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  var dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var railGuardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });

  window.roadNetworkCurves.forEach(function(rCurve) {
    var rLen = rCurve.getLength();
    var steps = Math.floor(rLen / 2.2);
    for (var i = 0; i < steps; i++) {
      var t1 = i / steps;
      var t2 = (i + 1) / steps;
      var p1 = rCurve.getPointAt(t1);
      var p2 = rCurve.getPointAt(t2);
      p1.y = window.getRoadHeight(p1.x, p1.z);
      p2.y = window.getRoadHeight(p2.x, p2.z);

      var mid = p1.clone().lerp(p2, 0.5);
      mid.y = (p1.y + p2.y) * 0.5;

      var segDir = p2.clone().sub(p1);
      var horizLen = Math.hypot(segDir.x, segDir.z) || 0.001;
      var segLen = horizLen * 1.22;
      var ang = Math.atan2(segDir.x, segDir.z);
      var pitch = -Math.atan2(segDir.y, horizLen);

      window.roadSamplePoints.push({ x: mid.x, y: mid.y, z: mid.z, ang: ang });

      var curb = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.24, segLen), curbMat);
      curb.position.set(mid.x, mid.y - 0.04, mid.z);
      curb.rotation.order = 'YXZ'; curb.rotation.y = ang; curb.rotation.x = pitch;
      scene.add(curb);

      var asph = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.28, segLen), asphaltMat);
      asph.position.set(mid.x, mid.y, mid.z);
      asph.rotation.order = 'YXZ'; asph.rotation.y = ang; asph.rotation.x = pitch;
      asph.receiveShadow = true;
      scene.add(asph);

      if (i % 2 === 0) {
        var dash = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, segLen * 0.62), dashMat);
        dash.position.set(mid.x, mid.y + 0.02, mid.z);
        dash.rotation.order = 'YXZ'; dash.rotation.y = ang; dash.rotation.x = pitch;
        scene.add(dash);
      }

      // STRICT CHECK: Spawn a Czech Level Crossing ONLY if road and railway are at the EXACT SAME LEVEL!
      var trkCross = window.getClosestAtGradeTrack(mid.x, mid.z);
      if (trkCross.dist < 2.8 && trkCross.sample && Math.abs(mid.y - trkCross.sample.y) < 0.55) {
        var crossPos = new THREE.Vector3(trkCross.sample.pos.x, trkCross.sample.y, trkCross.sample.pos.z);
        var alreadyHasCrossing = window.levelCrossings.some(function(lc) {
          return lc.pos.distanceTo(crossPos) < 28;
        });
        if (!alreadyHasCrossing) {
          buildCzechLevelCrossing(crossPos, ang, trkCross.sample.tan);
        }
      }

      var dRiver = Math.abs(mid.z + 85);
      if (dRiver < 28) {
        if (i % 2 === 0) {
          var perpX = Math.cos(ang) * 4.7, perpZ = -Math.sin(ang) * 4.7;
          [-1, 1].forEach(function(side) {
            var guard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, segLen * 1.05), railGuardMat);
            guard.position.set(mid.x + perpX * side, mid.y + 0.45, mid.z + perpZ * side);
            guard.rotation.order = 'YXZ'; guard.rotation.y = ang; guard.rotation.x = pitch;
            scene.add(guard);
          });
        }
        if (i % 4 === 0) {
          var rPier = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 5.2, 10), curbMat);
          rPier.position.set(mid.x, mid.y - 2.6, mid.z);
          scene.add(rPier);
        }
      }
    }
  });
})();

window.getClosestRoadInfo = function(x, z) {
  var minDist = 999999;
  var closestPt = null;
  for (var i = 0; i < window.roadSamplePoints.length; i++) {
    var rp = window.roadSamplePoints[i];
    var d = Math.hypot(x - rp.x, z - rp.z);
    if (d < minDist) {
      minDist = d;
      closestPt = rp;
    }
  }
  return { dist: minDist, point: closestPt };
};

window.isNearAnyTrack = function(x, z, minDist) {
  for (var i = 0; i < allTrackSamples.length; i++) {
    var p = allTrackSamples[i];
    if (Math.hypot(x - p.x, z - p.z) < minDist) return true;
  }
  for (var j = 0; j < window.roadSamplePoints.length; j += 2) {
    var rp = window.roadSamplePoints[j];
    if (Math.hypot(x - rp.x, z - rp.z) < minDist * 0.8) return true;
  }
  return false;
};
window.isNearTrack = window.isNearAnyTrack;

// ============================================================================
// TURN DIRECTION SELECTOR (`getBranches`)
// ============================================================================
window.getBranches = function(currentEdge) {
  var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
  var node = baseEdge.to;
  var p1 = baseEdge.curve.getPointAt(0.84);
  var inDir = baseEdge.curve.getTangentAt(0.84).normalize();

  var candidates = edges.filter(function(e) {
    if (e.from !== node || e.to === baseEdge.from) return false;
    // Prevent entering a Metro edge from a non-aligned surface edge so turnouts never cross or stack!
    if (e.isSubway && e.allowedSurfaceEntryId && e.allowedSurfaceEntryId !== baseEdge.id) return false;
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

  var straight = scored.reduce(function(best, cur) {
    return Math.abs(cur.angle) < Math.abs(best.angle) ? cur : best;
  }, scored[0]).edge;

  return {
    left: scored[0].edge,
    straight: straight,
    right: scored[scored.length - 1].edge
  };
};

// ============================================================================
// CONTINUOUS 3D TRACK RENDERING, SAFE BRICK VIADUCT ARCHES & ROAD UNDERPASSES
// ============================================================================
var slGeo = new THREE.BoxGeometry(3.2, 0.24, 0.72);
var slMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
var rlGeo = new THREE.BoxGeometry(0.24, 0.28, 2.25);
var rlMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.65, roughness: 0.3 });
var ballastMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.9 });
var embankmentMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.85 });

// Builds a single Red-Brick Viaduct Arch Span whose top deck sits strictly BELOW the track ballast
// (`deckLeftY` at -halfSpan, `deckRightY` at +halfSpan) with zero bevel overshoot so rails & trains
// ALWAYS ride cleanly ON TOP of the bridge!
function createSlopedBrickViaductSpan(spanLen, deckLeftY, deckRightY, deckWidth, groundY) {
  var g = new THREE.Group();
  var minDeckY = Math.min(deckLeftY, deckRightY);
  var actualGroundY = Math.min(groundY, minDeckY - 4.4);
  var hLeft = Math.max(4.4, deckLeftY - actualGroundY);
  var hRight = Math.max(4.4, deckRightY - actualGroundY);
  var minH = Math.min(hLeft, hRight);

  var halfSpan = spanLen * 0.5;
  var archHalfW = Math.min(halfSpan - 1.15, Math.max(2.6, spanLen * 0.37));
  var archHeight = Math.min(minH - 1.45, Math.max(2.4, minH * 0.68));

  var shape = new THREE.Shape();
  shape.moveTo(-halfSpan, 0);
  shape.lineTo(-archHalfW, 0);
  shape.absellipse(0, 0, archHalfW, archHeight, Math.PI, 0, true);
  shape.lineTo(halfSpan, 0);
  shape.lineTo(halfSpan, hRight);
  shape.lineTo(-halfSpan, hLeft);
  shape.closePath();

  var extrudeSettings = {
    depth: deckWidth,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 24
  };
  var archGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  archGeo.translate(0, actualGroundY, -deckWidth * 0.5);
  var archMesh = new THREE.Mesh(archGeo, window.sharedBrickMat);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  g.add(archMesh);

  var rimCount = 11;
  for (var a = 0; a <= rimCount; a++) {
    var theta = (a / rimCount) * Math.PI;
    var rx = Math.cos(theta) * (archHalfW + 0.15);
    var ry = actualGroundY + Math.sin(theta) * (archHeight + 0.15);
    var voussoir = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.82, deckWidth + 0.45),
      window.sharedStoneTrimMat
    );
    voussoir.position.set(rx, ry, 0);
    voussoir.rotation.z = theta - Math.PI * 0.5;
    g.add(voussoir);
  }

  var midDeckY = (deckLeftY + deckRightY) * 0.5;
  var slopeAngle = Math.atan2(deckRightY - deckLeftY, spanLen);
  var slopedLen = Math.hypot(spanLen, deckRightY - deckLeftY) + 0.12;

  var coping = new THREE.Mesh(
    new THREE.BoxGeometry(slopedLen, 0.26, deckWidth + 0.65),
    window.sharedStoneTrimMat
  );
  coping.position.set(0, midDeckY - 0.10, 0);
  coping.rotation.z = slopeAngle;
  g.add(coping);

  var wallMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });
  [-deckWidth * 0.5 - 0.22, deckWidth * 0.5 + 0.22].forEach(function(wz) {
    var parapet = new THREE.Mesh(new THREE.BoxGeometry(slopedLen, 0.28, 0.42), wallMat);
    parapet.position.set(0, midDeckY + 0.10, wz);
    parapet.rotation.z = slopeAngle;
    g.add(parapet);
  });

  return g;
}

// Automatically places wide Red-Brick Overpass Arches ONLY where a HIGH track (`clearanceH >= 3.8m`)
// crosses above a road, tilted at the EXACT slope of the railway track (`p1.y` to `p0.y`) so the bridge
// never sticks up above the rails!
(function buildRoadUnderpassBridges() {
  var placedBridges = [];
  physicalTracksToRender.forEach(function(e) {
    var isAlreadyViaduct = e.station && (e.station.type === 'hero_viaduct' || e.station.type === 'viaduct' || e.station.type === 'bridge_suspension');
    if (isAlreadyViaduct) return;

    var eLen = e.curve.getLength() || 220;
    var spanLen = 22.0;
    var halfDu = (spanLen * 0.5) / eLen;
    var steps = 40;
    for (var i = 3; i <= steps - 3; i++) {
      var u = i / steps;
      var p = e.curve.getPointAt(u);
      var tan = e.curve.getTangentAt(u).normalize();
      var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      var trackCenter = p.clone().add(perp.clone().multiplyScalar(2.2));

      var roadInfo = window.getClosestRoadInfo(trackCenter.x, trackCenter.z);
      if (roadInfo.dist < 5.5 && roadInfo.point) {
        var clearanceH = (trackCenter.y - 0.48) - roadInfo.point.y;
        if (clearanceH >= 3.8) {
          var tooClose = placedBridges.some(function(pb) {
            return Math.hypot(pb.x - trackCenter.x, pb.z - trackCenter.z) < 26;
          });
          if (!tooClose) {
            placedBridges.push({ x: trackCenter.x, z: trackCenter.z });
            var p0 = e.curve.getPointAt(Math.max(0, u - halfDu));
            var p1 = e.curve.getPointAt(Math.min(1, u + halfDu));
            var vang = Math.atan2(tan.x, tan.z);
            var deckLeftY  = p1.y - 0.48;
            var deckRightY = p0.y - 0.48;
            var bridgeSpan = createSlopedBrickViaductSpan(spanLen, deckLeftY, deckRightY, 10.6, roadInfo.point.y - 0.4);
            bridgeSpan.position.x = trackCenter.x;
            bridgeSpan.position.z = trackCenter.z;
            bridgeSpan.rotation.y = vang + Math.PI * 0.5;
            scene.add(bridgeSpan);
          }
        }
      }
    }
  });
})();

function buildStoneTunnelPortalAt(pos, angleY, stoneColors) {
  var g = new THREE.Group();
  g.position.set(pos.x, pos.y - 0.3, pos.z);
  g.rotation.y = angleY;

  var pShape = new THREE.Shape();
  pShape.moveTo(-8.2, 0);
  pShape.lineTo(-8.2, 4.2);
  pShape.absarc(0, 4.2, 8.2, Math.PI, 0, true);
  pShape.lineTo(8.2, 0);
  pShape.lineTo(11.4, 0);
  pShape.lineTo(11.4, 5.2);
  pShape.absarc(0, 5.2, 11.4, 0, Math.PI, false);
  pShape.lineTo(-11.4, 0);
  pShape.closePath();

  var pGeo = new THREE.ExtrudeGeometry(pShape, { depth: 3.6, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.25, bevelThickness: 0.25 });
  pGeo.translate(0, 0, -1.8);
  var pMesh = new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ color: stoneColors[0], roughness: 0.85 }));
  pMesh.castShadow = true;
  pMesh.receiveShadow = true;
  g.add(pMesh);

  for (var i = 0; i <= 12; i++) {
    var ang = (i / 12) * Math.PI;
    var vx = Math.cos(ang) * 8.9;
    var vy = 4.2 + Math.sin(ang) * 8.9;
    var stone = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.3, 4.1),
      new THREE.MeshStandardMaterial({ color: stoneColors[i % stoneColors.length], roughness: 0.8 })
    );
    stone.position.set(vx, vy, 0);
    stone.rotation.z = ang - Math.PI / 2;
    g.add(stone);
  }
  scene.add(g);
}

function buildHollowDriveThroughTunnel(edge, tStart, tEnd) {
  var revId = edge.to + '->' + edge.from;
  window.tunnelZones.push({
    edgeId: edge.id,
    revEdgeId: revId,
    tMin: tStart,
    tMax: tEnd
  });

  var stoneCols = [0x94a3b8, 0xcbd5e1, 0x64748b, 0xe2e8f0];
  var darkWallMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95,
    side: THREE.DoubleSide
  });
  var outerHillMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.9,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
  });
  window.tunnelRoofMeshes.push(outerHillMat);

  var lanternMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  var steps = 16;
  var totalArc = edge.curve.getLength() * (tEnd - tStart);
  var segDepth = (totalArc / steps) * 1.38;

  var innerShape = new THREE.Shape();
  innerShape.moveTo(-7.6, 0);
  innerShape.lineTo(-7.6, 4.2);
  innerShape.absarc(0, 4.2, 7.6, Math.PI, 0, true);
  innerShape.lineTo(7.6, 0);
  innerShape.lineTo(8.2, 0);
  innerShape.lineTo(8.2, 4.2);
  innerShape.absarc(0, 4.2, 8.2, 0, Math.PI, false);
  innerShape.lineTo(-8.2, 0);
  innerShape.closePath();

  var innerWallGeo = new THREE.ExtrudeGeometry(innerShape, { depth: segDepth, bevelEnabled: false, curveSegments: 16 });
  innerWallGeo.translate(0, 0, -segDepth * 0.5);

  var outerHillShape = new THREE.Shape();
  outerHillShape.moveTo(-8.2, 0);
  outerHillShape.lineTo(-8.2, 4.2);
  outerHillShape.absarc(0, 4.2, 8.2, Math.PI, 0, true);
  outerHillShape.lineTo(8.2, 0);
  outerHillShape.lineTo(13.8, -0.8);
  outerHillShape.quadraticCurveTo(12.5, 9.5, 0, 14.8);
  outerHillShape.quadraticCurveTo(-12.5, 9.5, -13.8, -0.8);
  outerHillShape.closePath();

  var outerHillGeo = new THREE.ExtrudeGeometry(outerHillShape, { depth: segDepth, bevelEnabled: false, curveSegments: 16 });
  outerHillGeo.translate(0, 0, -segDepth * 0.5);

  for (var i = 0; i < steps; i++) {
    var uMid = (i + 0.5) / steps;
    var t = tStart + uMid * (tEnd - tStart);
    var pt = edge.curve.getPointAt(t);
    var tan = edge.curve.getTangentAt(t).normalize();
    var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    var centerPt = pt.clone().add(perp.clone().multiplyScalar(2.2));
    var ang = Math.atan2(tan.x, tan.z);

    var ringGroup = new THREE.Group();
    ringGroup.position.copy(centerPt);
    ringGroup.rotation.y = ang;

    var innerMesh = new THREE.Mesh(innerWallGeo, darkWallMat);
    var outerMesh = new THREE.Mesh(outerHillGeo, outerHillMat);
    ringGroup.add(innerMesh, outerMesh);

    if (i % 3 === 1) {
      [-6.8, 6.8].forEach(function(lx) {
        var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), lanternMat);
        lamp.position.set(lx, 5.2, 0);
        ringGroup.add(lamp);
      });
    }

    scene.add(ringGroup);
  }

  [tStart, tEnd].forEach(function(tPortal) {
    var pPt = edge.curve.getPointAt(tPortal);
    var pTan = edge.curve.getTangentAt(tPortal).normalize();
    var pPerp = new THREE.Vector3(-pTan.z, 0, pTan.x).normalize();
    var pCenter = pPt.clone().add(pPerp.multiplyScalar(2.2));
    buildStoneTunnelPortalAt(pCenter, Math.atan2(pTan.x, pTan.z), stoneCols);
  });
}

function renderSingleTrackCurve(curve, isMainTrack, e, uStart, uEnd) {
  var u0 = uStart !== undefined ? uStart : 0.0;
  var u1 = uEnd !== undefined ? uEnd : 1.0;
  var arcLen = curve.getLength() * (u1 - u0);
  var steps = Math.max(4, Math.floor(arcLen / 1.8));
  var isBridgeOrViaduct = e.station && (e.station.type === 'hero_viaduct' || e.station.type === 'viaduct' || e.station.type === 'bridge_suspension');

  for (var i = 0; i <= steps; i++) {
    var u = u0 + (i / steps) * (u1 - u0);
    var p = curve.getPointAt(u);

    var tan = curve.getTangentAt(u).normalize();
    var ang = Math.atan2(tan.x, tan.z);
    var horizLen = Math.hypot(tan.x, tan.z) || 0.001;
    var pitch = -Math.atan2(tan.y, horizLen);

    var sl = new THREE.Mesh(slGeo, slMat);
    sl.position.set(p.x, p.y + 0.12, p.z);
    sl.rotation.order = 'YXZ';
    sl.rotation.y = ang;
    sl.rotation.x = pitch;
    scene.add(sl);

    var px = Math.cos(ang) * 0.92, pz = -Math.sin(ang) * 0.92;
    var r1 = new THREE.Mesh(rlGeo, rlMat);
    r1.position.set(p.x + px, p.y + 0.28, p.z + pz);
    r1.rotation.order = 'YXZ'; r1.rotation.y = ang; r1.rotation.x = pitch;

    var r2 = new THREE.Mesh(rlGeo, rlMat);
    r2.position.set(p.x - px, p.y + 0.28, p.z - pz);
    r2.rotation.order = 'YXZ'; r2.rotation.y = ang; r2.rotation.x = pitch;
    scene.add(r1, r2);

    if (isMainTrack) {
      var perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      var midTrackX = (e.isTurnout || e.isSubway) ? p.x : (p.x + perp.x * 2.2);
      var midTrackZ = (e.isTurnout || e.isSubway) ? p.z : (p.z + perp.z * 2.2);
      var groundY = window.getTerrainHeight(midTrackX, midTrackZ);
      var gapH = p.y - groundY;

      var balW = (e.isTurnout || e.isSubway) ? 5.2 : 9.6;
      var bal = new THREE.Mesh(new THREE.BoxGeometry(balW, 0.28, 2.3), ballastMat);
      bal.position.set(midTrackX, p.y - 0.16, midTrackZ);
      bal.rotation.order = 'YXZ'; bal.rotation.y = ang; bal.rotation.x = pitch;
      scene.add(bal);

      var isSurfaceMetroApproach = e.isSubway && (u <= 0.24 || u >= 0.76);
      if (!e.isSubway || isSurfaceMetroApproach) {
        var isViaductMiddle = isBridgeOrViaduct && (u >= 0.05 && u <= 0.95);
        if (!isViaductMiddle && gapH > 0.20) {
          var roadInfo = window.getClosestRoadInfo(midTrackX, midTrackZ);
          var minRoadClearance = 12.0 + gapH * 0.55;
          if (roadInfo.dist > minRoadClearance) {
            var embH = gapH + 1.4;
            var topR = (e.isTurnout || e.isSubway) ? 3.4 : 5.5;
            var botR = ((e.isTurnout || e.isSubway) ? 3.8 : 6.0) + gapH * 0.65;
            var emb = new THREE.Mesh(
              new THREE.CylinderGeometry(topR, botR, embH, 10),
              embankmentMat
            );
            emb.position.set(midTrackX, p.y - embH * 0.5 - 0.28, midTrackZ);
            scene.add(emb);
          }
        }
      }
    }
  }
}

// 1. Render main middle sections [0.16 .. 0.84] of every surface physical track
physicalTracksToRender.forEach(function(e) {
  var uStart = 0.16;
  var uEnd = (e.to.indexOf('EXIT_') === 0) ? 0.94 : 0.84;

  renderSingleTrackCurve(e.curve, true, e, uStart, uEnd);
  if (e.to.indexOf('EXIT_') === -1) {
    renderSingleTrackCurve(e.parallelCurve, false, e, uStart, uEnd);
  }

  if (!e.station) return;

  if (e.station.type === 'hero_viaduct' || e.station.type === 'viaduct' || e.station.type === 'bridge_suspension') {
    var numSpans = 7;
    var uMin = 0.05, uMax = 0.95;
    var totalBridgeLen = e.curve.getLength() * (uMax - uMin);
    var spanLen = totalBridgeLen / numSpans;

    for (var s = 0; s < numSpans; s++) {
      var u0 = uMin + (s / numSpans) * (uMax - uMin);
      var uMid = uMin + ((s + 0.5) / numSpans) * (uMax - uMin);
      var u1 = uMin + ((s + 1) / numSpans) * (uMax - uMin);

      var vp0 = e.curve.getPointAt(u0);
      var vp = e.curve.getPointAt(uMid);
      var vp1 = e.curve.getPointAt(u1);

      var vtan = e.curve.getTangentAt(uMid).normalize();
      var vperp = new THREE.Vector3(-vtan.z, 0, vtan.x).normalize();
      var centerPos = vp.clone().add(vperp.multiplyScalar(2.2));
      var vang = Math.atan2(vtan.x, vtan.z);
      var gY = Math.min(0.0, window.getTerrainHeight(centerPos.x, centerPos.z) - 0.6);

      // When rotated by vang + Math.PI * 0.5, local -X (-halfSpan) is at u1 (vp1) and local +X (+halfSpan) is at u0 (vp0)!
      // Passing the exact rail heights minus 0.48m guarantees the bridge deck sits cleanly beneath the ballast & sleepers!
      var deckLeftY  = vp1.y - 0.48;
      var deckRightY = vp0.y - 0.48;

      var spanMesh = createSlopedBrickViaductSpan(spanLen * 1.01, deckLeftY, deckRightY, 10.6, gY);
      spanMesh.position.x = centerPos.x;
      spanMesh.position.z = centerPos.z;
      spanMesh.rotation.y = vang + Math.PI * 0.5;
      scene.add(spanMesh);
    }
  } else if (e.station.type === 'tunnel') {
    buildHollowDriveThroughTunnel(e, 0.24, 0.76);
  } else if (e.station.type === 'exit_portal') {
    var endPt = e.curve.getPointAt(0.92);
    var endTan = e.curve.getTangentAt(0.92).normalize();
    buildStoneTunnelPortalAt(endPt, Math.atan2(endTan.x, endTan.z), [0xa8a29e, 0x78716c, 0xd6d3d1, 0x57534e]);
  }
});

// 2. Build & Render Smooth Curved Railway Turnouts (Only 1 clean surface turnout per Metro Station!)
(function buildCurvedJunctionTurnouts() {
  var renderedTurnoutPairs = {};

  function makeFilletCurve(cIn, cOut, nodePos, isSubwayTurnout) {
    var p0 = cIn.getPointAt(0.84);
    var t0 = cIn.getTangentAt(0.84).normalize();
    var p4 = cOut.getPointAt(0.16);
    var t4 = cOut.getTangentAt(0.16).normalize();

    var chord = p0.distanceTo(p4);
    var handleLen = Math.max(4.0, chord * 0.34);

    var p1 = p0.clone().add(t0.clone().multiplyScalar(handleLen));
    var p3 = p4.clone().sub(t4.clone().multiplyScalar(handleLen));
    var p2 = p1.clone().lerp(p3, 0.5).lerp(nodePos, 0.22);
    p2.y = (p1.y + p3.y) * 0.5;

    [p1, p2, p3].forEach(function(pt) {
      var th = window.getTerrainHeight(pt.x, pt.z);
      if (pt.y < th + 0.95) pt.y = th + 0.95;
    });

    return new THREE.CatmullRomCurve3([p0, p1, p2, p3, p4], false);
  }

  edges.forEach(function(edgeIn) {
    if (edgeIn.to.indexOf('EXIT_') === 0) return;
    var nodePos = nodes[edgeIn.to].pos;

    edges.forEach(function(edgeOut) {
      if (edgeOut.from !== edgeIn.to || edgeOut.to === edgeIn.from) return;
      if (edgeIn.isSubway && edgeOut.isSubway) return;

      // Keep only the single aligned surface turnout into/out of each Metro Station so tracks NEVER stack!
      if (edgeOut.isSubway && edgeOut.allowedSurfaceEntryId && edgeOut.allowedSurfaceEntryId !== edgeIn.id) return;

      var isSubTurn = Boolean(edgeIn.isSubway || edgeOut.isSubway);
      var mainFillet = makeFilletCurve(edgeIn.curve, edgeOut.curve, nodePos, isSubTurn);
      var parFillet = makeFilletCurve(edgeIn.parallelCurve || edgeIn.curve, edgeOut.parallelCurve || edgeOut.curve, nodePos, isSubTurn);

      var turnoutObj = {
        id: 'TURNOUT_' + edgeIn.id + '=>' + edgeOut.id,
        from: edgeIn.to,
        to: edgeOut.to,
        isTurnout: true,
        isSubway: false, // Surface turnout stays at surface height!
        sourceEdge: edgeIn,
        targetEdge: edgeOut,
        curve: mainFillet,
        parallelCurve: parFillet,
        station: isSubTurn ? (edgeOut.isSubway ? edgeOut.station : edgeIn.station) : null
      };

      window.turnoutCurves[edgeIn.id + '=>' + edgeOut.id] = turnoutObj;

      var canonA = (edgeIn.isSubway ? 'M_' : '') + [edgeIn.from, edgeIn.to].sort().join('-');
      var canonB = (edgeOut.isSubway ? 'M_' : '') + [edgeOut.from, edgeOut.to].sort().join('-');
      var pairKey = [canonA, canonB].sort().join('||');

      if (!renderedTurnoutPairs[pairKey]) {
        renderedTurnoutPairs[pairKey] = true;
        renderSingleTrackCurve(mainFillet, true, turnoutObj, 0.0, 1.0);
        if (!isSubTurn && edgeOut.to.indexOf('EXIT_') === -1 && edgeIn.from.indexOf('EXIT_') === -1) {
          renderSingleTrackCurve(parFillet, false, turnoutObj, 0.0, 1.0);
        }
      }
    });
  });
})();

window.isPlayerInDarkTunnel = function(edge, t) {
  if (!edge) return false;
  if (edge.isSubway && t >= 0.20 && t <= 0.80) return true;
  for (var i = 0; i < window.tunnelZones.length; i++) {
    var tz = window.tunnelZones[i];
    if (edge.id === tz.edgeId && t >= tz.tMin - 0.04 && t <= tz.tMax + 0.04) return true;
    if (edge.id === tz.revEdgeId && (1 - t) >= tz.tMin - 0.04 && (1 - t) <= tz.tMax + 0.04) return true;
  }
  return false;
};

// ============================================================================
// 4 GRAND SURFACE METRO STATION TUNNEL PORTALS & MULTI-LAYERED 2.5D ILLUSTRATED
// + 3D SPATIAL ENCHANTED UNDERGROUND GNOME & WATERFALL WORLD
// (Combines multi-plane parallax illustrated layers from `/public/assets/aistudio/image_82bcd4d4.png`,
//  bespoke 512x512 & 1024x512 painted storybook cutout sprites, and 3D spatial causeway & animations!)
// ============================================================================
window.subwayGnomes = [];
window.magicMushrooms = [];
window.undergroundWaterfalls = [];
window.waterfallTextures = [];
window.goldMinecarts = [];
window.undergroundParallaxLayers = [];
window.cavernFireflies = [];

// Builds a Storybook Arched Metro Station Building on the Surface where the train enters horizontally
// along the straight diagonal approach (`u = 0.15 .. 0.275`) 61m away from the corner junctions!
function buildGrandMetroStationPortal(entryPt, intoTunnelDir, stationLabel, themeHexStr, themeColorHex) {
  var g = new THREE.Group();
  g.position.set(entryPt.x, entryPt.y - 0.28, entryPt.z);
  g.rotation.y = Math.atan2(intoTunnelDir.x, intoTunnelDir.z);

  // 1. Hollow Arched Station Building Shell (Wide 14.0m opening from -7.0 to +7.0 so the train has huge clearance!)
  var stShape = new THREE.Shape();
  stShape.moveTo(-7.0, -1.5);
  stShape.lineTo(-7.0, 4.8);
  stShape.absarc(0, 4.8, 7.0, Math.PI, 0, true);
  stShape.lineTo(7.0, -1.5);
  stShape.lineTo(9.6, -1.5);
  stShape.lineTo(9.6, 5.2);
  stShape.absarc(0, 5.2, 9.6, 0, Math.PI, false);
  stShape.lineTo(-9.6, -1.5);
  stShape.closePath();

  var shellGeo = new THREE.ExtrudeGeometry(stShape, { depth: 20.0, bevelEnabled: true, bevelSize: 0.22, bevelThickness: 0.22, curveSegments: 22 });
  shellGeo.translate(0, 0, -4.0);
  var shellMesh = new THREE.Mesh(
    shellGeo,
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 })
  );
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  g.add(shellMesh);

  // 2. Green Grassy Roof Mound over the back of the Metro Tunnel so it blends into a natural hill!
  var hillMound = new THREE.Mesh(
    new THREE.SphereGeometry(12.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.88 })
  );
  hillMound.scale.set(1.12, 0.85, 1.35);
  hillMound.position.set(0, 2.2, 14.5);
  g.add(hillMound);

  // 3. Dark Enclosed Tunnel Portal Curtain at z = +14.8 inside the station
  var darkPortalDisk = new THREE.Mesh(
    new THREE.CircleGeometry(7.1, 20),
    new THREE.MeshBasicMaterial({ color: 0x090414, side: THREE.DoubleSide })
  );
  darkPortalDisk.position.set(0, 4.6, 15.2);
  g.add(darkPortalDisk);

  // 4. Colored Arch Header Band on the Front Entrance (Blue / Green / Purple / Orange)
  var headerShape = new THREE.Shape();
  headerShape.absarc(0, 4.9, 7.05, 0, Math.PI, false);
  headerShape.absarc(0, 4.9, 9.3, Math.PI, 0, true);
  headerShape.closePath();
  var headerGeo = new THREE.ExtrudeGeometry(headerShape, { depth: 1.4, bevelEnabled: false, curveSegments: 22 });
  headerGeo.translate(0, 0, -4.6);
  var headerMat = new THREE.MeshBasicMaterial({ color: themeColorHex });
  var hArch = new THREE.Mesh(headerGeo, headerMat);
  g.add(hArch);

  // 5. Warm Golden Glowing Interior Vault Ceiling & Side Platforms inside the Metro Station
  var innerGlowGeo = new THREE.CylinderGeometry(6.8, 6.8, 18.0, 18, 1, true, -Math.PI * 0.5, Math.PI);
  var innerGlow = new THREE.Mesh(
    innerGlowGeo,
    new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide })
  );
  innerGlow.rotation.z = Math.PI / 2;
  innerGlow.rotation.y = Math.PI / 2;
  innerGlow.position.set(0, 4.7, 5.5);
  g.add(innerGlow);

  var platMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  [-5.1, 5.1].forEach(function(px) {
    var plat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 16.5), platMat);
    plat.position.set(px, 0.42, 5.0);
    g.add(plat);
  });

  // 6. Sign Banner "(M) Metro Station 1..4" above the Arch
  var mSign = window.makeSign(stationLabel + " (◀/▶ or OK)", themeHexStr, "#ffffff", 26, 5.8);
  mSign.position.set(0, 16.2, -3.0);
  g.add(mSign);

  // 7. Cute Vintage Street Lamps flanking the Metro Portal
  var poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
  var bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  [-11.2, 11.2].forEach(function(lx) {
    var lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 7.5, 10), poleMat);
    lampPost.position.set(lx, 3.5, -4.2);
    var lantern = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), bulbMat);
    lantern.position.set(lx, 7.5, -4.2);
    g.add(lampPost, lantern);
  });

  scene.add(g);
}

// ============================================================================
// HIGH-RESOLUTION STORYBOOK CUTOUT SPRITE & TEXTURE GENERATORS
// Creates richly painted 512x512 & 1024x512 HTML5 2D Canvas illustrations
// AND composites `/public/assets/aistudio/image_82bcd4d4.png` into multi-plane
// parallax layers so the Underground Cavern has true storybook illustration depth!
// ============================================================================
function createStorybookMossyStoneTex() {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  var ctx = c.getContext('2d');

  // Warm earthy stone base with golden lantern highlight gradient
  var bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
  bgGrad.addColorStop(0, '#78350f');
  bgGrad.addColorStop(0.35, '#57534e');
  bgGrad.addColorStop(0.75, '#44403c');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Hand-painted rounded cobblestone blocks
  var rowH = 42;
  var palette = ['#78716c', '#a8a29e', '#57534e', '#854d0e', '#64748b', '#92400e'];
  for (var r = 0; r < 6; r++) {
    var y = r * rowH;
    var offset = (r % 2) * 32;
    for (var x = -32; x < 512; x += 64) {
      var bx = x + offset;
      ctx.fillStyle = palette[(r * 7 + Math.abs(x)) % palette.length];
      ctx.beginPath();
      ctx.roundRect(bx + 3, y + 3, 58, rowH - 6, 8);
      ctx.fill();

      // Warm top bevel highlight
      ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
      ctx.fillRect(bx + 6, y + 5, 52, 6);
    }
  }

  // Lush hanging green moss & ivy along the top edge of the stone bridge
  ctx.fillStyle = '#16a34a';
  for (var mx = 0; mx < 512; mx += 18) {
    var mh = 18 + ((mx * 13) % 34);
    ctx.beginPath();
    ctx.arc(mx + 9, mh * 0.5, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#4ade80';
  for (var mx2 = 8; mx2 < 512; mx2 += 24) {
    var mh2 = 12 + ((mx2 * 7) % 22);
    ctx.beginPath();
    ctx.arc(mx2, mh2 * 0.45, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  return window.upgradeCanvasTex(c, 3, 1);
}
var sharedCavernStoneTex = createStorybookMossyStoneTex();

// Paints a 1024x512 Enchanted Underground Cavern Panorama & composites `/public/assets/aistudio/image_82bcd4d4.png`!
function createEnchantedCavernPanoramaTex(cropMode) {
  var c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  var ctx = c.getContext('2d');

  // 1. Rich procedural storybook painting base (instant zero-latency availability)
  var skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0.0, '#1e1b4b');
  skyGrad.addColorStop(0.28, '#3b0764');
  skyGrad.addColorStop(0.58, '#0284c7');
  skyGrad.addColorStop(0.85, '#06b6d4');
  skyGrad.addColorStop(1.0, '#0f172a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Glowing atmospheric lightbeams & mist clouds
  var radialCenters = [
    { x: 512, y: 190, r: 290, col: 'rgba(56, 189, 248, 0.55)' },
    { x: 220, y: 260, r: 240, col: 'rgba(250, 204, 21, 0.42)' },
    { x: 820, y: 240, r: 250, col: 'rgba(236, 72, 153, 0.45)' },
    { x: 512, y: 390, r: 280, col: 'rgba(6, 182, 212, 0.65)' }
  ];
  radialCenters.forEach(function(rc) {
    var rg = ctx.createRadialGradient(rc.x, rc.y, 10, rc.x, rc.y, rc.r);
    rg.addColorStop(0, rc.col);
    rg.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 1024, 512);
  });

  // Distant stone arch bridge & waterfalls in the painted vista
  ctx.fillStyle = '#4c1d95';
  for (var sx = 0; sx < 1024; sx += 36) {
    var sh = 75 + ((sx * 19) % 95);
    ctx.beginPath();
    ctx.moveTo(sx - 18, 0);
    ctx.lineTo(sx + 18, 0);
    ctx.lineTo(sx, sh);
    ctx.closePath();
    ctx.fill();
  }

  var tex = window.upgradeCanvasTex(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;

  // 2. Load the reference illustration `/public/assets/aistudio/image_82bcd4d4.png` and composite
  //    the upper/distant cavern vistas (excluding the foreground train) with feathered edges!
  var refImg = new Image();
  refImg.crossOrigin = 'anonymous';
  refImg.onload = function() {
    var iw = refImg.width;
    var ih = refImg.height;
    if (cropMode === 'panorama') {
      // Draw the rich upper cavern vista (stalactites, distant waterfalls, stone arch bridge, blue/orange giant mushrooms, right grotto)
      // Top-right & center-top region (`x: 0.24..1.00, y: 0.00..0.60`) has ZERO train and pure storybook cavern scenery!
      ctx.save();
      ctx.drawImage(refImg, iw * 0.24, 0, iw * 0.76, ih * 0.58, 0, 0, 1024, 512);
      // Softly feather the bottom & side edges so it blends seamlessly into the 3D turquoise river & cavern walls
      var vig = ctx.createLinearGradient(0, 390, 0, 512);
      vig.addColorStop(0, 'rgba(6, 182, 212, 0)');
      vig.addColorStop(1, '#083344');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 390, 1024, 122);
      ctx.restore();
    } else if (cropMode === 'left_mine_grotto') {
      ctx.clearRect(0, 0, 1024, 512);
      // Bottom-left gnome gold-mining terrace (`x: 0.00..0.28, y: 0.46..0.98`)
      ctx.drawImage(refImg, 0, ih * 0.46, iw * 0.28, ih * 0.52, 60, 20, 904, 472);
    } else if (cropMode === 'right_crystal_grotto') {
      ctx.clearRect(0, 0, 1024, 512);
      // Mid-right crystal cavern grotto & gnomes (`x: 0.66..1.00, y: 0.24..0.78`)
      ctx.drawImage(refImg, iw * 0.66, ih * 0.24, iw * 0.34, ih * 0.54, 40, 20, 944, 472);
    }
    tex.needsUpdate = true;
  };
  refImg.onerror = function() {
    if (refImg.src.indexOf('public/') !== -1) {
      refImg.src = 'assets/aistudio/image_82bcd4d4.png';
    }
  };
  refImg.src = 'public/assets/aistudio/image_82bcd4d4.png';

  return tex;
}

// High-Resolution 512x512 Painted Storybook Cutout Sprite Generator (`THREE.Mesh` on vertical plane with alpha transparency)
// Paints adorable, softly shaded 2D/2.5D storybook characters & props that match `image_82bcd4d4.png`!
function createStorybookPaintedSpritePlane(kind, widthM, heightM) {
  var c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  var ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);

  if (kind === 'gnome_miner_gold' || kind === 'gnome_cart_pusher' || kind === 'gnome_lantern_crystal') {
    var hatCol = kind === 'gnome_miner_gold' ? '#ef4444' : (kind === 'gnome_cart_pusher' ? '#2563eb' : '#16a34a');
    var hatHi  = kind === 'gnome_miner_gold' ? '#fca5a5' : (kind === 'gnome_cart_pusher' ? '#93c5fd' : '#86efac');
    var coatCol = kind === 'gnome_miner_gold' ? '#15803d' : (kind === 'gnome_cart_pusher' ? '#b45309' : '#7e22ce');

    // Warm magical aura behind the gnome
    var aura = ctx.createRadialGradient(256, 300, 20, 256, 300, 210);
    aura.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    aura.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(256, 300, 210, 0, Math.PI * 2); ctx.fill();

    // Boots
    ctx.fillStyle = '#451a03';
    ctx.beginPath(); ctx.ellipse(215, 455, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(295, 455, 34, 22, 0, 0, Math.PI * 2); ctx.fill();

    // Tunic / Coat
    var coatGrad = ctx.createLinearGradient(170, 270, 340, 440);
    coatGrad.addColorStop(0, coatCol);
    coatGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = coatGrad;
    ctx.beginPath();
    ctx.moveTo(195, 265);
    ctx.quadraticCurveTo(165, 365, 175, 438);
    ctx.lineTo(337, 438);
    ctx.quadraticCurveTo(347, 365, 317, 265);
    ctx.closePath();
    ctx.fill();

    // Leather Belt & Gold Buckle
    ctx.fillStyle = '#292524';
    ctx.fillRect(176, 368, 160, 24);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.strokeRect(236, 364, 40, 32);

    // Fluffy White Storybook Beard with soft silver shading
    var beardGrad = ctx.createRadialGradient(256, 285, 15, 256, 320, 95);
    beardGrad.addColorStop(0, '#ffffff');
    beardGrad.addColorStop(0.75, '#f1f5f9');
    beardGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = beardGrad;
    ctx.beginPath();
    ctx.moveTo(182, 245);
    ctx.quadraticCurveTo(165, 335, 256, 385);
    ctx.quadraticCurveTo(347, 335, 330, 245);
    ctx.closePath();
    ctx.fill();

    // Rosy Face, Big Expressive Eyes & Bulbous Nose
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath(); ctx.arc(256, 225, 56, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath(); ctx.arc(212, 238, 16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(300, 238, 16, 0, Math.PI * 2); ctx.fill();

    // Eyes with white catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(234, 214, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(278, 214, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(235, 215, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(277, 215, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(238, 211, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(280, 211, 3.5, 0, Math.PI * 2); ctx.fill();

    // Cute round nose & smile
    var noseGrad = ctx.createRadialGradient(252, 232, 3, 256, 236, 18);
    noseGrad.addColorStop(0, '#fda4af');
    noseGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = noseGrad;
    ctx.beginPath(); ctx.arc(256, 236, 17, 0, Math.PI * 2); ctx.fill();

    // Curved Pointed Gnome Hat
    var hatGrad = ctx.createLinearGradient(180, 50, 320, 200);
    hatGrad.addColorStop(0, hatHi);
    hatGrad.addColorStop(0.4, hatCol);
    hatGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(182, 196);
    ctx.quadraticCurveTo(215, 65, 305, 48);
    ctx.quadraticCurveTo(315, 125, 330, 196);
    ctx.closePath();
    ctx.fill();

    // Glowing Gold Nuggets & Crystals at the Gnome's feet
    var gemCols = ['#facc15', '#fde047', '#38bdf8', '#c084fc', '#facc15'];
    for (var gi = 0; gi < 9; gi++) {
      ctx.fillStyle = gemCols[gi % gemCols.length];
      ctx.beginPath();
      ctx.arc(115 + gi * 34, 462 - (gi % 3) * 12, 16 + (gi % 2) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'mushroom_cluster_glow') {
    // Paint a lush bioluminescent cluster of 3 spotted fairy-tale mushrooms (Purple, Orange-Gold, Turquoise)
    var mDefs = [
      { cx: 165, cy: 265, r: 95, c1: '#f472b6', c2: '#7e22ce', stemX: 165, stemH: 185 },
      { cx: 345, cy: 295, r: 82, c1: '#fde047', c2: '#ea580c', stemX: 345, stemH: 160 },
      { cx: 256, cy: 195, r: 112, c1: '#67e8f9', c2: '#0284c7', stemX: 256, stemH: 255 }
    ];
    mDefs.forEach(function(md) {
      // Magical glow halo
      var halo = ctx.createRadialGradient(md.cx, md.cy, 15, md.cx, md.cy, md.r * 1.65);
      halo.addColorStop(0, md.c1);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(md.cx, md.cy, md.r * 1.65, 0, Math.PI * 2); ctx.fill();

      // Stem
      var stGrad = ctx.createLinearGradient(md.stemX - 24, md.cy, md.stemX + 24, md.cy + md.stemH);
      stGrad.addColorStop(0, '#fef3c7');
      stGrad.addColorStop(1, '#c084fc');
      ctx.fillStyle = stGrad;
      ctx.beginPath();
      ctx.moveTo(md.stemX - 18, md.cy + 10);
      ctx.quadraticCurveTo(md.stemX - 28, md.cy + md.stemH * 0.6, md.stemX - 32, md.cy + md.stemH);
      ctx.lineTo(md.stemX + 32, md.cy + md.stemH);
      ctx.quadraticCurveTo(md.stemX + 28, md.cy + md.stemH * 0.6, md.stemX + 18, md.cy + 10);
      ctx.closePath();
      ctx.fill();

      // Umbrella Cap
      var capGrad = ctx.createRadialGradient(md.cx - md.r * 0.25, md.cy - md.r * 0.25, 10, md.cx, md.cy, md.r);
      capGrad.addColorStop(0, '#ffffff');
      capGrad.addColorStop(0.25, md.c1);
      capGrad.addColorStop(1, md.c2);
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.arc(md.cx, md.cy, md.r, Math.PI, 0, false);
      ctx.quadraticCurveTo(md.cx, md.cy + 28, md.cx - md.r, md.cy);
      ctx.closePath();
      ctx.fill();

      // Glowing white fairy spots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      [[-0.45, -0.35, 0.14], [0, -0.58, 0.17], [0.45, -0.35, 0.14], [-0.22, -0.20, 0.11], [0.24, -0.22, 0.11]].forEach(function(sp) {
        ctx.beginPath();
        ctx.arc(md.cx + sp[0] * md.r, md.cy + sp[1] * md.r, sp[2] * md.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  var tex = window.upgradeCanvasTex(c);
  var mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(widthM, heightM), mat);
  return plane;
}

// Helper: Builds a Detailed 3D Storybook Gnome / Dwarf with Rosy Cheeks, Fluffy Beard, Pointed Hat, Pickaxe & Lantern!
function createDetailedGnome(hatHex, coatHex, hasPickaxe, hasLantern, scale) {
  var g = new THREE.Group();
  var sc = scale || 1.55;
  g.scale.set(sc, sc, sc);

  var bootsMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 });
  [-0.36, 0.36].forEach(function(bx) {
    var boot = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), bootsMat);
    boot.scale.set(0.95, 0.75, 1.45);
    boot.position.set(bx, 0.24, 0.16);
    g.add(boot);
  });

  var coat = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.94, 1.75, 16), new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.48 }));
  coat.position.y = 1.08;
  var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.79, 0.81, 0.30, 16), bootsMat);
  belt.position.y = 0.96;
  var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.18), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  buckle.position.set(0, 0.96, 0.79);
  g.add(coat, belt, buckle);

  var head = new THREE.Mesh(new THREE.SphereGeometry(0.64, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.42 }));
  head.position.y = 2.30;
  var nose = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.38 }));
  nose.position.set(0, 2.30, 0.61);

  var cheekMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  var eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  [-0.24, 0.24].forEach(function(ex) {
    var cheek = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), cheekMat);
    cheek.position.set(ex * 1.45, 2.18, 0.49);
    var ew = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), eyeWhiteMat);
    ew.position.set(ex, 2.46, 0.53);
    var ep = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), eyePupilMat);
    ep.position.set(ex, 2.46, 0.61);
    g.add(cheek, ew, ep);
  });

  var beardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
  var beard = new THREE.Mesh(new THREE.ConeGeometry(0.70, 1.50, 14), beardMat);
  beard.rotation.x = Math.PI * 0.92;
  beard.position.set(0, 1.74, 0.38);
  var mustacheL = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 10), beardMat);
  mustacheL.scale.set(1.5, 0.65, 0.8);
  mustacheL.position.set(-0.22, 2.08, 0.56);
  var mustacheR = mustacheL.clone();
  mustacheR.position.x = 0.22;

  var hat = new THREE.Mesh(new THREE.ConeGeometry(0.74, 1.92, 16), new THREE.MeshStandardMaterial({ color: hatHex, roughness: 0.42 }));
  hat.position.set(0, 3.45, -0.05);
  hat.rotation.x = -0.18;
  var hatBrim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.13, 8, 16), new THREE.MeshStandardMaterial({ color: hatHex, roughness: 0.42 }));
  hatBrim.rotation.x = Math.PI / 2;
  hatBrim.position.set(0, 2.58, 0);

  g.add(head, nose, beard, mustacheL, mustacheR, hat, hatBrim);

  var armPivot = new THREE.Group();
  armPivot.position.set(0.72, 1.68, 0.1);
  var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.98, 10), new THREE.MeshStandardMaterial({ color: coatHex }));
  arm.position.set(0.2, 0.35, 0.2);
  arm.rotation.x = Math.PI * 0.35;
  var hand = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfed7aa }));
  hand.position.set(0.22, 0.72, 0.48);
  armPivot.add(arm, hand);

  if (hasPickaxe) {
    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.85, 8), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    handle.position.set(0.25, 0.80, 0.55);
    var pickHead = new THREE.Mesh(new THREE.ConeGeometry(0.20, 1.38, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.2 }));
    pickHead.rotation.x = Math.PI / 2;
    pickHead.position.set(0.25, 1.55, 0.55);
    armPivot.add(handle, pickHead);
  }
  if (hasLantern) {
    var lFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.58, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lFrame.position.set(-0.85, 1.45, 0.48);
    var lTop = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.30, 8), bootsMat);
    lTop.position.set(-0.85, 1.84, 0.48);
    g.add(lFrame, lTop);
  }

  g.add(armPivot);
  g.userData.armPivot = armPivot;
  return g;
}

// Helper: Creates a Spotted Fairy-Tale Mushroom Cap Canvas Texture
function createSpottedMushroomCapTex() {
  var c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');
  var grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.28, '#f8fafc');
  grad.addColorStop(0.75, '#cbd5e1');
  grad.addColorStop(1, '#64748b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  var spots = [
    [128, 128, 22], [64, 78, 16], [192, 78, 16], [58, 168, 15],
    [198, 168, 15], [128, 52, 14], [128, 204, 14], [88, 134, 12], [168, 134, 12]
  ];
  spots.forEach(function(sp) {
    ctx.beginPath();
    ctx.arc(sp[0], sp[1], sp[2], 0, Math.PI * 2);
    ctx.fill();
  });
  return window.upgradeCanvasTex(c);
}
var sharedMushroomCapTex = createSpottedMushroomCapTex();

// Helper: Builds a Giant Color-Changing Fairy-Tale Magic Mushroom (`image_82bcd4d4.png`)
function createColorChangingMushroom(x, y, z, scale, phaseOffset) {
  var g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.set(scale, scale, scale);

  var stemMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
  var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.68, 2.85, 14), stemMat);
  stem.position.y = 1.42;
  var stemRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.11, 8, 14), stemMat);
  stemRing.rotation.x = Math.PI / 2;
  stemRing.position.y = 2.15;
  g.add(stem, stemRing);

  var gillMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  var gills = new THREE.Mesh(new THREE.CylinderGeometry(1.92, 0.44, 0.54, 20), gillMat);
  gills.position.y = 2.74;
  g.add(gills);

  var capMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, map: sharedMushroomCapTex });
  var cap = new THREE.Mesh(
    new THREE.SphereGeometry(2.10, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    capMat
  );
  cap.position.y = 2.62;
  g.add(cap);

  var spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (var s = 0; s < 9; s++) {
    var sAng = (s / 8) * Math.PI * 2;
    var sRad = s === 0 ? 0.0 : (s % 2 === 0 ? 1.08 : 1.56);
    var sY = s === 0 ? 4.66 : (s % 2 === 0 ? 4.25 : 3.68);
    var spot = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 10), spotMat);
    spot.scale.set(1, 0.42, 1);
    spot.position.set(Math.cos(sAng) * sRad, sY, Math.sin(sAng) * sRad);
    g.add(spot);
  }

  scene.add(g);
  window.magicMushrooms.push({
    group: g,
    capMat: capMat,
    gillMat: gillMat,
    phase: phaseOffset,
    baseScale: scale
  });
}

// Helper: Builds a Multi-Spire Glowing & Light-Reflecting Fairy-Tale Crystal Cluster (`image_82bcd4d4.png`)
function createCrystalCluster(x, y, z, colorHex, scale) {
  var g = new THREE.Group();
  g.position.set(x, y, z);
  var sc = scale || 1.0;
  g.scale.set(sc, sc, sc);

  var cMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.65,
    metalness: 0.35,
    roughness: 0.12
  });
  var coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72 });
  var angles = [
    { rx: 0.0, rz: 0.0, h: 3.4, r: 0.88, ox: 0, oz: 0 },
    { rx: 0.25, rz: 0.32, h: 2.6, r: 0.68, ox: -0.75, oz: 0.42 },
    { rx: -0.22, rz: -0.35, h: 2.7, r: 0.70, ox: 0.78, oz: -0.32 },
    { rx: 0.35, rz: -0.20, h: 2.0, r: 0.56, ox: 0.32, oz: 0.78 },
    { rx: -0.30, rz: 0.25, h: 1.9, r: 0.54, ox: -0.52, oz: -0.68 }
  ];
  angles.forEach(function(a) {
    var spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, a.r, a.h, 6), cMat);
    spire.position.set(a.ox, a.h * 0.45, a.oz);
    spire.rotation.set(a.rx, 0, a.rz);
    var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, a.r * 0.58, a.h * 0.86, 6), coreMat);
    tip.position.y = 0.15;
    spire.add(tip);
    g.add(spire);
  });

  scene.add(g);
  return g;
}

// Helper: Builds a Wooden Minecart overflowing with Sparkling Gold Nuggets & Blue Diamonds!
function createGoldMinecart(x, y, z, rotY) {
  var g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY || 0;

  var woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
  var ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 });
  var box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 3.6), woodMat);
  box.position.y = 1.20;
  var strap1 = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.66, 0.28), ironMat);
  strap1.position.set(0, 1.20, -0.98);
  var strap2 = strap1.clone();
  strap2.position.z = 0.98;
  g.add(box, strap1, strap2);

  [[-1.35, -1.08], [1.35, -1.08], [-1.35, 1.08], [1.35, 1.08]].forEach(function(wp) {
    var wh = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.30, 12), ironMat);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(wp[0], 0.50, wp[1]);
    g.add(wh);
  });

  var goldMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  var diaColors = [0x38bdf8, 0xf472b6, 0x4ade80, 0xc084fc, 0x67e8f9];
  for (var n = 0; n < 22; n++) {
    var isDia = n % 3 === 0;
    var gem = new THREE.Mesh(
      isDia ? new THREE.OctahedronGeometry(0.52, 0) : new THREE.DodecahedronGeometry(0.48, 0),
      isDia ? new THREE.MeshBasicMaterial({ color: diaColors[n % diaColors.length] }) : goldMat
    );
    gem.position.set(
      (Math.random() - 0.5) * 1.9,
      2.05 + Math.random() * 0.72,
      (Math.random() - 0.5) * 2.7
    );
    g.add(gem);
  }

  scene.add(g);
  return g;
}

// Builds a Multi-Arch Carved Mossy Stone Viaduct Causeway directly under the Underground Metro Tracks (`image_82bcd4d4.png` center!)
function buildUndergroundStoneArchCauseway(cz) {
  var g = new THREE.Group();
  g.position.set(0, 0, cz);

  var causewayMat = new THREE.MeshStandardMaterial({
    map: sharedCavernStoneTex,
    roughness: 0.75
  });
  var trimMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.78 });
  var mossTrimMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
  var lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });

  // 5 Carved Stone Arches spanning from x = -65 to x = +65 (each span = 26m, from y = -35.8 up to y = -26.0)
  var numSpans = 5;
  var spanLen = 26.0;
  for (var s = 0; s < numSpans; s++) {
    var centerX = -52.0 + s * spanLen;
    var halfSpan = spanLen * 0.5;
    var archShape = new THREE.Shape();
    archShape.moveTo(-halfSpan, 0);
    archShape.lineTo(-8.8, 0);
    archShape.absellipse(0, 0, 8.8, 7.2, Math.PI, 0, true);
    archShape.lineTo(halfSpan, 0);
    archShape.lineTo(halfSpan, 9.8);
    archShape.lineTo(-halfSpan, 9.8);
    archShape.closePath();

    var aGeo = new THREE.ExtrudeGeometry(archShape, { depth: 7.4, bevelEnabled: false, curveSegments: 24 });
    aGeo.translate(centerX, -35.8, -3.7);
    var aMesh = new THREE.Mesh(aGeo, causewayMat);
    g.add(aMesh);

    // Stone arch voussoirs + Hanging Golden Lantern inside every stone arch (`image_82bcd4d4.png`!)
    for (var vi = 0; vi <= 10; vi++) {
      var ang = (vi / 10) * Math.PI;
      var vx = centerX + Math.cos(ang) * 9.0;
      var vy = -35.8 + Math.sin(ang) * 7.4;
      var vStone = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 7.8), trimMat);
      vStone.position.set(vx, vy, 0);
      vStone.rotation.z = ang - Math.PI * 0.5;
      g.add(vStone);
    }

    // Warm Golden Hanging Lantern inside the arch vault
    var archChain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), ironMat);
    archChain.position.set(centerX, -29.2, 0);
    var archLantern = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 12), lanternMat);
    archLantern.position.set(centerX, -30.2, 0);
    g.add(archChain, archLantern);

    // Lush green ivy drapes hanging down the stone piers
    [-halfSpan + 1.8, halfSpan - 1.8].forEach(function(ix) {
      var ivy = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.2, 8), mossTrimMat);
      ivy.rotation.x = Math.PI;
      ivy.position.set(centerX + ix, -27.8, 3.8);
      var ivyBack = ivy.clone();
      ivyBack.position.z = -3.8;
      g.add(ivy, ivyBack);
    });
  }

  // Cobblestone Parapet Ledges & Warm Lantern Posts along the Viaduct Deck (`y = -25.9`)
  [-3.85, 3.85].forEach(function(pz) {
    var parapet = new THREE.Mesh(new THREE.BoxGeometry(132.0, 0.42, 0.55), trimMat);
    parapet.position.set(0, -25.88, pz);
    g.add(parapet);
  });

  [-39, -13, 13, 39].forEach(function(lx) {
    [-3.85, 3.85].forEach(function(lz) {
      var post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 1.6, 8), ironMat);
      post.position.set(lx, -25.0, lz);
      var globe = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), lanternMat);
      globe.position.set(lx, -24.1, lz);
      g.add(post, globe);
    });
  });

  scene.add(g);
}

// Builds a Warmly Lit Stone Brick Underground Tunnel Portal with Hanging Golden Lanterns (`image_82bcd4d4.png` top-left & right!)
function buildUndergroundCavernTunnelPortal(x, y, z, rotY) {
  var g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;

  var warmTube = new THREE.Mesh(
    new THREE.CylinderGeometry(7.0, 7.0, 20.0, 20, 1, true, -Math.PI * 0.5, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
  );
  warmTube.rotation.z = Math.PI / 2;
  warmTube.rotation.y = Math.PI / 2;
  warmTube.position.set(0, 4.2, -9.5);
  g.add(warmTube);

  var bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  [-2.5, -7.5, -12.5].forEach(function(lz) {
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 10), bulbMat);
    lamp.position.set(0, 9.8, lz);
    g.add(lamp);
  });

  var archShape = new THREE.Shape();
  archShape.moveTo(-7.0, -1.0);
  archShape.lineTo(-7.0, 4.4);
  archShape.absarc(0, 4.4, 7.0, Math.PI, 0, true);
  archShape.lineTo(7.0, -1.0);
  archShape.lineTo(10.5, -1.0);
  archShape.lineTo(10.5, 5.0);
  archShape.absarc(0, 5.0, 10.5, 0, Math.PI, false);
  archShape.lineTo(-10.5, -1.0);
  archShape.closePath();

  var archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 4.2, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, curveSegments: 22 });
  archGeo.translate(0, 0, -2.1);
  var archMesh = new THREE.Mesh(archGeo, new THREE.MeshStandardMaterial({ map: sharedCavernStoneTex, roughness: 0.78 }));
  g.add(archMesh);

  // Hanging Golden Lanterns flanking the stone tunnel portal (`image_82bcd4d4.png` top-left!)
  [-6.2, 0, 6.2].forEach(function(lx, li) {
    var ly = li === 1 ? 12.2 : 8.6;
    var outerLamp = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), bulbMat);
    outerLamp.position.set(lx, ly, 1.8);
    g.add(outerLamp);
  });

  scene.add(g);
}

// Build the 4 Surface Metro Station Portals & Rich 2.5D Illustrated + 3D Spatial Underground World!
(function buildMetroPortalsAndUndergroundWorld() {
  // 1. Place the 4 Surface Metro Station Tunnel Portals at `portalPosA` / `portalPosB` (61m inward along the straight diagonal!)
  var metroPortalConfigs = [
    { pos: subwayEdges[0].portalPosA, dir: subwayEdges[0].portalDirA, label: "Ⓜ️ Metro Station 1", hexStr: "#1d4ed8", col: 0x2563eb },
    { pos: subwayEdges[0].portalPosB, dir: subwayEdges[0].portalDirB, label: "Ⓜ️ Metro Station 3", hexStr: "#7e22ce", col: 0x9333ea },
    { pos: subwayEdges[2].portalPosA, dir: subwayEdges[2].portalDirA, label: "Ⓜ️ Metro Station 2", hexStr: "#15803d", col: 0x16a34a },
    { pos: subwayEdges[2].portalPosB, dir: subwayEdges[2].portalDirB, label: "Ⓜ️ Metro Station 4", hexStr: "#c2410c", col: 0xea580c }
  ];
  metroPortalConfigs.forEach(function(mc) {
    buildGrandMetroStationPortal(mc.pos, mc.dir, mc.label, mc.hexStr, mc.col);
  });

  // 2. Render the Metro Track Curves (Straight surface approach [0.15..0.26],
  //    Underground Stone Arch Viaduct causeway [0.33..0.67], and Exit straight approach [0.74..0.85])!
  subwayEdges.forEach(function(se, idx) {
    if (idx % 2 === 0) {
      renderSingleTrackCurve(se.curve, true, se, 0.15, 0.26);
      renderSingleTrackCurve(se.curve, true, se, 0.33, 0.67);
      renderSingleTrackCurve(se.curve, true, se, 0.74, 0.85);
    }
  });

  var cavernRockMat  = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.82, side: THREE.DoubleSide });
  var warmRockMat    = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.78 });
  var mossMat        = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
  var woodBeamMat    = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.78 });
  var goldMat        = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  var lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // ==========================================================================
  // LAYER 1: MULTI-PLANE ILLUSTRATED PARALLAX BACKDROP & GROTTO LAYERS
  // (Uses `/public/assets/aistudio/image_82bcd4d4.png` + high-res painted canvases
  //  that shift smoothly in 3D parallax as Toby drives across the cavern!)
  // ==========================================================================
  var panoramaTex = createEnchantedCavernPanoramaTex('panorama');
  var leftGrottoTex = createEnchantedCavernPanoramaTex('left_mine_grotto');
  var rightGrottoTex = createEnchantedCavernPanoramaTex('right_crystal_grotto');

  var panoramaMat = new THREE.MeshBasicMaterial({
    map: panoramaTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.96
  });
  var leftGrottoMat = new THREE.MeshBasicMaterial({
    map: leftGrottoTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });
  var rightGrottoMat = new THREE.MeshBasicMaterial({
    map: rightGrottoTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });

  // Place Parallax Illustrated Layers on BOTH sides of the Cavern (`z = -56` for Line 1-3 and `z = +56` for Line 2-4)
  [-1, 1].forEach(function(zSign) {
    // 1A. Far Panoramic Cavern Cyclorama (`z = ±58`, `y = -17.5`)
    var bgPanorama = new THREE.Mesh(new THREE.PlaneGeometry(185, 48), panoramaMat);
    bgPanorama.position.set(0, -17.5, zSign * 58.0);
    if (zSign > 0) bgPanorama.rotation.y = Math.PI;
    scene.add(bgPanorama);
    window.undergroundParallaxLayers.push({
      mesh: bgPanorama,
      baseX: 0,
      parallaxFactor: 0.28
    });

    // 1B. Midground Left Gold-Mine Grotto Layer (`x = -46`, `z = ±36`)
    var leftCard = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), leftGrottoMat);
    leftCard.position.set(-46, -22.5, zSign * 36.0);
    if (zSign > 0) leftCard.rotation.y = Math.PI;
    scene.add(leftCard);
    window.undergroundParallaxLayers.push({
      mesh: leftCard,
      baseX: -46,
      parallaxFactor: 0.16
    });

    // 1C. Midground Right Crystal & Gnome Grotto Layer (`x = +46`, `z = ±36`)
    var rightCard = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), rightGrottoMat);
    rightCard.position.set(46, -22.5, zSign * 36.0);
    if (zSign > 0) rightCard.rotation.y = Math.PI;
    scene.add(rightCard);
    window.undergroundParallaxLayers.push({
      mesh: rightCard,
      baseX: 46,
      parallaxFactor: 0.16
    });
  });

  // ==========================================================================
  // LAYER 2: GLOWING TURQUOISE UNDERGROUND RIVER, MULTI-ARCH STONE VIADUCT
  // CAUSEWAYS (`z = -8` and `z = +8`), & DISTANT STONE ARCH BRIDGES!
  // ==========================================================================
  var ugFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 260),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
  );
  ugFloor.rotation.x = -Math.PI / 2;
  ugFloor.position.set(0, -36.0, 0);
  scene.add(ugFloor);

  // Shimmering Turquoise River with painted cyan/emerald water bands
  var riverCanvas = document.createElement('canvas');
  riverCanvas.width = 512; riverCanvas.height = 512;
  var rCtx = riverCanvas.getContext('2d');
  var rGrad = rCtx.createLinearGradient(0, 0, 512, 0);
  rGrad.addColorStop(0.0, '#083344');
  rGrad.addColorStop(0.2, '#0284c7');
  rGrad.addColorStop(0.5, '#22d3ee');
  rGrad.addColorStop(0.8, '#0284c7');
  rGrad.addColorStop(1.0, '#083344');
  rCtx.fillStyle = rGrad;
  rCtx.fillRect(0, 0, 512, 512);
  rCtx.fillStyle = 'rgba(224, 242, 254, 0.45)';
  for (var rw = 0; rw < 60; rw++) {
    rCtx.beginPath();
    rCtx.ellipse((rw * 73) % 480 + 16, (rw * 41) % 490 + 10, 28, 4, 0, 0, Math.PI * 2);
    rCtx.fill();
  }
  var ugRiverTex = window.upgradeCanvasTex(riverCanvas, 2, 3);
  window.waterfallTextures.push(ugRiverTex);

  var ugRiver = new THREE.Mesh(
    new THREE.PlaneGeometry(135, 160),
    new THREE.MeshBasicMaterial({ map: ugRiverTex })
  );
  ugRiver.rotation.x = -Math.PI / 2;
  ugRiver.position.set(0, -35.4, 0);
  scene.add(ugRiver);

  // Rich Fairy-Tale Point Lights illuminating the Underground Diorama
  var ugLights = [
    { x:   0, y: -16, z: -24, col: 0x38bdf8, int: 3.8, dist: 190 },
    { x: -46, y: -18, z:   0, col: 0xfacc15, int: 3.6, dist: 165 },
    { x:  46, y: -18, z:   0, col: 0xf472b6, int: 3.6, dist: 165 },
    { x:   0, y: -20, z:  24, col: 0x22d3ee, int: 3.5, dist: 175 },
    { x:   0, y: -12, z:   0, col: 0xfef08a, int: 3.0, dist: 190 }
  ];
  ugLights.forEach(function(ul) {
    var pl = new THREE.PointLight(ul.col, ul.int, ul.dist);
    pl.position.set(ul.x, ul.y, ul.z);
    scene.add(pl);
  });

  // Build the 5-Arch Carved Mossy Stone Viaduct Causeways & Tunnel Portals for both Metro Tracks!
  [-8.0, 8.0].forEach(function(cz) {
    buildUndergroundStoneArchCauseway(cz);
    buildUndergroundCavernTunnelPortal(-64, -25.8, cz,  Math.PI / 2);
    buildUndergroundCavernTunnelPortal( 64, -25.8, cz, -Math.PI / 2);
  });

  // Sculpted Cavern Ceiling with Stalactites, Hanging Green Vines & Golden Hanging Lanterns (`y = -6.5`)
  for (var cx = -72; cx <= 72; cx += 16) {
    for (var cz2 = -42; cz2 <= 42; cz2 += 21) {
      var roofRock = new THREE.Mesh(new THREE.DodecahedronGeometry(12.0, 1), cavernRockMat);
      roofRock.scale.set(1.4, 0.52, 1.4);
      roofRock.position.set(cx, -5.8, cz2);
      scene.add(roofRock);

      var stal = new THREE.Mesh(new THREE.ConeGeometry(2.1, 7.2, 8), cavernRockMat);
      stal.rotation.x = Math.PI;
      stal.position.set(cx + 3, -10.2, cz2);
      scene.add(stal);

      if ((Math.abs(cx) + Math.abs(cz2)) % 32 === 0) {
        var vine = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.5, 8), mossMat);
        vine.rotation.x = Math.PI;
        vine.position.set(cx - 2, -9.2, cz2 + 2);
        var chain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 6), woodBeamMat);
        chain.position.set(cx, -10.5, cz2);
        var lantern = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10), lanternGlowMat);
        lantern.position.set(cx, -13.0, cz2);
        scene.add(vine, chain, lantern);
      }
    }
  }

  // ==========================================================================
  // LAYER 3: 3 MULTI-TIERED TURQUOISE WATERFALLS, UPPER STONE ARCH BRIDGE,
  // & WOODEN GNOME FOOTBRIDGES (`image_82bcd4d4.png` center!)
  // ==========================================================================
  function createWaterfallScrollTexture() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.22, '#22d3ee');
    grad.addColorStop(0.5, '#e0f2fe');
    grad.addColorStop(0.78, '#22d3ee');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (var i = 0; i < 55; i++) {
      var sx = (i * 37) % 240;
      var sy = (i * 53) % 220;
      ctx.fillRect(sx, sy, 7, 42);
    }
    var tex = window.upgradeCanvasTex(c, 2, 3);
    window.waterfallTextures.push(tex);
    return tex;
  }

  var wfTex = createWaterfallScrollTexture();
  var waterSheetMat = new THREE.MeshBasicMaterial({ map: wfTex, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
  var foamMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.92 });

  // Build Multi-Tiered Waterfalls + Upper Stone Arch Bridge on both sides (`z = -40` and `z = +40`)
  [
    { x:   0, z: -40, ang: 0,        sc: 1.15 },
    { x: -26, z: -44, ang: 0.18,     sc: 0.82 },
    { x:  26, z: -44, ang: -0.18,    sc: 0.82 },
    { x:   0, z:  40, ang: Math.PI,  sc: 1.15 },
    { x: -26, z:  44, ang: Math.PI - 0.18, sc: 0.82 },
    { x:  26, z:  44, ang: Math.PI + 0.18, sc: 0.82 }
  ].forEach(function(wl, wIdx) {
    var wfG = new THREE.Group();
    wfG.position.set(wl.x, -35.2, wl.z);
    wfG.rotation.y = wl.ang;
    wfG.scale.set(wl.sc, wl.sc, wl.sc);

    [-13, 0, 13].forEach(function(cx, ci) {
      var cliffH = ci === 1 ? 25.0 : 27.5;
      var cliff = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 12.0, cliffH, 12), cavernRockMat);
      cliff.position.set(cx, cliffH * 0.5, -4.5);
      var mossCap = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 1.2, 12), mossMat);
      mossCap.position.set(cx, cliffH, -4.5);
      wfG.add(cliff, mossCap);
    });

    var upperStream = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 9.0, 13.5, 18, 1, true, -Math.PI * 0.38, Math.PI * 0.76), waterSheetMat);
    upperStream.position.set(0, 20.5, -1.5);
    var midPool = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 11.2, 1.6, 16), foamMat);
    midPool.position.set(0, 13.5, 1.2);
    var lowerStream = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 11.4, 13.5, 18, 1, true, -Math.PI * 0.40, Math.PI * 0.80), waterSheetMat);
    lowerStream.position.set(0, 6.8, 0.5);
    var bottomPool = new THREE.Mesh(new THREE.CylinderGeometry(13.8, 13.8, 0.5, 24), foamMat);
    bottomPool.position.set(0, 0.4, 4.5);
    wfG.add(upperStream, midPool, lowerStream, bottomPool);

    var drops = [];
    for (var di = 0; di < 24; di++) {
      var dMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55 + (di % 3) * 0.22, 8, 8), foamMat);
      wfG.add(dMesh);
      drops.push({
        mesh: dMesh,
        progress: di / 24,
        xOff: ((di * 7) % 15 - 7) * 0.92,
        speed: 0.016 + (di % 4) * 0.004
      });
    }

    scene.add(wfG);
    window.undergroundWaterfalls.push({ group: wfG, drops: drops, pool: bottomPool, phase: wIdx * 1.1 });
  });

  // Arched Wooden Gnome Footbridges across the Turquoise Underground River (`image_82bcd4d4.png` center!)
  [-21, 21].forEach(function(bz) {
    var fbG = new THREE.Group();
    fbG.position.set(0, -34.2, bz);
    var archDeck = new THREE.Mesh(new THREE.CylinderGeometry(14.5, 14.5, 4.8, 20, 1, false, -Math.PI * 0.28, Math.PI * 0.56), woodBeamMat);
    archDeck.rotation.x = Math.PI / 2;
    archDeck.position.y = -9.8;
    fbG.add(archDeck);

    for (var postIdx = -3; postIdx <= 3; postIdx++) {
      var px = postIdx * 3.2;
      var py = Math.cos((postIdx / 4) * 0.9) * 3.2 + 1.2;
      [-2.1, 2.1].forEach(function(pz) {
        var post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.9, 8), woodBeamMat);
        post.position.set(px, py + 0.9, pz);
        fbG.add(post);
      });
    }

    var bridgeGnome = createDetailedGnome(0xef4444, 0x2563eb, false, true, 1.55);
    bridgeGnome.position.set(0, 4.4, 0);
    fbG.add(bridgeGnome);
    window.subwayGnomes.push({ mesh: bridgeGnome, baseY: 4.4, phase: bz * 0.2 });

    scene.add(fbG);
  });

  // ==========================================================================
  // LAYER 4: LEFT GOLD-MINING TERRACES, RIGHT BIOLUMINESCENT MUSHROOM GROTTO,
  // PAINTED 2.5D STORYBOOK CUTOUT SPRITES & FOREGROUND VIGNETTES!
  // ==========================================================================
  var hatPalette  = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x9333ea];
  var coatPalette = [0x1d4ed8, 0xb45309, 0x15803d, 0x7e22ce, 0xdc2626];

  [-24, 24].forEach(function(sideZ, sIdx) {
    // 1. Left Gold-Mining Terraces (`x = -46, -28`): Wooden Mine Scaffolding, Gold Piles, Minecarts & Gnomes!
    [-46, -28].forEach(function(lx, lIdx) {
      var terrY = -30.2 + lIdx * 2.2;
      var rockTerr = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 14.5, 8.2, 12), warmRockMat);
      rockTerr.position.set(lx, terrY - 4.0, sideZ);
      var woodFloor = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.65, 12.5), woodBeamMat);
      woodFloor.position.set(lx, terrY, sideZ);
      scene.add(rockTerr, woodFloor);

      var postL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 8.8, 0.95), woodBeamMat);
      postL.position.set(lx - 5.6, terrY + 4.4, sideZ - 3.5);
      var postR = postL.clone();
      postR.position.x = lx + 5.6;
      var topBeam = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.05, 1.15), woodBeamMat);
      topBeam.position.set(lx, terrY + 8.6, sideZ - 3.5);
      var mineLamp = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 10), lanternGlowMat);
      mineLamp.position.set(lx, terrY + 7.4, sideZ - 3.5);
      scene.add(postL, postR, topBeam, mineLamp);

      // Sparkling Pile of Gold Nuggets & Diamonds
      for (var gn = 0; gn < 18; gn++) {
        var nug = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78 + (gn % 3) * 0.26, 0), goldMat);
        nug.position.set(
          lx - 3.6 + (gn % 4) * 1.35,
          terrY + 0.65 + Math.floor(gn / 4) * 0.55,
          sideZ - 1.5 + ((gn * 3) % 3) * 1.1
        );
        scene.add(nug);
      }
      createCrystalCluster(lx + 4.6, terrY + 0.3, sideZ + 2.0, lIdx === 0 ? 0xa855f7 : 0x38bdf8, 1.55);

      // 3D Animated Gnome + Painted 2.5D Cutout Gnome Companion
      var minerGnome = createDetailedGnome(
        hatPalette[(sIdx * 2 + lIdx) % hatPalette.length],
        coatPalette[(sIdx * 2 + lIdx + 1) % coatPalette.length],
        true,
        true,
        1.68
      );
      minerGnome.position.set(lx + 1.4, terrY + 0.3, sideZ + 1.8);
      minerGnome.lookAt(lx, terrY + 1.5, 0);
      scene.add(minerGnome);
      window.subwayGnomes.push({ mesh: minerGnome, baseY: terrY + 0.3, phase: (sIdx * 3 + lIdx) * 0.9 });

      var spriteGnome = createStorybookPaintedSpritePlane(lIdx === 0 ? 'gnome_miner_gold' : 'gnome_cart_pusher', 7.5, 7.5);
      spriteGnome.position.set(lx - 4.2, terrY + 3.8, sideZ + (sideZ < 0 ? 3.5 : -3.5));
      if (sideZ < 0) spriteGnome.rotation.y = 0; else spriteGnome.rotation.y = Math.PI;
      scene.add(spriteGnome);

      // Animated Gold-Filled Wooden Minecart rolling on miniature wooden rails!
      var cartPos = new THREE.Vector3(lx - 1.2, terrY + 0.35, sideZ + (sideZ < 0 ? 4.4 : -4.4));
      var cart = createGoldMinecart(cartPos.x, cartPos.y, cartPos.z, Math.PI / 2);
      window.goldMinecarts.push({
        mesh: cart,
        basePos: cartPos,
        dir: new THREE.Vector3(1, 0, 0),
        phase: (sIdx * 2 + lIdx) * 1.4
      });
    });

    // 2. Right Bioluminescent Mushroom & Crystal Terraces (`x = +26, +46`)
    [26, 46].forEach(function(rx, rIdx) {
      var terrY = -30.2 + rIdx * 2.2;
      var rockTerr = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 15.5, 8.2, 12), cavernRockMat);
      rockTerr.position.set(rx, terrY - 4.0, sideZ);
      var mossFloor = new THREE.Mesh(new THREE.CylinderGeometry(12.6, 12.6, 0.85, 12), mossMat);
      mossFloor.position.set(rx, terrY, sideZ);
      scene.add(rockTerr, mossFloor);

      var mushOffsets = [
        { dx: -4.4, dz: -2.6, sc: 1.95, ph: 0.0 },
        { dx:  4.0, dz: -3.0, sc: 2.45, ph: 1.6 },
        { dx: -1.6, dz:  3.2, sc: 1.55, ph: 3.1 },
        { dx:  4.6, dz:  2.8, sc: 1.75, ph: 4.7 }
      ];
      mushOffsets.forEach(function(mo, mIdx) {
        createColorChangingMushroom(
          rx + mo.dx,
          terrY + 0.2,
          sideZ + mo.dz,
          mo.sc,
          sIdx * 2.0 + rIdx * 1.3 + mo.ph + mIdx * 0.8
        );
      });

      // Painted 2.5D Bioluminescent Mushroom Cluster Cutout Sprite for extra lush illustration density!
      var mushSprite = createStorybookPaintedSpritePlane('mushroom_cluster_glow', 9.5, 9.5);
      mushSprite.position.set(rx + 2.5, terrY + 4.6, sideZ + (sideZ < 0 ? 3.8 : -3.8));
      if (sideZ > 0) mushSprite.rotation.y = Math.PI;
      scene.add(mushSprite);

      createCrystalCluster(rx - 5.4, terrY + 0.3, sideZ + 1.5, rIdx === 0 ? 0xf472b6 : 0x4ade80, 1.6);
      createCrystalCluster(rx + 1.2, terrY + 0.3, sideZ - 4.2, 0x38bdf8, 1.45);

      var mushGnome = createDetailedGnome(
        hatPalette[(sIdx * 3 + rIdx + 2) % hatPalette.length],
        coatPalette[(sIdx * 3 + rIdx) % coatPalette.length],
        true,
        true,
        1.68
      );
      mushGnome.position.set(rx - 1.0, terrY + 0.35, sideZ);
      mushGnome.lookAt(rx - 8, terrY + 1.5, 0);
      scene.add(mushGnome);
      window.subwayGnomes.push({ mesh: mushGnome, baseY: terrY + 0.35, phase: (sIdx * 4 + rIdx) * 1.1 });

      // Diamond-filled wooden minecart on the right terrace too (`image_82bcd4d4.png` bottom-right!)
      var rCartPos = new THREE.Vector3(rx + 1.8, terrY + 0.35, sideZ + (sideZ < 0 ? 4.2 : -4.2));
      var rCart = createGoldMinecart(rCartPos.x, rCartPos.y, rCartPos.z, Math.PI / 2);
      window.goldMinecarts.push({
        mesh: rCart,
        basePos: rCartPos,
        dir: new THREE.Vector3(1, 0, 0),
        phase: (sIdx * 2 + rIdx + 1) * 1.7
      });
    });
  });

  // Central Causeway Ledges (`z = 0`) between the two Metro Viaducts: Gnomes, Crystals & Rainbow Mushrooms right beside the train!
  [-42, -20, 20, 42].forEach(function(cx, cIdx) {
    var centerLedge = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 7.6, 9.2, 12), cavernRockMat);
    centerLedge.position.set(cx, -30.5, 0);
    var centerMoss = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.75, 12), mossMat);
    centerMoss.position.set(cx, -26.0, 0);
    scene.add(centerLedge, centerMoss);

    createColorChangingMushroom(cx + 2.4, -25.8, 0, 1.68, cIdx * 1.7);
    createCrystalCluster(cx - 2.4, -25.7, 0, [0x38bdf8, 0xf472b6, 0xfacc15, 0x4ade80][cIdx % 4], 1.38);

    var centerGnome = createDetailedGnome(
      hatPalette[cIdx % hatPalette.length],
      coatPalette[(cIdx + 2) % coatPalette.length],
      true,
      true,
      1.58
    );
    centerGnome.position.set(cx, -25.6, 0);
    scene.add(centerGnome);
    window.subwayGnomes.push({ mesh: centerGnome, baseY: -25.6, phase: cIdx * 1.3 });
  });

  // ==========================================================================
  // LAYER 5: 90 FLOATING BIOLUMINESCENT SPORES & FIREFLY LIGHTS IN THE CAVERN
  // ==========================================================================
  var sporeCols = [0xfef08a, 0x67e8f9, 0xf472b6, 0x4ade80, 0xc084fc];
  for (var fi = 0; fi < 90; fi++) {
    var spMat = new THREE.MeshBasicMaterial({
      color: sporeCols[fi % sporeCols.length],
      transparent: true,
      opacity: 0.85
    });
    var spMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24 + (fi % 3) * 0.10, 8, 8), spMat);
    var bx = (Math.random() - 0.5) * 135;
    var by = -33.0 + Math.random() * 23.0;
    var bz2 = (Math.random() - 0.5) * 76;
    spMesh.position.set(bx, by, bz2);
    scene.add(spMesh);
    window.cavernFireflies.push({
      mesh: spMesh,
      baseX: bx,
      baseY: by,
      baseZ: bz2,
      speed: 0.8 + (fi % 5) * 0.35,
      phase: fi * 0.7
    });
  }
})();

// ============================================================================
// HERO VIADUCT BACKGROUND HILLS, WOODEN BRIDGE, SKYLINE & TRAFFIC LIGHT
// ============================================================================
(function buildStorybookHeroBackdrop() {
  var backdropGroup = new THREE.Group();

  var hill1Mat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 });
  var hill2Mat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 });
  var hill3Mat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.9 });

  var hills = [
    { x: -135, y: -14, z: -265, rx: 115, ry: 44, rz: 48, mat: hill1Mat },
    { x:  -20, y: -16, z: -285, rx: 145, ry: 54, rz: 55, mat: hill3Mat },
    { x:   95, y: -14, z: -260, rx: 115, ry: 42, rz: 48, mat: hill2Mat }
  ];
  hills.forEach(function(h) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), h.mat);
    m.scale.set(h.rx, h.ry, h.rz);
    m.position.set(h.x, h.y, h.z);
    m.receiveShadow = true;
    backdropGroup.add(m);
  });

  var towerColors = [0x93c5fd, 0x60a5fa, 0xbfdbfe, 0x7dd3fc, 0xa5b4fc];
  for (var i = 0; i < 18; i++) {
    var tw = 9 + (i % 4) * 3.5;
    var th = 22 + (i % 5) * 9;
    var tx = -125 + i * 14;
    var tz = -330 - (i % 3) * 12;
    var tMat = new THREE.MeshBasicMaterial({ color: towerColors[i % towerColors.length] });
    var tower = new THREE.Mesh(new THREE.BoxGeometry(tw, th, tw), tMat);
    tower.position.set(tx, th * 0.5 + 10, tz);
    backdropGroup.add(tower);
  }

  var cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var cloudPositions = [
    { x: -120, y: 58, z: -340, s: 1.3 },
    { x:  -25, y: 66, z: -350, s: 1.6 },
    { x:   75, y: 60, z: -335, s: 1.25 },
    { x:  165, y: 54, z: -320, s: 1.1 }
  ];
  cloudPositions.forEach(function(cp) {
    var cg = new THREE.Group();
    var blobs = [
      { ox: 0, oy: 0, r: 9 },
      { ox: -8, oy: -2, r: 6.5 },
      { ox: 8, oy: -1.5, r: 7 },
      { ox: -14, oy: -4, r: 5 },
      { ox: 14, oy: -3.5, r: 5.5 }
    ];
    blobs.forEach(function(b) {
      var sp = new THREE.Mesh(new THREE.SphereGeometry(b.r, 16, 16), cloudMat);
      sp.position.set(b.ox, b.oy, 0);
      sp.scale.set(1.2, 0.85, 0.6);
      cg.add(sp);
    });
    cg.position.set(cp.x, cp.y, cp.z);
    cg.scale.set(cp.s, cp.s, cp.s);
    backdropGroup.add(cg);
  });

  // Rustic Wooden Trestle Footbridge in the valley
  var woodBridgeG = new THREE.Group();
  var woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
  var darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  var deck = new THREE.Mesh(new THREE.BoxGeometry(34, 0.6, 4.2), woodMat);
  deck.position.set(0, 5.2, 0);
  woodBridgeG.add(deck);
  for (var lx = -14; lx <= 14; lx += 7) {
    var legL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 5.5, 8), darkWoodMat);
    legL.position.set(lx, 2.6, -1.6);
    var legR = legL.clone();
    legR.position.z = 1.6;
    woodBridgeG.add(legL, legR);
  }
  woodBridgeG.position.set(-82, 0.8, -205);
  woodBridgeG.rotation.y = 0.28;
  backdropGroup.add(woodBridgeG);

  // Cute Storybook Traffic Light by the Viaduct Road
  var tlG = new THREE.Group();
  var poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 6.2, 12), poleMat);
  pole.position.y = 3.1;
  var box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.2, 1.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }));
  box.position.y = 5.4;
  var redLight = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  redLight.position.set(0, 6.3, 0.52);
  var yelLight = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  yelLight.position.set(0, 5.4, 0.52);
  var grnLight = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  grnLight.position.set(0, 4.5, 0.52);
  tlG.add(pole, box, redLight, yelLight, grnLight);
  tlG.position.set(-22.5, window.getRoadHeight(-22.5, -162), -162);
  tlG.rotation.y = -0.35;
  backdropGroup.add(tlG);

  scene.add(backdropGroup);
})();

// Glowing Green/Yellow/Orange Preview Dots for Next Switch Turn
window.highlightDots = [];
var hDotGeo = new THREE.BoxGeometry(2.6, 0.42, 2.2);
var hDotMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
for (var hi = 0; hi < 18; hi++) {
  var hd = new THREE.Mesh(hDotGeo, hDotMat.clone());
  scene.add(hd);
  highlightDots.push(hd);
}
