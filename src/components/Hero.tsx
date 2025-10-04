import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-night-scene.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
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
            Make websites
            <br />
            <span className="gradient-glow bg-clip-text text-transparent">
              without limits
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Your AI website no code builder
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="gradient-primary btn-glow border-0 text-lg px-8 py-6 group">
              Try OnePrompt
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="glass-card text-lg px-8 py-6 border-primary/30 hover:border-primary/50">
              Learn More
            </Button>
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
