import { useState, type ReactNode } from 'react';
import { MapPin, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getCurrentUser,
  libraryItems,
  feedItems,
  collections,
  getItemsByInterest,
  getCollectionThumbnail,
  getProfilePinned,
  getProfileLately,
} from '../data/mock';

const currentUser = getCurrentUser();
import type { ContentItem } from '../data/mock';
import AvatarCircle from '../components/cards/AvatarCircle';
import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';
import CollectionCard from '../components/cards/CollectionCard';

type ProfileMode = 'glance' | 'feed';
type ContentType = 'all' | 'article' | 'book' | 'podcast' | 'video';

// "View All" can show pinned items or a shelf's full list
type ViewAllTarget = { kind: 'pinned' } | { kind: 'shelf'; interest: string } | null;

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'book', label: 'Books' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'video', label: 'Videos' },
];

export default function Self() {
  const { setSelectedItem } = useApp();
  const [mode, setMode] = useState<ProfileMode>('glance');
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ContentType>('all');
  const [viewAllTarget, setViewAllTarget] = useState<ViewAllTarget>(null);

  // Pinned: user-curated items (isPinned flag). Could also be called "Favorites" —
  // using "Pinned" as the UI label since it implies curation rather than a reaction.
  const pinned = getProfilePinned();
  const lately = getProfileLately();

  // Feed: only the current user's public posts/reposts, chronological
  const sharedPosts = [...libraryItems, ...feedItems]
    .filter(i => i.author.id === currentUser.id && i.visibility === 'public')
    .filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx);

  // Build interest shelves — sorted by item count (richest first)
  const interestShelves = currentUser.interests
    .map(interest => ({
      interest,
      items: getItemsByInterest(interest),
    }))
    .filter(shelf => shelf.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);

  // Sort pills to match shelf display order
  const sortedInterests = interestShelves.map(s => s.interest);

  // Show one interest at a time — default to first if none selected
  const resolvedInterest = activeInterest ?? sortedInterests[0] ?? null;
  const activeShelf = resolvedInterest
    ? interestShelves.find(s => s.interest === resolvedInterest)
    : null;

  // Filter items by content type
  const filterByType = (items: ContentItem[]) =>
    activeType === 'all' ? items : items.filter(i => i.type === activeType);

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Banner ── */}
      {currentUser.banner && (
        <div className="relative h-[200px] overflow-hidden">
          <img
            src={currentUser.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0/60 to-transparent" />
        </div>
      )}

      <div className="max-w-[960px] mx-auto px-10">
        {/* ── Identity ── */}
        <div className={`flex items-start gap-5 ${currentUser.banner ? '-mt-10 relative z-10' : 'pt-10'}`}>
          <div className="ring-4 ring-surface-0 rounded-full">
            <AvatarCircle user={currentUser} size="xl" />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="font-reading text-[24px] font-semibold text-ink-1 tracking-[-0.02em] leading-[1.2]">
              {currentUser.displayName === 'You' ? currentUser.username : currentUser.displayName}
            </h1>
            <p className="text-[13px] text-ink-4 mt-0.5">@{currentUser.username}</p>
            <p className="font-reading text-[14px] text-ink-2 mt-2 leading-[1.6] max-w-[520px]">
              {currentUser.bio}
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {currentUser.location && (
                <span className="flex items-center gap-1 text-[12px] text-ink-3">
                  <MapPin size={12} strokeWidth={1.8} /> {currentUser.location}
                </span>
              )}
              {currentUser.website && (
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-warm hover:text-warm-hover transition-colors"
                >
                  <LinkIcon size={12} strokeWidth={1.8} /> {currentUser.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="flex items-center gap-5 text-[12px] text-ink-4 mt-2">
              <span><strong className="text-ink-2 font-medium">{currentUser.interests.length}</strong> interests</span>
              <span><strong className="text-ink-2 font-medium">{currentUser.savesSharedCount}</strong> shared</span>
              <span><strong className="text-ink-2 font-medium">{currentUser.followersCount}</strong> followers</span>
            </div>
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex items-center gap-1 mt-6 mb-8 border-b border-rule">
          <ModeTab label="At a Glance" active={mode === 'glance'} onClick={() => { setMode('glance'); setActiveType('all'); }} />
          <ModeTab label="Feed" active={mode === 'feed'} onClick={() => { setMode('feed'); setActiveType('all'); }} />
        </div>

        {/* ══════════════ AT A GLANCE ══════════════ */}
        {mode === 'glance' && (
          <div className="pb-10">
            {/* ── View All (expanded grid) ── */}
            {viewAllTarget ? (
              <ViewAllSection
                target={viewAllTarget}
                pinned={pinned}
                interestShelves={interestShelves}
                onBack={() => setViewAllTarget(null)}
                onSelect={setSelectedItem}
              />
            ) : (
              <>
                {/* Pinned carousel */}
                {pinned.length > 0 && (
                  <div className="mb-10">
                    <HorizontalCarousel title="Pinned" action="View all" onAction={() => setViewAllTarget({ kind: 'pinned' })}>
                      {pinned.map(item => (
                        <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />
                      ))}
                    </HorizontalCarousel>
                  </div>
                )}

                {/* Lately: recent public posts by this user */}
                {lately.length > 0 && (
                  <div className="mb-10">
                    <HorizontalCarousel title="Lately" action="View all" onAction={() => setMode('feed')}>
                      {lately.map(item => (
                        <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />
                      ))}
                    </HorizontalCarousel>
                  </div>
                )}

                {/* Shelves — one interest at a time, navigate via pills */}
                <div className="mb-10">
                  <SectionLabel label="Shelves" right={<TypePills active={activeType} onChange={setActiveType} />} />

                  {/* Interest pills — selecting switches the visible shelf */}
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {sortedInterests.map(interest => (
                      <button
                        key={interest}
                        onClick={() => setActiveInterest(interest)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                          resolvedInterest === interest
                            ? 'bg-ink-1 text-white border-ink-1'
                            : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>

                  {/* Single shelf carousel for the active interest */}
                  {activeShelf && (
                    <HorizontalCarousel
                      title={activeShelf.interest}
                      action="View all"
                      onAction={() => setViewAllTarget({ kind: 'shelf', interest: activeShelf.interest })}
                      subtle
                    >
                      {filterByType(activeShelf.items).map(item => (
                        <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />
                      ))}
                    </HorizontalCarousel>
                  )}
                </div>

                {/* Collections — cover-style tiles, max 4 visible */}
                {collections.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule-faint">
                      <span className="text-[12px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Collections</span>
                      {collections.length > 4 && (
                        <button className="text-[12px] text-ink-4 hover:text-warm transition-colors">
                          View all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {collections.slice(0, 4).map(col => (
                        <CollectionCard
                          key={col.id}
                          name={col.name}
                          count={col.count}
                          thumbnail={getCollectionThumbnail(col.name)}
                          onClick={() => {
                            const item = libraryItems.find(i => i.collections.includes(col.name));
                            if (item) setSelectedItem(item);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════ FEED ══════════════ */}
        {mode === 'feed' && (
          <div className="pb-10 max-w-[680px] mx-auto px-10">
            <SectionLabel label="Feed" right={<TypePills active={activeType} onChange={setActiveType} />} />

            {filterByType(sharedPosts).length === 0 && (
              <p className="py-12 text-center text-[13px] text-ink-4">No shared posts yet.</p>
            )}
            <div className="space-y-6">
              {filterByType(sharedPosts).map(item => (
                <ContentCard key={item.id} item={item} size="large" onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] px-4 pb-3 pt-3 relative transition-colors ${
        active ? 'text-ink-1 font-medium' : 'text-ink-4 hover:text-ink-2'
      }`}
    >
      {label}
      {active && <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-ink-1 rounded-full" />}
    </button>
  );
}

function SectionLabel({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule-faint">
      <span className="text-[12px] font-semibold text-ink-3 uppercase tracking-[0.06em]">{label}</span>
      {right}
    </div>
  );
}

function TypePills({ active, onChange }: { active: ContentType; onChange: (t: ContentType) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {contentTypes.map(ct => (
        <button
          key={ct.value}
          onClick={() => onChange(ct.value)}
          className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${
            active === ct.value
              ? 'bg-surface-2 text-ink-2 font-medium'
              : 'text-ink-4 hover:text-ink-3'
          }`}
        >
          {ct.label}
        </button>
      ))}
    </div>
  );
}

/* ─── View All (expanded grid for Pinned or a Shelf) ─── */
function ViewAllSection({
  target,
  pinned,
  interestShelves,
  onBack,
  onSelect,
}: {
  target: NonNullable<ViewAllTarget>;
  pinned: ContentItem[];
  interestShelves: { interest: string; items: ContentItem[] }[];
  onBack: () => void;
  onSelect: (item: ContentItem) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  // For shelf targets, allow switching between interests without going back
  const [activeInterest, setActiveInterest] = useState<string | null>(
    target.kind === 'shelf' ? target.interest : null
  );

  const allItems = target.kind === 'pinned'
    ? pinned
    : interestShelves.find(s => s.interest === (activeInterest ?? target.interest))?.items ?? [];
  const items = typeFilter === 'all' ? allItems : allItems.filter(i => i.type === typeFilter);

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-ink-4 hover:text-ink-2 transition-colors mb-4"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Back
      </button>
      {/* Header: "Shelves" or "Pinned" with type filter inline */}
      <SectionLabel
        label={target.kind === 'shelf' ? 'Shelves' : 'Pinned'}
        right={<TypePills active={typeFilter} onChange={setTypeFilter} />}
      />

      {/* Interest pills — only shown for shelf view */}
      {target.kind === 'shelf' && interestShelves.length > 1 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {interestShelves.map(s => (
            <button
              key={s.interest}
              onClick={() => { setActiveInterest(s.interest); setTypeFilter('all'); }}
              className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                (activeInterest ?? target.interest) === s.interest
                  ? 'bg-ink-1 text-white border-ink-1'
                  : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'
              }`}
            >
              {s.interest}
            </button>
          ))}
        </div>
      )}

      {/* Grid of all items */}
      <div className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => onSelect(item)} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="py-8 text-center text-[13px] text-ink-4">No items yet.</p>
      )}
    </div>
  );
}
