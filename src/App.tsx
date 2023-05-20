import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";

import AppProvider from "./providers/AppProviders";

const LoginLazy = React.lazy(() =>
  import("./pages/Login").then((module) => ({
    default: module.Login,
  }))
);

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginLazy />,
  },
]);

function App() {
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
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  );
}

export default App;
