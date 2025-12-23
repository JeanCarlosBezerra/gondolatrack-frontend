// === INÍCIO ARQUIVO NOVO: src/components/layout/Sidebar.tsx ===
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLinkProps = {
  href: string;
  label: string;
};

function SidebarLink({ href, label }: SidebarLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      {/* Logo / título */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
          GT
        </div>
        <div className="ml-3">
          <div className="text-sm font-semibold text-slate-900">
            GondolaTrack
          </div>
          <div className="text-xs text-slate-500">Gestão de Gôndolas</div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink href="/" label="Dashboard" />
        <SidebarLink href="/lojas" label="Lojas" />
        <SidebarLink href="/gondola" label="Gôndolas" />
        <SidebarLink href="/produtos" label="Produtos" />
      </nav>
    </aside>
  );
}
// === FIM ARQUIVO NOVO ===
