import { useState, useEffect, useCallback, useRef } from 'react';

export interface LazySearchOptions<T> {
  fetchFn: (params: {
    page: number;
    limit: number;
    searchQuery?: string;
    [key: string]: any;
  }) => Promise<{
    data?: {
      data?: {
        result?: T[];
        meta?: {
          totalPages?: number;
          totalItems?: number;
          currentPage?: number;
        };
      };
      result?: T[];
      meta?: {
        totalPages?: number;
        totalItems?: number;
        currentPage?: number;
      };
    };
    result?: T[];
    meta?: {
      totalPages?: number;
      totalItems?: number;
      currentPage?: number;
    };
  }>;
  debounceDelay?: number;
  pageSize?: number;
  loadOnMount?: boolean;
  enabled?: boolean;
  additionalParams?: Record<string, any>;
  transformFn?: (item: any) => T;
}

export interface LazySearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  items: T[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
}

export function useLazySearch<T = any>(options: LazySearchOptions<T>): LazySearchReturn<T> {
  const {
    fetchFn,
    debounceDelay = 500,
    pageSize = 10,
    loadOnMount = false,
    enabled = true,
    additionalParams = {},
    transformFn
  } = options;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const isInitialLoad = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
        setItems([]);
      }
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [searchQuery, debounceDelay, enabled]);

  const fetchData = useCallback(
    async (page: number, query: string, append: boolean = false) => {
      if (!enabled) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        const params: any = {
          page,
          limit: pageSize,
          ...additionalParams
        };

        if (query && query.trim()) {
          params.name = query.trim();
        }

        const response = await fetchFn(params);

        let newItems: any[] = [];
        let meta: any = {};

        if (response?.data?.data?.result) {
          newItems = response.data.data.result;
          meta = response.data.data.meta || {};
        } else if (response?.data?.result) {
          newItems = response.data.result;
          meta = response.data.meta || {};
        } else if (response?.data?.data) {
          newItems = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response?.data)) {
          newItems = response.data;
        } else if (Array.isArray(response)) {
          newItems = response;
        }

        if (transformFn && newItems.length > 0) {
          newItems = newItems.map(transformFn);
        }

        if (abortController.signal.aborted) {
          return;
        }

        if (append) {
          setItems(prev => [...prev, ...newItems]);
        } else {
          setItems(newItems);
        }

        const totalPagesCount =
          meta.totalPages || Math.ceil((meta.totalItems || newItems.length) / pageSize);
        setTotalPages(totalPagesCount);
        setHasMore(page < totalPagesCount && newItems.length === pageSize);
        setCurrentPage(page);
      } catch (err: any) {
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        console.error('Error fetching data:', err);
        setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');

        if (!append) {
          setItems([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [enabled, fetchFn, pageSize, additionalParams, transformFn]
  );

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    if (loadOnMount && isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchData(1, '', false);
    }
  }, [enabled, loadOnMount]);

  useEffect(() => {
    if (!enabled) return;

    const query = debouncedSearch.trim();

    if (!query && !loadOnMount) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    fetchData(currentPage === 1 || searchQuery !== debouncedSearch ? 1 : currentPage, query, false);
  }, [debouncedSearch, enabled]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !enabled) return;

    const nextPage = currentPage + 1;
    fetchData(nextPage, debouncedSearch, true);
  }, [loading, hasMore, enabled, currentPage, debouncedSearch, fetchData]);

  const reset = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    isInitialLoad.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, debouncedSearch, false);
  }, [debouncedSearch, fetchData]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    items,
    loading,
    hasMore,
    currentPage,
    totalPages,
    error,
    loadMore,
    reset,
    refresh
  };
}
