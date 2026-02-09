// entities/Auth.ts
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";

export type AuthMe = {
  ok: boolean;
  user: {
    username: string;
    nome?: string | null;
    idEmpresa: number;
    roles?: string; // CSV
  };
};

export class AuthEntity {
  static async me(): Promise<AuthMe> {
    return apiFetch<AuthMe>(`${API_BASE()}/auth/me`, { cache: "no-store" });
  }
}
