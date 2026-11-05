import React from "react";
import { EnvironmentContext } from "@/features/core/environment/business-logic/environmentTypes";
import { useEnvironmentController } from "@/features/core/environment/business-logic/useEnvironmentController";

type EnvironmentProviderProps = {
  children: React.ReactNode;
};

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  const value = useEnvironmentController();

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export { EnvironmentIdEnums } from "@/features/core/environment/business-logic/environmentTypes";
export type {
  Environment,
  EnvironmentContextValue,
} from "@/features/core/environment/business-logic/environmentTypes";
