import { X, Heart, MessageCircle, Bookmark, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTypeLabel } from '../data/mock';
import AvatarCircle from './cards/AvatarCircle';

export default function ContextPanel() {
  const { selectedItem, contextPanelOpen, setSelectedItem } = useApp();
  if (!contextPanelOpen || !selectedItem) return null;
  const item = selectedItem;

  return (
    <div className="w-[480px] h-screen border-l border-rule bg-surface-1 flex-shrink-0 flex flex-col overflow-hidden anim-slide-right">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-rule-faint flex-shrink-0">
        <span className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em]">{getTypeLabel(item.type)}</span>
        <button onClick={() => setSelectedItem(null)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-2 text-ink-4 hover:text-ink-2 transition-colors">
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Thumbnail hero */}
        {item.thumbnail && (
          <div className="relative aspect-[2/1] overflow-hidden">
            <img src={item.thumbnail} alt={item.title || 'Content'} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        <div className="px-6 pt-6 pb-8">
          {/* Title */}
          {item.title && (
            <h2 className="text-[17px] font-medium text-ink-1 leading-[1.35] mb-1 tracking-[-0.01em]">{item.title}</h2>
          )}
          {item.source && (
            <a href={item.sourceUrl || '#'} className="inline-flex items-center gap-1 text-[12px] text-ink-4 hover:text-warm transition-colors mb-5">
              {item.source} <ArrowUpRight size={11} />
            </a>
          )}

          {/* Author line */}
          <div className="flex items-center gap-2 mt-4 mb-5">
            <AvatarCircle user={item.author} size="md" />
            <span className="text-[13px] font-medium text-ink-1">{item.author.displayName}</span>
            <span className="text-[12px] text-ink-4 ml-auto">{item.createdAt}</span>
          </div>

          {/* Caption — the voice */}
          <p className="font-reading text-[15px] leading-[1.65] text-ink-1 mb-6">{item.caption}</p>

          {/* Tags — quiet */}
          {item.interests.length > 0 && (
            <div className="flex gap-2 mb-6">
              {item.interests.map(t => (
                <span key={t} className="text-[11px] text-ink-4">{t}</span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-5 py-3 border-t border-rule-faint">
            <button className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-warm transition-colors">
              <Heart size={14} strokeWidth={1.8} /> {item.likes}
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-warm transition-colors">
              <MessageCircle size={14} strokeWidth={1.8} /> {item.comments.length}
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-warm transition-colors ml-auto">
              <Bookmark size={14} strokeWidth={1.8} /> Save
            </button>
          </div>
        </div>

        {/* Discussion */}
        <div className="px-6 pb-8">
          <div className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em] mb-4">Discussion</div>
          {item.comments.length === 0 ? (
            <p className="text-[13px] text-ink-4 italic">No replies yet.</p>
          ) : (
            <div className="space-y-5">
              {item.comments.map(c => (
                <div key={c.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-medium text-ink-2">{c.author.displayName}</span>
                    <span className="text-[11px] text-ink-4">{c.createdAt}</span>
                  </div>
                  <p className="text-[13px] text-ink-2 leading-[1.55]">{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply field */}
          <div className="mt-5">
            <textarea
              placeholder="Add to the discussion..."
              rows={2}
              className="w-full text-[13px] bg-surface-0 border border-rule-faint rounded-lg px-3 py-2.5 resize-none text-ink-1 placeholder:text-ink-4 focus:outline-none focus:border-rule transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
