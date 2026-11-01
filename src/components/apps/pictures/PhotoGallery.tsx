import { useState } from 'react';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import type { Photo } from '@/lib/records';

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete: (id: string) => void;
  onBack?: () => void;
}

const COLUMNS = 3;
const ROW_PITCH = 64;
const VISIBLE_ROWS = 3;

export default function PhotoGallery({ photos, onDelete, onBack }: PhotoGalleryProps) {
  const [cursor, setCursor] = useState(0);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const viewingIndex = photos.findIndex((photo) => photo.id === viewingId);
  const viewing = viewingIndex >= 0 ? photos[viewingIndex] : null;

  const deleteViewing = () => {
    if (!viewing) return;
    onDelete(viewing.id);
    setViewingId(null);
    setCursor((value) => Math.max(0, Math.min(value, photos.length - 2)));
  };

  useAppKeys((key) => {
    if (viewing) {
      if (key === 'back') {
        setViewingId(null);
        return true;
      }
      if (key === 'left' || key === 'right') {
        const neighbour = photos[viewingIndex + (key === 'left' ? -1 : 1)];
        if (neighbour) setViewingId(neighbour.id);
        return true;
      }
      if (key === 'backspace') {
        deleteViewing();
        return true;
      }
      return false;
    }
    if (key === 'back' && onBack) {
      onBack();
      return true;
    }
    if (key === 'select' && photos[cursor]) {
      setViewingId(photos[cursor].id);
      return true;
    }
    const next = moveCursor(key, cursor, photos.length, COLUMNS);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  if (viewing) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-black">
        <img src={viewing.dataUrl} alt="Saved photo" className="min-h-0 flex-1 object-contain" />
        <div className="flex shrink-0 items-center justify-between bg-zinc-900 px-2 py-1 text-[9px] text-zinc-400">
          <span>
            {viewingIndex + 1} / {photos.length}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onPointerDown={deleteViewing}
              className="bb-key rounded-[4px] px-2 py-0.5 text-[10px] font-semibold text-red-300"
            >
              Delete
            </button>
            <button
              type="button"
              onPointerDown={() => setViewingId(null)}
              className="bb-key rounded-[4px] px-2 py-0.5 text-[10px] font-semibold text-zinc-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cursorRow = Math.floor(cursor / COLUMNS);
  const totalRows = Math.ceil(photos.length / COLUMNS);
  const scrollRow = Math.max(0, Math.min(cursorRow - 1, totalRows - VISIBLE_ROWS));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden p-1.5">
        {photos.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-zinc-500">
            No photos yet. Take one in Camera.
          </div>
        ) : (
          <div
            className="grid grid-cols-3 gap-1 transition-transform duration-200"
            style={{ transform: `translateY(${-scrollRow * ROW_PITCH}px)` }}
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onPointerDown={() => {
                  setCursor(index);
                  setViewingId(photo.id);
                }}
                className={`h-[60px] overflow-hidden rounded-[3px] ${
                  index === cursor ? 'ring-2 ring-[#7ed957]' : 'ring-1 ring-zinc-700'
                }`}
              >
                <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="shrink-0 bg-zinc-900 px-2 py-1 text-[9px] text-zinc-500">Enter: open | Back: close</p>
    </div>
  );
}
