import Foundation

// MARK: - App Environment Configuration
/// Centralized configuration for environment-specific settings
/// Change `current` to `.production` before App Store submission
enum AppEnvironment {
    case development
    case production

    // MARK: - Current Environment
    /// ⚠️ IMPORTANT: Change to `.production` before App Store submission
    static let current: AppEnvironment = .production

    // MARK: - API Configuration
    var apiBaseURL: String {
        switch self {
        case .development:
            #if targetEnvironment(simulator)
            return "http://localhost:3000"
            #else
            // For testing on physical device during development
            // Replace with your local machine's IP address
            return "http://localhost:3000"
            #endif
        case .production:
            // TODO: Replace with your production API URL
            // Example: "https://api.biblicallessons.com"
            return "https://YOUR_PRODUCTION_API_URL"
        }
    }

    // MARK: - Feature Flags
    var enableDebugLogging: Bool {
        switch self {
        case .development: return true
        case .production: return false
        }
    }

    var enableMockData: Bool {
        switch self {
        case .development: return false
        case .production: return false
        }
    }

    // MARK: - Firebase Configuration
    /// Note: Firebase uses GoogleService-Info.plist which is selected at build time
    /// For production, replace the GoogleService-Info.plist with your production credentials
    var firebaseProjectId: String {
        switch self {
        case .development: return "biblical-lessons-dev"
        case .production: return "biblical-lessons-prod" // Update after creating prod project
        }
    }

    // MARK: - App Info
    static var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    static var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    static var bundleIdentifier: String {
        Bundle.main.bundleIdentifier ?? "com.bibleapp.biblical"
    }

    // MARK: - Debug Helpers
    static func printConfiguration() {
        guard current.enableDebugLogging else { return }
        print("========================================")
        print("App Environment: \(current)")
        print("API Base URL: \(current.apiBaseURL)")
        print("App Version: \(appVersion) (\(buildNumber))")
        print("Bundle ID: \(bundleIdentifier)")
        print("========================================")
    }
}
