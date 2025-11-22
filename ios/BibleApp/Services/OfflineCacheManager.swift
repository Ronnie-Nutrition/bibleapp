/**
 * Offline Cache Manager
 * Manages offline content caching using CoreData
 */

import CoreData
import Foundation
import Combine

@MainActor
class OfflineCacheManager: NSObject, ObservableObject {
    static let shared = OfflineCacheManager()

    @Published var isCaching = false
    @Published var cacheSize: Int64 = 0
    @Published var lastSyncDate: Date?

    private let container: NSPersistentContainer
    private let backgroundContext: NSManagedObjectContext

    override private init() {
        // Create persistent container
        container = NSPersistentContainer(name: "BibleAppCache")

        // Load persistent stores
        container.loadPersistentStores { _, error in
            if let error = error {
                print("❌ CoreData error: \(error.localizedDescription)")
            }
        }

        container.viewContext.automaticallyMergesChangesFromParent = true
        backgroundContext = container.newBackgroundContext()
        backgroundContext.automaticallyMergesChangesFromParent = true

        super.init()

        // Load cache metadata
        Task {
            await updateCacheSize()
            await loadLastSyncDate()
        }
    }

    // MARK: - Lesson Caching

    /// Cache lessons for offline access
    func cacheLessons(_ lessons: [Lesson]) async {
        let context = backgroundContext

        await context.perform {
            do {
                // Delete existing cached lessons
                let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedLesson")
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                try context.execute(deleteRequest)

                // Add new lessons
                for lesson in lessons {
                    let cached = NSEntityDescription.insertNewObject(forEntityName: "CachedLesson", into: context)
                    cached.setValue(lesson.id, forKey: "id")
                    cached.setValue(lesson.title, forKey: "title")
                    cached.setValue(lesson.subtitle, forKey: "subtitle")
                    cached.setValue(lesson.category.description, forKey: "category")
                    cached.setValue(lesson.difficulty.displayName, forKey: "difficulty")
                    cached.setValue(lesson.duration ?? 0, forKey: "duration")
                    cached.setValue(lesson.content, forKey: "content")
                    cached.setValue(lesson.keyTakeaway, forKey: "keyTakeaway")

                    // Encode bible verses to JSON
                    if let encoded = try? JSONEncoder().encode(lesson.bibleVerses) {
                        cached.setValue(encoded, forKey: "bibleVersesData")
                    }

                    // Encode practical steps
                    if let encoded = try? JSONEncoder().encode(lesson.practicalSteps) {
                        cached.setValue(encoded, forKey: "practicalStepsData")
                    }

                    cached.setValue(Date(), forKey: "cachedAt")
                }

                try context.save()

                await MainActor.run {
                    self.isCaching = false
                    Task { await self.updateCacheSize() }
                }

                print("✓ Cached \(lessons.count) lessons")
            } catch {
                print("❌ Error caching lessons: \(error.localizedDescription)")
            }
        }
    }

    /// Get cached lessons
    func getCachedLessons() async -> [Lesson] {
        let context = container.viewContext

        return await context.perform {
            let fetchRequest: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedLesson")
            fetchRequest.returnsObjectsAsFaults = false

            do {
                let cached = try context.fetch(fetchRequest)
                return cached.compactMap { self.convertToLesson($0) }
            } catch {
                print("❌ Error fetching cached lessons: \(error.localizedDescription)")
                return []
            }
        }
    }

    /// Get single cached lesson by ID
    func getCachedLesson(_ id: String) async -> Lesson? {
        let context = container.viewContext

        return await context.perform {
            let fetchRequest: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedLesson")
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)
            fetchRequest.returnsObjectsAsFaults = false

            do {
                let results = try context.fetch(fetchRequest)
                return results.first.flatMap { self.convertToLesson($0) }
            } catch {
                print("❌ Error fetching cached lesson: \(error.localizedDescription)")
                return nil
            }
        }
    }

    // MARK: - Progress Caching

    /// Cache user progress for offline access
    func cacheProgress(_ progress: [LessonProgress]) async {
        let context = backgroundContext

        await context.perform {
            do {
                // Delete existing cached progress
                let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedProgress")
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                try context.execute(deleteRequest)

                // Add new progress
                for item in progress {
                    let cached = NSEntityDescription.insertNewObject(forEntityName: "CachedProgress", into: context)
                    cached.setValue(item.id, forKey: "id")
                    cached.setValue(item.lessonId, forKey: "lessonId")
                    cached.setValue(item.completionPercentage, forKey: "completionPercentage")
                    cached.setValue(item.timeSpent, forKey: "timeSpent")
                    cached.setValue(item.completedAt, forKey: "completedAt")
                    cached.setValue(item.isFavorite, forKey: "isFavorite")
                    cached.setValue(Date(), forKey: "cachedAt")
                }

                try context.save()
                print("✓ Cached \(progress.count) progress records")
            } catch {
                print("❌ Error caching progress: \(error.localizedDescription)")
            }
        }
    }

    /// Get cached progress
    func getCachedProgress() async -> [LessonProgress] {
        let context = container.viewContext

        return await context.perform {
            let fetchRequest: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedProgress")
            fetchRequest.returnsObjectsAsFaults = false

            do {
                let cached = try context.fetch(fetchRequest)
                return cached.compactMap { obj in
                    guard let id = obj.value(forKey: "id") as? String,
                          let lessonId = obj.value(forKey: "lessonId") as? String else {
                        return nil
                    }

                    return LessonProgress(
                        id: id,
                        lessonId: lessonId,
                        completionPercentage: (obj.value(forKey: "completionPercentage") as? Int) ?? 0,
                        timeSpent: (obj.value(forKey: "timeSpent") as? Int) ?? 0,
                        completedAt: obj.value(forKey: "completedAt") as? Date,
                        isFavorite: (obj.value(forKey: "isFavorite") as? Bool) ?? false
                    )
                }
            } catch {
                print("❌ Error fetching cached progress: \(error.localizedDescription)")
                return []
            }
        }
    }

    // MARK: - Cache Management

    /// Clear all cached data
    func clearCache() async {
        let context = backgroundContext

        await context.perform {
            do {
                // Clear cached lessons
                let lessonFetch: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedLesson")
                let lessonDelete = NSBatchDeleteRequest(fetchRequest: lessonFetch)
                try context.execute(lessonDelete)

                // Clear cached progress
                let progressFetch: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedProgress")
                let progressDelete = NSBatchDeleteRequest(fetchRequest: progressFetch)
                try context.execute(progressDelete)

                try context.save()

                await MainActor.run {
                    self.cacheSize = 0
                    self.lastSyncDate = nil
                }

                print("✓ Cache cleared")
            } catch {
                print("❌ Error clearing cache: \(error.localizedDescription)")
            }
        }
    }

    /// Check if specific lesson is cached
    func isCached(_ lessonId: String) async -> Bool {
        let context = container.viewContext

        return await context.perform {
            let fetchRequest: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedLesson")
            fetchRequest.predicate = NSPredicate(format: "id == %@", lessonId)
            fetchRequest.resultType = .countResultType

            do {
                let count = try context.count(for: fetchRequest)
                return count > 0
            } catch {
                return false
            }
        }
    }

    /// Get cache size in bytes
    private func updateCacheSize() async {
        let context = container.viewContext

        await context.perform {
            do {
                // Calculate lessons cache size
                let lessonFetch: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedLesson")
                let lessons = try context.fetch(lessonFetch)
                let lessonSize = lessons.reduce(0) { size, lesson in
                    let data = (lesson.value(forKey: "content") as? String)?.utf16.count ?? 0
                    return size + Int64(data)
                }

                // Calculate progress cache size
                let progressFetch: NSFetchRequest<NSManagedObject> = NSFetchRequest(entityName: "CachedProgress")
                let progress = try context.fetch(progressFetch)
                let progressSize = Int64(progress.count * 100)

                await MainActor.run {
                    self.cacheSize = lessonSize + progressSize
                }
            } catch {
                print("❌ Error calculating cache size: \(error.localizedDescription)")
            }
        }
    }

    /// Update last sync date
    func updateLastSyncDate() {
        Task {
            await MainActor.run {
                self.lastSyncDate = Date()
            }
        }
    }

    /// Load last sync date from UserDefaults
    private func loadLastSyncDate() async {
        let date = UserDefaults.standard.object(forKey: "lastSyncDate") as? Date
        await MainActor.run {
            self.lastSyncDate = date
        }
    }

    // MARK: - Helper Methods

    private func convertToLesson(_ object: NSManagedObject) -> Lesson? {
        guard let id = object.value(forKey: "id") as? String,
              let title = object.value(forKey: "title") as? String else {
            return nil
        }

        var bibleVerses: [BibleVerse] = []
        if let versesData = object.value(forKey: "bibleVersesData") as? Data {
            bibleVerses = (try? JSONDecoder().decode([BibleVerse].self, from: versesData)) ?? []
        }

        var steps: [String] = []
        if let stepsData = object.value(forKey: "practicalStepsData") as? Data {
            steps = (try? JSONDecoder().decode([String].self, from: stepsData)) ?? []
        }

        let category = LessonCategory(rawValue: (object.value(forKey: "category") as? String) ?? "") ?? .leadership
        let difficultyStr = object.value(forKey: "difficulty") as? String ?? "Beginner"
        let difficulty: LessonDifficulty = difficultyStr == "Beginner" ? .beginner :
                                           difficultyStr == "Intermediate" ? .intermediate : .advanced

        return Lesson(
            id: id,
            title: title,
            subtitle: (object.value(forKey: "subtitle") as? String) ?? "",
            category: category,
            difficulty: difficulty,
            duration: object.value(forKey: "duration") as? Int,
            content: (object.value(forKey: "content") as? String) ?? "",
            keyTakeaway: (object.value(forKey: "keyTakeaway") as? String) ?? "",
            bibleVerses: bibleVerses,
            practicalSteps: steps
        )
    }
}

// MARK: - Models
struct LessonProgress {
    let id: String
    let lessonId: String
    let completionPercentage: Int
    let timeSpent: Int
    let completedAt: Date?
    let isFavorite: Bool
}
