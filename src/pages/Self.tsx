import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { MapPin, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { clearToken } from '../lib/auth';
import {
  getCurrentUser as getMockUser,
  getProfilePinned as getMockPinned,
  getProfileLately as getMockLately,
  libraryItems,
  feedItems,
  collections as mockCollections,
  getItemsByInterest as getMockItemsByInterest,
  getCollectionThumbnail,
} from '../data/mock';
import type { ContentItem } from '../data/mock';
import AvatarCircle from '../components/cards/AvatarCircle';
import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';
import CollectionCard from '../components/cards/CollectionCard';

type ProfileMode = 'glance' | 'feed';
type ContentType = 'all' | 'article' | 'book' | 'podcast' | 'video';
type ViewAllTarget = { kind: 'pinned' } | { kind: 'shelf'; interest: string } | null;

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'book', label: 'Books' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'video', label: 'Videos' },
];

const PROFILE_ROUTES = {
  details: () => `/users/me`,
  libraries: (userId: string) => `/mylibrary?userId=${userId}&limit=20&lastId=0`,
};

type ProfileState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  user: any;
  pinned: ContentItem[];
  lately: ContentItem[];
  sharedPosts: ContentItem[];
  interestShelves: { interest: string; items: ContentItem[] }[];
  collections: any[];
  error: string | null;
};

export default function Self() {
  const { setSelectedItem } = useApp();
  const [mode, setMode] = useState<ProfileMode>('glance');
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ContentType>('all');
  const [viewAllTarget, setViewAllTarget] = useState<ViewAllTarget>(null);

  const [state, setState] = useState<ProfileState>({
    status: 'loading',
    user: null,
    pinned: [],
    lately: [],
    sharedPosts: [],
    interestShelves: [],
    collections: [],
    error: null,
  });

  const loadProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      const profilePayload = await apiFetch(PROFILE_ROUTES.details(), { method: 'GET' });
      const rawUser = profilePayload?.data || profilePayload;

      const user = {
        ...rawUser,
        id: rawUser.id || rawUser._id,
        displayName: rawUser.name || rawUser.firstName || 'User',
        username: rawUser.username || 'user',
        avatarUrl: rawUser.profilePic || rawUser.avatar || '',
        bio: rawUser.bio || rawUser.about || '',
        interests: rawUser.tags || ['Technology', 'Design'],
        location: rawUser.location || rawUser.city || '',
        website: rawUser.website || rawUser.link || '',
        savesSharedCount: rawUser.postsCount || rawUser.totalPosts || 0,
        followersCount: rawUser.followersCount || rawUser.followers || 0,
      };

      const apiPosts = (rawUser.posts || []).map(adaptPostToContentItem);
      const apiFavorites = (rawUser.favorites || []).map(adaptPostToContentItem);

      const sharedPosts = apiPosts;
      const lately = apiPosts.slice(0, 10);
      const pinned = apiFavorites;

      const interestShelves = user.interests.map((interest: string) => ({
        interest,
        items: apiFavorites.filter((item: ContentItem) =>
          (item as any).tags?.includes(interest) || item.type === interest.toLowerCase()
        )
      })).filter((shelf: any) => shelf.items.length > 0)
         .sort((a: any, b: any) => b.items.length - a.items.length);

      setState({
        status: 'success',
        user,
        pinned,
        lately,
        sharedPosts,
        interestShelves,
        collections: mockCollections,
        error: null
      });

    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
        clearToken();
        window.location.href = '/login';
        return;
      }

      const mockUser = getMockUser();
      const mockInterestShelves = mockUser.interests
        .map((interest: string) => ({
          interest,
          items: getMockItemsByInterest(interest),
        }))
        .filter((shelf: any) => shelf.items.length > 0)
        .sort((a: any, b: any) => b.items.length - a.items.length);

      setState({
        status: 'success',
        user: mockUser,
        pinned: getMockPinned(),
        lately: getMockLately(),
        sharedPosts: [...libraryItems, ...feedItems].filter(i => i.author.id === mockUser.id && i.visibility === 'public'),
        interestShelves: mockInterestShelves,
        collections: mockCollections,
        error: 'Offline mode: Displaying cached data.',
      });
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (state.status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A0B2E]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-ink-2" />
      </div>
    );
  }

  if (!state.user) return null;

  const { user, pinned, lately, sharedPosts, interestShelves, collections } = state;
  const sortedInterests = interestShelves.map(s => s.interest);
  const resolvedInterest = activeInterest ?? sortedInterests[0] ?? null;
  const activeShelf = resolvedInterest ? interestShelves.find(s => s.interest === resolvedInterest) : null;

  const filterByType = (items: ContentItem[]) => activeType === 'all' ? items : items.filter(i => i.type === activeType);

  return (
    <div className="h-full overflow-y-auto">
      {user.banner && (
        <div className="relative h-[200px] overflow-hidden">
          <img src={user.banner} alt="Profile banner" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0/60 to-transparent" />
        </div>
      )}

      <div className="max-w-[700px] mx-auto px-6 md:px-10">
        <div className={`flex items-start gap-5 ${user.banner ? '-mt-10 relative z-10' : 'pt-10'}`}>
          <div className="ring-4 ring-surface-0 rounded-full">
            <AvatarCircle user={user} size="xl" />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="font-reading text-[24px] font-semibold text-ink-1 tracking-[-0.02em] leading-[1.2]">
              {user.displayName === 'You' ? user.username : user.displayName}
            </h1>
            <p className="text-[13px] text-ink-4 mt-0.5">@{user.username}</p>
            <p className="font-reading text-[14px] text-ink-2 mt-2 leading-[1.6] max-w-[520px]">
              {user.bio}
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {user.location && (
                <span className="flex items-center gap-1 text-[12px] text-ink-3">
                  <MapPin size={12} strokeWidth={1.8} /> {user.location}
                </span>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[12px] text-warm hover:text-warm-hover transition-colors">
                  <LinkIcon size={12} strokeWidth={1.8} /> {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="flex items-center gap-5 text-[12px] text-ink-4 mt-2">
              <span><strong className="text-ink-2 font-medium">{user.interests?.length || 0}</strong> interests</span>
              <span><strong className="text-ink-2 font-medium">{user.savesSharedCount}</strong> shared</span>
              <span><strong className="text-ink-2 font-medium">{user.followersCount}</strong> followers</span>
            </div>
            {state.error && <p className="text-[11px] text-orange-400 mt-2">{state.error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 mb-8 border-b border-rule">
          <ModeTab label="At a Glance" active={mode === 'glance'} onClick={() => { setMode('glance'); setActiveType('all'); }} />
          <ModeTab label="Feed" active={mode === 'feed'} onClick={() => { setMode('feed'); setActiveType('all'); }} />
        </div>

        {mode === 'glance' && (
          <div className="pb-10">
            {viewAllTarget ? (
              <ViewAllSection target={viewAllTarget} pinned={pinned} interestShelves={interestShelves} onBack={() => setViewAllTarget(null)} onSelect={setSelectedItem} />
            ) : (
              <>
                {pinned.length > 0 && (
                  <div className="mb-10">
                    <HorizontalCarousel title="Pinned" action="View all" onAction={() => setViewAllTarget({ kind: 'pinned' })}>
                      {pinned.map(item => <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />)}
                    </HorizontalCarousel>
                  </div>
                )}

                {lately.length > 0 && (
                  <div className="mb-10">
                    <HorizontalCarousel title="Lately" action="View all" onAction={() => setMode('feed')}>
                      {lately.map(item => <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />)}
                    </HorizontalCarousel>
                  </div>
                )}

                {interestShelves.length > 0 && (
                  <div className="mb-10">
                    <SectionLabel label="Shelves" right={<TypePills active={activeType} onChange={setActiveType} />} />
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      {sortedInterests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => setActiveInterest(interest)}
                          className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                            resolvedInterest === interest ? 'bg-ink-1 text-surface-0 border-ink-1' : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    {activeShelf && (
                      <HorizontalCarousel title={activeShelf.interest} action="View all" onAction={() => setViewAllTarget({ kind: 'shelf', interest: activeShelf.interest })} subtle>
                        {filterByType(activeShelf.items).map(item => <ContentCard key={item.id} item={item} size="medium" onClick={() => setSelectedItem(item)} />)}
                      </HorizontalCarousel>
                    )}
                  </div>
                )}

                {collections.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule-faint">
                      <span className="text-[12px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Collections</span>
                      {collections.length > 4 && <button className="text-[12px] text-ink-4 hover:text-warm transition-colors">View all</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {collections.slice(0, 4).map(col => (
                        <CollectionCard key={col.id} name={col.name} count={col.count} thumbnail={getCollectionThumbnail(col.name)} onClick={() => {}} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'feed' && (
          <div className="pb-10 w-full">
            <SectionLabel label="Feed" right={<TypePills active={activeType} onChange={setActiveType} />} />
            {filterByType(sharedPosts).length === 0 && <p className="py-12 text-center text-[13px] text-ink-4">No shared posts yet.</p>}
            <div className="space-y-6">
              {filterByType(sharedPosts).map(item => <ContentCard key={item.id} item={item} size="large" onClick={() => setSelectedItem(item)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function adaptPostToContentItem(post: any): ContentItem {
  return {
    id: post.id || post._id,
    type: (post.type || post.mediaType || 'article').toLowerCase() as ContentType,
    title: post.title || post.headline || 'Untitled',
    description: post.description || post.caption || '',
    author: {
      id: post.author?.id || post.user?.id || 'unknown',
      name: post.author?.name || post.user?.name || 'Unknown Author',
      avatarUrl: post.author?.avatar || post.user?.profilePic || ''
    },
    url: post.url || post.link || '',
    thumbnail: post.thumbnail || post.mediaUrl || '',
    visibility: post.visibility || 'public',
    tags: post.tags || [],
    collections: [],
    createdAt: post.createdAt || Date.now(),
  } as unknown as ContentItem;
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-[13px] px-4 pb-3 pt-3 relative transition-colors ${active ? 'text-ink-1 font-medium' : 'text-ink-4 hover:text-ink-2'}`}>
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
        <button key={ct.value} onClick={() => onChange(ct.value)} className={`text-[10px] px-2.5 py-0.5 rounded-full transition-colors ${active === ct.value ? 'bg-surface-2 text-ink-2 font-medium' : 'text-ink-4 hover:text-ink-3'}`}>
          {ct.label}
        </button>
      ))}
    </div>
  );
}

function ViewAllSection({ target, pinned, interestShelves, onBack, onSelect }: any) {
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [activeInterest, setActiveInterest] = useState<string | null>(target.kind === 'shelf' ? target.interest : null);

  const allItems = target.kind === 'pinned' ? pinned : interestShelves.find((s: any) => s.interest === (activeInterest ?? target.interest))?.items ?? [];
  const items = typeFilter === 'all' ? allItems : allItems.filter((i: any) => i.type === typeFilter);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-ink-4 hover:text-ink-2 transition-colors mb-4">
        <ArrowLeft size={14} strokeWidth={1.8} /> Back
      </button>
      <SectionLabel label={target.kind === 'shelf' ? 'Shelves' : 'Pinned'} right={<TypePills active={typeFilter} onChange={setTypeFilter} />} />
      {target.kind === 'shelf' && interestShelves.length > 1 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {interestShelves.map((s: any) => (
            <button key={s.interest} onClick={() => { setActiveInterest(s.interest); setTypeFilter('all'); }} className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${(activeInterest ?? target.interest) === s.interest ? 'bg-ink-1 text-surface-0 border-ink-1' : 'bg-transparent text-ink-3 border-rule hover:border-ink-4 hover:text-ink-2'}`}>
              {s.interest}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item: any) => <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => onSelect(item)} />)}
      </div>
      {items.length === 0 && <p className="py-8 text-center text-[13px] text-ink-4">No items yet.</p>}
    </div>
  );
}