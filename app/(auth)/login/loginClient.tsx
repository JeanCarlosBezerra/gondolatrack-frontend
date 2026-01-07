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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold">GondolaTrack</h1>
          <p className="text-slate-600">Login com usuário do Windows (AD)</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {erro && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
              {erro}
            </div>
          )}

          <Input
            placeholder="Usuário (ex: jean)"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <Input
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? entrar() : null)}
          />

          <Button className="w-full" onClick={entrar} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
