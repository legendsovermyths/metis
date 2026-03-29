import { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";

interface MetisInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  visible: boolean;
}

const MetisInput = ({ onSubmit, disabled, visible }: MetisInputProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pb-6 pt-8 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative flex items-end bg-input-surface border border-border rounded-xl shadow-sm">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Metis anything…"
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent px-4 py-3 text-sm font-sans-ui text-foreground placeholder:text-muted-foreground resize-none outline-none max-h-32"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="m-1.5 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 transition-opacity hover:opacity-90"
            aria-label="Submit"
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2 font-sans-ui">
          Metis teaches through focused, full-screen explanations
        </p>
      </div>
    </div>
  );
};

export default MetisInput;
