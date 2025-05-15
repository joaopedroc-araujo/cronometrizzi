const t = window.TrelloPowerUp.iframe();

// Elementos do DOM
const timerDisplay = document.createElement("div");
let timerInterval;
let startTime;

// Formatação do tempo
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

// Atualiza o badge
function updateBadge() {
  t.card("id", "name", "badges").then((card) => {
    const elapsed = Date.now() - startTime;
    t.card("id", "name", "badges").set("badges", [
      {
        title: "Tempo Decorrido",
        text: formatTime(elapsed),
        color: "green",
        icon: "https://i.imgur.com/9ZZ8rf3.png",
      },
    ]);
  });
}

// Inicia o temporizador
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateBadge, 1000);
  t.set("card", "shared", { isRunning: true, startTime });
}

// Para o temporizador
function stopTimer() {
  clearInterval(timerInterval);
  t.set("card", "shared", { isRunning: false });
}

// Botões na interface
t.render(function () {
  return t.card("all").then((card) => {
    const isRunning = card.shared.isRunning || false;

    // Botão Start/Stop
    t.cardButtons([
      {
        icon: isRunning
          ? "https://i.imgur.com/8aRqDpa.png"
          : "https://i.imgur.com/9ZZ8rf3.png",
        text: isRunning ? "PARAR" : "INICIAR",
        callback: (context) => {
          isRunning ? stopTimer() : startTimer();
          return t.closePopup();
        },
      },
    ]);

    // Badge de status
    if (isRunning) {
      startTime = card.shared.startTime;
      startTimer();
    }
  });
});
