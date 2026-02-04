// entities/LojaLocalEstoque.ts
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE } from '@/lib/api';

export type LojaLocalEstoque = {
  idLojaLocalEstoque: number;
  idLoja: number;
  idEmpresa: number;
  idLocalEstoque: number;
  papelNaLoja: 'VENDA' | 'DEPOSITO' | 'CD';
};

export class LojaLocalEstoqueEntity {
  static async listByLoja(idLoja: number): Promise<LojaLocalEstoque[]> {
    const data = await apiFetch<any>(
      `${API_BASE()}/lojas/${idLoja}/locais-estoque`,
      { cache: 'no-store' }
    );

    const list = Array.isArray(data) ? data : data?.data ?? [];

    return list.map((r: any) => ({
      idLojaLocalEstoque: r.idLojaLocalEstoque ?? r.id_loja_local_estoque,
      idLocalEstoque: r.idLocalEstoque ?? r.id_local_estoque,
      papelNaLoja: r.papelNaLoja ?? r.papel_na_loja,
    }));
  }
}
