export default function Loading() {
  return (
    <div className="page-container animate-pulse" aria-busy="true" aria-label="Cargando productos">
      <div className="mt-6 h-3 w-40 bg-soft-mist" />
      <div className="mt-12 h-10 w-64 bg-soft-mist" />
      <div className="mt-10 h-12 bg-soft-mist" />
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[3/4] bg-soft-mist" />
        ))}
      </div>
    </div>
  )
}
