import { useState, useRef, useMemo, useEffect } from "react";
import {
  Plus, Trash2, MoreHorizontal, MoreVertical, Download,
  ArrowDownLeft, ArrowDownRight, GripVertical, ArrowUpRight, Copy, RotateCcw, ClipboardCheck, Dices, Send
} from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import {
  Transaction, BankType, BANKS, CATEGORY_OPTIONS, 
  formatCurrencyInput, calcTotal, generatePixId, maskCPF, maskCNPJ, PixData,
  PreviewInter, PreviewNeon, PreviewNubank, PreviewC6, PreviewPicPay,
  PreviewMercadoPago, PreviewEfi, PreviewInfinitePay, PreviewPixComprovante
} from "./SharedPreviews";

/* ── Brasília time helpers ─────────────────────────────── */
const getBrasiliaParts = () => {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("day"), month: get("month"), year: get("year"), hour: get("hour"), minute: get("minute"), second: get("second") };
};

const getBrasiliaDateTime = () => {
  const p = getBrasiliaParts();
  return `${p.day}/${p.month}/${p.year} - ${p.hour}:${p.minute}:${p.second}`;
};

const getBrasiliaTime = () => {
  const p = getBrasiliaParts();
  return `${p.hour}:${p.minute}`;
};

const maskDataHora = (val: string) => {
  const d = val.replace(/\D/g, "").slice(0, 14);
  if (d.length === 0) return "";
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  if (d.length > 8) out += " - " + d.slice(8, 10);
  if (d.length > 10) out += ":" + d.slice(10, 12);
  if (d.length > 12) out += ":" + d.slice(12, 14);
  return out;
};

const maskTime = (val: string) => {
  const d = val.replace(/\D/g, "").slice(0, 4);
  if (d.length === 0) return "";
  if (d.length <= 2) return d;
  return d.slice(0, 2) + ":" + d.slice(2);
};

/* ── Sortable transaction card ─────────────────────────── */
function SortableTransaction({
  t, i, total, bank, onRemove, onUpdate, onDuplicate, onRandomize, isDuplicate = false,
}: {
  t: Transaction;
  i: number;
  total: number;
  bank: BankType;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Transaction, val: string) => void;
  onDuplicate: (id: string) => void;
  onRandomize: (id: string) => void;
  isDuplicate?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: t.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const showCategory = bank === "inter";
  const showTime = bank !== "inter";

  return (
    <div ref={setNodeRef} style={style} className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none">
            <GripVertical size={16} />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Transação {i + 1}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate(t.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            title="Duplicar transação"
          >
            <Copy size={14} />
          </button>
          {total > 1 && (
            <button
              onClick={() => onRemove(t.id)}
              className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-md hover:bg-destructive/10"
              title="Remover transação"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome completo"
          value={t.name}
          maxLength={60}
          onChange={(e) => onUpdate(t.id, "name", e.target.value)}
          className={`flex-1 bg-background border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
            isDuplicate
              ? "border-destructive ring-1 ring-destructive/40 focus:ring-destructive"
              : "border-border focus:ring-ring"
          }`}
        />
        <button
          onClick={() => onRandomize(t.id)}
          className="flex items-center justify-center p-2.5 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors"
          title="Aleatorizar Nome e Valor"
        >
          <Dices size={16} />
        </button>
      </div>
      {isDuplicate && (
        <p className="text-xs text-destructive -mt-1">Nome duplicado — altere para continuar</p>
      )}
      <input
        type="text"
        placeholder="R$ 0,00"
        value={formatCurrencyInput(t.value)}
        onChange={(e) => onUpdate(t.id, "value", e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      />
      {showCategory && (
        <select
          value={t.category}
          onChange={(e) => onUpdate(t.id, "category", e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}
      {showTime && (
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Horário (ex: 23:10)"
            value={t.time}
            onChange={(e) => onUpdate(t.id, "time", maskTime(e.target.value))}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
          <button
            onClick={() => onUpdate(t.id, "time", getBrasiliaTime())}
            className="shrink-0 bg-background border border-border rounded-lg px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Atualizar para horário de Brasília"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

const ExtratoGenerator = ({ showComprovante = false, showObs = false }: { showComprovante?: boolean; showObs?: boolean }) => {
  const { user } = useAuth();
  const [sendingToObs, setSendingToObs] = useState(false);

  const sendToObs = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar para o OBS!");
      return;
    }
    if (hasDuplicateNames) { warnDuplicate(); return; }
    setSendingToObs(true);
    try {
      const channel = supabase.channel('obs-' + user.id);
      await channel.send({
        type: 'broadcast',
        event: 'update-obs',
        payload: { bank, transactions, dateLabel, pixData }
      });
      toast.success("Enviado para a tela do OBS com sucesso!");
    } catch (e) {
      toast.error("Erro ao enviar para o OBS");
    } finally {
      setSendingToObs(false);
    }
  };

  const [bank, setBank] = useState<BankType>("inter");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", name: "", value: "", category: "Sem categoria", time: getBrasiliaTime() },
  ]);
  const [dateLabel, setDateLabel] = useState(
    "Hoje, " + new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
  );
  const extratoRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  // Comprovante Pix state
  const [pixData, setPixData] = useState<PixData>({
    valor: "",
    pagador: "",
    cpfPagador: "",
    cnpjPagador: "",
    recebedor: "",
    cpfRecebedor: "",
    instituicaoPagador: "",
    instituicaoRecebedor: "",
    dataHora: getBrasiliaDateTime(),
    idTransacao: generatePixId(),
  });

  const updatePixData = (field: keyof PixData, val: string) => {
    let sanitized = val;
    if (field === "valor") sanitized = val.replace(/\D/g, "").slice(0, 12);
    if (field === "cpfPagador" || field === "cpfRecebedor") sanitized = val.replace(/\D/g, "").slice(0, 11);
    if (field === "cnpjPagador") sanitized = val.replace(/\D/g, "").slice(0, 14);
    if (field === "dataHora") sanitized = maskDataHora(val);
    setPixData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const isPixMode = bank === "pix-comprovante";
  const visibleBanks = showComprovante ? BANKS : BANKS.filter((b) => b.id !== "pix-comprovante");

  const duplicateNameIds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of transactions) {
      const key = t.name.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const dups = new Set<string>();
    for (const t of transactions) {
      const key = t.name.trim().toLowerCase();
      if (key && (counts.get(key) ?? 0) > 1) dups.add(t.id);
    }
    return dups;
  }, [transactions]);
  const hasDuplicateNames = !isPixMode && duplicateNameIds.size > 0;

  const warnDuplicate = () => {
    toast.error("Existem nomes duplicados nas transações. Corrija antes de continuar.");
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const historyRef = useRef<{ past: Transaction[][]; future: Transaction[][]; lastPushAt: number }>({
    past: [],
    future: [],
    lastPushAt: 0,
  });
  const HISTORY_LIMIT = 50;
  const DEBOUNCE_MS = 500;

  const pushHistory = (snapshot: Transaction[], immediate: boolean) => {
    const h = historyRef.current;
    const now = Date.now();
    if (!immediate && now - h.lastPushAt < DEBOUNCE_MS) return;
    h.past.push(snapshot);
    if (h.past.length > HISTORY_LIMIT) h.past.shift();
    h.future = [];
    h.lastPushAt = now;
  };

  const undo = () => {
    setTransactions((current) => {
      const h = historyRef.current;
      if (h.past.length === 0) return current;
      const previous = h.past.pop()!;
      h.future.push(current);
      h.lastPushAt = 0;
      return previous;
    });
  };

  const redo = () => {
    setTransactions((current) => {
      const h = historyRef.current;
      if (h.future.length === 0) return current;
      const next = h.future.pop()!;
      h.past.push(current);
      h.lastPushAt = 0;
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable;
      if (inField) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((key === "z" && e.shiftKey) || key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const addTransaction = () => {
    pushHistory(transactions, true);
    setTransactions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", value: "", category: "Sem categoria", time: getBrasiliaTime() },
    ]);
  };

  const duplicateTransaction = (id: string) => {
    pushHistory(transactions, true);
    setTransactions((prev) => {
      const source = prev.find((t) => t.id === id);
      if (!source) return prev;
      const idx = prev.findIndex((t) => t.id === id);
      const clone = { ...source, id: Date.now().toString() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const removeTransaction = (id: string) => {
    if (transactions.length <= 1) return;
    pushHistory(transactions, true);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    pushHistory(transactions, true);
    setTransactions([
      { id: Date.now().toString(), name: "", value: "", category: "Sem categoria", time: getBrasiliaTime() },
    ]);
    setDateLabel("Hoje, " + new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" }));
  };

  const randomizeTransaction = (id: string) => {
    const FIRST_NAMES = ["Lucas", "Marcos", "Mateus", "João", "Gabriel", "Pedro", "Thiago", "Felipe", "Rafael", "Vinícius", "Bruno", "Caio", "Arthur", "Gustavo", "Eduardo", "Diego", "Ricardo", "Renato", "Fernando", "Guilherme", "Leonardo", "Rodrigo", "Juliana", "Mariana", "Fernanda", "Amanda", "Beatriz", "Camila", "Letícia", "Carolina", "Larissa", "Natália"];
    const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Mendes", "Nunes", "Cardoso"];

    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    let ln2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    if (ln === ln2) ln2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    const newName = `${fn} ${ln} ${ln2}`.trim();

    pushHistory(transactions, true);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
  };

  const updateTransaction = (id: string, field: keyof Transaction, val: string) => {
    let sanitized = val;
    if (field === "name") sanitized = val.slice(0, 60);
    if (field === "value") sanitized = val.replace(/\D/g, "").slice(0, 12);
    if (field === "time") sanitized = val.replace(/[^0-9:]/g, "").slice(0, 5);
    pushHistory(transactions, false);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: sanitized } : t))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      pushHistory(transactions, true);
      setTransactions((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleExport = async () => {
    if (!extratoRef.current || exporting) return;
    if (hasDuplicateNames) { warnDuplicate(); return; }
    setExporting(true);
    try {
      const canvas = await html2canvas(extratoRef.current, {
        backgroundColor: isDarkBank ? "#1a1a1a" : "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `extrato-${bank}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!extratoRef.current || copied) return;
    if (hasDuplicateNames) { warnDuplicate(); return; }
    try {
      const canvas = await html2canvas(extratoRef.current, {
        backgroundColor: isDarkBank ? "#1a1a1a" : "#ffffff",
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback: some browsers don't support clipboard.write
    }
  };

  const renderPreview = () => {
    if (bank === "pix-comprovante") return <PreviewPixComprovante pixData={pixData} />;
    const props = { transactions, dateLabel };
    switch (bank) {
      case "inter": return <PreviewInter {...props} />;
      case "neon": return <PreviewNeon {...props} />;
      case "nubank": return <PreviewNubank {...props} />;
      case "c6": return <PreviewC6 {...props} />;
      case "picpay": return <PreviewPicPay {...props} />;
      case "mercadopago": return <PreviewMercadoPago {...props} />;
      case "efi": return <PreviewEfi {...props} />;
      case "infinitepay": return <PreviewInfinitePay {...props} />;
    }
  };

  const isDarkBank = bank === "c6" || bank === "nubank";
  const phoneBg = isDarkBank ? "#1a1a1a" : bank === "infinitepay" ? "#f2f2f2" : "#ffffff";
  const currentBank = BANKS.find((b) => b.id === bank);

  return (
    <div className="bg-background flex items-start justify-center px-4 py-6 gap-6 flex-wrap lg:flex-nowrap max-w-6xl mx-auto">
      {/* Form */}
      <div className="w-full max-w-lg">
        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-lg p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground">Gerador de Extrato</h1>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
              title="Limpar tudo"
            >
              <RotateCcw size={14} />
              Limpar
            </button>
          </div>

          {/* User OBS Link */}
          {user && showObs && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <label className="block text-xs font-semibold text-blue-800 mb-1">Seu Link do OBS</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/live/${user.id}`}
                  className="w-full bg-white border border-blue-200 rounded text-xs px-2 py-1.5 text-blue-900 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/live/${user.id}`);
                    toast.success("Link copiado!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 px-3 rounded text-xs font-medium transition-colors"
                >
                  Copiar
                </button>
              </div>
              <p className="text-[10px] text-blue-600 mt-1">Cole no OBS como Fonte de Navegador (Largura: 400, Altura: 800)</p>
            </div>
          )}

          {/* Bank Selector with colors */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Selecione o banco</label>
            <div className="grid grid-cols-4 gap-2">
              {visibleBanks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBank(b.id)}
                  className={`relative py-2 px-1 rounded-lg text-xs font-medium transition-all border-2 ${
                    bank === b.id
                      ? `border-transparent ring-2 ${b.ring} shadow-md scale-[1.03]`
                      : "border-border/50 hover:border-border"
                  }`}
                  style={bank === b.id ? { backgroundColor: b.accent + "18" } : {}}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: b.accent }}
                  />
                  <span className={bank === b.id ? "font-semibold" : "text-muted-foreground"}>
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {isPixMode ? (
            <>
              {/* Comprovante Pix form */}
              <div className="space-y-3">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Valor</span>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formatCurrencyInput(pixData.valor)}
                    onChange={(e) => updatePixData("valor", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Quem pagou</span>
                  <input
                    type="text" placeholder="Nome do pagador"
                    value={pixData.pagador}
                    onChange={(e) => updatePixData("pagador", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text" placeholder="CPF (opcional)"
                      value={maskCPF(pixData.cpfPagador)}
                      onChange={(e) => { updatePixData("cpfPagador", e.target.value); if (e.target.value) updatePixData("cnpjPagador", ""); }}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                    <input
                      type="text" placeholder="CNPJ (opcional)"
                      value={maskCNPJ(pixData.cnpjPagador)}
                      onChange={(e) => { updatePixData("cnpjPagador", e.target.value); if (e.target.value) updatePixData("cpfPagador", ""); }}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                  </div>
                  <input
                    type="text" placeholder="Instituição (ex: Nubank)"
                    value={pixData.instituicaoPagador}
                    onChange={(e) => updatePixData("instituicaoPagador", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Quem recebeu</span>
                  <input
                    type="text" placeholder="Nome do recebedor"
                    value={pixData.recebedor}
                    onChange={(e) => updatePixData("recebedor", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                  <input
                    type="text" placeholder="CPF do recebedor"
                    value={maskCPF(pixData.cpfRecebedor)}
                    onChange={(e) => updatePixData("cpfRecebedor", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                  <input
                    type="text" placeholder="Instituição (ex: Banco Inter)"
                    value={pixData.instituicaoRecebedor}
                    onChange={(e) => updatePixData("instituicaoRecebedor", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Detalhes</span>
                  <input
                    type="text" placeholder="Data e hora (ex: 13/04/2026 - 14:30:00)"
                    value={pixData.dataHora}
                    onChange={(e) => updatePixData("dataHora", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text" placeholder="ID da transação"
                      value={pixData.idTransacao}
                      onChange={(e) => updatePixData("idTransacao", e.target.value)}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono text-xs"
                    />
                    <button
                      onClick={() => updatePixData("idTransacao", generatePixId())}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                      title="Gerar novo ID"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {showObs && (
                  <button
                    onClick={sendToObs}
                    disabled={sendingToObs}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={16} /> {sendingToObs ? "Enviando..." : "Mandar pra Tela"}
                  </button>
                )}
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Download size={16} /> Exportar
                </button>
                <button
                  onClick={handleCopyClipboard}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-medium transition-all border ${
                    copied
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                  title="Copiar para área de transferência"
                >
                  {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Date label */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Rótulo de data</label>
                <input
                  type="text"
                  placeholder="Ex: Hoje, 12 de abril"
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>

              {/* Transactions */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={transactions.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {transactions.map((t, i) => (
                      <SortableTransaction
                        key={t.id} t={t} i={i}
                        total={transactions.length} bank={bank}
                        onRemove={removeTransaction}
                        onUpdate={updateTransaction}
                        onDuplicate={duplicateTransaction}
                        onRandomize={randomizeTransaction}
                        isDuplicate={duplicateNameIds.has(t.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Total */}
              <div className="flex items-center justify-between px-1 pt-2 border-t border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Total ({transactions.length} transação{transactions.length > 1 ? "ões" : ""})</span>
                <span className="text-sm font-bold text-primary">{calcTotal(transactions)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={addTransaction}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Adicionar
                </button>
                {showObs && (
                  <button
                    onClick={sendToObs}
                    disabled={sendingToObs}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={16} /> {sendingToObs ? "Enviando..." : "Tela"}
                  </button>
                )}
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Download size={16} /> Exportar
                </button>
                <button
                  onClick={handleCopyClipboard}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-medium transition-all border ${
                    copied
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                  title="Copiar para área de transferência"
                >
                  {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview — sticky */}
      <div className="w-full max-w-md lg:sticky lg:top-4">
        <div className="text-center mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Pré-visualização</h2>
          {currentBank && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentBank.accent }} />
              <span className="text-xs text-muted-foreground">{currentBank.label}</span>
            </div>
          )}
        </div>

        {/* Phone mockup frame */}
        <div className="mx-auto rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden" style={{ maxWidth: 400 }}>
          {/* Notch */}
          <div className="flex justify-center pt-1.5" style={{ backgroundColor: phoneBg }}>
            <div className="w-20 h-5 bg-gray-800 rounded-b-2xl" />
          </div>

          {/* Phone status bar */}
          <div className="flex items-center justify-between px-5 pt-1 pb-1" style={{ backgroundColor: phoneBg }}>
            <span className="text-xs font-semibold" style={{ color: isDarkBank ? "#fff" : "#1a1a1a" }}>20:19</span>
            <div className="flex items-center gap-1.5">
              {/* Signal bars */}
              <div className="flex items-end gap-[2px]">
                {[3, 5, 7, 9].map((h) => (
                  <div key={h} className="w-[3px] rounded-sm" style={{ height: h, backgroundColor: isDarkBank ? "#fff" : "#1a1a1a" }} />
                ))}
              </div>
              {/* Battery */}
              <div className="w-5 h-2.5 rounded-sm relative" style={{ border: `1.5px solid ${isDarkBank ? "#fff" : "#1a1a1a"}` }}>
                <div className="absolute inset-[2px] rounded-[1px]" style={{ width: "65%", backgroundColor: isDarkBank ? "#fff" : "#1a1a1a" }} />
              </div>
            </div>
          </div>

          {/* Extrato content */}
          <div ref={extratoRef} style={{ backgroundColor: phoneBg }}>
            {renderPreview()}
          </div>

          {/* Phone bottom bar */}
          <div className="flex justify-center pb-2 pt-2" style={{ backgroundColor: phoneBg }}>
            <div className="w-28 h-1 rounded-full" style={{ backgroundColor: isDarkBank ? "#444" : "#d1d5db" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtratoGenerator;
