import { SectionLoading } from "@components";
import React, { Suspense } from "react";
import { createHashRouter } from "react-router-dom";

const LoginLazy = React.lazy(() =>
  import("../pages/Login").then((module) => ({
    default: module.Login,
  }))
);

const HomeLazy = React.lazy(() =>
  import("../pages/Home").then((module) => ({
    default: module.Home,
  }))
);

const CampaignLazy = React.lazy(() =>
  import("../pages/Campaigns").then((module) => ({
    default: module.Campaigns,
  }))
);

export const router = createHashRouter([
  {
    path: "/login",
    element: <LoginLazy />,
  },
  {
    path: "/",
    element: <HomeLazy />,
    children: [
      {
        path: "campaigns",
        element: (
          <Suspense fallback={<SectionLoading />}>
            <CampaignLazy />
          </Suspense>
        ),
      },
    ],
  },
]);
