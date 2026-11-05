import { useEffect, useRef } from 'react';

export default function BlobImage({ blob, alt, ...props }) {
  const image = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return <img ref={image} alt={alt} {...props} />;
}
