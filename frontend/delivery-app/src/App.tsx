import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../../shared/utils/toast";
import { AppRoutes } from "./routes/AppRoutes";

import { AppContextProvider } from "../../shared/context/AppContext";

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastProvider />
      </BrowserRouter>
    </AppContextProvider>
  );
};

export default App;
