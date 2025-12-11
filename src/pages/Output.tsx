import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, ArrowDown, Copy, Check, Download, Square, Bot } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Output = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string, timestamp?: Date }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [currentCode, setCurrentCode] = useState<{html: string[], css: string[], js: string[]} | null>(null);
  const [chatWidth, setChatWidth] = useState(20); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialInputProcessed = useRef(false);
  const projectIdRef = useRef<string | null>(null);

  const greetingText = user && profile?.name 
    ? `hey ${profile.name}, what are we building today?` 
    : "hey, what are we building today?";

  // Handle initial input from main page
  useEffect(() => {
    const initialInput = location.state?.userInput;
    const projectId = location.state?.projectId;
    
    if (projectId) {
      projectIdRef.current = projectId;
    }
    
    if (initialInput && !initialInputProcessed.current) {
      initialInputProcessed.current = true;
      setInputValue(initialInput);
      // Automatically send the initial input
      setTimeout(() => {
        handleSendWithInput(initialInput);
      }, 500);
    }
  }, [location.state]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 0 && newWidth <= 50) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      document.addEventListener('mousemove', handleMouseMove, { capture: true });
      document.addEventListener('mouseup', handleMouseUp, { capture: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, [isResizing]);

  const extractHtmlAndText = (content: string) => {
    // Extract HTML files (from <!DOCTYPE html> to </html>)
    const htmlPattern = /<!DOCTYPE html>[\s\S]*?<\/html>/gi;
    const htmlMatches = content.match(htmlPattern) || [];
    
    // Extract CSS code blocks
    const cssPattern = /```css\n([\s\S]*?)```/gi;
    const cssMatches = [...content.matchAll(cssPattern)].map(m => m[1]);
    
    // Extract JavaScript code blocks
    const jsPattern = /```(?:javascript|js)\n([\s\S]*?)```/gi;
    const jsMatches = [...content.matchAll(jsPattern)].map(m => m[1]);
    
    // Extract HTML code blocks (including those that might contain full documents)
    const htmlBlockPattern = /```html\n([\s\S]*?)```/gi;
    const htmlBlockMatches = [...content.matchAll(htmlBlockPattern)].map(m => m[1]);
    
    // Check if HTML block contains a full document
    const fullHtmlFromBlocks = htmlBlockMatches.filter(block => 
      block.includes('<!DOCTYPE html>') || block.includes('<html')
    );
    
    // Use either raw HTML matches or HTML from code blocks
    const allHtmlDocs = [...htmlMatches, ...fullHtmlFromBlocks];
    
    if (allHtmlDocs.length > 0) {
      let mainHtml = allHtmlDocs[0];
      
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
      
      // Inject navigation handler script to fix internal links
      const navHandlerScript = `<script>
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link) {
            const href = link.getAttribute('href');
            if (href) {
              // Allow anchor links to work normally
              if (href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              } 
              // Handle same-page navigation (e.g., page.html, /about)
              else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                e.preventDefault();
                // For single-page preview, just scroll to top or show section
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }
        });
      </script>`;
      
      if (mainHtml.includes('</body>')) {
        mainHtml = mainHtml.replace('</body>', `${navHandlerScript}\n</body>`);
      } else {
        mainHtml = mainHtml.replace('</html>', `${navHandlerScript}\n</html>`);
      }
      
      // Remove ALL code from text content - keep only explanations
      let textContent = content;
      
      // Remove raw HTML documents (from <!DOCTYPE html> to </html>)
      htmlMatches.forEach(html => {
        textContent = textContent.replace(html, '');
      });
      
      // Remove ALL markdown code blocks (```html, ```css, ```javascript, ```js, etc.)
      textContent = textContent.replace(/```(?:html|css|javascript|js)?\n[\s\S]*?```/gi, '');
      
      // Clean up extra whitespace and newlines
      textContent = textContent.replace(/\n{3,}/g, '\n\n').trim();
      
      return { 
        htmlCode: mainHtml, 
        textContent,
        allCode: {
          html: allHtmlDocs,
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
    }
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    setIsGenerating(false);
    toast.info("Generation stopped");
  };

  const saveProjectHtml = async (htmlContent: string) => {
    if (!projectIdRef.current || !user) return;
    
    try {
      const { error } = await supabase
        .from("projects")
        .update({ html_content: htmlContent })
        .eq("id", projectIdRef.current);

      if (error) throw error;
      toast.success("Project saved!");
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleSendWithInput = async (input: string) => {
    if (!input.trim() || isGenerating) return;
    
    setShowGreeting(false);
    
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage = { role: 'ai' as const, content: '...' };
    setMessages(prev => [...prev, loadingMessage]);
    
    setIsGenerating(true);
    setInputValue("");

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages history for the AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: input
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: input,
          messages: conversationHistory
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
      typewriterIntervalRef.current = setInterval(() => {
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
          if (typewriterIntervalRef.current) {
            clearInterval(typewriterIntervalRef.current);
            typewriterIntervalRef.current = null;
          }
          setUserScrolling(false);
          setIsGenerating(false);
          
          // Save the project if projectId exists
          if (projectIdRef.current && htmlCode) {
            saveProjectHtml(htmlCode);
          }
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
            content: 'Generation stopped by user' 
          };
          return updated;
        });
        setIsGenerating(false);
      } else {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'ai' as const, 
            content: 'Generation failed' 
          };
          return updated;
        });
        toast.error("Failed to generate website");
        setIsGenerating(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    await handleSendWithInput(inputValue);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-glow">AuraAgent</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/my-projects")}>
                    My Projects
                  </Button>
                  <Button variant="ghost" onClick={signOut}>
                    Logout
                  </Button>
                </>
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
      <div className="flex-1 flex pt-20 overflow-hidden relative">
        {/* Left Section - Chat */}
        <div 
          className="h-full flex flex-col border-r border-border overflow-hidden relative"
          style={{ width: `${chatWidth}%` }}
        >
          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 -right-2 w-4 h-full cursor-col-resize hover:bg-primary/20 z-50 ${isResizing ? 'bg-primary/30' : ''}`}
            style={{ touchAction: 'none' }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-50 group-hover:opacity-100">
              <div className="w-1 h-12 bg-primary/50 rounded-full" />
            </div>
          </div>
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
                    <div className="max-w-[80%]">
                      <div className="glass-card bg-primary/20 border-primary/30 p-4 rounded-2xl">
                        <p className="text-foreground font-semibold text-lg leading-relaxed tracking-wide" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        <Button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        {msg.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                 ) : (
                  <div className="mb-4">
                    {msg.content === '...' ? (
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-medium animate-pulse">Agent is building your site!</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
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
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      </div>
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
          <div className="p-6 border-t border-border bg-background/95 backdrop-blur-md min-w-0">
            <div className="flex gap-3 items-end min-w-0">
              <Textarea
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
                className="flex-1 min-h-[3rem] max-h-[200px] resize-none text-base min-w-0 overflow-hidden"
                disabled={isGenerating}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />
              {isGenerating ? (
                <Button 
                  onClick={handleStop}
                  className="bg-destructive hover:bg-destructive/90 border-0 shrink-0"
                  size="icon"
                >
                  <Square className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSend}
                  className="gradient-primary btn-glow border-0 shrink-0"
                  disabled={!inputValue.trim()}
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Preview */}
        <div 
          className="h-full flex flex-col bg-muted/20 overflow-hidden relative"
          style={{ width: `${100 - chatWidth}%` }}
        >
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
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
