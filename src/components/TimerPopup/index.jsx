import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../supabaseClient";

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

export const TRELLO_TOKEN = "572ff9627c40e50897a1a5bbbf294289";

export const TimerPopup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState(null);

  useEffect(() => {
    const initializeTrello = async () => {
      try {
        const trelloInstance = await window.TrelloPowerUp.iframe({
          appKey: "572ff9627c40e50897a1a5bbbf294289",
          appName: "Teste",
        }).ready();

        setT(trelloInstance);
      } catch (error) {
        console.error("Falha na inicialização do Trello:", error);
      }
    };

    initializeTrello();
  }, []);

  const getTrelloToken = async () => {
    if (!t) return null;

    try {
      // Método correto de acesso ao token
      const token = await t.restApi.getToken();
      if (!token) throw new Error("Token não disponível");
      return token;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      await t.alert({
        message: "Autorização necessária! Por favor, recarregue o card.",
        duration: 5,
      });
      return null;
    }
  };

  // Inicialização do Trello
  useEffect(() => {
    if (!t) return;
    let channel;
    let interval;

    const initializeTimer = async () => {
      try {
        // Obter token e card ID
        const token = await getTrelloToken();
        if (!token) return;

        console.log("T tá funfando?", t);
        console.log("Trello Token 1:", token);
        const cardId = await t.card("id").get("id");
        const supabase = getSupabaseClient(token, cardId);

        // Configurar contexto no Supabase
        await supabase.rpc("set_trello_context");

        // Buscar dados do timer
        const { data, error } = await supabase
          .from("timers")
          .select("is_running, start_time")
          .eq("card_id", cardId)
          .maybeSingle();

        if (error) throw error;

        // Configurar estado inicial
        if (data?.is_running && data.start_time) {
          setElapsed(Date.now() - data.start_time);
          interval = setInterval(() => {
            setElapsed((prev) => prev + 1000);
          }, 1000);
        }
        setIsRunning(data?.is_running || false);

        // WebSocket para atualizações
        channel = supabase
          .channel("timer-updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "timers",
              filter: `card_id=eq.${cardId}`,
            },
            (payload) => {
              setIsRunning(payload.new.is_running);
              setElapsed(Date.now() - payload.new.start_time);
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeTimer();

    return () => {
      channel?.unsubscribe();
      clearInterval(interval);
    };
  }, [t]);

  const handleToggle = async () => {
    if (!t) return;

    try {
      const token = await getTrelloToken();
      if (!token) return;
      console.log("Trello Token 2:", token);
      const cardId = await t.card("id").get("id");

      const supabase = getSupabaseClient(token, cardId);

      await supabase.rpc("set_trello_context");

      const newRunning = !isRunning;

      // Corrigir sintaxe do onConflict
      const { error } = await supabase.from("timers").upsert(
        {
          card_id: cardId,
          trello_token: token,
          is_running: newRunning,
          start_time: newRunning ? Date.now() : null,
        },
        {
          onConflict: "card_id,trello_token", // ← String única separada por vírgula
        }
      );

      if (error) throw error;

      setIsRunning(newRunning);
      t.closePopup();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3>{formatTime(elapsed)}</h3>
      <button
        onClick={handleToggle}
        style={{
          background: isRunning ? "#e53935" : "#43a047",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: 16,
          marginTop: 8,
        }}
      >
        {isRunning ? "Parar" : "Iniciar"}
      </button>
    </div>
  );
};
