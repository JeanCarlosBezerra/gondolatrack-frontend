// app/(app)/gondola/[id]/conferencia/divergencias/print/[idConferencia]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ConfItem = {
  idItem?: number;
  idProduto?: string | number | null;
  ean?: string | null;
  descricao?: string | null;
  qtdConferida?: string | number | null;

  estoqueLoja?: string | number | null;
  estoqueCd?: string | number | null;
  estoqueTotal?: string | number | null;
};

type ConferenciaDTO = {
  idConferencia: number;
  idGondola: number;
  criadoEm: string;
  usuario: string;
  nome?: string | null;
  itens: ConfItem[];
};

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fmt3(v: number | null): string {
  if (v === null) return "—";
  return v.toFixed(3);
}

function fmtDt(v: string): string {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString("pt-BR");
  } catch {
    return v;
  }
}

export default function DivergenciasPrintPage() {
  const router = useRouter();
  const params = useParams<{ id: string; idConferencia: string }>();

  const idGondola = Number(params?.id);
  const idConferencia = Number(params?.idConferencia);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [conf, setConf] = useState<ConferenciaDTO | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
    }
    return (await res.json()) as T;
  }

  async function carregar() {
    if (!idGondola || !idConferencia) {
      setErr("Parâmetros inválidos (idGondola / idConferencia).");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const data = await apiGet<ConferenciaDTO>(
        `/api/gondolas/${idGondola}/conferencia/${idConferencia}/divergencias`
      );

      const itens = Array.isArray((data as any)?.itens) ? (data as any).itens : [];
      setConf({ ...(data as any), itens });
    } catch (e: any) {
      setErr(e?.message || "Erro ao carregar divergências.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGondola, idConferencia]);

  const rows = useMemo(() => {
    const itens = conf?.itens ?? [];

    return itens.map((it) => {
      const qtd = toNum(it.qtdConferida);

      const estLoja =
        toNum((it as any).estoqueLoja) ??
        toNum((it as any).estoqueVenda) ??
        null;

      const estCd =
        toNum((it as any).estoqueCd) ??
        toNum((it as any).estoqueDeposito) ??
        null;

      const estTotal =
        toNum((it as any).estoqueTotal) ??
        (estLoja !== null || estCd !== null ? (estLoja ?? 0) + (estCd ?? 0) : null);

      const divLoja = estLoja !== null && qtd !== null ? qtd - estLoja : null;
      const divTotal = estTotal !== null && qtd !== null ? qtd - estTotal : null;

      return {
        ...it,
        _qtd: qtd,
        _estLoja: estLoja,
        _estCd: estCd,
        _estTotal: estTotal,
        _divLoja: divLoja,
        _divTotal: divTotal,
      };
    });
  }, [conf]);

  const resumo = useMemo(() => {
    let qtdItens = 0;
    let divergentes = 0;

    let somaQtd = 0;
    let somaEstLoja = 0;
    let somaEstTotal = 0;

    for (const r of rows) {
      qtdItens += 1;

      const qtd = (r as any)._qtd as number | null;
      const estLoja = (r as any)._estLoja as number | null;
      const estTotal = (r as any)._estTotal as number | null;

      if (qtd !== null) somaQtd += qtd;
      if (estLoja !== null) somaEstLoja += estLoja;
      if (estTotal !== null) somaEstTotal += estTotal;

      const d = (r as any)._divLoja as number | null;
      if (d !== null && Math.abs(d) > 0.0005) divergentes += 1;
    }

    return {
      qtdItens,
      divergentes,
      somaQtd,
      somaEstLoja,
      somaEstTotal,
      diffLoja:
        rows.length && rows.some((r) => (r as any)._estLoja !== null)
          ? somaQtd - somaEstLoja
          : null,
      diffTotal:
        rows.length && rows.some((r) => (r as any)._estTotal !== null)
          ? somaQtd - somaEstTotal
          : null,
    };
  }, [rows]);

  function imprimirAgora() {
    window.print();
  }

  if (loading) return <div style={{ padding: 18 }}>Carregando...</div>;
  if (err) return <div style={{ padding: 18, color: "#7a1d1d" }}>{err}</div>;
  if (!conf) return <div style={{ padding: 18 }}>Sem dados.</div>;

  return (
    <div style={{ padding: 18 }}>
      {/* Barra de ações (não imprime) */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => router.back()}>Voltar</button>
        <button onClick={carregar}>Atualizar</button>
        <button onClick={imprimirAgora} style={{ fontWeight: 800 }}>Imprimir</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Relatório de Divergências</div>
        <div style={{ color: "#555", marginTop: 4 }}>
          Gôndola: <b>{conf.idGondola}</b> • Conferência: <b>{conf.idConferencia}</b>
        </div>
        <div style={{ color: "#555", marginTop: 4 }}>
          {fmtDt(conf.criadoEm)} — {conf.nome ? `${conf.nome} — ` : ""}{conf.usuario}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
        <InfoBox label="Itens" value={String(resumo.qtdItens)} />
        <InfoBox label="Divergentes" value={String(resumo.divergentes)} />
        <InfoBox label="Total conferido" value={fmt3(resumo.somaQtd)} />
        <InfoBox label="Diferença (Loja)" value={fmt3(resumo.diffLoja)} />
        <InfoBox label="Diferença (Total)" value={fmt3(resumo.diffTotal)} />
      </div>

      <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f6f6f6" }}>
              <th style={th}>Produto</th>
              <th style={th}>ID / EAN</th>
              <th style={thR}>Conferido</th>
              <th style={thR}>Est. Loja</th>
              <th style={thR}>Est. CD</th>
              <th style={thR}>Est. Total</th>
              <th style={thR}>Dif. Loja</th>
              <th style={thR}>Dif. Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const qtd = (r as any)._qtd as number | null;
              const estLoja = (r as any)._estLoja as number | null;
              const estCd = (r as any)._estCd as number | null;
              const estTotal = (r as any)._estTotal as number | null;
              const dLoja = (r as any)._divLoja as number | null;
              const dTotal = (r as any)._divTotal as number | null;

              const isDiv = dLoja !== null && Math.abs(dLoja) > 0.0005;

              return (
                <tr key={String((r as any).idItem ?? idx)} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 800 }}>{r.descricao ?? "(sem descrição)"}</div>
                  </td>
                  <td style={td}>
                    <div><b>ID:</b> {(r as any).idProduto ?? "—"}</div>
                    <div><b>EAN:</b> {r.ean ?? "—"}</div>
                  </td>
                  <td style={tdR}>{fmt3(qtd)}</td>
                  <td style={tdR}>{fmt3(estLoja)}</td>
                  <td style={tdR}>{fmt3(estCd)}</td>
                  <td style={tdR}>{fmt3(estTotal)}</td>
                  <td style={{ ...tdR, fontWeight: 900, color: isDiv ? "#7a1d1d" : "#1a7f37" }}>
                    {fmt3(dLoja)}
                  </td>
                  <td style={{ ...tdR, fontWeight: 900, color: dTotal !== null && Math.abs(dTotal) > 0.0005 ? "#7a1d1d" : "#1a7f37" }}>
                    {fmt3(dTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

function InfoBox(props: { label: string; value: string }) {
  return (
    <div style={{
      border: "1px solid #eaeaea",
      borderRadius: 10,
      padding: "10px 12px",
      minWidth: 160,
      background: "white",
    }}>
      <div style={{ fontSize: 12, color: "#666" }}>{props.label}</div>
      <div style={{ fontWeight: 900, marginTop: 2 }}>{props.value}</div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontSize: 12, fontWeight: 900, color: "#444" };
const thR: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { textAlign: "left", padding: "8px 10px", verticalAlign: "top" };
const tdR: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" };
