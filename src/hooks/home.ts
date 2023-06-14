import { config } from "@configs";
import { useQuery } from "@tanstack/react-query";
import { APIResponse } from "@types";
import { DashboardStats } from "@types";
import { axiosInstance } from "@utils/fetch";

export function useGetStats(companyId?: number) {
  return useQuery(
    ["stats", companyId],
    async () => {
      return (
        await axiosInstance.get<APIResponse<DashboardStats>>(
          `${config.API_ENDPOINT}/dashboard/stats`
        )
      ).data.data;
    },
    {
      enabled: !!companyId,
    }
  );
}
