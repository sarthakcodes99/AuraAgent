import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Output = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInput = location.state?.userInput || "Your website idea";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-glow">OnePrompt</span>
            </div>
            <Button className="gradient-primary btn-glow border-0">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex pt-20">
        {/* Left Side Panel - User Input */}
        <div className="w-80 border-r border-border bg-card/40 p-6">
          <Button 
            variant="ghost" 
            className="mb-6 text-foreground/80 hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="glass-card p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-primary mb-3">Your Prompt</h3>
            <p className="text-foreground/90 text-sm leading-relaxed">
              {userInput}
            </p>
          </div>

          <div className="mt-6 glass-card p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-primary mb-3">AI Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-foreground/80 text-sm">Generating your website...</span>
            </div>
          </div>
        </div>

        {/* Main Content Area - Website Preview */}
        <div className="flex-1 bg-background p-8">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-8 rounded-lg min-h-[600px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-2xl font-bold text-glow">Building Your Website</h2>
                <p className="text-foreground/70">
                  Our AI is creating a beautiful website based on your description...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
