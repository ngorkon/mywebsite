'use strict';
// ═══════════════════════════════════════════════
//  Ng'or Kon Portfolio — Main Script
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
  const nav    = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  // Close on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav && nav.classList.remove('open'));
  });
  // Active highlight
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
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
    if  (deleting && li === 0)        { deleting = false; pi = (pi+1) % phrases.length; }
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

// ─── Background canvas (subtle particle web) ──
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
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
          ctx.strokeStyle = `rgba(0,200,255,${.18*(1-d/120)})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
        }
      }
    requestAnimationFrame(draw);
  };
  draw();
}

// ─── Hero canvas (interactive particle burst) ─
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: null, y: null };

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    spawn();
  };

  const spawn = () => {
    particles = Array.from({length: Math.min(80, (W*H)/10000)}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      ox: 0, oy: 0,
      vx: (Math.random()-.5)*.5, vy: (Math.random()-.5)*.5,
      r: Math.random()*2+.8,
      a: Math.random()*.5+.2
    }));
    particles.forEach(p => { p.ox = p.x; p.oy = p.y; });
  };

  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top;
  });
  window.addEventListener('mouseout', () => { mouse.x = mouse.y = null; });
  window.addEventListener('resize', resize);
  resize();

  const draw = () => {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      if (mouse.x !== null) {
        const dx = mouse.x-p.x, dy = mouse.y-p.y, d = Math.hypot(dx,dy);
        if (d < 90) { const f = (90-d)/90; p.x -= dx/d*f*4; p.y -= dy/d*f*4; }
        else { p.x += (p.ox-p.x)*.02; p.y += (p.oy-p.y)*.02; }
      } else {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
      }
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(0,200,255,${p.a})`; ctx.fill();
    });
    // Connect nearby
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const d = Math.hypot(particles[i].x-particles[j].x, particles[i].y-particles[j].y);
      if (d < 100) {
        ctx.strokeStyle = `rgba(0,200,255,${.25*(1-d/100)})`;
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
}

// ─── Profile pic click burst ──────────────────
function initProfilePulse() {
  const pic = document.getElementById('profile-pic');
  if (!pic) return;
  pic.style.cursor = 'pointer';
  pic.addEventListener('click', () => {
    pic.style.transition = 'transform .15s ease, box-shadow .15s ease';
    pic.style.transform = 'scale(1.12)';
    pic.style.boxShadow = '0 0 80px rgba(0,200,255,.8), 0 0 160px rgba(0,120,255,.4)';
    setTimeout(() => { pic.style.transform = ''; pic.style.boxShadow = ''; }, 400);
  });
}

// ═══════════════════════════════════════════════
//  N-BODY GRAVITATIONAL SIMULATION
// ═══════════════════════════════════════════════
function initSimulation() {
  const canvas  = document.getElementById('sim-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const infoEl  = document.getElementById('sim-info');
  const countEl = document.getElementById('sim-body-count');
  const gravEl  = document.getElementById('sim-gravity');
  const playBtn = document.getElementById('sim-play-pause');
  const resetBtn= document.getElementById('sim-reset');
  const addBtn  = document.getElementById('sim-add-body');

  let W, H, bodies = [], running = true, G = 1, selectedBody = null;
  let animId;

  const COLORS = ['#00c8ff','#ff6b35','#7fff00','#ff2d78','#ffd700','#a78bfa','#00e676','#ff9d00'];
  const langColors = { python:'#3572A5', js:'#f1e05a', default:'#00c8ff' };

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight || 480;
  };

  const randBody = () => ({
    x: W*.2 + Math.random()*W*.6,
    y: H*.2 + Math.random()*H*.6,
    vx: (Math.random()-.5)*2,
    vy: (Math.random()-.5)*2,
    mass: 5 + Math.random()*25,
    color: COLORS[Math.floor(Math.random()*COLORS.length)],
    trail: [],
    selected: false
  });

  const reset = () => {
    bodies = Array.from({length: 6}, randBody);
    // Give one large body in center
    bodies[0] = { x:W/2, y:H/2, vx:0, vy:0, mass:80, color:'#ffd700', trail:[], selected:false };
    // Give orbiting bodies coherent velocity
    for (let i=1;i<bodies.length;i++) {
      const dx = bodies[i].x - W/2, dy = bodies[i].y - H/2;
      const d  = Math.hypot(dx,dy) || 1;
      const v  = Math.sqrt(G * bodies[0].mass / d) * .7;
      bodies[i].vx = -dy/d * v;
      bodies[i].vy =  dx/d * v;
    }
    selectedBody = null;
    if (infoEl) infoEl.textContent = '';
  };

  const step = () => {
    const dt = 0.6;
    G = gravEl ? parseFloat(gravEl.value) : 1;

    bodies.forEach(b => {
      let ax = 0, ay = 0;
      bodies.forEach(other => {
        if (other === b) return;
        const dx = other.x - b.x, dy = other.y - b.y;
        const d2 = dx*dx + dy*dy + 100; // softening
        const f  = G * other.mass / d2;
        ax += f * dx; ay += f * dy;
      });
      b.vx += ax*dt; b.vy += ay*dt;
    });

    bodies.forEach(b => {
      b.trail.push({x:b.x, y:b.y});
      if (b.trail.length > 120) b.trail.shift();
      b.x += b.vx*dt; b.y += b.vy*dt;
      // Soft boundary repulsion
      const pad = 20;
      if (b.x < pad) b.vx += .5; if (b.x > W-pad) b.vx -= .5;
      if (b.y < pad) b.vy += .5; if (b.y > H-pad) b.vy -= .5;
    });
  };

  const draw = () => {
    ctx.fillStyle = 'rgba(5,8,20,.18)';
    ctx.fillRect(0,0,W,H);

    // Draw trails
    bodies.forEach(b => {
      if (b.trail.length < 2) return;
      ctx.beginPath();
      b.trail.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.strokeStyle = b.color.replace(')',',0.25)').replace('rgb','rgba').replace('#','');
      // simpler approach:
      ctx.strokeStyle = b.color + '40';
      ctx.lineWidth = 1.2; ctx.stroke();
    });

    // Draw gravitational field lines (faint)
    bodies.forEach(b => {
      const r = Math.sqrt(b.mass) * 8;
      const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,r*3);
      g.addColorStop(0, b.color + '18');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x,b.y,r*3,0,Math.PI*2); ctx.fill();
    });

    // Draw bodies
    bodies.forEach(b => {
      const r = Math.sqrt(b.mass) * 1.5;
      const glow = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,r*2.5);
      glow.addColorStop(0, b.color);
      glow.addColorStop(.5, b.color + '80');
      glow.addColorStop(1,  'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(b.x,b.y,r*2.5,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x,b.y,r,0,Math.PI*2); ctx.fill();

      if (b.selected) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(b.x,b.y,r+5,0,Math.PI*2); ctx.stroke();
      }
    });

    // HUD stats
    if (countEl) countEl.textContent = bodies.length;
  };

  const loop = () => {
    if (running) step();
    draw();
    animId = requestAnimationFrame(loop);
  };

  // Canvas click → select body
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX-r.left, my = e.clientY-r.top;
    let hit = null;
    bodies.forEach(b => {
      const bR = Math.sqrt(b.mass)*1.5;
      if (Math.hypot(mx-b.x, my-b.y) < bR+10) hit = b;
    });
    bodies.forEach(b => b.selected = false);
    if (hit) {
      hit.selected = true; selectedBody = hit;
      if (infoEl) infoEl.textContent =
        `Body → mass: ${hit.mass.toFixed(1)} | vel: (${hit.vx.toFixed(2)}, ${hit.vy.toFixed(2)}) | pos: (${hit.x.toFixed(0)}, ${hit.y.toFixed(0)})`;
    } else {
      selectedBody = null;
      if (infoEl) infoEl.textContent = '';
    }
  });

  // Controls
  if (playBtn) playBtn.addEventListener('click', () => {
    running = !running;
    playBtn.textContent = running ? '⏸ Pause' : '▶ Play';
    playBtn.classList.toggle('active', running);
  });
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (addBtn)   addBtn.addEventListener('click', () => { bodies.push(randBody()); });

  window.addEventListener('resize', () => { resize(); reset(); });

  resize();
  reset();
  loop();
}

// ─── Project filter ───────────────────────────
function initProjectFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const match = f === 'all' || c.dataset.cat === f;
        c.classList.toggle('hidden', !match);
      });
    });
  });
}

// ─── GitHub Live Feed ─────────────────────────
function initGithubFeed() {
  const feed = document.getElementById('github-feed');
  if (!feed) return;

  const LANG_COLORS = {
    Python: '#3572A5', JavaScript: '#f1e05a', HTML: '#e34c26',
    CSS: '#563d7c', TypeScript: '#2b7489', Jupyter: '#DA5B0B',
    Shell: '#89e051', default: '#00c8ff'
  };

  fetch('https://api.github.com/users/ngorkon/repos?sort=updated&per_page=12')
    .then(r => r.json())
    .then(repos => {
      if (!Array.isArray(repos)) { feed.innerHTML = '<p class="feed-error">Could not load GitHub repos.</p>'; return; }
      const public_repos = repos.filter(r => !r.fork && !r.private);
      if (public_repos.length === 0) { feed.innerHTML = ''; return; }
      feed.innerHTML = public_repos.map(repo => {
        const lang  = repo.language || '';
        const color = LANG_COLORS[lang] || LANG_COLORS.default;
        const desc  = repo.description || 'No description provided.';
        const stars = repo.stargazers_count;
        const forks = repo.forks_count;
        const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {month:'short', year:'numeric'});
        return `<a href="${repo.html_url}" target="_blank" class="repo-card reveal">
          <span class="repo-name">${repo.name}</span>
          <span class="repo-desc">${desc.length > 100 ? desc.slice(0,97)+'…' : desc}</span>
          <div class="repo-meta">
            ${lang ? `<span><span class="repo-lang" style="background:${color}"></span>${lang}</span>` : ''}
            ${stars ? `<span>⭐ ${stars}</span>` : ''}
            ${forks ? `<span>🍴 ${forks}</span>` : ''}
            <span>🕒 ${updated}</span>
          </div>
        </a>`;
      }).join('');
      // Re-init reveal for the new cards
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      feed.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    })
    .catch(() => { feed.innerHTML = ''; });
}
