import { useEffect, useState } from "react";

function formatTime(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const clampedSeconds = Math.min(totalSeconds, 99 * 3600 + 59 * 60 + 59);

  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
export const TRELLO_TOKEN = "572ff9627c40e50897a1a5bbbf294289";

export const TimerPopup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [t, setT] = useState(null);

  useEffect(() => {
    const trelloPowerUp = window.TrelloPowerUp.iframe({
      appKey: TRELLO_TOKEN,
      appName: "Teste",
    });
    setT(trelloPowerUp);
  }, []);

  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const timerData = await t.get('card', 'private', 'timerData', {
          isRunning: false,
          startTime: 0
        });

        // [CORREÇÃO] Cálculo universal do elapsed
        const currentElapsed = timerData.isRunning
          ? Date.now() - timerData.startTime
          : timerData.startTime;

        setElapsed(currentElapsed);
        setIsRunning(timerData.isRunning);

        // [CORREÇÃO] Intervalo dinâmico
        if (timerData.isRunning) {
          const interval = setInterval(() => {
            setElapsed(prev => prev + 1000); // Atualiza incrementalmente
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    };

    t && loadTimerState();
  }, [t]);


  const handleToggle = async () => {
    const newRunning = !isRunning;

    try {
      if (newRunning) {
        // [CORREÇÃO] Iniciar/Continuar
        const newStartTime = Date.now() - elapsed;
        await t.set('card', 'private', 'timerData', {
          isRunning: true,
          startTime: newStartTime
        });
      } else {
        // [CORREÇÃO] Pausar (salva o tempo atual)
        await t.set('card', 'private', 'timerData', {
          isRunning: false,
          startTime: elapsed // Salva o tempo decorrido, não um timestamp
        });
      }

      setIsRunning(newRunning);
      t.closePopup();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleStop = async () => {
    try {
      await t.set('card', 'private', 'timerData', {
        isRunning: false,
        startTime: 0
      });

      setElapsed(0);
      setIsRunning(false);
      t.closePopup();
    } catch (error) {
      console.error("Erro ao parar:", error);
    }
  };

  console.log(elapsed);

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3>{formatTime(elapsed)}</h3>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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
          {isRunning ? "Pausar" : "Iniciar"}
        </button>

        {isRunning &&
          <button
            onClick={handleStop}
            style={{
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 16,
              marginTop: 8,
            }}
          >
            Parar
          </button>
        }
      </div>
    </div >
  );
};