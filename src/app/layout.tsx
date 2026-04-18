import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { cn } from "@/utils/cn";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jotform Records Dashboard",
  description: "A clean dashboard to view and manage your Jotform submissions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, "min-h-full flex flex-col antialiased")}>
        <ToastProvider />
        <header className="sticky top-0 z-50 glass border-b border-border h-16 flex items-center px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary tracking-tight">JF CHALLENGE</h1>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="hover:text-primary transition-colors">Forms</a>
              <a href="#" className="hover:text-primary transition-colors">Reports</a>
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-dark text-gray-400 py-12 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">JF CHALLENGE</h3>
              <p className="text-sm">A professional frontend solution for the 2026 challenge, focused on data visualization and user experience.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">Built with passion for the frontend ecosystem.</p>
              <div className="mt-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors cursor-pointer text-xs">GH</div>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-primary transition-colors cursor-pointer text-xs">IN</div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            © 2026 Frontend Challenge. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
