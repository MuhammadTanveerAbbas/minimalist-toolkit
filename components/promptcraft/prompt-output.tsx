"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";
import { PromptQualityChecklist } from "@/components/promptcraft/quality-checklist";
import { SaveAsSnippetButton } from "@/components/promptcraft/save-as-snippet";

interface PromptOutputProps {
  output: string;
  isLoading: boolean;
  isEnhancing: boolean;
  error: string | null;
  onEnhance: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  /** Topic of the prompt that produced `output`, used for snippet metadata. */
  topic?: string;
  /** Platform of the prompt that produced `output`, used for snippet tags. */
  platform?: string;
}

// ── Parser ───────────────────────────────────────────────────────────────────

type Block =
  | { type: "xml"; tag: string; content: string }
  | { type: "text"; content: string };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const xmlRegex = /<([a-zA-Z_][a-zA-Z0-9_]*)>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = xmlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) blocks.push({ type: "text", content: before });
    }
    blocks.push({
      type: "xml",
      tag: match[1].toLowerCase(),
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) blocks.push({ type: "text", content: remaining });
  if (blocks.length === 0) blocks.push({ type: "text", content: text });
  return blocks;
}

// ── Inline renderers ─────────────────────────────────────────────────────────

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function renderLines(text: string, streaming = false): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isLast = i === lines.length - 1;

    if (!trimmed) {
      nodes.push(<div key={i} className="h-3" />);
      return;
    }

    const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered) {
      nodes.push(
        <div key={i} className="flex items-baseline gap-3 py-0.5">
          <span className="shrink-0 tabular-nums text-[11px] font-medium text-muted-foreground/50 w-4 text-right">
            {numbered[1]}.
          </span>
          <span className="text-sm leading-6 text-foreground/80">
            {renderBold(numbered[2])}
          </span>
        </div>,
      );
      return;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      nodes.push(
        <div key={i} className="flex items-baseline gap-3 py-0.5">
          <span className="shrink-0 mt-[9px] h-[3px] w-[3px] rounded-full bg-muted-foreground/40" />
          <span className="text-sm leading-6 text-foreground/80">
            {renderBold(bullet[1])}
          </span>
        </div>,
      );
      return;
    }

    nodes.push(
      <p key={i} className="text-sm leading-7 text-foreground/80">
        {renderBold(trimmed)}
        {streaming && isLast && (
          <span
            className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-foreground/60 align-text-bottom"
            aria-hidden="true"
          />
        )}
      </p>,
    );
  });

  return <>{nodes}</>;
}

// ── Structured output ─────────────────────────────────────────────────────────

function StructuredOutput({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const blocks = parseBlocks(text);
  const hasXml = blocks.some((b) => b.type === "xml");

  if (!hasXml) {
    return <div className="space-y-0.5">{renderLines(text, isStreaming)}</div>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const isLast = i === blocks.length - 1;

        if (block.type === "text") {
          if (!block.content) return null;
          return (
            <div key={i} className="space-y-0.5">
              {renderLines(block.content, isStreaming && isLast)}
            </div>
          );
        }

        return (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-secondary/20 overflow-hidden"
          >
            {/* tag label */}
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
              <span
                className="h-1 w-1 rounded-full bg-muted-foreground/40"
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                {block.tag}
              </span>
            </div>
            {/* content */}
            <div className="space-y-0.5 px-4 py-3">
              {renderLines(block.content, isStreaming && isLast)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PromptOutput({
  output,
  isLoading,
  isEnhancing,
  error,
  onEnhance,
  onRegenerate,
  canRegenerate,
  topic,
  platform,
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  const isActive = isLoading || isEnhancing;
  const isEmpty = !output && !isActive && !error;
  const isStreaming = isActive && !!output;
  const isPending = isActive && !output;

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Output</h2>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Your generated AI prompt
          </p>
        </div>

        {output && (
          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            <ActionButton
              onClick={onRegenerate}
              disabled={isActive || !canRegenerate}
              title="Regenerate"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Regenerate</span>
            </ActionButton>
            <ActionButton
              onClick={onEnhance}
              disabled={isActive}
              title="Enhance with AI"
            >
              {isEnhancing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">Enhance</span>
            </ActionButton>
            <ActionButton onClick={handleDownload} title="Download as .txt">
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Save</span>
            </ActionButton>
            <SaveAsSnippetButton
              source={{ topic: topic ?? "", output, platform }}
            />
            <ActionButton onClick={handleCopy} title="Copy to clipboard">
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-foreground/70" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </ActionButton>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative min-h-[280px] flex-1">
        {isEmpty && <EmptyState />}

        {error && !isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-xl border border-border/60 bg-secondary/40 p-3.5">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                Something went wrong
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground/70">
                {error}
              </p>
            </div>
            {canRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/40 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            )}
          </div>
        )}

        {isPending && (
          <GeneratingAnimation
            label={isEnhancing ? "Enhancing prompt..." : "Generating prompt..."}
          />
        )}

        {output && (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <StructuredOutput text={output} isStreaming={isStreaming} />
              {!isActive && <PromptQualityChecklist text={output} />}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 sm:px-6">
        {output ? (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{charCount} chars</span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              isActive ? "animate-pulse bg-foreground/50" : "bg-foreground/20"
            }`}
            aria-hidden="true"
          />
          {isActive ? "Working..." : "Ready"}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/40 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35 min-h-11 min-w-11 sm:min-w-0 sm:px-2.5"
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-xl border border-border/60 bg-secondary/40 p-3.5">
        <WandIcon />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Ready to generate</p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground/60">
          PromptCraft turns a goal into a production-ready prompt for your chosen
          model, then checks the result for a role, a task, constraints and an
          output format.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById("topic") as HTMLInputElement | null;
          el?.focus();
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/40 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground"
      >
        <WandIcon />
        Describe your goal
      </button>
    </div>
  );
}

function GeneratingAnimation({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-8"
      aria-label={label}
      role="status"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: 96, height: 96 }}
      >
        <div
          className="absolute rounded-full border border-border/30"
          style={{ width: 96, height: 96 }}
        />
        <div
          className="absolute rounded-full border border-border/50"
          style={{
            width: 72,
            height: 72,
            animation: "spin 3s linear infinite",
          }}
        >
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-foreground/60" />
        </div>
        <div
          className="absolute rounded-full border border-border/40"
          style={{
            width: 48,
            height: 48,
            animation: "spin 2s linear infinite reverse",
          }}
        >
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-foreground/40" />
        </div>
        <div className="h-2 w-2 rounded-full bg-foreground/70" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground/60">{label}</p>
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-muted-foreground/30"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground/60"
      aria-hidden="true"
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  );
}
