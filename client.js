document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const button = document.getElementById("toggleButton");

  if (!statusEl || !button) {
    console.error("Elementos não encontrados");
    return;
  }

  const t = TrelloPowerUp.iframe();
  console.log("Contexto de t:", t.getContext()); // Verificar contexto
  const checkPermissions = () => {
    const { permissions } = t.getContext();
    if (permissions.card !== "write") {
      throw new Error("Permissões insuficientes para modificar este card");
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
      startUpdating();
    } else {
      statusEl.textContent = "Parado";
      button.textContent = "Iniciar";
    }
  });

  button.addEventListener("click", async () => {
    try {
      const currentData = await t.get("card", "shared", [
        "isRunning",
        "startTime",
      ]);
      console.log("Dados recuperados:", currentData);

      if (currentData?.isRunning) {
        await updateStorage({
          isRunning: false,
          lastUpdate: Date.now(),
        });
      } else {
        await updateStorage({
          isRunning: true,
          startTime: Date.now(),
          lastUpdate: Date.now(),
        });
      }

      updateTimeDisplay();
    } catch (error) {
      console.error("Falha na operação:", error);
      statusEl.textContent = `Erro: ${error.message}`;
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
