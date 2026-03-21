import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const notifications = [
  { id: 'n1', text: 'Mara Chen liked your save "Against Productivity"', time: '2h ago' },
  { id: 'n2', text: 'Jakob Reyes replied to "The Garden and the Stream"', time: '5h ago' },
  { id: 'n3', text: 'Sophie Kwon started following you', time: '1d ago' },
  { id: 'n4', text: 'Your save "How Buildings Learn" was liked 12 times', time: '2d ago' },
];

export default function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useApp();
  if (!notificationsOpen) return null;

  return (
    <div className="absolute left-[220px] top-0 w-[320px] h-screen bg-surface-1 border-r border-rule z-40 flex flex-col anim-fade-in">
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-rule-faint flex-shrink-0">
        <span className="text-[13px] font-medium text-ink-1">Notifications</span>
        <button onClick={() => setNotificationsOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-2 text-ink-4">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} className="px-5 py-3 border-b border-rule-faint hover:bg-surface-0 transition-colors cursor-pointer">
            <p className="text-[13px] text-ink-2 leading-[1.45]">{n.text}</p>
            <span className="text-[11px] text-ink-4 mt-1 block">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
