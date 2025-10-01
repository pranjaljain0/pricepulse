"use client";

import { useEffect, useRef, useState } from 'react';

export function TableScrollWrapper({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [showFade, setShowFade] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        function check() {
            const cur = ref.current;
            if (!cur) return setShowFade(false);
            const show = cur.scrollWidth > cur.clientWidth && cur.scrollLeft + cur.clientWidth < cur.scrollWidth - 1;
            setShowFade(show);
        }
        check();
        el.addEventListener('scroll', check);
        window.addEventListener('resize', check);
        return () => {
            el.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
        };
    }, []);

    return (
        <div className="relative">
            <div ref={ref} className="overflow-x-auto">
                {children}
            </div>
            {showFade && (
                <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-card to-transparent" />
            )}
        </div>
    );
}

// Hook for long-press to copy
export function useLongPressCopy(textGetter: () => string, onCopied?: (header: string) => void) {
    const timerRef = useRef<number | null>(null);

    function start(header: string) {
        stop();
        // 600ms long press
        timerRef.current = window.setTimeout(async () => {
            try {
                await navigator.clipboard.writeText(textGetter());
                onCopied?.(header);
            } catch {
                // ignore
            }
        }, 600);
    }

    function stop() {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    return { start, stop };
}

export function TableCell({ header, getText, className, children, onCopied }: { header: string; getText: () => string; className?: string; children: React.ReactNode; onCopied?: (header: string) => void }) {
    const { start, stop } = useLongPressCopy(getText, onCopied);
    return (
        <td className={className}
            onMouseDown={() => start(header)}
            onMouseUp={stop}
            onMouseLeave={stop}
            onTouchStart={() => start(header)}
            onTouchEnd={stop}
        >
            {children}
        </td>
    );
}
