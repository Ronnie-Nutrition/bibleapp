import Foundation
import SwiftUI

// MARK: - Bookmarks Manager
class BookmarksManager: ObservableObject {
    static let shared = BookmarksManager()

    @Published var bookmarkedLessonIds: Set<String> = []

    private let userDefaultsKey = "bookmarkedLessons"

    private init() {
        loadBookmarks()
    }

    // MARK: - Public Methods

    func isBookmarked(_ lessonId: String) -> Bool {
        bookmarkedLessonIds.contains(lessonId)
    }

    func toggleBookmark(_ lessonId: String) {
        if bookmarkedLessonIds.contains(lessonId) {
            bookmarkedLessonIds.remove(lessonId)
        } else {
            bookmarkedLessonIds.insert(lessonId)
        }
        saveBookmarks()
    }

    func addBookmark(_ lessonId: String) {
        bookmarkedLessonIds.insert(lessonId)
        saveBookmarks()
    }

    func removeBookmark(_ lessonId: String) {
        bookmarkedLessonIds.remove(lessonId)
        saveBookmarks()
    }

    func getBookmarkedLessons(from allLessons: [Lesson]) -> [Lesson] {
        allLessons.filter { bookmarkedLessonIds.contains($0.id) }
    }

    // MARK: - Persistence

    private func loadBookmarks() {
        if let savedIds = UserDefaults.standard.array(forKey: userDefaultsKey) as? [String] {
            bookmarkedLessonIds = Set(savedIds)
        }
    }

    private func saveBookmarks() {
        UserDefaults.standard.set(Array(bookmarkedLessonIds), forKey: userDefaultsKey)
    }
}
