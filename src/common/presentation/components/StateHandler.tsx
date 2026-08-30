import { ReactNode } from "react";
import { Loading } from "@/common/presentation/components/Loading";
import { ErrorView } from "@/common/presentation/components/ErrorView";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { SimpleCallback } from "@/common/data-access/type";

type StateHandlerProps<T> = {
  data: T | undefined;
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  retry?: SimpleCallback;
  children: (data: NonNullable<T>) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: unknown) => ReactNode;
  emptyComponent?: ReactNode;
};

/**
 * Loading / error / empty / content in one place. Screens that hand-roll these
 * four branches drift apart; wrapping remote data in this keeps them identical.
 */
export const StateHandler = <T,>({
  data,
  isLoading,
  error,
  isEmpty,
  retry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: StateHandlerProps<T>) => {
  const { getString } = useLocalization();

  if (isLoading) return <>{loadingComponent ?? <Loading />}</>;

  if (error) {
    return <>{errorComponent?.(error) ?? <ErrorView onRetry={retry} />}</>;
  }

  if (isEmpty || data == null) {
    return (
      <>
        {emptyComponent ?? (
          <ErrorView title={getString("shared_empty_title")} onRetry={retry} />
        )}
      </>
    );
  }

  return <>{children(data)}</>;
};
