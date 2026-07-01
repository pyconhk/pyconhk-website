import { parse } from "yaml";

const expected = {
  branch: "cms",
  repo: "pyconhk/pyconhk-website",
  mediaFolder: "website/public/outstatic/images",
  publicFolder: "/outstatic/images",
  contentRoot: "website/outstatic/content",
  locales: ["en", "zh-hk", "zh-hant", "zh-hans", "ja"],
  defaultLocale: "en",
};

function formatList(values) {
  return values.join(", ");
}

function requireEqual(problems, actual, expectedValue, label) {
  if (actual !== expectedValue) {
    problems.push(`${label} must be ${expectedValue}`);
  }
}

function requireListEqual(problems, actual, expectedValue, label) {
  if (
    !Array.isArray(actual) ||
    actual.length !== expectedValue.length ||
    actual.some((value, index) => value !== expectedValue[index])
  ) {
    problems.push(`${label} must be ${formatList(expectedValue)}`);
  }
}

function findCollection(config, name) {
  return config.collections?.find((collection) => collection?.name === name);
}

function findField(collection, name) {
  return collection?.fields?.find((field) => field?.name === name);
}

export function buildConfigUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error("Usage: node scripts/smoke-cms-config.mjs https://cms.pycon.hk");
  }

  const url = new URL(rawUrl);
  const pathname = url.pathname.replace(/\/+$/u, "");

  if (pathname === "" || pathname === "/" || pathname === "/admin") {
    url.pathname = "/admin/config.yml";
  } else if (!pathname.endsWith("/admin/config.yml")) {
    url.pathname = `${pathname}/admin/config.yml`;
  } else {
    url.pathname = pathname;
  }

  url.search = "";
  url.hash = "";

  return url;
}

export function collectCmsConfigProblems(config) {
  const problems = [];

  requireEqual(problems, config.backend?.name, "github", "backend.name");
  requireEqual(problems, config.backend?.repo, expected.repo, "backend.repo");
  requireEqual(problems, config.backend?.branch, expected.branch, "backend.branch");
  requireEqual(problems, config.publish_mode, "editorial_workflow", "publish_mode");
  requireEqual(problems, config.media_folder, expected.mediaFolder, "media_folder");
  requireEqual(problems, config.public_folder, expected.publicFolder, "public_folder");
  requireEqual(problems, config.i18n?.structure, "multiple_files", "i18n.structure");
  requireListEqual(problems, config.i18n?.locales, expected.locales, "i18n.locales");
  requireEqual(
    problems,
    config.i18n?.default_locale,
    expected.defaultLocale,
    "i18n.default_locale",
  );

  const posts = findCollection(config, "posts");

  requireEqual(problems, posts?.folder, expected.contentRoot, "posts.folder");
  requireEqual(problems, posts?.path, "{{collectionYear}}-posts/{{slug}}", "posts.path");
  requireEqual(problems, posts?.i18n, true, "posts.i18n");
  requireEqual(problems, posts?.extension, "mdx", "posts.extension");
  requireEqual(problems, posts?.format, "frontmatter", "posts.format");

  if (findField(posts, "body")?.i18n !== true) {
    problems.push("posts body field must be locale-enabled");
  }

  return problems;
}

export async function fetchCmsConfig(rawUrl, fetcher = fetch) {
  const configUrl = buildConfigUrl(rawUrl);
  const response = await fetcher(configUrl, {
    headers: { accept: "text/yaml, application/yaml, text/plain" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${configUrl.href}: ${response.status} ${response.statusText}`,
    );
  }

  return {
    config: parse(await response.text()),
    configUrl,
  };
}

export async function smokeCmsConfig(rawUrl, options = {}) {
  const { config, configUrl } = await fetchCmsConfig(rawUrl, options.fetcher);
  const problems = collectCmsConfigProblems(config);

  if (problems.length > 0) {
    throw new Error(`Hosted CMS config failed validation:\n- ${problems.join("\n- ")}`);
  }

  return { configUrl };
}

async function main() {
  const rawUrl = process.argv[2] || process.env.CMS_CONFIG_URL || process.env.CMS_BASE_URL;
  const { configUrl } = await smokeCmsConfig(rawUrl);

  console.log(`Hosted CMS config validation passed: ${configUrl.href}`);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
