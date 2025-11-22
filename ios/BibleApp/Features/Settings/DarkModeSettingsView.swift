/**
 * Dark Mode Settings View
 * Allows users to toggle dark mode on/off or use system appearance
 */

import SwiftUI

struct DarkModeSettingsView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Theme Option Cards
                VStack(spacing: 12) {
                    // System Appearance Option
                    ThemeOptionCard(
                        title: "System",
                        description: "Follow device settings",
                        icon: "gearshape.fill",
                        isSelected: themeManager.useSystemAppearance,
                        action: {
                            themeManager.useSystemAppearance = true
                        }
                    )

                    // Light Mode Option
                    ThemeOptionCard(
                        title: "Light",
                        description: "Always use light theme",
                        icon: "sun.max.fill",
                        isSelected: !themeManager.useSystemAppearance && !themeManager.isDarkMode,
                        action: {
                            themeManager.setDarkMode(false)
                        }
                    )

                    // Dark Mode Option
                    ThemeOptionCard(
                        title: "Dark",
                        description: "Always use dark theme",
                        icon: "moon.stars.fill",
                        isSelected: !themeManager.useSystemAppearance && themeManager.isDarkMode,
                        action: {
                            themeManager.setDarkMode(true)
                        }
                    )
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 20)

                // Info Section
                VStack(alignment: .leading, spacing: 12) {
                    Label("Current Setting", systemImage: "info.circle.fill")
                        .font(.headline)
                        .foregroundColor(.blue)

                    if themeManager.useSystemAppearance {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("System Appearance")
                                .font(.subheadline)
                                .fontWeight(.semibold)

                            Text("Your device is using \(themeManager.isDarkMode ? "dark" : "light") appearance")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("\(themeManager.isDarkMode ? "Dark" : "Light") Mode")
                                .font(.subheadline)
                                .fontWeight(.semibold)

                            Text("App is using \(themeManager.isDarkMode ? "dark" : "light") theme")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
                .padding(.horizontal, 16)

                // Features Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Dark Mode Benefits")
                        .font(.headline)

                    FeatureBullet(icon: "eyes", text: "Easier on eyes in low-light conditions")
                    FeatureBullet(icon: "battery.50", text: "Saves battery on OLED screens")
                    FeatureBullet(icon: "moon.zzz.fill", text: "Reduces blue light exposure")
                    FeatureBullet(icon: "checkmark.circle.fill", text: "Customizable to your preference")
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .padding(.horizontal, 16)

                Spacer()
            }
            .navigationTitle("Dark Mode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        dismiss()
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .foregroundColor(.blue)
                    }
                }
            }
        }
    }
}

// MARK: - Supporting Views

struct ThemeOptionCard: View {
    let title: String
    let description: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(.blue)
                    .frame(width: 40, height: 40)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Selection Indicator
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? .blue : .gray)
            }
            .padding(12)
            .background(Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
    }
}

struct FeatureBullet: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.green)
                .frame(width: 24, alignment: .center)

            Text(text)
                .font(.subheadline)
                .foregroundColor(.secondary)

            Spacer()
        }
    }
}

#Preview {
    DarkModeSettingsView()
        .environmentObject(ThemeManager.shared)
}
