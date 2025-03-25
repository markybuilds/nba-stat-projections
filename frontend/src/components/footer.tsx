import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/privacy" className="text-sm font-medium">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm font-medium">
            Terms
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {year} NBA Stat Projections. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 