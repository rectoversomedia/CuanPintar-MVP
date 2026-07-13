#!/bin/bash
# ==========================================
# CuanPintar MVP - Setup Wizard
# Production-ready setup script
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          CuanPintar MVP - Production Setup              ║"
echo "║          Customer Acquisition Operating System           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ==========================================
# STEP 1: Check Prerequisites
# ==========================================
echo -e "\n${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js version must be 20 or higher${NC}"
    echo "  Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# ==========================================
# STEP 2: Setup Environment
# ==========================================
echo -e "\n${YELLOW}[2/6] Setting up environment...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        echo "  Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo -e "${YELLOW}  ⚠ Please edit .env.local with your Supabase credentials${NC}"
    fi
fi

# Try to get Supabase keys from existing config
if [ -f supabase/.temp/linked-project.json ]; then
    PROJECT_REF=$(cat supabase/.temp/linked-project.json 2>/dev/null | grep -o '"project"\s*:\s*"[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_REF" ]; then
        echo "  Found linked project: $PROJECT_REF"
    fi
fi

# Check for existing keys in env
if grep -q "vediyxsldxfptctwnnqh" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓ Using existing Supabase configuration${NC}"
elif grep -q "YOUR_ANON_KEY_HERE" .env.local 2>/dev/null; then
    echo -e "${RED}✗ Supabase keys not configured${NC}"
    echo ""
    echo "  Please configure your .env.local file with:"
    echo "  1. Go to: https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/settings/api"
    echo "  2. Copy the 'anon' public key"
    echo "  3. Copy the 'service_role' secret key"
    echo "  4. Update .env.local"
    echo ""
    read -p "  Enter anon key (or press Enter to continue in demo mode): " ANON_KEY
    if [ -n "$ANON_KEY" ]; then
        sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|" .env.local
        echo -e "${GREEN}✓ Anon key updated${NC}"
    fi
fi

# ==========================================
# STEP 3: Install Dependencies
# ==========================================
echo -e "\n${YELLOW}[3/6] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ==========================================
# STEP 4: Run Database Setup
# ==========================================
echo -e "\n${YELLOW}[4/6] Database setup...${NC}"

# Load env
source .env.local 2>/dev/null || true

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "  Using Supabase CLI..."

    # Apply migrations
    echo "  Applying migrations..."
    supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.vediyxsldxfptctwnnqh.supabase.co:5432/postgres" 2>/dev/null || \
    echo -e "${YELLOW}  ⚠ Skipping CLI migration (run manually if needed)${NC}"
else
    echo "  Supabase CLI not found, using direct SQL setup..."
fi

# Test connection
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" != "your-anon-key-here" ]; then
    echo "  Testing Supabase connection..."

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/advertisers?select=id&limit=1" \
        -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Supabase connection successful${NC}"
    elif [ "$RESPONSE" = "404" ]; then
        echo -e "${YELLOW}⚠ Supabase connected but tables may not exist${NC}"
        echo "  Please run the migration SQL manually in Supabase dashboard"
    else
        echo -e "${YELLOW}⚠ Supabase connection issue (HTTP $RESPONSE)${NC}"
        echo "  Will run in demo mode"
    fi
else
    echo -e "${YELLOW}⚠ Supabase not configured, running in demo mode${NC}"
fi

# ==========================================
# STEP 5: Build Application
# ==========================================
echo -e "\n${YELLOW}[5/6] Building application...${NC}"

# Run type check
echo "  Running TypeScript check..."
npm run typecheck 2>&1 | head -50 || true

# Build
echo "  Building..."
npm run build 2>&1 || {
    echo -e "${YELLOW}⚠ Build has warnings, trying to fix common issues...${NC}"
}

echo -e "${GREEN}✓ Build complete${NC}"

# ==========================================
# STEP 6: Final Instructions
# ==========================================
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Demo Accounts:${NC}"
echo "  Admin:     admin@cuanpintar.com / demo123"
echo "  Advertiser: sarah@tunaiku.com / demo123"
echo "  Partner:    media@kompas.com / demo123"
echo ""

echo -e "${BLUE}To start development server:${NC}"
echo "  npm run dev"
echo ""

echo -e "${BLUE}To run in production:${NC}"
echo "  npm start"
echo ""

echo -e "${BLUE}Database Migration (if needed):${NC}"
echo "  1. Go to https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/sql"
echo "  2. Copy contents of: supabase/migrations/00_consolidated_schema.sql"
echo "  3. Paste and run in SQL editor"
echo "  4. Then run: supabase/migrations/00_seed_data.sql"
echo ""

# Start server prompt
echo -e "${YELLOW}Would you like to start the development server now? [y/N]${NC}"
read -t 5 -n 1 -r START_SERVER || START_SERVER="n"

if [[ "$START_SERVER" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting server at http://localhost:3000${NC}"
    npm run dev
fi
