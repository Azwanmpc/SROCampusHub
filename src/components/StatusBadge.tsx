export default function StatusBadge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}
