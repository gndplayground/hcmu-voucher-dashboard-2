import { config } from "@configs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { APIResponse, Company, CompanyUpdate } from "@types";
import { axiosInstance } from "@utils/fetch";
import { appendFormData } from "@utils/form";
import { useToast } from "./useToast";

export function useGetCompanyDetail(id?: number) {
  const { toast } = useToast();
  return useQuery(
    ["companyDetail", id],
    async () => {
      const result = await axiosInstance.get<APIResponse<Company>>(
        `${config.API_ENDPOINT}/companies/${id}`
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

export function useUpdateCompany(
  options: {
    onSuccess?: () => void;
  } = {}
) {
  const { toast } = useToast();

  return useMutation(
    async (data: { id: number; data: CompanyUpdate }) => {
      const formData = new FormData();

      appendFormData(formData, data.data);
      const result = await axiosInstance.patch<APIResponse<Company>>(
        `${config.API_ENDPOINT}/companies/${data.id}`,
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
        options.onSuccess?.();
        toast({
          title: "Update company successfully",
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
