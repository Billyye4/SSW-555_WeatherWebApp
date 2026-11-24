import * as THREE from 'three';
import { SceneSettings } from './SceneSettings.js';

const MAX_CLOUDS = 16;
const MAX_RAIN = 1000;
const MAX_SNOW = 900;
const STAR_COUNT = 140;
const FOG_BANKS = 5;
const FADE_PER_SECOND = 0.9; // how quickly the layers fade toward a new forecast
const MIN_FLASH_GAP = 3.5;   // seconds between lightning strikes, so it never flashes rapidly
const FULL_AREA = 1200 * 320; // band size (px²) that gets the full number of clouds and particles

const CLOUD_TINT = {
  light: { day: 0xffffff, night: 0x9aa7bd },
  gray: { day: 0xc9d1db, night: 0x6c7788 },
  dark: { day: 0x6b7382, night: 0x464d5a },
};

// Animated weather in the band behind the current conditions (US-13): drifting clouds, rain, snow, fog banks,
// stars, a sun glow, and lightning. Drawn with Three.js on a transparent canvas over the theme's gradient.
// Creating one throws if WebGL isn't available, and the caller then keeps the plain gradient.
export class WeatherScene {
  #container;
  #renderer;
  #scene = new THREE.Scene();
  #camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  #w = 1;
  #h = 1;

  #target = SceneSettings.idle();
  #level = { clouds: 0, rain: 0, snow: 0, fog: 0, sun: 0, stars: 0 };
  #wind = 0.3;
  #tint = new THREE.Color(0xffffff);

  #clouds = [];
  #fogBanks = [];
  #rain;
  #snow;
  #stars;
  #sun;
  #flash;
  #nextFlash = 0;
  #flashStart = -1;

  #time = 0;
  #lastFrame = 0;
  #frame = 0;
  #onScreen = true;

  constructor(container) {
    this.#container = container;
    this.#renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.#renderer.setClearColor(0x000000, 0);

    const canvas = this.#renderer.domElement;
    canvas.className = 'band-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.prepend(canvas);

    this.#w = container.clientWidth || 1;
    this.#h = container.clientHeight || 1;
    this.#build();
    this.#resize();

    new ResizeObserver(() => this.#resize()).observe(container);
    new IntersectionObserver(([entry]) => {
      this.#onScreen = entry.isIntersecting;
      this.#start();
    }).observe(container);
    document.addEventListener('visibilitychange', () => this.#start());
    this.#start();
  }

  update(conditions) {
    this.#target = SceneSettings.for(conditions);
    this.#start();
  }

  // ---------- Building the layers ----------

  #build() {
    const cloudTextures = [0, 1, 2].map((i) => cloudTexture(i));
    const dot = dotTexture();

    for (let i = 0; i < MAX_CLOUDS; i++) {
      const depth = 0.45 + Math.random() * 0.55; // farther clouds are smaller, fainter, and slower
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: cloudTextures[i % cloudTextures.length], transparent: true, depthWrite: false, opacity: 0,
      }));
      sprite.userData = { depth, yFrac: 0.42 + Math.random() * 0.55, size: 0.9 + Math.random() * 0.9, speed: 18 + Math.random() * 14 };
      sprite.position.set(Math.random() * this.#w, 0, depth);
      this.#clouds.push(sprite);
      this.#scene.add(sprite);
    }

    for (let i = 0; i < FOG_BANKS; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: cloudTextures[i % cloudTextures.length], color: 0xdfe5ec, transparent: true, depthWrite: false, opacity: 0,
      }));
      sprite.userData = { yFrac: 0.06 + (i / FOG_BANKS) * 0.45, speed: 6 + Math.random() * 8 };
      sprite.position.set(Math.random() * this.#w, 0, 1.5);
      this.#fogBanks.push(sprite);
      this.#scene.add(sprite);
    }

    this.#rain = particles(MAX_RAIN, 2, this.#w, this.#h, (i, d) => {
      d.speed[i] = 700 + Math.random() * 450;
      d.len[i] = 14 + Math.random() * 14;
    });
    this.#rain.object = new THREE.LineSegments(this.#rain.geometry, new THREE.LineBasicMaterial({
      color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false,
    }));
    this.#rain.object.position.z = 2;
    this.#scene.add(this.#rain.object);

    this.#snow = particles(MAX_SNOW, 1, this.#w, this.#h, (i, d) => {
      d.speed[i] = 25 + Math.random() * 40;
      d.len[i] = Math.random() * Math.PI * 2; // sway phase
    });
    this.#snow.object = new THREE.Points(this.#snow.geometry, new THREE.PointsMaterial({
      map: dot, size: 5, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false,
    }));
    this.#snow.object.position.z = 2;
    this.#scene.add(this.#snow.object);

    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    this.#stars = {
      geometry,
      twinkle: Array.from({ length: STAR_COUNT }, () => [Math.random() * 6.3, 0.6 + Math.random() * 1.6]),
      spots: Array.from({ length: STAR_COUNT }, () => [Math.random(), 0.25 + Math.random() * 0.75]),
      object: new THREE.Points(geometry, new THREE.PointsMaterial({
        map: dot, size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })),
    };
    this.#stars.object.position.z = 0.2;
    this.#scene.add(this.#stars.object);

    this.#sun = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), transparent: true, opacity: 0, depthWrite: false,
    }));
    this.#sun.position.z = 0.1;
    this.#scene.add(this.#sun);

    this.#flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, depthWrite: false,
    }));
    this.#flash.position.z = 5;
    this.#scene.add(this.#flash);
  }

  #resize() {
    const w = this.#container.clientWidth;
    const h = this.#container.clientHeight;
    if (!w || !h) return;
    const [sx, sy] = [w / this.#w, h / this.#h];
    this.#w = w;
    this.#h = h;

    this.#renderer.setSize(w, h, false);
    Object.assign(this.#camera, { left: 0, right: w, top: h, bottom: 0 });
    this.#camera.updateProjectionMatrix();

    // Clouds are sized from the smaller of the band's height and width, so they never dwarf a phone screen.
    const cloudBase = Math.min(h * 1.6, w * 0.75);
    for (const c of this.#clouds) {
      c.position.x *= sx;
      const width = cloudBase * c.userData.size * c.userData.depth;
      c.scale.set(width, width * 0.5, 1);
    }
    for (const f of this.#fogBanks) {
      f.position.x *= sx;
      f.scale.set(w * 0.9, h * 0.4, 1);
    }
    for (const p of [this.#rain, this.#snow]) {
      for (let i = 0; i < p.count; i++) {
        p.x[i] *= sx;
        p.y[i] *= sy;
      }
    }
    const stars = this.#stars.geometry.attributes.position.array;
    this.#stars.spots.forEach(([fx, fy], i) => {
      stars[i * 3] = fx * w;
      stars[i * 3 + 1] = h * (1 - fy * 0.8);
    });
    this.#stars.geometry.attributes.position.needsUpdate = true;

    this.#sun.position.set(w * 0.86, h * 0.82, 0.1);
    this.#sun.scale.setScalar(Math.max(w * 0.5, h * 1.4));
    this.#flash.position.set(w / 2, h / 2, 5);
    this.#flash.scale.set(w, h, 1);
  }

  // ---------- Animation ----------

  #start() {
    if (this.#frame || !this.#onScreen || document.hidden) return;
    this.#lastFrame = performance.now();
    this.#frame = requestAnimationFrame((t) => this.#tick(t));
  }

  #tick(now) {
    this.#frame = 0;
    if (!this.#onScreen || document.hidden) return; // paused; #start resumes it
    const dt = Math.min((now - this.#lastFrame) / 1000, 0.05);
    this.#lastFrame = now;
    this.#time += dt;
    this.#step(dt);
    this.#renderer.render(this.#scene, this.#camera);
    this.#frame = requestAnimationFrame((t) => this.#tick(t));
  }

  #step(dt) {
    const target = this.#target;
    const ease = Math.min(1, dt * FADE_PER_SECOND);
    for (const key of Object.keys(this.#level)) this.#level[key] += (target[key] - this.#level[key]) * ease;
    this.#wind += ((target.wind || 0.15) - this.#wind) * ease;

    this.#stepClouds(dt);
    this.#stepFog(dt);
    this.#stepRain(dt);
    this.#stepSnow(dt);
    this.#stepStars();
    this.#stepSun();
    this.#stepLightning();
  }

  #stepClouds(dt) {
    const { clouds } = this.#level;
    this.#tint.set(CLOUD_TINT[this.#target.cloudShade][this.#target.night ? 'night' : 'day']);
    const shown = clouds * MAX_CLOUDS * this.#density(0.4);
    this.#clouds.forEach((c, i) => {
      const { depth, yFrac, speed } = c.userData;
      const width = c.scale.x;
      c.position.x += this.#wind * speed * (0.4 + depth) * dt;
      if (c.position.x > this.#w + width / 2) c.position.x = -width / 2;
      if (c.position.x < -width / 2) c.position.x = this.#w + width / 2;
      c.position.y = this.#h * yFrac;
      c.material.color.lerp(this.#tint, Math.min(1, dt * 2));
      // Clouds join one at a time as cover grows, so heavier cover fills the band gradually.
      c.material.opacity = Math.max(0, Math.min(1, shown - i)) * (0.16 + depth * 0.24);
    });
  }

  #stepFog(dt) {
    for (const f of this.#fogBanks) {
      f.position.x += (this.#wind >= 0 ? 1 : -1) * f.userData.speed * dt;
      if (f.position.x > this.#w * 1.45) f.position.x = -this.#w * 0.45;
      if (f.position.x < -this.#w * 0.45) f.position.x = this.#w * 1.45;
      f.position.y = this.#h * f.userData.yFrac;
      f.material.opacity = this.#level.fog * 0.26;
    }
  }

  #stepRain(dt) {
    const p = this.#rain;
    const count = Math.round(this.#level.rain * MAX_RAIN * this.#density(0.3));
    const slant = this.#wind * 0.35;
    const pos = p.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p.y[i] -= p.speed[i] * dt;
      p.x[i] += slant * p.speed[i] * dt;
      if (p.y[i] < -p.len[i]) this.#respawn(p, i, slant);
      const j = i * 6;
      pos[j] = p.x[i];
      pos[j + 1] = p.y[i];
      pos[j + 3] = p.x[i] - slant * p.len[i];
      pos[j + 4] = p.y[i] + p.len[i];
    }
    p.geometry.setDrawRange(0, count * 2);
    p.geometry.attributes.position.needsUpdate = true;
    p.object.material.opacity = count ? 0.2 + this.#level.rain * 0.14 : 0;
  }

  #stepSnow(dt) {
    const p = this.#snow;
    const count = Math.round(this.#level.snow * MAX_SNOW * this.#density(0.3));
    const pos = p.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p.y[i] -= p.speed[i] * dt;
      p.x[i] += this.#wind * 30 * dt;
      if (p.y[i] < -6) this.#respawn(p, i, this.#wind * 0.3);
      if (p.x[i] < -10) p.x[i] += this.#w + 20;
      if (p.x[i] > this.#w + 10) p.x[i] -= this.#w + 20;
      pos[i * 3] = p.x[i] + Math.sin(this.#time * 1.1 + p.len[i]) * 12; // gentle sway
      pos[i * 3 + 1] = p.y[i];
    }
    p.geometry.setDrawRange(0, count);
    p.geometry.attributes.position.needsUpdate = true;
    p.object.material.opacity = count ? 0.85 : 0;
  }

  // How much of the full cloud and particle count fits this band, so smaller screens get the same density.
  #density(min) {
    return Math.max(min, Math.min(1, (this.#w * this.#h) / FULL_AREA));
  }

  // A particle that left the band starts again just above it, spread so wind-blown ones still cover the width.
  #respawn(p, i, slant) {
    p.y[i] = this.#h + Math.random() * this.#h * 0.25;
    p.x[i] = Math.random() * (this.#w + Math.abs(slant) * this.#h) - (slant > 0 ? slant * this.#h : 0);
  }

  #stepStars() {
    const colors = this.#stars.geometry.attributes.color.array;
    this.#stars.twinkle.forEach(([phase, rate], i) => {
      const glow = 0.55 + 0.45 * Math.sin(this.#time * rate + phase);
      colors[i * 3] = glow;
      colors[i * 3 + 1] = glow;
      colors[i * 3 + 2] = glow;
    });
    this.#stars.geometry.attributes.color.needsUpdate = true;
    this.#stars.object.material.opacity = this.#level.stars * 0.9;
  }

  #stepSun() {
    this.#sun.material.opacity = this.#level.sun * (0.8 + 0.06 * Math.sin(this.#time * 0.6));
  }

  // A quick double flash every few seconds during storms, never more than two in a second.
  #stepLightning() {
    const material = this.#flash.material;
    if (!this.#target.lightning) {
      material.opacity = 0;
      this.#flashStart = -1;
      return;
    }
    if (this.#flashStart < 0 && this.#time >= this.#nextFlash) this.#flashStart = this.#time;
    if (this.#flashStart < 0) return;
    const t = this.#time - this.#flashStart;
    material.opacity = t < 0.07 ? 0.32 : t < 0.14 ? 0.04 : t < 0.5 ? 0.22 * (1 - (t - 0.14) / 0.36) : 0;
    if (t >= 0.5) {
      this.#flashStart = -1;
      this.#nextFlash = this.#time + MIN_FLASH_GAP + Math.random() * 5;
    }
  }
}

// Per-particle state plus a position buffer with `verts` vertices per particle (2 for a rain streak, 1 for a flake).
// Particles start spread over the whole w × h band, so rain or snow fills it as soon as it appears.
function particles(max, verts, w, h, init) {
  const data = { x: new Float32Array(max), y: new Float32Array(max), speed: new Float32Array(max), len: new Float32Array(max), count: max };
  for (let i = 0; i < max; i++) {
    data.x[i] = Math.random() * w;
    data.y[i] = Math.random() * h;
    init(i, data);
  }
  data.geometry = new THREE.BufferGeometry();
  data.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(max * verts * 3), 3));
  data.geometry.setDrawRange(0, 0);
  return data;
}

// A soft cloud: overlapping white puffs on a transparent canvas. Each variant is laid out differently.
function cloudTexture(variant) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const puffs = [
    [[70, 78, 40], [112, 60, 50], [158, 66, 44], [196, 82, 34], [130, 88, 46]],
    [[60, 84, 34], [100, 66, 44], [146, 58, 52], [192, 76, 40], [124, 92, 40]],
    [[80, 80, 44], [128, 64, 54], [176, 78, 42], [104, 94, 36], [156, 96, 34]],
  ][variant];
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(canvas);
}

function dotTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return canvasTexture(canvas);
}

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,236,170,0.95)');
  g.addColorStop(0.12, 'rgba(255,222,140,0.7)');
  g.addColorStop(0.4, 'rgba(255,205,110,0.22)');
  g.addColorStop(1, 'rgba(255,195,100,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return canvasTexture(canvas);
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
