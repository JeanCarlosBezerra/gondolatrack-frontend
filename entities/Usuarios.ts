// === INÍCIO ARQUIVO: entities/Usuario.ts ===
export type Usuario = { idUsuario: number; nomeUsuario: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export class UsuarioEntity {
  static async list(): Promise<Usuario[]> {
    const res = await fetch(`${API_BASE}/usuarios`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar usuários");
    return (await res.json()) as Usuario[];
  }
}
// === FIM ARQUIVO ===
