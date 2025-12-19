import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    const validUsername = Deno.env.get('AUTH_USERNAME');
    const validPassword = Deno.env.get('AUTH_PASSWORD');

    console.log('Auth attempt for username:', username);

    if (!validUsername || !validPassword) {
      console.error('Auth credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Authentication not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (username === validUsername && password === validPassword) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      
      console.log('Auth successful');
      return new Response(
        JSON.stringify({ success: true, token, username }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Auth failed - invalid credentials');
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
