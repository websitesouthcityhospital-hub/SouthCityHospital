"use client";

import { createClient } from "@/lib/supabase/client";
import { MOCK_IMAGES, type GalleryImage } from "@/components/ui/ImageGallery";

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from("gallery-images")
        .list("photos", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (!error && data && data.length > 0) {
        const uploadedImages: GalleryImage[] = data
          .filter((item: { name: string }) => item.name && !item.name.startsWith("."))
          .map((item: { id?: string; name: string }, idx: number) => {
            const { data: urlData } = supabase.storage
              .from("gallery-images")
              .getPublicUrl(`photos/${item.name}`);

            const cleanName = item.name
              .replace(/^gallery-\d+-/, "")
              .replace(/\.[^.]+$/, "")
              .replace(/[-_]/g, " ");

            return {
              id: `supa-gal-${item.id || idx}`,
              url: urlData.publicUrl,
              alt: cleanName || "South City Hospital Facility",
              title: cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : "Hospital Facility",
              width: 2000,
              height: 1400,
            };
          });

        if (uploadedImages.length > 0) {
          return [...uploadedImages, ...MOCK_IMAGES];
        }
      }
    } catch (err) {
      console.warn("Supabase gallery fetch error, using fallback images:", err);
    }
  }

  return MOCK_IMAGES;
}
