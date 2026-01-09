// === INÍCIO ARQUIVO: app/gondola/page.tsx ===
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid as LayoutGridIcon, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import GondolaForm from "@/components/gondolas/GondolaForm";
import GondolaCard from "@/components/gondolas/GondolaCard";

import { StoreEntity } from "@/entities/Store";
import { GondolaEntity } from "@/entities/Gondola";
import type { Store } from "@/entities/Store";
import type { Gondola, GondolaFormData } from "@/entities/Gondola";

import { UsuarioEntity } from "@/entities/Usuarios"; // ajuste se o nome for diferente
import type { Usuario } from "@/entities/Usuarios";

export default function GondolasPage() {
  const [gondolas, setGondolas] = useState<Gondola[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [editingGondola, setEditingGondola] = useState<Gondola | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<"all" | number>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gondolasData, storesData, usuariosData] = await Promise.all([
        GondolaEntity.list(),
        StoreEntity.list(),
        UsuarioEntity.list(), // GET /usuarios
      ]);

      setGondolas(gondolasData);
      console.log("DEBUG ids:", gondolasData.map(g => ({ idLoja: g.idLoja, tipo: typeof g.idLoja })));
      setStores(storesData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error("Erro loadData:", err);
      setGondolas([]);
      setStores([]);
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  };

  // === ALTERADO: handleSubmit corrigido (sem função duplicada) ===
const handleSubmit = async (data: GondolaFormData) => {
  try {
    if (editingGondola?.idGondola) {
      await GondolaEntity.update(editingGondola.idGondola, data);
    } else {
      await GondolaEntity.create(data);
    }

    setShowForm(false);
    setEditingGondola(null);
    await loadData();
  } catch (err) {
    console.error("Erro ao salvar gôndola:", err);
    alert("Não foi possível salvar a gôndola. Verifique o console e tente novamente.");
  }
};

  const handleEdit = (g: Gondola) => {
    setEditingGondola(g);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta gôndola?")) return;
    await GondolaEntity.delete(id);
    await loadData();
  };

  const filteredGondolas =
    selectedStore === "all"
      ? gondolas
      : gondolas.filter((g) => Number(g.idLoja) === Number(selectedStore));

  const getStoreName = (storeId: number) => {
    const store = stores.find((s) => Number(s.id) === Number(storeId));
    return store ? store.name : "Loja não encontrada";
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gôndolas</h1>
            <p className="text-slate-600">Organize suas gôndolas por loja</p>
          </div>

          <Button
            onClick={() => {
              setEditingGondola(null);
              setShowForm((prev) => !prev);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Gôndola
          </Button>
        </div>

        {stores.length > 0 && !showForm && (
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-slate-500" />
            <div className="relative">
              <select
                className="w-64 appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedStore === "all" ? "all" : String(selectedStore)}
                onChange={(e) =>
                  setSelectedStore(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <option value="all">Todas as Lojas</option>
                {stores.map((store) => (
                  <option key={store.id} value={String(store.id)}>
                    {store.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
                ▼
              </span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <GondolaForm
              gondola={editingGondola}
              stores={stores}
              usuarios={usuarios}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingGondola(null);
              }}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredGondolas.length === 0 ? (
          <div className="text-center py-16">
            <LayoutGridIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {selectedStore === "all"
                ? "Nenhuma gôndola cadastrada"
                : "Nenhuma gôndola nesta loja"}
            </h3>
            <p className="text-slate-500 mb-6">
              {stores.length === 0
                ? "Primeiro cadastre uma loja para adicionar gôndolas"
                : "Comece adicionando sua primeira gôndola"}
            </p>
            {stores.length > 0 && (
              <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Gôndola
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGondolas.map((g) => (
              <GondolaCard
              key={g.idGondola}
              gondola={g}
              storeName={getStoreName(g.idLoja)}
              usuarios={usuarios}     // ✅ AQUI
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// === FIM ARQUIVO ===
