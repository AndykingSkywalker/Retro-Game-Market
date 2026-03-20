"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.8-4.3-9.2-8.3C1 9.8 2.2 6.3 5.4 5.3c2.1-.7 4.2.1 5.6 2 1.4-1.9 3.5-2.7 5.6-2 3.2 1 4.4 4.5 2.6 7.4C18.8 16.7 12 21 12 21z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v5h5" />
      <path d="M12 7v6l4 2" />
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function linkClass(isActive: boolean): string {
  return isActive
    ? "ui-button"
    : "ui-button-secondary";
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, cart, wishlist, signOut, isCartOpen, setIsCartOpen } = useStore();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.items.length ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const profileImage = user?.profilePicture ?? null;
  const profileInitial = user?.username?.trim().charAt(0).toUpperCase() || "N/A";

  // Close all menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      {/* Skip to main content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3">
        {/* Left: Logo + desktop nav links */}
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="ui-button shrink-0 inline-flex items-center gap-2">
            <StoreIcon />
            <span className="hidden sm:inline">Retro Game Market</span>
            <span className="sm:hidden">RGM</span>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
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
        </div>

        {/* Right: Basket + desktop auth + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Basket — always visible */}
          <button
            type="button"
            onClick={() => {
              setIsCartOpen(!isCartOpen);
              setIsMobileMenuOpen(false);
            }}
            aria-label={`${isCartOpen ? "Close" : "Open"} basket with ${itemCount} items`}
            aria-expanded={isCartOpen}
            aria-controls="basket-drawer"
            className="ui-button-secondary inline-flex items-center gap-2"
          >
            <BasketIcon />
            <span className="hidden sm:inline">Basket</span>
            <span>({itemCount})</span>
          </button>

          {/* Desktop auth — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
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
                  className={`ui-card ui-popover absolute right-0 top-12 z-[70] w-56 p-2 shadow-lg ${
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
                    Edit Profile
                  </Link>
                  <Link
                    href="/profile/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                  >
                    <HeartIcon />
                    Wishlist ({wishlistCount})
                  </Link>
                  <Link
                    href="/profile/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                  >
                    <HistoryIcon />
                    Order History
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                      router.push("/");
                    }}
                    className="ui-button-secondary mt-1 inline-flex w-full items-center gap-2"
                    aria-label="Log out"
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              </div>
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

          {/* Hamburger button — visible only on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            className="md:hidden ui-button-secondary inline-flex h-10 w-10 items-center justify-center px-0"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {isMobileMenuOpen ? (
        <nav
          id="mobile-nav-menu"
          className="md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur px-4 pb-4 pt-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${linkClass(pathname === link.href)} flex w-full items-center gap-2`}
            >
              {navIcon(link.label)}
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${linkClass(pathname === "/admin")} flex w-full items-center gap-2`}
            >
              <AdminIcon />
              Admin
            </Link>
          ) : null}

          <div className="border-t border-zinc-200 pt-3 mt-2 space-y-1">
            {user ? (
              <>
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {user.username}
                </p>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ui-button-secondary flex w-full items-center gap-2"
                >
                  <UserIcon />
                  Edit Profile
                </Link>
                <Link
                  href="/profile/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ui-button-secondary flex w-full items-center gap-2"
                >
                  <HeartIcon />
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ui-button-secondary flex w-full items-center gap-2"
                >
                  <HistoryIcon />
                  Order History
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                    router.push("/");
                  }}
                  className="ui-button-secondary flex w-full items-center gap-2"
                  aria-label="Log out"
                >
                  <LogoutIcon />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${linkClass(pathname === "/login")} flex w-full items-center gap-2`}
                >
                  <LoginIcon />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${linkClass(pathname === "/register")} flex w-full items-center gap-2`}
                >
                  <SignUpIcon />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
