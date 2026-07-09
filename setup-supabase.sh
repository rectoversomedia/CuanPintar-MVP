#!/bin/bash
# Setup script for CuanPintar MVP with Supabase
# Run this after you have the correct API keys

echo "🔧 CuanPintar MVP - Supabase Setup"
echo "================================"

# Check if keys are configured
if grep -q "YOUR_ANON_KEY_HERE" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  API Keys belum dikonfigurasi!"
    echo ""
    echo "Langkah 1: Buka Supabase Dashboard"
    echo "   https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/settings/api"
    echo ""
    echo "Langkah 2: Copy API Keys (format JWT: eyJhbGci...)"
    echo "   - anon/public key"
    echo "   - service_role key"
    echo ""
    echo "Langkah 3: Paste ke .env.local"
    echo ""
    echo "Langkah 4: Jalankan script ini lagi"
    echo ""
    echo "Atau, paste API keys sekarang:"
    echo ""
    read -p "anon key (eyJ...): " ANON_KEY
    read -p "service_role key (eyJ...): " SERVICE_KEY

    # Update .env.local
    sed -i '' "s|YOUR_ANON_KEY_HERE|$ANON_KEY|g" .env.local
    sed -i '' "s|YOUR_SERVICE_ROLE_KEY_HERE|$SERVICE_KEY|g" .env.local

    echo ""
    echo "✅ Keys diupdate!"
fi

# Reload environment
source .env.local 2>/dev/null

echo ""
echo "Testing connection..."
echo ""

# Test connection with anon key
RESPONSE=$(curl -s "https://vediyxsldxfptctwnnqh.supabase.co/rest/v1/advertisers?select=id&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY")

if echo "$RESPONSE" | grep -q "connection error\|Invalid API\|could not"; then
    echo "❌ Connection failed!"
    echo "Response: $RESPONSE"
    echo ""
    echo "Pastikan API keys sudah benar di .env.local"
else
    echo "✅ Connection successful!"
    echo "   Response: $RESPONSE"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Buka phpMyAdmin atau Supabase Dashboard untuk input seed data"
echo "   2. Atau jalankan INSERT queries manual"
echo ""
