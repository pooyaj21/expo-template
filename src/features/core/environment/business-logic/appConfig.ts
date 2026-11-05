import Constants from "expo-constants";
import { Platform } from "react-native";

export type Flavor = "develop" | "stage" | "production";

export const FLAVORS: readonly Flavor[] = [
  "develop",
  "stage",
  "production",
] as const;

const FLAVOR_VALUES: readonly string[] = FLAVORS;

const resolveFlavor = (): Flavor => {
  const candidates = [
    process.env.EXPO_PUBLIC_FLAVOR,
    Constants.expoConfig?.extra?.flavor,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && FLAVOR_VALUES.includes(candidate)) {
      return candidate as Flavor;
    }
  }

  return "production";
};

export const flavor = resolveFlavor();

/** Debug menu + soft env warnings are on for develop and stage. */
export const isDevelop = flavor === "develop" || flavor === "stage";

export const isLocalDevelopment = __DEV__;

export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

const missingKeys: string[] = [];

/**
 * Every EXPO_PUBLIC_* read MUST name process.env.EXPO_PUBLIC_X literally.
 * babel-preset-expo only rewrites that exact static form into the bundled env
 * module; a computed process.env[name] is left alone and reads undefined.
 */
const required = (name: string, value: string | undefined): string => {
  if (!value) missingKeys.push(name);
  return value ?? "";
};

export const apiDevUrl = required(
  "EXPO_PUBLIC_API_DEV_URL",
  process.env.EXPO_PUBLIC_API_DEV_URL,
);
export const apiStageUrl = required(
  "EXPO_PUBLIC_API_STAGE_URL",
  process.env.EXPO_PUBLIC_API_STAGE_URL,
);
export const apiProdUrl = required(
  "EXPO_PUBLIC_API_PROD_URL",
  process.env.EXPO_PUBLIC_API_PROD_URL,
);

export const missingEnvKeys: readonly string[] = missingKeys;

if (isDevelop && missingKeys.length > 0) {
  console.warn(
    `[env] missing ${missingKeys.length} variable(s): ${missingKeys.join(", ")}\n` +
      `Add them to .env (see .env.example) — the feature reading each one is disabled without it.`,
  );
}

/** Static app config snapshot used outside React. */
export const appConfig = {
  flavor,
  isDevelop,
  isLocalDevelopment,
  isIOS,
  isAndroid,
  missingEnvKeys,
  apiBaseUrls: {
    develop: apiDevUrl,
    stage: apiStageUrl,
    production: apiProdUrl,
  } satisfies Record<Flavor, string>,
} as const;

/** Build-flavor default base URL (runtime selection may override via EnvironmentProvider). */
export const apiBaseUrl = appConfig.apiBaseUrls[flavor];

/** Alias for call sites that expect `env` from the environment slice. */
export const env = appConfig;
