// Glitch's face: two glowing eyes and an oscilloscope mouth, drawn from code on a 2D canvas.
// Ported from the Glitch project (glitch/dashboard/static/face.js). The only change: `size` renders into an
// offscreen square canvas (no container), which the portfolio uses as the texture of the 3D round display.
//
// No 3D engine, no image files, no internet: it runs on a small Pi screen and any shape of display.
// Black background on purpose: on an AMOLED screen black pixels are off, so only the face glows.
//
// What it shows, from Glitch's live events (feed()):
//   BrainState      idle | listening | thinking | speaking | error
//   Mood            the mood of a reply, for 8 s (longer while speaking)
//   VoiceLevel      0..1 loudness of Glitch's voice: the mouth becomes a waveform
//   FeelingChanged  Glitch's own lasting mood, shown when nothing else is going on
//
// Every look is a set of numbers (LOOKS). Each frame the face glides a little toward the current
// look's numbers, so changes are smooth. Blinks, eye movement and breathing are added on top.
//
// Depth: each eye is a glowing glass lens: shaded light to dark, a rim of light, a faint lens ring and
// bright core that follow the gaze more than the eye does, and a gloss highlight that moves the other
// way (parallax). Looking to one side, the far eye gets a little smaller, like a head turning.
// Two glows (a wide bloom and a tight one) and a faint light cast on the screen behind the face.
//
// Stability: eye movements are springs (smooth, no jumps); its signature glitch (colours split,
// slices shift) is rare and faint when idle, and strong only on an error.

const MOOD_SECONDS = 8;
const PERSPECTIVE = 0.8;   // how much the far eye shrinks when looking aside (higher = stronger 3D, less calm)

// Numbers are in "face units": 1 = the face's size (the short side of the screen, minus a margin)
const BASE = {
  eyeW: 0.23, eyeH: 0.34, radius: 0.09, gap: 0.34, eyeY: -0.07,
  lidTop: 0,        // 0 open .. 1 closed, from the top
  lidTilt: 0,       // + = outer corners down (sad), - = inner corners down (focused, cross)
  smile: 0,         // 0..1 a round cheek pushes the eye up from below (happy squint)
  scale: 1, leftScale: 1, rightScale: 1,
  wink: 0,          // 0..1 closes the right eye
  gazeX: 0, gazeY: 0,
  mouthW: 0.12, mouthCurve: 0, mouthOpen: 0, mouthY: 0.29,
  glow: 1,          // brightness
  motion: 1,        // how much it breathes and wanders
  dots: 0,          // thinking dots
  zzz: 0,           // sleepy z's
  glitch: 0,        // constant glitching (error)
};

const LOOKS = {
  idle: { color: "#5ce1ff" },
  calm: { color: "#5ce1ff", lidTop: 0.12, motion: 0.7 },
  listening: { color: "#7ee8ff", scale: 1.06, eyeH: 0.36, glow: 1.25, motion: 0.4 },
  thinking: { color: "#a88bff", gazeX: 0.05, gazeY: -0.06, lidTop: 0.18, lidTilt: -0.06, mouthW: 0.0, dots: 1, motion: 0.5 },
  speaking: { color: "#5ce1ff" },
  error: { color: "#ff4d5e", lidTop: 0.25, lidTilt: -0.15, mouthCurve: -0.3, glitch: 1, motion: 0.3 },
  happy: { color: "#ffd166", smile: 0.55, mouthCurve: 0.7, mouthW: 0.13 },
  cheerful: { color: "#ffe08a", smile: 0.3, mouthCurve: 0.45 },
  excited: { color: "#ff9f43", smile: 0.4, scale: 1.12, mouthCurve: 0.8, mouthOpen: 0.35, motion: 2.2 },
  playful: { color: "#7cffb2", wink: 1, smile: 0.35, mouthCurve: 0.55, gazeX: 0.02 },
  curious: { color: "#b49bff", leftScale: 0.9, rightScale: 1.15, gazeX: 0.035, gazeY: -0.02, mouthW: 0.05, mouthOpen: 0.18 },
  surprised: { color: "#ffffff", scale: 1.15, eyeH: 0.37, mouthW: 0.06, mouthOpen: 0.7, motion: 0.3 },
  concerned: { color: "#8fb8ff", lidTilt: 0.22, lidTop: 0.15, mouthCurve: -0.35, gazeY: 0.02 },
  sad: { color: "#5d8bff", lidTilt: 0.32, lidTop: 0.3, gazeY: 0.06, mouthCurve: -0.65, glow: 0.7, motion: 0.5 },
  sleepy: { color: "#3f8fa6", lidTop: 0.74, gazeY: 0.04, glow: 0.55, mouthW: 0.05, zzz: 1, motion: 0.35 },
  bored: { color: "#4fb8d6", lidTop: 0.45, gazeX: -0.07, gazeY: 0.01, mouthW: 0.08, glow: 0.8, motion: 0.4 },
  lonely: { color: "#6f9fe0", lidTop: 0.2, lidTilt: 0.2, gazeY: 0.07, mouthCurve: -0.3, glow: 0.75, motion: 0.5 },
};

// Glitch's own moods (FeelingChanged) and the look each one gets when nothing else is happening
const FEELING_LOOK = { excited: "excited", cheerful: "cheerful", calm: "calm", curious: "curious",
                       bored: "bored", lonely: "lonely", sleepy: "sleepy" };
const LABELS = { idle: "Here", listening: "Listening", thinking: "Thinking", speaking: "Speaking", error: "Something went wrong" };

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(rgb, amount, alpha = 1) {
  // amount > 0 mixes toward white, < 0 toward black
  const target = amount > 0 ? 255 : 0, k = Math.abs(amount);
  const [r, g, b] = rgb.map((v) => Math.round(v + (target - v) * k));
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createFace(container, { label = false, size = 0 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "width:100%;height:100%;display:block";
  if (container) container.append(canvas);
  const ctx = canvas.getContext("2d");
  const layer = document.createElement("canvas");      // the face, before glow and glitch
  const lctx = layer.getContext("2d");
  const tint = document.createElement("canvas");       // colour copies for the glitch split
  const tctx = tint.getContext("2d");
  let caption = null;
  if (label && container) {
    caption = document.createElement("div");
    caption.style.cssText = "position:absolute;left:0;right:0;bottom:4%;text-align:center;color:#6f6e68;font:14px system-ui,sans-serif;pointer-events:none";
    container.append(caption);
  }

  // --- what it should show ---
  const signals = { state: "idle", mood: null, moodUntil: 0, feeling: null, level: 0, held: null, pointer: null };
  // portfolio addition: how the face is painted (black screen, or floating on the page)
  const surface = { transparent: false, deepen: false };
  const now = () => performance.now() / 1000;

  function lookName() {
    if (signals.held) return signals.held;   // show(): one look, for previews and design
    const s = signals.state;
    if (s === "listening" || s === "thinking" || s === "error") return s;
    if (s === "speaking") signals.moodUntil = Math.max(signals.moodUntil, now() + 2);   // hold the mood while talking
    if (signals.mood && now() < signals.moodUntil) return signals.mood;
    if (s === "speaking") return "speaking";
    return FEELING_LOOK[signals.feeling] || "idle";
  }

  // --- the animated numbers ---
  const cur = { ...BASE, rgb: hexToRgb(LOOKS.idle.color) };
  const anim = {
    blink: 0, blinkStart: -1, nextBlink: now() + rand(2, 5), doubleBlink: false,
    wanderX: 0, wanderY: 0, wanderVX: 0, wanderVY: 0, wanderTX: 0, wanderTY: 0, nextWander: now() + 1,
    level: 0, wave: new Array(40).fill(0), phase: 0,
    glitchUntil: 0, glitchStrength: 0, nextGlitch: now() + rand(90, 200), lastLook: "idle",
  };

  function glitchFor(seconds, strength = 1) {
    anim.glitchUntil = Math.max(anim.glitchUntil, now() + seconds);
    anim.glitchStrength = strength;
  }

  // A critically damped spring: quick and smooth, never overshoots or jitters.
  // Integrated in small steps: one big step (a slow or busy frame, dt up to 0.1 s) made it overshoot more
  // every frame until the eyes flew off the screen (fixed in the portfolio port; the Pi build had the same risk).
  function spring(x, v, target, stiffness, dt) {
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    const damping = 2 * Math.sqrt(stiffness);
    for (let i = 0; i < steps; i++) {
      v += (stiffness * (target - x) - damping * v) * h;
      x += v * h;
    }
    return [x, v];
  }

  function step(dt, t) {
    const name = lookName();
    if (name !== anim.lastLook) {
      if (Math.random() < 0.12) glitchFor(0.07, 0.35);   // now and then, a faint flicker as the expression changes
      anim.lastLook = name;
      if (caption) caption.textContent = LABELS[signals.state] + (LOOKS[name] && !LABELS[name] ? " · " + name : "");
    }
    const target = { ...BASE, ...LOOKS[name] };
    const k = 1 - Math.exp(-dt * 9);
    for (const key of Object.keys(BASE)) cur[key] += (target[key] - cur[key]) * k;
    const rgb = hexToRgb(target.color);
    for (let i = 0; i < 3; i++) cur.rgb[i] += (rgb[i] - cur.rgb[i]) * (1 - Math.exp(-dt * 5));

    // blinks: every few seconds, sometimes twice; slower when sleepy, none when surprised
    if (t >= anim.nextBlink && name !== "surprised") {
      anim.blinkStart = t;
      anim.doubleBlink = Math.random() < 0.2;
      anim.nextBlink = t + rand(2.5, 6) * (name === "sleepy" ? 1.8 : 1);
    }
    const sinceBlink = t - anim.blinkStart;
    const blinkLen = name === "sleepy" ? 0.4 : 0.16;
    if (sinceBlink < blinkLen) anim.blink = Math.sin((sinceBlink / blinkLen) * Math.PI);
    else if (anim.doubleBlink && sinceBlink < blinkLen * 2.3 && sinceBlink > blinkLen * 1.3)
      anim.blink = Math.sin(((sinceBlink - blinkLen * 1.3) / blinkLen) * Math.PI);
    else anim.blink = 0;

    // portfolio addition: while idle, the eyes follow the visitor's cursor (lookAt) instead of wandering
    const idle = signals.state === "idle";
    if (signals.pointer && idle && now() < signals.pointer.until) {
      const m = Math.max(cur.motion, 0.5);
      anim.wanderTX = signals.pointer.x / m;
      anim.wanderTY = signals.pointer.y / m;
      anim.nextWander = t + 1.5;
    } else if (t >= anim.nextWander) {
      const reach = name === "listening" ? 0.008 : 0.04;
      anim.wanderTX = rand(-reach, reach);
      anim.wanderTY = rand(-reach * 0.6, reach * 0.6);
      anim.nextWander = t + rand(1.0, 3.5);
    }
    [anim.wanderX, anim.wanderVX] = spring(anim.wanderX, anim.wanderVX, anim.wanderTX, 160, dt);
    [anim.wanderY, anim.wanderVY] = spring(anim.wanderY, anim.wanderVY, anim.wanderTY, 160, dt);

    // voice: smoothed level and a scrolling waveform for the mouth
    anim.level += (signals.level - anim.level) * (1 - Math.exp(-dt * 18));
    anim.phase += dt * (8 + anim.level * 14);
    anim.wave.push(anim.level);
    anim.wave.shift();

    // the signature glitch: rare and faint when idle (every few minutes), strong only on an error
    if (t >= anim.nextGlitch) {
      if (name === "idle" || name === "calm" || name === "bored") glitchFor(rand(0.06, 0.12), 0.4);
      anim.nextGlitch = t + rand(90, 240);
    }
  }

  // --- drawing ---
  function drawEye(c, cx, cy, side, U, rgb, look) {
    // perspective: looking to one side, the far eye is a little smaller
    const s = cur.scale * (side < 0 ? cur.leftScale : cur.rightScale) * (1 - side * look.x * PERSPECTIVE);
    const w = cur.eyeW * U * s;
    const fullH = cur.eyeH * U * s;
    const closed = Math.max(anim.blink, side > 0 ? cur.wink : 0);
    const h = Math.max(fullH * (1 - closed * 0.12), U * 0.012);   // a blink is the lid coming down, mostly
    const x = cx - w / 2, y = cy - h / 2;
    const r = cur.radius * U * s;

    // Only the part below the (slanted) top lid and outside the happy cheek is drawn: one clip
    const lidY = y + Math.max(cur.lidTop, closed * 0.92) * h;
    const slope = Math.tan(cur.lidTilt * side);   // mirrored: the outer corner is on the outside of each eye
    const far = w * 3;
    c.save();
    c.beginPath();
    c.moveTo(cx - far, lidY - slope * far);
    c.lineTo(cx + far, lidY + slope * far);
    c.lineTo(cx + far, y + fullH * 4 + U);
    c.lineTo(cx - far, y + fullH * 4 + U);
    c.closePath();
    if (cur.smile > 0.01) {   // happy squint: a round cheek pushes up from below (cut out with even-odd)
      const ry = fullH * 0.75;
      c.ellipse(cx, y + h + ry - cur.smile * h * 0.9, w * 0.85, ry, 0, 0, Math.PI * 2);
    }
    c.clip("evenodd");

    // the body: lit from above, darker below
    const body = c.createLinearGradient(0, y, 0, y + h);
    body.addColorStop(0, shade(rgb, 0.45));
    body.addColorStop(0.45, shade(rgb, 0));
    body.addColorStop(1, shade(rgb, -0.5));
    c.fillStyle = body;
    roundRect(c, x, y, w, h, r);
    c.fill();

    // a lens inside: a faint ring and a bright core that follow the gaze more than the eye (parallax)
    const lx = cx + look.x * w * 3.2, ly = cy + look.y * h * 3.2;
    const ring = Math.min(w, fullH) * 0.32;
    const core = c.createRadialGradient(lx, ly, 0, lx, ly, ring);
    core.addColorStop(0, "rgba(255,255,255,0.55)");
    core.addColorStop(0.35, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)`);
    core.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = core;
    c.beginPath();
    c.arc(lx, ly, ring, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.16)";
    c.lineWidth = Math.max(1, U * 0.004);
    c.beginPath();
    c.arc(lx, ly, ring * 0.82, 0, Math.PI * 2);
    c.stroke();

    // a gloss highlight, up and to the left, moving slightly against the gaze
    const gx = x + w * 0.3 - look.x * w * 1.2, gy = y + Math.max(fullH * 0.18, lidY - y + fullH * 0.08) - look.y * h;
    const gloss = c.createRadialGradient(gx, gy, 0, gx, gy, w * 0.3);
    gloss.addColorStop(0, "rgba(255,255,255,0.75)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gloss;
    c.beginPath();
    c.ellipse(gx, gy, w * 0.26, fullH * 0.1, -0.45, 0, Math.PI * 2);
    c.fill();

    // a rim of light around the edge
    c.strokeStyle = shade(rgb, 0.6, 0.65);
    c.lineWidth = Math.max(1, U * 0.006);
    roundRect(c, x + c.lineWidth / 2, y + c.lineWidth / 2, w - c.lineWidth, h - c.lineWidth, r);
    c.stroke();
    c.restore();
  }

  function drawMouth(c, cx, cy, U, t) {
    const w = cur.mouthW * U;
    const line = Math.max(1.5, U * 0.018);
    c.lineWidth = line;
    c.lineCap = "round";
    c.lineJoin = "round";
    const talking = anim.level > 0.03;

    if (talking) {
      // oscilloscope: the voice as a moving waveform, wider when louder
      const width = Math.max(w, U * (0.12 + anim.level * 0.08));
      const n = anim.wave.length;
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const edge = Math.sin(u * Math.PI);   // pinned at both ends
        const amp = anim.wave[i] * U * 0.07 * edge;
        const y = cy + Math.sin(u * 9 + anim.phase) * amp + Math.sin(u * 23 - anim.phase * 1.7) * amp * 0.35;
        const x = cx - width / 2 + u * width;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      return;
    }
    if (cur.dots > 0.05) {
      // thinking: three dots taking turns
      for (let i = 0; i < 3; i++) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 5 - i * 0.9);
        c.globalAlpha = cur.dots * (0.35 + 0.65 * pulse);
        c.beginPath();
        c.arc(cx + (i - 1) * U * 0.05, cy - pulse * U * 0.01, U * 0.012, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      if (w < U * 0.01) return;
    }
    if (w < U * 0.01) return;
    const curve = cur.mouthCurve * U * 0.05;
    const open = cur.mouthOpen * U * 0.07;
    c.beginPath();
    c.moveTo(cx - w / 2, cy);
    c.quadraticCurveTo(cx, cy + curve * 2, cx + w / 2, cy);
    if (open > 0.5) {
      c.quadraticCurveTo(cx, cy + curve * 2 + open * 2, cx - w / 2, cy);
      c.fill();
    }
    c.stroke();
  }

  function drawZzz(c, cx, cy, U, t) {
    if (cur.zzz < 0.05) return;
    c.font = `600 ${Math.round(U * 0.07)}px ui-monospace, monospace`;
    for (let i = 0; i < 3; i++) {
      const life = (t * 0.35 + i / 3) % 1;   // each z rises and fades
      c.globalAlpha = cur.zzz * Math.sin(life * Math.PI) * 0.8;
      c.fillText("z", cx + U * (0.3 + life * 0.12), cy - U * (0.2 + life * 0.25));
    }
    c.globalAlpha = 1;
  }

  function render(t) {
    const W = canvas.width, H = canvas.height;
    const U = Math.min(W, H) * 0.9;
    const breathe = Math.sin(t * 1.6) * 0.006 * cur.motion + anim.level * 0.004 * Math.sin(t * 20);
    const cx = W / 2 + (cur.gazeX + anim.wanderX * cur.motion) * U;
    const cy = H / 2 + (cur.gazeY + anim.wanderY * cur.motion + breathe) * U;
    // portfolio addition: on a light page the face colours are deepened so pale looks stay visible
    const rgb = cur.rgb.map((c) => Math.round(surface.deepen ? c * 0.62 : c));
    const [r, g, b] = rgb;
    const color = `rgb(${r},${g},${b})`;
    // where the eyes look, about -1..1 x 0.08: drives the lens, the gloss and the perspective
    const look = { x: clamp(cur.gazeX + anim.wanderX * cur.motion, -0.08, 0.08), y: clamp(cur.gazeY + anim.wanderY * cur.motion, -0.08, 0.08) };

    // 1. the face on its own layer
    lctx.clearRect(0, 0, W, H);
    lctx.fillStyle = color;
    lctx.strokeStyle = color;
    const eyeY = cy + cur.eyeY * U;
    const gap = (cur.gap / 2) * U * (1 - Math.abs(look.x) * PERSPECTIVE * 0.8);   // turning: the eyes come a little closer
    drawEye(lctx, cx - gap, eyeY, -1, U, rgb, look);
    drawEye(lctx, cx + gap, eyeY, 1, U, rgb, look);
    lctx.fillStyle = color;
    lctx.strokeStyle = color;
    drawMouth(lctx, cx + (cur.gazeX * 0.4) * U, cy + cur.mouthY * U, U, t);
    drawZzz(lctx, cx, cy, U, t);

    // 2. onto the screen: black, a faint light cast behind the face, two glows, then the sharp face
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (surface.transparent) ctx.clearRect(0, 0, W, H);   // portfolio addition: face floats on the page
    else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }
    // the light cast on the screen belongs to the black display; on the page its square edge would show
    if (!surface.transparent) {
      const cast = ctx.createRadialGradient(cx, eyeY, 0, cx, eyeY, U * 0.75);
      cast.addColorStop(0, `rgba(${r},${g},${b},${0.13 * cur.glow})`);
      cast.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cast;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = clamp(0.38 * cur.glow, 0, 1);
    ctx.filter = `blur(${Math.round(U * 0.08)}px)`;    // wide bloom
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = clamp(0.5 * cur.glow, 0, 1);
    ctx.filter = `blur(${Math.round(U * 0.018)}px)`;   // tight glow
    ctx.drawImage(layer, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.drawImage(layer, 0, 0);

    // 3. scanlines: a faint screen texture over the bright parts
    ctx.fillStyle = scanlines(U);
    ctx.globalAlpha = 0.12;
    if (surface.transparent) ctx.globalCompositeOperation = "source-atop";   // only over the face, not the page
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // 4. the glitch: colour split and shifted slices (strong only on an error)
    if (cur.glitch > 0.3) glitch(W, H, U, 1);
    else if (t < anim.glitchUntil) glitch(W, H, U, anim.glitchStrength);
  }

  let scanPattern = null, scanFor = 0;
  function scanlines(U) {
    const gap = Math.max(3, Math.round(U * 0.012));
    if (!scanPattern || scanFor !== gap) {
      const p = document.createElement("canvas");
      p.width = 1; p.height = gap;
      const pc = p.getContext("2d");
      pc.fillStyle = "#000";
      pc.fillRect(0, 0, 1, Math.max(1, Math.round(gap / 3)));
      scanPattern = ctx.createPattern(p, "repeat");
      scanFor = gap;
    }
    return scanPattern;
  }

  function glitch(W, H, U, strength) {
    const shift = U * rand(0.006, 0.028) * strength;
    tint.width = W; tint.height = H;
    for (const [hue, dx] of [["#ff2a6d", -shift], ["#2af5ff", shift]]) {
      tctx.globalCompositeOperation = "source-over";
      tctx.clearRect(0, 0, W, H);
      tctx.drawImage(layer, 0, 0);
      tctx.globalCompositeOperation = "source-in";
      tctx.fillStyle = hue;
      tctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.6 * strength;
      ctx.drawImage(tint, dx, 0);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    for (let i = 0; i < Math.round(4 * strength); i++) {   // a few horizontal slices pushed sideways
      const y = rand(0, H), h = rand(H * 0.01, H * 0.05), dx = rand(-1, 1) * U * 0.05 * strength;
      ctx.drawImage(canvas, 0, y, W, h, dx, y, W, h);
    }
  }

  // --- size and loop ---
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(container.clientWidth * dpr));
    const h = Math.max(1, Math.round(container.clientHeight * dpr));
    for (const c of [canvas, layer]) { c.width = w; c.height = h; }
  }
  if (size) {
    for (const c of [canvas, layer]) { c.width = size; c.height = size; }
  } else {
    new ResizeObserver(resize).observe(container);
    resize();
  }

  let last = now();
  let stopped = false;
  function frame() {
    if (stopped) return;
    const t = now();
    const dt = Math.min(0.1, t - last);
    last = t;
    step(dt, t);
    render(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    canvas,
    stop() { stopped = true; },
    // portfolio addition: { transparent, deepen } — see `surface`
    setSurface(next) { Object.assign(surface, next); },
    // portfolio addition: gaze toward a point, x and y in -1..1 (0,0 = straight ahead); held for a few seconds
    lookAt(x, y) { signals.pointer = { x: clamp(x, -1, 1) * 0.075, y: clamp(y, -1, 1) * 0.06, until: now() + 4 }; },
    // Hand every live event from /api/events to the face
    feed(e) {
      switch (e.type) {
        case "BrainState":
          signals.state = e.state;
          if (e.state === "listening" || e.state === "thinking" || e.state === "error") signals.mood = null;
          if (e.state === "error") glitchFor(0.4, 1);
          break;
        case "Mood":
          signals.mood = LOOKS[e.expression] ? e.expression : null;
          signals.moodUntil = now() + MOOD_SECONDS;
          break;
        case "VoiceLevel": signals.level = clamp(Number(e.level) || 0, 0, 1); break;
        case "FeelingChanged": signals.feeling = e.name; break;
      }
    },
    start(status) {   // the current state from /api/status, before live events arrive
      signals.state = status.state || "idle";
      signals.feeling = status.feeling && status.feeling.name;
    },
    looks: Object.keys(LOOKS),
    show(name) { signals.held = LOOKS[name] ? name : null; },   // hold one look (null: back to live)
  };
}
