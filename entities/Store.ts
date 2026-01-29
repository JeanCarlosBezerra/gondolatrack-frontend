import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";

export type Store = {
  id: number;
  codigoErp: string;
  name: string;
  idEmpresa: number | null;
  createdAt: string;
  updatedAt: string | null;
};

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
    const json = await apiFetch<any>(`${API_BASE()}/lojas`, { cache: "no-store" });

    const rawList = Array.isArray(json) ? json : json?.data ?? [];
    return rawList.map(mapRaw);
  }

  static async create(data: { nome: string; codigoErp: string; idEmpresa: number | null; }): Promise<Store> {
    const raw = await apiFetch<any>(`${API_BASE()}/lojas`, {
      method: "POST",
      body: JSON.stringify({
        nome: data.nome,
        codigoErp: data.codigoErp,
        idEmpresa: data.idEmpresa,
      }),
    });

    return mapRaw(raw);
  }

  static async delete(idLoja: number): Promise<void> {
    await apiFetch(`${API_BASE()}/lojas/${idLoja}`, { method: "DELETE" });
  }
}
