"use client"

import { useCallback, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { githubLight } from "@uiw/codemirror-theme-github"
import { EditorView } from "@codemirror/view"
import { bracketMatching } from "@codemirror/language"

const blackOverride = EditorView.theme({
  "&": { backgroundColor: "#000000 !important" },
  ".cm-gutters": { backgroundColor: "#000000 !important", borderRight: "1px solid rgba(255,255,255,0.06)" },
  ".cm-activeLineGutter": { backgroundColor: "#0d0d0d !important" },
  ".cm-activeLine": { backgroundColor: "#0d0d0d !important" },
  ".cm-selectionBackground": { backgroundColor: "#1a1a1a !important" },
  "&.cm-focused .cm-selectionBackground": { backgroundColor: "#1a1a1a !important" },
})
import { search, highlightSelectionMatches } from "@codemirror/search"
import { autocompletion } from "@codemirror/autocomplete"
import { getLanguageExtension } from "@/lib/editor-languages"
import type { Language } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: Language
  readOnly?: boolean
  minHeight?: string
  theme?: "dark" | "light"
  noBorder?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  minHeight = "400px",
  theme = "dark",
  noBorder = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const extensions = [
    bracketMatching(),
    search(),
    highlightSelectionMatches(),
    autocompletion(),
    EditorView.lineWrapping,
    ...(theme === "dark" ? [blackOverride] : []),
  ]

  const languageExtension = getLanguageExtension(language)
  if (languageExtension) {
    extensions.push(languageExtension)
  }

  return (
    <div className={cn("relative overflow-hidden", !noBorder && "rounded-lg border border-border")}>
      <div className="absolute top-2 right-2 z-10">
        <Button size="sm" variant="secondary" onClick={handleCopy} className="h-8 gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={theme === "dark" ? oneDark : githubLight}
        extensions={extensions}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        style={{ fontSize: 14, minHeight }}
        className="text-sm"
      />
    </div>
  )
}
