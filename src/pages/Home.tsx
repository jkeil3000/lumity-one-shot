import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  consumptionStats,
  getEditorialPicks,
  getFriendActivity,
  getRecommendations,
  getRecentlySaved,
} from '../data/mock';

import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';

const homePaletteLight = {
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

const homePaletteDark = {
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

const homePaletteNavy = {
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

const homePaletteIndigo = {
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

function SummaryMetric({
  value,
  label,
  note,
  onClick,
  inverse,
}: {
  value: string | number;
  label: string;
  note: string;
  onClick?: () => void;
  inverse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[16px] p-3.5 text-left ${
        inverse
          ? `border border-white/12 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_46%,var(--home-page-deep)),color-mix(in_srgb,var(--home-page-deep)_84%,black))] ${
              onClick ? 'cursor-pointer transition-colors hover:border-white/22 hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_58%,var(--home-page-deep)),color-mix(in_srgb,var(--home-page-deep)_72%,black))]' : ''
            }`
          : `border border-rule-faint bg-surface-1/92 ${
              onClick ? 'cursor-pointer transition-colors hover:border-[color:color-mix(in_srgb,var(--color-warm)_20%,var(--color-rule))] hover:bg-[color:color-mix(in_srgb,var(--color-warm-surface)_24%,white)]' : ''
            }`
      }`}
      disabled={!onClick}
    >
      <div className={`text-[22px] leading-none tracking-[-0.04em] font-semibold ${inverse ? 'text-white' : 'text-ink-1'}`}>{value}</div>
      <div className={`text-[11px] uppercase tracking-[0.08em] mt-2 ${inverse ? 'text-white/62' : 'text-ink-3'}`}>{label}</div>
      <p className={`text-[11px] mt-1.5 leading-[1.45] ${inverse ? 'text-white/76' : 'text-ink-2'}`}>{note}</p>
    </button>
  );
}

export default function Home() {
  const { setSelectedItem, library, streakSummary, setStreakOpen } = useApp();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkHome = theme === 'midnight' || theme === 'navy' || theme === 'indigo';

  const friendActivity = getFriendActivity();
  const recommendations = getRecommendations();
  const recentlySaved = getRecentlySaved();
  const editorialPicks = getEditorialPicks();
  const ourRecommendations = [...editorialPicks, ...recommendations];

  const queueBook = recentlySaved.find(item => item.type === 'book');
  const queueItems = queueBook
    ? [queueBook, ...recentlySaved.filter(item => item.id !== queueBook.id)]
    : recentlySaved;

  const topInterests = consumptionStats.topInterests.map(interest => interest.name);
  const [firstInterest, secondInterest] = topInterests;
  const leadingType = [...consumptionStats.recentTypes].sort((a, b) => b.count - a.count)[0];
  const inProgressCount = library.filter(item => item.state === 'in-progress').length;
  const addedThisWeekNote = leadingType
    ? `${leadingType.count} ${leadingType.type}${leadingType.count > 1 ? 's' : ''} led the mix this week.`
    : 'Recent saves and notes added back into focus.';
  const streakNote = streakSummary.graceEligibleDateKey
    ? 'Yesterday can still be recovered.'
    : 'A steady rhythm matters here more than volume.';

  const homePalette = theme === 'midnight'
    ? homePaletteDark
    : theme === 'navy'
      ? homePaletteNavy
      : theme === 'indigo'
        ? homePaletteIndigo
      : homePaletteLight;
  const homeBackground = isDarkHome
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
  const bandClassName = isDarkHome
    ? 'mb-8 rounded-[24px] border border-rule bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_36%,var(--color-surface-1)),var(--color-surface-1))] px-5 py-5 shadow-[0_18px_36px_color-mix(in_srgb,var(--home-page-deep)_20%,transparent)]'
    : 'mb-8 rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-warm)_10%,var(--color-rule))] bg-[linear-gradient(180deg,#ffffff,color-mix(in_srgb,var(--color-surface-2)_56%,white))] px-5 py-5 shadow-[0_8px_28px_rgba(18,28,24,0.05)]';
  const summarySectionClassName = isDarkHome
    ? 'panel-glow bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_36%,var(--color-surface-1)),var(--color-surface-1))] border border-rule rounded-[24px] p-5 mb-8 overflow-hidden relative shadow-[0_18px_36px_color-mix(in_srgb,var(--home-page-deep)_20%,transparent)]'
    : 'panel-glow bg-[linear-gradient(180deg,#ffffff,color-mix(in_srgb,var(--color-surface-2)_42%,white))] border border-[color:color-mix(in_srgb,var(--color-warm)_10%,var(--color-rule))] rounded-[24px] p-5 mb-8 overflow-hidden relative shadow-[0_10px_30px_rgba(18,28,24,0.055)]';
  const summaryLineClassName = isDarkHome
    ? 'absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-warm)_34%,transparent),color-mix(in_srgb,var(--home-tertiary)_24%,transparent),transparent)]'
    : 'absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-warm)_18%,white),color-mix(in_srgb,var(--color-surface-3)_54%,white),transparent)]';
  const summaryGlowClassName = isDarkHome
    ? 'absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[color:color-mix(in_srgb,var(--color-warm-surface)_18%,transparent)] blur-3xl'
    : 'absolute -top-14 -right-8 h-36 w-36 rounded-full bg-[color:color-mix(in_srgb,var(--color-warm)_5%,transparent)] blur-3xl';
  const summaryTextTone = isDarkHome ? 'text-white' : 'text-ink-1';
  const summarySubtleTone = isDarkHome ? 'text-white/58' : 'text-[color:color-mix(in_srgb,var(--color-warm)_58%,var(--color-ink-3))]';
  const summaryBodyTone = isDarkHome ? 'text-white/78' : 'text-ink-2';
  const summaryButtonClassName = isDarkHome
    ? 'flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] bg-surface-1 px-4 py-2 text-[12px] font-medium text-white hover:text-warm hover:border-[color:color-mix(in_srgb,var(--color-warm)_34%,transparent)] transition-all duration-200 flex-shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_0_10px_color-mix(in_srgb,var(--color-warm)_8%,transparent)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_16px_color-mix(in_srgb,var(--color-warm)_14%,transparent)]'
    : 'flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-warm)_26%,var(--color-rule))] bg-warm px-4 py-2 text-[12px] font-medium text-white hover:bg-warm-hover transition-all duration-200 flex-shrink-0 shadow-[0_0_0_1px_rgba(39,67,54,0.02),0_0_10px_color-mix(in_srgb,var(--color-warm)_8%,transparent)] hover:shadow-[0_0_0_1px_rgba(39,67,54,0.04),0_0_16px_color-mix(in_srgb,var(--color-warm)_14%,transparent)]';
  const pillClassName = isDarkHome
    ? 'text-[11px] text-[var(--home-page-deep)] px-3 py-1 rounded-full bg-[color:color-mix(in_srgb,var(--color-warm-surface)_42%,white)] border border-transparent'
    : 'text-[11px] text-white px-3 py-1 rounded-full bg-[linear-gradient(180deg,var(--color-warm),color-mix(in_srgb,var(--color-warm)_84%,black))] border border-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] shadow-[0_10px_20px_color-mix(in_srgb,var(--color-warm)_12%,transparent)]';

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        ...homePalette,
        ['--home-post-pill-bg' as string]: isDarkHome
          ? 'color-mix(in srgb, var(--color-warm-surface) 42%, white)'
          : 'linear-gradient(180deg,var(--color-warm),color-mix(in srgb,var(--color-warm) 84%,black))',
        ['--home-post-pill-fg' as string]: isDarkHome ? '#173528' : '#ffffff',
        background: homeBackground,
      }}
    >
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        <section className={summarySectionClassName}>
          <div className={`${summaryLineClassName} pointer-events-none`} />
          <div className={`${summaryGlowClassName} pointer-events-none`} />
          <div className="relative z-10 flex items-start justify-between gap-5 mb-4">
            <div className="max-w-[620px]">
              <div className={`text-[10px] uppercase tracking-[0.12em] mb-2 ${summarySubtleTone}`}>
                Home
              </div>
              <h1 className={`font-reading text-[30px] leading-[1.08] tracking-[-0.04em] mb-2 ${summaryTextTone}`}>
                Your thinking lately
              </h1>
              <p className={`text-[13px] leading-[1.6] max-w-[540px] ${summaryBodyTone}`}>
                You have been circling around {firstInterest} and {secondInterest}, with a steady
                mix of saved pieces still in motion.
              </p>
            </div>
            <button
              onClick={() => navigate('/mind')}
              className={summaryButtonClassName}
            >
              Open library
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 mb-4 flex-wrap">
            {topInterests.map(name => (
              <span
                key={name}
                className={pillClassName}
              >
                {name}
              </span>
            ))}
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-3">
            <SummaryMetric
              value={`${streakSummary.currentStreak} days`}
              label="streak"
              note={streakNote}
              onClick={() => setStreakOpen(true)}
              inverse={isDarkHome}
            />
            <SummaryMetric
              value={consumptionStats.itemsThisWeek}
              label="added this week"
              note={addedThisWeekNote}
              inverse={isDarkHome}
            />
            <SummaryMetric
              value={topInterests.length}
              label="active interests"
              note="The subjects you have been returning to most."
              inverse={isDarkHome}
            />
            <SummaryMetric
              value={inProgressCount}
              label="in progress"
              note="Pieces still open in your queue instead of already settled."
              inverse={isDarkHome}
            />
          </div>
        </section>

        {queueItems.length > 0 && (
          <section className={bandClassName}>
            <HorizontalCarousel
              title="Your Queue"
              tone="default"
              description={
                queueBook
                  ? `Pick up where you left off. ${queueBook.title} is a good read on how book posts sit inside the home surface.`
                  : 'Pick up where you left off across books, articles, podcasts, and notes.'
              }
              action="View library"
              onAction={() => navigate('/mind')}
            >
              {queueItems.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {friendActivity.length > 0 && (
          <section className={bandClassName}>
            <HorizontalCarousel
              title="From Friends"
              tone="default"
              description="Signals from people you already trust, closer to a room recommendation than a public feed."
              action="See all"
              onAction={() => navigate('/stream')}
            >
              {friendActivity.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {ourRecommendations.length > 0 && (
          <section className={bandClassName}>
            <HorizontalCarousel
              title="Our Recommendations"
              tone="default"
              description="A broader layer of curation from the community and editorial picks, meant to widen the aperture a bit."
            >
              {ourRecommendations.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </section>
        )}
      </div>
    </div>
  );
}
