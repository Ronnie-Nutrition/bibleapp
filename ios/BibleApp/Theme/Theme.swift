import SwiftUI

// MARK: - App Theme
/// Centralized design system for Biblical Lessons for Entrepreneurs
/// Psychology-driven colors for entrepreneur engagement:
/// - Burnt Orange: Action, confidence, forward momentum
/// - Deep Teal: Trust + growth combined
/// - Rich Burgundy: Scripture depth, biblical heritage

struct AppTheme {

    // MARK: - Colors
    struct Colors {
        // Primary Colors - Psychology-driven for entrepreneur engagement
        static let deepIndigo = Color(hex: "2D3047")
        static let burntOrange = Color(hex: "D97706")  // Action, confidence, ambition
        static let warmCream = Color(hex: "FAF6F0")
        static let richBurgundy = Color(hex: "722F37")  // Scripture, depth, biblical wine

        // Secondary Accent
        static let deepTeal = Color(hex: "0F766E")  // Trust + growth combined

        // Supporting Colors
        static let softOrange = Color(hex: "FED7AA")  // Light orange for backgrounds
        static let deepNavy = Color(hex: "1A1F36")
        static let warmGray = Color(hex: "6B7280")  // Slightly darker for better contrast
        static let successGreen = Color(hex: "166534")  // Prosperity, growth
        static let amberGlow = Color(hex: "F59E0B")  // Key takeaways, highlights

        // Legacy alias for compatibility
        static let royalGold = burntOrange
        static let softGold = softOrange

        // Semantic Colors
        static let primaryText = deepIndigo
        static let secondaryText = warmGray
        static let accent = burntOrange
        static let background = warmCream
        static let cardBackground = Color(hex: "FFFDF9")
        static let inputBackground = Color(hex: "F5F2ED")
        static let error = richBurgundy
        static let success = successGreen

        // Dark Mode Variants
        static let darkBackground = deepNavy
        static let darkCardBackground = Color(hex: "252A40")
        static let darkPrimaryText = Color(hex: "F5F2ED")
    }

    // MARK: - Gradients
    struct Gradients {
        // Primary action button - energetic orange gradient
        static let primaryButton = LinearGradient(
            colors: [Color(hex: "F59E0B"), Color(hex: "D97706")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        // Avatar ring shimmer - warm orange tones
        static let goldShimmer = LinearGradient(
            colors: [Color(hex: "FED7AA"), Color(hex: "D97706"), Color(hex: "FED7AA")],
            startPoint: .leading,
            endPoint: .trailing
        )

        // Teal accent gradient - for secondary CTAs
        static let tealAccent = LinearGradient(
            colors: [Color(hex: "14B8A6"), Color(hex: "0F766E")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let warmHeader = LinearGradient(
            colors: [Colors.warmCream, Color(hex: "F5EFE3")],
            startPoint: .top,
            endPoint: .bottom
        )

        static let cardGradient = LinearGradient(
            colors: [Colors.cardBackground, Color(hex: "FBF8F3")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        // Scripture/biblical accent - rich burgundy
        static let burgundyAccent = LinearGradient(
            colors: [Color(hex: "8B3A42"), Color(hex: "722F37")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Shadows
    struct Shadows {
        static func card(_ colorScheme: ColorScheme) -> (color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) {
            return (
                color: colorScheme == .dark ? .black.opacity(0.3) : .black.opacity(0.08),
                radius: 12,
                x: 0,
                y: 4
            )
        }

        static func button(_ colorScheme: ColorScheme) -> (color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) {
            return (
                color: colorScheme == .dark ? .black.opacity(0.4) : Colors.burntOrange.opacity(0.3),
                radius: 8,
                x: 0,
                y: 3
            )
        }

        static func elevated(_ colorScheme: ColorScheme) -> (color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) {
            return (
                color: colorScheme == .dark ? .black.opacity(0.4) : .black.opacity(0.12),
                radius: 16,
                x: 0,
                y: 6
            )
        }
    }

    // MARK: - Typography
    struct Typography {
        static let largeTitle = Font.system(size: 32, weight: .bold)
        static let title = Font.system(size: 24, weight: .bold)
        static let headline = Font.system(size: 18, weight: .semibold)
        static let subheadline = Font.system(size: 16, weight: .medium)
        static let body = Font.system(size: 16, weight: .regular)
        static let callout = Font.system(size: 14, weight: .medium)
        static let caption = Font.system(size: 12, weight: .regular)
        static let smallCaption = Font.system(size: 10, weight: .medium)
    }

    // MARK: - Spacing
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
    }

    // MARK: - Corner Radius
    struct CornerRadius {
        static let small: CGFloat = 6
        static let medium: CGFloat = 10
        static let large: CGFloat = 14
        static let extraLarge: CGFloat = 20
    }
}

// MARK: - Color Extension for Hex
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers

/// Premium card styling with shadow and rounded corners
struct PremiumCardModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    var padding: CGFloat = AppTheme.Spacing.lg

    func body(content: Content) -> some View {
        let shadow = AppTheme.Shadows.card(colorScheme)
        return content
            .padding(padding)
            .background(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
            .cornerRadius(AppTheme.CornerRadius.large)
            .shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

/// Primary gradient button styling
struct PrimaryButtonModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    var isDisabled: Bool = false

    func body(content: Content) -> some View {
        let shadow = AppTheme.Shadows.button(colorScheme)
        return content
            .font(AppTheme.Typography.subheadline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.md)
            .background(
                Group {
                    if isDisabled {
                        AppTheme.Colors.warmGray
                    } else {
                        AppTheme.Gradients.primaryButton
                    }
                }
            )
            .cornerRadius(AppTheme.CornerRadius.medium)
            .shadow(color: isDisabled ? .clear : shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

/// Secondary button styling
struct SecondaryButtonModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    func body(content: Content) -> some View {
        content
            .font(AppTheme.Typography.callout)
            .foregroundColor(AppTheme.Colors.burntOrange)
            .padding(.vertical, AppTheme.Spacing.sm)
            .padding(.horizontal, AppTheme.Spacing.md)
            .background(AppTheme.Colors.burntOrange.opacity(0.12))
            .cornerRadius(AppTheme.CornerRadius.small)
    }
}

/// Premium input field styling
struct PremiumInputModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    var isFocused: Bool = false

    func body(content: Content) -> some View {
        content
            .padding(AppTheme.Spacing.md)
            .background(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.inputBackground)
            .cornerRadius(AppTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                    .stroke(isFocused ? AppTheme.Colors.burntOrange : Color.clear, lineWidth: 1.5)
            )
    }
}

/// Category badge styling
struct CategoryBadgeModifier: ViewModifier {
    var color: Color = AppTheme.Colors.burntOrange

    func body(content: Content) -> some View {
        content
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(color)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, AppTheme.Spacing.xs)
            .background(color.opacity(0.12))
            .cornerRadius(AppTheme.CornerRadius.small)
    }
}

/// Section header styling
struct SectionHeaderModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(AppTheme.Typography.headline)
            .foregroundColor(AppTheme.Colors.primaryText)
    }
}

// MARK: - View Extensions

extension View {
    func premiumCard(padding: CGFloat = AppTheme.Spacing.lg) -> some View {
        modifier(PremiumCardModifier(padding: padding))
    }

    func primaryButton(isDisabled: Bool = false) -> some View {
        modifier(PrimaryButtonModifier(isDisabled: isDisabled))
    }

    func secondaryButton() -> some View {
        modifier(SecondaryButtonModifier())
    }

    func premiumInput(isFocused: Bool = false) -> some View {
        modifier(PremiumInputModifier(isFocused: isFocused))
    }

    func categoryBadge(color: Color = AppTheme.Colors.burntOrange) -> some View {
        modifier(CategoryBadgeModifier(color: color))
    }

    func sectionHeader() -> some View {
        modifier(SectionHeaderModifier())
    }
}

// MARK: - Reusable Premium Components

/// Premium styled stat card
struct PremiumStatCard: View {
    let title: String
    let value: String
    let icon: String?

    @Environment(\.colorScheme) var colorScheme

    init(title: String, value: String, icon: String? = nil) {
        self.title = title
        self.value = value
        self.icon = icon
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }

            Text(value)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(AppTheme.Colors.primaryText)

            Text(title)
                .font(AppTheme.Typography.caption)
                .foregroundColor(AppTheme.Colors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .premiumCard(padding: AppTheme.Spacing.md)
    }
}

/// Premium gradient button component
struct GradientButton: View {
    let title: String
    let icon: String?
    let action: () -> Void
    var isLoading: Bool = false
    var isDisabled: Bool = false

    init(title: String, icon: String? = nil, isLoading: Bool = false, isDisabled: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.sm) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                    }
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                }
            }
        }
        .primaryButton(isDisabled: isDisabled || isLoading)
        .disabled(isDisabled || isLoading)
    }
}

/// Premium avatar view with accent ring
struct PremiumAvatar: View {
    let initial: String
    var size: CGFloat = 80

    var body: some View {
        ZStack {
            // Accent ring
            Circle()
                .stroke(
                    AppTheme.Gradients.goldShimmer,
                    lineWidth: 3
                )
                .frame(width: size + 6, height: size + 6)

            // Avatar background
            Circle()
                .fill(AppTheme.Colors.softOrange.opacity(0.3))
                .frame(width: size, height: size)

            // Initial
            Text(initial)
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundColor(AppTheme.Colors.burntOrange)
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            Text("Premium Theme Preview")
                .font(AppTheme.Typography.largeTitle)
                .foregroundColor(AppTheme.Colors.primaryText)

            PremiumAvatar(initial: "R")

            HStack {
                PremiumStatCard(title: "Completed", value: "12", icon: "checkmark.circle.fill")
                PremiumStatCard(title: "Streak", value: "5", icon: "flame.fill")
            }
            .padding(.horizontal)

            GradientButton(title: "Get Started", icon: "arrow.right") {
                print("Tapped")
            }
            .padding(.horizontal)

            Text("Leadership")
                .categoryBadge()

            Text("This is a premium card")
                .premiumCard()
                .padding(.horizontal)
        }
        .padding()
    }
    .background(AppTheme.Colors.background)
}
