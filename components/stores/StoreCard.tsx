// === INÍCIO ARQUIVO AJUSTADO: components/stores/StoreCard.tsx ===
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// >>> ALTERADO: adicionado Store (ícone) no import
import { Pencil, Trash2, Store as StoreIcon } from "lucide-react";
import type { Store } from "@/entities/Store";

type StoreCardProps = {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (id: Store["id"]) => void;
};

export default function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {/* >>> ADICIONADO: ícone no card de loja */}
                <StoreIcon className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {store.name}
                </h3>
                <div className="mt-1 text-sm text-slate-600 space-y-1">
                  <div>
                    <span className="font-medium">Código:</span>{" "}
                    {store.codigoErp ?? "-"}
                  </div>
                  <div>
                    <span className="font-medium">Empresa (DB2):</span>{" "}
                    {store.idEmpresa ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(store)}
              className="flex-1 border-slate-200 hover:bg-slate-50"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(store.id)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
// === FIM ARQUIVO AJUSTADO ===
