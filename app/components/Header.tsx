"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useMe } from "../lib/useMe";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, authStatus } = useAuthenticator((c) => [c.user, c.authStatus]);
  const isAuthenticated = authStatus === 'authenticated';
  const { user: meUser } = useMe();
  const pathname = usePathname();
  const [hash, setHash] = useState<string>("");
  const isAdmin = (() => {
    const r = meUser?.roles;
    if (!r) return false;
    try {
      const arr = JSON.parse(r);
      return Array.isArray(arr) && (arr.includes('ADMIN') || arr.includes('SUPERADMIN'));
    } catch {
      return r.includes('ADMIN') || r.includes('SUPERADMIN');
    }
  })();

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

  useEffect(() => {
    function handleDocumentMouseDown(e: MouseEvent) {
      if (!userOpen) return;
      const container = userMenuRef.current;
      if (container && e.target instanceof Node && !container.contains(e.target)) {
        setUserOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setIsMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userOpen]);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash || "");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActivePath = (path: string) => {
    if (!pathname) return false;
    if (path === "/") return pathname === "/" && (!hash || hash === "");
    return pathname.startsWith(path);
  };

  const isActivePackages = () => pathname === "/" && hash === "#packages";

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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
            <Link href="/" className={`${isActivePath('/') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Home</Link>

            {isAuthenticated && (
              <>
                <Link href="/picks" className={`${isActivePath('/picks') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Picks</Link>
                <Link href="/scorecard" className={`${isActivePath('/scorecard') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Scorecard</Link>
                <Link href="/#packages" className={`${isActivePackages() ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Packages</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link href="/add-picks" className={`${isActivePath('/add-picks') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Add Picks</Link>
                <Link href="/edit-picks" className={`${isActivePath('/edit-picks') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Edit Picks</Link>
                <Link href="/admin" className={`${isActivePath('/admin') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`}>Admin</Link>
              </>
            )}

            {!isAuthenticated && (
              <>
                <button onClick={handleSignIn} className="bg-primary text-black font-bold py-2 px-4 rounded-lg">Sign Up</button>
                <button onClick={handleSignIn} className="bg-primary text-black font-bold py-2 px-4 rounded-lg">Sign In</button>
              </>
            )}

            {isAuthenticated && (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserOpen((v) => !v)} className="dark:text-gray-300 hover:text-primary cursor-pointer">{(user as unknown as { signInDetails?: { loginId?: string } })?.signInDetails?.loginId || 'Account'}</button>
                {userOpen && (
                  <div className="absolute mt-2 right-0 w-56 card p-2 z-50">
                    <div className="flex flex-col">
                      <Link href="/account" className="py-2 px-3 hover:text-primary">Your Account</Link>
                      {true && (
                        <Link href="/purchasehistory" className="py-2 px-3 hover:text-primary">Purchase History</Link>
                      )}
                      <button onClick={handleSignOut} className="py-2 px-3 text-left hover:text-primary">Sign Out</button>
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
          <Link href="/" className={`mb-4 ${isActivePath('/') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`} onClick={() => setIsMobileOpen(false)}>Home</Link>
          <Link href="/picks" className={`mb-4 ${isActivePath('/picks') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`} onClick={() => setIsMobileOpen(false)}>Picks</Link>
          <Link href="/scorecard" className={`mb-4 ${isActivePath('/scorecard') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`} onClick={() => setIsMobileOpen(false)}>Scorecard</Link>
          {isAuthenticated && (
            <Link href="/#packages" className={`mb-4 ${isActivePackages() ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`} onClick={() => setIsMobileOpen(false)}>Packages</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={`mb-4 ${isActivePath('/admin') ? 'text-primary' : 'dark:text-gray-300'} hover:text-primary`} onClick={() => setIsMobileOpen(false)}>Admin</Link>
          )}
          {!isAuthenticated && (
            <>
              <button className="mb-4 bg-primary text-black font-bold py-2 px-4 rounded-lg text-center" onClick={() => { setIsMobileOpen(false); handleSignIn(); }}>Sign Up</button>
              <button className="mb-4 bg-primary text-black font-bold py-2 px-4 rounded-lg text-center" onClick={() => { setIsMobileOpen(false); handleSignIn(); }}>Sign In</button>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link href="/account" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Your Account</Link>
              {true && (
                <Link href="/purchasehistory" className="mb-2 dark:text-gray-300 hover:text-primary" onClick={() => setIsMobileOpen(false)}>Purchase History</Link>
              )}
              <button onClick={handleSignOut} className="mb-2 text-left dark:text-gray-300 hover:text-primary">Sign Out</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}


