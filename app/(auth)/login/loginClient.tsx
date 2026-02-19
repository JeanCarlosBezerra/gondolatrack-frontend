"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setLoading(true);
    setErro(null);

    try {
      const resp = await fetch(`${API_BASE()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setErro(data?.message ?? "Falha no login");
        return;
      }

      const next = params.get("next") || "/";
      router.replace(next);
    } catch {
      setErro("Não foi possível conectar no servidor.");
    } finally {
      setLoading(false);
    }
  }
  console.log("API_BASE() =", API_BASE());
return (
  <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold shadow">
          GT
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          GondolaTrack
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Faça login para continuar
        </p>
      </div>

      <Card className="border border-slate-200 shadow-xl">
        <CardContent className="p-6 space-y-4">
          {erro && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Usuário</label>
            <Input
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <Input
              placeholder="Digite sua senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? entrar() : null)}
              autoComplete="current-password"
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={entrar}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-xs text-slate-400 text-center pt-1">
            © {new Date().getFullYear()} GondolaTrack
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}
