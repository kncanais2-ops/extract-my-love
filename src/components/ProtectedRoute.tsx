import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getFingerprint } from "@/lib/fingerprint";

type DeviceCheck = "pending" | "ok" | "blocked";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [deviceCheck, setDeviceCheck] = useState<DeviceCheck>("pending");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setDeviceCheck("pending");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [fingerprint, deviceRes] = await Promise.all([
          getFingerprint(),
          supabase
            .from("authorized_devices")
            .select("fingerprint")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        ]);
        if (cancelled) return;

        const device = deviceRes.data;
        if (!device || device.fingerprint !== fingerprint) {
          await supabase.auth.signOut();
          if (!cancelled) setDeviceCheck("blocked");
          return;
        }
        setDeviceCheck("ok");
      } catch {
        if (!cancelled) setDeviceCheck("ok");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, loading]);

  if (loading || (session && deviceCheck === "pending")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session || deviceCheck === "blocked") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
