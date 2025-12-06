import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Templates from "@/components/Templates";
import ValueProposition from "@/components/ValueProposition";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Templates />
        <ValueProposition />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
