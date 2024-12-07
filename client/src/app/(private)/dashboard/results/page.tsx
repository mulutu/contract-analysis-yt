"use client";

import ContractAnalysisResults from "@/components/analysis/contract-analysis-results";
import EmptyState from "@/components/analysis/empty-state";
import { useSubscription } from "@/hooks/use-subscription";
import { axiosApi } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { useContractStore } from "@/store/zustand";
import { toast } from "sonner";

export default function ContractResultsPage() {
  const analysisResults = useContractStore((state) => state.analysisrResults);

  const {
    subscriptionStatus,
    isSubscriptionLoading,
    isSubscriptionError,
    setLoading,
  } = useSubscription();

  if (!subscriptionStatus) {
    return <div>Loading...</div>;
  }

  const isActive = subscriptionStatus.status === "active";

  console.log("subscriptionStatus", subscriptionStatus);

  const handleUpgrade = async () => {
    setLoading(true);
    if (!isActive) {
      console.log("Handle upgrade  not premium status");
      try {
        const response = await axiosApi.get("/payments/create-checkout-session");
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
      } catch (error) {
        console.error("Handle upgrade error:: " + error);
        toast.error("Please try again or login to your account");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("already premium status");
      toast.error("You are already a premium member");
    }
  };

  if (!analysisResults) {
    return <EmptyState title="No Analysis" description="Please try again" />;
  }

  return (
    <ContractAnalysisResults
      contractId={analysisResults.id}
      isActive={isActive}
      analysisResults={analysisResults}
      onUpgrade={handleUpgrade}
    />
  );
}
