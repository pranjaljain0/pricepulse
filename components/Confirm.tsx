"use client";

import { ReactNode } from 'react'

export default function Confirm({ open, onConfirm, onCancel, title = 'Are you sure?', children }: { open: boolean; onConfirm: () => void; onCancel: () => void; title?: string; children?: ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg z-10">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <div className="mb-4">{children}</div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="rounded border px-3 py-1">Cancel</button>
                    <button onClick={onConfirm} className="rounded bg-destructive text-background px-3 py-1">Delete</button>
                </div>
            </div>
        </div>
    );
}
