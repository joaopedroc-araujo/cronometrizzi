import { useEffect, useState } from "react";
import { TRELLO_TOKEN } from "../../constants";

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
  const [t, setT] = useState(null);

  useEffect(() => {
    const trelloPowerUp = window.TrelloPowerUp.iframe({
      appKey: TRELLO_TOKEN,
      appName: "Cronometrizzi",
    });
    setT(trelloPowerUp);
  }, []);

  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const timerData = await t.get('card', 'private', 'timerData', {
          isRunning: false,
          startTime: 0,
          status: "parado"
        });

        const currentElapsed = timerData.isRunning
          ? Date.now() - timerData.startTime
          : timerData.startTime;

        setElapsed(currentElapsed);
        setIsRunning(timerData.isRunning);

        if (timerData.isRunning) {
          const interval = setInterval(() => {
            setElapsed(Date.now() - timerData.startTime);
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
    if (!isRunning) {
      const newStartTime = Date.now() - elapsed;

      try {
        await t.set('card', 'private', 'timerData', {
          isRunning: true,
          startTime: newStartTime,
          status: "rodando"
        });

        setIsRunning(true);
      }
      catch (error) {
        console.error("Erro ao iniciar:", error);
      }
    } else {
      try {
        await t.set('card', 'private', 'timerData', {
          isRunning: false,
          startTime: elapsed,
          status: "pausado"
        });

        setIsRunning(false);
      } catch (error) {
        console.error("Erro ao pausar:", error);
      }
    }

    t.closePopup();
  };

  const handleStop = async () => {
    if (elapsed === 0) return;

    try {
      await t.set('card', 'private', 'timerData', {
        isRunning: false,
        startTime: 0,
        status: "parado"
      });

      setElapsed(0);
      setIsRunning(false);
      t.closePopup();
    } catch (error) {
      console.error("Erro ao parar:", error);
    }
  };

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3>{formatTime(elapsed)}</h3>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={handleToggle}
          style={{
            background: isRunning ? "##f9a825" : "#43a047",
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
      </div>
    </div >
  );
};