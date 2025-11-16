import Foundation
import FirebaseMessaging

// MARK: - Push Notification Manager
@MainActor
class PushNotificationManager: NSObject, ObservableObject {
    static let shared = PushNotificationManager()

    @Published var lastNotification: [String: Any]?
    @Published var isNotificationPermissionGranted = false
    @Published var fcmToken: String?

    private let firebaseService = FirebaseService.shared
    private var notificationHistory: [[String: Any]] = []

    // MARK: - Initialization

    override init() {
        super.init()
        checkNotificationPermission()
        observeFCMToken()
    }

    // MARK: - Permission Management

    private func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.isNotificationPermissionGranted = (settings.authorizationStatus == .authorized)
            }
        }
    }

    func requestNotificationPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])

            DispatchQueue.main.async {
                self.isNotificationPermissionGranted = granted
            }

            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
                print("✓ Notification permission granted")
            }

            return granted
        } catch {
            print("✗ Error requesting notification permission: \(error.localizedDescription)")
            return false
        }
    }

    // MARK: - FCM Token Management

    private func observeFCMToken() {
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("FCMToken"),
            object: nil,
            queue: .main
        ) { notification in
            if let token = notification.userInfo?["token"] as? String {
                self.fcmToken = token
                print("✓ FCM Token updated: \(String(token.prefix(20)))...")
            }
        }
    }

    func saveFCMToken(_ token: String, for userId: String) async {
        do {
            let networkService = NetworkService()
            let response = try await networkService.request(
                endpoint: "/api/notifications/save-token",
                method: "POST",
                body: ["userId": userId, "token": token]
            )

            print("✓ FCM Token saved to backend for user: \(userId)")
        } catch {
            print("✗ Error saving FCM token: \(error.localizedDescription)")
        }
    }

    func removeFCMToken(_ token: String, for userId: String) async {
        do {
            let networkService = NetworkService()
            let _ = try await networkService.request(
                endpoint: "/api/notifications/remove-token",
                method: "POST",
                body: ["userId": userId, "token": token]
            )

            print("✓ FCM Token removed from backend")
        } catch {
            print("✗ Error removing FCM token: \(error.localizedDescription)")
        }
    }

    // MARK: - Notification Logging

    func logReceivedNotification(_ userInfo: [String: Any]) {
        let notification: [String: Any] = [
            "timestamp": Date(),
            "data": userInfo
        ]

        notificationHistory.append(notification)

        // Keep only last 50 notifications
        if notificationHistory.count > 50 {
            notificationHistory.removeFirst()
        }

        DispatchQueue.main.async {
            self.lastNotification = userInfo
        }
    }

    // MARK: - Notification Handling

    func handleLessonNotification(_ lessonId: String) {
        print("📖 Handling lesson notification: \(lessonId)")

        // TODO: Navigate to lesson detail view
        // This would typically be done by updating a navigation state

        logNotificationAction(type: "lesson", lessonId: lessonId)
    }

    func handleNotificationType(_ type: String, data: [String: Any]) {
        print("🔔 Handling notification type: \(type)")

        switch type {
        case "welcome":
            handleWelcomeNotification()
        case "daily-lesson":
            handleDailyLessonNotification(data: data)
        case "announcement":
            handleAnnouncementNotification(data: data)
        case "reminder":
            handleReminderNotification(data: data)
        default:
            print("⚠️  Unknown notification type: \(type)")
        }

        logNotificationAction(type: type)
    }

    // MARK: - Specific Notification Handlers

    private func handleWelcomeNotification() {
        print("👋 Welcome notification handled")
        // TODO: Show welcome screen or toast
    }

    private func handleDailyLessonNotification(data: [String: Any]) {
        if let lessonId = data["lessonId"] as? String {
            print("📚 Daily lesson notification: \(lessonId)")
            handleLessonNotification(lessonId)
        }
    }

    private func handleAnnouncementNotification(data: [String: Any]) {
        print("📣 Announcement notification handled")
        // TODO: Show announcement banner or modal
    }

    private func handleReminderNotification(data: [String: Any]) {
        if let lessonId = data["lessonId"] as? String {
            print("⏰ Reminder notification: \(lessonId)")
            handleLessonNotification(lessonId)
        }
    }

    // MARK: - Analytics

    private func logNotificationAction(type: String, lessonId: String = "") {
        // Log to backend for analytics
        Task {
            do {
                let networkService = NetworkService()
                let body: [String: Any] = [
                    "action": "notification_interaction",
                    "type": type,
                    "lessonId": lessonId,
                    "timestamp": ISO8601DateFormatter().string(from: Date())
                ]

                let _ = try await networkService.request(
                    endpoint: "/api/analytics/log",
                    method: "POST",
                    body: body
                )
            } catch {
                // Silently fail - don't interrupt user experience
                print("⚠️  Failed to log notification action: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Notification History

    func getNotificationHistory() -> [[String: Any]] {
        return notificationHistory
    }

    func clearNotificationHistory() {
        notificationHistory.removeAll()
    }

    // MARK: - Subscription Management

    func subscribeToTopic(_ topic: String) async {
        do {
            guard let token = fcmToken else {
                print("⚠️  No FCM token available to subscribe")
                return
            }

            let networkService = NetworkService()
            let _ = try await networkService.request(
                endpoint: "/api/notifications/subscribe",
                method: "POST",
                body: ["tokens": [token], "topic": topic]
            )

            print("✓ Subscribed to topic: \(topic)")
        } catch {
            print("✗ Error subscribing to topic: \(error.localizedDescription)")
        }
    }

    func unsubscribeFromTopic(_ topic: String) async {
        do {
            guard let token = fcmToken else {
                print("⚠️  No FCM token available to unsubscribe")
                return
            }

            let networkService = NetworkService()
            let _ = try await networkService.request(
                endpoint: "/api/notifications/unsubscribe",
                method: "POST",
                body: ["tokens": [token], "topic": topic]
            )

            print("✓ Unsubscribed from topic: \(topic)")
        } catch {
            print("✗ Error unsubscribing from topic: \(error.localizedDescription)")
        }
    }

    // MARK: - Default Topic Subscriptions

    func subscribeToDefaultTopics() async {
        await subscribeToTopic("lessons")
        await subscribeToTopic("announcements")
        print("✓ Subscribed to default topics")
    }
}

// MARK: - Network Service for Notifications
// (This would typically be in a separate NetworkService file)
class NetworkService {
    func request(endpoint: String, method: String = "GET", body: [String: Any]? = nil) async throws -> [String: Any] {
        let baseURL = "http://localhost:3000" // TODO: Use environment configuration
        guard let url = URL(string: baseURL + endpoint) else {
            throw NSError(domain: "InvalidURL", code: -1)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NSError(domain: "HTTPError", code: -1)
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
        return json
    }
}
