import { config } from "@configs";
import { useAuthStore } from "@stores/auth";
import { useMutation } from "@tanstack/react-query";
import { User, UserProfile } from "@types";
import { axiosInstance } from "@utils/fetch";
import { AxiosError } from "axios";
import React from "react";
import { router } from "../routes";
import { useToast } from "./useToast";

export function useAuthLogin() {
  const authStore = useAuthStore();
  const { toast } = useToast();
  return useMutation(
    async (body: { email: string; password: string }) => {
      const { email, password } = body;
      const { data } = await axiosInstance.post<{
        data: { token: string; user: User; profile?: UserProfile };
      }>(`${config.API_ENDPOINT}/auth/login`, {
        email,
        password,
      });

      if (!data.data.profile || !data.data.profile.companyId) {
        throw new Error("User does not have a company");
      }

      authStore.set((state) => {
        state.user = data.data.user;
        state.profile = data.data.profile;
      });
      localStorage.setItem("app-user", JSON.stringify(data.data.user));
      localStorage.setItem(
        "app-user-profile",
        JSON.stringify(data.data.profile)
      );
    },
    {
      onError(error) {
        if ((error as any).isAxiosError) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            toast({
              error: "Email or password is incorrect",
            });
            return;
          }
        }
        toast({
          error,
        });
      },
    }
  );
}

export function useAuthSignOut() {
  const authStore = useAuthStore();
  const { toast } = useToast();
  return useMutation(
    async () => {
      await axiosInstance.post<{
        data: { token: string; user: User };
      }>(`${config.API_ENDPOINT}/auth/logout`);

      authStore.set((state) => {
        state.user = undefined;
        state.profile = undefined;
      });
      localStorage.removeItem("app-user");
      localStorage.removeItem("app-user-profile");
    },
    {
      onError(error) {
        toast({
          error,
        });
      },
    }
  );
}

export function useAuthWatcher() {
  const { user, isValidating } = useAuthStore((state) => {
    return {
      user: state.user,
      isValidating: state.isValidating,
    };
  });
  const setAuthStore = useAuthStore((state) => state.set);

  React.useEffect(() => {
    if (isValidating) return;

    if (!user) {
      router.navigate("/login", {
        state: {
          prev: router.state.location.pathname + router.state.location.search,
        },
      });
    }
  }, [isValidating, user]);

  React.useEffect(() => {
    const user = localStorage.getItem("app-user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const parsedProfile = JSON.parse(
          localStorage.getItem("app-user-profile") || ""
        );
        if (!parsedProfile.companyId) {
          throw new Error("User does not have a company");
        }
        setAuthStore((state) => {
          state.user = parsedUser;
          state.profile = parsedProfile;
        });
        router.navigate("/");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Failed parse user from localStorage");
      } finally {
        setAuthStore((state) => {
          state.isValidating = false;
        });
      }
    } else {
      setAuthStore((state) => {
        state.isValidating = false;
      });
    }
  }, [setAuthStore]);

  return {
    isValidating,
  };
}
