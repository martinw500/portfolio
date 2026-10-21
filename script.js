// Theme, section entrances, the hardware/software switch, and the live CAN frames.
const html = document.documentElement;

// ── Theme ────────────────────────────────────
// The inline <head> script has already set data-theme before first paint.
const themeButton = document.getElementById('theme');

function setTheme(theme, save) {
    html.dataset.theme = theme;
    if (save) { try { localStorage.setItem('theme', theme); } catch (e) {} }
    const other = theme === 'dark' ? 'Light' : 'Dark';
    themeButton.textContent = other;
    themeButton.setAttribute('aria-label', `Switch to ${other.toLowerCase()} theme`);
}
setTheme(html.dataset.theme, false);
themeButton.addEventListener('click', () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', true));

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
});

// ── Entrances ────────────────────────────────
// Content is visible without JS; .js only adds the hidden start state.
// Anything whose top has passed 92% of the viewport is revealed, so a fast
// fling or an anchor jump past an element can't leave it hidden.
let waiting = [];
document.querySelectorAll('section').forEach(section => {
    section.querySelectorAll('[data-rise]').forEach((el, i) => {
        el.style.setProperty('--i', i % 4);
        waiting.push(el);
    });
});
function reveal() {
    const line = innerHeight * 0.92;
    waiting = waiting.filter(el => {
        if (el.getBoundingClientRect().top >= line) return true;
        el.classList.add('is-in');
        return false;
    });
    if (!waiting.length) removeEventListener('scroll', onScroll);
}
let queued = false;
function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; reveal(); });
}
addEventListener('scroll', onScroll, { passive: true });
reveal();

// ── Hardware / software switch ───────────────
// Each picture's labels also become a numbered key under it on phones.
document.querySelectorAll('.shot').forEach(shot => {
    const key = document.createElement('ol');
    key.className = 'legend';
    shot.querySelectorAll('.call').forEach((call, n) => {
        call.querySelector('.dot').style.setProperty('--n', n);
        const li = document.createElement('li');
        li.innerHTML = call.querySelector('.lab').innerHTML;
        key.append(li);
    });
    shot.after(key);
});

const switches = document.querySelectorAll('.switch button');
switches.forEach(button => button.addEventListener('click', () => {
    switches.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('is-off', view.dataset.view !== button.dataset.view));
}));

// ── Live CAN frames ──────────────────────────
// Mirrors the MDI firmware (rtd_driver.c, diagnostic.c): one read a second;
// a failed read adds 1 to a leaky counter (max 5), a good one takes 1 off.
// The fault latches at 5 and clears only when the counter drains to 0.
// 0x500 counts the seconds since this page loaded.
const ROOM_C = 24;
const live = { uptime: 0, count: 0, latched: false, plugged: true };
const button = document.getElementById('unplug');
const counter = document.getElementById('live-count');

const hex = n => n.toString(16).toUpperCase().padStart(2, '0'); // taste-skill-ignore: hex bytes
const le32 = n => [0, 8, 16, 24].map(s => hex((n >>> s) & 0xff)).join(' ');

function setCell(id, text) {
    const cell = document.getElementById(id);
    if (cell.textContent === text) return;
    cell.textContent = text;
    if (id === 'f500' || id === 'm500') return; // the uptime changes every tick; only flag real changes
    cell.classList.add('is-changed');
    setTimeout(() => cell.classList.remove('is-changed'), 950);
}

function render() {
    const faults = live.latched ? 0x80 : 0;
    setCell('f500', le32(live.uptime));
    setCell('m500', `up ${live.uptime} s`);
    setCell('f501', live.latched ? '08' : '00'); // taste-skill-ignore: CAN payload byte
    setCell('m501', live.latched ? 'RTD fault' : 'no flags');
    setCell('f502', `${live.plugged ? '01' : '00'} ${le32(live.plugged ? ROOM_C : 0)} ${hex(faults)}`); // taste-skill-ignore: CAN payload byte
    setCell('m502', live.plugged ? `read ok, ${ROOM_C} °C` : (live.latched ? 'failed, RTD high' : 'failed, not latched'));
    const state = live.latched ? 'Latched' : (live.plugged ? (live.count ? 'Draining' : 'Reading') : 'Faulting');
    counter.textContent = `${state}. Fault count ${live.count} of 5`;
    button.textContent = live.plugged ? 'Unplug the RTD' : 'Plug it back in';
}

setInterval(() => {
    live.uptime++;
    live.count = Math.max(0, Math.min(5, live.count + (live.plugged ? -1 : 1)));
    if (live.count === 5) live.latched = true;
    if (live.count === 0) live.latched = false;
    render();
}, 1000);

button.addEventListener('click', () => {
    live.plugged = !live.plugged;
    render();
});
