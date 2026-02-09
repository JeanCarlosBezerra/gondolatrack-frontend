// === INÍCIO ARQUIVO NOVO: src/entities/FeatureCatalog.ts ===
import { API_BASE } from "@/lib/api";
import { apiFetch } from "@/lib/apiFetch";

export type FeatureCatalogItem = {
  key: string;
  label: string;
  description?: string;
  group: string;
};

export class FeatureCatalogEntity {
  static async list(): Promise<FeatureCatalogItem[]> {
    const data = await apiFetch<{ items: FeatureCatalogItem[] }>(
      `${API_BASE()}/feature-flags/catalog`,
      { cache: "no-store" }
    );
    return data?.items ?? [];
  }
}
// === FIM ARQUIVO ===
