"use client";

import React, { useState, useEffect } from "react";
import { StoreEntity } from "@/entities/all";
import type { Store } from "@/entities/all";


import { Button } from "@/components/ui/button";
import { Plus, Store as StoreIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import StoreForm from "@/components/stores/StoreForm";
import StoreCard from "@/components/stores/StoreCard";
import { GondolaFormData } from "@/entities/Gondola";

export default function LojasPage() {
    
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadStores();
  }, []);

const handleSubmit = async (data: {
  nome: string;
  codigoErp: string;
  idEmpresa: number | null;
}) => {
  await StoreEntity.create(data);
  setShowForm(false);
  setEditingStore(null);
  await loadStores();
};

const handleEdit = (store: Store) => {
  setEditingStore(store);
  setShowForm(true);
};

  const loadStores = async () => {
    setIsLoading(true);
    try {
      const data = await StoreEntity.list();
      console.log("LOJAS:", data); // debug
      setStores(data);
    } catch (err) {
      console.error("Erro loadStores:", err);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (storeId: Store["id"]) => {
    if (confirm("Tem certeza que deseja excluir esta loja?")) {
      await StoreEntity.delete(storeId);
      loadStores();
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Lojas</h1>
            <p className="text-slate-600">Gerencie todas as suas lojas</p>
          </div>
          <Button
            onClick={() => {
              setEditingStore(null);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Loja
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <StoreForm
            store={
              editingStore
                ? {
                    nome: editingStore.name,
                    codigoErp: editingStore.codigoErp,
                    idEmpresa: editingStore.idEmpresa ?? null,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingStore(null);
            }}
          />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16">
            <StoreIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhuma loja cadastrada
            </h3>
            <p className="text-slate-500 mb-6">
              Comece adicionando sua primeira loja
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Loja
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
// === FIM ARQUIVO AJUSTADO ===
