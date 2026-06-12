import { useState, useEffect, useCallback } from 'react';

export interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function doFetch() {
      try {
        const result = await fetchFn();
        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    doFetch();

    return () => {
      active = false;
    };
  }, [fetchFn, trigger]);

  return { data, loading, error, refetch, setData };
}
export default useFetch;
