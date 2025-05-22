import { useEffect, useState, useRef } from "react";

function formatTime(ms) {
  if (ms == null || isNaN(ms) || ms < 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


export const TRELLO_TOKEN = "572ff9627c40e50897a1a5bbbf294289";

export const TimerPopup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [t, setT] = useState(null);
  const [lastStartTime, setLastStartTime] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    const trelloInstance = window.TrelloPowerUp.iframe({
      appKey: TRELLO_TOKEN,
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

        setIsRunning(timerData.isRunning);
        setLastStartTime(timerData.lastStartTime);
        setElapsed(timerData.isRunning
          ? Date.now() - timerData.lastStartTime + timerData.elapsed
          : timerData.elapsed
        );
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    };

    if (t) loadTimerState();
  }, [t]);

  // Atualiza o cronômetro em tempo real
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prevElapsed =>
          lastStartTime ? Date.now() - lastStartTime + (prevElapsed - (Date.now() - lastStartTime)) : prevElapsed
        );
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, lastStartTime]);

  const handleStartPause = async () => {
    let timerData;
    if (!isRunning) {
      // Iniciar
      timerData = {
        isRunning: true,
        elapsed,
        lastStartTime: Date.now()
      };
      setIsRunning(true);
      setLastStartTime(timerData.lastStartTime);
    } else {
      // Pausar
      timerData = {
        isRunning: false,
        elapsed: elapsed + (Date.now() - lastStartTime),
        lastStartTime: 0
      };
      setIsRunning(false);
      setElapsed(timerData.elapsed);
      setLastStartTime(0);
    }

    await t.set('card', 'private', 'timerData', timerData);
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
        {!isRunning ? (
          <button
            onClick={handleStartPause}
            style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Iniciar
          </button>
        ) : (
          <button
            onClick={handleStartPause}
            style={{
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Pausar
          </button>
        )}

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
