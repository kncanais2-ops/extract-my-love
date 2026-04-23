import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGeoIP } from "@/lib/geoip";
import { getFingerprint } from "@/lib/fingerprint";
import "./Login.css";

const BASE_CORD = 100;
const MAX_PULL = 80;
const TRIGGER = 45;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [expired, setExpired] = useState(false);
  const [lit, setLit] = useState(false);
  const [justLit, setJustLit] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const knobRef = useRef<HTMLDivElement>(null);
  const cordRef = useRef<HTMLDivElement>(null);
  const cordSwingRef = useRef<HTMLDivElement>(null);

  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const pullRef = useRef(0);
  const fingerprintRef = useRef<Promise<string> | null>(null);

  const setPull = (value: number) => {
    const clamped = Math.max(0, Math.min(MAX_PULL, value));
    pullRef.current = clamped;
    if (cordRef.current) cordRef.current.style.height = `${BASE_CORD + clamped}px`;
    if (knobRef.current) knobRef.current.style.top = `${BASE_CORD + clamped}px`;
  };

  const triggerSwing = () => {
    const swing = cordSwingRef.current;
    if (!swing) return;
    swing.classList.remove("swinging");
    void swing.offsetWidth;
    swing.classList.add("swinging");
    window.setTimeout(() => swing.classList.remove("swinging"), 2300);
  };

  const toggleLamp = () => {
    setLit((prev) => {
      const next = !prev;
      if (next) {
        setJustLit(true);
        window.setTimeout(() => setJustLit(false), 1150);
      }
      return next;
    });
  };

  const startDrag = (clientY: number) => {
    draggingRef.current = true;
    startYRef.current = clientY;
    knobRef.current?.classList.add("pulling");
    if (cordRef.current) cordRef.current.style.transition = "none";
    cordSwingRef.current?.classList.remove("swinging");
  };

  const onMove = (clientY: number) => {
    if (!draggingRef.current) return;
    setPull(clientY - startYRef.current);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    knobRef.current?.classList.remove("pulling");
    if (cordRef.current) cordRef.current.style.transition = "";

    const shouldToggle = pullRef.current >= TRIGGER;
    const hadPull = pullRef.current > 5;
    setPull(0);

    if (shouldToggle) toggleLamp();
    if (hadPull) triggerSwing();
  };

  useEffect(() => {
    fingerprintRef.current = getFingerprint();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, []);

  const handleKnobMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientY);
  };

  const handleKnobTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientY);
  };

  const handleKnobClick = () => {
    if (pullRef.current === 0) {
      toggleLamp();
      triggerSwing();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBlocked(false);

    const fingerprintPromise = fingerprintRef.current ?? getFingerprint();

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

    const [fingerprint, deviceRes, subRes] = await Promise.all([
      fingerprintPromise,
      supabase.from("authorized_devices").select("fingerprint").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_subscriptions").select("expires_at").eq("user_id", user.id).maybeSingle(),
    ]);

    const device = deviceRes.data;
    const subscription = subRes.data;

    if (device) {
      if (device.fingerprint !== fingerprint) {
        await supabase.auth.signOut();
        setBlocked(true);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("authorized_devices").insert({
        user_id: user.id,
        fingerprint,
        device_label: navigator.userAgent.slice(0, 100),
      });
      if (insertError) {
        await supabase.auth.signOut();
        toast({
          title: "Não foi possível vincular este dispositivo",
          description: insertError.message || "Tente novamente em instantes.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    if (subscription) {
      const expiresAt = new Date(subscription.expires_at);
      if (expiresAt < new Date()) {
        await supabase.auth.signOut();
        setExpired(true);
        setLoading(false);
        return;
      }
    }

    await supabase.auth.signOut({ scope: "others" as "global" });

    void (async () => {
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
    })();

    navigate("/");
  };

  const rootClass = ["login-scene-root", lit ? "lit" : "", justLit ? "just-lit" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="scene">
        <div className="ambient" />
        <div className="glow" />

        <div className="lamp">
          <div className="floor-shadow" />
          <div className="under-shade-glow" />

          <div className="shade">
            <div className="shade-highlight" />
            <div className="shade-rim" />
          </div>

          <div className="neck" />
          <div className="stand" />

          <div className="base">
            <div className="base-top" />
          </div>

          <div className="cord-wrapper">
            <div className="cord-swing" ref={cordSwingRef}>
              <div className="cord" ref={cordRef} />
              <div
                className="knob"
                ref={knobRef}
                title="Puxe para acender"
                onMouseDown={handleKnobMouseDown}
                onTouchStart={handleKnobTouchStart}
                onClick={handleKnobClick}
              >
                <div className="knob-shine" />
              </div>
            </div>
          </div>
        </div>

        <form className="login-card" onSubmit={handleLogin} autoComplete="off">
          {expired ? (
            <div className="status-view">
              <svg className="status-icon warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3 className="warn">Assinatura expirada</h3>
              <p>Sua assinatura expirou. Para renovar o acesso, entre em contato com o administrador.</p>
              <button type="button" onClick={() => setExpired(false)}>Tentar novamente</button>
            </div>
          ) : blocked ? (
            <div className="status-view">
              <svg className="status-icon danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 3 7v6c0 5 3.8 9.3 9 10 5.2-.7 9-5 9-10V7l-9-5z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 className="danger">Dispositivo não autorizado</h3>
              <p>Esta conta já está vinculada a outro dispositivo. Entre em contato com o administrador para liberar o acesso.</p>
              <button type="button" onClick={() => setBlocked(false)}>Tentar novamente</button>
            </div>
          ) : (
            <>
              <label htmlFor="login-email">Email</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <label htmlFor="login-password">Senha</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                <span>{loading ? "Verificando..." : "Entrar"}</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
