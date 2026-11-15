// BM25 keyword search over pre-chunked text. Stands in for the vector store in the web demo.

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in is it its of on or that the this to was were will with which we our can not but if then than they their these those such also into how what when where who why does do did".split(
    " "
  )
);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

export type Doc = { id: number; page: number; text: string };

export function createIndex(docs: Doc[], { k1 = 1.5, b = 0.75 } = {}) {
  const tokens = docs.map((d) => tokenize(d.text));
  const avgLen = tokens.reduce((s, t) => s + t.length, 0) / Math.max(1, tokens.length);
  const df = new Map<string, number>();
  tokens.forEach((t) => new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const tf = tokens.map((t) => {
    const m = new Map<string, number>();
    t.forEach((w) => m.set(w, (m.get(w) || 0) + 1));
    return m;
  });
  const idf = (w: string) => {
    const n = df.get(w) || 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  return function search(query: string, k = 4): (Doc & { score: number })[] {
    const q = tokenize(query);
    return docs
      .map((doc, i) => {
        let score = 0;
        for (const w of q) {
          const f = tf[i].get(w) || 0;
          if (!f) continue;
          score += idf(w) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * tokens[i].length) / avgLen)));
        }
        return { ...doc, score };
      })
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  };
}
