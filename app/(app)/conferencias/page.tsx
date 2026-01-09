// === INÍCIO ARQUIVO NOVO: app/(app)/conferencias/page.tsx ===
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Row = {
  idConferencia: number;
  idGondola: number;
  nomeGondola: string;
  idLoja: number;
  usuario: string;
  nomeUsuario?: string | null;
  criadoEm: string;
  qtdItens: number;
  totalConferido: string; // numeric como string
};

async function safeJson(resp: Response) {
  try { return await resp.json(); } catch { return null; }
}

export default function ConferenciasPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  // filtros MVP
  const [idLoja, setIdLoja] = useState<string>("");
  const [idGondola, setIdGondola] = useState<string>("");
  const [usuario, setUsuario] = useState<string>("");
  const [dtIni, setDtIni] = useState<string>("");
  const [dtFim, setDtFim] = useState<string>("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (idLoja) p.set("idLoja", idLoja);
    if (idGondola) p.set("idGondola", idGondola);
    if (usuario) p.set("usuario", usuario);
    if (dtIni) p.set("dtIni", dtIni);
    if (dtFim) p.set("dtFim", dtFim);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [idLoja, idGondola, usuario, dtIni, dtFim]);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const resp = await fetch(`${API_BASE()}/conferencias${queryString}`, {
        credentials: "include",
        cache: "no-store",
      });

      const j = await safeJson(resp);

      // backend retorna { ok: true, data: [...] }
      const list = Array.isArray(j?.data) ? j.data : [];
      
      // normaliza snake_case -> camelCase
      const normalized = list.map((r: any) => ({
        idConferencia: r.idConferencia ?? r.id_conferencia,
        idGondola: r.idGondola ?? r.id_gondola,
        nomeGondola: r.nomeGondola ?? r.nome_gondola,
        idLoja: r.idLoja ?? r.id_loja,
        usuario: r.usuario,
        nomeUsuario: r.nomeUsuario ?? r.nome_usuario ?? null,
        criadoEm: r.criadoEm ?? r.criado_em,
        qtdItens: Number(r.qtdItens ?? r.qtd_itens ?? 0),
        totalConferido: String(r.totalConferido ?? r.total_conferido ?? "0"),
      }));
      
      setRows(normalized);
    } catch (e: any) {
      setErro(e?.message ?? "Erro inesperado.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirPrint(r: Row) {
    router.push(`/gondola/${r.idGondola}/conferencia/print/${r.idConferencia}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conferências</h1>
          <div className="text-sm text-slate-600">
            Listagem e filtros (MVP)
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setIdLoja(""); setIdGondola(""); setUsuario(""); setDtIni(""); setDtFim("");
          }}>
            Limpar
          </Button>
          <Button onClick={carregar} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <div className="font-semibold">Filtros</div>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">Loja (ID)</div>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={idLoja}
                onChange={(e) => setIdLoja(e.target.value)}
                placeholder="ex: 1"
              />
            </div>

            <div>
              <div className="text-xs text-slate-600 mb-1">Gôndola (ID)</div>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={idGondola}
                onChange={(e) => setIdGondola(e.target.value)}
                placeholder="ex: 15"
              />
            </div>

            <div className="md:col-span-1">
              <div className="text-xs text-slate-600 mb-1">Usuário</div>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="ex: JEAN"
              />
            </div>

            <div>
              <div className="text-xs text-slate-600 mb-1">Dt. Inicial</div>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={dtIni}
                onChange={(e) => setDtIni(e.target.value)}
              />
            </div>

            <div>
              <div className="text-xs text-slate-600 mb-1">Dt. Final</div>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={dtFim}
                onChange={(e) => setDtFim(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <Button onClick={carregar} disabled={loading}>
              Aplicar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {erro && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{erro}</div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="py-3">
          <div className="font-semibold">Resultados</div>
          <div className="text-xs text-slate-600">{rows.length} registro(s)</div>
        </CardHeader>

        <CardContent className="py-3">
          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Loja</th>
                  <th className="text-left p-2">Gôndola</th>
                  <th className="text-left p-2">Usuário</th>
                  <th className="text-right p-2">Itens</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.idConferencia} className="border-t hover:bg-slate-50">
                    <td className="p-2 whitespace-nowrap">
                      {new Date(r.criadoEm).toLocaleString()}
                    </td>
                    <td className="p-2">#{r.idLoja}</td>
                    <td className="p-2">
                      {r.nomeGondola} <span className="text-slate-500">(# {r.idGondola})</span>
                    </td>
                    <td className="p-2">
                      {r.nomeUsuario ?? r.usuario}
                      <div className="text-xs text-slate-500">{r.usuario}</div>
                    </td>
                    <td className="p-2 text-right">{r.qtdItens}</td>
                    <td className="p-2 text-right">{r.totalConferido}</td>
                    <td className="p-2 text-right">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/gondola/${r.idGondola}/conferencia/print/${r.idConferencia}`)
                        }
                      >
                        Ver / Imprimir
                      </Button>
                    </td>
                  </tr>
                ))}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td className="p-3 text-slate-600" colSpan={7}>
                      Nenhuma conferência encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td className="p-3 text-slate-600" colSpan={7}>
                      Carregando...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// === FIM ARQUIVO NOVO ===
