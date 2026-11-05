import { bestSellersFirst } from "@/lib/catalog"
import { getCatalog } from "@/lib/data/catalog"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { CategoryStrip } from "@/components/home/category-strip"
import { BestSellers } from "@/components/home/best-sellers"
import { OffersStrip } from "@/components/home/offers-strip"
import { VolumePricing } from "@/components/home/volume-pricing"
import { EditorialSplit } from "@/components/home/editorial-split"
import { Benefits } from "@/components/home/benefits"

export default async function HomePage() {
  const { products, categories, setsCategory } = await getCatalog()
  const sellable = products.filter((p) => p.kind !== "oferta")

  return (
    <>
      <HeroCarousel />
      <CategoryStrip sections={[...categories, setsCategory]} />
      <BestSellers products={bestSellersFirst(sellable)} />
      <OffersStrip offers={products.filter((p) => p.kind === "oferta")} />
      <VolumePricing products={products} />
      <EditorialSplit sets={products.filter((p) => p.kind === "conjunto")} />
      <Benefits />
    </>
  )
}
