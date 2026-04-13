import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGeoIP } from "@/lib/geoip";
import { getFingerprint } from "@/lib/fingerprint";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBlocked(false);

    // 1. Gera o fingerprint do dispositivo
    const fingerprint = await getFingerprint();

    // 2. Faz o login
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const user = authData.user;

    // 3. Verifica se já tem dispositivo autorizado
    const { data: device } = await supabase
      .from("authorized_devices")
      .select("fingerprint")
      .eq("user_id", user.id)
      .single();

    if (device) {
      // Já tem dispositivo registrado — verifica se é o mesmo
      if (device.fingerprint !== fingerprint) {
        // Dispositivo diferente — bloqueia
        await supabase.auth.signOut();
        setBlocked(true);
        setLoading(false);
        return;
      }
    } else {
      // Primeiro login — registra este dispositivo como autorizado
      await supabase.from("authorized_devices").insert({
        user_id: user.id,
        fingerprint,
        device_label: navigator.userAgent.slice(0, 100),
      });
    }

    // 4. Sessão única — invalida outras sessões
    // (re-autentica para garantir sessão fresca)
    await supabase.auth.signOut({ scope: "others" as "global" });

    // 5. Registra o login com IP e localização (aguarda antes de navegar)
    try {
      const geo = await getGeoIP();
      await supabase.from("login_logs").insert({
        user_id: user.id,
        ip_address: geo.ip,
        region: geo.region,
        city: geo.city,
        country: geo.country,
        isp: geo.isp,
      });
    } catch (geoErr) {
      console.error("Erro ao registrar login:", geoErr);
    }

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Entrar</CardTitle>
          <p className="text-sm text-muted-foreground">Acesse sua conta</p>
        </CardHeader>
        <CardContent>
          {blocked ? (
            <div className="text-center space-y-3 py-4">
              <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
              <h3 className="font-semibold text-destructive">Dispositivo não autorizado</h3>
              <p className="text-sm text-muted-foreground">
                Esta conta já está vinculada a outro dispositivo. Entre em contato com o administrador para liberar o acesso.
              </p>
              <Button variant="outline" onClick={() => setBlocked(false)} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Entrar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
