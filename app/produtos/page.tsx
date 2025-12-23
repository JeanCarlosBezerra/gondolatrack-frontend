// === INÍCIO ARQUIVO AJUSTADO: app/produtos/page.tsx ===
"use client";

import React, { useEffect, useState } from "react";

import type { Product } from "@/entities/Product";
import { ProductEntity } from "@/entities/Product";
import type { ProductPosition } from "@/entities/ProductPosition";

import type { Gondola } from "@/entities/Gondola";
import { GondolaEntity } from "@/entities/Gondola";

import { ProductPositionEntity } from "@/entities/ProductPosition";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type FormState = {
  gondolaId: string;
  productId: string; // guardamos em string só para o form, depois convertemos pra number
  position: number;
};

export default function ProdutosPage() {
  const [positions, setPositions] = useState<ProductPosition[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gondolas, setGondolas] = useState<Gondola[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  // 👉 Campo para digitação / bipagem do EAN
  const [eanInput, setEanInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [eanError, setEanError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    gondolaId: "",
    productId: "",
    position: 1,
  });


  // Carregar tudo ao abrir
// Sempre que a gôndola do formulário mudar, carrega as posições dela
  useEffect(() => {
    const loadPositions = async () => {
      if (!form.gondolaId) {
        setPositions([]);
        return;
      }

      try {
        const data = await ProductPositionEntity.listByGondola(
          Number(form.gondolaId),
        );
        setPositions(data);
      } catch (err) {
        console.error("Erro ao carregar posições da gôndola:", err);
      }
    };

    loadPositions();
  }, [form.gondolaId]);

  // 👉 quando digita / bipa o EAN
  const handleChangeEan = (value: string) => {
    const sanitized = value.trim();
    setEanInput(sanitized);
    setEanError(null);

    // Se apagou tudo
    if (!sanitized) {
      setSelectedProduct(null);
      setForm((prev) => ({ ...prev, productId: "" }));
      return;
    }

    // podemos esperar um mínimo de dígitos (pra não ficar acusando erro enquanto digita)
    if (sanitized.length < 8) {
      setSelectedProduct(null);
      setForm((prev) => ({ ...prev, productId: "" }));
      return;
    }

    const normalized = sanitized.replace(/\D/g, "");

    const found = products.find(
      (p) => p.ean.replace(/\D/g, "") === normalized
    );

    if (!found) {
      setSelectedProduct(null);
      setForm((prev) => ({ ...prev, productId: "" }));
      setEanError("Nenhum produto encontrado para esse EAN");
      return;
    }

    setSelectedProduct(found);
    setForm((prev) => ({ ...prev, productId: String(found.id) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!form.gondolaId || !form.productId) {
    return;
  }

  await ProductPositionEntity.create({
    idGondola: Number(form.gondolaId),
    idProduto: Number(form.productId),
    posicao: Number(form.position) || 1,
    estoqueMaximo: null,
    estoqueAtual: null,
  });

  // Recarrega as posições da gôndola atual
  const data = await ProductPositionEntity.listByGondola(
    Number(form.gondolaId),
  );
  setPositions(data);

  setShowForm(false);
  setForm({ gondolaId: "", productId: "", position: 1 });
};

  const handleRemove = async (id: number) => {
    await ProductPositionEntity.delete(id);

    if (form.gondolaId) {
      const data = await ProductPositionEntity.listByGondola(
        Number(form.gondolaId),
      );
      setPositions(data);
    } else {
      setPositions([]);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-600">Gerencie produtos nas gôndolas</p>
        </div>

        <Button
          onClick={() => {
            setShowForm(true);
            setForm({ gondolaId: "", productId: "", position: 1 });
            setEanInput("");
            setSelectedProduct(null);
            setEanError(null);
          }}
          className="bg-green-600 hover:bg-green-700"
          type="button"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Formulário de cadastro */}
      {showForm && (
        <Card className="p-6 mb-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gôndola */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Gôndola
                </label>2
                <select
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={form.gondolaId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, gondolaId: e.target.value }))
                  }
                >
                  <option value="">Selecione a gôndola</option>
                  {gondolas.map((g) => (
                    <option key={g.idGondola} value={g.idGondola}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produto via EAN */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Produto (EAN)
                </label>
                <Input
                  value={eanInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChangeEan(e.target.value)
                  }
                  placeholder="Digite ou bip o código de barras"
                />

                {selectedProduct && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-medium">
                      {selectedProduct.name}
                    </span>{" "}
                    <span className="text-slate-400">
                      — EAN {selectedProduct.ean}
                    </span>
                  </p>
                )}

                {eanError && (
                  <p className="text-xs text-red-500 mt-1">{eanError}</p>
                )}
              </div>

              {/* Posição */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Posição
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.position}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((prev) => ({
                      ...prev,
                      position: Number(e.target.value || 1),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm({ gondolaId: "", productId: "", position: 1 });
                  setEanInput("");
                  setSelectedProduct(null);
                  setEanError(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                Salvar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de produtos nas gôndolas */}
      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : positions.length === 0 ? (
        <p className="text-slate-500 mt-6">
          Nenhum produto cadastrado nas gôndolas ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => {
            const product = products.find((p) => p.id === pos.productId);
            const gondola = gondolas.find((g) => g.idGondola === pos.gondolaId);

            return (
              <Card
                key={pos.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {product?.name ?? "Produto"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {gondola?.nome ?? "Gôndola"} — posição {pos.position}
                  </p>
                  {product?.ean && (
                    <p className="text-xs text-slate-400 mt-1">
                      EAN: {product.ean}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(pos.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === FIM ARQUIVO AJUSTADO: app/produtos/page.tsx ===
