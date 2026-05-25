import type { CSSProperties } from "react";

export const GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈", "◇", "ψ"] as const;

export function journeyGlyph(id: number): string {
  return GLYPHS[Math.abs(id) % GLYPHS.length];
}

export function toRomanLower(num: number): string {
  return toRoman(num).toLowerCase();
}

export function toRoman(num: number): string {
  const lookup: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [v, sym] of lookup) {
    while (n >= v) { out += sym; n -= v; }
  }
  return out;
}

export function useMasthead() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
  const day     = now.getDate();
  const month   = now.toLocaleDateString("en-GB", { month: "long" }).toUpperCase();
  const yearRoman = toRoman(now.getFullYear());
  return { weekday, day, month, yearRoman };
}

export const mastheadStyle: CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.22em",
  fontWeight: 300,
  textTransform: "uppercase",
};
