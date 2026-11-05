import React from "react";
import { Loading } from "@/common/presentation/components/Loading";
import { Error } from "@/common/presentation/components/Error";
import {
  IllustratedError,
  IllustratedErrorTypeEnums,
} from "@/common/presentation/components/IllustratedError";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { backendMessage } from "@/common/business-logic/utils/errorMessage";
import {
  HttpStatusEnums,
  httpStatus,
} from "@/common/business-logic/utils/httpStatus";

type StateHandlerProps<T> = {
  data: T | undefined;
  children: (data: NonNullable<T>) => React.ReactNode;
  error: Error | null | undefined;
  isLoading: boolean;
  isEmpty?: boolean;
  retry: () => void;
  errorComponent?: (error: Error | null | undefined) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
};

export const StateHandler = <T,>({
  data,
  children,
  error,
  isLoading,
  isEmpty,
  retry,
  errorComponent,
  loadingComponent,
  emptyComponent,
}: StateHandlerProps<T>) => {
  const { getString } = useLocalization();

  const renderError = (queryError: Error) => {
    const status = httpStatus(queryError);
    const message = backendMessage(queryError);
    if (status === HttpStatusEnums.NOT_FOUND) {
      return (
        <IllustratedError
          type={IllustratedErrorTypeEnums.NOT_FOUND}
          subtitle={message}
        />
      );
    }
    if (status != null && status >= HttpStatusEnums.INTERNAL_SERVER_ERROR) {
      return (
        <IllustratedError
          type={IllustratedErrorTypeEnums.SERVER_ERROR}
          subtitle={message}
          button={{ title: getString("common.retry"), onPress: retry }}
        />
      );
    }
    return (
      <Error title={message ?? getString("common.error")} onRetry={retry} />
    );
  };

  if (isLoading) return loadingComponent ?? <Loading />;
  if (error) return errorComponent?.(error) ?? renderError(error);
  if (isEmpty) {
    return emptyComponent ?? <Error title={getString("common.empty")} />;
  }
  if (data == null) return loadingComponent ?? <Loading />;
  return children(data);
};

export default StateHandler;
