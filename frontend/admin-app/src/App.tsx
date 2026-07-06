import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "sonner";
import "./index.css";
import "../../shared/themes/variables.css";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
