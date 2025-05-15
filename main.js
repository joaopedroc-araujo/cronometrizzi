TrelloPowerUp.initialize({
  "card-buttons": (t) => [
    {
      icon: "https://i.imgur.com/9ZZ8rf3.png",
      text: "Cronômetro",
      callback: (t) =>
        t.popup({
          title: "Controle",
          url: t.signUrl("popup.html"), // Assinar a URL é importante
        }),
    },
  ],
  "card-badges": (t) =>
    t
      .get("card", "shared", ["isRunning", "startTime", "lastUpdate"])
      .then((data) => {
        const isRunning = data?.isRunning;
        const startTime = data?.startTime;

        if (isRunning && startTime) {
          const elapsed = Date.now() - startTime;
          const totalSeconds = Math.floor(elapsed / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          const formatted = `${String(hours).padStart(2, "0")}:${String(
            minutes
          ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

          return [
            {
              text: `⏱ ${formatted}`,
              color: "green",
              refresh: 10, // Atualizar o badge a cada 10 segundos
            },
          ];
        }

        return [
          {
            text: "⏱ Parado",
            color: "red",
          },
        ];
      }),
});
