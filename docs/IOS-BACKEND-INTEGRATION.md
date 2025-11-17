# iOS Backend Integration Guide

Complete guide to integrate the iOS app with the Node.js backend API.

## Overview

The iOS app currently has:
- ✅ UI components (LoginView, LessonsView, ProfileView)
- ✅ Firebase SDK initialized
- ❌ Backend API calls not implemented

This guide shows how to connect the iOS app to make real API calls to the Node.js backend.

## Architecture

### Current Flow
```
iOS App → Firebase SDK
```

### New Flow (Local Development)
```
iOS App → Node.js Backend (http://localhost:3000) → Firebase
```

### New Flow (Production)
```
iOS App → Production API (https://api.example.com) → Firebase
```

## Step 1: Create API Client Service

Create a new file: `ios/BibleApp/Services/APIClient.swift`

This service will handle all backend communication.

```swift
import Foundation

// MARK: - API Error
enum APIError: Error {
    case invalidURL
    case invalidRequest
    case serverError(String)
    case networkError(Error)
    case decodingError(Error)
    case unauthorized
    case notFound
    case unknown
}

// MARK: - API Client
class APIClient {
    static let shared = APIClient()

    private let session = URLSession.shared

    // Change this based on environment
    #if DEBUG
    let baseURL = "http://localhost:3000/api"
    #else
    let baseURL = "https://api.biblical-lessons.com/api"
    #endif

    private init() {}

    // MARK: - Generic Request Method

    func request<T: Decodable>(
        _ endpoint: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        token: String? = nil
    ) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication token if provided
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add request body if provided
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw APIError.invalidRequest
            }
        }

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.unknown
            }

            switch httpResponse.statusCode {
            case 200...299:
                do {
                    let decoder = JSONDecoder()
                    decoder.dateDecodingStrategy = .iso8601
                    return try decoder.decode(T.self, from: data)
                } catch {
                    throw APIError.decodingError(error)
                }

            case 401:
                throw APIError.unauthorized

            case 404:
                throw APIError.notFound

            case 500...599:
                let errorMessage = String(data: data, encoding: .utf8) ?? "Server error"
                throw APIError.serverError(errorMessage)

            default:
                throw APIError.unknown
            }
        } catch is APIError {
            throw error as! APIError
        } catch {
            throw APIError.networkError(error)
        }
    }

    // MARK: - Helper Methods

    func requestWithoutResponse(_ endpoint: String, method: HTTPMethod = .get, body: Encodable? = nil, token: String? = nil) async throws {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (_, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError("HTTP \(httpResponse.statusCode)")
        }
    }
}

// MARK: - HTTP Methods
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

// MARK: - Request/Response Models
struct AuthRequest: Encodable {
    let email: String
    let password: String
    let displayName: String?

    enum CodingKeys: String, CodingKey {
        case email, password
        case displayName = "display_name"
    }
}

struct AuthResponse: Decodable {
    let userId: String
    let email: String
    let displayName: String
    let customToken: String?
    let user: User?

    enum CodingKeys: String, CodingKey {
        case userId = "userId"
        case email, displayName, customToken, user
    }
}

struct PasswordResetRequest: Encodable {
    let currentPassword: String
    let newPassword: String
    let newPasswordConfirm: String

    enum CodingKeys: String, CodingKey {
        case currentPassword = "current_password"
        case newPassword = "new_password"
        case newPasswordConfirm = "new_password_confirm"
    }
}
```

## Step 2: Update Authentication Manager

Update: `ios/BibleApp/Services/AuthenticationManager.swift`

Modify to use the API client instead of Firebase directly for backend calls:

```swift
func signUp(email: String, password: String, displayName: String) async {
    isLoading = true
    errorMessage = nil

    do {
        // Call backend API
        let request = AuthRequest(email: email, password: password, displayName: displayName)
        let response: AuthResponse = try await APIClient.shared.request("/auth/register", method: .post, body: request)

        // Create Firebase user with the same credentials
        let authResult = try await Auth.auth().createUser(withEmail: email, password: password)

        // Create local user object
        let user = User(
            id: response.userId,
            email: email,
            displayName: displayName,
            profileImageURL: nil,
            createdAt: Date(),
            updatedAt: Date(),
            preferences: UserPreferences(),
            stats: UserStats()
        )

        self.currentUser = user
        self.isAuthenticated = true

        print("✓ User registered successfully")
    } catch {
        errorMessage = parseError(error)
        isLoading = false
    }
}

func signIn(email: String, password: String) async {
    isLoading = true
    errorMessage = nil

    do {
        // Call backend API
        let request = AuthRequest(email: email, password: password, displayName: nil)
        let response: AuthResponse = try await APIClient.shared.request("/auth/login", method: .post, body: request)

        // Also sign in with Firebase
        try await Auth.auth().signIn(withEmail: email, password: password)

        // Update current user
        if let userData = response.user {
            self.currentUser = userData
        }
        self.isAuthenticated = true

        print("✓ User signed in successfully")
    } catch {
        errorMessage = parseError(error)
        isLoading = false
    }
}

private func parseError(_ error: Error) -> String {
    if let apiError = error as? APIError {
        switch apiError {
        case .invalidURL:
            return "Invalid server URL"
        case .invalidRequest:
            return "Invalid request"
        case .serverError(let message):
            return "Server error: \(message)"
        case .networkError:
            return "Network connection error"
        case .decodingError:
            return "Failed to process server response"
        case .unauthorized:
            return "Unauthorized: Invalid credentials"
        case .notFound:
            return "Resource not found"
        case .unknown:
            return "Unknown error occurred"
        }
    }
    return error.localizedDescription
}
```

## Step 3: Update Lessons Service

Create methods to fetch lessons from backend:

```swift
// In FirebaseService.swift, add:

func fetchLessonsFromAPI() async throws -> [Lesson] {
    let lessons: [Lesson] = try await APIClient.shared.request("/lessons")
    return lessons
}

func fetchLessonDetail(id: String) async throws -> Lesson {
    let lesson: Lesson = try await APIClient.shared.request("/lessons/\(id)")
    return lesson
}

func saveUserProgress(_ progress: UserProgress, lessonId: String) async throws {
    let progressData = ["status": progress.status, "progress_percentage": progress.progressPercentage]
    try await APIClient.shared.requestWithoutResponse(
        "/progress",
        method: .post,
        body: progressData
    )
}

func fetchUserProgress(lessonId: String) async throws -> UserProgress {
    let progress: UserProgress = try await APIClient.shared.request("/progress/lesson/\(lessonId)")
    return progress
}
```

## Step 4: Update Preferences Service

Add methods to fetch and update preferences:

```swift
// Add to AuthenticationManager or create PreferencesService

func fetchUserPreferences() async throws -> UserPreferences {
    let prefs: UserPreferences = try await APIClient.shared.request(
        "/preferences",
        token: getCurrentToken()
    )
    return prefs
}

func updatePreferences(_ preferences: UserPreferences) async throws {
    try await APIClient.shared.requestWithoutResponse(
        "/preferences/batch-update",
        method: .post,
        body: preferences,
        token: getCurrentToken()
    )
}

func updateNotificationTime(_ time: String) async throws {
    let body = ["time": time]
    try await APIClient.shared.requestWithoutResponse(
        "/preferences/daily-time",
        method: .post,
        body: body,
        token: getCurrentToken()
    )
}

private func getCurrentToken() -> String? {
    // Get from user defaults or Firebase
    return UserDefaults.standard.string(forKey: "authToken")
}
```

## Step 5: Update Views to Use New Services

### LoginView.swift

```swift
class LoginViewModel: ObservableObject {
    // ... existing code ...

    func signIn() async {
        isLoading = true
        errorMessage = nil

        validateEmail()

        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill in all fields"
            isLoading = false
            return
        }

        guard emailError == nil else {
            isLoading = false
            return
        }

        // Use API client for login
        do {
            let request = AuthRequest(email: email, password: password, displayName: nil)
            let response: AuthResponse = try await APIClient.shared.request(
                "/auth/login",
                method: .post,
                body: request
            )

            // Also authenticate with Firebase
            await authManager.signIn(email: email, password: password)

            isLoading = false
        } catch {
            errorMessage = "Login failed: \(error.localizedDescription)"
            isLoading = false
        }
    }
}
```

### LessonsView (or wherever lessons are fetched)

```swift
@StateObject private var viewModel = LessonsViewModel()

class LessonsViewModel: ObservableObject {
    @Published var lessons: [Lesson] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared
    private let firebaseService = FirebaseService.shared

    func loadLessons() async {
        isLoading = true
        errorMessage = nil

        do {
            // Try API first, fall back to Firebase
            lessons = try await apiClient.request("/lessons")
            print("✓ Loaded \(lessons.count) lessons from API")
        } catch {
            errorMessage = "Failed to load lessons: \(error.localizedDescription)"
            isLoading = false
        }
    }

    func markLessonComplete(_ lessonId: String) async {
        do {
            try await apiClient.requestWithoutResponse(
                "/progress/complete/\(lessonId)",
                method: .post
            )
            print("✓ Lesson marked as complete")
        } catch {
            errorMessage = "Failed to save progress: \(error.localizedDescription)"
        }
    }
}
```

## Step 6: Update Configuration for Different Environments

Modify APIClient.swift to support multiple environments:

```swift
// In APIClient.swift, update baseURL:

enum Environment {
    case development
    case staging
    case production

    var baseURL: String {
        switch self {
        case .development:
            return "http://localhost:3000/api"
        case .staging:
            return "https://staging-api.biblical-lessons.com/api"
        case .production:
            return "https://api.biblical-lessons.com/api"
        }
    }
}

class APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let environment: Environment = .development
    #else
    private let environment: Environment = .production
    #endif

    var baseURL: String {
        return environment.baseURL
    }
}
```

## Step 7: Test Integration

### 1. Start Node.js Backend

```bash
cd backend/nodejs
npm run dev

# Should show:
# Server running on http://localhost:3000
```

### 2. Update iOS App

In `APIClient.swift`, ensure baseURL points to your backend:
```swift
let baseURL = "http://localhost:3000/api"
```

### 3. Run iOS App

```bash
# In Xcode
# Select simulator or device
# Cmd + R to build and run
```

### 4. Test Flow

1. **Register**
   - Open app
   - Go to Sign Up
   - Enter: test@example.com / SecurePass123! / Test User
   - Should register and show success

2. **Login**
   - Go back to Sign In
   - Enter same credentials
   - Should login and show lessons

3. **View Lessons**
   - Should see list of 14 lessons
   - Tap on lesson to see details

4. **Update Preferences**
   - Go to Profile
   - Tap "Notification Preferences"
   - Change settings
   - Tap Save
   - Should sync to backend

## Debugging

### Check Network Requests

Enable network debugging in Xcode:
1. Product → Scheme → Edit Scheme
2. Run → Arguments → Pass: `-com.apple.CoreData.ConcurrencyDebug 1`

### Log API Calls

Add logging to APIClient:

```swift
func request<T: Decodable>(...) async throws -> T {
    print("🔵 API Request: \(method.rawValue) \(url.path)")

    do {
        let result = try await performRequest(...)
        print("✅ API Response: \(T.self)")
        return result
    } catch {
        print("❌ API Error: \(error)")
        throw error
    }
}
```

### Verify Backend is Running

```bash
# Test from iOS Simulator
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2024-11-17T..."}
```

## Common Issues

### "Network connection refused"

- Node.js server not running: `npm run dev`
- Wrong port: Check APIClient baseURL
- Firewall: Allow localhost:3000

### "Invalid JSON response"

- Backend not returning valid JSON
- Check server.js response format
- Enable logging in APIClient

### "Unauthorized (401)"

- Token not being sent
- Token expired
- Check authentication headers in APIClient

### "CORS error"

- Make sure Node.js has CORS enabled
- Check ALLOWED_ORIGINS in server.js
- Add `http://localhost:3000` to origins

## Production Deployment

When ready to deploy:

1. **Update baseURL**
   - Change from `localhost` to production domain
   - Use HTTPS: `https://api.example.com`

2. **Update Firebase**
   - Use production Firebase project
   - Set up proper security rules

3. **Environment Variables**
   - Use production secrets
   - Set JWT_SECRET to strong value
   - Configure CORS properly

4. **SSL/HTTPS**
   - All API calls must use HTTPS
   - iOS requires secure connections

## Next Steps

1. ✅ Create APIClient.swift
2. ✅ Update AuthenticationManager.swift
3. ✅ Update FirebaseService.swift
4. ✅ Start Node.js backend
5. ✅ Test registration/login flow
6. ✅ Test lessons loading
7. ✅ Test preferences updating
8. → Deploy to production

---

**Last Updated:** November 2024
**Version:** 1.0.0
