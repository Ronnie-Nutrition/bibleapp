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
    var isFavorite: Bool = false
    var isCompleted: Bool = false

    // Problem-first marketing fields
    let problemHook: String?        // e.g., "Not Enough to Succeed?"
    let benefitStatement: String?   // e.g., "Learn to multiply what you have"
    let problemTags: [ProblemCategory]  // Which pain points this lesson addresses

    enum CodingKeys: String, CodingKey {
        case id, title, subtitle, content, category, bibleVerses, practicalSteps
        case keyTakeaway, createdAt, updatedAt, imageURL, duration, difficulty
        case isFavorite, isCompleted, problemHook, benefitStatement, problemTags
    }

    // Memberwise initializer for direct construction (used in previews and tests)
    init(
        id: String,
        title: String,
        subtitle: String? = nil,
        content: String,
        category: LessonCategory,
        bibleVerses: [BibleVerse] = [],
        practicalSteps: [String] = [],
        keyTakeaway: String,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        imageURL: String? = nil,
        duration: Int? = nil,
        difficulty: Difficulty = .beginner,
        isFavorite: Bool = false,
        isCompleted: Bool = false,
        problemHook: String? = nil,
        benefitStatement: String? = nil,
        problemTags: [ProblemCategory] = []
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.content = content
        self.category = category
        self.bibleVerses = bibleVerses
        self.practicalSteps = practicalSteps
        self.keyTakeaway = keyTakeaway
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.imageURL = imageURL
        self.duration = duration
        self.difficulty = difficulty
        self.isFavorite = isFavorite
        self.isCompleted = isCompleted
        self.problemHook = problemHook
        self.benefitStatement = benefitStatement
        self.problemTags = problemTags
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        subtitle = try container.decodeIfPresent(String.self, forKey: .subtitle)
        content = try container.decode(String.self, forKey: .content)
        keyTakeaway = try container.decode(String.self, forKey: .keyTakeaway)
        imageURL = try container.decodeIfPresent(String.self, forKey: .imageURL)
        duration = try container.decodeIfPresent(Int.self, forKey: .duration)
        isFavorite = try container.decodeIfPresent(Bool.self, forKey: .isFavorite) ?? false
        isCompleted = try container.decodeIfPresent(Bool.self, forKey: .isCompleted) ?? false

        // Problem-first fields
        problemHook = try container.decodeIfPresent(String.self, forKey: .problemHook)
        benefitStatement = try container.decodeIfPresent(String.self, forKey: .benefitStatement)
        problemTags = try container.decodeIfPresent([ProblemCategory].self, forKey: .problemTags) ?? []

        // Decode category from raw string value
        let categoryString = try container.decode(String.self, forKey: .category)
        category = LessonCategory(rawValue: categoryString) ?? .leadership

        // Decode difficulty from raw string value
        let difficultyString = try container.decode(String.self, forKey: .difficulty)
        difficulty = Difficulty(rawValue: difficultyString) ?? .beginner

        // Decode bible verses
        bibleVerses = try container.decodeIfPresent([BibleVerse].self, forKey: .bibleVerses) ?? []

        // Decode practical steps
        practicalSteps = try container.decodeIfPresent([String].self, forKey: .practicalSteps) ?? []

        // Decode dates with fallback
        createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt) ?? Date()
        updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt) ?? Date()
    }
}

// MARK: - Problem Categories (Pain Points)
/// Problem-first categories that speak to entrepreneur struggles
enum ProblemCategory: String, Codable, CaseIterable {
    case moneyStruggles = "Money Struggles"
    case cantFindCustomers = "Can't Find Customers"
    case teamProblems = "Team Problems"
    case overwhelmed = "Feeling Overwhelmed"
    case toughDecisions = "Tough Decisions"
    case failingBusiness = "Business is Failing"
    case noDirection = "No Clear Direction"
    case workLifeBalance = "Work-Life Balance"
    case competitionPressure = "Competition Pressure"
    case startingOut = "Just Starting Out"

    var displayText: String {
        switch self {
        case .moneyStruggles: return "Struggling with Money?"
        case .cantFindCustomers: return "Can't Find Customers?"
        case .teamProblems: return "Team Not Working?"
        case .overwhelmed: return "Feeling Overwhelmed?"
        case .toughDecisions: return "Facing a Tough Decision?"
        case .failingBusiness: return "Business Failing?"
        case .noDirection: return "Lost & Confused?"
        case .workLifeBalance: return "No Work-Life Balance?"
        case .competitionPressure: return "Crushed by Competition?"
        case .startingOut: return "Don't Know Where to Start?"
        }
    }

    var icon: String {
        switch self {
        case .moneyStruggles: return "dollarsign.circle"
        case .cantFindCustomers: return "person.crop.circle.badge.questionmark"
        case .teamProblems: return "person.3"
        case .overwhelmed: return "tornado"
        case .toughDecisions: return "arrow.triangle.branch"
        case .failingBusiness: return "chart.line.downtrend.xyaxis"
        case .noDirection: return "signpost.right.and.left"
        case .workLifeBalance: return "scalemass"
        case .competitionPressure: return "figure.run"
        case .startingOut: return "sparkles"
        }
    }
}

// MARK: - Lesson Categories (Biblical)
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
    var problemCategory: ProblemCategory?  // Filter by pain point
    var searchText: String = ""
    var favoriteOnly: Bool = false
    var completedOnly: Bool = false

    var isEmpty: Bool {
        category == nil && difficulty == nil && problemCategory == nil
            && searchText.isEmpty && !favoriteOnly && !completedOnly
    }
}
