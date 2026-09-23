/* ============================================
   Portfolio — script.js
   Theme, nav, scroll reveal, hero terminal, project modal
   ============================================ */

const html = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ── Theme ────────────────────────────────────
// The inline <head> script has already set data-theme before first paint.
const themeToggle = document.getElementById('theme-toggle');

function updateThemeIcon(theme) {
    const use = themeToggle.querySelector('use');
    if (use) use.setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
}

function setTheme(theme, save) {
    html.dataset.theme = theme;
    if (save) { try { localStorage.setItem('theme', theme); } catch (e) {} }
    updateThemeIcon(theme);
}

updateThemeIcon(html.dataset.theme);

themeToggle.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reducedMotion.matches) return setTheme(next, true);
    // New theme wipes in as a circle from the button. Element transitions are
    // paused so the "after" snapshot is the finished theme, not frame one of
    // a 0.22s colour fade.
    const r = themeToggle.getBoundingClientRect();
    html.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    html.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    html.classList.add('theme-switching');
    const vt = document.startViewTransition(() => setTheme(next, true));
    vt.finished.finally(() => html.classList.remove('theme-switching'));
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
});

// ── Mobile Nav ───────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

const overlay = document.createElement('div');
overlay.className = 'mobile-overlay';
document.body.appendChild(overlay);

function toggleMenu() {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) toggleMenu();
    });
});

// ── Smooth Scroll ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#project/')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
});

// ── Navbar hide/show, active link, back to top ─
let lastScroll = 0;
let ticking = false;
const header = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

function onScroll() {
    const scrollY = window.scrollY;

    header.classList.toggle('scrolled', scrollY > 50);
    if (scrollY > 300) header.classList.toggle('hidden', scrollY > lastScroll);
    else header.classList.remove('hidden');
    backToTop.classList.toggle('show', scrollY > 500);

    let current = '';
    sections.forEach(s => {
        const top = s.getBoundingClientRect().top;
        if (top <= 120 && top + s.offsetHeight > 120) current = s.id;
    });
    navAnchors.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    lastScroll = scrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

// ── Scroll Reveal ────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
    // --i staggers siblings by 40ms each: bullets settle in order rather
    // than as one block.
    document.querySelectorAll(
        '.exp-card, .exp-points li, .featured-project, .project-tile, .about-grid, .awards, .contact-container'
    ).forEach(el => {
        el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
    hydrateShots(document);
    initProjectModal();
    document.querySelectorAll('[data-more]').forEach(el => {
        const n = (PROJECTS[el.dataset.more] || {}).shots?.length || 0;
        if (n) el.textContent = `${n} screenshots`;
    });
});

// ── Terminal ─────────────────────────────────
// Replays real work instead of restating the hero. Output values are
// illustrative; the PR count and the <1 °C figure are the real ones.
const commands = [
    {
        cmd: 'gh pr list --author @me --state merged | wc -l',
        output: [
            '<span class="out-dim"># UBC-Solar/firmware_v4</span>',
            '<span class="out-val">6</span>',
        ],
    },
    {
        cmd: 'cat /dev/mdi/pt1000',
        output: [
            '<span class="out-fw">24.6 °C</span>  <span class="out-dim">MAX31865 · fault=none · verified ±1 °C</span>',
        ],
    },
    {
        cmd: 'go run ./data-plane-local',
        output: [
            '<span class="out-key">INTENT</span>  agent-7  read   orders',
            '<span class="out-val">RESULT</span>  agent-7  read   orders   rows=42',
            '<span class="out-fw">DENIED</span>  agent-7  write  payroll  <span class="out-dim">fail-closed</span>',
        ],
    },
];

const heroTerminal = document.querySelector('.hero-terminal');
const termBody = heroTerminal.querySelector('.terminal-body');
const termTitle = heroTerminal.querySelector('.terminal-title');
let typedCmd, termOutput;
let cmdIndex = 0;
let charIndex = 0;
let currentTimeout = null;

function resetTerminal() {
    // Output above, live prompt below, like a real shell.
    termBody.innerHTML = `
        <div class="terminal-output"></div>
        <div class="terminal-line">
            <span class="prompt">$</span> <span class="cmd"></span><span class="cursor-blink">|</span>
        </div>`;
    typedCmd = termBody.querySelector('.cmd');
    termOutput = termBody.querySelector('.terminal-output');
    cmdIndex = 0;
    charIndex = 0;
}

function typeCommand() {
    if (cmdIndex >= commands.length) {
        cmdIndex = 0;
        typedCmd.textContent = '';
        termOutput.innerHTML = '';
        currentTimeout = setTimeout(typeCommand, 2000);
        return;
    }

    const { cmd, output } = commands[cmdIndex];

    if (charIndex < cmd.length) {
        typedCmd.textContent += cmd[charIndex++];
        currentTimeout = setTimeout(typeCommand, 35 + Math.random() * 35);
        return;
    }

    charIndex = 0;
    const lines = output.map(line => `<div class="out-line">${line}</div>`).join('');
    termOutput.insertAdjacentHTML('beforeend',
        `<div class="out-line out-cmd"><span class="prompt">$</span> <span class="cmd">${cmd}</span></div>${lines}<br>`);
    // Keep the newest line in view inside the fixed-height body.
    termBody.scrollTop = termBody.scrollHeight;
    typedCmd.textContent = '';
    cmdIndex++;
    currentTimeout = setTimeout(typeCommand, cmdIndex < commands.length ? 1500 : 4000);
}

resetTerminal();
if (reducedMotion.matches) {
    // No typing: show the finished session.
    termOutput.innerHTML = commands.map(({ cmd, output }) =>
        `<div class="out-line out-cmd"><span class="prompt">$</span> <span class="cmd">${cmd}</span></div>` +
        output.map(line => `<div class="out-line">${line}</div>`).join('') + '<br>').join('');
} else {
    currentTimeout = setTimeout(typeCommand, 1600);
}

// Red button: kernel panic, then reboot.
document.getElementById('term-close').addEventListener('click', () => {
    if (heroTerminal.classList.contains('crashed')) return;
    clearTimeout(currentTimeout);
    heroTerminal.classList.add('crashed');

    setTimeout(() => {
        termBody.innerHTML = `
            <div class="terminal-crash-screen">
                <span class="crash-header"> KERNEL PANIC </span><br>
                HardFault_Handler: stacking error<br>
                <span style="opacity:0.6">watchdog reset in 3s...</span>
                <div class="terminal-reboot">Rebooting in 3s...</div>
            </div>`;
        termTitle.textContent = 'martin@dev — PANIC';

        let countdown = 3;
        const tick = setInterval(() => {
            countdown--;
            const el = termBody.querySelector('.terminal-reboot');
            if (el) el.textContent = countdown > 0 ? `Rebooting in ${countdown}s...` : 'Rebooting...';
        }, 1000);

        setTimeout(() => {
            clearInterval(tick);
            heroTerminal.classList.remove('crashed');
            termTitle.textContent = 'martin@dev ~';
            resetTerminal();
            currentTimeout = setTimeout(typeCommand, 800);
        }, 3500);
    }, 450);
});

// Yellow button: minimize / restore the body.
document.getElementById('term-minimize').addEventListener('click', () => {
    heroTerminal.classList.toggle('minimized');
});

function escapeHtmlStr(str) {
    const div = document.createElement('div');
    div.textContent = str;
    // textContent -> innerHTML escapes < > &, but not quotes. This value is
    // interpolated into attributes (data-alt="..."), so a caption containing a
    // double quote would break out of the attribute without this.
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Console Easter Egg ───────────────────────
console.log(
    '%c Hey! 👋',
    'color: #E0A32E; font-size: 20px; font-weight: bold; font-family: monospace;'
);
console.log(
    '%c Curious about the code? Check it out: https://github.com/martinw500/portfolio',
    'color: #A39A8F; font-size: 13px; font-family: monospace;'
);

// ── Project modal ────────────────────────────
const PROJECTS = {
    songless: {
        title: 'Songless',
        overline: '100k+ visits',
        github: 'https://github.com/martinw500/songless',
        live: 'https://songless-zeta.vercel.app',
        tech: ['React', 'TypeScript', 'Vite', 'Cloudflare R2', 'Web Audio'],
        shots: [
            { src: 'songless-cover.png', caption: 'Five difficulty pools decide how much of the intro you hear. The clip grows each time you miss.' },
            { src: 'songless-1.png', caption: 'Search matches aliases as well as titles, so a half-remembered name still finds the track.' },
            { src: 'songless-2.png', caption: 'Filters narrow the pool by era and genre, and the count updates before you commit to a mix.' },
            { src: 'songless-3.png', caption: 'Harder pools start from shorter clues. Expert opens on a hundredth of a second.' },
        ],
        body: [
            'A music guessing game with 100k+ visits. You hear a sliver of a song intro and name it; each miss buys you a longer clip. After a win or a full miss, the complete track streams from R2. Vercel only serves the app and a small catalogue JSON.',
        ],
        points: [
            'Stage-locked Web Audio clues (0.01s–15s). Playing locks the round, so the clip cannot change mid-guess.',
            'Clue MP3s are small; the full 128 kbps master is fetched only on reveal. Decoded audio is LRU-cached (3 songs) so a long session does not hold the library in RAM.',
            'The upload pipeline audits YouTube sources, strips digital silence, encodes, and refuses a batch that would exceed an 8.5 GB R2 cap.',
            'Five difficulty pools, searchable aliases, 120-song live catalogue.',
        ],
    },
    us: {
        title: 'Us',
        overline: '15+ scenes · playable end to end',
        live: 'https://martinw500.github.io/larissa-game/',
        tech: ['Phaser 4', 'TypeScript', 'Vite', 'Playwright'],
        shots: [
            { src: 'us-cover.png', caption: 'Title screen. The polaroids are art from scenes further in, so the menu previews where the story goes.' },
            { src: 'us-1.png', caption: 'It opens on a lock screen. One Instagram notification at 1:07am is the whole inciting incident.' },
            { src: 'us-2.png', caption: 'The Pit, party night. Lit floor panels, a mirror ball and a crowd of NPCs.' },
            { src: 'us-3.png', caption: 'The drive home is its own view: dashboard, windshield, and the drinks on the console.' },
            { src: 'us-4.png', caption: 'Inside Molly Tea. Order and pickup are interaction points, flagged with the prompt marker used across the game.' },
            { src: 'us-5.png', caption: 'Dinner at Hestia. Warm interior lighting against the daylight exteriors.' },
            { src: 'us-6.png', caption: 'The confession. E advances a line, Q rewinds to one you have already read.' },
        ],
        body: [
            'A full browser story game: 15+ scenes, save and fast travel, dialogue with rewind, audio buses, and a first-run tutorial. Gen 3 Pokémon scale and outlines; the maps are real UBC and Vancouver places.',
        ],
        points: [
            'A shared BaseScene handles collision, interaction, menus and discovery-gated travel.',
            'Playwright tests assert lighting, walk cycles and collision, so a scene cannot silently regress.',
            'Keyboard-first on desktop, D-pad + A on touch, one cog menu. Playable end to end.',
        ],
    },
    uth: {
        title: 'Useful Tool Hub',
        overline: 'Ten tools, no accounts',
        github: 'https://github.com/martinw500/UTH',
        live: 'https://martinw500.github.io/UTH/',
        tech: ['JavaScript', 'Python', 'Vercel'],
        shots: [
            { src: 'uth-1.png', caption: 'Ten tools in one page, grouped by what they do. The "On device" badge marks the ones that never upload your file.' },
            { src: 'uth-2.png', caption: 'File conversion running in the browser through Canvas and FFmpeg.wasm. Nothing leaves the machine.' },
        ],
        body: [
            'Ten small utilities in one page, the ones I actually use. Convert, edit, QR and PDF run in the browser (Canvas, FFmpeg.wasm). The YouTube and Instagram downloaders call Vercel Python functions.',
        ],
        points: [
            'On-device converters never upload the file.',
        ],
    },
    nutritracker: {
        title: 'NutriTracker',
        overline: 'In progress',
        github: 'https://github.com/martinw500/Nutritracker',
        live: 'https://nutritracker-mocha.vercel.app',
        tech: ['TypeScript', 'Postgres', 'USDA FDC'],
        shots: [
            { src: 'nutritracker-1.png', caption: 'The daily view scores intake against estimated need and flags which of the 59 tracked nutrients are short.' },
            { src: 'nutritracker-2.png', caption: 'Macronutrients are shown as acceptable ranges rather than single targets, because that is how the reference data is actually published.' },
        ],
        body: [
            'A nutrition tracker that scores meals on 59 micronutrients and phytonutrients from USDA FoodData Central. Photo logging is designed so a model only names the food; nutrient numbers come from the database, never from the model.',
        ],
        points: [
            'Status: the interface runs on labelled demo data while the Postgres and auth foundation is finished.',
            'No composite “health scores.” Claims carry an evidence tier.',
        ],
    },
    haar: {
        title: 'Haar Wavelet Compressor',
        overline: 'NumPy, no codec library',
        github: 'https://github.com/martinw500/Haar-Wavelet-Image-Compressor',
        live: '',
        tech: ['Python', 'NumPy'],
        shots: [],
        body: [
            'An image compressor built from the Haar wavelet transform, applied per RGB channel as matrix operations in NumPy. Threshold and iteration sliders with a live preview.',
        ],
        points: [],
    },
};

function hydrateShots(root) {
    root.querySelectorAll('.shot[data-shot]').forEach(el => {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        el.classList.add('is-empty');
        const img = new Image();
        img.alt = el.dataset.alt || '';
        img.onload = () => {
            el.classList.remove('is-empty');
            el.classList.add('has-image');
            el.appendChild(img);
        };
        img.src = el.dataset.shot;
    });
}

function shotMarkup(shot) {
    // The caption doubles as the image's alt text: one description, written once.
    return `<figure class="pm-figure">
        <div class="shot is-empty" data-shot="assets/projects/${shot.src}" data-alt="${escapeHtmlStr(shot.caption)}"></div>
        <figcaption class="pm-figcaption">${escapeHtmlStr(shot.caption)}</figcaption>
    </figure>`;
}

function renderProject(id) {
    const p = PROJECTS[id];
    const links = [
        p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live ↗</a>` : '',
        p.github ? `<a href="${p.github}" target="_blank" rel="noopener">Code ↗</a>` : '',
    ].join('');
    return `
        <p class="pm-overline mono">${p.overline}</p>
        <h2 class="pm-title" id="project-modal-title">${p.title}</h2>
        <ul class="pm-tech">${p.tech.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="pm-links mono">${links}</div>
        <div class="pm-body">${p.body.map(t => `<p>${t}</p>`).join('')}</div>
        ${p.points.length ? `<ul class="pm-points">${p.points.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
        ${p.shots.length ? `<div class="pm-shots">${p.shots.map(shotMarkup).join('')}</div>` : ''}
    `;
}

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('project-modal-body');

    function openProject(id, pushHash) {
        if (!PROJECTS[id]) return;
        body.innerHTML = renderProject(id);
        hydrateShots(body);
        if (!modal.open) modal.showModal();
        modal.querySelector('.project-modal-panel').scrollTop = 0;
        document.body.classList.add('modal-open');
        if (pushHash) history.pushState({ project: id }, '', `#project/${id}`);
    }

    // Runs on every close path: the × button, Esc, a backdrop click, Back.
    modal.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        // Locking body scroll for the modal moves the page, so the scroll
        // handler wakes up comparing against a stale offset and decides you
        // scrolled down, leaving the nav parked off-screen. Resync it.
        lastScroll = window.scrollY;
        header.classList.remove('hidden');
        if (location.hash.startsWith('#project/')) {
            history.pushState({}, '', location.pathname + location.search);
        }
    });

    document.querySelectorAll('[data-project]').forEach(card => {
        const open = () => openProject(card.dataset.project, true);
        card.addEventListener('click', e => {
            if (e.target.closest('a')) return;
            open();
        });
        card.addEventListener('keydown', e => {
            if (e.target !== card) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });

    modal.querySelector('[data-modal-close]').addEventListener('click', () => modal.close());
    // The panel fills the dialog, so a click whose target is the dialog
    // itself landed on the ::backdrop.
    modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

    window.addEventListener('popstate', () => {
        const id = (location.hash.match(/^#project\/([\w-]+)/) || [])[1];
        if (id) openProject(id, false);
        else if (modal.open) modal.close();
    });

    const initial = (location.hash.match(/^#project\/([\w-]+)/) || [])[1];
    if (initial) openProject(initial, false);
}
