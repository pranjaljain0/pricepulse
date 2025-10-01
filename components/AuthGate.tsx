"use client";

import { useEffect, useState } from "react";

import { usePathname } from 'next/navigation'
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    const pathname = usePathname()

    useEffect(() => {
        // Allow unauthenticated access to login/create-user pages
        if (pathname === '/login' || pathname === '/create-user') {
            setChecked(true)
            return
        }
        ; (async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (res.status === 401) {
                    router.push('/login')
                    return
                }
                // If OK, proceed
            } catch {
                router.push('/login')
                return
            }
            setChecked(true)
        })()
    }, [router, pathname])

    if (!checked) return null;
    return <>{children}</>;
}
