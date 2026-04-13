import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((o) => o.trim()).filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : allowedOrigins[0] ?? "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Cabeçalho de autorização ausente" }), {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userClient = createClient(supabaseUrl, anonKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: userError } = await userClient.auth.getUser(token);

    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Você não tem permissão de administrador" }), {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

    // CRIAR USUÁRIO
    if (action === "create_user") {
      const { email, password } = body;
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ user: data.user }), { headers });
    }

    // LISTAR USUÁRIOS (com last_sign_in e roles)
    if (action === "list_users") {
      const { data, error } = await adminClient.auth.admin.listUsers();
      if (error) throw error;

      const { data: devices } = await adminClient
        .from("user_devices")
        .select("user_id, is_blocked");

      const { data: roles } = await adminClient
        .from("user_roles")
        .select("user_id, role");

      const { data: authDevices } = await adminClient
        .from("authorized_devices")
        .select("user_id, fingerprint, device_label, authorized_at");

      // Busca o último login de cada usuário na tabela login_logs
      const { data: lastLogins } = await adminClient
        .from("login_logs")
        .select("user_id, logged_in_at, ip_address")
        .order("logged_in_at", { ascending: false });

      // Agrupa por user_id pegando apenas o mais recente
      const lastLoginMap: Record<string, { logged_in_at: string; ip_address: string }> = {};
      if (lastLogins) {
        for (const log of lastLogins) {
          if (!lastLoginMap[log.user_id]) {
            lastLoginMap[log.user_id] = { logged_in_at: log.logged_in_at, ip_address: log.ip_address };
          }
        }
      }

      const users = data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: lastLoginMap[u.id]?.logged_in_at || u.last_sign_in_at || null,
        last_ip: lastLoginMap[u.id]?.ip_address || null,
        is_blocked: devices?.find((d: any) => d.user_id === u.id)?.is_blocked ?? false,
        is_admin: roles?.some((r: any) => r.user_id === u.id && r.role === "admin") ?? false,
        has_device: authDevices?.some((d: any) => d.user_id === u.id) ?? false,
        device_label: authDevices?.find((d: any) => d.user_id === u.id)?.device_label ?? null,
        device_authorized_at: authDevices?.find((d: any) => d.user_id === u.id)?.authorized_at ?? null,
      }));

      return new Response(JSON.stringify({ users }), { headers });
    }

    // BLOQUEAR/DESBLOQUEAR
    if (action === "toggle_block") {
      const { user_id, block } = body;
      if (block) {
        await adminClient
          .from("user_devices")
          .upsert({ user_id, device_token: "blocked", is_blocked: true }, { onConflict: "user_id" });
      } else {
        await adminClient.from("user_devices").delete().eq("user_id", user_id);
      }
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // DELETAR
    if (action === "delete_user") {
      const { user_id } = body;
      if (user_id === caller.id) throw new Error("Você não pode excluir a si mesmo");
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      await adminClient.from("user_devices").delete().eq("user_id", user_id);
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // RESETAR SENHA
    if (action === "reset_password") {
      const { user_id, new_password } = body;
      const { error } = await adminClient.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // PROMOVER/REMOVER ADMIN
    if (action === "toggle_role") {
      const { user_id, promote } = body;
      if (user_id === caller.id) throw new Error("Você não pode alterar seu próprio cargo");
      if (promote) {
        await adminClient
          .from("user_roles")
          .upsert({ user_id, role: "admin" }, { onConflict: "user_id,role" });
      } else {
        await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", user_id)
          .eq("role", "admin");
      }
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // RESETAR DISPOSITIVO AUTORIZADO
    if (action === "reset_device") {
      const { user_id } = body;
      await adminClient.from("authorized_devices").delete().eq("user_id", user_id);
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // HISTÓRICO DE LOGIN DE UM USUÁRIO
    if (action === "login_logs") {
      const { user_id } = body;
      const { data: logs, error } = await adminClient
        .from("login_logs")
        .select("*")
        .eq("user_id", user_id)
        .order("logged_in_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return new Response(JSON.stringify({ logs: logs || [] }), { headers });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), {
      status: 200,
      headers,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno no servidor";
    return new Response(JSON.stringify({ error: message }), {
      status: 200,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
