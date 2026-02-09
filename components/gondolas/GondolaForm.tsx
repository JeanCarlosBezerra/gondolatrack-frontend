// components/gondolas/GondolaForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { XCircle, Save } from "lucide-react";

import type { Store } from "@/entities/Store";
import type { Gondola, GondolaFormData } from "@/entities/Gondola";
import type { Usuario } from "@/entities/Usuarios";
import { LojaLocalEstoque, LojaLocalEstoqueEntity } from "@/entities/LojaLocalEstoque";

interface GondolaFormProps {
  gondola?: Gondola | null;
  stores: Store[];
  usuarios: Usuario[];
  onSubmit: (data: GondolaFormData) => void | Promise<void>;
  onCancel: () => void;
}

export default function GondolaForm({
  gondola,
  stores,
  usuarios,
  onSubmit,
  onCancel,
}: GondolaFormProps) {
  // === ALTERADO: estado completo incluindo seção/corredor, marca e posições ===
  const [idLoja, setIdLoja] = useState<number>(gondola?.idLoja ?? 0);
  const [nome, setNome] = useState<string>(gondola?.nome ?? "");

  const [corredorSecao, setCorredorSecao] = useState<string>(
    gondola?.corredorSecao ?? ""
  );
  const [marca, setMarca] = useState<string>(gondola?.marca ?? "");
  const [totalPosicoes, setTotalPosicoes] = useState<number>(
    gondola?.totalPosicoes ?? 20
  );

  const [idResponsavel, setIdResponsavel] = useState<number | null>(
    gondola?.idResponsavel ?? null
  );

  const storeOptions = useMemo(() => stores ?? [], [stores]);
  const userOptions = useMemo(() => usuarios ?? [], [usuarios]);
  const [locaisEstoque, setLocaisEstoque] = useState<LojaLocalEstoque[]>([]);
  const [idLojaLocalEstoque, setIdLojaLocalEstoque] = useState<number | null>(
    gondola?.idLojaLocalEstoque ?? null
  );

  useEffect(() => {
    if (!idLoja) {
      setLocaisEstoque([]);
      setIdLojaLocalEstoque(null);
      return;
    }

    (async () => {
      const list = await LojaLocalEstoqueEntity.listByLoja(idLoja);
      setLocaisEstoque(list);

      if (!idLojaLocalEstoque && list.length) {
        const venda = list.find(l => l.papelNaLoja === 'VENDA');
        setIdLojaLocalEstoque(
          (venda ?? list[0]).idLojaLocalEstoque
        );
      }
    })();
  }, [idLoja]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idLoja || idLoja <= 0) {
      alert("Selecione uma loja.");
      return;
    }
    if (!nome.trim()) {
      alert("Informe o nome da gôndola.");
      return;
    }
    if (!totalPosicoes || totalPosicoes <= 0) {
      alert("Total de posições deve ser maior que 0.");
      return;
    }

    if (!idLojaLocalEstoque) {
      alert('Selecione o local de estoque.');
      return;
    }


    const payload: GondolaFormData = {
      idLoja,
      idLojaLocalEstoque,
      nome: nome.trim(),
      corredorSecao: corredorSecao.trim() ? corredorSecao.trim() : null,
      marca: marca.trim() ? marca.trim() : null,
      totalPosicoes: Number(totalPosicoes),
      idResponsavel: idResponsavel ?? null,
    };

    await onSubmit(payload);
  };

  

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/60 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          {gondola ? "Editar Gôndola" : "Nova Gôndola"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <Label className="text-slate-700">Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: TINTA 01"
            />
          </div>

          {/* Loja */}
          <div>
            <Label className="text-slate-700">Loja</Label>
            <select
              className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={String(idLoja)}
              onChange={(e) => setIdLoja(Number(e.target.value))}
            >
              <option value="0">Selecione</option>
              {storeOptions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-slate-700">Local de Estoque</Label>
            <select
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm"
              value={idLojaLocalEstoque ?? ''}
              onChange={(e) => setIdLojaLocalEstoque(Number(e.target.value))}
              disabled={!idLoja}
            >
              <option value="">Selecione</option>
              {locaisEstoque.map((l) => (
                <option key={l.idLojaLocalEstoque} value={l.idLojaLocalEstoque}>
                  {l.papelNaLoja} (Local #{l.idLocalEstoque})
                </option>
              ))}
            </select>
          </div>

          {/* Responsável */}
          <div>
            <Label className="text-slate-700">Responsável</Label>
            <select
              className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={idResponsavel == null ? "" : String(idResponsavel)}
              onChange={(e) =>
                setIdResponsavel(e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">Selecione</option>
              {userOptions.map((u) => (
                <option key={u.idUsuario} value={String(u.idUsuario)}>
                  {u.nomeUsuario || `#${u.idUsuario}`}
                </option>
              ))}
            </select>
          </div>

          {/* Seção/Corredor + Marca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Seção/Corredor</Label>
              <Input
                value={corredorSecao}
                onChange={(e) => setCorredorSecao(e.target.value)}
                placeholder="Ex: Corredor 3"
              />
            </div>

            <div>
              <Label className="text-slate-700">Marca</Label>
              <Input
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Coral"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
