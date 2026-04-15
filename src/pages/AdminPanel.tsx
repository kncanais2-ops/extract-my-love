import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, UserPlus, Trash2, Lock, Unlock, ArrowLeft, Sun, Moon,
  Users, UserCheck, UserX, RefreshCw, Search, Download, KeyRound,
  ShieldCheck, ShieldOff, ChevronUp, ChevronDown, Receipt, MapPin, X,
  Smartphone, SmartphoneNfc, Clock, CalendarClock, FileCheck, FileX, Tv2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  last_ip: string | null;
  is_blocked: boolean;
  is_admin: boolean;
  has_device: boolean;
  device_label: string | null;
  device_authorized_at: string | null;
  expires_at: string | null;
  has_comprovante: boolean;
  has_obs: boolean;
}

interface LoginLog {
  id: string;
  ip_address: string;
  region: string;
  city: string;
  country: string;
  isp: string;
  logged_in_at: string;
}

type SortField = "email" | "created_at" | "last_sign_in_at" | "status";
type SortDir = "asc" | "desc";

const AdminPanel = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [logsTarget, setLogsTarget] = useState<UserItem | null>(null);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [expirationTarget, setExpirationTarget] = useState<UserItem | null>(null);
  const [expirationDays, setExpirationDays] = useState("");

  const callAdmin = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: session?.user?.id ?? "",
        _role: "admin",
      });
      setIsAdmin(!!data);
    };
    if (session?.user) checkAdmin();
  }, [session]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await callAdmin({ action: "list_users" });
      setUsers(data.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[AdminPanel] loadUsers failed:", err);
      toast({ title: "Erro ao carregar usuários", description: message, variant: "destructive" });
    }
    setLoadingUsers(false);
  };

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { score, label: "Fraca", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Média", color: "bg-yellow-500" };
    return { score, label: "Forte", color: "bg-green-500" };
  }, [password]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "A senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "A senha deve conter pelo menos uma letra maiúscula";
    if (!/[a-z]/.test(pwd)) return "A senha deve conter pelo menos uma letra minúscula";
    if (!/\d/.test(pwd)) return "A senha deve conter pelo menos um número";
    return null;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    if (pwdError) {
      toast({ title: "Senha fraca", description: pwdError, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await callAdmin({ action: "create_user", email, password });
      toast({ title: "Usuário criado com sucesso!" });
      setEmail("");
      setPassword("");
      loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao criar usuário";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleToggleBlock = async (userId: string, block: boolean) => {
    try {
      await callAdmin({ action: "toggle_block", user_id: userId, block });
      toast({ title: block ? "Usuário bloqueado" : "Usuário desbloqueado" });
      loadUsers();
    } catch {
      toast({ title: "Erro ao alterar bloqueio", variant: "destructive" });
    }
  };

  const handleResetDevice = async (user: UserItem) => {
    try {
      await callAdmin({ action: "reset_device", user_id: user.id });
      toast({ title: "Dispositivo resetado", description: `${user.email} poderá vincular um novo dispositivo no próximo login.` });
      loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao resetar dispositivo";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const handleViewLogs = async (user: UserItem) => {
    setLogsTarget(user);
    setLoadingLogs(true);
    try {
      const data = await callAdmin({ action: "login_logs", user_id: user.id });
      setLoginLogs(data.logs || []);
    } catch {
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
    setLoadingLogs(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await callAdmin({ action: "delete_user", user_id: deleteTarget.id });
      toast({ title: "Usuário excluído" });
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast({ title: "Senha fraca", description: pwdError, variant: "destructive" });
      return;
    }
    try {
      await callAdmin({ action: "reset_password", user_id: resetTarget.id, new_password: newPassword });
      toast({ title: "Senha redefinida com sucesso!" });
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao redefinir senha";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const handleToggleRole = async (userId: string, promote: boolean) => {
    try {
      await callAdmin({ action: "toggle_role", user_id: userId, promote });
      toast({ title: promote ? "Promovido a admin" : "Permissão de admin removida" });
      loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar cargo";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const handleToggleComprovante = async (userId: string, grant: boolean) => {
    try {
      await callAdmin({ action: "toggle_comprovante", user_id: userId, grant });
      toast({ title: grant ? "Comprovante liberado" : "Comprovante removido" });
      loadUsers();
    } catch {
      toast({ title: "Erro ao alterar permissão", variant: "destructive" });
    }
  };

  const handleToggleObs = async (userId: string, grant: boolean) => {
    try {
      await callAdmin({ action: "toggle_obs", user_id: userId, grant });
      toast({ title: grant ? "OBS liberado" : "OBS removido" });
      loadUsers();
    } catch {
      toast({ title: "Erro ao alterar permissão OBS", variant: "destructive" });
    }
  };

  const handleSetExpiration = async () => {
    if (!expirationTarget || !expirationDays) return;
    try {
      await callAdmin({ action: "set_expiration", user_id: expirationTarget.id, days: Number(expirationDays) });
      toast({ title: "Validade definida", description: `${expirationTarget.email} tem ${expirationDays} dias de acesso.` });
      setExpirationTarget(null);
      setExpirationDays("");
      loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao definir validade";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const handleRemoveExpiration = async (user: UserItem) => {
    try {
      await callAdmin({ action: "remove_expiration", user_id: user.id });
      toast({ title: "Validade removida", description: `${user.email} agora tem acesso ilimitado.` });
      loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao remover validade";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const getDaysLeft = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleExportCSV = () => {
    const header = "Email,Status,Admin,Criado em,Último login\n";
    const rows = users.map((u) =>
      `${u.email},${u.is_blocked ? "Bloqueado" : "Ativo"},${u.is_admin ? "Sim" : "Não"},${new Date(u.created_at).toLocaleDateString("pt-BR")},${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "Nunca"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "usuarios.csv";
    link.click();
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Filtered and sorted
  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.email.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "email": return a.email.localeCompare(b.email) * dir;
        case "created_at": return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        case "last_sign_in_at": {
          const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          return (aTime - bTime) * dir;
        }
        case "status": return ((a.is_blocked ? 1 : 0) - (b.is_blocked ? 1 : 0)) * dir;
        default: return 0;
      }
    });
    return list;
  }, [users, search, sortField, sortDir]);

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.is_blocked).length;
    const blocked = users.filter((u) => u.is_blocked).length;
    const now = new Date();
    const thisMonth = users.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const expired = users.filter((u) => {
      if (!u.expires_at) return false;
      return new Date(u.expires_at) < now;
    }).length;
    return { total, active, blocked, thisMonth, expired };
  }, [users]);

  const formatDate = (d: string | null) => {
    if (!d) return "Nunca";
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Verificando permissões...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-semibold text-lg">Acesso negado</p>
        <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Receipt className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Painel <span className="text-primary">Admin</span>
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-lg">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Gerador</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: metrics.total, icon: Users, color: "text-foreground" },
            { label: "Ativos", value: metrics.active, icon: UserCheck, color: "text-green-500" },
            { label: "Bloqueados", value: metrics.blocked, icon: UserX, color: "text-red-500" },
            { label: "Expirados", value: metrics.expired, icon: Clock, color: "text-yellow-500" },
            { label: "Novos este mês", value: metrics.thisMonth, icon: UserPlus, color: "text-blue-500" },
          ].map((m) => (
            <Card key={m.label} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create user */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-primary" />
              Criar novo usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-lg"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="flex-1 rounded-lg"
                />
                <Button type="submit" disabled={loading} className="rounded-lg">
                  {loading ? "Criando..." : "Criar"}
                </Button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* User list */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Usuários ({users.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-lg h-9 text-sm"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={loadUsers} className="rounded-lg gap-1.5" title="Atualizar lista">
                  <RefreshCw className={`h-4 w-4 ${loadingUsers ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-lg gap-1.5" title="Exportar CSV">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers && users.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>{search ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}</p>
              </div>
            ) : (
              <>
                {/* Table header — desktop only */}
                <div className="hidden md:grid grid-cols-[1fr_80px_80px_110px_110px_100px_160px] gap-2 px-3 pb-2 text-xs font-medium text-muted-foreground">
                  <button onClick={() => handleSort("email")} className="flex items-center gap-1 hover:text-foreground transition-colors text-left">
                    Email <SortIcon field="email" />
                  </button>
                  <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Status <SortIcon field="status" />
                  </button>
                  <span>Cargo</span>
                  <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Criado <SortIcon field="created_at" />
                  </button>
                  <button onClick={() => handleSort("last_sign_in_at")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Último login <SortIcon field="last_sign_in_at" />
                  </button>
                  <span>Validade</span>
                  <span className="text-right">Ações</span>
                </div>

                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-background/50 border border-border/50 rounded-xl p-3 hover:shadow-md transition-shadow"
                    >
                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-[1fr_80px_80px_110px_110px_100px_160px] gap-2 items-center">
                        <span className="text-sm font-medium truncate">{user.email}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                          user.is_blocked ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                        }`}>
                          {user.is_blocked ? "Bloqueado" : "Ativo"}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                          user.is_admin ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {user.is_admin ? "Admin" : "Usuário"}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                        <div className="text-xs text-muted-foreground">
                          <div>{formatDate(user.last_sign_in_at)}</div>
                          {user.last_ip && <div className="opacity-60 truncate max-w-[140px]" title={user.last_ip}>{user.last_ip}</div>}
                        </div>
                        {(() => {
                          const days = getDaysLeft(user.expires_at);
                          if (days === null) return <span className="text-xs text-muted-foreground">Ilimitado</span>;
                          if (days <= 0) return <span className="text-xs font-medium text-red-500">Expirado</span>;
                          return (
                            <span className={`text-xs font-medium ${days <= 3 ? "text-red-500" : days <= 7 ? "text-yellow-500" : "text-green-500"}`}>
                              {days} {days === 1 ? "dia" : "dias"}
                            </span>
                          );
                        })()}
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleToggleBlock(user.id, !user.is_blocked)}
                            title={user.is_blocked ? "Desbloquear" : "Bloquear"}>
                            {user.is_blocked ? <Unlock className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleToggleRole(user.id, !user.is_admin)}
                            title={user.is_admin ? "Remover admin" : "Promover a admin"}>
                            {user.is_admin ? <ShieldOff className="h-4 w-4 text-purple-500" /> : <ShieldCheck className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => { setResetTarget(user); setNewPassword(""); }}
                            title="Redefinir senha">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleViewLogs(user)}
                            title="Ver logins">
                            <MapPin className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleResetDevice(user)}
                            title={user.has_device ? "Resetar dispositivo" : "Sem dispositivo vinculado"}>
                            {user.has_device
                              ? <Smartphone className="h-4 w-4 text-green-500" />
                              : <SmartphoneNfc className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleToggleComprovante(user.id, !user.has_comprovante)}
                            title={user.has_comprovante ? "Remover acesso ao comprovante" : "Liberar comprovante"}>
                            {user.has_comprovante
                              ? <FileCheck className="h-4 w-4 text-teal-500" />
                              : <FileX className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => handleToggleObs(user.id, !user.has_obs)}
                            title={user.has_obs ? "Remover acesso ao OBS" : "Liberar OBS"}>
                            <Tv2 className={`h-4 w-4 ${user.has_obs ? "text-blue-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => { setExpirationTarget(user); setExpirationDays(""); }}
                            title="Definir validade">
                            <CalendarClock className="h-4 w-4 text-yellow-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                            onClick={() => setDeleteTarget(user)}
                            title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate flex-1">{user.email}</span>
                          <div className="flex gap-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              user.is_blocked ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                            }`}>
                              {user.is_blocked ? "Bloqueado" : "Ativo"}
                            </span>
                            {user.is_admin && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">Admin</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Criado: {formatDate(user.created_at)}</span>
                          <span className="truncate" title={user.last_ip || undefined}>Login: {formatDate(user.last_sign_in_at)}{user.last_ip && ` · ${user.last_ip}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Validade:</span>
                          {(() => {
                            const days = getDaysLeft(user.expires_at);
                            if (days === null) return <span className="text-muted-foreground">Ilimitado</span>;
                            if (days <= 0) return <span className="font-medium text-red-500">Expirado</span>;
                            return (
                              <span className={`font-medium ${days <= 3 ? "text-red-500" : days <= 7 ? "text-yellow-500" : "text-green-500"}`}>
                                {days} {days === 1 ? "dia" : "dias"}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1 justify-end border-t border-border/30 pt-2">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs"
                            onClick={() => handleToggleBlock(user.id, !user.is_blocked)}>
                            {user.is_blocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {user.is_blocked ? "Desbloquear" : "Bloquear"}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs"
                            onClick={() => handleToggleRole(user.id, !user.is_admin)}>
                            {user.is_admin ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            {user.is_admin ? "Remover" : "Promover"}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs"
                            onClick={() => { setResetTarget(user); setNewPassword(""); }}>
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-blue-500"
                            onClick={() => handleViewLogs(user)}>
                            <MapPin className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className={`h-8 rounded-lg text-xs ${user.has_device ? "text-green-500" : "text-muted-foreground"}`}
                            onClick={() => handleResetDevice(user)}>
                            {user.has_device ? <Smartphone className="h-3.5 w-3.5" /> : <SmartphoneNfc className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="sm" className={`h-8 rounded-lg text-xs ${user.has_comprovante ? "text-teal-500" : "text-muted-foreground"}`}
                            onClick={() => handleToggleComprovante(user.id, !user.has_comprovante)}>
                            {user.has_comprovante ? <FileCheck className="h-3.5 w-3.5" /> : <FileX className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="sm" className={`h-8 rounded-lg text-xs ${user.has_obs ? "text-blue-500" : "text-muted-foreground"}`}
                            onClick={() => handleToggleObs(user.id, !user.has_obs)}>
                            <Tv2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-yellow-500"
                            onClick={() => { setExpirationTarget(user); setExpirationDays(""); }}>
                            <CalendarClock className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-red-500"
                            onClick={() => setDeleteTarget(user)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Extratos Lives &copy; {new Date().getFullYear()}</span>
          <span>Painel de administração</span>
        </div>
      </footer>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Excluir usuário</h3>
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm">
              Tem certeza que deseja excluir <strong>{deleteTarget.email}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} className="rounded-lg">Cancelar</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} className="rounded-lg">Excluir</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setResetTarget(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <KeyRound className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Redefinir senha</h3>
                <p className="text-sm text-muted-foreground">{resetTarget.email}</p>
              </div>
            </div>
            <Input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              className="rounded-lg"
            />
            {newPassword && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      newPassword.length < 8 ? "bg-red-500" : /[A-Z]/.test(newPassword) && /\d/.test(newPassword) ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${Math.min(100, (newPassword.length / 12) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setResetTarget(null)} className="rounded-lg">Cancelar</Button>
              <Button size="sm" onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 8} className="rounded-lg">
                Redefinir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login logs modal */}
      {logsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setLogsTarget(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Histórico de logins</h3>
                  <p className="text-sm text-muted-foreground">{logsTarget.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLogsTarget(null)} className="rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingLogs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : loginLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Nenhum registro de login encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {loginLogs.map((log) => (
                    <div key={log.id} className="bg-background/50 border border-border/50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {log.city}, {log.region}
                            </span>
                            <span className="text-xs text-muted-foreground">({log.country})</span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span>IP: <span className="font-mono text-foreground/80">{log.ip_address}</span></span>
                            <span>ISP: {log.isp}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.logged_in_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {!loadingLogs && loginLogs.length > 0 && (
              <div className="border-t border-border/50 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{loginLogs.length} registro{loginLogs.length > 1 ? "s" : ""}</span>
                  <span>
                    {new Set(loginLogs.map((l) => l.region)).size} estado{new Set(loginLogs.map((l) => l.region)).size > 1 ? "s" : ""} diferente{new Set(loginLogs.map((l) => l.region)).size > 1 ? "s" : ""}
                    {" / "}
                    {new Set(loginLogs.map((l) => l.ip_address)).size} IP{new Set(loginLogs.map((l) => l.ip_address)).size > 1 ? "s" : ""} diferente{new Set(loginLogs.map((l) => l.ip_address)).size > 1 ? "s" : ""}
                  </span>
                </div>
                {new Set(loginLogs.map((l) => l.region)).size > 1 && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Atenção: logins de múltiplos estados detectados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Set expiration modal */}
      {expirationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setExpirationTarget(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <CalendarClock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Definir validade</h3>
                <p className="text-sm text-muted-foreground">{expirationTarget.email}</p>
              </div>
            </div>

            {expirationTarget.expires_at && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                Validade atual: {formatDate(expirationTarget.expires_at)}
                {(() => {
                  const days = getDaysLeft(expirationTarget.expires_at);
                  if (days === null) return null;
                  if (days <= 0) return <span className="ml-1 text-red-500 font-medium">(Expirado)</span>;
                  return <span className="ml-1 font-medium">({days} {days === 1 ? "dia restante" : "dias restantes"})</span>;
                })()}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dias de acesso</label>
              <Input
                type="number"
                placeholder="Ex: 30"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                min={1}
                className="rounded-lg"
              />
              <div className="flex flex-wrap gap-1.5">
                {[7, 15, 30, 60, 90].map((d) => (
                  <Button
                    key={d}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs h-7"
                    onClick={() => setExpirationDays(String(d))}
                  >
                    {d} dias
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-between">
              {expirationTarget.expires_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs text-muted-foreground"
                  onClick={() => { handleRemoveExpiration(expirationTarget); setExpirationTarget(null); }}
                >
                  Remover validade
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setExpirationTarget(null)} className="rounded-lg">Cancelar</Button>
                <Button size="sm" onClick={handleSetExpiration} disabled={!expirationDays || Number(expirationDays) < 1} className="rounded-lg">
                  Definir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
