"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Conferencia = {
  idConferencia: number;
  idGondola: number;
  criadoEm: string;
  usuario: string;
  nome?: string | null;
  itens: {
    idProduto?: string | null;
    ean?: string | null;
    descricao?: string | null;
    qtdConferida: string;
  }[];
};

export default function PrintConferenciaPage() {
  const router = useRouter();
  const params = useParams<{ id: string; idConferencia: string }>();
  const [data, setData] = useState<Conferencia | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [readyToPrint, setReadyToPrint] = useState(false);

  const idGondola = Number(params?.id);
const idConferencia = Number(params?.idConferencia);

async function carregar() {
  setLoading(true);
  setErro(null);

  try {
    // [ALTERADO] evita loading infinito se params vierem inválidos
    if (!Number.isFinite(idGondola) || !Number.isFinite(idConferencia) || idGondola <= 0 || idConferencia <= 0) {
      throw new Error("Parâmetros inválidos para impressão.");
    }

    // [ALTERADO] rota correta (com idGondola)
    const resp = await fetch(
      `${API_BASE()}/gondolas/${idGondola}/conferencia/${idConferencia}`,
      { credentials: "include", cache: "no-store" }
    );

    const json = await resp.json().catch(() => null);

    if (!resp.ok) {
      // [ALTERADO] se 404, mostra mensagem amigável
      throw new Error(json?.message ?? "Conferência não encontrada.");
    }

    if (!json) {
      throw new Error("Resposta inválida do servidor.");
    }

    setData(json);
  } catch (e: any) {
    setErro(e?.message ?? "Não foi possível carregar a conferência.");
  } finally {
    setLoading(false); // ✅ sempre desliga
  }
}

useEffect(() => {
  carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params?.id, params?.idConferencia]);


  if (loading) return <div>Carregando...</div>;

  if (erro) {
    return (
      <div className="space-y-3">
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{erro}</div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  if (!data) return null;
  <style jsx global>{`
  @media print {
    /* garante que o navegador não corte o conteúdo */
    html, body {
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* remove margens padrão do navegador */
    @page {
      margin: 8mm;
    }

    /* esconde controles */
    .print\\:hidden {
      display: none !important;
    }

    /* garante que o card e conteúdo sejam imprimíveis */
    .print-area {
      display: block !important;
      visibility: visible !important;
      position: static !important;
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
    }

    /* às vezes shadows/transform quebram print */
    * {
      box-shadow: none !important;
      text-shadow: none !important;
      filter: none !important;
      transform: none !important;
    }
  }
`}</style>

  return (
    <div className="space-y-3">
      <div className="flex gap-2 print:hidden">
        {!loading && (
      <div className="print:hidden flex gap-2 mb-4">
         <Button onClick={() => window.print()}>Imprimir</Button>
         <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
      </div>
    )}
      </div>
    <div id="print-area-conferencia">
      <Card className="shadow-sm print:shadow-none print:border-none">
        <CardHeader className="py-3">
          <div className="font-bold">Conferência de Gôndola</div>
          <div className="text-xs text-slate-600">
            Gôndola: {data.idGondola} • ID Conf: {data.idConferencia}
          </div>
          <div className="text-xs text-slate-600">
            {new Date(data.criadoEm).toLocaleString()} — {data.nome ?? data.usuario}
          </div>
        </CardHeader>
    
        <CardContent className="py-3">
          <div className="space-y-2">
            {data.itens?.map((i, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-semibold">
                  {i.descricao ?? "(sem descrição)"}
                </div>
                <div className="text-slate-600">
                  EAN: {i.ean ?? "-"} • ID: {i.idProduto ?? "-"} • Qtd:{" "}
                  {i.qtdConferida}
                </div>
                <div className="border-b border-dashed my-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
      <style jsx global>{`
        @media print {
          /* largura térmica (ajuste para 58mm ou 80mm conforme impressora) */
          body {
            width: 58mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
