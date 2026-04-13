import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import ExtratoGenerator from "@/components/ExtratoGenerator";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Sun, Moon, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-background -z-10" />
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient blobs */}
        <div
          className="absolute rounded-full blur-[120px] opacity-20 dark:opacity-15"
          style={{
            width: 500,
            height: 500,
            background: "radial-gradient(circle, #22c55e, transparent 70%)",
            top: -100,
            left: -100,
          }}
        />
        <div
          className="absolute rounded-full blur-[120px] opacity-15 dark:opacity-10"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
            top: "40%",
            right: -150,
          }}
        />
        <div
          className="absolute rounded-full blur-[100px] opacity-10 dark:opacity-[0.07]"
          style={{
            width: 350,
            height: 350,
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
            bottom: -50,
            left: "30%",
          }}
        />
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Extratos <span className="text-primary">Lives</span>
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Alternar tema"
              className="rounded-lg"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Painel Admin</span>
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 rounded-lg text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-4">
        <ExtratoGenerator />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/40 backdrop-blur-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Extratos Lives &copy; {new Date().getFullYear()}</span>
          <span>Gerador de extratos bancários personalizados</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
