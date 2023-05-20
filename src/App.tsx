import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import { useAuthWatcher } from "@hooks";
import AppProvider from "./providers/AppProviders";
import { router } from "./routes";

function App() {
  const { isValidating } = useAuthWatcher();
  return (
    <AppProvider>
      <Suspense
        fallback={
          <Box
            minH="150px"
            maxW="lg"
            mx="auto"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner />
          </Box>
        }
      >
        {!isValidating && <RouterProvider router={router} />}
      </Suspense>
    </AppProvider>
  );
}

export default App;
