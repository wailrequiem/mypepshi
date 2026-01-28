// Example: How to integrate AI-generated dashboard data

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardData, DashboardData } from "@/lib/ai";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function DashboardExample() {
  const { user } = useAuth();
  const { onboardingData } = useOnboarding();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && onboardingData.last_scan_id) {
      loadDashboard();
    }
  }, [user, onboardingData.last_scan_id]);

  const loadDashboard = async () => {
    if (!user || !onboardingData.last_scan_id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardData(user.id, onboardingData.last_scan_id);
      setDashboardData(data);
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const regeneratePlan = async () => {
    if (!user || !onboardingData.last_scan_id) return;

    setLoading(true);
    setError(null);

    try {
      // Force regenerate by passing true
      const data = await getDashboardData(user.id, onboardingData.last_scan_id, true);
      setDashboardData(data);
    } catch (err: any) {
      console.error("Failed to regenerate plan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Creating your personalized plan...</h2>
          <p className="text-muted-foreground">This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Failed to generate plan</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <div className="px-4 pt-8 space-y-8">
        {/* Regenerate Button */}
        <div className="flex justify-end">
          <button
            onClick={regeneratePlan}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg"
            disabled={loading}
          >
            🔄 Regenerate Plan
          </button>
        </div>

        {/* Glow-Up Plan Summary */}
        <div className="bg-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Your Personalized Glow-Up Plan</h2>
          <p className="text-muted-foreground mb-6">{dashboardData.glow_up_plan.summary}</p>

          {/* Weekly Breakdown */}
          <div className="space-y-4">
            {dashboardData.glow_up_plan.weeks.map((week) => (
              <div key={week.week} className="border border-border rounded-xl p-4">
                <h3 className="font-semibold mb-2">
                  Week {week.week}: {week.focus}
                </h3>
                <div className="space-y-2">
                  {week.days.map((day) => (
                    <div key={day.day} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {day.day}
                      </div>
                      <div>
                        <p className="font-medium">{day.title}</p>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peptide Recommendations */}
        <div className="bg-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">AI-Matched Peptides</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardData.peptides.map((peptide, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{peptide.name}</h3>
                  <span className="text-sm text-primary font-medium">
                    {peptide.fit_percentage}% fit
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{peptide.subtitle}</p>
                <p className="text-sm mb-3">{peptide.why_recommended}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Benefits:</p>
                    <ul className="text-sm list-disc list-inside">
                      {peptide.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dosage:</p>
                    <p className="text-sm">{peptide.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timing:</p>
                    <p className="text-sm">{peptide.timing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Insights */}
        <div className="bg-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Coach Insights</h2>
          <p className="text-muted-foreground mb-4">{dashboardData.coach_insights.summary}</p>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Key Recommendations:</h3>
            <ul className="space-y-2">
              {dashboardData.coach_insights.key_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-primary font-medium">
              {dashboardData.coach_insights.motivational_message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
