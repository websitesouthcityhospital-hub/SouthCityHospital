"use client";

import { createClient } from "@/lib/supabase/client";
import { compressImageUnder200KB } from "@/lib/image-compression";

export interface UploadResult {
  url: string;
  originalSizeKB: number;
  compressedSizeKB: number;
}

/**
 * Uploads a doctor's avatar picture of ANY size to Supabase Storage bucket 'doctor-avatars'.
 * Heavily compresses the image on the client to strictly under 200 KB (WebP format) before upload.
 */
export async function uploadDoctorAvatar(rawFile: File): Promise<UploadResult> {
  if (!rawFile.type.startsWith("image/")) {
    throw new Error("Only image files (JPEG, PNG, WebP, HEIC, etc.) are allowed.");
  }

  // 1. Client-side heavy compression (guaranteed < 200 KB)
  const { file: compressedFile, originalSizeKB, compressedSizeKB } =
    await compressImageUnder200KB(rawFile, 200 * 1024);

  const supabase = createClient();

  if (supabase) {
    try {
      const filename = `doctor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const path = `avatars/${filename}`;

      const { data, error } = await supabase.storage
        .from("doctor-avatars")
        .upload(path, compressedFile, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("doctor-avatars")
          .getPublicUrl(path);

        if (urlData?.publicUrl) {
          return {
            url: urlData.publicUrl,
            originalSizeKB,
            compressedSizeKB,
          };
        }
      } else if (error) {
        console.warn("Supabase storage upload error, falling back to local data URL:", error);
      }
    } catch (err) {
      console.warn("Storage client exception, falling back:", err);
    }
  }

  // Fallback: Return Base64 Data URL of the compressed image (<200KB)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve({
          url: reader.result,
          originalSizeKB,
          compressedSizeKB,
        });
      } else {
        reject(new Error("Failed to process compressed image file."));
      }
    };
    reader.onerror = () => reject(new Error("Error reading compressed image file."));
    reader.readAsDataURL(compressedFile);
  });
}

/**
 * Uploads a photo to Supabase Storage bucket 'gallery-images' with compression under 200 KB.
 */
export async function uploadGalleryImage(rawFile: File): Promise<UploadResult> {
  if (!rawFile.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const { file: compressedFile, originalSizeKB, compressedSizeKB } =
    await compressImageUnder200KB(rawFile, 200 * 1024);

  const supabase = createClient();

  if (supabase) {
    try {
      const filename = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const path = `photos/${filename}`;

      const { data, error } = await supabase.storage
        .from("gallery-images")
        .upload(path, compressedFile, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("gallery-images")
          .getPublicUrl(path);

        if (urlData?.publicUrl) {
          return {
            url: urlData.publicUrl,
            originalSizeKB,
            compressedSizeKB,
          };
        }
      }
    } catch (err) {
      console.warn("Gallery upload error:", err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        url: reader.result as string,
        originalSizeKB,
        compressedSizeKB,
      });
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });
}
