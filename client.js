document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const button = document.getElementById("toggleButton");

  if (!statusEl || !button) {
    console.error("Elementos não encontrados");
    return;
  }

  const t = TrelloPowerUp.iframe();

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

  t.get("card", "shared", ["isRunning", "startTime"]).then((data) => {
    console.log("Dados carregados:", data);
    const isRunning = data?.isRunning;
    const startTime = data?.startTime;

    if (isRunning && startTime) {
      const elapsed = Date.now() - startTime;
      statusEl.textContent = `Rodando: ${formatTime(elapsed)}`;
      button.textContent = "Parar";
    } else {
      statusEl.textContent = "Parado";
      button.textContent = "Iniciar";
    }
  });

  button.addEventListener("click", async () => {
    const isRunning = await t.get("card", "shared", "isRunning");

    if (isRunning) {
      await t.set("card", "shared", { isRunning: false });
      statusEl.textContent = "Parado";
      button.textContent = "Iniciar";
    } else {
      await t.set("card", "shared", {
        isRunning: true,
        startTime: Date.now(),
      });
      statusEl.textContent = "Rodando...";
      button.textContent = "Parar";
    }

    setTimeout(() => t.closePopup(), 100);
  });
});
