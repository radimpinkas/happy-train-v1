# HAPPY TRAIN: ARCHITEKTONICKÁ ANALÝZA A NÁVRH 5 NOVÝCH MINIHER (REVIZE DLE ZÁVAZNÝCH PRAVIDEL)

Tento dokument obsahuje schválenou **Fázi A (Analýza současného stavu projektu)**, **Fázi B (Návrh 5 nových miniher)** a **zapracování všech 7 závazných pravidel** pro okamžitou realizaci první minihry **Happy Train Wash** (`minigame_wash.js`).

> [!IMPORTANT]
> **Zapracovaná závazná pravidla pro vývoj Happy Train Wash (Fáze C):**
> 1. **100% bez mluvených a psaných komentářů během hraní:** V minihře nebudou žádné hlasové hlášky (*"Great job!"*, *"Bubble!"* apod.), žádné textové instrukce ani nápisy hodnocení. Dítě (4–6 let) vše pochopí čistě z animací, výrazů obličeje mašinky, pohybových nápověd a přirozených zvuků (šplouchání vody, praskání bublin, smích/zahihňání mašinky, pšiknutí, houkání a oslavná melodie).
> 2. **Oslava už při vyčištění většiny špíny (~80 %) bez nutnosti 100% dočištění:** Dítě nemusí hledat poslední zapomenutý kousek špíny nebo pěny. Jakmile vyčistí přibližně **80 %** v daném kroku, zbytek drobných nečistot se sám kouzelně dočistí v záblesku hvězdiček a spustí se radostná oslava. Dítě může v mytí a zdobení libovolně pokračovat bez jakékoliv penalizace.
> 3. **Samolepky a prověření bezpečného přenosu do hlavního 3D světa:**
>    - **Výsledek technického prověření `models.js` a `game.js`:** Hlavní 3D mašinka v `game.js` (ř. 7: `var playerLoco = createDetailedLocomotive(...)`) je globální `THREE.Group`. Přímá úprava `models.js` by porušila pravidlo nulového zásahu do stávajících modelů.
>    - **Zvolené 100% bezpečné řešení (bez jediného řádku změny v `models.js` a `game.js`):**
>      1. **Trvalá paměť v myčce (`localStorage`):** Vybrané samolepky se uloží do `localStorage` (`happyTrain_washStickers`) a zobrazují se na mašince při každé další návštěvě myčky i na živém 3D billboardu nad Bránou č. 4 v Zámku.
>      2. **Neinvazivní připnutí 3D samolepky z `minigame_wash.js`:** Přímo ze souboru `minigame_wash.js` připojíme na `window.playerLoco` lehkou podskupinu `THREE.Group` (`name: 'washStickerBadges'`) se dvěma malými 2D `CanvasTexture` plackami na bočnicích kabiny (`x = ±2.06, y = 3.45, z = -2.35`). Toto řešení **nemění žádný stávající soubor modelu, materiál ani animaci kol či kouře** a v případě potřeby lze jediným příkazem vypnout.
> 4. **Maximálně tolerantní ovládání pro Samsung Smart TV ovladač:** Aktivní nástroj (houba, sprcha, leštička) má velký akční poloměr (`~18 %` šířky plátna) a při stisku šipek (`◀ ▶ ▲ ▼`) využívá **inteligentní magnetické přitahování (Soft-Magnet Assist)** k nejbližšímu špinavému nebo namydlenému místu na mašince. Ze vzdálenosti 3 metrů u TV tak dítě nemusí přesně mířit — stačí mačkat šipky nebo `OK / Enter` (které spustí velký plošný šplouch/bublinkovou vlnu).
> 5. **Kultivované zvuky bez překrývání (Anti-Spam Throttling):** Využijeme výhradně existující `window.audioCtx` a `window.playSound` z `audio.js` (nevytváříme druhý `AudioContext`). Každý typ zvukového efektu v myčce bude mít minimální odstup (`cooldown 180–350 ms`) a sníženou, příjemnou hlasitost, aby při rychlém mačkání tlačítek nebo rychlém tažení prstem nikdy nedošlo k přehlušení nebo vrstvení zvuků.
> 6. **Bezpečnost změn a záloha:** Před vytvořením `minigame_wash.js` ověříme čistý stav přes `git status` / zálohu změn. Soubor `minigames.js` (hra **Samá díra**), `tracks.js`, `models.js`, `audio.js`, `controller.js` a `game.js` zůstanou bez jakéhokoliv zásahu do herní logiky.
> 7. **Transparentní testování:** Po dokončení provedeme kontrolu spuštění, ukončení, opakovaného spuštění, návratu do rondelu Zámku i ovládání a v závěrečné zprávě přesně oddělíme, co bylo reálně otestováno v běhovém prostředí a co je ověřeno simulací událostí.

---

## FÁZE A — ARCHITEKTURA A NAPOJENÍ DO EXISTUJÍCÍHO SYSTÉMU

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ZÁMEK TISÍCE DOBRODRUŽSTVÍ                        │
│              castle.js -> CASTLE_STOPS[5] ('train_wash')                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Enter / OK u Brány č. 4
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  minigames.js (HappyTrainMinigames)                     │
│  • launch('train_wash') -> window.pauseMainWorld()                      │
│  • Skryje #minigame-laser-btn (zobrazuje se jen pro 'sama_dira')        │
│  • Spustí 2D canvas smyčku (#minigame-canvas)                           │
└─────────────────┬─────────────────────────────────────┬─────────────────┘
                  │                                     │
                  ▼                                     ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│   controller.js (Vstupy hráče)    │ │  minigame_wash.js (NOVÝ SOUBOR)   │
│ • Samsung TV D-Pad (◀ ▶ ▲ ▼, OK)  │ │ • 3 kroky: Houba -> Sprcha -> Lesk│
│ • Tlačítko BACK (10009 / 461 /Esc)│ │ • Tolerantní magnetický kurzor    │
│ • Dotyk / Myš (PointerEvents)     │ │ • Automatické dočištění při ~80 % │
└───────────────────────────────────┘ │ • Samolepky + tiché WebAudio FX   │
                                      └───────────────────────────────────┘
```

---

## FÁZE B — PŘEHLED 5 NOVÝCH MINIHER A POŘADÍ VÝVOJE

1. **Happy Train Wash (`train_wash` — `minigame_wash.js`) — VYVÍJÍME NYNÍ JAKO PRVNÍ**
   - **Princip:** Veselá myčka mašinek ve 3 plynulých vizuálních krocích (1. Mýdlová houba a bubliny -> 2. Vodní sprcha -> 3. Hvězdičkové leštění a samolepky).
   - **Bez textu a bez mluvení:** Ukazovátko (animovaná ruka/šipka) na začátku krátce předvede pohyb houbou. Mašinka reaguje očima, úsměvem, lechtivým smíchem a pšikáním bublinek.
   - **Práh dokončení ~80 %:** Jakmile je vyčištěna většina skvrn (~80 %), zbytek se sám dočistí, spustí se oslava s konfetami a dítě může lepit samolepky nebo přivolat další vtipně ušpiněnou mašinku.
2. **Happy Train Music Studio (`music_studio` — `minigame_music.js`)** — *Následuje jako 2. v pořadí*
3. **Parcel Delivery (`parcel_delivery` — `minigame_parcel.js`)** — *Následuje jako 3. v pořadí*
4. **Escape the Smiley (`escape_smiley` — `minigame_smiley.js`)** — *Následuje jako 4. v pořadí*
5. **Happy Train Art Studio (`art_studio` — `minigame_art.js`)** — *Následuje jako 5. v pořadí*

---

## FÁZE C & D — KROKY REALIZACE PRO HAPPY TRAIN WASH (PO POTVRZENÍ PLÁNU)

1. **Záloha a kontrola stavu (`git status`)** pro 100% jistotu okamžitého návratu.
2. **Vytvoření `minigame_wash.js`**:
   - Kompletní 2D scéna slunečné myčky s velkou animovanou mašinkou Toby (mrkající oči sledující nástroj, chichotání při lechtání houbou, radostné vyskočení).
   - 3 velké vizuální nástroje na spodní liště (Žlutá houba, Modrá sprcha, Zlatá hvězdičková leštička) + 4 velké obrázkové samolepky (Hvězda, Srdíčko, Korunka, Duhový blesk).
   - Tolerantní ovládání pro Samsung TV (velký dosah nástroje + magnetické přitahování k nejbližší špíně šipkami + plošný efekt tlačítkem `OK`).
   - Kultivované Web Audio zvuky napojené na existující `window.audioCtx` s anti-spam limitem (žádné mluvené komentáře).
3. **Minimální napojení (3 řádky celkem)**:
   - `castle.js`: přepnutí `ready: true` u zastávky `train_wash` (Brána č. 4) a vykreslení živého náhledu myčky nad Bránou č. 4.
   - `minigames.js`: zobrazení `#minigame-laser-btn` pouze pro `sama_dira`.
   - `index.html`: přidání `<script src="minigame_wash.js"></script>`.
4. **Otestování a report výsledků.**
