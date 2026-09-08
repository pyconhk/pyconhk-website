import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
const exec = promisify(execFile);
const root=fileURLToPath(new URL('..',import.meta.url));
const locales=['en','zh-hk','zh-hant','zh-hans','ja','ko'];
async function fixture() {
  const dir=await mkdtemp(path.join(tmpdir(),'pycon-publishing-'));
  await mkdir(path.join(dir,'scripts'));
  for(const name of ['check-cms-content-locales.ts','check-cms-pr.ts']) await cp(path.join(root,'scripts',name),path.join(dir,'scripts',name));
  await writeFile(path.join(dir,'package.json'),'{"type":"module"}');
  await symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
  await mkdir(path.join(dir,'website/outstatic/content/2026-posts'),{recursive:true});
  return dir;
}
async function run(dir:string,script:string,env={}) {
  return exec(process.execPath,[`scripts/${script}.ts`],{cwd:dir,env:{...process.env,...env}}).then(r=>({code:0,text:r.stdout+r.stderr}),e=>({code:e.code,text:e.stdout+e.stderr}));
}
function article(status='published') {return `---\ntitle: E2E announcement\nslug: e2e-announcement\nstatus: ${status}\npublishedAt: 2026-09-08T00:00:00.000Z\ncoverImage: /outstatic/images/e2e.webp\n---\nPublic announcement\n`;}

test('editorial publication accepts drafts and requires six translations, or five for 2025',async()=>{
  const dir=await fixture();
  try {
    const posts=path.join(dir,'website/outstatic/content/2026-posts');
    await writeFile(path.join(posts,'e2e.en.mdx'),article('draft'));
    expect((await run(dir,'check-cms-content-locales')).code).toBe(0);
    await writeFile(path.join(posts,'e2e.en.mdx'),article());
    const incomplete=await run(dir,'check-cms-content-locales');
    expect(incomplete.code).not.toBe(0);expect(incomplete.text).toContain('ko');
    for(const locale of locales) await writeFile(path.join(posts,`e2e.${locale}.mdx`),article());
    expect((await run(dir,'check-cms-content-locales')).code).toBe(0);
    await writeFile(path.join(posts,'e2e.ko.mdx'),article().replace('/e2e.webp','/different.webp'));
    const mismatch=await run(dir,'check-cms-content-locales');expect(mismatch.code).not.toBe(0);expect(mismatch.text).toContain('coverImage');
    await rm(posts,{recursive:true});
    const archive=path.join(dir,'website/outstatic/content/2025-posts');await mkdir(archive);
    for(const locale of locales.slice(0,-1)) await writeFile(path.join(archive,`e2e.${locale}.mdx`),article());
    expect((await run(dir,'check-cms-content-locales')).code).toBe(0);
    await writeFile(path.join(archive,'e2e.ko.mdx'),article());
    expect((await run(dir,'check-cms-content-locales')).code).not.toBe(0);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('editorial PR command permits content commits and rejects code, forks and developer branches',async()=>{
  const dir=await fixture();
  const git=(...args:string[])=>exec('git',args,{cwd:dir});
  try {
    await git('init','-q');await git('config','user.name','E2E');await git('config','user.email','e2e@example.invalid');
    await git('add','scripts','package.json');await git('commit','-qm','Base');
    const base=(await git('rev-parse','HEAD')).stdout.trim();
    await writeFile(path.join(dir,'website/outstatic/content/2026-posts/e2e.en.mdx'),article('draft'));
    await git('add','website');await git('commit','-qm','Draft');
    const head=(await git('rev-parse','HEAD')).stdout.trim();
    const env={CMS_PR_HEAD:'cms/posts/e2e',CMS_PR_HEAD_REPO:'pyconhk/pyconhk-website',CMS_PR_BASE_REPO:'pyconhk/pyconhk-website',CMS_PR_BASE_SHA:base,CMS_PR_HEAD_SHA:head};
    expect((await run(dir,'check-cms-pr',env)).code).toBe(0);
    for(const patch of [{CMS_PR_HEAD:'alex-dev'},{CMS_PR_HEAD_REPO:'another/repo'}])expect((await run(dir,'check-cms-pr',{...env,...patch})).code).not.toBe(0);
    await writeFile(path.join(dir,'app.ts'),'export const injected = true;');await git('add','app.ts');await git('commit','-qm','Code change');
    expect((await run(dir,'check-cms-pr',{...env,CMS_PR_HEAD_SHA:(await git('rev-parse','HEAD')).stdout.trim()})).code).not.toBe(0);
  } finally {await rm(dir,{recursive:true,force:true});}
});
