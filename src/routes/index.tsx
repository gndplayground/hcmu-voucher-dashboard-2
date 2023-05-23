import { GuardRoute, SectionLoading } from "@components";
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

const CampaignAddLazy = React.lazy(() =>
  import("../pages/Campaigns").then((module) => ({
    default: module.CampaignsAdd,
  }))
);

function SupportSuspense(props: { children: React.ReactNode }) {
  return <Suspense fallback={<SectionLoading />}>{props.children}</Suspense>;
}

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
          <SupportSuspense>
            <GuardRoute>
              {({ companyId }) => <CampaignLazy companyId={companyId} />}
            </GuardRoute>
          </SupportSuspense>
        ),
      },
      {
        path: "campaigns/add",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <CampaignAddLazy />}</GuardRoute>
          </SupportSuspense>
        ),
      },
    ],
  },
]);
