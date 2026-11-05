import { useContext } from "react";
import {
  EnvironmentContext,
  EnvironmentContextValue,
} from "@/features/core/environment/business-logic/environmentTypes";

/**
 * Runtime environment (API base URL) selection.
 * Must be used under `EnvironmentProvider`.
 */
export const useEnvironment = (): EnvironmentContextValue => {
  const context = useContext(EnvironmentContext);

  if (context === null) {
    throw new Error("useEnvironment must be used within EnvironmentProvider");
  }

  return context;
};
