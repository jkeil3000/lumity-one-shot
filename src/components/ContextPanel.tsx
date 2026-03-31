import { X, Heart, MessageCircle, Bookmark, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTypeLabel } from '../data/mock';
import type { ContentItem } from '../data/mock';
import AvatarCircle from './cards/AvatarCircle';

function getHostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|v\/|embed\/|youtu\.be\/)([^"&?/\s]{11})/i);
  return m ? m[1] : null;
}

function getSpotifyEmbed(url: string): string | null {
  const m = url.match(/spotify\.com\/(track|album|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

/* ─── Article link preview via microlink.io ─── */
interface LinkMeta { title?: string; description?: string; image?: string; }

function ArticlePreview({ url, fallbackTitle, fallbackThumb }: { url: string; fallbackTitle?: string; fallbackThumb?: string }) {
  const [meta, setMeta] = useState<LinkMeta | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
    setMeta(null);
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(json => {
        if (json?.status === 'success') {
          setMeta({
            title: json.data?.title ?? undefined,
            description: json.data?.description ?? undefined,
            image: json.data?.image?.url ?? undefined,
          });
          setStatus('done');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [url]);

  const image = meta?.image || fallbackThumb;
  const title = meta?.title || fallbackTitle;
  const hostname = getHostname(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block mx-6 mt-5 rounded-xl border border-rule overflow-hidden hover:border-warm/40 transition-colors group"
      onClick={e => e.stopPropagation()}
    >
      {image && (
        <div className="aspect-[2/1] overflow-hidden bg-surface-2">
          <img src={image} alt={title || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
        </div>
      )}
      <div className="px-4 py-3.5 bg-surface-0">
        {status === 'loading' && !fallbackTitle ? (
          <div className="h-4 w-48 rounded bg-surface-2 animate-pulse mb-2" />
        ) : (
          <p className="text-[13px] font-semibold text-ink-1 leading-[1.35] line-clamp-2 mb-1 group-hover:text-warm transition-colors">
            {title || hostname}
          </p>
        )}
        {meta?.description && (
          <p className="text-[11px] text-ink-3 leading-[1.5] line-clamp-2 mb-2">{meta.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-ink-4 uppercase tracking-[0.06em]">{hostname}</span>
          <ArrowUpRight size={12} className="text-ink-4 group-hover:text-warm transition-colors" />
        </div>
      </div>
    </a>
  );
}

/* ─── Media section ─── */
function MediaEmbed({ item }: { item: ContentItem }) {
  const url = item.sourceUrl ?? '';

  if (item.type === 'video' && url) {
    const ytId = getYouTubeId(url);
    if (ytId) {
      return (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (item.type === 'podcast' && url) {
    const spotifyEmbed = getSpotifyEmbed(url);
    if (spotifyEmbed) {
      return (
        <div className="px-6 pt-5">
          <iframe
            src={spotifyEmbed}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="border-0 rounded-xl"
          />
        </div>
      );
    }
  }

  if ((item.type === 'article' || item.type === 'book') && url) {
    return <ArticlePreview url={url} fallbackTitle={item.title} fallbackThumb={item.thumbnail} />;
  }

  if (item.thumbnail) {
    return (
      <div className="relative aspect-[2/1] overflow-hidden">
        <img src={item.thumbnail} alt={item.title || 'Content'} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  return null;
}

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
        <MediaEmbed item={item} />

        <div className="px-6 pt-6 pb-8">
          {/* Title */}
          {item.title && (
            <h2 className="text-[17px] font-medium text-ink-1 leading-[1.35] mb-1 tracking-[-0.01em]">{item.title}</h2>
          )}
          {item.sourceUrl && (item.type === 'video' || item.type === 'podcast' || !item.title) && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-ink-4 hover:text-warm transition-colors mb-5"
            >
              {item.source || getHostname(item.sourceUrl)} <ArrowUpRight size={11} />
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
