import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function affectedPaths(
	previous: Record<string, string> = {},
	current: Record<string, string> = {},
) {
	return [...new Set([...Object.keys(previous), ...Object.keys(current)])]
		.sort()
		.filter((url) => previous[url] !== current[url]);
}

/** Hash rendered pages/assets: deleted routes are included from the previous
 * successful manifest. Immutable Astro assets and version metadata stay alone. */
export async function pageHashes(directory: string) {
	const hashes: Record<string, string> = {};
	async function walk(relative = "") {
		for (const entry of await fs.readdir(path.join(directory, relative), {
			withFileTypes: true,
		})) {
			const name = path.posix.join(relative, entry.name);
			if (
				name.startsWith("_") ||
				["deployment-manifest.json", "programme-snapshot.json"].includes(name)
			)
				continue;
			if (entry.isDirectory()) {
				await walk(name);
				continue;
			}
			if (!entry.isFile()) continue;
			const url =
				`/${name.split("/").map(encodeURIComponent).join("/")}`.replace(
					/\/index\.html$/u,
					"/",
				);
			hashes[url] = createHash("sha256")
				.update(await fs.readFile(path.join(directory, name)))
				.digest("hex");
		}
	}
	await walk();
	return hashes;
}

function purgePathVariants(url: string): string[] {
	if (url.endsWith("/index.html")) {
		return purgePathVariants(url.slice(0, -"index.html".length));
	}
	if (url === "/") return [url, "/index.html", "/index", "/index/"];
	if (url.endsWith("/")) {
		return [
			url,
			url.slice(0, -1),
			`${url}index.html`,
			`${url}index`,
			`${url}index/`,
		];
	}
	if (url.endsWith(".html")) {
		const canonical = url.slice(0, -".html".length);
		return [url, canonical, `${canonical}/`];
	}
	return [url];
}

export async function purgePages(
	environment: string,
	manifest: { affectedPaths?: string[] },
	{
		token = process.env.CLOUDFLARE_CACHE_PURGE_TOKEN,
		zone = process.env.CLOUDFLARE_ZONE_ID,
		fetchImpl = fetch,
	} = {},
) {
	const origins =
		environment === "production"
			? ["https://pycon.hk"]
			: environment === "test"
				? ["https://test.pycon.hk"]
				: [];
	if (!origins.length || !manifest.affectedPaths?.length) return;
	assert.ok(
		token && zone,
		"Affected-page invalidation requires CLOUDFLARE_CACHE_PURGE_TOKEN and CLOUDFLARE_ZONE_ID",
	);
	assert.match(zone, /^[a-f0-9]{32}$/u, "Invalid Cloudflare zone ID");
	const urls = [
		...new Set(
			manifest.affectedPaths.flatMap((url) => {
				assert.ok(
					url.startsWith("/") &&
						!url.startsWith("//") &&
						!url.includes("?") &&
						!url.includes("#"),
					"Invalid purge path",
				);
				// Pages serves file-format HTML without .html and serves directory indexes
				// through several aliases. Purge both body URLs and their cached redirects.
				return origins.flatMap((origin) =>
					purgePathVariants(url).map((pathname) => `${origin}${pathname}`),
				);
			}),
		),
	];
	for (let offset = 0; offset < urls.length; offset += 30) {
		const response = await fetchImpl(
			`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ files: urls.slice(offset, offset + 30) }),
				signal: AbortSignal.timeout(20_000),
			},
		);
		if (!response.ok || !(await response.json()).success)
			throw new Error(`Affected-page invalidation failed: ${response.status}`);
	}
}

if (
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	const [environment, manifestPath] = process.argv.slice(2);
	purgePages(
		environment,
		JSON.parse(await fs.readFile(manifestPath, "utf8")),
	).catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
