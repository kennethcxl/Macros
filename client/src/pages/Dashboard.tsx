import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, TrendingUp, Apple, Flame, BarChart3, Lightbulb } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const trackingQuery = trpc.tracking.getToday.useQuery();
  const mealsQuery = trpc.meals.getToday.useQuery();
  const coachingQuery = trpc.coaching.getToday.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !trackingQuery.data || !mealsQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { tracking, profile } = trackingQuery.data;
  const meals = mealsQuery.data;

  if (!profile) {
    navigate("/onboarding");
    return null;
  }

  const totalCalories = tracking?.totalCalories || 0;
  const totalProtein = Number(tracking?.totalProtein) || 0;
  const totalCarbs = Number(tracking?.totalCarbs) || 0;
  const totalFat = Number(tracking?.totalFat) || 0;

  const caloriePercent = Math.min((totalCalories / (profile.targetCalories || 2000)) * 100, 100);
  const proteinPercent = Math.min((totalProtein / Number(profile.targetProtein)) * 100, 100);
  const carbsPercent = Math.min((totalCarbs / Number(profile.targetCarbs)) * 100, 100);
  const fatPercent = Math.min((totalFat / Number(profile.targetFat)) * 100, 100);

  const remainingCalories = Math.max(0, (profile.targetCalories || 2000) - totalCalories);
  const remainingProtein = Math.max(0, Number(profile.targetProtein) - totalProtein);
  const remainingCarbs = Math.max(0, Number(profile.targetCarbs) - totalCarbs);
  const remainingFat = Math.max(0, Number(profile.targetFat) - totalFat);

  const getStatusColor = (percent: number) => {
    if (percent <= 100) return "bg-green-500";
    if (percent <= 110) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MacroTrack</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "User"}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Profile
          </Button>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Daily Summary Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calories Card */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-3xl font-bold">{totalCalories}</p>
                  </div>
                  <Flame className="h-8 w-8 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <Progress value={caloriePercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{caloriePercent.toFixed(0)}% of {profile.targetCalories}</span>
                    <span>{remainingCalories} left</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Protein Card */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-3xl font-bold">{Math.round(totalProtein)}g</p>
                  </div>
                  <Apple className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <Progress value={proteinPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{proteinPercent.toFixed(0)}% of {Math.round(Number(profile.targetProtein))}g</span>
                    <span>{Math.round(remainingProtein)}g left</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Carbs Card */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-3xl font-bold">{Math.round(totalCarbs)}g</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <Progress value={carbsPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{carbsPercent.toFixed(0)}% of {Math.round(Number(profile.targetCarbs))}g</span>
                    <span>{Math.round(remainingCarbs)}g left</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Fat Card */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-3xl font-bold">{Math.round(totalFat)}g</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-500"></div>
                </div>
                <div className="space-y-2">
                  <Progress value={fatPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{fatPercent.toFixed(0)}% of {Math.round(Number(profile.targetFat))}g</span>
                    <span>{Math.round(remainingFat)}g left</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Primary Action: Add Meal Button */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => navigate("/meal-logging")}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg rounded-lg shadow-lg"
          >
            <Plus className="mr-2 h-6 w-6" />
            Add Meal
          </Button>

          {/* Today's Meals */}
          {meals && meals.length > 0 && (
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Today's Meals ({meals.length})</h3>
              <div className="space-y-3">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex-1">
                      <p className="font-semibold">{meal.name}</p>
                      <p className="text-sm text-muted-foreground">{meal.mealType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{meal.calories} cal</p>
                      <p className="text-xs text-muted-foreground">{Math.round(Number(meal.protein))}P • {Math.round(Number(meal.carbs))}C • {Math.round(Number(meal.fat))}F</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* AI Coaching Tips Section */}
        {coachingQuery.data && Array.isArray(coachingQuery.data) && coachingQuery.data.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">AI Coaching Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(coachingQuery.data as any[]).map((item: any, idx: number) => (
                <Card key={idx} className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
                  <p className="text-sm leading-relaxed">{item.tip}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Link */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/analytics")}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Detailed Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
