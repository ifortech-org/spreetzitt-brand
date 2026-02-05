import SectionContainer from "@/shared/components/ui/section-container";

import { stegaClean } from "next-sanity";
import { fetchSanityPosts } from "@/shared/sanity/lib/fetch";
import { PAGE_QUERYResult } from "@/sanity.types";
import CategoryFilter from "@/shared/components/category-filter";
import { Category } from "@/shared/types";
import { headers } from "next/headers";

import PostList from "../post-list";
import React from "react";

type AllPostsProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number],
  { _type: "all-posts" }
>;

export default async function AllPosts({
  padding,
  colorVariant,
}: AllPostsProps) {
  const color = stegaClean(colorVariant);
  const posts = await fetchSanityPosts();
  
  // Rilevamento della lingua dal pathname
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const isEn = pathname === '/en' || pathname.startsWith('/en/');

  const categories: Category[] = posts
    .flatMap((post) => post?.categories ?? [])
    .map((category) => ({
      title: category.title ?? "",
      slug: "",
    }));

  return (
    <SectionContainer color={color} padding={padding}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <div className="border-t border-b mb-4 py-2 flex justify-between items-center">
          <h1 className="font-semibold text-xl self-center">{isEn ? "Latest News" : "Ultime notizie"}</h1>

          <CategoryFilter categories={categories} isEn={isEn} />
        </div>

        <PostList posts={posts} />
      </React.Suspense>
    </SectionContainer>
  );
}
