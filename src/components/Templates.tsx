import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectNameModal from "./ProjectNameModal";
import { Sparkles, ShoppingCart, Briefcase, Camera, Utensils, Stethoscope, GraduationCap } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  gradient: string;
  previewColors: string[];
}

const templates: Template[] = [
  {
    id: "portfolio",
    title: "Creative Portfolio",
    description: "Stunning portfolio for artists & designers",
    prompt: "Create a modern creative portfolio website for a graphic designer with a dark theme, featuring a hero section with animated text, a gallery grid showcasing projects with hover effects, an about section with skills, and a contact form. Include smooth scroll animations and a minimalist navigation.",
    icon: <Camera className="w-6 h-6" />,
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    previewColors: ["#1a1a2e", "#e94560", "#0f3460"]
  },
  {
    id: "ecommerce",
    title: "E-Commerce Store",
    description: "Professional online shop ready to sell",
    prompt: "Build a sleek e-commerce website for a fashion brand with a hero banner featuring new arrivals, product grid with category filters, shopping cart functionality, featured collections section, customer testimonials, and a newsletter signup. Use elegant typography and smooth animations.",
    icon: <ShoppingCart className="w-6 h-6" />,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    previewColors: ["#0d1117", "#58a6ff", "#238636"]
  },
  {
    id: "startup",
    title: "Startup Landing",
    description: "Convert visitors into customers",
    prompt: "Design a high-converting SaaS startup landing page with a bold hero section, feature highlights with icons, pricing table with 3 tiers, customer logos carousel, testimonials section, FAQ accordion, and a strong call-to-action. Modern gradients and micro-interactions throughout.",
    icon: <Briefcase className="w-6 h-6" />,
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    previewColors: ["#0f172a", "#3b82f6", "#8b5cf6"]
  },
  {
    id: "restaurant",
    title: "Restaurant & Cafe",
    description: "Appetizing website for food business",
    prompt: "Create a warm and inviting restaurant website with a full-screen hero image, featured dishes carousel, menu sections with categories and prices, about the chef section, reservation form, location with map placeholder, and customer reviews. Rich warm colors and elegant fonts.",
    icon: <Utensils className="w-6 h-6" />,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    previewColors: ["#1c1917", "#f59e0b", "#dc2626"]
  },
  {
    id: "medical",
    title: "Healthcare Clinic",
    description: "Professional medical practice website",
    prompt: "Build a trustworthy healthcare clinic website with a calming hero section, services offered with icons, doctor profiles with credentials, appointment booking form, patient testimonials, insurance information section, and contact details. Clean design with blues and whites for trust.",
    icon: <Stethoscope className="w-6 h-6" />,
    gradient: "from-cyan-500 via-blue-500 to-blue-600",
    previewColors: ["#f0f9ff", "#0891b2", "#1e40af"]
  },
  {
    id: "education",
    title: "Online Course",
    description: "Educational platform for courses",
    prompt: "Design an engaging online course platform landing page with a compelling hero, featured courses grid with thumbnails and ratings, instructor spotlight, learning path visualization, student success stories, pricing plans, and enrollment CTA. Modern and educational feel with vibrant accents.",
    icon: <GraduationCap className="w-6 h-6" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    previewColors: ["#18181b", "#a855f7", "#d946ef"]
  }
];

const Templates = () => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTemplateClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    if (user) {
      setShowNameModal(true);
    } else {
      navigate("/output", { state: { userInput: prompt } });
    }
  };

  const handleProjectCreate = async (projectName: string) => {
    if (!user) return;
    
    try {
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
      navigate("/output", { 
        state: { 
          userInput: selectedPrompt, 
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
      <section className="py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/90">Quick Start Templates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-glow">
              Choose a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Template
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click on any template to instantly generate a professional website tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template.prompt)}
                className="group relative rounded-2xl overflow-hidden glass-card border border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20"
              >
                {/* Preview Image Placeholder */}
                <div className="h-44 relative overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-80`}
                  ></div>
                  
                  {/* Mockup Browser Frame */}
                  <div className="absolute inset-4 bg-background/90 rounded-lg shadow-2xl overflow-hidden">
                    <div className="h-6 bg-secondary/80 flex items-center gap-1.5 px-3">
                      <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
                    </div>
                    <div className="p-2 space-y-2">
                      <div 
                        className="h-8 rounded"
                        style={{ backgroundColor: template.previewColors[0] }}
                      ></div>
                      <div className="flex gap-2">
                        <div 
                          className="h-12 w-1/2 rounded"
                          style={{ backgroundColor: template.previewColors[1] }}
                        ></div>
                        <div 
                          className="h-12 w-1/2 rounded"
                          style={{ backgroundColor: template.previewColors[2] }}
                        ></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 w-1/3 rounded bg-muted"></div>
                        <div className="h-2 w-1/4 rounded bg-muted/60"></div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-background/90 rounded-full text-sm font-medium text-primary border border-primary/50">
                      Use Template
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${template.gradient} text-white`}>
                      {template.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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

export default Templates;
