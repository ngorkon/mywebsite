'use strict';
// ═══════════════════════════════════════════════
// Ng'or Kon Portfolio — Main Script
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initNav();
  initTyping();
  initReveal();
  initBgCanvas();
  initHeroCanvas();
  initSimulation();
  initProjectFilter();
  initGithubFeed();
  initProfilePulse();
  initJourneyMap();
});

// ─── Header scroll effect ─────────────────────
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── Hamburger + Active nav ───────────────────
function initNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav && nav.classList.remove('open'));
  });
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }, { passive: true });
}

// ─── Typing animation ─────────────────────────
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrases = ['Physicist.', 'Coder.', 'ML Engineer.', 'Researcher.', 'Innovator.'];
  let pi = 0, li = 0, deleting = false;
  const type = () => {
    const ph = phrases[pi];
    el.textContent = deleting ? ph.slice(0, --li) : ph.slice(0, ++li);
    if (!deleting && li === ph.length) { deleting = true; setTimeout(type, 1400); return; }
    if (deleting && li === 0) { deleting = false; pi = (pi+1) % phrases.length; }
    setTimeout(type, deleting ? 45 : 95);
  };
  type();
}

// ─── Scroll reveal ────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── Background canvas ────────────────────────
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    pts = Array.from({length: 60}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4
    }));
  };
  resize();
  window.addEventListener('resize', resize);
  const draw = () => {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = 'rgba(0,200,255,0.35)';
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill();
    });
    for (let i=0; i<pts.length; i++)
      for (let j=i+1; j<pts.length; j++) {
        const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
        if (d < 120) {
          ctx.strokeStyle = 'rgba(0,200,255,' + (.18*(1-d/120)) + ')';
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
        }
      }
    requestAnimationFrame(draw);
  };
  draw();
}

// ─── Hero canvas (simple) ─────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize);
  const spawn = () => { particles.push({ x: Math.random()*W, y: H+5, vx:(Math.random()-.5)*.6, vy:-Math.random()*1.5-.3, life: 0, max: 120+Math.random()*60 }); };
  const draw = () => {
    ctx.clearRect(0,0,W,H);
    if (particles.length < 80) spawn();
    particles = particles.filter(p => p.life < p.max);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const a = 1 - p.life/p.max;
      ctx.fillStyle = 'rgba(0,200,255,' + (a*0.7) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
}

// ─── Profile pulse ────────────────────────────
function initProfilePulse() {
  const img = document.querySelector('.profile-img');
  if (!img) return;
  img.addEventListener('click', () => {
    img.classList.add('pulse');
    setTimeout(() => img.classList.remove('pulse'), 1200);
  });
}

// ─── N-Body Simulation ────────────────────────
function initSimulation() {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const infoEl = document.getElementById('sim-info');
  const countEl = document.getElementById('sim-body-count');
  const gravEl = document.getElementById('sim-gravity');
  const playBtn = document.getElementById('sim-play-pause');
  const resetBtn = document.getElementById('sim-reset');
  const addBtn = document.getElementById('sim-add-body');

  let W, H, bodies = [], running = true, G = 1, selectedBody = null;
  const COLORS = ['#00c8ff','#ff6b35','#7fff00','#ff2d78','#ffd700','#a78bfa','#00e676','#ff9d00'];

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = 420;
  };
  resize();
  window.addEventListener('resize', resize);

  const randBody = () => {
    const mass = 4 + Math.random()*18;
    return {
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*1.2, vy: (Math.random()-.5)*1.2,
      mass, r: Math.sqrt(mass)*1.6,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      trail: []
    };
  };
  const reset = () => { bodies = Array.from({length: 6}, randBody); if (countEl) countEl.textContent = bodies.length; };
  reset();

  const step = () => {
    for (let i=0; i<bodies.length; i++) {
      for (let j=i+1; j<bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x-a.x, dy = b.y-a.y;
        let d2 = dx*dx + dy*dy; if (d2 < 100) d2 = 100;
        const d = Math.sqrt(d2);
        const f = G * a.mass * b.mass / d2;
        const fx = f*dx/d, fy = f*dy/d;
        a.vx += fx/a.mass; a.vy += fy/a.mass;
        b.vx -= fx/b.mass; b.vy -= fy/b.mass;
      }
    }
    bodies.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0 || b.x > W) b.vx *= -0.85;
      if (b.y < 0 || b.y > H) b.vy *= -0.85;
      b.x = Math.max(0, Math.min(W, b.x));
      b.y = Math.max(0, Math.min(H, b.y));
      b.trail.push({x:b.x, y:b.y});
      if (b.trail.length > 30) b.trail.shift();
    });
  };

  const draw = () => {
    ctx.fillStyle = 'rgba(5,10,25,0.35)';
    ctx.fillRect(0,0,W,H);
    bodies.forEach(b => {
      ctx.strokeStyle = b.color + '88';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      b.trail.forEach((p, i) => { if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.stroke();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    if (selectedBody && infoEl) {
      infoEl.textContent = 'Mass ' + selectedBody.mass.toFixed(1) + '  |  v=' + Math.hypot(selectedBody.vx, selectedBody.vy).toFixed(2);
    }
  };

  const loop = () => {
    if (running) step();
    draw();
    requestAnimationFrame(loop);
  };
  loop();

  if (playBtn) playBtn.addEventListener('click', () => { running = !running; playBtn.textContent = running ? '⏸ Pause' : '▶ Play'; });
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (addBtn) addBtn.addEventListener('click', () => { bodies.push(randBody()); if (countEl) countEl.textContent = bodies.length; });
  if (gravEl) gravEl.addEventListener('input', e => { G = parseFloat(e.target.value); });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    selectedBody = bodies.find(b => Math.hypot(b.x-mx, b.y-my) < b.r+5) || null;
    if (!selectedBody) {
      bodies.push({ x:mx, y:my, vx:(Math.random()-.5)*0.5, vy:(Math.random()-.5)*0.5, mass: 8+Math.random()*10, r: 4, color: COLORS[Math.floor(Math.random()*COLORS.length)], trail: [] });
      bodies[bodies.length-1].r = Math.sqrt(bodies[bodies.length-1].mass)*1.6;
      if (countEl) countEl.textContent = bodies.length;
    }
  });
}

// ─── Project filter ───────────────────────────
function initProjectFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

// ─── GitHub live feed (with fallback) ─────────
function initGithubFeed() {
  const feed = document.getElementById('github-feed');
  if (!feed) return;

  const LANG_COLORS = {
    Python: '#3572A5', JavaScript: '#f1e05a', HTML: '#e34c26',
    CSS: '#563d7c', TypeScript: '#2b7489', Jupyter: '#DA5B0B',
    'Jupyter Notebook': '#DA5B0B', Shell: '#89e051', C: '#555555',
    'C++': '#f34b7d', Java: '#b07219', Go: '#00ADD8',
    default: '#00c8ff'
  };

  const renderRepos = (repos) => {
    if (!repos.length) {
      feed.innerHTML = '<p class="feed-empty">No public repositories found yet.</p>';
      return;
    }
    feed.innerHTML = repos.map(repo => {
      const lang = repo.language || '';
      const color = LANG_COLORS[lang] || LANG_COLORS.default;
      const desc = repo.description || 'No description provided.';
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      const updated = repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}) : '';
      return '<a class="repo-card reveal" href="' + repo.html_url + '" target="_blank" rel="noopener">'
        + '<span class="repo-name">' + repo.name + '</span>'
        + '<span class="repo-desc">' + (desc.length > 110 ? desc.slice(0,107)+'…' : desc) + '</span>'
        + '<div class="repo-meta">'
        + (lang ? '<span><span class="repo-lang" style="background:' + color + '"></span>' + lang + '</span>' : '')
        + (stars ? '<span>★ ' + stars + '</span>' : '')
        + (forks ? '<span>⑂ ' + forks + '</span>' : '')
        + (updated ? '<span>⟳ ' + updated + '</span>' : '')
        + '</div></a>';
    }).join('');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    feed.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  };

  const showError = (msg) => {
    feed.innerHTML = '<div class="feed-error">'
      + '<p>⚠ ' + msg + '</p>'
      + '<a class="btn-secondary" href="https://github.com/ngorkon" target="_blank" rel="noopener">View GitHub Profile →</a>'
      + '</div>';
  };

  // 8s timeout fallback
  const timeout = setTimeout(() => {
    if (feed.querySelector('.feed-loading')) {
      showError('GitHub request timed out. Try again later.');
    }
  }, 8000);

  fetch('https://api.github.com/users/ngorkon/repos?sort=updated&per_page=12', {
    headers: { 'Accept': 'application/vnd.github+json' }
  })
    .then(r => {
      clearTimeout(timeout);
      if (!r.ok) {
        if (r.status === 403) throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
        throw new Error('GitHub responded with status ' + r.status);
      }
      return r.json();
    })
    .then(repos => {
      if (!Array.isArray(repos)) { showError('Could not load repositories.'); return; }
      const pub = repos.filter(r => !r.fork && !r.private);
      renderRepos(pub);
    })
    .catch(err => {
      clearTimeout(timeout);
      console.error('GitHub feed error:', err);
      showError(err.message || 'Could not load GitHub repos.');
    });
}

// ─── Journey Map (Leaflet) ────────────────────
function initJourneyMap() {
  const mapEl = document.getElementById('journey-map');
  if (!mapEl || typeof L === 'undefined') return;

  const stops = [
    { name: 'Kakuma, Kenya',            coords: [3.7167, 34.8667], date: 'Feb 2021 – Aug 2023', role: 'Co-Founder & Director of Technology · Project 21 Kenya', desc: 'Youth coalition eradicating poverty in Kakuma Refugees Camp. Led funding acquisition, tech initiatives, and community projects.' },
    { name: 'UWC Maastricht, Netherlands', coords: [50.8514, 5.6910], date: 'Sept 2021 – May 2023', role: 'IB Diploma Programme · United World College Maastricht', desc: 'Member of Robotics Club and Musicals Club. International, multicultural learning environment.' },
    { name: 'The College of Idaho, USA',  coords: [43.6533, -116.6973], date: 'May 2024 – Present', role: 'Academic Tutor · The College of Idaho', desc: 'Supporting students in Calculus and Education courses — breaking down complex concepts into clear steps.' }
  ];

  const map = L.map('journey-map', {
    center: [30, -10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true,
    zoomControl: true,
    scrollWheelZoom: false
  });

  // Dark tile layer (CartoDB dark matter — free, no API key)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Custom glowing marker
  const makeMarker = (s, idx) => {
    const icon = L.divIcon({
      className: 'jm-marker',
      html: '<div class="jm-pin"><span class="jm-num">' + (idx+1) + '</span></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const m = L.marker(s.coords, { icon }).addTo(map);
    m.bindPopup(
      '<div class="jm-popup">'
      + '<h4>' + s.name + '</h4>'
      + '<span class="jm-date">' + s.date + '</span>'
      + '<strong>' + s.role + '</strong>'
      + '<p>' + s.desc + '</p>'
      + '</div>'
    );
    return m;
  };

  const markers = stops.map(makeMarker);

  // Animated dashed path between stops
  const latlngs = stops.map(s => s.coords);
  const path = L.polyline(latlngs, {
    color: '#00c8ff',
    weight: 3,
    opacity: 0.85,
    dashArray: '8, 10',
    className: 'jm-path'
  }).addTo(map);

  // Fit bounds to all stops
  map.fitBounds(L.latLngBounds(latlngs).pad(0.35));

  // Animated plane traveling along the route
  const planeIcon = L.divIcon({
    className: 'jm-plane',
    html: '✈',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  const plane = L.marker(latlngs[0], { icon: planeIcon, interactive: false }).addTo(map);

  const interp = (a, b, t) => [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t];

  let leg = 0, t = 0;
  const animate = () => {
    if (leg >= latlngs.length - 1) { leg = 0; t = 0; }
    t += 0.004;
    if (t >= 1) {
      t = 0; leg++;
      if (leg < latlngs.length) markers[leg].openPopup();
    }
    if (leg < latlngs.length - 1) {
      const pos = interp(latlngs[leg], latlngs[leg+1], t);
      plane.setLatLng(pos);
    }
    requestAnimationFrame(animate);
  };
  // Open the first popup briefly to highlight origin
  setTimeout(() => markers[0].openPopup(), 600);
  animate();

  // Step list interactivity
  const stepEls = document.querySelectorAll('.jm-step');
  stepEls.forEach((el, i) => {
    el.addEventListener('click', () => {
      if (!stops[i]) return;
      map.flyTo(stops[i].coords, 5, { duration: 1.4 });
      setTimeout(() => markers[i].openPopup(), 1400);
    });
  });
}
