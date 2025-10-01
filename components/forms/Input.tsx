"use client";

import React from "react";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
            {children}
        </label>
    );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-primary ${props.className || ''}`}
        />
    );
}

export default Input;
