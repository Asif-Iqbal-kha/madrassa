/**
 * Image compressor utility using HTML5 Canvas.
 * Compresses large camera photos/screenshots before upload
 * to save user bandwidth and database storage.
 *
 * @param {File|Blob} file - The original image file
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1200]
 * @param {number} [options.maxHeight=1200]
 * @param {number} [options.quality=0.75]
 * @returns {Promise<{ file: File, dataUrl: string }>}
 */
export function compressImage(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, dataUrl });
            }
            const cleanName = (file.name || 'image.jpg').replace(/\.[^/.]+$/, '.jpg');
            const compressedFile = new File([blob], cleanName, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve({ file: compressedFile, dataUrl });
          },
          mimeType,
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
