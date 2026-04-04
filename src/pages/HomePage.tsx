import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { setContext as setBackendContext } from "@/lib/service";

const quickLinks = [
  {
    title: "Start a conversation",
    description: "Ask anything, explore ideas through dialogue",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    title: "Browse your library",
    description: "Access your uploaded books and references",
    icon: BookOpen,
    path: "/library",
  },
  {
    title: "Continue a journey",
    description: "Pick up where you left off in your learning path",
    icon: Compass,
    path: "/journeys",
  },
];

export default function HomePage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const onboarded = context?.onboarded;

  const goToChatFresh = async () => {
    if (context) {
      await setBackendContext({
        ...context,
        chat_state: { ...context.chat_state, is_done: false },
      });
    }
    navigate("/chat");
  };

  const createJourney = async () => {
    if (context) {
      await setBackendContext({
        ...context,
        chat_state: {
          ...context.chat_state,
          phase: "Advising",
          is_done: false,
        },
      });
    }
    navigate("/chat");
  };

  const handleGetStarted = async () => {
    if (context) {
      await setBackendContext({
        ...context,
        chat_state: { ...context.chat_state, phase: "Onboarding", is_done: false },
      });
    }
    navigate("/chat");
  };

  if (!onboarded) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center px-6">
        <div className="animate-fade-in mx-auto max-w-2xl text-center">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            <span className="block text-5xl md:text-6xl font-serif tracking-tighter mb-4">Metis</span>
            Welcome to your personal tutor
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Metis guides you through ideas using questions, not answers. Let's start by getting to know you.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="mt-8 rounded-xl px-8 font-medium shadow-soft transition-shadow hover:shadow-medium"
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
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          <span className="block text-5xl md:text-6xl font-serif tracking-tighter mb-4">Metis</span>
          What would you like to rediscover today?
        </h1>
        <p className="mx-auto max-w-md text-base text-muted-foreground">
          Metis guides you through ideas using questions, not answers. Learn by thinking.
        </p>

        <Button
          size="lg"
          className="mt-8 rounded-xl px-8 font-medium shadow-soft transition-shadow hover:shadow-medium"
          onClick={() => void createJourney()}
        >
          Create a journey
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Quick links */}
      <div className="mt-16 grid w-full max-w-2xl gap-3 opacity-0 animate-fade-in-up [animation-delay:200ms] md:grid-cols-3">
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
            className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-medium hover:border-border/80"
          >
            <link.icon className="mb-3 h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={1.5} />
            <h3 className="mb-1 text-sm font-medium text-foreground">{link.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
