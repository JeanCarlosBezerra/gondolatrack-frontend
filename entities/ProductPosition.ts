// === INÍCIO ARQUIVO AJUSTADO: entities/ProductPosition.ts ===
import { API_BASE } from "@/lib/api";

// Modelo usado NA TELA (mantendo os nomes antigos para não quebrar o código)
export type ProductPosition = {
  id: number;
  gondolaId: number;
  productId: number;
  position: number;
  max_stock: number | null;
  current_stock: number | null;
  created_at: string;
  updated_at: string | null;
};

// Nomes que vêm do BACKEND (Nest + Postgres)
type RawProductPosition = {
  idPosicao: number;
  idGondola: number;
  idProduto: number;
  posicao: number;
  estoqueMaximo: number | null;
  estoqueAtual: number | null;
  criadoEm: string;
  atualizadoEm: string | null;
};

function mapRaw(raw: RawProductPosition): ProductPosition {
  return {
    id: raw.idPosicao,
    gondolaId: raw.idGondola,
    productId: raw.idProduto,
    position: raw.posicao,
    max_stock: raw.estoqueMaximo,
    current_stock: raw.estoqueAtual,
    created_at: raw.criadoEm,
    updated_at: raw.atualizadoEm,
  };
}

export class ProductPositionEntity {
  // === ALTERAÇÃO: não permitir listagem sem idGondola (evita NaN/400)
  static async list(): Promise<ProductPosition[]> {
    throw new Error("Use listByGondola(idGondola). Endpoint exige idGondola.");
  }

  // Lista posições de UMA gôndola específica
  static async listByGondola(idGondola: number): Promise<ProductPosition[]> {
    // === ALTERAÇÃO: validação para evitar NaN ===
    if (!Number.isFinite(idGondola) || idGondola <= 0) {
      return [];
    }

    const res = await fetch(
      `${API_BASE}/posicoes-gondola?idGondola=${idGondola}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao carregar posições da gôndola: ${res.status} - ${text}`);
    }

    const data = (await res.json()) as RawProductPosition[];
    return data.map(mapRaw);
  }
  // Cria uma nova posição na gôndola
  static async create(data: {
    idGondola: number;
    idProduto: number;
    posicao: number;
    estoqueMaximo?: number | null;
    estoqueAtual?: number | null;
  }): Promise<ProductPosition> {
    const res = await fetch(`${API_BASE}/posicoes-gondola`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idGondola: data.idGondola,
        idProduto: data.idProduto,
        posicao: data.posicao,
        estoqueMaximo: data.estoqueMaximo ?? null,
        estoqueAtual: data.estoqueAtual ?? null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Erro ao criar posição da gôndola: ${res.status} - ${text}`,
      );
    }

    const raw = (await res.json()) as RawProductPosition;
    return mapRaw(raw);
  }

  // Remove uma posição
  static async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/posicoes-gondola/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Erro ao remover posição da gôndola: ${res.status} - ${text}`,
      );
    }
  }
}
// === FIM ARQUIVO AJUSTADO: entities/ProductPosition.ts ===
