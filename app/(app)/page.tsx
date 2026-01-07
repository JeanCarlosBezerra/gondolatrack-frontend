// === INÍCIO ARQUIVO AJUSTADO: app/page.tsx ===
"use client";

import React, { useState, useEffect } from "react";
import { StoreEntity, GondolaEntity } from "@/entities/all";
import { Gondola, ProductPositionEntity } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, LayoutGrid, Package, AlertTriangle, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductPosition } from "@/entities/ProductPosition";
import Link from "next/link";
import { createPageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GondolaProduto, GondolaProdutoEntity } from "@/entities/GondolaProduto";

type Stats = {
  stores: number;
  gondolas: number;
  products: number;
  lowStock: number;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;          // ex: "bg-blue-600"
  link?: string;
  isLoading: boolean;
};

function StatCard({ title, value, icon: Icon, color, link, isLoading }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white">
      <div
        className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${color} rounded-full opacity-5`}
      />
      <CardHeader className="p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-4xl font-bold text-slate-900">
                {value}
              </CardTitle>
            )}
          </div>
          <div className={`p-4 rounded-2xl bg-opacity-10 ${color}`}>
            <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
          </div>
        </div>
        {link && (
          <Link href={link}>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-0"
            >
              Ver detalhes →
            </Button>
          </Link>
        )}
      </CardHeader>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    stores: 0,
    gondolas: 0,
    products: 0,
    lowStock: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
  const stores = await StoreEntity.list();
  const gondolas = await GondolaEntity.list();

  // === ALTERAÇÃO: buscar produtos por gôndola e somar ===
    const produtosPorGondola = await Promise.all(
      gondolas.map((g) => GondolaProdutoEntity.listByGondola(g.idGondola))
    );
  
      const produtos = produtosPorGondola.flat();
  
    // Sugestão de alerta: estoque atual < mínimo
    const lowStock = produtos.filter((p) => (p.estoqueAtual ?? 0) < (p.minimo ?? 0)).length;
  
    setStats({
      stores: stores.length,
      gondolas: gondolas.length,
      products: produtos.length,
      lowStock,
    });
  
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">
            Visão geral do sistema de gerenciamento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Lojas"
            value={stats.stores}
            icon={Store}
            color="bg-blue-600"
            link={createPageUrl("Lojas")}
            isLoading={isLoading}
          />
          <StatCard
            title="Total de Gôndolas"
            value={stats.gondolas}
            icon={LayoutGrid}
            color="bg-purple-600"
            link={createPageUrl("Gondolas")}
            isLoading={isLoading}
          />
          <StatCard
            title="Produtos Cadastrados"
            value={stats.products}
            icon={Package}
            color="bg-emerald-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Alertas de Estoque"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="bg-amber-600"
            isLoading={isLoading}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={createPageUrl("Lojas")}>
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20">
                  <Store className="w-4 h-4 mr-2" />
                  Cadastrar Nova Loja
                </Button>
              </Link>
              <Link href={createPageUrl("Gondolas")}>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md shadow-purple-500/20">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Cadastrar Nova Gôndola
                </Button>
              </Link>
              <Link href="/abastecimento">
                <Button className="w-full justify-start bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-500/20">
                  <Package className="w-4 h-4 mr-2" />
                  Gerar Abastecimento
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Bem-vindo ao GondolaTrack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">
                Sistema completo para gerenciar suas lojas, gôndolas e produtos
                com eficiência.
              </p>
              <ul className="space-y-2 text-blue-50 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  Controle de estoque em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  Relatórios de reposição automáticos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  Fitas de conferência personalizadas
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
// === FIM ARQUIVO AJUSTADO ===
