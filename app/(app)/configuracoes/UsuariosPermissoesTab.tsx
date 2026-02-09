"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsuariosAdminEntity, UsuarioAdmin } from "@/entities/UsuariosAdmin";

// ✅ ADICIONADO: catálogo
import {
  FeatureCatalogEntity,
  FeatureCatalogItem,
} from "@/entities/FeatureCatalog";

// =============================
// Helpers CSV <-> Array
// =============================
function parseRoles(csv: string | null | undefined): string[] {
  return String(csv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildRolesCsv(roles: string[]): string {
  const unique = Array.from(
    new Set(roles.map((r) => r.trim()).filter(Boolean))
  );
  return unique.join(",");
}

function hasAdmin(rolesCsv: string | null | undefined): boolean {
  return parseRoles(rolesCsv).some((r) => r.toUpperCase() === "ADMIN");
}

// =============================

export default function UsuariosPermissoesTab({
  flags,
  roles,
}: {
  flags: Record<string, boolean>;
  roles: Set<string>;
}) {
  const isAdmin = roles.has("ADMIN");
  const canView = isAdmin || roles.has("CFG_USERS_VIEW");
  const canEdit = isAdmin || roles.has("CFG_USERS_EDIT");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UsuarioAdmin[]>([]);
  const [q, setQ] = useState("");

  // ✅ ADICIONADO: catálogo
  const [catalog, setCatalog] = useState<FeatureCatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Filtra usuários
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (u) =>
        String(u.username).toLowerCase().includes(s) ||
        String(u.nome ?? "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  // ✅ ADICIONADO: index do catálogo por key (pra label/descrição)
  const catalogByKey = useMemo(() => {
    const map = new Map<string, FeatureCatalogItem>();
    for (const item of catalog) map.set(item.key, item);
    return map;
  }, [catalog]);

  // Carrega usuários
  useEffect(() => {
    if (!canView) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const list = await UsuariosAdminEntity.list();
        if (mounted) setRows(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [canView]);

  // ✅ ADICIONADO: carrega catálogo
  useEffect(() => {
    if (!canView) return;
    let mounted = true;

    (async () => {
      try {
        setLoadingCatalog(true);
        const items = await FeatureCatalogEntity.list();
        if (mounted) setCatalog(items ?? []);
      } catch {
        if (mounted) setCatalog([]);
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [canView]);

  if (!canView) {
    return (
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">
            Usuários & Permissões
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-600">
          Você não tem permissão para visualizar Usuários.
        </CardContent>
      </Card>
    );
  }

  async function save(u: UsuarioAdmin, patch: Partial<UsuarioAdmin>) {
    if (!canEdit) return;

    const updated = await UsuariosAdminEntity.update(u.idUsuario, {
      ativo: patch.ativo ?? u.ativo,
      roles: patch.roles ?? u.roles ?? "",
      nome: patch.nome ?? u.nome,
    });

    setRows((prev) =>
      prev.map((x) => (x.idUsuario === u.idUsuario ? updated : x))
    );
  }

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Usuários & Permissões
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canEdit && (
          <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3">
            Você tem acesso somente de visualização. Para editar, habilite{" "}
            <span className="font-medium">CFG_USERS_EDIT</span>.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <Label>Buscar</Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="username ou nome..."
            />
          </div>

          <div className="text-sm text-slate-500 md:text-right">
            {loading ? "Carregando..." : `Itens: ${filtered.length}`}
          </div>
        </div>

        <div className="border rounded-lg border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {filtered.map((u) => (
              <UsuarioRow
                key={u.idUsuario}
                u={u}
                canEdit={canEdit}
                onSave={save}
                catalog={catalog}
                catalogByKey={catalogByKey}
                loadingCatalog={loadingCatalog}
              />
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================

function UsuarioRow({
  u,
  canEdit,
  onSave,
  catalog,
  catalogByKey,
  loadingCatalog,
}: {
  u: UsuarioAdmin;
  canEdit: boolean;
  onSave: (u: UsuarioAdmin, patch: Partial<UsuarioAdmin>) => Promise<void>;
  catalog: FeatureCatalogItem[];
  catalogByKey: Map<string, FeatureCatalogItem>;
  loadingCatalog: boolean;
}) {
  // ✅ Agora controlamos por array internamente
  const [rolesArr, setRolesArr] = useState<string[]>(parseRoles(u.roles ?? ""));
  const [ativo, setAtivo] = useState<boolean>(u.ativo);
  const [saving, setSaving] = useState(false);

  // UI do seletor
  const [openPicker, setOpenPicker] = useState(false);
  const [pickQ, setPickQ] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // sincroniza quando vier update do server
  useEffect(() => setRolesArr(parseRoles(u.roles ?? "")), [u.roles]);
  useEffect(() => setAtivo(u.ativo), [u.ativo]);

  const rolesCsv = useMemo(() => buildRolesCsv(rolesArr), [rolesArr]);
  const isAdmin = useMemo(() => hasAdmin(rolesCsv), [rolesCsv]);

  // catálogo filtrado
  const filteredCatalog = useMemo(() => {
    const s = pickQ.trim().toLowerCase();
    const items = catalog ?? [];
    if (!s) return items;

    return items.filter((it) => {
      const a = `${it.key} ${it.label ?? ""} ${it.description ?? ""} ${
        it.group ?? ""
      }`.toLowerCase();
      return a.includes(s);
    });
  }, [catalog, pickQ]);

  function addRole(key: string) {
    const k = String(key).trim();
    if (!k) return;

    setRolesArr((prev) => {
      const upper = prev.map((x) => x.toUpperCase());
      if (upper.includes(k.toUpperCase())) return prev; // evita duplicado
      return [...prev, k];
    });
  }

  function removeRole(key: string) {
    const k = String(key).trim();
    if (!k) return;
    setRolesArr((prev) => prev.filter((x) => x.toUpperCase() !== k.toUpperCase()));
  }

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(u, { roles: rolesCsv, ativo });
      setOpenPicker(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">
            {u.username}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {u.nome ?? "-"} • Empresa #{u.idEmpresa} • {u.authProvider ?? "-"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-slate-600">Ativo</Label>
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            disabled={!canEdit}
          />
        </div>
      </div>

      {/* Chips + Picker */}
      <div className="flex flex-col md:flex-row md:items-start gap-3">
        <div className="flex-1">
          <div className="text-xs text-slate-600 mb-2">
            {isAdmin ? (
              <span className="font-medium">ADMIN ativo (god mode)</span>
            ) : (
              <span>Permissões</span>
            )}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {rolesArr.length === 0 ? (
              <span className="text-sm text-slate-400">
                Nenhuma permissão.
              </span>
            ) : (
              rolesArr.map((r) => {
                const info = catalogByKey.get(r);
                const label = info?.label ? `${info.label}` : r;

                return (
                  <span
                    key={r}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700"
                    title={info?.description ?? r}
                  >
                    <span className="font-medium">{label}</span>
                    {!canEdit ? null : (
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => removeRole(r)}
                        title="Remover"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })
            )}
          </div>

          {/* Ações */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!canEdit || loadingCatalog}
              onClick={() => setOpenPicker((v) => !v)}
            >
              {loadingCatalog ? "Carregando catálogo..." : "Adicionar permissão"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!canEdit}
              onClick={() => {
                navigator.clipboard?.writeText(rolesCsv);
              }}
              title="Copia o CSV para colar em outro usuário"
            >
              Copiar CSV
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Ocultar avançado" : "Avançado (CSV)"}
            </Button>
          </div>

          {/* Picker */}
          {openPicker && canEdit && (
            <div className="mt-3 border border-slate-200 rounded-lg bg-white p-3 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={pickQ}
                    onChange={(e) => setPickQ(e.target.value)}
                    placeholder="Buscar permissão (ex: usuários, estoque, MOD_)..."
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPickQ("");
                    setOpenPicker(false);
                  }}
                >
                  Fechar
                </Button>
              </div>

              <div className="max-h-56 overflow-auto border border-slate-200 rounded-md">
                {filteredCatalog.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500">
                    Nenhuma permissão encontrada.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredCatalog.map((it) => {
                      const already = rolesArr
                        .map((x) => x.toUpperCase())
                        .includes(it.key.toUpperCase());

                      return (
                        <button
                          type="button"
                          key={it.key}
                          onClick={() => addRole(it.key)}
                          disabled={already}
                          className={`w-full text-left p-3 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={it.description ?? it.key}
                        >
                          <div className="text-sm font-medium text-slate-900">
                            {it.label ?? it.key}
                            <span className="ml-2 text-xs text-slate-400">
                              ({it.key})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {it.group}
                            {it.description ? ` • ${it.description}` : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avançado: CSV direto */}
          {showAdvanced && (
            <div className="mt-3 border border-slate-200 rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-600 mb-2">
                CSV (separado por vírgula) — útil pra colar rapidamente
              </div>
              <Input
                value={rolesCsv}
                onChange={(e) => setRolesArr(parseRoles(e.target.value))}
                disabled={!canEdit}
                placeholder="Ex: ADMIN ou CFG_USERS_VIEW,CFG_USERS_EDIT"
              />
            </div>
          )}
        </div>

        {/* Salvar */}
        <div className="flex flex-col gap-2 md:items-end md:justify-start">
          <Button
            onClick={handleSave}
            disabled={!canEdit || saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>

          <div className="text-[11px] text-slate-500">
            {isAdmin
              ? "ADMIN ativo (god mode)"
              : "Use o catálogo para evitar erro de digitação"}
          </div>
        </div>
      </div>
    </div>
  );
}
