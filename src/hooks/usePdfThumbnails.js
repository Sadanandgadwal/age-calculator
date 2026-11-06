import { useEffect, useState } from 'react';
import { closeRendering, openForRendering, renderPage } from '../utils/pdfRender.js';

export const MAX_THUMBNAILS = 300;
const THUMBNAIL_WIDTH = 160;

export default function usePdfThumbnails(bytes) {
  const [state, setState] = useState({ bytes: null, images: [] });

  useEffect(() => {
    if (!bytes) return undefined;
    let isCurrent = true;
    let pdf;
    (async () => {
      try {
        pdf = await openForRendering(bytes);
        const count = Math.min(pdf.numPages, MAX_THUMBNAILS);
        const images = [];
        for (let page = 1; page <= count && isCurrent; page += 1) {
          const canvas = await renderPage(pdf, page, { width: THUMBNAIL_WIDTH });
          images.push(canvas.toDataURL('image/jpeg', 0.7));
          if (isCurrent) setState({ bytes, images: [...images] });
        }
      } catch {
        if (isCurrent) setState({ bytes, images: [] });
      } finally {
        closeRendering(pdf);
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, [bytes]);

  return state.bytes === bytes ? state.images : [];
}
