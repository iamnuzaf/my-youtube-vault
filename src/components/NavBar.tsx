import { Youtube } from 'lucide-react';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Youtube className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Video Manager</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your personal YouTube collection
        </p>
      </div>
    </header>
  );
}
