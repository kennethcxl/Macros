import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

type Step = "goal" | "details" | "review";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("goal");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    goal: "lean" as "bulk" | "lose" | "lean",
    age: "",
    gender: "male" as "male" | "female" | "other",
    height: "",
    weight: "",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "active" | "very_active",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const createProfileMutation = trpc.profile.create.useMutation();

  const handleNext = () => {
    if (step === "goal") {
      setStep("details");
    } else if (step === "details") {
      if (!formData.age || !formData.height || !formData.weight) {
        toast.error("Please fill in all fields");
        return;
      }
      setStep("review");
    }
  };

  const handlePrevious = () => {
    if (step === "details") {
      setStep("goal");
    } else if (step === "review") {
      setStep("details");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createProfileMutation.mutateAsync({
        goal: formData.goal,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        activityLevel: formData.activityLevel,
        timezone: formData.timezone,
      });
      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-2">Let's Get Started</h1>
          <p className="text-muted-foreground">Personalize your macro tracking experience</p>
        </div>

        <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg">
          <div className="p-8">
            {step === "goal" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">What's your fitness goal?</h2>
                  <p className="text-muted-foreground mb-6">Choose the goal that best fits your current objectives</p>
                </div>

                <RadioGroup value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value as any })}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="bulk" id="bulk" />
                      <Label htmlFor="bulk" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Bulk</div>
                        <div className="text-sm text-muted-foreground">Build muscle mass with a caloric surplus</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="lose" id="lose" />
                      <Label htmlFor="lose" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Lose Weight</div>
                        <div className="text-sm text-muted-foreground">Reduce body fat with a caloric deficit</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="lean" id="lean" />
                      <Label htmlFor="lean" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Lean Gains</div>
                        <div className="text-sm text-muted-foreground">Build muscle while minimizing fat gain</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Tell us about yourself</h2>
                  <p className="text-muted-foreground mb-6">We'll use this to calculate your personalized macro targets</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="label-elegant">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="input-elegant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="label-elegant">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as any })}>
                      <SelectTrigger className="input-elegant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="label-elegant">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="180"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="input-elegant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="label-elegant">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="75"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="input-elegant"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity" className="label-elegant">
                    Activity Level
                  </Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value as any })}>
                    <SelectTrigger className="input-elegant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (twice per day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Review Your Profile</h2>
                  <p className="text-muted-foreground mb-6">Make sure everything looks correct</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Goal</p>
                        <p className="font-semibold capitalize">{formData.goal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-semibold">{formData.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-semibold capitalize">{formData.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Height</p>
                        <p className="font-semibold">{formData.height} cm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-semibold">{formData.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Activity Level</p>
                        <p className="font-semibold capitalize">{formData.activityLevel.replace("_", " ")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-muted-foreground mb-2">Your personalized macro targets will be calculated based on this information.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step !== "goal" && (
                <Button onClick={handlePrevious} variant="outline" className="flex-1">
                  Previous
                </Button>
              )}
              {step !== "review" && (
                <Button onClick={handleNext} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Next
                </Button>
              )}
              {step === "review" && (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
