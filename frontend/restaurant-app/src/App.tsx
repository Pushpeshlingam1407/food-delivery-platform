import React from "react";
import { ToastProvider } from "../../shared/utils/toast";
import { AppRoutes } from "./routes/AppRoutes";

import { AppContextProvider } from "../../shared/context/AppContext";

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <AppRoutes />
      <ToastProvider />
    </AppContextProvider>
  );
};

export default App;
