# Four Spaces, Two Homes

Now let's put these four spaces into one picture. We met them separately, but they describe a single machine:
$$A:\mathbb{R}^n\longrightarrow\mathbb{R}^m.$$

Look at the two sides of the board. **On the input side**, we have the row space and nullspace, with dimensions $r$ and $n-r$. **On the output side**, we have the column space and left nullspace, with dimensions $r$ and $m-r$.

The natural geometric pairing isn't column space with nullspace—even though we first studied those together. They might not even live in the same ambient space!

And there's more than dimension bookkeeping here. Write the rows of $A$ as $a_1^T,\ldots,a_m^T$. Then
$$Ax=0\quad\Longleftrightarrow\quad a_i^Tx=0\text{ for every }i.$$
Each expression $a_i^Tx$ is a dot product. So a nullspace vector is perpendicular to every row—and therefore to every linear combination of rows. Conversely, being perpendicular to the entire row space makes every entry of $Ax$ zero.

**The nullspace is exactly the set of vectors perpendicular to the row space.** Applying the same reasoning to $A^T$, the left nullspace is exactly the set perpendicular to the column space.

Four algebraic definitions have become two perpendicular pairs. Beautiful: the equations were quietly describing geometry all along.

But what does multiplication by $A$ actually *do* to these paired spaces?

---
**Blackboard:** draw a schematic with two large outlined boxes side by side, explicitly labeled 'input space: r^n' and 'output space: r^m'. center an arrow labeled 'x maps to ax' from the input box to the output box. inside the input box, place two cards: 'row space c(a^t), dimension r' above 'nullspace n(a), dimension n-r'. between these cards put a perpendicular symbol and the text 'every vector in one is perpendicular to every vector in the other'. inside the output box use matching cards: 'column space c(a), dimension r' and 'left nullspace n(a^t), dimension m-r', with the same perpendicular symbol and explanation. color the row-space and column-space cards blue, and the two nullspace cards orange. below the input box write 'ax = 0 iff x is perpendicular to every row'. below the output box write 'a^t y = 0 iff y is perpendicular to every column'. these are organizational boxes, not coordinate plots; do not depict the subspaces as planes or imply that the overall mapping is invertible.
