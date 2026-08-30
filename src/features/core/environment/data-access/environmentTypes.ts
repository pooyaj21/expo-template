import { AppConfig } from "@/common/data-access/config/AppConfig";

export type Environment = {
  id: number;
  title: string;
  baseUrl: string;
};

/**
 * The switchable targets. `Local` carries no URL — it reads one the developer
 * types into the debug screen, which is how you point a build at a laptop.
 */
export const environments: Environment[] = [
  { id: 1, title: "Development", baseUrl: AppConfig.devUrl },
  { id: 2, title: "Stage", baseUrl: AppConfig.stageUrl },
  { id: 3, title: "Production", baseUrl: AppConfig.prodUrl },
  { id: 4, title: "Local", baseUrl: "" },
];

export const LOCAL_ENVIRONMENT_ID = 4;

export const defaultEnvironment = (): Environment => {
  switch (AppConfig.environment) {
    case "development":
      return environments[0];
    case "stage":
      return environments[1];
    default:
      return environments[2];
  }
};
