"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateUserPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');

    async function submit() {
        if (!username || !password) {
            setError('Please provide username and password')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match')
            return
        }
        const users = JSON.parse(localStorage.getItem('users') || '[]') as Array<{ username: string; password: string }>;
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        // set auth user
        localStorage.setItem('authUser', JSON.stringify({ username }));
        localStorage.removeItem('isFirstLogin');
        router.push('/');
    }

    return (
        <div className="max-w-md mx-auto py-24">
            <div className="bg-card border p-6 rounded">
                <h2 className="text-lg font-semibold mb-4">Create account</h2>
                <label className="text-sm">Username</label>
                <input className="border rounded w-full mb-2 px-2 py-1" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label className="text-sm">Password</label>
                <input type="password" className="border rounded w-full mb-2 px-2 py-1" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label className="text-sm">Confirm Password</label>
                <input type="password" className="border rounded w-full mb-2 px-2 py-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="flex gap-2 mt-4">
                    <button onClick={submit} className="rounded bg-foreground text-background px-3 py-1">Create</button>
                </div>
            </div>
        </div>
    );
}
