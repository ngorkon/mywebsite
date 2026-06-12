'use strict';
/* ═══════════════════════════════════════════════════════════
   NG'OR KON — QUANTUM FIELD UI
   Scroll-driven 3D shape switching + interface behaviors.
   3D engine lives in js/scene.js (window.__setFieldShape).
═══════════════════════════════════════════════════════════ */

function runInit() {
  initHeader();
  initNav();
  initTyping();
  initReveal();
  initShapeDriver();
  initSimulation();
  initProjectFilter();
  initGithubFeed();
  initJourneyMap();
  initSlideshow();
  initTiltCards();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}

/* ── Header scroll state ── */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Nav: hamburger + active link ── */
function initNav() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('menu-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => l.addEventListener('click', () => {
    links.forEach(x => x.classList.remove('active'));
    l.classList.add('active');
    if (nav) nav.classList.remove('open');
  }));
  const sections = document.querySelectorAll('main section[id]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 140;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
      }
    });
  }, { passive: true });
}

/* ── Typing effect ── */
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const roles = [
    '> physics student',
    '> ml researcher',
    '> simulation builder',
    '> problem solver',
    '> quantum explorer'
  ];
  let r = 0, i = 0, del = false;
  function type() {
    const word = roles[r];
    el.textContent = del ? word.substring(0, --i) : word.substring(0, ++i);
    let delay = del ? 45 : 85;
    if (!del && i === word.length) { delay = 2000; del = true; }
    else if (del && i === 0) { del = false; r = (r + 1) % roles.length; delay = 350; }
    setTimeout(type, delay);
  }
  type();
}

/* ── Reveal on scroll ── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => e.classList.add('visible')), 3000);
}

/* ── Shape driver: section in view → 3D field morphs ── */
function initShapeDriver() {
  const sections = document.querySelectorAll('[data-shape]');
  if (!sections.length) return;

  const shapeNames = ['SPIRAL GALAXY', '3D ORBITAL Ψ(r,θ,φ)', 'TORUS KNOT (2,3)', 'PLANETARY SPHERE', 'SINGULARITY CORE'];
  const hudShape = document.getElementById('hud-shape');
  const dots = document.querySelectorAll('.shape-dot');

  function updateHUD(idx) {
    if (hudShape) hudShape.textContent = shapeNames[idx] || '';
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  document.addEventListener('shapechange', (e) => updateHUD(e.detail));

  function pickShape() {
    const mid = window.scrollY + window.innerHeight * 0.45;
    let best = 0;
    sections.forEach(s => {
      if (s.offsetTop <= mid) best = parseInt(s.dataset.shape, 10);
    });
    if (typeof window.__setFieldShape === 'function') window.__setFieldShape(best);
  }
  window.addEventListener('scroll', throttle(pickShape, 150), { passive: true });
  pickShape();
}

function throttle(fn, ms) {
  let last = 0, timer = null;
  return function () {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(); }
    else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn(); }, ms); }
  };
}

/* ── N-body physics simulation ── */
function initSimulation() {
  const c = document.getElementById('sim-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const playBtn = document.getElementById('sim-play-pause');
  const resetBtn = document.getElementById('sim-reset');
  const addBtn = document.getElementById('sim-add-body');
  const gravInput = document.getElementById('sim-gravity');
  const countEl = document.getElementById('sim-body-count');
  const infoEl = document.getElementById('sim-info');
  let bodies = [], running = true, gConst = 1, paused = false;

  // pause when off-screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(en => { paused = !en.isIntersecting; });
    }, { threshold: 0.01 }).observe(c);
  }

  const simPalette = ['#34e0ff', '#a78bff', '#ffc94d', '#3dff9e', '#ff7ab8', '#e9f2ff'];

  function resize() { c.width = c.parentElement.offsetWidth; c.height = c.offsetHeight || 460; }

  function randBody() {
    return {
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      m: Math.random() * 15 + 5,
      color: simPalette[Math.floor(Math.random() * simPalette.length)],
      trail: []
    };
  }

  function reset() {
    bodies = Array.from({ length: 6 }, randBody);
    if (countEl) countEl.textContent = bodies.length;
  }

  function step() {
    gConst = parseFloat(gravInput ? gravInput.value : 1);
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy + 25;
        const f = gConst * a.m * b.m / d2;
        const d = Math.sqrt(d2);
        const fx = f * dx / d, fy = f * dy / d;
        a.vx += fx / a.m; a.vy += fy / a.m;
        b.vx -= fx / b.m; b.vy -= fy / b.m;
      }
    }
    bodies.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0 || b.x > c.width) b.vx *= -0.8;
      if (b.y < 0 || b.y > c.height) b.vy *= -0.8;
      b.trail.push([b.x, b.y]);
      if (b.trail.length > 60) b.trail.shift();
    });
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,7,15,0.22)';
    ctx.fillRect(0, 0, c.width, c.height);
    bodies.forEach(b => {
      if (b.trail.length > 1) {
        ctx.beginPath();
        b.trail.forEach(([x, y], k) => k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.stroke(); ctx.globalAlpha = 1;
      }
      const r = Math.sqrt(b.m);
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x, b.y, r * 2.6, 0, Math.PI * 2);
      ctx.globalAlpha = 0.1; ctx.fill(); ctx.globalAlpha = 1;
    });
  }

  function loop() {
    if (running && !paused) step();
    if (!paused) draw();
    requestAnimationFrame(loop);
  }
  resize(); window.addEventListener('resize', resize); reset(); loop();

  if (playBtn) playBtn.addEventListener('click', () => {
    running = !running;
    playBtn.textContent = running ? 'Pause' : 'Play';
    playBtn.classList.toggle('active', running);
  });
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (addBtn) addBtn.addEventListener('click', () => {
    bodies.push(randBody());
    if (countEl) countEl.textContent = bodies.length;
  });
  c.addEventListener('click', (e) => {
    const rect = c.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hit = bodies.find(b => (b.x - mx) ** 2 + (b.y - my) ** 2 < b.m * 6);
    if (hit && infoEl) {
      const ke = 0.5 * hit.m * (hit.vx ** 2 + hit.vy ** 2);
      infoEl.textContent = '// m = ' + hit.m.toFixed(1)
        + '  ·  v = (' + hit.vx.toFixed(2) + ', ' + hit.vy.toFixed(2) + ')'
        + '  ·  KE = ' + ke.toFixed(1);
    }
  });
}

/* ── Project filter ── */
function initProjectFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.cat;
    cards.forEach(card => {
      card.classList.toggle('hidden', !(f === 'all' || card.dataset.cat === f));
    });
  }));
}

/* ── GitHub live feed ── */
function initGithubFeed() {
  const feed = document.getElementById('github-feed');
  if (!feed) return;
  const githubUser = 'ngorkon';
  fetch('https://api.github.com/users/' + githubUser + '/repos?sort=updated&per_page=12', {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(repos => {
      if (!Array.isArray(repos) || repos.length === 0) { showError('no public repositories found'); return; }
      const top = repos.filter(r => !r.fork)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);
      renderRepos(top);
    })
    .catch(() => showError('github api unavailable — try again later'));

  function renderRepos(repos) {
    feed.innerHTML = repos.map(r => {
      const lang = r.language || 'Code';
      const desc = r.description ? r.description.replace(/[<>]/g, '') : 'No description provided.';
      const updated = new Date(r.pushed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      return '<a class="panel repo-card" href="' + r.html_url + '" target="_blank" rel="noopener">'
        + '<span class="repo-name">' + r.name + '</span>'
        + '<p class="repo-desc">' + desc + '</p>'
        + '<div class="repo-meta"><span class="repo-lang">● ' + lang + '</span>'
        + '<span>★ ' + r.stargazers_count + '</span>'
        + '<span>UPD ' + updated.toUpperCase() + '</span></div></a>';
    }).join('');
  }
  function showError(msg) { feed.innerHTML = '<div class="feed-error">// ' + msg + '</div>'; }
}

/* ── Journey Map (Leaflet) ── */
function initJourneyMap() {
  const el = document.getElementById('journey-map');
  if (!el) return;
  if (typeof L === 'undefined') {
    // Leaflet loads deferred — retry once it exists
    let tries = 0;
    const wait = setInterval(() => {
      if (typeof L !== 'undefined') { clearInterval(wait); build(); }
      else if (++tries > 40) { clearInterval(wait); el.innerHTML = '<p class="feed-error">// map library failed to load</p>'; }
    }, 250);
    return;
  }
  build();

  function build() {
    const stops = [
      { name: 'Kakuma, Kenya', coords: [3.7167, 34.8667],
        date: 'Feb 2021 – Aug 2023', role: 'Co-Founder & Director of Technology · Project 21 Kenya',
        desc: 'Eradicating poverty in Kakuma Refugee Camp — built homes for flood-displaced families, led funding and tech initiatives.' },
      { name: 'UWC Maastricht, Netherlands', coords: [50.8514, 5.6910],
        date: 'Sept 2021 – May 2023', role: 'IB Diploma Programme · United World College Maastricht',
        desc: 'Robotics Club and Musicals Club. International, multicultural environment that sharpened my global outlook.' },
      { name: 'The College of Idaho, USA', coords: [43.6629, -116.6873],
        date: 'May 2024 – Present', role: 'Academic Tutor · Calculus & Education',
        desc: 'Coordinating cross-cultural events for 100+ international students through the International Students Organization.' }
    ];

    const map = L.map(el, { center: [30, -10], zoom: 2, scrollWheelZoom: false, worldCopyJump: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    function makeMarker(stop, idx) {
      const icon = L.divIcon({
        className: 'jm-pin',
        html: '<div class="jm-pin-inner"><span>' + (idx + 1) + '</span></div>',
        iconSize: [34, 34], iconAnchor: [17, 17]
      });
      const m = L.marker(stop.coords, { icon }).addTo(map);
      m.bindPopup('<div class="jm-popup"><span class="jm-popup-date">' + stop.date + '</span><h4>' + stop.name + '</h4><div class="jm-popup-role">' + stop.role + '</div><p>' + stop.desc + '</p></div>');
      return m;
    }

    const markers = stops.map((s, i) => makeMarker(s, i));
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.4));

    // animated dashed path between stops
    function interp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    const fullPath = [];
    for (let i = 0; i < stops.length - 1; i++) {
      for (let t = 0; t <= 80; t++) fullPath.push(interp(stops[i].coords, stops[i + 1].coords, t / 80));
    }
    const line = L.polyline([], { color: '#34e0ff', weight: 2, opacity: 0.8, dashArray: '5, 9' }).addTo(map);
    let progress = 0;
    function animateLine() {
      if (progress < fullPath.length) {
        line.addLatLng(fullPath[progress]);
        progress += 2;
        setTimeout(animateLine, 25);
      } else {
        setTimeout(() => { line.setLatLngs([]); progress = 0; animateLine(); }, 4000);
      }
    }

    setTimeout(() => { map.invalidateSize(); animateLine(); markers[0].openPopup(); }, 400);
    window.addEventListener('resize', () => map.invalidateSize());

    document.querySelectorAll('.tl-entry').forEach((entry, idx) => {
      if (stops[idx]) {
        entry.addEventListener('click', () => {
          map.setView(stops[idx].coords, 5, { animate: true });
          markers[idx].openPopup();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
  }
}

/* ── Slideshow for project cards ── */
function initSlideshow() {
  document.querySelectorAll('.card-slideshow').forEach(slideshow => {
    const track = slideshow.querySelector('.slideshow-track');
    const dotsContainer = slideshow.querySelector('.slide-dots');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.slide-img'));
    if (slides.length === 0) return;
    slideshow.setAttribute('data-count', slides.length);
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }
    let current = 0;
    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (dotsContainer) dotsContainer.querySelectorAll('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    const prev = slideshow.querySelector('.slide-prev');
    const next = slideshow.querySelector('.slide-next');
    if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); goTo(current - 1); });
    if (next) next.addEventListener('click', (e) => { e.preventDefault(); goTo(current + 1); });
    if (slides.length > 1) setInterval(() => goTo(current + 1), 4500);
  });
}

/* ── 3D tilt on project cards ── */
function initTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = 'perspective(900px) rotateX(' + (dy * -5) + 'deg) rotateY(' + (dx * 5) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
