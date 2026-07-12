import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "../../shared/themes/variables.css";
import "./admin-styles.css";
//import "../../shared/themes/premium-navbar.css";
import "./styles/orders.css";
// The delivery dashboard is rendered by this host app for delivery-partner logins.
// Keep its scoped layout rules last so the customer/admin styles cannot flatten it.
import "../../delivery-app/src/index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
