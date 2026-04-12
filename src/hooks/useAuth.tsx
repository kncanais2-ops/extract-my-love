import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        try {
          // Check device on session restore (e.g. page reload)
          if (session) {
            const res = await fetch("https://api64.ipify.org?format=json").catch(() => null);
            const data = res ? await res.json().catch(() => null) : null;
            const deviceToken = data?.ip || "unknown-ip";

            if (deviceToken) {
              const { data: dbData, error } = await supabase.rpc("check_device", {
                p_device_token: deviceToken,
              });
              
              if (error) {
                console.error("Erro ao verificar dispositivo:", error);
              }

              if (dbData && (dbData as any).status === "blocked") {
                await supabase.auth.signOut();
                setSession(null);
                alert("Conta bloqueada por acesso em outro local/IP.");
              }
            }
          }
        } catch (err) {
          console.error("Erro inesperado na verificação de auth:", err);
        } finally {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
