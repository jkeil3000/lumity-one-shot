import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import type { ContentItem } from '../../data/mock';
import { getTypeLabel } from '../../data/mock';
import AvatarCircle from './AvatarCircle';

type CardSize = 'large' | 'medium' | 'compact';

interface ContentCardProps {
  item: ContentItem;
  size?: CardSize;
  /** fluid: fills grid cell width instead of fixed 260px (use in 2-col grids, not carousels) */
  fluid?: boolean;
  onClick: () => void;
}

export default function ContentCard({ item, size = 'medium', fluid, onClick }: ContentCardProps) {
  if (size === 'large') return <LargeCard item={item} onClick={onClick} />;
  if (size === 'compact') return <CompactCard item={item} onClick={onClick} />;
  return <MediumCard item={item} fluid={fluid} onClick={onClick} />;
}

/* ─── Large Card (Stream Scroll) ─── */
function LargeCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
  const isThought = item.type === 'thought';

  return (
    <article
      onClick={onClick}
      className="bg-surface-1 rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md border border-rule-faint"
    >
      {/* Thumbnail or thought bg */}
      {isThought ? (
        <div className="bg-warm-surface px-8 py-8">
          <p className="font-reading text-[18px] text-ink-1 leading-[1.6] italic">
            "{item.caption}"
          </p>
        </div>
      ) : item.thumbnail ? (
        <div className="relative aspect-[3/1] overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="gradient-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/70 mb-1 block">
              {getTypeLabel(item.type)}
            </span>
            <h3 className="text-[17px] font-semibold text-white leading-[1.25] tracking-[-0.015em]">
              {item.title}
            </h3>
          </div>
        </div>
      ) : null}

      {/* Content below image */}
      <div className="px-5 py-4">
        {/* Title (only if no thumbnail overlay) */}
        {!isThought && !item.thumbnail && item.title && (
          <h3 className="text-[16px] font-semibold text-ink-1 leading-[1.3] mb-2 tracking-[-0.015em] group-hover:text-warm transition-colors">
            {item.title}
          </h3>
        )}

        {/* Caption */}
        {!isThought && (
          <p className="font-reading text-[13px] text-ink-2 leading-[1.65] mb-3">
            {item.caption}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-3">
          <AvatarCircle user={item.author} size="sm" />
          <span className="text-[12px] font-medium text-ink-2">{item.author.displayName}</span>
          <span className="text-ink-4 text-[8px]">·</span>
          <span className="text-[11px] text-ink-4">{item.createdAt}</span>
          {item.source && (
            <>
              <span className="text-ink-4 text-[8px]">·</span>
              <span className="text-[11px] text-ink-4">{item.source}</span>
            </>
          )}
        </div>

        {/* Tags + Engagement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {item.interests.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[10px] text-[color:color-mix(in_srgb,var(--color-warm)_52%,var(--color-ink-2))] bg-[color:color-mix(in_srgb,var(--color-warm-surface)_58%,white)] px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-ink-4 hover:text-warm transition-colors">
              <Heart size={13} strokeWidth={1.5} /> {item.likes}
            </span>
            {item.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-ink-4 hover:text-warm transition-colors">
                <MessageCircle size={13} strokeWidth={1.5} /> {item.comments.length}
              </span>
            )}
            <span className="text-ink-4 hover:text-warm transition-colors">
              <Bookmark size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Medium Card (Carousels) ─── */
function MediumCard({ item, fluid, onClick }: { item: ContentItem; fluid?: boolean; onClick: () => void }) {
  const isThought = item.type === 'thought';

  return (
    <div
      onClick={onClick}
      className={`${fluid ? 'w-full' : 'w-[260px] flex-shrink-0'} bg-surface-1 rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md border border-rule-faint`}
    >
      {isThought ? (
        <div className="bg-warm-surface px-4 py-5 h-[140px] flex items-center">
          <p className="font-reading text-[13px] text-ink-1 leading-[1.65] italic line-clamp-4">
            "{item.caption}"
          </p>
        </div>
      ) : item.thumbnail ? (
        <div className="relative h-[140px] overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.06em] bg-surface-1/90 text-ink-2 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {getTypeLabel(item.type)}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-[140px] bg-surface-2 flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.06em] text-ink-4">{getTypeLabel(item.type)}</span>
        </div>
      )}

      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-ink-1 leading-[1.35] line-clamp-2 mb-1.5 group-hover:text-warm transition-colors min-h-[36px]">
          {item.title || item.caption.slice(0, 60)}
        </h3>
        <p className="font-reading text-[11px] text-ink-3 leading-[1.5] line-clamp-2 mb-2.5">
          {item.caption}
        </p>
        <div className="flex items-center gap-2">
          <AvatarCircle user={item.author} size="sm" />
          <span className="text-[11px] text-ink-3 truncate">{item.author.displayName}</span>
          <span className="text-[11px] text-ink-4 ml-auto flex-shrink-0">{item.createdAt}</span>
        </div>
        {item.interests.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            {item.interests.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[9px] text-[color:color-mix(in_srgb,var(--color-warm)_48%,var(--color-ink-2))] bg-[color:color-mix(in_srgb,var(--color-warm-surface)_54%,white)] px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Compact Card (Scan Mode Grid) ─── */
function CompactCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
  const isThought = item.type === 'thought';

  return (
    <div
      onClick={onClick}
      className="bg-surface-1 rounded-lg overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-sm border border-rule-faint"
    >
      {isThought ? (
        <div className="bg-warm-surface px-3 py-3 h-[90px] flex items-center">
          <p className="font-reading text-[11px] text-ink-2 leading-[1.55] italic line-clamp-3">
            "{item.caption.slice(0, 100)}"
          </p>
        </div>
      ) : item.thumbnail ? (
        <div className="relative h-[90px] overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title || 'Content'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[8px] font-semibold uppercase tracking-[0.06em] bg-surface-1/90 text-ink-3 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              {getTypeLabel(item.type)}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-[90px] bg-surface-2 flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-[0.06em] text-ink-4">{getTypeLabel(item.type)}</span>
        </div>
      )}

      <div className="p-2.5">
        <h3 className="text-[12px] font-medium text-ink-1 leading-[1.35] line-clamp-2 group-hover:text-warm transition-colors mb-1">
          {item.title || item.caption.slice(0, 50)}
        </h3>
        {item.caption && item.title && (
          <p className="font-reading text-[10px] text-ink-3 leading-[1.5] line-clamp-2 mb-1.5">
            {item.caption}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <AvatarCircle user={item.author} size="sm" />
          <span className="text-[10px] text-ink-4 truncate">{item.author.displayName}</span>
        </div>
      </div>
    </div>
  );
}
