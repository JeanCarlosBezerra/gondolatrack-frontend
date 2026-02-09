// === INÍCIO ARQUIVO: entities/LojaLocalEstoque.ts ===
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE } from '@/lib/api';

export type LojaLocalEstoque = {
  idLojaLocalEstoque: number;
  idLoja: number;
  idEmpresa: number;
  idLocalEstoque: number;
  papelNaLoja: 'VENDA' | 'DEPOSITO' | 'CD';
};

export type LojaLocalEstoqueCreateData = {
  idEmpresa: number;
  idLocalEstoque: number;
  papelNaLoja: 'VENDA' | 'DEPOSITO' | 'CD';
};

function mapRaw(r: any): LojaLocalEstoque {
  return {
    idLojaLocalEstoque: Number(r.idLojaLocalEstoque ?? r.id_loja_local_estoque),
    idLoja: Number(r.idLoja ?? r.id_loja ?? 0),
    idEmpresa: Number(r.idEmpresa ?? r.id_empresa ?? 0),
    idLocalEstoque: Number(r.idLocalEstoque ?? r.id_local_estoque ?? 0),
    papelNaLoja: (r.papelNaLoja ?? r.papel_na_loja) as any,
  };
}

export class LojaLocalEstoqueEntity {
  static async listByLoja(idLoja: number): Promise<LojaLocalEstoque[]> {
    const data = await apiFetch<any>(
      `${API_BASE()}/lojas/${idLoja}/locais-estoque`,
      { cache: 'no-store' }
    );

    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.map(mapRaw);
  }

  static async create(idLoja: number, payload: LojaLocalEstoqueCreateData): Promise<LojaLocalEstoque> {
    const data = await apiFetch<any>(
      `${API_BASE()}/lojas/${idLoja}/locais-estoque`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }
    );

    return mapRaw(data?.data ?? data);
  }

  static async remove(idLojaLocalEstoque: number): Promise<void> {
    await apiFetch(
      `${API_BASE()}/lojas/locais-estoque/${idLojaLocalEstoque}`,
      { method: 'DELETE', cache: 'no-store' }
    );
  }
}
// === FIM ARQUIVO ===
