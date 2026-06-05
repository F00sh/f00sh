import type { HeightData } from './terrain';

export const imageFileToHeightData = (
  file: File,
  resolution: number,
  maxHeight: number,
): Promise<HeightData> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = resolution;
      canvas.height = resolution;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas image processing is unavailable.'));
        return;
      }

      context.drawImage(image, 0, 0, resolution, resolution);
      const pixels = context.getImageData(0, 0, resolution, resolution).data;
      const heights: HeightData = [];

      for (let y = 0; y < resolution; y += 1) {
        const row: number[] = [];
        for (let x = 0; x < resolution; x += 1) {
          const index = (y * resolution + x) * 4;
          const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 765;
          row.push(brightness * maxHeight);
        }
        heights.push(row);
      }

      URL.revokeObjectURL(url);
      resolve(heights);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The selected image could not be read.'));
    };
    image.src = url;
  });
