#!/bin/bash

################################################################################
# BibleApp - Setup Verification Script
# Checks if the Xcode project is properly configured
# Run: bash verify-setup.sh
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IOS_DIR="$SCRIPT_DIR/ios"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BibleApp - Setup Verification                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

################################################################################
# Check Project Structure
################################################################################

echo -e "${YELLOW}Checking Project Structure...${NC}"

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (missing at $1)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (missing at $1)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_directory "$IOS_DIR/BibleApp.xcodeproj" "Xcode project (BibleApp.xcodeproj)"
check_file "$IOS_DIR/BibleApp/Info.plist" "Info.plist"
check_file "$IOS_DIR/BibleApp/BibleApp.entitlements" "Entitlements file"
check_file "$IOS_DIR/Podfile" "Podfile"

echo ""

################################################################################
# Check Swift Files
################################################################################

echo -e "${YELLOW}Checking Swift Source Files...${NC}"

SWIFT_FILES=(
    "App/BibleAppApp.swift"
    "Features/Authentication/LoginView.swift"
    "Features/Lessons/LessonDetailView.swift"
    "Features/Lessons/LessonsViewModel.swift"
    "Features/UserProfile/NotificationPreferencesView.swift"
    "Models/Lesson.swift"
    "Models/User.swift"
    "Services/APIClient.swift"
    "Services/AuthenticationManager.swift"
    "Services/FirebaseService.swift"
    "Services/PushNotificationManager.swift"
    "Views/MainTabView.swift"
)

FOUND_COUNT=0
for file in "${SWIFT_FILES[@]}"; do
    if [ -f "$IOS_DIR/BibleApp/$file" ]; then
        FOUND_COUNT=$((FOUND_COUNT + 1))
    else
        echo -e "${RED}✗${NC} Missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

echo -e "${GREEN}✓${NC} Found $FOUND_COUNT/${#SWIFT_FILES[@]} Swift files"

echo ""

################################################################################
# Check Configuration Files
################################################################################

echo -e "${YELLOW}Checking Configuration Files...${NC}"

# Check Bundle ID
if [ -f "$IOS_DIR/BibleApp/Info.plist" ]; then
    BUNDLE_ID=$(grep -o 'com\.[a-zA-Z0-9.]*' "$IOS_DIR/BibleApp/Info.plist" | head -1)
    if [ ! -z "$BUNDLE_ID" ]; then
        echo -e "${GREEN}✓${NC} Bundle ID configured: $BUNDLE_ID"
    else
        echo -e "${YELLOW}⚠${NC} Bundle ID not clearly set in Info.plist"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for Firebase config
if [ -f "$IOS_DIR/BibleApp/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✓${NC} Firebase config (GoogleService-Info.plist) found"
else
    echo -e "${YELLOW}⚠${NC} Firebase config (GoogleService-Info.plist) not found"
    echo -e "${YELLOW}  Download from Firebase Console and add to project${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

################################################################################
# Check CocoaPods
################################################################################

echo -e "${YELLOW}Checking CocoaPods Setup...${NC}"

if [ -d "$IOS_DIR/Pods" ]; then
    echo -e "${GREEN}✓${NC} CocoaPods installed"

    if [ -d "$IOS_DIR/Pods/Firebase" ]; then
        echo -e "${GREEN}✓${NC} Firebase pods installed"
    else
        echo -e "${YELLOW}⚠${NC} Firebase pods not installed"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Pods directory not found"
    echo -e "${YELLOW}  Run: cd ios && pod install${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "$IOS_DIR/BibleApp.xcworkspace" ]; then
    echo -e "${GREEN}✓${NC} Xcode workspace created"
else
    echo -e "${YELLOW}⚠${NC} Xcode workspace not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

################################################################################
# Check Xcode Installation
################################################################################

echo -e "${YELLOW}Checking Xcode Installation...${NC}"

if command -v xcode-select &> /dev/null; then
    XCODE_PATH=$(xcode-select -p)
    echo -e "${GREEN}✓${NC} Xcode found: $XCODE_PATH"
else
    echo -e "${RED}✗${NC} Xcode command line tools not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""

################################################################################
# Summary
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Verification Summary                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Everything is properly configured!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Open in Xcode: open ios/BibleApp.xcworkspace"
    echo "  2. Select a simulator (iPhone 14 Pro recommended)"
    echo "  3. Press Cmd+B to build"
    echo "  4. Press Cmd+R to run"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${BLUE}You can still open in Xcode, but:${NC}"
    [ $WARNINGS -gt 0 ] && echo "  • Complete the warnings listed above before App Store submission"
    echo ""
    echo -e "${BLUE}Open in Xcode:${NC}"
    echo "  open ios/BibleApp.xcworkspace"
    exit 0
else
    echo -e "${RED}✗ Setup has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the errors above before opening in Xcode${NC}"
    exit 1
fi
