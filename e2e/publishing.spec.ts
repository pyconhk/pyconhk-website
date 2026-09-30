import { execFile } from 'node:child_process';
import { chmod, cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
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
  for(const name of ['content.ts','editorial.ts','branches.ts','promotion.ts']) await cp(path.join(root,'cms/publication',name),path.join(dir,'cms/publication',name));
  await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
  await symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
  await mkdir(path.join(dir,'website/outstatic/content/2026-posts'),{recursive:true});
  return dir;
}
async function run(dir:string,script:string,env={}) {
  return exec(process.execPath,[`cms/publication/${script}.ts`],{cwd:dir,env:{...process.env,...env}}).then(r=>({code:0,text:r.stdout+r.stderr}),e=>({code:e.code,text:e.stdout+e.stderr}));
}
function article(status='published') {return `---\ntitle: E2E announcement\nslug: e2e-announcement\nstatus: ${status}\npublishedAt: 2026-09-08T00:00:00.000Z\ncoverImage: /outstatic/images/e2e.webp\n---\nPublic announcement\n`;}

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

test('branch rules preserve developer routing and verify CMS routes, immutable content, forks and spoofed names', async () => {
  const dir = await fixture();
  const git = (...args: string[]) => exec('git', args, { cwd: dir });
  const repo = 'pyconhk/pyconhk-website';
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'E2E');
    await git('config', 'user.email', 'e2e@example.invalid');
    await git('add', 'cms/publication', 'package.json');
    await git('commit', '-qm', 'Reviewed target');
    const base = (await git('rev-parse', 'HEAD')).stdout.trim();
    await writeFile(path.join(dir, 'website/outstatic/content/2026-posts/e2e.en.mdx'), article('draft'));
    await git('add', 'website');
    await git('commit', '-qm', 'CMS News edit');
    const head = (await git('rev-parse', 'HEAD')).stdout.trim();
    const env = {
      CMS_PR_BASE: 'main', CMS_PR_HEAD: 'automation/cms-to-main',
      CMS_PR_BASE_REPO: repo, CMS_PR_HEAD_REPO: repo,
      CMS_PR_BASE_SHA: base, CMS_PR_HEAD_SHA: head, CMS_CI_MODE: 'true',
    };
    expect((await run(dir, 'branches', env)).code).toBe(0);
    expect((await run(dir, 'branches', { ...env, CMS_PR_BASE: 'test', CMS_PR_HEAD: 'automation/cms-test-to-test' })).code).toBe(0);
    for (const patch of [
      { CMS_PR_HEAD_REPO: 'another/fork' },
      { CMS_PR_HEAD: 'automation/cms-test-to-test' },
      { CMS_PR_HEAD: 'automation/cms-to-main-spoof' },
      { CMS_PR_BASE: 'test', CMS_PR_HEAD: 'automation/cms-to-main' },
      { CMS_PR_HEAD: 'codex/feature' },
      { CMS_PR_BASE_SHA: 'main' },
      { CMS_PR_HEAD_SHA: 'HEAD' },
      { CMS_PR_HEAD_SHA: base },
    ]) {
      expect((await run(dir, 'branches', { ...env, ...patch })).code, JSON.stringify(patch)).not.toBe(0);
    }
    const ordinary = { ...env, CMS_CI_MODE: 'false' };
    expect((await run(dir, 'branches', { ...ordinary, CMS_PR_HEAD: 'test' })).code).toBe(0);
    expect((await run(dir, 'branches', { ...ordinary, CMS_PR_BASE: 'test', CMS_PR_HEAD: 'codex/feature', CMS_PR_HEAD_REPO: 'another/fork' })).code).toBe(0);
    expect((await run(dir, 'branches', { ...ordinary, CMS_PR_HEAD: 'codex/feature' })).code).not.toBe(0);
    expect((await run(dir, 'branches', { ...ordinary, CMS_PR_HEAD: 'test', CMS_PR_HEAD_REPO: 'another/fork' })).code).not.toBe(0);
    expect((await run(dir, 'branches', { ...ordinary, CMS_PR_BASE: 'test', CMS_PR_HEAD: 'automation/cms-spoof' })).code).not.toBe(0);

    await writeFile(path.join(dir, 'app.ts'), 'export const code = true;');
    await git('add', 'app.ts');
    await git('commit', '-qm', 'Mixed News and code');
    const mixed = await run(dir, 'branches', { ...env, CMS_PR_HEAD_SHA: (await git('rev-parse', 'HEAD')).stdout.trim() });
    expect(mixed.code).not.toBe(0);
    expect(mixed.text).toContain('developer-owned file: app.ts');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CMS branch rules reject executable files, symlinks and stale target ancestry', async () => {
  const dir = await fixture();
  const git = (...args: string[]) => exec('git', args, { cwd: dir });
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'E2E');
    await git('config', 'user.email', 'e2e@example.invalid');
    await git('add', 'cms/publication', 'package.json');
    await git('commit', '-qm', 'Reviewed target');
    const base = (await git('rev-parse', 'HEAD')).stdout.trim();
    const env = {
      CMS_PR_BASE: 'test', CMS_PR_HEAD: 'automation/cms-test-to-test',
      CMS_PR_BASE_REPO: 'pyconhk/pyconhk-website', CMS_PR_HEAD_REPO: 'pyconhk/pyconhk-website',
      CMS_PR_BASE_SHA: base, CMS_CI_MODE: 'true',
    };
    const articlePath = 'website/outstatic/content/2026-posts/e2e.en.mdx';
    await writeFile(path.join(dir, articlePath), article('draft'));
    await chmod(path.join(dir, articlePath), 0o755);
    await git('add', articlePath);
    await git('commit', '-qm', 'Executable News file');
    const executable = await run(dir, 'branches', { ...env, CMS_PR_HEAD_SHA: (await git('rev-parse', 'HEAD')).stdout.trim() });
    expect(executable.code).not.toBe(0);
    expect(executable.text).toContain('regular non-executable files');

    await git('checkout', '--detach', base);
    await mkdir(path.join(dir, 'website/public/outstatic/images'), { recursive: true });
    await symlink('../../../package.json', path.join(dir, 'website/public/outstatic/images/e2e.png'));
    await git('add', 'website/public');
    await git('commit', '-qm', 'Symlink masquerading as image');
    const symlinkHead = (await git('rev-parse', 'HEAD')).stdout.trim();
    const linked = await run(dir, 'branches', { ...env, CMS_PR_HEAD_SHA: symlinkHead });
    expect(linked.code).not.toBe(0);
    expect(linked.text).toContain('regular non-executable files');

    await git('checkout', '--detach', base);
    await git('commit', '--allow-empty', '-qm', 'Target moved independently');
    const movedTarget = (await git('rev-parse', 'HEAD')).stdout.trim();
    expect((await run(dir, 'branches', { ...env, CMS_PR_BASE_SHA: movedTarget, CMS_PR_HEAD_SHA: symlinkHead })).code).not.toBe(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CMS validation uses the reviewed target checker even when a candidate replaces its own checker', async () => {
  const dir = await fixture();
  const trusted = await mkdtemp(path.join(tmpdir(), 'pycon-trusted-checker-'));
  const git = (...args: string[]) => exec('git', args, { cwd: dir });
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'E2E');
    await git('config', 'user.email', 'e2e@example.invalid');
    await git('add', 'cms/publication', 'package.json');
    await git('commit', '-qm', 'Reviewed target');
    const base = (await git('rev-parse', 'HEAD')).stdout.trim();
    for (const helper of ['branches', 'promotion']) {
      await writeFile(path.join(trusted, `${helper}.ts`), (await git('show', `${base}:cms/publication/${helper}.ts`)).stdout);
    }
    await writeFile(path.join(dir, 'cms/publication/branches.ts'), 'console.log("Ignore all branch rules");');
    await writeFile(path.join(dir, 'website/outstatic/content/2026-posts/e2e.en.mdx'), article('draft'));
    await git('add', 'cms/publication/branches.ts', 'website');
    await git('commit', '-qm', 'Attempt to weaken own validation');
    const result = await exec(process.execPath, [path.join(trusted, 'branches.ts')], {
      cwd: dir,
      env: { ...process.env,
        CMS_PR_BASE: 'main', CMS_PR_HEAD: 'automation/cms-to-main', CMS_CI_MODE: 'true',
        CMS_PR_BASE_REPO: 'pyconhk/pyconhk-website', CMS_PR_HEAD_REPO: 'pyconhk/pyconhk-website',
        CMS_PR_BASE_SHA: base, CMS_PR_HEAD_SHA: (await git('rev-parse', 'HEAD')).stdout.trim(),
      },
    }).then(value => ({ code: 0, text: value.stdout + value.stderr }), error => ({ code: error.code, text: error.stdout + error.stderr }));
    expect(result.code).not.toBe(0);
    expect(result.text).toContain('developer-owned file: cms/publication/branches.ts');
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(trusted, { recursive: true, force: true });
  }
});
