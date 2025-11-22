import XCTest
@testable import BibleApp

class PushNotificationManagerTests: XCTestCase {
    var notificationManager: PushNotificationManager!

    override func setUp() {
        super.setUp()
        notificationManager = PushNotificationManager()
    }

    override func tearDown() {
        notificationManager = nil
        super.tearDown()
    }

    func testRequestUserNotificationPermission() {
        let expectation = XCTestExpectation(description: "Request notification permission")

        notificationManager.requestUserNotificationPermission { granted in
            XCTAssertTrue(granted)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testRegisterForRemoteNotifications() {
        let expectation = XCTestExpectation(description: "Register for remote notifications")

        notificationManager.registerForRemoteNotifications {
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testSaveFCMToken() {
        let token = "mock-fcm-token-12345"
        let expectation = XCTestExpectation(description: "Save FCM token")

        notificationManager.saveFCMToken(token) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testGetFCMToken() {
        let mockToken = "mock-fcm-token"
        notificationManager.saveFCMToken(mockToken) { _ in }

        let token = notificationManager.getFCMToken()
        XCTAssertEqual(token, mockToken)
    }

    func testRemoveFCMToken() {
        let expectation = XCTestExpectation(description: "Remove FCM token")

        notificationManager.saveFCMToken("test-token") { _ in }
        notificationManager.removeFCMToken { success in
            XCTAssertTrue(success)
            let token = self.notificationManager.getFCMToken()
            XCTAssertNil(token)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testHandleForegroundNotification() {
        let expectation = XCTestExpectation(description: "Handle foreground notification")

        let mockNotification: [AnyHashable: Any] = [
            "aps": [
                "alert": [
                    "title": "New Lesson",
                    "body": "Check out today's lesson"
                ]
            ],
            "lessonId": "lesson-123"
        ]

        notificationManager.handleForegroundNotification(mockNotification) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testHandleBackgroundNotification() {
        let expectation = XCTestExpectation(description: "Handle background notification")

        let mockNotification: [AnyHashable: Any] = [
            "aps": [
                "alert": "New Update"
            ],
            "type": "update"
        ]

        notificationManager.handleBackgroundNotification(mockNotification) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testSubscribeToTopic() {
        let expectation = XCTestExpectation(description: "Subscribe to topic")

        notificationManager.subscribeTo(topic: "daily-lessons") { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testUnsubscribeFromTopic() {
        let expectation = XCTestExpectation(description: "Unsubscribe from topic")

        notificationManager.subscribeTo(topic: "daily-lessons") { _ in
            self.notificationManager.unsubscribeFrom(topic: "daily-lessons") { success in
                XCTAssertTrue(success)
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testExtractLessonIDFromNotification() {
        let mockNotification: [AnyHashable: Any] = [
            "lessonId": "lesson-123"
        ]

        let lessonID = notificationManager.extractLessonID(from: mockNotification)
        XCTAssertEqual(lessonID, "lesson-123")
    }

    func testExtractTitleFromNotification() {
        let mockNotification: [AnyHashable: Any] = [
            "aps": [
                "alert": [
                    "title": "New Lesson Available"
                ]
            ]
        ]

        let title = notificationManager.extractTitle(from: mockNotification)
        XCTAssertEqual(title, "New Lesson Available")
    }

    func testHandleInvalidNotificationData() {
        let expectation = XCTestExpectation(description: "Handle invalid notification")

        let invalidNotification: [AnyHashable: Any] = [:]

        notificationManager.handleForegroundNotification(invalidNotification) { success in
            // Should handle gracefully
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testNotificationWithDeepLink() {
        let expectation = XCTestExpectation(description: "Handle notification with deep link")

        let mockNotification: [AnyHashable: Any] = [
            "aps": [
                "alert": "New Lesson"
            ],
            "deepLink": "bibleapp://lessons/lesson-123"
        ]

        notificationManager.handleDeepLink(from: mockNotification) { success, link in
            XCTAssertTrue(success)
            XCTAssertEqual(link, "bibleapp://lessons/lesson-123")
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testUnauthorizedNotificationPermission() {
        let expectation = XCTestExpectation(description: "Handle denied permission")

        notificationManager.requestUserNotificationPermission { granted in
            // This might be false if permission was denied
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }
}
