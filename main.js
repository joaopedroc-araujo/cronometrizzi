TrelloPowerUp.initialize({
  "card-buttons": () => [
    {
      icon: "https://i.imgur.com/9ZZ8rf3.png",
      text: "Cronômetro",
      callback: (t) => t.popup({ title: "Controle", url: "popup.html" }),
    },
  ],
  "card-badges": (t) =>
    t.get("card", "shared", ["isRunning", "startTime"]).then((data) => {
      const isRunning = data?.isRunning || false;
      const startTime = data?.startTime || null;

      if (isRunning && startTime) {
        const elapsed = Date.now() - startTime;
        statusEl.textContent = `Rodando: ${formatTime(elapsed)}`;
        button.textContent = "Parar";
      } else {
        statusEl.textContent = "Parado";
        button.textContent = "Iniciar";
      }
    }),
});
