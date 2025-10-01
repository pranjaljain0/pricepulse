"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    async function submit() {
        setError('')
        try {
            const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: user, password: pass }) })
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                setError((data && (data.error || data.message)) || 'Invalid credentials')
                return
            }
            // server sets HttpOnly cookie; redirect to home
            router.push('/')
        } catch {
            setError('Network error')
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-sm bg-card border p-6 rounded">
                <h2 className="text-lg font-semibold mb-4 text-center">Sign in</h2>
                <label className="text-sm">Username</label>
                <input className="border rounded w-full mb-2 px-2 py-1" value={user} onChange={(e) => setUser(e.target.value)} />
                <label className="text-sm">Password</label>
                <input type="password" className="border rounded w-full mb-2 px-2 py-1" value={pass} onChange={(e) => setPass(e.target.value)} />
                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="flex gap-2 mt-4 justify-center">
                    <button onClick={submit} className="rounded bg-foreground text-background px-3 py-1">Sign in</button>
                </div>
            </div>
        </div>
    );
}
