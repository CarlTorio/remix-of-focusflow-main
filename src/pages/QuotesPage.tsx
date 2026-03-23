import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Quote, Sparkles, Send, Pencil, GripVertical, Trash2, X, Check, Bold, Italic, Underline, Highlighter } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuoteEntry {
  id: string;
  text: string;
  author: string;
  created_at: string;
  order_index: number;
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-muted/50 focus-within:ring-2 focus-within:ring-ring/40 transition-shadow duration-200">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand("italic"); }}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand("underline"); }}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand("hiliteColor", "#fef08a"); }}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        data-placeholder={placeholder}
        className="px-4 py-3 min-h-[80px] text-sm leading-relaxed text-foreground focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
      />
    </div>
  );
}

function SortableQuoteCard({
  quote,
  isEditing,
  onDelete,
  onUpdate,
}: {
  quote: QuoteEntry;
  isEditing: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, fields: Partial<Pick<QuoteEntry, "text" | "author">>) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quote.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onUpdate(quote.id, { text: editorRef.current.innerHTML });
    }
    editorRef.current?.focus();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card rounded-2xl p-5 shadow-[0_1px_3px_hsl(var(--border)/0.5),0_8px_20px_hsl(var(--border)/0.15)] transition-shadow duration-300 ${
        isDragging ? "shadow-[0_4px_20px_hsl(var(--primary)/0.25)] ring-2 ring-primary/30" : "hover:shadow-[0_2px_6px_hsl(var(--border)/0.6),0_12px_28px_hsl(var(--border)/0.2)]"
      }`}
    >
      <div className="flex items-start gap-2">
        {isEditing && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 touch-none cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              {/* Inline formatting toolbar */}
              <div className="flex items-center gap-0.5 mb-2">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand("italic"); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand("underline"); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand("hiliteColor", "#fef08a"); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Highlight"><Highlighter className="w-3.5 h-3.5" /></button>
              </div>
              {/* Editable quote text */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {
                  if (editorRef.current) onUpdate(quote.id, { text: editorRef.current.innerHTML });
                }}
                className="text-foreground text-sm leading-relaxed mb-3 pr-5 [&_b]:font-bold [&_i]:italic [&_u]:underline border border-border/50 rounded-lg px-3 py-2 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring/40 min-h-[40px]"
                dangerouslySetInnerHTML={{ __html: quote.text }}
              />
              {/* Editable author */}
              <input
                type="text"
                value={quote.author}
                onChange={(e) => onUpdate(quote.id, { author: e.target.value })}
                className="w-full text-xs text-muted-foreground font-medium bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/40"
                placeholder="Author"
              />
            </>
          ) : (
            <>
              <Quote className="absolute top-3 right-3 w-4 h-4 text-muted-foreground/20 group-hover:text-primary/30 transition-colors duration-300" />
              <div
                className="text-foreground text-sm leading-relaxed mb-3 pr-5 [&_b]:font-bold [&_i]:italic [&_u]:underline"
                style={{ textWrap: "pretty" as any }}
                dangerouslySetInnerHTML={{ __html: `"${quote.text}"` }}
              />
              <p className="text-xs text-muted-foreground font-medium">
                — {quote.author}
              </p>
            </>
          )}
        </div>
        {isEditing && (
          <button
            onClick={() => onDelete(quote.id)}
            className="mt-1 text-destructive/60 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localQuotes, setLocalQuotes] = useState<QuoteEntry[] | null>(null);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QuoteEntry[];
    },
  });

  const displayQuotes = localQuotes ?? quotes;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const addQuote = useMutation({
    mutationFn: async () => {
      const trimmedText = text.trim();
      const trimmedAuthor = author.trim() || "Unknown";
      if (!trimmedText) throw new Error("Quote text is required");

      const maxOrder = quotes.length > 0 ? Math.max(...quotes.map((q) => q.order_index)) + 1 : 0;

      const { error } = await supabase
        .from("quotes")
        .insert({ text: trimmedText, author: trimmedAuthor, order_index: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setText("");
      setAuthor("");
      setShowForm(false);
      toast.success("Quote added!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveOrder = useMutation({
    mutationFn: async (reordered: QuoteEntry[]) => {
      const updates = reordered.map((q, i) =>
        supabase.from("quotes").update({ order_index: i }).eq("id", q.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Order saved!");
    },
    onError: () => toast.error("Failed to save order"),
  });

  const deleteQuote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Quote deleted");
    },
    onError: () => toast.error("Failed to delete quote"),
  });

  const handleDelete = useCallback(
    (id: string) => {
      const updated = (localQuotes ?? quotes).filter((q) => q.id !== id);
      setLocalQuotes(updated);
      deleteQuote.mutate(id);
    },
    [localQuotes, quotes, deleteQuote]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const current = localQuotes ?? quotes;
      const oldIndex = current.findIndex((q) => q.id === active.id);
      const newIndex = current.findIndex((q) => q.id === over.id);
      const reordered = arrayMove(current, oldIndex, newIndex);
      setLocalQuotes(reordered);
    },
    [localQuotes, quotes]
  );

  const handleSaveEdit = () => {
    if (localQuotes) {
      saveOrder.mutate(localQuotes);
    }
    setIsEditing(false);
    setLocalQuotes(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setLocalQuotes(null);
  };

  const handleStartEdit = () => {
    setLocalQuotes([...quotes]);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addQuote.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1
              className="text-lg font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Words That Move Me
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 active:scale-[0.97] transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saveOrder.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] disabled:opacity-50 transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  {saveOrder.isPending ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                {quotes.length > 0 && (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 active:scale-[0.97] transition-all duration-200"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Quote Form */}
        {showForm && !isEditing && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 bg-card rounded-2xl p-5 shadow-[0_1px_3px_hsl(var(--border)/0.5),0_8px_20px_hsl(var(--border)/0.15)] animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <RichTextEditor
              value={text}
              onChange={setText}
              placeholder="Type the quote here…"
            />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author (optional)"
              maxLength={200}
              className="w-full mt-3 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow duration-200"
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={addQuote.isPending || !text.replace(/<[^>]*>/g, '').trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              >
                <Send className="w-3.5 h-3.5" />
                {addQuote.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Quotes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : displayQuotes.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No quotes yet. Add your first one!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayQuotes.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayQuotes.map((quote) => (
                  <SortableQuoteCard
                    key={quote.id}
                    quote={quote}
                    isEditing={isEditing}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}