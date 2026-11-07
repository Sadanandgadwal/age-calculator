export async function recodeJpeg(image, size, quality) {
  const bitmap = await createImageBitmap(new Blob([image.bytes], { type: 'image/jpeg' }), { colorSpaceConversion: 'none', imageOrientation: 'none' });
  try {
    if (bitmap.width !== image.width || bitmap.height !== image.height) return null;
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width: size.width, height: size.height, components: 3 };
  } finally {
    bitmap.close();
  }
}
