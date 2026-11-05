/**
 * Every flag declares exactly one source. Resolution never crosses sources:
 * an `env` flag never reads the server map, a `server` flag never reads env.
 */

export type FeatureFlagSource = "env" | "server";

export type FlagDefinition<S extends FeatureFlagSource = FeatureFlagSource> = {
  source: S;
  default: boolean;
};

export const flagCatalog = {
  EXAMPLE_DETAIL: { source: "env", default: true },
  EXAMPLE_FAVORITES: { source: "server", default: true },
} as const satisfies Record<string, FlagDefinition>;

export type FlagName = keyof typeof flagCatalog;

export type EnvFlagName = {
  [K in FlagName]: (typeof flagCatalog)[K]["source"] extends "env" ? K : never;
}[FlagName];

export type ServerFlagName = {
  [K in FlagName]: (typeof flagCatalog)[K]["source"] extends "server"
    ? K
    : never;
}[FlagName];

export const FLAG_NAMES = Object.keys(flagCatalog) as FlagName[];

export const ENV_FLAG_NAMES = FLAG_NAMES.filter(
  (name): name is EnvFlagName => flagCatalog[name].source === "env",
);

export const SERVER_FLAG_NAMES = FLAG_NAMES.filter(
  (name): name is ServerFlagName => flagCatalog[name].source === "server",
);
