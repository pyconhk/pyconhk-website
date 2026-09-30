import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const routes = { cms: 'main', 'cms-test': 'test' };
const repository = 'pyconhk/pyconhk-website';

export function isNewsFile(file) {
  return /^website\/outstatic\/content\/2025-posts\/[^/]+\.(en|zh-hk|zh-hant|zh-hans|ja)\.mdx$/u.test(file)
    || /^website\/outstatic\/content\/2026-posts\/[^/]+\.(en|zh-hk|zh-hant|zh-hans|ja|ko)\.mdx$/u.test(file)
    || /^website\/public\/outstatic\/images\/[^/]+\.(png|jpg|jpeg|webp|gif|avif)$/u.test(file);
}

function git(directory, args) {
  return execFileSync('git', args, { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function ancestor(directory, older, newer) {
  try { git(directory, ['merge-base', '--is-ancestor', older, newer]); return true; }
  catch (error) { if (error.status === 1) return false; throw error; }
}

export function assertBoundary(directory, base, head) {
  const changed = git(directory, ['diff', '--no-renames', '--name-only', '-z', base, head]).split('\0').filter(Boolean);
  const invalid = changed.filter(file => !isNewsFile(file));
  if (invalid.length) throw new Error(`Changes outside News content: ${invalid.join(', ')}`);
  // Website source and tooling remain in this repository. Only CMS-owned files
  // must be plain data, never executable files, symlinks or submodules.
  for (const entry of git(directory, ['ls-tree', '-r', '-z', head]).split('\0').filter(Boolean)) {
    const [metadata, file] = entry.split('\t');
    if (isNewsFile(file) && metadata.split(' ')[0] !== '100644') {
      throw new Error(`Only regular non-executable files may be published: ${file}`);
    }
  }
}

export function prepareCandidate(directory, source, target, refs = { source, target }) {
  if (routes[source] !== target) throw new Error(`Invalid publication route: ${source} → ${target}`);
  const sourceSha = git(directory, ['rev-parse', refs.source]);
  const targetSha = git(directory, ['rev-parse', refs.target]);
  if (ancestor(directory, sourceSha, targetSha)) return null;
  const base = git(directory, ['merge-base', targetSha, sourceSha]);
  assertBoundary(directory, base, sourceSha);
  git(directory, ['checkout', '--detach', targetSha]);
  try {
    git(directory, ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'merge', '--no-ff', '--no-commit', sourceSha]);
    if (!git(directory, ['diff', '--cached', '--name-only'])) {
      git(directory, ['merge', '--abort']);
      return null;
    }
    git(directory, ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'commit', '-m', `Promote ${source} News (${sourceSha.slice(0, 7)})`]);
  } catch (error) {
    try { git(directory, ['merge', '--abort']); } catch { /* A completed commit has no merge to abort. */ }
    throw new Error(`Cannot safely combine ${source} with ${target}; published content is unchanged. ${error.stderr || error.message}`);
  }
  const candidateSha = git(directory, ['rev-parse', 'HEAD']);
  assertBoundary(directory, targetSha, candidateSha);
  return { source, target, sourceSha, targetSha, candidateSha };
}

export function assertCurrentTarget(candidate, actualSha) {
  if (actualSha !== candidate.targetSha) throw new Error(`${candidate.target} changed during validation; the next run will rebuild the candidate.`);
}

function assertCandidate(directory, candidate) {
  if (routes[candidate.source] !== candidate.target) throw new Error('Invalid publication route');
  for (const field of ['sourceSha', 'targetSha', 'candidateSha']) {
    if (!/^[a-f0-9]{40}$/u.test(candidate[field])) throw new Error(`Invalid ${field}`);
  }
  if (git(directory, ['rev-parse', 'HEAD']) !== candidate.candidateSha || git(directory, ['status', '--porcelain'])) {
    throw new Error('Candidate working tree changed');
  }
  const parents = git(directory, ['show', '-s', '--format=%P', candidate.candidateSha]).split(' ');
  if (parents[0] !== candidate.targetSha || parents[1] !== candidate.sourceSha || parents.length !== 2) {
    throw new Error('Candidate must preserve the pinned target and source history');
  }
  assertBoundary(directory, git(directory, ['merge-base', candidate.targetSha, candidate.sourceSha]), candidate.sourceSha);
  assertBoundary(directory, candidate.targetSha, candidate.candidateSha);
}

async function api(endpoint, method = 'GET', body) {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is required for automatic publication');
  const response = await fetch(`https://api.github.com/repos/${repository}/${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(`GitHub ${method} ${endpoint}: ${response.status} ${data.message || ''}`), { status: response.status });
  return data;
}

async function readRemoteRef(ref) {
  try { return (await api(`git/ref/heads/${ref}`)).object.sha; }
  catch (error) { if (error.status === 404) return null; throw error; }
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

async function stageCandidate(directory, candidate) {
  assertCandidate(directory, candidate);
  assertCurrentTarget(candidate, await readRemoteRef(candidate.target));
  const branch = `automation/${candidate.source}-to-${candidate.target}`;
  const previousHead = await readRemoteRef(branch);
  // No credential persists in the candidate checkout. The helper reads GH_TOKEN
  // only in this trusted staging step; CI has read-only permissions and no token.
  git(directory, ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential',
    'push', `--force-with-lease=refs/heads/${branch}:${previousHead || ''}`, 'origin', `${candidate.candidateSha}:refs/heads/${branch}`]);
  const matches = await api(`pulls?state=open&base=${candidate.target}&head=${encodeURIComponent(`pyconhk:${branch}`)}`);
  const description = {
    title: `Publish ${candidate.source} News to ${candidate.target}`,
    body: `Automatically publishes CMS News after full website CI succeeds.\n\nSource: \`${candidate.sourceSha}\`\nTarget before validation: \`${candidate.targetSha}\`\nCandidate: \`${candidate.candidateSha}\`\n\n[Publication run](${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID})`,
  };
  const pull = matches.length
    ? await api(`pulls/${matches[0].number}`, 'PATCH', description)
    : await api('pulls', 'POST', { ...description, head: branch, base: candidate.target });
  const staged = { ...candidate, branch, pullNumber: pull.number };
  output('candidate', JSON.stringify(staged));
  output('candidate_sha', candidate.candidateSha);
  output('target_sha', candidate.targetSha);
  output('head_branch', branch);
  output('target_branch', candidate.target);
  console.log(`Staged ${candidate.candidateSha} for full CI: ${pull.html_url}`);
}

export function assertValidation(candidate, result, validatedSha) {
  if (result !== 'success' || validatedSha !== candidate.candidateSha) {
    throw new Error('Successful full CI on this exact candidate is required before publication');
  }
}

async function finalizeCandidate(directory, candidate) {
  assertCandidate(directory, candidate);
  assertValidation(candidate, process.env.CMS_VALIDATION_RESULT, process.env.CMS_VALIDATED_SHA);
  if (!Number.isSafeInteger(candidate.pullNumber) || candidate.pullNumber < 1) throw new Error('Invalid publication pull request');
  const branch = `automation/${candidate.source}-to-${candidate.target}`;
  if (candidate.branch !== branch) throw new Error('Unexpected publication branch');
  const pull = await api(`pulls/${candidate.pullNumber}`);
  if (pull.head.sha !== candidate.candidateSha || pull.head.ref !== branch || pull.base.ref !== candidate.target || pull.head.repo.full_name !== repository) {
    throw new Error('Publication pull request no longer matches the validated candidate');
  }
  assertCurrentTarget(candidate, await readRemoteRef(candidate.target));
  // GITHUB_TOKEN-created PRs do not start another PR workflow. These records
  // describe the full reusable PR workflow that completed for this exact SHA.
  for (const name of ['Branch Rules', 'Validate Monorepo']) {
    await api('check-runs', 'POST', {
      name, head_sha: candidate.candidateSha, status: 'completed', conclusion: 'success',
      completed_at: new Date().toISOString(),
      details_url: `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`,
      output: { title: `${name} passed`, summary: `Full PR workflow passed for candidate ${candidate.candidateSha} against target ${candidate.targetSha}.` },
    });
  }
  for (let attempt = 0; attempt < 6; attempt++) {
    assertCurrentTarget(candidate, await readRemoteRef(candidate.target));
    try {
      const result = await api(`pulls/${candidate.pullNumber}/merge`, 'PUT', { sha: candidate.candidateSha, merge_method: 'merge' });
      if (!result.merged) throw new Error(result.message || 'GitHub declined the merge');
      output('promoted', 'true');
      output('merged_sha', result.sha);
      console.log(`Published ${candidate.sourceSha} via PR #${candidate.pullNumber}; ${candidate.target} is ${result.sha}`);
      if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Published **${candidate.source} → ${candidate.target}** via [PR #${candidate.pullNumber}](${pull.html_url}).\n\nThe website deployment job follows this merge explicitly.\n`);
      return;
    } catch (error) {
      if (![405, 409].includes(error.status) || attempt === 5) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function main() {
  const [command, directoryArg, source, target] = process.argv.slice(2);
  const directory = path.resolve(directoryArg || 'website');
  const stateFile = path.join(process.env.RUNNER_TEMP || '/tmp', 'cms-publication.json');
  if (command === 'prepare') {
    if (routes[source] !== target) throw new Error('Unknown publication route');
    const available = git(directory, ['ls-remote', '--heads', 'origin', `refs/heads/${source}`]);
    if (!available) { console.log(`${source} is not configured; skipping.`); return; }
    git(directory, ['fetch', '--no-tags', 'origin', `+refs/heads/${source}:refs/remotes/origin/${source}`, `+refs/heads/${target}:refs/remotes/origin/${target}`]);
    const candidate = prepareCandidate(directory, source, target, { source: `origin/${source}`, target: `origin/${target}` });
    if (!candidate) { console.log(`${source} has no new News content.`); return; }
    fs.writeFileSync(stateFile, JSON.stringify(candidate));
    output('changed', 'true');
    console.log(`Prepared ${candidate.candidateSha} from ${candidate.sourceSha}`);
  } else if (command === 'stage') {
    await stageCandidate(directory, JSON.parse(fs.readFileSync(stateFile, 'utf8')));
  } else if (command === 'finalize') {
    await finalizeCandidate(directory, JSON.parse(process.env.CMS_PUBLICATION_CANDIDATE || '{}'));
  } else throw new Error('Expected prepare, stage or finalize');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
