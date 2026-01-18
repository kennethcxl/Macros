import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, TrendingUp, Apple, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MACRO_COLORS = {
  protein: "rgb(168, 85, 247)",
  carbs: "rgb(34, 197, 94)",
  fat: "rgb(249, 115, 22)",
  calories: "rgb(59, 130, 246)",
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const macroData = [
    { name: "Protein", value: totalProtein, target: Number(profile.targetProtein), color: MACRO_COLORS.protein },
    { name: "Carbs", value: totalCarbs, target: Number(profile.targetCarbs), color: MACRO_COLORS.carbs },
    { name: "Fat", value: totalFat, target: Number(profile.targetFat), color: MACRO_COLORS.fat },
  ];

  const pieData = [
    { name: "Protein", value: totalProtein * 4, color: MACRO_COLORS.protein },
    { name: "Carbs", value: totalCarbs * 4, color: MACRO_COLORS.carbs },
    { name: "Fat", value: totalFat * 9, color: MACRO_COLORS.fat },
  ];

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
        <div>
          <h2 className="text-2xl font-bold mb-4">Today's Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="macro-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-3xl font-bold">{totalCalories}</p>
                  <p className="text-xs text-muted-foreground">of {profile.targetCalories}</p>
                </div>
                <Flame className="h-8 w-8 text-macro-calories" />
              </div>
              <div className="macro-progress">
                <div className="macro-progress-bar macro-progress-calories" style={{ width: `${caloriePercent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(caloriePercent)}% complete</p>
            </Card>

            <Card className="macro-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-3xl font-bold">{Math.round(totalProtein)}g</p>
                  <p className="text-xs text-muted-foreground">of {Math.round(Number(profile.targetProtein))}g</p>
                </div>
                <Apple className="h-8 w-8 text-macro-protein" />
              </div>
              <div className="macro-progress">
                <div className="macro-progress-bar macro-progress-protein" style={{ width: `${proteinPercent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(proteinPercent)}% complete</p>
            </Card>

            <Card className="macro-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-3xl font-bold">{Math.round(totalCarbs)}g</p>
                  <p className="text-xs text-muted-foreground">of {Math.round(Number(profile.targetCarbs))}g</p>
                </div>
                <TrendingUp className="h-8 w-8 text-macro-carbs" />
              </div>
              <div className="macro-progress">
                <div className="macro-progress-bar macro-progress-carbs" style={{ width: `${carbsPercent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(carbsPercent)}% complete</p>
            </Card>

            <Card className="macro-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-3xl font-bold">{Math.round(totalFat)}g</p>
                  <p className="text-xs text-muted-foreground">of {Math.round(Number(profile.targetFat))}g</p>
                </div>
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: MACRO_COLORS.fat }}></div>
              </div>
              <div className="macro-progress">
                <div className="macro-progress-bar macro-progress-fat" style={{ width: `${fatPercent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(fatPercent)}% complete</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Macro Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" fill="var(--accent)" name="Current" />
                <Bar dataKey="target" fill="var(--muted)" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Calorie Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Today's Meals</h2>
            <Button onClick={() => navigate("/meals/new")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </div>

          {meals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No meals logged yet</p>
              <Button onClick={() => navigate("/meals/new")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Log Your First Meal
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <Card key={meal.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold">{meal.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{meal.mealType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{meal.calories} cal</p>
                    <p className="text-xs text-muted-foreground">P: {Math.round(Number(meal.protein))}g | C: {Math.round(Number(meal.carbs))}g | F: {Math.round(Number(meal.fat))}g</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {coachingQuery.data && coachingQuery.data.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">AI Coach Tips</h2>
            <div className="space-y-3">
              {coachingQuery.data.map((tip, index) => (
                <Card key={index} className="p-4 bg-accent/5 border-accent/20">
                  <p className="text-sm">{tip.tip || tip.category}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
