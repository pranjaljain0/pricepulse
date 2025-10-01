"use client"

import React, { useEffect, useRef, useState } from 'react'

type DropdownItem = {
    key: string
    label: string
    checked?: boolean
    onToggle?: () => void
}

export default function DropdownMenu({ triggerLabel, items }: { triggerLabel: string; items: DropdownItem[] }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    const itemsRef = useRef<Array<HTMLButtonElement | null>>([])

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return
            if (!ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [])

    useEffect(() => {
        if (!open) return
        // focus first item when opened
        requestAnimationFrame(() => itemsRef.current[0]?.focus())
    }, [open])

    function onKeyDown(e: React.KeyboardEvent) {
        const { key } = e
        const focused = document.activeElement
        const idx = itemsRef.current.findIndex((el) => el === focused)
        if (key === 'ArrowDown') {
            e.preventDefault()
            const next = (idx + 1) % itemsRef.current.length
            itemsRef.current[next]?.focus()
        } else if (key === 'ArrowUp') {
            e.preventDefault()
            const prev = (idx - 1 + itemsRef.current.length) % itemsRef.current.length
            itemsRef.current[prev]?.focus()
        } else if (key === 'Escape') {
            setOpen(false)
        }
    }

    return (
        <div className="relative inline-block" ref={ref}>
            <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)} className="rounded border px-3 py-1">{triggerLabel} ▾</button>
            {open && (
                <div role="menu" aria-orientation="vertical" onKeyDown={onKeyDown} className="absolute right-0 mt-2 bg-card border rounded shadow p-2 z-30 w-56">
                    {items.map((it, i) => (
                        <button
                            key={it.key}
                            role="menuitemcheckbox"
                            aria-checked={!!it.checked}
                            ref={(el) => { itemsRef.current[i] = el }}
                            onClick={() => it.onToggle && it.onToggle()}
                            className="flex items-center gap-2 text-sm p-2 hover:bg-accent rounded w-full text-left"
                        >
                            <input readOnly type="checkbox" checked={!!it.checked} className="pointer-events-none" />
                            <span>{it.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
