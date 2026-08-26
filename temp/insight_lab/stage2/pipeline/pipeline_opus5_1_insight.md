# [opus5] (argument — the reader should watch the butterfly fall out of the factorisation line by line.) FFT Is Just CRT

## Insight
The butterfly step in an FFT looks like an index-shuffling trick, but it is the Chinese Remainder Theorem in disguise. Evaluating a polynomial at a point a is the same as reducing it modulo (x − a), so evaluating at all n roots of unity means reducing modulo x^n − 1 and splitting via CRT. And x^n − 1 = (x^{n/2} − 1)(x^{n/2} + 1) with those factors coprime, so one CRT split gives you the two half-size problems — reducing a polynomial mod x^{n/2} − 1 gives coefficients a_i + a_{i+n/2}, and mod x^{n/2} + 1 gives a_i − a_{i+n/2}. That sum-and-difference pair *is* the butterfly; the inverse FFT is nothing but CRT reconstruction, and the 1/n out front is the reconstruction denominator.

- **The turn:** The FFT's butterfly isn't a numerical trick at all — it is the same coprime-splitting theorem he uses for modular arithmetic in contests, applied to the ring of polynomials.
- **Domain:** algebraic algorithms / computer algebra
- **Taste match:** He's memorised FFT as a contest recipe and CRT as a number-theory tool; being shown they are one theorem is exactly the 'hidden unity' payoff that Concrete Mathematics and Erickson deliver.
- **Level fit:** Requires only polynomial mod arithmetic and the CRT he already knows, but reframes a routine he uses; the a_i ± a_{i+n/2} check is verifiable in his head.
- **Grounding:** Standard modular/CRT view of Cooley–Tukey (Fiduccia's evaluation-as-reduction framework): evaluation at a ≡ reduction mod (x−a); x^n−1 = (x^{n/2}−1)(x^{n/2}+1) over a ring with 2 invertible gives coprime factors, and decimation-in-frequency FFT is this CRT split, as presented in von zur Gathen & Gerhard, *Modern Computer Algebra*.
- **Form hint:** argument — the reader should watch the butterfly fall out of the factorisation line by line.

<details><summary>raw json</summary>

```json
{
  "title": "FFT Is Just CRT",
  "insight": "The butterfly step in an FFT looks like an index-shuffling trick, but it is the Chinese Remainder Theorem in disguise. Evaluating a polynomial at a point a is the same as reducing it modulo (x − a), so evaluating at all n roots of unity means reducing modulo x^n − 1 and splitting via CRT. And x^n − 1 = (x^{n/2} − 1)(x^{n/2} + 1) with those factors coprime, so one CRT split gives you the two half-size problems — reducing a polynomial mod x^{n/2} − 1 gives coefficients a_i + a_{i+n/2}, and mod x^{n/2} + 1 gives a_i − a_{i+n/2}. That sum-and-difference pair *is* the butterfly; the inverse FFT is nothing but CRT reconstruction, and the 1/n out front is the reconstruction denominator.",
  "the_turn": "The FFT's butterfly isn't a numerical trick at all — it is the same coprime-splitting theorem he uses for modular arithmetic in contests, applied to the ring of polynomials.",
  "domain": "algebraic algorithms / computer algebra",
  "taste_match": "He's memorised FFT as a contest recipe and CRT as a number-theory tool; being shown they are one theorem is exactly the 'hidden unity' payoff that Concrete Mathematics and Erickson deliver.",
  "level_fit": "Requires only polynomial mod arithmetic and the CRT he already knows, but reframes a routine he uses; the a_i ± a_{i+n/2} check is verifiable in his head.",
  "grounding": "Standard modular/CRT view of Cooley–Tukey (Fiduccia's evaluation-as-reduction framework): evaluation at a ≡ reduction mod (x−a); x^n−1 = (x^{n/2}−1)(x^{n/2}+1) over a ring with 2 invertible gives coprime factors, and decimation-in-frequency FFT is this CRT split, as presented in von zur Gathen & Gerhard, *Modern Computer Algebra*.",
  "form_hint": "argument — the reader should watch the butterfly fall out of the factorisation line by line."
}
```
</details>