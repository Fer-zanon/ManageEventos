import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  async pick(limit: number): Promise<string[]> {
    const result = await Camera.pickImages({ limit, quality: 75, width: 1280, height: 1280 });
    const photos: string[] = [];
    for (const image of result.photos.slice(0, limit)) {
      const response = await fetch(image.webPath);
      if (!response.ok) throw new Error('No pudimos abrir una de las fotos seleccionadas.');
      photos.push(await this.optimize(await response.blob()));
    }
    return photos;
  }

  async fromFiles(files: FileList, limit: number): Promise<string[]> {
    const photos: string[] = [];
    for (const file of Array.from(files).slice(0, limit)) {
      if (!file.type.startsWith('image/')) throw new Error('Seleccioná únicamente imágenes.');
      photos.push(await this.optimize(file));
    }
    return photos;
  }

  private async optimize(blob: Blob): Promise<string> {
    if (blob.size > 25_000_000)
      throw new Error('La foto es demasiado grande. Seleccioná una de menos de 25 MB.');
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No pudimos preparar la foto.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.6, 0.4]) {
        const data = canvas.toDataURL('image/jpeg', quality);
        if (data.length <= 600_000) return data;
      }
      throw new Error('No pudimos reducir la foto. Probá con otra imagen.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
