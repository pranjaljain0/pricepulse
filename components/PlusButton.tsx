"use client";

import React from "react";

export default function PlusButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium"
            aria-label={label}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
        </button>
    );
}
