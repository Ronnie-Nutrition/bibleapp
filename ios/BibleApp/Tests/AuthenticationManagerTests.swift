import XCTest
@testable import BibleApp

class AuthenticationManagerTests: XCTestCase {
    var authManager: AuthenticationManager!

    override func setUp() {
        super.setUp()
        authManager = AuthenticationManager()
    }

    override func tearDown() {
        authManager = nil
        super.tearDown()
    }

    func testInitialState() {
        XCTAssertNil(authManager.currentUser)
        XCTAssertFalse(authManager.isLoggedIn)
    }

    func testLoginSuccess() {
        // This would require mocking Firebase
        // Example structure for testing
        let expectation = XCTestExpectation(description: "Login completes")

        authManager.login(email: "test@example.com", password: "password123") { result in
            switch result {
            case .success(let user):
                XCTAssertNotNil(user)
                XCTAssertEqual(user.email, "test@example.com")
                expectation.fulfill()
            case .failure(let error):
                XCTFail("Login should succeed: \(error)")
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testLogout() {
        let expectation = XCTestExpectation(description: "Logout completes")

        authManager.logout { result in
            switch result {
            case .success:
                XCTAssertFalse(self.authManager.isLoggedIn)
                expectation.fulfill()
            case .failure(let error):
                XCTFail("Logout should succeed: \(error)")
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testRegisterNewUser() {
        let expectation = XCTestExpectation(description: "Registration completes")

        authManager.register(
            email: "newuser@example.com",
            password: "password123",
            displayName: "New User"
        ) { result in
            switch result {
            case .success(let user):
                XCTAssertNotNil(user)
                XCTAssertEqual(user.email, "newuser@example.com")
                expectation.fulfill()
            case .failure(let error):
                XCTFail("Registration should succeed: \(error)")
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testInvalidEmailFormat() {
        let expectation = XCTestExpectation(description: "Invalid email rejected")

        authManager.login(email: "invalid-email", password: "password123") { result in
            switch result {
            case .success:
                XCTFail("Should not succeed with invalid email")
            case .failure:
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testEmptyPassword() {
        let expectation = XCTestExpectation(description: "Empty password rejected")

        authManager.login(email: "test@example.com", password: "") { result in
            switch result {
            case .success:
                XCTFail("Should not succeed with empty password")
            case .failure:
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }
}
