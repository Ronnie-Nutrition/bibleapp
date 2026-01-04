import SwiftUI

// MARK: - Premium Feature Gate
/// Wraps content and shows paywall if user is not premium
struct PremiumFeatureGate<Content: View>: View {
    @ObservedObject var subscriptionManager: SubscriptionManager
    @State private var showPaywall = false
    @Environment(\.colorScheme) var colorScheme

    let featureName: String
    let content: () -> Content

    init(
        subscriptionManager: SubscriptionManager,
        featureName: String,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.subscriptionManager = subscriptionManager
        self.featureName = featureName
        self.content = content
    }

    var body: some View {
        Group {
            if subscriptionManager.isPremium {
                content()
            } else {
                lockedContent
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView(subscriptionManager: subscriptionManager)
        }
    }

    private var lockedContent: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Spacer()

            ZStack {
                Circle()
                    .fill(AppTheme.Colors.burntOrange.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: "crown.fill")
                    .font(.system(size: 44))
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }

            Text("Premium Feature")
                .font(AppTheme.Typography.title)
                .foregroundColor(AppTheme.Colors.primaryText)

            Text("\(featureName) is a premium feature. Upgrade to unlock all premium benefits.")
                .font(AppTheme.Typography.body)
                .foregroundColor(AppTheme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppTheme.Spacing.xxxl)

            GradientButton(title: "Unlock Premium", icon: "crown.fill") {
                showPaywall = true
            }
            .padding(.horizontal, AppTheme.Spacing.xl)

            Button("Restore Purchases") {
                Task { await subscriptionManager.restorePurchases() }
            }
            .font(AppTheme.Typography.callout)
            .foregroundColor(AppTheme.Colors.burntOrange)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
    }
}

// MARK: - Premium Lock Overlay
/// Small lock indicator for buttons/icons that are premium-gated
struct PremiumLockBadge: View {
    var body: some View {
        Image(systemName: "crown.fill")
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .padding(4)
            .background(
                Circle()
                    .fill(AppTheme.Colors.burntOrange)
            )
    }
}

#Preview("Locked State") {
    PremiumFeatureGate(
        subscriptionManager: SubscriptionManager.shared,
        featureName: "Saved Lessons"
    ) {
        Text("Premium Content Here")
    }
}
