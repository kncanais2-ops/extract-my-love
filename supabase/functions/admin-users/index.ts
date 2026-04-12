import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Responde imediatamente ao preflight do navegador (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Cabeçalho de autorização ausente" }), {
        status: 200, // Usamos 200 para garantir que o erro chegue ao front
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente com permissão total para gerenciar usuários
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    // Cliente padrão para validar quem está chamando
    const userClient = createClient(supabaseUrl, anonKey);
    
    // Pega o token do usuário logado
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: userError } = await userClient.auth.getUser(token);

    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verifica se esse usuário realmente tem o cargo de 'admin' na tabela
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Você não tem permissão de administrador" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lê o corpo da requisição com segurança
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ACAO: CRIAR USUÁRIO
    if (action === "create_user") {
      const { email, password } = body;
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) throw error;
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACAO: LISTAR USUÁRIOS
    if (action === "list_users") {
      const { data, error } = await adminClient.auth.admin.listUsers();
      if (error) throw error;

      // Pega dados de bloqueio
      const { data: devices } = await adminClient
        .from("user_devices")
        .select("user_id, is_blocked");

      const users = data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_blocked: devices?.find((d: any) => d.user_id === u.id)?.is_blocked ?? false,
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACAO: BLOQUEAR/DESBLOQUEAR
    if (action === "toggle_block") {
      const { user_id, block } = body;
      if (block) {
        await adminClient
          .from("user_devices")
          .upsert({ user_id: user_id, device_token: "blocked", is_blocked: true }, { onConflict: "user_id" });
      } else {
        await adminClient.from("user_devices").delete().eq("user_id", user_id);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACAO: DELETAR
    if (action === "delete_user") {
      const { user_id } = body;
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Erro interno no servidor" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
