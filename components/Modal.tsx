"use client";

import { ReactNode, useEffect, useRef } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const previousActive = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);

    // keep latest onClose in a ref so the effect below only depends on `open`
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const el = ref.current;
        if (!el) return;

        previousActive.current = document.activeElement as HTMLElement | null;

        const focusable = Array.from(el.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ));
        const first = focusable.find((f) => !f.hasAttribute('data-modal-close')) || focusable[0];
        const last = focusable[focusable.length - 1];

        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onCloseRef.current();
            if (e.key === "Tab") {
                if (!first || !last) return;
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        }

        document.addEventListener("keydown", handleKey);
        // focus the first interactive element (skip close button) so typing works
        setTimeout(() => {
            if (first) first.focus();
            else {
                el.setAttribute('tabindex', '-1');
                el.focus();
            }
        }, 0);

        return () => {
            document.removeEventListener("keydown", handleKey);
            // restore previous focus
            try {
                previousActive.current?.focus();
            } catch {
                // ignore
            }
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div ref={ref} role="dialog" aria-modal="true" className="relative w-full max-w-xl bg-card border border-border rounded-lg p-6 shadow-lg z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button aria-label="Close dialog" data-modal-close onClick={onClose} className="px-2 py-1 rounded-md border">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}
