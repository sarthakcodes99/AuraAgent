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

    // Build the prompt for n8n webhook
    const userMessage = prompt || (messages && messages[messages.length - 1]?.content) || '';

    const response = await fetch('https://sarthak9900.app.n8n.cloud/webhook/b5bb33b2-77cd-4d3f-9058-ae55125c1c40', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
        messages: messages || [{ role: 'user', content: userMessage }]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('n8n webhook error:', error);
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.output || data.response || data.content || JSON.stringify(data);

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
