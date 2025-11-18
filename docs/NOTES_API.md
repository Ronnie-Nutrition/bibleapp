# Notes API Documentation

## Overview

The Notes API allows entrepreneurs to write personal reflections and notes on biblical lessons, helping them apply spiritual principles to their business challenges. Notes support tagging, searching, and organization to create a personal knowledge base.

## Base URL

All notes endpoints are available at `/api/notes`

## Key Features

- **Personal Reflections** - Write notes on any lesson
- **Rich Tagging** - Organize notes with custom tags
- **Full-Text Search** - Find insights quickly
- **Tag-Based Filtering** - Browse notes by topic
- **Statistics** - Track writing activity
- **Ownership & Privacy** - Only you can see your notes

---

## API Endpoints

### 1. Create Note

**POST** `/api/notes/create`

Create a personal note for a biblical lesson.

**Request Body:**
```json
{
  "userId": "user123",
  "lessonId": "lesson456",
  "content": "This lesson on servant leadership reminded me of how I treat my team. Instead of micromanaging, I should empower them and serve their growth. Action: Schedule 1-on-1s with each team member to understand their career goals.",
  "tags": ["leadership", "team-building", "action-item"]
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `lessonId` (string, required) - Lesson ID
- `content` (string, required) - Note content (max 10,000 characters)
- `tags` (array, optional) - Tags for organization

**Success Response (201):**
```json
{
  "success": true,
  "note": {
    "id": "note789",
    "userId": "user123",
    "lessonId": "lesson456",
    "lessonTitle": "Servant Leadership",
    "lessonCategory": "leadership",
    "content": "This lesson on servant leadership...",
    "tags": ["leadership", "team-building", "action-item"],
    "createdAt": "2025-11-18T14:30:00.000Z",
    "updatedAt": "2025-11-18T14:30:00.000Z",
    "characterCount": 245,
    "wordCount": 42
  }
}
```

**Error Responses:**

*400 - Missing Fields*
```json
{
  "error": "Missing required fields",
  "code": "MISSING_FIELDS",
  "fields": {
    "userId": null,
    "lessonId": null,
    "content": "Content is required"
  }
}
```

*404 - Lesson Not Found*
```json
{
  "error": "Lesson not found",
  "code": "CREATE_NOTE_ERROR"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/notes/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "lessonId": "lesson456",
    "content": "Applying integrity in my business means...",
    "tags": ["integrity", "business-ethics"]
  }'
```

---

### 2. Update Note

**PUT** `/api/notes/:noteId`

Update an existing note's content or tags.

**Request Body:**
```json
{
  "userId": "user123",
  "content": "Updated reflection: Servant leadership is about...",
  "tags": ["leadership", "team-building", "reflection"]
}
```

**Parameters:**
- `noteId` (path parameter, required) - Note ID
- `userId` (body, required) - User ID (for authorization)
- `content` (body, optional) - Updated content
- `tags` (body, optional) - Updated tags

**Success Response (200):**
```json
{
  "success": true,
  "note": {
    "id": "note789",
    "userId": "user123",
    "lessonId": "lesson456",
    "lessonTitle": "Servant Leadership",
    "lessonCategory": "leadership",
    "content": "Updated reflection: Servant leadership...",
    "tags": ["leadership", "team-building", "reflection"],
    "createdAt": "2025-11-18T14:30:00.000Z",
    "updatedAt": "2025-11-18T15:45:00.000Z",
    "characterCount": 189,
    "wordCount": 32
  }
}
```

**Error Responses:**

*403 - Unauthorized*
```json
{
  "error": "Unauthorized to update this note",
  "code": "UPDATE_NOTE_ERROR"
}
```

*404 - Not Found*
```json
{
  "error": "Note not found",
  "code": "UPDATE_NOTE_ERROR"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/notes/note789 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "content": "Updated insight...",
    "tags": ["leadership", "growth"]
  }'
```

---

### 3. Delete Note

**DELETE** `/api/notes/:noteId`

Delete a note permanently.

**Query Parameters:**
- `userId` (required) - User ID for authorization

**Success Response (200):**
```json
{
  "success": true,
  "message": "Note deleted successfully",
  "noteId": "note789"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/notes/note789?userId=user123"
```

---

### 4. Get Single Note

**GET** `/api/notes/:noteId`

Retrieve a specific note by ID.

**Query Parameters:**
- `userId` (required) - User ID for authorization

**Success Response (200):**
```json
{
  "success": true,
  "note": {
    "id": "note789",
    "userId": "user123",
    "lessonId": "lesson456",
    "lessonTitle": "Servant Leadership",
    "lessonCategory": "leadership",
    "content": "This lesson on servant leadership...",
    "tags": ["leadership", "team-building"],
    "createdAt": "2025-11-18T14:30:00.000Z",
    "updatedAt": "2025-11-18T14:30:00.000Z",
    "characterCount": 245,
    "wordCount": 42
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/note789?userId=user123"
```

---

### 5. Get All User Notes

**GET** `/api/notes/user/:userId`

Retrieve all notes for a user with pagination and sorting.

**Query Parameters:**
- `limit` (optional, default: 50, max: 100) - Number of notes to return
- `offset` (optional, default: 0) - Pagination offset
- `sortBy` (optional, default: 'updatedAt') - Sort field ('updatedAt' or 'createdAt')
- `sortOrder` (optional, default: 'desc') - Sort order ('asc' or 'desc')

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "notes": [
    {
      "id": "note789",
      "userId": "user123",
      "lessonId": "lesson456",
      "lessonTitle": "Servant Leadership",
      "lessonCategory": "leadership",
      "content": "This lesson on servant leadership...",
      "tags": ["leadership", "team-building"],
      "createdAt": "2025-11-18T14:30:00.000Z",
      "updatedAt": "2025-11-18T14:30:00.000Z",
      "characterCount": 245,
      "wordCount": 42
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/user/user123?limit=20&sortBy=updatedAt&sortOrder=desc"
```

---

### 6. Get Notes for a Lesson

**GET** `/api/notes/user/:userId/lesson/:lessonId`

Get all notes a user has written for a specific lesson.

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "notes": [
    {
      "id": "note789",
      "userId": "user123",
      "lessonId": "lesson456",
      "lessonTitle": "Servant Leadership",
      "content": "First reflection on this lesson...",
      "tags": ["leadership"],
      "createdAt": "2025-11-18T14:30:00.000Z",
      "updatedAt": "2025-11-18T14:30:00.000Z"
    },
    {
      "id": "note790",
      "userId": "user123",
      "lessonId": "lesson456",
      "lessonTitle": "Servant Leadership",
      "content": "Re-reading this lesson after 3 months...",
      "tags": ["leadership", "reflection"],
      "createdAt": "2025-11-20T10:15:00.000Z",
      "updatedAt": "2025-11-20T10:15:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/user/user123/lesson/lesson456"
```

---

### 7. Search Notes

**GET** `/api/notes/user/:userId/search`

Search through user's notes by content, tags, or lesson title.

**Query Parameters:**
- `q` (required) - Search term
- `limit` (optional, default: 20) - Maximum results

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "searchTerm": "integrity",
  "notes": [
    {
      "id": "note791",
      "userId": "user123",
      "lessonId": "lesson457",
      "lessonTitle": "Integrity in Business",
      "content": "Maintaining integrity even when it costs me...",
      "tags": ["integrity", "ethics"],
      "createdAt": "2025-11-17T09:20:00.000Z",
      "updatedAt": "2025-11-17T09:20:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/user/user123/search?q=integrity&limit=10"
```

---

### 8. Get Notes by Tag

**GET** `/api/notes/user/:userId/tag/:tag`

Retrieve all notes with a specific tag.

**Success Response (200):**
```json
{
  "success": true,
  "count": 8,
  "tag": "leadership",
  "notes": [
    {
      "id": "note789",
      "userId": "user123",
      "lessonId": "lesson456",
      "lessonTitle": "Servant Leadership",
      "content": "This lesson on servant leadership...",
      "tags": ["leadership", "team-building"],
      "createdAt": "2025-11-18T14:30:00.000Z",
      "updatedAt": "2025-11-18T14:30:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/user/user123/tag/leadership"
```

---

### 9. Get Note Statistics

**GET** `/api/notes/user/:userId/stats`

Get comprehensive statistics about user's note-taking activity.

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalNotes": 45,
    "totalWords": 18500,
    "totalCharacters": 125000,
    "averageWordsPerNote": 411,
    "uniqueTags": 12,
    "tags": ["leadership", "integrity", "wisdom", "stewardship", "faith"],
    "lessonsWithNotes": 32,
    "categoriesWithNotes": [
      { "category": "leadership", "count": 15 },
      { "category": "integrity", "count": 12 },
      { "category": "wisdom", "count": 10 },
      { "category": "stewardship", "count": 8 }
    ],
    "recentActivity": {
      "notesThisWeek": 5,
      "notesThisMonth": 18
    }
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/notes/user/user123/stats"
```

---

## Database Schema

### Firestore Collection

**Collection:** `lesson_notes`

**Document Structure:**
```json
{
  "userId": "user123",
  "lessonId": "lesson456",
  "lessonTitle": "Servant Leadership",
  "lessonCategory": "leadership",
  "content": "Personal reflection text...",
  "tags": ["leadership", "team-building", "action-item"],
  "createdAt": "2025-11-18T14:30:00.000Z",
  "updatedAt": "2025-11-18T15:45:00.000Z",
  "characterCount": 245,
  "wordCount": 42
}
```

**Indexes Required:**
```
- userId (ascending) + updatedAt (descending) - For user note queries
- userId (ascending) + lessonId (ascending) - For lesson-specific notes
- userId (ascending) + tags (array-contains) - For tag filtering
```

**Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lesson_notes/{noteId} {
      // Users can only read/write their own notes
      allow read, write: if request.auth != null &&
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                     request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Common Use Cases

### 1. Entrepreneur's Reflection Flow

**Scenario:** After completing a lesson, entrepreneur wants to journal their insights

```javascript
// 1. Complete lesson
POST /api/progress/complete
{
  "userId": "user123",
  "lessonId": "lesson456",
  "timeSpent": 600
}

// 2. Write reflection note
POST /api/notes/create
{
  "userId": "user123",
  "lessonId": "lesson456",
  "content": "This lesson on stewardship changed my view on profits. Instead of just maximizing returns, I should consider how I'm stewarding resources for God's kingdom. Action: Donate 10% of next quarter's profits to local ministry.",
  "tags": ["stewardship", "giving", "action-item"]
}
```

### 2. Review Past Insights

**Scenario:** Entrepreneur wants to review all notes on leadership

```bash
GET /api/notes/user/user123/tag/leadership
```

### 3. Search for Business Application

**Scenario:** Search notes for how to apply "integrity" in current business challenge

```bash
GET /api/notes/user/user123/search?q=integrity+customer+service
```

### 4. Track Writing Progress

**Scenario:** See how actively user is reflecting on lessons

```bash
GET /api/notes/user/user123/stats
```

---

## iOS Integration Examples

### SwiftUI Note Creation View

```swift
struct CreateNoteView: View {
    let lesson: Lesson
    @State private var noteContent = ""
    @State private var tags: [String] = []
    @State private var tagInput = ""
    @ObservedObject var notesViewModel: NotesViewModel

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
                    ForEach(tags, id: \.self) { tag in
                        HStack {
                            Text(tag)
                            Spacer()
                            Button(action: { tags.removeAll { $0 == tag } }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                    }

                    HStack {
                        TextField("Add tag", text: $tagInput)
                        Button("Add") {
                            if !tagInput.isEmpty {
                                tags.append(tagInput)
                                tagInput = ""
                            }
                        }
                    }
                }

                Section {
                    Button("Save Note") {
                        Task {
                            await notesViewModel.createNote(
                                lessonId: lesson.id,
                                content: noteContent,
                                tags: tags
                            )
                        }
                    }
                    .disabled(noteContent.isEmpty)
                }
            }
            .navigationTitle("Add Note")
        }
    }
}
```

### NotesViewModel

```swift
class NotesViewModel: ObservableObject {
    @Published var notes: [Note] = []
    @Published var isLoading = false

    func createNote(lessonId: String, content: String, tags: [String]) async {
        let url = URL(string: "http://localhost:3000/api/notes/create")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "userId": UserDefaults.standard.string(forKey: "userId") ?? "",
            "lessonId": lessonId,
            "content": content,
            "tags": tags
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(NoteResponse.self, from: data)

            DispatchQueue.main.async {
                self.notes.insert(response.note, at: 0)
            }
        } catch {
            print("Error creating note: \\(error)")
        }
    }

    func fetchNotesForLesson(userId: String, lessonId: String) async {
        let url = URL(string: "http://localhost:3000/api/notes/user/\\(userId)/lesson/\\(lessonId)")!

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(NotesListResponse.self, from: data)

            DispatchQueue.main.async {
                self.notes = response.notes
            }
        } catch {
            print("Error fetching notes: \\(error)")
        }
    }

    func searchNotes(userId: String, searchTerm: String) async {
        let encodedTerm = searchTerm.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let url = URL(string: "http://localhost:3000/api/notes/user/\\(userId)/search?q=\\(encodedTerm)")!

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(SearchResponse.self, from: data)

            DispatchQueue.main.async {
                self.notes = response.notes
            }
        } catch {
            print("Error searching notes: \\(error)")
        }
    }
}
```

---

## Suggested Tag System for Entrepreneurs

**Action-Oriented Tags:**
- `action-item` - Something to do
- `goal` - Business goal setting
- `strategy` - Strategic thinking
- `decision` - Important business decision

**Business Topics:**
- `leadership` - Team leadership insights
- `integrity` - Business ethics
- `stewardship` - Resource management
- `wisdom` - Wise decision-making
- `faith` - Faith in business

**Application Areas:**
- `team-building` - Team management
- `customer-service` - Serving customers
- `finances` - Financial wisdom
- `growth` - Business growth
- `challenges` - Overcoming obstacles

**Reflection Types:**
- `reflection` - General reflection
- `question` - Questions to ponder
- `prayer` - Prayer requests
- `testimony` - Success stories

---

## Best Practices

### For Entrepreneurs

1. **Write Immediately** - Capture insights while fresh
2. **Be Specific** - Connect biblical principles to specific business situations
3. **Action-Oriented** - Include concrete steps to apply the lesson
4. **Tag Consistently** - Use consistent tags for easy retrieval
5. **Review Regularly** - Search old notes before making big decisions

### For App Integration

1. **Prompt After Lessons** - Encourage note-taking immediately after completing lessons
2. **Suggest Tags** - Show popular tags when creating notes
3. **Smart Search** - Make search prominent for quick insight retrieval
4. **Highlight Recent** - Show recently written or updated notes
5. **Stats Dashboard** - Gamify note-taking with statistics

---

## Error Codes

- `MISSING_FIELDS` - Required fields not provided
- `MISSING_USER_ID` - User ID not provided
- `MISSING_PARAMS` - Path parameters missing
- `MISSING_SEARCH_TERM` - Search query not provided
- `CREATE_NOTE_ERROR` - Error creating note
- `UPDATE_NOTE_ERROR` - Error updating note (403 for unauthorized, 404 for not found)
- `DELETE_NOTE_ERROR` - Error deleting note
- `GET_NOTE_ERROR` - Error fetching note
- `GET_NOTES_ERROR` - Error fetching notes list
- `GET_LESSON_NOTES_ERROR` - Error fetching lesson notes
- `SEARCH_NOTES_ERROR` - Error searching notes
- `GET_TAG_NOTES_ERROR` - Error fetching notes by tag
- `GET_STATS_ERROR` - Error fetching statistics

---

## Version History

- **v1.0.0** (2025-11-18) - Initial release
  - Create, read, update, delete notes
  - Tag-based organization
  - Full-text search
  - Statistics tracking
  - Authorization & privacy controls
