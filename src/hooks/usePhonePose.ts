import { useState, type PointerEvent, type PointerEventHandler } from 'react';

export interface PhonePose {
  rotX: number;
  rotY: number;
  zoom: number;
}

export interface PoseBindings {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
}

const DEFAULT_POSE: PhonePose = { rotX: 0, rotY: 0, zoom: 1 };
const DRAG_DEGREES_PER_PX = 0.45;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function usePhonePose() {
  const [pose, setPose] = useState<PhonePose>(DEFAULT_POSE);
  const [dragging, setDragging] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ id: number; x: number; y: number } | null>(null);

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const onControl = (event.target as HTMLElement).closest('button, [data-no-rotate]') !== null;
    if (onControl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setLastPointer({ id: event.pointerId, x: event.clientX, y: event.clientY });
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!lastPointer || lastPointer.id !== event.pointerId) return;
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    setLastPointer({ id: event.pointerId, x: event.clientX, y: event.clientY });
    setPose((prev) => ({
      ...prev,
      rotY: prev.rotY + dx * DRAG_DEGREES_PER_PX,
      rotX: clamp(prev.rotX - dy * DRAG_DEGREES_PER_PX, -90, 90),
    }));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!lastPointer || lastPointer.id !== event.pointerId) return;
    setLastPointer(null);
    setDragging(false);
  };

  const zoomBy = (delta: number) => {
    setPose((prev) => ({ ...prev, zoom: clamp(prev.zoom + delta, ZOOM_MIN, ZOOM_MAX) }));
  };

  const reset = () => setPose(DEFAULT_POSE);

  const flip = () => {
    setPose((prev) => {
      const facingBack = Math.cos((prev.rotY * Math.PI) / 180) < 0;
      const base = Math.round(prev.rotY / 360) * 360;
      return { ...prev, rotX: 0, rotY: base + (facingBack ? 0 : 180) };
    });
  };

  const bindings: PoseBindings = { onPointerDown, onPointerMove, onPointerUp: endDrag };

  return {
    pose,
    dragging,
    inspecting,
    setInspecting,
    bindings,
    zoomBy,
    reset,
    flip,
  };
}

export type PhonePoseControls = ReturnType<typeof usePhonePose>;
