import React from "react";
import { createBrowserRouter } from "react-router-dom";

const HomeLazy = React.lazy(() =>
  import("../pages/Home").then((module) => ({
    default: module.Home,
  }))
);

const LoginLazy = React.lazy(() =>
  import("../pages/Login").then((module) => ({
    default: module.Login,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginLazy />,
  },
  {
    path: "/",
    element: <HomeLazy />,
  },
]);
