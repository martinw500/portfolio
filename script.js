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

const savedTheme = localStorage.getItem('theme') || getSystemTheme();
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
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
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
    // Reveal sections, cards, tiles
    const els = document.querySelectorAll(
        '.exp-card, .featured-project, .project-tile, .about-grid, .contact-container'
    );
    els.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 80}ms`;
        revealObserver.observe(el);
    });
});

// ── Terminal Typing Animation ────────────────
const typedCmd = document.getElementById('typed-cmd');
const termOutput = document.getElementById('terminal-output');

const commands = [
    {
        cmd: 'cat about.json',
        output: [
            '<span class="out-bracket">{</span>',
            '  <span class="out-key">"name"</span>: <span class="out-val">"Martin Wu"</span>,',
            '  <span class="out-key">"role"</span>: <span class="out-val">"Embedded Systems & Software Engineer"</span>,',
            '  <span class="out-key">"school"</span>: <span class="out-val">"University of British Columbia"</span>,',
            '  <span class="out-key">"focus"</span>: <span class="out-val">["firmware", "full-stack", "AI/ML"]</span>,',
            '  <span class="out-key">"currently"</span>: <span class="out-val">"building cool stuff"</span>',
            '<span class="out-bracket">}</span>'
        ]
    },
    {
        cmd: 'ls projects/',
        output: [
            '<span class="out-val">useful-tool-hub/</span>    <span class="out-val">trading-system/</span>',
            '<span class="out-val">math-quiz/</span>          <span class="out-val">image-compressor/</span>',
            '<span class="out-val">portfolio/</span>          <span class="out-val">rtd-firmware/</span>'
        ]
    },
    {
        cmd: 'echo $STATUS',
        output: [
            '<span class="out-val">🚀 Building the future, one commit at a time.</span>'
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
