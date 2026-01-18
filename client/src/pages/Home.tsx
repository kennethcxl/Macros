import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, TrendingUp, Zap, Target } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">MacroTrack</h1>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Get Started
          </Button>
        </div>
      </nav>

      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold">Track Your Macros, Achieve Your Goals</h2>
            <p className="text-xl text-muted-foreground">Intelligent nutrition tracking with AI-powered meal analysis</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
            >
              Start Tracking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose MacroTrack?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <Zap className="h-8 w-8 text-accent mb-4" />
            <h4 className="text-xl font-semibold mb-2">AI Meal Analysis</h4>
            <p className="text-muted-foreground">Upload a photo of your meal and our AI instantly estimates calories and macros</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <Target className="h-8 w-8 text-accent mb-4" />
            <h4 className="text-xl font-semibold mb-2">Personalized Goals</h4>
            <p className="text-muted-foreground">Set your fitness goal and get customized macro targets</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <TrendingUp className="h-8 w-8 text-accent mb-4" />
            <h4 className="text-xl font-semibold mb-2">Smart Coaching</h4>
            <p className="text-muted-foreground">Get real-time AI coaching tips based on your daily macro adherence</p>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Nutrition?</h3>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of users tracking their macros with MacroTrack</p>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
          >
            Start Free Today
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container py-8 text-center text-muted-foreground">
          <p>MacroTrack - Your intelligent nutrition companion</p>
        </div>
      </footer>
    </div>
  );
}
