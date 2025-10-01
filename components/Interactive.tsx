"use client";

import React from 'react';

const baseBtn = 'inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1';

export function IconButton({ onClick, ariaLabel, title, variant = 'default', className = '', children }: { onClick?: () => void; ariaLabel: string; title?: string; variant?: 'default' | 'destructive' | 'primary'; className?: string; children: React.ReactNode }) {
    const variantCls = variant === 'destructive' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : variant === 'primary' ? 'bg-foreground text-background hover:opacity-90' : 'border bg-card hover:bg-muted';
    return (
        <button aria-label={ariaLabel} title={title} onClick={onClick} className={`${baseBtn} ${variantCls} ${className}`}>
            {children}
        </button>
    );
}

export function LinkButton({ href, children, className = '', title }: { href: string; children: React.ReactNode; className?: string; title?: string }) {
    return (
        <a href={href} title={title} className={`rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors duration-150 ${className}`}>{children}</a>
    );
}

export default IconButton;
