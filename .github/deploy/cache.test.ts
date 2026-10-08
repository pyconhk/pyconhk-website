import assert from "node:assert/strict";
import test from "node:test";
import { affectedPaths, purgePages } from "./cache.ts";

test("purges changed and deleted pages while preserving unchanged pages", () => {
	assert.deepEqual(
		affectedPaths(
			{ "/news/old/": "a", "/about/": "b", "/": "c" },
			{ "/news/new/": "d", "/about/": "b", "/": "e" },
		),
		["/", "/news/new/", "/news/old/"],
	);
});

test("targeted invalidation never purges the entire cache and is environment scoped", async () => {
	const requests: { url: string; body: { files: string[] } }[] = [];
	await purgePages(
		"test",
		{ affectedPaths: ["/2026/en/news/story/", "/outstatic/images/cover.webp"] },
		{
			token: "fixture",
			zone: "a".repeat(32),
			fetchImpl: async (url, options) => {
				requests.push({
					url: String(url),
					body: JSON.parse(String(options?.body)),
				});
				return Response.json({ success: true });
			},
		},
	);
	assert.equal(requests.length, 1);
	assert.ok(
		requests[0].body.files.every((url) =>
			url.startsWith("https://test.pycon.hk/"),
		),
	);
	assert.equal("purge_everything" in requests[0].body, false);
	assert.equal(requests[0].body.files.length, 3);
});

test("failed cache invalidation remains a workflow failure; no changes require no credential", async () => {
	await purgePages("production", { affectedPaths: [] });
	await assert.rejects(
		purgePages(
			"production",
			{ affectedPaths: ["/"] },
			{
				token: "fixture",
				zone: "a".repeat(32),
				fetchImpl: async () =>
					Response.json({ success: false }, { status: 503 }),
			},
		),
		/invalidation failed/,
	);
});

test("a failed upload purge is completed before a newer version replaces its path history", async () => {
	const before = { "/first/": "old-first", "/second/": "old-second" };
	const uploaded = { "/first/": "new-first", "/second/": "old-second" };
	const replacement = { "/first/": "new-first", "/second/": "new-second" };
	const previousManifest = { affectedPaths: affectedPaths(before, uploaded) };
	const replacementManifest = { affectedPaths: affectedPaths(uploaded, replacement) };
	const requests: string[][] = [];
	let rejectPurge = true;
	const options = {
		token: "fixture",
		zone: "a".repeat(32),
		fetchImpl: async (_url: string | URL | Request, request?: RequestInit) => {
			const { files } = JSON.parse(String(request?.body));
			requests.push(files);
			return Response.json({ success: !rejectPurge }, { status: rejectPurge ? 503 : 200 });
		},
	};
	await assert.rejects(purgePages("test", previousManifest, options), /invalidation failed/);
	assert.deepEqual(replacementManifest.affectedPaths, ["/second/"], "new output cannot recover the earlier dirty URL");
	rejectPurge = false;
	// Changed deployments complete the previous manifest's purge before upload,
	// then invalidate the newly uploaded version's own changed paths.
	await purgePages("test", previousManifest, options);
	await purgePages("test", replacementManifest, options);
	assert.deepEqual(requests.slice(1), [
		["https://test.pycon.hk/first/", "https://test.pycon.hk/first"],
		["https://test.pycon.hk/second/", "https://test.pycon.hk/second"],
	]);
});

test("rendered versions cover assets and canonical pages without hashing version metadata", async (t) => {
	const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
	const { tmpdir } = await import("node:os");
	const { join } = await import("node:path");
	const { pageHashes } = await import("./cache.ts");
	const directory = await mkdtemp(join(tmpdir(), "pycon-cache-"));
	t.after(() => rm(directory, { recursive: true, force: true }));
	await mkdir(join(directory, "2026/en/news/story"), { recursive: true });
	await mkdir(join(directory, "_astro"));
	await writeFile(
		join(directory, "2026/en/news/story/index.html"),
		"Rendered post",
	);
	await writeFile(join(directory, "deployment-manifest.json"), "First build");
	await writeFile(join(directory, "_astro/immutable.js"), "Immutable asset");
	const before = await pageHashes(directory);
	assert.deepEqual(Object.keys(before), ["/2026/en/news/story/"]);
	await writeFile(
		join(directory, "deployment-manifest.json"),
		"Another timestamp",
	);
	assert.deepEqual(await pageHashes(directory), before);
	await writeFile(
		join(directory, "2026/en/news/story/index.html"),
		"Changed post",
	);
	assert.deepEqual(affectedPaths(before, await pageHashes(directory)), [
		"/2026/en/news/story/",
	]);
});
