import { site } from "@/lib/site"

export function AnnouncementBar() {
  return (
    <div className="flex h-(--announcement-h) items-center justify-center bg-carbon-ink px-4 text-center text-white">
      <p className="text-micro font-normal uppercase tracking-label">{site.announcement}</p>
    </div>
  )
}
