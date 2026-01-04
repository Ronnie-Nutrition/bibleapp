import SwiftUI
import Firebase
import FirebaseMessaging
import UserNotifications

@main
struct BibleAppApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var notificationManager = PushNotificationManager.shared
    @StateObject private var subscriptionManager = SubscriptionManager.shared

    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isAuthenticated {
                    MainTabView()
                        .environmentObject(subscriptionManager)
                } else {
                    LoginView()
                }
            }
            .onAppear {
                // Configure auth manager after Firebase is initialized in AppDelegate
                authManager.configureIfNeeded()
            }
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()

        // Configure Messaging delegate for FCM
        Messaging.messaging().delegate = self

        // Configure notification center
        UNUserNotificationCenter.current().delegate = self

        // Request notification permissions
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                    print("✓ Notification permission granted")
                } else if let error = error {
                    print("✗ Notification permission error: \(error.localizedDescription)")
                }
            }
        }

        return true
    }

    // MARK: - Remote Notification Registration

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        print("✓ APNs Device Token registered")
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("✗ Failed to register for remote notifications: \(error.localizedDescription)")
    }
}

// MARK: - Firebase Messaging Delegate
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken = fcmToken else { return }

        print("✓ FCM Token received: \(String(fcmToken.prefix(20)))...")

        // Send token to backend
        Task {
            let authManager = AuthenticationManager.shared
            if let userId = authManager.currentUser?.id {
                await PushNotificationManager.shared.saveFCMToken(fcmToken, for: userId)
            }
        }

        // Post notification for observers
        let dataDict: [String: String] = ["token": fcmToken]
        NotificationCenter.default.post(
            name: NSNotification.Name("FCMToken"),
            object: nil,
            userInfo: dataDict
        )
    }
}

// MARK: - UNUserNotificationCenter Delegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    // Handle notification while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo

        print("📬 Notification received while app in foreground:")
        print("  Title: \(notification.request.content.title)")
        print("  Body: \(notification.request.content.body)")

        // Log the notification
        PushNotificationManager.shared.logReceivedNotification(userInfo)

        // Show notification banner even while in foreground
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        print("📲 Notification tapped:")
        print("  Title: \(response.notification.request.content.title)")
        print("  Body: \(response.notification.request.content.body)")

        // Handle notification actions based on type
        if let lessonId = userInfo["lessonId"] as? String {
            print("  Lesson ID: \(lessonId)")
            // TODO: Navigate to lesson detail
            PushNotificationManager.shared.handleLessonNotification(lessonId)
        }

        if let type = userInfo["type"] as? String {
            print("  Type: \(type)")
            PushNotificationManager.shared.handleNotificationType(type, data: userInfo)
        }

        completionHandler()
    }
}
