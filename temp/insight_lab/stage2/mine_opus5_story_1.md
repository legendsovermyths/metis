# [opus5] (story) The Model Its Author Disowned

## Insight
Ernst Ising's 1925 thesis proved that his lattice of interacting spins has no magnetism at any positive temperature — and he concluded the model was simply wrong, published nothing more on it, and left research to teach high school. He was right about the line and wrong about the world: his own counting argument breaks in two dimensions, because a defect in a 1D chain costs a fixed energy but buys ~log N entropy (disorder always wins), while in 2D a domain wall costs energy proportional to its *length* and entropy only pays about length × log 3 per unit — so below a critical temperature, order survives. Peierls made that argument in 1936, Onsager solved the 2D model exactly in 1944, and Ising reportedly discovered around 1949, by reading the literature, that his abandoned failure had become one of the most-studied objects in physics. The final irony: finding ground states of the 3D version is NP-hard, so the model he thought too simple to be interesting is now a standard vehicle for encoding intractable problems.

- **The turn:** The proof that killed the model was correct — it just secretly depended on the dimension, and the same energy-vs-entropy bookkeeping that says 'never' in a line says 'yes' in a plane.
- **Domain:** Statistical mechanics / history of physics
- **Taste match:** It is a human story whose punchline is a clean combinatorial counting argument — entropy as a logarithm of configuration counts, weighed against a linear energy cost — plus an NP-hardness kicker that lands for someone who reads Erickson.
- **Level fit:** Requires no partition-function machinery: the Peierls argument reduces to comparing log(number of walls) against wall length, exactly the kind of asymptotic bookkeeping Concrete Mathematics trains, while the physics content stays narrative.
- **Grounding:** Ising, Zeitschrift für Physik 31 (1925) — no spontaneous magnetization in the 1D Ising model; Peierls (1936) contour/domain-wall argument for long-range order in 2D; Onsager (1944) exact solution of the 2D Ising model with Tc; Barahona (1982), 'On the computational complexity of Ising spin glass models' — NP-hardness of ground states for 3D lattices. Ising's late discovery of his model's fame is recorded in historical accounts (e.g., Kobe, 'Ernst Ising 1900–1998').
- **Form hint:** story — the emotional beat is a man abandoning his own idea as a failure, and the physics only lands once you feel that reversal.

<details><summary>raw json</summary>

```json
{
  "title": "The Model Its Author Disowned",
  "insight": "Ernst Ising's 1925 thesis proved that his lattice of interacting spins has no magnetism at any positive temperature — and he concluded the model was simply wrong, published nothing more on it, and left research to teach high school. He was right about the line and wrong about the world: his own counting argument breaks in two dimensions, because a defect in a 1D chain costs a fixed energy but buys ~log N entropy (disorder always wins), while in 2D a domain wall costs energy proportional to its *length* and entropy only pays about length × log 3 per unit — so below a critical temperature, order survives. Peierls made that argument in 1936, Onsager solved the 2D model exactly in 1944, and Ising reportedly discovered around 1949, by reading the literature, that his abandoned failure had become one of the most-studied objects in physics. The final irony: finding ground states of the 3D version is NP-hard, so the model he thought too simple to be interesting is now a standard vehicle for encoding intractable problems.",
  "the_turn": "The proof that killed the model was correct — it just secretly depended on the dimension, and the same energy-vs-entropy bookkeeping that says 'never' in a line says 'yes' in a plane.",
  "domain": "Statistical mechanics / history of physics",
  "taste_match": "It is a human story whose punchline is a clean combinatorial counting argument — entropy as a logarithm of configuration counts, weighed against a linear energy cost — plus an NP-hardness kicker that lands for someone who reads Erickson.",
  "level_fit": "Requires no partition-function machinery: the Peierls argument reduces to comparing log(number of walls) against wall length, exactly the kind of asymptotic bookkeeping Concrete Mathematics trains, while the physics content stays narrative.",
  "grounding": "Ising, Zeitschrift für Physik 31 (1925) — no spontaneous magnetization in the 1D Ising model; Peierls (1936) contour/domain-wall argument for long-range order in 2D; Onsager (1944) exact solution of the 2D Ising model with Tc; Barahona (1982), 'On the computational complexity of Ising spin glass models' — NP-hardness of ground states for 3D lattices. Ising's late discovery of his model's fame is recorded in historical accounts (e.g., Kobe, 'Ernst Ising 1900–1998').",
  "form_hint": "story — the emotional beat is a man abandoning his own idea as a failure, and the physics only lands once you feel that reversal."
}
```
</details>