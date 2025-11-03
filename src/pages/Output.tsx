import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, ArrowDown, Copy, Check, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Output = () => {
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const greetingText = user && profile?.name 
    ? `hey ${profile.name}, what are we building today?` 
    : "hey, what are we building today?";

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
  }, [showGreeting, greetingText]);

  useEffect(() => {
    if (!userScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolling]);

  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isAtBottom && messages.length > 0);
      
      if (isAtBottom) {
        setUserScrolling(false);
      }
    };

    const container = messagesContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const scrollToBottom = () => {
    setUserScrolling(false);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollStart = () => {
    setUserScrolling(true);
  };

  const extractHtmlAndText = (content: string) => {
    const htmlPattern = /<!DOCTYPE html>[\s\S]*?<\/html>/i;
    const match = content.match(htmlPattern);
    
    if (match) {
      const htmlCode = match[0];
      const textBefore = content.slice(0, match.index);
      const textAfter = content.slice(match.index! + htmlCode.length);
      const textContent = (textBefore + textAfter).trim();
      
      return { htmlCode, textContent };
    }
    
    return { htmlCode: null, textContent: content };
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadCode = (code: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded as index.html!");
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    setShowGreeting(false);
    
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage = { role: 'ai' as const, content: '...' };
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

      // Extract and display only the output field
      const outputText = result.output || 'No response generated';
      
      // Typewriter effect for AI response
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'ai' as const, 
          content: ''
        };
        return updated;
      });

      // Extract HTML code and text
      const { htmlCode, textContent } = extractHtmlAndText(outputText);
      
      // If HTML code exists, update preview
      if (htmlCode) {
        setPreviewHtml(htmlCode);
      }
      
      // Typewriter effect for text content only
      let currentIndex = 0;
      const displayText = textContent || outputText;
      const typeInterval = setInterval(() => {
        if (currentIndex < displayText.length) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: 'ai' as const, 
              content: displayText.slice(0, currentIndex + 1)
            };
            return updated;
          });
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setUserScrolling(false);
        }
      }, 10); // Very fast typing speed
      
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

      {/* Main Content Area - Two Sections */}
      <div className="flex-1 flex pt-20 relative">
        {/* Left Section - Chat */}
        <div className="w-1/5 flex flex-col border-r border-border">
          <div 
            ref={messagesContainerRef}
            onWheel={handleScrollStart}
            onTouchMove={handleScrollStart}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
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
                      <p className="text-foreground font-semibold text-lg leading-relaxed tracking-wide" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    {msg.content === '...' ? (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">{msg.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              className="absolute bottom-32 left-[calc(10%-24px)] rounded-full w-12 h-12 shadow-lg gradient-primary btn-glow border-0 z-40"
              size="icon"
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
          )}

          {/* Fixed Input Area at Bottom of Chat Section */}
          <div className="p-6 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex gap-3 items-end">
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
                className="flex-1 h-16 text-base"
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

        {/* Right Section - Preview */}
        <div className="w-4/5 flex flex-col bg-muted/20">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-lg">Preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Output;
