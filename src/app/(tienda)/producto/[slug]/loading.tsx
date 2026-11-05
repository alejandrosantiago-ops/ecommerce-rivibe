export default function Loading() {
  return (
    <div className="page-container animate-pulse" aria-busy="true" aria-label="Cargando producto">
      <div className="mt-6 h-3 w-48 bg-soft-mist" />
      <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-16">
        <div className="aspect-[3/4] bg-soft-mist md:col-span-7" />
        <div className="space-y-4 md:col-span-5">
          <div className="h-3 w-32 bg-soft-mist" />
          <div className="h-8 w-3/4 bg-soft-mist" />
          <div className="h-6 w-24 bg-soft-mist" />
          <div className="h-16 bg-soft-mist" />
          <div className="h-11 bg-soft-mist" />
          <div className="h-12 bg-soft-mist" />
        </div>
      </div>
    </div>
  )
}
