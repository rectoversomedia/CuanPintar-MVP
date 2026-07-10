#!/bin/bash
# ============================================
# CuanPintar MVP - Database Setup Script
# Run this from project root
# ============================================

set -e

echo "🚀 CuanPintar Database Setup"
echo "=============================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install from: https://github.com/supabase/cli"
    exit 1
fi

# Link to project
echo "📡 Linking to Supabase project..."
supabase link --project-ref vediyxsldxfptctwnnqh

# Push schema
echo "📦 Creating tables..."
supabase db push --db-url "$SUPABASE_DB_URL"

echo "✅ Database setup complete!"
echo ""
echo "Now run the seed data manually in Supabase Dashboard:"
echo "https://vediyxsldxfptctwnnqh.supabase.co/project/-/editor"
