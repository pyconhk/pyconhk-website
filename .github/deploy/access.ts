/** Read existing deployment-token policy metadata only. Never print credentials. */
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error('Existing deployment credential is unavailable');
const account = '043801e2f5b9cf2685593bd9098e98b1';
async function read(endpoint: string) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json();
  return { status: response.status, ok: response.ok && payload.success, result: payload.result };
}
const verification = await read('user/tokens/verify');
console.log(JSON.stringify({ operation: 'verify-existing-token', status: verification.status, valid: Boolean(verification.ok) }));
if (verification.ok && verification.result?.id) {
  const details = await read(`user/tokens/${verification.result.id}`);
  console.log(JSON.stringify({ operation: 'read-existing-token-policy', status: details.status,
    policies: details.ok ? details.result?.policies?.map((policy: { effect: string; permission_groups: { name: string }[]; resources: unknown }) => ({
      effect: policy.effect, permissions: policy.permission_groups?.map(group => group.name), resources: policy.resources,
    })) : undefined,
  }));
}
const zones = await read(`zones?name=pycon.hk&per_page=50`);
console.log(JSON.stringify({ operation: 'find-existing-zone', status: zones.status,
  zones: zones.ok ? zones.result?.map((zone: { id: string; name: string; account: { id: string; name: string } }) => ({
    id: zone.id, name: zone.name, account: zone.account,
  })) : undefined,
  deploymentAccount: account,
}));
