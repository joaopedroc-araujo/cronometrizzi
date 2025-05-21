// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { getSupabaseClient } from "./supabaseClient";
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
    "card-badges": async (t, opts) => {
      try {
        const cardId = await t.card("id").get("id");

        const trelloToken = await t.getRestApi().getToken();
        console.log("Trello Token:", trelloToken);
        console.log("Card ID:", cardId);

        const supabase = getSupabaseClient(trelloToken, cardId);
        console.log("Supabase Client:", supabase);
        const supabaseRpc = await supabase.rpc("set_trello_context");
        console.log("Context set in Supabase", supabaseRpc);

        const { data, error } = await supabase
          .from("timers")
          .select("is_running, start_time")
          .eq("card_id", cardId)
          .maybeSingle();

        console.log("Data from Supabase:", data);

        if (error || !data) {
          return [
            {
              text: "⏱ Parado",
              color: "red",
              refresh: 60,
            },
          ];
        }

        if (data.is_running && data.start_time) {
          const elapsed = Date.now() - data.start_time;
          return [
            {
              text: `⏱ ${formatTime(elapsed)}`,
              color: "green",
              refresh: 1,
            },
          ];
        }

        return [
          {
            text: "⏱ Parado",
            color: "red",
            refresh: 60,
          },
        ];
      } catch (error) {
        console.error("Erro no badge:", error);
        return [
          {
            text: "⏱ Erro",
            color: "yellow",
            refresh: 60,
          },
        ];
      }
    },
  },
  {
    appKey: TRELLO_TOKEN,
    appName: "Teste",
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode></React.StrictMode>
);
