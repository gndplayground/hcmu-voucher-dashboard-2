import { GuardRoute, SectionLoading } from "@components";
import { Dashboard } from "@pages/Home/Dashboard";
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

const CampaignEditLazy = React.lazy(() =>
  import("../pages/Campaigns").then((module) => ({
    default: module.CampaignsEdit,
  }))
);

const CampaignDetailLazy = React.lazy(() =>
  import("../pages/CampaignDetail").then((module) => ({
    default: module.CampaignDetail,
  }))
);

const CampanyProfileLazy = React.lazy(() =>
  import("../pages/CompanyProfile").then((module) => ({
    default: module.CompanyProfile,
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
        path: "/",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <Dashboard />}</GuardRoute>
          </SupportSuspense>
        ),
      },
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
        path: "campaigns/:id/detail",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <CampaignDetailLazy />}</GuardRoute>
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
      {
        path: "campaigns/:id",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <CampaignEditLazy />}</GuardRoute>
          </SupportSuspense>
        ),
      },
      {
        path: "company-profile",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <CampanyProfileLazy />}</GuardRoute>
          </SupportSuspense>
        ),
      },
    ],
  },
]);
