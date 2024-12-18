"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { UserButton } from "./shared/user-button";
import { useCallback, useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

const navItems: { name: string; href: string; requiresAuth?: boolean }[] = [
  { name: "Dashboard", href: "/dashboard", requiresAuth: true },
  { name: "Pricing", href: "/pricing" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function Header() {
  const pathname = usePathname();

  // State to track if the user is logged in
  //const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, isLoading } = useCurrentUser();

  /**
   * Check if the user is logged in
   */
  const isLoggedIn = !!user && !isLoading;


  return (
    <header className="sticky px-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-5xl flex h-16 items-center">
        <Link href={"/"} className="mr-6 flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={101} height={20} />
        </Link>
        <nav className="ml-auto hidden md:flex items-center space-x-7 text-sm font-medium">
          {navItems
            .filter((item) => !item.requiresAuth || isLoggedIn) // Filter items based on authentication
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
        </nav>
        <div className="ml-4">
          <UserButton />
        </div>
      </div>
    </header>


  );
}

/*<header className="sticky px-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={"/"} className="mr-6 flex items-center space-x-2">
            LOGO
          </Link>
          <nav className="flex items-center space-x-7 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <UserButton />
      </div>
    </header>*/
