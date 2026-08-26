**Mode:** teach

## Prerequisites

* **Deterministic Finite Automaton (DFA):** A theoretical state machine that reads a string of characters one by one. Based on the input, it hops from state to state, ultimately landing in an "accept" or "reject" state. It defines a specific language of valid strings.
* **Regular Expressions (Regex):** A sequence of symbols that describes a text pattern using three basic tools: concatenation (putting strings back-to-back), union (an OR choice, written as `|`), and the Kleene star (repeating a pattern zero or more times, written as `*`). 
* **Floyd-Warshall Algorithm:** A classic dynamic programming algorithm that finds the shortest distance between *all* pairs of nodes in a graph. It works by systematically checking if routing a path through a new intermediate node is shorter than the best known path.
* **Semiring:** A mathematical structure that takes a set of values and gives them two operations—usually called "addition" and "multiplication." These operations follow familiar rules (like multiplication distributing over addition), even if the operations themselves aren't standard numbers and standard arithmetic.

***

If you want to find the shortest route for a delivery truck navigating a city grid, you use a graph algorithm. If you want to extract a regular expression from a state machine to validate email addresses, you use an automata algorithm. 

These seem like fundamentally completely different tasks. One calculates a number (minimum distance). The other builds a string (a pattern of characters). But beneath the surface, they are not just similar algorithms. They are the *exact same* dynamic programming algorithm, wearing two different disguises.

To see why, we have to look at how we solve both problems by building up answers step-by-step using intermediate stops.

### The Graph Problem: Floyd-Warshall
Imagine a graph with nodes numbered $1$ to $N$. You want the shortest path from node $i$ to node $j$. 

The Floyd-Warshall algorithm figures this out by slowly expanding the list of nodes you are "allowed" to pass through. At step $k$, it asks: *If I am only allowed to use nodes $1$ through $k$ as intermediate stops, what is the shortest path from $i$ to $j$?*

To answer this, it looks at the previous step (where you were only allowed to use nodes up to $k-1$) and makes a simple choice. The best path using nodes up to $k$ is whichever of these two is shorter:
1. The old shortest path from $i$ to $j$ that doesn't use node $k$ at all.
2. A new path that goes from $i$ to $k$, and then from $k$ to $j$.

Mathematically, if $D$ is distance, this gives us the famous updating equation:
$$D_{ij}^{(k)} = \min \left( D_{ij}^{(k-1)}, \; D_{ik}^{(k-1)} + D_{kj}^{(k-1)} \right)$$

### The Automata Problem: Kleene's Algorithm
Now, imagine a state machine (a DFA) with states numbered $1$ to $N$. As you travel along the edges, you read characters. You want a regular expression that describes all possible strings that get you from state $i$ to state $j$.

Kleene's algorithm (specifically the McNaughton-Yamada construction) figures this out the exact same way. At step $k$, it asks: *If I am only allowed to pass through states $1$ through $k$, what is the regular expression for getting from $i$ to $j$?*

To answer this, it looks at the previous step and makes a choice. The valid strings using states up to $k$ are either:
1. The old strings from $i$ to $j$ that don't pass through state $k$ at all.
2. OR (`|`), a string that goes from $i$ to $k$, then possibly loops from $k$ back to $k$ zero or more times (`*`), and then finally goes from $k$ to $j$.

Mathematically, if $R$ is a regular expression, the updating equation is:
$$R_{ij}^{(k)} = R_{ij}^{(k-1)} \;\mid\; \left( R_{ik}^{(k-1)} \cdot \left( R_{kk}^{(k-1)} \right)^* \cdot R_{kj}^{(k-1)} \right)$$

### The Isomorphism: Swapping the Algebra
Look at those two equations side by side. They are incredibly close. Both follow a pattern of taking an old value, combining it with a new split path, and saving the result. 

But Kleene's regex equation has a piece in the middle that Floyd-Warshall seems to be missing: the loop $\left( R_{kk}^{(k-1)} \right)^*$. Why does the string-parsing algorithm care about looping on the intermediate node $k$, while the shortest-path algorithm ignores it?

The mind-bending answer is that **Floyd-Warshall doesn't ignore the loop. It computes it, but the result is mathematically invisible.**

To prove this, we can zoom out to a generalized mathematical universe called a **Semiring**. A semiring gives us a generalized "addition" operator $\oplus$ for making choices, and a generalized "multiplication" operator $\otimes$ for combining sequences. It also gives us a generalized "Kleene star" operator $x^*$, which means "combining $x$ with itself zero or more times, and aggregating all those possibilities with $\oplus$."

Let's define the ultimate, generalized update equation for moving through any network:
$$X_{ij}^{(k)} = X_{ij}^{(k-1)} \;\oplus\; \left( X_{ik}^{(k-1)} \otimes \left( X_{kk}^{(k-1)} \right)^* \otimes X_{kj}^{(k-1)} \right)$$

Now, let's plug in two different sets of rules for our algebra.

**Universe 1: The Language Semiring (Regex)**
* **Values:** Sets of text strings.
* **Addition ($\oplus$):** Union / OR (`|`). We make a choice between two patterns.
* **Multiplication ($\otimes$):** Concatenation (`.`). We stick two strings back-to-back.
* **Star ($x^*$):** The classic Kleene star (`*`). Repeat a string zero or more times.

Plug these operators into our master equation, and you instantly get Kleene's exact algorithm for regular expressions. 

**Universe 2: The Tropical Semiring (Shortest Paths)**
* **Values:** Distances (real numbers and infinity).
* **Addition ($\oplus$):** Minimum (`min`). The "choice" we make is strictly picking the shortest route.
* **Multiplication ($\otimes$):** Standard addition (`+`). When we combine two paths end-to-end, we add their distances.
* **Star ($x^*$):** What does the star mean here? It means repeating a loop of distance $x$ zero or more times, and taking the minimum of all those options. So, $\min(0, x, x+x, x+x+x, \dots)$. Assuming we don't have negative distances, the minimum cost of looping any number of times is always to loop *zero* times. The cost of doing nothing is $0$. Therefore, in this universe, **$x^* = 0$**.

Now, plug *these* operators into the exact same master equation:
$$X_{ij}^{(k)} = \min \left( X_{ij}^{(k-1)}, \; X_{ik}^{(k-1)} + 0 + X_{kj}^{(k-1)} \right)$$

Because adding 0 does nothing, the middle term perfectly vanishes. We are left with:
$$X_{ij}^{(k)} = \min \left( X_{ij}^{(k-1)}, \; X_{ik}^{(k-1)} + X_{kj}^{(k-1)} \right)$$

This is precisely the Floyd-Warshall algorithm. 

This underlying structure is called the **Algebraic Path Problem**. It proves that finding a minimum distance and building a regular expression are fundamentally the exact same computational act. The logic of how to combine paths through a network never changes. All that changes is the algebra you use to evaluate those paths at the very end. By merely swapping the 'min-plus' algebra of distances for the 'OR-concatenate' algebra of strings, a classic graph-routing algorithm instantly transforms into a string-parsing algorithm. 

A regular expression is literally just the algebraic shortest path through a language.