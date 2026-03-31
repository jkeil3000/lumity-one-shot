import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  action?: string;
  onAction?: () => void;
  description?: string;
  tone?: 'default' | 'inverse';
  /** Use subtle for sub-section titles (e.g. interest name inside Shelves) */
  subtle?: boolean;
  children: React.ReactNode;
}

export default function HorizontalCarousel({
  title,
  action,
  onAction,
  description,
  tone = 'default',
  subtle,
  children,
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const isInverse = tone === 'inverse';

  return (
    <div>
      {/* Header */}
      <div className={`flex items-end justify-between gap-4 pb-3 mb-5 ${subtle ? '' : isInverse ? 'border-b border-white/12' : 'border-b border-rule-faint'}`}>
        <div>
          <h2 className={subtle
            ? 'text-[13px] font-medium text-ink-2 tracking-[-0.01em]'
            : isInverse
              ? 'text-[20px] font-semibold text-white tracking-[-0.03em]'
              : 'text-[20px] font-semibold text-ink-1 tracking-[-0.03em]'
          }>{title}</h2>
          {!subtle && description && (
            <p className={`text-[12px] mt-1 ${isInverse ? 'text-white/72' : 'text-ink-2'}`}>{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <button
              onClick={onAction}
              className={`text-[12px] font-medium transition-colors mr-2 ${isInverse ? 'text-white/72 hover:text-white' : 'text-ink-1 hover:text-warm'}`}
            >
              {action}
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
              isInverse
                ? 'border-white/16 text-white/72 hover:text-white hover:border-white/34'
                : 'border-rule text-ink-4 hover:text-ink-2 hover:border-ink-4'
            }`}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
              isInverse
                ? 'border-white/16 text-white/72 hover:text-white hover:border-white/34'
                : 'border-rule text-ink-4 hover:text-ink-2 hover:border-ink-4'
            }`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}
