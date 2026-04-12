import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExtratoGenerator from "@/components/ExtratoGenerator";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center p-4 border-b bg-card">
        <div className="font-semibold text-lg text-primary">Sistema</div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Painel Admin
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>
      <main className="p-4">
        <ExtratoGenerator />
      </main>
    </div>
  );
};

export default Index;
