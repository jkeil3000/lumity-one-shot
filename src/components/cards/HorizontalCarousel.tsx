import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export default function HorizontalCarousel({ title, action, onAction, children }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">{title}</h2>
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
