#!/bin/bash
# ==========================================
# CuanPintar MVP - Setup Helper
# ==========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          CuanPintar MVP - Setup Helper                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    echo "  Copy from .env.example first"
    exit 1
fi

# Check if Supabase URL is configured
if grep -q "vediyxsldxfptctwnnqh" .env.local; then
    echo -e "${GREEN}✓ Supabase URL configured${NC}"
else
    echo -e "${RED}✗ Supabase URL not configured${NC}"
fi

# Check if anon key is placeholder
if grep -q "demo-placeholder" .env.local; then
    echo -e "${YELLOW}⚠ Anon key is placeholder - need real key${NC}"
    echo ""
    echo -e "${BLUE}To get your real Supabase key:${NC}"
    echo "  1. Go to: https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/settings/api"
    echo "  2. Copy the 'anon public' key (starts with eyJ...)"
    echo "  3. Update .env.local with the real key"
    echo ""
    echo -e "${YELLOW}App will run in DEMO MODE without real Supabase key${NC}"
fi

echo ""
echo -e "${BLUE}Starting development server...${NC}"
echo ""

# Start dev server
npm run dev
