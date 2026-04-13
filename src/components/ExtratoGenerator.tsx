import { useState, useRef } from "react";
import {
  Plus, Trash2, MoreHorizontal, MoreVertical, Download,
  ArrowDownLeft, ArrowDownRight, GripVertical, ArrowUpRight, Copy, RotateCcw, ClipboardCheck,
} from "lucide-react";
import html2canvas from "html2canvas";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Transaction {
  id: string;
  name: string;
  value: string;
  category: string;
  time: string;
}

type BankType = "inter" | "neon" | "nubank" | "c6" | "picpay" | "mercadopago" | "efi" | "pix-comprovante";

const BANKS: { id: BankType; label: string; accent: string; ring: string }[] = [
  { id: "inter", label: "Banco Inter", accent: "#f57c00", ring: "ring-orange-500" },
  { id: "neon", label: "Banco Neon", accent: "#00bcd4", ring: "ring-cyan-500" },
  { id: "nubank", label: "Nubank", accent: "#8A05BE", ring: "ring-purple-600" },
  { id: "c6", label: "C6 Bank", accent: "#F5C518", ring: "ring-yellow-400" },
  { id: "picpay", label: "PicPay", accent: "#21C25E", ring: "ring-green-500" },
  { id: "mercadopago", label: "Mercado Pago", accent: "#009EE3", ring: "ring-blue-500" },
  { id: "efi", label: "Efí Bank", accent: "#F37021", ring: "ring-orange-400" },
  { id: "pix-comprovante", label: "Comprovante Pix", accent: "#32BCAD", ring: "ring-teal-500" },
];

const CATEGORY_OPTIONS = [
  "Sem categoria", "Alimentação", "Transporte", "Saúde", "Educação",
  "Lazer", "Moradia", "Salário", "Freelance", "Investimento", "Transferência", "Outros",
];

const formatCurrency = (value: string) => {
  const num = parseFloat(value.replace(/\D/g, "")) / 100;
  if (isNaN(num)) return "R$ 0,00";
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

const formatCurrencyPlus = (value: string) => {
  const num = parseFloat(value.replace(/\D/g, "")) / 100;
  if (isNaN(num)) return "+R$ 0,00";
  return `+R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseFloat(digits) / 100;
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

const calcTotal = (transactions: Transaction[]) => {
  const sum = transactions.reduce((acc, t) => {
    const digits = t.value.replace(/\D/g, "");
    return acc + (parseFloat(digits) || 0);
  }, 0);
  const num = sum / 100;
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

/* ── Sortable transaction card ─────────────────────────── */

function SortableTransaction({
  t, i, total, bank, onRemove, onUpdate, onDuplicate,
}: {
  t: Transaction;
  i: number;
  total: number;
  bank: BankType;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Transaction, val: string) => void;
  onDuplicate: (id: string) => void;
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
      <input
        type="text"
        placeholder="Nome completo"
        value={t.name}
        maxLength={60}
        onChange={(e) => onUpdate(t.id, "name", e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      />
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
        <input
          type="text"
          placeholder="Horário (ex: 23:10)"
          value={t.time}
          onChange={(e) => onUpdate(t.id, "time", e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
      )}
    </div>
  );
}

/* ── Preview renderers per bank ──────────────────────────── */

function PreviewInter({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <>
      {dateLabel && (
        <p className="text-xs font-semibold px-4 pt-3 pb-1" style={{ color: "#999" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-4"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
          <div className="flex items-center justify-center w-8" style={{ color: "#999" }}>
            <MoreHorizontal size={20} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Pix recebido</p>
            <p className="text-sm" style={{ color: "#333" }}>{t.name || "Nome da pessoa"}</p>
            <p className="text-xs" style={{ color: "#999" }}>{t.category}</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "#2e7d32" }}>
              {formatCurrency(t.value)}
            </span>
            <MoreVertical size={18} style={{ color: "#f57c00" }} />
          </div>
        </div>
      ))}
    </>
  );
}

function PreviewNeon({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="px-4 py-4">
      <p className="text-base font-bold mb-4" style={{ color: "#1a1a1a" }}>{dateLabel}</p>
      <div>
        {transactions.map((t, i) => (
          <div key={t.id} className="py-4"
            style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
            <div className="flex items-start">
              <div className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
                style={{ width: 44, height: 44, backgroundColor: "#d4f5c4" }}>
                <ArrowDownRight size={20} style={{ color: "#1b5e20" }} />
              </div>
              <div className="flex-1 ml-3">
                <p className="text-sm font-bold" style={{ color: "#1a2e44" }}>
                  Pix recebido de {t.name || "Nome da pessoa"}
                </p>
              </div>
              <p className="shrink-0 ml-4" style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32", marginTop: 1 }}>{formatCurrencyPlus(t.value)}</p>
            </div>
            <div className="flex justify-between" style={{ marginLeft: 56, marginTop: 4 }}>
              <p style={{ fontSize: 11, color: "#888" }}>Recebidos</p>
              <p style={{ fontSize: 11, color: "#888" }}>{t.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewNubank({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="py-2" style={{ backgroundColor: "#1a1a1a" }}>
      {dateLabel && (
        <p className="text-xs font-bold uppercase tracking-wider px-4 pt-2 pb-3" style={{ color: "#8A05BE" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #2a2a2a" : "none" }}>
          <div className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 48, height: 48, backgroundColor: "#1b3a1b" }}>
            <img src="/nubank-icon.png" alt="" style={{ width: 28, height: 28 }} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>{t.name || "Nome da pessoa"}</p>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>{t.time} · Pix</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium" style={{ color: "#66bb6a" }}>{formatCurrencyPlus(t.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewC6({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div style={{ backgroundColor: "#1a1a1a" }} className="py-2">
      {dateLabel && (
        <p className="text-xs font-semibold uppercase tracking-wider px-4 pt-2 pb-3" style={{ color: "#F5C518" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #333" : "none" }}>
          <div className="flex items-center justify-center rounded-md shrink-0"
            style={{ width: 40, height: 40, backgroundColor: "#2a2a2a" }}>
            <ArrowDownLeft size={18} style={{ color: "#F5C518" }} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>Pix recebido</p>
            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{t.name || "Nome da pessoa"}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: "#4caf50" }}>{formatCurrencyPlus(t.value)}</p>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>{t.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewPicPay({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="py-2">
      {dateLabel && (
        <p className="text-xs font-bold px-4 pt-2 pb-3" style={{ color: "#21C25E" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
          <div className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 42, height: 42, backgroundColor: "#E8F5E9" }}>
            <ArrowUpRight size={18} style={{ color: "#21C25E", transform: "rotate(180deg)" }} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{t.name || "Nome da pessoa"}</p>
            <p className="text-xs mt-0.5" style={{ color: "#999" }}>Pix - {t.time}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: "#21C25E" }}>{formatCurrencyPlus(t.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CurrencySuperscript({ value, color }: { value: string; color: string }) {
  const digits = value.replace(/\D/g, "");
  const num = parseFloat(digits) / 100;
  if (isNaN(num)) {
    return (
      <span style={{ color, fontSize: 14, fontWeight: 700 }}>
        + R$ 0<span style={{ fontSize: 9, position: "relative", top: -4, marginLeft: 1 }}>00</span>
      </span>
    );
  }
  const [intPart, decPart = "00"] = num.toFixed(2).split(".");
  const formatted = parseInt(intPart).toLocaleString("pt-BR");
  return (
    <span style={{ color, fontSize: 14, fontWeight: 700 }}>
      + R$ {formatted}<span style={{ fontSize: 9, position: "relative", top: -4, marginLeft: 1 }}>{decPart}</span>
    </span>
  );
}

function PreviewMercadoPago({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  const formatTimeMP = (time: string) => time.replace(":", "h");
  return (
    <div className="py-2">
      {dateLabel && (
        <p className="text-xs font-bold px-4 pt-2 pb-3" style={{ color: "#009EE3" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3.5"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
          <div className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 46, height: 46, border: "1.5px solid #ddd", backgroundColor: "#fafafa" }}>
            <img src="/mercadopago-icon.png" alt="" style={{ width: 24, height: 24 }} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>Pix recebido</p>
            <p className="text-xs mt-0.5" style={{ color: "#888", textTransform: "uppercase" }}>{t.name || "Nome da pessoa"}</p>
          </div>
          <div className="text-right shrink-0">
            <CurrencySuperscript value={t.value} color="#2e7d32" />
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>{formatTimeMP(t.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewEfi({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="py-2">
      {dateLabel && (
        <p className="text-xs font-bold px-4 pt-2 pb-3" style={{ color: "#F37021" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3.5"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
          <div className="flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 42, height: 42, backgroundColor: "#FFF3E0" }}>
            <ArrowDownLeft size={18} style={{ color: "#F37021" }} />
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Pix recebido</p>
            <p className="text-xs mt-0.5" style={{ color: "#666" }}>{t.name || "Nome da pessoa"} - {t.time}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: "#2e7d32" }}>{formatCurrencyPlus(t.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Comprovante Pix preview ────────────────────────────── */

interface PixData {
  valor: string;
  pagador: string;
  cpfPagador: string;
  cnpjPagador: string;
  recebedor: string;
  cpfRecebedor: string;
  instituicaoPagador: string;
  instituicaoRecebedor: string;
  dataHora: string;
  idTransacao: string;
}

function generatePixId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// Máscara para INPUT (mostra tudo enquanto digita)
function maskCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function maskCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

// Máscara para PREVIEW (oculta parcialmente como nos bancos)
function hideCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return "***.***.***-**";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

function hideCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length < 14) return "**.***.***//****-**";
  return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-**`;
}

function PreviewPixComprovante({ pixData }: { pixData: PixData }) {
  const valor = parseFloat(pixData.valor.replace(/\D/g, "")) / 100;
  const valorFormatado = isNaN(valor) ? "R$ 0,00" : `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="px-5 py-6" style={{ backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#32BCAD" }}>
          <ArrowUpRight size={20} color="#fff" />
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: "#1a1a1a" }}>Pix enviado</p>
          <p className="text-xs" style={{ color: "#999" }}>{pixData.dataHora || "13/04/2026 - 14:30:00"}</p>
        </div>
      </div>

      {/* Valor */}
      <div className="mb-6 text-center py-4" style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
        <p className="text-xs mb-1" style={{ color: "#999" }}>Valor</p>
        <p className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>{valorFormatado}</p>
      </div>

      {/* Dados */}
      <div className="space-y-4">
        {/* Quem pagou */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#999" }}>Quem pagou</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>Nome</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>{pixData.pagador || "Nome do pagador"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>{pixData.cnpjPagador ? "CNPJ" : "CPF"}</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>
                {pixData.cnpjPagador
                  ? hideCNPJ(pixData.cnpjPagador)
                  : pixData.cpfPagador
                  ? hideCPF(pixData.cpfPagador)
                  : "***.***.***-**"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>Instituição</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>{pixData.instituicaoPagador || "Banco"}</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #eee" }} />

        {/* Quem recebeu */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#999" }}>Quem recebeu</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>Nome</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>{pixData.recebedor || "Nome do recebedor"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>CPF</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>
                {pixData.cpfRecebedor ? hideCPF(pixData.cpfRecebedor) : "***.***.***-**"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "#999" }}>Instituição</span>
              <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>{pixData.instituicaoRecebedor || "Banco"}</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #eee" }} />

        {/* ID da transação */}
        <div>
          <p className="text-xs" style={{ color: "#999" }}>ID da transação</p>
          <p className="text-[10px] font-mono break-all mt-0.5" style={{ color: "#666" }}>
            {pixData.idTransacao || "E00000000202604131430abcdef123456"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

const ExtratoGenerator = ({ showComprovante = false }: { showComprovante?: boolean }) => {
  const [bank, setBank] = useState<BankType>("inter");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", name: "", value: "", category: "Sem categoria", time: "23:10" },
  ]);
  const [dateLabel, setDateLabel] = useState("Hoje, 12 de abril");
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
    dataHora: "",
    idTransacao: generatePixId(),
  });

  const updatePixData = (field: keyof PixData, val: string) => {
    let sanitized = val;
    if (field === "valor") sanitized = val.replace(/\D/g, "").slice(0, 12);
    if (field === "cpfPagador" || field === "cpfRecebedor") sanitized = val.replace(/\D/g, "").slice(0, 11);
    if (field === "cnpjPagador") sanitized = val.replace(/\D/g, "").slice(0, 14);
    setPixData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const isPixMode = bank === "pix-comprovante";
  const visibleBanks = showComprovante ? BANKS : BANKS.filter((b) => b.id !== "pix-comprovante");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addTransaction = () => {
    setTransactions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", value: "", category: "Sem categoria", time: "23:10" },
    ]);
  };

  const duplicateTransaction = (id: string) => {
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
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    setTransactions([
      { id: Date.now().toString(), name: "", value: "", category: "Sem categoria", time: "23:10" },
    ]);
    setDateLabel("Hoje, 12 de abril");
  };

  const updateTransaction = (id: string, field: keyof Transaction, val: string) => {
    let sanitized = val;
    if (field === "name") sanitized = val.slice(0, 60);
    if (field === "value") sanitized = val.replace(/\D/g, "").slice(0, 12);
    if (field === "time") sanitized = val.replace(/[^0-9:]/g, "").slice(0, 5);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: sanitized } : t))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTransactions((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleExport = async () => {
    if (!extratoRef.current || exporting) return;
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
    }
  };

  const isDarkBank = bank === "c6" || bank === "nubank";
  const phoneBg = isDarkBank ? "#1a1a1a" : "#ffffff";
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
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Download size={16} /> {exporting ? "Exportando..." : "Exportar PNG"}
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
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Download size={16} /> {exporting ? "Exportando..." : "Exportar PNG"}
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
      <div className="w-full max-w-sm lg:sticky lg:top-4">
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
        <div className="mx-auto rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden" style={{ maxWidth: 340 }}>
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
