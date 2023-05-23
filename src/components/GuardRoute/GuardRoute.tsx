import { useAuthStore } from "@stores";
import { User, UserProfile } from "@types";
import React from "react";
import { Navigate } from "react-router-dom";

export interface GuardRouteProps {
  children: (auth: {
    user: User;
    profile: UserProfile;
    companyId: number;
  }) => React.ReactNode;
}

export function GuardRoute(props: GuardRouteProps) {
  const { children } = props;
  const authStore = useAuthStore();
  return !authStore.user ||
    !authStore.profile ||
    !authStore.profile.companyId ? (
    <Navigate to="/login" />
  ) : (
    <>
      {children({
        profile: authStore.profile,
        user: authStore.user,
        companyId: authStore.profile.companyId,
      })}
    </>
  );
}
