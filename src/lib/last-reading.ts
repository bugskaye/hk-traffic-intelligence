export function nextReading<T extends { ok: boolean }>(current: T | null, incoming: T): T {
  if (incoming.ok) return incoming
  if (current?.ok) return current
  return incoming
}

export function takeReading<T extends { ok: boolean }>(
  current: T | null,
  currentGeneration: number,
  incoming: T,
  incomingGeneration: number,
  stale: boolean,
): T | null {
  if (incoming.ok) {
    if (current?.ok && incomingGeneration < currentGeneration) return current
    return incoming
  }
  if (stale) return current
  return nextReading(current, incoming)
}

export function applyLiveBody<T extends { ok: boolean }>(
  state: { data: T | null; error: string | null; generation: number },
  incoming: T,
  incomingGeneration: number,
  stale: boolean,
  failure: string,
): { data: T | null; error: string | null; generation: number } {
  const data = takeReading(state.data, state.generation, incoming, incomingGeneration, stale)
  if (incoming.ok) {
    if (data !== incoming) return state
    return { data, error: null, generation: incomingGeneration }
  }
  if (data?.ok) return { data, error: stale ? state.error : failure, generation: state.generation }
  if (stale) return { data, error: state.error, generation: state.generation }
  return { data, error: failure, generation: incomingGeneration }
}
