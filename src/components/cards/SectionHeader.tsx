export default function SectionHeader({ title, action, onAction }: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-semibold text-ink-1 tracking-[-0.01em]">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-[12px] text-ink-4 hover:text-warm transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
