/** Tunables for the fake network layer. Tests set latency to 0 for determinism. */
export const mockConfig = {
  minLatency: 150,
  maxLatency: 550,
  /** Probability that sending a message fails, so the retry path is visible. */
  sendFailureRate: 0.05,
};

export const configureMockApi = (patch: Partial<typeof mockConfig>) => Object.assign(mockConfig, patch);

export class MockApiError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'MockApiError';
  }
}

/** Simulates a network round-trip: latency, optional failure, and a cloned response. */
export async function request<T>(handler: () => T, failureRate = 0): Promise<T> {
  const { minLatency, maxLatency } = mockConfig;
  const latency = minLatency + Math.random() * (maxLatency - minLatency);
  if (latency > 0) await new Promise((resolve) => setTimeout(resolve, latency));
  if (failureRate > 0 && Math.random() < failureRate) throw new MockApiError();
  return structuredClone(handler());
}
