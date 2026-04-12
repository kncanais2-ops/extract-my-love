import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Lock, Unlock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const callAdmin = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body,
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: session?.user?.id,
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
    try {
      const data = await callAdmin({ action: "list_users" });
      setUsers(data.users || []);
    } catch {
      toast({ title: "Erro ao carregar usuários", variant: "destructive" });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callAdmin({ action: "create_user", email, password });
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
      await callAdmin({ action: "toggle_block", user_id: userId, block });
      toast({ title: block ? "Usuário bloqueado" : "Usuário desbloqueado" });
      loadUsers();
    } catch {
      toast({ title: "Erro ao alterar bloqueio", variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await callAdmin({ action: "delete_user", user_id: userId });
      toast({ title: "Usuário excluído" });
      loadUsers();
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-medium">Acesso negado.</p>
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
              Criar novo usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Email"
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
                {loading ? "Criando..." : "Criar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerenciamento de Clientes ({users.length})</CardTitle>
            <CardDescription>
              O sistema de proteção por IP está ativo! O primeiro IP a logar será registrado e fixado. Se a conta for acessada por um IP diferente, será bloqueada imediatamente!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
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
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {user.is_blocked ? "Bloqueado" : "Ativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleBlock(user.id, !user.is_blocked)}
                        title={user.is_blocked ? "Desbloquear" : "Bloquear"}
                      >
                        {user.is_blocked ? (
                          <Unlock className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum usuário cadastrado
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
