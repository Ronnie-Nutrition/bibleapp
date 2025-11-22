import XCTest
@testable import BibleApp

class LessonsViewModelTests: XCTestCase {
    var viewModel: LessonsViewModel!
    var mockAPIClient: MockAPIClient!

    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        viewModel = LessonsViewModel(apiClient: mockAPIClient)
    }

    override func tearDown() {
        viewModel = nil
        mockAPIClient = nil
        super.tearDown()
    }

    func testInitialState() {
        XCTAssertTrue(viewModel.lessons.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }

    func testFetchLessonsSuccess() {
        let expectation = XCTestExpectation(description: "Fetch lessons")

        let mockLessons = [
            Lesson(id: "1", title: "Lesson 1", category: "Leadership", content: "Content 1"),
            Lesson(id: "2", title: "Lesson 2", category: "Integrity", content: "Content 2")
        ]

        mockAPIClient.mockLessons = mockLessons

        viewModel.fetchLessons()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertEqual(self.viewModel.lessons.count, 2)
            XCTAssertEqual(self.viewModel.lessons.first?.title, "Lesson 1")
            XCTAssertFalse(self.viewModel.isLoading)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testFetchLessonsFailure() {
        let expectation = XCTestExpectation(description: "Fetch lessons fails")

        mockAPIClient.shouldFail = true

        viewModel.fetchLessons()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            XCTAssertTrue(self.viewModel.lessons.isEmpty)
            XCTAssertNotNil(self.viewModel.errorMessage)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testSearchLessons() {
        let expectation = XCTestExpectation(description: "Search lessons")

        let mockLessons = [
            Lesson(id: "1", title: "Leadership Lesson", category: "Leadership", content: "Content 1"),
            Lesson(id: "2", title: "Another Leadership", category: "Leadership", content: "Content 2"),
            Lesson(id: "3", title: "Integrity Lesson", category: "Integrity", content: "Content 3")
        ]

        mockAPIClient.mockLessons = mockLessons
        viewModel.fetchLessons()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.viewModel.searchText = "Leadership"
            let filtered = self.viewModel.filteredLessons

            XCTAssertEqual(filtered.count, 2)
            XCTAssertTrue(filtered.allSatisfy { $0.title.contains("Leadership") })
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testFilterLessonsByCategory() {
        let expectation = XCTestExpectation(description: "Filter by category")

        let mockLessons = [
            Lesson(id: "1", title: "Lesson 1", category: "Leadership", content: "Content 1"),
            Lesson(id: "2", title: "Lesson 2", category: "Integrity", content: "Content 2"),
            Lesson(id: "3", title: "Lesson 3", category: "Leadership", content: "Content 3")
        ]

        mockAPIClient.mockLessons = mockLessons
        viewModel.fetchLessons()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.viewModel.selectedCategory = "Leadership"
            let filtered = self.viewModel.filteredLessons

            XCTAssertEqual(filtered.count, 2)
            XCTAssertTrue(filtered.allSatisfy { $0.category == "Leadership" })
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testToggleFavorite() {
        let mockLesson = Lesson(
            id: "1",
            title: "Test Lesson",
            category: "Leadership",
            content: "Content"
        )

        let expectation = XCTestExpectation(description: "Toggle favorite")

        viewModel.toggleFavorite(for: mockLesson) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testMarkLessonComplete() {
        let mockLesson = Lesson(
            id: "1",
            title: "Test Lesson",
            category: "Leadership",
            content: "Content"
        )

        let expectation = XCTestExpectation(description: "Mark complete")

        viewModel.markLessonComplete(for: mockLesson) { success in
            XCTAssertTrue(success)
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 5.0)
    }

    func testEmptySearchResults() {
        let mockLessons = [
            Lesson(id: "1", title: "Leadership Lesson", category: "Leadership", content: "Content 1")
        ]

        mockAPIClient.mockLessons = mockLessons
        viewModel.fetchLessons()

        viewModel.searchText = "NonexistentLesson"
        let filtered = viewModel.filteredLessons

        XCTAssertTrue(filtered.isEmpty)
    }

    func testSortingLessons() {
        let mockLessons = [
            Lesson(id: "3", title: "C Lesson", category: "Leadership", content: "Content"),
            Lesson(id: "1", title: "A Lesson", category: "Leadership", content: "Content"),
            Lesson(id: "2", title: "B Lesson", category: "Leadership", content: "Content")
        ]

        mockAPIClient.mockLessons = mockLessons

        viewModel.fetchLessons()
        viewModel.sortBy = .alphabetical

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let sorted = self.viewModel.filteredLessons
            XCTAssertEqual(sorted.first?.title, "A Lesson")
            XCTAssertEqual(sorted.last?.title, "C Lesson")
        }
    }
}

// MARK: - Mock Objects

class MockAPIClient: APIClient {
    var mockLessons: [Lesson] = []
    var shouldFail = false

    override func fetchLessons(completion: @escaping (Result<[Lesson], Error>) -> Void) {
        if shouldFail {
            completion(.failure(NSError(domain: "MockError", code: 1)))
        } else {
            completion(.success(mockLessons))
        }
    }
}
