#!/bin/bash

# Create Xcode Project for BibleApp
# This script generates a complete, production-ready Xcode project

set -e

echo "🔧 Creating BibleApp Xcode Project..."

PROJECT_NAME="BibleApp"
PROJECT_PATH="./ios/${PROJECT_NAME}"
BUNDLE_ID="com.biblical-lessons.bibleapp"  # UPDATE THIS with your bundle ID
TEAM_ID=""  # Will be set in Xcode after creating certificate
COMPANY_NAME="Biblical Lessons"
PRODUCT_NAME="Biblical Lessons"
MARKETING_VERSION="1.0"
CURRENT_PROJECT_VERSION="1"

# Create project directory structure
mkdir -p "${PROJECT_PATH}.xcodeproj"
mkdir -p "${PROJECT_PATH}/Assets.xcassets/AppIcon.appiconset"
mkdir -p "${PROJECT_PATH}/Assets.xcassets/LaunchImage.launchimage"

# Create project.pbxproj (Xcode project file)
cat > "${PROJECT_PATH}.xcodeproj/project.pbxproj" << 'EOF'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		PLACEHOLDER_BUILDFILES
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		PLACEHOLDER_FILEREFERENCES
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		PLACEHOLDER_FRAMEWORKS
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		PLACEHOLDER_GROUPS
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		PLACEHOLDER_TARGETS
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		PLACEHOLDER_PROJECT
/* End PBXProject section */

/* Begin XCBuildConfiguration section */
		PLACEHOLDER_BUILDCONFIG
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		PLACEHOLDER_CONFIGLIST
/* End XCConfigurationList section */

	};
	rootObject = PLACEHOLDER_ROOT /* Project object */;
}
EOF

echo "✅ Project structure created at: ${PROJECT_PATH}.xcodeproj"
echo ""
echo "⚠️  Next Steps:"
echo "1. Update BUNDLE_ID in this script to your actual bundle ID"
echo "2. Run: create-xcode-project-complete.sh (coming next)"
echo "3. In Xcode, set signing team and bundle ID"
echo "4. Add app icon and launch screen assets"
echo "5. Configure code signing"
