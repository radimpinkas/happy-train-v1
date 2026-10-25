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
window.grassMesh = grass;

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
window.riverMesh = river;
window.tracksRiverMesh = river;

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

window.allSurfaceSigns = [];
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
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: window.upgradeCanvasTex(c), transparent: true, depthTest: true }));
  sp.scale.set((w || 20) * 0.62, (h || 5.0) * 0.62, 1);
  window.allSurfaceSigns.push(sp);
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

  var surfA1 = pA.clone().add(dirA.clone().multiplyScalar(38)); // u = 0.16 (Turnout end in front of entry portal)
  var surfA2 = pA.clone().add(dirA.clone().multiplyScalar(61)); // u ≈ 0.191 (Entry Portal front arch)
  var surfA3 = pA.clone().add(dirA.clone().multiplyScalar(76)); // u ≈ 0.212 (Back of covered station shell)

  var surfB3 = pB.clone().add(dirB.clone().multiplyScalar(76)); // u ≈ 0.788 (Back of exit covered station shell)
  var surfB2 = pB.clone().add(dirB.clone().multiplyScalar(61)); // u ≈ 0.809 (Exit Portal front arch)
  var surfB1 = pB.clone().add(dirB.clone().multiplyScalar(38)); // u = 0.84 (Turnout start in front of exit portal)

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
  var pCavernPreStart = new THREE.Vector3(-80 * signX, -25.5, cavernOffsetZ);
  var pCavernStart    = new THREE.Vector3(-64 * signX, -25.5, cavernOffsetZ);
  var pCavernEnd      = new THREE.Vector3( 64 * signX, -25.5, cavernOffsetZ);
  var pCavernPostEnd  = new THREE.Vector3( 80 * signX, -25.5, cavernOffsetZ);

  // Cubic Bezier control points for smooth horizontal & vertical alignment into the Straight Cavern Approach:
  // Enters along `dirA` at surfA3 and arrives at `pCavernPreStart` (-80 * signX) already aligned with the X-axis
  // so the last 16m before the Cavern Portal (-64 * signX) is 100% straight along X!
  var downP0 = surfA3.clone();
  var downP1 = surfA3.clone().add(dirA.clone().multiplyScalar(28.0));
  downP1.y = portalSurfaceYA - 6.5;
  var downP2 = new THREE.Vector3(-112 * signX, -25.5, cavernOffsetZ);
  var downP3 = pCavernPreStart.clone();

  var upP0 = pCavernPostEnd.clone();
  var upP1 = new THREE.Vector3(112 * signX, -25.5, cavernOffsetZ);
  var upP2 = surfB3.clone().add(dirB.clone().multiplyScalar(28.0));
  upP2.y = portalSurfaceYB - 6.5;
  var upP3 = surfB3.clone();

  function evalCubicBezier(p0, p1, p2, p3, t) {
    var u = 1.0 - t;
    var b0 = u * u * u;
    var b1 = 3.0 * u * u * t;
    var b2 = 3.0 * u * t * t;
    var b3 = t * t * t;
    return new THREE.Vector3(
      b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
      b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
      b0 * p0.z + b1 * p1.z + b2 * p2.z + b3 * p3.z
    );
  }

  // Build active curve strictly from surfA1 (s = 0.0 -> u = 0.16) to surfB1 (s = 1.0 -> u = 0.84)
  // so that turnouts at u = 0.16 and u = 0.84 connect 100% in front of the Metro Station arches!
  var rawPts = [];
  var sSteps = 80;
  for (var k = 0; k <= sSteps; k++) {
    var s = k / sSteps;
    var pt = new THREE.Vector3();
    if (s <= 0.09) {
      // Straight & level from turnout (surfA1, 38m) through front arch (surfA2, 61m) into station shell (surfA3, 76m)
      var tA = s / 0.09;
      pt.lerpVectors(surfA1, surfA3, tA);
      pt.y = portalSurfaceYA;
    } else if (s < 0.34) {
      // Smooth Cubic Bezier descent inside enclosed tunnel tube from surfA3 down to pCavernPreStart (-80 * signX)
      var tDown = (s - 0.09) / 0.25;
      pt.copy(evalCubicBezier(downP0, downP1, downP2, downP3, tDown));
    } else if (s <= 0.66) {
      // 100% straight & level along X from -80 * signX through the Cavern Portals (±64 * signX) to +80 * signX!
      var tCav = (s - 0.34) / 0.32;
      pt.lerpVectors(pCavernPreStart, pCavernPostEnd, tCav);
      pt.y = -25.5;
      pt.z = cavernOffsetZ;
    } else if (s < 0.91) {
      // Smooth Cubic Bezier ascent inside enclosed tunnel tube from pCavernPostEnd (+80 * signX) up to surfB3
      var tUp = (s - 0.66) / 0.25;
      pt.copy(evalCubicBezier(upP0, upP1, upP2, upP3, tUp));
    } else {
      // Straight & level from inside exit station shell (surfB3, 76m) out through front arch (surfB2, 61m) to surfB1 (38m)
      var tB = (s - 0.91) / 0.09;
      pt.lerpVectors(surfB3, surfB1, tB);
      pt.y = portalSurfaceYB;
    }
    rawPts.push(pt);
  }

  var rawCurve = new THREE.CatmullRomCurve3(rawPts, false);
  var rawLength = rawCurve.getLength();

  // Map u in [0.16, 0.84] linearly to arc-length s in [0.0, 1.0] on rawCurve
  var curve = {
    rawCurve: rawCurve,
    getLength: function() {
      return rawLength / 0.68;
    },
    getPointAt: function(u) {
      var s = Math.max(0.0, Math.min(1.0, (u - 0.16) / 0.68));
      return rawCurve.getPointAt(s);
    },
    getTangentAt: function(u) {
      var s = Math.max(0.0, Math.min(1.0, (u - 0.16) / 0.68));
      return rawCurve.getTangentAt(s);
    }
  };

  // Find exact u coordinates for entry portal arch, cavern start/end portals, and exit portal arch
  function findClosestU(targetPt, uMin, uMax) {
    var bestU = (uMin + uMax) * 0.5;
    var bestD = 999999;
    for (var i = 0; i <= 120; i++) {
      var uTest = uMin + (i / 120) * (uMax - uMin);
      var d = curve.getPointAt(uTest).distanceTo(targetPt);
      if (d < bestD) { bestD = d; bestU = uTest; }
    }
    return bestU;
  }

  var uPortalEntry = findClosestU(surfA2, 0.16, 0.25);
  var uCavernStart = findClosestU(pCavernStart, 0.32, 0.46);
  var uCavernEnd   = findClosestU(pCavernEnd, 0.54, 0.68);
  var uPortalExit  = findClosestU(surfB2, 0.75, 0.84);

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
    uPortalEntry: uPortalEntry,
    uCavernStart: uCavernStart,
    uCavernEnd: uCavernEnd,
    uPortalExit: uPortalExit,
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

  // Register surface Metro approaches, Station Portals, and upper ramp corridors in `allTrackSamples`
  // so `isNearTrack` prevents any house, tree, or flower from spawning inside the Metro Station or ramp tunnel!
  var perpSub = new THREE.Vector3(-dirA.z, 0, dirA.x).normalize();
  for (var mSample = 0; mSample <= 48; mSample++) {
    var uMS = 0.16 + (mSample / 48) * 0.68;
    if (uMS <= 0.36 || uMS >= 0.64) {
      var ptMS = curve.getPointAt(uMS);
      allTrackSamples.push(ptMS.clone());
      allTrackSamples.push(ptMS.clone().add(perpSub.clone().multiplyScalar(8.5)));
      allTrackSamples.push(ptMS.clone().add(perpSub.clone().multiplyScalar(-8.5)));
    }
  }
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
    new THREE.Vector3( -30, 0, -118),
    new THREE.Vector3( -30, 0, -195), // Drives NORTH dead-center under the Hero Viaduct Arch!
    new THREE.Vector3( -95, 0, -225),
    new THREE.Vector3(-145, 0, -175),
    new THREE.Vector3(-132, 0, -122),
    new THREE.Vector3( -85, 0,  -45),
    new THREE.Vector3( -72, 0,   42), // Same-Level Crossing #4 across J_WEST->J_CENTER!
    new THREE.Vector3(   0, 0,   92), // Same-Level Crossing #5 across J_CENTER->J_SOUTH!
    new THREE.Vector3(  72, 0,   42), // Same-Level Crossing #6 across J_CENTER->J_EAST!
    new THREE.Vector3(  85, 0,  -45),
    new THREE.Vector3(  68, 0, -118)
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

    var isSurfaceMetroApproach = e.isSubway && (u <= (e.uPortalEntry || 0.195) + 0.038 || u >= (e.uPortalExit || 0.805) - 0.038);
    var trackParent = (e.isSubway && !isSurfaceMetroApproach && window.undergroundWorldGroup) ? window.undergroundWorldGroup : scene;

    var sl = new THREE.Mesh(slGeo, slMat);
    sl.position.set(p.x, p.y + 0.12, p.z);
    sl.rotation.order = 'YXZ';
    sl.rotation.y = ang;
    sl.rotation.x = pitch;
    trackParent.add(sl);

    var px = Math.cos(ang) * 0.92, pz = -Math.sin(ang) * 0.92;
    var r1 = new THREE.Mesh(rlGeo, rlMat);
    r1.position.set(p.x + px, p.y + 0.28, p.z + pz);
    r1.rotation.order = 'YXZ'; r1.rotation.y = ang; r1.rotation.x = pitch;

    var r2 = new THREE.Mesh(rlGeo, rlMat);
    r2.position.set(p.x - px, p.y + 0.28, p.z - pz);
    r2.rotation.order = 'YXZ'; r2.rotation.y = ang; r2.rotation.x = pitch;
    trackParent.add(r1, r2);

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
      trackParent.add(bal);

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
  if (edge.isSubway) {
    var uEntry = edge.uPortalEntry || 0.195;
    var uExit  = edge.uPortalExit  || 0.805;
    return (t >= uEntry && t <= uExit);
  }
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
window.metroPortalBlockerMeshes = [];
window.undergroundWorldGroup = new THREE.Group();
window.undergroundWorldGroup.visible = false;
scene.add(window.undergroundWorldGroup);

// Builds a Storybook Arched Metro Station Building on the Surface where the train enters horizontally
// along the straight diagonal approach (`u = 0.16 .. 0.23`) 61m away from the corner junctions!
function buildGrandMetroStationPortal(entryPt, intoTunnelDir, stationLabel, themeHexStr, themeColorHex) {
  var g = new THREE.Group();
  g.position.set(entryPt.x, entryPt.y - 0.28, entryPt.z);
  g.rotation.y = Math.atan2(intoTunnelDir.x, intoTunnelDir.z);

  var stationRoofMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.65,
    transparent: true,
    opacity: 1.0
  });
  window.tunnelRoofMeshes.push(stationRoofMat);

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

  var shellGeo = new THREE.ExtrudeGeometry(stShape, { depth: 26.0, bevelEnabled: true, bevelSize: 0.22, bevelThickness: 0.22, curveSegments: 22 });
  shellGeo.translate(0, 0, -4.0);
  var shellMesh = new THREE.Mesh(shellGeo, stationRoofMat);
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  g.add(shellMesh);

  // 2. Hollow Outer Grassy Hill Arch wrapping around the back of the Metro Station (extended to z = +30m to enclose the upper stone tunnel bore!)
  var hillArchShape = new THREE.Shape();
  hillArchShape.moveTo(-9.5, -1.5);
  hillArchShape.lineTo(-9.5, 5.2);
  hillArchShape.absarc(0, 5.2, 9.5, Math.PI, 0, true);
  hillArchShape.lineTo(9.5, -1.5);
  hillArchShape.lineTo(14.6, -1.5);
  hillArchShape.quadraticCurveTo(13.5, 9.8, 0, 15.2);
  hillArchShape.quadraticCurveTo(-13.5, 9.8, -14.6, -1.5);
  hillArchShape.closePath();

  var hillArchMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.88,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
  });
  window.tunnelRoofMeshes.push(hillArchMat);

  var hillArchGeo = new THREE.ExtrudeGeometry(hillArchShape, { depth: 28.0, bevelEnabled: false, curveSegments: 20 });
  hillArchGeo.translate(0, 0, 2.0);
  var hillMound = new THREE.Mesh(hillArchGeo, hillArchMat);
  g.add(hillMound);

  // 3. Colored Arch Header Band on the Front Entrance (Blue / Green / Purple / Orange)
  var headerShape = new THREE.Shape();
  headerShape.absarc(0, 4.9, 7.05, 0, Math.PI, false);
  headerShape.absarc(0, 4.9, 9.3, Math.PI, 0, true);
  headerShape.closePath();
  var headerGeo = new THREE.ExtrudeGeometry(headerShape, { depth: 1.4, bevelEnabled: false, curveSegments: 22 });
  headerGeo.translate(0, 0, -4.6);
  var headerMat = new THREE.MeshBasicMaterial({ color: themeColorHex });
  var hArch = new THREE.Mesh(headerGeo, headerMat);
  g.add(hArch);

  // 4. Warm Golden Glowing Interior Vault Ceiling, Solid Under-Track Floor Slab & Side Platforms
  var innerGlowGeo = new THREE.CylinderGeometry(6.8, 6.8, 16.0, 18, 1, true, -Math.PI * 0.5, Math.PI);
  var innerGlow = new THREE.Mesh(
    innerGlowGeo,
    new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide })
  );
  innerGlow.rotation.z = Math.PI / 2;
  innerGlow.rotation.y = Math.PI / 2;
  innerGlow.position.set(0, 4.7, 4.0);
  g.add(innerGlow);

  var stationFloorSlab = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.9, 28.0),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
  );
  stationFloorSlab.position.set(0, -0.42, 9.5);
  g.add(stationFloorSlab);

  var platMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  [-5.1, 5.1].forEach(function(px) {
    var plat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 16.0), platMat);
    plat.position.set(px, 0.42, 4.0);
    g.add(plat);
  });

  // 6. Large Prague Metro Symbol Emblem (Velký znak pražského metra) above the Metro Entrance Arch!
  var mSign = window.createPragueMetroEntranceSign
    ? window.createPragueMetroEntranceSign(themeHexStr)
    : window.makeSign(stationLabel, themeHexStr, "#ffffff", 20, 10);
  mSign.position.set(0, 16.5, -3.5);
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
  c.width = cropMode === 'panorama' ? 2048 : 1024;
  c.height = 512;
  var cw = c.width;
  var ch = c.height;
  var ctx = c.getContext('2d');

  // 1. Rich procedural storybook painting base (instant zero-latency availability)
  var skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
  skyGrad.addColorStop(0.0, '#1e1b4b');
  skyGrad.addColorStop(0.28, '#3b0764');
  skyGrad.addColorStop(0.58, '#0284c7');
  skyGrad.addColorStop(0.85, '#06b6d4');
  skyGrad.addColorStop(1.0, '#0f172a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Glowing atmospheric lightbeams & mist clouds
  var radialCenters = [
    { x: cw * 0.50, y: 190, r: 290, col: 'rgba(56, 189, 248, 0.55)' },
    { x: cw * 0.21, y: 260, r: 240, col: 'rgba(250, 204, 21, 0.42)' },
    { x: cw * 0.80, y: 240, r: 250, col: 'rgba(236, 72, 153, 0.45)' },
    { x: cw * 0.50, y: 390, r: 280, col: 'rgba(6, 182, 212, 0.65)' }
  ];
  radialCenters.forEach(function(rc) {
    var rg = ctx.createRadialGradient(rc.x, rc.y, 10, rc.x, rc.y, rc.r);
    rg.addColorStop(0, rc.col);
    rg.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, cw, ch);
  });

  // Distant stone arch bridge & waterfalls in the painted vista
  ctx.fillStyle = '#4c1d95';
  for (var sx = 0; sx < cw; sx += 36) {
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

  // 2. Load the full panorama `/public/assets/aistudio/panorama1_f97480a3.jpeg` for 'panorama' mode
  //    (preserving exact aspect ratio on the 185x48m 3D plane without cropping), while keeping
  //    `image_82bcd4d4.png` for the existing side cards.
  var primaryPath = cropMode === 'panorama'
    ? 'public/assets/aistudio/panorama1_f97480a3.jpeg'
    : 'public/assets/aistudio/image_82bcd4d4.png';
  var fallbackPath = cropMode === 'panorama'
    ? 'assets/aistudio/panorama1_f97480a3.jpeg'
    : 'assets/aistudio/image_82bcd4d4.png';

  var refImg = new Image();
  refImg.crossOrigin = 'anonymous';
  refImg.onload = function() {
    var iw = refImg.width;
    var ih = refImg.height;
    if (cropMode === 'panorama') {
      ctx.save();
      ctx.clearRect(0, 0, cw, ch);

      // Compute exact undistorted width on the 185x48m 3D plane so the 1456x816 image has 1:1 proportions
      var planeAspect = 185.0 / 48.0;
      var imgAspect = iw / Math.max(1, ih);
      var drawW = Math.round(cw * (imgAspect / planeAspect));
      var drawX = Math.round((cw - drawW) * 0.5);

      // Fill outer side wings with horizontally mirrored extensions so edges never cut off near tunnel portals
      ctx.save();
      ctx.translate(drawX, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(refImg, 0, 0, iw, ih, 0, 0, drawW, ch);
      ctx.restore();

      ctx.save();
      ctx.translate(drawX + drawW * 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(refImg, 0, 0, iw, ih, 0, 0, drawW, ch);
      ctx.restore();

      // Draw the complete, uncropped panorama image in the center with exact aspect ratio
      ctx.drawImage(refImg, 0, 0, iw, ih, drawX, 0, drawW, ch);

      // Softly darken far outer left/right edges into cavern fog (#140b29) and blend bottom edge into the river
      var leftEdgeGrad = ctx.createLinearGradient(0, 0, drawX + 40, 0);
      leftEdgeGrad.addColorStop(0.0, 'rgba(20, 11, 41, 0.92)');
      leftEdgeGrad.addColorStop(0.65, 'rgba(20, 11, 41, 0.35)');
      leftEdgeGrad.addColorStop(1.0, 'rgba(20, 11, 41, 0.0)');
      ctx.fillStyle = leftEdgeGrad;
      ctx.fillRect(0, 0, drawX + 40, ch);

      var rightEdgeGrad = ctx.createLinearGradient(drawX + drawW - 40, 0, cw, 0);
      rightEdgeGrad.addColorStop(0.0, 'rgba(20, 11, 41, 0.0)');
      rightEdgeGrad.addColorStop(0.35, 'rgba(20, 11, 41, 0.35)');
      rightEdgeGrad.addColorStop(1.0, 'rgba(20, 11, 41, 0.92)');
      ctx.fillStyle = rightEdgeGrad;
      ctx.fillRect(drawX + drawW - 40, 0, cw - (drawX + drawW - 40), ch);

      var vig = ctx.createLinearGradient(0, ch - 80, 0, ch);
      vig.addColorStop(0, 'rgba(6, 182, 212, 0)');
      vig.addColorStop(1, '#083344');
      ctx.fillStyle = vig;
      ctx.fillRect(0, ch - 80, cw, 80);
      ctx.restore();
    } else if (cropMode === 'left_mine_grotto') {
      ctx.clearRect(0, 0, cw, ch);
      // Bottom-left gnome gold-mining terrace (`x: 0.00..0.28, y: 0.46..0.98`)
      ctx.drawImage(refImg, 0, ih * 0.46, iw * 0.28, ih * 0.52, 60, 20, 904, 472);
    } else if (cropMode === 'right_crystal_grotto') {
      ctx.clearRect(0, 0, cw, ch);
      // Mid-right crystal cavern grotto & gnomes (`x: 0.66..1.00, y: 0.24..0.78`)
      ctx.drawImage(refImg, iw * 0.66, ih * 0.24, iw * 0.34, ih * 0.54, 40, 20, 944, 472);
    }
    tex.needsUpdate = true;
  };
  refImg.onerror = function() {
    if (refImg.src.indexOf('public/') !== -1) {
      refImg.src = fallbackPath;
    }
  };
  refImg.src = primaryPath;

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

  window.undergroundWorldGroup.add(g);
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

  window.undergroundWorldGroup.add(g);
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

  window.undergroundWorldGroup.add(g);
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

  window.undergroundWorldGroup.add(g);
}

// Builds an Open Hollow Stone Brick Underground Tunnel Portal with Hanging Golden Lanterns
// (Compact 7.6m outer width so parallel portals at z = -8 and z = +8 never overlap!)
function buildUndergroundCavernTunnelPortal(x, y, z, rotY) {
  var g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;

  var bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  var stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.78 });
  var trimCol = [0x94a3b8, 0xcbd5e1, 0x78716c, 0xf59e0b];

  var archShape = new THREE.Shape();
  archShape.moveTo(-5.8, -1.0);
  archShape.lineTo(-5.8, 4.4);
  archShape.absarc(0, 4.4, 5.8, Math.PI, 0, true);
  archShape.lineTo(5.8, -1.0);
  archShape.lineTo(7.6, -1.0);
  archShape.lineTo(7.6, 4.8);
  archShape.absarc(0, 4.8, 7.6, 0, Math.PI, false);
  archShape.lineTo(-7.6, -1.0);
  archShape.closePath();

  var archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 3.2, bevelEnabled: true, bevelSize: 0.18, bevelThickness: 0.18, curveSegments: 22 });
  archGeo.translate(0, 0, -1.6);
  var archMesh = new THREE.Mesh(archGeo, stoneMat);
  g.add(archMesh);

  for (var i = 0; i <= 12; i++) {
    var ang = (i / 12) * Math.PI;
    var vx = Math.cos(ang) * 6.4;
    var vy = 4.4 + Math.sin(ang) * 6.4;
    var voussoir = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.0, 3.6),
      new THREE.MeshStandardMaterial({ color: trimCol[i % trimCol.length], roughness: 0.75 })
    );
    voussoir.position.set(vx, vy, 0);
    voussoir.rotation.z = ang - Math.PI / 2;
    g.add(voussoir);
  }

  // Hanging Golden Lanterns flanking the stone tunnel portal
  [-5.2, 0, 5.2].forEach(function(lx, li) {
    var ly = li === 1 ? 11.2 : 8.2;
    var outerLamp = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), bulbMat);
    outerLamp.position.set(lx, ly, 1.6);
    g.add(outerLamp);
  });

  window.undergroundWorldGroup.add(g);
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

  // 2. Build Open-Ended Horseshoe Arch Tunnel Tubes with Solid Under-Track Floor & Warm Lanterns
  //    (Uses an open-bottom horseshoe contour like `buildHollowDriveThroughTunnel` + flat floor slab
  //     under the rails, isolated per Metro Line so no wall ever crosses the track!)
  var rampArchShape = new THREE.Shape();
  rampArchShape.moveTo(-6.2, -0.4);
  rampArchShape.lineTo(-6.2, 4.4);
  rampArchShape.absarc(0, 4.4, 6.2, Math.PI, 0, true);
  rampArchShape.lineTo(6.2, -0.4);
  rampArchShape.lineTo(7.2, -0.4);
  rampArchShape.lineTo(7.2, 4.6);
  rampArchShape.absarc(0, 4.6, 7.2, 0, Math.PI, false);
  rampArchShape.lineTo(-7.2, -0.4);
  rampArchShape.closePath();

  var rampRingGeo = new THREE.ExtrudeGeometry(rampArchShape, { depth: 5.4, bevelEnabled: false, curveSegments: 18 });
  rampRingGeo.translate(0, 0, -2.7);
  var rampFloorGeo = new THREE.BoxGeometry(14.8, 0.85, 5.8);
  var rampStoneMat = new THREE.MeshStandardMaterial({
    map: sharedCavernStoneTex,
    color: 0x94a3b8,
    emissive: 0x1e1b4b,
    emissiveIntensity: 0.28,
    roughness: 0.82,
    side: THREE.DoubleSide
  });
  var rampFloorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.90
  });
  var rampLampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  var blockerArchShape = new THREE.Shape();
  blockerArchShape.moveTo(-6.6, -0.6);
  blockerArchShape.lineTo(-6.6, 4.5);
  blockerArchShape.absarc(0, 4.5, 6.6, Math.PI, 0, true);
  blockerArchShape.lineTo(6.6, -0.6);
  blockerArchShape.closePath();
  var blockerArchGeo = new THREE.ShapeGeometry(blockerArchShape, 18);
  var blockerArchMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });

  function addPortalDepthBlockerAtU(se, uBlocker) {
    var ptB = se.curve.getPointAt(uBlocker);
    var tanB = se.curve.getTangentAt(uBlocker).normalize();
    var angYB = Math.atan2(tanB.x, tanB.z);
    var horizLenB = Math.hypot(tanB.x, tanB.z) || 0.001;
    var pitchXB = -Math.atan2(tanB.y, horizLenB);

    var bMesh = new THREE.Mesh(blockerArchGeo, blockerArchMat);
    bMesh.position.copy(ptB);
    bMesh.rotation.order = 'YXZ';
    bMesh.rotation.y = angYB;
    bMesh.rotation.x = pitchXB;
    scene.add(bMesh);
    window.metroPortalBlockerMeshes.push(bMesh);
  }

  function buildSubwayRampTunnelTube(se, uStart, uEnd, targetGroup) {
    var ringSteps = 44;
    for (var ri = 0; ri < ringSteps; ri++) {
      var uMid = uStart + ((ri + 0.5) / ringSteps) * (uEnd - uStart);
      var pt = se.curve.getPointAt(uMid);
      var tan = se.curve.getTangentAt(uMid).normalize();
      var angY = Math.atan2(tan.x, tan.z);
      var horizLen = Math.hypot(tan.x, tan.z) || 0.001;
      var pitchX = -Math.atan2(tan.y, horizLen);

      var rGroup = new THREE.Group();
      rGroup.position.copy(pt);
      rGroup.rotation.order = 'YXZ';
      rGroup.rotation.y = angY;
      rGroup.rotation.x = pitchX;

      var wallMesh = new THREE.Mesh(rampRingGeo, rampStoneMat);
      var floorMesh = new THREE.Mesh(rampFloorGeo, rampFloorMat);
      floorMesh.position.set(0, -0.68, 0);
      rGroup.add(wallMesh, floorMesh);

      if (ri % 3 === 1) {
        [-5.4, 5.4].forEach(function(lx) {
          var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), rampLampMat);
          bulb.position.set(lx, 4.6, 0);
          rGroup.add(bulb);
        });
      }

      // Upper rings sitting inside the surface Metro Station hill mound (`z = +11m .. +26m`)
      // stay permanently in `scene` so the stone tunnel bore is ALWAYS visible from the station entrance!
      var isUpperStationSleeve = (uMid <= se.uPortalEntry + 0.036) || (uMid >= se.uPortalExit - 0.036);
      if (isUpperStationSleeve) {
        scene.add(rGroup);
      } else {
        targetGroup.add(rGroup);
      }
    }
  }

  // Render full continuous Metro Track Curves [0.16 .. 0.84] & Enclosed Ramp Tunnel Tubes per Metro Line!
  subwayEdges.forEach(function(se, idx) {
    if (idx % 2 === 0) {
      var lineRampGroup = new THREE.Group();
      window.undergroundWorldGroup.add(lineRampGroup);
      se.rampTunnelGroup = lineRampGroup;
      if (subwayEdges[idx + 1]) subwayEdges[idx + 1].rampTunnelGroup = lineRampGroup;

      renderSingleTrackCurve(se.curve, true, se, 0.16, 0.84);
      buildSubwayRampTunnelTube(se, se.uPortalEntry + 0.015, se.uCavernStart - 0.004, lineRampGroup);
      buildSubwayRampTunnelTube(se, se.uCavernEnd + 0.004, se.uPortalExit - 0.015, lineRampGroup);
      addPortalDepthBlockerAtU(se, se.uPortalEntry + 0.036);
      addPortalDepthBlockerAtU(se, se.uPortalExit - 0.036);
    }
  });

  var cavernRockMat  = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.82, side: THREE.DoubleSide });
  var warmRockMat    = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.78 });
  var mossMat        = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.72 });
  var woodBeamMat    = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.78 });
  var goldMat        = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  var lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // ==========================================================================
  // LAYER 1: FAR PANORAMIC CAVERN BACKDROP (`panorama1_f97480a3.jpeg` ONLY)
  // Positioned deep underground (`y = -21.5`, top edge at `y = -8.5m`) and spanning
  // `x = -61 .. +61` strictly between the cavern portals so ramps never cross it!
  // ==========================================================================
  var panoramaTex = createEnchantedCavernPanoramaTex('panorama');

  var panoramaMat = new THREE.MeshBasicMaterial({
    map: panoramaTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.98
  });

  // Place Panoramic Cavern Backdrop on BOTH sides of the Cavern (`z = -48` for Line 1-3 and `z = +48` for Line 2-4)
  [-1, 1].forEach(function(zSign) {
    var bgPanorama = new THREE.Mesh(new THREE.PlaneGeometry(122, 26), panoramaMat);
    bgPanorama.position.set(0, -21.5, zSign * 48.0);
    if (zSign > 0) bgPanorama.rotation.y = Math.PI;
    window.undergroundWorldGroup.add(bgPanorama);
    window.undergroundParallaxLayers.push({
      mesh: bgPanorama,
      baseX: 0,
      parallaxFactor: 0.14
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
  window.undergroundWorldGroup.add(ugFloor);

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
  window.undergroundWorldGroup.add(ugRiver);

  // Rich Fairy-Tale Point Lights illuminating the Underground Diorama (balanced intensity so colors stay vivid)
  var ugLights = [
    { x:   0, y: -16, z: -24, col: 0x38bdf8, int: 1.15, dist: 110 },
    { x: -46, y: -18, z:   0, col: 0xfacc15, int: 1.05, dist: 95 },
    { x:  46, y: -18, z:   0, col: 0xf472b6, int: 1.05, dist: 95 },
    { x:   0, y: -20, z:  24, col: 0x22d3ee, int: 1.15, dist: 110 },
    { x:   0, y: -12, z:   0, col: 0xfef08a, int: 0.90, dist: 110 }
  ];
  ugLights.forEach(function(ul) {
    var pl = new THREE.PointLight(ul.col, ul.int, ul.dist);
    pl.position.set(ul.x, ul.y, ul.z);
    window.undergroundWorldGroup.add(pl);
  });

  // Build the 5-Arch Carved Mossy Stone Viaduct Causeways & Tunnel Portals for both Metro Tracks!
  [-8.0, 8.0].forEach(function(cz) {
    buildUndergroundStoneArchCauseway(cz);
    buildUndergroundCavernTunnelPortal(-64, -25.8, cz,  Math.PI / 2);
    buildUndergroundCavernTunnelPortal( 64, -25.8, cz, -Math.PI / 2);
  });

  // Deep Underground Cavern Stalactites & Hanging Lanterns (`y = -11.5`, well below the surface terrain!)
  for (var cx = -56; cx <= 56; cx += 16) {
    for (var cz2 = -36; cz2 <= 36; cz2 += 24) {
      var stal = new THREE.Mesh(new THREE.ConeGeometry(1.8, 5.5, 8), cavernRockMat);
      stal.rotation.x = Math.PI;
      stal.position.set(cx + 2, -11.5, cz2);
      window.undergroundWorldGroup.add(stal);

      if ((Math.abs(cx) + Math.abs(cz2)) % 32 === 0) {
        var vine = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.8, 8), mossMat);
        vine.rotation.x = Math.PI;
        vine.position.set(cx - 2, -11.2, cz2 + 2);
        var chain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 6), woodBeamMat);
        chain.position.set(cx, -11.8, cz2);
        var lantern = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 10), lanternGlowMat);
        lantern.position.set(cx, -13.8, cz2);
        window.undergroundWorldGroup.add(vine, chain, lantern);
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

  // Build Slender, Translucent Waterfalls on the outer flanks (`x = ±32`, `z = ±48`)
  // WITHOUT opaque backing cylinders so `bgPanorama` remains completely unobstructed!
  [
    { x: -32, z: -48, ang: 0.12,          sc: 0.65 },
    { x:  32, z: -48, ang: -0.12,         sc: 0.65 },
    { x: -32, z:  48, ang: Math.PI - 0.12, sc: 0.65 },
    { x:  32, z:  48, ang: Math.PI + 0.12, sc: 0.65 }
  ].forEach(function(wl, wIdx) {
    var wfG = new THREE.Group();
    wfG.position.set(wl.x, -35.2, wl.z);
    wfG.rotation.y = wl.ang;
    wfG.scale.set(wl.sc, wl.sc, wl.sc);

    var upperStream = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 13.5, 16, 1, true, -Math.PI * 0.35, Math.PI * 0.70), waterSheetMat);
    upperStream.position.set(0, 20.5, -0.5);
    var midPool = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.9, 14), foamMat);
    midPool.position.set(0, 13.5, 0.4);
    var lowerStream = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.6, 13.5, 16, 1, true, -Math.PI * 0.38, Math.PI * 0.76), waterSheetMat);
    lowerStream.position.set(0, 6.8, 0.2);
    var bottomPool = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.4, 20), foamMat);
    bottomPool.position.set(0, 0.4, 1.5);
    wfG.add(upperStream, midPool, lowerStream, bottomPool);

    var drops = [];
    for (var di = 0; di < 14; di++) {
      var dMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38 + (di % 3) * 0.14, 8, 8), foamMat);
      wfG.add(dMesh);
      drops.push({
        mesh: dMesh,
        progress: di / 14,
        xOff: ((di * 7) % 9 - 4) * 0.55,
        speed: 0.016 + (di % 4) * 0.004
      });
    }

    window.undergroundWorldGroup.add(wfG);
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

    window.undergroundWorldGroup.add(fbG);
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
      window.undergroundWorldGroup.add(rockTerr, woodFloor);

      var postL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 8.8, 0.95), woodBeamMat);
      postL.position.set(lx - 5.6, terrY + 4.4, sideZ - 3.5);
      var postR = postL.clone();
      postR.position.x = lx + 5.6;
      var topBeam = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.05, 1.15), woodBeamMat);
      topBeam.position.set(lx, terrY + 8.6, sideZ - 3.5);
      var mineLamp = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 10), lanternGlowMat);
      mineLamp.position.set(lx, terrY + 7.4, sideZ - 3.5);
      window.undergroundWorldGroup.add(postL, postR, topBeam, mineLamp);

      // Sparkling Pile of Gold Nuggets & Diamonds
      for (var gn = 0; gn < 18; gn++) {
        var nug = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78 + (gn % 3) * 0.26, 0), goldMat);
        nug.position.set(
          lx - 3.6 + (gn % 4) * 1.35,
          terrY + 0.65 + Math.floor(gn / 4) * 0.55,
          sideZ - 1.5 + ((gn * 3) % 3) * 1.1
        );
        window.undergroundWorldGroup.add(nug);
      }
      createCrystalCluster(lx + 4.6, terrY + 0.3, sideZ + 2.0, lIdx === 0 ? 0xa855f7 : 0x38bdf8, 1.55);

      // 3D Animated Gnome in the foreground
      var minerGnome = createDetailedGnome(
        hatPalette[(sIdx * 2 + lIdx) % hatPalette.length],
        coatPalette[(sIdx * 2 + lIdx + 1) % coatPalette.length],
        true,
        true,
        1.68
      );
      minerGnome.position.set(lx + 1.4, terrY + 0.3, sideZ + 1.8);
      minerGnome.lookAt(lx, terrY + 1.5, 0);
      window.undergroundWorldGroup.add(minerGnome);
      window.subwayGnomes.push({ mesh: minerGnome, baseY: terrY + 0.3, phase: (sIdx * 3 + lIdx) * 0.9 });

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
      window.undergroundWorldGroup.add(rockTerr, mossFloor);

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
      window.undergroundWorldGroup.add(mushSprite);

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
      window.undergroundWorldGroup.add(mushGnome);
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

  // Foreground Causeway Ledges (`z = ±16.5`, behind each Metro Viaduct so the center camera path is unobstructed!)
  [-16.5, 16.5].forEach(function(ledgeZ, sideIdx) {
    [-38, 0, 38].forEach(function(cx, cIdx) {
      var centerLedge = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 6.8, 8.8, 12), cavernRockMat);
      centerLedge.position.set(cx, -30.8, ledgeZ);
      var centerMoss = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 0.70, 12), mossMat);
      centerMoss.position.set(cx, -26.4, ledgeZ);
      window.undergroundWorldGroup.add(centerLedge, centerMoss);

      createColorChangingMushroom(cx + 2.1, -26.2, ledgeZ, 1.45, cIdx * 1.7 + sideIdx);
      createCrystalCluster(cx - 2.1, -26.1, ledgeZ, [0x38bdf8, 0xf472b6, 0xfacc15, 0x4ade80][(cIdx + sideIdx) % 4], 1.25);

      var centerGnome = createDetailedGnome(
        hatPalette[(cIdx + sideIdx) % hatPalette.length],
        coatPalette[(cIdx + sideIdx + 2) % coatPalette.length],
        true,
        true,
        1.52
      );
      centerGnome.position.set(cx, -26.0, ledgeZ);
      centerGnome.lookAt(cx, -25.0, 0);
      window.undergroundWorldGroup.add(centerGnome);
      window.subwayGnomes.push({ mesh: centerGnome, baseY: -26.0, phase: (cIdx + sideIdx * 2) * 1.3 });
    });
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
    var by = -33.0 + Math.random() * 19.0;
    var bz2 = (Math.random() - 0.5) * 76;
    spMesh.position.set(bx, by, bz2);
    window.undergroundWorldGroup.add(spMesh);
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

// ============================================================================
// PICTORIAL RAILWAY JUNCTION DIRECTION SIGNS (NO TEXT — BIG ARROW + BIG ILLUSTRATION ONLY!)
// Placed at `u = 0.81` (14m outside any tunnel portal or bridge wall) so children
// immediately see each direction arrow (⬅, ⬆, ➡) paired with a large, vivid
// illustration of the destination object!
// ============================================================================
window.junctionSignsGroup = new THREE.Group();
scene.add(window.junctionSignsGroup);

(function buildJunctionDirectionSigns() {
  function getBranchDestinationInfo(bEdge) {
    if (!bEdge) return { icon: 'city', badgeCol: '#0284c7' };
    if (bEdge.isSubway) {
      return { icon: 'metro', badgeCol: '#2563eb' };
    }
    var stType = bEdge.station ? bEdge.station.type : '';
    var stName = bEdge.station ? (bEdge.station.name || '') : '';
    if (stType === 'bridge_suspension' || stType === 'hero_viaduct' || stType === 'viaduct') {
      return { icon: 'bridge', badgeCol: '#dc2626' };
    }
    if (stType === 'tunnel') {
      return { icon: 'tunnel', badgeCol: '#475569' };
    }
    if (stType === 'depot') {
      return { icon: 'depot', badgeCol: '#d97706' };
    }
    if (bEdge.to === 'EXIT_ALPS') {
      return { icon: 'alps', badgeCol: '#0284c7' };
    }
    if (bEdge.to === 'EXIT_EGYPT') {
      return { icon: 'egypt', badgeCol: '#ca8a04' };
    }
    if (bEdge.to === 'J_CENTER' || stName.indexOf('Fountain') !== -1) {
      return { icon: 'city', badgeCol: '#0284c7' };
    }
    if (bEdge.to === 'J_WEST' || bEdge.to === 'J_EAST') {
      return { icon: 'bridge', badgeCol: '#dc2626' };
    }
    if (bEdge.to === 'J_NORTH' || stName.indexOf('School') !== -1) {
      return { icon: 'school', badgeCol: '#16a34a' };
    }
    if (bEdge.to === 'J_SW' || stName.indexOf('Stadium') !== -1) {
      return { icon: 'stadium', badgeCol: '#15803d' };
    }
    if (bEdge.to === 'J_NE') {
      return { icon: 'city', badgeCol: '#db2777' };
    }
    if (bEdge.to === 'J_SE') {
      return { icon: 'city', badgeCol: '#7c3aed' };
    }
    return { icon: 'city', badgeCol: '#0284c7' };
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

    // Bold upward arrow polygon (rotated for left/right)
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

    // Inner bright highlight
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  function drawPictogramIcon(ctx, iconType, cx, cy, r) {
    ctx.save();
    // Large white circular picture plate with golden rim
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clip illustration cleanly inside the circular badge
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
    ctx.clip();

    if (iconType === 'metro') {
      // Iconic Prague Metro Symbol (Znak pražského metra — winged M with downward arrow on crisp white plate!)
      if (window.drawPragueMetroSymbol) {
        window.drawPragueMetroSymbol(ctx, cx, cy, r, '#d9261c');
      }
    } else if (iconType === 'bridge') {
      // Multi-arch red brick viaduct bridge over sparkling blue water
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      // Blue river water at bottom
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - r, cy + r * 0.32, r * 2, r * 0.70);
      // Red brick viaduct deck & piers
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - r * 0.92, cy - r * 0.34, r * 1.84, r * 0.72);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(cx - r * 0.92, cy - r * 0.42, r * 1.84, r * 0.10);
      // Open bridge arches showing sky/water
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(cx - r * 0.42, cy + r * 0.34, r * 0.28, Math.PI, 0, false);
      ctx.arc(cx + r * 0.42, cy + r * 0.34, r * 0.28, Math.PI, 0, false);
      ctx.fill();
    } else if (iconType === 'tunnel') {
      // Green mountain peak + dark stone tunnel arch + wooden sleepers
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.98, cy + r * 0.85);
      ctx.lineTo(cx, cy - r * 0.82);
      ctx.lineTo(cx + r * 0.98, cy + r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Stone arch ring & dark tunnel bore
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.25, r * 0.42, Math.PI, 0, false);
      ctx.lineTo(cx + r * 0.42, cy + r * 0.85);
      ctx.lineTo(cx - r * 0.42, cy + r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (iconType === 'school') {
      // Sunny Schoolhouse with bell tower & colorful Ferris wheel
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(cx - r, cy + r * 0.45, r * 2, r * 0.6);

      ctx.fillStyle = '#fb923c';
      ctx.fillRect(cx - r * 0.68, cy - r * 0.12, r * 0.85, r * 0.65);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.76, cy - r * 0.12);
      ctx.lineTo(cx - r * 0.25, cy - r * 0.64);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.12);
      ctx.closePath();
      ctx.fill();

      // Ferris wheel on right
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx + r * 0.42, cy - r * 0.05, r * 0.34, 0, Math.PI * 2);
      ctx.stroke();
    } else if (iconType === 'stadium') {
      // Green soccer pitch + large classic soccer ball
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - r * 0.68, cy - r * 0.48, r * 1.36, r * 0.96);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.30, cy - r * 0.20, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.30, cy - r * 0.20, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.24, cy + r * 0.28, r * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.24, cy + r * 0.28, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    } else if (iconType === 'alps') {
      // Snow-capped Alpine mountain peaks
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.95, cy + r * 0.75);
      ctx.lineTo(cx - r * 0.18, cy - r * 0.72);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy - r * 0.15);
      ctx.lineTo(cx - r * 0.18, cy - r * 0.72);
      ctx.lineTo(cx + r * 0.10, cy - r * 0.15);
      ctx.closePath();
      ctx.fill();
    } else if (iconType === 'egypt') {
      // Golden Egyptian pyramids under sunny sky
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - r, cy + r * 0.35, r * 2, r * 0.7);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.80, cy + r * 0.48);
      ctx.lineTo(cx - r * 0.10, cy - r * 0.58);
      ctx.lineTo(cx + r * 0.65, cy + r * 0.48);
      ctx.closePath();
      ctx.fill();
    } else if (iconType === 'city') {
      // Colorful storybook houses & blue fountain
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(cx - r, cy + r * 0.45, r * 2, r * 0.6);

      // Left yellow house with red roof
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - r * 0.72, cy - r * 0.15, r * 0.64, r * 0.68);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.78, cy - r * 0.15);
      ctx.lineTo(cx - r * 0.40, cy - r * 0.68);
      ctx.lineTo(cx - r * 0.02, cy - r * 0.15);
      ctx.closePath();
      ctx.fill();

      // Right blue building with yellow windows
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(cx + r * 0.04, cy - r * 0.38, r * 0.64, r * 0.92);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx + r * 0.16, cy - r * 0.22, r * 0.16, r * 0.16);
      ctx.fillRect(cx + r * 0.40, cy - r * 0.22, r * 0.16, r * 0.16);
      ctx.fillRect(cx + r * 0.16, cy + r * 0.06, r * 0.16, r * 0.16);
      ctx.fillRect(cx + r * 0.40, cy + r * 0.06, r * 0.16, r * 0.16);
    } else {
      // Red/Yellow Storybook Locomotive & Depot Shed
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - r * 0.62, cy - r * 0.20, r * 1.24, r * 0.62);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - r * 0.62, cy - r * 0.52, r * 0.52, r * 0.35);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx + r * 0.20, cy - r * 0.58, r * 0.24, r * 0.40);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx - r * 0.34, cy + r * 0.46, r * 0.18, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.34, cy + r * 0.46, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function createJunctionSignCanvas(rows) {
    var rowH = 168;
    var padY = 20;
    var c = document.createElement('canvas');
    c.width = 520;
    c.height = padY * 2 + rows.length * rowH;
    var ctx = c.getContext('2d');

    // Outer wooden/steel storybook frame (NO TEXT — ONLY BIG ARROWS & BIG PICTURES!)
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

      // Colored direction card row
      ctx.fillStyle = r.info.badgeCol;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(24, ry + 6, c.width - 48, cardH, 26);
      else ctx.rect(24, ry + 6, c.width - 48, cardH);
      ctx.fill();
      ctx.stroke();

      // 1. Giant directional arrow on the left
      drawBigDirectionArrow(ctx, r.dirType, 130, cy + 6, 98);

      // 2. Giant destination illustration on the right
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

    // Place signpost at u = 0.81 (14m outside any tunnel portal at u = 0.75 or bridge parapet at u = 0.80)
    var uSign = 0.81;
    var pt = e.curve.getPointAt(uSign);
    var tan = e.curve.getTangentAt(uSign).normalize();
    var rightVec = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    // Place the railway signpost safely to the right of the double track (`+7.8m` lateral offset)
    var signPos = pt.clone().add(rightVec.clone().multiplyScalar(7.8));

    var signG = new THREE.Group();
    signG.position.copy(signPos);

    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 9.6, 10), postMat);
    pole.position.y = 1.4;
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), trimMat);
    cap.position.y = 6.2;
    signG.add(pole, cap);

    var signCanvas = createJunctionSignCanvas(rows);
    var signTex = window.upgradeCanvasTex(signCanvas);
    var signSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: true })
    );
    var signH = 2.4 * rows.length;
    signSprite.scale.set(7.4, signH, 1);
    signSprite.position.set(0, 6.4 + signH * 0.45, 0);
    signG.add(signSprite);

    window.junctionSignsGroup.add(signG);
  });
})();

