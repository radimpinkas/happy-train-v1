# Happy Train: Hon na smajlíky (Escape the Smiley) — Analýza a návrh implementace

Kompletní architektonická analýza současného projektu Happy Train a technický i herní návrh nové minihry **Hon na smajlíky** (`escape_smiley`, Brána č. 2 v Zámku tisíce dobrodružství), ve které dítě z pevného 2D pohledu shora vidí celé hlavní město současně a s mašinkou Tobym honí po skutečné kolejové síti roztomilé smajlíky s různými osobnostmi.

---

## Potvrzená rozhodnutí z úvodního sladění

> [!IMPORTANT]
> Následující tři klíčová rozhodnutí byla potvrzena a určují výslednou architekturu:

- **Rozsah 2D mapy města (Potvrzeno)**: Zobrazíme **hlavní městský okruh + středový kříž** (uzly `J_NW`, `J_NORTH`, `J_NE`, `J_EAST`, `J_SE`, `J_SOUTH`, `J_SW`, `J_WEST` a centrální uzel `J_CENTER`, rozsah souřadnic X `[-235, +245]`, Z `[-185, +215]`). Vynecháním vzdálené západní smyčky Bangkoku (`X = -530`) získáme na 55" televizoru o **85 % větší měřítko** kolejí, mašinky, smajlíků i orientačních dominant.
- **Ovládání směrových šipek v 2D pohledu (Potvrzeno)**: Zachováme **konzistentní ovládání stejné jako v hlavním 3D světě** (`◀ Vlevo`, `▲ Rovně / Zrychlit`, `▶ Vpravo`, `▼ Zpomalit`), doplněné o výrazné barevné nasvícení zvolené větve výhybky přímo na 2D kolejích před mašinkou, aby 4–6leté dítě okamžitě vidělo, kam Toby na nejbližší křižovatce zahne.
- **Speciální akce tlačítka OK / Enter (Potvrzeno)**: Stisk `OK / Enter` (nebo klepnutí přímo na mašinku Tobyho) spustí **krátké veselé turbo zrychlení + zahoukání + bublinkový magnet**, který v okruhu kolem Tobyho přitáhne blízkého smajlíka do vagónku.

---

## A. Analýza současného projektu (Ověřená fakta z kódu)

> [!NOTE]
> Všechna zjištění v této sekci jsou **ověřená fakta ze současného zdrojového kódu** s uvedením konkrétních modulů, funkcí a řádků.

### 1. Architektura 3D scény, kamery a hlavní herní smyčky
- **Inicializace WebGL a kamery (Ověřený fakt — modul tratí, ř. 6–18)**: Globální objekt `scene` (`THREE.Scene`), `camera` (`new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)`) a `renderer` (`THREE.WebGLRenderer`) jsou vytvořeny při startu. Scéna používá exponenciální mlhu `scene.fog = new THREE.FogExp2(daySkyColor, 0.00055)`.
- **Hlavní herní smyčka a pozastavení 3D světa (Ověřený fakt — hlavní herní modul, ř. 1072–1105)**: Funkce `animate()` běží přes `requestAnimationFrame(animate)`. Na ř. 1072–1083 jsou definovány globální funkce `window.pauseMainWorld()` (`mainWorldPaused = true`) a `window.resumeMainWorld()` (`mainWorldPaused = false; clock.getDelta()`). Pokud je `mainWorldPaused === true`, celá 3D fyzika, AI vlaky, částice i `renderer.render(scene, camera)` se přeskočí a uvolní 100 % výkonu CPU/GPU pro 2D minihru.
- **Chování kamery v hlavním 3D světě (Ověřený fakt — hlavní herní modul, ř. 1463–1514, a modul modelů)**: Kamera v 3D světě plynule sleduje lokomotivu (`window.smoothCamPos`, `window.smoothCamLook`) ve výšce ~6,8–15 m nad kolejemi a natáčí se k bodům zájmu (POI).

### 2. Reprezentace kolejové sítě a výhybek
- **Uzly kolejové sítě `window.nodes` (Ověřený fakt — modul tratí, ř. 267–279)**:
  Hlavní město tvoří 8 obvodových uzlů a 1 středový uzel:
  - `J_NW`: `(-125, 12.4, -185)` — Severozápadní viadukt
  - `J_NORTH`: `(65, 12.4, -185)` — Alpský horský uzel
  - `J_NE`: `(210, 4.2, -165)` — Severovýchodní křižovatka
  - `J_EAST`: `(245, 11.5, 0)` — Východní hřebínkový most
  - `J_SE`: `(210, 2.2, 190)` — Jihovýchodní uzel
  - `J_SOUTH`: `(0, 1.8, 215)` — Jižní hlavní křižovatka
  - `J_SW`: `(-210, 2.2, 190)` — Jihozápadní uzel
  - `J_WEST`: `(-235, 11.2, 0)` — Západní říční viadukt
  - `J_CENTER`: `(0, 1.8, 15)` — Středové náměstí s fontánou a Zámkem tisíce dobrodružství
- **Směrované hrany `window.edges` (Ověřený fakt — modul tratí, ř. 719–850)**:
  Mezi sousedními uzly vede **12 obousměrných povrchových tratí** (8 po obvodu + 4 paprsky do `J_CENTER`), což v poli `window.edges` představuje **24 orientovaných povrchových hran** (`edgeAB` a `edgeBA`). Každá hrana obsahuje:
  - `id` (např. `'J_SOUTH->J_CENTER'`), `from`, `to`
  - `curve` (`THREE.CatmullRomCurve3` s předpočítanou délkou přes `cacheCurveLength`)
  - `parallelCurve` (druhá kolej dvoukolejné trati, odsazená o `TRACK_OFFSET = 2.65` m)
  - `station` (`{ name, side, u: 0.5 }`) — každá z 12 povrchových tratí má uprostřed (`u = 0.5`) své ikonické nádraží/dominantu (Eiffel Tower, Neuschwanstein, Pyramids of Giza, Jewel Hypermarket, Kids Fun Park, Big Ben, Mom's House, Grand Central, Flower Meadow, Sunny Farm, Blue River Bridge, Pine Forest).
- **Matematika pohybu po hranách a obloucích výhybek `window.turnoutCurves` (Ověřený fakt — modul tratí, ř. 944–1022, a hlavní herní modul, ř. 1326–1365)**:
  - Po hlavní hraně jede vlak v intervalu parametru `t` od `0.16` do `0.84`.
  - Jakmile `t >= 0.84`, systém zavolá `window.getBranches(baseEdge)`, vybere cílovou hranu `chosenNext = br[pState.switchChoice] || br.straight` a plynule přejde na Hermitův přechodový oblouk `window.turnoutCurves[baseEdge.id + '=>' + chosenNext.id]` (kde `t` běží od `0.0` do `1.0`).
  - Po dokončení oblouku výhybky (`t >= 1.0`) vlak vstoupí na cílovou hranu `chosenNext` přesně v bodě `t = 0.16`.
- **Výběr větví `window.getBranches(currentEdge)` (Ověřený fakt — modul tratí, ř. 1024–1068, a modul modelů, ř. 8287–8340)**:
  Funkce spočítá tečnu příjezdu v `t = 0.84`, porovná úhly všech odchozích hran z uzlu `baseEdge.to` (automaticky vylučuje okamžitou U-otočku `e.to === baseEdge.from` i placené výjezdy `EXIT_*`) a seřadí větve podle úhlu na `{ left, straight, right }`.

### 3. Napojení miniher, Zámku a ovladače
- **Zámek tisíce dobrodružství a Brána č. 2 (Ověřený fakt — modul zámku, ř. 59–69 a 2622–2652)**:
  V poli `CASTLE_STOPS` je na indexu `2` připravena zastávka:
  - `id: 'SMILEY'`, `type: 'minigame'`, `minigameId: 'escape_smiley'`, `ready: false`, `angle: Math.PI * 0.5`.
  - Ve funkci `activateSelectedCastleGate()` (ř. 2633–2637) platí, že jakmile je u zastávky `ready: true`, stisk `OK` automaticky skryje HUD zámku, spustí kouzelný záblesk portálu a zavolá `window.HappyTrainMinigames.launch(stop.minigameId, { source: 'castle' })`.
- **Správce miniher a DOM overlay (Ověřený fakt — modul miniher, ř. 25–155)**:
  `window.HappyTrainMinigames` spravuje celoobrazovkový `#minigame-overlay` obsahující `<canvas id="minigame-canvas">`, horní lištu `#minigame-topbar` a tlačítko `#minigame-back-btn`.
- **Třívrstvý ovladač pro Samsung TV, PC a mobil (Ověřený fakt — modul ovladače, ř. 666–851)**:
  - Zachytává klávesu `BACK` na Samsung Tizen TV (`keyCode === 10009`), LG WebOS (`461`), `Escape` (`27`) a `Backspace` (`8`) a předává akci `'BACK'` aktivní minihře.
  - V kontextu `'MINIGAME'` mapuje šipky a `Enter/OK` na akce `'JUMP'`, `'DOWN'`, `'LEFT'`, `'RIGHT'`, `'CONFIRM'`.
  - Na рядcích 712–714 nyní předává událost `'KEY_UP'` pouze minihře `'train_wash'`.

---

## B. Technická proveditelnost a klíčová rozhodnutí

### 1. Srovnání přístupů: Přepnutí 3D kamery vs. Věrná 2D projekce skutečné sítě na Canvas

> [!IMPORTANT]
> **Rozhodnutí: Varianta B — Věrná 2D projekce skutečných křivek `window.edges` a `window.turnoutCurves` na `<canvas id="minigame-canvas">` při pozastaveném 3D světě (`window.pauseMainWorld()`).**

| Kritérium | Varianta A: Přepnutí 3D WebGL kamery vysoko nad město | Varianta B (Zvolená): 2D Canvas čtoucí přímo živá data `window.edges` a `window.nodes` |
| :--- | :--- | :--- |
| **Věrnost mapy města** | Zobrazuje 3D modely, ale střechy budov (Jewel Dome, Zámek vysoký 149 m, tunely) zakrývají koleje pod sebou. | **100% geometrická shoda** — čte přímo `edge.curve.getPointAt(u)` a `window.turnoutCurves` z paměti, ale kreslí koleje čitelně navrchu. |
| **Čitelnost na 55" TV z 3 metrů** | Špatná: při šířce mapy ~500 m je 6metrová 3D lokomotiva velká jen ~18 px a splývá s terénem; hustá mlha `FogExp2` při výšce kamery 650 m scénu zašedí. | **Vynikající**: Koleje, barevné výhybky, stylizovaná 2D mašinka Toby s vagónky i smajlíci mají jasné kontury a velikost 44–68 px. |
| **Výkon na Samsung TV AU8100** | Kritické riziko: Při pohledu na celé město najednou nefunguje frustum culling — GPU musí vykreslovat tisíce 3D meshů současně (< 20 FPS). | **Stabilních 60 FPS**: Statická mapa města (tráva, řeky, silnice, pražce, koleje, budovy) se předkreslí **jedinkrát** do offscreen bufferu; v herní smyčce se kreslí jen Toby, smajlíci a efekty. |
| **Bezpečnost pro 3D svět** | Vyžaduje zásahy do `scene.fog`, `camera.fov`, skrývání střech zámku a pozic 3D vlaků. | **Nulové riziko rozbití 3D hry**: Hlavní 3D svět odpočívá přes `window.pauseMainWorld()`, stav `pState` v `game.js` zůstává nedotčený. |

### 2. Pohyb po kolejích a křižovatkách v 2D minihře
- **Geometrie pohybu**: Minihra nepoužívá žádné zjednodušené čáry, ale přímo v paměti existující 3D křivky `edge.curve` (`THREE.CatmullRomCurve3`) z `window.edges` a přechodové oblouky `window.turnoutCurves`.
- **Převod 3D souřadnic `(x, z)` na 2D obrazovku `(screenX, screenY)`**:
  - Hlavní okruh (`J_NW`..`J_SW` + `J_CENTER`) má rozsah `X ∈ [-265, +275]` (šířka 540 m) a `Z ∈ [-215, +245]` (výška 460 m). Poměr stran `540 : 460 ≈ 1,17 : 1` se výborně hodí na širokoúhlou obrazovku `16 : 9` s postranním prostorem pro orientační ikony a počítadlo chycených smajlíků.
  - Lineární transformace s automatickým centrováním a okrajem (padding 7 % výšky obrazovky) převádí každý bod `p = curve.getPointAt(u)` na `(screenX, screenY)` a tečnu `tan = curve.getTangentAt(u)` na úhel natočení `angle = Math.atan2(tan.z, tan.x)`.
- **Plynulý průjezd křižovatkou**: Stejně jako v `game.js` (ř. 1327–1364) jede mašinka i každý smajlík po hlavní hraně v rozsahu `u ∈ [0.16, 0.84]`, v bodě `u = 0.84` vybere větev přes `getSmileyBranches(edge)` (filtrující pouze 9 uzlů hlavního městského okruhu a středu, aby nikdo neodbočil do podzemního metra nebo mimo mapu) a projede příslušným obloukem `window.turnoutCurves[edge.id + '=>' + nextEdge.id]`.

---

## C. Návrh architektury (Modulární struktura a tok dat)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ZÁMEK TISÍCE DOBRODRUŽSTVÍ                            │
│        CASTLE_STOPS[2] (id: 'SMILEY', minigameId: 'escape_smiley')           │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ OK / Enter / Dotyk
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SPRÁVCE MINIHER (HappyTrainMinigames)                     │
│  1. window.pauseMainWorld() — 3D svět bezpečně pozastaven                    │
│  2. Zobrazí #minigame-overlay + <canvas id="minigame-canvas">                │
│  3. Spustí window.MinigameSmiley.start(ctx, canvas, exitCallback)            │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 SAMOSTATNÝ MODUL: Hon na smajlíky (MinigameSmiley)           │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ 1. MAP PROJECTION & OFFSCREEN CACHE  │ 2. TRACK FOLLOWER ENGINE              │
│ • Čte živé window.nodes, window.edges│ • Pohyb Tobyho + 3 vagónků po křivkách│
│   a window.turnoutCurves (9 uzlů)    │ • Výběr výhybky (Vlevo/Rovně/Vpravo)  │
│ • Předkreslí 2D mapu města (řeka,    │ • Svítící navigační šipky na kolejích │
│   mosty, tunel, pražce, 12 dominant) │ • Turbo + bublinkový magnet (OK)      │
│   do offscreenCanvas při startu      │                                       │
├──────────────────────────────────────┼───────────────────────────────────────┤
│ 3. SMILEY AI & PERSONALITY ENGINE    │ 4. REWARDS & PERSISTENCE              │
│ • Pohyb výhradně po kolejích         │ • Okamžitý vlet chyceného smajlíka    │
│ • 5 osobností (Provokatér, Mrkálek,  │   do sběrného vagónku za Tobym        │
│   Strašpytel, Kulišák, Zlatá hvězda) │ • Konfety, radostné zvuky (Web Audio) │
│ • Adaptivní pomoc dítěti po 18 s     │ • Ukládání do localStorage            │
│   (smajlík zamává a počká na Tobyho) │   ('happyTrain_smileyChase_v1')       │
└──────────────────────────────────────┴───────────────────────────────────────┘
```

### Rozdělení odpovědností a dotčené části systému
1. **Nový samostatný modul pro minihru (`minigame_smiley.js`)**:
   - Obsahuje veškerou logiku 2D projekce mapy, předkreslení statické vrstvy města, pohyb Tobyho a jeho vagónků po křivkách, AI chování smajlíků, kolize, částicové efekty, syntetizované Web Audio zvuky a ukládání do `localStorage`.
   - Registruje se jako `window.MinigameSmiley = { start, stop, handleAction, onResize }`.
2. **Propojení se správcem miniher a Zámkem**:
   - V registraci miniher se slot `escape_smiley` přepne z placeholderu na `window.MinigameSmiley`.
   - V Zámku (`CASTLE_STOPS[2]`) se přepne `ready: true`, upraví popisek brány a živý 2D/3D poutač nad bránou č. 2.
3. **Načtení skriptu v HTML**:
   - Přidání jednoho `<script src="minigame_smiley.js"></script>` před hlavní herní modul.
4. **Hlavní 3D svět (`tracks.js`, `models.js`, `game.js`, `audio.js`) zůstává 100% beze změn!**

---

## D. Herní logika a vizuální design (Pro děti 4–6 let)

### 1. Vzhled 2D mapy města shora (Estetika dřevěné vláčkodráhy)
Inspirací je teple barevná, přehledná ilustrovaná vláčkodráha (jako na přiloženém referenčním obrázku č. 2):
- **Podklad (60 % plochy)**: Svěží sametový trávník (`#7ccf52` s jemným radiálním stínováním a trsy trávy), modrá řeka na západě a jihu (`#38bdf8` s bílými vlnkami) a pískové cesty.
- **Kolejová síť (30 % plochy)**:
  - Světlé dřevěné podloží a pražce (`#deb887` s teplým okrajem `#b47b44`) vykreslené podél všech 12 tratí a všech oblouků výhybek `window.turnoutCurves`, takže celá síť tvoří souvislou, hladce navazující dřevěnou dráhu.
  - Dvojice kovových kolejnic (`#475569` se světlým odleskem) pro obě paralelní koleje (`curve` i `parallelCurve`), aby dítě vidělo skutečnou dvoukolejnou trať z 3D světa.
- **Orientační dominanty města (12 ikonických míst ze skutečné mapy)**:
  Na každé z 12 hran (v `u = 0.5`) a ve středu `J_CENTER` vykreslíme zřetelnou ilustrovanou 2D dominantu z ptačí perspektivy:
  - **Střed (`J_CENTER`)**: Pohádkový Zámek tisíce dobrodružství s modrými věžičkami a vodním příkopem.
  - **Sever (`J_NORTH`)**: Alpský horský tunel (kamenné portály s dřevěným zastřešením, kterým Toby i smajlíci projíždějí).
  - **Severozápad (`J_NW`)**: Eiffelova věž a Růžový domeček maminky (`Mom's House`).
  - **Západ (`J_WEST`)**: Cihlový viadukt s věží Big Ben a větrnými mlýny.
  - **Jihozápad (`J_SW`)**: Dětský zábavní park s ruským kolem (`Kids Fun Park`).
  - **Jihovýchod (`J_SE`)**: Skleněná kopule `Jewel Dome` s vodopádem a ohrada se zvířátky (`Sunny Farm`).
  - **Východ (`J_EAST`)**: Zlaté pyramidy v Gíze a východní hřebínkový most.

### 2. Vláček Toby a sběrné vagónky
- **Vzhled Tobyho**: Výrazná tyrkysovo-zlatá parní mašinka z ptačí perspektivy (délka ~54 px, šířka ~32 px), vpředu s velkýma veselýma očima, které se dívají směrem k nejbližšímu smajlíkovi, a komínkem, ze kterého stoupají bílé obláčky páry.
- **Vagónky pro chycené smajlíky**: Za Tobym jedou po stejné křivce **3 otevřené barevné vagónky**. Když Toby chytí smajlíka, smajlík nevybuchne ani nezmizí, ale **vyskočí radostným obloukem přímo do volného sedátka ve vagónku** a od té chvíle se veze s Tobym po městě a usmívá se! (Po naplnění 3 vagónků následuje velká oslava s konfetami a vagónky vysypou smajlíky do sbírky v Zámku, aby mohl Toby chytat další.)

### 3. Osobnosti smajlíků (Fáze 1 a rozšíření ve Fázi 2)
Současně se po kolejích pohybují **2 až 3 objekty**, takže mapa je živá, ale nepůsobí chaoticky:

| Typ postavičky | Obtížnost | Vizuální styl na 2D kolejích | Chování a reakce na Tobyho |
| :--- | :--- | :--- | :--- |
| **1. Provokatér** *(Fáze 1)* | Snadný | Žlutý smajlík s vypláznutým jazýčkem (`#facc15`) | Kutálí se pomalu (`0,55×` rychlosti Tobyho). Každých 5 s zastaví, vyplázne jazyk, zavrtí se a počká, až se Toby přiblíží na 90 m, pak s chichotáním popojede. |
| **2. Mrkálek** *(Fáze 1)* | Snadný | Růžový kulatý smajlík s mrkajícím očkem (`#f472b6`) | Jezdí klidným tempem (`0,65×` rychlosti Tobyho), na každé křižovatce střídá levou a pravou větev a při míjení Tobyho mrkne a vypustí srdíčko. |
| **3. Strašpytel** *(Fáze 1)* | Střední | Modrý překvapený smajlík s růžovými tvářemi (`#38bdf8`) | Dokud je Toby daleko, jede pomalu (`0,50×`). Když se Toby přiblíží na 110 m, vykulí oči, krátce zrychlí (`0,92×` rychlosti Tobyho, takže ho Toby na vyšší rychlost nebo s turbem vždy dožene) a na výhybce volí větev směrem od Tobyho. |
| **4. Kulišák** *(Fáze 2)* | Střední | Zelený šibalský smajlík (`#4ade80`) | Kličkuje přes středové náměstí `J_CENTER`, rád vjíždí do horského tunelu na severu, kde na okamžik vykoukne z druhého portálu. |
| **5. Zlatá hvězdička** *(Fáze 1/2)* | Vzácný bonus | Zářící pěticípá hvězda s očima (`#fde047`) | Objeví se po každých 3 chycených smajlících. Zanechává třpytivou stopu a po chycení spustí zlatý ohňostroj nad celým městem. |
| **Bonusové objekty** *(Fáze 2)* | Zpestření | Žlutá kačenka, Duhový míč, Malý dinosaurus, Roztomilý duch | Rozšiřitelné přes stejný `TrackEntity` interface (přidání položky do katalogu bez zásahu do enginu). |

### 4. Mechanika chycení a adaptivní pomoc pro malé děti
- **Velkorysá tolerance chycení**: Ke chycení dojde, jakmile je vzdálenost mezi Tobym a smajlíkem v 2D souřadnicích světa menší než **28 metrů** (nebo **52 metrů** během aktivního bublinkového magnetu po stisku `OK`), a to i tehdy, když se míjejí na souběžných kolejích dvoukolejné trati nebo v křižovatce.
- **Adaptivní pomoc (Zero-Frustration Guarantee)**: Každý smajlík má vlastní počítadlo `chaseTimer`. Pokud se dítěti nedaří smajlíka chytit po dobu **16 sekund**, smajlík se unaví, zpomalí na `0,30×` rychlosti, zamává praporkem s bublinkou `👋` a na křižovatkách začne vybírat větve vedoucí vstříc Tobymu, aby mělo dítě vždy radost z úspěchu.

### 5. Systém odměn a trvalé ukládání (`localStorage`)
- **Samostatný klíč**: `'happyTrain_smileyChase_v1'`.
- **Ukládaná struktura**:
  ```json
  {
    "totalCaught": 14,
    "starsCaught": 3,
    "caughtByType": { "provokater": 6, "mrkalek": 5, "straspytel": 3, "kulisak": 0, "star": 3 }
  }
  ```
- **Vizuální počítadlo bez textu**: V horním rohu obrazovky jsou velká kolečka s obličeji jednotlivých druhů smajlíků a zlaté hvězdičky. Při každém chycení příslušná ikonka radostně poskočí a zazvoní čtyřtónová fanfára přes Web Audio API.

---

## E. Ovládání na všech platformách (TV, PC, Mobil)

| Vstup / Zařízení | Změna výhybky (Vlevo / Rovně / Vpravo) | Rychlost Tobyho (5 stupňů) | Turbo + Houkání + Magnet | Návrat do Zámku |
| :--- | :--- | :--- | :--- | :--- |
| **Samsung Smart TV (dálkový ovladač)** | Šipky `◀` (`LEFT`) a `▶` (`RIGHT`) přepínají `left ↔ straight ↔ right` | Šipka `▲` zrychlí, šipka `▼` zpomalí (nikdy nezacouvá, min. stupeň 1) | Tlačítko `OK / Enter` | Tlačítko `BACK / Return` (`keyCode 10009`) |
| **Počítač (klávesnice + myš)** | Klávesy `ArrowLeft` / `ArrowRight` nebo kliknutí myší přímo na svítící větev výhybky | Klávesy `ArrowUp` / `ArrowDown` | `Enter` / `Mezerník` nebo kliknutí na Tobyho | `Escape` / `Backspace` nebo tlačítko `🏰 Zpět` |
| **Mobil a tablet (dotyk)** | Dotykové kolo `#remote-wheel-hud` (`◀` / `▶`) nebo **klepnutí prstem přímo na větev koleje či smajlíka** (automaticky přepne výhybku směrem k místu dotyku!) | Dotykové kolo `▲` / `▼` | Středové tlačítko `OK` na kole nebo klepnutí na Tobyho | Tlačítko `🏰 Zpět do zámku` v levém horním rohu |

### Vizuální nápověda výhybky přímo na kolejích (Klíčové pro děti 4–6 let)
- Před mašinkou Tobyho se na blížící se křižovatce vykreslují **tři barevné oblouky výhybky**:
  - **Zvolená větev** jasně svítí (žlutá `#facc15` pro Vlevo, zelená `#4ade80` pro Rovně, oranžová `#fb923c` pro Vpravo) a po ní běží animované světelné šipky `❯❯❯`, které dítěti bez jediného slova ukazují, kam vláček pojede.
  - **Ostatní dvě větve** jsou jemně poloprůhledné, takže dítě na dotyk může klepnout i přímo na ně.

---

## F. Výkon a optimalizace pro Samsung Smart TV AU8100

1. **Jednorázové předkreslení statické mapy (`offscreenMapCanvas`)**:
   - Vykreslení trávy, řeky, silnic, mostů, tunelu, všech 24 kolejových křivek, 48 výhybek a 12 ilustrovaných dominant města proběhne **pouze jednou při spuštění minihry** (nebo při změně velikosti okna) do paměťového `offscreenMapCanvas`.
   - V každém snímku (`requestAnimationFrame`) se celé město překopíruje jediným voláním `ctx.drawImage(offscreenMapCanvas, 0, 0)` za méně než **0,4 ms**.
2. **Nulová zátěž z 3D WebGL scény**:
   - Během minihry je aktivní `window.pauseMainWorld()`, takže WebGL renderer ani 3D fyzika neběží.
3. **Nulová alokace paměti v herní smyčce (Zero-GC Spikes)**:
   - Částice (konfety, obláčky páry z komína, třpytky hvězdičky) používají předalokované pole s pevnou velikostí (object pool max. 80 částic).
   - Pro čtení bodů z křivek `curve.getPointAt(u, targetVec)` použijeme sdílené dočasné vektory `THREE.Vector3`, aby v 60Hz smyčce nevznikaly tisíce nových objektů pro Garbage Collector na TV.

---

## G. Rizika a jejich prevence

| Riziko | Pravděpodobnost | Dopad | Konkrétní technické opatření v návrhu |
| :--- | :---: | :---: | :--- |
| **Smajlík nebo Toby vjede na slepou kolej (`EXIT_ALPS`, `EXIT_EGYPT`) nebo do podzemního metra** | Vysoká (pokud by se použila surová `window.edges`) | Vysoký | Vytvoříme čistý filtr `CITY_SURFACE_NODES` (9 uzlů: `J_NW..J_SW` + `J_CENTER`). Funkce `getCityBranches(edge)` v minihře vybírá výhradně z 24 povrchových hran mezi těmito 9 uzly a oblouků `window.turnoutCurves` mezi nimi. |
| **Vláček v hlavní 3D hře se po návratu z minihry pohne nebo ztratí pozici v Zámku** | Střední | Vysoký | Minihra používá vlastní stavový objekt `toby2D` (`edge, u, speedStage, switchChoice`) a **nikdy nemodifikuje** globální `pState` ani `playerLoco` z `game.js`. Při ukončení zavolá standardní `exitCallback` v `minigames.js`. |
| **Šipka Nahoru (`ArrowUp`) je v `controller.js` namapovaná na akci `'JUMP'`** | Jistota (ověřeno v `controller.js`, ř. 682 a 754) | Střední | V `minigame_smiley.js` ošetříme ve funkci `handleAction(action, data)` rozlišení podle `data.key` / `data.originalEvent.key`: pokud šlo o `ArrowUp`, zvýší rychlost (`SPEED_UP`), zatímco `Enter` / `Space` / `wheel-ok` spustí turbo a magnet (`TURBO_MAGNET`). |
| **Dítě na TV nepozná, která šipka je „Vlevo“ a která „Vpravo“, když vláček jede po obrazovce dolů** | Střední | Střední | Kromě rozsvícení vybrané větve přímo na kolejích přidáme chytrý detail: pokud dítě stiskne šipku `◀` nebo `▶`, u přední části mašinky se ukáže velká barevná šipka ukazující přesně do zvolené větve křižovatky. |

---

## H. Postup implementace (Rozdělení na bezpečné fáze)

### Fáze 1: Hratelný prototyp (MVP) v samostatném souboru `minigame_smiley.js`
1. **Projekce a předkreslení 2D mapy města**:
   - Načtení 9 hlavních uzlů (`J_NW..J_SW`, `J_CENTER`), 24 povrchových hran a jejich přechodových oblouků `window.turnoutCurves`.
   - Vykreslení dřevěných pražců, kolejnic, řeky, mostů, severního horského tunelu a 12 ilustrovaných orientačních dominant do `offscreenMapCanvas`.
2. **Pohyb Tobyho a 3 sběrných vagónků po kolejích**:
   - Plynulá jízda po `edge.curve` (`0.16 -> 0.84`) a `turnoutCurves` (`0.0 -> 1.0`).
   - Ovládání výhybek (`◀`, `▶`), 5 stupňů rychlosti (`▲`, `▼`) со svítící navigační cestou před mašinkou a tlačítko `OK / Enter` (krátké turbo + zahoukání + bublinkový magnet).
   - Podpora klepnutí prstem/myší přímo na libovolnou větev koleje na obrazovce.
3. **3 základní osobnosti smajlíků + chytání do vagónků**:
   - Implementace **Provokatéra** (žlutý), **Mrkálka** (růžový) a **Strašpytla** (modrý) + vzácné **Zlaté hvězdičky**.
   - Animace vskočení chyceného smajlíka do vagónku za Tobym, oslavné konfety, Web Audio znělky, adaptivní pomoc po 16 s a ukládání do `localStorage` (`happyTrain_smileyChase_v1`).
4. **Napojení do Brány č. 2 v Zámku**:
   - Aktivace `escape_smiley` v `minigames.js`, `castle.js` (`ready: true`) a načtení v `index.html`.

### Fáze 2: Rozšíření osobností a bonusových objektů (po otestování Fáze 1)
1. Přidání **Kulišáka** (zelený smajlík schovávající se v severním tunelu).
2. Přidání bonusových postaviček na koleje (**Žlutá kačenka**, **Skákající míč**, **Malý dinosaurus**, **Roztomilý duch**).
3. Sběratelské album chycených smajlíků přímo na horní liště minihry s možností spustit slavnostní přehlídku všech chycených kamarádů.

---

## I. Testovací plán

1. **Geometrický test kolejové sítě a výhybek**:
   - Ověřit, že Toby i smajlíci hladce projedou všech 9 uzlů (`J_NW` až `J_SW` a `J_CENTER`) ve všech směrech bez jediného skoku pozice nebo úhlu a nikdy neodbočí na `EXIT_ALPS`, `EXIT_EGYPT` ani do podzemního metra.
2. **Test ovládání na PC, mobilu a Samsung Smart TV emulaci**:
   - Ověřit šipky `◀ / ▶` (přepínání levé/rovné/pravé větve se svítící nápovědou na kolejích), `▲ / ▼` (změna rychlosti 1–5), `OK / Enter` (turbo + houkání + bublinkový magnet) a `BACK` (`keyCode 10009` / `Escape` -> čistý návrat do Zámku).
   - Ověřit dotykové ovládání na mobilu (kolo `#remote-wheel-hud` i přímé klepnutí na kolej/smajlíka) a ověřit, že klepnutí na tlačítko `Zpět` nevyvolá herní akci.
3. **Test herní smyčky pro děti (4–6 let)**:
   - Ověřit chycení smajlíka při přiblížení i při míjení v protisměru, animaci naskočení do vagónku a adaptivní zpomalení smajlíka po 16 sekundách.
4. **Test izolace a návratu do 3D světa**:
   - Spustit minihru z Brány č. 2 v Zámku, chytit několik smajlíků, vrátit se tlačítkem `Zpět` / `BACK` do Zámku a poté vyjet ven do 3D města — ověřit, že 3D vlak Toby, počet jeho 3D vagónků, kamera i zvuk fungují bez jakéhokoliv vedlejšího efektu.

---

## J. Shrnutí a doporučení

- **Nejlepší architektonická cesta**: Vytvořit samostatný modul `minigame_smiley.js` vykreslující na `<canvas id="minigame-canvas">` věrnou 2D ptačí perspektivu hlavního městského okruhu a středu (`J_NW..J_SW` + `J_CENTER`) přímo ze skutečných 3D křivek `window.edges` a `window.turnoutCurves` při pozastaveném 3D světě (`window.pauseMainWorld()`).
- **Proč je toto řešení ideální**: Spojuje **100% věrnost skutečné mapě Happy Train** (stejné tratě, stejné výhybky, stejné stanice a dominanty) s **perfektní čitelností na 55" TV**, **stabilními 60 FPS** díky offscreen cache statické mapy a **nulovým rizikem rozbití 3D hry**.
