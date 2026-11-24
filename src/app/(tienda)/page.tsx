import { Fragment } from "react"

import { bestSellersFirst } from "@/lib/catalog"
import { getCatalog } from "@/lib/data/catalog"
import { getHomeSections } from "@/lib/data/home"
import type { HomeSection } from "@/lib/home"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { CategoryStrip } from "@/components/home/category-strip"
import { BestSellers } from "@/components/home/best-sellers"
import { OffersStrip } from "@/components/home/offers-strip"
import { VolumePricing } from "@/components/home/volume-pricing"
import { EditorialSplit } from "@/components/home/editorial-split"
import { Benefits } from "@/components/home/benefits"
import { BannerSection } from "@/components/home/banner-section"
import { ProductsSection } from "@/components/home/products-section"
import { TextSection } from "@/components/home/text-section"

/** La portada se arma con los bloques que la marca ordena y edita en /admin/inicio */
export default async function HomePage() {
  const [{ products, categories, setsCategory }, sections] = await Promise.all([getCatalog(), getHomeSections()])
  const sellable = products.filter((p) => p.kind !== "oferta")

  const render = (section: HomeSection) => {
    switch (section.type) {
      case "HERO":
        return <HeroCarousel slides={section.data.slides ?? []} />
      case "CATEGORIES":
        return <CategoryStrip section={section} sections={[...categories, setsCategory]} />
      case "BEST_SELLERS":
        return <BestSellers section={section} products={bestSellersFirst(sellable)} />
      case "OFFERS":
        return <OffersStrip section={section} offers={products.filter((p) => p.kind === "oferta")} />
      case "VOLUME_PRICING":
        return <VolumePricing section={section} products={products} />
      case "SETS":
        return <EditorialSplit section={section} sets={products.filter((p) => p.kind === "conjunto")} />
      case "BENEFITS":
        return <Benefits section={section} />
      case "BANNER":
        return <BannerSection section={section} />
      case "PRODUCTS":
        return <ProductsSection section={section} products={products} />
      case "TEXT":
        return <TextSection section={section} />
    }
  }

  return (
    <>
      {sections.map((s) => (
        <Fragment key={s.id}>{render(s)}</Fragment>
      ))}
    </>
  )
}
