import Foundation

// MARK: - User Model
struct User: Identifiable, Codable {
    let id: String
    let email: String
    let displayName: String?
    let profileImageURL: String?
    let createdAt: Date
    let updatedAt: Date
    let preferences: UserPreferences
    let stats: UserStats?

    enum CodingKeys: String, CodingKey {
        case id, email, displayName, profileImageURL, createdAt, updatedAt
        case preferences, stats
    }
}

// MARK: - User Preferences
struct UserPreferences: Codable {
    var notificationsEnabled: Bool = true
    var dailyReminderTime: String? // HH:mm format
    var preferredCategories: [LessonCategory] = []
    var darkModeEnabled: Bool? // nil = follow system
    var emailNotifications: Bool = true
    var theme: Theme = .system

    enum Theme: String, Codable {
        case light, dark, system
    }
}

// MARK: - User Statistics
struct UserStats: Codable {
    var lessonsCompleted: Int = 0
    var lessonsStarted: Int = 0
    var totalTimeSpent: Int = 0 // in minutes
    var favoriteCount: Int = 0
    var currentStreak: Int = 0 // consecutive days
    var longestStreak: Int = 0
    var lastActiveDate: Date?

    var averageTimePerLesson: Int {
        guard lessonsCompleted > 0 else { return 0 }
        return totalTimeSpent / lessonsCompleted
    }
}

// MARK: - Authentication Response
struct AuthResponse: Codable {
    let user: User
    let token: String
    let refreshToken: String?
}

// MARK: - User Registration Request
struct RegistrationRequest: Encodable {
    let email: String
    let password: String
    let displayName: String
}

// MARK: - User Login Request
struct LoginRequest: Encodable {
    let email: String
    let password: String
}

// MARK: - Update Profile Request
struct UpdateProfileRequest: Encodable {
    let displayName: String?
    let preferences: UserPreferences?
}
