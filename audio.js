// ============================================================================
// MODULE 1: AUDIO.JS (Google AI Studio Multi-Voice Engine, 5s–10s Turn-Taking
// Cadence, Strict Camera-Frustum Visibility Filter, Mom/Dad & Grandma/Grandpa
// Alternating House Greetings, Smartphone Compact HUD & Circular Remote D-Pad)
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

  // Ensure settings modal labels are clean English-only and unused voice addressing toggle row is hidden
  var modalEl = document.getElementById('settings-modal');
  if (modalEl) {
    var descP = modalEl.querySelector('.modal-card > p');
    if (descP) descP.textContent = "Customize your child's name and the 3D nameplate on the locomotive.";
    var cLabel = modalEl.querySelector('label[for="input-child-name"]');
    if (cLabel) cLabel.textContent = "👶 Child's Name:";
    var tLabel = modalEl.querySelector('label[for="input-train-name"]');
    if (tLabel) tLabel.textContent = "🚂 Train's Name on 3D Plaque:";
    var toggleRow = modalEl.querySelector('.settings-toggle-row');
    if (toggleRow) toggleRow.style.display = 'none';
  }

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
    .replace(/Little Train Toby/g, 'Train ' + tName)
    .replace(/Little Train Daníček/g, 'Train ' + tName)
    .replace(/\bToby\b/g, tName);

  if (!window.isVoiceAddressingEnabled()) {
    return text;
  }

  var cName = window.getChildName();
  if (!cName || text.indexOf(cName) !== -1) {
    return text;
  }

  if (text.indexOf('Hello, little explorer!') === 0) {
    return 'Hello, ' + cName + '! Ready for a train ride?';
  }
  if (text.indexOf('Good morning!') === 0) {
    return 'Good morning, ' + cName + '! ' + text.slice(14);
  }
  if (text.indexOf('Good evening!') === 0) {
    return 'Good evening, ' + cName + '! ' + text.slice(14);
  }
  if (text.indexOf('Now you are arriving') === 0 || text.indexOf('Now heading') === 0) {
    return cName + ', ' + text.charAt(0).toLowerCase() + text.slice(1);
  }
  return text;
};

// ============================================================================
// MOBILE & TOUCH UI ENHANCER:
// 1. Completely hides speech text boxes (#face-cam-card) & 3D animal text bubbles
// 2. Compacts #top-bar on smartphones to 1 slim row (Player Name, Clock, Score, Music ON/OFF)
// 3. Replaces bottom buttons with a Translucent Circular Remote D-Pad Wheel (UP/DOWN/LEFT/RIGHT + OK)
// 4. Adds Top-Left Current Speed Number & Top-Right Next-Junction Switch Direction Arrow
// ============================================================================
(function installCleanUiAndCircularRemoteWheel() {
  var lastRenderedSpeedStage = null;
  var lastRenderedSwitchChoice = null;

  var SWITCH_ARROW_SVGS = {
    left: '<svg viewBox="0 0 48 48"><path d="M36 39V26c0-6.6-5.4-12-12-12h-7V6L4 17.5 17 29v-8h7c2.8 0 5 2.2 5 5v13h7z" fill="#facc15" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    straight: '<svg viewBox="0 0 48 48"><path d="M24 5L9 21h9.5v22h11V21H39L24 5z" fill="#4ade80" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 48 48"><path d="M12 39V26c0-6.6 5.4-12 12-12h7V6l13 11.5L31 29v-8h-7c-2.8 0-5 2.2-5 5v13h-7z" fill="#fb923c" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/></svg>'
  };

  var SPEED_THEME = {
    '-1': { text: 'R', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.88)', glow: 'rgba(56, 189, 248, 0.48)' },
    '0':  { text: '0', color: '#e2e8f0', border: 'rgba(148, 163, 184, 0.82)', glow: 'rgba(148, 163, 184, 0.35)' },
    '1':  { text: '1', color: '#86efac', border: 'rgba(134, 239, 172, 0.88)', glow: 'rgba(134, 239, 172, 0.45)' },
    '2':  { text: '2', color: '#4ade80', border: 'rgba(74, 222, 128, 0.90)', glow: 'rgba(74, 222, 128, 0.50)' },
    '3':  { text: '3', color: '#facc15', border: 'rgba(250, 204, 21, 0.92)', glow: 'rgba(250, 204, 21, 0.52)' },
    '4':  { text: '4', color: '#fb923c', border: 'rgba(251, 146, 60, 0.92)', glow: 'rgba(251, 146, 60, 0.54)' },
    '5':  { text: '5', color: '#f87171', border: 'rgba(248, 113, 113, 0.95)', glow: 'rgba(239, 68, 68, 0.58)' }
  };

  var SWITCH_THEME = {
    left:     { border: 'rgba(250, 204, 21, 0.90)', glow: 'rgba(250, 204, 21, 0.48)' },
    straight: { border: 'rgba(74, 222, 128, 0.90)', glow: 'rgba(74, 222, 128, 0.48)' },
    right:    { border: 'rgba(251, 146, 60, 0.90)', glow: 'rgba(251, 146, 60, 0.48)' }
  };

  window.syncCornerSpeedAndSwitchHud = function(force) {
    if (!window.pState) return;
    var speedStage = typeof window.pState.speedStage === 'number' ? window.pState.speedStage : 0;
    var switchChoice = window.pState.switchChoice || 'straight';

    var speedEl = document.getElementById('hud-speed-corner');
    var speedNumEl = document.getElementById('hud-speed-corner-num');
    if (speedEl && speedNumEl && (force || speedStage !== lastRenderedSpeedStage)) {
      lastRenderedSpeedStage = speedStage;
      var sTheme = SPEED_THEME[String(speedStage)] || SPEED_THEME['0'];
      speedNumEl.textContent = sTheme.text;
      speedNumEl.style.color = sTheme.color;
      speedEl.style.borderColor = sTheme.border;
      speedEl.style.boxShadow = '0 0 16px ' + sTheme.glow + ', inset 0 0 12px ' + sTheme.glow + ', 0 6px 18px rgba(0,0,0,0.42)';
    }

    var switchEl = document.getElementById('hud-switch-corner');
    var switchIconEl = document.getElementById('hud-switch-corner-icon');
    if (switchEl && switchIconEl && (force || switchChoice !== lastRenderedSwitchChoice)) {
      lastRenderedSwitchChoice = switchChoice;
      var wTheme = SWITCH_THEME[switchChoice] || SWITCH_THEME.straight;
      switchIconEl.innerHTML = SWITCH_ARROW_SVGS[switchChoice] || SWITCH_ARROW_SVGS.straight;
      switchEl.style.borderColor = wTheme.border;
      switchEl.style.boxShadow = '0 0 16px ' + wTheme.glow + ', inset 0 0 12px ' + wTheme.glow + ', 0 6px 18px rgba(0,0,0,0.42)';
    }
  };

  function injectStylesAndRemoteWheel() {
    if (!document.getElementById('happy-train-mobile-remote-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'happy-train-mobile-remote-styles';
      styleEl.textContent = [
        '/* 1. Never show top speech text box */',
        '#face-cam-card, #face-cam-card.visible, #face-cam-card.talking {',
        '  display: none !important;',
        '  opacity: 0 !important;',
        '  visibility: hidden !important;',
        '  pointer-events: none !important;',
        '}',
        '',
        '/* 2. Hide legacy wide bottom button bar, legacy second-row speed bar, and legacy giant direction card */',
        '#hud, #giant-direction-card, #top-bar > .hud-box:last-child {',
        '  display: none !important;',
        '}',
        '',
        '/* 3. Top-Left Speed Badge & Top-Right Next-Junction Switch Arrow Badge (Translucent, high-contrast) */',
        '#hud-speed-corner, #hud-switch-corner {',
        '  position: fixed;',
        '  top: 66px;',
        '  width: 64px;',
        '  height: 64px;',
        '  border-radius: 18px;',
        '  background: radial-gradient(circle, rgba(30, 41, 59, 0.46) 0%, rgba(15, 23, 42, 0.66) 100%);',
        '  border: 2.5px solid rgba(125, 211, 252, 0.85);',
        '  backdrop-filter: blur(4px);',
        '  -webkit-backdrop-filter: blur(4px);',
        '  display: flex;',
        '  flex-direction: column;',
        '  align-items: center;',
        '  justify-content: center;',
        '  z-index: 22;',
        '  user-select: none;',
        '  -webkit-user-select: none;',
        '  transition: transform 0.14s ease, border-color 0.18s ease, box-shadow 0.18s ease;',
        '}',
        '#hud-speed-corner {',
        '  left: 14px;',
        '}',
        '#hud-switch-corner {',
        '  right: 14px;',
        '}',
        '#hud-speed-corner-num {',
        '  font-size: 34px;',
        '  font-weight: 900;',
        '  line-height: 1;',
        '  color: #4ade80;',
        '  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);',
        '}',
        '#hud-switch-corner-icon {',
        '  width: 42px;',
        '  height: 42px;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '}',
        '#hud-switch-corner-icon svg {',
        '  width: 100%;',
        '  height: 100%;',
        '  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.72));',
        '}',
        '',
        '#remote-wheel-hud {',
        '  position: fixed;',
        '  bottom: 14px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  width: 158px;',
        '  height: 158px;',
        '  border-radius: 50%;',
        '  background: radial-gradient(circle, rgba(30, 41, 59, 0.34) 0%, rgba(15, 23, 42, 0.56) 72%, rgba(56, 189, 248, 0.28) 100%);',
        '  border: 2.5px solid rgba(125, 211, 252, 0.85);',
        '  box-shadow: 0 0 18px rgba(56, 189, 248, 0.50), inset 0 0 18px rgba(56, 189, 248, 0.28), 0 8px 22px rgba(0, 0, 0, 0.45);',
        '  backdrop-filter: blur(4px);',
        '  -webkit-backdrop-filter: blur(4px);',
        '  z-index: 25;',
        '  user-select: none;',
        '  -webkit-user-select: none;',
        '  touch-action: manipulation;',
        '}',
        '',
        '/* Diagonal divider lines matching remote wheel reference */',
        '#remote-wheel-hud .wheel-diag {',
        '  position: absolute;',
        '  top: 50%;',
        '  left: 8%;',
        '  width: 84%;',
        '  height: 1.5px;',
        '  background: linear-gradient(90deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 30%, transparent 32%, transparent 68%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0.32) 100%);',
        '  pointer-events: none;',
        '}',
        '#remote-wheel-hud .wheel-diag.d1 { transform: translateY(-50%) rotate(45deg); }',
        '#remote-wheel-hud .wheel-diag.d2 { transform: translateY(-50%) rotate(-45deg); }',
        '',
        '/* Directional D-pad buttons */',
        '#remote-wheel-hud .wheel-dir-btn {',
        '  position: absolute;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  background: transparent;',
        '  border: none;',
        '  color: #f8fafc;',
        '  cursor: pointer;',
        '  padding: 0;',
        '  outline: none;',
        '  -webkit-tap-highlight-color: transparent;',
        '  transition: transform 0.1s ease, filter 0.1s ease;',
        '}',
        '#remote-wheel-hud .wheel-dir-btn svg {',
        '  width: 28px;',
        '  height: 28px;',
        '  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.65));',
        '  pointer-events: none;',
        '}',
        '#remote-wheel-hud .wheel-dir-btn:active,',
        '#remote-wheel-hud .wheel-dir-btn.active-press {',
        '  filter: brightness(1.35) drop-shadow(0 0 8px rgba(56, 189, 248, 0.95));',
        '}',
        '',
        '#remote-wheel-hud .wheel-up {',
        '  top: 2px; left: 50%; transform: translateX(-50%);',
        '  width: 68px; height: 46px; border-radius: 28px 28px 10px 10px;',
        '}',
        '#remote-wheel-hud .wheel-up:active, #remote-wheel-hud .wheel-up.active-press {',
        '  transform: translateX(-50%) scale(1.12);',
        '}',
        '',
        '#remote-wheel-hud .wheel-down {',
        '  bottom: 2px; left: 50%; transform: translateX(-50%);',
        '  width: 68px; height: 46px; border-radius: 10px 10px 28px 28px;',
        '}',
        '#remote-wheel-hud .wheel-down:active, #remote-wheel-hud .wheel-down.active-press {',
        '  transform: translateX(-50%) scale(1.12);',
        '}',
        '',
        '#remote-wheel-hud .wheel-left {',
        '  left: 2px; top: 50%; transform: translateY(-50%);',
        '  width: 46px; height: 68px; border-radius: 28px 10px 10px 28px;',
        '}',
        '#remote-wheel-hud .wheel-left:active, #remote-wheel-hud .wheel-left.active-press {',
        '  transform: translateY(-50%) scale(1.12);',
        '}',
        '',
        '#remote-wheel-hud .wheel-right {',
        '  right: 2px; top: 50%; transform: translateY(-50%);',
        '  width: 46px; height: 68px; border-radius: 10px 28px 28px 10px;',
        '}',
        '#remote-wheel-hud .wheel-right:active, #remote-wheel-hud .wheel-right.active-press {',
        '  transform: translateY(-50%) scale(1.12);',
        '}',
        '',
        '/* Center OK / Enter button */',
        '#remote-wheel-hud .wheel-ok-btn {',
        '  position: absolute;',
        '  top: 50%; left: 50%;',
        '  transform: translate(-50%, -50%);',
        '  width: 62px; height: 62px;',
        '  border-radius: 50%;',
        '  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(15, 23, 42, 0.62) 100%);',
        '  border: 2px solid rgba(255, 255, 255, 0.48);',
        '  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.25), 0 3px 10px rgba(0, 0, 0, 0.45);',
        '  color: #ffffff;',
        '  font-size: 19px;',
        '  font-weight: 900;',
        '  letter-spacing: 0.5px;',
        '  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.65);',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  cursor: pointer;',
        '  outline: none;',
        '  -webkit-tap-highlight-color: transparent;',
        '  transition: transform 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;',
        '}',
        '#remote-wheel-hud .wheel-ok-btn:active,',
        '#remote-wheel-hud .wheel-ok-btn.active-press {',
        '  transform: translate(-50%, -50%) scale(1.09);',
        '  background: radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(15, 23, 42, 0.75) 100%);',
        '  border-color: #7dd3fc;',
        '  box-shadow: 0 0 14px rgba(56, 189, 248, 0.85);',
        '}',
        '',
        '/* 4. Smartphone compact single-row top menu (shows only Player Name, Clock, Score, Music ON/OFF) */',
        '@media (max-width: 920px), (pointer: coarse) and (max-width: 1024px) {',
        '  #top-bar {',
        '    top: 6px !important;',
        '    width: 96vw !important;',
        '    padding: 4px 8px !important;',
        '    border-radius: 14px !important;',
        '    border-width: 2px !important;',
        '    flex-wrap: nowrap !important;',
        '    justify-content: space-between !important;',
        '    gap: 4px !important;',
        '  }',
        '  /* Hide place badge pin & text, weather button, extra music controls, speed bar & giant direction card on mobile */',
        '  #top-bar > .hud-box:first-child > span:first-child,',
        '  #place-label,',
        '  #weather-btn,',
        '  .music-panel button:not(#music-toggle-btn),',
        '  .music-panel span,',
        '  .wagon-bar-wrap,',
        '  #top-bar > .hud-box:last-child,',
        '  #giant-direction-card {',
        '    display: none !important;',
        '  }',
        '  .train-settings-btn {',
        '    padding: 4px 8px !important;',
        '    font-size: 12px !important;',
        '    border-radius: 10px !important;',
        '    gap: 3px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '  .clock-panel {',
        '    padding: 2px 7px !important;',
        '    gap: 5px !important;',
        '    border-radius: 10px !important;',
        '    flex-shrink: 0 !important;',
        '  }',
        '  #analog-clock {',
        '    width: 26px !important;',
        '    height: 26px !important;',
        '    border-width: 2px !important;',
        '  }',
        '  #time-phase-label {',
        '    font-size: 11px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '  .music-panel {',
        '    padding: 2px 6px !important;',
        '    background: rgba(15, 23, 42, 0.72) !important;',
        '    border: 1.5px solid #475569 !important;',
        '    border-radius: 10px !important;',
        '    display: flex !important;',
        '    align-items: center !important;',
        '    gap: 5px !important;',
        '    flex-shrink: 0 !important;',
        '  }',
        '  #music-toggle-btn {',
        '    padding: 4px 7px !important;',
        '    font-size: 11px !important;',
        '    border-radius: 8px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '  #music-vol {',
        '    display: inline-block !important;',
        '    width: 58px !important;',
        '    height: 18px !important;',
        '    margin: 0 !important;',
        '    accent-color: #22c55e !important;',
        '    cursor: pointer !important;',
        '    touch-action: pan-x !important;',
        '  }',
        '  .score-pill {',
        '    padding: 4px 8px !important;',
        '    font-size: 12px !important;',
        '    border-radius: 10px !important;',
        '    gap: 5px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '  #hud-speed-corner, #hud-switch-corner {',
        '    top: 50px;',
        '    width: 56px;',
        '    height: 56px;',
        '    border-radius: 15px;',
        '  }',
        '  #hud-speed-corner { left: 10px; }',
        '  #hud-switch-corner { right: 10px; }',
        '  #hud-speed-corner-num {',
        '    font-size: 30px;',
        '  }',
        '  #hud-switch-corner-icon {',
        '    width: 36px;',
        '    height: 36px;',
        '  }',
        '  #remote-wheel-hud {',
        '    width: 146px;',
        '    height: 146px;',
        '    bottom: 10px;',
        '  }',
        '  #remote-wheel-hud .wheel-ok-btn {',
        '    width: 56px;',
        '    height: 56px;',
        '    font-size: 17px;',
        '  }',
        '}',
        '',
        '@media (max-width: 420px) {',
        '  #time-phase-label {',
        '    display: none !important;',
        '  }',
        '  #music-vol {',
        '    width: 46px !important;',
        '  }',
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(styleEl);
    }

    var faceCard = document.getElementById('face-cam-card');
    if (faceCard) {
      faceCard.classList.remove('visible', 'talking');
      faceCard.style.display = 'none';
    }

    if (!document.getElementById('hud-speed-corner') && document.body) {
      var speedBadge = document.createElement('div');
      speedBadge.id = 'hud-speed-corner';
      speedBadge.setAttribute('aria-label', 'Current Train Speed');
      speedBadge.innerHTML = '<span id="hud-speed-corner-num">0</span>';
      document.body.appendChild(speedBadge);
    }

    if (!document.getElementById('hud-switch-corner') && document.body) {
      var switchBadge = document.createElement('div');
      switchBadge.id = 'hud-switch-corner';
      switchBadge.setAttribute('aria-label', 'Next Junction Switch Direction');
      switchBadge.innerHTML = '<div id="hud-switch-corner-icon">' + SWITCH_ARROW_SVGS.straight + '</div>';
      document.body.appendChild(switchBadge);
    }

    window.syncCornerSpeedAndSwitchHud(true);

    if (!document.getElementById('remote-wheel-hud') && document.body) {
      var wheel = document.createElement('div');
      wheel.id = 'remote-wheel-hud';
      wheel.setAttribute('aria-label', 'Train Remote Controller');
      wheel.innerHTML = [
        '<div class="wheel-diag d1"></div>',
        '<div class="wheel-diag d2"></div>',
        '<button type="button" class="wheel-dir-btn wheel-up" data-key="ArrowUp" aria-label="Faster (Up)">',
        '  <svg viewBox="0 0 32 32"><path d="M16 6 L27 22 Q28 24 25.5 24 L6.5 24 Q4 24 5 22 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/></svg>',
        '</button>',
        '<button type="button" class="wheel-dir-btn wheel-down" data-key="ArrowDown" aria-label="Slower / Reverse (Down)">',
        '  <svg viewBox="0 0 32 32"><path d="M16 26 L27 10 Q28 8 25.5 8 L6.5 8 Q4 8 5 10 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/></svg>',
        '</button>',
        '<button type="button" class="wheel-dir-btn wheel-left" data-key="ArrowLeft" aria-label="Turn Left">',
        '  <svg viewBox="0 0 32 32"><path d="M6 16 L22 5 Q24 4 24 6.5 L24 25.5 Q24 28 22 27 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/></svg>',
        '</button>',
        '<button type="button" class="wheel-dir-btn wheel-right" data-key="ArrowRight" aria-label="Turn Right">',
        '  <svg viewBox="0 0 32 32"><path d="M26 16 L10 5 Q8 4 8 6.5 L8 25.5 Q8 28 10 27 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/></svg>',
        '</button>',
        '<button type="button" class="wheel-ok-btn" data-key="Enter" aria-label="OK / Effects">OK</button>'
      ].join('');
      document.body.appendChild(wheel);

      var lastTouchInvokeMs = 0;
      function triggerWheelKey(btnEl, keyName) {
        if (!keyName) return;
        btnEl.classList.add('active-press');
        setTimeout(function() {
          btnEl.classList.remove('active-press');
        }, 160);
        if (typeof window.handleInput === 'function') {
          window.handleInput(keyName);
        }
        if (typeof window.syncCornerSpeedAndSwitchHud === 'function') {
          window.syncCornerSpeedAndSwitchHud(false);
        }
      }

      var buttons = wheel.querySelectorAll('button[data-key]');
      for (var bi = 0; bi < buttons.length; bi++) {
        (function(btn) {
          var keyName = btn.getAttribute('data-key');
          btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            lastTouchInvokeMs = Date.now();
            triggerWheelKey(btn, keyName);
          }, { passive: false });

          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastTouchInvokeMs < 420) return;
            triggerWheelKey(btn, keyName);
          });
        })(buttons[bi]);
      }

      window.addEventListener('keydown', function(e) {
        var k = e.key === ' ' ? 'Enter' : e.key;
        var matchBtn = wheel.querySelector('button[data-key="' + k + '"]');
        if (matchBtn) {
          matchBtn.classList.add('active-press');
          setTimeout(function() {
            matchBtn.classList.remove('active-press');
          }, 160);
        }
        setTimeout(function() {
          if (typeof window.syncCornerSpeedAndSwitchHud === 'function') {
            window.syncCornerSpeedAndSwitchHud(false);
          }
        }, 0);
      });
    }
  }

  if (document.body) {
    injectStylesAndRemoteWheel();
  } else {
    window.addEventListener('DOMContentLoaded', injectStylesAndRemoteWheel);
  }
})();

// ============================================================================
// OFFICIAL PRAGUE METRO SYMBOL (ZNAK PRAŽSKÉHO METRA) — ONLY FOR METRO
// SIGNPOST DIRECTIONS & THE 4 METRO TUNNEL ENTRANCES!
// ============================================================================
window.drawPragueMetroSymbol = function(ctx, cx, cy, r, primaryColor) {
  ctx.save();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.fill();

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

  var targetW = r * 1.56;
  var scale = targetW / 320.2;
  var ox = cx - 160.1 * scale;
  var oy = cy - 80.4 * scale + r * 0.14;

  var polygons = [
    [[96.94, 97.69], [222.5, 98.17], [159.5, 160.8]],
    [
      [159.9, 36.94], [194.4, 0.75], [222.8, 0.85], [222.5, 90.71],
      [197.0, 90.61], [197.2, 35.0], [159.8, 72.84], [122.6, 34.72],
      [122.4, 90.33], [96.98, 90.23], [97.33, 0.38], [125.7, 0.49]
    ],
    [[0, 0], [89.86, 0.35], [89.71, 38.96], [38.46, 38.76]],
    [[45.89, 46.24], [89.69, 46.41], [89.5, 90.21]],
    [[320.2, 1.23], [230.3, 0.89], [230.1, 39.5], [281.5, 39.7]],
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

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(3, r * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

window.createPragueMetroEntranceCanvas = function(accentColor) {
  var c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  var ctx = c.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(256, 256, 236, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = accentColor || '#d9261c';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(256, 256, 214, 0, Math.PI * 2);
  ctx.stroke();

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
// DISNEY-STORYBOOK LANDMARK PICTOGRAM PAINTER & STATION SIGN GENERATOR
// ============================================================================
window.drawLandmarkPictogram = function(ctx, iconType, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#e0f2fe';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = Math.max(5, r * 0.10);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.clip();

  if (iconType === 'metro') {
    window.drawPragueMetroSymbol(ctx, cx, cy, r, '#d9261c');
  } else if (iconType === 'eiffel') {
    var eGrad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    eGrad.addColorStop(0, '#38bdf8');
    eGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = eGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - r, cy + r * 0.52, r * 2, r * 0.5);

    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.52, cy + r * 0.65);
    ctx.quadraticCurveTo(cx - r * 0.16, cy + r * 0.10, cx - r * 0.07, cy - r * 0.78);
    ctx.lineTo(cx + r * 0.07, cy - r * 0.78);
    ctx.quadraticCurveTo(cx + r * 0.16, cy + r * 0.10, cx + r * 0.52, cy + r * 0.65);
    ctx.lineTo(cx + r * 0.28, cy + r * 0.65);
    ctx.arc(cx, cy + r * 0.65, r * 0.28, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - r * 0.36, cy + r * 0.15, r * 0.72, r * 0.11);
    ctx.fillRect(cx - r * 0.22, cy - r * 0.22, r * 0.44, r * 0.10);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.80, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconType === 'bigben') {
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.fillRect(cx - r * 0.36, cy - r * 0.32, r * 0.72, r * 1.25);
    ctx.strokeRect(cx - r * 0.36, cy - r * 0.32, r * 0.72, r * 1.25);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.40, cy - r * 0.32);
    ctx.lineTo(cx, cy - r * 0.88);
    ctx.lineTo(cx + r * 0.40, cy - r * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.04, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.04);
    ctx.lineTo(cx, cy - r * 0.12);
    ctx.moveTo(cx, cy + r * 0.04);
    ctx.lineTo(cx + r * 0.14, cy + r * 0.04);
    ctx.stroke();
  } else if (iconType === 'colosseum') {
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - r, cy + r * 0.50, r * 2, r * 0.55);

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.78, cy + r * 0.58);
    ctx.lineTo(cx - r * 0.78, cy - r * 0.38);
    ctx.lineTo(cx + r * 0.22, cy - r * 0.38);
    ctx.lineTo(cx + r * 0.32, cy - r * 0.10);
    ctx.lineTo(cx + r * 0.78, cy - r * 0.10);
    ctx.lineTo(cx + r * 0.78, cy + r * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#451a03';
    [-0.52, -0.18, 0.16, 0.50].forEach(function(ax) {
      ctx.beginPath();
      ctx.arc(cx + r * ax, cy + r * 0.42, r * 0.10, Math.PI, 0, false);
      ctx.lineTo(cx + r * (ax + 0.10), cy + r * 0.55);
      ctx.lineTo(cx + r * (ax - 0.10), cy + r * 0.55);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + r * ax, cy + r * 0.12, r * 0.10, Math.PI, 0, false);
      ctx.lineTo(cx + r * (ax + 0.10), cy + r * 0.25);
      ctx.lineTo(cx + r * (ax - 0.10), cy + r * 0.25);
      ctx.fill();
    });
  } else if (iconType === 'airport') {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - r, cy + r * 0.52, r * 2, r * 0.50);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - r * 0.65, cy - r * 0.20, r * 0.24, r * 0.75);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - r * 0.74, cy - r * 0.44, r * 0.42, r * 0.26);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - r * 0.70, cy - r * 0.52, r * 0.34, r * 0.08);

    ctx.save();
    ctx.translate(cx + r * 0.18, cy - r * 0.08);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.48, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-r * 0.08, 0);
    ctx.lineTo(-r * 0.25, -r * 0.44);
    ctx.lineTo(r * 0.12, 0);
    ctx.lineTo(-r * 0.25, r * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (iconType === 'jewel') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.35, r * 0.82, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(cx - r * 0.48, cy + r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.48, cy + r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    var wfGrad = ctx.createLinearGradient(cx, cy - r * 0.45, cx, cy + r * 0.65);
    wfGrad.addColorStop(0, '#ffffff');
    wfGrad.addColorStop(0.5, '#67e8f9');
    wfGrad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = wfGrad;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.28, cy - r * 0.42);
    ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.05, cx - r * 0.26, cy + r * 0.62);
    ctx.lineTo(cx + r * 0.26, cy + r * 0.62);
    ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.05, cx + r * 0.28, cy - r * 0.42);
    ctx.closePath();
    ctx.fill();
  } else if (iconType === 'skyscraper') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 4;
    ctx.fillRect(cx - r * 0.40, cy - r * 0.15, r * 0.80, r * 1.05);
    ctx.strokeRect(cx - r * 0.40, cy - r * 0.15, r * 0.80, r * 1.05);
    ctx.fillRect(cx - r * 0.28, cy - r * 0.52, r * 0.56, r * 0.38);
    ctx.strokeRect(cx - r * 0.28, cy - r * 0.52, r * 0.56, r * 0.38);

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.08, cy - r * 0.52);
    ctx.lineTo(cx, cy - r * 0.90);
    ctx.lineTo(cx + r * 0.08, cy - r * 0.52);
    ctx.closePath();
    ctx.fill();

    for (var wy = -0.02; wy <= 0.52; wy += 0.24) {
      ctx.fillRect(cx - r * 0.26, cy + r * wy, r * 0.18, r * 0.12);
      ctx.fillRect(cx + r * 0.08, cy + r * wy, r * 0.18, r * 0.12);
    }
  } else if (iconType === 'mom_house' || iconType === 'grandma_house') {
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(cx - r, cy + r * 0.42, r * 2, r * 0.60);

    ctx.fillStyle = iconType === 'mom_house' ? '#fef08a' : '#fed7aa';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.fillRect(cx - r * 0.54, cy - r * 0.08, r * 1.08, r * 0.64);
    ctx.strokeRect(cx - r * 0.54, cy - r * 0.08, r * 1.08, r * 0.64);

    ctx.fillStyle = iconType === 'mom_house' ? '#ef4444' : '#9a3412';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.68, cy - r * 0.06);
    ctx.lineTo(cx, cy - r * 0.68);
    ctx.lineTo(cx + r * 0.68, cy - r * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - r * 0.14, cy + r * 0.16, r * 0.28, r * 0.40);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - r * 0.42, cy + r * 0.06, r * 0.20, r * 0.20);
    ctx.fillRect(cx + r * 0.22, cy + r * 0.06, r * 0.20, r * 0.20);
  } else if (iconType === 'fountain' || iconType === 'city') {
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.42, r * 0.68, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - r * 0.12, cy - r * 0.20, r * 0.24, r * 0.62);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.20);
    ctx.quadraticCurveTo(cx - r * 0.45, cy - r * 0.65, cx - r * 0.55, cy + r * 0.30);
    ctx.moveTo(cx, cy - r * 0.20);
    ctx.quadraticCurveTo(cx + r * 0.45, cy - r * 0.65, cx + r * 0.55, cy + r * 0.30);
    ctx.stroke();
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
  } else {
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(cx - r * 0.62, cy - r * 0.20, r * 1.24, r * 0.62);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - r * 0.62, cy - r * 0.52, r * 0.52, r * 0.35);
  }
  ctx.restore();
};

window.makeStationSign = function(titleText, iconType, bgHex, w, h) {
  var c = document.createElement('canvas');
  c.width = 640;
  c.height = 180;
  var ctx = c.getContext('2d');

  ctx.fillStyle = bgHex || '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 12;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(10, 10, 620, 160, 42);
  else ctx.rect(10, 10, 620, 160);
  ctx.fill();
  ctx.stroke();

  window.drawLandmarkPictogram(ctx, iconType || 'city', 102, 90, 68);

  var cleanLabel = String(titleText || '')
    .replace(/^[^\wA-Za-z]+/, '')
    .trim()
    .toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px "Segoe UI", system-ui, sans-serif';
  var maxW = 410;
  if (ctx.measureText(cleanLabel).width > maxW) {
    ctx.font = '900 33px "Segoe UI", system-ui, sans-serif';
  }
  if (ctx.measureText(cleanLabel).width > maxW) {
    ctx.font = '900 27px "Segoe UI", system-ui, sans-serif';
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 6;
  ctx.fillText(cleanLabel, 392, 92);

  var tex = window.upgradeCanvasTex ? window.upgradeCanvasTex(c) : new window.THREE.CanvasTexture(c);
  tex.generateMipmaps = false;
  tex.minFilter = window.THREE.LinearFilter;
  tex.magFilter = window.THREE.LinearFilter;
  var sp = new window.THREE.Sprite(
    new window.THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
  );
  sp.scale.set((w || 22) * 0.68, (h || 6.2) * 0.68, 1);
  if (window.allSurfaceSigns) {
    window.allSurfaceSigns.push(sp);
  }
  return sp;
};

// ============================================================================
// BACKGROUND MUSIC PLAYER (song1.mp3, song2.mp3, song3.mp3, song4.mp3)
// ============================================================================
var sunoTrackGroups = [
  ['song1.mp3'],
  ['song2.mp3'],
  ['song3.mp3'],
  ['song4.mp3']
];
var currentSongIndex = 0;
var isMusicPlaying = true;
var userMusicVolume = 0.45;
var bgMusicAudio = new Audio();
bgMusicAudio.preload = 'metadata';
bgMusicAudio.volume = userMusicVolume;

function syncMusicButtonUI() {
  var btn = document.getElementById('music-toggle-btn');
  if (!btn) return;
  if (isMusicPlaying) {
    btn.textContent = '🎵 Music: ON';
    btn.classList.add('playing');
  } else {
    btn.textContent = '🎵 Music: OFF';
    btn.classList.remove('playing');
  }
}

function playCurrentCandidate(fallbackUrlIdx, failedTrackCount) {
  if (!isMusicPlaying) return;
  var groupIdx = currentSongIndex % sunoTrackGroups.length;
  var candidates = sunoTrackGroups[groupIdx];
  var uIdx = fallbackUrlIdx || 0;
  var failCount = failedTrackCount || 0;

  if (uIdx >= candidates.length) {
    if (failCount + 1 >= sunoTrackGroups.length) return;
    currentSongIndex = (currentSongIndex + 1) % sunoTrackGroups.length;
    playCurrentCandidate(0, failCount + 1);
    return;
  }

  var targetSrc = candidates[uIdx];
  if (!bgMusicAudio.src || bgMusicAudio.src.indexOf(targetSrc) === -1) {
    // Explicitly flush previous track's decoded PCM buffer on Smart TVs before loading next track
    try {
      bgMusicAudio.pause();
      bgMusicAudio.removeAttribute('src');
      bgMusicAudio.load();
    } catch (e) {}
    bgMusicAudio.src = targetSrc;
  }
  var playPromise = bgMusicAudio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function(err) {
      // If browser autoplay policy defers unmuted audio until first gesture, keep current candidate armed
      if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
        return;
      }
      playCurrentCandidate(uIdx + 1, failCount);
    });
  }
}

bgMusicAudio.addEventListener('ended', function() {
  currentSongIndex = (currentSongIndex + 1) % sunoTrackGroups.length;
  playCurrentCandidate(0, 0);
});

window.toggleMusic = function() {
  window.initAudio();
  if (isMusicPlaying) {
    isMusicPlaying = false;
    bgMusicAudio.pause();
    syncMusicButtonUI();
  } else {
    isMusicPlaying = true;
    syncMusicButtonUI();
    var volEl = document.getElementById('music-vol');
    if (volEl) userMusicVolume = parseFloat(volEl.value);
    bgMusicAudio.volume = window.isVoiceCurrentlyPlaying && window.isVoiceCurrentlyPlaying()
      ? Math.max(0.08, userMusicVolume * 0.35)
      : userMusicVolume;
    playCurrentCandidate(0, 0);
  }
};

window.nextMusicTrack = function() {
  window.initAudio();
  currentSongIndex = (currentSongIndex + 1) % sunoTrackGroups.length;
  if (!isMusicPlaying) window.toggleMusic();
  else playCurrentCandidate(0, 0);
};

window.changeMusicVolume = function(val) {
  var parsed = parseFloat(val);
  if (!isNaN(parsed)) {
    userMusicVolume = Math.max(0, Math.min(1, parsed));
    bgMusicAudio.volume = window.isVoiceCurrentlyPlaying && window.isVoiceCurrentlyPlaying()
      ? Math.max(0.08, userMusicVolume * 0.35)
      : userMusicVolume;
  }
};

(function autoStartBackgroundMusicOnLaunch() {
  function startMusicNow() {
    syncMusicButtonUI();
    var volEl = document.getElementById('music-vol');
    if (volEl) {
      var v = parseFloat(volEl.value);
      if (!isNaN(v)) userMusicVolume = v;
    }
    bgMusicAudio.volume = userMusicVolume;
    if (isMusicPlaying && bgMusicAudio.paused) {
      playCurrentCandidate(0, 0);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMusicNow);
  } else {
    startMusicNow();
  }
})();

// ============================================================================
// GOOGLE AI STUDIO VOICE PROFILES & STUDIO WAV PACK (/voices/*.wav)
// 1. Rabbit & Cars:       Voice: Aoede,      Style: Vocal Smile, Pace: Rapid Fire, Accent: Neutral
// 2. Owl & Grandma:       Voice: Gacrux,     Style: Empathetic,  Pace: Staccato,   Accent: Neutral
// 3. Dad & Grandpa:       Voice: Achird,     Style: Empathetic,  Pace: Rapid Fire, Accent: Neutral
// 4. Squirrel & AI Train: Voice: Callirrhoe, Style: Empathetic,  Pace: Staccato,   Accent: Neutral
// 5. Mom / Mom Narrator:  Voice: Achernar,   Style: Empathetic,  Pace: Natural,    Accent: Neutral
// 6. Little Train Dan:    Voice: Sulafat,    Style: Vocal Smile, Pace: Natural,    Accent: Neutral
// 7. Helicopter Charlie:  Voice: Zephyr,     Style: Promo/Hype,  Pace: Rapid Fire, Accent: Neutral
// 8. Cow & Sheep:         Voice: Leda,       Style: Vocal Smile, Pace: Natural,    Accent: Neutral
// 9. Track Monsters:      Voice: Puck,       Style: Promo/Hype,  Pace: Staccato,   Accent: Neutral
// ============================================================================
window.AI_STUDIO_VOICE_PROFILES = {
  rabbit:     { voiceName: 'Aoede',      style: 'Style: Vocal Smile, Pace: Rapid Fire, Accent: Neutral', fallbackClip: 'rabbit-hello' },
  car:        { voiceName: 'Aoede',      style: 'Style: Vocal Smile, Pace: Rapid Fire, Accent: Neutral', fallbackClip: 'car-hello' },
  owl:        { voiceName: 'Gacrux',     style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',    fallbackClip: 'owl-hello' },
  grandma:    { voiceName: 'Gacrux',     style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',    fallbackClip: 'grandma-hello' },
  dad:        { voiceName: 'Achird',     style: 'Style: Empathetic, Pace: Rapid Fire, Accent: Neutral',  fallbackClip: 'dad-hello' },
  grandpa:    { voiceName: 'Achird',     style: 'Style: Empathetic, Pace: Rapid Fire, Accent: Neutral',  fallbackClip: 'grandpa-hello' },
  squirrel:   { voiceName: 'Callirrhoe', style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',    fallbackClip: 'squirrel-hello' },
  ai_train:   { voiceName: 'Callirrhoe', style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',    fallbackClip: 'aitrain-hello' },
  mom:        { voiceName: 'Achernar',   style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',     fallbackClip: 'storyteller-hello' },
  train:      { voiceName: 'Sulafat',    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',    fallbackClip: 'danicek-ready' },
  charlie:    { voiceName: 'Zephyr',     style: 'Style: Promo/Hype, Pace: Rapid Fire, Accent: Neutral',  fallbackClip: 'charlie-takeoff' },
  helicopter: { voiceName: 'Zephyr',     style: 'Style: Promo/Hype, Pace: Rapid Fire, Accent: Neutral',  fallbackClip: 'charlie-overview' },
  cow:        { voiceName: 'Leda',       style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',    fallbackClip: 'cow-hello' },
  sheep:      { voiceName: 'Leda',       style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',    fallbackClip: 'sheep-hello' },
  monster:    { voiceName: 'Puck',       style: 'Style: Promo/Hype, Pace: Staccato, Accent: Neutral',    fallbackClip: 'monster-help' }
};

window.VOICE_PACK = {
  // --- Rabbit & Cars (Aoede: Vocal Smile, Rapid Fire, Neutral) ---
  'rabbit-hello': {
    file: 'voices/rabbit-hello.wav',
    fallbackClip: 'danicek-ready',
    role: 'friend',
    speakerType: 'rabbit',
    voiceName: 'Aoede',
    style: 'Style: Vocal Smile, Pace: Rapid Fire, Accent: Neutral',
    text: 'Hop, hop, hello Train Dan! Look how high I can jump!'
  },
  'car-hello': {
    file: 'voices/car-hello.wav',
    fallbackClip: 'danicek-reverse',
    role: 'friend',
    speakerType: 'car',
    voiceName: 'Aoede',
    style: 'Style: Vocal Smile, Pace: Rapid Fire, Accent: Neutral',
    text: 'Beep, beep! Hi Train Dan! We are waving at you from the crossing!'
  },

  // --- Owl & Grandma (Gacrux: Empathetic, Staccato, Neutral) ---
  'owl-hello': {
    file: 'voices/owl-hello.wav',
    fallbackClip: 'storyteller-discovery',
    role: 'friend',
    speakerType: 'owl',
    voiceName: 'Gacrux',
    style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',
    text: 'Hoo-hoo! Hello Train Dan! Wise owl is waving from the tree branch!'
  },
  'grandma-hello': {
    file: 'voices/grandma-hello.wav',
    fallbackClip: 'storyteller-praise',
    role: 'mom',
    speakerType: 'grandma',
    voiceName: 'Gacrux',
    style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',
    text: 'Hello darling Dan! Grandma is waving to you from our yellow house!'
  },

  // --- Dad & Grandpa (Achird: Empathetic, Rapid Fire, Neutral) ---
  'dad-hello': {
    file: 'voices/dad-hello.wav',
    fallbackClip: 'charlie-takeoff',
    role: 'friend',
    speakerType: 'dad',
    voiceName: 'Achird',
    style: 'Style: Empathetic, Pace: Rapid Fire, Accent: Neutral',
    text: 'Hey buddy Dan! Dad is waving to you by the swimming pool! Have a great ride!'
  },
  'grandpa-hello': {
    file: 'voices/grandpa-hello.wav',
    fallbackClip: 'charlie-explore',
    role: 'friend',
    speakerType: 'grandpa',
    voiceName: 'Achird',
    style: 'Style: Empathetic, Pace: Rapid Fire, Accent: Neutral',
    text: 'Hello little driver Dan! Grandpa is cheering for your train from the garden!'
  },

  // --- Squirrel & AI Trains (Callirrhoe: Empathetic, Staccato, Neutral) ---
  'squirrel-hello': {
    file: 'voices/squirrel-hello.wav',
    fallbackClip: 'danicek-crystals',
    role: 'friend',
    speakerType: 'squirrel',
    voiceName: 'Callirrhoe',
    style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',
    text: 'Wheee! Hi Train Dan! Watch me spin and jump up onto the tree branch!'
  },
  'aitrain-hello': {
    file: 'voices/aitrain-hello.wav',
    fallbackClip: 'danicek-speed-up',
    role: 'friend',
    speakerType: 'ai_train',
    voiceName: 'Callirrhoe',
    style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',
    text: 'Toot, toot! Hello friend Dan! Passing you safely on the second track!'
  },
  'aitrain-yield': {
    file: 'voices/aitrain-yield.wav',
    fallbackClip: 'danicek-slow-down',
    role: 'friend',
    speakerType: 'ai_train',
    voiceName: 'Callirrhoe',
    style: 'Style: Empathetic, Pace: Staccato, Accent: Neutral',
    text: 'Choo, choo! After you, friend Dan! You have the right of way!'
  },

  // --- Cow & Sheep (Leda: Vocal Smile, Natural, Neutral) ---
  'cow-hello': {
    file: 'voices/cow-hello.wav',
    fallbackClip: 'storyteller-sunny',
    role: 'friend',
    speakerType: 'cow',
    voiceName: 'Leda',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Mooo! Hello Train Dan! Daisy the cow wishes you a happy journey!'
  },
  'sheep-hello': {
    file: 'voices/sheep-hello.wav',
    fallbackClip: 'storyteller-sheep',
    role: 'friend',
    speakerType: 'sheep',
    voiceName: 'Leda',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Baa, baa! Hi Train Dan! The fluffy white sheep are waving to you!'
  },

  // --- Track Monsters (Puck: Promo/Hype, Staccato, Neutral) ---
  'monster-help': {
    file: 'voices/monster-help.wav',
    fallbackClip: 'charlie-overview',
    role: 'friend',
    speakerType: 'monster',
    voiceName: 'Puck',
    style: 'Style: Promo/Hype, Pace: Staccato, Accent: Neutral',
    text: 'Oh no, here comes the train! Help! Let us hide behind the tree!'
  },
  'monster-bleh': {
    file: 'voices/monster-bleh.wav',
    fallbackClip: 'charlie-explore',
    role: 'friend',
    speakerType: 'monster',
    voiceName: 'Puck',
    style: 'Style: Promo/Hype, Pace: Staccato, Accent: Neutral',
    text: 'Peek-a-boo, Train Dan! Bleh, bleh, you cannot catch me!'
  },

  // --- Mom at Mom's House & Mom Narrator (Achernar: Empathetic, Natural, Neutral) ---
  'mom-house-hello': {
    file: 'voices/mom-house-hello.wav',
    fallbackClip: 'storyteller-hello',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Hello sweetie! Mommy is waving to you from our house and garden!'
  },
  'mom-night': {
    file: 'voices/mom-night.wav',
    fallbackClip: 'storyteller-discovery',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Good evening! Night is falling and all the lights are glowing brightly!'
  },
  'mom-anantara': {
    file: 'voices/mom-anantara.wav',
    fallbackClip: 'storyteller-turn-right',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Now you are heading to the beautiful Anantara Hotel by the river in Bangkok!'
  },
  'mom-iconsiam': {
    file: 'voices/mom-iconsiam.wav',
    fallbackClip: 'storyteller-praise',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Look, now we are riding past IconSiam and the dancing fountains in Bangkok!'
  },
  'storyteller-hello': {
    file: 'voices/storyteller-hello.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Hello, little explorer! Are you ready for an adventure?'
  },
  'storyteller-discovery': {
    file: 'voices/storyteller-discovery.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Look ahead. A magical world is waiting for us.'
  },
  'storyteller-praise': {
    file: 'voices/storyteller-praise.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Wonderful! You found something new.'
  },
  'storyteller-turn-left': {
    file: 'voices/storyteller-turn-left.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: "Let's turn left and see where the tracks take us."
  },
  'storyteller-turn-right': {
    file: 'voices/storyteller-turn-right.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: "Let's turn right toward a new adventure."
  },
  'storyteller-go-straight': {
    file: 'voices/storyteller-go-straight.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Going straight ahead along the railway line.'
  },
  'storyteller-station': {
    file: 'voices/storyteller-station.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'Here we are at the station! Watch the happy passengers step aboard our train.'
  },
  'storyteller-sheep': {
    file: 'voices/storyteller-sheep.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: "Oh look, fluffy white sheep are on the track! Let's honk gently so they step onto the grass."
  },
  'storyteller-sunny': {
    file: 'voices/storyteller-sunny.wav',
    role: 'mom',
    speakerType: 'mom',
    voiceName: 'Achernar',
    style: 'Style: Empathetic, Pace: Natural, Accent: Neutral',
    text: 'The sun is shining brightly over our fairytale world!'
  },

  // --- Little Train Daníček (Sulafat: Vocal Smile, Natural, Neutral) ---
  'danicek-ready': {
    file: 'voices/danicek-ready.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: "Hi, buddy! I'm ready to explore!"
  },
  'danicek-crystals': {
    file: 'voices/danicek-crystals.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Wow! Look at those beautiful crystals!'
  },
  'danicek-next-stop': {
    file: 'voices/danicek-next-stop.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Where shall we go next?'
  },
  'danicek-speed-up': {
    file: 'voices/danicek-speed-up.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Chugga chugga! Going faster! Choo choo!'
  },
  'danicek-slow-down': {
    file: 'voices/danicek-slow-down.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Slowing down! Easy and steady!'
  },
  'danicek-reverse': {
    file: 'voices/danicek-reverse.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Backing up! Beep beep, watch out behind me!'
  },
  'danicek-tunnel': {
    file: 'voices/danicek-tunnel.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Whoosh! Entering the dark tunnel! Turning on my bright headlight!'
  },
  'danicek-metro': {
    file: 'voices/danicek-metro.wav',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Hooray! Into the underground metro tunnel we go! Look at the gnomes and waterfalls!'
  },
  'danicek-eiffel': {
    file: 'voices/danicek-eiffel.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look! That is the tall Eiffel Tower!'
  },
  'danicek-colosseum': {
    file: 'voices/danicek-colosseum.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look! There is the Roman Colosseum!'
  },
  'danicek-airport': {
    file: 'voices/danicek-airport.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look at the airplanes at the Airport!'
  },
  'danicek-jewel': {
    file: 'voices/danicek-jewel.wav',
    fallbackClip: 'danicek-crystals',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Wow, look at the big waterfall inside Jewel!'
  },
  'danicek-stadium': {
    file: 'voices/danicek-stadium.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look! They are playing football in the Stadium!'
  },
  'danicek-bigben': {
    file: 'voices/danicek-bigben.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look at Big Ben, the golden clock tower!'
  },
  'danicek-skyscraper': {
    file: 'voices/danicek-skyscraper.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Wow, look at that tall glass Skyscraper!'
  },
  'danicek-fountain': {
    file: 'voices/danicek-fountain.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look at the sparkling water Fountain!'
  },
  'danicek-boat': {
    file: 'voices/danicek-boat.wav',
    fallbackClip: 'danicek-landmarks',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Look at the wooden Anantara boat on the river!'
  },
  'danicek-landmarks': {
    file: 'voices/danicek-landmarks.wav',
    fallbackClip: 'danicek-ready',
    role: 'train',
    speakerType: 'train',
    voiceName: 'Sulafat',
    style: 'Style: Vocal Smile, Pace: Natural, Accent: Neutral',
    text: 'Wow, look at that amazing landmark right next to our tracks!'
  },

  // --- Charlie the Helicopter (Zephyr: Promo/Hype, Rapid Fire, Neutral) ---
  'charlie-takeoff': {
    file: 'voices/charlie-takeoff.wav',
    role: 'charlie',
    speakerType: 'helicopter',
    voiceName: 'Zephyr',
    style: 'Style: Promo/Hype, Pace: Rapid Fire, Accent: Neutral',
    text: 'Hey, adventurers! Charlie is ready for takeoff!'
  },
  'charlie-overview': {
    file: 'voices/charlie-overview.wav',
    role: 'charlie',
    speakerType: 'helicopter',
    voiceName: 'Zephyr',
    style: 'Style: Promo/Hype, Pace: Rapid Fire, Accent: Neutral',
    text: 'I can see something interesting from up here!'
  },
  'charlie-explore': {
    file: 'voices/charlie-explore.wav',
    role: 'charlie',
    speakerType: 'helicopter',
    voiceName: 'Zephyr',
    style: 'Style: Promo/Hype, Pace: Rapid Fire, Accent: Neutral',
    text: "Come on, team! Let's take a closer look!"
  }
};

// ============================================================================
// WEB AUDIO CONTEXT & DIRECT PCM WAV BUFFER DECODER (100% Google AI Studio WAVs)
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

var decodedVoiceLruKeys = [];
var MAX_DECODED_VOICE_BUFFERS = 10;

function cacheDecodedVoiceBuffer(clipKey, pcmBuf) {
  if (!clipKey || !pcmBuf) return;
  delete rawWavArrayBuffers[clipKey];
  var existingIdx = decodedVoiceLruKeys.indexOf(clipKey);
  if (existingIdx !== -1) {
    decodedVoiceLruKeys.splice(existingIdx, 1);
  }
  decodedVoiceLruKeys.push(clipKey);
  decodedVoiceBuffers[clipKey] = pcmBuf;
  while (decodedVoiceLruKeys.length > MAX_DECODED_VOICE_BUFFERS) {
    var evictKey = decodedVoiceLruKeys.shift();
    if (evictKey && evictKey !== activeVoiceKey) {
      delete decodedVoiceBuffers[evictKey];
    }
  }
}

function fetchVoiceWavBuffer(clipKey) {
  if (decodedVoiceBuffers[clipKey] && audioCtx) {
    cacheDecodedVoiceBuffer(clipKey, decodedVoiceBuffers[clipKey]);
    return Promise.resolve(decodedVoiceBuffers[clipKey]);
  }
  if (rawWavArrayBuffers[clipKey] && audioCtx) {
    var syncBuf = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
    if (syncBuf) {
      cacheDecodedVoiceBuffer(clipKey, syncBuf);
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
      // If static file not found, try generating on-the-fly via /api/tts (Google AI Studio server endpoint)
      return fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: entry.text,
          voiceName: entry.voiceName || 'Aoede',
          style: entry.style || 'Style: Vocal Smile, Pace: Natural, Accent: Neutral'
        })
      }).then(function(resp) {
        if (!resp.ok) throw new Error('TTS API ' + resp.status);
        return resp.arrayBuffer();
      }).then(function(arrBuf) {
        if (!arrBuf || arrBuf.byteLength < 100) throw new Error('Empty TTS WAV');
        if (audioCtx) {
          var pcmBuf = parsePcm16WavToAudioBuffer(audioCtx, arrBuf);
          if (pcmBuf) {
            cacheDecodedVoiceBuffer(clipKey, pcmBuf);
            delete loadingVoicePromises[clipKey];
            return pcmBuf;
          }
        }
        rawWavArrayBuffers[clipKey] = arrBuf;
        delete loadingVoicePromises[clipKey];
        return null;
      }).catch(function(err) {
        delete loadingVoicePromises[clipKey];
        if (entry.fallbackClip && entry.fallbackClip !== clipKey) {
          return fetchVoiceWavBuffer(entry.fallbackClip);
        }
        throw err;
      });
    }

    return fetch(candidateUrls[idx]).then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.arrayBuffer();
    }).then(function(arrBuf) {
      if (!arrBuf || arrBuf.byteLength < 100) throw new Error('Empty WAV');
      if (audioCtx) {
        var pcmBuf = parsePcm16WavToAudioBuffer(audioCtx, arrBuf);
        if (pcmBuf) {
          cacheDecodedVoiceBuffer(clipKey, pcmBuf);
          delete loadingVoicePromises[clipKey];
          return pcmBuf;
        }
      }
      rawWavArrayBuffers[clipKey] = arrBuf;
      delete loadingVoicePromises[clipKey];
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

// Preload only the 3 initial launch greetings at startup instead of all 33 WAVs at once
// so Smart TVs save ~27 MB of decoded Float32 PCM + raw ArrayBuffer RAM!
(function preloadInitialVoiceWavs() {
  var initialKeys = ['danicek-ready', 'storyteller-hello', 'mom-house-hello'];
  initialKeys.forEach(function(k, idx) {
    setTimeout(function() {
      fetchVoiceWavBuffer(k).catch(function() {});
    }, 300 + idx * 120);
  });
})();

// ============================================================================
// STRICT CAMERA FRUSTUM VISIBILITY HELPER
// ("Prosím, aby prodlevy mezi mluveným slovem byly alespoň 5s, maximálně 10 sekund,
//  ale mluví jen objekt, který je aktuálně v záběru.")
// ============================================================================
window.isWorldPosVisibleOnScreen = function(worldPos, maxDistFromTrain) {
  if (!worldPos || !window.camera || !window.playerLoco || !window.playerLoco.position) return false;
  if (window.pState && window.pState.inSubway) return false;
  var maxD = maxDistFromTrain || 68.0;
  if (window.playerLoco.position.distanceTo(worldPos) > maxD) return false;
  var ndc = worldPos.clone().project(window.camera);
  return (
    ndc.z >= -1.0 && ndc.z <= 1.0 &&
    ndc.x >= -0.96 && ndc.x <= 0.96 &&
    ndc.y >= -0.96 && ndc.y <= 0.96
  );
};

// ============================================================================
// STRICT SINGLE-SPEAKER VOICE ENGINE WITH 5s–10s CADENCE LOCK
// (100% Google AI Studio WAVs — No Browser SpeechSynthesis, No Text Boxes)
// ============================================================================
var MIN_SPEECH_PAUSE_MS = 5000;
var MAX_SPEECH_PAUSE_MS = 10000;

var activeBufferSource = null;
var activeVoiceKey = null;
var activeVoiceEndTime = 0;
var activeWatchdogTimer = null;
var lastVoiceFinishedTime = 0;
var nextScheduledSpeechGapMs = 6000;

window.isVoiceCurrentlyPlaying = function() {
  if (!hasUserGesture) return false;
  return Date.now() < activeVoiceEndTime || Boolean(activeBufferSource);
};

window.canStartNewSpeechNow = function() {
  if (!hasUserGesture) return false;
  if (window.isVoiceCurrentlyPlaying()) return false;
  if (lastVoiceFinishedTime > 0 && (Date.now() - lastVoiceFinishedTime) < MIN_SPEECH_PAUSE_MS) {
    return false;
  }
  return true;
};

// Requirement 1: Never show top speech frame (#face-cam-card)
function showFaceCamBanner() {
  var card = document.getElementById('face-cam-card');
  if (card) {
    card.classList.remove('visible', 'talking');
    card.style.display = 'none';
  }
}

function onCurrentVoiceFinished() {
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = null;
  activeBufferSource = null;
  activeVoiceKey = null;
  activeVoiceEndTime = 0;
  lastVoiceFinishedTime = Date.now();
  // Next speech pause strictly between 5.2s and 9.2s (min 5s, max 10s!)
  nextScheduledSpeechGapMs = 5200 + Math.floor(Math.random() * 4000);
  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = userMusicVolume;
  }
}

function playDecodedWebAudioBuffer(audioBuf) {
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

  var durMs = Math.ceil(audioBuf.duration * 1000) + 80;
  activeVoiceEndTime = Date.now() + durMs;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, durMs + 350);

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

function startVoiceClipImmediate(clipKey) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry || !hasUserGesture) return false;

  window.initAudio();

  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
  }

  var estDurMs = 3200;
  activeVoiceKey = clipKey;
  activeVoiceEndTime = Date.now() + estDurMs;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurMs + 700);

  if (audioCtx && rawWavArrayBuffers[clipKey] && !decodedVoiceBuffers[clipKey]) {
    decodedVoiceBuffers[clipKey] = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
  }
  if (audioCtx && decodedVoiceBuffers[clipKey]) {
    return playDecodedWebAudioBuffer(decodedVoiceBuffers[clipKey]);
  }

  fetchVoiceWavBuffer(clipKey).then(function(buf) {
    if (activeVoiceKey !== clipKey) return;
    if (audioCtx && !buf && rawWavArrayBuffers[clipKey]) {
      buf = parsePcm16WavToAudioBuffer(audioCtx, rawWavArrayBuffers[clipKey]);
      if (buf) decodedVoiceBuffers[clipKey] = buf;
    }
    if (audioCtx && buf) {
      playDecodedWebAudioBuffer(buf);
    } else {
      onCurrentVoiceFinished();
    }
  }).catch(function() {
    if (activeVoiceKey === clipKey) {
      onCurrentVoiceFinished();
    }
  });

  return true;
}

window.playVoicePackClip = function(clipKey) {
  var entry = window.VOICE_PACK[clipKey];
  if (!entry || !window.canStartNewSpeechNow()) return false;
  return startVoiceClipImmediate(clipKey);
};

// Dynamic Google AI Studio TTS helper (uses pre-generated studio WAV clip first, or /api/tts)
var dynamicTtsCache = {};
function speakAiStudioVoice(speakerType, clipKey, customText) {
  if (!window.canStartNewSpeechNow()) return false;

  if (clipKey && window.VOICE_PACK[clipKey]) {
    return startVoiceClipImmediate(clipKey);
  }

  var profile = window.AI_STUDIO_VOICE_PROFILES[speakerType] || window.AI_STUDIO_VOICE_PROFILES.train;
  var resolvedText = window.formatPersonalizedText(speakerType, customText || '');
  if (!resolvedText) {
    return startVoiceClipImmediate(profile.fallbackClip);
  }

  var cacheId = profile.voiceName + '|' + resolvedText;
  if (dynamicTtsCache[cacheId] && audioCtx) {
    window.initAudio();
    if (isMusicPlaying && bgMusicAudio) {
      bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
    }
    return playDecodedWebAudioBuffer(dynamicTtsCache[cacheId]);
  }

  // Try server-side Google AI Studio /api/tts endpoint, with instant fallback to studio WAV pack
  window.initAudio();
  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
  }
  activeVoiceKey = cacheId;
  activeVoiceEndTime = Date.now() + 3500;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, 4200);

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: resolvedText,
      voiceName: profile.voiceName,
      style: profile.style
    })
  }).then(function(resp) {
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.arrayBuffer();
  }).then(function(arrBuf) {
    if (activeVoiceKey !== cacheId) return;
    var decoded = parsePcm16WavToAudioBuffer(audioCtx, arrBuf);
    if (decoded) {
      dynamicTtsCache[cacheId] = decoded;
      playDecodedWebAudioBuffer(decoded);
    } else {
      startVoiceClipImmediate(profile.fallbackClip);
    }
  }).catch(function() {
    if (activeVoiceKey === cacheId) {
      startVoiceClipImmediate(profile.fallbackClip);
    }
  });
  return true;
}

// ============================================================================
// HOUSE PASS-BY ALTERNATION STATE & OBJECT COOLDOWNS
// - Mom's House (`mom_house`): alternates 1st pass = Mom (`Achernar`), 2nd pass = Dad (`Achird`)
// - Grandma's House (`grandma_house`): alternates 1st pass = Grandma (`Gacrux`), 2nd pass = Grandpa (`Achird`)
// ============================================================================
var momHousePassTurn = 0;      // even -> Mom ('mom-house-hello'), odd -> Dad ('dad-hello')
var momHouseInZone = false;
var momHouseSpokenThisPass = false;

var grandmaHousePassTurn = 0;  // even -> Grandma ('grandma-hello'), odd -> Grandpa ('grandpa-hello')
var grandmaHouseInZone = false;
var grandmaHouseSpokenThisPass = false;

var charlieClipIdx = 0;
var charlieClipKeys = ['charlie-takeoff', 'charlie-overview', 'charlie-explore'];

var trainDanIdleIdx = 0;
var trainDanIdleKeys = ['danicek-ready', 'danicek-next-stop', 'danicek-speed-up'];

var objectLastSpokenMs = {};

function canObjectSpeakAgain(objId, minCooldownMs) {
  var last = objectLastSpokenMs[objId] || 0;
  return (Date.now() - last) >= (minCooldownMs || 14000);
}

function markObjectSpoken(objId) {
  objectLastSpokenMs[objId] = Date.now();
}

function triggerMomOrDadAtMomHouse() {
  if (!window.canStartNewSpeechNow()) return false;
  var clipKey = (momHousePassTurn % 2 === 0) ? 'mom-house-hello' : 'dad-hello';
  momHousePassTurn++;
  momHouseSpokenThisPass = true;
  markObjectSpoken('mom_house');
  return startVoiceClipImmediate(clipKey);
}

function triggerGrandmaOrGrandpaAtGrandmaHouse() {
  if (!window.canStartNewSpeechNow()) return false;
  var clipKey = (grandmaHousePassTurn % 2 === 0) ? 'grandma-hello' : 'grandpa-hello';
  grandmaHousePassTurn++;
  grandmaHouseSpokenThisPass = true;
  markObjectSpoken('grandma_house');
  return startVoiceClipImmediate(clipKey);
}

// Map showcase narration focusId to Google AI Studio WAV clips
var LANDMARK_CLIP_MAP = {
  eiffel: 'danicek-eiffel',
  colosseum: 'danicek-colosseum',
  airport: 'danicek-airport',
  jewel: 'danicek-jewel',
  stadium: 'danicek-stadium',
  bigben: 'danicek-bigben',
  skyscraper: 'danicek-skyscraper',
  fountain: 'danicek-fountain',
  anantara_boat: 'danicek-boat',
  anantara: 'mom-anantara',
  iconsiam: 'mom-iconsiam',
  bkk_bridge: 'storyteller-go-straight'
};

function handleShowcaseNarrationBalanced(focusId) {
  if (!focusId || !window.canStartNewSpeechNow()) return false;

  // Priority 1: Mom & Dad's House (alternating Mom / Dad)
  if (focusId === 'mom_house') {
    if (!window.momHouseWorldCenter || !window.isWorldPosVisibleOnScreen(window.momHouseWorldCenter, 82)) return false;
    if (momHouseSpokenThisPass && !canObjectSpeakAgain('mom_house', 12000)) return false;
    return triggerMomOrDadAtMomHouse();
  }

  // Priority 2: Grandma & Grandpa's House (alternating Grandma / Grandpa)
  if (focusId === 'grandma_house') {
    if (!window.grandmaHouseWorldCenter || !window.isWorldPosVisibleOnScreen(window.grandmaHouseWorldCenter, 82)) return false;
    if (grandmaHouseSpokenThisPass && !canObjectSpeakAgain('grandma_house', 12000)) return false;
    return triggerGrandmaOrGrandpaAtGrandmaHouse();
  }

  // Priority 3: Squirrel (Callirrhoe: empathetic, staccato, neutral)
  if (focusId === 'squirrel') {
    if (!canObjectSpeakAgain('squirrel', 12000)) return false;
    markObjectSpoken('squirrel');
    return startVoiceClipImmediate('squirrel-hello');
  }

  // Priority 4: Owl (Gacrux: empathetic, staccato, neutral)
  if (focusId === 'owl') {
    if (!canObjectSpeakAgain('owl', 12000)) return false;
    markObjectSpoken('owl');
    return startVoiceClipImmediate('owl-hello');
  }

  // Priority 5: Rabbit (Aoede: vocal smile, rapid fire, neutral)
  if (focusId === 'rabbit') {
    if (!canObjectSpeakAgain('rabbit', 12000)) return false;
    markObjectSpoken('rabbit');
    return startVoiceClipImmediate('rabbit-hello');
  }

  // Cow & Sheep (Leda: vocal smile, natural, neutral)
  if (focusId === 'cow') {
    if (!canObjectSpeakAgain('cow', 14000)) return false;
    markObjectSpoken('cow');
    return startVoiceClipImmediate('cow-hello');
  }
  if (focusId === 'sheep_0' || focusId === 'sheep_1') {
    if (!canObjectSpeakAgain('sheep', 14000)) return false;
    markObjectSpoken('sheep');
    return startVoiceClipImmediate('sheep-hello');
  }

  // Track Monsters (Puck: promo/hype, staccato, neutral)
  if (focusId === 'monster_0' || focusId === 'monster_1') {
    if (!canObjectSpeakAgain(focusId, 12000)) return false;
    markObjectSpoken(focusId);
    return startVoiceClipImmediate('monster-help');
  }

  // Landmarks
  if (LANDMARK_CLIP_MAP[focusId]) {
    if (!canObjectSpeakAgain(focusId, 15000)) return false;
    markObjectSpoken(focusId);
    return startVoiceClipImmediate(LANDMARK_CLIP_MAP[focusId]);
  }

  return false;
}

// ============================================================================
// VISIBLE OBJECT PRIORITY SCANNER (Enforces 5s–10s Speech Cadence!)
// Scans objects currently visible on screen in the user's exact priority order:
// 1. Mom's House (alternating Mom [Achernar] / Dad [Achird])
// 2. Grandma's House (alternating Grandma [Gacrux] / Grandpa [Achird])
// 3. Squirrel (Callirrhoe)
// 4. Owl (Gacrux)
// 5. Rabbit (Aoede)
// 6. AI Trains / Mašinky (Callirrhoe)
// 7. Cars / Autíčka (Aoede)
// 8. Helicopter / Vrtulník (Zephyr)
// 9. Cow, Sheep, Track Monsters, Visible Landmarks
// 10. Train Dan (Sulafat) — always visible on screen so pause never exceeds 10s!
// ============================================================================
function scanAndSpeakVisiblePriorityObject(forceFallbackToTrainDan) {
  if (!window.canStartNewSpeechNow()) return false;
  if (!window.playerLoco || !window.pState) return false;

  // Inside underground Metro cavern: Train Dan comments on underground crystals/metro
  if (window.pState.inSubway) {
    if (forceFallbackToTrainDan && canObjectSpeakAgain('subway_dan', 8000)) {
      markObjectSpoken('subway_dan');
      var subClip = (trainDanIdleIdx++ % 2 === 0) ? 'danicek-crystals' : 'danicek-metro';
      return startVoiceClipImmediate(subClip);
    }
    return false;
  }

  var pPos = window.playerLoco.position;

  // 1. Mom & Dad's House (alternating Mom / Dad on each pass)
  if (window.momHouseWorldCenter) {
    var dMom = pPos.distanceTo(window.momHouseWorldCenter);
    if (dMom < 76.0 && window.isWorldPosVisibleOnScreen(window.momHouseWorldCenter, 78.0)) {
      if (!momHouseSpokenThisPass || canObjectSpeakAgain('mom_house', 14000)) {
        return triggerMomOrDadAtMomHouse();
      }
    }
  }

  // 2. Grandma & Grandpa's House (alternating Grandma / Grandpa on each pass)
  if (window.grandmaHouseWorldCenter) {
    var dGma = pPos.distanceTo(window.grandmaHouseWorldCenter);
    if (dGma < 76.0 && window.isWorldPosVisibleOnScreen(window.grandmaHouseWorldCenter, 78.0)) {
      if (!grandmaHouseSpokenThisPass || canObjectSpeakAgain('grandma_house', 14000)) {
        return triggerGrandmaOrGrandpaAtGrandmaHouse();
      }
    }
  }

  var sbChars = window.storybookInteractiveCharacters;

  // 3. Squirrel (Callirrhoe: empathetic, staccato, neutral)
  if (sbChars && sbChars.squirrel && sbChars.squirrel.worldPos) {
    if (window.isWorldPosVisibleOnScreen(sbChars.squirrel.worldPos, 54.0) && canObjectSpeakAgain('squirrel', 12000)) {
      markObjectSpoken('squirrel');
      return startVoiceClipImmediate('squirrel-hello');
    }
  }

  // 4. Owl (Gacrux: empathetic, staccato, neutral)
  if (sbChars && sbChars.owl && sbChars.owl.worldPos) {
    if (window.isWorldPosVisibleOnScreen(sbChars.owl.worldPos, 54.0) && canObjectSpeakAgain('owl', 12000)) {
      markObjectSpoken('owl');
      return startVoiceClipImmediate('owl-hello');
    }
  }

  // 5. Rabbit (Aoede: vocal smile, rapid fire, neutral)
  if (sbChars && sbChars.rabbit && sbChars.rabbit.worldPos) {
    if (window.isWorldPosVisibleOnScreen(sbChars.rabbit.worldPos, 54.0) && canObjectSpeakAgain('rabbit', 12000)) {
      markObjectSpoken('rabbit');
      return startVoiceClipImmediate('rabbit-hello');
    }
  }

  // 6. AI Trains / Mašinky (Callirrhoe: empathetic, staccato, neutral)
  if (window.aiTrains) {
    for (var aiIdx = 0; aiIdx < window.aiTrains.length; aiIdx++) {
      var ai = window.aiTrains[aiIdx];
      if (ai && ai.loco && window.isWorldPosVisibleOnScreen(ai.loco.position, 52.0)) {
        if (canObjectSpeakAgain('ai_train_' + aiIdx, 11000)) {
          markObjectSpoken('ai_train_' + aiIdx);
          if (typeof window.playFriendTrainGreetingHorn === 'function') {
            window.playFriendTrainGreetingHorn(aiIdx);
          }
          var aiClip = (ai.currentSpeed !== undefined && ai.currentSpeed < 0.05) ? 'aitrain-yield' : 'aitrain-hello';
          return startVoiceClipImmediate(aiClip);
        }
      }
    }
  }

  // 7. Road Cars / Autíčka (Aoede: vocal smile, rapid fire, neutral)
  if (window.livingVehicles) {
    // First check stopped cars at crossings in view, then any close visible car
    for (var pass = 0; pass < 2; pass++) {
      for (var vi = 0; vi < window.livingVehicles.length; vi++) {
        var lv = window.livingVehicles[vi];
        if (!lv || !lv.mesh) continue;
        if (pass === 0 && !lv.isStopped) continue;
        if (window.isWorldPosVisibleOnScreen(lv.mesh.position, 48.0) && canObjectSpeakAgain('car', 11000)) {
          markObjectSpoken('car');
          return startVoiceClipImmediate('car-hello');
        }
      }
    }
  }

  // 8. Helicopter Charlie (Zephyr: promo/hype, rapid fire, neutral)
  if (window.airportFlyingHelis) {
    for (var hi = 0; hi < window.airportFlyingHelis.length; hi++) {
      var fh = window.airportFlyingHelis[hi];
      if (fh && fh.mesh && window.isWorldPosVisibleOnScreen(fh.mesh.position, 105.0)) {
        if (canObjectSpeakAgain('helicopter', 13000)) {
          markObjectSpoken('helicopter');
          var hClip = charlieClipKeys[charlieClipIdx % charlieClipKeys.length];
          charlieClipIdx++;
          return startVoiceClipImmediate(hClip);
        }
      }
    }
  }

  // 9. Track Monsters, Daisy the Cow & Sheep Flocks (if visible on screen)
  if (sbChars && sbChars.monsters) {
    for (var mi = 0; mi < sbChars.monsters.length; mi++) {
      var m = sbChars.monsters[mi];
      if (m && m.model && m.model.root && window.isWorldPosVisibleOnScreen(m.model.root.position, 52.0)) {
        if (canObjectSpeakAgain('monster_' + mi, 11000)) {
          markObjectSpoken('monster_' + mi);
          var mClip = (m.state === 'HIDING_PEEKING') ? 'monster-bleh' : 'monster-help';
          return startVoiceClipImmediate(mClip);
        }
      }
    }
  }

  if (window.daisyTheCow && window.isWorldPosVisibleOnScreen(window.daisyTheCow.position, 48.0)) {
    if (canObjectSpeakAgain('cow', 13000)) {
      markObjectSpoken('cow');
      return startVoiceClipImmediate('cow-hello');
    }
  }

  if (window.trackSheepFlocks) {
    for (var sfi = 0; sfi < window.trackSheepFlocks.length; sfi++) {
      var fl = window.trackSheepFlocks[sfi];
      var shPos = (fl && fl.group) ? fl.group.position : (fl ? fl.basePos : null);
      if (shPos && window.isWorldPosVisibleOnScreen(shPos, 48.0) && canObjectSpeakAgain('sheep', 13000)) {
        markObjectSpoken('sheep');
        return startVoiceClipImmediate('sheep-hello');
      }
    }
  }

  // 10. Currently focused Landmark in camera view
  if (window._camSysState && window._camSysState.activePoiId && window._camSysState.poiWeight > 0.35) {
    var activeFocus = window._camSysState.activePoiId;
    if (handleShowcaseNarrationBalanced(activeFocus)) {
      return true;
    }
  }

  // 11. Guarantee Max 10s Pause: Player's Train Dan (always visible on screen) speaks!
  if (forceFallbackToTrainDan) {
    markObjectSpoken('train_dan_idle');
    var danKey = trainDanIdleKeys[trainDanIdleIdx % trainDanIdleKeys.length];
    trainDanIdleIdx++;
    return startVoiceClipImmediate(danKey);
  }

  return false;
}

window.speakCharacter = function(role, speakerName, avatarColorHex, text, explicitClipKey) {
  if (!window.canStartNewSpeechNow()) return false;

  var sp = String(speakerName || '').toLowerCase();
  var s = String(text || '').toLowerCase();

  // Storyteller 0%
  if (sp.indexOf('storyteller') !== -1) {
    return false;
  }

  if (explicitClipKey && window.VOICE_PACK[explicitClipKey]) {
    return startVoiceClipImmediate(explicitClipKey);
  }

  // Train Dan (Sulafat)
  if (role === 'train' || role === 'toby') {
    if (s.indexOf('gnome cavern') !== -1 || s.indexOf('underground') !== -1) {
      return startVoiceClipImmediate('danicek-metro');
    }
    if (s.indexOf('dark mountain tunnel') !== -1 || s.indexOf('dark tunnel') !== -1) {
      return startVoiceClipImmediate('danicek-tunnel');
    }
    if (s.indexOf('backing up') !== -1 || s.indexOf('reverse') !== -1) {
      return startVoiceClipImmediate('danicek-reverse');
    }
    if (s.indexOf('faster') !== -1 || s.indexOf('speed ') !== -1) {
      if (!canObjectSpeakAgain('train_speed', 8000)) return false;
      markObjectSpoken('train_speed');
      return startVoiceClipImmediate('danicek-speed-up');
    }
    if (s.indexOf('slow') !== -1 || s.indexOf('brakes') !== -1) {
      if (!canObjectSpeakAgain('train_slow', 8000)) return false;
      markObjectSpoken('train_slow');
      return startVoiceClipImmediate('danicek-slow-down');
    }
    return startVoiceClipImmediate('danicek-ready');
  }

  // Mom Narrator (Achernar)
  if (role === 'mom') {
    if (s.indexOf('sheep') !== -1) {
      if (window.trackSheepFlocks && window.playerLoco) {
        for (var si = 0; si < window.trackSheepFlocks.length; si++) {
          var fl = window.trackSheepFlocks[si];
          var shPos = (fl && fl.group) ? fl.group.position : (fl ? fl.basePos : null);
          if (shPos && window.isWorldPosVisibleOnScreen(shPos, 48.0)) {
            markObjectSpoken('sheep');
            return startVoiceClipImmediate('sheep-hello');
          }
        }
      }
      return false;
    }
    if (s.indexOf('turning left') === 0) {
      return startVoiceClipImmediate('storyteller-turn-left');
    }
    if (s.indexOf('turning right') === 0) {
      if (s.indexOf('anantara') !== -1) return startVoiceClipImmediate('mom-anantara');
      return startVoiceClipImmediate('storyteller-turn-right');
    }
    if (s.indexOf('turning straight') === 0) {
      return startVoiceClipImmediate('storyteller-go-straight');
    }
    return startVoiceClipImmediate('storyteller-station');
  }

  // Friends (Cow, AI Trains, Cars) — ONLY when visible on screen!
  if (role === 'friend') {
    if (sp.indexOf('cow') !== -1 || sp.indexOf('daisy') !== -1) {
      if (!window.daisyTheCow || !window.isWorldPosVisibleOnScreen(window.daisyTheCow.position, 48.0)) return false;
      markObjectSpoken('cow');
      return startVoiceClipImmediate('cow-hello');
    }
    if (sp.indexOf('bullet') !== -1 || sp.indexOf('rusty') !== -1 || sp.indexOf('shinkansen') !== -1 || sp.indexOf('steam') !== -1) {
      var visibleAi = false;
      if (window.aiTrains) {
        for (var aiIdx = 0; aiIdx < window.aiTrains.length; aiIdx++) {
          var ai = window.aiTrains[aiIdx];
          if (ai && ai.loco && window.isWorldPosVisibleOnScreen(ai.loco.position, 48.0)) {
            visibleAi = true;
            break;
          }
        }
      }
      if (!visibleAi) return false;
      markObjectSpoken('ai_train');
      var clip = (s.indexOf('right-of-way') !== -1) ? 'aitrain-yield' : 'aitrain-hello';
      return startVoiceClipImmediate(clip);
    }

    var visibleCar = false;
    if (window.livingVehicles) {
      for (var vi = 0; vi < window.livingVehicles.length; vi++) {
        var lv = window.livingVehicles[vi];
        if (lv && lv.mesh && window.isWorldPosVisibleOnScreen(lv.mesh.position, 48.0)) {
          visibleCar = true;
          break;
        }
      }
    }
    if (!visibleCar) return false;
    markObjectSpoken('car');
    return startVoiceClipImmediate('car-hello');
  }

  return false;
};
var balancedSpeakCharacter = window.speakCharacter;

window.speakPureEnglish = function(emoji, text) {
  window.speakCharacter('mom', '👩 Mom Narrator', '#ec4899', text);
};

// ============================================================================
// USER GESTURE AUDIO UNLOCK
// ============================================================================
function unlockAudioOnFirstGesture() {
  window.initAudio();
  if (lastVoiceFinishedTime === 0) {
    // Allow first greeting ~1.5s after first user gesture
    lastVoiceFinishedTime = Date.now() - (MIN_SPEECH_PAUSE_MS - 1200);
  }
  if (isMusicPlaying && bgMusicAudio && bgMusicAudio.paused) {
    bgMusicAudio.volume = window.isVoiceCurrentlyPlaying && window.isVoiceCurrentlyPlaying()
      ? Math.max(0.08, userMusicVolume * 0.35)
      : userMusicVolume;
    playCurrentCandidate(0, 0);
  }
}

window.addEventListener('keydown', function() {
  unlockAudioOnFirstGesture();
}, true);

window.addEventListener('pointerdown', function() {
  unlockAudioOnFirstGesture();
}, true);

window.addEventListener('touchstart', function() {
  unlockAudioOnFirstGesture();
}, true);

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
// WEB AUDIO SYNTHESIZER (Steam Whistle, Visible-Only Animal & Crossing Car Horns)
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

window.playTrainHorn = function() {
  window.initAudio();

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

// Collectible chime ONLY (Storyteller 0%)
window.playCollectSound = function() {
  playTone([587.33, 880.0, 1174.66], 0.26, 'sine');
};

window.playSheepBaa = function() {
  if (window.trackSheepFlocks && window.playerLoco) {
    var anyVisibleSheep = false;
    for (var i = 0; i < window.trackSheepFlocks.length; i++) {
      var fl = window.trackSheepFlocks[i];
      var pos = (fl && fl.group) ? fl.group.position : (fl ? fl.basePos : null);
      if (pos && window.isWorldPosVisibleOnScreen(pos, 36)) {
        anyVisibleSheep = true;
        break;
      }
    }
    if (!anyVisibleSheep) return;
  }
  playTone([310, 275, 300], 0.32, 'sawtooth');
};

window.playCowMoo = function() {
  if (window.daisyTheCow && !window.isWorldPosVisibleOnScreen(window.daisyTheCow.position, 38)) {
    return;
  }
  playTone([145, 130], 0.75, 'sawtooth');
};

window.playCarBeepBeep = function(pitchOffset) {
  if (window.livingVehicles) {
    var hasVisibleCar = false;
    for (var i = 0; i < window.livingVehicles.length; i++) {
      var lv = window.livingVehicles[i];
      if (lv && lv.mesh && window.isWorldPosVisibleOnScreen(lv.mesh.position, 48)) {
        hasVisibleCar = true;
        break;
      }
    }
    if (!hasVisibleCar) return;
  }
  var p = pitchOffset || 0;
  playTone([480 + p, 620 + p], 0.16, 'square');
};

window.playHappyLaugh = function() { playTone([523, 659, 587, 784, 659], 0.14, 'sine'); };
window.playMagicSubwaySound = function() { playTone([440, 554.37, 659.25, 880, 1108.73], 0.35, 'sine'); };

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
// POST-LOAD SCENE COORDINATOR:
// 1. Permanently hides all 3D animal/monster speech bubbles (renderOrder === 999)
// 2. Enforces 5s–10s pause between utterances & prioritizes visible objects:
//    - Mom's house (alternating Mom [Achernar] / Dad [Achird])
//    - Grandma's house (alternating Grandma [Gacrux] / Grandpa [Achird])
//    - Squirrel (Callirrhoe), Owl (Gacrux), Rabbit (Aoede)
//    - AI Trains (Callirrhoe), Cars (Aoede), Helicopter (Zephyr)
// 3. Makes visible stopped cars at railway crossings blink lights & honk
// ============================================================================
(function installPostLoadSceneCoordinator() {
  function setupCoordinator() {
    if (!window.THREE || !window.scene) {
      setTimeout(setupCoordinator, 100);
      return;
    }
    var THREE = window.THREE;

    // 1) Permanently hide all 3D comic speech bubble sprites above animals & monsters
    window.scene.traverse(function(node) {
      if (node && node.isSprite && node.renderOrder === 999) {
        node.visible = false;
        node.scale.set(0, 0, 0);
        try {
          Object.defineProperty(node, 'visible', {
            get: function() { return false; },
            set: function() {},
            configurable: true
          });
        } catch (e) {}
      }
    });

    // 2) Override window.triggerEnglishShowcaseNarration (created by models.js)
    window.triggerEnglishShowcaseNarration = function(focusId) {
      handleShowcaseNarrationBalanced(focusId);
    };

    // 3) Re-apply direct balanced window.speakCharacter
    if (typeof balancedSpeakCharacter === 'function') {
      window.speakCharacter = balancedSpeakCharacter;
    }

    // 4) Wrap window.playTrainHorn so off-screen AI trains never blow the horn,
    //    and Rabbit / Squirrel / Owl proximity triggers their Google AI Studio voice greeting
    var modelsPlayTrainHorn = window.playTrainHorn;
    var userHornWindowUntil = 0;

    if (typeof window.handleInput === 'function' && !window.handleInput._hornTracked) {
      var origHandleInput = window.handleInput;
      window.handleInput = function(key) {
        if (key === 'Enter' || key === ' ') {
          userHornWindowUntil = Date.now() + 250;
        }
        return origHandleInput.apply(this, arguments);
      };
      window.handleInput._hornTracked = true;
    }

    window.playTrainHorn = function() {
      var now = Date.now();
      if (now <= userHornWindowUntil) {
        return modelsPlayTrainHorn.apply(this, arguments);
      }

      if (typeof window.lastFriendChatTime === 'number' && Math.abs(now - window.lastFriendChatTime) <= 12) {
        var anyVisibleAiNear = false;
        if (window.aiTrains && window.playerLoco) {
          for (var i = 0; i < window.aiTrains.length; i++) {
            var ai = window.aiTrains[i];
            if (
              ai && ai.loco &&
              ai.loco.position.distanceTo(window.playerLoco.position) < 30 &&
              window.isWorldPosVisibleOnScreen(ai.loco.position, 44)
            ) {
              anyVisibleAiNear = true;
              break;
            }
          }
        }
        if (!anyVisibleAiNear) {
          window.lastFriendChatTime = 0;
          return;
        }
        return modelsPlayTrainHorn.apply(this, arguments);
      }

      if (window._storybookCharId === 'rabbit' || window._storybookCharId === 'squirrel' || window._storybookCharId === 'owl') {
        handleShowcaseNarrationBalanced(window._storybookCharId);
        return;
      }

      return modelsPlayTrainHorn.apply(this, arguments);
    };

    // 5) Per-frame coordinator for:
    //    - Mom's House (Mom/Dad alternation) & Grandma's House (Grandma/Grandpa alternation)
    //    - 5s–10s speech cadence across visible objects in camera frustum
    //    - Day/Night transitions & Bangkok Anantara / IconSiam announcements
    //    - Visible stopped cars blinking & honking at crossings
    var wasNightState = null;
    var lastAnnouncedEdgeId = null;
    var blinkerGeo = new THREE.SphereGeometry(0.26, 8, 8);
    var blinkerMatOn = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    var blinkerMatAmber = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    function ensureCarCrossingBlinkers(lv) {
      if (!lv || !lv.mesh || lv._crossingBlinkerGroup) return lv._crossingBlinkerGroup;
      var grp = new THREE.Group();
      var l1 = new THREE.Mesh(blinkerGeo, blinkerMatOn);
      var l2 = new THREE.Mesh(blinkerGeo, blinkerMatOn);
      var l3 = new THREE.Mesh(blinkerGeo, blinkerMatAmber);
      var l4 = new THREE.Mesh(blinkerGeo, blinkerMatAmber);
      l1.position.set(-0.72, 0.68, 1.95);
      l2.position.set(0.72, 0.68, 1.95);
      l3.position.set(-0.88, 0.62, 1.88);
      l4.position.set(0.88, 0.62, 1.88);
      grp.add(l1, l2, l3, l4);
      grp.visible = false;
      lv.mesh.add(grp);
      lv._crossingBlinkerGroup = grp;
      return grp;
    }

    function updateFrameCoordinator() {
      requestAnimationFrame(updateFrameCoordinator);
      if (typeof window.syncCornerSpeedAndSwitchHud === 'function') {
        window.syncCornerSpeedAndSwitchHud(false);
      }
      if (!window.playerLoco || !window.pState) return;

      var now = Date.now();
      var pPos = window.playerLoco.position;

      // Track pass-by zone entry/exit for Mom's House & Grandma's House so each pass alternates speaker!
      if (window.momHouseWorldCenter) {
        var distMom = pPos.distanceTo(window.momHouseWorldCenter);
        if (distMom < 76.0) {
          momHouseInZone = true;
        } else if (distMom > 92.0 && momHouseInZone) {
          momHouseInZone = false;
          momHouseSpokenThisPass = false;
        }
      }

      if (window.grandmaHouseWorldCenter) {
        var distGma = pPos.distanceTo(window.grandmaHouseWorldCenter);
        if (distGma < 76.0) {
          grandmaHouseInZone = true;
        } else if (distGma > 92.0 && grandmaHouseInZone) {
          grandmaHouseInZone = false;
          grandmaHouseSpokenThisPass = false;
        }
      }

      // A) Day <-> Night change announcement (Mom Narrator: Achernar)
      if (typeof window.gameTimeSeconds === 'number') {
        var hoursFloat = (window.gameTimeSeconds / 300) * 24;
        var isNightNow = (hoursFloat >= 20.0 || hoursFloat < 5.5);
        if (wasNightState === null) {
          wasNightState = isNightNow;
        } else if (isNightNow !== wasNightState) {
          wasNightState = isNightNow;
          if (!window.pState.inSubway && window.canStartNewSpeechNow()) {
            startVoiceClipImmediate(isNightNow ? 'mom-night' : 'storyteller-sunny');
          }
        }
      }

      // B) Entering Bangkok Anantara / IconSiam track edges (Mom Narrator: Achernar)
      var curEdge = window.pState.edge;
      if (curEdge && !curEdge.isTurnout && curEdge.id !== lastAnnouncedEdgeId) {
        lastAnnouncedEdgeId = curEdge.id;
        if (curEdge.id === 'J_NW->J_BKK_ANANTARA' && window.canStartNewSpeechNow()) {
          startVoiceClipImmediate('mom-anantara');
        } else if (curEdge.id === 'J_BKK_ANANTARA->J_BKK_BRIDGE_E' && window.canStartNewSpeechNow()) {
          startVoiceClipImmediate('mom-iconsiam');
        }
      }

      // C) 5s–10s Visible Object Priority Director
      if (hasUserGesture && window.canStartNewSpeechNow()) {
        var elapsedSinceLastSpeech = (lastVoiceFinishedTime > 0)
          ? (now - lastVoiceFinishedTime)
          : MIN_SPEECH_PAUSE_MS;

        // As soon as >= 5s has elapsed, let high-priority visible objects (Mom/Dad house, Grandma/Grandpa house,
        // Squirrel, Owl, Rabbit, AI Train, Car, Helicopter) speak immediately when in view!
        if (elapsedSinceLastSpeech >= MIN_SPEECH_PAUSE_MS) {
          var forceFallback = (elapsedSinceLastSpeech >= nextScheduledSpeechGapMs || elapsedSinceLastSpeech >= 9500);
          scanAndSpeakVisiblePriorityObject(forceFallback);
        }
      }

      // D) Road Cars Stopped at Railway Crossings:
      //    - Blink lights & honk ONLY when stopped at crossing AND visible in camera view!
      //    - Multiple visible stopped cars can honk and blink simultaneously!
      if (window.livingVehicles) {
        for (var i = 0; i < window.livingVehicles.length; i++) {
          var lv = window.livingVehicles[i];
          if (!lv || !lv.mesh) continue;

          var isStoppedAndVisible = Boolean(
            lv.isStopped &&
            window.isWorldPosVisibleOnScreen(lv.mesh.position, 48) &&
            pPos.distanceTo(lv.mesh.position) < 44
          );

          var blinkerGrp = lv._crossingBlinkerGroup;
          if (isStoppedAndVisible) {
            if (!blinkerGrp) blinkerGrp = ensureCarCrossingBlinkers(lv);
            if (blinkerGrp) {
              blinkerGrp.visible = (Math.floor((now + i * 110) / 180) % 2 === 0);
            }
            if (!lv._nextCrossingHonkMs || now >= lv._nextCrossingHonkMs) {
              lv._nextCrossingHonkMs = now + 2300 + (i % 4) * 450;
              window.playCarBeepBeep((i % 3) * 35);
            }
          } else if (blinkerGrp && blinkerGrp.visible) {
            blinkerGrp.visible = false;
          }
        }
      }
    }

    requestAnimationFrame(updateFrameCoordinator);
  }

  if (document.readyState === 'complete') {
    setTimeout(setupCoordinator, 0);
  } else {
    window.addEventListener('load', function() {
      setTimeout(setupCoordinator, 0);
    });
  }
})();
