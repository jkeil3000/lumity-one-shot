import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StreakModal() {
  const { streakOpen, setStreakOpen, restoreStreakDay, streakSummary } = useApp();

  if (!streakOpen) return null;

  const close = () => setStreakOpen(false);
  const {
    currentStreak,
    longestStreak,
    calendarDays,
    graceEligibleDateKey,
    monthLabel,
  } = streakSummary;

  return (
    <div className="fixed inset-0 z-[62] flex items-start justify-center pt-[11vh]">
      <div className="absolute inset-0 bg-ink-1/12 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-[560px] rounded-[22px] border border-rule bg-surface-1 shadow-2xl anim-scale-in overflow-hidden">
        <button
          onClick={close}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 text-ink-4 hover:text-ink-2 transition-colors"
        >
          <X size={15} />
        </button>

        <div className="px-6 pt-6 pb-5 border-b border-rule-faint">
          <div className="text-[11px] uppercase tracking-[0.08em] text-ink-4 mb-2">Streak</div>
          <div className="flex items-end gap-8">
            <div>
              <div className="text-[34px] font-semibold tracking-[-0.05em] text-ink-1 leading-none">
                {currentStreak}
              </div>
              <div className="text-[12px] text-ink-3 mt-2">current days in a row</div>
            </div>
            <div className="pb-0.5">
              <div className="text-[21px] font-semibold tracking-[-0.03em] text-ink-1 leading-none">
                {longestStreak}
              </div>
              <div className="text-[12px] text-ink-3 mt-2">longest stretch</div>
            </div>
          </div>
          <p className="text-[13px] text-ink-2 leading-[1.6] mt-4 max-w-[440px]">
            A day counts when you save, share, write, or meaningfully interact. Opening the app
            without doing anything does not keep the streak alive.
          </p>
        </div>

        <div className="px-6 py-5">
          {graceEligibleDateKey && (
            <div className="mb-5 rounded-[16px] border border-[color:color-mix(in_srgb,var(--color-warm)_16%,var(--color-rule))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-warm-surface)_34%,white),var(--color-surface-1))] p-4">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[color:color-mix(in_srgb,var(--color-warm)_64%,var(--color-ink-3))] mb-1">
                Grace Day
              </div>
              <p className="text-[14px] text-ink-1 leading-[1.5] mb-3">
                Did you learn something new yesterday?
              </p>
              <button
                onClick={() => restoreStreakDay(graceEligibleDateKey)}
                className="px-3.5 py-2 rounded-lg bg-warm text-white text-[12px] font-medium hover:bg-warm-hover transition-colors"
              >
                Yes, keep my streak
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-medium text-ink-1">{monthLabel}</div>
            <div className="text-[12px] text-ink-4">Your active days this month</div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[10px] uppercase tracking-[0.08em] text-ink-4 px-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => (
              <div
                key={day.key}
                className={`h-14 rounded-[14px] border px-2 py-1.5 flex flex-col justify-between ${
                  day.isComplete
                    ? 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_62%,white)] border-[color:color-mix(in_srgb,var(--color-warm)_18%,var(--color-rule))]'
                    : day.isGraceEligible
                      ? 'bg-[color:color-mix(in_srgb,var(--color-warm-surface)_28%,white)] border-dashed border-[color:color-mix(in_srgb,var(--color-warm)_18%,var(--color-rule))]'
                      : 'bg-surface-1 border-rule-faint'
                } ${day.isCurrentMonth ? '' : 'opacity-45'}`}
              >
                <span className={`text-[11px] ${day.isToday ? 'text-warm font-semibold' : 'text-ink-3'}`}>
                  {day.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  day.isComplete
                    ? 'bg-warm'
                    : day.isGraceEligible
                      ? 'bg-[color:color-mix(in_srgb,var(--color-warm)_44%,white)]'
                      : 'bg-transparent'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
