"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
// import { ChevronDownIcon } from "@radix-ui/react-icons";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const EN_PREFIX = "/en";

function normalizePathname(pathname: string) {
  if (pathname === EN_PREFIX) return "/";
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

function withEnPrefix(pathname: string) {
  if (pathname === "/") return "/en/";
  if (pathname.startsWith(`${EN_PREFIX}/`) || pathname === EN_PREFIX) return pathname;
  return `${EN_PREFIX}${pathname}`;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const currentLang = useMemo(() => {
    return pathname.startsWith(`${EN_PREFIX}/`) || pathname === EN_PREFIX
      ? "en"
      : "it";
  }, [pathname]);

  const handleChange = (nextLang: "it" | "en") => {
    if (nextLang === currentLang) return;

    const basePath =
      nextLang === "en" ? withEnPrefix(pathname) : normalizePathname(pathname);
    const query = searchParams?.toString();
    const nextPath = query ? `${basePath}?${query}` : basePath;
    router.push(nextPath);
  };

  const triggerLabel = currentLang === "en" ? "EN" : "IT";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-2 text-sm text-foreground/70 hover:text-foreground border border-transparent hover:border-border/60"
        >
          <span className="mr-1">{triggerLabel}</span>
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange("it")}>IT</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("en")}>EN</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
