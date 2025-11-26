import Foundation
import UIKit
import FirebaseMessaging

// MARK: - Push Notification Manager
@MainActor
class PushNotificationManager: NSObject, ObservableObject {
    static let shared = PushNotificationManager()

    @Published var lastNotification: [String: Any]?
    @Published var isNotificationPermissionGranted = false
    @Published var fcmToken: String?

    private let apiClient = APIClient.shared
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
        ) { [weak self] notification in
            if let token = notification.userInfo?["token"] as? String {
                Task { @MainActor in
                    self?.fcmToken = token
                    print("✓ FCM Token updated: \(String(token.prefix(20)))...")
                }
            }
        }
    }

    func saveFCMToken(_ token: String, for userId: String) async {
        do {
            try await apiClient.saveFCMToken(userId: userId, token: token)
            print("✓ FCM Token saved to backend for user: \(userId)")
        } catch let error as APIError {
            print("✗ Error saving FCM token: \(error.localizedDescription)")
        } catch {
            print("✗ Error saving FCM token: \(error.localizedDescription)")
        }
    }

    func removeFCMToken(_ token: String, for userId: String) async {
        do {
            try await apiClient.removeFCMToken(userId: userId, token: token)
            print("✓ FCM Token removed from backend")
        } catch let error as APIError {
            print("✗ Error removing FCM token: \(error.localizedDescription)")
        } catch {
            print("✗ Error removing FCM token: \(error.localizedDescription)")
        }
    }

    // MARK: - Notification Logging

    func logReceivedNotification(_ userInfo: [AnyHashable: Any]) {
        let stringKeyUserInfo = userInfo.reduce(into: [String: Any]()) { result, item in
            if let key = item.key as? String {
                result[key] = item.value
            }
        }

        let notification: [String: Any] = [
            "timestamp": Date(),
            "data": stringKeyUserInfo
        ]

        notificationHistory.append(notification)

        // Keep only last 50 notifications
        if notificationHistory.count > 50 {
            notificationHistory.removeFirst()
        }

        DispatchQueue.main.async {
            self.lastNotification = stringKeyUserInfo
        }
    }

    // MARK: - Notification Handling

    func handleLessonNotification(_ lessonId: String) {
        print("📖 Handling lesson notification: \(lessonId)")

        // TODO: Navigate to lesson detail view
        // This would typically be done by updating a navigation state

        logNotificationAction(type: "lesson", lessonId: lessonId)
    }

    func handleNotificationType(_ type: String, data: [AnyHashable: Any]) {
        print("🔔 Handling notification type: \(type)")

        let stringKeyData = data.reduce(into: [String: Any]()) { result, item in
            if let key = item.key as? String {
                result[key] = item.value
            }
        }

        switch type {
        case "welcome":
            handleWelcomeNotification()
        case "daily-lesson":
            handleDailyLessonNotification(data: stringKeyData)
        case "announcement":
            handleAnnouncementNotification(data: stringKeyData)
        case "reminder":
            handleReminderNotification(data: stringKeyData)
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
        // Analytics logging - using print for now, can integrate with analytics service later
        print("📊 Analytics: \(type) action for lesson: \(lessonId) at \(Date())")
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

            try await apiClient.subscribeToTopic(tokens: [token], topic: topic)
            print("✓ Subscribed to topic: \(topic)")
        } catch let error as APIError {
            print("✗ Error subscribing to topic: \(error.localizedDescription)")
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

            try await apiClient.unsubscribeFromTopic(tokens: [token], topic: topic)
            print("✓ Unsubscribed from topic: \(topic)")
        } catch let error as APIError {
            print("✗ Error unsubscribing from topic: \(error.localizedDescription)")
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

// Note: Networking is now handled by APIClient service
