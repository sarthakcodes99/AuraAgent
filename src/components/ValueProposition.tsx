import { Zap, Paintbrush, Code, Rocket } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Build professional websites in minutes, not weeks. Our AI understands your vision and brings it to life instantly."
  },
  {
    icon: Paintbrush,
    title: "Beautiful by Design",
    description: "Every website is crafted with stunning aesthetics and modern design principles built right in."
  },
  {
    icon: Code,
    title: "No Code Required",
    description: "Create complex, feature-rich websites without writing a single line of code. Just describe what you want."
  },
  {
    icon: Rocket,
    title: "Launch Ready",
    description: "From concept to launch in record time. Your website is production-ready from the moment it's generated."
  }
];

const ValueProposition = () => {
  return (
    <section id="features" className="py-24 gradient-dark relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
            Why Choose OnePrompt?
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            The most powerful AI website builder designed for creators, entrepreneurs, and dreamers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 inline-flex p-3 rounded-lg gradient-primary glow-primary">
                <reason.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {reason.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default ValueProposition;
