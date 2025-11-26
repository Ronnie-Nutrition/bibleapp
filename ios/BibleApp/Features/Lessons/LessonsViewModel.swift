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

            // TODO: Implement backend endpoint for saving lesson progress
            // For now, update local state only
            if lessons.firstIndex(where: { $0.id == lessonId }) != nil {
                userProgress[lessonId] = progress
                applyFilter()
            }
        } catch {
            errorMessage = error.localizedDescription
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
