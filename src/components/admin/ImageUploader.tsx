import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (publicUrl: string | null, storagePath: string | null) => void;
  /** subfolder within the product-images bucket, e.g. "products", "hero", "blog" */
  folder?: string;
  label?: string;
  aspect?: "square" | "wide" | "auto";
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Product image",
  aspect = "square",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("Image is larger than 5 MB");
        return;
      }

      setIsUploading(true);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        onChange(data.publicUrl, path);
        toast.success("Image uploaded");
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload(files[0]);
  };

  const clear = () => {
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const aspectClass =
    aspect === "square" ? "aspect-square" : aspect === "wide" ? "aspect-[16/9]" : "min-h-40";

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`relative ${aspectClass} w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden bg-muted/40 flex items-center justify-center ${
          isDragging ? "border-honey bg-honey/10" : "border-border hover:border-honey/60"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-medium">Click or drop to replace</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-center p-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-honey-deep" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm font-medium text-foreground">Drop an image or click to browse</p>
                <p className="text-xs">PNG, JPG or WebP · Max 5 MB</p>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
      {value && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" /> Replace
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={isUploading}>
            <X className="w-4 h-4" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}
