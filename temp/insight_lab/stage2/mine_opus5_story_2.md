# [opus5] (story) Gauss's Buried Fast Fourier

## Insight
Around 1805, hand-computing the orbit of the asteroid Pallas, Gauss wanted to interpolate a periodic dataset without doing n² multiplications, so he split the samples into interleaved subsets, transformed each, and recombined — divide-and-conquer, the FFT, in essence. He never published it; it sat in his Nachlass in idiosyncratic neo-Latin notation until 1866, and even then read as a clerical labour-saving trick. It was independently rediscovered at least a dozen times (Runge, Danielson–Lanczos in 1942 for X-ray crystallography) and each time filed as a minor arithmetic shortcut — because when a human does the arithmetic, n² versus n log n saves you a week, not a civilisation. Only in 1965, when Cooley and Tukey published it against machines that could execute millions of operations, did the same identity stop being a shortcut and become infrastructure: JPEG, MP3, MRI, 5G. And Gauss wrote it before Fourier's 1807 memoir — the algorithm predates the transform it computes.

- **The turn:** The FFT wasn't undiscovered for 160 years — it was discovered repeatedly and correctly judged unimportant, because an asymptotic advantage is worthless until the input sizes arrive to cash it in.
- **Domain:** History of algorithms / numerical analysis
- **Taste match:** He knows FFT as a contest tool and Rust-style zero-cost reasoning; here the same O(n log n) he takes for granted is shown to have had *no value* for 160 years, which reframes complexity theory as economics, not truth.
- **Level fit:** Requires only knowing what a DFT and divide-and-conquer are — both squarely in the Competitive Programmer's Handbook — but the payload is a meta-point about asymptotics he probably hasn't had stated to him.
- **Grounding:** Gauss, 'Theoria interpolationis methodo nova tractata', written c.1805, published posthumously in Werke vol. 3 (1866); Heideman, Johnson & Burrus, 'Gauss and the History of the Fast Fourier Transform' (IEEE ASSP Magazine, 1984); Danielson & Lanczos (1942); Cooley & Tukey (1965). Fourier's memoir on heat: 1807.
- **Form hint:** story — the drama is in the repeated correct dismissal, which only lands as a narrative of successive rediscoveries

<details><summary>raw json</summary>

```json
{
  "title": "Gauss's Buried Fast Fourier",
  "insight": "Around 1805, hand-computing the orbit of the asteroid Pallas, Gauss wanted to interpolate a periodic dataset without doing n² multiplications, so he split the samples into interleaved subsets, transformed each, and recombined — divide-and-conquer, the FFT, in essence. He never published it; it sat in his Nachlass in idiosyncratic neo-Latin notation until 1866, and even then read as a clerical labour-saving trick. It was independently rediscovered at least a dozen times (Runge, Danielson–Lanczos in 1942 for X-ray crystallography) and each time filed as a minor arithmetic shortcut — because when a human does the arithmetic, n² versus n log n saves you a week, not a civilisation. Only in 1965, when Cooley and Tukey published it against machines that could execute millions of operations, did the same identity stop being a shortcut and become infrastructure: JPEG, MP3, MRI, 5G. And Gauss wrote it before Fourier's 1807 memoir — the algorithm predates the transform it computes.",
  "the_turn": "The FFT wasn't undiscovered for 160 years — it was discovered repeatedly and correctly judged unimportant, because an asymptotic advantage is worthless until the input sizes arrive to cash it in.",
  "domain": "History of algorithms / numerical analysis",
  "taste_match": "He knows FFT as a contest tool and Rust-style zero-cost reasoning; here the same O(n log n) he takes for granted is shown to have had *no value* for 160 years, which reframes complexity theory as economics, not truth.",
  "level_fit": "Requires only knowing what a DFT and divide-and-conquer are — both squarely in the Competitive Programmer's Handbook — but the payload is a meta-point about asymptotics he probably hasn't had stated to him.",
  "grounding": "Gauss, 'Theoria interpolationis methodo nova tractata', written c.1805, published posthumously in Werke vol. 3 (1866); Heideman, Johnson & Burrus, 'Gauss and the History of the Fast Fourier Transform' (IEEE ASSP Magazine, 1984); Danielson & Lanczos (1942); Cooley & Tukey (1965). Fourier's memoir on heat: 1807.",
  "form_hint": "story — the drama is in the repeated correct dismissal, which only lands as a narrative of successive rediscoveries"
}
```
</details>