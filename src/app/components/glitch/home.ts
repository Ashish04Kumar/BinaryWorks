// The demo smart home Glitch controls: a living room with a ceiling fan, a split AC, a wall TV and lamps.
// Models are CC-BY from Sketchfab (credits in GlitchDemo). Device state comes from the same World the chat edits,
// so when Glitch says "fan on", the blades here spin up.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Devices } from "./world";

export type HomeScene = { set: (d: Devices) => void; setPaused: (p: boolean) => void; dispose: () => void };

const BASE = "/models/home/";
const FAN_RPS = { off: 0, 1: 1.2, 2: 2.2, 3: 3.4 } as const; // turns per second at each speed

// Soft round glow, drawn once and reused for lamp bulbs and the AC's airflow
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.35)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowSprite(tex: THREE.Texture, color: number, size: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  s.scale.setScalar(size);
  return s;
}

/** Scale a loaded model to a target width (in metres) and sit its bottom/centre at the origin. */
function fit(obj: THREE.Object3D, width: number, axis: "x" | "y" = "x") {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  obj.scale.multiplyScalar(width / (axis === "x" ? Math.max(size.x, size.z) : size.y));
  box.setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  obj.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  const g = new THREE.Group();
  g.add(obj);
  return g;
}

export async function createHomeScene(host: HTMLElement, initial: Devices): Promise<HomeScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2.5)); // render above CSS size so edges and textures stay crisp
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.5;

  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 50);
  camera.position.set(2.0, 1.55, 2.35);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-0.7, 1.1, -0.9);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minAzimuthAngle = 0.15;
  controls.maxAzimuthAngle = 1.25;
  controls.minPolarAngle = 1.0;
  controls.maxPolarAngle = 1.5;
  controls.update();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8178, 1.2);
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(1, 3, 2);
  scene.add(hemi, sun);

  const loader = new GLTFLoader();
  const load = (f: string) => loader.loadAsync(BASE + f).then((g) => g.scene);
  const [room, ac, fan, lamp] = await Promise.all([load("room.glb"), load("ac.glb"), load("fan.glb"), load("lamp.glb")]);
  const tex = glowTexture();

  // Sharpest texture sampling the GPU allows: keeps the floor and walls crisp at glancing angles
  const aniso = renderer.capabilities.getMaxAnisotropy();
  for (const model of [room, ac, fan, lamp])
    model.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m) return;
      for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.emissiveMap, m.aoMap]) if (t) t.anisotropy = aniso;
    });

  // Room: its lighting is baked into the textures, so it is drawn unlit and "lights" just brightens it
  const baked: THREE.MeshBasicMaterial[] = [];
  let floorLampShade: THREE.Object3D | null = null;
  let tvMesh: THREE.Mesh | null = null;
  room.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const old = m.material as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshBasicMaterial({ map: old.map, color: 0xffffff, transparent: old.transparent, opacity: old.opacity, side: old.side, toneMapped: false });
    baked.push(mat);
    m.material = mat;
    if (m.name.startsWith("Lamp")) floorLampShade = m;
    if (m.name.startsWith("TV_")) tvMesh = m;
  });
  scene.add(room);

  // Floor lamp glow (top of the room's own lamp)
  const lampGlow = glowSprite(tex, 0xffd9a0, 1.4);
  if (floorLampShade) {
    const b = new THREE.Box3().setFromObject(floorLampShade);
    lampGlow.position.set((b.min.x + b.max.x) / 2, b.max.y - 0.15, (b.min.z + b.max.z) / 2);
  }
  scene.add(lampGlow);
  const warm = new THREE.PointLight(0xffc887, 0, 6, 1.6);
  warm.position.copy(lampGlow.position);
  scene.add(warm);

  // TV: a screen plane just in front of the room's TV, drawn from a canvas when it is on
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 256;
  screenCanvas.height = 144;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, opacity: 0, toneMapped: false }));
  if (tvMesh) {
    const b = new THREE.Box3().setFromObject(tvMesh);
    screen.scale.set((b.max.x - b.min.x) * 0.96, (b.max.y - b.min.y) * 0.92, 1);
    screen.position.set((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, b.max.z + 0.006);
  }
  scene.add(screen);
  const tvLight = new THREE.PointLight(0x6fb4ff, 0, 3.5, 2);
  tvLight.position.copy(screen.position).add(new THREE.Vector3(0, 0, 0.5));
  scene.add(tvLight);

  // Split AC high on the left wall, blowing into the room
  const acGroup = fit(ac, 0.9);
  acGroup.rotation.y = Math.PI / 2;
  acGroup.position.set(-2.55, 2.12, -0.6);
  scene.add(acGroup);
  const acDisplayCanvas = document.createElement("canvas");
  acDisplayCanvas.width = 128;
  acDisplayCanvas.height = 48;
  const acDisplayTex = new THREE.CanvasTexture(acDisplayCanvas);
  const acDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: acDisplayTex, transparent: true, opacity: 0, toneMapped: false }));
  acDisplay.rotation.y = Math.PI / 2;
  acDisplay.position.set(-2.55 + 0.17, 2.2, -0.6 + 0.2);
  scene.add(acDisplay);
  // Airflow: a few soft cool puffs that drift out of the vent and fade
  const puffs = Array.from({ length: 14 }, (_, i) => {
    const s = glowSprite(tex, 0x5ec8ff, 0.35);
    s.userData.t = i / 14;
    scene.add(s);
    return s;
  });

  // Ceiling fan in the middle of the room; only its blades turn
  const fanGroup = fit(fan, 1.25);
  const blades = fanGroup.getObjectByName("Fan-Blades") ?? fanGroup.getObjectByName("FanBlades");
  const spinner = new THREE.Group();
  if (blades) {
    fanGroup.updateMatrixWorld(true);
    const c = new THREE.Box3().setFromObject(blades).getCenter(new THREE.Vector3());
    spinner.position.copy(fanGroup.worldToLocal(c.clone()));
    fanGroup.add(spinner);
    spinner.attach(blades);
  }
  // hang it from the ceiling: find the ceiling straight above the coffee table
  const ray = new THREE.Raycaster(new THREE.Vector3(-0.3, 1.2, 0.2), new THREE.Vector3(0, 1, 0));
  room.updateMatrixWorld(true);
  const hit = ray.intersectObject(room, true)[0];
  const ceiling = hit ? hit.point.y : 2.7;
  const fanHeight = new THREE.Box3().setFromObject(fanGroup).getSize(new THREE.Vector3()).y;
  fanGroup.position.set(-0.3, ceiling - fanHeight, 0.2);
  scene.add(fanGroup);

  // Desk lamp on the TV stand
  const lampGroup = fit(lamp, 0.6, "y");
  lampGroup.position.set(1.3, 0.61, -2.3);
  lampGroup.rotation.y = -2.2;
  scene.add(lampGroup);
  const lampLightMats: THREE.MeshStandardMaterial[] = [];
  lampGroup.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && (m.material as THREE.Material).name === "Light") {
      m.material = (m.material as THREE.MeshStandardMaterial).clone();
      lampLightMats.push(m.material as THREE.MeshStandardMaterial);
    }
  });
  const deskGlow = glowSprite(tex, 0xffe2b0, 0.7);
  scene.add(deskGlow);
  lampGroup.updateMatrixWorld(true);
  if (lampLightMats.length) {
    const lightMesh = lampGroup.getObjectsByProperty("isMesh", true).find((o) => ((o as THREE.Mesh).material as THREE.Material).name === "Light");
    if (lightMesh) new THREE.Box3().setFromObject(lightMesh).getCenter(deskGlow.position);
  }

  // ---- state and animation ----
  let devices = initial;
  let light = initial.lights === "on" ? 1 : 0; // eased 0..1
  let tv = initial.tv === "on" ? 1 : 0;
  let acOn = initial.ac !== "off" ? 1 : 0;
  let fanSpeed: number = FAN_RPS[initial.fan];

  const drawAcDisplay = () => {
    const g = acDisplayCanvas.getContext("2d")!;
    g.clearRect(0, 0, 128, 48);
    g.fillStyle = "#7fe0ff";
    g.font = "bold 34px ui-monospace, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(devices.ac === "off" ? "" : `${devices.ac}°`, 64, 26);
    acDisplayTex.needsUpdate = true;
  };
  drawAcDisplay();

  const drawScreen = (t: number) => {
    const g = screenCanvas.getContext("2d")!;
    const w = 256, h = 144;
    const grad = g.createLinearGradient(0, 0, w, h);
    const hue = (t * 12) % 360;
    grad.addColorStop(0, `hsl(${hue + 200}, 60%, 22%)`);
    grad.addColorStop(1, `hsl(${hue + 250}, 55%, 12%)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      const x = ((t * (14 + i * 6) + i * 90) % (w + 120)) - 60;
      const r = g.createRadialGradient(x, 50 + i * 30, 0, x, 50 + i * 30, 70);
      r.addColorStop(0, `hsla(${hue + 180 + i * 40}, 80%, 60%, 0.35)`);
      r.addColorStop(1, "hsla(0,0%,0%,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, w, h);
    }
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.font = "600 13px system-ui, sans-serif";
    g.fillText("Glitch · Living room", 14, h - 16);
    screenTex.needsUpdate = true;
  };

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const clock = new THREE.Clock();
  let paused = false;
  let raf = 0;
  let lastScreen = 0;
  const night = new THREE.Color(0.3, 0.33, 0.45); // the room at dusk with the lights off
  const day = new THREE.Color(1, 0.98, 0.94);
  const tint = new THREE.Color();

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const ease = (cur: number, target: number, rate: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

    light = ease(light, devices.lights === "on" ? 1 : 0, 5);
    tv = ease(tv, devices.tv === "on" ? 1 : 0, 7);
    acOn = ease(acOn, devices.ac !== "off" ? 1 : 0, 3);
    fanSpeed = ease(fanSpeed, FAN_RPS[devices.fan], devices.fan === "off" ? 0.6 : 1.2); // spins down slowly

    tint.copy(night).lerp(day, light);
    tint.r += tv * 0.03 * (1 - light);
    tint.b += tv * 0.06 * (1 - light);
    for (const m of baked) m.color.copy(tint);
    hemi.intensity = 0.35 + light * 0.9;
    sun.intensity = 0.25 + light * 1.0;
    scene.environmentIntensity = 0.15 + light * 0.4;
    warm.intensity = light * 2.2;
    lampGlow.material.opacity = light * 0.9;
    deskGlow.material.opacity = light * 0.8;
    for (const m of lampLightMats) {
      m.emissive.setRGB(1, 0.85, 0.6);
      m.emissiveIntensity = light * 2.5;
    }

    screen.material.opacity = tv;
    tvLight.intensity = tv * (1.4 + Math.sin(t * 3) * 0.2);
    if (tv > 0.01 && t - lastScreen > 0.08) {
      drawScreen(t);
      lastScreen = t;
    }

    acDisplay.material.opacity = acOn;
    for (const p of puffs) {
      p.userData.t = (p.userData.t + dt * 0.35) % 1;
      const k = p.userData.t;
      const spread = Math.sin(k * 9 + p.id) * 0.25;
      p.position.set(-2.38 + k * 1.1, 1.98 - k * 0.8, -0.6 + spread);
      p.scale.setScalar(0.25 + k * 0.55);
      p.material.opacity = acOn * Math.sin(k * Math.PI) * 0.5;
    }

    spinner.rotation.y -= fanSpeed * Math.PI * 2 * dt;
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  return {
    set(d) {
      const acChanged = d.ac !== devices.ac;
      devices = d;
      if (acChanged) drawAcDisplay();
    },
    setPaused(p) {
      paused = p;
      if (!p) clock.getDelta();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
          mat.dispose();
        }
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
