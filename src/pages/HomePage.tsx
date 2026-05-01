import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { setChat } from "@/lib/service";

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
            onClick={handleGetStarted}
            className="mt-8 rounded-xl px-8 font-medium"
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
          className="mt-8 rounded-xl px-8 font-medium"
          onClick={() => void createJourney()}
        >
          Create a journey
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Quick links */}
      <div className="mt-16 grid w-full max-w-2xl gap-2 opacity-0 animate-fade-in-up [animation-delay:200ms] md:grid-cols-3">
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
            className="group rounded-xl bg-surface p-5 transition-all duration-200 hover:bg-surface-hover"
          >
            <link.icon
              className="mb-3 h-4 w-4 transition-colors"
              strokeWidth={1.5}
              style={{ color: "hsl(var(--amber))" }}
            />
            <h3 className="mb-1 text-sm font-medium text-foreground">{link.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
