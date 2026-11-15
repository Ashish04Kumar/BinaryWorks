// Glitch's body in 3D, built from code to real part sizes (1 unit = 1 cm):
// two MG996R servos on an aluminium pan-tilt bracket kit, a PCA9685 board, a Raspberry Pi,
// a Pi Camera v2 and a round display that shows Glitch's real face renderer (face.js).
// The head moves like a hobby servo: speed-capped, a little overshoot, and a faint hunt at rest.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type GestureStep = [pan: number, tilt: number, hold: number];

// MG996R: about 0.17 s / 60 degrees at 4.8 V
const MAX_SPEED = 340;           // degrees per second
const STIFFNESS = 520;           // spring toward the commanded angle
const DAMPING = 28;              // < 2*sqrt(STIFFNESS): a small overshoot, like a loaded servo
const PAN_LIMIT = 80;            // Glitch's limits: pan 10..170, tilt 20..160 (offsets from 90)
const TILT_LIMIT = 70;

// ---------- materials ----------
const mat = {
  alu: new THREE.MeshStandardMaterial({ color: 0xc9cdd3, metalness: 0.95, roughness: 0.3 }),
  aluDark: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.4 }),
  servo: new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.05, roughness: 0.55 }),
  spline: new THREE.MeshStandardMaterial({ color: 0xd8c27a, metalness: 0.8, roughness: 0.35 }),
  screw: new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 1, roughness: 0.25 }),
  base: new THREE.MeshStandardMaterial({ color: 0x15181d, metalness: 0.1, roughness: 0.28 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc7a03a, metalness: 1, roughness: 0.3 }),
  pcbGreen: new THREE.MeshStandardMaterial({ color: 0x1d6b3b, metalness: 0.1, roughness: 0.45 }),
  pcbBlue: new THREE.MeshStandardMaterial({ color: 0x1c4fa8, metalness: 0.1, roughness: 0.45 }),
  pcbBlack: new THREE.MeshStandardMaterial({ color: 0x0b0b0c, metalness: 0.1, roughness: 0.5 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.2, roughness: 0.6 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.2 }),
  header: new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.7 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8b04a, metalness: 1, roughness: 0.25 }),
  lens: new THREE.MeshPhysicalMaterial({ color: 0x05070a, metalness: 0.3, roughness: 0.05, clearcoat: 1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1 }),
  ribbon: new THREE.MeshStandardMaterial({ color: 0xe9e6dc, roughness: 0.6, side: THREE.DoubleSide }),
  wireBrown: new THREE.MeshStandardMaterial({ color: 0x5a3416, roughness: 0.5 }),
  wireRed: new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.5 }),
  wireOrange: new THREE.MeshStandardMaterial({ color: 0xe0861a, roughness: 0.5 }),
  jumper: [0x2563eb, 0x16a34a, 0xeab308, 0x9333ea, 0xdc2626].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })),
};

function labelTexture(lines: [string, number, string][], w = 256, h = 128, bg = "#151515") {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  for (const [text, y, font] of lines) {
    g.fillStyle = "#e8e8e8";
    g.font = font;
    g.textAlign = "center";
    g.fillText(text, w / 2, y);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const servoLabel = labelTexture([
  ["MG996R", 62, "bold 46px Arial"],
  ["HIGH TORQUE · METAL GEAR", 100, "17px Arial"],
]);

// ---------- helpers ----------
const box = (w: number, h: number, d: number, m: THREE.Material, r = 0) =>
  new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), m);
const cyl = (r: number, h: number, m: THREE.Material, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => {
  o.position.set(x, y, z);
  return o;
};
const tag = (o: THREE.Object3D, part: string) => {
  o.traverse((c) => (c.userData.part = part));
  return o;
};

function wire(points: THREE.Vector3[], m: THREE.Material, r = 0.07) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), m);
}

// Three-wire servo lead (brown, red, orange), side by side
function servoLead(points: THREE.Vector3[], side = new THREE.Vector3(0, 0, 1)) {
  const g = new THREE.Group();
  [mat.wireBrown, mat.wireRed, mat.wireOrange].forEach((m, i) => {
    const off = side.clone().multiplyScalar((i - 1) * 0.15);
    g.add(wire(points.map((p) => p.clone().add(off)), m));
  });
  return g;
}

// MG996R, upright: output shaft on top at the origin (x/z), body below
function mg996r() {
  const g = new THREE.Group();
  const W = 4.07, H = 4.29, D = 1.97, SHAFT = 1.03;   // shaft sits ~10 mm from one end
  const body = at(box(W, H, D, mat.servo, 0.08), -SHAFT, -H / 2, 0);
  g.add(body);
  // mounting flange with 4 holes worth of screws
  const flange = at(box(5.45, 0.25, D, mat.servo, 0.05), -SHAFT, -H + 2.95, 0);
  g.add(flange);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(cyl(0.17, 0.12, mat.screw, 12), -SHAFT + sx * 2.45, -H + 3.12, sz * 0.5));
  // label on both wide faces
  const label = new THREE.MeshStandardMaterial({ map: servoLabel, roughness: 0.6 });
  for (const sz of [1, -1]) {
    const p = at(new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.65), label), -SHAFT, -H / 2 - 0.35, sz * (D / 2 + 0.005));
    if (sz < 0) p.rotation.y = Math.PI;
    g.add(p);
  }
  // raised boss, output hub and spline
  g.add(at(cyl(0.95, 0.28, mat.servo), 0, 0.12, 0));
  g.add(at(cyl(0.6, 0.3, mat.servo), -1.35, 0.1, 0));
  g.add(at(cyl(0.32, 0.4, mat.spline, 24), 0, 0.42, 0));
  return g;
}

// Round display module: black PCB, panel, the face, cover glass
function roundDisplay(face: THREE.Texture) {
  const g = new THREE.Group();
  const pcb = cyl(4.1, 0.16, mat.pcbBlack, 64);
  pcb.rotation.x = Math.PI / 2;
  g.add(at(pcb, 0, 0, -0.25));
  const panel = cyl(3.75, 0.42, mat.chip, 64);
  panel.rotation.x = Math.PI / 2;
  g.add(at(panel, 0, 0, 0.05));
  const screen = new THREE.Mesh(new THREE.CircleGeometry(3.45, 96), new THREE.MeshBasicMaterial({ map: face, toneMapped: false }));
  g.add(at(screen, 0, 0, 0.27));
  const glass = cyl(3.6, 0.06, mat.glass, 64);
  glass.rotation.x = Math.PI / 2;
  g.add(at(glass, 0, 0, 0.3));
  // FPC connector tab at the bottom of the PCB
  g.add(at(box(1.6, 0.6, 0.12, mat.gold), 0, -4.15, -0.25));
  return g;
}

function piCamera() {
  const g = new THREE.Group();
  g.add(box(2.5, 2.4, 0.1, mat.pcbGreen));
  g.add(at(box(0.85, 0.85, 0.42, mat.chip, 0.04), 0, 0.15, 0.25));
  const lens = cyl(0.3, 0.2, mat.lens, 24);
  lens.rotation.x = Math.PI / 2;
  g.add(at(lens, 0, 0.15, 0.55));
  for (const [x, y] of [[-1.05, 1.0], [1.05, 1.0], [-1.05, -0.25], [1.05, -0.25]]) g.add(at(cyl(0.1, 0.11, mat.gold, 10), x, y, 0.02).rotateX(Math.PI / 2));
  g.add(at(box(2.1, 0.45, 0.25, mat.chip), 0, -1.0, -0.12));   // CSI connector
  return g;
}

function raspberryPi() {
  const g = new THREE.Group();
  g.add(box(8.5, 0.16, 5.6, mat.pcbGreen, 0.05));
  g.add(at(box(1.5, 0.14, 1.5, mat.silver), -0.6, 0.15, 0.3));       // SoC heat spreader
  g.add(at(box(1.1, 0.12, 1.3, mat.chip), 1.4, 0.14, 0.3));
  g.add(at(box(5.1, 0.85, 0.5, mat.header), -0.6, 0.5, -2.4));       // 40-pin GPIO header
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), mat.gold, 40);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) pins.setMatrixAt(i, m.makeTranslation(-3.0 + (i % 20) * 0.254, 1.15, -2.53 + Math.floor(i / 20) * 0.254));
  g.add(pins);
  g.add(at(box(2.1, 1.35, 1.6, mat.silver), 3.3, 0.75, 1.6));       // ethernet
  g.add(at(box(1.75, 1.6, 1.3, mat.silver), 3.5, 0.85, -0.3));      // USB stack
  g.add(at(box(1.75, 1.6, 1.3, mat.silver), 3.5, 0.85, -2.1));
  return g;
}

function pca9685() {
  const g = new THREE.Group();
  g.add(box(6.25, 0.16, 2.54, mat.pcbBlue, 0.04));
  g.add(at(box(0.8, 0.12, 0.8, mat.chip), 0.4, 0.14, -0.2));
  g.add(at(cyl(0.3, 0.7, mat.chip), -2.4, 0.43, -0.6));             // capacitor
  g.add(at(box(1.0, 0.8, 0.75, mat.pcbBlue), -2.55, 0.48, 0.65));   // power terminal
  // 16 three-pin servo headers along the front edge: black (GND), red (V+), yellow (PWM) pin tops
  g.add(at(box(4.2, 0.25, 0.75, mat.header), 0.9, 0.2, 0.75));
  const colors = [mat.header, mat.wireRed, new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 })];
  colors.forEach((c, row) => {
    const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.55, 0.07), mat.gold, 16);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 16; i++) pins.setMatrixAt(i, m.makeTranslation(-1.0 + i * 0.254, 0.45, 0.5 + row * 0.254));
    g.add(pins);
    g.add(at(box(4.1, 0.04, 0.12, c), 0.9, 0.34, 0.5 + row * 0.254));
  });
  return g;
}

// Aluminium "multi-function" servo bracket hugging an upright servo
function servoBracket() {
  const g = new THREE.Group();
  g.add(at(box(5.9, 0.2, 2.5, mat.alu, 0.03), -1.03, -4.4, 0));
  for (const sx of [-1, 1]) g.add(at(box(0.2, 1.7, 2.5, mat.alu, 0.03), -1.03 + sx * 2.85, -3.5, 0));
  for (const sx of [-1, 1]) g.add(at(box(0.9, 0.2, 2.5, mat.alu, 0.03), -1.03 + sx * 2.5, -2.65, 0));
  return g;
}

// The whole robot: base, boards, servos, bracket, head with display and camera.
// Returns the robot plus the two moving groups (pan turns around y, tilt around x).
export function buildGlitchBody(faceTex: THREE.Texture) {
  const robot = new THREE.Group();

  // base plate on brass standoffs
  robot.add(tag(at(box(20, 0.6, 14, mat.base, 0.25), 0, 0.9, 0), "Acrylic base plate"));
  for (const [x, z] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) robot.add(at(cyl(0.35, 0.6, mat.brass, 6), x, 0.3, z));

  const pi = tag(at(raspberryPi(), -4.6, 1.75, -2.6), "Raspberry Pi · runs Glitch (voice, vision, face)");
  for (const [x, z] of [[-4.1, -2.3], [4.1, -2.3], [-4.1, 2.3], [4.1, 2.3]]) pi.add(at(cyl(0.22, 0.45, mat.brass, 6), x, -0.3, z));
  robot.add(pi);
  const pca = tag(at(pca9685(), 5.6, 1.75, 3.6), "PCA9685 · 16-channel PWM servo driver (I²C, 50 Hz)");
  for (const [x, z] of [[-2.8, -1], [2.8, -1], [-2.8, 1], [2.8, 1]]) pca.add(at(cyl(0.2, 0.45, mat.brass, 6), x, -0.3, z));
  robot.add(pca);

  // pan servo, upright in its bracket; its output shaft is the pan axis (x = 0, z = 0)
  const PAN_TOP = 1.2 + 0.2 + 4.29 + 0.2;
  const panServo = tag(mg996r(), "MG996R · pan servo (channel 0)");
  panServo.position.set(0, PAN_TOP, 0);
  robot.add(panServo);
  robot.add(tag(at(servoBracket(), 0, PAN_TOP, 0), "Aluminium servo bracket"));

  // ----- pan group: everything that turns with the pan servo -----
  const pan = new THREE.Group();
  pan.position.set(0, PAN_TOP + 0.6, 0);
  robot.add(pan);

  const horn = tag(cyl(1.25, 0.28, mat.aluDark, 40), "Aluminium servo horn (25T)");
  pan.add(horn);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    pan.add(at(cyl(0.13, 0.1, mat.screw, 10), Math.cos(a) * 0.85, 0.18, Math.sin(a) * 0.85));
  }
  // long U-bracket: base plate + two arms rising to the tilt axis
  const ARM_X = 3.35, ARM_TOP = 7.2;
  const u = new THREE.Group();
  u.add(at(box(7.0, 0.22, 2.8, mat.alu, 0.04), 0, 0.25, 0));
  for (const sx of [-1, 1]) {
    u.add(at(box(0.22, ARM_TOP, 2.8, mat.alu, 0.04), sx * ARM_X, ARM_TOP / 2 + 0.25, 0));
    const cap = cyl(1.4, 0.22, mat.alu, 40);
    cap.rotation.z = Math.PI / 2;
    u.add(at(cap, sx * ARM_X, ARM_TOP + 0.25, 0));
  }
  pan.add(tag(u, "Long U-bracket (aluminium)"));

  // ----- tilt group: the tilt servo body, its bracket and the head all tilt together -----
  const tilt = new THREE.Group();
  tilt.position.set(0, ARM_TOP + 0.25, 0);
  pan.add(tilt);

  const tiltServo = tag(mg996r(), "MG996R · tilt servo (channel 1)");
  // lying on its side: the shaft points at the left arm (-x) and the body hangs below the axis
  tiltServo.rotation.z = Math.PI / 2;
  tiltServo.position.set(-(ARM_X - 0.75), 0, 0);
  tilt.add(tiltServo);
  const tiltHorn = cyl(1.2, 0.22, mat.aluDark, 40);
  tiltHorn.rotation.z = Math.PI / 2;
  tilt.add(tag(at(tiltHorn, -(ARM_X - 0.25), 0, 0), "Aluminium servo horn (25T)"));
  const idler = cyl(0.42, 1.6, mat.screw, 20);
  idler.rotation.z = Math.PI / 2;
  tilt.add(at(idler, ARM_X - 0.7, 0, 0));   // bearing pin on the other arm

  // bracket around the tilt servo, with a mounting plate on top
  const headPlateY = 1.25;
  const tb = new THREE.Group();
  for (const sz of [-1, 1]) tb.add(at(box(5.6, 4.2, 0.2, mat.alu, 0.03), -0.3, -1.0, sz * 1.15));
  tb.add(at(box(5.6, 0.2, 2.5, mat.alu, 0.03), -0.3, headPlateY, 0));
  tilt.add(tag(tb, "Multi-function servo bracket"));

  // display stand (L-bracket) and the round display, facing +z
  const head = new THREE.Group();
  head.position.set(0, headPlateY + 0.1, 0.4);
  tilt.add(head);
  head.add(tag(at(box(2.2, 3.2, 0.22, mat.alu, 0.03), 0, 1.6, -0.6), "Display mount"));
  const display = tag(at(roundDisplay(faceTex), 0, 4.7, 0), "Round display · Glitch's face (face.js)");
  head.add(display);
  const cam = tag(at(piCamera(), 0, 4.7 + 4.1 + 1.45, -0.15), "Pi Camera v2 · 62° × 48° view");
  head.add(cam);
  // camera ribbon: down the back of the display
  const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6.2), mat.ribbon);
  head.add(at(ribbon, 0, 7.3, -0.48));
  ribbon.rotation.y = Math.PI;
  // display jumpers to the back of the bracket
  mat.jumper.forEach((m, i) =>
    head.add(wire([new THREE.Vector3(-0.8 + i * 0.4, 0.6, -0.4), new THREE.Vector3(-0.8 + i * 0.4, -0.4, -1.0), new THREE.Vector3(-1 + i * 0.5, -1.8, -1.6)], m, 0.06))
  );

  // servo leads to the PCA9685 headers
  robot.add(
    servoLead(
      [new THREE.Vector3(-3.1, PAN_TOP - 3.6, 0.6), new THREE.Vector3(-1.5, 2.4, 3.2), new THREE.Vector3(2.0, 2.1, 4.3), new THREE.Vector3(3.2, 2.15, 4.4)],
      new THREE.Vector3(1, 0, 0)
    )
  );
  robot.add(
    servoLead(
      [new THREE.Vector3(-3.6, PAN_TOP + 3.0, -1.6), new THREE.Vector3(-4.0, PAN_TOP - 1.0, -1.8), new THREE.Vector3(-1.0, 2.6, 3.4), new THREE.Vector3(3.6, 2.15, 4.4)],
      new THREE.Vector3(1, 0, 0)
    )
  );
  // I²C + power jumpers from the Pi GPIO to the PCA9685
  mat.jumper.slice(0, 4).forEach((m, i) =>
    robot.add(wire([new THREE.Vector3(-6.4 + i * 0.26, 2.7, -5.0), new THREE.Vector3(-2.0, 4.0, -1.0 + i * 0.2), new THREE.Vector3(2.8, 2.6, 2.6 + i * 0.1)], m, 0.06))
  );

  robot.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  display.traverse((o) => (o.castShadow = false));

  return { robot, pan, tilt };
}

export function createGlitchScene(container: HTMLElement, faceCanvas: HTMLCanvasElement, onHover?: (part: string | null, x: number, y: number) => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
  // Zoomed out so the whole robot, base to camera, is in view
  camera.position.set(34, 30, 66);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 11.5, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;   // the scroll wheel scrolls the page, not the model
  controls.minDistance = 30;
  controls.maxDistance = 85;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.62;
  // On touch screens dragging would trap page scrolling, so the view stays fixed there
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  controls.enabled = finePointer;
  renderer.domElement.style.touchAction = finePointer ? "none" : "pan-y";

  // lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30343a, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(18, 40, 26);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -22;
  key.shadow.camera.right = 22;
  key.shadow.camera.top = 22;
  key.shadow.camera.bottom = -22;
  key.shadow.radius = 4;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ec5ff, 1.0);
  rim.position.set(-24, 18, -20);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const faceTex = new THREE.CanvasTexture(faceCanvas);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = 8;
  const { robot, pan, tilt } = buildGlitchBody(faceTex);
  scene.add(robot);

  // ---------- servo motion ----------
  const axis = (limit: number) => ({ angle: 0, vel: 0, target: 0, limit });
  const panAxis = axis(PAN_LIMIT);
  const tiltAxis = axis(TILT_LIMIT);
  let rest: [number, number] = [0, 0];
  let gesture: { steps: GestureStep[]; i: number; until: number } | null = null;
  let follow: [number, number] | null = null;
  let held: [number, number] = [0, 0];            // a servo keeps the last pose it was sent
  let cursorLook: [number, number] | null = null; // idle: glance toward the visitor's cursor

  const command = (p: number, t: number) => {
    panAxis.target = THREE.MathUtils.clamp(p, -PAN_LIMIT, PAN_LIMIT);
    tiltAxis.target = THREE.MathUtils.clamp(t, -TILT_LIMIT, TILT_LIMIT);
  };

  const stepAxis = (a: ReturnType<typeof axis>, dt: number) => {
    const acc = STIFFNESS * (a.target - a.angle) - DAMPING * a.vel;
    a.vel = THREE.MathUtils.clamp(a.vel + acc * dt, -MAX_SPEED, MAX_SPEED);
    a.angle += a.vel * dt;
    // holding position: the faint hunt of a hobby servo around its set point
    if (Math.abs(a.target - a.angle) < 0.4 && Math.abs(a.vel) < 3) a.angle += (Math.random() - 0.5) * 0.06;
  };

  const updateCommands = (now: number) => {
    if (follow) return command(follow[0], follow[1]);
    if (gesture) {
      if (now >= gesture.until) {
        gesture.i += 1;
        if (gesture.i >= gesture.steps.length) {
          const last = gesture.steps[gesture.steps.length - 1];
          held = [last[0], last[1]];
          gesture = null;
        } else gesture.until = now + gesture.steps[gesture.i][2] * 1000 + 180;
      }
      if (gesture) {
        const [p, t] = gesture.steps[gesture.i];
        return command(rest[0] + p, rest[1] + t);
      }
    }
    if (cursorLook && held[0] === 0 && held[1] === 0) return command(rest[0] + cursorLook[0], rest[1] + cursorLook[1]);
    command(rest[0] + held[0], rest[1] + held[1]);
  };

  // ---------- hover labels ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoverPart: string | null = null;
  const onMove = (e: PointerEvent) => {
    if (!onHover) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(robot, true).find((h) => h.object.userData.part);
    hoverPart = hit ? hit.object.userData.part : null;
    onHover(hoverPart, e.clientX - r.left, e.clientY - r.top);
  };
  const onLeave = () => onHover?.(null, 0, 0);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);

  // ---------- loop ----------
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / Math.max(1, h);
    // narrow screens: step back so the whole robot fits
    camera.fov = w < 520 ? 34 : 28;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let last = performance.now();
  let raf = 0;
  let visible = true;
  let paused = false;
  // If the browser drops this WebGL context (GPU pressure), tell the owner so it can rebuild the scene
  let onLost: (() => void) | null = null;
  const handleLost = (e: Event) => {
    e.preventDefault();
    onLost?.();
  };
  renderer.domElement.addEventListener("webglcontextlost", handleLost);
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(container);

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (!visible || paused) return;
    updateCommands(now);
    // integrate in small steps so the spring stays stable
    for (let i = 0; i < 4; i++) {
      stepAxis(panAxis, dt / 4);
      stepAxis(tiltAxis, dt / 4);
    }
    // pan + = Glitch's right (the viewer's left); tilt + = down
    pan.rotation.y = THREE.MathUtils.degToRad(-panAxis.angle);
    tilt.rotation.x = THREE.MathUtils.degToRad(tiltAxis.angle);
    faceTex.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
  };
  frame();

  return {
    /** Resting pose from Glitch's lasting mood (mood.ts POSE). */
    setRest(p: number, t: number) {
      rest = [p, t];
    },
    /** A gesture from glitch/motion/gestures.py: (pan, tilt, hold seconds) offsets from rest. */
    play(steps: GestureStep[]) {
      if (follow) return;
      gesture = { steps, i: 0, until: performance.now() + steps[0][2] * 1000 + 180 };
    },
    /** Idle glance toward the cursor (pan, tilt offsets), or null. Gestures and held poses win. */
    lookAt(target: [number, number] | null) {
      cursorLook = target;
    },
    /** Follow mode: absolute offsets from straight ahead, or null to stop. */
    follow(target: [number, number] | null) {
      follow = target;
    },
    angles: () => ({ pan: 90 + panAxis.angle, tilt: 90 + tiltAxis.angle }),
    /** Stop drawing (face-only view) without losing the servo state. */
    setPaused(p: boolean) {
      paused = p;
      last = performance.now();
    },
    onContextLost(cb: () => void) {
      onLost = cb;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("webglcontextlost", handleLost);
      controls.dispose();
      envTarget.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      faceTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();   // free the GPU context now instead of waiting for garbage collection
      renderer.domElement.remove();
    },
  };
}

export type GlitchScene = ReturnType<typeof createGlitchScene>;
