// === INÍCIO ARQUIVO AJUSTADO: entities/Store.ts ===

export type Store = {
  id: number;
  codigoErp: string;
  name: string;
  idEmpresa: number | null;
  createdAt: string;
  updatedAt: string | null;
};

type RawStore = {
  idLoja: number;
  nome: string;
  cidade: string;
  endereco: string;
  telefone: string;
  criadoEm: string;
  atualizadoEm: string | null;
};

/**
 * Prioridade:
 * 1) NEXT_PUBLIC_API_URL  -> ex: http://172.28.7.6:3001
 * 2) NEXT_PUBLIC_API_BASE -> ex: http://172.28.7.6:3001/api
 * 3) fallback local
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : (typeof window !== "undefined"
        ? `http://${window.location.hostname}:3001/api`
        : "http://localhost:3001/api");

function mapRaw(raw: any): Store {
  return {
    id: raw.idLoja,
    codigoErp: raw.codigoErp,
    name: raw.nome,
    idEmpresa: raw.idEmpresa ?? null,
    createdAt: raw.criadoEm,
    updatedAt: raw.atualizadoEm,
  };
}

export class StoreEntity {
  static async list(): Promise<Store[]> {
    const res = await fetch(`${API_BASE}/lojas`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar lojas");

    const json = await res.json();

    // aceita: [ ... ] ou { data: [ ... ] }
    const rawList: RawStore[] = Array.isArray(json) ? json : json?.data ?? [];

    return rawList.map(mapRaw);
  }

  static async create(data: {
    nome: string;
    codigoErp: string;
    idEmpresa: number | null;
  }): Promise<Store> {
    const res = await fetch(`${API_BASE}/lojas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: data.nome,
        codigoErp: data.codigoErp,
        idEmpresa: data.idEmpresa,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao criar loja: ${res.status} - ${text}`);
    }

    const raw = (await res.json()) as RawStore;
    return mapRaw(raw);
  }

  static async delete(idLoja: number): Promise<void> {
    const res = await fetch(`${API_BASE}/lojas/${idLoja}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao remover loja: ${res.status} - ${text}`);
    }
  }
}

// === FIM ARQUIVO AJUSTADO: entities/Store.ts ===
