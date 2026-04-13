import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAntiClone } from "./lib/anti-clone";

// Ativa proteção anti-clonagem
initAntiClone();

createRoot(document.getElementById("root")!).render(<App />);
