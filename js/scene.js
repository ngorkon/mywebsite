'use strict';
/* ═══════════════════════════════════════════════════════════
   QUANTUM FIELD v2 — Three.js morphing particle engine
   Cinematic ~25° elevated camera · per-shape spectral coloring
   Galaxy: 2-arm grand design with dense golden core + glow
   Shapes: Galaxy → Orbital → Torus Knot → Globe → Core
═══════════════════════════════════════════════════════════ */

(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const numParticles = 24000;
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070f, 0.018);

  // Elevated camera — sees the galaxy disc at an inclination, like a Hubble shot
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 220);
  const camBase = new THREE.Vector3(0, 6.8, 14.5);
  camera.position.copy(camBase);
  camera.lookAt(0, 0, 0);

  /* ── Soft glow sprite texture (fake bloom) ── */
  function makeGlowTexture() {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 64;
    const ctx = cnv.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.65, 'rgba(255,255,255,0.1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cnv);
  }
  const glowTex = makeGlowTexture();

  /* ── Spectral color ramp: golden core → cyan mid → violet rim ── */
  const cCore = new THREE.Color(0xfff3d0);
  const cGold = new THREE.Color(0xffc94d);
  const cCyan = new THREE.Color(0x37e2ff);
  const cViolet = new THREE.Color(0xa78bff);
  const tmpC = new THREE.Color();

  function rampColor(t, out) {
    // t in [0,1] = normalized radius
    if (t < 0.18) out.copy(cCore).lerp(cGold, t / 0.18);
    else if (t < 0.55) out.copy(cGold).lerp(cCyan, (t - 0.18) / 0.37);
    else out.copy(cCyan).lerp(cViolet, Math.min(1, (t - 0.55) / 0.45));
    return out;
  }

  /* ── Shape generators — return { pos, maxR, brightBoost(r,t) } ── */
  function shapeGalaxy() {
    const pos = new Float32Array(numParticles * 3);
    const arms = 2;
    const Rmax = 11;
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      const u = Math.random();
      if (u < 0.28) {
        // Central bulge — dense gaussian blob, slightly flattened
        const r = Math.pow(Math.random(), 2.2) * 2.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[k]     = r * Math.sin(phi) * Math.cos(theta);
        pos[k + 1] = r * Math.cos(phi) * 0.55;
        pos[k + 2] = r * Math.sin(phi) * Math.sin(theta);
      } else if (u < 0.86) {
        // Two grand-design spiral arms — tight, well defined
        const t = Math.pow(Math.random(), 0.62);
        const radius = 1.6 + t * (Rmax - 1.6);
        const armOffset = (Math.random() < 0.5 ? 0 : Math.PI);
        const spin = radius * 0.52;
        const spread = 0.16 + (1 - t) * 0.22;   // arms tighten outward slightly
        const angle = armOffset + spin + (Math.random() - 0.5) * spread * 2;
        const rJit = (Math.random() - 0.5) * spread * 2.4;
        pos[k]     = Math.cos(angle) * (radius + rJit);
        pos[k + 2] = Math.sin(angle) * (radius + rJit);
        pos[k + 1] = (Math.random() - 0.5) * 0.4 * (1.3 - t); // thin disc
      } else {
        // Inter-arm haze — faint scattered disc dust
        const t = Math.pow(Math.random(), 0.5);
        const radius = 1.6 + t * (Rmax - 1.6);
        const angle = Math.random() * Math.PI * 2;
        pos[k]     = Math.cos(angle) * radius;
        pos[k + 2] = Math.sin(angle) * radius;
        pos[k + 1] = (Math.random() - 0.5) * 0.5;
      }
    }
    return { pos, maxR: Rmax };
  }

  function shapeOrbital() {
    const pos = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      let x, y, z;
      if (Math.random() < 0.62) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        const u = Math.random();
        const r = Math.pow(Math.random(), 0.5) * 3.2 * Math.sin(Math.PI * u);
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r * 0.75;
        z = Math.sin(theta) * r * 0.75;
        y = sign * (u * 7.0 + 0.6);
      } else {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const R = 5.4, tube = 0.85 * Math.pow(Math.random(), 0.5);
        x = (R + tube * Math.cos(phi)) * Math.cos(theta);
        z = (R + tube * Math.cos(phi)) * Math.sin(theta);
        y = tube * Math.sin(phi) * 0.8;
      }
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    }
    return { pos, maxR: 7.8 };
  }

  function shapeTorusKnot() {
    const pos = new Float32Array(numParticles * 3);
    const p = 2, q = 3, scale = 2.45;
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      const t = (i / numParticles) * Math.PI * 2;
      const r = 2 + Math.cos(q * t);
      const jitter = 0.36;
      pos[k]     = r * Math.cos(p * t) * scale + (Math.random() - 0.5) * jitter;
      pos[k + 1] = Math.sin(q * t) * scale + (Math.random() - 0.5) * jitter;
      pos[k + 2] = r * Math.sin(p * t) * scale + (Math.random() - 0.5) * jitter;
    }
    return { pos, maxR: 7.4 };
  }

  function shapeGlobe() {
    const pos = new Float32Array(numParticles * 3);
    const R = 6.2;
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      const y = 1 - (i / (numParticles - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = i * 2.39996 + Math.random() * 0.06;
      const band = Math.random() < 0.12 ? 1.05 : 1.0;
      pos[k]     = Math.cos(theta) * radius * R * band;
      pos[k + 1] = y * R * band;
      pos[k + 2] = Math.sin(theta) * radius * R * band;
    }
    return { pos, maxR: R * 1.05 };
  }

  function shapeCore() {
    const pos = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      const r = (Math.random() < 0.8)
        ? Math.pow(Math.random(), 1.8) * 3.4
        : 4 + Math.pow(Math.random(), 0.5) * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[k]     = r * Math.sin(phi) * Math.cos(theta);
      pos[k + 1] = r * Math.cos(phi);
      pos[k + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return { pos, maxR: 12 };
  }

  const defs = [shapeGalaxy(), shapeOrbital(), shapeTorusKnot(), shapeGlobe(), shapeCore()];

  /* ── Per-shape color arrays from the spectral ramp ── */
  function colorsFor(def) {
    const out = new Float32Array(numParticles * 3);
    const p = def.pos;
    for (let i = 0; i < numParticles; i++) {
      const k = i * 3;
      const r = Math.sqrt(p[k] * p[k] + p[k + 1] * p[k + 1] + p[k + 2] * p[k + 2]);
      const t = Math.min(1, r / def.maxR);
      rampColor(t, tmpC);
      // brightness: hot near center, slight random sparkle everywhere
      const b = (1.25 - t * 0.55) * (0.75 + Math.random() * 0.45);
      out[k]     = Math.min(1, tmpC.r * b);
      out[k + 1] = Math.min(1, tmpC.g * b);
      out[k + 2] = Math.min(1, tmpC.b * b);
    }
    return out;
  }
  const shapeCols = defs.map(colorsFor);

  /* ── Buffers + morph state ── */
  const positions = new Float32Array(defs[0].pos);
  const colors = new Float32Array(shapeCols[0]);
  const fromPos = new Float32Array(defs[0].pos);
  const toPos = new Float32Array(defs[0].pos);
  const fromCol = new Float32Array(shapeCols[0]);
  const toCol = new Float32Array(shapeCols[0]);
  const seeds = new Float32Array(numParticles);
  for (let i = 0; i < numParticles; i++) seeds[i] = Math.random() * Math.PI * 2;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.13,
    map: glowTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ── Central glow — bright golden nucleus ── */
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffd98a, transparent: true,
    opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  coreGlow.scale.set(7, 7, 1);
  scene.add(coreGlow);
  const haloGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x2aa8ff, transparent: true,
    opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  haloGlow.scale.set(20, 20, 1);
  scene.add(haloGlow);
  // glow intensity per shape (galaxy & core bright, knot subtle)
  const glowLevels = [0.75, 0.35, 0.18, 0.25, 0.9];

  /* ── Distant starfield ── */
  const starCount = 1800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 60 + Math.random() * 90;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.18, color: 0x9db4e0, map: glowTex,
    transparent: true, opacity: 0.45, depthWrite: false,
    blending: THREE.AdditiveBlending
  })));

  /* ── Morph control ── */
  let currentShape = 0;
  let morphT = 1;
  const morphSpeed = 0.014;

  function setShape(idx) {
    idx = Math.max(0, Math.min(defs.length - 1, idx));
    if (idx === currentShape) return;
    fromPos.set(geometry.attributes.position.array);
    fromCol.set(geometry.attributes.color.array);
    toPos.set(defs[idx].pos);
    toCol.set(shapeCols[idx]);
    currentShape = idx;
    morphT = 0;
    document.dispatchEvent(new CustomEvent('shapechange', { detail: idx }));
  }
  window.__setFieldShape = setShape;

  /* ── Mouse parallax + scroll rotation ── */
  let mouseX = 0, mouseY = 0, easeX = 0, easeY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  let scrollRot = 0;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollRot = max > 0 ? (window.scrollY / max) * Math.PI * 1.6 : 0;
  }, { passive: true });

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) animate();
  });

  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const posAttr = geometry.attributes.position;
    const colAttr = geometry.attributes.color;
    const arr = posAttr.array;
    const carr = colAttr.array;

    if (morphT < 1) {
      morphT = Math.min(1, morphT + morphSpeed);
      const e = easeInOut(morphT);
      for (let i = 0; i < numParticles * 3; i++) {
        arr[i] = fromPos[i] + (toPos[i] - fromPos[i]) * e;
        carr[i] = fromCol[i] + (toCol[i] - fromCol[i]) * e;
      }
      colAttr.needsUpdate = true;
    } else {
      const base = defs[currentShape].pos;
      for (let i = 0; i < numParticles; i++) {
        const k = i * 3;
        const s = seeds[i];
        const breathe = Math.sin(elapsed * 0.7 + s) * 0.04;
        arr[k]     = base[k] * (1 + breathe * 0.4);
        arr[k + 1] = base[k + 1] + Math.sin(elapsed * 0.9 + s * 1.7) * 0.05;
        arr[k + 2] = base[k + 2] * (1 + breathe * 0.4);
      }
    }
    posAttr.needsUpdate = true;

    // glow nucleus breathes; intensity tracks current shape
    const gl = glowLevels[currentShape];
    coreGlow.material.opacity = gl * (0.85 + Math.sin(elapsed * 1.4) * 0.12);
    haloGlow.material.opacity = gl * 0.3;

    // shape-specific spin rates; galaxy tilted slightly for depth
    const spinRates = [0.06, 0.12, 0.16, 0.07, 0.1];
    points.rotation.y = elapsed * spinRates[currentShape] + scrollRot * 0.5;
    points.rotation.x = (currentShape === 0 ? 0.12 : 0) + Math.sin(elapsed * 0.1) * 0.05;
    points.rotation.z = currentShape === 0 ? 0.1 : 0;

    // eased camera parallax around the elevated base position
    easeX += ((mouseX * 2.4) - easeX) * 0.04;
    easeY += ((mouseY * 1.6) - easeY) * 0.04;
    camera.position.x = camBase.x + easeX;
    camera.position.y = camBase.y - easeY;
    camera.position.z = camBase.z;
    camera.lookAt(0, 0.5, 0);

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
