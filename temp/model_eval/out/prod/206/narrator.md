# What has to happen before two same-coloured blocks touch?

Since our entire goal is to track lifetimes, and lifetimes only ever grow through fusion, we have to interrogate fusion directly. When exactly *do* two blocks of the same color finally meet?

Look at the board. We have a blue block on the left with lifetime $x=4$, and a blue block on the right with lifetime $z=5$. Right now, they can't fuse because that red block is in the way. For the two blue blocks to touch, every single block strictly between them has to completely vanish.

When does that happen? Exactly at second $y$, where $y$ is the maximum lifetime among all those in-between blocks. In our case, the obstacle clears at $y=2$.

But here is the catch: do they *always* get to meet? What if that red block had a lifetime of 10? By the time second 10 rolls around, both blue blocks would have been dead for seconds. They would die waiting. 

For a meeting to actually happen, the time it takes to clear the middle ($y$) must be strictly less than the lifespans of the two blocks waiting to fuse. If $y$ is larger than or equal to either $x$ or $z$, one of the candidates dies before the path clears, and they never get a partner. 

So the ironclad condition for a fusion is that the 'obstacle' lifetime $y$ is below both $x$ and $z$. But if they do survive to meet at second $y$, what happens next?

---
**Blackboard:** keep the three abstract blocks (blue l=4, red l=2, blue l=5). draw an arrow pointing down to a new state at 'second y=2': the red block is drawn with a dashed outline vanishing (labeled 'obstacle clears'), and the two blue blocks are shown sliding together to touch. annotate this meeting with the condition 'y < min(x, z)'.
