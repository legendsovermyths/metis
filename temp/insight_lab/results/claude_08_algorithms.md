# [claude] Amortization Assumes Ownership

*domain area: algorithmic sleight-of-hand (invariants, amortization, a clever data-structure trick)*

## Insight
Amortized bounds carry a hidden precondition nobody states: you may only use the structure once. A dynamic array that's O(1) amortized per push is honest only if each version is used linearly — save the version that is exactly full, then push into that same snapshot a million times, and you pay the full O(n) copy a million times. The average was never a property of the structure; it was a property of a single-threaded usage history, and persistence voids the warranty. Okasaki's fix was to pay with lazy thunks plus memoization, so the expensive work is a shared debt that can only be discharged once no matter how many futures fork off it — and Rust's move/`&mut` rules are, in effect, the type system enforcing the linearity that classical amortized analysis quietly assumed all along.

- **The turn:** The amortized bound isn't a fact about the data structure at all — it's a fact about how you're allowed to hold it, which is why persistence breaks it and why ownership types are secretly the missing hypothesis.
- **Domain:** Data structures / amortized analysis and functional persistence
- **Taste match:** Anirudh lives at the seam between contest data structures and Rust's correctness-by-design; this shows the two are talking about the same invariant from opposite ends.
- **Level fit:** He already knows the banker's-method argument for vector push and Rust's borrow rules; the leap is realising the proof has an unstated linearity assumption — new, but checkable in his head in a minute.
- **Grounding (truth-check):** Okasaki, *Purely Functional Data Structures* (1996/1998), Ch. 5–6: classical amortized analysis (banker's and physicist's methods) is invalid under persistent usage because an expensive operation can be repeated from a shared version; lazy evaluation with memoization restores the bounds (banker's/debit method), yielding e.g. real-time queues. The linearity connection is the standard linear/affine-types reading of Rust's ownership discipline.
- **Form hint:** argument — the punch comes from watching a proof's hidden hypothesis get violated step by step

<details><summary>raw json</summary>

```json
{
  "title": "Amortization Assumes Ownership",
  "insight": "Amortized bounds carry a hidden precondition nobody states: you may only use the structure once. A dynamic array that's O(1) amortized per push is honest only if each version is used linearly — save the version that is exactly full, then push into that same snapshot a million times, and you pay the full O(n) copy a million times. The average was never a property of the structure; it was a property of a single-threaded usage history, and persistence voids the warranty. Okasaki's fix was to pay with lazy thunks plus memoization, so the expensive work is a shared debt that can only be discharged once no matter how many futures fork off it — and Rust's move/`&mut` rules are, in effect, the type system enforcing the linearity that classical amortized analysis quietly assumed all along.",
  "the_turn": "The amortized bound isn't a fact about the data structure at all — it's a fact about how you're allowed to hold it, which is why persistence breaks it and why ownership types are secretly the missing hypothesis.",
  "domain": "Data structures / amortized analysis and functional persistence",
  "taste_match": "Anirudh lives at the seam between contest data structures and Rust's correctness-by-design; this shows the two are talking about the same invariant from opposite ends.",
  "level_fit": "He already knows the banker's-method argument for vector push and Rust's borrow rules; the leap is realising the proof has an unstated linearity assumption — new, but checkable in his head in a minute.",
  "grounding": "Okasaki, *Purely Functional Data Structures* (1996/1998), Ch. 5–6: classical amortized analysis (banker's and physicist's methods) is invalid under persistent usage because an expensive operation can be repeated from a shared version; lazy evaluation with memoization restores the bounds (banker's/debit method), yielding e.g. real-time queues. The linearity connection is the standard linear/affine-types reading of Rust's ownership discipline.",
  "form_hint": "argument — the punch comes from watching a proof's hidden hypothesis get violated step by step"
}
```
</details>