import { useState, useEffect, useRef } from 'react';
import { X, Globe, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { currentUser, allInterests, type ContentItem } from '../data/mock';

const placeholders = [
  'What made this worth saving?',
  'Your take...',
  'Why does this matter to you?',
];

export default function CaptureSheet() {
  const { captureOpen, setCaptureOpen, addItem } = useApp();
  const [contentValue, setContentValue] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [showTags, setShowTags] = useState(false);
  const [placeholder] = useState(placeholders[Math.floor(Math.random() * placeholders.length)]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (captureOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [captureOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !captureOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setCaptureOpen(true);
      }
      if (e.key === 'Escape' && captureOpen) close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [captureOpen, setCaptureOpen]);

  const close = () => {
    setCaptureOpen(false);
    setContentValue(''); setCaption(''); setSelectedInterests([]); setVisibility('public'); setShowTags(false);
  };

  const isLink = contentValue.startsWith('http') || contentValue.includes('.com') || contentValue.includes('.org');

  const toggleInterest = (i: string) => {
    if (selectedInterests.includes(i)) setSelectedInterests(selectedInterests.filter(x => x !== i));
    else if (selectedInterests.length < 3) setSelectedInterests([...selectedInterests, i]);
  };

  const save = () => {
    if (!contentValue.trim() && !caption.trim()) return;
    const item: ContentItem = {
      id: `new-${Date.now()}`,
      type: isLink ? 'article' : 'thought',
      title: isLink ? contentValue : '',
      source: isLink ? (() => { try { return new URL(contentValue.startsWith('http') ? contentValue : `https://${contentValue}`).hostname.replace('www.', ''); } catch { return contentValue; } })() : undefined,
      sourceUrl: isLink ? contentValue : undefined,
      caption: caption || contentValue,
      author: currentUser,
      interests: selectedInterests,
      visibility,
      state: 'saved',
      collections: [],
      likes: 0,
      comments: [],
      createdAt: 'just now',
    };
    addItem(item);
    close();
  };

  if (!captureOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-ink-1/8 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-[480px] bg-surface-1 rounded-xl shadow-2xl border border-rule anim-scale-in">
        <button onClick={close} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-2 text-ink-4 hover:text-ink-2 transition-colors">
          <X size={14} />
        </button>

        <div className="p-5 pt-6">
          {/* Content field */}
          <input
            ref={inputRef}
            type="text"
            value={contentValue}
            onChange={e => setContentValue(e.target.value)}
            placeholder="Paste a link, or start typing..."
            className="w-full text-[14px] text-ink-1 placeholder:text-ink-4 bg-transparent border-b border-rule-faint pb-3 mb-4 focus:outline-none focus:border-rule transition-colors"
          />

          {/* Link preview hint */}
          {isLink && contentValue.length > 8 && (
            <div className="mb-4 py-2 px-3 bg-surface-0 rounded-lg text-[12px] text-ink-3 border border-rule-faint">
              Link detected — {contentValue.slice(0, 40)}{contentValue.length > 40 ? '…' : ''}
            </div>
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full font-reading text-[14px] text-ink-1 placeholder:text-ink-4 bg-transparent resize-none focus:outline-none leading-[1.6]"
          />

          {/* Tags */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {selectedInterests.map(i => (
              <button key={i} onClick={() => toggleInterest(i)} className="text-[11px] text-warm bg-warm-surface rounded px-2 py-[2px] hover:opacity-80 transition-opacity">
                {i} ×
              </button>
            ))}
            <button onClick={() => setShowTags(!showTags)} className="text-[11px] text-ink-4 hover:text-ink-3 transition-colors">
              {showTags ? 'done' : '+ tag'}
            </button>
          </div>

          {showTags && (
            <div className="mt-2 flex flex-wrap gap-1.5 py-2">
              {allInterests.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`text-[11px] rounded px-2 py-[3px] transition-colors ${
                    selectedInterests.includes(i) ? 'bg-warm text-white' : 'bg-surface-2 text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}

          {/* Footer: visibility + save */}
          <div className="mt-5 pt-4 border-t border-rule-faint flex items-center justify-between">
            <div className="flex items-center gap-[2px] bg-surface-0 rounded-lg p-[3px]">
              <button
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-1.5 text-[12px] px-2.5 py-[5px] rounded-md transition-all ${
                  visibility === 'private' ? 'bg-surface-1 text-ink-1 shadow-sm' : 'text-ink-4'
                }`}
              >
                <Lock size={12} /> Just me
              </button>
              <button
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-1.5 text-[12px] px-2.5 py-[5px] rounded-md transition-all ${
                  visibility === 'public' ? 'bg-surface-1 text-ink-1 shadow-sm' : 'text-ink-4'
                }`}
              >
                <Globe size={12} /> Share
              </button>
            </div>

            <button
              onClick={save}
              disabled={!contentValue.trim() && !caption.trim()}
              className="px-4 py-[6px] bg-warm text-white text-[13px] font-medium rounded-lg hover:bg-warm-hover transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
