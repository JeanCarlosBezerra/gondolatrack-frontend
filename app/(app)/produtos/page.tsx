"use client";

// === INÍCIO: app/(app)/produtos/page.tsx ===
import React, { useEffect, useMemo, useState } from "react";
import { StoreEntity } from "@/entities/all";
import type { Store } from "@/entities/all";
import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/button";

type ProdutoRow = {
  IDPRODUTO: number;
  EAN: string;
  DESCRICAO: string;
  ESTOQUE_VENDA?: number;
  ESTOQUE_DEPOSITO?: number;
  ESTOQUE_TOTAL?: number;
};

type ApiResp = {
  page: number;
  limit: number;
  items: ProdutoRow[];
  hasNext: boolean;
};

export default function ProdutosPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [idLoja, setIdLoja] = useState<number | "">("");
  const [tab, setTab] = useState<"catalogo" | "sem-gondola">("catalogo");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [loadingStores, setLoadingStores] = useState(true);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<ApiResp>({
    page: 1,
    limit: 50,
    items: [],
    hasNext: false,
  });

  // === ALTERADO: carrega lojas ===
  useEffect(() => {
    (async () => {
      try {
        const list = await StoreEntity.list();
        setStores(list);
      } catch (err) {
        console.error("Erro ao carregar lojas:", err);
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    })();
  }, []);

  const canSearch = useMemo(() => idLoja !== "" && Number(idLoja) > 0, [idLoja]);

  // === NOVO: busca API ===
  const load = async (resetPage = false) => {
    if (!canSearch) return;

    const p = resetPage ? 1 : page;
    setLoading(true);

    try {
      const endpoint =
        tab === "catalogo" ? "/api/produtos/search" : "/api/produtos/sem-gondola";

      const qs = new URLSearchParams();
      qs.set("idLoja", String(idLoja));
      if (q.trim()) qs.set("q", q.trim());
      qs.set("page", String(p));
      qs.set("limit", "50");

      const resp = await apiFetch<ApiResp>(`${endpoint}?${qs.toString()}`);
      setData(resp);
      if (resetPage) setPage(1);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setData({ page: 1, limit: 50, items: [], hasNext: false });
    } finally {
      setLoading(false);
    }
  };

  // recarrega quando muda loja / aba
  useEffect(() => {
    if (!canSearch) return;
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idLoja, tab]);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Produtos</h1>
          <p className="text-slate-600">
            Selecione uma loja para carregar o catálogo e ver produtos sem gôndola.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm text-slate-700 mb-1">Loja</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={idLoja}
                disabled={loadingStores}
                onChange={(e) => setIdLoja(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Selecione...</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.codigoErp})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Busca</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                placeholder="Descrição, EAN, ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load(true);
                }}
              />
            </div>

            <div className="md:col-span-1 flex gap-2">
              <Button
                className="w-full"
                disabled={!canSearch || loading}
                onClick={() => load(true)}
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                tab === "catalogo"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setTab("catalogo")}
            >
              Catálogo
            </button>

            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                tab === "sem-gondola"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setTab("sem-gondola")}
            >
              Sem gôndola (com estoque)
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {loading ? "Carregando..." : `${data.items.length} item(ns)`}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={loading || page <= 1}
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  setTimeout(() => load(false), 0);
                }}
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                disabled={loading || !data.hasNext}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  setTimeout(() => load(false), 0);
                }}
              >
                Próximo
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">EAN</th>
                  <th className="px-4 py-3">Descrição</th>
                  {tab === "sem-gondola" && (
                    <>
                      <th className="px-4 py-3">Est. Venda</th>
                      <th className="px-4 py-3">Est. Depósito</th>
                      <th className="px-4 py-3">Est. Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={tab === "sem-gondola" ? 6 : 3}>
                      Nenhum registro.
                    </td>
                  </tr>
                ) : (
                  data.items.map((r, idx) => (
                      <tr
                        key={`${r.IDPRODUTO}-${r.EAN ?? "SEM_EAN"}-${idx}`}
                        className="border-t border-slate-100"
                      >
                      <td className="px-4 py-3">{r.IDPRODUTO}</td>
                      <td className="px-4 py-3">{r.EAN}</td>
                      <td className="px-4 py-3">{r.DESCRICAO}</td>

                      {tab === "sem-gondola" && (
                        <>
                          <td className="px-4 py-3">{Number(r.ESTOQUE_VENDA ?? 0).toFixed(3)}</td>
                          <td className="px-4 py-3">{Number(r.ESTOQUE_DEPOSITO ?? 0).toFixed(3)}</td>
                          <td className="px-4 py-3">{Number(r.ESTOQUE_TOTAL ?? 0).toFixed(3)}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Dica: no “Sem gôndola”, a API já traz somente produtos com estoque nos locais
          configurados na tabela <b>loja_locais_estoque</b>.
        </div>
      </div>
    </div>
  );
}
// === FIM ===
