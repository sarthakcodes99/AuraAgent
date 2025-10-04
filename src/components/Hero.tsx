import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-night-scene.jpg";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const navigate = useNavigate();

  const handleBuildSite = () => {
    if (userInput.trim()) {
      navigate("/output", { state: { userInput } });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground/90">AI-Powered Website Builder</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-glow leading-tight">
            Make websites{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              without limits
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Your AI website no code builder
          </p>
          
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuildSite()}
                placeholder="Describe your website idea... (e.g., 'Create a portfolio for a photographer')"
                className="flex-1 px-6 py-4 rounded-xl glass-card border border-primary/50 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all duration-300 text-base"
              />
              <Button 
                size="lg" 
                className="gradient-primary btn-glow shadow-lg shadow-primary/50 text-white font-semibold text-base px-10 py-4 h-auto rounded-xl hover:scale-105 transition-transform duration-200"
                onClick={handleBuildSite}
              >
                Build My Site
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full glow-primary animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full glow-accent animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-secondary rounded-full glow-primary animate-pulse delay-150"></div>
      </div>
    </section>
  );
};

export default Hero;
