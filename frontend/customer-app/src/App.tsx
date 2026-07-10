import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AppRoutes } from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <SonnerToaster position="top-center" richColors />
      <HotToaster position="top-center" />
    </>
  );
};

export default App;
