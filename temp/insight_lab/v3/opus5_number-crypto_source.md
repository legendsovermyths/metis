**Mode:** teach

## Prerequisites

**Modular arithmetic.** Working "mod $n$" means we only care about remainders after division by $n$. So $80 \equiv 3 \pmod{77}$. Addition and multiplication behave normally.

**$n = pq$.** Throughout, $n$ is the product of two distinct large primes $p$ and $q$. Knowing $n$ is public; knowing $p$ and $q$ is the secret.

**The factoring problem.** Given $n$, find $p$ and $q$. Nobody knows a fast (polynomial-time) way to do this for large $n$; the whole industry of public-key crypto leans on that.

**gcd, and Euclid's algorithm.** $\gcd(a,b)$ is the largest integer dividing both. Euclid's algorithm computes it with a handful of divisions — blindingly fast, even for thousand-digit numbers. This matters: gcd is *cheap*, factoring is *not*, even though both are "find a common structure" questions.

**Quadratic residue / square root mod $n$.** $c$ is a *quadratic residue* mod $n$ if $c \equiv x^2 \pmod n$ for some $x$; that $x$ is a *square root of $c$ mod $n$*. Over the ordinary integers a positive number has two square roots, $\pm\sqrt{c}$. Mod a composite, it can have more — that's the engine of this whole story.

**Chinese Remainder Theorem (CRT).** If $p,q$ are distinct primes and $n=pq$, then knowing a number's remainder mod $p$ *and* mod $q$ pins it down uniquely mod $n$ — and every pair of remainders $(a \bmod p,\; b \bmod q)$ is achieved by exactly one residue mod $n$. Informally: arithmetic mod $n$ is two independent arithmetics, one mod $p$ and one mod $q$, running side by side.

**Squares mod a prime.** Mod a prime $p$, a nonzero square $c$ has exactly two square roots, $\pm r$, and they are distinct (as long as $p$ is odd). Extracting them is easy *if you know $p$*: for $p \equiv 3 \pmod 4$, one root is simply $c^{(p+1)/4} \bmod p$.

**Reduction.** A translation showing "if you could solve problem B, you could solve problem A." Contrapositive: if A is hard, B is hard. Exactly the move you make when proving something NP-hard.

**Public-key encryption, informally.** Anyone can encrypt using public data; only the holder of the secret key can decrypt.

**Chosen-ciphertext attack (CCA).** An attack model where the adversary gets to hand the legitimate key-holder ciphertexts of his choosing and see what comes back out — think of a server that dutifully decrypts whatever you send it. Realistic, and brutal.

---

## The Proof Is The Attack

### A cipher whose security is a theorem

RSA is the famous one, and RSA has a slightly embarrassing secret: nobody has ever proved that breaking it is as hard as factoring. We *believe* it. If you can factor $n$ you can certainly break RSA. But the converse — that an RSA-breaking box could be turned into a factoring machine — has never been shown, and there's even evidence (Boneh–Venkatesan, 1998) that certain natural styles of proof can't work for small exponents. RSA's security is a well-tested conjecture wearing a suit.

In 1979, Michael Rabin published a scheme that *does* have the theorem. Its statement is as clean as you could dream:

> Breaking Rabin's cryptosystem is exactly as hard as factoring $n$.

Not "at least as hard as some new unstudied problem." Exactly as hard as the oldest, most beaten-on problem in number theory. Provable equivalence. Correctness by design.

And here is the turn, the thing worth carrying around for the rest of your life: **the proof of that theorem is, verbatim, an attack on the cipher.** Not "inspired an attack," not "suggested a weakness." The same three lines of arithmetic. Read left to right, they are a security proof. Read right to left, they are a chosen-ciphertext break that recovers the private key in one query. It is the same lever. Push one way, the scheme is certified strong; push the other, it snaps.

Let's build it.

### The scheme: encryption is squaring

Rabin's cipher is almost insultingly simple.

- **Key generation.** Pick two large primes $p, q$. Public key: $n = pq$. Private key: $(p,q)$.
- **Encrypt** a message $m$ (a number mod $n$): $c = m^2 \bmod n$. That's it. One multiplication. Cheaper than any RSA exponentiation.
- **Decrypt** $c$: compute a square root of $c$ mod $n$.

Encryption is squaring; decryption is square-rooting. So the private key must be exactly what you need to take square roots mod $n$ — and it is. Here's why.

By CRT, working mod $n$ is really working mod $p$ and mod $q$ in parallel. To find $x$ with $x^2 \equiv c \pmod n$:

1. Find $r$ with $r^2 \equiv c \pmod p$ — easy, since $p$ is a prime you know. The two roots mod $p$ are $\pm r$.
2. Find $s$ with $s^2 \equiv c \pmod q$. The two roots mod $q$ are $\pm s$.
3. Glue with CRT. Every combination works:

$$(+r,+s), \quad (+r,-s), \quad (-r,+s), \quad (-r,-s)$$

Four independent choices, four distinct residues mod $n$, **four square roots** of $c$. And they come in two mirror pairs: if $x$ is the root built from $(+r,+s)$, then $-x \equiv n - x$ is the one from $(-r,-s)$. Call the other pair $\pm x'$. So the four roots are

$$\{\,x,\; -x,\; x',\; -x'\,\}, \qquad x' \not\equiv \pm x \pmod n .$$

Without $p$ and $q$, you can't do step 1 or step 2 at all. Taking square roots mod $n$ is the private operation. Perfect.

Except for one wart, which turns out to be the whole story: **the legitimate receiver gets four candidate plaintexts and cannot tell, from the mathematics alone, which one you sent.** Squaring mod $n$ is 4-to-1, not 1-to-1. Hold that thought.

### A concrete lab: $n = 77$

Take $p = 7$, $q = 11$, so $n = 77$. Let the secret message be $x = 13$.

$$c = 13^2 = 169 = 2\cdot 77 + 15 \;\Rightarrow\; c = 15 \bmod 77.$$

Now let's find *all* square roots of $15$ mod $77$, the way the key-holder would.

Mod 7: $15 \equiv 1$, and $1 = (\pm 1)^2$, so $r = 1$, roots $\{1, 6\}$.
Mod 11: $15 \equiv 4$, and $4 = (\pm 2)^2$, so $s = 2$, roots $\{2, 9\}$.

Glue all four combinations with CRT:

| mod 7 | mod 11 | mod 77 | check |
|---|---|---|---|
| $1$ | $2$ | $57$ | $57^2 = 3249 = 42\cdot77 + 15$ ✓ |
| $1$ | $9$ | $64$ | $64^2 = 4096 = 53\cdot 77 + 15$ ✓ |
| $6$ | $2$ | $13$ | $13^2 = 169 = 2\cdot 77 + 15$ ✓ |
| $6$ | $9$ | $20$ | $20^2 = 400 = 5\cdot 77 + 15$ ✓ |

Four roots: $\{13,\, 20,\, 57,\, 64\}$. The mirror pairs: $13 + 64 = 77$, so $\pm 13 = \{13,64\}$; and $20 + 57 = 77$, so $\pm 20 = \{20, 57\}$. My message $13$ has a "twin" $20$ that is genuinely a different number, not just a sign flip.

Now watch what the twin costs.

$$13 - 20 = -7, \qquad \gcd(7, 77) = 7 = p.$$

There it is. Two roots from *different* mirror pairs, subtract, take a gcd, and the factorization of $n$ falls out. Try the other one: $13 - 57 = -44$, $\gcd(44, 77) = 11 = q$. Either cross-pair partner spills a prime.

And the roots in the *same* pair? $13 - 64 = -51$, $\gcd(51,77) = 1$. Nothing. As expected — that's just $x - (-x) = 2x$, which carries no information about $p$ and $q$.

### Why the gcd must work

This is three lines, and they are the heart of everything.

Suppose $x^2 \equiv y^2 \pmod n$ with $y \not\equiv \pm x$. Then

$$n \mid x^2 - y^2 = (x-y)(x+y).$$

So $pq$ divides the product $(x-y)(x+y)$. Now split it across the primes:

- $p$ divides $(x-y)(x+y)$, and $p$ is prime, so $p$ divides $x-y$ **or** $x+y$.
- Likewise $q$ divides one of the two factors.

Could $p$ and $q$ both divide $x - y$? Then $n \mid x-y$, i.e. $y \equiv x$ — excluded. Could both divide $x+y$? Then $y \equiv -x$ — also excluded. So the two primes are **split between the two factors**: one prime divides $x-y$, the other divides $x+y$.

Therefore $\gcd(x-y,\,n)$ is exactly one of $p$ or $q$. Not $1$, not $n$. A single run of Euclid's algorithm — microseconds, even at 2048 bits — and $n$ is factored.

Restated with the drama it deserves: **for $n = pq$, "knowing two genuinely different square roots of the same number" and "knowing the factorization" are the same knowledge.** Not similar in difficulty. The same thing, separated by one gcd.

(Sanity check on the "hard direction" too: knowing $p,q$ gives you all four roots, by the CRT recipe above. So the two pieces of knowledge convert into each other in both directions. This is a genuine equivalence, not a one-way hint.)

### Reading it forwards: the security proof

Now suppose an adversary claims to have broken Rabin: a box $B$ that, given the public $n$ and any square $c$ mod $n$, returns *some* square root of $c$. That's precisely what "breaking the cipher" means — decrypting without the private key.

I want to factor $n$. I have no idea what $p$ and $q$ are, but I have $B$. So:

1. Pick $x$ uniformly at random mod $n$ (with $\gcd(x,n)=1$, overwhelmingly likely).
2. Compute $c = x^2 \bmod n$. Hand $c$ to $B$. Get back some root $y$.
3. Compute $\gcd(x-y, n)$.

What's the chance this works? Here's the delicate, lovely part. The ciphertext $c$ is all $B$ sees, and $c$ is *identical* for all four of its roots. There is no evidence in $c$ about which root I started from. Since $x$ was uniform, all four roots of $c$ are equally likely to have been my $x$, from $B$'s point of view. $B$ returns one root $y$; the probability that $y$ lands in my own mirror pair $\{x, -x\}$ — the useless case — is exactly $2/4 = 1/2$.

So with probability $\tfrac12$, $y \not\equiv \pm x$, and step 3 hands me $p$.

Failed? Repeat. After $k$ independent tries, the chance of never succeeding is $2^{-k}$. Forty tries and the failure probability is under one in a trillion. A Rabin-breaker is a factoring machine, full stop.

Contrapositive: **if factoring is hard, Rabin is unbreakable.** Combined with the trivial direction (a factoring machine reads Rabin instantly, via the CRT recipe), we get the theorem: breaking Rabin $\equiv$ factoring. Exactly as hard. This is the certificate RSA has never earned.

### Reading it backwards: the attack

Now reread those three steps, but change one word. Replace "adversary's magic breaking box $B$" with "the honest server holding the private key."

An adversary walks up to your Rabin decryption service:

1. He picks a random $x$ — a number he *chooses and remembers*.
2. He computes $c = x^2 \bmod n$ and submits it as a ciphertext. Your server, doing its job correctly and helpfully, takes a square root and returns a plaintext $y$.
3. He computes $\gcd(x - y,\, n)$.

With probability $1/2$, your prime $p$ is now in his hands. Not the one message — the *private key*. Every message you ever received, and ever will. Two queries on average.

That is the same computation. Literally the same three lines, the same probability-$\tfrac12$ argument, the same gcd. In the proof, the box is hypothetical and the conclusion is "therefore no such box exists." In the attack, the box is your production server and the conclusion is "therefore hand me your key."

The theorem that certifies the cipher is strong *is* the algorithm that breaks it. Only the direction of reading changes.

### Why this had to happen, and what it teaches

It's tempting to call this a coincidence or an embarrassment. It's neither. It's structural, and here's the reason.

A proof of the form "breaking it $\Rightarrow$ factoring" works by taking a decryption box and *abusing* it — feeding it inputs no honest sender would ever produce, and mining the answers. The tighter the proof, the more devastating the abuse, because a tight proof is one where a *single* well-chosen query already spills the secret. So a beautifully tight security reduction is, automatically, a beautifully efficient chosen-ciphertext attack — *provided the adversary can actually get the box to answer*. The proof and the attack are not cousins; they are one object viewed from two sides. The reduction says "any decryption oracle is a factoring oracle." That's protective if oracles don't exist, and fatal if you built one and put it on the internet.

Which points to the real fix, and it's the same wart from earlier. The reduction needs the box to return *some* root of *any* square handed to it — that ambiguity, the 4-to-1 map, is the source of both the probability $1/2$ and the leak. In practice Rabin must add **redundancy**: pad the plaintext with a known pattern, a hash, a fixed header (this is why real Rabin/Williams deployments use OAEP-style padding, or restrict to *Blum integers* $p \equiv q \equiv 3 \pmod 4$ where a Jacobi-symbol trick and one extra bit pick out a unique root). Now the receiver decrypts, sees which of the four roots carries the valid pattern, and outputs that one — solving the "which of four plaintexts?" usability problem.

And notice what that padding does to the attack. The adversary's $c = x^2$ comes from a *random* $x$, which will not carry the pattern; nor will its three siblings. The server says "invalid ciphertext" and returns nothing. Attack blocked.

But — and this is the sting inside the sting — it is blocked *for exactly the reason the clean proof no longer applies*. The padded scheme's decryption box is no longer the all-purpose square-root oracle the reduction needed; it only answers about well-formed ciphertexts. You can no longer point at random squares and demand roots. The gorgeous unconditional equivalence to factoring becomes something more delicate, provable in idealized models (random-oracle-style CCA proofs) rather than by four lines of gcd. You bought security against the attack by giving up the proof that made the scheme famous — because the attack and the proof were the same thing, and you can't keep one and discard the other.

That's the lesson worth taking out of number theory entirely: **a security proof is a recipe for abusing your own system, written in a hopeful mood.** When someone shows you a tight reduction, read it twice — once as reassurance, once as a threat model. It is the same text.

### The residue that stays with you

Strip away the crypto and one arithmetic fact remains, small enough to hold in your hand:

> For $n = pq$, two "essentially different" square roots of the same number mod $n$ *are* the factorization. $\gcd(x-y, n)$ is the whole translation.

Everything above — the cipher, the theorem, the exploit, the padding, the philosophy — is that one sentence, wearing different hats. And it's why so many factoring algorithms (Fermat, quadratic sieve, number field sieve) spend all their effort on a single goal: manufacture a congruence $x^2 \equiv y^2 \pmod n$ where $y \not\equiv \pm x$. They don't hunt for factors. They hunt for a *collision among squares*, then let Euclid do twenty microseconds of work.

Rabin's cipher is that hunt, inverted into a service, and offered to the public with the invitation: *please, send me anything, and I'll square-root it for you.*