import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "sonner";
import "./index.css";
import "./admin.css";
import "../../shared/themes/variables.css";
import "./AdminShell.css";

import { AppContextProvider } from "../../shared/context/AppContext";

function App() {
  return (
    <AppContextProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </AppContextProvider>
  );
}

export default App;
