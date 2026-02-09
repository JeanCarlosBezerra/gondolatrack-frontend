// ✅ entities/UsuariosAdmin.ts
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";

export type UsuarioAdmin = {
  idUsuario: number;
  username: string;
  nome: string | null;
  idEmpresa: number;
  ativo: boolean;
  authProvider: string | null;
  roles: string | null;
};

function mapRaw(raw: any): UsuarioAdmin {
  return {
    idUsuario: Number(raw.idUsuario ?? raw.id_usuario),
    username: String(raw.username),
    nome: raw.nome ?? null,
    idEmpresa: Number(raw.idEmpresa ?? raw.id_empresa),
    ativo: Boolean(raw.ativo),
    authProvider: raw.authProvider ?? raw.auth_provider ?? null,
    roles: raw.roles ?? null,
  };
}

export class UsuariosAdminEntity {
  static async list(): Promise<UsuarioAdmin[]> {
    const json = await apiFetch<any>(`${API_BASE()}/usuarios-admin`, { cache: "no-store" });
    const list = Array.isArray(json) ? json : json?.data ?? [];
    return list.map(mapRaw);
  }

  static async update(idUsuario: number, data: { ativo?: boolean; roles?: string; nome?: string | null }) {
    const raw = await apiFetch<any>(`${API_BASE()}/usuarios-admin/${idUsuario}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return mapRaw(raw);
  }
}
