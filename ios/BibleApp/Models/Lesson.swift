import Foundation

// MARK: - Lesson Model
struct Lesson: Identifiable, Codable {
    let id: String
    let title: String
    let subtitle: String?
    let content: String
    let category: LessonCategory
    let bibleVerses: [BibleVerse]
    let practicalSteps: [String]
    let keyTakeaway: String
    let createdAt: Date
    let updatedAt: Date
    let imageURL: String?
    let duration: Int? // in minutes
    let difficulty: Difficulty
    let isFavorite: Bool = false
    let isCompleted: Bool = false

    enum CodingKeys: String, CodingKey {
        case id, title, subtitle, content, category, bibleVerses, practicalSteps
        case keyTakeaway, createdAt, updatedAt, imageURL, duration, difficulty
        case isFavorite, isCompleted
    }
}

// MARK: - Lesson Categories
enum LessonCategory: String, Codable, CaseIterable {
    case leadership = "Leadership & Authority"
    case integrity = "Integrity & Ethics"
    case stewardship = "Financial Stewardship"
    case trust = "Trust & Faith"
    case service = "Serving Others"
    case perseverance = "Perseverance"
    case wisdom = "Wisdom & Discernment"
    case community = "Community & Partnership"
    case timeManagement = "Time & Productivity"
    case decision = "Decision Making"

    var description: String {
        self.rawValue
    }
}

// MARK: - Difficulty Level
enum Difficulty: String, Codable, CaseIterable {
    case beginner = "Beginner"
    case intermediate = "Intermediate"
    case advanced = "Advanced"

    var displayName: String {
        self.rawValue
    }
}

// MARK: - Bible Verse
struct BibleVerse: Identifiable, Codable {
    let id: UUID
    let book: String
    let chapter: Int
    let verse: Int
    let endVerse: Int?
    let text: String
    var reference: String {
        if let endVerse = endVerse, endVerse != verse {
            return "\(book) \(chapter):\(verse)-\(endVerse)"
        }
        return "\(book) \(chapter):\(verse)"
    }

    enum CodingKeys: String, CodingKey {
        case id, book, chapter, verse, endVerse, text
    }

    // Memberwise initializer
    init(id: UUID = UUID(), book: String, chapter: Int, verse: Int, endVerse: Int? = nil, text: String) {
        self.id = id
        self.book = book
        self.chapter = chapter
        self.verse = verse
        self.endVerse = endVerse
        self.text = text
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        book = try container.decode(String.self, forKey: .book)
        chapter = try container.decode(Int.self, forKey: .chapter)
        verse = try container.decode(Int.self, forKey: .verse)
        endVerse = try container.decodeIfPresent(Int.self, forKey: .endVerse)
        text = try container.decode(String.self, forKey: .text)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(book, forKey: .book)
        try container.encode(chapter, forKey: .chapter)
        try container.encode(verse, forKey: .verse)
        try container.encodeIfPresent(endVerse, forKey: .endVerse)
        try container.encode(text, forKey: .text)
    }
}

// MARK: - User Progress
struct UserProgress: Identifiable, Codable {
    let id: String
    let userId: String
    let lessonId: String
    var completedAt: Date?
    var lastViewedAt: Date
    var isFavorite: Bool
    var timeSpent: Int? // in seconds

    var isCompleted: Bool {
        completedAt != nil
    }
}

// MARK: - Lesson Filter
struct LessonFilter {
    var category: LessonCategory?
    var difficulty: Difficulty?
    var searchText: String = ""
    var favoriteOnly: Bool = false
    var completedOnly: Bool = false

    var isEmpty: Bool {
        category == nil && difficulty == nil && searchText.isEmpty
            && !favoriteOnly && !completedOnly
    }
}
