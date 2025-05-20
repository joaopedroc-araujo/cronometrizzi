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
  const [loading, setLoading] = useState(true);

  const t = window.TrelloPowerUp.iframe();
  console.log("TimerPopup renderizou", t);

  useEffect(() => {
    let interval;
    async function fetchData() {
      try {
        let attempts = 0;
        let data;

        while (attempts < 3 && !data) {
          data = await t.get("card", "shared", ["isRunning", "startTime"]);
          if (!data) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            attempts++;
          }
        }

        if (!data) {
          console.error("Falha após 3 tentativas. Inicializando manualmente.");
          data = { isRunning: false, startTime: 0 };
          await t.set("card", "shared", data);
        }
        const running = data?.isRunning || false;
        const start = data?.startTime || 0;

        setIsRunning(running);
        setLoading(false);

        if (running && start) {
          // Calcula o tempo decorrido imediatamente
          setElapsed(Date.now() - start);

          // Atualiza a cada segundo
          interval = setInterval(() => {
            setElapsed((prev) => prev + 1000);
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
    const newRunning = !isRunning;
    const newStartTime = newRunning ? Date.now() : 0;
    
    await t.set("card", "shared", {
      isRunning: newRunning,
      startTime: newStartTime
    });

    await t.render(() => {}); // Método válido para atualizar componentes

    setTimeout(() => t.closePopup(), 500);
    
  } catch (error) {
    console.error("Erro completo:", error);
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
