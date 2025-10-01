"use client";

export default function EmptyState({ message = "No entries yet — looks a bit lonely here." }: { message?: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
