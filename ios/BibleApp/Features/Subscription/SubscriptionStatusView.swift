import SwiftUI

// MARK: - Subscription Status View
struct SubscriptionStatusView: View {
    @ObservedObject var subscriptionManager: SubscriptionManager
    @State private var showPaywall = false

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            if subscriptionManager.isPremium {
                premiumActiveView
            } else {
                upgradePromptView
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView(subscriptionManager: subscriptionManager)
        }
    }

    private var premiumActiveView: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            ZStack {
                Circle()
                    .fill(AppTheme.Gradients.primaryButton)
                    .frame(width: 50, height: 50)

                Image(systemName: "crown.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Premium Active")
                    .font(AppTheme.Typography.headline)
                    .foregroundColor(AppTheme.Colors.primaryText)

                if case .subscribed(let date) = subscriptionManager.subscriptionStatus {
                    Text("Renews \(date.formatted(date: .abbreviated, time: .omitted))")
                        .font(AppTheme.Typography.caption)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                }
            }

            Spacer()

            Button("Manage") {
                if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                    UIApplication.shared.open(url)
                }
            }
            .font(AppTheme.Typography.callout)
            .foregroundColor(AppTheme.Colors.burntOrange)
        }
        .premiumCard()
    }

    private var upgradePromptView: some View {
        Button(action: { showPaywall = true }) {
            HStack(spacing: AppTheme.Spacing.md) {
                ZStack {
                    Circle()
                        .fill(AppTheme.Colors.burntOrange.opacity(0.15))
                        .frame(width: 50, height: 50)

                    Image(systemName: "crown.fill")
                        .font(.system(size: 22))
                        .foregroundColor(AppTheme.Colors.burntOrange)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Upgrade to Premium")
                        .font(AppTheme.Typography.headline)
                        .foregroundColor(AppTheme.Colors.primaryText)

                    Text("Unlock bookmarks, audio & learning paths")
                        .font(AppTheme.Typography.caption)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(AppTheme.Colors.warmGray)
            }
            .premiumCard()
        }
        .buttonStyle(.plain)
    }
}

#Preview("Not Premium") {
    SubscriptionStatusView(subscriptionManager: SubscriptionManager.shared)
        .padding()
        .background(AppTheme.Colors.background)
}
