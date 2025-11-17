import Foundation
import Firebase
import FirebaseAuth
import FirebaseFirestore
import FirebaseMessaging

// MARK: - Firebase Service Protocol
protocol FirebaseServiceProtocol {
    func signUp(email: String, password: String, displayName: String) async throws -> User
    func signIn(email: String, password: String) async throws -> User
    func signOut() throws
    func getCurrentUser() -> User?
    func fetchLesson(id: String) async throws -> Lesson
    func fetchLessons(limit: Int) async throws -> [Lesson]
    func saveLessonProgress(lessonId: String, progress: UserProgress) async throws
    func fetchUserProgress() async throws -> [UserProgress]
    func updateUserPreferences(_ preferences: UserPreferences) async throws
    func subscribeToTopic(_ topic: String) throws
    func unsubscribeFromTopic(_ topic: String) throws
}

// MARK: - Firebase Service Implementation
class FirebaseService: NSObject, FirebaseServiceProtocol {
    static let shared = FirebaseService()

    private let db = Firestore.firestore()
    private let auth = Auth.auth()

    // MARK: - Authentication Methods

    func signUp(email: String, password: String, displayName: String) async throws -> User {
        let authResult = try await auth.createUser(withEmail: email, password: password)
        let user = User(
            id: authResult.user.uid,
            email: email,
            displayName: displayName,
            profileImageURL: nil,
            createdAt: Date(),
            updatedAt: Date(),
            preferences: UserPreferences(),
            stats: UserStats()
        )

        // Save user to Firestore
        try await db.collection("users").document(user.id).setData(from: user)

        return user
    }

    func signIn(email: String, password: String) async throws -> User {
        let authResult = try await auth.signIn(withEmail: email, password: password)
        let user = try await fetchFirestoreUser(id: authResult.user.uid)
        return user
    }

    func signOut() throws {
        try auth.signOut()
    }

    func getCurrentUser() -> User? {
        guard let currentAuthUser = auth.currentUser else { return nil }

        // This should ideally fetch from cache or local storage
        // For now, returning minimal user info
        return User(
            id: currentAuthUser.uid,
            email: currentAuthUser.email ?? "",
            displayName: currentAuthUser.displayName,
            profileImageURL: currentAuthUser.photoURL?.absoluteString,
            createdAt: Date(),
            updatedAt: Date(),
            preferences: UserPreferences(),
            stats: nil
        )
    }

    // MARK: - Lesson Methods

    func fetchLesson(id: String) async throws -> Lesson {
        let document = try await db.collection("lessons").document(id).getDocument()
        let lesson = try document.data(as: Lesson.self)
        return lesson
    }

    func fetchLessons(limit: Int = 20) async throws -> [Lesson] {
        let snapshot = try await db.collection("lessons")
            .limit(to: limit)
            .order(by: "createdAt", descending: true)
            .getDocuments()

        let lessons = try snapshot.documents.compactMap { document in
            try document.data(as: Lesson.self)
        }
        return lessons
    }

    func fetchLessonsByCategory(_ category: LessonCategory, limit: Int = 10) async throws -> [Lesson] {
        let snapshot = try await db.collection("lessons")
            .whereField("category", isEqualTo: category.rawValue)
            .limit(to: limit)
            .order(by: "createdAt", descending: true)
            .getDocuments()

        let lessons = try snapshot.documents.compactMap { document in
            try document.data(as: Lesson.self)
        }
        return lessons
    }

    // MARK: - User Progress Methods

    func saveLessonProgress(lessonId: String, progress: UserProgress) async throws {
        guard let userId = auth.currentUser?.uid else {
            throw FirebaseError.notAuthenticated
        }

        try await db.collection("users")
            .document(userId)
            .collection("progress")
            .document(lessonId)
            .setData(from: progress)
    }

    func fetchUserProgress() async throws -> [UserProgress] {
        guard let userId = auth.currentUser?.uid else {
            throw FirebaseError.notAuthenticated
        }

        let snapshot = try await db.collection("users")
            .document(userId)
            .collection("progress")
            .getDocuments()

        let progress = try snapshot.documents.compactMap { document in
            try document.data(as: UserProgress.self)
        }
        return progress
    }

    func markLessonAsCompleted(lessonId: String) async throws {
        guard let userId = auth.currentUser?.uid else {
            throw FirebaseError.notAuthenticated
        }

        var progress = try await fetchLessonProgress(lessonId: lessonId)
        progress.completedAt = Date()

        try await db.collection("users")
            .document(userId)
            .collection("progress")
            .document(lessonId)
            .setData(from: progress)
    }

    private func fetchLessonProgress(lessonId: String) async throws -> UserProgress {
        guard let userId = auth.currentUser?.uid else {
            throw FirebaseError.notAuthenticated
        }

        let document = try await db.collection("users")
            .document(userId)
            .collection("progress")
            .document(lessonId)
            .getDocument()

        return try document.data(as: UserProgress.self)
    }

    // MARK: - User Preferences

    func updateUserPreferences(_ preferences: UserPreferences) async throws {
        guard let userId = auth.currentUser?.uid else {
            throw FirebaseError.notAuthenticated
        }

        try await db.collection("users").document(userId).updateData([
            "preferences": try Firestore.Encoder().encode(preferences)
        ])
    }

    // MARK: - Push Notifications

    func subscribeToTopic(_ topic: String) throws {
        Messaging.messaging().subscribe(toTopic: topic)
    }

    func unsubscribeFromTopic(_ topic: String) throws {
        Messaging.messaging().unsubscribe(fromTopic: topic)
    }

    // MARK: - User Methods

    func fetchUser(id: String) async throws -> User {
        return try await fetchFirestoreUser(id: id)
    }

    // MARK: - Private Methods

    private func fetchFirestoreUser(id: String) async throws -> User {
        let document = try await db.collection("users").document(id).getDocument()
        let user = try document.data(as: User.self)
        return user
    }
}

// MARK: - Firebase Errors
enum FirebaseError: LocalizedError {
    case notAuthenticated
    case userNotFound
    case invalidCredentials
    case networkError(String)
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "User is not authenticated"
        case .userNotFound:
            return "User not found"
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError(let message):
            return "Network error: \(message)"
        case .unknown(let message):
            return "Unknown error: \(message)"
        }
    }
}
