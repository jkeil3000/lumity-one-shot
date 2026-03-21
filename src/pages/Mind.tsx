import { useState } from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { collections, getTypeLabel } from '../data/mock';
import ContentCard from '../components/cards/ContentCard';

type MindView = 'grid' | 'list';

export default function Mind() {
  const { library, libraryFilter, setLibraryFilter, libraryCollection, setLibraryCollection, setSelectedItem } = useApp();
  const [search, setSearch] = useState('');
  const [mindView, setMindView] = useState<MindView>('grid');

  let items = library;
  if (libraryFilter !== 'all') items = items.filter(i => i.state === libraryFilter);
  if (libraryCollection) items = items.filter(i => i.collections.includes(libraryCollection));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.caption.toLowerCase().includes(q));
  }

  const stateCount = (s: string) => library.filter(i => i.state === s).length;

  return (
    <div className="h-full flex">
      {/* Library sidebar */}
      <div className="w-[200px] h-full border-r border-rule-faint py-6 px-4 flex-shrink-0 overflow-y-auto">
        <div className="mb-5">
          <SideItem label="All Saves" count={library.length} active={libraryFilter === 'all' && !libraryCollection}
            onClick={() => { setLibraryFilter('all'); setLibraryCollection(null); }} />
        </div>

        <div className="mb-2 px-2 text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em]">States</div>
        <div className="space-y-[2px] mb-6">
          <SideItem label="Saved" count={stateCount('saved')} active={libraryFilter === 'saved'} dot="bg-surface-3"
            onClick={() => { setLibraryFilter('saved'); setLibraryCollection(null); }} />
          <SideItem label="In Progress" count={stateCount('in-progress')} active={libraryFilter === 'in-progress'} dot="bg-amber-400"
            onClick={() => { setLibraryFilter('in-progress'); setLibraryCollection(null); }} />
          <SideItem label="Completed" count={stateCount('completed')} active={libraryFilter === 'completed'} dot="bg-emerald-500"
            onClick={() => { setLibraryFilter('completed'); setLibraryCollection(null); }} />
          <SideItem label="Favorites" count={stateCount('favorites')} active={libraryFilter === 'favorites'} dot="bg-warm"
            onClick={() => { setLibraryFilter('favorites'); setLibraryCollection(null); }} />
        </div>

        <div className="mb-2 px-2 text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em]">Collections</div>
        <div className="space-y-[2px]">
          {collections.map(c => (
            <SideItem key={c.id} label={c.name} count={c.count} active={libraryCollection === c.name}
              onClick={() => { setLibraryCollection(c.name); setLibraryFilter('all'); }} />
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* Search + view toggle */}
        <div className="flex-shrink-0 px-8 pt-6 pb-5 border-b border-rule flex items-center justify-between">
          <div className="relative max-w-[360px] flex-1">
            <Search size={14} strokeWidth={1.8} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search saves..."
              className="w-full pl-6 pr-2 py-1 text-[13px] text-ink-1 placeholder:text-ink-4 bg-transparent border-b border-rule-faint focus:border-rule focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setMindView('grid')}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${mindView === 'grid' ? 'bg-surface-2 text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}
            >
              <Grid3X3 size={14} strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setMindView('list')}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${mindView === 'list' ? 'bg-surface-2 text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}
            >
              <List size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {mindView === 'grid' ? (
            <div className="p-6 grid grid-cols-3 gap-4">
              {items.map(item => (
                <ContentCard key={item.id} item={item} size="compact" onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          ) : (
            <div className="px-6 py-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full flex items-center gap-4 py-3 border-b border-rule-faint hover:bg-surface-0 transition-colors group rounded -mx-2 px-2 text-left"
                >
                  {/* Thumbnail */}
                  {item.thumbnail ? (
                    <div className="w-[56px] h-[40px] rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                      <img src={item.thumbnail} alt={item.title || 'Content'} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-[56px] h-[40px] rounded-lg bg-warm-surface flex items-center justify-center flex-shrink-0">
                      <span className="font-reading text-[10px] text-warm italic">"</span>
                    </div>
                  )}

                  {/* State dot */}
                  <span className={`inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                    item.state === 'favorites' ? 'bg-warm' :
                    item.state === 'completed' ? 'bg-emerald-500' :
                    item.state === 'in-progress' ? 'bg-amber-400' :
                    'bg-surface-3'
                  }`} />

                  {/* Title */}
                  <span className="flex-1 text-[13px] text-ink-1 truncate group-hover:text-warm transition-colors">
                    {item.title || item.caption.slice(0, 72)}
                  </span>

                  {/* Meta */}
                  <span className="text-[11px] text-ink-4 w-[52px] text-right flex-shrink-0">{getTypeLabel(item.type)}</span>
                  <span className="text-[11px] text-ink-4 w-[100px] text-right truncate flex-shrink-0">{item.interests[0] || ''}</span>
                  <span className="text-[11px] text-ink-4 w-[50px] text-right flex-shrink-0">{item.createdAt}</span>
                </button>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <div className="py-20 text-center text-[13px] text-ink-4">Nothing here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SideItem({ label, count, active, onClick, dot }: { label: string; count: number; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-[5px] rounded-md text-[13px] transition-colors ${
        active ? 'bg-surface-2 text-ink-1 font-medium' : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
      }`}
    >
      <span className="flex items-center gap-2">
        {dot && <span className={`w-[6px] h-[6px] rounded-full ${dot}`} />}
        {label}
      </span>
      <span className="text-[11px] text-ink-4 tabular-nums">{count}</span>
    </button>
  );
}
