import { useEffect, useRef, useMemo } from "react";
import PhaseLabel from "./PhaseLabel";
import katex from "katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import c from "highlight.js/lib/languages/c";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("c", c);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);

interface TeachingAreaProps {
  content: string;
  isTeaching: boolean;
  onFinished: () => void;
  phaseLabel?: string;
}



type Token =
  | { type: "word"; text: string }
  | { type: "heading"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "code"; text: string }
  | { type: "code-block"; code: string; lang: string }
  | { type: "latex-block"; latex: string }
  | { type: "latex-inline"; latex: string }
  | { type: "image"; src: string; alt: string }
  | { type: "newline" };

function tokenize(content: string): Token[] {
  const tokens: Token[] = [];
  const lines = content.split("\n");

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      tokens.push({ type: "newline" });
      i++;
      continue;
    }

    // Fenced code block ```lang ... ```
    const fenceMatch = trimmed.match(/^```(\w*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      tokens.push({ type: "code-block", code: codeLines.join("\n"), lang });
      tokens.push({ type: "newline" });
      continue;
    }

    // Heading
    if (trimmed.startsWith("## ")) {
      tokens.push({ type: "heading", text: trimmed.slice(3) });
      tokens.push({ type: "newline" });
      i++;
      continue;
    }

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      tokens.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      tokens.push({ type: "newline" });
      i++;
      continue;
    }

    // Display LaTeX block: $$...$$
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      tokens.push({ type: "latex-block", latex: trimmed.slice(2, -2).trim() });
      tokens.push({ type: "newline" });
      i++;
      continue;
    }

    // Parse line into words, detecting inline latex $...$, **bold**, *italic*
    let remaining = trimmed;
    while (remaining.length > 0) {
      remaining = remaining.trimStart();
      if (!remaining) break;

      // Inline LaTeX $...$
      const inlineLatex = remaining.match(/^\$([^$]+)\$/);
      if (inlineLatex) {
        tokens.push({ type: "latex-inline", latex: inlineLatex[1] });
        remaining = remaining.slice(inlineLatex[0].length);
        continue;
      }

      // Bold **...**
      const bold = remaining.match(/^\*\*([^*]+)\*\*/);
      if (bold) {
        tokens.push({ type: "bold", text: bold[1] });
        remaining = remaining.slice(bold[0].length);
        continue;
      }

      // Italic *...*
      const italic = remaining.match(/^\*([^*]+)\*/);
      if (italic) {
        tokens.push({ type: "italic", text: italic[1] });
        remaining = remaining.slice(italic[0].length);
        continue;
      }

      // Code `...`
      const code = remaining.match(/^`([^`]+)`/);
      if (code) {
        tokens.push({ type: "code", text: code[1] });
        remaining = remaining.slice(code[0].length);
        continue;
      }

      // Regular word (up to next special char or space)
      const word = remaining.match(/^[^\s$*`]+/);
      if (word) {
        tokens.push({ type: "word", text: word[0] });
        remaining = remaining.slice(word[0].length);
        continue;
      }

      // Fallback: skip one char
      remaining = remaining.slice(1);
    }

    tokens.push({ type: "newline" });
    i++;
  }

  return tokens;
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust: true,
    });
  } catch {
    return latex;
  }
}

const TeachingArea = ({ content, isTeaching, onFinished, phaseLabel = "Teaching" }: TeachingAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => tokenize(content), [content]);

  useEffect(() => {
    if (isTeaching && content) {
      const timer = setTimeout(() => onFinished(), 800);
      return () => clearTimeout(timer);
    }
  }, [content, isTeaching, onFinished]);

  if (!content) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 pt-16 pb-40"
      style={{ animation: "content-fade-in 0.8s ease-out forwards" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <PhaseLabel label={phaseLabel} />
        </div>
        <div className="teaching-prose">
          {tokens.map((token, i) => {
            switch (token.type) {
              case "newline":
                return <br key={i} />;
              case "heading":
                return (
                  <span key={i} className="block mt-8 mb-3 text-2xl font-semibold text-teaching-heading">
                    {token.text}
                  </span>
                );
              case "image":
                return (
                  <div key={i} className="my-8 flex justify-center">
                    <img
                      src={token.src}
                      alt={token.alt}
                      className="max-w-lg w-full h-auto dark:invert opacity-85"
                      loading="lazy"
                    />
                  </div>
                );
              case "bold":
                return (
                  <span key={i} className="inline font-semibold text-teaching-heading">
                    {token.text}{" "}
                  </span>
                );
              case "italic":
                return (
                  <span key={i} className="inline italic font-light">
                    {token.text}{" "}
                  </span>
                );
              case "code":
                return (
                  <span key={i} className="inline font-mono-code text-[0.85em] px-1 py-0.5 rounded bg-highlight">
                    {token.text}{" "}
                  </span>
                );
              case "latex-block":
                return (
                  <div
                    key={i}
                    className="my-6 overflow-x-auto text-center"
                    dangerouslySetInnerHTML={{ __html: renderLatex(token.latex, true) }}
                  />
                );
              case "latex-inline":
                return (
                  <span
                    key={i}
                    className="inline"
                    dangerouslySetInnerHTML={{ __html: renderLatex(token.latex, false) + " " }}
                  />
                );
              case "code-block": {
                let highlighted: string;
                try {
                  highlighted = token.lang && hljs.getLanguage(token.lang)
                    ? hljs.highlight(token.code, { language: token.lang }).value
                    : hljs.highlightAuto(token.code).value;
                } catch {
                  highlighted = token.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }
                return (
                  <div key={i} className="my-6 rounded-lg overflow-hidden border border-border">
                    {token.lang && (
                      <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase font-sans-ui text-muted-foreground bg-muted/50 border-b border-border">
                        {token.lang}
                      </div>
                    )}
                    <pre className="p-4 overflow-x-auto bg-muted/30">
                      <code
                        className="text-sm font-mono-code leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                      />
                    </pre>
                  </div>
                );
              }
              case "word":
              default:
                return (
                  <span key={i} className="inline">
                    {(token as { text: string }).text}{" "}
                  </span>
                );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default TeachingArea;
