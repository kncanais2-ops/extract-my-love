// Testa a edge function admin-users list_users
const SUPABASE_URL = "https://jzfhzdoothfsxiqtimek.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Zmh6ZG9vdGhmc3hpcXRpbWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk3NDAxNCwiZXhwIjoyMDkxNTUwMDE0fQ.4NTj-f_DREUwKN4W54H8OEHFYArK2FHLPDUxaH8e02k";

async function main() {
  console.log("=== Testando edge function admin-users ===\n");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "list_users" }),
  });

  const text = await res.text();
  console.log("Status HTTP:", res.status);
  console.log("Resposta:", text.slice(0, 2000));
}

main().catch(console.error);
