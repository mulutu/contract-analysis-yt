import { useState, useEffect } from "react";
import { useCurrentUser } from "./use-current-user";
import { useQuery } from "@tanstack/react-query";
import { axiosApi } from "@/lib/api";

export async function fetchSubscriptionStatus() {
  try {
    console.log("Fetching subscription status..." + axiosApi.defaults.headers );
    const response = await axiosApi.get("/payments/membership-status");

    if (response.status !== 200) {
      console.error("Failed to fetch subscription status", response);
      throw new Error("Failed to fetch subscription status");
    }

    console.log("Subscription status fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in fetchSubscriptionStatus:", error);
    throw error;
  }
}

export function useSubscription() {
  const { isLoading: isUserLoading, isError: isUserError, user } = useCurrentUser();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    data: subscriptionStatus,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    refetch: refetchSubscriptionStatus,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
    enabled: !!user, // Only fetch if user is loaded
    refetchOnWindowFocus: false, // Prevent unnecessary fetches
    retry: 2, // Retry fetching if it fails
  });

  // Consolidated loading state
  useEffect(() => {
    setLoading(isUserLoading || isSubscriptionLoading);
  }, [isUserLoading, isSubscriptionLoading]);

  return {
    subscriptionStatus,
    isUserLoading,
    isUserError,
    isSubscriptionLoading,
    isSubscriptionError,
    loading,
    setLoading,
    refetchSubscriptionStatus, // Allow manual refetching
  };
}


/*import { useState } from "react";
import { useCurrentUser } from "./use-current-user";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSubscription() {
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    user,
  } = useCurrentUser();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    data: subscriptionStatus,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
    // enabled: !!user,
  });

  async function fetchSubscriptionStatus() {
    console.log("fetching subscription status");
    const response = await api.get("/payments/membership-status");
    if (response.status !== 200) {
      console.error("Failed to fetch subscription status", response);
      throw new Error("Failed to fetch subscription status");
    }
    console.log("subscription status", response.data);
    return response.data;
  }

  return {
    subscriptionStatus,
    isUserLoading,
    isUserError,
    isSubscriptionLoading,
    isSubscriptionError,
    loading,
    setLoading,
  };
}
*/