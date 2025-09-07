"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/useAuth";
import { signInWithRedirect } from "aws-amplify/auth";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("color-theme");
    const shouldDark = stored ? stored === "dark" : prefersDark;
    setIsDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  useEffect(() => {
    function onBackdropClick(e: MouseEvent) {
      if (e.target instanceof HTMLElement && e.target.id === "mobile-menu") {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("click", onBackdropClick);
    return () => window.removeEventListener("click", onBackdropClick);
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      if (isMobileOpen) {
        // trigger slide in
        requestAnimationFrame(() => {
          panelRef.current?.classList.remove("translate-x-full");
        });
      } else {
        panelRef.current.classList.add("translate-x-full");
      }
    }
  }, [isMobileOpen]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("color-theme", next ? "dark" : "light");
  }

  const handleSignIn = async () => {
    try {
      // This will redirect the user to the Cognito Hosted UI
      await signInWithRedirect();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };


  return (
    <>
      <header className="dark:bg-gray-900 bg-white py-4 px-8 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link className="navbar-item" href="/">
            {/* Replace with actual logo path when available */}
            <Image src="/ESB-Logo-yellow.png" alt="Elite Sports Bets Logo" width={120} height={32} />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="dark:text-gray-300 hover:text-primary">Home</Link>
            <Link href="/picks" className="dark:text-gray-300 hover:text-primary">Picks</Link>
            <Link href="/scorecard" className="dark:text-gray-300 hover:text-primary">Scorecard</Link>
            {isAuthenticated && (
              <Link href="/#packages" className="dark:text-gray-300 hover:text-primary">Packages</Link>
            )}

            {isAuthenticated && user?.role && (user?.role.includes('ADMIN') || user?.role.includes('SUPERADMIN')) && (
              <Link href="/admin" className="py-2 px-3 hover:text-primary">Admin</Link>
            )}

            {!isAuthenticated && (
              <>
                <Link href="/signup" className="bg-primary text-black font-bold py-2 px-4 rounded-lg">Sign Up</Link>
                <button onClick={handleSignIn} className="bg-primary text-black font-bold py-2 px-4 rounded-lg">Sign In</button>
              </>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => setUserOpen((v) => !v)} className="dark:text-gray-300 hover:text-primary">{user?.email || 'Account'}</button>
                {userOpen && (
                  <div className="absolute mt-2 right-0 w-56 card p-2 z-50">
                    <div className="flex flex-col">
                      <Link href="/account" className="py-2 px-3 hover:text-primary">Your Account</Link>
                      {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <Link href="/purchasehistory" className="py-2 px-3 hover:text-primary">Purchase History</Link>
                      )}
                      <Link href="/signout" className="py-2 px-3 hover:text-primary">Sign Out</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center">
            <button
              aria-label="Open mobile menu"
              onClick={() => setIsMobileOpen(true)}
              className="mr-2 focus:outline-none"
            >
              <svg className="w-7 h-7 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button aria-label="Toggle theme" onClick={toggleTheme} className="mr-2">
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-1.414a1 1 0 01-.707.293h-1a1 1 0 110-2h1a1 1 0 01.707.293l.001.001zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM3.05 13.464l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414zM17 10a1 1 0 01-.293.707l-.001.001a1 1 0 11-1.414-1.414l.001-.001.707-.707A1 1 0 0117 10zM4.536 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 10-1.414 1.414z"></path></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <nav id="mobile-menu" className={`md:hidden fixed top-0 right-0 w-full h-full bg-black bg-opacity-80 z-50 ${isMobileOpen ? "flex" : "hidden"} justify-end`}>
        <div ref={panelRef} className="bg-white dark:bg-gray-900 w-11/12 max-w-xs h-full p-8 shadow-lg flex flex-col transform translate-x-full transition-transform duration-300">
          <button aria-label="Close mobile menu" onClick={() => setIsMobileOpen(false)} className="self-end mb-8 focus:outline-none">
            <svg className="w-7 h-7 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <Link href="/" className="mb-4 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Home</Link>
          <Link href="/picks" className="mb-4 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Picks</Link>
          <Link href="/scorecard" className="mb-4 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Scorecard</Link>
          {isAuthenticated && (
            <Link href="/#packages" className="mb-4 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Packages</Link>
          )}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin') && (
            <>
              <Link href="/admin" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Admin Dashboard</Link>
              <Link href="/admin/sports" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Manage Sports</Link>
              <Link href="/admin/teams" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Manage Teams</Link>
              <Link href="/admin/picks" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Manage Picks</Link>
              <Link href="/admin/users" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Manage Users</Link>
              <Link href="/admin/packages" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Manage Packages</Link>
              <Link href="/admin/purchasehistory" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>View Purchase History</Link>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link href="/signup" className="mb-4 bg-primary text-black font-bold py-2 px-4 rounded-lg text-center" onClick={() => setIsMobileOpen(false)}>Sign Up</Link>
              <Link href="/signin" className="mb-4 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Sign In</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link href="/account" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Your Account</Link>
              {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                <Link href="/purchasehistory" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Purchase History</Link>
              )}
              <Link href="/signout" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Sign Out</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}


