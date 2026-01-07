import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import HeaderBar from "@/components/layout/HeaderBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <HeaderBar />
          <section className="flex-1 p-6">{children}</section>
        </main>
      </div>
    </AuthProvider>
  );
}
