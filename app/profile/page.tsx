"use client";

import { useEffect, useState } from "react";

import Snackbar from "../../components/Snackbar";

export default function ProfilePage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

    useEffect(() => {
        fetch('/api/auth/me').then((r) => r.json()).then((data) => {
            if (data && data.profile) {
                setName(data.profile.name || ''); setEmail(data.profile.email || ''); setContact(data.profile.contact || '');
            }
        }).catch(() => { })
    }, [])

    async function save() {
        await fetch('/api/auth/me', { method: 'POST', body: JSON.stringify({ name, email, contact }) })
        setToast({ open: true, msg: 'Profile saved' })
    }

    async function changePassword() {
        const pw = prompt('New password')
        if (!pw) return
        await fetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ password: pw }) })
        setToast({ open: true, msg: 'Password changed' })
    }

    return (
        <div className="max-w-md mx-auto py-8">
            <div className="bg-card border p-6 rounded">
                <h2 className="text-lg font-semibold mb-4">Profile</h2>
                <label className="text-sm">Name</label>
                <input className="border rounded w-full mb-2 px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
                <label className="text-sm">Email</label>
                <input className="border rounded w-full mb-2 px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="text-sm">Contact Number</label>
                <input className="border rounded w-full mb-2 px-2 py-1" value={contact} onChange={(e) => setContact(e.target.value)} />
                <div className="flex gap-2 mt-4">
                    <button onClick={save} className="rounded bg-foreground text-background px-3 py-1">Save</button>
                    <button onClick={changePassword} className="rounded border px-3 py-1">Change password</button>
                </div>
            </div>
            <Snackbar open={toast.open} message={toast.msg} onClose={() => setToast({ open: false, msg: '' })} />
        </div>
    )
}
