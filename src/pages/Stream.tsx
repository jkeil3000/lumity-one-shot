import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { allInterests, communities } from '../data/mock';
import ContentCard from '../components/cards/ContentCard';
import SectionHeader from '../components/cards/SectionHeader';

export default function Stream() {
  const { viewMode, setViewMode, streamLens, setStreamLens, feed, setSelectedItem } = useApp();
  const [lensOpen, setLensOpen] = useState(false);

  const filtered = streamLens === 'following' || streamLens === 'foryou'
    ? feed
    : feed.filter(item => item.interests.some(i => i.toLowerCase() === streamLens.toLowerCase()));

  const today = filtered.slice(0, 3);
  const thisWeek = filtered.slice(3, 6);
  const earlier = filtered.slice(6);

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-rule bg-surface-1">
        <div className="max-w-[760px] mx-auto px-10 flex items-end justify-between">
          {/* Lens tabs */}
          <div className="flex items-end">
            <LensBtn label="Following" active={streamLens === 'following'} onClick={() => { setStreamLens('following'); setLensOpen(false); }} />
            <LensBtn label="For You" active={streamLens === 'foryou'} onClick={() => { setStreamLens('foryou'); setLensOpen(false); }} />
            <div className="relative">
              <button
                onClick={() => setLensOpen(!lensOpen)}
                className={`flex items-center gap-1.5 text-[13px] px-4 pb-3 pt-4 transition-colors ${
                  streamLens !== 'following' && streamLens !== 'foryou'
                    ? 'text-ink-1 font-medium' : 'text-ink-4 hover:text-ink-2'
                }`}
              >
                {streamLens !== 'following' && streamLens !== 'foryou' ? streamLens : 'Interests'}
                <ChevronDown size={13} />
              </button>
              {lensOpen && <>
                <div className="fixed inset-0 z-20" onClick={() => setLensOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-52 bg-surface-1 rounded-lg shadow-lg border border-rule z-30 py-1 anim-fade-up">
                  <div className="px-3 py-2 text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em]">Interests</div>
                  {allInterests.map(i => (
                    <button key={i} onClick={() => { setStreamLens(i); setLensOpen(false); }}
                      className={`w-full text-left px-3 py-[6px] text-[13px] hover:bg-surface-0 transition-colors ${streamLens === i ? 'text-warm font-medium' : 'text-ink-2'}`}
                    >{i}</button>
                  ))}
                  <div className="border-t border-rule-faint my-1" />
                  <div className="px-3 py-2 text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em]">Communities</div>
                  {communities.map(c => (
                    <button key={c.id} onClick={() => { setStreamLens(c.interest); setLensOpen(false); }}
                      className="w-full text-left px-3 py-[6px] text-[13px] text-ink-2 hover:bg-surface-0 transition-colors flex items-center gap-2"
                    >
                      <span className="w-[5px] h-[5px] rounded-full bg-warm/40" />
                      {c.name}
                    </button>
                  ))}
                </div>
              </>}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-end gap-1 pb-3">
            <ModeBtn label="Scroll" active={viewMode === 'scroll'} onClick={() => setViewMode('scroll')} />
            <span className="text-ink-4 text-[10px] pb-[2px]">/</span>
            <ModeBtn label="Scan" active={viewMode === 'scan'} onClick={() => setViewMode('scan')} />
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-10">
          {viewMode === 'scroll' ? (
            <div className="py-6 space-y-6">
              {filtered.map(item => (
                <ContentCard key={item.id} item={item} size="large" onClick={() => setSelectedItem(item)} />
              ))}
              {filtered.length === 0 && <Empty />}
            </div>
          ) : (
            <div className="pt-8 pb-6">
              {today.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Today" />
                  <div className="grid grid-cols-2 gap-4">
                    {today.map(item => (
                      <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
                    ))}
                  </div>
                </div>
              )}
              {thisWeek.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="This Week" />
                  <div className="grid grid-cols-2 gap-4">
                    {thisWeek.map(item => (
                      <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
                    ))}
                  </div>
                </div>
              )}
              {earlier.length > 0 && (
                <div className="mb-8">
                  <SectionHeader title="Earlier" />
                  <div className="grid grid-cols-2 gap-4">
                    {earlier.map(item => (
                      <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
                    ))}
                  </div>
                </div>
              )}
              {filtered.length === 0 && <Empty />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tiny helpers ─── */
function LensBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-[13px] px-4 pb-3 pt-4 transition-colors relative ${
      active ? 'text-ink-1 font-medium' : 'text-ink-4 hover:text-ink-2'
    }`}>
      {label}
      {active && <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-ink-1 rounded-full" />}
    </button>
  );
}

function ModeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-[12px] transition-colors ${
      active ? 'text-ink-1 font-medium' : 'text-ink-4 hover:text-ink-3'
    }`}>
      {label}
    </button>
  );
}

function Empty() {
  return <div className="py-24 text-center text-[13px] text-ink-4">Nothing here yet.</div>;
}
