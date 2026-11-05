import { createContext } from "react";
import {
  appConfig,
  Flavor,
} from "@/features/core/environment/business-logic/appConfig";

export enum EnvironmentIdEnums {
  DEVELOP = 1,
  STAGE = 2,
  PRODUCTION = 3,
}

export type Environment = {
  id: EnvironmentIdEnums;
  flavor: Flavor;
  baseUrl: string;
  title: string;
};

export type EnvironmentContextValue = {
  loaded: boolean;
  environments: Environment[];
  selectedEnvironment: Environment;
  selectEnvironment: (id: EnvironmentIdEnums) => Promise<void>;
  flavor: Flavor;
  apiBaseUrl: string;
  env: typeof appConfig;
};

export const EnvironmentContext = createContext<EnvironmentContextValue | null>(
  null,
);

export const ENVIRONMENT_STORAGE_KEY = "environment";
