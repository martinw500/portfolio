/* ============================================
   Portfolio — script.js
   Smooth interactions + terminal animation
   ============================================ */

// ── Theme ────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const t = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', t);
            updateThemeIcon(t);
        }
    });
}

// ── Mobile Nav ───────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Create mobile overlay
const overlay = document.createElement('div');
overlay.className = 'mobile-overlay';
document.body.appendChild(overlay);

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
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
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// ── Navbar Hide/Show on Scroll ───────────────
let lastScroll = 0;
let ticking = false;
const header = document.getElementById('header');

function onScroll() {
    const scrollY = window.scrollY;

    // Add shadow when scrolled
    header.classList.toggle('scrolled', scrollY > 50);

    // Hide/show on scroll direction
    if (scrollY > 300) {
        header.classList.toggle('hidden', scrollY > lastScroll);
    } else {
        header.classList.remove('hidden');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
        const top = s.getBoundingClientRect().top;
        if (top <= 120 && top + s.offsetHeight > 120) {
            current = s.id;
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    lastScroll = scrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
});

// ── Cursor Glow ──────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');

if (window.matchMedia('(hover: hover)').matches && cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        // Smooth lerp
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

// ── Scroll Reveal ────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll(
        '.exp-card, .featured-project, .project-tile, .about-grid, .contact-container'
    );
    els.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 80}ms`;
        revealObserver.observe(el);
    });
    hydrateShots(document);
    initProjectModal();
});

// ── Terminal Typing Animation ────────────────
let typedCmd = document.getElementById('typed-cmd');
let termOutput = document.getElementById('terminal-output');

const commands = [
    {
        cmd: 'cat about.json',
        output: [
            '<span class="out-bracket">{</span>',
            '  <span class="out-key">"name"</span>: <span class="out-val">"Martin Wu"</span>,',
            '  <span class="out-key">"role"</span>: <span class="out-val">"Embedded Systems & Software Engineer"</span>,',
            '  <span class="out-key">"school"</span>: <span class="out-val">"University of British Columbia"</span>,',
            '  <span class="out-key">"focus"</span>: <span class="out-val">["firmware", "orchestration", "full-stack"]</span>,',
            '  <span class="out-key">"currently"</span>: <span class="out-val">"building cool stuff"</span>',
            '<span class="out-bracket">}</span>'
        ]
    },
    {
        cmd: 'ls projects/',
        output: [
            '<span class="out-val">songless/</span>          <span class="out-val">us/</span>',
            '<span class="out-val">cascadia-firmware/</span>  <span class="out-val">useful-tool-hub/</span>'
        ]
    },
    {
        cmd: 'echo $STATUS',
        output: [
            '<span class="out-val">🚀 Building the future.</span>'
        ]
    }
];

let cmdIndex = 0;
let charIndex = 0;
let isTyping = false;
let currentTimeout = null;

function typeCommand() {
    if (cmdIndex >= commands.length) {
        // Loop back
        cmdIndex = 0;
        typedCmd.textContent = '';
        termOutput.innerHTML = '';
        currentTimeout = setTimeout(typeCommand, 2000);
        return;
    }

    const { cmd, output } = commands[cmdIndex];
    isTyping = true;

    if (charIndex < cmd.length) {
        typedCmd.textContent += cmd[charIndex];
        charIndex++;
        currentTimeout = setTimeout(typeCommand, 40 + Math.random() * 40);
    } else {
        // Finished typing command — show output
        isTyping = false;
        charIndex = 0;

        const outputHtml = output.map(line =>
            `<div class="out-line">${line}</div>`
        ).join('');

        // Build previous commands + new output
        const prevHtml = termOutput.innerHTML;
        const newBlock = `<div class="out-line" style="margin-bottom:4px"><span class="prompt">$</span> <span class="cmd">${cmd}</span></div>${outputHtml}<br>`;

        termOutput.innerHTML = prevHtml + newBlock;
        typedCmd.textContent = '';

        cmdIndex++;

        // Next command after pause
        if (cmdIndex < commands.length) {
            currentTimeout = setTimeout(typeCommand, 1500);
        } else {
            currentTimeout = setTimeout(typeCommand, 4000);
        }
    }
}

// Start terminal animation after hero loads
setTimeout(typeCommand, 2000);

// ── Terminal Window Buttons ──────────────────
const heroTerminal = document.querySelector('.hero-terminal');
const termClose = document.getElementById('term-close');
const termMinimize = document.getElementById('term-minimize');
const termMaximize = document.getElementById('term-maximize');
const termTitle = document.querySelector('.terminal-title');

// Red button — "crash" the terminal with a kernel panic, then reboot
if (termClose) {
    termClose.addEventListener('click', () => {
        if (heroTerminal.classList.contains('crashed')) return;

        // Stop the typing animation
        clearTimeout(currentTimeout);
        heroTerminal.classList.add('crashed');

        // Glitch, then show crash screen
        setTimeout(() => {
            const termBody = heroTerminal.querySelector('.terminal-body');
            const originalContent = termBody.innerHTML;

            termBody.innerHTML = `
                <div class="terminal-crash-screen">
                    <span class="crash-header"> KERNEL PANIC </span><br>
                    <span style="color:var(--lightest-slate)">fatal: not a git repository</span><br>
                    Segmentation fault (core dumped)<br>
                    <span style="opacity:0.6">Process terminated with exit code 139</span><br>
                    <span style="opacity:0.6">Stack trace saved to /var/log/core.dump</span><br>
                    <div class="terminal-reboot">Rebooting in 3s...</div>
                </div>
            `;

            termTitle.textContent = '💀 martin@dev — PANIC';

            // Countdown 3..2..1
            let countdown = 3;
            const countdownInterval = setInterval(() => {
                countdown--;
                const rebootEl = termBody.querySelector('.terminal-reboot');
                if (rebootEl) {
                    if (countdown > 0) {
                        rebootEl.textContent = 'Rebooting in ' + countdown + 's...';
                    } else {
                        rebootEl.textContent = 'Rebooting...';
                    }
                }
            }, 1000);

            // Reboot after 3s
            setTimeout(() => {
                clearInterval(countdownInterval);
                heroTerminal.classList.remove('crashed');
                termTitle.textContent = 'martin@dev ~';

                // Reset terminal state
                termBody.innerHTML = `
                    <div class="terminal-line">
                        <span class="prompt">$</span> <span class="cmd" id="typed-cmd"></span><span class="cursor-blink">|</span>
                    </div>
                    <div class="terminal-output" id="terminal-output"></div>
                `;

                // Re-bind references and restart typing
                const newTypedCmd = document.getElementById('typed-cmd');
                const newTermOutput = document.getElementById('terminal-output');
                // Patch global refs
                Object.defineProperty(window, '_typedCmd', { value: newTypedCmd, writable: true });
                Object.defineProperty(window, '_termOutput', { value: newTermOutput, writable: true });
                typedCmd = newTypedCmd;
                termOutput = newTermOutput;

                cmdIndex = 0;
                charIndex = 0;
                currentTimeout = setTimeout(typeCommand, 800);
            }, 3500);
        }, 450);
    });
}

// Yellow button — minimize / restore terminal body (hero only)
if (termMinimize) {
    termMinimize.addEventListener('click', () => {
        heroTerminal.classList.remove('maximized');
        heroTerminal.classList.toggle('minimized');
    });
}

// Green button — open fullscreen interactive terminal
if (termMaximize) {
    termMaximize.addEventListener('click', () => {
        heroTerminal.classList.remove('minimized');
        openFullscreenTerminal();
    });
}

// ── Shared terminal state for PIP persistence ──
let activeFsBody = null; // holds the body element across fullscreen/pip transitions

function openFullscreenTerminal(existingBody) {
    // Don't open twice
    if (document.querySelector('.terminal-fullscreen-overlay')) return;
    // Close any existing PIP first (without animation delay)
    const existingPip = document.querySelector('.terminal-pip');
    if (existingPip) existingPip.remove();

    const fsOverlay = document.createElement('div');
    fsOverlay.className = 'terminal-fullscreen-overlay';

    const fsTerminal = document.createElement('div');
    fsTerminal.className = 'terminal-fullscreen';

    // Header with working dots (red = close, yellow = pip, green = disabled in fullscreen)
    const fsHeader = document.createElement('div');
    fsHeader.className = 'terminal-header';
    fsHeader.innerHTML = `
        <div class="terminal-dots">
            <span class="terminal-dot fs-close" style="background:#ff5f56;opacity:0.8;cursor:pointer">
                <svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </span>
            <span class="terminal-dot fs-minimize" style="background:#ffbd2e;opacity:0.8;cursor:pointer">
                <svg viewBox="0 0 12 12"><path d="M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </span>
            <span class="terminal-dot" style="background:#27c93f;opacity:0.8">
                <svg viewBox="0 0 12 12"><path d="M2 10L5 7M7 5l3-3M7.5 2H10v2.5M4.5 10H2V7.5" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
        </div>
        <span class="terminal-title mono">martin@dev ~ (interactive)</span>
    `;

    // Use existing body (from PIP) or create a new one
    let fsBody;
    if (existingBody) {
        fsBody = existingBody;
        fsBody.className = 'fs-term-body';
    } else {
        fsBody = document.createElement('div');
        fsBody.className = 'fs-term-body';
        fsBody.innerHTML = `
            <div class="fs-output-line" style="color:var(--accent)">Welcome to Martin's interactive terminal!</div>
            <div class="fs-output-line" style="color:var(--slate)">Type 'help' for available commands.</div>
            <div class="fs-output-line">&nbsp;</div>
        `;
    }
    activeFsBody = fsBody;

    fsTerminal.appendChild(fsHeader);
    fsTerminal.appendChild(fsBody);
    fsOverlay.appendChild(fsTerminal);
    document.body.appendChild(fsOverlay);
    document.body.style.overflow = 'hidden';

    // Create input line if body is fresh or has no active input
    if (!fsBody.querySelector('.fs-input-line:last-child .fs-input:not([disabled])')) {
        createFsInputLine(fsBody);
    } else {
        // Re-focus existing input
        setTimeout(() => {
            const inp = fsBody.querySelector('.fs-input-line:last-child .fs-input');
            if (inp) inp.focus();
        }, 100);
    }

    // Scroll to bottom
    setTimeout(() => { fsBody.scrollTop = fsBody.scrollHeight; }, 100);

    // Close on red dot
    fsHeader.querySelector('.fs-close').addEventListener('click', () => closeFsTerminal(fsOverlay));

    // Minimize to PIP on yellow dot
    fsHeader.querySelector('.fs-minimize').addEventListener('click', () => {
        minimizeToPip(fsOverlay);
    });

    // Click overlay background to close
    fsOverlay.addEventListener('click', (e) => {
        if (e.target === fsOverlay) closeFsTerminal(fsOverlay);
    });

    // Escape to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeFsTerminal(fsOverlay);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeFsTerminal(fsOverlay) {
    if (fsOverlay.classList.contains('closing')) return;

    const fsTerm = fsOverlay.querySelector('.terminal-fullscreen');
    if (fsTerm) fsTerm.classList.add('closing');
    fsOverlay.classList.add('closing');

    // Wait for both animations to finish
    const cleanup = () => {
        fsOverlay.remove();
        document.body.style.overflow = '';
        activeFsBody = null;
    };
    fsOverlay.addEventListener('animationend', cleanup, { once: true });
    // Fallback in case animationend doesn't fire
    setTimeout(cleanup, 400);
}

function minimizeToPip(fsOverlay) {
    // Grab the body element before removing overlay
    const fsBody = fsOverlay.querySelector('.fs-term-body');
    if (!fsBody) return;

    // Detach body from fullscreen so it doesn't get destroyed
    fsBody.remove();

    // Close fullscreen overlay smoothly
    const fsTerm = fsOverlay.querySelector('.terminal-fullscreen');
    if (fsTerm) fsTerm.classList.add('closing');
    fsOverlay.classList.add('closing');

    const cleanup = () => {
        fsOverlay.remove();
        document.body.style.overflow = '';
    };
    fsOverlay.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 400);

    // Create PIP widget
    createPipTerminal(fsBody);
}

function createPipTerminal(fsBody) {
    // Remove any existing pip
    const existing = document.querySelector('.terminal-pip');
    if (existing) existing.remove();

    const pip = document.createElement('div');
    pip.className = 'terminal-pip';

    // PIP header — only red (close) and green (expand)
    const pipHeader = document.createElement('div');
    pipHeader.className = 'terminal-header';
    pipHeader.innerHTML = `
        <div class="terminal-dots">
            <span class="terminal-dot pip-close" style="background:#ff5f56;opacity:0.8;cursor:pointer">
                <svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </span>
            <span class="terminal-dot pip-expand" style="background:#27c93f;opacity:0.8;cursor:pointer">
                <svg viewBox="0 0 12 12"><path d="M2 10L5 7M7 5l3-3M7.5 2H10v2.5M4.5 10H2V7.5" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
        </div>
        <span class="terminal-title mono" style="font-size:10px">terminal (mini)</span>
    `;

    // Reuse the body
    fsBody.className = 'fs-term-body';
    activeFsBody = fsBody;

    pip.appendChild(pipHeader);
    pip.appendChild(fsBody);
    document.body.appendChild(pip);

    // Scroll to bottom
    setTimeout(() => { fsBody.scrollTop = fsBody.scrollHeight; }, 100);

    // Re-focus input
    setTimeout(() => {
        const inp = fsBody.querySelector('.fs-input-line:last-child .fs-input:not([disabled])');
        if (inp) inp.focus();
    }, 150);

    // Red dot — close PIP entirely
    pipHeader.querySelector('.pip-close').addEventListener('click', () => {
        pip.classList.add('closing');
        setTimeout(() => {
            pip.remove();
            activeFsBody = null;
        }, 300);
    });

    // Green dot — expand back to fullscreen
    pipHeader.querySelector('.pip-expand').addEventListener('click', () => {
        fsBody.remove();
        pip.remove();
        openFullscreenTerminal(fsBody);
    });

    // Make PIP draggable by header
    makeDraggable(pip, pipHeader);
}

function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
        // Don't drag if clicking a dot button
        if (e.target.closest('.terminal-dot')) return;

        isDragging = true;
        const rect = element.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        // Switch to absolute positioning for dragging
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.left = startLeft + 'px';
        element.style.top = startTop + 'px';

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = (startLeft + dx) + 'px';
        element.style.top = (startTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function createFsInputLine(body) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'fs-input-line';
    lineDiv.innerHTML = '<span class="prompt">$</span>';

    const input = document.createElement('input');
    input.className = 'fs-input';
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('autocomplete', 'off');

    lineDiv.appendChild(input);
    body.appendChild(lineDiv);

    // Focus
    setTimeout(() => input.focus(), 50);

    // Click anywhere in body to focus
    body.addEventListener('click', () => {
        const activeInput = body.querySelector('.fs-input-line:last-child .fs-input');
        if (activeInput) activeInput.focus();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            input.disabled = true;

            // Replace input line with static text
            lineDiv.innerHTML = `<span class="prompt">$</span> <span style="color:var(--lightest-slate)">${escapeHtmlStr(cmd)}</span>`;

            // Process command
            const output = processFsCommand(cmd);

            if (output === '%%CLEAR%%') {
                body.innerHTML = '';
            } else if (output === '%%EXIT%%') {
                const fsOverlay = body.closest('.terminal-fullscreen-overlay');
                const pipEl = body.closest('.terminal-pip');
                if (fsOverlay) closeFsTerminal(fsOverlay);
                else if (pipEl) {
                    pipEl.classList.add('closing');
                    setTimeout(() => { pipEl.remove(); activeFsBody = null; }, 300);
                }
                return;
            } else if (output !== null) {
                const outDiv = document.createElement('div');
                outDiv.className = 'fs-output-line';
                outDiv.innerHTML = output;
                body.appendChild(outDiv);
            }

            // Add blank line
            const spacer = document.createElement('div');
            spacer.className = 'fs-output-line';
            spacer.innerHTML = '&nbsp;';
            body.appendChild(spacer);

            // New input line
            createFsInputLine(body);

            // Scroll to bottom
            body.scrollTop = body.scrollHeight;
        }
    });
}

function escapeHtmlStr(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function processFsCommand(cmd) {
    const lower = cmd.toLowerCase().trim();

    if (!lower) return null;

    const responses = {
        'help': `<span style="color:var(--accent)">Available commands:</span>
  <span style="color:var(--lightest-slate)">about</span>       — who am I
  <span style="color:var(--lightest-slate)">skills</span>      — tech stack
  <span style="color:var(--lightest-slate)">projects</span>    — my projects
  <span style="color:var(--lightest-slate)">contact</span>     — reach me
  <span style="color:var(--lightest-slate)">socials</span>     — links
  <span style="color:var(--lightest-slate)">whoami</span>      — current user
  <span style="color:var(--lightest-slate)">date</span>        — current date
  <span style="color:var(--lightest-slate)">echo [msg]</span>  — echo a message
  <span style="color:var(--lightest-slate)">neofetch</span>    — system info
  <span style="color:var(--lightest-slate)">clear</span>       — clear terminal
  <span style="color:var(--lightest-slate)">exit</span>        — close terminal`,

        'about': `<span style="color:var(--accent)">{</span>
  <span style="color:var(--accent)">"name"</span>: <span style="color:var(--lightest-slate)">"Martin Wu"</span>,
  <span style="color:var(--accent)">"role"</span>: <span style="color:var(--lightest-slate)">"Embedded Systems & Software Engineer"</span>,
  <span style="color:var(--accent)">"school"</span>: <span style="color:var(--lightest-slate)">"University of British Columbia"</span>,
  <span style="color:var(--accent)">"focus"</span>: <span style="color:var(--lightest-slate)">["firmware", "orchestration", "full-stack"]</span>
<span style="color:var(--accent)">}</span>`,

        'skills': `<span style="color:var(--accent)">Languages:</span>  C/C++, Go, Python, TypeScript
<span style="color:var(--accent)">Embedded:</span>  STM32, FreeRTOS, SPI, CAN
<span style="color:var(--accent)">Software:</span>   gRPC, React, Git, Docker`,

        'projects': `<span style="color:var(--lightest-slate)">songless/</span>             100k+ visits, R2 audio
<span style="color:var(--lightest-slate)">us/</span>                   Phaser 4 story game
<span style="color:var(--lightest-slate)">cascadia-firmware/</span>    UBC Solar MDI / STR
<span style="color:var(--lightest-slate)">useful-tool-hub/</span>      10 in-browser tools
<span style="color:var(--lightest-slate)">nutritracker/</span>         USDA nutrient tracker`,

        'contact': `<span style="color:var(--accent)">Email:</span>    martinwu500@gmail.com
<span style="color:var(--accent)">Phone:</span>    (236) 518-9477
<span style="color:var(--accent)">Location:</span> Vancouver, BC`,

        'socials': `<span style="color:var(--accent)">GitHub:</span>   <a href="https://github.com/martinw500" target="_blank" style="color:var(--lightest-slate)">github.com/martinw500</a>
<span style="color:var(--accent)">LinkedIn:</span> <a href="https://www.linkedin.com/in/martinwuu/" target="_blank" style="color:var(--lightest-slate)">linkedin.com/in/martinwuu</a>`,

        'whoami': '<span style="color:var(--lightest-slate)">martin</span>',

        'date': `<span style="color:var(--lightest-slate)">${new Date().toLocaleString()}</span>`,

        'neofetch': `<span style="color:var(--accent)">        .--.        </span>  <span style="color:var(--accent)">martin</span>@<span style="color:var(--accent)">dev</span>
<span style="color:var(--accent)">       |o_o |       </span>  <span style="color:var(--accent)">OS:</span>     Portfolio v2.0
<span style="color:var(--accent)">       |:_/ |       </span>  <span style="color:var(--accent)">Shell:</span>  martin.js
<span style="color:var(--accent)">      //   \\ \\      </span>  <span style="color:var(--accent)">Theme:</span>  ${document.documentElement.getAttribute('data-theme')}
<span style="color:var(--accent)">     (|     | )     </span>  <span style="color:var(--accent)">Stack:</span>  C, Python, JS
<span style="color:var(--accent)">    /'\\_   _/\`\\    </span>  <span style="color:var(--accent)">Uptime:</span> ${Math.floor((Date.now() - performance.timeOrigin) / 1000)}s
<span style="color:var(--accent)">    \\___)=(___/     </span>`,
    };

    if (lower === 'clear') return '%%CLEAR%%';
    if (lower === 'exit') return '%%EXIT%%';
    if (lower.startsWith('echo ')) {
        return `<span style="color:var(--lightest-slate)">${escapeHtmlStr(cmd.slice(5))}</span>`;
    }
    if (lower === 'echo') return '';
    if (lower === 'sudo rm -rf /') {
        return '<span style="color:#ff5f56">Nice try 😏</span>';
    }

    if (responses[lower]) return responses[lower];

    return `<span style="color:#ff5f56">command not found: ${escapeHtmlStr(cmd)}</span>\n<span style="color:var(--slate)">Type 'help' for available commands.</span>`;
}

// ── Back to Top ──────────────────────────────
const backToTop = document.createElement('button');
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 42px;
    height: 42px;
    border-radius: 4px;
    border: 1px solid var(--accent);
    background: var(--bg-light);
    color: var(--accent);
    font-size: 16px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 50;
    transition: all 0.25s ease;
`;

document.body.appendChild(backToTop);

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
});

// ── Console Easter Egg ───────────────────────
console.log(
    '%c Hey! 👋',
    'color: #64ffda; font-size: 20px; font-weight: bold; font-family: monospace;'
);
console.log(
    '%c Curious about the code? Check it out: https://github.com/martinw500/portfolio',
    'color: #8892b0; font-size: 13px; font-family: monospace;'
);

// ── Contact Form ─────────────────────────────
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Validation
        if (!formData.get('name') || !formData.get('email') || !formData.get('subject') || !formData.get('message')) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(formData.get('email'))) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showNotification('Message sent! I\'ll get back to you soon.', 'success');
                this.reset();
            } else {
                showNotification('Oops! Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Network error. Please check your connection.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.innerHTML = `
        <span>${message}</span>
        <button class="notif-close">&times;</button>
    `;

    const colors = {
        success: { bg: '#10b981', border: '#065f46' },
        error: { bg: '#ef4444', border: '#991b1b' },
        info: { bg: '#3b82f6', border: '#1e40af' }
    };

    const color = colors[type] || colors.info;

    notif.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        padding: 16px 20px;
        background: ${color.bg};
        color: white;
        border: 2px solid ${color.border};
        border-radius: 4px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
        font-size: 14px;
        animation: slideInNotif 0.4s ease;
    `;

    document.body.appendChild(notif);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInNotif {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutNotif {
            to { transform: translateX(400px); opacity: 0; }
        }
        .notif-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);

    const closeBtn = notif.querySelector('.notif-close');
    closeBtn.addEventListener('click', () => {
        notif.style.animation = 'slideOutNotif 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    });

    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.animation = 'slideOutNotif 0.3s ease forwards';
            setTimeout(() => notif.remove(), 300);
        }
    }, 5000);
}

// ── Project modal ────────────────────────────
const PROJECTS = {
    songless: {
        title: 'Songless',
        overline: 'Featured · 100k+ visits',
        github: 'https://github.com/martinw500/songless',
        live: 'https://songless-zeta.vercel.app',
        tech: ['React', 'TypeScript', 'Vite', 'Cloudflare R2', 'Web Audio'],
        shots: ['songless-cover.png', 'songless-1.png', 'songless-2.png', 'songless-3.png'],
        body: [
            'Guess the song from a growing intro clip. After a win or a full miss, the complete track streams from R2 — Vercel only serves the app and a small catalogue JSON.',
        ],
        points: [
            'Stage-locked Web Audio clues (0.01s–15s). Timeline and enabled stages stay in sync; play locks the round so the clip cannot be mutated mid-guess.',
            'Clue MP3s are compact; the full 128 kbps master is fetched only on reveal. Decoded audio is LRU-cached (3 songs) so a long session does not keep the library in RAM.',
            'Upload path audits YouTube sources, strips digital silence, encodes, and refuses a batch that would exceed an 8.5 GB R2 cap.',
            'Five difficulty pools, searchable aliases, 120-song live catalogue.',
        ],
    },
    us: {
        title: 'Us',
        overline: 'Featured',
        github: 'https://github.com/martinw500/larissa-game',
        live: 'https://martinw500.github.io/larissa-game/',
        tech: ['Phaser 4', 'TypeScript', 'Vite', 'Playwright'],
        shots: ['us-cover.png', 'us-1.png', 'us-2.png', 'us-3.png'],
        body: [
            'A full browser story game: 15+ scenes, save/fast-travel, dialogue with rewind, audio buses, and a first-run tutorial. Pokémon Gen 3 scale and outlines; the maps are real UBC and Vancouver places, not a Pokémon town.',
        ],
        points: [
            'Shared BaseScene for collision, interaction, menus, and discovery-gated travel.',
            'Procedural venue art plus cropped sheets; Playwright films assert lighting, walk cycles, and collision so a scene cannot silently regress.',
            'Keyboard-first on desktop, D-pad + A on touch, one cog menu. Playable end to end.',
        ],
    },
    uth: {
        title: 'Useful Tool Hub',
        overline: 'Other',
        github: 'https://github.com/martinw500/UTH',
        live: 'https://martinw500.github.io/UTH/',
        tech: ['JavaScript', 'Python', 'Vercel'],
        shots: ['uth-1.png', 'uth-2.png'],
        body: [
            'A set of tools I actually use. Convert/edit/QR/PDF run in the browser (Canvas, FFmpeg.wasm). YouTube and Instagram downloaders hit Vercel Python.',
        ],
        points: [
            'Ten tools, no accounts.',
            'On-device converters never upload the file.',
        ],
    },
    nutritracker: {
        title: 'NutriTracker',
        overline: 'Other',
        github: 'https://github.com/martinw500/Nutritracker',
        live: 'https://nutritracker-mocha.vercel.app',
        tech: ['TypeScript', 'Postgres', 'USDA FDC'],
        shots: ['nutritracker-1.png', 'nutritracker-2.png'],
        body: [
            'Tracks 59 micronutrient and phytonutrient values against USDA FoodData Central. Photo logging is designed so a model only names the food — nutrient numbers come from the database, never from the model.',
        ],
        points: [
            'UI runs off labeled demo fixtures today; Postgres/auth foundation is in place.',
            'No composite “health scores.” Claims carry an evidence tier.',
        ],
    },
    haar: {
        title: 'Haar Wavelet Compressor',
        overline: 'Other',
        github: 'https://github.com/martinw500/Haar-Wavelet-Image-Compressor',
        live: '',
        tech: ['Python', 'NumPy'],
        shots: ['haar-1.png', 'haar-2.png'],
        body: [
            'Lossy RGB compression with a Haar wavelet on each channel. Threshold and iteration sliders, live preview.',
        ],
        points: [
            'Matrix ops in NumPy, not a black-box codec wrapper.',
        ],
    },
};

function hydrateShots(root) {
    root.querySelectorAll('.shot[data-shot]').forEach(el => {
        if (el.dataset.hydrated) return;
        el.dataset.hydrated = '1';
        const src = el.dataset.shot;
        const label = el.dataset.label || src.split('/').pop();
        el.dataset.label = label;
        el.classList.add('is-empty');
        const img = new Image();
        img.alt = label;
        img.onload = () => {
            el.classList.remove('is-empty');
            el.classList.add('has-image');
            el.appendChild(img);
        };
        img.src = src;
    });
}

function shotMarkup(filename) {
    const src = `assets/projects/${filename}`;
    return `<div class="shot is-empty" data-shot="${src}" data-label="${filename}"></div>`;
}

function renderProject(id) {
    const p = PROJECTS[id];
    if (!p) return '';
    const links = [
        p.github ? `<a href="${p.github}" target="_blank" rel="noopener">GitHub</a>` : '',
        p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live</a>` : '',
    ].filter(Boolean).join('');
    return `
        <p class="pm-overline mono">${p.overline}</p>
        <h2 class="pm-title" id="project-modal-title">${p.title}</h2>
        <ul class="pm-tech">${p.tech.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="pm-links">${links}</div>
        <div class="pm-body">${p.body.map(t => `<p>${t}</p>`).join('')}</div>
        <ul class="pm-points">${p.points.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="pm-shots">${p.shots.map(shotMarkup).join('')}</div>
        <p class="pm-hint">Screenshots: drop files into <span class="mono">assets/projects/</span> using the names on the empty frames.</p>
    `;
}

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('project-modal-body');
    if (!modal || !body) return;

    function openProject(id, pushHash) {
        if (!PROJECTS[id]) return;
        body.innerHTML = renderProject(id);
        hydrateShots(body);
        modal.hidden = false;
        document.body.classList.add('modal-open');
        if (pushHash) {
            history.pushState({ project: id }, '', `#project/${id}`);
        }
    }

    function closeProject() {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        if (location.hash.startsWith('#project/')) {
            history.pushState({}, '', location.pathname + location.search);
        }
    }

    document.querySelectorAll('[data-project]').forEach(card => {
        const open = () => openProject(card.dataset.project, true);
        card.addEventListener('click', e => {
            if (e.target.closest('a')) return;
            open();
        });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });

    modal.querySelectorAll('[data-modal-close]').forEach(el => {
        el.addEventListener('click', closeProject);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hidden) closeProject();
    });

    window.addEventListener('popstate', () => {
        const id = (location.hash.match(/^#project\/([\w-]+)/) || [])[1];
        if (id) openProject(id, false);
        else closeProject();
    });

    const initial = (location.hash.match(/^#project\/([\w-]+)/) || [])[1];
    if (initial) openProject(initial, false);
}

