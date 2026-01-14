import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (executionParams?: any) => Promise<T>;
  refetch: () => Promise<T>;
}

type ApiFunction<T = any> = (params?: any) => Promise<T>;

export const useApi = <T = any>(
  apiFunction: ApiFunction<T>,
  params: any = null,
  executeOnMount: boolean = true
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (executionParams: any = params): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction(executionParams);
      setData(response);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
  }, [execute, executeOnMount]);

  const refetch = useCallback((): Promise<T> => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};
