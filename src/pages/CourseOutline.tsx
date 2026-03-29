import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetisNavbar from "@/components/MetisNavbar";
import { ArrowRight, ChevronLeft, Circle, CheckCircle2 } from "lucide-react";

interface Subtopic {
  title: string;
  done: boolean;
}

interface Arc {
  title: string;
  description: string;
  subtopics: Subtopic[];
}

const demoOutline: { title: string; arcs: Arc[] } = {
  title: "Foundations of Calculus",
  arcs: [
    {
      title: "Arc 1 — Limits & Continuity",
      description: "Building intuition for approaching values and smooth behaviour.",
      subtopics: [
        { title: "What is a limit?", done: true },
        { title: "One-sided limits", done: true },
        { title: "The epsilon-delta definition", done: false },
        { title: "Continuity and its types", done: false },
      ],
    },
    {
      title: "Arc 2 — Derivatives",
      description: "Understanding rates of change and the slope of curves.",
      subtopics: [
        { title: "The derivative as a limit", done: false },
        { title: "Power rule and basic rules", done: false },
        { title: "Chain rule", done: false },
        { title: "Implicit differentiation", done: false },
        { title: "Applications of derivatives", done: false },
      ],
    },
    {
      title: "Arc 3 — Integration",
      description: "From accumulation to area — the reverse of differentiation.",
      subtopics: [
        { title: "Riemann sums", done: false },
        { title: "The Fundamental Theorem", done: false },
        { title: "Techniques of integration", done: false },
        { title: "Definite vs indefinite integrals", done: false },
      ],
    },
    {
      title: "Arc 4 — Applications",
      description: "Putting it all together with real-world problems.",
      subtopics: [
        { title: "Area between curves", done: false },
        { title: "Volumes of revolution", done: false },
        { title: "Differential equations intro", done: false },
      ],
    },
  ],
};

const CourseOutline = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const totalTopics = demoOutline.arcs.reduce((s, a) => s + a.subtopics.length, 0);
  const doneTopics = demoOutline.arcs.reduce((s, a) => s + a.subtopics.filter((t) => t.done).length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MetisNavbar
        onMenuClick={() => {}}
        isDark={document.documentElement.classList.contains("dark")}
        onToggleTheme={() => {}}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-sans-ui text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        {/* Header */}
        <div
          className="mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-3">
            {demoOutline.title}
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            {doneTopics} of {totalTopics} topics complete
          </p>
          {/* Progress bar */}
          <div className="mt-4 h-[3px] w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.round((doneTopics / totalTopics) * 100)}%` }}
            />
          </div>
        </div>

        {/* Journey line with arcs */}
        <div className="relative">
          {/* Vertical journey line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-10">
            {demoOutline.arcs.map((arc, arcIdx) => {
              const arcDone = arc.subtopics.filter((s) => s.done).length;
              const arcTotal = arc.subtopics.length;
              const arcComplete = arcDone === arcTotal;

              return (
                <div
                  key={arcIdx}
                  className="relative pl-8 transition-all duration-500 ease-out"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(10px)",
                    transitionDelay: `${200 + arcIdx * 120}ms`,
                  }}
                >
                  {/* Node on the line */}
                  <div className="absolute left-0 top-1.5">
                    {arcComplete ? (
                      <CheckCircle2 size={15} className="text-accent" />
                    ) : (
                      <Circle
                        size={15}
                        className={arcDone > 0 ? "text-accent" : "text-border"}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Arc content */}
                  <div>
                    <h2 className="font-serif text-lg text-foreground mb-1">
                      {arc.title}
                    </h2>
                    <p className="text-xs text-muted-foreground/70 font-sans mb-4">
                      {arc.description}
                    </p>

                    {/* Subtopics */}
                    <div className="space-y-1.5">
                      {arc.subtopics.map((topic, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center gap-2.5 py-1.5 px-3 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer group"
                        >
                          {topic.done ? (
                            <CheckCircle2 size={13} className="text-accent shrink-0" />
                          ) : (
                            <Circle size={13} className="text-border shrink-0" strokeWidth={1.5} />
                          )}
                          <span
                            className={`text-sm font-sans ${
                              topic.done
                                ? "text-muted-foreground line-through decoration-border"
                                : "text-foreground/80"
                            }`}
                          >
                            {topic.title}
                          </span>
                          {!topic.done && (
                            <ArrowRight
                              size={12}
                              className="ml-auto text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Arc progress */}
                    <p className="text-[11px] text-muted-foreground/40 font-sans-ui mt-3">
                      {arcDone}/{arcTotal} complete
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start / Continue button */}
        <div
          className="mt-14 mb-8 text-center transition-all duration-700 delay-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
          }}
        >
          <button
            onClick={() => navigate("/learn")}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-sans-ui text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            {doneTopics > 0 ? "Continue learning" : "Begin course"}
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </main>
    </div>
  );
};

export default CourseOutline;
