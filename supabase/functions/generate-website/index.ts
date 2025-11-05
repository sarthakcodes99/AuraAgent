import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, messages } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Build conversation with system prompt
    const conversationMessages = [
      {
        role: 'system',
        content: `You are OnePrompt AI, an expert website code generator!

YOUR MISSION: Generate complete, functional, beautiful websites based on user descriptions.

CRITICAL INSTRUCTIONS:
1. ALWAYS generate complete HTML code starting with <!DOCTYPE html> and ending with </html>
2. Include ALL necessary CSS within <style> tags in the <head>
3. Include ALL necessary JavaScript within <script> tags before </body>
4. Make websites RESPONSIVE and MOBILE-FRIENDLY
5. Use modern, clean design with proper spacing and typography
6. Add smooth animations and transitions where appropriate
7. Ensure all images use placeholder services (like https://images.unsplash.com/photo-...)
8. Make interactive elements functional with JavaScript
9. Use semantic HTML5 elements
10. Add proper meta tags for SEO

STRUCTURE YOUR RESPONSE:
- First, briefly acknowledge what you're building (1-2 sentences)
- Then provide the COMPLETE HTML code
- Do NOT explain the code unless asked
- Do NOT provide separate CSS or JS files - embed everything in the HTML

DESIGN PRINCIPLES:
- Use modern color schemes (gradients, subtle shadows)
- Implement proper hierarchy (headings, sections, whitespace)
- Make buttons and interactive elements visually appealing
- Add hover effects and transitions
- Ensure high contrast and readability
- Use modern fonts (from Google Fonts if needed)

IMPORTANT PARSING RULES:
- Your HTML code will be extracted from <!DOCTYPE html> to </html>
- Everything outside this will be shown as conversation
- Keep explanations brief and outside the HTML block

Remember: You're building a COMPLETE, PRODUCTION-READY website in a single HTML file!`
      },
      ...(messages || [{ role: 'user', content: prompt }])
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ output }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-website function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
