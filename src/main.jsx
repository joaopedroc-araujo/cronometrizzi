// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { TRELLO_TOKEN } from "./components/TimerPopup";

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

window.TrelloPowerUp.initialize(
  {
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
    "card-badges": async (t) => {
      try {
        const timerData = await t.get('card', 'private', 'timerData', {
          isRunning: false,
          startTime: 0
        });

        if (timerData.isRunning) {
          const elapsed = Date.now() - timerData.startTime;
          return [{
            text: `⏱ ${formatTime(elapsed)}`,
            color: "green",
            refresh: 1
          }];
        }

        return [{
          text: "⏱ Parado",
          color: "red",
          refresh: 60
        }];
      } catch (error) {
        console.error("Erro ao carregar:", error);
        return [{
          text: "⏱ Erro",
          color: "yellow",
          refresh: 60
        }];
      }
    }
  },
  {
    appKey: TRELLO_TOKEN,
    appName: "Teste",
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode></React.StrictMode>
);
