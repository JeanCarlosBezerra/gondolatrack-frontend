"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

// Se você já usa components/ui (button, card, input), pode trocar pelos seus.
// Aqui vou manter HTML básico para não travar por dependência.
type Loja = {
  idLoja: number;
  nome: string;
  codigoErp?: string;
  idEmpresa?: number;
};

type Abastecimento = {
  idAbastecimento: string;
  idLoja: string;
  status: string;
  dtBase: string;
  diasVenda: number;
  coberturaDias: number;
  criadoEm: string;
  atualizadoEm: string | null;
};

type AbastecimentoItem = {
  idAbastecimentoItem: string;
  idAbastecimento: string;
  idsubproduto: string;
  ean: string | null;
  descricao: string | null;
  estoqueLoja: string;          // numeric -> string
  estoqueCd: string;            // numeric -> string
  totalVendidoPeriodo: string;  // numeric -> string
  mediaDia: string;             // numeric -> string (6 casas)
  estoqueAlvo: string;          // numeric -> string
  qtdSugerida: string;          // numeric -> string
  qtdSelecionada: string;       // numeric -> string
};

function toNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt3(v: string | number): string {
  const n = toNumber(v);
  return n.toFixed(3);
}

export default function ProdutosPage() {
  // filtros
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [idLoja, setIdLoja] = useState<number | null>(null);
  const [diasVenda, setDiasVenda] = useState<number>(30);
  const [coberturaDias, setCoberturaDias] = useState<number>(7);

  // abastecimentos
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [selectedAbastecimento, setSelectedAbastecimento] = useState<Abastecimento | null>(null);
  const [itens, setItens] = useState<AbastecimentoItem[]>([]);

  // ui state
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingGerar, setLoadingGerar] = useState(false);
  const [loadingItens, setLoadingItens] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selecionadoAbastecimentoId = selectedAbastecimento?.idAbastecimento ?? null;

  // ======= 1) carregar lojas =======
  useEffect(() => {
    (async () => {
      try {
        setLoadingLojas(true);
        setError(null);

        const resp = await fetch(`${API_BASE}/lojas`, { cache: "no-store" });
        if (!resp.ok) throw new Error(`Falha ao carregar lojas (${resp.status})`);
        const data = await resp.json();

        // seu backend pode retornar { ... } ou array direto; trate os dois
        const list: Loja[] = Array.isArray(data)
          ? data.map((r: any) => ({
              idLoja: Number(r.idLoja ?? r.id_loja),
              nome: String(r.nome),
              codigoErp: r.codigoErp ?? r.codigo_erp,
              idEmpresa: r.idEmpresa ?? r.id_empresa,
            }))
          : [];

        setLojas(list);
        if (list.length && idLoja === null) setIdLoja(list[0].idLoja);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar lojas");
      } finally {
        setLoadingLojas(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= 2) carregar lista de abastecimentos ao trocar loja =======
  useEffect(() => {
    if (!idLoja) return;
    setSelectedAbastecimento(null);
    setItens([]);
    carregarAbastecimentos(idLoja);

    (async () => {
      try {
        setLoadingLista(true);
        setError(null);
        setSelectedAbastecimento(null);
        setItens([]);

        const resp = await fetch(`${API_BASE}/abastecimentos?idLoja=${idLoja}`, { cache: "no-store" });
        if (!resp.ok) throw new Error(`Falha ao listar abastecimentos (${resp.status})`);
        const data = await resp.json();

        const list: Abastecimento[] = Array.isArray(data)
          ? data
          : [];

        setAbastecimentos(list);

        // opcional: seleciona o mais recente automaticamente
        if (list.length) {
          setSelectedAbastecimento(list[0]);
        }
      } catch (e: any) {
        setError(e?.message ?? "Erro ao listar abastecimentos");
      } finally {
        setLoadingLista(false);
      }
    })();
  }, [idLoja]);

  // ======= 3) ao selecionar um abastecimento, carregar itens =======
  useEffect(() => {
    if (!selectedAbastecimento?.idAbastecimento) return;

    (async () => {
      try {
        setLoadingItens(true);
        setError(null);

        const resp = await fetch(`${API_BASE}/abastecimentos/${selectedAbastecimento.idAbastecimento}/itens`, {
          cache: "no-store",
        });
        if (!resp.ok) throw new Error(`Falha ao carregar itens (${resp.status})`);
        const data = await resp.json();

        const list: AbastecimentoItem[] = Array.isArray(data) ? data : [];
        setItens(list);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar itens");
      } finally {
        setLoadingItens(false);
      }
    })();
  }, [selectedAbastecimento]);

  async function carregarAbastecimentos(lojaId: number) {
  setLoadingLista(true);
  setError(null);
  try {
    const r = await fetch(`${API_BASE}/abastecimentos?idLoja=${lojaId}`);
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    setAbastecimentos(data ?? []);

    // opcional: se não tem selecionado, seleciona o primeiro
    if ((data?.length ?? 0) > 0 && !selectedAbastecimento) {
      setSelectedAbastecimento(data[0]);
    }
  } catch (e: any) {
    setError(e?.message ?? String(e));
  } finally {
    setLoadingLista(false);
  }
}

async function carregarItens(idAbastecimento: string) {
  setLoadingItens(true);
  setError(null);
  try {
    const r = await fetch(`${API_BASE}/abastecimentos/${idAbastecimento}/itens`);
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    setItens(data ?? []);
  } catch (e: any) {
    setError(e?.message ?? String(e));
  } finally {
    setLoadingItens(false);
  }
}

  // ======= 4) gerar abastecimento =======
  async function onGerar() {
    if (!idLoja) return;

    try {
      setLoadingGerar(true);
      setError(null);

      const resp = await fetch(`${API_BASE}/abastecimentos/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idLoja,
          diasVenda,
          coberturaDias,
        }),
      });

      if (!resp.ok) {
        const payload = await resp.json().catch(() => null);
        const msg = payload?.message ? String(payload.message) : `Falha ao gerar (${resp.status})`;
        throw new Error(msg);
      }

      const data = await resp.json();
      const ab: Abastecimento | null = data?.abastecimento ?? null;
      const its: AbastecimentoItem[] = Array.isArray(data?.itens) ? data.itens : [];

      // atualiza lista e seleciona o novo
      if (ab) {
        setAbastecimentos((prev) => [ab, ...prev]);
        setSelectedAbastecimento(ab);
      }
      setItens(its);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao gerar abastecimento");
    } finally {
      setLoadingGerar(false);
    }
  }

  async function handleConfirmar() {
  if (!selecionadoAbastecimentoId) return;

  const payload = {
    itens: itens.map((it) => ({
      idAbastecimentoItem: it.idAbastecimentoItem,
      qtdSelecionada: it.qtdSelecionada ?? "0.000",
    })),
  };

  const r1 = await fetch(`${API_BASE}/abastecimentos/${selecionadoAbastecimentoId}/itens`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r1.ok) {
    const t = await r1.text();
    alert(`Erro ao salvar itens: ${t}`);
    return;
  }

  const r2 = await fetch(`${API_BASE}/abastecimentos/${selecionadoAbastecimentoId}/confirmar`, {
    method: "POST",
  });

  if (!r2.ok) {
    const t = await r2.text();
    alert(`Erro ao confirmar: ${t}`);
    return;
  }

  // === ALTERADO: recarrega
  await carregarAbastecimentos(Number(idLoja));
  await carregarItens(selecionadoAbastecimentoId);

  alert("Abastecimento confirmado com sucesso.");
}

function handleImprimir() {
  if (!selecionadoAbastecimentoId) return;
  window.open(`${API_BASE}/abastecimentos/${selecionadoAbastecimentoId}/print`, "_blank");
}

  // ======= 5) editar qtdSelecionada no grid (local, sem salvar ainda) =======
  function updateQtdSelecionada(idAbastecimentoItem: string, newValue: string) {
    // aceita vírgula ou ponto
    const normalized = newValue.replace(",", ".");
    const n = Number(normalized);
    const safe = Number.isFinite(n) ? n : 0;

    setItens((prev) =>
      prev.map((it) =>
        it.idAbastecimentoItem === idAbastecimentoItem
          ? { ...it, qtdSelecionada: safe.toFixed(3) }
          : it
      )
    );
  }

  const resumo = useMemo(() => {
    const totalSugerido = itens.reduce((acc, it) => acc + toNumber(it.qtdSugerida), 0);
    const totalSelecionado = itens.reduce((acc, it) => acc + toNumber(it.qtdSelecionada), 0);
    const totalItens = itens.length;
    return { totalItens, totalSugerido, totalSelecionado };
  }, [itens]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Abastecimento</h1>
      <div style={{ color: "#666", marginBottom: 16 }}>Gere e confirme a lista de itens para abastecer do CD</div>

      {error && (
        <div style={{ background: "#ffe5e5", border: "1px solid #ffb3b3", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <b>Erro:</b> {error}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 4 }}>Loja</label>
          <select
            value={idLoja ?? ""}
            onChange={(e) => setIdLoja(Number(e.target.value))}
            disabled={loadingLojas}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 340 }}
          >
            {lojas.map((l) => (
              <option key={l.idLoja} value={l.idLoja}>
                {l.idLoja} - {l.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 4 }}>Dias de venda</label>
          <input
            type="number"
            value={diasVenda}
            onChange={(e) => setDiasVenda(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", width: 140 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 4 }}>Cobertura (dias)</label>
          <input
            type="number"
            value={coberturaDias}
            onChange={(e) => setCoberturaDias(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", width: 160 }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={handleConfirmar}
          disabled={!selecionadoAbastecimentoId}
          className="rounded-md px-4 py-2 border"
        >
          Confirmar
        </button>

        <button
          onClick={handleImprimir}
          disabled={!selecionadoAbastecimentoId}
          className="rounded-md px-4 py-2 border"
        >
          Imprimir
        </button>
      </div>    
        <button
          onClick={onGerar}
          disabled={!idLoja || loadingGerar}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #1a7f37",
            background: "#1a7f37",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loadingGerar ? "Gerando..." : "Gerar abastecimento"}
        </button>
      </div>

      {/* Lista de abastecimentos */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Abastecimentos</div>

          {loadingLista ? (
            <div style={{ color: "#666" }}>Carregando...</div>
          ) : abastecimentos.length === 0 ? (
            <div style={{ color: "#666" }}>Nenhum abastecimento para esta loja.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {abastecimentos.map((a) => {
                const active = a.idAbastecimento === selectedAbastecimento?.idAbastecimento;
                return (
                  <button
                    key={a.idAbastecimento}
                    onClick={() => setSelectedAbastecimento(a)}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 10,
                      border: active ? "2px solid #1a7f37" : "1px solid #ddd",
                      background: active ? "#eaf6ee" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      #{a.idAbastecimento} — {a.status}
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      dtBase: {a.dtBase} | diasVenda: {a.diasVenda} | cobertura: {a.coberturaDias}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Itens */}
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800 }}>Itens</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Itens: {resumo.totalItens} | Total sugerido: {fmt3(resumo.totalSugerido)} | Total selecionado: {fmt3(resumo.totalSelecionado)}
              </div>
            </div>

            {/* Aqui depois entra: Confirmar / Exportar */}
            <div style={{ fontSize: 12, color: "#777" }}>
              (próximo passo: botão “Confirmar” e salvar qtdSelecionada)
            </div>
          </div>

          {loadingItens ? (
            <div style={{ color: "#666" }}>Carregando itens...</div>
          ) : itens.length === 0 ? (
            <div style={{ color: "#666" }}>Selecione um abastecimento para ver itens.</div>
          ) : (
            <div style={{ overflow: "auto", border: "1px solid #eee", borderRadius: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "left" }}>Produto</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Estoque Loja</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Estoque CD</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Vend. Período</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Média/dia</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Estoque Alvo</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Sugestão</th>
                    <th style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>Selecionado</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((it) => (
                    <tr key={it.idAbastecimentoItem}>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>
                        <div style={{ fontWeight: 800 }}>{it.descricao ?? "-"}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          IDSUB: {it.idsubproduto} {it.ean ? `| EAN: ${it.ean}` : ""}
                        </div>
                      </td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.estoqueLoja}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.estoqueCd}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.totalVendidoPeriodo}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.mediaDia}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.estoqueAlvo}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>{it.qtdSugerida}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", textAlign: "right" }}>
                        <input
                          value={it.qtdSelecionada}
                          onChange={(e) => updateQtdSelecionada(it.idAbastecimentoItem, e.target.value)}
                          style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid #ddd", textAlign: "right" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
