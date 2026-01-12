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
                #if DEBUG
                print("✓ Notification permission granted")
                #endif
            }

            return granted
        } catch {
            #if DEBUG
            print("✗ Error requesting notification permission: \(error.localizedDescription)")
            #endif
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
                    #if DEBUG
                    print("✓ FCM Token updated: \(String(token.prefix(20)))...")
                    #endif
                }
            }
        }
    }

    func saveFCMToken(_ token: String, for userId: String) async {
        do {
            try await apiClient.saveFCMToken(userId: userId, token: token)
            #if DEBUG
            print("✓ FCM Token saved to backend for user: \(userId)")
            #endif
        } catch let error as APIError {
            #if DEBUG
            print("✗ Error saving FCM token: \(error.localizedDescription)")
            #endif
        } catch {
            #if DEBUG
            print("✗ Error saving FCM token: \(error.localizedDescription)")
            #endif
        }
    }

    func removeFCMToken(_ token: String, for userId: String) async {
        do {
            try await apiClient.removeFCMToken(userId: userId, token: token)
            #if DEBUG
            print("✓ FCM Token removed from backend")
            #endif
        } catch let error as APIError {
            #if DEBUG
            print("✗ Error removing FCM token: \(error.localizedDescription)")
            #endif
        } catch {
            #if DEBUG
            print("✗ Error removing FCM token: \(error.localizedDescription)")
            #endif
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
        #if DEBUG
        print("📖 Handling lesson notification: \(lessonId)")
        #endif

        // TODO: Navigate to lesson detail view
        // This would typically be done by updating a navigation state

        logNotificationAction(type: "lesson", lessonId: lessonId)
    }

    func handleNotificationType(_ type: String, data: [AnyHashable: Any]) {
        #if DEBUG
        print("🔔 Handling notification type: \(type)")
        #endif

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
            #if DEBUG
            print("⚠️  Unknown notification type: \(type)")
            #endif
        }

        logNotificationAction(type: type)
    }

    // MARK: - Specific Notification Handlers

    private func handleWelcomeNotification() {
        #if DEBUG
        print("👋 Welcome notification handled")
        #endif
        // TODO: Show welcome screen or toast
    }

    private func handleDailyLessonNotification(data: [String: Any]) {
        if let lessonId = data["lessonId"] as? String {
            #if DEBUG
            print("📚 Daily lesson notification: \(lessonId)")
            #endif
            handleLessonNotification(lessonId)
        }
    }

    private func handleAnnouncementNotification(data: [String: Any]) {
        #if DEBUG
        print("📣 Announcement notification handled")
        #endif
        // TODO: Show announcement banner or modal
    }

    private func handleReminderNotification(data: [String: Any]) {
        if let lessonId = data["lessonId"] as? String {
            #if DEBUG
            print("⏰ Reminder notification: \(lessonId)")
            #endif
            handleLessonNotification(lessonId)
        }
    }

    // MARK: - Analytics

    private func logNotificationAction(type: String, lessonId: String = "") {
        #if DEBUG
        // Analytics logging - using print for now, can integrate with analytics service later
        print("📊 Analytics: \(type) action for lesson: \(lessonId) at \(Date())")
        #endif
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
                #if DEBUG
                print("⚠️  No FCM token available to subscribe")
                #endif
                return
            }

            try await apiClient.subscribeToTopic(tokens: [token], topic: topic)
            #if DEBUG
            print("✓ Subscribed to topic: \(topic)")
            #endif
        } catch let error as APIError {
            #if DEBUG
            print("✗ Error subscribing to topic: \(error.localizedDescription)")
            #endif
        } catch {
            #if DEBUG
            print("✗ Error subscribing to topic: \(error.localizedDescription)")
            #endif
        }
    }

    func unsubscribeFromTopic(_ topic: String) async {
        do {
            guard let token = fcmToken else {
                #if DEBUG
                print("⚠️  No FCM token available to unsubscribe")
                #endif
                return
            }

            try await apiClient.unsubscribeFromTopic(tokens: [token], topic: topic)
            #if DEBUG
            print("✓ Unsubscribed from topic: \(topic)")
            #endif
        } catch let error as APIError {
            #if DEBUG
            print("✗ Error unsubscribing from topic: \(error.localizedDescription)")
            #endif
        } catch {
            #if DEBUG
            print("✗ Error unsubscribing from topic: \(error.localizedDescription)")
            #endif
        }
    }

    // MARK: - Default Topic Subscriptions

    func subscribeToDefaultTopics() async {
        await subscribeToTopic("lessons")
        await subscribeToTopic("announcements")
        #if DEBUG
        print("✓ Subscribed to default topics")
        #endif
    }
}

// Note: Networking is now handled by APIClient service
