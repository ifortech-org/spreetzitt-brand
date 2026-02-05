import Blocks from "@/shared/components/blocks";
import {
  fetchSanityPageBySlug,
  fetchSanityPagesStaticParams,
} from "@/shared/sanity/lib/fetch";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/shared/sanity/lib/metadata";

export async function generateStaticParams() {
  const pages = await fetchSanityPagesStaticParams();

  return pages.map((page) => ({
    slug: page.slug?.current ? page.slug.current.split('/') : [],
  }));
}

// Permetti di generare pagine non presenti in generateStaticParams on-demand
export const dynamicParams = true;

// Forza rendering dinamico per pagine non pre-generate
export const dynamic = 'auto';

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || '';
  const page = await fetchSanityPageBySlug({ slug: slugString });

  if (!page) {
    notFound();
  }

  return generatePageMetadata({ page, slug: slugString });
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || '';
  const page = await fetchSanityPageBySlug({ slug: slugString });

  if (!page) {
    notFound();
  }

  return <Blocks blocks={page?.blocks ?? []} />;
}
