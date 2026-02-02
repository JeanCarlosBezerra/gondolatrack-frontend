// === INÍCIO ARQUIVO: app/gondola/[id]/conferencia/[idConferencia]/page.tsx ===
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE } from "@/lib/api";

type ConfItem = {
  idItem?: number;
  idProduto?: string | number | null;
  ean?: string | null;
  descricao?: string | null;

  qtdConferida?: string | number | null;

  // novos campos (preferenciais)
  estoqueVenda?: string | number | null;
  estoqueDeposito?: string | number | null;
  estoqueLojaTotal?: string | number | null;

  // compat legado (se ainda vier do backend antigo)
  estoqueLoja?: string | number | null;   // antes era total da loja
  estoqueCd?: string | number | null;     // antes era CD (não confundir com deposito)
  estoqueTotal?: string | number | null;  // antes era loja+cd
};


type ConferenciaDTO = {
  idConferencia: number;
  idGondola: number;
  criadoEm: string;
  usuario: string;
  nome?: string | null;
  itens: ConfItem[];
};

type ConferenciaApiResponse =
  | ConferenciaDTO
  | (Omit<ConferenciaDTO, "itens"> & { data: ConfItem[] });

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
  // tenta formatar ISO
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString("pt-BR");
  } catch {
    return v;
  }
}

export default function ConferenciaDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string; idConferencia: string }>();

  const idGondola = Number(params?.id);
  const idConferencia = Number(params?.idConferencia);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [conf, setConf] = useState<ConferenciaDTO | null>(null);
  const [realtime, setRealtime] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function apiGet<T>(path: string): Promise<T> {
    // apiFetch já retorna o JSON parseado e já lança erro se status != 2xx
    return await apiFetch<T>(path, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
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
     const data = await apiGet<ConferenciaApiResponse>(
       `/api/gondolas/${idGondola}/conferencia/${idConferencia}/divergencias${realtime ? "?realtime=1" : ""}`
     );


      // garante array
      const itens =
      Array.isArray((data as any)?.itens) ? (data as any).itens :
      Array.isArray((data as any)?.data) ? (data as any).data :
      [];

    setConf({ ...(data as any), itens });
    } catch (e: any) {
      const msg =
        (typeof e?.message === "string" && e.message) ||
        (Array.isArray(e?.message) && e.message.join(" | ")) ||
        e?.error ||
        "Erro ao carregar conferência.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGondola, idConferencia, realtime]);

  const rows = useMemo(() => {
    const itens = conf?.itens ?? [];

    return itens.map((it) => {
      const qtd = toNum(it.qtdConferida);

      // tenta ler estoque de loja / cd / total (qualquer nome que vier do backend)
    const estoqueVenda =
      toNum((it as any).estoqueVenda) ??
      null;

    const estoqueDeposito =
      toNum((it as any).estoqueDeposito) ??
      null;

    // total da loja preferencial
    const estoqueLojaTotal =
      toNum((it as any).estoqueLojaTotal) ??
      // compat antigo: se backend antigo mandava estoqueLoja como total
      toNum((it as any).estoqueLoja) ??
      // se tiver venda/deposito, soma
      (estoqueVenda !== null || estoqueDeposito !== null
        ? (estoqueVenda ?? 0) + (estoqueDeposito ?? 0)
        : null);
      
    // divergência deve ser contra o TOTAL DA LOJA
    const divLojaTotal =
      estoqueLojaTotal !== null && qtd !== null ? qtd - estoqueLojaTotal : null;
      
    return {
      ...it,
      _qtd: qtd,
      _estVenda: estoqueVenda,
      _estDeposito: estoqueDeposito,
      _estLojaTotal: estoqueLojaTotal,
      _divLoja: divLojaTotal,
    };
    });
  }, [conf]);

  const resumo = useMemo(() => {
  let qtdItens = 0;
  let divergentes = 0;

  let somaQtd = 0;
  let somaEstLojaTotal = 0;

  for (const r of rows) {
    qtdItens += 1;

    const qtd = (r as any)._qtd as number | null;
    const estLojaTotal = (r as any)._estLojaTotal as number | null;

    if (qtd !== null) somaQtd += qtd;
    if (estLojaTotal !== null) somaEstLojaTotal += estLojaTotal;

    const d = (r as any)._divLoja as number | null;
    if (d !== null && Math.abs(d) > 0.0005) divergentes += 1;
  }

  return {
    qtdItens,
    divergentes,
    somaQtd,
    somaEstLojaTotal,
    diffLoja:
      rows.length && rows.some((r) => (r as any)._estLojaTotal !== null)
        ? somaQtd - somaEstLojaTotal
        : null,
  };
}, [rows]);


function handleImprimir() {
  // garante que o navegador aplique o @media print antes de capturar o preview
  setTimeout(() => window.print(), 50);
}


return (
  <div id="print-area-conferencia" className="gt-print-area" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Relatório de Divergências</div>
          <div style={{ color: "#666", marginTop: 4 }}>
            Gôndola: <b>{Number.isFinite(idGondola) ? idGondola : "—"}</b> • Conferência:{" "}
            <b>{Number.isFinite(idConferencia) ? idConferencia : "—"}</b>
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Voltar
          </button>

          <button
            onClick={carregar}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Atualizar
          </button>

          <button
            onClick={handleImprimir}
            disabled={!conf}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: conf ? "white" : "#f5f5f5",
              fontWeight: 800,
              cursor: conf ? "pointer" : "not-allowed",
              opacity: conf ? 1 : 0.6,
            }}
          >
            Imprimir
          </button>
          <button
            onClick={() => {
              setRealtime((v) => !v);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: realtime ? "#111" : "white",
              color: realtime ? "white" : "#111",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {realtime ? "Tempo real: ON" : "Tempo real: OFF"}
          </button>

        </div>
      </div>

      {loading && (
        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
          Carregando...
        </div>
      )}

      {!loading && err && (
        <div
          style={{
            padding: 14,
            border: "1px solid #f2c7c7",
            background: "#fff5f5",
            borderRadius: 12,
            color: "#7a1d1d",
            fontWeight: 600,
          }}
        >
          {err}
        </div>
      )}

      {!loading && conf && (
        <>
          {/* Cabeçalho da conferência */}
          <div
            style={{
              marginTop: 12,
              padding: 14,
              border: "1px solid #eee",
              borderRadius: 12,
              background: "white",
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Data</div>
                <div style={{ fontWeight: 800 }}>{fmtDt(conf.criadoEm)}</div>
                <div>
  <div style={{ fontSize: 12, color: "#666" }}>Modo</div>
  <div style={{ fontWeight: 900 }}>
    {(conf as any).mode === "REALTIME" ? "Tempo real (DB2)" : "Snapshot (na conferência)"}
  </div>
</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Usuário</div>
                <div style={{ fontWeight: 800 }}>
                  {conf.nome ? `${conf.nome} — ` : ""}
                  {conf.usuario}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
                gap: 10,
                width: "100%",
                maxWidth: 720, // opcional: controla pra não estourar
              }}
            >
              <Kpi label="Itens" value={String(resumo.qtdItens)} />
              <Kpi label="Divergentes" value={String(resumo.divergentes)} />
              <Kpi label="Total conferido" value={fmt3(resumo.somaQtd)} />
              <Kpi label="Diferença (Loja)" value={fmt3(resumo.diffLoja)} />
            </div>
          </div>

          {/* Tabela (desktop) + Cards (mobile) */}
          <div style={{ marginTop: 12 }}>
            {/* Desktop */}
            <div
              className="gt-desktop"
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                overflow: "hidden",
                background: "white",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={th}>Produto</th>
                    <th style={th}>ID / EAN</th>
                    <th style={thRight}>Conferido</th>
                    <th style={thRight}>Est. Venda</th>
                    <th style={thRight}>Est. Dep.</th>
                    <th style={thRight}>Est. Total</th>
                    <th style={thRight}>Dif. Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const qtd = (r as any)._qtd as number | null;
                    const estVenda = (r as any)._estVenda as number | null;
                    const estDep = (r as any)._estDeposito as number | null;
                    const estTotal = (r as any)._estLojaTotal as number | null;
                    const dTotal = (r as any)._divLoja as number | null;

                    const isDiv = dTotal !== null && Math.abs(dTotal) > 0.0005;

                    return (
                      <tr key={String((r as any).idItem ?? idx)} style={{ borderTop: "1px solid #f1f1f1" }}>
                        <td style={td}>
                          <div style={{ fontWeight: 800 }}>
                            {r.descricao ?? "(sem descrição)"}
                          </div>
                        </td>
                        <td style={td}>
                          <div style={{ color: "#444" }}>
                            <b>ID:</b> {(r as any).idProduto ?? "—"}
                          </div>
                          <div style={{ color: "#666", marginTop: 2 }}>
                            <b>EAN:</b> {r.ean ?? "—"}
                          </div>
                        </td>
                        <td style={tdRight}>{fmt3(qtd)}</td>
                        <td style={tdRight}>{fmt3(estVenda)}</td>
                        <td style={tdRight}>{fmt3(estDep)}</td>
                        <td style={tdRight}>{fmt3(estTotal)}</td>
                        <td
                          style={{
                            ...tdRight,
                            fontWeight: 900,
                            color: isDiv ? "#7a1d1d" : "#1a7f37",
                          }}
                        >
                          {fmt3(dTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="gt-mobile" style={{ display: "none", gap: 10 }}>
              {rows.map((r, idx) => {
                const qtd = (r as any)._qtd as number | null;
                const estLoja = (r as any)._estLojaTotal as number | null;
                const estCd = (r as any)._estCd as number | null;
                const estTotal = (r as any)._estTotal as number | null;
                const dLoja = (r as any)._divLoja as number | null;
                const dTotal = (r as any)._divTotal as number | null;

                const isDiv = dLoja !== null && Math.abs(dLoja) > 0.0005;

                return (
                  <div
                    key={String((r as any).idItem ?? idx)}
                    style={{
                      border: "1px solid #eee",
                      background: "white",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 15 }}>
                      {r.descricao ?? "(sem descrição)"}
                    </div>

                    <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
                      <b>ID:</b> {(r as any).idProduto ?? "—"} • <b>EAN:</b> {r.ean ?? "—"}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 10,
                        fontSize: 13,
                      }}
                    >
                      <Cell label="Conferido" value={fmt3(qtd)} />
                      <Cell label="Estoque Loja" value={fmt3(estLoja)} />
                      <Cell
                        label="Dif. Loja"
                        value={fmt3(dLoja)}
                        strong
                        color={isDiv ? "#7a1d1d" : "#1a7f37"}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CSS responsivo simples */}
          <style jsx global>{`
            @media print {
              /* esconde só o chrome do app */
              .gt-sidebar,
              .gt-topbar,
              .gt-no-print {
                display: none !important;
              }

              /* garante que o conteúdo da página apareça */
              .gt-content {
                padding: 0 !important;
              }

              html, body {
                background: #fff !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              /* evita cortes estranhos em tabela */
              table { page-break-inside: auto; }
              tr, td, th {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

function Cell(props: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{props.label}</div>
      <div
        style={{
          fontWeight: props.strong ? 900 : 800,
          marginTop: 2,
          color: props.color ?? "#111",
        }}
      >
        {props.value}
      </div>
    </div>
  );
}
function Kpi(props: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid #eee",
        background: "#fafafa",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{props.label}</div>
      <div style={{ fontWeight: 900, fontSize: 16, whiteSpace: "nowrap" }}>
        {props.value}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "#555",
  fontWeight: 900,
  borderBottom: "1px solid #eee",
};

const thRight: React.CSSProperties = {
  ...th,
  textAlign: "right",
};

const td: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  verticalAlign: "top",
};

const tdRight: React.CSSProperties = {
  ...td,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};
// === FIM ARQUIVO ===
