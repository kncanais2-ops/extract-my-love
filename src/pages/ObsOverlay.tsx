import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Transaction, BankType, PixData,
  PreviewInter, PreviewNeon, PreviewNubank, PreviewC6, PreviewPicPay,
  PreviewMercadoPago, PreviewEfi, PreviewInfinitePay, PreviewSantander, PreviewContaSimples, PreviewPixComprovante
} from "@/components/SharedPreviews";

export default function ObsOverlay() {
  const { id } = useParams();
  const [bank, setBank] = useState<BankType>("inter");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateLabel, setDateLabel] = useState("");
  const [pixData, setPixData] = useState<PixData | null>(null);

  useEffect(() => {
    if (!id) return;

    // Conectar ao canal Supabase específico desse ID de usuário
    const channel = supabase.channel(`obs-${id}`)
      .on("broadcast", { event: "update-obs" }, (payload) => {
        const data = payload.payload;
        if (data.bank) setBank(data.bank);
        if (data.transactions) setTransactions(data.transactions);
        if (typeof data.dateLabel === "string") setDateLabel(data.dateLabel);
        if (data.pixData) setPixData(data.pixData);
        console.log("Recebido via OBS:", data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const renderPreview = () => {
    if (transactions.length === 0 && !pixData) return null; // Aguardando
    if (bank === "pix-comprovante" && pixData) {
      return <PreviewPixComprovante pixData={pixData} />;
    }
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
      case "santander": return <PreviewSantander {...props} />;
      case "contasimples": return <PreviewContaSimples {...props} />;
      default: return null;
    }
  };

  const isDarkBank = bank === "c6" || bank === "nubank";
  const phoneBg = isDarkBank ? "#1a1a1a" : bank === "infinitepay" ? "#f2f2f2" : bank === "contasimples" ? "#fefdf8" : "#ffffff";

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 bg-transparent overflow-hidden">
      <div 
        className="rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden w-full max-w-[400px] border border-black/10 transition-all duration-300" 
        style={{ backgroundColor: phoneBg }}
      >
        {renderPreview()}
      </div>
    </div>
  );
}
