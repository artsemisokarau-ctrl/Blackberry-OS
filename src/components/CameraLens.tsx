interface CameraLensProps {
  size: number;
  label: string;
}

export default function CameraLens({ size, label }: CameraLensProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative shrink-0 rounded-full bg-gradient-to-b from-[#d9dde3] via-[#6f757e] to-[#23262c] p-[1.5px] shadow-[0_1px_2px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.35)]"
      style={{ width: size, height: size }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_50%,#0b0d12_0%,#05060a_55%,#000_100%)] shadow-[inset_0_0_3px_rgba(0,0,0,1)]">
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#2a3a5c_0%,#0a1020_70%)] ring-1 ring-black/80" />
        <div className="absolute left-[18%] top-[16%] h-[24%] w-[30%] rounded-full bg-white/70 blur-[0.5px] rotate-[-30deg]" />
        <div className="absolute bottom-[20%] right-[22%] h-[8%] w-[8%] rounded-full bg-white/25" />
      </div>
    </div>
  );
}
