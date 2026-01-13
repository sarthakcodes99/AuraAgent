import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectNameModal from "./ProjectNameModal";
import { Sparkles, Utensils, Stethoscope, GraduationCap, Dumbbell, Coffee, Car, Home, Scissors, Music, Plane, PawPrint, Baby } from "lucide-react";

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
    id: "gym",
    title: "Gym Website",
    description: "Fitness & workout studio",
    prompt: "Create a powerful gym and fitness center website with energetic hero section featuring workout imagery, membership plans with pricing, class schedule grid, trainer profiles, gym facilities showcase, testimonials from members, and a join now CTA. Bold dark theme with energetic accent colors.",
    icon: <Dumbbell className="w-5 h-5" />,
    gradient: "from-red-600 via-orange-500 to-yellow-500",
    previewColors: ["#0a0a0a", "#ef4444", "#f97316"]
  },
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Appetizing food business site",
    prompt: "Create a warm and inviting restaurant website with a full-screen hero image, featured dishes carousel, menu sections with categories and prices, about the chef section, reservation form, location with map placeholder, and customer reviews. Rich warm colors and elegant fonts.",
    icon: <Utensils className="w-5 h-5" />,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    previewColors: ["#1c1917", "#f59e0b", "#dc2626"]
  },
  {
    id: "cafe",
    title: "Coffee Shop",
    description: "Cozy cafe & bakery",
    prompt: "Design a cozy coffee shop website with warm brown tones, hero with steaming coffee imagery, menu with drinks and pastries, about our beans section, cafe ambiance gallery, location and hours, and online ordering CTA. Rustic and inviting feel.",
    icon: <Coffee className="w-5 h-5" />,
    gradient: "from-amber-700 via-amber-600 to-yellow-600",
    previewColors: ["#292524", "#d97706", "#fbbf24"]
  },
  {
    id: "medical",
    title: "Medical Clinic",
    description: "Healthcare practice",
    prompt: "Build a trustworthy healthcare clinic website with a calming hero section, services offered with icons, doctor profiles with credentials, appointment booking form, patient testimonials, insurance information section, and contact details. Clean design with blues and whites for trust.",
    icon: <Stethoscope className="w-5 h-5" />,
    gradient: "from-cyan-500 via-blue-500 to-blue-600",
    previewColors: ["#f0f9ff", "#0891b2", "#1e40af"]
  },
  {
    id: "education",
    title: "Online Course",
    description: "Educational platform",
    prompt: "Design an engaging online course platform landing page with a compelling hero, featured courses grid with thumbnails and ratings, instructor spotlight, learning path visualization, student success stories, pricing plans, and enrollment CTA. Modern and educational feel with vibrant accents.",
    icon: <GraduationCap className="w-5 h-5" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    previewColors: ["#18181b", "#a855f7", "#d946ef"]
  },
  {
    id: "realestate",
    title: "Real Estate",
    description: "Property listings agency",
    prompt: "Create a professional real estate agency website with hero featuring luxury property, property listings grid with filters, featured homes carousel, agent profiles, neighborhood guides, mortgage calculator placeholder, and contact form. Elegant and trustworthy design.",
    icon: <Home className="w-5 h-5" />,
    gradient: "from-slate-600 via-slate-500 to-emerald-500",
    previewColors: ["#0f172a", "#475569", "#10b981"]
  },
  {
    id: "salon",
    title: "Hair Salon",
    description: "Beauty & styling studio",
    prompt: "Design an elegant hair salon and beauty studio website with glamorous hero, services menu with prices, stylist team profiles, before/after gallery, booking form, customer reviews, and products section. Chic and stylish with rose gold accents.",
    icon: <Scissors className="w-5 h-5" />,
    gradient: "from-pink-500 via-rose-400 to-amber-300",
    previewColors: ["#1a1a1a", "#ec4899", "#fcd34d"]
  },
  {
    id: "automotive",
    title: "Car Dealership",
    description: "Auto sales & service",
    prompt: "Build a sleek car dealership website with dynamic hero featuring vehicles, inventory grid with filters, featured cars carousel, financing options, service center info, customer testimonials, and contact form. Modern and professional automotive design.",
    icon: <Car className="w-5 h-5" />,
    gradient: "from-zinc-700 via-zinc-600 to-red-600",
    previewColors: ["#09090b", "#52525b", "#dc2626"]
  },
  {
    id: "music",
    title: "Music Artist",
    description: "Band or solo artist",
    prompt: "Create an edgy music artist website with bold hero featuring artist photo, discography section, upcoming shows/tour dates, music player placeholder, photo gallery, merchandise shop section, and social media links. Dark theme with neon accents.",
    icon: <Music className="w-5 h-5" />,
    gradient: "from-purple-600 via-pink-600 to-cyan-400",
    previewColors: ["#0c0a09", "#a855f7", "#22d3ee"]
  },
  {
    id: "travel",
    title: "Travel Agency",
    description: "Tours & vacation packages",
    prompt: "Design an inspiring travel agency website with stunning destination hero, popular packages grid, destination guides, customer travel stories, booking form, travel tips blog section, and newsletter signup. Vibrant and adventurous feel.",
    icon: <Plane className="w-5 h-5" />,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    previewColors: ["#0c4a6e", "#0ea5e9", "#6366f1"]
  },
  {
    id: "petcare",
    title: "Pet Services",
    description: "Pet grooming & care",
    prompt: "Create a friendly pet services website with adorable hero featuring pets, services offered (grooming, boarding, training), team of caregivers, pet gallery, pricing packages, testimonials from pet parents, and booking form. Playful and warm design.",
    icon: <PawPrint className="w-5 h-5" />,
    gradient: "from-orange-400 via-amber-400 to-lime-400",
    previewColors: ["#fef3c7", "#f97316", "#84cc16"]
  },
  {
    id: "daycare",
    title: "Daycare Center",
    description: "Childcare & early learning",
    prompt: "Design a nurturing daycare center website with cheerful hero, programs by age group, daily activities, safety features, teacher profiles, parent testimonials, enrollment form, and facility tour gallery. Bright, colorful, and trustworthy design.",
    icon: <Baby className="w-5 h-5" />,
    gradient: "from-yellow-400 via-pink-400 to-purple-400",
    previewColors: ["#fef9c3", "#f472b6", "#a78bfa"]
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

          {/* Templates Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template.prompt)}
                  className="group relative rounded-xl overflow-hidden glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Gradient Preview */}
                  <div className="h-16 relative overflow-hidden">
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-70`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`p-2 rounded-lg bg-background/80 text-foreground`}>
                        {template.icon}
                      </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {template.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
