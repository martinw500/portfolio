# Portfolio — martinwu.tech

Personal portfolio for SWE and embedded internship applications. Three files, no build step.

## Hard constraints

- **No build, no npm, no `package.json`.** Vanilla HTML/CSS/JS loaded straight by the browser. Don't introduce a bundler, framework or preprocessor without asking.
- **Push to `main` deploys to production.** `.github/workflows/deploy.yml` copies an explicit list of site files into `_site` and publishes only that: `index.html`, the CSS and JS, `assets/`, the favicons, `CNAME`, `docs/resume.pdf` and `docs/pfp.jpg`. A new top-level file the site needs must be added to that `cp` line or it 404s in production. Notes, `resume.tex` and this file stay private, but the repo itself may be public, so keep tooling scripts out anyway.
- **Both themes must work.** Light/dark via CSS custom properties in `styles.css`. Check every visual change in both.
- **Audience is a hiring reviewer with ~60 seconds.** Content decisions get judged on that, not on completeness.

## Layout

| File | Lines | Contains |
|---|---|---|
| `index.html` | ~360 | Inline theme script, SVG icon sprite, hero (proof strip, CAN trace), About, Experience timeline + Awards, Projects, Contact, `<dialog>` modal |
| `styles.css` | ~1580 | All theming through custom properties on `:root` |
| `script.js` | ~485 | Theme (view-transition wipe), nav, scroll reveal, hero terminal, project modal |

External deps are two Google Fonts families only: **Space Grotesk** (sans) and **IBM Plex Mono** (mono). No Font Awesome — icons are an inline `<svg><defs>` sprite at the top of `<body>`, referenced with `<use href="#i-name">` and sized in `em` by `.icon`.

## Design tokens

Warm ink and paper. Honey (`--accent`) marks software and copper (`--accent-2`) marks firmware; the colour encodes which side of the work something is, so don't use copper as decoration. The palette is deliberately *not* the `#0a192f`/`#64ffda` palette this site used to carry, which was copied from brittanychiang.com v4 along with the numbered headings, the alternating project layout, the fixed side rails, folder-icon tiles, `▹` bullets and the offset photo frame. All of that is gone; don't reintroduce it. Every accent passes WCAG AA (≥ 5.2:1) on every background in both themes; recheck any new colour.

## Project screenshots

`PROJECTS` in `script.js` holds a `shots` array per project. Each entry is `{ src, caption }` — the caption renders as the figure's `<figcaption>` *and* as the image's `alt`, so it's written once. `hydrateShots()` swaps a placeholder for the real image once it loads; `.shot.is-empty` frames render as nothing rather than showing filenames.

Captures live in `assets/projects/`. Game shots come from driving the live build with Playwright (seed `localStorage` to skip the gate, seed `howwemet.save`'s `scene` to jump, `howwemet:dev-mode` — note the colon — unlocks travel). **Capture at final size; never downscale pixel art**, which blurs edges and inflates the PNG roughly fourfold.

## Things that will bite you

- **The terminal body is a fixed 300px on purpose.** Its output accumulates three commands then resets. Without a fixed height it swung 200→459→200px on a loop and scored CLS 0.12. It scrolls internally instead. Don't make it auto-height.
- **`escapeHtmlStr()` escapes quotes as well as angle brackets**, because its output is interpolated into `data-alt="…"` attributes. `textContent`→`innerHTML` alone does not escape quotes.
- **The modal's `close` listener resyncs `lastScroll` and clears `header.hidden`.** Locking body scroll for the modal moves the page, so the scroll handler otherwise concludes you scrolled down and parks the nav off-screen. Every close path (×, Esc, backdrop, Back) goes through the native `close` event, so keep cleanup there.
- **The theme is set by an inline script in `<head>`**, before first paint. `script.js` only toggles it. The toggle adds `html.theme-switching` to pause element transitions during the view-transition wipe; without it the new snapshot captures frame one of every colour fade.
- **`.fade-up` needs an inline `--delay`.** Without one every hero element lands at once, which is how the stagger was silently broken before.
- **`.hero` reserves `--nav-height` in its padding**, including in the `max-width: 768px` media query. Without both, the name sits under the fixed header and is invisible on load on a phone.
- **Specificity:** `.pm-shots .shot.is-empty` is scoped to `.is-empty` so it can't crop real images. An equal-specificity rule later in the file will silently win.

## Elsewhere

- `docs/resume.tex` is the source of truth for experience, education and awards; `docs/resume.pdf` is what the site links. Rebuild with `tectonic docs/resume.tex`. Keep the site and the resume consistent.
- Two repos are private and their links 404 for visitors, so the site deliberately links only their live demos: `ericx057/supercluster` and `martinw500/larissa-game`.
