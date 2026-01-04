import SwiftUI

// MARK: - Paywall View
struct PaywallView: View {
    @ObservedObject var subscriptionManager: SubscriptionManager
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.xxl) {
                headerSection
                premiumBadge
                featuresList
                pricingSection
                purchaseButton
                restoreButton
                termsSection
                Spacer(minLength: AppTheme.Spacing.xxxl)
            }
            .padding(.horizontal, AppTheme.Spacing.xl)
        }
        .background(
            colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background
        )
    }

    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            Spacer()
            Button(action: { dismiss() }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(AppTheme.Colors.warmGray)
            }
        }
        .padding(.top, AppTheme.Spacing.md)
    }

    // MARK: - Premium Badge
    private var premiumBadge: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(AppTheme.Gradients.primaryButton)
                    .frame(width: 80, height: 80)

                Image(systemName: "crown.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.white)
            }

            Text("Unlock Premium")
                .font(AppTheme.Typography.largeTitle)
                .foregroundColor(AppTheme.Colors.primaryText)

            Text("Transform your business with biblical wisdom")
                .font(AppTheme.Typography.callout)
                .foregroundColor(AppTheme.Colors.secondaryText)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Features List
    private var featuresList: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            PaywallFeatureRow(
                icon: "bookmark.fill",
                title: "Save Lessons",
                description: "Bookmark your favorite lessons for quick access"
            )

            PaywallFeatureRow(
                icon: "speaker.wave.3.fill",
                title: "Audio Lessons",
                description: "Listen to lessons on the go"
            )

            PaywallFeatureRow(
                icon: "map.fill",
                title: "Learning Paths",
                description: "Structured journeys for transformation"
            )

            PaywallFeatureRow(
                icon: "sparkles",
                title: "Full Access",
                description: "Unlock all current and future premium features"
            )
        }
        .premiumCard()
    }

    // MARK: - Pricing Section
    private var pricingSection: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            if let product = subscriptionManager.monthlyProduct {
                Text(product.displayPrice)
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(AppTheme.Colors.burntOrange)

                Text("per month")
                    .font(AppTheme.Typography.callout)
                    .foregroundColor(AppTheme.Colors.secondaryText)
            } else if subscriptionManager.isLoading {
                ProgressView()
                    .tint(AppTheme.Colors.burntOrange)
            } else {
                Text("Unable to load pricing")
                    .font(AppTheme.Typography.callout)
                    .foregroundColor(AppTheme.Colors.error)

                Button("Retry") {
                    Task { await subscriptionManager.loadProducts() }
                }
                .font(AppTheme.Typography.callout)
                .foregroundColor(AppTheme.Colors.burntOrange)
            }
        }
    }

    // MARK: - Purchase Button
    private var purchaseButton: some View {
        GradientButton(
            title: "Subscribe Now",
            icon: "crown.fill",
            isLoading: subscriptionManager.purchaseInProgress,
            isDisabled: subscriptionManager.monthlyProduct == nil
        ) {
            Task {
                guard let product = subscriptionManager.monthlyProduct else { return }
                try? await subscriptionManager.purchase(product)
            }
        }
    }

    // MARK: - Restore Button
    private var restoreButton: some View {
        Button(action: {
            Task { await subscriptionManager.restorePurchases() }
        }) {
            if subscriptionManager.isLoading {
                ProgressView()
                    .tint(AppTheme.Colors.burntOrange)
            } else {
                Text("Restore Purchases")
                    .font(AppTheme.Typography.callout)
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }
        }
        .disabled(subscriptionManager.isLoading)
    }

    // MARK: - Terms Section
    private var termsSection: some View {
        VStack(spacing: AppTheme.Spacing.xs) {
            if let error = subscriptionManager.errorMessage {
                Text(error)
                    .font(AppTheme.Typography.caption)
                    .foregroundColor(AppTheme.Colors.error)
                    .multilineTextAlignment(.center)
                    .padding(.bottom, AppTheme.Spacing.sm)
            }

            Text("Subscription auto-renews monthly unless cancelled at least 24 hours before the end of the current period.")
                .font(AppTheme.Typography.smallCaption)
                .foregroundColor(AppTheme.Colors.warmGray)
                .multilineTextAlignment(.center)

            HStack(spacing: AppTheme.Spacing.md) {
                Link("Terms of Use", destination: URL(string: "https://bibleapp.com/terms")!)
                Text("|")
                    .foregroundColor(AppTheme.Colors.warmGray)
                Link("Privacy Policy", destination: URL(string: "https://bibleapp.com/privacy")!)
            }
            .font(AppTheme.Typography.smallCaption)
            .foregroundColor(AppTheme.Colors.burntOrange)
        }
    }
}

// MARK: - Paywall Feature Row Component
struct PaywallFeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(AppTheme.Colors.burntOrange.opacity(0.15))
                    .frame(width: 44, height: 44)

                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppTheme.Typography.headline)
                    .foregroundColor(AppTheme.Colors.primaryText)

                Text(description)
                    .font(AppTheme.Typography.caption)
                    .foregroundColor(AppTheme.Colors.secondaryText)
            }

            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(AppTheme.Colors.successGreen)
        }
    }
}

#Preview {
    PaywallView(subscriptionManager: SubscriptionManager.shared)
}
