/**
 * Sistema anti-clonagem — protege contra cópia do site
 */

const ALLOWED_DOMAINS = [
  "extratoslive.shop",
  "www.extratoslive.shop",
  "extratolive.shop",
  "www.extratolive.shop",
  "localhost",
  "127.0.0.1",
];

export function initAntiClone() {
  blockDevTools();
  blockRightClick();
  blockKeyShortcuts();
  blockTextSelection();
  blockDragDrop();
  blockCopyPaste();
  blockIframe();
  checkDomain();
  blockViewSource();
  blockPrintScreen();
}

/** Bloqueia abertura do DevTools (F12, Ctrl+Shift+I/J/C, etc.) */
function blockDevTools() {
  // Detecta DevTools aberto via debugger
  const threshold = 160;

  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if (widthDiff || heightDiff) {
      document.body.innerHTML = "";
      window.location.href = "about:blank";
    }
  }, 1000);

  // Debugger trap — trava se DevTools estiver aberto
  (function loop() {
    setTimeout(() => {
      const before = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const after = performance.now();
      if (after - before > 100) {
        document.body.innerHTML = "";
        window.location.href = "about:blank";
      }
      loop();
    }, 2000);
  })();
}

/** Bloqueia clique direito */
function blockRightClick() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });
}

/** Bloqueia atalhos de teclado perigosos */
function blockKeyShortcuts() {
  document.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+C (Inspect element)
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View source)
    if (e.ctrlKey && e.key === "u") {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Save page)
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      return false;
    }

    // Ctrl+A (Select all)
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      return false;
    }

    // Ctrl+P (Print)
    if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+U (View source Firefox)
    if (e.ctrlKey && e.shiftKey && e.key === "U") {
      e.preventDefault();
      return false;
    }

    // Ctrl+H (History — pode expor URLs internas)
    if (e.ctrlKey && e.key === "h") {
      e.preventDefault();
      return false;
    }
  });
}

/** Bloqueia seleção de texto */
function blockTextSelection() {
  document.addEventListener("selectstart", (e) => {
    // Permite seleção em inputs e textareas
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // CSS anti-seleção
  const style = document.createElement("style");
  style.textContent = `
    *:not(input):not(textarea):not([contenteditable="true"]) {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);
}

/** Bloqueia arrastar elementos da página */
function blockDragDrop() {
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    return false;
  });
}

/** Bloqueia copiar/colar do conteúdo da página */
function blockCopyPaste() {
  document.addEventListener("copy", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return true;
    e.preventDefault();
    return false;
  });

  document.addEventListener("cut", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return true;
    e.preventDefault();
    return false;
  });
}

/** Impede que o site seja carregado dentro de um iframe (anti-phishing) */
function blockIframe() {
  if (window.self !== window.top) {
    document.body.innerHTML = "";
    window.top!.location.href = window.self.location.href;
  }
}

/** Verifica se o site está rodando no domínio correto */
function checkDomain() {
  const hostname = window.location.hostname;
  const isAllowed = ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));

  if (!isAllowed) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:20px;">
        <div>
          <h1 style="font-size:2rem;margin-bottom:1rem;">Site clonado detectado</h1>
          <p style="opacity:0.7;">Este não é o site oficial. Acesse:</p>
          <a href="https://extratoslive.shop" style="color:#3b82f6;font-size:1.2rem;">extratoslive.shop</a>
        </div>
      </div>
    `;
  }
}

/** Bloqueia view-source e scraping via console */
function blockViewSource() {
  // Sobrescreve console para dificultar debug
  const noop = () => undefined;
  Object.defineProperty(window, "console", {
    value: {
      log: noop,
      warn: noop,
      error: noop,
      info: noop,
      debug: noop,
      table: noop,
      clear: noop,
      dir: noop,
      dirxml: noop,
      trace: noop,
      group: noop,
      groupCollapsed: noop,
      groupEnd: noop,
      time: noop,
      timeEnd: noop,
      timeLog: noop,
      assert: noop,
      count: noop,
      countReset: noop,
    },
    writable: false,
    configurable: false,
  });
}

/** Tenta bloquear Print Screen */
function blockPrintScreen() {
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") {
      // Limpa clipboard
      navigator.clipboard.writeText("").catch(() => {});
    }
  });

  // Win+Shift+S (Snipping tool)
  document.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen") {
      e.preventDefault();
      return false;
    }
  });

  // Blur — quando perde foco pode ser screenshot
  window.addEventListener("blur", () => {
    // Overlay temporário para atrapalhar screenshot
    const overlay = document.createElement("div");
    overlay.id = "ss-guard";
    overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:99999;";
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 300);
  });
}
