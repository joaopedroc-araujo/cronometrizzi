// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

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

window.TrelloPowerUp.initialize({
  "card-buttons": function (t, opts) {
    return [
      {
        icon: "https://i.imgur.com/9ZZ8rf3.png",
        text: "Cronômetro",
        callback: function (t) {
          return t.popup({
            title: "Controle do Cronômetro",
            url: "popup.html",
            height: 180,
          });
        },
      },
    ];
  },
  "card-badges": function (t, opts) {
    return t
      .get("card", "shared", ["isRunning", "startTime"], { force: true })
      .then((data) => {
        if (!data) {
          console.error("Dados completamente ausentes");
          return t
            .set("card", "shared", {
              isRunning: false,
              startTime: 0,
            })
            .then(() => ({ isRunning: false, startTime: 0 }));
        }

        // Log detalhado para debug
        console.log("Badge - Dados recebidos:", {
          isRunning: data.isRunning,
          startTime: data.startTime,
          currentTime: Date.now(),
        });

        if (data.isRunning && data.startTime) {
          const elapsed = Date.now() - data.startTime;
          return [
            {
              text: `⏱ ${formatTime(elapsed)}`,
              color: "green",
              refresh: 1, // Atualiza a cada 1 segundo quando rodando
            },
          ];
        }
        return [
          {
            text: "⏱ Parado",
            color: "red",
            refresh: 60, // Atualiza a cada 60 segundos quando parado
          },
        ];
      })
      .catch((error) => {
        console.error("Erro no badge:", error);
        return [
          {
            text: "⏱ Erro",
            color: "yellow",
          },
        ];
      });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode></React.StrictMode>
);
