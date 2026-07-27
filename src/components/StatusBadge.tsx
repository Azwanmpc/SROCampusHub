export default function StatusBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span className={`inline-block whitespace-nowrap px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] ${colorClass}`}>
      {label}
    </span>
  );
}
