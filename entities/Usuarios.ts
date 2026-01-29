// === INÍCIO ARQUIVO: entities/Usuario.ts ===
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";
export type Usuario = { idUsuario: number; nomeUsuario: string };

export class UsuarioEntity {
  static async list(): Promise<Usuario[]> {
    const data = await apiFetch<Usuario[]>(`${API_BASE()}/usuarios`, { cache: "no-store" });
    return data;
  }
}
// === FIM ARQUIVO ===
