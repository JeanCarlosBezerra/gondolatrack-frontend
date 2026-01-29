// === INÍCIO ARQUIVO NOVO: src/entities/FeatureFlags.ts ===
import { API_BASE } from "@/lib/api";

export type FeatureFlagsMe = {
  ok: boolean;
  idEmpresa: number;
  flags: Record<string, boolean>;
};

export class FeatureFlagsEntity {
  static async me(): Promise<FeatureFlagsMe> {
    const res = await fetch(`${API_BASE()}/feature-flags/me`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Erro ao carregar feature flags.");
    }

    return (await res.json()) as FeatureFlagsMe;
  }
}
// === FIM ARQUIVO NOVO ===
