export interface MathSymbol {
  name: string;
  /** Text inserted, replacing the typed word. */
  insert: string;
  /** Caret offset from insertion start (e.g. inside the first brace). Defaults to end. */
  caret?: number;
  /** LaTeX rendered as the menu glyph. */
  preview: string;
  keywords: string[];
}

const S = (
  name: string,
  insert: string,
  preview: string,
  keywords: string[],
  caret?: number,
): MathSymbol => ({ name, insert, preview, keywords, caret });

export const MATH_SYMBOLS: MathSymbol[] = [
  S("integral", "\\int", "\\int", ["int", "integral", "integrate"]),
  S("double integral", "\\iint", "\\iint", ["iint", "double", "integral"]),
  S("contour integral", "\\oint", "\\oint", ["oint", "contour", "integral"]),
  S("summation", "\\sum", "\\sum", ["sum", "summation", "sigma"]),
  S("product", "\\prod", "\\prod", ["prod", "product"]),
  S("limit", "\\lim", "\\lim", ["lim", "limit"]),
  S("fraction", "\\frac{}{}", "\\frac{a}{b}", ["frac", "fraction", "over", "divide"], 6),
  S("square root", "\\sqrt{}", "\\sqrt{x}", ["sqrt", "root", "radical"], 6),
  S("partial", "\\partial", "\\partial", ["partial", "del", "derivative"]),
  S("nabla", "\\nabla", "\\nabla", ["nabla", "grad", "gradient", "del"]),
  S("infinity", "\\infty", "\\infty", ["inf", "infty", "infinity"]),
  S("plus-minus", "\\pm", "\\pm", ["pm", "plusminus"]),
  S("times", "\\times", "\\times", ["times", "cross", "multiply"]),
  S("dot product", "\\cdot", "\\cdot", ["cdot", "dot", "multiply"]),
  S("divide", "\\div", "\\div", ["div", "divide"]),
  S("less or equal", "\\le", "\\le", ["leq", "le", "less"]),
  S("greater or equal", "\\ge", "\\ge", ["geq", "ge", "greater"]),
  S("not equal", "\\ne", "\\ne", ["neq", "ne", "notequal"]),
  S("approximately", "\\approx", "\\approx", ["approx", "approximately"]),
  S("equivalent", "\\equiv", "\\equiv", ["equiv", "equivalent", "congruent"]),
  S("proportional", "\\propto", "\\propto", ["propto", "proportional"]),
  S("element of", "\\in", "\\in", ["in", "element", "belongs"]),
  S("not in", "\\notin", "\\notin", ["notin", "not", "element"]),
  S("subset", "\\subseteq", "\\subseteq", ["subset", "subseteq"]),
  S("union", "\\cup", "\\cup", ["cup", "union"]),
  S("intersection", "\\cap", "\\cap", ["cap", "intersection", "intersect"]),
  S("empty set", "\\emptyset", "\\emptyset", ["emptyset", "empty", "null"]),
  S("for all", "\\forall", "\\forall", ["forall", "every", "all"]),
  S("there exists", "\\exists", "\\exists", ["exists", "some", "there"]),
  S("arrow", "\\to", "\\to", ["to", "arrow", "rightarrow", "maps"]),
  S("maps to", "\\mapsto", "\\mapsto", ["mapsto", "maps"]),
  S("implies", "\\Rightarrow", "\\Rightarrow", ["implies", "rightarrow", "then"]),
  S("iff", "\\Leftrightarrow", "\\Leftrightarrow", ["iff", "equivalent", "biconditional"]),
  S("vector", "\\vec{}", "\\vec{v}", ["vec", "vector", "arrow"], 5),
  S("hat", "\\hat{}", "\\hat{x}", ["hat", "unit"], 5),
  S("bar", "\\bar{}", "\\bar{x}", ["bar", "mean", "average"], 5),
  S("overline", "\\overline{}", "\\overline{x}", ["overline", "conjugate"], 10),
  S("binomial", "\\binom{}{}", "\\binom{n}{k}", ["binom", "choose", "combination"], 7),
  S("degree", "^\\circ", "90^\\circ", ["degree", "circ"]),
  S("angle", "\\angle", "\\angle", ["angle"]),
  S("perpendicular", "\\perp", "\\perp", ["perp", "perpendicular"]),
  S("parallel", "\\parallel", "\\parallel", ["parallel"]),
  S("congruent", "\\cong", "\\cong", ["cong", "congruent"]),
  S("similar", "\\sim", "\\sim", ["sim", "similar", "tilde"]),
  S("dots", "\\cdots", "\\cdots", ["cdots", "dots", "ellipsis"]),
  // Greek — lower
  ...(
    [
      "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa",
      "lambda", "mu", "nu", "xi", "pi", "rho", "sigma", "tau", "phi", "chi", "psi", "omega",
    ] as const
  ).map((g) => S(g, `\\${g}`, `\\${g}`, [g, "greek"])),
  // Greek — capital
  ...(["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Phi", "Psi", "Omega"] as const).map(
    (g) => S(g, `\\${g}`, `\\${g}`, [g.toLowerCase(), "greek", "capital"]),
  ),
];

export function filterMathSymbols(query: string): MathSymbol[] {
  const q = query.toLowerCase();
  if (!q) return [];
  const scored = MATH_SYMBOLS.map((s) => {
    const hay = [s.name, ...s.keywords];
    let score = -1;
    for (const h of hay) {
      if (h === q) score = Math.max(score, 3);
      else if (h.startsWith(q)) score = Math.max(score, 2);
      else if (h.includes(q)) score = Math.max(score, 1);
    }
    return { s, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.s.name.length - b.s.name.length);
  return scored.slice(0, 8).map((x) => x.s);
}
