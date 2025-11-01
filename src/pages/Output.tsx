import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Output = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [typedText, setTypedText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetingText = "hey, what are we building today?";

  useEffect(() => {
    if (showGreeting) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < greetingText.length) {
          setTypedText(greetingText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [showGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    setShowGreeting(false);
    
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage = { role: 'ai' as const, content: '🔄 Generating your website...' };
    setMessages(prev => [...prev, loadingMessage]);
    
    setIsGenerating(true);
    const currentInput = inputValue;
    setInputValue("");

    try {
      const response = await fetch('https://sarthak12345.app.n8n.cloud/webhook-test/e0d53415-462c-4b12-bd13-07cf1a032de9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          user_id: user?.id || 'anonymous'
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      
      console.log('AI Response:', result);

      // Display raw AI response
      const responseText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'ai' as const, 
          content: responseText
        };
        return updated;
      });
      
      toast.success("Response generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'ai' as const, 
          content: '❌ Generation failed, please try again' 
        };
        return updated;
      });
      toast.error("Failed to generate website");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-glow">OnePrompt</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              {user ? (
                <Button variant="ghost" onClick={signOut}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button className="gradient-primary btn-glow border-0" onClick={() => navigate("/signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex pt-20">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-background/50 max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {showGreeting && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <h1 className="text-4xl font-bold text-primary animate-fade-in">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </h1>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end mb-4">
                    <div className="glass-card bg-primary/20 border-primary/30 p-4 rounded-2xl max-w-[80%]">
                      <p className="text-foreground font-medium text-base leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border bg-background/80">
            <div className="flex gap-3 items-end justify-center">
              <Input
                placeholder="Describe your website..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-[70%] h-16 text-base"
                disabled={isGenerating}
              />
              <Button 
                onClick={handleSend}
                className="gradient-primary btn-glow border-0 h-16 px-6"
                disabled={!inputValue.trim() || isGenerating}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
