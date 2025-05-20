// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

// Função para formatar o tempo
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Inicialização do Power-Up
window.TrelloPowerUp.initialize({
  "card-buttons": function (t, opts) {
    return [
      {
        icon: "https://i.imgur.com/9ZZ8rf3.png",
        text: "Cronômetro",
        callback: function (t) {
          return t.popup({
            title: "Controle do Cronômetro",
            url: "popup.html", // Caminho correto!
            height: 180
          });
        }
      }
    ];
  },
  "card-badges": function (t, opts) {
    return t.get("card", "shared", ["isRunning", "startTime"]).then((data) => {
      if (data?.isRunning && data?.startTime) {
        const elapsed = Date.now() - data.startTime;
        return [
          {
            text: `⏱ ${formatTime(elapsed)}`,
            color: "green",
            refresh: 10
          }
        ];
      }
      return [
        {
          text: "⏱ Parado",
          color: "red"
        }
      ];
    });
  }
});

// Se quiser renderizar algo com React na tela principal, faça aqui:
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  </React.StrictMode>
);
