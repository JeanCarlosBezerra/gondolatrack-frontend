// === INÍCIO ARQUIVO AJUSTADO: entities/Gondola.ts ===
import { API_BASE } from "@/lib/api";

export type Gondola = {
  idGondola: number;
  idLoja: number;
  idLojaLocalEstoque: number;
  papelNaLoja?: 'VENDA' | 'DEPOSITO' | 'CD';
  nome: string;
  corredorSecao: string | null;
  marca: string | null;
  totalPosicoes: number;
  idResponsavel: number | null;
  criadoEm: string;
  atualizadoEm: string | null;
};

export type GondolaFormData = {
  idLoja: number;
  idLojaLocalEstoque: number;
  nome: string;
  corredorSecao: string | null;
  marca: string | null;
  totalPosicoes: number;
  idResponsavel: number | null;
};

function mapRaw(raw: any): Gondola {
  // === ALTERADO: suporta retorno embrulhado { data: {...} } ===
  const r = raw?.data ?? raw;

  return {
    // === ALTERADO: também aceita "id" por segurança ===
    idGondola: r.idGondola ?? r.id_gondola ?? r.id,
    idLoja: r.idLoja ?? r.id_loja,
    idLojaLocalEstoque:
      r.idLojaLocalEstoque ?? r.id_loja_local_estoque,
      
    papelNaLoja:
      r.localEstoque?.papelNaLoja ??
      r.papel_na_loja ??
      null,
    nome: r.nome,
    corredorSecao: r.corredorSecao ?? r.secao_corredor ?? null,
    marca: r.marca ?? null,
    totalPosicoes: r.totalPosicoes ?? r.total_posicoes,
    idResponsavel: r.idResponsavel ?? r.id_vendedor_responsavel ?? null,
    criadoEm: r.criadoEm ?? r.criado_em,
    atualizadoEm: r.atualizadoEm ?? r.atualizado_em ?? null,
    
  };
}

export class GondolaEntity {
  static async list(idLoja?: number): Promise<Gondola[]> {
    const qs = idLoja ? `?idLoja=${idLoja}` : "";
    const res = await fetch(`${API_BASE()}/gondolas${qs}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(async () => ({ message: await res.text() }));

      // 401 = não autenticado
      if (res.status === 401) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
    
      // 403 = bloqueio (feature flag / tenant / permissão)
      if (res.status === 403) {
        throw new Error(body?.message ?? "Acesso negado para este módulo.");
      }
    
      throw new Error(body?.message ?? `Erro ao carregar gôndola (${res.status}).`);
    }


    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (json?.data ?? []);
    return rawList.map(mapRaw);
  }


  static async create(data: GondolaFormData): Promise<Gondola> {
    const res = await fetch(`${API_BASE()}/gondolas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao criar gôndola: ${res.status} - ${text}`);
    }

    // === ALTERADO: deixa mapRaw decidir se veio {data:{}} ou objeto puro ===
    const raw = await res.json();
    return mapRaw(raw);
  }

  static async get(idGondola: number): Promise<Gondola> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}`, {
      cache: "no-store",
      credentials: "include", // ✅
    });
    if (!res.ok) throw new Error("Erro ao carregar gôndola");
    const raw = await res.json();
    return mapRaw(raw);
  }

  static async update(idGondola: number, data: GondolaFormData): Promise<Gondola> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao atualizar gôndola: ${res.status} - ${text}`);
    }

    // === ALTERADO: alguns backends retornam 204 (sem body) ===
    const text = await res.text();
    if (!text) return mapRaw({ idGondola });

    return mapRaw(JSON.parse(text));
  }

  static async delete(idGondola: number): Promise<void> {
    const res = await fetch(`${API_BASE()}/gondolas/${idGondola}`, {
      method: "DELETE",
      credentials: "include", // ✅
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao remover gôndola: ${res.status} - ${text}`);
    }
  }
}

// === FIM ARQUIVO AJUSTADO ===
