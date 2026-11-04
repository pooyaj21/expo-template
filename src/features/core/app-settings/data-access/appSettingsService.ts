import { AxiosInstance } from "axios";
import { BaseResponseType } from "@/common/data-access/type";
import { AppSettingsInterface } from "@/features/core/app-settings/data-access/appSettingsTypes";

export const appSettingsService = {
  get: async (
    axios: AxiosInstance,
  ): Promise<BaseResponseType<AppSettingsInterface>> =>
    (await axios.get("/app/settings")).data,
};
