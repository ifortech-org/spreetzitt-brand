import Link from "next/link";
import LogoDynamic from "@/shared/components/logo-dynamic";
// import { usePathname } from "next/navigation";
import { headers } from "next/headers";

const navItems = [
  {
    label: "Home",
    href: "/",
    target: false,
  },
  {
    label: "Blog",
    href: "/blog",
    target: false,
  },
  {
    label: "About",
    href: "/about",
    target: false,
  },
];

export default async function Footer() {
  // Recupera il pathname lato client, ma essendo un componente lato server non è necessario
  // const pathname = usePathname() || "/";

  // Recupera il pathname lato server dal pathname
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || "/";

  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer>
      <div className="dark:bg-background p-5 xl:p-5 dark:text-gray-300">
        <Link
          className="block w-[6.25rem] mx-auto"
          href={isEn ? "/en" : "/"}
          aria-label="Home page">
          <LogoDynamic />
        </Link>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-7 text-primary">
          {navItems.map((navItem) => (
            <Link
              key={navItem.label}
              href={isEn ? `/en${navItem.href}` : navItem.href}
              target={navItem.target ? "_blank" : undefined}
              rel={navItem.target ? "noopener noreferrer" : undefined}
              className="transition-colors hover:text-foreground/80 text-foreground/60 text-sm">
              {navItem.label}
            </Link>
          ))}
        </div>
        {isEn 
          ? (
            <div className="mt-8 flex flex-col gap-4 justify-center text-center lg:mt-5 text-xs border-t pt-8">
              <p className="text-xs font-thin">Spreetzit is a division of iFortech srl</p>
              <p className="text-xs font-thin">SHARE CAPITAL € 40.000,00 FULLY PAID - VAT & TAX ID: 07927140967 - REA: MI-1991600</p>
              <p className="text-xs font-thin">REGISTERED OFFICE: VIA PORDENONE 35 COLOGNO MONZESE - 20093 (MI)</p>
              <p className="text-foreground/60">
                &copy; {getCurrentYear()}&nbsp;iFortech. All rights reserved.
              </p>
            </div>
          )
          : (
            <div className="mt-8 flex flex-col gap-4 justify-center text-center lg:mt-5 text-xs border-t pt-8">
              <p className="text-xs font-thin">Spreetzit è un marchio iFortech srl</p>
              <p className="text-xs font-thin">CAP. SOC. € 40.000,00 I.V. - P.IVA E CF: 07927140967 - REA: MI-1991600</p>
              <p className="text-xs font-thin">SEDE LEGALE: VIA PORDENONE 35 COLOGNO MONZESE - 20093 (MI)</p>
              <p className="text-foreground/60">
                &copy; {getCurrentYear()}&nbsp;iFortech. All rights reserved.
              </p>
            </div>
          )
        }
      </div>
    </footer>
  );
}
