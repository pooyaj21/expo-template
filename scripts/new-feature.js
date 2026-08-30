#!/usr/bin/env node
/**
 * Scaffolds a VLFA feature slice, wired end to end.
 *
 *   npm run feature -- orders
 *   npm run feature -- order-history --no-route
 *
 * Creates data-access (types, service, queries), business-logic (the use-case
 * hook), presentation (screen + cell), and the route shell — then tells you the
 * two files to edit by hand, because a generator must not silently rewrite the
 * routes map or the string catalog.
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const rawName = args.find((arg) => !arg.startsWith("-"));
const withRoute = !args.includes("--no-route");

if (!rawName) {
  console.error("Usage: npm run feature -- <feature-name> [--no-route]");
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(rawName)) {
  console.error(
    `Invalid name "${rawName}". Use lowercase kebab-case, e.g. order-history`,
  );
  process.exit(1);
}

const kebab = rawName;
const camel = kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);

const root = path.join(__dirname, "..");
const featureDir = path.join(root, "src", "features", kebab);

if (fs.existsSync(featureDir)) {
  console.error(`src/features/${kebab} already exists.`);
  process.exit(1);
}

const files = {
  [`data-access/${camel}Types.ts`]: `import { BasePaginationPayload } from "@/common/data-access/type";

export interface ${Pascal}Interface {
  id: number;
  title: string;
}

export interface ${Pascal}ListPayload extends BasePaginationPayload {
  // Add filters here — search, sort and page come from BasePaginationPayload.
  sort?: string;
}
`,

  [`data-access/${camel}Service.ts`]: `import { AxiosInstance } from "axios";
import {
  BasePaginationResponse,
  BaseResponseType,
} from "@/common/data-access/type";
import {
  ${Pascal}Interface,
  ${Pascal}ListPayload,
} from "@/features/${kebab}/data-access/${camel}Types";

export const ${camel}Service = {
  list: async (
    axios: AxiosInstance,
    params: ${Pascal}ListPayload,
  ): Promise<BasePaginationResponse<${Pascal}Interface>> =>
    (await axios.get("/${kebab}", { params })).data,

  detail: async (
    axios: AxiosInstance,
    id: string,
  ): Promise<BaseResponseType<${Pascal}Interface>> =>
    (await axios.get(\`/${kebab}/\${id}\`)).data,
};
`,

  [`data-access/${camel}Queries.ts`]: `import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/features/core/api/data-access/apiClientContext";
import { useDefaultQueryKey } from "@/common/data-access/api/queryScope";
import { nextPageParam } from "@/common/data-access/api/pagination";
import { ${camel}Service } from "@/features/${kebab}/data-access/${camel}Service";
import { ${Pascal}ListPayload } from "@/features/${kebab}/data-access/${camel}Types";

export function use${Pascal}ListQuery(params: ${Pascal}ListPayload = {}) {
  const axios = useApiClient();

  return useInfiniteQuery({
    queryKey: useDefaultQueryKey(["${kebab}-list", params]),
    queryFn: ({ pageParam }) =>
      ${camel}Service.list(axios, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function use${Pascal}DetailQuery(id: string) {
  const axios = useApiClient();

  return useQuery({
    queryKey: useDefaultQueryKey(["${kebab}-detail", id]),
    queryFn: () => ${camel}Service.detail(axios, id),
    enabled: Boolean(id),
  });
}
`,

  [`business-logic/use${Pascal}List.ts`]: `import {
  infiniteListMapper,
  infiniteTotalMapper,
} from "@/common/data-access/api/pagination";
import { use${Pascal}ListQuery } from "@/features/${kebab}/data-access/${camel}Queries";
import { ${Pascal}ListPayload } from "@/features/${kebab}/data-access/${camel}Types";

export const use${Pascal}List = (params: ${Pascal}ListPayload = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = use${Pascal}ListQuery(params);

  const list = infiniteListMapper(data);

  return {
    list,
    total: infiniteTotalMapper(data),
    isLoading: isLoading || (isFetching && !isFetchingNextPage),
    isEmpty: !isLoading && list.length === 0,
    error: error ?? undefined,
    refetch,
    pagination: {
      isFetchingNextPage,
      fetchNextPageIfAvailable: () => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      },
    },
  };
};
`,

  [`presentation/components/${Pascal}Cell.tsx`]: `import { StyleSheet } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { AppText } from "@/common/presentation/components/app/AppText";
import { ${Pascal}Interface } from "@/features/${kebab}/data-access/${camel}Types";

type ${Pascal}CellProps = {
  item: ${Pascal}Interface;
  onPress: (item: ${Pascal}Interface) => void;
};

export const ${Pascal}Cell = ({ item, onPress }: ${Pascal}CellProps) => {
  const { colors } = useAppTheme();

  return (
    <AppPressable
      enableAnimation
      onPress={() => onPress(item)}
      style={[styles.container, { backgroundColor: colors.background.level1 }]}
    >
      <AppText size={14} weight="semiBold" numberOfLines={1}>
        {item.title}
      </AppText>
    </AppPressable>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md, borderRadius: radius.md },
});
`,

  [`presentation/${Pascal}ListScreen.tsx`]: `import { FlashList } from "@shopify/flash-list";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { Spacer } from "@/common/presentation/components/Spacer";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { use${Pascal}List } from "@/features/${kebab}/business-logic/use${Pascal}List";
import { ${Pascal}Cell } from "@/features/${kebab}/presentation/components/${Pascal}Cell";

export const ${Pascal}ListScreen = () => {
  const { list, isLoading, isEmpty, error, refetch, pagination } =
    use${Pascal}List();

  return (
    <PageContainer safeEdges="top">
      {/* TODO: replace with getString("${camel}_title") once the key exists. */}
      <AppToolbar title="${Pascal}" />

      <StateHandler
        data={list}
        isLoading={isLoading}
        isEmpty={isEmpty}
        error={error}
        retry={refetch}
      >
        {(items) => (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: spacing.md }}
            ItemSeparatorComponent={() => <Spacer height={spacing.xs} />}
            onEndReachedThreshold={0.5}
            onEndReached={pagination.fetchNextPageIfAvailable}
            renderItem={({ item }) => (
              <${Pascal}Cell item={item} onPress={() => {}} />
            )}
          />
        )}
      </StateHandler>
    </PageContainer>
  );
};
`,
};

for (const [relativePath, contents] of Object.entries(files)) {
  const target = path.join(featureDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

if (withRoute) {
  const routeDir = path.join(root, "src", "app", kebab);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(
    path.join(routeDir, "index.tsx"),
    `import { ${Pascal}ListScreen } from "@/features/${kebab}/presentation/${Pascal}ListScreen";

export default function Page() {
  return <${Pascal}ListScreen />;
}
`,
  );
}

console.log(`Created src/features/${kebab}/`);
Object.keys(files).forEach((file) => console.log(`  ${file}`));
if (withRoute) console.log(`  → src/app/${kebab}/index.tsx`);

console.log("\nStill yours to do:");
console.log(
  `  1. Add \`${camel}: () => "/${kebab}"\` to src/common/business-logic/routes/paths.ts`,
);
console.log(
  `  2. Add \`${camel}_title\` to src/common/data-access/localization/strings.ts (en + ar)`,
);
if (withRoute) {
  console.log(
    `  3. Register <Stack.Screen name="${kebab}" /> in src/app/_layout.tsx`,
  );
}
console.log("  4. Point the service paths at the real endpoints");
