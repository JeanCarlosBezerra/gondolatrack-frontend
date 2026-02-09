"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FeatureFlagsEntity } from "@/entities/FeatureFlags";
import { AuthEntity } from "@/entities/Auth";

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

function parseRoles(csv?: string) {
  return new Set(
    String(csv ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  );
}

export function Sidebar() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [rolesSet, setRolesSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // ✅ carrega os 2 em paralelo
        const [ff, me] = await Promise.all([
          FeatureFlagsEntity.me(),
          AuthEntity.me(),
        ]);

        if (!mounted) return;

        setFlags(ff.flags ?? {});
        setRolesSet(parseRoles(me?.user?.roles));
      } catch (e) {
        // fallback: se falhar, não trava UI
        if (mounted) {
          setFlags({});
          setRolesSet(new Set());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Feature flags (empresa)
  const modLojas = flags["MOD_LOJAS"] ?? true;
  const modGondolas = flags["MOD_GONDOLAS"] ?? true;
  const modCatalogoProdutos = flags["MOD_CATALOGO_PRODUTOS"] ?? true;
  const modAbastecimento = flags["MOD_ABASTECIMENTO"] ?? true;
  const modConferencias = flags["MOD_CONFERENCIAS"] ?? true;
  const modRelatorios = flags["MOD_RELATORIOS"] ?? true;
  const modConfiguracoes = flags["MOD_CONFIGURACOES"] ?? true;

  // Roles (usuário)
  const isAdmin = rolesSet.has("ADMIN");

  // ✅ Regra: Configurações só aparece se:
  // - feature flag da empresa está on
  // - E o usuário é ADMIN ou tem alguma permissão de config
  const canSeeConfiguracoes = useMemo(() => {
    if (!modConfiguracoes) return false;
    if (isAdmin) return true;

    // se você quiser, pode deixar mais “estrito” ainda:
    return (
      rolesSet.has("CFG_LOCAIS_ESTOQUE_VIEW") ||
      rolesSet.has("CFG_USERS_VIEW")
    );
  }, [modConfiguracoes, isAdmin, rolesSet]);

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

        {!loading && modLojas && <SidebarLink href="/lojas" label="Lojas" />}
        {!loading && modGondolas && <SidebarLink href="/gondola" label="Gôndolas" />}
        {!loading && modCatalogoProdutos && <SidebarLink href="/produtos" label="Produtos" />}
        {!loading && modAbastecimento && <SidebarLink href="/abastecimento" label="Abastecimento" />}
        {!loading && modConferencias && <SidebarLink href="/conferencias" label="Conferências" />}
        {!loading && modRelatorios && <SidebarLink href="/relatorios" label="Relatórios" />}

        {!loading && canSeeConfiguracoes && (
          <SidebarLink href="/configuracoes" label="Configurações" />
        )}
      </nav>
    </aside>
  );
}
