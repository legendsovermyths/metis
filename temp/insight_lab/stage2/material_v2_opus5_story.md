# [opus5] MATERIAL v2 — The Model Its Author Disowned  ·  **story**

_Why this form:_ The emotional core is a man discarding his own idea as a failure while his correct proof quietly hid a dimensional assumption; the reader realises rather than solves. The counting argument is the punchline of the narrative, not a puzzle with an objective answer.

## Prerequisites (footing, defined in-document)
- **Spin (as used in the Ising model)** — An idealised magnetic arrow attached to each site of a lattice, allowed only two values: up (+1) or down (−1). It is a cartoon of an atom's magnetic moment, stripped of everything except its two-way choice.
- **The Ising model** — A lattice of such ±1 spins in which each neighbouring pair contributes energy −J·s_i·s_j, so aligned neighbours are cheaper (lower energy) by 2J than misaligned ones. That is the entire model: no dynamics, no quantum mechanics, just neighbours preferring to agree.
- **Temperature and the Boltzmann weight** — At temperature T, a configuration of energy E occurs with probability proportional to e^{−E/kT} (k = Boltzmann's constant; write β = 1/kT). High T flattens these weights so all configurations are roughly equally likely; T → 0 concentrates everything on the lowest-energy configurations.
- **Entropy as a logarithm of a count** — If a state of affairs can be realised in W microscopically distinct ways, its entropy is S = k·log W. Entropy is therefore just bookkeeping on how many ways something can happen, measured on a log scale.
- **Free energy, and why it decides** — A system at temperature T settles into whatever minimises F = E − T·S, not E alone. So a change is favourable whenever the energy it costs, ΔE, is less than T times the entropy it buys, T·ΔS.
- **Spontaneous magnetization / long-range order** — The property that, with no external magnetic field, a majority of spins still agree — the average spin stays nonzero even as the lattice grows infinitely large. Its absence means the two orientations are perfectly balanced and any local alignment dies out with distance.
- **Phase transition and critical temperature** — A temperature T_c at which a system's qualitative behaviour changes discontinuously: here, ordered (magnetised) below T_c, disordered above it. 'No phase transition' means the behaviour is the same at every positive temperature.
- **Domain wall / contour** — The boundary between a region of up spins and a region of down spins. In a 1D chain it is a single bond where the sign flips; in a 2D square lattice it is a closed curve drawn on the dual lattice, cutting every bond whose two spins disagree.
- **Asymptotic bookkeeping (which term wins)** — Comparing how quantities grow with a parameter rather than their exact values: a constant loses to log N as N grows, while two quantities both linear in L compete on their coefficients only. This 'who dominates' reflex is the whole technical content ahead.
- **NP-hard** — A computational problem at least as hard as every problem in NP: a polynomial-time algorithm for it would give one for all of them (so, by universal expectation, none exists). It is the standard formal certificate that a problem is intractable in general.
- **Ground state** — The configuration of lowest total energy — for a general Ising system with mixed-sign couplings J_ij, the assignment of ±1 to every spin that best satisfies the conflicting neighbour preferences.

## Delivery
```json
{
  "hook": "In 1925 a young physicist proved a theorem about his own model, drew the only honest conclusion — that the model was useless — published nothing further on it, and went off to teach schoolchildren. His theorem was correct. His conclusion was wrong, and the gap between them is a single line of counting.",
  "beats": [
    {
      "label": "The commission",
      "content": "Wilhelm Lenz, in Hamburg, had proposed in 1920 the crudest imaginable model of a magnet: put a magnetic arrow on each site of a lattice, allow it only two states, up or down, and let each neighbouring pair of arrows contribute energy −J·s_i·s_j, so that agreeing neighbours are cheaper than disagreeing ones by 2J. Nothing else. The question handed to his doctoral student Ernst Ising was the one that mattered: does such a thing become a permanent magnet? That is, at some temperature above absolute zero, will a large lattice spontaneously choose a majority direction and keep it — long-range order with no external field — or will thermal noise always balance up against down?"
    },
    {
      "label": "The proof that killed it",
      "content": "Ising did the one-dimensional case: N spins on a line. In the lowest-energy state all spins agree; energy −J(N−1). Now flip everything from some point onward. That creates exactly one domain wall — one bond whose two spins disagree — and it costs energy 2J, no matter where you put it and no matter how large N is. That is the crucial fact: in one dimension the price of a defect is a constant. What does the defect buy? There are N−1 bonds where the wall could sit, so the wall carries entropy k·log(N−1). The free-energy change is ΔF = 2J − kT·log(N−1). Fix any temperature T > 0 you like, then make the chain long enough: log(N−1) grows without bound, the second term overwhelms the fixed 2J, and ΔF goes negative. Inserting walls always lowers the free energy. Nor is one wall the end of it: with n walls the cost is 2Jn while the entropy is k·log C(N−1, n), and minimising 2Jn − kT·log C(N−1,n) gives a nonzero optimal density of walls, roughly one wall every e^{2J/kT} sites. So the chain breaks into domains of finite typical length; the correlation between distant spins decays exponentially; the average magnetization of an infinite chain is exactly zero at every positive temperature. There is no phase transition. Ising's theorem is airtight and remains true today."
    },
    {
      "label": "The wrong conclusion, honestly drawn",
      "content": "Real iron does become a permanent magnet, at a very definite temperature — 770 °C. Ising had a model that never magnetises at any temperature. He also argued, in his thesis, that the same conclusion should extend to three dimensions, and drew the conclusion any careful person draws when a model contradicts the world: the model is wrong, presumably because two-state arrows with only nearest-neighbour interactions cannot capture real magnetism. He published his thesis result in Zeitschrift für Physik in 1925, wrote nothing more on the subject, and went into teaching. As a Jew in Germany he was pushed out of even that; by 1939 he had fled, and after the war he ended up a physics teacher and then professor at Bradley University in Illinois, in no sense a research career. His name, meanwhile, was quietly detaching itself from him."
    },
    {
      "label": "Where the proof secretly leaned on the line",
      "content": "Look again at what made the 1D argument work — not the physics, the geometry. A domain wall in one dimension is a point: a single bond. Its energy cost, 2J, does not grow when the system grows. That is why a merely logarithmic entropy could beat it: a constant always loses to log N eventually. Now go to a square lattice. A region of down spins inside a sea of up spins is bounded by a closed curve on the dual lattice, and every bond that curve crosses is a disagreeing pair. If the curve has length L, the energy cost is 2J·L. The cost is no longer a constant — it scales with the size of the defect. The wall has become an object of dimension one instead of dimension zero, and that changes what it has to be paid."
    },
    {
      "label": "Peierls's count, 1936",
      "content": "Rudolf Peierls turned that observation into a proof of the opposite conclusion. Take a large square lattice with all boundary spins held up, and ask: what is the probability that the spin at the origin is down? If it is down, it must be surrounded by at least one closed contour separating it from the up boundary. So the probability is at most the sum, over all closed contours γ encircling the origin, of the Boltzmann weight for having that contour, which is at most e^{−2βJ·|γ|} where |γ| is its length. Now count contours of length L that encircle the origin. Such a contour must cross the positive x-axis at a point no further out than L/2, so there are at most about L/2 places to start; from each step, the walk has at most 3 continuations (it cannot immediately reverse); so the number of such contours is at most about (L/2)·3^L. Hence P(origin down) ≤ Σ_L (L/2)·3^L·e^{−2βJL} = Σ_L (L/2)·(3e^{−2βJ})^L. This geometric-type series converges as soon as 3e^{−2βJ} < 1, and by taking β large enough — that is, T small enough — its total can be made smaller than 1/2, uniformly in the size of the lattice. Fewer than half the spins can be down, no matter how large the system grows: the magnetization stays positive. Order survives."
    },
    {
      "label": "The bookkeeping, side by side",
      "content": "Strip both arguments to their skeletons and the reversal is one line of asymptotics. In 1D: energy cost of a defect = 2J, a constant; entropy gained ≈ k·log N, unbounded. Constant loses to log N, so at every T > 0 disorder wins, always. In 2D: energy cost of a defect of size L = 2J·L; entropy available is at most k·log(L·3^L) ≈ k·L·log 3 plus lower-order terms — also linear in L. When both sides scale the same way, the fight is decided by coefficients, not by growth: order wins whenever 2J > kT·log 3, i.e. below a temperature of order 2J/(k·log 3). A finite, nonzero critical temperature exists. Nothing about the physics changed between the two calculations; only the dimension of the boundary of a defect changed, and with it whether the energy term is a constant or a rival that grows just as fast as the entropy. (The Peierls bound is only a bound: Onsager's exact 1944 solution of the 2D model gives the true critical point, sinh(2J/kT_c) = 1, i.e. kT_c/J = 2/ln(1+√2) ≈ 2.269 — comfortably above the crude bound, exactly as a one-sided estimate should be.)"
    },
    {
      "label": "The letter he never got",
      "content": "By 1944 the two-dimensional Ising model had an exact solution and had become the canonical example of a phase transition — the first non-trivial interacting system whose critical behaviour could be computed rather than guessed, and eventually the training ground for renormalisation, universality, and critical exponents. Ising, teaching in Illinois, was not part of any of it. According to historical accounts of his life, it was around 1949 that he learned, by reading the literature, that the thing he had abandoned twenty-four years earlier as a failed model now carried his name through thousands of papers. He lived to 1998, aged 98, long enough to see the model become one of the most-studied objects in all of physics."
    },
    {
      "label": "The final irony",
      "content": "Ising's stated reason for dropping the model was that it was too crude to be interesting. The modern verdict is the reverse: it is expressive enough to be intractable. Allow the couplings to differ in sign and strength from bond to bond — a spin glass, energy −Σ J_ij s_i s_j — and simply finding the lowest-energy configuration on a three-dimensional lattice is NP-hard (Barahona, 1982), because it encodes maximum cut in a graph. So the model is not a failed description of iron; it is a general-purpose language for hard combinatorial optimisation, which is precisely why so much computing hardware and so many algorithms today are built to phrase their problems as 'find the ground state of an Ising model'. The object he thought too simple to say anything is now a universal container for problems nobody can solve efficiently."
    }
  ],
  "the_reveal": "Ising's argument never used the physics of magnetism — it used the fact that in a line a defect costs a constant, and in a plane it costs its own length, which is exactly why the same energy-versus-entropy ledger says 'never' in 1D and 'below T_c' in 2D.",
  "lingering": "His theorem was correct and his inference was wrong for a reason invisible from inside the calculation — the dimension entered only through the geometry of a defect's boundary. How many results are like that today: right in every line, and quietly conditional on an assumption nobody noticed they were making?"
}
```

**The turn:** The proof that killed the model was correct — it just secretly depended on the dimension, because a defect in a chain costs a fixed energy while a defect in a plane costs its own perimeter, and only the second can outrun entropy.

**Narrator notes:** Let Ising's 1D proof land as genuinely convincing before touching dimension — the reader should feel the model is dead. The pivot line is geometric, not physical: a wall in a line is a point, a wall in a plane is a curve. Slow down hard on the parallel ledger in beats 6–7; that comparison ('constant vs log N' losing, 'linear vs linear' competing on coefficients) is the entire insight and should be spoken as bookkeeping, not as physics. Keep the biography restrained — no invented emotions, 'reportedly around 1949' — and save the NP-hardness as a dry final twist of the knife.

## Evolving diagram (9 beats)
- **step 1** — shows: A horizontal row of ~14 up arrows on a line of sites, labelled '1D chain, all aligned, E = −J(N−1)'.  
  _change:_ initial
- **step 2** — shows: Same chain with all arrows from the middle onward flipped down; the single bond where the sign changes is marked with a vertical red bar labelled 'wall: ΔE = 2J (constant)'.  
  _change:_ Right half of arrows flipped; one wall marker and its energy label added.
- **step 3** — shows: Faint ghost copies of the wall marker at every one of the N−1 bonds, annotated 'N−1 places → ΔS = k log(N−1)', with a ledger box below: 'ΔF = 2J − kT log(N−1) < 0 for large N ⇒ no order at any T > 0'.  
  _change:_ Ghosted wall positions plus the first ledger box appended.
- **step 4** — shows: The chain slides to the top as a small banner; below it a 2D square lattice of up arrows appears with a compact patch of down arrows in the interior.  
  _change:_ 1D chain demoted to a banner; 2D lattice with a down-spin patch introduced.
- **step 5** — shows: A closed contour drawn on the dual lattice around the down patch, its length annotated '|γ| = L', with label 'ΔE = 2J·L (grows with L)'.  
  _change:_ Domain-wall contour and length-proportional energy label drawn over the patch.
- **step 6** — shows: A zoom inset on one step of the contour showing three permitted continuations and one crossed-out reversal, labelled '≤ 3 choices per step ⇒ #contours ≲ (L/2)·3^L ⇒ ΔS ≲ kL log 3'.  
  _change:_ Counting inset added beside the contour.
- **step 7** — shows: Second ledger box beside the first: 'P(origin down) ≤ Σ_L (L/2)(3e^{−2βJ})^L < 1/2 for small T', with the two ledgers aligned: '2J vs kT log N' above, '2J·L vs kT·L log 3' below.  
  _change:_ Peierls sum added and the two ledgers set in explicit parallel.
- **step 8** — shows: A temperature axis under the lattice with an ordered region shaded up to a marked point kT_c/J = 2/ln(1+√2) ≈ 2.269 (Onsager), disordered beyond.  
  _change:_ Temperature axis with the exact critical point appended.
- **step 9** — shows: The 2D lattice thickens into a small 3D cube of spins with mixed-sign ± couplings drawn on the bonds, stamped 'ground state: NP-hard (Barahona 1982)'.  
  _change:_ Lattice extruded to 3D, couplings given random signs, complexity stamp added.