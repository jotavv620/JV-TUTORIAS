import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useCustomAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  } as any);

  // Set timeout for auth check (3 seconds - aggressive)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('[Auth] Timeout: auth.me took too long, falling back to unauthenticated');
      setHasTimedOut(true);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [meQuery.isLoading]);

  // Fallback: if still loading after 10 seconds, force stop
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.error('[Auth] Critical timeout: forcing auth check to stop');
        setIsLoading(false);
        setHasTimedOut(true);
      }
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  useEffect(() => {
    if (!meQuery.isLoading) {
      setIsLoading(false);
      if (!meQuery.error) {
        setHasTimedOut(false);
      }
    }
  }, [meQuery.isLoading, meQuery.error]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null as any);
      localStorage.removeItem("authToken");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: any) {
      console.error(error);
    } finally {
      utils.auth.me.setData(undefined, null as any);
      await utils.auth.me.invalidate();
      localStorage.removeItem("authToken");
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    if (meQuery.data) {
      localStorage.setItem(
        "user-info",
        JSON.stringify(meQuery.data)
      );
    }
    // If timeout occurred, treat as unauthenticated (not loading)
    const shouldShowLoading = (isLoading && !hasTimedOut) && meQuery.isLoading;
    return {
      user: meQuery.data ?? null,
      loading: shouldShowLoading,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    isLoading,
    hasTimedOut,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    state.loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
