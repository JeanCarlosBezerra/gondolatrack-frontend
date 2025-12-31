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
  estoqueAtual: number;
  atualizadoEm: string;
};

type RawGondolaProduto = any;

function mapRaw(raw: RawGondolaProduto): GondolaProduto {
  // suporta tanto camelCase quanto snake_case/DB
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
    atualizadoEm: raw.atualizadoEm ?? raw.atualizado_em ?? raw.criadoEm ?? raw.criado_em ?? "",
  };
}

export class GondolaProdutoEntity {
    
  static async listByGondola(idGondola: number): Promise<GondolaProduto[]> {
    if (!idGondola) throw new Error("Endpoint exige idGondola.");
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}/produtos`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar produtos da gôndola");
    const data = (await res.json()) as RawGondolaProduto[];
    return data.map(mapRaw);
  }

  static async addByBip(
    idGondola: number,
    payload: { ean: string; minimo: number; maximo: number },
  ): Promise<GondolaProduto> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}/produtos`, {
      method: "POST",
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
      // === ALTERAÇÃO: delete ===
    static async delete(idGondola: number, idGondolaProduto: number): Promise<void> {
      const res = await fetch(
        `${API_BASE()}/gondolas/${idGondola}/produtos/${idGondolaProduto}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao remover produto: ${res.status} - ${text}`);
      }
    } 
}
// === FIM ARQUIVO: entities/GondolaProduto.ts ===
