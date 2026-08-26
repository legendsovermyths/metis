# [opus5] Sorting Networks Only Need Bits

## Insight
A sorting network is a fixed circuit of compare-and-swap wires — no branching, no data-dependent control flow, the same comparisons every time. To prove one is correct you'd think you must check all n! orderings. You don't: if it sorts every sequence of 0s and 1s, it provably sorts every input, so 2^n checks suffice — and for a 16-wire network that's 65,536 tests instead of 20 trillion. The reason is a one-line trick: for any monotone f, running the network on f(x) gives exactly f(applied to the run on x), because min and max commute with monotone maps. So if some input comes out unsorted, pick the threshold function f(v) = [v ≥ t] at the offending pair, and you've manufactured a 0-1 input that the network also fails.

- **The turn:** Correctness over all of ℝ^n collapses to correctness over the binary cube — the hardest case for a comparison circuit is a sequence of bits.
- **Domain:** algorithms / sorting networks, oblivious computation
- **Taste match:** A clever, fully self-contained proof trick of exactly the kind Erickson and Concrete Mathematics savour — and it has the flavour Anirudh likes in Rust: correctness established by structure, not by testing every case.
- **Level fit:** Assumes comparison sorting, the n! lower-bound intuition, and comfort with monotone functions and indicator/threshold functions; the proof is a two-step commutation argument, no machinery beyond that.
- **Grounding:** The 0-1 principle for sorting networks (Knuth, TAOCP Vol. 3, §5.3.4, Theorem Z): a comparator network sorts all inputs iff it sorts all 0-1 inputs; proof via commutation of comparators with monotone nondecreasing functions, instantiated at threshold functions.
- **Form hint:** teach — the punch is the mechanism (min/max commute with monotone maps), which needs showing, not guessing

```json
{
  "title": "Sorting Networks Only Need Bits",
  "insight": "A sorting network is a fixed circuit of compare-and-swap wires — no branching, no data-dependent control flow, the same comparisons every time. To prove one is correct you'd think you must check all n! orderings. You don't: if it sorts every sequence of 0s and 1s, it provably sorts every input, so 2^n checks suffice — and for a 16-wire network that's 65,536 tests instead of 20 trillion. The reason is a one-line trick: for any monotone f, running the network on f(x) gives exactly f(applied to the run on x), because min and max commute with monotone maps. So if some input comes out unsorted, pick the threshold function f(v) = [v ≥ t] at the offending pair, and you've manufactured a 0-1 input that the network also fails.",
  "the_turn": "Correctness over all of ℝ^n collapses to correctness over the binary cube — the hardest case for a comparison circuit is a sequence of bits.",
  "domain": "algorithms / sorting networks, oblivious computation",
  "taste_match": "A clever, fully self-contained proof trick of exactly the kind Erickson and Concrete Mathematics savour — and it has the flavour Anirudh likes in Rust: correctness established by structure, not by testing every case.",
  "level_fit": "Assumes comparison sorting, the n! lower-bound intuition, and comfort with monotone functions and indicator/threshold functions; the proof is a two-step commutation argument, no machinery beyond that.",
  "grounding": "The 0-1 principle for sorting networks (Knuth, TAOCP Vol. 3, §5.3.4, Theorem Z): a comparator network sorts all inputs iff it sorts all 0-1 inputs; proof via commutation of comparators with monotone nondecreasing functions, instantiated at threshold functions.",
  "form_hint": "teach — the punch is the mechanism (min/max commute with monotone maps), which needs showing, not guessing"
}
```