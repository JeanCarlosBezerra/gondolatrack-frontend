// === INÍCIO ARQUIVO: components/configuracoes/LocaisEstoqueTab.tsx ===
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

import { StoreEntity } from "@/entities/Store";
import type { Store } from "@/entities/Store";
import {
  LojaLocalEstoqueEntity,
  LojaLocalEstoque,
  LojaLocalEstoqueCreateData,
} from "@/entities/LojaLocalEstoque";

type Papel = "VENDA" | "DEPOSITO" | "CD";

export default function LocaisEstoqueTab({
  flags,
  roles,
}: {
  flags: Record<string, boolean>;
  roles: Set<string>;
}) {
  const isAdmin = roles.has("ADMIN");
  const canView = isAdmin || roles.has("CFG_LOCAIS_ESTOQUE_VIEW");
  const canEdit = isAdmin || roles.has("CFG_LOCAIS_ESTOQUE_EDIT");

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [idLoja, setIdLoja] = useState<number>(0);

  const [locais, setLocais] = useState<LojaLocalEstoque[]>([]);
  const [loadingLocais, setLoadingLocais] = useState(false);

  // form
  const [idEmpresa, setIdEmpresa] = useState<number>(1);
  const [idLocalEstoque, setIdLocalEstoque] = useState<number>(0);
  const [papelNaLoja, setPapelNaLoja] = useState<Papel>("VENDA");
  const [saving, setSaving] = useState(false);

  const storeOptions = useMemo(() => stores ?? [], [stores]);

  // ✅ ALTERADO: só carrega dados se pode visualizar
  useEffect(() => {
    if (!canView) {
      setStores([]);
      setIdLoja(0);
      setLocais([]);
      setLoadingStores(false);
      setLoadingLocais(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoadingStores(true);
        const list = await StoreEntity.list();
        if (mounted) setStores(list);
        if (mounted && list?.length) setIdLoja(Number(list[0].id));
      } catch {
        if (mounted) setStores([]);
      } finally {
        if (mounted) setLoadingStores(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [canView]);

  // ✅ ALTERADO: só busca locais se pode visualizar
  useEffect(() => {
    if (!canView) return;

    if (!idLoja) {
      setLocais([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoadingLocais(true);
        const list = await LojaLocalEstoqueEntity.listByLoja(idLoja);
        if (mounted) setLocais(list);
      } catch {
        if (mounted) setLocais([]);
      } finally {
        if (mounted) setLoadingLocais(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [idLoja, canView]);

  async function handleCreate() {
    if (!canEdit) return;

    if (!idLoja) return alert("Selecione uma loja.");
    if (!idEmpresa || idEmpresa <= 0) return alert("Informe a empresa (idEmpresa).");
    if (!idLocalEstoque || idLocalEstoque <= 0) return alert("Informe o local (idLocalEstoque).");

    const payload: LojaLocalEstoqueCreateData = {
      idEmpresa: Number(idEmpresa),
      idLocalEstoque: Number(idLocalEstoque),
      papelNaLoja,
    };

    try {
      setSaving(true);
      const created = await LojaLocalEstoqueEntity.create(idLoja, payload);
      setLocais((prev) => [created, ...prev]);
      setIdLocalEstoque(0);
      setPapelNaLoja("VENDA");
    } catch (e: any) {
      alert(e?.message ?? "Erro ao criar local de estoque.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(idLojaLocalEstoque: number) {
    if (!canEdit) return;

    if (!confirm("Remover este local de estoque?")) return;

    try {
      await LojaLocalEstoqueEntity.remove(idLojaLocalEstoque);
      setLocais((prev) => prev.filter((x) => x.idLojaLocalEstoque !== idLojaLocalEstoque));
    } catch (e: any) {
      alert(e?.message ?? "Erro ao remover local de estoque.");
    }
  }

  // ✅ ALTERADO: aqui sim pode “bloquear” a UI sem quebrar hooks
  if (!canView) {
    return (
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">
            Locais de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-600">
          Você não tem permissão para visualizar Locais de Estoque.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Locais de Estoque
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!canEdit && (
          <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3">
            Você tem acesso somente de visualização. Para adicionar/remover, habilite{" "}
            <span className="font-medium">CFG_LOCAIS_ESTOQUE_EDIT</span>.
          </div>
        )}

        <div>
          <Label className="text-slate-700">Loja</Label>
          <select
            className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={String(idLoja)}
            onChange={(e) => setIdLoja(Number(e.target.value))}
            disabled={loadingStores}
          >
            {!storeOptions.length && <option value="0">Nenhuma loja</option>}
            {storeOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Form Criar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label className="text-slate-700">Empresa (idEmpresa)</Label>
            <Input
              type="number"
              value={idEmpresa}
              onChange={(e) => setIdEmpresa(Number(e.target.value))}
              placeholder="Ex: 1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label className="text-slate-700">Local (idLocalEstoque)</Label>
            <Input
              type="number"
              value={idLocalEstoque || ""}
              onChange={(e) => setIdLocalEstoque(Number(e.target.value))}
              placeholder="Ex: 10"
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label className="text-slate-700">Papel na Loja</Label>
            <select
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm"
              value={papelNaLoja}
              onChange={(e) => setPapelNaLoja(e.target.value as Papel)}
              disabled={!canEdit}
            >
              <option value="VENDA">VENDA</option>
              <option value="DEPOSITO">DEPOSITO</option>
              <option value="CD">CD</option>
            </select>
          </div>

          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreate}
            disabled={saving || !idLoja || !canEdit}
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Adicionar"}
          </Button>
        </div>

        {/* Lista */}
        <div className="border rounded-lg border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 text-sm text-slate-700 font-medium">
            {loadingLocais ? "Carregando..." : `Itens: ${locais.length}`}
          </div>

          {!locais.length && !loadingLocais ? (
            <div className="p-4 text-slate-500 text-sm">Nenhum local cadastrado.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {locais.map((l) => (
                <div key={l.idLojaLocalEstoque} className="p-4 flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    <div>
                      <span className="font-medium">Papel:</span> {l.papelNaLoja}
                    </div>
                    <div className="text-slate-500">
                      Empresa #{l.idEmpresa} • Local #{l.idLocalEstoque}
                    </div>
                  </div>

                  {canEdit && (
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(l.idLojaLocalEstoque)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
// === FIM ARQUIVO ===
