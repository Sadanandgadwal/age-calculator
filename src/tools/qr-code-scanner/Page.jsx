import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ExternalLink, ScanLine } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, checkFile, decodeFrame, describeCameraError, fitSize, getLinkWarning, readLink } from './logic.js';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const SCAN_INTERVAL_MS = 200;
const cameraButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-white transition-colors outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

function readPixels(source, sourceWidth, sourceHeight) {
  const { width, height } = fitSize(sourceWidth, sourceHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(source, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    image.src = url;
  });
}

export default function QrCodeScannerPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const video = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);

  const stopCamera = () => {
    clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setIsCameraOn(false);
  };

  useEffect(
    () => () => {
      clearInterval(timer.current);
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const scanFile = async (file) => {
    setResult(null);
    const problem = checkFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(undefined);
    try {
      const image = await loadImage(file);
      const text = decodeFrame(readPixels(image, image.naturalWidth, image.naturalHeight));
      if (text === null) setError('No QR code was found in this image. Try a sharper, closer picture.');
      else setResult({ text, source: 'Image' });
    } catch {
      setError('This image could not be read. Please try a PNG or JPG.');
    }
  };

  const startCamera = async () => {
    setResult(null);
    setError(undefined);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot use the camera here. Camera access needs a secure (https) page. Scan from an image instead.');
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setIsCameraOn(true);
      video.current.srcObject = stream.current;
      await video.current.play();
      timer.current = setInterval(() => {
        const { videoWidth, videoHeight } = video.current ?? {};
        if (!videoWidth) return;
        const text = decodeFrame(readPixels(video.current, videoWidth, videoHeight));
        if (text !== null) {
          stopCamera();
          setResult({ text, source: 'Camera' });
        }
      }, SCAN_INTERVAL_MS);
    } catch (failure) {
      stopCamera();
      setError(describeCameraError(failure));
    }
  };

  const changeMode = (id) => {
    stopCamera();
    setError(undefined);
    setModeId(id);
  };

  const clear = () => {
    stopCamera();
    setError(undefined);
    setResult(null);
  };

  const link = result && readLink(result.text);

  return (
    <ToolLayout toolId="qr-code-scanner" content={content}>
      <TextToolShell
        formLabel="Choose how to scan"
        onClear={clear}
        panel={{ title: 'Scanned Content', icon: ScanLine, emptyText: 'Choose an image or start your camera to read a QR code.' }}
        results={
          result && (
            <>
              <TextOutput value={result.text} className="font-mono" />
              {link && (
                <div className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium print:hidden">
                  <p>{getLinkWarning()}</p>
                  <a href={link} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline">
                    <ExternalLink aria-hidden="true" className="size-4" />
                    Open this link
                  </a>
                </div>
              )}
              <ResultActions getText={() => result.text} getReport={() => buildReport(result.text, result.source)} />
            </>
          )
        }
      >
        <SegmentedControl label="Scan" options={MODES} value={modeId} onChange={changeMode} />
        {modeId === 'image' ? (
          <FileDropZone id="qr-file" label="Choose or drop an image" hint="PNG or JPG, up to 25 MB. It stays on your device." accept="image/*" onFile={scanFile} error={error} />
        ) : (
          <>
            <div hidden={!isCameraOn}>
              <video ref={video} playsInline muted aria-label="Camera preview" className="w-full rounded-2xl bg-ink" />
            </div>
            <button type="button" onClick={isCameraOn ? stopCamera : startCamera} className={cameraButton}>
              {isCameraOn ? <CameraOff aria-hidden="true" className="size-5" /> : <Camera aria-hidden="true" className="size-5" />}
              {isCameraOn ? 'Stop camera' : 'Start camera'}
            </button>
            {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
          </>
        )}
      </TextToolShell>
    </ToolLayout>
  );
}
