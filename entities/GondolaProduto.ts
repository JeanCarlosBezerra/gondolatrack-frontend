// === INÍCIO ARQUIVO: entities/GondolaProduto.ts ===
import { API_BASE } from "@/lib/api";

export type GondolaProduto = {
  idGondolaProduto: number;
  idGondola: number;
  idLoja: number;
  idProduto: number;
  ean: string;
  descricao: string;
  minimo: number;
  maximo: number;
  estoqueAtual: number;      // AO VIVO (recalculado no GET)
  estoqueSnapshot: number;   // [NOVO] FOTO do cadastro
  atualizadoEm: string;
};

type RawGondolaProduto = any;

function mapRaw(raw: RawGondolaProduto): GondolaProduto {
  return {
    idGondolaProduto: raw.idGondolaProduto ?? raw.id_gondola_produto ?? raw.id,
    idGondola: raw.idGondola ?? raw.id_gondola,
    idLoja: raw.idLoja ?? raw.id_loja,
    idProduto: raw.idProduto ?? raw.id_produto,
    ean: raw.ean ?? raw.EAN ?? "",
    descricao: raw.descricao ?? raw.DESCRICAO ?? "",
    minimo: Number(raw.minimo ?? 0),
    maximo: Number(raw.maximo ?? 0),
    estoqueAtual: Number(raw.estoqueAtual ?? raw.estoque_atual ?? 0),
    estoqueSnapshot: Number(raw.estoqueSnapshot ?? raw.estoque_snapshot ?? 0), // [NOVO]
    atualizadoEm: raw.atualizadoEm ?? raw.atualizado_em ?? raw.criadoEm ?? raw.criado_em ?? "",
  };
}

export class GondolaProdutoEntity {
  static async listByGondola(idGondola: number): Promise<GondolaProduto[]> {
    if (!idGondola) throw new Error("Endpoint exige idGondola.");
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}/produtos`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(async () => ({ message: await res.text() }));
      if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
      if (res.status === 403) throw new Error(body?.message ?? "Acesso negado para este módulo.");
      throw new Error(body?.message ?? `Erro ao carregar produtos da gôndola (${res.status}).`);
    }
    const data = (await res.json()) as RawGondolaProduto[];
    return data.map(mapRaw);
  }

  static async addByBip(
    idGondola: number,
    // [ALT] o campo continua "ean", mas aceita EAN OU código interno
    payload: { ean: string; minimo: number; maximo: number },
  ): Promise<GondolaProduto> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}/produtos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(async () => ({ message: await res.text() }));
      throw new Error(`Erro ao adicionar produto: ${res.status} - ${body.message ?? 'Erro'}`);
    }
    const raw = (await res.json()) as RawGondolaProduto;
    return mapRaw(raw);
  }

  static async delete(idGondola: number, idGondolaProduto: number): Promise<void> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}/produtos/${idGondolaProduto}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao remover produto: ${res.status} - ${text}`);
    }
  }
}
// === FIM ARQUIVO: entities/GondolaProduto.ts ===