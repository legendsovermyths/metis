# What must the overtaking move look like?

Now that one successful overtake settles the race, let's zoom in on that exact move. What kind of bridge could possibly produce it?

Freeze the board just after Bessie has moved, immediately before Elsie's first overtake. Say Bessie is at $b$ and Elsie is still behind her at $u<b$. If Elsie takes a main bridge, she lands at $u+1$. But these are integer indices, so

$$u+1\le b.$$

One ordinary step cannot carry her past Bessie. Even landing exactly at $b$ would not rescue her: Bessie moves next, collapses their shared island, and eliminates Elsie. We need **strictly beyond**, not a tie.

So the decisive move must use an **alternative bridge** $u\to v$ that jumps across Bessie's current position. Look at the long arrow on the board: that's the event we're hunting.

This gives us a useful way to split Elsie's route: a preparation phase that reaches the bridge's tail $u$, followed by the overtaking jump. The preparation may itself use alternative bridges; we're not restricting her to one shortcut overall. But for a fixed final bridge, reaching its tail sooner gives Bessie less time to advance. Our next question is therefore: *how early can Elsie legally get to that tail?*

---
**Blackboard:** clear the previous board. draw nine island circles in a horizontal row, labeled 1 through 9, with small gray rightward main-bridge arrows between consecutive circles. place a blue elsie marker on island 2 and an orange bessie marker on island 6. label the scene 'immediately before elsie moves'. highlight the main bridge 2→3 in blue and label it 'still behind'. draw a large green curved alternative-bridge arrow from island 2 to island 8, passing above island 6, labeled 'possible first overtake'. below the row, write 'general positions: elsie at u < b, bessie at b' and then 'main bridge: u → u+1 ≤ b — never strictly ahead'. under that, write 'equality is fatal: bessie leaves next and collapses the shared island'. at the bottom, draw two connected boxes labeled 'reach tail u as early as legally possible' and 'jump u → v with v > b'.
