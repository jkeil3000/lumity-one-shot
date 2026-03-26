import { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Library, Bookmark, Clock, CheckCircle2, Heart, LayoutGrid, ChevronLeft, Globe, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { collections, getTypeLabel, getCollectionMosaicThumbnails } from '../data/mock';
import type { Collection } from '../data/mock';
import ContentCard from '../components/cards/ContentCard';

type MindView = 'grid' | 'list';

const emptyStates: Record<string, { headline: string; body: string }> = {
  saved: {
    headline: 'Nothing saved yet.',
    body: 'When something catches your attention, save it here. This is your holding space \u2014 no one sees it but you.',
  },
  'in-progress': {
    headline: 'Nothing in progress.',
    body: 'The things you\u2019re actively reading, watching, or listening to will live here. Your current intellectual diet.',
  },
  completed: {
    headline: 'Nothing completed yet.',
    body: 'Finished a book? Wrapped up a podcast series? Mark it complete. Over time, this becomes a record of everything that shaped your thinking.',
  },
  favorites: {
    headline: 'No favorites yet.',
    body: 'Some things stay with you. The pieces that changed how you think deserve a place here.',
  },
  collection: {
    headline: 'This collection is empty.',
    body: 'Add your first piece. A good collection, like a good playlist, tells a story about what you care about.',
  },
};

const stateIcons: Record<string, typeof Bookmark> = {
  saved: Bookmark,
  'in-progress': Clock,
  completed: CheckCircle2,
  favorites: Heart,
};

/* ─── Collection mosaic cover ─────────────────────────────────────────────────
   Always fills its parent container (use a sized wrapper div around it).
   Smart layout based on how many thumbnails are available.
────────────────────────────────────────────────────────────────────────────── */
function CollectionMosaic({ name, rounded = 'rounded-xl' }: { name: string; rounded?: string }) {
  const thumbs = getCollectionMosaicThumbnails(name, 4);

  if (thumbs.length === 0) {
    return (
      <div className={`w-full h-full ${rounded} bg-warm-surface flex items-center justify-center`}>
        <Library size={28} strokeWidth={1.1} className="text-warm/35" />
      </div>
    );
  }
  if (thumbs.length === 1) {
    return (
      <div className={`w-full h-full ${rounded} overflow-hidden`}>
        <img src={thumbs[0]} alt={name} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  // 2 items — side by side (1 row × 2 cols)
  if (thumbs.length === 2) {
    return (
      <div className={`w-full h-full ${rounded} overflow-hidden grid grid-cols-2 gap-[2px] bg-surface-2`}>
        {thumbs.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
        ))}
      </div>
    );
  }
  // 3 or 4 — 2×2 grid (grid-rows-2 ensures equal row heights in fixed container)
  const cells = [...thumbs];
  while (cells.length < 4) cells.push('');
  return (
    <div className={`w-full h-full ${rounded} overflow-hidden grid grid-cols-2 grid-rows-2 gap-[2px] bg-surface-2`}>
      {cells.map((src, i) =>
        src
          ? <img key={i} src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          : <div key={i} className="w-full h-full bg-surface-2" />
      )}
    </div>
  );
}

export default function Mind() {
  const { library, libraryFilter, setLibraryFilter, libraryCollection, setLibraryCollection, setSelectedItem } = useApp();
  const [search, setSearch] = useState('');
  const [mindView, setMindView] = useState<MindView>('grid');

  // Session-local visibility toggles for collections
  const [visibilityMap, setVisibilityMap] = useState<Record<string, 'private' | 'public'>>(() =>
    Object.fromEntries(collections.map(c => [c.id, c.visibility]))
  );
  const toggleVisibility = (id: string) =>
    setVisibilityMap(prev => ({ ...prev, [id]: prev[id] === 'public' ? 'private' : 'public' }));

  // Default to 'saved' on first load
  useEffect(() => {
    if (libraryFilter === 'all' && !libraryCollection) setLibraryFilter('saved');
  }, []);

  const showCollectionsGrid = libraryFilter === 'all' && !libraryCollection;

  let items = library;
  if (!showCollectionsGrid) {
    if (libraryFilter !== 'all') items = items.filter(i => i.state === libraryFilter);
    if (libraryCollection) items = items.filter(i => i.collections.includes(libraryCollection));
  }
  if (search && !showCollectionsGrid) {
    const q = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.caption.toLowerCase().includes(q));
  }

  const stateCount = (s: string) => library.filter(i => i.state === s).length;
  const emptyKey = libraryCollection ? 'collection' : libraryFilter;
  const empty = emptyStates[emptyKey] || emptyStates.saved;
  const viewTitle = libraryFilter === 'in-progress' ? 'In Progress'
    : libraryFilter.charAt(0).toUpperCase() + libraryFilter.slice(1);

  const collectionItemCount = libraryCollection
    ? library.filter(i => i.collections.includes(libraryCollection)).length : null;
  const collectionData = libraryCollection ? collections.find(c => c.name === libraryCollection) : undefined;
  const activeVisibility = collectionData ? visibilityMap[collectionData.id] : 'private';

  return (
    <div className="h-full flex bg-surface-0">

      {/* ═══ Sidebar ═══ */}
      <div className="w-[220px] h-full border-r border-rule py-6 px-4 flex-shrink-0 overflow-y-auto bg-surface-1">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <Library size={16} strokeWidth={1.6} className="text-warm" />
          <span className="font-reading text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">Your Library</span>
        </div>

        {/* Reading states */}
        <div className="mb-2 px-2 text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em]">Reading States</div>
        <div className="space-y-[2px] mb-6">
          {(['saved', 'in-progress', 'completed', 'favorites'] as const).map(state => {
            const Icon = stateIcons[state];
            const dotColor = state === 'favorites' ? 'bg-warm' :
              state === 'completed' ? 'bg-emerald-500' :
              state === 'in-progress' ? 'bg-amber-400' : 'bg-surface-3';
            const label = state === 'in-progress' ? 'In Progress'
              : state.charAt(0).toUpperCase() + state.slice(1);
            const isFavorites = state === 'favorites';
            return (
              <SideItem
                key={state}
                label={label}
                count={stateCount(state)}
                active={libraryFilter === state && !libraryCollection}
                dot={dotColor}
                onClick={() => { setLibraryFilter(state); setLibraryCollection(null); }}
                icon={<Icon size={13} strokeWidth={1.6} />}
                privacy={isFavorites ? 'public' : 'private'}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="flex-1 border-t border-rule-faint" />
          <span className="text-[8px] text-ink-4">&loz;</span>
          <div className="flex-1 border-t border-rule-faint" />
        </div>

        {/* Collections header — clickable to show grid */}
        <button
          onClick={() => { setLibraryFilter('all'); setLibraryCollection(null); }}
          className={`w-full flex items-center justify-between px-2 py-[6px] rounded-lg text-[10px] font-medium uppercase tracking-[0.08em] mb-2 transition-colors ${
            showCollectionsGrid ? 'text-warm' : 'text-ink-4 hover:text-ink-3'
          }`}
        >
          <span className="flex items-center gap-2"><LayoutGrid size={11} strokeWidth={1.8} />Collections</span>
          <span className="text-[11px] normal-case tracking-normal tabular-nums">{collections.length}</span>
        </button>

        <div className="space-y-[2px]">
          {collections.map(c => (
            <CollectionSideItem
              key={c.id}
              collection={c}
              visibility={visibilityMap[c.id]}
              active={libraryCollection === c.name}
              onClick={() => { setLibraryCollection(c.name); setLibraryFilter('all'); }}
            />
          ))}
        </div>
      </div>

      {/* ═══ Main area ═══ */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">

        {/* Search + view toggle — hidden on collections overview */}
        {!showCollectionsGrid && (
          <div className="flex-shrink-0 px-8 pt-6 pb-5 border-b border-rule flex items-center justify-between">
            <div className="relative max-w-[360px] flex-1">
              <Search size={14} strokeWidth={1.8} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-4" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-6 pr-2 py-1 text-[13px] text-ink-1 placeholder:text-ink-4 bg-transparent border-b border-rule-faint focus:border-warm/40 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={() => setMindView('grid')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${mindView === 'grid' ? 'bg-surface-2 text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}>
                <Grid3X3 size={14} strokeWidth={1.8} />
              </button>
              <button onClick={() => setMindView('list')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${mindView === 'list' ? 'bg-surface-2 text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}>
                <List size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {/* ═══ Collections overview grid ═══ */}
          {showCollectionsGrid && (
            <div className="px-8 pt-8 pb-6 anim-fade-up">
              <h2 className="font-reading text-[22px] font-semibold text-ink-1 tracking-[-0.02em] mb-1.5">Collections</h2>
              <p className="text-[13px] text-ink-3 mb-8">Your curated playlists. Each one tells a story about what you care about.</p>
              <div className="grid grid-cols-2 gap-5">
                {collections.map(c => {
                  const itemCount = library.filter(i => i.collections.includes(c.name)).length;
                  const vis = visibilityMap[c.id];
                  return (
                    <button key={c.id}
                      onClick={() => { setLibraryCollection(c.name); setLibraryFilter('all'); }}
                      className="group text-left rounded-xl overflow-hidden border border-rule-faint bg-surface-1 hover:shadow-md transition-all duration-200"
                    >
                      {/* Mosaic cover — sized wrapper controls dimensions */}
                      <div className="h-[150px]">
                        <CollectionMosaic name={c.name} rounded="rounded-none" />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-reading text-[15px] font-semibold text-ink-1 group-hover:text-warm transition-colors leading-snug">
                            {c.name}
                          </h3>
                          {/* Visibility badge — in info area, not overlaid on image */}
                          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                            vis === 'public'
                              ? 'bg-warm/10 text-warm'
                              : 'bg-surface-2 text-ink-4'
                          }`}>
                            {vis === 'public' ? <Globe size={9} strokeWidth={2} /> : <Lock size={9} strokeWidth={2} />}
                            {vis === 'public' ? 'Public' : 'Private'}
                          </span>
                        </div>
                        {c.description && (
                          <p className="font-reading text-[12px] text-ink-3 leading-[1.55] line-clamp-2 mb-2">
                            {c.description}
                          </p>
                        )}
                        <p className="text-[11px] text-ink-4">{itemCount} {itemCount === 1 ? 'piece' : 'pieces'} saved</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ Collection room header ═══ */}
          {libraryCollection && collectionData && (
            <div className="px-8 pt-6 pb-5 border-b border-rule anim-fade-up">

              {/* Back + visibility toggle on same row */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { setLibraryFilter('all'); setLibraryCollection(null); }}
                  className="flex items-center gap-1 text-[12px] text-ink-4 hover:text-warm transition-colors"
                >
                  <ChevronLeft size={14} strokeWidth={1.6} />
                  All Collections
                </button>
                <button
                  onClick={() => toggleVisibility(collectionData.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                    activeVisibility === 'public'
                      ? 'bg-warm text-white border-warm hover:bg-warm-hover'
                      : 'bg-surface-0 text-ink-3 border-rule hover:border-ink-3 hover:text-ink-2'
                  }`}
                >
                  {activeVisibility === 'public'
                    ? <><Globe size={12} strokeWidth={2} />Public</>
                    : <><Lock size={12} strokeWidth={2} />Private</>
                  }
                </button>
              </div>

              {/* Mosaic + title + description all in one row */}
              <div className="flex items-start gap-4">
                <div className="w-[80px] h-[80px] flex-shrink-0">
                  <CollectionMosaic name={libraryCollection} rounded="rounded-xl" />
                </div>
                <div className="pt-0.5 flex-1">
                  <div className="text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em] mb-1">Collection</div>
                  <h2 className="font-reading text-[22px] font-semibold text-ink-1 tracking-[-0.02em] leading-[1.2] mb-2">
                    {libraryCollection}
                  </h2>
                  {collectionData.description && (
                    <p className="font-reading text-[13px] text-ink-3 leading-[1.65] mb-1.5">
                      {collectionData.description}
                    </p>
                  )}
                  <p className="text-[12px] text-ink-4">
                    {collectionItemCount} {collectionItemCount === 1 ? 'piece' : 'pieces'} curated
                    {activeVisibility === 'public' && (
                      <span className="ml-2 text-warm">· Visible on your profile</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* State filter title */}
          {!libraryCollection && !showCollectionsGrid && (
            <div className="px-8 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <h2 className="font-reading text-[18px] font-semibold text-ink-1 tracking-[-0.01em]">{viewTitle}</h2>
                {libraryFilter === 'favorites' ? (
                  <span className="flex items-center gap-1 text-[10px] text-warm bg-warm/10 px-2 py-0.5 rounded-full">
                    <Globe size={9} strokeWidth={2} />Pinned on profile
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-ink-4 bg-surface-2 px-2 py-0.5 rounded-full">
                    <Lock size={9} strokeWidth={2} />Private
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Items grid */}
          {!showCollectionsGrid && items.length > 0 && mindView === 'grid' && (
            <div className="px-8 py-4 grid grid-cols-3 gap-5 anim-fade-up">
              {items.map(item => (
                <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          )}

          {/* Items list */}
          {!showCollectionsGrid && items.length > 0 && mindView === 'list' && (
            <div className="px-8 py-2 anim-fade-up">
              {items.map(item => (
                <button key={item.id} onClick={() => setSelectedItem(item)}
                  className="w-full flex items-center gap-4 py-3.5 border-b border-rule-faint hover:bg-warm-surface/50 transition-colors group rounded-lg -mx-2 px-3 text-left"
                >
                  {item.thumbnail ? (
                    <div className="w-[60px] h-[44px] rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                      <img src={item.thumbnail} alt={item.title || 'Content'} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-[60px] h-[44px] rounded-lg bg-warm-surface flex items-center justify-center flex-shrink-0">
                      <span className="font-reading text-[14px] text-warm/70 italic">&ldquo;</span>
                    </div>
                  )}
                  <span className={`inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                    item.state === 'favorites' ? 'bg-warm' :
                    item.state === 'completed' ? 'bg-emerald-500' :
                    item.state === 'in-progress' ? 'bg-amber-400' : 'bg-surface-3'
                  }`} />
                  <span className="flex-1 font-reading text-[13px] text-ink-1 truncate group-hover:text-warm transition-colors">
                    {item.title || item.caption.slice(0, 72)}
                  </span>
                  <span className="text-[11px] text-ink-4 w-[52px] text-right flex-shrink-0">{getTypeLabel(item.type)}</span>
                  <span className="text-[11px] text-ink-4 w-[100px] text-right truncate flex-shrink-0">{item.interests[0] || ''}</span>
                  <span className="text-[11px] text-ink-4 w-[50px] text-right flex-shrink-0">{item.createdAt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty states */}
          {!showCollectionsGrid && items.length === 0 && (
            <div className="flex items-center justify-center py-20 px-8 anim-fade-up">
              <div className="max-w-[380px] text-center">
                <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-warm-surface flex items-center justify-center mb-6">
                  {libraryCollection ? <Library size={28} strokeWidth={1.2} className="text-warm/60" />
                    : libraryFilter === 'favorites' ? <Heart size={28} strokeWidth={1.2} className="text-warm/60" />
                    : libraryFilter === 'completed' ? <CheckCircle2 size={28} strokeWidth={1.2} className="text-warm/60" />
                    : libraryFilter === 'in-progress' ? <Clock size={28} strokeWidth={1.2} className="text-warm/60" />
                    : <Bookmark size={28} strokeWidth={1.2} className="text-warm/60" />
                  }
                </div>
                <h3 className="font-reading text-[17px] font-semibold text-ink-1 mb-2.5 tracking-[-0.01em]">{empty.headline}</h3>
                <p className="font-reading text-[13px] text-ink-3 leading-[1.7]">{empty.body}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar nav item ─── */
function SideItem({ label, count, active, onClick, dot, icon, privacy }: {
  label: string; count: number; active: boolean; onClick: () => void;
  dot?: string; icon?: React.ReactNode; privacy?: 'private' | 'public';
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-[6px] rounded-lg text-[13px] transition-colors ${
        active ? 'bg-warm-surface text-ink-1 font-medium' : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
      }`}
    >
      <span className="flex items-center gap-2.5">
        {icon && <span className={`${active ? 'text-warm' : 'text-ink-4'} transition-colors`}>{icon}</span>}
        {dot && <span className={`w-[6px] h-[6px] rounded-full ${dot}`} />}
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        {privacy === 'public' && (
          <Globe size={10} strokeWidth={1.8} className={active ? 'text-warm' : 'text-ink-4'} />
        )}
        {privacy === 'private' && (
          <Lock size={9} strokeWidth={1.8} className="text-ink-4 opacity-50" />
        )}
        <span className="text-[11px] text-ink-4 tabular-nums">{count}</span>
      </span>
    </button>
  );
}

/* ─── Collection sidebar item ─── */
function CollectionSideItem({ collection, visibility, active, onClick }: {
  collection: Collection; visibility: 'private' | 'public'; active: boolean; onClick: () => void;
}) {
  const thumbs = getCollectionMosaicThumbnails(collection.name, 1);
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-[6px] rounded-lg text-[13px] transition-colors ${
        active ? 'bg-warm-surface text-ink-1 font-medium' : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
      }`}
    >
      {thumbs[0] ? (
        <div className="w-[22px] h-[22px] rounded-md overflow-hidden flex-shrink-0">
          <img src={thumbs[0]} alt={collection.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="w-[22px] h-[22px] rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
          <Library size={10} strokeWidth={1.4} className="text-ink-4" />
        </div>
      )}
      <span className="font-reading flex-1 truncate text-left">{collection.name}</span>
      {visibility === 'public' && (
        <Globe size={10} strokeWidth={1.8} className="text-warm flex-shrink-0" />
      )}
      <span className="text-[11px] text-ink-4 tabular-nums flex-shrink-0">{collection.count}</span>
    </button>
  );
}
