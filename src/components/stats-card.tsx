export function StatsCard({
  label,
  value,
  trend,
  tone = 'blue',
}: {
  label: string;
  value: string;
  trend: string;
  tone?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  return (
    <article className={`stats-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}
