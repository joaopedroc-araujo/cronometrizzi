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
  const [needsAuth, setNeedsAuth] = useState(false);

  // 1. Inicialização do Trello
  useEffect(() => {
    const initializeTrello = async () => {
      try {
        const trelloInstance = window.TrelloPowerUp.iframe({
          appKey: TRELLO_TOKEN,
          appName: "Teste",
        });
        setT(trelloInstance);
      } catch (error) {
        console.error("Falha na inicialização do Trello:", error);
      }
    };

    initializeTrello();
  }, []);

  // 2. Verificar autorização
  useEffect(() => {
    if (!t) return;

    const checkAuthorization = async () => {
      try {
        const isAuthorized = await t.restApi.isAuthorized();
        if (!isAuthorized) {
          setNeedsAuth(true);
          return;
        }
        
        setNeedsAuth(false);
        t.closePopup();
        loadTimerData();
      } catch (error) {
        console.error("Erro na verificação de autorização:", error);
      }
    };

    checkAuthorization();
  }, [t]);

  // 3. Popup de autorização
  const handleAuth = async () => {
    try {
      await t.popup({
        title: "Autorização Necessária",
        url: "auth.html",
        height: 200,

      });
      const isAuthorized = await t.restApi.isAuthorized();
      if (isAuthorized) {
        setNeedsAuth(false);
        await loadTimerData();
      };
    } catch (error) {
      console.error("Erro na autorização:", error);
    }
  };

  // 4. Carregar dados do timer
  const loadTimerData = async () => {
    try {
      const token = await t.restApi.getToken();
      console.log("Token:", token);
      if (!token) throw new Error("Token não disponível");

      const cardId = await t.card("id").get("id");
      const supabase = getSupabaseClient(token, cardId);

      await supabase.rpc("set_trello_context");

      const { data, error } = await supabase
        .from("timers")
        .select("is_running, start_time")
        .eq("card_id", cardId)
        .maybeSingle();

      if (error) throw error;

      if (data?.is_running && data.start_time) {
        setElapsed(Date.now() - data.start_time);
        const interval = setInterval(() => {
          setElapsed((prev) => prev + 1000);
        }, 1000);
        return () => clearInterval(interval);
      }
      setIsRunning(data?.is_running || false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // 5. Controle do cronômetro
  const handleToggle = async () => {
    try {
      const token = await t.restApi.getToken();
      if (!token) throw new Error("Não autorizado");

      const cardId = await t.card("id").get("id");
      const supabase = getSupabaseClient(token, cardId);
      console.log('Supabase Client:', supabase);
       await supabase.rpc("set_trello_context");

      const newRunning = !isRunning;
      console.log("Novo estado do cronômetro:", newRunning);

      const { data, error } = await supabase.from("timers").upsert(
        {
          card_id: cardId,
          trello_token: token,
          is_running: newRunning,
          start_time: newRunning ? Date.now() : 0,
        },
        { onConflict: "card_id,trello_token", returning: 'minimal' },
      );

      if (error) throw ('erro aqui', error);
      console.log("Dados atualizados no Supabase:", data);

      setIsRunning(newRunning);

      t.render(() => t.sizeTo('#app'));
      t.closePopup();
    } catch (error) {
      console.error("Erro ao atualizar timer:", error);
    }
  };

  if (needsAuth) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p>Autorização necessária para usar o cronômetro</p>
        <button
          onClick={handleAuth}
          style={{
            background: "#1976d2",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Autorizar Agora
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>Carregando...</div>
    );
  }

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
