# Výtvarná přestavba Happy Train: Pohádkový 2.5D svět

Transformace současné hry z jednoduchých geometrických primitiv do bohatě ilustrovaného 2.5D pohádkového světa ve stylu prémiové dětské knížky, plně inspirovaného přiloženou výtvarnou referencí a při zachování veškeré herní logiky, zvuků a ovládání pro Smart TV.

## User Review & Critical Decisions

> [!IMPORTANT]
> Potvrzené volby z úvodní konzultace určují rozsah a způsob realizace první reprezentativní scény:

- **Potvrzené rozhodnutí 1 (2.5D Architektura)**: Kombinace zaoblených vícevrstvých 3D modelů (`ExtrudeGeometry` se zkosenými hranami, `LatheGeometry` pro oblé karoserie a kola, kreslené tmavé obrysové linky) s bohatě ilustrovanými 2D/Canvas texturami a vrstvenými 2.5D billboardy pro stromy, kvetoucí keře, sedmikrásky, obláčky kouře a panoráma města.
- **Potvrzené rozhodnutí 2 (Hlavní reprezentativní scéna)**: Prioritní zaměření na ikonickou scénu podle referenčního obrázku — roztomilá žluto-červená mašinka Toby s otevřenými vagónky na obloukovém cihlovém viaduktu mezi dvěma kamennými tunely v zelených kopcích, pod nímž vede asfaltová křižovatka se semaforem, zaoblenými autíčky (červené a modré mini autíčko, žlutý školní autobus, bílá dodávka) a nad nímž létá červeno-žlutý vrtulník Charlie.
- **Potvrzené rozhodnutí 3 (Pracovní postup)**: Nejprve přímá úprava a odladění v živém náhledu AI Studia bez zahlcování chatu kompletními výpisy kódu, s detailním přehledem nových a provizorních prvků po dokončení.

---

## 1. Overview & Core Concept

- **Co přestavba přináší**: Proměnu plochého světa ze základních kvádrů a válců na živou pohádkovou ilustraci s výraznou prostorovou hloubkou (popředí se silnicí a kvetoucími stromy, střední plán s cihlovým viaduktem, tunely a vláčkem, pozadí se zvlněnými zelenými kopci a siluetou moderního města).
- **Cílové publikum**: Děti ve věku 3 až 6 let hrající na televizní obrazovce (Smart TV) nebo počítači z větší pozorovací vzdálenosti.
- **Hlavní přínos**: Každý objekt má okamžitě čitelnou siluetu, přátelský kreslený výraz (velké lesklé oči posazené na kapotě/světlech a veselý úsměv na nárazníku), měkké zaoblené tvary s jemnými ilustrovanými obrysy a bohatou povrchovou kresbu (jednotlivé cihly na klenbách viaduktu, kamenné kvádry portálů tunelů, dřevěné pražce se štěrkovým ložem, vrstvené koruny smrků a kvetoucích stromů).

---

## 2. User Experience & Visual Design

- **Hlavní vizuální vrstvy a kompozice (3 plány hloubky)**:
  1. **Přední plán (Foreground)**: Dvouproudá šedá asfaltová silnice s bílým přerušovaným značením, přechodovými čarami, žlutým semaforem na sloupku, bílými sedmikráskami v trávě, kvetoucími jabloněmi/sakurami a zaoblenými autíčky s odfukujícími tyrkysovými obláčky.
  2. **Střední plán (Midground — Hero zóna)**: Mohutný zakřivený viadukt z teplých oranžovo-červených cihel s polokruhovými klenbami, římsou a kamennými portály tunelů zasazenými do svěžích zelených kopců posetých květy. Po viaduktu jede mašinka Toby se třemi červeno-žlutými vagónky a tyrkysovými koly; nad tratí se vznáší zaoblený červeno-žlutý vrtulník Charlie s pruhovaným rotorem.
  3. **Zadní plán (Background)**: Vrstvené oblé zelené kopce se smrkovými háji, dřevěným obloukovým můstkem a ilustrovaným panoramatem světlých městských mrakodrapů na obzoru pod zlatavoblankytovým nebem.

- **Vizuální identita a barevná paleta**:
  - *Estetický směr*: Ručně malovaná vektorová/knižní dětská ilustrace převedená do 2.5D prostoru s měkkým cel-shadingovým přechodem a tenkou tmavou konturou.
  - *Barevné tokeny*:
    - `--sky-zenith`: `#38bdf8` přecházející do teplého slunečního horizontu `#fef08a`
    - `--meadow-fresh`: `#4ade80` a `#22c55e` (bohatě stupňované odstíny svěží trávy na kopcích)
    - `--pine-deep`: `#065f46` a `#047857` (tmavě smaragdové vrstvené smrky s ilustrovaným větvením)
    - `--viaduct-brick`: `#ea580c`, `#c2410c` a `#9a3412` (teplé pálené cihly s kresbou spár a klenbových klenáků)
    - `--toby-gold`: `#facc15` (slunečně žlutý kotel mašinky), `--toby-crimson`: `#ef4444` (červená kabina, komín a pluh), `--toby-turquoise`: `#06b6d4` (tyrkysová kopule, přední čelo a kola vagónků)
  - *Typografie a HUD překryv*: Čisté, zaoblené a z dálky čitelné rozhraní bez rušivého rozmazání (`backdrop-filter` odstraněn pro maximální plynulost WebGL), s výraznou navigační kartou a animovaným portrétem mluvící postavy.

- **Kamerová choreografie a čitelnost na TV**:
  - Kamera zaujímá mírně zvýšený šikmý 2.5D pohled (`FOV 34°` místo širokoúhlých `42°`), který potlačuje zkreslení okrajů a dává scéně charakter ilustrované dvojstránky z dětské knihy.
  - Výchozí startovní pozice a hlavní pohled směřují přímo na **reprezentativní scénu s cihlovým viaduktem, dvěma tunely, křižovatkou se semaforem, autíčky a vrtulníkem Charlie**, přičemž kamera plynule sleduje jízdu vláčku kolem celého světa bez prudkých skoků.

---

## 3. Key Product Decisions & Trade-Offs

- **Rozhodnutí 1: Vícevrstvé zaoblené 3D siluety (`ExtrudeGeometry` + `LatheGeometry`) místo krabic (`BoxGeometry`)**
  - *Zvolený přístup*: Karoserie mašinky Toby, otevřené korby vagónků, zaoblené kapoty autíček, školního autobusu, dodávky, trup vrtulníku Charlie a oblouky cihlového viaduktu budou vymodelovány pomocí zaoblených 2D křivek (`THREE.Shape` s `absarc` / `bezierCurveTo`) vytažených přes `ExtrudeGeometry` se zapnutým zkosením (`bevelEnabled: true`) a doplněných o jemné tmavé obrysové hrany a detailní procedurální/vygenerované malované textury.
  - *Proč*: Běžné `BoxGeometry` a `CylinderGeometry` působí jako levná programátorská primitiva. Zaoblené extrudované profily s ilustrovanými texturami oken, mřížek chladiče, očí v předních světlech a úsměvů na nárazníku věrně reprodukují kresbu z referenčního obrázku.

- **Rozhodnutí 2: Kombinace procedurálních HD malovaných plátnových textur a dedikovaných 2.5D ilustrovaných billboardů**
  - *Zvolený přístup*: Pro povrch cihlového viaduktu, kamenné klenby tunelů, asfaltovou křižovatku, obličeje vozidel, vrstvené smrky, rozkvetlé stromky (růžový a bílý s kvítky), sedmikrásky, obláčky páry a kulisu velkoměsta v pozadí vytvoříme sjednocený systém vysokorozlišovacích malovaných textur a vrstvených 2.5D prostoro-orientovaných prvků (s nastavením `SRGBColorSpace` a `alphaTest`).
  - *Proč*: Zajišťuje 100% vizuální jednotu, okamžité načtení bez chybějících externích souborů a vysoký výkon na Smart TV (minimum draw callů, měkké kontaktní stíny pod vozidly místo náročného počítání stínů pro stovky stromů).

---

## 4. Technical Architecture & Data Strategy

### Architektura 2.5D Vykreslovacího a Herního Systému

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        HAPPY TRAIN 2.5D ART ENGINE                         │
├───────────────────────┬──────────────────────────┬─────────────────────────┤
│   VRSTVENÉ PROSTŘEDÍ  │    HRDINOVÉ A VOZIDLA    │  KAMERA, SVĚTLO A HUD   │
│    (tracks.js +       │       (models.js)        │   (game.js + index.html)│
│   ilustrované vrstvy) │                          │                         │
├───────────────────────┼──────────────────────────┼─────────────────────────┤
│ • Cihlový viadukt se  │ • Mašinka Toby:          │ • 2.5D Knižní kamera    │
│   skutečnými klenbami │   žlutý kotel, červená   │   (FOV 34°, šikmý nadhled│
│   a spárovanou cihlou │   kabina s žlutou římsou,│   s plynulým tlumením)  │
│ • 2 Kamenné portály   │   tyrkysová kopule,      │ • Teplé sluneční světlo │
│   tunelů v zelených   │   pluh, oči u komínu     │   + tyrkysovo-zelený    │
│   květinových kopcích │ • 3 Červeno-žluté        │   HemisphereLight       │
│ • Asfaltová křižovatka│   otevřené vagónky s     │ • Měkké kontaktní stíny │
│   v popředí + žlutý   │   tyrkysovými koly       │   pod všemi vozidly     │
│   semafor na sloupku  │ • Vrtulník Charlie:      │ • Zachování ovládání    │
│ • 2.5D Billboardy:    │   zaoblená kabina, ližiny│   šipkami, Enter, M, W, │
│   smrky, kvetoucí     │   a pruhovaný rotor      │   5min hodin a dabingu  │
│   stromy, sedmikrásky,│ • Autíčka: Červené,      │                         │
│   silueta mrakodrapů  │   Modré, Žlutý autobus,  │                         │
│   a dřevěný můstek    │   Bílá dodávka s úsměvem │                         │
└───────────────────────┴──────────────────────────┴─────────────────────────┘
```

### Mapování interakcí a zachování herní funkčnosti
- **Pohyb a výhybky (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`)**: Plně zachována dvoukolejná trať, 5 rychlostních stupňů + zpátečka, světelné naváděcí body na trati a velká směrová karta.
- **Interakce (`Enter` / `Space`)**: Houkání mašinky, vypouštění malovaných tyrkysových obláčků páry a barevných bublin, vjezd do 4 podzemních stanic metra a rozhovory s kamarády.
- **Denní cyklus a počasí (`W`, `M`)**: 5minutové analogové hodiny plynule mění atmosféru (Den / Západ slunce / Noc s rozsvícenými okny a kuželem světla mašinky) a přepínání počasí (Jasno / Déšť / Sníh).
