'use strict';
// ═══════════════════════════════════════════════
// Ng'or Kon Portfolio — COSMIC INTERSTELLAR JS
// Full site: star fields, hyperspace, wormhole loader,
// gravitational shimmer, floating debris, section reveals
// ═══════════════════════════════════════════════

function runInit() {
  initWormholeLoader();
  initHeader();
  initNav();
  initTyping();
  initReveal();
  initBgCanvas();
  initHeroCanvas();
  initCosmicParticles();
  initGravShimmer();
  initSimulation();
  initProjectFilter();
  initGithubFeed();
  initProfilePulse();
  initJourneyMap();
  initSlideshow();
  initCanvasPause();
  initMusicPlayer();
  initSectionTransitions();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}

// ─── Wormhole loader (cinematic intro) ───
function initWormholeLoader() {
  // Only show on first visit per session
  if (sessionStorage.getItem('wormhole_shown')) return;
  sessionStorage.setItem('wormhole_shown', '1');

  const loader = document.createElement('div');
  loader.className = 'wormhole-loader';
  loader.id = 'wormhole-loader';
  loader.innerHTML = `
    <div class="wormhole-ring-wrap">
      <div class="wormhole-r"></div>
      <div class="wormhole-r"></div>
      <div class="wormhole-r"></div>
      <div class="wormhole-r"></div>
    </div>
    <div class="wormhole-text">Entering the cosmos</div>
  `;
  document.body.prepend(loader);

  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 900);
  }, 2000);
}

// ─── Header scroll effect ───
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── Hamburger + Active nav ───
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
    const y = window.scrollY + 120;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
      }
    });
  }, { passive: true });
}

// ─── Typing effect ───
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const roles = ['Physics Student', 'ML Researcher', 'Code Builder', 'Problem Solver', 'Quantum Explorer'];
  let r = 0, i = 0, del = false;
  function type() {
    const word = roles[r];
    el.textContent = del ? word.substring(0, --i) : word.substring(0, ++i);
    let delay = del ? 55 : 100;
    if (!del && i === word.length) { delay = 1800; del = true; }
    else if (del && i === 0) { del = false; r = (r + 1) % roles.length; delay = 350; }
    setTimeout(type, delay);
  }
  type();
}

// ─── Reveal on scroll ───
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
  }, { threshold: 0.04, rootMargin: '0px 0px -30px 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => e.classList.add('visible')), 2500);
}

// ─── Background star canvas — deep space nebula ───
function initBgCanvas() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let stars = [], nebulaClouds = [];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    // Stars: 3 layers of depth
    stars = [];
    // Tiny distant stars (many)
    for (let i = 0; i < 300; i++) {
      stars.push({ x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 0.8 + 0.1, a: Math.random() * 0.5 + 0.1,
        s: Math.random() * 0.008 + 0.002, layer: 0,
        color: Math.random() > 0.9 ? 'rgba(245,200,66,' : 'rgba(0,200,255,' });
    }
    // Mid stars
    for (let i = 0; i < 80; i++) {
      stars.push({ x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.6 + 0.2,
        s: Math.random() * 0.015 + 0.004, layer: 1,
        color: Math.random() > 0.8 ? 'rgba(245,200,66,' : 'rgba(180,220,255,' });
    }
    // Bright foreground stars
    for (let i = 0; i < 20; i++) {
      stars.push({ x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 2 + 0.8, a: Math.random() * 0.8 + 0.2,
        s: Math.random() * 0.02 + 0.008, layer: 2,
        color: Math.random() > 0.7 ? 'rgba(255,220,100,' : 'rgba(200,240,255,' });
    }
    // Nebula clouds (soft radial blobs)
    nebulaClouds = [];
    for (let i = 0; i < 5; i++) {
      nebulaClouds.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 200 + 100,
        a: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.5 ? '#003366' : '#220033',
        drift: (Math.random() - 0.5) * 0.15, driftY: (Math.random() - 0.5) * 0.08
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw nebula clouds first
    nebulaClouds.forEach(n => {
      n.x += n.drift; n.y += n.driftY;
      if (n.x < -n.r) n.x = c.width + n.r;
      if (n.x > c.width + n.r) n.x = -n.r;
      if (n.y < -n.r) n.y = c.height + n.r;
      if (n.y > c.height + n.r) n.y = -n.r;
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grd.addColorStop(0, n.color.replace(')', ',' + n.a + ')').replace('#', 'rgba(') );
      // Use simple rgba instead
      ctx.save();
      ctx.globalAlpha = n.a;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.restore();
    });

    // Draw stars with twinkle
    stars.forEach(s => {
      s.a += s.s * (Math.random() > 0.5 ? 1 : -1);
      const minA = s.layer === 0 ? 0.05 : s.layer === 1 ? 0.1 : 0.2;
      const maxA = s.layer === 0 ? 0.5 : s.layer === 1 ? 0.7 : 1.0;
      if (s.a < minA) s.a = minA;
      if (s.a > maxA) s.a = maxA;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + s.a + ')';
      ctx.fill();

      // Glow for brighter stars
      if (s.layer === 2 && s.a > 0.5) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color + (s.a * 0.08) + ')';
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
}

// ─── Hero canvas — hyperspace particle streams ───
function initHeroCanvas() {
  const c = document.getElementById('hero-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let particles = [];
  let cx, cy;

  function resize() {
    c.width = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
    cx = c.width / 2; cy = c.height / 2;
  }

  function spawn() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 50 + 20;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * (Math.random() * 1.5 + 0.3),
      vy: Math.sin(angle) * (Math.random() * 1.5 + 0.3),
      r: Math.random() * 1.5 + 0.3,
      life: 1.0, decay: Math.random() * 0.008 + 0.003,
      trail: [],
      amber: Math.random() > 0.85
    };
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,3,8,0.15)';
    ctx.fillRect(0, 0, c.width, c.height);

    if (c._paused) { requestAnimationFrame(draw); return; }

    while (particles.length < 80) particles.push(spawn());

    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 1.018; p.vy *= 1.018; // accelerate outward
      p.life -= p.decay;
      p.trail.push([p.x, p.y]);
      if (p.trail.length > 8) p.trail.shift();

      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0][0], p.trail[0][1]);
        for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i][0], p.trail[i][1]);
        ctx.strokeStyle = p.amber
          ? `rgba(245,200,66,${p.life * 0.6})`
          : `rgba(0,200,255,${p.life * 0.5})`;
        ctx.lineWidth = p.r;
        ctx.stroke();
      }
    });

    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
}

// ─── Floating cosmic debris particles ───
function initCosmicParticles() {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'cosmic-particle';
    const size = Math.random() * 3 + 1;
    const isAmber = Math.random() > 0.75;
    const duration = Math.random() * 25 + 20;
    const delay = Math.random() * -30;
    const leftPos = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 120;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${leftPos}vw;
      background: ${isAmber ? '#f5c842' : '#00c8ff'};
      box-shadow: 0 0 ${size * 3}px ${isAmber ? '#f5c842' : '#00c8ff'};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
      opacity: 0;
    `;
    document.body.appendChild(p);
  }
}

// ─── Gravitational lens shimmer on profile pic ───
function initGravShimmer() {
  const wrap = document.querySelector('.hero-img-wrap');
  if (!wrap) return;
  const shimmer = document.createElement('div');
  shimmer.className = 'grav-shimmer';
  wrap.appendChild(shimmer);
}

// ─── Profile pulse ───
function initProfilePulse() {
  const p = document.getElementById('profile-pic');
  if (!p) return;
  p.addEventListener('mouseenter', () => p.classList.add('pulse'));
  p.addEventListener('mouseleave', () => p.classList.remove('pulse'));
}

// ─── Hyperspace section transition reveals ───
function initSectionTransitions() {
  if (!('IntersectionObserver' in window)) return;
  const sections = document.querySelectorAll('main section');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('cosmic-section-enter');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.05 });
  sections.forEach(s => io.observe(s));
}

// ─── N-body physics simulation ───
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
  let bodies = [], running = true, G = 1;

  function resize() { c.width = c.parentElement.offsetWidth; c.height = 480; }

  function randBody() {
    return {
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      m: Math.random() * 15 + 5,
      color: 'hsl(' + (Math.random() * 360) + ', 90%, 60%)', trail: []
    };
  }

  function reset() {
    bodies = Array.from({ length: 6 }, randBody);
    if (countEl) countEl.textContent = bodies.length;
  }

  function step() {
    G = parseFloat(gravInput ? gravInput.value : 1);
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy + 25;
        const f = G * a.m * b.m / d2;
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
      if (b.trail.length > 50) b.trail.shift();
    });
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,3,8,0.25)';
    ctx.fillRect(0, 0, c.width, c.height);
    bodies.forEach(b => {
      if (b.trail.length > 1) {
        ctx.beginPath();
        for (let k = 0; k < b.trail.length; k++) {
          const [x, y] = b.trail[k];
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1; ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.sqrt(b.m), 0, Math.PI * 2);
      ctx.fillStyle = b.color; ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.sqrt(b.m) * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = b.color.replace('hsl', 'hsla').replace(')', ',0.12)');
      ctx.fill();
    });
  }

  function loop() {
    if (running && !c._paused) step();
    draw();
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
    const hit = bodies.find(b => (b.x - mx) ** 2 + (b.y - my) ** 2 < b.m * 5);
    if (hit && infoEl) {
      infoEl.textContent = 'Mass: ' + hit.m.toFixed(1) + '  ·  v = (' + hit.vx.toFixed(2) + ', ' + hit.vy.toFixed(2) + ')  ·  KE = ' + (0.5 * hit.m * (hit.vx ** 2 + hit.vy ** 2)).toFixed(1);
    }
  });
}

// ─── Project filter ───
function initProjectFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.cat || b.dataset.filter;
    cards.forEach(c => {
      c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none';
    });
  }));
}

// ─── GitHub live feed ───
function initGithubFeed() {
  const feed = document.getElementById('github-feed');
  if (!feed) return;
  const USER = 'ngorkon';
  fetch('https://api.github.com/users/' + USER + '/repos?sort=updated&per_page=12', {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(repos => {
    if (!Array.isArray(repos) || repos.length === 0) { showError('No public repositories found.'); return; }
    const top = repos.filter(r => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
    renderRepos(top);
  })
  .catch(err => { console.error('GitHub feed error:', err); showError('GitHub API unavailable.'); });

  function renderRepos(repos) {
    feed.innerHTML = repos.map(r => {
      const lang = r.language || 'Code';
      const desc = r.description ? r.description.replace(/[<>]/g, '') : 'No description provided.';
      const updated = new Date(r.pushed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      return '<a class="repo-card" href="' + r.html_url + '" target="_blank" rel="noopener">'
        + '<div class="repo-head"><span class="repo-icon">📦</span><h4 class="repo-name">' + r.name + '</h4></div>'
        + '<p class="repo-desc">' + desc + '</p>'
        + '<div class="repo-meta"><span class="repo-lang">● ' + lang + '</span><span>★ ' + r.stargazers_count + '</span><span>⑂ ' + r.forks_count + '</span></div>'
        + '<div class="repo-updated">Updated ' + updated + '</div></a>';
    }).join('');
  }
  function showError(msg) { feed.innerHTML = '<div class="feed-error">⚠ ' + msg + '</div>'; }
}

// ─── Journey Map (Leaflet) ───
function initJourneyMap() {
  const el = document.getElementById('journey-map');
  if (!el || typeof L === 'undefined') {
    if (el) el.innerHTML = '<div class="feed-error">Map library failed to load.</div>';
    return;
  }

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

  const map = L.map(el, { center: [30, -10], zoom: 2, scrollWheelZoom: false, worldCopyJump: true, zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(map);

  function makeMarker(stop, idx) {
    const icon = L.divIcon({
      className: 'jm-pin',
      html: '<div class="jm-pin-inner"><span>' + (idx + 1) + '</span></div>',
      iconSize: [38, 38], iconAnchor: [19, 19]
    });
    const m = L.marker(stop.coords, { icon }).addTo(map);
    m.bindPopup('<div class="jm-popup"><div class="jm-popup-date">' + stop.date + '</div><h4>' + stop.name + '</h4><div class="jm-popup-role">' + stop.role + '</div><p>' + stop.desc + '</p></div>');
    return m;
  }

  const markers = stops.map((s, i) => makeMarker(s, i));
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.4));

  function interp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  const fullPath = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i].coords, b = stops[i + 1].coords;
    for (let t = 0; t <= 80; t++) fullPath.push(interp(a, b, t / 80));
  }

  const line = L.polyline([], { color: '#00e1ff', weight: 2.5, opacity: 0.8, dashArray: '6, 8' }).addTo(map);
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

  setTimeout(() => {
    map.invalidateSize();
    animateLine();
    markers[0].openPopup();
  }, 400);
  window.addEventListener('resize', () => map.invalidateSize());

  // Wire up journey step clicks to map
  document.querySelectorAll('.jm-step').forEach((step, idx) => {
    if (stops[idx]) {
      step.addEventListener('click', () => {
        map.setView(stops[idx].coords, 5, { animate: true });
        markers[idx].openPopup();
      });
    }
  });
}

// ─── Slideshow for project cards ───
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
      dotsContainer && dotsContainer.querySelectorAll('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    const prev = slideshow.querySelector('.slide-prev');
    const next = slideshow.querySelector('.slide-next');
    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));
    if (slides.length > 1) setInterval(() => goTo(current + 1), 4000);
  });
}

// ─── Canvas pause when off-screen ───
function initCanvasPause() {
  if (!('IntersectionObserver' in window)) return;
  ['hero-canvas', 'sim-canvas'].forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas._paused = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { canvas._paused = !en.isIntersecting; });
    }, { threshold: 0.01 });
    io.observe(canvas);
  });
}

// ─── Interstellar Music Player — autoplay on first interaction ───
function initMusicPlayer() {
  const playerHTML = `
    <div class="music-player" id="music-player" role="region" aria-label="Music player">
      <button class="music-btn" id="music-play-btn" aria-label="Play Interstellar theme">&#9654;</button>
      <div class="music-waveform" aria-hidden="true">
        <span class="music-bar"></span><span class="music-bar"></span>
        <span class="music-bar"></span><span class="music-bar"></span>
        <span class="music-bar"></span>
      </div>
      <div class="music-info">
        <div class="music-title">Interstellar — Main Theme</div>
        <div class="music-artist">Hans Zimmer</div>
        <div class="music-progress-bar"><div class="music-progress-fill" id="music-progress"></div></div>
      </div>
      <div class="music-volume">
        <span class="music-vol-icon" id="music-mute-btn" title="Mute/unmute">&#128266;</span>
        <input type="range" class="music-vol-slider" id="music-vol" min="0" max="100" value="55" aria-label="Volume">
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', playerHTML);

  // Apply critical inline styles to override any CSS cache
  const _p = document.getElementById('music-player');
  if (_p) {
    _p.style.cssText = 'position:fixed!important;bottom:28px!important;right:28px!important;z-index:9999!important;display:flex!important;align-items:center;gap:14px;background:rgba(2,5,16,0.92);border:1px solid rgba(0,200,255,0.25);border-radius:50px;padding:10px 20px 10px 10px;box-shadow:0 8px 40px rgba(0,0,0,0.6),0 0 30px rgba(0,200,255,0.08);backdrop-filter:blur(20px);max-width:340px;transition:all 0.4s ease;';
    const _btn = _p.querySelector('.music-btn');
    if (_btn) _btn.style.cssText = 'width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#00c8ff,#0057b8);border:none;color:#000308;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 0 16px rgba(0,200,255,0.4);transition:all 0.3s ease;';
    const _info = _p.querySelector('.music-info');
    if (_info) _info.style.cssText = 'flex:1;min-width:0;overflow:hidden;';
    const _title = _p.querySelector('.music-title');
    if (_title) _title.style.cssText = 'font-family:Orbitron,sans-serif;font-size:10px;color:#00c8ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.8px;text-transform:uppercase;';
    const _artist = _p.querySelector('.music-artist');
    if (_artist) _artist.style.cssText = 'font-size:11px;color:#6a8aaa;white-space:nowrap;margin-top:1px;';
    const _pb = _p.querySelector('.music-progress-bar');
    if (_pb) _pb.style.cssText = 'width:100%;height:2px;background:rgba(0,200,255,0.12);border-radius:2px;margin-top:6px;overflow:hidden;';
    const _vol = _p.querySelector('.music-volume');
    if (_vol) _vol.style.cssText = 'display:flex;align-items:center;gap:6px;';
  }

  const player = document.getElementById('music-player');
  const playBtn = document.getElementById('music-play-btn');
  const volSlider = document.getElementById('music-vol');
  const muteBtn = document.getElementById('music-mute-btn');
  const progressFill = document.getElementById('music-progress');

  let audio = null, isPlaying = false, isMuted = false, progressInterval = null;
  let autoplayTriggered = false;

  function createAudio(autoplay) {
    if (audio) {
      if (autoplay && window._ytPlayerReady) audio.playVideo();
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.id = 'yt-audio-frame';
    iframe.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;';
    iframe.allow = 'autoplay';
    iframe.src = 'https://www.youtube.com/embed/UDVtMYqUAyw?autoplay=' + (autoplay ? '1' : '0') + '&controls=0&loop=1&playlist=UDVtMYqUAyw&enablejsapi=1&origin=' + window.location.origin;
    document.body.appendChild(iframe);

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    window._ytPlayerReady = false;
    window.onYouTubeIframeAPIReady = function() {
      audio = new YT.Player('yt-audio-frame', {
        events: {
          onReady: function(e) {
            window._ytPlayerReady = true;
            e.target.setVolume(parseInt(volSlider.value));
            if (isPlaying) e.target.playVideo();
          },
          onStateChange: function(e) {
            if (e.data === YT.PlayerState.ENDED) e.target.playVideo();
          }
        }
      });
    };
    if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
  }

  function updateProgress() {
    if (!audio || !window._ytPlayerReady) return;
    try {
      const dur = audio.getDuration ? audio.getDuration() : 0;
      const cur = audio.getCurrentTime ? audio.getCurrentTime() : 0;
      if (dur > 0 && progressFill) progressFill.style.width = ((cur / dur) * 100) + '%';
    } catch(e) {}
  }

  function setPlayState(playing) {
    isPlaying = playing;
    if (playBtn) { playBtn.innerHTML = playing ? '&#9646;&#9646;' : '&#9654;'; playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
    if (player) player.classList.toggle('playing', playing);
    if (playing) { progressInterval = setInterval(updateProgress, 1000); }
    else { clearInterval(progressInterval); }
  }

  // Autoplay on first user interaction (click/scroll/keydown)
  function tryAutoplay() {
    if (autoplayTriggered) return;
    autoplayTriggered = true;
    isPlaying = true;
    setPlayState(true);
    createAudio(true);
    // Remove listeners after first trigger
    document.removeEventListener('click', tryAutoplay);
    document.removeEventListener('scroll', tryAutoplay, { passive: true });
    document.removeEventListener('keydown', tryAutoplay);
  }
  document.addEventListener('click', tryAutoplay);
  document.addEventListener('scroll', tryAutoplay, { passive: true });
  document.addEventListener('keydown', tryAutoplay);

  // Manual play/pause
  if (playBtn) playBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!audio && !autoplayTriggered) {
      autoplayTriggered = true;
      isPlaying = true;
      setPlayState(true);
      createAudio(true);
      document.removeEventListener('click', tryAutoplay);
      document.removeEventListener('scroll', tryAutoplay, { passive: true });
      document.removeEventListener('keydown', tryAutoplay);
      return;
    }
    isPlaying = !isPlaying;
    setPlayState(isPlaying);
    if (window._ytPlayerReady && audio) {
      if (isPlaying) audio.playVideo(); else audio.pauseVideo();
    } else if (isPlaying) {
      const check = setInterval(function() {
        if (window._ytPlayerReady && audio) { audio.playVideo(); clearInterval(check); }
      }, 300);
    }
  });

  if (volSlider) volSlider.addEventListener('input', function() {
    const vol = parseInt(this.value);
    if (window._ytPlayerReady && audio) audio.setVolume(vol);
    if (muteBtn) muteBtn.innerHTML = vol === 0 ? '&#128263;' : vol < 50 ? '&#128265;' : '&#128266;';
  });

  if (muteBtn) muteBtn.addEventListener('click', function() {
    isMuted = !isMuted;
    muteBtn.innerHTML = isMuted ? '&#128263;' : '&#128266;';
    if (window._ytPlayerReady && audio) { if (isMuted) audio.mute(); else audio.unMute(); }
  });

  // M key toggle
  document.addEventListener('keydown', function(e) {
    if (e.key === 'm' && !e.ctrlKey && !e.metaKey &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {
      if (playBtn) playBtn.click();
    }
  });
}
