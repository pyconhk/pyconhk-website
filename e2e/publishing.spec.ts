import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
const exec = promisify(execFile);
const root=fileURLToPath(new URL('..',import.meta.url));
const cmsRequire = createRequire(new URL('../cms/package.json', import.meta.url));
const appRequire = createRequire(cmsRequire.resolve('decap-cms-app/package.json'));
const { branchFromContentKey, contentKeyFromBranch, generateContentKey } = await import(appRequire.resolve('decap-cms-lib-util/dist/esm/APIUtils.js'));
const locales=['en','zh-hk','zh-hant','zh-hans','ja','ko'];
async function fixture() {
  const dir=await mkdtemp(path.join(tmpdir(),'pycon-publishing-'));
  await mkdir(path.join(dir,'cms/publication'),{recursive:true});
  for(const name of ['content.ts','editorial.ts']) await cp(path.join(root,'cms/publication',name),path.join(dir,'cms/publication',name));
  await mkdir(path.join(dir,'cms/src/lib'),{recursive:true});
  await cp(path.join(root,'cms/src/lib/news-frontmatter.ts'),path.join(dir,'cms/src/lib/news-frontmatter.ts'));
  await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
  await symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
  await mkdir(path.join(dir,'website/outstatic/content/2026-posts'),{recursive:true});
  return dir;
}
async function run(dir:string,script:string,env={}) {
  return exec(process.execPath,[`cms/publication/${script}.ts`],{cwd:dir,env:{...process.env,...env}}).then(r=>({code:0,text:r.stdout+r.stderr}),e=>({code:e.code,text:e.stdout+e.stderr}));
}
function article(status='published') {return `---\ntitle: E2E announcement\nslug: e2e-announcement\nstatus: ${status}\npublishedAt: 2026-09-08T00:00:00.000Z\ncoverImage: /outstatic/images/e2e.webp\n---\nPublic announcement\n`;}

function localizedArticle(locale: string, fields = '') {
  return article()
    .replace('title: E2E announcement', `title: E2E announcement ${locale}`)
    .replace('Public announcement', `Public announcement ${locale}: 編程・連結・前行`)
    .replace('\n---\n', `\n${fields}---\n`);
}

async function writeLocales(dir: string, source: (locale: string) => string) {
  const files = locales.map(locale => ({
    file: path.join(dir, 'website/outstatic/content/2026-posts', `e2e.${locale}.mdx`),
    text: source(locale),
  }));
  await Promise.all(files.map(({ file, text }) => writeFile(file, text)));
  return files;
}

async function roundTripNews(sources: string[]) {
  // Decap's ESM imports are resolved by Bun, matching the CMS build runtime.
  const { stdout } = await exec('bun', ['--eval', `
    import { newsFrontmatterFormat } from './cms/src/lib/news-format.ts';
    const variants = JSON.parse(process.argv[1]).map(source => {
      const original = newsFrontmatterFormat.fromFile(source);
      const serialized = newsFrontmatterFormat.toFile(original);
      return { original, serialized, restored: newsFrontmatterFormat.fromFile(serialized) };
    });
    process.stdout.write(JSON.stringify(variants));
  `, JSON.stringify(sources)], { cwd: root, env: process.env });
  return JSON.parse(stdout);
}

for (const [label, value] of [
  ['absent', undefined],
  ['null', 'null'],
  ['empty', '""'],
  ['whitespace', '"   "'],
  ['valid', 'https://pycon.hk/avatar.webp'],
] as const) {
  test(`publication command accepts ${label} optional avatars in all six locales`, async () => {
    const dir = await fixture();
    try {
      const files = await writeLocales(dir, locale => localizedArticle(locale,
        `author:\n  name: PyCon HK\n${value === undefined ? '' : `  picture: ${value}\n`}`));
      const result = await run(dir, 'content');
      expect(result.code, result.text).toBe(0);
      expect(result.text).not.toContain('missing published locales');
      for (const { file, text } of files) expect(await readFile(file, 'utf8')).toBe(text);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
}

for (const [label, value] of [
  ['boolean', 'false'], ['number', '42'], ['list', '[avatar]'], ['object', '{url: avatar}'],
] as const) {
  test(`publication command rejects a ${label} avatar without losing existing locales`, async () => {
    const dir = await fixture();
    try {
      const files = await writeLocales(dir, locale => localizedArticle(locale,
        `author:\n  name: PyCon HK\n  picture: ${locale === 'en' ? 'https://pycon.hk/avatar.webp' : value}\n`));
      const result = await run(dir, 'content');
      expect(result.code).not.toBe(0);
      for (const locale of locales.slice(1)) {
        expect(result.text).toContain(`e2e.${locale}.mdx: author.picture`);
      }
      expect(result.text).not.toContain('missing published locales');
      for (const { file, text } of files) expect(await readFile(file, 'utf8')).toBe(text);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
}

test('CMS serialization preserves six published translations through the publication command', async () => {
  const dir = await fixture();
  try {
    const avatarValues = [undefined, 'null', '""', '"   "', 'https://pycon.hk/avatar.webp', 'null'];
    const sources = locales.map(locale => {
      const value = avatarValues[locales.indexOf(locale)];
      return localizedArticle(locale,
        `description: null\nauthor:\n  name: PyCon HK\n${value === undefined ? '' : `  picture: ${value}\n`}`);
    });
    const variants = await roundTripNews(sources);
    const files = await writeLocales(dir, locale => {
      const { original, serialized, restored } = variants[locales.indexOf(locale)];
      const value = avatarValues[locales.indexOf(locale)];
      expect(restored).toEqual(original);
      expect(restored.title).toBe(`E2E announcement ${locale}`);
      expect(restored.body).toBe(`Public announcement ${locale}: 編程・連結・前行\n`);
      expect(restored.status).toBe('published');
      expect(restored).not.toHaveProperty('description');
      if (value === 'https://pycon.hk/avatar.webp') {
        expect(restored.author).toHaveProperty('picture', value);
      } else {
        expect(restored.author).not.toHaveProperty('picture');
      }
      return serialized;
    });
    const result = await run(dir, 'content');
    expect(result.code, result.text).toBe(0);
    for (const { file, text } of files) expect(await readFile(file, 'utf8')).toBe(text);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CMS serialization accepts cleared optional fields in an unfinished draft', async () => {
  const dir = await fixture();
  try {
    const source = `---\nslug: unfinished\nstatus: draft\ntitle: null\ndescription: null\npublishedAt: null\ncoverImage: null\ntags: null\nauthor:\n  name: PyCon HK\n  picture: null\nbody: null\n---\n`;
    const [{ original, serialized, restored }] = await roundTripNews([source]);
    expect(restored).toEqual(original);
    expect(restored).toEqual({ slug: 'unfinished', status: 'draft', author: { name: 'PyCon HK' } });
    expect(serialized.split('---')[2].trim()).toBe('');
    await writeLocales(dir, () => serialized);
    const result = await run(dir, 'content');
    expect(result.code, result.text).toBe(0);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CMS serialization rejects boolean, number, list and object bodies', async () => {
  const { stdout } = await exec('bun', ['--eval', `
    import { newsFrontmatterFormat } from './cms/src/lib/news-format.ts';
    const errors = [false, 42, [], {}].flatMap(body => ['read', 'write'].map(direction => {
      try {
        if (direction === 'read') newsFrontmatterFormat.fromFile(
          '---\\nslug: unfinished\\nstatus: draft\\nbody: ' + JSON.stringify(body) + '\\n---\\n');
        else newsFrontmatterFormat.toFile({ slug: 'unfinished', status: 'draft', body });
        return 'accepted';
      } catch (error) { return error.message; }
    }));
    process.stdout.write(JSON.stringify(errors));
  `], { cwd: root, env: process.env });
  expect(JSON.parse(stdout)).toEqual(Array(8).fill('body must be a string'));
});

for (const [label, change, error] of [
  ['null slug', ['slug: e2e-announcement', 'slug: null'], 'slug'],
  ['numeric slug', ['slug: e2e-announcement', 'slug: 42'], 'slug'],
  ['null author name', ['  name: PyCon HK', '  name: null'], 'author.name'],
  ['list author name', ['  name: PyCon HK', '  name: [PyCon HK]'], 'author.name'],
  ['blank published title', ['title: E2E announcement ko', 'title: ""'], 'title before publishing'],
  ['empty published body', ['Public announcement ko: 編程・連結・前行', ''], 'body before publishing'],
] as const) {
  test(`publication command still rejects ${label}`, async () => {
    const dir = await fixture();
    try {
      await writeLocales(dir, locale => {
        const source = localizedArticle(locale, 'author:\n  name: PyCon HK\n');
        return locale === 'ko' ? source.replace(...change) : source;
      });
      const result = await run(dir, 'content');
      expect(result.code).not.toBe(0);
      expect(result.text).toContain(`e2e.ko.mdx`);
      expect(result.text).toContain(error);
      expect(result.text).not.toContain('missing published locales');
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
}

test('editorial publication accepts drafts and requires six translations, or five for 2025',async()=>{
  const dir=await fixture();
  try {
    const posts=path.join(dir,'website/outstatic/content/2026-posts');
    await writeFile(path.join(posts,'e2e.en.mdx'),article('draft'));
    expect((await run(dir,'content')).code).toBe(0);
    await writeFile(path.join(posts,'e2e.en.mdx'),article());
    const incomplete=await run(dir,'content');
    expect(incomplete.code).not.toBe(0);expect(incomplete.text).toContain('ko');
    for(const locale of locales) await writeFile(path.join(posts,`e2e.${locale}.mdx`),article());
    expect((await run(dir,'content')).code).toBe(0);
    await writeFile(path.join(posts,'e2e.ko.mdx'),article().replace('/e2e.webp','/different.webp'));
    const mismatch=await run(dir,'content');expect(mismatch.code).not.toBe(0);expect(mismatch.text).toContain('coverImage');
    await rm(posts,{recursive:true});
    const archive=path.join(dir,'website/outstatic/content/2025-posts');await mkdir(archive);
    for(const locale of locales.slice(0,-1)) await writeFile(path.join(archive,`e2e.${locale}.mdx`),article());
    expect((await run(dir,'content')).code).toBe(0);
    await writeFile(path.join(archive,'e2e.ko.mdx'),article());
    expect((await run(dir,'content')).code).not.toBe(0);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('editorial PR command permits content commits and rejects code, forks and developer branches',async()=>{
  const dir=await fixture();
  const git=(...args:string[])=>exec('git',args,{cwd:dir});
  try {
    await git('init','-q');await git('config','user.name','E2E');await git('config','user.email','e2e@example.invalid');
    await mkdir(path.join(dir,'website/src'));
    await writeFile(path.join(dir,'website/src/developer-owned.md'),article('draft'));
    await git('add','cms/publication','package.json','website/src');await git('commit','-qm','Base');
    const base=(await git('rev-parse','HEAD')).stdout.trim();
    await git('branch','cms');
    const contentKey=generateContentKey('posts','e2e');
    const editorialBranch=branchFromContentKey(contentKey);
    expect(editorialBranch).toBe('cms-editorial/posts/e2e');
    expect(contentKeyFromBranch(editorialBranch)).toBe(contentKey);
    // Exercise the actual Decap branch helper against Git's ref namespace.
    // The existing production content branch must coexist with a saved draft.
    await expect(git('branch','cms/posts/e2e')).rejects.toThrow();
    await git('checkout','-qb',editorialBranch);
    await writeFile(path.join(dir,'website/outstatic/content/2026-posts/e2e.en.mdx'),article('draft'));
    await git('add','website');await git('commit','-qm','Draft');
    const head=(await git('rev-parse','HEAD')).stdout.trim();
    const env={CMS_PR_HEAD:editorialBranch,CMS_PR_HEAD_REPO:'pyconhk/pyconhk-website',CMS_PR_BASE_REPO:'pyconhk/pyconhk-website',CMS_PR_BASE_SHA:base,CMS_PR_HEAD_SHA:head};
    expect((await run(dir,'editorial',env)).code).toBe(0);
    for(const patch of [{CMS_PR_HEAD:'alex-dev'},{CMS_PR_HEAD:'cms/posts/e2e'},{CMS_PR_HEAD:'cms-editorial-spoof/posts/e2e'},{CMS_PR_HEAD_REPO:'another/repo'}])expect((await run(dir,'editorial',{...env,...patch})).code).not.toBe(0);
    await git('mv','website/src/developer-owned.md','website/outstatic/content/2026-posts/renamed.en.mdx');
    await git('commit','-qm','Rename developer content into news folder');
    expect((await run(dir,'editorial',{...env,CMS_PR_HEAD_SHA:(await git('rev-parse','HEAD')).stdout.trim()})).code).not.toBe(0);
    await git('mv','website/outstatic/content/2026-posts/renamed.en.mdx','website/src/developer-owned.md');
    await git('commit','-qm','Restore developer content');
    await mkdir(path.join(dir,'website/outstatic/content/2026-conference'));
    await writeFile(path.join(dir,'website/outstatic/content/2026-conference/settings.en.json'),'{}');
    await git('add','website');await git('commit','-qm','Conference settings change');
    const conferenceChange=(await run(dir,'editorial',{...env,CMS_PR_HEAD_SHA:(await git('rev-parse','HEAD')).stdout.trim()}));
    expect(conferenceChange.code).not.toBe(0);
    expect(conferenceChange.text).toContain('only news and media paths');
    await rm(path.join(dir,'website/outstatic/content/2026-conference/settings.en.json'));
    await git('add','website');await git('commit','-qm','Remove conference settings change');
    await mkdir(path.join(dir,'website/outstatic/content/2026-posts/nested'));
    await writeFile(path.join(dir,'website/outstatic/content/2026-posts/nested/settings.en.mdx'),article());
    await writeFile(path.join(dir,'website/outstatic/content/2026-posts/settings.json'),'{}');
    await git('add','website');await git('commit','-qm','Non-news files in the news folder');
    expect((await run(dir,'editorial',{...env,CMS_PR_HEAD_SHA:(await git('rev-parse','HEAD')).stdout.trim()})).code).not.toBe(0);
    await writeFile(path.join(dir,'app.ts'),'export const injected = true;');await git('add','app.ts');await git('commit','-qm','Code change');
    expect((await run(dir,'editorial',{...env,CMS_PR_HEAD_SHA:(await git('rev-parse','HEAD')).stdout.trim()})).code).not.toBe(0);
  } finally {await rm(dir,{recursive:true,force:true});}
});
