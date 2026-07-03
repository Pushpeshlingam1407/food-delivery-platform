import React from 'react';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <Toaster position="bottom-right" richColors />
    </>
  );
};

export default App;
