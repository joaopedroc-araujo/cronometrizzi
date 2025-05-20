document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const button = document.getElementById("toggleButton");

  if (!statusEl || !button) {
    console.error("Elementos não encontrados");
    return;
  }

  const t = TrelloPowerUp.iframe();
  console.log("Contexto de t:", t.getContext());

  const checkPermissions = async () => {
    const ctx = await t.getContext();
    if (ctx.permissions.card !== "write") {
      throw new Error("Permissões insuficientes");
    }
  };

  const updateStorage = async (data) => {
    try {
      checkPermissions();
      console.log("Salvando dados:", data);
      await t.set("card", "shared", data);
      console.log("Dados salvos com sucesso");
    } catch (error) {
      console.error("Erro no armazenamento:", error);
      throw error;
    }
  };

  if (!t.getContext().card) {
    console.error("Contexto de card não disponível");
    statusEl.textContent = "Erro: Contexto inválido";
    return;
  }

  const initializeStorage = async () => {
    try {
      const currentData = await t.get("card", "shared");
      if (!currentData || typeof currentData !== "object") {
        await t.set("card", "shared", {
          isRunning: false,
          startTime: 0,
          lastUpdate: Date.now(),
        });
        console.log("Storage inicializado com valores padrão");
      }
    } catch (error) {
      console.error("Falha na inicialização:", error);
    }
  };

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

  const setupRealTimeUpdates = () => {
    setInterval(() => {
      updateTimeDisplay();
    }, 1000);

    window.addEventListener("focus", updateTimeDisplay);
  };

  // Iniciar atualizações contínuas se o cronômetro estiver rodando
  const startUpdating = () => {
    if (!updateInterval) {
      updateInterval = setInterval(() => {
        t.get("card", "shared", ["isRunning", "startTime"])
          .then(updateTimeDisplay)
          .catch(console.error);
      }, 1000);
    }
  };

  // Parar atualizações
  function stopUpdating() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  // Carregar estado inicial
  t.get("card", "shared", ["isRunning", "startTime"])
    .then((data) => {
      const initialData = data || {
        isRunning: false,
        startTime: 0,
      };

      if (initialData.isRunning && initialData.startTime > 0) {
        startUpdating();
      }

      updateTimeDisplay();
    })
    .catch((error) => {
      console.error("Erro na inicialização:", error);
    });

  button.addEventListener("click", async () => {
    try {
      await checkPermissions();

      const currentData = (await t.get("card", "shared", [
        "isRunning",
        "startTime",
      ])) || {
        isRunning: false,
        startTime: 0,
      };

      const newState = !currentData.isRunning;

      await t.set("card", "shared", {
        isRunning: newState,
        startTime: newState ? Date.now() : 0,
        lastUpdate: Date.now(),
      });

      // Forçar atualização imediata
      updateTimeDisplay();
      t.closePopup().catch(() => {}); // Fechar popup sem erro se já estiver fechado
    } catch (error) {
      console.error("Erro crítico:", error);
      statusEl.textContent = `ERRO: ${error.message}`;
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

  setupRealTimeUpdates();
});
