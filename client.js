document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const button = document.getElementById("toggleButton");

  if (!statusEl || !button) {
    console.error("Elementos não encontrados");
    return;
  }

  const t = TrelloPowerUp.iframe();
  console.log("Contexto de t:", t.getContext()); // Verificar contexto

  let updateInterval;

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  // Função para atualizar o display do tempo
  function updateTimeDisplay() {
    t.get("card", "shared", ["isRunning", "startTime"]).then((data) => {
      const isRunning = data?.isRunning;
      const startTime = data?.startTime;

      if (isRunning && startTime) {
        const elapsed = Date.now() - startTime;
        statusEl.textContent = `Rodando: ${formatTime(elapsed)}`;
      } else {
        statusEl.textContent = "Parado";
      }
    });
  }

  // Iniciar atualizações contínuas se o cronômetro estiver rodando
  function startUpdating() {
    updateInterval = setInterval(() => {
      updateTimeDisplay();
    }, 1000);
  }

  // Parar atualizações
  function stopUpdating() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  // Carregar estado inicial
  t.get("card", "shared", ["isRunning", "startTime"]).then((data) => {
    console.log("Dados carregados:", data);
    const isRunning = data?.isRunning;
    const startTime = data?.startTime;

    if (isRunning && startTime) {
      const elapsed = Date.now() - startTime;
      statusEl.textContent = `Rodando: ${formatTime(elapsed)}`;
      button.textContent = "Parar";
      startUpdating(); // Iniciar atualizações
    } else {
      statusEl.textContent = "Parado";
      button.textContent = "Iniciar";
    }
  });

  button.addEventListener("click", async () => {
    console.log("Botão clicado");

    try {
      const data = await t.get("card", "shared", ["isRunning", "startTime"]);
      console.log("Dados atuais:", data);
      const isRunning = data?.isRunning;

      if (isRunning) {
        // Parar cronômetro
        console.log("Parando cronômetro");
        await t.set("card", "shared", {
          isRunning: false,
          lastUpdate: Date.now(), // Para forçar atualização do badge
        });
        statusEl.textContent = "Parado";
        button.textContent = "Iniciar";
        stopUpdating();
      } else {
        // Iniciar cronômetro
        console.log("Iniciando cronômetro");
        const now = Date.now();
        await t.set("card", "shared", {
          isRunning: true,
          startTime: now,
          lastUpdate: now,
        });
        statusEl.textContent = `Rodando: ${formatTime(0)}`;
        button.textContent = "Parar";
        startUpdating();
      }
    } catch (error) {
      console.error("Erro ao atualizar estado:", error);
      statusEl.textContent = "Erro: " + error.message;
    }
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "Fechar";
  closeButton.style.marginTop = "10px";
  closeButton.addEventListener("click", () => {
    t.closePopup();
  });
  document.body.appendChild(closeButton);

  // Limpeza ao sair
  window.addEventListener("unload", () => {
    stopUpdating();
  });
});
