# iOS App Integration Guide

## Overview

This guide explains how to integrate your iOS app with the backend API, including the new progress tracking and notes features.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Testing Locally](#testing-locally)
3. [Progress Tracking Integration](#progress-tracking-integration)
4. [Notes Integration](#notes-integration)
5. [Example Implementations](#example-implementations)
6. [App Store Preparation](#app-store-preparation)

---

## Setup & Configuration

### Backend API Base URL

The `APIClient` is already configured to use:
- **Simulator**: `http://localhost:3000`
- **Physical Device**: Set `API_URL` environment variable or update hardcoded URL

**Location**: `ios/BibleApp/Services/APIClient.swift` (lines 69-73)

```swift
#if targetEnvironment(simulator)
self.baseURL = "http://localhost:3000"
#else
self.baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "http://localhost:3000"
#endif
```

### For Production

When deploying to cloud, update this to your production URL:

```swift
#if targetEnvironment(simulator)
self.baseURL = "http://localhost:3000" // For local testing
#else
self.baseURL = "https://api.yourdomain.com" // Your production API
#endif
```

---

## Testing Locally

### 1. Start Backend Server

```bash
cd backend/nodejs
npm install
npm start
```

Server runs on `http://localhost:3000`

### 2. Test Backend Health

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T...",
  "services": {...}
}
```

### 3. Run iOS App in Simulator

1. Open Xcode
2. Select iPhone Simulator
3. Run the app (⌘R)
4. App will connect to `localhost:3000` automatically

---

## Progress Tracking Integration

### Overview

Progress tracking allows users to:
- ✅ Mark lessons as complete
- ✅ Track daily learning streaks
- ✅ View completion statistics
- ✅ See leaderboard rankings

### Data Models

**Created in**: `ios/BibleApp/Models/Progress.swift`

```swift
struct ProgressStats: Codable {
    let totalCompleted: Int
    let currentStreak: Int
    let longestStreak: Int
    let completionRate: Int
    let thisWeek: Int
    let thisMonth: Int
    // ... more fields
}
```

### API Methods Added

All methods in `APIClient.swift`:

```swift
// Mark lesson complete
func completeLesson(userId: String, lessonId: String, timeSpent: Int?) async throws

// Get progress stats
func getUserProgressStats(userId: String) async throws -> ProgressStats

// Check if lesson is completed
func checkLessonCompletion(userId: String, lessonId: String) async throws

// Get leaderboard
func getLeaderboard(limit: Int) async throws -> [LeaderboardEntry]
```

### Example: Complete a Lesson

```swift
// In your LessonDetailView or ViewModel
@State private var lessonStartTime = Date()

func markLessonComplete() {
    Task {
        let timeSpent = Int(Date().timeIntervalSince(lessonStartTime))

        do {
            let response = try await APIClient.shared.completeLesson(
                userId: currentUserId,
                lessonId: lesson.id,
                timeSpent: timeSpent
            )

            // Update UI with new stats
            self.currentStreak = response.stats.currentStreak
            self.completionRate = response.stats.completionRate

            // Show success message
            showCompletionBadge = true
        } catch {
            print("Error completing lesson: \(error)")
        }
    }
}
```

### Example: Show Progress Dashboard

```swift
struct ProgressDashboardView: View {
    @State private var stats: ProgressStats?
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if let stats = stats {
                // Streak Card
                VStack {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.orange)

                    Text("\(stats.currentStreak)")
                        .font(.largeTitle.bold())

                    Text("Day Streak")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if stats.longestStreak > stats.currentStreak {
                        Text("Best: \(stats.longestStreak)")
                            .font(.caption2)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)

                // Completion Stats
                HStack {
                    StatCard(title: "Completed", value: "\(stats.totalCompleted)")
                    StatCard(title: "This Week", value: "\(stats.thisWeek)")
                    StatCard(title: "This Month", value: "\(stats.thisMonth)")
                }

                // Completion Rate
                ProgressView(value: Double(stats.completionRate) / 100.0) {
                    Text("Overall Progress")
                }
                .padding()
            }
        }
        .task {
            await loadStats()
        }
    }

    func loadStats() async {
        do {
            stats = try await APIClient.shared.getUserProgressStats(userId: currentUserId)
            isLoading = false
        } catch {
            print("Error loading stats: \(error)")
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String

    var body: some View {
        VStack {
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
    }
}
```

### Example: Show Leaderboard

```swift
struct LeaderboardView: View {
    @State private var leaderboard: [LeaderboardEntry] = []

    var body: some View {
        List(leaderboard) { entry in
            HStack {
                // Rank badge
                if let rank = leaderboard.firstIndex(where: { $0.id == entry.id }) {
                    Text("#\(rank + 1)")
                        .font(.headline)
                        .frame(width: 40)
                }

                VStack(alignment: .leading) {
                    Text("User \(entry.userId.prefix(8))...")
                        .font(.headline)

                    HStack {
                        Image(systemName: "flame.fill")
                        Text("\(entry.currentStreak) day streak")

                        Spacer()

                        Text("\(entry.totalCompleted) lessons")
                            .foregroundColor(.secondary)
                    }
                    .font(.caption)
                }
            }
        }
        .task {
            await loadLeaderboard()
        }
    }

    func loadLeaderboard() async {
        do {
            leaderboard = try await APIClient.shared.getLeaderboard(limit: 50)
        } catch {
            print("Error loading leaderboard: \(error)")
        }
    }
}
```

---

## Notes Integration

### Overview

Notes allow entrepreneurs to:
- ✅ Write personal reflections on lessons
- ✅ Tag notes for organization
- ✅ Search across all notes
- ✅ Track writing statistics

### Data Models

**Created in**: `ios/BibleApp/Models/Note.swift`

```swift
struct LessonNote: Codable, Identifiable {
    let id: String
    let content: String
    let tags: [String]
    let lessonTitle: String
    let createdAt: String
    let wordCount: Int
    // ... more fields
}
```

### API Methods Added

All methods in `APIClient.swift`:

```swift
// Create note
func createNote(userId: String, lessonId: String, content: String, tags: [String]) async throws

// Get notes for lesson
func getNotesForLesson(userId: String, lessonId: String) async throws -> [LessonNote]

// Search notes
func searchNotes(userId: String, searchTerm: String) async throws -> [LessonNote]

// Get note stats
func getUserNoteStats(userId: String) async throws -> NoteStats
```

### Example: Create Note After Lesson

```swift
struct CreateNoteView: View {
    let lesson: Lesson
    @State private var noteContent = ""
    @State private var selectedTags: Set<String> = []
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Lesson")) {
                    Text(lesson.title)
                        .font(.headline)
                }

                Section(header: Text("Your Reflection")) {
                    TextEditor(text: $noteContent)
                        .frame(minHeight: 200)
                        .overlay(
                            Text(noteContent.isEmpty ? "What insights did you gain? How will you apply this to your business?" : "")
                                .foregroundColor(.gray)
                                .padding(.leading, 5)
                                .allowsHitTesting(false),
                            alignment: .topLeading
                        )
                }

                Section(header: Text("Tags")) {
                    ForEach(SuggestedNoteTags.categories, id: \.title) { category in
                        TagSection(
                            title: category.title,
                            tags: category.tags,
                            selectedTags: $selectedTags
                        )
                    }
                }

                Section {
                    Button("Save Note") {
                        Task {
                            await saveNote()
                        }
                    }
                    .disabled(noteContent.isEmpty)
                }
            }
            .navigationTitle("Add Note")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    func saveNote() async {
        do {
            let note = try await APIClient.shared.createNote(
                userId: currentUserId,
                lessonId: lesson.id,
                content: noteContent,
                tags: Array(selectedTags)
            )

            print("Note saved: \(note.id)")
            dismiss()
        } catch {
            print("Error saving note: \(error)")
        }
    }
}

struct TagSection: View {
    let title: String
    let tags: [String]
    @Binding var selectedTags: Set<String>

    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.caption.bold())
                .foregroundColor(.secondary)

            FlowLayout(spacing: 8) {
                ForEach(tags, id: \.self) { tag in
                    TagChip(
                        tag: tag,
                        isSelected: selectedTags.contains(tag)
                    ) {
                        if selectedTags.contains(tag) {
                            selectedTags.remove(tag)
                        } else {
                            selectedTags.insert(tag)
                        }
                    }
                }
            }
        }
    }
}

struct TagChip: View {
    let tag: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(tag)
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}
```

### Example: Show Notes List

```swift
struct NotesListView: View {
    @State private var notes: [LessonNote] = []
    @State private var searchText = ""

    var filteredNotes: [LessonNote] {
        if searchText.isEmpty {
            return notes
        } else {
            return notes.filter { $0.content.localizedCaseInsensitiveContains(searchText) }
        }
    }

    var body: some View {
        List(filteredNotes) { note in
            NavigationLink {
                NoteDetailView(note: note)
            } label: {
                VStack(alignment: .leading, spacing: 4) {
                    Text(note.lessonTitle)
                        .font(.headline)

                    Text(note.preview)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)

                    HStack {
                        ForEach(note.tags.prefix(3), id: \.self) { tag in
                            Text(tag)
                                .font(.caption2)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .cornerRadius(4)
                        }

                        Spacer()

                        Text(note.formattedUpdatedDate)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .searchable(text: $searchText)
        .task {
            await loadNotes()
        }
    }

    func loadNotes() async {
        do {
            notes = try await APIClient.shared.getUserNotes(userId: currentUserId)
        } catch {
            print("Error loading notes: \(error)")
        }
    }
}
```

### Example: Search Notes

```swift
struct NotesSearchView: View {
    @State private var searchText = ""
    @State private var searchResults: [LessonNote] = []
    @State private var isSearching = false

    var body: some View {
        VStack {
            TextField("Search notes...", text: $searchText)
                .textFieldStyle(.roundedBorder)
                .padding()
                .onChange(of: searchText) { _, newValue in
                    Task {
                        await performSearch(newValue)
                    }
                }

            if isSearching {
                ProgressView()
            } else {
                List(searchResults) { note in
                    NoteRowView(note: note)
                }
            }
        }
    }

    func performSearch(_ term: String) async {
        guard !term.isEmpty else {
            searchResults = []
            return
        }

        isSearching = true

        do {
            searchResults = try await APIClient.shared.searchNotes(
                userId: currentUserId,
                searchTerm: term,
                limit: 50
            )
        } catch {
            print("Search error: \(error)")
        }

        isSearching = false
    }
}
```

---

## Example Implementations

### Complete Lesson Flow

```swift
// In LessonDetailView.swift

@State private var lessonStartTime = Date()
@State private var showCompletionSheet = false
@State private var showNoteSheet = false

var body: some View {
    ScrollView {
        // Lesson content...

        Button("Mark as Complete") {
            showCompletionSheet = true
        }
    }
    .sheet(isPresented: $showCompletionSheet) {
        CompletionCelebrationView(
            onComplete: markComplete,
            onAddNote: {
                showCompletionSheet = false
                showNoteSheet = true
            }
        )
    }
    .sheet(isPresented: $showNoteSheet) {
        CreateNoteView(lesson: lesson)
    }
}

func markComplete() async {
    let timeSpent = Int(Date().timeIntervalSince(lessonStartTime))

    do {
        let response = try await APIClient.shared.completeLesson(
            userId: currentUserId,
            lessonId: lesson.id,
            timeSpent: timeSpent
        )

        // Show celebration with new streak
        print("New streak: \(response.stats.currentStreak)")

        showCompletionSheet = false
    } catch {
        print("Error: \(error)")
    }
}
```

### Completion Celebration View

```swift
struct CompletionCelebrationView: View {
    let onComplete: () async -> Void
    let onAddNote: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)

            Text("Lesson Complete!")
                .font(.title.bold())

            Text("Great work! Would you like to add a note about what you learned?")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding()

            HStack(spacing: 16) {
                Button("Skip") {
                    Task {
                        await onComplete()
                    }
                }
                .buttonStyle(.bordered)

                Button("Add Note") {
                    onAddNote()
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}
```

---

## App Store Preparation

### 1. Update Info.plist

Add backend URL configuration:

```xml
<key>API_BASE_URL</key>
<string>https://api.yourdomain.com</string>
```

### 2. Configure for Production

Update `APIClient.swift`:

```swift
#if DEBUG
self.baseURL = "http://localhost:3000"
#else
self.baseURL = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String ?? "https://api.yourdomain.com"
#endif
```

### 3. Test Checklist

Before submitting to App Store:

- [ ] Test authentication flow
- [ ] Test lesson browsing
- [ ] Test lesson completion (progress tracking)
- [ ] Test notes creation and editing
- [ ] Test search functionality
- [ ] Test offline behavior
- [ ] Test push notifications
- [ ] Verify all API calls work with production backend
- [ ] Test on real device (not just simulator)
- [ ] Verify HTTPS connection to production API

### 4. Backend URL

When deploying backend, update iOS app to point to:
```
https://api.yourdomain.com
```

Instead of:
```
http://localhost:3000
```

---

## Quick Testing Guide

### Test Progress Tracking

1. Start backend: `npm start`
2. Run iOS app in simulator
3. Open a lesson
4. Complete the lesson
5. Check progress view - should show:
   - Streak count increased
   - Lesson in completed list
   - Stats updated

### Test Notes

1. Complete a lesson
2. Tap "Add Note"
3. Write reflection
4. Add tags (leadership, action-item, etc.)
5. Save note
6. Go to Notes tab
7. Should see your note
8. Search for keywords - should find note

### Test Leaderboard

1. Complete multiple lessons
2. Open leaderboard view
3. Should see your ranking
4. Should show streak and completion count

---

## Troubleshooting

### "Cannot connect to backend"

**Problem**: iOS app can't reach `localhost:3000`

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/health`
2. Make sure using simulator (not device)
3. Check iOS logs for error details

### "Invalid response from server"

**Problem**: Response doesn't match expected format

**Solutions**:
1. Check backend logs
2. Verify model definitions match API response
3. Test API endpoint directly with curl

### "Unauthorized" errors

**Problem**: Auth token invalid or expired

**Solutions**:
1. Re-login in the app
2. Check token is being sent in headers
3. Verify backend auth is working

---

## Next Steps

1. **Test locally** with simulator + localhost backend
2. **Deploy backend** to cloud (GCP recommended)
3. **Update iOS app** to use production URL
4. **Test on real device** with production backend
5. **Submit to App Store**

---

## Resources

- **Backend API Docs**:
  - [Health Check API](./HEALTH_CHECK_API.md)
  - [Progress Tracking API](./PROGRESS_TRACKING_API.md)
  - [Notes API](./NOTES_API.md)
  - [Deployment Guide](./DEPLOYMENT.md)

- **iOS Models**:
  - `ios/BibleApp/Models/Progress.swift` - Progress tracking models
  - `ios/BibleApp/Models/Note.swift` - Notes models
  - `ios/BibleApp/Services/APIClient.swift` - API client with all methods

---

## Support

If you encounter issues:
1. Check backend logs: `npm start` output
2. Check iOS console in Xcode
3. Test API directly: `curl http://localhost:3000/api/...`
4. Verify models match API response structure

