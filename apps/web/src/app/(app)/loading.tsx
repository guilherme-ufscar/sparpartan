export default function Carregando() {
  return (
    <div className="space-y-gutter" aria-busy="true" aria-label="Carregando">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="grid grid-cols-2 gap-gutter sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-surface-container-high" />
    </div>
  );
}
