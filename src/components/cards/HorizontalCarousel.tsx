import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  action?: string;
  onAction?: () => void;
  /** Use subtle for sub-section titles (e.g. interest name inside Shelves) */
  subtle?: boolean;
  children: React.ReactNode;
}

export default function HorizontalCarousel({ title, action, onAction, subtle, children }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <div className={`flex items-center justify-between pb-2 mb-4 ${subtle ? '' : 'border-b border-rule-faint'}`}>
        <h2 className={subtle
          ? 'text-[13px] font-medium text-ink-2 tracking-[-0.01em]'
          : 'text-[12px] font-semibold text-ink-3 uppercase tracking-[0.06em]'
        }>{title}</h2>
        <div className="flex items-center gap-2">
          {action && (
            <button onClick={onAction} className="text-[12px] text-ink-4 hover:text-warm transition-colors mr-2">
              {action}
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full border border-rule flex items-center justify-center text-ink-4 hover:text-ink-2 hover:border-ink-4 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full border border-rule flex items-center justify-center text-ink-4 hover:text-ink-2 hover:border-ink-4 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
    </div>
  );
}
