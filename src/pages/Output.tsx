import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const Output = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInput = location.state?.userInput || "Your website idea";
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage = { 
        role: 'ai' as const, 
        content: `I'll ${inputValue.toLowerCase()}. Updating your website now...` 
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
    
    setInputValue("");
  };

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
        <div className="w-80 border-r border-border bg-card/40 p-6 flex flex-col">
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

          {/* Chat Messages */}
          <div className="flex-1 mt-6 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`glass-card p-3 rounded-lg max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-primary/20 border-primary/30' 
                    : 'bg-card/60'
                }`}>
                  <p className="text-foreground/90 text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Describe changes to your website..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend}
              className="w-full gradient-primary btn-glow border-0"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Main Content Area - Website Preview */}
        <div className="flex-1 bg-background p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-lg overflow-hidden">
              {/* Sample Website Preview */}
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Generated Website</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
                      header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; }
                      nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
                      nav h1 { font-size: 1.5rem; }
                      nav ul { display: flex; gap: 2rem; list-style: none; }
                      nav a { color: white; text-decoration: none; transition: opacity 0.3s; }
                      nav a:hover { opacity: 0.8; }
                      .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; }
                      .hero h2 { font-size: 2.5rem; margin-bottom: 1rem; }
                      .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
                      .btn { background: white; color: #667eea; padding: 0.75rem 2rem; border: none; border-radius: 5px; font-size: 1rem; cursor: pointer; transition: transform 0.2s; }
                      .btn:hover { transform: scale(1.05); }
                      .section { padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; }
                      .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
                      .feature { padding: 2rem; background: #f7fafc; border-radius: 10px; text-align: center; }
                      .contact-form { max-width: 500px; margin: 2rem auto; }
                      .contact-form input, .contact-form textarea { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 5px; }
                      .contact-form button { width: 100%; }
                      footer { background: #2d3748; color: white; text-align: center; padding: 2rem; }
                    </style>
                  </head>
                  <body>
                    <header>
                      <nav>
                        <h1>Your Website</h1>
                        <ul>
                          <li><a href="#home" onclick="scrollToSection('home')">Home</a></li>
                          <li><a href="#features" onclick="scrollToSection('features')">Features</a></li>
                          <li><a href="#contact" onclick="scrollToSection('contact')">Contact</a></li>
                        </ul>
                      </nav>
                    </header>
                    
                    <section id="home" class="hero">
                      <h2>Welcome to Your New Website</h2>
                      <p>Built with AI in seconds</p>
                      <button class="btn" onclick="alert('Button clicked! This is fully functional.')">Get Started</button>
                    </section>
                    
                    <section id="features" class="section">
                      <h2 style="text-align: center; margin-bottom: 1rem;">Features</h2>
                      <div class="features">
                        <div class="feature">
                          <h3>Fast Performance</h3>
                          <p>Lightning-fast load times</p>
                        </div>
                        <div class="feature">
                          <h3>Responsive Design</h3>
                          <p>Works on all devices</p>
                        </div>
                        <div class="feature">
                          <h3>Easy to Use</h3>
                          <p>Intuitive interface</p>
                        </div>
                      </div>
                    </section>
                    
                    <section id="contact" class="section">
                      <h2 style="text-align: center; margin-bottom: 1rem;">Contact Us</h2>
                      <form class="contact-form" onsubmit="handleSubmit(event)">
                        <input type="text" placeholder="Your Name" required />
                        <input type="email" placeholder="Your Email" required />
                        <textarea placeholder="Your Message" rows="5" required></textarea>
                        <button type="submit" class="btn">Send Message</button>
                      </form>
                    </section>
                    
                    <footer>
                      <p>&copy; 2025 Your Website. All rights reserved.</p>
                    </footer>
                    
                    <script>
                      function scrollToSection(id) {
                        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
                      }
                      
                      function handleSubmit(e) {
                        e.preventDefault();
                        alert('Form submitted successfully! (This is a demo)');
                        e.target.reset();
                      }
                    </script>
                  </body>
                  </html>
                `}
                title="Website Preview"
                className="w-full h-[800px] border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
