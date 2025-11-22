# Offline Content Caching Guide

## Overview

The Bible App implements offline content caching using Apple's CoreData framework. This allows users to access lessons and their progress data even when they don't have an internet connection.

## Architecture

### OfflineCacheManager

The `OfflineCacheManager` is responsible for:
- Storing lessons for offline access
- Caching user progress and favorites
- Managing cache lifecycle (sync, clear, update)
- Tracking cache size and last sync date

## Setup

### 1. Create Core Data Model

Create a new Core Data model file: `BibleAppCache.xcdatamodeld`

**In Xcode:**
1. File → New → File
2. Select "Data Model"
3. Name it "BibleAppCache"

### 2. Define Entities

**CachedLesson Entity:**
```
Attributes:
- id (String)
- title (String)
- subtitle (String)
- category (String)
- difficulty (String)
- duration (Integer 32)
- content (String)
- keyTakeaway (String)
- bibleVersesData (Binary)
- practicalStepsData (Binary)
- cachedAt (Date)
```

**CachedProgress Entity:**
```
Attributes:
- id (String)
- lessonId (String)
- completionPercentage (Integer 32)
- timeSpent (Integer 32)
- completedAt (Date)
- isFavorite (Boolean)
- cachedAt (Date)
```

### 3. Add to App Delegate

Update AppDelegate to initialize CoreData:

```swift
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Initialize cache manager
        _ = OfflineCacheManager.shared

        return true
    }
}
```

## Usage

### Cache Lessons

```swift
let cacheManager = OfflineCacheManager.shared

// After fetching lessons from API
await cacheManager.cacheLessons(lessons)
```

### Retrieve Cached Lessons

```swift
// Get all cached lessons
let cachedLessons = await cacheManager.getCachedLessons()

// Get single cached lesson
if let lesson = await cacheManager.getCachedLesson("lesson-001") {
    print("Found cached lesson: \(lesson.title)")
}
```

### Cache Progress

```swift
// After fetching user progress
let progress = [...] // Progress data from API
await cacheManager.cacheProgress(progress)
```

### Retrieve Cached Progress

```swift
let progress = await cacheManager.getCachedProgress()
```

### Check if Content is Cached

```swift
let isCached = await cacheManager.isCached("lesson-001")
if isCached {
    print("Lesson is available offline")
}
```

## Integration with API Client

### Fallback to Cache on Network Failure

Update APIClient to use cache when network fails:

```swift
func getLessons() async throws -> [Lesson] {
    do {
        // Try to fetch from API
        let lessons = try await fetchFromAPI("/api/lessons")

        // Cache the result
        await OfflineCacheManager.shared.cacheLessons(lessons)

        return lessons
    } catch {
        // Fall back to cache if network fails
        let cached = await OfflineCacheManager.shared.getCachedLessons()
        if !cached.isEmpty {
            return cached
        }
        throw error
    }
}
```

### Show Offline Indicator

```swift
@StateObject private var cacheManager = OfflineCacheManager.shared

var body: some View {
    VStack {
        if !isNetworkAvailable && cacheManager.cacheSize > 0 {
            HStack {
                Image(systemName: "wifi.slash")
                Text("Showing cached content")
            }
            .padding(8)
            .background(Color.yellow.opacity(0.1))
            .foregroundColor(.orange)
        }

        // Rest of your content
    }
}
```

## Cache Management

### Clear Cache

```swift
let cacheManager = OfflineCacheManager.shared
await cacheManager.clearCache()
```

### Get Cache Size

```swift
let sizeInBytes = cacheManager.cacheSize
let sizeInMB = Double(sizeInBytes) / (1024 * 1024)
print("Cache size: \(sizeInMB) MB")
```

### Last Sync Date

```swift
if let lastSync = cacheManager.lastSyncDate {
    print("Last synced: \(lastSync)")
}
```

## Best Practices

### 1. **Sync After Login**
Always cache lessons and progress immediately after authentication:

```swift
func loginUser(_ email: String, _ password: String) async throws {
    let result = try await authService.login(email, password)

    // Cache user data
    let lessons = try await apiClient.getLessons()
    await cacheManager.cacheLessons(lessons)

    return result
}
```

### 2. **Refresh Cache Periodically**
Update cache when user opens the app:

```swift
struct ContentView: View {
    @StateObject private var cacheManager = OfflineCacheManager.shared

    var body: some View {
        VStack {
            // Content
        }
        .onAppear {
            Task {
                // Refresh cache if available
                await refreshCache()
            }
        }
    }

    private func refreshCache() async {
        let lessons = try? await apiClient.getLessons()
        if let lessons = lessons {
            await cacheManager.cacheLessons(lessons)
        }
    }
}
```

### 3. **Handle Sync Conflicts**
When user makes changes offline, sync when back online:

```swift
func saveProgressOffline(_ progress: LessonProgress) async {
    // Save locally
    await cacheManager.cacheProgress([progress])

    // Try to sync
    Task {
        do {
            try await apiClient.saveLessonProgress(progress)
            cacheManager.updateLastSyncDate()
        } catch {
            // Retry later
            scheduleSync()
        }
    }
}
```

### 4. **Monitor Cache Size**
Keep an eye on cache size to prevent excessive storage use:

```swift
struct CacheStatsView: View {
    @StateObject private var cacheManager = OfflineCacheManager.shared

    var body: some View {
        VStack {
            HStack {
                Text("Cache Size")
                Spacer()
                Text(formatBytes(cacheManager.cacheSize))
            }

            if cacheManager.cacheSize > 100_000_000 { // 100MB
                Button("Clear Cache") {
                    Task {
                        await cacheManager.clearCache()
                    }
                }
                .foregroundColor(.red)
            }
        }
    }

    func formatBytes(_ bytes: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB]
        return formatter.string(fromByteCount: bytes)
    }
}
```

## Network Reachability

Combine offline caching with network reachability monitoring:

```swift
import Network

@MainActor
class NetworkMonitor: NSObject, ObservableObject {
    @Published var isReachable = true

    private let monitor = NWPathMonitor()

    override init() {
        super.init()
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isReachable = path.status == .satisfied
            }
        }

        let queue = DispatchQueue(label: "NetworkMonitor")
        monitor.start(queue: queue)
    }
}
```

Use in views:

```swift
struct LessonsView: View {
    @StateObject private var networkMonitor = NetworkMonitor()
    @StateObject private var cacheManager = OfflineCacheManager.shared

    var body: some View {
        VStack {
            if !networkMonitor.isReachable {
                OfflineBanner()
            }

            LessonsList()
        }
    }
}
```

## Testing

### Test Cache Operations

```swift
@MainActor
class CacheTests: XCTestCase {
    func testCacheLessons() async throws {
        let manager = OfflineCacheManager.shared
        let lessons = [
            Lesson(id: "1", title: "Test", ...)
        ]

        await manager.cacheLessons(lessons)
        let cached = await manager.getCachedLessons()

        XCTAssertEqual(cached.count, 1)
    }

    func testClearCache() async throws {
        let manager = OfflineCacheManager.shared

        await manager.clearCache()
        let cached = await manager.getCachedLessons()

        XCTAssertTrue(cached.isEmpty)
    }
}
```

## Troubleshooting

### Cache Not Persisting

**Problem:** Data doesn't persist after app restart

**Solution:**
- Ensure Core Data model is properly configured
- Check that `managedObjectContext.save()` is called
- Verify `NSPersistentStoreDescription` is properly set

### Stale Cache Data

**Problem:** Users see outdated information

**Solution:**
- Implement periodic cache refresh
- Add cache expiration logic:
```swift
let cacheAge = Date().timeIntervalSince(lastSyncDate ?? Date.distantPast)
let shouldRefresh = cacheAge > 3600 // 1 hour
```

### Memory Issues

**Problem:** App crashes with large cache

**Solution:**
- Limit cache size:
```swift
if cacheSize > 500_000_000 { // 500MB limit
    await clearCache()
}
```
- Use `returnsObjectsAsFaults = false` carefully
- Implement pagination for large datasets

## Performance Tips

1. **Use Background Context** for writes:
```swift
let bgContext = container.newBackgroundContext()
bgContext.perform {
    // Save large datasets
}
```

2. **Batch Operations**:
```swift
let batch = NSBatchInsertRequest(...)
try context.execute(batch)
```

3. **Fetch Optimization**:
```swift
let request: NSFetchRequest<CachedLesson> = NSFetchRequest(entityName: "CachedLesson")
request.returnsObjectsAsFaults = true
request.fetchBatchSize = 20
```

## See Also

- [Apple CoreData Documentation](https://developer.apple.com/documentation/coredata)
- [Network Framework Guide](https://developer.apple.com/documentation/network)
- [Data Storage Best Practices](https://developer.apple.com/icloud/design/)
