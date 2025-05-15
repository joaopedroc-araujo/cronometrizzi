TrelloPowerUp.initialize({
  "card-buttons": () => [
    {
      icon: "https://i.imgur.com/9ZZ8rf3.png",
      text: "Cronômetro",
      callback: (t) => t.popup({ title: "Controle", url: "popup.html" }),
    },
  ],
  "card-badges": (t) =>
    t.get("card", "shared", "isRunning").then((isRunning) =>
      isRunning
        ? [
            {
              title: "Tempo Decorrido",
              text: "Em andamento",
              color: "green",
              icon: "https://i.imgur.com/9ZZ8rf3.png",
            },
          ]
        : []
    ),
});
