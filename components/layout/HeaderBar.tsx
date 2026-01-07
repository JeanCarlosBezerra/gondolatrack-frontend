"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export default function HeaderBar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-slate-800">GondolaTrack</h1>

      <div className="flex items-center gap-3">
        {!loading && user?.nome && (
          <span className="text-sm text-slate-600">
            {user.nome}
          </span>
        )}

        <Button variant="outline" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
