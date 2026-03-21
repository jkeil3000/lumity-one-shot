import { useState } from 'react';
import { MapPin, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  currentUser,
  libraryItems,
  feedItems,
  collections,
  getItemsByInterest,
  getCollectionThumbnail,
  getProfileFavorites,
} from '../data/mock';
import AvatarCircle from '../components/cards/AvatarCircle';
import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';
import CollectionCard from '../components/cards/CollectionCard';

type ProfileMode = 'glance' | 'feed';

export default function Self() {
  const { setSelectedItem } = useApp();
  const [mode, setMode] = useState<ProfileMode>('glance');
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [showAllShelves, setShowAllShelves] = useState(false);

  const favorites = getProfileFavorites();

  // All shared/public posts for Feed mode
  const sharedPosts = [...libraryItems, ...feedItems]
    .filter(i => i.visibility === 'public')
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

  // If an interest is selected, filter to just that shelf
  const filteredShelves = activeInterest
    ? interestShelves.filter(s => s.interest === activeInterest)
    : interestShelves;

  // In "At a Glance" mode, show top 3 unless expanded
  const displayedShelves = showAllShelves || activeInterest
    ? filteredShelves
    : filteredShelves.slice(0, 3);

  const hasMoreShelves = !activeInterest && filteredShelves.length > 3;

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
          <ModeTab label="At a Glance" active={mode === 'glance'} onClick={() => setMode('glance')} />
          <ModeTab label="Feed" active={mode === 'feed'} onClick={() => setMode('feed')} />
        </div>

        {/* ══════════════ AT A GLANCE ══════════════ */}
        {mode === 'glance' && (
          <div className="pb-10">
            {/* Favorites carousel */}
            {favorites.length > 0 && (
              <div className="mb-10">
                <HorizontalCarousel title="Favorites">
                  {favorites.map(item => (
                    <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />
                  ))}
                </HorizontalCarousel>
              </div>
            )}

            {/* Shelves (top 3 by default, expandable) */}
            <div className="mb-10">
              <SectionLabel label="Shelves" />

              {/* Interest pills */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => { setActiveInterest(null); setShowAllShelves(false); }}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                    !activeInterest
                      ? 'bg-ink-1 text-white border-ink-1'
                      : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'
                  }`}
                >
                  All
                </button>
                {sortedInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => {
                      setActiveInterest(activeInterest === interest ? null : interest);
                      setShowAllShelves(true);
                    }}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                      activeInterest === interest
                        ? 'bg-ink-1 text-white border-ink-1'
                        : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {/* Shelf carousels */}
              {displayedShelves.map(({ interest, items }) => (
                <div key={interest} className="mb-8">
                  <HorizontalCarousel title={interest}>
                    {items.map(item => (
                      <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />
                    ))}
                  </HorizontalCarousel>
                </div>
              ))}

              {/* See all interests */}
              {hasMoreShelves && !showAllShelves && (
                <button
                  onClick={() => setShowAllShelves(true)}
                  className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-warm transition-colors mx-auto"
                >
                  <ChevronDown size={14} strokeWidth={1.8} />
                  See all {interestShelves.length} interests
                </button>
              )}
            </div>

            {/* Collections */}
            {collections.length > 0 && (
              <div className="mb-10">
                <SectionLabel label="Collections" />
                <div className="grid grid-cols-2 gap-3">
                  {collections.map(col => (
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
          </div>
        )}

        {/* ══════════════ FEED ══════════════ */}
        {mode === 'feed' && (
          <div className="pb-10 max-w-[680px] mx-auto">
            {sharedPosts.length === 0 && (
              <p className="py-12 text-center text-[13px] text-ink-4">No shared posts yet.</p>
            )}
            <div className="space-y-6">
              {sharedPosts.map(item => (
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

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-4 pb-2 border-b border-rule-faint">
      <span className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em]">{label}</span>
    </div>
  );
}
