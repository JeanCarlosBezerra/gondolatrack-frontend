// === INÍCIO ARQUIVO: app/gondola/[id]/page.tsx ===
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GondolaProduto, GondolaProdutoEntity } from "@/entities/GondolaProduto";
import { Trash2 } from "lucide-react";
import { GondolaEntity, type Gondola } from "@/entities/Gondola";
import { StoreEntity, type Store } from "@/entities/Store";
import { UsuarioEntity, type Usuario } from "@/entities/Usuarios";

type PrintMode = "conferencia" | "reposicao" | null;

type ReposicaoItem = {
  idGondola: number;
  idLoja: number;
  idProduto: number;
  ean: string;
  descricao: string;
  idGondolaProduto: number;

  minimo?: number;
  maximo?: number;

  estoqueVenda: number;     // estoque na área de venda (local VENDA)
  estoqueDeposito: number;  // estoque em outros locais da loja
  repor: number;            // sugestão de reposição
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export default function GondolaDetailPage() {
  const params = useParams();
  const router = useRouter();

  const idGondola = useMemo(() => {
    const v = params?.id;
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<GondolaProduto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form
  const [ean, setEan] = useState("");
  const [minimo, setMinimo] = useState<string>("");
  const [maximo, setMaximo] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const [gondola, setGondola] = useState<Gondola | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // impressão
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const [reposicaoItems, setReposicaoItems] = useState<ReposicaoItem[]>([]);
  const [printing, setPrinting] = useState(false);

  const lojaNome = stores.find((s) => s.id === gondola?.idLoja)?.name ?? "-";

  const responsavelNome =
    usuarios.find((u) => u.idUsuario === gondola?.idResponsavel)?.nomeUsuario ??
    (gondola?.idResponsavel ? `#${gondola.idResponsavel}` : "-");

  async function load() {
    if (!idGondola) return;

    setIsLoading(true);
    setError(null);

    try {
      const [it, g, st, us] = await Promise.all([
        GondolaProdutoEntity.listByGondola(idGondola),
        GondolaEntity.get(idGondola),
        StoreEntity.list(),
        UsuarioEntity.list(),
      ]);

      setItems(it);
      setGondola(g);
      setStores(st);
      setUsuarios(us);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (idGondola) load();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGondola]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!idGondola) return;

    if (!ean?.trim()) return setError("Informe o EAN.");
    if (minimo === "" || maximo === "") return setError("Informe mínimo e máximo.");

    const minNum = Number(minimo);
    const maxNum = Number(maximo);

    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum))
      return setError("Mínimo e máximo devem ser números.");
    if (maxNum < minNum) return setError("Máximo não pode ser menor que mínimo.");

    setIsSaving(true);
    setError(null);

    try {
      const created = await GondolaProdutoEntity.addByBip(idGondola, {
        ean: ean.trim(),
        minimo: minNum,
        maximo: maxNum,
      });

      setItems((prev) => [created, ...prev]);

      setEan("");
      setMinimo("");
      setMaximo("");
    } catch (e: any) {
      setError(e?.message ?? "Falha ao adicionar produto");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(idGondolaProduto: number) {
    try {
      const ok = confirm("Remover este produto da gôndola?");
      if (!ok) return;

      await GondolaProdutoEntity.delete(Number(idGondola), idGondolaProduto);

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao remover produto");
    }
  }

  // ======= impressão helpers =======

  function safeNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // chama backend para atualizar estoque dos produtos da gôndola (evita divergência na impressão)
  async function refreshEstoqueParaImpressao(): Promise<GondolaProduto[]> {
  if (!idGondola) return items;

  // 1) dispara o refresh (não confia no retorno)
  const res = await fetch(`${API_BASE}/gondolas/${idGondola}/produtos/refresh-estoque`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falha ao atualizar estoque antes de imprimir. ${txt}`);
  }

  // 2) agora busca a lista normal (essa SEMPRE é array)
  const res2 = await fetch(`${API_BASE}/gondolas/${idGondola}/produtos`, { cache: "no-store" });
  if (!res2.ok) {
    const txt = await res2.text().catch(() => "");
    throw new Error(`Falha ao recarregar produtos após refresh. ${txt}`);
  }

  const data = (await res2.json()) as any[];

  // mapeia no mesmo formato do seu GondolaProduto
  return (Array.isArray(data) ? data : []).map((raw) => ({
    idGondolaProduto: raw.idGondolaProduto ?? raw.id_gondola_produto ?? raw.id,
    idGondola: raw.idGondola ?? raw.id_gondola,
    idLoja: raw.idLoja ?? raw.id_loja,
    idProduto: raw.idProduto ?? raw.id_produto,
    ean: raw.ean ?? raw.EAN ?? "",
    descricao: raw.descricao ?? raw.DESCRICAO ?? "",
    minimo: Number(raw.minimo ?? 0),
    maximo: Number(raw.maximo ?? 0),
    estoqueAtual: Number(raw.estoqueAtual ?? raw.estoque_atual ?? 0),
    atualizadoEm: raw.atualizadoEm ?? raw.atualizado_em ?? "",
  }));
}

  async function printConferencia() {
    if (!idGondola) return;

    try {
      setPrinting(true);
      setError(null);

      // atualiza estoque antes
      const updatedItems = await refreshEstoqueParaImpressao();
      setItems(updatedItems);  
      setPrintMode("conferencia");

      // pequeno delay para React renderizar antes de window.print()
      setTimeout(() => window.print(), 200);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao imprimir conferência");
    } finally {
      // solta depois de imprimir
      setTimeout(() => {
        setPrinting(false);
        setPrintMode(null);
      }, 400);
    }
  }

  async function printReposicao() {
    if (!idGondola) return;

    try {
      setPrinting(true);
      setError(null);

      // importante: atualizar estoque antes também (para consistência)
      const updatedItems = await refreshEstoqueParaImpressao();
      setItems(updatedItems);

      const res = await fetch(`${API_BASE}/gondolas/${idGondola}/reposicao`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Falha ao carregar reposição. ${txt}`);
      }

      const data = (await res.json()) as ReposicaoItem[];
      setReposicaoItems(data);

      setPrintMode("reposicao");

      setTimeout(() => window.print(), 200);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao imprimir reposição");
    } finally {
      setTimeout(() => {
        setPrinting(false);
        setPrintMode(null);
      }, 400);
    }
  }

  return (
    <div className="p-8 space-y-6 print:p-0 print:space-y-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detalhe da Gôndola</h1>
          <p className="text-slate-600">Gôndola #{idGondola ?? "?"}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>

          <Button variant="outline" onClick={load} disabled={isLoading}>
            Recarregar
          </Button>

          {/* CONFERÊNCIA (fita) */}
          <Button variant="outline" onClick={printConferencia} disabled={printing || isLoading}>
            {printing && printMode === "conferencia" ? "Imprimindo..." : "Conferência"}
          </Button>

          {/* REPOSIÇÃO */}
          <Button onClick={printReposicao} disabled={printing || isLoading}>
            {printing && printMode === "reposicao" ? "Imprimindo..." : "Reposição"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
        <CardHeader>
          <h2 className="text-lg font-semibold">Adicionar produto (bipar)</h2>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleAdd}>
            <Input
              placeholder="EAN (código de barras)"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
            />
            <Input
              placeholder="Mínimo"
              value={minimo}
              onChange={(e) => setMinimo(e.target.value)}
              inputMode="numeric"
            />
            <Input
              placeholder="Máximo"
              value={maximo}
              onChange={(e) => setMaximo(e.target.value)}
              inputMode="numeric"
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Adicionando..." : "Adicionar"}
            </Button>
          </form>

          <p className="text-xs text-slate-500 mt-2">
            Ao adicionar, o backend busca o produto no ERP (DB2), calcula o estoque da loja e grava mínimo/máximo.
          </p>
        </CardContent>
      </Card>

      {/* ===================== PRINT: CONFERÊNCIA ===================== */}
      <div
        id="print-area-conferencia"
        className={printMode === "conferencia" ? "hidden print:block text-sm" : "hidden"}
      >
        <div className="border-b pb-2 mb-2">
          <h2 className="font-bold text-base">FITA DE CONFERÊNCIA – GÔNDOLA</h2>
          <p>Gôndola #{idGondola}</p>
          <p>Data: {new Date().toLocaleString()}</p>
        </div>

        <div className="mb-2">
          <p>
            <strong>Loja:</strong> {lojaNome}
          </p>
          <p>
            <strong>Responsável:</strong> {responsavelNome}
          </p>
        </div>

        <div className="border-t pt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th align="left">EAN</th>
                <th align="left">Produto</th>
                <th align="right">Est.</th>
                <th align="center">Conf.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.idGondolaProduto} className="border-b">
                  <td>{it.ean}</td>
                  <td>{it.descricao}</td>
                  <td align="right">{it.estoqueAtual}</td>
                  <td align="center">______</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          id="print-area-conferencia"
          className={printMode === "conferencia" ? "hidden print:block text-sm print:break-after-page" : "hidden"}
        ></div>
      </div>

      {/* ===================== PRINT: REPOSIÇÃO ===================== */}
      <div
        id="print-area-reposicao"
        className={printMode === "reposicao" ? "hidden print:block text-sm" : "hidden"}
      >
        <div className="border-b pb-2 mb-2">
          <h2 className="font-bold text-base">REPOSIÇÃO – GÔNDOLA (LOJA)</h2>
          <p>Gôndola #{idGondola}</p>
          <p>Data: {new Date().toLocaleString()}</p>
        </div>

        <div className="mb-2">
          <p>
            <strong>Loja:</strong> {lojaNome}
          </p>
          <p>
            <strong>Responsável:</strong> {responsavelNome}
          </p>
        </div>

        <div className="border-t pt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th align="left">EAN</th>
                <th align="left">Produto</th>
                <th align="right">Est. Venda</th>
                <th align="right">Min</th>
                <th align="right">Max</th>
                <th align="right">Repor</th>
                <th align="right">Est. Dep.</th>
              </tr>
            </thead>
            <tbody>
              {reposicaoItems.map((it) => (
                <tr key={`${it.idGondolaProduto}-${it.ean}`} className="border-b">
                  <td>{it.ean}</td>
                  <td>{it.descricao}</td>
                  <td align="right">{it.estoqueVenda}</td>
                  <td align="right">{it.minimo ?? "-"}</td>
                  <td align="right">{it.maximo ?? "-"}</td>
                  <td align="right">{it.repor}</td>
                  <td align="right">{it.estoqueDeposito}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          id="print-area-reposicao"
          className={printMode === "reposicao" ? "hidden print:block text-sm print:break-after-page" : "hidden"}
        ></div>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Produtos na gôndola</h2>
            <span className="text-sm text-slate-600">
              {isLoading ? "Carregando..." : `${items.length} item(ns)`}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 && (
            <div className="text-slate-600">Nenhum produto vinculado ainda.</div>
          )}

          {items.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr className="border-b">
                    <th className="py-2 pr-3">EAN</th>
                    <th className="py-2 pr-3">Descrição</th>
                    <th className="py-2 pr-3">Mín.</th>
                    <th className="py-2 pr-3">Máx.</th>
                    <th className="py-2 pr-3">Estoque atual</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.idGondolaProduto} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-mono">{it.ean}</td>
                      <td className="py-2 pr-3">{it.descricao}</td>
                      <td className="py-2 pr-3">{it.minimo}</td>
                      <td className="py-2 pr-3">{it.maximo}</td>
                      <td className="py-2 pr-3">{it.estoqueAtual}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(it.idGondolaProduto)}
                          className="inline-flex items-center justify-center rounded-md border px-2 py-2 hover:bg-red-50 text-red-600 border-red-200"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// === FIM ARQUIVO: app/gondola/[id]/page.tsx ===
