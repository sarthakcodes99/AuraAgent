import { Brain, Users, Target } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Starry Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            About AuraAgent
          </h2>
          <p className="text-xl text-foreground/80 leading-relaxed">
            AuraAgent is revolutionizing web development by combining the power of artificial intelligence 
            with intuitive design principles. We believe that everyone should have the ability to bring
            their ideas to life on the web, without the barriers of technical complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full gradient-primary glow-primary">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold">AI-Powered</h3>
            <p className="text-foreground/70">
              Advanced AI technology that understands your vision and translates it into beautiful, functional websites.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full gradient-primary glow-primary">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold">User-Focused</h3>
            <p className="text-foreground/70">
              Built for creators of all skill levels, from complete beginners to experienced developers.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full gradient-primary glow-primary">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold">Results-Driven</h3>
            <p className="text-foreground/70">
              Every feature is designed to help you achieve your goals faster and more effectively.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
