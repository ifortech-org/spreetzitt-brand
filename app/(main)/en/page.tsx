import Blocks from "@/shared/components/blocks";
import { fetchSanityPageBySlug } from "@/shared/sanity/lib/fetch";
import { generatePageMetadata } from "@/shared/sanity/lib/metadata";
import MissingSanityPage from "@/shared/components/ui/missing-sanity-page";

export async function generateMetadata() {
  const page = await fetchSanityPageBySlug({ slug: "en" });

  return generatePageMetadata({ page, slug: "en" });
}

export default async function EnHomePage() {
  const page = await fetchSanityPageBySlug({ slug: "en" });

  if (!page) {
    return MissingSanityPage({ document: "page", slug: "en" });
  }

  return <Blocks blocks={page?.blocks ?? []} />;
}