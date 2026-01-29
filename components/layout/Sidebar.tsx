"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FeatureFlagsEntity } from "@/entities/FeatureFlags";

type SidebarLinkProps = { href: string; label: string };

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
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loadingFlags, setLoadingFlags] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await FeatureFlagsEntity.me();
        if (mounted) setFlags(me.flags ?? {});
      } catch {
        // fallback: se falhar, mostra tudo (evita travar UI)
        if (mounted) setFlags({});
      } finally {
        if (mounted) setLoadingFlags(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // se loadingFlags=true, você pode:
  // A) esconder itens até carregar (como você já faz)
  // B) OU mostrar tudo enquanto carrega
  // Vou manter o seu padrão: só mostra depois que carregou.

  const modLojas = flags["MOD_LOJAS"] ?? true;
  const modGondolas = flags["MOD_GONDOLAS"] ?? true;
  const modCatalogoProdutos = flags["MOD_CATALOGO_PRODUTOS"] ?? true;
  const modAbastecimento = flags["MOD_ABASTECIMENTO"] ?? true;
  const modConferencias = flags["MOD_CONFERENCIAS"] ?? true;
  const modRelatorios = flags["MOD_RELATORIOS"] ?? true;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
          GT
        </div>
        <div className="ml-3">
          <div className="text-sm font-semibold text-slate-900">GondolaTrack</div>
          <div className="text-xs text-slate-500">Gestão de Gôndolas</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink href="/" label="Dashboard" />

        {!loadingFlags && modLojas && <SidebarLink href="/lojas" label="Lojas" />}
        {!loadingFlags && modGondolas && <SidebarLink href="/gondola" label="Gôndolas" />}
        {!loadingFlags && modCatalogoProdutos && <SidebarLink href="/produtos" label="Produtos" />}
        {!loadingFlags && modAbastecimento && <SidebarLink href="/abastecimento" label="Abastecimento" />}
        {!loadingFlags && modConferencias && <SidebarLink href="/conferencias" label="Conferências" />}
        {!loadingFlags && modRelatorios && <SidebarLink href="/relatorios" label="Relatórios" />}
      </nav>
    </aside>
  );
}
