import { useCallback, useEffect, useMemo, useState } from "react";
import { setApiBaseUrl } from "@/common/data-access/api/axios";
import { appStorage } from "@/common/business-logic/interfaces/storageInterface";
import { setQueryScope } from "@/common/business-logic/hooks/queryScopeRegistry";
import {
  apiDevUrl,
  apiProdUrl,
  apiStageUrl,
  appConfig,
  flavor,
} from "@/features/core/environment/business-logic/appConfig";
import { runBootStep } from "@/features/core/app-boot/business-logic/bootRetry";
import {
  ENVIRONMENT_STORAGE_KEY,
  Environment,
  EnvironmentContextValue,
  EnvironmentIdEnums,
} from "@/features/core/environment/business-logic/environmentTypes";

const environments: Environment[] = [
  {
    id: EnvironmentIdEnums.DEVELOP,
    flavor: "develop",
    baseUrl: apiDevUrl,
    title: "Develop",
  },
  {
    id: EnvironmentIdEnums.STAGE,
    flavor: "stage",
    baseUrl: apiStageUrl,
    title: "Stage",
  },
  {
    id: EnvironmentIdEnums.PRODUCTION,
    flavor: "production",
    baseUrl: apiProdUrl,
    title: "Production",
  },
];

const defaultSelectedEnvironment = (): Environment => {
  switch (flavor) {
    case "develop":
      return environments[0];
    case "stage":
      return environments[1];
    default:
      return environments[2];
  }
};

const getEnvironmentFromId = (id: number): Environment => {
  const found = environments.find((item) => item.id === id);
  return found ?? defaultSelectedEnvironment();
};

export const useEnvironmentController = (): EnvironmentContextValue => {
  const [loaded, setLoaded] = useState(false);
  const [envId, setEnvId] = useState(defaultSelectedEnvironment().id);

  const selectEnvironment = useCallback(async (id: EnvironmentIdEnums) => {
    const next = getEnvironmentFromId(id);
    setEnvId(next.id);
    setApiBaseUrl(next.baseUrl);
    setQueryScope({ environmentId: next.id });
    await appStorage.setItem(ENVIRONMENT_STORAGE_KEY, String(next.id));
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await appStorage.getItem(ENVIRONMENT_STORAGE_KEY);

      if (stored === null) {
        const initial = defaultSelectedEnvironment();
        setEnvId(initial.id);
        setApiBaseUrl(initial.baseUrl);
        setQueryScope({ environmentId: initial.id });
        return;
      }

      await selectEnvironment(
        Number.parseInt(stored, 10) as EnvironmentIdEnums,
      );
    };

    void runBootStep("environment", hydrate).finally(() => setLoaded(true));
  }, [selectEnvironment]);

  const selectedEnvironment = useMemo(
    () => getEnvironmentFromId(envId),
    [envId],
  );

  return useMemo<EnvironmentContextValue>(
    () => ({
      loaded,
      environments,
      selectedEnvironment,
      selectEnvironment,
      flavor,
      apiBaseUrl: selectedEnvironment.baseUrl,
      env: appConfig,
    }),
    [loaded, selectedEnvironment, selectEnvironment],
  );
};
