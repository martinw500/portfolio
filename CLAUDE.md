# Portfolio — martinwu.dev

Personal portfolio for SWE and embedded internship applications. Three files, no build step.

## Hard constraints

- **No build, no npm, no `package.json`.** Vanilla HTML/CSS/JS loaded straight by the browser. Don't introduce a bundler, framework or preprocessor without asking.
- **Push to `main` deploys to production.** `.github/workflows/deploy.yml` copies an explicit list of site files into `_site` and publishes only that: `index.html`, the CSS and JS, `assets/`, the favicons, `CNAME`, `docs/resume.pdf` and `docs/pfp.jpg`. A new top-level file the site needs must be added to that `cp` line or it 404s in production. Notes, `resume.tex` and this file stay private, but the repo itself may be public, so keep tooling scripts out anyway.
- **Both themes must work.** Light/dark via CSS custom properties in `styles.css`. Check every visual change in both.
- **Audience is a hiring reviewer with ~60 seconds.** Content decisions get judged on that, not on completeness.

## Layout

| File | Lines | Contains |
|---|---|---|
| `index.html` | ~330 | Inline theme script, sticky bar, hero with the Hardware/Software diagram, Projects (software panels + firmware list), Firmware deep-dive (signal path, live CAN table, bench photos), Experience, Skills (bay photo + tools), Contact, footer |
| `styles.css` | ~390 | Tokens on `:root` / `[data-theme="dark"]`, sections in page order, then `1099px`, `860px` and `599px` queries, then motion |
| `script.js` | ~120 | Theme toggle, scroll reveal, the hero switch and its phone legend, live CAN frames |

One font: **Archivo** (400–700) from Google Fonts. No icons, no monospace.

## Design

Third attempt, and the one Martin picked. v1 (dark, giant serif) was "too AI, over the top"; v2 (quiet white column) "looks like a high-schooler's basic HTML". From a 22-site reference gallery he liked Brittany Chiang's easy structure but not its overused look, found most creative portfolios too flashy ("I'm not a creative designer"), and liked Teenage Engineering's hardware feel but not its navigation. From three mockups he chose **"product diagram"**: grey ground, off-white panels, black ink, an orange-red accent used only on diagram dots and bullets, a plain sticky top bar.

- The hero is a labelled diagram with a **Hardware | Software** switch: the RTD breakout on the MDI board, or Songless on a phone. He asked for software to weigh as much as embedded, so Projects leads with the web apps and the firmware follows.
- Callouts are positioned by `--x`/`--y` percentages on the picture. The hero board crop (`hero-board.jpg`, 1050×1150) is fixed so those numbers stay true; recrop it and they all move. The phone image is sized to exactly the board's height (`width: 50.63%`), so the panel doesn't jump when switching.
- On phones the labels become a numbered key under the picture, built by `script.js` from the labels themselves.
- Five sizes only (`--step-small/body/lead/head/display`).

taste-skill is the tool here, not the boss: its sheet dealt Switzer, and the page uses Archivo because Martin chose mockup C, so `inspect.mjs` shows one expected WARN (`font-not-dealt`). Its other house rules hold. The PCAN-View table is a real interface fragment marked `data-ui`, and its CAN bytes plus the diagram's leader lines carry `taste-skill-ignore` comments.

## Pictures

Hardware photos are in `assets/photos/`, cut from Martin's originals (gitignored `temp-photos/`) at render size with `sips`/`ffmpeg`. HEICs carry EXIF rotation, so re-encode through `ffmpeg` to bake it in. The thermal clip is a 6 s muted H.264 loop. Captions say what the picture is and never make accuracy claims: the heat-gun thermocouple sat at a different spot from the RTD.

Project screenshots are in `assets/projects/`. NutriTracker and Math Quiz were captured from their live sites with Playwright; `hero-songless.jpg` is the live Songless at 390×844 with "bohem" typed in the search. Game shots come from driving the live build (seed `localStorage` to skip the gate, seed `howwemet.save`'s `scene` to jump, `howwemet:dev-mode` — note the colon — unlocks travel). **Capture at final size; never downscale pixel art.**

Content rules: every line has to tell a recruiter a fact; no slogans, no lines describing the page itself (Martin called out "My bench kit is…" and the old "work that has to hold up outside my laptop" line). Don't invent motives, feelings or habits for him; ask instead. The humanizer plugin (blader/humanizer, user scope) is installed for copy passes. The Us card uses a gameplay shot inside Molly Tea (`us-mollytea.png`); Martin rejected the title screen (just pink) and the sunset shot (doesn't show off enough). The dorm was tried too, but the game draws it small in a dark field. To capture a scene, seed `howwemet.gate`=1, `howwemet.tutorial`=1 and `howwemet.save`={v:1,flags:[],discovered:[scene],album:[],scene} then press E on CONTINUE. NutriTracker is described as in progress, because its own `docs/STATUS.md` says the UI still runs on demo data. Songless facts come from its README (804 songs, clue stages 0.01–15 s), not the old résumé's "30-second clues". The Roblox game, Trader-Bot and course labs stay off the site.

## Things that will bite you

- **The live CAN table mirrors the firmware**, `firmware/components/mdi/driver/rtd_driver.c` and `app/diagnostic.c` in UBC-Solar/firmware_v4: 0x500 uptime (here, seconds since the page loaded), 0x501 flags (bit 3 = RTD fault), 0x502 = success byte, int32 °C little-endian, debounced fault byte. A leaky counter latches at 5 and clears at 0. Its latched state must keep matching the real capture in the bench photos (`D5 00 00 00` / `08` / `00 00 00 00 00 80`).
- **The theme is set by an inline script in `<head>`**, before first paint, which also adds `html.js`. Hidden entrance states only apply under `html.js`, so content shows when scripts fail.
- **Entrances reveal on scroll position, not IntersectionObserver.** A fast fling or an anchor jump can carry an element past the viewport without it ever intersecting, which left headings invisible. `reveal()` shows anything whose top has passed 92% of the viewport.
- **The off hero view is `display: none`, not faded out.** Hidden-but-laid-out text counts as invisible content to the inspector and to screen readers.
- **Don't put `data-rise` on a `display: contents` element**, and keep section tops as padding, not margin: a heading flush with its section's top edge pokes above it and the inspector calls the section untitled.

## Elsewhere

- `docs/resume.tex` is the source of truth for experience, education and awards; `docs/resume.pdf` is what the site links. Rebuild with `tectonic docs/resume.tex`. Keep the site and the resume consistent.
- Every resume or site claim is checked against the source: the GitHub PRs (closed ones too, since teammates often merged or replaced his branches) and the project repos. The pre-Oct-2026 copy was AI-written and had wrong numbers, so never reuse a fact from it unverified.
- This repo is public. The startup is in stealth: never name it, its repo, investors, clients or vendors anywhere in this repo, including this file.
- Two repos are private and their links 404 for visitors, so the site deliberately links only their live demos: the startup's repo and `martinw500/larissa-game`.
