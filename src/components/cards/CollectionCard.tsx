interface CollectionCardProps {
  name: string;
  count: number;
  thumbnail?: string;
  onClick: () => void;
}

export default function CollectionCard({ name, count, thumbnail, onClick }: CollectionCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[100px] rounded-xl overflow-hidden group cursor-pointer text-left w-full"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-surface-2" />
      )}
      <div className="absolute inset-0 bg-ink-1/40 group-hover:bg-ink-1/50 transition-colors" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[13px] font-semibold text-white">{name}</span>
        <span className="text-[10px] text-white/70 mt-0.5">{count} items</span>
      </div>
    </button>
  );
}
