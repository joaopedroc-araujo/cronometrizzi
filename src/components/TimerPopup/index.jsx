import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // Importe o cliente Supabase

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

export const TimerPopup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const t = window.TrelloPowerUp.iframe();

  useEffect(() => {
    let interval;
    async function fetchData() {
      try {
        // Obter usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        // Buscar dados do Supabase
        const { data, error } = await supabase
          .from('card_timers')
          .select('is_running, start_time')
          .eq('card_id', t.getContext().card.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const running = data?.is_running || false;
        const start = data?.start_time || 0;

        setIsRunning(running);
        setLoading(false);

        if (running && start) {
          setElapsed(Date.now() - start);
          interval = setInterval(() => {
            setElapsed(Date.now() - start);
          }, 1000);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    }

    fetchData();
    return () => clearInterval(interval);
  }, [t]);

  const handleToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Por favor, faça login primeiro!");
        return;
      }

      const newRunning = !isRunning;
      const newStartTime = newRunning ? Date.now() : 0;

      // Salvar no Supabase
      const { error } = await supabase
        .from('card_timers')
        .upsert({
          card_id: t.getContext().card.id,
          user_id: user.id,
          is_running: newRunning,
          start_time: newStartTime
        });

      if (error) throw error;

      setIsRunning(newRunning);
      t.closePopup();

    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3>{isRunning ? formatTime(elapsed) : "00:00:00"}</h3>
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
