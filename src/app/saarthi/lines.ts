// What Saarthi says, ported from the app's lines.py (a subset, same words).
export type Lang = "hinglish" | "en";

export const LINES: Record<Lang, Record<string, string[]>> = {
  hinglish: {
    typing_fast: ["Bhai aag laga di keyboard pe 🔥", "Itni speed? Keyboard ko bhi chhutti de do!", "Flow state ON. Disturb nahi karunga 🤐", "Tak-tak-tak-tak... main thak gaya dekh ke 😅"],
    typing_slow: ["Soch soch ke likh rahe ho... 🤔", "Ek ek word, ekdum dhyaan se.", "Writer's block? Chai pi lo ☕"],
    scrolling: ["Scroll, scroll, scroll... kuch mila? 👀", "Ungli thak jayegi bhai!", "Bas 5 minute aur scroll, phir kaam? 😏"],
    watching: ["Tutorial time! Notes bhi bana lena 📝", "Main bhi dekh raha hoon, popcorn kahan hai? 🍿", "2x speed pe dekho, time bachao ⏩"],
    poked: ["Oye! 😣", "Aaah! Sir pe kyun? 🤕", "Kya hua? Bolo na 😅", "Ouch! Halke se yaar 😵"],
    giggle: ["Hehe gudgudi ho rahi hai 😂", "Hahaha bas karo! 🤣", "Hihihi 😆"],
    dizzy: ["Bas karo yaar, chakkar aa raha hai 😵‍💫", "Itna click? Main button nahi hoon 😤"],
    break_start: ["Main bhi chai pe ja raha hoon ☕ Thodi der baad milte hain!", "Break time! Aankhen band, kandhe dheele 😌"],
    break_nag: ["Oye, break pe ho na? Kaam baad me 😤", "Laptop chhodo, break chal raha hai ☕"],
    break_end: ["Break khatam! Fresh ho gaye? Chalo kaam pe 💪", "Wapas aa gaya! Chalo shuru karte hain 🚀"],
    lunch_start: ["Lunch time! 🍱 Main bhi khana kha raha hoon", "Khaana khao aaram se 🍛 Kaam baad me"],
    lunch_walk: ["Khaana ho gaya 😋 Ab thoda dheere dheere tahalte hain 🚶", "Pet bhar gaya! Chalo walk 🚶"],
    think: ["Hmm… dinner me kya banega? 🤔", "Woh bug kahan se aaya hoga… 🤔", "Chai ya coffee? Badi soch 🤔"],
    lunch_end: ["Lunch khatam! Energy full 💪 Chalo kaam pe", "Pet bhi khush, mann bhi khush 😄 Kaam shuru?"],
    breathe_offer: ["Chalo saath me saans lete hain 🧘"],
    breathe_in: ["Saans andar lo… {n}"],
    breathe_hold: ["Roko… {n}"],
    breathe_out: ["Dheere dheere bahar… {n}"],
    breathe_end: ["Shabash! Kaisa laga? 😌", "Badhiya! Mind fresh ho gaya na? ✨"],
    afk: ["Kahan gaye? Main yahin hoon... 🥱", "Hello? Koi hai?"],
    sleeping: ["Zzz... jab aao to jaga dena 😴"],
    waking: ["Aa gaye! Miss kiya 😄", "Oh! Main so gaya tha kya? 😳", "Welcome back boss!"],
    happy: ["Hehe 😄", "Haan bolo?", "Main yahin hoon!", "Kya scene hai?"],
    stretch: ["Bahut der se baithe ho. Utho, stretch karo! 🙆", "Paani piyo, aankhon ko aaram do 💧"],
    reminder: ["Yaad hai? {t} ⏰"],
    random: ["Bug nahi, feature hai. Yaad rakhna.", "Kya chal raha hai? Main bas yahin chill kar raha hoon.", "Ek break le lo, duniya nahi bhaagegi.", "Code compile ho gaya? Party! 🎉"],
    hello: ["Namaste! Main Saarthi 🙏 Type karo, scroll karo, ya mujhe poke karo!"],
  },
  en: {
    typing_fast: ["You're on fire! 🔥", "Keyboard's begging for mercy 😅", "Flow state. I'll stay quiet 🤐"],
    typing_slow: ["Thinking it through... 🤔", "Every word counts."],
    scrolling: ["Scroll, scroll, scroll... found it yet? 👀", "Just five more minutes? 😏"],
    watching: ["Tutorial time! Take notes 📝", "Got popcorn? 🍿"],
    poked: ["Ouch! 😣", "Hey! Not the head 🤕", "What's up? 😅"],
    giggle: ["Hehe, that tickles 😂", "Hahaha stop! 🤣"],
    dizzy: ["Stop, I'm getting dizzy 😵‍💫", "I'm not a button 😤"],
    break_start: ["I'm grabbing tea too ☕ See you soon!"],
    break_nag: ["Hey, you're on a break! 😤"],
    break_end: ["Break's over! Feeling fresh? Let's go 💪"],
    lunch_start: ["Lunch time! 🍱 I'm eating too"],
    lunch_walk: ["Done eating 😋 Let's take a slow walk 🚶"],
    think: ["Hmm… what's for dinner? 🤔", "Where did that bug come from… 🤔", "Tea or coffee? Big decision 🤔"],
    lunch_end: ["Lunch is over! Fully charged 💪"],
    breathe_offer: ["Let's breathe together 🧘"],
    breathe_in: ["Breathe in… {n}"],
    breathe_hold: ["Hold… {n}"],
    breathe_out: ["Slowly out… {n}"],
    breathe_end: ["Nice! Feel better? 😌"],
    afk: ["Where'd you go? 🥱", "Hello? Anyone there?"],
    sleeping: ["Zzz... wake me when you're back 😴"],
    waking: ["You're back! 😄", "Oh! Was I asleep? 😳"],
    happy: ["Hehe 😄", "Yes?", "I'm here!"],
    stretch: ["You've been sitting a while. Stretch! 🙆", "Drink some water 💧"],
    reminder: ["Reminder: {t} ⏰"],
    random: ["It's not a bug, it's a feature.", "Take a break, the world can wait.", "Just chilling here 😎"],
    hello: ["Hi! I'm Saarthi 👋 Type, scroll, or poke me!"],
  },
};

export function line(lang: Lang, key: string, vars: Record<string, string | number> = {}): string | null {
  const options = LINES[lang][key] ?? LINES.en[key];
  if (!options?.length) return null;
  let s = options[Math.floor(Math.random() * options.length)];
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
