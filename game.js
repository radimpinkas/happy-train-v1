// ============================================================================
// MODULE 4: GAME.JS (2.5D Storybook Camera, Curved Turnout Navigation, Exact Arc-Length
// Wagon Coupling, Train Right-of-Way Yielding, Czech Level Crossings & Fairy-Tale Underground Diorama)
// ============================================================================

// Yellow & Red Cartoon Locomotive Toby (Scaled to 0.64 for clear map overview)
var playerLoco = createDetailedLocomotive(0xfacc15, 0xef4444, false);
scene.add(playerLoco);
var trainHeadLight = new THREE.PointLight(0xfef08a, 0.0, 105, 1.35);
scene.add(trainHeadLight);

var coachCols = [0xef4444, 0xef4444, 0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6];
var playerCoaches = [];
function addCoach() {
  var c = createDetailedCoach(coachCols[playerCoaches.length % coachCols.length]);
  scene.add(c);
  playerCoaches.push(c);
  document.getElementById('wagon-val').textContent = playerCoaches.length;
}
addCoach(); addCoach(); addCoach();

// AI Trains ride on `parallelCurve` and obey Right-of-Way (`Přednost v jízdě`) at all junctions!
var aiTrains = [
  { name: "🚅 Bullet Bob Shinkansen", loco: createDetailedLocomotive(0x38bdf8, 0x2563eb, true), wagon: createDetailedCoach(0x38bdf8), edge: physicalTracksToRender[2], t: 0.42, baseSpeed: 0.25, currentSpeed: 0.25, chatCooldown: 0 },
  { name: "🚂 Rusty Steam Friend", loco: createDetailedLocomotive(0x4ade80, 0x15803d, false), wagon: createDetailedCoach(0x16a34a), edge: physicalTracksToRender[5], t: 0.48, baseSpeed: 0.20, currentSpeed: 0.20, chatCooldown: 0 }
];
aiTrains.forEach(function(ai) { scene.add(ai.loco, ai.wagon); });

// Weather Particles (Rain 🌧️ & Snow ❄️)
var weatherTypes = ['clear', 'rain', 'snow'];
var currentWeatherIdx = 0;
var weatherParticles = [];
var weatherGeo = new THREE.SphereGeometry(0.32, 6, 6);
var weatherMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
for (var wi = 0; wi < 180; wi++) {
  var wp = new THREE.Mesh(weatherGeo, weatherMat);
  wp.position.set((Math.random() - 0.5) * 160, Math.random() * 60, (Math.random() - 0.5) * 160);
  scene.add(wp);
  weatherParticles.push(wp);
}

window.cycleWeather = function() {
  currentWeatherIdx = (currentWeatherIdx + 1) % weatherTypes.length;
  var mode = weatherTypes[currentWeatherIdx];
  var btn = document.getElementById('weather-btn');
  if (mode === 'clear') {
    btn.textContent = '☀️ Weather: Clear (W)';
    weatherMat.opacity = 0.0;
    speakCharacter('mom', '☀️ Mom Narrator', '#ec4899', 'The sun is shining brightly over our storybook world!');
  } else if (mode === 'rain') {
    btn.textContent = '🌧️ Weather: Rain (W)';
    weatherMat.color.setHex(0xbae6fd);
    weatherMat.opacity = 0.75;
    speakCharacter('train', '🚂 Little Train Toby', '#ef4444', 'Pitter patter! Look at the raindrops falling!');
  } else {
    btn.textContent = '❄️ Weather: Snow (W)';
    weatherMat.color.setHex(0xffffff);
    weatherMat.opacity = 0.9;
    speakCharacter('train', '🚂 Little Train Toby', '#ef4444', 'Hooray! Soft white snowflakes are falling all around us!');
  }
};

// Build initial previous segment chain so Toby's wagons sit smoothly behind him from frame 1
var initialIncomingEdge = edges.find(function(e) { return e.from === 'J_WEST' && e.to === 'J_NW'; }) || edges[0];
var initialTurnout = window.turnoutCurves[initialIncomingEdge.id + '=>' + edges[0].id] || null;
var initPrevSegs = [];
if (initialTurnout) {
  initPrevSegs.push({ edge: initialTurnout, startT: 0.0, endT: 1.0 });
}
initPrevSegs.push({ edge: initialIncomingEdge, startT: 0.16, endT: 0.84 });

// Start Toby at t = 0.48 on the Hero Red-Brick Arch Viaduct with his 3 wagons coupled cleanly behind!
var pState = {
  edge: edges[0],
  entryT: 0.16,
  prevSegments: initPrevSegs,
  t: 0.48,
  speedStage: 1, currentVel: 0.12,
  switchChoice: 'straight',
  score: 0, itemsCount: 0,
  stationPause: 0, activeStName: null,
  waitingRed: false, atGate: false, inTunnel: false, inSubway: false,
  faceCamTimer: 0
};

// Exact Arc-Length Wagon Coupling across Main Track Segments & Curved Turnouts!
function getTrackPoseBehindPlayer(distBehind) {
  var curEdge = pState.edge;
  var curLen = curEdge.curve.getLength();
  var minT = pState.entryT !== undefined ? pState.entryT : 0.0;
  var traveledOnCur = (pState.t - minT) * curLen;

  if (distBehind <= traveledOnCur) {
    var wt = Math.max(0, Math.min(1, pState.t - distBehind / curLen));
    return {
      pos: curEdge.curve.getPointAt(wt),
      dir: curEdge.curve.getTangentAt(wt).normalize()
    };
  }

  var deficit = distBehind - traveledOnCur;
  for (var i = 0; i < pState.prevSegments.length; i++) {
    var seg = pState.prevSegments[i];
    if (!seg || !seg.edge) break;
    var segTotalLen = seg.edge.curve.getLength();
    var segSpanT = seg.endT - seg.startT;
    var segArcLen = segTotalLen * segSpanT;

    if (deficit <= segArcLen) {
      var ptT = Math.max(0, Math.min(1, seg.endT - deficit / segTotalLen));
      return {
        pos: seg.edge.curve.getPointAt(ptT),
        dir: seg.edge.curve.getTangentAt(ptT).normalize()
      };
    }
    deficit -= segArcLen;
  }

  var p0 = curEdge.curve.getPointAt(minT);
  var d0 = curEdge.curve.getTangentAt(minT).normalize();
  return {
    pos: p0.clone().sub(d0.clone().multiplyScalar(deficit)),
    dir: d0
  };
}

// Color Palettes for Day, Colorful Sunrise, Fiery Sunset, Deep Dark Night & Magical Gnome Cavern
var colHemiDaySky = new THREE.Color(0xfffbeb), colHemiDayGnd = new THREE.Color(0x4ade80), colSunDay = new THREE.Color(0xfff7ed), colFillDay = new THREE.Color(0xfef08a);
var colHemiSunriseSky = new THREE.Color(0xf472b6), colHemiSunriseGnd = new THREE.Color(0x9a3412), colSunSunrise = new THREE.Color(0xfde047), colFillSunrise = new THREE.Color(0xfb7185);
var colHemiSunsetSky = new THREE.Color(0xd946ef), colHemiSunsetGnd = new THREE.Color(0x7c2d12), colSunSunset = new THREE.Color(0xf97316), colFillSunset = new THREE.Color(0xef4444);
var colHemiNightSky = new THREE.Color(0x1e3a8a), colHemiNightGnd = new THREE.Color(0x020617), colSunNight = new THREE.Color(0x3b82f6), colFillNight = new THREE.Color(0x090d1c);
var colHemiCavernSky = new THREE.Color(0xe9d5ff), colHemiCavernGnd = new THREE.Color(0x311042), colSunCavern = new THREE.Color(0x7dd3fc), colFillCavern = new THREE.Color(0xfef08a);

// 5-Minute Day/Night Analog Clock + Colorful Sunrise/Sunset & Dark Night / Tunnel / Metro Controller
var gameTimeSeconds = 125; // Starts around 10:00 AM bright sunny storybook morning
function updateClockAndLighting(dt) {
  gameTimeSeconds = (gameTimeSeconds + dt) % 300;
  var hoursFloat = (gameTimeSeconds / 300) * 24;
  var hr = Math.floor(hoursFloat);
  var min = Math.floor((hoursFloat - hr) * 60);

  var c = document.getElementById('analog-clock');
  if (c) {
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 42, 42);
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.5;
    var hAngle = ((hr % 12) + min / 60) * (Math.PI / 6) - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(21, 21); ctx.lineTo(21 + Math.cos(hAngle) * 11, 21 + Math.sin(hAngle) * 11); ctx.stroke();
    var mAngle = (min / 60) * (Math.PI * 2) - Math.PI / 2;
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(21, 21); ctx.lineTo(21 + Math.cos(mAngle) * 16, 21 + Math.sin(mAngle) * 16); ctx.stroke();
  }

  var isNight = (hoursFloat >= 20.0 || hoursFloat < 5.5);
  var isSunrise = (hoursFloat >= 5.5 && hoursFloat < 8.0);
  var isSunset = (hoursFloat >= 17.0 && hoursFloat < 20.0);

  var phaseIcon = isNight ? '🌙' : (isSunrise ? '🌅' : (isSunset ? '🌇' : '☀️'));
  var phaseName = isNight ? 'Night' : (isSunrise ? 'Sunrise' : (isSunset ? 'Sunset' : 'Day'));
  var padMin = min < 10 ? '0' + min : min;
  document.getElementById('time-phase-label').textContent = phaseIcon + ' ' + hr + ':' + padMin + ' ' + phaseName;

  var inDarkTunnel = window.isPlayerInDarkTunnel ? window.isPlayerInDarkTunnel(pState.edge, pState.t) : false;
  var uSubEntry = (pState.edge && pState.edge.uPortalEntry) ? pState.edge.uPortalEntry : 0.195;
  var uSubExit  = (pState.edge && pState.edge.uPortalExit)  ? pState.edge.uPortalExit  : 0.805;
  var isUndergroundMetro = Boolean(pState.edge.isSubway && pState.t >= uSubEntry && pState.t <= uSubExit);

  if (isUndergroundMetro && !pState.inSubway) {
    pState.inSubway = true;
    playMagicSubwaySound();
    speakCharacter('train', '🚇 Little Train Toby', '#a855f7', 'Wow! Welcome to the Fairy-Tale Underground Gnome Cavern! Look at the big waterfall, the gnomes mining gold and diamonds, and the color-changing magic mushrooms!');
  } else if (!isUndergroundMetro && pState.inSubway) {
    pState.inSubway = false;
  }

  if (inDarkTunnel && !pState.inTunnel && !isUndergroundMetro) {
    pState.inTunnel = true;
    playTrainHorn();
    speakCharacter('train', '🔦 Little Train Toby', '#facc15', 'Whoosh! Entering the dark mountain tunnel! Switching on my bright front headlight!');
  } else if (!inDarkTunnel && pState.inTunnel) {
    pState.inTunnel = false;
  }

  if (window.undergroundWorldGroup) {
    window.undergroundWorldGroup.visible = isUndergroundMetro;
  }
  var hideSurfaceGround = Boolean(pState.edge.isSubway && pState.t >= uSubEntry + 0.015 && pState.t <= uSubExit - 0.015);
  if (window.grassMesh) window.grassMesh.visible = !hideSurfaceGround;
  if (window.riverMesh) window.riverMesh.visible = !hideSurfaceGround;

  if (window.tunnelRoofMeshes) {
    var uCavS = (pState.edge && pState.edge.uCavernStart) ? pState.edge.uCavernStart : 0.36;
    var uCavE = (pState.edge && pState.edge.uCavernEnd)   ? pState.edge.uCavernEnd   : 0.64;
    var inSubwayRamp = Boolean(pState.edge.isSubway && isUndergroundMetro && (pState.t < uCavS || pState.t > uCavE));
    var targetRoofOpacity = (inDarkTunnel && !pState.edge.isSubway) ? 0.16 : (inSubwayRamp ? 0.22 : 1.0);
    window.tunnelRoofMeshes.forEach(function(rm) {
      rm.opacity += (targetRoofOpacity - rm.opacity) * 0.18;
      rm.depthWrite = rm.opacity > 0.85;
    });
  }

  var beamMesh = playerLoco.userData.beam;

  if (isUndergroundMetro) {
    // Balanced Fairy-Tale Cavern & Subway Tunnel Illumination (no harsh black drop or white over-exposure)
    scene.background.lerp(metroSkyColor, 0.14);
    if (scene.fog) scene.fog.color.lerp(metroSkyColor, 0.14);
    hemiLight.color.lerp(colHemiCavernSky, 0.14);
    hemiLight.groundColor.lerp(colHemiCavernGnd, 0.14);
    sunLight.color.lerp(colSunCavern, 0.14);
    storybookFillLight.color.lerp(colFillCavern, 0.14);
    hemiLight.intensity += (0.72 - hemiLight.intensity) * 0.14;
    sunLight.intensity += (0.50 - sunLight.intensity) * 0.14;
    storybookFillLight.intensity += (0.35 - storybookFillLight.intensity) * 0.14;
    beamMesh.visible = true;
    beamMesh.material.opacity = 0.72;
    trainHeadLight.intensity = 2.4;
  } else if (inDarkTunnel) {
    scene.background.lerp(tunnelDarkColor, 0.22);
    if (scene.fog) scene.fog.color.lerp(tunnelDarkColor, 0.22);
    hemiLight.color.lerp(colHemiNightSky, 0.22);
    hemiLight.groundColor.lerp(colHemiNightGnd, 0.22);
    hemiLight.intensity += (0.10 - hemiLight.intensity) * 0.22;
    sunLight.intensity += (0.05 - sunLight.intensity) * 0.22;
    storybookFillLight.intensity += (0.0 - storybookFillLight.intensity) * 0.22;
    beamMesh.visible = true;
    beamMesh.material.opacity = 0.90;
    trainHeadLight.intensity = 5.4;
  } else if (isNight) {
    scene.background.lerp(nightSkyColor, 0.08);
    if (scene.fog) scene.fog.color.lerp(nightSkyColor, 0.08);
    hemiLight.color.lerp(colHemiNightSky, 0.08);
    hemiLight.groundColor.lerp(colHemiNightGnd, 0.08);
    sunLight.color.lerp(colSunNight, 0.08);
    storybookFillLight.color.lerp(colFillNight, 0.08);
    hemiLight.intensity += (0.07 - hemiLight.intensity) * 0.08;
    sunLight.intensity += (0.04 - sunLight.intensity) * 0.08;
    storybookFillLight.intensity += (0.0 - storybookFillLight.intensity) * 0.08;
    beamMesh.visible = true;
    beamMesh.material.opacity = 0.90;
    trainHeadLight.intensity = 5.6;
  } else if (isSunrise) {
    scene.background.lerp(sunriseSkyColor, 0.07);
    if (scene.fog) scene.fog.color.lerp(sunriseSkyColor, 0.07);
    hemiLight.color.lerp(colHemiSunriseSky, 0.07);
    hemiLight.groundColor.lerp(colHemiSunriseGnd, 0.07);
    sunLight.color.lerp(colSunSunrise, 0.07);
    storybookFillLight.color.lerp(colFillSunrise, 0.07);
    hemiLight.intensity += (0.68 - hemiLight.intensity) * 0.07;
    sunLight.intensity += (0.86 - sunLight.intensity) * 0.07;
    storybookFillLight.intensity += (0.52 - storybookFillLight.intensity) * 0.07;
    beamMesh.visible = false;
    beamMesh.material.opacity = 0.0;
    trainHeadLight.intensity = 0.4;
  } else if (isSunset) {
    scene.background.lerp(sunsetSkyColor, 0.07);
    if (scene.fog) scene.fog.color.lerp(sunsetSkyColor, 0.07);
    hemiLight.color.lerp(colHemiSunsetSky, 0.07);
    hemiLight.groundColor.lerp(colHemiSunsetGnd, 0.07);
    sunLight.color.lerp(colSunSunset, 0.07);
    storybookFillLight.color.lerp(colFillSunset, 0.07);
    hemiLight.intensity += (0.56 - hemiLight.intensity) * 0.07;
    sunLight.intensity += (0.76 - sunLight.intensity) * 0.07;
    storybookFillLight.intensity += (0.55 - storybookFillLight.intensity) * 0.07;
    beamMesh.visible = false;
    beamMesh.material.opacity = 0.0;
    trainHeadLight.intensity = 0.6;
  } else {
    scene.background.lerp(daySkyColor, 0.08);
    if (scene.fog) scene.fog.color.lerp(daySkyColor, 0.08);
    hemiLight.color.lerp(colHemiDaySky, 0.08);
    hemiLight.groundColor.lerp(colHemiDayGnd, 0.08);
    sunLight.color.lerp(colSunDay, 0.08);
    storybookFillLight.color.lerp(colFillDay, 0.08);
    hemiLight.intensity += (0.94 - hemiLight.intensity) * 0.08;
    sunLight.intensity += (1.14 - sunLight.intensity) * 0.08;
    storybookFillLight.intensity += (0.35 - storybookFillLight.intensity) * 0.08;
    beamMesh.visible = false;
    beamMesh.material.opacity = 0.0;
    trainHeadLight.intensity = 0.0;
  }
}

// Fluffy Turquoise Cartoon Steam Clouds
var particles = [];
var puffClusterGeo = new THREE.SphereGeometry(0.65, 10, 10);
var bCols = [0x38bdf8, 0xf472b6, 0xfacc15, 0x4ade80, 0xa78bfa];

function spawnSmokeAndBubbles(pos, count, withBubbles, customYOffset) {
  for (var i = 0; i < count; i++) {
    var isB = withBubbles && (i % 2 === 0);
    var col = isB ? bCols[i % bCols.length] : 0x67e8f9;
    var puffGroup = new THREE.Group();
    var pMat = new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.90 });

    var mainSphere = new THREE.Mesh(puffClusterGeo, pMat);
    puffGroup.add(mainSphere);
    if (!isB) {
      var sideL = new THREE.Mesh(puffClusterGeo, pMat);
      sideL.scale.set(0.7, 0.7, 0.7); sideL.position.set(-0.42, -0.08, 0);
      var sideR = new THREE.Mesh(puffClusterGeo, pMat);
      sideR.scale.set(0.65, 0.65, 0.65); sideR.position.set(0.42, 0.08, 0);
      puffGroup.add(sideL, sideR);
    }

    var yOff = customYOffset !== undefined ? customYOffset : 3.6;
    puffGroup.position.set(
      pos.x + (Math.random() - 0.5) * 0.6,
      pos.y + yOff,
      pos.z + (Math.random() - 0.5) * 0.6
    );
    scene.add(puffGroup);
    particles.push({ mesh: puffGroup, mat: pMat, vy: 0.07 + Math.random() * 0.05, scale: 0.75 });
  }
}

function renderGiantArrow(choice, targetName) {
  var card = document.getElementById('giant-direction-card');
  var wrap = document.getElementById('arrow-svg-wrap');
  var title = document.getElementById('dir-title');
  var sub = document.getElementById('dir-subtitle');
  sub.textContent = 'Next: ' + targetName;
  if (choice === 'left') {
    card.style.borderColor = '#facc15'; title.style.color = '#facc15'; title.textContent = '◀ TURN LEFT';
    wrap.innerHTML = '<svg width="52" height="52" viewBox="0 0 64 64"><path d="M46 54 V32 C46 22 38 16 26 16 H14" fill="none" stroke="#facc15" stroke-width="9" stroke-linecap="round"/><polygon points="22,4 6,16 22,28" fill="#facc15"/></svg>';
  } else if (choice === 'right') {
    card.style.borderColor = '#f97316'; title.style.color = '#f97316'; title.textContent = 'TURN RIGHT ▶';
    wrap.innerHTML = '<svg width="52" height="52" viewBox="0 0 64 64"><path d="M18 54 V32 C18 22 26 16 38 16 H50" fill="none" stroke="#f97316" stroke-width="9" stroke-linecap="round"/><polygon points="42,4 58,16 42,28" fill="#f97316"/></svg>';
  } else {
    card.style.borderColor = '#4ade80'; title.style.color = '#4ade80'; title.textContent = '▲ GO STRAIGHT';
    wrap.innerHTML = '<svg width="52" height="52" viewBox="0 0 64 64"><line x1="32" y1="54" x2="32" y2="16" stroke="#4ade80" stroke-width="9" stroke-linecap="round"/><polygon points="16,24 32,4 48,24" fill="#4ade80"/></svg>';
  }
}

window.triggerFaceCamHighlight = function(frames) {
  pState.faceCamTimer = frames || 100;
};

var speedMap = { '-1': -0.22, '0': 0, '1': 0.14, '2': 0.25, '3': 0.38, '4': 0.52, '5': 0.68 };
var speedNames = { '-1': '◀ REVERSE', '0': 'STOPPED', '1': '1/5 SLOW', '2': '2/5 CRUISE', '3': '3/5 FAST', '4': '4/5 EXPRESS', '5': '5/5 SUPER' };

function updateHUD() {
  document.getElementById('speed-label').textContent = '⚡ ' + speedNames[String(pState.speedStage)];
  document.getElementById('sp-rev').className = 'speed-dot' + (pState.speedStage === -1 ? ' on-rev' : '');
  for (var i = 1; i <= 5; i++) {
    document.getElementById('sp-' + i).className = 'speed-dot' + (pState.speedStage >= i ? ' on-' + i : '');
  }
  var baseEdge = pState.edge.isTurnout ? pState.edge.targetEdge : pState.edge;
  var br = getBranches(baseEdge);
  var targetEdge = br[pState.switchChoice] || br.straight;
  var turnoutH = window.turnoutCurves[baseEdge.id + '=>' + targetEdge.id];
  var col = pState.switchChoice === 'left' ? 0xfacc15 : (pState.switchChoice === 'right' ? 0xf97316 : 0x4ade80);

  for (var j = 0; j < highlightDots.length; j++) {
    var uDot = j / Math.max(1, highlightDots.length - 1);
    var hp, htan;
    if (turnoutH && uDot < 0.65) {
      var tu = uDot / 0.65;
      hp = turnoutH.curve.getPointAt(tu);
      htan = turnoutH.curve.getTangentAt(tu);
    } else {
      var eu = 0.16 + ((uDot - 0.65) / 0.35) * 0.25;
      if (!turnoutH) eu = 0.16 + uDot * 0.35;
      hp = targetEdge.curve.getPointAt(Math.max(0, Math.min(1, eu)));
      htan = targetEdge.curve.getTangentAt(Math.max(0, Math.min(1, eu)));
    }
    highlightDots[j].position.set(hp.x, hp.y + 0.36, hp.z);
    highlightDots[j].rotation.y = Math.atan2(htan.x, htan.z);
    highlightDots[j].material.color.setHex(col);
  }
  var nextLabel = targetEdge.station ? targetEdge.station.name : nodes[targetEdge.to].name;
  renderGiantArrow(pState.switchChoice, nextLabel);
}
updateHUD();

window.handleInput = function(key) {
  initAudio();
  if (pState.atGate) {
    if (key === 'ArrowDown' || key === 'ArrowLeft') reverseFromGate();
    else if (key === 'Enter') unlockGateWorld();
    return;
  }
  if (key === 'ArrowLeft') {
    pState.switchChoice = pState.switchChoice === 'right' ? 'straight' : 'left';
    updateHUD();
    var brL = getBranches(pState.edge.isTurnout ? pState.edge.targetEdge : pState.edge);
    var nextL = (brL[pState.switchChoice] || brL.straight);
    var lblL = nextL.station ? nextL.station.name : nodes[nextL.to].name;
    speakCharacter('mom', '👩 Mom Narrator', '#ec4899', 'Turning ' + pState.switchChoice + ' toward ' + lblL);
  } else if (key === 'ArrowRight') {
    pState.switchChoice = pState.switchChoice === 'left' ? 'straight' : 'right';
    updateHUD();
    var brR = getBranches(pState.edge.isTurnout ? pState.edge.targetEdge : pState.edge);
    var nextR = (brR[pState.switchChoice] || brR.straight);
    var lblR = nextR.station ? nextR.station.name : nodes[nextR.to].name;
    speakCharacter('mom', '👩 Mom Narrator', '#ec4899', 'Turning ' + pState.switchChoice + ' toward ' + lblR);
  } else if (key === 'ArrowUp') {
    pState.speedStage = Math.min(5, pState.speedStage + 1);
    updateHUD();
    speakCharacter('train', '🚂 Little Train Toby', '#ef4444', 'Chugga chugga! Speed ' + pState.speedStage + '!');
  } else if (key === 'ArrowDown') {
    pState.speedStage = Math.max(-1, pState.speedStage - 1);
    updateHUD();
    speakCharacter('train', '🚂 Little Train Toby', '#ef4444', pState.speedStage === -1 ? 'Backing up! Beep beep!' : 'Slowing down!');
  } else if (key === 'Enter' || key === ' ') {
    playTrainHorn();
    spawnSmokeAndBubbles(playerLoco.position, 8, true);

    var metroSub = subwayEdges.find(function(se) {
      return nodes[se.from].pos.distanceTo(playerLoco.position) < 55;
    });
    if (metroSub && !pState.edge.isSubway) {
      pState.prevSegments.unshift({ edge: pState.edge, startT: pState.entryT || 0.16, endT: pState.t });
      pState.edge = metroSub;
      pState.entryT = 0.14;
      pState.t = 0.14;
      pState.speedStage = 2;
      updateHUD();
      playMagicSubwaySound();
      speakCharacter('train', '🚇 Little Train Toby', '#a855f7', 'Entering the Metro Station tunnel! Let us visit the fairy-tale underground world of gnomes, waterfalls, and magic mushrooms!');
      return;
    }

    playHappyLaugh();
    speakCharacter('train', '🚂 Little Train Toby', '#ef4444', 'Hi friends! Watch the railway crossing barriers lower and enter the 4 Metro Stations!');
  } else if (key === 'm' || key === 'M') {
    window.toggleMusic();
  } else if (key === 'w' || key === 'W') {
    window.cycleWeather();
  }
};

window.addEventListener('keydown', function(e) {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'm', 'M', 'w', 'W'].indexOf(e.key) !== -1) {
    e.preventDefault();
    window.handleInput(e.key);
  }
});

window.reverseFromGate = function() {
  document.getElementById('gate-modal').classList.remove('show');
  pState.atGate = false;
  var ret = edges.find(function(e) { return e.from === pState.edge.to && e.to === pState.edge.from; });
  if (ret) {
    pState.prevSegments.unshift({ edge: pState.edge, startT: pState.entryT || 0.16, endT: pState.t });
    pState.edge = ret;
    pState.entryT = 0.16;
    pState.t = 0.18;
  }
  pState.speedStage = 2; pState.switchChoice = 'straight'; updateHUD();
  speakCharacter('train', '🚂 Little Train Toby', '#ef4444', 'Turning back to our happy city!');
};

window.unlockGateWorld = function() {
  document.getElementById('gate-modal').classList.remove('show');
  pState.atGate = false;
  nodes[pState.edge.to].unlocked = true;
  var ret = edges.find(function(e) { return e.from === pState.edge.to && e.to === pState.edge.from; });
  if (ret) {
    pState.prevSegments.unshift({ edge: pState.edge, startT: pState.entryT || 0.16, endT: pState.t });
    pState.edge = ret;
    pState.entryT = 0.16;
    pState.t = 0.18;
  }
  pState.speedStage = 3; updateHUD();
  speakCharacter('mom', '🎉 Mom Narrator', '#4ade80', 'Wonderful! Bonus Adventure World unlocked!');
};

var smoothCamPos = new THREE.Vector3(-18, 38.0, -38);
var smoothCamLook = new THREE.Vector3(-18, 6.5, -162);
var lastFriendChatTime = 0;

setTimeout(function() {
  spawnSmokeAndBubbles(playerLoco.position, 3, false);
}, 60);

function animate() {
  requestAnimationFrame(animate);
  var time = Date.now() * 0.004;

  // 1. Update 5-Minute Day/Night Clock, Colorful Sunrise/Sunset, Tunnel Darkness & Cavern Lighting
  updateClockAndLighting(0.016);

  // 2. Animate Grand Central Water Fountain, Underground Gnomes, Color-Changing Mushrooms, Waterfalls & Minecarts
  fountainDrops.forEach(function(fd) {
    fd.progress = (fd.progress + 0.022) % 1.0;
    var arcY = 3.0 + Math.sin(fd.progress * Math.PI) * 8.5;
    var rad = fd.progress * 7.5;
    fd.mesh.position.set(Math.cos(fd.angle) * rad, arcY, Math.sin(fd.angle) * rad);
  });

  if (window.subwayGnomes) {
    window.subwayGnomes.forEach(function(gn) {
      gn.mesh.position.y = gn.baseY + Math.abs(Math.sin(time * 3.2 + gn.phase)) * 0.42;
      if (gn.mesh.userData && gn.mesh.userData.armPivot) {
        gn.mesh.userData.armPivot.rotation.x = Math.sin(time * 5.5 + gn.phase) * 0.68;
      }
    });
  }

  if (window.magicMushrooms) {
    window.magicMushrooms.forEach(function(m) {
      var hue = (time * 0.075 + m.phase * 0.15) % 1.0;
      m.capMat.color.setHSL(hue, 0.92, 0.56);
      if (m.gillMat) {
        m.gillMat.color.setHSL((hue + 0.28) % 1.0, 0.95, 0.68);
      }
      var pulse = 1.0 + Math.sin(time * 2.2 + m.phase) * 0.05;
      var mGroup = m.group || m.mesh;
      if (mGroup) {
        mGroup.scale.set(m.baseScale * pulse, m.baseScale * (1.0 + (1.0 - pulse) * 0.6), m.baseScale * pulse);
      }
    });
  }

  if (window.waterfallTextures) {
    window.waterfallTextures.forEach(function(wt) {
      wt.offset.y = (wt.offset.y + 0.025) % 1.0;
    });
  }

  if (window.undergroundWaterfalls) {
    window.undergroundWaterfalls.forEach(function(wf) {
      wf.drops.forEach(function(d) {
        d.progress = (d.progress + d.speed) % 1.0;
        d.mesh.position.set(
          d.xOff,
          26.0 * (1.0 - d.progress),
          -1.2 + d.progress * 4.5
        );
      });
      var poolMesh = wf.pool || wf.splash;
      if (poolMesh) {
        var sp = 1.0 + Math.sin(time * 4.5 + (wf.phase || 0)) * 0.10;
        poolMesh.scale.set(sp, 1.0, sp);
      }
    });
  }

  if (window.goldMinecarts) {
    window.goldMinecarts.forEach(function(mc) {
      var off = Math.sin(time * 1.5 + mc.phase) * 3.8;
      mc.mesh.position.set(
        mc.basePos.x + mc.dir.x * off,
        mc.basePos.y,
        mc.basePos.z + mc.dir.z * off
      );
    });
  }

  // 2A-2. Animate Multi-Plane Illustrated Parallax Layers & Bioluminescent Cavern Spores!
  if (window.undergroundParallaxLayers) {
    var clampedTrainX = Math.max(-56, Math.min(56, playerLoco.position.x));
    window.undergroundParallaxLayers.forEach(function(pl) {
      pl.mesh.position.x = pl.baseX + clampedTrainX * pl.parallaxFactor;
    });
  }
  if (window.cavernFireflies) {
    window.cavernFireflies.forEach(function(ff) {
      var ft = time * ff.speed + ff.phase;
      ff.mesh.position.set(
        ff.baseX + Math.sin(ft) * 2.4,
        ff.baseY + Math.cos(ft * 1.3) * 1.6,
        ff.baseZ + Math.sin(ft * 0.8) * 2.0
      );
    });
  }

  // 2B. Animate Czech Railway Level Crossings (České železniční přejezdy AŽD se závorami a cinkáním!)
  if (window.levelCrossings) {
    var flashLeft = Math.floor(Date.now() / 260) % 2 === 0;
    window.levelCrossings.forEach(function(lc) {
      var minPlayerDist = lc.pos.distanceTo(playerLoco.position);
      for (var ci = 0; ci < playerCoaches.length; ci++) {
        var cd = lc.pos.distanceTo(playerCoaches[ci].position);
        if (cd < minPlayerDist) minPlayerDist = cd;
      }
      var minAiDist = 999999;
      for (var aiIdx = 0; aiIdx < aiTrains.length; aiIdx++) {
        var ad1 = lc.pos.distanceTo(aiTrains[aiIdx].loco.position);
        var ad2 = lc.pos.distanceTo(aiTrains[aiIdx].wagon.position);
        if (ad1 < minAiDist) minAiDist = ad1;
        if (ad2 < minAiDist) minAiDist = ad2;
      }

      if (minPlayerDist < 66 || minAiDist < 16) {
        lc.isClosed = true;
        lc.currentAngle += (0.0 - lc.currentAngle) * 0.12;
        lc.leftLights.forEach(function(m) { m.color.setHex(flashLeft ? 0xff1111 : 0x3b0707); });
        lc.rightLights.forEach(function(m) { m.color.setHex(flashLeft ? 0x3b0707 : 0xff1111); });

        if (minPlayerDist < 95 && Date.now() - (lc.lastBellTime || 0) > 420) {
          lc.lastBellTime = Date.now();
          if (window.playCzechCrossingBell) window.playCzechCrossingBell();
        }
      } else {
        lc.isClosed = false;
        lc.currentAngle += (Math.PI * 0.44 - lc.currentAngle) * 0.09;
        lc.leftLights.forEach(function(m) { m.color.setHex(0x3b0707); });
        lc.rightLights.forEach(function(m) { m.color.setHex(0x3b0707); });
      }

      lc.pivots.forEach(function(piv) {
        piv.rotation.z = lc.currentAngle;
      });
    });
  }

  // 3. Animate Best Friend #1: Charlie the Helicopter
  heliCharlie.userData.rotor.rotation.y += 0.38;
  var heliTargetX = playerLoco.position.x + 28 + Math.cos(time * 0.35) * 14;
  var heliTargetZ = playerLoco.position.z - 22 + Math.sin(time * 0.35) * 12;
  var heliTargetY = Math.max(26, playerLoco.position.y + 18.5 + Math.sin(time * 1.4) * 1.2);
  heliCharlie.position.lerp(new THREE.Vector3(heliTargetX, heliTargetY, heliTargetZ), 0.08);
  heliCharlie.lookAt(
    playerLoco.position.x,
    heliCharlie.position.y - 4.0,
    playerLoco.position.z
  );

  // Animate Best Friend #4: Sky the Airplane flying between the 2 Airports
  planeSky.position.set(295 + Math.sin(time * 0.3) * 45, 38 + Math.cos(time * 0.6) * 10, Math.cos(time * 0.3) * 180);
  planeSky.lookAt(295 + Math.sin(time * 0.3 + 0.1) * 45, 38, Math.cos(time * 0.3 + 0.1) * 180);

  // 4. Animate the 6 Storybook Road Vehicles (Stopping at lowered Czech Level Crossing barriers & forming a neat multi-car queue!)
  if (window.roadNetworkCurves && window.roadNetworkCurves.length > 0) {
    livingVehicles.forEach(function(lv, idx) {
      var roadCurve = window.roadNetworkCurves[lv.loopIdx % window.roadNetworkCurves.length];
      var roadLen = roadCurve.getLength() || 950;
      var nextProg = (lv.progress + lv.speed) % 1.0;
      var curPt = roadCurve.getPointAt(lv.progress);
      var nxtPt = roadCurve.getPointAt(nextProg);

      var waitingAtBarrier = false;
      if (window.levelCrossings) {
        for (var lci = 0; lci < window.levelCrossings.length; lci++) {
          var lc = window.levelCrossings[lci];
          if (lc.isClosed || lc.currentAngle < 0.95) {
            var dCur = Math.hypot(curPt.x - lc.pos.x, curPt.z - lc.pos.z);
            var dNxt = Math.hypot(nxtPt.x - lc.pos.x, nxtPt.z - lc.pos.z);
            if (dCur < 17.5 && dCur > 5.2 && dNxt < dCur) {
              waitingAtBarrier = true;
              break;
            }
          }
        }
      }

      // Check for any vehicle ahead to maintain safe bumper-to-bumper spacing and form a real queue at barriers!
      var waitingBehindCar = false;
      if (!waitingAtBarrier) {
        for (var oIdx = 0; oIdx < livingVehicles.length; oIdx++) {
          if (oIdx === idx) continue;
          var otherLv = livingVehicles[oIdx];
          if (otherLv.loopIdx === lv.loopIdx) {
            var progDiff = (otherLv.progress - lv.progress + 1.0) % 1.0;
            var arcDistAhead = progDiff * roadLen;
            var minQueueGap = (lv.kind === 'bus' || otherLv.kind === 'bus') ? 13.0 : 10.8;
            if (arcDistAhead > 0.05 && arcDistAhead < minQueueGap) {
              waitingBehindCar = true;
              break;
            }
          } else {
            var otherPt = otherLv.mesh.position;
            var d3Cur = Math.hypot(curPt.x - otherPt.x, curPt.z - otherPt.z);
            var d3Nxt = Math.hypot(nxtPt.x - otherPt.x, nxtPt.z - otherPt.z);
            if (d3Cur < 9.5 && d3Nxt < d3Cur && (otherLv.isStopped || oIdx < idx)) {
              waitingBehindCar = true;
              break;
            }
          }
        }
      }

      lv.isStopped = waitingAtBarrier || waitingBehindCar;
      if (!lv.isStopped) {
        lv.progress = nextProg;
      }

      var vp = roadCurve.getPointAt(lv.progress);
      var vnext = roadCurve.getPointAt((lv.progress + 0.012) % 1.0);
      var roadBaseY = (window.getRoadHeight ? window.getRoadHeight(vp.x, vp.z) : vp.y) + 0.14;
      var nextBaseY = (window.getRoadHeight ? window.getRoadHeight(vnext.x, vnext.z) : vnext.y) + 0.14;
      var bounceY = roadBaseY + (lv.isStopped ? 0 : Math.abs(Math.sin(time * 4 + idx)) * 0.04);

      lv.mesh.position.set(vp.x, bounceY, vp.z);
      lv.mesh.lookAt(vnext.x, nextBaseY, vnext.z);

      if (idx === 1 && !lv.isStopped && Math.random() < 0.03) {
        spawnSmokeAndBubbles(lv.mesh.position, 1, false, 0.9);
      }

      if (lv.mesh.position.distanceTo(playerLoco.position) < 34 && Date.now() - lastFriendChatTime > 12000) {
        lastFriendChatTime = Date.now();
        playCarBeepBeep();
        speakCharacter('friend', lv.name, '#facc15', 'Beep beep! Hi Little Train Toby! Waiting safely in line at the railway crossing while you pass!');
      }
    });
  }

  // Check Best Friend #5: Daisy the Friendly Cow Greeting
  if (daisyTheCow.position.distanceTo(playerLoco.position) < 35 && Date.now() - lastFriendChatTime > 12000) {
    lastFriendChatTime = Date.now();
    playCowMoo();
    speakCharacter('friend', '🐄 Daisy the Friendly Cow', '#22c55e', 'Moooo! Hello Little Train Toby! Have a wonderful ride!');
  }

  // 5. Bees, Butterflies, Boats, Windmill & Soccer Match
  flyingInsects.forEach(function(ins) {
    var t = time * ins.speed + ins.phase;
    ins.mesh.position.set(
      ins.basePos.x + Math.sin(t) * 2.8,
      ins.basePos.y + 0.6 + Math.abs(Math.cos(t * 1.5)) * 1.4,
      ins.basePos.z + Math.cos(t) * 2.8
    );
    ins.mesh.rotation.y = -t;
    var flap = Math.sin(time * 12 + ins.phase) * 0.7;
    ins.mesh.userData.wL.rotation.z = flap;
    ins.mesh.userData.wR.rotation.z = -flap;
  });

  windmillBlades.rotation.z -= 0.022;
  boats.forEach(function(b) {
    b.x += b.speed * b.dir;
    if (b.x > 260) b.dir = -1;
    if (b.x < -260) b.dir = 1;
    b.mesh.position.set(b.x, -1.6, -85 + b.dir * 5);
    b.mesh.rotation.y = b.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  });
  soccerPlayers.forEach(function(sp, i) {
    sp.angle += 0.025 * (i % 2 === 0 ? 1 : -1);
    sp.mesh.position.set(Math.cos(sp.angle) * sp.radius, 1.4, Math.sin(sp.angle) * sp.radius);
  });
  soccerBall.position.set(Math.cos(time * 1.7) * 10, 1.1, Math.sin(time * 2.3) * 10);
  wavingHumans.forEach(function(h) {
    h.armPivot.rotation.z = Math.sin(time * 2.5 + h.phase) * 0.55;
  });

  // ==========================================================================
  // 6. AI TRAINS ON PARALLEL SECOND TRACK WITH RIGHT-OF-WAY YIELDING (`Přednost v jízdě`)!
  //    If Toby is turning across an AI train's path at a junction or occupying
  //    the junction ahead, the AI train smoothly brakes and waits for Toby to pass!
  // ==========================================================================
  aiTrains.forEach(function(ai, aiIdx) {
    var pCurve = ai.edge.parallelCurve || ai.edge.curve;
    var cLen = pCurve.getLength();
    var lookAheadT = Math.min(1.0, ai.t + 14.0 / cLen);
    var aiAheadPt = pCurve.getPointAt(lookAheadT);

    var shouldYield = false;

    // Rule A: Check if AI's lookahead point is close to Toby or any of Toby's coaches
    var distToPlayerLoco = aiAheadPt.distanceTo(playerLoco.position);
    if (distToPlayerLoco < 22.0 && ai.loco.position.distanceTo(playerLoco.position) > distToPlayerLoco) {
      shouldYield = true;
    }
    for (var pci = 0; pci < playerCoaches.length; pci++) {
      var dCoach = aiAheadPt.distanceTo(playerCoaches[pci].position);
      if (dCoach < 20.0) {
        shouldYield = true;
        break;
      }
    }

    // Rule B: If AI is approaching a junction (ai.t > 0.60) and Toby is approaching or inside the SAME junction
    var aiTargetNode = ai.edge.isTurnout ? ai.edge.from : ai.edge.to;
    var playerTargetNode = pState.edge.isTurnout ? pState.edge.from : pState.edge.to;
    if (!ai.edge.isTurnout && ai.t > 0.60 && ai.t < 0.85) {
      if (aiTargetNode === playerTargetNode && (pState.t > 0.58 || pState.edge.isTurnout)) {
        // Toby is at the same junction -> AI politely yields right-of-way to Toby!
        shouldYield = true;
      }
    }

    // Rule C: Yield to the other AI train if paths converge
    var otherAi = aiTrains[(aiIdx + 1) % aiTrains.length];
    if (otherAi && aiAheadPt.distanceTo(otherAi.loco.position) < 20.0 && aiIdx === 1) {
      shouldYield = true;
    }

    var targetAiSpeed = shouldYield ? 0.0 : ai.baseSpeed;
    ai.currentSpeed = (ai.currentSpeed !== undefined ? ai.currentSpeed : ai.baseSpeed);
    ai.currentSpeed += (targetAiSpeed - ai.currentSpeed) * 0.15;

    ai.t += ai.currentSpeed / cLen;
    if (!ai.edge.isTurnout && ai.t >= 0.84) {
      var nextAiEdge = getBranches(ai.edge).straight;
      var aiTurnout = window.turnoutCurves[ai.edge.id + '=>' + nextAiEdge.id];
      if (aiTurnout) {
        ai.edge = aiTurnout;
        ai.t = 0.0;
      } else {
        ai.edge = nextAiEdge;
        ai.t = 0.16;
      }
    } else if (ai.edge.isTurnout && ai.t >= 1.0) {
      ai.edge = ai.edge.targetEdge;
      ai.t = 0.16;
    }
    var actCurve = ai.edge.parallelCurve || ai.edge.curve;
    var ap = actCurve.getPointAt(Math.max(0, Math.min(1, ai.t)));
    var atan = actCurve.getTangentAt(Math.max(0, Math.min(1, ai.t)));
    ai.loco.position.copy(ap); ai.loco.lookAt(ap.clone().add(atan));
    var wp = actCurve.getPointAt(Math.max(0, ai.t - 5.8 / actCurve.getLength()));
    ai.wagon.position.copy(wp); ai.wagon.lookAt(ap);

    if (ai.loco.position.distanceTo(playerLoco.position) < 28 && Date.now() - lastFriendChatTime > 12000) {
      lastFriendChatTime = Date.now();
      playTrainHorn();
      speakCharacter('friend', ai.name, '#38bdf8', shouldYield
        ? 'Choo choo! Giving you right-of-way at the junction, best friend Toby!'
        : 'Choo choo! Passing you safely on the second track, best friend Toby!');
    }
  });

  // 7. Collectibles
  collectibles.forEach(function(c) {
    if (c.cooldown > 0) { c.cooldown--; if (c.cooldown === 0) c.mesh.visible = true; return; }
    c.mesh.rotation.y += 0.045;
    if (playerLoco.position.distanceTo(c.mesh.position) < 5.2) {
      c.mesh.visible = false; c.cooldown = 450;
      playCollectSound();
      spawnSmokeAndBubbles(playerLoco.position, 6, true);
      pState.score += 20; pState.itemsCount++;
      document.getElementById('score-val').textContent = pState.score;
      document.getElementById('wagon-bar-fill').style.width = ((pState.itemsCount / 3) * 100) + '%';
      if (pState.itemsCount >= 3) {
        pState.itemsCount = 0;
        document.getElementById('wagon-bar-fill').style.width = '0%';
        if (playerCoaches.length < 8) {
          addCoach();
          speakCharacter('train', '🚃 Little Train Toby', '#ef4444', 'Yay! We collected 3 treasures and got a new wagon!');
        }
      }
    }
  });

  // 8. Sheep on Tracks
  var sheepBlocking = false;
  trackSheepFlocks.forEach(function(fl) {
    var dist = playerLoco.position.distanceTo(fl.basePos);
    if (dist < 36 && fl.offsetDist < 7.5) {
      fl.scattering = true;
      sheepBlocking = true;
      if (!fl.honked) {
        fl.honked = true;
        playTrainHorn();
        setTimeout(playSheepBaa, 250);
        speakCharacter('mom', '🐑 Mom Narrator', '#ec4899', 'Oh look, fluffy sheep on the track! Toby honks gently so they step onto the grass.');
      }
    }
    if (fl.scattering && fl.offsetDist < 10.5) {
      fl.offsetDist += 0.12;
      fl.group.position.copy(fl.basePos).add(fl.perp.clone().multiplyScalar(fl.offsetDist));
    } else if (dist > 140 && fl.offsetDist >= 10.0) {
      fl.offsetDist = 0; fl.scattering = false; fl.honked = false;
      fl.group.position.copy(fl.basePos);
    }
  });

  // 9. Station Stop & Boarding
  var stCfg = pState.edge.station;
  var curSt = (stCfg && stCfg.type === 'station') ? stationPhysicals[stCfg.name] : null;
  if (curSt && !curSt.visitedThisEdge && pState.speedStage > 0 && pState.t >= 0.48 && pState.t <= 0.54) {
    curSt.visitedThisEdge = true;
    pState.stationPause = 100;
    pState.currentVel = 0;
    pState.activeStName = stCfg.name;
    document.getElementById('place-label').textContent = stCfg.name;
    speakCharacter('mom', stCfg.emoji + ' Mom Narrator', '#ec4899', stCfg.voice);
  }

  if (pState.stationPause > 0) {
    pState.stationPause--;
    var stObj = stationPhysicals[pState.activeStName];
    if (stObj) {
      stObj.pax.forEach(function(p) {
        if (!p.boarded) {
          p.dist += 0.08;
          var np = p.baseTrackPt.clone().add(p.perp.clone().multiplyScalar(p.dist));
          p.human.group.position.set(np.x, np.y, np.z);
          if (p.dist >= -2.0) { p.boarded = true; p.human.group.visible = false; }
        }
      });
      if (pState.stationPause === 1) {
        setTimeout(function() {
          stObj.pax.forEach(function(p) {
            p.dist = -8.8; p.boarded = false;
            var rp = p.baseTrackPt.clone().add(p.perp.clone().multiplyScalar(-8.8));
            p.human.group.position.set(rp.x, rp.y, rp.z);
            p.human.group.visible = true;
          });
        }, 3000);
      }
    }
  }

  // 9B. Check if an AI train is already inside the turnout ahead of Toby -> Toby yields briefly!
  var playerYieldingToAI = false;
  if (!pState.edge.isTurnout && pState.t > 0.72 && pState.t < 0.84 && pState.speedStage > 0) {
    var pLookAhead = pState.edge.curve.getPointAt(Math.min(1.0, pState.t + 0.08));
    for (var aii = 0; aii < aiTrains.length; aii++) {
      var aiCheck = aiTrains[aii];
      if (aiCheck.edge.isTurnout && (aiCheck.loco.position.distanceTo(pLookAhead) < 20.0 || aiCheck.wagon.position.distanceTo(pLookAhead) < 20.0)) {
        playerYieldingToAI = true;
        break;
      }
    }
  }

  // 10. Train Movement across 3D Slopes, Bridges, Tunnels, Metro & Smooth Curved Turnouts
  var targetVel = speedMap[String(pState.speedStage)] || 0;
  if (pState.atGate || pState.stationPause > 0 || sheepBlocking || playerYieldingToAI) {
    targetVel = 0;
  } else if (curSt && !curSt.visitedThisEdge && pState.t > 0.36 && pState.t < 0.48 && targetVel > 0.14) {
    targetVel = 0.14;
  }

  pState.currentVel += (targetVel - pState.currentVel) * 0.065;

  if (Math.abs(pState.currentVel) > 0.002) {
    var edgeLen = pState.edge.curve.getLength();
    pState.t += pState.currentVel / edgeLen;
    wheelMeshes.forEach(function(w) { w.rotation.x += pState.currentVel * 0.42; });
    if (Math.random() < 0.18) spawnSmokeAndBubbles(playerLoco.position, 1, false);

    if (stCfg && stCfg.type !== 'station' && Math.abs(pState.t - 0.50) < 0.015) {
      document.getElementById('place-label').textContent = stCfg.name;
    }

    // Forward transition: Smoothly enter Curved Turnout at t = 0.84, and exit Turnout onto targetEdge at t = 0.16!
    if (pState.currentVel > 0) {
      if (pState.edge.isTurnout && pState.t >= 1.0) {
        pState.prevSegments.unshift({ edge: pState.edge, startT: 0.0, endT: 1.0 });
        if (pState.prevSegments.length > 8) pState.prevSegments.pop();
        pState.edge = pState.edge.targetEdge;
        pState.entryT = 0.16;
        pState.t = 0.16;
        pState.switchChoice = 'straight';
        updateHUD();
      } else if (!pState.edge.isTurnout) {
        var arr = nodes[pState.edge.to];
        var isExitEdge = arr && arr.isExit;
        if (isExitEdge && pState.t >= 0.90 && !arr.unlocked) {
          pState.t = 0.90;
          pState.atGate = true; pState.speedStage = 0; pState.currentVel = 0;
          document.getElementById('gate-title').textContent = arr.name;
          document.getElementById('gate-modal').classList.add('show');
        } else if (!isExitEdge && pState.t >= 0.84) {
          if (curSt) curSt.visitedThisEdge = false;
          var br2 = getBranches(pState.edge);
          var chosenNext = br2[pState.switchChoice] || br2.straight;
          var turnout = window.turnoutCurves[pState.edge.id + '=>' + chosenNext.id];

          pState.prevSegments.unshift({ edge: pState.edge, startT: pState.entryT || 0.16, endT: 0.84 });
          if (pState.prevSegments.length > 8) pState.prevSegments.pop();

          if (turnout) {
            pState.edge = turnout;
            pState.entryT = 0.0;
            pState.t = 0.0;
          } else {
            pState.edge = chosenNext;
            pState.entryT = 0.16;
            pState.t = 0.16;
            pState.switchChoice = 'straight';
            updateHUD();
          }
        }
      }
    } else if (pState.currentVel < 0 && pState.t < (pState.entryT || 0.0)) {
      if (curSt) curSt.visitedThisEdge = false;
      var prevSeg = pState.prevSegments.shift();
      if (prevSeg && prevSeg.edge) {
        pState.edge = prevSeg.edge;
        pState.entryT = prevSeg.startT;
        pState.t = prevSeg.endT;
        updateHUD();
      } else {
        pState.t = pState.entryT || 0.16;
        pState.speedStage = 0;
        pState.currentVel = 0;
        updateHUD();
      }
    }
  }

  var ct = Math.max(0, Math.min(1, pState.t));
  var pos = pState.edge.curve.getPointAt(ct);
  var tan = pState.edge.curve.getTangentAt(ct).normalize();
  var perpVec = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

  playerLoco.position.copy(pos);
  playerLoco.lookAt(pos.clone().add(tan));

  trainHeadLight.position.copy(pos).add(tan.clone().multiplyScalar(6.2)).add(new THREE.Vector3(0, 2.6, 0));

  playerCoaches.forEach(function(c, idx) {
    var wPose = getTrackPoseBehindPlayer((idx + 1) * 5.8);
    c.position.copy(wPose.pos);
    c.lookAt(wPose.pos.clone().add(wPose.dir));
  });

  var wMode = weatherTypes[currentWeatherIdx];
  if (wMode !== 'clear') {
    var fallSpeed = wMode === 'rain' ? 1.4 : 0.45;
    weatherParticles.forEach(function(wp) {
      wp.position.y -= fallSpeed;
      if (wp.position.y < pos.y) {
        wp.position.y = pos.y + 52;
        wp.position.x = pos.x + (Math.random() - 0.5) * 130;
        wp.position.z = pos.z + (Math.random() - 0.5) * 130;
      }
    });
  }

  // 11. 2.5D STORYBOOK CAMERA CHOREOGRAPHY
  var activeStationCfg = pState.edge.isTurnout ? (pState.edge.targetEdge.station || pState.edge.sourceEdge.station) : stCfg;
  var isHeroViaduct = activeStationCfg && activeStationCfg.type === 'hero_viaduct';
  var inDarkTunnelCam = window.isPlayerInDarkTunnel ? window.isPlayerInDarkTunnel(pState.edge, pState.t) : false;
  var uCavStart = (pState.edge && pState.edge.uCavernStart) ? pState.edge.uCavernStart : 0.39;
  var uCavEnd   = (pState.edge && pState.edge.uCavernEnd)   ? pState.edge.uCavernEnd   : 0.61;
  var inMetroCavernCam = Boolean(pState.edge.isSubway && pState.t >= uCavStart && pState.t <= uCavEnd);
  if (pState.faceCamTimer > 0) pState.faceCamTimer--;

  var desiredCam;
  var desiredLook;
  var camLerpSpeed = 0.075;

  if (inMetroCavernCam) {
    // 2.5D Fairy-Tale Underground Diorama Camera:
    // Tracks `pos.x` 1:1 so Toby NEVER drives out of the camera frame, positioned on the
    // unobstructed near side of the active viaduct (`z = ±6.2`) looking across Toby toward the panorama!
    var cz = pState.edge.cavernOffsetZ || -8.0;
    var viewSideZ = cz < 0 ? 6.2 : -6.2;
    var lookBackZ = cz < 0 ? -26.0 : 26.0;
    desiredCam = new THREE.Vector3(pos.x, -19.2, viewSideZ);
    desiredLook = new THREE.Vector3(pos.x, -24.8, lookBackZ);
    camLerpSpeed = 0.18;
  } else if (pState.edge.isSubway && inDarkTunnelCam) {
    // Smooth 2.5D Elevated Follow Camera along the descending/ascending Subway Tunnel Ramp:
    // Looks through the semi-transparent tunnel roof at Toby and his wagons (never inside the yellow wagon!),
    // smoothly gliding from the surface 2.5D angle into the underground cavern diorama view!
    var czRamp = pState.edge.cavernOffsetZ || -8.0;
    var rampSideOffset = czRamp < 0 ? 22.0 : -22.0;
    desiredCam = new THREE.Vector3(
      pos.x - tan.x * 18.0,
      Math.max(-18.5, pos.y + 14.5),
      pos.z + rampSideOffset
    );
    desiredLook = new THREE.Vector3(
      pos.x + tan.x * 6.0,
      pos.y + 1.2,
      pos.z
    );
    camLerpSpeed = 0.16;
  } else if (inDarkTunnelCam) {
    // Surface Mountain Tunnel Camera: elevated 2.5D view looking through the semi-transparent hill roof!
    desiredCam = pos.clone()
      .sub(tan.clone().multiplyScalar(36))
      .add(perpVec.clone().multiplyScalar(24))
      .add(new THREE.Vector3(0, 24, 0));
    desiredLook = pos.clone()
      .add(tan.clone().multiplyScalar(10))
      .add(new THREE.Vector3(0, 2.0, 0));
    camLerpSpeed = 0.14;
  } else if (isHeroViaduct) {
    desiredCam = new THREE.Vector3(pos.x * 0.45 - 8, 38.0, -36);
    desiredLook = new THREE.Vector3(pos.x * 0.45 - 6, 6.5, -162);
  } else {
    desiredCam = pos.clone()
      .sub(tan.clone().multiplyScalar(54))
      .add(perpVec.clone().multiplyScalar(36))
      .add(new THREE.Vector3(0, 38, 0));
    desiredLook = pos.clone()
      .add(tan.clone().multiplyScalar(12))
      .add(new THREE.Vector3(0, 2.5, 0));
  }

  smoothCamPos.lerp(desiredCam, camLerpSpeed);
  smoothCamLook.lerp(desiredLook, 0.14);
  camera.position.copy(smoothCamPos);
  camera.lookAt(smoothCamLook);

  for (var pi2 = particles.length - 1; pi2 >= 0; pi2--) {
    var pt = particles[pi2];
    pt.mesh.position.y += pt.vy;
    pt.scale += 0.018;
    pt.mesh.scale.set(pt.scale, pt.scale, pt.scale);
    pt.mat.opacity -= 0.014;
    if (pt.mat.opacity <= 0) { scene.remove(pt.mesh); particles.splice(pi2, 1); }
  }

  renderer.render(scene, camera);
}
animate();
