# What must that overtaking move look like?

We know Elsie just needs one successful leap. But if we are going to look for it, we need to know what it actually looks like. What tools does she have to make it?

Let's test the obvious one first. Suppose she tries to close the distance using a main bridge, stepping from $u$ to $u+1$. Remember the turn order: Bessie moves first. If Elsie is currently behind Bessie, she is at some position $u < \text{Bessie}$. When Elsie takes a main bridge, she advances by exactly one island. But Bessie *also* advances by one island. You can't close a gap if you're both moving at the exact same speed. 

Even worse, what if Elsie is exactly one step behind Bessie and tries to use a main bridge? She lands on the island Bessie is currently standing on. And what do the rules say about sharing an island? The cow who is already there eliminates the cow who just arrived. It's suicide.

So a main bridge can *never* be the overtaking move. The fatal leap has to be a single alternative bridge. 

Do you see how this strips away all the messy routing? The anatomy of Elsie's game plan is shockingly simple: she must race as fast as humanly possible to the tail of some alternative bridge, and then fire herself out of a cannon to its head. Everything before the jump is just a sprint to the launchpad.

---
**Blackboard:** draw a number line of islands. place elsie at 'u' and bessie at 'b' (where u < b). draw a small red arrow from u to u+1 with a cross through it, labeled 'same speed / suicide'. then draw a large sweeping green arc from u to some 'v' far to the right (where v > b). label u 'launchpad' and the arc 'the overtake'.
