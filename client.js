if (typeof window.TrelloPowerUp === "undefined") {
  throw new Error("Falha ao carregar a biblioteca do Trello Power-Up");
}

const t = window.TrelloPowerUp.iframe({
  appKey: "572ff9627c40e50897a1a5bbbf294289",
  appName: "Teste",
});

// Inicialização simplificada
t.initialize({
  "card-buttons": () => [
    {
      icon: "https://i.imgur.com/9ZZ8rf3.png",
      text: "Cronômetro",
      callback: (t) => t.popup({ title: "Controle", url: "index.html" }),
    },
  ],
  "card-badges": () =>
    t.get("card", "shared", "isRunning").then((isRunning) =>
      isRunning
        ? [
            {
              title: "Tempo Decorrido",
              text: formatTime(
                Date.now() -
                  (t.get("card", "shared", "startTime") || Date.now())
              ),
              color: "green",
              icon: "https://i.imgur.com/9ZZ8rf3.png",
            },
          ]
        : []
    ),
});
// Elementos e funções auxiliares
let timerInterval;

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

function updateBadge(t) {
  t.get("card", "shared", ["isRunning", "startTime"]).then(
    ({ isRunning, startTime }) => {
      if (isRunning) {
        const elapsed = Date.now() - startTime;
        t.set("card", "shared", { startTime: Date.now() - elapsed }); // Atualiza o tempo
        t.cardBadges();
      }
    }
  );
}

// Controles do temporizador
function startTimer(t) {
  const startTime = Date.now();
  t.set("card", "shared", { isRunning: true, startTime }).then(() => {
    timerInterval = setInterval(() => updateBadge(t), 1000);
    t.cardBadges();
  });
}

function stopTimer(t) {
  clearInterval(timerInterval);
  t.set("card", "shared", { isRunning: false }).then(() => t.cardBadges());
}

// Handler dos botões
t.render(function () {
  return t.get("card", "shared", "isRunning").then((isRunning) => {
    return [
      {
        icon: isRunning
          ? "https://i.imgur.com/8aRqDpa.png"
          : "https://i.imgur.com/9ZZ8rf3.png",
        text: isRunning ? "PARAR" : "INICIAR",
        callback: function (t) {
          isRunning ? stopTimer(t) : startTimer(t);
          return t.closePopup().then(() => t.cardBadges());
        },
      },
    ];
  });
});
