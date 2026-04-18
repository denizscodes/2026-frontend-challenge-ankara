import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { cn } from "@/utils/cn";
import { PodoLogo } from "@/components/PodoLogo";
import { Fingerprint, Database, Users } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Missing Podo | Investigation Dashboard",
  description: "Help us find Podo. Track leads, sightings, and messages in real-time.",
  icons: {
    icon: "/podo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-full flex flex-col antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ToastProvider />
        <header className="sticky top-0 z-50 glass border-b border-border h-16 flex items-center px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <PodoLogo />
              <h1 className="text-xl font-bold text-dark tracking-tight">Missing <span className="text-primary">Podo</span></h1>
            </Link>
            <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wider text-muted items-center">
              <Link href="/" className="hover:text-primary transition-colors">Sources</Link>
              <Link href="/investigation" className="hover:text-primary transition-colors">Intelligence</Link>
              <Link href="/investigation-map" className="hover:text-primary transition-colors text-foreground">Tactical Map</Link>
              <ThemeToggle />
            </nav>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-dark text-muted py-12 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-xl tracking-tight">
                Missing <span className="text-primary">Podo</span>
              </h3>
              <p className="text-sm leading-relaxed">
                A state-of-the-art intelligence gathering and record linking platform dedicated to the safe recovery of Podo. Our mission is to transform raw data into actionable leads.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-card/5 border border-white/10">
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status Report</p>
                 <p className="text-xs text-muted">Last System Sync: Just now</p>
                 <p className="text-xs text-muted">Active Intel Nodes: 14</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-[0.2em]">Investigation Tools</h4>
              <ul className="text-sm space-y-4">
                <li><Link href="/" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Intelligence Sources</Link></li>
                <li><Link href="/investigation" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Persona Correlation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Pattern Analysis</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Spatial Tracking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-[0.2em]">Command Center</h4>
              <p className="text-sm leading-relaxed mb-6">Designed for rapid response and data-driven investigation. If you have information, please use our intelligence forms.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-card/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all cursor-pointer">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-card/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all cursor-pointer">
                  <Database className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-card/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            © 2026 Frontend Challenge. All rights reserved.
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
