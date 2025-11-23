#!/bin/bash

################################################################################
# BibleApp - CocoaPods Cleanup Script
# Removes pods and resets for a fresh installation
# Run: bash cleanup-pods.sh
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IOS_DIR="$SCRIPT_DIR/ios"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BibleApp - CocoaPods Cleanup                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}This will remove:${NC}"
echo "  • Pods directory"
echo "  • Podfile.lock"
echo "  • BibleApp.xcworkspace"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleanup cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Cleaning up...${NC}"

cd "$IOS_DIR"

# Remove Pods directory
if [ -d "Pods" ]; then
    echo -e "${YELLOW}Removing Pods directory...${NC}"
    rm -rf Pods
    echo -e "${GREEN}✓${NC} Pods removed"
fi

# Remove Podfile.lock
if [ -f "Podfile.lock" ]; then
    echo -e "${YELLOW}Removing Podfile.lock...${NC}"
    rm Podfile.lock
    echo -e "${GREEN}✓${NC} Podfile.lock removed"
fi

# Remove xcworkspace
if [ -d "BibleApp.xcworkspace" ]; then
    echo -e "${YELLOW}Removing BibleApp.xcworkspace...${NC}"
    rm -rf BibleApp.xcworkspace
    echo -e "${GREEN}✓${NC} Workspace removed"
fi

echo ""
echo -e "${GREEN}✓ Cleanup complete!${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "  1. Run: bash setup-xcode.sh"
echo "  2. Or run: pod install"
echo ""
