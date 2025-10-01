import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome to PricePulse</h1>
          <p className="text-sm text-muted-foreground mt-1">Get insights into price movements and set alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 font-medium text-sm h-10 px-4"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
        </div>
      </header>

      <section id="overview" className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Overview</h2>
          <p className="text-sm text-muted-foreground">This demo shows a shadcn-inspired sidebar layout using Tailwind. Edit <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">app/page.tsx</code> to customize.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium">Recent prices</h3>
            <p className="text-sm text-muted-foreground mt-2">Example content goes here.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium">Alerts</h3>
            <p className="text-sm text-muted-foreground mt-2">Example content goes here.</p>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap gap-6 items-center">
        <a className="flex items-center gap-2 hover:underline" href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer">
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a className="flex items-center gap-2 hover:underline" href="https://vercel.com/templates" target="_blank" rel="noopener noreferrer">
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a className="flex items-center gap-2 hover:underline" href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
