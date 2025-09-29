import { Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";

interface UseApiOptions<
    T,
    P extends Record<string, string | number> | undefined = undefined
> {
    fn: (params?: P) => Promise<T | null>; // ✅ Allow null return
    params?: P;
    skip?: boolean;
}

interface UseApiReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<T | null>;
}

export const useApi = <
    T,
    P extends Record<string, string | number> | undefined = undefined
>({
      fn,
      params,
      skip = false,
  }: UseApiOptions<T, P>): UseApiReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (fetchParams?: P) => {
            setLoading(true);
            setError(null);
            try {
                const result = await fn(fetchParams);
                setData(result);
                return result;
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "An unknown error occurred";
                setError(errorMessage);
                Alert.alert("Error", errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
    }, [params, skip, fetchData]);

    const refetch = async (newParams?: P) => await fetchData(newParams);

    return { data, loading, error, refetch };
};
