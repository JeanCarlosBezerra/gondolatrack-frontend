// === INÍCIO ARQUIVO: entities/Usuario.ts ===
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";
export type Usuario = { idUsuario: number; nomeUsuario: string };

export class UsuarioEntity {
  static async list(): Promise<Usuario[]> {
    const res = await apiFetch(`${API_BASE()}/usuarios`);
    if (!res.ok) throw new Error("Erro ao carregar usuários");
    return (await res.json()) as Usuario[];
  }
}
// === FIM ARQUIVO ===
