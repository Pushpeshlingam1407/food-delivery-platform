import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "../../shared/themes/variables.css";
import "../../admin-app/src/admin.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
