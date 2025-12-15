import Foundation

// MARK: - Lessons View Model
@MainActor
class LessonsViewModel: ObservableObject {
    @Published var lessons: [Lesson] = []
    @Published var filteredLessons: [Lesson] = []
    @Published var selectedLesson: Lesson?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var filter = LessonFilter()
    @Published var userProgress: [String: UserProgress] = [:]

    private let firebaseService = FirebaseService.shared

    // MARK: - Initialization

    func loadLessons() async {
        isLoading = true
        errorMessage = nil

        do {
            // Fetch lessons from Firebase Firestore
            lessons = try await firebaseService.fetchLessons(limit: 50)
            applyFilter()
        } catch {
            errorMessage = "Failed to load lessons: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func loadLessonsByCategory(_ category: LessonCategory) async {
        isLoading = true
        errorMessage = nil

        do {
            // Fetch lessons by category from Firebase Firestore
            lessons = try await firebaseService.fetchLessonsByCategory(category, limit: 50)
            applyFilter()
        } catch {
            errorMessage = "Failed to load lessons: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Problem-First Filtering

    func filterByProblem(_ problem: ProblemCategory) {
        filter.problemCategory = problem
        applyFilter()
    }

    func getLessonsForProblem(_ problem: ProblemCategory) -> [Lesson] {
        lessons.filter { $0.problemTags.contains(problem) }
    }

    func getTopProblems() -> [ProblemCategory] {
        // Return problems that have lessons available, sorted by count
        var problemCounts: [ProblemCategory: Int] = [:]
        for lesson in lessons {
            for problem in lesson.problemTags {
                problemCounts[problem, default: 0] += 1
            }
        }
        return problemCounts.sorted { $0.value > $1.value }.map { $0.key }
    }

    // MARK: - Filtering

    func applyFilter() {
        if filter.isEmpty {
            filteredLessons = lessons
        } else {
            filteredLessons = lessons.filter { lesson in
                filterLessonMatches(lesson)
            }
        }
    }

    private func filterLessonMatches(_ lesson: Lesson) -> Bool {
        // Check category filter
        if let category = filter.category, lesson.category != category {
            return false
        }

        // Check difficulty filter
        if let difficulty = filter.difficulty, lesson.difficulty != difficulty {
            return false
        }

        // Check problem category filter
        if let problemCategory = filter.problemCategory {
            if !lesson.problemTags.contains(problemCategory) {
                return false
            }
        }

        // Check search text (also search problem hook and benefit)
        if !filter.searchText.isEmpty {
            let searchLower = filter.searchText.lowercased()
            let matchesTitle = lesson.title.lowercased().contains(searchLower)
            let matchesSubtitle = lesson.subtitle?.lowercased().contains(searchLower) ?? false
            let matchesContent = lesson.content.lowercased().contains(searchLower)
            let matchesHook = lesson.problemHook?.lowercased().contains(searchLower) ?? false
            let matchesBenefit = lesson.benefitStatement?.lowercased().contains(searchLower) ?? false

            if !matchesTitle && !matchesSubtitle && !matchesContent && !matchesHook && !matchesBenefit {
                return false
            }
        }

        // Check favorite filter
        if filter.favoriteOnly && !lesson.isFavorite {
            return false
        }

        // Check completed filter
        if filter.completedOnly && !lesson.isCompleted {
            return false
        }

        return true
    }

    func updateFilter(_ newFilter: LessonFilter) {
        filter = newFilter
        applyFilter()
    }

    // MARK: - Lesson Operations

    func selectLesson(_ lesson: Lesson) {
        selectedLesson = lesson
    }

    func completeLessonProgress(lessonId: String) async {
        let progress = UserProgress(
            id: UUID().uuidString,
            userId: "",
            lessonId: lessonId,
            completedAt: Date(),
            lastViewedAt: Date(),
            isFavorite: false,
            timeSpent: 0
        )

        // TODO: Implement backend endpoint for saving lesson progress
        // For now, update local state only
        if lessons.firstIndex(where: { $0.id == lessonId }) != nil {
            userProgress[lessonId] = progress
            applyFilter()
        }
    }

    func toggleFavorite(lessonId: String) async {
        if lessons.firstIndex(where: { $0.id == lessonId }) != nil {
            // Toggle favorite status
            let currentFavorite = isLessonFavorite(lessonId)

            // TODO: Call backend API to sync favorite status
            // For now, update local progress state
            if var progress = userProgress[lessonId] {
                progress.isFavorite = !currentFavorite
                userProgress[lessonId] = progress
                applyFilter()
            }
        }
    }

    // MARK: - Search

    func search(text: String) {
        filter.searchText = text
        applyFilter()
    }

    func clearFilters() {
        filter = LessonFilter()
        applyFilter()
    }
}

// MARK: - Lessons ViewModel Extension for UserProgress handling
extension LessonsViewModel {
    func getProgressForLesson(_ lessonId: String) -> UserProgress? {
        userProgress[lessonId]
    }

    func isLessonCompleted(_ lessonId: String) -> Bool {
        getProgressForLesson(lessonId)?.isCompleted ?? false
    }

    func isLessonFavorite(_ lessonId: String) -> Bool {
        getProgressForLesson(lessonId)?.isFavorite ?? false
    }
}
