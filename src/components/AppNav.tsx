import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Compass, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/library", label: "Library", icon: BookOpen },
  { path: "/journeys", label: "Journeys", icon: Compass },
];

export function AppNav() {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl md:relative md:bottom-auto md:border-t-0 md:border-b md:bg-transparent md:backdrop-blur-none">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 md:px-8">
        {/* Logo - desktop only */}
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <span className="text-lg font-semibold tracking-tight text-foreground">Metis</span>
        </Link>

        {/* Nav items */}
        <div className="flex w-full items-center justify-around md:w-auto md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-colors duration-200 md:flex-row md:gap-2 md:rounded-lg md:px-4 md:py-2 md:text-sm",
                  isActive
                    ? "text-foreground"
                    : "text-text-tertiary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 md:h-4 md:w-4", isActive && "text-foreground")} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-foreground md:hidden" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="hidden items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:flex"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  );
}
