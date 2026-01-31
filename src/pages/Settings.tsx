import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { redirectToCustomerPortal } from "@/lib/stripe";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, CreditCard, User, AlertTriangle, Loader2, ExternalLink } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription, isPremium, isTrialing, isLoading: isSubLoading, startCheckout } = useSubscription();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Get subscription status display
  const getSubscriptionStatus = () => {
    if (isSubLoading) return "Loading...";
    if (!subscription) return "Free";
    
    switch (subscription.status) {
      case "trialing":
        return "Premium Trial";
      case "active":
        return subscription.cancel_at_period_end ? "Active (Canceling)" : "Premium";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      default:
        return "Free";
    }
  };

  const getStatusBadgeClass = () => {
    if (!subscription) return "bg-muted text-muted-foreground";
    
    switch (subscription.status) {
      case "trialing":
        return "bg-blue-500/10 text-blue-500";
      case "active":
        return "bg-green-500/10 text-green-500";
      case "past_due":
        return "bg-yellow-500/10 text-yellow-500";
      case "canceled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔓 [Settings] Logging out user...");
      
      // Clear local storage onboarding data
      localStorage.removeItem("onboarding_data");
      
      // Sign out from Supabase
      await signOut();
      
      console.log("✅ [Settings] User logged out successfully");
      
      // Redirect to landing page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ [Settings] Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      const result = await redirectToCustomerPortal();
      if (result?.error) {
        console.error("[Settings] Portal error:", result.error);
        // TODO: Show toast error
      }
    } catch (error) {
      console.error("[Settings] Portal error:", error);
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const result = await startCheckout();
      if (result?.error) {
        console.error("[Settings] Checkout error:", result.error);
        // TODO: Show toast error
      }
    } catch (error) {
      console.error("[Settings] Checkout error:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  // Format account creation date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with hamburger menu */}
      <AppHeader title="Settings" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-8">
          
          {/* Account Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Account Information</CardTitle>
              </div>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "Not available"}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">{formatDate(user?.created_at)}</p>
              </div>
              {/* Optional: User ID for debugging */}
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">User ID (for support)</p>
                <p className="text-xs font-mono text-muted-foreground/70 break-all">
                  {user?.id || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Subscription</CardTitle>
              </div>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{getSubscriptionStatus()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass()}`}>
                      {isPremium ? "Active" : isTrialing ? "Trial" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {subscription?.current_period_end && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {subscription.cancel_at_period_end ? "Access Until" : "Next Billing Date"}
                    </p>
                    <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                  </div>
                </>
              )}

              <Separator />
              
              {isPremium || isTrialing ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleManageSubscription}
                  disabled={isManagingSubscription}
                >
                  {isManagingSubscription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Upgrade Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Session */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Session</CardTitle>
              </div>
              <CardDescription>Manage your active session</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Log Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out of your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      disabled
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Account deletion will be available soon
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
