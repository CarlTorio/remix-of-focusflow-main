import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Note } from "@/hooks/useNotes";
import { EditorToolbar, ColumnLayout } from "./EditorToolbar";
import { ColumnEditor, ColumnEditorHandle } from "./ColumnEditor";
import { Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (params: { id: string; title?: string; content?: string; is_starred?: boolean }) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

// Content format: plain HTML for single column, JSON for multi-column
// JSON format: {"layout": 2, "columns": ["<p>...</p>", "<p>...</p>"]}
function parseNoteContent(raw: string | null): { layout: ColumnLayout; columns: string[] } {
  if (!raw) return { layout: 1, columns: [""] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.columns && Array.isArray(parsed.columns)) {
      return { layout: parsed.layout || 1, columns: parsed.columns };
    }
  } catch {
    // Not JSON — plain HTML, single column
  }
  return { layout: 1, columns: [raw] };
}

function serializeContent(layout: ColumnLayout, columns: string[]): string {
  if (layout === 1) return columns[0] || "";
  return JSON.stringify({ layout, columns });
}

export function NoteEditor({ note, onUpdate, onBack, isMobile: isMobileProp }: NoteEditorProps) {
  const isMobileHook = useIsMobile();
  const isMobileActual = isMobileProp ?? isMobileHook;

  const [title, setTitle] = useState(note?.title || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Parse initial content
  const initial = parseNoteContent(note?.content || null);
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>(initial.layout);
  const [columns, setColumns] = useState<string[]>(initial.columns);
  const [activeColIndex, setActiveColIndex] = useState(0);
  const columnEditorRefs = useRef<(ColumnEditorHandle | null)[]>([null, null, null]);

  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const currentNoteId = useRef(note?.id);
  const pendingSave = useRef<{ title?: string; content?: string } | null>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const layoutRef = useRef(columnLayout);
  layoutRef.current = columnLayout;

  // Single-column editor (used when layout === 1)
  const singleEditor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: columnLayout === 1 ? (columns[0] || "") : "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-1",
      },
    },
    onUpdate: ({ editor }) => {
      if (!note) return;
      const html = editor.getHTML();
      const newCols = [html];
      setColumns(newCols);
      scheduleSave({ content: serializeContent(1, newCols) });
    },
  });

  const scheduleSave = useCallback(
    (updates: { title?: string; content?: string }) => {
      if (!note) return;
      pendingSave.current = { ...pendingSave.current, ...updates };
      setSaveStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (pendingSave.current) {
          onUpdate({ id: note.id, ...pendingSave.current });
          pendingSave.current = null;
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      }, 1500);
    },
    [note, onUpdate]
  );

  const flushSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (note && pendingSave.current) {
      onUpdate({ id: note.id, ...pendingSave.current });
      pendingSave.current = null;
    }
  }, [note, onUpdate]);

  // Handle note switch
  useEffect(() => {
    if (note && note.id !== currentNoteId.current) {
      currentNoteId.current = note.id;
      setTitle(note.title);
      const parsed = parseNoteContent(note.content || null);
      setColumnLayout(parsed.layout);
      setColumns(parsed.columns);
      setActiveColIndex(0);
      if (parsed.layout === 1) {
        singleEditor?.commands.setContent(parsed.columns[0] || "");
      }
    }
  }, [note, singleEditor]);

  // Cleanup on unmount / note change
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (note && pendingSave.current) {
        onUpdate({ id: note.id, ...pendingSave.current });
        pendingSave.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: ColumnLayout) => {
    const currentCols = columnsRef.current;
    const currentLayout = layoutRef.current;

    // If switching from single to multi, grab latest from singleEditor
    let updatedCols = [...currentCols];
    if (currentLayout === 1 && singleEditor) {
      updatedCols = [singleEditor.getHTML()];
    }

    // Expand columns array if needed
    while (updatedCols.length < newLayout) {
      updatedCols.push("");
    }

    // If shrinking, merge extra columns into the last visible one
    if (newLayout < updatedCols.length) {
      const kept = updatedCols.slice(0, newLayout);
      const extra = updatedCols.slice(newLayout).filter(c => c && c !== "<p></p>");
      if (extra.length > 0) {
        kept[newLayout - 1] = (kept[newLayout - 1] || "") + extra.join("");
      }
      updatedCols = kept;
    }

    setColumnLayout(newLayout);
    setColumns(updatedCols);
    setActiveColIndex(0);

    // Sync single editor if going back to 1 col
    if (newLayout === 1 && singleEditor) {
      singleEditor.commands.setContent(updatedCols[0] || "");
    }

    // Save immediately
    const content = serializeContent(newLayout, updatedCols);
    scheduleSave({ content });
  }, [singleEditor, scheduleSave]);

  // Multi-column content change handler
  const handleColumnContentChange = useCallback((index: number, html: string) => {
    setColumns(prev => {
      const next = [...prev];
      next[index] = html;
      const content = serializeContent(layoutRef.current, next);
      scheduleSave({ content });
      return next;
    });
  }, [scheduleSave]);

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Select a note or create a new one</p>
      </div>
    );
  }

  const toggleStar = () => {
    onUpdate({ id: note.id, is_starred: !note.is_starred });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    scheduleSave({ title: e.target.value });
  };

  const effectiveColumns = isMobileActual ? 1 : columnLayout;

  // For the toolbar, pass the active single editor or active column editor
  const activeColumnEditor = columnEditorRefs.current[activeColIndex]?.getEditor() || null;
  const toolbarEditor = effectiveColumns === 1 ? singleEditor : activeColumnEditor;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="relative flex items-center justify-between border-b border-border px-4 py-3">
        {isMobileActual && onBack && (
          <button onClick={() => { flushSave(); onBack(); }} className="mr-3 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        {!isMobileActual && onBack && (
          <button onClick={() => { flushSave(); onBack(); }} className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background">
            Go Back
          </button>
        )}
        {note.folder && (
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground truncate max-w-[200px]">
            {note.folder}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved ✓"}
          </span>
          <button
            onClick={toggleStar}
            className={cn(
              "transition-transform hover:scale-110 active:scale-125",
              note.is_starred ? "text-warning" : "text-muted-foreground"
            )}
          >
            <Star className={cn("h-5 w-5", note.is_starred && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-4">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full border-none bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        />
      </div>

      {/* Toolbar — always shows formatting when an editor is available */}
      <EditorToolbar
        editor={toolbarEditor || (null as any)}
        columnLayout={columnLayout}
        onColumnLayoutChange={handleLayoutChange}
        hideFormatting={!toolbarEditor}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {effectiveColumns === 1 ? (
          <div className="px-4 py-2">
            <EditorContent editor={singleEditor} />
          </div>
        ) : (
          <div
            className={cn(
              "grid h-full gap-0",
              effectiveColumns === 2 && "grid-cols-2",
              effectiveColumns === 3 && "grid-cols-3",
              isMobileActual && "!grid-cols-1"
            )}
          >
            {Array.from({ length: effectiveColumns }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "px-4 py-2",
                  i > 0 && "border-l border-border"
                )}
              >
                <ColumnEditor
                  ref={(el) => { columnEditorRefs.current[i] = el; }}
                  content={columns[i] || ""}
                  onContentChange={(html) => handleColumnContentChange(i, html)}
                  onFocus={() => setActiveColIndex(i)}
                  placeholder={`Column ${i + 1}...`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
