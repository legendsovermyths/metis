# [opus5] (puzzle) Pascal's Triangle Is A Bitmask

## Insight
Row 1000 of Pascal's triangle has 1001 entries — how many are odd? The answer is exactly 64, and you can get it without touching a single factorial. By Lucas' theorem mod 2, C(n,k) is odd precisely when k's binary digits are a subset of n's, i.e. when k AND n == k. So the count of odd entries in row n is 2^popcount(n); since 1000 = 1111101000₂ has six 1-bits, the answer is 2⁶ = 64. Parity in Pascal's triangle isn't an arithmetic fact at all — it's the subset lattice of a bitmask, which is why the triangle mod 2 draws the Sierpiński gasket: self-similarity is just what 'submask' looks like when you plot it.

- **The turn:** The parity of a binomial coefficient has nothing to do with its size and everything to do with bitwise containment — the same submask-enumeration loop you write in bitmask DP is secretly walking the odd entries of a Pascal row.
- **Domain:** number theory / combinatorics (Lucas' theorem, binomial coefficients mod p)
- **Taste match:** He already lives in `for (int s = m; s; s = (s-1) & m)` submask loops from bitmask DP, and Concrete Mathematics grinds through binomial identities; discovering that the digit-carry structure of C(n,k) is the same object as his mask trick is exactly the 'surprising unity' payoff pop-math readers chase.
- **Level fit:** Requires knowing binary representations, popcount, and being able to accept Lucas mod 2 — all within reach for a CP-trained reader — yet the leap from carries to subset lattices to Sierpiński is genuinely nontrivial and not a contest recipe.
- **Grounding:** Lucas' theorem (1878): C(n,k) ≡ ∏ C(nᵢ,kᵢ) mod p over base-p digits; mod 2 this gives C(n,k) odd ⟺ k AND n = k. Glaisher's corollary: the number of odd entries in row n is 2^s₂(n) where s₂ is the binary digit sum. Kummer's theorem gives the carry-counting refinement; the Sierpiński-gasket limit of Pascal mod 2 is a standard consequence.
- **Form hint:** puzzle — a concrete row with a single exact integer answer (64) that looks like it needs computation but collapses to counting six bits

<details><summary>raw json</summary>

```json
{
  "title": "Pascal's Triangle Is A Bitmask",
  "insight": "Row 1000 of Pascal's triangle has 1001 entries — how many are odd? The answer is exactly 64, and you can get it without touching a single factorial. By Lucas' theorem mod 2, C(n,k) is odd precisely when k's binary digits are a subset of n's, i.e. when k AND n == k. So the count of odd entries in row n is 2^popcount(n); since 1000 = 1111101000₂ has six 1-bits, the answer is 2⁶ = 64. Parity in Pascal's triangle isn't an arithmetic fact at all — it's the subset lattice of a bitmask, which is why the triangle mod 2 draws the Sierpiński gasket: self-similarity is just what 'submask' looks like when you plot it.",
  "the_turn": "The parity of a binomial coefficient has nothing to do with its size and everything to do with bitwise containment — the same submask-enumeration loop you write in bitmask DP is secretly walking the odd entries of a Pascal row.",
  "domain": "number theory / combinatorics (Lucas' theorem, binomial coefficients mod p)",
  "taste_match": "He already lives in `for (int s = m; s; s = (s-1) & m)` submask loops from bitmask DP, and Concrete Mathematics grinds through binomial identities; discovering that the digit-carry structure of C(n,k) is the same object as his mask trick is exactly the 'surprising unity' payoff pop-math readers chase.",
  "level_fit": "Requires knowing binary representations, popcount, and being able to accept Lucas mod 2 — all within reach for a CP-trained reader — yet the leap from carries to subset lattices to Sierpiński is genuinely nontrivial and not a contest recipe.",
  "grounding": "Lucas' theorem (1878): C(n,k) ≡ ∏ C(nᵢ,kᵢ) mod p over base-p digits; mod 2 this gives C(n,k) odd ⟺ k AND n = k. Glaisher's corollary: the number of odd entries in row n is 2^s₂(n) where s₂ is the binary digit sum. Kummer's theorem gives the carry-counting refinement; the Sierpiński-gasket limit of Pascal mod 2 is a standard consequence.",
  "form_hint": "puzzle — a concrete row with a single exact integer answer (64) that looks like it needs computation but collapses to counting six bits"
}
```
</details>