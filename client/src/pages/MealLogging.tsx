import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2 } from "lucide-react";

export default function MealLogging() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);

  const [manualForm, setManualForm] = useState({
    mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack" | "other",
    name: "",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const [imageForm, setImageForm] = useState({
    mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack" | "other",
    imageFile: null as File | null,
  });

  const createMealMutation = trpc.meals.create.useMutation();

  const handleManualSubmit = async () => {
    if (!manualForm.name || !manualForm.calories || !manualForm.protein || !manualForm.carbs || !manualForm.fat) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await createMealMutation.mutateAsync({
        mealType: manualForm.mealType,
        name: manualForm.name,
        description: manualForm.description,
        calories: parseInt(manualForm.calories),
        protein: parseFloat(manualForm.protein),
        carbs: parseFloat(manualForm.carbs),
        fat: parseFloat(manualForm.fat),
        aiEstimated: false,
      });
      toast.success("Meal logged successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to log meal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!imageForm.imageFile) {
      toast.error("Please select an image");
      return;
    }

    setIsLoading(true);
    try {
      toast.success("Meal logged successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to analyze meal image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Log Meal</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg">
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="image">Analyze Image</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Log Your Meal</h2>
                    <p className="text-muted-foreground">Enter the nutritional information for your meal</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meal-type" className="label-elegant">
                        Meal Type
                      </Label>
                      <Select
                        value={manualForm.mealType}
                        onValueChange={(value) => setManualForm({ ...manualForm, mealType: value as any })}
                      >
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meal-name" className="label-elegant">
                        Meal Name
                      </Label>
                      <Input
                        id="meal-name"
                        placeholder="e.g., Grilled Chicken with Rice"
                        value={manualForm.name}
                        onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                        className="input-elegant"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="label-elegant">
                        Description (optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="e.g., 200g chicken, 150g rice, vegetables"
                        value={manualForm.description}
                        onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                        className="input-elegant"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories" className="label-elegant">
                          Calories
                        </Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="500"
                          value={manualForm.calories}
                          onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                          className="input-elegant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="protein" className="label-elegant">
                          Protein (g)
                        </Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="30"
                          value={manualForm.protein}
                          onChange={(e) => setManualForm({ ...manualForm, protein: e.target.value })}
                          className="input-elegant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carbs" className="label-elegant">
                          Carbs (g)
                        </Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="60"
                          value={manualForm.carbs}
                          onChange={(e) => setManualForm({ ...manualForm, carbs: e.target.value })}
                          className="input-elegant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fat" className="label-elegant">
                          Fat (g)
                        </Label>
                        <Input
                          id="fat"
                          type="number"
                          placeholder="15"
                          value={manualForm.fat}
                          onChange={(e) => setManualForm({ ...manualForm, fat: e.target.value })}
                          className="input-elegant"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleManualSubmit}
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Logging Meal..." : "Log Meal"}
                  </Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Analyze Meal Image</h2>
                    <p className="text-muted-foreground">Upload a photo of your meal and our AI will estimate the macros</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meal-type-image" className="label-elegant">
                        Meal Type
                      </Label>
                      <Select
                        value={imageForm.mealType}
                        onValueChange={(value) => setImageForm({ ...imageForm, mealType: value as any })}
                      >
                        <SelectTrigger className="input-elegant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-semibold mb-2">Upload Meal Photo</p>
                      <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to 10MB</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageForm({ ...imageForm, imageFile: e.target.files?.[0] || null })}
                        className="hidden"
                        id="image-input"
                      />
                      <label htmlFor="image-input" className="cursor-pointer">
                        <Button variant="outline" className="border-border hover:bg-muted" asChild>
                          <span>Choose Image</span>
                        </Button>
                      </label>
                      {imageForm.imageFile && (
                        <p className="text-sm text-accent mt-4">Selected: {imageForm.imageFile.name}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleImageSubmit}
                    disabled={isLoading || !imageForm.imageFile}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Analyzing Image..." : "Analyze & Log Meal"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
