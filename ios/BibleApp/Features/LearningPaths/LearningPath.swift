import Foundation
import SwiftUI

// MARK: - Learning Path Model
struct LearningPath: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let description: String
    let icon: String
    let color: Color
    let lessonIds: [String]
    let durationDays: Int

    var lessonCount: Int {
        lessonIds.count
    }
}

// MARK: - Predefined Learning Paths
struct LearningPathsData {
    static let allPaths: [LearningPath] = [
        LearningPath(
            id: "leadership-bootcamp",
            title: "Leadership Bootcamp",
            subtitle: "7-Day Journey",
            description: "Master biblical leadership principles that build teams and inspire loyalty",
            icon: "crown.fill",
            color: AppTheme.Colors.burntOrange,
            lessonIds: ["lesson-001", "lesson-008", "lesson-007", "lesson-15", "lesson-23", "lesson-19", "lesson-28"],
            durationDays: 7
        ),
        LearningPath(
            id: "financial-wisdom",
            title: "Financial Wisdom",
            subtitle: "5-Day Journey",
            description: "Biblical principles for managing money, stewardship, and abundance",
            icon: "dollarsign.circle.fill",
            color: AppTheme.Colors.deepTeal,
            lessonIds: ["lesson-003", "lesson-14", "lesson-002", "lesson-22", "lesson-30"],
            durationDays: 5
        ),
        LearningPath(
            id: "overcoming-fear",
            title: "Overcoming Fear & Doubt",
            subtitle: "7-Day Journey",
            description: "Build unshakeable confidence and courage in your business decisions",
            icon: "bolt.fill",
            color: AppTheme.Colors.richBurgundy,
            lessonIds: ["lesson-006", "lesson-18", "lesson-004", "lesson-20", "lesson-12", "lesson-17", "lesson-29"],
            durationDays: 7
        ),
        LearningPath(
            id: "work-life-balance",
            title: "Work-Life Harmony",
            subtitle: "5-Day Journey",
            description: "Find peace between business demands and personal life",
            icon: "scale.3d",
            color: AppTheme.Colors.amberGlow,
            lessonIds: ["lesson-009", "lesson-16", "lesson-21", "lesson-27", "lesson-25"],
            durationDays: 5
        ),
        LearningPath(
            id: "startup-foundation",
            title: "Startup Foundation",
            subtitle: "10-Day Journey",
            description: "Essential biblical wisdom for new entrepreneurs starting their journey",
            icon: "arrow.up.right.circle.fill",
            color: AppTheme.Colors.successGreen,
            lessonIds: ["lesson-005", "lesson-11", "lesson-003", "lesson-007", "lesson-18", "lesson-001", "lesson-13", "lesson-17", "lesson-24", "lesson-30"],
            durationDays: 10
        )
    ]
}

// MARK: - Learning Path Progress Manager
class LearningPathProgressManager: ObservableObject {
    static let shared = LearningPathProgressManager()

    @Published var pathProgress: [String: Set<String>] = [:] // pathId: completedLessonIds
    @Published var activePathId: String?

    private let userDefaultsKey = "learningPathProgress"
    private let activePathKey = "activeLearningPath"

    private init() {
        loadProgress()
    }

    func startPath(_ pathId: String) {
        activePathId = pathId
        if pathProgress[pathId] == nil {
            pathProgress[pathId] = []
        }
        saveProgress()
    }

    func completeLessonInPath(_ pathId: String, lessonId: String) {
        if pathProgress[pathId] == nil {
            pathProgress[pathId] = []
        }
        pathProgress[pathId]?.insert(lessonId)
        saveProgress()
    }

    func getProgress(for path: LearningPath) -> Double {
        guard let completed = pathProgress[path.id] else { return 0 }
        return Double(completed.count) / Double(path.lessonCount)
    }

    func isLessonCompleted(in pathId: String, lessonId: String) -> Bool {
        pathProgress[pathId]?.contains(lessonId) ?? false
    }

    func isPathCompleted(_ pathId: String) -> Bool {
        guard let path = LearningPathsData.allPaths.first(where: { $0.id == pathId }),
              let completed = pathProgress[pathId] else { return false }
        return completed.count >= path.lessonCount
    }

    private func loadProgress() {
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey),
           let decoded = try? JSONDecoder().decode([String: [String]].self, from: data) {
            pathProgress = decoded.mapValues { Set($0) }
        }
        activePathId = UserDefaults.standard.string(forKey: activePathKey)
    }

    private func saveProgress() {
        let encoded = pathProgress.mapValues { Array($0) }
        if let data = try? JSONEncoder().encode(encoded) {
            UserDefaults.standard.set(data, forKey: userDefaultsKey)
        }
        UserDefaults.standard.set(activePathId, forKey: activePathKey)
    }
}
