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

  const t = window.TrelloPowerUp.iframe();

  useEffect(() => {
    let interval;
    
    const initializeAuthAndData = async () => {
      try {
        // 1. Esperar Trello estar pronto
        await t.ready();

        // 2. Obter email do Trello com tratamento de erro
        const member = await t.member('email').catch(error => {
          throw new Error(`Erro ao obter email: ${error.message}`);
        });
        
        if (!member?.email) throw new Error("Email do usuário não disponível");

        // 3. Login automático no Supabase
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: member.email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.href
          }
        });

        if (authError) throw new Error(`Erro de autenticação: ${authError.message}`);

        // 4. Obter dados do cronômetro com tratamento de erro
        const { data: timerData, error: fetchError } = await supabase
          .from('card_timers')
          .select('is_running, start_time')
          .eq('card_id', t.getContext().card.id)
          .single();

        if (fetchError) throw new Error(`Erro ao buscar dados: ${fetchError.message}`);

        // 5. Atualizar estado do cronômetro
        const running = timerData?.is_running || false;
        const start = timerData?.start_time || 0;
        
        setIsRunning(running);
        
        if (running && start) {
          const initialElapsed = Date.now() - start;
          setElapsed(initialElapsed);
          
          interval = setInterval(() => {
            setElapsed(prev => prev + 1000);
          }, 1000);
        }

      } catch (error) {
        console.error("Erro crítico:", error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuthAndData();

    return () => clearInterval(interval);
  }, [t]);

  const handleToggle = async () => {
    try {
      // 1. Verificar autenticação
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Usuário não autenticado");

      // 2. Atualizar estado
      const newRunning = !isRunning;
      const newStartTime = newRunning ? Date.now() : 0;

      // 3. Persistir no Supabase
      const { error: upsertError } = await supabase
        .from('card_timers')
        .upsert({
          card_id: t.getContext().card.id,
          user_id: user.id,
          is_running: newRunning,
          start_time: newStartTime
        });

      if (upsertError) throw new Error(`Erro ao salvar: ${upsertError.message}`);

      // 4. Atualizar UI
      setIsRunning(newRunning);
      setElapsed(0);
      t.closePopup();

    } catch (error) {
      console.error("Erro na ação:", error);
      setAuthError(error.message);
    }
  };

  if (authError) {
    return (
      <div style={{ 
        padding: 16, 
        color: "red", 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <p>{authError}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: "8px 16px",
            background: "#0079bf",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
      }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 16, 
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }}>
      <h3 style={{ margin: 0 }}>
        {isRunning ? formatTime(elapsed) : "00:00:00"}
      </h3>
      
      <button
        onClick={handleToggle}
        style={{
          background: isRunning ? "#e53935" : "#43a047",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "background 0.3s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {isRunning ? "⏹ Parar" : "▶ Iniciar"}
      </button>
    </div>
  );
};
