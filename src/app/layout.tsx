import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { cn } from "@/utils/cn";
import { PodoLogo } from "@/components/PodoLogo";
import { Fingerprint, Database, Users } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";

import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Missing Podo | Investigation Dashboard",
  description: "Help us find Podo. Track leads, sightings, and messages in real-time.",
  icons: {
    icon: "/favicon.png",
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
        <footer className="bg-[#0a0a0a] text-muted-foreground pt-20 pb-12 px-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <PodoLogo />
                <h3 className="text-white font-black text-2xl tracking-tighter">
                  Missing <span className="text-primary">Podo</span>
                </h3>
              </div>
              <p className="text-xs leading-relaxed opacity-70">
                A state-of-the-art intelligence gathering and record linking platform dedicated to the safe recovery of Podo. Our mission is to transform raw data into actionable leads through advanced spatiotemporal analysis and persona correlation.
              </p>
              <div className="flex gap-3">
                {[Fingerprint, Database, Users].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:border-primary hover:text-white transition-all cursor-pointer">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Operational Areas</h4>
              <ul className="text-xs space-y-4 font-bold">
                <li><Link href="/" className="hover:text-primary transition-colors flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Intelligence Sources</Link></li>
                <li><Link href="/investigation" className="hover:text-primary transition-colors flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Persona Correlation</Link></li>
                <li><Link href="/investigation-map" className="hover:text-primary transition-colors flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Tactical Field Map</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> Pattern Analysis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Tactical Status</h4>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Sat-Link Active</p>
                    <p className="text-[10px] opacity-60">Last Global Sync: 14:15:09 UTC</p>
                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[94%] animate-pulse" />
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mb-1">Nodes Detected</p>
                    <p className="text-[10px] opacity-60">14 Active Intelligence Units</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Command Center</h4>
              <p className="text-xs leading-relaxed opacity-70">
                The investigation is managed by a decentralized network of volunteers. Every piece of information counts.
              </p>
              <div className="p-4 rounded-2xl bg-primary text-white shadow-[0_0_30px_rgba(255,97,0,0.2)]">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-1">Found Podo?</p>
                 <p className="text-[9px] font-bold opacity-80 mb-3 uppercase">Emergency Contact Required</p>
                 <Button variant="dark" size="sm" className="w-full text-[9px] h-8 bg-black text-white hover:bg-black/80 border-none">REPORT SIGHTING</Button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <p>© 2026 Podo Investigation Force. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-primary transition-colors">Legal Protocol</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy Shield</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Op</Link>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
