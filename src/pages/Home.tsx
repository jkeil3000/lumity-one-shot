import { useNavigate } from 'react-router-dom';
import { BookOpen, Flame, TrendingUp, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  currentUser,
  consumptionStats,
  quietPrompts,
  themeCards,
  getFriendActivity,
  getRecommendations,
  getRecentlySaved,
  getEditorialPicks,
} from '../data/mock';
import ContentCard from '../components/cards/ContentCard';
import HorizontalCarousel from '../components/cards/HorizontalCarousel';
import StatCard from '../components/cards/StatCard';
import PromptCard from '../components/cards/PromptCard';
import SectionHeader from '../components/cards/SectionHeader';

export default function Home() {
  const { setSelectedItem, setCaptureOpen } = useApp();
  const navigate = useNavigate();

  const friendActivity = getFriendActivity();
  const recommendations = getRecommendations();
  const recentlySaved = getRecentlySaved();
  const editorialPicks = getEditorialPicks();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[960px] mx-auto px-8 py-8">

        {/* Your thinking lately */}
        <div className="bg-warm-surface/60 border border-warm/10 rounded-xl p-6 mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[20px] font-semibold text-ink-1 tracking-[-0.02em] mb-1">
                Your thinking lately
              </h1>
              <p className="text-[13px] text-ink-3">A quick orientation to your recent arc.</p>
            </div>
            <button
              onClick={() => navigate('/self')}
              className="text-[12px] text-ink-4 hover:text-warm transition-colors"
            >
              View profile
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {consumptionStats.topInterests.map(i => (
              <span key={i.name} className="text-[11px] bg-surface-1 text-ink-2 px-2.5 py-1 rounded-full border border-rule-faint">
                {i.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatCard icon={BookOpen} value={consumptionStats.itemsThisWeek} label="items this week" />
            <StatCard icon={Flame} value={`${consumptionStats.streak} days`} label="streak" />
            <StatCard icon={TrendingUp} value={currentUser.interests.length} label="active interests" />
            <StatCard icon={Layers} value={currentUser.savesSharedCount} label="shared" />
          </div>
        </div>

        {/* Your Queue */}
        {recentlySaved.length > 0 && (
          <div className="mb-10">
            <HorizontalCarousel title="Your Queue" action="View library" onAction={() => navigate('/mind')}>
              {recentlySaved.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </div>
        )}

        {/* From Friends */}
        {friendActivity.length > 0 && (
          <div className="mb-10">
            <HorizontalCarousel title="From Friends" action="See all" onAction={() => navigate('/stream')}>
              {friendActivity.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </div>
        )}

        {/* Explore by Theme */}
        <div className="mb-10">
          <SectionHeader title="Explore by Theme" action="View all" onAction={() => navigate('/stream')} />
          <div className="grid grid-cols-4 gap-3">
            {themeCards.map(theme => (
              <button
                key={theme.id}
                onClick={() => navigate('/stream', { state: { lens: theme.name } })}
                className="relative h-[100px] rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={theme.thumbnail}
                  alt={theme.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink-1/40 group-hover:bg-ink-1/50 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[13px] font-semibold text-white">{theme.name}</span>
                  <span className="text-[10px] text-white/70 mt-0.5">{theme.itemCount} items</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Picks */}
        {editorialPicks.length > 0 && (
          <div className="mb-10">
            <HorizontalCarousel title="Editorial Picks">
              {editorialPicks.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </div>
        )}

        {/* Quiet Prompts */}
        <div className="mb-10">
          <SectionHeader title="Quiet Prompts" />
          <p className="text-[12px] text-ink-4 -mt-3 mb-4">Prompts for reflection-first posting.</p>
          <div className="flex gap-3">
            {quietPrompts.slice(0, 3).map(prompt => (
              <PromptCard
                key={prompt.id}
                text={prompt.text}
                onClick={() => setCaptureOpen(true)}
              />
            ))}
          </div>
        </div>

        {/* Suggested for You */}
        {recommendations.length > 0 && (
          <div className="mb-10">
            <HorizontalCarousel title="Suggested for You">
              {recommendations.map(item => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <ContentCard item={item} size="medium" onClick={() => setSelectedItem(item)} />
                </div>
              ))}
            </HorizontalCarousel>
          </div>
        )}
      </div>
    </div>
  );
}
