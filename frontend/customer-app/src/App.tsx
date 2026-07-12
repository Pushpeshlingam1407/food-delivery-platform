import React from "react";
import { ToastProvider } from "../../shared/utils/toast";
import { AppRoutes } from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <ToastProvider />
    </>
  );
};

export default App;
