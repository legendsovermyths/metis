interface Phase {
  label: string;
  active: boolean;
  complete: boolean;
}

interface PhaseIndicatorProps {
  phases: Phase[];
}

const PhaseIndicator = ({ phases }: PhaseIndicatorProps) => {
  return (
    <div className="flex items-center gap-1 select-none">
      {phases.map((phase, i) => (
        <div key={phase.label} className="flex items-center gap-1">
          {i > 0 && (
            <div
              className={`w-4 h-px transition-colors duration-500 ${
                phase.complete || phase.active
                  ? "bg-accent/40"
                  : "bg-border"
              }`}
            />
          )}
          <div className="flex items-center gap-1.5">
            <div
              className={`rounded-full transition-all duration-500 ${
                phase.active
                  ? "w-1.5 h-1.5 bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.3)]"
                  : phase.complete
                  ? "w-1 h-1 bg-accent/50"
                  : "w-1 h-1 bg-border"
              }`}
            />
            <span
              className={`text-[10px] tracking-widest uppercase font-sans-ui transition-all duration-500 ${
                phase.active
                  ? "text-accent/80"
                  : phase.complete
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground/25"
              }`}
            >
              {phase.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhaseIndicator;
