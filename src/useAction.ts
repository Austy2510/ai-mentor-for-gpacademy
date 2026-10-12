import { useCallback, useState } from "react";

/** Runs an async action, tracking busy state and the last error. */
export function useAction<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const run = useCallback(
    async (...args: A) => {
      setBusy(true);
      setError(null);
      try {
        await fn(...args);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setBusy(false);
      }
    },
    [fn],
  );
  return { run, busy, error };
}
