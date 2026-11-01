import AppFrame from '@/components/ui/AppFrame';
import PhotoGallery from '@/components/apps/pictures/PhotoGallery';
import { usePersistentState } from '@/hooks/usePersistentState';
import { STORAGE_KEYS, type Photo } from '@/lib/records';

export default function PicturesApp() {
  const [photos, setPhotos] = usePersistentState<Photo[]>(STORAGE_KEYS.photos, []);

  return (
    <AppFrame appId="pictures" right={`${photos.length} photos`}>
      <PhotoGallery photos={photos} onDelete={(id) => setPhotos((prev) => prev.filter((photo) => photo.id !== id))} />
    </AppFrame>
  );
}
