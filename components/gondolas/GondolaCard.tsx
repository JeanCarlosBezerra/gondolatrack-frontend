// === INÍCIO ARQUIVO AJUSTADO: components/gondolas/GondolaCard.tsx ===
"use client";

import React, { useEffect, useState } from "react"; // === ALTERAÇÃO: useEffect, useState ===
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, User, Tag, MapPin, Trash2 } from "lucide-react";
import type { Gondola } from "@/entities/Gondola";
import { useRouter } from "next/navigation";
import { Usuario } from "@/entities/Usuarios";
import { API_BASE } from "@/lib/api"; // === ALTERAÇÃO: ajuste o import conforme seu projeto ===
import { apiFetch } from "@/lib/apiFetch";

interface GondolaCardProps {
  gondola: Gondola;
  usuarios: Usuario[];
  storeName: string;
  onEdit: (gondola: Gondola) => void;
  onDelete: (id: number) => void;
  onStatusLoaded?: (idGondola: number, status: "PENDENTE" | "CONFERIDA" | "DIVERGENTE") => void;
}

type StatusConferencia = "PENDENTE" | "CONFERIDA" | "DIVERGENTE";

export default function GondolaCard({
  gondola,
  storeName,
  usuarios,
  onEdit,
  onDelete,
  onStatusLoaded, 
}: GondolaCardProps) {
  const router = useRouter();

  const corredor = (gondola as any).corredorSecao ?? null;
  const marca = (gondola as any).marca ?? null;
  const idResponsavel = (gondola as any).idResponsavel ?? null;

  const responsavelNome =
    usuarios.find((u) => Number(u.idUsuario) === Number(idResponsavel))?.nomeUsuario ??
    (idResponsavel ? `#${idResponsavel}` : "—");

  // === ALTERAÇÃO: status da conferência ===
  const [status, setStatus] = useState<StatusConferencia>("PENDENTE");
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;

    async function carregarUltima() {
      try {
        setLoadingStatus(true);

        const resp = await apiFetch(
          `${API_BASE()}/gondolas/${gondola.idGondola}/conferencia/ultima`,
          { credentials: "include", cache: "no-store" }
        );

        const json = await resp.json().catch(() => null);

        // seu backend retorna: { ok: true, data: ultima }
        const ultima = json?.data ?? null;

        if (!alive) return;

        if (!ultima) {
          setStatus("PENDENTE");
          return;
        }

      if (!alive) return;

      const novoStatus: StatusConferencia =
        !ultima ? "PENDENTE"
        : String(ultima.status ?? "").toUpperCase() === "DIVERGENTE"
          ? "DIVERGENTE"
          : "CONFERIDA";

      setStatus(novoStatus);
      onStatusLoaded?.(gondola.idGondola, novoStatus);

      } catch {
        // em caso de erro, não “quebra” card: mantém pendente
        if (!alive) return;
        setStatus("PENDENTE");
      } finally {
        if (!alive) return;
        setLoadingStatus(false);
      }
      
    }

    carregarUltima();
    
    return () => {
      alive = false;
    };
  }, [gondola.idGondola]);

  // === ALTERAÇÃO: cor do badge ===
  function badgeClass() {
    if (status === "DIVERGENTE") return "bg-red-100 text-red-800 border border-red-200";
    if (status === "CONFERIDA") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    return "bg-slate-100 text-slate-700 border border-slate-200";
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
      <Card
        className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
        onClick={() => router.push(`/gondola/${gondola.idGondola}`)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{gondola.nome}</h3>

                {/* === ALTERAÇÃO: Badge do status === */}
                <div className="mt-1">
                  <Badge className={badgeClass()}>
                    {loadingStatus ? "STATUS..." : status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{storeName}</span>
          </div>

          <div className="text-sm text-slate-700">
            <span className="font-medium">Seção/Corredor:</span>{" "}
            <span className="text-slate-600">{corredor ?? "—"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="font-medium">Marca:</span>{" "}
            <span className="text-slate-600">{marca ?? "—"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <User className="w-4 h-4 text-slate-500" />
            <span className="font-medium">Responsável:</span>
            <span className="text-slate-600">{responsavelNome}</span>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(gondola);
              }}
            >
              Editar
            </Button>

            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(gondola.idGondola);
              }}
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
