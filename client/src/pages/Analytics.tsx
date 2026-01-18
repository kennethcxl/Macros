import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function Analytics() {
  const [, navigate] = useLocation();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: tracking } = trpc.tracking.getToday.useQuery();

  if (!profile || !tracking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const trackingData = tracking as any;
  const protein = typeof trackingData.totalProtein === "string" ? parseFloat(trackingData.totalProtein) : trackingData.totalProtein || 0;
  const carbs = typeof trackingData.totalCarbs === "string" ? parseFloat(trackingData.totalCarbs) : trackingData.totalCarbs || 0;
  const fat = typeof trackingData.totalFat === "string" ? parseFloat(trackingData.totalFat) : trackingData.totalFat || 0;
  const targetProtein = typeof profile.targetProtein === "string" ? parseFloat(profile.targetProtein) : profile.targetProtein || 0;
  const targetCarbs = typeof profile.targetCarbs === "string" ? parseFloat(profile.targetCarbs) : profile.targetCarbs || 0;
  const targetFat = typeof profile.targetFat === "string" ? parseFloat(profile.targetFat) : profile.targetFat || 0;

  const macroBreakdownData = [
    {
      name: "Protein",
      value: protein,
      target: targetProtein,
      fill: "#3b82f6",
    },
    {
      name: "Carbs",
      value: carbs,
      target: targetCarbs,
      fill: "#10b981",
    },
    {
      name: "Fat",
      value: fat,
      target: targetFat,
      fill: "#f59e0b",
    },
  ];

  const calorieDistributionData = [
    {
      name: "Protein",
      value: Math.round(protein * 4),
      fill: "#3b82f6",
    },
    {
      name: "Carbs",
      value: Math.round(carbs * 4),
      fill: "#10b981",
    },
    {
      name: "Fat",
      value: Math.round(fat * 9),
      fill: "#f59e0b",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Macro Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Logged (g)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#82ca9d" name="Target (g)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Calorie Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={calorieDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}cal`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {calorieDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Macro Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Protein</p>
              <p className="text-3xl font-bold text-blue-600">{Math.round(protein)}g</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {Math.round(targetProtein)}g</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Carbs</p>
              <p className="text-3xl font-bold text-green-600">{Math.round(carbs)}g</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {Math.round(targetCarbs)}g</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Fat</p>
              <p className="text-3xl font-bold text-amber-600">{Math.round(fat)}g</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {Math.round(targetFat)}g</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
