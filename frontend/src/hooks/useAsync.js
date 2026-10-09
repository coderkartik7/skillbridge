import { useState, useCallback } from 'react';

/**
 * Custom hook to execute asynchronous functions with loading, error, and data tracking.
 * @param {Function} asyncFn - The async function to execute
 * @param {boolean} immediate - Whether to execute immediately on mount (default false)
 * @returns {{ execute: Function, loading: boolean, error: string | null, data: any, setData: Function }}
 */
export function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...params);
        setData(result);
        return result;
      } catch (err) {
        const message = err?.message || 'An unexpected error occurred.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, data, setData, setError };
}

export default useAsync;
