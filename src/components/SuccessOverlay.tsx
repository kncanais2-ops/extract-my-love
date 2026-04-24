import Lottie from "lottie-react";
import successAnim from "@/assets/success-check.json";

export default function SuccessOverlay({ visible, onDone }: { visible: boolean; onDone?: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="bg-card/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-black/30 p-6 border border-border/50 animate-in fade-in zoom-in duration-200">
        <Lottie
          animationData={successAnim}
          loop={false}
          autoplay
          style={{ width: 140, height: 140 }}
          onComplete={onDone}
        />
      </div>
    </div>
  );
}
