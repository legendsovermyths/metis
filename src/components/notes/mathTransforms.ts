const GREEK = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa",
  "lambda", "mu", "nu", "xi", "rho", "sigma", "tau", "phi", "chi", "psi", "omega", "pi",
];
const GREEK_CAP = ["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Phi", "Psi", "Omega"];
const WORD_OPS: [string, string][] = [
  ["sum", "\\sum"], ["prod", "\\prod"], ["int", "\\int"],
  ["infty", "\\infty"], ["inf", "\\infty"], ["sqrt", "\\sqrt"],
  ["times", "\\times"], ["cdot", "\\cdot"], ["pm", "\\pm"], ["approx", "\\approx"],
  ["leq", "\\le"], ["geq", "\\ge"], ["neq", "\\ne"],
  ["forall", "\\forall"], ["exists", "\\exists"], ["in", "\\in"], ["to", "\\to"],
];

const WORD_MAP = new Map<string, string>();
GREEK.forEach((g) => WORD_MAP.set(g, "\\" + g));
GREEK_CAP.forEach((g) => WORD_MAP.set(g, "\\" + g));
WORD_OPS.forEach(([k, v]) => WORD_MAP.set(k, v));

const SYMBOL_OPS: [RegExp, string][] = [
  [/<=>/g, "\\Leftrightarrow"],
  [/<->/g, "\\leftrightarrow"],
  [/<=/g, "\\le"],
  [/>=/g, "\\ge"],
  [/!=/g, "\\ne"],
  [/~=/g, "\\approx"],
  [/=>/g, "\\Rightarrow"],
  [/->/g, "\\to"],
  [/\+-/g, "\\pm"],
];

/** Deterministic ASCII → LaTeX. Idempotent (won't re-touch existing \commands). */
export function applyDeterministic(src: string): string {
  let s = src;
  for (const [re, rep] of SYMBOL_OPS) s = s.replace(re, rep);
  s = s.replace(/(?<!\\)\b[A-Za-z]+\b/g, (m) => WORD_MAP.get(m) ?? m);
  return s;
}

export interface MathSuggestion {
  label: string;
  apply: (src: string, caret: number) => { value: string; caret: number };
}

/** Ambiguous transforms — offered as a ghost, applied only on accept. */
export function detectSuggestion(src: string, caret: number): MathSuggestion | null {
  const before = src.slice(0, caret);

  const frac = before.match(/([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/);
  if (frac) {
    const [full, num, den] = frac;
    return {
      label: `${num}/${den} → fraction`,
      apply: (s, c) => {
        const start = c - full.length;
        const rep = `\\frac{${num}}{${den}}`;
        return { value: s.slice(0, start) + rep + s.slice(c), caret: start + rep.length };
      },
    };
  }

  const sub = before.match(/_([A-Za-z0-9]+[+\-][A-Za-z0-9]+)$/);
  if (sub) {
    const [full, inner] = sub;
    return {
      label: "group subscript",
      apply: (s, c) => {
        const start = c - full.length;
        const rep = `_{${inner}}`;
        return { value: s.slice(0, start) + rep + s.slice(c), caret: start + rep.length };
      },
    };
  }

  return null;
}
