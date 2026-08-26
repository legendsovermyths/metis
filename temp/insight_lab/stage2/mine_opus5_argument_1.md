# [opus5] (argument) Proof by Contradiction Is a Goto

## Insight
Curry–Howard says a proof is a program: implication is a function, conjunction a struct, disjunction an enum. Constructive logic falls out exactly; the one axiom that refuses to typecheck is double-negation elimination, ¬¬A → A — the engine of proof by contradiction. Timothy Griffin's 1990 result is that this missing axiom is not missing at all: it is precisely the type of `call/cc`, a first-class continuation, i.e. a structured non-local jump. So classical logic isn't 'content-free' as the intuitionists charged; it computes — but by launching a speculative branch, then throwing away the stack when it hits a contradiction. The contested question is whether that counts as constructing the object: a classical existence proof, run as a program, will hand you a witness for a Σ⁰₁ claim (Friedman's translation guarantees it), yet the 'construction' consists of backtracking out of worlds it assumed only to refute. Is that a genuine algorithm with fancier control flow, or an algorithm that cheats by assuming the answer and then exception-handling its way out?

- **The turn:** The axiom that separates classical from constructive mathematics turns out to be, literally and typewise, the same thing as a `goto` — proof by contradiction is exception handling.
- **Domain:** Foundations of mathematics / proof theory (Curry–Howard correspondence)
- **Taste match:** Anirudh reads Rust's type system as correctness-by-design and reads Erickson for *why* algorithms work; here type theory eats a 100-year philosophical dispute and the punchline is a control-flow primitive he can picture in code.
- **Level fit:** Needs only 'types = propositions' and a feel for non-local control flow, both within reach for someone who's internalised the Rust Book and DP-with-backtracking — but the Σ⁰₁-witness subtlety keeps it genuinely hard.
- **Grounding:** Curry–Howard correspondence; Timothy Griffin, 'A Formulae-as-Types Notion of Control' (POPL 1990), typing call/cc with Peirce's law / ¬¬A→A; Gödel–Gentzen double-negation translation and Friedman's A-translation giving witness extraction for Π⁰₂/Σ⁰₁ statements from classical proofs; Brouwer–Hilbert debate over non-constructive existence.
- **Form hint:** argument — both the intuitionist ('backtracking out of a fiction isn't building anything') and the classicist ('it terminates with a witness; that's construction enough') have live steelman positions, and the reader must pick.

<details><summary>raw json</summary>

```json
{
  "title": "Proof by Contradiction Is a Goto",
  "insight": "Curry–Howard says a proof is a program: implication is a function, conjunction a struct, disjunction an enum. Constructive logic falls out exactly; the one axiom that refuses to typecheck is double-negation elimination, ¬¬A → A — the engine of proof by contradiction. Timothy Griffin's 1990 result is that this missing axiom is not missing at all: it is precisely the type of `call/cc`, a first-class continuation, i.e. a structured non-local jump. So classical logic isn't 'content-free' as the intuitionists charged; it computes — but by launching a speculative branch, then throwing away the stack when it hits a contradiction. The contested question is whether that counts as constructing the object: a classical existence proof, run as a program, will hand you a witness for a Σ⁰₁ claim (Friedman's translation guarantees it), yet the 'construction' consists of backtracking out of worlds it assumed only to refute. Is that a genuine algorithm with fancier control flow, or an algorithm that cheats by assuming the answer and then exception-handling its way out?",
  "the_turn": "The axiom that separates classical from constructive mathematics turns out to be, literally and typewise, the same thing as a `goto` — proof by contradiction is exception handling.",
  "domain": "Foundations of mathematics / proof theory (Curry–Howard correspondence)",
  "taste_match": "Anirudh reads Rust's type system as correctness-by-design and reads Erickson for *why* algorithms work; here type theory eats a 100-year philosophical dispute and the punchline is a control-flow primitive he can picture in code.",
  "level_fit": "Needs only 'types = propositions' and a feel for non-local control flow, both within reach for someone who's internalised the Rust Book and DP-with-backtracking — but the Σ⁰₁-witness subtlety keeps it genuinely hard.",
  "grounding": "Curry–Howard correspondence; Timothy Griffin, 'A Formulae-as-Types Notion of Control' (POPL 1990), typing call/cc with Peirce's law / ¬¬A→A; Gödel–Gentzen double-negation translation and Friedman's A-translation giving witness extraction for Π⁰₂/Σ⁰₁ statements from classical proofs; Brouwer–Hilbert debate over non-constructive existence.",
  "form_hint": "argument — both the intuitionist ('backtracking out of a fiction isn't building anything') and the classicist ('it terminates with a witness; that's construction enough') have live steelman positions, and the reader must pick."
}
```
</details>