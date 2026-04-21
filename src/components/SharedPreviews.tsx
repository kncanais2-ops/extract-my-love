import {
  MoreHorizontal, MoreVertical, ArrowDownLeft, ArrowDownRight, ArrowUpRight, ChevronRight
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

export type BankType = "inter" | "neon" | "nubank" | "c6" | "picpay" | "mercadopago" | "efi" | "infinitepay" | "pix-comprovante";

export const BANKS: { id: BankType; label: string; accent: string; ring: string }[] = [
  { id: "inter", label: "Banco Inter", accent: "#f57c00", ring: "ring-orange-500" },
  { id: "neon", label: "Banco Neon", accent: "#00bcd4", ring: "ring-cyan-500" },
  { id: "nubank", label: "Nubank", accent: "#8A05BE", ring: "ring-purple-600" },
  { id: "c6", label: "C6 Bank", accent: "#F5C518", ring: "ring-yellow-400" },
  { id: "picpay", label: "PicPay", accent: "#21C25E", ring: "ring-green-500" },
  { id: "mercadopago", label: "Mercado Pago", accent: "#009EE3", ring: "ring-blue-500" },
  { id: "efi", label: "Efí Bank", accent: "#F37021", ring: "ring-orange-400" },
  { id: "infinitepay", label: "InfinitePay", accent: "#00A868", ring: "ring-green-600" },
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
        <p className="text-xs font-bold px-4 pt-2 pb-3" style={{ color: "#21C25E" }}>{dateLabel}</p>
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
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-bold" style={{ color: "#21A85A", lineHeight: 1.4 }}>{formatCurrencyPlus(t.value)}</span>
                <ChevronRight size={16} className="shrink-0" style={{ color: "#9a9a9a", display: "block", verticalAlign: "middle" }} />
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
