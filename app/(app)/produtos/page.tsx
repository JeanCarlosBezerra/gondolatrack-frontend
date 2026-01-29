// app/produtos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FeatureFlagsEntity } from "@/entities/FeatureFlags";

export default function ProdutosPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await FeatureFlagsEntity.me();
        const ok = (me.flags?.MOD_PRODUTOS ?? true) === true;
        setAllowed(ok);
      } catch {
        // se falhar, por segurança deixa visível
        setAllowed(true);
      }
    })();
  }, []);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Módulo desativado para esta empresa: MOD_PRODUTOS
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
      <p className="text-slate-600 mt-2">Tela em construção.</p>
    </div>
  );
}
