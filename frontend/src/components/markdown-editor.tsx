"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef } from "react";

type Monaco = typeof import("monaco-editor");
type MonacoEditorInstance =
  import("monaco-editor").editor.IStandaloneCodeEditor;
type MonacoModel = import("monaco-editor").editor.ITextModel;

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const modelRef = useRef<MonacoModel | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const editorId = useId().replaceAll(":", "");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;

    const editor = editorRef.current;
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    let isMounted = true;
    let changeDisposable: { dispose: () => void } | null = null;

    async function mountEditor() {
      const monaco = await import("monaco-editor");

      if (!isMounted || !containerRef.current) {
        return;
      }

      monacoRef.current = monaco;
      monaco.editor.setTheme(resolvedTheme === "dark" ? "vs-dark" : "vs");

      const modelUri = monaco.Uri.parse(
        `inmemory://markdown-editor/${editorId}.md`,
      );
      const existingModel = monaco.editor.getModel(modelUri);
      const model =
        existingModel ??
        monaco.editor.createModel(valueRef.current, "markdown", modelUri);

      modelRef.current = model;

      const editor = monaco.editor.create(containerRef.current, {
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "off",
        folding: false,
        scrollBeyondLastLine: false,
        fontSize: 14,
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: "off",
        parameterHints: { enabled: false },
      });

      editorRef.current = editor;
      changeDisposable = editor.onDidChangeModelContent(() => {
        onChangeRef.current(editor.getValue());
      });
    }

    mountEditor();

    return () => {
      isMounted = false;
      changeDisposable?.dispose();

      const editor = editorRef.current;
      editorRef.current = null;

      if (editor) {
        editor.setModel(null);
        editor.dispose();
      }
    };
  }, [editorId, resolvedTheme]);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(
      resolvedTheme === "dark" ? "vs-dark" : "vs",
    );
  }, [resolvedTheme]);

  return (
    <div
      data-cy="markdown-editor"
      className="overflow-hidden rounded-md border"
    >
      <div ref={containerRef} className="h-[15vh]" />
    </div>
  );
}
