// ============================================================================
// MODULE 1: AUDIO.JS (Web Audio API Voice Pack Engine, Conversational Turn-Taking
// Queue, Authentic Steam Locomotive Whistle, Glossy Chimney Bubbles, Prague Metro
// Emblem Renderer & Personalization State)
// ============================================================================

// --- PERSONALIZATION SETTINGS (Child Name, Train Name, Voice Addressing) ---
var STORAGE_KEY_PERSONALIZATION = 'happyTrain_personalization_v1';
window.personalizationSettings = {
  childName: 'Daníček',
  trainName: 'Daníček',
  voiceAddressing: true
};

(function loadPersonalizationFromStorage() {
  try {
    var raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_PERSONALIZATION) : null;
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.childName === 'string') {
          window.personalizationSettings.childName = parsed.childName.trim();
        }
        if (typeof parsed.trainName === 'string' && parsed.trainName.trim().length > 0) {
          window.personalizationSettings.trainName = parsed.trainName.trim();
        }
        if (typeof parsed.voiceAddressing === 'boolean') {
          window.personalizationSettings.voiceAddressing = parsed.voiceAddressing;
        }
      }
    }
  } catch (e) {}
})();

window.getChildName = function() {
  return (window.personalizationSettings && typeof window.personalizationSettings.childName === 'string')
    ? window.personalizationSettings.childName.trim()
    : 'Daníček';
};

window.getTrainName = function() {
  var tName = (window.personalizationSettings && typeof window.personalizationSettings.trainName === 'string')
    ? window.personalizationSettings.trainName.trim()
    : '';
  return tName.length > 0 ? tName : 'Daníček';
};

window.isVoiceAddressingEnabled = function() {
  return Boolean(
    window.personalizationSettings &&
    window.personalizationSettings.voiceAddressing &&
    window.getChildName().length > 0
  );
};

window.applyPersonalizationToUI = function() {
  var tName = window.getTrainName();
  var cName = window.getChildName();
  var vEnabled = Boolean(window.personalizationSettings && window.personalizationSettings.voiceAddressing);

  var badgeEl = document.getElementById('train-name-badge-text');
  if (badgeEl) badgeEl.textContent = tName;

  var cInput = document.getElementById('input-child-name');
  if (cInput && document.activeElement !== cInput) cInput.value = cName;

  var tInput = document.getElementById('input-train-name');
  if (tInput && document.activeElement !== tInput) tInput.value = tName;

  var vInput = document.getElementById('input-voice-addressing');
  if (vInput) vInput.checked = vEnabled;

  if (window.updateTrainNameplates) {
    window.updateTrainNameplates(tName);
  }
};

window.savePersonalizationSettings = function(newChildName, newTrainName, newVoiceAddressing) {
  window.personalizationSettings.childName = (typeof newChildName === 'string') ? newChildName.trim() : '';
  var cleanTrain = (typeof newTrainName === 'string') ? newTrainName.trim() : '';
  window.personalizationSettings.trainName = cleanTrain.length > 0 ? cleanTrain : 'Daníček';
  window.personalizationSettings.voiceAddressing = Boolean(newVoiceAddressing);

  try {
    if (window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_PERSONALIZATION, JSON.stringify(window.personalizationSettings));
    }
  } catch (e) {}

  window.applyPersonalizationToUI();
};

window.formatPersonalizedText = function(role, rawText) {
  var tName = window.getTrainName();
  var text = String(rawText || '')
    .replace(/Little Train Toby/g, 'Little Train ' + tName)
    .replace(/\bToby\b/g, tName);

  if (!window.isVoiceAddressingEnabled()) {
    return text;
  }

  var cName = window.getChildName();
  if (!cName || text.indexOf(cName) !== -1) {
    return text;
  }

  if (text.indexOf('Hello, little explorer!') === 0) {
    return 'Hello, ' + cName + '! Are you ready for an adventure?';
  }
  if (text.indexOf('Hi, buddy!') === 0) {
    return 'Hi, ' + cName + '! I\'m ready to explore!';
  }
  if (text.indexOf('Hey, adventurers!') === 0) {
    return 'Hey, ' + cName + '! Charlie is ready for takeoff!';
  }
  if (text.indexOf('Welcome to our') === 0) {
    return 'Hello ' + cName + '! ' + text;
  }
  if (text.indexOf('Wow! Welcome') === 0) {
    return 'Wow, ' + cName + '! ' + text.slice(5);
  }
  if (text.indexOf('Yay!') === 0) {
    return 'Yay, ' + cName + '!' + text.slice(4);
  }
  if (text.indexOf('Hooray!') === 0) {
    return 'Hooray, ' + cName + '!' + text.slice(7);
  }
  if (text.indexOf('Hi friends!') === 0) {
    return 'Hi ' + cName + ' and friends!' + text.slice(11);
  }
  if (text.indexOf('Entering the Metro') === 0) {
    return 'Hold on tight, ' + cName + '! ' + text;
  }
  if (text.indexOf('Whoosh!') === 0) {
    return 'Whoosh, ' + cName + '!' + text.slice(7);
  }
  if (text.indexOf('Chugga chugga!') === 0) {
    return 'Chugga chugga, ' + cName + '!' + text.slice(14);
  }
  if (text.indexOf('Wonderful!') === 0) {
    return 'Wonderful, ' + cName + '!' + text.slice(10);
  }
  if (text.indexOf('Welcome to ') === 0) {
    return 'Look, ' + cName + '! ' + text;
  }
  return text;
};

// ============================================================================
// OFFICIAL PRAGUE METRO SYMBOL (ZNAK PRAŽSKÉHO METRA) VECTOR RENDERER
// Used on both Railway Junction Direction Signposts AND the 4 Metro Entrances!
// ============================================================================
window.drawPragueMetroSymbol = function(ctx, cx, cy, r, primaryColor) {
  ctx.save();

  // 1. Crisp white circular/emblem background plate
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.fill();

  // 2. Classic Prague Metro Tricolor Header Strip (Linka A Green, Linka B Yellow, Linka C Red)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
  ctx.clip();

  var barY = cy - r * 0.78;
  var barH = r * 0.22;
  ctx.fillStyle = '#00a651'; // Line A Green
  ctx.fillRect(cx - r, barY, (r * 2) / 3, barH);
  ctx.fillStyle = '#facc15'; // Line B Yellow
  ctx.fillRect(cx - r + (r * 2) / 3, barY, (r * 2) / 3, barH);
  ctx.fillStyle = '#d9261c'; // Line C Red
  ctx.fillRect(cx - r + (r * 4) / 3, barY, (r * 2) / 3, barH);
  ctx.restore();

  // 3. Exact Official Geometry of the Prague Metro Symbol (Jiří Rathouský "Vrána" Winged M + Downward Arrow)
  //    Original viewBox: 320.2 x 160.8, centered at (160.1, 80.4)
  var targetW = r * 1.56;
  var scale = targetW / 320.2;
  var ox = cx - 160.1 * scale;
  var oy = cy - 80.4 * scale + r * 0.14;

  var polygons = [
    // Bottom downward arrow triangle
    [[96.94, 97.69], [222.5, 98.17], [159.5, 160.8]],
    // Central letter M
    [
      [159.9, 36.94], [194.4, 0.75], [222.8, 0.85], [222.5, 90.71],
      [197.0, 90.61], [197.2, 35.0], [159.8, 72.84], [122.6, 34.72],
      [122.4, 90.33], [96.98, 90.23], [97.33, 0.38], [125.7, 0.49]
    ],
    // Upper-left wing trapezoid
    [[0, 0], [89.86, 0.35], [89.71, 38.96], [38.46, 38.76]],
    // Lower-left wing triangle
    [[45.89, 46.24], [89.69, 46.41], [89.5, 90.21]],
    // Upper-right wing trapezoid
    [[320.2, 1.23], [230.3, 0.89], [230.1, 39.5], [281.5, 39.7]],
    // Lower-right wing triangle
    [[274.0, 47.12], [230.1, 46.95], [229.9, 90.82]]
  ];

  ctx.fillStyle = primaryColor || '#d9261c';
  for (var p = 0; p < polygons.length; p++) {
    var poly = polygons[p];
    ctx.beginPath();
    for (var i = 0; i < poly.length; i++) {
      var px = ox + poly[i][0] * scale;
      var py = oy + poly[i][1] * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // 4. Crisp outer ring border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(3, r * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

// Creates the Large Prague Metro Entrance Emblem Canvas & 3D Sprite for the 4 Metro Station Portals!
window.createPragueMetroEntranceCanvas = function(accentColor) {
  var c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  var ctx = c.getContext('2d');

  // Outer golden-rimmed dark station emblem shield
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(256, 256, 236, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner colored station line ring
  ctx.strokeStyle = accentColor || '#d9261c';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(256, 256, 214, 0, Math.PI * 2);
  ctx.stroke();

  // Giant Official Prague Metro Symbol inside the emblem
  window.drawPragueMetroSymbol(ctx, 256, 256, 198, '#d9261c');
  return c;
};

window.createPragueMetroEntranceSign = function(themeHexStr) {
  var c = window.createPragueMetroEntranceCanvas(themeHexStr || '#d9261c');
  var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new window.THREE.CanvasTexture(c);
  var sp = new window.THREE.Sprite(
    new window.THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
  );
  sp.scale.set(11.5, 11.5, 1);
  if (window.allSurfaceSigns) {
    window.allSurfaceSigns.push(sp);
  }
  return sp;
};

// ============================================================================
// BACKGROUND MUSIC PLAYER (Suno MP3)
// ============================================================================
var sunoCandidateFiles = [
  'song1.mp3',
  'song2.mp3',
  'Little Train Ride.mp3',
  'Little Train Ride (1).mp3'
];
var currentSongIndex = 0;
var isMusicPlaying = false;
var userMusicVolume = 0.45;
var bgMusicAudio = new Audio();
bgMusicAudio.volume = userMusicVolume;

function playCurrentCandidate() {
  if (!isMusicPlaying) return;
  bgMusicAudio.src = sunoCandidateFiles[currentSongIndex % sunoCandidateFiles.length];
  bgMusicAudio.play().catch(function() {
    currentSongIndex++;
    if (currentSongIndex < sunoCandidateFiles.length * 2) playCurrentCandidate();
  });
}

bgMusicAudio.addEventListener('ended', function() {
  currentSongIndex = (currentSongIndex + 1) % sunoCandidateFiles.length;
  playCurrentCandidate();
});

window.toggleMusic = function() {
  initAudio();
  var btn = document.getElementById('music-toggle-btn');
  if (isMusicPlaying) {
    isMusicPlaying = false;
    bgMusicAudio.pause();
    if (btn) {
      btn.textContent = '🎵 Music: OFF (M)';
      btn.classList.remove('playing');
    }
  } else {
    isMusicPlaying = true;
    if (btn) {
      btn.textContent = '🎵 Music: ON (M)';
      btn.classList.add('playing');
    }
    var volEl = document.getElementById('music-vol');
    if (volEl) userMusicVolume = parseFloat(volEl.value);
    bgMusicAudio.volume = userMusicVolume;
    playCurrentCandidate();
  }
};

window.nextMusicTrack = function() {
  initAudio();
  currentSongIndex = (currentSongIndex + 1) % sunoCandidateFiles.length;
  if (!isMusicPlaying) window.toggleMusic();
  else playCurrentCandidate();
  window.playVoicePackClip('danicek-ready', null, null, 2);
};

window.changeMusicVolume = function(val) {
  userMusicVolume = parseFloat(val);
  bgMusicAudio.volume = userMusicVolume;
};

// ============================================================================
// NATURAL CHARACTER VOICE PACK (20 Authentic Studio WAV Files in /voices/)
// Played directly through Web Audio API (`audioCtx.destination` — the exact same
// hardware output channel as `playTrainHorn`!) with automatic SpeechSynthesis
// fallback if `/voices/` files are not yet uploaded to GitHub Pages.
// ============================================================================
window.VOICE_PACK = {
  // --- STORYTELLER (Achernar) ---
  'storyteller-hello': {
    file: 'voices/storyteller-hello.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 3,
    text: 'Hello, little explorer! Are you ready for an adventure?'
  },
  'storyteller-discovery': {
    file: 'voices/storyteller-discovery.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 2,
    text: 'Look ahead. A magical world is waiting for us.'
  },
  'storyteller-praise': {
    file: 'voices/storyteller-praise.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 2,
    text: 'Wonderful! You found something new.'
  },
  'storyteller-turn-left': {
    file: 'voices/storyteller-turn-left.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#facc15',
    priority: 2,
    text: "Let's turn left and see where the tracks take us."
  },
  'storyteller-turn-right': {
    file: 'voices/storyteller-turn-right.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#f97316',
    priority: 2,
    text: "Let's turn right toward a new adventure."
  },
  'storyteller-go-straight': {
    file: 'voices/storyteller-go-straight.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#4ade80',
    priority: 2,
    text: 'Going straight ahead along the railway line.'
  },
  'storyteller-station': {
    file: 'voices/storyteller-station.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 3,
    text: 'Here we are at the station! Watch the happy passengers step aboard our train.'
  },
  'storyteller-sheep': {
    file: 'voices/storyteller-sheep.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 3,
    text: "Oh look, fluffy white sheep are on the track! Let's honk gently so they step onto the grass."
  },
  'storyteller-sunny': {
    file: 'voices/storyteller-sunny.wav',
    role: 'mom',
    speaker: '📖 Storyteller',
    color: '#ec4899',
    priority: 2,
    text: 'The sun is shining brightly over our fairytale world!'
  },

  // --- DANÍČEK, THE LITTLE TRAIN (Sulafat) ---
  'danicek-ready': {
    file: 'voices/danicek-ready.wav',
    role: 'train',
    speaker: '🚂 Little Train Daníček',
    color: '#0d9488',
    priority: 2,
    text: "Hi, buddy! I'm ready to explore!"
  },
  'danicek-crystals': {
    file: 'voices/danicek-crystals.wav',
    role: 'train',
    speaker: '🚇 Little Train Daníček',
    color: '#a855f7',
    priority: 3,
    text: 'Wow! Look at those beautiful crystals!'
  },
  'danicek-next-stop': {
    file: 'voices/danicek-next-stop.wav',
    role: 'train',
    speaker: '🚂 Little Train Daníček',
    color: '#0d9488',
    priority: 2,
    text: 'Where shall we go next?'
  },
  'danicek-speed-up': {
    file: 'voices/danicek-speed-up.wav',
    role: 'train',
    speaker: '🚂 Little Train Daníček',
    color: '#0d9488',
    priority: 1,
    text: 'Chugga chugga! Going faster! Choo choo!'
  },
  'danicek-slow-down': {
    file: 'voices/danicek-slow-down.wav',
    role: 'train',
    speaker: '🚂 Little Train Daníček',
    color: '#0d9488',
    priority: 1,
    text: 'Slowing down! Easy and steady!'
  },
  'danicek-reverse': {
    file: 'voices/danicek-reverse.wav',
    role: 'train',
    speaker: '🚂 Little Train Daníček',
    color: '#0d9488',
    priority: 2,
    text: 'Backing up! Beep beep, watch out behind me!'
  },
  'danicek-tunnel': {
    file: 'voices/danicek-tunnel.wav',
    role: 'train',
    speaker: '🔦 Little Train Daníček',
    color: '#facc15',
    priority: 3,
    text: 'Whoosh! Entering the dark tunnel! Turning on my bright headlight!'
  },
  'danicek-metro': {
    file: 'voices/danicek-metro.wav',
    role: 'train',
    speaker: '🚇 Little Train Daníček',
    color: '#a855f7',
    priority: 3,
    text: 'Hooray! Into the underground metro tunnel we go! Look at the gnomes and waterfalls!'
  },

  // --- CHARLIE, THE HELICOPTER (Zephyr) ---
  'charlie-takeoff': {
    file: 'voices/charlie-takeoff.wav',
    role: 'charlie',
    speaker: '🚁 Charlie the Helicopter',
    color: '#f97316',
    priority: 2,
    text: 'Hey, adventurers! Charlie is ready for takeoff!'
  },
  'charlie-overview': {
    file: 'voices/charlie-overview.wav',
    role: 'charlie',
    speaker: '🚁 Charlie the Helicopter',
    color: '#f97316',
    priority: 1,
    text: 'I can see something interesting from up here!'
  },
  'charlie-explore': {
    file: 'voices/charlie-explore.wav',
    role: 'charlie',
    speaker: '🚁 Charlie the Helicopter',
    color: '#f97316',
    priority: 1,
    text: "Come on, team! Let's take a closer look!"
  }
};

// ============================================================================
// WEB AUDIO CONTEXT & DIRECT PCM WAV BUFFER DECODER
// Uses the exact same `audioCtx` output channel as `playTrainHorn` so voices
// are 100% guaranteed audible in Gemini AI Studio and Smart TV browsers!
// ============================================================================
var audioCtx = null;
var hasUserGesture = false;
var rawWavArrayBuffers = {};
var decodedVoiceBuffers = {};
var loadingVoicePromises = {};

window.initAudio = function() {
  hasUserGesture = true;
  if (!audioCtx) {
    var CtxClass = window.AudioContext || window.webkitAudioContext;
    if (CtxClass) audioCtx = new CtxClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// Synchronous RIFF WAVE 16-bit PCM parser -> Web Audio API `AudioBuffer`
function parsePcm16WavToAudioBuffer(ctx, arrayBuffer) {
  if (!ctx || !arrayBuffer || arrayBuffer.byteLength < 44) return null;
  try {
    var view = new DataView(arrayBuffer);
    var r0 = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    var w0 = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
    if (r0 !== 'RIFF' || w0 !== 'WAVE') return null;

    var offset = 12;
    var numChannels = 1;
    var sampleRate = 24000;
    var bitsPerSample = 16;
    var dataOffset = -1;
    var dataLength = 0;

    while (offset + 8 <= view.byteLength) {
      var chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      var chunkSize = view.getUint32(offset + 4, true);
      if (chunkId === 'fmt ') {
        numChannels = view.getUint16(offset + 10, true) || 1;
        sampleRate = view.getUint32(offset + 12, true) || 24000;
        bitsPerSample = view.getUint16(offset + 22, true) || 16;
      } else if (chunkId === 'data') {
        dataOffset = offset + 8;
        dataLength = Math.min(chunkSize, view.byteLength - dataOffset);
        break;
      }
      offset += 8 + chunkSize + (chunkSize % 2);
    }

    if (dataOffset < 0 || bitsPerSample !== 16) return null;
    var totalSamples = Math.floor(dataLength / (2 * numChannels));
    if (totalSamples <= 0) return null;

    var audioBuf = ctx.createBuffer(numChannels, totalSamples, sampleRate);
    for (var ch = 0; ch < numChannels; ch++) {
      var chData = audioBuf.getChannelData(ch);
      for (var i = 0; i < totalSamples; i++) {
        var sampleIdx = dataOffset + (i * numChannels + ch) * 2;
        var int16 = view.getInt16(sampleIdx, true);
        chData[i] = int16 / 32768.0;
      }
    }
    return audioBuf;
  } catch (e) {
    return null;
  }
}

function fetchVoiceWavBuffer(clipKey) {
  if (decodedVoiceBuffers[clipKey] && audioCtx) {
    return Promise.resolve(decodedVoiceBuffers[clipKey]);
  }
  if (rawWavArrayBuffers[clipKey] && audioCtx) {
    var syncBuf = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
    if (syncBuf) {
      decodedVoiceBuffers[clipKey] = syncBuf;
      return Promise.resolve(syncBuf);
    }
  }
  if (loadingVoicePromises[clipKey]) {
    return loadingVoicePromises[clipKey];
  }

  var entry = window.VOICE_PACK[clipKey];
  if (!entry) return Promise.reject(new Error('Unknown clipKey'));

  var candidateUrls = [
    entry.file,
    '/' + entry.file.replace(/^\//, ''),
    'public/' + entry.file.replace(/^\//, '')
  ];

  function tryFetchIdx(idx) {
    if (idx >= candidateUrls.length) {
      return Promise.reject(new Error('Voice WAV not found'));
    }
    return fetch(candidateUrls[idx]).then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.arrayBuffer();
    }).then(function(arrBuf) {
      if (!arrBuf || arrBuf.byteLength < 100) throw new Error('Empty WAV');
      rawWavArrayBuffers[clipKey] = arrBuf;
      if (audioCtx) {
        var pcmBuf = parsePcm16WavToAudioBuffer(audioCtx, arrBuf);
        if (pcmBuf) {
          decodedVoiceBuffers[clipKey] = pcmBuf;
          return pcmBuf;
        }
      }
      return null;
    }).catch(function() {
      return tryFetchIdx(idx + 1);
    });
  }

  loadingVoicePromises[clipKey] = tryFetchIdx(0).catch(function(err) {
    delete loadingVoicePromises[clipKey];
    throw err;
  });
  return loadingVoicePromises[clipKey];
}

// Preload all 20 WAV files into memory right away so playback is instantaneous on keypress
(function preloadAllVoiceWavs() {
  var keys = Object.keys(window.VOICE_PACK);
  keys.forEach(function(k, idx) {
    setTimeout(function() {
      fetchVoiceWavBuffer(k).catch(function() {});
    }, idx * 45);
  });
})();

// --- ENGLISH SPEECH SYNTHESIS & CLOUD FALLBACK ENGINE ---
var verifiedEnVoices = [];
function loadEnglishVoices() {
  if (!('speechSynthesis' in window)) return;
  var all = window.speechSynthesis.getVoices() || [];
  verifiedEnVoices = all.filter(function(v) {
    var l = (v.lang || '').toLowerCase();
    var n = (v.name || '').toLowerCase();
    if (l.indexOf('cs') !== -1 || l.indexOf('cz') !== -1 || n.indexOf('zuzana') !== -1) return false;
    return l.indexOf('en') === 0;
  });
}
if ('speechSynthesis' in window) {
  loadEnglishVoices();
  window.speechSynthesis.onvoiceschanged = loadEnglishVoices;
}

// ============================================================================
// CONVERSATIONAL TURN-TAKING QUEUE WITH WEB AUDIO API PLAYBACK
// ============================================================================
var activeBufferSource = null;
var activeVoiceAudio = null;
var activeVoiceKey = null;
var activeVoiceEndTime = 0;
var activeWatchdogTimer = null;
var pendingVoiceItem = null;
var nextVoiceTimer = null;
var deferredWelcomeClip = 'storyteller-hello';
var faceCardTimer = null;
var stationAlternateIdx = 0;
var hornCycleIdx = 0;
var charlieCycleIdx = 0;
var metroCycleIdx = 0;

window.isVoiceCurrentlyPlaying = function() {
  return hasUserGesture && Date.now() < activeVoiceEndTime;
};

function showFaceCamBanner(role, speakerName, avatarColorHex, displayText, durationMs) {
  var card = document.getElementById('face-cam-card');
  var avatar = document.getElementById('face-avatar');
  var tag = document.getElementById('speaker-tag');
  var txtEl = document.getElementById('speech-text');

  var tName = window.getTrainName();
  var resolvedSpeaker = String(speakerName || '')
    .replace(/Little Train Toby/g, 'Little Train ' + tName)
    .replace(/Little Train Daníček/g, 'Little Train ' + tName)
    .replace(/\bToby\b/g, tName);
  var resolvedText = window.formatPersonalizedText(role, displayText);
  var resolvedColor = (role === 'train' && (!avatarColorHex || avatarColorHex === '#ef4444'))
    ? '#0d9488'
    : (avatarColorHex || '#0d9488');

  if (card) {
    if (avatar) avatar.style.background = resolvedColor;
    if (tag) tag.textContent = resolvedSpeaker;
    if (txtEl) txtEl.textContent = resolvedText;
    card.classList.add('visible', 'talking');
    clearTimeout(faceCardTimer);
    faceCardTimer = setTimeout(function() {
      card.classList.remove('talking');
      setTimeout(function() {
        if (!window.isVoiceCurrentlyPlaying() && !pendingVoiceItem) {
          card.classList.remove('visible');
        }
      }, 750);
    }, durationMs || 3800);
  }

  if (window.triggerFaceCamHighlight) window.triggerFaceCamHighlight(110);
}

function onCurrentVoiceFinished() {
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = null;
  activeBufferSource = null;
  activeVoiceAudio = null;
  activeVoiceKey = null;
  activeVoiceEndTime = 0;

  var card = document.getElementById('face-cam-card');
  if (card) {
    card.classList.remove('talking');
  }

  if (pendingVoiceItem) {
    var nextItem = pendingVoiceItem;
    pendingVoiceItem = null;
    clearTimeout(nextVoiceTimer);
    nextVoiceTimer = setTimeout(function() {
      nextVoiceTimer = null;
      startVoiceClipImmediate(nextItem.clipKey, nextItem.customSubtitleText, nextItem.customSpeaker);
    }, 280);
  } else {
    if (isMusicPlaying && bgMusicAudio) {
      bgMusicAudio.volume = userMusicVolume;
    }
    if (card) {
      setTimeout(function() {
        if (!window.isVoiceCurrentlyPlaying() && !pendingVoiceItem) {
          card.classList.remove('visible');
        }
      }, 650);
    }
  }
}

// Fallback speech synthesis ONLY if the WAV file is missing (e.g., when only audio.js is copied to GitHub Pages)
function speakFallbackTTS(role, textToSpeak, estDurationMs) {
  var resolvedText = window.formatPersonalizedText(role, textToSpeak);
  if (!verifiedEnVoices.length) loadEnglishVoices();

  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurationMs + 400);

  if (verifiedEnVoices.length > 0 && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      var u = new SpeechSynthesisUtterance(resolvedText);

      var femalePrefs = ['Samantha', 'Victoria', 'Karen', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Moira'];
      var chosen = verifiedEnVoices[0];
      for (var i = 0; i < femalePrefs.length; i++) {
        var found = verifiedEnVoices.find(function(v) { return v.name.indexOf(femalePrefs[i]) !== -1; });
        if (found) { chosen = found; break; }
      }
      u.voice = chosen;
      u.lang = 'en-US';

      if (role === 'mom') {
        u.pitch = 1.06;
        u.rate = 0.92;
      } else if (role === 'train') {
        u.pitch = 1.42;
        u.rate = 1.02;
      } else {
        u.pitch = 1.18;
        u.rate = 1.08;
      }

      u.onend = function() {
        onCurrentVoiceFinished();
      };
      u.onerror = function() {
        onCurrentVoiceFinished();
      };
      window.speechSynthesis.speak(u);
      return;
    } catch (e) {}
  }

  onCurrentVoiceFinished();
}

function playDecodedWebAudioBuffer(audioBuf, entry, subtitleToShow, speakerToShow) {
  if (!audioCtx || !audioBuf) return false;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop();
    } catch (e) {}
    activeBufferSource = null;
  }

  var durMs = Math.ceil(audioBuf.duration * 1000) + 150;
  activeVoiceEndTime = Date.now() + durMs;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, durMs + 500);
  showFaceCamBanner(entry.role, speakerToShow, entry.color, subtitleToShow, durMs);

  var src = audioCtx.createBufferSource();
  src.buffer = audioBuf;

  var vGain = audioCtx.createGain();
  vGain.gain.setValueAtTime(1.35, audioCtx.currentTime);

  src.connect(vGain);
  vGain.connect(audioCtx.destination);

  activeBufferSource = src;
  src.onended = function() {
    if (activeBufferSource === src) {
      onCurrentVoiceFinished();
    }
  };

  src.start(0);
  return true;
}

function startVoiceClipImmediate(clipKey, customSubtitleText, customSpeaker) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry) return false;

  var subtitleToShow = customSubtitleText || entry.text;
  var speakerToShow = customSpeaker || entry.speaker;
  var estDurMs = Math.max(2600, Math.min(5800, subtitleToShow.length * 68));

  showFaceCamBanner(entry.role, speakerToShow, entry.color, subtitleToShow, estDurMs);

  // CRITICAL FIX: Never lock the voice queue before the user has pressed a key or clicked!
  if (!hasUserGesture) {
    deferredWelcomeClip = clipKey;
    return false;
  }

  window.initAudio();

  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
  }

  activeVoiceKey = clipKey;
  activeVoiceEndTime = Date.now() + estDurMs;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurMs + 900);

  // 1. Instantaneous synchronous playback if the WAV ArrayBuffer is already in memory!
  if (audioCtx && rawWavArrayBuffers[clipKey] && !decodedVoiceBuffers[clipKey]) {
    decodedVoiceBuffers[clipKey] = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
  }
  if (audioCtx && decodedVoiceBuffers[clipKey]) {
    return playDecodedWebAudioBuffer(decodedVoiceBuffers[clipKey], entry, subtitleToShow, speakerToShow);
  }

  // 2. Fetch WAV -> decode into Web Audio Buffer -> play through `audioCtx.destination`
  fetchVoiceWavBuffer(clipKey).then(function(buf) {
    if (activeVoiceKey !== clipKey) return;
    if (audioCtx && !buf && rawWavArrayBuffers[clipKey]) {
      buf = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
      if (buf) decodedVoiceBuffers[clipKey] = buf;
    }
    if (audioCtx && buf) {
      playDecodedWebAudioBuffer(buf, entry, subtitleToShow, speakerToShow);
    } else {
      speakFallbackTTS(entry.role, subtitleToShow, estDurMs);
    }
  }).catch(function() {
    if (activeVoiceKey === clipKey) {
      speakFallbackTTS(entry.role, subtitleToShow, estDurMs);
    }
  });

  return true;
}

// Plays or queues a clip from window.VOICE_PACK without cutting off the current speaker
window.playVoicePackClip = function(clipKey, customSubtitleText, customSpeaker, overridePriority) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry) return false;

  if (!hasUserGesture) {
    showFaceCamBanner(entry.role, customSpeaker || entry.speaker, entry.color, customSubtitleText || entry.text, 3800);
    deferredWelcomeClip = clipKey;
    return false;
  }

  var prio = (overridePriority !== undefined && overridePriority !== null)
    ? overridePriority
    : (entry.priority || 2);

  if (!window.isVoiceCurrentlyPlaying() && !nextVoiceTimer) {
    return startVoiceClipImmediate(clipKey, customSubtitleText, customSpeaker);
  }

  if (activeVoiceKey === clipKey) {
    return false;
  }

  if (!pendingVoiceItem || prio >= pendingVoiceItem.priority) {
    pendingVoiceItem = {
      clipKey: clipKey,
      customSubtitleText: customSubtitleText || null,
      customSpeaker: customSpeaker || null,
      priority: prio
    };
    return true;
  }

  return false;
};

// Maps any game event / speakCharacter call to the exact studio WAV clip & priority
function resolveVoiceClipInfo(role, speakerName, rawText, explicitClipKey) {
  if (explicitClipKey && window.VOICE_PACK[explicitClipKey]) {
    return { key: explicitClipKey, priority: window.VOICE_PACK[explicitClipKey].priority || 2, dropIfBusy: false };
  }

  var s = String(rawText || '').toLowerCase();
  var sp = String(speakerName || '').toLowerCase();

  if (role === 'charlie' || sp.indexOf('charlie') !== -1 || sp.indexOf('helicopter') !== -1) {
    if (s.indexOf('takeoff') !== -1) return { key: 'charlie-takeoff', priority: 2, dropIfBusy: false };
    if (s.indexOf('closer look') !== -1 || s.indexOf('explore') !== -1) return { key: 'charlie-explore', priority: 2, dropIfBusy: false };
    if (s.indexOf('up here') !== -1 || s.indexOf('interesting') !== -1) return { key: 'charlie-overview', priority: 2, dropIfBusy: false };
    var charlieKeys = ['charlie-takeoff', 'charlie-overview', 'charlie-explore'];
    var cKey = charlieKeys[charlieCycleIdx % charlieKeys.length];
    charlieCycleIdx++;
    return { key: cKey, priority: 2, dropIfBusy: false };
  }

  if (role === 'mom') {
    if (s.indexOf('turning left') !== -1 || s.indexOf('turn left') !== -1) {
      return { key: 'storyteller-turn-left', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('turning right') !== -1 || s.indexOf('turn right') !== -1) {
      return { key: 'storyteller-turn-right', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('turning straight') !== -1 || s.indexOf('straight ahead') !== -1) {
      return { key: 'storyteller-go-straight', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('sheep') !== -1) {
      return { key: 'storyteller-sheep', priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('sun is shining') !== -1) {
      return { key: 'storyteller-sunny', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('wonderful') !== -1 || s.indexOf('unlocked') !== -1 || s.indexOf('found') !== -1) {
      return { key: 'storyteller-praise', priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('hello') !== -1 || s.indexOf('welcome to our') !== -1) {
      return { key: 'storyteller-hello', priority: 3, dropIfBusy: false };
    }
    if (
      s.indexOf('school') !== -1 ||
      s.indexOf('stadium') !== -1 ||
      s.indexOf('fountain') !== -1 ||
      s.indexOf('station') !== -1 ||
      s.indexOf('grand central') !== -1
    ) {
      stationAlternateIdx++;
      var stKey = (stationAlternateIdx % 2 === 1) ? 'storyteller-station' : 'storyteller-discovery';
      return { key: stKey, priority: 3, dropIfBusy: false };
    }
    return { key: 'storyteller-discovery', priority: 2, dropIfBusy: false };
  }

  if (role === 'train') {
    if (s.indexOf('gnome cavern') !== -1 || s.indexOf('crystals') !== -1 || s.indexOf('magic mushrooms') !== -1) {
      metroCycleIdx++;
      var mKey = (metroCycleIdx % 2 === 1) ? 'danicek-crystals' : 'danicek-metro';
      return { key: mKey, priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('entering the metro') !== -1 || s.indexOf('metro station tunnel') !== -1) {
      return { key: 'danicek-metro', priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('dark mountain tunnel') !== -1 || s.indexOf('dark tunnel') !== -1 || s.indexOf('headlight') !== -1) {
      return { key: 'danicek-tunnel', priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('speed') !== -1 || s.indexOf('chugga') !== -1 || s.indexOf('faster') !== -1) {
      return { key: 'danicek-speed-up', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('backing up') !== -1 || s.indexOf('turning back') !== -1 || s.indexOf('reverse') !== -1) {
      return { key: 'danicek-reverse', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('slowing down') !== -1) {
      return { key: 'danicek-slow-down', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('new wagon') !== -1 || s.indexOf('3 treasures') !== -1) {
      return { key: 'storyteller-praise', priority: 3, dropIfBusy: false };
    }
    if (s.indexOf('raindrops') !== -1 || s.indexOf('snowflakes') !== -1 || s.indexOf('next stop') !== -1) {
      return { key: 'danicek-next-stop', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('hi friends!') !== -1) {
      var interactiveCycle = [
        'danicek-ready',
        'charlie-takeoff',
        'danicek-next-stop',
        'charlie-overview',
        'storyteller-discovery',
        'charlie-explore'
      ];
      var chosenKey = interactiveCycle[hornCycleIdx % interactiveCycle.length];
      hornCycleIdx++;
      return { key: chosenKey, priority: 2, dropIfBusy: false };
    }
    return { key: 'danicek-ready', priority: 2, dropIfBusy: false };
  }

  var friendCycle = [
    'charlie-overview',
    'charlie-explore',
    'danicek-next-stop',
    'storyteller-discovery',
    'charlie-takeoff'
  ];
  var fKey = friendCycle[charlieCycleIdx % friendCycle.length];
  charlieCycleIdx++;
  return { key: fKey, priority: 1, dropIfBusy: true };
}

window.speakCharacter = function(role, speakerName, avatarColorHex, text, explicitClipKey) {
  var info = resolveVoiceClipInfo(role, speakerName, text, explicitClipKey);
  if (!info || !info.key || !window.VOICE_PACK[info.key]) return;

  if (info.dropIfBusy && (window.isVoiceCurrentlyPlaying() || pendingVoiceItem)) {
    return;
  }

  window.playVoicePackClip(info.key, null, null, info.priority);
};

window.speakPureEnglish = function(emoji, text) {
  window.speakCharacter('mom', '📖 Storyteller', '#ec4899', text);
};

// ============================================================================
// USER GESTURE AUDIO UNLOCK & CHARLIE THE HELICOPTER SKY DIRECTOR
// ============================================================================
function unlockAudioOnFirstGesture(playWelcomeIfIdle) {
  var wasUnlocked = hasUserGesture;
  window.initAudio();
  if (!wasUnlocked && playWelcomeIfIdle) {
    setTimeout(function() {
      if (!window.isVoiceCurrentlyPlaying() && !pendingVoiceItem) {
        window.playVoicePackClip(deferredWelcomeClip || 'storyteller-hello', null, null, 3);
      }
    }, 60);
  }
}

window.addEventListener('keydown', function onKey(e) {
  unlockAudioOnFirstGesture(false);
  if ((e.key === 'c' || e.key === 'C') && (!document.activeElement || ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1)) {
    var cClips = ['charlie-takeoff', 'charlie-overview', 'charlie-explore'];
    var ck = cClips[charlieCycleIdx % cClips.length];
    charlieCycleIdx++;
    window.playVoicePackClip(ck, null, null, 2);
  }
}, true);

window.addEventListener('pointerdown', function onPointer() {
  unlockAudioOnFirstGesture(true);
}, true);

var lastAutoSkyCallout = Date.now() + 8000;
setInterval(function() {
  if (!hasUserGesture) return;
  if (window.isVoiceCurrentlyPlaying() || pendingVoiceItem) return;
  if (Date.now() - lastAutoSkyCallout < 20000) return;

  if (window.pState && Math.abs(window.pState.currentVel || 0) > 0.04 && !window.pState.atGate) {
    lastAutoSkyCallout = Date.now();
    if (window.pState.inSubway) {
      window.playVoicePackClip('danicek-crystals', null, null, 2);
    } else {
      var skyRotation = [
        'charlie-overview',
        'charlie-explore',
        'storyteller-discovery',
        'danicek-next-stop',
        'charlie-takeoff'
      ];
      var nextClip = skyRotation[charlieCycleIdx % skyRotation.length];
      charlieCycleIdx++;
      window.playVoicePackClip(nextClip, null, null, 1);
    }
  }
}, 4000);

// ============================================================================
// GLOSSY IRIDESCENT CHIMNEY BUBBLE GENERATOR (Triggered on Steam Whistle!)
// ============================================================================
var chimneyBubbleCols = [
  '#38bdf8', '#f472b6', '#facc15', '#4ade80',
  '#c084fc', '#fb923c', '#2dd4bf', '#f43f5e'
];
var cachedBubbleMats = [];

function getIridescentBubbleMaterial(idx) {
  var cIdx = idx % chimneyBubbleCols.length;
  if (cachedBubbleMats[cIdx]) return cachedBubbleMats[cIdx];
  if (!window.THREE) return null;

  var hexStr = chimneyBubbleCols[cIdx];
  var c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  var ctx = c.getContext('2d');

  var grad = ctx.createRadialGradient(52, 48, 8, 64, 64, 58);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.20)');
  grad.addColorStop(0.55, hexStr + '55');
  grad.addColorStop(0.84, hexStr + 'cc');
  grad.addColorStop(0.96, '#ffffff');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = hexStr;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.ellipse(44, 38, 16, 8.5, -Math.PI * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(32, 54, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(64, 64, 46, Math.PI * 0.15, Math.PI * 0.42);
  ctx.stroke();

  var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new window.THREE.CanvasTexture(c);
  cachedBubbleMats[cIdx] = new window.THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.96
  });
  return cachedBubbleMats[cIdx];
}

function spawnGlossyChimneyBurst(count) {
  if (!window.THREE || !window.scene || !window.playerLoco || !window.particles) return;
  var origin = window.playerLoco.position.clone().add(new window.THREE.Vector3(0, 3.85, 0));
  if (window.pState && window.pState.edge && window.pState.edge.curve) {
    var ct = Math.max(0, Math.min(1, window.pState.t || 0));
    var tan = window.pState.edge.curve.getTangentAt(ct).normalize();
    origin = window.playerLoco.position.clone()
      .add(tan.multiplyScalar(1.45))
      .add(new window.THREE.Vector3(0, 3.85, 0));
  }

  for (var i = 0; i < count; i++) {
    var baseMat = getIridescentBubbleMaterial(i + Math.floor(Math.random() * 8));
    if (!baseMat) continue;
    var bMat = baseMat.clone();
    var bSprite = new window.THREE.Sprite(bMat);
    var initScale = 0.68 + Math.random() * 0.92;
    bSprite.scale.set(initScale, initScale, initScale);
    bSprite.position.set(
      origin.x + (Math.random() - 0.5) * 1.4,
      origin.y + (Math.random() - 0.2) * 0.9,
      origin.z + (Math.random() - 0.5) * 1.4
    );
    window.scene.add(bSprite);
    window.particles.push({
      mesh: bSprite,
      mat: bMat,
      isBubble: true,
      vx: (Math.random() - 0.5) * 0.14,
      vy: 0.12 + Math.random() * 0.12,
      vz: (Math.random() - 0.5) * 0.14,
      swirlPhase: Math.random() * Math.PI * 2,
      swirlAmp: 0.045 + Math.random() * 0.05,
      scale: initScale,
      growRate: 0.015 + Math.random() * 0.012,
      fadeRate: 0.0085 + Math.random() * 0.005
    });
  }
}

// ============================================================================
// WEB AUDIO SYNTHESIZER (Authentic Steam Locomotive Whistle + Steam Hiss!)
// ============================================================================
function playTone(freqs, dur, type) {
  window.initAudio();
  if (!audioCtx) return;
  var now = audioCtx.currentTime;
  freqs.forEach(function(f, idx) {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(f, now + idx * 0.06);
    gain.gain.setValueAtTime(0.11, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + dur);
  });
}

// Authentic Fairytale Steam Locomotive Two-Chime Whistle ("Húúú - húúúúú!") + Steam Puff Hiss + Bubbles
window.playTrainHorn = function() {
  window.initAudio();

  // Launch multi-wave fountain of glossy colorful chimney soap bubbles!
  spawnGlossyChimneyBurst(16);
  setTimeout(function() { spawnGlossyChimneyBurst(12); }, 140);
  setTimeout(function() { spawnGlossyChimneyBurst(10); }, 280);

  if (!audioCtx) return;
  var now = audioCtx.currentTime;

  var chordFreqs = [349.23, 440.0, 523.25, 587.33];
  var blasts = [
    { start: 0.0,  dur: 0.34, peak: 0.075 },
    { start: 0.40, dur: 0.68, peak: 0.085 }
  ];

  blasts.forEach(function(b) {
    chordFreqs.forEach(function(baseFreq, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = (i % 2 === 0) ? 'triangle' : 'sine';

      var t0 = now + b.start;
      var tEnd = t0 + b.dur;
      osc.frequency.setValueAtTime(baseFreq * 0.97, t0);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, t0 + 0.05);
      osc.frequency.setValueAtTime(baseFreq, tEnd - 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.96, tEnd);

      var noteGain = b.peak * (i === 3 ? 0.55 : 1.0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(noteGain, t0 + 0.04);
      gain.gain.setValueAtTime(noteGain * 0.9, tEnd - 0.10);
      gain.gain.exponentialRampToValueAtTime(0.0005, tEnd);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(tEnd + 0.02);
    });
  });

  // Soft white-noise steam chuff/hiss accompanying the whistle and bubbles
  try {
    var bufferSize = Math.floor(audioCtx.sampleRate * 0.9);
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var s = 0; s < bufferSize; s++) {
      output[s] = (Math.random() * 2 - 1) * Math.exp(-s / (audioCtx.sampleRate * 0.35));
    }
    var whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.2, now);

    var nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0.045, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);

    whiteNoise.connect(filter);
    filter.connect(nGain);
    nGain.connect(audioCtx.destination);
    whiteNoise.start(now);
  } catch (e) {}
};

var lastCollectVoiceTime = 0;
window.playCollectSound = function() {
  playTone([587.33, 880.0, 1174.66], 0.26, 'sine');
  if (!window.isVoiceCurrentlyPlaying() && !pendingVoiceItem && Date.now() - lastCollectVoiceTime > 10000) {
    lastCollectVoiceTime = Date.now();
    window.playVoicePackClip('storyteller-praise', null, null, 2);
  }
};
window.playSheepBaa = function() { playTone([310, 275, 300], 0.32, 'sawtooth'); };
window.playCowMoo = function() { playTone([145, 130], 0.75, 'sawtooth'); };
window.playCarBeepBeep = function() { playTone([480, 620], 0.18, 'square'); };
window.playHappyLaugh = function() { playTone([523, 659, 587, 784, 659], 0.14, 'sine'); };
window.playMagicSubwaySound = function() { playTone([440, 554.37, 659.25, 880, 1108.73], 0.35, 'sine'); };

// Authentic Czech Railway Crossing Bell (AŽD 71 / 97 "cink-cink-cink")
window.playCzechCrossingBell = function() {
  window.initAudio();
  if (!audioCtx) return;
  var now = audioCtx.currentTime;
  [1046.5, 1318.5, 2093.0].forEach(function(freq, i) {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = i === 2 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    var vol = i === 0 ? 0.08 : (i === 1 ? 0.05 : 0.025);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.24);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  });
};

// ============================================================================
// RUNTIME ENHANCEMENT BRIDGE (Upgrades Metro Turnouts, Signpost Icons &
// Large Prague Metro Entrance Symbols even when copying only `audio.js`!)
// ============================================================================
window.addEventListener('load', function() {
  setTimeout(function() {
    if (!window.edges || !window.nodes || !window.turnoutCurves || !window.THREE) return;

    // 1. Allow turning into all 4 Metro Stations from both incoming directions
    window.getBranches = function(currentEdge) {
      var baseEdge = currentEdge.isTurnout ? currentEdge.targetEdge : currentEdge;
      var node = baseEdge.to;
      var p1 = baseEdge.curve.getPointAt(0.84);
      var inDir = baseEdge.curve.getTangentAt(0.84).normalize();

      var candidates = window.edges.filter(function(e) {
        if (e.from !== node || e.to === baseEdge.from) return false;
        return true;
      });
      if (candidates.length === 0) {
        candidates = window.edges.filter(function(e) { return e.from === node && !e.isSubway; });
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

    // 2. Build any missing turnout curves into Metro edges
    window.edges.forEach(function(edgeIn) {
      if (edgeIn.to.indexOf('EXIT_') === 0) return;
      var nodePos = window.nodes[edgeIn.to].pos;
      window.edges.forEach(function(edgeOut) {
        if (edgeOut.from !== edgeIn.to || edgeOut.to === edgeIn.from) return;
        if (edgeIn.isSubway && edgeOut.isSubway) return;
        var key = edgeIn.id + '=>' + edgeOut.id;
        if (!window.turnoutCurves[key]) {
          var p0 = edgeIn.curve.getPointAt(0.84);
          var t0 = edgeIn.curve.getTangentAt(0.84).normalize();
          var p4 = edgeOut.curve.getPointAt(0.16);
          var t4 = edgeOut.curve.getTangentAt(0.16).normalize();
          var chord = p0.distanceTo(p4);
          var handleLen = Math.max(4.0, chord * 0.34);
          var p1 = p0.clone().add(t0.clone().multiplyScalar(handleLen));
          var p3 = p4.clone().sub(t4.clone().multiplyScalar(handleLen));
          var p2 = p1.clone().lerp(p3, 0.5).lerp(nodePos, 0.22);
          p2.y = (p1.y + p3.y) * 0.5;
          var mainFillet = new window.THREE.CatmullRomCurve3([p0, p1, p2, p3, p4], false);
          window.turnoutCurves[key] = {
            id: 'TURNOUT_' + key,
            from: edgeIn.to,
            to: edgeOut.to,
            isTurnout: true,
            isSubway: false,
            sourceEdge: edgeIn,
            targetEdge: edgeOut,
            curve: mainFillet,
            parallelCurve: mainFillet,
            station: edgeOut.isSubway ? edgeOut.station : edgeIn.station
          };
          if (typeof window.renderSingleTrackCurve === 'function') {
            window.renderSingleTrackCurve(mainFillet, true, window.turnoutCurves[key], 0.0, 1.0);
          }
        }
      });
    });

    // 3. Upgrade the 4 Surface Metro Entrance Signs to the Large Prague Metro Symbol (`Znak pražského metra`)
    if (window.allSurfaceSigns && window.allSurfaceSigns.length > 0) {
      var lineColors = ['#2563eb', '#9333ea', '#16a34a', '#ea580c'];
      window.allSurfaceSigns.forEach(function(sp, idx) {
        if (!sp || !sp.material) return;
        var mCanvas = window.createPragueMetroEntranceCanvas(lineColors[idx % lineColors.length]);
        var mTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(mCanvas) : new window.THREE.CanvasTexture(mCanvas);
        sp.material.map = mTex;
        sp.material.needsUpdate = true;
        sp.scale.set(11.5, 11.5, 1);
      });
    }

    // 4. Rebuild Railway Junction Direction Signposts so all Metro branches show the Prague Metro Symbol!
    if (window.junctionSignsGroup && window.scene) {
      while (window.junctionSignsGroup.children.length > 0) {
        window.junctionSignsGroup.remove(window.junctionSignsGroup.children[0]);
      }

      function getBranchInfo(bEdge) {
        if (!bEdge) return { icon: 'city', badgeCol: '#0284c7' };
        if (bEdge.isSubway) return { icon: 'metro', badgeCol: '#2563eb' };
        var stType = bEdge.station ? bEdge.station.type : '';
        var stName = bEdge.station ? (bEdge.station.name || '') : '';
        if (stType === 'bridge_suspension' || stType === 'hero_viaduct' || stType === 'viaduct') {
          return { icon: 'bridge', badgeCol: '#dc2626' };
        }
        if (stType === 'tunnel') return { icon: 'tunnel', badgeCol: '#475569' };
        if (stType === 'depot') return { icon: 'depot', badgeCol: '#d97706' };
        if (bEdge.to === 'EXIT_ALPS') return { icon: 'alps', badgeCol: '#0284c7' };
        if (bEdge.to === 'EXIT_EGYPT') return { icon: 'egypt', badgeCol: '#ca8a04' };
        if (bEdge.to === 'J_CENTER' || stName.indexOf('Fountain') !== -1) return { icon: 'city', badgeCol: '#0284c7' };
        if (bEdge.to === 'J_WEST' || bEdge.to === 'J_EAST') return { icon: 'bridge', badgeCol: '#dc2626' };
        if (bEdge.to === 'J_NORTH' || stName.indexOf('School') !== -1) return { icon: 'school', badgeCol: '#16a34a' };
        if (bEdge.to === 'J_SW' || stName.indexOf('Stadium') !== -1) return { icon: 'stadium', badgeCol: '#15803d' };
        if (bEdge.to === 'J_NE') return { icon: 'city', badgeCol: '#db2777' };
        if (bEdge.to === 'J_SE') return { icon: 'city', badgeCol: '#7c3aed' };
        return { icon: 'city', badgeCol: '#0284c7' };
      }

      function drawArrow(ctx, dirType, cx, cy, size) {
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

      function drawIcon(ctx, iconType, cx, cy, r) {
        ctx.save();
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
        ctx.clip();

        if (iconType === 'metro') {
          window.drawPragueMetroSymbol(ctx, cx, cy, r, '#d9261c');
        } else if (iconType === 'bridge') {
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(cx - r, cy + r * 0.32, r * 2, r * 0.70);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(cx - r * 0.92, cy - r * 0.34, r * 1.84, r * 0.72);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(cx - r * 0.92, cy - r * 0.42, r * 1.84, r * 0.10);
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.arc(cx - r * 0.42, cy + r * 0.34, r * 0.28, Math.PI, 0, false);
          ctx.arc(cx + r * 0.42, cy + r * 0.34, r * 0.28, Math.PI, 0, false);
          ctx.fill();
        } else if (iconType === 'tunnel') {
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
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(cx + r * 0.42, cy - r * 0.05, r * 0.34, 0, Math.PI * 2);
          ctx.stroke();
        } else if (iconType === 'stadium') {
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
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(cx - r, cy + r * 0.45, r * 2, r * 0.6);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx - r * 0.72, cy - r * 0.15, r * 0.64, r * 0.68);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.78, cy - r * 0.15);
          ctx.lineTo(cx - r * 0.40, cy - r * 0.68);
          ctx.lineTo(cx - r * 0.02, cy - r * 0.15);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(cx + r * 0.04, cy - r * 0.38, r * 0.64, r * 0.92);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx + r * 0.16, cy - r * 0.22, r * 0.16, r * 0.16);
          ctx.fillRect(cx + r * 0.40, cy - r * 0.22, r * 0.16, r * 0.16);
          ctx.fillRect(cx + r * 0.16, cy + r * 0.06, r * 0.16, r * 0.16);
          ctx.fillRect(cx + r * 0.40, cy + r * 0.06, r * 0.16, r * 0.16);
        } else {
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

      function makeSignBoardCanvas(rows) {
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

          drawArrow(ctx, r.dirType, 130, cy + 6, 98);
          drawIcon(ctx, r.info.icon, 355, cy + 6, 68);
        }
        return c;
      }

      var postMat = new window.THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
      var trimMat = new window.THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

      window.edges.forEach(function(e) {
        if (e.isSubway || e.isTurnout) return;
        if (e.to.indexOf('EXIT_') === 0) return;

        var br = window.getBranches(e);
        if (!br) return;

        var rows = [];
        var usedIds = {};
        if (br.left && (!br.straight || br.left.id !== br.straight.id)) {
          usedIds[br.left.id] = true;
          rows.push({ dirType: 'left', info: getBranchInfo(br.left) });
        }
        if (br.straight && !usedIds[br.straight.id]) {
          usedIds[br.straight.id] = true;
          rows.push({ dirType: 'straight', info: getBranchInfo(br.straight) });
        }
        if (br.right && !usedIds[br.right.id]) {
          usedIds[br.right.id] = true;
          rows.push({ dirType: 'right', info: getBranchInfo(br.right) });
        }
        if (rows.length === 0) return;

        var uSign = 0.81;
        var pt = e.curve.getPointAt(uSign);
        var tan = e.curve.getTangentAt(uSign).normalize();
        var rightVec = new window.THREE.Vector3(-tan.z, 0, tan.x).normalize();
        var signPos = pt.clone().add(rightVec.clone().multiplyScalar(7.8));

        var signG = new window.THREE.Group();
        signG.position.copy(signPos);

        var pole = new window.THREE.Mesh(new window.THREE.CylinderGeometry(0.24, 0.32, 9.6, 10), postMat);
        pole.position.y = 1.4;
        var cap = new window.THREE.Mesh(new window.THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), trimMat);
        cap.position.y = 6.2;
        signG.add(pole, cap);

        var signCanvas = makeSignBoardCanvas(rows);
        var signTex = window.upgradeCanvasTex ? window.upgradeCanvasTex(signCanvas) : new window.THREE.CanvasTexture(signCanvas);
        var signSprite = new window.THREE.Sprite(
          new window.THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: true })
        );
        var signH = 2.4 * rows.length;
        signSprite.scale.set(7.4, signH, 1);
        signSprite.position.set(0, 6.4 + signH * 0.45, 0);
        signG.add(signSprite);

        window.junctionSignsGroup.add(signG);
      });
    }

    if (typeof window.updateHUD === 'function') {
      window.updateHUD();
    }
  }, 50);
});
