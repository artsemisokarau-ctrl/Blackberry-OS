import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import CameraViewfinder, { type CameraFacing } from '@/components/apps/camera/CameraViewfinder';
import PhotoGallery from '@/components/apps/pictures/PhotoGallery';
import { usePersistentState } from '@/hooks/usePersistentState';
import { MAX_PHOTOS, STORAGE_KEYS, newId, type Photo } from '@/lib/records';

type Mode = 'viewfinder' | 'gallery';

export default function CameraApp() {
  const [photos, setPhotos] = usePersistentState<Photo[]>(STORAGE_KEYS.photos, []);
  const [mode, setMode] = useState<Mode>('viewfinder');
  const [facing, setFacing] = useState<CameraFacing>('user');

  const capture = (dataUrl: string) => {
    setPhotos((prev) => [{ id: newId(), dataUrl, createdAt: Date.now() }, ...prev].slice(0, MAX_PHOTOS));
  };

  const deletePhoto = (id: string) => setPhotos((prev) => prev.filter((photo) => photo.id !== id));

  if (mode === 'gallery') {
    return (
      <AppFrame appId="camera" right={`${photos.length} saved`}>
        <PhotoGallery photos={photos} onDelete={deletePhoto} onBack={() => setMode('viewfinder')} />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="camera" right={`${photos.length} saved`}>
      <CameraViewfinder
        count={photos.length}
        facing={facing}
        onFacingChange={setFacing}
        onCapture={capture}
        onGallery={() => setMode('gallery')}
      />
    </AppFrame>
  );
}
