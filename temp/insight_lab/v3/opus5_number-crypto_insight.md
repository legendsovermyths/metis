# [opus5] The Proof Is The Attack

## Insight
Rabin's cryptosystem has something RSA has never had: a proof that breaking it is *exactly* as hard as factoring. And that proof is, verbatim, an attack on it. Decryption means taking a square root mod n = pq, and every square has four roots (±x, ±x' by CRT). So an adversary picks a random x, hands you c = x² mod n, and you dutifully return *some* root y — with probability 1/2 it's not ±x, and then gcd(x − y, n) hands him p on the spot. The security reduction and the chosen-ciphertext break are the same three lines of arithmetic read in opposite directions: the very lever that proves the scheme is strong is the lever that snaps it.

- **The turn:** The theorem certifying the cipher's security is literally the algorithm that breaks it — only the direction of reading changes.
- **Domain:** public-key cryptography / quadratic residues mod pq
- **Taste match:** A self-contained gcd-and-CRT trick with a philosophical sting — exactly the 'clever mechanism plus story' blend of Concrete Math and Prime Obsession, and catnip for someone who thinks about correctness-by-design.
- **Level fit:** Assumes only CRT, quadratic residues mod pq, gcd, and the notion of a reduction — all standard for a contest programmer who's read Erickson on NP-hardness reductions.
- **Grounding:** Rabin (1979) cryptosystem; its security proof reduces factoring to breaking it via the four square roots mod n=pq (CRT), using gcd(x−y,n); the same argument is the classic chosen-ciphertext attack, which is why Rabin needs padding/OAEP-style redundancy in practice.
- **Form hint:** teach — the jolt lives in seeing one computation serve as both proof and exploit

```json
{
  "title": "The Proof Is The Attack",
  "insight": "Rabin's cryptosystem has something RSA has never had: a proof that breaking it is *exactly* as hard as factoring. And that proof is, verbatim, an attack on it. Decryption means taking a square root mod n = pq, and every square has four roots (±x, ±x' by CRT). So an adversary picks a random x, hands you c = x² mod n, and you dutifully return *some* root y — with probability 1/2 it's not ±x, and then gcd(x − y, n) hands him p on the spot. The security reduction and the chosen-ciphertext break are the same three lines of arithmetic read in opposite directions: the very lever that proves the scheme is strong is the lever that snaps it.",
  "the_turn": "The theorem certifying the cipher's security is literally the algorithm that breaks it — only the direction of reading changes.",
  "domain": "public-key cryptography / quadratic residues mod pq",
  "taste_match": "A self-contained gcd-and-CRT trick with a philosophical sting — exactly the 'clever mechanism plus story' blend of Concrete Math and Prime Obsession, and catnip for someone who thinks about correctness-by-design.",
  "level_fit": "Assumes only CRT, quadratic residues mod pq, gcd, and the notion of a reduction — all standard for a contest programmer who's read Erickson on NP-hardness reductions.",
  "grounding": "Rabin (1979) cryptosystem; its security proof reduces factoring to breaking it via the four square roots mod n=pq (CRT), using gcd(x−y,n); the same argument is the classic chosen-ciphertext attack, which is why Rabin needs padding/OAEP-style redundancy in practice.",
  "form_hint": "teach — the jolt lives in seeing one computation serve as both proof and exploit"
}
```