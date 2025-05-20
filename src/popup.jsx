// src/popup.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { TimerPopup } from "./components/TimerPopup";

ReactDOM.createRoot(document.getElementById("popup-root")).render(
  <React.StrictMode>
    <TimerPopup />
  </React.StrictMode>
);
