"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/StoreProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Checkout" },
];

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10h18l-1 10H4L3 10z" />
      <path d="M5 10V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
      <path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3 7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
      <path d="M14 17 19 12 14 7" />
      <path d="M19 12H7" />
    </svg>
  );
}

function SignUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="4" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

function linkClass(isActive: boolean): string {
  return isActive
    ? "ui-button"
    : "ui-button-secondary";
}

export default function NavBar() {
  const pathname = usePathname();
  const { user, cart, signOut, setIsCartOpen } = useStore();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const profileImage = user?.profilePicture ?? null;
  const profileInitial = user?.username?.trim().charAt(0).toUpperCase() || "N/A";

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      window.addEventListener("mousedown", onPointerDown);
    }

    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isMenuOpen]);

  function navIcon(label: string) {
    if (label === "Home") return <HomeIcon />;
    if (label === "Products") return <ProductsIcon />;
    return <BasketIcon />;
  }

  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="ui-button mr-3 inline-flex items-center gap-2">
            <StoreIcon />
            Retro Game Market
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkClass(pathname === link.href)} inline-flex items-center gap-2`}
            >
              {navIcon(link.label)}
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className={`${linkClass(pathname === "/admin")} inline-flex items-center gap-2`}
            >
              <AdminIcon />
              Admin
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open basket with ${itemCount} items`}
            className="ui-button-secondary inline-flex items-center gap-2"
          >
            <BasketIcon />
            Basket ({itemCount})
          </button>

          {user ? (
            <>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((previous) => !previous)}
                  className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition-transform duration-150 hover:scale-105"
                  aria-label="Open profile menu"
                  aria-expanded={isMenuOpen}
                >
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{profileInitial}</span>
                  )}
                </button>

                <div
                  className={`ui-card ui-popover absolute right-0 top-12 z-20 w-56 p-2 shadow-lg ${
                    isMenuOpen ? "ui-popover-open" : "ui-popover-closed"
                  }`}
                >
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide ui-muted">
                      {user.username}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                    >
                      <UserIcon />
                      Access Settings
                    </Link>
                    <Link
                      href="/profile#preferences"
                      onClick={() => setIsMenuOpen(false)}
                      className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                    >
                      <ProductsIcon />
                      Preferences
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                      aria-label="Log out"
                    >
                      <LogoutIcon />
                      Logout
                    </button>
                  </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`${linkClass(pathname === "/login")} inline-flex items-center gap-2`}
              >
                <LoginIcon />
                Login
              </Link>
              <Link
                href="/register"
                className={`${linkClass(pathname === "/register")} inline-flex items-center gap-2`}
              >
                <SignUpIcon />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

