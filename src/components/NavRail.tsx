import { useLocation, useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { PenSquare, Bell, MessageCircle, Home, Radio, Library, User, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const lumityHomeRailStyle = {
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
  background: 'radial-gradient(circle at 14% 10%, color-mix(in srgb, var(--color-warm) 4%, transparent) 0%, transparent 22%), linear-gradient(180deg, #ffffff, var(--color-surface-0))',
} as CSSProperties;

const lumityHomeShareStyle = {
  background: 'linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--color-surface-2) 58%, white))',
  borderColor: 'color-mix(in srgb, var(--color-warm) 12%, var(--color-rule))',
  color: 'var(--color-ink-1)',
  boxShadow: '0 8px 24px rgba(18, 28, 24, 0.05)',
} as CSSProperties;

const lumityHomeShareHoverStyle = {
  background: 'linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--color-warm-surface) 24%, white))',
  borderColor: 'color-mix(in srgb, var(--color-warm) 20%, var(--color-rule))',
} as CSSProperties;

const lumityHomeActiveNavStyle = {
  background: 'linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--color-warm-surface) 24%, white))',
  color: 'var(--color-ink-1)',
  borderColor: 'color-mix(in srgb, var(--color-warm) 12%, var(--color-rule))',
  boxShadow: '0 6px 18px rgba(18, 28, 24, 0.05)',
} as CSSProperties;

const lumityHomeHoverNavStyle = {
  background: 'color-mix(in srgb, var(--color-warm-surface) 16%, white)',
} as CSSProperties;

export default function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setCaptureOpen, notificationsOpen, setNotificationsOpen, messagesOpen, setMessagesOpen } = useApp();
  const isMidnight = theme === 'midnight' || theme === 'navy' || theme === 'indigo';
  const isStone = theme === 'stone';
  const isLumity = theme === 'lumity';
  const isLumityHome = isLumity && location.pathname === '/';
  const actionButtonBaseClassName = 'w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl border transition-colors';
  const isActive = (path: string) => location.pathname === path;
  const railClassName = isMidnight
    ? 'w-[220px] h-screen flex flex-col border-r border-rule flex-shrink-0 select-none bg-surface-1'
    : isStone
      ? 'w-[220px] h-screen flex flex-col border-r border-rule flex-shrink-0 select-none bg-[radial-gradient(circle_at_14%_10%,color-mix(in_srgb,var(--color-warm)_10%,transparent)_0%,transparent_24%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-1)_94%,white),var(--color-surface-0))]'
      : 'w-[220px] h-screen flex flex-col border-r border-rule flex-shrink-0 select-none bg-[radial-gradient(circle_at_14%_10%,color-mix(in_srgb,var(--color-warm)_8%,transparent)_0%,transparent_24%),radial-gradient(circle_at_90%_0%,color-mix(in_srgb,var(--color-surface-3)_20%,transparent)_0%,transparent_20%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-1)_94%,white),var(--color-surface-0))]';
  const brandBadgeClassName = isLumityHome || isLumity
    ? 'w-7 h-7 rounded-lg bg-[linear-gradient(135deg,var(--color-warm),color-mix(in_srgb,var(--color-warm)_78%,black))] flex items-center justify-center text-white text-[13px] font-semibold tracking-tight shadow-[0_8px_20px_color-mix(in_srgb,var(--color-warm)_18%,transparent)]'
    : 'w-7 h-7 rounded-lg bg-[linear-gradient(135deg,var(--color-warm),color-mix(in_srgb,var(--color-warm)_70%,white))] flex items-center justify-center text-white text-[13px] font-semibold tracking-tight shadow-[0_8px_20px_color-mix(in_srgb,var(--color-warm)_22%,transparent)]';
  const shareButtonClassName = isLumityHome || isLumity
    ? `${actionButtonBaseClassName} bg-[color:color-mix(in_srgb,var(--color-warm-surface)_46%,white)] text-ink-1 border-[color:color-mix(in_srgb,var(--color-warm)_14%,var(--color-rule))] hover:bg-[color:color-mix(in_srgb,var(--color-warm-surface)_62%,white)] hover:border-[color:color-mix(in_srgb,var(--color-warm)_28%,var(--color-rule))]`
    : 'w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl bg-[color:color-mix(in_srgb,var(--color-warm-surface)_42%,white)] text-ink-1 border border-[color:color-mix(in_srgb,var(--color-warm)_12%,var(--color-rule))] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-warm-surface)_58%,white)] hover:border-[color:color-mix(in_srgb,var(--color-warm)_24%,var(--color-rule))]';
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Radio, label: 'Stream', path: '/stream' },
    { icon: Library, label: 'Mind', path: '/mind' },
    { icon: User, label: 'Profile', path: '/self' },
  ];

  return (
    <nav className={railClassName} style={isLumityHome ? lumityHomeRailStyle : undefined}>
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
          <span className={brandBadgeClassName}>
            L
          </span>
          <span className="text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">Lumity</span>
        </button>
      </div>

      {/* Composer */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setCaptureOpen(true)}
          className={shareButtonClassName}
          style={isLumityHome ? lumityHomeShareStyle : undefined}
          onMouseEnter={event => {
            if (isLumityHome) Object.assign(event.currentTarget.style, lumityHomeShareHoverStyle);
          }}
          onMouseLeave={event => {
            if (isLumityHome) Object.assign(event.currentTarget.style, lumityHomeShareStyle);
          }}
        >
          <PenSquare size={15} strokeWidth={1.9} />
          <span className="font-medium text-[13px]">Share</span>
          <span className="ml-auto text-[11px] text-ink-4">N</span>
        </button>
      </div>

      {/* Main Nav */}
      <div className="px-4 flex-1">
        <div className="mb-2 px-3 text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em]">
          Navigate
        </div>
        {navItems.map(item => (
              <NavLink
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={isActive(item.path)}
                isMidnight={isMidnight}
                isLumityHome={isLumityHome}
                onClick={() => navigate(item.path)}
              />
        ))}
      </div>

      {/* System */}
      <div className="px-4 pb-6">
        <div className="border-t border-rule-faint pt-4">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setMessagesOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors ${
              notificationsOpen
                ? isMidnight
                  ? 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-warm-surface)_92%,var(--color-surface-1)),color-mix(in_srgb,var(--color-surface-2)_78%,var(--color-warm-surface)))] text-ink-1 ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_26%,transparent)] shadow-[0_10px_24px_color-mix(in_srgb,var(--color-warm)_14%,transparent)]'
                  : 'bg-white text-ink-1 ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] shadow-[0_6px_18px_color-mix(in_srgb,var(--color-warm)_10%,transparent)]'
                : isMidnight
                  ? 'text-ink-3 hover:text-ink-1 hover:bg-surface-2/72'
                  : 'text-ink-3 hover:text-ink-2 hover:bg-white'
            }`}
          >
            <div className="relative">
              <Bell size={15} strokeWidth={1.8} />
              <span className="absolute -top-[2px] -right-[2px] w-[6px] h-[6px] bg-warm rounded-full" />
            </div>
            <span>Notifications</span>
          </button>
          <button
            onClick={() => { setMessagesOpen(!messagesOpen); setNotificationsOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors ${
              messagesOpen
                ? isMidnight
                  ? 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-warm-surface)_92%,var(--color-surface-1)),color-mix(in_srgb,var(--color-surface-2)_78%,var(--color-warm-surface)))] text-ink-1 ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_26%,transparent)] shadow-[0_10px_24px_color-mix(in_srgb,var(--color-warm)_14%,transparent)]'
                  : 'bg-white text-ink-1 ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] shadow-[0_6px_18px_color-mix(in_srgb,var(--color-warm)_10%,transparent)]'
                : isMidnight
                  ? 'text-ink-3 hover:text-ink-1 hover:bg-surface-2/72'
                  : 'text-ink-3 hover:text-ink-2 hover:bg-white'
            }`}
          >
            <MessageCircle size={15} strokeWidth={1.8} />
            <span>Messages</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ icon: Icon, label, active, isMidnight, isLumityHome, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; active: boolean; isMidnight: boolean; isLumityHome: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors mb-[2px] ${
        active
          ? isMidnight
            ? 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-warm-surface)_100%,var(--color-surface-1)),color-mix(in_srgb,var(--color-surface-2)_84%,var(--color-warm-surface)))] text-ink-1 font-medium ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_24%,transparent)] shadow-[0_6px_16px_color-mix(in_srgb,var(--color-warm)_10%,transparent)]'
            : isLumityHome
              ? 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_42%,white)] text-ink-1 font-medium ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] shadow-[0_6px_18px_color-mix(in_srgb,var(--color-warm)_8%,transparent)]'
              : 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_36%,white)] text-ink-1 font-medium ring-1 ring-[color:color-mix(in_srgb,var(--color-warm)_18%,transparent)] shadow-[0_6px_18px_color-mix(in_srgb,var(--color-warm)_8%,transparent)]'
          : isMidnight
            ? 'text-ink-3 hover:text-ink-1 hover:bg-surface-2/72'
            : isLumityHome
              ? 'text-ink-3 hover:text-ink-2 hover:bg-[color:color-mix(in_srgb,var(--color-warm-surface)_28%,white)]'
              : 'text-ink-3 hover:text-ink-2 hover:bg-[color:color-mix(in_srgb,var(--color-warm-surface)_22%,white)]'
      }`}
      style={isLumityHome ? (active ? lumityHomeActiveNavStyle : undefined) : undefined}
      onMouseEnter={event => {
        if (isLumityHome && !active) Object.assign(event.currentTarget.style, lumityHomeHoverNavStyle);
      }}
      onMouseLeave={event => {
        if (!isLumityHome || active) return;
        event.currentTarget.style.background = '';
      }}
    >
      <Icon size={15} strokeWidth={1.8} />
      {label}
    </button>
  );
}
