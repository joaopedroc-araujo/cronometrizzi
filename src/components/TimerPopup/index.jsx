import { useEffect, useState } from "react";

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
  const [lastStartTime, setLastStartTime] = useState(0);

  useEffect(() => {
    const trelloInstance = window.TrelloPowerUp.iframe({
      appKey: "572ff9627c40e50897a1a5bbbf294289",
      appName: "Teste",
    });
    setT(trelloInstance);
  }, []);

  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const timerData = await t.get('card', 'private', 'timerData', {
          isRunning: false,
          elapsed: 0,
          lastStartTime: 0
        });

        if (timerData.isRunning) {
          const currentElapsed = Date.now() - timerData.lastStartTime + timerData.elapsed;
          setElapsed(currentElapsed);
          startTimerInterval(currentElapsed);
        } else {
          setElapsed(timerData.elapsed);
        }
        setIsRunning(timerData.isRunning);
        setLastStartTime(timerData.lastStartTime);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    };

    if (t) loadTimerState();
  }, [t]);

  const startTimerInterval = (initialElapsed = 0) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsed(initialElapsed + (Date.now() - startTime));
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleStartPause = async () => {
    const newIsRunning = !isRunning;
    let newElapsed = elapsed;
    let newLastStartTime = lastStartTime;

    if (newIsRunning) {
      newLastStartTime = Date.now();
    } else {
      newElapsed += Date.now() - lastStartTime;
    }

    await t.set('card', 'private', 'timerData', {
      isRunning: newIsRunning,
      elapsed: newElapsed,
      lastStartTime: newIsRunning ? newLastStartTime : 0
    });

    setIsRunning(newIsRunning);
    setLastStartTime(newLastStartTime);
    t.render(() => t.sizeTo('#app'));
  };

  const handleStop = async () => {
    await t.set('card', 'private', 'timerData', {
      isRunning: false,
      elapsed: 0,
      lastStartTime: 0
    });

    setIsRunning(false);
    setElapsed(0);
    setLastStartTime(0);
    t.render(() => t.sizeTo('#app'));
  };

  const handleRestart = async () => {
    const newLastStartTime = Date.now();
    await t.set('card', 'private', 'timerData', {
      isRunning: true,
      elapsed: 0,
      lastStartTime: newLastStartTime
    });

    setIsRunning(true);
    setElapsed(0);
    setLastStartTime(newLastStartTime);
    t.render(() => t.sizeTo('#app'));
  };

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h3>{formatTime(elapsed)}</h3>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={handleStartPause}
          style={{
            background: isRunning ? "#e53935" : "#43a047",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {isRunning ? "Pausar" : "Iniciar"}
        </button>

        {isRunning && (
          <button
            onClick={handleRestart}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Reiniciar
          </button>
        )}

        <button
          onClick={handleStop}
          style={{
            background: "#616161",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Parar
        </button>
      </div>
    </div>
  );
};
