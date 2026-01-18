import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, AlertCircle, Settings } from "lucide-react";
import { useState, useEffect } from "react";

interface MealAnalysis {
  mealName: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "medium" | "low";
  ingredients: string[];
  notes: string;
}

export default function MealLogging() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("image");
  const [isLoading, setIsLoading] = useState(false);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null);
  const [mealType, setMealType] = useState("lunch" as "breakfast" | "lunch" | "dinner" | "snack" | "other");
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if user has OpenRouter API key configured
    const apiKey = localStorage.getItem("openrouter_api_key");
    setHasApiKey(!!apiKey);
  }, []);

  // Image analysis state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState("");

  // Text analysis state
  const [mealDescription, setMealDescription] = useState("");

  // Refinement state
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Manual entry state
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualMacros, setManualMacros] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const createMealMutation = trpc.meals.create.useMutation();
  const analyzeImageMutation = trpc.mealAnalysis.analyzeFromImage.useMutation();
  const analyzeDescriptionMutation = trpc.mealAnalysis.analyzeFromDescription.useMutation();
  const refineMutation = trpc.mealAnalysis.refineEstimate.useMutation();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreview) {
      toast.error("Please select an image");
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeImageMutation.mutateAsync({
        imageUrl: imagePreview,
        description: imageDescription || undefined,
      });
      setMealAnalysis(analysis);
      toast.success("Meal analyzed successfully!");
    } catch (error) {
      toast.error("Failed to analyze meal image");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDescription = async () => {
    if (!mealDescription.trim()) {
      toast.error("Please describe your meal");
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeDescriptionMutation.mutateAsync({
        description: mealDescription,
      });
      setMealAnalysis(analysis);
      toast.success("Meal analyzed successfully!");
    } catch (error) {
      toast.error("Failed to analyze meal");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!mealAnalysis || !refinementFeedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setIsRefining(true);
    try {
      const refined = await refineMutation.mutateAsync({
        originalAnalysis: mealAnalysis,
        userFeedback: refinementFeedback,
      });
      setMealAnalysis(refined);
      setRefinementFeedback("");
      toast.success("Estimates refined!");
    } catch (error) {
      toast.error("Failed to refine estimates");
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!mealAnalysis) {
      toast.error("Please analyze a meal first");
      return;
    }

    const finalMacros = useManualEntry
      ? {
          calories: parseInt(manualMacros.calories) || Math.round(mealAnalysis.calories),
          protein: parseFloat(manualMacros.protein) || mealAnalysis.protein,
          carbs: parseFloat(manualMacros.carbs) || mealAnalysis.carbs,
          fat: parseFloat(manualMacros.fat) || mealAnalysis.fat,
        }
      : {
          calories: Math.round(mealAnalysis.calories),
          protein: mealAnalysis.protein,
          carbs: mealAnalysis.carbs,
          fat: mealAnalysis.fat,
        };

    setIsLoading(true);
    try {
      await createMealMutation.mutateAsync({
        mealType,
        name: mealAnalysis.mealName,
        description: mealAnalysis.description,
        calories: finalMacros.calories,
        protein: finalMacros.protein,
        carbs: finalMacros.carbs,
        fat: finalMacros.fat,
        aiEstimated: !useManualEntry,
      });
      toast.success("Meal logged successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save meal");
      console.error(error);
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
        {!hasApiKey && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                AI meal analysis requires an OpenRouter API key
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Add your OpenRouter API key in Settings to enable AI-powered meal analysis from images.
              </p>
              <button
                onClick={() => navigate("/settings")}
                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                Go to Settings
              </button>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          {!mealAnalysis ? (
            <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Let AI Estimate Your Macros</h2>
                  <p className="text-muted-foreground">Upload a photo or describe your meal, and our AI will intelligently estimate the nutritional content</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="image">Photo Analysis</TabsTrigger>
                    <TabsTrigger value="text">Text Description</TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="space-y-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img src={imagePreview} alt="Meal preview" className="max-h-64 mx-auto rounded-lg" />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="font-semibold mb-2">Upload Meal Photo</p>
                            <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to 10MB</p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-input"
                            />
                            <label htmlFor="image-input" className="cursor-pointer">
                              <Button variant="outline" className="border-border hover:bg-muted" asChild>
                                <span>Choose Image</span>
                              </Button>
                            </label>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image-description" className="label-elegant">
                          Additional Details (optional)
                        </Label>
                        <Textarea
                          id="image-description"
                          placeholder="e.g., This is a medium portion, no oil used, extra vegetables..."
                          value={imageDescription}
                          onChange={(e) => setImageDescription(e.target.value)}
                          className="input-elegant"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleAnalyzeImage}
                        disabled={isLoading || !imagePreview}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Analyzing..." : "Analyze Meal"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meal-description" className="label-elegant">
                          Describe Your Meal
                        </Label>
                        <Textarea
                          id="meal-description"
                          placeholder="e.g., Grilled chicken breast (200g), brown rice (150g), steamed broccoli, olive oil (1 tbsp)"
                          value={mealDescription}
                          onChange={(e) => setMealDescription(e.target.value)}
                          className="input-elegant"
                          rows={5}
                        />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Tip:</strong> Be as specific as possible. Include portion sizes (e.g., 200g, 1 cup), cooking method (grilled, fried, steamed), and any oils or sauces used.
                        </p>
                      </div>

                      <Button
                        onClick={handleAnalyzeDescription}
                        disabled={isLoading || !mealDescription.trim()}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Analyzing..." : "Analyze Meal"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">AI Analysis Complete</h2>
                    <p className="text-muted-foreground">Review the estimated macros below</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-3xl font-bold">{useManualEntry && manualMacros.calories ? manualMacros.calories : Math.round(mealAnalysis.calories)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-3xl font-bold">{useManualEntry && manualMacros.protein ? manualMacros.protein : Math.round(mealAnalysis.protein)}g</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-3xl font-bold">{useManualEntry && manualMacros.carbs ? manualMacros.carbs : Math.round(mealAnalysis.carbs)}g</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">Fat</p>
                      <p className="text-3xl font-bold">{useManualEntry && manualMacros.fat ? manualMacros.fat : Math.round(mealAnalysis.fat)}g</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Meal Name</p>
                      <p className="font-semibold text-lg">{mealAnalysis.mealName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{mealAnalysis.description}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Identified Ingredients</p>
                      <div className="flex flex-wrap gap-2">
                        {mealAnalysis.ingredients.map((ingredient, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Confidence: {mealAnalysis.confidence.charAt(0).toUpperCase() + mealAnalysis.confidence.slice(1)}
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{mealAnalysis.notes}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="refinement" className="label-elegant">
                      Refine Estimates (optional)
                    </Label>
                    <Textarea
                      id="refinement"
                      placeholder="e.g., The portion was actually larger, or I used more oil than shown..."
                      value={refinementFeedback}
                      onChange={(e) => setRefinementFeedback(e.target.value)}
                      className="input-elegant"
                      rows={2}
                    />
                    <Button
                      onClick={handleRefine}
                      disabled={isRefining || !refinementFeedback.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      {isRefining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isRefining ? "Refining..." : "Refine Estimates"}
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4">
                    <button
                      onClick={() => setUseManualEntry(!useManualEntry)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {useManualEntry ? "✓ Using manual values" : "+ Enter exact values manually"}
                    </button>

                    {useManualEntry && (
                      <div className="mt-4 space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs text-muted-foreground">Override AI estimates with your exact values (optional)</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="manual-calories" className="text-xs label-elegant">
                              Calories
                            </Label>
                            <Input
                              id="manual-calories"
                              type="number"
                              placeholder={Math.round(mealAnalysis.calories).toString()}
                              value={manualMacros.calories}
                              onChange={(e) => setManualMacros({ ...manualMacros, calories: e.target.value })}
                              className="input-elegant text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="manual-protein" className="text-xs label-elegant">
                              Protein (g)
                            </Label>
                            <Input
                              id="manual-protein"
                              type="number"
                              placeholder={Math.round(mealAnalysis.protein).toString()}
                              value={manualMacros.protein}
                              onChange={(e) => setManualMacros({ ...manualMacros, protein: e.target.value })}
                              className="input-elegant text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="manual-carbs" className="text-xs label-elegant">
                              Carbs (g)
                            </Label>
                            <Input
                              id="manual-carbs"
                              type="number"
                              placeholder={Math.round(mealAnalysis.carbs).toString()}
                              value={manualMacros.carbs}
                              onChange={(e) => setManualMacros({ ...manualMacros, carbs: e.target.value })}
                              className="input-elegant text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="manual-fat" className="text-xs label-elegant">
                              Fat (g)
                            </Label>
                            <Input
                              id="manual-fat"
                              type="number"
                              placeholder={Math.round(mealAnalysis.fat).toString()}
                              value={manualMacros.fat}
                              onChange={(e) => setManualMacros({ ...manualMacros, fat: e.target.value })}
                              className="input-elegant text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal-type" className="label-elegant">
                      Meal Type
                    </Label>
                    <Select value={mealType} onValueChange={(value) => setMealType(value as any)}>
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

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setMealAnalysis(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSaveMeal}
                      disabled={isLoading}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Saving..." : "Save Meal"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
