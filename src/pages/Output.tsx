import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseAndSeparateCode } from "@/utils/codeParser";

const Output = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userInput = location.state?.userInput || "Your website idea";
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [websiteContent, setWebsiteContent] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = (html: string, css: string, js: string) => {
    const fullContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Website</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `;
    setWebsiteContent(fullContent);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage = { role: 'ai' as const, content: '🔄 Generating your website...' };
    setMessages(prev => [...prev, loadingMessage]);
    
    setIsGenerating(true);
    const currentInput = inputValue;
    setInputValue("");

    try {
      const response = await fetch('https://sarthak123.app.n8n.cloud/webhook-test/98eaee2b-93d4-4c19-ab21-44e8b7fda406', {
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
      
      console.log('n8n Response:', result);

      // Use smart parser to separate code and text
      const parsed = parseAndSeparateCode(result);
      
      console.log('Parsed output:', parsed);

      if (parsed.html || parsed.css || parsed.js) {
        updatePreview(parsed.html, parsed.css, parsed.js);
        
        // Show plain text response in chat if available
        const responseText = parsed.text || '✅ Website generated successfully! Check the preview on the right.';
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'ai' as const, 
            content: responseText
          };
          return updated;
        });
        
        toast.success("Website generated successfully!");
      } else {
        throw new Error('No code content detected in response');
      }
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
              disabled={!inputValue.trim() || isGenerating}
            >
              <Send className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Send'}
            </Button>
          </div>
        </div>

        {/* Main Content Area - Website Preview */}
        <div className="flex-1 bg-background overflow-hidden">
          <div className="w-full h-full">
            {/* Website Preview */}
            <iframe
              ref={iframeRef}
              srcDoc={websiteContent || `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                      }
                      h1 {
                        font-size: 3rem;
                        font-weight: 700;
                        text-align: center;
                        padding: 2rem;
                        animation: fadeIn 1s ease-in;
                      }
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    </style>
                  </head>
                  <body>
                    <h1>YOUR WEBSITE LOADS HERE!</h1>
                  </body>
                  </html>
                `}
                title="Website Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
