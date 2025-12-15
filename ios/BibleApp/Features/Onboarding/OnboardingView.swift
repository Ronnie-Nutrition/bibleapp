import SwiftUI

// MARK: - Onboarding View
struct OnboardingView: View {
    @ObservedObject var onboardingManager: OnboardingManager
    @State private var currentStep = 0
    @State private var userName = ""
    @State private var selectedChallenge: ProblemCategory?
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Background
            (colorScheme == .dark ? AppTheme.Colors.darkBackground : AppTheme.Colors.background)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress indicator
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(0..<3) { step in
                        Capsule()
                            .fill(step <= currentStep ? AppTheme.Colors.burntOrange : AppTheme.Colors.warmGray.opacity(0.3))
                            .frame(height: 4)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.top, AppTheme.Spacing.xl)

                // Content
                TabView(selection: $currentStep) {
                    WelcomeStep(userName: $userName, onNext: { nextStep() })
                        .tag(0)

                    ChallengeSelectionStep(selectedChallenge: $selectedChallenge, onNext: { nextStep() })
                        .tag(1)

                    PersonalizedPreviewStep(
                        userName: userName,
                        challenge: selectedChallenge,
                        onComplete: { completeOnboarding() }
                    )
                    .tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: currentStep)
            }
        }
    }

    private func nextStep() {
        withAnimation {
            currentStep += 1
        }
    }

    private func completeOnboarding() {
        if let challenge = selectedChallenge {
            onboardingManager.completeOnboarding(name: userName, challenge: challenge)
        }
    }
}

// MARK: - Welcome Step
struct WelcomeStep: View {
    @Binding var userName: String
    let onNext: () -> Void
    @FocusState private var isNameFocused: Bool
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xxl) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(AppTheme.Colors.softOrange.opacity(0.3))
                    .frame(width: 100, height: 100)

                Image(systemName: "book.fill")
                    .font(.system(size: 44))
                    .foregroundColor(AppTheme.Colors.burntOrange)
            }

            VStack(spacing: AppTheme.Spacing.md) {
                Text("Welcome to Biblical Wisdom")
                    .font(AppTheme.Typography.title)
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .multilineTextAlignment(.center)

                Text("Timeless principles for modern entrepreneurs")
                    .font(AppTheme.Typography.body)
                    .foregroundColor(AppTheme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
            }

            // Name input
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                Text("What should we call you?")
                    .font(AppTheme.Typography.callout)
                    .foregroundColor(AppTheme.Colors.primaryText)

                TextField("Your first name", text: $userName)
                    .font(AppTheme.Typography.body)
                    .padding(AppTheme.Spacing.md)
                    .background(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.inputBackground)
                    .cornerRadius(AppTheme.CornerRadius.medium)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                            .stroke(isNameFocused ? AppTheme.Colors.burntOrange : Color.clear, lineWidth: 1.5)
                    )
                    .focused($isNameFocused)
            }
            .padding(.horizontal, AppTheme.Spacing.xl)

            Spacer()

            // Continue button
            Button(action: onNext) {
                Text("Continue")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.md)
                    .background(
                        Group {
                            if userName.isEmpty {
                                AppTheme.Colors.warmGray
                            } else {
                                AppTheme.Gradients.primaryButton
                            }
                        }
                    )
                    .cornerRadius(AppTheme.CornerRadius.medium)
            }
            .disabled(userName.isEmpty)
            .padding(.horizontal, AppTheme.Spacing.xl)
            .padding(.bottom, AppTheme.Spacing.xxxl)
        }
    }
}

// MARK: - Challenge Selection Step
struct ChallengeSelectionStep: View {
    @Binding var selectedChallenge: ProblemCategory?
    let onNext: () -> Void
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xl) {
            VStack(spacing: AppTheme.Spacing.md) {
                Text("What's Your Biggest Challenge?")
                    .font(AppTheme.Typography.title)
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .multilineTextAlignment(.center)

                Text("We'll personalize your experience based on your answer")
                    .font(AppTheme.Typography.callout)
                    .foregroundColor(AppTheme.Colors.secondaryText)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, AppTheme.Spacing.xl)

            // Challenge grid
            ScrollView {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: AppTheme.Spacing.md) {
                    ForEach(ProblemCategory.allCases, id: \.self) { problem in
                        ChallengeCard(
                            problem: problem,
                            isSelected: selectedChallenge == problem,
                            onTap: { selectedChallenge = problem }
                        )
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
            }

            // Continue button
            Button(action: onNext) {
                Text("Continue")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.md)
                    .background(
                        Group {
                            if selectedChallenge == nil {
                                AppTheme.Colors.warmGray
                            } else {
                                AppTheme.Gradients.primaryButton
                            }
                        }
                    )
                    .cornerRadius(AppTheme.CornerRadius.medium)
            }
            .disabled(selectedChallenge == nil)
            .padding(.horizontal, AppTheme.Spacing.xl)
            .padding(.bottom, AppTheme.Spacing.xxxl)
        }
    }
}

// MARK: - Challenge Card
struct ChallengeCard: View {
    let problem: ProblemCategory
    let isSelected: Bool
    let onTap: () -> Void
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                Image(systemName: problem.icon)
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? .white : AppTheme.Colors.burntOrange)

                Text(problem.displayText)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(isSelected ? .white : AppTheme.Colors.primaryText)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .frame(height: 85)
            .padding(AppTheme.Spacing.md)
            .background(
                Group {
                    if isSelected {
                        AppTheme.Gradients.primaryButton
                    } else {
                        colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground
                    }
                }
            )
            .cornerRadius(AppTheme.CornerRadius.medium)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.medium)
                    .stroke(
                        isSelected ? AppTheme.Colors.burntOrange : AppTheme.Colors.burntOrange.opacity(0.2),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Personalized Preview Step
struct PersonalizedPreviewStep: View {
    let userName: String
    let challenge: ProblemCategory?
    let onComplete: () -> Void
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xxl) {
            Spacer()

            // Success checkmark
            ZStack {
                Circle()
                    .fill(AppTheme.Colors.successGreen.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 56))
                    .foregroundColor(AppTheme.Colors.successGreen)
            }

            VStack(spacing: AppTheme.Spacing.md) {
                Text("You're All Set, \(userName.isEmpty ? "Friend" : userName)!")
                    .font(AppTheme.Typography.title)
                    .foregroundColor(AppTheme.Colors.primaryText)
                    .multilineTextAlignment(.center)

                if let challenge = challenge {
                    Text("We'll show you biblical wisdom for \"\(challenge.displayText.replacingOccurrences(of: "?", with: ""))\" first.")
                        .font(AppTheme.Typography.body)
                        .foregroundColor(AppTheme.Colors.secondaryText)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, AppTheme.Spacing.xl)
                }
            }

            // What you'll get
            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                FeatureRow(icon: "sparkles", text: "Personalized lesson recommendations")
                FeatureRow(icon: "book.fill", text: "30+ biblical business lessons")
                FeatureRow(icon: "lightbulb.fill", text: "Practical steps you can apply today")
            }
            .padding(AppTheme.Spacing.lg)
            .background(colorScheme == .dark ? AppTheme.Colors.darkCardBackground : AppTheme.Colors.cardBackground)
            .cornerRadius(AppTheme.CornerRadius.large)
            .padding(.horizontal, AppTheme.Spacing.xl)

            Spacer()

            // Start button
            Button(action: onComplete) {
                Text("Start My Journey")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.md)
                    .background(AppTheme.Gradients.primaryButton)
                    .cornerRadius(AppTheme.CornerRadius.medium)
            }
            .padding(.horizontal, AppTheme.Spacing.xl)
            .padding(.bottom, AppTheme.Spacing.xxxl)
        }
    }
}

// MARK: - Feature Row
struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(AppTheme.Colors.burntOrange)
                .frame(width: 24)

            Text(text)
                .font(AppTheme.Typography.callout)
                .foregroundColor(AppTheme.Colors.primaryText)

            Spacer()
        }
    }
}

#Preview {
    OnboardingView(onboardingManager: OnboardingManager.shared)
}
