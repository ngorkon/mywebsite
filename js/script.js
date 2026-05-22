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
    const roles = ['Physics Student', 'ML Researcher', 'Code Builder', 'Problem Solver'];
    let r = 0, i = 0, del = false;
    function type() {
          const word = roles[r];
          el.textContent = del ? word.substring(0, --i) : word.substring(0, ++i);
          let delay = del ? 60 : 110;
          if (!del && i === word.length) { delay = 1500; del = true; }
          else if (del && i === 0) { del = false; r = (r + 1) % roles.length; delay = 400; }
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
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
}

// ─── Background star canvas ───
function initBgCanvas() {
    const c = document.getElementById('bg-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let stars = [];
    function resize() {
          c.width = window.innerWidth;
          c.height = window.innerHeight;
          stars = Array.from({ length: 140 }, () => ({
                  x: Math.random() * c.width,
                  y: Math.random() * c.height,
                  r: Math.random() * 1.4 + 0.2,
                  a: Math.random() * 0.8 + 0.2,
                  s: Math.random() * 0.02 + 0.005
          }));
    }
    function draw() {
          ctx.clearRect(0, 0, c.width, c.height);
          stars.forEach(s => {
                  s.a += s.s * (Math.random() > 0.5 ? 1 : -1);
                  if (s.a < 0.1) s.a = 0.1; if (s.a > 1) s.a = 1;
                  ctx.beginPath();
                  ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                  ctx.fillStyle = 'rgba(0,225,255,' + s.a + ')';
                  ctx.fill();
          });
          requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    draw();
}

// ─── Hero particle canvas ───
function initHeroCanvas() {
    const c = document.getElementById('hero-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let particles = [];
    function resize() {
          c.width = c.parentElement.offsetWidth;
          c.height = c.parentElement.offsetHeight;
    }
    function spawn() {
          return {
                  x: Math.random() * c.width,
                  y: Math.random() * c.height,
                  vx: (Math.random() - 0.5) * 0.4,
                  vy: (Math.random() - 0.5) * 0.4,
                  r: Math.random() * 2 + 0.5
          };
    }
    function draw() {
          ctx.clearRect(0, 0, c.width, c.height);
          while (particles.length < 60) particles.push(spawn());
          particles.forEach(p => {
                  p.x += p.vx; p.y += p.vy;
                  if (p.x < 0 || p.x > c.width) p.vx *= -1;
                  if (p.y < 0 || p.y > c.height) p.vy *= -1;
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                  ctx.fillStyle = 'rgba(0,225,255,0.6)';
                  ctx.fill();
          });
          requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    draw();
}

// ─── Profile pulse ───
function initProfilePulse() {
    const p = document.getElementById('profile-pic');
    if (!p) return;
    p.addEventListener('mouseenter', () => p.classList.add('pulse'));
    p.addEventListener('mouseleave', () => p.classList.remove('pulse'));
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
                  x: Math.random() * c.width,
                  y: Math.random() * c.height,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: (Math.random() - 0.5) * 1.5,
                  m: Math.random() * 15 + 5,
                  color: 'hsl(' + (Math.random() * 360) + ', 90%, 60%)',
                  trail: []
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
                  if (b.trail.length > 40) b.trail.shift();
          });
    }
    function draw() {
          ctx.fillStyle = 'rgba(5,10,25,0.35)';
          ctx.fillRect(0, 0, c.width, c.height);
          bodies.forEach(b => {
                  ctx.beginPath();
                  for (let k = 0; k < b.trail.length; k++) {
                            const [x, y] = b.trail[k];
                            if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                  }
                  ctx.strokeStyle = b.color;
                  ctx.lineWidth = 1.2;
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.arc(b.x, b.y, Math.sqrt(b.m), 0, Math.PI * 2);
                  ctx.fillStyle = b.color;
                  ctx.fill();
          });
    }
    function loop() {
          if (running) step();
          draw();
          requestAnimationFrame(loop);
    }
    resize();
    window.addEventListener('resize', resize);
    reset();
    loop();
    if (playBtn) playBtn.addEventListener('click', () => {
          running = !running;
          playBtn.textContent = running ? '⏸ Pause' : '▶ Play';
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
          const hit = bodies.find(b => (b.x - mx) ** 2 + (b.y - my) ** 2 < b.m * 4);
          if (hit && infoEl) {
                  infoEl.textContent = 'Mass: ' + hit.m.toFixed(1) + ' · v = ('
                    + hit.vx.toFixed(2) + ', ' + hit.vy.toFixed(2) + ')';
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
          const f = b.dataset.filter;
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
    const URL = 'https://api.github.com/users/' + USER + '/repos?sort=updated&per_page=12';
    fetch(URL, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
      .then(r => {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.json();
      })
      .then(repos => {
              if (!Array.isArray(repos) || repos.length === 0) {
                        showError('No public repositories found.');
                        return;
              }
              const top = repos
                .filter(r => !r.fork)
                .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
                .slice(0, 6);
              renderRepos(top);
      })
      .catch(err => {
              console.error('GitHub feed error:', err);
              showError('GitHub API unavailable. See Featured Projects below.');
      });

  function renderRepos(repos) {
        feed.innerHTML = '<div class="repo-grid">' + repos.map(r => {
                const lang = r.language || 'Code';
                const desc = r.description ? r.description.replace(/[<>]/g, '') : 'No description provided.';
                const updated = new Date(r.pushed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return ''
                  + '<a class="repo-card" href="' + r.html_url + '" target="_blank" rel="noopener">'
                  +   '<div class="repo-head">'
                  +     '<span class="repo-icon">📦</span>'
                  +     '<h4 class="repo-name">' + r.name + '</h4>'
                  +   '</div>'
                  +   '<p class="repo-desc">' + desc + '</p>'
                  +   '<div class="repo-meta">'
                  +     '<span class="repo-lang">● ' + lang + '</span>'
                  +     '<span class="repo-stars">★ ' + r.stargazers_count + '</span>'
                  +     '<span class="repo-forks">⑂ ' + r.forks_count + '</span>'
                  +   '</div>'
                  +   '<div class="repo-updated">Updated ' + updated + '</div>'
                  + '</a>';
        }).join('') + '</div>';
  }

  function showError(msg) {
        feed.innerHTML = '<div class="feed-error">⚠ ' + msg + '</div>';
  }
}

// ─── Journey Map (Leaflet) ───
function initJourneyMap() {
    const el = document.getElementById('journey-map');
    if (!el || typeof L === 'undefined') {
          if (el) el.innerHTML = '<div class="feed-error">Map library failed to load.</div>';
          return;
    }

  const stops = [
    {
            name: 'Kakuma, Kenya',
            coords: [3.7167, 34.8667],
            date: 'Feb 2021 – Aug 2023',
            role: 'Co-Founder & Director of Technology · Project 21 Kenya',
            desc: 'Eradicating poverty in Kakuma Refugee Camp — built homes for flood-displaced families, led funding and tech initiatives.'
    },
    {
            name: 'UWC Maastricht, Netherlands',
            coords: [50.8514, 5.6910],
            date: 'Sept 2021 – May 2023',
            role: 'IB Diploma Programme · United World College Maastricht',
            desc: 'Robotics Club and Musicals Club. International, multicultural environment that sharpened my global outlook.'
    },
    {
            name: 'The College of Idaho, USA',
            coords: [43.6629, -116.6873],
            date: 'May 2024 – Present',
            role: 'Academic Tutor · Calculus & Education',
            desc: 'Coordinating cross-cultural events for 100+ international students through the International Students Organization.'
    }
      ];

  const map = L.map(el, {
        center: [30, -10],
        zoom: 2,
        scrollWheelZoom: false,
        worldCopyJump: true,
        zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
  }).addTo(map);

  function makeMarker(stop, idx) {
        const icon = L.divIcon({
                className: 'jm-pin',
                html: '<div class="jm-pin-inner"><span>' + (idx + 1) + '</span></div>',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
        });
        const m = L.marker(stop.coords, { icon }).addTo(map);
        m.bindPopup(
                '<div class="jm-popup">'
                + '<div class="jm-popup-date">' + stop.date + '</div>'
                + '<h4>' + stop.name + '</h4>'
                + '<div class="jm-popup-role">' + stop.role + '</div>'
                + '<p>' + stop.desc + '</p>'
                + '</div>'
              );
        return m;
  }

  const markers = stops.map((s, i) => makeMarker(s, i));

  // Fit bounds to show all pins
  const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.4));

  // Animated polyline between stops
  function interp(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  const fullPath = [];
    for (let i = 0; i < stops.length - 1; i++) {
          const a = stops[i].coords, b = stops[i + 1].coords;
          const steps = 80;
          for (let t = 0; t <= steps; t++) fullPath.push(interp(a, b, t / steps));
    }

  const line = L.polyline([], {
        color: '#00e1ff',
        weight: 3,
        opacity: 0.9,
        dashArray: '6, 8'
  }).addTo(map);

  let progress = 0;
    function animate() {
          if (progress < fullPath.length) {
                  line.addLatLng(fullPath[progress]);
                  progress += 2;
                  setTimeout(animate, 25);
          } else {
                  // restart loop after pause
            setTimeout(() => {
                      line.setLatLngs([]);
                      progress = 0;
                      animate();
            }, 4000);
          }
    }

  // Trigger map resize once visible (Leaflet renders blank if container was hidden)
  setTimeout(() => {
        map.invalidateSize();
        animate();
        // Open first popup briefly to draw attention
                 markers[0].openPopup();
  }, 400);

  // Recompute on tab/visibility changes
  window.addEventListener('resize', () => map.invalidateSize());
}

window.addEventListener('resize', () => map.invalidateSize());
}
