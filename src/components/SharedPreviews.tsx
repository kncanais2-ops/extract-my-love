import {
  MoreHorizontal, MoreVertical, ArrowDownLeft, ArrowDownRight, ArrowUpRight,
  ArrowLeft, Phone, PhoneIncoming, Video, Plus, Camera, Mic, Smile,
  Check, CheckCheck
} from "lucide-react";

function PicPayPixIcon({ size = 24, color = "#1a1a1a" }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M19.777 8.738c.361.361.693.693.948.994c.275.323.546.706.705 1.194a3.47 3.47 0 0 1 0 2.147c-.159.489-.43.872-.705 1.195c-.255.3-.587.633-.948.994l-4.515 4.515a18 18 0 0 1-.994.948c-.323.275-.707.546-1.195.705a3.48 3.48 0 0 1-2.147 0c-.488-.159-.87-.43-1.195-.705c-.3-.255-.632-.587-.993-.948l-4.515-4.515a18 18 0 0 1-.948-.994c-.275-.323-.546-.706-.705-1.195a3.47 3.47 0 0 1 0-2.147c.159-.488.43-.87.705-1.194c.254-.3.586-.633.948-.994l4.515-4.515c.361-.361.693-.693.993-.948c.324-.275.707-.546 1.195-.705a3.47 3.47 0 0 1 2.147 0c.489.159.872.43 1.195.705c.3.255.632.586.994.948zm-2.343-.237l1.253 1.253c.787.786 1.18 1.18 1.327 1.633c.13.398.13.828 0 1.226c-.147.454-.54.847-1.327 1.633l-1.253 1.253h-1.513a.8.8 0 0 1-.598-.28l-1.946-2.14a1.86 1.86 0 0 0-2.754 0l-1.947 2.14a.8.8 0 0 1-.597.28H6.565l-1.253-1.253c-.786-.786-1.179-1.18-1.326-1.633a2 2 0 0 1 0-1.226c.147-.454.54-.847 1.326-1.633l1.253-1.253H8.08c.209 0 .426.09.597.28l1.947 2.14a1.86 1.86 0 0 0 2.754 0l1.946-2.14a.8.8 0 0 1 .598-.28zm-1.489-1.489h-.024c-.652 0-1.262.286-1.7.767L12.276 9.92a.37.37 0 0 1-.55 0L9.778 7.78a2.3 2.3 0 0 0-1.7-.768h-.024l1.7-1.7c.786-.786 1.18-1.179 1.632-1.326c.4-.13.829-.13 1.227 0c.454.147.847.54 1.633 1.327zm-.024 9.976h.024l-1.7 1.7c-.785.786-1.178 1.179-1.632 1.326c-.398.13-.828.13-1.227 0c-.453-.147-.846-.54-1.632-1.327l-1.7-1.7h.025c.652 0 1.261-.285 1.699-.766l1.947-2.141a.37.37 0 0 1 .55 0l1.947 2.14a2.3 2.3 0 0 0 1.7.768"/>
    </svg>
  );
}

export interface Transaction {
  id: string;
  name: string;
  value: string;
  category: string;
  time: string;
}

export type BankType = "inter" | "neon" | "nubank" | "c6" | "picpay" | "mercadopago" | "efi" | "infinitepay" | "santander" | "contasimples" | "whatsapp" | "pix-comprovante";

export const BANKS: { id: BankType; label: string; accent: string; ring: string }[] = [
  { id: "inter", label: "Banco Inter", accent: "#f57c00", ring: "ring-orange-500" },
  { id: "neon", label: "Banco Neon", accent: "#00bcd4", ring: "ring-cyan-500" },
  { id: "nubank", label: "Nubank", accent: "#8A05BE", ring: "ring-purple-600" },
  { id: "c6", label: "C6 Bank", accent: "#F5C518", ring: "ring-yellow-400" },
  { id: "picpay", label: "PicPay", accent: "#21C25E", ring: "ring-green-500" },
  { id: "mercadopago", label: "Mercado Pago", accent: "#009EE3", ring: "ring-blue-500" },
  { id: "efi", label: "Efí Bank", accent: "#F37021", ring: "ring-orange-400" },
  { id: "infinitepay", label: "InfinitePay", accent: "#00A868", ring: "ring-green-600" },
  { id: "santander", label: "Santander", accent: "#EC0000", ring: "ring-red-600" },
  { id: "contasimples", label: "Conta Simples", accent: "#5b4337", ring: "ring-amber-900" },
  { id: "whatsapp", label: "WhatsApp", accent: "#25D366", ring: "ring-emerald-500" },
  { id: "pix-comprovante", label: "Comprovante Pix", accent: "#32BCAD", ring: "ring-teal-500" },
];

export const CATEGORY_OPTIONS = [
  "Sem categoria", "Alimentação", "Transporte", "Saúde", "Educação",
  "Lazer", "Moradia", "Salário", "Freelance", "Investimento", "Transferência", "Outros",
];

export const formatCurrency = (value: string) => {
  const num = parseFloat(value.replace(/\D/g, "")) / 100;
  if (isNaN(num)) return "R$ 0,00";
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

export const formatCurrencyPlus = (value: string) => {
  const num = parseFloat(value.replace(/\D/g, "")) / 100;
  if (isNaN(num)) return "+R$ 0,00";
  return `+R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

export const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseFloat(digits) / 100;
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

export const calcTotal = (transactions: Transaction[]) => {
  const sum = transactions.reduce((acc, t) => {
    const digits = t.value.replace(/\D/g, "");
    return acc + (parseFloat(digits) || 0);
  }, 0);
  const num = sum / 100;
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

export function PreviewInter({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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

export function PreviewNeon({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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

export function PreviewNubank({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>{t.time} • Pix</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium" style={{ color: "#66bb6a" }}>{formatCurrencyPlus(t.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PreviewC6({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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

export function PreviewPicPay({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="py-2">
      {dateLabel && (
        <p className="text-xs font-bold px-4 pt-2 pb-3" style={{ color: "#9a9a9a" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-4 py-3"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none" }}>
          <div className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: 52, height: 52, backgroundColor: "#F2F2F2" }}>
            <PicPayPixIcon size={26} color="#1a1a1a" />
          </div>
          <div className="flex-1 ml-3 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#1a1a1a", lineHeight: 1.4 }}>Pix recebido</p>
            <p className="text-sm mt-0.5" style={{ color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.4, wordBreak: "break-word" }}>
              {t.name || "Nome da pessoa"}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs" style={{ color: "#9a9a9a", lineHeight: 1.4 }}>{t.time}</span>
              <div className="shrink-0" style={{ whiteSpace: "nowrap" }}>
                <span className="text-sm font-bold" style={{ color: "#21A85A", lineHeight: 1.4 }}>{formatCurrencyPlus(t.value)}</span>
                <span style={{ color: "#9a9a9a", fontSize: 18, fontWeight: 400, marginLeft: 6, lineHeight: 1.4, fontFamily: "Arial, sans-serif", position: "relative", top: -4 }}>›</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CurrencySuperscript({ value, color }: { value: string; color: string }) {
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

export function PreviewMercadoPago({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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

export function PreviewEfi({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
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

export function PreviewInfinitePay({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div className="py-2" style={{ backgroundColor: "#F5F5F5" }}>
      {dateLabel && (
        <p className="text-[13px] font-medium px-5 pt-3 pb-2" style={{ color: "#777" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="flex items-center px-5 py-[14px]"
          style={{ borderBottom: i < transactions.length - 1 ? "1px solid #e5e5e5" : "none" }}>
          <div className="relative flex-shrink-0 bg-transparent flex items-center justify-center w-[54px] h-[54px]">
            <img src="/infinite-icon.png" alt="Pix" className="w-[54px] h-[54px] object-contain bg-transparent" />
          </div>
          <div className="flex-1 ml-[15px]">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium tracking-tight" style={{ color: "#111" }}>Pix {t.name || "Nome da pessoa"}</p>
              <p className="text-[15px] font-medium shrink-0 ml-2" style={{ color: "#1A7B36" }}>{formatCurrencyPlus(t.value)}</p>
            </div>
            <p className="text-[13.5px] mt-[1px]" style={{ color: "#666" }}>{t.time || "00:00"} • Recebido</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PreviewSantander({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  return (
    <div style={{ backgroundColor: "#ffffff", fontFamily: "'Kommon Grotesk', Arial, Helvetica, sans-serif" }}>
      {dateLabel && (
        <p className="px-5 pt-4 pb-2" style={{ fontSize: 13, fontWeight: 600, color: "#5a5a5a" }}>{dateLabel}</p>
      )}
      {transactions.map((t, i) => (
        <div key={t.id} className="px-5 py-5"
          style={{
            borderBottom: i < transactions.length - 1 ? "1px solid #e0e0e0" : "none",
          }}>
          <p style={{ fontSize: 17, color: "#1f1f1f", marginBottom: 18, fontWeight: 400 }}>Pix Recebido</p>
          <div className="flex items-center">
            <p className="flex-1 pr-3" style={{ fontSize: 16, color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.3 }}>
              {t.name || "Nome da pessoa"}
            </p>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>R$</span>{formatCurrency(t.value).replace(/^R\$/, "")}
            </span>
            <span style={{ color: "#EC0000", fontSize: 22, fontWeight: 400, marginLeft: 12, lineHeight: 1, fontFamily: "Arial, sans-serif", position: "relative", top: -1 }}>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function toShortDateBR(label: string): string {
  const meses: Record<string, string> = {
    janeiro: "01", fevereiro: "02", março: "03", marco: "03", abril: "04",
    maio: "05", junho: "06", julho: "07", agosto: "08", setembro: "09",
    outubro: "10", novembro: "11", dezembro: "12",
  };
  const pad = (n: number | string) => String(n).padStart(2, "0");
  const ddmm = label.match(/(\d{1,2})\/(\d{1,2})/);
  if (ddmm) return `${pad(ddmm[1])}/${pad(ddmm[2])}`;
  const longMatch = label.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zçãé]+)/);
  if (longMatch && meses[longMatch[2]]) return `${pad(longMatch[1])}/${meses[longMatch[2]]}`;
  const lower = label.toLowerCase();
  if (lower.includes("hoje")) {
    const d = new Date();
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  }
  if (lower.includes("ontem")) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  }
  return label;
}

export function PreviewContaSimples({ transactions, dateLabel }: { transactions: Transaction[]; dateLabel: string }) {
  const shortDate = dateLabel ? toShortDateBR(dateLabel) : "";
  return (
    <div style={{ backgroundColor: "#fefdf8", fontFamily: "'Kommon Grotesk', Arial, Helvetica, sans-serif" }}>
      {transactions.map((t) => (
        <div
          key={t.id}
          className="grid px-4 py-4"
          style={{
            borderTop: "1px solid #E5DDD0",
            gridTemplateColumns: "20px 1fr auto",
            columnGap: 10,
            rowGap: 6,
            alignItems: "center",
          }}
        >
          {/* Row 1: header */}
          <div />
          <p style={{ fontSize: 17, color: "#5b4337", fontWeight: 400, margin: 0 }}>Transferências PIX</p>
          <p style={{ fontSize: 17, color: "#5b4337", fontWeight: 400, margin: 0, justifySelf: "end" }}>{shortDate}</p>

          {/* Row 2: icon + name + value */}
          <img src="/conta-simples-icon.svg" alt="" style={{ width: 18, height: 18 }} />
          <p style={{ fontSize: 16, color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.3, margin: 0 }}>
            {t.name || "Nome da pessoa"}
          </p>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", justifySelf: "end" }}>
            -{formatCurrency(t.value)}
          </span>

          {/* Row 3: file icon */}
          <div />
          <img src="/conta-simples-file.svg" alt="" style={{ width: 14, height: 14, marginTop: 8 }} />
          <div />
        </div>
      ))}
    </div>
  );
}

/* ── WhatsApp ───────────────────────────────────────── */

export type WhatsAppMessageType = "text" | "voice-call" | "missed-call" | "image" | "pdf";
export type WhatsAppReadStatus = "none" | "sent" | "delivered" | "read";

export interface WhatsAppMessage {
  id: string;
  type: WhatsAppMessageType;
  side: "left" | "right";
  time: string;
  readStatus: WhatsAppReadStatus;
  text?: string;
  duration?: string;
  images?: string[];
  pdfTitle?: string;
  pdfFilename?: string;
  pdfSize?: string;
  pdfPages?: string;
  pdfCaption?: string;
}

export type WhatsAppPixKeyType = "random" | "cpf" | "email" | "phone";

export interface WhatsAppData {
  contactName: string;
  avatar: string;
  unreadCount: string;
  // Greeting (sent — fixed/editable text)
  greetingText: string;
  greetingTime: string;
  greetingReadStatus: WhatsAppReadStatus;
  // Reaction (received — randomizable)
  reactionText: string;
  reactionTime: string;
  // Pix key (received — auto-generated)
  pixKey: string;
  pixKeyType: WhatsAppPixKeyType;
  pixKeyTime: string;
  // Payment confirmation (sent — fixed/editable)
  paymentText: string;
  paymentTime: string;
  paymentReadStatus: WhatsAppReadStatus;
  // Receipt
  receiptPosition: "before" | "after";
  receiptFilename: string;
  receiptCaption: string;
  receiptTime: string;
  receiptReadStatus: WhatsAppReadStatus;
}

export const REACTION_VARIATIONS = [
  "Oii nem acredito que eu ganhei",
  "Sério??? Que felicidade!",
  "Não tô acreditando!! Obrigado!!!",
  "Caraca!! Mt obrigado!!",
  "Que doideira mn, primeira vez que ganho algo assim",
  "Nossa que sorte minha kkkk",
  "Mds eu ganhei mesmo??",
  "Aaaa que coisa boa!!!",
  "Não sabia que eu podia ganhar",
  "Vou te mandar minha chave já já",
  "Putz que bom!! Eu precisava muito disso!!",
  "Verdade?? Tava precisando demais!!",
  "Carai não acredito kkkk muito obg",
  "Você é meu anjo da guarda kkkk",
  "Olha eu nem to acreditando",
  "Caraca, é serio mesmo? muito obg",
  "Que demais!!! Obrigado mt obg",
  "Aaaaa eu fiquei muito feliz!!!",
  "Nossa, eu nem sabia que tinha sido sorteado",
  "Tô em choque kkkk muito obrigado",
];

export function generateReactionText(exclude?: string): string {
  let pick = REACTION_VARIATIONS[Math.floor(Math.random() * REACTION_VARIATIONS.length)];
  let attempts = 0;
  while (pick === exclude && attempts < 5) {
    pick = REACTION_VARIATIONS[Math.floor(Math.random() * REACTION_VARIATIONS.length)];
    attempts++;
  }
  return pick;
}

export function generatePixKey(type: WhatsAppPixKeyType): string {
  const rand = (n: number, chars: string) =>
    Array.from({ length: n }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  switch (type) {
    case "cpf": {
      const d = rand(11, "0123456789");
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    }
    case "email": {
      const names = ["lucas", "maria", "joao", "ana", "pedro", "julia", "carlos", "fernanda", "rafael", "beatriz", "thiago", "camila", "bruno", "amanda", "gabriel"];
      const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"];
      return `${names[Math.floor(Math.random() * names.length)]}${rand(3, "0123456789")}@${domains[Math.floor(Math.random() * domains.length)]}`;
    }
    case "phone": {
      return `+55 ${rand(2, "123456789")} 9${rand(4, "0123456789")}-${rand(4, "0123456789")}`;
    }
    case "random":
    default: {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      return `${rand(12, chars)}-${rand(11, chars)}-${rand(10, chars)}`;
    }
  }
}

export function generateReceiptFilename(): string {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("");
  return `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}.pdf`;
}

export function generateReceiptCaption(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function buildReceiptMessage(data: WhatsAppData): WhatsAppMessage {
  return {
    id: "__receipt__",
    type: "pdf",
    side: "right",
    time: data.receiptTime,
    readStatus: data.receiptReadStatus,
    pdfTitle: "Comprovante de Pix",
    pdfFilename: data.receiptFilename,
    pdfSize: "21 KB",
    pdfPages: "1",
    pdfCaption: data.receiptCaption,
  };
}

function WhatsAppReadMarks({ status }: { status: WhatsAppReadStatus }) {
  if (status === "none") return null;
  if (status === "sent") return <Check size={14} style={{ color: "#8696a0", marginLeft: 2 }} />;
  const color = status === "read" ? "#53bdeb" : "#8696a0";
  return <CheckCheck size={14} style={{ color, marginLeft: 2 }} />;
}

function WhatsAppBubble({ msg, isFirst }: { msg: WhatsAppMessage; isFirst: boolean }) {
  const isRight = msg.side === "right";
  const bubbleBg = isRight ? "#D9FDD3" : "#FFFFFF";
  const tailRadius = isFirst ? (isRight ? "12px 12px 4px 12px" : "12px 12px 12px 4px") : "12px";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"} px-3`}>
      <div
        style={{
          backgroundColor: bubbleBg,
          borderRadius: tailRadius,
          maxWidth: "88%",
          padding: "6px 9px 6px 10px",
          boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
          position: "relative",
        }}
      >
        {msg.type === "text" && (
          <div style={{ position: "relative", paddingBottom: 12, minWidth: isRight ? 64 : 44 }}>
            <span
              style={{
                fontSize: 14.5,
                color: "#111b21",
                lineHeight: 1.35,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "normal",
              }}
            >
              {msg.text || ""}
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                fontSize: 11,
                color: "#667781",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              {msg.time}
              {isRight && <WhatsAppReadMarks status={msg.readStatus} />}
            </span>
          </div>
        )}

        {(msg.type === "voice-call" || msg.type === "missed-call") && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 6px 6px 4px", minWidth: 220 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: msg.type === "missed-call" ? "#fff" : "#fff",
                border: "1px solid #e9edef",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PhoneIncoming
                size={18}
                style={{ color: msg.type === "missed-call" ? "#ea0038" : "#54656f", transform: "rotate(180deg)" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111b21", margin: 0 }}>
                {msg.type === "missed-call" ? "Ligação de voz perdida" : "Ligação de voz"}
              </p>
              <p style={{ fontSize: 13, color: "#667781", margin: 0, marginTop: 1 }}>
                {msg.type === "missed-call" ? "Toque para retornar" : msg.duration || "0 minutos"}
              </p>
            </div>
            <span style={{ fontSize: 11, color: "#667781", alignSelf: "flex-end", marginLeft: 6 }}>
              {msg.time}
              {isRight && <WhatsAppReadMarks status={msg.readStatus} />}
            </span>
          </div>
        )}

        {msg.type === "image" && (
          <div style={{ padding: 0 }}>
            <WhatsAppImageGroup images={msg.images || []} time={msg.time} readStatus={msg.readStatus} isRight={isRight} />
          </div>
        )}

        {msg.type === "pdf" && (
          <div style={{ width: "100%", minWidth: 220 }}>
            {msg.pdfTitle && (
              <>
                <div
                  style={{
                    backgroundColor: "#fff",
                    backgroundImage: "url(/caixa-receipt-bg.svg)",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    padding: "16px 18px 30px 18px",
                    color: "#fff",
                    borderRadius: "6px 6px 0 0",
                  }}
                >
                  <img src="/caixa-logo.png" alt="CAIXA" style={{ height: 18, width: "auto", display: "block" }} />
                  <p
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: 0.3,
                      lineHeight: 1.1,
                    }}
                  >
                    {msg.pdfTitle}
                  </p>
                </div>
                {/* Faixa branca abaixo do zigzag */}
                <div style={{ backgroundColor: "#fff", height: 12 }} />
              </>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", backgroundColor: "#d5f3cf", borderRadius: "0 0 6px 6px", marginTop: 0 }}>
              <img src="/pdf-icon.svg" alt="PDF" style={{ width: 36, height: 41, flexShrink: 0, display: "block" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#111b21", margin: 0, wordBreak: "break-all", lineHeight: 1.3 }}>
                  {msg.pdfFilename || "documento.pdf"}
                </p>
                <p style={{ fontSize: 11, color: "#667781", margin: 0, marginTop: 2 }}>
                  {msg.pdfPages || "1"} página{(msg.pdfPages || "1") !== "1" ? "s" : ""} · {msg.pdfSize || "0 KB"} · pdf
                </p>
              </div>
            </div>
            {msg.pdfCaption && (
              <p style={{ fontSize: 14.5, margin: "6px 0 0 0", padding: "0 4px" }}>
                <span style={{ color: "#1a1a1a" }}>{msg.pdfCaption.charAt(0)}</span>
                <span style={{ color: "#0a7c2f", textDecoration: "underline" }}>{msg.pdfCaption.slice(1)}</span>
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 4, padding: "0 4px" }}>
              <span style={{ fontSize: 11, color: "#667781" }}>{msg.time}</span>
              {isRight && <WhatsAppReadMarks status={msg.readStatus} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppImageGroup({ images, time, readStatus, isRight }: { images: string[]; time: string; readStatus: WhatsAppReadStatus; isRight: boolean }) {
  const count = images.length;
  if (count === 0) return null;
  if (count === 1) {
    return (
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
        <img src={images[0]} alt="" style={{ display: "block", width: "100%", maxHeight: 260, objectFit: "cover" }} />
        <span style={{ position: "absolute", bottom: 6, right: 8, fontSize: 11, color: "#fff", textShadow: "0 0 4px rgba(0,0,0,0.6)", display: "inline-flex", alignItems: "center" }}>
          {time}
          {isRight && <WhatsAppReadMarks status={readStatus} />}
        </span>
      </div>
    );
  }
  const visible = images.slice(0, 4);
  const overflow = count - 4;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, borderRadius: 8, overflow: "hidden", maxWidth: 280 }}>
      {visible.map((src, i) => {
        const showOverflow = overflow > 0 && i === 3;
        return (
          <div key={i} style={{ position: "relative", aspectRatio: "1", background: "#000" }}>
            <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", filter: showOverflow ? "blur(2px) brightness(0.6)" : undefined }} />
            {showOverflow && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 600 }}>
                +{overflow}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const WHATSAPP_BG_COLOR = "#e7e4df";

export function PreviewWhatsApp({ data }: { data: WhatsAppData }) {
  return (
    <div style={{
      backgroundColor: WHATSAPP_BG_COLOR,
      backgroundImage: "url(/whatsapp-bg.jpg)",
      backgroundRepeat: "repeat",
      backgroundSize: "auto",
      fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ background: "#e7e4df", padding: "10px 14px 12px 14px", borderBottom: "1px solid #d9d4cc" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <ArrowLeft size={22} style={{ color: "#1a1a1a", flexShrink: 0 }} />
            {data.unreadCount && (
              <span style={{ color: "#1a1a1a", fontSize: 17, fontWeight: 400, flexShrink: 0 }}>{data.unreadCount}</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, minWidth: 0 }}>
              {data.avatar ? (
                <img src={data.avatar} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dcdcdc", flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 17, fontWeight: 600, color: "#111b21", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {data.contactName || "Contato"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
            <Video size={22} style={{ color: "#1a1a1a" }} strokeWidth={1.6} />
            <Phone size={20} style={{ color: "#1a1a1a" }} strokeWidth={1.6} />
          </div>
        </div>
      </div>

      {/* Messages — fixed template + receipt injected at chosen position */}
      <div style={{ padding: "10px 0 12px 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {(() => {
          const templateMessages: WhatsAppMessage[] = [
            { id: "g", type: "text", side: "right", time: data.greetingTime, readStatus: data.greetingReadStatus, text: data.greetingText },
            { id: "r", type: "text", side: "left", time: data.reactionTime, readStatus: "none", text: data.reactionText },
            { id: "k", type: "text", side: "left", time: data.pixKeyTime, readStatus: "none", text: data.pixKey },
            { id: "p", type: "text", side: "right", time: data.paymentTime, readStatus: data.paymentReadStatus, text: data.paymentText },
          ];
          const receipt = buildReceiptMessage(data);
          const all = data.receiptPosition === "before"
            ? [receipt, ...templateMessages]
            : [...templateMessages, receipt];
          return all.map((msg, i) => {
            const prev = all[i - 1];
            const isFirst = !prev || prev.side !== msg.side;
            return (
              <div key={msg.id} style={{ marginTop: isFirst && i > 0 ? 6 : 0 }}>
                <WhatsAppBubble msg={msg} isFirst={isFirst} />
              </div>
            );
          });
        })()}
      </div>

      {/* Composer */}
      <div style={{ background: "#e7e4df", padding: "8px 10px 10px 10px", borderTop: "1px solid #d9d4cc", display: "flex", alignItems: "center", gap: 8 }}>
        <Plus size={26} style={{ color: "#1a1a1a", flexShrink: 0 }} strokeWidth={1.5} />
        <div style={{ flex: 1, background: "#fff", borderRadius: 18, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, border: "1px solid #d9d4cc", minHeight: 32 }}>
          <span style={{ flex: 1, fontSize: 13, color: "transparent" }}>x</span>
          <Smile size={20} style={{ color: "#54656f" }} strokeWidth={1.6} />
        </div>
        <Camera size={24} style={{ color: "#1a1a1a", flexShrink: 0 }} strokeWidth={1.6} />
        <Mic size={22} style={{ color: "#1a1a1a", flexShrink: 0 }} strokeWidth={1.6} />
      </div>
    </div>
  );
}

export interface PixData {
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

export function generatePixId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export function maskCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function maskCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function hideCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return "***.***.***-**";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function hideCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length < 14) return "**.***.***//****-**";
  return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-**`;
}

export function PreviewPixComprovante({ pixData }: { pixData: PixData }) {
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
