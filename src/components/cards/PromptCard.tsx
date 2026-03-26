interface PromptCardProps {
  text: string;
  cta?: string;
  onClick: () => void;
}

export default function PromptCard({ text, cta = 'Write a note', onClick }: PromptCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 bg-warm-surface border border-warm/10 rounded-xl px-5 py-5 text-left hover:border-warm/25 transition-colors group min-w-[200px]"
    >
      <p className="font-reading text-[14px] text-ink-1 leading-[1.55] mb-3 italic">
        {text}
      </p>
      <span className="text-[11px] text-warm font-medium group-hover:underline">
        {cta}
      </span>
    </button>
  );
}
