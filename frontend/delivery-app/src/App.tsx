import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../../shared/utils/toast";
import { AppRoutes } from "./routes/AppRoutes";

import { AppContextProvider } from "../../shared/context/AppContext";
import { DeliveryProvider } from "./contexts/DeliveryContext";

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <DeliveryProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastProvider />
        </BrowserRouter>
      </DeliveryProvider>
    </AppContextProvider>
  );
};

export default App;
