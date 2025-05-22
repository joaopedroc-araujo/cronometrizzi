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
        console.log("Dados do cronômetro:", timerData);

        if (timerData.isRunning) {
          const currentElapsed = Date.now() - timerData.startTime;
          setElapsed(currentElapsed);
          const interval = setInterval(() => {
            setElapsed(prev => prev + 1000);
          }, 1000);

          return () => clearInterval(interval);
        }

        setIsRunning(timerData.isRunning);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    };

    loadTimerState();
  }, [t]);

  const handleToggle = async () => {
    const newRunning = !isRunning;
    const newStartTime = newRunning ? Date.now() : 0;

    try {
      // Salva estado no próprio card
      await t.set('card', 'private', 'timerData', {
        isRunning: newRunning,
        startTime: newStartTime
      });

      t.render(() => t.sizeTo('#app'));

      setIsRunning(true);
      t.closePopup();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      t.alert({
        message: "Erro ao atualizar o cronômetro!",
        duration: 5
      });
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