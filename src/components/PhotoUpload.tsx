"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  pgId: string;
  existingPhotos: string[];
  onUpdate: (photos: string[]) => void;
};

export default function PhotoUpload({ pgId, existingPhotos, onUpdate }: Props) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [modError, setModError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate image dimensions client-side
  const checkImageQuality = (file: File): Promise<{ ok: boolean; reason: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 200 || img.height < 200) {
          resolve({ ok: false, reason: `"${file.name}" is too small (${img.width}x${img.height}). Min 200x200px.` });
        } else if (img.width < 400 && img.height < 400) {
          resolve({ ok: false, reason: `"${file.name}" is low resolution. Please upload a clearer photo.` });
        } else {
          resolve({ ok: true, reason: "" });
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ ok: false, reason: `"${file.name}" could not be loaded as an image.` });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Convert file to base64 data URL for AI vision analysis
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setModError("");

    const newUrls: string[] = [];
    const rejected: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 1. Client-side quality check (dimensions)
      const quality = await checkImageQuality(file);
      if (!quality.ok) {
        rejected.push(quality.reason);
        continue;
      }

      // 2. AI vision moderation — sends actual image to MiniMax VL-01
      try {
        const imageBase64 = await fileToBase64(file);
        const modRes = await fetch("/api/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "image",
            imageBase64,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }),
        });
        const modData = await modRes.json();
        if (modData.safe === false) {
          rejected.push(`"${file.name}" — ${modData.reason || "Flagged as inappropriate"}`);
          continue;
        }
      } catch {
        // If moderation fails, allow upload (fail open)
      }

      // 3. Upload to Supabase
      const ext = file.name.split(".").pop();
      const path = `listings/${pgId}/${Date.now()}_${i}.${ext}`;

      const { error } = await supabase.storage
        .from("pg-photos")
        .upload(path, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from("pg-photos").getPublicUrl(path);
        if (data?.publicUrl) newUrls.push(data.publicUrl);
      }
    }

    if (rejected.length > 0) {
      setModError(rejected.join("\n"));
    }

    if (newUrls.length > 0) {
      const updated = [...photos, ...newUrls];
      setPhotos(updated);
      onUpdate(updated);
      await supabase.from("listings").update({ images: updated }).eq("id", pgId);
    }

    setUploading(false);
  };

  const removePhoto = async (url: string) => {
    const updated = photos.filter((p) => p !== url);
    setPhotos(updated);
    onUpdate(updated);
    await supabase.from("listings").update({ images: updated }).eq("id", pgId);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">📸 PG Photos</label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
        {photos.map((url, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(url)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Upload button */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-[#8a8070] hover:bg-gray-100:bg-[#2a2520] transition-all"
        >
          {uploading ? (
            <svg className="animate-spin w-6 h-6 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-400">Add Photo</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      {modError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">🛡️</span>
            <div>
              <p className="font-semibold mb-1">Some images were rejected:</p>
              {modError.split("\n").map((line, i) => (
                <p key={i} className="text-xs mt-0.5">• {line}</p>
              ))}
            </div>
          </div>
          <button onClick={() => setModError("")} className="mt-2 text-xs text-[#1a1a1a] hover:underline">Dismiss</button>
        </div>
      )}
      <p className="text-xs text-gray-400">Upload up to 10 photos. JPG, PNG accepted. Min 200x200px. Max 5MB each.</p>
    </div>
  );
}
