import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GondolaTrack",
  description: "Sistema de gestão de gôndolas, lojas e produtos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen flex bg-slate-50">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6">
              <h1 className="text-lg font-semibold text-slate-800">GondolaTrack</h1>
            </header>
            <section className="flex-1 p-6">{children}</section>
          </main>
        </div>
      </body>
    </html>
  );
}
