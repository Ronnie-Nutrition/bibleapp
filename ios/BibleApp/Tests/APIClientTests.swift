import XCTest
@testable import BibleApp

class APIClientTests: XCTestCase {
    var apiClient: APIClient!
    var mockURLSession: URLSession!

    override func setUp() {
        super.setUp()
        apiClient = APIClient()

        // Configure URL session for testing
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        mockURLSession = URLSession(configuration: config)
    }

    override func tearDown() {
        apiClient = nil
        mockURLSession = nil
        super.tearDown()
    }

    func testFetchLessonsEndpoint() {
        let expectation = XCTestExpectation(description: "Fetch lessons")

        let mockResponse = """
        [
            {
                "id": "1",
                "title": "Test Lesson",
                "category": "Leadership",
                "content": "Test content"
            }
        ]
        """

        MockURLProtocol.mockData = mockResponse.data(using: .utf8)

        apiClient.fetchLessons { result in
            switch result {
            case .success(let lessons):
                XCTAssertGreater(lessons.count, 0)
                XCTAssertEqual(lessons.first?.title, "Test Lesson")
                expectation.fulfill()
            case .failure(let error):
                XCTFail("Should succeed: \(error)")
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testAuthenticationTokenManagement() {
        let token = "test-jwt-token-12345"
        apiClient.setAuthToken(token)

        let savedToken = apiClient.getAuthToken()
        XCTAssertEqual(savedToken, token)
    }

    func testTokenRefresh() {
        let expectation = XCTestExpectation(description: "Token refresh")

        let mockResponse = """
        {
            "token": "new-jwt-token",
            "expiresIn": 3600
        }
        """

        MockURLProtocol.mockData = mockResponse.data(using: .utf8)

        apiClient.refreshToken { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testErrorHandling() {
        let expectation = XCTestExpectation(description: "Error handling")

        MockURLProtocol.mockError = NSError(domain: "NetworkError", code: 1)

        apiClient.fetchLessons { result in
            switch result {
            case .success:
                XCTFail("Should fail")
            case .failure:
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testRetryLogic() {
        let expectation = XCTestExpectation(description: "Retry logic")

        var attemptCount = 0
        MockURLProtocol.mockResponseHandler = {
            attemptCount += 1
            if attemptCount < 3 {
                return (nil, NSError(domain: "NetworkError", code: 1))
            }
            let response = HTTPURLResponse(
                url: URL(string: "https://api.example.com/test")!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )
            let data = "{}".data(using: .utf8)
            return (response, nil)
        }

        apiClient.fetchLessons { result in
            switch result {
            case .success:
                XCTAssertEqual(attemptCount, 3)
                expectation.fulfill()
            case .failure:
                XCTFail("Should succeed after retries")
            }
        }

        wait(for: [expectation], timeout: 10.0)
    }

    func testNetworkTimeout() {
        let expectation = XCTestExpectation(description: "Network timeout")

        MockURLProtocol.mockDelay = 10.0

        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [MockURLProtocol.self]
        config.timeoutIntervalForRequest = 1.0
        let timeoutSession = URLSession(configuration: config)

        apiClient.fetchLessons { result in
            switch result {
            case .success:
                XCTFail("Should timeout")
            case .failure:
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 15.0)
    }

    func testInvalidJSONResponse() {
        let expectation = XCTestExpectation(description: "Invalid JSON handling")

        MockURLProtocol.mockData = "invalid json {[".data(using: .utf8)

        apiClient.fetchLessons { result in
            switch result {
            case .success:
                XCTFail("Should fail with invalid JSON")
            case .failure:
                expectation.fulfill()
            }
        }

        wait(for: [expectation], timeout: 5.0)
    }
}

// MARK: - Mock URL Protocol

class MockURLProtocol: URLProtocol {
    static var mockData: Data?
    static var mockError: Error?
    static var mockDelay: TimeInterval = 0
    static var mockResponseHandler: (() -> (HTTPURLResponse?, Error?))?

    override class func canInit(with request: URLRequest) -> Bool {
        return true
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }

    override func startLoading() {
        if let delay = type(of: self).mockDelay, delay > 0 {
            DispatchQueue.global().asyncAfter(deadline: .now() + delay) {
                self.simulateResponse()
            }
        } else {
            simulateResponse()
        }
    }

    private func simulateResponse() {
        if let handler = type(of: self).mockResponseHandler {
            let (response, error) = handler()
            if let error = error {
                client?.urlProtocol(self, didFailWithError: error)
                return
            }
            if let response = response {
                client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            }
        } else if let error = type(of: self).mockError {
            client?.urlProtocol(self, didFailWithError: error)
        } else if let data = type(of: self).mockData {
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: nil,
                headerFields: nil
            )!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
        }

        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}
