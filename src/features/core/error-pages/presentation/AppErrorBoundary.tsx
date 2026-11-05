import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { reportError } from "@/common/business-logic/observability/errorReporter";
import { CrashFallback } from "@/features/core/error-pages/presentation/CrashFallback";
import { InternalError } from "@/features/core/error-pages/presentation/InternalError";

export type AppErrorFallbackProps = {
  error: Error;
  componentStack: string | null;
  retry: () => Promise<void>;
};

type AppErrorBoundaryProps = React.PropsWithChildren<{
  /**
   * When true, render the static CrashFallback (no theme/nav). Use at the
   * outermost root. Inner boundaries can omit this to use InternalError.
   */
  useCrashFallback?: boolean;
  fallback?: (props: AppErrorFallbackProps) => React.ReactNode;
}>;

type AppErrorBoundaryState = {
  error: Error | null;
  componentStack: string | null;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null, componentStack: null };

  static getDerivedStateFromError(
    error: Error,
  ): Partial<AppErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack ?? null });
    // A provider can crash before AppBoot hides the splash, which would leave
    // this fallback invisible behind it.
    try {
      void SplashScreen.hideAsync();
    } catch {
      // ignore
    }
    reportError(error, {
      feature: "AppErrorBoundary",
      componentStack: errorInfo.componentStack,
    });
  }

  retry = async () => {
    this.setState({ error: null, componentStack: null });
  };

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

    const fallbackProps: AppErrorFallbackProps = {
      error,
      componentStack,
      retry: this.retry,
    };

    if (this.props.fallback) {
      return this.props.fallback(fallbackProps);
    }

    if (this.props.useCrashFallback) {
      return <CrashFallback {...fallbackProps} />;
    }

    return <InternalError {...fallbackProps} />;
  }
}
