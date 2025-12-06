import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-space-galaxy.jpg";
import { ArrowRight, Sparkles, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectNameModal from "./ProjectNameModal";

const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [typedHeading, setTypedHeading] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const headingText = "without limits";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < headingText.length) {
        setTypedHeading(headingText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const handleBuildSite = () => {
    if (!userInput.trim()) return;
    
    if (user) {
      // Logged in user - show naming modal
      setShowNameModal(true);
    } else {
      // Not logged in - go directly to output
      navigate("/output", { state: { userInput } });
    }
  };

  const handleProjectCreate = async (projectName: string) => {
    if (!user) return;
    
    try {
      // Create the project in the database
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: projectName,
        })
        .select()
        .single();

      if (error) throw error;

      setShowNameModal(false);
      // Navigate to output with project info
      navigate("/output", { 
        state: { 
          userInput, 
          projectId: data.id,
          projectName 
        } 
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  return (
    <>
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
            {user && profile && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-glow">
                  Hello, {profile.name}! 👋
                </h2>
                <p className="text-muted-foreground mt-2">
                  Ready to create something amazing?
                </p>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/90">AI-Powered Website Builder</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-glow leading-tight">
              Make websites{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {typedHeading}
                {typedHeading.length < headingText.length && <span className="animate-pulse">|</span>}
              </span>
            </h1>
            
            <p className="text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-1.5">
              With{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Aura Agent 1
              </span>
              <Bot className="w-4 h-4 text-pink-500" />
            </p>
            
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

      <ProjectNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleProjectCreate}
      />
    </>
  );
};

export default Hero;
