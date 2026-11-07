// ============================================================================
// MODULE 6: CONTROLLER.JS
// 1. Krok 0: Samostatný diagnostický panel pro Samsung Smart TV AU8100 (🔬 TV Test)
// 2. Krok 1: Třívrstvý HappyTrainController (Hardware -> Herní záměr -> Chování)
// 3. Standardní Pointer Events (sjednocený dotyk, myš a tažení bez dvojitých kliků)
// 4. Navigace v horní liště pomocí TV ovladače (◄ ► OK) a nabídka minihry ve stanici
// ============================================================================

(function initHappyTrainControllerSystem() {
  var STORAGE_KEY_TV_BACK_MODE = 'happyTrain_tvBackMode_v1';

  // Varianty chování tlačítka BACK na Samsung TV:
  // 'A' = V minihře/okně zavře okno (Zpět); ve volné jízdě otevře/zavře horní TV lištu (Návrh)
  // 'B' = Vždy pouze Zpět (zavře minihru/menu); horní TV lišta se otevírá podržením OK (0.75 s)
  // 'C' = Vždy pouze Zpět; horní lišta i minihra se nabízejí automaticky při zastavení ve stanici
  var currentBackMode = 'A';
  try {
    var savedMode = window.localStorage ? window.localStorage.getItem(STORAGE_KEY_TV_BACK_MODE) : null;
    if (savedMode === 'A' || savedMode === 'B' || savedMode === 'C') {
      currentBackMode = savedMode;
    }
  } catch (e) {}

  // Diagnostický stav pro Krok 0 (Samsung AU8100 TV Test)
  var diagState = {
    visible: false,
    historyTrapEnabled: false,
    logs: []
  };

  function formatTimeNow() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    var ss = String(d.getSeconds()).padStart(2, '0');
    var ms = String(d.getMilliseconds()).padStart(3, '0');
    return hh + ':' + mm + ':' + ss + '.' + ms;
  }

  function addDiagLog(type, detail) {
    var entry = '[' + formatTimeNow() + '] ' + type + ' → ' + detail;
    diagState.logs.unshift(entry);
    if (diagState.logs.length > 10) {
      diagState.logs.pop();
    }
    renderDiagLogs();
  }

  function renderDiagLogs() {
    var logEl = document.getElementById('tv-diag-log-list');
    if (!logEl) return;
    if (diagState.logs.length === 0) {
      logEl.innerHTML = '<div style="color:#94a3b8;">Stiskni libovolné tlačítko na ovladači Samsung TV (např. BACK, OK, šipky)...</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < diagState.logs.length; i++) {
      var isFirst = (i === 0);
      html += '<div style="padding:4px 8px; border-radius:6px; margin-bottom:4px; background:' +
        (isFirst ? 'rgba(250, 204, 21, 0.22)' : 'rgba(15, 23, 42, 0.55)') +
        '; border-left:3px solid ' + (isFirst ? '#facc15' : '#38bdf8') + '; font-family:monospace; font-size:13px; color:' +
        (isFirst ? '#fef08a' : '#e2e8f0') + ';">' + diagState.logs[i] + '</div>';
    }
    logEl.innerHTML = html;
  }

  // Rozpoznání klávesy BACK napříč Samsung Tizen TV (10009), WebOS (461), Android TV a PC
  function isHardwareBackKey(e) {
    if (!e) return false;
    var k = e.key || '';
    var code = e.code || '';
    var kc = e.keyCode || e.which || 0;
    if (
      kc === 10009 || // Samsung Tizen TV Return / Back keyCode
      kc === 461 ||   // LG WebOS Back keyCode
      kc === 27 ||    // Escape
      kc === 8 ||     // Backspace
      k === 'Escape' ||
      k === 'Backspace' ||
      k === 'BrowserBack' ||
      k === 'GoBack' ||
      k === 'XF86Back' ||
      code === 'BrowserBack' ||
      code === 'Escape'
    ) {
      return true;
    }
    return false;
  }

  function isConfirmKey(e) {
    if (!e) return false;
    var k = e.key || '';
    var kc = e.keyCode || e.which || 0;
    return (
      k === 'Enter' ||
      k === ' ' ||
      k === 'Select' ||
      kc === 13 ||
      kc === 32 ||
      kc === 29443 // Samsung TV Enter/OK variant on older Tizen
    );
  }

  function getDirectionFromKey(e) {
    if (!e) return null;
    var k = e.key || '';
    var kc = e.keyCode || e.which || 0;
    if (k === 'ArrowUp' || kc === 38) return 'UP';
    if (k === 'ArrowDown' || kc === 40) return 'DOWN';
    if (k === 'ArrowLeft' || kc === 37) return 'LEFT';
    if (k === 'ArrowRight' || kc === 39) return 'RIGHT';
    return null;
  }

  // ==========================================================================
  // VLOŽENÍ STYLŮ A UI PRVKŮ (TV Fokus, Diagnostický panel, Nabídka ve stanici)
  // ==========================================================================
  function injectControllerStylesAndDom() {
    if (!document.getElementById('happy-train-controller-styles')) {
      var st = document.createElement('style');
      st.id = 'happy-train-controller-styles';
      st.textContent = [
        '/* TV D-Pad Focus Ring pro horní lištu a modální tlačítka */',
        '.tv-focus-active {',
        '  outline: 4px solid #facc15 !important;',
        '  outline-offset: 3px !important;',
        '  box-shadow: 0 0 22px rgba(250, 204, 21, 0.95), 0 0 8px #ffffff !important;',
        '  transform: scale(1.08) !important;',
        '  z-index: 35 !important;',
        '}',
        '#top-bar.tv-menu-open {',
        '  border-color: #38bdf8 !important;',
        '  box-shadow: 0 0 32px rgba(56, 189, 248, 0.75), 0 12px 28px rgba(0,0,0,0.65) !important;',
        '}',
        '#tv-menu-banner {',
        '  position: fixed;',
        '  top: 66px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  background: rgba(15, 23, 42, 0.94);',
        '  border: 2.5px solid #38bdf8;',
        '  color: #fef08a;',
        '  padding: 6px 18px;',
        '  border-radius: 14px;',
        '  font-size: 14px;',
        '  font-weight: 900;',
        '  z-index: 30;',
        '  display: none;',
        '  box-shadow: 0 8px 20px rgba(0,0,0,0.5);',
        '  pointer-events: none;',
        '}',
        '#tv-menu-banner.show { display: block; }',
        '',
        '/* Nabídka minihry po zastavení ve stanici */',
        '#station-minigame-prompt {',
        '  position: fixed;',
        '  bottom: 182px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.95));',
        '  border: 3.5px solid #facc15;',
        '  border-radius: 24px;',
        '  padding: 12px 22px;',
        '  color: #ffffff;',
        '  display: none;',
        '  align-items: center;',
        '  gap: 16px;',
        '  z-index: 28;',
        '  box-shadow: 0 12px 32px rgba(0,0,0,0.65);',
        '  touch-action: none;',
        '}',
        '#station-minigame-prompt.show {',
        '  display: flex;',
        '  animation: stationPromptPop 0.25s ease-out;',
        '}',
        '@keyframes stationPromptPop {',
        '  0% { transform: translateX(-50%) scale(0.86); opacity: 0; }',
        '  100% { transform: translateX(-50%) scale(1); opacity: 1; }',
        '}',
        '.station-prompt-btn {',
        '  background: linear-gradient(135deg, #4ade80, #22c55e);',
        '  color: #052e16;',
        '  border: 2.5px solid #fef08a;',
        '  padding: 8px 16px;',
        '  border-radius: 14px;',
        '  font-size: 15px;',
        '  font-weight: 900;',
        '  cursor: pointer;',
        '  touch-action: none;',
        '}',
        '.station-prompt-close {',
        '  background: rgba(255,255,255,0.14);',
        '  color: #e2e8f0;',
        '  border: 2px solid rgba(255,255,255,0.3);',
        '  padding: 7px 12px;',
        '  border-radius: 12px;',
        '  font-size: 13px;',
        '  font-weight: 800;',
        '  cursor: pointer;',
        '  touch-action: none;',
        '}',
        '',
        '/* Krok 0: Diagnostický panel pro Samsung AU8100 */',
        '#tv-diag-panel {',
        '  position: fixed;',
        '  top: 72px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  width: 94vw;',
        '  max-width: 780px;',
        '  background: rgba(15, 23, 42, 0.96);',
        '  border: 3px solid #38bdf8;',
        '  border-radius: 22px;',
        '  padding: 18px 22px;',
        '  color: #f8fafc;',
        '  z-index: 95;',
        '  display: none;',
        '  box-shadow: 0 20px 50px rgba(0,0,0,0.8);',
        '  touch-action: none;',
        '}',
        '#tv-diag-panel.show { display: block; }',
        '.diag-btn {',
        '  background: #1e293b;',
        '  color: #e2e8f0;',
        '  border: 2px solid #475569;',
        '  padding: 6px 12px;',
        '  border-radius: 10px;',
        '  font-size: 12px;',
        '  font-weight: 800;',
        '  cursor: pointer;',
        '  touch-action: none;',
        '}',
        '.diag-btn.active {',
        '  background: #0284c7;',
        '  color: #ffffff;',
        '  border-color: #fde047;',
        '}',
        '@media (max-width: 920px) {',
        '  #station-minigame-prompt {',
        '    bottom: 162px;',
        '    padding: 8px 14px;',
        '    width: 92vw;',
        '    justify-content: space-between;',
        '  }',
        '  #open-minigame-btn, #open-tv-diag-btn {',
        '    padding: 4px 7px !important;',
        '    font-size: 11px !important;',
        '    border-radius: 8px !important;',
        '    white-space: nowrap !important;',
        '  }',
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(st);
    }

    // Informační proužek při otevřené horní TV liště
    if (!document.getElementById('tv-menu-banner') && document.body) {
      var banner = document.createElement('div');
      banner.id = 'tv-menu-banner';
      banner.setAttribute('data-controller-ui', 'true');
      banner.textContent = '📺 TV MENU: Šipkami ◄ ► vyber tlačítko, stiskni OK pro potvrzení, nebo ▼ / BACK pro návrat k jízdě';
      document.body.appendChild(banner);
    }

    // Nabídka minihry ve stanici
    if (!document.getElementById('station-minigame-prompt') && document.body) {
      var promptEl = document.createElement('div');
      promptEl.id = 'station-minigame-prompt';
      promptEl.setAttribute('data-controller-ui', 'true');
      promptEl.innerHTML = [
        '<div>',
        '  <div id="station-prompt-title" style="font-size:15px; font-weight:900; color:#fde047;">🚏 Zastávka ve stanici!</div>',
        '  <div style="font-size:12px; color:#cbd5e1; font-weight:700;">Chceš si tady zahrát skákací minihru <b>Samá díra</b>?</div>',
        '</div>',
        '<div style="display:flex; gap:8px; align-items:center;">',
        '  <button type="button" class="station-prompt-btn" id="station-play-minigame-btn" data-controller-ui="true">🎮 Hrát Samá díra</button>',
        '  <button type="button" class="station-prompt-close" id="station-dismiss-prompt-btn" data-controller-ui="true">✖ Jet dál</button>',
        '</div>'
      ].join('');
      document.body.appendChild(promptEl);

      var playBtn = document.getElementById('station-play-minigame-btn');
      var dismissBtn = document.getElementById('station-dismiss-prompt-btn');

      if (playBtn) {
        playBtn.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          hideStationMinigamePrompt();
          if (window.HappyTrainMinigames) {
            window.HappyTrainMinigames.launch('sama_dira', { source: 'station' });
          }
        });
      }
      if (dismissBtn) {
        dismissBtn.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          hideStationMinigamePrompt();
        });
      }
    }

    // Krok 0: Diagnostický panel pro Samsung AU8100
    if (!document.getElementById('tv-diag-panel') && document.body) {
      var diag = document.createElement('div');
      diag.id = 'tv-diag-panel';
      diag.setAttribute('data-controller-ui', 'true');
      diag.innerHTML = [
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">',
        '  <div>',
        '    <div style="font-size:17px; font-weight:900; color:#38bdf8;">🔬 Krok 0: Diagnostika ovladače Samsung Smart TV AU8100</div>',
        '    <div style="font-size:12px; color:#cbd5e1;">Stiskni na TV ovladači tlačítko <b>BACK / Return</b>, šipky nebo <b>OK</b> a sleduj výpis níže.</div>',
        '  </div>',
        '  <button type="button" class="diag-btn" id="tv-diag-close-btn" data-controller-ui="true" style="background:#ef4444; color:#fff; border-color:#fca5a5;">✖ Zavřít test</button>',
        '</div>',
        '',
        '<div style="background:rgba(234, 179, 8, 0.12); border:1.5px solid rgba(250, 204, 21, 0.45); padding:8px 12px; border-radius:12px; font-size:12px; color:#fef08a; margin-bottom:10px;">',
        '  ⚠️ <b>Upozornění pro Tizen OS (Samsung AU8100):</b> Dlouhé podržení tlačítka BACK nebo systémové gesto prohlížeče může být zachyceno přímo televizorem dříve, než dorazí do hry. Zde vidíš, které události prohlížeč TV skutečně předává.',
        '</div>',
        '',
        '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:10px;">',
        '  <span style="font-size:12px; font-weight:900; color:#94a3b8;">Režim tlačítka BACK:</span>',
        '  <button type="button" class="diag-btn" id="back-mode-a" data-controller-ui="true">Varianta A: BACK otevírá TV lištu / Zpět</button>',
        '  <button type="button" class="diag-btn" id="back-mode-b" data-controller-ui="true">Varianta B: BACK vždy jen Zpět (Menu = podržet OK)</button>',
        '  <button type="button" class="diag-btn" id="back-mode-c" data-controller-ui="true">Varianta C: Nabídka ve stanici + dotyková lišta</button>',
        '</div>',
        '',
        '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">',
        '  <button type="button" class="diag-btn" id="toggle-history-trap-btn" data-controller-ui="true">🛡️ Test history.pushState: VYPNUTO</button>',
        '  <button type="button" class="diag-btn" id="clear-diag-log-btn" data-controller-ui="true">🧹 Vymazat výpis</button>',
        '</div>',
        '',
        '<div id="tv-diag-log-list" style="max-height:210px; overflow-y:auto; background:rgba(2, 6, 23, 0.75); padding:8px; border-radius:12px; border:1px solid #334155;"></div>'
      ].join('');
      document.body.appendChild(diag);

      var closeBtn = document.getElementById('tv-diag-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.toggleTvDiagnosticsPanel(false);
        });
      }

      var modeABtn = document.getElementById('back-mode-a');
      var modeBBtn = document.getElementById('back-mode-b');
      var modeCBtn = document.getElementById('back-mode-c');
      function syncBackModeButtons() {
        if (modeABtn) modeABtn.classList.toggle('active', currentBackMode === 'A');
        if (modeBBtn) modeBBtn.classList.toggle('active', currentBackMode === 'B');
        if (modeCBtn) modeCBtn.classList.toggle('active', currentBackMode === 'C');
      }
      function setBackMode(m) {
        currentBackMode = m;
        try {
          if (window.localStorage) window.localStorage.setItem(STORAGE_KEY_TV_BACK_MODE, m);
        } catch (err) {}
        syncBackModeButtons();
        addDiagLog('CONFIG', 'Nastavena Varianta ' + m + ' pro tlačítko BACK');
      }
      if (modeABtn) modeABtn.addEventListener('pointerdown', function(e) { e.preventDefault(); e.stopPropagation(); setBackMode('A'); });
      if (modeBBtn) modeBBtn.addEventListener('pointerdown', function(e) { e.preventDefault(); e.stopPropagation(); setBackMode('B'); });
      if (modeCBtn) modeCBtn.addEventListener('pointerdown', function(e) { e.preventDefault(); e.stopPropagation(); setBackMode('C'); });
      syncBackModeButtons();

      var trapBtn = document.getElementById('toggle-history-trap-btn');
      if (trapBtn) {
        trapBtn.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          diagState.historyTrapEnabled = !diagState.historyTrapEnabled;
          trapBtn.classList.toggle('active', diagState.historyTrapEnabled);
          trapBtn.textContent = '🛡️ Test history.pushState: ' + (diagState.historyTrapEnabled ? 'ZAPNUTO' : 'VYPNUTO');
          if (diagState.historyTrapEnabled && window.history && window.history.pushState) {
            try {
              window.history.pushState({ happyTrainGuard: true }, '', window.location.href);
              addDiagLog('HISTORY', 'Vložena zarážka history.pushState()');
            } catch (err) {
              addDiagLog('HISTORY_ERR', String(err));
            }
          }
        });
      }

      var clearBtn = document.getElementById('clear-diag-log-btn');
      if (clearBtn) {
        clearBtn.addEventListener('pointerdown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          diagState.logs = [];
          renderDiagLogs();
        });
      }

      renderDiagLogs();
    }
  }

  window.toggleTvDiagnosticsPanel = function(forceState) {
    injectControllerStylesAndDom();
    var panel = document.getElementById('tv-diag-panel');
    if (!panel) return;
    diagState.visible = (typeof forceState === 'boolean') ? forceState : !diagState.visible;
    panel.classList.toggle('show', diagState.visible);
    if (diagState.visible) {
      addDiagLog('INFO', 'Diagnostický panel otevřen (Samsung AU8100 test připraven)');
    }
  };

  // ==========================================================================
  // NAVIGACE V HORNÍ LIŠTĚ POMOCÍ TV OVLADAČE (ŠIPKY ◄ ► A TLAČÍTKO OK)
  // ==========================================================================
  var tvMenuState = {
    isOpen: false,
    focusIndex: 0
  };

  function getTopBarFocusableButtons() {
    var topBar = document.getElementById('top-bar');
    if (!topBar) return [];
    var allBtns = topBar.querySelectorAll('button');
    var visibleBtns = [];
    for (var i = 0; i < allBtns.length; i++) {
      var b = allBtns[i];
      var rect = b.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        visibleBtns.push(b);
      }
    }
    return visibleBtns;
  }

  function clearTopBarFocusVisuals() {
    var btns = document.querySelectorAll('.tv-focus-active');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove('tv-focus-active');
    }
  }

  function openTvTopMenu() {
    injectControllerStylesAndDom();
    var btns = getTopBarFocusableButtons();
    if (btns.length === 0) return;
    tvMenuState.isOpen = true;
    // Preferujeme tlačítko minihry Samá díra jako první rychlou volbu
    var minigameBtnIdx = 0;
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].id === 'open-minigame-btn') {
        minigameBtnIdx = i;
        break;
      }
    }
    tvMenuState.focusIndex = minigameBtnIdx;
    var topBar = document.getElementById('top-bar');
    if (topBar) topBar.classList.add('tv-menu-open');
    var banner = document.getElementById('tv-menu-banner');
    if (banner) banner.classList.add('show');
    syncTvTopMenuFocus();
  }

  function closeTvTopMenu() {
    tvMenuState.isOpen = false;
    clearTopBarFocusVisuals();
    var topBar = document.getElementById('top-bar');
    if (topBar) topBar.classList.remove('tv-menu-open');
    var banner = document.getElementById('tv-menu-banner');
    if (banner) banner.classList.remove('show');
  }

  function syncTvTopMenuFocus() {
    clearTopBarFocusVisuals();
    if (!tvMenuState.isOpen) return;
    var btns = getTopBarFocusableButtons();
    if (btns.length === 0) return;
    tvMenuState.focusIndex = ((tvMenuState.focusIndex % btns.length) + btns.length) % btns.length;
    var targetBtn = btns[tvMenuState.focusIndex];
    if (targetBtn) {
      targetBtn.classList.add('tv-focus-active');
    }
  }

  // ==========================================================================
  // NABÍDKA MINIHRY VE STANICI
  // ==========================================================================
  var stationPromptTimer = null;
  var stationPromptVisible = false;

  function showStationMinigamePrompt(stationName) {
    // Minigames are exclusively available inside the Magic Castle
    hideStationMinigamePrompt();
    return;
  }

  function hideStationMinigamePrompt() {
    clearTimeout(stationPromptTimer);
    stationPromptVisible = false;
    var promptEl = document.getElementById('station-minigame-prompt');
    if (promptEl) promptEl.classList.remove('show');
  }

  // ==========================================================================
  // TŘÍVRSTVÁ ARCHITEKTURA: HAPPY TRAIN CONTROLLER
  // ==========================================================================
  var okLongPressTimer = null;
  var okLongPressTriggered = false;
  var activePointerId = null;
  var lastPointerInvokeMs = 0;

  // Zjištění aktivního kontextu hry
  function getActiveContext() {
    var settingsModal = document.getElementById('settings-modal');
    if (settingsModal && settingsModal.classList.contains('show')) {
      return 'SETTINGS_MODAL';
    }
    var gateModal = document.getElementById('gate-modal');
    if (gateModal && gateModal.classList.contains('show')) {
      return 'GATE_MODAL';
    }
    if (window.HappyTrainMinigames && window.HappyTrainMinigames.isActive()) {
      return 'MINIGAME';
    }
    if (tvMenuState.isOpen) {
      return 'TOP_MENU';
    }
    return '3D_WORLD';
  }

  // Vrstva 3: Zpracování herního záměru podle aktivního kontextu
  function dispatchGameAction(action, payload) {
    var ctx = getActiveContext();

    // 1. Pokud je otevřená minihra (např. Samá díra)
    if (ctx === 'MINIGAME') {
      if (action === 'BACK') {
        window.HappyTrainMinigames.closeActive();
        return true;
      }
      return window.HappyTrainMinigames.handleAction(action, payload);
    }

    // 2. Pokud je otevřené okno nastavení jména
    if (ctx === 'SETTINGS_MODAL') {
      if (action === 'BACK') {
        if (typeof window.closeSettingsModal === 'function') window.closeSettingsModal();
        return true;
      }
      if (action === 'CONFIRM') {
        if (typeof window.saveSettingsFromModal === 'function') window.saveSettingsFromModal();
        return true;
      }
      return false;
    }

    // 3. Pokud je otevřená brána na konci mapy
    if (ctx === 'GATE_MODAL') {
      if (action === 'BACK' || action === 'DOWN' || action === 'LEFT') {
        if (typeof window.reverseFromGate === 'function') window.reverseFromGate();
        return true;
      }
      if (action === 'CONFIRM') {
        if (typeof window.unlockGateWorld === 'function') window.unlockGateWorld();
        return true;
      }
      return false;
    }

    // 4. Pokud je aktivní horní TV lišta
    if (ctx === 'TOP_MENU') {
      if (action === 'LEFT') {
        tvMenuState.focusIndex--;
        syncTvTopMenuFocus();
        return true;
      }
      if (action === 'RIGHT') {
        tvMenuState.focusIndex++;
        syncTvTopMenuFocus();
        return true;
      }
      if (action === 'DOWN' || action === 'BACK') {
        closeTvTopMenu();
        return true;
      }
      if (action === 'CONFIRM') {
        var btns = getTopBarFocusableButtons();
        var activeBtn = btns[tvMenuState.focusIndex];
        closeTvTopMenu();
        if (activeBtn) {
          activeBtn.click();
        }
        return true;
      }
      return true;
    }

    // 5. Hlavní 3D svět (volná jízda vláčkem)
    if (action === 'BACK') {
      if (diagState.visible) {
        window.toggleTvDiagnosticsPanel(false);
        return true;
      }
      if (stationPromptVisible) {
        hideStationMinigamePrompt();
        return true;
      }
      if (currentBackMode === 'A') {
        openTvTopMenu();
        return true;
      }
      return false;
    }

    if (action === 'UP') {
      hideStationMinigamePrompt();
      if (typeof window.handleInput === 'function') window.handleInput('ArrowUp');
      return true;
    }
    if (action === 'DOWN') {
      if (typeof window.handleInput === 'function') window.handleInput('ArrowDown');
      return true;
    }
    if (action === 'LEFT') {
      if (typeof window.handleInput === 'function') window.handleInput('ArrowLeft');
      return true;
    }
    if (action === 'RIGHT') {
      if (typeof window.handleInput === 'function') window.handleInput('ArrowRight');
      return true;
    }
    if (action === 'CONFIRM') {
      if (typeof window.handleInput === 'function') window.handleInput('Enter');
      return true;
    }

    return false;
  }

  // ==========================================================================
  // VRSTVA 1: FYZICKÉ VSTUPY (KLÁVESNICE, SAMSUNG TV OVLADAČ A POINTER EVENTS)
  // ==========================================================================
  function installHardwareListeners() {
    // Capture-phase keydown listener:
    // Zajišťuje diagnostiku pro Samsung AU8100 a přesměrování vstupů do minihry nebo TV menu
    window.addEventListener('keydown', function(e) {
      var activeTag = (document.activeElement && document.activeElement.tagName)
        ? document.activeElement.tagName.toUpperCase()
        : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      var kc = e.keyCode || e.which || 0;
      var k = e.key || '';
      var code = e.code || '';

      // Запись do diagnostického panelu (Krok 0)
      if (diagState.visible || isHardwareBackKey(e)) {
        addDiagLog(
          'KEYDOWN',
          'key="' + k + '" code="' + code + '" keyCode=' + kc + (isHardwareBackKey(e) ? ' [BACK ROZPOZNÁN]' : '')
        );
      }

      // 1) Tlačítko BACK na Samsung TV / Escape / Backspace
      if (isHardwareBackKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        dispatchGameAction('BACK', { originalEvent: e });
        return;
      }

      var ctx = getActiveContext();

      // 2) Pokud běží minihra nebo horní TV lišta, převezmeme šipky a OK dříve, než pohnou 3D vlakem
      if (ctx === 'MINIGAME' || ctx === 'TOP_MENU') {
        var dir = getDirectionFromKey(e);
        if (dir) {
          e.preventDefault();
          e.stopPropagation();
          dispatchGameAction(dir === 'UP' && ctx === 'MINIGAME' ? 'JUMP' : dir, { originalEvent: e });
          return;
        }
        if (isConfirmKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          dispatchGameAction(ctx === 'MINIGAME' ? 'JUMP' : 'CONFIRM', { originalEvent: e });
          return;
        }
      }

      // 3) Podpora dlouhého stisku OK (Varianta B pro otevření horní lišty na TV)
      if (ctx === '3D_WORLD' && isConfirmKey(e) && !e.repeat) {
        okLongPressTriggered = false;
        clearTimeout(okLongPressTimer);
        if (currentBackMode === 'B') {
          okLongPressTimer = setTimeout(function() {
            okLongPressTriggered = true;
            openTvTopMenu();
          }, 750);
        }
      }
    }, true);

    window.addEventListener('keyup', function(e) {
      clearTimeout(okLongPressTimer);
      if (diagState.visible) {
        var kc = e.keyCode || e.which || 0;
        addDiagLog('KEYUP', 'key="' + (e.key || '') + '" keyCode=' + kc);
      }
      if (window.HappyTrainMinigames && window.HappyTrainMinigames.getActiveId && window.HappyTrainMinigames.getActiveId() === 'train_wash') {
        window.HappyTrainMinigames.handleAction('KEY_UP', { originalEvent: e });
      }
    }, true);

    // Diagnostika popstate (pokud Samsung TV prohlížeč zkusí krok zpět v historii)
    window.addEventListener('popstate', function(e) {
      addDiagLog('POPSTATE', 'Prohlížeč vyvolal popstate (návrat v historii)');
      if (diagState.historyTrapEnabled && window.history && window.history.pushState) {
        try {
          window.history.pushState({ happyTrainGuard: true }, '', window.location.href);
        } catch (err) {}
      }
      dispatchGameAction('BACK', { source: 'popstate', originalEvent: e });
    });

    // Sjednocené Pointer Events na kruhovém ovladači (#remote-wheel-hud)
    // Zabraňuje dvojitým akcím (touchstart + click)
    function upgradeRemoteWheelToPointerEvents() {
      var wheel = document.getElementById('remote-wheel-hud');
      if (!wheel || wheel._pointerUpgraded) return;
      wheel._pointerUpgraded = true;
      wheel.style.touchAction = 'none';

      var buttons = wheel.querySelectorAll('button[data-key]');
      for (var i = 0; i < buttons.length; i++) {
        (function(btn) {
          btn.style.touchAction = 'none';
          var keyName = btn.getAttribute('data-key');
          btn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            lastPointerInvokeMs = Date.now();
            btn.classList.add('active-press');
            setTimeout(function() {
              btn.classList.remove('active-press');
            }, 150);

            // Pokud běží 2D minihra (např. Samá díra), předáme akci přímo minihře
            // a NEVOLÁME window.handleInput (aby mašinka v 3D světě nehoukala!)
            if (window.HappyTrainMinigames && window.HappyTrainMinigames.isActive()) {
              var mgAction =
                (keyName === 'ArrowUp' || keyName === 'Enter') ? 'JUMP' :
                (keyName === 'ArrowDown') ? 'DOWN' :
                (keyName === 'ArrowLeft') ? 'LEFT' :
                (keyName === 'ArrowRight') ? 'RIGHT' : 'CONFIRM';
              dispatchGameAction(mgAction, { source: 'wheel-hud', key: keyName, originalEvent: e });
              return;
            }

            // Pokud je vláček uvnitř Zámku tisíce dobrodružství, ovládání řeší castle.js
            if (window.HappyTrainCastle && (window.HappyTrainCastle.isInside || window.HappyTrainCastle.isTransitioning)) {
              return;
            }

            if (typeof window.handleInput === 'function') {
              window.handleInput(keyName);
            }
            if (typeof window.syncCornerSpeedAndSwitchHud === 'function') {
              window.syncCornerSpeedAndSwitchHud(false);
            }
          }, { passive: false });
        })(buttons[i]);
      }
    }

    if (document.body) {
      injectControllerStylesAndDom();
      upgradeRemoteWheelToPointerEvents();
    } else {
      window.addEventListener('DOMContentLoaded', function() {
        injectControllerStylesAndDom();
        upgradeRemoteWheelToPointerEvents();
      });
    }
  }

  installHardwareListeners();

  // Veřejné API controlleru
  window.HappyTrainController = {
    getActiveContext: getActiveContext,
    dispatchAction: dispatchGameAction,
    openTvTopMenu: openTvTopMenu,
    closeTvTopMenu: closeTvTopMenu,
    onStationArrival: function(stationName) {
      showStationMinigamePrompt(stationName);
    },
    hideStationPrompt: hideStationMinigamePrompt,
    addDiagLog: addDiagLog,
    // Pomocník pro registraci čistých Pointer Events na 2D plátně minihry
    // Zaručuje, že dotyk na tlačítko Zpět ([data-minigame-ui]) NIKDY nevyvolá skok!
    bindMinigameCanvasPointerEvents: function(canvasEl, callbacks) {
      if (!canvasEl) return;
      canvasEl.style.touchAction = 'none';
      canvasEl.style.userSelect = 'none';
      canvasEl.style.webkitUserSelect = 'none';

      canvasEl.addEventListener('pointerdown', function(e) {
        // Ochrana: Pokud uživatel klepl na UI prvek (např. tlačítko Zpět), ignoruj herní akci!
        if (e.target && e.target.closest && e.target.closest('[data-minigame-ui], [data-controller-ui]')) {
          return;
        }
        e.preventDefault();
        activePointerId = e.pointerId;
        try {
          if (canvasEl.setPointerCapture) canvasEl.setPointerCapture(e.pointerId);
        } catch (err) {}

        var rect = canvasEl.getBoundingClientRect();
        var normX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
        var normY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

        if (callbacks && typeof callbacks.onPointerDown === 'function') {
          callbacks.onPointerDown({ x: normX, y: normY, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId });
        }
      }, { passive: false });

      canvasEl.addEventListener('pointermove', function(e) {
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        if (callbacks && typeof callbacks.onPointerMove === 'function') {
          var rect = canvasEl.getBoundingClientRect();
          var normX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
          var normY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;
          callbacks.onPointerMove({ x: normX, y: normY, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId });
        }
      }, { passive: false });

      function handleEnd(e) {
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        activePointerId = null;
        if (callbacks && typeof callbacks.onPointerUp === 'function') {
          callbacks.onPointerUp({ pointerId: e.pointerId });
        }
      }

      canvasEl.addEventListener('pointerup', handleEnd, { passive: false });
      canvasEl.addEventListener('pointercancel', handleEnd, { passive: false });
    }
  };
})();
