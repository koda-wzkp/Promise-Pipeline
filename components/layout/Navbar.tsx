"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-accent to-sky-medium flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">P</span>
              </div>
              <span className="font-serif font-semibold text-lg text-gray-900">
                Promise Pipeline
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/demo/hb2021">HB 2021</NavLink>
            <NavLink href="/demo/jcpoa">JCPOA</NavLink>
            <NavLink href="/personal">Promise Garden</NavLink>
            <NavLink href="/team">Teams</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <MobileNavLink href="/demo/hb2021" onClick={() => setMobileOpen(false)}>HB 2021</MobileNavLink>
            <MobileNavLink href="/demo/jcpoa" onClick={() => setMobileOpen(false)}>JCPOA</MobileNavLink>
            <MobileNavLink href="/personal" onClick={() => setMobileOpen(false)}>Promise Garden</MobileNavLink>
            <MobileNavLink href="/team" onClick={() => setMobileOpen(false)}>Teams</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
