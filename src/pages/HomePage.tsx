import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { setChat } from "@/lib/service";
import { useMasthead, mastheadStyle } from "@/lib/editorial";

const tableOfContents = [
  { numeral: "i.",   title: "begin a dialogue",      folio: "f. i",   path: "/chat" },
  { numeral: "ii.",  title: "the library",           folio: "f. ii",  path: "/library" },
  { numeral: "iii.", title: "journeys in progress",  folio: "f. iii", path: "/journeys" },
];

// Placeholder until a profile-aware, LLM-authored greeting replaces this.
const greeting = {
  salutation: "An hour set aside for thinking.",
  invitation: "The page is open, begin where you like.",
};

export default function HomePage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const masthead = useMasthead();
  const onboarded = context ? context.chat.phase !== "Onboarding" : false;

  const goToChatFresh = async () => {
    if (context) await setChat({ ...context.chat, phase: "Exploring", is_done: false, pending_action: null });
    navigate("/chat");
  };

  const createJourney = async () => {
    if (context) await setChat({ ...context.chat, phase: "Advising", is_done: false, pending_action: null });
    navigate("/chat");
  };

  const handleGetStarted = async () => {
    if (context) await setChat({ ...context.chat, phase: "Onboarding", is_done: false, pending_action: null });
    navigate("/chat");
  };

  if (!onboarded) {
    return (
      <div className="paper-texture relative overflow-hidden min-h-screen flex flex-col">
        {/* Masthead — title page */}
        <header className="relative z-10 px-6 md:px-16 pt-10 md:pt-12">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>A tutor in the Socratic mode</span>
            <span className="hidden sm:inline">First Edition · {masthead.yearRoman}</span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        {/* Title plate — desktop */}
        <main className="relative z-10 hidden md:flex flex-1 items-center justify-center px-16">
          <div className="text-center animate-blur-in flex flex-col items-center">
            <span className="label-whisper text-text-tertiary mb-7">— a personal athenaeum —</span>
            <h1 className="display-hero text-[clamp(7rem,13vw,13rem)] text-foreground leading-none">
              Metis
            </h1>
            <div
              className="h-px w-24 mt-8 mb-8 animate-reveal-line"
              style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "center" }}
            />
            <p className="font-display italic text-xl text-foreground leading-relaxed max-w-xl mb-3">
              We begin not with answers, but with questions.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mb-12">
              Tell me what you know, and what you do not, and we shall find our way.
            </p>
            <Button
              variant="outline"
              onClick={() => void handleGetStarted()}
              className="rounded-xl px-10 py-5 text-sm font-medium tracking-wide"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              Begin
            </Button>
          </div>
        </main>

        {/* Title plate — mobile */}
        <main className="relative z-10 md:hidden flex-1 flex flex-col justify-center px-6 py-16">
          <div className="animate-blur-in">
            <span className="label-whisper text-text-tertiary block mb-5">— a personal athenaeum —</span>
            <h1 className="display-hero text-8xl text-foreground leading-none mb-0">
              Metis
            </h1>
            <div
              className="h-px w-12 mt-5 mb-5 animate-reveal-line"
              style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
            />
            <p className="font-display italic text-base text-foreground leading-relaxed mb-1.5 max-w-xs">
              We begin not with answers, but with questions.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-xs">
              Tell me what you know, and what you do not, and we shall find our way.
            </p>
            <Button
              variant="outline"
              onClick={() => void handleGetStarted()}
              className="rounded-xl px-8 py-5 text-sm font-medium"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              Begin
            </Button>
          </div>
        </main>

        {/* Colophon — title page */}
        <footer className="relative z-10 px-6 md:px-16 pb-10 md:pb-12">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  i  —</span>
          </div>
        </footer>

        {/* Italic M monogram watermark */}
        <span
          className="pointer-events-none select-none font-display font-light italic absolute -bottom-12 -right-6 leading-none"
          style={{ fontSize: "42vh", color: "hsl(var(--foreground) / 0.022)", lineHeight: 0.8 }}
          aria-hidden
        >
          M
        </span>
      </div>
    );
  }

  // ── Onboarded — reading desk ──────────────────────────────────────────────
  return (
    <div className="paper-texture relative overflow-hidden min-h-[calc(100vh-57px)] flex flex-col">
      {/* Masthead */}
      <header className="relative z-10 px-6 md:px-16 pt-8 md:pt-10">
        <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
          <span>Metis · A Personal Athenaeum</span>
          <span className="hidden sm:inline">
            {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-border/40" />
      </header>

      {/* Reading desk — desktop */}
      <main className="relative z-10 hidden md:grid flex-1 md:grid-cols-[1.35fr_1fr] md:gap-20 lg:gap-28 md:items-center md:px-16 lg:px-20 md:py-14">
        {/* Hero column */}
        <section className="animate-blur-in flex flex-col">
          <span className="label-whisper text-text-tertiary mb-7">— an hour set aside —</span>
          <h1 className="display-hero text-[clamp(6rem,12vw,12rem)] text-foreground leading-none mb-0">
            Metis
          </h1>
          <div
            className="h-px w-16 mt-7 mb-9 animate-reveal-line"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <p className="font-display italic text-2xl text-foreground leading-snug mb-3">
            {greeting.salutation}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mb-10">
            {greeting.invitation}
          </p>
          <div className="flex items-center gap-7">
            <Button
              variant="outline"
              onClick={() => void createJourney()}
              className="w-fit rounded-xl px-8 py-5 text-sm font-medium"
              style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
            >
              Create a journey
            </Button>
            <button
              onClick={() => void goToChatFresh()}
              className="group text-sm text-text-tertiary hover:text-foreground transition-colors font-display italic"
            >
              or, begin a fresh dialogue
              <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </div>
        </section>

        {/* Table of contents column */}
        <aside className="opacity-0 animate-blur-in [animation-delay:180ms] flex flex-col">
          <span className="label-whisper text-text-tertiary mb-3">Table of Contents</span>
          <div className="h-px w-full bg-border/40 mb-1" />
          <ul>
            {tableOfContents.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={
                    link.path === "/chat"
                      ? (e) => { e.preventDefault(); void goToChatFresh(); }
                      : undefined
                  }
                  className="group flex items-baseline py-3.5 text-text-secondary hover:text-foreground transition-colors duration-200 border-b border-border/15 last:border-0"
                >
                  <span className="font-display italic text-text-tertiary group-hover:text-amber transition-colors w-10 shrink-0">
                    {link.numeral}
                  </span>
                  <span className="text-sm">{link.title}</span>
                  <span className="flex-1 mx-3 border-b border-dotted border-border/60 relative -top-1" />
                  <span className="label-whisper text-text-tertiary">{link.folio}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Marginalia */}
          <div className="mt-16 pl-6 border-l border-border/30 max-w-sm">
            <p className="font-display italic text-sm text-text-tertiary leading-relaxed">
              To learn is to find the question that is yours to ask.
            </p>
            <p className="label-whisper text-text-tertiary mt-3">— marginalia</p>
          </div>
        </aside>
      </main>

      {/* Reading desk — mobile */}
      <main className="relative z-10 md:hidden flex-1 flex flex-col px-6 pt-10 pb-12">
        <div className="animate-blur-in">
          <span className="label-whisper text-text-tertiary block mb-5">— an hour set aside —</span>
          <h1 className="display-hero text-8xl text-foreground leading-none mb-0">
            Metis
          </h1>
          <div
            className="h-px w-12 mt-5 mb-7 animate-reveal-line"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <p className="font-display italic text-xl text-foreground leading-snug mb-2">
            {greeting.salutation}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-xs">
            {greeting.invitation}
          </p>
          <Button
            variant="outline"
            onClick={() => void createJourney()}
            className="w-full rounded-xl px-6 py-5 text-sm font-medium mb-2"
            style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.35)" }}
          >
            Create a journey
          </Button>
          <button
            onClick={() => void goToChatFresh()}
            className="w-full text-sm text-text-tertiary font-display italic py-3"
          >
            or, begin a fresh dialogue →
          </button>

          <div className="h-px w-full bg-border/30 mt-10 mb-4" />
          <span className="label-whisper text-text-tertiary block mb-1">Table of Contents</span>
          <ul>
            {tableOfContents.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={
                    link.path === "/chat"
                      ? (e) => { e.preventDefault(); void goToChatFresh(); }
                      : undefined
                  }
                  className="flex items-baseline py-3.5 text-text-secondary border-b border-border/15 last:border-0"
                >
                  <span className="font-display italic text-text-tertiary w-8 shrink-0">{link.numeral}</span>
                  <span className="text-sm">{link.title}</span>
                  <span className="flex-1 mx-3 border-b border-dotted border-border/60 relative -top-1" />
                  <span className="label-whisper text-text-tertiary">{link.folio}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Marginalia — mobile */}
          <div className="mt-10 pl-4 border-l border-border/30 max-w-xs">
            <p className="font-display italic text-sm text-text-tertiary leading-relaxed">
              To learn is to find the question that is yours to ask.
            </p>
            <p className="label-whisper text-text-tertiary mt-2">— marginalia</p>
          </div>
        </div>
      </main>

      {/* Colophon */}
      <footer className="relative z-10 px-6 md:px-16 pb-8 md:pb-10">
        <div className="h-px w-full bg-border/30 mb-4" />
        <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
          <span>μῆτις · gr. mêtis — cunning intelligence</span>
          <span>—  fol. i  —</span>
        </div>
      </footer>

      {/* Italic M monogram watermark */}
      <span
        className="hidden md:block pointer-events-none select-none font-display font-light italic absolute -bottom-16 -right-6 leading-none"
        style={{ fontSize: "44vh", color: "hsl(var(--foreground) / 0.022)", lineHeight: 0.8 }}
        aria-hidden
      >
        M
      </span>
    </div>
  );
}
