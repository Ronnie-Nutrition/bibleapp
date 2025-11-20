import Foundation

// MARK: - Progress Completion Response
struct ProgressCompletionResponse: Codable {
    let success: Bool
    let message: String
    let lessonId: String
    let completedAt: String
    let stats: ProgressStats
}

// MARK: - User Progress
struct UserProgress: Codable {
    let userId: String
    let completedLessons: [CompletedLessonInfo]
    let totalCompleted: Int
    let totalTimeSpent: Int
    let currentStreak: Int
    let longestStreak: Int
    let lastActivityAt: String?
    let createdAt: String?
}

// MARK: - Completed Lesson Info
struct CompletedLessonInfo: Codable, Identifiable {
    var id: String { lessonId }
    let lessonId: String
    let completedAt: String
    let lessonTitle: String
    let lessonCategory: String
    let timeSpent: Int?
}

// MARK: - Progress Stats
struct ProgressStats: Codable {
    let totalCompleted: Int
    let totalTimeSpent: Int
    let currentStreak: Int
    let longestStreak: Int
    let completionRate: Int
    let categoriesStudied: [CategoryProgress]
    let averageTimePerLesson: Int
    let lastActivityAt: String?
    let thisWeek: Int
    let thisMonth: Int
}

// MARK: - Category Progress
struct CategoryProgress: Codable, Identifiable {
    var id: String { category }
    let category: String
    let count: Int
}

// MARK: - Lesson Completion Status
struct LessonCompletionStatus: Codable {
    let completed: Bool
    let lessonId: String
    let userId: String
    let completedAt: String?
    let timeSpent: Int?
}

// MARK: - Leaderboard Entry
struct LeaderboardEntry: Codable, Identifiable {
    var id: String { userId }
    let userId: String
    let totalCompleted: Int
    let currentStreak: Int
    let longestStreak: Int
}

// MARK: - Extensions for UI
extension ProgressStats {
    var formattedTotalTime: String {
        let hours = totalTimeSpent / 3600
        let minutes = (totalTimeSpent % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes) minutes"
        }
    }

    var formattedAverageTime: String {
        let minutes = averageTimePerLesson / 60
        return "\(minutes) min"
    }

    var completionRateFormatted: String {
        return "\(completionRate)%"
    }
}

extension CompletedLessonInfo {
    var completedDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: completedAt)
    }

    var formattedTimeSpent: String {
        guard let time = timeSpent else { return "N/A" }
        let minutes = time / 60
        return "\(minutes) min"
    }
}
