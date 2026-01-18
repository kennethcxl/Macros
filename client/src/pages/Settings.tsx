import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    setIsLoading(false);
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("sk-or-")) {
      toast.error("Invalid OpenRouter API key format. Should start with 'sk-or-'");
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("openrouter_api_key", apiKey);
      toast.success("API key saved successfully!");
    } catch (error) {
      toast.error("Failed to save API key");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    if (confirm("Are you sure you want to remove your OpenRouter API key?")) {
      localStorage.removeItem("openrouter_api_key");
      setApiKey("");
      toast.success("API key removed");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        <div className="space-y-8">
          {/* User Profile Section */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="text-lg font-semibold">{user?.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-lg font-semibold">{user?.email || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Member Since</Label>
                <p className="text-lg font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
          </Card>

          {/* OpenRouter API Key Section */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2">AI Features</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add your OpenRouter API key to enable AI-powered meal analysis. Your key is stored locally and never shared.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="label-elegant">
                  OpenRouter API Key
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="input-elegant pr-10"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    OpenRouter Dashboard
                  </a>
                </p>
              </div>

              {apiKey && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    ✓ API key is configured. Meal image analysis is enabled.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSaving || !apiKey.trim()}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save API Key"}
                </Button>
                {apiKey && (
                  <Button
                    onClick={handleClearApiKey}
                    variant="outline"
                    className="flex-1"
                  >
                    Remove Key
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Information Section */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">About MacroTrack</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
              <p>
                <strong>AI Provider:</strong> OpenRouter (supports multiple LLM models)
              </p>
              <p>
                <strong>Database:</strong> Supabase PostgreSQL
              </p>
              <p>
                <strong>Hosting:</strong> Vercel
              </p>
              <div className="pt-4 border-t border-border">
                <p className="mb-2">
                  <strong>Support:</strong>
                </p>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="https://github.com/kennethcxl/Macros"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://openrouter.ai/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      OpenRouter Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://supabase.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Supabase Documentation
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
