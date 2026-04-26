import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Transaction, BankType, PixData, WhatsAppData,
  PreviewInter, PreviewNeon, PreviewNubank, PreviewC6, PreviewPicPay,
  PreviewMercadoPago, PreviewEfi, PreviewInfinitePay, PreviewSantander, PreviewContaSimples, PreviewPixComprovante,
  PreviewWhatsApp
} from "@/components/SharedPreviews";

export default function ObsOverlay() {
  const { id } = useParams();
  const [bank, setBank] = useState<BankType>("inter");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateLabel, setDateLabel] = useState("");
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [whatsappData, setWhatsappData] = useState<WhatsAppData | null>(null);
  const [phoneStatusTime, setPhoneStatusTime] = useState("20:19");

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
        if (data.whatsappData) setWhatsappData(data.whatsappData);
        if (typeof data.phoneStatusTime === "string") setPhoneStatusTime(data.phoneStatusTime);
        console.log("Recebido via OBS:", data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const renderPreview = () => {
    if (transactions.length === 0 && !pixData && !whatsappData) return null; // Aguardando
    if (bank === "pix-comprovante" && pixData) {
      return <PreviewPixComprovante pixData={pixData} />;
    }
    if (bank === "whatsapp" && whatsappData) {
      return <PreviewWhatsApp data={whatsappData} />;
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
  const phoneBg = isDarkBank
    ? "#1a1a1a"
    : bank === "infinitepay"
    ? "#f2f2f2"
    : bank === "contasimples"
    ? "#fefdf8"
    : bank === "whatsapp"
    ? "#e7e4df"
    : "#ffffff";

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent overflow-hidden">
      <div
        className="overflow-hidden w-full"
        style={{ backgroundColor: phoneBg, maxWidth: 720 }}
      >
        {/* Phone status bar — só pra WhatsApp */}
        {bank === "whatsapp" && (
        <div className="flex items-center justify-between px-5 pt-1 pb-1" style={{ backgroundColor: phoneBg }}>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold" style={{ color: isDarkBank ? "#fff" : "#1a1a1a" }}>{phoneStatusTime}</span>
            {/* Bell muted icon */}
            <svg width="28" height="28" viewBox="0 0 1024 1024" fill={isDarkBank ? "#fff" : "#1a1a1a"} xmlns="http://www.w3.org/2000/svg">
              <path d="M571.32 704a76.36 76.36 0 0 1-144.19 0zm-258.84-51.2L623.3 342c-8.46-25.2-31.52-39-73.21-44.49.06-1 .31-2 .31-3.06a51.2 51.2 0 1 0-102.4 0c0 1.05.25 2 .31 3.06-54.12 7.12-77.11 28.06-77.11 70.08v29.21c0 121.6-66.51 175.51-102.4 204.8.4.4 0 51.2 0 51.2zm315-248.63l119-119-16.6-16.6-461.32 461.31 16.58 16.6 93.68-93.68H729.6s-.4-50.8 0-51.2c-35.14-28.68-99.47-81.13-102.15-197.43z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Wifi */}
            <svg width="26" height="18" viewBox="0 -2 14 14" fill={isDarkBank ? "#fff" : "#1a1a1a"} xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(-247, -3524)">
                <path d="M252.600198,3532.58575 L254,3533.99975 L255.399802,3532.58575 C254.626644,3531.80475 253.373356,3531.80475 252.600198,3532.58575 M249.800594,3529.75775 L251.200396,3531.17175 C252.743742,3529.61175 255.256258,3529.61175 256.800594,3531.17175 L258.200396,3529.75775 C255.880922,3527.41375 252.120068,3527.41375 249.800594,3529.75775 M261,3526.92875 L259.600198,3528.34275 C256.512516,3525.22375 251.488474,3525.22375 248.399802,3528.34275 L247,3526.92875 C250.86579,3523.02375 257.13421,3523.02375 261,3526.92875" />
              </g>
            </svg>
            {/* Battery */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isDarkBank ? "#fff" : "#1a1a1a"} xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(90deg)" }}>
              <path d="M6 9C6 7.11438 6 6.17157 6.58579 5.58579C7.17157 5 8.11438 5 10 5H14C15.8856 5 16.8284 5 17.4142 5.58579C18 6.17157 18 7.11438 18 9V19C18 20.8856 18 21.8284 17.4142 22.4142C16.8284 23 15.8856 23 14 23H10C8.11438 23 7.17157 23 6.58579 22.4142C6 21.8284 6 20.8856 6 19V9Z" />
              <path d="M9 3C9 2.05719 9 1.58579 9.29289 1.29289C9.58579 1 10.0572 1 11 1H13C13.9428 1 14.4142 1 14.7071 1.29289C15 1.58579 15 2.05719 15 3V4H9V3Z" />
            </svg>
          </div>
        </div>
        )}

        {renderPreview()}
      </div>
    </div>
  );
}
