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
    @Published var userProgress: [UserProgress] = [:]

    private let firebaseService = FirebaseService.shared

    // MARK: - Initialization

    func loadLessons() async {
        isLoading = true
        errorMessage = nil

        do {
            lessons = try await firebaseService.fetchLessons(limit: 50)
            userProgress = try await firebaseService.fetchUserProgress()
            applyFilter()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func loadLessonsByCategory(_ category: LessonCategory) async {
        isLoading = true
        errorMessage = nil

        do {
            lessons = try await firebaseService.fetchLessonsByCategory(category)
            applyFilter()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
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

        // Check search text
        if !filter.searchText.isEmpty {
            let searchLower = filter.searchText.lowercased()
            let matchesTitle = lesson.title.lowercased().contains(searchLower)
            let matchesSubtitle = lesson.subtitle?.lowercased().contains(searchLower) ?? false
            let matchesContent = lesson.content.lowercased().contains(searchLower)

            if !matchesTitle && !matchesSubtitle && !matchesContent {
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
        do {
            let progress = UserProgress(
                id: UUID().uuidString,
                userId: "",
                lessonId: lessonId,
                completedAt: Date(),
                lastViewedAt: Date(),
                isFavorite: false,
                timeSpent: 0
            )

            try await firebaseService.saveLessonProgress(lessonId: lessonId, progress: progress)

            // Update local state
            if let index = lessons.firstIndex(where: { $0.id == lessonId }) {
                var updatedLesson = lessons[index]
                // Update completion status in local model
                lessons[index] = updatedLesson
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func toggleFavorite(lessonId: String) async {
        if let index = lessons.firstIndex(where: { $0.id == lessonId }) {
            // Toggle favorite status
            // This would typically sync to backend
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
    var userProgressDict: [String: UserProgress] {
        var dict: [String: UserProgress] = [:]
        for progress in userProgress {
            dict[progress.lessonId] = progress
        }
        return dict
    }

    func getProgressForLesson(_ lessonId: String) -> UserProgress? {
        userProgressDict[lessonId]
    }

    func isLessonCompleted(_ lessonId: String) -> Bool {
        getProgressForLesson(lessonId)?.isCompleted ?? false
    }

    func isLessonFavorite(_ lessonId: String) -> Bool {
        getProgressForLesson(lessonId)?.isFavorite ?? false
    }
}
