/**
 * A small, safe expression evaluator for the inline compute cell (`>>>`).
 * No `eval`: hand-written tokenizer + recursive-descent parser.
 *
 * Supports arithmetic (+ - * / % ^, unary -, factorial !), combinatorics
 * (nCr/nPr infix or C()/P() functions), comparisons, boolean logic
 * (and/or/not/xor — bitwise when both operands are integers), explicit
 * bitwise (& | ~ << >>), and base conversion (bin/hex/oct, 0b/0x/0o inputs).
 */

type Value = number | boolean | string;

interface Tok {
  type: string;
  value: string;
}

const KEYWORDS = new Set(["and", "or", "xor", "not", "ncr", "npr", "mod"]);

function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  const isDigit = (c: string) => c >= "0" && c <= "9";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(s[i + 1]))) {
      let j = i;
      if (c === "0" && (s[i + 1] === "x" || s[i + 1] === "X")) {
        j = i + 2;
        while (j < s.length && /[0-9a-fA-F]/.test(s[j])) j++;
      } else if (c === "0" && (s[i + 1] === "b" || s[i + 1] === "B")) {
        j = i + 2;
        while (j < s.length && /[01]/.test(s[j])) j++;
      } else if (c === "0" && (s[i + 1] === "o" || s[i + 1] === "O")) {
        j = i + 2;
        while (j < s.length && /[0-7]/.test(s[j])) j++;
      } else {
        while (j < s.length && (isDigit(s[j]) || s[j] === ".")) j++;
        if (s[j] === "e" || s[j] === "E") {
          j++;
          if (s[j] === "+" || s[j] === "-") j++;
          while (j < s.length && isDigit(s[j])) j++;
        }
      }
      toks.push({ type: "num", value: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z_0-9]/.test(s[j])) j++;
      const word = s.slice(i, j);
      const lw = word.toLowerCase();
      toks.push({ type: KEYWORDS.has(lw) ? lw : "ident", value: word });
      i = j;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (["<<", ">>", "<=", ">=", "==", "!="].includes(two)) {
      toks.push({ type: two, value: two });
      i += 2;
      continue;
    }
    if ("+-*/%^(),<>&|~!".includes(c)) {
      toks.push({ type: c, value: c });
      i++;
      continue;
    }
    throw new Error(`unexpected "${c}"`);
  }
  toks.push({ type: "eof", value: "" });
  return toks;
}

// ── Coercion helpers ──────────────────────────────────────────────────────────
function num(v: Value): number {
  if (typeof v === "number") return v;
  throw new Error("expected a number");
}
function toInt(v: Value): number {
  const n = num(v);
  const r = Math.round(n);
  if (Math.abs(n - r) > 1e-9) throw new Error("expected a whole number");
  return r;
}

function factorial(n: number): number {
  if (n < 0) throw new Error("factorial of a negative");
  if (n > 170) throw new Error("factorial too large");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}
function nCr(n: number, r: number): number {
  n = Math.round(n);
  r = Math.round(r);
  if (r < 0 || n < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let out = 1;
  for (let i = 1; i <= r; i++) out = (out * (n - r + i)) / i;
  return Math.round(out);
}
function nPr(n: number, r: number): number {
  n = Math.round(n);
  r = Math.round(r);
  if (r < 0 || n < 0 || r > n) return 0;
  let out = 1;
  for (let i = 0; i < r; i++) out *= n - i;
  return out;
}
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

function logicOrBit(op: string, a: Value, b: Value): Value {
  if (typeof a === "boolean" && typeof b === "boolean") {
    if (op === "and") return a && b;
    if (op === "or") return a || b;
    return a !== b; // xor
  }
  const x = toInt(a);
  const y = toInt(b);
  if (op === "and") return x & y;
  if (op === "or") return x | y;
  return x ^ y;
}
function bit(op: string, a: Value, b: Value): number {
  const x = toInt(a);
  const y = toInt(b);
  if (op === "&") return x & y;
  if (op === "|") return x | y;
  if (op === "<<") return x << y;
  return x >> y;
}
function compare(op: string, a: Value, b: Value): boolean {
  if (op === "==") return a === b;
  if (op === "!=") return a !== b;
  const x = num(a);
  const y = num(b);
  if (op === "<") return x < y;
  if (op === ">") return x > y;
  if (op === "<=") return x <= y;
  return x >= y;
}

function constant(name: string): Value {
  switch (name) {
    case "pi":
      return Math.PI;
    case "e":
      return Math.E;
    case "tau":
      return Math.PI * 2;
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`unknown "${name}"`);
  }
}

function applyFn(name: string, a: Value[]): Value {
  const n = (i: number) => num(a[i]);
  switch (name) {
    case "abs":
      return Math.abs(n(0));
    case "floor":
      return Math.floor(n(0));
    case "ceil":
      return Math.ceil(n(0));
    case "round":
      return Math.round(n(0));
    case "sqrt":
      return Math.sqrt(n(0));
    case "sign":
      return Math.sign(n(0));
    case "ln":
      return Math.log(n(0));
    case "log":
      return a.length > 1 ? Math.log(n(1)) / Math.log(n(0)) : Math.log10(n(0));
    case "log2":
      return Math.log2(n(0));
    case "min":
      return Math.min(...a.map(num));
    case "max":
      return Math.max(...a.map(num));
    case "pow":
      return Math.pow(n(0), n(1));
    case "gcd":
      return gcd(n(0), n(1));
    case "lcm":
      return Math.abs(toInt(a[0]) * toInt(a[1])) / (gcd(n(0), n(1)) || 1);
    case "fact":
    case "factorial":
      return factorial(toInt(a[0]));
    case "c":
    case "choose":
    case "ncr":
      return nCr(n(0), n(1));
    case "p":
    case "perm":
    case "npr":
      return nPr(n(0), n(1));
    case "bin":
      return (toInt(a[0]) < 0 ? "-0b" : "0b") + Math.abs(toInt(a[0])).toString(2);
    case "hex":
      return (toInt(a[0]) < 0 ? "-0x" : "0x") + Math.abs(toInt(a[0])).toString(16);
    case "oct":
      return (toInt(a[0]) < 0 ? "-0o" : "0o") + Math.abs(toInt(a[0])).toString(8);
    default:
      throw new Error(`unknown fn "${name}"`);
  }
}

class Parser {
  private toks: Tok[];
  private pos = 0;
  constructor(toks: Tok[]) {
    this.toks = toks;
  }
  private peek() {
    return this.toks[this.pos];
  }
  private next() {
    return this.toks[this.pos++];
  }
  private eat(type: string) {
    if (this.peek().type !== type) throw new Error(`expected "${type}"`);
    return this.next();
  }

  parse(): Value {
    const v = this.parseOr();
    if (this.peek().type !== "eof") throw new Error(`unexpected "${this.peek().value}"`);
    return v;
  }
  private parseOr(): Value {
    let left = this.parseAnd();
    while (this.peek().type === "or" || this.peek().type === "xor") {
      const op = this.next().type;
      left = logicOrBit(op, left, this.parseAnd());
    }
    return left;
  }
  private parseAnd(): Value {
    let left = this.parseNot();
    while (this.peek().type === "and") {
      this.next();
      left = logicOrBit("and", left, this.parseNot());
    }
    return left;
  }
  private parseNot(): Value {
    if (this.peek().type === "not") {
      this.next();
      const v = this.parseNot();
      return typeof v === "boolean" ? !v : ~toInt(v);
    }
    return this.parseCmp();
  }
  private parseCmp(): Value {
    let left = this.parseBitOr();
    while (["==", "!=", "<", ">", "<=", ">="].includes(this.peek().type)) {
      const op = this.next().type;
      left = compare(op, left, this.parseBitOr());
    }
    return left;
  }
  private parseBitOr(): Value {
    let left = this.parseBitAnd();
    while (this.peek().type === "|") {
      this.next();
      left = bit("|", left, this.parseBitAnd());
    }
    return left;
  }
  private parseBitAnd(): Value {
    let left = this.parseShift();
    while (this.peek().type === "&") {
      this.next();
      left = bit("&", left, this.parseShift());
    }
    return left;
  }
  private parseShift(): Value {
    let left = this.parseAdd();
    while (this.peek().type === "<<" || this.peek().type === ">>") {
      const op = this.next().type;
      left = bit(op, left, this.parseAdd());
    }
    return left;
  }
  private parseAdd(): Value {
    let left = this.parseMul();
    while (this.peek().type === "+" || this.peek().type === "-") {
      const op = this.next().type;
      const right = num(this.parseMul());
      left = op === "+" ? num(left) + right : num(left) - right;
    }
    return left;
  }
  private parseMul(): Value {
    let left = this.parseComb();
    while (["*", "/", "%", "mod"].includes(this.peek().type)) {
      const op = this.next().type;
      const right = num(this.parseComb());
      const l = num(left);
      left = op === "*" ? l * right : op === "/" ? l / right : l % right;
    }
    return left;
  }
  private parseComb(): Value {
    let left = this.parsePow();
    while (this.peek().type === "ncr" || this.peek().type === "npr") {
      const op = this.next().type;
      const right = this.parsePow();
      left = op === "ncr" ? nCr(num(left), num(right)) : nPr(num(left), num(right));
    }
    return left;
  }
  private parsePow(): Value {
    const base = this.parseUnary();
    if (this.peek().type === "^") {
      this.next();
      return Math.pow(num(base), num(this.parsePow()));
    }
    return base;
  }
  private parseUnary(): Value {
    const t = this.peek().type;
    if (t === "-") {
      this.next();
      return -num(this.parseUnary());
    }
    if (t === "+") {
      this.next();
      return num(this.parseUnary());
    }
    if (t === "~") {
      this.next();
      return ~toInt(this.parseUnary());
    }
    return this.parsePostfix();
  }
  private parsePostfix(): Value {
    let v = this.parsePrimary();
    while (this.peek().type === "!") {
      this.next();
      v = factorial(toInt(v));
    }
    return v;
  }
  private parsePrimary(): Value {
    const t = this.peek();
    if (t.type === "(") {
      this.next();
      const v = this.parseOr();
      this.eat(")");
      return v;
    }
    if (t.type === "num") {
      this.next();
      const v = Number(t.value);
      if (Number.isNaN(v)) throw new Error(`bad number "${t.value}"`);
      return v;
    }
    if (t.type === "ident") {
      this.next();
      if (this.peek().type === "(") {
        const args = this.parseArgs();
        return applyFn(t.value.toLowerCase(), args);
      }
      return constant(t.value.toLowerCase());
    }
    throw new Error(`unexpected "${t.value || "end"}"`);
  }
  private parseArgs(): Value[] {
    this.eat("(");
    const args: Value[] = [];
    if (this.peek().type !== ")") {
      args.push(this.parseOr());
      while (this.peek().type === ",") {
        this.next();
        args.push(this.parseOr());
      }
    }
    this.eat(")");
    return args;
  }
}

/** Trim a single trailing `=` (the "evaluate now" key) without breaking `==`. */
export function stripEval(input: string): string {
  const t = input.trimEnd();
  return t.endsWith("=") && !t.endsWith("==") ? t.slice(0, -1) : t;
}

function format(v: Value): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) throw new Error("not finite");
  if (Number.isInteger(v)) return v.toString();
  return parseFloat(v.toPrecision(12)).toString();
}

export interface CalcResult {
  ok: boolean;
  display?: string;
  error?: string;
}

/** Evaluate an expression; never throws. */
export function evaluate(input: string): CalcResult {
  const src = stripEval(input);
  if (!src.trim()) return { ok: false };
  try {
    const value = new Parser(tokenize(src)).parse();
    return { ok: true, display: format(value) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "error" };
  }
}
