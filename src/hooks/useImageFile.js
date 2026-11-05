import { useCallback, useRef, useState } from 'react';
import { openImage } from '../utils/imageFile.js';

export default function useImageFile(maxBytes) {
  const [source, setSource] = useState(null);
  const [error, setError] = useState();
  const latest = useRef(0);

  const choose = useCallback(
    async (file) => {
      latest.current += 1;
      const request = latest.current;
      setError(undefined);
      setSource(null);
      try {
        const opened = await openImage(file, maxBytes);
        if (request === latest.current) setSource(opened);
      } catch (failure) {
        if (request === latest.current) setError(failure.message);
      }
    },
    [maxBytes],
  );

  const clear = useCallback(() => {
    latest.current += 1;
    setError(undefined);
    setSource(null);
  }, []);

  return { source, error, choose, clear };
}
