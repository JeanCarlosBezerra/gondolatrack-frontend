// === INÍCIO ARQUIVO AJUSTADO: components/stores/StoreForm.tsx ===
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { XCircle, Save } from "lucide-react";

export type StoreFormData = {
  nome: string;
  codigoErp: string;
  idEmpresa: number | null; // opcional
};

type StoreFormProps = {
  store?: StoreFormData;
  onSubmit: (data: StoreFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function StoreForm({ store, onSubmit, onCancel }: StoreFormProps) {
  const [formData, setFormData] = useState<StoreFormData>(
    store ?? { nome: "", codigoErp: "", idEmpresa: null }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
          <CardTitle className="text-xl font-bold">
            {store ? "Editar Loja" : "Nova Loja"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 font-medium">
                  Nome da Loja *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((p) => ({ ...p, nome: e.target.value }))
                  }
                  placeholder="Ex: DICASA - Matriz"
                  required
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoErp" className="text-slate-700 font-medium">
                  Código ERP *
                </Label>
                <Input
                  id="codigoErp"
                  value={formData.codigoErp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((p) => ({ ...p, codigoErp: e.target.value }))
                  }
                  placeholder="Ex: HCAB"
                  required
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idEmpresa" className="text-slate-700 font-medium">
                ID Empresa (DB2) (opcional)
              </Label>
              <Input
                id="idEmpresa"
                type="number"
                value={formData.idEmpresa ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((p) => ({
                    ...p,
                    idEmpresa: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="Ex: 1"
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onCancel} className="border-slate-200">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20"
              >
                <Save className="w-4 h-4 mr-2" />
                {store ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
// === FIM ARQUIVO AJUSTADO ===
