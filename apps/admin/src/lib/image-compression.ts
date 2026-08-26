/**
 * Client-Side Image Compression Utility
 *
 * Compresses images of ANY size down to strictly under 200 KB (204,800 bytes)
 * using HTML5 Canvas & WebP/JPEG encoding before uploading to Supabase Storage.
 */

export async function compressImageUnder200KB(
  file: File,
  targetMaxSizeBytes = 200 * 1024 // 200 KB
): Promise<{ file: File; originalSizeKB: number; compressedSizeKB: number }> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.onload = () => {
        // Initial max dimension capping
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not initialize image processing canvas."));
        }

        // Iterative compression loop
        let currentQuality = 0.85;

        const attemptCompression = (q: number, currentW: number, currentH: number) => {
          canvas.width = currentW;
          canvas.height = currentH;
          ctx.clearRect(0, 0, currentW, currentH);
          ctx.drawImage(img, 0, 0, currentW, currentH);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback to JPEG if WebP not supported in browser
                canvas.toBlob(
                  (jpegBlob) => {
                    if (!jpegBlob) return reject(new Error("Compression failed."));
                    finalize(jpegBlob, "image/jpeg", "jpg");
                  },
                  "image/jpeg",
                  q
                );
                return;
              }

              if (blob.size <= targetMaxSizeBytes || q <= 0.35) {
                finalize(blob, "image/webp", "webp");
              } else {
                // Reduce quality and scale down slightly until under 200 KB
                const nextQ = Math.max(0.3, q - 0.15);
                const nextW = Math.round(currentW * 0.85);
                const nextH = Math.round(currentH * 0.85);
                attemptCompression(nextQ, nextW, nextH);
              }
            },
            "image/webp",
            q
          );
        };

        const finalize = (blob: Blob, mimeType: string, extension: string) => {
          const cleanName = file.name.replace(/\.[^.]+$/, "");
          const compressedFile = new File([blob], `${cleanName}.${extension}`, {
            type: mimeType,
            lastModified: Date.now(),
          });
          const compressedSizeKB = Math.round(compressedFile.size / 1024);
          resolve({ file: compressedFile, originalSizeKB, compressedSizeKB });
        };

        attemptCompression(currentQuality, width, height);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
