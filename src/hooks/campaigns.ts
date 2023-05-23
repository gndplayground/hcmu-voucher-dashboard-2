import { config } from "@configs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Campaign,
  CampaignCreateData,
  CampaignProgressEnum,
  CampaignUpdateData,
} from "@types";
import { APIResponse } from "@types";
import { axiosInstance } from "@utils/fetch";
import queryString from "query-string";
import { appendFormData } from "@utils/form";
import { useToast } from "./useToast";

export function useGetListCampaigns(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    filterByProgress?: CampaignProgressEnum;
    companyId?: number;
  } = {}
) {
  const { limit = 10, page = 1, companyId, filterByProgress, search } = options;
  return useQuery(
    ["campaigns", limit, page, companyId, filterByProgress, search],
    async () => {
      const query = queryString.stringify({
        limit,
        page,
        companyId,
        filterByProgress,
        search,
      });
      const result = await axiosInstance.get<
        APIResponse<Campaign[], { hasNextPage: boolean }>
      >(`${config.API_ENDPOINT}/campaigns?${query}`);
      return result.data;
    }
  );
}

export function useCreateCampaign() {
  const { toast } = useToast();
  return useMutation(
    async (data: CampaignCreateData) => {
      const result = await axiosInstance.post<APIResponse<Campaign>>(
        `${config.API_ENDPOINT}/campaigns`,
        data
      );
      return result.data.data;
    },
    {
      onSuccess() {
        toast({
          title: "Success",
          description: "Campaign created successfully",
          status: "success",
        });
      },
      onError(error) {
        toast({
          error,
        });
      },
    }
  );
}

export function useUpdateCampaign(
  options: { skipToastSuccess?: boolean } = {}
) {
  const { toast } = useToast();
  const { skipToastSuccess = false } = options;
  return useMutation(
    async (all: { id: number; data: CampaignUpdateData }) => {
      const { id, data } = all;
      const formData = new FormData();

      appendFormData(formData, data);

      const result = await axiosInstance.patch<APIResponse<Campaign>>(
        `${config.API_ENDPOINT}/campaigns/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return result.data.data;
    },
    {
      onSuccess() {
        if (!skipToastSuccess) {
          toast({
            title: "Success",
            description: "Campaign updated successfully",
            status: "success",
          });
        }
      },
      onError(error) {
        toast({
          error,
        });
      },
    }
  );
}
