"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Check auth on client side via localStorage
        const user = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
        if (!user) {
            router.push('/login');
        } else {
            // if first-login flag present, redirect to create-user
            const first = localStorage.getItem('isFirstLogin');
            if (first === 'true') {
                router.push('/create-user');
            }
        }
        setChecked(true);
    }, [router]);

    if (!checked) return null;
    return <>{children}</>;
}
