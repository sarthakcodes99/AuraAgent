import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold text-glow">OnePrompt</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
            <Button className="gradient-primary btn-glow border-0">
              Try OnePrompt
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
