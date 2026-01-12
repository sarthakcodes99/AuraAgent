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

    console.log('Sending to n8n webhook:', { prompt: userMessage, messagesCount: messages?.length });

    const response = await fetch('https://sarthak9999.app.n8n.cloud/webhook-test/c3096ee7-61c2-4b56-98fd-cf380dd6d2f8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
        messages: messages || [{ role: 'user', content: userMessage }]
      }),
    });

    console.log('n8n response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('n8n webhook error:', error);
      throw new Error(`n8n webhook error: ${response.status} - ${error}`);
    }

    const responseText = await response.text();
    console.log('n8n response text length:', responseText.length);
    console.log('n8n response preview:', responseText.substring(0, 200));

    if (!responseText || responseText.trim() === '') {
      throw new Error('n8n webhook returned empty response');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // If it's not JSON, treat the response text as the output directly
      return new Response(
        JSON.stringify({ output: responseText }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

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
