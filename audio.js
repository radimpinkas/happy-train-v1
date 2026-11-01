// ============================================================================
// MODULE 1: AUDIO.JS (Web Audio API Voice Engine, Balanced Single-Speaker
// Turn-Taking, Strict Camera-Frustum Visibility Filter, Smartphone Compact HUD,
// Translucent Circular Remote D-Pad, Steam Whistle, Chimney Bubbles & Signage)
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
// ============================================================================
(function installCleanUiAndCircularRemoteWheel() {
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
        '/* 2. Hide legacy wide bottom button bar and show translucent circular remote wheel */',
        '#hud {',
        '  display: none !important;',
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
        '/* 3. Smartphone compact single-row top menu (shows only Player Name, Clock, Score, Music ON/OFF) */',
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
        '  #music-vol,',
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
        '    padding: 0 !important;',
        '    background: transparent !important;',
        '    border: none !important;',
        '    flex-shrink: 0 !important;',
        '  }',
        '  #music-toggle-btn {',
        '    padding: 5px 8px !important;',
        '    font-size: 11px !important;',
        '    border-radius: 10px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '  .score-pill {',
        '    padding: 4px 8px !important;',
        '    font-size: 12px !important;',
        '    border-radius: 10px !important;',
        '    gap: 5px !important;',
        '    white-space: nowrap !important;',
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
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(styleEl);
    }

    var faceCard = document.getElementById('face-cam-card');
    if (faceCard) {
      faceCard.classList.remove('visible', 'talking');
      faceCard.style.display = 'none';
    }

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

      // Highlight wheel segment when user presses hardware keyboard / TV remote keys
      window.addEventListener('keydown', function(e) {
        var k = e.key === ' ' ? 'Enter' : e.key;
        var matchBtn = wheel.querySelector('button[data-key="' + k + '"]');
        if (matchBtn) {
          matchBtn.classList.add('active-press');
          setTimeout(function() {
            matchBtn.classList.remove('active-press');
          }, 160);
        }
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
  window.initAudio();
  var btn = document.getElementById('music-toggle-btn');
  if (isMusicPlaying) {
    isMusicPlaying = false;
    bgMusicAudio.pause();
    if (btn) {
      btn.textContent = '🎵 Music: OFF';
      btn.classList.remove('playing');
    }
  } else {
    isMusicPlaying = true;
    if (btn) {
      btn.textContent = '🎵 Music: ON';
      btn.classList.add('playing');
    }
    var volEl = document.getElementById('music-vol');
    if (volEl) userMusicVolume = parseFloat(volEl.value);
    bgMusicAudio.volume = userMusicVolume;
    playCurrentCandidate();
  }
};

window.nextMusicTrack = function() {
  window.initAudio();
  currentSongIndex = (currentSongIndex + 1) % sunoCandidateFiles.length;
  if (!isMusicPlaying) window.toggleMusic();
  else playCurrentCandidate();
};

window.changeMusicVolume = function(val) {
  userMusicVolume = parseFloat(val);
  bgMusicAudio.volume = userMusicVolume;
};

// ============================================================================
// NATURAL CHARACTER VOICE PACK (Studio WAV Files in /voices/)
// ============================================================================
window.VOICE_PACK = {
  'storyteller-hello': {
    file: 'voices/storyteller-hello.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 3,
    text: 'Hello, little explorer! Are you ready for an adventure?'
  },
  'storyteller-discovery': {
    file: 'voices/storyteller-discovery.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 2,
    text: 'Look ahead. A magical world is waiting for us.'
  },
  'storyteller-praise': {
    file: 'voices/storyteller-praise.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 2,
    text: 'Wonderful! You found something new.'
  },
  'storyteller-turn-left': {
    file: 'voices/storyteller-turn-left.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#facc15',
    priority: 2,
    text: "Let's turn left and see where the tracks take us."
  },
  'storyteller-turn-right': {
    file: 'voices/storyteller-turn-right.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#f97316',
    priority: 2,
    text: "Let's turn right toward a new adventure."
  },
  'storyteller-go-straight': {
    file: 'voices/storyteller-go-straight.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#4ade80',
    priority: 2,
    text: 'Going straight ahead along the railway line.'
  },
  'storyteller-station': {
    file: 'voices/storyteller-station.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 3,
    text: 'Here we are at the station! Watch the happy passengers step aboard our train.'
  },
  'storyteller-sheep': {
    file: 'voices/storyteller-sheep.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 3,
    text: "Oh look, fluffy white sheep are on the track! Let's honk gently so they step onto the grass."
  },
  'storyteller-sunny': {
    file: 'voices/storyteller-sunny.wav',
    role: 'mom',
    speaker: '👩 Mom Narrator',
    color: '#ec4899',
    priority: 2,
    text: 'The sun is shining brightly over our fairytale world!'
  },
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

(function preloadAllVoiceWavs() {
  var keys = Object.keys(window.VOICE_PACK);
  keys.forEach(function(k, idx) {
    setTimeout(function() {
      fetchVoiceWavBuffer(k).catch(function() {});
    }, idx * 45);
  });
})();

// --- ENGLISH SPEECH SYNTHESIS ENGINE (Distinct Voices for Mom, Train Dan, Animals & Friends) ---
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
// STRICT CAMERA FRUSTUM VISIBILITY HELPER
// ("Pravidlem je, že mluví jen ty zvířátka, mašinky a autíčka, atd. která jsou
//  právě zobrazena a mluví vždy jen jeden objekt. Troubit a blikat může i více
//  objektů najednou, ale jen ty, které jsou zobrazeny.")
// ============================================================================
window.isWorldPosVisibleOnScreen = function(worldPos, maxDistFromTrain) {
  if (!worldPos || !window.camera || !window.playerLoco || !window.playerLoco.position) return false;
  if (window.pState && window.pState.inSubway) return false;
  var maxD = maxDistFromTrain || 58.0;
  if (window.playerLoco.position.distanceTo(worldPos) > maxD) return false;
  var ndc = worldPos.clone().project(window.camera);
  return (
    ndc.z >= -1.0 && ndc.z <= 1.0 &&
    ndc.x >= -0.96 && ndc.x <= 0.96 &&
    ndc.y >= -0.96 && ndc.y <= 0.96
  );
};

// ============================================================================
// STRICT SINGLE-SPEAKER VOICE ENGINE (NO TEXT BANNER, NO OVERLAPPING SPEECH)
// ============================================================================
var activeBufferSource = null;
var activeVoiceKey = null;
var activeVoiceEndTime = 0;
var activeWatchdogTimer = null;

window.isVoiceCurrentlyPlaying = function() {
  if (!hasUserGesture) return false;
  var ttsSpeaking = Boolean('speechSynthesis' in window && window.speechSynthesis && window.speechSynthesis.speaking);
  return Date.now() < activeVoiceEndTime || ttsSpeaking;
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
  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = userMusicVolume;
  }
}

function speakDynamicUtterance(role, speakerType, rawText) {
  if (!hasUserGesture) return false;
  if (window.isVoiceCurrentlyPlaying()) return false;

  var resolvedText = window.formatPersonalizedText(role, rawText);
  if (!resolvedText) return false;

  window.initAudio();
  if (!verifiedEnVoices.length) loadEnglishVoices();

  var estDurationMs = Math.max(1700, Math.min(4600, resolvedText.length * 64));
  activeVoiceEndTime = Date.now() + estDurationMs;

  if (isMusicPlaying && bgMusicAudio) {
    bgMusicAudio.volume = Math.max(0.08, userMusicVolume * 0.35);
  }

  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, estDurationMs + 350);

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
        u.pitch = 1.05;
        u.rate = 0.95;
      } else if (role === 'train') {
        u.pitch = 1.36;
        u.rate = 1.04;
      } else if (speakerType === 'squirrel' || speakerType === 'rabbit') {
        u.pitch = 1.68;
        u.rate = 1.12;
      } else if (speakerType === 'owl') {
        u.pitch = 0.92;
        u.rate = 0.94;
      } else if (speakerType === 'cow') {
        u.pitch = 0.88;
        u.rate = 0.92;
      } else if (speakerType === 'sheep') {
        u.pitch = 1.48;
        u.rate = 1.06;
      } else if (speakerType === 'monster') {
        u.pitch = 1.52;
        u.rate = 1.08;
      } else if (speakerType === 'ai_train') {
        u.pitch = 1.20;
        u.rate = 1.04;
      } else {
        u.pitch = 1.28;
        u.rate = 1.06;
      }

      u.onend = function() {
        onCurrentVoiceFinished();
      };
      u.onerror = function() {
        onCurrentVoiceFinished();
      };
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {}
  }

  // Fallback to studio WAV buffer if device has no TTS voices
  var fallbackClip = (role === 'mom') ? 'storyteller-turn-right' : 'danicek-ready';
  startVoiceClipImmediate(fallbackClip);
  return true;
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

  var durMs = Math.ceil(audioBuf.duration * 1000) + 120;
  activeVoiceEndTime = Date.now() + durMs;
  clearTimeout(activeWatchdogTimer);
  activeWatchdogTimer = setTimeout(onCurrentVoiceFinished, durMs + 400);

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

  var estDurMs = 3000;
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
  if (!entry || !hasUserGesture) return false;
  // Strict single-speaker rule: never interrupt or queue overlapping voices
  if (window.isVoiceCurrentlyPlaying()) return false;
  return startVoiceClipImmediate(clipKey);
};

// ============================================================================
// VOICE BALANCING & TURN-TAKING CONTROLLER (Requirement 4):
// - Storyteller: 0% (completely disabled)
// - Mom Narrator: ~10% (comments on Day/Night transitions & where train is heading, e.g. Anantara in Bangkok)
// - Train Dan: ~20% (short 1-sentence comments on landmarks/objects passed)
// - Animals (Squirrel, Owl, Rabbit, Cow, Sheep, Monsters): short greetings when visible & passing
// - AI Trains: honk & greet train ONLY when visible on screen
// - Road Cars: honk & blink lights at train when stopped at crossing AND visible on screen
// - Strict Rule: ONLY visible objects speak/honk/blink, and ONLY 1 object speaks at a time!
// ============================================================================
var lastMomRouteSpeechMs = 0;
var lastTrainDanSpeechMs = 0;
var animalGreetCooldownMap = {};

// Short greetings spoken by the animals themselves when passing by in camera view
var ANIMAL_SHORT_GREETINGS = {
  squirrel: [
    'Hi Dan! Wheee, look at me jump!',
    'Hello train Dan! Wheee!'
  ],
  owl: [
    'Hoo-hoo! Hello train Dan!',
    'Hoo-hoo! Nice to see you, Dan!'
  ],
  rabbit: [
    'Hi Dan! Hop, hop, hello!',
    'Hello little train! Hop, hop!'
  ],
  cow: [
    'Mooo! Hello train Dan!',
    'Mooo! Have a nice ride, Dan!'
  ],
  sheep_0: [
    'Baa, baa! Hello train Dan!',
    'Baa! Hi little train!'
  ],
  sheep_1: [
    'Baa, baa! Hi train Dan!',
    'Baa! Wave hello to the sheep!'
  ],
  monster_0: [
    'Oh no, here comes the train! Help!',
    'Eek! Watch out for the train!'
  ],
  monster_1: [
    'Whoa, the train is coming! Help!',
    'Peek-a-boo, little train Dan!'
  ]
};

// Mom Narrator (~10%): comments where the train is heading (e.g. Anantara in Bangkok)
var MOM_DESTINATION_LINES = {
  anantara: 'Now you are arriving at the Anantara Hotel in Bangkok!',
  iconsiam: 'Now you are riding past IconSiam by the river in Bangkok!',
  bkk_bridge: 'Now you are crossing the big railway bridge in Bangkok!',
  mom_house: 'Now you are passing Mommy and Daddy\'s house!'
};

// Train Dan (~20%): short, crisp comments on objects & occasionally animals
var TRAIN_DAN_SHORT_COMMENTS = {
  eiffel: 'Look! That is the tall Eiffel Tower!',
  colosseum: 'Look! There is the Roman Colosseum!',
  grandma_house: 'Look! Here is Grandma and Grandpa\'s house!',
  airport: 'Look at the airplanes at the Airport!',
  jewel: 'Wow, look at the big waterfall inside Jewel!',
  stadium: 'Look! They are playing football in the Stadium!',
  bigben: 'Look at Big Ben, the golden clock tower!',
  skyscraper: 'Wow, look at that tall glass Skyscraper!',
  fountain: 'Look at the sparkling water Fountain!',
  anantara_boat: 'Look at the wooden Anantara boat on the river!'
};

var animalGreetingCounter = 0;

function handleShowcaseNarrationBalanced(focusId) {
  if (!focusId || !hasUserGesture) return false;
  if (window.isVoiceCurrentlyPlaying()) return false;

  var nowMs = Date.now();

  // 1) Animals & Monsters (70% priority): the visible animal calls out a short greeting!
  //    (20% of the time, Train Dan briefly comments on the animal instead)
  if (ANIMAL_SHORT_GREETINGS[focusId]) {
    var lastAnimMs = animalGreetCooldownMap[focusId] || 0;
    if (nowMs - lastAnimMs < 9000) return false;
    animalGreetCooldownMap[focusId] = nowMs;
    animalGreetingCounter++;

    // 1 in 5 times (~20%), Train Dan makes a short remark about the animal
    if (animalGreetingCounter % 5 === 0) {
      var shortDanAnimal = {
        squirrel: 'Look! A cute orange squirrel in the tree!',
        owl: 'Look up! A wise brown owl on the branch!',
        rabbit: 'Look! A little white rabbit hopping by the track!',
        cow: 'Look! Our friend Daisy the cow!',
        sheep_0: 'Look at the fluffy white sheep!',
        sheep_1: 'Look! White sheep waving by the tracks!',
        monster_0: 'Haha! Look at the funny purple monster!',
        monster_1: 'Haha! That fuzzy monster hid behind the tree!'
      }[focusId];
      if (shortDanAnimal) {
        lastTrainDanSpeechMs = nowMs;
        return speakDynamicUtterance('train', 'train', shortDanAnimal);
      }
    }

    var lines = ANIMAL_SHORT_GREETINGS[focusId];
    var chosenLine = lines[animalGreetingCounter % lines.length];
    var aType = focusId.indexOf('sheep') === 0 ? 'sheep' : (focusId.indexOf('monster') === 0 ? 'monster' : focusId);
    return speakDynamicUtterance('friend', aType, chosenLine);
  }

  // 2) Mom Narrator (~10%): comments where the train is heading (e.g. Anantara in Bangkok)
  if (MOM_DESTINATION_LINES[focusId]) {
    if (nowMs - lastMomRouteSpeechMs < 14000) return false;
    lastMomRouteSpeechMs = nowMs;
    return speakDynamicUtterance('mom', 'mom', MOM_DESTINATION_LINES[focusId]);
  }

  // 3) Train Dan (~20%): short 1-sentence comment on objects/landmarks passed
  if (TRAIN_DAN_SHORT_COMMENTS[focusId]) {
    if (nowMs - lastTrainDanSpeechMs < 11000) return false;
    lastTrainDanSpeechMs = nowMs;
    return speakDynamicUtterance('train', 'train', TRAIN_DAN_SHORT_COMMENTS[focusId]);
  }

  return false;
}

window.speakCharacter = function(role, speakerName, avatarColorHex, text, explicitClipKey) {
  if (!hasUserGesture) return false;
  // Strict single-speaker rule: if anyone is speaking, do not overlap or queue
  if (window.isVoiceCurrentlyPlaying()) return false;

  var sp = String(speakerName || '').toLowerCase();
  var s = String(text || '').toLowerCase();
  var nowMs = Date.now();

  // Rule: Storyteller = 0% (never speak as Storyteller)
  if (sp.indexOf('storyteller') !== -1) {
    return false;
  }

  // Filter out repetitive speed/slowdown/horn button chatter so Train Dan stays ~20%
  if (role === 'train' || role === 'toby') {
    if (
      s.indexOf('speed ') !== -1 ||
      s.indexOf('faster') !== -1 ||
      s.indexOf('slowing down') !== -1 ||
      s.indexOf('brakes') !== -1 ||
      s.indexOf('slower now') !== -1 ||
      s.indexOf('hi friends!') !== -1
    ) {
      return false;
    }
    if (s.indexOf('gnome cavern') !== -1 || s.indexOf('underground') !== -1) {
      return window.playVoicePackClip('danicek-metro');
    }
    if (s.indexOf('dark mountain tunnel') !== -1 || s.indexOf('dark tunnel') !== -1) {
      return window.playVoicePackClip('danicek-tunnel');
    }
    if (s.indexOf('backing up') !== -1 || s.indexOf('reverse') !== -1) {
      if (nowMs - lastTrainDanSpeechMs < 10000) return false;
      lastTrainDanSpeechMs = nowMs;
      return window.playVoicePackClip('danicek-reverse');
    }
    if (s.indexOf('new wagon') !== -1) {
      lastTrainDanSpeechMs = nowMs;
      return speakDynamicUtterance('train', 'train', 'Yay! We got a new wagon!');
    }
    if (nowMs - lastTrainDanSpeechMs < 9000) return false;
    lastTrainDanSpeechMs = nowMs;
    return speakDynamicUtterance('train', 'train', text);
  }

  // Mom Narrator (~10%): Day/Night transitions & destination direction announcements
  if (role === 'mom') {
    // Sheep on track is handled by the sheep greeting itself
    if (s.indexOf('sheep') !== -1) {
      if (window.trackSheepFlocks && window.playerLoco) {
        for (var si = 0; si < window.trackSheepFlocks.length; si++) {
          var fl = window.trackSheepFlocks[si];
          var shPos = (fl && fl.group) ? fl.group.position : (fl ? fl.basePos : null);
          if (shPos && window.isWorldPosVisibleOnScreen(shPos, 42)) {
            return speakDynamicUtterance('friend', 'sheep', 'Baa, baa! Hello train Dan!');
          }
        }
      }
      return false;
    }

    // Direction switch ("Turning left/right toward...") — throttled so Mom stays ~10%
    if (s.indexOf('turning ') === 0) {
      if (nowMs - lastMomRouteSpeechMs < 15000) return false;
      lastMomRouteSpeechMs = nowMs;
      var cleanDest = String(text || '')
        .replace(/^Turning\s+(left|right|straight)\s+toward\s+/i, '')
        .replace(/^[^\wA-Za-z]+/, '')
        .trim();
      if (cleanDest.toLowerCase().indexOf('anantara') !== -1) {
        return speakDynamicUtterance('mom', 'mom', 'Now heading to the Anantara Hotel in Bangkok!');
      }
      if (cleanDest) {
        return speakDynamicUtterance('mom', 'mom', 'Heading toward ' + cleanDest + '!');
      }
      return false;
    }

    // Station stop announcement
    if (nowMs - lastMomRouteSpeechMs < 14000) return false;
    lastMomRouteSpeechMs = nowMs;
    return window.playVoicePackClip('storyteller-station');
  }

  // Friends (Animals, AI Trains, Stopped Crossing Cars) — MUST be visible on screen!
  if (role === 'friend') {
    // 1) Cow greeting (Daisy the Cow)
    if (sp.indexOf('cow') !== -1 || sp.indexOf('daisy') !== -1) {
      if (!window.daisyTheCow || !window.isWorldPosVisibleOnScreen(window.daisyTheCow.position, 42)) {
        return false;
      }
      return speakDynamicUtterance('friend', 'cow', 'Mooo! Hello train Dan!');
    }

    // 2) AI Train greeting (Bullet Bob / Rusty Steam Friend)
    if (sp.indexOf('bullet') !== -1 || sp.indexOf('rusty') !== -1 || sp.indexOf('shinkansen') !== -1 || sp.indexOf('steam') !== -1) {
      var visibleAi = false;
      if (window.aiTrains) {
        for (var aiIdx = 0; aiIdx < window.aiTrains.length; aiIdx++) {
          var ai = window.aiTrains[aiIdx];
          if (ai && ai.loco && window.isWorldPosVisibleOnScreen(ai.loco.position, 38)) {
            visibleAi = true;
            break;
          }
        }
      }
      if (!visibleAi) return false;
      var shortTrainGreet = (sp.indexOf('bullet') !== -1)
        ? 'Choo choo! Hi train Dan!'
        : 'Toot toot! Hello friend Dan!';
      return speakDynamicUtterance('friend', 'ai_train', shortTrainGreet);
    }

    // 3) Road Car greeting — ONLY if stopped at a crossing AND visible on screen!
    var visibleStoppedCar = false;
    if (window.livingVehicles) {
      for (var vi = 0; vi < window.livingVehicles.length; vi++) {
        var lv = window.livingVehicles[vi];
        if (lv && lv.isStopped && lv.mesh && window.isWorldPosVisibleOnScreen(lv.mesh.position, 42)) {
          visibleStoppedCar = true;
          break;
        }
      }
    }
    if (!visibleStoppedCar) return false;
    return speakDynamicUtterance('friend', 'car', 'Beep beep! Hi train Dan!');
  }

  if (explicitClipKey && window.VOICE_PACK[explicitClipKey]) {
    return window.playVoicePackClip(explicitClipKey);
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

// Collectible chime ONLY (Storyteller 0% — no voice praise on every item pickup)
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
  // Only allow car horn if at least one car stopped at a railway crossing is currently visible on screen!
  if (window.livingVehicles) {
    var hasVisibleStoppedCar = false;
    for (var i = 0; i < window.livingVehicles.length; i++) {
      var lv = window.livingVehicles[i];
      if (lv && lv.isStopped && lv.mesh && window.isWorldPosVisibleOnScreen(lv.mesh.position, 48)) {
        hasVisibleStoppedCar = true;
        break;
      }
    }
    if (!hasVisibleStoppedCar) return;
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
// 2. Replaces models.js showcase narration with balanced Mom (10%) / Train Dan (20%) / Animals (70%)
// 3. Filters automatic train horn calls so off-screen AI trains never honk, and animals greet instead
// 4. Makes visible stopped cars at railway crossings blink headlights & honk at the passing train
// 5. Triggers Mom Narrator on Day <-> Night clock transitions and Anantara Bangkok entry
// ============================================================================
(function installPostLoadSceneCoordinator() {
  function setupCoordinator() {
    if (!window.THREE || !window.scene) {
      setTimeout(setupCoordinator, 100);
      return;
    }
    var THREE = window.THREE;

    // 1) Permanently hide all 3D comic speech bubble sprites above animals & monsters (Requirement 1)
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

    // 2) Override window.triggerEnglishShowcaseNarration (created by models.js) with balanced voice router
    window.triggerEnglishShowcaseNarration = function(focusId) {
      handleShowcaseNarrationBalanced(focusId);
    };

    // 3) Re-apply direct balanced window.speakCharacter
    if (typeof balancedSpeakCharacter === 'function') {
      window.speakCharacter = balancedSpeakCharacter;
    }

    // 4) Wrap window.playTrainHorn (after models.js overwrote it) so:
    //    - Off-screen AI trains never blow the horn
    //    - Rabbit / Squirrel / Owl proximity triggers their short greeting instead of a train whistle
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
      // Always allow user-initiated horn (OK / Enter)
      if (now <= userHornWindowUntil) {
        return modelsPlayTrainHorn.apply(this, arguments);
      }

      // Check if called by game.js AI train pass-by (game.js sets lastFriendChatTime = Date.now() right before playTrainHorn)
      if (typeof window.lastFriendChatTime === 'number' && Math.abs(now - window.lastFriendChatTime) <= 12) {
        var anyVisibleAiNear = false;
        if (window.aiTrains && window.playerLoco) {
          for (var i = 0; i < window.aiTrains.length; i++) {
            var ai = window.aiTrains[i];
            if (
              ai && ai.loco &&
              ai.loco.position.distanceTo(window.playerLoco.position) < 30 &&
              window.isWorldPosVisibleOnScreen(ai.loco.position, 38)
            ) {
              anyVisibleAiNear = true;
              break;
            }
          }
        }
        if (!anyVisibleAiNear) {
          // AI train is off-screen -> block horn and reset cooldown
          window.lastFriendChatTime = 0;
          return;
        }
        return modelsPlayTrainHorn.apply(this, arguments);
      }

      // Check if called by Rabbit, Squirrel, or Owl proximity in models.js:
      // Instead of blowing the train whistle, let the visible animal call out its short greeting!
      if (window._storybookCharId === 'rabbit' || window._storybookCharId === 'squirrel' || window._storybookCharId === 'owl') {
        handleShowcaseNarrationBalanced(window._storybookCharId);
        return;
      }

      return modelsPlayTrainHorn.apply(this, arguments);
    };

    // 5) Per-frame observer for:
    //    - Day / Night transitions (Mom Narrator 10%)
    //    - Entering Bangkok Anantara / IconSiam track edges (Mom Narrator 10%)
    //    - Visible stopped cars at railway crossings: blinking lights + multi-car honking + single-speaker greeting
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
      if (!window.playerLoco || !window.pState) return;

      var now = Date.now();

      // A) Mom Narrator comments on Day <-> Night change
      if (typeof window.gameTimeSeconds === 'number') {
        var hoursFloat = (window.gameTimeSeconds / 300) * 24;
        var isNightNow = (hoursFloat >= 20.0 || hoursFloat < 5.5);
        if (wasNightState === null) {
          wasNightState = isNightNow;
        } else if (isNightNow !== wasNightState) {
          wasNightState = isNightNow;
          if (!window.pState.inSubway && !window.isVoiceCurrentlyPlaying()) {
            lastMomRouteSpeechMs = now;
            if (isNightNow) {
              speakDynamicUtterance('mom', 'mom', 'Good evening! Night is falling and the lights are glowing!');
            } else {
              speakDynamicUtterance('mom', 'mom', 'Good morning! A bright sunny day is starting!');
            }
          }
        }
      }

      // B) Mom Narrator comments when entering major destination tracks (e.g. Anantara in Bangkok)
      var curEdge = window.pState.edge;
      if (curEdge && !curEdge.isTurnout && curEdge.id !== lastAnnouncedEdgeId) {
        lastAnnouncedEdgeId = curEdge.id;
        if (curEdge.id === 'J_NW->J_BKK_ANANTARA' && !window.isVoiceCurrentlyPlaying()) {
          lastMomRouteSpeechMs = now;
          speakDynamicUtterance('mom', 'mom', 'Now you are heading to the Anantara Hotel in Bangkok!');
        } else if (curEdge.id === 'J_BKK_ANANTARA->J_BKK_BRIDGE_E' && !window.isVoiceCurrentlyPlaying() && now - lastMomRouteSpeechMs > 12000) {
          lastMomRouteSpeechMs = now;
          speakDynamicUtterance('mom', 'mom', 'Riding along the river toward IconSiam in Bangkok!');
        }
      }

      // C) Visible Animals Greeting when in camera view (< 22m)
      if (!window.pState.inSubway && !window.isVoiceCurrentlyPlaying()) {
        if (window._storybookCharId && ANIMAL_SHORT_GREETINGS[window._storybookCharId]) {
          handleShowcaseNarrationBalanced(window._storybookCharId);
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
            window.playerLoco.position.distanceTo(lv.mesh.position) < 44
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
