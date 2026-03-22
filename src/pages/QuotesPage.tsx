import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Quote, Sparkles, Send } from "lucide-react";

interface QuoteEntry {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

function QuoteCard({ quote, index }: { quote: QuoteEntry; index: number }) {
  return (
    <div
      className="group relative bg-card rounded-2xl p-6 shadow-[0_1px_3px_hsl(var(--border)/0.5),0_8px_20px_hsl(var(--border)/0.15)] hover:shadow-[0_2px_6px_hsl(var(--border)/0.6),0_12px_28px_hsl(var(--border)/0.2)] transition-shadow duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Quote className="absolute top-4 right-4 w-5 h-5 text-muted-foreground/20 group-hover:text-primary/30 transition-colors duration-300" />
      <p className="text-foreground text-base leading-relaxed mb-4 pr-6" style={{ textWrap: "pretty" }}>
        "{quote.text}"
      </p>
      <p className="text-sm text-muted-foreground font-medium">
        — {quote.author}
      </p>
    </div>
  );
}

export default function QuotesPage() {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QuoteEntry[];
    },
  });

  const addQuote = useMutation({
    mutationFn: async () => {
      const trimmedText = text.trim();
      const trimmedAuthor = author.trim() || "Unknown";
      if (!trimmedText) throw new Error("Quote text is required");
      if (trimmedText.length > 2000) throw new Error("Quote is too long");
      if (trimmedAuthor.length > 200) throw new Error("Author name is too long");

      const { error } = await supabase
        .from("quotes")
        .insert({ text: trimmedText, author: trimmedAuthor });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setText("");
      setAuthor("");
      setShowForm(false);
      toast.success("Quote added!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addQuote.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Words That Move Me
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Add Quote Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 bg-card rounded-2xl p-5 shadow-[0_1px_3px_hsl(var(--border)/0.5),0_8px_20px_hsl(var(--border)/0.15)] animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the quote here…"
              maxLength={2000}
              rows={3}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow duration-200"
              required
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
                disabled={addQuote.isPending || !text.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              >
                <Send className="w-3.5 h-3.5" />
                {addQuote.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Quotes List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No quotes yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote, i) => (
              <QuoteCard key={quote.id} quote={quote} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
