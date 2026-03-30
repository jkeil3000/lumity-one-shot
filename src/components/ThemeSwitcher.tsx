import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useTheme, themes, type ThemeId } from '../context/ThemeContext';

const themeAccents: Record<ThemeId, string> = {
  lumity: '#274336',
  midnight: '#8BC7B4',
  navy: '#7AA2D6',
  indigo: '#8A7AE6',
  stone: '#476A5B',
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open && (
        <>
          <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-14 right-0 w-[280px] bg-surface-1 border border-rule rounded-xl shadow-2xl p-4 anim-scale-in z-[61]">
            <div className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.06em] mb-3">
              Themes
            </div>
            <div className="space-y-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    theme === t.id
                      ? 'bg-surface-2 ring-1 ring-warm/30'
                      : 'hover:bg-surface-0'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-surface-1"
                    style={{
                      background: themeAccents[t.id],
                      borderColor: theme === t.id ? themeAccents[t.id] : 'transparent',
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink-1">{t.name}</div>
                    <div className="text-[11px] text-ink-4 leading-tight">{t.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-warm text-white flex items-center justify-center shadow-lg hover:bg-warm-hover transition-colors"
        title="Switch theme"
      >
        <Palette size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
