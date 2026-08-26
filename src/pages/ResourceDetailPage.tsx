import { useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Watermark } from "@/components/Watermark";
import { useResources } from "@/context/ResourceContext";
import { useTasks } from "@/context/TasksContext";
import { createJourney, type AgentResponseInstruction, type Resource } from "@/lib/service";
import { canBuildJourney, resourceCover, resourceStructure } from "@/lib/resources";
import { useMasthead, mastheadStyle } from "@/lib/editorial";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const masthead = useMasthead();
  const { resources, loading, remove } = useResources();
  const tasks = useTasks();
  const [building, setBuilding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // A build the reader has asked for but not yet confirmed. `label` names what
  // they're about to weave (the whole volume, or a single chapter).
  const [pending, setPending] = useState<{ instruction: AgentResponseInstruction; label: string } | null>(null);

  const resource = useMemo<Resource | undefined>(
    () => resources.find((r) => String(r.id) === id),
    [resources, id],
  );

  const confirmBuild = () => {
    if (!pending) return;
    const { instruction } = pending;
    setPending(null);
    void build(instruction);
  };

  const confirmRemove = async () => {
    if (!resource || resource.id == null || removing) return;
    setRemoving(true);
    try {
      await remove(resource.id);
      toast.success("Removed from your library", {
        description: `“${resource.title}” is gone, and Metis will no longer see it.`,
      });
      navigate("/library");
    } catch {
      setRemoving(false);
      // Error already surfaced via toast by the service layer.
    }
  };

  const build = async (instruction: AgentResponseInstruction) => {
    if (!resource || resource.id == null || building) return;
    setBuilding(true);
    try {
      await createJourney({
        resource_id: resource.id,
        response_instruction: instruction,
        advisor_notes: "",
      });
      await tasks.refresh();
      toast.success("Weaving your journey", {
        description: "Metis is charting the course. It will appear in your study.",
      });
      navigate("/studies");
    } catch {
      setBuilding(false);
      // Error already surfaced via toast by the service layer.
    }
  };

  const cover = resource ? resourceCover(resource.resource_type) : null;
  const structure = resource ? resourceStructure(resource.resource_type) : { type: "none" as const };

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] flex flex-col pb-20 md:pb-0">
      <Watermark />
      <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">
        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/library"
              className="group inline-flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="label-whisper">The library</span>
            </Link>
            {resource && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="group inline-flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span className="label-whisper">Remove</span>
              </button>
            )}
          </div>
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · A Volume</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">
          {loading && !resource && (
            <div className="flex items-center justify-center gap-1.5 py-32">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
            </div>
          )}

          {!loading && !resource && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in-settle">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">
                ◇
              </span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed">
                This volume is not on the shelf.
              </p>
            </div>
          )}

          {resource && cover && (
            <>
              {/* Hero — the title plate */}
              <section className="relative mb-12 animate-blur-in">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 right-0 select-none font-display italic leading-none"
                  style={{ fontSize: "10rem", color: cover.palette.glyphColor, opacity: 0.08 }}
                >
                  {cover.glyph}
                </span>
                <p className="label-whisper text-text-tertiary mb-3">
                  {cover.detail ? `${cover.kindLabel} · ${cover.detail}` : cover.kindLabel}
                </p>
                <h1 className="display-hero text-4xl md:text-5xl text-foreground text-balance max-w-2xl">
                  {resource.title}
                </h1>
                <div
                  className="h-px w-12 mt-5 mb-5 animate-reveal-line"
                  style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
                />
                {resource.description && (
                  <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-xl">
                    {resource.description}
                  </p>
                )}

                {/* Document / whole-resource journey action */}
                {canBuildJourney(resource) && structure.type !== "chapters" && (
                  <button
                    onClick={() => setPending({ instruction: "None", label: resource.title })}
                    disabled={building}
                    className="group mt-7 inline-flex items-center gap-1.5 rounded-xl border px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
                  >
                    {building ? "weaving…" : "Weave a journey from this"}
                    {!building && (
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    )}
                  </button>
                )}
              </section>

              {/* Contents */}
              {structure.type === "chapters" && (
                <section>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="label-whisper text-text-tertiary">Table of Contents</span>
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="label-whisper text-text-tertiary">
                      pick a chapter to begin
                    </span>
                  </div>
                  <ul>
                    {structure.chapters.map((ch, ci) => (
                      <li
                        key={ci}
                        className="group border-b border-border/15 last:border-0 py-4 animate-blur-in"
                        style={{ animationDelay: `${Math.min(ci * 40, 400)}ms` }}
                      >
                        <button
                          onClick={() => setPending({ instruction: { ChapterTitle: ch.title }, label: ch.title })}
                          disabled={building}
                          className="flex w-full items-baseline gap-3 text-left disabled:opacity-50"
                        >
                          <span className="font-display italic text-text-tertiary group-hover:text-amber transition-colors w-8 shrink-0 tabular-nums">
                            {ci + 1}
                          </span>
                          <span className="font-display italic text-[1.05rem] text-foreground/85 group-hover:text-foreground transition-colors">
                            {ch.title}
                          </span>
                          <span className="flex-1 mx-2 border-b border-dotted border-border/50 relative -top-1" />
                          <span className="label-whisper text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            begin →
                          </span>
                        </button>
                        {ch.topics.length > 0 && (
                          <div className="mt-2 pl-11 flex flex-wrap gap-x-4 gap-y-1">
                            {ch.topics.map((t, ti) => (
                              <span key={ti} className="text-sm text-text-tertiary">
                                {t.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {structure.type === "sections" && (
                <section>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="label-whisper text-text-tertiary">Sections</span>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>
                  <ul>
                    {structure.sections.map((s, si) => (
                      <li
                        key={si}
                        className="border-b border-border/15 last:border-0 py-4 animate-blur-in"
                        style={{ animationDelay: `${Math.min(si * 40, 400)}ms` }}
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-display italic text-text-tertiary w-8 shrink-0 tabular-nums">
                            {si + 1}
                          </span>
                          <span className="font-display italic text-[1.05rem] text-foreground/85">
                            {s.title}
                          </span>
                        </div>
                        {s.sub_sections.length > 0 && (
                          <div className="mt-2 pl-11 flex flex-wrap gap-x-4 gap-y-1">
                            {s.sub_sections.map((ss, ssi) => (
                              <span key={ssi} className="text-sm text-text-tertiary">
                                {ss.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>

        {/* Confirm before weaving — building a journey is not instant, so ask first */}
        <AlertDialog open={pending !== null} onOpenChange={(o) => { if (!o) setPending(null); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Weave a journey from this?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                Metis will chart a course through{" "}
                <span className="text-foreground/80">{pending?.label}</span> and weave it into a
                journey. It takes a little while, and will appear in your study when it's ready.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
                Not yet
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBuild}
                className="font-display italic text-sm bg-foreground/90 text-background hover:bg-foreground"
              >
                Weave it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm before removing — deleting a resource is permanent */}
        <AlertDialog open={confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(false); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Remove this from your library?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                <span className="text-foreground/80">{resource?.title}</span> will be taken off the
                shelf and Metis will no longer see it. Journeys or explanations you've already woven
                from it stay where they are.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemove}
                disabled={removing}
                className="font-display italic text-sm bg-destructive/90 text-background hover:bg-destructive"
              >
                {removing ? "removing…" : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Colophon */}
        <footer className="pb-8 md:pb-10">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  fol. ii  —</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
