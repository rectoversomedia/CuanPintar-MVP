/**
 * Supabase Service Worker / Edge Function
 *
 * Place this in supabase/functions/ for background processing
 * Handles: webhook delivery, email sending, fraud detection
 */

// Quick fraud detection function
export function detectFraud(conversion: {
  ip_address?: string;
  device_id?: string;
  fingerprint?: string;
  utms?: Record<string, string>;
  created_at?: string;
}): {
  isFraud: boolean;
  score: number;
  signals: string[];
} {
  const signals: string[] = [];
  let score = 100;

  // Check for duplicate IP (simple example)
  // In production, check against database
  const recentFromSameIP = 0; // Would query database
  if (recentFromSameIP > 10) {
    signals.push('high_ip_volume');
    score -= 30;
  }

  // Check for VPN/Proxy indicators
  const suspiciousIPs = ['192.168.1.104', '10.0.0.1']; // Would check against VPN list
  if (suspiciousIPs.includes(conversion.ip_address || '')) {
    signals.push('proxy_vpn');
    score -= 25;
  }

  // Check UTM consistency
  if (!conversion.utms || Object.keys(conversion.utms).length === 0) {
    signals.push('no_utm');
    score -= 10;
  }

  // Check fingerprint
  if (!conversion.fingerprint) {
    signals.push('no_fingerprint');
    score -= 15;
  }

  return {
    isFraud: score < 50,
    score: Math.max(0, Math.min(100, score)),
    signals,
  };
}

// Event notification function
export async function sendNotification(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
  }
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      created_at: new Date().toISOString(),
    }),
  });

  return response.ok;
}

// Main edge function handler
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'fraud-check': {
        const body = await req.json();
        const result = detectFraud(body.conversion);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'notify': {
        const body = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        await sendNotification(supabaseUrl, supabaseKey, body.userId, body.notification);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
