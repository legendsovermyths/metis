import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const ESC_DOLLAR = "ESCDOLLAR";

/**
 * Reshape inline `$$…$$` into fenced-block form so remark-math renders it as
 * display math (v6 only treats `$$` as display when the fences sit on their own
 * lines). Escaped `\$` (currency) is protected so it stays literal.
 */
export function normalizeDisplayMath(md: string): string {
  const protectedMd = md
    .split("\\$")
    .join(ESC_DOLLAR)
    // OpenAI models often emit LaTeX-style delimiters; remark-math only understands `$`.
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => `$$${tex}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => `$${tex.trim()}$`);
  const blocked = protectedMd.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_, tex) => `\n\n$$\n${tex.trim()}\n$$\n\n`,
  );
  return blocked.split(ESC_DOLLAR).join("\\$");
}

/** ReactMarkdown wired with remark-math + rehype-katex and display-math normalization. */
export function MathMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {normalizeDisplayMath(children)}
    </ReactMarkdown>
  );
}
