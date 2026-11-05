#!/usr/bin/env node
/* global __dirname */
/**
 * Rename the template identity across the repo.
 *
 *   npm run rename -- --name "My App" --slug my-app --bundle-id com.acme.myapp --scheme myapp
 *   npm run rename -- --dry-run --name "My App" --slug my-app --bundle-id com.acme.myapp --scheme myapp
 *
 * Rewrites the IDENTITY block in app.config.js (single source of truth), then
 * updates package.json name, .maestro appId, README title, and remaining
 * com.pj21.apptemplate / apptemplate / app-template string occurrences outside
 * node_modules / .git / generated native folders.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".expo",
  "ios",
  "android",
  "build-logs",
  "Pods",
  "dist",
  "coverage",
]);

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".sh",
  ".env",
  ".example",
  ".rb",
  ".txt",
  ".xml",
  ".plist",
  ".gradle",
  ".properties",
  ".swift",
  ".kt",
  ".java",
  ".mjs",
  ".cjs",
]);

const parseArgs = (argv) => {
  const out = {
    name: null,
    slug: null,
    bundleId: null,
    scheme: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case "--name":
        out.name = next;
        i += 1;
        break;
      case "--slug":
        out.slug = next;
        i += 1;
        break;
      case "--bundle-id":
        out.bundleId = next;
        i += 1;
        break;
      case "--scheme":
        out.scheme = next;
        i += 1;
        break;
      case "--dry-run":
      case "-n":
        out.dryRun = true;
        break;
      case "--help":
      case "-h":
        out.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return out;
};

const usage = () => {
  console.log(`usage: npm run rename -- --name "My App" --slug my-app --bundle-id com.acme.myapp --scheme myapp

options:
  --name <display>       Human display name (IDENTITY.name)
  --slug <slug>          Expo slug + package.json name
  --bundle-id <id>       Base iOS/Android id (no .develop/.stage)
  --scheme <scheme>      Custom URL scheme base (no -develop/-stage)
  --dry-run, -n          Print planned edits without writing
  --help, -h             This text
`);
};

const readIdentity = (appConfigSource) => {
  const match = appConfigSource.match(/const IDENTITY = \{([\s\S]*?)\n\};/);
  if (!match) {
    throw new Error("Could not find IDENTITY block in app.config.js");
  }
  const block = match[1];
  const pick = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
    if (!m) throw new Error(`IDENTITY.${key} not found in app.config.js`);
    return m[1];
  };
  return {
    name: pick("name"),
    slug: pick("slug"),
    bundleId: pick("bundleId"),
    scheme: pick("scheme"),
  };
};

const writeIdentity = (appConfigSource, next) => {
  const nextBlock = `const IDENTITY = {
  name: ${JSON.stringify(next.name)},
  slug: ${JSON.stringify(next.slug)},
  /** Base iOS bundle id AND Android applicationId (no flavor suffix). */
  bundleId: ${JSON.stringify(next.bundleId)},
  /** Custom URL scheme base (no flavor suffix). */
  scheme: ${JSON.stringify(next.scheme)},
};`;

  if (!/const IDENTITY = \{[\s\S]*?\n\};/.test(appConfigSource)) {
    throw new Error("Could not replace IDENTITY block in app.config.js");
  }
  return appConfigSource.replace(/const IDENTITY = \{[\s\S]*?\n\};/, nextBlock);
};

const shouldSkipDir = (name) => SKIP_DIR_NAMES.has(name);

const walkFiles = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") &&
      entry.name !== ".maestro" &&
      entry.name !== ".env.example" &&
      entry.name !== ".ai"
    ) {
      // Keep scanning .maestro / .ai; skip other dotdirs (.git already skipped by name).
      if (entry.isDirectory()) {
        if (entry.name === ".maestro" || entry.name === ".ai") {
          walkFiles(path.join(dir, entry.name), acc);
        }
        continue;
      }
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walkFiles(full, acc);
      continue;
    }
    const ext = path.extname(entry.name);
    if (
      TEXT_EXTENSIONS.has(ext) ||
      entry.name === "Gemfile" ||
      entry.name === "Fastfile" ||
      entry.name === "CLAUDE.md" ||
      entry.name === "README.md" ||
      entry.name === "apple-app-site-association" ||
      entry.name.endsWith(".example")
    ) {
      acc.push(full);
    }
  }
  return acc;
};

const main = () => {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error.message || error));
    usage();
    process.exit(2);
  }

  if (args.help) {
    usage();
    process.exit(0);
  }

  if (!args.name || !args.slug || !args.bundleId || !args.scheme) {
    console.error(
      "All of --name, --slug, --bundle-id, and --scheme are required.",
    );
    usage();
    process.exit(2);
  }

  if (!/^[a-z0-9-]+$/.test(args.slug)) {
    console.error("--slug must be lowercase alphanumeric + hyphens");
    process.exit(2);
  }
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(args.bundleId)) {
    console.error("--bundle-id must look like com.company.app");
    process.exit(2);
  }
  if (!/^[a-z][a-z0-9+-]*$/i.test(args.scheme)) {
    console.error("--scheme must be a valid custom URL scheme token");
    process.exit(2);
  }

  const appConfigPath = path.join(ROOT, "app.config.js");
  const appConfigSource = fs.readFileSync(appConfigPath, "utf8");
  const previous = readIdentity(appConfigSource);
  const next = {
    name: args.name,
    slug: args.slug,
    bundleId: args.bundleId,
    scheme: args.scheme,
  };

  console.log(args.dryRun ? "Dry run — no files will be written.\n" : "");
  console.log("Identity");
  console.log(`  name:      ${previous.name} → ${next.name}`);
  console.log(`  slug:      ${previous.slug} → ${next.slug}`);
  console.log(`  bundleId:  ${previous.bundleId} → ${next.bundleId}`);
  console.log(`  scheme:    ${previous.scheme} → ${next.scheme}`);
  console.log("");

  const replacements = [
    // Longest / most specific first.
    [previous.bundleId, next.bundleId],
    [previous.slug, next.slug],
    [previous.scheme, next.scheme],
    [previous.name, next.name],
    // Common template leftovers if identity already drifted partially.
    ["com.pj21.apptemplate", next.bundleId],
    ["app-template", next.slug],
    ["apptemplate", next.scheme],
    ["App Template", next.name],
  ];

  // Deduplicate identical from→to pairs and drop no-ops.
  const seen = new Set();
  const uniqueReplacements = [];
  for (const [from, to] of replacements) {
    if (!from || from === to) continue;
    const key = `${from}=>${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueReplacements.push([from, to]);
  }

  const planned = [];

  // 1) IDENTITY block
  const nextAppConfig = writeIdentity(appConfigSource, next);
  if (nextAppConfig !== appConfigSource) {
    planned.push({ file: appConfigPath, reason: "IDENTITY block" });
    if (!args.dryRun) fs.writeFileSync(appConfigPath, nextAppConfig);
  }

  // 2) package.json name
  const packageJsonPath = path.join(ROOT, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (packageJson.name !== next.slug) {
    planned.push({
      file: packageJsonPath,
      reason: `name: ${packageJson.name} → ${next.slug}`,
    });
    if (!args.dryRun) {
      packageJson.name = next.slug;
      fs.writeFileSync(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`,
      );
    }
  }

  // 3) Maestro appId — default local flavor is develop → base.bundleId.develop
  const maestroLaunch = path.join(
    ROOT,
    ".maestro",
    "flows",
    "smoke",
    "01_launch.yaml",
  );
  if (fs.existsSync(maestroLaunch)) {
    const before = fs.readFileSync(maestroLaunch, "utf8");
    const developId = `${next.bundleId}.develop`;
    const after = before.replace(/^appId:\s*.*$/m, `appId: ${developId}`);
    if (after !== before) {
      planned.push({ file: maestroLaunch, reason: `appId → ${developId}` });
      if (!args.dryRun) fs.writeFileSync(maestroLaunch, after);
    }
  }

  // 4) README title
  const readmePath = path.join(ROOT, "README.md");
  if (fs.existsSync(readmePath)) {
    const before = fs.readFileSync(readmePath, "utf8");
    const after = before.replace(/^#\s+.*/m, `# ${next.name}`);
    if (after !== before) {
      planned.push({ file: readmePath, reason: `H1 → # ${next.name}` });
      if (!args.dryRun) fs.writeFileSync(readmePath, after);
    }
  }

  // 5) Repo-wide string sweep (skip app.config.js — already handled; skip package-lock)
  const files = walkFiles(ROOT).filter((file) => {
    const rel = path.relative(ROOT, file);
    if (rel === "app.config.js") return false;
    if (rel === "package-lock.json") return false;
    if (rel === "scripts/rename-project.js") return false;
    return true;
  });

  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (text.includes("\u0000")) continue;

    let nextText = text;
    for (const [from, to] of uniqueReplacements) {
      if (!nextText.includes(from)) continue;
      nextText = nextText.split(from).join(to);
    }
    if (nextText !== text) {
      planned.push({ file, reason: "string replacements" });
      if (!args.dryRun) fs.writeFileSync(file, nextText);
    }
  }

  if (planned.length === 0) {
    console.log("Nothing to change — identity already matches.");
  } else {
    console.log(
      `Files ${args.dryRun ? "that would change" : "updated"} (${planned.length}):`,
    );
    for (const item of planned) {
      console.log(`  - ${path.relative(ROOT, item.file)} (${item.reason})`);
    }
  }

  console.log(`
Next steps
  1. git-crypt: this template ships an encrypted .env. For a NEW project key:
       rm -rf .git-crypt
       git-crypt unlock   # only if you still need the old key once; else skip
       # After cloning a fresh copy / resetting encryption:
       git-crypt init
       git-crypt export-key ~/.config/git-crypt/${next.slug}.key
     Removing .git-crypt drops the old keyring so collaborators cannot decrypt
     with the template key. Re-add .gitattributes filter lines if needed, then
     re-commit .env after filling it.
  2. Environment:
       cp .env.example .env
       # fill APPLE_TEAM_ID, Android keystore passwords, API URLs, APP_LINK_HOSTS
  3. Android signing:
       keytool -genkeypair -v -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 \\
         -storepass <pass> -keypass <pass> -alias <alias> -keystore key.jks
  4. Ruby tooling (once per machine):
       bundle install
  5. Run:
       npm ci
       npm run ios   # or: npm run android
       npm run build:develop
`);
};

main();
