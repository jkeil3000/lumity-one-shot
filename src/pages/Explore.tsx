import { useState } from 'react';
import { Search, Users, Compass, BookOpen, ArrowLeft, LayoutGrid, List } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  currentUser,
  exploreInterests,
  getExploreForYouContent,
  getExploreSuggestedPeople,
  type User,
  type InterestTopic,
} from '../data/mock';
import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';
import AvatarCircle from '../components/cards/AvatarCircle';

/* ─── Theme palettes (mirrors Home.tsx structure) ─── */

const explorePaletteLight = {
  '--home-page': '#f2f4ef',
  '--home-page-deep': '#173528',
  '--home-tertiary': '#6B4444',
  '--color-surface-0': '#f2f4ef',
  '--color-surface-1': '#ffffff',
  '--color-surface-2': '#f6f8f3',
  '--color-surface-3': '#dfe6dc',
  '--color-ink-1': '#274336',
  '--color-ink-2': '#4a6155',
  '--color-ink-3': '#75867d',
  '--color-ink-4': '#a3aea8',
  '--color-rule': '#d9e1d7',
  '--color-rule-faint': '#edf2eb',
  '--color-warm': '#274336',
  '--color-warm-hover': '#1f382c',
  '--color-warm-surface': '#e7eee8',
} as CSSProperties;

const explorePaletteDark = {
  '--home-page': '#0E1614',
  '--home-page-deep': '#14211D',
  '--home-tertiary': '#4A6B5A',
  '--color-surface-0': '#0E1614',
  '--color-surface-1': '#14211D',
  '--color-surface-2': '#1C2F28',
  '--color-surface-3': '#274038',
  '--color-ink-1': '#EDF2EE',
  '--color-ink-2': '#B5C9BF',
  '--color-ink-3': '#95B0A4',
  '--color-ink-4': '#728E82',
  '--color-rule': '#1E3329',
  '--color-rule-faint': '#172720',
  '--color-warm': '#50C878',
  '--color-warm-hover': '#3FB86E',
  '--color-warm-surface': '#152E22',
} as CSSProperties;

const explorePaletteNavy = {
  '--home-page': '#0E1522',
  '--home-page-deep': '#101A2B',
  '--home-tertiary': '#5B4C77',
  '--color-surface-0': '#0E1522',
  '--color-surface-1': '#152033',
  '--color-surface-2': '#1D2C45',
  '--color-surface-3': '#2A3E60',
  '--color-ink-1': '#EFF4F9',
  '--color-ink-2': '#C5D2E0',
  '--color-ink-3': '#A3B2C4',
  '--color-ink-4': '#75869A',
  '--color-rule': '#223149',
  '--color-rule-faint': '#182339',
  '--color-warm': '#7AA2D6',
  '--color-warm-hover': '#94B8E8',
  '--color-warm-surface': '#1C2D49',
} as CSSProperties;

const explorePaletteIndigo = {
  '--home-page': '#141321',
  '--home-page-deep': '#17162A',
  '--home-tertiary': '#5A4A86',
  '--color-surface-0': '#141321',
  '--color-surface-1': '#1C1B30',
  '--color-surface-2': '#282645',
  '--color-surface-3': '#3A3762',
  '--color-ink-1': '#F3F2FB',
  '--color-ink-2': '#D2CFE8',
  '--color-ink-3': '#ACA8CD',
  '--color-ink-4': '#7C78A0',
  '--color-rule': '#2A2747',
  '--color-rule-faint': '#201E37',
  '--color-warm': '#8A7AE6',
  '--color-warm-hover': '#A293F2',
  '--color-warm-surface': '#2A2550',
} as CSSProperties;

/* ─── Mock mutual connections ─── */
const mutualConnectionMap: Record<string, string[]> = {
  u1: ['u2', 'u3'],
  u2: ['u1', 'u4'],
  u3: ['u1', 'u7'],
  u4: ['u2', 'u8'],
  u5: ['u8', 'u9'],
  u6: ['u2', 'u10'],
  u7: ['u3', 'u9'],
  u8: ['u4', 'u5'],
  u9: ['u5', 'u7'],
  u10: ['u6', 'u2'],
};

function getMutualConnections(userId: string, allPeople: User[]): User[] {
  const mutualIds = mutualConnectionMap[userId] || [];
  return allPeople.filter(u => mutualIds.includes(u.id));
}

/* ─── Types ─── */
type ExploreTab = 'interests' | 'people';
type FeedMode = 'scroll' | 'scan';

/* ─── Person Card (carousel) ─── */
function PersonCard({ user, isDark, mutuals }: { user: User; isDark: boolean; mutuals: User[] }) {
  const sharedInterests = user.interests.filter(i => currentUser.interests.includes(i));

  return (
    <div
      className={`w-[260px] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md ${
        isDark
          ? 'border border-white/10 bg-surface-1'
          : 'border border-rule-faint bg-surface-1'
      }`}
    >
      <div
        className="h-[72px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-warm-surface), var(--color-surface-2))',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url(https://picsum.photos/seed/${user.id}-banner/400/200)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      </div>

      <div className="px-4 -mt-5 relative z-10">
        <div className="ring-2 ring-surface-1 rounded-full inline-block">
          <AvatarCircle user={user} size="lg" />
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        <h3 className={`text-[14px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-ink-1'} group-hover:text-warm transition-colors`}>
          {user.displayName}
        </h3>
        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/50' : 'text-ink-4'}`}>
          @{user.username}{user.location ? ` · ${user.location}` : ''}
        </p>
        <p className={`text-[12px] mt-2 leading-[1.5] line-clamp-2 ${isDark ? 'text-white/72' : 'text-ink-2'}`}>
          {user.bio}
        </p>

        {sharedInterests.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {sharedInterests.slice(0, 3).map(interest => (
              <span
                key={interest}
                className={`text-[9px] px-2 py-0.5 rounded-full ${
                  isDark
                    ? 'bg-warm-surface text-white/72'
                    : 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_58%,white)] text-[color:color-mix(in_srgb,var(--color-warm)_52%,var(--color-ink-2))]'
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {mutuals.length > 0 && (
          <div className={`flex items-center gap-1.5 mt-2.5 ${isDark ? 'text-white/45' : 'text-ink-4'}`}>
            <div className="flex -space-x-1.5">
              {mutuals.slice(0, 2).map(m => (
                <div key={m.id} className="ring-1 ring-surface-1 rounded-full">
                  <AvatarCircle user={m} size="sm" />
                </div>
              ))}
            </div>
            <span className="text-[10px]">
              {mutuals.length === 1
                ? `${mutuals[0].displayName} is in their community`
                : `${mutuals[0].displayName} + ${mutuals.length - 1} more in common`}
            </span>
          </div>
        )}

        <div className={`flex items-center gap-4 mt-3 pt-3 border-t ${isDark ? 'border-white/8' : 'border-rule-faint'}`}>
          <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-ink-4'}`}>
            <strong className={isDark ? 'text-white/80' : 'text-ink-2'}>{user.followersCount.toLocaleString()}</strong> community
          </span>
          <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-ink-4'}`}>
            <strong className={isDark ? 'text-white/80' : 'text-ink-2'}>{user.savesSharedCount}</strong> shared
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Interest Card ─── */
function InterestCard({ interest, isDark, onClick }: { interest: InterestTopic; isDark: boolean; onClick: () => void }) {
  const isFollowing = currentUser.interests.includes(interest.name);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md ${
        isDark
          ? 'border border-white/10 bg-surface-1'
          : 'border border-rule-faint bg-surface-1'
      }`}
    >
      <div className="relative h-[100px] overflow-hidden">
        <img
          src={interest.thumbnail}
          alt={interest.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55))',
          }}
        />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-[14px] font-semibold text-white leading-tight">
            {interest.name}
          </h3>
        </div>
        {isFollowing && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
              isDark ? 'bg-warm/90 text-surface-0' : 'bg-warm text-white'
            }`}>
              Following
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <p className={`text-[11px] leading-[1.55] line-clamp-2 mb-3 ${isDark ? 'text-white/65' : 'text-ink-2'}`}>
          {interest.description}
        </p>
        <div className={`flex items-center gap-3 text-[11px] ${isDark ? 'text-white/45' : 'text-ink-4'}`}>
          <span className="flex items-center gap-1">
            <BookOpen size={11} /> {interest.itemCount} pieces
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {interest.followerCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Interest Feed View ─── */
function InterestFeedView({
  interestName,
  isDark,
  onBack,
  bandClassName,
}: {
  interestName: string | null; // null = "all your interests"
  isDark: boolean;
  onBack: () => void;
  bandClassName: string;
}) {
  const { setSelectedItem } = useApp();
  const [feedMode, setFeedMode] = useState<FeedMode>('scroll');
  const allContent = getExploreForYouContent();

  const isAll = interestName === null;
  const label = isAll ? 'Your Interests' : interestName;
  const description = isAll
    ? 'Content from across the subjects you follow.'
    : exploreInterests.find(i => i.name === interestName)?.description || '';

  const content = isAll
    ? allContent.filter(item => item.interests.some(i => currentUser.interests.includes(i)))
    : allContent.filter(item => item.interests.includes(interestName!));

  // For scan mode, group by interest
  const interestGroups = isAll
    ? currentUser.interests
        .map(interest => ({
          name: interest,
          items: content.filter(item => item.interests.includes(interest)),
        }))
        .filter(g => g.items.length > 0)
    : [];

  return (
    <>
      {/* Sticky header bar */}
      <div className={`sticky top-0 z-10 mb-6 rounded-2xl px-5 py-4 ${
        isDark
          ? 'bg-surface-1/90 border border-white/8 backdrop-blur-md'
          : 'bg-surface-1/90 border border-rule-faint backdrop-blur-md'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-white/65'
                  : 'hover:bg-surface-2 text-ink-3'
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h2 className={`text-[18px] font-semibold tracking-[-0.02em] truncate ${isDark ? 'text-white' : 'text-ink-1'}`}>
                {label}
              </h2>
              {description && (
                <p className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-white/50' : 'text-ink-3'}`}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Scroll / Scan toggle */}
          <div className={`flex items-center gap-1 px-1.5 py-1 rounded-lg ${isDark ? 'bg-white/6' : 'bg-surface-0'}`}>
            <button
              onClick={() => setFeedMode('scroll')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                feedMode === 'scroll'
                  ? isDark ? 'bg-white/12 text-white' : 'bg-white text-ink-1 shadow-sm'
                  : isDark ? 'text-white/45 hover:text-white/70' : 'text-ink-4 hover:text-ink-2'
              }`}
            >
              <List size={12} /> Scroll
            </button>
            <button
              onClick={() => setFeedMode('scan')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                feedMode === 'scan'
                  ? isDark ? 'bg-white/12 text-white' : 'bg-white text-ink-1 shadow-sm'
                  : isDark ? 'text-white/45 hover:text-white/70' : 'text-ink-4 hover:text-ink-2'
              }`}
            >
              <LayoutGrid size={12} /> Scan
            </button>
          </div>
        </div>
      </div>

      {/* Feed content */}
      {feedMode === 'scroll' ? (
        <div className="max-w-[680px] mx-auto space-y-6">
          {content.map(item => (
            <ContentCard key={item.id} item={item} size="large" onClick={() => setSelectedItem(item)} />
          ))}
          {content.length === 0 && (
            <div className={`py-20 text-center text-[13px] ${isDark ? 'text-white/40' : 'text-ink-4'}`}>
              No content yet for this interest.
            </div>
          )}
        </div>
      ) : isAll && interestGroups.length > 0 ? (
        /* Scan for "all interests" — grouped carousels by interest */
        <div className="space-y-0">
          {interestGroups.map(group => (
            <section key={group.name} className={bandClassName}>
              <HorizontalCarousel title={group.name} tone="default">
                {group.items.map(item => (
                  <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                    <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                  </div>
                ))}
              </HorizontalCarousel>
            </section>
          ))}
        </div>
      ) : (
        /* Scan for single interest — grid of cards */
        <section className={bandClassName}>
          <div className="grid grid-cols-3 gap-4">
            {content.map(item => (
              <ContentCard key={item.id} item={item} size="medium" fluid onClick={() => setSelectedItem(item)} />
            ))}
          </div>
          {content.length === 0 && (
            <div className={`py-16 text-center text-[13px] ${isDark ? 'text-white/40' : 'text-ink-4'}`}>
              No content yet for this interest.
            </div>
          )}
        </section>
      )}
    </>
  );
}

/* ─── Main Component ─── */
export default function Explore() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ExploreTab>('interests');
  const [searchQuery, setSearchQuery] = useState('');
  // null = grid view, string = specific interest, 'all' = all your interests combined
  const [activeInterest, setActiveInterest] = useState<string | null>(null);

  const isDark = theme === 'midnight' || theme === 'navy' || theme === 'indigo';

  const suggestedPeople = getExploreSuggestedPeople();

  const explorePalette = theme === 'midnight'
    ? explorePaletteDark
    : theme === 'navy'
      ? explorePaletteNavy
      : theme === 'indigo'
        ? explorePaletteIndigo
        : explorePaletteLight;

  const background = isDark
    ? `
      radial-gradient(circle at 14% 12%, color-mix(in srgb, var(--color-warm) 10%, transparent) 0%, transparent 24%),
      radial-gradient(circle at 84% 10%, color-mix(in srgb, var(--color-surface-3) 24%, transparent) 0%, transparent 22%),
      linear-gradient(180deg, var(--home-page), var(--home-page-deep))
    `
    : `
      radial-gradient(circle at 8% 10%, color-mix(in srgb, var(--color-warm) 4%, transparent) 0%, transparent 24%),
      radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--color-surface-3) 16%, transparent) 0%, transparent 20%),
      linear-gradient(180deg, #ffffff, var(--color-surface-1) 24%, var(--home-page) 68%)
    `;

  const bandClassName = isDark
    ? 'mb-8 rounded-[24px] border border-rule bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_36%,var(--color-surface-1)),var(--color-surface-1))] px-5 py-5 shadow-[0_18px_36px_color-mix(in_srgb,var(--home-page-deep)_20%,transparent)]'
    : 'mb-8 rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-warm)_10%,var(--color-rule))] bg-[linear-gradient(180deg,#ffffff,color-mix(in_srgb,var(--color-surface-2)_56%,white))] px-5 py-5 shadow-[0_8px_28px_rgba(18,28,24,0.05)]';

  const headerSectionClassName = isDark
    ? 'panel-glow bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_36%,var(--color-surface-1)),var(--color-surface-1))] border border-rule rounded-[24px] p-5 mb-8 overflow-hidden relative shadow-[0_18px_36px_color-mix(in_srgb,var(--home-page-deep)_20%,transparent)]'
    : 'panel-glow bg-[linear-gradient(180deg,#ffffff,color-mix(in_srgb,var(--color-surface-2)_42%,white))] border border-[color:color-mix(in_srgb,var(--color-warm)_10%,var(--color-rule))] rounded-[24px] p-5 mb-8 overflow-hidden relative shadow-[0_10px_30px_rgba(18,28,24,0.055)]';

  const headerLineClassName = isDark
    ? 'absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-warm)_34%,transparent),color-mix(in_srgb,var(--home-tertiary)_24%,transparent),transparent)]'
    : 'absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-warm)_18%,white),color-mix(in_srgb,var(--color-surface-3)_54%,white),transparent)]';

  const headerGlowClassName = isDark
    ? 'absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[color:color-mix(in_srgb,var(--color-warm-surface)_18%,transparent)] blur-3xl'
    : 'absolute -top-14 -right-8 h-36 w-36 rounded-full bg-[color:color-mix(in_srgb,var(--color-warm)_5%,transparent)] blur-3xl';

  const headerTextTone = isDark ? 'text-white' : 'text-ink-1';
  const headerSubtleTone = isDark ? 'text-white/58' : 'text-[color:color-mix(in_srgb,var(--color-warm)_58%,var(--color-ink-3))]';
  const headerBodyTone = isDark ? 'text-white/78' : 'text-ink-2';

  const tabs: { id: ExploreTab; label: string; icon: React.ReactNode }[] = [
    { id: 'interests', label: 'Interests', icon: <Compass size={13} /> },
    { id: 'people', label: 'People', icon: <Users size={13} /> },
  ];

  // Filter people by search query
  const filteredPeople = searchQuery
    ? suggestedPeople.filter(p =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : suggestedPeople;

  // Filter interests by search
  const filteredInterests = searchQuery
    ? exploreInterests.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : exploreInterests;

  // People scored by mutual connections + shared interests
  const peopleWithMutuals = filteredPeople.map(user => ({
    user,
    mutuals: getMutualConnections(user.id, suggestedPeople),
    sharedInterests: user.interests.filter(i => currentUser.interests.includes(i)),
  }));

  const recommendedPeople = [...peopleWithMutuals].sort((a, b) => {
    const aScore = a.mutuals.length * 2 + a.sharedInterests.length;
    const bScore = b.mutuals.length * 2 + b.sharedInterests.length;
    return bScore - aScore;
  });

  // If viewing an interest feed, show that instead of the grid
  const showingInterestFeed = activeTab === 'interests' && activeInterest !== null;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        ...explorePalette,
        background,
      }}
    >
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        {/* ─── Header Section (hidden when in interest feed view) ─── */}
        {!showingInterestFeed && (
          <section className={headerSectionClassName}>
            <div className={`${headerLineClassName} pointer-events-none`} />
            <div className={`${headerGlowClassName} pointer-events-none`} />

            <div className="relative z-10">
              <div className={`text-[10px] uppercase tracking-[0.12em] mb-2 ${headerSubtleTone}`}>
                Explore
              </div>
              <h1 className={`font-reading text-[30px] leading-[1.08] tracking-[-0.04em] mb-2 ${headerTextTone}`}>
                Find your people and interests
              </h1>
              <p className={`text-[13px] leading-[1.6] max-w-[540px] mb-5 ${headerBodyTone}`}>
                Discover interests worth following and people who think carefully about things that matter.
              </p>

              {/* Search bar */}
              <div className="relative max-w-[480px] mb-5">
                <Search
                  size={15}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-ink-4'}`}
                />
                <input
                  type="text"
                  placeholder={activeTab === 'interests' ? 'Search interests...' : 'Search people by name, interest, or bio...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-full text-[13px] outline-none transition-all ${
                    isDark
                      ? 'bg-white/8 border border-white/12 text-white placeholder:text-white/35 focus:border-white/24 focus:bg-white/12'
                      : 'bg-surface-0 border border-rule text-ink-1 placeholder:text-ink-4 focus:border-warm/30 focus:bg-white'
                  }`}
                />
              </div>

              {/* Tab pills */}
              <div className="flex items-center gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setActiveInterest(null); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? isDark
                          ? 'bg-warm text-surface-0'
                          : 'bg-warm text-white'
                        : isDark
                          ? 'bg-white/8 text-white/65 hover:bg-white/14 hover:text-white/85'
                          : 'bg-surface-0 text-ink-3 hover:bg-surface-2 hover:text-ink-1'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Interest Feed View ─── */}
        {showingInterestFeed && (
          <InterestFeedView
            interestName={activeInterest === '__all__' ? null : activeInterest}
            isDark={isDark}
            onBack={() => setActiveInterest(null)}
            bandClassName={bandClassName}
          />
        )}

        {/* ─── Interests Grid Tab ─── */}
        {activeTab === 'interests' && !showingInterestFeed && (
          <>
            {/* Your interests */}
            {filteredInterests.filter(i => currentUser.interests.includes(i.name)).length > 0 && (
              <section className={bandClassName}>
                <div className="flex items-end justify-between gap-4 pb-3 mb-5 border-b border-rule-faint">
                  <div>
                    <h2 className={`text-[20px] font-semibold tracking-[-0.03em] ${isDark ? 'text-white' : 'text-ink-1'}`}>
                      Your Interests
                    </h2>
                    <p className={`text-[12px] mt-1 ${isDark ? 'text-white/65' : 'text-ink-2'}`}>
                      The subjects you're already following. These shape your stream.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveInterest('__all__')}
                    className={`flex-shrink-0 text-[12px] font-medium px-3.5 py-1.5 rounded-full transition-all ${
                      isDark
                        ? 'text-warm hover:bg-warm/10'
                        : 'text-warm hover:bg-warm-surface'
                    }`}
                  >
                    View all content
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {filteredInterests
                    .filter(i => currentUser.interests.includes(i.name))
                    .map(interest => (
                      <InterestCard
                        key={interest.name}
                        interest={interest}
                        isDark={isDark}
                        onClick={() => setActiveInterest(interest.name)}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Discover new interests */}
            {filteredInterests.filter(i => !currentUser.interests.includes(i.name)).length > 0 && (
              <section className={bandClassName}>
                <div className="flex items-end justify-between gap-4 pb-3 mb-5 border-b border-rule-faint">
                  <div>
                    <h2 className={`text-[20px] font-semibold tracking-[-0.03em] ${isDark ? 'text-white' : 'text-ink-1'}`}>
                      Discover
                    </h2>
                    <p className={`text-[12px] mt-1 ${isDark ? 'text-white/65' : 'text-ink-2'}`}>
                      Interests you might want to explore. Follow to see related content in your stream.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {filteredInterests
                    .filter(i => !currentUser.interests.includes(i.name))
                    .map(interest => (
                      <InterestCard
                        key={interest.name}
                        interest={interest}
                        isDark={isDark}
                        onClick={() => setActiveInterest(interest.name)}
                      />
                    ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ─── People Tab ─── */}
        {activeTab === 'people' && (
          <>
            {/* Recommended — carousel with rich cards */}
            <section className={bandClassName}>
              <HorizontalCarousel
                title="Recommended for You"
                tone="default"
                description="Based on shared interests and mutual connections. People whose thinking might resonate with yours."
              >
                {recommendedPeople.map(({ user, mutuals }) => (
                  <div key={user.id} style={{ scrollSnapAlign: 'start' }}>
                    <PersonCard user={user} isDark={isDark} mutuals={mutuals} />
                  </div>
                ))}
              </HorizontalCarousel>
            </section>

            {/* Thoughtful Voices — broader recommendations */}
            <section className={bandClassName}>
              <div className="flex items-end justify-between gap-4 pb-3 mb-5 border-b border-rule-faint">
                <div>
                  <h2 className={`text-[20px] font-semibold tracking-[-0.03em] ${isDark ? 'text-white' : 'text-ink-1'}`}>
                    Thoughtful Voices
                  </h2>
                  <p className={`text-[12px] mt-1 ${isDark ? 'text-white/65' : 'text-ink-2'}`}>
                    People whose shared content consistently resonates across the community.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recommendedPeople.slice(0, 8).map(({ user, mutuals }) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all duration-200 ${
                      isDark
                        ? 'border border-white/8 bg-surface-1/60 hover:border-white/16'
                        : 'border border-rule-faint bg-surface-1/80 hover:border-rule'
                    }`}
                  >
                    <AvatarCircle user={user} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-[14px] font-semibold leading-tight group-hover:text-warm transition-colors ${isDark ? 'text-white' : 'text-ink-1'}`}>
                        {user.displayName}
                      </h3>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/50' : 'text-ink-4'}`}>
                        @{user.username}{user.location ? ` · ${user.location}` : ''}
                      </p>
                      <p className={`text-[12px] mt-1 leading-[1.45] line-clamp-1 ${isDark ? 'text-white/65' : 'text-ink-2'}`}>
                        {user.bio}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {mutuals.length > 0 ? (
                          <div className={`flex items-center gap-1 ${isDark ? 'text-white/45' : 'text-ink-4'}`}>
                            <div className="flex -space-x-1.5">
                              {mutuals.slice(0, 2).map(m => (
                                <div key={m.id} className="ring-1 ring-surface-1 rounded-full">
                                  <AvatarCircle user={m} size="sm" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px]">
                              {mutuals.length === 1
                                ? `${mutuals[0].displayName} in common`
                                : `${mutuals.length} in common`}
                            </span>
                          </div>
                        ) : (
                          user.interests.slice(0, 2).map(interest => (
                            <span
                              key={interest}
                              className={`text-[9px] px-2 py-0.5 rounded-full ${
                                isDark
                                  ? 'bg-warm-surface text-white/65'
                                  : 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_58%,white)] text-[color:color-mix(in_srgb,var(--color-warm)_52%,var(--color-ink-2))]'
                              }`}
                            >
                              {interest}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                        isDark
                          ? 'border border-white/16 text-white/72 hover:border-warm hover:text-warm'
                          : 'border border-rule text-ink-3 hover:border-warm hover:text-warm'
                      }`}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
