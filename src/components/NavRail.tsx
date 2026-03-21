import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Bell, MessageCircle, Home, Radio, Library, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCaptureOpen, notificationsOpen, setNotificationsOpen, messagesOpen, setMessagesOpen } = useApp();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-[220px] h-screen flex flex-col border-r border-rule bg-surface-1 flex-shrink-0 select-none">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-lg bg-warm flex items-center justify-center text-white text-[13px] font-semibold tracking-tight">L</span>
          <span className="text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">Lumity</span>
        </button>
      </div>

      {/* Capture */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setCaptureOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-0 hover:bg-surface-2 text-ink-2 hover:text-ink-1 transition-colors text-[13px] font-medium"
        >
          <Plus size={16} strokeWidth={2} />
          <span>Capture</span>
          <span className="ml-auto text-[11px] text-ink-4 font-normal">N</span>
        </button>
      </div>

      {/* Main Nav */}
      <div className="px-4 flex-1">
        <div className="mb-2 px-3 text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em]">Navigate</div>
        <NavLink icon={Home} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
        <NavLink icon={Radio} label="Stream" active={isActive('/stream')} onClick={() => navigate('/stream')} />
        <NavLink icon={Library} label="Mind" active={isActive('/mind')} onClick={() => navigate('/mind')} />
        <NavLink icon={User} label="Profile" active={isActive('/self')} onClick={() => navigate('/self')} />
      </div>

      {/* System */}
      <div className="px-4 pb-6">
        <div className="border-t border-rule-faint pt-4">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setMessagesOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors ${
              notificationsOpen ? 'bg-surface-2 text-ink-1' : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
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
              messagesOpen ? 'bg-surface-2 text-ink-1' : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
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

function NavLink({ icon: Icon, label, active, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors mb-[2px] ${
        active
          ? 'bg-surface-2 text-ink-1 font-medium'
          : 'text-ink-3 hover:text-ink-2 hover:bg-surface-0'
      }`}
    >
      <Icon size={15} strokeWidth={1.8} />
      {label}
    </button>
  );
}
