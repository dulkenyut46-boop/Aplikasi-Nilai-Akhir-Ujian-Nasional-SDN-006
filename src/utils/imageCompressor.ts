/**
 * Image Compressor Utility for Student Photos (Pas Foto Siswa)
 * Compresses and resizes high-resolution camera/phone photos to lightweight,
 * standardized dimensions (approx 15-30 KB) suitable for student cards,
 * desk labels, diplomas, and persistent browser storage.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 360,
  maxHeight: 480,
  quality: 0.82,
  format: 'image/jpeg',
};

/**
 * Compress a single File or Blob to an optimized Base64 Data URL.
 */
export async function compressStudentPhoto(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxWidth = opts.maxWidth || 360;
  const maxHeight = opts.maxHeight || 480;
  const quality = opts.quality ?? 0.82;
  const format = opts.format || 'image/jpeg';

  return new Promise((resolve, reject) => {
    // If it's an SVG string or file, just return it without re-compressing
    if ('type' in file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca berkas SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          reject(new Error('Dimensi gambar tidak valid.'));
          return;
        }

        // Calculate proportional scale to fit within maxWidth x maxHeight
        let targetWidth = width;
        let targetHeight = height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          targetWidth = Math.round(width * ratio);
          targetHeight = Math.round(height * ratio);
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas grafis.'));
          return;
        }

        // Fill white background in case of transparent PNG/WebP converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Draw image smoothly with high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export as JPEG with specified quality
        const dataUrl = canvas.toDataURL(format, quality);

        // Clean up canvas
        canvas.width = 1;
        canvas.height = 1;

        resolve(dataUrl);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Gagal memproses kompresi gambar.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Berkas gambar rusak atau format tidak didukung oleh peramban.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Process a batch of image files concurrently with a controlled concurrency limit
 * to avoid memory exhaustion or browser UI freeze on large sets of high-res photos.
 */
export async function compressStudentPhotoBatch(
  files: File[],
  onProgress?: (processed: number, total: number, currentFileName: string) => void,
  concurrency = 3
): Promise<Array<{ file: File; dataUrl: string | null; error?: string }>> {
  const results: Array<{ file: File; dataUrl: string | null; error?: string }> = new Array(files.length);
  let currentIndex = 0;
  let processedCount = 0;

  async function worker(): Promise<void> {
    while (currentIndex < files.length) {
      const idx = currentIndex++;
      const file = files[idx];

      if (!file.type.startsWith('image/')) {
        results[idx] = { file, dataUrl: null, error: 'Bukan berkas gambar' };
        processedCount++;
        onProgress?.(processedCount, files.length, file.name);
        continue;
      }

      try {
        const dataUrl = await compressStudentPhoto(file);
        results[idx] = { file, dataUrl };
      } catch (err: any) {
        console.warn(`Gagal mengompres ${file.name}:`, err);
        results[idx] = { file, dataUrl: null, error: err.message || 'Gagal kompresi' };
      }

      processedCount++;
      onProgress?.(processedCount, files.length, file.name);
    }
  }

  // Run workers up to concurrency limit
  const workerCount = Math.min(concurrency, files.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return results;
}
