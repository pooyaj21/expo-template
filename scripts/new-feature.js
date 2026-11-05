#!/usr/bin/env node
/**
 * Scaffold a VLFA feature slice:
 *   npm run feature -- <name>
 *
 * Creates:
 *   src/features/<name>/data-access/<name>Types.ts
 *   src/features/<name>/data-access/<name>Service.ts
 *   src/features/<name>/data-access/<name>Queries.ts
 *   src/features/<name>/business-logic/use<Name>.ts
 *   src/features/<name>/presentation/<Name>Page.tsx
 */
const fs = require("fs");
const path = require("path");

const raw = process.argv[2];
if (!raw || raw.startsWith("-")) {
  console.error("Usage: npm run feature -- <name>");
  console.error(
    "  <name> is kebab-case or camelCase (e.g. demo, user-profile)",
  );
  process.exit(1);
}

const kebab = raw
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/[\s_]+/g, "-")
  .replace(/-+/g, "-")
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, "")
  .replace(/^-+|-+$/g, "");

if (!kebab || !/^[a-z][a-z0-9-]*$/.test(kebab)) {
  console.error(`Invalid feature name: ${raw}`);
  process.exit(1);
}

const camel = kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);

const root = path.resolve(__dirname, "..");
const featureRoot = path.join(root, "src", "features", kebab);

if (fs.existsSync(featureRoot)) {
  console.error(`Feature already exists: ${featureRoot}`);
  process.exit(1);
}

const write = (rel, contents) => {
  const abs = path.join(featureRoot, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents.trimStart(), "utf8");
  console.log(`created ${path.relative(root, abs)}`);
};

write(
  `data-access/${camel}Types.ts`,
  `
export interface ${pascal}Item {
  id: number;
  title: string;
}

export interface ${pascal}ListPayload {
  page?: number;
}
`,
);

write(
  `data-access/${camel}Service.ts`,
  `
import { apiClient } from "@/common/data-access/api/axios";
import { ${pascal}Item } from "@/features/${kebab}/data-access/${camel}Types";

export const ${camel}Service = {
  list: async (): Promise<${pascal}Item[]> => {
    const response = await apiClient.get<${pascal}Item[]>("/${kebab}");
    return response.data;
  },
};
`,
);

write(
  `data-access/${camel}Queries.ts`,
  `
import { useQuery } from "@tanstack/react-query";
import { useDefaultQueryKey } from "@/common/business-logic/hooks/useDefaultQueryKey";
import { ${camel}Service } from "@/features/${kebab}/data-access/${camel}Service";

export const use${pascal}ListQuery = () =>
  useQuery({
    queryKey: useDefaultQueryKey(["${kebab}-list"]),
    queryFn: () => ${camel}Service.list(),
  });
`,
);

write(
  `business-logic/use${pascal}.ts`,
  `
import { use${pascal}ListQuery } from "@/features/${kebab}/data-access/${camel}Queries";

export const use${pascal} = () => {
  const query = use${pascal}ListQuery();
  const list = query.data ?? [];

  return {
    list,
    isLoading: query.isLoading,
    isEmpty: !query.isLoading && list.length === 0,
    error: query.error,
    refetch: query.refetch,
  };
};
`,
);

write(
  `presentation/${pascal}Page.tsx`,
  `
import { View, StyleSheet } from "react-native";
import { AppText } from "@/common/presentation/components/AppText";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { use${pascal} } from "@/features/${kebab}/business-logic/use${pascal}";

export const ${pascal}Page = () => {
  const { list, isLoading, error, isEmpty, refetch } = use${pascal}();

  return (
    <PageContainer>
      <View style={styles.root} testID="${kebab}-page">
        <StateHandler
          data={list}
          error={error}
          isLoading={isLoading}
          isEmpty={isEmpty}
          retry={refetch}
        >
          {(items) => (
            <AppText testID="${kebab}-list">
              {items.length} item(s)
            </AppText>
          )}
        </StateHandler>
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});
`,
);

console.log(`\nScaffolded features/${kebab}. Next:`);
console.log(`  - wire a thin route under src/app/`);
console.log(
  `  - add routes.${camel}… in src/common/business-logic/routes/paths.ts`,
);
console.log(
  `  - add localization keys; replace placeholder copy in ${pascal}Page`,
);
console.log(`  - point ${camel}Service at a real endpoint`);
