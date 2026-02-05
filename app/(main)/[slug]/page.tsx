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
    slug: page.slug?.current,
  }));
}

// Permetti di generare pagine non presenti in generateStaticParams on-demand
export const dynamicParams = true;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = await fetchSanityPageBySlug({ slug: params.slug });

  if (!page) {
    notFound();
  }

  return generatePageMetadata({ page, slug: params.slug });
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = await fetchSanityPageBySlug({ slug: params.slug });

  if (!page) {
    notFound();
  }

  return <Blocks blocks={page?.blocks ?? []} />;
}
