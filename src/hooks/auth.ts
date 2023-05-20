import { config } from "@configs";
import { useAuthStore } from "@stores/auth";
import { useMutation } from "@tanstack/react-query";
import { User } from "@types";
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
        data: { token: string; user: User };
      }>(`${config.API_ENDPOINT}/auth/login`, {
        email,
        password,
      });

      authStore.set((state) => {
        state.user = data.data.user;
      });
      localStorage.setItem("app-user", JSON.stringify(data.data.user));
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

    if (user) {
      router.navigate("/");
    } else {
      router.navigate("/login");
    }
  }, [isValidating, user]);

  React.useEffect(() => {
    const user = localStorage.getItem("app-user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setAuthStore((state) => {
          state.user = parsedUser;
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Failed parse user from localStorage");
      } finally {
        setAuthStore((state) => {
          state.isValidating = false;
        });
      }
    }
  }, [setAuthStore]);

  return {
    isValidating,
  };
}
