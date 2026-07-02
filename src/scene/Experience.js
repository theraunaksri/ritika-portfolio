import * as THREE from 'three';

// One accent color, dark stage. Everything else is neutral so the glow reads as intentional.
const BG = 0x070b13;
const ACCENT = 0x53e6d0;
const NEUTRAL = 0x8b9bb4;
const EARTH = 0xc9a97a; // grounded tone for the Foundation chapter only

// Chapters are laid out in depth. The camera walks forward through them.
export const CHAPTER_Z = [0, -16, -30, -44, -58, -70];
const CAM_START = 7;
const CAM_END = CHAPTER_Z[5] + 7; // rests in front of the contact scene

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Soft round sprite so particles glow instead of rendering as hard squares.
let dotTexture;
function getDotTexture() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

function pointsMaterial(color, size, opacity = 1) {
  return new THREE.PointsMaterial({
    color,
    size,
    map: getDotTexture(),
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function lineMaterial(color, opacity) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// Random points on a sphere shell, linked to near neighbours — the recurring "system" motif.
function makeNetwork({ count, radius, linkDist, color, nodeSize = 0.09, lineOpacity = 0.28 }) {
  const group = new THREE.Group();
  const pts = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(radius * (0.55 + 0.45 * Math.random()));
    pts.push(v);
  }
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts);
  group.add(new THREE.Points(nodeGeo, pointsMaterial(color, nodeSize)));

  const linePos = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < linkDist) {
        linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  group.add(new THREE.LineSegments(lineGeo, lineMaterial(color, lineOpacity)));
  return group;
}

function makeStarfield() {
  const pts = [];
  for (let i = 0; i < 900; i++) {
    pts.push(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 36,
      CAM_END - 14 + Math.random() * (CAM_START - CAM_END + 26)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(geo, pointsMaterial(NEUTRAL, 0.055, 0.55));
}

// ---- Chapter scenes -------------------------------------------------------

function buildHero() {
  const g = new THREE.Group();
  g.position.set(0, 0, CHAPTER_Z[0]);
  const mesh = makeNetwork({ count: 46, radius: 2.3, linkDist: 1.7, color: ACCENT, lineOpacity: 0.22 });
  g.add(mesh);
  g.userData.mesh = mesh;

  const halo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.35, 1),
    new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true, transparent: true, opacity: 0.07 })
  );
  mesh.add(halo);
  return g;
}

// Wide screens get an x-offset so scenes sit beside their story card, not behind it.
const SIDE = window.innerWidth >= 1024 ? 1 : 0;

function buildFoundation() {
  const g = new THREE.Group();
  g.position.set(3.2 * SIDE, -0.6, CHAPTER_Z[1]); // card left → scene right

  const grid = new THREE.GridHelper(16, 22, EARTH, 0x2a3141);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.y = -1.6;
  g.add(grid);

  // Origin point: one simple, grounded form.
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshBasicMaterial({ color: EARTH, wireframe: true, transparent: true, opacity: 0.85 })
  );
  cube.position.set(0, -0.7, 0);
  g.add(cube);
  g.userData.cube = cube;

  const seed = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })
  );
  seed.position.set(0, -0.7, 0);
  g.add(seed);
  g.userData.seed = seed;
  return g;
}

function buildCraft() {
  const g = new THREE.Group();
  g.position.set(-3.4 * SIDE, 0, CHAPTER_Z[2]); // card right → scene left
  g.scale.setScalar(SIDE ? 0.8 : 1);

  // Two clusters (PhonePe, The Stare) reaching toward each other — collaboration.
  const a = makeNetwork({ count: 20, radius: 1.35, linkDist: 1.25, color: ACCENT, lineOpacity: 0.3 });
  a.position.set(-2.1, 0.4, 0);
  const b = makeNetwork({ count: 20, radius: 1.35, linkDist: 1.25, color: NEUTRAL, lineOpacity: 0.3 });
  b.position.set(2.1, -0.4, 0);
  g.add(a, b);

  const bridgeGeo = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
  g.add(new THREE.Line(bridgeGeo, lineMaterial(ACCENT, 0.35)));
  g.userData.clusters = [a, b];
  return g;
}

function buildTransformation() {
  const g = new THREE.Group();
  g.position.set(0, 0, CHAPTER_Z[3]);

  // A system coming into alignment: concentric rings of nodes around a core.
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 24),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.95 })
  );
  g.add(core);
  g.userData.core = core;

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 24),
    new THREE.MeshBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  glow.scale.setScalar(1.9);
  g.add(glow);
  g.userData.glow = glow;

  const rings = [];
  const ringRadii = [1.6, 2.7, 3.9, 5.2];
  ringRadii.forEach((r, ri) => {
    const ring = new THREE.Group();
    const n = 14 + ri * 10;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.55, (Math.random() - 0.5) * 0.4));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    ring.add(new THREE.Points(geo, pointsMaterial(ri % 2 ? NEUTRAL : ACCENT, 0.11)));

    const circGeo = new THREE.BufferGeometry().setFromPoints(
      new THREE.EllipseCurve(0, 0, r, r * 0.55).getPoints(80)
    );
    ring.add(new THREE.Line(circGeo, lineMaterial(ACCENT, 0.14)));

    ring.rotation.x = -0.5;
    ring.userData.speed = (ri % 2 ? -1 : 1) * (0.05 + ri * 0.02);
    rings.push(ring);
    g.add(ring);
  });
  g.userData.rings = rings;

  // Spokes from the core outward — value radiating to beneficiaries.
  const spokes = [];
  for (let i = 0; i < 22; i++) {
    const dir = new THREE.Vector3().randomDirection();
    dir.y *= 0.5;
    spokes.push(new THREE.Vector3(0, 0, 0), dir.multiplyScalar(5.6));
  }
  const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokes);
  const spokeLines = new THREE.LineSegments(spokeGeo, lineMaterial(ACCENT, 0.1));
  g.add(spokeLines);
  g.userData.spokes = spokeLines;
  return g;
}

function buildGrowth() {
  const g = new THREE.Group();
  g.position.set(2.6 * SIDE, 0, CHAPTER_Z[4]); // card left → path rises on the right

  // Milestones as waypoints along a rising path.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.4, -1.4, 2),
    new THREE.Vector3(-1.8, -0.5, 0.6),
    new THREE.Vector3(0.6, 0.2, -0.4),
    new THREE.Vector3(2.8, 1.0, -1.6),
    new THREE.Vector3(4.6, 1.9, -2.8),
  ]);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
  g.add(new THREE.Line(pathGeo, lineMaterial(ACCENT, 0.35)));

  const marks = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2),
      new THREE.MeshBasicMaterial({ color: i % 2 ? NEUTRAL : ACCENT, transparent: true, opacity: 0.9 })
    );
    m.position.copy(curve.getPoint(i / 5));
    m.userData.phase = i;
    marks.push(m);
    g.add(m);
  }
  g.userData.marks = marks;
  return g;
}

function buildContact() {
  const g = new THREE.Group();
  g.position.set(0, 0, CHAPTER_Z[5]);

  const pts = [];
  for (let i = 0; i < 260; i++) {
    pts.push((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const drift = new THREE.Points(geo, pointsMaterial(ACCENT, 0.06, 0.7));
  g.add(drift);
  g.userData.drift = drift;

  const ringGeo = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 2.6, 2.6).getPoints(90));
  const ring = new THREE.Line(ringGeo, lineMaterial(ACCENT, 0.25));
  g.add(ring);
  g.userData.ring = ring;
  return g;
}

// ---- Orchestration --------------------------------------------------------

export function createExperience(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.055);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 80);
  camera.position.set(0, 0, CAM_START);

  scene.add(makeStarfield());
  const chapters = [buildHero(), buildFoundation(), buildCraft(), buildTransformation(), buildGrowth(), buildContact()];
  chapters.forEach((c) => scene.add(c));

  let scrollTarget = 0; // 0..1 over the whole page
  let scrollSmooth = 0;
  const mouse = { x: 0, y: 0 };

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? window.scrollY / max : 0;
  };
  const onMouse = (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('resize', onResize);
  onResize();
  onScroll();

  // How close the camera is to a chapter, 1 at its focal point, 0 far away.
  const proximity = (i) => clamp01(1 - Math.abs(camera.position.z - (CHAPTER_Z[i] + 7)) / 13);

  const clock = new THREE.Clock();
  let raf;

  const tick = () => {
    const t = clock.getElapsedTime();
    scrollSmooth = lerp(scrollSmooth, scrollTarget, 0.06);

    // Camera: forward motion through the chapters + gentle mouse parallax.
    camera.position.z = lerp(CAM_START, CAM_END, scrollSmooth);
    camera.position.x = lerp(camera.position.x, mouse.x * 0.55, 0.04);
    camera.position.y = lerp(camera.position.y, -mouse.y * 0.35, 0.04);
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camera.position.z - 8);

    const [hero, foundation, craft, transform, growth, contact] = chapters;

    hero.userData.mesh.rotation.y = t * 0.08;
    hero.userData.mesh.rotation.x = Math.sin(t * 0.11) * 0.15;

    const pF = proximity(1);
    foundation.userData.cube.rotation.y = t * 0.15;
    foundation.userData.seed.rotation.y = t * 0.6;
    foundation.userData.seed.position.y = -0.7 + Math.sin(t * 0.9) * 0.12 + pF * 1.3;

    const pC = proximity(2);
    craft.userData.clusters.forEach((c, i) => {
      c.rotation.y = t * (i ? -0.14 : 0.14);
      c.position.x = (i ? 2.1 : -2.1) * (1.35 - pC * 0.35); // clusters draw together as you arrive
    });

    const pT = proximity(3);
    const tf = transform.userData;
    tf.rings.forEach((r, i) => {
      r.rotation.z = t * r.userData.speed;
      r.rotation.x = lerp(-0.5, -0.18, pT); // rings tilt into alignment
      const s = 0.55 + pT * 0.45;
      r.scale.setScalar(s);
      r.children[1].material.opacity = 0.05 + pT * 0.22;
    });
    const pulse = 1 + Math.sin(t * 1.6) * 0.05;
    tf.core.scale.setScalar(pulse * (0.7 + pT * 0.5));
    tf.glow.scale.setScalar(1.9 * pulse * (0.7 + pT * 0.6));
    tf.glow.material.opacity = 0.06 + pT * 0.16;
    tf.spokes.material.opacity = pT * 0.16;
    tf.spokes.rotation.y = t * 0.03;

    growth.userData.marks.forEach((m) => {
      m.rotation.y = t * 0.5 + m.userData.phase;
      m.position.y += Math.sin(t * 1.2 + m.userData.phase * 1.1) * 0.0012;
    });

    contact.userData.drift.rotation.y = t * 0.02;
    contact.userData.ring.rotation.z = t * 0.05;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('mousemove', onMouse);
    window.removeEventListener('resize', onResize);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    renderer.dispose();
  };
}
