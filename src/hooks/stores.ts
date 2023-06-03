import { config } from "@configs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { APIResponse, Store, StoreCreate, StoreUpdate } from "@types";
import { axiosInstance } from "@utils/fetch";
import { useToast } from "./useToast";

export function useGetStores(options: {
  companyId?: number;
  enabled?: boolean;
}) {
  const { toast } = useToast();
  return useQuery(
    ["stores", options.companyId],
    async () => {
      const result = await axiosInstance.get<APIResponse<Store[]>>(
        `${config.API_ENDPOINT}/stores?${
          options.companyId ? `companyId=${options.companyId}` : ""
        }`
      );
      return result.data.data;
    },
    {
      enabled: options.enabled,
      onError(err) {
        toast({
          error: err,
        });
      },
    }
  );
}

export function useGetStoreDetail(id?: number) {
  const { toast } = useToast();
  return useQuery(
    ["storeDetail", id],
    async () => {
      const result = await axiosInstance.get<APIResponse<Store>>(
        `${config.API_ENDPOINT}/stores/${id}`
      );
      return result.data.data;
    },
    {
      enabled: !!id,
      onError(err) {
        toast({
          error: err,
        });
      },
    }
  );
}

export function useCreateStore() {
  const { toast } = useToast();
  return useMutation(
    async (data: StoreCreate) => {
      const result = await axiosInstance.post<APIResponse<Store>>(
        `${config.API_ENDPOINT}/stores`,
        data
      );
      return result.data.data;
    },

    {
      onSuccess() {
        toast({
          title: "Create store successfully",
          status: "success",
        });
      },
      onError(err) {
        toast({
          error: err,
        });
      },
    }
  );
}

export function useUpdateStore() {
  const { toast } = useToast();
  return useMutation(
    async (data: { data: StoreUpdate; id: number }) => {
      const result = await axiosInstance.patch<APIResponse<Store>>(
        `${config.API_ENDPOINT}/stores/${data.id}`,
        data.data
      );
      return result.data.data;
    },
    {
      onSuccess() {
        toast({
          title: "Update store successfully",
          status: "success",
        });
      },
      onError(err) {
        toast({
          error: err,
        });
      },
    }
  );
}
