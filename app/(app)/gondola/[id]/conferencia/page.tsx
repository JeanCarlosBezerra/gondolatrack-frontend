"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type GondolaProduto = {
  idGondolaProduto?: number;
  idProduto?: number;            // ajuste conforme seu retorno
  idsubproduto?: number;         // se seu back usa idsubproduto, mantenha
  ean?: string | null;
  descricao?: string | null;
};

type UltimaConferencia = {
  idConferencia: string;
  idGondola: number;
  criadoEm: string;
  usuario: string;
  nome?: string | null;
  itens: {
    idProduto?: string | null;
    ean?: string | null;
    descricao?: string | null;
    qtdConferida: string; // numeric -> string
  }[];
} | null;

function normalizeDecimal(input: string) {
  // aceita "10", "10,5", "10.5"
  const s = input.replace(/[^\d.,]/g, "");
  // padroniza pra ponto internamente
  const parts = s.split(/[,\.]/);
  if (parts.length <= 1) return s;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function toFixed3String(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0.000";
  return (Math.round(n * 1000) / 1000).toFixed(3);
}

export default function ConferenciaPage() {
  const params = useParams();
  const router = useRouter();
  const idGondola = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<GondolaProduto[]>([]);
  const [ultima, setUltima] = useState<UltimaConferencia>(null);
  const [lastId, setLastId] = useState<number | null>(null);

  // valores digitados: key = idProduto ou ean
  const [valores, setValores] = useState<Record<string, string>>({});

  const produtosFiltrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    if (!b) return produtos;

    return produtos.filter((p) => {
      const d = (p.descricao ?? "").toLowerCase();
      const e = (p.ean ?? "").toLowerCase();
      return d.includes(b) || e.includes(b);
    });
  }, [produtos, busca]);

  function keyFor(p: GondolaProduto) {
    // prioridade: idProduto/idsubproduto; fallback: ean
    const id = p.idProduto ?? p.idsubproduto;
    if (id != null) return `ID:${id}`;
    return `EAN:${p.ean ?? ""}`;
  }

  async function safeJson(resp: Response) {
  const txt = await resp.text();
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return null;
  }
}

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const [rProd, rUlt] = await Promise.all([
        fetch(`${API_BASE()}/gondolas/${idGondola}/produtos`, { credentials: "include", cache: "no-store" }),
        fetch(`${API_BASE()}/gondolas/${idGondola}/conferencia/ultima`, { credentials: "include", cache: "no-store" }),
      ]);

      if (!rProd.ok) {
        const j = await safeJson(rProd);
        throw new Error(j?.message ?? "Falha ao carregar produtos da gôndola.");
      }
      
      const prodJson = await safeJson(rProd);
      setProdutos(Array.isArray(prodJson) ? prodJson : []);
      
      // Se não existe última, pode vir null ou 404 (dependendo do seu back):
      let ultJson: any = null;

    if (rUlt.ok) {
      ultJson = await safeJson(rUlt); // [ALTERADO] lê UMA vez
    } else {
      ultJson = null; // 404/sem última -> ok
    }

    if (ultJson) {

      const ultimaData = ultJson?.data ?? null;
    setUltima(ultimaData);

    const map: Record<string, string> = {};

    const itens = ultimaData?.itens ?? [];
    for (const it of itens) {
      const id = it.idProduto ? `ID:${it.idProduto}` : null;
      const ean = it.ean ? `EAN:${it.ean}` : null;
      const v = toFixed3String(it.qtdConferida ?? "0");

      if (id) map[id] = v;
      if (ean) map[ean] = v;
    }

    setValores(map);
    setLastId(Number(ultimaData?.idConferencia ?? null));
    } else {
      setUltima(null);
      setLastId(null); // [ALTERADO]
    }
    } catch (e: any) {
      setErro(e?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function salvar() {
    setSaving(true);
    setErro(null);
    try {
      // monta itens (sempre salva id + ean quando existir)
      const itens = produtos.map((p) => {
        const k = keyFor(p);
        const raw = valores[k] ?? "";
        const normalized = normalizeDecimal(raw);
        const n = Number(normalized);
        const qtd = Number.isNaN(n) ? 0 : Math.round(n * 1000) / 1000;

        return {
          idProduto: p.idProduto ?? p.idsubproduto ?? null,
          ean: p.ean ?? null,
          descricao: p.descricao ?? null,
          qtdConferida: qtd,
        };
      });

      const resp = await fetch(`${API_BASE()}/gondolas/${idGondola}/conferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itens }),
      });
      
      const json = await safeJson(resp);
      
      if (!resp.ok) {
        setErro(json?.message ?? "Falha ao salvar");
        return;
      }
        
        const idConf = json?.idConferencia;
        setLastId(Number(json?.idConferencia ?? null));
        router.push(`/gondola/${idGondola}/conferencia/print/${idConf}`);
    } catch (e: any) {
      setErro("Não foi possível conectar no servidor.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!idGondola) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idGondola]);

  if (loading) {
    return <div className="text-slate-600">Carregando conferência...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Conferência da Gôndola</h1>
          {ultima ? (
              <div className="text-sm text-slate-600">
                Última: {isNaN(Date.parse(ultima.criadoEm)) ? "-" : new Date(ultima.criadoEm).toLocaleString()}
                {" — "}
                {ultima.nome ?? ultima.usuario}
              </div>
            ) : (
              <div className="text-sm text-slate-600">Nenhuma conferência anterior.</div>
            )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            variant="outline"
            disabled={!lastId}
            onClick={() => router.push(`/gondola/${idGondola}/conferencia/print/${lastId}`)}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {erro && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Input
          placeholder="Buscar por descrição ou EAN..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Button variant="outline" onClick={carregar}>
          Atualizar
        </Button>
      </div>

      <div className="space-y-2">
        {produtosFiltrados.map((p, idx) => {
          const k = keyFor(p);
          const v = valores[k] ?? "";
          return (
            <Card key={`${k}-${idx}`} className="shadow-sm">
              <CardHeader className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {p.descricao ?? "(sem descrição)"}
                    </div>
                    <div className="text-xs text-slate-500">
                      EAN: {p.ean ?? "-"} • ID: {p.idProduto ?? p.idsubproduto ?? "-"}
                    </div>
                  </div>

                  <div className="w-28">
                    <Input
                      value={v}
                      inputMode="decimal"
                      placeholder="0"
                      onChange={(e) => {
                        const raw = e.target.value;
                        // permite digitar livremente; normaliza só no salvar
                        setValores((prev) => ({ ...prev, [k]: raw }));
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
