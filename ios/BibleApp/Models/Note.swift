import Foundation

// MARK: - Lesson Note
struct LessonNote: Codable, Identifiable {
    let id: String
    let userId: String
    let lessonId: String
    let lessonTitle: String
    let lessonCategory: String
    let content: String
    let tags: [String]
    let createdAt: String
    let updatedAt: String
    let characterCount: Int
    let wordCount: Int
}

// MARK: - Note Stats
struct NoteStats: Codable {
    let totalNotes: Int
    let totalWords: Int
    let totalCharacters: Int
    let averageWordsPerNote: Int
    let uniqueTags: Int
    let tags: [String]
    let lessonsWithNotes: Int
    let categoriesWithNotes: [CategoryNoteCount]
    let recentActivity: RecentNoteActivity
}

// MARK: - Category Note Count
struct CategoryNoteCount: Codable, Identifiable {
    var id: String { category }
    let category: String
    let count: Int
}

// MARK: - Recent Note Activity
struct RecentNoteActivity: Codable {
    let notesThisWeek: Int
    let notesThisMonth: Int
}

// MARK: - Extensions for UI
extension LessonNote {
    var createdDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: createdAt)
    }

    var updatedDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: updatedAt)
    }

    var formattedCreatedDate: String {
        guard let date = createdDate else { return "Unknown" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    var formattedUpdatedDate: String {
        guard let date = updatedDate else { return "Unknown" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    var preview: String {
        if content.count > 100 {
            return String(content.prefix(100)) + "..."
        }
        return content
    }

    var tagsList: String {
        tags.isEmpty ? "No tags" : tags.joined(separator: ", ")
    }
}

extension NoteStats {
    var formattedTotalWords: String {
        return "\(totalWords.formatted()) words"
    }

    var formattedAverageWords: String {
        return "\(averageWordsPerNote) words/note"
    }

    var topCategories: [CategoryNoteCount] {
        categoriesWithNotes.sorted { $0.count > $1.count }.prefix(5).map { $0 }
    }
}

// MARK: - Suggested Tags for Entrepreneurs
enum SuggestedNoteTags {
    static let actionOriented = ["action-item", "goal", "strategy", "decision"]
    static let businessTopics = ["leadership", "integrity", "stewardship", "wisdom", "faith"]
    static let applicationAreas = ["team-building", "customer-service", "finances", "growth", "challenges"]
    static let reflectionTypes = ["reflection", "question", "prayer", "testimony"]

    static var all: [String] {
        actionOriented + businessTopics + applicationAreas + reflectionTypes
    }

    static var categories: [(title: String, tags: [String])] {
        [
            ("Action-Oriented", actionOriented),
            ("Business Topics", businessTopics),
            ("Application Areas", applicationAreas),
            ("Reflection Types", reflectionTypes)
        ]
    }
}
