"use client";

import { useEffect } from "react";

export default function Snackbar({ open, message, actionLabel, onAction, onClose }: { open: boolean; message: string; actionLabel?: string; onAction?: () => void; onClose?: () => void }) {
    useEffect(() => {
        if (!open || !onClose) return;
        const t = setTimeout(() => onClose(), 2000);
        return () => clearTimeout(t);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-card border border-border rounded-md px-4 py-2 shadow-md flex items-center gap-4">
                <div className="text-sm">{message}</div>
                {actionLabel && <button onClick={onAction} className="text-sm text-primary">{actionLabel}</button>}
            </div>
        </div>
    );
}
