import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Lock, Unlock, ArrowLeft, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  is_blocked: boolean;
}

const AdminPanel = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Admin Client states
  const [serviceKey, setServiceKey] = useState("");
  const [adminClient, setAdminClient] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: session?.user?.id,
        _role: "admin",
      });
      setIsAdmin(!!data);

      const savedKey = sessionStorage.getItem("supabase_service_role");
      if (savedKey) {
        initAdminClient(savedKey);
      }
    };
    if (session?.user) checkAdmin();
  }, [session]);

  const initAdminClient = async (key: string) => {
    const client = createClient(import.meta.env.VITE_SUPABASE_URL, key);
    // test key
    const { error } = await client.auth.admin.listUsers();
    if (error) {
      toast({ title: "Chave Service Role inválida", variant: "destructive" });
      sessionStorage.removeItem("supabase_service_role");
      setAdminClient(null);
      return false;
    }
    sessionStorage.setItem("supabase_service_role", key);
    setAdminClient(client);
    return true;
  };

  const handleConnectKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await initAdminClient(serviceKey);
    setLoading(false);
  };

  useEffect(() => {
    if (adminClient) {
      loadUsers();
    }
  }, [adminClient]);

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers();
      if (usersErr) throw usersErr;

      const { data: devicesData, error: devErr } = await adminClient
        .from("user_devices")
        .select("user_id, is_blocked");
      if (devErr) throw devErr;

      const combined = usersData.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_blocked: devicesData?.find((d: any) => d.user_id === u.id)?.is_blocked ?? false,
      }));
      setUsers(combined);
    } catch (err: any) {
      toast({ title: "Erro ao carregar usuários", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      toast({ title: "Usuário criado com sucesso!" });
      setEmail("");
      setPassword("");
      loadUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleToggleBlock = async (userId: string, block: boolean) => {
    try {
      if (block) {
        await adminClient
          .from("user_devices")
          .upsert({ user_id: userId, device_token: "blocked", is_blocked: true }, { onConflict: "user_id" });
      } else {
        await adminClient.from("user_devices").delete().eq("user_id", userId);
      }
      toast({ title: block ? "Usuário bloqueado" : "Usuário desbloqueado" });
      loadUsers();
    } catch {
      toast({ title: "Erro ao alterar bloqueio", variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;
      toast({ title: "Usuário excluído" });
      loadUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Verificando...</div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-destructive font-medium">Acesso negado. Apenas administradores.</div>;
  }

  if (!adminClient) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticação de Sistema
            </CardTitle>
            <CardDescription>
              Insira a chave <strong>SERVICE ROLE</strong> do Supabase para liberar as ações de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnectKey} className="flex flex-col gap-3">
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Liberar Acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Painel Admin</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5" />
              Criar novo cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Email do novo usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Input
                type="text"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerenciamento de Clientes ({users.length})</CardTitle>
            <CardDescription>
              O sistema de bloqueio de dispositivo está ativo! Quando alguém logar, o dispositivo é salvo. Se partilharem a conta, serão bloqueados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status / Dispositivo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.is_blocked
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {user.is_blocked ? "Conta Bloqueada (Violação)" : "Ativo e Monitorado"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBlock(user.id, !user.is_blocked)}
                        title={user.is_blocked ? "Desbloquear (Resetar aparelho)" : "Bloquear permanentemente"}
                      >
                        {user.is_blocked ? (
                          <><Unlock className="h-4 w-4 mr-1 text-primary" /> Perdoar</>
                        ) : (
                          <><Lock className="h-4 w-4 mr-1 text-muted-foreground" /> Bloquear</>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        title="Excluir Conta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum cliente cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
