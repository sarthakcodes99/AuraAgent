import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, ArrowDown, Copy, Check, Download, Square } from "lucide-react";
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
  const [currentCode, setCurrentCode] = useState<{html: string[], css: string[], js: string[]} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    // Extract HTML files
    const htmlPattern = /<!DOCTYPE html>[\s\S]*?<\/html>/gi;
    const htmlMatches = content.match(htmlPattern) || [];
    
    // Extract CSS code blocks
    const cssPattern = /```css\n([\s\S]*?)```/gi;
    const cssMatches = [...content.matchAll(cssPattern)].map(m => m[1]);
    
    // Extract JavaScript code blocks
    const jsPattern = /```(?:javascript|js)\n([\s\S]*?)```/gi;
    const jsMatches = [...content.matchAll(jsPattern)].map(m => m[1]);
    
    if (htmlMatches.length > 0) {
      let mainHtml = htmlMatches[0];
      
      // Inject CSS into HTML
      if (cssMatches.length > 0) {
        const cssContent = cssMatches.join('\n');
        const styleTag = `<style>\n${cssContent}\n</style>`;
        
        if (mainHtml.includes('</head>')) {
          mainHtml = mainHtml.replace('</head>', `${styleTag}\n</head>`);
        } else {
          mainHtml = mainHtml.replace('<html>', `<html>\n<head>${styleTag}</head>`);
        }
      }
      
      // Inject JS into HTML
      if (jsMatches.length > 0) {
        const jsContent = jsMatches.join('\n');
        const scriptTag = `<script>\n${jsContent}\n</script>`;
        
        if (mainHtml.includes('</body>')) {
          mainHtml = mainHtml.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          mainHtml = mainHtml.replace('</html>', `${scriptTag}\n</html>`);
        }
      }
      
      // Remove code blocks and HTML from text content
      let textContent = content;
      htmlMatches.forEach(html => {
        textContent = textContent.replace(html, '');
      });
      textContent = textContent.replace(/```(?:css|javascript|js|html)\n[\s\S]*?```/gi, '');
      textContent = textContent.trim();
      
      return { 
        htmlCode: mainHtml, 
        textContent,
        allCode: {
          html: htmlMatches,
          css: cssMatches,
          js: jsMatches
        }
      };
    }
    
    return { htmlCode: null, textContent: content, allCode: null };
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadCode = (code: string, filename: string = 'index.html') => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Code downloaded as ${filename}!`);
  };

  const downloadAllCode = () => {
    if (currentCode) {
      // Download combined HTML with embedded CSS and JS
      downloadCode(previewHtml, 'website.html');
      
      // Download separate CSS files
      currentCode.css.forEach((css, idx) => {
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `style${idx > 0 ? idx + 1 : ''}.css`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      
      // Download separate JS files
      currentCode.js.forEach((js, idx) => {
        const blob = new Blob([js], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `script${idx > 0 ? idx + 1 : ''}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      
      toast.success("All code files downloaded!");
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      toast.info("Generation stopped");
    }
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

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('https://sarthak12345.app.n8n.cloud/webhook-test/e0d53415-462c-4b12-bd13-07cf1a032de9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          user_id: user?.id || 'anonymous'
        }),
        signal: abortControllerRef.current.signal
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
      const { htmlCode, textContent, allCode } = extractHtmlAndText(outputText);
      
      // If HTML code exists, update preview
      if (htmlCode) {
        setPreviewHtml(htmlCode);
        if (allCode) {
          setCurrentCode(allCode);
        }
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
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Check if the error was due to abort
      if (error.name === 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'ai' as const, 
            content: '⏹️ Generation stopped by user' 
          };
          return updated;
        });
      } else {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'ai' as const, 
            content: '❌ Generation failed, please try again' 
          };
          return updated;
        });
        toast.error("Failed to generate website");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
      <div className="flex-1 flex pt-20 overflow-hidden">
        {/* Left Section - Chat */}
        <div className="w-1/5 h-full flex flex-col border-r border-border overflow-hidden">
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
                      <>
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">{msg.content}</p>
                        {idx === messages.length - 1 && currentCode && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => copyToClipboard(previewHtml, idx)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              Copy Code
                            </Button>
                            <Button
                              onClick={downloadAllCode}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download All
                            </Button>
                          </div>
                        )}
                      </>
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
                    if (!isGenerating) {
                      handleSend();
                    }
                  }
                }}
                className="flex-1 h-16 text-base"
                disabled={isGenerating}
              />
              {isGenerating ? (
                <Button 
                  onClick={handleStop}
                  className="bg-destructive hover:bg-destructive/90 border-0 h-16 px-6"
                >
                  <Square className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSend}
                  className="gradient-primary btn-glow border-0 h-16 px-6"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Preview */}
        <div className="w-4/5 h-full flex flex-col bg-muted/20 overflow-hidden">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-scripts"
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
