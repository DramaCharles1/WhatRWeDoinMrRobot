import React from "react";
import { createRoot } from "react-dom/client";
import { CalendarPage } from "./pages/CalendarPage";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <CalendarPage />
    </React.StrictMode>
  );
}
