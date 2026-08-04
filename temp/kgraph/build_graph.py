"""Atlas prototype — objective-based knowledge graph.

Two modes, one engine:
  paper mode:  python build_graph.py <paper.pdf>   (summit = the paper)
  goal  mode:  python build_graph.py goal          (summit = a capability goal)

The atom is a READING (a chapter or a paper) — the unit a journey consumes.
Edit OBJECTIVE / GOAL / PROFILE below to match what you're testing.
Output: temp/kgraph/out/{atlas.json, atlas.mmd, atlas.txt}
"""
import json
import re
import sys
from collections import deque
from pathlib import Path

import prompts
from llm import Gemini

# ---------------------------------------------------------------- CONFIG
OBJECTIVE = (
    "Understand this paper end to end — what problem it solves, how its method works, "
    "and why the method is designed the way it is — well enough to explain it to a peer."
)

GOAL = (
    "Become capable of building a small language model from scratch in Rust — no ML "
    "frameworks, implemented myself all the way down to the tensor math. The target is a "
    "compact transformer-based next-token language model, trained on a small text corpus "
    "on a single machine, capable enough to form basic grammatical sentences: greet "
    "people, complete simple sentences, and do light grammar correction. I want to "
    "understand every layer well enough to implement it in Rust myself: text tokenization "
    "(a simple byte-pair-encoding or character/word vocabulary), token and positional "
    "embeddings, the transformer decoder block (self-attention, multi-head attention, "
    "feed-forward layers, layer normalization, residual connections), the language-"
    "modeling head with cross-entropy loss, reverse-mode automatic differentiation / "
    "backpropagation and the gradients of these operations, a training loop with an "
    "optimizer (SGD / Adam), and autoregressive text generation with sampling (greedy, "
    "temperature, top-k). Small / educational scale only on modest data — explicitly NOT "
    "large-scale or distributed training, GPU kernel programming, pretraining at scale, "
    "or RLHF / fine-tuning."
)

PROFILE = (
    "Working software engineer, fluent in Rust and systems programming, comfortable with "
    "data structures and algorithms at the level of a solid CS degree. Remembers early-"
    "university linear algebra (vectors, matrices, matrix multiplication) and single-"
    "variable calculus (derivatives, the chain rule) but is rusty, and has never worked "
    "with matrix / multivariable calculus. No background in machine learning, deep "
    "learning, neural networks, or probability beyond the basics."
)

MAX_DEPTH = 5          # layers below the summit
MAX_NODES = 60         # hard safety cap on total nodes
MAX_PREREQS = 3        # per backward step (also enforced in the prompt)
# ------------------------------------------------------------------------

g = Gemini()


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


class Node:
    __slots__ = (
        "id", "work", "locator", "kind", "competency", "concepts", "why",
        "depth", "is_start", "node_kind", "prereq_ids",
    )

    def __init__(self, nid, work, locator, kind, concepts, why, depth, node_kind, competency=""):
        self.id = nid
        self.work = work
        self.locator = locator
        self.kind = kind              # "chapter" | "paper" | "goal"
        self.competency = competency
        self.concepts = concepts or []
        self.why = why
        self.depth = depth
        self.is_start = False
        self.node_kind = node_kind    # "summit" | "target" | "prereq"
        self.prereq_ids = []

    @property
    def label(self) -> str:
        if self.kind == "goal":
            return self.work
        return f"{self.work} — {self.locator}"

    @property
    def struct_key(self) -> str:
        # For a book chapter, collapse any subsection to its chapter number so
        # "Chapter 5" and "Section 5.5" of the same work are one reading.
        if self.kind == "chapter":
            m = re.search(r"\d+", self.locator)
            if m:
                return norm(self.work) + "|ch" + m.group(0)
        return norm(self.work) + "|" + norm(self.locator)


class Atlas:
    def __init__(self):
        self.nodes: dict[str, Node] = {}
        self._struct: dict[str, str] = {}   # struct_key -> node id
        self._next = 0

    def _add(self, work, locator, kind, concepts, why, depth, node_kind, competency="") -> Node:
        nid = f"n{self._next}"
        self._next += 1
        node = Node(nid, work, locator, kind, concepts, why, depth, node_kind, competency)
        self.nodes[nid] = node
        self._struct[node.struct_key] = nid
        return node

    @staticmethod
    def _absorb(node: Node, concepts: list[str]) -> None:
        node.concepts = list(dict.fromkeys(node.concepts + (concepts or [])))

    def _semantic_match(self, candidate: Node) -> str | None:
        if not self.nodes:
            return None
        items = [n for n in self.nodes.values() if n.kind != "goal"]
        if not items:
            return None
        listing = "\n".join(
            f"{i}. {n.label}  (covers: {', '.join(n.concepts) or '—'})"
            for i, n in enumerate(items)
        )
        cand = f"{candidate.label}  (covers: {', '.join(candidate.concepts) or '—'})"
        try:
            res = g.generate_json(prompts.IDENTITY_MATCH.format(existing=listing, candidate=cand))
            idx = int(res.get("match_index", -1))
        except Exception as e:
            print(f"    ! semantic dedup failed ({e}); treating as new")
            return None
        return items[idx].id if 0 <= idx < len(items) else None

    def resolve(self, work, locator, kind, concepts, why, depth, node_kind, competency=""):
        """Return (node, is_new). Dedup: structural on (work,locator), then semantic."""
        probe = Node("_", work, locator, kind, concepts, why, depth, node_kind, competency)

        hit = self._struct.get(probe.struct_key)
        if hit:
            self._absorb(self.nodes[hit], concepts)
            return self.nodes[hit], False

        sem = self._semantic_match(probe)
        if sem:
            self._struct[probe.struct_key] = sem   # alias so future identical readings hit fast
            self._absorb(self.nodes[sem], concepts)
            return self.nodes[sem], False

        node = self._add(work, locator, kind, concepts, why, depth, node_kind, competency)
        return node, True


def backward_chain(atlas: Atlas, frontier: deque, objective: str) -> None:
    print("\n→ backward-chaining prerequisite readings …")
    while frontier:
        if len(atlas.nodes) >= MAX_NODES:
            print(f"   ! hit MAX_NODES ({MAX_NODES}); stopping expansion")
            break
        node = frontier.popleft()
        if node.depth >= MAX_DEPTH:
            node.is_start = True
            continue

        try:
            step = g.generate_json(
                prompts.BACKWARD_STEP.format(
                    objective=objective, profile=PROFILE, reading=node.label,
                    concepts=", ".join(node.concepts) or "—", why=node.why,
                )
            )
        except Exception as e:
            print(f"   ! backward step failed for '{node.label}' ({e})")
            node.is_start = True
            continue

        prereqs = step.get("prerequisites", [])[:MAX_PREREQS]
        if step.get("is_start") or not prereqs:
            node.is_start = True
            print(f"   ⌂ start: {node.label}")
            continue

        for p in prereqs:
            child, is_new = atlas.resolve(
                p["work"], p["locator"], p.get("kind", "chapter"),
                p.get("concepts", []), p.get("why_needed", ""), node.depth + 1, "prereq",
            )
            if child.id != node.id and child.id not in node.prereq_ids:
                node.prereq_ids.append(child.id)
            if is_new:
                frontier.append(child)
                print(f"   ↳ {node.label}  ⇐  {child.label}")
            else:
                child.depth = max(child.depth, node.depth + 1)
                print(f"   ↺ merge: {child.label}  (reused)")


def build_from_paper(paper_path: str) -> tuple[Atlas, str, str]:
    atlas = Atlas()
    print("→ extracting target readings from the paper …")
    res = g.generate_json(
        prompts.TARGET_READINGS.format(objective=OBJECTIVE, profile=PROFILE),
        system=prompts.SYSTEM, pdf_path=paper_path,
    )
    work_title = res.get("work_title", "The paper")
    summit = atlas._add(work_title, "the paper", "paper", [], OBJECTIVE, 0, "summit")

    readings = res.get("readings", [])
    print(f"   summit: {work_title}\n   got {len(readings)} target readings:")
    frontier: deque[Node] = deque()
    for r in readings:
        node, _ = atlas.resolve(
            r["work"], r["locator"], r.get("kind", "chapter"),
            r.get("concepts", []), r.get("why_needed", ""), 1, "target",
        )
        if node.id not in summit.prereq_ids:
            summit.prereq_ids.append(node.id)
        frontier.append(node)
        print(f"     • {node.label}   [{', '.join(node.concepts)}]")

    backward_chain(atlas, frontier, OBJECTIVE)
    return atlas, summit.id, OBJECTIVE


def build_from_goal() -> tuple[Atlas, str, str]:
    atlas = Atlas()
    print("→ decomposing the goal into target readings …")
    res = g.generate_json(
        prompts.GOAL_READINGS.format(goal=GOAL, profile=PROFILE),
        system=prompts.SYSTEM,
    )
    summary = res.get("goal_summary", "The goal")
    summit = atlas._add(summary, "the goal", "goal", [], GOAL, 0, "summit")

    readings = res.get("readings", [])
    print(f"   summit (goal): {summary}\n   got {len(readings)} target readings:")
    frontier: deque[Node] = deque()
    for r in readings:
        node, _ = atlas.resolve(
            r["work"], r["locator"], r.get("kind", "chapter"),
            r.get("concepts", []), r.get("why_needed", ""), 1, "target",
            competency=r.get("competency", ""),
        )
        if node.id not in summit.prereq_ids:
            summit.prereq_ids.append(node.id)
        frontier.append(node)
        print(f"     • [{node.competency}] {node.label}   [{', '.join(node.concepts)}]")

    backward_chain(atlas, frontier, GOAL)
    return atlas, summit.id, GOAL


# ---------------------------------------------------------------- render
def render_text(atlas: Atlas, summit_id: str, objective: str) -> str:
    lines = ["ATLAS — climb from the base up to the summit\n", f"SUMMIT: {objective}\n"]
    seen: set[str] = set()

    def walk(node: Node, indent: int):
        mark = {"summit": "▲", "target": "◎", "prereq": "·"}[node.node_kind]
        if node.is_start:
            mark = "⌂"
        comp = f"[{node.competency}] " if node.competency else ""
        dup = "  (shared)" if node.id in seen else ""
        pad = "    " * indent
        lines.append(f"{pad}{mark} {comp}{node.label}{dup}")
        if node.concepts:
            lines.append(f"{pad}     ⤷ {', '.join(node.concepts)}")
        if node.id in seen:
            return
        seen.add(node.id)
        for pid in node.prereq_ids:
            walk(atlas.nodes[pid], indent + 1)

    walk(atlas.nodes[summit_id], 0)
    starts = [n.label for n in atlas.nodes.values() if n.is_start]
    lines.append(f"\nSTART HERE (frontier at build time): {', '.join(starts) or '—'}")
    lines.append(f"TOTAL NODES: {len(atlas.nodes)}  (readings, incl. summit)")
    return "\n".join(lines)


def render_mermaid(atlas: Atlas) -> str:
    lines = ["graph BT"]
    for n in atlas.nodes.values():
        shape = {"summit": ('[["', '"]]'), "target": ('["', '"]'), "prereq": ('("', '")')}[n.node_kind]
        lines.append(f'    {n.id}{shape[0]}{n.label}{shape[1]}')
    for n in atlas.nodes.values():
        for pid in n.prereq_ids:
            lines.append(f"    {pid} --> {n.id}")
    return "\n".join(lines)


def to_json(atlas: Atlas, summit_id: str, objective: str) -> dict:
    return {
        "objective": objective, "profile": PROFILE, "summit": summit_id,
        "nodes": [
            {
                "id": n.id, "work": n.work, "locator": n.locator, "kind": n.kind,
                "competency": n.competency, "concepts": n.concepts, "why": n.why,
                "depth": n.depth, "is_start": n.is_start, "node_kind": n.node_kind,
                "prereqs": n.prereq_ids,
            }
            for n in atlas.nodes.values()
        ],
    }


def main():
    if len(sys.argv) < 2:
        print("usage: python build_graph.py <paper.pdf> | goal")
        sys.exit(1)
    arg = sys.argv[1]

    if arg == "goal":
        atlas, summit_id, objective = build_from_goal()
    elif Path(arg).exists() and arg.lower().endswith(".pdf"):
        atlas, summit_id, objective = build_from_paper(arg)
    else:
        print(f"not a pdf and not 'goal': {arg}")
        sys.exit(1)

    out = Path(__file__).parent / "out"
    (out / "atlas.json").write_text(json.dumps(to_json(atlas, summit_id, objective), indent=2))
    (out / "atlas.mmd").write_text(render_mermaid(atlas))
    text = render_text(atlas, summit_id, objective)
    (out / "atlas.txt").write_text(text)

    print("\n" + "=" * 70)
    print(text)
    print("=" * 70)
    print(f"\nwritten → {out}/atlas.{{json,mmd,txt}}")
    print("paste atlas.mmd into https://mermaid.live to see the graph")


if __name__ == "__main__":
    main()
