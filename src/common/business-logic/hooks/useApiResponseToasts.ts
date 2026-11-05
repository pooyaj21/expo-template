import { useEffect } from "react";
import { apiResponseChannel } from "@/common/data-access/api/apiResponseChannel";
import { MetaTypeEnums } from "@/common/data-access/type/responseTypes";
import { useLatestRef } from "@/common/business-logic/hooks/useLatestRef";

export type ApiResponseToast = {
  message: string;
  type: MetaTypeEnums;
};

/**
 * Bridges `apiResponseChannel` into presentation. Presentation passes a
 * toast presenter; this hook owns the data-access subscription.
 */
export const useApiResponseToasts = (
  onToast: (toast: ApiResponseToast) => void,
) => {
  const onToastRef = useLatestRef(onToast);

  useEffect(() => {
    return apiResponseChannel.subscribe((payload) => {
      if (!payload.message) return;
      onToastRef.current({
        message: payload.message,
        type: payload.type ?? MetaTypeEnums.SUCCESS,
      });
    });
  }, [onToastRef]);
};
