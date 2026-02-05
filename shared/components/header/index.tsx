"use client";

import Link from "next/link";
import LogoDynamic from "@/shared/components/logo-dynamic";
import MobileNav from "@/shared/components/header/mobile-nav";
import DesktopNav from "@/shared/components/header/desktop-nav";
import { Suspense } from "react";
import LanguageSwitcher from "./language-switcher";
import { usePathname } from "next/navigation";

const baseNavItems = [
  {
    key: "Home",
    href: "/",
    target: false,
    label: {it:"Home", en:"Home"}
  },
  {
    key: "Blog",
    href: "/blog",
    target: false,
    label: {it:"Blog", en:"Blog"}
  },
  {
    key: "About",
    href: "/about",
    target: false,
    label: {it:"About", en:"About"}
  },
];

function withEnPrefix(pathname: string) {
  if (pathname === "/") return "/en/";
  if (pathname.startsWith("/en/") || pathname === "/en") return pathname;
  return `/en${pathname}`;
}

export default function Header() {
  // Recupera il pathname lato client per reagire ai cambi di navigazione
  const pathname = usePathname() || "/";

  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  
  const navItems = baseNavItems.map((item) => ({
    key: item.key,
    target: item.target,
    href: item.target ? item.href : isEn ? withEnPrefix(item.href) : item.href,
    label: isEn ? item.label.en : item.label.it,
  }));
  const logoHref = isEn ? "/en/" : "/";

  return (
    <header className="sticky top-0 w-full border-border/40 bg-background/95 z-50">
      <div className="container flex items-center justify-between h-14">
        <Link
          href={logoHref}
          aria-label="Home page"
          className="flex items-center h-14 min-w-[100px] max-w-[180px] xl:max-w-[220px] overflow-visible">
          <LogoDynamic
            style={{
              maxHeight: 48,
              width: "auto",
              height: "100%",
              objectFit: "contain",
            }}
            className="w-full h-full"
          />
        </Link>
        <div className="hidden xl:flex gap-7 items-center justify-between">
          <DesktopNav navItems={navItems} />
          <Suspense fallback={<div className="h-8 w-10" />}>
            <LanguageSwitcher />
          </Suspense>
        </div>
        <div className="flex items-center xl:hidden">
          <Suspense fallback={<div className="h-8 w-10" />}>
            <LanguageSwitcher />
          </Suspense>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
