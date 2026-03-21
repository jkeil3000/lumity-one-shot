interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
}

export default function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 bg-surface-1 border border-rule-faint rounded-xl px-4 py-3 min-w-[140px]">
      <div className="w-8 h-8 rounded-lg bg-warm-surface flex items-center justify-center">
        <Icon size={16} className="text-warm" />
      </div>
      <div>
        <div className="text-[17px] font-semibold text-ink-1 leading-none">{value}</div>
        <div className="text-[11px] text-ink-4 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
