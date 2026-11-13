# Graph Report - fromgraytoplay  (2026-11-13)

## Corpus Check
- 416 files · ~363,191 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 53 file(s) not represented in the graph (top: .csv 25, .css 22, (none) 5)

## Summary
- 1323 nodes · 4416 edges · 89 communities (68 shown, 21 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 217 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Shared data & press numbers
- Watch skill config
- Watch frame sampling
- Watch transcription
- Easter eggs & palette
- Watch CLI options
- Core state & courts
- Impact page
- Hero 3D scene
- Community & notifications
- Quick report & AI photo
- App shell & auth
- Ambient effects & install
- Pages workflow
- Court detail & badges
- Hero 3D builders
- Satellite time machine
- Sibiu data enrichment
- Deploy safety gates
- Admin panel
- Watch downloads
- Build config
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 264 edges
2. `useFirebase()` - 115 edges
3. `mountHero3D()` - 88 edges
4. `db` - 50 edges
5. `ACTIVE_CITY` - 46 edges
6. `g2pSfx()` - 44 edges
7. `App()` - 43 edges
8. `COURTS` - 34 edges
9. `getVoterKey()` - 34 edges
10. `logActivity()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `run_gemini()` --calls--> `is_youtube()`  [EXTRACTED]
  .claude/skills/watch/scripts/watch.py → .claude/skills/watch/scripts/gemini.py
- `ReportHashListener()` --indirect_call--> `QuickReportModal()`  [INFERRED]
  src/app/App.js → src/components/QuickReportModal.js
- `App()` --indirect_call--> `BigCelebration()`  [INFERRED]
  src/app/App.js → src/app/BigCelebration.js
- `App()` --indirect_call--> `DemoLayer()`  [INFERRED]
  src/app/App.js → src/app/DemoLayer.js
- `App()` --indirect_call--> `EggHub()`  [INFERRED]
  src/app/App.js → src/app/EggHub.js

## Import Cycles
- 2-file cycle: `src/app/core.js -> src/lib/save-user-profile.js -> src/app/core.js`
- 2-file cycle: `src/app/App.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/home/HomePage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/petition/PetitionPage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/lib/save-user-profile.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/community/CommunityPage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/app/SignupNudge.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/press/PressPage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/reports/ReportsPage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/components/QuickReportModal.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/profile/ProfilePage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/pages/about/AboutPage.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/app/Mascot.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/app/AuthModal.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/AdminLogin.js -> src/app/core.js -> src/app/App.js -> src/app/AdminLogin.js`
- 3-file cycle: `src/app/AmbientLight.js -> src/app/core.js -> src/app/App.js -> src/app/AmbientLight.js`
- 3-file cycle: `src/app/App.js -> src/app/BigCelebration.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/app/ChangePasswordModal.js -> src/app/core.js -> src/app/App.js`
- 3-file cycle: `src/app/App.js -> src/app/CommandPalette.js -> src/app/core.js -> src/app/App.js`
- 4-file cycle: `src/app/App.js -> src/pages/admin/AdminPanel.js -> src/pages/admin/AdminSiteTab.js -> src/app/core.js -> src/app/App.js`

## Communities (89 total, 21 thin omitted)

### Community 0 - "Shared data & press numbers"
Cohesion: 0.06
Nodes (64): PRESS_URL, SAT_N, SAT_RECENT, SOURCES, STADIUM_N, AssociationTab(), PressQR(), Redirect35Card() (+56 more)

### Community 1 - "Watch skill config"
Cohesion: 0.12
Nodes (31): ConfigError, get_config(), load_api_key(), load_gemini_key(), parse_env(), positive_number(), read_env_file(), read_env_text() (+23 more)

### Community 2 - "Watch frame sampling"
Cohesion: 0.13
Nodes (21): _dedupe_by_deltas(), dedupe_perceptual(), _emitted_frames(), _even_indices(), _even_sample(), extract(), extract_at_timestamps(), extract_keyframes() (+13 more)

### Community 3 - "Watch transcription"
Cohesion: 0.10
Nodes (16): normalize_segments(), Segments, audio_duration(), _build_multipart(), extract_audio(), plan_chunks(), _post_whisper(), _read_error_body() (+8 more)

### Community 4 - "Easter eggs & palette"
Cohesion: 0.20
Nodes (23): CatchGame(), g2pSfx(), EggHub(), eggSave(), FunEggs(), FunPanel(), MascotToggle(), Mascot() (+15 more)

### Community 5 - "Watch CLI options"
Cohesion: 0.11
Nodes (16): frame_cap(), is_url(), auto_fps(), auto_fps_focus(), _clamp_fps(), format_time(), merge_frames(), parse_timestamps() (+8 more)

### Community 6 - "Core state & courts"
Cohesion: 0.10
Nodes (16): COURTS_TGM, DEMO_Q, loadQRious(), NBH_N, roDe(), _sfxCtx, SITE, COURTS_BASE (+8 more)

### Community 7 - "Impact page"
Cohesion: 0.16
Nodes (21): COUNCIL_DATES, useApp(), Reveal(), HOOD_COURT_MAP, PROIECTE, BudgetViz(), BudgetWatchdog(), CarbonCalc() (+13 more)

### Community 8 - "Hero 3D scene"
Cohesion: 0.08
Nodes (26): soccerCells(), HERO_ICON, ballDir(), ballMaterial(), ballPebbles(), bballLines(), bballSeamDist(), buildAsphalt() (+18 more)

### Community 9 - "Community & notifications"
Cohesion: 0.19
Nodes (20): NotifPanel(), COMMUNITY_TABS, HOOD_DISPLAY, isMentor(), useNotifications(), activityMsg(), activityCity(), realActivity() (+12 more)

### Community 10 - "Quick report & AI photo"
Cohesion: 0.17
Nodes (17): RQ_MAX, RQ_WIN, AiPhotoHint(), QuickReportFAB(), QuickReportModal(), rqMark(), rqRecent(), BADGES (+9 more)

### Community 11 - "App shell & auth"
Cohesion: 0.14
Nodes (22): AdminLogin(), AmbientLight(), App(), HeatWatcher(), isPhone(), pageFromHash(), ReportHashListener(), Toast() (+14 more)

### Community 12 - "Ambient effects & install"
Cohesion: 0.20
Nodes (8): db, G2P_SUNSET, PLEDGE_EMOJIS, PX_COLORS, PX_COOLDOWN_MS, PX_GRID, ResultsBoard(), useFbCount()

### Community 13 - "Pages workflow"
Cohesion: 0.07
Nodes (26): concurrency, cancel-in-progress, group, environment, runs-on, steps, name, url (+18 more)

### Community 14 - "Court detail & badges"
Cohesion: 0.22
Nodes (18): SatFinding(), BadgeUnlockModal(), CourtConditionQuick(), TASK_TEMPLATES, useBadges(), logActivity(), bumpStreak(), ActiveGames() (+10 more)

### Community 15 - "Hero 3D builders"
Cohesion: 0.10
Nodes (9): mountHero3D(), bldg(), bottle(), kn(), playersLeave(), rnd(), setRenov(), snapshotGrey() (+1 more)

### Community 16 - "Satellite time machine"
Cohesion: 0.17
Nodes (16): SatSwipe(), tmCache, WB_MAP, WB_TILE, tmFmt(), tmSpan(), tmJson(), tmPrecomputed() (+8 more)

### Community 17 - "Sibiu data enrichment"
Cohesion: 0.09
Nodes (17): attribution, commonsPhoto(), courts, DRY, hoods, MERGE, nameCount, NO_PHOTOS (+9 more)

### Community 18 - "Deploy safety gates"
Cohesion: 0.10
Nodes (16): fail, html, src, testImgs, walk(), walkSrc(), CHROME, CITIES (+8 more)

### Community 19 - "Admin panel"
Cohesion: 0.27
Nodes (14): COURTS_ALL, useFirebase(), extraCourts(), downloadFile(), AdminGodTab(), AdminModTab(), AdminPanel(), AdminSherifsTab() (+6 more)

### Community 20 - "Watch downloads"
Cohesion: 0.23
Nodes (12): auth_args(), _common(), download(), download_url(), fetch_captions(), network_diagnostic(), _new_run(), _read_metadata() (+4 more)

### Community 21 - "Build config"
Cohesion: 0.12
Nodes (17): description, devDependencies, vite@^8.3.8, vite-plugin-singlefile@^2.0.3, name, private, scripts, build (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (11): TiltDiv(), useReveal(), useTilt(), City3D(), hexA(), FeaturedCourt(), HomeAiCard(), HomePage() (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.19
Nodes (14): AI_LETTER_EXAMPLES, CITY_HALL_EMAIL, CITY_RO, aiEstimateOf(), AiLetterModal(), letterEvidence(), letterPhotos(), CourtHealthRing() (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (17): agreement, ais, audit, consensus(), dir, files, FIND, humans (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (17): RFC-4180, ACCESS, byId, cols, csv, data, dataUrl, DRY (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.26
Nodes (8): CityDataPending(), InequalityReceipt(), T, hoodName(), gapReady(), scoredCourts(), HoodChart(), VerifiedShare()

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (16): background_color, categories, description, dir, display, icons, id, lang (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.19
Nodes (9): data, t, extractConst(), extractFunction(), html, load(), root, sliceBalanced() (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.27
Nodes (11): SibiuProgressBanner(), SibiuProgressBannerInner(), getCourtWeather(), verifyByCourt(), verifyConsensus(), CourtSourcesCard(), verifyLabel(), BookingModal() (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.27
Nodes (10): ask(), build_prompt(), _call(), _clock(), delete_file(), _error_message(), _fail(), is_youtube() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (6): child_env(), command(), executable_path(), run_inference(), sentinel_for(), transcribe_audio()

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (9): ACTIVE_CITY, Footer(), footerSources(), footerSrcLabel(), PrivacyPolicyModal(), cityName(), AtlasSportCard(), CityHallGuide() (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.28
Nodes (10): EggCollection(), ThemeBoard(), THEME_FX_ALT, themeFxBlocked(), streakDateStr(), switchTheme(), BadgesGrid(), ProfilePage() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (11): MapView(), REPORT_CATS, REPORT_STAGES, escHtml(), reportStage(), waitText(), fmtDay(), ReportCard() (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (10): MILESTONES, LetterModal(), PetitionAccountStep(), PetitionMilestoneBar(), LetterCounter(), MilestoneConfetti(), PetitionPage(), PetitionSteps() (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (10): ALLOWED, callClaude(), clean(), COST_BANDS, courtFacts(), endpoint(), hits, ISSUE_TYPES (+2 more)

### Community 38 - "Community 38"
Cohesion: 0.14
Nodes (8): { chromium }, CUES_ONLY, LANG, ONLY, require, root, server, TYPES

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (5): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system()

### Community 40 - "Community 40"
Cohesion: 0.28
Nodes (8): BigCelebration(), loadThree(), tryOne(), fxReduced(), makeMascotBall(), COURT_FRAG, HomeOpener(), startCourtShader()

### Community 41 - "Community 41"
Cohesion: 0.24
Nodes (9): CitySwitch(), Navbar(), bothCities(), Onboarding(), FlagIcon(), LangFlip(), CITY_CFG, LANG_NAMES (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (11): byId, capturesFor(), counts, courts, html, j(), out, queue (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (7): outDir, plan, polys, r, root, tilesDir, want

### Community 44 - "Community 44"
Cohesion: 0.23
Nodes (5): CITY_HALL, COURTS, LETTER_AREAS, loadJsPDF(), DossierButton()

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (8): DEMO_TOTAL, demoClock(), DemoLayer(), demoShow(), DemoSlide(), DEMO_WHO, DEMO_QA, DEMO_STEPS

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (7): RequestTracker(), CITY_REQUESTS, CITY_544, COURT_ADMIN, LETTER_BASIS, deadlineState(), LettersTracker()

### Community 47 - "Community 47"
Cohesion: 0.36
Nodes (7): compressImage(), courtStatusView(), anonName(), EventsTab(), GalleryTab(), ProposeGame(), EvidenceWall()

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (12): animate(), cheer(), fitHits(), frontSpot(), hoopPhysics(), lowerQuality(), onResize(), score() (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (12): backOut(), burst(), cineFrame(), cue(), drawCourt(), finishCine(), pickSpot(), playersEnter() (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (7): feats, html, match, pitches, root, rows, SPORT

### Community 51 - "Community 51"
Cohesion: 0.21
Nodes (11): cfg, cfgFile, data, desc(), file, hoods, html, isVerified() (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (9): outDir, outFile, plan, prompt(), review(), reviews, root, SCHEMA (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.24
Nodes (3): detect_domain(), _load_csv(), search()

### Community 55 - "Community 55"
Cohesion: 0.20
Nodes (4): pitches, places, releases, prefix

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (9): at, courts, dist(), html, i, out, pitches, root (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.20
Nodes (8): byCourt, dir, files, pairs, root, rows, SCHEMA, team

### Community 58 - "Community 58"
Cohesion: 0.39
Nodes (8): CivicMomentum(), dot(), draw(), drawOrbit(), mk(), pos(), sphere(), sync()

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (3): format_ascii_box(), format_markdown(), generate_design_system()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (6): box(), gable(), makePlayer(), limb(), pyr(), sk()

### Community 62 - "Community 62"
Cohesion: 0.53
Nodes (5): MayorMode(), drawCourt(), frame(), layout(), rr()

### Community 63 - "Community 63"
Cohesion: 0.60
Nodes (4): RATE_DIMS, RadarChart(), RatingSection(), StarPicker()

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (5): Hero3D(), toggle(), heroBuzz(), heroIsDay(), LetterReveal()

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (6): lerp(), applyGoalDamage(), applyLook(), applyRenovState(), applyStage(), restoreGrey()

### Community 66 - "Community 66"
Cohesion: 0.60
Nodes (5): CityPulse(), draw(), loop(), proj(), spawn()

### Community 70 - "Community 70"
Cohesion: 0.50
Nodes (3): expected_outcome, name, schema_version

### Community 71 - "Community 71"
Cohesion: 0.50
Nodes (3): expected_outcome, name, schema_version

### Community 74 - "Community 74"
Cohesion: 0.83
Nodes (3): _rrect(), WantedPoster(), _wrapText()

### Community 77 - "Community 77"
Cohesion: 1.00
Nodes (3): clink(), kick(), updKnock()

## Knowledge Gaps
- **18 isolated node(s):** `RFC-4180`, `_qrP`, `COUNCIL_DATES`, `satFindCache`, `SOCCER_CELLS` (+13 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 392 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useApp()` connect `Impact page` to `Shared data & press numbers`, `Easter eggs & palette`, `Core state & courts`, `Hero 3D scene`, `Community & notifications`, `Quick report & AI photo`, `App shell & auth`, `Ambient effects & install`, `Court detail & badges`, `Satellite time machine`, `Admin panel`, `Community 22`, `Community 23`, `Community 26`, `Community 30`, `Community 33`, `Community 34`, `Community 35`, `Community 36`, `Community 40`, `Community 41`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 58`, `Community 62`, `Community 63`, `Community 64`, `Community 66`, `Community 73`, `Community 74`, `Community 76`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `mountHero3D()` (e.g. with `animate()` and `endDrag()`) actually correct?**
  _`mountHero3D()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RFC-4180`, `_qrP`, `COUNCIL_DATES` to the rest of the system?**
  _18 weakly-connected nodes found - possible missing edges._
- **Should `Shared data & press numbers` be split into smaller, more focused modules?**
  _Cohesion score 0.06424050632911392 - nodes in this community are weakly interconnected._
- **Why does `mountHero3D()` connect `Hero 3D builders` to `Community 64`, `Community 65`, `Easter eggs & palette`, `Hero 3D scene`, `Community 40`, `Community 75`, `Community 77`, `Community 48`, `Community 49`, `Community 60`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Watch skill config` be split into smaller, more focused modules?**
  _Cohesion score 0.12367149758454106 - nodes in this community are weakly interconnected._
- **Why does `g2pSfx()` connect `Easter eggs & palette` to `Shared data & press numbers`, `Community 34`, `Core state & courts`, `Hero 3D scene`, `Community 41`, `Quick report & AI photo`, `App shell & auth`, `Ambient effects & install`, `Community 77`, `Community 47`, `Hero 3D builders`, `Community 48`, `Community 49`, `Community 23`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._