// === INÍCIO ARQUIVO: entities/Usuarios.ts (ALTERADO) ===
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";

export type Usuario = { idUsuario: number; nomeUsuario: string };

function mapUsuario(raw: any): Usuario {
  const id = raw?.idUsuario ?? raw?.id_usuario ?? raw?.id ?? raw?.IDUSUARIO;
  const nome =
    raw?.nomeUsuario ?? raw?.nome_usuario ?? raw?.nome ?? raw?.username ?? raw?.NOME ?? "";

  return {
    idUsuario: Number(id),
    nomeUsuario: String(nome ?? "").trim(),
  };
}

export class UsuarioEntity {
  static async list(): Promise<Usuario[]> {
    const json = await apiFetch<any>(`${API_BASE()}/usuarios`, { cache: "no-store" });

    const list: any[] = Array.isArray(json) ? json : (json?.data ?? []);
    const mapped: Usuario[] = list.map(mapUsuario);

    return mapped.filter(
      (u: Usuario) => Number.isFinite(u.idUsuario) && u.idUsuario > 0 && !!u.nomeUsuario
    );
  }
}

// === FIM ARQUIVO ===
