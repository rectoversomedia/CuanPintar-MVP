/**
 * Conversion Pixel Component
 *
 * This component generates the tracking pixel code that advertisers
 * need to embed on their websites.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download, Code, Eye, EyeOff } from 'lucide-react';

interface TrackingPixelProps {
  programId: string;
  programName: string;
  onCopy?: () => void;
}

export function TrackingPixel({ programId, programName, onCopy }: TrackingPixelProps) {
  const [copied, setCopied] = useState(false);

  // Full JavaScript SDK snippet
  const jsSnippet = `<!-- CuanPintar Conversion Tracking -->
<script>
  !function(w,d,s){
    var c=d.createElement(s),
    p=d.getElementsByTagName(s)[0];
    c.async=1;
    c.src='https://cdn.cuanpintar.com/pixel.min.js';
    c.onload=function(){
      CuanPintar.init({
        programId: '${programId}',
        apiUrl: 'https://api.cuanpintar.com'
      });
    };
    p.parentNode.insertBefore(c,p);
  }(window,document,'script');
</script>

<!-- Track Page View (automatic) -->
<script>
  // Page view is tracked automatically on load
</script>

<!-- Track Conversion Examples -->

<!-- Lead Form Submission -->
<script>
  CuanPintar.track({
    event: 'lead',
    eventId: '${Date.now()}',
    value: 25000,
    customerEmail: 'user@example.com',
    customerPhone: '+6281234567890'
  });
</script>

<!-- Registration Complete -->
<script>
  CuanPintar.track({
    event: 'signup',
    eventId: '${Date.now()}',
    customerId: 'user_12345',
    customerEmail: 'user@example.com',
    customerName: 'John Doe'
  });
</script>

<!-- Purchase Complete -->
<script>
  CuanPintar.track({
    event: 'purchase',
    eventId: '${Date.now()}',
    value: 150000,
    currency: 'IDR',
    customerId: 'user_12345'
  });
</script>

<!-- App Install -->
<script>
  CuanPintar.track({
    event: 'install',
    eventId: '${Date.now()}'
  });
</script>`;

  // Simple image pixel (for servers that block JS)
  const imgPixel = `<!-- CuanPintar Image Pixel -->
<img src="https://api.cuanpintar.com/api/track?type=pixel&pid={partner_id}&prog=${programId}&ch={channel}&fp={fingerprint}"
     width="1" height="1" style="display:none;" />`;

  // Server-side conversion (for form submissions)
  const serverSideExample = `// Node.js Example - Server-side conversion
const axios = require('axios');

async function trackConversion(req, res) {
  const { event, customerEmail, customerPhone, value } = req.body;

  // Get fingerprint from cookie
  const fp = req.cookies['cp_fp'];

  try {
    const response = await axios.post('https://api.cuanpintar.com/api/track', {
      type: 'conversion',
      event,
      eventId: '${Date.now()}',
      programId: '${programId}',
      partnerId: req.cookies['cp_pid'],
      channel: req.cookies['cp_ch'],
      fingerprint: fp,
      value,
      customerEmail,
      customerPhone,
      ip: req.ip
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
      }
    });

    res.json({ success: true, conversionId: response.data.conversionId });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            JavaScript SDK
          </CardTitle>
          <CardDescription>
            Paste this code before the closing &lt;/head&gt; tag on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
              <code>{jsSnippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => {
                navigator.clipboard.writeText(jsSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                onCopy?.();
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Image Pixel (Fallback)
          </CardTitle>
          <CardDescription>
            Use this if JavaScript is blocked. Less accurate but works on all pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{imgPixel}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => {
                navigator.clipboard.writeText(imgPixel);
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server-Side Integration</CardTitle>
          <CardDescription>
            For form submissions that happen server-side (recommended for best accuracy)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto">
              <code>{serverSideExample}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => {
                navigator.clipboard.writeText(serverSideExample);
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Integration Tips</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Place the main SDK script in your &lt;head&gt; tag</li>
            <li>• Call <code>CuanPintar.track()</code> when a conversion happens</li>
            <li>• Use the <code>eventId</code> to prevent duplicate tracking</li>
            <li>• Include customer data for better fraud detection</li>
            <li>• Test with ?debug=1 parameter to see tracking in console</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage example
export function TrackingPixelUsageExample() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-4">Quick Reference</h3>

      <div className="space-y-4 text-sm">
        <div>
          <Label className="text-gray-600">Track Registration</Label>
          <pre className="bg-white p-2 rounded mt-1 border">
            {`CuanPintar.track({
  event: 'signup',
  customerId: 'user_123',
  customerEmail: 'user@email.com'
});`}
          </pre>
        </div>

        <div>
          <Label className="text-gray-600">Track Purchase</Label>
          <pre className="bg-white p-2 rounded mt-1 border">
            {`CuanPintar.track({
  event: 'purchase',
  value: 150000,
  customerId: 'user_123'
});`}
          </pre>
        </div>

        <div>
          <Label className="text-gray-600">Track Lead</Label>
          <pre className="bg-white p-2 rounded mt-1 border">
            {`CuanPintar.track({
  event: 'lead',
  customerPhone: '+6281234567890',
  customerEmail: 'user@email.com'
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
