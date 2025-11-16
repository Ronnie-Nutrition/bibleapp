#!/bin/bash

##############################################################################
# Firebase Setup Script for Bible App
#
# This script helps configure Firebase for development.
#
# Usage: bash scripts/setup-firebase.sh
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Firebase Setup for Biblical Lessons App${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if firebase-key.json exists
echo -e "${YELLOW}Step 1: Checking Firebase configuration...${NC}\n"

NODEJS_KEY="backend/nodejs/config/firebase-key.json"
DJANGO_KEY="backend/django/config/firebase-key.json"

if [ ! -f "$NODEJS_KEY" ]; then
  echo -e "${RED}✗ Node.js service account not found at: $NODEJS_KEY${NC}"
  echo -e "   ${YELLOW}To get this file:${NC}"
  echo -e "   1. Go to Firebase Console → Project Settings → Service Accounts"
  echo -e "   2. Click 'Generate New Private Key'"
  echo -e "   3. Save the JSON file to: $NODEJS_KEY\n"
else
  echo -e "${GREEN}✓ Node.js service account found${NC}\n"
fi

if [ ! -f "$DJANGO_KEY" ]; then
  echo -e "${RED}✗ Django service account not found at: $DJANGO_KEY${NC}"
  echo -e "   ${YELLOW}You can use the same file as Node.js:${NC}"
  echo -e "   ${BLUE}mkdir -p backend/django/config${NC}"
  echo -e "   ${BLUE}cp $NODEJS_KEY $DJANGO_KEY${NC}\n"
else
  echo -e "${GREEN}✓ Django service account found${NC}\n"
fi

# Create directories if needed
echo -e "${YELLOW}Step 2: Creating directories...${NC}\n"

mkdir -p backend/nodejs/config
mkdir -p backend/django/config
mkdir -p scripts

echo -e "${GREEN}✓ Directories created${NC}\n"

# Create .env files if they don't exist
echo -e "${YELLOW}Step 3: Setting up environment files...${NC}\n"

if [ ! -f "backend/nodejs/.env" ]; then
  echo -e "${BLUE}Creating backend/nodejs/.env${NC}"
  cp backend/nodejs/.env.example backend/nodejs/.env
  echo -e "${GREEN}✓ Created backend/nodejs/.env${NC}"
  echo -e "   ${YELLOW}⚠️  Edit this file with your Firebase credentials${NC}"
else
  echo -e "${GREEN}✓ backend/nodejs/.env already exists${NC}"
fi

if [ ! -f "backend/django/.env" ]; then
  echo -e "${BLUE}Creating backend/django/.env${NC}"
  cp backend/django/.env.example backend/django/.env
  echo -e "${GREEN}✓ Created backend/django/.env${NC}"
  echo -e "   ${YELLOW}⚠️  Edit this file with your Firebase credentials${NC}"
else
  echo -e "${GREEN}✓ backend/django/.env already exists${NC}"
fi

echo ""

# Check for Node.js dependencies
echo -e "${YELLOW}Step 4: Installing Node.js dependencies...${NC}\n"

if [ -d "backend/nodejs/node_modules" ]; then
  echo -e "${GREEN}✓ Node.js dependencies already installed${NC}"
else
  echo -e "${BLUE}Installing npm packages...${NC}"
  cd backend/nodejs
  npm install 2>&1 | grep -E "(added|up to date|npm ERR)" || true
  cd - > /dev/null
  echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
fi

echo ""

# Check for Python virtual environment
echo -e "${YELLOW}Step 5: Setting up Python environment...${NC}\n"

if [ -d "backend/django/venv" ]; then
  echo -e "${GREEN}✓ Python virtual environment exists${NC}"
else
  echo -e "${BLUE}Creating virtual environment...${NC}"
  cd backend/django
  python3 -m venv venv
  source venv/bin/activate
  pip install -q -r requirements.txt
  deactivate
  cd - > /dev/null
  echo -e "${GREEN}✓ Python virtual environment created${NC}"
fi

echo ""

# Display next steps
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}\n"

if [ ! -f "$NODEJS_KEY" ] || [ ! -f "$DJANGO_KEY" ]; then
  echo -e "1. ${BLUE}Add Firebase Service Account:${NC}"
  echo -e "   • Get your service account JSON from Firebase Console"
  echo -e "   • Place it at: $NODEJS_KEY\n"
fi

echo -e "2. ${BLUE}Configure Environment Variables:${NC}"
echo -e "   • Edit backend/nodejs/.env"
echo -e "   • Edit backend/django/.env"
echo -e "   • Add your Firebase Project ID and credentials\n"

echo -e "3. ${BLUE}Load Sample Lessons:${NC}"
echo -e "   ${GREEN}Option A (Node.js):${NC}"
echo -e "   cd backend/nodejs"
echo -e "   node ../../scripts/load-lessons.js\n"
echo -e "   ${GREEN}Option B (Python):${NC}"
echo -e "   cd backend/django"
echo -e "   source venv/bin/activate"
echo -e "   python ../../scripts/load_lessons.py\n"

echo -e "4. ${BLUE}Start Development Servers:${NC}"
echo -e "   Terminal 1 (iOS):"
echo -e "   open ios/BibleApp.xcworkspace\n"
echo -e "   Terminal 2 (Node.js):"
echo -e "   cd backend/nodejs && npm run dev\n"
echo -e "   Terminal 3 (Django):"
echo -e "   cd backend/django && python manage.py runserver\n"

echo -e "${BLUE}Documentation:${NC}"
echo -e "  • Firebase Setup: docs/FIREBASE-SETUP.md"
echo -e "  • Quick Start: docs/FIREBASE-QUICK-START.md"
echo -e "  • Development: docs/SETUP.md\n"

echo -e "${GREEN}Happy coding! 🚀${NC}\n"
