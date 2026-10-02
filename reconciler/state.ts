export type Pending = { id: string; since: number; websiteDispatched?: boolean };
export type State = { pending?: Pending; dirty: boolean; repairCompletion?: boolean };
export interface Adapter {
  active(): Promise<boolean>;
  status(id: string): Promise<'active' | 'completed' | 'failed' | 'missing'>;
  changed(): Promise<boolean>;
  dispatch(id: string): Promise<void>;
  save(state: State): Promise<void>;
}

/** Serialized by the environment's Durable Object. Never acknowledge desired inputs:
 * only the uploaded, verified site's manifest can acknowledge content. */
export async function reconcile(
  state: State,
  adapter: Adapter,
  now = Date.now(),
  id: string = crypto.randomUUID()
) {
  let retry = false;
  if (state.pending) {
    const status = await adapter.status(state.pending.id);
    // Dispatch responses can be lost and Actions indexing is eventual. Keep the
    // reservation until a run is visible or the indexing grace period expires.
    if (status === 'active' || (status === 'missing' && now - state.pending.since < 30 * 60_000)) {
      state.dirty = true;
      await adapter.save(state);
      return;
    }
    retry = status === 'failed';
    state.pending = undefined;
  }
  if (await adapter.active()) {
    state.dirty = true;
    await adapter.save(state);
    return;
  }
  state.dirty = (await adapter.changed()) || retry;
  if (!state.dirty) {
    await adapter.save(state);
    return;
  }
  state.pending = { id, since: now };
  // Reserve durably BEFORE the network side effect, including ambiguous failures.
  await adapter.save(state);
  try {
    await adapter.dispatch(id);
  } catch (error) {
    if ((error as { rejected?: boolean }).rejected) {
      state.pending = undefined;
      await adapter.save(state);
    }
    throw error;
  }
}
