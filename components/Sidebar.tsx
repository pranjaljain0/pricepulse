"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { usePathname } from 'next/navigation'

const menuItems = [
    { name: "Bank Accounts", href: "bankaccounts" },
    { name: "GST Information", href: "gst" },
    { name: "Contacts", href: "contacts" }
];

const extraItems = [
    { name: 'Profile', href: 'profile' }
]

export default function Sidebar() {
    const pathname = usePathname()
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
        if (stored === "light" || stored === "dark") {
            setTheme(stored);
        } else {
            setTheme("dark");
        }
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (!res.ok) {
                    setUsername(null)
                    return
                }
                const data = await res.json().catch(() => null)
                if (data && data.username) setUsername(data.username)
                else setUsername(null)
            } catch {
                setUsername(null)
            }
        })()
    }, [])

    if (pathname === '/login' || pathname === '/create-user') return null

    async function logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        } catch {
            // ignore
        }
        window.location.href = '/login'
    }

    return (
        <aside className="bg-card border border-border rounded-lg p-4 shadow-sm md:sticky md:top-0 md:box-border ">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <Image src="/next.svg" alt="logo" width={28} height={6} className="dark:invert" />
                </div>
                <div>
                    <p className="text-sm font-semibold">PricePulse</p>
                    <p className="text-xs text-muted-foreground">Analytics</p>
                </div>
            </div>

            {/* Mobile accordion toggle */}
            <div className="md:hidden mb-4">
                <button className="w-full text-left px-2 py-2 rounded-md border" onClick={() => setMobileOpen((s) => !s)}>
                    Menu {mobileOpen ? '▲' : '▾'}
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="text-sm text-muted-foreground">Theme</div>
                <button
                    aria-label="Toggle theme"
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
                >
                    {theme === "dark" ? (
                        <>
                            <span>Dark</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span>Light</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            <nav className={`flex flex-col gap-1 ${mobileOpen ? 'block' : 'hidden'} md:block`}>
                {/* <a className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="#overview">Overview</a> */}
                {menuItems.map((item) => (
                    <a key={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        href={item.href}>{item.name}</a>
                ))}
                {extraItems.map((item) => (
                    <a key={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href={item.href}>{item.name}</a>
                ))}
            </nav>

            <div className={`mt-6 border-t border-border pt-4 ${mobileOpen ? 'block' : 'hidden'} md:block`}>
                <div className="mt-2">
                    {username ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">{username}</div>
                                <div className="text-xs text-muted-foreground">Signed in</div>
                            </div>
                            <button onClick={logout} className="text-sm rounded border px-2 py-1">Logout</button>
                        </div>
                    ) : (
                        <a className="text-sm rounded border px-2 py-1 inline-block" href="/login">Sign in</a>
                    )}
                </div>
            </div>
        </aside>
    );
}
