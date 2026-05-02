import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { setChat } from "@/lib/service";

const quickLinks = [
  { title: "Start a conversation", path: "/chat" },
  { title: "Browse your library", path: "/library" },
  { title: "Continue a journey", path: "/journeys" },
];

export default function HomePage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const onboarded = context ? context.chat.phase !== "Onboarding" : false;

  const goToChatFresh = async () => {
    if (context) {
      await setChat({ ...context.chat, is_done: false });
    }
    navigate("/chat");
  };

  const createJourney = async () => {
    if (context) {
      await setChat({ ...context.chat, phase: "Advising", is_done: false });
    }
    navigate("/chat");
  };

  const handleGetStarted = async () => {
    if (context) {
      await setChat({ ...context.chat, phase: "Onboarding", is_done: false });
    }
    navigate("/chat");
  };

  if (!onboarded) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center px-6">
        <div className="animate-fade-in mx-auto max-w-2xl text-center">
          <span className="block font-display text-6xl italic tracking-tight text-foreground md:text-7xl mb-6">
            Metis
          </span>
          <h1 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Welcome to your personal tutor
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground leading-relaxed">
            Metis guides you through ideas using questions, not answers. Let's start by getting to know you.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={handleGetStarted}
            className="mt-8 rounded-xl px-8 font-medium"
            style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.4)" }}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-texture flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 pb-24 md:pb-6">
      {/* Hero */}
      <div className="animate-fade-in mx-auto max-w-2xl text-center">
        <span className="block font-display text-6xl italic tracking-tight text-foreground md:text-7xl mb-6">
          Metis
        </span>
        <h1 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          What would you like to rediscover today?
        </h1>
        <p className="mx-auto max-w-md text-base text-muted-foreground leading-relaxed">
          Metis guides you through ideas using questions, not answers. Learn by thinking.
        </p>

        <Button
          size="lg"
          variant="outline"
          className="mt-8 rounded-xl px-8 font-medium"
          style={{ color: "hsl(var(--amber))", borderColor: "hsl(var(--amber) / 0.4)" }}
          onClick={() => void createJourney()}
        >
          Create a journey
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Quick links */}
      <div className="mt-16 w-full max-w-sm opacity-0 animate-fade-in-up [animation-delay:200ms]">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={
              link.path === "/chat"
                ? (e) => {
                    e.preventDefault();
                    void goToChatFresh();
                  }
                : undefined
            }
            className="group flex items-center justify-between border-b border-border/30 py-4 last:border-0 transition-colors hover:text-foreground"
          >
            <span className="text-sm font-medium text-foreground">{link.title}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
