const statusEl = document.getElementById("status");
const button = document.getElementById("toggleButton");

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

TrelloPowerUp.iframe()
  .get("card", "shared", ["isRunning", "startTime"])
  .then(({ isRunning, startTime }) => {
    if (isRunning) {
      const elapsed = Date.now() - startTime;
      statusEl.textContent = `Rodando: ${formatTime(elapsed)}`;
      button.textContent = "Parar";
    } else {
      statusEl.textContent = "Parado";
      button.textContent = "Iniciar";
    }
  });

button.addEventListener("click", () => {
  TrelloPowerUp.iframe()
    .get("card", "shared", "isRunning")
    .then((isRunning) => {
      if (isRunning) {
        TrelloPowerUp.iframe()
          .set("card", "shared", { isRunning: false })
          .then(() => {
            statusEl.textContent = "Parado";
            button.textContent = "Iniciar";
            TrelloPowerUp.iframe().closePopup();
          });
      } else {
        TrelloPowerUp.iframe()
          .set("card", "shared", {
            isRunning: true,
            startTime: Date.now(),
          })
          .then(() => {
            statusEl.textContent = "Rodando...";
            button.textContent = "Parar";
            TrelloPowerUp.iframe().closePopup();
          });
      }
    });
});
