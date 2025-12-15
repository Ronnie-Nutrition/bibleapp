import Foundation
import SwiftUI

// MARK: - Onboarding Manager
/// Manages onboarding state and user preferences
class OnboardingManager: ObservableObject {
    static let shared = OnboardingManager()

    private let hasCompletedOnboardingKey = "hasCompletedOnboarding"
    private let primaryChallengeKey = "primaryChallenge"
    private let userNameKey = "userName"

    @Published var hasCompletedOnboarding: Bool {
        didSet {
            UserDefaults.standard.set(hasCompletedOnboarding, forKey: hasCompletedOnboardingKey)
        }
    }

    @Published var primaryChallenge: ProblemCategory? {
        didSet {
            if let challenge = primaryChallenge {
                UserDefaults.standard.set(challenge.rawValue, forKey: primaryChallengeKey)
            } else {
                UserDefaults.standard.removeObject(forKey: primaryChallengeKey)
            }
        }
    }

    @Published var userName: String {
        didSet {
            UserDefaults.standard.set(userName, forKey: userNameKey)
        }
    }

    private init() {
        self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: hasCompletedOnboardingKey)
        self.userName = UserDefaults.standard.string(forKey: userNameKey) ?? ""

        if let challengeRaw = UserDefaults.standard.string(forKey: primaryChallengeKey) {
            self.primaryChallenge = ProblemCategory(rawValue: challengeRaw)
        } else {
            self.primaryChallenge = nil
        }
    }

    func completeOnboarding(name: String, challenge: ProblemCategory) {
        self.userName = name
        self.primaryChallenge = challenge
        self.hasCompletedOnboarding = true
    }

    func resetOnboarding() {
        self.hasCompletedOnboarding = false
        self.primaryChallenge = nil
        self.userName = ""
    }
}
