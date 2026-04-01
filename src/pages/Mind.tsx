import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Grid3X3, List, Library, Bookmark, Clock, CheckCircle2, Heart, LayoutGrid, ChevronLeft, Globe, Lock, Plus, GripVertical, FolderPlus, X, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTypeLabel, getCollectionMosaicThumbnails } from '../data/mock';
import type { Collection, ContentItem } from '../data/mock';
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

/* ─── Collection mosaic cover ──────────────────────────────────────────── */
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
  if (thumbs.length === 2) {
    return (
      <div className={`w-full h-full ${rounded} overflow-hidden grid grid-cols-2 gap-[2px] bg-surface-2`}>
        {thumbs.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
        ))}
      </div>
    );
  }
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
  const {
    library, libraryFilter, setLibraryFilter, libraryCollection, setLibraryCollection,
    setSelectedItem, updateItemState, toggleFavorite,
    collections, addCollection, updateCollection, deleteCollection, removeItem, addToCollection, removeFromCollection,
  } = useApp();
  const [search, setSearch] = useState('');
  const [mindView, setMindView] = useState<MindView>('grid');

  // Drag-and-drop state
  const [dragOverState, setDragOverState] = useState<string | null>(null);
  const dragItemRef = useRef<ContentItem | null>(null);
  const dragGhostRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: ContentItem) => {
    dragItemRef.current = item;
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;padding:6px 12px;background:rgba(67,58,120,0.9);color:white;border-radius:8px;font-size:12px;font-family:Inter,sans-serif;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;z-index:9999;';
    ghost.textContent = item.title || item.caption.slice(0, 40);
    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, 90, 16);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragGhostRef.current) {
      document.body.removeChild(dragGhostRef.current);
      dragGhostRef.current = null;
    }
    dragItemRef.current = null;
    setDragOverState(null);
  }, []);

  const handleDrop = useCallback((targetState: string) => {
    const item = dragItemRef.current;
    if (item && item.state !== targetState) {
      updateItemState(item.id, targetState as ContentItem['state']);
    }
    dragItemRef.current = null;
    setDragOverState(null);
  }, [updateItemState]);

  // Session-local visibility toggles for collections
  const [visibilityMap, setVisibilityMap] = useState<Record<string, 'private' | 'public'>>(() =>
    Object.fromEntries(collections.map(c => [c.id, c.visibility]))
  );
  const toggleVisibility = (id: string) =>
    setVisibilityMap(prev => ({ ...prev, [id]: prev[id] === 'public' ? 'private' : 'public' }));

  // Collection editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addContentOpen, setAddContentOpen] = useState(false);
  const [addContentSearch, setAddContentSearch] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  // Item action popover — stores { itemId, anchorRect } for positioning
  const [actionPopover, setActionPopover] = useState<{ itemId: string; rect: DOMRect } | null>(null);

  // Item remove confirmation
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // List view 3-dot menu
  const [listMenuId, setListMenuId] = useState<string | null>(null);

  // Default to 'saved' on first load
  useEffect(() => {
    if (libraryFilter === 'all' && !libraryCollection) setLibraryFilter('saved');
  }, []);

  // Focus editing inputs
  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (editingDesc) descInputRef.current?.focus(); }, [editingDesc]);

  const showCollectionsGrid = libraryFilter === 'all' && !libraryCollection;

  let items = library;
  if (!showCollectionsGrid) {
    if (libraryFilter === 'favorites') {
      items = items.filter(i => i.isFavorite);
    } else if (libraryFilter !== 'all') {
      items = items.filter(i => i.state === libraryFilter);
    }
    if (libraryCollection) items = items.filter(i => i.collections.includes(libraryCollection));
  }
  if (search && !showCollectionsGrid) {
    const q = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.caption.toLowerCase().includes(q));
  }

  const stateCount = (s: string) => s === 'favorites' ? library.filter(i => i.isFavorite).length : library.filter(i => i.state === s).length;
  const collectionCount = (name: string) => library.filter(i => i.collections.includes(name)).length;
  const emptyKey = libraryCollection ? 'collection' : libraryFilter;
  const empty = emptyStates[emptyKey] || emptyStates.saved;
  const viewTitle = libraryFilter === 'favorites' ? 'Favorites'
    : libraryFilter === 'in-progress' ? 'In Progress'
    : libraryFilter.charAt(0).toUpperCase() + libraryFilter.slice(1);

  const collectionItemCount = libraryCollection
    ? library.filter(i => i.collections.includes(libraryCollection)).length : null;
  const collectionData = libraryCollection ? collections.find(c => c.name === libraryCollection) : undefined;
  const activeVisibility = collectionData ? (visibilityMap[collectionData.id] || collectionData.visibility) : 'private';

  // New Collection: create and immediately open
  const handleNewCollection = () => {
    const col = addCollection('Untitled Collection');
    setLibraryCollection(col.name);
    setLibraryFilter('all');
    setEditTitle(col.name);
    setEditingTitle(true);
  };

  // Save title edit
  const saveTitle = () => {
    if (collectionData && editTitle.trim()) {
      const oldName = collectionData.name;
      updateCollection(collectionData.id, { name: editTitle.trim() });
      setLibraryCollection(editTitle.trim());
    }
    setEditingTitle(false);
  };

  // Save description edit
  const saveDesc = () => {
    if (collectionData) {
      updateCollection(collectionData.id, { description: editDesc.trim() || undefined });
    }
    setEditingDesc(false);
  };

  // Delete collection (requires confirmation)
  const handleDeleteCollection = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (collectionData) {
      deleteCollection(collectionData.id);
      setLibraryCollection(null);
      setLibraryFilter('all');
      setConfirmDelete(false);
    }
  };

  // Open collection picker anchored to a button
  const openCollectionPicker = (itemId: string, buttonEl: HTMLButtonElement) => {
    const rect = buttonEl.getBoundingClientRect();
    setActionPopover(prev => prev?.itemId === itemId ? null : { itemId, rect });
  };

  return (
    <div className="h-full flex bg-surface-0">

      {/* ═══ Sidebar ═══ */}
      <div className="w-[232px] h-full border-r border-rule/60 flex-shrink-0 overflow-y-auto bg-surface-0">
        <div className="py-5 px-3">

          {/* Header */}
          <div className="flex items-center gap-2.5 px-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-warm/10 flex items-center justify-center">
              <Library size={14} strokeWidth={1.8} className="text-warm" />
            </div>
            <span className="text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">Library</span>
          </div>

          {/* Reading states */}
          <div className="mb-1">
            <div className="px-3 mb-2 text-[10px] font-semibold text-ink-4/60 uppercase tracking-[0.1em]">Reading States</div>
            <div className="space-y-[1px]">
              {(['saved', 'in-progress', 'completed', 'favorites'] as const).map(state => {
                const Icon = stateIcons[state];
                const label = state === 'in-progress' ? 'In Progress' : state.charAt(0).toUpperCase() + state.slice(1);
                const isActive = libraryFilter === state && !libraryCollection;
                const isDragOver = dragOverState === state;
                const count = stateCount(state);
                const isFavorites = state === 'favorites';
                return (
                  <button key={state}
                    onClick={() => { setLibraryFilter(state); setLibraryCollection(null); }}
                    onDragOver={e => { e.preventDefault(); setDragOverState(state); }}
                    onDragLeave={() => setDragOverState(null)}
                    onDrop={e => { e.preventDefault(); if (state !== 'favorites') handleDrop(state); else { const item = dragItemRef.current; if (item) toggleFavorite(item.id); dragItemRef.current = null; setDragOverState(null); } }}
                    className={`group w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-[13.5px] transition-all duration-150 ${
                      isDragOver
                        ? 'bg-warm/8 shadow-sm scale-[1.01]'
                        : isActive
                          ? 'bg-surface-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                          : 'hover:bg-surface-1/50'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-warm' : 'text-ink-3 group-hover:text-ink-2'
                    }`} />
                    <span className={`flex-1 text-left transition-colors ${isActive ? 'text-ink-1 font-medium' : 'text-ink-2 group-hover:text-ink-1'}`}>{label}</span>
                    <span className="flex items-center gap-1.5">
                      {isFavorites ? (
                        <Globe size={10} strokeWidth={1.6} className={isActive ? 'text-warm/70' : 'text-ink-4/55'} />
                      ) : (
                        <Lock size={9} strokeWidth={1.6} className={isActive ? 'text-ink-3/50' : 'text-ink-4/45'} />
                      )}
                      <span className={`min-w-[18px] text-center text-[11px] tabular-nums rounded-full px-1.5 py-[1px] ${
                        isActive ? 'bg-warm/10 text-warm font-medium' : 'text-ink-4/50'
                      }`}>{count}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 border-t border-rule/40" />

          {/* Collections */}
          <div className="mb-1">
            <button
              onClick={() => { setLibraryFilter('all'); setLibraryCollection(null); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.1em] mb-1 transition-colors ${
                showCollectionsGrid ? 'text-warm' : 'text-ink-4/60 hover:text-ink-3'
              }`}
            >
              <span className="flex items-center gap-2"><LayoutGrid size={11} strokeWidth={1.8} />Collections</span>
              <span className="text-[11px] normal-case tracking-normal tabular-nums font-normal">{collections.length}</span>
            </button>

            <div className="space-y-[1px]">
              {collections.map(c => {
                const vis = visibilityMap[c.id] || c.visibility;
                return (
                  <CollectionSideItem
                    key={c.id}
                    collection={c}
                    itemCount={collectionCount(c.name)}
                    visibility={vis}
                    active={libraryCollection === c.name}
                    onClick={() => { setLibraryCollection(c.name); setLibraryFilter('all'); setEditingTitle(false); setEditingDesc(false); }}
                  />
                );
              })}
            </div>

            {/* New Collection button */}
            <button
              onClick={handleNewCollection}
              className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-[12.5px] text-ink-4/60 hover:text-ink-2 hover:bg-surface-1/60 transition-colors group"
            >
              <span className="w-[24px] h-[24px] rounded-md border border-dashed border-ink-4/25 flex items-center justify-center group-hover:border-ink-3/40 transition-colors">
                <Plus size={11} strokeWidth={1.8} className="text-ink-4/50 group-hover:text-ink-3" />
              </span>
              <span>New Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Main area ═══ */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">

        {/* Search + view toggle — hidden on collections overview */}
        {!showCollectionsGrid && (
          <div className="flex-shrink-0 px-8 pt-6 pb-5 border-b border-rule/50 flex items-center justify-between">
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
                  const itemCount = collectionCount(c.name);
                  const vis = visibilityMap[c.id] || c.visibility;
                  return (
                    <button key={c.id}
                      onClick={() => { setLibraryCollection(c.name); setLibraryFilter('all'); }}
                      className="group text-left rounded-xl overflow-hidden border border-rule-faint bg-surface-1 hover:shadow-md transition-all duration-200"
                    >
                      <div className="h-[150px]">
                        <CollectionMosaic name={c.name} rounded="rounded-none" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-reading text-[15px] font-semibold text-ink-1 group-hover:text-warm transition-colors leading-snug">
                            {c.name}
                          </h3>
                          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                            vis === 'public' ? 'bg-warm/10 text-warm' : 'bg-surface-2 text-ink-4'
                          }`}>
                            {vis === 'public' ? <Globe size={9} strokeWidth={2} /> : <Lock size={9} strokeWidth={2} />}
                            {vis === 'public' ? 'Public' : 'Private'}
                          </span>
                        </div>
                        {c.description && (
                          <p className="font-reading text-[12px] text-ink-3 leading-[1.55] line-clamp-2 mb-2">{c.description}</p>
                        )}
                        <p className="text-[11px] text-ink-4">{itemCount} {itemCount === 1 ? 'piece' : 'pieces'} saved</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ Collection room header (editable) ═══ */}
          {libraryCollection && collectionData && (
            <div className="px-8 pt-6 pb-5 border-b border-rule anim-fade-up">
              {/* Back + visibility toggle */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { setLibraryFilter('all'); setLibraryCollection(null); setEditingTitle(false); setEditingDesc(false); setConfirmDelete(false); setAddContentOpen(false); }}
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

              {/* Mosaic + editable title + description */}
              <div className="flex items-start gap-4">
                <div className="w-[80px] h-[80px] flex-shrink-0">
                  <CollectionMosaic name={libraryCollection} rounded="rounded-xl" />
                </div>
                <div className="pt-0.5 flex-1">
                  <div className="text-[10px] font-medium text-ink-4 uppercase tracking-[0.08em] mb-1">Collection</div>

                  {/* Editable title */}
                  {editingTitle ? (
                    <input
                      ref={titleInputRef}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                      className="font-reading text-[22px] font-semibold text-ink-1 tracking-[-0.02em] leading-[1.2] mb-2 bg-transparent border-b-2 border-warm/40 focus:border-warm focus:outline-none w-full"
                    />
                  ) : (
                    <h2
                      onClick={() => { setEditTitle(libraryCollection); setEditingTitle(true); }}
                      className="font-reading text-[22px] font-semibold text-ink-1 tracking-[-0.02em] leading-[1.2] mb-2 cursor-text hover:text-warm/80 transition-colors group inline-flex items-center gap-2"
                    >
                      {libraryCollection}
                      <Pencil size={14} strokeWidth={1.6} className="text-ink-4/0 group-hover:text-ink-4/50 transition-colors" />
                    </h2>
                  )}

                  {/* Editable description */}
                  {editingDesc ? (
                    <textarea
                      ref={descInputRef}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      onBlur={saveDesc}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveDesc(); } if (e.key === 'Escape') setEditingDesc(false); }}
                      placeholder="Add a description..."
                      rows={2}
                      className="font-reading text-[13px] text-ink-2 leading-[1.65] mb-1.5 bg-transparent border-b border-warm/30 focus:border-warm focus:outline-none w-full resize-none placeholder:text-ink-4/50"
                    />
                  ) : (
                    <p
                      onClick={() => { setEditDesc(collectionData.description || ''); setEditingDesc(true); }}
                      className="font-reading text-[13px] text-ink-3 leading-[1.65] mb-1.5 cursor-text hover:text-ink-2 transition-colors"
                    >
                      {collectionData.description || <span className="text-ink-4/50 italic">Click to add a description...</span>}
                    </p>
                  )}

                  <p className="text-[12px] text-ink-4">
                    {collectionItemCount} {collectionItemCount === 1 ? 'piece' : 'pieces'} curated
                    {activeVisibility === 'public' && (
                      <span className="ml-2 text-warm">&middot; Visible on your profile</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Bottom action row: Add Content + Delete */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-rule-faint/60">
                <button
                  onClick={() => { setAddContentOpen(true); setAddContentSearch(''); }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium text-ink-2 bg-surface-1 border border-rule-faint hover:border-warm/30 hover:text-warm transition-colors"
                >
                  <Plus size={14} strokeWidth={1.8} />
                  Add Content
                </button>

                {/* Delete with confirmation */}
                {confirmDelete ? (
                  <div className="flex items-center gap-2 anim-fade-up">
                    <span className="text-[12px] text-red-500 font-medium">Delete this collection?</span>
                    <button
                      onClick={handleDeleteCollection}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-[12px] text-ink-3 bg-surface-1 border border-rule hover:bg-surface-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleDeleteCollection}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-ink-4/60 hover:text-red-500 transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 size={13} strokeWidth={1.6} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ Add Content picker (overlay within collection room) ═══ */}
          {libraryCollection && addContentOpen && (
            <AddContentPicker
              collectionName={libraryCollection}
              library={library}
              onAdd={(itemId) => addToCollection(itemId, libraryCollection)}
              onRemove={(itemId) => removeFromCollection(itemId, libraryCollection)}
              search={addContentSearch}
              onSearchChange={setAddContentSearch}
              onClose={() => setAddContentOpen(false)}
            />
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
                <div key={item.id} className="relative group/card">
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <ContentCard item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
                  </div>
                  {/* Quick action bar — fav & collection prominent, trash tucked away */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorite(item.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                        item.isFavorite ? 'bg-warm text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'
                      }`}
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={13} strokeWidth={1.8} fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); openCollectionPicker(item.id, e.currentTarget); }}
                      className="w-7 h-7 rounded-full bg-black/40 text-white/80 hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-colors"
                      title="Add to collection"
                    >
                      <FolderPlus size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                  {/* Trash — bottom-right, smaller, only on hover */}
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmRemoveId(item.id); }}
                    className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/30 text-white/60 hover:bg-red-500/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover/card:opacity-100"
                    title={libraryCollection ? 'Remove from collection' : 'Remove from library'}
                  >
                    <Trash2 size={11} strokeWidth={1.8} />
                  </button>
                  {/* Confirm remove overlay */}
                  {confirmRemoveId === item.id && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 anim-fade-in" onClick={e => e.stopPropagation()}>
                      <p className="text-white text-[12px] font-medium text-center px-4">
                        {libraryCollection ? 'Remove from this collection?' : 'Remove from your library?'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); libraryCollection ? removeFromCollection(item.id, libraryCollection) : removeItem(item.id); setConfirmRemoveId(null); }}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmRemoveId(null); }}
                          className="px-3 py-1.5 rounded-lg text-[12px] text-white/80 bg-white/15 hover:bg-white/25 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Items list */}
          {!showCollectionsGrid && items.length > 0 && mindView === 'list' && (
            <div className="px-8 py-2 anim-fade-up">
              {items.map(item => (
                <div key={item.id} className="relative group/row">
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedItem(item)}
                    className="w-full flex items-center gap-3.5 py-3 border-b border-rule-faint hover:bg-surface-1/50 transition-colors rounded-lg -mx-2 px-3 text-left cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical size={14} strokeWidth={1.4} className="text-ink-4/20 group-hover/row:text-ink-4/50 flex-shrink-0 transition-colors" />
                    {item.thumbnail ? (
                      <div className="w-[48px] h-[36px] rounded-md overflow-hidden flex-shrink-0 bg-surface-2">
                        <img src={item.thumbnail} alt={item.title || 'Content'} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ) : (
                      <div className="w-[48px] h-[36px] rounded-md bg-warm-surface flex items-center justify-center flex-shrink-0">
                        <span className="font-reading text-[14px] text-warm/70 italic">&ldquo;</span>
                      </div>
                    )}
                    <span className={`inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                      item.state === 'completed' ? 'bg-emerald-500' :
                      item.state === 'in-progress' ? 'bg-amber-400' : 'bg-surface-3'
                    }`} />
                    <span className="flex-1 font-reading text-[13px] text-ink-1 truncate group-hover/row:text-warm transition-colors">
                      {item.title || item.caption.slice(0, 72)}
                    </span>
                    {item.isFavorite && <Heart size={11} strokeWidth={1.8} className="text-warm flex-shrink-0" fill="currentColor" />}
                    <span className="text-[11px] text-ink-4 w-[52px] text-right flex-shrink-0">{getTypeLabel(item.type)}</span>
                    <span className="text-[11px] text-ink-4 w-[80px] text-right truncate flex-shrink-0">{item.interests[0] || ''}</span>
                    <span className="text-[11px] text-ink-4 w-[46px] text-right flex-shrink-0">{item.createdAt}</span>
                    {/* 3-dot menu trigger */}
                    <button
                      onClick={e => { e.stopPropagation(); setListMenuId(listMenuId === item.id ? null : item.id); }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        listMenuId === item.id ? 'bg-surface-2 text-ink-2' : 'text-ink-4/40 hover:text-ink-3 hover:bg-surface-1'
                      }`}
                    >
                      <MoreHorizontal size={15} strokeWidth={1.6} />
                    </button>
                  </div>

                  {/* 3-dot dropdown menu */}
                  {listMenuId === item.id && (
                    <ListItemMenu
                      item={item}
                      libraryCollection={libraryCollection}
                      onFavorite={() => { toggleFavorite(item.id); setListMenuId(null); }}
                      onCollection={(btn) => { openCollectionPicker(item.id, btn); setListMenuId(null); }}
                      onRemove={() => { setConfirmRemoveId(item.id); setListMenuId(null); }}
                      onClose={() => setListMenuId(null)}
                    />
                  )}

                  {/* Confirm remove bar */}
                  {confirmRemoveId === item.id && (
                    <div className="absolute inset-0 z-10 bg-surface-0/95 backdrop-blur-sm rounded-lg flex items-center justify-center gap-3 anim-fade-in" onClick={e => e.stopPropagation()}>
                      <p className="text-[12px] text-ink-2 font-medium">
                        {libraryCollection ? 'Remove from this collection?' : 'Remove from your library?'}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); libraryCollection ? removeFromCollection(item.id, libraryCollection) : removeItem(item.id); setConfirmRemoveId(null); }}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmRemoveId(null); }}
                        className="px-3 py-1.5 rounded-lg text-[12px] text-ink-3 bg-surface-2 hover:bg-surface-3 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
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

      {/* ═══ Collection picker popover (portal-style, fixed position) ═══ */}
      {actionPopover && (
        <CollectionPicker
          item={library.find(i => i.id === actionPopover.itemId)!}
          collections={collections}
          anchorRect={actionPopover.rect}
          onToggle={(colName) => {
            const item = library.find(i => i.id === actionPopover.itemId);
            if (!item) return;
            if (item.collections.includes(colName)) {
              removeFromCollection(item.id, colName);
            } else {
              addToCollection(item.id, colName);
            }
          }}
          onClose={() => setActionPopover(null)}
        />
      )}
    </div>
  );
}

/* ─── List item 3-dot dropdown menu ─── */
function ListItemMenu({ item, libraryCollection, onFavorite, onCollection, onRemove, onClose }: {
  item: ContentItem; libraryCollection: string | null;
  onFavorite: () => void;
  onCollection: (btn: HTMLButtonElement) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-1 top-full -mt-1 z-20 w-[190px] bg-surface-0 rounded-xl border border-rule shadow-xl py-1.5 anim-fade-up">
      <button
        onClick={onFavorite}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left hover:bg-surface-1 transition-colors"
      >
        <Heart size={14} strokeWidth={1.6} className={item.isFavorite ? 'text-warm' : 'text-ink-3'} fill={item.isFavorite ? 'currentColor' : 'none'} />
        <span className="text-ink-2">{item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
      </button>
      <button
        onClick={e => onCollection(e.currentTarget)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left hover:bg-surface-1 transition-colors"
      >
        <FolderPlus size={14} strokeWidth={1.6} className="text-ink-3" />
        <span className="text-ink-2">Add to Collection</span>
      </button>
      <div className="my-1 mx-3 border-t border-rule-faint/60" />
      <button
        onClick={onRemove}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left hover:bg-red-50 transition-colors group"
      >
        <Trash2 size={14} strokeWidth={1.6} className="text-ink-4/50 group-hover:text-red-500 transition-colors" />
        <span className="text-ink-3 group-hover:text-red-600 transition-colors">
          {libraryCollection ? 'Remove from Collection' : 'Remove from Library'}
        </span>
      </button>
    </div>
  );
}

/* ─── Add Content picker (full-width panel within collection room) ─── */
function AddContentPicker({ collectionName, library, onAdd, onRemove, search, onSearchChange, onClose }: {
  collectionName: string; library: ContentItem[];
  onAdd: (itemId: string) => void; onRemove: (itemId: string) => void;
  search: string; onSearchChange: (s: string) => void; onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    // Delay to avoid the opening click triggering close
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const q = search.toLowerCase();
  const available = library.filter(i => {
    if (q && !i.title.toLowerCase().includes(q) && !i.caption.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div ref={panelRef} className="px-8 py-5 border-b border-rule bg-surface-1/50 anim-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-ink-1">Add content to this collection</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-ink-4 hover:text-ink-2 transition-colors">
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
        <input
          ref={inputRef}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search your library..."
          className="w-full pl-9 pr-3 py-2 text-[13px] text-ink-1 placeholder:text-ink-4/50 bg-surface-0 border border-rule-faint rounded-lg focus:border-warm/40 focus:outline-none transition-colors"
        />
      </div>
      <div className="max-h-[280px] overflow-y-auto space-y-[2px] rounded-lg">
        {available.length === 0 && (
          <p className="text-[13px] text-ink-4 text-center py-6">No items found.</p>
        )}
        {available.map(item => {
          const isIn = item.collections.includes(collectionName);
          return (
            <button
              key={item.id}
              onClick={() => isIn ? onRemove(item.id) : onAdd(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isIn ? 'bg-warm/8 hover:bg-warm/12' : 'hover:bg-surface-1'
              }`}
            >
              <span className={`w-5 h-5 rounded border flex items-center justify-center text-[11px] flex-shrink-0 transition-colors ${
                isIn ? 'bg-warm border-warm text-white' : 'border-rule bg-surface-0'
              }`}>
                {isIn && '\u2713'}
              </span>
              {item.thumbnail ? (
                <div className="w-[40px] h-[30px] rounded overflow-hidden flex-shrink-0 bg-surface-2">
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="w-[40px] h-[30px] rounded bg-warm-surface flex items-center justify-center flex-shrink-0">
                  <span className="font-reading text-[12px] text-warm/60 italic">&ldquo;</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-reading text-[13px] text-ink-1 truncate block">{item.title || item.caption.slice(0, 60)}</span>
                <span className="text-[11px] text-ink-4">{getTypeLabel(item.type)}{item.source ? ` · ${item.source}` : ''}</span>
              </div>
              <span className={`text-[11px] flex-shrink-0 ${isIn ? 'text-warm font-medium' : 'text-ink-4'}`}>
                {isIn ? 'Added' : 'Add'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Collection picker popover (positioned near anchor) ─── */
function CollectionPicker({ item, collections, anchorRect, onToggle, onClose }: {
  item: ContentItem; collections: Collection[]; anchorRect: DOMRect; onToggle: (name: string) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!item) return null;

  // Position below the anchor button, aligned right
  const top = anchorRect.bottom + 4;
  const right = window.innerWidth - anchorRect.right;

  return (
    <div
      ref={ref}
      className="fixed z-[60] w-[210px] bg-surface-0 rounded-xl border border-rule shadow-xl py-2 anim-fade-up"
      style={{ top, right }}
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-ink-4/60 uppercase tracking-[0.08em]">Add to Collection</div>
      {collections.map(c => {
        const isIn = item.collections.includes(c.name);
        return (
          <button key={c.id} onClick={() => onToggle(c.name)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-surface-1 transition-colors"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
              isIn ? 'bg-warm border-warm text-white' : 'border-rule'
            }`}>
              {isIn && '\u2713'}
            </span>
            <span className={`flex-1 truncate font-reading ${isIn ? 'text-ink-1 font-medium' : 'text-ink-2'}`}>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Collection sidebar item ─── */
function CollectionSideItem({ collection, itemCount, visibility, active, onClick }: {
  collection: Collection; itemCount: number; visibility: 'private' | 'public'; active: boolean; onClick: () => void;
}) {
  const thumbs = getCollectionMosaicThumbnails(collection.name, 1);
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13.5px] transition-all duration-150 ${
        active ? 'bg-surface-1 text-ink-1 font-medium shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-ink-2 hover:text-ink-1 hover:bg-surface-1/50'
      }`}
    >
      {thumbs[0] ? (
        <div className={`w-[24px] h-[24px] rounded-md overflow-hidden flex-shrink-0 ${active ? 'ring-1 ring-warm/30' : ''}`}>
          <img src={thumbs[0]} alt={collection.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="w-[24px] h-[24px] rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
          <Library size={11} strokeWidth={1.4} className="text-ink-4" />
        </div>
      )}
      <span className="font-reading flex-1 truncate text-left">{collection.name}</span>
      <span className="flex items-center gap-1.5">
        {visibility === 'public' ? (
          <Globe size={10} strokeWidth={1.6} className={active ? 'text-warm/70' : 'text-ink-4/55'} />
        ) : (
          <Lock size={9} strokeWidth={1.6} className={active ? 'text-ink-3/50' : 'text-ink-4/45'} />
        )}
        <span className={`text-[11px] tabular-nums ${active ? 'text-ink-3' : 'text-ink-4/50'}`}>{itemCount}</span>
      </span>
    </button>
  );
}
