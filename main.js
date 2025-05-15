TrelloPowerUp.initialize({
  "card-buttons": () => [
    {
      icon: "https://i.imgur.com/9ZZ8rf3.png",
      text: "Cronômetro",
      callback: (t) => t.popup({ title: "Controle", url: "popup.html" }),
    },
  ],
  "card-badges": (t) =>
    t
      .get("card", "shared", ["isRunning", "startTime"])
      .then(({ isRunning, startTime }) => {
        if (!isRunning || !startTime) return [];

        const elapsed = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
          {
            title: "Tempo Decorrido",
            text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
              2,
              "0"
            )}:${String(seconds).padStart(2, "0")}`,
            color: "green",
            icon: "https://i.imgur.com/9ZZ8rf3.png",
          },
        ];
      }),
});
