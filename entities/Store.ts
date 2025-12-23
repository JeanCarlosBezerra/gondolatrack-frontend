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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

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
  // mantém compatibilidade: algumas telas chamavam list("--created_date")
  static async list(): Promise<Store[]> {
    const res = await fetch(`${API_BASE}/lojas`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar lojas");

    const json = await res.json();

    // aceita: [ ... ] ou { data: [ ... ] }
    const rawList: RawStore[] = Array.isArray(json) ? json : (json?.data ?? []);

    return rawList.map(mapRaw);
  }


  static async create(data: { nome: string; codigoErp: string; idEmpresa: number | null }): Promise<Store> {
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
