'use strict';
/* ═══════════════════════════════════════════════════════════
   QUANTUM FIELD — Three.js morphing particle engine
   One fixed 3D scene behind the whole site.
   The particle cloud morphs between physics objects
   as you scroll: Galaxy → Orbital → Torus Knot → Globe → Core
═══════════════════════════════════════════════════════════ */

(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const numParticles = 22000;
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070f, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 16);

  /* ── Soft glow sprite texture (fake bloom via additive blending) ── */
  function makeGlowTexture() {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 64;
    const ctx = cnv.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cnv);
    return tex;
  }

  /* ── Shape generators — each returns Float32Array(numParticles*3) ── */
  function shapeGalaxy() {
    const arr = new Float32Array(numParticles * 3);
    const arms = 4;
    for (let i = 0; i < numParticles; i++) {
      const t = Math.random();
      const radius = Math.pow(t, 0.6) * 11;
      const armOffset = (i % arms) * (Math.PI * 2 / arms);
      const spin = radius * 0.42;
      const spread = (1 - t) * 0.9 + 0.12;
      const angle = armOffset + spin + (Math.random() - 0.5) * spread * 2.2;
      const wobble = (Math.random() - 0.5);
      arr[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * spread * 2;
      arr[i * 3 + 1] = wobble * (1.4 - t) * 1.1;
      arr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread * 2;
    }
    return arr;
  }

  function shapeOrbital() {
    // 3d_z2-like orbital: two lobes + torus ring — looks unmistakably "quantum"
    const arr = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      const pick = Math.random();
      let x, y, z;
      if (pick < 0.62) {
        // two teardrop lobes along Y
        const sign = Math.random() < 0.5 ? 1 : -1;
        const u = Math.random();
        const r = Math.pow(Math.random(), 0.5) * 3.2 * Math.sin(Math.PI * u);
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r * 0.75;
        z = Math.sin(theta) * r * 0.75;
        y = sign * (u * 7.2 + 0.6);
      } else {
        // equatorial torus
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const R = 5.4, tube = 0.85 * Math.pow(Math.random(), 0.5);
        x = (R + tube * Math.cos(phi)) * Math.cos(theta);
        z = (R + tube * Math.cos(phi)) * Math.sin(theta);
        y = tube * Math.sin(phi) * 0.8;
      }
      arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
    }
    return arr;
  }

  function shapeTorusKnot() {
    const arr = new Float32Array(numParticles * 3);
    const p = 2, q = 3, scale = 4.4;
    for (let i = 0; i < numParticles; i++) {
      const t = (i / numParticles) * Math.PI * 2;
      const r = 2 + Math.cos(q * t);
      const cx = r * Math.cos(p * t) * 1.0;
      const cy = Math.sin(q * t) * 1.0;
      const cz = r * Math.sin(p * t) * 1.0;
      const jitter = 0.34;
      arr[i * 3]     = cx * scale * 0.55 + (Math.random() - 0.5) * jitter;
      arr[i * 3 + 1] = cy * scale * 0.55 + (Math.random() - 0.5) * jitter;
      arr[i * 3 + 2] = cz * scale * 0.55 + (Math.random() - 0.5) * jitter;
    }
    return arr;
  }

  function shapeGlobe() {
    const arr = new Float32Array(numParticles * 3);
    const R = 6.4;
    for (let i = 0; i < numParticles; i++) {
      // Fibonacci-ish sphere with latitude bands emphasized
      const y = 1 - (i / (numParticles - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = i * 2.39996 + Math.random() * 0.06;
      const band = Math.random() < 0.12 ? 1.04 : 1.0; // sparse outer shell
      arr[i * 3]     = Math.cos(theta) * radius * R * band;
      arr[i * 3 + 1] = y * R * band;
      arr[i * 3 + 2] = Math.sin(theta) * radius * R * band;
    }
    return arr;
  }

  function shapeCore() {
    // dense pulsing core + sparse halo — for the contact section
    const arr = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      const r = (Math.random() < 0.8)
        ? Math.pow(Math.random(), 1.8) * 3.4
        : 4 + Math.pow(Math.random(), 0.5) * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }

  const shapes = [shapeGalaxy(), shapeOrbital(), shapeTorusKnot(), shapeGlobe(), shapeCore()];

  /* ── Geometry with morph state ── */
  const positions = new Float32Array(shapes[0]); // current
  const fromPos = new Float32Array(shapes[0]);
  const toPos = new Float32Array(shapes[0]);
  const colors = new Float32Array(numParticles * 3);
  const sizes = new Float32Array(numParticles);
  const seeds = new Float32Array(numParticles);

  // Spectrum palette: violet → cyan → gold
  const palette = [
    new THREE.Color(0xa78bff),
    new THREE.Color(0x34e0ff),
    new THREE.Color(0xffc94d),
    new THREE.Color(0xe9f2ff)
  ];
  for (let i = 0; i < numParticles; i++) {
    const c = palette[
      Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 2 : 3
    ];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    sizes[i] = Math.random() * 1.5 + 0.4;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.085,
    map: makeGlowTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ── Distant static starfield (second, cheaper layer) ── */
  const starCount = 1600;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 60 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.16, color: 0x8aa6d6, map: makeGlowTexture(),
    transparent: true, opacity: 0.5, depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  scene.add(new THREE.Points(starGeo, starMat));

  /* ── Morph control driven by scroll sections ── */
  let currentShape = 0;
  let morphT = 1;            // 1 = settled
  const morphSpeed = 0.016;

  function setShape(idx) {
    idx = Math.max(0, Math.min(shapes.length - 1, idx));
    if (idx === currentShape) return;
    // snapshot current animated positions as morph start
    fromPos.set(geometry.attributes.position.array);
    toPos.set(shapes[idx]);
    currentShape = idx;
    morphT = 0;
    document.dispatchEvent(new CustomEvent('shapechange', { detail: idx }));
  }
  window.__setFieldShape = setShape;

  /* ── Mouse parallax + scroll rotation ── */
  let mouseX = 0, mouseY = 0, targetRX = 0, targetRY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  let scrollRot = 0;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollRot = max > 0 ? (window.scrollY / max) * Math.PI * 2 : 0;
  }, { passive: true });

  /* ── Visibility pause ── */
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
    const arr = posAttr.array;

    if (morphT < 1) {
      morphT = Math.min(1, morphT + morphSpeed);
      const e = easeInOut(morphT);
      for (let i = 0; i < numParticles * 3; i++) {
        arr[i] = fromPos[i] + (toPos[i] - fromPos[i]) * e;
      }
    } else {
      // ambient breathing on the settled shape
      const base = shapes[currentShape];
      for (let i = 0; i < numParticles; i++) {
        const k = i * 3;
        const s = seeds[i];
        const breathe = Math.sin(elapsed * 0.7 + s) * 0.05;
        arr[k]     = base[k]     * (1 + breathe * 0.4);
        arr[k + 1] = base[k + 1] + Math.sin(elapsed * 0.9 + s * 1.7) * 0.06;
        arr[k + 2] = base[k + 2] * (1 + breathe * 0.4);
      }
    }
    posAttr.needsUpdate = true;

    // slow self-rotation, different per shape
    const spinRates = [0.05, 0.12, 0.18, 0.08, 0.1];
    points.rotation.y = elapsed * spinRates[currentShape] + scrollRot * 0.6;
    points.rotation.x = Math.sin(elapsed * 0.1) * 0.08;

    // camera parallax (eased)
    targetRX += ((mouseY * 2.2) - targetRX) * 0.04;
    targetRY += ((mouseX * 2.6) - targetRY) * 0.04;
    camera.position.x = targetRY;
    camera.position.y = -targetRX;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
