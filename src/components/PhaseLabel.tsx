interface PhaseLabelProps {
  label: string;
}

const PhaseLabel = ({ label }: PhaseLabelProps) => {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_hsl(var(--accent)/0.3)]" />
      <span className="text-[10px] tracking-widest uppercase font-sans-ui text-accent/80">
        {label}
      </span>
    </div>
  );
};

export default PhaseLabel;
