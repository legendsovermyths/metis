# Is discarding the shadowed blocks the whole rule?

Let's stress-test this beautiful rule on the third sample. Suppose we've processed a few pairs and our stack currently has a block of 9 zeros, then 1 one. So, `(color: 0, lifetime: 9)` on the bottom, `(color: 1, lifetime: 1)` on top. Now, a new block of 2 zeros arrives. $L = 2$.

If we strictly follow our rule—'only pop what is smaller or equal to $L$'—what happens? The new 2-block pops the `(1, 1)`, setting our obstacle $y = 1$. The next block down is `(0, 9)`. Since $9 > 2$, our rule tells us to stop. We'd push the 2-block, check the bottom of the stack, and report a maximum lifetime of 9.

Check the problem statement. The true answer is 10. We missed a fusion. Why?

Look at the colors. The 9-block and the 2-block are both zeros. The obstacle between them died at $y=1$. The path is clear! It doesn't matter that 9 outlives 2; they still touch. Let's run the formula we just built: $x=9, z=2, y=1$. They fuse into $9 + 2 - 1 = 10$.

This is the final piece of the puzzle. If the top of the stack shares our new block's color, we *must* fuse with it, even if it outlives us. And notice the domino effect: our new block's lifetime just spiked from 2 to 10. Because it grew, it might now overshadow even deeper blocks, so we must keep checking the new top of the stack. Finally, since these blocks just fused into one solid run of zeros, there are no obstacles between them anymore—so our obstacle counter $y$ resets to 0.

---
**Blackboard:** draw a stack with two blocks: a large blue block at the bottom labeled '(color: 0, lifetime: 9)' and a thin red block on top labeled '(color: 1, lifetime: 1)'. show a new blue block arriving: '(color: 0, lifetime: 2)'. cross out the red block, label it 'y = 1'. draw a bright arrow merging the top and bottom blue blocks, overriding the size check, with a formula bubble: '9 + 2 - 1 = 10'. write 'y resets to 0' next to the newly merged giant block.
