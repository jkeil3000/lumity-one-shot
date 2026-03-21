import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const conversations = [
  { id: 'm1', name: 'Mara Chen', preview: 'Have you read the new Anthropic paper?', time: '1h', initial: 'M' },
  { id: 'm2', name: 'Jakob Reyes', preview: 'That tools for thought thread was great', time: '3h', initial: 'J' },
  { id: 'm3', name: 'Deep Work Studio', preview: "We'd love to feature your collection", time: '1d', initial: 'D' },
];

export default function MessagesPanel() {
  const { messagesOpen, setMessagesOpen } = useApp();
  if (!messagesOpen) return null;

  return (
    <div className="absolute left-[220px] top-0 w-[320px] h-screen bg-surface-1 border-r border-rule z-40 flex flex-col anim-fade-in">
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-rule-faint flex-shrink-0">
        <span className="text-[13px] font-medium text-ink-1">Messages</span>
        <button onClick={() => setMessagesOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-2 text-ink-4">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3 border-b border-rule-faint hover:bg-surface-0 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-medium text-ink-3 flex-shrink-0">{c.initial}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-1">{c.name}</span>
                <span className="text-[11px] text-ink-4">{c.time}</span>
              </div>
              <p className="text-[12px] text-ink-3 truncate">{c.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
