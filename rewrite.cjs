const fs = require('fs');

const lines = fs.readFileSync('src/components/ExtratoGenerator.tsx', 'utf8').split('\n');

const topImp = `import { useState, useRef } from "react";
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

/* ── Sortable transaction card ─────────────────────────── */
`;

let sortableTrans = [];
let i = 0;
while(i < lines.length) {
  if (lines[i].includes('function SortableTransaction({')) {
    break;
  }
  i++;
}

while(i < lines.length) {
  sortableTrans.push(lines[i]);
  if (lines[i] === '}') {
    break;
  }
  i++;
}

const componentStart = `
/* ── Main component ──────────────────────────────────────── */

const ExtratoGenerator = ({ showComprovante = false }: { showComprovante?: boolean }) => {
  const { user } = useAuth();
  const [sendingToObs, setSendingToObs] = useState(false);

  const sendToObs = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar para o OBS!");
      return;
    }
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
    { id: "1", name: "", value: "", category: "Sem categoria", time: "23:10" },
  ]);
  const [dateLabel, setDateLabel] = useState("Hoje, 12 de abril");
  const extratoRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
`;

let restOfComponent = [];
while(i < lines.length) {
  if (lines[i].includes('// Comprovante Pix state')) {
    break;
  }
  i++;
}

while(i < lines.length) {
  restOfComponent.push(lines[i]);
  i++;
}

let restStr = restOfComponent.join('\n');

restStr = restStr.replace(
  '<button\n                  onClick={handleExport}\n                  disabled={exporting}\n                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"\n                >\n                  <Download size={16} /> {exporting ? "Exportando..." : "Exportar PNG"}\n                </button>',
  '<button\n                  onClick={sendToObs}\n                  disabled={sendingToObs}\n                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"\n                >\n                  <Send size={16} /> {sendingToObs ? "Enviando..." : "Mandar pra Tela"}\n                </button>\n                <button\n                  onClick={handleExport}\n                  disabled={exporting}\n                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"\n                >\n                  <Download size={16} /> Exportar\n                </button>'
);

restStr = restStr.replace(
  '<button\n                  onClick={addTransaction}\n                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"\n                >\n                  <Plus size={16} /> Adicionar\n                </button>\n                <button\n                  onClick={handleExport}\n                  disabled={exporting}\n                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"\n                >\n                  <Download size={16} /> {exporting ? "Exportando..." : "Exportar PNG"}\n                </button>',
  '<button\n                  onClick={addTransaction}\n                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"\n                >\n                  <Plus size={16} /> Adicionar\n                </button>\n                <button\n                  onClick={sendToObs}\n                  disabled={sendingToObs}\n                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"\n                >\n                  <Send size={16} /> {sendingToObs ? "Enviando..." : "Tela"}\n                </button>\n                <button\n                  onClick={handleExport}\n                  disabled={exporting}\n                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"\n                >\n                  <Download size={16} /> Exportar\n                </button>'
);

const finalFile = topImp + sortableTrans.join('\n') + '\n' + componentStart + restStr;

fs.writeFileSync('src/components/ExtratoGenerator.tsx', finalFile);
