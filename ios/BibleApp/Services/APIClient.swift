import Foundation

// MARK: - API Error Types
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError(String)
    case networkError(String)
    case serverError(statusCode: Int, message: String)
    case unauthorized
    case notFound
    case validationError(String)
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .decodingError(let message):
            return "Failed to decode response: \(message)"
        case .networkError(let message):
            return "Network error: \(message)"
        case .serverError(let statusCode, let message):
            return "Server error (\(statusCode)): \(message)"
        case .unauthorized:
            return "Unauthorized. Please login again."
        case .notFound:
            return "Resource not found"
        case .validationError(let message):
            return "Validation error: \(message)"
        case .unknown(let message):
            return "An unexpected error occurred: \(message)"
        }
    }
}

// MARK: - API Response Types
struct APIResponse<T: Decodable>: Decodable {
    let data: T?
    let error: String?
    let code: String?
}

struct ErrorResponse: Decodable {
    let error: String?
    let code: String?
    let message: String?
    let details: [String: String]?
}

// MARK: - API Client
@MainActor
class APIClient: NSObject, ObservableObject {
    static let shared = APIClient()

    @Published var isAuthenticated = false
    @Published var currentToken: String?
    @Published var refreshToken: String?

    private let baseURL: String
    private let session: URLSession
    private let keychainService = KeychainService.shared
    private let decoder = JSONDecoder()

    override init() {
        // Use localhost for simulator, or your actual backend URL for device
        #if targetEnvironment(simulator)
        self.baseURL = "http://localhost:3000"
        #else
        self.baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "http://localhost:3000"
        #endif

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        config.waitsForConnectivity = true

        self.session = URLSession(configuration: config)

        super.init()

        // Setup JSON decoder
        decoder.dateDecodingStrategy = .iso8601

        // Load stored tokens
        loadStoredTokens()
    }

    // MARK: - Token Management

    private func loadStoredTokens() {
        if let token = keychainService.retrieve(key: "authToken") {
            self.currentToken = token
            self.isAuthenticated = true
        }
        if let refreshToken = keychainService.retrieve(key: "refreshToken") {
            self.refreshToken = refreshToken
        }
    }

    private func saveTokens(_ token: String, refreshToken: String?) {
        keychainService.save(key: "authToken", value: token)
        self.currentToken = token
        self.isAuthenticated = true

        if let refreshToken = refreshToken {
            keychainService.save(key: "refreshToken", value: refreshToken)
            self.refreshToken = refreshToken
        }
    }

    func clearTokens() {
        keychainService.delete(key: "authToken")
        keychainService.delete(key: "refreshToken")
        self.currentToken = nil
        self.refreshToken = nil
        self.isAuthenticated = false
    }

    // MARK: - Request Building

    private func buildRequest(
        method: String,
        endpoint: String,
        body: Encodable? = nil
    ) throws -> URLRequest {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Add authorization header if token exists
        if let token = currentToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add request body if provided
        if let body = body {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            request.httpBody = try encoder.encode(body)
        }

        return request
    }

    private func handleResponse<T: Decodable>(
        data: Data,
        response: URLResponse
    ) throws -> T {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error.localizedDescription)
            }

        case 400:
            if let errorResponse = try? decoder.decode(ErrorResponse.self, from: data) {
                throw APIError.validationError(errorResponse.message ?? errorResponse.error ?? "Bad request")
            }
            throw APIError.validationError("Bad request")

        case 401:
            clearTokens()
            throw APIError.unauthorized

        case 404:
            throw APIError.notFound

        case 500...599:
            if let errorResponse = try? decoder.decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(statusCode: httpResponse.statusCode, message: errorResponse.message ?? errorResponse.error ?? "Server error")
            }
            throw APIError.serverError(statusCode: httpResponse.statusCode, message: "Server error")

        default:
            throw APIError.unknown("HTTP \(httpResponse.statusCode)")
        }
    }

    // MARK: - Generic Request Method

    private func request<T: Decodable>(
        method: String,
        endpoint: String,
        body: Encodable? = nil
    ) async throws -> T {
        let request = try buildRequest(method: method, endpoint: endpoint, body: body)

        do {
            let (data, response) = try await session.data(for: request)
            return try handleResponse(data: data, response: response)
        } catch let error as APIError {
            throw error
        } catch let error as URLError {
            throw APIError.networkError(error.localizedDescription)
        } catch {
            throw APIError.unknown(error.localizedDescription)
        }
    }

    // MARK: - Authentication Endpoints

    /// Register a new user
    func registerUser(
        email: String,
        password: String,
        displayName: String
    ) async throws -> AuthResponse {
        let request = RegistrationRequest(email: email, password: password, displayName: displayName)
        let response: AuthResponse = try await self.request(
            method: "POST",
            endpoint: "/api/auth/register",
            body: request
        )
        saveTokens(response.token, refreshToken: response.refreshToken)
        return response
    }

    /// Login user
    func loginUser(email: String, password: String) async throws -> AuthResponse {
        let request = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await self.request(
            method: "POST",
            endpoint: "/api/auth/login",
            body: request
        )
        saveTokens(response.token, refreshToken: response.refreshToken)
        return response
    }

    /// Get current user info
    func getCurrentUser(userId: String) async throws -> User {
        return try await request(method: "GET", endpoint: "/api/auth/user/\(userId)")
    }

    /// Send password reset email
    func forgotPassword(email: String) async throws -> [String: String] {
        struct ForgotPasswordRequest: Encodable {
            let email: String
        }
        let request = ForgotPasswordRequest(email: email)
        return try await self.request(
            method: "POST",
            endpoint: "/api/auth/forgot-password",
            body: request
        )
    }

    /// Reset password with current password
    func resetPassword(
        userId: String,
        currentPassword: String,
        newPassword: String
    ) async throws -> [String: String] {
        struct ResetPasswordRequest: Encodable {
            let userId: String
            let currentPassword: String
            let newPassword: String
        }
        let request = ResetPasswordRequest(
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
        )
        return try await self.request(
            method: "POST",
            endpoint: "/api/auth/reset-password",
            body: request
        )
    }

    /// Update user email
    func updateEmail(userId: String, newEmail: String) async throws -> [String: String] {
        struct UpdateEmailRequest: Encodable {
            let userId: String
            let newEmail: String
        }
        let request = UpdateEmailRequest(userId: userId, newEmail: newEmail)
        return try await self.request(
            method: "POST",
            endpoint: "/api/auth/update-email",
            body: request
        )
    }

    // MARK: - Lessons Endpoints

    /// Get all lessons
    func getLessons() async throws -> [Lesson] {
        return try await request(method: "GET", endpoint: "/api/lessons")
    }

    /// Get single lesson by ID
    func getLesson(id: String) async throws -> Lesson {
        return try await request(method: "GET", endpoint: "/api/lessons/\(id)")
    }

    /// Get lessons by category
    func getLessonsByCategory(category: LessonCategory) async throws -> [Lesson] {
        return try await request(
            method: "GET",
            endpoint: "/api/lessons/category/\(category.rawValue.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        )
    }

    // MARK: - Preferences Endpoints

    /// Get user preferences
    func getUserPreferences(userId: String) async throws -> UserPreferences {
        struct PreferencesResponse: Decodable {
            let success: Bool
            let preferences: UserPreferences
        }
        let response: PreferencesResponse = try await request(
            method: "GET",
            endpoint: "/api/preferences?userId=\(userId)"
        )
        return response.preferences
    }

    /// Update a single preference
    func updatePreference(
        userId: String,
        preference: String,
        value: Any
    ) async throws {
        struct UpdatePreferenceRequest: Encodable {
            let userId: String
            let preference: String
            let value: AnyCodable

            init(userId: String, preference: String, value: Any) {
                self.userId = userId
                self.preference = preference
                self.value = AnyCodable(value)
            }
        }

        let request = UpdatePreferenceRequest(userId: userId, preference: preference, value: value)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/preferences/update",
            body: request
        )
    }

    /// Update notification type preferences
    func updateNotificationType(
        userId: String,
        type: String,
        enabled: Bool
    ) async throws {
        struct UpdateNotificationTypeRequest: Encodable {
            let userId: String
            let type: String
            let enabled: Bool
        }
        let request = UpdateNotificationTypeRequest(userId: userId, type: type, enabled: enabled)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/preferences/notification-type",
            body: request
        )
    }

    /// Update preferred lesson categories
    func updatePreferredCategories(
        userId: String,
        categories: [LessonCategory]
    ) async throws {
        struct UpdateCategoriesRequest: Encodable {
            let userId: String
            let categories: [String]

            init(userId: String, categories: [LessonCategory]) {
                self.userId = userId
                self.categories = categories.map { $0.rawValue }
            }
        }
        let request = UpdateCategoriesRequest(userId: userId, categories: categories)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/preferences/categories",
            body: request
        )
    }

    /// Update daily reminder time
    func updateDailyReminderTime(userId: String, time: String) async throws {
        struct UpdateTimeRequest: Encodable {
            let userId: String
            let time: String
        }
        let request = UpdateTimeRequest(userId: userId, time: time)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/preferences/daily-time",
            body: request
        )
    }

    /// Batch update multiple preferences
    func batchUpdatePreferences(userId: String, updates: [String: Any]) async throws {
        struct BatchUpdateRequest: Encodable {
            let userId: String
            let updates: [String: AnyCodable]

            init(userId: String, updates: [String: Any]) {
                self.userId = userId
                self.updates = updates.mapValues { AnyCodable($0) }
            }
        }
        let request = BatchUpdateRequest(userId: userId, updates: updates)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/preferences/batch-update",
            body: request
        )
    }

    // MARK: - Notifications Endpoints

    /// Save FCM token for push notifications
    func saveFCMToken(userId: String, token: String) async throws {
        struct SaveTokenRequest: Encodable {
            let userId: String
            let token: String
        }
        let request = SaveTokenRequest(userId: userId, token: token)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/notifications/save-token",
            body: request
        )
    }

    /// Remove FCM token
    func removeFCMToken(userId: String, token: String) async throws {
        struct RemoveTokenRequest: Encodable {
            let userId: String
            let token: String
        }
        let request = RemoveTokenRequest(userId: userId, token: token)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/notifications/remove-token",
            body: request
        )
    }

    /// Subscribe tokens to a topic
    func subscribeToTopic(tokens: [String], topic: String) async throws {
        struct SubscribeRequest: Encodable {
            let tokens: [String]
            let topic: String
        }
        let request = SubscribeRequest(tokens: tokens, topic: topic)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/notifications/subscribe",
            body: request
        )
    }

    /// Unsubscribe tokens from a topic
    func unsubscribeFromTopic(tokens: [String], topic: String) async throws {
        struct UnsubscribeRequest: Encodable {
            let tokens: [String]
            let topic: String
        }
        let request = UnsubscribeRequest(tokens: tokens, topic: topic)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/notifications/unsubscribe",
            body: request
        )
    }

    /// Send notification to a specific user
    func sendNotificationToUser(
        userId: String,
        title: String,
        body: String,
        data: [String: String]? = nil
    ) async throws {
        struct SendUserNotificationRequest: Encodable {
            let userId: String
            let title: String
            let body: String
            let data: [String: String]?
        }
        let request = SendUserNotificationRequest(userId: userId, title: title, body: body, data: data)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/notifications/send-user",
            body: request
        )
    }

    // MARK: - Scheduler Endpoints

    /// Get scheduler status
    func getSchedulerStatus() async throws -> [String: Any] {
        struct StatusResponse: Decodable {
            let success: Bool
            let status: [String: AnyCodable]
        }
        let response: StatusResponse = try await request(method: "GET", endpoint: "/api/scheduler/status")
        return response.status.mapValues { $0.value as Any }
    }

    /// Get notification history
    func getNotificationHistory(userId: String? = nil) async throws -> [[String: Any]] {
        struct HistoryResponse: Decodable {
            let success: Bool
            let history: [[String: AnyCodable]]
        }
        let endpoint = userId.map { "/api/scheduler/history?userId=\($0)" } ?? "/api/scheduler/history"
        let response: HistoryResponse = try await request(method: "GET", endpoint: endpoint)
        return response.history.map { dict in
            dict.mapValues { $0.value as Any }
        }
    }

    /// Update user's preferred notification time
    func updateNotificationTime(userId: String, time: String) async throws {
        struct UpdateTimeRequest: Encodable {
            let userId: String
            let time: String
        }
        let request = UpdateTimeRequest(userId: userId, time: time)
        let _: [String: String] = try await self.request(
            method: "POST",
            endpoint: "/api/scheduler/update-time",
            body: request
        )
    }

    // MARK: - Health Check

    /// Check API server health
    func checkHealth() async throws -> [String: String] {
        return try await request(method: "GET", endpoint: "/health")
    }
}

// MARK: - Keychain Service
class KeychainService {
    static let shared = KeychainService()

    func save(key: String, value: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func retrieve(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)

        if let data = result as? Data, let string = String(data: data, encoding: .utf8) {
            return string
        }
        return nil
    }

    func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - AnyCodable Helper (for handling any Codable type)
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self.value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            self.value = bool
        } else if let int = try? container.decode(Int.self) {
            self.value = int
        } else if let double = try? container.decode(Double.self) {
            self.value = double
        } else if let string = try? container.decode(String.self) {
            self.value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            self.value = dictionary.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode value")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(
                codingPath: encoder.codingPath,
                debugDescription: "Cannot encode value"
            ))
        }
    }
}
