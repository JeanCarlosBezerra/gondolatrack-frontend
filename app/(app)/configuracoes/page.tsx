// === INÍCIO ARQUIVO: app/(app)/configuracoes/page.tsx ===
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureFlagsEntity } from "@/entities/FeatureFlags";
import { AuthEntity } from "@/entities/Auth"; // ✅ ADICIONADO
import LocaisEstoqueTab from "./LocaisEstoqueTab";
import UsuariosPermissoesTab from "./UsuariosPermissoesTab";

function parseRolesSet(csv?: string | null) {
  return new Set(
    String(csv ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  );
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);

  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState<Set<string>>(new Set());

  const isAdmin = useMemo(() => roles.has("ADMIN"), [roles]);

  // ✅ ALTERADO: agora decide allowed por módulo + roles
  const allowed = useMemo(() => {
    const modConfiguracoes = flags["MOD_CONFIGURACOES"] ?? true;

    const canAnyConfig =
      isAdmin ||
      roles.has("CFG_LOCAIS_ESTOQUE_VIEW") ||
      roles.has("CFG_USERS_VIEW");

    return modConfiguracoes && canAnyConfig;
  }, [flags, roles, isAdmin]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [meFlags, meAuth] = await Promise.all([
          FeatureFlagsEntity.me(),
          AuthEntity.me(),
        ]);

        if (!mounted) return;

        setFlags(meFlags?.flags ?? {});
        setRoles(parseRolesSet(meAuth?.user?.roles));
      } catch {
        if (mounted) {
          setFlags({});
          setRoles(new Set());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">Carregando...</CardContent>
        </Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-8">
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600">
            Você não tem permissão para acessar Configurações.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Ajustes do sistema (administração).</p>
      </div>

      {/* ✅ ALTERADO: passa flags + roles */}
      <LocaisEstoqueTab flags={flags} roles={roles} />
      <UsuariosPermissoesTab flags={flags} roles={roles} />
    </div>
  );
}
// === FIM ARQUIVO ===
