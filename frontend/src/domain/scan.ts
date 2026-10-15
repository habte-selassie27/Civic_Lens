/**
 * Bounded-concurrency mapping for read scans.
 *
 * The activity and stats pages read one record per commitment over a bounded
 * window. Firing every read at once hammers the RPC; firing them one at a
 * time takes minutes. mapLimit runs at most `limit` at a time and NEVER
 * rejects: each item resolves to a fulfilled-or-rejected result, so one bad
 * record cannot hide the rest of the window.
 */

export type ScanResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export async function mapLimit<In, Out>(
  items: readonly In[],
  limit: number,
  fn: (item: In, index: number) => Promise<Out>,
): Promise<Array<ScanResult<Out>>> {
  const results = new Array<ScanResult<Out>>(items.length);
  const workers = Math.max(1, Math.min(limit, items.length));
  let next = 0;

  const worker = async () => {
    for (;;) {
      const index = next++;
      if (index >= items.length) return;
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
