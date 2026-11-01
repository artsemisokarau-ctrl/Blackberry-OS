import { useEffect, useRef, useState } from 'react';
import { useAppKeys } from '@/lib/appKeys';
import { drawDemoScene } from '@/components/apps/camera/demoScene';

export type CameraFacing = 'user' | 'environment';

interface CameraViewfinderProps {
  count: number;
  facing: CameraFacing;
  onFacingChange: (facing: CameraFacing) => void;
  onCapture: (dataUrl: string) => void;
  onGallery: () => void;
}

type Source = 'connecting' | 'live' | 'demo';

const SHOT_WIDTH = 320;
const SHOT_HEIGHT = 240;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const FACING_LABEL: Record<CameraFacing, string> = { user: 'Front', environment: 'Rear' };

function captureFrame(source: HTMLVideoElement | HTMLCanvasElement, zoom: number): string | null {
  const width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
  const height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
  if (!width || !height) return null;

  const cropWidth = Math.min(width, (height * 4) / 3) / zoom;
  const cropHeight = cropWidth * 0.75;
  const sx = (width - cropWidth) / 2;
  const sy = (height - cropHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = SHOT_WIDTH;
  canvas.height = SHOT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(source, sx, sy, cropWidth, cropHeight, 0, 0, SHOT_WIDTH, SHOT_HEIGHT);
  return canvas.toDataURL('image/jpeg', 0.72);
}

export default function CameraViewfinder({
  count,
  facing,
  onFacingChange,
  onCapture,
  onGallery,
}: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const demoRef = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<Source>('connecting');
  const [notice, setNotice] = useState('');
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    setSource('connecting');
    setNotice('');
    const cameraName = facing === 'environment' ? 'rear camera' : 'camera';

    const fallBackToDemo = (message: string) => {
      if (cancelled) return;
      setSource('demo');
      setNotice(message);
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      fallBackToDemo('Camera is not supported in this browser. Demo mode is on.');
    } else {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: facing === 'environment' ? { exact: 'environment' } : { ideal: 'user' },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })
        .then((granted) => {
          if (cancelled) {
            granted.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = granted;
          if (videoRef.current) videoRef.current.srcObject = granted;
          setSource('live');
          setNotice('');
        })
        .catch((error: unknown) => {
          const name = error instanceof DOMException ? error.name : '';
          if (name === 'NotAllowedError' || name === 'SecurityError') {
            fallBackToDemo('Camera permission was denied. Demo mode is on.');
          } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
            fallBackToDemo(`No ${cameraName} was found. Demo mode is on.`);
          } else {
            fallBackToDemo('The camera could not start. Demo mode is on.');
          }
        });
    }

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facing]);

  useEffect(() => {
    const canvas = demoRef.current;
    const ctx = canvas?.getContext('2d');
    if (source !== 'demo' || !canvas || !ctx) return;

    let frame = 0;
    const draw = (time: number) => {
      drawDemoScene(ctx, canvas.width, canvas.height, time);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [source]);

  const shutter = () => {
    const frameSource = source === 'live' ? videoRef.current : demoRef.current;
    if (!frameSource) return;
    const dataUrl = captureFrame(frameSource, zoom);
    if (!dataUrl) return;
    onCapture(dataUrl);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 150);
  };

  const adjustZoom = (delta: number) =>
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + delta)));

  useAppKeys((key) => {
    if (key === 'select') {
      shutter();
      return true;
    }
    if (key === 'left') {
      adjustZoom(-ZOOM_STEP);
      return true;
    }
    if (key === 'right') {
      adjustZoom(ZOOM_STEP);
      return true;
    }
    if (key === 'menu') {
      onGallery();
      return true;
    }
    return false;
  });

  const previewStyle = { transform: `scale(${zoom})` };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover ${source === 'live' ? '' : 'hidden'}`}
          style={previewStyle}
        />
        <canvas
          ref={demoRef}
          width={SHOT_WIDTH}
          height={SHOT_HEIGHT}
          className={`absolute inset-0 h-full w-full object-cover ${source === 'demo' ? '' : 'hidden'}`}
          style={previewStyle}
        />
        {source === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400">
            Starting camera...
          </div>
        )}
        {notice && (
          <div className="absolute left-1 right-1 top-1 rounded bg-black/70 px-2 py-1 text-[9px] text-amber-200">
            {notice}
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white/80" />}
        <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[9px] text-zinc-200">
          {zoom.toFixed(1)}x
        </div>
        <button
          type="button"
          onPointerDown={() => onFacingChange(facing === 'user' ? 'environment' : 'user')}
          className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-200"
        >
          {FACING_LABEL[facing]} cam
        </button>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 bg-zinc-900 px-2 py-1.5">
        <button
          type="button"
          onPointerDown={onGallery}
          className="bb-key h-8 w-14 rounded-[5px] text-[10px] font-semibold text-zinc-200"
        >
          Photos {count}
        </button>
        <button
          type="button"
          aria-label="Take photo"
          onPointerDown={shutter}
          className="h-11 w-11 rounded-full border-2 border-zinc-500 bg-gradient-to-b from-[#5be05b] to-[#1f8f25] shadow-[0_2px_0_#0b4a10]"
        />
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            onPointerDown={() => adjustZoom(-ZOOM_STEP)}
            className="bb-key h-8 w-8 rounded-[5px] text-sm font-bold text-zinc-200"
          >
            -
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onPointerDown={() => adjustZoom(ZOOM_STEP)}
            className="bb-key h-8 w-8 rounded-[5px] text-sm font-bold text-zinc-200"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
