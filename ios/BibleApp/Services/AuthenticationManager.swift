import Foundation
import Firebase
import FirebaseAuth

// MARK: - Authentication Manager
@MainActor
class AuthenticationManager: NSObject, ObservableObject {
    static let shared = AuthenticationManager()

    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let firebaseService = FirebaseService.shared
    private var authStateHandle: AuthStateDidChangeListenerHandle?

    override init() {
        super.init()
        setupAuthStateListener()
    }

    // MARK: - Setup Auth State Listener

    private func setupAuthStateListener() {
        authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                if user != nil {
                    await self?.loadCurrentUser()
                } else {
                    self?.currentUser = nil
                    self?.isAuthenticated = false
                }
            }
        }
    }

    // MARK: - Authentication Methods

    func signUp(email: String, password: String, displayName: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let user = try await firebaseService.signUp(
                email: email,
                password: password,
                displayName: displayName
            )
            self.currentUser = user
            self.isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let user = try await firebaseService.signIn(email: email, password: password)
            self.currentUser = user
            self.isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    func signOut() {
        do {
            try firebaseService.signOut()
            currentUser = nil
            isAuthenticated = false
            errorMessage = nil
        } catch {
            errorMessage = "Failed to sign out: \(error.localizedDescription)"
        }
    }

    func loadCurrentUser() async {
        if let user = firebaseService.getCurrentUser() {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }

    deinit {
        if let handle = authStateHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }
}
