/**
 * Theme Manager
 * Manages app appearance and dark mode settings
 */

import SwiftUI
import Combine

// MARK: - Theme Colors
struct AppTheme {
    // Light Mode Colors
    static let lightBackground = Color(UIColor(red: 0.97, green: 0.97, blue: 0.97, alpha: 1.0))
    static let lightCardBackground = Color(UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0))
    static let lightText = Color(UIColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0))
    static let lightSecondaryText = Color(UIColor(red: 0.6, green: 0.6, blue: 0.6, alpha: 1.0))

    // Dark Mode Colors
    static let darkBackground = Color(UIColor(red: 0.11, green: 0.11, blue: 0.12, alpha: 1.0))
    static let darkCardBackground = Color(UIColor(red: 0.17, green: 0.17, blue: 0.18, alpha: 1.0))
    static let darkText = Color(UIColor(red: 0.95, green: 0.95, blue: 0.97, alpha: 1.0))
    static let darkSecondaryText = Color(UIColor(red: 0.6, green: 0.6, blue: 0.65, alpha: 1.0))

    // Accent Colors (same in both modes)
    static let primary = Color.blue
    static let secondary = Color.green
    static let warning = Color.orange
    static let error = Color.red
    static let success = Color.green

    // Get theme appropriate colors
    static func backgroundColor(isDarkMode: Bool) -> Color {
        isDarkMode ? darkBackground : lightBackground
    }

    static func cardBackground(isDarkMode: Bool) -> Color {
        isDarkMode ? darkCardBackground : lightCardBackground
    }

    static func textColor(isDarkMode: Bool) -> Color {
        isDarkMode ? darkText : lightText
    }

    static func secondaryText(isDarkMode: Bool) -> Color {
        isDarkMode ? darkSecondaryText : lightSecondaryText
    }
}

// MARK: - Theme Manager
@MainActor
class ThemeManager: NSObject, ObservableObject {
    static let shared = ThemeManager()

    @Published var isDarkMode: Bool = false {
        didSet {
            saveThemePreference()
            applyTheme()
        }
    }

    @Published var useSystemAppearance: Bool = true {
        didSet {
            saveSystemAppearancePreference()
            if useSystemAppearance {
                updateFromSystemAppearance()
            }
        }
    }

    override private init() {
        super.init()
        loadThemePreference()
        setupSystemAppearanceListener()
    }

    // MARK: - Private Methods

    /// Load theme preference from UserDefaults
    private func loadThemePreference() {
        let savedDarkMode = UserDefaults.standard.bool(forKey: "isDarkMode")
        let hasKey = UserDefaults.standard.object(forKey: "isDarkMode") != nil

        if hasKey {
            isDarkMode = savedDarkMode
        } else {
            // Default to system appearance
            useSystemAppearance = true
            updateFromSystemAppearance()
        }

        let savedUseSystem = UserDefaults.standard.bool(forKey: "useSystemAppearance")
        let hasSystemKey = UserDefaults.standard.object(forKey: "useSystemAppearance") != nil
        useSystemAppearance = hasSystemKey ? savedUseSystem : true
    }

    /// Save theme preference to UserDefaults
    private func saveThemePreference() {
        UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
    }

    /// Save system appearance preference
    private func saveSystemAppearancePreference() {
        UserDefaults.standard.set(useSystemAppearance, forKey: "useSystemAppearance")
    }

    /// Update dark mode from system appearance
    private func updateFromSystemAppearance() {
        let window = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?
            .windows
            .first

        if let window = window {
            isDarkMode = window.traitCollection.userInterfaceStyle == .dark
        }
    }

    /// Setup listener for system appearance changes
    private func setupSystemAppearanceListener() {
        // Listen to trait collection changes
        let scenes = UIApplication.shared.connectedScenes
        for scene in scenes {
            if let windowScene = scene as? UIWindowScene {
                for window in windowScene.windows {
                    window.overrideUserInterfaceStyle = useSystemAppearance ? .unspecified : (isDarkMode ? .dark : .light)
                }
            }
        }
    }

    /// Apply theme to the entire app
    private func applyTheme() {
        // Update all windows
        let scenes = UIApplication.shared.connectedScenes
        for scene in scenes {
            if let windowScene = scene as? UIWindowScene {
                for window in windowScene.windows {
                    if useSystemAppearance {
                        window.overrideUserInterfaceStyle = .unspecified
                    } else {
                        window.overrideUserInterfaceStyle = isDarkMode ? .dark : .light
                    }
                }
            }
        }

        // Post notification for custom UI updates
        NotificationCenter.default.post(name: NSNotification.Name("ThemeDidChange"), object: nil)
    }

    // MARK: - Public Methods

    /// Toggle dark mode
    func toggleDarkMode() {
        isDarkMode.toggle()
    }

    /// Set specific theme
    func setDarkMode(_ value: Bool) {
        isDarkMode = value
        useSystemAppearance = false
    }

    /// Reset to system appearance
    func useSystemAppearance() {
        useSystemAppearance = true
        updateFromSystemAppearance()
    }

    /// Get current background color
    func backgroundColor() -> Color {
        AppTheme.backgroundColor(isDarkMode: isDarkMode)
    }

    /// Get current card background color
    func cardBackground() -> Color {
        AppTheme.cardBackground(isDarkMode: isDarkMode)
    }

    /// Get current text color
    func textColor() -> Color {
        AppTheme.textColor(isDarkMode: isDarkMode)
    }

    /// Get current secondary text color
    func secondaryText() -> Color {
        AppTheme.secondaryText(isDarkMode: isDarkMode)
    }
}

// MARK: - View Extensions
extension View {
    /// Apply theme-aware background
    func themeBackground(_ themeManager: ThemeManager) -> some View {
        self.background(themeManager.backgroundColor())
    }

    /// Apply theme-aware foreground color
    func themeForeground(_ themeManager: ThemeManager) -> some View {
        self.foregroundColor(themeManager.textColor())
    }
}

// MARK: - Preview Helper
#if DEBUG
struct ThemePreview: View {
    @StateObject private var themeManager = ThemeManager.shared

    var body: some View {
        VStack(spacing: 20) {
            Text("Light Mode")
            Text("Dark Mode")
        }
        .padding()
        .background(themeManager.backgroundColor())
        .foregroundColor(themeManager.textColor())
        .preferredColorScheme(themeManager.isDarkMode ? .dark : .light)
    }
}
#endif
