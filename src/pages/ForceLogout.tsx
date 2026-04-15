import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ForceLogout = () => {
  useEffect(() => {
    (async () => {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
      Object.keys(localStorage).filter((k) => k.startsWith("sb-") || k.includes("supabase")).forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage).filter((k) => k.startsWith("sb-") || k.includes("supabase")).forEach((k) => sessionStorage.removeItem(k));
      window.location.replace("/login");
    })();
  }, []);
  return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Saindo...</div>;
};

export default ForceLogout;
