import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import HeaderBar from "@/components/layout/HeaderBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="gt-shell min-h-screen flex bg-slate-50">
        <div className="gt-sidebar">
          <Sidebar />
        </div>

        <main className="gt-main flex-1 flex flex-col">
          <div className="gt-topbar">
            <HeaderBar />
          </div>

          <section className="gt-content flex-1 p-6">{children}</section>
        </main>
      </div>
    </AuthProvider>
  );
}
