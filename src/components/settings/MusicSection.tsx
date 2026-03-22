import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Upload, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MUSIC_STORAGE_KEY = "nexday_custom_music_url";

export function MusicSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem(MUSIC_STORAGE_KEY) || "");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("audio/")) {
      toast({ title: "Please select an audio file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const filePath = `music/${user.id}/relaxing.mp3`;

      const { error } = await supabase.storage
        .from("nexday")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("nexday")
        .getPublicUrl(filePath);

      const url = urlData.publicUrl;
      localStorage.setItem(MUSIC_STORAGE_KEY, url);
      setCustomUrl(url);

      toast({ title: "Music uploaded! 🎵" });

      // Force reload audio on next play
      window.dispatchEvent(new CustomEvent("music-source-changed"));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    try {
      await supabase.storage
        .from("nexday")
        .remove([`music/${user.id}/relaxing.mp3`]);

      localStorage.removeItem(MUSIC_STORAGE_KEY);
      setCustomUrl("");
      window.dispatchEvent(new CustomEvent("music-source-changed"));
      toast({ title: "Custom music removed" });
    } catch {
      // ignore
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Music className="h-5 w-5 text-primary" /> Relaxing Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Upload your own relaxing music file (MP3, WAV, etc.) to play in the background while you work.
        </p>

        {customUrl ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-lg bg-primary/10 px-3 py-2">
              <p className="text-xs font-medium text-primary truncate">Custom music uploaded ✓</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="shrink-0 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Using default relaxing track</p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {customUrl ? "Replace Music" : "Upload Music"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
