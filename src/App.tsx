import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthWatcher } from "@hooks";
import { SectionLoading } from "@components";
import AppProvider from "./providers/AppProviders";
import { router } from "./routes";

function App() {
  const { isValidating } = useAuthWatcher();
  return (
    <AppProvider>
      <Suspense fallback={<SectionLoading />}>
        {!isValidating && <RouterProvider router={router} />}
      </Suspense>
    </AppProvider>
  );
}

export default App;
