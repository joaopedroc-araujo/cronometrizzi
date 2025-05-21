import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const TimerPopup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Inicialização CORRETA do Trello Power-Up para popups
  const t = window.TrelloPowerUp.iframe(); // ← Método correto para popups

  useEffect(() => {
    let interval;

    const initializeAuthAndData = async () => {
      try {
        // Passo 1: Obter email do Trello (SEM t.ready())
        const member = await t.member('email');
        const email = member?.email;

        if (!email) throw new Error("Email não disponível");

        // Passo 2: Login automático no Supabase
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.href
          }
        });

        if (authError) throw authError;

        // Passo 3: Carregar dados do cronômetro
        const { data: timerData, error: fetchError } = await supabase
          .from('card_timers')
          .select('is_running, start_time')
          .eq('card_id', t.getContext().card.id)
          .single();

        if (fetchError) throw fetchError;

        // Passo 4: Atualizar estado
        setIsRunning(timerData?.is_running || false);

        if (timerData?.is_running && timerData?.start_time) {
          const initialElapsed = Date.now() - timerData.start_time;
          setElapsed(initialElapsed);
          
          interval = setInterval(() => {
            setElapsed(prev => prev + 1000);
          }, 1000);
        }

      } catch (error) {
        console.error("Erro:", error);
        setAuthError(error.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    initializeAuthAndData();

    return () => clearInterval(interval);
  }, []); // ← Remova a dependência [t] se necessário

  const handleToggle = async () => {
    try {
      const newRunning = !isRunning;
      const newStartTime = newRunning ? Date.now() : 0;

      // Salvar no Supabase
      const { error } = await supabase
        .from('card_timers')
        .upsert({
          card_id: t.getContext().card.id,
          is_running: newRunning,
          start_time: newStartTime
        });

      if (error) throw error;

      setIsRunning(newRunning);
      t.closePopup();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      setAuthError(error.message);
    }
  };

  if (authError) {
    return (
      <div style={{ padding: 16, color: "red", textAlign: "center" }}>
        {authError}
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: 8, padding: 8 }}
        >
          Recarregar
        </button>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 16, textAlign: "center" }}>Carregando...</div>;
  }

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
