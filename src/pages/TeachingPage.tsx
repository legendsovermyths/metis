import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from "react";
import { ArrowLeft, Hand, X, SlidersHorizontal, Play, Pause, Repeat, ListVideo, Projector } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { GLYPHS, toRoman } from "@/lib/editorial";
import {
  getAllDialogues,
  getArtifact,
  getNextDialogue,
  journeyRef,
  explanationRef,
  sendMessage,
  setDialogue,
  type Dialogue,
  type ElementDescriptor,
  type Segment,
  type SegmentAction,
  type TeachingArtifact,
  type Note,
} from "@/lib/service";
import { useTasks } from "@/context/TasksContext";
import { useNoteAnchor } from "@/context/NoteAnchorContext";
import { ContentNotes } from "@/components/notes/ContentNotes";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import "katex/dist/katex.min.css";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin);

const ESC_DOLLAR = "\u0000ESCDOLLAR\u0000";

function preprocessMath(md: string): string {
  let result = md.replace(/\\\$/g, ESC_DOLLAR);

  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${tex}$$`;
    }
  });
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\n\\]|\\.){1,200}?)\$(?!\$)/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${tex}$`;
    }
  });

  result = result.split(ESC_DOLLAR).join("$");
  return result;
}

/// Slices `text` to `len` chars, but never lands inside an unclosed math
/// expression — if the cut would fall inside `$...$` or `$$...$$`, retreat
/// to just before the opening delimiter so partial LaTeX is never rendered.
function safeTypedSlice(text: string, len: number): string {
  const slice = text.slice(0, len);
  const re = /\\\$|\$\$|\$/g;
  let inDouble = false;
  let inSingle = false;
  let openIdx = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    if (m[0] === "\\$") continue;
    if (m[0] === "$$") {
      if (inDouble) { inDouble = false; openIdx = -1; }
      else if (!inSingle) { inDouble = true; openIdx = m.index; }
    } else {
      if (inSingle) { inSingle = false; openIdx = -1; }
      else if (!inDouble) { inSingle = true; openIdx = m.index; }
    }
  }
  if ((inDouble || inSingle) && openIdx >= 0) return text.slice(0, openIdx);
  return slice;
}

type RevealState = {
  pageIndex: number;
  elements: ElementDescriptor[];
  segments: Segment[];
  segmentIndex: number;
  typedLen: number;
};

type Playback = { active: boolean; continuous: boolean; playing: boolean };
const PLAYBACK_OFF: Playback = { active: false, continuous: false, playing: false };
const NARRATION_RATE = 1.3;

const SVG_NS = "http://www.w3.org/2000/svg";

/// Finds the first shape element (path/rect/circle/…) inside a group, for morph.
function firstShape(group: SVGElement): SVGGraphicsElement | null {
  return group.querySelector("path, rect, circle, ellipse, polygon, polyline") as SVGGraphicsElement | null;
}

/// Dispatch: morph — transitions `from`'s shape into `to`'s shape. `to` becomes
/// the visible element at the end (at its natural resting d).
function dispatchMorph(
  root: HTMLDivElement,
  action: Extract<SegmentAction, { type: "morph" }>,
  tl: gsap.core.Timeline,
) {
  const fromGroup = root.querySelector(`#${CSS.escape(action.from)}`) as SVGElement | null;
  const toGroup = root.querySelector(`#${CSS.escape(action.to)}`) as SVGElement | null;
  if (!fromGroup || !toGroup) return;
  const fromShape = firstShape(fromGroup);
  const toShape = firstShape(toGroup);
  if (!fromShape || !toShape) return;

  const fromD = fromShape.getAttribute("d") || (fromShape as unknown as { getBBox?: () => DOMRect }).getBBox?.();
  const toD = toShape.getAttribute("d");
  if (!fromD || !toD) return;

  // morphSVG is typed for paths; we only run when both elements expose `d` (path-like).
  const fromPath = fromShape as SVGPathElement;
  const toPath = toShape as SVGPathElement;

  // Start: to-group visible but shaped like from. from-group hidden.
  gsap.set(toGroup, { opacity: 1 });
  gsap.set(fromGroup, { opacity: 0 });
  tl.fromTo(
    toPath,
    { morphSVG: fromPath },
    { morphSVG: toPath, duration: action.duration_ms / 1000, ease: "power2.inOut" },
    0,
  );
}

/// Dispatch: trace — slides the target along the along-element's path.
function dispatchTrace(
  root: HTMLDivElement,
  action: Extract<SegmentAction, { type: "trace" }>,
  tl: gsap.core.Timeline,
) {
  const target = root.querySelector(`#${CSS.escape(action.target)}`) as SVGElement | null;
  const along = root.querySelector(`#${CSS.escape(action.along)}`) as SVGElement | null;
  if (!target || !along) return;
  const alongPath = along.tagName.toLowerCase() === "path" ? along : firstShape(along);
  if (!alongPath) return;

  gsap.set(target, { opacity: 1 });
  tl.to(
    target,
    {
      motionPath: {
        path: alongPath as SVGPathElement,
        start: action.from_pct,
        end: action.to_pct,
      },
      duration: action.duration_ms / 1000,
      ease: "power2.inOut",
    },
    0,
  );
}

/// Dispatch: pulse — brief scale + glow on target elements.
function dispatchPulse(
  root: HTMLDivElement,
  action: Extract<SegmentAction, { type: "pulse" }>,
  tl: gsap.core.Timeline,
) {
  for (const id of action.targets) {
    const el = root.querySelector(`#${CSS.escape(id)}`) as SVGElement | null;
    if (!el) continue;
    const half = action.duration_ms / 2000;
    tl.to(
      el,
      {
        scale: 1.12,
        filter: "drop-shadow(0 0 6px rgba(0,0,0,0.45))",
        duration: half,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        transformOrigin: "center center",
      },
      0,
    );
  }
}

/// Ensure a shared `<marker id="metis-arrow">` exists in the SVG for connect arrowheads.
function ensureArrowMarker(svgRoot: SVGSVGElement) {
  if (svgRoot.querySelector("#metis-arrow")) return;
  let defs = svgRoot.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs");
    svgRoot.insertBefore(defs, svgRoot.firstChild);
  }
  const marker = document.createElementNS(SVG_NS, "marker");
  marker.setAttribute("id", "metis-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrowPath = document.createElementNS(SVG_NS, "path");
  arrowPath.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  arrowPath.setAttribute("fill", "currentColor");
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
}

/// Clears any previously-drawn runtime connects, then redraws all past connects
/// up to and including the current segment. Idempotent on re-run.
function rebuildConnects(
  root: HTMLDivElement,
  connects: Array<{ from: string; to: string; duration_ms: number }>,
  tl: gsap.core.Timeline,
  instant: boolean,
) {
  const svgRoot = root.querySelector("svg") as SVGSVGElement | null;
  if (!svgRoot) return;

  // Remove any existing runtime connects from prior renders.
  svgRoot.querySelectorAll("[data-metis-connect]").forEach((n) => n.remove());
  if (connects.length === 0) return;

  ensureArrowMarker(svgRoot);

  for (const { from, to, duration_ms } of connects) {
    const fromEl = svgRoot.querySelector(`#${CSS.escape(from)}`) as SVGGraphicsElement | null;
    const toEl = svgRoot.querySelector(`#${CSS.escape(to)}`) as SVGGraphicsElement | null;
    if (!fromEl || !toEl) continue;
    let fromBox: DOMRect;
    let toBox: DOMRect;
    try {
      fromBox = fromEl.getBBox();
      toBox = toEl.getBBox();
    } catch {
      continue;
    }
    const fx = fromBox.x + fromBox.width / 2;
    const fy = fromBox.y + fromBox.height / 2;
    const tx = toBox.x + toBox.width / 2;
    const ty = toBox.y + toBox.height / 2;

    const arrow = document.createElementNS(SVG_NS, "path");
    arrow.setAttribute("d", `M ${fx} ${fy} L ${tx} ${ty}`);
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "1.5");
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("marker-end", "url(#metis-arrow)");
    arrow.setAttribute("data-metis-connect", `${from}--${to}`);
    svgRoot.appendChild(arrow);

    let len = 0;
    try {
      len = arrow.getTotalLength();
    } catch {
      len = 0;
    }
    if (len > 0 && isFinite(len)) {
      arrow.style.strokeDasharray = String(len);
      if (instant) {
        arrow.style.strokeDashoffset = "0";
      } else {
        arrow.style.strokeDashoffset = String(len);
        tl.to(
          arrow,
          { strokeDashoffset: 0, duration: duration_ms / 1000, ease: "power2.out" },
          0,
        );
      }
    }
  }
}

function AnimatedBlackboard({
  svgUrl,
  elements,
  revealed,
  focused,
  justRevealed,
  revealing,
  settled,
  currentActions,
  pastConnects,
}: {
  svgUrl: string;
  elements: ElementDescriptor[];
  revealed: Set<string>;
  focused: Set<string>;
  justRevealed: Set<string>;
  revealing: boolean;
  settled: boolean;
  currentActions: SegmentAction[];
  pastConnects: Array<{ from: string; to: string; duration_ms: number }>;
}) {
  const [svgText, setSvgText] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(convertFileSrc(svgUrl))
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvgText(text);
      })
      .catch(() => {
        if (!cancelled) setSvgText(null);
      });
    return () => {
      cancelled = true;
    };
  }, [svgUrl]);

  // Seed stroke-dash for draw animations. Skip when the reveal is already finished; otherwise
  // revisiting the page re-hides the SVG and replays one-shot actions (e.g. pulse) on the board.
  useEffect(() => {
    if (!svgText || !rootRef.current) return;
    const root = rootRef.current;

    if (!revealing || settled) return;
    for (const el of elements) {
      const node = root.querySelector(`#${CSS.escape(el.id)}`) as SVGElement | null;
      if (!node) continue;
      gsap.set(node, { opacity: 0 });
      node.querySelectorAll("path").forEach((p) => {
        const path = p as SVGPathElement;
        let len = 0;
        try {
          len = path.getTotalLength();
        } catch {
          len = 0;
        }
        if (len > 0 && isFinite(len)) {
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
          path.setAttribute("data-dash-len", String(len));
        }
      });
    }
  }, [svgText, elements, revealing, settled]);

  useEffect(() => {
    if (!svgText || !rootRef.current || !revealing) return;
    const root = rootRef.current;
    const hasFocus = focused.size > 0;

    // Revisit / finished reveal: show final opacities and static connects only — do not re-run
    // segment one-shots (pulse, morph, trace) or re-play staggered draws.
    if (settled) {
      for (const el of elements) {
        const node = root.querySelector(`#${CSS.escape(el.id)}`) as SVGElement | null;
        if (!node) continue;
        if (!revealed.has(el.id)) {
          gsap.set(node, { opacity: 0, scale: 1, clearProps: "filter" });
        } else {
          gsap.set(node, { opacity: 1, scale: 1, clearProps: "filter" });
        }
        const paths = Array.from(node.querySelectorAll("path")) as SVGPathElement[];
        for (const p of paths) {
          let len = 0;
          try {
            len = p.getTotalLength();
          } catch {
            len = 0;
          }
          if (len > 0 && isFinite(len)) {
            p.style.strokeDasharray = String(len);
            p.style.strokeDashoffset = "0";
          }
        }
      }
      const tlInstant = gsap.timeline();
      rebuildConnects(root, pastConnects, tlInstant, true);
      return () => {
        tlInstant.kill();
      };
    }

    const tl = gsap.timeline();
    ((): void => {

      // 1. Newly-revealed elements this segment — stagger fade-in + stroke draw.
      const freshNodes: SVGElement[] = [];
      for (const el of elements) {
        if (!justRevealed.has(el.id)) continue;
        const node = root.querySelector(`#${CSS.escape(el.id)}`) as SVGElement | null;
        if (node) freshNodes.push(node);
      }
      if (freshNodes.length > 0) {
        // Separate shape nodes from edge/path nodes so edges draw after nodes settle.
        const freshShapes = freshNodes.filter((n) => {
          const tag = n.tagName.toLowerCase();
          return tag !== "line" && tag !== "polyline" && !n.classList.contains("edge");
        });
        const freshEdges = freshNodes.filter((n) => {
          const tag = n.tagName.toLowerCase();
          return tag === "line" || tag === "polyline" || n.classList.contains("edge");
        });
        if (freshShapes.length > 0)
          tl.to(freshShapes, { opacity: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" }, 0);
        if (freshEdges.length > 0)
          tl.to(freshEdges, { opacity: 1, duration: 0.4, stagger: 0.12, ease: "power2.out" }, freshShapes.length > 0 ? 0.25 : 0);
        freshNodes.forEach((node, i) => {
          const isEdge = freshEdges.includes(node);
          const delay = isEdge ? 0.25 + freshEdges.indexOf(node) * 0.12 : i * 0.08;
          const paths = Array.from(node.querySelectorAll("path")) as SVGPathElement[];
          const drawables = paths.filter((p) => p.getAttribute("data-dash-len"));
          if (drawables.length > 0) {
            tl.to(
              drawables,
              { strokeDashoffset: 0, duration: 1.6, ease: "power2.out" },
              delay
            );
          }
        });
      }

      // 2. Previously-revealed (not fresh) elements — snap-show, then settle opacity.
      for (const el of elements) {
        const node = root.querySelector(`#${CSS.escape(el.id)}`) as SVGElement | null;
        if (!node) continue;
        const shown = revealed.has(el.id);
        const isFresh = justRevealed.has(el.id);
        if (!shown) {
          tl.to(node, { opacity: 0, duration: 0.3 }, 0);
          continue;
        }
        if (isFresh) continue; // handled above
        const isFocused = focused.has(el.id);
        const target = isFocused ? 1 : hasFocus ? 0.4 : 1;
        tl.to(node, { opacity: target, duration: 0.5, ease: "power2.out" }, 0);
        const paths = Array.from(node.querySelectorAll("path")) as SVGPathElement[];
        paths.forEach((p) => {
          if (p.getAttribute("data-dash-len")) {
            gsap.set(p, { strokeDashoffset: 0 });
          }
        });
      }

      // 3. Rebuild all past connects (runtime-injected arrows that persist within a dialogue).
      rebuildConnects(root, pastConnects, tl, false);

      // 4. Dispatch motion actions for the CURRENT segment (morph, trace, pulse).
      for (const action of currentActions) {
        if (action.type === "morph") {
          dispatchMorph(root, action, tl);
        } else if (action.type === "trace") {
          dispatchTrace(root, action, tl);
        } else if (action.type === "pulse") {
          dispatchPulse(root, action, tl);
        }
      }

    })();

    return () => {
      tl.kill();
    };
  }, [svgText, elements, revealed, focused, justRevealed, revealing, settled, currentActions, pastConnects]);

  if (!svgText) return null;

  return (
    <div
      ref={rootRef}
      className="w-full h-full dark:invert [&_svg]:block [&_svg]:w-full [&_svg]:h-full [&_[id$='-before']]:opacity-0"
      dangerouslySetInnerHTML={{ __html: svgText }}
    />
  );
}

export default function TeachingPage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const ts = context?.teaching;

  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<RevealState | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [playback, setPlayback] = useState<Playback>(PLAYBACK_OFF);
  const audioRef = useRef<HTMLAudioElement>(null);

  type Exchange = { question: string; answer: string };
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const exchangesEndRef = useRef<HTMLDivElement>(null);

  const exchanges = useMemo<Exchange[]>(() => {
    const events = context?.chat.event_history.events ?? [];
    const result: Exchange[] = [];
    let pendingQ: string | null = null;
    for (const ev of events) {
      if (ev.event_type === "UserMessage") {
        pendingQ = ev.content;
      } else if (ev.event_type === "LlmMessage" && pendingQ != null) {
        result.push({ question: pendingQ, answer: ev.content });
        pendingQ = null;
      }
    }
    return result;
  }, [context?.chat.event_history.events]);

  const openAside = useCallback(() => {
    setIsAsking(true);
  }, []);

  const dismissAside = useCallback(() => {
    if (isThinking) return;
    setIsAsking(false);
    setTimeout(() => {
      setQuestion("");
      setPendingQuestion(null);
    }, 200);
  }, [isThinking]);

  const handleAsk = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || isThinking) return;
    setPendingQuestion(q);
    setQuestion("");
    setIsThinking(true);
    try {
      await sendMessage(q);
    } catch {
      // Error already surfaced via toast by callBackend.
    } finally {
      setPendingQuestion(null);
      setIsThinking(false);
    }
  }, [question, isThinking]);

  useEffect(() => {
    if (isAsking) {
      exchangesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [exchanges.length, pendingQuestion, isAsking]);

  useEffect(() => {
    if (!isAsking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissAside();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAsking, dismissAside]);

  const artifactKind = ts?.artifact_kind ?? null;
  const parentId = ts?.artifact_id ?? null;

  const [artifact, setArtifact] = useState<TeachingArtifact | null>(null);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const { byType } = useTasks();
  const seedKeyRef = useRef<string | null>(null);

  // Seed the artifact + dialogue history on mount / artifact change.
  useEffect(() => {
    if (artifactKind == null || artifactKind === "None" || parentId == null) return;
    const key = `${artifactKind}:${parentId}`;
    if (seedKeyRef.current === key) return;
    seedKeyRef.current = key;
    let cancelled = false;
    Promise.all([getArtifact(artifactKind, parentId), getAllDialogues(artifactKind, parentId)])
      .then(([art, rows]) => {
        if (cancelled) return;
        setArtifact(art);
        setDialogues(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [artifactKind, parentId]);

  const allDialogues = dialogues;

  // Seed (or re-seed) the segment reveal for any page, optionally starting a
  // hands-free playback session. Used by replay / play-from-here / immersive
  // and by auto-advance across passages.
  const beginReveal = useCallback(
    (idx: number, opts: { active: boolean; continuous: boolean }) => {
      const d = dialogues[idx];
      if (!d || !d.segments || d.segments.length === 0) return;
      setReveal({
        pageIndex: idx,
        elements: d.blackboard?.elements ?? [],
        segments: d.segments,
        segmentIndex: 0,
        typedLen: 0,
      });
      setPlayback(
        opts.active
          ? { active: true, continuous: opts.continuous, playing: true }
          : PLAYBACK_OFF,
      );
    },
    [dialogues],
  );

  // Active generate_dialogues task targeting our artifact, if any.
  const generationTask = useMemo(() => {
    if (parentId == null) return null;
    return (
      byType("generate_dialogues").find((t) => {
        const pid = t.params?.parent_id;
        return typeof pid === "number" && pid === parentId;
      }) ?? null
    );
  }, [byType, parentId]);

  // Normalize journey/explanation into one shape the rendering reads from:
  // a segmented progress rail, group labels for the masthead, and completion copy.
  const model = useMemo(() => {
    if (!artifact) return null;
    if (artifact.kind === "Journey") {
      const a = artifact.journey;
      const arcs = a.journey.arcs;
      const arcIdx = a.progress.arc_idx;
      const topicIdx = a.progress.topic_idx;
      const total = arcs.reduce((sum, arc) => sum + arc.topics.length, 0);
      return {
        kind: "Journey" as const,
        backLink: parentId != null ? `/journeys/${parentId}` : "/studies",
        backLabel: "the Course",
        isComplete: a.progress.is_journey_complete,
        completeTitle: "Journey complete.",
        completeSubtitle: `You've worked through all ${total} topics.`,
        completeThanks: "Thank you for staying the course.",
        glyphSeed: parentId ?? 0,
        segments: arcs.map((arc, idx) =>
          idx < arcIdx
            ? 1
            : idx === arcIdx
              ? arc.topics.length
                ? topicIdx / arc.topics.length
                : 0
              : 0,
        ),
        groupOf: (d: Dialogue) => journeyRef(d.reference)?.arc_idx ?? 0,
        groupLabel: (d: Dialogue | undefined) => {
          const idx = d ? (journeyRef(d.reference)?.arc_idx ?? arcIdx) : arcIdx;
          return arcs[idx]?.arc_title ?? "";
        },
        headingFallback:
          arcs[arcIdx]?.topics[topicIdx]?.name ?? arcs[arcIdx]?.topics[0]?.name ?? "A passage waits…",
      };
    }
    const a = artifact.explanation;
    const steps = a.explanation.steps;
    const stepIdx = a.progress.step_idx;
    return {
      kind: "Explanation" as const,
      backLink: parentId != null ? `/explanations/${parentId}` : "/studies",
      backLabel: "the Route",
      isComplete: a.progress.is_complete,
      completeTitle: "Explanation complete.",
      completeSubtitle: `You've walked all ${steps.length} steps of the route.`,
      completeThanks: "Thank you for walking it through.",
      glyphSeed: parentId ?? 0,
      segments: steps.map((_, idx) => (idx < stepIdx ? 1 : 0)),
      groupOf: (d: Dialogue) => explanationRef(d.reference)?.step_idx ?? 0,
      groupLabel: (d: Dialogue | undefined) => {
        const idx = d ? (explanationRef(d.reference)?.step_idx ?? stepIdx) : stepIdx;
        return steps[idx]?.label ?? "";
      },
      headingFallback: steps[stepIdx]?.name ?? steps[0]?.name ?? "A passage waits…",
    };
  }, [artifact, parentId]);

  useEffect(() => {
    if (allDialogues.length > 0) {
      setPageIndex(allDialogues.length - 1);
    }
  }, [allDialogues.length]);

  const selectedDialogueId = allDialogues[pageIndex]?.id ?? null;
  useEffect(() => {
    if (selectedDialogueId == null) return;
    void setDialogue(selectedDialogueId);
  }, [selectedDialogueId]);

  const segIdx = reveal?.segmentIndex ?? -1;
  const segsRef = reveal?.segments;

  // Provenance: a note born now attaches to the dialogue+segment on screen.
  const { setAnchor } = useNoteAnchor();
  useEffect(() => {
    if (selectedDialogueId != null) {
      setAnchor({ Dialogue: { dialogue_id: selectedDialogueId, segment_idx: Math.max(0, segIdx) } });
    } else if (artifactKind === "Journey" && parentId != null) {
      setAnchor({ Journey: { journey_id: parentId } });
    } else if (artifactKind === "Explanation" && parentId != null) {
      setAnchor({ Explanation: { explanation_id: parentId, step_idx: 0 } });
    } else {
      setAnchor(null);
    }
    return () => setAnchor(null);
  }, [selectedDialogueId, segIdx, artifactKind, parentId, setAnchor]);

  // Which notes belong to the content currently on screen.
  const notesMatchHere = useCallback(
    (note: Note) => {
      const a = note.anchor;
      if (!a) return false;
      if ("Dialogue" in a) return a.Dialogue.dialogue_id === selectedDialogueId;
      if ("Journey" in a) return artifactKind === "Journey" && a.Journey.journey_id === parentId;
      if ("Explanation" in a)
        return artifactKind === "Explanation" && a.Explanation.explanation_id === parentId;
      return false;
    },
    [selectedDialogueId, artifactKind, parentId],
  );

  useEffect(() => {
    if (segIdx < 0 || !segsRef) return;
    if (playback.active && !playback.playing) return;
    const id = window.setInterval(() => {
      setReveal((r) => {
        if (!r) return r;
        const cur = r.segments[r.segmentIndex];
        if (!cur || r.typedLen >= cur.text.length) return r;
        return { ...r, typedLen: Math.min(cur.text.length, r.typedLen + 2) };
      });
    }, 14);
    return () => window.clearInterval(id);
  }, [segIdx, segsRef, playback.active, playback.playing]);

  const currentImageUrl = allDialogues[pageIndex]?.blackboard?.image_url ?? null;

  const dialogueScrollRef = useRef<HTMLDivElement>(null);

  const typedLen = reveal?.typedLen ?? 0;

  useEffect(() => {
    const el = dialogueScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) {
      el.scrollTop = el.scrollHeight;
    }
  }, [typedLen, segIdx]);

  const revealFocusSets = useMemo(() => {
    const revealed = new Set<string>();
    const focused = new Set<string>();
    const justRevealed = new Set<string>();
    const currentActions: SegmentAction[] = [];
    const pastConnects: Array<{ from: string; to: string; duration_ms: number }> = [];
    if (reveal) {
      for (let i = 0; i <= reveal.segmentIndex; i++) {
        for (const action of reveal.segments[i]?.actions ?? []) {
          if (action.type === "reveal") {
            for (const id of action.targets) revealed.add(id);
          }
          if (action.type === "connect") {
            pastConnects.push({ from: action.from, to: action.to, duration_ms: action.duration_ms });
          }
        }
      }
      for (const action of reveal.segments[reveal.segmentIndex]?.actions ?? []) {
        currentActions.push(action);
        if (action.type === "focus") {
          for (const id of action.targets) focused.add(id);
        }
        if (action.type === "reveal") {
          for (const id of action.targets) justRevealed.add(id);
        }
      }
    }
    return { revealed, focused, justRevealed, currentActions, pastConnects };
  }, [reveal?.segmentIndex, reveal?.segments]);

  const fetchNextDialogue = useCallback(async (): Promise<boolean> => {
    if (parentId == null || artifactKind == null || artifactKind === "None") return false;
    setIsLoading(true);
    setError(null);
    try {
      const next = await getNextDialogue(artifactKind, parentId);
      if (next) {
        setDialogues((prev) => [...prev, next]);
        setWaitingForNext(false);
        if (next.segments && next.segments.length > 0) {
          setReveal({
            pageIndex: allDialogues.length,
            elements: next.blackboard?.elements ?? [],
            segments: next.segments,
            segmentIndex: 0,
            typedLen: 0,
          });
        } else {
          setReveal(null);
        }
        return true;
      }
      // No dialogue returned. Re-check progress to tell "complete" from "still generating".
      const fresh = await getArtifact(artifactKind, parentId);
      if (fresh) {
        setArtifact(fresh);
        const done =
          fresh.kind === "Journey"
            ? fresh.journey.progress.is_journey_complete
            : fresh.explanation.progress.is_complete;
        if (done) {
          setWaitingForNext(false);
          return false;
        }
      }
      // Backend has spawned a generation task — wait for it.
      setWaitingForNext(true);
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [artifactKind, parentId, allDialogues.length]);

  // While waiting for generation to produce a dialogue, retry whenever the
  // generate_dialogues checkpoint advances (each progress event = one new
  // dialogue inserted into the DB).
  const generationCount = (generationTask?.checkpoint as { count?: number } | null)?.count ?? null;
  useEffect(() => {
    if (!waitingForNext || parentId == null) return;
    if (generationCount == null) return;
    void fetchNextDialogue();
  }, [waitingForNext, generationCount, parentId, fetchNextDialogue]);

  // Advance the active playback session: next segment, or — at the end of a
  // passage — into the following one when continuous, else stop.
  const handleSegmentComplete = useCallback(() => {
    if (!reveal) return;
    if (reveal.segmentIndex < reveal.segments.length - 1) {
      setReveal({ ...reveal, segmentIndex: reveal.segmentIndex + 1, typedLen: 0 });
      return;
    }
    if (playback.continuous) {
      if (pageIndex < allDialogues.length - 1) {
        const ni = pageIndex + 1;
        setPageIndex(ni);
        beginReveal(ni, { active: true, continuous: true });
        return;
      }
      if (!model?.isComplete) {
        void fetchNextDialogue();
        return;
      }
    }
    setPlayback(PLAYBACK_OFF);
  }, [reveal, playback.continuous, pageIndex, allDialogues.length, model?.isComplete, fetchNextDialogue, beginReveal]);

  // Immersive narration: load and play the current segment's audio.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!immersive || !playback.active) {
      audio.pause();
      return;
    }
    const seg = reveal?.segments[reveal.segmentIndex];
    if (!seg?.audio_path) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    audio.src = convertFileSrc(seg.audio_path);
    audio.currentTime = 0;
    audio.playbackRate = NARRATION_RATE;
    if (playback.playing) audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immersive, playback.active, reveal?.pageIndex, reveal?.segmentIndex]);

  // Pause / resume narration without reloading the source.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !immersive || !playback.active) return;
    const seg = reveal?.segments[reveal.segmentIndex];
    if (!seg?.audio_path) return;
    if (playback.playing) audio.play().catch(() => {});
    else audio.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback.playing, immersive, playback.active, reveal?.segmentIndex]);

  // Silent playback (split view, or immersive passage with no narration):
  // advance on a dwell timer once the segment has finished typing.
  useEffect(() => {
    if (!playback.active || !playback.playing || !reveal) return;
    if (isLoading || waitingForNext) return;
    const seg = reveal.segments[reveal.segmentIndex];
    if (!seg) return;
    if (immersive && seg.audio_path) return; // audio onEnded drives advance
    if (reveal.typedLen < seg.text.length) return;
    const dwell = Math.min(4500, 900 + seg.text.length * 16);
    const id = window.setTimeout(handleSegmentComplete, dwell);
    return () => window.clearTimeout(id);
  }, [playback.active, playback.playing, immersive, reveal, isLoading, waitingForNext, handleSegmentComplete]);

  const replayPassage = useCallback(
    () => beginReveal(pageIndex, { active: true, continuous: false }),
    [beginReveal, pageIndex],
  );
  const playFromHere = useCallback(
    () => beginReveal(pageIndex, { active: true, continuous: true }),
    [beginReveal, pageIndex],
  );
  const togglePlay = useCallback(() => {
    const goingToPlay = !playback.playing;
    // Resuming on a passage that has already played out replays it from the
    // top, so play always does something on the passage you're looking at.
    if (goingToPlay && reveal) {
      const last = reveal.segments.length - 1;
      const settled =
        reveal.segmentIndex === last &&
        reveal.typedLen >= (reveal.segments[last]?.text.length ?? 0);
      if (settled) setReveal({ ...reveal, segmentIndex: 0, typedLen: 0 });
    }
    setPlayback((p) => ({ ...p, playing: goingToPlay }));
  }, [playback.playing, reveal]);

  // Browse passages while immersive: move to the target and show its board in
  // the fully-revealed, paused state — never auto-play just from navigating.
  const immersiveGoTo = useCallback(
    (idx: number) => {
      setPageIndex(idx);
      const d = dialogues[idx];
      if (d?.segments?.length) {
        const lastIdx = d.segments.length - 1;
        setReveal({
          pageIndex: idx,
          elements: d.blackboard?.elements ?? [],
          segments: d.segments,
          segmentIndex: lastIdx,
          typedLen: d.segments[lastIdx]?.text.length ?? 0,
        });
      }
      setPlayback((p) => ({ ...p, playing: false }));
    },
    [dialogues],
  );
  const immersivePrev = useCallback(() => {
    if (pageIndex > 0) immersiveGoTo(pageIndex - 1);
  }, [pageIndex, immersiveGoTo]);
  const immersiveNext = useCallback(async () => {
    if (pageIndex < allDialogues.length - 1) {
      immersiveGoTo(pageIndex + 1);
      return;
    }
    if (!model?.isComplete && !isLoading) await fetchNextDialogue();
  }, [pageIndex, allDialogues.length, immersiveGoTo, model?.isComplete, isLoading, fetchNextDialogue]);
  const exitPlayback = useCallback(() => {
    setPlayback(PLAYBACK_OFF);
    setImmersive(false);
    audioRef.current?.pause();
  }, []);
  const toggleImmersive = useCallback(() => {
    if (immersive) {
      exitPlayback();
      return;
    }
    const d = dialogues[pageIndex];
    if (!d?.segments?.length) return;
    setImmersive(true);
    // Preserve where the reader already is. If a reveal is in progress on this
    // page, keep its segment/typed position; otherwise the board is showing the
    // fully-revealed state, so seed at the last segment to match it. Enter
    // paused so the board expands calmly before any narration begins.
    const hasActive = reveal && reveal.pageIndex === pageIndex;
    if (!hasActive) {
      const lastIdx = d.segments.length - 1;
      setReveal({
        pageIndex,
        elements: d.blackboard?.elements ?? [],
        segments: d.segments,
        segmentIndex: lastIdx,
        typedLen: d.segments[lastIdx]?.text.length ?? 0,
      });
    }
    setPlayback({ active: true, continuous: false, playing: false });
  }, [immersive, pageIndex, reveal, dialogues, exitPlayback]);

  const handleNext = useCallback(async () => {
    if (isLoading) return;

    // During playback, Next means the next passage — segments self-advance.
    if (playback.active) {
      if (pageIndex < allDialogues.length - 1) {
        const ni = pageIndex + 1;
        setPageIndex(ni);
        beginReveal(ni, { active: true, continuous: playback.continuous });
        return;
      }
      if (!model?.isComplete) await fetchNextDialogue();
      return;
    }

    const isRevealActive = reveal && reveal.pageIndex === pageIndex;

    if (isRevealActive && reveal) {
      const currentText = reveal.segments[reveal.segmentIndex]?.text ?? "";
      if (reveal.typedLen < currentText.length) {
        setReveal({ ...reveal, typedLen: currentText.length });
        return;
      }
      if (reveal.segmentIndex < reveal.segments.length - 1) {
        setReveal({ ...reveal, segmentIndex: reveal.segmentIndex + 1, typedLen: 0 });
        return;
      }
    }

    if (pageIndex < allDialogues.length - 1) {
      setPageIndex((p) => p + 1);
      return;
    }

    if (model?.isComplete) return;
    await fetchNextDialogue();
  }, [isLoading, pageIndex, allDialogues.length, model?.isComplete, reveal, fetchNextDialogue, playback.active, playback.continuous, beginReveal]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  }, [pageIndex]);

  useEffect(() => {
    if (!immersive && !playback.active) return;
    const onKey = (e: KeyboardEvent) => {
      if (isAsking) return;
      if (e.key === "Escape") exitPlayback();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (immersive && e.key === "ArrowLeft") immersivePrev();
      if (immersive && e.key === "ArrowRight") void immersiveNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive, playback.active, isAsking, exitPlayback, togglePlay, immersivePrev, immersiveNext]);

  if (!ts || artifactKind == null || artifactKind === "None" || parentId == null || !model) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 paper-texture px-6">
        <p className="text-text-tertiary">No active teaching session.</p>
        <Link
          to="/studies"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Go to the study
        </Link>
      </div>
    );
  }

  const totalPages = allDialogues.length;
  const isOnLastPage = pageIndex >= totalPages - 1;
  const hasNoPages = totalPages === 0;
  // When complete, a standalone coda page lives one past the last passage.
  const hasCompletionPage = Boolean(model.isComplete);
  const completionPageIndex = allDialogues.length;
  const onCompletionPage = hasCompletionPage && pageIndex >= completionPageIndex;
  const isOnLastContentPage = totalPages > 0 && pageIndex === totalPages - 1;
  const currentDialogue: Dialogue | undefined = allDialogues[pageIndex];
  const displayHeading = currentDialogue?.heading || model.headingFallback;
  const displayArc = model.groupLabel(currentDialogue);
  // Drop cap on the opening passage of each group (arc / step) — same flourish as the first Metis utterance in chat.
  const isFirstOfArc = currentDialogue
    ? allDialogues.findIndex((d) => model.groupOf(d) === model.groupOf(currentDialogue)) === pageIndex
    : false;

  const currentSegments = currentDialogue?.segments ?? [];
  const currentHasSegments = currentSegments.length > 0;
  const currentHasAudio = currentSegments.some((s) => !!s.audio_path);
  const currentHasBoard = Boolean(currentImageUrl);
  const atVeryEnd = isOnLastPage && Boolean(model.isComplete);

  return (
    <div
      className={cn(
        "flex h-screen flex-col transition-[margin,background-color] duration-500 ease-out",
        isAsking && "md:mr-[400px]",
        immersive && "bg-foreground/[0.04] dark:bg-background"
      )}
    >
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => {
          if (immersive && playback.active) handleSegmentComplete();
        }}
        onError={() => {
          if (immersive && playback.active && playback.playing) handleSegmentComplete();
        }}
      />
      <ContentNotes match={notesMatchHere} />
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border/20 bg-background/60 backdrop-blur-xl">
        <div className="relative flex items-center justify-between px-4 py-3">
          <Link
            to={model.backLink}
            className="flex items-center gap-1.5 text-text-tertiary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="label-whisper hidden sm:inline">Back to {model.backLabel}</span>
          </Link>

          {/* Arc · Topic context — replaces generic "Teaching" badge */}
          {(displayArc || displayHeading) && (
            <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 max-w-[42%] truncate font-display text-sm italic text-text-tertiary/80">
              {displayArc && displayHeading
                ? `${displayArc} · ${displayHeading}`
                : displayArc || displayHeading}
            </p>
          )}

          {/* The hall — playback & stage controls */}
          <div className="flex w-24 items-center justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:text-foreground",
                    (immersive || playback.active) && "text-amber hover:text-amber"
                  )}
                  aria-label="The hall — playback and stage controls"
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={10}
                className="w-72 overflow-hidden rounded-lg border-border/40 p-0 shadow-medium"
              >
                <div className="px-5 pt-5 pb-3">
                  <p className="label-whisper text-text-tertiary">The hall</p>
                </div>

                {/* Immersive board toggle */}
                <button
                  onClick={toggleImmersive}
                  disabled={!currentHasBoard}
                  className="group flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Projector className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
                  <span className="flex-1">
                    <span className="block font-display text-sm italic text-foreground">
                      Immersive board
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-text-tertiary">
                      {!currentHasBoard
                        ? "This passage has no board to enlarge."
                        : currentHasAudio
                          ? "The board fills the room; the lecture is read aloud."
                          : "The board fills the room; this passage plays silently."}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "relative mt-1 h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
                      immersive ? "bg-amber" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all duration-200",
                        immersive ? "left-[14px]" : "left-0.5"
                      )}
                    />
                  </span>
                </button>

                <div className="mx-5 h-px bg-border/30" />

                {/* Replay this passage */}
                <button
                  onClick={replayPassage}
                  disabled={!currentHasSegments}
                  className="group flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
                  <span className="flex-1">
                    <span className="block font-display text-sm italic text-foreground">
                      Replay this passage
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-text-tertiary">
                      Run the reveal and its animation from the top.
                    </span>
                  </span>
                </button>

                {/* Play from here */}
                <button
                  onClick={playFromHere}
                  disabled={!currentHasSegments || atVeryEnd}
                  className="group flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ListVideo className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
                  <span className="flex-1">
                    <span className="block font-display text-sm italic text-foreground">
                      Play from here
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-text-tertiary">
                      Sit back — passages advance on their own.
                    </span>
                  </span>
                </button>

                <div className="h-2" />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Segmented progress — one cell per arc (journey) or step (explanation) */}
        <div className="flex items-center gap-1 px-4 pb-2.5">
          {model.segments.map((fill, idx) => (
            <div key={idx} className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${fill * 100}%`, backgroundColor: "hsl(var(--amber))", opacity: 0.65 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content area — two-pane on lg+, stacked on mobile */}
      {(() => {
        const proseClasses = cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          "prose-headings:font-display prose-headings:italic prose-headings:tracking-tight",
          "prose-p:leading-[1.85] prose-p:text-[1.05rem] prose-p:text-foreground/90",
          "prose-blockquote:border-foreground/20 prose-blockquote:text-foreground/70",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-code:text-foreground/80 prose-code:bg-surface prose-code:rounded prose-code:px-1",
          "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto",
          "[&_.katex]:text-foreground"
        );

        const isRevealing = Boolean(reveal && reveal.pageIndex === pageIndex);

        const isSettled = Boolean(
          isRevealing &&
            reveal &&
            reveal.segmentIndex === reveal.segments.length - 1 &&
            reveal.typedLen >= (reveal.segments[reveal.segmentIndex]?.text.length ?? 0)
        );

        const { revealed, focused, justRevealed, currentActions, pastConnects } = revealFocusSets;

        const hasBoard = Boolean(currentImageUrl);
        const boardOnly = immersive && hasBoard;

        if (onCompletionPage) {
          return (
            <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden px-6 text-center animate-blur-in">
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center select-none font-display italic leading-none text-foreground/[0.03]" style={{ fontSize: "min(60vh, 60vw)" }}>
                {GLYPHS[Math.abs(model.glyphSeed) % GLYPHS.length]}
              </span>
              <p className="label-whisper text-text-tertiary/70 mb-5 relative">Fin</p>
              <p className="relative font-display text-4xl italic text-foreground mb-5">{model.completeTitle}</p>
              <div
                className="h-px w-12 mb-6 relative animate-reveal-line"
                style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "center" }}
              />
              <p className="relative text-sm text-text-tertiary/60 mb-3 max-w-md leading-relaxed">
                {model.completeSubtitle}
              </p>
              <p className="relative font-display italic text-sm text-text-tertiary/80 max-w-md leading-relaxed">
                {model.completeThanks}
              </p>
            </div>
          );
        }

        return (
          <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Board pane — only shown when a blackboard image exists */}
            {hasBoard && (
              <div
                className={cn(
                  "relative flex items-center justify-center overflow-hidden bg-background min-h-[42vh] p-4 transition-all duration-700 ease-in-out",
                  boardOnly
                    ? "flex-1 lg:flex-none lg:w-full lg:p-12"
                    : "lg:flex-none lg:w-[55%] border-b lg:border-b-0 lg:border-r border-border/20 lg:p-8"
                )}
              >
                <div key={currentImageUrl!} className="w-full h-full animate-blur-in">
                  {isRevealing && reveal ? (
                    <AnimatedBlackboard
                      svgUrl={currentImageUrl!}
                      elements={reveal.elements}
                      revealed={revealed}
                      focused={focused}
                      justRevealed={justRevealed}
                      revealing
                      settled={isSettled}
                      currentActions={currentActions}
                      pastConnects={pastConnects}
                    />
                  ) : (
                    <AnimatedBlackboard
                      svgUrl={currentImageUrl!}
                      elements={[]}
                      revealed={new Set()}
                      focused={new Set()}
                      justRevealed={new Set()}
                      revealing={false}
                      settled={false}
                      currentActions={[]}
                      pastConnects={[]}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Dialogue pane — collapses away as the board fills the room */}
            <div
              ref={dialogueScrollRef}
              className={cn(
                "overflow-y-auto transition-all duration-700 ease-in-out",
                boardOnly
                  ? "max-h-0 opacity-0 pointer-events-none lg:max-h-none lg:w-0 lg:flex-none"
                  : hasBoard
                    ? "flex-1 lg:flex-none lg:w-[45%] lg:border-l lg:border-border/20"
                    : "flex-1"
              )}
            >
              <div className={cn("mx-auto px-6 py-10 md:px-8", hasBoard ? "max-w-2xl" : "max-w-2xl lg:max-w-3xl")}>
                <header className="relative mb-10 animate-blur-in">
                  <p className="label-whisper text-text-tertiary mb-3">
                    {displayArc}
                  </p>
                  <h1 className="display-hero text-2xl text-foreground md:text-3xl mb-0">
                    {displayHeading}
                  </h1>
                  <div
                    className="h-px w-12 mt-5 animate-reveal-line"
                    style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
                  />
                  {/* Folio — bibliographic page number in the corner */}
                  {!hasNoPages && totalPages > 0 && (
                    <span className="label-whisper text-text-tertiary absolute top-0 right-0 tabular-nums">
                      fol. {toRoman(pageIndex + 1).toLowerCase()}
                    </span>
                  )}
                </header>

                {hasNoPages && !isLoading && (
                  <div className="py-20 animate-blur-in">
                    <p className="font-display italic text-base text-foreground/70 leading-relaxed max-w-md">
                      Ready when you are. The first passage waits to be opened.
                    </p>
                  </div>
                )}

                {!hasNoPages && (
                  <div key={pageIndex} className="animate-blur-in">
                    {isRevealing && reveal ? (
                      <div className="space-y-6">
                        {reveal.segments.slice(0, reveal.segmentIndex + 1).map((seg, i) => {
                          const isCurrent = i === reveal.segmentIndex;
                          const text = isCurrent ? safeTypedSlice(seg.text, reveal.typedLen) : seg.text;
                          return (
                            <Fragment key={i}>
                              {i > 0 && (
                                <div
                                  className="flex justify-center select-none text-text-tertiary/35 font-display"
                                  aria-hidden
                                >
                                  <span style={{ letterSpacing: "0.4em", paddingLeft: "0.4em" }}>⁂</span>
                                </div>
                              )}
                              <article
                                className={cn(
                                  proseClasses,
                                  "animated-dialogue transition-opacity duration-500",
                                  isFirstOfArc && i === 0 && "metis-dropcap",
                                )}
                                style={{ opacity: isSettled || isCurrent ? 1 : 0.4 }}
                              >
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                  {preprocessMath(text)}
                                </ReactMarkdown>
                              </article>
                            </Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <article className={cn(proseClasses, isFirstOfArc && "metis-dropcap")}>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {preprocessMath(currentDialogue?.content ?? "")}
                        </ReactMarkdown>
                      </article>
                    )}
                  </div>
                )}

                {/* Segment progress dots — visible during active reveal (the lectern rail owns them in playback) */}
                {isRevealing && !playback.active && reveal && reveal.segments.length > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-1.5">
                    {reveal.segments.map((_, i) => {
                      const isPast = i < reveal.segmentIndex;
                      const isCurrent = i === reveal.segmentIndex;
                      return (
                        <span
                          key={i}
                          className="rounded-full transition-all duration-300 ease-out"
                          style={{
                            height: "0.3rem",
                            width: isCurrent ? "1.25rem" : "0.3rem",
                            backgroundColor: isPast || isCurrent
                              ? "hsl(var(--amber))"
                              : "hsl(var(--border))",
                            opacity: isPast ? 0.5 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {isLoading && (
                  <div className="mt-8 flex items-center gap-1.5 animate-blur-in">
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                  </div>
                )}

                {waitingForNext && !isLoading && (
                  <p className="mt-8 font-display italic text-sm text-text-tertiary/55 animate-blur-in">
                    Professor Metis is composing the next passage…
                  </p>
                )}

                {error && (
                  <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating raise hand button */}
      <button
        onClick={openAside}
        className="fixed bottom-20 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/80 backdrop-blur-sm text-text-tertiary transition-colors hover:text-amber hover:border-amber/40"
        aria-label="Raise hand to ask a question"
      >
        <Hand className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {/* Bottom bar */}
      <div
        className={cn(
          "sticky bottom-0 border-t border-border/20 backdrop-blur-xl px-4 py-3.5 transition-colors duration-500",
          immersive ? "bg-background/30" : "bg-background/60"
        )}
      >
        {playback.active ? (
          /* Lectern rail — hands-free session controls */
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            {/* Leave the hall */}
            <button
              onClick={exitPlayback}
              className="group font-display italic text-sm text-text-tertiary hover:text-foreground transition-colors"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
              <span className="ml-1 hidden sm:inline">leave the hall</span>
            </button>

            {/* Prev · play/pause + dots · next */}
            <div className="flex items-center gap-5">
              <button
                onClick={immersivePrev}
                disabled={pageIndex <= 0}
                aria-label="Previous passage"
                className="group font-display italic text-lg text-text-tertiary transition-colors hover:text-foreground disabled:opacity-25 disabled:hover:text-text-tertiary"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/40 text-foreground transition-colors hover:border-amber/50 hover:text-amber"
                  aria-label={playback.playing ? "Pause" : "Resume"}
                >
                  {playback.playing ? (
                    <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <Play className="h-3.5 w-3.5 translate-x-px" strokeWidth={1.5} />
                  )}
                </button>
                {reveal && reveal.segments.length > 1 && (
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {reveal.segments.map((_, i) => {
                      const isPast = i < reveal.segmentIndex;
                      const isCurrent = i === reveal.segmentIndex;
                      return (
                        <span
                          key={i}
                          className="rounded-full transition-all duration-300 ease-out"
                          style={{
                            height: "0.3rem",
                            width: isCurrent ? "1.25rem" : "0.3rem",
                            backgroundColor: isPast || isCurrent ? "hsl(var(--amber))" : "hsl(var(--border))",
                            opacity: isPast ? 0.5 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => void immersiveNext()}
                disabled={isLoading || waitingForNext || atVeryEnd}
                aria-label="Next passage"
                className="group font-display italic text-lg text-text-tertiary transition-colors hover:text-foreground disabled:opacity-25 disabled:hover:text-text-tertiary"
              >
                {isLoading || waitingForNext ? (
                  <span className="flex items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                  </span>
                ) : (
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                )}
              </button>
            </div>

            {/* Passage counter */}
            {totalPages > 0 && (
              <span className="font-display italic text-xs text-text-tertiary tabular-nums">
                passage {pageIndex + 1} of {totalPages}
              </span>
            )}
          </div>
        ) : (
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          {/* Previous — italic text-link */}
          <button
            onClick={handlePrev}
            disabled={pageIndex <= 0}
            className="group font-display italic text-sm text-text-tertiary hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:text-text-tertiary"
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            <span className="ml-1 hidden sm:inline">previous passage</span>
          </button>

          {/* Counter — italic Lora */}
          {totalPages > 0 && (
            <span className="font-display italic text-xs text-text-tertiary tabular-nums">
              {onCompletionPage ? "fin" : `passage ${pageIndex + 1} of ${totalPages}`}
            </span>
          )}

          {/* Right side — Finish, Conclude, primary CTA, or Next text-link */}
          {onCompletionPage ? (
            <Button
              onClick={() => navigate(model.backLink)}
              variant="outline"
              className="rounded-xl px-6 text-sm font-medium"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              Finish
            </Button>
          ) : isOnLastContentPage && model.isComplete ? (
            <Button
              onClick={() => setPageIndex(completionPageIndex)}
              variant="outline"
              className="group rounded-xl px-6 text-sm font-medium"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              Conclude
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Button>
          ) : isOnLastPage || hasNoPages ? (
            <Button
              onClick={handleNext}
              disabled={isLoading || waitingForNext}
              variant="outline"
              className="rounded-xl px-6 text-sm font-medium"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 flex items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                  </span>
                  Loading…
                </>
              ) : waitingForNext ? (
                <>
                  <span className="mr-2 flex items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                  </span>
                  Preparing…
                </>
              ) : hasNoPages ? (
                "Begin"
              ) : (
                "Continue"
              )}
            </Button>
          ) : (
            <button
              onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
              disabled={pageIndex >= totalPages - 1}
              className="group font-display italic text-sm text-text-tertiary hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:text-text-tertiary"
            >
              <span className="mr-1 hidden sm:inline">next passage</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          )}
        </div>
        )}
      </div>

      {isAsking && (
        <aside className="fixed right-0 top-0 bottom-0 z-[60] flex w-full max-w-[400px] flex-col border-l border-border/40 bg-background animate-in slide-in-from-right duration-300 [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]">
          {/* Header — italic Lora label with a single amber hairline */}
          <div className="border-b border-border/20 bg-background/60 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-3">
              <p className="font-display italic text-sm text-foreground">
                Professor Metis pauses
              </p>
              <button
                onClick={dismissAside}
                disabled={isThinking}
                className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-foreground disabled:opacity-30"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-px" style={{ backgroundColor: "hsl(var(--amber) / 0.4)" }} />
          </div>

          {/* Exchanges */}
          <div className="flex-1 overflow-y-auto px-7 py-7">
            {exchanges.length === 0 && !pendingQuestion && (
              <div className="pb-4">
                <p className="font-display text-2xl italic tracking-tight text-foreground mb-3">
                  What would you like to ask?
                </p>
                <p className="text-sm text-text-tertiary leading-relaxed">
                  The lecture stays beside you; refer to it as you write.
                </p>
              </div>
            )}

            <div className="space-y-10">
              {exchanges.map((ex, i) => (
                <div key={i}>
                  <p
                    className="mb-5 pl-3 text-sm italic text-text-tertiary/70 border-l-2"
                    style={{ borderColor: "hsl(var(--amber) / 0.45)" }}
                  >
                    {ex.question}
                  </p>
                  <article
                    className={cn(
                      "prose prose-neutral dark:prose-invert max-w-none",
                      "prose-p:font-display prose-p:italic prose-p:text-[17px] prose-p:leading-[1.85] prose-p:text-foreground/90",
                      "prose-headings:font-display prose-headings:italic prose-headings:tracking-tight",
                      "prose-strong:text-foreground prose-strong:font-semibold",
                      "prose-code:text-foreground/80 prose-code:bg-surface prose-code:rounded prose-code:px-1",
                      "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto",
                      "[&_.katex]:text-foreground",
                    )}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {preprocessMath(ex.answer)}
                    </ReactMarkdown>
                  </article>
                  {i < exchanges.length - 1 && (
                    <div className="mt-10 h-px bg-border/40" />
                  )}
                </div>
              ))}

              {pendingQuestion && (
                <div>
                  <p
                    className="mb-5 pl-3 text-sm italic text-text-tertiary/70 border-l-2"
                    style={{ borderColor: "hsl(var(--amber) / 0.45)" }}
                  >
                    {pendingQuestion}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                  </div>
                </div>
              )}
              <div ref={exchangesEndRef} />
            </div>
          </div>

          {/* Input — hairline-bordered, italic placeholder */}
          <div className="border-t border-border/30 px-6 py-5">
            <form onSubmit={handleAsk}>
              <div className="border-b border-border/40 transition-colors focus-within:border-foreground/40">
                <textarea
                  autoFocus
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAsk(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={exchanges.length === 0 ? 3 : 2}
                  disabled={isThinking}
                  className="w-full resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground placeholder:text-text-tertiary placeholder:font-display placeholder:italic focus:outline-none disabled:opacity-50"
                  placeholder={
                    exchanges.length === 0
                      ? "anything about what we just covered…"
                      : "a follow-up…"
                  }
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                {exchanges.length > 0 ? (
                  <button
                    type="button"
                    onClick={dismissAside}
                    disabled={isThinking}
                    className="group font-display italic text-sm text-text-tertiary transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-text-tertiary"
                  >
                    <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
                    <span className="ml-1">back to the lecture</span>
                  </button>
                ) : (
                  <span className="label-whisper text-text-tertiary">⌘↵ to ask</span>
                )}
                <button
                  type="submit"
                  disabled={!question.trim() || isThinking}
                  className="group font-display italic text-sm text-text-tertiary hover:text-amber transition-colors disabled:opacity-30 disabled:hover:text-text-tertiary"
                >
                  ask
                  <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}
