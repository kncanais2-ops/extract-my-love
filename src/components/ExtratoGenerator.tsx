import { useState, useRef } from "react";
import { Plus, Trash2, MoreHorizontal, MoreVertical, Download, ArrowDownLeft } from "lucide-react";
import html2canvas from "html2canvas";

interface Transaction {
  id: string;
  name: string;
  value: string;
  category: string;
  time: string;
}

type ModelType = "model1" | "model2";

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

const ExtratoGenerator = () => {
  const [model, setModel] = useState<ModelType>("model1");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", name: "", value: "", category: "Sem categoria", time: "23:10" },
  ]);
  const [dateLabel, setDateLabel] = useState("Hoje, 11 de abril");
  const extratoRef = useRef<HTMLDivElement>(null);

  const addTransaction = () => {
    setTransactions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", value: "", category: "Sem categoria", time: "23:10" },
    ]);
  };

  const removeTransaction = (id: string) => {
    if (transactions.length <= 1) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof Transaction, val: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const handleExport = async () => {
    if (!extratoRef.current) return;
    const canvas = await html2canvas(extratoRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "extrato.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-8 gap-8 flex-wrap">
      {/* Form */}
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-foreground mb-4">Gerador de Extrato</h1>

        {/* Model Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setModel("model1")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
              model === "model1"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            Modelo 1
          </button>
          <button
            onClick={() => setModel("model2")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
              model === "model2"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            Modelo 2
          </button>
        </div>

        {/* Date label for model 2 */}
        {model === "model2" && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Ex: Hoje, 11 de abril"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div className="space-y-4">
          {transactions.map((t, i) => (
            <div key={t.id} className="bg-card rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Transação {i + 1}
                </span>
                {transactions.length > 1 && (
                  <button
                    onClick={() => removeTransaction(t.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Nome completo"
                value={t.name}
                onChange={(e) => updateTransaction(t.id, "name", e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Valor (ex: 30000 = R$ 300,00)"
                value={t.value}
                onChange={(e) =>
                  updateTransaction(t.id, "value", e.target.value.replace(/\D/g, ""))
                }
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {model === "model2" && (
                <input
                  type="text"
                  placeholder="Horário (ex: 23:10)"
                  value={t.time}
                  onChange={(e) => updateTransaction(t.id, "time", e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={addTransaction}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-md py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Download size={16} /> Exportar PNG
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="w-full max-w-md">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Pré-visualização</h2>
        <div ref={extratoRef} className="bg-white rounded-lg overflow-hidden">
          {model === "model1" && (
            <>
              {transactions.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center px-4 py-4"
                  style={{
                    borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none",
                  }}
                >
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
          )}

          {model === "model2" && (
            <div className="px-4 py-4">
              <p className="text-base font-bold mb-4" style={{ color: "#1a1a1a" }}>
                {dateLabel}
              </p>
              {transactions.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center py-4"
                  style={{
                    borderBottom: i < transactions.length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  {/* Green circle with arrow */}
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: "#d4f5c4",
                    }}
                  >
                    <ArrowDownLeft size={20} style={{ color: "#1b5e20" }} />
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-sm font-bold" style={{ color: "#1a2e44" }}>
                      Pix recebido de{" "}
                      {t.name || "Nome da pessoa"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#888" }}>Recebidos</p>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#2e7d32" }}>
                      {formatCurrencyPlus(t.value)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#888" }}>{t.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtratoGenerator;
