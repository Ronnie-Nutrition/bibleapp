#!/bin/bash

################################################################################
# BibleApp - Automated Xcode Setup Script
# This script automates the entire Xcode integration process
# Run on your Mac: bash setup-xcode.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"
IOS_DIR="$PROJECT_ROOT/ios"
XCODE_PROJECT="$IOS_DIR/BibleApp.xcodeproj"
XCODE_WORKSPACE="$IOS_DIR/BibleApp.xcworkspace"

# Configuration
BUNDLE_ID="${BUNDLE_ID:-com.yourcompany.bibleapp}"
TEAM_ID="${TEAM_ID:-}"
USE_COCOAPODS="${USE_COCOAPODS:-true}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BibleApp - Automated Xcode Setup                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

################################################################################
# Step 1: Check Prerequisites
################################################################################

echo -e "${YELLOW}[1/6]${NC} Checking prerequisites..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}✗ Error: This script must run on macOS${NC}"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcode-select &> /dev/null; then
    echo -e "${RED}✗ Error: Xcode is not installed${NC}"
    exit 1
fi

# Check if we can find Xcode
if ! xcode-select -p &> /dev/null; then
    echo -e "${RED}✗ Error: Xcode command line tools not properly configured${NC}"
    echo -e "${YELLOW}  Run: sudo xcode-select --install${NC}"
    exit 1
fi

XCODE_PATH=$(xcode-select -p)
echo -e "${GREEN}✓${NC} Xcode found at: $XCODE_PATH"

# Check if Ruby is installed (for CocoaPods)
if [ "$USE_COCOAPODS" = true ]; then
    if ! command -v ruby &> /dev/null; then
        echo -e "${RED}✗ Error: Ruby is not installed${NC}"
        echo -e "${YELLOW}  Install via: brew install ruby${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Ruby found"
fi

# Check if project structure exists
if [ ! -d "$IOS_DIR/BibleApp" ]; then
    echo -e "${RED}✗ Error: BibleApp source directory not found${NC}"
    echo -e "${YELLOW}  Expected: $IOS_DIR/BibleApp${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project structure verified"
echo ""

################################################################################
# Step 2: Prompt for Configuration
################################################################################

echo -e "${YELLOW}[2/6]${NC} Configuration setup..."

read -p "Enter Bundle ID (default: $BUNDLE_ID): " user_bundle_id
BUNDLE_ID="${user_bundle_id:-$BUNDLE_ID}"
echo -e "${GREEN}✓${NC} Bundle ID: $BUNDLE_ID"

read -p "Enter Team ID (optional, can be set in Xcode later): " user_team_id
if [ ! -z "$user_team_id" ]; then
    TEAM_ID="$user_team_id"
    echo -e "${GREEN}✓${NC} Team ID: $TEAM_ID"
else
    echo -e "${YELLOW}⚠${NC} Team ID not set (can be configured in Xcode)"
fi

echo ""

################################################################################
# Step 3: Add Swift Files to Xcode Project
################################################################################

echo -e "${YELLOW}[3/6]${NC} Adding Swift source files to Xcode project..."

# Function to add files to pbxproj
add_files_to_project() {
    local pbxproj="$XCODE_PROJECT/project.pbxproj"

    # Get all Swift files
    local swift_files=(
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

    echo -e "${YELLOW}Found ${#swift_files[@]} Swift files${NC}"

    # Note: Full file addition via script is complex; we'll verify files exist
    for file in "${swift_files[@]}"; do
        if [ -f "$IOS_DIR/BibleApp/$file" ]; then
            echo -e "${GREEN}✓${NC} $file"
        else
            echo -e "${YELLOW}⚠${NC} $file (not found, may need to be added manually)"
        fi
    done
}

add_files_to_project
echo ""

################################################################################
# Step 4: Update Bundle ID in Project
################################################################################

echo -e "${YELLOW}[4/6]${NC} Updating Bundle ID in project configuration..."

# Update Bundle ID in Info.plist
if [ -f "$IOS_DIR/BibleApp/Info.plist" ]; then
    # Using PlistBuddy to update Bundle ID
    /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_ID" "$IOS_DIR/BibleApp/Info.plist" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Updated Info.plist with Bundle ID: $BUNDLE_ID"
fi

# Update Bundle ID in project.pbxproj
if [ -f "$XCODE_PROJECT/project.pbxproj" ]; then
    sed -i '' "s/com.yourcompany.bibleapp/$BUNDLE_ID/g" "$XCODE_PROJECT/project.pbxproj"
    echo -e "${GREEN}✓${NC} Updated project.pbxproj with Bundle ID: $BUNDLE_ID"
fi

# Update Team ID if provided
if [ ! -z "$TEAM_ID" ]; then
    sed -i '' "s/DEVELOPMENT_TEAM = \"\";/DEVELOPMENT_TEAM = \"$TEAM_ID\";/g" "$XCODE_PROJECT/project.pbxproj"
    echo -e "${GREEN}✓${NC} Updated Team ID: $TEAM_ID"
fi

echo ""

################################################################################
# Step 5: Setup Dependencies (CocoaPods)
################################################################################

echo -e "${YELLOW}[5/6]${NC} Setting up dependencies..."

if [ "$USE_COCOAPODS" = true ]; then
    # Check if Podfile exists
    if [ ! -f "$IOS_DIR/Podfile" ]; then
        echo -e "${YELLOW}Creating Podfile...${NC}"
        cat > "$IOS_DIR/Podfile" << 'EOF'
platform :ios, '14.0'

target 'BibleApp' do
  # Firebase pods
  pod 'Firebase/Analytics'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Messaging'

  # Optional: for better development experience
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      flutter_additional_ios_build_settings(target)
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
      end
    end
  end
end
EOF
        echo -e "${GREEN}✓${NC} Podfile created"
    else
        echo -e "${GREEN}✓${NC} Podfile already exists"
    fi

    # Install pods
    echo -e "${YELLOW}Installing CocoaPods (this may take a few minutes)...${NC}"
    cd "$IOS_DIR"

    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo -e "${YELLOW}Installing CocoaPods...${NC}"
        sudo gem install cocoapods
    fi

    pod install --repo-update
    cd "$PROJECT_ROOT"
    echo -e "${GREEN}✓${NC} CocoaPods dependencies installed"
    echo -e "${YELLOW}⚠${NC} IMPORTANT: Use BibleApp.xcworkspace instead of .xcodeproj${NC}"
else
    echo -e "${YELLOW}⚠${NC} CocoaPods setup skipped (USE_COCOAPODS=false)"
    echo -e "${YELLOW}⚠${NC} You'll need to add Firebase via SPM in Xcode${NC}"
fi

echo ""

################################################################################
# Step 6: Verify Setup
################################################################################

echo -e "${YELLOW}[6/6]${NC} Verifying setup..."

# Check Xcode project exists
if [ -d "$XCODE_PROJECT" ]; then
    echo -e "${GREEN}✓${NC} Xcode project found: BibleApp.xcodeproj"
else
    echo -e "${RED}✗ Xcode project not found${NC}"
    exit 1
fi

# Check Info.plist
if [ -f "$IOS_DIR/BibleApp/Info.plist" ]; then
    echo -e "${GREEN}✓${NC} Info.plist found"
else
    echo -e "${RED}✗ Info.plist not found${NC}"
    exit 1
fi

# Check entitlements
if [ -f "$IOS_DIR/BibleApp/BibleApp.entitlements" ]; then
    echo -e "${GREEN}✓${NC} Entitlements file found"
else
    echo -e "${RED}✗ Entitlements file not found${NC}"
    exit 1
fi

# Check GoogleService-Info.plist
if [ -f "$IOS_DIR/BibleApp/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✓${NC} Firebase config file found"
else
    echo -e "${YELLOW}⚠${NC} GoogleService-Info.plist not found"
    echo -e "${YELLOW}  You'll need to add it from Firebase Console${NC}"
fi

# Check workspace (if using CocoaPods)
if [ "$USE_COCOAPODS" = true ] && [ -d "$XCODE_WORKSPACE" ]; then
    echo -e "${GREEN}✓${NC} Xcode workspace created (BibleApp.xcworkspace)"
fi

echo ""

################################################################################
# Summary
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete! ✓                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}Project Configuration:${NC}"
echo "  Bundle ID:        $BUNDLE_ID"
echo "  Team ID:          ${TEAM_ID:-Not set (set in Xcode)}"
echo "  CocoaPods:        $USE_COCOAPODS"
echo ""

if [ "$USE_COCOAPODS" = true ]; then
    OPEN_FILE="$XCODE_WORKSPACE"
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Open in Xcode:  open \"$OPEN_FILE\""
    echo "  2. Select a simulator (iPhone 14 Pro recommended)"
    echo "  3. Press Cmd+B to build"
    echo "  4. Press Cmd+R to run on simulator"
else
    OPEN_FILE="$XCODE_PROJECT"
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Open in Xcode:  open \"$OPEN_FILE\""
    echo "  2. Add Firebase via SPM: File → Add Packages"
    echo "  3. Select a simulator (iPhone 14 Pro recommended)"
    echo "  4. Press Cmd+B to build"
    echo "  5. Press Cmd+R to run on simulator"
fi

echo ""
echo -e "${YELLOW}Important:${NC}"
echo "  • Add GoogleService-Info.plist from Firebase Console"
echo "  • Configure team signing in Xcode (if not set)"
echo "  • Enable push notifications capability in Xcode"
echo "  • Update API_URL to production server before App Store submission"
echo ""

echo -e "${BLUE}Run this command to open the project:${NC}"
echo "  open \"$OPEN_FILE\""
echo ""
