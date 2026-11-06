import { useCallback, useRef, useState } from 'react';
import { openPdf } from '../utils/pdfFile.js';

export default function usePdfFile(options) {
  const [source, setSource] = useState(null);
  const [error, setError] = useState();
  const [isOpening, setIsOpening] = useState(false);
  const latest = useRef(0);

  const choose = useCallback(
    async (file) => {
      latest.current += 1;
      const request = latest.current;
      setError(undefined);
      setSource(null);
      setIsOpening(true);
      try {
        const opened = await openPdf(file, options);
        if (request !== latest.current) return null;
        setSource(opened);
        return opened;
      } catch (failure) {
        if (request === latest.current) setError(failure.message);
        return null;
      } finally {
        if (request === latest.current) setIsOpening(false);
      }
    },
    [options],
  );

  const clear = useCallback(() => {
    latest.current += 1;
    setError(undefined);
    setSource(null);
    setIsOpening(false);
  }, []);

  return { source, error, isOpening, choose, clear };
}
