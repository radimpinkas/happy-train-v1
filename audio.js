// ============================================================================
// MODULE 1: AUDIO.JS (Multi-Voice System: Mom Narrator, Child Train, Friends,
// Personalization State in localStorage & Suno MP3)
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

var sunoCandidateFiles = [
  'song1.mp3',
  'song2.mp3',
  'Little Train Ride.mp3',
  'Little Train Ride (1).mp3'
];
var currentSongIndex = 0;
var isMusicPlaying = false;
var bgMusicAudio = new Audio();
bgMusicAudio.volume = 0.45;

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
    btn.textContent = '🎵 Music: OFF (M)';
    btn.classList.remove('playing');
  } else {
    isMusicPlaying = true;
    btn.textContent = '🎵 Music: ON (M)';
    btn.classList.add('playing');
    bgMusicAudio.volume = parseFloat(document.getElementById('music-vol').value);
    playCurrentCandidate();
  }
};

window.nextMusicTrack = function() {
  currentSongIndex = (currentSongIndex + 1) % sunoCandidateFiles.length;
  if (!isMusicPlaying) window.toggleMusic();
  else playCurrentCandidate();
  speakCharacter('train', '🚂 Little Train ' + window.getTrainName(), '#0d9488', 'Yay! Let us listen to the next happy train song!');
};

window.changeMusicVolume = function(val) {
  bgMusicAudio.volume = parseFloat(val);
};

// --- MULTI-ROLE VOICE ENGINE (Mom Narrator, Child Train, Best Friends) ---
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

var faceCardTimer = null;
var cloudFallbackAudio = null;

// role: 'mom' (warm gentle female) | 'train' (cheerful child) | 'friend' (playful character)
window.speakCharacter = function(role, speakerName, avatarColorHex, text) {
  var card = document.getElementById('face-cam-card');
  var avatar = document.getElementById('face-avatar');
  var tag = document.getElementById('speaker-tag');
  var txtEl = document.getElementById('speech-text');

  var tName = window.getTrainName();
  var resolvedSpeaker = String(speakerName || '')
    .replace(/Little Train Toby/g, 'Little Train ' + tName)
    .replace(/\bToby\b/g, tName);
  var resolvedText = window.formatPersonalizedText(role, text);
  var resolvedColor = (role === 'train' && (!avatarColorHex || avatarColorHex === '#ef4444')) ? '#0d9488' : (avatarColorHex || '#0d9488');

  if (card) {
    avatar.style.background = resolvedColor;
    tag.textContent = resolvedSpeaker;
    txtEl.textContent = resolvedText;
    card.classList.add('visible', 'talking');
    clearTimeout(faceCardTimer);
    faceCardTimer = setTimeout(function() {
      card.classList.remove('talking');
      setTimeout(function() { card.classList.remove('visible'); }, 900);
    }, 4500);
  }

  // Trigger Face-Cam zoom on the locomotive in game.js if available
  if (window.triggerFaceCamHighlight) window.triggerFaceCamHighlight(110);

  if (!verifiedEnVoices.length) loadEnglishVoices();

  if (verifiedEnVoices.length > 0 && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      var u = new SpeechSynthesisUtterance(resolvedText);

      // Pick warm female voice for Mom, higher voice for Child Train
      var femalePrefs = ['Samantha', 'Victoria', 'Karen', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Moira'];
      var chosen = verifiedEnVoices[0];
      for (var i = 0; i < femalePrefs.length; i++) {
        var found = verifiedEnVoices.find(function(v) { return v.name.indexOf(femalePrefs[i]) !== -1; });
        if (found) { chosen = found; break; }
      }
      u.voice = chosen;
      u.lang = 'en-US';

      if (role === 'mom') {
        u.pitch = 1.06; // Warm, soothing motherly narrator
        u.rate = 0.91;
      } else if (role === 'train') {
        u.pitch = 1.48; // Excited little child voice for the train!
        u.rate = 1.04;
      } else {
        u.pitch = 1.28; // Playful best friend voice
        u.rate = 0.98;
      }
      window.speechSynthesis.speak(u);
      return;
    } catch (e) {}
  }

  // Cloud English fallback if system has no English voices installed
  try {
    if (cloudFallbackAudio) cloudFallbackAudio.pause();
    var url = 'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en-US&q=' + encodeURIComponent(resolvedText);
    cloudFallbackAudio = new Audio(url);
    cloudFallbackAudio.playbackRate = role === 'train' ? 1.14 : 0.96;
    cloudFallbackAudio.play().catch(function(){});
  } catch (e) {}
};

// Backwards-compatible wrapper
window.speakPureEnglish = function(emoji, text) {
  window.speakCharacter('mom', emoji + ' Mom Narrator', '#ec4899', text);
};

// --- WEB AUDIO SYNTHESIZER (Horns, Laughs, Helicopter, Cow Moo, Sheep Baa, Magic Chime) ---
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

window.playTrainHorn = function() { playTone([349.23, 440.0, 523.25], 0.65, 'triangle'); };
window.playCollectSound = function() { playTone([587.33, 880.0, 1174.66], 0.26, 'sine'); };
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
  // Metallic bell partials (high C6 + E6 + overtone)
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

