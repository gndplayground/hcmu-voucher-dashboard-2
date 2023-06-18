import { config } from "@configs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Campaign,
  CampaignCreateData,
  CampaignEditData,
  CampaignProgressEnum,
  CampaignUpdateData,
  VoucherQuestion,
} from "@types";
import { APIResponse } from "@types";
import { axiosInstance } from "@utils/fetch";
import queryString from "query-string";
import { appendFormData } from "@utils/form";
import { useToast } from "./useToast";

export function useGetCampaign(id: number | undefined) {
  return useQuery(
    ["campaign", id],
    async () => {
      const result = await axiosInstance.get<APIResponse<Campaign>>(
        `${config.API_ENDPOINT}/campaigns/${id}`
      );
      return result.data.data;
    },
    {
      enabled: !!id,
    }
  );
}

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

export function useUpdateFullCampaign(
  options: { skipToastSuccess?: boolean } = {}
) {
  const { toast } = useToast();
  const { skipToastSuccess = false } = options;
  return useMutation(
    async (all: { id: number; data: CampaignEditData }) => {
      const { id, data } = all;

      await axiosInstance.patch(
        `${config.API_ENDPOINT}/campaigns/${id}/full`,
        data
      );
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

export function useGetCampaignStats(data: {
  id: number | undefined;
  start?: string;
}) {
  const { id, start } = data;
  return useQuery(
    ["campaign-stats", id, start],
    async () => {
      const query = queryString.stringify({
        start,
      });
      const result = await axiosInstance.get<
        APIResponse<{
          claimedByWeek: Record<string, number>;
          claimed: number;
          unclaimed: number;
        }>
      >(`${config.API_ENDPOINT}/campaigns/${id}/stats?${query}`);
      return result.data.data;
    },
    {
      enabled: !!id && !!start,
    }
  );
}

export function useGetDiscountStats(data: {
  campaignId: number | undefined;
  id: number | undefined;
  start?: string;
}) {
  const { id, start, campaignId } = data;
  return useQuery(
    ["discount-stats", id, campaignId, start],
    async () => {
      const query = queryString.stringify({
        start,
      });
      const result = await axiosInstance.get<
        APIResponse<{
          claimedByWeek: Record<string, number>;
          claimed: number;
          unclaimed: number;
          questions: VoucherQuestion[];
        }>
      >(
        `${config.API_ENDPOINT}/campaigns/${campaignId}/discount/${id}/stats?${query}`
      );
      return result.data.data;
    },
    {
      enabled: !!id && !!start && !!campaignId,
    }
  );
}

export function useGetDiscountQuestionsStats(data: {
  campaignId: number | undefined;
  id: number | undefined;
  start?: string;
}) {
  const { id, campaignId } = data;
  return useQuery(
    ["discount-questions-stats", id, campaignId],
    async () => {
      const result = await axiosInstance.get<
        APIResponse<{
          questions: VoucherQuestion[];
        }>
      >(
        `${config.API_ENDPOINT}/campaigns/${campaignId}/discount/${id}/stats-questions`
      );
      return result.data.data;
    },
    {
      enabled: !!id && !!campaignId,
    }
  );
}
