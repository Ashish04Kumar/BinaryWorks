"use client";
// Optional ambient sound for /lab, made live with the Web Audio API (no audio files): slow synth pads and a soft,
// echoing arpeggio over Am – F – C – G. No drums. Off until the visitor turns it on.
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const BPM = 76;
const STEP = 60 / BPM / 2; // eighth notes
const BARS = [
  [220.0, 261.63, 329.63], // Am
  [174.61, 220.0, 261.63], // F
  [261.63, 329.63, 392.0], // C
  [196.0, 246.94, 293.66], // G
];

function startAmbient() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 2.5); // slow fade in
  const delay = ctx.createDelay();
  delay.delayTime.value = STEP * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  delay.connect(feedback).connect(delay);
  delay.connect(master);
  master.connect(ctx.destination);

  const note = (freq: number, at: number, attack: number, len: number, type: OscillatorType, vol: number, cutoff: number, echo: boolean) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 8; // a little warmth
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(vol, at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(filter).connect(amp).connect(master);
    if (echo) amp.connect(delay);
    osc.start(at);
    osc.stop(at + len + 0.05);
  };

  let step = 0;
  let next = ctx.currentTime + 0.1;
  const timer = setInterval(() => {
    while (next < ctx.currentTime + 0.4) {
      const chord = BARS[Math.floor(step / 8) % BARS.length];
      const beat = step % 8;
      if (beat === 0) {
        chord.forEach((f) => note(f, next, 1.2, STEP * 8.5, "sawtooth", 0.03, 900, false)); // pad
        note(chord[0] / 2, next, 0.4, STEP * 8, "triangle", 0.08, 300, false); // low root
      }
      if (beat % 2 === 0) note(chord[[0, 1, 2, 1][(beat / 2) % 4]] * 2, next, 0.02, STEP * 1.6, "triangle", 0.05, 2400, true); // arpeggio
      step += 1;
      next += STEP;
    }
  }, 60);

  return () => {
    clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    setTimeout(() => ctx.close(), 700);
  };
}

const Synth = () => {
  const [on, setOn] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        if (on) {
          stopRef.current?.();
          stopRef.current = null;
        } else stopRef.current = startAmbient();
        setOn(!on);
      }}
      className={`l2-sound ${on ? "is-on" : ""}`}
    >
      {on ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      <span>ambient sound {on ? "on" : "off"}</span>
      <span className="l2-wave" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </button>
  );
};

export default Synth;
