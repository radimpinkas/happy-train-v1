// ============================================================================
// MODULE 1: AUDIO.JS (Natural Character Voice Pack Engine with Conversational
// Turn-Taking Queue, Automatic SpeechSynthesis Fallback, Authentic Steam
// Locomotive Whistle, Glossy Chimney Bubbles & Personalization State)
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
// NATURAL CHARACTER VOICE PACK (20 Authentic Studio WAV Files in /voices/
// + Automatic Multi-Voice SpeechSynthesis / Cloud TTS Fallback for GitHub Pages)
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
// CONVERSATIONAL TURN-TAKING QUEUE WITH GUARANTEED PLAYBACK
// ============================================================================
var activeVoiceAudio = null;
var activeVoiceKey = null;
var activeVoiceEndTime = 0;
var activeWatchdogTimer = null;
var pendingVoiceItem = null;
var nextVoiceTimer = null;
var faceCardTimer = null;
var stationAlternateIdx = 0;
var hornCycleIdx = 0;
var charlieCycleIdx = 0;
var metroCycleIdx = 0;

window.isVoiceCurrentlyPlaying = function() {
  return Date.now() < activeVoiceEndTime;
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
    }, 320);
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

// Fallback speech synthesis if WAV file is missing (e.g., when only audio.js is copied to GitHub Pages)
function speakFallbackTTS(role, textToSpeak, estDurationMs) {
  var resolvedText = window.formatPersonalizedText(role, textToSpeak);
  if (!verifiedEnVoices.length) loadEnglishVoices();

  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurationMs + 300);

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

  // Cloud TTS fallback if no local English voice is installed
  try {
    var url = 'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en-US&q=' + encodeURIComponent(resolvedText);
    var fbAudio = new Audio(url);
    fbAudio.playbackRate = role === 'train' ? 1.12 : (role === 'charlie' ? 1.08 : 0.96);
    activeVoiceAudio = fbAudio;
    fbAudio.onended = onCurrentVoiceFinished;
    fbAudio.onerror = onCurrentVoiceFinished;
    fbAudio.play().catch(function() {
      onCurrentVoiceFinished();
    });
  } catch (e) {
    onCurrentVoiceFinished();
  }
}

function startVoiceClipImmediate(clipKey, customSubtitleText, customSpeaker) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry) return false;

  var subtitleToShow = customSubtitleText || entry.text;
  var speakerToShow = customSpeaker || entry.speaker;
  var estDurMs = Math.max(2600, Math.min(5800, subtitleToShow.length * 68));

  showFaceCamBanner(entry.role, speakerToShow, entry.color, subtitleToShow, estDurMs);

  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
  }

  activeVoiceKey = clipKey;
  activeVoiceEndTime = Date.now() + estDurMs;

  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurMs + 800);

  // Create a fresh Audio instance per playback so event listeners & Promises never go stale
  var audioEl = new Audio(entry.file);
  activeVoiceAudio = audioEl;

  var fallbackTriggered = false;
  function triggerFallbackOnce() {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    speakFallbackTTS(entry.role, subtitleToShow, estDurMs);
  }

  audioEl.onloadedmetadata = function() {
    if (audioEl.duration && isFinite(audioEl.duration) && audioEl.duration > 0.2) {
      var durMs = Math.ceil(audioEl.duration * 1000) + 200;
      activeVoiceEndTime = Date.now() + durMs;
      clearTimeout(activeWatchdogTimer);
      activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, durMs + 600);
      showFaceCamBanner(entry.role, speakerToShow, entry.color, subtitleToShow, durMs);
    }
  };

  audioEl.onended = function() {
    if (!fallbackTriggered) {
      onCurrentVoiceFinished();
    }
  };

  audioEl.onerror = function() {
    triggerFallbackOnce();
  };

  try {
    var playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        triggerFallbackOnce();
      });
    }
    return true;
  } catch (e) {
    triggerFallbackOnce();
    return true;
  }
}

// Plays or queues a clip from window.VOICE_PACK without cutting off the current speaker
window.playVoicePackClip = function(clipKey, customSubtitleText, customSpeaker, overridePriority) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry) return false;

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
      return { key: 'danicek-speed-up', priority: 1, dropIfBusy: false };
    }
    if (s.indexOf('backing up') !== -1 || s.indexOf('turning back') !== -1 || s.indexOf('reverse') !== -1) {
      return { key: 'danicek-reverse', priority: 2, dropIfBusy: false };
    }
    if (s.indexOf('slowing down') !== -1) {
      return { key: 'danicek-slow-down', priority: 1, dropIfBusy: false };
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
// AUTOMATIC WELCOME DIALOGUE & CHARLIE THE HELICOPTER SKY DIRECTOR
// ============================================================================
var welcomeSequenceStarted = false;
function triggerWelcomeVoiceSequence() {
  if (welcomeSequenceStarted) return;
  welcomeSequenceStarted = true;

  if (!window.isVoiceCurrentlyPlaying()) {
    window.playVoicePackClip('storyteller-hello', null, null, 3);
  }
}

window.addEventListener('keydown', function onKey(e) {
  if (!welcomeSequenceStarted) {
    welcomeSequenceStarted = true;
  }
  if ((e.key === 'c' || e.key === 'C') && (!document.activeElement || ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1)) {
    var cClips = ['charlie-takeoff', 'charlie-overview', 'charlie-explore'];
    var ck = cClips[charlieCycleIdx % cClips.length];
    charlieCycleIdx++;
    window.playVoicePackClip(ck, null, null, 2);
  }
});

window.addEventListener('pointerdown', function onFirstPointer() {
  if (!welcomeSequenceStarted) {
    triggerWelcomeVoiceSequence();
  }
}, { once: true });

var lastAutoSkyCallout = Date.now() + 10000;
setInterval(function() {
  if (window.isVoiceCurrentlyPlaying() || pendingVoiceItem) return;
  if (Date.now() - lastAutoSkyCallout < 22000) return;

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
var audioCtx = null;
window.initAudio = function() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

function playTone(freqs, dur, type) {
  initAudio();
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
  initAudio();

  // Launch multi-wave fountain of glossy colorful chimney soap bubbles!
  spawnGlossyChimneyBurst(16);
  setTimeout(function() { spawnGlossyChimneyBurst(12); }, 140);
  setTimeout(function() { spawnGlossyChimneyBurst(10); }, 280);

  if (!audioCtx) return;
  var now = audioCtx.currentTime;

  // Warm steam whistle harmonic chord (F4 + A4 + C5 + D5) played in two expressive blasts
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
  initAudio();
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
// RUNTIME ENHANCEMENT BRIDGE (Ensures Metro Left/Right Turnouts & Glossy
// Chimney Bubbles work seamlessly even when copying only audio.js!)
// ============================================================================
window.addEventListener('load', function() {
  setTimeout(function() {
    if (window.edges && window.nodes && window.turnoutCurves && window.THREE) {
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

      // Build any missing turnout curves into Metro edges from both incoming directions
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

      if (typeof window.updateHUD === 'function') {
        window.updateHUD();
      }
    }
  }, 50);
});
