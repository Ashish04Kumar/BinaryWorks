// Glitch's own mood, ported from glitch/mind/mood.py: a slow, lasting feeling (energy + happiness),
// not the mood of one reply. In the browser it is kept in localStorage instead of data/mood.json.

const DRIFT_PER_HOUR = 0.5;
const HAPPY_REST = 60;
const ALONE_LONELY = 3 * 3600;
const ALONE_BORED = 45 * 60;
const KEY = "glitch-mood";

export const REPLY_NUDGE: Record<string, [number, number]> = {
  happy: [3, 2], excited: [4, 5], playful: [4, 3], curious: [1, 3],
  surprised: [0, 4], concerned: [-3, 0], sad: [-5, -2],
};

// Head offset at rest (pan, tilt; + tilt = down)
export const POSE: Record<string, [number, number]> = {
  excited: [0, -6], cheerful: [0, -3], calm: [0, 0], curious: [6, -4],
  bored: [-12, 2], lonely: [0, 6], sleepy: [0, 14],
};

const restingEnergy = (hour: number) => (hour < 6 ? 15 : hour < 9 || hour >= 22 ? 40 : 65);
const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function nameFor(energy: number, happiness: number, aloneSeconds: number, hour: number): string {
  if (energy < 30 || (restingEnergy(hour) <= 15 && energy < 45)) return "sleepy";
  if (aloneSeconds >= ALONE_LONELY && happiness < 55) return "lonely";
  if (aloneSeconds >= ALONE_BORED && energy < 60) return "bored";
  if (energy >= 75 && happiness >= 70) return "excited";
  if (happiness >= 68) return "cheerful";
  if (energy >= 60) return "curious";
  return "calm";
}

export type Feeling = { energy: number; happiness: number; name: string };

export class MoodModel {
  energy: number;
  happiness = HAPPY_REST;
  lastContact = Date.now() / 1000;
  updated = Date.now() / 1000;

  constructor() {
    this.energy = restingEnergy(new Date().getHours());
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved) {
        this.energy = clamp(Number(saved.energy));
        this.happiness = clamp(Number(saved.happiness));
        this.lastContact = Number(saved.lastContact) || this.lastContact;
        this.updated = Number(saved.updated) || this.updated;
      }
    } catch {
      /* no storage: start fresh */
    }
  }

  private drift() {
    const now = Date.now() / 1000;
    const hours = Math.max(0, now - this.updated) / 3600;
    const keep = Math.pow(1 - DRIFT_PER_HOUR, hours);
    const rest = restingEnergy(new Date().getHours());
    this.energy = rest + (this.energy - rest) * keep;
    const happyRest = HAPPY_REST - (now - this.lastContact >= ALONE_LONELY ? 15 : 0);   // loneliness pulls it down slowly
    this.happiness = happyRest + (this.happiness - happyRest) * keep;
    this.updated = now;
  }

  feeling(): Feeling {
    this.drift();
    const name = nameFor(this.energy, this.happiness, Date.now() / 1000 - this.lastContact, new Date().getHours());
    return { energy: Math.round(this.energy), happiness: Math.round(this.happiness), name };
  }

  /** Someone spoke to Glitch: it perks up, more so after a long time alone. */
  talkedTo() {
    this.drift();
    const alone = Date.now() / 1000 - this.lastContact;
    const bonus = alone >= ALONE_LONELY ? 6 : 0;
    this.happiness = clamp(this.happiness + 4 + bonus);
    this.energy = clamp(this.energy + 5 + bonus);
    this.lastContact = Date.now() / 1000;
    this.save();
  }

  /** A finished reply's mood nudges the lasting feeling. */
  replied(expression: string) {
    const [happiness, energy] = REPLY_NUDGE[expression] || [0, 0];
    this.drift();
    this.happiness = clamp(this.happiness + happiness);
    this.energy = clamp(this.energy + energy);
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ energy: this.energy, happiness: this.happiness, lastContact: this.lastContact, updated: this.updated })
      );
    } catch {
      /* storage blocked: mood lasts for this visit only */
    }
  }
}
